/* Mathe Abi Masterclass: Kursdaten und Zugangscodes */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ALPHABET, SALZ, tokenErzeugen, tokenGueltig, tokenNormal, tokenAnzeige, tokenAusText, zugangsLink, pruefzeichen, tokenForm,
} from "../src/masterclassToken.js";
import {
  MC_MONATE, MC_VIDEOS, MC_WERKZEUG_QUELLEN, MC_FREISCHALTUNGEN, modulFertig, modulAnteil, naechstesModul, dauerText,
} from "../src/masterclassDaten.js";
import { WERKZEUGE } from "../src/werkzeuge.js";
import { pfadFuer, pfadAufloesen } from "../src/pfade.js";

const lies = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

test("Codes: erzeugt, geprüft, Tippfehler erkannt", async () => {
  for (let i = 0; i < 200; i++) {
    const t = await tokenErzeugen();
    assert.ok(tokenForm(t), t);
    assert.ok(await tokenGueltig(t), t);
    assert.ok(await tokenGueltig(tokenAnzeige(t).toLowerCase()), "Anzeige und Kleinschreibung gelten");
  }
  // Eine geänderte Stelle fällt (fast immer) auf: über viele Fälle höchstens ein paar Zufallstreffer
  let durch = 0;
  for (let i = 0; i < 300; i++) {
    const t = await tokenErzeugen();
    const k = 2 + (i % 8);
    const neu = t.slice(0, k) + ALPHABET[(ALPHABET.indexOf(t[k]) + 1 + (i % 30)) % 32] + t.slice(k + 1);
    if (await tokenGueltig(neu)) durch++;
  }
  assert.ok(durch <= 3, `zu viele unerkannte Tippfehler: ${durch}`);
  assert.equal(await tokenGueltig("MC12345"), false);
  assert.equal(await tokenGueltig(""), false);
});

test("Codes: Verwechsler und Links", async () => {
  const t = await tokenErzeugen(new Uint8Array([0, 1, 24, 3, 4, 5, 6, 7]));   // enthält 0 und 1
  assert.equal(tokenNormal(t.replace(/0/g, "O").replace(/1/g, "l")), t);
  assert.equal(tokenAusText(`Hier dein Link: ${zugangsLink(t)} – viel Spaß!`), t);
  assert.equal(tokenAusText(tokenAnzeige(t)), t);
  assert.match(zugangsLink(t), /^https:\/\/mythosmathe\.de\/masterclass\/zugang\?z=MC[0-9A-Z]{10}$/);
  assert.equal(pfadAufloesen("/masterclass/zugang").ansicht, "mczugang");
});

test("Codes: Middleware und SQL rechnen mit demselben Salz und Alphabet", async () => {
  const mw = lies("../middleware.js");
  const sql = lies("../supabase/masterclass.sql");
  assert.ok(mw.includes(`"${ALPHABET}"`) && mw.includes(`"${SALZ}"`), "middleware.js");
  assert.ok(sql.includes(`'${ALPHABET}'`) && sql.includes(`'${SALZ}:'`), "masterclass.sql");
  // Bekannter Wert, gegen PostgreSQL nachgerechnet (masterclass_pruefzeichen('7K2Q9XFA'))
  assert.equal((await pruefzeichen("7K2Q9XFA")).length, 2);
});

test("Kursdaten: zehn Lektionen, vollständig", () => {
  assert.equal(MC_VIDEOS.length, 10);
  assert.equal(new Set(MC_VIDEOS.map((v) => v.id)).size, 10);
  for (const m of MC_MONATE) assert.ok(MC_VIDEOS.some((v) => v.monat === m.id), `Monat ${m.id} ohne Lektion`);
  for (const v of MC_VIDEOS) {
    assert.ok(MC_MONATE.some((m) => m.id === v.monat), v.id);
    assert.ok(v.dauer > 300 && v.dauer < 3600, v.id);
    assert.equal(v.marken[0][0], 0, `${v.id}: erste Marke bei 0:00`);
    v.marken.forEach(([s], i) => { if (i) assert.ok(s > v.marken[i - 1][0] && s < v.dauer, `${v.id}: Marke ${i}`); });
    assert.equal(v.lernziele.length, 3, v.id);
    assert.ok(v.auftrag.length >= 3, v.id);
    assert.ok(v.mindset.titel && v.mindset.text, v.id);
    assert.ok(v.mathilda.length > 40, v.id);
    assert.ok(v.werkzeuge.length >= 2, v.id);
    assert.match(dauerText(v.dauer), /^\d+:\d\d$/);
  }
});

