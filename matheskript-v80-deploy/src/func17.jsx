/* ============================================================
   Stochastik-Bereich
   - BernoulliBingo: Bernoulli-Kette mit n, p und k einstellen,
     Binomialverteilung live sehen, P(X = k), P(X ≤ k), P(X ≥ k)
     mit Rechenweg – und das Experiment simulieren („Bingo!“).
   - StochastikZentrum: Übersichtsseite
   - StochastikLogoKlein: Grafik für die Startseiten-Kachel
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";

/* ---------- Mathematik ---------- */

function binomKoeff(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}
const bin = (n, p, k) => binomKoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
const prozent = (v) => `${(v * 100).toFixed(2).replace(".", ",")} %`;
const dez = (v, st = 4) => v.toFixed(st).replace(".", ",");

/* p anzeigen: Drittel und Sechstel als Bruch (nicht endliche Dezimalzahlen), sonst als Dezimalzahl */
function pText(p) {
  for (const [z, nn] of [[1, 3], [2, 3], [1, 6], [5, 6]]) if (Math.abs(p - z / nn) < 1e-9) return `${z}/${nn}`;
  return (Math.round(p * 100) / 100).toString().replace(".", ",");
}

const FARBEN = { n: "#004D98", p: "#A50044", k: "#C99A00" };
const P_WERTE = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95];
const VORLAGEN = [
  { name: "🪙 Münze", p: 1 / 2, text: "Kopf" },
  { name: "🎲 Sechs würfeln", p: 1 / 6, text: "Sechs" },
  { name: "🎯 Treffer 1/3", p: 1 / 3, text: "Treffer" },
  { name: "🃏 Herz ziehen", p: 1 / 4, text: "Herz" },
];

/* ---------- Kopf: X ~ B(n; p) mit k, groß und farbig, + / − darunter ---------- */

// Wahrscheinlichkeit als (möglichst einfachen) Bruch mit Nenner bis 100
function alsBruch(p) {
  for (let d = 1; d <= 100; d++) {
    const z = Math.round(p * d);
    if (Math.abs(p - z / d) < 1e-9) return { z, nn: d };
  }
  return { z: Math.max(1, Math.round(p * 100)), nn: 100 };
}

