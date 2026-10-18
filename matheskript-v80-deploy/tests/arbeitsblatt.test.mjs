/* Lehrer-Arbeitsblatt-Generator (src/arbeitsblatt.js): Quellen, Aufgabentexte, Verteilung, Gruppen, QR-Link */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as AB from "../src/arbeitsblatt.js";
import { unterthemen, UNTERTHEMEN_KAPITEL } from "../src/unterthemen.js";
import { SCHULARTEN, klassenBoxen } from "../src/schulbuch.js";
import { lies } from "../src/trainingDaten.js";

/* reproduzierbarer Zufall */
const zufall = (s = 1) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

test("jede Zusatzquelle existiert und hängt an einem echten Unterthema", () => {
  const ids = new Set(UNTERTHEMEN_KAPITEL.flatMap((k) => unterthemen(k).map((t) => t.id)));
  for (const [teil, quellen] of Object.entries(AB.BLATT_ZUSATZ)) {
    assert.ok(ids.has(teil), `Unterthema ${teil} gibt es nicht`);
    for (const q of quellen) assert.ok(AB.UNTER_IDS.includes(q), `${teil}: Quelle ${q} fehlt`);
  }
});

const VERBOTEN = [/z\. B\. \d/, /mindestens drei Nachkommastellen/, /undefined/, /NaN/, /Infinity/, /\[object/, /Gib die größere/, /\$\s*\$/];
test("alle Quellen liefern vollständige Papieraufgaben (je 150 Durchläufe)", () => {
  for (const q of AB.ALLE_QUELLEN) {
    const z = zufall(7);
    for (let i = 0; i < 150; i++) {
      const a = AB.aufgabeAus(q, z);
      assert.ok(a.text && a.text.length > 8, `${q}: Text fehlt`);
      assert.ok(a.ergebnis && String(a.ergebnis).trim(), `${q}: Ergebnis fehlt`);
      assert.ok(Array.isArray(a.weg), `${q}: Lösungsweg fehlt`);
      assert.ok([1, 2, 3].includes(a.afb), `${q}: Anforderungsbereich ${a.afb}`);
      const alles = [a.text, a.ergebnis, ...a.weg, ...(a.optionen || []), ...(a.tabelle ? [...a.tabelle.kopf, ...a.tabelle.zeile] : [])].join(" | ");
      for (const re of VERBOTEN) assert.ok(!re.test(alles), `${q}: ${re} in „${alles.slice(0, 160)}“`);
      assert.equal((a.text.match(/\$/g) || []).length % 2, 0, `${q}: ungerade Zahl von $ im Text`);
      assert.equal((String(a.ergebnis).match(/\$/g) || []).length % 2, 0, `${q}: ungerade Zahl von $ im Ergebnis`);
      if (a.optionen) assert.ok(/^[a-f]\) /.test(a.ergebnis), `${q}: Auswahl-Ergebnis ohne Buchstabe`);
      if (a.tabelle) assert.equal(a.tabelle.kopf.length, a.tabelle.zeile.length, `${q}: Tabelle schief`);
    }
  }
});

test("Ergebnisse der Trainingsgeneratoren stimmen mit dem berechneten Wert überein", () => {
  const ohneEigenes = AB.ALLE_QUELLEN.filter((q) => q.startsWith("td:") && !["td:gl-quadrat", "td:lgs-zwei", "td:fkt-scheitel"].includes(q));
  for (const q of ohneEigenes) {
    for (let i = 0; i < 60; i++) {
      const a = AB.aufgabeAus(q);
      if (a.optionen) continue;
      /* Zahl aus dem Ergebnis lesen: \frac{a}{b} oder Dezimalzahl mit Komma */
      const roh = String(a.ergebnis).replace(/\$/g, "").replace(/≈/g, "").replace(/°/g, "").trim().split(" ")[0];
      const fr = /^(−)?\\frac\{(\d+)\}\{(\d+)\}$/.exec(roh);
      const v = fr ? (fr[1] ? -1 : 1) * Number(fr[2]) / Number(fr[3]) : lies(roh);
      assert.ok(v !== null, `${q}: Ergebnis „${a.ergebnis}“ nicht lesbar`);
    }
  }
});

test("Papiertexte enthalten keine Eingabehinweise der App", () => {
  assert.equal(AB.blattText("Berechne $x$. Gib das Ergebnis als Bruch (z. B. 7/12) oder als Dezimalzahl mit mindestens drei Nachkommastellen an."), "Berechne $x$. Gib das Ergebnis exakt an.");
  assert.equal(AB.blattText("Löse $x^2 = 4$. Gib die größere der beiden Lösungen an."), "Löse $x^2 = 4$.");
});

