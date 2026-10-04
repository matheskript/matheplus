/* ============================================================
   Gemeinsame Lernhilfe „Ich hänge fest“ für alle Trainingsseiten.
   · Auswahl: Aufgabe verstehen, Ansatz finden, Regel fehlt, Umformen, Ergebnis prüfen
   · Hinweisleiter je Bereich: Denkfrage → passende Regel → nächster konkreter Schritt.
     Bereits genutzte Hinweise bleiben sichtbar; die vollständige Lösung ist ein eigener,
     ausdrücklich zu bestätigender Schritt.
   · „Aufgabensprache verstehen“: Fachbegriffe aus dem Aufgabentext werden erklärt,
     auf Wunsch mit einem einzelnen Beispiel.
   · „Passende Regel ansehen“: Eintrag aus der vorhandenen Formelsammlung mit kurzem Beispiel.
   · „Grundlage üben“: die passende Kopfrechen-Übung direkt im Panel.
   Das Panel liegt über der Seite (Portal). Aufgabe, Eingaben und Scrollposition
   der Seite bleiben dabei unverändert erhalten.
   Die Hinweise sind feste, fachlich geprüfte Texte bzw. werden aus dem aktuellen
   Aufgabenstand berechnet – die KI wird hier bewusst nicht aufgerufen, weil „Frag
   Mathilda AI“ in den öffentlichen Werkzeugen gesperrt ist.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { FORMELN } from "./base2.jsx";
import { FORMELN_ANALYSIS_EXTRA, FORMELN_WEITERE } from "./baseFormeln.jsx";
import { M, Text } from "./func3.jsx";
import { alsTex, hatX } from "./func12.jsx";
import { KopfrechenZentrum } from "./func14.jsx";

const blau = `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`;

/* ---------- Bereiche und allgemeine Hinweise ---------- */

export const HILFE_BEREICHE = [
  { id: "verstehen", name: "Aufgabe verstehen", zeichen: "?" },
  { id: "ansatz", name: "Ansatz finden", zeichen: "→" },
  { id: "regel", name: "Regel fehlt", zeichen: "§" },
  { id: "umformen", name: "Umformen", zeichen: "⇔" },
  { id: "pruefen", name: "Ergebnis prüfen", zeichen: "✓" },
];
const STUFEN = ["Denkfrage", "Passende Regel", "Nächster Schritt"];

const ALLGEMEIN = {
  verstehen: [
    "Was ist gegeben, was ist gesucht? Formuliere die Frage in einem Satz mit eigenen Worten.",
    "Markiere alle Zahlen und Fachbegriffe. Unten findest du die Begriffe aus dieser Aufgabe erklärt.",
    "Schreib das Gesuchte als mathematischen Ausdruck auf – zum Beispiel „f′(x) = ?“ oder „d(P; E) = ?“.",
  ],
  ansatz: [
    "Welche ähnliche Aufgabe hast du schon gelöst? Welches Verfahren hat dort geholfen?",
    "Öffne „Passende Regel ansehen“ – dort steht die Regel, die hier gebraucht wird.",
    "Fang mit dem ersten Teilschritt an. Du musst nicht den ganzen Weg auf einmal sehen.",
  ],
  regel: [
    "Welche Regel kennst du zu diesem Thema? Versuch, sie aus dem Kopf aufzuschreiben.",
    "Unter „Passende Regel ansehen“ steht die Regel aus der Formelsammlung mit einem Beispiel.",
    "Wende die Regel zuerst auf ein ganz kleines Beispiel an, dann auf deine Aufgabe.",
  ],
  umformen: [
    "Was soll am Ende allein stehen? Was „klebt“ noch daran?",
    "Auf beiden Seiten immer dasselbe tun – die Umkehroperationen in umgekehrter Reihenfolge.",
    "Mach einen Schritt nach dem anderen und schreib jede Zeile vollständig auf.",
  ],
  pruefen: [
    "Ist das Ergebnis plausibel? Stimmen Vorzeichen und Größenordnung?",
    "Mach die Probe: Setze dein Ergebnis in die Ausgangsaufgabe ein.",
    "Vergleiche mit einer Skizze oder dem Schaubild.",
  ],
};

/* ---------- Aufgabensprache: Begriffe mit Erklärung und einem Beispiel ---------- */

