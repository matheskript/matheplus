/* ============================================================
   Analysis-Bereich: Integrale
   · Stammfunktion bilden (Potenzregel) – Bedienung wie im Ableitungstrainer
   · Spezielle Funktionen: sin, cos, eˣ, 1/x
   · Advanced: Kombinationen wie sin(x) + cos(x)
   · Bestimmtes Integral ∫ₐᵇ f(x) dx mit dem Hauptsatz (Pop-up beim ersten Öffnen)
   Eingabe beginnt mit F(x) =, „+ C“ hängt die App automatisch an.
   Geprüft wird F′ = f numerisch an vielen Stellen – jede gleichwertige
   Stammfunktion zählt. Formel-Engine und Tastenfeld aus func12, Vergleich
   aus func13 (Ableitungstrainer).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Tastenfeld, ableitung, alsTex, analysiere, hatBox, kompiliere, ohnePar, parse, wert } from "./func12.jsx";
import { STELLEN, vergleich } from "./func13.jsx";
import { IchHaengeFest, summanden } from "./funcHilfe.jsx";

const endlich = (y) => typeof y === "number" && isFinite(y);
const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (l) => l[Math.floor(Math.random() * l.length)];
const dez = (v, st = 3) => String(Math.round(v * 10 ** st) / 10 ** st).replace(".", ",").replace("-", "−");
const blau = `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`;
const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

/* „+ C“ am Ende darf der Schüler tippen – die App ergänzt es ohnehin, darum vor dem Prüfen entfernen */
/* Dezimalkomma als normales Zeichen an M übergeben (die Gruppen-Schreibweise {,} verrutscht im Flex-Satz) */
const tx = (n) => alsTex(n).replace(/\{,\}/g, ",");
const ohneC = (t) => String(t || "").replace(/\s*\+\s*[cC]\s*$/, "");
const lese = (t) => { const b = parse(ohneC(t)); return b && !hatBox(b) ? ohnePar(b) : null; };

/* Zahl als kleiner Bruch erkennen (Nenner ≤ 100) */
function alsBruch(v) {
  for (let n = 1; n <= 100; n++) { const z = Math.round(v * n); if (Math.abs(v * n - z) < 1e-9 * Math.max(1, Math.abs(v * n))) return { z, n }; }
  return null;
}
/* Wert schön als TeX: ganze Zahl, Bruch, Vielfaches von π oder gerundet */
function wertTex(v) {
  if (Math.abs(v) < 1e-12) return { tex: "0", exakt: true };
  const b = alsBruch(v);
  if (b) return { tex: b.n === 1 ? `${b.z}` : `${b.z < 0 ? "-" : ""}\\frac{${Math.abs(b.z)}}{${b.n}}`, exakt: true };
  const w = wert(v, true);
  if (w.includes("π")) return { tex: w.replace("−", "-"), exakt: true };
  return { tex: dez(v, 4).replace("−", "-"), exakt: false };
}

/* ---------- Pop-up ---------- */

function Dialog({ titel, onClose, children }) {
  const zu = useRef(null);
  useEffect(() => {
    const vorher = document.activeElement;
    zu.current?.focus();
    const taste = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", taste);
    return () => { window.removeEventListener("keydown", taste); try { vorher?.focus?.(); } catch (e) { /* egal */ } };
  }, []);
  return (
    <div role="presentation" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(10,20,45,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label={titel} onClick={(e) => e.stopPropagation()}
        style={{ background: C.weiss, borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "calc(100vh - 32px)", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: blau, color: C.weiss, padding: "18px 20px 16px", borderRadius: "20px 20px 0 0" }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", color: C.flaggold, marginBottom: 4 }}>ERKLÄRUNG</p>
          <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}>{titel}</h3>
        </div>
        <div style={{ padding: "16px 20px 20px" }}>
          {children}
          <button ref={zu} type="button" onClick={onClose}
            style={{ width: "100%", height: 48, marginTop: 16, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 15, fontWeight: 700, color: C.seeTief, background: C.flaggold }}>
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}

const Absatz = ({ children }) => <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.7, marginBottom: 10 }}>{children}</p>;

/* Integralzeichen mit Grenzen */
function IntZ({ a, b, gross }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1, verticalAlign: "middle" }}>
      <span style={{ fontSize: gross ? "2.1em" : "1.7em", fontWeight: 300, lineHeight: 1, transform: "translateY(-0.04em)" }}>∫</span>
      <span style={{ display: "inline-flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.62em", lineHeight: 1.05, alignSelf: "stretch", padding: "0.1em 0" }}>
        <span>{b}</span><span>{a}</span>
      </span>
    </span>
  );
}

function CErklaerung({ onClose }) {
  return (
    <Dialog titel="Was bedeutet das C – und warum ist es egal?" onClose={onClose}>
      <Absatz>Beim Ableiten fällt jede Konstante weg: (x³ + 5)′ = 3x² und (x³ − 2)′ = 3x². Darum hat f(x) = 3x² nicht nur eine
        Stammfunktion, sondern unendlich viele – sie unterscheiden sich nur um eine Konstante. Das <b style={{ color: C.tinte }}>C</b> steht für genau diese Konstante:</Absatz>
      <div style={{ background: C.sand, borderRadius: 12, padding: "10px 12px", fontSize: 18, textAlign: "center", marginBottom: 12 }}><M t="F(x) = x^{3} + C" /></div>
      <Absatz><b style={{ color: C.tinte }}>Beim Ableiten</b> ist C egal: (F(x) + C)′ = f(x) für jedes C.</Absatz>
      <Absatz><b style={{ color: C.tinte }}>Beim bestimmten Integral</b> hebt es sich weg: (F(b) + C) − (F(a) + C) = F(b) − F(a).</Absatz>
      <Absatz><b style={{ color: C.tinte }}>Bei einem Anfangswert</b> ist C dagegen wichtig: Soll der Graph von F durch einen bestimmten Punkt gehen,
        legt dieser Punkt C eindeutig fest.</Absatz>
    </Dialog>
  );
}

