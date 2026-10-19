import React, { useState } from "react";
import { C, EFUNKTION_VIDEO_ID } from "./base1.jsx";
import { komma } from "./base3.jsx";
import { ErklaerVideo, parseZahl } from "./func1.jsx";
import { M, Text, alsFunktion, stimmtUeberein } from "./func3.jsx";
import { TermTastatur } from "./func4.jsx";
import { DiffqStufenknopf, merken } from "./func5.jsx";
import { plotAbbildung, Achsen, Schieber } from "./func6.jsx";
import { Formeln, Schritt, Kasten } from "./func22.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { ableitAufgabe, asymptoteAufgabe, tangentenAufgabe } from "./efunktionGen.js";
import { ansichtGesperrt } from "./angebot.js";
import { istFrei } from "./seitenKonstanten.js";

/* ---------- Themenseite „Die natürliche Exponentialfunktion“ ----------
   Aufbau nach dem Muster der Differenzenquotient-Seite:
   Leitfrage · Video · Herleitung in sechs Schritten · Visualisierung · Übung (Trainer + Buchaufgaben) */

const FLIESS = { color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 };
const KLEIN = { fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 };

/* ---------- Visualisierung ---------- */

function Pille({ aktiv, onClick, children }) {
  return (
    <button onClick={onClick} className="px-4 py-2"
      style={{ background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.grau, border: `1px solid ${aktiv ? C.see : C.linie}`,
        borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
      {children}
    </button>
  );
}

function VisBasis() {
  const [a, setA] = useState(2);
  const ln = Math.log(a);
  const xmin = -2.5, xmax = 2.5, ymin = -1, ymax = 6;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  const treffer = Math.abs(ln - 1) < 0.012;
  return (
    <div>
      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <defs><clipPath id="vebasis"><rect width={p.B} height={p.H} /></clipPath></defs>
        <Achsen p={p} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
        <g clipPath="url(#vebasis)">
          <path d={`M ${p.px(xmin)} ${p.py(1 + ln * xmin)} L ${p.px(xmax)} ${p.py(1 + ln * xmax)}`} stroke={C.flaggold} strokeWidth="2" fill="none" />
          <path d={p.kurve((x) => ln * a ** x)} stroke={C.gruenDunkel} strokeWidth="2" strokeDasharray="6 5" fill="none" />
          <path d={p.kurve((x) => a ** x)} stroke={C.see} strokeWidth="2.6" fill="none" />
          <circle cx={p.px(0)} cy={p.py(1)} r="5.5" fill={C.flaggold} stroke={C.tinte} strokeWidth="1.2" />
        </g>
      </svg>
      <Schieber name="a" wert={a} min={1.2} max={4.5} schritt={0.01} setzen={setA} anzeige={komma(a, 2)} />
      <div className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 10 }}>
        <Pille aktiv={treffer} onClick={() => setA(Math.E)}>a = e setzen</Pille>
        <span style={{ fontSize: 14.5 }}>Steigung in <M t="P(0 \mid 1)" />: <b style={{ color: C.see }}>{komma(ln, 3)}</b></span>
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 10 }}>
        {treffer
          ? "Treffer: Bei a ≈ 2,718 hat die Tangente in P die Steigung 1 – der Graph der Ableitung (gestrichelt) liegt genau auf dem Graphen von f."
          : `Blau der Graph von f(x) = ${komma(a, 2)}ˣ, gestrichelt die Ableitung f′, gold die Tangente in P. Die Ableitung liegt ${ln < 1 ? "unter" : "über"} dem Graphen – sie ist das ${komma(ln, 3)}-Fache von f.`}
      </p>
    </div>
  );
}

function VisSubtangente() {
  const [pp, setP] = useState(0.6);
  const ep = Math.exp(pp);
  const xmin = -3.5, xmax = 2.5, ymin = -0.8, ymax = 5;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  return (
    <div>
      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <defs><clipPath id="vesub"><rect width={p.B} height={p.H} /></clipPath></defs>
        <Achsen p={p} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
        <g clipPath="url(#vesub)">
          <path d={`M ${p.px(xmin)} ${p.py(ep * (xmin - pp) + ep)} L ${p.px(xmax)} ${p.py(ep * (xmax - pp) + ep)}`} stroke={C.gruenDunkel} strokeWidth="2" fill="none" />
          <path d={p.kurve(Math.exp)} stroke={C.see} strokeWidth="2.6" fill="none" />
          <line x1={p.px(pp)} y1={p.py(ep)} x2={p.px(pp)} y2={p.py(0)} stroke={C.grau} strokeWidth="1.2" strokeDasharray="4 4" />
          <line x1={p.px(pp - 1)} y1={p.py(0)} x2={p.px(pp)} y2={p.py(0)} stroke={C.flaggold} strokeWidth="5" strokeLinecap="round" />
          <text x={p.px(pp - 0.5)} y={p.py(0) + 17} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.gruenDunkel}>s = 1</text>
          <circle cx={p.px(pp)} cy={p.py(ep)} r="5.5" fill={C.flaggold} stroke={C.tinte} strokeWidth="1.2" />
        </g>
      </svg>
      <Schieber name="p" wert={pp} min={-2.2} max={1.55} schritt={0.01} setzen={setP} anzeige={komma(pp, 2)} />
      <Formeln zeilen={[
        `t_P: \\; y = e^{p} \\cdot (x - p) + e^{p}`,
        `y = 0 \\; \\Rightarrow \\; x - p = -1 \\; \\Rightarrow \\; x = p - 1`,
        `s = p - (p - 1) = 1`,
      ]} max={15} />
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>
        Egal wo P liegt: Die Subtangente ist immer genau 1 lang. Das entdeckte Christiaan Huygens schon im 17. Jahrhundert.
      </p>
    </div>
  );
}

