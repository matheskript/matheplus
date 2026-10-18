import test from "node:test";
import assert from "node:assert/strict";
import * as M from "../src/mengenLogik.js";
import { enthaelt, mengeTex, iv } from "../src/mengenRechnen.js";
import { a5, schritteOk } from "./aufgabenDaten.mjs";

const ALLE = Object.values(M.ML_KAPITEL_ARTEN).flat();
const L = 500;

test("Titel für alle Typen", () => { for (const a of ALLE) assert.ok(M.ML_TITEL[a], a); });

test("Jede Aufgabe vollständig, A5 und mathematisch richtig", () => {
  for (const art of ALLE) for (let i = 0; i < L; i++) {
    const au = M.mlAufgabe(art);
    schritteOk(au); a5(au);
    const p = au.pruef;
    for (const st of au.schritte) if (st.gegen) {
      const [a, b] = st.gegen;
      assert.ok(M.P[a].f(st.wert) && !M.P[b].f(st.wert), `${art}: hinterlegtes Gegenbeispiel ${st.wert} passt nicht`);
    }
    if (art === "element") assert.equal(au.schritte[0].richtig, M.P[p.id].f(p.n) ? "in" : "nicht");
    if (art === "aufzaehlen") for (let n = 1; n <= 60; n++) assert.equal(p.liste.includes(n), p.f(n), `${art}: ${n}`);
    if (art === "teilmenge" || art === "implikation") assert.equal(au.schritte[0].richtig === "ja" || au.schritte[0].richtig === "w", M.folgt(p.a, p.b));
    if (art === "operation") {
      const sa = new Set(p.A), sb = new Set(p.B);
      for (let n = 1; n <= 12; n++) {
        const soll = p.op === "schnitt" ? sa.has(n) && sb.has(n) : p.op === "ver" ? sa.has(n) || sb.has(n) : sa.has(n) && !sb.has(n);
        assert.equal(p.ergebnis.includes(n), soll);
      }
    }
    if (art === "anzahl") assert.equal(p.keine, p.gesamt - (p.a + p.b - p.beide));
    if (art === "ganzzahlen") { let n = 0; for (let k = -50; k <= 50; k++) if (enthaelt(p.m, k)) n++; assert.equal(n, p.n); }
    if (art === "schnitt" || art === "vereinigung") {
      for (let x = -12; x <= 12; x += 0.5) {
        const soll = art === "schnitt" ? enthaelt(p.a, x) && enthaelt(p.b, x) : enthaelt(p.a, x) || enthaelt(p.b, x);
        assert.equal(enthaelt(p.richtig, x), soll, `${art} ${mengeTex(p.a)} ${mengeTex(p.b)} → ${mengeTex(p.richtig)} bei ${x}`);
      }
    }
    if (art === "notwendig") {
      const h = M.folgt(p.a, p.b), n = M.folgt(p.b, p.a);
      assert.equal(p.r, h && n ? "beides" : h ? "hin" : n ? "not" : "keins");
    }
  }
});

test("Intervallschnitt: Randfälle", () => {
  assert.equal(mengeTex(M.ivSchnitt(iv(1, 3, true, true), iv(3, 5, true, false))), "\\{3\\}");
  assert.equal(mengeTex(M.ivSchnitt(iv(1, 3, true, false), iv(3, 5, true, false))), "\\emptyset");
  assert.equal(mengeTex(M.ivSchnitt(iv(-Infinity, 4, false, true), iv(0, 6, false, false))), "]0; 4]");
  assert.equal(mengeTex(M.ivVereinigung(iv(-2, 3, true, false), iv(1, 5, false, true))), "[−2; 5]");
});

test("Beispiele der Logik", () => {
  assert.ok(M.folgt("v6", "v3") && !M.folgt("v3", "v6"));
  assert.equal(M.gegenbeispiel("prim", "ungerade"), 2);
  assert.equal(M.gegenbeispiel("ungerade", "prim"), 1);
  assert.ok(M.folgt("gerade", "qgerade") && M.folgt("qgerade", "gerade"));
  assert.equal(M.wennDann("v4", "gerade")[0], "Wenn x durch 4 teilbar ist, dann ist x gerade.");
});
