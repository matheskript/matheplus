import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LAENDER_KURZ } from "../src/laender.js";
import { LAND_IDS } from "../src/pfade.js";

test("laender.js deckt alle Bundesländer der Pfade ab, mit Name und Art", () => {
  for (const id of LAND_IDS) assert.ok(LAENDER_KURZ[id] && LAENDER_KURZ[id].name && ["lw", "mo"].includes(LAENDER_KURZ[id].art), id);
  const q = readFileSync(new URL("../src/funcWettbewerbe.jsx", import.meta.url), "utf8");
  for (const [id, l] of Object.entries(LAENDER_KURZ)) {
    assert.ok(q.includes(`${id}: { name: "${l.name}", kuerzel: "${l.kuerzel}"`), `${id}: Name/Kürzel weichen von funcWettbewerbe.jsx ab`);
    const lw = new RegExp(`${id}: \\{ name: "[^"]+", kuerzel: "\\w\\w", art: "lw"`).test(q);
    assert.equal(l.art, lw ? "lw" : "mo", `${id}: Art weicht ab`);
  }
  const f10 = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
  assert.ok(!f10.includes('from "./funcWettbewerbe.jsx"'), "func10 darf die Wettbewerbsseiten nicht statisch importieren (Startbündel)");
});