test("jede Klasse jeder Schulart hat Kapitel mit Aufgaben, und die Kapitelliste stimmt", () => {
  for (const s of SCHULARTEN) for (const b of klassenBoxen(s.id)) {
    const k = AB.kapitelMitAufgaben(s.id, b.id);
    assert.ok(k.length >= 2, `${s.id} ${b.id}: nur ${k.length} Kapitel mit Aufgaben`);
    for (const kap of k) {
      assert.ok(kap.typen > 0);
      assert.ok(kap.unterthemen.some((t) => t.quellen.length), `${kap.id} ohne Unterthema mit Quelle`);
    }
  }
  /* Unterstufe ist jetzt abgedeckt */
  const unter = AB.kapitelMitAufgaben("g9", "5-6").map((k) => k.id);
  for (const id of ["natzahlen", "rechnen", "groessen", "brueche", "dezimal", "daten"]) assert.ok(unter.includes(id), `${id} fehlt in 5/6`);
});

test("Verteilung: gleichmäßig über die Unterthemen, aufsteigend sortiert", () => {
  const teile = ["prozent.1", "prozent.3", "prozent.5"];
  const f = AB.quellenFolge(teile, 10, "aufsteigend", zufall(3));
  assert.equal(f.length, 10);
  const je = teile.map((t) => f.filter((x) => x.teil === t).length);
  assert.ok(Math.max(...je) - Math.min(...je) <= 1, `ungleich verteilt: ${je}`);
  const afb = f.map((x) => AB.afbVon(x.quelle));
  assert.deepEqual(afb, [...afb].sort((a, b) => a - b), "nicht aufsteigend");
  /* gleicher Typ nicht direkt hintereinander, wenn genug andere Typen da sind */
  for (let r = 1; r < 30; r++) {
    const g = AB.quellenFolge(["prozent.1", "prozent.2", "prozent.4", "prozent.5"], 10, "aufsteigend", zufall(r));
    const doppelt = g.filter((x, i) => i && x.quelle === g[i - 1].quelle).length;
    assert.ok(doppelt <= 1, `Lauf ${r}: ${doppelt}× derselbe Typ hintereinander`);
  }
  /* Leicht: nur Anforderungsbereich 1, wo es ihn gibt */
  const leicht = AB.quellenFolge(["prozent.4", "prozent.1"], 8, "leicht", zufall(5));
  assert.ok(leicht.every((x) => AB.afbVon(x.quelle) === 1 || x.teil === "prozent.4"));
});

test("Blatt mit Gruppe A/B: gleiche Typen, andere Zahlen; Tauschen behält den Typ", () => {
  const z = zufall(11);
  const blatt = AB.blattErstellen({ teile: ["bruchrechnen.1", "bruchrechnen.3", "quad.4"], anzahl: 12, gruppen: 2, z });
  assert.equal(blatt.gruppen.length, 2);
  const [A, B] = blatt.gruppen;
  assert.equal(A.name, "A"); assert.equal(B.name, "B");
  assert.equal(A.aufgaben.length, 12); assert.equal(B.aufgaben.length, 12);
  A.aufgaben.forEach((a, i) => assert.equal(a.quelle, B.aufgaben[i].quelle));
  const texteA = new Set(A.aufgaben.map((a) => a.text));
  assert.ok(texteA.size >= 11, "Gruppe A hat doppelte Aufgaben");
  assert.ok(B.aufgaben.filter((b) => texteA.has(b.text)).length <= 1, "Gruppe B wiederholt Aufgaben aus A");
  const neu = AB.aufgabeTauschen(blatt, 3, z);
  assert.equal(neu.gruppen[0].aufgaben[3].quelle, A.aufgaben[3].quelle);
  assert.notEqual(neu.gruppen[0].aufgaben[3].text, A.aufgaben[3].text);
  assert.equal(neu.gruppen[0].aufgaben[2], A.aufgaben[2]);
  /* Anzahl wird auf 1–20 begrenzt */
  assert.equal(AB.blattErstellen({ teile: ["prozent.1"], anzahl: 99 }).gruppen[0].aufgaben.length, 20);
});

test("Titel und QR-Link", () => {
  assert.equal(AB.blattTitel(["prozent.1"]), "Prozentwert berechnen");
  assert.equal(AB.blattTitel(["prozent.1", "prozent.3"]), "Prozent- und Zinsrechnung");
  assert.equal(AB.blattTitel(["prozent.1", "quad.4"]), "Gemischte Übung");
  assert.equal(AB.trainingsLink({ teile: ["quad.4"], schulart: "g9", box: "9", ref: "482913" }),
    "https://mythosmathe.de/trainieren?kapitel=quad&teil=quad.4&schulart=g9&box=9&ref=482913");
  assert.equal(AB.trainingsLink({ teile: ["quad.4", "prozent.1"], ref: "12" }), "https://mythosmathe.de/trainieren");
  assert.equal(AB.boxZuStufe("g9", 6), "5-6");
  assert.equal(AB.boxZuStufe("g8", 12), "12");
});

test("Zahlformat: Komma, Geld, Tausendertrenner", () => {
  assert.equal(AB.dz(0.125), "0,125");
  assert.equal(AB.dz(-2.5), "−2,5");
  assert.equal(AB.geld(4.8), "4,80");
  assert.equal(AB.geld(25), "25");
  assert.equal(AB.gz(1334270), "1 334 270");
  assert.equal(AB.gz(4500), "4500");
});
