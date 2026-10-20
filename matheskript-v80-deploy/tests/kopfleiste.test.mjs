/* Kopfleiste (src/funcKopfleiste.jsx): folgt dem Modus der Startseite (dunkel/hell/mix), Besucher ohne Konto bekommen
   das feste Menü Vision · Mathe lernen · Mathilda AI · Blog (nicht zum Ausklappen), angemeldet bleiben Slogan, Chip und ☰. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BESUCHER_MENUE, besucherAktiv } from "../src/kopfleiste.js";
import { START_MODI } from "../src/startModus.js";
import { SPRUENGE } from "../src/sprung.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");

test("Besuchermenü: genau die vier Punkte, in dieser Reihenfolge, mit Zielen in der App", () => {
  assert.deepEqual(BESUCHER_MENUE.map((e) => e.name), ["Vision", "Mathe lernen", "Mathilda AI", "Blog"]);
  assert.deepEqual(BESUCHER_MENUE.map((e) => e.ziel.ansicht), ["start", "start", "analyse", "blog"]);
  assert.equal(BESUCHER_MENUE[2].ziel.foto, "blatt");
  for (const e of BESUCHER_MENUE.filter((x) => x.anker)) {
    assert.ok(quelle("funcStartseite.jsx").includes(`id="${e.anker}"`), `Anker ${e.anker} fehlt auf der Startseite`);
  }
  assert.ok(SPRUENGE["kopfmenue-anker"] && SPRUENGE["kopfmenue-anker"].an && SPRUENGE["kopfmenue-anker"].art === "anker");
  assert.equal(besucherAktiv("blog"), "blog");
  assert.equal(besucherAktiv("analyse", "blatt"), "mathilda");
  assert.equal(besucherAktiv("start"), null);
});

test("Alle drei Modi der Startseite sind im Stil der Kopfleiste definiert; Mathilda AI mit goldenem AI", () => {
  const q = quelle("funcKopfleiste.jsx");
  for (const m of START_MODI.filter((x) => x !== "dunkel")) assert.ok(q.includes(`.kl[data-modus="${m}"]`), m);
  assert.ok(q.includes("useKopfModus") && q.includes("EVENT_START_MODUS"));
  assert.ok(q.includes("<MathildaName dunkel={modus !== \"hell\"} />"), "Mathilda AI kommt aus mathildaName.jsx (AI in Gold)");
  assert.ok(q.includes("<MarkenLogo groesse={gast ? \"var(--kl-logo-gast)\" : \"clamp(21px, 6.5vw, 40px)\"}"), "Besucher: Größe über --kl-logo-gast");
  assert.ok(q.includes("--kl-logo-gast: clamp(14px, 4.33vw, 26.7px)") && q.includes("--kl-logo-gast: 40px"), "Besucher: unter 1060 px ein Drittel kleiner, darüber voll");
  assert.ok(q.includes('HELD_KANTE = "calc(50% - 371.5px)"'), "Besucher am Desktop: Wortmarke bündig mit der Schlagzeile");
  assert.ok(!/aria-expanded/.test(q.split("kl-nav")[1].split("</nav>")[0]), "Das Besuchermenü klappt nicht aus");
  assert.ok(q.includes("kl-fortschritt") && q.includes("data-kompakt"), "Lese-Fortschritt und Zusammenziehen beim Scrollen");
  assert.ok(!/background-size:\s*\d+px \d+px/.test(q) && !q.includes("kl-raster"), "Kein Karoraster im Header (passt nicht zur Marke)");
  assert.ok(q.includes("klLeiser") && q.includes("--kl-kurve-ruhe") && q.includes("mask-image"), "Kurve wird nach dem Einzeichnen leiser und läuft links aus");
});

test("func10.jsx benutzt die Kopfleiste statt einer eigenen Kopfzeile", () => {
  const q = quelle("func10.jsx");
  assert.ok(q.includes('import { Kopfleiste } from "./funcKopfleiste.jsx";'));
  assert.ok(q.includes("<Kopfleiste ansicht={ansicht} gehe={gehe}"));
  assert.ok(!q.includes("<div data-kopfleiste"), "Die alte Kopfzeile ist raus");
});
