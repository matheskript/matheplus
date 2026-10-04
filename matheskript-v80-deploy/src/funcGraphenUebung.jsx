/* ============================================================
   Ergänzende Graphenübungen zur Kurvendiskussion (Zusätzlich üben)
   · Graphen verstehen – f, f′ und f″ den Graphen zuordnen und begründen
   · Extrem- und Wendestellen prüfen – f′ = 0 bzw. f″ = 0 allein reicht nicht
   · Eigenschaften-Puzzle – aus Bedingungen den passenden Graphen wählen
   · Transformationen – Zielgraph durch Verschieben, Strecken, Spiegeln treffen
   Beide Achsen haben gleich lange Einheiten. Die Eigenschaften der Puzzle-Graphen
   werden numerisch aus dem Funktionsterm bestimmt, nicht von Hand eingetragen.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, Rueck, Stufe, hilfeKontext, hinweis, karte, kicker } from "./ui2.jsx";
import { M, Text } from "./func3.jsx";
import { Aufklapp, FunktionsBild, ModusLeiste, minusZ } from "./ui3.jsx";
import { mischen, wahl, zz } from "./rechnen2.js";
import { AufklappZeichen } from "./aufklappen.jsx";

const Tx = ({ s }) => <>{String(s).split("$").map((t, i) => (i % 2 === 1 ? <M key={i} t={t} /> : <span key={i}>{t}</span>))}</>;
const FARBEN = [C.see, C.gruen, C.smaragd];
const knopf = { minHeight: 44, minWidth: 44, padding: "8px 16px", borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" };
const Chip = ({ an, onClick, children, farbe = C.see, ...r }) => (
  <button type="button" aria-pressed={an} onClick={onClick} {...r}
    style={{ minHeight: 44, padding: "8px 14px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: "left", lineHeight: 1.25,
      border: `1.5px solid ${an ? farbe : C.linie}`, background: an ? farbe : C.weiss, color: an ? C.weiss : C.see }}>{children}</button>
);
const vz = (v) => (v < 0 ? `- ${-v}` : `+ ${v}`);

/* ======================================================================
   1 · Graphen verstehen
   ====================================================================== */
const frischVerstehen = () => {
  let r1, r2;
  do { r1 = zz(-1, 2); r2 = zz(-1, 2); } while (r1 >= r2 || r2 - r1 > 3);
  const f = (x) => x ** 3 / 3 - ((r1 + r2) * x * x) / 2 + r1 * r2 * x;
  const f1 = (x) => (x - r1) * (x - r2);
  const f2 = (x) => 2 * x - (r1 + r2);
  const perm = mischen([0, 1, 2]);     // perm[k] = Beschriftung (0=A,1=B,2=C) der Funktion k (f, f′, f″)
  return { r1, r2, funktionen: [f, f1, f2], perm, id: Math.random().toString(36).slice(2) };
};
const NAMEN = ["f", "f′", "f″"];
const BUCHSTABEN = ["A", "B", "C", "D"];