function VisEGewinnt() {
  const [n, setN] = useState(2);
  const hoch = n ** n * Math.exp(-n);
  const xmin = -0.5, xmax = 15, ymin = -0.12 * hoch * 1.35, ymax = hoch * 1.35;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  return (
    <div>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 8 }}>
        {[1, 2, 3, 4].map((k) => <Pille key={k} aktiv={n === k} onClick={() => setN(k)}><M t={`\\frac{x^{${k}}}{e^{x}}`.replace("x^{1}", "x")} /></Pille>)}
      </div>
      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <defs><clipPath id="vegew"><rect width={p.B} height={p.H} /></clipPath></defs>
        <line x1="0" y1={p.py(0)} x2={p.B} y2={p.py(0)} stroke={C.hellgrau} strokeWidth="1.3" />
        <line x1={p.px(0)} y1="0" x2={p.px(0)} y2={p.H} stroke={C.hellgrau} strokeWidth="1.3" />
        {Array.from({ length: 15 }, (_, i) => i + 1).map((x) => (
          <line key={x} x1={p.px(x)} y1={p.py(0) - 3} x2={p.px(x)} y2={p.py(0) + 3} stroke={C.hellgrau} strokeWidth="1" />
        ))}
        <g clipPath="url(#vegew)">
          <path d={p.kurve((x) => x ** n * Math.exp(-x), 0, xmax)} stroke={C.see} strokeWidth="2.6" fill="none" />
          <circle cx={p.px(n)} cy={p.py(hoch)} r="5" fill={C.flaggold} stroke={C.tinte} strokeWidth="1.2" />
          <text x={p.px(n) + 8} y={p.py(hoch) - 6} fontSize="12" fill={C.gruenDunkel} fontWeight="600">{`H(${n} | ${komma(hoch, 2)})`}</text>
          <text x={p.px(10)} y={p.py(0) - 8} fontSize="12" fill={C.grau}>{`f(10) ≈ ${komma(10 ** n * Math.exp(-10), 4)}`}</text>
        </g>
      </svg>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 10 }}>
        Zuerst wächst der Zähler <M t={n === 1 ? "x" : `x^{${n}}`} /> schneller, bis zum Hochpunkt bei x = {n}. Danach gewinnt <M t="e^{x}" /> –
        der Quotient läuft gegen 0, und zwar für jedes n, egal wie groß.
      </p>
    </div>
  );
}

function VisEFunktion() {
  const [tab, setTab] = useState("basis");
  const texte = {
    basis: "Zieh an der Basis a und finde die Exponentialfunktion, deren Tangente in P(0 | 1) die Steigung 1 hat",
    sub: "Verschieb den Punkt P und beobachte die Strecke s zwischen Tangenten-Nullstelle und Fußpunkt",
    gewinnt: "Wähl den Exponenten n und sieh, wie eˣ am Ende jede Potenz schlägt",
  };
  return (
    <div>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 12 }}>
        <Pille aktiv={tab === "basis"} onClick={() => setTab("basis")}>Die Basis e</Pille>
        <Pille aktiv={tab === "sub"} onClick={() => setTab("sub")}>Subtangente</Pille>
        <Pille aktiv={tab === "gewinnt"} onClick={() => setTab("gewinnt")}>e gewinnt</Pille>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>{texte[tab]}</p>
      {tab === "basis" ? <VisBasis /> : tab === "sub" ? <VisSubtangente /> : <VisEGewinnt />}
    </div>
  );
}

/* ---------- Trainer ---------- */

