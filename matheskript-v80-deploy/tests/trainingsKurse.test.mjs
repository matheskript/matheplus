import test from "node:test";
import assert from "node:assert/strict";
import { KURSE, kurseZu, aktuellerKurs, meineKurse, wahlUmschalten, reiterFuer, kursAnsichten } from "../src/trainingsKurse.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

test("jeder Bereich hat 3–9 Werkzeuge, alle existieren – und jedes Werkzeug steht in einem Bereich (ein Kopf für alle)", () => {
  for (const k of KURSE) {
    assert.ok(k.werkzeuge.length >= 3 && k.werkzeuge.length <= 9, k.id);
    for (const id of k.werkzeuge) assert.ok(WERKZEUGE[id], `${k.id}: ${id} fehlt in werkzeuge.js`);
  }
  const alle = new Set(KURSE.flatMap((k) => k.werkzeuge));
  for (const id of Object.keys(WERKZEUGE)) assert.ok(alle.has(id), `${id} gehört zu keinem Bereich – bekäme keinen Kopf`);
  for (const k of KURSE) assert.ok(!/Trainer|Tools/.test(k.zeile), `${k.id}: Sprachregelung (Werkzeug, nicht Trainer/Tools)`);
});

test("Ableitungstrainer und Kurvendiskussion (auch Beliebige) gehören zu Analysis", () => {
  assert.equal(aktuellerKurs("ableitungstrainer", {}).id, "analysis-ober");
  assert.equal(aktuellerKurs("advplotter", {}).id, "analysis-ober");
  assert.equal(aktuellerKurs("parabeln", {}).id, "mittel");
  assert.equal(aktuellerKurs("geradengleichung", {}).id, "mittel");
  assert.equal(aktuellerKurs("gleichverstehen", {}).id, "mittel");
  assert.equal(aktuellerKurs("kreis", {}).id, "geometrie-dreiecke");
  assert.equal(aktuellerKurs("kreuzprodukt", {}).id, "vektoren-ober");
  assert.equal(aktuellerKurs("axiome", {}).id, "fundament");
  assert.equal(aktuellerKurs("bruchrechnen", {}).id, "unterstufe-zahlen");
  assert.deepEqual(kurseZu("bernoulli").map((k) => k.id), ["stochastik-ober"]);
});

test("Wahl und Reiter", () => {
  assert.equal(meineKurse({}).quelle, "alle");
  assert.equal(meineKurse(undefined).kurse.length, KURSE.length);
  const w = meineKurse({ kurse: { gewaehlt: ["vektoren-ober", "quatsch"] } });
  assert.deepEqual([w.quelle, w.kurse.map((k) => k.id)], ["wahl", ["vektoren-ober"]]);
  const t = meineKurse({ meinTraining: { aktiv: [{ id: "k1" }], danach: [{ id: "k2" }] } }, (id) => ({ k1: "Stochastik", k2: "Grundlagen" })[id]);
  assert.deepEqual([t.quelle, t.kurse.map((k) => k.id)], ["training", ["stochastik-ober", "fundament", "gleichungen", "unterstufe-zahlen"]]);
  const st = KURSE.find((k) => k.id === "stochastik-ober");
  assert.deepEqual(wahlUmschalten([st], "analysis-ober"), ["analysis-ober", "stochastik-ober"]);
  assert.deepEqual(wahlUmschalten([st], "stochastik-ober"), []);
  const a = KURSE.find((k) => k.id === "analysis-ober");
  assert.deepEqual(reiterFuer(a, "ableitungstrainer"), a.werkzeuge);
  assert.equal(reiterFuer(a, "vektorgenerator").at(-1), "vektorgenerator");
  assert.ok(kursAnsichten().has("plotter"));
});

test("Mittelstufe: ein Kurs mit Geraden, Parabeln, Pythagoras, Gleichungen, Brüche und Wurzeln", () => {
  const m = KURSE.find((k) => k.id === "mittel");
  assert.deepEqual(m.werkzeuge, ["geradengleichung", "parabeln", "pythagoras", "gleichungen", "bruchwurzel"]);
  assert.match(m.namen.bruchwurzel, /√\(Wurzeln\)/, "Wurzelzeichen über „Wurzeln“");
  const g = meineKurse({ meinTraining: { aktiv: [{ id: "k1" }] } }, () => "Bruchrechnen");
  assert.deepEqual([g.quelle, g.kurse.map((k) => k.id)], ["training", ["mittel", "unterstufe-zahlen"]]);
  assert.ok(kursAnsichten().has("bruchwurzel") && kursAnsichten().has("geradengleichung"));
});
