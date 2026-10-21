/* Test von supabase/lernpartner.sql (Lernpartner-Börse) gegen Postgres (PGlite). Übersprungen, wenn PGlite fehlt. */
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

const id = (n) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, "0")}`;
const U = { anna: id(1), ben: id(2), cem: id(3), dora: id(4), mama: id(5), lehr: id(6), jung: id(7), emil: id(8), fritz: id(9), gina: id(10), hans: id(11), ida: id(12) };

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
  await db.exec(sql("lernpartner.sql"));
  await db.exec(sql("lernpartner.sql"));   // wiederholbar
  for (const u of Object.values(U)) await db.exec(`insert into auth.users values ('${u}', 'u${u.slice(-2)}@x.de')`);
  return db;
}

async function als(db, uid, q, params) {
  await db.exec(`set role ${uid ? "authenticated" : "anon"}; select set_config('request.jwt.claim.sub','${uid || ""}',false)`);
  try { return await db.query(q, params); }
  finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false)`); }
}

const steckbrief = (name, extra = {}) => JSON.stringify({ anzeigename: name, stadt: "Stuttgart", abi_jahr: 2027, niveau: "erhoeht", helfen: ["analysis"], suchen: ["stochastik"], zeiten: ["wt-nachmittag"], orte: ["bibliothek"], ...extra });

