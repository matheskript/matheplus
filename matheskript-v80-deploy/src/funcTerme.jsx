/* ============================================================
   Gleichungen-Bereich: Terme und Potenzgesetze
   Fünf Wege: Terme vereinfachen · Ausklammern · Binomische Formeln ·
   Potenzgesetze · Bruchterme.
   Die Eingabe wird gelesen (func12-Parser) und an mehreren Stellen auf
   Gleichwertigkeit mit der Referenz geprüft; zusätzlich prüft ein
   Formtest, ob der Term wirklich vereinfacht / ausgeklammert / gekürzt ist.
   Hinweise kommen stufenweise, die Lösung erst auf Wunsch.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { parse, kompiliere, hatX, hatBox, alsTex } from "./func12.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, KleinerLink, Rueck, TextFeld, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { qLies, qNum } from "./rechnen2.js";
import { neuAusklammern, neuBinomisch, neuBruch, neuPotenz, neuTerme } from "./termgen.js";

const loesungBox = { background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 10 };
const zeile = { display: "flex", alignItems: "center", gap: 6, fontSize: 17, lineHeight: 1.9, whiteSpace: "nowrap", overflowX: "auto", color: C.tinte };

/* ---------- Eingabe lesen ---------- */
const normal = (t) => String(t).replace(/[−–]/g, "-").replace(/[·×]/g, "*").replace(/²/g, "^2").replace(/³/g, "^3").replace(/:/g, "/").replace(/,/g, ".");
export function leseTerm(text) {
  if (!text.trim()) return { fehler: zw("Bitte einen Term eintippen.", "Please type a term.") };
  const n = parse(normal(text));
  if (!n || hatBox(n)) return { fehler: zw("Das lässt sich nicht lesen. Nutze Klammern, * (oder ·) fürs Malnehmen, / für Brüche und ^ für Potenzen.", "I can’t read that. Use brackets, * for multiplication, / for fractions and ^ for powers.") };
  if (!hatX(n)) return { fehler: zw("Der Term soll x enthalten.", "The term should contain x.") };
  return { n, f: kompiliere(n) };
}

/* ---------- Formanalyse am Syntaxbaum ---------- */
const sehe = (n, p) => !!n && (p(n) || ["a", "b"].some((s) => n[s] && sehe(n[s], p)));
const zaehleX = (n) => (!n ? 0 : (n.k === "x" ? 1 : 0) + zaehleX(n.a) + zaehleX(n.b));
const anzahlSummanden = (n) => (n.k === "+" || n.k === "-" ? anzahlSummanden(n.a) + anzahlSummanden(n.b) : 1);
const hatKlammer = (n) => sehe(n, (m) => m.k === "par");
const hatDiv = (n) => sehe(n, (m) => m.k === "/");
const klammerBasis = (n) => sehe(n, (m) => m.k === "^" && m.a.k === "par");
const negExp = (n) => sehe(n, (m) => m.k === "^" && (m.b.k === "neg" || (m.b.k === "par" && m.b.a.k === "neg") || (m.b.k === "num" && m.b.v < 0)));
const stripPar = (n) => (n.k === "par" ? stripPar(n.a) : n);
const istSumme = (n) => { const s = stripPar(n); return s.k === "+" || s.k === "-"; };
const klammerSumme = (n) => n.k === "par" && istSumme(n);
function faktoren(n) {
  if (n.k === "*") return [...faktoren(n.a), ...faktoren(n.b)];
  if (n.k === "neg") return [{ k: "num", v: -1 }, ...faktoren(n.a)];
  if (n.k === "par" && !istSumme(n.a)) return faktoren(n.a);
  if (n.k === "^" && n.a.k === "par" && istSumme(n.a) && n.b.k === "num" && Number.isInteger(n.b.v) && n.b.v >= 2 && n.b.v <= 4) return Array(n.b.v).fill(n.a);
  return [n];
}
const PUNKTE = [0.7, 1.9, 3.3, -2.4, 5.1];
const PUNKTE_POS = [0.7, 1.9, 3.3, 4.6];
const nah = (a, b) => isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
const gleich = (f, ref, pos) => (pos ? PUNKTE_POS : PUNKTE).every((x) => nah(f(x), ref(x)));
/* Grad einer Funktion (endliche Differenzen, höchstens 5) */
function grad(f) {
  let v = [0, 1, 2, 3, 4, 5, 6].map((x) => f(x));
  if (v.some((y) => !isFinite(y))) return 9;
  for (let g = 0; g <= 5; g++) {
    if (v.every((y) => Math.abs(y) < 1e-6)) return Math.max(0, g - 1) || 0;
    const w = v.slice(1).map((y, i) => y - v[i]);
    if (w.every((y) => Math.abs(y) < 1e-6)) return g;
    v = w;
  }
  return 9;
}

