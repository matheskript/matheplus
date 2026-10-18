/* Test von supabase/einwilligung.sql (Eltern-Einwilligung unter 16) gegen Postgres (PGlite). Übersprungen, wenn PGlite fehlt. */
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

const U = { klein: "00000000-0000-0000-0000-000000000001", gross: "00000000-0000-0000-0000-000000000002", mama: "00000000-0000-0000-0000-000000000003",
  lehr: "00000000-0000-0000-0000-000000000004", offen: "00000000-0000-0000-0000-000000000005" };

async function aufbauen() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);
  await db.exec(sql("schema.sql").split("-- Feedback per Sprachnachricht")[0]);
  await db.exec(sql("lernstand.sql"));
  await db.exec(sql("entdecken.sql"));
  await db.exec(sql("rollen.sql"));
  await db.exec(sql("ki.sql"));
  await db.exec(sql("einwilligung.sql"));
  await db.exec(sql("einwilligung.sql"));   // wiederholbar
  await db.exec(sql("ki.sql"));             // Reihenfolge egal
  for (const id of Object.values(U)) await db.exec(`insert into auth.users values ('${id}', 'u${id.slice(-1)}@x.de')`);
  return db;
}

async function als(db, uid, q, params) {
  await db.exec(`set role ${uid ? "authenticated" : "anon"}; select set_config('request.jwt.claim.sub','${uid || ""}',false)`);
  try { return await db.query(q, params); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); }
}

