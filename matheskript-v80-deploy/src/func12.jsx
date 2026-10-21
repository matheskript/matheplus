/* ============================================================
   Advanced Plotter — Variante des Polynomplotters für beliebige
   Funktionen: Verkettungen aus Polynomen, sin, cos, tan, ln, log,
   log zur Basis a, e^x, a^x, Wurzel, Brüchen und Potenzen.

   Aufbau dieser Datei:
   1. Formel-Engine: Tokenizer, Parser, Auswertung, symbolisches
      Ableiten mit Vereinfachung, Ausgabe als TeX (App) und Klartext (PDF)
   2. Numerische Analyse (Definitionsbereich, Nullstellen, Pole,
      Extrem- und Wendepunkte, Grenzverhalten, Integrale)
   3. Kurvendiskussion als Abschnitte (gleiches Format wie beim Polynom-PDF)
   4. Oberfläche: Tastenfeld (6 Spalten), Plot, Anzeige, PDF-Knopf

   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { uebergabeErledigt, uebergabeLesen } from "./uebergabe.js";
import { WeiterKnopf, WeiterMit } from "./funcWerkzeuge.jsx";
import { C } from "./base1.jsx";
import { PLATZ } from "./base2.jsx";
import { loeseGanzrational, polyTextPdf, schoenerSchritt, zahl as zahl2 } from "./func2.jsx";
import { M, Zeile } from "./func3.jsx";
import { Arbeitsflaeche, BildKarte, FeinKarte, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { MatheFeld } from "./matheTastatur.jsx";

/* ---------- 1. Formel-Engine ---------- */

import { MAX_LISTE, ableitung, alsTex, alsText, analysiere, biquadratischeKoeffizienten, div, endlich, fn, grenzeTxt, hatBox, hatX, kompiliere, liveTex, liveTexPos, mitSchreibmarke, ohnePar, parse, rund, tiefZiffer, tokenisiere, vereinfache, wert, zahl } from "./formelEngine.js";
import { naechsterPlatz, stelleAusKlick, stelleLinks, stelleRechts } from "./formelCursor.js";
import { springe } from "./sprung.js";
export { ableitung, alsTex, alsText, analysiere, biquadratischeKoeffizienten, hatBox, hatX, kompiliere, liveTex, mitSchreibmarke, ohnePar, parse, tokenisiere, vereinfache, wert };

export function LiveFormel({ text, pos, setPos, hinweis }) {
  // Mit pos und setPos ist es die Anzeige des Feldes, in das gerade geschrieben wird (siehe EingabeFormel)
  if (setPos) return <EingabeFormel text={text} pos={pos} setPos={setPos} hinweis={hinweis} />;
  const tex = liveTex(text);
  return tex ? <M t={tex} /> : <span style={{ whiteSpace: "pre" }}>{text}</span>;
}

/* Formel-Anzeige des Feldes, in das gerade geschrieben wird:
   · die Schreibmarke steht dort, wo getippt wird (nicht vorn und nicht am Ende)
   · steht sie auf einem Platzhalter ▯, ist der als markiertes Kästchen zu sehen
   · die Klammer, in der man steckt, ist grau hinterlegt
   · ein Klick irgendwo in die Formel setzt die Schreibmarke dorthin; rechts neben einen Exponenten oder eine
     Wurzel geklickt, geht es dahinter weiter (+, ×, Potenz …).
   Ohne setPos bleibt es eine reine Anzeige. */
const MARKE_CSS = `@keyframes mBlink{0%,55%{opacity:1}56%,100%{opacity:0}}
.m-cursor{animation:mBlink 1.05s infinite}
@keyframes mBoxPuls{0%,55%{background:rgba(165,0,68,.16)}56%,100%{background:rgba(165,0,68,.04)}}
.m-boxaktiv{animation:mBoxPuls 1.05s infinite}
@media (prefers-reduced-motion: reduce){.m-cursor,.m-boxaktiv{animation:none}}`;

export function EingabeFormel({ text, pos, setPos, hinweis, style }) {
  const wurzel = useRef(null);
  const len = text.length;
  const p = Math.max(0, Math.min(pos == null ? len : pos, len));
  const tex = useMemo(() => liveTexPos(text, p), [text, p]);
  // Die Marke bleibt im Blick, auch in einer langen Formel in einem seitlich scrollbaren Feld
  useEffect(() => {
    const el = wurzel.current && wurzel.current.querySelector(".m-cursor, .m-boxaktiv");
    try { if (el && el.scrollIntoView) springe("formel-cursor", () => el.scrollIntoView({ block: "nearest", inline: "nearest" })); } catch (e) { /* ältere Browser */ }
  }, [text, p]);
  const klick = (e) => {
    e.stopPropagation();          // das Antippen der Formel setzt die Marke; es klappt das Feld nicht zu
    const w = wurzel.current;
    if (!w) return;
    const blaetter = [...w.querySelectorAll("[data-s]")].map((el) => {
      const r = el.getBoundingClientRect();
      const gruppen = [];
      for (let a = el.parentElement; a && a !== w; a = a.parentElement) {
        if (a.hasAttribute("data-ge")) gruppen.push({ ge: Number(a.getAttribute("data-ge")), r: a.getBoundingClientRect().right });
      }
      return { s: Number(el.getAttribute("data-s")), e: Number(el.getAttribute("data-e")), l: r.left, r: r.right, t: r.top, b: r.bottom, gruppen };
    });
    setPos(stelleAusKlick(e.clientX, e.clientY, blaetter, len));
  };
  const inhalt = !len
    ? <><span className="m-cursor" aria-hidden="true" style={{ display: "inline-block", width: "0.12em", height: "1.08em", background: C.gruen, borderRadius: 1.5, margin: "0 0.05em", verticalAlign: "middle" }} />{hinweis}</>
    : tex ? <M t={tex} />
      : <span style={{ whiteSpace: "pre" }}>{text.slice(0, p)}<span className="m-cursor" aria-hidden="true" style={{ color: C.gruen }}>|</span>{text.slice(p)}</span>;
  return (
    <span ref={wurzel} onClick={klick} data-eingabe-formel="" style={{ cursor: "text", display: "inline-block", minWidth: 28, ...style }}>
      <style>{MARKE_CSS}</style>
      {inhalt}
    </span>
  );
}

