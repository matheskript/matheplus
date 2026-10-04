/* ============================================================
   Analysis-Bereich: Sinusfunktion
   f(x) = a · sin(b · (x − c)) + d
   Aufgabe: Ein Zielgraph ist vorgegeben – a, b, c, d mit Plus/Minus
   so einstellen, bis der eigene Graph passt. c wahlweise als
   Vielfaches von π. Dazu Amplitude, Periode, Verschiebungen,
   Ableitung und Nullstellen der eingestellten Funktion.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";

const kz = (v) => String(Math.round(v * 100) / 100).replace(".", ",").replace("-", "−");
function sinusHilfe(z) {
  const A = Math.abs(z.a), hoch = z.d + A, tief = z.d - A, p = 2 / z.b;   // Periode in Vielfachen von π
  const pText = p === 1 ? "π" : `${kz(p)}π`;
  const cText = z.cPi ? `${kz(z.c)}π` : kz(z.c);
  return {
    id: `sin-${z.a}-${z.b}-${z.c}-${z.d}-${z.cPi}`,
    aufgabe: "Sinusfunktion Amplitude Periode",
    hilfen: {
      verstehen: [
        "Welche vier Eigenschaften des goldenen Graphen kannst du ablesen: Höhe der Mittellinie, Ausschlag nach oben und unten, Länge einer Periode, Verschiebung nach links oder rechts?",
        "In f(x) = a · sin(b · (x − c)) + d: d ist die Mittellinie, |a| die Amplitude, p = 2π / b die Periode, c die Verschiebung in x-Richtung.",
        "Stell die Parameter in dieser Reihenfolge ein: d, a, b und zuletzt c.",
      ],
      ansatz: [
        "Wo liegen der höchste und der tiefste Punkt des goldenen Graphen?",
        "Mittellinie d = (Hochwert + Tiefwert) / 2, Amplitude |a| = (Hochwert − Tiefwert) / 2.",
        `Der goldene Graph pendelt zwischen y = ${kz(tief)} und y = ${kz(hoch)} – also d = ${kz(z.d)} und |a| = ${kz(A)}.`,
      ],
      regel: [
        "Wie hängen b und die Periodenlänge zusammen?",
        "p = 2π / |b|. Je größer b, desto schneller schwingt der Graph.",
        `Eine volle Schwingung des goldenen Graphen ist ${pText} lang. Daraus folgt b = 2π / p.`,
      ],
      umformen: [
        "Wo startet eine „normale“ Sinusschwingung – auf der Mittellinie und steigend?",
        "Suche eine Stelle, an der der goldene Graph die Mittellinie steigend schneidet: Dort liegt c (bei a > 0). Bei a < 0 schneidet er dort fallend.",
        `Eine passende Verschiebung ist c = ${cText}${z.cPi ? " (Schalter π einschalten)" : ""}. Andere c, die sich um ganze Perioden unterscheiden, passen ebenfalls.`,
      ],
      pruefen: [
        "Liegt dein blauer Graph überall auf dem goldenen – auch weiter links und rechts?",
        "Mehrere Parametersätze können denselben Graphen ergeben: zum Beispiel ein negatives a zusammen mit einer um eine halbe Periode verschobenen Stelle c.",
        "Kontrolliere zuletzt einen Hochpunkt: Stimmen x- und y-Wert?",
      ],
    },
    regeln: [
      { gruppe: "Sinusfunktion", name: "Allgemeine Sinusfunktion", f: "f(x) = a \\cdot \\sin(b \\cdot (x - c)) + d", kurz: "|a| Amplitude · d Mittellinie · c Verschiebung nach rechts", beispiel: "$f(x) = 2\\sin(x - 1) + 3$ pendelt zwischen 1 und 5." },
      { gruppe: "Sinusfunktion", name: "Periode", f: "p = \\frac{2\\pi}{|b|}", kurz: "je größer b, desto kürzer die Periode", beispiel: "$\\sin(2x)$ hat die Periode $\\pi$." },
    ],
    grundlage: null,
    loesung: `Zum Beispiel a = ${kz(z.a)}, b = ${kz(z.b)}, c = ${cText}, d = ${kz(z.d)}.`,
  };
}

const FARBE = { a: "#A50044", b: "#004D98", c: "#C99A00", d: "#1F8A5B" };
const PI = Math.PI;

/* ---------- Zahlen ---------- */

