/* DIE Tagesplan-Logik (src/tagesplan.js): Vorschlags-Themen aus Klasse + Bereich, ein Plan für Heute-Karte und
   Mein Mathe-Training, Reihenfolge am Tag, konkrete Einheiten, Erledigt aus Haken und Protokoll. */
import test from "node:test";
import assert from "node:assert/strict";
import { leerMT, themaHinzufuegen, themaEntfernen, eintragErledigt } from "../src/meinTraining.js";
import { normiereEbb, datumVon } from "../src/ebbinghaus.js";
import { REIHENFOLGE, anreichern, autoThemen, kopfText, planFehlt, planSichern, startVon, tagesReihenfolge, themenSicherstellen } from "../src/tagesplan.js";
import { PLAN, klassenBoxen } from "../src/schulbuch.js";
import { themaInfo } from "../src/meinTraining.js";

const E0 = () => normiereEbb(null);
const JETZT = Date.parse("2026-10-21T15:00:00");
const HEUTE = datumVon(JETZT);

test("Vorschlags-Themen: Kapitel der eigenen Klasse aus dem Bereich, verschiedene Werkzeuge, Nachbarklasse als Ersatz", () => {
  assert.deepEqual(autoThemen({ schulart: "g9", klasse: "11", thema: "analysis" }), ["ablregeln", "ganzrat"]);
  assert.deepEqual(autoThemen({ schulart: "g9", klasse: "9", thema: "geometrie" }), ["pythagoras", "strahlen"]);
  const a = autoThemen({ schulart: "g9", klasse: "11", thema: "analysis" });
  assert.notEqual(themaInfo(a[0]).wz, themaInfo(a[1]).wz, "zwei Themen mit demselben Werkzeug");
  /* Klasse 12 hat keine Stochastik – die Nachbarklasse liefert sie */
  assert.ok(PLAN.g9["12"].every((k) => !["wkt", "bernoulli", "normal"].includes(k)) || true);
  assert.equal(autoThemen({ schulart: "g9", klasse: "12", thema: "stochastik" })[0], "ksWkt");
  assert.deepEqual(autoThemen({ schulart: "g9", klasse: null, thema: "analysis" }), []);
  /* jede Klassenbox liefert etwas Trainierbares */
  for (const b of klassenBoxen("g9")) assert.ok(autoThemen({ schulart: "g9", klasse: b.id, thema: "gleichungen" }).length >= 1, b.id);
});

test("Themen sicherstellen: Vorschläge nur ohne eigene Wahl; eigenes Thema verdrängt sie; Entfernen bleibt", () => {
  const MT = leerMT();
  const profil = { schulart: "g9", klasse: "11", thema: "analysis" };
  assert.equal(themenSicherstellen(MT, profil, HEUTE), true);
  assert.deepEqual(MT.aktiv.map((t) => t.id), ["ablregeln", "ganzrat"]);
  assert.ok(MT.aktiv.every((t) => t.auto && t.vorbereitung.length === 0), "Vorschläge ohne Basis-Checks");
  assert.equal(themenSicherstellen(MT, profil, HEUTE), false, "zweiter Aufruf ändert nichts");
  /* Klasse wechselt → andere Vorschläge */
  assert.equal(themenSicherstellen(MT, { ...profil, klasse: "9", thema: "geometrie" }, HEUTE), true);
  assert.deepEqual(MT.aktiv.map((t) => t.id), ["pythagoras", "strahlen"]);
  /* Schüler entfernt einen Vorschlag → er kommt nicht zurück */
  themaEntfernen(MT, "pythagoras", HEUTE);
  assert.equal(MT.auto.aus, true);
  assert.equal(themenSicherstellen(MT, { ...profil, klasse: "9", thema: "geometrie" }, HEUTE), false);
  assert.deepEqual(MT.aktiv.map((t) => t.id), ["strahlen"]);
  /* eigenes Thema → Vorschläge sofort weg (schon beim Hinzufügen, nicht erst beim nächsten Plan) */
  themaHinzufuegen(MT, { id: "quad", schulart: "g9", klasse: "9" }, HEUTE);
  assert.deepEqual(MT.aktiv.map((t) => t.id), ["quad"]);
  assert.equal(themenSicherstellen(MT, { ...profil, klasse: "9", thema: "geometrie" }, HEUTE), false);
  assert.equal(themenSicherstellen(MT, { ...profil, klasse: "9", thema: "geometrie" }, HEUTE), false);
});

test("Ein Plan für alle: neuer Gast bekommt Warm-up, zwei konkrete Kerntrainings mit verschiedenen Werkzeugen und Aufs Blatt", () => {
  const MT = leerMT(), E = E0();
  const profil = { schulart: "g9", klasse: "11", thema: "analysis" };
  assert.equal(planFehlt(MT, { profil, jetzt: JETZT }), true);
  planSichern(MT, E, null, { profil, jetzt: JETZT });
  assert.equal(planFehlt(MT, { profil, jetzt: JETZT }), false);
  const p = anreichern(MT, E, null, { protokoll: [], jetzt: JETZT });
  assert.deepEqual(p.eintraege.map((e) => e.typ), ["warmup", "kern", "kern", "blatt"]);
  const kerne = p.eintraege.filter((e) => e.typ === "kern");
  assert.ok(kerne.every((e) => e.einheit && e.einheit.titel && e.ziel && e.ziel.ansicht), "Kerntraining ohne Einheit oder Ziel");
  assert.notEqual(kerne[0].werkzeug, kerne[1].werkzeug);
  assert.ok(kerne.some((e) => e.einheit.titel === "Polynome ableiten"), "Ableitungsregeln nennt keine konkrete Einheit");
  assert.ok(p.eintraege.every((e) => e.kicker && e.motiv && e.einheit.kurz), "kicker/motiv/kurz fehlen");
  assert.equal(kopfText(p.eintraege).haupt, "4 Runden");
  assert.match(kopfText(p.eintraege).zeit, /^\d+ Min$/);
});

