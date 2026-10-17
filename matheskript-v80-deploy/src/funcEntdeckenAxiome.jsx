import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { GrosserKnopf, KleinerLink, Rueck, karte } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, SchrittFolge } from "./ui3.jsx";
import {
  AXIOM_PHASEN_ANZAHL, axiomeFertigSetzen, axiomePhaseSetzen, axiomeStandSetzen, axiomeZuruecksetzen, entdeckenStand,
} from "./entdeckenSpeicher.js";
import {
  AXIOME, BEISPIELE_ERWEITERN, BEISPIELE_KUERZEN, BEISPIEL_GLEICHUNG, BEWEIS_BINOM1, BEWEIS_BINOM2, BEWEIS_BINOM3, BEWEIS_EINDEUTIG,
  BEWEIS_KEIN_INVERSES, BEWEIS_KUERZEN, BEWEIS_MAL_NULL, BEWEIS_PLUS_MAL_MINUS, MAL_GESETZE, NICHT_ASSOZIATIV, PLUS_GESETZE,
  UMSCHREIBUNGEN, distribut, ergaenzung, inversen, mz, schoen, verkleideteEins, verkleideteNull, verkleidungen,
} from "./axiome.js";

/* ======================================================================
   AXIOME – DAS FUNDAMENT DER MATHEMATIK  (Mathe entdecken, Lernangebot 1)
   Zehn Phasen, jede mit Einführung, Schaubild/Beispiel zum Ausprobieren und geführten Schritten
   (gleiche Bausteine wie das Potenzregel-Modul):
     1  Warum Axiome?
     2  Die Addition – vier Gesetze (Neutrales Element 0)
     3  Die Multiplikation – dieselben vier Gesetze (Neutrales Element 1)
     4  Das Distributivgesetz – die Brücke zwischen + und ·
     5  Neutrale Elemente: 0 und 1 – Kürzen, Erweitern, quadratische Ergänzung
     6  Inverse Elemente: Es gibt nur zwei Rechenarten
     7  Beweis 1: a · 0 = 0
     8  Beweis 2: Es gibt kein 1/0
     9  Beweis 3: Die erste binomische Formel
    10  Beweis 4: Minus mal Plus – zweite und dritte binomische Formel
   Farbcode durchgehend: Addition = blau, Multiplikation = Grana-Rot, Distributivgesetz = Gold.
   Mathematik und Inhalte stehen in axiome.js und werden in tests/axiome.test.mjs nachgerechnet.
   ====================================================================== */

/* Text mit Formeln zwischen $ … $ */
const T = ({ s }) => (
  <>{String(s).split("$").map((x, i) => (i % 2 ? <M key={i} t={mz(x)} /> : <span key={i}>{x}</span>))}</>
);
const o = (id, s) => [id, <T key={id} s={s} />];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mische = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const runde = (v) => Math.round(v * 1e9) / 1e9;

const FARBE = {
  plus: { bg: "#D6E4F7", rand: C.see, text: C.seeTief, name: "Addition" },
  mal: { bg: "#F7D3E0", rand: C.gruen, text: "#6E0F30", name: "Multiplikation" },
  dist: { bg: "#FFF1BF", rand: C.flaggold, text: "#6B5200", name: "Distributivgesetz" },
};
const KLASSE = { eins: FARBE.mal, null: FARBE.plus, dist: FARBE.dist };

/* ---------- kleine Bausteine ---------- */
const formelTex = (t) => mz(/\\text/.test(t) ? t : schoen(t));

/* Eine Formelzeile aus Segmenten; hervorgehobene Stellen (k = eins | null | dist) bekommen ihre Farbe */
function Segs({ seg }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", columnGap: "0.28em", rowGap: 2 }}>
      {seg.map((s, i) => (typeof s === "string"
        ? <M key={i} t={formelTex(s)} />
        : (
          <span key={i} style={{ background: KLASSE[s.k].bg, boxShadow: `inset 0 0 0 1.5px ${KLASSE[s.k].rand}`, borderRadius: 7, padding: "1px 6px", margin: "0 1px", color: KLASSE[s.k].text }}>
            <M t={formelTex(s.t)} />
          </span>
        )))}
    </span>
  );
}

/* Rechenweg: je Zeile die Formel und darunter, was erlaubt hat, sie so umzuformen */
function Rechenweg({ zeilen, mitNummer = false }) {
  return (
    <div style={{ marginTop: 10 }}>
      {zeilen.map((z, i) => (
        <div key={i} style={{ padding: "9px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
          <div style={{ fontSize: 17, lineHeight: 1.95, color: C.tinte, overflowX: "auto", paddingBottom: 1 }}>
            {mitNummer && <span style={{ fontSize: 12, fontWeight: 700, color: C.grau, marginRight: 8 }}>{i + 1}</span>}
            <Segs seg={z.seg} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.5 }}><T s={z.grund} /></div>
        </div>
      ))}
    </div>
  );
}

const Aufforderung = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px", lineHeight: 1.5 }}>{children}</p>;
const BildKarte = ({ children, style }) => <div style={{ ...karte, padding: 16, marginTop: 14, ...style }}>{children}</div>;
const Kicker = ({ children }) => <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 8px" }}>{children}</p>;
const Absatz = ({ children, style }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0, ...style }}>{children}</p>;

function Marke({ art, children }) {
  const f = FARBE[art];
  return <span style={{ display: "inline-block", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 7, background: f.bg, color: f.text, boxShadow: `inset 0 0 0 1px ${f.rand}` }}>{children}</span>;
}

function Zaehler({ label, wert, setWert, min, max, anzeige }) {
  const knopf = (t, d, lab) => (
    <button type="button" aria-label={lab} disabled={wert + d < min || wert + d > max} onClick={() => setWert(wert + d)}
      style={{ width: 44, height: 44, borderRadius: 12, border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, fontSize: 20, fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer", opacity: wert + d < min || wert + d > max ? 0.35 : 1 }}>{t}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.grau, minWidth: 14 }}>{label}</span>
      {knopf("−", -1, `${label} verkleinern`)}
      <span style={{ minWidth: 30, textAlign: "center", fontSize: 17, fontWeight: 700, color: C.tinte }}>{mz(anzeige ?? wert)}</span>
      {knopf("+", 1, `${label} vergrößern`)}
    </div>
  );
}

/* ---------- Phase 1: Fundament-Bild ---------- */
function Fundament() {
  const ebene = (y, breite, fuell, text, titel, unter, hell) => (
    <g>
      <rect x={160 - breite / 2} y={y} width={breite} height="42" rx="10" fill={fuell} />
      <text x="160" y={y + 18} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={hell ? C.weiss : C.tinte}>{titel}</text>
      <text x="160" y={y + 34} textAnchor="middle" fontSize="10.5" fill={hell ? "#C9D6EE" : C.grau}>{unter}</text>
    </g>
  );
  return (
    <BildKarte>
      <Aufforderung>Alles Rechnen steht auf wenigen Regeln – wie ein Haus auf seinem Fundament.</Aufforderung>
      <svg viewBox="0 0 320 196" role="img" aria-label="Pyramide: unten die Axiome, darüber Folgerungen, Schulmathematik und Analysis" style={{ width: "100%", maxWidth: 380, display: "block", margin: "0 auto" }}>
        {ebene(148, 300, C.seeTief, "", "Axiome", "wenige Regeln für Plus und Mal", true)}
        {ebene(100, 262, C.see, "", "Folgerungen", "a · 0 = 0 · binomische Formeln · Brüche", true)}
        {ebene(52, 214, "#D6E4F7", "", "Schulmathematik", "Gleichungen · Funktionen · Geometrie", false)}
        {ebene(4, 160, C.flaggold, "", "Analysis", "Ableitung · Integral", false)}
        <path d="M 14 150 L 14 100" stroke={C.gruen} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "10px 0 0", textAlign: "center" }}>
        Je tiefer eine Ebene liegt, desto weniger muss man glauben – und desto mehr trägt sie.
      </p>
    </BildKarte>
  );
}

