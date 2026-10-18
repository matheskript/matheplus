import test from "node:test";
import assert from "node:assert/strict";
import { WERKZEUGE, START_BLOECKE, startBloecke, passtStufe } from "../src/werkzeuge.js";

const STUFEN = ["unter", "mittel", "ober", "alle"];
/* Titel und Werkzeuge, die der Stufen-Schalter wirklich zeigt */
const sichtbar = (stufe) => startBloecke(stufe).map((b) => ({
  id: b.id, titel: b.titel,
  werkzeuge: b.stationen.flatMap((st) => st.werkzeuge.filter((id) => passtStufe(WERKZEUGE[id], stufe))),
})).filter((b) => b.werkzeuge.length);
const ids = (stufe) => sichtbar(stufe).map((b) => b.id);
const alleWerkzeuge = (stufe) => new Set(sichtbar(stufe).flatMap((b) => b.werkzeuge));

test("Jede Station und jedes Werkzeug der Anordnung gibt es", () => {
  for (const s of STUFEN) for (const b of startBloecke(s)) for (const st of b.stationen) for (const id of st.werkzeuge) assert.ok(WERKZEUGE[id], `${b.id}: ${id}`);
});

test("Kein Werkzeug geht verloren: Bei „Alle“ steht jedes in der Liste", () => {
  const da = alleWerkzeuge("alle");
  for (const id of Object.keys(WERKZEUGE)) assert.ok(da.has(id), `Werkzeug ${id} fehlt in der Schulmathematik-Liste`);
});

test("Neue Namen der Bereiche", () => {
  const t = (stufe, id) => startBloecke(stufe).find((b) => b.id === id)?.titel;
  assert.equal(t("ober", "analysis"), "Funktionen und Kurven");
  assert.equal(t("alle", "analysis"), "Funktionen und Kurven");
  assert.equal(t("mittel", "analysis"), "Geraden und Parabeln");
  assert.equal(t("ober", "vektoren"), "Vektoren, Geraden und Ebenen");
  assert.equal(t("ober", "stochastik"), "Wahrscheinlichkeitsrechnung");
  assert.equal(t("mittel", "stochastik"), "Wahrscheinlichkeitsrechnung");
  assert.equal(t("ober", "werkzeuge"), "Formelsammlung und Werkzeuge");
});

test("Textaufgaben und Gleichungen sind keine eigenen Bereiche mehr, sondern im Werkzeugkasten", () => {
  assert.ok(!START_BLOECKE.some((b) => b.id === "textaufgaben" || b.id === "gleichungen"));
  for (const s of STUFEN) {
    const kiste = sichtbar(s).find((b) => b.id === "werkzeuge");
    assert.ok(kiste, `Werkzeugkasten fehlt (${s})`);
    assert.ok(kiste.werkzeuge.includes("textaufgaben"), `Textaufgaben fehlen im Werkzeugkasten (${s})`);
    assert.ok(kiste.werkzeuge.includes("gleichungen"), `Gleichungen fehlen im Werkzeugkasten (${s})`);
    for (const b of sichtbar(s).filter((x) => x.id !== "werkzeuge")) assert.ok(!b.werkzeuge.includes("textaufgaben"), `Textaufgaben auch in ${b.id} (${s})`);
  }
});

test("Gleichungssysteme: Oberstufe bei den Vektoren, Mittelstufe im Werkzeugkasten, nie doppelt", () => {
  const ort = (s) => sichtbar(s).filter((b) => b.werkzeuge.includes("lgs")).map((b) => b.id);
  assert.deepEqual(ort("ober"), ["vektoren"]);
  assert.deepEqual(ort("mittel"), ["werkzeuge"]);
  assert.deepEqual(ort("alle"), ["vektoren"]);
  assert.deepEqual(ort("unter"), []);
});

test("Unterstufe (5–6): keine Funktionen, Vektoren, Wahrscheinlichkeitsrechnung, Kl.-7-Geometrie", () => {
  const d = ids("unter");
  for (const id of ["analysis", "vektoren", "stochastik"]) assert.ok(!d.includes(id), id);
  const w = alleWerkzeuge("unter");
  for (const id of ["kongruenz", "konstruktion", "terme", "geradengleichung", "parabeln"]) assert.ok(!w.has(id), id);
  for (const id of ["bruchrechnen", "dezimal", "zuordnungen", "prozent"]) assert.ok(w.has(id), id);
});

test("Brüche und Dezimalzahlen, Zuordnungen und Prozent gehören nur in die Unterstufe", () => {
  const w = alleWerkzeuge("mittel");
  for (const id of ["bruchrechnen", "dezimal", "zuordnungen", "prozent"]) assert.ok(!w.has(id), `${id} in der Mittelstufe`);
  assert.ok(!ids("mittel").includes("bruchrechnen") && !ids("mittel").includes("prozent"));
});

test("Mittelstufe (7–10): Kongruenz, Besondere Linien, Terme, Bruchterme sind da", () => {
  const w = alleWerkzeuge("mittel");
  for (const id of ["kongruenz", "konstruktion", "terme", "bruchterme", "geradengleichung", "parabeln"]) assert.ok(w.has(id), id);
  assert.ok(!ids("mittel").includes("vektoren"));
});

test("Oberstufe: keine Geraden/Parabeln-Mittelstufe-Werkzeuge", () => {
  const w = alleWerkzeuge("ober");
  for (const id of ["geradengleichung", "parabeln", "bruchrechnen", "prozent", "kongruenz"]) assert.ok(!w.has(id), id);
});
