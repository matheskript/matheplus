/* Echter Test von supabase/rollen.sql gegen Postgres (PGlite, WASM).
   Läuft nur, wenn @electric-sql/pglite erreichbar ist (PGLITE_DIR=/pfad/zu/node_modules/@electric-sql/pglite
   oder normal installiert); sonst wird übersprungen. */
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

const U = { s1: "00000000-0000-0000-0000-000000000001", s2: "00000000-0000-0000-0000-000000000002", e1: "00000000-0000-0000-0000-000000000003",
  e2: "00000000-0000-0000-0000-000000000004", l1: "00000000-0000-0000-0000-000000000005", x: "00000000-0000-0000-0000-000000000006" };

async function aufbauen() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);
  const schema = sql("schema.sql");
  await db.exec(schema.split("-- Feedback per Sprachnachricht")[0]);
  await db.exec(sql("lernstand.sql"));
  await db.exec(sql("entdecken.sql"));
  await db.exec(sql("rollen.sql"));
  await db.exec(sql("rollen.sql"));   // zweimal ausführbar (idempotent)
  for (const id of Object.values(U)) await db.exec(`insert into auth.users values ('${id}')`);
  return db;
}

/* Als Nutzer ausführen (RLS aktiv) */
async function als(db, uid, q, params) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false)`);
  try { return await db.query(q, params); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); }
}

test("rollen.sql: Rollen, Eltern, Klassen, Sichtbarkeit", { skip: !PGlite && "pglite nicht installiert" }, async () => {
  const db = await aufbauen();
  const ins = (uid, name, rolle) => als(db, uid, "insert into profile (id, name, rolle) values ($1,$2,$3)", [uid, name, rolle]);
  await ins(U.s1, "Anna", "schueler"); await ins(U.s2, "Ben", "schueler");
  await ins(U.e1, "Mutter", "eltern"); await ins(U.e2, "Vater", "eltern");
  await ins(U.l1, "Frau Lehr", "lehrkraft"); await ins(U.x, "Fremd", "schueler");

  // Plan darf nicht selbst gesetzt werden
  await assert.rejects(als(db, U.s1, "update profile set plan='pro' where id=$1", [U.s1]));
  await assert.rejects(als(db, U.s1, "insert into profile (id,name,plan) values ($1,'x','pro')", [U.x]));
  await assert.rejects(als(db, U.s1, "update profile set rolle='lehrkraft' where id=$1", [U.s1]));
  await assert.rejects(als(db, U.s1, "update profile set eltern_token='abc' where id=$1", [U.s1]));

  // Fremder sieht fremdes Profil nicht
  assert.equal((await als(db, U.x, "select * from profile where id=$1", [U.s1])).rows.length, 0);

  const rpc = async (uid, q, params) => (await als(db, uid, `select ${q} as r`, params)).rows[0].r;
  const st = (r) => (r && r.status) || r;

  // Eltern verbinden
  assert.equal(st(await rpc(U.e1, "eltern_verbinden('nope')")), "ungueltig");
  const tok = (await als(db, U.s1, "select eltern_token from profile where id=$1", [U.s1])).rows[0].eltern_token;
  assert.ok(tok && tok.length >= 12);
  assert.equal(st(await rpc(U.e1, "eltern_verbinden($1)", [tok])), "ok");
  assert.equal(st(await rpc(U.e1, "eltern_verbinden($1)", [tok])), "schon");
  assert.equal(st(await rpc(U.e2, "eltern_verbinden($1)", [tok])), "ok");              // zweites Elternteil
  assert.equal(st(await rpc(U.s2, "eltern_verbinden($1)", [tok])), "keine_eltern");    // Schüler kann nicht verbinden

  // Sicht der Eltern; Fremde sehen nichts
  await als(db, U.s1, "insert into lernstand (nutzer_id, daten) values ($1, '{\"x\":1}')", [U.s1]);
  assert.match(JSON.stringify(await rpc(U.e1, "meine_kinder()")), /Anna/);
  assert.match(JSON.stringify(await rpc(U.e2, "schueler_detail($1)", [U.s1])), /Anna/);
  await assert.rejects(rpc(U.x, "schueler_zusammenfassung($1)", [U.s1]));            // interne Hilfe: nicht direkt aufrufbar
  assert.equal(await rpc(U.l1, "schueler_detail($1)", [U.s1]), null);
  assert.deepEqual(await rpc(U.x, "meine_kinder()"), []);
  assert.equal(await rpc(U.e1, "schueler_detail($1)", [U.s2]), null);                  // fremdes Kind
  assert.equal((await als(db, U.e1, "select * from lernstand")).rows.length, 0);       // nicht direkt per Tabelle
  assert.equal((await als(db, U.e1, "select * from profile where id=$1", [U.s1])).rows.length, 0);

  // Klassen
  assert.equal(st(await rpc(U.s1, "klasse_anlegen('x','G8',7)")), "keine_lehrkraft");
  assert.equal(st(await rpc(U.l1, "klasse_anlegen('x','G8',13)")), "ungueltig");
  assert.equal(st(await rpc(U.l1, "klasse_anlegen('x','XY',7)")), "ungueltig");
  const k = await rpc(U.l1, "klasse_anlegen('7a','G8',7)");
  assert.equal(k.status, "ok");
  assert.match(k.code, /^[A-Z2-9]{6}$/);
  assert.match(JSON.stringify(await rpc(U.s1, "klasse_vorschau($1)", [k.code])), /7a/);
  assert.equal(st(await rpc(U.l1, "klasse_beitreten($1)", [k.code])), "kein_schueler");
  assert.equal(st(await rpc(U.s1, "klasse_beitreten($1)", [k.code])), "ok");
  assert.equal(st(await rpc(U.s1, "klasse_beitreten($1)", [k.code])), "schon");
  assert.equal(st(await rpc(U.s1, "klasse_beitreten('ZZZZZZ')")), "ungueltig");
  assert.match(JSON.stringify(await rpc(U.l1, "klassen_uebersicht()")), /Anna/);
  assert.match(JSON.stringify(await rpc(U.l1, "schueler_detail($1)", [U.s1])), /Anna/);
  assert.equal(await rpc(U.l1, "schueler_detail($1)", [U.s2]), null);                 // Ben nicht in Klasse
  assert.equal(await rpc(U.x, "klasse_loeschen($1)", [k.id]), false);                  // Fremder
  assert.equal(await rpc(U.x, "klasse_schueler_entfernen($1,$2)", [k.id, U.s1]), false);
  assert.equal(await rpc(U.s2, "klasse_code_neu($1)", [k.id]), null);
  const neu = await rpc(U.l1, "klasse_code_neu($1)", [k.id]);
  assert.match(neu, /^[A-Z2-9]{6}$/);
  assert.notEqual(neu, k.code);
  assert.equal(await rpc(U.s1, "klasse_verlassen($1)", [k.id]), true);
  assert.equal(await rpc(U.l1, "schueler_detail($1)", [U.s1]), null);

  // Pro: nur Server (Rolle postgres), nur berechtigte Zahler
  await assert.rejects(als(db, U.e1, "select pro_freischalten($1, now() + interval '30 days', $2)", [U.s1, U.e1]));
  await assert.rejects(db.query("select pro_freischalten($1, now() + interval '30 days', $2)", [U.s1, U.x]));  // Fremder darf nicht zahlen
  await db.query("select pro_freischalten($1, now() + interval '30 days', $2)", [U.s1, U.e1]);
  assert.equal((await als(db, U.s1, "select plan, pro_bis is not null as bis from profile where id=$1", [U.s1])).rows[0].plan, "pro");
  assert.equal((await als(db, U.s2, "select plan from profile where id=$1", [U.s2])).rows[0].plan, "free");

  // Rolle wechseln nur ohne Verknüpfung
  assert.equal(await rpc(U.e1, "rolle_wechseln('schueler')"), false);
  assert.equal(await rpc(U.x, "rolle_wechseln('eltern')"), true);
  await db.close();
});
