import test from "node:test";
import assert from "node:assert/strict";
import { drehe, wahlDrehen } from "../src/antwortReihenfolge.js";
import { termAufgabe, TERM_ARTEN } from "../src/bruchGen.js";

test("drehen behält alle Antworten und verteilt die richtige auf alle Plätze", () => {
  assert.deepEqual(drehe(["a", "b", "c"], 1), ["b", "c", "a"]);
  assert.deepEqual(drehe(["a", "b", "c"], -1), ["c", "a", "b"]);
  const plaetze = new Set();
  for (let seed = 0; seed < 6; seed++) {
    const [st] = wahlDrehen([{ typ: "wahl", optionen: [["a", 1], ["b", 2], ["c", 3]], richtig: "a" }], seed);
    assert.equal(st.optionen.length, 3);
    plaetze.add(st.optionen.findIndex((o) => o[0] === st.richtig));
  }
  assert.deepEqual([...plaetze].sort(), [0, 1, 2]);
  assert.deepEqual(wahlDrehen([{ typ: "zahl", wert: 3 }], 2), [{ typ: "zahl", wert: 3 }]);
  assert.ok(TERM_ARTEN.every((a) => termAufgabe(a)));
});