/* ---------- Phase 2/3: Gesetze zum Ausprobieren ---------- */
const ZEIGE = (v) => mz(String(runde(v)));
function GesetzTafel({ art }) {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(5);
  const gesetze = art === "plus" ? PLUS_GESETZE : MAL_GESETZE;
  const f = FARBE[art];
  return (
    <BildKarte>
      <Aufforderung>Wähle drei Zahlen und sieh dir jedes Gesetz an einer Probe an. Eine Probe zeigt, wie ein Gesetz aussieht – sie ist kein Beweis.</Aufforderung>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={9} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={9} />
        <Zaehler label="c" wert={c} setWert={setC} min={1} max={9} />
      </div>
      {gesetze.map((g) => {
        const [l, r] = g.zeige(a, b, c);
        const [lw] = g.pruefe(a, b, c);
        const probe = r === String(lw) ? `${l} = ${r}` : `${l} = ${r} = ${ZEIGE(lw)}`;
        return (
          <div key={g.kz} style={{ marginTop: 10, padding: "10px 12px", borderRadius: 14, background: g.neutral ? f.bg : C.weiss, border: `1.5px solid ${g.neutral ? f.rand : C.linie}`, borderLeft: `5px solid ${f.rand}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Marke art={art}>{g.kz}</Marke>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{g.name}</span>
            </div>
            <div style={{ fontSize: 18, margin: "6px 0 2px", color: C.tinte, overflowX: "auto" }}><M t={formelTex(g.tex)} /></div>
            <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55, margin: "0 0 6px" }}>{g.text}</p>
            <div style={{ fontSize: 14.5, color: f.text, background: g.neutral ? "rgba(255,255,255,0.6)" : f.bg, borderRadius: 9, padding: "4px 10px", display: "inline-block", maxWidth: "100%", overflowX: "auto" }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, marginRight: 8 }}>Probe</span><M t={formelTex(probe)} />
            </div>
          </div>
        );
      })}
    </BildKarte>
  );
}

/* Vergleich Plus ↔ Mal */
function Vergleich() {
  const zeilen = [
    ["Assoziativgesetz", "(a+b)+c = a+(b+c)", "(a\\cdot b)\\cdot c = a\\cdot(b\\cdot c)", false],
    ["Kommutativgesetz", "a+b = b+a", "a\\cdot b = b\\cdot a", false],
    ["Neutrales Element", "0:   a+0 = a", "1:   a\\cdot 1 = a", true],
    ["Inverses Element", "-a:   a+(-a) = 0", "\\frac{1}{a}:   a\\cdot\\frac{1}{a} = 1  (a ≠ 0)", false],
    ["Rückwärts rechnen", "Subtraktion", "Division", false],
  ];
  return (
    <BildKarte>
      <Aufforderung>Derselbe Bauplan, zwei Rechenarten:</Aufforderung>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: FARBE.plus.bg, color: FARBE.plus.text, borderRadius: 10, padding: "6px 10px", fontSize: 13.5, fontWeight: 800, textAlign: "center" }}>Addition (+)</div>
        <div style={{ background: FARBE.mal.bg, color: FARBE.mal.text, borderRadius: 10, padding: "6px 10px", fontSize: 13.5, fontWeight: 800, textAlign: "center" }}>Multiplikation (·)</div>
        {zeilen.map(([name, p, m, neutral]) => (
          <React.Fragment key={name}>
            <p style={{ gridColumn: "1 / -1", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: neutral ? C.gruenDunkel : C.grau, margin: "8px 0 0" }}>{name}</p>
            {[[p, "plus"], [m, "mal"]].map(([t, art]) => (
              <div key={art} style={{ fontSize: 14, minWidth: 0, overflowX: "auto", padding: "6px 8px", borderRadius: 10, background: neutral ? FARBE[art].bg : C.weiss,
                border: `1.5px solid ${neutral ? FARBE[art].rand : C.linie}`, display: "flex", alignItems: "center" }}>
                {name === "Rückwärts rechnen" ? <span style={{ fontWeight: 600 }}>{t === "Subtraktion" ? "Subtraktion: a − b" : "Division: a : b"}</span> : <M t={formelTex(t)} />}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "12px 0 0" }}>
        Die beiden Rechenarten wissen noch nichts voneinander. Erst das Distributivgesetz verbindet sie.
      </p>
    </BildKarte>
  );
}

/* ---------- Phase 4: Distributivgesetz als Rechteck ---------- */
function DistBild() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(2);
  const d = distribut(a, b, c);
  const s = Math.min(250 / (b + c), 150 / a), x0 = 34, y0 = 34;
  const w1 = b * s, w2 = c * s, h = a * s;
  const feld = (x, w, fuell, rand, name, wert) => (
    <g>
      <rect x={x0 + x} y={y0} width={w} height={h} fill={fuell} stroke={rand} strokeWidth="1.8" />
      <text x={x0 + x + w / 2} y={y0 + h / 2 - 2} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.tinte}>{name}</text>
      <text x={x0 + x + w / 2} y={y0 + h / 2 + 15} textAnchor="middle" fontSize="12" fill={C.grau}>{wert}</text>
    </g>
  );
  return (
    <BildKarte>
      <Aufforderung>Das Rechteck hat die Höhe a und die Breite b + c. Verändere a, b und c – die Gesamtfläche und die beiden Teilflächen bleiben im Einklang.</Aufforderung>
      <svg viewBox="0 0 320 210" role="img" aria-label="Rechteck mit Höhe a und Breite b plus c, in zwei Teilrechtecke zerlegt" style={{ width: "100%", maxWidth: 380, display: "block", margin: "0 auto" }}>
        {feld(0, w1, FARBE.plus.bg, C.see, "a · b", d.teil1)}
        {feld(w1, w2, FARBE.mal.bg, C.gruen, "a · c", d.teil2)}
        <text x={x0 + w1 / 2} y={y0 - 12} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.see}>b</text>
        <text x={x0 + w1 + w2 / 2} y={y0 - 12} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.gruen}>c</text>
        <text x={x0 - 12} y={y0 + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.tinte}>a</text>
        <path d={`M ${x0} ${y0 + h + 14} H ${x0 + w1 + w2}`} stroke={C.tinte} strokeWidth="1.4" />
        <path d={`M ${x0} ${y0 + h + 9} V ${y0 + h + 19} M ${x0 + w1 + w2} ${y0 + h + 9} V ${y0 + h + 19}`} stroke={C.tinte} strokeWidth="1.4" />
        <text x={x0 + (w1 + w2) / 2} y={y0 + h + 34} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.tinte}>b + c = {b + c}</text>
      </svg>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 10 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={6} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={6} />
        <Zaehler label="c" wert={c} setWert={setC} min={1} max={6} />
      </div>
      <div style={{ textAlign: "center", fontSize: 16.5, marginTop: 12, overflowX: "auto", color: C.tinte }}>
        <M t={`${a}\\cdot(${b}+${c}) = ${a}\\cdot ${b} + ${a}\\cdot ${c} = ${d.teil1} + ${d.teil2} = ${d.gesamt}`} />
      </div>
    </BildKarte>
  );
}

/* ---------- Phase 5: Verkleidungen, Beispiele ---------- */
function VerkleidungsLabor() {
  const [n, setN] = useState(5);
  const v = verkleidungen(n);
  const chip = (t, art, i) => (
    <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 10, background: FARBE[art].bg, boxShadow: `inset 0 0 0 1.5px ${FARBE[art].rand}`, color: FARBE[art].text, fontSize: 16 }}>
      <M t={formelTex(t)} />
    </span>
  );
  return (
    <BildKarte>
      <Kicker>Die beiden Verkleidungskünstler</Kicker>
      <Aufforderung>Die 1 und die 0 verändern den Wert nie – aber ihr Aussehen kannst du frei wählen. Wähle eine Zahl n.</Aufforderung>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Zaehler label="n" wert={n} setWert={setN} min={2} max={9} /></div>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: FARBE.mal.text, margin: "0 0 6px" }}>Die 1 (neutral bei ·) – so kann sie aussehen:</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        {v.eins.map((t, i) => chip(t, "mal", i))}
      </div>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: FARBE.plus.text, margin: "0 0 6px" }}>Die 0 (neutral bei +) – so kann sie aussehen:</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        {v.null.map((t, i) => chip(t, "plus", i))}
      </div>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 0 2px" }}>Und so benutzt du sie, ohne etwas zu verändern:</p>
      <Rechenweg zeilen={[
        { seg: ["\\frac{a}{b}=\\frac{a}{b}\\cdot", { t: `\\frac{${n}}{${n}}`, k: "eins" }, `=\\frac{${n}a}{${n}b}`], grund: `Mit 1 multiplizieren: $\\frac{${n}}{${n}} = 1$ – das ist Erweitern (neutrales Element M3)` },
        { seg: ["x=x+", { t: `(${n}-${n})`, k: "null" }, `=(x+${n})-${n}`], grund: `0 addieren: ${n} − ${n} = 0 – das ist Ergänzen (neutrales Element A3)` },
      ]} />
    </BildKarte>
  );
}

function BeispielKarte({ kopf, kicker, children }) {
  return (
    <BildKarte>
      <Kicker>{kicker}</Kicker>
      <p style={{ fontSize: 16.5, fontWeight: 700, color: C.tinte, margin: "0 0 4px", lineHeight: 1.35 }}>{kopf}</p>
      {children}
    </BildKarte>
  );
}

function BeispielKuerzen() {
  const [id, setId] = useState("k1");
  const bsp = BEISPIELE_KUERZEN.find((x) => x.id === id);
  return (
    <BeispielKarte kicker="Beispiel 1" kopf="Kürzen: Was passiert wirklich?">
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, margin: "0 0 10px" }}>
        Beim Kürzen „streichst“ du nichts weg. Du zerlegst den Bruch so, dass eine <b style={{ color: FARBE.mal.text }}>1</b> entsteht – und die verschwindet dank <M t="1\cdot x = x" />.
      </p>
      <ModusLeiste label="Beispiel wählen" modi={[["k1", "2a / 2b"], ["k2", "6x / 9"], ["k3", "(x² − x) / x"]]} modus={id} setModus={setId} />
      <Rechenweg zeilen={bsp.zeilen} />
      {bsp.ausnahme && (
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "8px 0 0" }}>
          Voraussetzung: <b style={{ color: C.tinte }}>{bsp.ausnahme}</b>. <T s="Für x = 0 gäbe es kein Inverses, also auch kein $\frac{x}{x} = 1$ – Beweis 2 erklärt, warum." />
        </p>
      )}
      <Aufklapp titel="Genauer hingeschaut: Warum zerfällt der Bruch so?">
        <p style={{ margin: "0 0 4px", color: C.grau, fontSize: 13.5 }}>
          <T s="Der Schritt $\frac{2a}{2b} = \frac{2}{2} \cdot \frac{a}{b}$ ist selbst aus den Axiomen ableitbar (für a, b ≠ 0):" />
        </p>
        <Rechenweg zeilen={BEWEIS_KUERZEN.zeilen} />
      </Aufklapp>
    </BeispielKarte>
  );
}

function BeispielErweitern() {
  const [id, setId] = useState("e1");
  const bsp = BEISPIELE_ERWEITERN.find((x) => x.id === id);
  return (
    <BeispielKarte kicker="Beispiel 2" kopf="Erweitern: Mit einer 1 multiplizieren">
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, margin: "0 0 10px" }}>
        Das Gegenstück zum Kürzen. Du multiplizierst mit einer <b style={{ color: FARBE.mal.text }}>1</b> in Verkleidung – der Wert bleibt, das Aussehen passt danach besser.
      </p>
      <ModusLeiste label="Beispiel wählen" modi={[["e1", "1/3 + 1/4"], ["e2", "1/√2"]]} modus={id} setModus={setId} />
      <Rechenweg zeilen={bsp.zeilen} />
    </BeispielKarte>
  );
}

function BeispielErgaenzung() {
  const [k, setK] = useState(3);
  const b = 2 * k;
  const e = ergaenzung(b);
  return (
    <BeispielKarte kicker="Beispiel 3" kopf="Quadratische Ergänzung: Eine 0 addieren">
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, margin: "0 0 4px" }}>
        Du löst <M t={mz("x^2 + 6x = 7")} />. Links fehlt ein „+ 9“, damit ein Binom entsteht. Du fügst es ein – aber ohne den Wert zu ändern. Dafür addierst du eine <b style={{ color: FARBE.plus.text }}>0</b>: 9 − 9.
      </p>
      <Rechenweg zeilen={BEISPIEL_GLEICHUNG.zeilen} />
      <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6, margin: "6px 0 0" }}>
        Daraus folgt <M t={mz("x+3 = 4")} /> oder <M t={mz("x+3 = -4")} />, also <b>x = 1</b> oder <b>x = −7</b>.
      </p>

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.linie}` }}>
        <Aufforderung>Probiere es selbst: Wähle den Faktor b vor dem x und sieh dir die ergänzte 0 an.</Aufforderung>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <Zaehler label="b" wert={k} setWert={(v) => setK(v === 0 ? (v > k ? 1 : -1) : v)} min={-7} max={7} anzeige={b} />
        </div>
        <Rechenweg zeilen={e.zeilen} />
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "6px 0 0" }}>
          Die ergänzte Zahl ist immer das Quadrat der halben Zahl vor dem x: <M t={mz(`(${b}/2)^2 = ${e.h * (b > 0 ? 1 : -1)}^2 = ${e.q}`)} />. Addiert und gleich wieder subtrahiert – also insgesamt 0.
        </p>
      </div>
    </BeispielKarte>
  );
}

function Fazit() {
  const punkt = (art, text) => (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 8 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 12, height: 12, borderRadius: 4, marginTop: 6, background: FARBE[art].bg, boxShadow: `inset 0 0 0 2px ${FARBE[art].rand}` }} />
      <span style={{ fontSize: 14.5, lineHeight: 1.6, color: C.tinte }}>{text}</span>
    </li>
  );
  return (
    <BildKarte style={{ borderLeft: `4px solid ${C.flaggold}`, background: `linear-gradient(180deg, ${C.weiss} 0%, ${C.himmel} 100%)` }}>
      <Kicker>Was fällt auf?</Kicker>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {punkt("mal", <T s="Beim Kürzen steckt eine $1$ im Term: $\frac{2}{2}\cdot x = 1\cdot x = x$." />)}
        {punkt("mal", <T s="Beim Erweitern wird mit einer $1$ multipliziert: $\frac{4}{4}$, $\frac{3}{3}$, $\frac{\sqrt{2}}{\sqrt{2}}$." />)}
        {punkt("plus", <T s="Bei der quadratischen Ergänzung wird eine $0$ addiert: $9-9$." />)}
      </ul>
      <p style={{ fontSize: 15, fontWeight: 600, color: C.tinte, lineHeight: 1.65, margin: "14px 0 0" }}>
        Das ist der Kern des Umformens: Du darfst jeden Term mit einer <span style={{ color: FARBE.mal.text }}>1</span> multiplizieren und zu jedem Term eine <span style={{ color: FARBE.plus.text }}>0</span> addieren – in jeder Verkleidung, die dir nützt (<M t="\frac{5}{5}" />, <M t="\frac{x+1}{x+1}" />, <M t="9-9" />, <M t="x-x" />).
        Alles andere ist nur Umsortieren mit Assoziativ-, Kommutativ- und Distributivgesetz.
      </p>
      <Aufklapp titel="Genauer hingeschaut: Terme und Gleichungen">
        <p style={{ margin: "0 0 8px" }}>
          Für <b>Terme</b> stimmt das ohne Einschränkung: Wert ändern darfst du nur, indem du eine 1 hineinmultiplizierst oder eine 0 hineinaddierst. Dabei muss die 1 wirklich eine 1 sein: <M t="\frac{x}{x}" /> ist nur für x ≠ 0 eine 1.
        </p>
        <p style={{ margin: 0 }}>
          Bei <b>Gleichungen</b> kommt eine Regel über das Gleichheitszeichen selbst dazu: Ist <M t="a = b" />, dann ist auch <M t="a + c = b + c" /> und <M t="a\cdot c = b\cdot c" />. Das ist keine Rechenregel für Zahlen, sondern für „=“. In der quadratischen Ergänzung siehst du beides: Links fügst du <M t="9-9" /> ein (eine 0), und die zweite 9 bringst du auf die andere Seite, indem du auf beiden Seiten 9 addierst.
        </p>
      </Aufklapp>
    </BildKarte>
  );
}

