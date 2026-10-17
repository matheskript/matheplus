import test from "node:test";
import assert from "node:assert/strict";
import { KAPITEL_FORMELN, kapitelAuswahl, klasseVonKapitel } from "../src/kapitelFormeln.js";
import { PLAN, SCHULARTEN, THEMEN } from "../src/schulbuch.js";
import { FS_NACH_ID } from "../src/fsIndex.js";

test("jedes Buchkapitel hat eine Formelauswahl", () => {
  for (const id of Object.keys(THEMEN)) assert.ok(KAPITEL_FORMELN[id], `${id} fehlt`);
  for (const id of Object.keys(KAPITEL_FORMELN)) assert.ok(THEMEN[id], `${id} ist kein Kapitel`);
});

test("alle Formel-Ids existieren, Vorwissen verweist auf echte Kapitel", () => {
  for (const [id, d] of Object.entries(KAPITEL_FORMELN)) {
    for (const [aus, ids] of d.vorwissen) {
      assert.ok(THEMEN[aus], `${id}: Vorwissen-Kapitel ${aus} unbekannt`);
      assert.notEqual(aus, id, `${id}: Vorwissen aus sich selbst`);
      for (const f of ids) assert.ok(FS_NACH_ID[f], `${id}: Formel ${f} unbekannt`);
    }
    assert.ok(d.kern.length >= 1, `${id}: keine Kernformeln`);
    for (const [titel, ids] of d.kern) {
      assert.ok(titel && ids.length, `${id}: leerer Abschnitt`);
      for (const f of ids) assert.ok(FS_NACH_ID[f], `${id}: Formel ${f} unbekannt`);
    }
  }
});

test("Vorwissen kommt nie aus einem späteren Kapitel", () => {
  for (const s of SCHULARTEN) {
    const plan = PLAN[s.id];
    const pos = (k) => { const b = klasseVonKapitel(s.id, k); return b ? [b.rang, plan[b.box].indexOf(k)] : null; };
    for (const [id, d] of Object.entries(KAPITEL_FORMELN)) {
      const p = pos(id);
      if (!p) continue;
      for (const [aus] of d.vorwissen) {
        const q = pos(aus);
        if (!q) continue;
        assert.ok(q[0] < p[0] || (q[0] === p[0] && q[1] < p[1]), `${s.id}: ${id} braucht ${aus}, das später kommt`);
      }
    }
  }
});

test("Auswahl: jede Formel nur einmal, Vorwissen nach Klasse sortiert", () => {
  for (const s of SCHULARTEN) {
    for (const id of Object.keys(THEMEN)) {
      const a = kapitelAuswahl(id, s.id);
      const alle = [...a.vorwissen, ...a.kern].flatMap((x) => x.ids);
      assert.equal(new Set(alle).size, alle.length, `${s.id} ${id}: doppelte Formel`);
      assert.ok(a.kern.length > 0);
    }
  }
  const f = kapitelAuswahl("ksFkt", "g9");
  assert.equal(f.klasse.label, "12");
  assert.deepEqual(f.vorwissen.map((v) => v.herkunft), ["Klasse 9", "Klasse 10", "Klasse 10", "Klasse 10", "Klasse 11"]);
  assert.equal(f.kern[0].titel, "Verschieben, Strecken, Spiegeln");
});
