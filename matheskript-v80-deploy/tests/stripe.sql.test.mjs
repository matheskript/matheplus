/* Test von supabase/stripe.sql gegen Postgres (PGlite). Übersprungen, wenn PGlite fehlt. */
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

const U = { s1: "00000000-0000-0000-0000-000000000021", s2: "00000000-0000-0000-0000-000000000022", e1: "00000000-0000-0000-0000-000000000023", x: "00000000-0000-0000-0000-000000000024" };
async function als(db, uid, q, params) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false)`);
  try { return await db.query(q, params); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); }
}

test("stripe.sql: Abo schaltet verbundene Kinder frei, Fremde nicht, Ereignisse nur einmal, Kündigung läuft aus", { skip: !PGlite && "pglite nicht installiert" }, async () => {
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
  await db.exec(sql("lernstand.sql")); await db.exec(sql("entdecken.sql")); await db.exec(sql("rollen.sql"));
  await db.exec(sql("stripe.sql")); await db.exec(sql("stripe.sql"));
  for (const id of Object.values(U)) await db.exec(`insert into auth.users values ('${id}')`);
  await als(db, U.s1, "insert into profile (id, name, rolle) values ($1,'Anna','schueler')", [U.s1]);
  await als(db, U.s2, "insert into profile (id, name, rolle) values ($1,'Ben','schueler')", [U.s2]);
  await als(db, U.e1, "insert into profile (id, name, rolle) values ($1,'Mutter','eltern')", [U.e1]);
  await als(db, U.x, "insert into profile (id, name, rolle) values ($1,'Fremd','schueler')", [U.x]);
  const tok = (await als(db, U.s1, "select eltern_token from profile where id=$1", [U.s1])).rows[0].eltern_token;
  await als(db, U.e1, "select eltern_verbinden($1)", [tok]);   // Mutter ↔ Anna

  const bis = new Date(Date.now() + 30 * 86400000).toISOString();
  const setzen = (args) => db.query("select abo_setzen($1,$2,$3,$4,$5,$6,$7,$8,$9) as r", args).then((r) => r.rows[0].r);
  // Familie: Anna (verbunden) und Fremd (nicht verbunden) → nur Anna wird Pro
  let r = await setzen(["sub_1", U.e1, "familie", "active", bis, [U.s1, U.x], "cus_1", "evt_1", "checkout.session.completed"]);
  assert.deepEqual([r.doppelt, r.aktiv, r.freigeschaltet], [false, true, 1]);
  const plan = async (id) => (await db.query("select plan, pro_bis from profile where id=$1", [id])).rows[0];
  assert.equal((await plan(U.s1)).plan, "pro"); assert.equal((await plan(U.x)).plan, "free");
  assert.equal((await db.query("select stripe_kunde from profile where id=$1", [U.e1])).rows[0].stripe_kunde, "cus_1");
  // Dasselbe Ereignis noch einmal: doppelt
  r = await setzen(["sub_1", U.e1, "familie", "active", bis, [U.s1], "cus_1", "evt_1", "checkout.session.completed"]);
  assert.equal(r.doppelt, true);
  // Nutzer sieht sein Abo, Fremder nicht; niemand kann schreiben
  const meine = (await als(db, U.e1, "select meine_abos() as r")).rows[0].r;
  assert.equal(meine.length, 1); assert.equal(meine[0].ziele[0].name, "Anna");
  assert.equal((await als(db, U.x, "select count(*)::int as n from abos")).rows[0].n, 0);
  assert.equal((await als(db, U.s1, "select count(*)::int as n from abos")).rows[0].n, 1);   // Ziel darf lesen
  await assert.rejects(als(db, U.e1, "update abos set status='active'"));
  await assert.rejects(als(db, U.e1, "select abo_setzen('sub_9',$1,'pro','active',null,$2,null,null,null)", [U.e1, U.s1]));
  // Verlängerung (invoice.paid) ohne Ziele-Liste: Ziele bleiben, pro_bis wandert
  const bis2 = new Date(Date.now() + 60 * 86400000).toISOString();
  r = await setzen(["sub_1", U.e1, "familie", "active", bis2, [], null, "evt_2", "invoice.paid"]);
  assert.equal(r.freigeschaltet, 1);
  assert.ok(new Date((await plan(U.s1)).pro_bis) > new Date(bis));
  // Kündigung: Pro bleibt bis zum Periodenende
  r = await setzen(["sub_1", U.e1, "familie", "canceled", bis2, [], null, "evt_3", "customer.subscription.deleted"]);
  assert.equal(r.aktiv, false);
  const p = await plan(U.s1); assert.equal(p.plan, "pro"); assert.equal(new Date(p.pro_bis).toISOString().slice(0, 10), bis2.slice(0, 10));
  // Volljähriger Schüler zahlt für sich selbst
  await als(db, U.s2, "select volljaehrig_erklaeren()");
  r = await setzen(["sub_2", U.s2, "pro", "active", bis, [U.s2], "cus_2", "evt_4", "checkout.session.completed"]);
  assert.equal(r.freigeschaltet, 1); assert.equal((await plan(U.s2)).plan, "pro");
});
