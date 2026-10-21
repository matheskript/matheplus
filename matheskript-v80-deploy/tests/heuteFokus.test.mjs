import { test } from "node:test";
import assert from "node:assert/strict";
import { EINHEITEN, einheitenVon, einheitWahl, erledigtHeute, fehlerFokus, standVon, tagesSumme, zeilenTeile, wannText, tagNr } from "../src/heuteFokus.js";
import { WERKZEUGE } from "../src/werkzeuge.js";
import { readFileSync } from "node:fs";

const JETZT = new Date(2026, 9, 21, 16, 0).getTime();
const TAG = 864e5;
const e = (tage, richtig, extra = {}) => ({ zeit: JETZT - tage * TAG, richtig, bereich: "ableitungstrainer", ...extra });

test("jede Einheit hat Titel, Kurzwort, Inhalt und Umfang", () => {
  for (const [id, liste] of Object.entries(EINHEITEN)) {
    assert.ok(WERKZEUGE[id], `Werkzeug ${id} gibt es`);
    for (const x of liste) {
      assert.ok(x.titel && x.kurz && x.inhalt.length >= 1, `${id}/${x.id}`);
      assert.ok(x.aufgaben > 0 && x.min > 0);
      assert.ok(x.kurz.length <= 12, `Kurzwort passt ins Medaillon: ${x.kurz}`);
    }
  }
});

