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
  assert.equal(aktuellerKurs("parabeln", {}), null);
  assert.deepEqual(kurseZu("bernoulli").map((k) => k.id), ["stochastik-ober"]);
});

test("Wahl und Reiter", () => {
  assert.equal(meineKurse({}).quelle, "alle");
  assert.equal(meineKurse(undefined).kurse.length, KURSE.length);
  const w = meineKurse({ kurse: { gewaehlt: ["vektoren-ober", "quatsch"] } });
  assert.deepEqual([w.quelle, w.kurse.map((k) => k.id)], ["wahl", ["vektoren-ober"]]);
  const t = meineKurse({ meinTraining: { aktiv: [{ id: "k1" }], danach: [{ id: "k2" }] } }, (id) => ({ k1: "Stochastik", k2: "Grundlagen" })[id]);
  assert.deepEqual([t.quelle, t.kurse.map((k) => k.id)], ["training", ["stochastik-ober"]]);
  assert.deepEqual(wahlUmschalten([KURSE[2]], "analysis-ober"), ["analysis-ober", "stochastik-ober"]);
  assert.deepEqual(wahlUmschalten([KURSE[2]], "stochastik-ober"), []);
  const a = KURSE[0];
  assert.deepEqual(reiterFuer(a, "ableitungstrainer"), a.werkzeuge);
  assert.equal(reiterFuer(a, "stammintegral").at(-1), "stammintegral");
  assert.ok(kursAnsichten().has("plotter"));
});
