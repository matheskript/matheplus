/* ======================================================================
   Mathildas Rechenwerkzeuge (Tool Use) – reine Logik, kein React.
   Mathilda rechnet nicht selbst, sie ruft die geprüfte Engine der App:
   Formel-Engine (formelEngine.js) und Binomialverteilung (hypo.js).
   Wird serverseitig in api/claude.js ausgeführt; die Definitionen gehen
   als `tools` an die API, `werkzeugAusfuehren` liefert das Ergebnis als Text.
   Eingabesyntax wie im Advanced Plotter: x^2, 3x, sqrt(x), e^(2x), ln(x), log[2](x), pi.
   ====================================================================== */
import { ableitung, alsText, alsTex, analysiere, kompiliere, ohnePar, parse, vereinfache, wert } from "./formelEngine.js";
import { binomTabelle, kritisch, kumuliert, pAb, pBis } from "./hypo.js";

const TERM = { type: "string", description: "Funktionsterm in x, z. B. x^3-3x+1, 2*e^(-x), sqrt(x+1), ln(x), log[2](x), sin(2x)" };

export const WERKZEUG_DEFINITIONEN = [
  { name: "ableiten", description: "Leitet einen Term symbolisch ab (erste, zweite und dritte Ableitung, vereinfacht). Immer benutzen, bevor du eine Ableitung nennst.",
    input_schema: { type: "object", properties: { term: TERM }, required: ["term"] } },
  { name: "vereinfachen", description: "Vereinfacht einen Term (Regel A5: nichts bleibt unvereinfacht stehen).",
    input_schema: { type: "object", properties: { term: TERM }, required: ["term"] } },
  { name: "funktionswert", description: "Berechnet f(x) an einer Stelle x.",
    input_schema: { type: "object", properties: { term: TERM, x: { type: "number" } }, required: ["term", "x"] } },
  { name: "funktion_untersuchen", description: "Kurvendiskussion numerisch: Nullstellen, Extrem- und Wendepunkte, Pole, y-Achsenabschnitt im Bereich [von, bis] (Standard −10 bis 10). Immer benutzen, bevor du Nullstellen oder Extrempunkte nennst.",
    input_schema: { type: "object", properties: { term: TERM, von: { type: "number" }, bis: { type: "number" } }, required: ["term"] } },
  { name: "gleichung_loesen", description: "Löst f(x) = 0 numerisch im Bereich [von, bis] (Standard −20 bis 20). Für eine Gleichung links = rechts den Term (links) − (rechts) übergeben.",
    input_schema: { type: "object", properties: { term: TERM, von: { type: "number" }, bis: { type: "number" } }, required: ["term"] } },
  { name: "binomialverteilung", description: "Binomialverteilung B(n; p): P(X = k), P(X ≤ k), P(X ≥ k), Erwartungswert und Standardabweichung.",
    input_schema: { type: "object", properties: { n: { type: "integer" }, p: { type: "number" }, k: { type: "integer" } }, required: ["n", "p", "k"] } },
  { name: "hypothesentest", description: "Ablehnungsbereich eines Binomialtests zu H0: p = p0 auf dem Niveau alpha; richtung links (H1: p < p0), rechts (H1: p > p0) oder beide.",
    input_schema: { type: "object", properties: { n: { type: "integer" }, p0: { type: "number" }, alpha: { type: "number" }, richtung: { type: "string", enum: ["links", "rechts", "beide"] } }, required: ["n", "p0", "alpha", "richtung"] } },
];
export const WERKZEUG_NAMEN = WERKZEUG_DEFINITIONEN.map((w) => w.name);

const zahlTxt = (v) => (typeof v === "number" && isFinite(v) ? wert(v) : "nicht definiert");
const liste = (xs, f) => (xs.length ? xs.map(f).join("; ") : "keine");
const baum = (term) => {
  const b = parse(String(term || "").replace(/,/g, "."));
  if (!b) throw new Error(`Term nicht lesbar: ${term}`);
  return ohnePar(b);
};
const pruefeZahl = (v, name, { ganz = false, min = -Infinity, max = Infinity } = {}) => {
  const z = Number(v);
  if (!isFinite(z) || (ganz && !Number.isInteger(z)) || z < min || z > max) throw new Error(`${name} ungültig: ${v}`);
  return z;
};

