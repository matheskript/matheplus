import React, { useState, useRef, useEffect } from "react";
import { C, POTENZREGEL_VIDEO_ID } from "./base1.jsx";
import { komma } from "./base3.jsx";
import { ErklaerVideo } from "./func1.jsx";
import { M, Text, alsFunktion, stimmtUeberein } from "./func3.jsx";
import { TermTastatur } from "./func4.jsx";
import { DiffqStufenknopf, merken } from "./func5.jsx";
import { plotAbbildung, Achsen, Schieber } from "./func6.jsx";

/* ---------- Themenseite Potenzregel ----------
   Aufbau nach dem Muster der Differenzenquotient-Seite:
   Leitfrage · Video · Herleitung (x′ = 1 → Produktregel → Induktion) · Visualisierung · Übung */

const FLIESS = { color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 };

/* Mehrere Formelzeilen, linksbündig, gemeinsam so verkleinert, dass die längste Zeile passt */
function Formeln({ titel, zeilen, max = 17, min = 10.5, farbe = C.tinte }) {
  const rahmen = useRef(null), innen = useRef(null);
  const [gr, setGr] = useState(max);
  useEffect(() => {
    const anpassen = () => {
      if (!rahmen.current || !innen.current) return;
      const breite = innen.current.scrollWidth * (max / parseFloat(getComputedStyle(innen.current).fontSize));
      setGr(Math.max(min, Math.min(max, Math.floor((max * (rahmen.current.clientWidth - 4) / breite) * 10) / 10)));
    };
    anpassen();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(anpassen) : null;
    if (ro && rahmen.current) ro.observe(rahmen.current);
    return () => { if (ro) ro.disconnect(); };
  });
  return (
    <div style={{ margin: "14px 0 18px" }}>
      {titel && <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8, letterSpacing: "0.01em" }}>{titel}</p>}
      <div ref={rahmen} style={{ overflowX: "auto", overflowY: "hidden" }}>
        <div ref={innen} style={{ width: "max-content", fontSize: gr, color: farbe, paddingLeft: 4 }}>
          {zeilen.map((z, i) => (
            <div key={i} style={{ lineHeight: 2.2, whiteSpace: "nowrap" }}><M t={z} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Schritt({ nr, titel }) {
  return (
    <div className="flex items-center" style={{ gap: 12, margin: "30px 0 12px" }}>
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
        color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>{nr}</span>
      <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte }}>{titel}</h3>
    </div>
  );
}

function Kasten({ titel, children }) {
  return (
    <div style={{ background: C.weiss, borderLeft: `4px solid ${C.flaggold}`, borderRadius: 12, padding: "12px 16px 4px", margin: "6px 0 18px",
      boxShadow: "0 2px 12px rgba(15,26,51,0.05)" }}>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: "#A67C00", letterSpacing: "0.02em", textTransform: "uppercase" }}>{titel}</p>
      {children}
    </div>
  );
}

/* x^k als TeX, mit x^0 = 1 und x^1 = x */
const xp = (k) => (k === 0 ? "1" : k === 1 ? "x" : `x^{${k}}`);

/* Konkreter Induktionsschritt von n−1 nach n */
function schrittZeilen(n) {
  if (n === 1) return ["(x)′ = \\lim_{h \\to 0} \\frac{(x+h) - x}{h} = 1 = 1 \\cdot x^{0}"];
  const a = n - 1;
  const t1 = n === 2 ? `1 \\cdot x` : `${a} \\cdot ${xp(n - 2)} \\cdot x`;
  return [
    `(${xp(n)})′ = (${xp(n - 1)} \\cdot x)′ = (${xp(n - 1)})′ \\cdot x + ${xp(n - 1)} \\cdot (x)′`,
    `= ${t1} + ${xp(n - 1)} \\cdot 1`,
    `= ${a === 1 ? "" : a}${xp(n - 1)} + ${xp(n - 1)} = ${n}${xp(n - 1) === "1" ? "" : xp(n - 1)}`,
  ];
}