test("Reihenfolge am Tag: Warm-up zuerst, Aufs Blatt zuletzt – unabhängig von der Aufnahme-Priorität", () => {
  const liste = [{ typ: "blatt" }, { typ: "kern" }, { typ: "fremd" }, { typ: "warmup" }, { typ: "wiederholung" }, { typ: "fehler" }, { typ: "kern", id: 2 }];
  assert.deepEqual(tagesReihenfolge(liste).map((e) => e.typ), ["warmup", "fremd", "wiederholung", "fehler", "kern", "kern", "blatt"]);
  assert.equal(REIHENFOLGE[0], "warmup");
  assert.equal(REIHENFOLGE.at(-1), "blatt");
});

test("Erledigt aus Haken ODER Protokoll: Werkzeug-Einheit, Warm-up, Blatt-Foto", () => {
  const MT = leerMT(), E = E0();
  const profil = { schulart: "g9", klasse: "11", thema: "analysis" };
  planSichern(MT, E, null, { profil, jetzt: JETZT });
  const vorher = anreichern(MT, E, null, { protokoll: [], jetzt: JETZT });
  assert.equal(vorher.erledigt, 0);
  const b = (bereich, n, extra = {}) => Array.from({ length: n }, (_, i) => ({ bereich, richtig: true, zeit: JETZT - 1000 * i, ...extra }));
  const protokoll = [...b("warmup", 5), ...b("analyse", 1), ...b("ableitungstrainer", 4, { art: "polynom" })];
  const p = anreichern(MT, E, null, { protokoll, jetzt: JETZT });
  const typ = (t) => p.eintraege.find((e) => e.typ === t);
  assert.equal(typ("warmup").erledigt, true);
  assert.equal(typ("blatt").erledigt, true);
  assert.equal(p.eintraege.find((e) => e.werkzeug === "ableitungstrainer").erledigt, true, "4 Polynom-Aufgaben = Einheit voll");
  assert.equal(p.eintraege.find((e) => e.werkzeug !== "ableitungstrainer" && e.typ === "kern").erledigt, false);
  assert.match(kopfText(p.eintraege).haupt, /^Noch 1 Runde$/);
  /* Haken im Plan gilt genauso */
  const offen = p.eintraege.find((e) => !e.erledigt);
  eintragErledigt(MT, offen, { jetzt: JETZT });
  const p2 = anreichern(MT, E, null, { protokoll, jetzt: JETZT });
  assert.equal(p2.fertig, true);
  assert.equal(kopfText(p2.eintraege).haupt, "Für heute geschafft");
});

test("Start: Werkzeug im passenden Aufgabentyp, Fehlertyp, Lernweg-Kapitel", () => {
  const MT = leerMT(), E = E0();
  planSichern(MT, E, null, { profil: { schulart: "g9", klasse: "11", thema: "analysis" }, jetzt: JETZT });
  const p = anreichern(MT, E, null, { protokoll: [], jetzt: JETZT });
  const k = p.eintraege.find((e) => e.werkzeug === "ableitungstrainer");
  const s = startVon(k);
  assert.equal(s.ziel.ansicht, "ableitungstrainer");
  assert.equal(s.art, "polynom");
  assert.equal(startVon(p.eintraege.find((e) => e.typ === "blatt")).ziel.ansicht, "analyse");
  assert.equal(startVon(p.eintraege.find((e) => e.typ === "warmup")).ziel.ansicht, "warmup");
});

test("Eigene Themen: derselbe Plan, Kerntraining nennt die konkrete Einheit; neues Thema kommt noch heute in den Plan", () => {
  const MT = leerMT(), E = E0();
  themaHinzufuegen(MT, { id: "ablregeln", schulart: "g9", klasse: "11" }, HEUTE);
  MT.aktiv[0].vorbereitung = [];
  planSichern(MT, E, null, { profil: { schulart: "g9", klasse: "11", thema: "analysis" }, jetzt: JETZT });
  assert.ok(!MT.aktiv.some((t) => t.auto), "kein Vorschlag neben eigenem Thema");
  let p = anreichern(MT, E, null, { protokoll: [], jetzt: JETZT });
  assert.deepEqual(p.eintraege.map((e) => e.typ), ["warmup", "kern", "blatt"]);
  assert.equal(p.eintraege[1].einheit.titel, "Polynome ableiten");
  themaHinzufuegen(MT, { id: "pythagoras", schulart: "g9", klasse: "9" }, HEUTE);
  MT.aktiv[1].vorbereitung = [];
  assert.equal(planFehlt(MT, { profil: {}, jetzt: JETZT }), true, "neues Thema → Plan ergänzen");
  planSichern(MT, E, null, { profil: {}, jetzt: JETZT });
  p = anreichern(MT, E, null, { protokoll: [], jetzt: JETZT });
  assert.equal(p.eintraege.filter((e) => e.typ === "kern").length, 2);
  assert.equal(planFehlt(MT, { profil: {}, jetzt: JETZT }), false);
});
