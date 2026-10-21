import test from "node:test";
import assert from "node:assert/strict";
import { istPro, kontoArt, kontoEintraege, zugangEintrag, klasseErmitteln, klasseLabel, klassenInhalt, aktiverPunkt, KI_MENUE, TRAINING, KURSE, LEISTE, kurseListe, baldListe,
  trainingsBereiche, werkzeugAnzahl, entdeckenGruppen, FORMELN, NACHSCHLAGEN, zuletztAus, STUFEN } from "../src/hauptmenue.js";
import { WERKZEUGE, passtStufe } from "../src/werkzeuge.js";
import { ENTDECKEN_MENUE } from "../src/startMenues.js";
import { ANGEBOT } from "../src/angebot.js";
const MIT_PRO = { ...ANGEBOT, pro: true, kurse: true };
import { SEITEN } from "../src/pfade.js";

test("Pro nur mit plan=pro und nicht abgelaufen", () => {
  assert.equal(istPro(null), false);
  assert.equal(istPro({ plan: "free" }), false);
  assert.equal(istPro({ plan: "pro" }), true);
  assert.equal(istPro({ plan: "pro", pro_bis: "2000-01-01" }), false);
  assert.equal(istPro({ plan: "pro", pro_bis: "2999-01-01" }), true);
});

test("Account-Art je Rolle", () => {
  assert.equal(kontoArt({ rolle: "schueler" }), "Trainings-Account");
  assert.equal(kontoArt({ rolle: "eltern" }), "Eltern-Account");
  assert.equal(kontoArt({ rolle: "lehrkraft", geschlecht: "w" }), "Lehrerin-Account");
  assert.equal(kontoArt({ rolle: "lehrkraft" }), "Lehrer-Account");
  assert.equal(kontoArt(null), "Trainings-Account");
});

test("Konto-Menü: Pro werden oder Mein Plan (nur mit Angebot „Pro“), rollenabhängige Einträge", () => {
  assert.ok(kontoEintraege({ rolle: "schueler" }, true, MIT_PRO).some((e) => e.id === "pro"));
  assert.ok(kontoEintraege({ rolle: "schueler", plan: "pro" }, true, MIT_PRO).some((e) => e.id === "plan"));
  assert.ok(kontoEintraege(null, false, MIT_PRO).some((e) => e.id === "pro"));
  assert.ok(kontoEintraege({ rolle: "eltern" }).some((e) => e.id === "kinder"));
  assert.ok(kontoEintraege({ rolle: "lehrkraft" }).some((e) => e.id === "klassen"));
  assert.ok(kontoEintraege({ rolle: "lehrkraft" }).some((e) => e.id === "arbeitsblatt" && e.ziel.ansicht === "lehrerblatt"));
  assert.ok(!kontoEintraege({ rolle: "schueler" }).some((e) => e.id === "arbeitsblatt"));
});

test("Blog-Start: weder „Pro werden“ noch „Mein Plan“ im Menü, dafür „Unterstützen“", () => {
  assert.equal(ANGEBOT.pro, false);
  for (const rolle of ["schueler", "eltern", "lehrkraft", "nachhilfe"]) {
    assert.ok(!kontoEintraege({ rolle }).some((e) => e.id === "pro" || e.id === "plan"), rolle);
    assert.ok(!kontoEintraege({ rolle, plan: "pro" }).some((e) => e.id === "pro" || e.id === "plan"), rolle);
  }
  const gast = kontoEintraege(null, false);
  assert.ok(gast.every(Boolean));
  assert.ok(gast.some((e) => e.id === "spenden" && e.ziel.ansicht === "spenden"));
});

test("Meine Kurse: Masterclass und „Bald“-Platzhalter nur mit Angebot „Kurse“", () => {
  assert.ok(!KURSE.some((k) => k.id === "mckurs") && KURSE.length > 0);
  assert.deepEqual(baldListe(), []);
  // Masterclass und Abi-Zentrum sind ein Eintrag: „Mathe-Abi-Masterclass“ → /abi, der Kursbereich liegt im Zentrum
  for (const cfg of [undefined, MIT_PRO]) {
    const l = kurseListe(cfg);
    assert.ok(!l.some((k) => k.id === "mckurs"));
    assert.equal(l.filter((k) => /masterclass/i.test(k.name)).length, 1);
    assert.equal(l.find((k) => /masterclass/i.test(k.name)).ziel.ansicht, "abi");
  }
  assert.ok(baldListe(MIT_PRO).length > 0);
  assert.deepEqual(klassenInhalt({ schulart: "g9", box: "10" }).bald, []);
});

