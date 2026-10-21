import test from "node:test";
import assert from "node:assert/strict";
import { KURSE, kurseZu, aktuellerKurs, meineKurse, wahlUmschalten, reiterFuer, kursAnsichten } from "../src/trainingsKurse.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

test("jeder Kurs hat 5–6 Trainer, alle existieren", () => {
  for (const k of KURSE) {
    assert.ok(k.werkzeuge.length >= 5 && k.werkzeuge.length <= 6, k.id);
    for (const id of k.werkzeuge) assert.ok(WERKZEUGE[id], `${k.id}: ${id} fehlt in werkzeuge.js`);
  }
});

test("Ableitungstrainer und Kurvendiskussion (auch Beliebige) gehören zu Analysis", () => {
  assert.equal(aktuellerKurs("ableitungstrainer", {}).id, "analysis-ober");
  assert.equal(aktuellerKurs("advplotter", {}).id, "analysis-ober");
  assert.equal(aktuellerKurs("parabeln", {}).id, "mittel");
  assert.equal(aktuellerKurs("geradengleichung", {}).id, "mittel");
  assert.equal(aktuellerKurs("gleichverstehen", {}).id, "mittel");
  assert.equal(aktuellerKurs("kreis", {}), null);
  assert.deepEqual(kurseZu("bernoulli").map((k) => k.id), ["stochastik-ober"]);
});

test("Wahl und Reiter", () => {
  assert.equal(meineKurse({}).quelle, "alle");
  assert.equal(meineKurse(undefined).kurse.length, KURSE.length);
  const w = meineKurse({ kurse: { gewaehlt: ["vektoren-ober", "quatsch"] } });
  assert.deepEqual([w.quelle, w.kurse.map((k) => k.id)], ["wahl", ["vektoren-ober"]]);
  const t = meineKurse({ meinTraining: { aktiv: [{ id: "k1" }], danach: [{ id: "k2" }] } }, (id) => ({ k1: "Stochastik", k2: "Grundlagen" })[id]);
  assert.deepEqual([t.quelle, t.kurse.map((k) => k.id)], ["training", ["stochastik-ober"]]);
  assert.deepEqual(wahlUmschalten([KURSE[3]], "analysis-ober"), ["analysis-ober", "stochastik-ober"]);
  assert.deepEqual(wahlUmschalten([KURSE[3]], "stochastik-ober"), []);
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
  assert.deepEqual([g.quelle, g.kurse.map((k) => k.id)], ["training", ["mittel"]]);
  assert.ok(kursAnsichten().has("bruchwurzel") && kursAnsichten().has("geradengleichung"));
});
