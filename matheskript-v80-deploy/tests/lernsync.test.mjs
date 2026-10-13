import test from "node:test";
import assert from "node:assert/strict";
import { mergeLernstand } from "../src/lernMerge.js";
import { erzeugeSync, OWNER_SCHLUESSEL } from "../src/lernSync.js";

const skill = (o) => ({ last_reviewed_at: null, first_learned_at: null, review_history: [], source_exercise_ids: [], ...o });
const stand = (o = {}) => ({ profil: null, stand: {}, verlauf: [], training: null, protokoll: [], _zeit: 0, ...o });
const ebb = (skills, tage = {}) => ({ training: { ebbinghaus: { version: 1, skills, tage } } });

test("merge: Skills – jüngster Stand, vereinigter Verlauf, frühestes Erstlernen", () => {
  const a = stand({ _zeit: 10, ...ebb({ s: skill({ last_reviewed_at: "2026-10-01T10:00:00Z", first_learned_at: "2026-09-20T10:00:00Z", stufe: 2, review_history: [{ at: "2026-09-20T10:00:00Z", exercise_id: "x" }, { at: "2026-10-01T10:00:00Z", exercise_id: "y" }] }) }) });
  const b = stand({ _zeit: 20, ...ebb({ s: skill({ last_reviewed_at: "2026-10-05T10:00:00Z", first_learned_at: "2026-09-22T10:00:00Z", stufe: 3, review_history: [{ at: "2026-09-20T10:00:00Z", exercise_id: "x" }, { at: "2026-10-05T10:00:00Z", exercise_id: "z" }] }) }) });
  const m = mergeLernstand(a, b).training.ebbinghaus.skills.s;
  assert.equal(m.stufe, 3);
  assert.equal(m.first_learned_at, "2026-09-20T10:00:00Z");
  assert.equal(m.review_history.length, 3);
});

test("merge: Reihenfolge egal und idempotent", () => {
  const a = stand({ _zeit: 5, verlauf: [{ id: 1, zeit: 1 }, { id: 2, zeit: 2 }], ...ebb({ s: skill({ last_reviewed_at: "2026-10-01T00:00:00Z" }) }) });
  const b = stand({ _zeit: 7, verlauf: [{ id: 2, zeit: 2 }, { id: 3, zeit: 3 }], ...ebb({ t: skill({}) }) });
  const ab = mergeLernstand(a, b), ba = mergeLernstand(b, a);
  assert.deepEqual(ab, ba);
  assert.deepEqual(mergeLernstand(ab, ab), ab);
  assert.deepEqual(ab.verlauf.map((x) => x.id), [1, 2, 3]);
  assert.deepEqual(Object.keys(ab.training.ebbinghaus.skills).sort(), ["s", "t"]);
});

test("merge: Tagespläne je Datum vereinigt, Objekte mit zuletzt: jüngerer gewinnt", () => {
  const a = stand({ stand: { k: { zuletzt: 5, status: "alt" } }, ...ebb({}, { "2026-10-13": { erstellt: "2026-10-13T06:00:00Z", items: [{ skill_id: "a", art: "wiederholung" }] } }) });
  const b = stand({ stand: { k: { zuletzt: 9, status: "neu" } }, ...ebb({}, { "2026-10-13": { erstellt: "2026-10-13T07:00:00Z", items: [{ skill_id: "a", art: "wiederholung" }, { skill_id: "b", art: "weiter" }] } }) });
  const m = mergeLernstand(a, b);
  assert.equal(m.stand.k.status, "neu");
  assert.equal(m.training.ebbinghaus.tage["2026-10-13"].items.length, 2);
});

test("merge: null/leer", () => {
  const a = stand({ _zeit: 3, profil: { name: "A" } });
  assert.deepEqual(mergeLernstand(a, null), a);
  assert.deepEqual(mergeLernstand(null, a), a);
});

