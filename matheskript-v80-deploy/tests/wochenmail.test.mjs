import test from "node:test";
import assert from "node:assert/strict";
import { berlinHeute, betreff, einordnung, wochenWerte, wochenmail } from "../src/wochenmail.js";

const heute = new Date(Date.UTC(2026, 9, 18));   // Sonntag, 18.10.2026
const tag = (minus) => { const d = new Date(Date.UTC(2026, 9, 18 - minus)); return d.toISOString().slice(0, 10); };

test("Wochenwerte: 7 Tage bis heute, Vorwoche getrennt, richtig nie größer als Aufgaben", () => {
  const tage = { [tag(0)]: { s: 600, a: 10, r: 8 }, [tag(3)]: { s: 1200, a: 20, r: 25 }, [tag(6)]: { s: 30, a: 0, r: 0 }, [tag(7)]: { s: 900, a: 5, r: 5 }, [tag(14)]: { s: 9999, a: 99, r: 99 } };
  const w = wochenWerte(tage, heute);
  assert.equal(w.jetzt.tage, 2);                 // 30 Sekunden ohne Aufgabe zählen nicht als Übungstag
  assert.equal(w.jetzt.minuten, 31);             // (600 + 1200 + 30) / 60 = 30,5 → 31
  assert.equal(w.jetzt.aufgaben, 30);
  assert.equal(w.jetzt.richtig, 28);             // 8 + min(25, 20)
  assert.equal(w.jetzt.quote, 93);
  assert.deepEqual([w.vorher.tage, w.vorher.minuten, w.vorher.aufgaben], [1, 15, 5]);
});

test("Quote erst ab fünf Aufgaben, leere Woche", () => {
  const w = wochenWerte({ [tag(1)]: { s: 120, a: 3, r: 3 } }, heute);
  assert.equal(w.jetzt.quote, null);
  assert.match(einordnung(wochenWerte({}, heute)), /ruhig/);
});

test("Berlin-Datum: 23:30 UTC am Samstag ist in Berlin schon Sonntag", () => {
  const h = berlinHeute(new Date(Date.UTC(2026, 9, 17, 23, 30)));
  assert.equal(h.toISOString().slice(0, 10), "2026-10-18");
});

test("Mail: Betreff, Vorname, Abmeldelink, HTML maskiert", () => {
  const kind = { name: "Lena <b>Muster</b>", tage: { [tag(0)]: { s: 600, a: 6, r: 6 }, [tag(2)]: { s: 600, a: 6, r: 3 } } };
  const m = wochenmail({ eltern: { name: "Petra Muster" }, kinder: [kind], abmeldeUrl: "https://x.de/api/wochenmail-abmelden?t=abc", heute });
  assert.equal(m.betreff, "Lena: 2 von 7 Tagen geübt – Ihr Wochenbericht");
  assert.ok(m.html.includes("Hallo Petra"));
  assert.ok(m.html.includes("wochenmail-abmelden?t=abc"));
  assert.ok(!m.html.includes("<b>Muster"));
  assert.ok(m.text.includes("Lena: 2/7 Tage, 20 min, 12 Aufgaben (75 % richtig)"));
  assert.equal(betreff([{ name: "Lena" }, { name: "Paul X" }], heute), "Wochenbericht für Lena und Paul");
});
