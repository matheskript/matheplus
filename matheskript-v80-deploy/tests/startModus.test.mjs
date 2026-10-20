/* Startseite dunkel / hell (src/startModus.js): Pfade /start-hell und /start-dunkel (und Aliasse) wählen den Modus;
   ohne Wahl gilt dunkel. Die Startseite (funcStartseite.jsx) kennt beide Modi und führt zu allen Angeboten. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { START_MODI, modusAusPfad, startModus } from "../src/startModus.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");

test("Pfade /start-hell und /start-dunkel (auch startseite-, frontpage-) wählen den Modus", () => {
  assert.equal(modusAusPfad("/start-hell"), "hell");
  assert.equal(modusAusPfad("/start-dunkel/"), "dunkel");
  assert.equal(modusAusPfad("/Startseite-Hell?x=1"), "hell");
  assert.equal(modusAusPfad("/frontpage-dunkel#oben"), "dunkel");
  assert.equal(modusAusPfad("/"), null);
  assert.equal(modusAusPfad("/start-b"), null);
  assert.equal(modusAusPfad("/elternabend"), null);
  assert.deepEqual(START_MODI, ["dunkel", "hell"]);
});

test("Ohne Browser-Speicher gilt der dunkle Modus", () => {
  assert.equal(startModus(), "dunkel");
});

test("Die Startseite führt zu allen Angeboten", () => {
  const q = quelle("funcStartseite.jsx");
  for (const z of ["ki", "headnumbers", "gleichkurs", "ebbinghaus", "analyse", "penpaperkurs", "elternkurs", "kurse", "diffkurs", "vekkurs", "gfs", "kiwahl", "efunktion", "mckurs", "elternabend"]) {
    assert.ok(q.includes(`ansicht: "${z}"`), `Startseite kennt das Ziel „${z}“ nicht`);
  }
  for (const b of ["<Quickfinder", "<SuchBox", "<StartOnboarding", "<WeitermachenZeile", "<UnterMenue", "<SchulKopf", "ENTDECKEN_MENUE", "MYTHEN", "<DeinPlanBlock", "<AppAnleitung", "<SpendenBereich"]) {
    assert.ok(q.includes(b), `Startseite ohne ${b}`);
  }
});

test("Beide Modi sind im Stil definiert, die Wahl hängt am Wurzelelement und am Dokument", () => {
  const q = quelle("funcStartseite.jsx");
  assert.ok(q.includes('.sbb[data-modus="hell"]'));
  assert.ok(q.includes('html[data-start-modus="dunkel"]') && q.includes('html[data-start-modus="hell"]'));
  assert.ok(q.includes('data-modus={modus}'));
  const r = quelle("func10.jsx");
  assert.ok(r.includes("<StartModusSchalter />"), "Pille zum Umschalten fehlt");
  assert.ok(r.includes("modusAusPfad("));
  const m = quelle("funcArbeitsmenue.jsx");
  assert.ok(m.includes("data-arbeitsmenue-modus"), "Umschalter im Arbeitsmenü fehlt");
});
