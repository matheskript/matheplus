import test from "node:test";
import assert from "node:assert/strict";
import { zahlenAusSprache, zahlwort, sprachUnterstuetzt } from "../src/sprache.js";

const z = zahlenAusSprache;

test("Zahlwörter, auch zusammengesetzt", () => {
  assert.equal(zahlwort("drei"), 3);
  assert.equal(zahlwort("null"), 0);
  assert.equal(zahlwort("dreiundzwanzig"), 23);
  assert.equal(zahlwort("einundvierzig"), 41);
  assert.equal(zahlwort("hundert"), 100);
  assert.equal(zahlwort("hundertfünf"), 105);
  assert.equal(zahlwort("zweihundertdreißig"), 230);
  assert.equal(zahlwort("tausend"), 1000);
  assert.equal(zahlwort("auto"), null);
});

test("Vektor: drei Zahlen in Ziffern, Wörtern und mit Trennzeichen", () => {
  assert.deepEqual(z("3 2 -1"), ["3", "2", "-1"]);
  assert.deepEqual(z("3 2 - 1"), ["3", "2", "-1"]);
  assert.deepEqual(z("3, 2, −1"), ["3", "2", "-1"]);
  assert.deepEqual(z("3 | 2 | -1"), ["3", "2", "-1"]);
  assert.deepEqual(z("drei zwei minus eins"), ["3", "2", "-1"]);
  assert.deepEqual(z("Drei, zwei, minus eins."), ["3", "2", "-1"]);
  assert.deepEqual(z("der Normalenvektor ist 3 2 minus 1"), ["3", "2", "-1"]);
  assert.deepEqual(z("minus 4 und 0 und 7"), ["-4", "0", "7"]);
  assert.deepEqual(z("1 -4 -8"), ["1", "-4", "-8"]);
  assert.deepEqual(z("minus eins minus vier minus acht"), ["-1", "-4", "-8"]);
  assert.deepEqual(z("Punkt A 2 3 5"), ["2", "3", "5"]);
  assert.deepEqual(z("x1 gleich 2, x2 gleich 3, x3 gleich 5"), ["2", "3", "5"]);
});

test("Dezimalzahlen und Brüche", () => {
  assert.deepEqual(z("3,5"), ["3,5"]);
  assert.deepEqual(z("3.5"), ["3,5"]);
  assert.deepEqual(z("minus drei Komma fünf"), ["-3,5"]);
  assert.deepEqual(z("drei Komma vierzehn"), ["3,14"]);
  assert.deepEqual(z("2 Komma 5 und 1 Komma 25"), ["2,5", "1,25"]);
  assert.deepEqual(z("zwei Drittel"), ["2/3"]);
  assert.deepEqual(z("ein halb"), ["1/2"]);
  assert.deepEqual(z("minus ein Viertel"), ["-1/4"]);
  assert.deepEqual(z("drei Viertel, ein halb, 2"), ["3/4", "1/2", "2"]);
  assert.deepEqual(z("3 durch 4"), ["3/4"]);
  assert.deepEqual(z("3/4"), ["3/4"]);
  assert.deepEqual(z("minus 7 geteilt durch 2"), ["-7/2"]);
  assert.deepEqual(z("ein Halbes"), ["1/2"]);
});

test("Einzelne Werte und Rauschen", () => {
  assert.deepEqual(z("minus 3"), ["-3"]);
  assert.deepEqual(z("−3"), ["-3"]);
  assert.deepEqual(z("der Abstand ist 9"), ["9"]);
  assert.deepEqual(z("ähm also 12"), ["12"]);
  assert.deepEqual(z("plus 4"), ["4"]);
  assert.deepEqual(z("null"), ["0"]);
  assert.deepEqual(z("minus null"), ["0"]);
  assert.deepEqual(z(""), []);
  assert.deepEqual(z("hallo welt"), []);
  assert.deepEqual(z("d gleich 12"), ["12"]);
});

