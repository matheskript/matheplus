/* Tests für „Mein Mathe-Training“ (reine Logik). Ausführen: node --test tests/*.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BUDGET, MAX_AKTIV, MAX_DANACH, NEUSTART_AB, TYPEN, budgetSetzen, eintragErledigt, engeSkills, fehlerKarte, leerMT, mathildaRueckkehr, nachholenAuffuellen, normiereMT,
  tagInfo, tagesStand, tagesplanBauen, tagesplanSichern, testThemen, themaAbschliessen, themaEntfernen, themaHinzufuegen, themaInfo, themaSkills, themaStand, themaVorziehen, vorschlaege, standUebersicht,
} from "../src/meinTraining.js";
import { VIDEO_ZU_THEMA, videoFuerThema } from "../src/trainingVideos.js";
import { bucheErgebnis, datumVon, leereEbb, normiereEbb, addTage, PLAENE } from "../src/ebbinghaus.js";
import { FEHLERTYPEN, THEMEN, leereDaten } from "../src/trainingDaten.js";

const TZ = "Europe/Berlin";
const T0 = Date.UTC(2026, 9, 20, 10);   // 20.10.2026, 12:00 Berlin
const tag = (n) => T0 + n * 86400000;
const heute = (n = 0) => datumVon(tag(n), TZ);
let nr = 0;
const sicher = (E, id, t) => bucheErgebnis(E, [id], { ergebnis: "sicher", exercise_id: `x${++nr}` }, t, TZ);
const nicht = (E, id, t, typ) => bucheErgebnis(E, [id], { ergebnis: "nicht", exercise_id: `x${++nr}`, fehler_typ: typ }, t, TZ);
const mitFehlern = (typ, n = 3) => { const T = leereDaten(); for (let i = 0; i < n; i++) T.beobachtungen.push({ typ, zeit: tag(-i), thema: FEHLERTYPEN[typ].thema }); return T; };

test("Thema: Kapitel und Unterthema, Skills aus den Generatoren", () => {
  const k = themaInfo("quad");
  assert.equal(k.art, "kapitel"); assert.equal(k.teile.length, 6); assert.ok(k.gen.includes("gl-quadrat"));
  const u = themaInfo("quad.4");
  assert.equal(u.art, "unterthema"); assert.equal(u.titel, "pq- und abc-Formel"); assert.deepEqual(u.gen, ["gl-quadrat"]);
  assert.deepEqual(themaSkills("quad.4"), ["pq-formel"]);
  assert.ok(themaSkills("quad").includes("scheitelpunkt"));
  assert.equal(themaInfo("gibtsnicht"), null);
  assert.equal(themaInfo("quad.99"), null);
});

test("Themen verwalten: 3 aktiv, 3 danach, dann voll; gleiches Kapitel nur einmal; nachrücken", () => {
  const MT = leerMT();
  assert.deepEqual(themaHinzufuegen(MT, { id: "quad", schulart: "g9", klasse: "9" }, heute()), { ok: true, wo: "aktiv" });
  assert.equal(themaHinzufuegen(MT, { id: "quad.2" }, heute()).grund, "schon");
  themaHinzufuegen(MT, { id: "pythagoras" }, heute()); themaHinzufuegen(MT, { id: "potenzen" }, heute());
  assert.equal(themaHinzufuegen(MT, { id: "strahlen" }, heute()).wo, "danach");
  themaHinzufuegen(MT, { id: "trig" }, heute()); themaHinzufuegen(MT, { id: "lgs2" }, heute());
  assert.equal(themaHinzufuegen(MT, { id: "kreis" }, heute()).grund, "voll");
  assert.equal(MT.aktiv.length, MAX_AKTIV); assert.equal(MT.danach.length, MAX_DANACH);
  assert.ok(MT.aktiv[0].vorbereitung.length <= 3);
  assert.ok(themaAbschliessen(MT, "quad", heute()));
  assert.equal(MT.aktiv.length, 3); assert.equal(MT.aktiv[2].id, "strahlen"); assert.equal(MT.danach.length, 2);
  assert.equal(MT.fertig[0].id, "quad");
  assert.ok(themaVorziehen(MT, "lgs2", heute()));
  assert.equal(MT.aktiv[2].id, "lgs2"); assert.equal(MT.danach[0].id, "strahlen");
  assert.ok(themaEntfernen(MT, "lgs2", heute()));
  assert.equal(MT.aktiv.length, 3); assert.equal(MT.danach.length, 1);
  assert.ok(budgetSetzen(MT, "minuten", 20)); assert.ok(!budgetSetzen(MT, "minuten", 25));
  const N = normiereMT(JSON.parse(JSON.stringify({ ...MT, tage: { kaputt: 1, "2026-10-01": { eintraege: [{ typ: "kern", id: "a" }, { typ: "nix", id: "b" }] } }, nachholen: [{ typ: "kern", id: "x" }] })), heute());
  assert.equal(N.aktiv.length, 3); assert.equal(N.tage["2026-10-01"].eintraege.length, 1); assert.deepEqual(N.nachholen, []);
  assert.deepEqual(normiereMT(null).budget, { art: "eintraege", wert: 8 });
});

test("Tagesplan: Aufträge oben, Wiederholungen, Fehler, Kern je Thema, Blatt, Budget 8", () => {
  const MT = leerMT();
  themaHinzufuegen(MT, { id: "quad", schulart: "g9", klasse: "9" }, heute());
  MT.aktiv[0].vorbereitung = [];
  const E = normiereEbb(leereEbb());
  sicher(E, "potenzregel", tag(-1));                    // heute fällig
  const T = mitFehlern("vorzeichen");
  const fremd = [{ id: "a1", titel: "Seite 42, Nr. 3–5", zeile: "Bis Freitag", absender: "Basti", ziel: { ansicht: "gleichungen" } }];
  const p = tagesplanBauen(MT, E, T, { jetzt: T0, tz: TZ, fremd });
  const typen = p.eintraege.map((e) => e.typ);
  assert.equal(typen[0], "fremd");
  assert.ok(typen.indexOf("wiederholung") < typen.indexOf("fehler"));
  assert.ok(typen.indexOf("fehler") < typen.indexOf("kern"));
  assert.ok(typen.indexOf("kern") < typen.indexOf("blatt"));
  assert.ok(p.eintraege.length <= 8);
  assert.equal(p.fehlerKarte.typ, "vorzeichen");
  assert.equal(p.fehlerKarte.video.art, "platzhalter");
  const kern = p.eintraege.find((e) => e.typ === "kern");
  assert.equal(kern.teil, "quad.1"); assert.equal(kern.thema, "quad");
  assert.ok(p.eintraege.every((e) => TYPEN[e.typ]));
  /* Unterthema ohne Aufgaben: Werkzeug statt Aufgabenlauf */
  assert.equal(kern.anzahl, 0); assert.equal(kern.wz, "parabeln");
});