/* Liefert immer einen Text (für den tool_result); Fehler werden als Text zurückgegeben, nie geworfen. */
export function werkzeugAusfuehren(name, eingabe = {}) {
  try {
    switch (name) {
      case "ableiten": {
        const f = baum(eingabe.term);
        const f1 = ableitung(f), f2 = ableitung(f1), f3 = ableitung(f2);
        return `f(x) = ${alsText(f)}\nf'(x) = ${alsText(f1)}\nf''(x) = ${alsText(f2)}\nf'''(x) = ${alsText(f3)}\nTeX: f'(x) = ${alsTex(f1)}`;
      }
      case "vereinfachen": {
        const f = vereinfache(baum(eingabe.term));
        return `${alsText(f)}\nTeX: ${alsTex(f)}`;
      }
      case "funktionswert": {
        const f = baum(eingabe.term), x = pruefeZahl(eingabe.x, "x");
        return `f(${wert(x)}) = ${zahlTxt(kompiliere(f)(x))}`;
      }
      case "funktion_untersuchen":
      case "gleichung_loesen": {
        const f = baum(eingabe.term);
        const std = name === "gleichung_loesen" ? 20 : 10;
        const von = eingabe.von === undefined ? -std : pruefeZahl(eingabe.von, "von"), bis = eingabe.bis === undefined ? std : pruefeZahl(eingabe.bis, "bis");
        if (bis <= von || bis - von > 10000) throw new Error("Bereich ungültig");
        const A = analysiere(f, von, bis);
        if (name === "gleichung_loesen") return `Lösungen von ${alsText(f)} = 0 in [${wert(von)}; ${wert(bis)}]: ${liste(A.ns, (x) => `x = ${wert(x)}`)}`;
        return [
          `f(x) = ${alsText(f)}, Bereich [${wert(von)}; ${wert(bis)}]`,
          `f'(x) = ${alsText(A.d1)}`, `f''(x) = ${alsText(A.d2)}`,
          `Nullstellen: ${liste(A.ns, (x) => `x = ${wert(x)}`)}`,
          `Extrempunkte: ${liste(A.ext, (e) => `${e.art} (${wert(e.x)} | ${zahlTxt(e.y)})`)}`,
          `Wendepunkte: ${liste(A.wende, (w) => `${w.art} (${wert(w.x)} | ${zahlTxt(w.y)})`)}`,
          `Pole: ${liste(A.pole, (p) => `x = ${wert(p.x)}`)}`,
          `y-Achsenabschnitt: ${A.yAchse === null ? "keiner" : `(0 | ${zahlTxt(A.yAchse)})`}`,
          "Hinweis: numerisch im angegebenen Bereich; Werte sind gerundet.",
        ].join("\n");
      }
      case "binomialverteilung": {
        const n = pruefeZahl(eingabe.n, "n", { ganz: true, min: 1, max: 5000 }), p = pruefeZahl(eingabe.p, "p", { min: 0, max: 1 }), k = pruefeZahl(eingabe.k, "k", { ganz: true, min: 0, max: n });
        const t = binomTabelle(n, p), c = kumuliert(t);
        const r = (v) => v.toFixed(4).replace(".", ",");
        return `B(${n}; ${wert(p)}): P(X = ${k}) = ${r(t[k])}, P(X ≤ ${k}) = ${r(pBis(c, k))}, P(X ≥ ${k}) = ${r(pAb(c, k))}, E(X) = ${wert(n * p)}, σ = ${wert(Math.sqrt(n * p * (1 - p)))}`;
      }
      case "hypothesentest": {
        const n = pruefeZahl(eingabe.n, "n", { ganz: true, min: 1, max: 5000 }), p0 = pruefeZahl(eingabe.p0, "p0", { min: 0, max: 1 }), alpha = pruefeZahl(eingabe.alpha, "alpha", { min: 0, max: 0.5 });
        const richtung = ["links", "rechts", "beide"].includes(eingabe.richtung) ? eingabe.richtung : "beide";
        const r = kritisch(n, p0, alpha, richtung);
        const c = kumuliert(binomTabelle(n, p0));
        const f = (v) => v.toFixed(4).replace(".", ",");
        if (richtung === "links") return `Ablehnungsbereich (links, α = ${wert(alpha)}): ${r.g < 0 ? "leer" : `{0; …; ${r.g}}`}; Irrtumswahrscheinlichkeit ${f(r.g < 0 ? 0 : pBis(c, r.g))}`;
        if (richtung === "rechts") return `Ablehnungsbereich (rechts, α = ${wert(alpha)}): ${r.g > n ? "leer" : `{${r.g}; …; ${n}}`}; Irrtumswahrscheinlichkeit ${f(r.g > n ? 0 : pAb(c, r.g))}`;
        return `Ablehnungsbereich (beidseitig, α = ${wert(alpha)}): ${r.gl < 0 ? "∅" : `{0; …; ${r.gl}}`} ∪ ${r.gr > n ? "∅" : `{${r.gr}; …; ${n}}`}`;
      }
      default:
        return `Unbekanntes Werkzeug: ${name}`;
    }
  } catch (e) {
    return `Fehler: ${e.message}`;
  }
}