export function baueAllgemeineDiskussion(baum, A) {
  const fText = alsText(ohnePar(baum));
  const abschnitte = [];
  const abschnitt = (titel) => { const s = { titel, zeilen: [] }; abschnitte.push(s); return s; };
  const z = (s, txt, fett, tex) => s.zeilen.push({ txt, fett: !!fett, tex });
  const zP = (s, txt, fett) => s.zeilen.push({ txt, prosa: true, fett: !!fett });
  // Zeile mit Zahlenwerten: enthält ein Wert einen π-Bruch (z. B. π/2), wird die Zeile als Formel mit gestapeltem Bruch gesetzt
  const zw = (s, fett, bau) => {
    const t = bau((v) => wert(v)), x = bau((v) => wert(v, true));
    if (t === x) z(s, t, fett); else s.zeilen.push({ txt: x, fett: !!fett, formel: true });
  };
  const fenster = `[${wert(A.L)}; ${wert(A.R)}]`;
  const mitKappe = (liste, zeilenFn, s) => {
    liste.slice(0, MAX_LISTE).forEach(zeilenFn);
    if (liste.length > MAX_LISTE) zP(s, `… und ${liste.length - MAX_LISTE} weitere im Untersuchungsbereich.`);
  };

  // 1. Definitionsbereich
  const s1 = abschnitt("1. Definitionsbereich");
  const ganzFenster = A.laeufe.length === 1 && A.laeufe[0][0] <= A.L + 1e-9 && A.laeufe[0][1] >= A.R - 1e-9;
  const aus = [...A.pole, ...A.hebbar].map((p) => p.x).sort((p, q) => p - q)
    .filter((p) => A.laeufe.some(([a, b]) => p > a + 1e-9 && p < b - 1e-9));
  if (!A.laeufe.length) {
    zP(s1, `f ist im Untersuchungsbereich ${fenster} nirgends definiert.`);
  } else if (ganzFenster) {
    if (!aus.length) z(s1, "D(f) = ℝ", true);
    else if (aus.length <= 6) z(s1, `D(f) = ℝ \\ {${aus.map((x) => wert(x)).join("; ")}}`, true);
    else {
      z(s1, `D(f) = ℝ ohne ${aus.length} Stellen im Bereich ${fenster}`, true);
      zP(s1, `Ausgenommen sind u. a. x = ${aus.slice(0, 4).map((x) => wert(x)).join(", ")}, … (die Lücken wiederholen sich).`);
    }
  } else {
    const teile = A.laeufe.map(([a, b]) => {
      const links = a <= A.L + 1e-9 && A.minus.art !== "undef" ? "(−∞" : `${endlich(A.f(a)) ? "[" : "("}${wert(a)}`;
      const rechts = b >= A.R - 1e-9 && A.plus.art !== "undef" ? "∞)" : `${wert(b)}${endlich(A.f(b)) ? "]" : ")"}`;
      return `${links}; ${rechts}`;
    });
    z(s1, `D(f) = ${teile.join(" ∪ ")}${aus.length ? ` \\ {${aus.map((x) => wert(x)).join("; ")}}` : ""}`, true);
  }
  if (aus.length || !ganzFenster) zP(s1, `Numerisch bestimmt im Untersuchungsbereich ${fenster}.`);

  // 2. Symmetrie
  const s2 = abschnitt("2. Symmetrie");
  if (A.gerade) zP(s2, "f(−x) = f(x) für alle x ⇒ achsensymmetrisch zur y-Achse.");
  else if (A.ungerade) zP(s2, "f(−x) = −f(x) für alle x ⇒ punktsymmetrisch zum Ursprung.");
  else zP(s2, "Weder f(−x) = f(x) noch f(−x) = −f(x) ⇒ keine Symmetrie zur y-Achse oder zum Ursprung.");

  // 3. Verhalten an den Rändern und an Polen
  const s3 = abschnitt("3. Grenzverhalten und Asymptoten");
  const gTxt = (g) => (g.art === "unendlich" ? (g.vz > 0 ? "∞" : "−∞") : g.art === "wert" ? wert(g.wert) : "");
  [[1, A.plus, "∞"], [-1, A.minus, "−∞"]].forEach(([, g, u]) => {
    if (g.art === "undef") return;
    if (g.art === "unendlich" || g.art === "wert") z(s3, `x → ${u}:  f(x) → ${gTxt(g)}`, true);
    if (g.art === "wert") zP(s3, `Waagerechte Asymptote y = ${wert(g.wert)} für x → ${u}.`);
    if (g.art === "schwingt") zP(s3, `x → ${u}: f schwingt und hat keinen Grenzwert.`);
    if (g.art === "keins") zP(s3, `x → ${u}: kein eindeutiger Grenzwert erkennbar.`);
  });
  mitKappe(A.pole, (p) => {
    const seitenTxt = [[p.li, "⁻"], [p.re, "⁺"]].filter(([g]) => g.art === "unendlich" || g.art === "wert")
      .map(([g, z0]) => `x → ${wert(p.x)}${z0}: f(x) → ${gTxt(g)}`);
    z(s3, seitenTxt.join(",   "));
    z(s3, `Polstelle ⇒ senkrechte Asymptote x = ${wert(p.x)}`, true);
  }, s3);
  A.hebbar.forEach((p) => z(s3, `x = ${wert(p.x)}: hebbare Definitionslücke, f(x) → ${gTxt(p.li)}`, true));
  const schonGenannt = (x) => [...A.pole, ...A.hebbar].some((p) => Math.abs(p.x - x) < 1e-7);
  A.raender.filter((r) => !schonGenannt(r.x)).slice(0, 6).forEach((r) => {
    if (r.def || r.g.art === "undef") return;
    const pfeil = `x → ${wert(r.x)}${r.seite > 0 ? "⁺" : "⁻"}`;
    if (r.g.art === "keins") { zP(s3, `${pfeil}: f schwingt und hat keinen Grenzwert.`); return; }
    z(s3, `${pfeil}:  f(x) → ${gTxt(r.g)}`, true);
    if (r.g.art === "unendlich") zP(s3, `Senkrechte Asymptote x = ${wert(r.x)} am Rand des Definitionsbereichs.`);
  });
  if (!s3.zeilen.length) zP(s3, "Im Untersuchungsbereich ist kein besonderes Grenzverhalten erkennbar.");

  // 4. Nullstellen
  const s4 = abschnitt("4. Nullstellen");
  z(s4, "Ansatz: f(x) = 0", true);
  // Biquadratisches Polynom: exakter Rechenweg mit der Substitution z = x² statt einer Näherung
  const bi = biquadratischeKoeffizienten(A.f);
  if (bi) {
    const polyText = polyTextPdf(bi);
    if (polyText.replace(/\s+/g, "") !== fText.replace(/\s+/g, "")) z(s4, `Zusammengefasst: f(x) = ${polyText}`);
    loeseGanzrational(bi).schritte.forEach((sc) => {
      if (typeof sc === "string") z(s4, sc);
      else if (sc.pd) return;
      else if (sc.formel) s4.zeilen.push({ txt: sc.txt, fett: !!sc.fett, formel: true });
      else if (sc.prosa) zP(s4, sc.txt, sc.fett);
      else z(s4, sc.txt, sc.fett);
    });
  }
  if (!A.ns.length) zP(s4, `f hat im Untersuchungsbereich ${fenster} keine Nullstelle.`);
  else {
    mitKappe(A.ns, (x, i) => zw(s4, bi && i === 0 ? true : false, (w) => `x${tiefZiffer(i + 1)} ${Number.isInteger(rund(x)) || /π/.test(wert(x)) ? "=" : "≈"} ${w(x)}`), s4);
    if (!bi) zP(s4, "Numerisch bestimmt (Vorzeichenwechsel und Bisektion).");
  }

  // 5. Ableitungen
  const s5 = abschnitt("5. Erste und zweite Ableitung");
  z(s5, `f′(x) = ${alsText(A.d1)}`, false, `f′(x) = ${alsTex(A.d1)}`);
  z(s5, `f″(x) = ${alsText(A.d2)}`, false, `f″(x) = ${alsTex(A.d2)}`);

  // 6. Extrempunkte
  const s6 = abschnitt("6. Extrempunkte");
  z(s6, "Notw. Bed.: f′(x) = 0", true);
  if (!A.ext.length) zP(s6, `f′ hat im Untersuchungsbereich keine Nullstelle ⇒ keine Extrempunkte.`);
  else {
    z(s6, "Hinr. Bed.: Vorzeichen von f″ bzw. Vorzeichenwechsel von f′", true);
    const zaehl = {};
    const anz = {}; A.ext.forEach((p) => { anz[p.art] = (anz[p.art] || 0) + 1; });
    mitKappe(A.ext, (p) => {
      const kurz = p.art === "Hochpunkt" ? "H" : p.art === "Tiefpunkt" ? "T" : "S";
      zaehl[kurz] = (zaehl[kurz] || 0) + 1;
      const idx = anz[p.art] > 1 ? tiefZiffer(zaehl[kurz]) : "";
      if (endlich(p.f2) && Math.abs(p.f2) > 1e-7) zw(s6, false, (w) => `f″(${w(p.x)}) ≈ ${w(p.f2)} ${p.f2 < 0 ? "< 0 ⇒ Hochpunkt" : "> 0 ⇒ Tiefpunkt"}`);
      zw(s6, true, (w) => `${p.art} ${kurz}${idx}(${w(p.x)} | ${w(p.y)})`);
    }, s6);
  }

  // 7. Monotonie
  const s7 = abschnitt("7. Monotonieverhalten");
  mitKappe(A.mono, (iv) => {
    const r = iv.vz > 0 ? "streng monoton steigend" : iv.vz < 0 ? "streng monoton fallend" : "konstant";
    z(s7, `(${grenzeTxt(iv.li, A.L, A.R)}; ${grenzeTxt(iv.re, A.L, A.R)}):  f′(x) ${iv.vz > 0 ? ">" : iv.vz < 0 ? "<" : "="} 0  ⇒  ${r}`, true);
  }, s7);

  // 8. Wendepunkte
  const s8 = abschnitt("8. Wendepunkte");
  z(s8, "Notw. Bed.: f″(x) = 0 mit Vorzeichenwechsel", true);
  const wps = A.wende.filter((p) => p.art === "Wendepunkt");
  if (!wps.length) zP(s8, "f hat im Untersuchungsbereich keine Wendepunkte.");
  else mitKappe(wps, (p, i) => zw(s8, true, (w) => `Wendepunkt W${wps.length > 1 ? tiefZiffer(i + 1) : ""}(${w(p.x)} | ${w(p.y)})`), s8);

  // 9. Krümmung
  const s9 = abschnitt("9. Krümmungsverhalten");
  mitKappe(A.kruemm, (iv) => {
    const art = iv.vz > 0 ? "Linkskurve (konvex)" : iv.vz < 0 ? "Rechtskurve (konkav)" : "keine Krümmung";
    z(s9, `(${grenzeTxt(iv.li, A.L, A.R)}; ${grenzeTxt(iv.re, A.L, A.R)}):  f″(x) ${iv.vz > 0 ? ">" : iv.vz < 0 ? "<" : "="} 0  ⇒  ${art}`, true);
  }, s9);

  // 10. Alle markanten Punkte
  const s10 = abschnitt("10. Alle markanten Punkte");
  const gruppe = (titel, liste) => {
    if (!liste.length) return;
    z(s10, `${titel}:`, true);
    mitKappe(liste, (t) => zw(s10, false, (w) => `   ${t(w)}`), s10);
  };
  gruppe("Nullstellen", A.ns.map((x, i) => (w) => `N${A.ns.length > 1 ? tiefZiffer(i + 1) : ""}(${w(x)} | 0)`));
  const zaehl2 = {}, anz2 = {};
  A.ext.forEach((p) => { anz2[p.art] = (anz2[p.art] || 0) + 1; });
  gruppe("Extrempunkte", A.ext.map((p) => {
    const kurz = p.art === "Hochpunkt" ? "H" : p.art === "Tiefpunkt" ? "T" : "S";
    zaehl2[kurz] = (zaehl2[kurz] || 0) + 1;
    return (w) => `${kurz}${anz2[p.art] > 1 ? tiefZiffer(zaehl2[kurz]) : ""}(${w(p.x)} | ${w(p.y)})${kurz === "S" ? "   (Sattelpunkt)" : ""}`;
  }));
  gruppe("Wendepunkte", wps.map((p, i) => (w) => `W${wps.length > 1 ? tiefZiffer(i + 1) : ""}(${w(p.x)} | ${w(p.y)})`));
  if (A.yAchse !== null) gruppe("y-Achsenabschnitt", [(w) => `Sᵧ(0 | ${w(A.yAchse)})   da f(0) = ${w(A.yAchse)}`]);
  else { z(s10, "y-Achsenabschnitt:", true); z(s10, "   keiner, da f(0) nicht definiert ist"); }

  // 11. Nullstellenintegrale
  const s11 = abschnitt("11. Integrale zwischen den Nullstellen");
  if (!A.integrale.length) zP(s11, "Es gibt keine zwei benachbarten Nullstellen mit stetigem Verlauf dazwischen — kein Nullstellenintegral.");
  else {
    zP(s11, "Numerisch berechnet (Simpson-Regel).");
    mitKappe(A.integrale, (iv, i) => {
      zw(s11, true, (w) => `I${tiefZiffer(i + 1)}:  Intervall [${w(iv.x1)}; ${w(iv.x2)}]`);
      z(s11, `I${tiefZiffer(i + 1)} = ∫ f(x) dx ≈ ${zahl(iv.wert).replace("-", "−")}`);
    }, s11);
  }

  return { funktionstext: `f(x) = ${fText}`, abschnitte };
}