test("Budget in Minuten: der Plan hört auf, wenn die Zeit voll ist", () => {
  const MT = leerMT();
  budgetSetzen(MT, "minuten", 10);
  themaHinzufuegen(MT, { id: "quad.4" }, heute());
  themaHinzufuegen(MT, { id: "pythagoras.1" }, heute());
  MT.aktiv.forEach((t) => { t.vorbereitung = []; });
  const E = normiereEbb(leereEbb());
  const p = tagesplanBauen(MT, E, null, { jetzt: T0, tz: TZ });
  assert.ok(p.minuten <= 10, `Minuten ${p.minuten}`);
  assert.ok(p.eintraege.length >= 1);
});

test("Basis-Check kommt vor dem Kerntraining und wird nach Erledigung abgebaut", () => {
  const MT = leerMT();
  themaHinzufuegen(MT, { id: "quad", schulart: "g9", klasse: "9" }, heute());
  assert.ok(MT.aktiv[0].vorbereitung.length >= 1);
  const E = normiereEbb(leereEbb());
  const plan = tagesplanSichern(MT, E, null, { jetzt: T0, tz: TZ });
  const basis = plan.eintraege.find((e) => e.typ === "basis");
  assert.ok(basis); assert.equal(basis.kapitel, MT.aktiv[0].vorbereitung[0]); assert.ok(basis.gen.length);
  assert.ok(!plan.eintraege.some((e) => e.typ === "kern"));
  assert.ok(eintragErledigt(MT, basis, { jetzt: T0, tz: TZ, richtig: 3, n: 3 }));
  assert.ok(!MT.aktiv[0].vorbereitung.includes(basis.kapitel) || MT.aktiv[0].vorbereitung[0] !== basis.kapitel);
  const st = tagesStand(MT, E, { jetzt: T0, tz: TZ });
  assert.equal(st.erledigt, 1); assert.equal(st.eintraege.find((e) => e.id === basis.id).ergebnis, "sicher");
  assert.ok(!eintragErledigt(MT, basis, { jetzt: T0, tz: TZ }));   // nicht doppelt
  assert.ok(eintragErledigt(MT, basis, { jetzt: T0, tz: TZ, zurueck: true }));
  assert.equal(tagesStand(MT, E, { jetzt: T0, tz: TZ }).erledigt, 0);
});