function Kopf({ n, p, k, setN, setP, setK, pT, qT, bruch, setBruch }) {
  const naechstesP = (richtung) => {
    // von Brüchen wie 1/6 aus zum nächsten 5-%-Schritt
    const liste = richtung > 0 ? P_WERTE.filter((v) => v > p + 1e-9) : P_WERTE.filter((v) => v < p - 1e-9).reverse();
    return liste.length ? liste[0] : p;
  };
  const zeilen = [
    { name: "n", kurz: "Versuche", label: "Versuche", wert: `${n}`, farbe: FARBEN.n, plus: () => setN(Math.min(40, n + 1)), minus: () => setN(Math.max(1, n - 1)) },
    { name: "p", kurz: "Treffer-WKT", label: "Treffer\u00ADwahr\u00ADschein\u00ADlich\u00ADkeit", wert: <Wert t={pT} farbe={FARBEN.p} klammer={false} />, farbe: FARBEN.p, plus: () => { setBruch(null); setP(naechstesP(1)); }, minus: () => { setBruch(null); setP(naechstesP(-1)); } },
    { name: "k", kurz: "Treffer", label: "Treffer", wert: `${k}`, farbe: FARBEN.k, plus: () => setK(Math.min(n, k + 1)), minus: () => setK(Math.max(0, k - 1)) },
  ];
  // Zähler/Nenner ändern – aus einer Kommazahl wird dabei automatisch ein Bruch
  const bruchAendern = (teil, d) => {
    const b = bruch || alsBruch(p);
    let { z, nn } = b;
    if (teil === "z") z = Math.min(nn, Math.max(1, z + d));
    else nn = Math.min(100, Math.max(z, 1, nn + d));
    setBruch({ z, nn });
    setP(z / nn);
  };
  const mini = {
    width: 25, height: 26, borderRadius: 7, border: `1px solid ${FARBEN.p}55`, background: C.weiss,
    color: FARBEN.p, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  const knopf = (farbe, gr = 28) => ({
    width: gr, height: gr, flexShrink: 0, borderRadius: 8, border: `1.5px solid ${farbe}66`, background: `${farbe}14`,
    color: farbe, fontSize: 17, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  });
  const [zn, zp, zk] = zeilen;
  const Regler1 = ({ z }) => (
    <div>
      <p style={UEBERSCHRIFT}>
        {z.name === "p"
          ? <>{z.kurz} <span style={{ color: z.farbe, fontWeight: 800 }}>{z.name}</span></>
          : <><span style={{ color: z.farbe, fontWeight: 800 }}>{z.name}</span> {z.kurz}</>}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: z.name === "p" ? 4 : 3, height: z.name === "k" ? undefined : ZEILE_H }}>
        <button aria-label={`${z.name} verringern`} style={knopf(z.farbe, z.name === "p" ? 28 : 23)} onClick={z.minus}>−</button>
        <span style={{ minWidth: z.name === "p" ? 42 : 36, textAlign: "center", fontSize: "clamp(17px, 4.8vw, 22px)", fontWeight: 800, color: z.farbe, lineHeight: z.name === "p" ? undefined : 1,
          fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{z.wert}</span>
        <button aria-label={`${z.name} erhöhen`} style={knopf(z.farbe, z.name === "p" ? 28 : 23)} onClick={z.plus}>+</button>
      </div>
    </div>
  );
  return (
    <div className="bk-kopf" style={{ marginBottom: 6 }}>
      <style>{`.bk-kopf{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"regler formel";gap:12px;align-items:stretch}
        @media (max-width:560px){.bk-kopf{grid-template-columns:minmax(0,1fr);grid-template-areas:"formel" "regler";gap:12px}}`}</style>
      {/* Regler: links n (oben) und k (unten), rechts p mit Kommazahl- und Bruch-Knöpfen */}
      <div style={{ gridArea: "regler", display: "flex", justifyContent: "center", alignItems: "stretch", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, padding: "6px 5px",
          borderRadius: 12, border: `1px solid ${FARBEN.n}33`, background: `${FARBEN.n}08` }}>
          <Regler1 z={zn} />
          <Regler1 z={zk} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, padding: "6px 5px",
          borderRadius: 12, border: `1px solid ${FARBEN.p}33`, background: `${FARBEN.p}08` }}>
          <Regler1 z={zp} />
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            {[["z", "Zähler"], ["nn", "Nenner"]].map(([teil, t]) => (
              <div key={teil} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 9.5, fontWeight: 600, color: C.grau, lineHeight: 1.1, marginBottom: 2 }}>{t}</p>
                <div style={{ display: "flex", gap: 3 }}>
                  <button aria-label={`${t} verringern`} style={mini} onClick={() => bruchAendern(teil, -1)}>−</button>
                  <button aria-label={`${t} erhöhen`} style={mini} onClick={() => bruchAendern(teil, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Formel von Bernoulli oben, Kurzform X ∼ B(n; p) darunter */}
      <div style={{ gridArea: "formel", minWidth: 0, display: "flex" }}>
        <BernoulliFormel n={n} k={k} pT={pT} qT={qT} wert={bin(n, p, k)} p={p} />
      </div>
    </div>
  );
}

/* Bernoulli-Formel, farbig wie die Regler – immer einzeilig, Schriftgröße passt sich der Breite an */
// Zahl auf höchstens 5 Nachkommastellen (sehr kleine Werte: 3 gültige Ziffern); geht sie nicht auf, folgt „…“
function kurzZahl(x) {
  const F = 100000;
  if (Math.abs(x * F - Math.round(x * F)) < 1e-7) return String(Math.round(x * F) / F).replace(".", ",");
  const r = Math.abs(x) >= 0.00001 ? Math.round(x * F) / F : Number(x.toPrecision(3));
  return String(r).replace(".", ",") + "…";
}

// Gemeinsamer Stil der Überschriften im Kopf (n Versuche, k Treffer, Treffer-WKT p, Formel von Bernoulli)
const ZEILE_H = 44;   // Höhe der Wertzeile von n und p – die erste Formelzeile steht auf derselben Höhe
const UEBERSCHRIFT = { fontSize: 14, fontWeight: 700, color: C.tinte, lineHeight: 1.2, marginBottom: 4, textAlign: "center", whiteSpace: "nowrap" };

// Schmale, nicht fette Schrift für die ausgerechneten Einzelwahrscheinlichkeiten
const SCHMAL = { color: FARBEN.p, fontWeight: 400, fontFamily: "'Roboto Condensed', 'Arial Narrow', 'Helvetica Neue Condensed', sans-serif",
  fontStretch: "condensed", letterSpacing: "-0.01em" };

function BernoulliFormel({ n, k, pT, qT, wert, p }) {
  const ergebnis = kurzZahl(wert);
  const v = (t, farbe) => <span style={{ color: farbe, fontWeight: 800 }}>{t}</span>;
  const rahmen = useRef(null), innen = useRef(null);
  const [gr, setGr] = useState(14);
  useEffect(() => {
    const anpassen = () => {
      if (!rahmen.current || !innen.current) return;
      const el = innen.current;
      const platz = rahmen.current.clientWidth - 18;
      // natürliche Breite messen (ohne Verteilung über die Box), danach wieder verteilen
      el.style.width = "max-content"; el.style.justifyContent = "start";
      const breite14 = el.scrollWidth * (14 / parseFloat(getComputedStyle(el).fontSize));
      el.style.width = "100%"; el.style.justifyContent = "space-between";
      setGr(Math.max(9, Math.min(14, Math.floor((14 * platz / breite14) * 10) / 10)));
    };
    anpassen();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(anpassen) : null;
    if (ro && rahmen.current) ro.observe(rahmen.current);
    window.addEventListener("resize", anpassen);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", anpassen); };
  }, [n, k, pT]);
  return (
    <div ref={rahmen} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: C.sand, borderRadius: 12,
      padding: "6px 8px", border: `1px solid ${C.linie}`, overflow: "hidden" }}>
      <p style={UEBERSCHRIFT}>Formel von Bernoulli</p>
      <div ref={innen} style={{ alignContent: "start", display: "grid", gridTemplateColumns: "repeat(7, auto)", gridTemplateRows: `${ZEILE_H}px auto auto`, justifyContent: "space-between", columnGap: "0.18em", rowGap: "0.12em",
        alignItems: "center", justifyItems: "center", width: "100%",
        fontSize: gr, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
        {/* Zeile 1: Formel mit den eingestellten Werten */}
        <span style={{ justifySelf: "end" }}>P(X = {v(k, FARBEN.k)})</span>
        <span>=</span>
        <Binom o={n} u={k} farbeO={FARBEN.n} farbeU={FARBEN.k} />
        <span>·</span>
        <Pot basis={<Wert t={pT} farbe={FARBEN.p} />} exp={<span style={{ color: FARBEN.k }}>{k}</span>} />
        <span>·</span>
        <Pot basis={<Wert t={qT} farbe={FARBEN.p} />} exp={n - k} />
        {/* Zeile 2: jeder Faktor ausgerechnet unter seinem Term */}
        <span />
        <span>=</span>
        {v(binomKoeff(n, k), FARBEN.n)}
        <span>·</span>
        <span style={SCHMAL}>{kurzZahl(Math.pow(p, k))}</span>
        <span>·</span>
        <span style={SCHMAL}>{kurzZahl(Math.pow(1 - p, n - k))}</span>
        {/* Zeile 3: Endergebnis */}
        <span />
        <span>=</span>
        <span style={{ gridColumn: "3 / -1", justifySelf: "start", fontWeight: 800 }}>{ergebnis}</span>
      </div>
    </div>
  );
}

/* ---------- Rechenweg in Schulbuch-Schreibweise ---------- */

const KL = { fontWeight: 300, lineHeight: 1, transform: "scaleY(1.9)", display: "inline-block", margin: "0 1px" };

function Binom({ o, u, farbeO, farbeU }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
      <span style={KL}>(</span>
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1, fontSize: "0.92em" }}>
        <span style={{ color: farbeO }}>{o}</span><span style={{ color: farbeU }}>{u}</span>
      </span>
      <span style={KL}>)</span>
    </span>
  );
}