/* ---------- 4. Oberfläche ---------- */

/* Tastenfeld: sechs Spalten. e = einzufügender Text; ▯ ist ein Platzhalter,
   in den die Schreibmarke springt. Funktionstasten haben zwei Modi:
   „von x“ (zx/ex) fügt die Funktion direkt mit x ein (sin(x), eˣ),
   „von ?“ (z/e) öffnet die Klammer zum Verketten (sin(▯), e^(▯)). */
const FN_TASTEN = [
  { z: "sin(?)", zx: "sin x", e: `sin(${PLATZ})`, ex: "sin(x)", art: "fn" }, { z: "cos(?)", zx: "cos x", e: `cos(${PLATZ})`, ex: "cos(x)", art: "fn" },
  { z: "tan(?)", zx: "tan x", e: `tan(${PLATZ})`, ex: "tan(x)", art: "fn" }, { z: "ln(?)", zx: "ln x", e: `ln(${PLATZ})`, ex: "ln(x)", art: "fn" },

  { z: "log(?)", zx: "log x", e: `log(${PLATZ})`, ex: "log(x)", art: "fn" }, { z: "logₐ(?)", zx: "logₐx", e: `log[${PLATZ}](${PLATZ})`, ex: `log[${PLATZ}](x)`, art: "fn" },
  { z: "√?", zx: "√x", e: `sqrt(${PLATZ})`, ex: "sqrt(x)", art: "fn" }, { z: "e^?", zx: "eˣ", e: `e^(${PLATZ})`, ex: "e^x", art: "fn" },

  { z: "a^?", zx: "aˣ", e: `${PLATZ}^(${PLATZ})`, ex: `${PLATZ}^x`, art: "fn" }, { z: "?²", zx: "x²", e: `(${PLATZ})^2`, ex: "x^2", art: "fn" },
  { z: "1/?", zx: "x⁻¹", e: `1/(${PLATZ})`, ex: "x^(-1)", art: "fn" }, { z: "?ⁿ", zx: "xⁿ", e: `(${PLATZ})^(${PLATZ})`, ex: `x^(${PLATZ})`, art: "fn" },
];

const TASTEN = [
  { z: "7", e: "7" }, { z: "8", e: "8" }, { z: "9", e: "9" },
  { z: "▯/▯", e: `(${PLATZ})/(${PLATZ})`, art: "op", titel: "Bruch" },
  { z: "(", e: "(", art: "op" }, { z: ")", e: ")", art: "op" },

  { z: "4", e: "4" }, { z: "5", e: "5" }, { z: "6", e: "6" },
  { z: "×", e: "*", art: "op" }, { z: "÷", e: "/", art: "op" }, { z: "e", e: "e", art: "var" },

  { z: "1", e: "1" }, { z: "2", e: "2" }, { z: "3", e: "3" },
  { z: "−", e: "-", art: "op" }, { z: "▯ⁿ", e: `^(${PLATZ})`, art: "op", titel: "hoch" }, { z: "π", e: "pi", art: "var" },

  { z: "0", e: "0" }, { z: ",", e: "," }, { z: "x", e: "x", art: "var" },
  { z: "+", e: "+", art: "op" }, { z: "▯ →", e: null, art: "nav", aktion: "platz", titel: "Nächster Platzhalter – danach aus der Klammer heraus", span: 2 },
];

const LOESCH_EINHEITEN = ["sqrt(", "sin(", "cos(", "tan(", "log[", "log(", "ln(", "pi", "e^("];

const BEISPIELE = [
  ["x · e⁻ˣ", "x*e^(-x)"], ["sin(x)/x", "sin(x)/x"], ["ln(x)/x", "ln(x)/x"],
  ["x/(x²−4)", "x/(x^2-4)"], ["e^(−x²)", "e^(-x^2)"], ["tan(x)", "tan(x)"],
  ["2ˣ − 3", "2^x-3"], ["log₂(x) − 1", "log[2](x)-1"], ["x² · ln(x)", "x^2*ln(x)"],
  ["√(4 − x²)", "sqrt(4-x^2)"], ["2sin(x) + cos(2x)", "2sin(x)+cos(2x)"], ["(x²−1)/(x²+1)", "(x^2-1)/(x^2+1)"],
];

export function zufallsFunktion() {
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const rz = (a, b) => { let v = 0; while (v === 0) v = r(a, b); return v; };
  const vz = (v) => (v < 0 ? `-${-v}` : `+${v}`);
  const vorlagen = [
    () => `${rz(-3, 3)}sin(${r(1, 3)}x)`,
    () => `x*e^(${rz(-2, 2)}x)`,
    () => `ln(x^2${vz(r(1, 5))})`,
    () => `(x^2${vz(rz(-9, 9))})/(x${vz(rz(-4, 4))})`,
    () => `x/(x^2${vz(-r(1, 9))})`,
    () => `e^(-x^2/${r(1, 4)})`,
    () => `${r(2, 3)}^x${vz(rz(-5, 5))}`,
    () => `log[${r(2, 5)}](x)${vz(rz(-3, 3))}`,
    () => `x^${r(2, 4)}*e^(-x)`,
    () => `sin(x)${vz(rz(-2, 2))}cos(${r(1, 3)}x)`,
    () => `sqrt(${r(4, 16)}-x^2)`,
    () => `x^3${vz(rz(-6, 6))}x^2${vz(rz(-9, 9))}x${vz(rz(-9, 9))}`,
    // biquadratisch (Substitution z = x²): (x² − p)(x² − q) bzw. mit einer negativen z-Lösung
    () => { const a = r(1, 3); let b = r(1, 4); while (b === a) b = r(1, 4); return `x^4${vz(-(a * a + b * b))}x^2${vz(a * a * b * b)}`; },
    () => { const a = r(1, 4), c = r(1, 5); return `x^4${vz(c - a * a)}x^2${vz(-a * a * c)}`; },
    () => { const p = r(2, 4); return `x^4${vz(-2 * p)}x^2${vz(r(1, p * p - 1))}`; },
    () => `ln(x)/x^${r(1, 2)}`,
    () => `(x^2${vz(rz(-4, 4))})*e^(${rz(-1, 1)}x)`,
    () => `tan(x/${r(1, 2)})`,
  ];
  return vorlagen[r(0, vorlagen.length - 1)]().replace(/\+-/g, "-").replace(/--/g, "+");
}