/* ---------- Phase 6: Inverse Elemente ---------- */
function InversenLabor() {
  const [a, setA] = useState(7);
  const v = inversen(a);
  const betrag = Math.abs(a);
  const addTex = a >= 0 ? `${a}+(-${a}) = 0` : `(-${betrag})+${betrag} = 0`;
  const malTex = a > 0 ? `${a}\\cdot\\frac{1}{${a}} = 1` : `(-${betrag})\\cdot(-\\frac{1}{${betrag}}) = 1`;
  return (
    <BildKarte>
      <Kicker>Inverse Elemente finden</Kicker>
      <Aufforderung>Wähle eine Zahl a. Zu jeder Zahl gehört ein Gegenstück, das zum neutralen Element führt.</Aufforderung>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Zaehler label="a" wert={a} setWert={setA} min={-9} max={9} /></div>
      <div style={{ padding: "10px 12px", borderRadius: 14, background: FARBE.plus.bg, boxShadow: `inset 0 0 0 1.5px ${FARBE.plus.rand}`, color: FARBE.plus.text }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>Additiv: Ziel ist die 0</p>
        <div style={{ fontSize: 17, overflowX: "auto" }}><M t={mz(addTex)} /></div>
        <p style={{ fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>Das Inverse von {mz(a)} ist <b>{mz(v.neg)}</b>.</p>
      </div>
      <div style={{ padding: "10px 12px", borderRadius: 14, marginTop: 10, background: FARBE.mal.bg, boxShadow: `inset 0 0 0 1.5px ${FARBE.mal.rand}`, color: FARBE.mal.text }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>Multiplikativ: Ziel ist die 1</p>
        {v.kehrExistiert ? (
          <>
            <div style={{ fontSize: 17, overflowX: "auto" }}><M t={mz(malTex)} /></div>
            <p style={{ fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>Das Inverse von {mz(a)} ist <M t={mz(a > 0 ? `\\frac{1}{${a}}` : `-\\frac{1}{${betrag}}`)} />.</p>
          </>
        ) : (
          <p style={{ fontSize: 14, margin: 0, lineHeight: 1.55, color: C.tinte }}>
            Zu 0 gibt es kein multiplikatives Inverses: Kein Produkt 0 · b ergibt jemals 1. Das beweist du in Beweis 2.
          </p>
        )}
      </div>
    </BildKarte>
  );
}

function Umschreiber() {
  const nA = NICHT_ASSOZIATIV;
  return (
    <>
      <BildKarte>
        <Kicker>Nur Kurzschreibweisen</Kicker>
        <Aufforderung>Subtrahieren und Dividieren sind keine eigenen Rechenarten:</Aufforderung>
        <div style={{ display: "grid", gap: 8 }}>
          {UMSCHREIBUNGEN.map((u) => (
            <div key={u.kurz} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 12px", borderRadius: 12, background: FARBE[u.art].bg, boxShadow: `inset 0 0 0 1.5px ${FARBE[u.art].rand}`, color: FARBE[u.art].text, fontSize: 17 }}>
              <M t={formelTex(u.kurz)} /><span style={{ fontSize: 15, fontWeight: 700 }}>ist nur eine Kurzschreibweise für</span><M t={formelTex(u.lang)} />
            </div>
          ))}
        </div>
      </BildKarte>
      <BildKarte>
        <Kicker>Warum das mehr als Spielerei ist</Kicker>
        <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6, margin: "0 0 8px" }}>
          Für Minus und Geteilt gelten Assoziativ- und Kommutativgesetz <b>nicht</b>:
        </p>
        <div style={{ fontSize: 16, lineHeight: 2, color: C.tinte, overflowX: "auto" }}>
          <div><M t={mz(`(8-3)-2 = ${nA.minus.links}`)} />&nbsp;&nbsp;aber&nbsp;&nbsp;<M t={mz(`8-(3-2) = ${nA.minus.rechts}`)} /></div>
          <div><M t={`(24:4):2 = ${nA.geteilt.links}`} />&nbsp;&nbsp;aber&nbsp;&nbsp;<M t={`24:(4:2) = ${nA.geteilt.rechts}`} /></div>
          <div><M t={mz("8-3 = 5")} />&nbsp;&nbsp;aber&nbsp;&nbsp;<M t={mz("3-8 = -5")} /></div>
        </div>
        <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, margin: "10px 0 0" }}>
          Schreibst du dagegen alles als Plus und Mal mit Inversen, gelten alle Gesetze wieder: <M t={mz("8+(-3)+(-2) = 3")} /> – egal, wie du klammerst oder sortierst.
          Darum arbeitet die Mathematik im Kern nur mit <b>Plus</b> und <b>Mal</b>.
        </p>
      </BildKarte>
    </>
  );
}

/* ---------- Spickzettel ---------- */
function Spickzettel() {
  return (
    <Aufklapp titel="Spickzettel: Alle Axiome auf einen Blick">
      <div style={{ display: "grid", gap: 6 }}>
        {AXIOME.map((x) => (
          <div key={x.kz} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 10, background: FARBE[x.art].bg, boxShadow: `inset 0 0 0 1px ${FARBE[x.art].rand}`, color: FARBE[x.art].text }}>
            <span style={{ flexShrink: 0, minWidth: 26, fontSize: 12.5, fontWeight: 800 }}>{x.kz}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{x.name}</span>
            <span style={{ fontSize: 15, overflowX: "auto", maxWidth: "58%" }}><M t={formelTex(x.tex)} /></span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55, margin: "8px 0 0" }}>
        Wegen des Kommutativgesetzes gilt auch 0 + a = a und 1 · a = a. Mathematiker nennen eine Zahlenmenge mit diesen Regeln einen <b>Körper</b>.
      </p>
    </Aufklapp>
  );
}

/* ---------- Beweiskarte ---------- */
function BeweisKarte({ titel, zeilen, fuss, kasten }) {
  return (
    <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}` }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, margin: 0 }}>{titel}</p>
      <Rechenweg zeilen={zeilen} mitNummer />
      {fuss && <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, margin: "8px 0 0", fontWeight: 600 }}>{fuss}</p>}
      {kasten}
    </div>
  );
}

/* ---------- Schritte je Phase ---------- */
function bauePhasen(z) {
  const { n1, n2, b5 } = z;
  const q5 = (b5 / 2) ** 2;
  const ve = verkleideteEins(n1);
  const vn = verkleideteNull(n2);
  const optEins = mische([ve.richtig, ...ve.falsch]).map((x) => [x.id, <T key={x.id} s={"$" + x.tex + "$"} />]);
  const optNull = mische([vn.richtig, ...vn.falsch]).map((x) => [x.id, <T key={x.id} s={"$" + x.tex + "$"} />]);

  return [
    /* ---------------------------------------------------------------- 1 */
    {
      titel: "Warum Axiome?", kurz: "Warum",
      intro: "Bevor du eine Partie Schach spielst, kennst du die Spielregeln. Niemand beweist sie – sie sind festgelegt, und alles Weitere folgt aus ihnen: jeder erlaubte Zug, jede Taktik. In der Mathematik heißen diese festgelegten Spielregeln **Axiome**. Das Spannende: Alles, was du in der Schule rechnest – Klammern auflösen, Brüche kürzen, Gleichungen umformen, Ableiten – folgt aus wenigen Regeln für nur zwei Rechenarten: Plus und Mal.",
      bild: <Fundament />,
      fertig: "Merke: Axiome sind die Spielregeln der Zahlen. Alles andere ist Folgerung – und du wirst gleich selbst Folgerungen beweisen.",
      schritte: [
        { id: "x1a", titel: "Was ist ein Axiom?", typ: "wahl", frage: "Was ist ein Axiom?", richtig: "r",
          optionen: [o("r", "Eine festgelegte Grundregel, die nicht bewiesen wird, sondern Ausgangspunkt ist"), o("f", "Eine Regel, die so schwierig ist, dass man sie nicht beweisen kann"), o("g", "Eine Formel, die man auswendig lernen muss")],
          fehler: [{ wahl: "f", text: "Nicht die Schwierigkeit macht ein Axiom aus. Wir legen es fest, damit wir ein Fundament haben, auf dem alles andere aufbaut." }, { wahl: "g", text: "Gerade nicht auswendig: Axiome sind wenige und einfach. Alles andere wird aus ihnen hergeleitet." }],
          erklaerung: "Ein Axiom ist eine Spielregel: Wir legen sie fest. Ob eine andere Aussage stimmt, entscheidet sich daran, ob sie aus den Axiomen folgt." },
        { id: "x1b", titel: "Erlaubt oder nicht?", typ: "wahl", frage: "Woran erkennst du, ob eine Umformung erlaubt ist?", richtig: "r",
          optionen: [o("r", "Sie lässt sich aus den Axiomen herleiten"), o("f", "Sie steht im Schulbuch"), o("g", "Sie hat bei einem Zahlenbeispiel funktioniert")],
          fehler: [{ wahl: "g", text: "Ein Zahlenbeispiel beweist nichts: (a+b)² = a² + b² stimmt für a = 0 und ist trotzdem im Allgemeinen falsch. Ein Beweis muss für alle Zahlen gelten." }, { wahl: "f", text: "Das Schulbuch hat die Regel auch irgendwo her. Der Grund liegt tiefer: in den Axiomen." }],
          erklaerung: "Erlaubt ist genau das, was aus den Axiomen folgt – nicht mehr und nicht weniger. Zahlenbeispiele helfen beim Entdecken, aber nur ein Beweis gilt für alle Zahlen." },
        { id: "x1c", titel: "Wie viele Regeln?", typ: "wahl", frage: "Wie viele Rechenarten kommen in den Axiomen vor? Rate – du überprüfst es in Phase 6.", richtig: "r",
          optionen: [o("r", "Zwei: Plus und Mal"), o("f", "Vier: Plus, Minus, Mal und Geteilt"), o("g", "Fünf: dazu noch das Potenzieren")],
          erklaerung: "Plus und Mal. Minus und Geteilt sind – wie du in Phase 6 siehst – nur Rückwärtsrechnungen dazu, und Potenzieren ist wiederholtes Malnehmen." },
      ],
    },
    /* ---------------------------------------------------------------- 2 */
    {
      titel: "Die Addition – vier Gesetze", kurz: "Plus",
      intro: "Wir beginnen mit nur einer Rechenart: dem Plus. Für die Addition legen wir vier Regeln fest. Achte besonders auf die dritte: Die $0$ ist das **neutrale Element** – die Zahl, die beim Addieren nichts verändert. Ohne sie lässt sich das vierte Gesetz nicht einmal formulieren.",
      bild: <GesetzTafel art="plus" />,
      fertig: "Die Addition hat vier Gesetze: Assoziativ, Kommutativ, neutrales Element 0 und inverses Element. Merke dir besonders die 0 – sie ist die Zahl, die nichts verändert.",
      schritte: [
        { id: "x2a", titel: "Welches Gesetz?", typ: "wahl", frage: <T s="Welches Gesetz sagt $(a+b)+c = a+(b+c)$?" />, richtig: "r",
          optionen: [o("r", "Assoziativgesetz"), o("f", "Kommutativgesetz"), o("g", "Distributivgesetz")],
          fehler: [{ wahl: "f", text: "Das Kommutativgesetz vertauscht Zahlen (a + b = b + a). Hier bleibt die Reihenfolge, nur die Klammern wandern." }, { wahl: "g", text: "Das Distributivgesetz verbindet Plus und Mal. Hier kommt nur Plus vor." }],
          erklaerung: "Das ist das Assoziativgesetz: Die Klammern dürfen wandern." },
        { id: "x2b", titel: "Warum keine Klammern?", typ: "wahl", frage: <T s="Was erlaubt uns, einfach $a+b+c$ ohne Klammern zu schreiben?" />, richtig: "r",
          optionen: [o("r", "Das Assoziativgesetz: Jede Klammerung ergibt dasselbe"), o("f", "Das Kommutativgesetz: Man darf Zahlen vertauschen"), o("g", "Nichts – es ist nur eine Schreibfaulheit")],
          fehler: [{ wahl: "f", text: "Vertauschen ist etwas anderes. Hier geht es darum, dass (a+b)+c und a+(b+c) gleich sind – sonst wäre a+b+c nicht eindeutig." }, { wahl: "g", text: "Ohne das Assoziativgesetz wäre a+b+c mehrdeutig. Bei Minus ist das tatsächlich so – das siehst du in Phase 6." }],
          erklaerung: "Weil (a+b)+c = a+(b+c) gilt, ist a+b+c eindeutig. Bei Rechenarten ohne dieses Gesetz (Minus!) wäre die Schreibweise ohne Klammern unzulässig." },
        { id: "x2c", titel: "Das neutrale Element", typ: "wahl", frage: "Welche Zahl ist das neutrale Element der Addition – die Zahl, die nichts verändert?", richtig: "r",
          optionen: [o("r", "0"), o("f", "1"), o("g", "Es gibt keine")],
          fehler: [{ wahl: "f", text: "1 + a ist nicht a. Die 1 gehört zur Multiplikation (1 · a = a) – dazu gleich mehr." }, { wahl: "g", text: "Doch: Es ist Axiom A3. Ohne dieses Element könnte man das inverse Element gar nicht beschreiben." }],
          erklaerung: <T s="Die $0$: $a + 0 = a$. Wegen des Kommutativgesetzes gilt auch $0 + a = a$." /> },
        { id: "x2d", titel: "Das inverse Element", typ: "wahl", frage: <T s="Das inverse Element von $7$ ist die Zahl $x$ mit $7 + x = \square$. Was steht an der Stelle $\square$?" />, richtig: "r",
          optionen: [o("r", "0, das neutrale Element"), o("f", "1"), o("g", "7")],
          fehler: [{ wahl: "f", text: "Die 1 ist das neutrale Element der Multiplikation. Das inverse Element der Addition führt zur 0." }, { wahl: "g", text: "7 + 7 = 14. Gemeint ist die Zahl, die zu 7 addiert das neutrale Element ergibt." }],
          erklaerung: <T s="Das Inverse führt immer zum neutralen Element: $7 + (-7) = 0$. Es lässt sich also nur mit Hilfe der $0$ definieren – deshalb ist das neutrale Element so wichtig." /> },
      ],
    },
    /* ---------------------------------------------------------------- 3 */
    {
      titel: "Die Multiplikation – dieselben vier Gesetze", kurz: "Mal",
      intro: "Jetzt die zweite Rechenart: das Mal. Das Überraschende: Für die Multiplikation legen wir dieselben vier Regeln fest – nur mit anderen Rollen. Aus dem neutralen Element $0$ wird die $1$, aus $a+(-a)=0$ wird $a\\cdot\\frac{1}{a}=1$. Eine Ausnahme gibt es: Zu $0$ gibt es kein Inverses. Warum, beweist du in Beweis 2.",
      bild: <><GesetzTafel art="mal" /><Vergleich /></>,
      fertig: "Plus und Mal haben denselben Bauplan: Assoziativ, Kommutativ, ein neutrales Element (0 bzw. 1) und inverse Elemente ($−a$ bzw. $\frac{1}{a}$). Noch wissen die beiden Rechenarten nichts voneinander.",
      schritte: [
        { id: "x3a", titel: "Das neutrale Element", typ: "wahl", frage: "Welche Zahl ist das neutrale Element der Multiplikation?", richtig: "r",
          optionen: [o("r", "1"), o("f", "0"), o("g", "Es gibt keine")],
          fehler: [{ wahl: "f", text: "0 · a = 0, nicht a. Bei der Addition verändert die 0 nichts, bei der Multiplikation löscht sie alles aus – das beweist du in Beweis 1." }, { wahl: "g", text: "Doch: Axiom M3 legt es fest." }],
          erklaerung: <T s="Die $1$: $a\cdot 1 = a$. Wegen des Kommutativgesetzes gilt auch $1\cdot a = a$." /> },
        { id: "x3b", titel: "Assoziativgesetz (·)", typ: "wahl", frage: "Welche Gleichung ist das Assoziativgesetz der Multiplikation?", richtig: "r",
          optionen: [o("r", "$(a\\cdot b)\\cdot c = a\\cdot(b\\cdot c)$"), o("f", "$a\\cdot b = b\\cdot a$"), o("g", "$a\\cdot(b+c) = a\\cdot b + a\\cdot c$")],
          fehler: [{ wahl: "f", text: "Das ist das Kommutativgesetz: die Faktoren werden vertauscht." }, { wahl: "g", text: "Das ist das Distributivgesetz – es verbindet Plus und Mal." }],
          erklaerung: "Beim Assoziativgesetz wandern nur die Klammern. Darum darf man a · b · c ohne Klammern schreiben." },
        { id: "x3c", titel: "Wo steht a ≠ 0?", typ: "wahl", frage: "In welchem der vier Multiplikations-Gesetze taucht die Bedingung a ≠ 0 auf?", richtig: "r",
          optionen: [o("r", "Im inversen Element: $\frac{1}{a}$ gibt es nur für a ≠ 0"), o("f", "Im Kommutativgesetz"), o("g", "Im neutralen Element")],
          fehler: [{ wahl: "f", text: "Vertauschen darfst du auch mit der 0: 0 · b = b · 0." }, { wahl: "g", text: "a · 1 = a gilt für jede Zahl, auch für 0." }],
          erklaerung: "Nur das inverse Element hat diese Ausnahme. In Beweis 2 siehst du, dass es keine andere Wahl gibt." },
      ],
    },
    /* ---------------------------------------------------------------- 4 */
    {
      titel: "Das Distributivgesetz – die Brücke", kurz: "Brücke",
      intro: "Bis jetzt stehen Plus und Mal nebeneinander. Das Distributivgesetz $a\\cdot(b+c) = a\\cdot b + a\\cdot c$ ist die **einzige** Regel, die beide verbindet. Ohne sie gäbe es kein Ausmultiplizieren, kein Ausklammern, keine binomischen Formeln. Im Bild: Ein Rechteck mit Höhe $a$ und Breite $b+c$ hat denselben Flächeninhalt wie seine beiden Teilrechtecke zusammen.",
      bild: <DistBild />,
      fertig: "Das Distributivgesetz ist die einzige Brücke zwischen Plus und Mal. Rückwärts gelesen heißt es Ausklammern. Auch (b+c)·a = ba + ca musst du nicht extra festlegen – es folgt mit dem Kommutativgesetz.",
      schritte: [
        { id: "x4a", titel: "Welche Gleichung?", typ: "wahl", frage: "Welche dieser Gleichungen ist das Distributivgesetz?", richtig: "r",
          optionen: [o("r", "$a\\cdot(b+c) = a\\cdot b + a\\cdot c$"), o("f", "$a+(b\\cdot c) = (a+b)\\cdot(a+c)$"), o("g", "$a\\cdot(b\\cdot c) = (a\\cdot b)\\cdot(a\\cdot c)$")],
          fehler: [{ wahl: "f", text: "Falsch: Das Mal verteilt sich über das Plus, aber nicht umgekehrt. Probe mit a = b = c = 1: links 1 + 1 = 2, rechts 2 · 2 = 4." }, { wahl: "g", text: "Hier wird a doppelt multipliziert. Probe mit a = 2, b = c = 1: links 2 · 1 = 2, rechts 2 · 2 = 4." }],
          erklaerung: "Das Mal wird über das Plus verteilt – nicht umgekehrt. Plus und Mal sind nicht gleichberechtigt." },
        { id: "x4b", titel: "Geschickt rechnen", typ: "zahl", frage: <T s="Berechne $7\cdot 12$ geschickt: $7\cdot(10+2) = 7\cdot 10 + 7\cdot 2$. Ergebnis?" />, text: "7 · 12 =", wert: 84, breite: 96,
          hinweise: ["Rechne 7 · 10 und 7 · 2 getrennt und addiere."],
          fehler: [{ wert: 70, text: "Es fehlt der zweite Summand 7 · 2 = 14." }, { wert: 14, text: "Es fehlt der erste Summand 7 · 10 = 70." }],
          erklaerung: <T s="$7\cdot 10 + 7\cdot 2 = 70 + 14 = 84$." /> },
        { id: "x4c", titel: "Ausklammern", typ: "wahl", frage: <T s="Ausklammern ist das Distributivgesetz rückwärts. Was ergibt $3x + 3y$?" />, richtig: "r",
          optionen: [o("r", "$3\\cdot(x+y)$"), o("f", "$3x + y$"), o("g", "$x\\cdot(3+y)$")],
          fehler: [{ wahl: "f", text: "Multipliziere zur Probe wieder aus: Beim Ausklammern verteilt sich die 3 auf beide Summanden." }, { wahl: "g", text: "Ausmultipliziert gäbe das 3x + xy – nicht 3x + 3y." }],
          erklaerung: <T s="$3x + 3y = 3\cdot(x+y)$ – das Distributivgesetz von rechts nach links gelesen." /> },
        { id: "x4d", titel: "Auch von rechts?", typ: "wahl", frage: <T s="Das Gesetz steht links: $a\cdot(b+c) = ab+ac$. Gilt auch $(b+c)\cdot a = ba+ca$? Warum?" />, richtig: "r",
          optionen: [o("r", "Ja – mit dem Kommutativgesetz: (b+c)a = a(b+c) = ab + ac = ba + ca"), o("f", "Nein, bei Mal ist die Reihenfolge wichtig"), o("g", "Ja, das muss man als weiteres Axiom festlegen")],
          fehler: [{ wahl: "f", text: "Beim Mal ist die Reihenfolge gerade egal – das ist das Kommutativgesetz M2." }, { wahl: "g", text: "Nicht nötig: Es folgt aus den vorhandenen Axiomen. Je weniger Axiome, desto besser." }],
          erklaerung: "Man braucht kein zweites Distributivgesetz: Es folgt aus dem ersten und dem Kommutativgesetz. Gute Axiome sind sparsam." },
      ],
    },
    /* ---------------------------------------------------------------- 5 */
    {
      titel: "Neutrale Elemente: 0 und 1", kurz: "0 und 1",
      intro: "Das neutrale Element wirkt unscheinbar – und ist das mächtigste Werkzeug beim Umformen. Denn mit $1$ multiplizieren und $0$ addieren ändert den Wert eines Terms nie, aber sein **Aussehen**. Genau das nutzt du ständig, ohne es zu merken: bei jedem Kürzen, Erweitern und bei der quadratischen Ergänzung. Die Beispiele zeigen, wo die $1$ und die $0$ stecken – farbig markiert.",
      bild: <><VerkleidungsLabor /><BeispielKuerzen /><BeispielErweitern /><BeispielErgaenzung /><Fazit /></>,
      fertig: "Eine 1 hineinmultiplizieren, eine 0 hineinaddieren – in jeder erdenklichen Verkleidung. Das ist der Kern des Umformens. Alles andere ist Umsortieren.",
      schritte: [
        { id: "x5a", titel: "Verkleidete 1", typ: "wahl", frage: "Welcher dieser Ausdrücke ist eine verkleidete 1?", richtig: "r", optionen: optEins,
          fehler: [
            { wahl: "f0", text: `${n1} − ${n1} ist eine verkleidete 0, keine 1. Die gehört zur Addition. Multiplizierst du damit, wird alles zu 0.` },
            { wahl: "f1", text: `$\\frac{${n1}}{${n1 + 1}}$ ist kleiner als 1. Eine verkleidete 1 hat im Zähler und Nenner denselben Wert.` },
            { wahl: "f2", text: `$\\frac{${n1 + 1}}{${n1}}$ ist größer als 1. Eine verkleidete 1 hat im Zähler und Nenner denselben Wert.` },
          ],
          erklaerung: <T s={"$\\frac{" + n1 + "}{" + n1 + "} = " + n1 + "\\cdot\\frac{1}{" + n1 + "} = 1$ nach dem inversen Element der Multiplikation."} /> },
        { id: "x5b", titel: "Verkleidete 0", typ: "wahl", frage: "Welcher dieser Ausdrücke ist eine verkleidete 0?", richtig: "r", optionen: optNull,
          fehler: [
            { wahl: "f1", text: `$\\frac{${n2}}{${n2}}$ ist eine verkleidete 1. Addierst du sie, ändert sich der Wert: a + 1 ≠ a.` },
            { wahl: "f2", text: `${n2} − 1 = ${n2 - 1}, das ist nicht 0.` },
            { wahl: "f3", text: `${n2} + ${n2} = ${2 * n2}, das ist nicht 0. Das Inverse von ${n2} ist −${n2}, nicht ${n2}.` },
          ],
          erklaerung: <T s={"$" + n2 + " - " + n2 + " = " + n2 + " + (-" + n2 + ") = 0$ nach dem inversen Element der Addition."} /> },
        { id: "x5c", titel: "Erweitern", typ: "wahl", frage: <T s="Du willst $\frac{1}{3}+\frac{1}{4}$ auf einen gemeinsamen Nenner bringen. Womit multiplizierst du $\frac{1}{3}$, ohne den Wert zu ändern?" />, richtig: "r",
          optionen: [o("r", "$\\frac{4}{4}$"), o("f", "$4$"), o("g", "$\\frac{4}{3}$")],
          fehler: [{ wahl: "f", text: "Mit 4 multipliziert ändert sich der Wert: $\frac{1}{3} \cdot 4 = \frac{4}{3}$. Du darfst nur mit etwas multiplizieren, das 1 ist: $\frac{4}{4}$." }, { wahl: "g", text: "$\frac{4}{3}$ ist größer als 1. Eine verkleidete 1 hat Zähler und Nenner gleich." }],
          erklaerung: <T s="$\frac{1}{3}\cdot\frac{4}{4} = \frac{4}{12}$. Weil $\frac{4}{4} = 1$, ist der Wert gleich geblieben – nur das Aussehen hat sich geändert." /> },
        { id: "x5d", titel: "Warum 16 − 16?", typ: "wahl", frage: <T s="Bei $x^2 - 8x$ addierst du $16 - 16$. Warum ändert das den Wert nicht?" />, richtig: "r",
          optionen: [o("r", "Weil 16 − 16 = 0 ist und 0 das neutrale Element der Addition ist"), o("f", "Weil 16 eine Quadratzahl ist"), o("g", "Weil man auf beiden Seiten dasselbe macht")],
          fehler: [{ wahl: "f", text: "Dass 16 eine Quadratzahl ist, macht die Ergänzung nützlich – aber nicht erlaubt. Erlaubt ist sie, weil 16 − 16 eine 0 ist." }, { wahl: "g", text: "Hier wird nur an einem Term etwas eingefügt. Der Wert bleibt gleich, weil 16 − 16 = 0 ist." }],
          erklaerung: <T s="$16 - 16 = 16 + (-16) = 0$. Eine 0 zu addieren ändert nichts (A3). Nützlich wird sie, weil $x^2 - 8x + 16 = (x-4)^2$ ist." /> },
        { id: "x5e", titel: "Welche Zahl ergänzen?", typ: "zahl", frage: <T s={"Du ergänzt $x^2 + " + b5 + "x$ quadratisch und addierst $q - q$ (also eine 0). Welche Zahl ist $q$?"} />, text: "q =", wert: q5, breite: 96,
          hinweise: ["q ist das Quadrat der halben Zahl vor dem x.", `Die Hälfte von ${b5} ist ${b5 / 2}.`],
          fehler: [
            { wert: b5 / 2, text: `${b5 / 2} ist nur die Hälfte von ${b5} – sie steht später in der Klammer (x + ${b5 / 2})². Ergänzt wird das Quadrat davon.` },
            { wert: b5, text: `${b5} ist die Zahl vor dem x. Gebraucht wird das Quadrat ihrer Hälfte.` },
            { wert: b5 * b5, text: `${b5 * b5} ist ${b5}². Gebraucht wird aber das Quadrat der Hälfte von ${b5}.` },
          ],
          erklaerung: <T s={"$q = (" + b5 + "/2)^2 = " + (b5 / 2) + "^2 = " + q5 + "$. Damit: $x^2 + " + b5 + "x + " + q5 + " - " + q5 + " = (x+" + (b5 / 2) + ")^2 - " + q5 + "$."} /> },
        { id: "x5f", titel: "Wer darf wohin?", typ: "wahl", frage: "Was darfst du an einem Term verändern, ohne seinen Wert zu ändern?", richtig: "r",
          optionen: [o("r", "Mit einer 1 multiplizieren und eine 0 addieren – in jeder Verkleidung"), o("f", "Mit einer 0 multiplizieren und eine 1 addieren"), o("g", "Mit irgendeiner Zahl multiplizieren")],
          fehler: [{ wahl: "f", text: "Genau verkehrt herum: 0 · a = 0 löscht den Term, und a + 1 ist nicht a." }, { wahl: "g", text: "Mit 2 multipliziert verdoppelt sich der Wert. Nur die 1 (auch als $\frac{5}{5}$ oder $\frac{x+1}{x+1}$) ändert nichts." }],
          erklaerung: "Die 1 hineinmultiplizieren, die 0 hineinaddieren. Das sind die beiden einzigen kreativen Eingriffe, alles andere ist Umsortieren." },
      ],
    },
    /* ---------------------------------------------------------------- 6 */
    {
      titel: "Inverse Elemente: Es gibt nur zwei Rechenarten", kurz: "Inverse",
      intro: "Jetzt zu den inversen Elementen. $-7$ ist keine Zahl, die vom Himmel fällt, sondern die Zahl, die zu $7$ addiert das neutrale Element $0$ ergibt: $7+(-7)=0$. Genauso ist $\\frac{1}{7}$ die Zahl, die mit $7$ multipliziert das neutrale Element $1$ ergibt: $7\\cdot\\frac{1}{7}=1$. Daraus folgt ein Perspektivwechsel: Wir ziehen nie $7$ ab – wir **addieren das Inverse** von $7$. Und wir teilen nie durch $7$ – wir **multiplizieren mit dem Inversen**. Es gibt also nur zwei Grundrechenarten, jede mit ihrer Rückwärtsrechnung.",
      bild: <><InversenLabor /><Umschreiber /></>,
      fertig: "Es gibt nur zwei Grundrechenarten: Addition und Multiplikation. Subtraktion und Division sind ihre Rückwärtsrechnungen – eigentlich dieselbe Rechenart mit dem inversen Element. Das Minuszeichen vor einer Zahl bedeutet „das Inverse der Addition“, der Bruch $\frac{1}{a}$ „das Inverse der Multiplikation“.",
      schritte: [
        { id: "x6a", titel: "Was ist −7?", typ: "wahl", frage: <T s="Was bedeutet $-7$ genau?" />, richtig: "r",
          optionen: [o("r", "Die Zahl, die zu 7 addiert 0 ergibt"), o("f", "Eine Zahl, die kleiner als 0 ist"), o("g", "Das Ergebnis von 0 − 7")],
          fehler: [
            { wahl: "f", text: "Das beschreibt, wo −7 auf dem Zahlenstrahl liegt, nicht was es ist. Und das Inverse von −7 ist 7 – positiv, obwohl es ein „Minus“ trägt." },
            { wahl: "g", text: "Stimmt als Rechnung, aber 0 − 7 ist selbst nur eine Kurzschreibweise für 0 + (−7). Wir bräuchten −7 also schon vorher." },
          ],
          erklaerung: <T s="$-7$ ist definiert durch die Eigenschaft $7 + (-7) = 0$. Das Minuszeichen vor der Zahl bedeutet: das Inverse der Addition." /> },
        { id: "x6b", titel: "Was ist 1/7?", typ: "wahl", frage: <T s="Was ist $\frac{1}{7}$?" />, richtig: "r",
          optionen: [o("r", "Die Zahl, die mit 7 multipliziert 1 ergibt"), o("f", "Die Zahl, die zu 7 addiert 1 ergibt"), o("g", "7 geteilt durch 1")],
          fehler: [{ wahl: "f", text: "Die Zahl, die zu 7 addiert 1 ergibt, ist −6. Das Inverse der Multiplikation führt über das Mal zur 1." }, { wahl: "g", text: "7 : 1 = 7. Gemeint ist die Zahl, die mit 7 multipliziert das neutrale Element 1 ergibt." }],
          erklaerung: <T s="$\frac{1}{7}$ ist definiert durch $7\cdot\frac{1}{7} = 1$: das Inverse der Multiplikation." /> },
        { id: "x6c", titel: "Minus als Plus", typ: "wahl", frage: <T s="Wie schreibst du $5 - 8$ als Addition?" />, richtig: "r",
          optionen: [o("r", "$5 + (-8)$"), o("f", "$(-5) + 8$"), o("g", "$5 + 8$")],
          fehler: [{ wahl: "f", text: "(−5) + 8 = 3, aber 5 − 8 = −3. Das Inverse gehört zu dem, was abgezogen wird." }, { wahl: "g", text: "Das Inverse von 8 ist −8, nicht 8." }],
          erklaerung: <T s="$5 - 8$ ist nur eine Kurzschreibweise für $5 + (-8)$. Du addierst das Inverse von 8." /> },
        { id: "x6d", titel: "Geteilt als Mal", typ: "wahl", frage: <T s="Wie schreibst du $12 : 4$ als Multiplikation?" />, richtig: "r",
          optionen: [o("r", "$12\\cdot\\frac{1}{4}$"), o("f", "$12\\cdot(-4)$"), o("g", "$12\\cdot 4$")],
          fehler: [{ wahl: "f", text: "−4 ist das Inverse der Addition. Hier brauchst du das Inverse der Multiplikation: $\frac{1}{4}$." }, { wahl: "g", text: "12 · 4 = 48. Durch 4 teilen heißt: mit dem Inversen $\frac{1}{4}$ multiplizieren." }],
          erklaerung: <T s="$12 : 4$ ist nur eine Kurzschreibweise für $12\cdot\frac{1}{4}$." /> },
        { id: "x6e", titel: "Ist Minus assoziativ?", typ: "wahl", frage: <T s="Ist $(8-3)-2$ dasselbe wie $8-(3-2)$?" />, richtig: "r",
          optionen: [o("r", "Nein: links 3, rechts 7"), o("f", "Ja, beide ergeben 3"), o("g", "Ja, beide ergeben 7")],
          fehler: [{ wahl: "f", text: "Rechne die rechte Seite nach: 3 − 2 = 1 und 8 − 1 = 7, nicht 3." }, { wahl: "g", text: "Rechne die linke Seite nach: 8 − 3 = 5 und 5 − 2 = 3, nicht 7." }],
          erklaerung: <T s="$(8-3)-2 = 3$, aber $8-(3-2) = 7$. Minus ist nicht assoziativ. Als Plus mit Inversen geschrieben, $8+(-3)+(-2) = 3$, ist die Klammerung dagegen egal." /> },
        { id: "x6f", titel: "Wie viele Rechenarten?", typ: "zahl", frage: "Wie viele Grundrechenarten gibt es also wirklich?", text: "Anzahl:", wert: 2, breite: 80,
          hinweise: ["Welche beiden Rechenarten haben Axiome? Minus und Geteilt sind nur Kurzschreibweisen dafür."],
          fehler: [{ wert: 4, text: "Plus, Minus, Mal und Geteilt sind vier Schreibweisen. Aber Minus und Geteilt sind Plus und Mal mit inversen Elementen." }, { wert: 3, text: "Mehr als zwei sind es nicht: Plus und Mal. Alles andere sind Rückwärtsrechnungen mit inversen Elementen." }],
          erklaerung: "Zwei: Addition und Multiplikation – jede mit ihrer Rückwärtsrechnung." },
      ],
    },
    /* ---------------------------------------------------------------- 7 */
    {
      titel: "Beweis 1: a · 0 = 0", kurz: "a·0",
      intro: "Jetzt wird bewiesen. Die Spielregel: Du darfst nur die Axiome benutzen und das, was du schon bewiesen hast. Wir starten mit einer Aussage, die du seit der Grundschule kennst: $a\\cdot 0 = 0$ für jede Zahl $a$. Als Axiom haben wir sie **nicht** festgelegt – sie muss also folgen. Der Trick: Wir zeigen, dass $x = a\\cdot 0$ die Gleichung $x = x + x$ erfüllt.",
      bild: <Spickzettel />,
      fertig: "Bewiesen: a · 0 = 0 für jede Zahl a – ohne eine einzige Zahl auszurechnen. Nur Axiome wurden benutzt.",
      schritte: [
        { id: "x7a", titel: "0 + 0", typ: "wahl", frage: <T s="Welches Axiom liefert $0 + 0 = 0$?" />, richtig: "r",
          optionen: [o("r", "Das neutrale Element der Addition (A3), mit a = 0"), o("f", "Das Distributivgesetz"), o("g", "Das Assoziativgesetz")],
          fehler: [{ wahl: "f", text: "Das Distributivgesetz verbindet Plus und Mal – hier steht nur Plus." }, { wahl: "g", text: "Hier wird nichts umgeklammert. Es geht darum, dass 0 beim Addieren nichts verändert." }],
          erklaerung: <T s="A3 sagt $a + 0 = a$. Setze $a = 0$: $0 + 0 = 0$." /> },
        { id: "x7b", titel: "Distributivgesetz anwenden", typ: "wahl", frage: <T s="Schreibe $a\cdot 0$ als $a\cdot(0+0)$. Was liefert das Distributivgesetz?" />, richtig: "r",
          optionen: [o("r", "$a\\cdot 0 + a\\cdot 0$"), o("f", "$a + 0$"), o("g", "$0 + 0$")],
          fehler: [{ wahl: "f", text: "Das a muss sich auf beide Summanden in der Klammer verteilen: a · 0 und a · 0." }, { wahl: "g", text: "Das a darf nicht verschwinden: Es multipliziert beide Summanden." }],
          erklaerung: <T s="$a\cdot(0+0) = a\cdot 0 + a\cdot 0$. Also gilt $a\cdot 0 = a\cdot 0 + a\cdot 0$." /> },
        { id: "x7c", titel: "Das Inverse addieren", typ: "wahl", frage: <T s="Setze $x := a\cdot 0$. Dann gilt $x = x + x$. Addiere auf beiden Seiten das Inverse $-x$. Was steht links?" />, richtig: "r",
          optionen: [o("r", "$x + (-x)$, also nach dem inversen Element: 0"), o("f", "$x$"), o("g", "$-x$")],
          fehler: [{ wahl: "f", text: "Links steht x und wir addieren −x: x + (−x). Das ist noch nicht einfach x." }, { wahl: "g", text: "Links stand x, dazu kommt −x: Es entsteht x + (−x)." }],
          erklaerung: <T s="Links: $x + (-x) = 0$ (A4)." /> },
        { id: "x7d", titel: "Rechts vereinfachen", typ: "wahl", frage: <T s="Rechts steht $(x+x)+(-x)$. Mit dem Assoziativgesetz wird daraus $x+(x+(-x))$. Was ist das?" />, richtig: "r",
          optionen: [o("r", "$x + 0 = x$"), o("f", "$x + x$"), o("g", "$0$")],
          fehler: [{ wahl: "f", text: "In der inneren Klammer steht x + (−x). Das ist nach A4 eine 0." }, { wahl: "g", text: "Die innere Klammer ist 0, aber das äußere x bleibt stehen: x + 0." }],
          erklaerung: <T s="Innere Klammer: $x + (-x) = 0$ (A4). Dann $x + 0 = x$ (A3)." /> },
        { id: "x7e", titel: "Schluss", typ: "wahl", frage: "Links steht 0, rechts steht x. Was folgt?", richtig: "r",
          optionen: [o("r", "$x = 0$, also $a\\cdot 0 = 0$ für jede Zahl $a$"), o("f", "Gar nichts"), o("g", "$a = 0$")],
          fehler: [{ wahl: "f", text: "Doch: Aus 0 = x folgt direkt x = 0, und x war a · 0." }, { wahl: "g", text: "a war beliebig. Bewiesen ist a · 0 = 0, nicht a = 0." }],
          erklaerung: <T s="$0 = x$, also $a\cdot 0 = 0$. Wegen des Kommutativgesetzes gilt auch $0\cdot a = 0$." /> },
      ],
      abschluss: <BeweisKarte titel="Das hast du bewiesen: a · 0 = 0" zeilen={BEWEIS_MAL_NULL} fuss="Merke: Die 0 löscht bei der Multiplikation alles. Das folgt aus den Axiomen – es muss nicht festgelegt werden." />,
    },
    /* ---------------------------------------------------------------- 8 */
    {
      titel: "Beweis 2: Es gibt kein 1/0", kurz: "1/0",
      intro: "Warum darf man nicht durch $0$ teilen? In der Schule klingt das wie ein Verbot. Mit den Axiomen siehst du: Es ist kein Verbot, sondern ein **Widerspruch**. Das multiplikative Inverse $\\frac{1}{a}$ ist nur für $a\\neq 0$ festgelegt. Wir beweisen jetzt, dass wir gar keine andere Wahl haben: Gäbe es ein Inverses von $0$, bräche die Mathematik zusammen. Wir führen einen **indirekten Beweis**: Wir nehmen das Gegenteil an und führen es zum Widerspruch.",
      bild: <Spickzettel />,
      fertig: "Bewiesen: Ein Inverses von 0 würde 0 = 1 erzwingen, und dann wäre jede Zahl gleich 0. Darum fordert Axiom M4 das Inverse nur für a ≠ 0 – und darum ist „Teilen durch 0“ kein Verbot, sondern ein Widerspruch.",
      schritte: [
        { id: "x8a", titel: "Die Annahme", typ: "wahl", frage: <T s="Angenommen, es gäbe eine Zahl $b$ mit $0\cdot b = 1$ (ein „Inverses“ von 0). Was liefert Beweis 1 für $0\cdot b$?" />, richtig: "r",
          optionen: [o("r", "$0\\cdot b = b\\cdot 0 = 0$ (Kommutativgesetz und Beweis 1)"), o("f", "$1$"), o("g", "$b$")],
          fehler: [{ wahl: "f", text: "1 ist die Annahme. Beweis 1 sagt: Etwas mal 0 ist immer 0." }, { wahl: "g", text: "Beweis 1: a · 0 = 0 für jede Zahl a – also hier mit a = b." }],
          erklaerung: <T s="$0\cdot b = b\cdot 0$ (M2) und $b\cdot 0 = 0$ (Beweis 1)." /> },
        { id: "x8b", titel: "Zwei Ergebnisse", typ: "wahl", frage: <T s="Nach der Annahme ist $0\cdot b = 1$, nach Beweis 1 ist $0\cdot b = 0$. Was folgt?" />, richtig: "r",
          optionen: [o("r", "$1 = 0$"), o("f", "$b = 0$"), o("g", "Nichts")],
          fehler: [{ wahl: "f", text: "Über b sagen die beiden Gleichungen nichts aus. Aber links steht beide Male dasselbe, 0 · b – also sind die rechten Seiten gleich." }, { wahl: "g", text: "Zwei Dinge, die dasselbe sind (0 · b), sind einander gleich: 1 = 0 · b = 0." }],
          erklaerung: <T s="$1 = 0\cdot b = 0$, also $1 = 0$." /> },
        { id: "x8c", titel: "Was wäre jede Zahl?", typ: "wahl", frage: <T s="Angenommen, $0$ und $1$ wären dieselbe Zahl. Was wäre dann jede beliebige Zahl $a$? Tipp: $a = a\cdot 1$." />, richtig: "r",
          optionen: [o("r", "$a = a\\cdot 1 = a\\cdot 0 = 0$ – jede Zahl wäre 0"), o("f", "$a = 1$"), o("g", "Das hängt von a ab")],
          fehler: [{ wahl: "f", text: "Wir haben 1 = 0 – dann ist a · 1 = a · 0, und das ist nach Beweis 1 gleich 0." }, { wahl: "g", text: "Die Rechnung hängt nicht von a ab: a = a · 1 (M3), a · 1 = a · 0 (denn 1 = 0), a · 0 = 0 (Beweis 1)." }],
          erklaerung: <T s="$a = a\cdot 1 = a\cdot 0 = 0$. Jede Zahl wäre gleich $0$: Es gäbe nur eine einzige Zahl." /> },
        { id: "x8d", titel: "Der Widerspruch", typ: "wahl", frage: "Warum ist das ein Widerspruch zu den Axiomen?", richtig: "r",
          optionen: [o("r", "Weil wir 0 ≠ 1 ausdrücklich als Axiom festgelegt haben – sonst gäbe es nur eine Zahl"), o("f", "Weil 0 keine richtige Zahl ist"), o("g", "Es ist gar kein Widerspruch – dann rechnet man eben mit einer Zahl")],
          fehler: [{ wahl: "f", text: "0 ist eine richtige Zahl – das neutrale Element der Addition. Das Problem liegt woanders." }, { wahl: "g", text: "Formal wäre das möglich, aber es wäre eine Mathematik mit nur einer Zahl: alles ist 0, es gibt nichts zu rechnen. Darum verlangt Axiom N ausdrücklich 0 ≠ 1." }],
          erklaerung: <T s="Axiom N verlangt $0 \neq 1$. Sonst wäre jede Zahl gleich $0$, und es gäbe nichts zu rechnen." /> },
        { id: "x8e", titel: "Fazit", typ: "wahl", frage: <T s="Warum gibt es $\frac{1}{0}$ nicht?" />, richtig: "r",
          optionen: [o("r", "Ein Inverses von 0 würde 0 = 1 erzwingen – und damit wäre jede Zahl gleich 0"), o("f", "Weil Mathematiker es verboten haben"), o("g", "Weil 0 zu klein ist")],
          fehler: [{ wahl: "f", text: "Niemand verbietet es willkürlich: Es führt zu einem Widerspruch, den du gerade selbst bewiesen hast." }, { wahl: "g", text: "Es liegt nicht an der Größe von 0, sondern daran, dass 0 · b immer 0 ist und nie 1." }],
          erklaerung: "Mal 0 ergibt immer 0 – nie 1. Ein Inverses würde 0 = 1 erzwingen, und damit die ganze Mathematik zerstören." },
      ],
      abschluss: <BeweisKarte titel="Das hast du bewiesen: Es gibt kein 1/0" zeilen={BEWEIS_KEIN_INVERSES} fuss="Teilen durch 0 ist also kein willkürliches Verbot, sondern ein Widerspruch zu den Axiomen." />,
    },
    /* ---------------------------------------------------------------- 9 */
    {
      titel: "Beweis 3: Die erste binomische Formel", kurz: "(a+b)²",
      intro: "Die erste binomische Formel $(a+b)^2 = a^2 + 2ab + b^2$ hast du auswendig gelernt. Jetzt leitest du sie her – nur mit dem Distributivgesetz, dem Kommutativgesetz und dem neutralen Element der Multiplikation. Dabei steckt eine kleine Überraschung: Auch die „2“ in $2ab$ ist keine Selbstverständlichkeit. Die Zahl $2$ ist als $1+1$ definiert.",
      bild: <Spickzettel />,
      fertig: "Bewiesen: (a+b)² = a² + 2ab + b² – allein aus Distributivgesetz, Kommutativgesetz und dem neutralen Element 1. Die „2“ ist nichts anderes als 1 + 1.",
      schritte: [
        { id: "x9a", titel: "Was heißt Quadrat?", typ: "wahl", frage: <T s="Was bedeutet $(a+b)^2$?" />, richtig: "r",
          optionen: [o("r", "$(a+b)\\cdot(a+b)$"), o("f", "$a^2 + b^2$"), o("g", "$2\\cdot(a+b)$")],
          fehler: [{ wahl: "f", text: "Das ist genau der Fehler, den wir vermeiden wollen. Das Quadrat bedeutet: die ganze Klammer mit sich selbst multiplizieren." }, { wahl: "g", text: "Das wäre die Verdoppelung. Quadrat heißt Mal-sich-selbst." }],
          erklaerung: <T s="$x^2 := x\cdot x$ – hier mit $x = a+b$." /> },
        { id: "x9b", titel: "Verteilen", typ: "wahl", frage: <T s="Wende das Distributivgesetz mit $x = a+b$ an: $(a+b)\cdot(a+b) = (a+b)\cdot a + (a+b)\cdot b$. Dann verteilst du noch einmal. Was steht danach da?" />, richtig: "r",
          optionen: [o("r", "$a\\cdot a + b\\cdot a + a\\cdot b + b\\cdot b$"), o("f", "$a\\cdot a + b\\cdot b$"), o("g", "$a\\cdot a + a\\cdot b + b\\cdot b$")],
          hinweise: ["Jede der beiden Klammern (a+b) verteilt sich auf zwei Summanden: Es entstehen 2 · 2 Produkte."],
          fehler: [{ wahl: "f", text: "Die gemischten Produkte a · b und b · a fehlen. Beim Verteilen entstehen vier Produkte." }, { wahl: "g", text: "Es sind vier Produkte: (a+b)·a liefert zwei, (a+b)·b liefert zwei. Eines fehlt hier." }],
          erklaerung: <T s="$(a+b)\cdot a = a\cdot a + b\cdot a$ und $(a+b)\cdot b = a\cdot b + b\cdot b$. Zusammen vier Produkte." /> },
        { id: "x9c", titel: "Sortieren", typ: "wahl", frage: <T s="Mit dem Kommutativgesetz ($b\cdot a = a\cdot b$) und $a\cdot a = a^2$ wird daraus …" />, richtig: "r",
          optionen: [o("r", "$a^2 + a\\cdot b + a\\cdot b + b^2$"), o("f", "$a^2 + 2ab + b^2$"), o("g", "$a^2 + b^2$")],
          fehler: [{ wahl: "f", text: "Das Ergebnis stimmt, aber du überspringst einen Schritt: Warum ist ab + ab = 2ab? Genau das ist die eigentliche Frage des nächsten Schritts." }, { wahl: "g", text: "Die beiden gleichen Produkte ab dürfen nicht verschwinden." }],
          erklaerung: <T s="Nach dem Kommutativgesetz sind $b\cdot a$ und $a\cdot b$ dasselbe: $a^2 + ab + ab + b^2$." /> },
        { id: "x9d", titel: "Woher kommt die 2?", typ: "wahl", frage: <T s="Warum ist $ab + ab = 2ab$? Tipp: $2$ ist als $1+1$ definiert." />, richtig: "r",
          optionen: [o("r", "$ab = 1\\cdot ab$ (neutrales Element), also $1\\cdot ab + 1\\cdot ab = (1+1)\\cdot ab = 2ab$ (Distributivgesetz rückwärts)"), o("f", "Das ist selbstverständlich und braucht keinen Beweis"), o("g", "Das folgt aus dem Assoziativgesetz")],
          fehler: [{ wahl: "f", text: "In einem Beweis aus Axiomen darf nichts selbstverständlich bleiben. Auch hier steckt das neutrale Element 1 drin." }, { wahl: "g", text: "Das Assoziativgesetz verschiebt nur Klammern. Hier muss aus zwei gleichen Summanden ein Vielfaches werden – dafür braucht man 1 · ab = ab und das Distributivgesetz." }],
          erklaerung: <T s="$ab + ab = 1\cdot ab + 1\cdot ab = (1+1)\cdot ab = 2\cdot ab$. Eine verkleidete 1 – wie in Phase 5." /> },
        { id: "x9e", titel: "Kontrolle (kein Beweis!)", typ: "zahl", frage: <T s="Setze zur Kontrolle $a = 3$ und $b = 4$ in die Formel ein. Wie groß ist der mittlere Term $2ab$?" />, text: "2ab =", wert: 24, breite: 96,
          hinweise: ["2 · 3 · 4"],
          fehler: [{ wert: 12, text: "12 ist nur a · b. Der Faktor 2 gehört dazu: 2 · 12." }, { wert: 49, text: "49 ist das ganze Ergebnis (3 + 4)². Gefragt ist nur der mittlere Term." }],
          erklaerung: <T s="$(3+4)^2 = 49 = 9 + 24 + 16$. Aber merke: Das Zahlenbeispiel bestätigt die Formel nur – bewiesen ist sie durch deine Herleitung." /> },
      ],
      abschluss: <BeweisKarte titel="Das hast du bewiesen: (a+b)² = a² + 2ab + b²" zeilen={BEWEIS_BINOM1.zeilen} fuss="Gold = Distributivgesetz, rosa = eine verkleidete 1. Mehr war nicht nötig." />,
    },
    /* ---------------------------------------------------------------- 10 */
    {
      titel: "Beweis 4: Minus mal Plus – und die anderen Binomischen", kurz: "Minus",
      intro: "Für die zweite und dritte binomische Formel kommt ein Minus ins Spiel – und damit ein **inverses Element**. Du brauchst ein Hilfsergebnis: $a\\cdot(-b) = -(a\\cdot b)$, also „Plus mal Minus ist Minus“. Auch das ist keine Spielregel, sondern eine Folgerung. Beweise sie zuerst, dann folgen die beiden Formeln fast von selbst.",
      bild: <Spickzettel />,
      fertig: "Bewiesen: a·(−b) = −(a·b), (−b)·(−b) = b·b, (a−b)² = a² − 2ab + b² und (a+b)(a−b) = a² − b². Alles aus den Axiomen – Schritt für Schritt.",
      schritte: [
        { id: "x10a", titel: "Hilfsergebnis: Ansatz", typ: "wahl", frage: <T s="Wir zeigen: $a\cdot b + a\cdot(-b) = 0$. Was liefert das Distributivgesetz (rückwärts) für diese Summe?" />, richtig: "r",
          optionen: [o("r", "$a\\cdot(b + (-b))$"), o("f", "$a\\cdot b\\cdot(-b)$"), o("g", "$(a+a)\\cdot(b+(-b))$")],
          fehler: [{ wahl: "f", text: "Beim Ausklammern wird der gemeinsame Faktor a vor die Klammer gezogen und die Reste addiert: b und −b." }, { wahl: "g", text: "Der gemeinsame Faktor ist a, er steht nur einmal vor der Klammer." }],
          erklaerung: <T s="$a\cdot b + a\cdot(-b) = a\cdot(b+(-b))$ – Ausklammern von $a$." /> },
        { id: "x10b", titel: "Hilfsergebnis: Rechnen", typ: "wahl", frage: <T s="Und $a\cdot(b + (-b))$ ist …" />, richtig: "r",
          optionen: [o("r", "$a\\cdot 0 = 0$ (inverses Element, dann Beweis 1)"), o("f", "$a\\cdot b$"), o("g", "$0 + a$")],
          fehler: [{ wahl: "f", text: "In der Klammer steht b + (−b). Das ist nach A4 die 0." }, { wahl: "g", text: "Die Klammer ist 0, aber sie wird mit a multipliziert: a · 0." }],
          erklaerung: <T s="$b + (-b) = 0$ (A4), und $a\cdot 0 = 0$ (Beweis 1)." /> },
        { id: "x10c", titel: "Hilfsergebnis: Folgerung", typ: "wahl", frage: <T s="Also ist $a\cdot(-b)$ die Zahl, die zu $a\cdot b$ addiert $0$ ergibt. Wie nennt man eine solche Zahl?" />, richtig: "r",
          optionen: [o("r", "Das additive Inverse von $a\\cdot b$, also $-(a\\cdot b)$"), o("f", "$a\\cdot b$ selbst"), o("g", "Null")],
          fehler: [{ wahl: "f", text: "a · b + a · b = 2ab, nicht 0. Gesucht ist das Gegenstück, das zur 0 führt." }, { wahl: "g", text: "Null wäre es nur, wenn a · b = 0 ist. Allgemein ist es das Inverse von a · b." }],
          erklaerung: <T s="Zu jeder Zahl gibt es nur ein additives Inverses (siehe den Kasten unter dem Beweis). Deshalb gilt $a\cdot(-b) = -(a\cdot b)$." /> },
        { id: "x10d", titel: "Minus mal Minus", typ: "wahl", frage: <T s="Mit dem Hilfsergebnis (und Kommutativgesetz) gilt $(-b)\cdot(-b) = -\big((-b)\cdot b\big) = -\big(-(b\cdot b)\big)$. Was ist $-(-z)$?" />, richtig: "r",
          optionen: [o("r", "$z$ – denn $(-z) + z = 0$ zeigt: $z$ ist das Inverse von $-z$"), o("f", "$-z$"), o("g", "$0$")],
          fehler: [{ wahl: "f", text: "Dann wäre das Inverse von −z wieder −z. Aber (−z) + z = 0 zeigt, dass z das Inverse von −z ist." }, { wahl: "g", text: "−(−z) ist nicht 0. Es ist das Inverse von −z, und das ist z." }],
          erklaerung: <T s="$-(-z) = z$, also $(-b)\cdot(-b) = b\cdot b = b^2$. „Minus mal Minus ist Plus“ ist damit bewiesen." /> },
        { id: "x10e", titel: "Zweite binomische Formel", typ: "wahl", frage: <T s="Mit $a-b = a+(-b)$ und dem Muster aus Beweis 3 ergibt sich $(a-b)^2 = a^2 + a(-b) + (-b)a + (-b)(-b)$. Wie lautet das Ergebnis?" />, richtig: "r",
          optionen: [o("r", "$a^2 - 2ab + b^2$"), o("f", "$a^2 + 2ab + b^2$"), o("g", "$a^2 - b^2$")],
          fehler: [{ wahl: "f", text: "a(−b) und (−b)a sind beide −(ab). Zwei Mal −ab ergibt −2ab, nicht +2ab." }, { wahl: "g", text: "Das ist die dritte Formel. Hier fehlt −2ab, und (−b)(−b) ist +b²." }],
          erklaerung: <T s="$a(-b) = -(ab)$, $(-b)a = -(ab)$ und $(-b)(-b) = b^2$. Also $a^2 - ab - ab + b^2 = a^2 - 2ab + b^2$." /> },
        { id: "x10f", titel: "Dritte: Was hebt sich auf?", typ: "wahl", frage: <T s="$(a+b)(a-b) = a^2 + a(-b) + ba + b(-b)$. Welche Terme heben sich gegenseitig auf?" />, richtig: "r",
          optionen: [o("r", "$-ab$ und $+ab$ (inverses Element)"), o("f", "$a^2$ und $b^2$"), o("g", "$ab$ und $ba$ addieren sich zu $2ab$")],
          fehler: [{ wahl: "f", text: "a² und b(−b) = −b² stehen mit verschiedenen Faktoren da. Sie heben sich nicht auf." }, { wahl: "g", text: "a(−b) ist −ab, nicht +ab. Es steht also −ab + ba, und das ist −ab + ab = 0." }],
          erklaerung: <T s="$a(-b) = -(ab)$ und $ba = ab$: Die Summe $-ab + ab$ ist $0$ (A4)." /> },
        { id: "x10g", titel: "Dritte: Ergebnis", typ: "wahl", frage: <T s="Das Ergebnis lautet $(a+b)(a-b) = \square$. Was steht an der Stelle $\square$?" />, richtig: "r",
          optionen: [o("r", "$a^2 - b^2$"), o("f", "$a^2 + b^2$"), o("g", "$a^2 - 2ab + b^2$")],
          fehler: [{ wahl: "f", text: "b · (−b) = −(b · b) = −b², also Minus." }, { wahl: "g", text: "Das ist die zweite Formel. Hier heben sich −ab und +ab auf, ein Mittelterm bleibt nicht." }],
          erklaerung: <T s="$a^2 + 0 - b^2 = a^2 - b^2$ (neutrales Element A3)." /> },
      ],
      abschluss: (
        <>
          <BeweisKarte titel="Hilfsergebnis: a·(−b) = −(a·b)" zeilen={BEWEIS_PLUS_MAL_MINUS}
            kasten={(
              <Aufklapp titel="Warum gibt es zu jeder Zahl nur ein Inverses?">
                <p style={{ margin: "0 0 4px", color: C.grau, fontSize: 13.5 }}>Angenommen, <M t="q" /> und <M t="q'" /> sind beide Inverse von <M t="p" />, also <M t="p+q=0" /> und <M t="p+q'=0" />. Dann gilt:</p>
                <Rechenweg zeilen={BEWEIS_EINDEUTIG} />
                <p style={{ margin: "6px 0 0", color: C.tinte, fontSize: 13.5 }}>Dasselbe Argument zeigt −(−z) = z: z erfüllt (−z) + z = 0, ist also das Inverse von −z.</p>
              </Aufklapp>
            )} />
          <BeweisKarte titel="Das hast du bewiesen: (a − b)² = a² − 2ab + b²" zeilen={BEWEIS_BINOM2.zeilen} />
          <BeweisKarte titel="Das hast du bewiesen: (a + b)(a − b) = a² − b²" zeilen={BEWEIS_BINOM3.zeilen} fuss="Rosa/Blau: die verkleidete 0 im Mittelteil – −ab und +ab heben sich auf." />
        </>
      ),
    },
  ];
}

/* ---------- Das Modul ---------- */
export function AxiomeModul({ onZurueck }) {
  const zuf = useMemo(() => ({ n1: pick([3, 4, 5, 6, 7, 8, 9]), n2: pick([3, 4, 5, 6, 7, 8, 9]), b5: pick([6, 8, 10, 12, 14]) }), []);
  const phasen = useMemo(() => bauePhasen(zuf), [zuf]);
  const anzahl = AXIOM_PHASEN_ANZAHL;
  const [stand, setStandLok] = useState(() => entdeckenStand().axiome.stand.slice());
  const fertigePhase = (k) => stand[k] >= phasen[k].schritte.length;
  const ersteOffene = (() => { const i = phasen.findIndex((_, k) => !fertigePhase(k)); return i < 0 ? anzahl - 1 : i; })();
  const alleFertig = phasen.every((_, k) => fertigePhase(k));
  const [phase, setPhase] = useState(() => Math.min(entdeckenStand().axiome.phase || 0, anzahl - 1));
  const [bestaetige, setBestaetige] = useState(false);
  const aktuell = Math.min(phase, Math.max(ersteOffene, 0));

  useEffect(() => { window.scrollTo(0, 0); }, [aktuell]);
  useEffect(() => { if (alleFertig) axiomeFertigSetzen(true); }, [alleFertig]);

  const gehePhase = (k) => { setPhase(k); axiomePhaseSetzen(k); setBestaetige(false); };
  const setterFuer = (k) => (f) => {
    const neu = typeof f === "function" ? f(stand[k]) : f;
    if (neu > stand[k]) {
      axiomeStandSetzen(k, neu);
      setStandLok((s) => { const c = s.slice(); c[k] = Math.max(c[k], neu); return c; });
    }
  };

  const p = phasen[aktuell];
  const fertigDiese = fertigePhase(aktuell);
  const gesamt = phasen.reduce((s, ph, k) => s + Math.min(stand[k], ph.schritte.length), 0);
  const anzahlSchritte = phasen.reduce((s, ph) => s + ph.schritte.length, 0);

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <button type="button" onClick={onZurueck}
        style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "6px 0", marginBottom: 10, fontSize: 13.5, fontWeight: 600, color: C.see }}>
        ← Mathe entdecken
      </button>
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 6px" }}>Lernangebot 1</p>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 25px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte, marginBottom: 6 }}>
        Axiome – das Fundament der Mathematik
      </h2>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 14 }}>
        Zehn Phasen: von den Spielregeln der Zahlen bis zu deinen ersten eigenen Beweisen. Du rechnest selbst, ergänzt Formeln und bekommst bei Bedarf schrittweise Hilfe.
      </p>

      {/* Phasenleiste */}
      <div role="tablist" aria-label="Phasen" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.ceil(anzahl / 2)}, minmax(0, 1fr))`, gap: 6 }}>
        {phasen.map((ph, k) => {
          const an = k === aktuell, ok = fertigePhase(k), offen = k <= ersteOffene;
          return (
            <button key={k} type="button" role="tab" aria-selected={an} aria-label={`Phase ${k + 1}: ${ph.titel}${ok ? " (abgeschlossen)" : ""}`} disabled={!offen}
              onClick={() => gehePhase(k)}
              style={{ height: 44, borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: offen ? "pointer" : "default",
                border: `1.5px solid ${an ? C.see : ok ? "#0F7A4D" : C.linie}`, background: an ? C.see : ok ? "#E6F6EF" : C.weiss,
                color: an ? C.weiss : ok ? "#0F7A4D" : offen ? C.see : C.hellgrau, opacity: offen ? 1 : 0.6 }}>
              {ok && !an ? "✓" : k + 1}
            </button>
          );
        })}
      </div>
      <div aria-hidden="true" style={{ height: 5, borderRadius: 3, background: C.linie, marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${(gesamt / anzahlSchritte) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.see}, ${C.gruen})`, transition: "width .3s ease" }} />
      </div>

      {/* Aktuelle Phase */}
      <div style={{ marginTop: 22 }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>Phase {aktuell + 1} von {anzahl}</p>
        <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, marginBottom: 12 }}>{p.titel}</h3>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0 }}>
          {String(p.intro).split("**").map((x, i) => (i % 2 ? <b key={i} style={{ fontWeight: 700, color: C.tinte }}><T s={x} /></b> : <T key={i} s={x} />))}
        </p>
        {p.bild}

        <div style={{ ...karte, marginTop: 18 }}>
          <SchrittFolge key={aktuell} schritte={p.schritte} stand={stand[aktuell]} setStand={setterFuer(aktuell)} fertigText={p.fertig} />
        </div>

        {fertigDiese && p.abschluss}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {aktuell > 0 && <div style={{ flex: "0 0 38%" }}><GrosserKnopf ghost onClick={() => gehePhase(aktuell - 1)}>← Zurück</GrosserKnopf></div>}
          {fertigDiese && aktuell < anzahl - 1 && (
            <div style={{ flex: 1 }}><GrosserKnopf onClick={() => gehePhase(aktuell + 1)}>Weiter zu Phase {aktuell + 2} →</GrosserKnopf></div>
          )}
        </div>

        {alleFertig && aktuell === anzahl - 1 && (
          <div style={{ ...karte, marginTop: 20, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, margin: "0 0 6px" }}>Modul abgeschlossen</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>Du hast Mathematik aus den Axiomen hergeleitet.</p>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, margin: "0 0 6px", color: "#C9D6EE" }}>
              <T s="Aus zwei Rechenarten, ihren neutralen und inversen Elementen und dem Distributivgesetz hast du bewiesen: a · 0 = 0, dass es kein $\frac{1}{0}$ gibt und alle drei binomischen Formeln. Und du weißt jetzt, warum Kürzen, Erweitern und die quadratische Ergänzung funktionieren: Hinter allem steckt eine 1 oder eine 0." />
            </p>
            <GrosserKnopf gold onClick={onZurueck}>Zurück zu Mathe entdecken</GrosserKnopf>
          </div>
        )}

        {gesamt > 0 && (
          <div style={{ marginTop: 22, textAlign: "center" }}>
            {!bestaetige
              ? <KleinerLink onClick={() => setBestaetige(true)}>Modul von vorn beginnen</KleinerLink>
              : (
                <Rueck art="warn">
                  Dein Fortschritt in diesem Modul wird gelöscht.
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <div style={{ flex: 1 }}><GrosserKnopf ghost onClick={() => setBestaetige(false)}>Abbrechen</GrosserKnopf></div>
                    <div style={{ flex: 1 }}><GrosserKnopf onClick={() => { axiomeZuruecksetzen(); setStandLok(Array(anzahl).fill(0)); setPhase(0); setBestaetige(false); window.scrollTo(0, 0); }}>Ja, neu beginnen</GrosserKnopf></div>
                  </div>
                </Rueck>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export const AXIOM_PHASEN_TITEL = ["Warum Axiome?", "Die Addition – vier Gesetze", "Die Multiplikation – dieselben vier Gesetze", "Das Distributivgesetz – die Brücke", "Neutrale Elemente: 0 und 1",
  "Inverse Elemente: Es gibt nur zwei Rechenarten", "Beweis 1: a · 0 = 0", "Beweis 2: Es gibt kein 1/0", "Beweis 3: Die erste binomische Formel", "Beweis 4: Minus mal Plus – und die anderen Binomischen"];
