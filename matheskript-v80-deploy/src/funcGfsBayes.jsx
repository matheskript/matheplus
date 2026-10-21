import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, Inline, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  dk, pz, bayes, nachTests, haeufigkeiten, mitSeed, tausender,
  LABOR_START, VOREINSTELLUNGEN, pAusRegler, reglerAusP, P_MIN, P_MAX,
  ARTEN, aufgabe, auftrag, felder, pruefe, rechenweg, tipp, tafelZeilen, kontext,
  BEGRUENDUNGEN, gemischt, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsBayes.js";

/* ============================================================
   Kurs GFS – Themenseite „Der Satz von Bayes“
   (Lambacher Schweizer Kursstufe, Kapitel VIII Grundlagen der
   Wahrscheinlichkeitsrechnung; G8 Klasse 12, G9 Klasse 13)
   Aufbau wie die Dosen-Seite: Leitfrage · Herleitung in sechs Schritten mit
   vier Erkläranimationen · Bayes-Labor (Regler, Punktebild mit 1000 Personen,
   Vierfeldertafel, Baum und umgekehrter Baum, Kurve) · Übung (fünf Typen) ·
   Begründen · roter Faden · Kolloquium.
   Logik in gfsBayes.js. Kopfbild BayesBild (viewBox 160 × 120) unten.
   Die Vier-Felder-Tafel als Werkzeug wird verlinkt, nicht nachgebaut.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsbayes.ui.py) */
const merk = (a, k = "__gbAufgabe") => { if (typeof window !== "undefined") window[k] = a; return a; };
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
const T = (props) => <text fontFamily="inherit" {...props} />;
const mix = (a, b, p) => a + (b - a) * p;

/* Farben der vier Gruppen – überall gleich (Labor, Animationen, Kopfbild) */
const F = { kp: C.signal, kn: C.signal, gp: C.see, gn: "#D5DCE8" };
/* Wahrscheinlichkeit als Dezimalzahl: drei Stellen, sehr kleine Werte mit zwei geltenden Ziffern */
const fw = (x) => (x === 0 ? "0" : x >= 0.01 ? dk(x, 3) : dk(Number(x.toPrecision(2)), 8));
/* exakt (Regler: Prävalenz höchstens 4, Test höchstens 3 Dezimalen → Produkte höchstens 7) */
const fx = (x) => dk(x, 7);
const sind = (n) => (n === 1 ? "ist" : "sind");

/* ======================================================================
   Punktebild: 1000 Personen
   ====================================================================== */
const SP = 40, ZL = 25, ZELL = 8.5, PX0 = 180 - (SP / 2) * ZELL + ZELL / 2, PY0 = 10;
const ort = (i) => [PX0 + (i % SP) * ZELL, PY0 + Math.floor(i / SP) * ZELL];
/* feste Mischung der 1000 Plätze (für „gemischt“ und die Animation) */
const MISCHUNG = (() => {
  const z = mitSeed(20261021), idx = Array.from({ length: 1000 }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = z(0, i); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
})();
const ZUFALL_T = (() => { const z = mitSeed(7); return Array.from({ length: 1000 }, () => z(0, 1000) / 1000); })();
/* Gruppe der Person mit sortiertem Platz i */
const gruppeVon = (h, i) => (i < h.kp ? "kp" : i < h.krank ? "kn" : i < h.krank + h.gp ? "gp" : "gn");

function Punkt({ x, y, g, o = 1 }) {
  if (g === "kn") return <circle cx={x} cy={y} r="2.7" fill={C.weiss} stroke={F.kn} strokeWidth="1.3" opacity={o} />;
  return <circle cx={x} cy={y} r="3.2" fill={F[g]} opacity={o} />;
}

function PunkteBild({ h, gemischt: gem, nurPositive }) {
  const punkte = [];
  for (let i = 0; i < 1000; i++) {
    const g = gruppeVon(h, i);
    const [x, y] = ort(gem ? MISCHUNG[i] : i);
    punkte.push(<Punkt key={i} x={x} y={y} g={g} o={nurPositive && (g === "kn" || g === "gn") ? 0.18 : 1} />);
  }
  return (
    <svg viewBox="0 0 360 226" style={{ width: "100%", display: "block" }} role="img" data-punktebild=""
      aria-label={`1000 Personen: ${h.krank} krank, davon ${h.kp} positiv; ${h.gesund} gesund, davon ${h.gp} falsch positiv`}>
      {punkte}
    </svg>
  );
}

function Legende({ h }) {
  const eintrag = (g, text) => (
    <span className="flex items-center" style={{ gap: 6, fontSize: 12.5, color: C.tinte }}>
      <svg width="12" height="12" aria-hidden="true"><Punkt x={6} y={6} g={g} /></svg>{text}
    </span>
  );
  return (
    <div className="flex flex-wrap" style={{ gap: "6px 14px", margin: "8px 0 4px" }}>
      {eintrag("kp", `krank, positiv: ${h.kp}`)}
      {eintrag("kn", `krank, negativ: ${h.kn}`)}
      {eintrag("gp", `gesund, positiv: ${h.gp}`)}
      {eintrag("gn", `gesund, negativ: ${h.gn}`)}
    </div>
  );
}

/* ======================================================================
   Vierfeldertafel (Anzahlen von 1000 und Wahrscheinlichkeiten)
   ====================================================================== */
function Tafel({ r, h }) {
  const zelle = (n, wkt, hervor) => (
    <td style={{ padding: "8px 6px", textAlign: "center", borderTop: `1px solid ${C.linie}`, background: hervor ? "#FFF6D6" : "transparent" }}>
      <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: C.tinte }}>{n}</span>
      <span style={{ display: "block", fontSize: 11.5, color: C.grau }}>{fw(wkt)}</span>
    </td>
  );
  const kopf = { padding: "6px", fontSize: 12.5, fontWeight: 700, color: C.grau, textAlign: "center" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table data-labor-tafel="" style={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr><th style={kopf} /><th style={{ ...kopf, color: C.gold }}>positiv (+)</th><th style={kopf}>negativ (−)</th><th style={kopf}>Summe</th></tr>
        </thead>
        <tbody>
          <tr><th style={{ ...kopf, textAlign: "left", color: C.signal }}>krank (K)</th>{zelle(h.kp, r.kp, true)}{zelle(h.kn, r.kn)}{zelle(h.krank, r.p)}</tr>
          <tr><th style={{ ...kopf, textAlign: "left", color: C.see }}>gesund (K̄)</th>{zelle(h.gp, r.gp, true)}{zelle(h.gn, r.gn)}{zelle(h.gesund, 1 - r.p)}</tr>
          <tr><th style={{ ...kopf, textAlign: "left" }}>Summe</th>{zelle(h.pos, r.pPos, true)}{zelle(h.neg, r.pNeg)}{zelle(1000, 1)}</tr>
        </tbody>
      </table>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>
        Oben die Anzahl unter 1000 Personen (auf ganze Personen gerundet), darunter die Wahrscheinlichkeit. Gold: die Spalte „positiv“ –
        nur sie zählt für P(K | +).
      </p>
    </div>
  );
}

/* ======================================================================
   Baum und umgekehrter Baum (ein Bild, zwei Bäume)
   ====================================================================== */