/* Steht die Schreibmarke am Ende eines Exponenten ^( … ), der schon fertig ist
   (eine Zahl, x, −x, e oder π), dann schreibt + bzw. − hinter der Potenz weiter
   und nicht im Exponenten: e^(x) + 2 statt e^(x+2). Längere Exponenten wie
   e^(2x … bleiben offen – dort geht es mit → hinaus. */
const FERTIGER_EXPONENT = /^-?(\d+([.,]\d+)?|x|e|pi|π)$/;
export function hinterFertigemExponenten(t, p) {
  if (t[p] !== ")") return p;
  let tiefe = 0;
  for (let i = p - 1; i >= 0; i--) {
    if (t[i] === ")") tiefe++;
    else if (t[i] === "(") {
      if (tiefe > 0) { tiefe--; continue; }
      if (t[i - 1] !== "^") return p;
      return FERTIGER_EXPONENT.test(t.slice(i + 1, p)) ? p + 1 : p;
    }
  }
  return p;
}

export function Tastenfeld({ wert: text, setWert, pos, setPos, kompakt, onOk, fuellen }) {
  // fuellen: das Tastenfeld füllt die Höhe seines Eltern-Elements genau aus (Vollbild-Eingabe auf dem Handy).
  // Alle acht Tastenreihen sind dann gleich hoch: Rahmen (3 Reihen + Innenabstand 6 + Rand 1,5) und Grundtasten (5 Reihen).
  const TH = kompakt ? 34 : 46, TG = kompakt ? 5 : 6;
  const [vonX, setVonX] = useState(true);
  // Desktop-Anordnung: ist das Tastenfeld mindestens BREIT_AB px breit (und nicht im Handy-Vollbild), steht es zweispaltig –
  // links Funktionen, rechts Zahlen. Gemessen wird das Tastenfeld selbst, nicht der Bildschirm.
  const BREIT_AB = 500;
  const wurzel = useRef(null);
  const [breit, setBreit] = useState(false);
  useLayoutEffect(() => {
    const el = wurzel.current;
    if (!el || fuellen || kompakt) { setBreit(false); return undefined; }
    const messen = () => setBreit(el.getBoundingClientRect().width >= BREIT_AB);
    messen();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(messen);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fuellen, kompakt, breit]); // breit: das gemessene Element wechselt mit der Anordnung, der Beobachter hängt sich neu an
  const setzen = (t, p) => { setWert(t); setPos(Math.max(0, Math.min(p, t.length))); };
  const einfuegen = (s) => {
    let t = text, p = pos;
    if (s === ")" && t[p] === ")") { setPos(p + 1); return; }   // schließende Klammer: steht schon eine, nur darüber hinweg (wie beim Taschenrechner)
    if ((s === "+" || s === "-") && t[p] === ")") p = hinterFertigemExponenten(t, p);
    if (t[p] === PLATZ) t = t.slice(0, p) + s + t.slice(p + 1);
    else t = t.slice(0, p) + s + t.slice(p);
    const rel = s.indexOf(PLATZ);
    setzen(t, rel >= 0 ? p + rel : p + s.length);
  };
  const zurueck = () => {
    if (pos === 0) return;
    const vorne = text.slice(0, pos);
    const einheit = LOESCH_EINHEITEN.find((e) => vorne.endsWith(e));
    const n = einheit ? einheit.length : 1;
    setzen(text.slice(0, pos - n) + text.slice(pos), pos - n);
  };
  const klick = (t) => {
    if (t.aktion === "platz") return setPos(naechsterPlatz(text, pos));
    if (t.aktion === "leer") return setzen("", 0);
    if (t.aktion === "links") return setPos(stelleLinks(text, pos));
    if (t.aktion === "rechts") return setPos(stelleRechts(text, pos));
    if (t.aktion === "zurueck") return zurueck();
    if (t.aktion === "ok") return onOk && onOk();
    einfuegen(vonX && t.ex ? t.ex : t.e);
  };
  const stil = (art) => {
    if (art === "fn") return { bg: C.weiss, fg: C.see, rand: "#C7D8EF" };
    if (art === "op") return { bg: C.gruen, fg: C.weiss, rand: C.gruen };
    if (art === "var") return { bg: "#FFF4CC", fg: C.seeTief, rand: "#F0DC8A" };
    if (art === "nav") return { bg: C.seeTief, fg: C.flaggold, rand: C.seeTief };
    if (art === "ok") return { bg: C.smaragd, fg: C.weiss, rand: C.smaragd };
    return { bg: C.weiss, fg: C.tinte, rand: C.linie };
  };
  const Taste = ({ t, span, auto }) => {
    const s = stil(t.art);
    const z = vonX && t.zx ? t.zx : t.z;
    return (
      <button onClick={() => klick(t)} aria-label={t.titel || z} className="adv-taste"
        style={{ gridColumn: span ? `span ${span}` : undefined, height: fuellen || auto ? "auto" : TH, background: s.bg, color: s.fg,
          border: `1px solid ${s.rand}`, borderRadius: 12, fontSize: z.length > 6 ? "clamp(10px, 2.9vw, 12px)" : z.length > 5 ? "clamp(11px, 3.2vw, 12.5px)" : z.length > 3 ? 13.5 : 17, whiteSpace: "nowrap", overflow: "hidden", minWidth: 0,
          fontWeight: t.art === "op" || t.art === "nav" || t.art === "ok" ? 700 : 600, fontFamily: "inherit", cursor: "pointer",
          letterSpacing: t.art === "ok" ? "0.04em" : undefined,
          padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontStyle: t.art === "var" && t.z === "x" ? "italic" : "normal", boxShadow: "0 1px 0 rgba(15,26,51,0.06)" }}>
        {z}
      </button>
    );
  };
  /* Desktop: links die Funktionsbox (Umschalter f(x) | f(…) oben, 4 × 3 Funktionstasten) mit ←, →, ⌫, Clear, OK darunter;
     rechts Zahlenblock in vier Spalten (7 8 9 + / 4 5 6 − / 1 2 3 × / 0 , x ÷) und darunter die übrigen Tasten. */
  if (breit) {
    const zahl = (z, e) => ({ z, e });
    // vier Spalten: 7 8 9 + / 4 5 6 − / 1 2 3 × / 0 , x ÷
    const zahlenblock = [
      zahl("7", "7"), zahl("8", "8"), zahl("9", "9"), { z: "+", e: "+", art: "op" },
      zahl("4", "4"), zahl("5", "5"), zahl("6", "6"), { z: "−", e: "-", art: "op" },
      zahl("1", "1"), zahl("2", "2"), zahl("3", "3"), { z: "×", e: "*", art: "op" },
      zahl("0", "0"), zahl(",", ","), { z: "x", e: "x", art: "var" }, { z: "÷", e: "/", art: "op" },
    ];
    const uebrige = [
      { z: "▯/▯", e: `(${PLATZ})/(${PLATZ})`, art: "op", titel: "Bruch" }, { z: "▯ⁿ", e: `^(${PLATZ})`, art: "op", titel: "hoch" },
      { z: "(", e: "(", art: "op" }, { z: ")", e: ")", art: "op" },
      { z: "e", e: "e", art: "var" }, { z: "π", e: "pi", art: "var" },
      { z: "▯ →", e: null, art: "nav", aktion: "platz", titel: "Nächster Platzhalter – danach aus der Klammer heraus" },
    ];
    return (
      <div ref={wurzel} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: 12, alignItems: "stretch" }}>
        <style>{`.adv-taste{transition:transform .08s ease, filter .12s ease}
          .adv-taste:active{transform:scale(0.93);filter:brightness(0.93)}`}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: TG, minWidth: 0 }}>
          <div style={{ padding: 6, borderRadius: 16, background: "#F1F5FB", border: "1.5px solid rgba(0,77,152,0.28)", display: "flex", flexDirection: "column", gap: TG }}>
            <div role="group" aria-label="Funktionstasten einfügen als" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: TG }}>
              {[[true, "f(x)", "Funktion direkt mit x einfügen, z. B. sin x"], [false, "f(…)", "Klammer öffnen zum Verketten, z. B. sin(x²)"]].map(([wert, name, titel]) => {
                const an = vonX === wert;
                return (
                  <button key={name} type="button" onClick={() => setVonX(wert)} aria-pressed={an} title={titel}
                    style={{ height: TH, borderRadius: 12, fontFamily: "inherit", cursor: "pointer", padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center",
                      border: an ? "none" : "1px solid #C7D8EF", fontSize: 16, fontWeight: 800, whiteSpace: "nowrap",
                      color: an ? C.flaggold : C.see,
                      background: an ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : C.weiss,
                      boxShadow: an ? "0 4px 12px rgba(0,77,152,0.3)" : "none" }}>
                    {name}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gridTemplateRows: `repeat(3, ${TH}px)`, gap: TG }}>
              {FN_TASTEN.map((t, i) => <Taste key={i} t={t} />)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: TG, flex: 1, minHeight: TH }}>
            <Taste auto t={{ z: "←", art: "nav", aktion: "links", titel: "Schreibmarke nach links" }} />
            <Taste auto t={{ z: "→", art: "nav", aktion: "rechts", titel: "Schreibmarke nach rechts" }} />
            {onOk ? (
              <>
                <Taste auto t={{ z: "⌫", art: "nav", aktion: "zurueck", titel: "Löschen" }} />
                <Taste auto t={{ z: "Clear", art: "nav", aktion: "leer", titel: "Clear – alles löschen" }} span={2} />
                <Taste auto t={{ z: "OK", art: "ok", aktion: "ok", titel: "OK – Eingabe prüfen" }} span={2} />
              </>
            ) : (
              <>
                <Taste auto t={{ z: "⌫", art: "nav", aktion: "zurueck", titel: "Löschen" }} span={2} />
                <Taste auto t={{ z: "Clear", art: "nav", aktion: "leer", titel: "Clear – alles löschen" }} span={3} />
              </>
            )}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(28, minmax(0, 1fr))", gridTemplateRows: `repeat(5, minmax(${TH}px, 1fr))`, gap: TG, minWidth: 0 }}>
          {zahlenblock.map((t, i) => <Taste auto key={"z" + i} t={t} span={7} />)}
          {uebrige.map((t, i) => <Taste auto key={"u" + i} t={t} span={4} />)}
        </div>
      </div>
    );
  }
  return (
    <div ref={wurzel} style={fuellen ? { height: "100%", minHeight: 0, display: "grid", rowGap: 8,
      gridTemplateRows: `calc((100% - ${6 * TG + 15 + 8}px) * 3 / 8 + ${2 * TG + 15}px) minmax(0, 1fr)` } : undefined}>
      <style>{`.adv-taste{transition:transform .08s ease, filter .12s ease}
        .adv-taste:active{transform:scale(0.93);filter:brightness(0.93)}`}</style>
      {/* Box: alle Funktionstasten, auf die „von x / von ?“ wirkt — der Umschalter steht links als Teil der Box */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(58px, 0.95fr) repeat(4, minmax(0, 1fr))", gridTemplateRows: fuellen ? "repeat(3, minmax(0, 1fr))" : `repeat(3, ${TH}px)`, gap: TG, minHeight: 0,
        padding: kompakt ? 5 : 6, marginBottom: fuellen ? 0 : kompakt ? 6 : 8, borderRadius: 16, background: "#F1F5FB", border: "1.5px solid rgba(0,77,152,0.28)" }}>
        <div role="group" aria-label="Funktionstasten einfügen als" style={{ gridRow: "1 / 4", display: "flex", flexDirection: "column", gap: TG }}>
          {[[true, "von x", "sin x", "Funktion direkt mit x einfügen, z. B. sin x"], [false, "von ?", "sin(?)", "Klammer öffnen zum Verketten, z. B. sin(x²)"]].map(([wert, name, bsp, titel]) => {
            const an = vonX === wert;
            return (
              <button key={name} type="button" onClick={() => setVonX(wert)} aria-pressed={an} title={titel}
                style={{ flex: 1, borderRadius: 12, fontFamily: "inherit", cursor: "pointer", padding: "0 4px", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 2,
                  border: an ? "none" : "1px solid #C7D8EF",
                  background: an ? `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` : C.weiss,
                  boxShadow: an ? "0 4px 12px rgba(0,77,152,0.3)" : "none" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: an ? C.flaggold : C.see, whiteSpace: "nowrap" }}>{name}</span>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: an ? "#C9D6EE" : C.hellgrau, whiteSpace: "nowrap" }}>{bsp}</span>
              </button>
            );
          })}
        </div>
        {FN_TASTEN.map((t, i) => <Taste key={i} t={t} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: TG, minHeight: 0,
        gridTemplateRows: fuellen ? "repeat(5, minmax(0, 1fr))" : undefined }}>
        {TASTEN.map((t, i) => <Taste key={i} t={t} span={t.span} />)}
        <Taste t={{ z: "←", art: "nav", aktion: "links", titel: "Schreibmarke nach links" }} />
        <Taste t={{ z: "→", art: "nav", aktion: "rechts", titel: "Schreibmarke nach rechts" }} />
        {onOk ? (
          <>
            <Taste t={{ z: "⌫", art: "nav", aktion: "zurueck", titel: "Löschen" }} />
            <Taste t={{ z: "Clear", art: "nav", aktion: "leer", titel: "Clear – alles löschen" }} />
            <Taste t={{ z: "OK", art: "ok", aktion: "ok", titel: "OK – Eingabe prüfen" }} span={2} />
          </>
        ) : (
          <>
            <Taste t={{ z: "⌫", art: "nav", aktion: "zurueck", titel: "Löschen" }} span={2} />
            <Taste t={{ z: "Clear", art: "nav", aktion: "leer", titel: "Clear – alles löschen" }} span={2} />
          </>
        )}
      </div>
    </div>
  );
}