const GLOSSAR = [
  ["Ableitung", /ableit|f′|f″/i, "Die Ableitung f′ gibt zu jeder Stelle x die Steigung des Graphen von f an.", "$f(x) = x^{2}$ hat die Ableitung $f′(x) = 2x$; bei x = 3 ist die Steigung 6."],
  ["Stammfunktion", /stammfunktion|aufleit|integr/i, "F ist eine Stammfunktion von f, wenn F′ = f gilt. Es gibt unendlich viele, sie unterscheiden sich um eine Konstante C.", "$F(x) = x^{3} + 2$ ist eine Stammfunktion von $f(x) = 3x^{2}$."],
  ["Bestimmtes Integral", /integral|∫/i, "Das bestimmte Integral von a bis b ist die Flächenbilanz zwischen Graph und x-Achse: Teile unterhalb zählen negativ.", "$\\int_{0}^{2} x \\, dx = 2$"],
  ["Hochpunkt", /hochpunkt|maximum/i, "Ein Punkt, an dem der Graph lokal am höchsten ist. Dort ist die Tangente waagerecht: f′(x) = 0.", "Bei $f(x) = -x^{2} + 4$ ist H(0 | 4) ein Hochpunkt."],
  ["Tiefpunkt", /tiefpunkt|minimum/i, "Ein Punkt, an dem der Graph lokal am tiefsten ist. Auch dort ist f′(x) = 0.", "Bei $f(x) = x^{2} - 1$ ist T(0 | −1) ein Tiefpunkt."],
  ["Sattelpunkt", /sattel/i, "Ein Wendepunkt mit waagerechter Tangente: f′(x) = 0 und f″(x) = 0, aber kein Extrempunkt.", "$f(x) = x^{3}$ hat den Sattelpunkt S(0 | 0)."],
  ["Wendepunkt", /wende/i, "Punkt, an dem der Graph von einer Links- in eine Rechtskurve wechselt (oder umgekehrt). Dort ist f″(x) = 0 mit Vorzeichenwechsel.", "$f(x) = x^{3} - 3x$ hat den Wendepunkt W(0 | 0)."],
  ["Tangente", /tangente/i, "Gerade, die den Graphen in einem Punkt berührt und dort dieselbe Steigung hat: m = f′(x₀).", "Tangente an $f(x) = x^{2}$ bei x₀ = 1: $t(x) = 2x - 1$."],
  ["Nullstelle", /nullstelle/i, "Stelle, an der f(x) = 0 ist – dort schneidet oder berührt der Graph die x-Achse.", "$f(x) = x^{2} - 4$ hat die Nullstellen −2 und 2."],
  ["y-Achsenabschnitt", /y-achse/i, "Der Funktionswert an der Stelle 0: f(0). Dort schneidet der Graph die y-Achse.", "$f(x) = 2x + 3$ schneidet die y-Achse bei y = 3."],
  ["Achsensymmetrie", /achsensymmetr/i, "Spiegelbild an der y-Achse: f(−x) = f(x). Bei Polynomen kommen dann nur gerade Exponenten vor.", "$f(x) = x^{4} - 2x^{2}$"],
  ["Punktsymmetrie", /punktsymmetr/i, "Symmetrie zum Ursprung: f(−x) = −f(x). Bei Polynomen nur ungerade Exponenten.", "$f(x) = x^{3} - 4x$"],
  ["Grad", /grad/i, "Der höchste Exponent eines Polynoms. Ein Polynom vom Grad n hat n + 1 Koeffizienten.", "$f(x) = 2x^{3} - x$ hat den Grad 3."],
  ["Gleichungssystem", /gleichungssystem|lgs|gleichung i/i, "Mehrere Gleichungen, die gleichzeitig gelten sollen. Gesucht sind Werte, die alle erfüllen.", "x + y = 5 und x − y = 1 ergibt x = 3, y = 2."],
  ["Stützvektor", /stütz|gerade|ebene/i, "Ortsvektor eines Punkts, an dem eine Gerade oder Ebene „angeheftet“ wird.", "$\\vec{x} = \\binom{1}{2} + t \\cdot \\binom{3}{1}$: Stützvektor ist (1 | 2)."],
  ["Richtungsvektor", /richtung|gerade/i, "Gibt die Richtung einer Geraden an. Jedes Vielfache ≠ 0 ist ebenfalls ein Richtungsvektor.", "(2 | 4 | 6) und (1 | 2 | 3) beschreiben dieselbe Richtung."],
  ["Normalenvektor", /normalen|koordinatenform|ebene/i, "Vektor, der senkrecht auf einer Ebene steht. In der Koordinatenform sind seine Koordinaten die Koeffizienten.", "E: 2x₁ − x₂ + 3x₃ = 4 hat den Normalenvektor (2 | −1 | 3)."],
  ["Lotfußpunkt", /lot|abstand/i, "Der Punkt auf der Geraden oder Ebene, an dem das Lot vom gegebenen Punkt auftrifft. Die Verbindung steht senkrecht.", "Der Lotfußpunkt von P(0 | 0 | 5) auf die x₁x₂-Ebene ist F(0 | 0 | 0)."],
  ["Windschief", /windschief|gerade.*gerade/i, "Zwei Geraden im Raum, die weder parallel sind noch sich schneiden.", "Eine Gerade auf dem Boden und eine quer darüber an der Decke."],
  ["Abstand", /abstand/i, "Die kürzeste Entfernung zweier Objekte. Sie wird immer senkrecht gemessen und ist nie negativ.", ""],
  ["Treffer­wahrscheinlichkeit", /bernoulli|treffer|binomial/i, "p ist die Wahrscheinlichkeit für einen Treffer bei einem einzelnen Versuch. Sie bleibt bei jedem Versuch gleich.", "Würfeln auf eine Sechs: p = 1/6."],
  ["höchstens / mindestens", /höchstens|mindestens|bernoulli/i, "Höchstens k: X ≤ k (k eingeschlossen). Mindestens k: X ≥ k. „Mehr als k“ heißt X ≥ k + 1.", "Mindestens 3 Sechsen: X ≥ 3; mehr als 3: X ≥ 4."],
  ["Bedingte Wahrscheinlichkeit", /bedingt|vier-felder|unter der bedingung|\|/i, "P(A | B) ist die Wahrscheinlichkeit für A, wenn man schon weiß, dass B eingetreten ist. Bezugsgruppe ist nur B.", "$P(A | B) = \\frac{P(A \\cap B)}{P(B)}$"],
  ["Amplitude", /sinus|amplitude/i, "Halber Abstand zwischen höchstem und tiefstem Funktionswert: |a| in a·sin(b(x − c)) + d.", "Max 5, Min 1: Amplitude 2."],
  ["Periode", /sinus|periode/i, "Länge, nach der sich der Graph wiederholt: p = 2π / |b|.", "sin(2x) hat die Periode π."],
  ["Definitionsmenge", /bruch|wurzel|ln|log|definition/i, "Alle x, die man einsetzen darf. Verboten sind z. B. Nenner 0, negative Zahlen unter der Wurzel, ln von Zahlen ≤ 0.", "Bei 1/(x − 2) ist x = 2 verboten."],
];

