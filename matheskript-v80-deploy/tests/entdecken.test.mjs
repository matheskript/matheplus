import test from "node:test";
import assert from "node:assert/strict";
import { mergeEntdecken, normalisiere } from "../src/entdeckenMerge.js";
import { erzeugeSync } from "../src/lernSync.js";

const st = (o = {}) => normalisiere(o);
const refl = (wahl, text, zeit) => ({ wahl, text, zeit });

test("normalisiere: leer, alte Form (video: true) und feste Schlüsselreihenfolge", () => {
  const n = st({});
  assert.deepEqual(Object.keys(n), ["reflexion", "video", "potenz", "axiome", "module", "zuletzt", "_zeit"]);
  assert.equal(n.potenz.stand.length, 7);
  assert.equal(n.axiome.stand.length, 10);
  assert.deepEqual(n.axiome, { phase: 0, stand: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], fertig: false, zeit: 0 });
  assert.deepEqual(n.module.pythagoras, { phase: 0, stand: [0, 0, 0, 0, 0, 0], fertig: false, zeit: 0 });
  const alt = st({ video: { haupt: true }, reflexion: { q1: { wahl: "a" } } });
  assert.deepEqual(alt.video.haupt, { an: true, zeit: 0 });
  assert.deepEqual(alt.reflexion.q1, { wahl: "a", text: "", zeit: 0 });
  assert.deepEqual(st(null), st(undefined));
  const kaputt = st({ potenz: { stand: [1, "x", -5, 3], phase: 99, phasenFertig: [2, 2, 9] } });
  assert.deepEqual(kaputt.potenz.stand, [1, 0, 0, 3, 0, 0, 0]);
  assert.equal(kaputt.potenz.phase, 6);
  assert.deepEqual(kaputt.potenz.phasenFertig, [2, 6]);
});

test("merge: Reflexion – jüngerer Eintrag je Frage, auch eine zurückgenommene Auswahl", () => {
  const a = st({ reflexion: { q1: refl("a", "alt", 10), q2: refl("b", "", 50) } });
  const b = st({ reflexion: { q1: refl("", "", 20), q3: refl("c", "x", 5) } });
  const m = mergeEntdecken(a, b);
  assert.equal(m.reflexion.q1.wahl, "");       // b ist jünger und hat die Auswahl zurückgenommen
  assert.equal(m.reflexion.q2.wahl, "b");
  assert.equal(m.reflexion.q3.text, "x");
});

test("merge: Video-Markierung – jünger gewinnt", () => {
  const a = st({ video: { haupt: { an: true, zeit: 10 } } });
  const b = st({ video: { haupt: { an: false, zeit: 30 }, puzzle: { an: true, zeit: 1 } } });
  const m = mergeEntdecken(a, b);
  assert.equal(m.video.haupt.an, false);
  assert.equal(m.video.puzzle.an, true);
});

test("merge: Modul – Fortschritt je Phase = Maximum, fertig = oder, Phase vom jüngeren Stand", () => {
  const a = st({ potenz: { phase: 2, stand: [4, 5, 1, 0, 0, 0, 0], fertig: false, zeit: 100 } });
  const b = st({ potenz: { phase: 1, stand: [4, 2, 3, 2, 0, 0, 0], fertig: true, zeit: 200 } });
  const m = mergeEntdecken(a, b);
  assert.deepEqual(m.potenz.stand, [4, 5, 3, 2, 0, 0, 0]);
  assert.equal(m.potenz.fertig, true);
  assert.equal(m.potenz.phase, 1);
  assert.equal(m.potenz.zeit, 200);
});

test("normalisiere: alter Stand ohne Axiome-Modul bleibt gültig, kaputte Axiome-Daten werden begrenzt", () => {
  const alt = st({ potenz: { stand: [1, 2, 3, 0, 0, 0, 0], zeit: 4 }, reflexion: { q1: { wahl: "a" } } });
  assert.deepEqual(alt.axiome, { phase: 0, stand: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], fertig: false, zeit: 0 });
  assert.deepEqual(alt.potenz.stand, [1, 2, 3, 0, 0, 0, 0]);
  const kaputt = st({ axiome: { phase: 99, stand: [2, "x", -1, 500], fertig: 1, zeit: "q" } });
  assert.equal(kaputt.axiome.phase, 9);
  assert.deepEqual(kaputt.axiome.stand, [2, 0, 0, 99, 0, 0, 0, 0, 0, 0]);
  assert.equal(kaputt.axiome.fertig, true);
  assert.equal(kaputt.axiome.zeit, 0);
});

