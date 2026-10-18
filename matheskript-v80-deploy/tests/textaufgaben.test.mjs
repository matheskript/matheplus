/* Bereich „Textaufgaben übersetzen“: Generatoren (src/textaufgaben.js) gegen die Prüflogik (src/bedingungen.js) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { THEMA_IDS, THEMEN, alleZiele, anzahlBedingungen, neueTextaufgabe, pruefeAuswahl, stellenOptionen, themenFuer, woerterbuch, beispielSteckbrief, lin } from "../src/textaufgaben.js";
import { gleichwertig, lies, pruefeEingabe, STANDARD_FUNKTIONEN } from "../src/bedingungen.js";

const LAEUFE = 300;
const opt = (a) => ({ funktionen: a.funktionen || STANDARD_FUNKTIONEN, ansatz: a.eval || null });

test("acht Themen, Klassen 5 bis 13 abgedeckt", () => {
  assert.equal(THEMEN.length, 8);
  for (let k = 5; k <= 13; k++) assert.ok(THEMEN.some((t) => t.klasse[0] <= k && t.klasse[1] >= k), `Klasse ${k}`);
  assert.deepEqual(themenFuer("5-6").map((t) => t.id), ["woerter"]);
  assert.ok(themenFuer("11-13").some((t) => t.id === "steckbrief"));
  assert.equal(themenFuer("alle").length, 8);
});

test("lin schreibt nach Regel A5", () => {
  assert.equal(lin([[1, "x"], [-4, ""]]), "x - 4");
  assert.equal(lin([[-1, "x"], [0, ""]]), "-x");
  assert.equal(lin([[0, "x"], [0, ""]]), "0");
  assert.equal(lin([[3, "x"], [1, "y"]]), "3x + y");
});

for (const thema of THEMA_IDS) {
  test(`${thema}: Text, Stellen, Ziele, Denkfehler und Auswahl passen zusammen`, () => {
    for (let i = 0; i < LAEUFE; i++) {
      const a = neueTextaufgabe(thema);
      const o = opt(a);
      assert.equal(a.thema, thema);
      /* jede Stelle genau einmal im Text, Ansatz-Stelle nur mit Ansatz */
      const refs = a.teile.filter((p) => typeof p === "object" && "s" in p).map((p) => p.s).sort((x, y) => x - y);
      assert.deepEqual(refs, a.stellen.map((_, j) => j), `Stellen im Text: ${JSON.stringify(a.teile)}`);
      const mitA = a.teile.some((p) => typeof p === "object" && p.a);
      assert.equal(mitA, !!(a.ansatz && a.ansatz.t), "Ansatz-Stelle");
      if (a.ansatz) {
        assert.equal(a.ansatz.optionen.filter((x) => x.richtig).length, 1);
        assert.ok(a.ansatz.optionen.length >= 2);
        for (const x of a.ansatz.optionen) if (!x.richtig) assert.ok(x.rueck, "Rückmeldung zur falschen Ansatz-Wahl");
      }
      for (const s of a.stellen) {
        assert.ok(s.t && s.warum && s.bedeutung, "Text, Warum und Bedeutung");
        assert.ok(s.falsch.length >= 1, `Denkfehler für „${s.t}“`);
        if (!s.tippbar) { assert.ok(s.zielTex && s.zielTex.length, "nur Auswahl braucht zielTex"); continue; }
        for (const zz of s.ziel) {
          assert.ok(lies(zz.c, o), `lesbar: ${zz.c}`);
          for (const al of zz.alt || []) assert.ok(lies(al, o) && gleichwertig(al, zz.c, o) || lies(al, o), `alt lesbar: ${al}`);
        }
        /* die eigene Lösung wird erkannt */
        assert.ok(pruefeEingabe(s.ziel.map((zz) => zz.c).join("; "), s.ziel, o).ok, `Ziel erkannt: ${s.ziel.map((zz) => zz.c).join("; ")}`);
        for (const zz of s.ziel) for (const al of zz.alt || []) assert.ok(pruefeEingabe(al, [zz], o).ok, `Alternative erkannt: ${al}`);
        /* kein Denkfehler ist in Wahrheit richtig */
        for (const f of s.falsch) {
          if (!f.c) continue;
          assert.ok(lies(f.c, o), `Denkfehler lesbar: ${f.c}`);
          for (const zz of s.ziel) assert.ok(!gleichwertig(f.c, zz.c, o), `Denkfehler „${f.c}“ ist gleichwertig zu „${zz.c}“ (${s.t})`);
          const r = pruefeEingabe(f.c, s.ziel, { ...o, falsch: s.falsch });
          assert.equal(r.ok, false);
        }
        /* Auswahl: nur die richtigen Optionen ergeben ok */
        const opts = stellenOptionen(s, a.id);
        assert.ok(opts.length >= 2);
        assert.ok(pruefeAuswahl(opts, opts.filter((x) => x.richtig).map((x) => x.id)).ok);
        assert.ok(!pruefeAuswahl(opts, opts.map((x) => x.id)).ok);
      }
      /* Stufe 3: alle Bedingungen auf einmal */
      const tipp = a.stellen.filter((s) => s.tippbar);
      if (tipp.length) {
        const ziele = alleZiele({ stellen: tipp });
        assert.ok(pruefeEingabe(ziele.map((zz) => zz.c).join("\n"), ziele, o).ok, "ganze Aufgabe");
      }
    }
  });
}

test("Steckbrief: so viele Bedingungen wie Unbekannte, Einsetzen stimmt", () => {
  for (let i = 0; i < LAEUFE; i++) {
    const a = neueTextaufgabe("steckbrief");
    assert.equal(anzahlBedingungen(a), a.ansatz.unbekannte.length, a.teile.map((p) => (typeof p === "string" ? p : p.a ? a.ansatz.t : a.stellen[p.s].t)).join(""));
    assert.equal(a.einsetzen.length, anzahlBedingungen(a));
    for (const z of a.einsetzen) assert.ok(gleichwertig(z.gl, z.bed, { ansatz: a.eval, funktionen: ["f"] }), `${z.bed} ↔ ${z.gl}`);
    assert.ok(!/[+-]\s*-|\b1[a-d]\b|\+ 0\b/.test(a.einsetzen.map((z) => z.gl).join(" | ")), "A5 im LGS");
  }
});

test("Funktionen und Sachaufgaben: Bedingungen reichen für die Unbekannten", () => {
  for (let i = 0; i < 200; i++) {
    const a = neueTextaufgabe("lgs");
    const gl = alleZiele(a).filter((z) => /=/.test(z.c));
    assert.ok(gl.length >= 2, "zwei Gleichungen für x und y");
  }
});

test("Wörterbuch und Beispiel", () => {
  const wb = woerterbuch();
  assert.ok(wb.length >= 50);
  for (const e of wb) assert.ok(e.phrase && e.tex && e.warum && e.gruppe);
  const b = beispielSteckbrief();
  assert.equal(b.stellen.length, 2);
});