/* ---------- Formelsammlung: Eintrag suchen ---------- */

const ALLE_FORMELN = [...FORMELN, ...FORMELN_ANALYSIS_EXTRA, ...FORMELN_WEITERE];
export function formelEintrag(name, bereich) {
  return ALLE_FORMELN.find((e) => e.name === name && (!bereich || e.bereich === bereich)) || null;
}

/* kurze Beispiele zu häufigen Regeln */
const BEISPIEL = {
  Potenzregel: "$(x^{5})′ = 5x^{4}$",
  Faktorregel: "$(3x^{2})′ = 3 \\cdot 2x = 6x$",
  Summenregel: "$(x^{3} + x)′ = 3x^{2} + 1$",
  Produktregel: "$(x \\cdot \\sin(x))′ = 1 \\cdot \\sin(x) + x \\cdot \\cos(x)$",
  Quotientenregel: "$\\left(\\frac{x}{x+1}\\right)′ = \\frac{1 \\cdot (x+1) - x \\cdot 1}{(x+1)^{2}} = \\frac{1}{(x+1)^{2}}$",
  Kettenregel: "$(\\sin(3x))′ = \\cos(3x) \\cdot 3$",
  "e-Funktion": "$(5e^{x})′ = 5e^{x}$",
  "Natürlicher Logarithmus": "$(\\ln(x))′ = \\frac{1}{x}$ für x > 0",
  Sinus: "$(2\\sin(x))′ = 2\\cos(x)$",
  Kosinus: "$(\\cos(x))′ = -\\sin(x)$",
  Wurzel: "$(\\sqrt{x})′ = \\frac{1}{2\\sqrt{x}}$",
  Konstante: "$(7)′ = 0$",
  "Allgemeine Exponentialfunktion": "$(2^{x})′ = 2^{x} \\cdot \\ln(2)$",
  "Potenzregel rückwärts": "$\\int 6x^{2} \\, dx = 2x^{3} + C$",
  Stammfunktion: "$F(x) = \\sin(x) + 4$ ist eine Stammfunktion von $f(x) = \\cos(x)$.",
  Hauptsatz: "$\\int_{2}^{3} 3x^{2} \\, dx = 3^{3} - 2^{3} = 19$",
  Tangente: "$f(x) = x^{2}$, x₀ = 1: $t(x) = 2(x - 1) + 1 = 2x - 1$",
  Extrempunkt: "$f(x) = x^{2} - 2x$: f′(1) = 0, f″(1) = 2 > 0 ⇒ Tiefpunkt bei x = 1",
  Wendepunkt: "$f(x) = x^{3}$: f″(0) = 0, f‴(0) = 6 ≠ 0 ⇒ Wendestelle 0",
  Verbindungsvektor: "A(1 | 2 | 0), B(4 | 0 | 1): $\\vec{AB}$ = (3 | −2 | 1)",
  Kreuzprodukt: "(1 | 0 | 0) × (0 | 1 | 0) = (0 | 0 | 1)",
  Koordinatenform: "n = (2 | 1 | −1), P(1 | 1 | 1): 2x₁ + x₂ − x₃ = 2",
  Geradengleichung: "g: x = (1 | 2 | 0) + t · (3 | −2 | 1)",
  "Ebene in Parameterform": "E: x = (1 | 0 | 0) + r · (−1 | 1 | 0) + s · (−1 | 0 | 1)",
  "Abstand Punkt–Ebene": "P(1 | 1 | 1), E: 2x₁ + x₂ + 2x₃ = 2: d = |2 + 1 + 2 − 2| / 3 = 1",
  Skalarprodukt: "(1 | 2 | 3) · (4 | −1 | 0) = 4 − 2 + 0 = 2",
  "Betrag (Länge)": "|(2 | 3 | 6)| = √(4 + 9 + 36) = 7",
  "Bernoulli-Formel": "n = 3, p = 1/2: P(X = 2) = 3 · (1/2)² · (1/2) = 3/8",
  "Höchstens und mindestens": "P(X ≥ 1) = 1 − P(X = 0)",
  Gegenereignis: "P(mindestens eine Sechs bei 2 Würfen) = 1 − (5/6)² = 11/36",
  "Bedingte Wahrscheinlichkeit": "P(A ∩ B) = 0,2, P(B) = 0,5: P(A | B) = 0,4",
  Mitternachtsformel: "x² − 5x + 6 = 0: x = (5 ± 1)/2, also 2 und 3",
  "Satz vom Nullprodukt": "x(x − 3) = 0 ⇒ x = 0 oder x = 3",
  Periode: "sin(2x): p = 2π / 2 = π",
};