/* Illustration zum Hauptsatz: Fläche unter einer Kurve zwischen a und b */
function HauptsatzBild() {
  const W = 320, H = 170, X = (x) => 30 + x * 52, Y = (y) => 140 - y * 26;
  const f = (x) => 0.18 * (x - 1) ** 3 - 0.45 * (x - 1) ** 2 + 0.4 * x + 1.6;
  const a = 1.1, b = 4.4;
  let kurve = "", flaeche = `M${X(a)},${Y(0)}`;
  for (let i = 0; i <= 100; i++) { const x = 0.1 + (5.3 * i) / 100; kurve += `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`; }
  for (let i = 0; i <= 60; i++) { const x = a + ((b - a) * i) / 60; flaeche += `L${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`; }
  flaeche += `L${X(b)},${Y(0)}Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", marginBottom: 12 }} role="img" aria-label="Fläche unter dem Graphen von f zwischen a und b">
      <path d={flaeche} fill={C.flaggold} fillOpacity="0.35" />
      <line x1="16" y1={Y(0)} x2={W - 8} y2={Y(0)} stroke={C.grau} strokeWidth="1.2" />
      <line x1={X(0)} y1={H - 8} x2={X(0)} y2="8" stroke={C.grau} strokeWidth="1.2" />
      <path d={kurve} fill="none" stroke={C.see} strokeWidth="2.6" strokeLinecap="round" />
      <line x1={X(a)} y1={Y(0)} x2={X(a)} y2={Y(f(a))} stroke={C.goldWarm} strokeWidth="1.4" strokeDasharray="4 3" />
      <line x1={X(b)} y1={Y(0)} x2={X(b)} y2={Y(f(b))} stroke={C.goldWarm} strokeWidth="1.4" strokeDasharray="4 3" />
      <text x={X(a)} y={Y(0) + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.tinte}>a</text>
      <text x={X(b)} y={Y(0) + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.tinte}>b</text>
      <text x={X(5.3)} y={Y(f(5.3)) - 6} textAnchor="end" fontSize="13" fontWeight="700" fontStyle="italic" fill={C.see}>f</text>
      <text x={X(2.75)} y={Y(0.9)} textAnchor="middle" fontSize="15" fill={C.tinte}>∫</text>
    </svg>
  );
}

function HauptsatzDialog({ onClose }) {
  return (
    <Dialog titel="Hauptsatz der Differential- und Integralrechnung" onClose={onClose}>
      <HauptsatzBild />
      <div style={{ background: C.sand, borderRadius: 12, padding: "12px", fontSize: 20, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 12, color: C.tinte, fontWeight: 600 }}>
        <IntZ a="a" b="b" gross /><M t="f(x)\,dx = F(b) - F(a)" />
      </div>
      <Absatz>Ist <b style={{ color: C.tinte }}>f</b> auf dem Intervall [a; b] stetig und <b style={{ color: C.tinte }}>F</b> eine Stammfunktion von f (also F′ = f),
        dann erhältst du das bestimmte Integral, indem du die obere Grenze in F einsetzt und davon den Wert an der unteren Grenze abziehst.</Absatz>
      <Absatz>Welche Stammfunktion du nimmst, ist egal – das C hebt sich weg. Wichtig ist nur: F muss auf dem <b style={{ color: C.tinte }}>ganzen</b> Intervall
        eine Stammfunktion sein. Hat f dazwischen eine Definitionslücke (zum Beispiel 1/x bei x = 0), darfst du den Hauptsatz dort nicht anwenden.</Absatz>
      <Absatz>Das Integral ist eine Bilanz: Teile des Graphen unterhalb der x-Achse zählen negativ.</Absatz>
    </Dialog>
  );
}

/* ---------- Aufgaben ---------- */

function potenzAufgabe() {
  const anzahl = wahl([1, 2, 2, 3]);
  const exps = [4, 3, 2, 1, 0].sort(() => Math.random() - 0.5).slice(0, anzahl).sort((a, b) => b - a);
  let s = "";
  exps.forEach((n) => {
    const glatt = Math.random() < 0.75;
    let a = glatt ? (n + 1) * wahl([1, 2, 3, -1, -2]) : wahl([1, 2, 5, -1, -3]);
    const b = Math.abs(a), vz = a < 0 ? "-" : "+";
    const xt = n === 0 ? "" : n === 1 ? "x" : `x^${n}`;
    const zahl = b === 1 && n > 0 ? "" : String(b);
    s += s ? ` ${vz} ${zahl}${xt}` : `${a < 0 ? "-" : ""}${zahl}${xt}`;
  });
  return s;
}
const SPEZIELL = ["sin(x)", "cos(x)", "e^x", "1/x", "2sin(x)", "-3cos(x)", "5e^x", "4/x", "-sin(x)", "3cos(x)"];
const ADVANCED = ["sin(x) + cos(x)", "2x + cos(x)", "e^x - sin(x)", "3x^2 + 1/x", "cos(x) - 2e^x", "x^3 + sin(x)", "1/x + e^x",
  "4sin(x) - 2cos(x) + x", "6x^2 - cos(x) + 2/x", "e^x + 4x^3", "2/x - 3sin(x)"];
const ERZEUGER = {
  stamm: potenzAufgabe,
  speziell: () => wahl(SPEZIELL),
  advanced: () => wahl(ADVANCED),
};

/* Hinweis bei falscher Stammfunktion */
function diagnose(F, fBaum) {
  const g = kompiliere(ableitung(F)), f = kompiliere(fBaum), Fk = kompiliere(F);
  if (vergleich(Fk, kompiliere(ableitung(fBaum))).ok) return "Du hast f abgeleitet. Gesucht ist die Umkehrung: eine Funktion F, deren Ableitung f ist.";
  if (vergleich(Fk, f).ok) return "Das ist f selbst. Gesucht ist F mit F′ = f.";
  if (vergleich(g, (x) => -f(x)).ok) return "Fast! Das Vorzeichen stimmt nicht. Denk an (cos x)′ = −sin x: Die Stammfunktion von sin(x) ist −cos(x).";
  const werte = STELLEN.map((x) => ({ m: g(x), s: f(x) })).filter((w) => endlich(w.m) && endlich(w.s) && Math.abs(w.s) > 1e-9);
  if (werte.length >= 4) {
    const q = werte.map((w) => w.m / w.s);
    if (Math.max(...q) - Math.min(...q) < 1e-6) return `Die Form stimmt, aber dein F′ ist das ${dez(q[0], 2)}-Fache von f. Potenzregel: aus xⁿ wird xⁿ⁺¹/(n + 1).`;
  }
  const x0 = 1.29, mv = g(x0), sv = f(x0);
  if (endlich(mv) && endlich(sv)) return `Leite dein F zur Probe ab: Bei x = 1,29 liefert F′ den Wert ${dez(mv)}, f hat dort aber ${dez(sv)}.`;
  return "Leite dein F zur Probe ab und vergleiche mit f.";
}

/* ---------- Lernhilfe: Stammfunktion Baustein für Baustein ---------- */

const qq = (z, n) => { const g = (function ggt(a, b) { return b ? ggt(b, a % b) : Math.abs(a); })(z, n) || 1; const s = n < 0 ? -1 : 1; return { z: (s * z) / g, n: (s * n) / g }; };
/* Ein Summand → { q: Faktor, teil: TeX ohne Faktor, art } oder null */
function baustein(n) {
  if (!n) return null;
  if (n.k === "neg") { const b = baustein(n.a); return b && { ...b, q: qq(-b.q.z, b.q.n) }; }
  if (n.k === "num") return Number.isInteger(n.v) ? { q: qq(n.v, 1), teil: "x", art: "Konstante" } : null;
  if (n.k === "x") return { q: qq(1, 2), teil: "x^{2}", art: "Potenz" };
  if (n.k === "^" && n.a.k === "x" && n.b.k === "num" && Number.isInteger(n.b.v) && n.b.v !== -1) return { q: qq(1, n.b.v + 1), teil: `x^{${n.b.v + 1}}`, art: "Potenz" };
  if (n.k === "^" && n.a.k === "e" && n.b.k === "x") return { q: qq(1, 1), teil: "e^{x}", art: "eˣ" };
  if (n.k === "fn" && n.a.k === "x" && n.n === "sin") return { q: qq(-1, 1), teil: "\\cos(x)", art: "sin" };
  if (n.k === "fn" && n.a.k === "x" && n.n === "cos") return { q: qq(1, 1), teil: "\\sin(x)", art: "cos" };
  if (n.k === "/" && n.a.k === "num" && Number.isInteger(n.a.v) && n.b.k === "x") return { q: qq(n.a.v, 1), teil: "\\ln|x|", art: "1/x" };
  if (n.k === "*" && n.a.k === "num" && Number.isInteger(n.a.v)) { const b = baustein(n.b); return b && { ...b, q: qq(b.q.z * n.a.v, b.q.n) }; }
  return null;
}
const faktorTex = (q, erster) => {
  const vz = q.z < 0 ? "-" : erster ? "" : "+";
  const b = Math.abs(q.z);
  const zahl = q.n === 1 ? (b === 1 ? "" : `${b}`) : `\\frac{${b}}{${q.n}}`;
  return { vz, zahl };
};
function stammTex(fBaum) {
  const teile = summanden(fBaum).map(baustein);
  if (teile.some((t) => !t)) return null;
  return teile.map((t, i) => { const { vz, zahl } = faktorTex(t.q, i === 0); return `${i ? ` ${vz || "+"} ` : vz}${zahl}${t.teil}`; }).join("");
}
const REGEL_TEXT = {
  Potenz: "Potenzregel rückwärts: Exponent um 1 erhöhen und durch den neuen Exponenten teilen, $x^{n} \\to \\frac{1}{n+1} x^{n+1}$.",
  Konstante: "Eine Konstante c hat die Stammfunktion c·x.",
  sin: "$\\sin(x) \\to -\\cos(x)$ – denn $(-\\cos(x))′ = \\sin(x)$.",
  cos: "$\\cos(x) \\to \\sin(x)$.",
  "eˣ": "$e^{x} \\to e^{x}$ – die e-Funktion ist ihre eigene Stammfunktion.",
  "1/x": "$\\frac{1}{x} \\to \\ln|x|$ auf Intervallen ohne 0.",
};
function stammHilfe(fText, fBaum) {
  if (!fBaum) return null;
  const tex = tx(fBaum);
  const teile = summanden(fBaum);
  const b = teile.map(baustein);
  const arten = [...new Set(b.filter(Boolean).map((x) => x.art))];
  const erster = b[0];
  const ersterTex = tx(teile[0]);
  const schritt = erster
    ? (() => { const { vz, zahl } = faktorTex(erster.q, true); return `Beginne mit $${ersterTex}$: Eine Stammfunktion davon ist $${vz}${zahl}${erster.teil}$. Kontrolle: Ableiten ergibt wieder $${ersterTex}$.`; })()
    : `Beginne mit $${ersterTex}$ und überlege: Welche Funktion hat genau diese Ableitung?`;
  const fk = kompiliere(fBaum);
  const x0 = [1, 2, 0.5].find((x) => endlich(fk(x)));
  const loes = stammTex(fBaum);
  return {
    id: `stamm-${fText}`,
    aufgabe: `Stammfunktion ${tex} ${arten.includes("1/x") ? "ln Definitionsmenge" : ""}`,
    hilfen: {
      verstehen: [
        "Gesucht ist eine Funktion F, deren Ableitung f ist: F′ = f. Welche Funktion hat f als Ableitung?",
        "Aufleiten ist Ableiten rückwärts. Jede Idee kannst du kontrollieren, indem du sie ableitest.",
        "Das „+ C“ ergänzt die App. Du gibst nur F(x) ohne Konstante ein.",
      ],
      ansatz: [
        teile.length > 1 ? `f besteht aus ${teile.length} Summanden. Darfst du jeden einzeln aufleiten?` : "Welcher Grundbaustein steckt in f – eine Potenz von x, sin, cos, eˣ oder 1/x?",
        arten.map((a) => REGEL_TEXT[a]).filter(Boolean).join(" ") || "Konstante Faktoren bleiben beim Aufleiten stehen; Summen werden gliedweise aufgeleitet.",
        schritt,
      ],
      regel: [
        "Welche Ableitungen kennst du? Lies sie rückwärts: Aus (xⁿ)′ = n·xⁿ⁻¹ wird die Potenzregel fürs Aufleiten.",
        arten.map((a) => REGEL_TEXT[a]).filter(Boolean).join(" ") || "Faktor- und Summenregel gelten auch beim Aufleiten.",
        schritt,
      ],
      umformen: [
        "Lässt sich f vorher als Summe von Potenzen schreiben?",
        "$\\frac{1}{x^{2}} = x^{-2}$ – damit greift die Potenzregel. Nur $\\frac{1}{x} = x^{-1}$ ist der Sonderfall mit $\\ln|x|$.",
        "Ein konstanter Faktor bleibt beim Aufleiten einfach stehen: $\\int 5 \\cdot g(x) \\, dx = 5 \\int g(x) \\, dx$.",
      ],
      pruefen: [
        "Leite dein F ab. Kommt genau f heraus?",
        "Typische Fehler: Vorzeichen bei sin und cos, vergessenes Teilen durch n + 1, Faktor beim Ableiten statt beim Aufleiten.",
        x0 !== undefined ? `Probe an einer Stelle: f(${String(x0).replace(".", ",")}) = ${dez(fk(x0))}. Dein F′(${String(x0).replace(".", ",")}) muss genau diesen Wert haben.` : "Setz eine Zahl in F′ und f ein und vergleiche.",
      ],
    },
    regeln: [{ name: "Potenzregel rückwärts", bereich: "analysis" }, { name: "Stammfunktion", bereich: "analysis" },
      ...(arten.includes("sin") || arten.includes("cos") ? [{ name: "Sinus", bereich: "analysis" }, { name: "Kosinus", bereich: "analysis" }] : []),
      ...(arten.includes("eˣ") ? [{ name: "e-Funktion", bereich: "analysis" }] : []),
      ...(arten.includes("1/x") ? [{ name: "Natürlicher Logarithmus", bereich: "analysis" }] : [])],
    grundlage: /\\frac/.test(loes || "") ? { trainer: "bruchrechnen", name: "Brüche", grund: "Beim Aufleiten entstehen Brüche wie 1/(n + 1). Ein paar Runden Bruchrechnen helfen." } : null,
    loesung: loes ? `$F(x) = ${loes} + C$` : null,
  };
}

function integralHilfe(felder) {
  return {
    id: `int-${felder.f}-${felder.a}-${felder.b}`,
    aufgabe: `bestimmtes Integral Stammfunktion ${felder.f}`,
    hilfen: {
      verstehen: [
        "Gesucht ist eine Zahl: die Flächenbilanz von f zwischen a und b. Teile unterhalb der x-Achse zählen negativ.",
        "Der Hauptsatz macht daraus eine Rechnung mit einer Stammfunktion: $\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$.",
        "Du brauchst drei Dinge: eine Stammfunktion F, die obere Grenze b und die untere Grenze a.",
      ],
      ansatz: [
        "Was brauchst du zuerst – die Grenzen oder die Stammfunktion?",
        "Erst F bestimmen (F′ = f), dann oben einsetzen, unten einsetzen, subtrahieren.",
        "Trag f, dein F und die Grenzen ein. Für 3x² wäre F(x) = x³, für ∫ von 2 bis 3 also F(3) − F(2).",
      ],
      regel: [
        "Wie lautet der Hauptsatz der Differential- und Integralrechnung?",
        "$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$, wenn f auf [a; b] stetig ist und F′ = f gilt.",
        "Die Stammfunktionen der Bausteine findest du im Modus „Spezielle Funktionen“ oder unter „Passende Regel ansehen“.",
      ],
      umformen: [
        "Setzt du negative Grenzen ein, brauchst du Klammern: F(−2) bei F(x) = x³ ist (−2)³ = −8.",
        "Bei F(b) − F(a) steht vor F(a) ein Minus – bei einer Summe also die ganze Klammer abziehen.",
        "Rechne F(b) und F(a) zuerst einzeln aus und subtrahiere erst dann.",
      ],
      pruefen: [
        "Ist das Vorzeichen plausibel? Liegt der Graph zwischen a und b überwiegend oberhalb der x-Achse, ist das Integral positiv.",
        "Die App prüft beim Berechnen, ob F′ = f auf dem ganzen Intervall gilt und ob f dort stetig ist.",
        "Vertauschst du a und b, ändert sich nur das Vorzeichen des Ergebnisses.",
      ],
    },
    regeln: [{ name: "Hauptsatz", bereich: "analysis" }, { name: "Stammfunktion", bereich: "analysis" }, { name: "Potenzregel rückwärts", bereich: "analysis" }],
    grundlage: { trainer: "quadrate", name: "Potenzen", grund: "Beim Einsetzen der Grenzen rechnest du viele Potenzen – zum Beispiel 3³ − 2³." },
    loesung: null,
  };
}

/* ---------- Stammfunktion bilden (drei Varianten) ---------- */

function StammTrainer({ art, onC }) {
  const [fText, setFText] = useState(() => ERZEUGER[art]());
  const [eingabe, setEingabe] = useState("");
  const [pos, setPos] = useState(0);
  const [tippen, setTippen] = useState(false);
  const [status, setStatus] = useState(null);       // null | richtig | falsch | gezeigt
  const [hinweis, setHinweis] = useState("");
  const [versuche, setVersuche] = useState(0);
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });
  const fBaum = useMemo(() => lese(fText), [fText]);
  const mitLn = /\/\s*x|1\/x/.test(fText);

  const neu = () => { setFText(ERZEUGER[art]()); setEingabe(""); setPos(0); setStatus(null); setHinweis(""); setVersuche(0); };
  const pruefen = () => {
    const F = lese(eingabe);
    if (!F) { setStatus("falsch"); setHinweis("Der Term ist noch nicht vollständig – fülle alle Platzhalter ▯ und schließe die Klammern. Das „+ C“ musst du nicht eingeben."); return; }
    const Fk = kompiliere(F);
    if (STELLEN.filter((x) => endlich(Fk(x))).length < 3) { setStatus("falsch"); setHinweis("Dein F ist an fast keiner Stelle definiert – prüfe den Term."); return; }
    const ok = vergleich(kompiliere(ableitung(F)), kompiliere(fBaum)).ok;
    setBilanz((b) => ({ richtig: b.richtig + (ok ? 1 : 0), gesamt: b.gesamt + 1 }));
    if (ok) { setStatus("richtig"); setHinweis(""); }
    else { setStatus("falsch"); setHinweis(diagnose(F, fBaum)); setVersuche((v) => v + 1); }
  };
  const F = status === "richtig" ? lese(eingabe) : null;
  const rand = status === "richtig" ? C.smaragd : status === "falsch" ? C.signal : C.see;
  const eingabeBaum = eingabe ? parse(ohneC(eingabe)) : null;

  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel }}>Bilde eine Stammfunktion</p>
          <span style={{ fontSize: 12.5, color: C.grau }}>{bilanz.gesamt ? `${bilanz.richtig} von ${bilanz.gesamt} richtig` : ""}</span>
        </div>
        {status !== "richtig" && <IchHaengeFest kontext={stammHilfe(fText, fBaum)} />}
      </div>
      <div style={{ background: blau, borderRadius: 14, padding: "14px 16px", marginBottom: 14, overflowX: "auto" }}>
        <span style={{ color: C.weiss, fontSize: 22, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}>{fBaum && <M t={`f(x) = ${tx(fBaum)}`} />}</span>
      </div>

      <div style={{ border: `2px solid ${rand}`, borderRadius: 14, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, overflowX: "auto",
        background: status === "richtig" ? "#EEF8F2" : C.weiss }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>F(x) =</span>
        <span style={{ fontSize: 19, lineHeight: 1.9, whiteSpace: "nowrap" }}>
          {eingabe ? (eingabeBaum ? <M t={tx(eingabeBaum)} /> : <span style={{ color: C.signal, fontSize: 15 }}>{eingabe}</span>)
            : <span style={{ color: C.hellgrau, fontSize: 14, fontWeight: 300 }}>hier eingeben …</span>}
        </span>
        <span style={{ fontSize: 19, fontWeight: 700, color: C.goldWarm, whiteSpace: "nowrap" }} title="Die Konstante C ergänzt die App automatisch">+ C</span>
        {status === "richtig" && <span style={{ marginLeft: "auto", fontSize: 22, color: C.smaragd, fontWeight: 700 }}>✓</span>}
        {status === "falsch" && <span style={{ marginLeft: "auto", fontSize: 22, color: C.signal, fontWeight: 700 }}>✗</span>}
      </div>
      {hinweis && <p role="status" style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, margin: "0 4px 12px" }}>{hinweis}</p>}
      {status === "gezeigt" && (
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "0 4px 12px" }}>Prüfe dein F, indem du es ableitest – bei einer richtigen Stammfunktion kommt genau f heraus. Typische Regeln:
          xⁿ → xⁿ⁺¹/(n + 1), sin(x) → −cos(x), cos(x) → sin(x), eˣ → eˣ, 1/x → ln|x|.</p>
      )}

      <button type="button" onClick={onC}
        style={{ background: "none", border: "none", color: C.see, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: "4px 0", marginBottom: 10 }}>
        ⓘ Was bedeutet das C und warum ist es egal?
      </button>

      {status === "richtig" ? (
        <>
          <p style={{ fontSize: 15, color: C.smaragd, fontWeight: 700, marginBottom: 6 }}>Richtig – F′(x) = f(x).</p>
          {mitLn && <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 10 }}>Genau genommen gilt für 1/x: Stammfunktion ist ln|x| + C auf jedem Intervall, das 0 nicht enthält.
            Für x &gt; 0 ist das ln(x) + C, für x &lt; 0 entsprechend ln(−x) + C.</p>}
          {F && <Anfangswert F={F} mitLn={mitLn} key={fText + eingabe} />}
          <button type="button" onClick={neu}
            style={{ width: "100%", height: 50, marginTop: 12, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: C.weiss, background: blau }}>
            Neue Aufgabe
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button type="button" onClick={pruefen}
              style={{ flex: 2, height: 50, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 18, fontWeight: 800,
                color: C.weiss, background: C.smaragd, letterSpacing: "0.04em", boxShadow: "0 4px 14px rgba(47,143,91,0.35)" }}>OK</button>
            {versuche > 0 && (
              <button type="button" onClick={() => setStatus("gezeigt")}
                style={{ flex: 1, height: 50, borderRadius: 12, border: `1px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.see, background: C.weiss }}>
                Regeln zeigen
              </button>
            )}
          </div>
          {tippen ? (
            <input value={eingabe} onChange={(e) => { setEingabe(e.target.value); setStatus(null); setHinweis(""); }} onKeyDown={(e) => { if (e.key === "Enter") pruefen(); }}
              placeholder="z. B. x^3 - cos(x)" aria-label="Stammfunktion F(x)" autoCapitalize="off" autoCorrect="off" spellCheck="false"
              style={{ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 12, border: `1.5px solid ${C.linie}`, padding: "0 12px", fontSize: 16, fontFamily: "ui-monospace, Menlo, monospace" }} />
          ) : (
            <Tastenfeld wert={eingabe} setWert={(t) => { setEingabe(t); setStatus(null); setHinweis(""); }} pos={pos} setPos={setPos} />
          )}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={() => setTippen(!tippen)}
              style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
              {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
            </button>
            <button type="button" onClick={neu}
              style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>Neue Aufgabe</button>
          </div>
        </>
      )}
    </div>
  );
}

