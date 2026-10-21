/* Kapitelseite: jede Kapitel-Id aus schulbuch.js liefert eine vollständige Übersicht, Pfade hin und zurück */
import { test } from "node:test";
import assert from "node:assert/strict";
import { THEMEN, PLAN, klassenBoxen } from "../src/schulbuch.js";
import { kapitelUebersicht, boxFuerKapitel, istKapitel } from "../src/kapitelSeite.js";
import { pfadAufloesen, pfadFuer } from "../src/pfade.js";
import { klassenInhalt } from "../src/hauptmenue.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

test("jedes Kapitel jeder Schulart hat eine Kapitelseite", () => {
  for (const sa of Object.keys(PLAN)) {
    for (const [box, ids] of Object.entries(PLAN[sa])) {
      ids.forEach((id, i) => {
        const k = kapitelUebersicht(id, sa, box);
        assert.ok(k, `${sa}/${box}/${id}`);
        assert.equal(k.box, String(box));
        assert.ok(k.nr, `${id}: römische Nummer`);
        assert.equal(k.titel, THEMEN[id].titel);
        assert.equal(!!k.vor, i > 0, `${id}: vorheriges Kapitel`);
        assert.equal(!!k.nach, i < ids.length - 1, `${id}: nächstes Kapitel`);
        assert.equal(k.trainieren.ansicht, "trainieren");
        for (const w of k.werkzeuge) assert.ok(WERKZEUGE[w.id], w.id);
        for (const t of k.teile) assert.match(t.id, new RegExp(`^${id}\\.\\d+$`));
      });
    }
  }
});

test("Kapitelseite: Box wird gefunden, falsche Box korrigiert, Unsinn abgelehnt", () => {
  assert.equal(boxFuerKapitel("ganzrat", "g9"), "11");
  assert.equal(boxFuerKapitel("ganzrat", "g9", "8"), "11");
  assert.equal(kapitelUebersicht("gibtsnicht", "g9"), null);
  assert.equal(istKapitel("constructor"), false);
  assert.ok(kapitelUebersicht("ganzrat", "quatsch"), "unbekannte Schulart fällt auf G9 zurück");
});

test("Pfad /kapitel/<id> hin und zurück, auch für gemischt geschriebene Ids", () => {
  const klein = new Set();
  for (const id of Object.keys(THEMEN)) {
    const p = pfadFuer({ ansicht: "kapitel", kapitel: id });
    assert.equal(p, `/kapitel/${id.toLowerCase()}`);
    assert.ok(!klein.has(id.toLowerCase()), `Pfad doppelt: ${id}`);
    klein.add(id.toLowerCase());
    const z = pfadAufloesen(p);
    assert.equal(z.ansicht, "kapitel");
    assert.equal(z.kapitel, id);
  }
  assert.equal(pfadAufloesen("/kapitel/gibtsnicht"), null);
  assert.equal(pfadAufloesen("/kapitel").ansicht, "kapitel");
});

test("Menü: jedes Kapitel hat neben „Trainieren“ ein Ziel für die Kapitelseite", () => {
  for (const sa of ["g8", "g9", "gms"]) {
    for (const b of klassenBoxen(sa)) {
      for (const k of klassenInhalt({ schulart: sa, box: b.id }).kapitel) {
        assert.deepEqual(k.seite, { ansicht: "kapitel", kapitel: k.id, schulart: sa, klasse: b.id });
        assert.ok(kapitelUebersicht(k.seite.kapitel, sa, b.id));
      }
    }
  }
});
