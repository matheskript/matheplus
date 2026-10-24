/* Gleichungen lernen, Modus „Üben“ (uebenSchritte in src/gleichKurs.js): aus den Zeilen einer Aufgabe wird je
   nicht-automatischer Umformung ein Schritt mit genau einer richtigen und höchstens drei falschen Möglichkeiten
   (Form aus uebenKern.uebenSchritt); Hinweise „<Fehlername>. <Warum>“ in beiden Sprachen, Schlüssel je Schritt
   verschieden, automatische Schritte („Exponenten vergleichen“) zählen nicht. */
import test from "node:test";
import assert from "node:assert/strict";
import { FEHLERART, REITER, STUFEN, fehlerName, neueAufgabe, reiterNeu, uebenFrage, uebenSchritte, uebenSchrittZu } from "../src/gleichKurs.js";
import { UEBEN_MODI } from "../src/uebenKern.js";
import { aufAnhieb, sichtbareOptionen } from "../src/uebenKern.js";

function seed(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const N = 30;
for (const st of STUFEN) {
  test(`${st}: Üben-Schritte – je Umformung eine richtige, ≤ 3 falsche, Hinweise, Schlüssel verschieden`, () => {
    const rng = seed(st.charCodeAt(1) * 13);
    for (let i = 0; i < N; i++) {
      const a = neueAufgabe(st, { rng });
      for (const en of [false, true]) {
        const schritte = uebenSchritte(a, { zufall: rng, en });
        const erwartet = a.zeilen.filter((z) => z.op && !z.op.auto);
        assert.equal(schritte.length, erwartet.length, `${st}: ${schritte.length} Schritte für ${erwartet.length} Umformungen`);
        assert.ok(schritte.length >= 1);
        assert.deepEqual(schritte.map((s) => s.nr), schritte.map((_, k) => k + 1));
        const alleSchluessel = new Set();
        schritte.forEach((s, k) => {
          const z = a.zeilen[s.zeile];
          assert.ok(z.op && !z.op.auto, `${st}: Schritt ${k + 1} zeigt auf eine Zeile ohne Wahl`);
          assert.equal(uebenSchrittZu(schritte, s.zeile), s);
          assert.equal(s.op, z.op);
          assert.equal(s.frage, uebenFrage(z.op, en));
          assert.ok(s.frage.length > 8);
          /* optionen[0] ist die richtige, dahinter die falschen – höchstens drei */
          assert.ok(s.optionen.length >= 2 && s.optionen.length <= 4, `${st}: ${s.optionen.length} Möglichkeiten`);
          assert.ok(s.optionen[0].richtig && s.optionen.slice(1).every((o) => !o.richtig));
          assert.equal(s.optionen.filter((o) => o.richtig).length, 1);
          assert.equal(s.richtig, z.auswahl.find((o) => o.richtig));
          assert.equal(s.optionen[0].wert, s.richtig);
          assert.deepEqual(s.optionen[0].wert.lang, z.op.lang);              // die richtige Karte ist die Umformung der Zeile
          /* falsche in der Reihenfolge der Aufgabe, jede mit Fehlerart und Hinweis in der gewünschten Sprache */
          const falscheAuswahl = z.auswahl.filter((o) => !o.richtig).slice(0, 3);
          assert.deepEqual(s.optionen.slice(1).map((o) => o.wert), falscheAuswahl);
          for (const o of s.optionen.slice(1)) {
            assert.ok(FEHLERART[o.art], `${st}: Fehlerart ${o.art}`);
            assert.ok(o.hinweis.startsWith(`${fehlerName(o.art, en)}. `), `${st}: Hinweis „${o.hinweis}“`);
            assert.ok(o.hinweis.length > fehlerName(o.art, en).length + 12, `${st}: Hinweis zu kurz „${o.hinweis}“`);
            assert.ok(o.hinweis.includes(o.wert.warum[en ? "en" : "de"]));
            assert.ok(!/ -[0-9x(]/.test(o.hinweis), `${st}: Bindestrich statt Minus in „${o.hinweis}“`);
            assert.equal(typeof o.wert.lang[en ? "en" : "de"], "string");
          }
          /* Schlüssel: innerhalb des Schritts und über alle Schritte verschieden */
          for (const o of s.optionen) { assert.ok(!alleSchluessel.has(o.key), `${st}: Schlüssel ${o.key} doppelt`); alleSchluessel.add(o.key); }
          /* Jede Anzeigegröße enthält die richtige genau einmal */
          for (const k2 of [2, 3, 4]) assert.equal(sichtbareOptionen(s, k2).filter((o) => o.richtig).length, 1);
        });
      }
    }
  });
}

test("Stufe 7, 2^x = 32: der automatische Schritt „Exponenten vergleichen“ zählt nicht", () => {
  const rng = seed(77);
  let gesehen = 0;
  for (let i = 0; i < 200 && gesehen < 5; i++) {
    const a = neueAufgabe("s7", { rng });
    if (!a.zeilen.some((z) => z.op && z.op.auto)) continue;
    gesehen++;
    const schritte = uebenSchritte(a, { zufall: rng });
    assert.equal(schritte.length, a.zeilen.filter((z) => z.op).length - 1);
    assert.ok(schritte.every((s) => s.op.art !== "vergleich"));
    assert.equal(uebenSchrittZu(schritte, a.zeilen.findIndex((z) => z.op && z.op.auto)), null);
  }
  assert.ok(gesehen >= 5, "keine Exponentialaufgabe erzeugt");
});

test("Reiter: Verstehen + die drei Modi; alte Ids „rechnen“ → Üben (geführte Auswahl), „training“ → Lernen", () => {
  assert.deepEqual(REITER, ["verstehen", ...UEBEN_MODI.map((m) => m.id)]);
  assert.equal(reiterNeu("rechnen"), "ueben");
  assert.equal(reiterNeu("training"), "lernen");
  for (const r of REITER) assert.equal(reiterNeu(r), r);
  assert.equal(reiterNeu(null), null);
  assert.equal(reiterNeu("unsinn"), null);
});

test("Fragen: Klammer und Zusammenfassen fragen „zuerst“, sonst „als Nächstes“ – in beiden Sprachen", () => {
  assert.equal(uebenFrage({ art: "klammer" }), "Was machst du zuerst?");
  assert.equal(uebenFrage({ art: "zusammen" }), "Was machst du zuerst?");
  assert.equal(uebenFrage({ art: "plus" }), "Was machst du als Nächstes?");
  assert.equal(uebenFrage({ art: "geteilt" }, true), "What do you do next?");
  assert.equal(uebenFrage({ art: "klammer" }, true), "What do you do first?");
});

test("Beispiel Stufe 2: zwei Schritte, Bilanz „auf Anhieb“ über aufAnhieb", () => {
  const rng = seed(2);
  const a = neueAufgabe("s2", { rng });
  const schritte = uebenSchritte(a, { zufall: () => 0.5 });
  assert.equal(schritte.length, 2);
  assert.equal(schritte[0].op.art, "plus");
  assert.ok(["geteilt", "mal"].includes(schritte[1].op.art));
  assert.equal(schritte[0].frage, "Was machst du als Nächstes?");
  /* ein Fehlgriff im ersten Schritt → 1 von 2 auf Anhieb */
  const falsch = { 0: [schritte[0].optionen[1].key] };
  assert.equal(aufAnhieb(falsch, 2), 1);
  assert.equal(aufAnhieb({}, 2), 2);
});

test("Position der richtigen Karte ist zufällig, aber je Schritt fest", () => {
  const rng = seed(5);
  const a = neueAufgabe("s4", { rng });
  const pos = new Set();
  for (let i = 0; i < 40; i++) for (const s of uebenSchritte(a)) {
    const sicht = sichtbareOptionen(s, 3);
    pos.add(sicht.findIndex((o) => o.richtig));
    assert.deepEqual(sichtbareOptionen(s, 3).map((o) => o.key), sicht.map((o) => o.key));
  }
  assert.ok(pos.size >= 2, `richtige Karte nur an Position ${[...pos]}`);
});