/* ---------- Visualisierung: Graph von xⁿ mit Tangente und Dominokette der Induktion ---------- */

function VisPotenz() {
  const [n, setN] = useState(3);
  const [x0, setX0] = useState(0.8);
  const f = (x) => x ** n;
  const m = n * x0 ** (n - 1);
  const xmin = -1.8, xmax = 1.8, ymin = -3, ymax = 3;
  const p = plotAbbildung(xmin, xmax, ymin, ymax);
  const y0 = f(x0);
  const knopf = (zeichen, delta) => (
    <button onClick={() => setN((v) => Math.max(1, Math.min(9, v + delta)))} aria-label={delta > 0 ? "n erhöhen" : "n verringern"}
      style={{ width: 30, height: 24, borderRadius: 8, border: "none", background: delta > 0 ? C.see : C.seeTief, color: C.weiss,
        fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1 }}>{zeichen}</button>
  );
  return (
    <div>
      <div className="flex items-center" style={{ gap: 14, marginBottom: 8 }}>
        <div className="flex flex-col" style={{ gap: 4 }}>{knopf("+", 1)}{knopf("−", -1)}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.tinte }}>
          f(x) = <M t={xp(n)} />
        </div>
        <div style={{ marginLeft: "auto", fontSize: 13, color: C.grau, fontWeight: 300, textAlign: "right" }}>
          Exponent<br /><span style={{ fontSize: 18, fontWeight: 700, color: C.see }}>n = {n}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${p.B} ${p.H}`} style={{ width: "100%", display: "block" }}>
        <defs><clipPath id="vpot"><rect width={p.B} height={p.H} /></clipPath></defs>
        <Achsen p={p} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} />
        <g clipPath="url(#vpot)">
          <path d={`M ${p.px(xmin)} ${p.py(m * (xmin - x0) + y0)} L ${p.px(xmax)} ${p.py(m * (xmax - x0) + y0)}`}
            stroke={C.gruenDunkel} strokeWidth="2" fill="none" />
          <path d={p.kurve(f)} stroke={C.see} strokeWidth="2.6" fill="none" />
          <circle cx={p.px(x0)} cy={p.py(y0)} r="5.5" fill={C.flaggold} stroke={C.tinte} strokeWidth="1.2" />
        </g>
      </svg>
      <Schieber name="x_0" wert={x0} min={-1.5} max={1.5} schritt={0.05} setzen={setX0} anzeige={komma(x0)} />
      <p style={{ fontSize: 14.5, lineHeight: 2, marginTop: 8 }}>
        Tangentensteigung{" "}
        <M t={`f′(x_0) = ${n === 1 ? "1" : `${n} \\cdot ${x0 < 0 ? `(${komma(x0)})` : komma(x0)}${n - 1 === 1 ? "" : `^{${n - 1}}`}`} = ${komma(m, 3)}`} />
      </p>

      <div style={{ height: 1, background: C.linie, margin: "16px 0 14px" }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Die Dominokette der Induktion bis n = {n}</p>
      <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 12 }}>
        {Array.from({ length: 9 }, (_, i) => i + 1).map((k) => {
          const gefallen = k < n, aktuell = k === n;
          return (
            <button key={k} onClick={() => setN(k)} title={`n = ${k}`}
              style={{ width: 34, height: 52, borderRadius: 7, cursor: "pointer", fontFamily: "inherit", padding: 0,
                border: `1.5px solid ${aktuell ? C.flaggold : gefallen ? C.see : C.linie}`,
                background: aktuell ? `linear-gradient(180deg, #FFE58A 0%, ${C.flaggold} 100%)` : gefallen ? C.see : C.weiss,
                color: aktuell ? C.tinte : gefallen ? C.weiss : C.hellgrau, fontSize: 13, fontWeight: 700,
                transform: gefallen ? "rotate(-14deg)" : "none", transformOrigin: "bottom right", transition: "transform .25s, background .25s" }}>
              <M t={`x^{${k}}`} />
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 2 }}>
        {n === 1 ? "Induktionsanfang — der erste Stein fällt direkt mit dem Differenzenquotienten:" : `Induktionsschritt von n = ${n - 1} auf n = ${n} — der vorige Stein stößt diesen mit der Produktregel um:`}
      </p>
      <Formeln zeilen={schrittZeilen(n)} max={16} />
    </div>
  );
}

