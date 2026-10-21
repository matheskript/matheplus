/* Test von supabase/kanal.sql (Gesprächsanfragen, Kanal-Zählung) gegen Postgres (PGlite). Übersprungen, wenn PGlite fehlt. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const hier = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(hier, "..", "supabase", "kanal.sql"), "utf8");
let PGlite = null;
try {
  const ziel = process.env.PGLITE_DIR ? pathToFileURL(path.join(process.env.PGLITE_DIR, "dist/index.js")).href : "@electric-sql/pglite";
  ({ PGlite } = await import(ziel));
} catch (e) { /* nicht installiert */ }

async function anon(db, q, params) {
  await db.exec("set role anon");
  try { return await db.query(q, params); } finally { await db.exec("reset role"); }
}
const anfragen = (db, art, name, telefon, email, extra = {}) =>
  anon(db, "select gespraech_anfrage_senden($1,$2,$3,$4,$5,$6,$7,$8,$9) as id",
    [art, name, telefon, email, extra.klasse || null, extra.thema || null, extra.termine || null, extra.via || "poster", extra.seite || "poster"]);
const fehler = async (p, art) => assert.rejects(p, (e) => String(e.message).includes(`ga_${art}`));

test("kanal.sql: Anfragen nur mit Name und Kontakt, Zählung still, keine Direktzugriffe", { skip: !PGlite && "pglite nicht installiert" }, async () => {
  const db = new PGlite();
  await db.exec(`create role anon nologin; create role authenticated nologin;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;`);
  await db.exec(sql); await db.exec(sql);   // wiederholbar

  await fehler(anfragen(db, "erstgespraech", "", "0123", null), "daten");
  await fehler(anfragen(db, "erstgespraech", "Eva", null, null), "daten");
  await fehler(anfragen(db, "erstgespraech", "Eva", null, "keine-mail"), "daten");
  await fehler(anfragen(db, "kaffee", "Eva", "0123", null), "daten");

  const a = (await anfragen(db, "erstgespraech", " Eva ", "0123", null, { klasse: "Klasse 10", thema: "Ableitungen", termine: "Di abends", via: "Poster-GYM1!", seite: "poster" })).rows[0].id;
  const b = (await anfragen(db, "aufnahme", "Max", null, "MAX@x.de", { via: "linkedin", seite: "abi-eltern" })).rows[0].id;
  assert.ok(a > 0 && b > a);
  const zeilen = (await db.query("select name, telefon, email, klasse, via, seite, art, erledigt from gespraech_anfragen order by id")).rows;
  assert.deepEqual(zeilen[0], { name: "Eva", telefon: "0123", email: null, klasse: "Klasse 10", via: "poster-gym1", seite: "poster", art: "erstgespraech", erledigt: false });
  assert.deepEqual(zeilen[1], { name: "Max", telefon: null, email: "max@x.de", klasse: null, via: "linkedin", seite: "abi-eltern", art: "aufnahme", erledigt: false });

  // Zählung: stille Funktion, Kennungen bereinigt, Leeres wird ignoriert
  await anon(db, "select kanal_zaehlen($1,$2,$3,$4)", ["Poster-GYM1", "poster", "aufruf", null]);
  await anon(db, "select kanal_zaehlen($1,$2,$3,$4)", ["poster-gym1", "poster", "klausur", "Ableitungen"]);
  await anon(db, "select kanal_zaehlen($1,$2,$3,$4)", ["", "poster", "aufruf", null]);
  const z = (await db.query("select via, seite, ereignis, detail from kanal_ereignisse order by id")).rows;
  assert.deepEqual(z, [{ via: "poster-gym1", seite: "poster", ereignis: "aufruf", detail: null }, { via: "poster-gym1", seite: "poster", ereignis: "klausur", detail: "Ableitungen" }]);
  const w = (await db.query("select via, ereignis, anzahl::int as anzahl from kanal_wochen order by ereignis")).rows;
  assert.deepEqual(w, [{ via: "poster-gym1", ereignis: "aufruf", anzahl: 1 }, { via: "poster-gym1", ereignis: "klausur", anzahl: 1 }]);

  // Dauerfeuer: ab 20 Anfragen je Stunde Schluss
  for (let i = 0; i < 18; i++) await anfragen(db, "erstgespraech", `P${i}`, "1", null);
  await fehler(anfragen(db, "erstgespraech", "Zuviel", "1", null), "voll");

  // Kein Direktzugriff als anon
  await assert.rejects(anon(db, "select * from gespraech_anfragen"));
  await assert.rejects(anon(db, "select * from kanal_ereignisse"));
  await assert.rejects(anon(db, "select * from kanal_wochen"));
  await assert.rejects(anon(db, "insert into kanal_ereignisse (via, seite, ereignis) values ('x','y','z')"));
});
