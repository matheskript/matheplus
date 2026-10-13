import test from "node:test";
import assert from "node:assert/strict";
import { normiereEbb, bucheErgebnis, tagesplanSichern, tagesStand, lernUebersicht, aktuelleThemen, leereEbb, skillKapitel, addTage, datumVon } from "../src/ebbinghaus.js";

const TZ = "Europe/Berlin";
const T0 = Date.parse("2026-10-01T10:00:00Z");
const tag = (n) => T0 + n * 86400000;
const ok = (E, id, t, nr) => bucheErgebnis(E, [id], { ergebnis: "sicher", exercise_id: `${id}-${nr}` }, t, TZ);

test("aktuelle Themen: aus Skill-Verlauf der letzten Tage und Trainingsstand", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "potenzregel", T0, 1);
  const th = aktuelleThemen(E, null, { jetzt: T0 + 3600000, tz: TZ });
  assert.equal(th.length, 1);
  assert.equal(th[0].thema, skillKapitel("potenzregel").thema);
  assert.deepEqual(aktuelleThemen(E, null, { jetzt: tag(20), tz: TZ }), []);
  const T = { themen: { [skillKapitel("pq-formel").thema]: { zuletzt: T0 + 7200000 } } };
  assert.equal(aktuelleThemen(E, T, { jetzt: T0 + 8000000, tz: TZ })[0].thema, skillKapitel("pq-formel").thema);
});

test("Tagesplan: Wiederholungen + 'weiter lernen' im aktuellen Thema, nur mit gelernten Voraussetzungen", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "potenzregel", T0, 1);
  const jetzt = tag(1) ;                      // Tag 1: Potenzregel fällig
  const p = tagesplanSichern(E, null, { jetzt, tz: TZ });
  const ids = p.items.map((i) => `${i.art}:${i.skill_id}`);
  assert.ok(ids.includes("wiederholung:potenzregel"));
  const weiter = p.items.filter((i) => i.art === "weiter").map((i) => i.skill_id);
  assert.ok(weiter.length >= 1 && weiter.length <= 2);
  for (const w of weiter) assert.notEqual(w, "potenzregel");
  // kettenregel (Voraussetzung potenzregel gelernt) darf vorgeschlagen werden; wendepunkte braucht auch gleichungen-umformen → nicht
  assert.ok(!weiter.includes("wendepunkte"));
  assert.ok(p.items.length <= 8);
});

test("Tagesplan: stabil über den Tag, wird nur ergänzt, nie neu gewürfelt", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "potenzregel", T0, 1);
  const jetzt = tag(1);
  const p1 = JSON.parse(JSON.stringify(tagesplanSichern(E, null, { jetzt, tz: TZ })));
  ok(E, "potenzregel", jetzt, 2);              // erledigt
  const p2 = tagesplanSichern(E, null, { jetzt: jetzt + 3600000, tz: TZ });
  assert.deepEqual(p2.items.slice(0, p1.items.length), p1.items);
  const st = tagesStand(E, { jetzt: jetzt + 3600000, tz: TZ });
  assert.equal(st.items.find((i) => i.skill_id === "potenzregel").erledigt, true);
  assert.equal(st.items.find((i) => i.skill_id === "potenzregel").ergebnis, "sicher");
  assert.ok(st.erledigt >= 1 && st.erledigt <= st.gesamt);
});

test("Tagesplan: ohne Daten sinnvoller Start (nur 'weiter lernen' für Einsteiger-Skills), leerer Plan nicht kaputt", () => {
  const E = normiereEbb(leereEbb());
  const p = tagesplanSichern(E, null, { jetzt: T0, tz: TZ });
  assert.ok(p.items.every((i) => i.art === "weiter"));
  for (const i of p.items) assert.ok(["gleichungen-umformen", "bruch-addieren", "binomische-formeln", "potenzregel", "bernoulli-genau", "vektor-betrag"].includes(i.skill_id));
  const st = tagesStand(E, { jetzt: T0, tz: TZ });
  assert.equal(st.erledigt, 0);
});

test("Zusätzlich geübte Skills werden gezählt, nicht als Plan", () => {
  const E = normiereEbb(leereEbb());
  tagesplanSichern(E, null, { jetzt: T0, tz: TZ });
  ok(E, "bernoulli-genau", T0, 1);
  const st = tagesStand(E, { jetzt: T0, tz: TZ });
  const imPlan = st.items.some((i) => i.skill_id === "bernoulli-genau");
  assert.equal(imPlan || st.zusaetzlich.some((z) => z.skill_id === "bernoulli-genau"), true);
});

test("Normierung: kaputte Tagespläne werden bereinigt, Alter begrenzt", () => {
  const tage = { "kaputt": { items: [] }, "2026-10-01": { items: [{ skill_id: "gibt-es-nicht" }, { skill_id: "potenzregel", art: "quatsch" }] } };
  for (let i = 0; i < 80; i++) tage[addTage("2025-01-01", i)] = { erstellt: null, items: [] };
  const E = normiereEbb({ tage });
  assert.ok(!("kaputt" in E.tage));
  assert.equal(E.tage["2026-10-01"].items.length, 1);
  assert.equal(E.tage["2026-10-01"].items[0].art, "wiederholung");
  assert.ok(Object.keys(E.tage).length <= 60);
});

test("Lernübersicht: gelernt + wann, Rückblick, Vorschau, Serie", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "potenzregel", T0, 1);
  ok(E, "bernoulli-genau", tag(1), 1);
  ok(E, "potenzregel", tag(1), 2);
  const u = lernUebersicht(E, { jetzt: tag(1) + 3600000, tz: TZ });
  assert.equal(u.gelernt.length, 2);
  assert.equal(u.seit, datumVon(T0, TZ));
  assert.equal(u.serie, 2);
  assert.equal(u.rueckblick.length, 14);
  assert.equal(u.rueckblick[0].skills.length, 2);
  assert.equal(u.rueckblick[1].skills.length, 1);
  assert.equal(u.rueckblick[5].aufgaben, 0);
  assert.equal(u.vorschau.length, 14);
  const gesamtVorschau = u.vorschau.reduce((n, v) => n + v.skills.length, 0);
  assert.equal(gesamtVorschau, 2);
  assert.equal(u.anzahl.gelernt, 2);
});

test("Lernübersicht: überfälliges steht heute in der Vorschau; Serie reißt bei Lücke", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "potenzregel", T0, 1);
  const u = lernUebersicht(E, { jetzt: tag(10), tz: TZ });
  assert.equal(u.vorschau[0].skills.length, 1);
  assert.equal(u.serie, 0);
});
