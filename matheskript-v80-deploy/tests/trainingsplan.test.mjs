/* Unterthemen je Buchkapitel und Trainingsplan (Quickfinder „Trainingsplan erstellen“) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PLAN, THEMEN } from "../src/schulbuch.js";
import { UNTERTHEMEN_KAPITEL, kapitelGeneratoren, unterthema, unterthemen } from "../src/unterthemen.js";
import { GENERATOREN } from "../src/trainingDaten.js";
import { WERKZEUGE } from "../src/werkzeuge.js";
import { WIEDERHOLEN_TAGE, einheitAufgabenIds, planErstellen, planStand, planTage, plusTage, tageZwischen, tagName, vorwissenStufen } from "../src/trainingsplan.js";

const GEN = new Set(GENERATOREN.map((g) => g.id));
const HEUTE = "2026-10-18";

test("jedes Kapitel hat 3 bis 6 Unterthemen; Generatoren und Werkzeuge existieren", () => {
  for (const k of Object.keys(THEMEN)) {
    const u = unterthemen(k);
    assert.ok(u.length >= 3 && u.length <= 6, `${k}: ${u.length} Unterthemen`);
    for (const x of u) {
      for (const g of x.gen) assert.ok(GEN.has(g), `${x.id}: Generator ${g}`);
      if (x.wz) assert.ok(WERKZEUGE[x.wz], `${x.id}: Werkzeug ${x.wz}`);
      assert.equal(unterthema(x.id).titel, x.titel);
    }
  }
  for (const k of UNTERTHEMEN_KAPITEL) assert.ok(THEMEN[k], `unbekanntes Kapitel ${k}`);
});

test("ab Klasse 7 hat jedes Kapitel der Mittel- und Kursstufe Übungen, außer reinen Geometrie-/Messkapiteln", () => {
  const ohne = new Set(["dreiecke", "kreis", "prismen", "kugel", "strahlen", "zufallsgr", "ksNormal"]);
  for (const box of ["7", "8", "9", "10", "11", "12", "13"]) for (const k of PLAN.g9[box] || []) {
    if (ohne.has(k)) continue;
    assert.ok(kapitelGeneratoren(k).length >= 1, `${k} ohne Übungen`);
  }
});

test("Vorwissen: direkt und tiefer, ohne das Kapitel selbst und ohne Doppelte", () => {
  for (const k of Object.keys(THEMEN)) {
    const { direkt, tiefer } = vorwissenStufen(k, "g9");
    assert.ok(!direkt.includes(k) && !tiefer.includes(k), k);
    assert.equal(new Set([...direkt, ...tiefer]).size, direkt.length + tiefer.length, k);
    assert.ok(tiefer.length <= 4);
  }
  assert.ok(vorwissenStufen("trig").direkt.includes("pythagoras"));
});

test("Plan ohne Termin: Reihenfolge der Phasen, Ebbinghaus-Abstände nach dem Kerntraining", () => {
  for (const schulart of ["g8", "g9", "gms"]) for (const k of Object.keys(THEMEN)) {
    const p = planErstellen({ kapitel: k, schulart, heute: HEUTE });
    const phasen = p.einheiten.map((e) => e.phase);
    const rang = { warmup: 0, basis: 1, zwischen: 2, kern: 3, wiederholen: 4 };
    for (let i = 1; i < phasen.length; i++) assert.ok(rang[phasen[i - 1]] <= rang[phasen[i]], `${k}: ${phasen.join(",")}`);
    const kern = p.einheiten.find((e) => e.phase === "kern");
    const w = p.einheiten.filter((e) => e.phase === "wiederholen").map((e) => tageZwischen(kern.datum, e.datum));
    assert.deepEqual(w, WIEDERHOLEN_TAGE, k);
    for (const e of p.einheiten) {
      assert.ok(e.datum >= HEUTE);
      for (const g of e.gen) assert.ok(GEN.has(g));
      assert.equal(einheitAufgabenIds(e).length, e.gen.length ? e.anzahl : 0);
      assert.ok(e.ziele.length >= 1, `${k}/${e.phase}: kein Ziel`);
    }
    assert.equal(p.einheiten[0].phase, "warmup");
    const box = Object.entries(PLAN[schulart]).find(([b, ids]) => b !== "abi" && ids.includes(k));
    const kl = box ? Number(box[0].split("-")[0]) : 13;
    if (kl >= 7) assert.ok(p.einheiten[0].gen.length >= 1, `${k}: Warm-up ohne Aufgaben`);
    if (kl <= 5) assert.equal(p.einheiten[0].gen.length, 0, `${k}: Warm-up zu schwer für Klasse ${kl}`);
  }
});

test("Plan mit Unterthema: frühere Unterthemen werden Zwischenschritte, Kern ist das Unterthema", () => {
  const p = planErstellen({ kapitel: "trig", teil: "trig.2", heute: HEUTE });
  const kern = p.einheiten.find((e) => e.phase === "kern");
  assert.equal(kern.titel, "Seiten berechnen");
  assert.ok(p.einheiten.some((e) => e.phase === "zwischen" && e.teil === "trig.1"));
  assert.ok(!p.einheiten.some((e) => e.teil === "trig.3"));
});

test("Plan mit Termin: alles vor der Arbeit, Generalprobe am Vortag", () => {
  for (const d of [2, 3, 4, 5, 6, 9, 20]) {
    const termin = plusTage(HEUTE, d);
    const p = planErstellen({ kapitel: "quad", heute: HEUTE, termin });
    for (const e of p.einheiten) assert.ok(e.datum < termin, `Termin in ${d} Tagen: ${e.phase} am ${e.datum}`);
    const g = p.einheiten.filter((e) => e.phase === "generalprobe");
    const kern = p.einheiten.find((e) => e.phase === "kern");
    if (tageZwischen(HEUTE, kern.datum) < d - 1) assert.equal(g.length, 1, `d = ${d}`);
    if (g.length) assert.equal(g[0].datum, plusTage(termin, -1));
  }
  const vorbei = planErstellen({ kapitel: "quad", heute: HEUTE, termin: "2026-10-01" });
  assert.equal(vorbei.termin, null);
});

test("Stand, Tage, Tagesnamen", () => {
  const p = planErstellen({ kapitel: "explog", heute: HEUTE });
  const s0 = planStand(p, {}, HEUTE);
  assert.equal(s0.fertig, 0);
  assert.equal(s0.naechste.id, "e1");
  const erledigt = Object.fromEntries(p.einheiten.filter((e) => e.datum === HEUTE).map((e) => [e.id, { zeit: 1 }]));
  const s1 = planStand(p, erledigt, HEUTE);
  assert.equal(s1.faellig, 0);
  assert.ok(s1.naechste.datum > HEUTE);
  assert.equal(planTage(p).reduce((n, t) => n + t.einheiten.length, 0), p.einheiten.length);
  assert.equal(tagName(HEUTE, HEUTE), "heute");
  assert.equal(tagName("2026-10-19", HEUTE), "morgen");
  assert.equal(tagName("2026-10-21", HEUTE), "Mi 21.10.");
  assert.equal(plusTage("2026-10-24", 10), "2026-11-03");   // über die Zeitumstellung
});
