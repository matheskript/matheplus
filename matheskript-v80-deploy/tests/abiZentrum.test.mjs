/* Abi-Zentrum: Profil, Prüfungsprofile, Rückwärtsplan, Ergebnisse, Verweise */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  profilNormieren, pruefungFuer, schriftlichAm, muendlichAm, zielTermin, rueckwaertsplan, planFuer, phaseAm,
  countdown, ergebnisEintragen, statistik, schwaechstesGebiet, abiNormieren, heuteVorschlaege, TRAINER, KURSE, SIMULATION,
  tageZwischen, plusTage, datumLang, niveauWorte, minutenFuer, PRUEFUNGEN,
} from "../src/abiZentrum.js";
import { WERKZEUGE } from "../src/werkzeuge.js";

test("Profil: BW Leistungsfach schriftlich mit WTR, Basisfach mündlich; Unsinn wird bereinigt", () => {
  const lf = profilNormieren({ land: "BW", niveau: "erhoeht", form: "muendlich", hilfsmittel: "CAS" });
  assert.equal(lf.form, "schriftlich"); assert.equal(lf.hilfsmittel, "WTR");
  const bf = profilNormieren({ land: "BW", niveau: "grundlegend", form: "schriftlich" });
  assert.equal(bf.form, "muendlich");
  const x = profilNormieren({ land: "XX", jahr: "abc", niveau: "?", punkte: 22, ziel: -3, minuten: 17, termin: "morgen" });
  assert.equal(x.land, "BW"); assert.equal(x.jahr, 2027); assert.equal(x.niveau, "erhoeht");
  assert.equal(x.punkte, 15); assert.equal(x.ziel, 0); assert.equal(x.minuten, 20); assert.equal(x.termin, null);
  assert.equal(profilNormieren({ land: "NW", niveau: "grundlegend", form: "beides", hilfsmittel: "CAS" }).hilfsmittel, "CAS");
  assert.equal(niveauWorte("BW").erhoeht, "Leistungsfach");
  assert.equal(niveauWorte("NW").grundlegend, "Grundkurs (GK)");
});

test("Prüfungsprofile: BW-Leistungsfach 100 BE, Teil A 30 BE, Teil B 70 BE; Termine 2027", () => {
  const lf = PRUEFUNGEN["bw-lf"];
  assert.equal(lf.be, 100);
  assert.equal(lf.teilA.be + Object.values(lf.teilB.be).reduce((s, x) => s + x, 0), 100);
  assert.equal(lf.teilA.pflicht.length * lf.teilA.beJe + lf.teilA.wahl.waehle * lf.teilA.beJe, lf.teilA.be);
  assert.equal(lf.teilA.vorgelegt, lf.teilA.pflicht.length + lf.teilA.wahl.aus);
  assert.equal(pruefungFuer({ land: "BW", niveau: "erhoeht" }).id, "bw-lf");
  assert.equal(pruefungFuer({ land: "BW", niveau: "grundlegend" }).id, "bw-bf");
  assert.equal(pruefungFuer({ land: "BY", niveau: "grundlegend" }).id, "iqb-ga");
  assert.equal(schriftlichAm({ land: "BW", niveau: "erhoeht", jahr: 2027 }), "2027-05-05");
  assert.equal(muendlichAm({ land: "BW", niveau: "grundlegend", jahr: 2027 }), "2027-06-28");
  assert.equal(schriftlichAm({ land: "BY", niveau: "erhoeht", jahr: 2027 }), null);
  assert.equal(schriftlichAm({ land: "BY", niveau: "erhoeht", termin: "2027-05-07" }), "2027-05-07");
  assert.equal(zielTermin({ land: "BW", niveau: "erhoeht", jahr: 2027 }, "2026-10-21"), "2027-05-05");
  assert.equal(zielTermin({ land: "BW", niveau: "erhoeht", jahr: 2027 }, "2027-06-01"), null);
  assert.equal(minutenFuer(100), 300);
});