/* Rückgabe: { ok, text } – text erklärt, was noch fehlt */
export function pruefeForm(au, n, f) {
  const pos = !!au.positiv;
  if (!gleich(f, au.ref, pos)) return { ok: false, gleichwertig: false };
  const e = (de, en) => ({ ok: false, gleichwertig: true, text: zw(de, en) });
  switch (au.pruef) {
    case "vereinfacht":
    case "ausmultipliziert":
      if (hatKlammer(n)) return e("Gleichwertig – aber es stehen noch Klammern da. Löse alle Klammern auf.", "Equivalent – but brackets remain. Expand all brackets.");
      if (anzahlSummanden(n) > au.terme) return e("Gleichwertig – aber noch nicht zusammengefasst. Gleichartige Terme (gleiche Potenz von x) addieren.", "Equivalent – but not collected yet. Add like terms (same power of x).");
      return { ok: true };
    case "ausgeklammert": {
      const fs = faktoren(n);
      const summen = fs.filter(klammerSumme);
      if (summen.length === 0) return e("Gleichwertig – aber noch eine Summe. Schreibe den Term als Produkt: Faktor · (Rest).", "Equivalent – but still a sum. Write it as a product: factor · (rest).");
      if (summen.length > 1) return e("Beim Ausklammern entsteht ein Faktor und genau eine Klammer.", "Factoring out gives one factor and exactly one bracket.");
      const innen = kompiliere(stripPar(summen[0]));
      const aussen = fs.filter((m) => !klammerSumme(m)).map(kompiliere);
      const verh = PUNKTE_POS.map((x) => aussen.reduce((p, g) => p * g(x), 1) / au.faktor(x));
      const r = verh[0];
      if (!verh.every((v) => nah(v, r))) return e("Du hast ausgeklammert, aber nicht vollständig: Prüfe, ob in der Klammer noch ein gemeinsamer Faktor steckt.", "You factored, but not completely: check whether the bracket still has a common factor.");
      void innen;
      if (Math.abs(Math.abs(r) - 1) < 1e-9) return { ok: true };
      if (Math.abs(r) < 1) return e("Du kannst noch mehr ausklammern – nimm den größten gemeinsamen Faktor und die kleinste x-Potenz.", "You can factor out more – take the greatest common factor and the lowest power of x.");
      return e("Dein Faktor ist zu groß: In der Klammer stehen jetzt Brüche. Klammere den größten gemeinsamen Teiler der Koeffizienten aus.", "Your factor is too big: the bracket now holds fractions. Factor out the greatest common divisor of the coefficients.");
    }
    case "faktorisiert": {
      const fs = faktoren(n);
      const summen = fs.filter(klammerSumme);
      if (summen.length < 2) return e("Gleichwertig – aber noch kein Produkt aus Klammern. Schreibe als (…)² oder (…)(…).", "Equivalent – but not a product of brackets yet. Write it as (…)² or (…)(…).");
      if (!summen.every((s) => grad(kompiliere(stripPar(s))) === 1)) return e("Die Klammern sollen nur noch x in erster Potenz enthalten.", "The brackets should only contain x to the first power.");
      const rest = fs.filter((m) => !klammerSumme(m)).map(kompiliere);
      const c = rest.reduce((p, g) => p * g(2), 1);
      if (rest.length && Math.abs(Math.abs(c) - 1) > 1e-9) return e("Es soll ohne zusätzlichen Zahlenfaktor vor den Klammern gehen.", "It should work without an extra number factor in front of the brackets.");
      return { ok: true };
    }
    case "potenz":
      if (zaehleX(n) > 1 || klammerBasis(n)) return e("Gleichwertig – aber noch nicht zusammengefasst. Am Ende steht nur noch ein x mit einem Exponenten.", "Equivalent – but not combined yet. In the end only one x with one exponent should remain.");
      if (negExp(n)) return e("Bitte ohne negativen Exponenten schreiben.", "Please write it without a negative exponent.");
      return { ok: true };
    case "potenzNeg":
      if (negExp(n)) return e("Gleichwertig – aber der Exponent ist noch negativ. Schreibe als Bruch.", "Equivalent – but the exponent is still negative. Write it as a fraction.");
      if (!hatDiv(n)) return e("Schreibe das Ergebnis als Bruch 1 / xⁿ.", "Write the result as a fraction 1 / xⁿ.");
      return { ok: true };
    case "bruchPoly":
      if (hatDiv(n)) return e("Gleichwertig – aber noch nicht gekürzt. Nach dem Kürzen bleibt hier kein Bruch übrig.", "Equivalent – but not cancelled yet. After cancelling no fraction remains here.");
      return { ok: true };
    case "bruchBruch": {
      const t = stripPar(n);
      if (t.k !== "/") return e("Schreibe das Ergebnis als gekürzten Bruch Zähler / Nenner.", "Write the result as a cancelled fraction numerator / denominator.");
      const gz = grad(kompiliere(t.a)), gn = grad(kompiliere(t.b));
      if (gz > 1 || gn > 1) return e("Gleichwertig – aber noch nicht vollständig gekürzt. Zähler und Nenner sollen nur noch x in erster Potenz enthalten.", "Equivalent – but not fully cancelled. Numerator and denominator should only contain x to the first power.");
      return { ok: true };
    }
    default: return { ok: true };
  }
}

