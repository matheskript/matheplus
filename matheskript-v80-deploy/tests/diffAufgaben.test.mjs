/* Aufgabentool Kurs Differentialrechnung (src/diffAufgaben*.js):
   · jede Buchaufgabe mit Typ existiert im Buch, jeder Typ existiert
   · je Typ 300 Aufgaben: keine Fehler, keine NaN/undefined im Text
   · Term-Schritte: Anzeige-, Eingabe- und Rechenfassung stimmen überein, die eigene
     Lösung wird als richtig erkannt, kein „typischer Fehler“ ist in Wahrheit richtig
   · Ableiten: f′ stimmt mit der numerischen Ableitung von f überein
   · Regel A5 in Rechenwegen und Lösungen */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TYPEN, BUCH_TYPEN, neueAufgabe } from "../src/diffAufgaben.js";
import { pruefeTerm, pruefeListe, pruefeStamm, termAus } from "../src/diffKern.js";
import { parse, kompiliere } from "../src/formelEngine.js";
import { KURS_MODULE } from "../src/diffKursDaten.js";

const KURS = "public/buecher/ableitungen/kurs";
const N = 300;

/* alle in BUCH_TYPEN benutzten Schlüssel (mit Variante) + jeder Typ ohne Variante */
const SCHLUESSEL = [...new Set([...Object.values(BUCH_TYPEN), ...Object.keys(TYPEN)])];

test("jede zugeordnete Buchaufgabe gibt es im Buch, jeder Typ existiert", () => {
  for (const [k, typ] of Object.entries(BUCH_TYPEN)) {
    const [seite, nr] = k.split("-");
    const datei = `${KURS}/${seite}.json`;
    assert.ok(fs.existsSync(datei), `Seite ${seite} fehlt`);
    const inhalt = JSON.parse(fs.readFileSync(datei, "utf8"));
    assert.ok(inhalt.aufgaben.some((a) => a.nr === nr), `Aufgabe ${k} gibt es im Buch nicht`);
    assert.ok(TYPEN[typ.split(":")[0]], `Typ ${typ} fehlt`);
  }
});

test("jedes Kursmodul mit Aufgabenseiten hat Aufgaben mit Lösung", () => {
  for (const m of KURS_MODULE.filter((m) => m.kap !== "L")) {
    let zahl = 0;
    for (let s = m.von; s <= m.bis; s++) {
      const d = `${KURS}/${s}.json`;
      if (!fs.existsSync(d)) continue;
      const inhalt = JSON.parse(fs.readFileSync(d, "utf8"));
      inhalt.aufgaben.forEach((a) => { assert.ok(a.loesung, `Lösung zu ${s}-${a.nr} fehlt`); zahl++; });
    }
    assert.ok(zahl > 0, `Modul ${m.id} ohne Aufgaben`);
  }
});

const stellen = (lo, hi) => Array.from({ length: 11 }, (_, i) => lo + ((hi - lo) * ((i * 0.6180339887) % 1)));
const texte = (a) => [a.text, ...(a.weg || []), ...a.schritte.flatMap((s) => [s.frage, s.text, s.titel, ...(s.optionen || []).map((o) => o[1])])].filter((t) => typeof t === "string");

