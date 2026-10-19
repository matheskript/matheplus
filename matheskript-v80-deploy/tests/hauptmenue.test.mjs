import test from "node:test";
import assert from "node:assert/strict";
import { istPro, kontoArt, kontoEintraege, zugangEintrag, klasseErmitteln, klasseLabel, klassenInhalt, mathematikEintraege, aktiverPunkt, KI_MENUE, TRAINING, KURSE, LEISTE, kurseListe, baldListe } from "../src/hauptmenue.js";
import { ANGEBOT } from "../src/angebot.js";
const MIT_PRO = { ...ANGEBOT, pro: true, kurse: true };
import { SEITEN } from "../src/pfade.js";

test("Pro nur mit plan=pro und nicht abgelaufen", () => {
  assert.equal(istPro(null), false);
  assert.equal(istPro({ plan: "free" }), false);
  assert.equal(istPro({ plan: "pro" }), true);
  assert.equal(istPro({ plan: "pro", pro_bis: "2000-01-01" }), false);
  assert.equal(istPro({ plan: "pro", pro_bis: "2999-01-01" }), true);
});

test("Account-Art je Rolle", () => {
  assert.equal(kontoArt({ rolle: "schueler" }), "Trainings-Account");
  assert.equal(kontoArt({ rolle: "eltern" }), "Eltern-Account");
  assert.equal(kontoArt({ rolle: "lehrkraft", geschlecht: "w" }), "Lehrerin-Account");
  assert.equal(kontoArt({ rolle: "lehrkraft" }), "Lehrer-Account");
  assert.equal(kontoArt(null), "Trainings-Account");
});

test("Konto-Menü: Pro werden oder Mein Plan (nur mit Angebot „Pro“), rollenabhängige Einträge", () => {
  assert.ok(kontoEintraege({ rolle: "schueler" }, true, MIT_PRO).some((e) => e.id === "pro"));
  assert.ok(kontoEintraege({ rolle: "schueler", plan: "pro" }, true, MIT_PRO).some((e) => e.id === "plan"));
  assert.ok(kontoEintraege(null, false, MIT_PRO).some((e) => e.id === "pro"));
  assert.ok(kontoEintraege({ rolle: "eltern" }).some((e) => e.id === "kinder"));
  assert.ok(kontoEintraege({ rolle: "lehrkraft" }).some((e) => e.id === "klassen"));
  assert.ok(kontoEintraege({ rolle: "lehrkraft" }).some((e) => e.id === "arbeitsblatt" && e.ziel.ansicht === "lehrerblatt"));
  assert.ok(!kontoEintraege({ rolle: "schueler" }).some((e) => e.id === "arbeitsblatt"));
});

test("Blog-Start: weder „Pro werden“ noch „Mein Plan“ im Menü, dafür „Unterstützen“", () => {
  assert.equal(ANGEBOT.pro, false);
  for (const rolle of ["schueler", "eltern", "lehrkraft", "nachhilfe"]) {
    assert.ok(!kontoEintraege({ rolle }).some((e) => e.id === "pro" || e.id === "plan"), rolle);
    assert.ok(!kontoEintraege({ rolle, plan: "pro" }).some((e) => e.id === "pro" || e.id === "plan"), rolle);
  }
  const gast = kontoEintraege(null, false);
  assert.ok(gast.every(Boolean));
  assert.ok(gast.some((e) => e.id === "spenden" && e.ziel.ansicht === "spenden"));
});

test("Meine Kurse: Masterclass und „Bald“-Platzhalter nur mit Angebot „Kurse“", () => {
  assert.ok(!KURSE.some((k) => k.id === "mckurs") && KURSE.length > 0);
  assert.deepEqual(baldListe(), []);
  assert.ok(kurseListe(MIT_PRO).some((k) => k.id === "mckurs"));
  assert.ok(baldListe(MIT_PRO).length > 0);
  assert.deepEqual(klassenInhalt({ schulart: "g9", box: "10" }).bald, []);
});

test("☰-Menü: Konto-Punkte einzeilig, Abmelden/Anmelden nur als letzter Punkt (zugangEintrag)", () => {
  for (const rolle of ["schueler", "eltern", "lehrkraft", "nachhilfe"]) {
    const l = kontoEintraege({ rolle });
    assert.ok(l.length >= 4 && l.length <= 6, rolle + ": " + l.length);
    assert.ok(!l.some((e) => e.id === "abmelden" || e.id === "anmelden"), "Zugang steht nicht in der Liste");
    assert.ok(l.every((e) => !e.zeile), "keine zweite Zeile");
  }
  const gast = kontoEintraege(null, false);
  assert.ok(!gast.some((e) => e.id === "abmelden" || e.id === "anmelden"));
  assert.deepEqual(zugangEintrag(true), { id: "abmelden", name: "Abmelden", aktion: "abmelden" });
  assert.equal(zugangEintrag(false).id, "anmelden");
  assert.equal(zugangEintrag(false).ziel.ansicht, "konto");
});

test("Klasse: Profil vor Quickfinder, Beschriftung", () => {
  assert.deepEqual(klasseErmitteln({ schulform: "G9", klasse: 10 }, null), { schulart: "g9", box: "10" });
  assert.deepEqual(klasseErmitteln({ schulform: "G8", klasse: 6 }, null), { schulart: "g8", box: "5-6" });
  assert.deepEqual(klasseErmitteln(null, { schulart: "gms", klasse: "8" }), { schulart: "gms", box: "8" });
  assert.equal(klasseErmitteln(null, { schulart: "g8", klasse: "13" }), null);
  assert.equal(klasseErmitteln(null, null), null);
  assert.equal(klasseLabel({ schulart: "g9", box: "10" }), "Klasse 10 (G9)");
  assert.equal(klasseLabel(null), "Meine Klasse");
});

test("Klassen-Inhalt: Kapitel mit Trainieren-Ziel, Abi nur in Oberstufe", () => {
  const i = klassenInhalt({ schulart: "g9", box: "10" });
  assert.ok(i.kapitel.length > 0);
  for (const k of i.kapitel) assert.equal(k.trainieren.ansicht, "trainieren");
  assert.ok(!mathematikEintraege("mittel").some((e) => e.abi));
  assert.ok(mathematikEintraege("ober").some((e) => e.abi));
});

test("Jedes Menü-Ziel hat eine Seite mit Pfad", () => {
  const ansichten = new Set(SEITEN.map((s) => s.ansicht));
  const ziele = [...KI_MENUE, ...TRAINING, ...KURSE, ...mathematikEintraege("alle"), ...kontoEintraege({ rolle: "eltern" }), ...kontoEintraege({ rolle: "schueler" }), ...kontoEintraege({ rolle: "lehrkraft" }), ...kontoEintraege(null, false), zugangEintrag(false)].filter((e) => e.ziel).map((e) => e.ziel.ansicht);
  for (const a of ziele) assert.ok(ansichten.has(a), "kein Pfad für " + a);
  assert.equal(LEISTE.length, 5);
});

test("Aktiver Punkt", () => {
  assert.equal(aktiverPunkt("analyse", "blatt"), "mathilda");
  assert.equal(aktiverPunkt("diffkurs"), "kurse");
  assert.equal(aktiverPunkt("warmup"), "training");
  assert.equal(aktiverPunkt("formeln"), "mathematik");
  assert.equal(aktiverPunkt("start"), null);
});