/* ---------- Übung: Aufgaben erzeugen ---------- */

const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const zzOhne0 = (a, b) => { let v = 0; while (v === 0) v = zz(a, b); return v; };
const verschiedeneExp = (anz, lo, hi) => {
  const s = new Set();
  while (s.size < anz) s.add(zz(lo, hi));
  return [...s].sort((x, y) => y - x);
};

/* Ein Glied a·x^k als TeX, mit Vorzeichenbehandlung */
function gliedTex(a, k, erster) {
  const neg = a < 0, b = Math.abs(a);
  const koeff = k === 0 ? String(b) : b === 1 ? "" : String(b);
  const kern = k === 0 ? koeff : `${koeff}${xp(k)}`;
  if (erster) return (neg ? "-" : "") + kern;
  return (neg ? " - " : " + ") + kern;
}
function polyTex(glieder) {
  const g = glieder.filter((t) => t.a !== 0);
  if (!g.length) return "0";
  return g.map((t, i) => gliedTex(t.a, t.k, i === 0)).join("");
}
const polyFun = (glieder) => (x) => glieder.reduce((s, t) => s + t.a * x ** t.k, 0);
const ableitGlieder = (glieder) => glieder.filter((t) => t.k > 0).map((t) => ({ a: t.a * t.k, k: t.k - 1 }));

function potenzAufgabe(stufe) {
  let glieder;
  if (stufe === 1) glieder = [{ a: 1, k: zz(2, 9) }];
  else if (stufe === 2) glieder = [{ a: zzOhne0(-9, 9), k: zz(2, 9) }];
  else if (stufe === 3) glieder = verschiedeneExp(2, 1, 8).map((k) => ({ a: zzOhne0(-9, 9), k }));
  else if (stufe === 4) glieder = [...verschiedeneExp(2, 2, 9).map((k) => ({ a: zzOhne0(-9, 9), k })), { a: zzOhne0(-9, 9), k: 1 }, { a: zzOhne0(-12, 12), k: 0 }];
  else glieder = [...verschiedeneExp(3, 2, 15).map((k) => ({ a: zzOhne0(-12, 12), k })), { a: zzOhne0(-9, 9), k: 1 }, { a: zzOhne0(-20, 20), k: 0 }];
  if (stufe === 2 && Math.abs(glieder[0].a) === 1) glieder[0].a = glieder[0].a * zz(2, 9);
  return { art: "potenz", glieder, tex: polyTex(glieder), f: polyFun(glieder), abl: polyFun(ableitGlieder(glieder)) };
}

function produktAufgabe(stufe) {
  const m = zz(1, stufe >= 4 ? 7 : 5), k = zz(1, stufe >= 4 ? 7 : 5);
  const a = stufe <= 2 ? 1 : zzOhne0(-6, 6), b = stufe <= 3 ? (stufe <= 2 ? 1 : zz(2, 5)) : zzOhne0(-6, 6);
  const uTex = gliedTex(a, m, true), vTex = gliedTex(b, k, true);
  const tex = `${uTex} \\cdot ${vTex.startsWith("-") ? `(${vTex})` : vTex}`;
  const glieder = [{ a: a * b, k: m + k }];
  return { art: "produkt", a, b, m, k, uTex, vTex, tex, f: polyFun(glieder), abl: polyFun(ableitGlieder(glieder)) };
}