function Eingabe({ text, setText, onFertig, bereit }) {
  const [pos, setPos] = useState(text.length);
  const [tippen, setTippen] = useState(false);
  const offen = true;   // Eingabe-Phase: Tastenfeld immer da; „Fertig“ zeigt Ableitungen, Punkte und Schaubild
  const baum = useMemo(() => parse(text), [text]);
  // Auch ein unvollständiger Term wird beim Tippen als Formel gesetzt (nie als Rohtext)
  const tex = useMemo(() => liveTex(text), [text]);
  const marke = offen && !tippen;   // Schreibmarke zeigen und per Klick setzen, solange das Tastenfeld offen ist
  const unfertig = baum && hatBox(baum);

  return (
    <div>
      {/* Anzeige */}
      <div style={{ background: C.weiss, border: `1.5px solid ${tex || !text ? C.linie : C.signal}`, borderRadius: 14,
        padding: "12px 14px", minHeight: 64, overflowX: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>f(x) =</span>
        {marke ? (
          <span style={{ fontSize: 21, lineHeight: 1.9 }}>
            <EingabeFormel text={text} pos={pos} setPos={setPos}
              hinweis={<span style={{ fontSize: 15, color: C.hellgrau, fontWeight: 300, marginLeft: 6 }}>Tippe eine Funktion ein …</span>} />
          </span>
        ) : text ? (
          tex ? <span style={{ fontSize: 21, lineHeight: 1.9 }}><M t={tex} /></span>
            : <span style={{ fontSize: 21, lineHeight: 1.9, whiteSpace: "pre" }}>{text}</span>
        ) : (
          <span style={{ fontSize: 15, color: C.hellgrau, fontWeight: 300 }}>Tippe eine Funktion ein …</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "6px 2px 10px" }}>
        <p style={{ flex: 1, minWidth: 0, fontSize: 12, color: C.hellgrau, fontWeight: 300, margin: 0, wordBreak: "break-all", minHeight: 16, paddingTop: 5 }}>
          {offen && <>{text.slice(0, pos)}<span style={{ color: C.gruen, fontWeight: 700 }}>|</span>{text.slice(pos)}</>}
          {!baum && text && <span style={{ color: C.signal, marginLeft: offen ? 8 : 0 }}>{offen ? "· " : ""}noch nicht vollständig</span>}
          {unfertig && <span style={{ color: C.gruenDunkel, marginLeft: offen ? 8 : 0 }}>{offen ? "· " : ""}Platzhalter ▯ füllen</span>}
        </p>
        <button type="button" onClick={() => bereit && onFertig()} disabled={!bereit} data-kd-fertig
          style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 16px", borderRadius: 999, fontFamily: "inherit",
            cursor: bereit ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, border: "none", opacity: bereit ? 1 : 0.45,
            background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
          Fertig <span aria-hidden="true" style={{ color: C.flaggold }}>✓</span>
        </button>
      </div>

      {offen && <div id="adv-eingabe" data-aufklapp-inhalt>

      {tippen ? (
        <div>
          <MatheFeld modus="formel" value={text} onChange={(e) => { setText(e.target.value); setPos(e.target.value.length); }}
            placeholder="z. B. x^2*sin(x) oder log[2](x+1)" autoCapitalize="off" autoCorrect="off" spellCheck="false"
            style={{ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 12, border: `1.5px solid ${C.linie}`,
              padding: "0 12px", fontSize: 16, fontFamily: "ui-monospace, Menlo, monospace", color: C.tinte }} />
          <p style={{ fontSize: 12, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>
            Schreibweise: <b>^</b> hoch, <b>/</b> geteilt, <b>sqrt(…)</b> Wurzel, <b>ln(…)</b>, <b>log(…)</b> zur Basis 10,
            <b> log[a](…)</b> zur Basis a, <b>e^(…)</b>, <b>pi</b>.
          </p>
        </div>
      ) : (
        <Tastenfeld wert={text} setWert={setText} pos={pos} setPos={setPos} onOk={() => bereit && onFertig()} />
      )}

      {/* Spielerische Schnellstarts */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 10 }}>
        <button onClick={() => { const t = zufallsFunktion(); setText(t); setPos(t.length); }}
          style={{ flex: 1, height: 42, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 14, fontWeight: 700, color: C.seeTief, background: C.flaggold, boxShadow: "0 3px 10px rgba(237,187,0,0.35)" }}>
          🎲 Zufallsfunktion
        </button>
        <button onClick={() => setTippen(!tippen)}
          style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${C.linie}`, cursor: "pointer",
            fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: C.see, background: C.weiss }}>
          {tippen ? "Tastenfeld zeigen" : "Selbst tippen"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
        {BEISPIELE.map(([n, t]) => (
          <button key={t} onClick={() => { setText(t); setPos(t.length); }}
            style={{ flexShrink: 0, padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.linie}`,
              background: text === t ? C.see : C.weiss, color: text === t ? C.weiss : C.see, fontSize: 12.5,
              fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>{n}</button>
        ))}
      </div>
      </div>}
    </div>
  );
}