/* ---------- Aufgabenkarte ---------- */
function Aufgabe({ au, neu, titel, kopf, platzhalter, hilfeText, einleitung }) {
  const vor = au.vor || [];
  const [stufe, setStufe] = useState(0);                // Index des aktuellen Vorschritts, danach Eingabe
  const [wahl, setWahl] = useState("");
  const [liste, setListe] = useState("");
  const [eing, setEing] = useState("");
  const [rueck, setRueck] = useState(null);
  const [vers, setVers] = useState(0);
  const [zeigen, setZeigen] = useState(false);
  const [erledigt, setErledigt] = useState(false);
  const imVor = stufe < vor.length;
  const v = imVor ? vor[stufe] : null;

  const stufenHinweis = (hw, n) => (hw && hw.length ? `${zw("Hinweis", "Hint")} ${Math.min(n, hw.length)}/${hw.length}: ${hw[Math.min(n - 1, hw.length - 1)]}` : "");
  const vorPruefen = () => {
    let ok;
    if (v.typ === "wahl") ok = wahl === v.richtig;
    else {
      const werte = liste.replace(/[−–]/g, "-").split(/\s*(?:;|\bund\b)\s*/i).map((s) => qLies(s)).filter(Boolean);
      if (!werte.length) { setRueck({ art: "warn", text: zw("Gib mindestens einen Wert ein, z. B. −3 oder 3; −3.", "Enter at least one value, e.g. −3 or 3; −3.") }); return; }
      const soll = v.ausschluss;
      ok = werte.length === soll.length && soll.every((s) => werte.some((w) => qNum(w) === s));
    }
    if (ok) { setRueck(null); setVers(0); setWahl(""); setListe(""); setStufe(stufe + 1); return; }
    const n = vers + 1; setVers(n);
    setRueck({ art: "schlecht", text: `${zw("Noch nicht.", "Not yet.")} ${stufenHinweis(v.hinweise, n)}` });
  };
  const pruefen = () => {
    const t = leseTerm(eing);
    if (t.fehler) { setRueck({ art: "warn", text: t.fehler }); return; }
    const r = pruefeForm(au, t.n, t.f);
    if (r.ok) { setRueck({ art: "gut", text: zw("Richtig – gleichwertig und in der verlangten Form.", "Correct – equivalent and in the required form.") }); setErledigt(true); return; }
    if (r.gleichwertig) { setRueck({ art: "warn", text: r.text }); return; }
    const n = vers + 1; setVers(n);
    const probe = au.ausschluss?.includes(4) ? 6 : 4;
    const mitProbe = n >= 2 ? ` ${zw("Probe bei x =", "Check at x =")} ${probe}: ${zw("Aufgabenterm", "given term")} ${rd(au.ref(probe))}, ${zw("dein Term", "your term")} ${rd(t.f(probe))}.` : "";
    setRueck({ art: "schlecht", text: `${zw("Noch nicht gleichwertig.", "Not equivalent yet.")} ${stufenHinweis(au.hinweise, n)}${mitProbe}` });
  };
  let gelesen = "";
  if (eing.trim()) { const t = parse(normal(eing)); if (t && !hatBox(t)) { try { gelesen = alsTex(t); } catch { gelesen = ""; } } }

  const hilfe = hilfeKontext({
    id: `terme-${au.id}`, aufgabe: hilfeText,
    verstehen: [
      zw("Zwei Terme sind gleichwertig, wenn sie für jedes x denselben Wert haben.", "Two terms are equivalent if they have the same value for every x."),
      zw("„Vereinfachen“ heißt: so kurz wie möglich schreiben, ohne den Wert zu verändern.", "“Simplify” means writing it as short as possible without changing its value."),
      zw("Mache die Probe: Setze eine Zahl in Anfangs- und Endterm ein.", "Do a check: plug a number into the start and end term."),
    ],
    ansatz: [zw("Was ist hier gefragt: auflösen, zusammenfassen, ausklammern oder kürzen?", "What is asked: expand, collect, factor out or cancel?"), zw("Arbeite in kleinen Schritten, jeder Schritt bleibt gleichwertig.", "Work in small steps, every step stays equivalent."), zw("Schreibe die Zwischenschritte untereinander.", "Write the intermediate steps below each other.")],
    regel: [zw("Welche Regel passt?", "Which rule applies?"), zw("Distributivgesetz: a(b + c) = ab + ac. Binomische Formeln. Potenzgesetze.", "Distributive law: a(b + c) = ab + ac. Binomial formulas. Power laws."), zw("Kürzen nur von Faktoren, nie von Summanden.", "Cancel factors only, never summands.")],
    pruefen: [zw("Setze x = 2 in beide Terme ein.", "Plug x = 2 into both terms."), zw("Kommt dasselbe heraus? Dann ist es sehr wahrscheinlich gleichwertig.", "Same result? Then it is very likely equivalent."), zw("Beim Bruch: Prüfe, ob du einen verbotenen x-Wert eingesetzt hast.", "For fractions: check you did not plug in a forbidden x value.")],
    regeln: [{ name: "Binomische Formeln", bereich: "terme" }, { name: "Potenzgesetze", bereich: "terme" }],
  });

  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{titel}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{einleitung}</p>
      <p style={{ fontSize: 14.5, color: C.tinte, fontWeight: 600, margin: "0 0 4px" }}>{kopf}</p>
      <div style={{ ...zeile, justifyContent: "center", fontSize: 20, padding: "6px 0" }}><M t={au.tex} /></div>

      {imVor && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.grau, margin: "12px 0 6px" }}>{stufe + 1}. {v.titel}</p>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, margin: "0 0 8px" }}>{v.frage}</p>
          {v.typ === "wahl"
            ? <Auswahl optionen={v.optionen} wert={wahl} setWert={(x) => { setWahl(x); setRueck(null); }} label={v.titel} />
            : <TextFeld wert={liste} setWert={(x) => { setListe(x); setRueck(null); }} label={v.titel} platzhalter="-3; 3" onEnter={vorPruefen} />}
          <GrosserKnopf onClick={vorPruefen} disabled={v.typ === "wahl" ? !wahl : !liste.trim()}>{zw("Schritt prüfen", "Check step")}</GrosserKnopf>
          {rueck && <Rueck art={rueck.art}>{rueck.text}</Rueck>}
        </div>
      )}
      {!imVor && vor.length > 0 && (
        <p style={{ fontSize: 12.5, color: "#0F7A4D", fontWeight: 700, margin: "8px 0 0" }}>✓ {vor.map((s) => s.titel).join(" · ")}: {vor.map((s) => s.erklaerung).join(" · ")}</p>
      )}
      {!imVor && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.grau, margin: "12px 0 6px" }}>{vor.length + 1}. {zw("Dein Ergebnis", "Your result")}</p>
          <TextFeld wert={eing} setWert={(x) => { setEing(x); setRueck(null); setErledigt(false); }} label={zw("Dein Term", "Your term")} platzhalter={platzhalter} onEnter={pruefen} />
          {gelesen && <div style={{ ...zeile, fontSize: 15, color: C.grau, marginTop: 4 }}><span>{zw("Gelesen als:", "Read as:")}</span> <M t={gelesen} /></div>}
          <GrosserKnopf onClick={pruefen} disabled={!eing.trim()}>{zw("Prüfen", "Check")}</GrosserKnopf>
          {rueck && <Rueck art={rueck.art}>{rueck.text}</Rueck>}
        </div>
      )}
      {!zeigen
        ? <KleinerLink onClick={() => setZeigen(true)}>{zw("Lösung zeigen", "Show solution")}</KleinerLink>
        : (
          <div style={loesungBox}>
            {au.loesung.map((z, i) => <div key={i} style={zeile}>{i > 0 && <span>=</span>}<M t={z} /></div>)}
            {au.ausschluss && <p style={{ fontSize: 13, color: C.grau, margin: "4px 0 0" }}>{zw("Gilt für", "Valid for")} x ≠ {au.ausschluss.map((z) => String(z).replace("-", "−")).join("; ")}</p>}
          </div>
        )}
      {erledigt && <p style={{ fontSize: 13, color: C.grau, margin: "6px 0 0" }}>{zw("Tipp: Probiere noch eine Aufgabe oder wechsle oben die Übung.", "Tip: try another problem or switch the exercise above.")}</p>}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}
