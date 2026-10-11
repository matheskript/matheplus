/* Tests für das Performance-Lab (reine Logik). Ausführen: node --test tests/ */
import test from "node:test";
import assert from "node:assert/strict";
import { aequivalent, fruehesterFehler, erkenneVorzeichenfehler, parsePoly, polyAuswerten, loeseLinear, polyAbleiten, polyGleich } from "../src/perfAlgebra.js";
import { AUFGABEN_VORZEICHEN, bewerte, formVerletzt, aufgabeVon } from "../src/perfAufgaben.js";
import {
  leerePerf, meldeFehler, meldeAufgabe, scanDiagnose, validiereDiagnose, baueCluster, musterStatus, zurKlaerung,
  ereignisKorrigieren, clusterTeilen, verlaufAussage, fehlerquote, trainingsEffekt, trainingsVorschlaege, TAG, importiereAlteBeobachtungen,
  loescheNutzerdaten, exportiere, rueckfall, ereignisBauen, validiereScanLesung, loescheTestdaten,
} from "../src/perfKern.js";
import { ladeTestdaten, zeilenAusText, SCAN_BEISPIELE } from "../src/perfTestdaten.js";
import { starteRunde, antworten, hilfeNehmen, loesungAufdecken, rundeAbbrechen, trainingsStand, badgesVon, RUNDE_GROESSE } from "../src/perfTraining.js";
import { FEHLERTYPEN_TAX } from "../src/perfTaxonomie.js";

const T0 = Date.UTC(2026, 9, 1, 12);
const U = "nutzer-a";

/* ---------------- Algebra ---------------- */
test("Äquivalenz: Schreibweisen", () => {
  assert.equal(aequivalent("2x-3", "-3+2x"), true);
  assert.equal(aequivalent("2x-3", "2·x−3"), true);
  assert.equal(aequivalent("3x-(2x-5)", "x+5"), true);
  assert.equal(aequivalent("3x-(2x-5)", "x-5"), false);
  assert.equal(aequivalent("(x+2)(x-5)", "x^2-3x-10"), true);
  assert.equal(aequivalent("0,5x", "x/2"), true);
});
test("Äquivalenz: Gleichungen bis auf Faktor", () => {
  assert.equal(aequivalent("3x-7=5x+1", "3x-5x=1+7"), true);
  assert.equal(aequivalent("3x-7=5x+1", "3x-5x=1-7"), false);
  assert.equal(aequivalent("-2x=8", "x=-4"), true);
  assert.equal(aequivalent("-2x=8", "x=4"), false);
});
test("Nicht prüfbar ist nie falsch", () => {
  assert.equal(aequivalent("sqrt(x)", "x"), null);
  assert.equal(aequivalent("x=1", "x"), null);
  assert.equal(aequivalent("1/x", "x"), null);
});
test("Früheste Fehlerstelle, Folgefehler werden nicht doppelt gezählt", () => {
  const f = fruehesterFehler(["3x-(2x-5)", "3x-2x-5", "x-5"]);
  assert.equal(f.status, "falsch"); assert.equal(f.index, 1);
  const g = fruehesterFehler(["3x-(2x-5)", "3x-2x+5", "x+5"]);
  assert.equal(g.status, "ok");
});
test("Falscher Zwischenschritt bei zufällig richtigem Endergebnis wird gefunden", () => {
  /* x=2 stimmt am Ende, der Zwischenschritt ist falsch */
  const f = fruehesterFehler(["3x-6=0", "3x=-6", "x=2"]);
  assert.equal(f.status, "falsch"); assert.equal(f.index, 1);
});
test("Vorzeichenfehler-Erkennung und Untertypen", () => {
  assert.equal(erkenneVorzeichenfehler("3x-(2x-5)", "3x-2x-5").untertyp, "minus_klammer");
  assert.equal(erkenneVorzeichenfehler("3x-7=5x+1", "3x-5x=1-7").untertyp, "umstellen");
  assert.equal(erkenneVorzeichenfehler("-3x^2+5x", "6x+5", "ableiten").ist, false, "Ergebnis ist kein Betrag-Vorzeichen-Paar der Eingabe");
  assert.equal(erkenneVorzeichenfehler("2x-8-3x+3", "2x-8-3x-3").untertyp, "zusammenfassen");
  /* Wird die Klammer im selben Schritt aufgelöst UND falsch gerechnet, ist die Ursache nicht sicher aus den Beträgen ablesbar:
     bewusst keine Hypothese erfunden, sondern „Ursache offen“ → Nutzer wählt oder KI schlägt vor. */
  const offen = scanDiagnose({ zeilen: ["2(x-4)-3(x-1)", "2x-8-3x-3"], zeilenStatus: ["ok", "ok"], lesbarkeit: 9 });
  assert.equal(offen.pruefung.status, "falsch");
  assert.equal(offen.vorschlag, null);
  assert.equal(offen.braucht, "ki");
  assert.equal(erkenneVorzeichenfehler("x+5", "2x+5").ist, false);
});