/* Schaubild wie im Polynom-Plotter (gleiche Farben, Punkte, Zoom unten rechts):
   f, f′ und f″, Nullstellen, Extrem- und Wendepunkte, y-Achsenabschnitt, Polstellen gestrichelt.
   Der Ausschnitt richtet sich nach den markanten Punkten (beliebige Funktionen haben kein festes Zentrum). */
function KdBild({ A, Sx, Sy, desktop }) {
  const [zoom, setZoom] = useState(1);
  const ok = endlich;
  const punkte = [...A.ns.map((x) => ({ x, y: 0 })), ...A.ext, ...A.wende];
  const xs = [...(A.yAchse !== null ? [0] : []), ...punkte.map((p) => p.x), ...A.pole.map((p) => p.x)];
  let xMin, xMax;
  if (xs.length) {
    xMin = Math.min(...xs); xMax = Math.max(...xs);
    const sp = Math.max(xMax - xMin, 2);
    xMin -= sp * 0.2 + 0.6; xMax += sp * 0.2 + 0.6;
  } else { xMin = A.L / 2; xMax = A.R / 2; }
  xMin = Math.max(xMin, A.L); xMax = Math.min(xMax, A.R);
  const mx = (xMin + xMax) / 2, hx = ((xMax - xMin) / 2) / zoom;
  xMin = Math.max(A.L, mx - hx); xMax = Math.min(A.R, mx + hx);
  const yW = [0, ...(A.yAchse !== null ? [A.yAchse] : []), ...punkte.map((p) => p.y)].filter(ok);
  let yMin = Math.min(...yW), yMax = Math.max(...yW);
  const grenze = Math.max(yMax - yMin, 2) * 0.8;
  for (let i = 0; i <= 300; i++) {
    const y = A.f(xMin + ((xMax - xMin) * i) / 300);
    if (ok(y) && y >= yMin - grenze && y <= yMax + grenze) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  }
  const ys = Math.max(yMax - yMin, 2);
  yMin -= ys * 0.12; yMax += ys * 0.12;
  const px = (x) => ((x - xMin) / (xMax - xMin)) * Sx;
  const py = (y) => Sy - ((y - yMin) / (yMax - yMin)) * Sy;

  const pfad = (g) => {
    let d = "", offen = false, vorher = null;
    const hoehe = yMax - yMin;
    for (let i = 0; i <= 900; i++) {
      const x = xMin + ((xMax - xMin) * i) / 900;
      const y = g(x);
      if (!ok(y) || y < yMin - hoehe * 3 || y > yMax + hoehe * 3) { offen = false; vorher = null; continue; }
      if (vorher !== null && Math.abs(y - vorher) > hoehe * 1.5 && Math.sign(y) !== Math.sign(vorher)) offen = false;
      d += `${offen ? "L" : "M"} ${px(x).toFixed(1)} ${py(y).toFixed(1)} `;
      offen = true; vorher = y;
    }
    return d;
  };
  const sX = schoenerSchritt((xMax - xMin) / 2), sY = schoenerSchritt((yMax - yMin) / 2);
  const gx = []; for (let v = Math.ceil(xMin / sX) * sX; v <= xMax; v += sX) gx.push(Math.round(v * 1000) / 1000);
  const gy = []; for (let v = Math.ceil(yMin / sY) * sY; v <= yMax; v += sY) gy.push(Math.round(v * 1000) / 1000);
  const farbe = (art) => (art === "Wendepunkt" ? C.tinte : art === "Sattelpunkt" ? C.hellgrau : C.gruenDunkel);
  const knopf = { width: 34, height: 34, background: C.weiss, border: "none", fontSize: 18, color: C.see,
    cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={{ position: "relative", marginTop: desktop ? 0 : 14 }}>
      <svg viewBox={`0 0 ${Sx} ${Sy}`} data-kd-bild style={{ width: "100%", maxWidth: desktop ? "none" : 360, display: "block", margin: "0 auto" }}>
        <defs><clipPath id="kdfeld"><rect x="0" y="0" width={Sx} height={Sy} /></clipPath></defs>
        {gx.map((v) => <line key={`gx${v}`} x1={px(v)} y1={0} x2={px(v)} y2={Sy} stroke={C.linie} strokeWidth="1" />)}
        {gy.map((v) => <line key={`gy${v}`} x1={0} y1={py(v)} x2={Sx} y2={py(v)} stroke={C.linie} strokeWidth="1" />)}
        {yMin <= 0 && yMax >= 0 && <line x1={0} y1={py(0)} x2={Sx} y2={py(0)} stroke={C.hellgrau} strokeWidth="1.5" />}
        {xMin <= 0 && xMax >= 0 && <line x1={px(0)} y1={0} x2={px(0)} y2={Sy} stroke={C.hellgrau} strokeWidth="1.5" />}
        {gx.filter((v) => Math.abs(v) > 1e-9).map((v) => (
          <text key={`lx${v}`} x={px(v)} y={Math.min(Math.max(py(0) + 13, 10), Sy - 3)} fontSize="9" fill={C.hellgrau} textAnchor="middle">{wert(v)}</text>
        ))}
        {gy.filter((v) => Math.abs(v) > 1e-9).map((v) => (
          <text key={`ly${v}`} x={Math.min(Math.max(px(0) - 6, 16), Sx - 2)} y={py(v) + 3} fontSize="9" fill={C.hellgrau} textAnchor="end">{wert(v)}</text>
        ))}
        <g clipPath="url(#kdfeld)">
          {A.pole.map((p, i) => (
            <line key={`p${i}`} x1={px(p.x)} y1={0} x2={px(p.x)} y2={Sy} stroke={C.hellgrau} strokeWidth="1.2" strokeDasharray="4 4" opacity="0.8" />
          ))}
          <path d={pfad(A.fss)} stroke={C.ablGrau} strokeWidth="1.8" fill="none" opacity="0.55" strokeDasharray="5 4" strokeLinejoin="round" />
          <path d={pfad(A.fs)} stroke={C.seeHell} strokeWidth="2" fill="none" opacity="0.7" strokeLinejoin="round" />
          <path d={pfad(A.f)} stroke={C.see} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          {A.ns.map((x, i) => <circle key={`n${i}`} cx={px(x)} cy={py(0)} r="4.5" fill={C.weiss} stroke={C.see} strokeWidth="2.5" />)}
          {A.ext.map((p, i) => ok(p.y) && <circle key={`e${i}`} cx={px(p.x)} cy={py(p.y)} r="5.5" fill={farbe(p.art)} />)}
          {A.wende.filter((p) => p.art === "Wendepunkt").map((p, i) => <circle key={`w${i}`} cx={px(p.x)} cy={py(p.y)} r="5.5" fill={farbe(p.art)} />)}
          {A.yAchse !== null && <circle cx={px(0)} cy={py(A.yAchse)} r="4" fill={C.see} opacity="0.45" />}
        </g>
      </svg>
      <div style={{ position: "absolute", right: 8, bottom: 8, display: "flex", flexDirection: "column",
        borderRadius: 10, overflow: "hidden", border: `1px solid ${C.linie}`, boxShadow: "0 2px 8px rgba(15,26,51,0.18)" }}>
        <button onClick={() => setZoom((z) => Math.min(z * 1.3, 20))} style={{ ...knopf, borderBottom: `1px solid ${C.linie}` }} aria-label="Hineinzoomen">+</button>
        <button onClick={() => setZoom((z) => Math.max(z / 1.3, 0.3))} style={knopf} aria-label="Herauszoomen">−</button>
      </div>
    </div>
  );
}

