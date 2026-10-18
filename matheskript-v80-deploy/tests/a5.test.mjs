/* Regel A5 („Nichts bleibt unvereinfacht stehen“) für alle reinen Aufgaben-Generatoren:
   Jede Lösungszeile und jedes Ergebnis darf nicht auf einem unvereinfachten Ausdruck enden.
   Geprüft werden Textfelder (Lösung, Erklärung, Schritte …) – LaTeX und Klartext. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as TD from "../src/trainingDaten.js";
import * as GG from "../src/gleichgen.js";
import * as TG from "../src/termgen.js";
import * as AK from "../src/abiKetten.js";
import * as A2 from "../src/aufgaben2.js";
import * as TX from "../src/textaufgaben.js";
import { alsTex } from "../src/bedingungen.js";

/* Textaufgaben: nur was angezeigt wird (Lösungen, Begründungen, LGS-Zeilen) – Denkfehler sind absichtlich falsch */
const textAnzeige = (a) => ({
  loesung: a.stellen.flatMap((s) => (s.zielTex || s.ziel.map((z) => alsTex(z.c)))),
  warum: a.stellen.map((s) => s.warum), ansatz: a.ansatz ? [a.ansatz.zeile, a.ansatz.warum] : [],
  lgs: (a.einsetzen || []).map((z) => z.gl),
});

/* Muster, die am Ende einer Zeile/eines Ausdrucks auf Unvereinfachtes hinweisen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const MUSTER = [
  [new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), "Zahl ± Zahl am Zeilenende"],
  [new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`), "Zahl · Zahl am Zeilenende"],
  [/(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, "1x bzw. 1 · x"],
  [/\+\s*[−-]\s*\d/, "+ − Zahl"],
  [/[−-]\s*[−-]\s*\d/, "− − Zahl"],
  [/(?:·|\\cdot)\s*1(?![\d,.\/^])/, "· 1"],
  [/[+−-]\s*0(?![\d,.])\s*$/, "± 0 am Ende"],
  [/(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/, "Hochzahl 1"],
];

function texte(obj, aus = [], tiefe = 0) {
  if (tiefe > 6 || obj == null) return aus;
  if (typeof obj === "string") { aus.push(obj); return aus; }
  if (Array.isArray(obj)) { obj.forEach((o) => texte(o, aus, tiefe + 1)); return aus; }
  if (typeof obj === "object") for (const [k, v] of Object.entries(obj)) {
    if (/^(id|typ|art|thema|fuer|farbe|modus|kriterien|fehler)$/.test(k)) continue;   // keine Darstellungstexte
    texte(v, aus, tiefe + 1);
  }
  return aus;
}
/* Zeilen bzw. Gleichungsketten in einzelne Endstücke zerlegen */
const stuecke = (t) => t.split(/\n|\\\\|;|\.\s|\s—\s|, (?=[A-ZÄÖÜ])/).map((s) => s.trim()).filter(Boolean);

function pruefe(name, erzeuge, laeufe = 400) {
  const funde = new Map();
  for (let i = 0; i < laeufe; i++) {
    let a; try { a = erzeuge(); } catch (e) { continue; }
    for (const t of texte(a)) for (const s of stuecke(t)) for (const [re, was] of MUSTER) {
      const m = re.exec(s);
      if (!m) continue;
      const rest = s.slice(m.index + m[0].length);
      if (/=|≈|\\approx/.test(rest)) continue;                    // wird in derselben Zeile weitergerechnet
      if (/\\binom|über/.test(s) && was === "Hochzahl 1") continue;  // Bernoulli-Formel beim Einsetzen
      if (name === "termgen/binomisch" && was === "· 1") continue;    // Formel 2ab mit b = 1 eingesetzt, nächste Zeile fasst zusammen
      if (!funde.has(was + s)) funde.set(was + s, `${name}: ${was} → „${s.slice(0, 90)}“`);
    }
  }
  return [...funde.values()];
}

const QUELLEN = [
  ...TD.GENERATOREN.map((g) => [`5 Minuten Mathe/${g.id}`, () => TD.neueAufgabe(g.id)]),
  ["gleichgen/umformung", GG.neuUmformung], ["gleichgen/methode", GG.neueMethode], ["gleichgen/fehler", GG.neuFehler],
  ["gleichgen/loesungsmenge", GG.neueLoesungsmenge], ["gleichgen/geometrisch", GG.neuGeometrisch],
  ["termgen/terme", TG.neuTerme], ["termgen/ausklammern", TG.neuAusklammern], ["termgen/binomisch", () => TG.neuBinomisch()],
  ["termgen/potenz", TG.neuPotenz], ["termgen/bruch", TG.neuBruch],
  ["abiKetten/analysis", () => AK.analysisKette()], ["abiKetten/geometrie", () => AK.geometrieKette()], ["abiKetten/stochastik", () => AK.stochastikKette()],
  ["aufgaben2/flaeche", A2.neueFlaechenAufgabe], ["aufgaben2/zweiGraphen", A2.neueZweiGraphen], ["aufgaben2/bestand", A2.neuerBestand],
  ...TX.THEMA_IDS.map((t) => [`textaufgaben/${t}`, () => textAnzeige(TX.neueTextaufgabe(t))]),
  ["aufgaben2/umgekehrt", A2.neuUmgekehrt], ["aufgaben2/anfangswert", A2.neuerAnfangswert], ["aufgaben2/punktprobe", A2.neuePunktprobe],
];

test("Regel A5: keine unvereinfachten Endstücke in generierten Lösungen", async () => {
  const alle = QUELLEN.flatMap(([n, f]) => pruefe(n, f));
  if (alle.length) console.log(alle.slice(0, 80).join("\n"), alle.length > 80 ? `\n… ${alle.length - 80} weitere` : "");
  if (process.env.A5_DATEI) { const fs = await import("node:fs"); fs.writeFileSync(process.env.A5_DATEI, alle.join("\n")); }
  assert.equal(alle.length, 0, `${alle.length} Stellen verletzen Regel A5`);
});
