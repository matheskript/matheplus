/* Test von supabase/elternabend.sql (Anmeldung mit Bonuscode) gegen Postgres (PGlite). Übersprungen, wenn PGlite fehlt. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const hier = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(hier, "..", "supabase", "elternabend.sql"), "utf8");
let PGlite = null;
try {
  const ziel = process.env.PGLITE_DIR ? pathToFileURL(path.join(process.env.PGLITE_DIR, "dist/index.js")).href : "@electric-sql/pglite";
  ({ PGlite } = await import(ziel));
} catch (e) { /* nicht installiert */ }

async function anon(db, q, params) {
  await db.exec("set role anon");
  try { return await db.query(q, params); } finally { await db.exec("reset role"); }
}
const anmelden = (db, name, mail, n, code) =>
  anon(db, "select elternabend_anmelden($1,$2,$3,$4,$5) as frei", [name, mail, n, null, code]);
const fehler = async (p, art) => assert.rejects(p, (e) => String(e.message).includes(`ea_${art}`));

test("elternabend.sql: nur mit Bonuscode, Plätze begrenzt, keine Direktzugriffe", { skip: !PGlite && "pglite nicht installiert" }, async () => {
  const db = new PGlite();
  await db.exec(`create role anon nologin; create role authenticated nologin;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;`);
  await db.exec(sql); await db.exec(sql);   // wiederholbar

  await fehler(anmelden(db, "Eva", "eva@x.de", 1, "FALSCH"), "code");
  await fehler(anmelden(db, "Eva", "eva@x.de", 1, ""), "code");
  await fehler(anmelden(db, "", "eva@x.de", 1, "MATHE27"), "daten");
  await fehler(anmelden(db, "Eva", "keine-mail", 1, "MATHE27"), "daten");
  await fehler(anmelden(db, "Eva", "eva@x.de", 5, "MATHE27"), "daten");

  assert.equal((await anmelden(db, "Eva", "eva@x.de", 2, "mathe 27")).rows[0].frei, 38);
  // gleiche Mail (andere Schreibweise) ändert die Anmeldung statt sie zu verdoppeln
  assert.equal((await anmelden(db, "Eva M.", "EVA@x.de", 3, "MATHE27")).rows[0].frei, 37);
  for (let i = 0; i < 9; i++) await anmelden(db, `P${i}`, `p${i}@x.de`, 4, "MATHE27");   // 3 + 36 = 39
  assert.equal((await anmelden(db, "Z", "z@x.de", 1, "MATHE27")).rows[0].frei, 0);
  await fehler(anmelden(db, "Y", "y@x.de", 1, "MATHE27"), "voll");

  const { rows } = await db.query("select count(*)::int n, sum(personen)::int p from elternabend_anmeldungen");
  assert.deepEqual(rows[0], { n: 11, p: 40 });
  await assert.rejects(anon(db, "select * from elternabend_anmeldungen"));
  await assert.rejects(anon(db, "insert into elternabend_anmeldungen (name,email,personen,code) values ('a','a@a.de',1,'X')"));
});