/* ----- Sync mit gefälschtem Supabase-Client ----- */
function fakeClient(zeile, opt = {}) {
  const c = { zeile, upserts: 0, selects: 0 };
  c.from = () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => { c.selects++; return opt.fehlt ? { error: { code: "42P01", message: "relation does not exist" } } : { data: c.zeile ? { daten: c.zeile } : null, error: null }; } }) }),
    upsert: async (r) => { c.upserts++; if (opt.fehlt) return { error: { code: "42P01", message: "x" } }; c.zeile = r.daten; return { error: null }; },
  });
  return c;
}
function umgebung(lokal, client, speicher = {}) {
  const u = { lokal, angewandt: 0 };
  u.speicher = { getItem: (k) => speicher[k] ?? null, setItem: (k, v) => { speicher[k] = v; }, removeItem: (k) => { delete speicher[k]; } };
  u.s = erzeugeSync({ client, speicher: u.speicher, lesen: () => u.lokal, anwenden: (d) => { u.lokal = d; u.angewandt++; }, leer: () => stand(), verzoegerung: 5 });
  return u;
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

test("sync: erstes Anmelden übernimmt lokalen Stand ins leere Konto", async () => {
  const c = fakeClient(null);
  const u = umgebung(stand({ _zeit: 4, profil: { name: "Mia" } }), c);
  await u.s.anmelden("u1");
  assert.equal(u.s.zustand().status, "ok");
  assert.equal(c.zeile.profil.name, "Mia");
  assert.equal(u.speicher.getItem(OWNER_SCHLUESSEL), "u1");
});

test("sync: Zusammenführen mit Konto-Stand", async () => {
  const c = fakeClient(stand({ _zeit: 2, verlauf: [{ id: 1, zeit: 1 }] }));
  const u = umgebung(stand({ _zeit: 6, verlauf: [{ id: 2, zeit: 2 }] }), c);
  await u.s.anmelden("u1");
  assert.deepEqual(u.lokal.verlauf.map((x) => x.id), [1, 2]);
  assert.deepEqual(c.zeile.verlauf.map((x) => x.id), [1, 2]);
});

test("sync: fremder lokaler Stand wird nicht hochgeladen", async () => {
  const c = fakeClient(stand({ _zeit: 2, profil: { name: "Konto B" } }));
  const u = umgebung(stand({ _zeit: 9, profil: { name: "Konto A" } }), c, { [OWNER_SCHLUESSEL]: "uA" });
  await u.s.anmelden("uB");
  assert.equal(u.lokal.profil.name, "Konto B");
  assert.equal(c.zeile.profil.name, "Konto B");
  const c2 = fakeClient(null);
  const u2 = umgebung(stand({ _zeit: 9, profil: { name: "Konto A" } }), c2, { [OWNER_SCHLUESSEL]: "uA" });
  await u2.s.anmelden("uB");
  assert.equal(u2.lokal.profil, null);
  assert.equal(c2.upserts, 1);
  assert.equal(c2.zeile.profil, null);
});

test("sync: Tabelle fehlt → nicht-eingerichtet, keine weiteren Versuche", async () => {
  const c = fakeClient(null, { fehlt: true });
  const u = umgebung(stand({ _zeit: 1 }), c);
  await u.s.anmelden("u1");
  assert.equal(u.s.zustand().status, "nicht-eingerichtet");
  u.s.melden(); await warte(30);
  assert.equal(c.selects, 1);
});

test("sync: ohne Client bleibt es lokal", async () => {
  const u = umgebung(stand(), null);
  assert.equal(u.s.zustand().status, "lokal");
  u.s.melden(); await u.s.anmelden("u1");
  assert.equal(u.s.zustand().status, "lokal");
});

test("sync: viele Änderungen werden zusammengefasst, danach Ruhe (keine Endlosschleife)", async () => {
  const c = fakeClient(null);
  const u = umgebung(stand({ _zeit: 1 }), c);
  await u.s.anmelden("u1");
  const vorher = c.upserts;
  for (let i = 2; i < 8; i++) { u.lokal = stand({ _zeit: i, profil: { name: "x" + i } }); u.s.melden(); }
  await warte(60);
  assert.equal(c.upserts, vorher + 1);
  assert.equal(u.s.zustand().status, "ok");
  const sel = c.selects; await warte(60);
  assert.equal(c.selects, sel);
});

test("sync: Abmelden sichert und leert lokal; bei Fehler bleibt lokal erhalten", async () => {
  const c = fakeClient(null);
  const u = umgebung(stand({ _zeit: 3, profil: { name: "Mia" } }), c);
  await u.s.anmelden("u1");
  await u.s.vorAbmelden();
  assert.equal(c.zeile.profil.name, "Mia");
  assert.equal(u.lokal.profil, null);
  assert.equal(u.speicher.getItem(OWNER_SCHLUESSEL), null);
  const c2 = fakeClient(null, { fehlt: true });
  const u2 = umgebung(stand({ _zeit: 3, profil: { name: "Mia" } }), c2);
  await u2.s.anmelden("u1");
  await u2.s.vorAbmelden();
  assert.equal(u2.lokal.profil.name, "Mia");
});

test("sync: bewusstes Löschen ersetzt den Konto-Stand statt zusammenzuführen", async () => {
  const c = fakeClient(stand({ _zeit: 2, profil: { name: "Mia" } }));
  const u = umgebung(stand({ _zeit: 2, profil: { name: "Mia" } }), c);
  await u.s.anmelden("u1");
  u.lokal = stand({ _zeit: 8 });
  u.s.ersetzen(); await warte(60);
  assert.equal(c.zeile.profil, null);
});
