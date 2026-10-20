import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PFADE, KLASSEN, LAND_IDS, pfadAufloesen, pfadFuer, pfadNormal } from "../src/pfade.js";
import { WERKZEUGE, BEREICHE, ansichtenVon } from "../src/werkzeuge.js";

const quelle = (d) => readFileSync(new URL(`../src/${d}`, import.meta.url), "utf8");
const UNTER = ["ziel", "foto", "trainer", "seite", "kurs"];

test("Pfade sind knackig: Kleinbuchstaben, Ziffern, Bindestrich, Schrägstrich", () => {
  for (const e of PFADE) {
    for (const p of [e.pfad, ...e.alias]) assert.match(p, /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?(?:\/[a-z0-9-]+)*$|^$/, `Pfad "${p}"`);
  }
});

test("Kein Pfad und kein Alias kommt doppelt vor", () => {
  const gesehen = new Map();
  for (const e of PFADE) for (const p of [e.pfad, ...e.alias]) {
    assert.ok(!gesehen.has(p), `"${p}" doppelt (${gesehen.get(p)} und ${e.ansicht})`);
    gesehen.set(p, e.ansicht);
  }
});

test("Keine Kollision mit Ref-Zahlen, öffentlichen Formelseiten, Archiv und API", () => {
  for (const e of PFADE) for (const p of [e.pfad, ...e.alias]) {
    assert.ok(!/^[1-9][0-9]{5}$/.test(p), `${p} sieht aus wie ein Ref-Link`);
    assert.ok(!/^(formeln|archiv|api|assets|icons|sitemap|robots|__zugang)(\/|$)/.test(p), `${p} ist reserviert`);
  }
});

test("Jedes Werkzeug (und jede Zweitansicht) hat einen Pfad", () => {
  for (const [id, w] of Object.entries(WERKZEUGE)) for (const a of ansichtenVon(w)) {
    assert.ok(PFADE.some((e) => e.ansicht === a), `Werkzeug ${id} (${a}) ohne Pfad`);
  }
  for (const b of BEREICHE) if (b.uebersicht) assert.ok(PFADE.some((e) => e.ansicht === b.uebersicht), `Übersicht ${b.id}`);
});

test("Jede Ansicht aus func10.jsx hat einen Pfad (bis auf bewusste Ausnahmen)", () => {
  const src = quelle("func10.jsx");
  const ansichten = new Set([...src.matchAll(/ansicht === "([a-z0-9-]+)"/g)].map((m) => m[1]));
  const ohnePfad = new Set(["einheit", "klasse", "blatt"]);   // einheit braucht Zustand; klasse hat /klasse-N; blatt hat /b1/25-1 (Kurzlinks der Schulbücher)
  for (const a of ansichten) {
    if (ohnePfad.has(a)) continue;
    assert.ok(PFADE.some((e) => e.ansicht === a), `Ansicht "${a}" hat keinen Pfad – in pfade.js SEITEN eintragen`);
  }
});

