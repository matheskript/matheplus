/* Formelsammlung: Datenkonsistenz – eindeutige Kennungen, gültige Verknüpfungen,
   vorhandene Illustrationen und Werkzeuge, lesbares Mini-TeX. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { FS_ALLE, FS_NACH_ID, FS_FAEDEN, FS_BEREICHE, FS_ZUSATZ_ZIELE, ST_WERTE, STUFEN_INFO, herleitungen, fsSuche, stufenVon, istUnterstufe } from "../src/fsIndex.js";
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
    assert.ok(ST_WERTE.includes(e.st), e.id + ": Stufe " + e.st);
    assert.ok(FS_BEREICHE.some((b) => b.id === e.bereich), e.id + ": Bereich");
  }
  assert.ok(FS_ALLE.length >= 340, "mindestens 340 Formeln, sind " + FS_ALLE.length);
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
  const bilder = fs.readdirSync(new URL("../src/", import.meta.url)).filter((d) => /^funcFsBilder\d+\.jsx$/.test(d)).map(src).join("\n");
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
  assert.equal(fsSuche("ggT")[0].id, "ggt");
  assert.equal(fsSuche("prozentrechnung")[0].id, "prozent-grundgleichung");
  assert.ok(fsSuche("komma").some((e) => e.id === "komma-verschieben"));
  assert.ok(fsSuche("dreisatz").some((e) => e.id === "dreisatz"));
  assert.equal(fsSuche("bayes")[0].id, "bayes");
  assert.ok(fsSuche("kettenregel").some((e) => e.id === "kettenregel"));
});

test("Qualitätsregel: jede Formel hat Bild, ≥ 3 Beweisschritte, mehrere Beweise oder ≥ 4 Schritte, ≥ 2 Verknüpfungen", () => {
  const rueck = {};
  for (const e of FS_ALLE) for (const [id] of e.nutzt || []) (rueck[id] ||= []).push(e.id);
  for (const e of FS_ALLE) {
    const hs = herleitungen(e);
    const schritte = hs.reduce((a, h) => a + h.s.length, 0);
    assert.ok(e.bild, `${e.id}: Bild fehlt`);
    assert.ok(schritte >= 3, `${e.id}: weniger als 3 Beweisschritte`);
    assert.ok(hs.length >= 2 || schritte >= 4, `${e.id}: nur ein kurzer Beweis`);
    assert.ok((e.nutzt || []).length + (rueck[e.id] || []).length >= 2, `${e.id}: weniger als 2 Verknüpfungen`);
  }
});

test("Klasse (kl) passt zur Stufe", () => {
  for (const e of FS_ALLE) {
    if (e.kl === undefined) continue;
    assert.ok(Number.isInteger(e.kl) && e.kl >= 5 && e.kl <= 13, e.id + ": kl " + e.kl);
    const unterste = STUFEN_INFO[stufenVon(e)[0]];
    assert.ok(e.kl >= unterste.von && e.kl <= unterste.bis, `${e.id}: kl ${e.kl} passt nicht zu ${e.st}`);
  }
});

test("Suchwörter (syn) sind klein geschrieben", () => {
  for (const e of FS_ALLE) {
    if (e.syn === undefined) continue;
    assert.equal(typeof e.syn, "string", e.id);
    assert.equal(e.syn, e.syn.toLowerCase(), e.id + ": syn nicht klein");
  }
});

test("Bereich Zahlen existiert, Unterstufe ist nur virtuell", () => {
  assert.ok(FS_BEREICHE.some((b) => b.id === "zahlen"));
  assert.ok(!FS_BEREICHE.some((b) => b.id === "unterstufe"));
  assert.ok(FS_ALLE.filter(istUnterstufe).length >= 20);
});

test("Gruppen eines Bereichs stehen zusammen", () => {
  const folge = [];
  for (const e of FS_ALLE) { const k = e.bereich + "/" + e.g; if (folge[folge.length - 1] !== k) folge.push(k); }
  assert.equal(new Set(folge).size, folge.length, "zerrissene Gruppe");
});

test("jede Formel hat Beispiel und Falle", () => {
  for (const e of FS_ALLE) {
    assert.ok(Array.isArray(e.bsp) && e.bsp.length > 0, e.id + ": Beispiel fehlt");
    assert.ok(typeof e.falle === "string" && e.falle.trim().length > 10, e.id + ": Falle fehlt");
  }
});

test("Rote Fäden: mindestens 17, davon mindestens 4 ab der Unterstufe", () => {
  assert.ok(FS_FAEDEN.length >= 17, "nur " + FS_FAEDEN.length + " Fäden");
  const ab = FS_FAEDEN.filter((f) => f.stationen.some(([id]) => istUnterstufe(FS_NACH_ID[id])));
  assert.ok(ab.length >= 4, "nur " + ab.length + " Fäden ab der Unterstufe");
});

test("Ergänzungen werden zusammengeführt, nicht überschrieben", async () => {
  const { ergZusammen } = await import("../src/fsErgaenzungen.js");
  const z = ergZusammen({ a: { her: { t: "A", s: ["1"] }, bsp: ["x"], nutzt: [["p", "1"]] } }, { a: { her: [{ t: "B", s: ["2"] }], bsp: ["y"], nutzt: [["p", "2"], ["q", "3"]], falle: "F" } });
  assert.deepEqual(z.a.her.map((h) => h.t), ["A", "B"]);
  assert.deepEqual(z.a.bsp, ["x", "y"]);
  assert.deepEqual(z.a.nutzt.map(([id]) => id), ["p", "q"]);
  assert.equal(z.a.falle, "F");
});

test("Unterstufen-Einträge verweisen nicht auf Oberstufen-Werkzeuge", () => {
  const ober = new Set(Object.entries(WERKZEUGE).filter(([, w]) => w.stufe === "ober").map(([k]) => k));
  for (const k of ["winkel", "abstaende", "vektorgenerator", "kreuzprodukt", "ebenen", "geraden", "ebenevsebene", "zweipunkte", "dreipunkte", "ableitungstrainer", "integrale", "kurvendiskussion", "hypothesentest", "bernoulli"]) ober.add(k);
  for (const e of FS_ALLE) {
    if (!e.wz || stufenVon(e)[0] !== "unter") continue;
    assert.ok(!ober.has(e.wz), `${e.id}: Unterstufe verweist auf ${e.wz}`);
  }
});

test("Mini-TeX im Quelltext: keine einfachen Backslashes in Strings", () => {
  /* "\;" oder "\frac" mit nur einem Backslash werden im JS-String zu ";" bzw. Seitenvorschub + "rac" */
  const dateien = fs.readdirSync(new URL("../src/", import.meta.url)).filter((d) => /^fs.*\.js$/.test(d) && d !== "fsIndex.js");
  for (const d of dateien) {
    src(d).split("\n").forEach((zeile, i) => {
      if (/^\s*(\/\/|\/\*|\*)/.test(zeile)) return;
      const m = zeile.match(/(?<!\\)\\(?![\\"'nu])[A-Za-z,;: !{}]/);
      assert.ok(!m, `${d}:${i + 1}: einfacher Backslash »${m && m[0]}« – im String muss es »\\\\« heißen`);
    });
  }
});
