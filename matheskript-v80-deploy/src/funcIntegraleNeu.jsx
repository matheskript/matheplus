/* ============================================================
   Analysis-Bereich: Integrale – Erweiterung
   · Fläche und Bilanz: Grenzen verschieben, Vorzeichen prognostizieren,
     Integral (Bilanz) und Flächeninhalt (an Nullstellen geteilt) berechnen,
     Rechtecksummen einblenden
   · Zwischen zwei Graphen: Schnittpunkte, obere/untere Funktion je
     Teilintervall, dann die Fläche
   · Bestand und Änderungsrate: Zu-/Abfluss integrieren, Bestand rekonstruieren;
     umgekehrt aus dem Bestand die Änderungsrate deuten
   · Anfangsbedingung: die Konstante C bestimmen
   Alle Aufgaben rechnen exakt mit Brüchen (rechnen2.js).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, IZ, KleinerLink, Rueck, Schaubild, Stufe, TextFeld, ZahlFeld, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import {
  bestimmt, flaeche, pAdd, pAus, pAusNullstellen, pDer, pInt, pNum, pTex, q, qAbs, qGleich, qLies, qMul, qNum, qSub, qAdd, qText, qTex, qVorz,
  teilIntervalle, wahl, zz,
} from "./rechnen2.js";
import { neuUmgekehrt, neueFlaechenAufgabe, neueZweiGraphen, neuerAnfangswert, neuerBestand } from "./aufgaben2.js";

const GR = C.smaragd, ROT = C.signal;
const sym = (z) => String(z).replace("-", "−");
const qn = (a) => qNum(a);
const zeile = { display: "flex", alignItems: "center", gap: 6, fontSize: 17, lineHeight: 1.9, whiteSpace: "nowrap", overflowX: "auto", color: C.tinte };
const loesungBox = { background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 12 };
const schritt = (nr, titel) => (
  <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "14px 0 8px" }}>
    <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 999, background: C.himmel, color: C.see, alignItems: "center", justifyContent: "center", fontSize: 11.5, marginRight: 6 }}>{nr}</span>{titel}
  </p>
);
const nstListe = (a) => a.map((r) => sym(r)).join("; ");
const mitKlammer = (a) => (a.z < 0 ? `(${qTex(a)})` : qTex(a));

/* ======================================================================
   Fläche und Bilanz
   ====================================================================== */