test("Jede Werkzeugseite aus funcWerkzeugSeite.jsx hat einen Pfad", () => {
  const src = quelle("funcWerkzeugSeite.jsx");
  const block = src.slice(src.indexOf("WZ_SEITEN"));
  const keys = [...block.matchAll(/^  ([a-z0-9]+): \{ titel:/gm)].map((m) => m[1]);
  assert.ok(keys.length > 25);
  for (const k of keys) assert.ok(PFADE.some((e) => e.ansicht === k), `Werkzeugseite "${k}" ohne Pfad`);
});

test("Hin und zurück: Pfad → Ziel → Pfad ergibt denselben Pfad", () => {
  for (const e of PFADE) {
    const z = pfadAufloesen("/" + e.pfad);
    assert.ok(z, `/${e.pfad} lässt sich nicht auflösen`);
    assert.equal(z.ansicht, e.ansicht);
    for (const f of UNTER) if (f in e) assert.equal(z[f], e[f], `${e.pfad}: ${f}`);
    assert.equal(pfadFuer(z), "/" + e.pfad, `Rückweg für /${e.pfad}`);
  }
});

test("Aliasse lösen auf dieselbe Seite auf und kennen ihren schönen Pfad", () => {
  for (const e of PFADE) for (const a of e.alias) {
    const z = pfadAufloesen("/" + a);
    assert.equal(z.ansicht, e.ansicht, `Alias ${a}`);
    assert.equal(z.kanonisch, false);
    assert.equal(pfadFuer(z), "/" + e.pfad);
  }
});

test("Genannte Beispiele: /elternabend, /ableitungstrainer, /kurvendiskussion", () => {
  assert.equal(pfadAufloesen("/elternabend").ansicht, "elternabend");
  assert.equal(pfadAufloesen("/ableitungstrainer").ansicht, "ableitungstrainer");
  assert.equal(pfadAufloesen("/kurvendiskussion").ansicht, "plotter");
  assert.equal(pfadAufloesen("/kurvendiskussion/beliebig").ansicht, "advplotter");
  assert.equal(pfadAufloesen("/gleichungen/verstehen").ansicht, "gleichverstehen");
  assert.equal(pfadAufloesen("/landingpage").ansicht, "landingpage");
  assert.equal(pfadAufloesen("/").ansicht, "start");
});

test("Klassen und Bundesländer", () => {
  for (const k of KLASSEN) {
    assert.deepEqual(pfadAufloesen(`/klasse-${k}`), { ansicht: "klasse", klasse: k, kanonisch: true });
    assert.equal(pfadFuer({ ansicht: "klasse", klasse: k }), `/klasse-${k}`);
  }
  assert.equal(pfadAufloesen("/klasse-7"), null);
  assert.equal(pfadAufloesen("/klasse-14"), null);
  for (const l of LAND_IDS) assert.equal(pfadAufloesen(`/landeswettbewerb/${l}`).land, l);
  assert.equal(pfadAufloesen("/landeswettbewerb/xx"), null);
  assert.equal(pfadFuer({ ansicht: "landeswettbewerb", land: "by" }), "/landeswettbewerb/by");
  assert.equal(pfadFuer({ ansicht: "landeswettbewerb", land: "bw" }), "/landeswettbewerb");
});

test("Klassen und Länder passen zur App", () => {
  assert.match(quelle("base4.jsx"), /SCHULKLASSEN = \[8, 9, 10, 11, 12, 13\]/);
  const w = quelle("funcWettbewerbe.jsx");
  const ids = [...w.slice(w.indexOf("export const LAENDER")).matchAll(/^  ([a-z]{2}): \{ name:/gm)].map((m) => m[1]);
  assert.deepEqual([...ids].sort(), [...LAND_IDS].sort());
});

test("Unterziele aus dem Menü (NAV) haben je einen eigenen Pfad", () => {
  assert.equal(pfadFuer({ ansicht: "training", ziel: "weg" }), "/rechenweg");
  assert.equal(pfadFuer({ ansicht: "training", ziel: "klausur" }), "/klausurgenerator");
  assert.equal(pfadFuer({ ansicht: "ki", ziel: null }), "/aufgabengenerator");
  assert.equal(pfadFuer({ ansicht: "ki", ziel: "blatt" }), "/arbeitsblatt");
  assert.equal(pfadFuer({ ansicht: "analyse", foto: "weg" }), "/mathilda/weg");
  assert.equal(pfadFuer({ ansicht: "kopf", trainer: "quadrate" }), "/kopfrechnen/quadratzahlen");
  assert.equal(pfadFuer({ ansicht: "kopf" }), "/kopfrechnen");
  assert.equal(pfadFuer({ ansicht: "kurse", kurs: "penpaper" }), "/videokurse/pen-und-paper");
});

test("Unbekanntes, Ref-Zahlen und fremde Bereiche werden nicht aufgelöst", () => {
  for (const p of ["/gibtsnicht", "/123456", "/formeln", "/formeln/kettenregel", "/archiv/2026-10-17/", "/api/claude"]) assert.equal(pfadAufloesen(p), null, p);
});

test("Schreibweisen: Großbuchstaben, Schrägstrich am Ende, Umlaute, Abfrage und Anker", () => {
  assert.equal(pfadNormal("/Elternabend/"), "elternabend");
  assert.equal(pfadNormal("/elternabend?ticket=danke#x"), "elternabend");
  assert.equal(pfadNormal("/Abstände"), "abstaende");
  assert.equal(pfadAufloesen("/Abstände").ansicht, "abstaende");
  assert.equal(pfadAufloesen("/ELTERNABEND/").ansicht, "elternabend");
});

test("Ansichten ohne Pfad liefern null (App nimmt dann /)", () => {
  assert.equal(pfadFuer({ ansicht: "einheit" }), null);
  assert.equal(pfadFuer({ ansicht: "gibtsnicht" }), null);
});

/* Feste Kurzlinks der gedruckten Schulbücher (QR-Codes): /b1/25-1, /b1/s25, /b1 */
import { buchLinkAufloesen, buchLink, BUECHER } from "../src/pfade.js";
import { BUCH_TYPEN as DIFF_TYPEN } from "../src/diffAufgaben.js";
import { BUCH_TYPEN as VEK_TYPEN } from "../src/vekAufgaben.js";
import { BUCH_TYPEN as KURV_TYPEN } from "../src/kurvAufgaben.js";
test("Kurzlinks der Schulbücher lösen auf und bleiben in sich stimmig", () => {
  assert.deepEqual(pfadAufloesen("/b1/25-1"), { ansicht: "blatt", band: 1, seite: 25, nr: "1", kanonisch: true });
  assert.deepEqual(pfadAufloesen("/B1/10-T3/"), { ansicht: "blatt", band: 1, seite: 10, nr: "T3", kanonisch: true });
  assert.deepEqual(pfadAufloesen("/b2/s17"), { ansicht: "blatt", band: 2, seite: 17, kasten: true, kanonisch: true });
  assert.equal(pfadAufloesen("/b2").ansicht, "vekkurs");
  assert.equal(pfadAufloesen("/b4/1-1"), null);
  assert.equal(pfadAufloesen("/b3").ansicht, "plotter");   // Band 3 hat noch keinen Kurs
  assert.equal(buchLinkAufloesen("b1/25-1a").nr, "1a");
  assert.equal(pfadFuer({ ansicht: "blatt", band: 1, seite: 25, nr: "1" }), "/b1/25-1");
  assert.equal(pfadFuer({ ansicht: "blatt", band: 2, seite: 17, kasten: true }), "/b2/s17");
  for (const b of Object.keys(BUECHER)) assert.ok(pfadAufloesen(`/b${b}`), `Band ${b}`);
});
test("Jede Buchaufgabe mit Typ hat einen Kurzlink, der wieder auf Typ und Seite führt", () => {
  for (const [band, typen] of [[1, DIFF_TYPEN], [2, VEK_TYPEN], [3, KURV_TYPEN]]) {
    for (const k of Object.keys(typen)) {
      const [seite, nr] = k.split("-");
      const z = pfadAufloesen(buchLink(band, Number(seite), nr));
      assert.ok(z && z.ansicht === "blatt" && z.seite === Number(seite) && z.nr === nr, `${band}: ${k} → ${JSON.stringify(z)}`);
    }
  }
});
