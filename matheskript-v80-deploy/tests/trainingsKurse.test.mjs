import test from "node:test";
import assert from "node:assert/strict";
import { KURSE, kurseZu, aktuellerKurs, gewaehlteKurse, reiterFuer, kursAnsichten } from "../src/trainingsKurse.js";
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
  assert.equal(gewaehlteKurse({}).length, KURSE.length);
  assert.deepEqual(gewaehlteKurse({ gewaehlt: ["vektoren-ober", "quatsch"] }).map((k) => k.id), ["vektoren-ober"]);
  const a = KURSE[0];
  assert.deepEqual(reiterFuer(a, "ableitungstrainer"), a.werkzeuge);
  assert.equal(reiterFuer(a, "stammintegral").at(-1), "stammintegral");
  assert.ok(kursAnsichten().has("plotter"));
});