const zahl = (v) => String(Math.round(v * 1000) / 1000).replace(".", ",").replace("-", "−");
const ggT = (x, y) => (y ? ggT(y, x % y) : Math.abs(x));

// q als Bruch mit kleinem Nenner (bis 12), sonst null
function alsBruch(q) {
  for (let n = 1; n <= 12; n++) {
    const z = Math.round(q * n);
    if (Math.abs(q * n - z) < 1e-9) { const g = ggT(Math.abs(z), n) || 1; return { z: z / g, n: n / g }; }
  }
  return null;
}

function Bruch({ oben, unten }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1.1, margin: "0 1px", fontSize: "0.9em" }}>
      <span style={{ padding: "0 2px 1px" }}>{oben}</span>
      <span style={{ borderTop: "1.5px solid currentColor", padding: "1px 2px 0", alignSelf: "stretch", textAlign: "center" }}>{unten}</span>
    </span>
  );
}

// Vielfaches von π schön darstellen: 0,5 → π/2 (übereinander)
function PiZahl({ q, betrag }) {
  const v = betrag ? Math.abs(q) : q;
  if (Math.abs(v) < 1e-12) return <span>0</span>;
  const b = alsBruch(v);
  if (!b) return <span>{zahl(v)}π</span>;
  const vz = b.z < 0 ? "−" : "";
  const zaehler = `${Math.abs(b.z) === 1 ? "" : Math.abs(b.z)}π`;
  if (b.n === 1) return <span>{vz}{zaehler}</span>;
  return <span style={{ whiteSpace: "nowrap" }}>{vz}<Bruch oben={zaehler} unten={b.n} /></span>;
}

// Zahl oder Vielfaches von π
const Wert = ({ v, pi, betrag }) => (pi ? <PiZahl q={v} betrag={betrag} /> : <span>{zahl(betrag ? Math.abs(v) : v)}</span>);

/* ---------- Funktionsterm ---------- */