/* Zusatz nach einer richtigen Stammfunktion: Anfangswert legt C fest */
const zahlLesen = (s) => {
  const t = String(s).replace("−", "-").replace(",", ".").trim();
  const m = t.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[2]) === 0 ? null : Number(m[1]) / Number(m[2]);
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
};
function Anfangswert({ F, mitLn }) {
  const [aufg] = useState(() => ({ x0: mitLn ? 1 : 0, y0: zz(-3, 6) }));
  const [w, setW] = useState("");
  const [erg, setErg] = useState(null);
  const Fx0 = kompiliere(F)(aufg.x0);
  const bruch = endlich(Fx0) ? alsBruch(Fx0) : null;
  if (!bruch) return null;
  const C0 = aufg.y0 - Fx0;
  const pruefen = () => {
    const v = zahlLesen(w);
    if (v === null) return setErg({ ok: false, text: "Bitte eine Zahl eingeben (auch als Bruch wie 3/2)." });
    if (Math.abs(v - C0) < 1e-6) return setErg({ ok: true, text: `Richtig: F(${aufg.x0}) + C = ${String(aufg.y0).replace("-", "−")} ergibt C = ${wertTex(C0).tex.replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2").replace("-", "−")}.` });
    return setErg({ ok: false, text: `Setze x = ${aufg.x0} in dein F ein: F(${aufg.x0}) = ${dez(Fx0)}. Dann muss F(${aufg.x0}) + C = ${String(aufg.y0).replace("-", "−")} gelten.` });
  };
  return (
    <div style={{ background: C.sand, borderRadius: 12, padding: "12px 14px", marginTop: 4 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.gruenDunkel, marginBottom: 6 }}>ZUSATZ: ANFANGSWERT</p>
      <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.6, marginBottom: 8 }}>Welche Stammfunktion geht durch den Punkt P({aufg.x0} | {String(aufg.y0).replace("-", "−")})? Bestimme C.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>C =</span>
        <input value={w} aria-label="Wert von C" inputMode="text" onChange={(e) => { setW(e.target.value.slice(0, 8)); setErg(null); }} onKeyDown={(e) => { if (e.key === "Enter") pruefen(); }}
          style={{ width: 90, height: 40, textAlign: "center", fontSize: 16, fontWeight: 800, fontFamily: "inherit", color: C.see, border: `1.5px solid ${C.see}55`, borderRadius: 10, background: C.weiss, outline: "none" }} />
        <button type="button" onClick={pruefen}
          style={{ height: 40, padding: "0 16px", borderRadius: 999, border: "none", background: C.flaggold, color: C.seeTief, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Prüfen</button>
      </div>
      {erg && <p role="status" style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 8, color: erg.ok ? C.smaragd : C.signal, fontWeight: 500 }}>{erg.text}</p>}
    </div>
  );
}

