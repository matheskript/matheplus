/* Wächter fürs Trainingszentrum: Jedes Programm verweist nur auf Dinge, die es gibt
   (Generatoren, Filme, einbettbare Werkzeuge), und die Hilfsfunktionen liefern saubere Sessions. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GENERATOREN } from "../src/trainingDaten.js";
import { WERKZEUGE } from "../src/werkzeuge.js";
import {
  EXTRA, FILME, PROGRAMME, REITER_IDS, auswertung, programmeFuer, seitenTitel, sessionAusAufgaben, sessionAusProgramm, sessionAusWerkzeug, sessionVon,
  trainierBereiche, trainierWerkzeuge, zuletztLesen, zuletztMerken, themenBereiche, PROGRAMME_SICHTBAR,
} from "../src/trainingszentrum.js";

const GEN_IDS = new Set(GENERATOREN.map((g) => g.id));
const ARTEN = new Set(["intro", "film", "aufgaben", "werkzeug", "auswertung"]);

/* Einbettbare Ansichten: WZ_SEITEN (funcWerkzeugSeite.jsx) + EINGEBETTET (funcTrainingsSession.jsx) – aus dem Quelltext gelesen */
function einbettbareAnsichten() {
  const wz = readFileSync(new URL("../src/funcWerkzeugSeite.jsx", import.meta.url), "utf8");
  const ts = readFileSync(new URL("../src/funcTrainingsSession.jsx", import.meta.url), "utf8");
  const aus = (quelle, block) => {
    const m = quelle.match(block);
    assert.ok(m, "Tabelle nicht gefunden");
    return [...m[1].matchAll(/^\s{2}([a-z]+):/gm)].map((x) => x[1]);
  };
  return new Set([...aus(wz, /export const WZ_SEITEN = \{([\s\S]*?)\n\};/), ...aus(ts, /const EINGEBETTET = \{([\s\S]*?)\n\};/)]);
}
const EINBETTBAR = einbettbareAnsichten();

test("Programme: eindeutige Kennungen, gültige Seitenarten, Verweise existieren", () => {
  const ids = PROGRAMME.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of PROGRAMME) {
    assert.ok(p.titel && p.zeile && p.zeichen && p.dauer > 0, p.id);
    assert.ok(["ober", "mittel", "beide"].includes(p.stufe), `${p.id}: Stufe`);
    assert.ok(p.seiten.length >= 2, `${p.id}: zu wenig Seiten`);
    assert.equal(p.seiten[p.seiten.length - 1].art, "auswertung", `${p.id}: endet nicht mit Auswertung`);
    for (const s of p.seiten) {
      assert.ok(ARTEN.has(s.art), `${p.id}: Art ${s.art}`);
      if (s.art === "film") assert.ok(FILME[s.film], `${p.id}: Film ${s.film}`);
      if (s.art === "aufgaben") { assert.ok(s.gen && s.gen.length, `${p.id}: Aufgaben ohne gen`); for (const g of s.gen) assert.ok(GEN_IDS.has(g), `${p.id}: Generator ${g}`); }
      if (s.art === "werkzeug") assert.ok(EINBETTBAR.has(s.ansicht), `${p.id}: Werkzeug ${s.ansicht} nicht einbettbar`);
      if (s.art === "intro") assert.ok(s.titel && s.text, `${p.id}: Intro unvollständig`);
    }
  }
});

test("Alle Trainier-Werkzeuge und EXTRA sind einbettbar", () => {
  for (const w of trainierWerkzeuge()) assert.ok(EINBETTBAR.has(w.ziel.ansicht), `${w.id} → ${w.ziel.ansicht}`);
  for (const id of Object.keys(EXTRA)) assert.ok(EINBETTBAR.has(id), id);
});