function Term({ p, gross }) {
  const { a, b, c, d, cPi } = p;
  const farb = (f, inhalt) => <span style={{ color: f }}>{inhalt}</span>;
  const aTeil = a === 1 ? null : a === -1 ? farb(FARBE.a, "−") : <>{farb(FARBE.a, zahl(a))}<span> · </span></>;
  const kl = b !== 1;
  const innen = c === 0
    ? <>x</>
    : <>{kl && "("}x {c > 0 ? "−" : "+"} {farb(FARBE.c, <Wert v={c} pi={cPi} betrag />)}{kl && ")"}</>;
  const bTeil = b === 1 ? innen : <>{farb(FARBE.b, zahl(b))}<span> · </span>{innen}</>;
  const dTeil = d === 0 ? null : <> {d > 0 ? "+" : "−"} {farb(FARBE.d, zahl(Math.abs(d)))}</>;
  return (
    <span style={{ fontSize: gross ? "clamp(17px, 5vw, 24px)" : "inherit", fontWeight: 800, color: C.tinte, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
      f(x) = {aTeil}sin({bTeil}){dTeil}
    </span>
  );
}

const wert = (p, x) => p.a * Math.sin(p.b * (x - p.c * (p.cPi ? PI : 1))) + p.d;
const passt = (p, q) => {
  for (let i = 0; i <= 240; i++) { const x = -2 * PI + (4 * PI * i) / 240; if (Math.abs(wert(p, x) - wert(q, x)) > 0.02) return false; }
  return true;
};

/* ---------- Zufallsaufgabe ---------- */

const wahl = (liste) => liste[Math.floor(Math.random() * liste.length)];
function neueAufgabe() {
  let z;
  do {
    const cPi = Math.random() < 0.6;
    z = {
      a: wahl([-3, -2, -1.5, -1, -0.5, 0.5, 1.5, 2, 2.5, 3]),
      b: wahl([0.5, 1, 1, 2, 2, 3, 1.5]),
      cPi,
      c: cPi ? wahl([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]) : wahl([-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]),
      d: wahl([-2, -1.5, -1, -0.5, 0, 0, 0.5, 1, 1.5, 2]),
    };
  } while (passt(z, { a: 1, b: 1, c: 0, d: 0, cPi: false }));
  return z;
}

/* ---------- Nullstellen ---------- */

function nullstellen(p) {
  const { a, b, d } = p;
  const cW = p.c * (p.cPi ? PI : 1);
  const r = -d / a;
  const liste = [];
  if (Math.abs(r) > 1 + 1e-12) return { art: "keine", liste };
  const s = Math.asin(Math.max(-1, Math.min(1, r)));
  const basis = Math.abs(Math.abs(r) - 1) < 1e-12 ? [s] : [s, PI - s];
  for (const w of basis) for (let kk = -20; kk <= 20; kk++) {
    const x = cW + (w + 2 * kk * PI) / b;
    if (x >= -2 * PI - 1e-9 && x <= 2 * PI + 1e-9 && !liste.some((y) => Math.abs(y - x) < 1e-7)) liste.push(x);
  }
  liste.sort((u, v) => u - v);
  return { art: d === 0 ? "d0" : Math.abs(Math.abs(r) - 1) < 1e-12 ? "beruehrung" : "zwei", liste, s, r };
}

// x-Wert als Vielfaches von π, wenn es schön aufgeht, sonst dezimal
function XWert({ x }) {
  const q = x / PI, b = alsBruch(q);
  if (b && b.n <= 12) return <PiZahl q={q} />;
  return <span>≈ {zahl(Math.round(x * 100) / 100)}</span>;
}

/* ---------- Schaubild ---------- */

function Schaubild({ ziel, p, zeigeAbl, ns }) {
  const W = 360, H = 250, rl = 26, rr = 10, ro = 12, ru = 22;
  const yMax = Math.max(2.5, ...[ziel, p].filter(Boolean).map((q) => Math.abs(q.a) + Math.abs(q.d))) + 0.5;
  const X = (x) => rl + ((x + 2 * PI) / (4 * PI)) * (W - rl - rr);
  const Y = (y) => ro + ((yMax - y) / (2 * yMax)) * (H - ro - ru);
  const pfad = (f) => {
    let dd = "";
    for (let i = 0; i <= 480; i++) {
      const x = -2 * PI + (4 * PI * i) / 480;
      const y = Math.max(-yMax * 1.5, Math.min(yMax * 1.5, f(x)));
      dd += `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`;
    }
    return dd;
  };
  const abl = (x) => p.a * p.b * Math.cos(p.b * (x - p.c * (p.cPi ? PI : 1)));
  const piTicks = [-4, -3, -2, -1, 1, 2, 3, 4];
  const yTicks = [];
  for (let y = -Math.floor(yMax); y <= Math.floor(yMax); y++) if (y !== 0) yTicks.push(y);
  const piLabel = { "-4": "−2π", "-2": "−π", 2: "π", 4: "2π" };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
      {piTicks.map((t) => <line key={`gx${t}`} x1={X((t * PI) / 2)} y1={ro} x2={X((t * PI) / 2)} y2={H - ru} stroke={C.linie} strokeWidth="1" />)}
      {yTicks.map((y) => <line key={`gy${y}`} x1={rl} y1={Y(y)} x2={W - rr} y2={Y(y)} stroke={C.linie} strokeWidth="1" />)}
      <line x1={rl} y1={Y(0)} x2={W - rr} y2={Y(0)} stroke={C.grau} strokeWidth="1.3" />
      <line x1={X(0)} y1={ro} x2={X(0)} y2={H - ru} stroke={C.grau} strokeWidth="1.3" />
      {piTicks.filter((t) => t % 2 === 0).map((t) => (
        <text key={`lx${t}`} x={X((t * PI) / 2)} y={H - 6} textAnchor="middle" fontSize="10.5" fill={C.grau}>{piLabel[t]}</text>
      ))}
      {yTicks.map((y) => <text key={`ly${y}`} x={rl - 5} y={Y(y) + 3.5} textAnchor="end" fontSize="10" fill={C.grau}>{String(y).replace("-", "−")}</text>)}
      {ziel && <path d={pfad((x) => wert(ziel, x))} stroke={C.flaggold} strokeWidth="6" strokeOpacity="0.55" fill="none" strokeLinejoin="round" />}
      {zeigeAbl && <path d={pfad(abl)} stroke={FARBE.a} strokeWidth="1.6" strokeDasharray="5 4" fill="none" />}
      <path d={pfad((x) => wert(p, x))} stroke={C.see} strokeWidth="2.4" fill="none" strokeLinejoin="round" />
      {ns.map((x, i) => <circle key={i} cx={X(x)} cy={Y(0)} r="3.6" fill={C.gruen} stroke={C.weiss} strokeWidth="1.2" />)}
      <g fontSize="11" fontWeight="700">
        {ziel && <><rect x={rl + 6} y={ro + 4} width="16" height="5" rx="2.5" fill={C.flaggold} opacity="0.7" /><text x={rl + 26} y={ro + 10} fill="#8A6D00">Ziel</text></>}
        <rect x={rl + (ziel ? 58 : 6)} y={ro + 4} width="16" height="4" rx="2" fill={C.see} /><text x={rl + (ziel ? 78 : 26)} y={ro + 10} fill={C.see}>f</text>
        {zeigeAbl && <><line x1={rl + (ziel ? 94 : 42)} y1={ro + 6} x2={rl + (ziel ? 110 : 58)} y2={ro + 6} stroke={FARBE.a} strokeWidth="2" strokeDasharray="4 3" /><text x={rl + (ziel ? 114 : 62)} y={ro + 10} fill={FARBE.a}>f′</text></>}
      </g>
    </svg>
  );
}

/* ---------- Regler: Wert groß, + und − untereinander ---------- */

function Regler({ name, farbe, children, plus, minus, extra }) {
  const knopf = { width: 34, height: 24, borderRadius: 7, border: `1.5px solid ${farbe}66`, background: `${farbe}14`,
    color: farbe, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: farbe }}>{name}</span>
      <span style={{ minHeight: 34, display: "flex", alignItems: "center", fontSize: 16, fontWeight: 800, color: farbe, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{children}</span>
      <button aria-label={`${name} erhöhen`} style={knopf} onClick={plus}>+</button>
      <button aria-label={`${name} verringern`} style={knopf} onClick={minus}>−</button>
      {extra}
    </div>
  );
}

// Mehrere Formelzeilen in gleicher Schriftgröße; die Größe passt sich der Breite an
function FormelBlock({ children, max = 24, min = 12 }) {
  const rahmen = useRef(null), innen = useRef(null);
  const [gr, setGr] = useState(max);
  useEffect(() => {
    const anpassen = () => {
      if (!rahmen.current || !innen.current) return;
      const breite = innen.current.scrollWidth * (max / parseFloat(getComputedStyle(innen.current).fontSize));
      setGr(Math.max(min, Math.min(max, Math.floor((max * rahmen.current.clientWidth / breite) * 10) / 10)));
    };
    anpassen();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(anpassen) : null;
    if (ro && rahmen.current) ro.observe(rahmen.current);
    return () => { if (ro) ro.disconnect(); };
  });
  return (
    <div ref={rahmen} style={{ minWidth: 0, overflow: "hidden" }}>
      <div ref={innen} style={{ width: "max-content", fontSize: gr, display: "flex", flexDirection: "column", gap: "0.35em" }}>{children}</div>
    </div>
  );
}

// Allgemeine Form, Parameter farbig
function Allgemein() {
  const f = (t, farbe) => <span style={{ color: farbe }}>{t}</span>;
  return (
    <span style={{ display: "inline-block", alignSelf: "flex-start", fontWeight: 800, color: C.tinte, whiteSpace: "nowrap",
      background: "#EEF1F5", border: `1px solid ${C.linie}`, borderRadius: "0.35em", padding: "0.15em 0.45em" }}>
      f(x) = {f("a", FARBE.a)} · sin({f("b", FARBE.b)} · (x − {f("c", FARBE.c)})) + {f("d", FARBE.d)}
    </span>
  );
}

/* ---------- Seite ---------- */

const START = { a: 1, b: 1, c: 0, d: 0, cPi: false };
const grenz = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v * 100) / 100));