function EinBaum({ x0, oben, unten, erste, zweite, blaetter, gold, titel }) {
  const R = [x0 + 6, 104], S1 = [[x0 + 58, 54], [x0 + 58, 154]];
  const B = [[x0 + 116, 28], [x0 + 116, 80], [x0 + 116, 128], [x0 + 116, 180]];
  const ast = (a, b, text, hell, key) => (
    <g key={key}>
      <line x1={a[0]} y1={a[1]} x2={b[0] - 8} y2={b[1]} stroke={hell ? C.gold : C.hellgrau} strokeWidth={hell ? 2.4 : 1.4} />
      <T x={(a[0] + b[0]) / 2 - 2} y={(a[1] + b[1]) / 2 - 4} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={hell ? C.gold : C.grau}>{text}</T>
    </g>
  );
  return (
    <g>
      <T x={x0 + 4} y="10" fontSize="10.5" fontWeight="800" fill={C.tinte}>{titel}</T>
      {ast(R, S1[0], erste[0], gold === "e0" || gold === "z0", "e0")}
      {ast(R, S1[1], erste[1], false, "e1")}
      {[0, 1, 2, 3].map((i) => ast(S1[i < 2 ? 0 : 1], B[i], zweite[i], gold === "z0" && i === 0, `z${i}`))}
      <circle cx={R[0]} cy={R[1]} r="3" fill={C.tinte} />
      {S1.map((p, i) => <T key={i} x={p[0]} y={p[1] + 4} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={i === 0 ? oben.farbe : unten.farbe}>{i === 0 ? oben.text : unten.text}</T>)}
      {B.map((p, i) => (
        <g key={i}>
          <T x={p[0]} y={p[1] + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={blaetter[i].farbe}>{blaetter[i].text}</T>
          <T x={x0 + 170} y={p[1] + 4} textAnchor="end" fontSize="9.5" fontWeight="600" fill={C.grau}>{blaetter[i].wert}</T>
        </g>
      ))}
    </g>
  );
}
function Baeume({ r }) {
  const ppvN = r.pNeg > 0 ? r.kn / r.pNeg : 0;
  return (
    <svg viewBox="0 0 360 192" style={{ width: "100%", display: "block" }} role="img" data-labor-baeume=""
      aria-label={`Baum: P(K) = ${fw(r.p)}, P(+ | K) = ${fw(r.se)}, P(+ | K̄) = ${fw(1 - r.sp)}. Umgekehrter Baum: P(+) = ${fw(r.pPos)}, P(K | +) = ${fw(r.ppv)}`}>
      <EinBaum x0={0} titel="Baum: erst krank oder gesund"
        oben={{ text: "K", farbe: C.signal }} unten={{ text: "K̄", farbe: C.see }}
        erste={[fw(r.p), fw(1 - r.p)]} zweite={[fw(r.se), fw(1 - r.se), fw(1 - r.sp), fw(r.sp)]}
        blaetter={[{ text: "+", farbe: C.gold, wert: fw(r.kp) }, { text: "−", farbe: C.grau, wert: fw(r.kn) }, { text: "+", farbe: C.gold, wert: fw(r.gp) }, { text: "−", farbe: C.grau, wert: fw(r.gn) }]} />
      <line x1="180" y1="18" x2="180" y2="186" stroke={C.linie} strokeWidth="1" />
      <EinBaum x0={188} titel="Umgekehrt: erst das Ergebnis" gold="z0"
        oben={{ text: "+", farbe: C.gold }} unten={{ text: "−", farbe: C.grau }}
        erste={[fw(r.pPos), fw(r.pNeg)]} zweite={[fw(r.ppv), fw(1 - r.ppv), fw(ppvN), fw(1 - ppvN)]}
        blaetter={[{ text: "K", farbe: C.signal, wert: fw(r.kp) }, { text: "K̄", farbe: C.see, wert: fw(r.gp) }, { text: "K", farbe: C.signal, wert: fw(r.kn) }, { text: "K̄", farbe: C.see, wert: fw(r.gn) }]} />
    </svg>
  );
}

/* ======================================================================
   Kurve: P(K | +) über der Prävalenz (logarithmische Achse)
   ====================================================================== */
const KX0 = 44, KX1 = 344, KY0 = 168, KY1 = 14;
const kx = (pProzent) => KX0 + ((KX1 - KX0) * Math.log(pProzent / P_MIN)) / Math.log(P_MAX / P_MIN);
const ky = (v) => KY0 - (KY0 - KY1) * v;
function kurvenPunkte(se, sp) {
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const pp = P_MIN * (P_MAX / P_MIN) ** (i / 120);
    pts.push(`${kx(pp).toFixed(1)},${ky(bayes(pp / 100, se, sp).ppv).toFixed(1)}`);
  }
  return pts.join(" ");
}
function Achsen() {
  return (
    <g>
      <line x1={KX0} y1={KY0} x2={KX1} y2={KY0} stroke={C.tinte} strokeWidth="1" />
      <line x1={KX0} y1={KY0} x2={KX0} y2={KY1 - 4} stroke={C.tinte} strokeWidth="1" />
      {[[0.1, "0,1 %"], [1, "1 %"], [10, "10 %"], [50, "50 %"]].map(([v, t]) => (
        <g key={t}><line x1={kx(v)} y1={KY0} x2={kx(v)} y2={KY0 + 4} stroke={C.tinte} /><T x={kx(v)} y={KY0 + 15} textAnchor="middle" fontSize="10" fill={C.grau}>{t}</T></g>
      ))}
      {[[0, "0 %"], [0.5, "50 %"], [1, "100 %"]].map(([v, t]) => (
        <g key={t}><line x1={KX0} y1={ky(v)} x2={KX1} y2={ky(v)} stroke={C.linie} strokeDasharray={v === 0.5 ? "4 3" : undefined} /><T x={KX0 - 5} y={ky(v) + 3.5} textAnchor="end" fontSize="10" fill={C.grau}>{t}</T></g>
      ))}
      <T x={KX1} y={KY0 + 28} textAnchor="end" fontSize="10.5" fontWeight="700" fill={C.grau}>Prävalenz P(K)</T>
      <T x={KX0 + 4} y={KY1 - 2} fontSize="10.5" fontWeight="700" fill={C.grau}>P(K | +)</T>
    </g>
  );
}
function Kurve({ r, pProzent }) {
  return (
    <svg viewBox="0 0 360 202" style={{ width: "100%", display: "block" }} role="img" data-labor-kurve=""
      aria-label={`Kurve: Wahrscheinlichkeit, bei positivem Test krank zu sein, abhängig von der Prävalenz. Bei ${dk(pProzent, 2)} % sind es ${pz(100 * r.ppv)}.`}>
      <Achsen />
      <polyline points={kurvenPunkte(r.se, r.sp)} fill="none" stroke={C.tinte} strokeWidth="2.2" strokeLinecap="round" />
      <line x1={kx(pProzent)} y1={KY0} x2={kx(pProzent)} y2={ky(r.ppv)} stroke={C.gold} strokeDasharray="3 3" />
      <circle cx={kx(pProzent)} cy={ky(r.ppv)} r="5" fill={C.flaggold} stroke={C.gold} strokeWidth="1.4" />
      <T x={Math.min(KX1 - 4, kx(pProzent) + 8)} y={ky(r.ppv) - 8} textAnchor={kx(pProzent) > 290 ? "end" : "start"} fontSize="11.5" fontWeight="800" fill={C.gold}>{pz(100 * r.ppv)}</T>
    </svg>
  );
}

/* ======================================================================
   Das Labor
   ====================================================================== */
function Regler({ label, wert, anzeige, min, max, step, setzen, hilfe }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="flex items-baseline" style={{ gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.tinte }}>{label}</span>
        <span style={{ fontSize: 12, color: C.grau, fontWeight: 300 }}>{hilfe}</span>
        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 800, color: C.see, fontVariantNumeric: "tabular-nums" }}>{anzeige}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={wert} onChange={(e) => setzen(parseFloat(e.target.value))} aria-label={label}
        style={{ width: "100%", accentColor: C.see, margin: "4px 0 0", cursor: "pointer" }} />
    </div>
  );
}

const ANSICHTEN = [{ id: "tafel", name: "Vierfeldertafel" }, { id: "baum", name: "Zwei Bäume" }, { id: "kurve", name: "Kurve" }];

