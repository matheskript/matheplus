/* Test von supabase/ki.sql (Mathilda-Kontingent) gegen Postgres (PGlite). Übersprungen, wenn PGlite fehlt. */
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

const U = { s1: "00000000-0000-0000-0000-000000000011", s2: "00000000-0000-0000-0000-000000000012" };

async function als(db, uid, q, params) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false)`);
  try { return await db.query(q, params); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); }
}

test("ki.sql: Tageslimit für Free, unbegrenzt für Pro, keine Fremdzugriffe", { skip: !PGlite && "pglite nicht installiert" }, async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);
  await db.exec(sql("schema.sql").split("-- Feedback per Sprachnachricht")[0]);
  await db.exec(sql("lernstand.sql")); await db.exec(sql("entdecken.sql")); await db.exec(sql("rollen.sql"));
  await db.exec(sql("ki.sql")); await db.exec(sql("ki.sql"));   // wiederholbar
  for (const id of Object.values(U)) await db.exec(`insert into auth.users values ('${id}')`);
  await als(db, U.s1, "insert into profile (id, name, rolle) values ($1,'Anna','schueler')", [U.s1]);
  await als(db, U.s2, "insert into profile (id, name, rolle) values ($1,'Ben','schueler')", [U.s2]);

  const verbrauch = async (uid, lim) => (await als(db, uid, "select ki_verbrauchen($1) as r", [lim])).rows[0].r;
  // Free: 3 erlaubt, die vierte nicht
  for (let i = 1; i <= 3; i++) { const r = await verbrauch(U.s1, 3); assert.equal(r.erlaubt, true); assert.equal(r.anzahl, i); assert.equal(r.limit, 3); assert.equal(r.plan, "free"); }
  const zu = await verbrauch(U.s1, 3);
  assert.equal(zu.erlaubt, false); assert.equal(zu.anzahl, 3);
  // Stand lesen
  const stand = (await als(db, U.s1, "select ki_stand($1) as r", [3])).rows[0].r;
  assert.deepEqual([stand.anzahl, stand.limit, stand.plan], [3, 3, "free"]);
  // Anderer Nutzer zählt getrennt
  assert.equal((await verbrauch(U.s2, 3)).anzahl, 1);
  // Nutzer sieht nur seine Zeile und kann nicht schreiben
  assert.equal((await als(db, U.s2, "select count(*)::int as n from ki_nutzung")).rows[0].n, 1);
  await assert.rejects(als(db, U.s2, "update ki_nutzung set anzahl = 0"));
  await assert.rejects(als(db, U.s2, "delete from ki_nutzung"));
  // Pro: unbegrenzt
  await db.exec(`select pro_freischalten('${U.s1}', null, null)`);
  const pro = await verbrauch(U.s1, 3);
  assert.equal(pro.erlaubt, true); assert.equal(pro.limit, null); assert.equal(pro.plan, "pro");
  // Nicht angemeldet: Fehler
  await db.exec("set role anon");
  await assert.rejects(db.query("select ki_verbrauchen(3)"));
  await db.exec("reset role");
});