/* ---------- Ableitungen: benötigte Regeln aus dem Term ablesen ---------- */

const istNurX = (n) => n && n.k === "x";
/* Liefert die benötigten Regeln (Namen der Formelsammlung) und den „wichtigsten“ Schritt */
export function ableitRegeln(baum) {
  const regeln = new Set();
  const schritte = [];
  const geh = (n) => {
    if (!n) return;
    switch (n.k) {
      case "par": return geh(n.a);
      case "num": case "e": case "pi": regeln.add("Konstante"); return;
      case "x": regeln.add("Potenzregel"); return;
      case "neg": regeln.add("Faktorregel"); return geh(n.a);
      case "+": case "-": regeln.add("Summenregel"); geh(n.a); geh(n.b); return;
      case "*": {
        const ax = hatX(n.a), bx = hatX(n.b);
        if (ax && bx) { regeln.add("Produktregel"); schritte.push({ regel: "Produktregel", u: n.a, v: n.b }); }
        else regeln.add("Faktorregel");
        geh(n.a); geh(n.b); return;
      }
      case "/": {
        if (hatX(n.b)) {
          const potenz = !hatX(n.a) && (istNurX(n.b) || (n.b.k === "^" && istNurX(n.b.a) && !hatX(n.b.b)));
          if (potenz) { regeln.add("Potenzregel"); schritte.push({ regel: "Umschreiben", term: n }); }
          else { regeln.add("Quotientenregel"); schritte.push({ regel: "Quotientenregel", u: n.a, v: n.b }); }
        } else regeln.add("Faktorregel");
        geh(n.a); if (hatX(n.b)) geh(n.b); return;
      }
      case "^": {
        const ax = hatX(n.a), bx = hatX(n.b);
        if (ax && !bx) { regeln.add("Potenzregel"); if (!istNurX(n.a)) { regeln.add("Kettenregel"); schritte.push({ regel: "Kettenregel", innen: n.a, ganz: n }); } geh(n.a); return; }
        if (!ax && bx) {
          regeln.add(n.a.k === "e" ? "e-Funktion" : "Allgemeine Exponentialfunktion");
          if (!istNurX(n.b)) { regeln.add("Kettenregel"); schritte.push({ regel: "Kettenregel", innen: n.b, ganz: n }); }
          geh(n.b); return;
        }
        if (ax && bx) { regeln.add("Kettenregel"); schritte.push({ regel: "eForm", ganz: n }); }
        return;
      }
      case "fn": {
        const name = { sin: "Sinus", cos: "Kosinus", ln: "Natürlicher Logarithmus", sqrt: "Wurzel" }[n.n];
        if (name) regeln.add(name);
        if (!istNurX(n.a) && hatX(n.a)) { regeln.add("Kettenregel"); schritte.push({ regel: "Kettenregel", innen: n.a, ganz: n }); }
        geh(n.a); return;
      }
      case "log": regeln.add("Natürlicher Logarithmus"); if (!istNurX(n.a)) { regeln.add("Kettenregel"); schritte.push({ regel: "Kettenregel", innen: n.a, ganz: n }); } geh(n.a); return;
      default: return;
    }
  };
  geh(baum);
  const rang = { Produktregel: 0, Quotientenregel: 1, Kettenregel: 2, eForm: 3, Umschreiben: 4 };
  schritte.sort((a, b) => rang[a.regel] - rang[b.regel]);
  return { regeln: [...regeln], haupt: schritte[0] || null };
}

