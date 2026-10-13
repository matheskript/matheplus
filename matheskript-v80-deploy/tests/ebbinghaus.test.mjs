/* Tests für den Ebbinghaus-Wiederholungsplan (reine Logik). Ausführen: node --test tests/*.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import {
  ERHALT_TAGE, PLAENE, SKILLS, SKILL_IDS, addTage, bewerte, bucheErgebnis, bucheLauf, datumVon, heuteAuswahl, heuteErledigt, istFaellig, leereEbb,
  normiereEbb, skillFehlertypen, skillsVonGenerator, statusVon, tageZwischen, validiereSkills, voraussetzungen, waehleGenerator,
} from "../src/ebbinghaus.js";
import { GENERATOREN, neueAufgabe, normiere } from "../src/trainingDaten.js";

const TZ = "Europe/Berlin";
const T0 = Date.UTC(2026, 9, 13, 10);     // 13.10.2026, 12:00 Berlin
const tag = (n, h = 0) => T0 + n * 86400000 + h * 3600000;
let nr = 0;
const sicher = (E, id, jetzt, extra = {}) => bucheErgebnis(E, [id], { ergebnis: "sicher", exercise_id: `x${++nr}`, ...extra }, jetzt, TZ);
const teil = (E, id, jetzt) => bucheErgebnis(E, [id], { ergebnis: "teilweise", exercise_id: `x${++nr}`, hilfe: 1 }, jetzt, TZ);
const nicht = (E, id, jetzt, typ = null) => bucheErgebnis(E, [id], { ergebnis: "nicht", exercise_id: `x${++nr}`, fehler_typ: typ }, jetzt, TZ);

test("Definition: Skills, Generatoren und Voraussetzungen sind stimmig", () => {
  assert.deepEqual(validiereSkills(), []);
  assert.equal(SKILLS.length, 17);
  for (const g of GENERATOREN) assert.ok(skillsVonGenerator(g.id).length >= 1, `Generator ${g.id} ohne Skill`);
});
test("Zuordnung: Übung → Skills (Hauptskill zuerst, weitere Tags)", () => {
  assert.deepEqual(skillsVonGenerator("abl-kette"), ["kettenregel", "potenzregel"]);
  assert.deepEqual(skillsVonGenerator("abl-potenz"), ["potenzregel"]);
  assert.deepEqual(skillsVonGenerator("kur-wende"), ["wendepunkte", "potenzregel"]);
  assert.deepEqual(skillsVonGenerator("gibt-es-nicht"), []);
  assert.deepEqual(voraussetzungen("extrempunkte").sort(), ["gleichungen-umformen", "pq-formel", "potenzregel"].sort());
  assert.ok(skillFehlertypen("potenzregel").includes("potenzregel"));
});
test("Plan: Standard 0, 1, 3, 7, 14, 30, 60 – konfigurierbar", () => {
  assert.deepEqual(PLAENE.standard.tage, [0, 1, 3, 7, 14, 30, 60]);
  assert.equal(PLAENE.kompakt.tage.length, 7);
});
test("Datum: Kalendertage, Monats- und Jahreswechsel, Zeitumstellung", () => {
  assert.equal(addTage("2026-10-31", 1), "2026-11-01");
  assert.equal(addTage("2026-12-31", 1), "2027-01-01");
  assert.equal(addTage("2028-02-28", 1), "2028-02-29");
  assert.equal(addTage("2026-10-24", 2), "2026-10-26");   // Zeitumstellung 25.10.2026 ändert nichts
  assert.equal(tageZwischen("2026-10-24", "2026-10-26"), 2);
});

test("Erster Termin: erst das erste selbstständige Lösen legt Tag 1 fest", () => {
  const E = leereEbb();
  const a = sicher(E, "kettenregel", T0);
  assert.equal(a[0].lernphase, true);
  const S = E.skills.kettenregel;
  assert.equal(S.first_learned_at, new Date(T0).toISOString());
  assert.equal(S.next_review_at, "2026-10-14");     // Tag 1
  assert.equal(S.interval_days, 1);
  assert.equal(S.consecutive_successes, 1);
  assert.equal(S.mastery_status, "training");
  assert.deepEqual(S.source_exercise_ids.length, 1);
  assert.equal(S.review_history.length, 1);
});
test("Lernphase: mit Hilfe gelöst heißt noch nicht gelernt – morgen erneut", () => {
  const E = leereEbb();
  teil(E, "potenzregel", T0);
  const S = E.skills.potenzregel;
  assert.equal(S.first_learned_at, null);
  assert.equal(S.mastery_status, "neu");
  assert.equal(S.next_review_at, "2026-10-14");
  sicher(E, "potenzregel", tag(1));
  assert.ok(E.skills.potenzregel.first_learned_at);
  assert.equal(E.skills.potenzregel.next_review_at, "2026-10-15");
});
test("Intervall wächst bei sicherem Erfolg: Tag 1, 3, 7, 14, 30, 60, danach Erhaltung", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0);
  let jetzt = T0;
  const erwartet = [3, 7, 14, 30, 60]; // Tage ab Tag 0, an denen die nächste Wiederholung fällig wird
  jetzt = tag(1);
  for (const soll of erwartet) {
    sicher(E, "potenzregel", jetzt);
    const S = E.skills.potenzregel;
    assert.equal(S.next_review_at, datumVon(tag(soll), TZ), `nächster Termin Tag ${soll}`);
    jetzt = tag(soll);
  }
  sicher(E, "potenzregel", jetzt);             // Tag-60-Check bestanden
  const S = E.skills.potenzregel;
  assert.equal(S.stufe, 6);
  assert.equal(S.interval_days, ERHALT_TAGE);
  assert.equal(S.mastery_status, "gefestigt");
  assert.equal(S.consecutive_successes, 7);
});
test("Teilweise sicher: Abstand wird kürzer, Stufe bleibt", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0);
  sicher(E, "potenzregel", tag(1));                 // jetzt Tag 3, Intervall 2
  sicher(E, "potenzregel", tag(3));                 // Intervall 4 (Tag 7)
  const vorher = E.skills.potenzregel.stufe;
  teil(E, "potenzregel", tag(7));
  const S = E.skills.potenzregel;
  assert.equal(S.stufe, vorher);
  assert.equal(S.interval_days, 2);                 // 4 → 2
  assert.equal(S.next_review_at, datumVon(tag(9), TZ));
  assert.equal(S.consecutive_successes, 0);
  assert.equal(S.mastery_status, "unsicher");
});
test("Nicht abrufbar: Stufe fällt, morgen erneut, Fehlertyp wird gemerkt", () => {
  const E = leereEbb();
  sicher(E, "kettenregel", T0); sicher(E, "kettenregel", tag(1)); sicher(E, "kettenregel", tag(3));
  assert.equal(E.skills.kettenregel.stufe, 2);
  nicht(E, "kettenregel", tag(7), "kettenregel");
  const S = E.skills.kettenregel;
  assert.equal(S.stufe, 0);
  assert.equal(S.interval_days, 1);
  assert.equal(S.next_review_at, datumVon(tag(8), TZ));
  assert.equal(S.last_error_type, "kettenregel");
  assert.equal(S.mastery_status, "unsicher");
  sicher(E, "kettenregel", tag(8));
  assert.equal(E.skills.kettenregel.mastery_status, "training");
});
test("Fällige Wiederholungen: Anzeige und Reihenfolge (überfällig, Schwierigkeit, heute)", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0);                      // fällig 14.10.
  sicher(E, "kettenregel", tag(1));                  // fällig 15.10.
  sicher(E, "pq-formel", tag(1));                    // fällig 15.10.
  teil(E, "pq-formel", tag(2));                      // nicht fällig → Zusatzübung, ändert nichts
  assert.equal(heuteAuswahl(E, { jetzt: tag(0), tz: TZ }).faellig, 0);
  const a = heuteAuswahl(E, { jetzt: tag(1), tz: TZ });
  assert.deepEqual(a.items.map((x) => x.skill_id), ["potenzregel"]);
  assert.equal(a.items[0].prio, 3);
  nicht(E, "kettenregel", tag(2));                   // war Tag 2 noch nicht fällig? (fällig 15.10. = Tag 2) → fällig, scheitert
  const b = heuteAuswahl(E, { jetzt: tag(4), tz: TZ });    // 17.10.: potenzregel 3 Tage, pq-formel 2 Tage überfällig
  assert.equal(b.faellig, 3);
  assert.deepEqual(b.items.map((x) => x.prio), [1, 1, 1]);
  assert.equal(b.items[0].skill_id, "potenzregel");  // am längsten überfällig
  assert.ok(b.minuten >= 1);
});
test("Priorität: heute fällige mit Schwierigkeit vor normalen heute fälligen", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0); sicher(E, "bruch-addieren", T0);
  nicht(E, "bruch-addieren", tag(1));                // morgen erneut → fällig am Tag 2
  sicher(E, "potenzregel", tag(1));                  // nächster Termin Tag 3
  sicher(E, "binomische-formeln", tag(1));           // fällig Tag 2
  const a = heuteAuswahl(E, { jetzt: tag(2), tz: TZ });
  assert.deepEqual(a.items.map((x) => [x.skill_id, x.prio]), [["bruch-addieren", 2], ["binomische-formeln", 3]]);
});
test("Ältere Skills: Voraussetzung für das aktuelle Thema kommt bald fälliger mit dazu", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0);                      // fällig 14.10.
  sicher(E, "potenzregel", tag(1));                  // → nächster Termin 16.10. (Tag 3)
  assert.equal(heuteAuswahl(E, { jetzt: tag(1), tz: TZ, aktuellesThema: "kurven" }).items.length, 1);
  const a = heuteAuswahl(E, { jetzt: tag(1), tz: TZ, aktuellesThema: "kurven" });
  assert.equal(a.items[0].prio, 4);
  assert.match(a.items[0].grund, /Kurvendiskussion|Wendepunkte|Extrempunkte/);
  assert.equal(heuteAuswahl(E, { jetzt: tag(1), tz: TZ, aktuellesThema: "bernoulli" }).items.length, 0);
});
test("Ursache: Fehler gehört zu einer Voraussetzung → diese kommt morgen dran", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0); sicher(E, "potenzregel", tag(1)); sicher(E, "potenzregel", tag(3));  // Termin weit weg
  sicher(E, "kettenregel", T0);
  const ae = nicht(E, "kettenregel", tag(3), "potenzregel");
  const v = ae.find((x) => x.voraussetzungVon === "kettenregel");
  assert.ok(v && v.skill_id === "potenzregel");
  assert.equal(E.skills.potenzregel.next_review_at, datumVon(tag(4), TZ));   // morgen (Tag 3 + 1) statt erst Tag 7
  const ae2 = nicht(E, "kettenregel", tag(4), "kettenregel");
  assert.equal(ae2.filter((x) => x.voraussetzungVon).length, 0);               // eigener Fehler, keine Voraussetzung
});
test("Mehrere Skills: Erfolg zählt für alle Tags, Fehler nur für den passenden", () => {
  const E = leereEbb();
  bucheErgebnis(E, ["kettenregel", "potenzregel"], { ergebnis: "sicher", exercise_id: "k1", generator: "abl-kette" }, T0, TZ);
  assert.ok(E.skills.kettenregel.first_learned_at && E.skills.potenzregel.first_learned_at);
  const F = leereEbb();
  bucheErgebnis(F, ["kettenregel", "potenzregel"], { ergebnis: "nicht", exercise_id: "k2", fehler_typ: "kettenregel" }, T0, TZ);
  assert.ok(F.skills.kettenregel && !F.skills.potenzregel);
});
test("Doppelte Termine und Einträge werden vermieden", () => {
  const E = leereEbb();
  bucheErgebnis(E, ["potenzregel"], { ergebnis: "sicher", exercise_id: "dup" }, T0, TZ);
  const zweites = bucheErgebnis(E, ["potenzregel"], { ergebnis: "sicher", exercise_id: "dup" }, T0 + 1000, TZ);
  assert.equal(zweites.length, 0);
  assert.equal(E.skills.potenzregel.review_history.length, 1);
  assert.equal(Object.keys(E.skills).length, 1);
  // zwei verschiedene Aufgaben am selben Tag rücken den Plan nicht doppelt vor
  sicher(E, "potenzregel", tag(1));
  const stufe = E.skills.potenzregel.stufe, naechster = E.skills.potenzregel.next_review_at;
  sicher(E, "potenzregel", tag(1, 2));
  assert.equal(E.skills.potenzregel.stufe, stufe);
  assert.equal(E.skills.potenzregel.next_review_at, naechster);
  assert.equal(E.skills.potenzregel.review_history.length, 3);
});
test("Verspätete Wiederholung: Abstand zählt ab dem tatsächlichen Termin, Verspätung wird festgehalten", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0);                        // fällig 14.10.
  sicher(E, "potenzregel", tag(6));                    // erst am 19.10. (5 Tage zu spät)
  const S = E.skills.potenzregel;
  const h = S.review_history[1];
  assert.equal(h.verspaetung_tage, 5);
  assert.equal(h.faellig, true);
  assert.equal(S.stufe, 1);
  assert.equal(S.next_review_at, datumVon(tag(8), TZ)); // 19.10. + 2 Tage
});
test("Tageswechsel: um Mitternacht des Schülers wird die Wiederholung fällig, nicht nach 24 Stunden", () => {
  const E = leereEbb();
  const abend = Date.UTC(2026, 9, 13, 21, 50);          // 23:50 Berlin am 13.10.
  sicher(E, "potenzregel", abend);
  assert.equal(E.skills.potenzregel.next_review_at, "2026-10-14");
  const kurzDanach = Date.UTC(2026, 9, 13, 22, 10);     // 00:10 Berlin am 14.10. – nur 20 Minuten später
  assert.equal(istFaellig(E.skills.potenzregel, datumVon(kurzDanach, TZ)), true);
  assert.equal(heuteAuswahl(E, { jetzt: kurzDanach, tz: TZ }).faellig, 1);
  assert.equal(heuteAuswahl(E, { jetzt: Date.UTC(2026, 9, 13, 21, 59), tz: TZ }).faellig, 0);
});
test("Zeitzonen: derselbe Zeitpunkt liegt je nach Ort auf verschiedenen Kalendertagen", () => {
  const t = Date.UTC(2026, 9, 13, 23, 30);
  assert.equal(datumVon(t, "Europe/Berlin"), "2026-10-14");
  assert.equal(datumVon(t, "America/New_York"), "2026-10-13");
  assert.equal(datumVon(t, "Asia/Bangkok"), "2026-10-14");
  assert.equal(datumVon(t, "Pacific/Auckland"), "2026-10-14");
  const E = leereEbb();
  sicher(E, "potenzregel", Date.UTC(2026, 9, 12, 10));   // gelernt 12.10., fällig 13.10. (Zonen-neutrales Datum)
  assert.equal(heuteAuswahl(E, { jetzt: t, tz: "America/New_York" }).faellig, 1);
  const F = leereEbb();
  sicher(F, "potenzregel", Date.UTC(2026, 9, 13, 10));   // fällig 14.10.
  assert.equal(heuteAuswahl(F, { jetzt: t, tz: "Europe/Berlin" }).faellig, 1);
  assert.equal(heuteAuswahl(F, { jetzt: t, tz: "America/New_York" }).faellig, 0);
});
test("Variation: Aufgabenart wechselt, Tag 14 wählt die anspruchsvollste", () => {
  assert.equal(waehleGenerator("kettenregel", 2, "abl-kette", () => 0), "abl-exp");
  assert.equal(waehleGenerator("kettenregel", 2, "abl-exp", () => 0), "abl-kette");
  assert.equal(waehleGenerator("potenzregel", 2, "abl-potenz", () => 0), "abl-potenz");  // nur eine Art
  assert.equal(waehleGenerator("kettenregel", 4, null), "abl-kette");                      // afb 2 > afb 2? gleich → erste
  const a = neueAufgabe("abl-kette"), b = neueAufgabe("abl-kette");
  assert.notEqual(a.id, b.id);
});
test("Einordnung: sicher, teilweise, nicht abrufbar", () => {
  assert.equal(bewerte({ gebucht: true, ok: true, versuche: 1, hilfeEnde: 0 }), "sicher");
  assert.equal(bewerte({ gebucht: true, ok: true, versuche: 2, hilfeEnde: 1 }), "teilweise");
  assert.equal(bewerte({ gebucht: true, ok: true, versuche: 1, hilfeEnde: 2 }), "teilweise");
  assert.equal(bewerte({ gebucht: true, ok: true, versuche: 1, hilfeEnde: 4 }), "nicht");
  assert.equal(bewerte({ gebucht: true, ok: false, versuche: 1, hilfeEnde: 0 }), "nicht");
  assert.equal(bewerte({ gebucht: false, ok: null }), null);
});
test("Aufgabenlauf: echte Aufgaben werden Skills zugeordnet und gebucht", () => {
  const E = leereEbb();
  const aufg = [neueAufgabe("abl-kette"), neueAufgabe("gl-linear"), neueAufgabe("bru-add")];
  const zs = [
    { gebucht: true, ok: true, versuche: 1, hilfeEnde: 0 },
    { gebucht: true, ok: false, versuche: 1, hilfeEnde: 0, typ: "ausmultiplizieren", erstOk: false },
    { gebucht: false, ok: null },
  ];
  bucheLauf(E, aufg, zs, T0, "warmup", TZ);
  assert.ok(E.skills.kettenregel.first_learned_at && E.skills.potenzregel.first_learned_at);
  assert.equal(E.skills["gleichungen-umformen"].first_learned_at, null);
  assert.equal(E.skills["gleichungen-umformen"].last_error_type, "ausmultiplizieren");
  assert.ok(!E.skills["bruch-addieren"]);
  assert.equal(heuteErledigt(E, T0, TZ), 3);
});
test("Speicher: normierte Daten überstehen JSON, kaputte Einträge werden verworfen", () => {
  const E = leereEbb();
  sicher(E, "potenzregel", T0);
  const N = normiereEbb(JSON.parse(JSON.stringify(E)));
  assert.deepEqual(N.skills.potenzregel.review_history.length, 1);
  assert.equal(N.skills.potenzregel.mastery_status, "training");
  const K = normiereEbb({ plan: "unbekannt", skills: { potenzregel: { next_review_at: "kaputt", stufe: 99 }, gibtsnicht: {}, kettenregel: 7 } });
  assert.equal(K.plan, "standard");
  assert.deepEqual(Object.keys(K.skills), ["potenzregel"]);
  assert.equal(K.skills.potenzregel.stufe, 6);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(K.skills.potenzregel.next_review_at));
  assert.deepEqual(normiereEbb(null).skills, {});
  const T = normiere({ ebbinghaus: E });                // bleibt im Lernstand erhalten
  assert.ok(T.ebbinghaus);
});
test("Kompakter Plan: Termine nach Plan 0, 1, 2, 4 …", () => {
  const E = leereEbb(); E.plan = "kompakt";
  sicher(E, "potenzregel", T0);
  sicher(E, "potenzregel", tag(1));
  assert.equal(E.skills.potenzregel.next_review_at, datumVon(tag(2), TZ));
  sicher(E, "potenzregel", tag(2));
  assert.equal(E.skills.potenzregel.next_review_at, datumVon(tag(4), TZ));
  assert.equal(statusVon(E.skills.potenzregel, E), "training");
});
test("Alle Skills lassen sich buchen und auswählen", () => {
  const E = leereEbb();
  for (const id of SKILL_IDS) sicher(E, id, T0);
  assert.equal(Object.keys(E.skills).length, SKILL_IDS.length);
  assert.equal(heuteAuswahl(E, { jetzt: tag(1), tz: TZ, max: 100 }).faellig, SKILL_IDS.length);
  assert.equal(heuteAuswahl(E, { jetzt: tag(1), tz: TZ, max: 5 }).items.length, 5);
});
