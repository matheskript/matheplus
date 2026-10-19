/* Hauptthema in „Dein Training startet hier.“ (hauptthema.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { THEMEN } from "../src/schulbuch.js";
import { unterthemen } from "../src/unterthemen.js";
import { skillsVonGenerator } from "../src/ebbinghaus.js";
import { planErstellen } from "../src/trainingsplan.js";
import { countdown, datumLang, erledigtUebertragen, hauptthemaPruefen, kapitelStand, naechstesKapitel, standAusGeneratoren, standZeile, vorwissenStand } from "../src/hauptthema.js";

const HEUTE = "2026-10-19";
const skill = (id, over = {}) => ({ skill_id: id, first_learned_at: null, last_result: null, mastery_status: "neu",
  review_history: [{ at: "2026-10-18T10:00:00Z", ergebnis: "sicher", fehler_typ: null }], ...over });

test("Stand eines Unterthemas aus dem Lernstand", () => {
  const u = unterthemen("quad").find((x) => x.gen.length);
  const ids = [...new Set(u.gen.flatMap(skillsVonGenerator))];
  assert.ok(ids.length > 0);
  assert.equal(standAusGeneratoren(u.gen, { skills: {} }).art, "offen");
  assert.equal(standAusGeneratoren([], { skills: {} }).art, "ohne");
  const sicher = Object.fromEntries(ids.map((id) => [id, skill(id, { first_learned_at: "2026-10-10", mastery_status: "stabil", last_result: "sicher" })]));
  assert.equal(standAusGeneratoren(u.gen, { skills: sicher }).art, "sicher");
  const wackelt = { ...sicher, [ids[0]]: skill(ids[0], { last_result: "teilweise", review_history: [{ at: "2026-10-19T09:00:00Z", ergebnis: "teilweise", fehler_typ: "vorzeichen" }] }) };
  const s = standAusGeneratoren(u.gen, { skills: wackelt });
  assert.equal(s.art, "unsicher");
  assert.equal(s.fehler, "vorzeichen");
  assert.match(standZeile(s), /Wackelt.*zuletzt: Vorzeichen/);
  const teil = { [ids[0]]: skill(ids[0], { first_learned_at: "2026-10-18", mastery_status: "training", last_result: "sicher" }) };
  assert.equal(standAusGeneratoren(u.gen, { skills: teil }).art, ids.length > 1 ? "geuebt" : "geuebt");
});

test("Kapitelstand zählt alle Unterthemen", () => {
  for (const k of Object.keys(THEMEN)) {
    const ks = kapitelStand(k, { skills: {} });
    assert.equal(ks.teile.length, unterthemen(k).length, k);
    assert.equal(ks.sicher + ks.geuebt + ks.offen + ks.ohne, ks.teile.length, k);
  }
});

test("Vorwissen: nur echte Kapitel, höchstens fünf, nicht das Kapitel selbst", () => {
  for (const k of Object.keys(THEMEN)) {
    const vw = vorwissenStand(k, "g9", { skills: {} });
    assert.ok(vw.length <= 5, k);
    for (const v of vw) { assert.ok(THEMEN[v.kapitel]); assert.notEqual(v.kapitel, k); }
  }
  assert.ok(vorwissenStand("quad", "g9", { skills: {} }).length > 0);
});

test("Countdown bis zur Klassenarbeit", () => {
  assert.equal(countdown(null, HEUTE, HEUTE), null);
  const cd = countdown("2026-11-05", "2026-10-15", HEUTE);
  assert.equal(cd.tage, 17);
  assert.ok(cd.anteil > 0 && cd.anteil < 1);
  assert.equal(countdown("2026-10-19", "2026-10-10", HEUTE).tage, 0);
  assert.ok(countdown("2026-10-12", "2026-10-01", HEUTE).tage < 0);
  assert.equal(countdown("2026-10-12", "2026-10-01", HEUTE).anteil, 1);
});

test("Datum lang, nächstes Kapitel, Speicher prüfen", () => {
  assert.equal(datumLang("2026-11-05"), "Do, 5. November");
  assert.equal(datumLang("2026-11-05", true), "Thu, November 5");
  const n = naechstesKapitel("g9", "9", "quad");
  if (n) assert.notEqual(n.id, "quad");
  assert.equal(hauptthemaPruefen(null), null);
  assert.equal(hauptthemaPruefen({ kapitel: "gibtsnicht" }), null);
  const h = hauptthemaPruefen({ kapitel: "quad", schulart: "g9", klasse: "9", termin: "2026-11-05", seit: "kaputt", note: 9 });
  assert.equal(h.termin, "2026-11-05");
  assert.equal(h.seit, null);
  assert.equal(h.note, null);
});

test("Neues Datum: Erledigtes wandert in den neuen Plan", () => {
  const alt = planErstellen({ kapitel: "quad", schulart: "g9", klasse: "9", heute: HEUTE, termin: "2026-11-05" });
  const neu = planErstellen({ kapitel: "quad", schulart: "g9", klasse: "9", heute: HEUTE, termin: "2026-11-20" });
  const erst = alt.einheiten.slice(0, 2);
  const erledigt = Object.fromEntries(erst.map((e) => [e.id, { zeit: 1, richtig: 4, n: 5 }]));
  const ueber = erledigtUebertragen(alt, erledigt, neu);
  assert.equal(Object.keys(ueber).length, 2);
  for (const id of Object.keys(ueber)) assert.ok(neu.einheiten.some((e) => e.id === id));
  assert.deepEqual(erledigtUebertragen(alt, {}, neu), {});
});