export function FlaecheBilanz() {
  const [aufg, setAufg] = useState(neueFlaechenAufgabe);
  const [a, setA] = useState(aufg.a);
  const [b, setB] = useState(aufg.b);
  const [rechtecke, setRechtecke] = useState(false);
  const [nR, setNR] = useState(8);
  const [vz, setVz] = useState(null);
  const [schaetz, setSchaetz] = useState("");
  const [antI, setAntI] = useState("");
  const [antA, setAntA] = useState("");
  const [pruef, setPruef] = useState(null);
  const [zeigeNst, setZeigeNst] = useState(false);

  const reset = () => { setVz(null); setSchaetz(""); setAntI(""); setAntA(""); setPruef(null); };
  const neu = (x) => { const au = x || neueFlaechenAufgabe(); setAufg(au); setA(au.a); setB(au.b); reset(); setZeigeNst(false); };
  const setzeA = (v) => { setA(v); if (v >= b) setB(v + 1); reset(); };
  const setzeB = (v) => { setB(v); if (v <= a) setA(v - 1); reset(); };

  const A_ = q(a), B_ = q(b);
  const erg = useMemo(() => flaeche(aufg.p, A_, B_, aufg.nst), [aufg, a, b]);
  const teile = erg.teile;

  const flaechen = teile.map((t) => ({ f: aufg.p, a: qn(t.von), b: qn(t.bis), farbe: qVorz(t.I) >= 0 ? GR : ROT }));
  const balken = [];
  let rsumme = 0;
  if (rechtecke) {
    const dx = (b - a) / nR;
    for (let i = 0; i < nR; i++) { const m = a + (i + 0.5) * dx; const h = pNum(aufg.p, m); balken.push({ x0: a + i * dx, x1: a + (i + 1) * dx, h }); rsumme += h * dx; }
  }

  const exaktVz = qVorz(erg.I) > 0 ? "pos" : qVorz(erg.I) < 0 ? "neg" : "null";
  const pruefen = () => {
    const I = qLies(antI), A = qLies(antA);
    if (I === null || A === null) { setPruef({ fehler: zw("Bitte beide Werte eingeben (ganze Zahl, Bruch wie 7/3 oder Dezimalzahl).", "Please enter both values (integer, fraction like 7/3 or decimal).") }); return; }
    setPruef({ I: qGleich(I, erg.I), A: qGleich(A, erg.A), iWert: I, aWert: A, vzOk: vz === exaktVz, vzGewaehlt: vz });
  };
  const fertig = pruef && !pruef.fehler && pruef.I && pruef.A;
  const nstText = nstListe(aufg.nst.map((r) => r.z));

  const hilfe = hilfeKontext({
    id: `bilanz-${pTex(aufg.p)}-${a}-${b}`,
    aufgabe: "Integral Flächeninhalt Nullstellen Vorzeichen Bilanz",
    verstehen: [
      zw("Das Integral zählt Flächen oberhalb der x-Achse positiv und unterhalb negativ. Der Flächeninhalt zählt alle Stücke positiv.", "The integral counts areas above the x-axis as positive and below as negative. The area counts every piece as positive."),
      zw("Beispiel: f(x) = x auf [−1; 1] hat das Integral 0, aber den Flächeninhalt 1.", "Example: f(x) = x on [−1; 1] has integral 0 but area 1."),
      zw("Schau zuerst auf den Graphen: Wo liegt er über, wo unter der x-Achse?", "First look at the graph: where is it above, where below the x-axis?"),
    ],
    ansatz: [
      zw("Wo wechselt der Graph das Vorzeichen?", "Where does the graph change sign?"),
      zw("Zwischen den Nullstellen hat f ein festes Vorzeichen – dort darf man die Fläche am Stück berechnen.", "Between the roots f has a fixed sign – there you may compute the area in one piece."),
      zw("Teile [a; b] an den Nullstellen in Teilintervalle, rechne jedes Integral einzeln und addiere die Beträge.", "Split [a; b] at the roots, compute each integral separately and add the absolute values."),
    ],
    regel: [
      zw("Welche Regel liefert die Stammfunktion?", "Which rule gives the antiderivative?"),
      zw("Potenzregel rückwärts: x^n → x^(n+1)/(n+1).", "Power rule backwards: x^n → x^(n+1)/(n+1)."),
      zw("∫ₐᵇ f dx = F(b) − F(a) für jedes Teilintervall.", "∫ₐᵇ f dx = F(b) − F(a) for every sub-interval."),
    ],
    pruefen: [
      zw("Ist dein Flächeninhalt nie negativ?", "Is your area never negative?"),
      zw("Das Integral darf kleiner sein als der Flächeninhalt – nie größer als er.", "The integral may be smaller than the area – never larger."),
      zw("Zeichen prüfen: Graph oberhalb → Beitrag positiv, unterhalb → negativ.", "Check signs: graph above → positive contribution, below → negative."),
    ],
    regeln: [{ name: "Hauptsatz der Differential- und Integralrechnung", bereich: "analysis" }],
  });

  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Fläche und Bilanz", "Area and net change")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Das Integral ist eine Bilanz, der Flächeninhalt zählt alles positiv. Verschiebe die Grenzen, schätze – und rechne dann.", "The integral is a net total, the area counts everything as positive. Move the limits, estimate – then compute.")}</p>
      <div style={{ ...zeile, fontSize: 19, marginBottom: 6 }}><M t={`f(x) = ${pTex(aufg.p)}`} /></div>

      <Schaubild kurven={[{ p: aufg.p, farbe: C.see, name: "f" }]} flaechen={flaechen} balken={balken} senkrechte={[{ x: a, farbe: C.tinte }, { x: b, farbe: C.tinte }]}
        yBereichX={[Math.max(-4, Math.min(a, qn(aufg.nst[0])) - 0.3), Math.min(4, Math.max(b, qn(aufg.nst[aufg.nst.length - 1])) + 0.3)]} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginTop: 12 }}>
        <Stufe wert={a} setWert={setzeA} min={-4} max={3} label={zw("Untere Grenze", "Lower limit")} text="a" />
        <Stufe wert={b} setWert={setzeB} min={-3} max={4} label={zw("Obere Grenze", "Upper limit")} text="b" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.tinte, cursor: "pointer", minHeight: 40 }}>
          <input type="checkbox" checked={rechtecke} onChange={(e) => setRechtecke(e.target.checked)} style={{ width: 18, height: 18 }} />
          {zw("Rechtecksummen einblenden", "Show rectangle sums")}
        </label>
        {rechtecke && <Stufe wert={nR} setWert={setNR} min={2} max={24} label={zw("Anzahl Rechtecke", "Number of rectangles")} text="n" />}
      </div>
      {rechtecke && (
        <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 6 }}>
          {zw("Näherung mit mittlerer Höhe", "Approximation with mid-point heights")}: <b style={{ color: C.tinte }}>{sym(Math.round(rsumme * 100) / 100).replace(".", ",")}</b>
          {fertig && <> · {zw("exakt", "exact")}: <b style={{ color: C.tinte }}>{qText(erg.I)}</b></>}
        </p>
      )}
      <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 6 }}>
        <span style={{ color: GR, fontWeight: 700 }}>■</span> {zw("oberhalb der x-Achse (positiv)", "above the x-axis (positive)")} · <span style={{ color: ROT, fontWeight: 700 }}>■</span> {zw("unterhalb (negativ)", "below (negative)")}
      </p>

      {schritt(1, zw("Prognose: Vorzeichen und Größe des Integrals", "Prediction: sign and size of the integral"))}
      <Auswahl label={zw("Vorzeichen des Integrals", "Sign of the integral")} wert={vz} setWert={(v) => { setVz(v); setPruef(null); }}
        optionen={[["pos", zw("positiv", "positive")], ["neg", zw("negativ", "negative")], ["null", zw("genau 0", "exactly 0")]]}
        status={pruef && !pruef.fehler ? (pruef.vzOk ? "gut" : "schlecht") : undefined} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: C.grau }}>{zw("Meine Schätzung: ungefähr", "My estimate: about")}</span>
        <ZahlFeld wert={schaetz} setWert={setSchaetz} label={zw("Schätzung des Integrals", "Estimate of the integral")} breite={80} platzhalter="≈" />
      </div>

      {schritt(2, zw("Rechne: Integral und Flächeninhalt", "Compute: integral and area"))}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...zeile, minWidth: 120 }}><IZ a={A_} b={B_} rechts="=" /></span>
          <ZahlFeld wert={antI} setWert={(v) => { setAntI(v); setPruef(null); }} label={zw("Integral", "Integral")} onEnter={pruefen} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...zeile, minWidth: 130, fontSize: 16 }}>{zw("Flächeninhalt A =", "Area A =")}</span>
          <ZahlFeld wert={antA} setWert={(v) => { setAntA(v); setPruef(null); }} label={zw("Flächeninhalt", "Area")} onEnter={pruefen} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <KleinerLink onClick={() => setZeigeNst(!zeigeNst)}>{zeigeNst ? zw("Hinweis ausblenden", "Hide hint") : zw("Hinweis: Nullstellen zeigen", "Hint: show roots")}</KleinerLink>
        <KleinerLink onClick={() => neu({ p: [q(0), q(1)], nst: [q(0)], a: -1, b: 1 })}>{zw("Beispiel: f(x) = x auf [−1; 1]", "Example: f(x) = x on [−1; 1]")}</KleinerLink>
      </div>
      {zeigeNst && <Rueck art="info">{zw("Nullstellen von f", "Roots of f")}: x = {nstText}. {zw("Zwischen ihnen hat f ein festes Vorzeichen.", "Between them f has a fixed sign.")}</Rueck>}
      <GrosserKnopf onClick={pruefen} disabled={vz === null || antI === "" || antA === ""}>{zw("Prüfen", "Check")}</GrosserKnopf>

      {pruef && pruef.fehler && <Rueck art="warn">{pruef.fehler}</Rueck>}
      {pruef && !pruef.fehler && (
        <>
          <Rueck art={pruef.vzOk ? "gut" : "schlecht"}>
            {pruef.vzOk ? zw("Vorzeichen-Prognose stimmt.", "Your sign prediction was right.") : zw("Die Prognose zum Vorzeichen stimmte nicht – schau, welche Fläche größer ist.", "The sign prediction was off – look at which area is larger.")}
            {schaetz !== "" && qLies(schaetz) && <> {zw("Deine Schätzung", "Your estimate")}: {schaetz}, {zw("exakt", "exact")}: {qText(erg.I)}.</>}
          </Rueck>
          <Rueck art={pruef.I ? "gut" : "schlecht"}>
            {pruef.I ? zw("Integral richtig.", "Integral correct.")
              : qGleich(pruef.iWert, erg.A) && !qGleich(erg.A, erg.I) ? zw("Das ist der Flächeninhalt, nicht das Integral: Flächen unterhalb der x-Achse zählen beim Integral negativ.", "That is the area, not the integral: areas below the x-axis count negatively in the integral.")
              : zw("Integral nicht richtig. Rechne F(b) − F(a) und achte auf die Vorzeichen.", "Integral not correct. Compute F(b) − F(a) and watch the signs.")}
          </Rueck>
          <Rueck art={pruef.A ? "gut" : "schlecht"}>
            {pruef.A ? zw("Flächeninhalt richtig.", "Area correct.")
              : qGleich(pruef.aWert, qAbs(erg.I)) && teile.length > 1 ? zw("Du hast das Integral am Stück berechnet. Bei Vorzeichenwechsel muss an den Nullstellen aufgeteilt werden.", "You computed the integral in one piece. When the sign changes, split at the roots.")
              : pruef.aWert.z < 0 ? zw("Ein Flächeninhalt ist nie negativ.", "An area is never negative.")
              : zw("Flächeninhalt nicht richtig: Teile an den Nullstellen auf und addiere die Beträge der Teilintegrale.", "Area not correct: split at the roots and add the absolute values of the partial integrals.")}
          </Rueck>
        </>
      )}

      {(fertig || (pruef && !pruef.fehler)) && (
        <div style={loesungBox}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{zw("Rechenweg", "Working")}{teile.length > 1 ? zw(" (an den Nullstellen geteilt)", " (split at the roots)") : ""}</p>
          {teile.map((t, i) => (
            <div key={i} style={zeile}>
              <IZ a={t.von} b={t.bis} rechts={`= ${qTex(t.I)}`} />
              <span style={{ color: C.grau, fontSize: 14 }}>{qVorz(t.I) >= 0 ? zw("oberhalb", "above") : zw("unterhalb", "below")}</span>
            </div>
          ))}
          <div style={zeile}><IZ a={A_} b={B_} rechts={`= ${teile.map((t) => mitKlammer(t.I)).join(" + ")} = ${qTex(erg.I)}`} /></div>
          <div style={zeile}><M t={`A = ${teile.map((t) => `|${qTex(t.I)}|`).join(" + ")} = ${qTex(erg.A)}`} /></div>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>
            {zw("Beispiel f(x) = x auf [−1; 1]: Integral 0, Flächeninhalt 1.", "Example f(x) = x on [−1; 1]: integral 0, area 1.")}
          </p>
        </div>
      )}
      <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Funktion", "New function")}</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   Zwischen zwei Graphen
   ====================================================================== */