function Wert({ t, farbe, klammer = true }) {
  // "1/6" als echter Bruch (übereinander, optional in Klammern), Dezimalzahlen schlicht
  const m = /^(\d+)\/(\d+)$/.exec(t);
  if (!m) return <span style={{ color: farbe }}>{t}</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", color: farbe }}>
      {klammer && <span style={{ ...KL, color: C.tinte }}>(</span>}
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.05, fontSize: "0.85em" }}>
        <span style={{ padding: "0 2px" }}>{m[1]}</span>
        <span style={{ borderTop: `0.09em solid currentColor`, padding: "0 2px" }}>{m[2]}</span>
      </span>
      {klammer && <span style={{ ...KL, color: C.tinte }}>)</span>}
    </span>
  );
}

function Pot({ basis, exp }) {
  // Bruch-Basis (in Klammern, hoch): Exponent oben an der Klammer; Dezimalzahl: Exponent knapp über der Zeile
  const bruch = React.isValidElement(basis) && /\//.test(String(basis.props?.t || ""));
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-start", verticalAlign: "middle", lineHeight: bruch ? undefined : 1 }}>
      {basis}
      <sup style={{ fontSize: "0.68em", fontWeight: 700, marginLeft: 1, marginTop: bruch ? "0.05em" : "-0.12em", lineHeight: 1, verticalAlign: "baseline" }}>{exp}</sup>
    </span>
  );
}