/* innere Funktion durch ▯ ersetzen → Bild der äußeren Funktion */
export function aussenTex(ganz, innen) {
  const ersetze = (n) => {
    if (n === innen) return { k: "box" };
    const m = { ...n };
    if (n.a) m.a = ersetze(n.a);
    if (n.b) m.b = ersetze(n.b);
    return m;
  };
  return alsTex(ersetze(ganz));
}

/* Summanden eines Terms (für „Summand für Summand“) */
export function summanden(baum) {
  const liste = [];
  const geh = (n, vz) => {
    if (!n) return;
    if (n.k === "par") return geh(n.a, vz);
    if (n.k === "+") { geh(n.a, vz); geh(n.b, vz); return; }
    if (n.k === "-") { geh(n.a, vz); geh(n.b, -vz); return; }
    liste.push(vz < 0 ? { k: "neg", a: n } : n);
  };
  geh(baum, 1);
  return liste;
}

/* ---------- LGS: nächste sinnvolle Kombination vorschlagen ---------- */

const ROEM = ["I", "II", "III", "IV", "V"];
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
/* rows: [[k1, …, kn, rechts], …] mit ganzen Zahlen. Liefert { zeile, text } oder null. */
export function naechsteKombination(rows) {
  const n = rows.length;
  const erste = (r) => r.slice(0, n).findIndex((v) => v !== 0);
  const mal = (k, name) => `${k === 1 ? "" : `${k}·`}${name}`;
  const kombi = (t, p, j) => {
    const at = rows[t][j], ap = rows[p][j];
    if (at % ap === 0) {
      const f = at / ap;
      return { zeile: t, text: `${ROEM[t]} ${f > 0 ? "−" : "+"} ${mal(Math.abs(f), ROEM[p])}` };
    }
    const g = ggT(at, ap);
    let ft = ap / g, fp = at / g;
    if (ft < 0) { ft = -ft; fp = -fp; }
    return { zeile: t, text: `${mal(ft, ROEM[t])} ${fp > 0 ? "−" : "+"} ${mal(Math.abs(fp), ROEM[p])}` };
  };
  // 1. Vorwärts: zwei Zeilen beginnen mit derselben Unbekannten → in der späteren eliminieren
  for (let j = 0; j < n; j++) {
    const kand = rows.map((r, i) => i).filter((i) => erste(rows[i]) === j);
    if (kand.length >= 2) {
      const p = kand.reduce((b, i) => (Math.abs(rows[i][j]) < Math.abs(rows[b][j]) ? i : b), kand[0]);
      const t = kand.find((i) => i !== p);
      return { ...kombi(t, p, j), wozu: `um die erste Unbekannte aus Gleichung ${ROEM[t]} zu eliminieren` };
    }
  }
  // 2. Rückwärts: Zeile mit nur einer Unbekannten → diese aus den anderen Zeilen entfernen
  for (let p = n - 1; p >= 0; p--) {
    const nz = rows[p].slice(0, n).map((v, j) => (v !== 0 ? j : -1)).filter((j) => j >= 0);
    if (nz.length !== 1) continue;
    const j = nz[0];
    const t = rows.findIndex((r, i) => i !== p && r[j] !== 0);
    if (t >= 0) return { ...kombi(t, p, j), wozu: `um diese Unbekannte mit Hilfe von Gleichung ${ROEM[p]} aus Gleichung ${ROEM[t]} zu entfernen` };
  }
  // 3. Kürzen: einzelne Unbekannte mit Koeffizient ≠ 1
  for (let i = 0; i < n; i++) {
    const nz = rows[i].slice(0, n).filter((v) => v !== 0);
    if (nz.length === 1 && Math.abs(nz[0]) !== 1 && rows[i][n] % nz[0] === 0) return { zeile: i, text: `${ROEM[i]} : ${nz[0] < 0 ? `(${nz[0]})` : nz[0]}`, wozu: "damit die Unbekannte allein dasteht" };
  }
  return null;
}