test("merge: Axiome-Modul – Fortschritt je Phase = Maximum, fertig = oder, Phase vom jüngeren Stand", () => {
  const a = st({ axiome: { phase: 3, stand: [4, 5, 1, 0, 0, 0, 0, 0, 0, 7], fertig: false, zeit: 100 } });
  const b = st({ axiome: { phase: 1, stand: [4, 2, 3, 2, 0, 0, 0, 0, 6, 0], fertig: true, zeit: 200 } });
  const m = mergeEntdecken(a, b);
  assert.deepEqual(m.axiome.stand, [4, 5, 3, 2, 0, 0, 0, 0, 6, 7]);
  assert.equal(m.axiome.fertig, true);
  assert.equal(m.axiome.phase, 1);
  assert.equal(m.axiome.zeit, 200);
  assert.deepEqual(mergeEntdecken(a, b), mergeEntdecken(b, a));
  assert.deepEqual(mergeEntdecken(m, m), m);
  // das Potenz-Modul bleibt davon unberührt
  assert.deepEqual(m.potenz, st({}).potenz);
});

test("normalisiere: Pythagoras-Modul – kaputte Eingaben werden begrenzt, fremde Kennungen verworfen, alter Stand ohne `module` bleibt gültig", () => {
  const k = st({ module: { pythagoras: { phase: 99, stand: [1, "x", -3, 120, 2], fertig: 1, zeit: "7" }, unbekannt: { phase: 1 } } });
  assert.deepEqual(k.module.pythagoras, { phase: 5, stand: [1, 0, 0, 99, 2, 0], fertig: true, zeit: 0 });
  assert.equal(k.module.unbekannt, undefined);
  const alt = st({ reflexion: { q1: { wahl: "a" } }, potenz: { phase: 2, stand: [4, 5, 1, 0, 0, 0, 0], zeit: 3 } });   // Stand von vor dem Modul
  assert.equal(alt.potenz.phase, 2);
  assert.deepEqual(alt.module.pythagoras.stand, [0, 0, 0, 0, 0, 0]);
});

test("merge: Pythagoras-Modul – Fortschritt je Phase = Maximum, fertig = oder, Phase vom jüngeren Stand; Potenz bleibt unberührt", () => {
  const a = st({ potenz: { stand: [4, 0, 0, 0, 0, 0, 0], zeit: 50 }, module: { pythagoras: { phase: 3, stand: [4, 4, 5, 1, 0, 0], fertig: false, zeit: 100 } } });
  const b = st({ module: { pythagoras: { phase: 2, stand: [4, 3, 5, 2, 3, 0], fertig: true, zeit: 200 } } });
  const m = mergeEntdecken(a, b);
  assert.deepEqual(m.module.pythagoras.stand, [4, 4, 5, 2, 3, 0]);
  assert.equal(m.module.pythagoras.fertig, true);
  assert.equal(m.module.pythagoras.phase, 2);
  assert.equal(m.module.pythagoras.zeit, 200);
  assert.deepEqual(m.potenz.stand, [4, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(mergeEntdecken(a, b), mergeEntdecken(b, a));
  assert.deepEqual(mergeEntdecken(m, m), m);
  assert.equal(JSON.stringify(mergeEntdecken(m, a)), JSON.stringify(m));      // nichts Neues → unverändert (keine Hochlade-Schleife)
  assert.deepEqual(mergeEntdecken(null, b).module.pythagoras, b.module.pythagoras);
});

test("merge: zuletzt bearbeitet = jüngerer; Reihenfolge egal, idempotent, Form stabil", () => {
  const a = st({ zuletzt: { id: "einstieg", label: "A", zeit: 5 }, reflexion: { q1: refl("a", "", 1) }, _zeit: 5 });
  const b = st({ zuletzt: { id: "potenz", label: "B", zeit: 9 }, potenz: { stand: [1, 0, 0, 0, 0, 0, 0], zeit: 9 }, _zeit: 9 });
  const ab = mergeEntdecken(a, b), ba = mergeEntdecken(b, a);
  assert.deepEqual(ab, ba);
  assert.equal(JSON.stringify(ab), JSON.stringify(ba));
  assert.equal(ab.zuletzt.id, "potenz");
  assert.deepEqual(mergeEntdecken(ab, ab), ab);
  assert.equal(JSON.stringify(mergeEntdecken(ab, a)), JSON.stringify(ab));   // nichts Neues → unverändert (kein Hochlade-Schleife)
  assert.deepEqual(mergeEntdecken(null, b), b);
});

/* ---------- Sync mit Fake-Supabase: richtige Tabelle, Merge, Besitzer, Ersetzen ---------- */
function fakeClient(tabellen = {}) {
  const log = [];
  return {
    log, tabellen,
    from(name) {
      return {
        select: () => ({ eq: (_c, id) => ({ maybeSingle: async () => { log.push(["select", name, id]); return { data: (tabellen[name] || {})[id] || null, error: null }; } }) }),
        upsert: async (zeile) => { log.push(["upsert", name, zeile.nutzer_id]); (tabellen[name] = tabellen[name] || {})[zeile.nutzer_id] = { daten: zeile.daten, geaendert: "x" }; return { error: null }; },
      };
    },
  };
}
const speicher = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k), m }; };
function aufbau(client, start) {
  const z = { stand: st(start) };
  const sp = speicher();
  const sync = erzeugeSync({ client, speicher: sp, verzoegerung: 0,
    tabelle: "entdecken_fortschritt", besitzerSchluessel: "mm-entdecken-owner", merge: mergeEntdecken,
    lesen: () => z.stand, anwenden: (d) => { z.stand = st(d); }, leer: () => st({}) });
  return { z, sp, sync };
}

