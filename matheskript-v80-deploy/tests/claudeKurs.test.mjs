/* Kurs „Mathe lernen mit Claude“: Daten vollständig und regelkonform */
import { test } from "node:test";
import assert from "node:assert/strict";
import { LEKTIONEN, KURSE, GRUNDREGELN, lektion, kurs, kiText, kurzFuer, schritteFuer, naechsteLektion, anteilFertig, gesamtMinuten, promptFuellen, WEGE, ALTERSSTUFEN, wegeFuerAlter, weg } from "../src/claudeKursDaten.js";

const STUFEN = KURSE.map((k) => ({ id: k.beispiele, name: k.titel }));

test("Zehn Lektionen, durchnummeriert, eindeutige Kennungen", () => {
  assert.equal(LEKTIONEN.length, 10);
  LEKTIONEN.forEach((l, i) => assert.equal(l.nr, i + 1, l.id));
  assert.equal(new Set(LEKTIONEN.map((l) => l.id)).size, 10);
  assert.equal(GRUNDREGELN.length, 10);
  assert.deepEqual(KURSE.map((k) => k.id), ["gemini", "claude"]);
  assert.deepEqual(KURSE.map((k) => k.alter), ["ab 16", "ab 18"]);
  assert.equal(kurs("x").id, "claude");
});

test("Jede Lektion ist vollständig: Leitfrage, Text, Prompts, Beispiel je Stufe, Fehler, Auftrag, Mathilda", () => {
  for (const l of LEKTIONEN) {
    assert.ok(l.titel && l.frage.endsWith("?"), `${l.id}: Leitfrage endet mit ?`);
    for (const k of KURSE) {
      assert.ok(kurzFuer(l, k.id).length >= 3, `${l.id}/${k.id}: drei Absätze`);
      if (l.id === "zugang") assert.equal(schritteFuer(l, k.id).length, 4, `${l.id}/${k.id}: vier Schritte`);
      else assert.equal(schritteFuer(l, k.id), null);
    }
    assert.ok(l.prompts.length >= 2, `${l.id}: Prompt-Vorlagen`);
    for (const p of l.prompts) assert.ok(p.titel && p.text.length > 40 && p.wann, `${l.id}: Prompt ${p.titel}`);
    for (const s of STUFEN) {
      const b = l.beispiel[s.id];
      assert.ok(b && b.quelle && b.aufgabe && b.merke, `${l.id}/${s.id}: Beispiel`);
      assert.ok(b.gespraech.length >= 4, `${l.id}/${s.id}: Gespräch mit mindestens vier Zeilen`);
      assert.equal(b.gespraech[0].wer, "du", `${l.id}/${s.id}: Schüler beginnt`);
      for (const z of b.gespraech) assert.ok(["du", "claude"].includes(z.wer) && z.text.length > 5);
    }
    assert.ok(l.fehler.length >= 2 && l.fehler.every((f) => f.so && f.besser), `${l.id}: So nicht – so besser`);
    assert.equal(l.auftrag.length, 3, `${l.id}: drei Aufträge`);
    assert.ok(l.mathilda.length > 40, `${l.id}: Mathilda-Einstieg`);
    assert.ok(l.dauer >= 5 && l.dauer <= 12);
  }
});

test("Oberstufen-Beispiele kommen ab Lektion 2 aus dem Buch Ableitungen, Mittelstufe aus eigenen Themen", () => {
  for (const l of LEKTIONEN.slice(1)) {
    assert.match(l.beispiel.ober.quelle, /Buch Ableitungen · S\. \d+/, `${l.id}: Oberstufe mit Buchseite`);
    assert.doesNotMatch(l.beispiel.mittel.quelle, /Buch Ableitungen/, `${l.id}: Mittelstufe eigene Quelle`);
  }
});

test("Kein empfohlener Prompt verlangt die fertige Lösung", () => {
  const verboten = /^(löse|lös|berechne mir|rechne mir|was ist die lösung)/i;
  for (const l of LEKTIONEN) {
    for (const p of l.prompts) assert.doesNotMatch(p.text, verboten, `${l.id}: ${p.titel}`);
    assert.doesNotMatch(l.mathilda, verboten, `${l.id}: Mathilda`);
    for (const z of l.beispiel.mittel.gespraech) if (z.wer === "du") assert.doesNotMatch(z.text, /^Löse mir/, `${l.id}: Mittelstufe`);
  }
  /* Einzige Ausnahme: Lektion 2 zeigt den schlechten Prompt bewusst – und danach den guten */
  const regel = lektion("regel").beispiel.ober.gespraech;
  assert.match(regel[0].text, /^Löse mir/);
  assert.ok(regel.some((z) => z.wer === "du" && /rechne nichts aus/i.test(z.text)));
});