function Summe({ von, bis }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1, margin: "0 2px" }}>
      <span style={{ fontSize: "0.62em" }}>{bis}</span>
      <span style={{ fontSize: "1.5em", fontWeight: 400 }}>Σ</span>
      <span style={{ fontSize: "0.62em" }}>{von}</span>
    </span>
  );
}

function Zeile({ children, stark }) {
  return (
    <div style={{ display: "flex", alignItems: "center", whiteSpace: "pre", minHeight: 44,
      fontSize: 16, fontWeight: stark ? 800 : 600, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>
      <span style={{ display: "inline-flex", alignItems: "center", whiteSpace: "pre" }}>{children}</span>
    </div>
  );
}

/* ---------- Histogramm ---------- */

function Histogramm({ n, p, k, modus, simuliert, letzter }) {
  const W = 360, H = 210, rl = 30, rr = 8, ro = 14, ru = 26;
  const werte = Array.from({ length: n + 1 }, (_, i) => bin(n, p, i));
  const maxSim = simuliert && simuliert.gesamt ? Math.max(...simuliert.zaehler.map((z) => z / simuliert.gesamt)) : 0;
  const yMax = Math.max(...werte, maxSim) * 1.12 || 1;
  const bw = (W - rl - rr) / (n + 1);
  const x = (i) => rl + i * bw;
  const y = (v) => H - ru - (v / yMax) * (H - ru - ro);
  const drin = (i) => (modus === "gleich" ? i === k : modus === "hoechstens" ? i <= k : i >= k);
  const mu = n * p;
  const yTicks = [];
  const schritt = yMax > 0.4 ? 0.1 : yMax > 0.2 ? 0.05 : yMax > 0.08 ? 0.02 : 0.01;
  for (let v = schritt; v < yMax; v += schritt) yTicks.push(v);
  const labelSchritt = n > 30 ? 5 : n > 15 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={rl} y1={y(v)} x2={W - rr} y2={y(v)} stroke={C.linie} strokeWidth="1" />
          <text x={rl - 4} y={y(v) + 3} fontSize="8.5" textAnchor="end" fill={C.hellgrau}>{Math.round(v * 100)} %</text>
        </g>
      ))}
      {werte.map((v, i) => (
        <rect key={i} x={x(i) + bw * 0.1} y={y(v)} width={bw * 0.8} height={Math.max(0, H - ru - y(v))} rx={Math.min(3, bw * 0.15)}
          fill={drin(i) ? C.flaggold : C.see} opacity={drin(i) ? 1 : 0.28}
          stroke={letzter === i ? C.gruen : "none"} strokeWidth={letzter === i ? 2.5 : 0} />
      ))}
      {/* simulierte relative Häufigkeiten */}
      {simuliert && simuliert.gesamt > 0 && simuliert.zaehler.map((z, i) => z > 0 && (
        <line key={`s${i}`} x1={x(i) + bw * 0.12} x2={x(i) + bw * 0.88} y1={y(z / simuliert.gesamt)} y2={y(z / simuliert.gesamt)}
          stroke={C.gruen} strokeWidth="2.4" strokeLinecap="round" />
      ))}
      {/* Erwartungswert */}
      <line x1={x(mu) + bw / 2} x2={x(mu) + bw / 2} y1={ro - 4} y2={H - ru} stroke={C.smaragd} strokeWidth="1.6" strokeDasharray="4 3" />
      <text x={x(mu) + bw / 2 + 4} y={ro + 4} fontSize="10" fontWeight="700" fill={C.smaragd}>μ = {dez(mu, 2).replace(/,00$/, "")}</text>
      <line x1={rl} y1={H - ru} x2={W - rr} y2={H - ru} stroke={C.hellgrau} strokeWidth="1.2" />
      {werte.map((_, i) => i % labelSchritt === 0 && (
        <text key={`l${i}`} x={x(i) + bw / 2} y={H - ru + 13} fontSize="9" textAnchor="middle"
          fill={i === k ? FARBEN.k : C.grau} fontWeight={i === k ? 800 : 400}>{i}</text>
      ))}
      <text x={W - rr} y={H - 4} fontSize="9" textAnchor="end" fill={C.hellgrau}>Anzahl Treffer k</text>
    </svg>
  );
}

