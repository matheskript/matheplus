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

function Kopf({ n, p, k, setN, setP, setK }) {
  const naechstesP = (richtung) => {
    // von Brüchen wie 1/6 aus zum nächsten 5-%-Schritt
    const liste = richtung > 0 ? P_WERTE.filter((v) => v > p + 1e-9) : P_WERTE.filter((v) => v < p - 1e-9).reverse();
    return liste.length ? liste[0] : p;
  };
  const spalten = [
    { art: "text", inhalt: "X ∼ B(" },
    { art: "wert", inhalt: `${n}`, farbe: FARBEN.n, plus: () => setN(Math.min(40, n + 1)), minus: () => setN(Math.max(1, n - 1)), name: "n" },
    { art: "text", inhalt: ";" },
    { art: "wert", inhalt: pText(p), farbe: FARBEN.p, plus: () => setP(naechstesP(1)), minus: () => setP(naechstesP(-1)), name: "p" },
    { art: "text", inhalt: ")" },
    { art: "text", inhalt: "k =" },
    { art: "wert", inhalt: `${k}`, farbe: FARBEN.k, plus: () => setK(Math.min(n, k + 1)), minus: () => setK(Math.max(0, k - 1)), name: "k" },
  ];
  const knopf = (farbe) => ({
    width: "100%", maxWidth: 52, height: 30, borderRadius: 9, border: `1.5px solid ${farbe}66`, background: `${farbe}14`,
    color: farbe, fontSize: 19, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto 1.3fr auto auto 1fr", columnGap: 4, rowGap: 8,
      alignItems: "center", justifyItems: "center", marginBottom: 6 }}>
      {spalten.map((sp, i) => (
        <span key={`s${i}`} style={{ fontSize: sp.art === "wert" ? "clamp(26px, 7vw, 44px)" : "clamp(18px, 5vw, 32px)",
          fontWeight: 800, whiteSpace: "nowrap", letterSpacing: "-0.02em", lineHeight: 1.1,
          color: sp.art === "wert" ? sp.farbe : C.tinte, marginLeft: sp.inhalt === "k =" ? 10 : 0, fontVariantNumeric: "tabular-nums" }}>
          {sp.inhalt}
        </span>
      ))}
      {spalten.map((sp, i) => sp.art === "wert" ? (
        <div key={`r${i}`} style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", alignItems: "center" }}>
          <button aria-label={`${sp.name} erhöhen`} style={knopf(sp.farbe)} onClick={sp.plus}>+</button>
          <button aria-label={`${sp.name} verringern`} style={knopf(sp.farbe)} onClick={sp.minus}>−</button>
        </div>
      ) : <span key={`r${i}`} />)}
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
  const formel = modus === "gleich"
    ? [`P(X = ${k}) = (${n} über ${k}) · ${pText(p)}^${k} · ${pText(q)}^${n - k}`,
       `= ${binomKoeff(n, k)} · ${dez(Math.pow(p, k), 6)} · ${dez(Math.pow(q, n - k), 6)}`,
       `≈ ${dez(wahrscheinlichkeit)}`]
    : modus === "hoechstens"
      ? [`P(X ≤ ${k}) = P(X = 0) + … + P(X = ${k})`, `= Σ (${n} über i) · ${pText(p)}^i · ${pText(q)}^(${n}−i) für i = 0 … ${k}`, `≈ ${dez(wahrscheinlichkeit)}`]
      : [`P(X ≥ ${k}) = 1 − P(X ≤ ${k - 1})`, `= 1 − ${dez(1 - wahrscheinlichkeit)}`, `≈ ${dez(wahrscheinlichkeit)}`];

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
        <Kopf n={n} p={p} k={k} setN={setN} setP={setP} setK={setK} />
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "8px 0 4px" }}>
          {VORLAGEN.map((v) => (
            <button key={v.name} onClick={() => { setP(v.p); setTrefferName(v.text); }}
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

        <Histogramm n={n} p={p} k={k} modus={modus} simuliert={sim} letzter={fertig ? treffer : null} />

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <span style={{ fontSize: 15, color: C.grau }}>P(<b style={{ color: FARBEN.k }}>{ereignisText}</b> {trefferName === "Treffer" ? "Treffer" : `× ${trefferName}`})</span>
          <span style={{ fontSize: 30, fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>{prozent(wahrscheinlichkeit)}</span>
        </div>
        <div style={{ background: C.sand, borderRadius: 12, padding: "10px 14px", marginTop: 8, overflowX: "auto" }}>
          {formel.map((z, i) => (
            <p key={i} style={{ fontSize: 13.5, color: i === formel.length - 1 ? C.tinte : C.grau, fontWeight: i === formel.length - 1 ? 700 : 400,
              whiteSpace: "nowrap", lineHeight: 1.7, fontVariantNumeric: "tabular-nums" }}>{z}</p>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 10 }}>
          {[["Erwartungswert", "μ = n · p", dez(n * p, 2)], ["Standardabw.", "σ = √(n·p·(1−p))", dez(Math.sqrt(n * p * q), 2)], ["Tipp", "k", `${k}`]].map(([t, f, w]) => (
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
          {n} Versuche, jeder mit der Trefferwahrscheinlichkeit {pText(p)}. Bingo gibt es bei <b>{ereignisText}</b> Treffer{k === 1 && modus === "gleich" ? "" : "n"}.
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
  { ziel: { ansicht: "bernoulli" }, titel: "Bernoulli-Bingo", kurz: "Bernoulli-Kette einstellen, Binomialverteilung live sehen und das Experiment simulieren.", zeichen: "B" },
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