test("lernpartner.sql: Zugang, Steckbrief, Suche, Anfrage, Gruppe, Treffen, Schutz", { skip: !PGlite && "pglite nicht installiert" }, async () => {
  const db = await aufbauen();
  const r = async (uid, q, params) => (await als(db, uid, `select ${q} as r`, params)).rows[0].r;
  const ins = (uid, name, rolle) => als(db, uid, "insert into profile (id, name, rolle) values ($1,$2,$3)", [uid, name, rolle]);
  const alter = (uid, u16) => r(uid, "alter_angeben($1)", [u16]);
  for (const [k, n] of [["anna", "Anna A"], ["ben", "Ben B"], ["cem", "Cem C"], ["dora", "Dora D"], ["jung", "Jule J"], ["emil", "Emil E"], ["fritz", "Fritz F"], ["gina", "Gina G"], ["hans", "Hans H"], ["ida", "Ida I"]]) await ins(U[k], n, "schueler");
  await ins(U.mama, "Mama C", "eltern"); await ins(U.lehr, "Frau L", "lehrkraft");

  // Zugang: Rolle, Alter, Freigabe
  assert.equal(await r(U.lehr, "lp_status()->>'grund'"), "rolle");
  assert.equal(await r(U.anna, "lp_status()->>'grund'"), "alter");
  await alter(U.jung, true);
  assert.equal(await r(U.jung, "lp_status()->>'grund'"), "unter16");
  for (const k of ["anna", "ben", "cem", "dora", "emil", "fritz", "gina", "hans", "ida"]) await alter(U[k], false);
  assert.equal(await r(U.cem, "lp_status()->>'grund'"), "freigabe");
  assert.equal(await r(U.cem, "lp_profil_speichern($1)", [steckbrief("Cem")]), "nicht_erlaubt");
  for (const k of ["anna", "ben", "dora", "emil", "fritz", "gina", "hans", "ida"]) await r(U[k], "volljaehrig_erklaeren()");
  assert.equal(await r(U.anna, "lp_status()->>'grund'"), "ok");

  // Eltern-Freigabe nur mit Verknüpfung
  assert.equal(await r(U.mama, "lp_freigeben($1, true)", [U.cem]), "nicht_verbunden");
  await db.query("insert into eltern_kind (eltern_id, kind_id) values ($1, $2)", [U.mama, U.cem]);
  assert.equal(await r(U.mama, "lp_freigeben($1, true)", [U.cem]), "ok");
  assert.equal(await r(U.cem, "lp_status()->>'grund'"), "ok");
  assert.equal((await r(U.mama, "lp_kinder()"))[0].freigabe, true);

  // Steckbrief: keine Kontaktdaten, keine Telefonnummer, Bereiche gefiltert
  assert.equal(await r(U.anna, "lp_profil_speichern($1)", [steckbrief("Anna", { schule: "anna@web.de" })]), "schule");
  assert.equal(await r(U.anna, "lp_profil_speichern($1)", [steckbrief("Anna 0171")]), "name");
  assert.equal(await r(U.anna, "lp_profil_speichern($1)", [steckbrief("insta anna")]), "name");
  assert.equal(await r(U.anna, "lp_profil_speichern($1)", [steckbrief("Anna", { stadt: "x" })]), "stadt");
  assert.equal(await r(U.anna, "lp_profil_speichern($1)", [steckbrief("Anna", { abi_jahr: 1999 })]), "jahr");
  assert.equal(await r(U.anna, "lp_profil_speichern($1)", [steckbrief("Anna", { schule: "Hegel-Gymnasium", schule_zeigen: true, helfen: ["analysis", "quatsch"] })]), "ok");
  assert.deepEqual((await r(U.anna, "lp_status()->'profil'")).helfen, ["analysis"]);
  await r(U.ben, "lp_profil_speichern($1)", [steckbrief("Ben", { stadt: " stuttgart ", helfen: ["stochastik"], suchen: ["analysis"], schule: "Geheim-Schule" })]);
  await r(U.cem, "lp_profil_speichern($1)", [steckbrief("Cem")]);
  await r(U.dora, "lp_profil_speichern($1)", [steckbrief("Dora", { stadt: "Ulm" })]);
  for (const k of ["emil", "fritz", "gina", "hans", "ida"]) await r(U[k], "lp_profil_speichern($1)", [steckbrief(k[0].toUpperCase() + k.slice(1))]);

  // Keine direkten Tabellenrechte
  await assert.rejects(als(db, U.anna, "select * from lernpartner_profil"));
  await assert.rejects(als(db, U.anna, "select * from lernpartner_meldung"));
  await assert.rejects(als(db, U.anna, "select lp_darf($1)", [U.ben]));

  // Suche: gleiche Stadt (Schreibweise egal) und Jahrgang, Schule nur wenn gezeigt, Passung zuerst
  const treffer = (await als(db, U.anna, "select * from lp_suchen()")).rows;
  assert.ok(!treffer.some((t) => t.id === U.dora), "andere Stadt unsichtbar");
  assert.equal(treffer[0].id, U.ben);
  assert.equal(treffer[0].schule, null);
  const beiBen = (await als(db, U.ben, "select * from lp_suchen()")).rows.find((t) => t.id === U.anna);
  assert.equal(beiBen.schule, "Hegel-Gymnasium");

  // Anfrage → Gruppe
  assert.equal(await r(U.anna, "lp_anfragen($1, 'sa', 'bibliothek')", [U.dora]), "nicht_gefunden");
  assert.equal(await r(U.anna, "lp_anfragen($1, 'nachts', 'bibliothek')", [U.ben]), "ungueltig");
  assert.equal(await r(U.anna, "lp_anfragen($1, 'sa', 'bibliothek')", [U.ben]), "ok");
  assert.equal(await r(U.anna, "lp_anfragen($1, 'sa', 'bibliothek')", [U.ben]), "offen");
  assert.equal(await r(U.ben, "lp_anfragen($1, 'sa', 'cafe')", [U.anna]), "offen");
  const ein = await r(U.ben, "lp_meine()->'eingehend'");
  assert.equal(ein.length, 1); assert.equal(ein[0].name, "Anna");
  assert.equal(await r(U.anna, "lp_antworten($1, true)", [ein[0].id]), "nicht_gefunden");   // nur der Empfänger
  assert.equal(await r(U.ben, "lp_antworten($1, true)", [ein[0].id]), "ok");
  const gruppen = await r(U.anna, "lp_meine()->'gruppen'");
  assert.equal(gruppen.length, 1); assert.equal(gruppen[0].name, "Anna & Ben"); assert.equal(gruppen[0].mitglieder.length, 2);
  const g = gruppen[0].id;

  // Treffen: Ort ohne Kontaktdaten, Zukunft, Zusagen
  assert.equal(await r(U.anna, "lp_treffen_vorschlagen($1, now() + interval '2 days', 'bibliothek', 'Stadtbibliothek am Mailänder Platz', 'teila')", [g]), "ok");
  assert.equal(await r(U.anna, "lp_treffen_vorschlagen($1, now() + interval '2 days', 'cafe', 'www.treff.de', 'teila')", [g]), "ort_name");
  assert.equal(await r(U.anna, "lp_treffen_vorschlagen($1, now() - interval '2 days', 'cafe', 'Café Mitte', 'teila')", [g]), "zeit");
  assert.equal(await r(U.cem, "lp_treffen_vorschlagen($1, now() + interval '2 days', 'cafe', 'Café Mitte', 'teila')", [g]), "gruppe");
  const t = (await r(U.ben, "lp_meine()->'gruppen'"))[0].treffen[0];
  assert.equal(t.zusagen, 1); assert.equal(t.meine, null);
  assert.equal(await r(U.ben, "lp_zusagen($1, true)", [t.id]), true);
  assert.equal(await r(U.cem, "lp_zusagen($1, true)", [t.id]), false);
  assert.equal((await r(U.anna, "lp_meine()->'gruppen'"))[0].treffen[0].zusagen, 2);

  // Gruppe wächst bis 6, dann voll
  for (const k of ["cem", "emil", "fritz", "gina"]) {
    assert.equal(await r(U.anna, "lp_anfragen($1, 'sa', 'bibliothek', $2)", [U[k], g]), "ok");
    const a = (await r(U[k], "lp_meine()->'eingehend'"))[0];
    assert.equal(await r(U[k], "lp_antworten($1, true)", [a.id]), "ok");
  }
  assert.equal((await r(U.anna, "lp_meine()->'gruppen'"))[0].mitglieder.length, 6);
  assert.equal(await r(U.ben, "lp_anfragen($1, 'sa', 'bibliothek', $2)", [U.hans, g]), "gruppe_voll");
  assert.equal(await r(U.ben, "lp_anfragen($1, 'sa', 'bibliothek', $2)", [U.cem, g]), "schon_drin");
  await assert.rejects(db.query("insert into lernpartner_mitglied (gruppe_id, nutzer_id) values ($1, $2)", [g, U.hans]));

  // Höchstens 5 Anfragen in 24 Stunden (Anna hat schon 5 gestellt)
  assert.equal(await r(U.anna, "lp_anfragen($1, 'sa', 'bibliothek')", [U.hans]), "limit");

  // Blockieren wirkt beidseitig, Melden blockiert mit
  assert.equal(await r(U.hans, "lp_anfragen($1, 'so', 'cafe')", [U.ida]), "ok");
  assert.equal(await r(U.ida, "lp_melden($1, 'kontakt')", [U.hans]), true);
  assert.equal((await r(U.ida, "lp_meine()->'eingehend'")).length, 0);
  assert.ok(!(await als(db, U.hans, "select * from lp_suchen()")).rows.some((x) => x.id === U.ida));
  assert.equal(await r(U.hans, "lp_anfragen($1, 'so', 'cafe')", [U.ida]), "nicht_gefunden");
  assert.equal((await db.query("select count(*)::int as n from lernpartner_meldung")).rows[0].n, 1);

  // Widerruf der Eltern-Freigabe: Cem verlässt alles, wird unsichtbar
  assert.equal(await r(U.mama, "lp_freigeben($1, false)", [U.cem]), "ok");
  assert.equal(await r(U.cem, "lp_status()->>'grund'"), "freigabe");
  assert.equal((await r(U.cem, "lp_meine()->'gruppen'")).length, 0);
  assert.ok(!(await als(db, U.anna, "select * from lp_suchen()")).rows.some((x) => x.id === U.cem));

  // Verlassen und Löschen
  assert.equal(await r(U.ben, "lp_gruppe_verlassen($1)", [g]), true);
  assert.equal((await r(U.ben, "lp_meine()->'gruppen'")).length, 0);
  assert.equal(await r(U.anna, "lp_profil_loeschen()"), true);
  assert.equal(await r(U.anna, "lp_status()->'profil'"), null);
  assert.equal((await r(U.emil, "lp_meine()->'gruppen'"))[0].mitglieder.length, 3);
});