/* Vollständiger Rechenweg als Formelzeilen */
function rechenweg(auf) {
  if (auf.art === "potenz") {
    const zeilen = [];
    const aktiv = auf.glieder.filter((t) => t.a !== 0);
    aktiv.forEach((t) => {
      const g = gliedTex(t.a, t.k, true);
      if (t.k === 0) zeilen.push(`(${g})′ = 0 \\quad (Konstante)`);
      else if (t.k === 1) zeilen.push(`(${g})′ = ${t.a} \\cdot 1 = ${t.a}`);
      else zeilen.push(`(${g})′ = ${t.a} \\cdot ${t.k} \\cdot ${xp(t.k - 1)} = ${gliedTex(t.a * t.k, t.k - 1, true)}`);
    });
    zeilen.push(`f′(x) = ${polyTex(ableitGlieder(auf.glieder))}`);
    return zeilen;
  }
  const { a, b, m, k, uTex, vTex } = auf;
  const uA = gliedTex(a * m, m - 1, true), vA = gliedTex(b * k, k - 1, true);
  const kl = (t) => (t.startsWith("-") ? `(${t})` : t);
  const e = m + k - 1;
  return [
    `u = ${uTex}, \\quad u′ = ${uA}`,
    `v = ${vTex}, \\quad v′ = ${vA}`,
    `f′ = u′ \\cdot v + u \\cdot v′`,
    `= ${kl(uA)} \\cdot ${kl(vTex)} + ${kl(uTex)} \\cdot ${kl(vA)}`,
    `= ${gliedTex(a * b * m, e, true)}${gliedTex(a * b * k, e, false)} = ${gliedTex(a * b * (m + k), e, true)}`,
  ];
}

