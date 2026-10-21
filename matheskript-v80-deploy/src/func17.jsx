/* ============================================================
   Stochastik-Bereich
   - BernoulliBingo: Bernoulli-Kette mit n, p und k einstellen,
     Binomialverteilung live sehen, P(X = k), P(X ≤ k), P(X ≥ k),
     P(a ≤ X ≤ k) mit Rechenweg, Tabelle und σ-Umgebung, eine Übung
     (Textaufgabe → Kette einstellen, Logik in bernoulliUebung.js)
     und das Experiment simulieren („Bingo!“).
   - StochastikZentrum: Übersichtsseite
   - StochastikLogoKlein: Grafik für die Startseiten-Kachel
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { WeiterKnopf, WeiterMit, ZentrumListe } from "./funcWerkzeuge.jsx";
import { MS } from "./mathText.jsx";
import { uebergabeErledigt, uebergabeLesen } from "./uebergabe.js";
import { C } from "./base1.jsx";
import { GesperrteKurse } from "./func1.jsx";
import { Vorwissen, BernoulliVorwissen } from "./funcVorwissen.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { neueAufgabe, pruefen, ereignisTex, pAlsText } from "./bernoulliUebung.js";
import { Arbeitsflaeche, BildKarte, ErgebnisReihe, FeinKarte, Werkzeugleiste, chipStil, hinweisStil, titelStil, toenKarte, useBreite, useDesktop } from "./arbeitsflaeche.jsx";

function bernoulliHilfe(n, pT, k, modus, a = 0) {
  const ereignis = modus === "gleich" ? `genau ${k}` : modus === "hoechstens" ? `höchstens ${k}` : modus === "zwischen" ? `zwischen ${a} und ${k}` : `mindestens ${k}`;
  const zeichen = modus === "gleich" ? `X = ${k}` : modus === "hoechstens" ? `X ≤ ${k}` : modus === "zwischen" ? `${a} ≤ X ≤ ${k}` : `X ≥ ${k}`;
  return {
    id: `bern-${n}-${pT}-${k}-${modus}`,
    aufgabe: "Bernoulli höchstens mindestens Trefferwahrscheinlichkeit",
    hilfen: {
      verstehen: [
        `Gesucht ist die Wahrscheinlichkeit für ${ereignis} Treffer bei ${n} Versuchen. Wie schreibst du das Ereignis mit X?`,
        `${ereignis[0].toUpperCase() + ereignis.slice(1)} Treffer heißt ${zeichen}. Vorsicht: „mehr als ${k}“ wäre X ≥ ${k + 1}, „weniger als ${k}“ wäre X ≤ ${k - 1}.`,
        "Prüfe die Voraussetzungen einer Bernoulli-Kette: feste Versuchszahl n, nur Treffer oder Niete, die Versuche sind unabhängig, und p bleibt bei jedem Versuch gleich.",
      ],
      ansatz: [
        "Brauchst du eine einzelne Wahrscheinlichkeit oder eine Summe mehrerer?",
        modus === "gleich" ? "Für genau k Treffer: Bernoulli-Formel P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ."
          : modus === "hoechstens" ? "Für höchstens k Treffer: alle Fälle von 0 bis k aufsummieren – P(X ≤ k) = P(X = 0) + … + P(X = k)."
            : modus === "zwischen" ? "Für ein Intervall: zwei kumulierte Wahrscheinlichkeiten subtrahieren – P(a ≤ X ≤ b) = P(X ≤ b) − P(X ≤ a − 1)."
              : "Für mindestens k Treffer ist das Gegenereignis meist kürzer: P(X ≥ k) = 1 − P(X ≤ k − 1).",
        modus === "mindestens" ? `Hier: P(X ≥ ${k}) = 1 − P(X ≤ ${k - 1}). Berechne zuerst P(X ≤ ${k - 1}).`
          : modus === "hoechstens" ? `Hier: Summe von P(X = 0) bis P(X = ${k}) – mit dem Taschenrechner als kumulierte Binomialverteilung.`
            : modus === "zwischen" ? `Hier: P(${a} ≤ X ≤ ${k}) = P(X ≤ ${k}) − P(X ≤ ${a - 1}). Beide Werte liefert die Tabelle unter dem Rechenweg.`
              : `Hier: (${n} über ${k}) · (${pT})^${k} · (1 − ${pT})^${n - k}.`,
      ],
      regel: [
        "Welche Formel beschreibt genau k Treffer in n Versuchen?",
        "P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ. Der Binomialkoeffizient zählt, an welchen Stellen die Treffer liegen können.",
        "Für „mindestens“ und „höchstens“ siehe „Passende Regel ansehen“.",
      ],
      pruefen: [
        "Liegt dein Ergebnis zwischen 0 und 1?",
        "Vergleiche mit dem Histogramm: Ist der markierte Bereich groß oder klein? Die Tabelle unter dem Rechenweg zeigt jeden Einzelwert.",
        "Die Simulation zeigt eine relative Häufigkeit – sie schwankt um die exakte Wahrscheinlichkeit, stimmt aber nicht genau mit ihr überein.",
      ],
    },
    regeln: [{ name: "Bernoulli-Formel", bereich: "stochastik" }, { name: "Höchstens und mindestens", bereich: "stochastik" }, { name: "Gegenereignis", bereich: "stochastik" }],
    grundlage: { trainer: "bruchrechnen", name: "Brüche", grund: "Wahrscheinlichkeiten sind oft Brüche. Sicheres Bruchrechnen hilft beim Potenzieren und Multiplizieren." },
    loesung: null,
  };
}

/* Desktop-Stil (DESKTOP-STIL.md): Trainer – Aufgabe und Schritte links breit, Tabelle/Diagramm/Regler rechts (300 px).
   Genutzt von Erwartungswert, Kombinatorik und Hypothesentests. */
export function TrainerSpalten({ links, rechts }) {
  return (
    <div data-trainer-spalten style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 300px)", gap: 24, alignItems: "start" }}>
      <div style={{ minWidth: 0 }}>{links}</div>
      <div style={{ minWidth: 0, position: "sticky", top: 76, display: "grid", gap: 12 }}>{rechts}</div>
    </div>
  );
}
/* Rechte Spalte: Tabelle der Verteilung auf zartem Grund */
export const tabellenKasten = { background: C.sand, borderRadius: 14, padding: "2px 10px", border: `1px solid ${C.linie}` };