function BayesLabor() {
  const [p, setP] = useState(LABOR_START.p);
  const [se, setSe] = useState(LABOR_START.se);
  const [sp, setSp] = useState(LABOR_START.sp);
  const [ansicht, setAnsicht] = useState("tafel");
  const [gem, setGem] = useState(false);
  const [nurPos, setNurPos] = useState(false);
  const r = bayes(p / 100, se / 100, sp / 100);
  const h = haeufigkeiten(1000, p / 100, se / 100, sp / 100);
  const zweit = nachTests(p / 100, se / 100, sp / 100, 2);
  const gesetzt = VOREINSTELLUNGEN.find((v) => v.p === p && v.se === se && v.sp === sp);
  return (
    <div data-bayes-labor="">
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 14 }}>
        {VOREINSTELLUNGEN.map((v) => {
          const an = gesetzt && gesetzt.id === v.id;
          return (
            <button key={v.id} type="button" onClick={() => { setP(v.p); setSe(v.se); setSp(v.sp); }} aria-pressed={!!an}
              style={{ padding: "6px 11px", borderRadius: 999, border: `1px solid ${an ? C.flaggold : C.linie}`, background: an ? "#FFF6D6" : C.weiss,
                color: an ? C.tinte : C.grau, fontSize: 12.5, fontWeight: an ? 600 : 400, fontFamily: "inherit", cursor: "pointer" }}>{v.name}</button>
          );
        })}
      </div>

      <Regler label="Prävalenz" hilfe="Anteil der Kranken, P(K)" wert={reglerAusP(p)} min={0} max={100} step={0.1}
        anzeige={`${dk(p, 2)} %`} setzen={(v) => setP(pAusRegler(v))} />
      <Regler label="Sensitivität" hilfe="Kranke positiv, P(+ | K)" wert={se} min={50} max={99.9} step={0.1}
        anzeige={`${dk(se, 1)} %`} setzen={(v) => setSe(Math.round(v * 10) / 10)} />
      <Regler label="Spezifität" hilfe="Gesunde negativ, P(− | K̄)" wert={sp} min={50} max={99.9} step={0.1}
        anzeige={`${dk(sp, 1)} %`} setzen={(v) => setSp(Math.round(v * 10) / 10)} />

      {/* Ergebnis, live */}
      <div data-bayes-ergebnis="" style={{ borderRadius: 14, padding: "14px 16px", margin: "6px 0 14px", color: C.weiss,
        background: `linear-gradient(160deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="flex flex-wrap items-baseline" style={{ gap: "4px 12px" }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.flaggold, letterSpacing: "0.03em" }}>KRANK, WENN POSITIV · P(K | +)</span>
          <span data-ppv="" style={{ marginLeft: "auto", fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{pz(100 * r.ppv)}</span>
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, color: "#E6ECF8", marginTop: 4 }}>
          Von {h.pos} positiv Getesteten {sind(h.kp)} {h.kp} wirklich krank – {h.gp} {sind(h.gp)} falscher Alarm (von 1000 Personen, gerundet).
        </p>
        <div className="flex flex-wrap" style={{ gap: "4px 18px", marginTop: 8, fontSize: 12.5, color: "#C9D6EE" }}>
          <span>Zweiter Test auch positiv: <b style={{ color: C.weiss }}>{pz(100 * zweit)}</b></span>
          <span>Negativ, trotzdem krank: <b style={{ color: C.weiss }}>{pz(100 * r.rest, 2)}</b></span>
        </div>
      </div>

      <PunkteBild h={h} gemischt={gem} nurPositive={nurPos} />
      <Legende h={h} />
      <div className="flex flex-wrap" style={{ gap: 14, margin: "4px 0 16px" }}>
        <button type="button" onClick={() => setGem((g) => !g)} style={LINK}>{gem ? "Sortiert zeigen" : "Gemischt zeigen (wie in echt)"}</button>
        <button type="button" onClick={() => setNurPos((n) => !n)} style={LINK}>{nurPos ? "Alle zeigen" : "Nur die Positiven zeigen"}</button>
      </div>

      <div className="flex flex-wrap gap-2" style={{ marginBottom: 12 }}>
        {ANSICHTEN.map((a) => <Chip key={a.id} aktiv={ansicht === a.id} onClick={() => setAnsicht(a.id)}>{a.name}</Chip>)}
      </div>
      {ansicht === "tafel" && <Tafel r={r} h={h} />}
      {ansicht === "baum" && <Baeume r={r} />}
      {ansicht === "kurve" && <Kurve r={r} pProzent={p} />}

      <Formeln zeilen={[
        `P(K \\cap +) = ${fx(r.p)} \\cdot ${fx(r.se)} = ${fx(r.kp)}`,
        `P(\\overline{K} \\cap +) = ${fx(1 - r.p)} \\cdot ${fx(1 - r.sp)} = ${fx(r.gp)}`,
        `P(K \\mid +) = \\frac{${fx(r.kp)}}{${fx(r.kp)} + ${fx(r.gp)}} \\approx ${pz(100 * r.ppv).replace(" %", "\\,\\%")}`,
      ]} max={14} min={14} />
    </div>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen = reine Funktionen der Zeit; Schlussbild = Standbild)
   ====================================================================== */
function Pille({ x = 180, y, text, o = 1, farbe = C.see, breite }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(70, String(text).length * 7.2 + 24);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 17} width={w} height={26} rx="13" fill={C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe}>{text}</T>
    </g>
  );
}

/* ---------- 1 · 1000 Personen werden sortiert ---------- */
const H0 = haeufigkeiten(1000, 0.02, 0.9, 0.95);   // 20 krank (18 +, 2 −), 980 gesund (49 +, 931 −)
const S_DAUER = 24;
const sSchritte = () => [
  { von: 0, text: "1000 Personen, bunt gemischt – so, wie sie zum Test kommen. Noch weiß niemand, wer krank ist." },
  { von: 3.5, text: "2 % sind krank: 20 Personen. Sie gehen in der Menge fast unter." },
  { von: 7.5, text: "Jetzt der Test. Von den 20 Kranken werden 18 erkannt (90 %), 2 übersehen. Aber auch 5 % der 980 Gesunden testen positiv: 49 falsche Alarme." },
  { von: 12, text: "Wir sortieren: zuerst die Kranken, dann die Gesunden mit positivem Ergebnis, dann der Rest." },
  { von: 16.5, text: "Nur die Positiven zählen für die Frage. Es sind 67 – und nur 18 davon sind krank. P(K | +) = 18/67 ≈ 26,9 %." },
];
function sZeichne(t) {
  const da = lauf(t, 0.2, 2.6), dunkel = lauf(t, 16.6, 18.2), bar = lauf(t, 17, 19.5), pille = lauf(t, 20, 21.2);
  const punkte = [];
  for (let i = 0; i < 1000; i++) {
    const g = gruppeVon(H0, i), z = ZUFALL_T[i];
    const krank = g === "kp" || g === "kn";
    const getestet = t > 7.8 + 3 * z;
    let farbe = krank && t > 3.6 + 2.2 * z ? "kp" : "grau";
    if (getestet) farbe = g;
    const s = lauf(t, 12.2 + 2.4 * z, 13.6 + 2.4 * z);
    const [x1, y1] = ort(MISCHUNG[i]), [x2, y2] = ort(i);
    const o = da * ((g === "kn" || g === "gn") ? 1 - 0.82 * dunkel : 1);
    punkte.push(farbe === "grau"
      ? <circle key={i} cx={mix(x1, x2, s)} cy={mix(y1, y2, s)} r="3" fill={C.hellgrau} opacity={o} />
      : <Punkt key={i} x={mix(x1, x2, s)} y={mix(y1, y2, s)} g={farbe} o={o} />);
  }
  const bk = 300 * (18 / 67);
  return (
    <g>
      {punkte}
      <T x="180" y="238" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.signal} opacity={lauf(t, 4, 5) * (1 - lauf(t, 7.5, 8.2))}>20 von 1000 sind krank</T>
      <T x="180" y="238" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.tinte} opacity={lauf(t, 8.6, 9.6) * (1 - lauf(t, 16.4, 17))}>
        <tspan fill={C.signal}>18 erkannt</tspan> · <tspan fill={C.see}>49 falscher Alarm</tspan>
      </T>
      {bar > 0.001 && (
        <g opacity={bar}>
          <rect x="30" y="226" width={bk * bar} height="20" rx="4" fill={F.kp} />
          <rect x={30 + bk * bar} y="226" width={(300 - bk) * bar} height="20" rx="4" fill={F.gp} />
          <T x={30 + (bk * bar) / 2} y="240" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.weiss}>18</T>
          <T x={30 + bk * bar + ((300 - bk) * bar) / 2} y="240" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.weiss}>49</T>
          <T x="180" y="262" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau}>alle 67 Positiven</T>
        </g>
      )}
      <Pille y={288} text="P(K | +) = 18/67 ≈ 26,9 %" o={pille} farbe={C.gold} breite={230} />
    </g>
  );
}

/* ---------- 2 · Der Baum wird umgedreht ---------- */
const R0 = bayes(0.02, 0.9, 0.95);
const U_DAUER = 27;
const uSchritte = () => [
  { von: 0, text: "Der gewohnte Baum beginnt mit dem Zustand: krank (K) oder gesund (K̄). Auf der zweiten Stufe steht der Test – die Werte kennen wir aus der Beschreibung des Tests." },
  { von: 5, text: "Pfadregel: Multipliziert man entlang der Äste, erhält man die vier Schnittwahrscheinlichkeiten, zum Beispiel P(K ∩ +) = 0,02 · 0,9 = 0,018." },
  { von: 9.5, text: "Diese vier Zahlen ordnen wir in eine Vierfeldertafel: Zeilen krank und gesund, Spalten positiv und negativ." },
  { von: 14, text: "Die Spaltensummen sind die totale Wahrscheinlichkeit: P(+) = 0,018 + 0,049 = 0,067." },
  { von: 18, text: "Jetzt der umgekehrte Baum: Er beginnt mit dem Ergebnis. Auf seinem Ast von + nach K steht P(K | +) = 0,018 / 0,067 ≈ 0,269 – der Satz von Bayes." },
];
const BL = [[226, 40], [226, 106], [226, 172], [226, 238]];            // Blätter des Baums
const TZ = [[188, 118], [272, 118], [188, 160], [272, 160]];           // Tafel: K+, K−, K̄+, K̄−
const UB = [[226, 40], [226, 172], [226, 106], [226, 238]];            // umgekehrter Baum: K+ → oben, K− → drittes Blatt …
function baumBild(o, erste, zweite, k1, k2, blatt, hell) {
  if (o <= 0.001) return null;
  const R = [26, 139], S = [[116, 73], [116, 205]];
  const ast = (a, b, text, gold, key) => (
    <g key={key}>
      <line x1={a[0]} y1={a[1]} x2={b[0] - 10} y2={b[1]} stroke={gold ? C.gold : C.hellgrau} strokeWidth={gold ? 2.6 : 1.5} />
      <T x={(a[0] + b[0]) / 2 - 4} y={(a[1] + b[1]) / 2 - 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={gold ? C.gold : C.grau}>{text}</T>
    </g>
  );
  return (
    <g opacity={o}>
      {ast(R, S[0], erste[0], hell, "a")}{ast(R, S[1], erste[1], false, "b")}
      {[0, 1, 2, 3].map((i) => ast(S[i < 2 ? 0 : 1], BL[i], zweite[i], hell && i === 0, `z${i}`))}
      <circle cx={R[0]} cy={R[1]} r="3.5" fill={C.tinte} />
      {S.map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r="10" fill={C.weiss} stroke={i === 0 && hell ? C.gold : C.linie} strokeWidth="1.2" />)}
      <T x={S[0][0]} y={S[0][1] + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={k1.farbe}>{k1.text}</T>
      <T x={S[1][0]} y={S[1][1] + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={k2.farbe}>{k2.text}</T>
      {BL.map((p, i) => <T key={i} x={p[0]} y={p[1] + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill={blatt[i].farbe}>{blatt[i].text}</T>)}
    </g>
  );
}
function uZeichne(t) {
  const baum = lauf(t, 0.3, 1.8) * (1 - lauf(t, 9.6, 11));
  const prod = lauf(t, 5.4, 7);
  const zurTafel = lauf(t, 10, 12.4), tafel = lauf(t, 10.4, 11.6) * (1 - lauf(t, 18, 19));
  const summe = lauf(t, 14.3, 15.6) * (1 - lauf(t, 18, 19));
  const zumBaum = lauf(t, 18.4, 20.8), ubaum = lauf(t, 19, 20.6), bayesO = lauf(t, 21.6, 23);
  const werte = [R0.kp, R0.kn, R0.gp, R0.gn];
  const etiketten = ["K ∩ +", "K ∩ −", "K̄ ∩ +", "K̄ ∩ −"];
  return (
    <g>
      {baumBild(baum, ["0,02", "0,98"], ["0,9", "0,1", "0,05", "0,95"], { text: "K", farbe: C.signal }, { text: "K̄", farbe: C.see },
        [{ text: "+", farbe: C.gold }, { text: "−", farbe: C.grau }, { text: "+", farbe: C.gold }, { text: "−", farbe: C.grau }], false)}
      {baumBild(ubaum, ["0,067", "0,933"], [bayesO > 0.5 ? "0,269" : "?", bayesO > 0.5 ? "0,731" : "?", "0,002", "0,998"], { text: "+", farbe: C.gold }, { text: "−", farbe: C.grau },
        [{ text: "K", farbe: C.signal }, { text: "K̄", farbe: C.see }, { text: "K", farbe: C.signal }, { text: "K̄", farbe: C.see }], bayesO > 0.5)}
      {/* Tafel */}
      {tafel > 0.001 && (
        <g opacity={tafel}>
          <T x="188" y="94" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gold}>+</T>
          <T x="272" y="94" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.grau}>−</T>
          <T x="120" y="122" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.signal}>K</T>
          <T x="120" y="164" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.see}>K̄</T>
          <line x1="140" y1="100" x2="320" y2="100" stroke={C.linie} /><line x1="140" y1="140" x2="320" y2="140" stroke={C.linie} />
          <line x1="140" y1="180" x2="320" y2="180" stroke={C.tinte} strokeWidth="1.2" opacity={summe} />
          <line x1="230" y1="84" x2="230" y2="216" stroke={C.linie} />
          <rect x="146" y="100" width="82" height="118" rx="6" fill="none" stroke={C.flaggold} strokeWidth="2" opacity={summe} />
          <T x="188" y="204" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gold} opacity={summe}>0,067</T>
          <T x="272" y="204" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.grau} opacity={summe}>0,933</T>
          <T x="120" y="204" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.grau} opacity={summe}>Summe</T>
        </g>
      )}
      {/* die vier Schnittwahrscheinlichkeiten wandern: Blatt → Tafel → Blatt des umgekehrten Baums */}
      {werte.map((v, i) => {
        const a = [BL[i][0] + 70, BL[i][1]], b = TZ[i], c = [UB[i][0] + 70, UB[i][1]];
        const x = zumBaum > 0 ? mix(b[0], c[0], zumBaum) : mix(a[0], b[0], zurTafel);
        const y = zumBaum > 0 ? mix(b[1], c[1], zumBaum) : mix(a[1], b[1], zurTafel);
        const gold = i === 0 && bayesO > 0.5;
        return (
          <g key={i} opacity={prod}>
            <T x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill={gold ? C.gold : C.tinte}>{dk(v, 3)}</T>
            <T x={x} y={y + 19} textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.grau} opacity={1 - tafel}>{etiketten[i]}</T>
          </g>
        );
      })}
      <Pille y={282} text="P(K | +) = 0,018 / 0,067 ≈ 0,269" o={bayesO} farbe={C.gold} breite={250} />
    </g>
  );
}

/* ---------- 3 · Der Basisratenfehler: P(K | +) über der Prävalenz ---------- */
const B_DAUER = 24;
const P_HALB = (0.05 / 0.95) * 100;                                   // ab hier ist mehr als die Hälfte der Positiven krank
const bSchritte = () => [
  { von: 0, text: "Derselbe Test (90 % Sensitivität, 95 % Spezifität) – aber in Gruppen, in denen die Krankheit verschieden häufig ist. Waagerecht die Prävalenz, senkrecht P(K | +)." },
  { von: 4, text: "Die Kurve: Je seltener die Krankheit, desto weniger sagt ein positives Ergebnis. Bei 2 % sind es 26,9 %, bei 0,1 % nicht einmal 2 %." },
  { von: 10, text: "Unter etwa 5,3 % Prävalenz ist die Mehrheit der Positiven gesund. Wer hier von der Trefferquote auf das eigene Risiko schließt, begeht den Basisratenfehler." },
  { von: 15.5, text: "Ein besserer Test (99 % und 99 %) hebt die Kurve an: bei 2 % schon 66,9 %. Aber auch er hilft bei sehr seltenen Krankheiten wenig – bei 0,1 % sind es nur 9 %." },
];
function bZeichne(t) {
  const achse = lauf(t, 0.2, 1.4), k1 = lauf(t, 4.2, 8), punkt = lauf(t, 7.6, 8.6), wandern = lauf(t, 8.8, 9.8);
  const zone = lauf(t, 10.4, 12), k2 = lauf(t, 15.8, 19.5), punkt2 = lauf(t, 19.2, 20.2), pille = lauf(t, 20.6, 21.8);
  const teil = (se, sp, bis) => {
    const pts = [];
    const n = Math.round(120 * bis);
    for (let i = 0; i <= n; i++) { const pp = P_MIN * (P_MAX / P_MIN) ** (i / 120); pts.push(`${kx(pp).toFixed(1)},${ky(bayes(pp / 100, se, sp).ppv).toFixed(1)}`); }
    return pts.length > 1 ? pts.join(" ") : null;
  };
  const p1 = teil(0.9, 0.95, k1), p2 = teil(0.99, 0.99, k2);
  const pBeweg = mix(2, 0.1, wandern), r1 = bayes(pBeweg / 100, 0.9, 0.95);
  return (
    <g transform="translate(0 24)">
      <g opacity={achse}><Achsen /></g>
      {zone > 0.001 && <rect x={KX0} y={ky(0.5)} width={(kx(P_HALB) - KX0) * zone} height={KY0 - ky(0.5)} fill={C.signal} opacity={0.1} />}
      {zone > 0.001 && <T x={(KX0 + kx(P_HALB)) / 2} y={ky(0.5) - 6} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.signal} opacity={zone * (1 - lauf(t, 15.4, 16.2))}>Mehrheit der Positiven gesund</T>}
      {zone > 0.001 && <line x1={kx(P_HALB)} y1={ky(0.5)} x2={kx(P_HALB)} y2={KY0} stroke={C.signal} strokeDasharray="3 3" opacity={zone} />}
      {zone > 0.001 && <T x={kx(P_HALB)} y={KY0 - 4} textAnchor="middle" fontSize="10" fontWeight="800" fill={C.signal} opacity={zone}>5,3 %</T>}
      {p1 && <polyline points={p1} fill="none" stroke={C.tinte} strokeWidth="2.4" strokeLinecap="round" />}
      {p2 && <polyline points={p2} fill="none" stroke={C.gold} strokeWidth="2.4" strokeDasharray="6 4" strokeLinecap="round" />}
      {punkt > 0.001 && (
        <g opacity={punkt * (1 - 0.6 * zone)}>
          <circle cx={kx(pBeweg)} cy={ky(r1.ppv)} r="5" fill={C.see} stroke={C.weiss} strokeWidth="1.5" />
          <T x={kx(pBeweg) + 9} y={ky(r1.ppv) - 7} fontSize="11.5" fontWeight="800" fill={C.see}>{pz(100 * r1.ppv)}</T>
        </g>
      )}
      {punkt2 > 0.001 && (
        <g opacity={punkt2}>
          <circle cx={kx(2)} cy={ky(bayes(0.02, 0.99, 0.99).ppv)} r="5" fill={C.flaggold} stroke={C.gold} strokeWidth="1.4" />
          <T x={kx(2) + 9} y={ky(bayes(0.02, 0.99, 0.99).ppv) + 16} textAnchor="start" fontSize="11.5" fontWeight="800" fill={C.gold}>66,9 %</T>
          <line x1={KX0 + 12} y1={KY1 + 14} x2={KX0 + 34} y2={KY1 + 14} stroke={C.tinte} strokeWidth="2.4" />
          <T x={KX0 + 40} y={KY1 + 18} fontSize="10.5" fontWeight="700" fill={C.tinte}>Test 90 % / 95 %</T>
          <line x1={KX0 + 12} y1={KY1 + 30} x2={KX0 + 34} y2={KY1 + 30} stroke={C.gold} strokeWidth="2.4" strokeDasharray="6 4" />
          <T x={KX0 + 40} y={KY1 + 34} fontSize="10.5" fontWeight="700" fill={C.gold}>Test 99 % / 99 %</T>
        </g>
      )}
      <Pille y={238} text="Seltene Krankheit: meist falscher Alarm" o={pille} farbe={C.signal} breite={280} />
    </g>
  );
}

/* ---------- 4 · Zwei Tests hintereinander ---------- */
const Z_DAUER = 23;
const zSchritte = () => [
  { von: 0, text: "Wir nehmen 100 000 Personen, damit alle Zahlen ganz bleiben. 2 % sind krank: 2 000 gegen 98 000 Gesunde – der rote Streifen ist kaum zu sehen." },
  { von: 5, text: "Erster Test positiv: 1 800 Kranke (90 % von 2 000) und 4 900 Gesunde (5 % von 98 000). Unter den Positiven sind 26,9 % krank." },
  { von: 10.5, text: "Nur diese 6 700 Positiven gehen zum zweiten, unabhängigen Test. Von den Kranken sind wieder 90 % positiv (1 620), von den Gesunden nur 5 % (245)." },
  { von: 16, text: "Nach zwei positiven Tests sind 86,9 % krank. In Chancen gerechnet: Jeder positive Test multipliziert die Chance mit 0,9 / 0,05 = 18." },
];
function zZeichne(t) {
  const stufen = [
    { y: 46, k: 2000, g: 98000, kopf: "100 000 Personen", o: lauf(t, 0.3, 1.6), quote: null },
    { y: 132, k: 1800, g: 4900, kopf: "erster Test positiv: 6 700", o: lauf(t, 5.3, 6.8), quote: "26,9 %" },
    { y: 218, k: 1620, g: 245, kopf: "auch der zweite positiv: 1 865", o: lauf(t, 10.8, 12.4), quote: "86,9 %" },
  ];
  const quoteO = [0, lauf(t, 7.4, 8.4), lauf(t, 13.6, 14.6)];
  const chance = lauf(t, 16.4, 17.8);
  const zahl = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (
    <g>
      {stufen.map((s, i) => {
        if (s.o <= 0.001) return null;
        const wk = Math.max(3, (230 * s.k) / (s.k + s.g));
        return (
          <g key={i} opacity={s.o}>
            <T x="20" y={s.y - 14} fontSize="12" fontWeight="800" fill={C.tinte}>{s.kopf}</T>
            <rect x="20" y={s.y - 4} width={wk * s.o} height="26" rx="4" fill={F.kp} />
            <rect x={20 + wk * s.o} y={s.y - 4} width={(230 - wk) * s.o} height="26" rx="4" fill={F.gp} />
            <T x="20" y={s.y + 38} fontSize="11" fontWeight="700" fill={C.signal}>{zahl(s.k)} krank</T>
            <T x="250" y={s.y + 38} textAnchor="end" fontSize="11" fontWeight="700" fill={C.see}>{zahl(s.g)} gesund</T>
            {s.quote && <Pille x={300} y={s.y + 14} text={s.quote} o={quoteO[i]} farbe={C.gold} breite={84} />}
            {i > 0 && <T x="300" y={s.y - 14} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.gold} opacity={quoteO[i]}>P(K | +{i === 2 ? "+" : ""})</T>}
          </g>
        );
      })}
      <T x="180" y="290" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.tinte} opacity={chance}>
        Chance <tspan fill={C.grau}>1 : 49</tspan>  <tspan fontSize="11" fill={C.grau}>·18 ⟶</tspan>  <tspan fill={C.gold}>18 : 49</tspan>  <tspan fontSize="11" fill={C.grau}>·18 ⟶</tspan>  <tspan fill={C.gold}>324 : 49</tspan>
      </T>
    </g>
  );
}

export const BAYES_ANIM = {
  sortieren: { titel: () => "1000 Personen werden sortiert", unter: () => "Wie viele der Positiven sind wirklich krank? Nur 18 von 67",
    szene: () => ({ dauer: S_DAUER, hoehe: 304, schritte: sSchritte(), zeichne: sZeichne,
      beschreibung: "Animation: 1000 Punkte für 1000 Personen. 20 sind krank, der Test erkennt 18 davon, dazu kommen 49 falsche Alarme bei Gesunden. Die Punkte sortieren sich; von 67 Positiven sind 18 krank, also etwa 26,9 %." }) },
  umdrehen: { titel: () => "Der Baum wird umgedreht", unter: () => "Baum → Vierfeldertafel → umgekehrter Baum: so entsteht der Satz von Bayes",
    szene: () => ({ dauer: U_DAUER, hoehe: 298, schritte: uSchritte(), zeichne: uZeichne,
      beschreibung: "Animation: Ein Baum mit erster Stufe krank oder gesund liefert vier Pfadwahrscheinlichkeiten. Sie wandern in eine Vierfeldertafel, die Spaltensumme ergibt P(+) = 0,067, und ein umgekehrter Baum beginnt mit dem Testergebnis. Auf seinem Ast steht P(K | +) ≈ 0,269." }) },
  basisrate: { titel: () => "Der Basisratenfehler", unter: () => "Je seltener die Krankheit, desto weniger sagt ein positives Ergebnis",
    szene: () => ({ dauer: B_DAUER, hoehe: 270, schritte: bSchritte(), zeichne: bZeichne,
      beschreibung: "Animation: Graph von P(K | +) über der Prävalenz auf logarithmischer Achse für einen Test mit 90 % Sensitivität und 95 % Spezifität. Unter 5,3 % Prävalenz ist die Mehrheit der Positiven gesund. Ein besserer Test mit 99 % und 99 % hebt die Kurve an." }) },
  zweiter: { titel: () => "Zwei Tests hintereinander", unter: () => "Das erste Ergebnis wird zur neuen Ausgangslage: aus 26,9 % werden 86,9 %",
    szene: () => ({ dauer: Z_DAUER, hoehe: 300, schritte: zSchritte(), zeichne: zZeichne,
      beschreibung: "Animation: 100 000 Personen, 2 000 krank. Nach dem ersten positiven Test bleiben 1 800 Kranke und 4 900 Gesunde, also 26,9 %. Nach dem zweiten 1 620 Kranke und 245 Gesunde, also 86,9 %. In Chancen: 1 : 49, dann 18 : 49, dann 324 : 49." }) },
};

export function BayesAnimation({ art, offen = false }) {
  return <AnimKarte szenen={BAYES_ANIM} art={art} offen={offen} merkmal="data-bayes-anim" />;
}

/* ======================================================================
   Übung: fünf Aufgabentypen
   ====================================================================== */
const ARIA = { kp: "Anzahl mit Merkmal und positiv", gp: "Anzahl ohne Merkmal und positiv", ppv: "Wahrscheinlichkeit bei positivem Ergebnis",
  ppv1: "nach dem ersten Test", ppv2: "nach dem zweiten Test", sens: "Trefferquote", rest: "Restrisiko" };

function Feld({ k, tex, einheit, wert, setzen, stand, onEnter }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span><M t={`${tex} =`} /></span>
      <input value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        inputMode="decimal" aria-label={ARIA[k]} data-feld={k} placeholder="?" style={{ ...ZELLE(stand), width: einheit === "%" ? 84 : 76 }} />
      <span style={{ fontSize: 13.5, color: C.grau }}>{einheit === "%" ? "%" : ""}</span>
    </label>
  );
}

function Stufen({ stufe, setzen }) {
  return (
    <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
      <PlusMinus setzen={(d) => setzen(stufe + d)} label="Schwierigkeit" />
      <div className="flex" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ width: 9, height: 9, borderRadius: 999, background: s <= stufe ? C.see : C.linie, display: "inline-block" }} />)}
      </div>
      <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>
    </div>
  );
}

function AufgabenTafel({ a }) {
  const { kopf, zeilen } = tafelZeilen(a);
  const zelle = { padding: "7px 6px", textAlign: "center", borderTop: `1px solid ${C.linie}`, fontSize: 15, color: C.tinte, fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 14px" }}>
      <table data-aufgaben-tafel="" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{kopf.map((k, i) => <th key={i} style={{ ...zelle, borderTop: "none", fontSize: 12.5, fontWeight: 700, color: C.grau }}>{k}</th>)}</tr></thead>
        <tbody>{zeilen.map((z) => (
          <tr key={z[0]}>{z.map((w, i) => i === 0
            ? <th key={i} style={{ ...zelle, textAlign: "left", fontSize: 12.5, fontWeight: 700, color: C.grau }}>{w}</th>
            : <td key={i} style={{ ...zelle, fontWeight: i === 3 || z[0] === "Summe" ? 700 : 400 }}>{tausender(w)}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function BayesTrainer() {
  const [art, setArt] = useState("ppv");
  const [stufe, setStufe] = useState(2);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("ppv", 2)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const fe = felder(auf);
  const leer = fe.some(([k]) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Fünf Typen mit immer neuen Zahlen und Kontexten – Virustest, Dopingkontrolle, Prüfgerät, Spamfilter. Prozentwerte gibst du in Prozent ein
        („26,9“), Anzahlen als ganze Zahl. Ein Bruch wie „18/67“ geht auch.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-bayestrainer="">
        <p style={{ fontSize: 11.5, fontWeight: 700, color: "#A67C00", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
          {ARTEN.find((x) => x.id === auf.art).name} · {kontext(auf).b} = {kontext(auf).ja}
        </p>
        <p style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.7, marginBottom: 12 }}>{auftrag(auf)}</p>
        {auf.art === "tafel" && <AufgabenTafel a={auf} />}
        <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
          {fe.map(([k, tex, einheit]) => (
            <Feld key={k} k={k} tex={tex} einheit={einheit} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} />
          ))}
        </div>
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            <Formeln zeilen={rechenweg(auf)} max={14} min={14} farbe={C.see} />
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <Text s={erg.grund || tipp(auf)} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }} />
            {!zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>Rechenweg zeigen</button>}
            {zeigen && <Formeln zeilen={rechenweg(auf)} max={14} min={14} farbe={C.see} />}
          </div>
        )}
        {!(erg && erg.ok) && <button onClick={pruefen} disabled={leer} className="px-6 py-3" style={KNOPF(!leer)}>Prüfen</button>}
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3" style={KNOPF(true, C.gruenDunkel)}>Nächste Aufgabe</button>
        {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
      </div>
    </div>
  );
}

/* ---------- Begründen: Beweise mit Lücken ---------- */
const BEGR_NAMEN = { herleitung: "Herleitung", nenner: "Der Nenner", basisrate: "Basisrate", zweiter: "Zwei Tests in Folge" };
function Begruenden() {
  const [welche, setWelche] = useState(0);
  const [antworten, setAntworten] = useState({});
  const b = BEGRUENDUNGEN[welche];
  const fertig = b.schritte.every((_, i) => antworten[`${b.id}-${i}`] === b.schritte[i].richtig);
  return (
    <div data-begruenden="">
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 14 }}>
        {BEGRUENDUNGEN.map((x, i) => <Chip key={x.id} aktiv={welche === i} onClick={() => setWelche(i)}>{BEGR_NAMEN[x.id]}</Chip>)}
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, lineHeight: 1.35, marginBottom: 4 }}>{b.titel}</p>
      <Formeln zeilen={[b.ziel]} max={17} min={17} />
      {b.schritte.map((st, i) => {
        const key = `${b.id}-${i}`, gewaehlt = antworten[key];
        const offen = i === 0 || antworten[`${b.id}-${i - 1}`] === b.schritte[i - 1].richtig;
        if (!offen) return null;
        return (
          <div key={key} className="auftauchen" style={{ borderTop: `1px solid ${C.linie}`, padding: "12px 0 6px" }}>
            <Text s={`${i + 1}. ${st.text}`} style={{ fontSize: 14.5, color: C.tinte, fontWeight: 400, lineHeight: 1.8, marginBottom: 8 }} />
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              {gemischt(st.optionen, i + welche).map((o) => {
                const an = gewaehlt === o, gut = an && o === st.richtig, schlecht = an && o !== st.richtig;
                return (
                  <button key={o} type="button" onClick={() => setAntworten((a) => ({ ...a, [key]: o }))} aria-pressed={an}
                    style={{ minHeight: 40, padding: "6px 12px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer", textAlign: "left",
                      border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : C.linie}`, background: gut ? C.himmel : C.weiss, color: C.tinte }}>
                    <Inline s={st.optionen[o]} />
                  </button>
                );
              })}
            </div>
            {gewaehlt !== undefined && gewaehlt !== st.richtig && <p style={{ fontSize: 13, color: C.signal, marginTop: 6 }}>Noch nicht – lies den Satz noch einmal mit dieser Antwort.</p>}
          </div>
        );
      })}
      {fertig && (
        <div className="auftauchen" style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 14, marginTop: 10 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.see }}>Begründung vollständig.</p>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>Für die GFS: Erzähl die Schritte an der Tafel in deinen eigenen Worten nach – erst allgemein, dann mit den Zahlen des Beispiels.</p>
        </div>
      )}
      <button type="button" onClick={() => setAntworten({})} style={{ ...LINK, marginTop: 12 }}>Von vorn</button>
    </div>
  );
}