test("Datum: Tage, Wochentag, Countdown", () => {
  assert.equal(tageZwischen("2026-10-21", "2027-05-05"), 196);
  assert.equal(plusTage("2027-03-31", 1), "2027-04-01");
  assert.equal(datumLang("2027-05-05"), "Mittwoch, 5. Mai 2027");
  assert.deepEqual(countdown("2027-05-05", "2026-10-21"), { tage: 196, wochen: 28, vorbei: false, heute: false });
});

test("Rückwärtsplan: lückenlos, in Reihenfolge, Generalprobe zwei Wochen vorher, für jede Länge", () => {
  const ziel = "2027-05-05";
  for (let D = 1; D <= 260; D++) {
    const von = plusTage(ziel, -D);
    const { phasen, meilensteine } = rueckwaertsplan(von, ziel);
    assert.ok(phasen.length >= 1, `D=${D}`);
    assert.equal(phasen[0].von, von, `D=${D} Start`);
    assert.equal(phasen.at(-1).bis, plusTage(ziel, -1), `D=${D} Ende`);
    for (let i = 1; i < phasen.length; i++) assert.equal(phasen[i].von, plusTage(phasen[i - 1].bis, 1), `D=${D} Lücke vor ${phasen[i].id}`);
    for (const p of phasen) assert.ok(p.von <= p.bis, `D=${D} ${p.id}`);
    assert.equal(meilensteine.at(-1).id, "pruefung");
    for (const m of meilensteine) assert.ok(m.datum >= von && m.datum <= ziel, `D=${D} ${m.id}`);
    if (D > 14) assert.equal(meilensteine.find((m) => m.id === "generalprobe").datum, "2027-04-21");
    for (let i = 1; i < meilensteine.length; i++) assert.ok(meilensteine[i - 1].datum <= meilensteine[i].datum);
  }
  const lang = rueckwaertsplan("2026-10-21", ziel);
  assert.deepEqual(lang.phasen.map((p) => p.id), ["start", "fundament", "teilb", "form", "wiederholen"]);
  assert.ok(lang.meilensteine.some((m) => m.id === "probeabi1") && lang.meilensteine.some((m) => m.id === "teilaprobe"));
  const muendlich = rueckwaertsplan("2027-03-01", "2027-06-28", { muendlich: true });
  assert.deepEqual(muendlich.phasen.map((p) => p.id), ["start", "muendlich", "wiederholen"]);
  assert.equal(rueckwaertsplan(ziel, ziel).phasen.length, 0);
});

test("Plan aus Profil: Phase heute, Basisfach zielt auf die mündliche Prüfung", () => {
  const plan = planFuer({ land: "BW", niveau: "erhoeht", jahr: 2027 }, null, "2026-10-21");
  assert.equal(plan.ziel, "2027-05-05");
  assert.equal(phaseAm(plan, "2026-10-21").id, "start");
  assert.equal(phaseAm(plan, "2027-05-04").id, "wiederholen");
  // Generalprobe am Samstag vor Beginn der schriftlichen Prüfungen (BW 2027: ab 16.4.), nicht mitten in den Prüfungen
  assert.equal(plan.meilensteine.find((m) => m.id === "generalprobe").datum, "2027-04-10");
  const eigen = planFuer({ land: "BY", niveau: "erhoeht", termin: "2027-05-07", pruefungenAb: "2027-04-28" }, null, "2026-10-21");
  assert.equal(eigen.meilensteine.find((m) => m.id === "generalprobe").datum, "2027-04-24");
  const bf = planFuer({ land: "BW", niveau: "grundlegend", jahr: 2027 }, null, "2026-10-21");
  assert.equal(bf.ziel, "2027-06-28"); assert.equal(bf.muendlich, true);
  const begonnen = planFuer({ land: "BW", niveau: "erhoeht", jahr: 2027 }, { beginn: "2026-10-01" }, "2026-10-21");
  assert.equal(begonnen.phasen[0].von, "2026-10-01");
});