/* ---------- Bernoulli-Bingo ---------- */

export function BernoulliBingo() {
  const [n, setN] = useState(10);
  const [p, setP] = useState(1 / 6);
  const [bruch, setBruch] = useState({ z: 1, nn: 6 });   // null = Kommazahl-Darstellung
  const pT = bruch ? `${bruch.z}/${bruch.nn}` : pText(p);
  const qT = bruch ? `${bruch.nn - bruch.z}/${bruch.nn}` : pText(1 - p);
  const [k, setK] = useState(2);
  const [modus, setModus] = useState("gleich");
  const [ergebnis, setErgebnis] = useState(null);     // Array aus true/false (laufender/letzter Versuch)
  const [sichtbar, setSichtbar] = useState(0);
  const [laeuft, setLaeuft] = useState(false);
  const [sim, setSim] = useState({ gesamt: 0, bingo: 0, zaehler: [] });
  const [trefferName, setTrefferName] = useState("Sechs");
  const timer = useRef(null);

  // bei neuen Parametern Statistik zurücksetzen
  useEffect(() => {
    clearInterval(timer.current); setLaeuft(false); setErgebnis(null); setSichtbar(0);
    setSim({ gesamt: 0, bingo: 0, zaehler: Array(n + 1).fill(0) });
    if (k > n) setK(n);
  }, [n, p]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearInterval(timer.current), []);

  const drin = (t) => (modus === "gleich" ? t === k : modus === "hoechstens" ? t <= k : t >= k);
  const wahrscheinlichkeit = useMemo(() => {
    let s = 0;
    for (let i = 0; i <= n; i++) if (drin(i)) s += bin(n, p, i);
    return s;
  }, [n, p, k, modus]);  // eslint-disable-line react-hooks/exhaustive-deps

  const verbuchen = (treffer) => setSim((alt) => {
    const z = alt.zaehler.length === n + 1 ? alt.zaehler.slice() : Array(n + 1).fill(0);
    z[treffer]++;
    return { gesamt: alt.gesamt + 1, bingo: alt.bingo + (drin(treffer) ? 1 : 0), zaehler: z };
  });

  const starten = () => {
    if (laeuft) return;
    const kette = Array.from({ length: n }, () => Math.random() < p);
    setErgebnis(kette); setSichtbar(0); setLaeuft(true);
    let i = 0;
    const takt = Math.max(35, Math.min(160, 2200 / n));
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      i++; setSichtbar(i);
      if (i >= n) {
        clearInterval(timer.current); setLaeuft(false);
        verbuchen(kette.filter(Boolean).length);
      }
    }, takt);
  };
  const vielmals = (m) => {
    clearInterval(timer.current); setLaeuft(false);
    const neu = Array(n + 1).fill(0);
    let bingo = 0, letzte = null;
    for (let r = 0; r < m; r++) {
      let t = 0;
      const kette = [];
      for (let j = 0; j < n; j++) { const h = Math.random() < p; kette.push(h); if (h) t++; }
      neu[t]++; if (drin(t)) bingo++;
      letzte = kette;
    }
    setSim((alt) => {
      const z = alt.zaehler.length === n + 1 ? alt.zaehler.map((v, i) => v + neu[i]) : neu;
      return { gesamt: alt.gesamt + m, bingo: alt.bingo + bingo, zaehler: z };
    });
    setErgebnis(letzte); setSichtbar(n);
  };

  const fertig = ergebnis && sichtbar >= n && !laeuft;
  // Bingos immer passend zum aktuell gewählten Ereignis (auch nach Wechsel von k oder Modus)
  const bingos = sim.zaehler.reduce((s0, z, t) => s0 + (drin(t) ? z : 0), 0);
  const treffer = ergebnis ? ergebnis.slice(0, sichtbar).filter(Boolean).length : 0;
  const bingo = fertig && drin(treffer);
  const ereignisText = modus === "gleich" ? `genau ${k}` : modus === "hoechstens" ? `höchstens ${k}` : `mindestens ${k}`;
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

  // Rechenweg
  const q = 1 - p;
  const ktext = <span style={{ color: FARBEN.k }}>{k}</span>;
  const summand = (i) => (
    <>
      <Binom o={n} u={i} farbeO={FARBEN.n} farbeU={FARBEN.k} /><span> · </span>
      <Pot basis={<Wert t={pT} farbe={FARBEN.p} />} exp={i} /><span> · </span>
      <Pot basis={<Wert t={qT} farbe={FARBEN.p} />} exp={typeof i === "number" ? n - i : <>{n} − {i}</>} />
    </>
  );
  const formel = modus === "gleich"
    ? [<>P(X = {ktext}) = {summand(k)}</>,
       <>= {binomKoeff(n, k)} · {dez(Math.pow(p, k), 6)} · {dez(Math.pow(q, n - k), 6)}</>,
       <>≈ {dez(wahrscheinlichkeit)}</>]
    : modus === "hoechstens"
      ? [<>P(X ≤ {ktext}) = <Summe von="i = 0" bis={k} />{summand("i")}</>,
         <>= P(X = 0) + … + P(X = {ktext})</>,
         <>≈ {dez(wahrscheinlichkeit)}</>]
      : [<>P(X ≥ {ktext}) = 1 − P(X ≤ {k - 1})</>,
         <>= 1 − <Summe von="i = 0" bis={k - 1} />{summand("i")}</>,
         <>= 1 − {dez(1 - wahrscheinlichkeit)} ≈ {dez(wahrscheinlichkeit)}</>];

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Wie oft trifft der Zufall?
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Stell die Kernwerte der Bernoulli-Kette ein: <b style={{ color: FARBEN.n }}>n</b> Versuche,
        Trefferwahrscheinlichkeit <b style={{ color: FARBEN.p }}>p</b> und deinen Tipp <b style={{ color: FARBEN.k }}>k</b>.
        Die Binomialverteilung entsteht live – und im Experiment siehst du, ob der Zufall mitspielt.
      </p>

      {/* Einstellungen + Verteilung */}
      <div style={karte}>
        <Kopf n={n} p={p} k={k} setN={setN} setP={setP} setK={setK} pT={pT} qT={qT} bruch={bruch} setBruch={setBruch} />
        <Histogramm n={n} p={p} k={k} modus={modus} simuliert={sim} letzter={fertig ? treffer : null} />
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "8px 0 4px" }}>
          {VORLAGEN.map((v) => (
            <button key={v.name} onClick={() => { setP(v.p); setBruch(alsBruch(v.p)); setTrefferName(v.text); }}
              style={{ flexShrink: 0, padding: "6px 11px", borderRadius: 999, border: `1px solid ${Math.abs(p - v.p) < 1e-9 ? FARBEN.p : C.linie}`,
                background: Math.abs(p - v.p) < 1e-9 ? `${FARBEN.p}12` : C.weiss, color: C.tinte, fontSize: 12.5,
                fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>{v.name}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, margin: "10px 0 8px" }}>
          {[["gleich", "P(X = k)"], ["hoechstens", "P(X ≤ k)"], ["mindestens", "P(X ≥ k)"]].map(([id, t]) => (
            <button key={id} onClick={() => setModus(id)}
              style={{ flex: 1, height: 36, borderRadius: 10, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
                border: `1px solid ${modus === id ? C.see : C.linie}`, background: modus === id ? C.see : C.weiss,
                color: modus === id ? C.weiss : C.see }}>{t}</button>
          ))}
        </div>


        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <span style={{ fontSize: 15, color: C.grau }}>P(<b style={{ color: FARBEN.k }}>{ereignisText}</b> {trefferName === "Treffer" ? "Treffer" : `× ${trefferName}`})</span>
          <span style={{ fontSize: 30, fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>{prozent(wahrscheinlichkeit)}</span>
        </div>
        <div style={{ background: C.sand, borderRadius: 12, padding: "10px 14px", marginTop: 8, overflowX: "auto" }}>
          {formel.map((z, i) => <Zeile key={i} stark={i === formel.length - 1}>{z}</Zeile>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 10 }}>
          {[["Erwartungs\u00ADwert", "μ = n · p", dez(n * p, 2)], ["Standardabw.", "σ = √(n·p·(1−p))", dez(Math.sqrt(n * p * q), 2)], ["Tipp", "k", `${k}`]].map(([t, f, w]) => (
            <div key={t} style={{ background: C.himmel, borderRadius: 12, padding: "8px 10px" }}>
              <p style={{ fontSize: 11, color: C.grau, fontWeight: 600 }}>{t}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.see }}>{w}</p>
              <p style={{ fontSize: 10.5, color: C.hellgrau }}>{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experiment */}
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 4 }}>Das Experiment</p>
        <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>
          {n} Versuche, jeder mit der Trefferwahrscheinlichkeit <Wert t={pT} farbe={FARBEN.p} klammer={false} />. Bingo gibt es bei <b>{ereignisText}</b> Treffer{k === 1 && modus === "gleich" ? "" : "n"}.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(10, n)}, 1fr)`, gap: 5, marginBottom: 12 }}>
          {Array.from({ length: n }, (_, i) => {
            const offen = ergebnis && i < sichtbar;
            const t = offen && ergebnis[i];
            return (
              <div key={i} style={{ aspectRatio: "1 / 1", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 800, transition: "all .15s",
                background: !offen ? C.sand : t ? C.flaggold : "#E6EAF2", color: t ? C.seeTief : C.hellgrau,
                border: `1.5px solid ${!offen ? C.linie : t ? "#B38D00" : C.linie}`, transform: offen ? "scale(1)" : "scale(0.94)" }}>
                {offen ? (t ? "✓" : "·") : i + 1}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 44, marginBottom: 10 }}>
          <span style={{ fontSize: 15, color: C.tinte }}>Treffer: <b style={{ fontSize: 22 }}>{ergebnis ? treffer : "–"}</b></span>
          {fertig && (
            <span style={{ fontSize: bingo ? 24 : 15, fontWeight: 800, color: bingo ? C.gruen : C.grau,
              animation: bingo ? "bingoPop .45s ease" : "none" }}>
              {bingo ? "BINGO! 🎉" : "Diesmal nicht"}
            </span>
          )}
        </div>
        <style>{`@keyframes bingoPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>

        <button onClick={starten} disabled={laeuft}
          style={{ width: "100%", height: 54, borderRadius: 14, border: "none", cursor: laeuft ? "wait" : "pointer", fontFamily: "inherit",
            fontSize: 17, fontWeight: 800, color: C.weiss, background: C.gruen, boxShadow: "0 4px 14px rgba(165,0,68,0.3)", opacity: laeuft ? 0.7 : 1 }}>
          {laeuft ? "Läuft …" : ergebnis ? "Nochmal!" : "Experiment starten"}
        </button>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {[10, 100, 1000].map((m) => (
            <button key={m} onClick={() => vielmals(m)}
              style={{ flex: 1, height: 40, borderRadius: 12, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see,
                fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{m}× simulieren</button>
          ))}
        </div>

        {sim.gesamt > 0 && (
          <div style={{ marginTop: 14, background: C.sand, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5, color: C.grau }}>Durchgänge: <b style={{ color: C.tinte }}>{sim.gesamt}</b></span>
              <span style={{ fontSize: 13.5, color: C.grau }}>Bingos: <b style={{ color: C.gruen }}>{bingos}</b></span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              <span style={{ fontSize: 13.5, color: C.grau }}>relative Häufigkeit: <b style={{ color: C.tinte }}>{prozent(bingos / sim.gesamt)}</b></span>
              <span style={{ fontSize: 13.5, color: C.grau }}>Theorie: <b style={{ color: C.tinte }}>{prozent(wahrscheinlichkeit)}</b></span>
            </div>
            <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.55, marginTop: 8 }}>
              Die roten Striche im Diagramm zeigen die simulierten Häufigkeiten. Je mehr Durchgänge, desto näher liegen sie an
              den Säulen – das Gesetz der großen Zahlen.
            </p>
          </div>
        )}
      </div>

      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Die Bernoulli-Kette in drei Sätzen</p>
        {[
          ["Bernoulli-Versuch", "hat genau zwei Ausgänge: Treffer (Wahrscheinlichkeit p) oder Niete (1 − p)."],
          ["Bernoulli-Kette", "n-mal unabhängig wiederholt, p bleibt immer gleich. X zählt die Treffer und ist binomialverteilt: X ∼ B(n; p)."],
          ["Bernoulli-Formel", "P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ – (n über k) zählt die Pfade mit genau k Treffern."],
        ].map(([t, s]) => (
          <p key={t} style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}>
            <b style={{ color: C.tinte }}>{t}:</b> {s}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ---------- Übersicht ---------- */

const STOCHASTIK = [
  { ziel: { ansicht: "bernoulli" }, titel: "Bernoulli-Kette", kurz: "Bernoulli-Kette einstellen, Binomialverteilung live sehen und das Experiment simulieren.", zeichen: "B" },
  { ziel: { ansicht: "vierfelder" }, titel: "Vier-Felder-Tafel", kurz: "Absolute Häufigkeiten oder Wahrscheinlichkeiten, die sich zu 100 % ergänzen – mit Baumdiagramm und bedingter Wahrscheinlichkeit.", zeichen: "▦" },
  { ziel: { ansicht: "kurse", kurs: "stochastik" }, titel: "Videokurs Stochastik", kurz: "Fünf Lektionen vom Baumdiagramm bis zum Hypothesentest – mit Merksätzen und Kurz-Checks.", zeichen: "▶" },
];

export function StochastikZentrum({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Zufall zum Anfassen
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Wahrscheinlichkeiten werden greifbar, wenn man den Zufall selbst laufen lässt. Hier rechnest du nicht nur – du
        siehst, was die Formeln vorhersagen.
      </p>
      {STOCHASTIK.map((x) => (
        <button key={x.titel} onClick={() => gehe(x.ziel)} className="w-full px-5 py-5 mb-3"
          style={{ display: "flex", alignItems: "center", gap: 14, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16,
            textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 58, height: 58, borderRadius: 14,
            background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, fontStyle: "italic" }}>
            {x.zeichen}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 17.5, fontWeight: 600, marginBottom: 4 }}>{x.titel}</span>
            <span style={{ display: "block", color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{x.kurz}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* Grafik für die Startseiten-Kachel: Binomialverteilung mit Treffer-Kacheln */
export function StochastikLogoKlein() {
  const W = 230, H = 190;
  const werte = Array.from({ length: 11 }, (_, i) => bin(10, 0.4, i));
  const max = Math.max(...werte);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      {werte.map((v, i) => {
        const h = (v / max) * 100;
        return <rect key={i} x={18 + i * 18} y={128 - h} width="13" height={h} rx="2.5"
          fill={i === 4 ? C.flaggold : "rgba(255,255,255,0.3)"} stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />;
      })}
      <line x1="12" y1="128" x2="218" y2="128" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      {[1, 0, 1, 1, 0, 0, 1, 0, 0, 0].map((t, i) => (
        <g key={`k${i}`}>
          <rect x={18 + i * 20} y="146" width="15" height="15" rx="4" fill={t ? C.flaggold : "rgba(255,255,255,0.14)"} />
          {t === 1 && <path d={`M${21.5 + i * 20},153.5 l3,3 l5,-6`} stroke={C.seeTief} strokeWidth="1.8" fill="none" strokeLinecap="round" />}
        </g>
      ))}
      <text x="14" y="22" fontSize="12" fontWeight="700" fontStyle="italic" fill={C.weiss}>B(n; p)</text>
    </svg>
  );
}