function Diskussion({ inhalt }) {
  return (
    <div>
      {inhalt.abschnitte.map((sek, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: C.see, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.linie}` }}>
            {sek.titel}
          </p>
          {sek.zeilen.map((zl, j) => zl.formel ? (
            <div key={j} style={{ overflowX: "auto" }}>
              <p style={{ fontSize: 14.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau, marginBottom: 6, whiteSpace: "nowrap" }}><M t={zl.txt} /></p>
            </div>
          ) : zl.tex ? (
            <div key={j} style={{ overflowX: "auto" }}>
              <p style={{ fontSize: 14.5, color: C.tinte, marginBottom: 6, whiteSpace: "nowrap" }}><M t={zl.tex} /></p>
            </div>
          ) : zl.prosa ? (
            <p key={j} style={{ fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau, lineHeight: 1.7, marginBottom: 6 }}>{zl.txt}</p>
          ) : (
            <div key={j} style={{ overflowX: "auto" }}>
              <p style={{ fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau, lineHeight: 1.7, whiteSpace: "pre", marginBottom: 3 }}>{zl.txt}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* Vollständige Kurvendiskussion einer beliebigen Funktion als PDF – gemeinsam genutzt vom
   Advanced Plotter und vom Download am Ende der Steckbriefaufgaben. */
export async function diskussionPdfAusText(text, fenster, untertitel = "Kurvendiskussion · Advanced Plotter") {
  const baum = parse(text);
  if (!baum || hatBox(baum)) throw new Error("Funktion nicht lesbar: " + text);
  const A = analysiere(baum, -fenster, fenster);
  const inhalt = baueAllgemeineDiskussion(baum, A);
  const { allgemeinesPdf } = await import("./func11.jsx");
  const fT = alsText(ohnePar(baum));
  await allgemeinesPdf({
    kopf: {
      f: `f(x) = ${fT}`, f1: `f′(x) = ${alsText(A.d1)}`, f2: `f″(x) = ${alsText(A.d2)}`,
      fuss: `Kurvendiskussion für f(x) = ${fT}`, untertitel,
    },
    inhalt,
    modell: {
      f: A.f, ns: A.ns, mark: [...A.ext, ...A.wende.filter((p) => p.art === "Wendepunkt")],
      yAchse: A.yAchse, integrale: A.integrale.map((iv) => [iv.x1, iv.x2]), fenster: { xMin: A.L, xMax: A.R },
    },
    dateiname: `Kurvendiskussion_${text.replace(/[^\w+\-]/g, "").slice(0, 40) || "Funktion"}.pdf`,
  });
}

/* Kurvendiskussion · Beliebige Funktionen – aufgebaut wie der Polynom-Plotter:
   erst die Funktion eingeben (Tastenfeld), nach „Fertig“ links f, f′, f″ und die markanten Punkte,
   rechts das Schaubild; darunter der Knopf zur ausführlichen Kurvendiskussion. */
const LISTE_KURZ = 6;
export function AdvancedPlotter() {
  const [text, setText] = useState(() => (uebergabeLesen("advplotter") || {}).text || "x*e^(-x)");
  useEffect(() => { uebergabeErledigt("advplotter"); }, []);
  const fenster = 10;
  const [eingabe, setEingabe] = useState(false);   // Startfunktion steht: gleich Ergebnis zeigen
  const [offen, setOffen] = useState(false);
  const [pdfStatus, setPdfStatus] = useState("bereit");
  const ergebnisRef = useRef(null);
  const desktop = useDesktop();
  const [bildRef, bildBreite] = useBreite();
  const baum = useMemo(() => parse(text), [text]);
  const bereit = !!baum && !hatBox(baum);
  const A = useMemo(() => {
    if (!bereit) return null;
    try { return analysiere(baum, -fenster, fenster); } catch (e) { console.error(e); return null; }
  }, [baum, bereit, fenster]);
  const inhalt = useMemo(() => (A && offen ? baueAllgemeineDiskussion(baum, A) : null), [A, baum, offen]);

  const pdf = async () => {
    if (!A || pdfStatus === "laeuft") return;
    setPdfStatus("laeuft");
    try { await diskussionPdfAusText(text, fenster); setPdfStatus("bereit"); }
    catch (err) { console.error(err); setPdfStatus("fehler"); }
  };
  const fertig = () => { setEingabe(false); setOffen(false); };
  const aendern = () => { setEingabe(true); setOffen(false); };
  const diskussionUmschalten = () => {
    const neu = !offen;
    setOffen(neu);
    if (neu) setTimeout(() => { try { ergebnisRef.current && springe("kurvendiskussion-ergebnis", () => ergebnisRef.current.scrollIntoView({ behavior: "smooth", block: "start" })); } catch (err) { /* egal */ } }, 80);
  };

  const karte = { background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const rahmen = (kinder) => <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>{kinder}</div>;

  /* 1. Eingabe-Phase */
  if (eingabe || !A) return rahmen(
    <div style={karte}>
      <Eingabe text={text} setText={setText} onFertig={fertig} bereit={!!A} />
    </div>
  );

  /* 2. Ergebnis: Kopf (f, f′, f″), markante Punkte, Schaubild – wie bei den Polynomen */
  const kopf = (
    <div data-kd-kopf>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: 0 }}>Beliebige Funktion</p>
        <button type="button" onClick={aendern}
          style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 999, fontFamily: "inherit",
            cursor: "pointer", fontSize: 12.5, fontWeight: 700, border: `1px solid ${C.see}`, color: C.weiss,
            background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
          <span aria-hidden="true" style={{ color: C.flaggold }}>✎</span>Funktion eingeben
        </button>
      </div>
      <div style={{ background: "#F4F7FC", borderRadius: 12, padding: "10px 12px", overflowX: "auto" }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap", margin: 0 }}><M t={`f(x) = ${alsTex(baum)}`} /></p>
      </div>
      <div style={{ padding: "8px 12px 0", overflowX: "auto" }}>
        <p style={{ fontSize: 15, color: C.grau, whiteSpace: "nowrap", margin: "0 0 4px" }}><M t={`f′(x) = ${alsTex(A.d1)}`} /></p>
        <p style={{ fontSize: 15, color: C.grau, whiteSpace: "nowrap", margin: 0 }}><M t={`f″(x) = ${alsTex(A.d2)}`} /></p>
      </div>
    </div>
  );

  const liste = (werte, fmt) => (werte.length > LISTE_KURZ ? `${werte.slice(0, LISTE_KURZ).map(fmt).join("   ")}   …` : werte.map(fmt).join("   "));
  const tief = (i, n) => (n > 1 ? (i < 9 ? "₁₂₃₄₅₆₇₈₉"[i] : String(i + 1)) : "");
  const farbe = (art) => (art === "Wendepunkt" ? C.tinte : art === "Sattelpunkt" ? C.hellgrau : C.gruenDunkel);
  const wendepunkte = A.wende.filter((p) => p.art === "Wendepunkt");
  const punkte = (<>
    <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 14 }}>Markante Punkte</p>
    <Zeile marke={<circle cx="7" cy="7" r="4.5" fill={C.weiss} stroke={C.see} strokeWidth="2.5" />}
      titel="Nullstellen" wert={A.ns.length ? liste(A.ns, (x, i) => `x${tief(i, A.ns.length)} = ${zahl2(x)}`) : "keine Nullstellen"} />
    {A.ext.slice(0, LISTE_KURZ).map((p, i) => (
      <Zeile key={`e${i}`} marke={<circle cx="7" cy="7" r="5" fill={farbe(p.art)} />} titel={p.art} wert={`(${zahl2(p.x)} | ${zahl2(p.y)})`} />
    ))}
    {wendepunkte.slice(0, LISTE_KURZ).map((p, i) => (
      <Zeile key={`w${i}`} marke={<circle cx="7" cy="7" r="5" fill={farbe(p.art)} />} titel={p.art} wert={`(${zahl2(p.x)} | ${zahl2(p.y)})`} />
    ))}
    {!A.ext.length && !wendepunkte.length && (
      <Zeile marke={<circle cx="7" cy="7" r="5" fill={C.linie} />} titel="Extrem- und Wendepunkte" wert="keine" />
    )}
    {(A.ext.length > LISTE_KURZ || wendepunkte.length > LISTE_KURZ) && (
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, margin: "-4px 0 10px 24px" }}>… weitere im Bereich −10 bis 10 (periodisch)</p>
    )}
    {A.yAchse !== null && (
      <Zeile marke={<circle cx="7" cy="7" r="4" fill={C.see} opacity="0.45" />} titel="y-Achsenabschnitt" wert={`(0 | ${zahl2(A.yAchse)})`} />
    )}
    {A.pole.length > 0 && (
      <Zeile marke={<line x1="7" y1="0" x2="7" y2="14" stroke={C.hellgrau} strokeWidth="1.6" strokeDasharray="3 2" />}
        titel="Polstellen" wert={liste(A.pole.map((p) => p.x), (x) => `x = ${zahl2(x)}`)} />
    )}
  </>);

  const legende = (
    <div className="flex flex-wrap justify-center" style={{ gap: 18, marginTop: 8 }}>
      {[["f", C.see, false], ["f′", C.seeHell, false], ["f″", C.ablGrau, true]].map(([n, f, gestrichelt]) => (
        <span key={n} className="flex items-center" style={{ gap: 7, fontSize: 12.5, color: C.grau }}>
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={f} strokeWidth="2.5" strokeDasharray={gestrichelt ? "5 4" : "0"} /></svg>
          {n}
        </span>
      ))}
    </div>
  );

  const Sx = desktop && bildBreite ? bildBreite : 320, Sy = desktop && bildBreite ? Math.round(bildBreite * 0.86) : 224;
  const schaubild = <KdBild key={text} A={A} Sx={Sx} Sy={Sy} desktop={desktop} />;

  const diskKnopf = (
    <button type="button" className="kd-knopf" aria-expanded={offen} onClick={diskussionUmschalten}
      style={{ marginTop: 18, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        padding: "15px 18px", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", fontSize: 15.5, fontWeight: 700,
        color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, boxShadow: "0 6px 20px rgba(0,77,152,0.25)" }}>
      {offen ? (desktop ? "Rechenweg ausblenden" : "Kurvendiskussion ausblenden") : (desktop ? "Kurvendiskussion mit Rechenweg" : "Kurvendiskussion")}
    </button>
  );

  const ausfuehrlich = inhalt && (
    <div style={{ ...karte, marginTop: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Kurvendiskussion</p>
      <Diskussion inhalt={inhalt} />
      <button onClick={pdf} disabled={pdfStatus === "laeuft"}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8,
          padding: "15px 18px", border: "none", borderRadius: 14, cursor: pdfStatus === "laeuft" ? "wait" : "pointer",
          fontFamily: "inherit", fontSize: 15.5, fontWeight: 700, color: C.weiss,
          background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, boxShadow: "0 6px 20px rgba(0,77,152,0.25)",
          opacity: pdfStatus === "laeuft" ? 0.75 : 1 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.flaggold} strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" />
        </svg>
        {pdfStatus === "laeuft" ? "PDF wird erstellt …" : "Kurvendiskussion als PDF herunterladen"}
      </button>
      {pdfStatus === "fehler" && (
        <p style={{ fontSize: 12.5, color: C.signal, marginTop: 8, textAlign: "center" }}>
          Das PDF konnte nicht erstellt werden. Bitte noch einmal versuchen.
        </p>
      )}
      <WeiterMit titel="Weiter mit dieser Funktion">
        <WeiterKnopf ziel="ableitungstrainer" von="Kurvendiskussion" daten={{ text }}
          zeile="f′, f″ und f‴ dieser Funktion selbst bilden und prüfen lassen" />
        {(() => {
          const iv = A.integrale && A.integrale[0];
          const t = (v) => String(Math.round(v * 1e4) / 1e4);
          return <WeiterKnopf ziel="integrale" von="Kurvendiskussion" daten={{ f: text, a: iv ? t(iv.x1) : "0", b: iv ? t(iv.x2) : "1" }}
            zeile={iv ? "Erstes Nullstellenintegral – Stammfunktion selbst finden" : "Bestimmtes Integral von 0 bis 1 – Stammfunktion selbst finden"} />;
        })()}
      </WeiterMit>
    </div>
  );

  if (desktop) return rahmen(<>
    <Arbeitsflaeche linksBreite={400} gap={24}
      links={<>
        <FeinKarte>{kopf}</FeinKarte>
        <FeinKarte data-kd-punkte>{punkte}</FeinKarte>
      </>}
      rechts={<>
        <BildKarte style={{ padding: 0 }}>
          <div ref={bildRef}>{schaubild}</div>
        </BildKarte>
        {legende}
      </>} />
    {diskKnopf}
    {offen && <div ref={ergebnisRef} style={{ scrollMarginTop: 12 }}>{ausfuehrlich}</div>}
  </>);

  return rahmen(<>
    <div style={karte}>
      {kopf}
      {schaubild}
      {legende}
    </div>
    {diskKnopf}
    {offen && (
      <div ref={ergebnisRef} style={{ scrollMarginTop: 12 }}>
        <div style={{ ...karte, marginTop: 18 }} data-kd-punkte>{punkte}</div>
        {ausfuehrlich}
      </div>
    )}
  </>);
}

/* Hochformat-Grafik für die Startseiten-Kachel. */
export function AdvancedLogoKlein() {
  const W = 230, H = 190, x0 = 62, y0 = 104, sx = 27, sy = 26;
  const pfad = (g, von, bis) => {
    let d = "", offen = false;
    for (let i = 0; i <= 200; i++) {
      const x = von + ((bis - von) * i) / 200, y = g(x);
      if (!isFinite(y) || Math.abs(y) > 3.6) { offen = false; continue; }
      d += `${offen ? "L" : "M"}${(x0 + x * sx).toFixed(1)},${(y0 - y * sy).toFixed(1)}`;
      offen = true;
    }
    return d;
  };
  const pol = 4.2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => x0 + (i - 2) * sx).map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} stroke="rgba(255,255,255,0.06)" />)}
      {Array.from({ length: 8 }, (_, i) => y0 + (i - 4) * sy).map((y) => <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.06)" />)}
      <line x1="0" y1={y0} x2={W} y2={y0} stroke="rgba(255,255,255,0.3)" />
      <line x1={x0} y1="0" x2={x0} y2={H} stroke="rgba(255,255,255,0.3)" />
      <line x1={x0 + pol * sx} y1="0" x2={x0 + pol * sx} y2={H} stroke={C.granaHell} strokeWidth="1.4" strokeDasharray="4 4" />
      <path d={pfad((x) => 1 / (pol - x) - 0.3, 2.6, pol - 0.05)} stroke={C.granaHell} strokeWidth="2" fill="none" />
      <path d={pfad((x) => 1 / (pol - x) - 0.3, pol + 0.05, 6)} stroke={C.granaHell} strokeWidth="2" fill="none" />
      <path d={pfad((x) => Math.log(x + 2.4) - 0.6, -2.35, 5.5)} stroke={C.flaggold} strokeWidth="2" fill="none" />
      <path d={pfad((x) => 2.2 * Math.sin(2 * x) * Math.exp(-0.25 * (x + 2.5)), -2.5, 3.8)} stroke={C.weiss} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <g fontSize="12" fontWeight="700" fontStyle="italic">
        <text x="10" y="20" fill={C.weiss}>sin</text>
        <text x="34" y="20" fill={C.flaggold}>ln</text>
        <text x="52" y="20" fill={C.granaHell}>1/x</text>
      </g>
    </svg>
  );
}

/* Logo für die Startseiten-Kachel: Sinus-Welle mal abklingender e-Funktion,
   Polstelle als gestrichelte Asymptote, dazu eine Logarithmus-Kurve. */
export function AdvancedLogo() {
  const W = 340, H = 170, x0 = 150, y0 = 96, sx = 26, sy = 30;
  const pfad = (g, von, bis) => {
    let d = "", offen = false;
    for (let i = 0; i <= 240; i++) {
      const x = von + ((bis - von) * i) / 240, y = g(x);
      if (!isFinite(y) || Math.abs(y) > 3.2) { offen = false; continue; }
      d += `${offen ? "L" : "M"}${(x0 + x * sx).toFixed(1)},${(y0 - y * sy).toFixed(1)}`;
      offen = true;
    }
    return d;
  };
  return (
    <svg viewBox={`0 62 ${W} 64`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => x0 + (i - 6) * sx).map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} stroke="rgba(255,255,255,0.07)" />
      ))}
      {Array.from({ length: 7 }, (_, i) => y0 + (i - 3) * sy).map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.07)" />
      ))}
      <line x1="0" y1={y0} x2={W} y2={y0} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      <line x1={x0} y1="0" x2={x0} y2={H} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      <line x1={x0 + 5 * sx} y1="0" x2={x0 + 5 * sx} y2={H} stroke={C.granaHell} strokeWidth="1.6" strokeDasharray="5 5" opacity="0.9" />
      <path d={pfad((x) => 1 / (5 - x) - 0.4, 3.2, 4.93)} stroke={C.granaHell} strokeWidth="2.2" fill="none" />
      <path d={pfad((x) => 1 / (5 - x) - 0.4, 5.07, 7)} stroke={C.granaHell} strokeWidth="2.2" fill="none" />
      <path d={pfad((x) => Math.log(x + 5.6) - 1.1, -5.55, 3)} stroke={C.flaggold} strokeWidth="2.2" fill="none" opacity="0.95" />
      <path d={pfad((x) => 2.4 * Math.sin(1.6 * x) * Math.exp(-0.18 * (x + 5.5)), -5.8, 4.6)} stroke={C.weiss} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
