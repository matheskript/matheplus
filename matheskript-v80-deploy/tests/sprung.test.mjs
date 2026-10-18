/* Sprung-Schalter (src/sprung.js): Die Seite springt nur dort von selbst,
   wo es in der Liste steht. Dieser Test schlägt an, sobald irgendwo in src/
   ein scrollTo/scrollIntoView/scrollBy ohne springe(…) auftaucht oder ein
   Schlüssel benutzt wird, den die Liste nicht kennt. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { SPRUENGE, sprungAn, springe, sprungListe } from "../src/sprung.js";

const SRC = new URL("../src/", import.meta.url).pathname;
const alleDateien = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? alleDateien(p) : /\.(jsx?|mjs)$/.test(n) ? [p] : [];
});
const DATEIEN = alleDateien(SRC).map((p) => ({ p: p.slice(SRC.length), s: readFileSync(p, "utf8") }));
const AUFRUF = /\.(scrollTo|scrollIntoView|scrollBy)\s*\(/;

test("Jeder Scroll-Aufruf läuft über springe(…) oder ist begründet ausgenommen", () => {
  const offen = [];
  for (const { p, s } of DATEIEN) {
    if (p === "sprung.js") continue;
    s.split("\n").forEach((z, i) => {
      if (AUFRUF.test(z) && !z.includes("springe(") && !z.includes("sprung-frei:")) offen.push(`${p}:${i + 1}`);
    });
  }
  assert.deepEqual(offen, [], "Neuen Sprung in src/sprung.js eintragen und mit springe(\"schlüssel\", () => …) aufrufen");
});

test("Alle benutzten Schlüssel stehen in der Liste", () => {
  const unbekannt = [];
  for (const { p, s } of DATEIEN) {
    for (const m of s.matchAll(/springe\(\s*"([^"]+)"/g)) if (!(m[1] in SPRUENGE)) unbekannt.push(`${p}: ${m[1]}`);
    for (const m of s.matchAll(/fokus\([^,]+,\s*"([^"]+)"\)/g)) if (!(m[1] in SPRUENGE)) unbekannt.push(`${p}: ${m[1]}`);
    for (const m of s.matchAll(/(?:data-sprung|sprung)="([^"]+)"/g)) if (!(m[1] in SPRUENGE)) unbekannt.push(`${p}: ${m[1]}`);
    for (const m of s.matchAll(/(?:quelle|tabQuelle)\s*=\s*useRef\("([^"]+)"\)/g)) if (!(m[1] in SPRUENGE)) unbekannt.push(`${p}: ${m[1]}`);
    for (const m of s.matchAll(/(?:setKap|setTab|wechseln|wechsle|oben)\([^)]*?,\s*"([a-z-]+)"\)/g)) if (!(m[1] in SPRUENGE)) unbekannt.push(`${p}: ${m[1]}`);
  }
  assert.deepEqual(unbekannt, []);
});

test("Jeder Eintrag ist vollständig beschrieben", () => {
  for (const [id, e] of Object.entries(SPRUENGE)) {
    assert.equal(typeof e.an, "boolean", id);
    assert.ok(["auswahl", "seite", "anker", "halten"].includes(e.art), `${id}: art`);
    assert.ok(e.wo && e.wo.length > 10, `${id}: wo`);
  }
});

test("Stand 18.10.: Auswahl-Sprünge nur in den Schulmathe-Menüs der Startseite", () => {
  const an = sprungListe().filter((e) => e.art === "auswahl" && e.an).map((e) => e.id);
  assert.deepEqual(an, ["start-schulmathe"]);
  assert.equal(sprungAn("lernweg-kapitel"), false, "Kapitel-Leiste (Video) springt nicht mehr");
  assert.equal(sprungAn("aufklappen@ungleichungen"), false, "Aufklappen in Werkzeugen folgt aufklappen@*");
  assert.equal(sprungAn("aufklappen@start"), false);
  assert.equal(sprungAn("seitenwechsel"), true, "Neue Seite beginnt oben");
});

test("springe führt nur bei eingeschaltetem Schalter aus; unbekannte Schlüssel nie", () => {
  let n = 0;
  assert.equal(springe("start-schulmathe", () => { n += 1; }), true);
  assert.equal(springe("lernweg-kapitel", () => { n += 10; }), false);
  assert.equal(springe("gibt-es-nicht", () => { n += 100; }), false);
  assert.equal(n, 1);
});
