/* Feedback-Seite (src/funcFeedbackSeite.jsx, Daten src/feedback.js): eigene Seite /feedback während der Testphase.
   Sagt ehrlich, dass die Seite eine Baustelle ist, fragt Schüler und Eltern nach Gut · Unklar · Zu kompliziert · Wunsch,
   sammelt per Text oder Sprachnachricht in derselben Tabelle wie der Feedback-Knopf (public.feedback, Angaben in details). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROLLEN, ARTEN, SCHUELER_FRAGEN, ELTERN_PUNKTE, GENAU, DANACH, FEEDBACK_KAPITEL, KLASSEN, MAX_ZEICHEN, MAX_ORT,
  feedbackPruefen, feedbackZeile, gesiezt, SEITEN_NAME } from "../src/feedback.js";
import { pfadAufloesen, pfadFuer } from "../src/pfade.js";
import { KEIN_TEILEN } from "../src/teilen.js";
import { SPRUENGE } from "../src/sprung.js";
import { SEITEN_TITEL } from "../src/seitenTitel.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");
const seite = quelle("funcFeedbackSeite.jsx");

test("Pfad /feedback, Tab-Titel, ohne Teilen-Knopf, lazy in func10, Sprung-Schlüssel", () => {
  assert.deepEqual(pfadAufloesen("/feedback"), { ansicht: "feedback", kanonisch: true });
  assert.equal(pfadAufloesen("/testphase").ansicht, "feedback");
  assert.equal(pfadFuer({ ansicht: "feedback" }), "/feedback");
  assert.ok(SEITEN_TITEL.feedback && SEITEN_TITEL.feedback.includes("Baustelle"));
  assert.ok(KEIN_TEILEN.includes("feedback"));
  assert.equal(SPRUENGE["feedback-kapitel"].art, "anker");
  const f10 = quelle("func10.jsx");
  assert.ok(f10.includes('import("./funcFeedbackSeite.jsx")') && f10.includes('ansicht === "feedback"') && f10.includes("<FeedbackSeite gehe={gehe} />"));
  assert.ok(!f10.includes('import { FeedbackSeite }'), "Seite muss lazy laden (Startchunk)");
  assert.ok(seite.includes('springeZuId("feedback-kapitel"') && !/window\.scrollTo|scrollIntoView/.test(seite), "Sprünge nur über den Sprung-Schalter");
});

test("Kapitel: sechs Stück, nummeriert, jedes als Abschnitt auf der Seite in dieser Reihenfolge", () => {
  assert.equal(FEEDBACK_KAPITEL.length, 6);
  FEEDBACK_KAPITEL.forEach((k, i) => assert.equal(k.nr, String(i + 1).padStart(2, "0")));
  const reihe = ["feedback-start", ...FEEDBACK_KAPITEL.map((k) => k.id)];
  const stellen = reihe.map((id) => seite.indexOf(`id="${id}"`));
  stellen.forEach((s, i) => assert.ok(s > 0, `Abschnitt ${reihe[i]} fehlt`));
  for (let i = 1; i < stellen.length; i++) assert.ok(stellen[i] > stellen[i - 1], `${reihe[i]} steht vor ${reihe[i - 1]}`);
  assert.ok(seite.indexOf('id="fb-senden"') < seite.indexOf('id="fb-danach"'), "Formular vor dem Abschluss");
});

test("Die vier Fragen der Testphase sind Arten mit Beispiel; Rollen Schüler/Eltern/Lehrkraft; Eltern gesiezt", () => {
  assert.deepEqual(SCHUELER_FRAGEN, ["gut", "unklar", "kompliziert", "wunsch"]);
  for (const id of SCHUELER_FRAGEN) {
    const a = ARTEN.find((x) => x.id === id);
    assert.ok(a && a.frage.endsWith("?") && a.beispiel.startsWith("„") && a.hilfe.length > 20, id);
  }
  assert.equal(new Set(ARTEN.map((a) => a.id)).size, ARTEN.length);
  assert.deepEqual(ROLLEN.map((r) => r.id), ["schueler", "eltern", "lehrkraft"]);
  assert.equal(gesiezt("eltern"), true);
  assert.equal(gesiezt("schueler"), false);
  assert.equal(ELTERN_PUNKTE.length, 4);
  ELTERN_PUNKTE.forEach((p) => assert.ok(/Ihr|Sie/.test(p.text) && !/\bdu\b|\bdein/i.test(p.text), `Eltern gesiezt: ${p.titel}`));
  assert.deepEqual(GENAU.map((g) => g.punkt), ["Wo?", "Was?", "Warum?"]);
  assert.equal(DANACH.length, 3);
  assert.deepEqual(KLASSEN, [5, 6, 7, 8, 9, 10, 11, 12, 13]);
});

test("Prüfung: Rolle → Art → Inhalt → Einwilligung, in dieser Reihenfolge", () => {
  const ok = { rolle: "schueler", art: "unklar", text: "Im Integraltrainer verstehe ich Schritt 2 nicht.", dauer: 0, zustimmung: true, weg: "text" };
  assert.equal(feedbackPruefen(ok), "");
  assert.match(feedbackPruefen({ ...ok, rolle: "" }), /wer du bist/);
  assert.match(feedbackPruefen({ ...ok, art: "egal" }), /worum/);
  assert.match(feedbackPruefen({ ...ok, text: "ok" }), /paar Worte/);
  assert.match(feedbackPruefen({ ...ok, zustimmung: false }), /Einwilligung/);
  assert.equal(feedbackPruefen({ ...ok, weg: "voice", text: "", dauer: 12 }), "");
  assert.match(feedbackPruefen({ ...ok, weg: "voice", text: "", dauer: 1 }), /kurz/);
  assert.match(feedbackPruefen({ ...ok, weg: "" }), /Text oder Sprachnachricht/);
});

test("Zeile für public.feedback: Text oder Aufnahme, Angaben in details, Grenzen eingehalten", () => {
  const t = feedbackZeile({ rolle: "schueler", klasse: 10, art: "wunsch", ort: "  Integrale, Stufe 2  ", text: "  Mehr Textaufgaben.  " });
  assert.equal(t.seite, SEITEN_NAME);
  assert.equal(t.ansicht, "feedback");
  assert.deepEqual(t.details, { quelle: "feedback-seite", rolle: "schueler", art: "wunsch", klasse: 10, ort: "Integrale, Stufe 2" });
  assert.equal(t.nachricht, "Mehr Textaufgaben.");
  assert.equal(t.audio_pfad, undefined);
  const v = feedbackZeile({ rolle: "eltern", klasse: 10, art: "gut", audioPfad: "2026-10-22/x.webm", dauer: 41.6 });
  assert.equal(v.audio_pfad, "2026-10-22/x.webm");
  assert.equal(v.dauer_s, 42);
  assert.equal(v.nachricht, undefined);
  assert.equal(v.details.klasse, undefined, "Klasse nur bei Schülern");
  assert.equal(v.details.ort, undefined);
  const lang = feedbackZeile({ rolle: "lehrkraft", art: "sonst", ort: "x".repeat(500), text: "y".repeat(5000) });
  assert.equal(lang.details.ort.length, MAX_ORT);
  assert.equal(lang.nachricht.length, MAX_ZEICHEN);
  assert.ok(lang.seite.length <= 200 && lang.ansicht.length <= 60);
});

test("Seite: Baustelle ehrlich benannt, Schüler du / Eltern Sie, Text und Voice, Einwilligung, keine Karos, keine erfundenen Zahlen", () => {
  assert.ok(seite.includes("eine Baustelle"));
  assert.ok(seite.includes('data-fs-weg="text"') && seite.includes('data-fs-weg="voice"'));
  assert.ok(seite.includes("useSprachaufnahme") && seite.includes("audioHochladen"), "dieselbe Aufnahme-Technik wie der Feedback-Knopf");
  assert.ok(seite.includes('href="/datenschutz"'));
  assert.ok(!/karo|Karo/.test(seite.replace(/Keine Karos/g, "")));
  const jsx = seite.slice(seite.indexOf("return (\n    <div"));   // ohne CSS (dort stehen Prozente)
  assert.ok(!/\d+\s*(Schüler|Nutzer|Eltern|Prozent|%)/.test(jsx), "keine erfundenen Zahlen");
  assert.ok(seite.includes('id="fb-eltern"') && seite.includes("Ihr Kind"));
  assert.ok(seite.includes("html[data-feedback-seite] .fb-fuss { display: none; }"), "Feedback-Knopf unten auf dieser Seite doppelt – ausgeblendet");
});

test("Feedback-Knopf: Hook herausgelöst, dritter Punkt führt zur Feedback-Seite (nicht auf der Seite selbst)", () => {
  const knopf = quelle("funcFeedback.jsx");
  assert.ok(knopf.includes("export function useSprachaufnahme") && knopf.includes("export async function audioHochladen"));
  assert.ok(knopf.includes('gehe({ ansicht: "feedback" })') && knopf.includes('aktuell.ansicht !== "feedback"'));
  assert.ok(quelle("func10.jsx").includes("<FeedbackKnopf gehe={gehe}"));
});
