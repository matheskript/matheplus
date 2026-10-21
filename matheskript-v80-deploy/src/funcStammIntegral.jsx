/* ============================================================
   Werkzeug „Stammfunktion & Integral“ – im Stil der Regel-Werkstatt
   · Stammfunktion bilden: f links, F rechts; Automatik zeigt die
     Rechnung Summand für Summand samt Probe F′ = f, Training prüft
     die eigene Stammfunktion (bis auf die Konstante C)
   · Integral ∫ₐᵇ f(x) dx mit dem Hauptsatz: aufklappbare Herleitung,
     Schaubild mit Fläche, Nebenrechnung „Stammfunktion bilden“, dann
     F(b) − F(a) Schritt für Schritt
   Mathe-Kern: regelwerkKern.js. Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useState } from "react";
import { buchen } from "./buchung.jsx";
import { C } from "./base1.jsx";
import { Formel, M, Text } from "./func3.jsx";
import { LiveFormel, hatX } from "./func12.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { ErklaerAnimation } from "./funcErklaeranimation.jsx";
import { uebergabeErledigt, uebergabeLesen } from "./uebergabe.js";
import { IntZ } from "./ui2.jsx";
import { Eingabe, EingabePopup, FARBE, Feld, Herleitung, Merke, ModusSchalter, WERK_CSS } from "./funcRegelwerk.jsx";
import {
  STAMM_ARTEN, auswerter, dez, grenzeLesen, hauptsatz, lies, neueIntegralAufgabe, neueStammAufgabe, probe, pruefeIntegralStamm, pruefeIntegralWert, pruefeStamm, stammfunktion, tex, zahlTex,
} from "./regelwerkKern.js";
import { MathildaModusKnopf } from "./funcMathildaModusKnopf.jsx";
import { Arbeitsflaeche, BildKarte, ErgebnisReihe, FeinKarte, Kicker, chipStil, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { kompaktSpalteCss } from "./trainerDesktop.jsx";

const T = ({ s }) => <Text s={s} style={{ fontSize: 14.5, fontWeight: 300, color: C.grau, lineHeight: 1.8, margin: "12px 0 0" }} />;
const blau = `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`;
const leer = () => ({ text: "", status: null, hinweis: "", versuche: 0, pos: 0 });

/* Integralzeichen mit Grenzen als Formel-Text */
const intTex = (a, b, inner = "f(x)") => `\\int_{${a}}^{${b}} ${inner} \\, dx`;

/* ---------- Schaubild: f mit Fläche zwischen a und b ---------- */

function Flaechenbild({ f, a, b, W = 360, H = 190, rahmenlos = false }) {
  const L = 30, R = 12, T0 = 10, B = 24;
  const fn = useMemo(() => auswerter(f), [f]);
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const pad = Math.max(1, (hi - lo) * 0.6);
  const x0 = Math.min(lo - pad, 0 - (lo > 0 ? 0.5 : 0)), x1 = Math.max(hi + pad, 0 + (hi < 0 ? 0.5 : 0));
  const N = 160;
  // y-Bereich aus dem Intervall [a; b] (plus etwas Rand) – Polstellen außerhalb sollen das Bild nicht plattdrücken
  let yLo = 0, yHi = 0;
  const r0 = lo, r1 = hi;
  for (let i = 0; i <= N; i++) { const y = fn(r0 + ((r1 - r0) * i) / N); if (Number.isFinite(y)) { yLo = Math.min(yLo, y); yHi = Math.max(yHi, y); } }
  const span = yHi - yLo || 2; yLo -= span * 0.12; yHi += span * 0.12;
  const klemme = (y) => Math.max(yLo - span, Math.min(yHi + span, y));
  const sx = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R);
  const sy = (y) => T0 + ((yHi - y) / (yHi - yLo)) * (H - T0 - B);
  let kurve = "", flaeche = `M${sx(lo)},${sy(0)}`;
  let offen = false;
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N, y = fn(x);
    if (!Number.isFinite(y)) { offen = false; continue; }
    kurve += `${offen ? "L" : "M"}${sx(x).toFixed(1)},${sy(klemme(y)).toFixed(1)}`; offen = true;
  }
  for (let i = 0; i <= N; i++) { const x = lo + ((hi - lo) * i) / N, y = fn(x); flaeche += `L${sx(x).toFixed(1)},${sy(klemme(Number.isFinite(y) ? y : 0)).toFixed(1)}`; }
  flaeche += `L${sx(hi)},${sy(0)}Z`;
  const tick = (v) => String(v).replace("-", "−");
  const schritt = (x1 - x0) > 8 ? 2 : 1;
  const xt = []; for (let v = Math.ceil(x0); v <= x1; v += schritt) xt.push(v);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Schaubild von f mit der Fläche zwischen a und b"
      style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: rahmenlos ? "none" : `1px solid ${C.linie}` }}>
      <path d={flaeche} fill={C.flaggold} fillOpacity="0.38" />
      <line x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} stroke={C.tinte} strokeWidth="1.3" />
      {x0 < 0 && x1 > 0 && <line x1={sx(0)} x2={sx(0)} y1={T0} y2={H - B} stroke={C.tinte} strokeWidth="1.3" />}
      {xt.map((v) => <g key={v}><line x1={sx(v)} x2={sx(v)} y1={sy(0) - 3} y2={sy(0) + 3} stroke={C.tinte} strokeWidth="1" />
        {v !== 0 && <text x={sx(v)} y={Math.min(H - 6, sy(0) + 14)} fontSize="10.5" textAnchor="middle" fill={C.grau}>{tick(v)}</text>}</g>)}
      <path d={kurve} fill="none" stroke={C.see} strokeWidth="2.4" strokeLinejoin="round" />
      {[[lo, a === lo ? "a" : "b"], [hi, a === lo ? "b" : "a"]].map(([x, n]) => (
        <g key={n}>
          <line x1={sx(x)} x2={sx(x)} y1={T0} y2={H - B} stroke={C.goldWarm} strokeWidth="1.4" strokeDasharray="4 3" />
          <text x={sx(x)} y={T0 + 12} fontSize="12" fontWeight="700" textAnchor="middle" fill={C.gruenDunkel}>{n}</text>
        </g>
      ))}
      <text x={W - R - 4} y={T0 + 14} fontSize="12" fontWeight="700" fontStyle="italic" textAnchor="end" fill={C.see}>f</text>
    </svg>
  );
}