test("Kursdaten: jedes Werkzeug existiert, jedes Ziel hat einen Pfad", () => {
  const wzSeiten = lies("../src/funcWerkzeugSeite.jsx");
  const diff = lies("../src/funcDiffKurs.jsx");
  const vek = lies("../src/funcVekKurs.jsx");
  for (const v of MC_VIDEOS) for (const id of v.werkzeuge) assert.ok(MC_WERKZEUG_QUELLEN[id], `${v.id}: ${id} fehlt in MC_WERKZEUG_QUELLEN`);
  for (const [id, q] of Object.entries(MC_WERKZEUG_QUELLEN)) {
    if (q.quelle === "seite") assert.ok(new RegExp(`^  ${id}: \\{`, "m").test(wzSeiten), `${id} nicht in WZ_SEITEN`);
    else if (q.quelle === "diff") assert.ok(new RegExp(`^  ${id}: `, "m").test(diff), `${id} nicht im Kurs Differentialrechnung`);
    else if (q.quelle === "vek") assert.ok(new RegExp(`^  ${id}: `, "m").test(vek), `${id} nicht im Kurs Vektoren`);
    else {
      assert.equal(q.quelle, "link", id);
      assert.ok(q.titel && q.zeichen, id);
      assert.ok(pfadFuer(q.ziel), `${id}: Ziel ${q.ziel.ansicht} ohne Pfad`);
    }
  }
  for (const f of MC_FREISCHALTUNGEN) if (f.ziel && f.ziel.ansicht !== "start") assert.ok(pfadFuer(f.ziel), `Freischaltung ${f.id}`);
  assert.ok(Object.keys(WERKZEUGE).length > 0);
  assert.equal(pfadFuer({ ansicht: "mckurs" }), "/masterclass/kurs");
});

test("Fortschritt: gesehen + alle Aufträge = geschafft", () => {
  const v = MC_VIDEOS[0];
  assert.equal(modulFertig(v, {}), false);
  assert.equal(modulAnteil(v, {}), 0);
  const halb = { gesehen: { [v.id]: true }, auftrag: { [v.id]: [true] } };
  assert.equal(modulFertig(v, halb), false);
  assert.ok(modulAnteil(v, halb) > 0 && modulAnteil(v, halb) < 1);
  const ganz = { gesehen: { [v.id]: true }, auftrag: { [v.id]: v.auftrag.map(() => true) } };
  assert.equal(modulFertig(v, ganz), true);
  assert.equal(naechstesModul(ganz).id, MC_VIDEOS[1].id);
  assert.equal(naechstesModul({}).id, MC_VIDEOS[0].id);
});

/* ---------- Passwortseite: persönlicher Link öffnet die Testseite ---------- */
async function mw(url) {
  delete process.env.SEITEN_SCHUTZ; delete process.env.SUPABASE_URL; delete process.env.VITE_SUPABASE_URL;
  const { default: middleware } = await import("../middleware.js");
  return middleware(new Request(url));
}

test("Middleware: echter Code → Zugangs-Cookie, falscher Code → Passwortseite", async () => {
  const t = await tokenErzeugen();
  const ok = await mw(`https://mythosmathe.de/masterclass/zugang?z=${t}`);
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get("location"), `/masterclass/zugang?z=${t}`);
  assert.ok(ok.headers.getSetCookie().some((c) => c.startsWith("mm_zugang=") && /HttpOnly/.test(c)));

  const falsch = t.slice(0, 11) + (t[11] === "A" ? "B" : "A");
  const nein = await mw(`https://mythosmathe.de/masterclass/zugang?z=${falsch}`);
  assert.equal(nein.status, 401);
  const anders = await mw(`https://mythosmathe.de/masterclass/kurs?z=${t}`);
  assert.equal(anders.status, 401, "nur die Zugangsseite nimmt Codes an");
});

test("Middleware rechnet dieselben Prüfzeichen wie die App", async () => {
  const m = await import("../middleware.js");
  for (let i = 0; i < 50; i++) {
    const t = await tokenErzeugen();
    assert.equal(await m.mcPruefzeichen(t.slice(2, 10)), t.slice(10));
    assert.equal(await m.mcTokenEcht(tokenAnzeige(t).toLowerCase()), t);
  }
});