test("Ergebnisse: Quote je Gebiet, schwächstes Gebiet, Vorschläge zeigen auf echte Ansichten", () => {
  let abi = abiNormieren(null);
  assert.equal(schwaechstesGebiet(abi), "analysis");
  abi = ergebnisEintragen(abi, { typ: "ana-tangente", sachgebiet: "analysis", be: 5, max: 5 }, 1);
  abi = ergebnisEintragen(abi, { typ: "geo-lage", sachgebiet: "geometrie", be: 2, max: 5 }, 2);
  abi = ergebnisEintragen(abi, { typ: "sto-binom", sachgebiet: "stochastik", be: 4, max: 5 }, 3);
  abi = ergebnisEintragen(abi, { typ: "sto-binom", sachgebiet: "stochastik", be: 9, max: 5 }, 4);
  const s = statistik(abi);
  assert.equal(s.analysis.quote, 1); assert.equal(s.stochastik.be, 9); assert.equal(abi.zuletzt, 4);
  assert.equal(schwaechstesGebiet(abi), "geometrie");
  const pfade = readFileSync(new URL("../src/pfade.js", import.meta.url), "utf8");
  const ansichten = new Set([...pfade.matchAll(/ansicht: *"([a-z0-9]+)"/g)].map((m) => m[1]));
  const profil = { land: "BW", niveau: "erhoeht", jahr: 2027 };
  const plan = planFuer(profil, null, "2026-10-21");
  for (const tag of ["2026-10-21", "2027-03-20", "2027-04-30"]) {
    for (const v of heuteVorschlaege(profil, plan, abi, tag)) assert.ok(ansichten.has(v.ziel.ansicht), `Vorschlag ${v.id} → ${v.ziel.ansicht}`);
  }
  for (const k of [...KURSE, ...SIMULATION]) assert.ok(ansichten.has(k.ziel.ansicht), `${k.id} → ${k.ziel.ansicht}`);
  for (const liste of Object.values(TRAINER)) for (const t of liste) assert.ok(WERKZEUGE[t], `Trainer ${t}`);
});

test("Profil: drittes Niveau Basisfach und Abi-Jahre zum Antippen", async () => {
  const { profilNormieren, pruefungFuer, abiJahre, NIVEAU_WAHL } = await import("../src/abiZentrum.js");
  assert.deepEqual(NIVEAU_WAHL.map(([, t]) => t), ["LK", "GK", "Basisfach"]);
  assert.equal(profilNormieren({ niveau: "basis" }).niveau, "basis");
  assert.equal(pruefungFuer({ land: "BW", niveau: "basis" }).id, "bw-bf");
  assert.equal(pruefungFuer({ land: "BY", niveau: "basis" }).id, "iqb-ga");
  assert.equal(profilNormieren({ land: "BW", niveau: "basis", form: "schriftlich" }).form, "muendlich");
  assert.deepEqual(abiJahre(new Date("2026-10-21")), [2027, 2028, 2029, 2030, 2031]);
  assert.deepEqual(abiJahre(new Date("2027-03-01")), [2027, 2028, 2029, 2030, 2031]);
});

test("Masterclass und Abi-Zentrum sind eins: Kursbereich im Zentrum, nur mit Angebot „Kurse“ oder Passwort", () => {
  const z = readFileSync(new URL("../src/funcAbiZentrum.jsx", import.meta.url), "utf8");
  assert.ok(z.includes('titel="Mathe-Abi-Masterclass"'));
  assert.ok(/\(ANGEBOT\.kurse \|\| frei\) && \(\s*<Abschnitt[^>]*data-abi-kursbereich/.test(z));
  assert.ok(!KURSE.some((k) => k.ziel.ansicht === "mckurs"), "Kursbereich nicht doppelt in der Kursliste");
});