export function ZwischenZweiGraphen() {
  const [au, setAu] = useState(neueZweiGraphen);
  const [liste, setListe] = useState("");
  const [s1, setS1] = useState(null);         // { ok, text }
  const [wahlen, setWahlen] = useState({});
  const [s2, setS2] = useState(null);
  const [antA, setAntA] = useState("");
  const [s3, setS3] = useState(null);
  const [hinw, setHinw] = useState(false);

  const neu = () => { setAu(neueZweiGraphen()); setListe(""); setS1(null); setWahlen({}); setS2(null); setAntA(""); setS3(null); setHinw(false); };

  const pruefe1 = () => {
    const teile = liste.split(/;|\s+|,\s+/).map((t) => t.trim()).filter(Boolean);
    const werte = teile.map((t) => qLies(t));
    if (!werte.length || werte.some((w) => w === null)) { setS1({ ok: false, text: zw("Bitte nur Zahlen eingeben, getrennt durch Semikolon (z. B. −1; 2).", "Please enter numbers only, separated by semicolons (e.g. −1; 2).") }); return; }
    const mein = [...new Set(werte.map((w) => qText(w)))].sort();
    const richtig = au.nst.map((r) => String(r).replace("-", "−")).sort();
    const gleich = mein.length === richtig.length && mein.every((w, i) => w === richtig[i]);
    if (gleich) { setS1({ ok: true, text: zw("Richtig: Das sind genau die Schnittpunkte.", "Correct: these are exactly the intersection points.") }); return; }
    const alleEnthalten = mein.every((w) => richtig.includes(w));
    setS1({ ok: false, text: alleEnthalten ? zw("Diese x-Werte stimmen, aber es gibt noch weitere Schnittpunkte.", "These x-values are right, but there are more intersection points.")
      : zw("Mindestens ein Wert ist kein Schnittpunkt. Setze f(x) = g(x) und löse f(x) − g(x) = 0.", "At least one value is not an intersection point. Set f(x) = g(x) and solve f(x) − g(x) = 0.") });
  };
  const pruefe2 = () => {
    if (au.intervalle.some((_, i) => !wahlen[i])) { setS2({ ok: false, text: zw("Wähle für jedes Teilintervall die obere Funktion.", "Choose the upper function for every sub-interval.") }); return; }
    const falsch = au.intervalle.map((_, i) => i).filter((i) => wahlen[i] !== au.oben[i]);
    if (!falsch.length) { setS2({ ok: true, text: zw("Richtig: In jedem Teilintervall steht die gewählte Funktion oben.", "Correct: in each sub-interval the chosen function is on top.") }); return; }
    const i = falsch[0], m = qMul(qAdd(au.intervalle[i][0], au.intervalle[i][1]), q(1, 2));
    setS2({ ok: false, text: zw(`Im Intervall ${i + 1} stimmt es nicht. Setze x = ${qText(m)} in f und g ein und vergleiche.`, `Interval ${i + 1} is not right. Put x = ${qText(m)} into f and g and compare.`) });
  };
  const pruefe3 = () => {
    const A = qLies(antA);
    if (A === null) { setS3({ ok: false, text: zw("Bitte eine Zahl eingeben (ganze Zahl, Bruch oder Dezimalzahl).", "Please enter a number (integer, fraction or decimal).") }); return; }
    if (qGleich(A, au.A)) { setS3({ ok: true, text: zw("Richtig!", "Correct!") }); return; }
    let text;
    if (A.z < 0) text = zw("Eine Fläche ist nie negativ. Betrag nehmen: obere minus untere Funktion.", "An area is never negative. Use obere minus untere Funktion (upper minus lower).");
    else if (au.teile.length > 1 && qGleich(A, qAbs(au.summeSigned))) text = zw("Die Reihenfolge der Graphen wechselt – du musst aufteilen und die Beträge der Teilflächen addieren, nicht am Stück integrieren.", "The order of the graphs changes – you must split and add the absolute partial areas instead of integrating in one piece.");
    else text = zw("Nicht ganz. Rechne je Teilintervall ∫(oben − unten) dx und addiere die Teilflächen.", "Not quite. For each sub-interval compute ∫(upper − lower) dx and add the partial areas.");
    setS3({ ok: false, text });
  };

  const hilfe = hilfeKontext({
    id: `zwei-${pTex(au.f)}-${pTex(au.g)}`,
    aufgabe: "Fläche zwischen zwei Graphen Schnittpunkte obere untere Funktion Integral",
    verstehen: [
      zw("Gesucht ist die Fläche, die von f und g eingeschlossen wird – zwischen zwei Schnittstellen.", "You need the area enclosed by f and g – between two intersection points."),
      zw("Immer: obere Funktion minus untere Funktion, damit die Höhe positiv ist.", "Always: upper function minus lower function, so the height is positive."),
      zw("Wechseln f und g ihre Reihenfolge, brauchst du mehrere Teilflächen.", "If f and g swap order, you need several partial areas."),
    ],
    ansatz: [
      zw("Wo schneiden sich die Graphen?", "Where do the graphs intersect?"),
      zw("f(x) = g(x) ⇔ f(x) − g(x) = 0. Die Lösungen sind die Grenzen.", "f(x) = g(x) ⇔ f(x) − g(x) = 0. The solutions are the limits."),
      zw("Je Teilintervall: Testwert einsetzen, wer oben liegt, dann ∫(oben − unten) dx.", "Per sub-interval: plug in a test value, see who is on top, then ∫(upper − lower) dx."),
    ],
    regel: [
      zw("Welche Rechenregel brauchst du für die Differenz?", "Which rule do you need for the difference?"),
      zw("Differenz von Polynomen: gleiche Potenzen von x zusammenfassen.", "Difference of polynomials: combine equal powers of x."),
      zw("Stammfunktion: x^n → x^(n+1)/(n+1), dann F(b) − F(a).", "Antiderivative: x^n → x^(n+1)/(n+1), then F(b) − F(a)."),
    ],
    pruefen: [
      zw("Ist jede Teilfläche positiv?", "Is every partial area positive?"),
      zw("Hast du Schnittpunkte und Integrationsgrenzen getrennt geprüft?", "Did you check intersection points and integration limits separately?"),
      zw("Skizze: Passt die Größe deines Ergebnisses ungefähr zur Fläche im Bild?", "Sketch: does the size of your result roughly match the area in the picture?"),
    ],
    regeln: [{ name: "Hauptsatz der Differential- und Integralrechnung", bereich: "analysis" }],
  });

  const punkte = s1 && s1.ok ? au.nst.map((r, i) => ({ x: r, y: pNum(au.f, r), farbe: C.tinte, name: `S${["₁", "₂", "₃"][i]}` })) : [];
  const flaechen = s2 && s2.ok ? au.teile.map((t) => ({ f: au.oben[au.teile.indexOf(t)] === "f" ? au.f : au.g, g: au.oben[au.teile.indexOf(t)] === "f" ? au.g : au.f, a: qn(t.von), b: qn(t.bis), farbe: C.flaggold })) : [];

  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Fläche zwischen zwei Graphen", "Area between two graphs")}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={hinweis}>{zw("Erst die Schnittpunkte, dann wer oben liegt, dann die Fläche – jeweils einzeln geprüft.", "First the intersection points, then who is on top, then the area – each checked separately.")}</p>
      <div style={zeile}><M t={`f(x) = ${pTex(au.f)}`} /></div>
      <div style={zeile}><M t={`g(x) = ${pTex(au.g)}`} /></div>
      <div style={{ marginTop: 8 }}>
        <Schaubild kurven={[{ p: au.f, farbe: C.see, name: "f" }, { p: au.g, farbe: C.gruen, name: "g" }]} flaechen={flaechen} punkte={punkte} />
      </div>

      {schritt(1, zw("Schnittpunkte: x-Werte bestimmen", "Intersection points: find the x-values"))}
      <TextFeld wert={liste} setWert={(v) => { setListe(v); setS1(null); }} label={zw("x-Werte der Schnittpunkte", "x-values of the intersection points")} platzhalter={zw("z. B. −1; 2", "e.g. −1; 2")} onEnter={pruefe1} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KleinerLink onClick={() => setHinw(!hinw)}>{hinw ? zw("Hinweis ausblenden", "Hide hint") : zw("Hinweis", "Hint")}</KleinerLink>
      </div>
      {hinw && <Rueck art="info">{zw("Setze f(x) = g(x). Dann gilt", "Set f(x) = g(x). Then")} <M t={`f(x) - g(x) = ${pTex(au.d)} = 0`} />.</Rueck>}
      <GrosserKnopf onClick={pruefe1} disabled={!liste.trim()}>{zw("Schnittpunkte prüfen", "Check intersection points")}</GrosserKnopf>
      {s1 && <Rueck art={s1.ok ? "gut" : "schlecht"}>{s1.text}</Rueck>}

      {s1 && s1.ok && (
        <>
          {schritt(2, zw("Wer liegt oben? Je Teilintervall wählen", "Who is on top? Choose per sub-interval"))}
          <div style={{ display: "grid", gap: 10 }}>
            {au.intervalle.map(([x, y], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ ...zeile, minWidth: 100, fontSize: 15.5 }}>[{qText(x)}; {qText(y)}]</span>
                <Auswahl label={zw(`Obere Funktion im Intervall ${i + 1}`, `Upper function in interval ${i + 1}`)} wert={wahlen[i]} setWert={(v) => { setWahlen({ ...wahlen, [i]: v }); setS2(null); }}
                  optionen={[["f", zw("f oben", "f on top")], ["g", zw("g oben", "g on top")]]} />
              </div>
            ))}
          </div>
          <GrosserKnopf onClick={pruefe2}>{zw("Prüfen", "Check")}</GrosserKnopf>
          {s2 && <Rueck art={s2.ok ? "gut" : "schlecht"}>{s2.text}</Rueck>}
        </>
      )}

      {s2 && s2.ok && (
        <>
          {schritt(3, zw("Flächeninhalt berechnen", "Compute the area"))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ ...zeile, fontSize: 16 }}>A =</span>
            <ZahlFeld wert={antA} setWert={(v) => { setAntA(v); setS3(null); }} label={zw("Flächeninhalt", "Area")} onEnter={pruefe3} />
          </div>
          <GrosserKnopf onClick={pruefe3} disabled={!antA.trim()}>{zw("Fläche prüfen", "Check area")}</GrosserKnopf>
          {s3 && <Rueck art={s3.ok ? "gut" : "schlecht"}>{s3.text}</Rueck>}
          {s3 && (
            <div style={loesungBox}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{zw("Rechenweg", "Working")}</p>
              {au.teile.map((t, i) => (
                <div key={i} style={zeile}>
                  <M t={`A_{${i + 1}} =`} /><IZ a={t.von} b={t.bis} inner={au.oben[i] === "f" ? "(f(x) − g(x))" : "(g(x) − f(x))"} rechts={`= ${qTex(t.A)}`} />
                </div>
              ))}
              <div style={zeile}><M t={`A = ${au.teile.map((t) => qTex(t.A)).join(" + ")} = ${qTex(au.A)}`} /></div>
            </div>
          )}
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ======================================================================
   Bestand und Änderungsrate
   ====================================================================== */

function BestandAus() {
  const [au, setAu] = useState(neuerBestand);
  const [prog, setProg] = useState(null);
  const [antB, setAntB] = useState("");
  const [antE, setAntE] = useState("");
  const [pr, setPr] = useState(null);
  const neu = () => { setAu(neuerBestand()); setProg(null); setAntB(""); setAntE(""); setPr(null); };
  const exaktProg = qVorz(au.bilanz) > 0 ? "mehr" : qVorz(au.bilanz) < 0 ? "weniger" : "gleich";
  const pruefen = () => {
    const B = qLies(antB), E = qLies(antE);
    if (B === null || E === null) { setPr({ fehler: zw("Bitte beide Werte eingeben (Zahl, Bruch oder Dezimalzahl).", "Please enter both values (number, fraction or decimal).") }); return; }
    setPr({ B: qGleich(B, au.bilanz), E: qGleich(E, au.ende), Bw: B, Ew: E, prog: prog === exaktProg });
  };
  const fertig = pr && !pr.fehler;
  const flaechen = teilIntervalle(q(0), q(au.T), [q(au.t1), q(au.t2)]).map((t) => ({ f: au.r, a: qn(t[0]), b: qn(t[1]), farbe: qVorz(bestimmt(au.r, t[0], t[1])) >= 0 ? GR : ROT }));
  const hilfe = hilfeKontext({
    id: `bestand-${pTex(au.r)}-${au.B0}`,
    aufgabe: "Änderungsrate Bestand Bilanz Anfangsbestand Integral Einheit",
    verstehen: [
      zw("r(t) ist die Änderungsrate: positiv heißt Zufluss, negativ Abfluss. Der Bestand ist die Füllmenge.", "r(t) is the rate of change: positive means inflow, negative outflow. The stock is the amount stored."),
      zw("Die Bilanz ∫r dt sagt, um wie viel der Bestand insgesamt zu- oder abgenommen hat.", "The net change ∫r dt tells by how much the stock has increased or decreased overall."),
      zw("Endbestand = Anfangsbestand + Bilanz.", "Final stock = initial stock + net change."),
    ],
    ansatz: [
      zw("Welche Zahl gehört zum Anfang, welche zur Veränderung?", "Which number belongs to the start, which to the change?"),
      zw("Veränderung = Integral der Änderungsrate über das Zeitintervall.", "Change = integral of the rate over the time interval."),
      zw("Rechne ∫₀ᵀ r(t) dt, addiere dann den Anfangsbestand.", "Compute ∫₀ᵀ r(t) dt, then add the initial stock."),
    ],
    regel: [
      zw("Welche Stammfunktion gehört zu r?", "Which antiderivative belongs to r?"),
      zw("Potenzregel rückwärts, dann F(T) − F(0).", "Power rule backwards, then F(T) − F(0)."),
      zw("Einheiten: Liter pro Minute mal Minuten ergibt Liter.", "Units: litres per minute times minutes gives litres."),
    ],
    pruefen: [
      zw("Passt die Einheit (Liter)?", "Does the unit fit (litres)?"),
      zw("Bedeutet dein Vorzeichen Zu- oder Abnahme? Negative Rate = Abnahme.", "Does your sign mean increase or decrease? Negative rate = decrease."),
      zw("Der Bestand darf in dieser Aufgabe nicht negativ werden – prüfe dein Endergebnis.", "In this task the stock must not become negative – check your final result."),
    ],
    regeln: [{ name: "Hauptsatz der Differential- und Integralrechnung", bereich: "analysis" }],
  });
  const F = pInt(au.r);
  return (
    <>
      <p style={hinweis}>{zw(`Ein Tank wird befüllt und entleert. Die Änderungsrate r(t) in Liter pro Minute ist gegeben, t in Minuten. Anfangsbestand: ${au.B0} Liter.`, `A tank is filled and emptied. The rate of change r(t) in litres per minute is given, t in minutes. Initial stock: ${au.B0} litres.`)}</p>
      <div style={zeile}><M t={`r(t) = ${pTex(au.r, "t")}`} /><span style={{ fontSize: 13, color: C.grau }}>{zw("l/min, 0 ≤ t ≤", "l/min, 0 ≤ t ≤")} {au.T}</span></div>
      <Schaubild kurven={[{ p: au.r, farbe: C.see, name: "r" }]} flaechen={flaechen} x0={0} x1={au.T + 0.5} einheitX="t (min)" einheitY="r (l/min)" hoehe={200} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}><IchHaengeFest kontext={hilfe} /></div>

      {schritt(1, zw("Prognose: Wie steht der Tank nach der Zeit?", "Prediction: how is the tank after the time?"))}
      <Auswahl label={zw("Prognose Bestand", "Stock prediction")} wert={prog} setWert={(v) => { setProg(v); setPr(null); }}
        optionen={[["mehr", zw("mehr als am Anfang", "more than at the start")], ["weniger", zw("weniger als am Anfang", "less than at the start")], ["gleich", zw("genau gleich", "exactly the same")]]}
        status={fertig ? (pr.prog ? "gut" : "schlecht") : undefined} />

      {schritt(2, zw("Rechne: Bilanz und Endbestand", "Compute: net change and final stock"))}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...zeile, minWidth: 120 }}><IZ a={0} b={au.T} inner="r(t)" dx="dt" rechts="=" /></span>
          <ZahlFeld wert={antB} setWert={(v) => { setAntB(v); setPr(null); }} label={zw("Bilanz", "Net change")} onEnter={pruefen} /><span style={{ fontSize: 14, color: C.grau }}>{zw("Liter", "litres")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...zeile, minWidth: 120, fontSize: 16 }}><M t={`B(${au.T}) =`} /></span>
          <ZahlFeld wert={antE} setWert={(v) => { setAntE(v); setPr(null); }} label={zw("Endbestand", "Final stock")} onEnter={pruefen} /><span style={{ fontSize: 14, color: C.grau }}>{zw("Liter", "litres")}</span>
        </div>
      </div>
      <GrosserKnopf onClick={pruefen} disabled={prog === null || !antB.trim() || !antE.trim()}>{zw("Prüfen", "Check")}</GrosserKnopf>
      {pr && pr.fehler && <Rueck art="warn">{pr.fehler}</Rueck>}
      {fertig && (
        <>
          <Rueck art={pr.prog ? "gut" : "schlecht"}>{pr.prog ? zw("Prognose stimmt.", "Prediction was right.") : zw("Die Prognose stimmte nicht: Vergleiche die Fläche über und unter der t-Achse.", "The prediction was off: compare the area above and below the t-axis.")}</Rueck>
          <Rueck art={pr.B ? "gut" : "schlecht"}>{pr.B ? zw("Bilanz richtig.", "Net change correct.") : qGleich(pr.Bw, au.ende) ? zw("Das ist schon der Endbestand. Die Bilanz ist nur die Veränderung ohne den Anfangsbestand.", "That is already the final stock. The net change is only the change without the initial stock.") : zw("Bilanz nicht richtig: Rechne F(T) − F(0) mit einer Stammfunktion von r.", "Net change not correct: compute F(T) − F(0) with an antiderivative of r.")}</Rueck>
          <Rueck art={pr.E ? "gut" : "schlecht"}>{pr.E ? zw("Endbestand richtig.", "Final stock correct.") : zw("Endbestand nicht richtig: Anfangsbestand plus Bilanz.", "Final stock not correct: initial stock plus net change.")}</Rueck>
          <div style={loesungBox}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{zw("Rechenweg", "Working")}</p>
            <div style={zeile}><M t={`R(t) = ${pTex(F, "t")}`} /></div>
            <div style={zeile}><IZ a={0} b={au.T} inner="r(t)" dx="dt" rechts={`= R(${au.T}) − R(0) = ${qTex(au.bilanz)}`} /></div>
            <div style={zeile}><M t={`B(${au.T}) = ${au.B0} + ${mitKlammer(au.bilanz)} = ${qTex(au.ende)}`} /></div>
            <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>
              {zw("Einheiten: Liter pro Minute · Minuten = Liter. Negative Rate heißt Abnahme – der Bestand selbst bleibt hier trotzdem ≥ 0.", "Units: litres per minute · minutes = litres. A negative rate means decrease – the stock itself still stays ≥ 0 here.")}
            </p>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "10px 0 6px" }}>{zw("Bestandsentwicklung B(t) = Anfangsbestand + ∫₀ᵗ r", "Stock over time B(t) = initial stock + ∫₀ᵗ r")}</p>
            <Schaubild kurven={[{ p: au.Bf, farbe: C.gruen, name: "B" }]} x0={0} x1={au.T + 0.5} yMin={0} einheitX="t (min)" einheitY="B (l)" hoehe={190} />
          </div>
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </>
  );
}