test("sprachUnterstuetzt prüft die Browser-API", () => {
  assert.equal(sprachUnterstuetzt(null), false);
  assert.equal(sprachUnterstuetzt({}), false);
  assert.equal(sprachUnterstuetzt({ webkitSpeechRecognition: function () {} }), true);
  assert.equal(sprachUnterstuetzt({ SpeechRecognition: function () {} }), true);
});

/* ---------- Situative Erkennung (zahlenImKontext): was ist in DIESER Lage gemeint? ---------- */
import { zahlenImKontext, lesarten } from "../src/sprache.js";
const k = (v, felder, modi) => zahlenImKontext(v, { felder, modi }).werte;

test("Vektor mit drei Feldern: zusammengeschriebene Ziffern werden getrennt („eins, eins, zwei“ → „112“)", () => {
  assert.deepEqual(k("112", 3), ["1", "1", "2"]);
  assert.deepEqual(k("-112", 3), ["-1", "1", "2"]);
  assert.deepEqual(k("Der Vektor ist 1 12", 3), ["1", "1", "2"]);
  assert.deepEqual(k("1,5 2", 3), ["1", "5", "2"]);           // „eins, fünf, zwei“ → kein Dezimalkomma
  assert.deepEqual(k("1.5 2", 3), ["1", "5", "2"]);
});

test("Minus ist nie Subtraktion, sondern das Vorzeichen der nächsten Komponente", () => {
  assert.deepEqual(z("1-2-3"), ["1", "-2", "-3"]);
  assert.deepEqual(k("1-2-3", 3), ["1", "-2", "-3"]);
  assert.deepEqual(k("1 - 2 - 3", 3), ["1", "-2", "-3"]);
  assert.deepEqual(k("eins minus zwei minus drei", 3), ["1", "-2", "-3"]);
  assert.deepEqual(k("1, minus 2, minus 3", 3), ["1", "-2", "-3"]);
});

test("Was schon passt, bleibt: echte mehrstellige Zahlen, ein Feld, Zahlwörter, Dezimal im Dezimalfeld", () => {
  assert.deepEqual(k("12 3 4", 3), ["12", "3", "4"]);
  assert.deepEqual(k("112", 1), ["112"]);
  assert.deepEqual(k("hundertzwölf", 3), ["112"]);           // in Worten gesagt → nicht trennen
  assert.deepEqual(k("eins Komma fünf zwei", 3), ["1,5", "2"]);
  assert.deepEqual(k("3,5", 1), ["3,5"]);
  assert.deepEqual(k("4 0 7", 3), ["4", "0", "7"]);
  assert.deepEqual(k("2 3", 3), ["2", "3"]);                  // nur zwei gesagt → zwei Felder
});

test("Mehrere Vorschläge des Browsers: der passende gewinnt", () => {
  const r = zahlenImKontext(["112", "1 1 2"], { felder: 3 });
  assert.deepEqual(r.werte, ["1", "1", "2"]);
  assert.equal(r.text, "1 1 2");                               // passt ohne Trennen → besser als „112“ getrennt
  assert.deepEqual(k(["1 12", "11 2", "1 1 2"], 3), ["1", "1", "2"]);
  assert.deepEqual(k(["hundertzwölf", "112"], 1), ["112"]);
});

test("Ganzzahl-Felder: eine Lesart mit Komma verliert gegen die getrennte", () => {
  assert.deepEqual(k("2,5", 2, ["ganzvz", "ganzvz"]), ["2", "5"]);
  assert.deepEqual(k("2,5", 1, ["zahl"]), ["2,5"]);
});

test("Lesarten: jede Teilmenge trennbarer Zahlen", () => {
  assert.equal(lesarten(["12", "34"]).length, 4);
  assert.deepEqual(lesarten(["-12"])[1].werte, ["-1", "2"]);
});