const rd = (v) => (isFinite(v) ? String(Math.round(v * 1000) / 1000).replace("-", "−").replace(".", ",") : "—");

const Kopie = ({ erzeuger, ...p }) => {
  const [au, setAu] = useState(erzeuger);
  return <Aufgabe key={au.id} au={au} neu={() => setAu(erzeuger())} {...p} />;
};

function BinomischKarte() {
  const [rich, setRich] = useState("ausmultiplizieren");
  const [au, setAu] = useState(() => neuBinomisch("ausmultiplizieren"));
  const wechsel = (r) => { setRich(r); setAu(neuBinomisch(r)); };
  const ausm = rich === "ausmultiplizieren";
  return (
    <div>
      <div style={{ marginTop: 14 }}>
        <Auswahl optionen={[["ausmultiplizieren", zw("Ausmultiplizieren", "Expand")], ["faktorisieren", zw("Faktorisieren", "Factorise")]]} wert={rich} setWert={wechsel} label={zw("Richtung", "Direction")} />
      </div>
      <Aufgabe key={au.id} au={au} neu={() => setAu(neuBinomisch(rich))} titel={zw("Binomische Formeln", "Binomial formulas")}
        einleitung={ausm ? zw("Erkenne die Formel und multipliziere aus.", "Recognise the formula and expand.") : zw("Erkenne die Formel und schreibe den Term als Produkt.", "Recognise the formula and write the term as a product.")}
        kopf={ausm ? zw("Multipliziere aus und fasse zusammen:", "Expand and collect:") : zw("Schreibe als Produkt (Klammern):", "Write as a product (brackets):")}
        platzhalter={ausm ? "x^2 + 6x + 9" : "(x+3)^2"} hilfeText="binomische Formeln ausmultiplizieren faktorisieren" />
    </div>
  );
}