/* ---------- Herleitung des Hauptsatzes ---------- */

function HauptsatzBild() {
  const W = 340, H = 180, X = (x) => 28 + x * 54, Y = (y) => 150 - y * 30;
  const f = (x) => 0.12 * (x - 1.2) ** 3 - 0.4 * (x - 1.2) ** 2 + 0.3 * x + 2;
  const a = 0.6, x = 3.2, h = 0.55;
  let kurve = "", fl = `M${X(a)},${Y(0)}`;
  for (let i = 0; i <= 100; i++) { const t = 0.1 + (5.4 * i) / 100; kurve += `${i ? "L" : "M"}${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`; }
  for (let i = 0; i <= 60; i++) { const t = a + ((x - a) * i) / 60; fl += `L${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`; }
  fl += `L${X(x)},${Y(0)}Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", margin: "14px 0 4px" }} role="img" aria-label="Flächenfunktion A(x) und der schmale Streifen der Breite h">
      <path d={fl} fill={C.see} fillOpacity="0.16" />
      <rect x={X(x)} y={Y(f(x))} width={X(x + h) - X(x)} height={Y(0) - Y(f(x))} fill={C.flaggold} fillOpacity="0.55" />
      <line x1="12" y1={Y(0)} x2={W - 6} y2={Y(0)} stroke={C.grau} strokeWidth="1.2" />
      <path d={kurve} fill="none" stroke={C.see} strokeWidth="2.4" strokeLinecap="round" />
      {[[a, "a"], [x, "x"], [x + h, "x + h"]].map(([t, n]) => (
        <g key={n}><line x1={X(t)} y1={Y(0)} x2={X(t)} y2={Y(f(t))} stroke={C.goldWarm} strokeWidth="1.3" strokeDasharray="4 3" />
          <text x={X(t)} y={Y(0) + 15} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.tinte}>{n}</text></g>
      ))}
      <text x={X((a + x) / 2)} y={Y(0.95)} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.see}>A(x)</text>
      <text x={X(x + h) + 8} y={Y(f(x) / 2) + 4} fontSize="11.5" fill={C.gruenDunkel}>≈ f(x) · h</text>
      <text x={X(5.3)} y={Y(f(5.3)) - 7} textAnchor="end" fontSize="13" fontWeight="700" fontStyle="italic" fill={C.see}>f</text>
    </svg>
  );
}

function HauptsatzText() {
  return (
    <>
      <T s="Wir wollen die Fläche unter dem Graphen von $f$ zwischen $a$ und $b$ berechnen – ohne Rechtecke zu zählen. Die Idee: Wir lassen die rechte Grenze laufen und betrachten die Flächenfunktion $A(x)$, die zu jedem $x$ den Flächeninhalt von $a$ bis $x$ angibt. Dann ist $A(a) = 0$, und gesucht ist $A(b)$." />
      <HauptsatzBild />
      <T s="Schritt 1 – Wie ändert sich $A$? Gehen wir von $x$ ein kleines Stück $h$ weiter, kommt ein schmaler Streifen dazu (gold im Bild). Er ist fast ein Rechteck mit Breite $h$ und Höhe $f(x)$:" />
      <Formel zeilen={["A(x + h) - A(x) \\approx f(x) \\cdot h \\qquad \\Rightarrow \\qquad \\frac{A(x + h) - A(x)}{h} \\approx f(x)"]} />
      <T s="Je kleiner $h$, desto genauer stimmt das, denn $f$ ist stetig: Der Streifen weicht immer weniger von einem Rechteck ab. Links steht der Differenzenquotient von $A$ – und sein Grenzwert ist die Ableitung:" />
      <Formel zeilen={["A′(x) = \\lim_{h \\to 0} \\frac{A(x + h) - A(x)}{h} = f(x)"]} />
      <T s="Das ist der erste Teil des Hauptsatzes: Die Flächenfunktion ist eine Stammfunktion von f. Fläche messen und Ableiten sind Umkehrungen voneinander." />
      <T s="Schritt 2 – Von $A$ zu einer beliebigen Stammfunktion. Ist $F$ irgendeine Stammfunktion von $f$ (also $F′ = f$), dann haben $A$ und $F$ dieselbe Ableitung. Zwei Funktionen mit gleicher Ableitung unterscheiden sich nur um eine Konstante: $A(x) = F(x) + C$. Die Konstante finden wir mit $A(a) = 0$:" />
      <Formel zeilen={["0 = A(a) = F(a) + C \\quad \\Rightarrow \\quad C = -F(a) \\quad \\Rightarrow \\quad A(x) = F(x) - F(a)"]} />
      <T s="Schritt 3 – Einsetzen von $x = b$ liefert die gesuchte Fläche:" />
      <Formel zeilen={["\\int_{a}^{b} f(x) \\, dx = A(b) = F(b) - F(a) = \\left[ F(x) \\right]_{a}^{b}"]} />
      <Merke kopf="Hauptsatz der Differential- und Integralrechnung"
        s="Ist $f$ auf $[a; b]$ stetig und $F$ eine Stammfunktion von $f$, dann gilt $\int_{a}^{b} f(x) \, dx = F(b) - F(a)$. Welche Stammfunktion du nimmst, ist egal – das $C$ hebt sich beim Subtrahieren weg." />
      <T s="Beispiel: $\int_{1}^{2} 3x^{2} \, dx$. Eine Stammfunktion ist $F(x) = x^{3}$, also $F(2) - F(1) = 8 - 1 = 7$. Probe mit Rechtecken ist unnötig – der Hauptsatz macht aus einem Grenzwertproblem eine Rechnung mit zwei Zahlen." />
      <T s="Zwei Dinge, die man leicht vergisst: Erstens muss $f$ auf dem ganzen Intervall stetig sein. $\int_{-1}^{2} \frac{1}{x^{2}} \, dx$ darf man nicht mit dem Hauptsatz rechnen, weil bei $x = 0$ eine Polstelle liegt. Zweitens ist das Integral eine Bilanz: Liegt der Graph unter der x-Achse, zählt die Fläche dort negativ. Für den reinen Flächeninhalt muss man an den Nullstellen trennen." />
    </>
  );
}

/* ---------- Stammfunktion bilden ---------- */

function StammTeil({ modus, desktop, kopf }) {
  const [art, setArt] = useState("potenz");
  const [stufe, setStufe] = useState(1);
  const [fText, setFText] = useState(() => neueStammAufgabe("potenz", 1).text);
  const [posF, setPosF] = useState(fText.length);
  const [F, setF] = useState(leer());
  const [aktiv, setAktiv] = useState(null);          // null | f | F – Eingabe öffnet erst beim Antippen
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });
  const training = modus === "training";
  const waehle = (id) => {
    // Beim Öffnen steht die Schreibmarke am Ende des Terms (nicht vorn)
    if (aktiv !== id) { if (id === "f") setPosF(fText.length); else setF((e) => ({ ...e, pos: e.text.length })); }
    setAktiv((a) => (a === id ? null : id));
  };

  const f = useMemo(() => lies(fText), [fText]);
  const st = useMemo(() => (f ? stammfunktion(f) : null), [f]);
  const gueltig = !!(f && hatX(f) && st);

  const starte = (a = art, s = stufe) => {
    const t = neueStammAufgabe(a, s).text;
    setFText(t); setPosF(t.length); setF(leer()); setAktiv(null);
  };
  useEffect(() => { setF(leer()); setAktiv(null); }, [training]);
  const fertig = training && ["richtig", "gezeigt"].includes(F.status);

  const pruefen = () => {
    if (!training || !st) return;
    const erg = pruefeStamm(F.text, f);
    if (erg.unvollstaendig) { setF((e) => ({ ...e, status: "falsch", hinweis: erg.hinweis })); return; }
    setBilanz((bz) => ({ richtig: bz.richtig + (erg.ok ? 1 : 0), gesamt: bz.gesamt + 1 }));
    buchen({ richtig: erg.ok, gruppe: `stamm-${art}`, stufe });
    if (erg.ok) setF((e) => ({ ...e, status: "richtig", hinweis: erg.hinweis }));
    else setF((e) => ({ ...e, status: "falsch", hinweis: erg.hinweis, versuche: e.versuche + 1 }));
  };
  const loesung = () => setF((e) => ({ ...e, status: "gezeigt", hinweis: "", zeig: tex(st.F) }));

  const eingabeText = aktiv === "f" ? fText : F.text;
  const eingabePos = aktiv === "f" ? posF : F.pos;
  const setText = (t) => (aktiv === "f" ? setFText(t) : setF((e) => ({ ...e, text: t, status: null, hinweis: "" })));
  const setPos = (p) => (aktiv === "f" ? setPosF(p) : setF((e) => ({ ...e, pos: p })));

  const artChips = (
      <div className="wk-chipwrap">
        <div className="wk-chips" role="group" aria-label="Welche Stammfunktionen möchtest du üben?">
          {STAMM_ARTEN.map((a) => (
            <button key={a.id} type="button" className="wk-chip" aria-pressed={art === a.id} onClick={() => { setArt(a.id); starte(a.id, stufe); }}>{a.name}</button>
          ))}
        </div>
      </div>
  );
  const stufenWahl = (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.grau, marginRight: 2 }}>Stufe</span>
        {[1, 2, 3].map((s) => <button key={s} type="button" className="wk-stufe" aria-pressed={stufe === s} onClick={() => { setStufe(s); starte(art, s); }}>{s}</button>)}
      </div>
  );
  const aufgabe = (
      <div className="wk-karte">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.gruenDunkel, textTransform: "uppercase" }}>Stammfunktion bilden</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>Gesucht: F mit F′ = f</p>
            <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.35 }}>
              {training ? "Trainingsmodus: F selbst eintippen, „+ C“ ergänzt die App" : "Automatikmodus: f frei eingeben, F entsteht live"}
              {bilanz.gesamt ? ` · ${bilanz.richtig} von ${bilanz.gesamt} richtig` : ""}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={() => starte()}
              style={{ flexShrink: 0, height: 44, padding: "0 16px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 14.5, fontWeight: 700, color: C.seeTief, background: C.flaggold, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>↻</span>{training ? "Neue Aufgabe" : "Beispiel"}
            </button>
            {training && <MathildaModusKnopf kompakt />}
          </div>
        </div>

        <div style={{ background: blau, borderRadius: 16, padding: "12px 16px", marginBottom: 12, color: C.weiss, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 18px" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.goldText, whiteSpace: "nowrap", lineHeight: 1.9 }}><M t="F′(x) = f(x)" /></span>
          <span style={{ fontSize: 18, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}><M t="\int f(x) \, dx = F(x) + C" /></span>
        </div>

        <div className="wk-grid">
          <Feld label="f(x) =" labelFarbe={FARBE.u} text={fText} aktiv={!training && aktiv === "f"} still={training} onClick={() => waehle("f")} platzhalter="f eingeben …"
            pos={posF} setPos={setPosF} />
          <span className="wk-pfeil" aria-hidden="true">→</span>
          {!training ? <Feld label="F(x) =" labelFarbe={FARBE.v} tex={gueltig ? `${tex(st.F)} + C` : (f && !st ? "" : "")} still
            extra={f && !st ? <span style={{ fontSize: 12, color: C.signal }}>keine Regel</span> : null} />
            : F.status === "gezeigt" ? <Feld label="F(x) =" labelFarbe={FARBE.v} tex={`${F.zeig} + C`} status="gezeigt" still />
              : <Feld label="F(x) =" labelFarbe={FARBE.v} text={F.text ? `${F.text}` : ""} aktiv={aktiv === "F"} status={F.status} onClick={() => waehle("F")}
                pos={F.pos} setPos={(q) => setF((e) => ({ ...e, pos: q }))}
                platzhalter="F eingeben …" extra={F.text ? <span style={{ fontSize: 15, color: C.grau, whiteSpace: "nowrap" }}>+ C</span> : null} />}
        </div>
        {aktiv && !fertig && (
          <EingabePopup>
            {training && F.versuche > 0 && (
              <button type="button" onClick={loesung}
                style={{ width: "100%", height: 46, marginBottom: 10, borderRadius: 14, border: `1.5px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: C.see, background: C.weiss }}>Lösung zeigen</button>
            )}
            <Eingabe text={eingabeText} setText={setText} pos={eingabePos} setPos={setPos} onEnter={training ? pruefen : () => setAktiv(null)}
              platzhalter={training ? "z. B. x^3/3 oder -cos(2x)/2" : "z. B. 3x^2 oder e^(2x)"} />
          </EingabePopup>
        )}
        {F.hinweis && <p style={{ fontSize: 13.5, color: F.status === "richtig" ? C.smaragd : C.signal, lineHeight: 1.6, margin: "8px 4px 0" }}>{F.hinweis}</p>}
        {f && !st && !training && <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "8px 4px 0" }}>Für diese Funktion kennt die Werkstatt keine Stammfunktionsregel (Schulstoff: Potenzen, sin, cos, eˣ, 1/x, lineare Substitution).</p>}

        {gueltig && (!training || fertig) && (
          <div className="wk-rechnung">
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.gruenDunkel, textTransform: "uppercase", marginBottom: 4 }}>Summand für Summand</p>
            {st.teile.map((t, i) => (
              <div key={i} style={{ padding: "4px 0", borderBottom: i < st.teile.length - 1 ? `1px dashed ${C.linie}` : "none" }}>
                <div className="wk-zeile" style={{ padding: 0 }}>
                  <span style={{ color: FARBE.u }}><M t={tex(t.f)} /></span><span style={{ color: C.hellgrau }}>→</span><span style={{ color: FARBE.v }}><M t={tex(t.F)} /></span>
                </div>
                <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>
                  {t.regel}{t.linear ? ` Innere Funktion ${t.linear.m}x${t.linear.c ? (t.linear.c < 0 ? " − " : " + ") + Math.abs(t.linear.c) : ""}: durch die innere Ableitung ${t.linear.m} teilen.` : ""}
                </p>
              </div>
            ))}
            <div className="wk-zeile" style={{ marginTop: 6 }}><span className="wk-gleich">F(x) =</span><M t={`${tex(st.F)} + C`} /></div>
            <div className="wk-zeile" style={{ fontSize: 15, color: C.grau }}><span className="wk-gleich" style={{ fontWeight: 600 }}>Probe:</span><M t={`F′(x) = ${tex(probe(st.F, f))}`} /><span style={{ color: C.smaragd, fontWeight: 700 }}>✓ = f(x)</span></div>
          </div>
        )}

        {training && fertig && (
          <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
            <p style={{ fontSize: 19, fontWeight: 700, color: C.smaragd, marginBottom: 4 }}>{F.status === "richtig" ? "Richtig! 🎉" : "Die Lösung steht oben."}</p>
            <button type="button" onClick={() => starte()}
              style={{ width: "100%", height: 54, marginTop: 10, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 17, fontWeight: 700, color: C.weiss, background: blau }}>
              Neue Aufgabe
            </button>
          </div>
        )}

        <Herleitung titel="Warum „+ C“ – und warum es beim Integral egal ist" untertitel="Stammfunktion, Konstante, Probe">
          <T s="Beim Ableiten fällt jede Konstante weg: $(x^{3} + 5)′ = 3x^{2}$ und $(x^{3} - 2)′ = 3x^{2}$. Deshalb hat $f(x) = 3x^{2}$ nicht eine, sondern unendlich viele Stammfunktionen – sie unterscheiden sich nur um eine Konstante. Das $C$ steht für genau diese Freiheit: $F(x) = x^{3} + C$." />
          <T s="Jede Regel zum Aufleiten ist eine Ableitungsregel rückwärts gelesen. Potenzregel: $(x^{n+1})′ = (n+1) \, x^{n}$, also $\int x^{n} \, dx = \frac{x^{n+1}}{n+1} + C$ für $n \neq -1$. Der Fall $n = -1$ fällt heraus, weil man nicht durch 0 teilen kann – dort springt $\ln|x|$ ein, denn $(\ln|x|)′ = \frac{1}{x}$." />
          <T s="Lineare Substitution: Ist die innere Funktion eine Gerade $mx + c$, liefert die Kettenregel beim Ableiten den Faktor $m$. Beim Aufleiten muss man ihn wieder herausteilen: $\int e^{3x} \, dx = \frac{1}{3} e^{3x} + C$, Probe: $\left(\frac{1}{3} e^{3x}\right)′ = \frac{1}{3} \cdot 3 e^{3x} = e^{3x}$." />
          <Merke kopf="Die Probe ist immer möglich" s="Leite dein $F$ ab. Kommt $f$ heraus, ist $F$ richtig – egal, wie es aussieht. Beim bestimmten Integral hebt sich das $C$ weg: $(F(b) + C) - (F(a) + C) = F(b) - F(a)$." />
        </Herleitung>
      </div>
  );

  /* Desktop: Einstellungen links, Aufgabe rechts (DESKTOP-STIL.md) */
  if (desktop) {
    return (
      <Arbeitsflaeche
        links={<>
          {kopf}
          <FeinKarte>
            <Kicker>Funktionsart</Kicker>
            <div className="si-desk-chips">{artChips}</div>
            <div style={{ marginTop: 14 }}>{stufenWahl}</div>
          </FeinKarte>
        </>}
        rechts={aufgabe} />
    );
  }

  return (
    <>
      {artChips}
      {stufenWahl}
      {aufgabe}
    </>
  );
}