test("Tagesplan ist stabil über den Tag und wird nur ergänzt (neue Aufträge, neu fällige Wiederholungen)", () => {
  const MT = leerMT();
  themaHinzufuegen(MT, { id: "quad.4" }, heute());
  MT.aktiv[0].vorbereitung = [];
  const E = normiereEbb(leereEbb());
  const p1 = JSON.parse(JSON.stringify(tagesplanSichern(MT, E, null, { jetzt: T0, tz: TZ })));
  const p2 = tagesplanSichern(MT, E, null, { jetzt: T0 + 3600000, tz: TZ });
  assert.deepEqual(p2.eintraege.map((e) => e.id), p1.eintraege.map((e) => e.id));
  const p3 = tagesplanSichern(MT, E, null, { jetzt: T0 + 7200000, tz: TZ, fremd: [{ id: "neu", titel: "Auftrag" }] });
  assert.equal(p3.eintraege[0].typ, "fremd"); assert.equal(p3.eintraege.length, p1.eintraege.length + 1);
  assert.equal(MT.letzterBesuch, heute());
});

test("Nachholen: verpasstes Kerntraining landet auf dem Stapel, höchstens die Hälfte des Tages, je Thema eins", () => {
  const MT = leerMT();
  themaHinzufuegen(MT, { id: "quad.4" }, heute(-3));
  themaHinzufuegen(MT, { id: "pythagoras.1" }, heute(-3));
  MT.aktiv.forEach((t) => { t.vorbereitung = []; });
  const E = normiereEbb(leereEbb());
  tagesplanSichern(MT, E, null, { jetzt: tag(-3), tz: TZ });    // Tag −3: Plan gebaut, nichts gemacht
  tagesplanSichern(MT, E, null, { jetzt: tag(-2), tz: TZ });    // Tag −2: wieder nichts
  const p = tagesplanSichern(MT, E, null, { jetzt: T0, tz: TZ }); // heute: ein Tag dazwischen verpasst
  assert.equal(p.verpasst, 1);
  const nh = p.eintraege.filter((e) => e.nachholenVon);
  assert.ok(nh.length >= 1 && nh.length <= 4, `nachgeholt ${nh.length}`);
  assert.equal(new Set(nh.map((e) => e.thema)).size, nh.length);      // je Thema höchstens eins
  /* Das Thema, das nachgeholt wird, bekommt heute kein zweites Kerntraining */
  for (const e of nh) assert.equal(p.eintraege.filter((x) => x.thema === e.thema && x.typ === "kern").length, 1);
  assert.ok(MT.nachholen.length >= 1);
  eintragErledigt(MT, nh[0], { jetzt: T0, tz: TZ, richtig: 5, n: 5 });
  assert.ok(!MT.nachholen.some((x) => x.thema === nh[0].thema && x.typ === "kern"));
  const st = tagesStand(MT, E, { jetzt: T0, tz: TZ });
  assert.equal(st.nachgeholt, nh.length);
  assert.equal(tagInfo(MT, heute(-3)).verpasst, true);
  assert.equal(tagInfo(MT, heute()).nachgeholt, 1);
});

test("Neustart-Check ab 7 verpassten Tagen: ein Check je Thema, Stapel wird verworfen", () => {
  const MT = leerMT();
  themaHinzufuegen(MT, { id: "quad.4" }, heute(-10));
  MT.aktiv[0].vorbereitung = ["binom"];
  const E = normiereEbb(leereEbb());
  tagesplanSichern(MT, E, null, { jetzt: tag(-NEUSTART_AB - 1), tz: TZ });
  const p = tagesplanSichern(MT, E, null, { jetzt: T0, tz: TZ });
  assert.equal(p.neustart, true); assert.equal(p.verpasst, NEUSTART_AB);
  const check = p.eintraege.find((e) => e.typ === "check");
  assert.ok(check); assert.equal(check.thema, "quad.4"); assert.equal(check.anzahl, 5);
  assert.ok(!p.eintraege.some((e) => e.typ === "kern" || e.typ === "basis"));
  assert.deepEqual(MT.nachholen, []);
  eintragErledigt(MT, check, { jetzt: T0, tz: TZ, richtig: 4, n: 5 });
  assert.deepEqual(MT.aktiv[0].vorbereitung, []);
  assert.match(mathildaRueckkehr({ verpasst: 8, neustart: true }), /Pause/);
  assert.match(mathildaRueckkehr({ verpasst: 2, nachgeholt: 1 }), /nachholen/);
  assert.match(mathildaRueckkehr({ fertig: true }), /geschafft/);
});

