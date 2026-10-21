/* Kapitelseiten: jedes Buchkapitel hat Text, Pfad und eine vollständige Seite (src/kapitelSeite.js, kapitelSeiten.js, kapitelPfade.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { THEMEN, PLAN, klassenBoxen } from "../src/schulbuch.js";
import { KAPITEL_TEXT } from "../src/kapitelSeiten.js";
import { KAPITEL_SLUG, kapitelAusSlug, kapitelPfad } from "../src/kapitelPfade.js";
import { kapitelSeite, kapitelKontext, bautDaraufAuf } from "../src/kapitelSeite.js";
import { pfadAufloesen, pfadFuer } from "../src/pfade.js";
import { klassenInhalt } from "../src/hauptmenue.js";

const ids = Object.keys(THEMEN);

test("jedes Kapitel hat Einstieg und genau drei Ziele", () => {
  for (const id of ids) {
    const t = KAPITEL_TEXT[id];
    assert.ok(t, `Text fehlt: ${id}`);
    assert.ok(t.einstieg.length > 40, `Einstieg zu kurz: ${id}`);
    assert.equal(t.ziele.length, 3, `drei Ziele: ${id}`);
    for (const z of t.ziele) {
      assert.ok(!/[.!]$/.test(z), `Ziel ohne Schlusspunkt (die Seite setzt ihn): ${id} – ${z}`);
      assert.ok(!/^Am Ende/i.test(z), `Ziel ohne „Am Ende kannst du“: ${id}`);
    }
    assert.ok(!/\*innen|:innen|Innen\b/.test(t.einstieg + t.ziele.join(" ")), `keine Gendersprache: ${id}`);
  }
  for (const id of Object.keys(KAPITEL_TEXT)) assert.ok(THEMEN[id], `Text zu unbekanntem Kapitel: ${id}`);
});

test("Pfade /kapitel/<slug> sind eindeutig und lösen auf", () => {
  const slugs = Object.values(KAPITEL_SLUG);
  assert.equal(new Set(slugs).size, slugs.length, "Slugs eindeutig");
  for (const id of ids) {
    assert.match(KAPITEL_SLUG[id], /^[a-z0-9-]+$/);
    assert.equal(kapitelAusSlug(KAPITEL_SLUG[id]), id);
    const z = pfadAufloesen(kapitelPfad(id));
    assert.equal(z.ansicht, "kapitel"); assert.equal(z.kapitel, id);
    assert.equal(pfadFuer({ ansicht: "kapitel", kapitel: id }), kapitelPfad(id));
  }
  assert.equal(pfadFuer({ ansicht: "kapitel" }), "/kapitel");
  assert.equal(pfadAufloesen("/kapitel/gibt-es-nicht"), null);
  assert.equal(KAPITEL_SLUG.ksLgs, "lineare-gleichungssysteme-oberstufe");
});

test("jede Kapitelseite in jeder Klasse ist vollständig", () => {
  for (const sa of Object.keys(PLAN)) {
    for (const b of klassenBoxen(sa)) {
      for (const id of PLAN[sa][b.id] || []) {
        const d = kapitelSeite(id, { schulart: sa, klasse: b.id });
        assert.ok(d, `${sa}/${b.id}/${id}`);
        assert.equal(d.kontext.klasse, b.id, `Klasse bleibt: ${id}`);
        assert.ok(d.kontext.nr, `Nummer im Buch: ${id}`);
        assert.ok(d.teile.length >= 3, `Unterthemen: ${id}`);
        assert.equal(d.trainieren.ansicht, "trainieren");
        for (const u of d.teile) if (u.wz) assert.ok(u.wz.ziel && u.wz.ziel.ansicht, `Werkzeug-Ziel: ${u.id}`);
        for (const v of d.vorwissen) assert.ok(THEMEN[v.kapitel]);
        for (const k of d.danach) assert.notEqual(k.kapitel, id);
      }
    }
  }
});

test("Kontext: Nachbarkapitel und Kapitel aus anderer Schulart", () => {
  const k = kapitelKontext("diff1", "g9", "11");
  assert.equal(k.nr, "II"); assert.equal(k.vorher.id, "ganzrat"); assert.equal(k.nachher.id, "ablregeln");
  const t = kapitelKontext("teilbarkeit", "g9");   // steht nur im G8-Plan
  assert.equal(t.schulart, "g8"); assert.ok(t.nr);
  assert.ok(bautDaraufAuf("ganzrat").some((x) => x.kapitel === "ksDiff"));
});

test("Menü: jedes Kapitel der Klasse hat Kapitelseite und Training", () => {
  const inhalt = klassenInhalt({ schulart: "g9", box: "11" });
  assert.equal(inhalt.kapitel.length, 6);
  for (const k of inhalt.kapitel) {
    assert.deepEqual(k.seite, { ansicht: "kapitel", kapitel: k.id, schulart: "g9", klasse: "11" });
    assert.equal(k.trainieren.ansicht, "trainieren");
  }
});