test("Regel A5 in allen Beispieltexten: kein x^1, kein + −, kein 1x", () => {
  const texte = [];
  for (const l of LEKTIONEN) for (const s of STUFEN) for (const z of l.beispiel[s.id].gespraech) texte.push(z.text);
  for (const t of texte) {
    assert.doesNotMatch(t, /\+ −|− −|(?<![\d,.])1x\b|x\^1\b|x¹/, t.slice(0, 60));
  }
});

test("Der KI-Name wird eingesetzt, nirgends steht der falsche Name fest", () => {
  assert.equal(kiText("{KI} erklärt, {KI} fragt", "Gemini"), "Gemini erklärt, Gemini fragt");
  for (const l of LEKTIONEN.slice(1)) {
    const alles = JSON.stringify({ frage: l.frage, kurz: l.kurz, prompts: l.prompts, beispiel: l.beispiel, fehler: l.fehler, auftrag: l.auftrag, mathilda: l.mathilda });
    assert.doesNotMatch(alles, /Claude|Gemini/, `${l.id}: KI-Name nur über {KI}`);
  }
  const z = lektion("zugang");
  assert.match(JSON.stringify(z.kurz.claude), /ab 18/);
  assert.match(JSON.stringify(z.kurz.gemini), /ab 16/);
  assert.match(JSON.stringify(z.schritte.gemini), /gemini\.google\.com/);
  assert.match(JSON.stringify(z.schritte.claude), /claude\.ai/);
});

test("Hilfsfunktionen", () => {
  assert.equal(naechsteLektion({}).id, "zugang");
  assert.equal(naechsteLektion({ zugang: true, regel: true }).id, "verstehen");
  assert.equal(naechsteLektion(Object.fromEntries(LEKTIONEN.map((l) => [l.id, true]))).id, "system");
  assert.equal(anteilFertig({ zugang: true }), 0.1);
  assert.ok(gesamtMinuten() >= 60 && gesamtMinuten() <= 100);
  assert.equal(promptFuellen("Ich bin in [Klasse] und lerne [Thema]", { Klasse: "Klasse 9" }), "Ich bin in Klasse 9 und lerne [Thema]");
  assert.equal(lektion("gibtsnicht"), null);
});

test("Drei Wege: Mathilda AI für alle, Gemini ab 16, Claude ab 18 – mit Voraussetzungen und Ziel", () => {
  assert.deepEqual(WEGE.map((w) => w.id), ["mathilda", "gemini", "claude"]);
  assert.deepEqual(WEGE.map((w) => w.alter), ["für alle", "ab 16", "ab 18"]);
  for (const w of WEGE) {
    assert.ok(w.voraussetzungen.length >= 3 && w.gutZuWissen && w.knopf && w.ziel.ansicht, w.id);
    for (const v of w.voraussetzungen) assert.ok(v.length > 20, `${w.id}: Voraussetzung zu knapp`);
  }
  /* Ziele: Kurse zeigen auf die Kurs-Ansichten aus KURSE, Mathilda auf den Chat */
  for (const k of KURSE) assert.equal(weg(k.id).ziel.ansicht, k.ansicht);
  assert.deepEqual(weg("mathilda").ziel, { ansicht: "analyse", foto: "chat" });
  /* Altersregeln stehen in den Voraussetzungen */
  assert.match(weg("claude").voraussetzungen.join(" "), /18/);
  assert.match(weg("gemini").voraussetzungen.join(" "), /16/);
  assert.match(weg("mathilda").voraussetzungen.join(" "), /unter 16/i);
  assert.match(weg("mathilda").voraussetzungen.join(" "), /Elternteil/);
});

test("Empfehlung nach Alter: unter 16 nur Mathilda, 16–17 Gemini und Mathilda, ab 18 alle drei – Claude nie unter 18", () => {
  assert.deepEqual(ALTERSSTUFEN.map((s) => s.id), ["u16", "16", "18"]);
  assert.deepEqual(wegeFuerAlter("u16"), ["mathilda"]);
  assert.deepEqual(wegeFuerAlter("16"), ["gemini", "mathilda"]);
  assert.deepEqual(wegeFuerAlter("18"), ["claude", "gemini", "mathilda"]);
  assert.deepEqual(wegeFuerAlter(null), []);
  for (const s of ["u16", "16"]) assert.ok(!wegeFuerAlter(s).includes("claude"), s);
});