test("☰-Menü: Konto-Punkte einzeilig, Abmelden/Anmelden nur als letzter Punkt (zugangEintrag)", () => {
  for (const rolle of ["schueler", "eltern", "lehrkraft", "nachhilfe"]) {
    const l = kontoEintraege({ rolle });
    assert.ok(l.length >= 4 && l.length <= 6, rolle + ": " + l.length);
    assert.ok(!l.some((e) => e.id === "abmelden" || e.id === "anmelden"), "Zugang steht nicht in der Liste");
    assert.ok(l.every((e) => !e.zeile), "keine zweite Zeile");
  }
  const gast = kontoEintraege(null, false);
  assert.ok(!gast.some((e) => e.id === "abmelden" || e.id === "anmelden"));
  assert.deepEqual(zugangEintrag(true), { id: "abmelden", name: "Abmelden", aktion: "abmelden" });
  assert.equal(zugangEintrag(false).id, "anmelden");
  assert.equal(zugangEintrag(false).ziel.ansicht, "konto");
});

test("Klasse: Profil vor Quickfinder, Beschriftung", () => {
  assert.deepEqual(klasseErmitteln({ schulform: "G9", klasse: 10 }, null), { schulart: "g9", box: "10" });
  assert.deepEqual(klasseErmitteln({ schulform: "G8", klasse: 6 }, null), { schulart: "g8", box: "5-6" });
  assert.deepEqual(klasseErmitteln(null, { schulart: "gms", klasse: "8" }), { schulart: "gms", box: "8" });
  assert.equal(klasseErmitteln(null, { schulart: "g8", klasse: "13" }), null);
  assert.equal(klasseErmitteln(null, null), null);
  assert.equal(klasseLabel({ schulart: "g9", box: "10" }), "Klasse 10 (G9)");
  assert.equal(klasseLabel(null), "Meine Klasse");
});

test("Klassen-Inhalt: Kapitel mit Trainieren-Ziel", () => {
  const i = klassenInhalt({ schulart: "g9", box: "10" });
  assert.ok(i.kapitel.length > 0);
  for (const k of i.kapitel) assert.equal(k.trainieren.ansicht, "trainieren");
});

test("Mathe-Training: jedes Werkzeug der Stufe steht im Menü, Abi nur Oberstufe/Alle, keine leeren Stationen", () => {
  for (const { id: stufe } of STUFEN) {
    const bereiche = trainingsBereiche(stufe);
    assert.ok(bereiche.length > 0, stufe);
    const imMenue = new Set(bereiche.flatMap((b) => b.stationen.flatMap((s) => s.werkzeuge.map((w) => w.id))));
    for (const [id, w] of Object.entries(WERKZEUGE)) {
      if (passtStufe(w, stufe) && !imMenue.has(id) && stufe === "alle") assert.fail(`Werkzeug ${id} fehlt im Menü (alle)`);
    }
    for (const b of bereiche) {
      assert.ok(b.stationen.length > 0 && b.anzahl > 0, `${stufe}/${b.id} leer`);
      for (const st of b.stationen) for (const w of st.werkzeuge) {
        assert.ok(w.name && w.zeichen && w.ziel && w.ziel.ansicht, `${stufe}/${b.id}/${w.id} unvollständig`);
        if (!b.abi) assert.ok(passtStufe(WERKZEUGE[w.id], stufe), `${w.id} passt nicht zu ${stufe}`);
      }
    }
    assert.equal(bereiche.some((b) => b.abi), stufe === "ober" || stufe === "alle", `Abi in ${stufe}`);
  }
  assert.ok(werkzeugAnzahl("alle") > werkzeugAnzahl("ober"));
  assert.ok(!trainingsBereiche("mittel").some((b) => b.id === "vektoren"));
});

test("Mathe entdecken: alle Lernangebote der Startseite, in Gruppen", () => {
  const g = entdeckenGruppen();
  assert.equal(g.length, ENTDECKEN_MENUE.filter((e) => e.kopf).length);
  assert.equal(g.reduce((n, x) => n + x.eintraege.length, 0), ENTDECKEN_MENUE.filter((e) => !e.kopf).length);
  for (const x of g) for (const e of x.eintraege) assert.ok(e.zeichen, e.name);
});

test("Weitermachen: nur echte Werkzeuge, mit Bereich und Tag", () => {
  const jetzt = new Date(2026, 9, 19, 12);
  const z = zuletztAus(JSON.stringify({ ansicht: "plotter", zeit: new Date(2026, 9, 18, 20).getTime() }), jetzt);
  assert.equal(z.name, "Kurvendiskussion");
  assert.equal(z.wann, "gestern");
  assert.equal(z.ziel.ansicht, "plotter");
  assert.equal(zuletztAus(JSON.stringify({ ansicht: "start", zeit: 0 }), jetzt), null);
  assert.equal(zuletztAus("kaputt{", jetzt), null);
  assert.equal(zuletztAus(null, jetzt), null);
});

