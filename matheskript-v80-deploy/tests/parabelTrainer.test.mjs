/* Parabel-Trainer: jede Aufgabe ist lösbar, die hinterlegte Lösung wird als richtig erkannt,
   Denkfehler werden erkannt, die Graphen bleiben im Bild, Lösungswege nach Regel A5. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { TYPEN, alleTypIds, neueAufgabe, pruefeTeil, loesungText, reglerKurve, reglerTex, produktTex } from "../src/parabelTrainer.js";
import { q } from "../src/rechnen2.js";

const THEMA_VON = (id) => (id[0] === "n" ? "normal" : id[0] === "s" ? "scheitel" : "null");
const wert = (k, x) => k.a * x * x + k.b * x + k.c;

test("jeder Aufgabentyp ist registriert", () => {
  const ids = Object.values(TYPEN).flat().map((t) => t.id).sort();
  assert.deepEqual(ids, alleTypIds().sort());
});

for (const id of alleTypIds()) {
  test(`${id}: 300 Aufgaben je Stufe – Lösung richtig, Struktur vollständig`, () => {
    for (const stufe of [1, 2, 3]) for (let i = 0; i < 300; i++) {
      const a = neueAufgabe(THEMA_VON(id), id, stufe);
      assert.equal(a.typ, id);
      assert.ok(a.frage && a.teile.length >= 1 && a.loesung.length >= 1, "Frage, Teile, Lösung");
      assert.ok(a.hilfe && a.hilfe.verstehen && a.hilfe.ansatz && a.hilfe.regel && a.hilfe.pruefen, "Hilfe");
      const k = a.kurve;
      assert.ok(Number.isFinite(k.a) && k.a !== 0, "a ≠ 0");
      const xs = -k.b / (2 * k.a), ys = wert(k, xs);
      assert.ok(Math.abs(xs) <= 5 + 1e-9 && Math.abs(ys) <= 5 + 1e-9, `${id}: Scheitel im Bild (${xs}|${ys})`);
      for (const t of a.teile) {
        const r = pruefeTeil(t, loesungText(t));
        assert.equal(r.ok, true, `${id}: Lösung nicht erkannt (${JSON.stringify(t.frage)})`);
        if (t.art === "zahl") {
          assert.equal(pruefeTeil(t, t.felder.map(() => "")).ok, false);
          // Denkfehler dürfen nie mit der richtigen Lösung zusammenfallen
          for (const f of t.fehler || []) {
            const fw = (f.werte || [f.wert]).map((x) => (x.n === 1 ? String(x.z) : `${x.z}/${x.n}`));
            if (fw.length !== t.felder.length) continue;
            const rf = pruefeTeil(t, fw);
            if (!rf.ok) assert.ok(rf.text.length > 5);
          }
        }
        if (t.art === "wahl") {
          const ids = t.optionen.map((o) => o.id);
          assert.equal(new Set(ids).size, ids.length);
          const anzeige = t.optionen.map((o) => JSON.stringify(o.kurve || o.tex || o.text));
          assert.equal(new Set(anzeige).size, anzeige.length, `${id}: doppelte Antwortmöglichkeit`);
          for (const o of t.optionen) if (o.id !== t.richtig) assert.equal(pruefeTeil(t, o.id).ok, false);
        }
        if (t.art === "regler") {
          assert.equal(pruefeTeil(t, t.start).ok, false, "Start ist nicht schon das Ziel");
          const z = reglerKurve(t.form, t.ziel);
          for (const x of [-2, 0, 1, 3]) assert.ok(Math.abs(wert(z, x) - wert(k, x)) < 1e-9, "Zielkurve = Aufgabe");
          // Ziel mit den Reglerschritten erreichbar
          for (const p of t.params) assert.ok(Math.abs(Math.round((t.ziel[p] - t.start[p]) / t.schritt[p]) * t.schritt[p] - (t.ziel[p] - t.start[p])) < 1e-9);
        }
      }
    }
  });
}

test("Nullstellen: Reihenfolge egal, Vorzeichenfalle erkannt", () => {
  const t = { art: "zahl", ungeordnet: true, felder: [{ name: "x_1", wert: q(-2) }, { name: "x_2", wert: q(3) }], fehler: [{ werte: [q(2), q(-3)], text: "Vorzeichenfalle" }] };
  assert.equal(pruefeTeil(t, ["3", "−2"]).ok, true);
  assert.equal(pruefeTeil(t, ["-2", "3"]).ok, true);
  assert.equal(pruefeTeil(t, ["-3", "2"]).text, "Vorzeichenfalle");
  assert.match(pruefeTeil(t, ["3", "5"]).text, /Eine Nullstelle stimmt/);
});

test("Zahlen: Brüche, Komma und Unicode-Minus werden gelesen", () => {
  const t = { art: "zahl", felder: [{ name: "a", wert: q(-1, 2) }] };
  for (const e of ["-1/2", "−1/2", "-0,5", "-0.5", " −0,5 "]) assert.equal(pruefeTeil(t, [e]).ok, true, e);
  assert.equal(pruefeTeil(t, ["abc"]).ok, false);
});

test("Scheitel ablesen: Vorzeichenfalle bei x_s", () => {
  for (let i = 0; i < 200; i++) {
    const a = neueAufgabe("scheitel", "s-ablesen", 2);
    const t = a.teile[0];
    const [xs, ys] = t.felder.map((f) => f.wert);
    const r = pruefeTeil(t, [String(-xs.z), String(ys.z)]);
    if (xs.z !== 0) { assert.equal(r.ok, false); assert.match(r.text, /Vorzeichen|Sign/); }
  }
});

test("Produktform und Regler-Formel ohne unvereinfachte Reste", () => {
  assert.equal(produktTex(q(1), q(2), q(-3)), "(x − 2)(x + 3)");
  assert.equal(produktTex(q(-1), q(0), q(4)), "−x(x − 4)");
  assert.equal(produktTex(q(2), q(1), q(1)), "2(x − 1)^2");
  assert.equal(reglerTex("normal", { a: 1, b: 0, c: -3 }), "f(x) = x^2 − 3");
  assert.equal(reglerTex("scheitel", { a: -0.5, d: 2, e: 0 }), "f(x) = −\\frac{1}{2}(x − 2)^2");
});

/* Regel A5 – dieselben Muster wie in tests/a5.test.mjs */
const N = String.raw`\d+(?:[.,]\d+)?`;
const MUSTER = [
  [new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), "Zahl ± Zahl am Zeilenende"],
  [/(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, "1x"],
  [/\+\s*[−-]\s*\d/, "+ −"],
  [/[−-]\s*[−-]\s*\d/, "− −"],
  [/[+−-]\s*0(?![\d,.])\s*$/, "± 0"],
  [/\^\{?1\}?(?![\d])/, "Hochzahl 1"],
];
test("Regel A5: Formeln und Lösungswege vollständig vereinfacht", () => {
  const funde = new Set();
  for (const id of alleTypIds()) for (const stufe of [1, 2, 3]) for (let i = 0; i < 150; i++) {
    const a = neueAufgabe(THEMA_VON(id), id, stufe);
    const texte = [a.formel || "", ...a.loesung, ...a.teile.flatMap((t) => (t.optionen || []).map((o) => o.tex || ""))];
    for (const t of texte) for (const s of t.split(/\\quad|,\s/)) for (const [re, was] of MUSTER) {
      const m = re.exec(s.trim());
      if (!m) continue;
      if (/=/.test(s.trim().slice(m.index + m[0].length))) continue;
      funde.add(`${id}: ${was} → ${s.trim()}`);
    }
  }
  assert.deepEqual([...funde].slice(0, 20), []);
});
