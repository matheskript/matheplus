import test from "node:test";
import assert from "node:assert/strict";
import {
  PFADE, PFAD_IDS, STATION_GENERATOREN, EINHEIT_GENERATOREN, EINHEIT_TEXTE, pfadEinheiten, pfadStationen, einheit,
  checkAufgaben, checkAuswerten, ampelVon, reihenfolgeBauen, planErzeugen, terminPruefen, schrittSetzen, einheitFertig,
  naechsteEinheit, wochenStand, wochenEinheiten, stationsStand, einheitAufgaben, pfadKurztext, normierePfad, TAG_MS,
} from "../src/lernpfade.js";
import { GENERATOREN, pruefeAntwort } from "../src/trainingDaten.js";
import { WERKZEUGE, BEREICHE } from "../src/werkzeuge.js";

const GEN_IDS = new Set(GENERATOREN.map((g) => g.id));

test("alle Generator-Verweise existieren", () => {
  for (const [k, ids] of Object.entries(STATION_GENERATOREN)) for (const id of ids) assert.ok(GEN_IDS.has(id), `${k}: ${id}`);
  for (const [k, ids] of Object.entries(EINHEIT_GENERATOREN)) { assert.ok(WERKZEUGE[k], k); for (const id of ids) assert.ok(GEN_IDS.has(id), `${k}: ${id}`); }
  for (const b of BEREICHE) for (const s of b.stationen) assert.ok(`${b.id}.${s.id}` in STATION_GENERATOREN, `Station ohne Eintrag: ${b.id}.${s.id}`);
});

test("jedes Werkzeug hat Einheitstexte und jede Einheit ist auffindbar", () => {
  for (const id of Object.keys(WERKZEUGE)) assert.ok(EINHEIT_TEXTE[id] && EINHEIT_TEXTE[id].worum.length > 40 && EINHEIT_TEXTE[id].aufgabe.length > 20, id);
  const alle = pfadEinheiten("abitur");
  assert.equal(alle.length, Object.keys(WERKZEUGE).length);
  for (const e of alle) assert.equal(einheit(e.id).id, e.id);
  for (const p of PFAD_IDS) assert.ok(pfadEinheiten(p).length > 0 && pfadStationen(p).length > 0, p);
});

test("Standortcheck: Aufgaben je Station, lösbar mit der Lösung, Ampel korrekt", () => {
  for (let lauf = 0; lauf < 30; lauf++) {
    const a = checkAufgaben("analysis");
    assert.ok(a.length >= 6 && a.length <= 15, String(a.length));
    for (const x of a) {
      assert.ok(x.station && x.station.startsWith("analysis."));
      const richtig = x.typ === "wahl" ? String(x.richtig) : String(x.wert);
      assert.ok(pruefeAntwort(x, richtig).ok, `${x.variante}: ${richtig}`);
    }
    const zs = a.map(() => ({ ok: true, hilfeEnde: 0, erstOk: true, gebucht: true }));
    const c = checkAuswerten("analysis", a, zs);
    for (const s of pfadStationen("analysis")) assert.equal(c[s.key].ampel, s.generatoren.length ? "gruen" : "grau", s.key);
  }
  assert.equal(ampelVon(0, 0), "grau"); assert.equal(ampelVon(4, 3), "gruen"); assert.equal(ampelVon(4, 2), "gelb"); assert.equal(ampelVon(4, 1), "rot");
  const a = checkAufgaben("analysis");
  const zsL = a.map(() => ({ ok: true, hilfeEnde: 4, erstOk: false, gebucht: true }));   // mit gezeigter Lösung zählt nicht
  for (const v of Object.values(checkAuswerten("analysis", a, zsL))) if (v.n) assert.equal(v.ampel, "rot");
});

test("Reihenfolge: grüne Station schrumpft auf eine Einheit, Rest in Stationsreihenfolge", () => {
  const alle = reihenfolgeBauen("analysis", {});
  assert.deepEqual(alle, pfadEinheiten("analysis").map((e) => e.id));
  const kurz = reihenfolgeBauen("analysis", { "analysis.untersuchen": { ampel: "gruen" } });
  assert.equal(kurz.filter((id) => id.startsWith("analysis.untersuchen.")).length, 1);
  assert.equal(kurz.length, alle.length - 2);
  assert.ok(kurz.includes("analysis.untersuchen.ableitungstrainer"));
});