test("Jedes Menü-Ziel hat eine Seite mit Pfad", () => {
  const ansichten = new Set(SEITEN.map((s) => s.ansicht));
  const ziele = [...KI_MENUE, ...TRAINING, ...kurseListe({ kurse: true }), ...FORMELN, ...NACHSCHLAGEN, ...entdeckenGruppen().flatMap((g) => g.eintraege),
    ...trainingsBereiche("alle").filter((b) => b.abi).flatMap((b) => b.stationen[0].werkzeuge), ...kontoEintraege({ rolle: "eltern" }), ...kontoEintraege({ rolle: "schueler" }), ...kontoEintraege({ rolle: "lehrkraft" }), ...kontoEintraege(null, false), zugangEintrag(false)].filter((e) => e.ziel).map((e) => e.ziel.ansicht);
  for (const a of ziele) assert.ok(ansichten.has(a), "kein Pfad für " + a);
  assert.deepEqual(LEISTE.map((p) => p.id), ["klasse", "schultraining", "training", "entdecken", "mathematik"]);
});

test("Aktiver Punkt", () => {
  assert.equal(aktiverPunkt("analyse", "blatt"), "mathilda");
  assert.equal(aktiverPunkt("diffkurs"), "kurse");
  assert.equal(aktiverPunkt("warmup"), "training");
  assert.equal(aktiverPunkt("formeln"), "mathematik");
  assert.equal(aktiverPunkt("plotter"), "schultraining");
  assert.equal(aktiverPunkt("abisaetze"), "schultraining");
  assert.equal(aktiverPunkt("bwm"), "entdecken");
  assert.equal(aktiverPunkt("elternkurs"), "kurse");
  assert.equal(aktiverPunkt("start"), null);
});

/* ---------- Desktop-Menü (ab 900 px, funcHauptmenueDesktop.jsx) ---------- */
import { readFileSync } from "node:fs";
const datei = (n) => readFileSync(new URL(`../src/${n}`, import.meta.url), "utf-8");

test("Desktop-Menü: ab 900 px statt des ☰-Fensters, Handy-Fenster bleibt", () => {
  const hm = datei("funcHauptmenue.jsx");
  const d = datei("funcHauptmenueDesktop.jsx");
  assert.ok(d.includes("export const DESKTOP_MENUE_AB = 900;"));
  assert.ok(hm.includes("{istOffen && desktop && (") && hm.includes("<DesktopMenue ") && hm.includes("{istOffen && !desktop && lage && ("), "HauptMenue wählt je nach Breite");
  assert.ok(hm.includes("function DarstellungWahl") && hm.includes("<DarstellungWahl />"), "Handy-Fenster unverändert mit Darstellung ganz unten");
});

test("Desktop-Menü: alle Abschnitte, Darstellung in der Fußzeile, kein Karoraster", () => {
  const d = datei("funcHauptmenueDesktop.jsx");
  for (const a of ["data-hm-mathilda", "data-hm-weiter", 'data-hmd-abschnitt="klasse"', 'data-hmd-abschnitt="schultraining"', 'data-hmd-abschnitt="training"',
    'data-hmd-abschnitt="mathematik"', "data-hm-kurse", 'data-hmd-abschnitt="entdecken"', "data-hm-konto", "data-hm-zugang", "data-hmd-darstellung"]) {
    assert.ok(d.includes(a), `Abschnitt ${a} fehlt`);
  }
  assert.ok(d.indexOf("<Darstellung modus={modus} />") > d.indexOf('className="hmd-fuss"'), "Darstellung steht in der Fußzeile");
  assert.ok(!/background-size:\s*\d+px \d+px/.test(d) && !/backgroundSize:\s*"\d+px \d+px"/.test(d), "Kein Karoraster (Marke)");
});

test("Desktop-Menü: große Kurse gibt es alle, Stand nur aus kursStand.js", () => {
  const d = datei("funcHauptmenueDesktop.jsx");
  const lack = [...d.split("const LACK = {")[1].split("\n};")[0].matchAll(/^\s{2}(\w+): \{/gm)].map((m) => m[1]);
  assert.deepEqual(lack.sort(), ["diffkurs", "geokurs", "gfs", "kiwahl", "unterstufe", "vekkurs"]);
  for (const id of lack) assert.ok(KURSE.some((k) => k.id === id), `${id} steht nicht in KURSE`);
  const zurStufe = d.match(/KURS_ZUR_STUFE = \{([^}]+)\}/)[1];
  for (const s of STUFEN) assert.ok(zurStufe.includes(`${s.id}:`), `Stufe ${s.id} ohne passenden Kurs`);
  assert.ok(d.includes('from "./kursStand.js"'), "Fortschritt kommt aus kursStand.js");
  assert.ok(!/\d+\s*%/.test(d.split("export function DesktopMenue")[1].replace(/\d+%\)/g, "")), "Keine erfundenen Prozentwerte im Menü");
});