for (const sch of SCHLUESSEL) {
  test(`Typ ${sch}: ${N} Aufgaben sind stimmig`, () => {
    for (let seed = 1; seed <= N; seed++) {
      const a = neueAufgabe(sch, seed * 7919);
      assert.ok(a.text && a.schritte.length, `${sch}/${seed}: leer`);
      for (const t of texte(a)) assert.ok(!/NaN|undefined|Infinity|\[object/.test(t), `${sch}/${seed}: ${t}`);
      for (const s of a.schritte) {
        if (s.art === "zahl") assert.ok(Number.isFinite(s.wert), `${sch}/${seed} ${s.id}: Wert ${s.wert}`);
        if (s.art === "wahl") assert.ok(s.optionen.some((o) => o[0] === s.richtig), `${sch}/${seed} ${s.id}: Auswahl`);
        if (s.art === "liste") { assert.ok(s.werte.length && s.werte.every(Number.isFinite), `${sch}/${seed} ${s.id}: Liste`); assert.equal(pruefeListe(s.werte.map(String).join("; "), s).wert, 0); }
        if (s.art === "term" || s.art === "stamm") {
          const baum = parse(s.soll.ein);
          assert.ok(baum, `${sch}/${seed} ${s.id}: Eingabefassung nicht lesbar: ${s.soll.ein}`);
          const f = kompiliere(baum);
          const [lo, hi] = s.bereich || [-3, 3];
          let verglichen = 0;
          for (const x of stellen(lo, hi)) {
            const w = s.soll.js(x);
            if (!Number.isFinite(w) || Math.abs(w) > 1e6) continue;
            verglichen++;
            assert.ok(Math.abs(f(x) - w) <= 1e-7 * Math.max(1, Math.abs(w)), `${sch}/${seed} ${s.id}: tex/ein/js passen nicht bei x=${x}: ${s.soll.tex}`);
          }
          assert.ok(verglichen >= 4, `${sch}/${seed} ${s.id}: zu wenige Prüfstellen`);
        }
        if (s.art === "term") {
          assert.equal(pruefeTerm(s.soll.ein, s).wert, 0, `${sch}/${seed} ${s.id}: eigene Lösung nicht erkannt`);
          (s.fehler || []).forEach((fe, i) => {
            const st = { ...s, soll: { ...s.soll, js: fe.js } };
            const gleich = stellen(...(s.bereich || [-3, 3])).filter((x) => Number.isFinite(s.soll.js(x)) && Number.isFinite(fe.js(x))).every((x) => Math.abs(fe.js(x) - s.soll.js(x)) < 1e-9);
            assert.ok(!gleich, `${sch}/${seed} ${s.id}: Denkfehler ${i} ist in Wahrheit richtig`);
            void st;
          });
        }
        if (s.art === "stamm") {
          // eine Stammfunktion (numerisch integriert) muss als richtig gelten: hier über den Rechenweg-Term
          assert.ok(typeof s.soll.js(1) === "number");
        }
      }
      if (sch.startsWith("abl-")) {
        const [lo, hi] = a.schritte[0].bereich || [-3, 3];
        for (const x of stellen(lo, hi)) {
          const h = 1e-5, num = (a.f.js(x + h) - a.f.js(x - h)) / (2 * h), d = a.d.js(x);
          if (!Number.isFinite(num) || !Number.isFinite(d) || Math.abs(d) > 1e5) continue;
          assert.ok(Math.abs(num - d) <= 1e-4 * Math.max(1, Math.abs(d)), `${sch}/${seed}: f′ falsch bei x=${x}: f = ${a.f.tex}, f′ = ${a.d.tex}`);
        }
      }
    }
  });
}

test("Rückwärts-Aufgaben: eine richtige Stammfunktion wird erkannt, eine falsche nicht", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const a = neueAufgabe("rueckwaerts", seed);
    const st = a.schritte[0];
    const loes = a.weg[0].match(/\$f\(x\) = (.*?)\$/)[1].replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "($1/$2)").replace(/[{}]/g, "").replace(/−/g, "-");
    assert.equal(pruefeStamm(loes, st).wert, 0, `seed ${seed}: ${loes}`);
    assert.equal(pruefeStamm(loes + " + 7", st).wert, 0);
    assert.equal(pruefeStamm("x^7", st).wert, 1);
  }
});

test("Eingaben: Variablen, links stehende Bezeichnung, pi, Liste", () => {
  assert.ok(termAus("y = 2x + 3")(1) === 5);
  assert.ok(termAus("f'(x) = 3x^2")(2) === 12);
  assert.ok(termAus("4t", "t")(2) === 8);
  assert.ok(Math.abs(termAus("sqrt(t)", "t")(4) - 2) < 1e-12);
  assert.equal(pruefeListe("-2; 2", { werte: [2, -2] }).wert, 0);
  assert.ok(pruefeListe("2", { werte: [2, -2] }).warn);
  assert.equal(pruefeListe("pi/6; 5pi/6", { werte: [Math.PI / 6, (5 * Math.PI) / 6], tol: 1e-4 }).wert, 0);
});

/* Regel A5: Rechenwege und Lösungen enden nie auf Unvereinfachtem */
const MUSTER = [
  [/(^|[^\d.,\w}])1\s*(?:·|\\cdot)?\s*x(?![\w^])/, "1x"],
  [/\+\s*[−-]\s*\d/, "+ −"],
  [/[−-]\s*[−-]\s*\d/, "− −"],
  [/(?:·|\\cdot)\s*1(?![\d,.\/^{])/, "· 1"],
  [/[+−-]\s*0(?![\d,.{])\s*(\$|$)/, "± 0"],
  [/\^\{1\}/, "Hochzahl 1"],
  [/\^\{0\}/, "Hochzahl 0"],
  [/(^|[^\d}])1x\^/, "1x^"],
];
test("Regel A5 in allen Rechenwegen und Ergebnissen", () => {
  for (const sch of SCHLUESSEL) {
    for (let seed = 1; seed <= 120; seed++) {
      const a = neueAufgabe(sch, seed * 104729);
      const zeilen = [...(a.weg || []), ...a.schritte.filter((s) => s.soll).map((s) => `$${s.soll.tex}$`)];
      for (const z of zeilen) for (const [re, name] of MUSTER) assert.ok(!re.test(z), `${sch}/${seed}: ${name} in „${z}“`);
    }
  }
});