test("sync: erster Abgleich schreibt in entdecken_fortschritt (nicht in lernstand) und führt Geräte zusammen", async () => {
  const remote = st({ reflexion: { q2: refl("b", "", 7) }, potenz: { stand: [3, 0, 0, 0, 0, 0, 0], zeit: 7 } });
  const c = fakeClient({ entdecken_fortschritt: { u1: { daten: remote } } });
  const { z, sp, sync } = aufbau(c, { reflexion: { q1: refl("a", "", 5) }, potenz: { stand: [1, 4, 0, 0, 0, 0, 0], zeit: 5 } });
  assert.equal(await sync.anmelden("u1"), true);
  assert.deepEqual(z.stand.potenz.stand, [3, 4, 0, 0, 0, 0, 0]);
  assert.ok(z.stand.reflexion.q1 && z.stand.reflexion.q2);
  assert.ok(c.log.every(([, tab]) => tab === "entdecken_fortschritt"));
  assert.deepEqual(c.tabellen.entdecken_fortschritt.u1.daten, z.stand);      // Konto hat den zusammengeführten Stand
  assert.equal(sp.getItem("mm-entdecken-owner"), "u1");
  const n = c.log.length;
  await sync.anmelden("u1");                                                  // nichts Neues → kein weiteres Hochladen
  assert.equal(c.log.filter((l) => l[0] === "upsert").length, 1);
  assert.ok(c.log.length > n);                                                // aber gelesen wird
});

test("sync: fremdes Konto auf demselben Gerät – lokaler Stand wird weder übernommen noch hochgeladen", async () => {
  const c = fakeClient({ entdecken_fortschritt: { u2: { daten: st({ reflexion: { q3: refl("c", "", 3) } }) } } });
  const { z, sp, sync } = aufbau(c, { reflexion: { q1: refl("a", "geheim", 5) } });
  sp.setItem("mm-entdecken-owner", "u1");
  await sync.anmelden("u2");
  assert.equal(z.stand.reflexion.q1, undefined);
  assert.ok(z.stand.reflexion.q3);
  assert.equal(JSON.stringify(c.tabellen.entdecken_fortschritt.u2.daten).includes("geheim"), false);
});

test("sync: ersetzen() – Zurücksetzen ersetzt den Konto-Stand statt ihn zurückzumischen", async () => {
  const voll = st({ potenz: { phase: 3, stand: [4, 5, 6, 4, 0, 0, 0], zeit: 10 } });
  const c = fakeClient({ entdecken_fortschritt: { u1: { daten: voll } } });
  const { z, sync } = aufbau(c, voll);
  await sync.anmelden("u1");
  z.stand = st({ potenz: { phase: 0, stand: [0, 0, 0, 0, 0, 0, 0], zeit: 20 } });   // Schüler setzt zurück
  sync.ersetzen();
  await sync.flush();
  assert.deepEqual(c.tabellen.entdecken_fortschritt.u1.daten.potenz.stand, [0, 0, 0, 0, 0, 0, 0]);
});

test("sync: Tabelle fehlt → Status nicht-eingerichtet, lokaler Stand bleibt", async () => {
  const c = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: { code: "42P01", message: 'relation "public.entdecken_fortschritt" does not exist' } }) }) }) }) };
  const { z, sync } = aufbau(c, { reflexion: { q1: refl("a", "", 5) } });
  assert.equal(await sync.anmelden("u1"), false);
  assert.equal(sync.zustand().status, "nicht-eingerichtet");
  assert.ok(z.stand.reflexion.q1);
});

test("sync: vorAbmelden sichert zuerst, leert dann den lokalen Stand", async () => {
  const c = fakeClient();
  const { z, sp, sync } = aufbau(c, { reflexion: { q1: refl("a", "x", 5) } });
  await sync.anmelden("u1");
  z.stand = st({ reflexion: { q1: refl("a", "x", 5), q2: refl("b", "", 9) } });
  await sync.vorAbmelden();
  assert.ok(c.tabellen.entdecken_fortschritt.u1.daten.reflexion.q2);          // gesichert
  assert.deepEqual(z.stand, st({}));                                          // lokal geleert
  assert.equal(sp.getItem("mm-entdecken-owner"), null);
});