function Wahl({ titel, optionen, wert, setWert, richtig, geprueft }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 8 }}>{titel}</p>
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {optionen.map((o, i) => {
          const gewaehlt = wert === i;
          const farbe = geprueft && gewaehlt ? (i === richtig ? C.see : C.signal) : gewaehlt ? C.see : C.linie;
          return (
            <button key={i} onClick={() => setWert(i)} className="px-4 py-2"
              style={{ background: gewaehlt ? (geprueft && i !== richtig ? "#FBEFE8" : C.himmel) : C.weiss, color: C.tinte,
                border: `1.5px solid ${farbe}`, borderRadius: 12, fontSize: 14.5, fontFamily: "inherit", cursor: "pointer" }}>
              <M t={o} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EFunktionTrainer() {
  const [modus, setModus] = useState("ableiten");
  const [stufe, setStufe] = useState(2);
  const erzeugen = (mo, s) => (mo === "asymptote" ? asymptoteAufgabe(s) : mo === "tangente" ? tangentenAufgabe(s) : ableitAufgabe(s));
  const [auf, setAuf] = useState(() => ableitAufgabe(2));
  const [eingabe, setEingabe] = useState("");
  const [wahlen, setWahlen] = useState({});
  const [stand, setStand] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [tippen, setTippen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const [start, setStart] = useState(() => Date.now());

  const neu = (mo = modus, s = stufe) => {
    setAuf(erzeugen(mo, s)); setEingabe(""); setWahlen({}); setStand(null); setZeigen(false); setStart(Date.now());
  };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(modus, v); };
  const modusSetzen = (mo) => { setModus(mo); neu(mo, stufe); };

  const asym = modus === "asymptote";
  const yWert = asym ? parseZahl(eingabe) : null;
  const teilOk = asym ? {
    y: yWert !== null && Math.abs(yWert - auf.richtig.y) < 1e-9,
    richtung: wahlen.richtung === auf.richtig.richtung,
    wert: wahlen.wert === auf.richtig.wert,
    mono: wahlen.mono === auf.richtig.mono,
  } : null;
  const bereit = asym ? eingabe.trim() && [0, 1].includes(wahlen.richtung) && [0, 1].includes(wahlen.wert) && [0, 1].includes(wahlen.mono) : eingabe.trim();

  const pruefen = () => {
    let ok;
    if (asym) ok = Object.values(teilOk).every(Boolean);
    else {
      const meins = alsFunktion(eingabe);
      if (!meins) { setStand("unlesbar"); return; }
      ok = stimmtUeberein(meins, modus === "tangente" ? auf.tangente : auf.abl, 1e-6);
    }
    setStand(ok ? "ok" : "nein");
    setSerie((s) => ({ n: s.n + 1, ok: s.ok + (ok ? 1 : 0) }));
    try {
      merken({ bereich: "efunktion", gruppe: modus, stufe, richtig: ok,
        sekunden: Math.max(1, Math.round((Date.now() - start) / 1000)), fehlerart: ok ? null : modus === "ableiten" ? "ableitungsregel" : "grenzverhalten" });
    } catch (e) { /* Lernprotokoll ist optional */ }
  };

  const feldStil = {
    width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
    border: `1.5px solid ${stand === "ok" || (asym && stand && teilOk.y) ? C.see : stand ? C.signal : C.linie}`, borderRadius: 12, outline: "none",
    background: stand === "ok" ? C.himmel : C.weiss, color: C.tinte, marginBottom: 8,
  };

  const hinweis = stand === "unlesbar"
    ? "Der Term lässt sich nicht lesen – prüfe die Klammern. Schreib Exponenten mit Klammer: e^(2x+1), nicht e^2x+1."
    : modus === "ableiten" ? auf.tipp
    : modus === "tangente" ? "Berechne f(0) und f′(0). Die Tangente ist dann y = f′(0) · x + f(0)."
    : "Für welche Richtung wird der Exponent sehr negativ? Dort geht der e-Teil gegen 0 und f gegen die Konstante. Das Vorzeichen vor e entscheidet, ob der Graph über oder unter der Asymptote liegt.";

  const d = asym ? auf.d : 0;
  const aufgabeText = modus === "ableiten" ? "Gib f′(x) ein:" : modus === "tangente" ? "Gib die Gleichung der Tangente im Schnittpunkt mit der y-Achse ein:" : null;

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Drei Bereiche, jeweils in fünf Stufen: Ableiten bis zur Ketten- und Produktregel, das Grenzverhalten mit Asymptote und
        Wertemenge, und die Tangente im Schnittpunkt mit der y-Achse – genau wie in Aufgabe 4 aus dem Buch.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {[["ableiten", "Ableiten"], ["asymptote", "Asymptote & Wertemenge"], ["tangente", "Tangente bei x = 0"]].map(([id, n]) => (
          <Pille key={id} aktiv={modus === id} onClick={() => modusSetzen(id)}>{n}</Pille>
        ))}
      </div>

      <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
        <DiffqStufenknopf zeichen="−" onClick={() => stufeSetzen(stufe - 1)} />
        <div className="flex" style={{ gap: 4 }}>
          {[1, 2, 3, 4, 5].map((k) => (
            <span key={k} style={{ width: 9, height: 9, borderRadius: 999, background: k <= stufe ? C.see : C.linie, display: "inline-block" }} />
          ))}
        </div>
        <DiffqStufenknopf zeichen="+" onClick={() => stufeSetzen(stufe + 1)} />
        <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
        <Formeln zeilen={[`f(x) = ${auf.tex}`]} max={20} />

        {asym ? (
          <>
            <p style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 8 }}>Waagrechte Asymptote: y =</p>
            <MatheFeld modus="bruch" value={eingabe} onChange={(e) => { setEingabe(e.target.value); setStand(null); }} placeholder="Zahl" style={feldStil} />
            <div style={{ height: 8 }} />
            <Wahl titel="Die Asymptote gilt für" optionen={["x \\to -\\infty", "x \\to +\\infty"]} wert={wahlen.richtung}
              setWert={(v) => { setWahlen({ ...wahlen, richtung: v }); setStand(null); }} richtig={auf.richtig.richtung} geprueft={!!stand} />
            <Wahl titel="Wertemenge" optionen={[`W_f = ]${d}; +\\infty[`, `W_f = ]-\\infty; ${d}[`]} wert={wahlen.wert}
              setWert={(v) => { setWahlen({ ...wahlen, wert: v }); setStand(null); }} richtig={auf.richtig.wert} geprueft={!!stand} />
            <Wahl titel="Monotonie" optionen={["\\text{streng monoton steigend}", "\\text{streng monoton fallend}"]} wert={wahlen.mono}
              setWert={(v) => { setWahlen({ ...wahlen, mono: v }); setStand(null); }} richtig={auf.richtig.mono} geprueft={!!stand} />
          </>
        ) : (
          <>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{aufgabeText}</p>
            {tippen ? (
              <MatheFeld modus="formel" value={eingabe} onChange={(e) => { setEingabe(e.target.value); setStand(null); }}
                placeholder={modus === "tangente" ? "y = …" : "f′(x)"} style={feldStil} />
            ) : (
              <TermTastatur wert={eingabe} setWert={(w) => { setEingabe(w); setStand(null); }} />
            )}
            <button onClick={() => setTippen(!tippen)} className="mt-2"
              style={{ background: "none", border: "none", color: C.see, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
            </button>
          </>
        )}
        <div style={{ height: 12 }} />

        {stand === "ok" && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            <Formeln zeilen={auf.weg} max={15} farbe={C.see} />
          </div>
        )}
        {(stand === "nein" || stand === "unlesbar") && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>
              {asym ? `${Object.values(teilOk).filter(Boolean).length} von 4 Angaben stimmen.` : "Stimmt noch nicht."}
            </p>
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{hinweis}</p>
            {!zeigen && (
              <button onClick={() => setZeigen(true)} className="mt-3"
                style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Rechenweg zeigen
              </button>
            )}
            {zeigen && <Formeln zeilen={auf.weg} max={15} farbe={C.see} />}
          </div>
        )}
        {stand !== "ok" && (
          <button onClick={pruefen} disabled={!bereit} className="px-6 py-3"
            style={{ background: bereit ? C.see : C.hellgrau, color: C.weiss, border: "none",
              borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Prüfen
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3"
          style={{ background: C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Nächste Aufgabe
        </button>
        {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
      </div>
    </div>
  );
}

/* ---------- Buchaufgaben mit Lösungsweg ---------- */

function BuchAufgabe({ nr, titel, aufgabe, children }) {
  const [offen, setOffen] = useState(false);
  return (
    <div style={{ background: C.weiss, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <span style={{ flexShrink: 0, minWidth: 34, height: 34, padding: "0 8px", borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
          color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{nr}</span>
        <p style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, color: C.tinte }}>{titel}</p>
      </div>
      <Text s={aufgabe} style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.75, margin: "10px 0 8px" }} />
      <button onClick={() => setOffen(!offen)}
        style={{ background: "none", border: "none", color: C.see, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
        {offen ? "Lösungsweg ausblenden" : "Lösungsweg zeigen"}
      </button>
      {offen && <div style={{ marginTop: 10, borderTop: `1px solid ${C.linie}`, paddingTop: 6 }}>{children}</div>}
    </div>
  );
}

function Teil({ marke, text, zeilen, max = 15 }) {
  return (
    <div style={{ marginTop: 10 }}>
      {marke && <Text s={marke} style={KLEIN} />}
      {text && <Text s={text} style={{ ...FLIESS, fontSize: 14, marginBottom: 4 }} />}
      {zeilen && <Formeln zeilen={zeilen} max={max} />}
    </div>
  );
}

function Buchaufgaben() {
  return (
    <div>
      <BuchAufgabe nr="N" titel="Nachgefragt: Funktionalgleichung"
        aufgabe="Zeige, dass für $f(x) = e^{x}$ und alle reellen Zahlen $a$, $b$ gilt: $f(a + b) = f(a) \cdot f(b)$.">
        <Teil text="Kurz mit dem Potenzgesetz $e^{a+b} = e^{a} \cdot e^{b}$:" zeilen={["f(a + b) = e^{a + b} = e^{a} \\cdot e^{b} = f(a) \\cdot f(b)"]} />
        <Teil text="Ohne Potenzgesetz, nur mit Ableitungen: Für festes $a$ sei $g(x) = e^{a + x} \cdot e^{-x}$. Mit Produkt- und Kettenregel:"
          zeilen={[
            "g′(x) = e^{a + x} \\cdot e^{-x} + e^{a + x} \\cdot (-e^{-x}) = 0",
            "\\Rightarrow \\; g(x) = g(0) = e^{a} \\quad \\text{für alle } x",
          ]} />
        <Teil text="Für $a = 0$ heißt das $e^{x} \cdot e^{-x} = 1$. Multipliziert man $e^{a+x} \cdot e^{-x} = e^{a}$ mit $e^{x}$, folgt $e^{a + x} = e^{a} \cdot e^{x}$ – mit $x = b$ die Behauptung." />
      </BuchAufgabe>

      <BuchAufgabe nr="N" titel="Nachgefragt: Asymptote von a + eˣ"
        aufgabe="Begründe, dass der Graph jeder Funktion $f_a(x) = a + e^{x}$ mit $a \in \mathbb{R}$ eine waagrechte Asymptote hat.">
        <Teil zeilen={[
          "x \\to -\\infty: \\quad e^{x} \\to 0 \\; \\Rightarrow \\; f_a(x) \\to a",
          "x \\to +\\infty: \\quad f_a(x) \\to +\\infty",
        ]} />
        <Teil text="Für $x \to -\infty$ nähert sich der Graph also der Geraden $y = a$ – das ist die waagrechte Asymptote. Der Graph ist der um $a$ in y-Richtung verschobene Graph von $e^{x}$." />
      </BuchAufgabe>

      <BuchAufgabe nr="2" titel="Ableitungen und Stammfunktion"
        aufgabe="Bestimme $f′$, $f″$ und diejenige Stammfunktion $F$, deren Graph durch $P$ geht.">
        <Teil marke="a)  $f(x) = 2e^{x} + 3$, $P(0 \mid 2)$" zeilen={[
          "f′(x) = 2e^{x}, \\quad f″(x) = 2e^{x}",
          "F(x) = 2e^{x} + 3x + c",
          "F(0) = 2 + c = 2 \\; \\Rightarrow \\; c = 0",
          "F(x) = 2e^{x} + 3x",
        ]} />
        <Teil marke="b)  $f(x) = 1 - \frac{1}{2}e^{x}$, $P(0 \mid 1)$" zeilen={[
          "f′(x) = -\\frac{1}{2}e^{x}, \\quad f″(x) = -\\frac{1}{2}e^{x}",
          "F(x) = x - \\frac{1}{2}e^{x} + c",
          "F(0) = -\\frac{1}{2} + c = 1 \\; \\Rightarrow \\; c = \\frac{3}{2}",
          "F(x) = x - \\frac{1}{2}e^{x} + \\frac{3}{2}",
        ]} />
        <Teil marke="c)  $f(x) = x^{3} - \frac{1}{4}e^{x}$, $P(0 \mid -1)$" zeilen={[
          "f′(x) = 3x^{2} - \\frac{1}{4}e^{x}, \\quad f″(x) = 6x - \\frac{1}{4}e^{x}",
          "F(x) = \\frac{1}{4}x^{4} - \\frac{1}{4}e^{x} + c",
          "F(0) = -\\frac{1}{4} + c = -1 \\; \\Rightarrow \\; c = -\\frac{3}{4}",
          "F(x) = \\frac{1}{4}x^{4} - \\frac{1}{4}e^{x} - \\frac{3}{4}",
        ]} />
        <Teil marke="d)  $f(x) = \frac{1}{2}x + ex^{2} - e^{x}$, $P(0 \mid 0)$" text="Achtung: $e$ vor $x^{2}$ ist nur eine Zahl, ein konstanter Faktor." zeilen={[
          "f′(x) = \\frac{1}{2} + 2ex - e^{x}, \\quad f″(x) = 2e - e^{x}",
          "F(x) = \\frac{1}{4}x^{2} + \\frac{e}{3}x^{3} - e^{x} + c",
          "F(0) = -1 + c = 0 \\; \\Rightarrow \\; c = 1",
          "F(x) = \\frac{1}{4}x^{2} + \\frac{e}{3}x^{3} - e^{x} + 1",
        ]} />
      </BuchAufgabe>

      <BuchAufgabe nr="3" titel="Verhalten für betragsgroße x und Asymptoten"
        aufgabe="Gib das Verhalten für $x \to \pm\infty$ und die Gleichungen aller Asymptoten an. Werkzeug ist jedes Mal: e gewinnt.">
        <Teil marke="a)  $f(x) = x \cdot e^{x}$" zeilen={["x \\to +\\infty: f(x) \\to +\\infty; \\quad x \\to -\\infty: f(x) \\to 0", "\\text{Asymptote } y = 0"]} />
        <Teil marke="b)  $f(x) = \frac{x^{2}}{e^{x}}$" zeilen={["x \\to +\\infty: f(x) \\to 0; \\quad x \\to -\\infty: f(x) \\to +\\infty", "\\text{Asymptote } y = 0"]} />
        <Teil marke="c)  $f(x) = x \cdot e^{-x}$" zeilen={["x \\to +\\infty: f(x) = \\frac{x}{e^{x}} \\to 0; \\quad x \\to -\\infty: f(x) \\to -\\infty", "\\text{Asymptote } y = 0"]} />
        <Teil marke="d)  $f(x) = x^{2} \cdot e^{x}$" zeilen={["x \\to +\\infty: f(x) \\to +\\infty; \\quad x \\to -\\infty: f(x) \\to 0", "\\text{Asymptote } y = 0"]} />
        <Teil marke="e)  $f(x) = 10^{6} - e^{x}$" zeilen={["x \\to +\\infty: f(x) \\to -\\infty; \\quad x \\to -\\infty: f(x) \\to 10^{6}", "\\text{Asymptote } y = 10^{6}"]} />
        <Teil marke="f)  $f(x) = x^{2024} \cdot e^{x}$" text="Auch bei einer riesigen Potenz gewinnt die e-Funktion:" zeilen={["x \\to +\\infty: f(x) \\to +\\infty; \\quad x \\to -\\infty: f(x) \\to 0", "\\text{Asymptote } y = 0"]} />
        <Teil marke="g)  $f(x) = \frac{e^{x}}{x^{2}}$" text="Hier ist $x = 0$ ausgeschlossen, also $D_f = \mathbb{R} \setminus \{0\}$, und es gibt zusätzlich eine Polstelle:" zeilen={[
          "x \\to +\\infty: f(x) \\to +\\infty; \\quad x \\to -\\infty: f(x) \\to 0",
          "x \\to 0: f(x) \\to +\\infty \\; \\text{(von beiden Seiten)}",
          "\\text{Asymptoten } y = 0 \\text{ und } x = 0",
        ]} />
        <Teil marke="h)  $f(x) = \frac{e^{x}}{x^{3}}$" text="Ebenfalls $D_f = \mathbb{R} \setminus \{0\}$, Polstelle mit Vorzeichenwechsel:" zeilen={[
          "x \\to +\\infty: f(x) \\to +\\infty; \\quad x \\to -\\infty: f(x) \\to 0",
          "x \\to 0^{-}: f(x) \\to -\\infty, \\quad x \\to 0^{+}: f(x) \\to +\\infty",
          "\\text{Asymptoten } y = 0 \\text{ und } x = 0",
        ]} />
      </BuchAufgabe>

      <BuchAufgabe nr="4" titel="Graphen aus eˣ erzeugen"
        aufgabe="Beschreibe, wie der Graph aus dem von $g(x) = e^{x}$ hervorgeht, gib Grenzverhalten, Monotonie und Wertemenge an und bestimme bei 2 und 4 die Tangente im Schnittpunkt mit der y-Achse.">
        <Teil marke="1)  $f(x) = e^{-x}$" text="Spiegelung an der y-Achse. Für $x \to +\infty$ gilt $f(x) \to 0$, für $x \to -\infty$ gilt $f(x) \to +\infty$. Streng monoton fallend, $W_f = ]0; +\infty[$." />
        <Teil marke="2)  $f(x) = -e^{x}$" text="Spiegelung an der x-Achse. Für $x \to +\infty$ gilt $f(x) \to -\infty$, für $x \to -\infty$ gilt $f(x) \to 0$. Streng monoton fallend, $W_f = ]-\infty; 0[$." />
        <Teil marke="3)  $f(x) = e^{x - 2}$" text="Verschiebung um 2 nach rechts – oder, wegen $e^{x-2} = e^{-2} \cdot e^{x}$, Stauchung in y-Richtung mit dem Faktor $e^{-2}$. Grenzverhalten wie $e^{x}$, streng monoton steigend, $W_f = ]0; +\infty[$." />
        <Teil marke="4)  $f(x) = \frac{1}{2}e^{x} - 1$" text="Stauchung in y-Richtung mit Faktor $\frac{1}{2}$, dann Verschiebung um 1 nach unten. Für $x \to -\infty$ gilt $f(x) \to -1$ (Asymptote $y = -1$), für $x \to +\infty$ gilt $f(x) \to +\infty$. Streng monoton steigend, $W_f = ]-1; +\infty[$." />
        <Teil marke="5)  $f(x) = 2 - e^{x + 3}$" text="Verschiebung um 3 nach links, Spiegelung an der x-Achse, Verschiebung um 2 nach oben. Für $x \to -\infty$ gilt $f(x) \to 2$, für $x \to +\infty$ gilt $f(x) \to -\infty$. Streng monoton fallend, $W_f = ]-\infty; 2[$." />
        <Teil marke="6)  $f(x) = -e^{-x + 1}$" text="Wegen $-x + 1 = -(x - 1)$: Spiegelung an der y-Achse, Verschiebung um 1 nach rechts, Spiegelung an der x-Achse. Für $x \to +\infty$ gilt $f(x) \to 0$, für $x \to -\infty$ gilt $f(x) \to -\infty$. Wegen $f′(x) = e^{-x+1} > 0$ streng monoton steigend, $W_f = ]-\infty; 0[$." />
        <Teil marke="c) Tangenten bei 2 und 4" zeilen={[
          "2: \\; f(0) = -1, \\; f′(x) = -e^{x}, \\; f′(0) = -1 \\; \\Rightarrow \\; t: y = -x - 1",
          "4: \\; f(0) = -\\frac{1}{2}, \\; f′(x) = \\frac{1}{2}e^{x}, \\; f′(0) = \\frac{1}{2} \\; \\Rightarrow \\; t: y = \\frac{1}{2}x - \\frac{1}{2}",
        ]} />
      </BuchAufgabe>

      <BuchAufgabe nr="5" titel="Verkaufszahlen von Tablets"
        aufgabe="Modell $f(t) = 0{,}1e^{t}$ für $0 \leq t \leq 5$ ($t$ in Wochen, $f(t)$ in 100 Stück).">
        <Teil marke="a)  Wann erstmals mehr als 1000 Tablets?" text="1000 Stück entsprechen $f(t) = 10$:" zeilen={[
          "0{,}1e^{t} > 10 \\; \\Leftrightarrow \\; e^{t} > 100 \\; \\Leftrightarrow \\; t > \\ln(100) \\approx 4{,}61",
        ]} />
        <Teil text="Der Wert 10 wird bei $t \approx 4{,}6$ überschritten, also in der fünften Woche nach Markteinführung. Grafisch: Schnittpunkt des Graphen mit der Geraden $y = 10$." />
        <Teil marke="b) 1  Durchschnittliche Zunahme in der 2. Woche" text="Die zweite Woche ist das Intervall $[1; 2]$, gesucht ist die Sekantensteigung:" zeilen={[
          "\\frac{f(2) - f(1)}{2 - 1} = 0{,}1(e^{2} - e) \\approx 0{,}467",
        ]} />
        <Teil text="Im Schnitt kommen in der zweiten Woche etwa 47 Tablets pro Woche hinzu – im Graphen die Steigung der Sekante durch $(1 \mid f(1))$ und $(2 \mid f(2))$." />
        <Teil marke="b) 2  $f′(4)$" zeilen={["f′(t) = 0{,}1e^{t}, \\quad f′(4) = 0{,}1e^{4} \\approx 5{,}46"]} />
        <Teil text="Zum Zeitpunkt $t = 4$ wachsen die Verkaufszahlen momentan um etwa 546 Tablets pro Woche – die Steigung der Tangente im Punkt $(4 \mid f(4))$." />
        <Teil marke="c) Langfristig?" text="Das Modell wächst unbegrenzt und immer schneller: schon $f(10) \approx 2203$, also rund 220 000 Tablets. Jeder Markt ist aber begrenzt, die Nachfrage sättigt sich. Für eine langfristige Beschreibung taugt das Modell nicht, sinnvoll ist es nur für die ersten Wochen." />
      </BuchAufgabe>

      <BuchAufgabe nr="6" titel="Die Schar a + b · eˣ"
        aufgabe="Bestimme $a$ und $b$ für $f_{a,b}(x) = a + b \cdot e^{x}$ so, dass die Bedingungen erfüllt sind. Merke: $f_{a,b}′(x) = f_{a,b}″(x) = b \cdot e^{x}$, die Asymptote ist $y = a$.">
        <Teil marke="a)  $P(0 \mid 3)$ liegt auf dem Graphen und $f′(0) = 2$" zeilen={["f′(0) = b = 2", "f(0) = a + b = 3 \\; \\Rightarrow \\; a = 1", "f_{1,2}(x) = 1 + 2e^{x}"]} />
        <Teil marke="b)  $W = ]-\infty; 0[$ und $f(1) = -e$" text="Damit die Werte von $-\infty$ bis knapp unter 0 reichen, muss $b < 0$ und die Asymptote $y = a = 0$ sein:" zeilen={["f(1) = b \\cdot e = -e \\; \\Rightarrow \\; b = -1", "f_{0,-1}(x) = -e^{x}"]} />
        <Teil marke="c)  Grenzwert 4 für $x \to -\infty$ und $f″(-1) = \frac{1}{e}$" zeilen={["\\lim_{x \\to -\\infty} f(x) = a = 4", "f″(-1) = b \\cdot e^{-1} = \\frac{1}{e} \\; \\Rightarrow \\; b = 1", "f_{4,1}(x) = 4 + e^{x}"]} />
        <Teil marke="d)  $W = ]e; +\infty[$ und $P(0 \mid 2e)$ auf dem Graphen" text="Untere Schranke $e$ heißt: $a = e$ und $b > 0$." zeilen={["f(0) = e + b = 2e \\; \\Rightarrow \\; b = e", "f_{e,e}(x) = e + e \\cdot e^{x} = e + e^{x + 1}"]} />
      </BuchAufgabe>

      <BuchAufgabe nr="7" titel="Die Graphen von x · eˣ und x / eˣ"
        aufgabe="Bestätige die Eigenschaften für $f(x) = x \cdot e^{x}$ und $g(x) = \frac{x}{e^{x}} = x \cdot e^{-x}$ rechnerisch.">
        <Teil marke="a) Genau eine Nullstelle" text="Ein Produkt ist null, wenn ein Faktor null ist. Da $e^{x} > 0$ und $e^{-x} > 0$ für alle $x$, bleibt nur $x = 0$ – bei beiden Funktionen." />
        <Teil marke="b) Gleiches Vorzeichen" text="Beide Funktionen sind $x$ mal einer positiven Zahl. Sie haben also an jeder Stelle das Vorzeichen von $x$." />
        <Teil marke="c) Punktsymmetrie zueinander" zeilen={["g(-x) = -x \\cdot e^{x} = -f(x)"]} />
        <Teil text="Zu jedem Punkt $(x \mid f(x))$ auf $G_f$ liegt also $(-x \mid -f(x))$ auf $G_g$: Die Graphen liegen punktsymmetrisch zum Ursprung." />
        <Teil marke="d) Die x-Achse ist Asymptote" zeilen={["x \\to -\\infty: \\; x \\cdot e^{x} \\to 0 \\quad (e \\text{ gewinnt})", "x \\to +\\infty: \\; \\frac{x}{e^{x}} \\to 0 \\quad (e \\text{ gewinnt})"]} />
        <Teil marke="e) Hochpunkt und Tiefpunkt" zeilen={[
          "f′(x) = e^{x} + x \\cdot e^{x} = (1 + x)e^{x} = 0 \\; \\Rightarrow \\; x = -1",
          "f″(x) = (2 + x)e^{x}, \\quad f″(-1) = \\frac{1}{e} > 0 \\; \\Rightarrow \\; T(-1 \\mid -\\frac{1}{e})",
          "g′(x) = e^{-x} - x \\cdot e^{-x} = (1 - x)e^{-x} = 0 \\; \\Rightarrow \\; x = 1",
          "g″(x) = (x - 2)e^{-x}, \\quad g″(1) = -\\frac{1}{e} < 0 \\; \\Rightarrow \\; H(1 \\mid \\frac{1}{e})",
        ]} />
        <Teil text="Auch das passt zur Punktsymmetrie: Der Tiefpunkt von $f$ wird am Ursprung auf den Hochpunkt von $g$ gespiegelt." />
      </BuchAufgabe>

      <BuchAufgabe nr="8" titel="Die Kurve im Straßenverlauf"
        aufgabe="Gerade $g(x) = \frac{1}{2}x + \frac{2}{3}$ für $x \leq -3$, danach die Kurve $k(x) = a \cdot x + b \cdot e^{x}$ für $-3 < x \leq 1$.">
        <Teil marke="a) Nahtlos und ohne Knick" text="Nahtlos heißt gleicher Funktionswert, ohne Knick heißt gleiche Steigung bei $x = -3$:" zeilen={[
          "g(-3) = -\\frac{3}{2} + \\frac{2}{3} = -\\frac{5}{6}, \\quad g′(-3) = \\frac{1}{2}",
          "\\text{I}: \\; k(-3) = -3a + b \\cdot e^{-3} = -\\frac{5}{6}",
          "\\text{II}: \\; k′(-3) = a + b \\cdot e^{-3} = \\frac{1}{2}",
          "\\text{II} - \\text{I}: \\; 4a = \\frac{4}{3} \\; \\Rightarrow \\; a = \\frac{1}{3}",
          "b \\cdot e^{-3} = \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6} \\; \\Rightarrow \\; b = \\frac{e^{3}}{6} \\approx 3{,}35",
          "k(x) = \\frac{1}{3}x + \\frac{e^{3}}{6}e^{x} = \\frac{1}{3}x + \\frac{1}{6}e^{x + 3}",
        ]} />
        <Teil marke="b)  Schnittwinkel mit der Bahnlinie (y-Achse)" zeilen={[
          "k′(x) = \\frac{1}{3} + \\frac{1}{6}e^{x + 3}, \\quad k′(0) = \\frac{1}{3} + \\frac{e^{3}}{6} \\approx 3{,}681",
          "\\tan(\\alpha) = 3{,}681 \\; \\Rightarrow \\; \\alpha \\approx 74{,}8° \\quad \\text{(gegen die x-Achse)}",
          "\\varphi = 90° - 74{,}8° \\approx 15{,}2° \\quad \\text{(gegen die y-Achse)}",
        ]} />
        <Teil marke="c) Linkskurve" zeilen={["k″(x) = \\frac{1}{6}e^{x + 3} > 0 \\quad \\text{für alle } x"]} />
        <Teil text="Der Graph ist auf dem ganzen Abschnitt linksgekrümmt. Wer in Richtung zunehmender x-Werte fährt, lenkt also nach links." />
        <Teil marke="d)  Gerade ab $x = 1$" text="Die Straße läuft ohne Knick in der Tangente bei $x = 1$ weiter:" zeilen={[
          "k(1) = \\frac{1}{3} + \\frac{e^{4}}{6}, \\quad k′(1) = \\frac{1}{3} + \\frac{e^{4}}{6} \\approx 9{,}43",
          "h(x) = k′(1) \\cdot (x - 1) + k(1) = (\\frac{1}{3} + \\frac{e^{4}}{6})x \\approx 9{,}43x",
        ]} />
        <Teil text="Schön: Weil $k(1) = k′(1)$ ist, geht die Gerade für $x > 1$ genau durch den Ursprung." />
      </BuchAufgabe>

      <BuchAufgabe nr="9" titel="Das Hügelprofil"
        aufgabe="Profil $f(x) = \frac{1}{2}x - \frac{1}{2}e^{x} + 5$ für $-8 \leq x \leq 2{,}5$.">
        <Teil marke="a) Höchster Punkt" zeilen={[
          "f′(x) = \\frac{1}{2} - \\frac{1}{2}e^{x} = 0 \\; \\Leftrightarrow \\; e^{x} = 1 \\; \\Leftrightarrow \\; x = 0",
          "f″(x) = -\\frac{1}{2}e^{x} < 0 \\; \\Rightarrow \\; H(0 \\mid 4{,}5)",
        ]} />
        <Teil marke="b)  $f(-8) \approx 1$ und die Nullstelle" zeilen={["f(-8) = -4 - \\frac{1}{2}e^{-8} + 5 = 1 - \\frac{1}{2}e^{-8} \\approx 1 - 0{,}0002 \\approx 1"]} />
        <Teil text="Für stark negative $x$ ist $e^{x}$ verschwindend klein, dort gilt $f(x) \approx \frac{1}{2}x + 5$. Diese Gerade hat die Nullstelle $x = -10$, und tatsächlich liegt die linke Nullstelle von $f$ bei $x \approx -10{,}0$ (außerhalb des Modellbereichs). Rechts vom Hochpunkt fällt $f$ steil ab: Probieren liefert $f(2{,}5) \approx 0{,}16$ und $f(2{,}53) \approx -0{,}01$, also die Nullstelle $x \approx 2{,}53$ – genau dort endet in c) der Tunnel." />
        <Teil marke="c) 1  Steigung des Tunnels" text="Der Tunnel verbindet die Punkte $(-8 \mid f(-8))$ und $(2{,}53 \mid f(2{,}53))$:" zeilen={[
          "m = \\frac{f(2{,}53) - f(-8)}{2{,}53 - (-8)} \\approx \\frac{-0{,}01 - 1}{10{,}53} \\approx -0{,}096",
        ]} />
        <Teil text="Die Straße fällt durch den Tunnel mit einem Gefälle von knapp 10 %." />
        <Teil marke="c) 2  Der tiefste Punkt unter dem Hügel" text="Gesucht ist die Stelle, an der der senkrechte Abstand $d(x) = f(x) - t(x)$ zwischen Hügel und Tunnelgerade $t$ maximal ist:" zeilen={[
          "d′(x) = f′(x) - m = 0 \\; \\Leftrightarrow \\; \\frac{1}{2} - \\frac{1}{2}e^{x} = m",
          "e^{x} = 1 - 2m \\approx 1{,}192 \\; \\Rightarrow \\; x \\approx 0{,}18",
        ]} />
        <Teil text="An dieser Stelle hat der Hügel dieselbe Steigung wie der Tunnel. Die y-Koordinate liefert die Tunnelgerade: $t(0{,}18) \approx 0{,}21$, der Punkt liegt bei etwa $(0{,}18 \mid 0{,}21)$, rund $4{,}3$ Einheiten unter der Hügeloberfläche." />
      </BuchAufgabe>

      <BuchAufgabe nr="10" titel="Die Subtangente"
        aufgabe="Tangente an $G_f$ mit $f(x) = e^{x}$ in $P(p \mid e^{p})$. Zwischen ihrer Nullstelle und dem Fußpunkt von $P$ liegt die Subtangente $s$.">
        <Teil zeilen={[
          "t_P: \\; y = f′(p)(x - p) + f(p) = e^{p}(x - p) + e^{p}",
          "y = 0: \\; e^{p}(x - p + 1) = 0 \\; \\Rightarrow \\; x = p - 1",
          "s = p - (p - 1) = 1",
        ]} />
        <Teil text="Beobachtung in b): Wie man $P$ auch verschiebt, die Subtangente bleibt 1 lang. Der Grund ist $f′(p) = f(p)$ – Steigung und Höhe sind gleich, also braucht die Tangente genau eine Einheit nach links, um auf 0 zu fallen. Im Tab Subtangente oben kannst du das ausprobieren." />
      </BuchAufgabe>
    </div>
  );
}

/* ---------- Die Seite ---------- */

const E_TABELLE = [1, 10, 100, 1000, 10000, 1000000];

export function EFunktionSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Welche Exponentialfunktion ist ihre eigene Ableitung?
      </h2>

      <ErklaerVideo id={EFUNKTION_VIDEO_ID} titel="Die e-Funktion — Einführung" />

      <div style={{ marginTop: 20 }}>
        <Text s="Exponentialfunktionen $f(x) = a^{x}$ beschreiben Wachstum, bei dem in gleichen Zeitspannen immer derselbe Faktor
          dazukommt. Unter all diesen Funktionen gibt es genau eine, die mit ihrer eigenen Ableitung übereinstimmt: die natürliche
          Exponentialfunktion. In sechs Schritten siehst du, woher sie kommt, was sie kann und wie man mit ihr rechnet." style={FLIESS} />

        <Schritt nr="1" titel="Die Ableitung von f(x) = aˣ" />
        <Text s="Wir setzen $f(x) = a^{x}$ mit $a > 0$ in den Differenzenquotienten ein und klammern $a^{x}$ aus:" style={FLIESS} />
        <Formeln zeilen={[
          "\\frac{f(x+h) - f(x)}{h} = \\frac{a^{x+h} - a^{x}}{h} = \\frac{a^{x} \\cdot a^{h} - a^{x}}{h}",
          "= a^{x} \\cdot \\frac{a^{h} - 1}{h} = f(x) \\cdot \\frac{f(0+h) - f(0)}{h}",
        ]} />
        <Text s="Der zweite Faktor ist der Differenzenquotient an der Stelle 0. Für $h \to 0$ wird er zur Steigung $f′(0)$:" style={FLIESS} />
        <Kasten titel="Ableitung einer Exponentialfunktion">
          <Formeln zeilen={["f′(x) = f(x) \\cdot f′(0)"]} max={19} />
        </Kasten>
        <Text s="Jede Exponentialfunktion ist abgeleitet also ein Vielfaches von sich selbst. Der Faktor ist die Steigung des Graphen im
          Punkt $P(0 \mid 1)$, durch den alle diese Graphen gehen." style={FLIESS} />

        <Schritt nr="2" titel="Die Eulersche Zahl e" />
        <Text s="Am einfachsten wird es, wenn der Faktor genau 1 ist. Wir suchen die Basis $a$ mit" style={FLIESS} />
        <Formeln zeilen={["f′(0) = \\lim_{h \\to 0} \\frac{a^{h} - 1}{h} = 1"]} />
        <Text s="Für kleine $h$ gilt dann $\frac{a^{h} - 1}{h} \approx 1$, also $a^{h} \approx 1 + h$ und damit $a \approx (1 + h)^{\frac{1}{h}}$.
          Setzt man $h = \frac{1}{n}$, wird daraus ein Grenzwert für $n \to \infty$:" style={FLIESS} />
        <Formeln zeilen={["e = \\lim_{n \\to \\infty} (1 + \\frac{1}{n})^{n} = 2{,}71828…"]} />
        <div style={{ background: C.weiss, borderRadius: 14, padding: "10px 16px", margin: "4px 0 18px", boxShadow: "0 2px 12px rgba(15,26,51,0.05)" }}>
          <div className="flex" style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, padding: "4px 0 6px", borderBottom: `1px solid ${C.linie}` }}>
            <span style={{ flex: 1 }}>n</span><span style={{ flex: 1.4, textAlign: "right" }}><M t="(1 + \frac{1}{n})^{n}" /></span>
          </div>
          {E_TABELLE.map((n) => (
            <div key={n} className="flex" style={{ fontSize: 14.5, padding: "6px 0", borderBottom: n === 1000000 ? "none" : `1px solid ${C.linie}`, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ flex: 1 }}>{n.toLocaleString("de-DE")}</span>
              <span style={{ flex: 1.4, textAlign: "right", color: C.see, fontWeight: 600 }}>{komma((1 + 1 / n) ** n, 7)}</span>
            </div>
          ))}
        </div>
        <Text s="Die Zahl $e$ ist irrational und nach Leonhard Euler (1707–1783) benannt. Mit ihr als Basis wird $f′(0) = 1$, also $f′(x) = f(x)$." style={FLIESS} />
        <Kasten titel="Natürliche Exponentialfunktion">
          <Formeln zeilen={["f(x) = e^{x}, \\; D_f = \\mathbb{R}", "(e^{x})′ = e^{x} \\quad \\text{für alle } x \\in \\mathbb{R}"]} max={19} />
        </Kasten>

        <Schritt nr="3" titel="Eigenschaften des Graphen" />
        <Text s="Alles Wichtige folgt aus $e^{x} > 0$ und $(e^{x})′ = (e^{x})″ = e^{x}$:" style={FLIESS} />
        <Formeln zeilen={[
          "f(0) = e^{0} = 1 \\quad \\text{(y-Achsenabschnitt)}",
          "e^{x} > 0 \\; \\Rightarrow \\; \\text{keine Nullstelle}",
          "f′(x) > 0 \\; \\Rightarrow \\; \\text{streng monoton steigend}",
          "f″(x) > 0 \\; \\Rightarrow \\; \\text{linksgekrümmt}",
          "\\lim_{x \\to +\\infty} e^{x} = +\\infty, \\quad \\lim_{x \\to -\\infty} e^{x} = 0",
          "\\text{Asymptote } y = 0, \\quad W_f = ]0; +\\infty[",
        ]} />
        <Text s="Für $e^{x}$ gelten außerdem die Potenzgesetze, zum Beispiel $e^{a+b} = e^{a} \cdot e^{b}$ und $e^{-x} = \frac{1}{e^{x}}$." style={FLIESS} />

        <Schritt nr="4" titel="Merke: e gewinnt" />
        <Text s="Was passiert bei $\frac{x^{n}}{e^{x}}$ für $x \to +\infty$? Zähler und Nenner wachsen beide unbegrenzt – entscheidend ist,
          wer schneller wächst. Die e-Funktion wächst schneller als jede Potenz, deshalb läuft der Quotient gegen 0." style={FLIESS} />
        <Kasten titel="Wichtige Grenzwerte (n ∈ ℕ)">
          <Formeln zeilen={["\\lim_{x \\to +\\infty} \\frac{x^{n}}{e^{x}} = 0 \\quad \\text{und} \\quad \\lim_{x \\to -\\infty} x^{n} \\cdot e^{x} = 0"]} max={18} />
        </Kasten>
        <Text s="Der zweite Grenzwert folgt aus dem ersten mit $u = -x$: Für $x \to -\infty$ geht $u \to +\infty$, und" style={FLIESS} />
        <Formeln zeilen={["x^{n} \\cdot e^{x} = (-u)^{n} \\cdot e^{-u} = (-1)^{n} \\cdot \\frac{u^{n}}{e^{u}} \\to (-1)^{n} \\cdot 0 = 0"]} />

        <Schritt nr="5" titel="Graphen verschieben, spiegeln, strecken" />
        <Text s="Aus dem Graphen von $g(x) = e^{x}$ entstehen alle anderen durch die bekannten Abbildungen:" style={FLIESS} />
        <div style={{ background: C.weiss, borderRadius: 14, padding: "6px 16px", margin: "4px 0 18px", boxShadow: "0 2px 12px rgba(15,26,51,0.05)" }}>
          {[
            ["e^{x} + d", "um d in y-Richtung verschoben, Asymptote y = d"],
            ["e^{x + c}", "um c nach links verschoben"],
            ["a \\cdot e^{x}", "mit Faktor a in y-Richtung gestreckt"],
            ["-e^{x}", "an der x-Achse gespiegelt"],
            ["e^{-x}", "an der y-Achse gespiegelt"],
          ].map(([t, w], i) => (
            <div key={t} className="flex items-center" style={{ gap: 14, padding: "9px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
              <span style={{ flexShrink: 0, width: 72, fontSize: 16.5, color: C.see, fontWeight: 600 }}><M t={t} /></span>
              <span style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.5 }}>{w}</span>
            </div>
          ))}
        </div>
        <Text s="Bei der e-Funktion fallen zwei davon zusammen: Wegen $e^{4 + x} = e^{4} \cdot e^{x}$ ist die Verschiebung um 4 nach links
          dasselbe wie die Streckung mit dem Faktor $e^{4} \approx 54{,}6$ in y-Richtung." style={FLIESS} />

        <Schritt nr="6" titel="Ableiten und Stammfunktionen" />
        <Text s="Mit Faktor- und Summenregel leitet man e-Funktionen wie Polynome ab. Für verkettete und multiplizierte Terme kommen
          Ketten- und Produktregel dazu:" style={FLIESS} />
        <Formeln zeilen={[
          "(2e^{x})′ = 2e^{x} \\quad \\text{(Faktorregel)}",
          "(2x + e^{x})′ = 2 + e^{x} \\quad \\text{(Summenregel)}",
          "(e^{3x - 1})′ = 3e^{3x - 1} \\quad \\text{(Kettenregel)}",
          "(x \\cdot e^{x})′ = e^{x} + x \\cdot e^{x} = (1 + x)e^{x} \\quad \\text{(Produktregel)}",
        ]} max={15} />
        <Kasten titel="Für e-Funktionen">
          <Formeln zeilen={["(e^{mx + c})′ = m \\cdot e^{mx + c}", "F(x) = e^{x} + c \\quad \\text{(Stammfunktion)}"]} max={17} />
        </Kasten>
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "22px 0" }}>
        <VisEFunktion />
      </div>

      <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />

      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Jetzt selbst üben</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 14 }}>
        e-Funktionen ableiten, Asymptoten und Tangenten bestimmen
      </h3>
      <EFunktionTrainer />

      <div style={{ height: 1, background: C.linie, margin: "34px 0 26px" }} />

      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Buchaufgaben</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 10 }}>
        Die Aufgaben von Seite 22 und 23 – mit vollständigem Lösungsweg
      </h3>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Erst selbst auf Papier rechnen, dann den Lösungsweg aufklappen und Zeile für Zeile vergleichen.
      </p>
      <Buchaufgaben />

      {/* Mini-Button zur Masterclass – nur, solange die Masterclass erreichbar ist (angebot.js oder Passwort) */}
      {gehe && !ansichtGesperrt("masterclass", istFrei()) && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 34 }}>
          <button data-efunktion-masterclass onClick={() => gehe({ ansicht: "masterclass" })}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999,
              background: C.weiss, border: `1px solid ${C.linie}`, color: C.see, fontSize: 12.5, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer", boxShadow: "0 1px 6px rgba(15,26,51,0.05)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: C.flaggold, display: "inline-block" }} />
            Mathe Abi Masterclass
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