/* ---------- Oberfläche ---------- */

const knopfLeise = { background: "none", border: "none", color: C.see, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: "6px 0" };

function Begriffe({ text }) {
  const [offen, setOffen] = useState({});
  const treffer = GLOSSAR.filter(([, re]) => re.test(text || ""));
  if (!treffer.length) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.gruenDunkel, marginBottom: 8 }}>BEGRIFFE IN DIESER AUFGABE</p>
      {treffer.slice(0, 6).map(([b, , erkl, bsp]) => (
        <div key={b} style={{ background: C.sand, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, marginBottom: 3 }}>{b}</p>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>{erkl}</p>
          {bsp && (offen[b]
            ? <Text s={`Beispiel: ${bsp}`} style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.7, marginTop: 4 }} />
            : <button type="button" style={{ ...knopfLeise, fontSize: 12.5, paddingBottom: 0 }} onClick={() => setOffen({ ...offen, [b]: true })}>Ein Beispiel zeigen</button>)}
        </div>
      ))}
    </div>
  );
}

function RegelAnsicht({ regeln }) {
  const eintraege = (regeln || []).map((r) => (r.f ? r : (() => { const e = formelEintrag(r.name, r.bereich); return e ? { ...e, beispiel: BEISPIEL[r.name] } : null; })())).filter(Boolean);
  if (!eintraege.length) return <p style={{ fontSize: 14, color: C.grau }}>Zu dieser Aufgabe ist noch keine Regel hinterlegt.</p>;
  return (
    <div>
      {eintraege.map((e) => (
        <div key={e.name} style={{ border: `1px solid ${C.linie}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.hellgrau, marginBottom: 2 }}>{e.gruppe || "Regel"}</p>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, marginBottom: 6 }}>{e.name}</p>
          <div style={{ fontSize: 17, overflowX: "auto", whiteSpace: "nowrap", padding: "4px 0", color: C.tinte }}><M t={e.f} /></div>
          {e.kurz && <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 4 }}>{e.kurz}</p>}
          {e.beispiel && <Text s={`Beispiel: ${e.beispiel}`} style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.7, marginTop: 6, background: C.sand, borderRadius: 10, padding: "6px 10px" }} />}
        </div>
      ))}
      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6 }}>Aus der Formelsammlung von Mythos Mathe.</p>
    </div>
  );
}

/* Merkt sich je Aufgabe, welche Hinweise schon aufgedeckt wurden (überlebt Öffnen und Schließen) */
const AUFGEDECKT = new Map();

export function IchHaengeFest({ kontext, onHilfe }) {
  const [offen, setOffen] = useState(false);
  if (!kontext) return null;
  return (
    <>
      <button type="button" onClick={() => setOffen(true)} aria-haspopup="dialog"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 999, border: `1px solid ${C.linie}`,
          background: C.weiss, color: C.see, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="4" /><path d="M5.3 5.3l3.9 3.9M14.8 14.8l3.9 3.9M18.7 5.3l-3.9 3.9M9.2 14.8l-3.9 3.9" />
        </svg>
        Ich hänge fest
      </button>
      {offen && createPortal(<Panel kontext={kontext} onHilfe={onHilfe} schliessen={() => setOffen(false)} />, document.body)}
    </>
  );
}

function Panel({ kontext, onHilfe, schliessen }) {
  const schluessel = kontext.id || "aufgabe";
  const [bereich, setBereich] = useState(null);
  const [ansicht, setAnsicht] = useState("hilfe");        // hilfe | regel | grundlage | loesung
  const [loesungSicher, setLoesungSicher] = useState(false);
  const [, neuZeichnen] = useState(0);
  const zuRef = useRef(null);
  const auf = AUFGEDECKT.get(schluessel) || {};
  const aufdecken = (b) => {
    const n = Math.min(3, (auf[b] || 0) + 1);
    AUFGEDECKT.set(schluessel, { ...auf, [b]: n });
    if (AUFGEDECKT.size > 200) AUFGEDECKT.delete(AUFGEDECKT.keys().next().value);
    neuZeichnen((x) => x + 1);
    try { onHilfe && onHilfe(b, n); } catch (e) { /* optional */ }
  };

  // Seite darunter festhalten (Scrollposition bleibt erhalten), Escape schließt
  useEffect(() => {
    const vorher = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fokus = document.activeElement;
    zuRef.current?.focus();
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    window.addEventListener("keydown", taste);
    return () => { document.body.style.overflow = vorher; window.removeEventListener("keydown", taste); try { fokus?.focus?.({ preventScroll: true }); } catch (e) { /* egal */ } };
  }, []);

  const hinweise = (b) => {
    const eigen = (kontext.hilfen && kontext.hilfen[b]) || [];
    return [0, 1, 2].map((i) => eigen[i] || ALLGEMEIN[b][i]);
  };
  const titel = ansicht === "regel" ? "Passende Regel" : ansicht === "grundlage" ? "Grundlage üben" : ansicht === "loesung" ? "Vollständige Lösung"
    : bereich ? HILFE_BEREICHE.find((x) => x.id === bereich).name : "Wobei hängst du fest?";

  return (
    <div role="presentation" onClick={schliessen}
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(10,20,45,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <style>{`@keyframes hilfeRein{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}`}</style>
      <div role="dialog" aria-modal="true" aria-label={`Ich hänge fest – ${titel}`} onClick={(e) => e.stopPropagation()}
        style={{ background: C.weiss, width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", borderRadius: "22px 22px 0 0",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.25)", animation: "hilfeRein .18s ease-out" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 1, background: blau, color: C.weiss, padding: "14px 18px 14px", borderRadius: "22px 22px 0 0",
          display: "flex", alignItems: "center", gap: 10 }}>
          {(bereich || ansicht !== "hilfe") && (
            <button type="button" aria-label="Zurück zur Auswahl" onClick={() => { if (ansicht !== "hilfe") setAnsicht("hilfe"); else setBereich(null); }}
              style={{ width: 34, height: 34, borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: C.weiss, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>←</button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.flaggold }}>ICH HÄNGE FEST</p>
            <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>{titel}</p>
          </div>
          <button ref={zuRef} type="button" onClick={schliessen}
            style={{ height: 34, padding: "0 12px", borderRadius: 999, border: "none", background: C.flaggold, color: C.seeTief, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", flexShrink: 0 }}>
            Zurück zur Aufgabe
          </button>
        </div>

        <div style={{ padding: "16px 18px 22px" }}>
          {ansicht === "regel" && <RegelAnsicht regeln={kontext.regeln} />}

          {ansicht === "grundlage" && kontext.grundlage && (
            <div style={{ margin: "0 -24px" }}>
              <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, padding: "0 24px", marginBottom: -14 }}>{kontext.grundlage.grund}</p>
              <KopfrechenZentrum key={kontext.grundlage.trainer} start={kontext.grundlage.trainer} />
            </div>
          )}

          {ansicht === "loesung" && (
            loesungSicher ? <div style={{ fontSize: 15, color: C.tinte, lineHeight: 1.7 }}>{typeof kontext.loesung === "string" ? <Text s={kontext.loesung} style={{ fontSize: 16, lineHeight: 1.9 }} /> : kontext.loesung}</div> : (
              <div>
                <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.7, marginBottom: 12 }}>
                  Mit der vollständigen Lösung lernst du am meisten, wenn du danach eine ähnliche Aufgabe ohne Hilfe löst. Willst du sie wirklich sehen?
                </p>
                <button type="button" onClick={() => { setLoesungSicher(true); try { onHilfe && onHilfe("loesung", 4); } catch (e) { /* optional */ } }}
                  style={{ height: 46, padding: "0 18px", borderRadius: 12, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                  Ja, Lösung zeigen
                </button>
              </div>
            )
          )}

          {ansicht === "hilfe" && !bereich && (
            <>
              {kontext.aufgabe && <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>Deine Aufgabe und alle Eingaben bleiben erhalten. Wähle, wo es hakt:</p>}
              <div style={{ display: "grid", gap: 8 }}>
                {HILFE_BEREICHE.map((b) => (
                  <button key={b.id} type="button" onClick={() => setBereich(b.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 52, padding: "8px 14px", borderRadius: 14, border: `1px solid ${C.linie}`,
                      background: C.weiss, cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte }}>
                    <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 999, background: C.himmel, color: C.see, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{b.zeichen}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{b.name}</span>
                    {auf[b.id] > 0 && <span style={{ fontSize: 12, color: C.hellgrau }}>{auf[b.id]} von 3</span>}
                  </button>
                ))}
              </div>
              <Zusatzknoepfe kontext={kontext} setAnsicht={setAnsicht} />
            </>
          )}

          {ansicht === "hilfe" && bereich && (
            <>
              {hinweise(bereich).slice(0, auf[bereich] || 0).map((h, i) => (
                <div key={i} className="hilfe-neu" style={{ background: i === 2 ? "#FFF6D9" : C.sand, borderRadius: 14, padding: "10px 14px", marginBottom: 10 }}>
                  <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: i === 2 ? "#7A5A00" : C.see, marginBottom: 4 }}>{i + 1}. {STUFEN[i].toUpperCase()}</p>
                  <Text s={h} style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }} />
                </div>
              ))}
              {(auf[bereich] || 0) < 3 ? (
                <button type="button" onClick={() => aufdecken(bereich)}
                  style={{ width: "100%", height: 48, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.weiss, background: blau }}>
                  {(auf[bereich] || 0) === 0 ? "Hinweis" : "Nächster Hinweis"}
                </button>
              ) : <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6 }}>Alle drei Hinweise sind aufgedeckt. Versuch es jetzt selbst – die Lösung findest du unten.</p>}
              {bereich === "verstehen" && <Begriffe text={kontext.aufgabe} />}
              <Zusatzknoepfe kontext={kontext} setAnsicht={setAnsicht} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Zusatzknoepfe({ kontext, setAnsicht }) {
  const k = (label, wohin, an = true) => an && (
    <button type="button" onClick={() => setAnsicht(wohin)}
      style={{ height: 40, padding: "0 14px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.linie}` }}>
      {k("Passende Regel ansehen", "regel", !!(kontext.regeln && kontext.regeln.length))}
      {k(`Grundlage üben: ${kontext.grundlage ? kontext.grundlage.name : ""}`, "grundlage", !!kontext.grundlage)}
      {k("Vollständige Lösung", "loesung", !!kontext.loesung)}
    </div>
  );
}

/* Kopfzeile für Trainingskarten: Titel links, „Ich hänge fest“ rechts */
export function HilfeZeile({ kontext, children, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12, ...style }}>
      <div style={{ minWidth: 0 }}>{children}</div>
      <IchHaengeFest kontext={kontext} />
    </div>
  );
}
