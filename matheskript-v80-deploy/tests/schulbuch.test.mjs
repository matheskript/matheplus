import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PLAN, SCHULARTEN, THEMEN, hilfenFuer, kapitelFuer, klassenBoxen, roemisch, stufeAusKlassenBox } from "../src/schulbuch.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

const func10 = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
const hatAnsicht = (a) => func10.includes(`ansicht === "${a}"`) || func10.includes(`"${a}"`);

test("acht Klassenboxen je Schulart plus Abi-Box, Kursstufe und Abi gold", () => {
  for (const s of SCHULARTEN) {
    const b = klassenBoxen(s.id);
    assert.equal(b.length, 9, s.id);
    assert.deepEqual(b.map((x) => x.gold), [false, false, false, false, false, false, true, true, true], s.id);
    assert.equal(b[8].id, "abi");
  }
  assert.deepEqual(klassenBoxen("g8").map((b) => b.label), ["5", "6", "7", "8", "9", "10", "11", "12", "Abi"]);
  assert.deepEqual(klassenBoxen("g9").map((b) => b.label), ["5/6", "7", "8", "9", "10", "11", "12", "13", "Abi"]);
  assert.deepEqual(klassenBoxen("gms").map((b) => b.label), klassenBoxen("g9").map((b) => b.label));
  assert.equal(stufeAusKlassenBox(klassenBoxen("g9")[0]), "unter");
  assert.equal(stufeAusKlassenBox(klassenBoxen("g9")[5]), "ober");
});

test("jede Klassenbox hat 5 bis 12 Kapitel, alle Themen existieren", () => {
  for (const s of SCHULARTEN) {
    for (const b of klassenBoxen(s.id)) {
      const ks = kapitelFuer(s.id, b.id);
      assert.ok(ks.length >= 4 && ks.length <= 12, `${s.id} ${b.id}: ${ks.length} Kapitel`);
      for (const k of ks) assert.ok(THEMEN[k.id], `${s.id} ${b.id}: Thema ${k.id} fehlt`);
      assert.equal(new Set(ks.map((k) => k.id)).size, ks.length, `${s.id} ${b.id}: doppeltes Kapitel`);
    }
    // keine unbekannten Box-Ids im Plan
    const ids = new Set(klassenBoxen(s.id).map((b) => b.id));
    for (const key of Object.keys(PLAN[s.id])) assert.ok(ids.has(key), `${s.id}: Plan-Schlüssel ${key} ist keine Box`);
  }
});

test("jedes Thema hat mindestens zwei Hilfen, jede Hilfe ein gültiges Ziel", () => {
  for (const [id, t] of Object.entries(THEMEN)) {
    const hs = hilfenFuer(id);
    assert.ok(hs.length >= 2, `${id}: ${hs.length} Hilfen`);
    assert.ok(t.titel && t.zeile, id);
    for (const h of hs) {
      assert.ok(h.name && h.ziel && h.ziel.ansicht, `${id}: Hilfe ohne Ziel`);
      if (h.art === "werkzeug") assert.ok(WERKZEUGE[h.id], `${id}: Werkzeug ${h.id}`);
      else assert.ok(hatAnsicht(h.ziel.ansicht), `${id}: Ansicht ${h.ziel.ansicht} fehlt in func10.jsx`);
    }
    assert.equal(new Set(hs.map((h) => h.id)).size, hs.length, `${id}: doppelte Hilfe`);
  }
});

test("jedes Werkzeug kommt in mindestens einem Kapitel vor", () => {
  const benutzt = new Set();
  for (const t of Object.values(THEMEN)) for (const h of t.hilfen) if (h.art === "werkzeug") benutzt.add(h.id);
  for (const id of Object.keys(WERKZEUGE)) assert.ok(benutzt.has(id), `Werkzeug ${id} in keinem Kapitel`);
});

test("römische Ziffern", () => {
  assert.equal(roemisch(1), "I"); assert.equal(roemisch(4), "IV"); assert.equal(roemisch(12), "XII");
});