/* ---------- Bestimmtes Integral ---------- */

/* x im Baum durch eine Zahl ersetzen (für die Einsetz-Zeile) */
function einsetzen(n, ersatz) {
  if (!n) return n;
  if (n.k === "x") return ersatz;
  const m = { ...n };
  if (n.a) m.a = einsetzen(n.a, ersatz);
  if (n.b) m.b = einsetzen(n.b, ersatz);
  if (m.k === "*") m.still = false;
  return m;
}
const grenzeLesen = (t) => {
  const b = parse(String(t || "").trim());
  if (!b || hatBox(b)) return null;
  const s = JSON.stringify(b);
  if (s.includes('"k":"x"')) return null;
  const v = kompiliere(ohnePar(b))(0);
  const baum = ohnePar(b);
  // Für das Einsetzen: einfache Zahlen/Konstanten direkt, alles andere in Klammern
  const einfach = (baum.k === "num" && baum.v >= 0) || baum.k === "pi" || baum.k === "e";
  return endlich(v) ? { v, tex: tx(baum), baum: einfach ? baum : { k: "par", a: baum } } : null;
};

function BestimmtesIntegral({ zeigeHauptsatz }) {
  const [felder, setFelder] = useState({ f: "", F: "", a: "", b: "" });
  const [aktiv, setAktiv] = useState("f");
  const [pos, setPos] = useState(0);
  const [tippen, setTippen] = useState(false);
  const [erg, setErg] = useState(null);
  const setze = (k, t) => { setFelder((x) => ({ ...x, [k]: t })); setErg(null); };
  const beispiel = () => { setFelder({ f: "3x^2", F: "x^3", a: "2", b: "3" }); setErg(null); setAktiv("f"); setPos(4); };

  const rechnen = () => {
    const f = lese(felder.f), F = lese(felder.F), a = grenzeLesen(felder.a), b = grenzeLesen(felder.b);
    if (!f) return setErg({ fehler: "Bitte f(x) vollständig eingeben." });
    if (!F) return setErg({ fehler: "Bitte eine Stammfunktion F(x) eingeben (ohne „+ C“)." });
    if (!a || !b) return setErg({ fehler: "Bitte beide Grenzen als Zahl eingeben (auch π oder Brüche wie 1/2 sind möglich)." });
    const lo = Math.min(a.v, b.v), hi = Math.max(a.v, b.v);
    const fk = kompiliere(f), Fk = kompiliere(F), dF = kompiliere(ableitung(F));
    // 1. f auf [a; b] definiert und stetig?
    if (hi > lo) {
      const proben = [];
      for (let i = 0; i <= 400; i++) proben.push(lo + ((hi - lo) * i) / 400);
      for (let g = Math.ceil(lo); g <= Math.floor(hi); g++) proben.push(g);
      const schlecht = proben.find((x) => !endlich(fk(x)));
      let pol = null;
      if (schlecht === undefined) {
        try { const A = analysiere(f, lo, hi); pol = [...A.pole, ...A.hebbar].find((p) => p.x >= lo - 1e-9 && p.x <= hi + 1e-9) || null; } catch (e) { /* egal */ }
      }
      if (schlecht !== undefined || pol) {
        const stelle = pol ? pol.x : schlecht;
        return setErg({ fehler: `f ist auf dem Intervall [${dez(lo)}; ${dez(hi)}] nicht überall definiert bzw. nicht stetig (Problem bei x ≈ ${dez(stelle)}). Der Hauptsatz darf hier nicht angewendet werden – wähle Grenzen, zwischen denen f stetig ist.` });
      }
    }
    // 2. F′ = f auf [a; b]?
    const innen = [];
    for (let i = 0; i <= 16; i++) innen.push(hi > lo ? lo + ((hi - lo) * i) / 16 : lo + i * 0.1);
    if (innen.some((x) => !endlich(Fk(x)))) return setErg({ fehler: "Dein F ist nicht auf dem ganzen Intervall definiert. Für 1/x mit negativen x brauchst du ln|x|, hier also ln(−x)." });
    const passt = innen.every((x) => { const s = fk(x), m = dF(x); return endlich(s) && endlich(m) && Math.abs(s - m) <= 1e-6 * (1 + Math.abs(s)); });
    if (!passt) return setErg({ fehler: "F ist keine Stammfunktion von f: Leitest du F ab, kommt nicht f heraus. Prüfe F zuerst – zum Beispiel im Modus „Stammfunktion bilden“." });
    const Fb = Fk(b.v), Fa = Fk(a.v);
    setErg({ f, F, a, b, Fa, Fb, I: Fb - Fa });
  };

  const aktivText = felder[aktiv] ?? "";
  const feld = (k, label) => {
    const an = aktiv === k;
    const baum = felder[k] ? parse(ohneC(felder[k])) : null;
    return (
      <button type="button" onClick={() => { setAktiv(k); setPos((felder[k] || "").length); }} aria-pressed={an}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 50, padding: "8px 12px", marginBottom: 8, borderRadius: 12, cursor: "pointer",
          fontFamily: "inherit", textAlign: "left", overflowX: "auto", border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.sand : C.weiss, color: C.tinte }}>
        <span style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", minWidth: 58 }}>{label}</span>
        <span style={{ fontSize: 18, whiteSpace: "nowrap" }}>
          {felder[k] ? (baum ? <M t={tx(baum)} /> : <span style={{ color: C.signal, fontSize: 15 }}>{felder[k]}</span>) : <span style={{ color: C.hellgrau, fontSize: 14, fontWeight: 300 }}>{an ? "eingeben …" : ""}</span>}
        </span>
      </button>
    );
  };

  const zeile = (inhalt, i) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 19, lineHeight: 2, whiteSpace: "nowrap", color: C.tinte }}>{inhalt}</div>
  );
  let rechnung = null;
  if (erg && !erg.fehler) {
    const { f, F, a, b, Fa, Fb, I } = erg;
    const Ftex = (g) => { const t = tx(einsetzen(F, g.baum)); return ["+", "-", "neg"].includes(F.k) ? `(${t})` : t; };
    const wa = wertTex(Fa), wb = wertTex(Fb), wi = wertTex(I);
    const gl = wa.exakt && wb.exakt && wi.exakt ? "=" : "\\approx";
    const faTex = Fa < 0 ? `(${wa.tex})` : wa.tex;
    rechnung = (
      <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px", overflowX: "auto", marginTop: 12 }}>
        {zeile(<><IntZ a={<M t={a.tex} />} b={<M t={b.tex} />} /><M t={`${tx(f)}\\,dx = F(${b.tex}) - F(${a.tex})`} /></>, 0)}
        {zeile(<M t={`= ${Ftex(b)} - ${Ftex(a)}`} />, 1)}
        {zeile(<M t={`${gl} ${wb.tex} - ${faTex}`} />, 2)}
        {zeile(<><M t={`${gl} ${wi.tex}`} /><span style={{ color: C.smaragd, fontWeight: 700, fontSize: 16 }}>✓</span></>, 3)}
        {!wi.exakt && <p style={{ fontSize: 12.5, color: C.grau, marginTop: 4 }}>Auf vier Nachkommastellen gerundet.</p>}
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 8, whiteSpace: "normal" }}>
          Das C einer Stammfunktion spielt keine Rolle: (F(b) + C) − (F(a) + C) = F(b) − F(a).
          {I < 0 && " Das Ergebnis ist negativ: Insgesamt liegt mehr vom Graphen unterhalb der x-Achse als oberhalb – das Integral ist eine Bilanz, kein Flächeninhalt."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel }}>Bestimmtes Integral mit dem Hauptsatz</p>
        <IchHaengeFest kontext={integralHilfe(felder)} />
      </div>
      <div style={{ marginTop: -6, marginBottom: 6 }}>
        <button type="button" onClick={zeigeHauptsatz}
          style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>ⓘ Hauptsatz ansehen</button>
      </div>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>
        Gib f, eine Stammfunktion F und die Grenzen ein. Die App prüft F′ = f auf dem Intervall und rechnet zeilenweise.
      </p>
      {feld("f", "f(x) =")}
      {feld("F", "F(x) =")}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>{feld("a", "a =")}</div>
        <div style={{ flex: 1 }}>{feld("b", "b =")}</div>
      </div>
      {tippen ? (
        <input value={aktivText} onChange={(e) => setze(aktiv, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") rechnen(); }}
          aria-label={`Eingabe für ${aktiv}`} autoCapitalize="off" autoCorrect="off" spellCheck="false"
          style={{ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 12, border: `1.5px solid ${C.linie}`, padding: "0 12px", fontSize: 16, fontFamily: "ui-monospace, Menlo, monospace", marginTop: 4 }} />
      ) : (
        <Tastenfeld wert={aktivText} setWert={(t) => setze(aktiv, t)} pos={pos} setPos={setPos} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        <button type="button" onClick={() => setTippen(!tippen)} style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
          {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
        </button>
        <button type="button" onClick={beispiel} style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0 }}>
          Beispiel laden: ∫₂³ 3x² dx
        </button>
      </div>
      <button type="button" onClick={rechnen}
        style={{ width: "100%", height: 50, marginTop: 14, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 800, color: C.weiss, background: C.smaragd, boxShadow: "0 4px 14px rgba(47,143,91,0.35)" }}>
        Integral berechnen
      </button>
      {erg && erg.fehler && <p role="alert" style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, marginTop: 12, fontWeight: 500 }}>{erg.fehler}</p>}
      {rechnung}
    </div>
  );
}

