import test from "node:test";
import assert from "node:assert/strict";
import { LEKTION_IDS, TAG_IDS, mergePenPaper, normalisiere } from "../src/penpaperMerge.js";

const st = (o = {}) => normalisiere(o);

test("normalisiere: leer, feste Schlüsselreihenfolge, Müll wird verworfen", () => {
  const n = st({});
  assert.deepEqual(Object.keys(n), ["lektionen", "uebungen", "tage", "zuletzt", "_zeit"]);
  assert.equal(LEKTION_IDS.length, 9);
  assert.equal(TAG_IDS.length, 7);
  assert.deepEqual(st(null), st(undefined));
  const k = st({ lektionen: { l1: { fertig: 1, zeit: 5 }, l99: { fertig: true, zeit: 3 } }, uebungen: { "zaun-1": { geloest: "ja", versuche: -2 }, "BÖSE id": { geloest: true } },
    tage: { t3: { an: true, zeit: 9 }, t9: { an: true } }, zuletzt: { id: "l4", zeit: 2 } });
  assert.deepEqual(k.lektionen, { l1: { fertig: true, zeit: 5 } });
  assert.deepEqual(k.uebungen, { "zaun-1": { geloest: true, versuche: 0, zeit: 0 } });
  assert.deepEqual(k.tage, { t3: { an: true, zeit: 9 } });
  assert.deepEqual(k.zuletzt, { id: "l4", zeit: 2 });
  assert.equal(st({ zuletzt: { id: "x", zeit: 1 } }).zuletzt, null);
});

test("merge: Lektionen und Tage – jüngerer Eintrag gewinnt, auch ein Zurücknehmen", () => {
  const a = st({ lektionen: { l0: { fertig: true, zeit: 10 }, l1: { fertig: true, zeit: 50 } }, tage: { t1: { an: true, zeit: 5 } } });
  const b = st({ lektionen: { l0: { fertig: false, zeit: 20 }, l2: { fertig: true, zeit: 1 } }, tage: { t1: { an: false, zeit: 8 } } });
  const m = mergePenPaper(a, b);
  assert.deepEqual(m.lektionen, { l0: { fertig: false, zeit: 20 }, l1: { fertig: true, zeit: 50 }, l2: { fertig: true, zeit: 1 } });
  assert.deepEqual(m.tage, { t1: { an: false, zeit: 8 } });
  assert.deepEqual(mergePenPaper(b, a), m);
  assert.deepEqual(mergePenPaper(m, m), m);
});

test("merge: Übungen – einmal gelöst bleibt gelöst, Versuche = Maximum; zuletzt = jüngerer", () => {
  const a = st({ uebungen: { reste: { geloest: true, versuche: 3, zeit: 10 } }, zuletzt: { id: "l2", zeit: 10 } });
  const b = st({ uebungen: { reste: { geloest: false, versuche: 7, zeit: 20 }, zaun: { geloest: false, versuche: 1, zeit: 1 } }, zuletzt: { id: "l5", zeit: 30 } });
  const m = mergePenPaper(a, b);
  assert.deepEqual(m.uebungen.reste, { geloest: true, versuche: 7, zeit: 20 });
  assert.deepEqual(m.uebungen.zaun, { geloest: false, versuche: 1, zeit: 1 });
  assert.deepEqual(m.zuletzt, { id: "l5", zeit: 30 });
  assert.deepEqual(mergePenPaper(b, a), m);
});