test("Ableitungstrainer: Einheiten entsprechen den Regeln des Trainers", () => {
  const quelle = readFileSync(new URL("../src/funcRegelwerk.jsx", import.meta.url), "utf8");
  const roh = quelle.slice(quelle.indexOf("export const REGEL_CHIPS"), quelle.indexOf("];", quelle.indexOf("export const REGEL_CHIPS")));
  const ids = [...roh.matchAll(/\["([a-z]+)", "/g)].map((m) => m[1]);
  assert.deepEqual(EINHEITEN.ableitungstrainer.map((x) => x.art), ids);
});

test("Funktionen: Einheiten entsprechen den Kapiteln des Lernwegs", () => {
  assert.deepEqual(EINHEITEN.funktionen.map((x) => x.kapitel), ["begriff", "potenz", "wurzel", "umkehr", "verkettung", "dw", "mix"]);
});

test("Werkzeuge ohne Liste: Einheiten aus der Zeile", () => {
  assert.deepEqual(zeilenTeile("Normalform, Scheitelform, Nullstellen"), ["Normalform", "Scheitelform", "Nullstellen"]);
  assert.equal(zeilenTeile("f(x) = a · sin(b · (x − c)) + d").length, 0);
  const p = einheitenVon("parabeln");
  assert.equal(p.length, 3);
  assert.equal(p[1].titel, "Parabeln: Scheitelform");
  const s = einheitenVon("lgs");
  assert.ok(s.length >= 1 && s.every((x) => x.titel && x.kurz));
  // alle Werkzeuge liefern mindestens eine Einheit mit kurzem Titel
  for (const id of Object.keys(WERKZEUGE)) assert.ok(einheitenVon(id).length >= 1, id);
});

test("Wahl: nie geübt → erste Einheit, neu", () => {
  const w = einheitWahl("ableitungstrainer", { protokoll: [], jetzt: JETZT });
  assert.equal(w.einheit.id, "produkt");
  assert.equal(w.grund, "neu");
  assert.equal(w.fortschritt, 0);
});

test("Wahl: schwache Einheit geht vor neuer", () => {
  const protokoll = [e(2, true, { art: "quotient" }), e(2, false, { art: "produkt" }), e(2, false, { art: "produkt" }), e(1, true, { art: "produkt" })];
  const w = einheitWahl("ableitungstrainer", { protokoll, jetzt: JETZT });
  assert.equal(w.einheit.id, "produkt");
  assert.equal(w.grund, "schwach");
  assert.equal(w.stand.n, 3);
});

test("Wahl: nach den neuen kommt die am längsten nicht geübte", () => {
  const protokoll = EINHEITEN.ableitungstrainer.map((x, i) => e(10 - i, true, { art: x.id }));
  const w = einheitWahl("ableitungstrainer", { protokoll, jetzt: JETZT });
  assert.equal(w.einheit.id, "produkt");
  assert.equal(w.grund, "dran");
  assert.equal(w.fortschritt, 1);
});

test("Wahl: heute angefangen bleibt stehen, heute geschafft bleibt sichtbar", () => {
  const ang = einheitWahl("ableitungstrainer", { protokoll: [e(0, true, { art: "kette" })], jetzt: JETZT });
  assert.equal(ang.einheit.id, "kette");
  assert.equal(ang.grund, "angefangen");
  assert.equal(erledigtHeute(ang), false);
  const vier = [0, 0, 0, 0].map(() => e(0, true, { art: "kette" }));
  const fertig = einheitWahl("ableitungstrainer", { protokoll: vier, jetzt: JETZT });
  assert.equal(fertig.grund, "geschafft");
  assert.equal(erledigtHeute(fertig), true);
});

test("Steckbrief: Gruppen aus dem Werkzeug werden den Einheiten zugeordnet", () => {
  const protokoll = [{ zeit: JETZT - TAG, richtig: true, bereich: "steckbrief", gruppe: "poly-p2" }];
  const w = einheitWahl("steckbrief", { protokoll, jetzt: JETZT });
  assert.equal(w.einheit.id, "p3");   // p2 geübt, p3 als nächste neue
});

test("Lernweg: dort weiter, wo der Schüler steht", () => {
  const w = einheitWahl("funktionen", { kapitel: "verkettung", jetzt: JETZT });
  assert.equal(w.einheit.titel, "Verkettungen bilden");
  assert.equal(w.grund, "weiter");
  assert.equal(w.index, 4);
  assert.equal(erledigtHeute(w), false);
  assert.equal(einheitWahl("funktionen", { jetzt: JETZT }).einheit.id, "begriff");
});

test("Werkzeug ohne Buchung je Einheit: wechselt täglich", () => {
  const a = einheitWahl("parabeln", { jetzt: JETZT });
  const b = einheitWahl("parabeln", { jetzt: JETZT + TAG });
  assert.notEqual(a.einheit.id, b.einheit.id);
  assert.equal(a.einheit.id, einheitWahl("parabeln", { jetzt: JETZT + 3 * 3600e3 }).einheit.id);
});

test("Stand: Quote der letzten zehn, Tage seit dem letzten Mal", () => {
  const s = standVon([e(3, false), e(1, true), e(0, true)], JETZT);
  assert.equal(s.n, 3);
  assert.equal(s.heute, 1);
  assert.equal(s.tageHer, 0);
  assert.equal(Math.round(s.quote * 100), 67);
  assert.equal(wannText(1), "gestern");
  assert.equal(wannText(3), "vor 3 Tagen");
  assert.equal(tagNr(JETZT) - tagNr(JETZT - TAG), 1);
});

test("Fehler: wiederkehrend vor einzeln vor Vorsorge", () => {
  const leer = { beobachtungen: [], ausgeblendet: [] };
  const v = fehlerFokus(leer, "analysis");
  assert.equal(v.id, "kettenregel");
  assert.equal(v.grund, "vorsorge");
  const b = (typ, tage) => ({ typ, zeit: JETZT - tage * TAG });
  const T = { beobachtungen: [b("vorzeichen", 1), b("potenzregel", 1), b("potenzregel", 2), b("potenzregel", 3)], ausgeblendet: [] };
  const f = fehlerFokus(T, "analysis");
  assert.equal(f.id, "potenzregel");
  assert.equal(f.grund, "fehler");
  assert.deepEqual(f.weitere, ["Vorzeichen"]);
  assert.equal(f.einheit.aufgaben, 6);
});

test("Tagessumme", () => {
  const s = tagesSumme([{ einheit: { min: 6, aufgaben: 6 }, erledigt: true }, { einheit: { min: 8, aufgaben: 4 }, erledigt: false }]);
  assert.deepEqual(s, { min: 14, aufgaben: 10, erledigt: 1, anzahl: 2 });
});
