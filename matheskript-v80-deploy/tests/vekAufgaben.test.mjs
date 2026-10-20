/* Aufgabentool Kurs „Vektoren, Geraden und Ebenen“ (src/vekAufgaben*.js, vekKern.js):
   · jede Buchaufgabe mit Typ existiert im Buch (public/buecher/vektoren/kurs), jeder Typ existiert
   · je Typ 300 Aufgaben: keine Fehler, kein NaN/undefined, nur Mini-TeX-Befehle der App
   · Listen (Vektoren) werden als eigene Lösung erkannt, Wahl-Schritte haben die richtige Option
   · Regel A5 in Rechenwegen; Kern: Gauß, Kreuzprodukt, Betrag, Kürzen */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TYPEN, BUCH_TYPEN, neueAufgabe } from "../src/vekAufgaben.js";
import { pruefeListe } from "../src/diffKern.js";
import { gauss, vCross, vek, vKuerzen, wurzelT, betragWegT, kollinearFaktor, summeT, zT, q } from "../src/vekKern.js";

const KURS = "public/buecher/vektoren/kurs";
const N = 300;
const SCHLUESSEL = [...new Set([...Object.values(BUCH_TYPEN), ...Object.keys(TYPEN)])];

test("Band 2: Typen und Zuordnung sind vorhanden", () => {
  assert.ok(Object.keys(TYPEN).length >= 25, `nur ${Object.keys(TYPEN).length} Typen`);
  assert.ok(Object.keys(BUCH_TYPEN).length >= 100, `nur ${Object.keys(BUCH_TYPEN).length} Buchaufgaben zugeordnet`);
});

test("jede zugeordnete Buchaufgabe gibt es im Buch, jeder Typ existiert", () => {
  for (const [k, typ] of Object.entries(BUCH_TYPEN)) {
    const [seite, nr] = k.split("-");
    const datei = `${KURS}/${seite}.json`;
    assert.ok(fs.existsSync(datei), `Seite ${seite} fehlt (${k})`);
    const inhalt = JSON.parse(fs.readFileSync(datei, "utf8"));
    assert.ok(inhalt.aufgaben.some((a) => a.nr === nr), `Aufgabe ${k} gibt es im Buch nicht`);
    assert.ok(TYPEN[typ.split(":")[0]], `Typ ${typ} fehlt`);
  }
});

const texte = (a) => [a.text, ...(a.weg || []), ...a.schritte.flatMap((s) => [s.frage, s.text, s.titel, s.hinweis, ...(s.optionen || []).map((o) => o[1]), ...(s.fehler || []).map((f) => f.text)])].filter((t) => typeof t === "string");
const VERBOTEN = [/\\colon/, /pmatrix/, /\\overrightarrow/, /\\dfrac/, /NaN|undefined|Infinity|\[object/];
const MUSTER = [
  [/\+\s*[−-]\s*\d/, "+ −"],
  [/[−-]\s*[−-]\s*\d/, "− −"],
  [/(^|[^\d.,\w}])1\s*\\cdot\s*\\(?:spalte|vec|binom)/, "1 · Vektor"],
  [/\+\s*0(?![\d,.{])\s*(\$|$|\})/, "+ 0"],
];

for (const sch of SCHLUESSEL) {
  test(`Typ ${sch}: ${N} Aufgaben sind stimmig`, () => {
    for (let seed = 1; seed <= N; seed++) {
      const a = neueAufgabe(sch, seed * 7919);
      assert.ok(a.text && a.schritte.length && a.weg.length, `${sch}/${seed}: leer`);
      for (const t of texte(a)) {
        for (const re of VERBOTEN) assert.ok(!re.test(t), `${sch}/${seed}: ${re} in „${t}“`);
        for (const [re, name] of MUSTER) assert.ok(!re.test(t), `${sch}/${seed}: ${name} in „${t}“`);
      }
      for (const s of a.schritte) {
        if (s.art === "zahl") assert.ok(Number.isFinite(s.wert), `${sch}/${seed} ${s.id}: Wert ${s.wert}`);
        if (s.art === "wahl") assert.ok(s.optionen.some((o) => o[0] === s.richtig), `${sch}/${seed} ${s.id}: Auswahl`);
        if (s.art === "liste") {
          assert.ok(s.werte.length && s.werte.every(Number.isFinite), `${sch}/${seed} ${s.id}: Liste`);
          assert.equal(pruefeListe(s.werte.map(String).join("; "), s).wert, 0, `${sch}/${seed} ${s.id}: eigene Liste nicht erkannt`);
        }
        if (s.art === "term" || s.art === "stamm") assert.fail(`${sch}/${seed} ${s.id}: Termschritte sind in Band 2 nicht vorgesehen`);
      }
    }
  });
}

test("vekKern: Gauß, Kreuzprodukt, Betrag, Kürzen, Summen", () => {
  const g = gauss([[1, 1, 1], [2, -1, 1], [1, 2, -1]], [6, 3, 2]);
  assert.equal(g.art, "eine");
  assert.deepEqual(g.x.map(zT), ["1", "2", "3"]);
  assert.equal(gauss([[1, 2], [2, 4]], [3, 6]).art, "unendlich");
  assert.equal(gauss([[1, 2], [2, 4]], [3, 7]).art, "keine");
  assert.deepEqual(vCross(vek(1, 0, 0), vek(0, 1, 0)).map(zT), ["0", "0", "1"]);
  assert.deepEqual(vKuerzen(vek(-2, 4, 6)).map(zT), ["1", "−2", "−3"]);
  assert.equal(wurzelT(18), "3\\sqrt{2}");
  assert.equal(wurzelT(16), "4");
  assert.equal(betragWegT(vek(1, 2, 2)), "\\sqrt{1^2 + 2^2 + 2^2} = \\sqrt{9} = 3");
  assert.deepEqual(kollinearFaktor(vek(1, -2, 3), vek(-2, 4, -6)), q(-2));
  assert.equal(kollinearFaktor(vek(1, -2, 3), vek(1, 1, 1)), null);
  assert.equal(summeT([[1, "a"], [-1, "b"], [0, "c"], [-3, "d"]]), "a − b − 3d");
  assert.equal(summeT([[0, "a"]]), "0");
});