test("Termin: Einheiten pro Woche steigen, bis der Plan passt", () => {
  const jetzt = Date.now();
  assert.equal(terminPruefen(9, 3, null, jetzt).wochen, 3);
  const eng = terminPruefen(9, 2, jetzt + 15 * TAG_MS, jetzt);
  assert.equal(eng.proWoche, 5); assert.ok(eng.passt);
  const unmoeglich = terminPruefen(27, 3, jetzt + 8 * TAG_MS, jetzt);
  assert.equal(unmoeglich.passt, false); assert.equal(unmoeglich.proWoche, 7);
  const P = planErzeugen({ pfad: "analysis", ziel: "klausur", termin: jetzt + 15 * TAG_MS, proWoche: 2, jetzt });
  assert.equal(P.proWoche, Math.ceil(pfadEinheiten("analysis").length / 2));   // 15 Tage → 2 Wochen
  assert.throws(() => planErzeugen({ pfad: "gibtsnicht" }));
});

test("Fortschritt: Schritte setzen, Woche zählen, nächste Einheit, Stationsstand", () => {
  const jetzt = Date.parse("2026-10-19T08:00:00Z");
  let P = planErzeugen({ pfad: "analysis", proWoche: 3, jetzt });
  const ids = P.reihenfolge;
  assert.equal(naechsteEinheit(P), ids[0]);
  P = schrittSetzen(P, ids[0], "entdecken", { jetzt });
  assert.equal(einheitFertig(P, ids[0]), false);
  P = schrittSetzen(P, ids[0], "rechnen", { jetzt: jetzt + 60000 });
  P = schrittSetzen(P, ids[0], "trainieren", { jetzt: jetzt + 120000, quote: 0.8 });
  assert.equal(einheitFertig(P, ids[0]), true);
  assert.equal(P.fortschritt[ids[0]].quote, 0.8);
  assert.ok(P.fortschritt[ids[0]].zuletzt >= jetzt);   // für den Konto-Abgleich
  assert.equal(naechsteEinheit(P), ids[1]);
  const ws = wochenStand(P, jetzt + 3 * TAG_MS);
  assert.deepEqual([ws.woche, ws.ist, ws.soll, ws.fertig, ws.gesamt], [0, 1, 3, 1, ids.length]);
  assert.deepEqual(wochenEinheiten(P, jetzt + 3 * TAG_MS).map((e) => e.id), ids.slice(0, 3));
  // nächste Woche: die fertige Einheit zählt nicht mehr, Soll wieder 3 neue
  const ws2 = wochenStand(P, jetzt + 8 * TAG_MS);
  assert.deepEqual([ws2.woche, ws2.ist, ws2.soll, ws2.imRueckstand], [1, 0, 3, true]);
  assert.deepEqual(wochenEinheiten(P, jetzt + 8 * TAG_MS).map((e) => e.id), ids.slice(1, 4));
  assert.equal(schrittSetzen(P, ids[1], "unsinn"), P);
  // Station grün, sobald alle Einheiten fertig
  for (const id of ids.filter((x) => x.startsWith("analysis.integrieren."))) for (const s of ["entdecken", "rechnen", "trainieren"]) P = schrittSetzen(P, id, s, { jetzt });
  const st = stationsStand(P);
  assert.equal(st.find((s) => s.key === "analysis.integrieren").ampel, "gruen");
  assert.equal(st.find((s) => s.key === "analysis.kennen").ampel, "grau");
  assert.match(pfadKurztext(P, jetzt), /Lernpfad: Analysis/);
});

test("Trainingsaufgaben einer Einheit: 5 Aufgaben aus passenden Generatoren, prüfbar", () => {
  for (const e of pfadEinheiten("abitur")) {
    const a = einheitAufgaben(e);
    if (!e.generatoren.length) { assert.equal(a.length, 0); continue; }
    assert.equal(a.length, 5, e.id);
    for (const x of a) {
      assert.ok(e.generatoren.includes(x.variante), `${e.id}: ${x.variante}`);
      assert.ok(pruefeAntwort(x, x.typ === "wahl" ? String(x.richtig) : String(x.wert)).ok);
    }
  }
});

test("normierePfad verwirft Unbrauchbares und ergänzt Felder", () => {
  assert.equal(normierePfad(null), null);
  assert.equal(normierePfad({ pfad: "nix", reihenfolge: [] }), null);
  const P = normierePfad({ pfad: "vektoren", reihenfolge: ["vektoren.rechnen.winkel", "kaputt"] });
  assert.deepEqual(P.reihenfolge, ["vektoren.rechnen.winkel"]);
  assert.equal(P.proWoche, 3);
  assert.ok(PFADE[P.pfad]);
});