test("trainierBereiche: nur Trainier-Werkzeuge, Stufenfilter greift", () => {
  const alle = trainierBereiche("alle");
  assert.ok(alle.length >= 6);
  for (const b of alle) for (const w of b.werkzeuge) assert.equal(w.etikett, "trainieren");
  const ober = trainierBereiche("ober").flatMap((b) => b.werkzeuge);
  assert.ok(ober.every((w) => w.stufe === "ober" || w.stufe === "beide"));
  assert.ok(ober.some((w) => w.id === "ableitungstrainer"));
  assert.ok(!ober.some((w) => w.id === "parabeln"));
  const n = alle.flatMap((b) => b.werkzeuge).length;
  assert.equal(n, trainierWerkzeuge().filter((w) => Object.values(WERKZEUGE).includes(WERKZEUGE[w.id])).length);
});

test("Sessions aus Programm, Werkzeug und Aufgaben; Wiederherstellen über die Kennung", () => {
  const p = sessionAusProgramm("ableiten-zehn");
  assert.equal(p.id, "programm:ableiten-zehn");
  assert.equal(p.seiten.length, 5);
  assert.equal(sessionVon("programm:ableiten-zehn").titel, p.titel);
  const w = sessionAusWerkzeug("ableitungstrainer");
  assert.deepEqual(w.seiten.map((s) => s.art), ["werkzeug"]);
  assert.equal(w.seiten[0].ansicht, "ableitungstrainer");
  assert.equal(sessionAusWerkzeug("klausur").kicker, "Prüfung");
  assert.equal(sessionVon("werkzeug:klausur").titel, "Klausurgenerator");
  assert.equal(sessionAusWerkzeug("gibtsnicht"), null);
  assert.equal(sessionVon("aufgaben:warmup"), null);   // fertige Aufgaben lassen sich nicht wiederherstellen
  const a = sessionAusAufgaben("warmup", "5 Minuten Mathe", [{ id: 1 }, { id: 2 }, { id: 3 }]);
  assert.deepEqual(a.seiten.map((s) => s.art), ["aufgaben", "auswertung"]);
  assert.equal(a.seiten[0].aufgaben.length, 3);
});

test("programmeFuer filtert nach Stufe", () => {
  assert.equal(programmeFuer("alle").length, PROGRAMME.length);
  assert.ok(programmeFuer("mittel").every((p) => p.stufe !== "ober"));
  assert.ok(programmeFuer("ober").every((p) => p.stufe !== "mittel"));
});

test("Seitentitel und Auswertung", () => {
  const p = sessionAusProgramm("ableiten-zehn");
  assert.equal(seitenTitel(p.seiten[1], 1, 5), FILME.produkt.titel);
  assert.equal(seitenTitel(p.seiten[3], 3, 5), "Ableitungstrainer");
  const e = auswertung([[{ ok: true, hilfeEnde: 0 }, { ok: true, hilfeEnde: 2 }, { ok: false, gebucht: true, erstOk: false, typ: "vorzeichen" }], []]);
  assert.deepEqual([e.n, e.richtig, e.ohneHilfe, e.typen], [3, 2, 1, ["vorzeichen"]]);
  assert.equal(auswertung([]).anteil, null);
});

test("Zuletzt merken und lesen", () => {
  const m = new Map();
  const sp = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
  assert.equal(zuletztLesen(sp), null);
  zuletztMerken(sp, "programm:ableiten-zehn", 2);
  assert.equal(zuletztLesen(sp).kennung, "programm:ableiten-zehn");
  assert.equal(zuletztLesen(sp).seite, 2);
  assert.equal(zuletztLesen(sp).fertig, false);
  /* Drei Ebenen seit 21.10.: Heute · Themen · Prüfung; Programme bleiben ausgeblendet, bis sie fachlich abgenommen sind */
  assert.deepEqual(REITER_IDS, PROGRAMME_SICHTBAR ? ["heute", "programme", "themen", "pruefung"] : ["heute", "themen", "pruefung"]);
  const alleThemen = themenBereiche("alle").flatMap((b) => b.werkzeuge).map((w) => w.id);
  assert.equal(new Set(alleThemen).size, Object.keys(WERKZEUGE).length, "Themen-Liste enthält jedes Werkzeug genau einmal");
  assert.ok(themenBereiche("unter").flatMap((b) => b.werkzeuge).every((w) => w.unter), "Unterstufe-Filter");
});