const MODI = [["terme", "Terme vereinfachen", "Simplify terms"], ["klammer", "Ausklammern", "Factor out"], ["binom", "Binomische Formeln", "Binomial formulas"], ["potenz", "Potenzgesetze", "Power laws"], ["bruch", "Bruchterme", "Rational terms"]];
export function TermeUndPotenzgesetze() {
  const [modus, setModus] = useState("terme");
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 24 }}>
      <h2 className="intro-h2" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>{zw("Terme und Potenzgesetze", "Terms and power laws")}</h2>
      <p style={{ ...hinweis, marginBottom: 14 }}>{zw("Das Handwerkszeug unter allen Gleichungen: vereinfachen, ausklammern, binomische Formeln, Potenzen und Brüche. Du tippst den Term, die App prüft Wert und Form.", "The toolkit under every equation: simplify, factor, binomial formulas, powers and fractions. You type the term, the app checks value and form.")}</p>
      <div role="tablist" aria-label={zw("Übungen", "Exercises")} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {MODI.map(([id, de, en]) => {
          const an = modus === id;
          return (
            <button key={id} type="button" role="tab" aria-selected={an} onClick={() => setModus(id)}
              style={{ minHeight: 48, padding: "8px 8px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, textAlign: "center",
                border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{zw(de, en)}</button>
          );
        })}
      </div>
      <div style={{ display: modus === "terme" ? "block" : "none" }}>
        <Kopie erzeuger={neuTerme} titel={zw("Terme vereinfachen", "Simplify terms")} einleitung={zw("Klammern auflösen und gleichartige Terme zusammenfassen.", "Expand brackets and collect like terms.")}
          kopf={zw("Vereinfache so weit wie möglich:", "Simplify as far as possible:")} platzhalter="-2x + 2" hilfeText="Terme vereinfachen Klammern auflösen zusammenfassen" />
      </div>
      <div style={{ display: modus === "klammer" ? "block" : "none" }}>
        <Kopie erzeuger={neuAusklammern} titel={zw("Ausklammern", "Factor out")} einleitung={zw("Den größten gemeinsamen Faktor vor eine Klammer ziehen.", "Pull the greatest common factor in front of a bracket.")}
          kopf={zw("Klammere so viel wie möglich aus:", "Factor out as much as possible:")} platzhalter="3x(x+2)" hilfeText="ausklammern gemeinsamer Faktor" />
      </div>
      <div style={{ display: modus === "binom" ? "block" : "none" }}><BinomischKarte /></div>
      <div style={{ display: modus === "potenz" ? "block" : "none" }}>
        <Kopie erzeuger={neuPotenz} titel={zw("Potenzgesetze", "Power laws")} einleitung={zw("Wähle das passende Gesetz und fasse zu einer Potenz zusammen.", "Pick the matching law and combine into one power.")}
          kopf={zw("Fasse zusammen:", "Combine:")} platzhalter="x^9" hilfeText="Potenzgesetze Exponenten addieren subtrahieren" />
      </div>
      <div style={{ display: modus === "bruch" ? "block" : "none" }}>
        <Kopie erzeuger={neuBruch} titel={zw("Bruchterme", "Rational terms")} einleitung={zw("Erst die verbotenen Werte, dann kürzen – nur Faktoren, nie Summanden.", "First the forbidden values, then cancel – factors only, never summands.")}
          kopf={zw("Kürze so weit wie möglich:", "Cancel as far as possible:")} platzhalter="x+2" hilfeText="Bruchterme kürzen Definitionsmenge faktorisieren" />
      </div>
    </div>
  );
}
