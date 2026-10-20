/* Test von supabase/training.sql (Aufträge von Coach/Lehrkraft im Tagesplan, Freigabe) gegen Postgres (PGlite).
   Übersprungen, wenn PGlite fehlt (PGLITE_DIR oder normal installiert). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const hier = path.dirname(fileURLToPath(import.meta.url));
const sql = (n) => fs.readFileSync(path.join(hier, "..", "supabase", n), "utf8");
let PGlite = null;
try {
  const ziel = process.env.PGLITE_DIR ? pathToFileURL(path.join(process.env.PGLITE_DIR, "dist/index.js")).href : "@electric-sql/pglite";
  ({ PGlite } = await import(ziel));
} catch (e) { /* nicht installiert */ }

const U = { s1: "00000000-0000-0000-0000-000000000021", s2: "00000000-0000-0000-0000-000000000022", c1: "00000000-0000-0000-0000-000000000023",
  l1: "00000000-0000-0000-0000-000000000024", x: "00000000-0000-0000-0000-000000000025" };

async function als(db, uid, q, params) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false)`);
  try { return await db.query(q, params); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); }
}

test("training.sql: Coach darf immer, Lehrkraft nur mit Freigabe; Schüler sieht und hakt ab", { skip: !PGlite && "pglite nicht installiert" }, async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);
  await db.exec(sql("schema.sql").split("-- Feedback per Sprachnachricht")[0]);
  await db.exec(sql("lernstand.sql"));
  await db.exec(sql("entdecken.sql"));
  await db.exec(sql("rollen.sql"));
  await db.exec(sql("training.sql"));
  await db.exec(sql("training.sql"));   // idempotent
  for (const id of Object.values(U)) await db.exec(`insert into auth.users values ('${id}')`);
  const ins = (uid, name, rolle) => als(db, uid, "insert into profile (id, name, rolle) values ($1,$2,$3)", [uid, name, rolle]);
  await ins(U.s1, "Anna", "schueler"); await ins(U.s2, "Ben", "schueler"); await ins(U.c1, "Basti", "nachhilfe"); await ins(U.l1, "Frau Lehr", "lehrkraft"); await ins(U.x, "Fremd", "schueler");
  const rpc = async (uid, q, params) => (await als(db, uid, `select ${q} as r`, params)).rows[0].r;
  const st = (r) => (r && r.status) || r;

  // Coach und Lehrkraft legen je eine Gruppe/Klasse an, Anna tritt beiden bei
  const g = await rpc(U.c1, "klasse_anlegen('Dienstag','G9',9)");
  const k = await rpc(U.l1, "klasse_anlegen('9a','G9',9)");
  assert.equal(st(await rpc(U.s1, "klasse_beitreten($1)", [g.code])), "ok");
  assert.equal(st(await rpc(U.s1, "klasse_beitreten($1)", [k.code])), "ok");

  // Schüler selbst darf nichts geben, Fremde auch nicht
  assert.equal(st(await rpc(U.s2, "auftrag_geben($1,'x')", [U.s1])), "keine_lehrkraft");
  assert.equal(st(await rpc(U.c1, "auftrag_geben($1,'x')", [U.s2])), "nicht_verbunden");
  assert.equal(st(await rpc(U.c1, "auftrag_geben($1,'   ')", [U.s1])), "leer");

  // Coach darf immer
  const a1 = await rpc(U.c1, "auftrag_geben($1,'Buch S. 42, Nr. 3–5','Bis Freitag', '{\"ansicht\":\"gleichungen\"}'::jsonb, current_date + 3)", [U.s1]);
  assert.equal(st(a1), "ok");

  // Lehrkraft nur mit Freigabe
  assert.equal(st(await rpc(U.l1, "auftrag_geben($1,'Arbeitsblatt 7')", [U.s1])), "keine_freigabe");
  assert.equal(await rpc(U.s1, "lehrer_freigabe()"), false);
  assert.equal(await rpc(U.s1, "lehrer_freigeben(true)"), true);
  assert.equal(await rpc(U.s1, "lehrer_freigabe()"), true);
  const a2 = await rpc(U.l1, "auftrag_geben($1,'Arbeitsblatt 7')", [U.s1]);
  assert.equal(st(a2), "ok");

  // Schüler sieht beide, mit Absender; Fremder sieht nichts
  const meine = await rpc(U.s1, "meine_auftraege()");
  assert.equal(meine.length, 2);
  assert.deepEqual(meine.map((a) => a.absender).sort(), ["Basti", "Frau Lehr"]);
  assert.equal(meine.find((a) => a.id === a1.id).ziel.ansicht, "gleichungen");
  assert.equal((await rpc(U.x, "meine_auftraege()")).length, 0);
  assert.equal((await als(db, U.x, "select * from training_auftraege", [])).rows.length, 0);

  // Abhaken nur der Schüler; Coach sieht den Stand
  assert.equal(await rpc(U.s2, "auftrag_erledigt($1)", [a1.id]), false);
  assert.equal(await rpc(U.s1, "auftrag_erledigt($1)", [a1.id]), true);
  const fuer = await rpc(U.c1, "auftraege_fuer($1)", [U.s1]);
  assert.equal(fuer.length, 1); assert.ok(fuer[0].erledigt);
  assert.equal((await rpc(U.l1, "auftraege_fuer($1)", [U.s1])).length, 1);   // Lehrkraft sieht nur ihre eigenen
  assert.equal(await rpc(U.s1, "auftrag_erledigt($1, true)", [a1.id]), true);
  assert.equal((await rpc(U.s1, "meine_auftraege()")).filter((a) => !a.erledigt).length, 2);

  // Löschen nur der Absender
  assert.equal(await rpc(U.l1, "auftrag_loeschen($1)", [a1.id]), false);
  assert.equal(await rpc(U.c1, "auftrag_loeschen($1)", [a1.id]), true);
  assert.equal((await rpc(U.s1, "meine_auftraege()")).length, 1);

  // Höchstens zehn offene je Absender
  for (let i = 0; i < 9; i++) assert.equal(st(await rpc(U.l1, "auftrag_geben($1,$2)", [U.s1, `Nr. ${i}`])), "ok");
  assert.equal(st(await rpc(U.l1, "auftrag_geben($1,'zu viel')", [U.s1])), "zu_viele");
  // Freigabe zurücknehmen
  assert.equal(await rpc(U.s1, "lehrer_freigeben(false)"), false);
  assert.equal(st(await rpc(U.l1, "auftrag_geben($1,'noch eins')", [U.s1])), "keine_freigabe");
});
