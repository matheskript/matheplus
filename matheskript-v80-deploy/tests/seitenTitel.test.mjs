import test from "node:test";
import assert from "node:assert/strict";
import { tabTitel, SEITEN_TITEL, MARKE } from "../src/seitenTitel.js";
import { WERKZEUGE } from "../src/werkzeuge.js";
import { SEITEN } from "../src/pfade.js";

test("Tab-Titel: Werkzeuge mit Namen, Start mit Claim, Unbekanntes nur Marke", () => {
  assert.equal(tabTitel("ableitungstrainer"), "Ableitungstrainer – Mythos Mathe");
  assert.equal(tabTitel("advplotter"), "Kurvendiskussion – Mythos Mathe");
  assert.equal(tabTitel("start"), "Mythos Mathe – Mathe kann jeder verstehen");
  assert.equal(tabTitel("gibtsnicht"), MARKE);
  for (const id of Object.keys(WERKZEUGE)) assert.ok(tabTitel(WERKZEUGE[id].ziel.ansicht).startsWith(WERKZEUGE[id].name));
});

test("Jeder Seitentitel gehört zu einer Ansicht mit Pfad", () => {
  const ansichten = new Set(SEITEN.map((s) => s.ansicht));
  for (const a of Object.keys(SEITEN_TITEL)) assert.ok(ansichten.has(a), `Seitentitel für unbekannte Ansicht „${a}“`);
});

test("index.html erlaubt das Zoomen (kein maximum-scale)", async () => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(!/maximum-scale/.test(html) && !/user-scalable=no/.test(html));
});
