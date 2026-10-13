import test from "node:test";
import assert from "node:assert/strict";
import { normiereEbb, leereEbb, bucheErgebnis, tagesplanSichern, tagesStand, arbeitNeu, arbeitLoeschen, kommendeArbeiten, arbeitsPlanung, wochenDaten, addTage, datumVon } from "../src/ebbinghaus.js";
import { mergeLernstand } from "../src/lernMerge.js";

const TZ = "Europe/Berlin";
const T0 = Date.parse("2026-10-13T10:00:00Z");
const tag = (n) => T0 + n * 86400000;
const ok = (E, id, t, nr) => bucheErgebnis(E, [id], { ergebnis: "sicher", exercise_id: `${id}-${nr}` }, t, TZ);
const heute = datumVon(T0, TZ);

test("Arbeit eintragen, laden, löschen; ungültige Daten werden bereinigt", () => {
  const E = normiereEbb(leereEbb());
  const a = arbeitNeu(E, { art: "Test", datum: addTage(heute, 10), themen: ["ableiten", "gibtsnicht", "ableiten"], notiz: "x".repeat(200) }, T0);
  assert.deepEqual(a.themen, ["ableiten"]);
  assert.equal(a.notiz.length, 80);
  assert.equal(arbeitNeu(E, { datum: "kaputt" }, T0), null);
  assert.equal(kommendeArbeiten(E, { jetzt: T0, tz: TZ }).length, 1);
  assert.equal(kommendeArbeiten(E, { jetzt: T0, tz: TZ })[0].tage, 10);
  arbeitLoeschen(E, a.id, T0 + 1);
  assert.equal(kommendeArbeiten(E, { jetzt: T0, tz: TZ }).length, 0);
  assert.equal(normiereEbb(JSON.parse(JSON.stringify(E))).arbeiten.length, 1);       // Markierung bleibt
  assert.equal(kommendeArbeiten(E, { jetzt: tag(11), tz: TZ }).length, 0);
});

test("Tagesplan reagiert sofort: neue Schritte im Prüfungsthema, auch wenn der Plan schon existiert", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "gleichungen-umformen", T0 - 5 * 86400000, 1);
  tagesplanSichern(E, null, { jetzt: T0, tz: TZ });
  const vorher = E.tage[heute].items.map((i) => i.skill_id);
  arbeitNeu(E, { datum: addTage(heute, 12), themen: ["integrale"] }, T0);
  const p = tagesplanSichern(E, null, { jetzt: T0 + 60000, tz: TZ });
  const neu = p.items.filter((i) => i.arbeit);
  assert.ok(neu.length >= 1 && neu.length <= 3);
  assert.deepEqual(p.items.slice(0, vorher.length).map((i) => i.skill_id), vorher);
  // Integrale braucht potenzregel (Grundlage), die nicht begonnen ist -> zuerst diese
  assert.ok(neu.some((i) => i.skill_id === "potenzregel"));
  assert.ok(!neu.some((i) => i.skill_id === "flaeche-nullstellen"));       // Voraussetzungen fehlen noch
  assert.ok(p.items.length <= 8);
  assert.ok(neu[0].grund.includes("Klassenarbeit"));
});

test("Plan zieht Auffrischungen vor, wenn die Arbeit näher rückt", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "potenzregel", T0 - 20 * 86400000, 1);                   // lange her, Termin weit weg → heute fällig
  ok(E, "potenzregel", T0 - 4 * 86400000, 2);
  ok(E, "kettenregel", T0 - 4 * 86400000, 3);
  const Es = JSON.parse(JSON.stringify(E));
  arbeitNeu(Es, { datum: addTage(heute, 5), themen: ["ableiten"] }, T0);
  const p = tagesplanSichern(Es, null, { jetzt: T0, tz: TZ });
  const art = Object.fromEntries(p.items.map((i) => [i.skill_id, i.art]));
  assert.ok(Object.values(art).includes("pruefung") || Object.values(art).includes("wiederholung"));
  const ohne = tagesplanSichern(JSON.parse(JSON.stringify(E)), null, { jetzt: T0, tz: TZ });
  assert.ok(p.items.length >= ohne.items.length);
});