function RateAus() {
  const [au, setAu] = useState(neuUmgekehrt);
  const [vz, setVz] = useState(null);
  const [antR, setAntR] = useState("");
  const [antT, setAntT] = useState("");
  const [pr, setPr] = useState(null);
  const neu = () => { setAu(neuUmgekehrt()); setVz(null); setAntR(""); setAntT(""); setPr(null); };
  const exaktVz = au.rate > 0 ? "steigt" : au.rate < 0 ? "faellt" : "konst";
  const pruefen = () => {
    const R = qLies(antR), T = qLies(antT);
    if (R === null || T === null) { setPr({ fehler: zw("Bitte beide Zahlen eingeben.", "Please enter both numbers.") }); return; }
    setPr({ vz: vz === exaktVz, R: qGleich(R, q(au.rate)), T: qGleich(T, q(au.ts)), Rw: R });
  };
  const fertig = pr && !pr.fehler;
  const tangente = [q(au.Bt0 - au.rate * au.t0), q(au.rate)];
  const bTex = pTex(au.Bf, "t");
  const hilfe = hilfeKontext({
    id: `rate-${bTex}-${au.t0}`,
    aufgabe: "Bestand Änderungsrate Ableitung Steigung Zunahme Abnahme",
    verstehen: [
      zw("Die Änderungsrate ist die Steigung des Bestandsgraphen: B′(t).", "The rate of change is the slope of the stock graph: B′(t)."),
      zw("Steigt B, ist die Rate positiv; fällt B, ist sie negativ.", "If B rises the rate is positive; if B falls it is negative."),
      zw("Negative Rate heißt Abnahme – der Bestand B selbst kann dabei positiv bleiben.", "A negative rate means decrease – the stock B itself may stay positive."),
    ],
    ansatz: [zw("Welche Ableitung brauchst du?", "Which derivative do you need?"), zw("B′(t) bilden und den Zeitpunkt einsetzen.", "Form B′(t) and plug in the time."), zw("B′(t) = 0 setzen, um den Zeitpunkt ohne Veränderung zu finden.", "Set B′(t) = 0 to find the time without change.")],
    regel: [zw("Welche Regel leitet B ab?", "Which rule differentiates B?"), zw("(a·tⁿ)′ = a·n·tⁿ⁻¹.", "(a·tⁿ)′ = a·n·tⁿ⁻¹."), zw("Konstanten fallen beim Ableiten weg.", "Constants vanish when differentiating.")],
    pruefen: [zw("Passt das Vorzeichen zum Graphen?", "Does the sign match the graph?"), zw("Einheit: Liter pro Minute.", "Unit: litres per minute."), zw("Am Hochpunkt von B ist die Rate 0.", "At the maximum of B the rate is 0.")],
  });
  return (
    <>
      <p style={hinweis}>{zw(`Gegeben ist der Bestand B(t) in Litern. Deute die Änderungsrate zum Zeitpunkt t = ${au.t0} Minuten.`, `The stock B(t) in litres is given. Interpret the rate of change at time t = ${au.t0} minutes.`)}</p>
      <div style={zeile}><M t={`B(t) = ${bTex}`} /><span style={{ fontSize: 13, color: C.grau }}>{zw("Liter", "litres")}, 0 ≤ t ≤ {au.T}</span></div>
      <Schaubild kurven={[{ p: au.Bf, farbe: C.gruen, name: "B" }, ...(fertig ? [{ p: tangente, farbe: C.flaggold, name: zw("Tangente", "tangent") }] : [])]} punkte={[{ x: au.t0, y: au.Bt0, farbe: C.tinte, name: `t = ${au.t0}` }]} x0={0} x1={au.T + 0.5} yMin={0} einheitX="t (min)" einheitY="B (l)" hoehe={210} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}><IchHaengeFest kontext={hilfe} /></div>

      {schritt(1, zw(`Was passiert bei t = ${au.t0}?`, `What happens at t = ${au.t0}?`))}
      <Auswahl label={zw("Entwicklung des Bestands", "Development of the stock")} wert={vz} setWert={(v) => { setVz(v); setPr(null); }}
        optionen={[["steigt", zw("Bestand steigt", "stock rises")], ["faellt", zw("Bestand fällt", "stock falls")], ["konst", zw("bleibt gleich", "stays constant")]]}
        status={fertig ? (pr.vz ? "gut" : "schlecht") : undefined} />

      {schritt(2, zw("Rechne: Änderungsrate und Wendepunkt der Entwicklung", "Compute: rate of change and turning time"))}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...zeile, minWidth: 120 }}><M t={`B'(${au.t0}) =`} /></span>
          <ZahlFeld wert={antR} setWert={(v) => { setAntR(v); setPr(null); }} label={zw("Änderungsrate", "Rate of change")} onEnter={pruefen} /><span style={{ fontSize: 14, color: C.grau }}>l/min</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ ...zeile, minWidth: 120, fontSize: 15.5 }}>{zw("Rate 0 bei t =", "Rate 0 at t =")}</span>
          <ZahlFeld wert={antT} setWert={(v) => { setAntT(v); setPr(null); }} label={zw("Zeitpunkt der Rate 0", "Time of rate 0")} onEnter={pruefen} /><span style={{ fontSize: 14, color: C.grau }}>min</span>
        </div>
      </div>
      <GrosserKnopf onClick={pruefen} disabled={vz === null || !antR.trim() || !antT.trim()}>{zw("Prüfen", "Check")}</GrosserKnopf>
      {pr && pr.fehler && <Rueck art="warn">{pr.fehler}</Rueck>}
      {fertig && (
        <>
          <Rueck art={pr.vz ? "gut" : "schlecht"}>{pr.vz ? zw("Richtig gedeutet.", "Interpreted correctly.") : zw("Schau auf die Steigung des Graphen an dieser Stelle.", "Look at the slope of the graph at this point.")}</Rueck>
          <Rueck art={pr.R ? "gut" : "schlecht"}>{pr.R ? zw("Änderungsrate richtig.", "Rate correct.") : zw("Leite B ab und setze t ein: B′(t) = 2a·t + b.", "Differentiate B and plug in t: B′(t) = 2a·t + b.")}</Rueck>
          <Rueck art={pr.T ? "gut" : "schlecht"}>{pr.T ? zw("Zeitpunkt richtig.", "Time correct.") : zw("Setze B′(t) = 0 und löse nach t auf.", "Set B′(t) = 0 and solve for t.")}</Rueck>
          <div style={loesungBox}>
            <div style={zeile}><M t={`B'(t) = ${pTex(pDer(au.Bf), "t")}`} /></div>
            <div style={zeile}><M t={`B'(${au.t0}) = ${au.rate < 0 ? "-" : ""}${Math.abs(au.rate)}`} /><span style={{ fontSize: 14, color: C.grau }}>l/min</span></div>
            <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>
              {au.rate < 0
                ? zw(`Negative Änderungsrate = Abnahme. Der Bestand ist dabei noch ${au.Bt0} Liter, also nicht negativ.`, `Negative rate = decrease. The stock is still ${au.Bt0} litres, so not negative.`)
                : zw(`Positive Änderungsrate = Zunahme. Der Bestand beträgt bei t = ${au.t0} gerade ${au.Bt0} Liter.`, `Positive rate = increase. The stock at t = ${au.t0} is ${au.Bt0} litres.`)}
            </p>
          </div>
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </>
  );
}

