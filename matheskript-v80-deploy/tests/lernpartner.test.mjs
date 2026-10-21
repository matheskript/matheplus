/* Lernpartner-Börse: Logik in der Oberfläche passt zur Datenbank (lernpartner.sql) */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lpTextOk, nameOk, stadtOk, ortNameOk, passung, passungGruende, vorschlag, steckbriefVorlage, steckbriefFehler, beispielTreffer, BEREICHE, ZEITEN, ORTE, MELDUNG, terminText } from "../src/lernpartner.js";

const sql = readFileSync(new URL("../supabase/lernpartner.sql", import.meta.url), "utf8");

test("Kontaktdaten werden erkannt – wie lp_text_ok", () => {
  for (const t of ["anna@web.de", "insta: anna", "www.x.de", "0171 2345678", "wa.me/49", "Snap anna", "meine Nummer", "anna.de "]) assert.equal(lpTextOk(t), false, t);
  for (const t of ["Stadtbibliothek am Mailänder Platz", "Café Mitte", "Hegel-Gymnasium", "Raum 204"]) assert.equal(lpTextOk(t), true, t);
  assert.ok(nameOk("Anna") && nameOk("Jean-Luc") && !nameOk("A") && !nameOk("Anna1") && !nameOk("insta anna"));
  assert.ok(stadtOk("Stuttgart") && stadtOk("Frankfurt (Oder)") && !stadtOk("x") && !stadtOk("70173"));
  assert.ok(ortNameOk("Café Mitte") && !ortNameOk("x") && !ortNameOk("www.cafe.de"));
});

test("Erlaubte Werte und Rückgabecodes stimmen mit der SQL-Datei überein", () => {
  for (const liste of [BEREICHE, ZEITEN, ORTE]) for (const x of liste) assert.ok(sql.includes(`'${x.id}'`), x.id);
  const codes = new Set([...sql.matchAll(/return '([a-z_]+)'/g)].map((m) => m[1]));
  for (const c of codes) assert.ok(MELDUNG[c] || ["kein_konto", "rolle", "alter", "unter16", "freigabe"].includes(c), `Code ${c} ohne Meldung`);
});

test("Passung, Gründe, Vorschlag, Steckbrief", () => {
  const ich = { niveau: "erhoeht", helfen: ["analysis"], suchen: ["stochastik"], zeiten: ["sa"], orte: ["cafe"] };
  const du = { niveau: "erhoeht", helfen: ["stochastik"], suchen: ["analysis"], zeiten: ["sa", "so"], orte: ["bibliothek", "cafe"] };
  assert.equal(passung(ich, du), 6);
  assert.equal(passungGruende(ich, du).length, 3);
  assert.deepEqual(vorschlag(ich, du), { zeit: "sa", ort: "cafe" });
  const s = steckbriefVorlage({ jahr: 2028, niveau: "grundlegend" }, "Max Mustermann");
  assert.equal(s.anzeigename, "Max"); assert.equal(s.abi_jahr, 2028);
  assert.equal(steckbriefFehler(s), "stadt");
  assert.equal(steckbriefFehler({ ...s, stadt: "Ulm" }), null);
  const t = beispielTreffer();
  for (let i = 1; i < t.length; i++) assert.ok(t[i - 1].passung >= t[i].passung);
  assert.match(terminText("2026-10-24T13:00:00Z"), /^Sa 24\.10\., \d\d:00$/);
});