/* ---------- Mathematik ---------- */

export function binomKoeff(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}
export const bin = (n, p, k) => binomKoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
const prozent = (v) => `${(v * 100).toFixed(2).replace(".", ",")} %`;
const dez = (v, st = 4) => v.toFixed(st).replace(".", ",");

/* p anzeigen: Drittel und Sechstel als Bruch (nicht endliche Dezimalzahlen), sonst als Dezimalzahl */
function pText(p) {
  for (const [z, nn] of [[1, 3], [2, 3], [1, 6], [5, 6]]) if (Math.abs(p - z / nn) < 1e-9) return `${z}/${nn}`;
  return (Math.round(p * 100) / 100).toString().replace(".", ",");
}

const FARBEN = { n: "#004D98", p: "#B98A00", k: "#C99A00" };
const N_MAX = 100;
const N_CHIPS = [5, 10, 20, 50, 100];
const P_WERTE = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95];
const VORLAGEN = [
  { name: "🪙 Münze", p: 1 / 2, text: "Kopf" },
  { name: "🎲 Sechs würfeln", p: 1 / 6, text: "Sechs" },
  { name: "🎯 Treffer $\\frac{1}{3}$", p: 1 / 3, text: "Treffer" },
  { name: "🃏 Herz ziehen", p: 1 / 4, text: "Herz" },
];

/* p-Text („1/6“) für Fließtext: ein Bruch wird als $…$-Formel gesetzt (Anzeige mit MS) */
const pS = (t) => { const m = /^(\d+)\/(\d+)$/.exec(t); return m ? `$\\frac{${m[1]}}{${m[2]}}$` : t; };

/* ---------- Kopf: X ~ B(n; p) mit k, groß und farbig, + / − darunter ---------- */

// Wahrscheinlichkeit als (möglichst einfachen) Bruch mit Nenner bis 100
function alsBruch(p) {
  for (let d = 1; d <= 100; d++) {
    const z = Math.round(p * d);
    if (Math.abs(p - z / d) < 1e-9) return { z, nn: d };
  }
  return { z: Math.max(1, Math.round(p * 100)), nn: 100 };
}

// von Brüchen wie 1/6 aus zum nächsten 5-%-Schritt
function naechstesPWert(p, richtung) {
  const liste = richtung > 0 ? P_WERTE.filter((v) => v > p + 1e-9) : P_WERTE.filter((v) => v < p - 1e-9).reverse();
  return liste.length ? liste[0] : p;
}
// Zähler/Nenner ändern – aus einer Kommazahl wird dabei automatisch ein Bruch
function bruchSchritt(bruch, p, teil, d) {
  const b = bruch || alsBruch(p);
  let { z, nn } = b;
  if (teil === "z") z = Math.min(nn, Math.max(1, z + d));
  else nn = Math.min(100, Math.max(z, 1, nn + d));
  return { z, nn };
}