/* ---------- Integral mit dem Hauptsatz ---------- */

function Grenze({ label, wert, setWert, onEnter }) {
  const ok = wert === "" || !!grenzeLesen(wert);
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: C.tinte }}>
      {label}
      <MatheFeld modus="zahl" value={wert} onChange={(e) => setWert(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
        placeholder="0" autoCapitalize="off" autoCorrect="off" spellCheck="false" aria-label={`Grenze ${label}`}
        style={{ width: 74, height: 44, borderRadius: 12, border: `1.5px solid ${ok ? C.linie : C.signal}`, padding: "0 10px", fontSize: 16, fontWeight: 600, fontFamily: "inherit", color: C.tinte, textAlign: "center" }} />
    </label>
  );
}

function IntegralTeil({ modus, start, desktop, kopf }) {
  const [stufe, setStufe] = useState(1);
  const [auf, setAuf] = useState(() => start || neueIntegralAufgabe(1));
  const [fText, setFText] = useState(auf.fText);
  const [posF, setPosF] = useState(auf.fText.length);
  const [aText, setAText] = useState(auf.aText);
  const [bText, setBText] = useState(auf.bText);
  const [F, setF] = useState(leer());
  const [wertText, setWertText] = useState("");
  const [wertStatus, setWertStatus] = useState({ status: null, hinweis: "", versuche: 0 });
  const [aktiv, setAktiv] = useState(null);          // null | f | F – Eingabe öffnet erst beim Antippen
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });
  const training = modus === "training";

  const f = useMemo(() => lies(fText), [fText]);
  const a = useMemo(() => grenzeLesen(aText), [aText]);
  const b = useMemo(() => grenzeLesen(bText), [bText]);
  const hs = useMemo(() => (f && hatX(f) && a && b ? hauptsatz(f, a, b) : null), [f, a, b]);
  const gueltig = !!(hs && !hs.fehler);

  const starte = (s = stufe) => {
    const n = neueIntegralAufgabe(s);
    setFText(n.fText); setPosF(n.fText.length); setAText(n.aText); setBText(n.bText);
    setF(leer()); setWertText(""); setWertStatus({ status: null, hinweis: "", versuche: 0 }); setAktiv(null);
  };
  useEffect(() => { setF(leer()); setWertText(""); setWertStatus({ status: null, hinweis: "", versuche: 0 }); setAktiv(null); }, [training]);
  useEffect(() => { if (!training) { setF(leer()); setWertText(""); setWertStatus({ status: null, hinweis: "", versuche: 0 }); } }, [fText, aText, bText]); // eslint-disable-line react-hooks/exhaustive-deps

  const FFertig = ["richtig", "gezeigt"].includes(F.status);
  const wertFertig = ["richtig", "gezeigt"].includes(wertStatus.status);
  const fertig = training && FFertig && wertFertig;

  const pruefenF = () => {
    if (!gueltig) return;
    const erg = pruefeIntegralStamm(F.text, f, hs, a.v, b.v);
    if (erg.unvollstaendig) { setF((e) => ({ ...e, status: "falsch", hinweis: erg.hinweis })); return; }
    setBilanz((bz) => ({ richtig: bz.richtig + (erg.ok ? 1 : 0), gesamt: bz.gesamt + 1 }));
    buchen({ richtig: erg.ok, gruppe: "integral-stamm", stufe });
    if (erg.ok) setF((e) => ({ ...e, status: "richtig", hinweis: "" }));
    else setF((e) => ({ ...e, status: "falsch", versuche: e.versuche + 1, hinweis: erg.hinweis }));
  };
  const pruefenWert = () => {
    if (!gueltig) return;
    const erg = pruefeIntegralWert(wertText, hs);
    if (erg.unvollstaendig) { setWertStatus((s) => ({ ...s, status: "falsch", hinweis: erg.hinweis })); return; }
    setBilanz((bz) => ({ richtig: bz.richtig + (erg.ok ? 1 : 0), gesamt: bz.gesamt + 1 }));
    buchen({ richtig: erg.ok, gruppe: "integral-wert", stufe });
    if (erg.ok) setWertStatus((s) => ({ ...s, status: "richtig", hinweis: "" }));
    else setWertStatus((s) => ({ ...s, status: "falsch", hinweis: erg.hinweis, versuche: s.versuche + 1 }));
  };
  const loesungF = () => setF((e) => ({ ...e, status: "gezeigt", hinweis: "", zeig: tex(hs.F) }));
  const loesungWert = () => setWertStatus((s) => ({ ...s, status: "gezeigt", hinweis: "" }));

  const aTex = a ? (zahlTex(a.v) || tex(a.baum)) : "a", bTex = b ? (zahlTex(b.v) || tex(b.baum)) : "b";
  const zeigRechnung = gueltig && (!training || FFertig);
  const wertAnzeige = gueltig ? (hs.wertTex || dez(hs.wert, 4)) : "";
  const [bildRef, bildBreite] = useBreite();

  const stufenWahl = (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.grau, marginRight: 2 }}>Stufe</span>
        {[1, 2, 3].map((s) => <button key={s} type="button" className="wk-stufe" aria-pressed={stufe === s} onClick={() => { setStufe(s); starte(s); }}>{s}</button>)}
      </div>
  );
  const kopfZeile = (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.gruenDunkel, textTransform: "uppercase" }}>Integral mit dem Hauptsatz</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>Von a bis b integrieren</p>
            <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.35 }}>
              {training ? "Trainingsmodus: Stammfunktion und Ergebnis selbst berechnen" : "Automatikmodus: f, a und b frei wählen"}
              {bilanz.gesamt ? ` · ${bilanz.richtig} von ${bilanz.gesamt} richtig` : ""}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={() => starte()}
              style={{ flexShrink: 0, height: 44, padding: "0 16px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 14.5, fontWeight: 700, color: C.seeTief, background: C.flaggold, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>↻</span>{training ? "Neue Aufgabe" : "Beispiel"}
            </button>
            {training && <MathildaModusKnopf kompakt />}
          </div>
        </div>
  );
  const hauptsatzBanner = (
        <div style={{ background: blau, borderRadius: 16, padding: "12px 16px", marginBottom: 12, color: C.weiss, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 18px" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.goldText, whiteSpace: "nowrap", lineHeight: 1.6 }}>Hauptsatz</span>
          <span style={{ fontSize: 19, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}><M t={`${intTex("a", "b")} = F(b) - F(a)`} /></span>
        </div>
  );
  const herleitung = (
        <Herleitung titel="Der Hauptsatz – hergeleitet" untertitel="Warum eine Stammfunktion die Fläche liefert">
          <HauptsatzText />
        </Herleitung>
  );
  const eingabe = (
    <>
        {/* Aufgabe: f, a, b */}
        <div style={{ marginTop: 14 }}>
          <Feld label="f(x) =" labelFarbe={FARBE.u} text={fText} aktiv={!training && aktiv === "f"} still={training} onClick={() => { if (aktiv !== "f") setPosF(fText.length); setAktiv((a) => (a === "f" ? null : "f")); }} platzhalter="f eingeben …"
            pos={posF} setPos={setPosF} />
          <div className="si-grenzen" style={{ display: "flex", alignItems: "center", gap: 14, margin: "10px 2px 0", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 600 }}>Grenzen</span>
            {training ? (
              <span style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>a = <M t={aTex} />, b = <M t={bTex} /></span>
            ) : (<><Grenze label="a =" wert={aText} setWert={setAText} /><Grenze label="b =" wert={bText} setWert={setBText} /></>)}
          </div>
          {!training && aktiv === "f" && (
            <EingabePopup>
              <Eingabe text={fText} setText={setFText} pos={posF} setPos={setPosF} onEnter={() => setAktiv(null)} platzhalter="z. B. 3x^2 oder sin(x)" />
            </EingabePopup>
          )}
        </div>
    </>
  );
  const formelUndHinweise = (
    <>
        {/* Die Aufgabe als Formel + Bild */}
        <div style={{ background: blau, borderRadius: 16, padding: "12px 16px", margin: "12px 0 0", overflowX: "auto" }}>
          <span style={{ color: C.weiss, fontSize: 22, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}>
            {f && hatX(f) && a && b ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><IntZ a={<M t={aTex} />} b={<M t={bTex} />} gross /><M t={`${tex(f)} \\, dx`} /></span> : <span style={{ fontSize: 14, fontWeight: 400, color: C.goldText }}>Gib f und die Grenzen a, b ein.</span>}
          </span>
        </div>
        {hs && hs.fehler === "stamm" && <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "8px 4px 0" }}>Für diese Funktion kennt die Werkstatt keine Stammfunktionsregel (Schulstoff: Potenzen, sin, cos, eˣ, 1/x, lineare Substitution).</p>}
        {hs && hs.fehler === "stetig" && <p style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, margin: "8px 4px 0" }}>
          f ist auf [{dez(Math.min(a.v, b.v), 2)}; {dez(Math.max(a.v, b.v), 2)}] nicht überall definiert oder nicht stetig (Problem bei x ≈ {dez(hs.stelle, 2)}). Der Hauptsatz darf hier nicht angewendet werden.</p>}
    </>
  );
  const nebenrechnung = (
    <>
        {/* Nebenrechnung: Stammfunktion */}
        {gueltig && (
          <div className="wk-rechnung">
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.gruenDunkel, textTransform: "uppercase", marginBottom: 6 }}>Nebenrechnung · Stammfunktion bilden</p>
            {!training ? (
              <>
                <Feld label="F(x) =" labelFarbe={FARBE.v} tex={tex(hs.F)} still />
                <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5, margin: "6px 2px 0" }}>
                  {hs.st.teile.map((t) => t.regel).filter((r, i, l) => l.indexOf(r) === i).join(" ")} Das C lässt man beim bestimmten Integral weg – es hebt sich ohnehin weg.
                </p>
              </>
            ) : F.status === "gezeigt" ? <Feld label="F(x) =" labelFarbe={FARBE.v} tex={F.zeig} status="gezeigt" still />
              : <Feld label="F(x) =" labelFarbe={FARBE.v} text={F.text} aktiv={aktiv === "F" && !FFertig} status={F.status} still={FFertig} onClick={() => { if (aktiv !== "F") setF((e) => ({ ...e, pos: e.text.length })); setAktiv((a) => (a === "F" ? null : "F")); }} platzhalter="Stammfunktion eingeben …"
                pos={F.pos} setPos={(q) => setF((e) => ({ ...e, pos: q }))} />}
            {training && aktiv === "F" && !FFertig && (
              <EingabePopup>
                {F.versuche > 0 && <button type="button" onClick={loesungF}
                  style={{ width: "100%", height: 46, marginBottom: 10, borderRadius: 14, border: `1.5px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: C.see, background: C.weiss }}>Lösung zeigen</button>}
                <Eingabe text={F.text} setText={(t) => setF((e) => ({ ...e, text: t, status: null, hinweis: "" }))} pos={F.pos} setPos={(p) => setF((e) => ({ ...e, pos: p }))} onEnter={pruefenF} platzhalter="z. B. x^3 oder -cos(x)" />
              </EingabePopup>
            )}
            {F.hinweis && <p style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, margin: "8px 4px 0" }}>{F.hinweis}</p>}
          </div>
        )}
    </>
  );
  const rechnung = (
    <>
        {/* Die Rechnung */}
        {gueltig && (
          <div className="wk-rechnung">
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.gruenDunkel, textTransform: "uppercase", marginBottom: 4 }}>Hauptsatz anwenden</p>
            {zeigRechnung ? (
              <>
                <div className="wk-zeile"><M t={`${intTex(aTex, bTex, tex(f))} = \\left[ ${tex(hs.F)} \\right]_{${aTex}}^{${bTex}}`} /></div>
                <div className="wk-zeile"><span className="wk-gleich" style={{ color: C.hellgrau }}>=</span><M t={`\\farbe{u}{${hs.FbTex}} \\; - \\; \\farbe{v}{(${hs.FaTex})}`} /><span style={{ fontSize: 12, color: C.grau }}>F(b) − F(a)</span></div>
                {(hs.FbWert || hs.FaWert) && (
                  <div className="wk-zeile"><span className="wk-gleich" style={{ color: C.hellgrau }}>=</span>
                    <M t={`\\farbe{u}{${hs.FbWert || dez(hs.Fb)}} \\; - \\; \\farbe{v}{(${hs.FaWert || dez(hs.Fa)})}`} /></div>
                )}
                {(training && !wertFertig) ? (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 17, color: C.hellgrau, minWidth: 62, textAlign: "right" }}>=</span>
                      <MatheFeld modus="zahl" value={wertText} onChange={(e) => { setWertText(e.target.value); setWertStatus((s) => ({ ...s, status: null, hinweis: "" })); }}
                        onKeyDown={(e) => { if (e.key === "Enter") pruefenWert(); }} placeholder="Ergebnis" aria-label="Wert des Integrals" autoCapitalize="off" autoCorrect="off" spellCheck="false"
                        style={{ width: 150, height: 50, borderRadius: 12, border: `1.5px solid ${wertStatus.status === "falsch" ? C.signal : C.linie}`, padding: "0 12px", fontSize: 18, fontWeight: 700, fontFamily: "inherit", color: C.tinte }} />
                      <button type="button" onClick={pruefenWert}
                        style={{ height: 50, padding: "0 22px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 17, fontWeight: 800, color: C.weiss, background: C.smaragd, boxShadow: "0 4px 14px rgba(47,143,91,0.3)" }}>OK</button>
                      {wertStatus.versuche > 0 && <button type="button" onClick={loesungWert} style={{ background: "none", border: "none", color: C.see, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Lösung zeigen</button>}
                    </div>
                    {wertStatus.hinweis && <p style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, margin: "8px 4px 0" }}>{wertStatus.hinweis}</p>}
                  </div>
                ) : (
                  <div className="wk-zeile"><span className="wk-gleich" style={{ color: C.hellgrau }}>=</span>
                    <span style={{ fontWeight: 800, color: C.smaragd }}><M t={wertAnzeige} /></span>
                    {!hs.wertTex && <span style={{ fontSize: 12.5, color: C.grau }}>gerundet</span>}
                    {hs.wert < 0 && <span style={{ fontSize: 12.5, color: C.grau }}>negativ: Bilanz unter der x-Achse</span>}
                  </div>
                )}
              </>
            ) : <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>Bilde zuerst oben die Stammfunktion – dann geht es hier mit F(b) − F(a) weiter.</p>}
          </div>
        )}
    </>
  );
  const geschafft = (
    <>
        {training && fertig && (
          <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
            <p style={{ fontSize: 19, fontWeight: 700, color: C.smaragd, marginBottom: 4 }}>{F.status === "richtig" && wertStatus.status === "richtig" ? "Alles richtig! 🎉" : "Geschafft – die Rechnung steht."}</p>
            <button type="button" onClick={() => starte()}
              style={{ width: "100%", height: 54, marginTop: 10, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 17, fontWeight: 700, color: C.weiss, background: blau }}>Neue Aufgabe</button>
          </div>
        )}
    </>
  );

  /* Desktop: Eingaben links, Schaubild rechts, Rechenweg darunter (DESKTOP-STIL.md) */
  if (desktop) {
    const bW = bildBreite || 460;
    return (
      <div data-si-integral="breit">
        <Arbeitsflaeche
          links={<>
            {kopf}
            <FeinKarte>
              {stufenWahl}
              <div style={{ height: 1, background: C.linie, margin: "2px 0 0" }} />
              {eingabe}
            </FeinKarte>
            <div className="si-desk-satz">{hauptsatzBanner}</div>
          </>}
          rechts={<>
            <FeinKarte>
              {kopfZeile}
              <div className="si-desk-formel">{formelUndHinweise}</div>
            </FeinKarte>
            {gueltig && (
              <BildKarte>
                <div ref={bildRef}><Flaechenbild f={f} a={a.v} b={b.v} W={bW} H={Math.round(bW * 0.6)} rahmenlos /></div>
              </BildKarte>
            )}
            {herleitung}
          </>} />
        {gueltig && (
          <ErgebnisReihe style={{ marginTop: 20 }} spalten="minmax(0, 5fr) minmax(0, 7fr)">
            <FeinKarte className="si-desk-rechnung">{nebenrechnung}</FeinKarte>
            <FeinKarte className="si-desk-rechnung">{rechnung}{geschafft}</FeinKarte>
          </ErgebnisReihe>
        )}
      </div>
    );
  }

  return (
    <>
      {stufenWahl}

      <div className="wk-karte">
        {kopfZeile}

        {hauptsatzBanner}

        {herleitung}

        {eingabe}

        {formelUndHinweise}
        {gueltig && <div style={{ marginTop: 12 }}><Flaechenbild f={f} a={a.v} b={b.v} /></div>}

        {nebenrechnung}

        {rechnung}

        {geschafft}
      </div>
    </>
  );
}

/* ---------- Aussehen ---------- */
const SI_CSS = `
        .abl-seite{background:#fff;min-height:calc(100dvh - 61px)}
        .abl-innen{max-width:620px;margin:0 auto;padding:14px 16px 48px}
        .si-bereich{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;border-radius:18px;background:#EEF2F8;margin-bottom:14px}
        .si-bereich button{height:56px;border-radius:14px;border:none;font-family:inherit;cursor:pointer;background:transparent;color:${C.grau};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0 8px}
        .si-bereich button span{font-size:15px;font-weight:700;line-height:1.2}
        .si-bereich button small{font-size:11.5px;font-weight:500;line-height:1.2;opacity:.8}
        .si-bereich button[aria-selected="true"]{background:${blau};color:#fff;box-shadow:0 4px 12px rgba(0,77,152,0.25)}
        .si-bereich button[aria-selected="true"] small{color:${C.goldText}}
        @media (min-width:601px){ .abl-seite{background:transparent} }
        ${WERK_CSS}`;

/* Desktop (ab 840 px): Spalte 783 px wie alle Werkzeugseiten, Kopfleiste darüber in derselben Breite,
   Karten mit feinem Rahmen statt Schatten (DESKTOP-STIL.md) */
const SI_DESK_CSS = kompaktSpalteCss("si-desk") + `
  .si-desk .si-bereich{grid-template-columns:1fr;margin-bottom:0}
  .si-desk .si-bereich button{height:52px}
  .si-desk .si-desk-modus .wk-seg{display:flex}
  .si-desk .si-desk-modus .wk-seg button{flex:1}
  .si-desk .wk-chipwrap{margin:0}
  .si-desk .wk-chipwrap::after{display:none}
  .si-desk .wk-chips{flex-wrap:wrap;overflow:visible;padding:0;gap:6px}
  .si-desk .wk-chip{height:34px;padding:0 13px;font-size:13px}
  .si-desk .wk-karte{background:#fff;border:1px solid ${C.linie};border-radius:16px;padding:18px 20px;box-shadow:none}
  .si-desk .si-desk-rechnung .wk-rechnung{background:transparent;padding:0;margin-top:0;border-radius:0}
  .si-desk .si-desk-formel > div:first-child{margin-top:0 !important}
  .si-desk .si-grenzen{row-gap:8px !important}
  .si-desk .si-grenzen > span:first-child{flex-basis:100%}
  .si-desk .si-desk-satz > div{margin-bottom:0 !important}
`;

/* ---------- Seite ---------- */

export function StammIntegral() {
  const [start] = useState(() => { const u = uebergabeLesen("stammintegral"); return u && u.f ? { fText: u.f, aText: String(u.a ?? "0"), bText: String(u.b ?? "1") } : null; });
  useEffect(() => { uebergabeErledigt("stammintegral"); }, []);
  const [teil, setTeil] = useState(start ? "integral" : "stamm");
  const [modus, setModus] = useState("auto");
  const desktop = useDesktop();
  const bereichWahl = (
    <div className="si-bereich" role="tablist" aria-label="Bereich">
      {[["stamm", "Stammfunktion bilden", "F mit F′ = f"], ["integral", "Integral ∫ₐᵇ", "mit dem Hauptsatz"]].map(([id, name, unter]) => (
        <button key={id} type="button" role="tab" aria-selected={teil === id} onClick={() => setTeil(id)}><span>{name}</span><small>{unter}</small></button>
      ))}
    </div>
  );
  const animation = <ErklaerAnimation key={teil} art={teil === "stamm" ? "stamm" : "integral"} kompakt />;
  const modusSchalter = <ModusSchalter modus={modus} setModus={setModus} />;

  /* Desktop: Bereich, Modus und Erkläranimation stehen links über den Einstellungen des Teils */
  if (desktop) {
    const kopf = (
      <>
        {bereichWahl}
        <FeinKarte>
          <Kicker>Modus</Kicker>
          <div className="si-desk-modus">{modusSchalter}</div>
          <div style={{ marginTop: 14 }}>{animation}</div>
        </FeinKarte>
      </>
    );
    return (
      <div className="abl-seite si-desk" data-si="breit">
        <style>{SI_CSS}</style>
        <style>{SI_DESK_CSS}</style>
        <div style={{ display: teil === "stamm" ? "block" : "none" }}><StammTeil modus={modus} desktop kopf={teil === "stamm" ? kopf : null} /></div>
        <div style={{ display: teil === "integral" ? "block" : "none" }}><IntegralTeil modus={modus} start={start} desktop kopf={teil === "integral" ? kopf : null} /></div>
      </div>
    );
  }

  return (
    <div className="abl-seite">
      <style>{SI_CSS}</style>
      <div className="abl-innen">
        {bereichWahl}
        {animation}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>{modusSchalter}</div>
        <div style={{ display: teil === "stamm" ? "block" : "none" }}><StammTeil modus={modus} /></div>
        <div style={{ display: teil === "integral" ? "block" : "none" }}><IntegralTeil modus={modus} start={start} /></div>
      </div>
    </div>
  );
}