test("arbeitsPlanung: Zähler und Zeitnot", () => {
  const E = normiereEbb(leereEbb());
  ok(E, "potenzregel", T0, 1);
  const a = arbeitNeu(E, { datum: addTage(heute, 2), themen: ["kurven", "vektoren", "integrale"] }, T0);
  const p = arbeitsPlanung(E, a, { jetzt: T0, tz: TZ });
  assert.equal(p.anzahl, 7);
  assert.equal(p.neu, 7);
  assert.equal(p.knapp, true);
  const b = arbeitNeu(E, { datum: addTage(heute, 30), themen: ["ableiten"] }, T0);
  assert.equal(arbeitsPlanung(E, b, { jetzt: T0, tz: TZ }).knapp, false);
});

test("Merge: Arbeiten werden vereinigt, Löschen setzt sich durch, Reihenfolge egal", () => {
  const E1 = normiereEbb(leereEbb()), E2 = normiereEbb(leereEbb());
  const a = arbeitNeu(E1, { datum: addTage(heute, 9), themen: ["ableiten"] }, T0);
  const b = arbeitNeu(E2, { datum: addTage(heute, 3), themen: ["terme"] }, T0 + 5);
  E2.arbeiten = normiereArb(E2.arbeiten.concat([{ ...a }]));
  arbeitLoeschen(E2, a.id, T0 + 9999);
  const s1 = { _zeit: 1, training: { ebbinghaus: E1 } }, s2 = { _zeit: 2, training: { ebbinghaus: E2 } };
  const m = mergeLernstand(s1, s2), m2 = mergeLernstand(s2, s1);
  assert.deepEqual(m.training.ebbinghaus.arbeiten, m2.training.ebbinghaus.arbeiten);
  const alle = m.training.ebbinghaus.arbeiten;
  assert.equal(alle.length, 2);
  assert.equal(alle.find((x) => x.id === a.id).geloescht, true);
  assert.equal(alle.find((x) => x.id === b.id).geloescht, false);
});
function normiereArb(l) { return l; }

test("Wochenkalender: Montag bis Sonntag, Rückblick, Vorschau, Arbeiten", () => {
  const E = normiereEbb(leereEbb());                         // 13.10.2026 ist ein Dienstag
  ok(E, "potenzregel", T0 - 86400000, 0);
  ok(E, "potenzregel", T0, 1);
  arbeitNeu(E, { art: "Klausur", datum: addTage(heute, 4), themen: ["ableiten"] }, T0);
  tagesplanSichern(E, null, { jetzt: T0, tz: TZ });
  const w = wochenDaten(E, { jetzt: T0, tz: TZ });
  assert.equal(w.start, "2026-10-12");
  assert.equal(w.ende, "2026-10-18");
  assert.equal(w.tage.length, 7);
  assert.equal(w.tage[0].zeit, "vergangen");
  assert.equal(w.tage[1].zeit, "heute");
  assert.equal(w.tage[1].geuebt.length, 1);
  assert.equal(w.tage[0].geuebt.length, 1);
  assert.ok(w.tage[1].plan && w.tage[1].plan.gesamt >= 1);
  assert.equal(w.tage[5].arbeiten.length, 1);                // Samstag 17.10.
  assert.equal(w.tage[5].arbeiten[0].art, "Klausur");
  const n = wochenDaten(E, { jetzt: T0, tz: TZ, woche: 1 });
  assert.equal(n.start, "2026-10-19");
  assert.ok(n.tage.every((t) => t.zeit === "zukunft"));
  assert.equal(w.tage[3].faellig.length, 1);                 // Do 15.10.: potenzregel kommt wieder
  assert.equal(n.tage.reduce((x, t) => x + t.faellig.length, 0), 0);
  const v = wochenDaten(E, { jetzt: T0, tz: TZ, woche: -1 });
  assert.ok(v.tage.every((t) => t.zeit === "vergangen"));
});