test("einwilligung.sql: unter 16 speichert erst nach Eltern-Zustimmung, Widerruf löscht", { skip: !PGlite && "pglite nicht installiert" }, async () => {
  const db = await aufbauen();
  const rpc = async (uid, q, params) => (await als(db, uid, `select ${q} as r`, params)).rows[0].r;
  const ins = (uid, name, rolle) => als(db, uid, "insert into profile (id, name, rolle) values ($1,$2,$3)", [uid, name, rolle]);
  await ins(U.klein, "Lena Klein", "schueler"); await ins(U.gross, "Max Groß", "schueler");
  await ins(U.mama, "Mama Klein", "eltern"); await ins(U.lehr, "Frau Lehr", "lehrkraft"); await ins(U.offen, "Ohne Angabe", "schueler");
  const lern = (uid) => als(db, uid, "insert into lernstand (nutzer_id, daten) values ($1, '{\"a\":1}') on conflict (nutzer_id) do update set daten = excluded.daten", [uid]);

  // Ohne Altersangabe: nichts speichern
  await assert.rejects(lern(U.offen));
  assert.equal(await rpc(U.offen, "einwilligung_ok($1, 'konto')", [U.offen]), false);

  // Alter angeben (Spalte selbst ist nicht beschreibbar)
  await assert.rejects(als(db, U.klein, "update profile set unter16 = false where id = $1", [U.klein]));
  assert.equal(await rpc(U.klein, "alter_angeben(true)"), true);
  assert.equal(await rpc(U.gross, "alter_angeben(false)"), true);

  // 16+: alles frei, auch KI
  await lern(U.gross);
  assert.equal((await rpc(U.gross, "ki_verbrauchen(30)")).erlaubt, true);

  // unter 16 ohne Zustimmung: kein Lernstand, keine Noten, keine KI, keine Klasse – Name bleibt änderbar
  await assert.rejects(lern(U.klein));
  await assert.rejects(als(db, U.klein, "update profile set noten = '{\"8\":2}' where id = $1", [U.klein]), /eltern_einwilligung_fehlt/);
  await als(db, U.klein, "update profile set name = 'Lena K.' where id = $1", [U.klein]);
  const ki = await rpc(U.klein, "ki_verbrauchen(30)");
  assert.equal(ki.erlaubt, false); assert.equal(ki.grund, "eltern_einwilligung");
  const klasse = await rpc(U.lehr, "klasse_anlegen('8a','G9',8)");
  await assert.rejects(als(db, U.klein, "select klasse_beitreten($1)", [klasse.code]), /eltern_einwilligung_fehlt/);

  // Eltern-Link: falsches Token, Kind selbst, ungültige Mail
  const tok = (await als(db, U.klein, "select eltern_token from profile where id=$1", [U.klein])).rows[0].eltern_token;
  assert.equal((await rpc(null, "einwilligung_info('nope')")).status, "ungueltig");
  const info = await rpc(null, "einwilligung_info($1)", [tok]);
  assert.equal(info.vorname, "Lena"); assert.equal(info.erteilt, false);
  assert.equal((await rpc(U.klein, "einwilligung_erteilen($1,'Mama','m@x.de',true,true)", [tok])).status, "selbst");
  await assert.rejects(als(db, null, "select einwilligung_erteilen($1,'Mama','keine-mail',false,false)", [tok]), /ew_mail/);
  // Nachweis-Tabelle ist nicht direkt lesbar
  await assert.rejects(als(db, null, "select * from eltern_einwilligungen"));

  // Zustimmung nur für Konto (anonym über den Link)
  assert.equal((await rpc(null, "einwilligung_erteilen($1,'Mama Klein','Mama@X.de',false,false)", [tok])).status, "ok");
  await lern(U.klein);
  await als(db, U.klein, "update profile set noten = '{\"8\":2}' where id = $1", [U.klein]);
  assert.equal((await rpc(U.klein, "ki_verbrauchen(30)")).grund, "eltern_einwilligung");
  await assert.rejects(als(db, U.klein, "select klasse_beitreten($1)", [klasse.code]));
  const meine = await rpc(U.klein, "meine_einwilligung()");
  assert.equal(meine.konto, true); assert.equal(meine.ki, false); assert.equal(meine.von, "Mama Klein");

  // Elternkonto erweitert den Umfang
  assert.equal((await rpc(U.mama, "einwilligung_als_eltern($1,true,true)", [U.klein])).status, "nicht_verbunden");
  assert.equal((await rpc(U.mama, "eltern_verbinden($1)", [tok])).status, "ok");
  const kinder = await rpc(U.mama, "einwilligung_kinder()");
  assert.equal(kinder.length, 1); assert.equal(kinder[0].erteilt, true); assert.equal(kinder[0].ki, false);
  assert.equal((await rpc(U.mama, "einwilligung_als_eltern($1,true,true)", [U.klein])).status, "ok");
  assert.equal((await rpc(U.klein, "ki_verbrauchen(30)")).erlaubt, true);
  assert.equal((await rpc(U.klein, "klasse_beitreten($1)", [klasse.code])).status, "ok");
  assert.equal((await db.query("select count(*)::int n from eltern_einwilligungen where kind_id = $1", [U.klein])).rows[0].n, 2);

  // Umfang ohne Klassen: Klasse wird verlassen
  await rpc(U.mama, "einwilligung_als_eltern($1,true,false)", [U.klein]);
  assert.equal((await db.query("select count(*)::int n from klassen_mitglieder where schueler_id = $1", [U.klein])).rows[0].n, 0);

  // Widerruf über den Link: Lerndaten und Noten weg, wieder gesperrt
  assert.equal((await rpc(null, "einwilligung_widerrufen($1)", [tok])).status, "ok");
  assert.equal((await db.query("select count(*)::int n from lernstand where nutzer_id = $1", [U.klein])).rows[0].n, 0);
  assert.deepEqual((await db.query("select noten from profile where id = $1", [U.klein])).rows[0].noten, {});
  await assert.rejects(lern(U.klein));
  assert.equal((await rpc(null, "einwilligung_info($1)", [tok])).erteilt, false);
  // Der 16+-Schüler ist vom Widerruf eines anderen nicht betroffen
  assert.equal((await db.query("select count(*)::int n from lernstand where nutzer_id = $1", [U.gross])).rows[0].n, 1);
});
