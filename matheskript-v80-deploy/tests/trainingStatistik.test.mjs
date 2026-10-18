import { test } from "node:test";
import assert from "node:assert/strict";
import { trainingStatistik, bereichVon, tagKey, dauerKurz, dauerKachel } from "../src/trainingStatistik.js";

const JETZT = new Date(2026, 9, 15, 18, 0, 0).getTime();   // Do, 15.10.2026
const tag = (offset, h = 16, m = 0) => { const d = new Date(JETZT); d.setDate(d.getDate() + offset); d.setHours(h, m, 0, 0); return d.getTime(); };

test("leer", () => {
  const s = trainingStatistik({ jetzt: JETZT });
  assert.equal(s.leer, true);
  assert.equal(s.gesamt.aufgaben, 0);
  assert.equal(s.raster.length, 12);
  assert.equal(s.serie, 0);
});

test("Protokoll und Tageswerte werden nicht doppelt gezählt", () => {
  const protokoll = [
    { zeit: tag(0, 16, 0), bereich: "plotter", richtig: true },
    { zeit: tag(0, 16, 1), bereich: "plotter", richtig: false, fehlerart: "vorzeichen" },
    { zeit: tag(0, 16, 2), bereich: "plotter", richtig: true },
  ];
  const aktivitaet = { [tagKey(JETZT)]: { sekunden: 600, aufgaben: 3, richtig: 2, hilfe: 0, fehler: { vorzeichen: 1 } } };
  const s = trainingStatistik({ protokoll, aktivitaet, jetzt: JETZT, fehlerNamen: { vorzeichen: "Vorzeichenfehler" } });
  assert.equal(s.gesamt.aufgaben, 3);
  assert.equal(s.gesamt.richtig, 2);
  assert.equal(s.gesamt.quote, 67);
  assert.equal(s.gesamt.sekunden, 600);
  assert.deepEqual(s.fehler, [{ art: "vorzeichen", name: "Vorzeichenfehler", anzahl: 1 }]);
  assert.equal(s.themen[0].name, "Kurvendiskussion");
});

test("ältere Tage nur aus Tageswerten (Protokoll gekürzt)", () => {
  const aktivitaet = { [tagKey(tag(-40))]: { sekunden: 1200, aufgaben: 20, richtig: 15 } };
  const s = trainingStatistik({ protokoll: [{ zeit: tag(0), bereich: "lgs", richtig: true }], aktivitaet, jetzt: JETZT });
  assert.equal(s.gesamt.aufgaben, 21);
  assert.equal(s.letzte30.aufgaben, 1);
  assert.equal(s.gesamt.aktiveTage, 2);
});

test("Serie: heute ohne Aufgabe unterbricht nicht", () => {
  const protokoll = [-1, -2, -3, -5].map((o) => ({ zeit: tag(o), bereich: "lgs", richtig: true }));
  assert.equal(trainingStatistik({ protokoll, jetzt: JETZT }).serie, 3);
  const mitHeute = [...protokoll, { zeit: tag(0, 9), bereich: "lgs", richtig: true }];
  assert.equal(trainingStatistik({ protokoll: mitHeute, jetzt: JETZT }).serie, 4);
});

test("Raster: letzte Spalte ist die aktuelle Woche, Zukunft markiert", () => {
  const s = trainingStatistik({ protokoll: [{ zeit: tag(0), bereich: "lgs", richtig: true }], jetzt: JETZT });
  const w = s.raster[11];
  assert.equal(new Date(w.start).getDay(), 1);                // Montag
  const heute = w.tage.find((t) => t.heute);
  assert.equal(heute.aufgaben, 1);
  assert.equal(w.tage.filter((t) => t.zukunft).length, 3);    // Fr, Sa, So
  assert.equal(s.raster.reduce((n, x) => n + x.aufgaben, 0), 1);
});

test("Woche vs. Vorwoche", () => {
  const protokoll = [
    ...Array.from({ length: 5 }, (_, i) => ({ zeit: tag(-2, 10, i), bereich: "lgs", richtig: i < 4 })),
    ...Array.from({ length: 4 }, (_, i) => ({ zeit: tag(-9, 10, i), bereich: "lgs", richtig: i < 2 })),
  ];
  const s = trainingStatistik({ protokoll, jetzt: JETZT });
  assert.equal(s.letzte7.aufgaben, 5); assert.equal(s.letzte7.quote, 80);
  assert.equal(s.vorige7.aufgaben, 4); assert.equal(s.vorige7.quote, 50);
});

test("Sitzungen: Bereichswechsel und lange Pause trennen", () => {
  const protokoll = [
    { zeit: tag(0, 10, 0), bereich: "lgs", richtig: true },
    { zeit: tag(0, 10, 5), bereich: "lgs", richtig: false },
    { zeit: tag(0, 10, 6), bereich: "terme", richtig: true },
    { zeit: tag(0, 12, 0), bereich: "terme", richtig: true },
  ];
  const s = trainingStatistik({ protokoll, jetzt: JETZT });
  assert.equal(s.sitzungen.length, 3);
  assert.equal(s.sitzungen[2].aufgaben, 2);    // älteste zuletzt
  assert.equal(s.sitzungen[2].quote, 50);
});

test("Stärke und Baustelle erst ab 5 Aufgaben je Bereich", () => {
  const p = [];
  for (let i = 0; i < 6; i++) p.push({ zeit: tag(-1, 10, i), bereich: "lgs", richtig: true });
  for (let i = 0; i < 6; i++) p.push({ zeit: tag(-1, 11, i), bereich: "terme", richtig: i < 2 });
  for (let i = 0; i < 3; i++) p.push({ zeit: tag(-1, 12, i), bereich: "sinus", richtig: false });
  const s = trainingStatistik({ protokoll: p, jetzt: JETZT });
  assert.equal(s.staerke.id, "lgs");
  assert.equal(s.baustelle.id, "terme");
});

test("Bereichsnamen", () => {
  assert.equal(bereichVon({ gruppe: "Head & Numbers · Einmaleins" }).name, "Kopfrechnen");
  assert.equal(bereichVon({ bereich: "abikette" }).name, "Abi-Ketten");
  assert.equal(bereichVon({ bereich: "advplotter" }).name, "Kurvendiskussion");
  assert.equal(bereichVon({ gruppe: "Teilbarkeit · durch 7" }).id, "teiler");
  assert.equal(bereichVon({}).name, "Sonstiges");
});

test("Ungültige Einträge werden ignoriert", () => {
  const s = trainingStatistik({ protokoll: [null, { zeit: "x", richtig: true }, { zeit: tag(0) }, { zeit: tag(0), richtig: true }], jetzt: JETZT });
  assert.equal(s.gesamt.aufgaben, 1);
});

test("Dauer", () => {
  assert.equal(dauerKurz(0), "0 Min.");
  assert.equal(dauerKurz(1500), "25 Min.");
  assert.equal(dauerKurz(3600), "1 Std.");
  assert.equal(dauerKurz(5400), "1 Std. 30 Min.");
});

test("Dauer Kachel", () => {
  assert.equal(dauerKachel(1500), "25 Min.");
  assert.equal(dauerKachel(5400), "1,5 Std.");
  assert.equal(dauerKachel(39720), "11 Std.");
});
