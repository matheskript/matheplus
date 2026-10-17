/* Grundlagen der Mittelstufe: neue Generatoren in trainingDaten.js.
   Jede Aufgabe wird 2000-mal erzeugt und die richtige Antwort unabhängig aus `daten` nachgerechnet.
   Außerdem: Antwort wird von pruefeAntwort akzeptiert, kein Fehlerwert trifft die richtige Antwort,
   Fehlertypen existieren, jede Aufgabe hat drei Hinweise, Lösung und Erklär-Kriterien. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { FEHLERTYPEN, GENERATOREN, THEMEN, neueAufgabe, pruefeAntwort } from "../src/trainingDaten.js";
import { skillsVonGenerator, validiereSkills } from "../src/ebbinghaus.js";

const rad = (g) => (g * Math.PI) / 180;
const NACH = {
  "pro-wert": ({ p, G }) => (G * p) / 100,
  "pro-grund": ({ G }) => G,
  "fkt-steigung": ({ x1, y1, x2, y2 }) => (y2 - y1) / (x2 - x1),
  "fkt-scheitel": ({ b, c }) => { const xs = -b / 2; return xs * xs + b * xs + c; },
  "pot-gesetz": ({ m, n, k }) => m + n - k,
  "pot-wurzel": ({ k }) => k,
  "pot-log": ({ a, b, k }) => Math.log((a * b ** k) / a) / Math.log(b),
  "geo-pythagoras": (d) => (d.b !== undefined ? Math.hypot(d.a, d.b) : Math.sqrt(d.c * d.c - d.a * d.a)),
  "geo-trig": ({ al, c, gegen }) => Math.round(c * (gegen ? Math.sin(rad(al)) : Math.cos(rad(al))) * 100) / 100,
  "wkt-pfad": ({ r, b }) => (r / (r + b)) * ((r - 1) / (r + b - 1)),
  "lgs-zwei": ({ x }) => x,
  "wac-faktor": ({ B, p, n }) => Math.round(B * (1 + p / 100) ** n),
};
const NEU = [...Object.keys(NACH), "sin-periode"];

test("neue Generatoren: registriert, Thema und Skill vorhanden", () => {
  for (const id of NEU) {
    const g = GENERATOREN.find((x) => x.id === id);
    assert.ok(g, id);
    assert.ok(THEMEN[g.thema], `${id}: Thema ${g.thema}`);
    assert.ok(skillsVonGenerator(id).length >= 1, `${id}: Skill`);
    for (const f of g.fuer) assert.ok(FEHLERTYPEN[f], `${id}: Fehlertyp ${f}`);
  }
  assert.deepEqual(validiereSkills(), []);
});

test("neue Generatoren: 2000 Läufe je Aufgabe, unabhängig nachgerechnet", () => {
  for (const id of NEU) {
    for (let i = 0; i < 2000; i++) {
      const a = neueAufgabe(id);
      assert.equal(a.hinweise.length, 3, id);
      assert.ok(a.loesung.length >= 1 && a.erklaer && a.erklaer.kriterien.length >= 1, id);
      for (const f of a.fehler) assert.ok(FEHLERTYPEN[f.typ], `${id}: ${f.typ}`);
      if (a.typ === "wahl") {
        assert.equal(new Set(a.optionen).size, a.optionen.length, `${id}: doppelte Optionen`);
        assert.ok(pruefeAntwort(a, a.richtig).ok);
        const { b } = a.daten;
        const soll = b === 2 ? "$π$" : b === 3 ? "$\\frac{2π}{3}$" : "$\\frac{π}{2}$";
        assert.equal(a.optionen[a.richtig], soll, `${id}: b = ${b}`);
        continue;
      }
      const soll = NACH[id](a.daten);
      assert.ok(Math.abs(soll - a.wert) < 1e-9, `${id}: ${a.wert} statt ${soll} (${JSON.stringify(a.daten)})`);
      assert.ok(pruefeAntwort(a, String(a.wert).replace(".", ",")).ok, `${id}: Antwort nicht akzeptiert`);
      for (const f of a.fehler) assert.ok(Math.abs(f.wert - a.wert) > a.toleranz, `${id}: Fehlerwert trifft die Lösung`);
    }
  }
});