function Kopf({ n, p, k, setN, setP, setK, pT, qT, bruch, setBruch }) {
  const naechstesP = (richtung) => naechstesPWert(p, richtung);
  const zeilen = [
    { name: "n", kurz: "Versuche", label: "Versuche", wert: `${n}`, farbe: FARBEN.n, plus: () => setN(Math.min(N_MAX, n + 1)), minus: () => setN(Math.max(1, n - 1)) },
    { name: "p", kurz: "Treffer-WKT", label: "Treffer\u00ADwahr\u00ADschein\u00ADlich\u00ADkeit", wert: <Wert t={pT} farbe={FARBEN.p} klammer={false} />, farbe: FARBEN.p, plus: () => { setBruch(null); setP(naechstesP(1)); }, minus: () => { setBruch(null); setP(naechstesP(-1)); } },
    { name: "k", kurz: "Treffer", label: "Treffer", wert: `${k}`, farbe: FARBEN.k, plus: () => setK(Math.min(n, k + 1)), minus: () => setK(Math.max(0, k - 1)) },
  ];
  const bruchAendern = (teil, d) => {
    const { z, nn } = bruchSchritt(bruch, p, teil, d);
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

/* ---------- Desktop: n, k und p als Karte (+ oben, Wert, − unten wie die Ebenen-Karten) ---------- */
function KettenKarte({ n, p, k, setN, setP, setK, pT, bruch, setBruch }) {
  const knopf = (f) => ({
    width: "100%", maxWidth: 66, height: 30, borderRadius: 9, border: `1.5px solid ${f}55`, background: `${f}12`,
    color: f, fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation",
  });
  const mini = {
    width: 30, height: 26, borderRadius: 8, border: `1px solid ${FARBEN.p}55`, background: C.weiss,
    color: FARBEN.p, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  const bruchAendern = (teil, d) => { const b = bruchSchritt(bruch, p, teil, d); setBruch(b); setP(b.z / b.nn); };
  const spalten = [
    { name: "n", kurz: "Versuche", farbe: FARBEN.n, wert: n, plus: () => setN(Math.min(N_MAX, n + 1)), minus: () => setN(Math.max(1, n - 1)) },
    { name: "k", kurz: "Treffer", farbe: FARBEN.k, wert: k, plus: () => setK(Math.min(n, k + 1)), minus: () => setK(Math.max(0, k - 1)) },
    { name: "p", kurz: "Treffer-WKT", farbe: FARBEN.p, wert: <Wert t={pT} farbe={FARBEN.p} klammer={false} />,
      plus: () => { setBruch(null); setP(naechstesPWert(p, 1)); }, minus: () => { setBruch(null); setP(naechstesPWert(p, -1)); } },
  ];
  return (
    <div data-bk-kette style={toenKarte(FARBEN.n)}>
      <p style={{ ...titelStil, textAlign: "center", marginBottom: 12 }}>X ∼ B(<span style={{ color: FARBEN.n }}>{n}</span>; <Wert t={pT} farbe={FARBEN.p} klammer={false} />)</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {spalten.map((z) => (
          <div key={z.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.grau, whiteSpace: "nowrap" }}><b style={{ color: z.farbe, fontWeight: 800 }}>{z.name}</b> {z.kurz}</span>
            <button className="eve-knopf" aria-label={`${z.name} erhöhen`} style={knopf(z.farbe)} onClick={z.plus}>+</button>
            <span style={{ height: 40, display: "flex", alignItems: "center", fontSize: 21, fontWeight: 800, color: z.farbe, fontVariantNumeric: "tabular-nums", lineHeight: 1, whiteSpace: "nowrap" }}>{z.wert}</span>
            <button className="eve-knopf" aria-label={`${z.name} verringern`} style={knopf(z.farbe)} onClick={z.minus}>−</button>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: `${FARBEN.n}22`, margin: "12px 4px 10px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        {[["z", "Zähler"], ["nn", "Nenner"]].map(([teil, t]) => (
          <div key={teil} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.grau, marginRight: 3, whiteSpace: "nowrap" }}><b style={{ color: FARBEN.p }}>p</b>-{t}</span>
            <button className="eve-knopf" aria-label={`${t} verringern`} style={mini} onClick={() => bruchAendern(teil, -1)}>−</button>
            <button className="eve-knopf" aria-label={`${t} erhöhen`} style={mini} onClick={() => bruchAendern(teil, 1)}>+</button>
          </div>
        ))}
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

/* breite/hoehe: Desktop zeichnet in echten Pixeln (gemessene Breite) mit etwas größerer Schrift; Handy wie bisher 360 × 210 */
function Histogramm({ n, p, drin, k, simuliert, letzter, breite, hoehe }) {
  const g = breite ? 1.3 : 1;
  const W = breite || 360, H = hoehe || 210, rl = Math.round(30 * g), rr = 8, ro = Math.round(14 * g), ru = Math.round(26 * g);
  const werte = Array.from({ length: n + 1 }, (_, i) => bin(n, p, i));
  const maxSim = simuliert && simuliert.gesamt ? Math.max(...simuliert.zaehler.map((z) => z / simuliert.gesamt)) : 0;
  const yMax = Math.max(...werte, maxSim) * 1.12 || 1;
  const bw = (W - rl - rr) / (n + 1);
  const x = (i) => rl + i * bw;
  const y = (v) => H - ru - (v / yMax) * (H - ru - ro);
  const mu = n * p, sigma = Math.sqrt(n * p * (1 - p));
  const yTicks = [];
  const schritt = yMax > 0.4 ? 0.1 : yMax > 0.2 ? 0.05 : yMax > 0.08 ? 0.02 : 0.01;
  for (let v = schritt; v < yMax; v += schritt) yTicks.push(v);
  const labelSchritt = n > 60 ? 10 : n > 30 ? 5 : n > 15 ? 2 : 1;
  const eng = n > 40;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} aria-label="Histogramm der Binomialverteilung">
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={rl} y1={y(v)} x2={W - rr} y2={y(v)} stroke={C.linie} strokeWidth="1" />
          <text x={rl - 4} y={y(v) + 3} fontSize={8.5 * g} textAnchor="end" fill={breite ? C.grau : C.hellgrau}>{Math.round(v * 100)} %</text>
        </g>
      ))}
      {/* σ-Umgebung als zarter Streifen */}
      <rect x={x(Math.max(0, mu - sigma)) + bw / 2} y={ro - 4} width={Math.max(0, x(Math.min(n, mu + sigma)) - x(Math.max(0, mu - sigma)))} height={H - ru - ro + 4}
        fill={C.smaragd} opacity="0.07" />
      {werte.map((v, i) => (
        <rect key={i} x={x(i) + bw * (eng ? 0.05 : 0.1)} y={y(v)} width={bw * (eng ? 0.9 : 0.8)} height={Math.max(0, H - ru - y(v))} rx={Math.min(3, bw * 0.15)}
          fill={drin(i) ? C.flaggold : C.see} opacity={drin(i) ? 1 : 0.28}
          stroke={letzter === i ? C.see : "none"} strokeWidth={letzter === i ? 2.5 : 0} />
      ))}
      {/* simulierte relative Häufigkeiten */}
      {simuliert && simuliert.gesamt > 0 && simuliert.zaehler.map((z, i) => z > 0 && (
        <line key={`s${i}`} x1={x(i) + bw * 0.12} x2={x(i) + bw * 0.88} y1={y(z / simuliert.gesamt)} y2={y(z / simuliert.gesamt)}
          stroke={C.see} strokeWidth={eng ? 1.8 : 2.6} strokeLinecap="round" />
      ))}
      {/* Erwartungswert */}
      <line x1={x(mu) + bw / 2} x2={x(mu) + bw / 2} y1={ro - 4} y2={H - ru} stroke={C.smaragd} strokeWidth="1.6" strokeDasharray="4 3" />
      <text x={x(mu) + bw / 2 + 4} y={ro + 4} fontSize={10 * g} fontWeight="700" fill={C.smaragd}>μ = {dez(mu, 2).replace(/,00$/, "")}</text>
      <line x1={rl} y1={H - ru} x2={W - rr} y2={H - ru} stroke={C.hellgrau} strokeWidth="1.2" />
      {werte.map((_, i) => i % labelSchritt === 0 && (
        <text key={`l${i}`} x={x(i) + bw / 2} y={H - ru + 13 * g} fontSize={9 * g} textAnchor="middle"
          fill={i === k ? FARBEN.k : C.grau} fontWeight={i === k ? 800 : 400}>{i}</text>
      ))}
      <text x={W - rr} y={H - 4} fontSize={9 * g} textAnchor="end" fill={breite ? C.grau : C.hellgrau}>Anzahl Treffer k</text>
    </svg>
  );
}

function Legende({ mitSim }) {
  const eintrag = (zeichen, text) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: C.grau, whiteSpace: "nowrap" }}>{zeichen}{text}</span>
  );
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 2 }}>
      {eintrag(<span style={{ width: 10, height: 10, borderRadius: 2, background: C.flaggold }} />, "Ereignis")}
      {eintrag(<span style={{ width: 10, height: 10, borderRadius: 2, background: C.see, opacity: 0.28 }} />, "übrige Werte")}
      {eintrag(<span style={{ width: 12, height: 0, borderTop: `2px dashed ${C.smaragd}` }} />, "μ, Streifen: μ ± σ")}
      {mitSim && eintrag(<span style={{ width: 12, height: 3, borderRadius: 2, background: C.see }} />, "Simulation")}
    </div>
  );
}

/* ---------- Tabelle der Verteilung ---------- */

