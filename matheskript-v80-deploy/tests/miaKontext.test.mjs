/* Mia: Systemprompt, Korrektur-JSON, Entschlüsselung, mündliche Themen */
import test from "node:test";
import assert from "node:assert/strict";
import { miaSystem, korrekturLesen, entschluesselnLesen, korrekturPrompt, MUENDLICH_THEMEN, muendlichRegeln, abiAuszug, OPERATOREN, REGELN_MIA } from "../src/miaKontext.js";
import { aufgabeErzeugen } from "../src/abiGeneratoren.js";

const aufgabe = aufgabeErzeugen("ana-tangente", 7);

test("Systemprompt: Mia, Abi-Profil, Modus-Regeln", () => {
  const s = miaSystem({ modus: "korrigieren", abiProfil: { land: "BW", niveau: "erhoeht", jahr: 2027 }, heute: "2026-10-21" });
  assert.ok(s.startsWith("Du bist Mia"));
  assert.ok(s.includes("Leistungsfach") && s.includes("196 Tagen") && s.includes("Abi-Korrektur"));
  assert.ok(miaSystem({ modus: "fragen" }).includes("Noch kein Abi-Profil"));
  const m = miaSystem({ modus: "muendlich", muendlich: { thema: "m-binom", phase: "gespraech" } });
  assert.ok(m.includes("Prüfungsgespräch") && m.includes("genau EINE Frage") && m.includes("0,302"));
  const f = miaSystem({ modus: "fragen", aufgabe });
  const teilAufgabe = f.slice(f.indexOf("arbeitet gerade an dieser Abi-Aufgabe"));
  assert.ok(teilAufgabe.includes("Erwartungshorizont") && !teilAufgabe.includes("$"));
  assert.ok(REGELN_MIA.includes("Regel A5"));
  assert.ok(abiAuszug({ land: "NW", niveau: "grundlegend", form: "schriftlich", hilfsmittel: "CAS" }, null, "2026-10-21").includes("Grundkurs"));
});

test("Korrektur mit Aufgabe: BE gedeckelt, fehlende Teile 0, Summe neu gerechnet", () => {
  const r = korrekturLesen({ lesbar: true, teile: [{ b: "a)", be: 9, kommentar: "ok" }], staerke: "Sauber", hebel: ["eins", "zwei", "drei"] }, aufgabe);
  assert.equal(r.teile.length, aufgabe.teile.length);
  assert.equal(r.teile[0].be, aufgabe.teile[0].be); assert.equal(r.teile[0].urteil, "voll");
  assert.equal(r.teile[1].be, 0); assert.equal(r.teile[1].urteil, "fehlt"); assert.ok(r.teile[1].kommentar.length > 0);
  assert.equal(r.summe, aufgabe.teile[0].be); assert.equal(r.max, 5); assert.equal(r.hebel.length, 2);
  assert.deepEqual(korrekturLesen({ lesbar: false, hinweis: "unscharf" }, aufgabe), { lesbar: false, hinweis: "unscharf" });
  assert.throws(() => korrekturLesen(null, aufgabe));
  assert.ok(korrekturPrompt(aufgabe).includes("Erwartungshorizont"));
});

test("Korrektur eigener Aufgabe: Teile vom Modell, BE zwischen 0 und max", () => {
  const r = korrekturLesen({ teile: [{ b: "a", be: 7, max: 4 }, { b: "b", be: -2, max: 3, urteil: "quatsch" }] });
  assert.deepEqual(r.teile.map((t) => [t.be, t.max, t.urteil]), [[4, 4, "voll"], [0, 3, "fehlt"]]);
  assert.equal(r.summe, 4); assert.equal(r.max, 7);
  assert.throws(() => korrekturLesen({ teile: [] }));
});

test("Entschlüsseln: Plan höchstens vier Schritte, Zeit aus BE", () => {
  const r = entschluesselnLesen({ thema: "Tangente", sachgebiet: "analysis", teile: [{ b: "a", operator: "bestimmen", be: 3, plan: ["1", "2", "3", "4", "5"] }, { b: "b", operator: "zeigen", be: 2 }] });
  assert.equal(r.teile[0].plan.length, 4); assert.equal(r.be, 5); assert.equal(r.zeit, 15);
  assert.equal(entschluesselnLesen({ lesbar: false }).lesbar, false);
});

test("Mündliche Themen: sauber gesetzt (A5, gerade $-Zahl), Gespräch im anderen Gebiet, Regeln je Phase", () => {
  const verboten = [/(^|[^0-9,])1x/, /x\^1(?![0-9])/, /\+ 0(?![0-9,])/, /\+ −/, /− −/];
  for (const t of MUENDLICH_THEMEN) {
    assert.notEqual(t.gebiet, t.gespraech, t.id);
    for (const z of [...t.auftrag, t.kern]) {
      for (const r of verboten) assert.ok(!r.test(z), `${t.id}: ${z}`);
      assert.equal((z.match(/\$/g) || []).length % 2, 0, `${t.id}: ${z}`);
    }
    for (const p of ["vortrag", "gespraech", "rueckmeldung"]) assert.ok(muendlichRegeln(t, p).includes(t.titel));
  }
  assert.ok(OPERATOREN.length >= 10);
});