export function PotenzregelTrainer() {
  const [modus, setModus] = useState("potenz");
  const [stufe, setStufe] = useState(2);
  const erzeugen = (mo, s) => (mo === "produkt" ? produktAufgabe(s) : potenzAufgabe(s));
  const [auf, setAuf] = useState(() => potenzAufgabe(2));
  const [eingabe, setEingabe] = useState("");
  const [stand, setStand] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [tippen, setTippen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const [start, setStart] = useState(() => Date.now());

  const neu = (mo = modus, s = stufe) => {
    setAuf(erzeugen(mo, s)); setEingabe(""); setStand(null); setZeigen(false); setStart(Date.now());
  };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(modus, v); };
  const modusSetzen = (mo) => { setModus(mo); neu(mo, stufe); };

  const pruefen = () => {
    const meins = alsFunktion(eingabe);
    const ok = !!meins && stimmtUeberein(meins, auf.abl, 1e-6);
    setStand(ok ? "ok" : meins ? "nein" : "unlesbar");
    setSerie((s) => ({ n: s.n + 1, ok: s.ok + (ok ? 1 : 0) }));
    try {
      merken({ bereich: "potenzregel", gruppe: modus, stufe, richtig: ok,
        sekunden: Math.max(1, Math.round((Date.now() - start) / 1000)), fehlerart: ok ? null : "ableitungsregel" });
    } catch (e) { /* Lernprotokoll ist optional */ }
  };

  const feldStil = {
    width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit",
    border: `1.5px solid ${stand === "ok" ? C.see : stand ? C.signal : C.linie}`, borderRadius: 12, outline: "none",
    background: stand === "ok" ? C.himmel : C.weiss, color: C.tinte, marginBottom: 8,
  };

  return (
    <div>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Wende die Potenzregel direkt an — oder leite ein Produkt zweier Potenzen mit der Produktregel ab und
        sieh, dass dasselbe herauskommt wie mit der Potenzregel. Genau das ist der Induktionsschritt.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {[["potenz", "Potenzregel"], ["produkt", "Über die Produktregel"]].map(([id, n]) => (
          <button key={id} onClick={() => modusSetzen(id)} className="px-4 py-2"
            style={{ background: modus === id ? C.see : C.weiss, color: modus === id ? C.weiss : C.grau,
              border: `1px solid ${modus === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            {n}
          </button>
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
        {auf.art === "produkt" && (
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: -8, marginBottom: 12 }}>
            Setze <M t={`u = ${auf.uTex}`} /> und <M t={`v = ${auf.vTex}`} /> und rechne mit <M t="(u \cdot v)′ = u′ \cdot v + u \cdot v′" />.
          </p>
        )}

        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Gib f′(x) ein:</p>
        {tippen ? (
          <input value={eingabe} onChange={(e) => { setEingabe(e.target.value); setStand(null); }} placeholder="f′(x)" style={feldStil} />
        ) : (
          <TermTastatur wert={eingabe} setWert={(w) => { setEingabe(w); setStand(null); }} />
        )}
        <button onClick={() => setTippen(!tippen)} className="mt-2"
          style={{ background: "none", border: "none", color: C.see, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
          {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
        </button>
        <div style={{ height: 12 }} />

        {stand === "ok" && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />
          </div>
        )}
        {(stand === "nein" || stand === "unlesbar") && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>
              {stand === "unlesbar"
                ? "Der Term lässt sich nicht lesen — prüfe Klammern und Exponenten."
                : auf.art === "produkt"
                  ? "Bestimme zuerst u′ und v′ mit der Potenzregel und setze dann in u′·v + u·v′ ein. Fasse am Ende zusammen."
                  : "Leite jedes Glied einzeln ab: Exponent nach vorne multiplizieren, Exponent um eins verringern. Konstanten fallen weg."}
            </p>
            {!zeigen && (
              <button onClick={() => setZeigen(true)} className="mt-3"
                style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Rechenweg zeigen
              </button>
            )}
            {zeigen && <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />}
          </div>
        )}
        {stand !== "ok" && (
          <button onClick={pruefen} disabled={!eingabe.trim()} className="px-6 py-3"
            style={{ background: eingabe.trim() ? C.see : C.hellgrau, color: C.weiss, border: "none",
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

/* ---------- Die Seite ---------- */

export function PotenzregelSeite() {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Warum gilt <span style={{ whiteSpace: "nowrap" }}><M t="(x^n)′ = n \cdot x^{n-1}" /></span>?
      </h2>

      <ErklaerVideo id={POTENZREGEL_VIDEO_ID} titel="Potenzregel — Beweis durch vollständige Induktion" />

      <div style={{ marginTop: 20 }}>
        <Text s="Mit dem Differenzenquotienten lässt sich jede Ableitung bestimmen — aber schon bei $x^7$ wird das
          Ausmultiplizieren von $(x+h)^7$ mühsam. Die Potenzregel erspart diese Arbeit. Wir beweisen sie in drei Schritten:
          erst die kleinste Potenz $x$, dann die Produktregel als Werkzeug, und schließlich mit vollständiger Induktion
          alle Potenzen auf einmal." style={FLIESS} />

        <Schritt nr="1" titel="Die Ableitung von f(x) = x" />
        <Text s="Für $f(x) = x$ ist der Differenzenquotient besonders freundlich — das $h$ kürzt sich sofort weg:" style={FLIESS} />
        <Formeln zeilen={[
          "\\frac{f(x+h) - f(x)}{h} = \\frac{(x+h) - x}{h} = \\frac{h}{h} = 1",
          "f′(x) = \\lim_{h \\to 0} 1 = 1",
        ]} />
        <Text s="Das passt zum Bild: Die Gerade $y = x$ hat überall die Steigung 1. Dieser kleine Baustein ist der
          Startpunkt für alles Weitere." style={FLIESS} />

        <Schritt nr="2" titel="Die Produktregel" />
        <Text s="Seien $u$ und $v$ an der Stelle $x$ differenzierbar und $f(x) = u(x) \cdot v(x)$. Wir setzen in den
          Differenzenquotienten ein:" style={FLIESS} />
        <Formeln zeilen={["\\frac{f(x+h) - f(x)}{h} = \\frac{u(x+h) \\cdot v(x+h) - u(x) \\cdot v(x)}{h}"]} />
        <Text s="Der Trick ist eine geschickte Null im Zähler: Wir ziehen $u(x) \cdot v(x+h)$ ab und addieren es sofort
          wieder. Danach lässt sich zweimal ausklammern:" style={FLIESS} />
        <Formeln titel="Zähler" zeilen={[
          "u(x+h) \\cdot v(x+h) - u(x) \\cdot v(x)",
          "= u(x+h) \\cdot v(x+h) - u(x) \\cdot v(x+h)",
          "\\quad + u(x) \\cdot v(x+h) - u(x) \\cdot v(x)",
          "= [u(x+h) - u(x)] \\cdot v(x+h) + u(x) \\cdot [v(x+h) - v(x)]",
        ]} />
        <Text s="Teilen wir jetzt durch $h$, zerfällt der Differenzenquotient in zwei Teile:" style={FLIESS} />
        <Formeln zeilen={[
          "\\frac{f(x+h) - f(x)}{h} = \\frac{u(x+h) - u(x)}{h} \\cdot v(x+h)",
          "\\qquad + u(x) \\cdot \\frac{v(x+h) - v(x)}{h}",
        ]} />
        <Text s="Für $h \to 0$ läuft der erste Bruch gegen $u′(x)$ und der zweite gegen $v′(x)$. Außerdem läuft $v(x+h)$
          gegen $v(x)$, denn $v$ ist als differenzierbare Funktion stetig: $v(x+h) - v(x) = h \cdot \frac{v(x+h) - v(x)}{h}$
          geht gegen $0 \cdot v′(x) = 0$. Damit folgt:" style={FLIESS} />
        <Kasten titel="Produktregel">
          <Formeln zeilen={["(u \\cdot v)′ = u′ \\cdot v + u \\cdot v′"]} max={19} />
        </Kasten>

        <Schritt nr="3" titel="Vollständige Induktion" />
        <Text s="Behauptung: Für jede natürliche Zahl $n \geq 1$ gilt $(x^n)′ = n \cdot x^{n-1}$." style={{ ...FLIESS, color: C.tinte, fontWeight: 500 }} />

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Induktionsanfang: n = 1</p>
        <Text s="Aus Schritt 1 wissen wir $(x^1)′ = 1 = 1 \cdot x^0$. Die Behauptung stimmt also für $n = 1$." style={FLIESS} />

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Induktionsvoraussetzung</p>
        <Text s="Für ein festes $n \geq 1$ gelte $(x^n)′ = n \cdot x^{n-1}$." style={FLIESS} />

        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 4 }}>Induktionsschritt: n → n + 1</p>
        <Text s="Wir schreiben $x^{n+1} = x^n \cdot x$ und wenden die Produktregel mit $u = x^n$ und $v = x$ an.
          Für $u′$ benutzen wir die Voraussetzung, für $v′$ Schritt 1:" style={FLIESS} />
        <Formeln zeilen={[
          "(x^{n+1})′ = (x^n \\cdot x)′ = (x^n)′ \\cdot x + x^n \\cdot (x)′",
          "= n \\cdot x^{n-1} \\cdot x + x^n \\cdot 1",
          "= n \\cdot x^n + x^n = (n+1) \\cdot x^n",
        ]} />
        <Text s="Das ist genau die Behauptung für $n + 1$. Wie bei einer Dominoreihe: Der erste Stein fällt (Schritt 1),
          und jeder Stein stößt den nächsten um (Produktregel). Also fallen alle — die Regel gilt für jedes $n$." style={FLIESS} />
        <Kasten titel="Potenzregel">
          <Formeln zeilen={["(x^n)′ = n \\cdot x^{n-1} \\quad (n \\in \\mathbb{N})"]} max={19} />
        </Kasten>
      </div>

      <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Ändere n, zieh an x₀ und sieh, wie jeder Stein den nächsten umstößt</p>
        <VisPotenz />
      </div>

      <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />

      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>Jetzt selbst üben</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 14 }}>
        Potenzen ableiten — direkt und über die Produktregel
      </h3>
      <PotenzregelTrainer />
    </div>
  );
}