function Tabelle({ n, p, drin }) {
  const werte = Array.from({ length: n + 1 }, (_, i) => bin(n, p, i));
  let kum = 0;
  const zeilen = werte.map((w, i) => { kum += w; return { i, w, bis: Math.min(1, kum), ab: Math.min(1, 1 - (kum - w)) }; });
  const zelle = { padding: "4px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
  return (
    <div style={{ maxHeight: 290, overflowY: "auto", borderRadius: 12, border: `1px solid ${C.linie}`, marginTop: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ position: "sticky", top: 0, background: C.himmel, color: C.grau, fontWeight: 700 }}>
            {["k", "P(X = k)", "P(X ≤ k)", "P(X ≥ k)"].map((t) => <th key={t} style={{ ...zelle, textAlign: t === "k" ? "center" : "right" }}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => {
            const d = drin(z.i);
            return (
              <tr key={z.i} style={{ background: d ? `${C.flaggold}22` : z.i % 2 ? C.sand : C.weiss, color: C.tinte, fontWeight: d ? 700 : 400 }}>
                <td style={{ ...zelle, textAlign: "center", color: d ? FARBEN.k : C.grau, fontWeight: 700 }}>{z.i}</td>
                <td style={zelle}>{dez(z.w)}</td>
                <td style={zelle}>{dez(z.bis)}</td>
                <td style={zelle}>{dez(z.ab)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Übung: Textaufgabe → Kette einstellen ---------- */

function Uebung({ n, p, pT, menge, einstellen }) {
  const [aufgabe, setAufgabe] = useState(null);
  const [rueck, setRueck] = useState(null);      // { richtig, fehler } nach dem Prüfen
  const [serie, setSerie] = useState(0);
  const [geloest, setGeloest] = useState(0);
  const neu = () => { setAufgabe(neueAufgabe(Math.random, aufgabe)); setRueck(null); };
  const pruefenJetzt = () => {
    const r = pruefen(aufgabe, { n, p, menge });
    setRueck(r);
    if (r.richtig) { setSerie((s) => s + 1); setGeloest((g) => g + 1); } else setSerie(0);
  };
  const knopf = (voll) => ({
    flex: 1, height: 44, borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 14.5, fontWeight: 700,
    border: `1px solid ${voll ? C.see : C.linie}`, background: voll ? C.see : C.weiss, color: voll ? C.weiss : C.see,
  });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see }}>Übung: Textaufgabe → Kette einstellen</p>
        {geloest > 0 && <span style={{ fontSize: 12, color: C.grau }}>gelöst: <b style={{ color: C.tinte }}>{geloest}</b>{serie > 1 && <> · Serie <b style={{ color: C.smaragd }}>{serie}</b></>}</span>}
      </div>
      {!aufgabe ? (
        <>
          <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>
            Die halbe Miete bei Bernoulli-Aufgaben ist die Übersetzung: Was ist <b style={{ color: FARBEN.n }}>n</b>, was ist <b style={{ color: FARBEN.p }}>p</b>,
            und heißt „mehr als 3“ nun X ≥ 3 oder X ≥ 4? Hier bekommst du einen Aufgabentext und stellst oben die passende Kette ein.
          </p>
          <button onClick={neu} style={knopf(true)}>Aufgabe stellen</button>
        </>
      ) : (
        <>
          <div style={{ background: C.sand, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.linie}` }}>
            <p style={{ fontSize: 15, color: C.tinte, lineHeight: 1.65 }}><MS s={aufgabe.text} /></p>
          </div>
          <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.5, margin: "8px 0 10px" }}>
            Stell oben <b style={{ color: FARBEN.n }}>n</b>, <b style={{ color: FARBEN.p }}>p</b> und das Ereignis ein – mit den Knöpfen und den Chips.
            Dann prüfen. Eingestellt ist gerade <b style={{ color: C.tinte }}>B({n}; {pT})</b> mit <b style={{ color: C.tinte }}>{ereignisTex(menge, n)}</b>.
          </p>
          {rueck && (
            <div style={{ borderRadius: 12, padding: "10px 14px", marginBottom: 10,
              background: rueck.richtig ? "#EAF6EF" : "#FFF6E0", border: `1px solid ${rueck.richtig ? C.smaragd : C.flaggold}` }}>
              {rueck.richtig ? (
                <p style={{ fontSize: 14.5, color: C.smaragd, fontWeight: 700, lineHeight: 1.5 }}>
                  Richtig: X ∼ B({aufgabe.n}; {pAlsText(aufgabe.p, aufgabe.bruch)}), Ereignis {aufgabe.tex}. Das Ergebnis steht oben.
                </p>
              ) : rueck.fehler.map((f, i) => (
                <p key={i} style={{ fontSize: 14, color: C.tinte, lineHeight: 1.55, marginBottom: i < rueck.fehler.length - 1 ? 4 : 0 }}>
                  <b style={{ color: C.gruenDunkel }}>{f.typ === "n" ? "n ist" : f.typ === "p" ? "p ist" : "Ereignis:"}</b> {f.text}
                </p>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {!(rueck && rueck.richtig) && <button onClick={pruefenJetzt} style={knopf(true)}>Prüfen</button>}
            {!(rueck && rueck.richtig) && <button onClick={() => { einstellen(aufgabe); setRueck({ richtig: true, fehler: [] }); setSerie(0); }} style={knopf(false)}>Lösung einstellen</button>}
            {rueck && rueck.richtig && <button onClick={neu} style={knopf(true)}>Nächste Aufgabe</button>}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Bernoulli-Bingo ---------- */

const MODI = [["gleich", "X = k"], ["hoechstens", "X ≤ k"], ["mindestens", "X ≥ k"], ["zwischen", "a ≤ X ≤ k"]];

export function BernoulliBingo() {
  // Übergabe (z. B. aus einer Abi-Kette): { n, p }
  const [mit] = useState(() => { const u = uebergabeLesen("bernoulli"); return u && Number.isInteger(u.n) && u.n >= 1 && u.n <= N_MAX && u.p > 0 && u.p < 1 ? u : null; });
  React.useEffect(() => { uebergabeErledigt("bernoulli"); }, []);
  const [n, setN] = useState(mit ? mit.n : 10);
  const [p, setP] = useState(mit ? mit.p : 1 / 6);
  const [bruch, setBruch] = useState(!mit || Math.abs(mit.p - 1 / 6) < 1e-12 ? { z: 1, nn: 6 } : null);   // null = Kommazahl-Darstellung
  const pT = bruch ? `${bruch.z}/${bruch.nn}` : pText(p);
  const qT = bruch ? `${bruch.nn - bruch.z}/${bruch.nn}` : pText(1 - p);
  const [k, setK] = useState(() => (mit ? Math.round(mit.n * mit.p) : 2));
  const [aRoh, setA] = useState(0);
  const [modus, setModus] = useState("gleich");
  const [ergebnis, setErgebnis] = useState(null);     // Array aus true/false (laufender/letzter Versuch)
  const [sichtbar, setSichtbar] = useState(0);
  const [laeuft, setLaeuft] = useState(false);
  const [sim, setSim] = useState({ gesamt: 0, bingo: 0, zaehler: [] });
  const [trefferName, setTrefferName] = useState("Sechs");
  const [tabelle, setTabelle] = useState(false);
  const desktop = useDesktop();
  const [histoRef, histoBreite] = useBreite();
  const timer = useRef(null);
  const a = Math.min(aRoh, k);   // untere Grenze nie über k

  // bei neuen Parametern Statistik zurücksetzen
  useEffect(() => {
    clearInterval(timer.current); setLaeuft(false); setErgebnis(null); setSichtbar(0);
    setSim({ gesamt: 0, bingo: 0, zaehler: Array(n + 1).fill(0) });
    if (k > n) setK(n);
  }, [n, p]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearInterval(timer.current), []);

  const menge = modus === "gleich" ? [k, k] : modus === "hoechstens" ? [0, k] : modus === "mindestens" ? [k, n] : [a, k];
  const drin = (t) => t >= menge[0] && t <= menge[1];
  const werte = useMemo(() => Array.from({ length: n + 1 }, (_, i) => bin(n, p, i)), [n, p]);
  const kum = (bis) => { let s = 0; for (let i = 0; i <= Math.min(bis, n); i++) s += werte[i]; return Math.min(1, s); };   // P(X ≤ bis)
  const wahrscheinlichkeit = useMemo(() => {
    let s = 0;
    for (let i = 0; i <= n; i++) if (drin(i)) s += werte[i];
    return Math.min(1, s);
  }, [n, p, k, modus, a]);  // eslint-disable-line react-hooks/exhaustive-deps

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
    const takt = Math.max(30, Math.min(160, 2200 / n));
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

  // Kette aus einer Übungsaufgabe übernehmen
  const einstellen = (auf) => {
    setN(auf.n); setP(auf.p); setBruch(auf.bruch ? { ...auf.bruch } : null);
    const [von, bis] = auf.menge;
    if (von === bis) { setModus("gleich"); setK(von); }
    else if (von <= 0) { setModus("hoechstens"); setK(bis); }
    else if (bis >= auf.n) { setModus("mindestens"); setK(von); }
    else { setModus("zwischen"); setA(von); setK(bis); }
  };

  const fertig = ergebnis && sichtbar >= n && !laeuft;
  // Bingos immer passend zum aktuell gewählten Ereignis (auch nach Wechsel von k oder Modus)
  const bingos = sim.zaehler.reduce((s0, z, t) => s0 + (drin(t) ? z : 0), 0);
  const treffer = ergebnis ? ergebnis.slice(0, sichtbar).filter(Boolean).length : 0;
  const bingo = fertig && drin(treffer);
  const ereignisText = modus === "gleich" ? `genau ${k}` : modus === "hoechstens" ? `höchstens ${k}` : modus === "mindestens" ? `mindestens ${k}` : `${a} bis ${k}`;
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

  // Kennzahlen
  const q = 1 - p;
  const mu = n * p, sigma = Math.sqrt(n * p * q);
  const sigVon = Math.max(0, Math.ceil(mu - sigma)), sigBis = Math.min(n, Math.floor(mu + sigma));
  const sigP = kum(sigBis) - (sigVon > 0 ? kum(sigVon - 1) : 0);

  // Rechenweg
  const ktext = <span style={{ color: FARBEN.k }}>{k}</span>;
  const atext = <span style={{ color: FARBEN.k }}>{a}</span>;
  const summand = (i) => (
    <>
      <Binom o={n} u={i} farbeO={FARBEN.n} farbeU={FARBEN.k} /><span> · </span>
      <Pot basis={<Wert t={pT} farbe={FARBEN.p} />} exp={i} /><span> · </span>
      <Pot basis={<Wert t={qT} farbe={FARBEN.p} />} exp={typeof i === "number" ? n - i : <>{n} − {i}</>} />
    </>
  );
  // Summe P(X = 0) + … + P(X = bis) als Zahlen: bis zu vier Summanden ausgeschrieben, sonst die ersten zwei und der letzte
  const summeZahlen = (bis) => {
    const t = werte.slice(0, bis + 1).map((w) => dez(w));
    return bis <= 3 ? t.join(" + ") : `${t[0]} + ${t[1]} + … + ${t[bis]}`;
  };
  let formel;
  if (modus === "gleich") {
    formel = [<>P(X = {ktext}) = {summand(k)}</>,
      <>= {binomKoeff(n, k)} · {dez(Math.pow(p, k), 6)} · {dez(Math.pow(q, n - k), 6)}</>,
      <>≈ {dez(wahrscheinlichkeit)}</>];
  } else if (modus === "hoechstens") {
    formel = k >= n
      ? [<>P(X ≤ {ktext}) = P(X ≤ {n}) = 1</>, <>Alle Ergebnisse haben höchstens {n} Treffer – das sichere Ereignis.</>]
      : [<>P(X ≤ {ktext}) = <Summe von="i = 0" bis={k} />{summand("i")}</>,
        <>= {summeZahlen(k)}</>,
        <>≈ {dez(wahrscheinlichkeit)}</>];
  } else if (modus === "mindestens") {
    formel = k <= 0
      ? [<>P(X ≥ 0) = 1</>, <>Jedes Ergebnis hat mindestens 0 Treffer – das sichere Ereignis.</>]
      : [<>P(X ≥ {ktext}) = 1 − P(X ≤ {k - 1})</>,
        <>= 1 − <Summe von="i = 0" bis={k - 1} />{summand("i")}</>,
        <>= 1 − {dez(kum(k - 1))} ≈ {dez(wahrscheinlichkeit)}</>];
  } else {
    formel = a <= 0
      ? [<>P(0 ≤ X ≤ {ktext}) = P(X ≤ {ktext})</>, <>= {summeZahlen(k)}</>, <>≈ {dez(wahrscheinlichkeit)}</>]
      : a === k
        ? [<>P({atext} ≤ X ≤ {ktext}) = P(X = {ktext})</>, <>= {summand(k)}</>, <>≈ {dez(wahrscheinlichkeit)}</>]
        : [<>P({atext} ≤ X ≤ {ktext}) = P(X ≤ {ktext}) − P(X ≤ {a - 1})</>,
          <>= {dez(kum(k))} − {dez(kum(a - 1))}</>,
          <>≈ {dez(wahrscheinlichkeit)}</>];
  }

  const chip = (aktiv, farbe) => ({
    flexShrink: 0, padding: "6px 11px", borderRadius: 999, border: `1px solid ${aktiv ? farbe : C.linie}`,
    background: aktiv ? `${farbe}12` : C.weiss, color: C.tinte, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
  });
  const aKnopf = {
    width: 26, height: 26, borderRadius: 7, border: `1px solid ${FARBEN.k}66`, background: `${FARBEN.k}14`, color: FARBEN.k,
    fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
  };

  // Gemeinsame Teile für Handy und Desktop
  const nWaehlen = (v) => { setN(v); const kk = Math.max(0, Math.min(v, Math.round(v * p))); setK(kk); setA(Math.max(0, Math.min(a, kk))); };
  const vorlageWaehlen = (v) => { setP(v.p); setBruch(alsBruch(v.p)); setTrefferName(v.text); };
  const einleitung = (
    <>
      <Vorwissen untertitel="Bernoulli-Kette, Formel und ein Beispiel"><BernoulliVorwissen /></Vorwissen>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Wie oft trifft der Zufall?
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Stell die Kernwerte der Bernoulli-Kette ein: <b style={{ color: FARBEN.n }}>n</b> Versuche,
        Trefferwahrscheinlichkeit <b style={{ color: FARBEN.p }}>p</b> und deinen Tipp <b style={{ color: FARBEN.k }}>k</b>.
        Die Binomialverteilung entsteht live – und im Experiment siehst du, ob der Zufall mitspielt.
      </p>
    </>
  );
  const modusKnoepfe = (spalten) => (
    <div style={{ display: "grid", gridTemplateColumns: spalten, gap: 6, margin: "12px 0 8px" }}>
      {MODI.map(([id, t]) => (
        <button key={id} onClick={() => setModus(id)} aria-pressed={modus === id}
          style={{ height: 36, borderRadius: 10, fontFamily: "inherit", cursor: "pointer", fontSize: 13.5, fontWeight: 700, padding: 0, whiteSpace: "nowrap",
            border: `1px solid ${modus === id ? C.see : C.linie}`, background: modus === id ? C.see : C.weiss,
            color: modus === id ? C.weiss : C.see }}>{t}</button>
      ))}
    </div>
  );
  const untereGrenze = modus === "zwischen" && (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: C.grau }}>untere Grenze <b style={{ color: FARBEN.k }}>a</b></span>
      <button aria-label="a verringern" style={aKnopf} onClick={() => setA(Math.max(0, a - 1))}>−</button>
      <span style={{ minWidth: 24, textAlign: "center", fontSize: 18, fontWeight: 800, color: FARBEN.k, fontVariantNumeric: "tabular-nums" }}>{a}</span>
      <button aria-label="a erhöhen" style={aKnopf} onClick={() => setA(Math.min(k, a + 1))}>+</button>
      <span style={{ fontSize: 12.5, color: C.hellgrau }}>obere Grenze ist k = {k}</span>
    </div>
  );
  const ergebnisZeile = (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
      <span style={{ fontSize: 15, color: C.grau }}>P(<b style={{ color: FARBEN.k }}>{ereignisText}</b> {trefferName === "Treffer" ? "Treffer" : `× ${trefferName}`})</span>
      <span style={{ fontSize: 30, fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>{prozent(wahrscheinlichkeit)}</span>
    </div>
  );
  const rechenweg = (
    <div style={{ background: C.sand, borderRadius: 12, padding: "10px 14px", marginTop: 8, overflowX: "auto" }}>
      {formel.map((z, i) => <Zeile key={i} stark={i === formel.length - 1}>{z}</Zeile>)}
    </div>
  );
  const tabelleTeil = (
    <>
      <button onClick={() => setTabelle((t) => !t)} aria-expanded={tabelle}
        style={{ marginTop: 8, background: "none", border: "none", padding: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: C.see, cursor: "pointer" }}>
        {tabelle ? "▾ Tabelle ausblenden" : "▸ Tabelle der Verteilung (wie im Tafelwerk)"}
      </button>
      {tabelle && <Tabelle n={n} p={p} drin={drin} />}
    </>
  );
  const kennzahlen = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 12 }}>
      {[
        ["Erwartungs­wert", "$μ = n · p$", dez(mu, 2)],
        ["Standardabw.", "$σ = \\sqrt{n · p · (1 − p)}$", dez(sigma, 2)],
        ["σ-Umgebung", `$[${sigVon}; ${sigBis}]$ · μ ± σ`, prozent(sigP)],
      ].map(([t, f, w], i) => (
        <button key={t} onClick={i === 2 ? () => { setModus("zwischen"); setA(sigVon); setK(sigBis); } : undefined}
          title={i === 2 ? "als Ereignis einstellen" : undefined}
          style={{ background: C.himmel, borderRadius: 12, padding: "8px 10px", textAlign: "left", border: "none", fontFamily: "inherit",
            cursor: i === 2 ? "pointer" : "default", minWidth: 0 }}>
          <p style={{ fontSize: 11, color: C.grau, fontWeight: 600 }}>{t}</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.see, whiteSpace: "nowrap" }}>{w}</p>
          <p style={{ fontSize: 10.5, color: C.hellgrau, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><MS s={f} /></p>
        </button>
      ))}
    </div>
  );
  const sigmaText = sigma > 3
    ? <>σ &gt; 3: Die Laplace-Bedingung ist erfüllt – die Verteilung lässt sich gut durch eine Normalverteilung annähern. Rund 68 % der Treffer liegen in μ ± σ.</>
    : <>σ ≤ 3: Für die Näherung durch die Normalverteilung ist die Kette noch zu kurz (Laplace-Bedingung σ &gt; 3). Tippe auf „σ-Umgebung“, um sie als Ereignis zu sehen.</>;
  const uebung = <Uebung n={n} p={p} pT={pT} menge={menge} einstellen={einstellen} />;
  const experimentText = (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 4 }}>Das Experiment</p>
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>
        {n} Versuche, jeder mit der Trefferwahrscheinlichkeit <Wert t={pT} farbe={FARBEN.p} klammer={false} />. Bingo gibt es bei <b>{ereignisText}</b> Treffer{k === 1 && modus === "gleich" ? "" : "n"}.
      </p>
    </>
  );
  const kacheln = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${n <= 10 ? n : n <= 40 ? 10 : 20}, minmax(0, 1fr))`, gap: n > 40 ? 2 : 5, marginBottom: 12 }}>
      {Array.from({ length: n }, (_, i) => {
        const offen = ergebnis && i < sichtbar;
        const t = offen && ergebnis[i];
        return (
          <div key={i} style={{ aspectRatio: "1 / 1", minWidth: 0, overflow: "hidden", borderRadius: n > 40 ? 4 : 9, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: n > 40 ? "clamp(7px, 2.2vw, 10px)" : 15, letterSpacing: n > 40 ? "-0.04em" : undefined, fontWeight: 800, transition: "all .15s",
            background: !offen ? C.sand : t ? C.flaggold : "#E6EAF2", color: t ? C.seeTief : C.hellgrau,
            border: `1.5px solid ${!offen ? C.linie : t ? "#B38D00" : C.linie}`, transform: offen ? "scale(1)" : "scale(0.94)" }}>
            {offen ? (t ? "✓" : "·") : i + 1}
          </div>
        );
      })}
    </div>
  );
  const trefferZeile = (
    <>
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
    </>
  );
  const startKnopf = (
    <button onClick={starten} disabled={laeuft}
      style={{ width: "100%", height: 54, borderRadius: 14, border: "none", cursor: laeuft ? "wait" : "pointer", fontFamily: "inherit",
        fontSize: 17, fontWeight: 800, color: C.weiss, background: C.gruen, boxShadow: "0 4px 14px rgba(185,138,0,0.3)", opacity: laeuft ? 0.7 : 1 }}>
      {laeuft ? "Läuft …" : ergebnis ? "Nochmal!" : "Experiment starten"}
    </button>
  );
  // untereinander: schmale Spalte am Desktop
  const simKnoepfe = (untereinander) => (
    <div style={{ display: "flex", flexDirection: untereinander ? "column" : "row", gap: 8, marginTop: 8 }}>
      {[10, 100, 1000].map((m) => (
        <button key={m} onClick={() => vielmals(m)}
          style={{ flex: untereinander ? "none" : 1, height: 40, borderRadius: 12, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see,
            fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", padding: 0 }}>{m}× simulieren</button>
      ))}
    </div>
  );
  const simStand = sim.gesamt > 0 && (
    <div style={{ marginTop: 14, background: C.sand, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, color: C.grau }}>Durchgänge: <b style={{ color: C.tinte }}>{sim.gesamt}</b></span>
        <span style={{ fontSize: 13.5, color: C.grau }}>Bingos: <b style={{ color: C.gruen }}>{bingos}</b></span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <span style={{ fontSize: 13.5, color: C.grau }}>relative Häufigkeit: <b style={{ color: C.tinte }}>{prozent(bingos / sim.gesamt)}</b></span>
        <span style={{ fontSize: 13.5, color: C.grau }}>Theorie: <b style={{ color: C.tinte }}>{prozent(wahrscheinlichkeit)}</b></span>
      </div>
      <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: C.linie, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(100, wahrscheinlichkeit * 100)}%`, background: `${C.flaggold}66` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${Math.min(100, (bingos / sim.gesamt) * 100)}%`, width: 2, background: C.see, transform: "translateX(-1px)" }} />
      </div>
      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.55, marginTop: 8 }}>
        Abweichung: <b style={{ color: C.tinte }}>{(Math.abs(bingos / sim.gesamt - wahrscheinlichkeit) * 100).toFixed(2).replace(".", ",")} Prozentpunkte</b>.
        Die blauen Striche im Diagramm zeigen die simulierten Häufigkeiten. Je mehr Durchgänge, desto näher liegen sie an
        den Säulen – das Gesetz der großen Zahlen.
      </p>
    </div>
  );
  const hilfeZeile = (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
      <IchHaengeFest kontext={bernoulliHilfe(n, pT, k, modus, a)} />
    </div>
  );
  const weiterMit = n >= 5 && p > 0 && p < 1 && (
    <WeiterMit titel={`Weiter mit B(${n}; ${pS(pT)})`}>
      <WeiterKnopf ziel="hypothesentest" von="Bernoulli-Kette" daten={{ n, p }}
        zeile={`Ablehnungsbereich für H₀: p ≤ ${pS(pT)} bei n = ${n} und α = 5 % finden`} />
      {sigma > 3 && (
        <WeiterKnopf ziel="normalverteilung" von="Bernoulli-Kette" daten={{ n, p }}
          zeile={`Dieselbe Verteilung (μ = ${dez(mu, 2)}, σ = ${dez(sigma, 2)}) mit der Glockenkurve vergleichen`} />
      )}
    </WeiterMit>
  );
  const SAETZE = [
    ["Bernoulli-Versuch", "hat genau zwei Ausgänge: Treffer (Wahrscheinlichkeit p) oder Niete (1 − p)."],
    ["Bernoulli-Kette", "n-mal unabhängig wiederholt, p bleibt immer gleich. X zählt die Treffer und ist binomialverteilt: X ∼ B(n; p)."],
    ["Bernoulli-Formel", "P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ – (n über k) zählt die Pfade mit genau k Treffern."],
    ["Übersetzen", "„mindestens k“ ist X ≥ k, „mehr als k“ ist X ≥ k + 1, „höchstens k“ ist X ≤ k, „weniger als k“ ist X ≤ k − 1. „Mindestens“ geht fast immer über das Gegenereignis."],
  ];
  const satz = ([t, s0]) => (
    <p key={t} style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}>
      <b style={{ color: C.tinte }}>{t}:</b> {s0}
    </p>
  );

  /* ---------- Desktop: Kette links, Verteilung rechts, Rechenweg und Experiment darunter ---------- */
  if (desktop) {
    const HW = histoBreite || 420;
    return (
      <div className="mx-auto px-6 pb-16" data-bk="breit" style={{ maxWidth: 620, paddingTop: 30 }}>
        <div>{einleitung}</div>
        <Arbeitsflaeche
          links={<>
            <KettenKarte n={n} p={p} k={k} setN={setN} setP={setP} setK={setK} pT={pT} bruch={bruch} setBruch={setBruch} />
            <FeinKarte data-bk-ereignis>
              <p style={{ ...titelStil, marginBottom: 0 }}>Ereignis</p>
              {modusKnoepfe("repeat(2, minmax(0, 1fr))")}
              {untereGrenze}
              <div style={{ height: 1, background: C.linie, margin: "6px 0 4px" }} />
              {ergebnisZeile}
            </FeinKarte>
          </>}
          rechts={<>
            <BildKarte>
              <div style={{ padding: "14px 14px 12px" }}>
                <div ref={histoRef}>
                  <Histogramm n={n} p={p} drin={drin} k={k} simuliert={sim} letzter={fertig ? treffer : null} breite={HW} hoehe={Math.round(HW * 0.66)} />
                </div>
                <div style={{ marginTop: 6 }}><Legende mitSim={sim.gesamt > 0} /></div>
              </div>
            </BildKarte>
            <Werkzeugleiste gruppen={[
              { titel: "Anzahl der Versuche", inhalt: (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {N_CHIPS.map((v) => <button key={v} onClick={() => nWaehlen(v)} aria-label={`n = ${v}`} style={chipStil(n === v, FARBEN.n)}>{v}</button>)}
                </div>
              ) },
              { titel: "Trefferwahrscheinlichkeit", inhalt: (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {VORLAGEN.map((v) => <button key={v.name} onClick={() => vorlageWaehlen(v)} style={{ ...chipStil(Math.abs(p - v.p) < 1e-9, FARBEN.p), color: Math.abs(p - v.p) < 1e-9 ? C.weiss : C.tinte }}><MS s={v.name} /></button>)}
                </div>
              ) },
            ]} />
          </>} />

        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          <ErgebnisReihe spalten="minmax(0, 1fr) minmax(0, 1fr)" style={{ alignItems: "stretch" }}>
            <FeinKarte data-bk-rechenweg>
              <p style={{ ...titelStil, marginBottom: 2 }}>Rechenweg</p>
              {rechenweg}
              {tabelleTeil}
            </FeinKarte>
            <FeinKarte data-bk-kennzahlen>
              <p style={{ ...titelStil, marginBottom: 0 }}>Kennzahlen der Verteilung</p>
              {kennzahlen}
              <p style={{ ...hinweisStil, marginTop: 10 }}>{sigmaText}</p>
            </FeinKarte>
          </ErgebnisReihe>

          <FeinKarte>{uebung}</FeinKarte>

          <FeinKarte data-bk-experiment>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 300px)", columnGap: 28, alignItems: "start" }}>
            <div style={{ minWidth: 0 }}>
              {experimentText}
              {kacheln}
              {trefferZeile}
            </div>
            <div style={{ minWidth: 0, borderLeft: `2px solid ${C.linie}`, paddingLeft: 20 }}>
              {startKnopf}
              {simKnoepfe(true)}
              {simStand}
            </div>
          </div>
          </FeinKarte>
        </div>

        {hilfeZeile}
        <div>{weiterMit}</div>

        <div style={{ marginTop: 16 }}>
          <FeinKarte>
            <p style={titelStil}>Die Bernoulli-Kette in vier Sätzen</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 28 }}>{SAETZE.map(satz)}</div>
          </FeinKarte>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {einleitung}

      {/* Einstellungen + Verteilung */}
      <div style={karte}>
        <Kopf n={n} p={p} k={k} setN={setN} setP={setP} setK={setK} pT={pT} qT={qT} bruch={bruch} setBruch={setBruch} />
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "8px 0 4px", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: FARBEN.n, flexShrink: 0 }}>n</span>
          {N_CHIPS.map((v) => (
            <button key={v} onClick={() => nWaehlen(v)}
              aria-label={`n = ${v}`} style={chip(n === v, FARBEN.n)}>{v}</button>
          ))}
          <span style={{ width: 1, height: 22, background: C.linie, flexShrink: 0, margin: "0 2px" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: FARBEN.p, flexShrink: 0 }}>p</span>
          {VORLAGEN.map((v) => (
            <button key={v.name} onClick={() => vorlageWaehlen(v)}
              style={chip(Math.abs(p - v.p) < 1e-9, FARBEN.p)}><MS s={v.name} /></button>
          ))}
        </div>
        <Histogramm n={n} p={p} drin={drin} k={k} simuliert={sim} letzter={fertig ? treffer : null} />
        <Legende mitSim={sim.gesamt > 0} />

        {modusKnoepfe("repeat(4, minmax(0, 1fr))")}
        {untereGrenze}

        {ergebnisZeile}
        {rechenweg}
        {tabelleTeil}

        {kennzahlen}
        <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.5, marginTop: 8 }}>
          {sigmaText}
        </p>
      </div>

      {/* Übung */}
      <div style={{ ...karte, marginTop: 16 }}>
        {uebung}
      </div>

      {/* Experiment */}
      <div style={{ ...karte, marginTop: 16 }}>
        {experimentText}
        {kacheln}
        {trefferZeile}
        {startKnopf}
        {simKnoepfe(false)}
        {simStand}
      </div>

      {hilfeZeile}

      {weiterMit}

      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Die Bernoulli-Kette in vier Sätzen</p>
        {SAETZE.map(satz)}
      </div>
    </div>
  );
}

/* ---------- Übersicht ---------- */

/* Die Werkzeuge stehen jetzt in werkzeuge.js (Stationen) */

export function StochastikZentrum({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 className="intro-h2" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        <span className="titel-lang">Zufall zum Anfassen</span><span className="titel-kurz">Spiel mit dem Zufall</span>
      </h2>
      <p className="intro-p" style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        <span className="titel-lang">Wahrscheinlichkeiten werden greifbar, wenn man den Zufall selbst laufen lässt. Hier rechnest du nicht nur – du
        siehst, was die Formeln vorhersagen.</span>
        <span className="titel-kurz">Lass tausend Versuche in Sekunden laufen und sieh live, wie die Formel recht behält. Probier’s aus!</span>
      </p>
      <ZentrumListe bereichId="stochastik" gehe={gehe} />
      <GesperrteKurse ids={["stochastik"]} ueberschrift="Der Stochastik-Kurs" />
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