export function BestandAenderungsrate() {
  const [art, setArt] = useState("rekonstruieren");
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Bestand und Änderungsrate", "Stock and rate of change")}</p>
      <Auswahl label={zw("Aufgabenart", "Task type")} wert={art} setWert={setArt}
        optionen={[["rekonstruieren", zw("Bestand rekonstruieren", "Rebuild the stock")], ["deuten", zw("Rate aus Bestand deuten", "Read the rate from the stock")]]} />
      <div style={{ marginTop: 14 }}>
        {art === "rekonstruieren" ? <BestandAus key="a" /> : <RateAus key="b" />}
      </div>
    </div>
  );
}

/* ======================================================================
   Anfangsbedingung: Konstante C bestimmen (unter „Stammfunktion bilden“)
   ====================================================================== */

export function Anfangsbedingung() {
  const [au, setAu] = useState(neuerAnfangswert);
  const [ant, setAnt] = useState("");
  const [pr, setPr] = useState(null);
  const neu = () => { setAu(neuerAnfangswert()); setAnt(""); setPr(null); };
  const pruefen = () => {
    const c = qLies(ant);
    if (c === null) { setPr({ ok: false, text: zw("Bitte eine Zahl eingeben (ganze Zahl, Bruch oder Dezimalzahl).", "Please enter a number (integer, fraction or decimal).") }); return; }
    setPr(qGleich(c, au.C0) ? { ok: true, text: zw("Richtig: Mit diesem C geht F durch den Punkt.", "Correct: with this C, F passes through the point.") }
      : { ok: false, text: zw(`Nicht ganz. Setze x = ${au.x0} in F(x) ein, setze das Ergebnis gleich ${au.y0} und löse nach C.`, `Not quite. Put x = ${au.x0} into F(x), set the result equal to ${au.y0} and solve for C.`) });
  };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Anfangsbedingung: C bestimmen", "Initial condition: find C")}</p>
      <p style={hinweis}>{zw("Eine Stammfunktion ist nur bis auf die Konstante C festgelegt. Eine Anfangsbedingung wählt genau eine davon aus.", "An antiderivative is only fixed up to the constant C. An initial condition picks exactly one of them.")}</p>
      <div style={zeile}><M t={`f(x) = ${pTex(au.f)}`} /></div>
      <div style={zeile}><M t={`F(x) = ${pTex(au.F0)} + C`} /></div>
      <div style={zeile}>{zw("Bedingung:", "Condition:")} <M t={`F(${au.x0}) = ${au.y0}`} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <span style={{ ...zeile, fontSize: 16 }}>C =</span>
        <ZahlFeld wert={ant} setWert={(v) => { setAnt(v); setPr(null); }} label="C" onEnter={pruefen} />
      </div>
      <GrosserKnopf onClick={pruefen} disabled={!ant.trim()}>{zw("C prüfen", "Check C")}</GrosserKnopf>
      {pr && <Rueck art={pr.ok ? "gut" : "schlecht"}>{pr.text}</Rueck>}
      {pr && (
        <div style={loesungBox}>
          <div style={zeile}><M t={`F(${au.x0}) = ${qTex(pAus(au.F0, q(au.x0)))} + C = ${au.y0}`} /></div>
          <div style={zeile}><M t={`C = ${au.y0} - ${mitKlammer(pAus(au.F0, q(au.x0)))} = ${qTex(au.C0)}`} /></div>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>{zw("Beim bestimmten Integral fällt C heraus – für einen Anfangswert ist es wichtig.", "In a definite integral C cancels – for an initial value it matters.")}</p>
        </div>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}