/* ---------------- Aufgabenbestand ---------------- */
test("Jede Aufgabe: Musterkette ist durchgehend gleichwertig und endet bei der Referenzlösung", () => {
  for (const a of AUFGABEN_VORZEICHEN) {
    /* Bei Ableitungsaufgaben ist die Ausgangszeile NICHT äquivalent zur Ableitung – die Kette beginnt dort beim ersten Musterschritt. */
    const kette = a.art === "ableitung" ? [...a.muster] : [a.start, ...a.muster];
    for (let i = 1; i < kette.length; i++) assert.equal(aequivalent(kette[i - 1], kette[i]), true, `${a.id}: Zeile ${i}`);
    assert.equal(aequivalent(a.korrekt, kette[kette.length - 1]), true, `${a.id}: korrekt`);
  }
});
test("Jede Aufgabe: genau eine Fehlerstelle, Fehlerschritt nachweislich falsch", () => {
  for (const a of AUFGABEN_VORZEICHEN) {
    if (a.art === "ableitung") {
      const p = parsePoly(a.start);
      assert.ok(polyGleich(polyAbleiten(p), parsePoly(a.korrekt)), `${a.id}: Ableitung stimmt`);
    }
    assert.equal(aequivalent(a.korrekt, a.fehlerSchritt), false, `${a.id}: Fehlerschritt darf nicht richtig sein`);
    assert.equal(aequivalent(a.muster[0], a.fehlerSchritt), false, `${a.id}: Fehlerschritt weicht vom Musterschritt ab`);
    const w = erkenneVorzeichenfehler(a.muster[0], a.fehlerSchritt, a.kontext === "ableiten" ? "ableiten" : null);
    assert.ok(w.ist, `${a.id}: Abweichung ist ein reiner Vorzeichenfehler`);
    assert.ok(a.hinweise.length === 3);
  }
});
test("Jede Aufgabe: unabhängige numerische Gegenprobe der Referenzlösung", () => {
  for (const a of AUFGABEN_VORZEICHEN) {
    if (a.art === "gleichung") { assert.equal(String(loeseLinear(a.start).z), String(loeseLinear(a.korrekt).z), a.id); continue; }
    const p = parsePoly(a.start), k = parsePoly(a.korrekt);
    const f = (s) => { const t = s.replace(/\^/g, "**").replace(/(\d)([x(])/g, "$1*$2").replace(/\)(\(|x)/g, ")*$1").replace(/x(\()/g, "x*$1"); return (x) => Function("x", `return ${t}`)(x); };
    for (const x of [-3, -1, 0, 2, 5]) {
      const rechts = a.art === "ableitung" ? Number(((h) => (f(a.start)(x + h) - f(a.start)(x - h)) / (2 * h))(1e-5).toFixed(3)) : f(a.start)(x);
      const links = f(a.korrekt)(x);
      assert.ok(Math.abs(rechts - links) < 1e-2, `${a.id} bei x=${x}: ${rechts} vs ${links}`);
    }
    assert.ok(p && k);
  }
});
test("Bewertung: äquivalente Schreibweisen richtig, Form wird verlangt", () => {
  const a = aufgabeVon("vz-kl-01");
  assert.equal(bewerte(a, "x+5").art, "richtig");
  assert.equal(bewerte(a, "5+x").art, "richtig");
  assert.equal(bewerte(a, "x + 5").art, "richtig");
  assert.equal(bewerte(a, "3x-(2x-5)").art, "form", "unveränderte Ausgangszeile ist nicht gelöst");
  assert.equal(bewerte(a, "3x-2x-5").art, "typisch");
  assert.equal(bewerte(a, "x-5").art, "typisch");
  assert.equal(bewerte(a, "").zaehlt, false);
  assert.equal(bewerte(a, "banane").zaehlt, false);
  assert.equal(bewerte(a, "x+7").art, "falsch");
  const b = aufgabeVon("vz-ab-01");
  assert.equal(bewerte(b, "f'(x)=-6x+5").art, "richtig");
  assert.equal(bewerte(b, "6x+5").art, "typisch");
  const g = aufgabeVon("vz-um-01");
  assert.equal(bewerte(g, "3x-5x=1+7").art, "richtig");
  assert.equal(bewerte(g, "x=-4").art, "richtig", "vollständig gelöst ist mathematisch richtig (alle x links, Zahl rechts)");
  assert.equal(bewerte(g, "3x-7=5x+1").art, "form", "unveränderte Gleichung ist nicht umgeformt");
  assert.equal(bewerte(g, "3x-5x=1-7").art, "typisch");
  assert.equal(bewerte(g, "-2x=8").art, "richtig");
});
test("Zusammenfassen wird bei Termaufgaben verlangt", () => {
  const a = aufgabeVon("vz-te-01");
  assert.equal(bewerte(a, "-x-5").art, "richtig");
  assert.equal(bewerte(a, "2x-8-3x+3").art, "form");
});

/* ---------------- Fehlergedächtnis ---------------- */
const digital = (n, extra = {}) => ({
  nutzerId: U, quelle: "digital", zeit: T0 + n * TAG, schritt: "3x-2x-5", korrekt: "x+5", eingabeStatus: "gueltig", typSicher: true,
  typ: "vorzeichen", untertyp: "minus_klammer", ursprung: { art: "aufgabe", ref: `a${n}` }, aufgabe: { id: `a${n}`, text: "3x-(2x-5)", kontext: "klammern", schwierigkeit: 1 }, ...extra,
});
test("Digital: ungültige Eingabe und unbelegter Typ werden nicht gespeichert", () => {
  const P = leerePerf();
  assert.equal(meldeFehler(P, digital(0, { eingabeStatus: "ungueltig" })).abgelehnt, true);
  assert.equal(meldeFehler(P, digital(0, { typSicher: false })).abgelehnt, true);
  assert.equal(P.ereignisse.length, 0);
});
test("Idempotenz: doppelte Meldung ergibt ein Ereignis", () => {
  const P = leerePerf();
  assert.equal(meldeFehler(P, digital(0)).neu, true);
  assert.equal(meldeFehler(P, digital(0)).neu, false);
  assert.equal(P.ereignisse.length, 1);
});
test("Musterstufen: einzeln → möglich → wiederkehrend → gestützt", () => {
  const P = leerePerf();
  meldeFehler(P, digital(0), T0);
  assert.equal(baueCluster(P, U, T0)[0].status, "einzeln");
  assert.equal(trainingsVorschlaege(P, U, T0).length, 0, "einzelne Beobachtung erzeugt keinen Vorschlag");
  meldeFehler(P, digital(1), T0 + TAG);
  assert.equal(baueCluster(P, U, T0 + TAG)[0].status, "moeglich");
  meldeFehler(P, digital(2), T0 + 2 * TAG);
  assert.equal(baueCluster(P, U, T0 + 2 * TAG)[0].status, "wiederkehrend");
  meldeFehler(P, digital(3), T0 + 3 * TAG); meldeFehler(P, digital(4), T0 + 4 * TAG);
  assert.equal(baueCluster(P, U, T0 + 4 * TAG)[0].status, "gestuetzt");
});
test("Drei Fehler am selben Tag in derselben Aufgabe sind noch kein wiederkehrendes Muster", () => {
  const P = leerePerf();
  for (let i = 0; i < 3; i++) meldeFehler(P, digital(0, { schritt: `3x-2x-${5 + i}`, zeit: T0 }), T0);
  assert.notEqual(baueCluster(P, U, T0)[0].status, "wiederkehrend");
});
test("Digital und Scan: gleicher Fehler landet im selben Cluster (ein Gedächtnis)", () => {
  const P = leerePerf();
  meldeFehler(P, digital(0), T0);
  const s = scanDiagnose({ zeilen: ["3x-(2x-5)", "3x-2x-5", "x-5"], zeilenStatus: ["ok", "ok", "ok"], lesbarkeit: 8, scanId: "scan1", kontext: "klammern" });
  assert.ok(s.vorschlag, "Vorschlag vorhanden");
  assert.equal(s.vorschlag.untertyp, "minus_klammer");
  const r = meldeFehler(P, { ...s.vorschlag, nutzerId: U, zeit: T0 + TAG }, T0 + TAG);
  assert.equal(r.neu, true);
  const c = baueCluster(P, U, T0 + TAG);
  assert.equal(c.length, 1);
  assert.deepEqual([c[0].quellen.digital, c[0].quellen.scan], [1, 1]);
});
test("Gleiches Ergebnis, andere Ursache → getrennte Cluster", () => {
  const P = leerePerf();
  meldeFehler(P, digital(0), T0);
  meldeFehler(P, digital(1, { untertyp: "ableiten", aufgabe: { id: "a1", text: "", kontext: "ableiten", schwierigkeit: 1 } }), T0 + TAG);
  assert.equal(baueCluster(P, U, T0 + TAG).length, 2);
});
test("Scan: unsichere Lesbarkeit → unsicher, nicht im bestätigten Cluster", () => {
  const P = leerePerf();
  const s = scanDiagnose({ zeilen: ["3x-(2x-5)", "3x-2x-5"], zeilenStatus: ["ok", "ok"], lesbarkeit: 3, scanId: "s2" });
  const r = meldeFehler(P, { ...s.vorschlag, nutzerId: U, zeit: T0 }, T0);
  assert.equal(r.ereignis.status, "unsicher");
  assert.equal(baueCluster(P, U, T0).length, 0);
  assert.equal(zurKlaerung(P, U).length, 1);
  /* Nutzer bestätigt → zählt */
  assert.ok(ereignisKorrigieren(P, U, r.ereignis.id, { status: "bestaetigt" }));
  assert.equal(baueCluster(P, U, T0).length, 1);
});
test("Scan: unleserliche Zeile wird übersprungen, richtige Rechnung erzeugt keinen Fehler, Mathilda-Meldung ohne Beleg wird nicht gespeichert", () => {
  const s1 = scanDiagnose({ zeilen: ["3x-(2x-5)", "???", "3x-2x+5", "x+5"], zeilenStatus: ["ok", "unklar", "ok", "ok"], lesbarkeit: 7 });
  assert.equal(s1.vorschlag, null);
  assert.deepEqual(s1.pruefung.unklar, [1]);
  const s2 = scanDiagnose({ zeilen: ["3x-(2x-5)", "3x-2x+5"], zeilenStatus: ["ok", "ok"], lesbarkeit: 8, mathildaFehler: { zeile: 2, was: "Vorzeichen" } });
  assert.equal(s2.vorschlag, null);
  assert.match(s2.hinweis, /nicht bestätigen/);
});
test("Scan: bleibt die Ursache offen, kann die Person den Typ selbst wählen → bestätigtes Ereignis", () => {
  const P = leerePerf();
  const s = scanDiagnose({ zeilen: ["2(x-4)-3(x-1)", "2x-8-3x-3"], zeilenStatus: ["ok", "ok"], lesbarkeit: 9, scanId: "s7", kontext: "terme" });
  assert.equal(s.vorschlag, null);
  const r = meldeFehler(P, { ...s.entwurf, nutzerId: U, typ: "vorzeichen", untertyp: "zusammenfassen", konfidenz: 1, status: "bestaetigt" }, T0);
  assert.equal(r.neu, true);
  assert.equal(r.ereignis.status, "bestaetigt");
  assert.equal(baueCluster(P, U, T0)[0].typ, "vorzeichen");
  assert.equal(meldeFehler(P, { ...s.entwurf, nutzerId: U, typ: "vorzeichen", untertyp: "zusammenfassen", konfidenz: 1, status: "bestaetigt" }, T0).neu, false, "idempotent");
});
test("Scan: nur Folgefehler wird nicht als zweiter Fehler gespeichert", () => {
  const s = scanDiagnose({ zeilen: ["3x-(2x-5)", "3x-2x-5", "x-5", "x-5+1"], zeilenStatus: ["ok", "ok", "ok", "ok"], lesbarkeit: 9, scanId: "s3" });
  assert.equal(s.pruefung.index, 1);
  assert.equal(s.vorschlag.schritt, "3x-2x-5");
});
test("KI-Diagnose wird validiert: erfundene Typen fliegen raus, Konfidenz gedeckelt", () => {
  const v = validiereDiagnose({ hypothesen: [{ typ: "erfunden", konfidenz: 0.9 }, { typ: "vorzeichen", untertyp: "gibtsnicht", konfidenz: 1, begruendung: "x" }] });
  assert.equal(v.length, 1);
  assert.equal(v[0].untertyp, "allgemein");
  assert.ok(v[0].konfidenz <= 0.8);
});
test("Nutzertrennung: Ereignisse und Cluster nur für den eigenen Nutzer", () => {
  const P = leerePerf();
  meldeFehler(P, digital(0), T0);
  meldeFehler(P, digital(0, { nutzerId: "nutzer-b" }), T0);
  assert.equal(baueCluster(P, U, T0)[0].haeufigkeit, 1);
  assert.equal(baueCluster(P, "nutzer-c", T0).length, 0);
  const id = P.ereignisse.find((e) => e.nutzerId === "nutzer-b").id;
  assert.equal(ereignisKorrigieren(P, U, id, { status: "verworfen" }), false, "fremdes Ereignis nicht änderbar");
  loescheNutzerdaten(P, U);
  assert.equal(exportiere(P, "nutzer-b").ereignisse.length, 1);
  assert.equal(exportiere(P, U).ereignisse.length, 0);
});
test("Cluster teilen und Zuordnung korrigieren", () => {
  const P = leerePerf();
  for (let i = 0; i < 3; i++) meldeFehler(P, digital(i), T0 + i * TAG);
  const c = baueCluster(P, U, T0 + 3 * TAG)[0];
  assert.ok(clusterTeilen(P, U, c.id, [c.ereignisIds[0]], T0 + 3 * TAG));
  assert.equal(baueCluster(P, U, T0 + 3 * TAG).length, 2);
  const id = c.ereignisIds[1];
  assert.ok(ereignisKorrigieren(P, U, id, { typ: "vorzeichen", untertyp: "umstellen" }));
  assert.equal(baueCluster(P, U, T0 + 3 * TAG).length, 3);
});
test("Fehlerquote: nur vergleichbare Aufgaben, weniger geübt ≠ Verbesserung", () => {
  const P = leerePerf();
  const gib = (i, ok, t) => meldeAufgabe(P, { nutzerId: U, id: `q${i}`, zeit: t, testet: ["vorzeichen"], kontext: "klammern", schwierigkeit: 2, ok, fehlerTyp: ok ? null : "vorzeichen" });
  assert.equal(verlaufAussage(P, U, "vorzeichen", T0).art, "zuWenig");
  const jetzt = T0 + 40 * TAG;
  /* alte Phase: viele Aufgaben, viele Fehler; neue Phase: wenig Aufgaben, kaum Fehler */
  for (let i = 0; i < 8; i++) gib(i, i % 2 === 0, jetzt - 26 * TAG + i * 1000);
  for (let i = 8; i < 16; i++) gib(i, true, jetzt - 20 * TAG + i * 1000);
  const v = verlaufAussage(P, U, "vorzeichen", jetzt);
  assert.ok(["seltener", "seltenerAberWeniger"].includes(v.art), v.art);
  assert.equal(fehlerquote(P, U, "vorzeichen").aufgaben, 16);
  /* andere Aufgaben (anderer Typ) gehen nicht in die Quote ein */
  meldeAufgabe(P, { nutzerId: U, id: "z", zeit: jetzt, testet: ["pqformel"], ok: false, fehlerTyp: "pqformel" });
  assert.equal(fehlerquote(P, U, "vorzeichen").aufgaben, 16);
});
test("Übernahme der alten Beobachtungen ist idempotent", () => {
  const P = leerePerf();
  const alt = [{ id: "1", typ: "vorzeichen", thema: "gleichungen", zeit: T0 }, { id: "2", typ: "pqformel", thema: "gleichungen", zeit: T0 }];
  assert.equal(importiereAlteBeobachtungen(P, U, alt), 2);
  assert.equal(importiereAlteBeobachtungen(P, U, alt), 0);
});
test("Rückfall nach längerer Pause", () => {
  const P = leerePerf();
  meldeFehler(P, digital(0), T0); meldeFehler(P, digital(20), T0 + 20 * TAG);
  assert.equal(rueckfall(P, U, "vorzeichen").nachTagen, 20);
});
test("Taxonomie: alle Hauptkategorien vorhanden, ereignisBauen lehnt unbekannte Quelle ab", () => {
  assert.ok(Object.values(FEHLERTYPEN_TAX).every((t) => ["fokus", "verfahren", "verstaendnis"].includes(t.haupt)));
  assert.equal(ereignisBauen({ quelle: "x" }).ok, false);
});

/* ---------------- Training und Badges ---------------- */
const lösen = (P, runde, jetzt) => {
  runde.aufgaben.forEach((s, pos) => { antworten(P, U, runde.id, pos, aufgabeVon(s.id).korrekt, {}, jetzt); });
};
test("Runde: genau drei Aufgaben, falsche Antwort schließt nicht ab", () => {
  const P = leerePerf();
  const { runde } = starteRunde(P, U, "vorzeichen", {}, T0);
  assert.equal(runde.aufgaben.length, RUNDE_GROESSE);
  const a = aufgabeVon(runde.aufgaben[0].id);
  const r = antworten(P, U, runde.id, 0, a.fehlerSchritt, {}, T0);
  assert.equal(r.bewertung.art, "typisch");
  assert.equal(runde.aufgaben[0].status, "offen");
  assert.equal(runde.status, "laufend");
});
test("Runde: leere/unlesbare Eingabe zählt nicht, Wiederholung derselben Anfrage zählt nicht doppelt", () => {
  const P = leerePerf();
  const { runde } = starteRunde(P, U, "vorzeichen", {}, T0);
  antworten(P, U, runde.id, 0, "", {}, T0);
  antworten(P, U, runde.id, 0, "???", {}, T0);
  assert.equal(runde.aufgaben[0].versuche.length, 0);
  const a = aufgabeVon(runde.aufgaben[0].id);
  antworten(P, U, runde.id, 0, a.fehlerSchritt, { anfrageId: "r1" }, T0);
  antworten(P, U, runde.id, 0, a.fehlerSchritt, { anfrageId: "r1" }, T0);
  assert.equal(runde.aufgaben[0].versuche.length, 1);
});
test("Starten ist idempotent: laufende Runde wird fortgesetzt", () => {
  const P = leerePerf();
  const a = starteRunde(P, U, "vorzeichen", {}, T0), b = starteRunde(P, U, "vorzeichen", {}, T0 + 5);
  assert.equal(b.fortgesetzt, true); assert.equal(a.runde.id, b.runde.id); assert.equal(P.runden.length, 1);
});
test("Hilfe zählt nicht als Fehler, Lösung ansehen = kein Erfolg, Abbruch = kein Erfolg", () => {
  const P = leerePerf();
  const { runde } = starteRunde(P, U, "vorzeichen", {}, T0);
  assert.equal(hilfeNehmen(P, U, runde.id, 0, T0).stufe, 1);
  loesungAufdecken(P, U, runde.id, 0, T0);
  lösen(P, runde, T0); // Rest lösen
  assert.equal(runde.status, "nicht_geschafft");
  const r2 = starteRunde(P, U, "vorzeichen", {}, T0 + 10).runde;
  assert.ok(rundeAbbrechen(P, U, r2.id, T0 + 11));
  assert.equal(trainingsStand(P, U, "vorzeichen").erfolgreicheRunden, 0);
});
test("Drei erfolgreiche Runden → genau ein Badge; wiederholte Requests erzeugen kein zweites", () => {
  const P = leerePerf();
  let neu = 0;
  for (let i = 0; i < 4; i++) {
    const { runde } = starteRunde(P, U, "vorzeichen", {}, T0 + i * 100);
    runde.aufgaben.forEach((s, pos) => {
      const r = antworten(P, U, runde.id, pos, aufgabeVon(s.id).korrekt, {}, T0 + i * 100 + pos);
      antworten(P, U, runde.id, pos, aufgabeVon(s.id).korrekt, {}, T0 + i * 100 + pos);   // doppelt
      if (r.neuesBadge) neu++;
    });
    if (i === 1) assert.equal(badgesVon(P, U).length, 0, "nach zwei Runden noch kein Badge");
  }
  assert.equal(neu, 1);
  assert.equal(badgesVon(P, U).length, 1);
  assert.equal(badgesVon(P, "anderer").length, 0);
  assert.equal(badgesVon(P, U)[0].name, "Vorzeichen-Profi");
  assert.equal(badgesVon(P, U)[0].aufgaben, 9);
});
test("Rotation: aufeinanderfolgende Runden wiederholen nicht dieselben Aufgaben", () => {
  const P = leerePerf();
  const ids = [];
  for (let i = 0; i < 3; i++) {
    const { runde } = starteRunde(P, U, "vorzeichen", {}, T0 + i * 100);
    ids.push(...runde.aufgaben.map((s) => s.id));
    lösen(P, runde, T0 + i * 100);
  }
  assert.equal(new Set(ids).size, 9, ids.join(","));
});
test("Fremde Runde ist nicht bedienbar", () => {
  const P = leerePerf();
  const { runde } = starteRunde(P, U, "vorzeichen", {}, T0);
  assert.equal(antworten(P, "fremd", runde.id, 0, "x", {}, T0).ok, false);
  assert.equal(hilfeNehmen(P, "fremd", runde.id, 0).ok, false);
});
test("Trainingsfehler fließen nicht ins Fehlerprofil", () => {
  const P = leerePerf();
  const { runde } = starteRunde(P, U, "vorzeichen", {}, T0);
  antworten(P, U, runde.id, 0, aufgabeVon(runde.aufgaben[0].id).fehlerSchritt, {}, T0);
  assert.equal(P.ereignisse.length, 0);
});
test("Training nur für Typen mit geprüften Aufgaben", () => {
  assert.equal(starteRunde(leerePerf(), U, "pqformel").ok, false);
});
test("Training nach Profil: Vorschlag nur mit echten Ereignissen, Begründung nennt beide Kanäle", () => {
  const P = leerePerf();
  meldeFehler(P, digital(0), T0);
  const s = scanDiagnose({ zeilen: ["3x-(2x-5)", "3x-2x-5"], zeilenStatus: ["ok", "ok"], lesbarkeit: 8, scanId: "s9", kontext: "klammern" });
  meldeFehler(P, { ...s.vorschlag, nutzerId: U, zeit: T0 + TAG }, T0 + TAG);
  const v = trainingsVorschlaege(P, U, T0 + TAG);
  assert.equal(v.length, 1);
  assert.match(v[0].grund, /digitalen Übungen und auf deinen eingescannten Blättern/);
  assert.equal(trainingsVorschlaege(P, "leer", T0).length, 0);
});
test("Training wirkt sich erst nach genug neuen Aufgaben auf eine Aussage aus", () => {
  const P = leerePerf();
  for (let i = 0; i < 3; i++) { const { runde } = starteRunde(P, U, "vorzeichen", {}, T0 + i * 10); lösen(P, runde, T0 + i * 10 + 5); }
  assert.equal(trainingsEffekt(P, U, "vorzeichen").art, "offen");
});

/* ---------------- Foto-Lesung und Testdaten ---------------- */
test("Foto-Lesung wird validiert: Format, Mindestzahl Zeilen, Unklar-Markierung, mehrere Wege senken die Lesbarkeit", () => {
  assert.equal(validiereScanLesung(null).ok, false);
  assert.equal(validiereScanLesung({ zeilen: "x" }).ok, false);
  assert.equal(validiereScanLesung({ zeilen: ["3x"] }).ok, false);
  const v = validiereScanLesung({ zeilen: ["3x-(2x-5)", "", "3x-2x-5"], zeilenStatus: ["ok", "ok", "unklar"], lesbarkeit: 99, mehrereWege: true, durchgestrichen: ["x=1"], mathildaFehler: { zeile: 2, was: "v", richtig: "x+5" } });
  assert.equal(v.ok, true);
  assert.deepEqual(v.lesung.zeilen, ["3x-(2x-5)", "3x-2x-5"]);
  assert.deepEqual(v.lesung.zeilenStatus, ["ok", "unklar"]);
  assert.equal(v.lesung.lesbarkeit, 7);
  assert.deepEqual(v.lesung.durchgestrichen, ["x=1"]);
});
test("Durchgestrichenes landet nie in der Rechenkette: ein durchgestrichener Fehlversuch erzeugt keinen Fehler", () => {
  const v = validiereScanLesung({ zeilen: ["3x-(2x-5)", "3x-2x+5", "x+5"], durchgestrichen: ["3x-2x-5"], lesbarkeit: 8 });
  const s = scanDiagnose({ ...v.lesung, scanId: "d1" });
  assert.equal(s.vorschlag, null);
  assert.equal(s.pruefung.status, "ok");
});
test("Texteingabe: Fragezeichen markiert unleserliche Zeilen; alle Beispiele laufen ohne Ausnahme durch", () => {
  const z = zeilenAusText("a\n? b\nc");
  assert.deepEqual(z.zeilenStatus, ["ok", "unklar", "ok"]);
  for (const b of SCAN_BEISPIELE) {
    const e = zeilenAusText(b.zeilen);
    assert.doesNotThrow(() => scanDiagnose({ ...e, lesbarkeit: 9, kontext: b.kontext }), b.id);
  }
  const erwartet = { klammer: "vorzeichen", umformung: "vorzeichen", richtig: null, unleserlich: null, offen: null, kopfrechnen: null };
  for (const b of SCAN_BEISPIELE) {
    const s = scanDiagnose({ ...zeilenAusText(b.zeilen), lesbarkeit: 9, kontext: b.kontext });
    assert.equal(s.vorschlag?.typ ?? null, erwartet[b.id], b.id);
  }
});
test("Testdaten: laufen durch die echte Aufnahme, zwei Kanäle, getrennte Cluster, ein Fall zur Klärung, lassen sich restlos entfernen", () => {
  const P = leerePerf();
  assert.ok(ladeTestdaten(P, U, T0) > 0);
  const c = baueCluster(P, U, T0);
  const klammer = c.find((x) => x.untertyp === "minus_klammer");
  assert.equal(klammer.status, "gestuetzt");
  assert.ok(klammer.quellen.digital >= 3 && klammer.quellen.scan >= 2);
  assert.ok(c.find((x) => x.untertyp === "ableiten"));
  assert.equal(c.find((x) => x.typ === "pqformel").status, "einzeln");
  assert.equal(zurKlaerung(P, U).length, 1);
  assert.equal(verlaufAussage(P, U, "vorzeichen", T0).art, "seltener");
  assert.equal(ladeTestdaten(P, U, T0), 0, "zweites Laden fügt nichts doppelt ein");
  assert.ok(P.ereignisse.every((e) => e.demo) && P.aufgaben.every((a) => a.demo));
  loescheTestdaten(P, U);
  assert.equal(P.ereignisse.length + P.aufgaben.length, 0);
});

test("Vorschlag: verschiedene Untertypen werden nicht zu einem Muster addiert", () => {
  const P = leerePerf();
  meldeFehler(P, digital(0), T0);
  meldeFehler(P, digital(1, { untertyp: "ableiten", aufgabe: { id: "a1", text: "", kontext: "ableiten", schwierigkeit: 1 } }), T0 + TAG);
  meldeFehler(P, digital(2, { untertyp: "umstellen", aufgabe: { id: "a2", text: "", kontext: "umformung", schwierigkeit: 1 } }), T0 + 2 * TAG);
  assert.equal(trainingsVorschlaege(P, U, T0 + 2 * TAG).length, 0, "drei Einzelbeobachtungen mit drei Ursachen sind kein Muster");
  meldeFehler(P, digital(3), T0 + 3 * TAG);
  const v = trainingsVorschlaege(P, U, T0 + 3 * TAG);
  assert.equal(v.length, 1); assert.equal(v[0].anzahl, 2); assert.equal(v[0].status, "moeglich");
});