test("Wiederkehrender Fehler: enger Rhythmus für die betroffenen Skills, Fehler-Karte mit Video", () => {
  const E = normiereEbb(leereEbb());
  sicher(E, "kettenregel", tag(-5));
  const T = mitFehlern("kettenregel");
  const eng = engeSkills(E, T);
  assert.ok(eng.includes("kettenregel"));
  const MT = leerMT();
  tagesplanSichern(MT, E, T, { jetzt: T0, tz: TZ });
  assert.equal(E.skills.kettenregel.rhythmus, "eng");
  assert.deepEqual(PLAENE.eng.tage, [0, 1, 2, 4, 8, 16, 30]);
  const k = fehlerKarte({ id: "kettenregel", n: 3, tage: 2 });
  assert.equal(k.video.art, "lektion"); assert.equal(k.video.kurs, "analysis4");
  /* drei Fehlschläge an zwei Tagen zählen auch ohne Beobachtungen */
  const F = normiereEbb(leereEbb());
  sicher(F, "pq-formel", tag(-6)); nicht(F, "pq-formel", tag(-5)); nicht(F, "pq-formel", tag(-4)); nicht(F, "pq-formel", tag(-4));
  assert.ok(engeSkills(F, null).includes("pq-formel"));
});

test("Videos: jede Lektion gibt es in base5.jsx, Platzhalter zeigen auf Michael Penn", () => {
  const src = readFileSync(new URL("../src/base5.jsx", import.meta.url), "utf8");
  for (const [thema, v] of Object.entries(VIDEO_ZU_THEMA)) {
    assert.ok(THEMEN[thema], `Thema ${thema}`);
    if (v.kurs) {
      assert.ok(new RegExp(`^  ${v.kurs}: \\{`, "m").test(src), `Kurs ${v.kurs}`);
      assert.ok(src.includes(`id: "${v.lektion}"`), `Lektion ${v.lektion}`);
    } else assert.ok(v.platzhalter.length > 2);
  }
  for (const t of Object.keys(THEMEN)) assert.ok(VIDEO_ZU_THEMA[t], `Thema ${t} ohne Video`);
  assert.match(videoFuerThema("brueche").url, /MichaelPennMath/);
  assert.equal(videoFuerThema("ableiten").art, "lektion");
});

test("Themenstand und Vorschläge: Status, Stufe, nächstes Kapitel im Buch, Lücke", () => {
  const E = normiereEbb(leereEbb());
  const MT = leerMT();
  themaHinzufuegen(MT, { id: "quad.4", schulart: "g9", klasse: "9" }, heute());
  assert.equal(themaStand(E, "quad.4", { heute: heute() }).status, "neu");
  sicher(E, "pq-formel", tag(-1));
  const s1 = themaStand(E, "quad.4", { heute: heute() });
  assert.equal(s1.status, "arbeit"); assert.equal(s1.stufe.id, "wiedererkennen"); assert.ok(s1.prozent > 0);
  for (const n of [0, 1, 3, 7, 14, 30]) sicher(E, "pq-formel", tag(n));
  const s2 = themaStand(E, "pq-formel" && "quad.4", { heute: heute(30) });
  assert.equal(s2.status, "sicher"); assert.equal(s2.stufe.id, "anwenden"); assert.equal(s2.prozent, 100);
  const v = vorschlaege(MT, E, { schulart: "g9", klasse: "9", heute: heute(30) });
  assert.ok(v.length >= 1);
  assert.equal(v[0].art, "buch"); assert.equal(v[0].id, "bruchterme");   // im G9-Buch der 9 folgt auf „quad“ das Kapitel „bruchterme“
  assert.match(v[0].mathilda, /sitzt/);
  nicht(E, "bruch-addieren", tag(31), "bruchaddition");
  const v2 = vorschlaege(MT, E, { schulart: "g9", klasse: "9", heute: heute(31), max: 5 });
  assert.ok(v2.some((x) => x.art === "luecke" && x.id === "bruchrechnen"));
  const leer = vorschlaege(leerMT(), normiereEbb(leereEbb()), { schulart: "g9", klasse: "8", heute: heute() });
  assert.equal(leer[0].art, "klasse"); assert.equal(leer[0].id, "linfkt");
  assert.equal(standUebersicht(MT, E, { jetzt: tag(31), tz: TZ }).gelernt, 1);
});

test("Testkonto-Themen bauen einen vollen Plan", () => {
  const MT = testThemen(heute());
  assert.equal(MT.aktiv.length, 3); assert.equal(MT.danach.length, 1);
  const E = normiereEbb(leereEbb());
  const p = tagesplanSichern(MT, E, null, { jetzt: T0, tz: TZ });
  assert.ok(p.eintraege.filter((e) => e.typ === "kern" || e.typ === "basis").length >= 3);
  assert.equal(p.verpasst, 1);
  assert.deepEqual(Object.keys(BUDGET), ["eintraege", "minuten"]);
});