/* ---------- Seite ---------- */

const MODI = [
  { id: "stamm", name: "Stammfunktion bilden" },
  { id: "speziell", name: "Spezielle Funktionen" },
  { id: "advanced", name: "Advanced" },
  { id: "bestimmt", name: "∫ₐᵇ f(x) dx", aria: "Bestimmtes Integral von a bis b" },
];

const REGELN = [["sin(x)", "-\\cos(x) + C"], ["\\cos(x)", "\\sin(x) + C"], ["e^{x}", "e^{x} + C"], ["\\frac{1}{x}", "\\ln|x| + C"]];

export function Integrale() {
  const [modus, setModus] = useState("stamm");
  const [dialog, setDialog] = useState(null);           // "c" | "hauptsatz" | null
  const hauptsatzGesehen = useRef(false);
  const waehle = (id) => {
    setModus(id);
    if (id === "bestimmt" && !hauptsatzGesehen.current) { hauptsatzGesehen.current = true; setDialog("hauptsatz"); }
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>Rückwärts ableiten</h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Eine Stammfunktion F ist eine Funktion, deren Ableitung f ist: F′ = f. Bilde Stammfunktionen und berechne
        bestimmte Integrale mit dem Hauptsatz. Jede gleichwertige Schreibweise zählt.
      </p>

      <div role="tablist" aria-label="Integral-Übungen" className="int-modi" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {MODI.map((m) => {
          const an = modus === m.id;
          return (
            <button key={m.id} type="button" role="tab" aria-selected={an} aria-label={m.aria} onClick={() => waehle(m.id)}
              style={{ minHeight: 48, padding: "8px 10px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: m.id === "bestimmt" ? 16 : 14, fontWeight: 700,
                border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see,
                boxShadow: an ? "0 4px 14px rgba(0,77,152,0.25)" : "none" }}>
              {m.name}
            </button>
          );
        })}
      </div>

      {modus === "speziell" && (
        <div style={{ ...karte, marginTop: 16, padding: "14px 16px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.gruenDunkel, marginBottom: 8 }}>DIE VIER SPEZIELLEN STAMMFUNKTIONEN</p>
          {REGELN.map(([f, F]) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, lineHeight: 2 }}>
              <span style={{ minWidth: 70 }}><M t={f} /></span><span style={{ color: C.hellgrau }}>→</span><M t={F} />
            </div>
          ))}
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55, marginTop: 6 }}>ln|x| gilt auf Intervallen ohne 0; für x &gt; 0 ist das ln(x).</p>
        </div>
      )}

      {/* Alle Modi bleiben eingehängt, damit Eingaben beim Wechsel erhalten bleiben */}
      {["stamm", "speziell", "advanced"].map((id) => (
        <div key={id} style={{ display: modus === id ? "block" : "none" }}>
          <StammTrainer art={id} onC={() => setDialog("c")} />
        </div>
      ))}
      <div style={{ display: modus === "bestimmt" ? "block" : "none" }}>
        <BestimmtesIntegral zeigeHauptsatz={() => setDialog("hauptsatz")} />
      </div>

      {dialog === "c" && <CErklaerung onClose={() => setDialog(null)} />}
      {dialog === "hauptsatz" && <HauptsatzDialog onClose={() => setDialog(null)} />}
    </div>
  );
}