function GraphenVerstehen() {
  const [t, setT] = useState(frischVerstehen);
  const [wahlen, setWahlen] = useState([null, null, null]);        // je Funktion der gewählte Buchstabe (0–2)
  const [rueck, setRueck] = useState(null);
  const [begr, setBegr] = useState(null);
  const [fertig, setFertig] = useState(false);
  const kurven = t.perm.map((b, k) => ({ f: t.funktionen[k], farbe: FARBEN[b], name: BUCHSTABEN[b] }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const BEGR = ["Seine Nullstellen liegen bei den Hoch- und Tiefpunkten von f.", "Er ist überall positiv, weil f überall steigt.", "Er hat dieselben Nullstellen wie f.", "Er ist immer eine Gerade."];

  const pruefen = () => {
    if (wahlen.some((w) => w === null)) { setRueck({ art: "warn", text: "Ordne zuerst allen drei Funktionen einen Graphen zu." }); return; }
    if (new Set(wahlen).size < 3) { setRueck({ art: "warn", text: "Jeder Graph gehört genau zu einer der drei Funktionen." }); return; }
    const falsch = [0, 1, 2].filter((k) => wahlen[k] !== t.perm[k]);
    if (falsch.length === 0) { setRueck({ art: "gut", text: "Alle drei Zuordnungen stimmen." }); setFertig(true); return; }
    const k = falsch[0];
    const T = [
      "Die Funktion f ist die Stammfunktion der beiden anderen: Wo ihr Graph steigt, ist f′ positiv, wo er fällt, ist f′ negativ. Hoch- und Tiefpunkte von f liegen über den Nullstellen von f′.",
      "f′ gibt die Steigung von f an. Wo f einen Hoch- oder Tiefpunkt hat, muss der Graph von f′ die x-Achse schneiden.",
      "f″ gibt die Steigung von f′ an. Wo f′ einen Hoch- oder Tiefpunkt hat, ist f″ = 0. Hier ist f″ eine Gerade, weil f′ eine Parabel ist.",
    ][k];
    setRueck({ art: "schlecht", text: `Prüfe noch einmal die Zuordnung für ${NAMEN[k]}. ${T}` });
  };
  const neu = () => { setT(frischVerstehen()); setWahlen([null, null, null]); setRueck(null); setBegr(null); setFertig(false); };
  const bf = BUCHSTABEN[t.perm[1]];
  return (
    <div>
      <div style={karte}>
        <p style={kicker}>Graphen verstehen</p>
        <p style={{ ...hinweis, marginBottom: 10 }}><Tx s={`Die drei Graphen gehören zu einer Funktion $f$, ihrer Ableitung $f′$ und ihrer zweiten Ableitung $f″$. Ordne sie zu und begründe mit Steigung, Monotonie und Krümmung.`} /></p>
        <FunktionsBild kurven={kurven} x0={-3} x1={3} y0={-3} y1={3} gleicheEinheit />
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {NAMEN.map((n, k) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ width: 34, fontWeight: 800, fontSize: 17, color: C.tinte }}>{n}</span>
              {BUCHSTABEN.slice(0, 3).map((b, bi) => (
                <Chip key={b} an={wahlen[k] === bi} farbe={FARBEN[bi]} disabled={fertig} aria-label={`${n} ist Graph ${b}`}
                  onClick={() => { setWahlen(wahlen.map((w, j) => (j === k ? bi : w))); setRueck(null); }}>{b}</Chip>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
          {!fertig && <div style={{ flex: "1 1 160px" }}><GrosserKnopf onClick={pruefen}>Zuordnung prüfen</GrosserKnopf></div>}
          <div style={{ flex: "0 0 auto", marginTop: 12 }}><IchHaengeFest kontext={hilfeKontext({ id: `gv-${t.id}`, aufgabe: "Ableitung Steigung Monotonie Krümmung Wendepunkt Hochpunkt Tiefpunkt",
            ansatz: ["Wo hat ein Graph waagerechte Tangenten? Dort muss der Graph von f′ die x-Achse schneiden.", "Extremstellen von f sind Nullstellen von f′ (mit Vorzeichenwechsel). Wendestellen von f sind Extremstellen von f′ und Nullstellen von f″.", "Suche zuerst den Graphen, der am einfachsten aussieht (Gerade): das ist f″."],
            regeln: [{ name: "Extrempunkt" }, { name: "Wendepunkt" }] })} /></div>
        </div>
        {rueck && <Rueck art={rueck.art}>{rueck.text}</Rueck>}
      </div>
      {fertig && (
        <div style={{ ...karte, marginTop: 14 }}>
          <p style={kicker}>Begründe</p>
          <p style={{ fontSize: 15, color: C.tinte, lineHeight: 1.6, marginBottom: 8 }}><Tx s={`Woran erkennst du, dass Graph ${bf} die Ableitung $f′$ ist?`} /></p>
          <div style={{ display: "grid", gap: 8 }}>
            {BEGR.map((b, i) => <Chip key={i} an={begr === i} onClick={() => setBegr(i)}>{b}</Chip>)}
          </div>
          {begr !== null && <Rueck art={begr === 0 ? "gut" : "schlecht"}>{begr === 0 ? "Genau: f′ = 0 bedeutet waagerechte Tangente von f. Wechselt f′ dort das Vorzeichen, hat f einen Extrempunkt." : "Das passt nicht: f′ misst die Steigung von f und ist negativ, wo f fällt. Gleiche Nullstellen wie f hat f′ nicht, sondern sie liegt unter den Extremstellen."}</Rueck>}
        </div>
      )}
      <GrosserKnopf ghost onClick={neu}>Neue Aufgabe</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   2 · Extrem- und Wendestellen prüfen
   f(x) = a·(x − h)ⁿ + k, n = 2, 3, 4 – bei x = h gilt immer f′(h) = 0
   ====================================================================== */
const frischPruefen = () => ({ a: wahl([-2, -1, 1, 2]), h: zz(-2, 2), k: zz(-3, 3), n: wahl([2, 3, 4]), id: Math.random().toString(36).slice(2) });
const OPT1 = ["Hochpunkt", "Tiefpunkt", "Sattelpunkt (Wendepunkt mit waagerechter Tangente)", "weder Extrem- noch Wendepunkt"];
const richtig1 = ({ a, n }) => (n === 3 ? 2 : a > 0 ? 1 : 0);
function Pruefen() {
  const [t, setT] = useState(frischPruefen);
  const [w1, setW1] = useState(null);
  const [w2, setW2] = useState(null);
  const { a, h, k, n } = t;
  const f = (x) => a * (x - h) ** n + k;
  const f2h = n === 2 ? 2 * a : 0, f3h = n === 3 ? 6 * a : 0;
  const term = `${a === 1 ? "" : a === -1 ? "-" : a}(x ${vz(-h)})^{${n}}${k === 0 ? "" : " " + vz(k)}`.replace("(x - 0)", "x").replace("(x + 0)", "x").replace(/\^\{1\}/, "");
  const r1 = richtig1(t);
  const text1 = () => {
    if (w1 === null) return null;
    if (w1 === r1) {
      if (n === 4) return { art: "gut", text: `Richtig – obwohl $f″(${h}) = 0$ ist. Das $f″$-Kriterium entscheidet hier nicht. Aber $f′(x) = ${4 * a}(x ${vz(-h)})^3$ wechselt bei ${h} das Vorzeichen: ${a > 0 ? "von − nach +, also Tiefpunkt" : "von + nach −, also Hochpunkt"}.`.replace("(x - 0)", "x") };
      if (n === 3) return { art: "gut", text: `Richtig: $f′(x) = ${3 * a}(x ${vz(-h)})^2$ ist links und rechts von ${h} gleich gerichtet – kein Vorzeichenwechsel, also kein Extremum. $f″$ wechselt dagegen das Vorzeichen (Wendepunkt).`.replace("(x - 0)", "x") };
      return { art: "gut", text: `Richtig: $f′(${h}) = 0$ und $f″(${h}) = ${2 * a} ${a > 0 ? "> 0" : "< 0"}$ – das hinreichende Kriterium ist erfüllt.` };
    }
    if (n === 2) return { art: "schlecht", text: `Hier ist $f″(${h}) = ${2 * a} ≠ 0$. Mit $f′(${h}) = 0$ ist das Extremum nachgewiesen; das Vorzeichen von $f″$ entscheidet über Hoch- oder Tiefpunkt.` };
    if (n === 3) return { art: "schlecht", text: `$f′(${h}) = 0$ allein reicht nicht. Prüfe das Vorzeichen von $f′$ links und rechts von ${h}: Es bleibt gleich, also kein Extremum.` };
    return { art: "schlecht", text: `$f″(${h}) = 0$ heißt nur: Dieses Kriterium entscheidet nicht. Untersuche das Vorzeichen von $f′(x) = ${4 * a}(x ${vz(-h)})^3$ links und rechts von ${h}.`.replace("(x - 0)", "x") };
  };
  const ja2 = n === 3;
  const text2 = () => {
    if (w2 === null) return null;
    const ok = (w2 === 1) === ja2;
    if (ok) return { art: "gut", text: ja2 ? `Ja: $f″(x) = ${6 * a}(x ${vz(-h)})$ wechselt bei ${h} das Vorzeichen.`.replace("(x - 0)", "x") : n === 2 ? `Nein: $f″(x) = ${2 * a}$ ist konstant und nirgends null.` : `Nein: $f″(${h}) = 0$, aber $f″(x) = ${12 * a}(x ${vz(-h)})^2$ wechselt das Vorzeichen nicht.`.replace("(x - 0)", "x") };
    return { art: "schlecht", text: ja2 ? "Doch: $f″(x)$ ist hier eine Gerade mit Nullstelle und wechselt dort das Vorzeichen." : n === 2 ? "$f″$ ist konstant und nie null – ohne Nullstelle gibt es keine Wendestelle." : `$f″(${h}) = 0$ allein beweist keine Wendestelle. $f″(x) = ${12 * a}(x ${vz(-h)})^2$ hat links und rechts von ${h} dasselbe Vorzeichen.`.replace("(x - 0)", "x") };
  };
  const m1 = text1(), m2 = text2();
  const neu = () => { setT(frischPruefen()); setW1(null); setW2(null); };
  const pkt = { x: h, y: k, farbe: C.gruenDunkel, name: `(${minusZ(h)}|${minusZ(k)})` };
  return (
    <div>
      <div style={karte}>
        <p style={kicker}>Extrem- und Wendestellen prüfen</p>
        <p style={{ fontSize: 16.5, lineHeight: 1.9, color: C.tinte }}><Tx s={`Gegeben ist $f(x) = ${term}$. Für die Stelle $x_0 = ${h}$ gilt:`} /></p>
        <div style={{ background: C.sand, borderRadius: 12, padding: "8px 12px", margin: "6px 0 12px", fontSize: 16, lineHeight: 1.9 }}>
          <Tx s={`$f′(${h}) = 0$`} /><br /><Tx s={`$f″(${h}) = ${f2h}$`} /><br /><Tx s={`$f‴(${h}) = ${f3h}$`} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 8 }}><Tx s={`Was liegt bei $x_0 = ${h}$ vor?`} /></p>
        <div style={{ display: "grid", gap: 8 }}>
          {OPT1.map((o, i) => <Chip key={i} an={w1 === i} farbe={w1 === null ? C.see : i === r1 && w1 === i ? C.smaragd : w1 === i ? C.signal : C.see} onClick={() => setW1(i)}>{o}</Chip>)}
        </div>
        {m1 && <Rueck art={m1.art}><Tx s={m1.text} /></Rueck>}
        {w1 === r1 && (
          <>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, margin: "16px 0 8px" }}><Tx s={`Ist $x_0 = ${h}$ eine Wendestelle?`} /></p>
            <div style={{ display: "flex", gap: 8 }}>{["Nein", "Ja"].map((o, i) => <Chip key={o} an={w2 === i} onClick={() => setW2(i)}>{o}</Chip>)}</div>
            {m2 && <Rueck art={m2.art}><Tx s={m2.text} /></Rueck>}
          </>
        )}
        <div style={{ marginTop: 12 }}><IchHaengeFest kontext={hilfeKontext({ id: `pr-${t.id}`, aufgabe: "Extrempunkt Wendepunkt Sattelpunkt Ableitung",
          ansatz: ["Was gilt immer an einer Extremstelle? Und reicht das, um sicher zu sein?", "Hinreichend für ein Extremum: $f′$ wechselt das Vorzeichen, oder $f′(x_0) = 0$ und $f″(x_0) ≠ 0$. Für eine Wendestelle: $f″$ wechselt das Vorzeichen.", "Wenn $f″(x_0) = 0$ ist, untersuche das Vorzeichen von $f′$ links und rechts von $x_0$."],
          regeln: [{ name: "Extrempunkt" }, { name: "Wendepunkt" }] })} /></div>
      </div>
      {w1 === r1 && (
        <Aufklapp titel="Graph zur Kontrolle" start>
          <FunktionsBild kurven={[{ f, farbe: C.see, name: "f" }]} punkte={[pkt]} x0={h - 3} x1={h + 3} y0={k - 3} y1={k + 3} gleicheEinheit />
        </Aufklapp>
      )}
      <GrosserKnopf ghost onClick={neu}>Neue Aufgabe</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   3 · Eigenschaften-Puzzle
   ====================================================================== */
const BIB = [[0, -3, 0, 1], [0, 3, 0, -1], [0, 0, 0, 1], [0, 0, 0, -1], [-1, 0, 1], [2, 0, -1], [0, 0, -2, 0, 1], [0, 0, 2, 0, -1], [0, 0, 0, 0, 1], [4, 0, -3, 1], [0, 1, 0, 1], [-2, 0, 1], [0, -4, 0, 0, 1], [3, -3, 0, 1]].map((c) => c);
const pv = (c, x) => c.reduce((s, k, i) => s + k * x ** i, 0);
const pAbl = (c) => c.slice(1).map((k, i) => k * (i + 1));
function eigenschaften(c) {
  const f = (x) => pv(c, x), d1 = (x) => pv(pAbl(c), x), d2 = (x) => pv(pAbl(pAbl(c)), x);
  const raster = Array.from({ length: 1001 }, (_, i) => -5 + i * 0.01);
  const wechsel = (g, tol = 1e-9) => { let n = 0, alt = 0; for (const x of raster) { const v = g(x); const s = Math.abs(v) < tol ? 0 : Math.sign(v); if (s !== 0) { if (alt !== 0 && s !== alt) n++; alt = s; } } return n; };
  const nullstellen = (() => { let n = wechsel(f); const beruehr = []; for (let i = 1; i < raster.length - 1; i++) { const v = Math.abs(f(raster[i])); if (v < 1e-9 && Math.sign(f(raster[i - 1])) * Math.sign(f(raster[i + 1])) > 0) beruehr.push(raster[i]); } return n + beruehr.length; })();
  const sym = [-1, -0.5, 0.7, 2].every((x) => Math.abs(f(x) - f(-x)) < 1e-9) ? "achse" : [-1, -0.5, 0.7, 2].every((x) => Math.abs(f(x) + f(-x)) < 1e-9) ? "punkt" : "keine";
  const grad = c.length - 1, lk = c[c.length - 1];
  return { sym, extrem: wechsel(d1), wende: wechsel(d2), nullstellen, rechts: Math.sign(lk) > 0 ? "plus" : "minus", links: (grad % 2 === 0 ? Math.sign(lk) : -Math.sign(lk)) > 0 ? "plus" : "minus" };
}
const BIB_E = BIB.map((c) => ({ c, e: eigenschaften(c) }));
const BEDINGUNGEN = [
  (e) => ({ wahr: (x) => x.sym === "achse", text: "Der Graph ist achsensymmetrisch zur $y$-Achse.", ok: e.sym === "achse", id: "achse" }),
  (e) => ({ wahr: (x) => x.sym === "punkt", text: "Der Graph ist punktsymmetrisch zum Ursprung.", ok: e.sym === "punkt", id: "punkt" }),
  (e) => ({ wahr: (x) => x.extrem === e.extrem, text: e.extrem === 0 ? "Es gibt keine Extremstelle." : `Es gibt genau ${e.extrem} Extremstelle${e.extrem === 1 ? "" : "n"}.`, ok: true, id: "extrem" }),
  (e) => ({ wahr: (x) => x.wende === e.wende, text: e.wende === 0 ? "Es gibt keine Wendestelle." : `Es gibt genau ${e.wende} Wendestelle${e.wende === 1 ? "" : "n"}.`, ok: true, id: "wende" }),
  (e) => ({ wahr: (x) => x.nullstellen === e.nullstellen, text: e.nullstellen === 0 ? "Der Graph hat keine Nullstelle." : `Der Graph hat genau ${e.nullstellen} Nullstelle${e.nullstellen === 1 ? "" : "n"}.`, ok: true, id: "nst" }),
  (e) => ({ wahr: (x) => x.rechts === e.rechts, text: e.rechts === "plus" ? "Für $x → +∞$ gilt $f(x) → +∞$." : "Für $x → +∞$ gilt $f(x) → -∞$.", ok: true, id: "rechts" }),
];
function frischPuzzle() {
  for (let v = 0; v < 400; v++) {
    const ziel = wahl(BIB_E);
    const kand = BEDINGUNGEN.map((b) => b(ziel.e)).filter((b) => b.ok && !(b.id === "achse" && ziel.e.sym !== "achse") );
    const bed = mischen(kand).slice(0, 3);
    if (bed.length < 3) continue;
    const treffer = BIB_E.filter((g) => bed.every((b) => b.wahr(g.e)));
    if (treffer.length !== 1) continue;
    // Ablenker: Graphen, die mindestens eine Bedingung verletzen
    const ablenker = mischen(BIB_E.filter((g) => g !== ziel && bed.some((b) => !b.wahr(g.e)))).slice(0, 3);
    if (ablenker.length < 3) continue;
    const alle = mischen([ziel, ...ablenker]);
    return { bed, optionen: alle, richtig: alle.indexOf(ziel), id: Math.random().toString(36).slice(2) };
  }
  return null;
}
function Puzzle() {
  const [t, setT] = useState(() => frischPuzzle());
  const [wahlIdx, setWahlIdx] = useState(null);
  if (!t) return null;
  const neu = () => { setT(frischPuzzle()); setWahlIdx(null); };
  const gewaehlt = wahlIdx !== null ? t.optionen[wahlIdx] : null;
  const verletzt = gewaehlt ? t.bed.find((b) => !b.wahr(gewaehlt.e)) : null;
  return (
    <div>
      <div style={karte}>
        <p style={kicker}>Eigenschaften-Puzzle</p>
        <p style={{ ...hinweis, marginBottom: 8 }}>Welcher Graph erfüllt alle Bedingungen? Beide Achsen haben gleich lange Einheiten.</p>
        <ul style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: 15.5, lineHeight: 1.85, color: C.tinte }}>{t.bed.map((b) => <li key={b.text}><Tx s={b.text} /></li>)}</ul>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {t.optionen.map((g, i) => (
            <button key={i} type="button" aria-pressed={wahlIdx === i} aria-label={`Graph ${BUCHSTABEN[i]} wählen`} onClick={() => setWahlIdx(i)}
              style={{ padding: 6, borderRadius: 14, cursor: "pointer", fontFamily: "inherit", background: C.weiss,
                border: `2px solid ${wahlIdx === i ? (i === t.richtig ? C.smaragd : C.signal) : C.linie}` }}>
              <FunktionsBild kurven={[{ f: (x) => pv(g.c, x), farbe: C.see }]} x0={-3} x1={3} y0={-3} y1={3} gleicheEinheit hoehe={170} />
              <span style={{ display: "block", fontWeight: 800, color: C.see, marginTop: 4 }}>Graph {BUCHSTABEN[i]}</span>
            </button>
          ))}
        </div>
        {gewaehlt && (wahlIdx === t.richtig
          ? <Rueck art="gut">Richtig – alle Bedingungen passen zu diesem Graphen.</Rueck>
          : <Rueck art="schlecht">Dieser Graph verletzt eine Bedingung: <Tx s={verletzt ? verletzt.text : ""} /></Rueck>)}
        <div style={{ marginTop: 12 }}><IchHaengeFest kontext={hilfeKontext({ id: `pz-${t.id}`, aufgabe: "Symmetrie Extremstelle Wendestelle Nullstelle",
          ansatz: ["Welche Bedingung kannst du am schnellsten am Bild prüfen? Streiche damit Graphen weg.", "Achsensymmetrie: $f(-x) = f(x)$, Punktsymmetrie: $f(-x) = -f(x)$. Extremstellen sind Hoch- und Tiefpunkte.", "Prüfe die Bedingungen nacheinander und streiche jeden Graphen weg, der eine verletzt."],
          regeln: [{ name: "Symmetrien" }] })} /></div>
      </div>
      <GrosserKnopf ghost onClick={neu}>Neue Aufgabe</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   4 · Transformationen
   ====================================================================== */
const BASIS = [
  { id: "x2", f: (x) => x * x, tex: "x^2", name: "x²" },
  { id: "x3", f: (x) => x ** 3, tex: "x^3", name: "x³" },
  { id: "x4", f: (x) => x ** 4, tex: "x^4", name: "x⁴" },
];
const FAKTOREN = [[-2, "-2"], [-1, "-1"], [-0.5, "-½"], [0.5, "½"], [1, "1"], [2, "2"]];
function frischTrans() {
  for (;;) {
    const b = wahl(BASIS), s = wahl(FAKTOREN.map((x) => x[0])), c = zz(-3, 3), d = zz(-3, 3);
    if (s === 1 && c === 0 && d === 0) continue;
    return { b, s, c, d, id: Math.random().toString(36).slice(2) };
  }
}
const gleich = (g1, g2) => [-3, -2.2, -1, -0.4, 0, 0.6, 1.3, 2, 3.1, 4].every((x) => Math.abs(g1(x) - g2(x)) < 1e-9);
function Transformationen() {
  const [t, setT] = useState(frischTrans);
  const [s, setS] = useState(1), [c, setC] = useState(0), [d, setD] = useState(0);
  const [zeig, setZeig] = useState(false);
  const ziel = (x) => t.s * t.b.f(x - t.c) + t.d;
  const meins = (x) => s * t.b.f(x - c) + d;
  const treffer = gleich(ziel, meins);
  const sTex = s === 1 ? "" : s === -1 ? "-" : s === 0.5 ? "\\frac{1}{2}·" : s === -0.5 ? "-\\frac{1}{2}·" : `${s}·`;
  const term = `g(x) = ${sTex}(x ${vz(-c)})^{${t.b.tex.slice(2)}} ${vz(d)}`.replace("(x - 0)", "x").replace("(x + 0)", "x");
  const dTeil = d === 0 ? "" : ` ${vz(d)}`;
  const termTex = c === 0 ? `g(x) = ${sTex}${t.b.tex}${dTeil}` : `g(x) = ${sTex}(x ${vz(-c)})^{${t.b.tex.slice(2)}}${dTeil}`;
  const neu = () => { setT(frischTrans()); setS(1); setC(0); setD(0); setZeig(false); };
  return (
    <div>
      <div style={karte}>
        <p style={kicker}>Transformationen</p>
        <p style={{ ...hinweis, marginBottom: 8 }}><Tx s={`Der grüne Zielgraph entsteht aus dem grauen Graphen von $f(x) = ${t.b.tex}$ durch Verschieben, Strecken und Spiegeln. Stelle deinen blauen Graphen so ein, dass er den Zielgraphen deckt.`} /></p>
        <FunktionsBild kurven={[{ f: t.b.f, farbe: "#9AA6B8", gestrichelt: true, name: "f" }, { f: ziel, farbe: C.smaragd, breite: 3.4, name: "Ziel" }, { f: meins, farbe: C.see, name: "dein g" }]} x0={-5} x1={5} y0={-5} y1={5} gleicheEinheit />
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><span style={{ minWidth: 150, fontSize: 14.5, color: C.tinte }}>Nach rechts verschieben um</span><Stufe wert={c} setWert={setC} min={-5} max={5} label="Verschiebung in x-Richtung" text="c" /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><span style={{ minWidth: 150, fontSize: 14.5, color: C.tinte }}>Nach oben verschieben um</span><Stufe wert={d} setWert={setD} min={-5} max={5} label="Verschiebung in y-Richtung" text="d" /></div>
          <div><p style={{ fontSize: 14.5, color: C.tinte, marginBottom: 6 }}><Tx s={`Strecken (Faktor in $y$-Richtung); negativ spiegelt an der $x$-Achse`} /></p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{FAKTOREN.map(([v, l]) => <Chip key={l} an={s === v} onClick={() => setS(v)} aria-label={`Streckfaktor ${l}`}>{l}</Chip>)}</div></div>
        </div>
        <p style={{ fontSize: 17, margin: "12px 0 0", color: C.tinte }}><Tx s={`$${termTex}$`} /></p>
        {treffer ? <Rueck art="gut">Treffer – dein Graph deckt den Zielgraphen. Auch andere Einstellungen, die dieselbe Funktion ergeben, wären richtig.</Rueck>
          : <Rueck art="info">Noch nicht deckungsgleich. Erst die Form (strecken, spiegeln), dann den Scheitel oder Wendepunkt verschieben.</Rueck>}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button type="button" onClick={() => setZeig(!zeig)} style={knopf}>{zeig ? "Lösung ausblenden" : "Lösung zeigen"}</button>
          <IchHaengeFest kontext={hilfeKontext({ id: `tr-${t.id}`, aufgabe: "Verschiebung Streckung Spiegelung Funktionsgraph",
            ansatz: ["Wohin ist der besondere Punkt (Scheitel bzw. Sattelpunkt) des Zielgraphen gewandert?", "$g(x) = s·f(x - c) + d$: $c$ verschiebt nach rechts, $d$ nach oben, $s$ streckt in $y$-Richtung, ein negatives $s$ spiegelt an der $x$-Achse.", "Lies zuerst $c$ und $d$ am besonderen Punkt ab, dann bestimme $s$ an einem weiteren Punkt."] })} />
        </div>
        {zeig && <Rueck art="info"><Tx s={`Eine passende Einstellung: $c = ${t.c}$, $d = ${t.d}$, Streckfaktor ${t.s}.`} /></Rueck>}
      </div>
      <GrosserKnopf ghost onClick={neu}>Neue Aufgabe</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   Rahmen: vier Übungen, Eingaben bleiben beim Moduswechsel erhalten
   ====================================================================== */
export const GRAPHEN_MODI = [["verstehen", "Graphen verstehen"], ["pruefen", "Extrem- und Wendestellen prüfen"], ["puzzle", "Eigenschaften-Puzzle"], ["trans", "Transformationen"]];
const GRAPHEN_TAB = [["verstehen", "Graphen"], ["pruefen", "Prüfen"], ["puzzle", "Puzzle"], ["trans", "Formen"]];
export function GraphenUebungen({ start = "verstehen", onZurueck }) {
  const [modus, setModus] = useState(start);
  const wrap = (id, kind) => <div style={{ display: modus === id ? "block" : "none", marginTop: 14 }}>{kind}</div>;
  return (
    <div>
      <button type="button" onClick={onZurueck} style={{ background: "none", border: "none", color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "10px 0", minHeight: 44 }}>← Zurück zur Kurvendiskussion</button>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>Graphen üben</h2>
      <ModusLeiste modi={GRAPHEN_TAB} modus={modus} setModus={setModus} label="Graphenübungen" />
      {wrap("verstehen", <GraphenVerstehen />)}
      {wrap("pruefen", <Pruefen />)}
      {wrap("puzzle", <Puzzle />)}
      {wrap("trans", <Transformationen />)}
    </div>
  );
}

/* Einklappbarer Abschnitt „Zusätzlich üben“ unter dem Titel der Kurvendiskussion */
export function ZusaetzlichUeben({ onWaehle }) {
  const [auf, setAuf] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <button type="button" aria-expanded={auf} onClick={() => setAuf(!auf)}
        style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
          background: C.weiss, border: `1.5px solid ${C.linie}`, fontSize: 15, fontWeight: 700, color: C.see }}>
        <span>Zusätzlich üben</span><AufklappZeichen auf={auf} />
      </button>
      {auf && (
        <div data-aufklapp-inhalt style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 8 }}>
          {GRAPHEN_MODI.map(([id, l]) => (
            <button key={id} type="button" onClick={() => onWaehle(id)} style={{ ...knopf, textAlign: "left", minHeight: 52, hyphens: "manual" }}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}