export function Sinusfunktion() {
  const [modus, setModus] = useState("aufgabe");
  const [ziel, setZiel] = useState(() => neueAufgabe());
  const [p, setP] = useState(START);
  const [loesung, setLoesung] = useState(false);
  const [zeigeAbl, setZeigeAbl] = useState(false);
  const [geschafft, setGeschafft] = useState(0);
  const aktivesZiel = modus === "aufgabe" ? ziel : null;
  const richtig = aktivesZiel && passt(p, aktivesZiel);
  const ns = useMemo(() => nullstellen(p), [p]);
  const periodeQ = 2 / p.b; // Periode in Vielfachen von π

  const setze = (feld, v) => setP((q) => ({ ...q, [feld]: v }));
  const neu = () => { setZiel(neueAufgabe()); setP(START); setLoesung(false); if (richtig) setGeschafft((g) => g + 1); };
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const titel = { fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 };
  const cSchritt = p.cPi ? 0.25 : 0.5;
  const zeile = (t, inhalt) => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 10px", padding: "9px 0", borderBottom: `1px solid ${C.linie}` }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, minWidth: 128 }}>{t}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>{inhalt}</span>
    </div>
  );
  const ab = p.a * p.b;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Finde die Parameter
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Der goldene Graph ist vorgegeben. Stell a, b, c und d so ein, dass dein blauer Graph genau darauf liegt.
        a streckt in y-Richtung, b bestimmt die Periode p = 2π / b, c verschiebt in x-Richtung, d in y-Richtung.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: C.weiss, borderRadius: 14, padding: 5, boxShadow: "0 2px 12px rgba(15,26,51,0.06)" }}>
        {[["aufgabe", "Aufgabe lösen"], ["frei", "Frei erkunden"]].map(([id, t]) => (
          <button key={id} onClick={() => { setModus(id); setLoesung(false); }}
            style={{ flex: 1, height: 40, borderRadius: 10, border: "none", fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: modus === id ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : "transparent",
              color: modus === id ? C.weiss : C.see }}>{t}</button>
        ))}
      </div>

      {modus === "aufgabe" && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <IchHaengeFest kontext={sinusHilfe(ziel)} />
        </div>
      )}
      <div style={karte}>
        {/* links die Formeln (allgemein und eingesetzt, gleich groß), rechts die Regler */}
        <div className="sin-kopf" style={{ marginBottom: 12 }}>
          <style>{`.sin-kopf{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}
            @media (max-width:520px){.sin-kopf{grid-template-columns:minmax(0,1fr)}}`}</style>
          <FormelBlock max={24}>
            <Allgemein />
            <span style={{ paddingLeft: "calc(0.45em + 1px)" }}><Term p={p} /></span>
          </FormelBlock>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 44px)", gap: 4, justifyContent: "center", alignItems: "start" }}>
            <Regler name="a" farbe={FARBE.a} plus={() => setze("a", grenz(p.a + 0.5, -5, 5))} minus={() => setze("a", grenz(p.a - 0.5, -5, 5))}>{zahl(p.a)}</Regler>
            <Regler name="b" farbe={FARBE.b} plus={() => setze("b", grenz(p.b + 0.5, 0.5, 5))} minus={() => setze("b", grenz(p.b - 0.5, 0.5, 5))}>{zahl(p.b)}</Regler>
            <Regler name="c" farbe={FARBE.c} plus={() => setze("c", grenz(p.c + cSchritt, -4, 4))} minus={() => setze("c", grenz(p.c - cSchritt, -4, 4))}
              extra={
                <button aria-label={p.cPi ? "c als Zahl" : "c als Vielfaches von π"} title="c als Vielfaches von π"
                  onClick={() => setP((q) => ({ ...q, cPi: !q.cPi, c: !q.cPi ? Math.round(q.c * 4) / 4 : Math.round(q.c * 2) / 2 }))}
                  style={{ width: 34, height: 22, borderRadius: 7, fontSize: 14, fontWeight: 800, fontFamily: "inherit", cursor: "pointer", padding: 0,
                    border: `1.5px solid ${p.cPi ? FARBE.c : C.linie}`, background: p.cPi ? FARBE.c : C.weiss, color: p.cPi ? C.weiss : "#8A6D00" }}>π</button>
              }>
              <Wert v={p.c} pi={p.cPi} />
            </Regler>
            <Regler name="d" farbe={FARBE.d} plus={() => setze("d", grenz(p.d + 0.5, -4, 4))} minus={() => setze("d", grenz(p.d - 0.5, -4, 4))}>{zahl(p.d)}</Regler>
          </div>
        </div>

        <Schaubild ziel={aktivesZiel} p={p} zeigeAbl={zeigeAbl} ns={ns.liste} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <button onClick={() => setZeigeAbl(!zeigeAbl)}
            style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer",
              border: `1px solid ${zeigeAbl ? FARBE.a : C.linie}`, background: zeigeAbl ? `${FARBE.a}12` : C.weiss, color: FARBE.a }}>f′ einblenden</button>
          <button onClick={() => setP(START)}
            style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", border: `1px solid ${C.linie}`, background: C.weiss, color: C.see }}>↺ Zurück auf sin(x)</button>
        </div>

        {modus === "aufgabe" && (
          <div style={{ marginTop: 14 }}>
            {richtig ? (
              <div style={{ borderLeft: `4px solid ${C.smaragd}`, background: "#EAF7F0", borderRadius: "0 12px 12px 0", padding: "10px 14px", marginBottom: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.smaragd }}>Passt! Dein Graph liegt genau auf dem Ziel.</p>
              </div>
            ) : loesung ? (
              <div style={{ borderLeft: `4px solid ${C.flaggold}`, background: "#FFF9E5", borderRadius: "0 12px 12px 0", padding: "10px 14px", marginBottom: 10, overflowX: "auto" }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: "#8A6D00", marginBottom: 4 }}>Eine mögliche Lösung</p>
                <span style={{ fontSize: "clamp(12px, 3.8vw, 16px)" }}><Term p={ziel} /></span>
              </div>
            ) : null}
            <div style={{ display: "flex", gap: 8 }}>
              {!richtig && !loesung && (
                <button onClick={() => setLoesung(true)}
                  style={{ flex: 1, height: 44, borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Lösung zeigen</button>
              )}
              <button onClick={neu}
                style={{ flex: 1, height: 44, borderRadius: 999, border: "none", background: C.flaggold, color: C.seeTief, fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>🎲 Neue Aufgabe</button>
            </div>
            {geschafft > 0 && <p style={{ fontSize: 12, color: C.hellgrau, textAlign: "center", marginTop: 8 }}>Gelöst: {geschafft}</p>}
          </div>
        )}
      </div>

      <div style={{ ...karte, marginTop: 16 }}>
        <p style={titel}>Deine Funktion im Detail</p>
        {zeile("Amplitude", <>|a| = {zahl(Math.abs(p.a))}</>)}
        {zeile("Periode", <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>p = <Bruch oben="2π" unten={<span style={{ color: FARBE.b }}>{zahl(p.b)}</span>} /> = <PiZahl q={periodeQ} /></span>)}
        {zeile("Verschiebung x", <>um <span style={{ color: "#8A6D00" }}><Wert v={p.c} pi={p.cPi} /></span> {p.c === 0 ? "(keine)" : p.c > 0 ? "nach rechts" : "nach links"}</>)}
        {zeile("Verschiebung y", <>um <span style={{ color: FARBE.d }}>{zahl(p.d)}</span> {p.d === 0 ? "(keine)" : p.d > 0 ? "nach oben" : "nach unten"}</>)}
        {zeile("Wertebereich", <>[{zahl(p.d - Math.abs(p.a))}; {zahl(p.d + Math.abs(p.a))}]</>)}
        {zeile("Ableitung", <span style={{ whiteSpace: "nowrap" }}>f′(x) = {ab === 1 ? "" : ab === -1 ? "−" : `${zahl(ab)} · `}cos({p.b === 1 ? "" : `${zahl(p.b)} · `}{p.c === 0 ? "x" : <>{p.b !== 1 && "("}x {p.c > 0 ? "−" : "+"} <Wert v={p.c} pi={p.cPi} betrag />{p.b !== 1 && ")"}</>})</span>)}
        <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.5, marginTop: 6 }}>
          Kettenregel: äußere Ableitung a · cos(…) mal innere Ableitung b – also a · b = {zahl(p.a)} · {zahl(p.b)} = {zahl(ab)}.
        </p>
      </div>

      <div style={{ ...karte, marginTop: 16 }}>
        <p style={titel}>Nullstellen</p>
        <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, marginBottom: 8 }}>
          f(x) = 0 ⇔ sin(b · (x − c)) = <Bruch oben="−d" unten="a" /> = {zahl(-p.d / p.a)}
        </p>
        {ns.art === "keine" ? (
          <p style={{ fontSize: 14, color: C.signal || C.gruen, lineHeight: 1.6 }}>
            |−d / a| = {zahl(Math.abs(p.d / p.a))} &gt; 1 – der Sinus erreicht diesen Wert nie. f hat <b>keine Nullstellen</b>: Der Graph liegt komplett {p.d > 0 ? "über" : "unter"} der x-Achse.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 8 }}>
              {ns.art === "d0" && <>Wegen d = 0 liegen die Nullstellen genau eine halbe Periode auseinander: x = c + k · <Bruch oben="π" unten="b" />, k ∈ ℤ.</>}
              {ns.art === "beruehrung" && <>Der Sinus erreicht hier genau seinen Extremwert – der Graph berührt die x-Achse nur, einmal pro Periode.</>}
              {ns.art === "zwei" && <>Pro Periode gibt es zwei Lösungen: x = c + <Bruch oben={<>arcsin({zahl(ns.r)}) + 2kπ</>} unten="b" /> und x = c + <Bruch oben={<>π − arcsin({zahl(ns.r)}) + 2kπ</>} unten="b" />, k ∈ ℤ.</>}
            </p>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, marginBottom: 4 }}>Im Bereich −2π ≤ x ≤ 2π ({ns.liste.length} Stück):</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ns.liste.map((x, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 999, background: C.himmel, fontSize: 14, fontWeight: 700, color: C.tinte }}>
                  x<sub style={{ fontSize: "0.7em" }}>{i + 1}</sub> = <XWert x={x} />
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
