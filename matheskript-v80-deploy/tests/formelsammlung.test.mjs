/* Formelsammlung: Datenkonsistenz – eindeutige Kennungen, gültige Verknüpfungen,
   vorhandene Illustrationen und Werkzeuge, lesbares Mini-TeX. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { FS_ALLE, FS_NACH_ID, FS_FAEDEN, FS_BEREICHE, FS_ZUSATZ_ZIELE, herleitungen, fsSuche } from "../src/fsIndex.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

const src = (p) => fs.readFileSync(new URL("../src/" + p, import.meta.url), "utf8");

/* Bekannte Mini-TeX-Befehle: Strukturbefehle aus mLies + Symboltabelle MSYM aus base1.jsx */
const base1 = src("base1.jsx");
const msymBlock = base1.slice(base1.indexOf("export const MSYM"), base1.indexOf("};", base1.indexOf("export const MSYM")));
const MSYM = new Set([...msymBlock.matchAll(/(?:^|[\s{,])"?([A-Za-z]+|[,;: ])"?\s*:/g)].map((m) => m[1]));
const STRUKTUR = new Set(["frac", "sqrt", "vec", "overline", "binom", "spalte", "text", "lim", "mathbb", "left", "right", "cursor", "feld"]);

function texFehler(t) {
  const fehler = [];
  let tiefe = 0;
  for (const ch of t) { if (ch === "{") tiefe++; if (ch === "}") tiefe--; if (tiefe < 0) break; }
  if (tiefe !== 0) fehler.push("Klammern {} unausgeglichen");
  for (const m of t.matchAll(/\\([a-zA-Z]+)/g)) {
    if (!STRUKTUR.has(m[1]) && !MSYM.has(m[1])) fehler.push("unbekannter Befehl \\" + m[1]);
  }
  return fehler;
}

/* alle TeX-Stücke eines Eintrags */
function texStuecke(e) {
  const aus = [e.f];
  const schritt = (s) => {
    if (s.startsWith("$$")) aus.push(s.slice(2).split(" || ")[0]);
    else s.split("$").forEach((teil, i) => { if (i % 2 === 1) aus.push(teil); });
  };
  for (const h of herleitungen(e)) h.s.forEach(schritt);
  (e.bsp || []).forEach(schritt);
  if (e.falle) schritt(e.falle);
  return aus;
}

test("Kennungen sind eindeutig und Pflichtfelder vorhanden", () => {
  const ids = new Set();
  for (const e of FS_ALLE) {
    assert.ok(!ids.has(e.id), "doppelte id " + e.id);
    ids.add(e.id);
    for (const k of ["id", "g", "n", "f", "k", "st", "bereich"]) assert.ok(e[k], `${e.id}: Feld ${k} fehlt`);
    assert.ok(["mittel", "ober", "beide"].includes(e.st), e.id + ": Stufe");
    assert.ok(FS_BEREICHE.some((b) => b.id === e.bereich), e.id + ": Bereich");
  }
  assert.ok(FS_ALLE.length >= 170, "mindestens 170 Formeln, sind " + FS_ALLE.length);
});

test("jede Formel hat eine Herleitung oder Begründung", () => {
  for (const e of FS_ALLE) {
    const h = herleitungen(e);
    assert.ok(h.length > 0, e.id + " ohne Herleitung");
    for (const x of h) {
      assert.ok(x.t && Array.isArray(x.s) && x.s.length > 0, e.id + ": Herleitung leer");
      for (const s of x.s) assert.equal(typeof s, "string", e.id + ": Schritt ist kein Text");
    }
  }
});

test("Verknüpfungen zeigen auf vorhandene Formeln", () => {
  for (const e of FS_ALLE) {
    for (const v of e.nutzt || []) {
      assert.ok(Array.isArray(v) && v.length === 2, e.id + ": nutzt-Format");
      assert.ok(FS_NACH_ID[v[0]], `${e.id} → unbekannte Formel ${v[0]}`);
      assert.notEqual(v[0], e.id, e.id + " verweist auf sich selbst");
    }
  }
});

test("Rote Fäden sind vollständig", () => {
  for (const f of FS_FAEDEN) {
    assert.ok(f.stationen.length >= 4, f.id);
    f.stationen.forEach(([id, wie], i) => {
      assert.ok(FS_NACH_ID[id], `${f.id}: unbekannte Station ${id}`);
      if (i < f.stationen.length - 1) assert.ok(wie, `${f.id}: Übergang nach ${id} fehlt`);
      else assert.equal(wie, null, `${f.id}: letzte Station ohne Übergang`);
    });
  }
});

test("Werkzeug-Verweise existieren", () => {
  for (const e of FS_ALLE) {
    if (!e.wz) continue;
    assert.ok(WERKZEUGE[e.wz] || FS_ZUSATZ_ZIELE[e.wz], `${e.id}: unbekanntes Werkzeug ${e.wz}`);
  }
});

test("Illustrationen existieren", () => {
  const bilder = ["funcFsBilder1.jsx", "funcFsBilder2.jsx", "funcFsBilder3.jsx", "funcFsBilder4.jsx"].filter((d) => fs.existsSync(new URL("../src/" + d, import.meta.url))).map(src).join("\n");
  const namen = new Set([...bilder.matchAll(/^\s+([a-zA-Z0-9]+): \(p\) =>/gm)].map((m) => m[1]));
  for (const e of FS_ALLE) {
    if (!e.bild) continue;
    assert.ok(namen.has(e.bild[0]), `${e.id}: Bild ${e.bild[0]} fehlt`);
  }
});

test("Mini-TeX ist lesbar", () => {
  for (const e of FS_ALLE) {
    for (const t of texStuecke(e)) {
      const f = texFehler(t);
      assert.deepEqual(f, [], `${e.id}: ${f.join(", ")} in »${t}«`);
    }
  }
});

test("Suche findet über Namen", () => {
  assert.equal(fsSuche("pythagoras")[0].id, "pythagoras");
  assert.equal(fsSuche("bayes")[0].id, "bayes");
  assert.ok(fsSuche("kettenregel").some((e) => e.id === "kettenregel"));
});