/* ======================================================================
   Die Seite
   ====================================================================== */
export function GfsBayesSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Positiv getestet – wie wahrscheinlich bist du wirklich krank?
      </h2>
      <Text s={`Eine Krankheit haben 2 % der Menschen. Ein Test erkennt 90 % der Kranken und schlägt nur bei 5 % der Gesunden
        fälschlich an. Du lässt dich testen – das Ergebnis ist positiv. Schätze, bevor du weiterliest: Wie wahrscheinlich bist du krank?`} style={FLIESS} />
      <Text s={`Die meisten sagen „etwa 90 %“. Richtig sind knapp 27 %. Warum das so ist, erklärt der Satz von Bayes – und er zeigt,
        warum wir bei seltenen Ereignissen so leicht falsch schätzen.`} style={FLIESS} />

      <BayesAnimation art="sortieren" offen />

      <Schritt nr="1" titel="Drei Zahlen beschreiben den Test" />
      <Text s={`Wir nennen das Ereignis „krank“ $K$, sein Gegenereignis „gesund“ $\\overline{K}$, und „Test positiv“ kurz $+$. Drei Angaben
        beschreiben die Lage vollständig:`} style={FLIESS} />
      <Formeln zeilen={[
        "P(K) = 0{,}02 \\quad \\text{Prävalenz}",
        "P_{K}(+) = 0{,}9 \\quad \\text{Sensitivität}",
        "P_{\\overline{K}}(−) = 0{,}95 \\quad \\text{Spezifität}",
      ]} max={17} min={17} />
      <Text s={`$P_{K}(+)$ liest man „Wahrscheinlichkeit für $+$ unter der Bedingung $K$“; viele Bücher schreiben dafür $P(+ \\mid K)$.
        Gesucht ist aber die umgekehrte Richtung: $P_{+}(K)$, also krank unter der Bedingung, dass der Test positiv ist.`} style={FLIESS} />
      <Kasten titel="Die Verwechslung">
        <Text s={`$P_{K}(+) = 90\\,\\%$ beschreibt den Test: Wie zuverlässig findet er Kranke? $P_{+}(K)$ beschreibt dich: Wie sicher ist
          die Diagnose? Die beiden Zahlen haben nichts miteinander zu tun, solange man die Basisrate nicht kennt.`}
          style={{ fontSize: 14.5, color: C.tinte, fontWeight: 400, lineHeight: 1.8, margin: "8px 0 10px" }} />
      </Kasten>

      <Schritt nr="2" titel="1000 Personen statt Formeln" />
      <Text s={`Am schnellsten versteht man das Ergebnis mit natürlichen Häufigkeiten. Stell dir 1000 Personen vor:`} style={FLIESS} />
      <Formeln zeilen={[
        "1000 \\cdot 0{,}02 = 20 \\text{ krank}",
        "20 \\cdot 0{,}9 = 18 \\text{ davon positiv}",
        "1000 - 20 = 980 \\text{ gesund}",
        "980 \\cdot 0{,}05 = 49 \\text{ davon positiv}",
        "P_{+}(K) = \\frac{18}{18 + 49} = \\frac{18}{67} \\approx 26{,}9\\,\\%",
      ]} max={17} min={17} />
      <Text s={`Der Test irrt bei jedem einzelnen Gesunden selten – aber es gibt so viele Gesunde, dass ihre 49 falschen Alarme die
        18 echten Treffer weit übertreffen.`} style={FLIESS} />

      <Schritt nr="3" titel="Herleitung aus der Definition" />
      <Text s={`Die bedingte Wahrscheinlichkeit ist für $P(B) > 0$ definiert als Anteil der Schnittmenge an der Bedingung:`} style={FLIESS} />
      <Formeln zeilen={["P_{B}(A) = \\frac{P(A \\cap B)}{P(B)}"]} max={20} min={20} />
      <Text s={`Mit $P(B)$ multipliziert ist das die Pfadregel $P(A \\cap B) = P(B) \\cdot P_{B}(A)$. Für die Schnittmenge $K \\cap +$
        gibt es damit zwei Wege – einmal über $K$, einmal über $+$:`} style={FLIESS} />
      <Formeln zeilen={["P(K \\cap +) = P(K) \\cdot P_{K}(+)", "P(K \\cap +) = P(+) \\cdot P_{+}(K)"]} max={18} min={18} />
      <Text s={`Die linke Seite kennen wir aus dem Test, die rechte enthält das Gesuchte. Wir teilen durch $P(+) > 0$:`} style={FLIESS} />
      <Formeln zeilen={["P_{+}(K) = \\frac{P(K) \\cdot P_{K}(+)}{P(+)}"]} max={20} min={20} />

      <Schritt nr="4" titel="Der Nenner: totale Wahrscheinlichkeit" />
      <Text s={`$P(+)$ steht nicht in der Beschreibung des Tests. Aber jede Person ist entweder krank oder gesund, also zerfällt $+$ in die
        disjunkten Teile $K \\cap +$ und $\\overline{K} \\cap +$. Ihre Wahrscheinlichkeiten addieren sich – das ist der Satz von der totalen
        Wahrscheinlichkeit:`} style={FLIESS} />
      <Formeln zeilen={[
        "P(+) = P(K \\cap +) + P(\\overline{K} \\cap +)",
        "= P(K) \\cdot P_{K}(+) + P(\\overline{K}) \\cdot P_{\\overline{K}}(+)",
      ]} max={17} min={17} />
      <Kasten titel="Satz von Bayes">
        <Formeln zeilen={[
          "P_{+}(K) = \\frac{P(K) \\cdot P_{K}(+)}{P(K) \\cdot P_{K}(+) + P(\\overline{K}) \\cdot P_{\\overline{K}}(+)}",
          "\\text{allgemein: } P_{B}(A) = \\frac{P(A) \\cdot P_{A}(B)}{P(B)}",
        ]} max={15} min={15} />
      </Kasten>
      <Text s={`Mit den Zahlen von oben, wobei $P_{\\overline{K}}(+) = 1 - 0{,}95 = 0{,}05$ ist:`} style={FLIESS} />
      <Formeln zeilen={[
        "P(K \\cap +) = 0{,}02 \\cdot 0{,}9 = 0{,}018",
        "P(\\overline{K} \\cap +) = 0{,}98 \\cdot 0{,}05 = 0{,}049",
        "P(+) = 0{,}018 + 0{,}049 = 0{,}067",
        "P_{+}(K) = \\frac{0{,}018}{0{,}067} \\approx 26{,}9\\,\\%",
      ]} max={17} min={17} />
      <Text s={`Dasselbe Ergebnis wie mit 1000 Personen: Die Formel ist die Kurzschrift für das Abzählen. Im Bild ist sie ein umgedrehter
        Baum – er beginnt nicht mit dem Zustand, sondern mit dem Testergebnis.`} style={FLIESS} />
      <BayesAnimation art="umdrehen" />

      <Schritt nr="5" titel="Der Basisratenfehler" />
      <Text s={`Wer aus „der Test erkennt 90 % der Kranken“ schließt „ich bin zu 90 % krank“, vergisst die Basisrate $P(K)$. Dieser
        Basisratenfehler passiert auch Fachleuten. Wie stark $P_{+}(K)$ von der Basisrate abhängt, zeigt die Rechnung: Mehr als die
        Hälfte der Positiven ist erst dann krank, wenn der echte Pfad den falschen überwiegt.`} style={FLIESS} />
      <Formeln zeilen={[
        "P(K) \\cdot 0{,}9 = (1 - P(K)) \\cdot 0{,}05",
        "P(K) \\cdot 0{,}95 = 0{,}05",
        "P(K) = \\frac{0{,}05}{0{,}95} \\approx 5{,}3\\,\\%",
      ]} max={17} min={17} />
      <BayesAnimation art="basisrate" />

      <Schritt nr="6" titel="Ein zweiter Test" />
      <Text s={`Nach einem positiven Ergebnis wird nachgetestet. Fällt der zweite Test unabhängig vom ersten aus, ist das Ergebnis des
        ersten Tests die neue Ausgangswahrscheinlichkeit: Statt $P(K) = 0{,}02$ rechnen wir mit $0{,}269$.`} style={FLIESS} />
      <Formeln zeilen={[
        "0{,}269 \\cdot 0{,}9 = 0{,}2421 \\quad \\text{(krank)}",
        "0{,}731 \\cdot 0{,}05 = 0{,}03655 \\quad \\text{(gesund)}",
        "P_{++}(K) = \\frac{0{,}2421}{0{,}2421 + 0{,}03655} \\approx 86{,}9\\,\\%",
      ]} max={16} min={16} />
      <Text s={`Besonders klar wird das mit Chancen statt Wahrscheinlichkeiten. Die Chance, krank zu sein, ist vor dem Test $2 : 98 = 1 : 49$.
        Jeder positive Test multipliziert sie mit dem Likelihood-Quotienten $\\frac{0{,}9}{0{,}05} = 18$ – zweimal hintereinander also mit $18 \\cdot 18 = 324$:`} style={FLIESS} />
      <Formeln zeilen={[
        "1 : 49 \\;\\to\\; 18 : 49 \\;\\to\\; 324 : 49",
        "\\frac{18}{18 + 49} = \\frac{18}{67} \\approx 26{,}9\\,\\%",
        "\\frac{324}{324 + 49} = \\frac{324}{373} \\approx 86{,}9\\,\\%",
      ]} max={17} min={17} />
      <BayesAnimation art="zweiter" />

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Bayes-Labor: Basisrate und Test einstellen, 1000 Personen beobachten</p>
        <BayesLabor />
      </div>

      {gehe && (
        <div style={{ ...KARTE, marginTop: 4, marginBottom: 8, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Eigene Zahlen in die Tafel</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Die Vier-Felder-Tafel rechnet jede Aufgabe mit Baum, umgekehrtem Baum und allen bedingten Wahrscheinlichkeiten durch – absolut oder in Prozent.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "vierfelder" })} className="px-5 py-3" style={KNOPF(true)}>Zur Vier-Felder-Tafel</button>
        </div>
      )}

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Positiv, Häufigkeiten, Tafel, zweiter Test, negativ</H3>
      <BayesTrainer />

      <div style={{ height: 30 }} />
      <Kicker>Begründen</Kicker>
      <H3>Die Herleitung Schritt für Schritt selbst führen</H3>
      <div style={KARTE}><Begruenden /></div>

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt zu Basisrate und zweitem Test" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-bayes-kolloquium" />
    </div>
  );
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120) im Stil von DosenBild/PascalBild:
   die 67 Positiven aus 1000 Getesteten (Prävalenz 2 %, Sensitivität 90 %,
   Spezifität 95 %) – 18 krank (gold), 49 gesund (blau), dazu ein Teststreifen.
   Mathematisch exakt: 18 + 49 = 67, 18/67 ≈ 27 %.
   ====================================================================== */
export function BayesBild() {
  const SPALTEN = 10, D = 7.4, X0 = 10, Y0 = 34;
  const punkte = useMemo(() => Array.from({ length: 67 }, (_, i) => ({ i, krank: i < 18, x: X0 + (i % SPALTEN) * D + D / 2, y: Y0 + Math.floor(i / SPALTEN) * D + D / 2 })), []);
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}
      aria-label="67 positiv Getestete aus 1000: nur 18 sind krank, 49 sind gesund – etwa 27 Prozent">
      <defs>
        <linearGradient id="gtk-b-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFE9A0" /><stop offset="60%" stopColor="#EDBB00" /><stop offset="100%" stopColor="#C9971A" /></linearGradient>
        <linearGradient id="gtk-b-blau" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4E9BEA" /><stop offset="100%" stopColor="#0E1E4A" /></linearGradient>
        <linearGradient id="gtk-b-streifen" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#E3E8F2" /><stop offset="100%" stopColor="#A3ACC2" /></linearGradient>
        <radialGradient id="gtk-b-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.55" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
      </defs>
      <T x={X0} y="22" fontFamily="Montserrat, sans-serif" fontSize="7" fontWeight="700" fill="rgba(255,255,255,0.7)">67 von 1000 positiv getestet</T>
      <ellipse className="gtk-glimmen" cx={X0 + 2 * D} cy={Y0 + D} rx="30" ry="16" fill="url(#gtk-b-glut)" />
      {punkte.map((p) => (
        <circle key={p.i} className="gtk-auf" style={{ animationDelay: `${0.012 * p.i}s` }} cx={p.x} cy={p.y} r="2.9"
          fill={p.krank ? "url(#gtk-b-gold)" : "url(#gtk-b-blau)"} stroke={p.krank ? "#FFF6D6" : "#4E9BEA"} strokeWidth="0.4" strokeOpacity="0.7" />
      ))}
      {/* Teststreifen mit zwei Linien: positiv */}
      <g className="gtk-auf" style={{ animationDelay: ".3s" }} transform="rotate(-12 124 54)">
        <rect x="110" y="20" width="28" height="68" rx="6" fill="url(#gtk-b-streifen)" />
        <rect x="117" y="34" width="14" height="30" rx="3" fill="#F4F6FA" stroke="#C7CDD6" strokeWidth="0.6" />
        <rect x="118.5" y="41" width="11" height="2.2" rx="1" fill="#B85C2E" />
        <rect x="118.5" y="53" width="11" height="2.2" rx="1" fill="#B85C2E" />
        <circle cx="124" cy="76" r="4.4" fill="#F4F6FA" stroke="#C7CDD6" strokeWidth="0.6" />
        <T x="113" y="40" fontFamily="Montserrat, sans-serif" fontSize="4.6" fontWeight="800" fill="#5A6582">C</T>
        <T x="113" y="56" fontFamily="Montserrat, sans-serif" fontSize="4.6" fontWeight="800" fill="#5A6582">T</T>
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".55s" }}>
        <T x="124" y="104" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="12" fontWeight="800" fill="#EDBB00">18 / 67</T>
        <T x="124" y="114" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="7" fontWeight="700" fill="rgba(255,255,255,0.75)">≈ 27 % krank</T>
      </g>
      <T x={X0} y="102" fontFamily="Montserrat, sans-serif" fontSize="6.2" fontWeight="600" fill="rgba(255,255,255,0.62)">
        <tspan fill="#EDBB00">● 18 krank</tspan>   <tspan fill="#8FC0F2">● 49 gesund</tspan>
      </T>
    </svg>
  );
}
