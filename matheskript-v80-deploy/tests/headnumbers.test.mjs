/* Tests für Head & Numbers (reine Logik). Ausführen: node --test tests/*.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLE_ITEMS, BEREICH, BLOECKE, EINMALEINS_100, FAKTEN, FORMATE, FORMAT_RICHTUNG, ITEMS, ITEM_INFO, KUBIK_SOLL, MODULE, QUADRATE_SOLL, SCHNELL_SEK, STUFEN, TAG_MS, RANG,
  FEHLERART_KOPF, aufgabeFuer, baueRunde, bucheFehler, fehlerAus, fehlerName, haeufigeFehlerarten, kurzStand, bucheVerstehen, buche, empfehlung, faktStatus, formatFuerKey, gesamtUebersicht, gewichtVon, istFaellig, istKubik, istQuadrat, itemText, kandidaten,
  leererKopfStand, markiereEntdeckt, modulUebersicht, musterAufgabe, normiereKopf, offeneBloecke, paarRunde, schwacheGrundlagen, setzeBest, status, stufenStand, tagNr,
  validiereBestand, waehleItems, wertung, formateFuer,
} from "../src/headNumbers.js";
import { normiere } from "../src/trainingDaten.js";
import { mergeLernstand } from "../src/lernMerge.js";
import { readFileSync } from "node:fs";

/* deterministischer Zufall */
function seed(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const T0 = Date.UTC(2026, 9, 12, 12);

/* ---------------- Bestand ---------------- */
test("Bestand: Definition ist in sich stimmig", () => {
  assert.deepEqual(validiereBestand(), []);
  assert.deepEqual(BEREICH.einmaleins, { min: 1, max: 10 });
  assert.deepEqual(BEREICH.quadrate, { min: 1, max: 25 });
  assert.deepEqual(BEREICH.kubik, { min: 1, max: 10 });
});
test("Bestand: Quadratzahlen 1² bis 25² und Kubikzahlen 1³ bis 10³ wie im Auftrag", () => {
  assert.deepEqual(FAKTEN.quadrate.map((f) => f.wert), [...QUADRATE_SOLL]);
  assert.deepEqual(FAKTEN.kubik.map((f) => f.wert), [...KUBIK_SOLL]);
  assert.equal(QUADRATE_SOLL.length, 25);
  assert.equal(QUADRATE_SOLL[24], 625);
  assert.equal(KUBIK_SOLL[9], 1000);
  QUADRATE_SOLL.forEach((v, i) => assert.equal(v, (i + 1) ** 2));
  KUBIK_SOLL.forEach((v, i) => assert.equal(v, (i + 1) ** 3));
});
test("Bestand: 100 Einmaleins-Aufgaben, 55 Fakten, 180 Items, Schlüssel eindeutig", () => {
  assert.equal(EINMALEINS_100.length, 100);
  assert.equal(new Set(EINMALEINS_100.map(([a, b]) => `${a}x${b}`)).size, 100);
  assert.equal(FAKTEN.einmaleins.length, 55);
  assert.equal(ALLE_ITEMS.length, 180);
  assert.equal(new Set(ALLE_ITEMS).size, 180);
  assert.equal(ITEMS.einmaleins.length, 110); assert.equal(ITEMS.quadrate.length, 50); assert.equal(ITEMS.kubik.length, 20);
});
test("Bestand: jeder Fakt liegt in genau einem Block, Blöcke decken alles ab", () => {
  for (const m of MODULE) {
    const zaehler = BLOECKE[m].map(() => 0);
    for (const f of FAKTEN[m]) zaehler[f.block] += 1;
    assert.equal(zaehler.reduce((a, b) => a + b, 0), FAKTEN[m].length);
    zaehler.forEach((z) => assert.ok(z > 0, `${m}: leerer Block`));
  }
  assert.deepEqual(BLOECKE.einmaleins.map((_, i) => FAKTEN.einmaleins.filter((f) => f.block === i).length), [10, 11, 7, 8, 9, 10]);
  // kleine Pakete: nirgends mehr als 11 Fakten (= 22 Items) in einem Block
  for (const m of MODULE) for (let i = 0; i < BLOECKE[m].length; i++) assert.ok(FAKTEN[m].filter((f) => f.block === i).length <= 11, `${m}: Block ${i} zu groß`);
});
test("Bestand: alle 100 Aufgaben a · b sind abfragbar, in beiden Faktorreihenfolgen", () => {
  for (const [a, b] of EINMALEINS_100) {
    const key = `e:${Math.min(a, b)}x${Math.max(a, b)}:v`;
    assert.ok(ITEM_INFO.has(key), key);
    const rng = a <= b ? () => 0.1 : () => 0.9;
    const auf = aufgabeFuer(key, "e-blitz", { rng });
    assert.equal(auf.text, `${a} · ${b}`);
    assert.equal(auf.loesung, a * b);
  }
});
test("Grenzfälle: istQuadrat und istKubik", () => {
  assert.ok(istQuadrat(1) && istQuadrat(625) && istQuadrat(0));
  assert.ok(!istQuadrat(2) && !istQuadrat(626) && !istQuadrat(-4));
  assert.ok(istKubik(1) && istKubik(1000) && istKubik(729));
  assert.ok(!istKubik(999) && !istKubik(1001) && !istKubik(-8));
  assert.ok(istQuadrat(64) && istKubik(64));
});

/* ---------------- Aufgaben: Auswertung unabhängig von der Erzeugung ---------------- */
function auswerten(text) {
  let m;
  if ((m = /^(\d+) · (\d+)$/.exec(text))) return m[1] * m[2];
  if ((m = /^(\d+) : (\d+)$/.exec(text))) return m[1] / m[2];
  if ((m = /^(\d+) · \? = (\d+)$/.exec(text))) return m[2] / m[1];
  if ((m = /^\? · (\d+) = (\d+)$/.exec(text))) return m[2] / m[1];
  if ((m = /^(\d+) · (\d+) = (\d+)$/.exec(text))) return m[1] * m[2];     // Korrektur: richtig ist a · b
  if ((m = /^(\d+)²$/.exec(text))) return m[1] ** 2;
  if ((m = /^(\d+)³$/.exec(text))) return m[1] ** 3;
  if ((m = /^√(\d+)$/.exec(text))) return Math.round(Math.sqrt(m[1]));
  if ((m = /^∛(\d+)$/.exec(text))) return Math.round(Math.cbrt(m[1]));
  if ((m = /^\?² = (\d+)$/.exec(text))) return Math.round(Math.sqrt(m[1]));
  if ((m = /^\?³ = (\d+)$/.exec(text))) return Math.round(Math.cbrt(m[1]));
  throw new Error(`Text nicht auswertbar: ${text}`);
}
const potenzWert = (t) => { const m = /^(\d+)([²³])$/.exec(t); return m[2] === "²" ? m[1] ** 2 : m[1] ** 3; };

function pruefeAllgemein(a, key) {
  assert.ok(ITEM_INFO.has(a.key), "key");
  assert.ok(a.betrifft.length > 0 && a.betrifft.every((k) => ITEM_INFO.has(k)), `betrifft ${a.format}`);
  assert.ok(typeof a.erklaerung === "string" && a.erklaerung.length > 0);
  assert.ok(a.hilfen.every((h) => typeof h === "string" && h.length > 0));
  assert.ok(["zahl", "wahl"].includes(a.art));
  if (a.art === "zahl") { assert.ok(Number.isInteger(a.loesung) && a.loesung > 0, `${a.format} Lösung`); assert.equal(a.optionen, undefined); }
  if (a.art === "wahl") {
    const werte = a.optionen.map((o) => o.wert), texte = a.optionen.map((o) => o.text);
    assert.equal(new Set(werte).size, werte.length, `${a.format}: Optionswerte doppelt`);
    assert.equal(new Set(texte).size, texte.length, `${a.format}: Optionstexte doppelt (${texte})`);
    assert.equal(werte.filter((w) => w === String(a.loesung)).length, 1, `${a.format}: genau eine richtige Option`);
    for (const w of werte) {
      const r = wertung(a, w);
      assert.equal(r.ok, w === String(a.loesung));
      assert.ok(r.items.length > 0 && r.items.every((k) => ITEM_INFO.has(k)));
    }
  }
}

test("Formate: Richtung jedes Formats passt zum Item, alle Formate erzeugbar", () => {
  assert.equal(FORMATE.length, 17);
  for (const f of FORMATE) assert.ok(FORMAT_RICHTUNG[f], f);
});

test("Zahlaufgaben: Lösung stimmt mit unabhängiger Rechnung überein (alle Items, viele Läufe)", () => {
  const rng = seed(1);
  const zahlFormate = FORMATE.filter((f) => ["e-blitz", "e-fehlt", "e-division", "e-familie", "e-korrektur", "q-blitz", "q-rueck", "k-blitz", "k-rueck"].includes(f));
  let n = 0;
  for (const f of zahlFormate) {
    const richtung = FORMAT_RICHTUNG[f];
    for (const key of ALLE_ITEMS.filter((k) => ITEM_INFO.get(k).richtung === richtung && k.startsWith(f[0] === "e" ? "e" : f[0]))) {
      for (let i = 0; i < 25; i++) {
        const a = aufgabeFuer(key, f, { rng });
        pruefeAllgemein(a);
        assert.equal(a.art, "zahl");
        assert.equal(a.loesung, auswerten(a.text), `${f} ${a.text}`);
        assert.equal(wertung(a, String(a.loesung)).ok, true);
        assert.equal(wertung(a, String(a.loesung + 1)).ok, false);
        assert.equal(wertung(a, "").ok, false);
        n += 1;
      }
    }
  }
  assert.ok(n > 3000);
});

test("Zahlaufgaben: Tipps nennen kein falsches Ergebnis", () => {
  const rng = seed(2);
  for (const key of ALLE_ITEMS) {
    const info = ITEM_INFO.get(key);
    const f = { einmaleins: { v: "e-blitz", r: "e-division" }, quadrate: { v: "q-blitz", r: "q-rueck" }, kubik: { v: "k-blitz", r: "k-rueck" } }[info.modul][info.richtung];
    const a = aufgabeFuer(key, f, { rng });
    assert.ok(a.hilfen.length >= 1);
    if (info.richtung === "v") assert.ok(a.hilfen[a.hilfen.length - 1].includes(String(a.loesung)) || info.modul === "einmaleins", `${a.text}: ${a.hilfen}`);
    if (info.modul === "quadrate" && info.richtung === "r") {
      const n = info.fakt.n;
      const endziffern = /endet auf ([\d ou]+)\./.exec(a.hilfen[0].replace(" oder ", " ou ").replace(" or ", " ou "));
      assert.ok(endziffern, a.hilfen[0]);
      assert.ok(endziffern[1].split(" ou ").map(Number).includes(n % 10), `${n}: ${a.hilfen[0]}`);
      const zw = /(\d+) (?:liegt zwischen|lies between) (\d+) (?:und|and) (\d+)/.exec(a.hilfen[1]);
      assert.ok(zw && Number(zw[2]) < Number(zw[1]) + (n === 1 ? 1 : 0) && Number(zw[1]) < Number(zw[3]), a.hilfen[1]);
    }
    if (info.modul === "kubik" && info.richtung === "r") {
      const n = info.fakt.n;
      const m = /endet auf ([\d ou]+)\./.exec(a.hilfen[0].replace(" oder ", " ou ").replace(" or ", " ou "));
      assert.ok(m[1].split(" ou ").map(Number).includes(n % 10));
    }
  }
});

test("Auswahlaufgaben: genau eine richtige Option, mathematisch geprüft", () => {
  const rng = seed(3);
  for (const f of FORMATE.filter((x) => !["e-blitz", "e-fehlt", "e-division", "e-familie", "e-korrektur", "q-blitz", "q-rueck", "k-blitz", "k-rueck"].includes(x))) {
    const richtung = FORMAT_RICHTUNG[f];
    const keys = ALLE_ITEMS.filter((k) => ITEM_INFO.get(k).richtung === richtung && (f === "qk" ? true : k[0] === f[0]));
    for (const key of keys) {
      for (let i = 0; i < 25; i++) {
        const a = aufgabeFuer(key, f, { rng });
        pruefeAllgemein(a);
        assert.equal(a.art, "wahl"); assert.equal(a.modus, "erkennen");
        const richtig = a.optionen.find((o) => o.wert === String(a.loesung));
        if (f === "e-paar") {
          const p = Number(/= (\d+)$/.exec(a.text)[1]);
          for (const o of a.optionen) { const [x, y] = o.text.split(" · ").map(Number); assert.equal(x * y === p, o === richtig); assert.ok(x >= 1 && x <= 10 && y >= 1 && y <= 10); }
        } else if (f === "e-fehler") {
          const falsch = a.optionen.filter((o) => { const [, a1, b1, r] = /^(\d+) · (\d+) = (\d+)$/.exec(o.text).map(Number); return a1 * b1 !== r; });
          assert.equal(falsch.length, 1); assert.equal(falsch[0], richtig);
        } else if (f === "q-detektiv") {
          const nicht = a.optionen.filter((o) => !istQuadrat(Number(o.text)));
          assert.equal(nicht.length, 1); assert.equal(nicht[0], richtig);
        } else if (f === "q-nachbar") {
          const m = Number(a.text);
          for (const o of a.optionen) { const [x] = o.text.split(/ und | and /).map((s) => Number(s.replace("²", ""))); const liegt = x * x < m && m < (x + 1) ** 2; assert.equal(liegt, o === richtig); }
        } else if (f === "q-schaetzen") {
          const n = Number(a.text.replace("²", ""));
          assert.equal(richtig.text, String(n * n));
          assert.ok(a.optionen.every((o) => Number(o.text) > 0));
        } else if (f === "k-klass") {
          const m = Number(a.text);
          assert.equal(a.loesung, istKubik(m) ? "ja" : "nein");
        } else if (f === "k-vergleich") {
          const [oa, ob] = a.optionen;
          const va = potenzWert(oa.text), vb = potenzWert(ob.text);
          assert.equal(a.loesung, va === vb ? "g" : va > vb ? "a" : "b");
          assert.equal(a.optionen.length, 3);
        } else if (f === "qk" && a.format === "k-klass") {
          // 729 = 9³ = 27²: 27 liegt außerhalb des Quadratzahl-Bereichs, deshalb wird dort „Ist … eine Kubikzahl?“ gefragt
          assert.equal(a.key, "k:9:r");
          assert.equal(a.loesung, istKubik(Number(a.text)) ? "ja" : "nein");
        } else if (f === "qk") {
          const v = Number(a.text);
          assert.notEqual(v, 729);
          const soll = istQuadrat(v) && istKubik(v) ? "beide" : istQuadrat(v) ? "quadrat" : istKubik(v) ? "kubik" : "keins";
          assert.equal(a.loesung, soll);
        }
      }
    }
  }
});

test("Fehlerdetektiv und Zuordnung buchen nur, was der Schüler wirklich getan hat", () => {
  const rng = seed(4);
  const a = aufgabeFuer("e:7x8:v", "e-fehler", { rng });
  const ok = wertung(a, String(a.loesung));
  assert.equal(ok.ok, true); assert.equal(ok.items.length, 4);
  const falschWahl = a.optionen.find((o) => o.wert !== String(a.loesung));
  const bad = wertung(a, falschWahl.wert);
  assert.equal(bad.ok, false); assert.equal(bad.items.length, 1);
  const q = aufgabeFuer("q:12:r", "q-detektiv", { rng });
  const falsch = q.optionen.find((o) => istQuadrat(Number(o.text)));
  const r = wertung(q, falsch.wert);
  assert.equal(r.ok, false); assert.deepEqual(r.items, [`q:${Math.sqrt(Number(falsch.text))}:r`]);
});

test("Muster-Aufgabe: Differenz aufeinanderfolgender Quadratzahlen ist 2n + 1", () => {
  const rng = seed(5);
  for (let i = 0; i < 200; i++) {
    const a = musterAufgabe("q-diff", { rng });
    const [x, y] = a.text.split(" − ").map(Number);
    assert.equal(a.loesung, x - y);
    assert.ok(istQuadrat(x) && istQuadrat(y));
    assert.equal(a.loesung, 2 * Math.sqrt(y) + 1);
  }
});

test("Englische Texte: gleiche Mathematik, andere Sprache", () => {
  const rng = seed(6);
  const de = aufgabeFuer("q:17:r", "q-detektiv", { rng: seed(9) });
  const en = aufgabeFuer("q:17:r", "q-detektiv", { rng: seed(9), en: true });
  assert.equal(de.loesung, en.loesung);
  assert.notEqual(de.frage, en.frage);
});

/* ---------------- Lernstand ---------------- */
const tag = (n) => T0 + n * TAG_MS;
const K0 = () => leererKopfStand();

test("Lernstand: einmal richtig ist nicht beherrscht", () => {
  const K = K0();
  assert.equal(status(K.items["e:7x8:v"]), "neu");
  buche(K, "e:7x8:v", true, { sek: 2, zeit: tag(0) });
  assert.equal(status(K.items["e:7x8:v"]), "gesehen");          // ein Treffer belegt noch nichts
  buche(K, "e:7x8:v", true, { sek: 2, zeit: tag(0) + 1000 });
  assert.equal(status(K.items["e:7x8:v"]), "aufbau");           // erst zwei saubere Treffer in Folge
});
test("Lernstand: Raten (Auswahl) und Antworten mit Tipp bleiben „gesehen“ und schalten nichts frei", () => {
  const K = K0();
  buche(K, "e:3x4:v", true, { modus: "erkennen", zeit: tag(0) });
  buche(K, "e:3x5:v", true, { hilfe: 2, zeit: tag(0) });
  assert.equal(status(K.items["e:3x4:v"]), "gesehen");
  assert.equal(status(K.items["e:3x5:v"]), "gesehen");
  // jedes Item des ersten Blocks einmal erraten/angetippt: der nächste Block bleibt zu
  for (const m of MODULE) {
    for (const k of ITEMS[m].filter((x) => ITEM_INFO.get(x).block === 0)) buche(K, k, true, { modus: "erkennen", zeit: tag(0) });
    assert.deepEqual(offeneBloecke(K, m), [0], m);
  }
  assert.equal(modulUebersicht(K, "kubik").zaehler.gesehen, ITEMS.kubik.filter((x) => ITEM_INFO.get(x).block === 0).length);
  assert.ok(RANG.gesehen > RANG.unsicher && RANG.gesehen < RANG.aufbau);
});
test("Lernstand: erster Fehler wirft nur eine Stufe zurück, wiederholter Fehler weiter", () => {
  const K = K0();
  for (let d = 0; d < 4; d++) buche(K, "e:6x7:v", true, { sek: 2, zeit: tag(d) });
  const hoch = K.items["e:6x7:v"].stufe;
  assert.ok(hoch >= 3);
  buche(K, "e:6x7:v", false, { zeit: tag(5) });                 // Vertipper o. Ä.
  assert.equal(K.items["e:6x7:v"].stufe, hoch - 1);
  buche(K, "e:6x7:v", false, { zeit: tag(5) + 1000 });          // nochmals falsch
  assert.equal(K.items["e:6x7:v"].stufe, Math.max(0, hoch - 3));
  // falsch erraten beim Erkennen kostet beim ersten Mal keine Stufe, aber der Fehler zählt
  buche(K, "q:18:v", true, { sek: 5, zeit: tag(0) });
  const st = K.items["q:18:v"].stufe;
  buche(K, "q:18:v", false, { modus: "erkennen", zeit: tag(1) });
  assert.equal(K.items["q:18:v"].stufe, st);
  assert.equal(K.items["q:18:v"].f, 1);
  assert.equal(status(K.items["q:18:v"]), "unsicher");
});
test("Tage: tagNr zählt Kalendertage in Ortszeit, nicht in UTC", () => {
  for (const z of [Date.UTC(2026, 0, 5, 0, 30), Date.UTC(2026, 6, 1, 23, 30), Date.UTC(2026, 9, 12, 12), Date.UTC(2026, 2, 29, 1, 30)]) {
    const d = new Date(z);
    assert.equal(tagNr(z), Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / TAG_MS);
  }
  // zwei Zeitpunkte am selben Ortstag haben dieselbe Tagesnummer
  const morgens = new Date(2026, 9, 12, 0, 5).getTime(), abends = new Date(2026, 9, 12, 23, 55).getTime();
  assert.equal(tagNr(morgens), tagNr(abends));
  assert.equal(tagNr(abends) + 1, tagNr(new Date(2026, 9, 13, 0, 5).getTime()));
});
test("Lernstand: drei richtige am selben Tag reichen nicht für „sicher“, am zweiten Tag schon", () => {
  const K = K0();
  for (let i = 0; i < 3; i++) buche(K, "q:17:v", true, { sek: 9, zeit: tag(0) + i * 1000 });
  assert.equal(status(K.items["q:17:v"]), "aufbau");
  buche(K, "q:17:v", true, { sek: 9, zeit: tag(1) });
  assert.equal(status(K.items["q:17:v"]), "sicher");
});
test("Lernstand: ein Fehler setzt auf „unsicher“; zwei richtige in Folge führen zurück", () => {
  const K = K0();
  for (let d = 0; d < 3; d++) buche(K, "k:7:v", true, { sek: 9, zeit: tag(d) });
  assert.equal(status(K.items["k:7:v"]), "sicher");
  buche(K, "k:7:v", false, { zeit: tag(3) });
  assert.equal(status(K.items["k:7:v"]), "unsicher");
  assert.equal(K.items["k:7:v"].folge, 0);
  buche(K, "k:7:v", true, { sek: 9, zeit: tag(3) });
  assert.equal(status(K.items["k:7:v"]), "unsicher");
  buche(K, "k:7:v", true, { sek: 9, zeit: tag(4) });
  assert.equal(status(K.items["k:7:v"]), "aufbau");
});
test("Lernstand: Hilfe wird gezählt, bringt die Serie aber nicht voran", () => {
  const K = K0();
  for (let i = 0; i < 6; i++) buche(K, "e:6x7:v", true, { hilfe: 1, sek: 1, zeit: tag(i) });
  const s = K.items["e:6x7:v"];
  assert.equal(s.r, 6); assert.equal(s.h, 6); assert.equal(s.folge, 0);
  assert.notEqual(status(s), "sicher");
});
test("Lernstand: Erkennen allein (Auswahl, Zuordnung) macht nie „sicher“", () => {
  const K = K0();
  for (let d = 0; d < 10; d++) buche(K, "q:13:r", true, { modus: "erkennen", zeit: tag(d) });
  assert.equal(status(K.items["q:13:r"]), "gesehen");
  assert.equal(K.items["q:13:r"].folge, 0);
});
test("Lernstand: Richtungen sind getrennt", () => {
  const K = K0();
  for (let d = 0; d < 4; d++) buche(K, "q:12:v", true, { sek: 9, zeit: tag(d) });
  buche(K, "q:12:r", false, { zeit: tag(4) });
  assert.equal(status(K.items["q:12:v"]), "sicher");
  assert.equal(status(K.items["q:12:r"]), "unsicher");
  assert.equal(faktStatus(K, FAKTEN.quadrate[11]), "unsicher");
});
test("Lernstand: Tempo zählt nur mit Richtigkeit und Wiederholung („automatisiert“)", () => {
  const K = K0();
  const schnell = SCHNELL_SEK.v.quadrate;
  // sehr schnell, aber nur am selben Tag: höchstens „aufbau“
  for (let i = 0; i < 5; i++) buche(K, "q:11:v", true, { sek: 1, zeit: tag(0) + i * 1000 });
  assert.equal(status(K.items["q:11:v"]), "aufbau");
  // an zwei Tagen schnell: automatisiert
  buche(K, "q:11:v", true, { sek: schnell, zeit: tag(1) });
  assert.equal(status(K.items["q:11:v"]), "automatisiert");
  // langsam, aber immer richtig: sicher, aber nicht „automatisiert“ – und nicht schlechter bewertet
  for (let d = 0; d < 4; d++) buche(K, "q:14:v", true, { sek: 60, zeit: tag(d) });
  assert.equal(status(K.items["q:14:v"]), "sicher");
  // ein langsamer Treffer unterbricht die Tempo-Serie, nicht die Sicherheit
  buche(K, "q:11:v", true, { sek: schnell + 5, zeit: tag(2) });
  assert.equal(status(K.items["q:11:v"]), "sicher");
});
test("Lernstand: Wiederholungsabstand wächst höchstens einmal pro Tag und fällt bei Fehlern", () => {
  const K = K0();
  for (let i = 0; i < 8; i++) buche(K, "e:3x4:v", true, { sek: 2, zeit: tag(0) + i * 1000 });
  assert.equal(K.items["e:3x4:v"].stufe, 1);
  assert.equal(K.items["e:3x4:v"].faellig, tag(0) + 7000 + 2 * TAG_MS);
  buche(K, "e:3x4:v", true, { sek: 2, zeit: tag(2) });
  assert.equal(K.items["e:3x4:v"].stufe, 2);
  buche(K, "e:3x4:v", false, { zeit: tag(3) });
  assert.equal(K.items["e:3x4:v"].stufe, 1);                    // erster Fehler: eine Stufe zurück
  assert.equal(K.items["e:3x4:v"].faellig, tag(3));
  assert.ok(istFaellig(K.items["e:3x4:v"], tag(3)));
  assert.ok(!istFaellig(undefined, tag(3)));
});
test("Lernstand: Bestwert zuerst nach Richtigen, dann nach Zeit", () => {
  const K = K0();
  assert.equal(setzeBest(K, "x", { richtig: 7, gesamt: 10, sek: 40 }), true);
  assert.equal(setzeBest(K, "x", { richtig: 6, gesamt: 10, sek: 5 }), false);
  assert.equal(setzeBest(K, "x", { richtig: 7, gesamt: 10, sek: 30 }), true);
  assert.equal(setzeBest(K, "x", { richtig: 7, gesamt: 10, sek: null }), false);
  assert.equal(setzeBest(K, "x", { richtig: 8, gesamt: 10, sek: null }), true);
});
test("Lernstand: ungültige Schlüssel werden ignoriert", () => {
  const K = K0();
  assert.equal(buche(K, "x:1x1:v", true), null);
  assert.deepEqual(K.items, {});
});
test("Lernstand: Speichern und Laden verändert nichts; kaputte Daten werden bereinigt", () => {
  const K = K0();
  for (let d = 0; d < 3; d++) buche(K, "e:7x8:v", true, { sek: 2, zeit: tag(d) });
  buche(K, "k:3:r", false, { zeit: tag(1) });
  bucheVerstehen(K, "q-diff", true, tag(1)); markiereEntdeckt(K, "einmaleins:start"); setzeBest(K, "einmaleins:selbst", { richtig: 9, gesamt: 10, sek: 31 }, tag(2));
  const geladen = normiereKopf(JSON.parse(JSON.stringify(K)));
  assert.deepEqual(geladen, K);
  assert.deepEqual(normiereKopf(null), leererKopfStand());
  assert.deepEqual(normiereKopf("kaputt"), leererKopfStand());
  const wirr = normiereKopf({ items: { "e:7x8:v": { r: -3, f: "x", tage: "kein array", ok: "ja" }, "unbekannt": { r: 1 }, "q:5:v": 5 }, best: { a: { richtig: "x" } }, runden: -1 });
  assert.deepEqual(Object.keys(wirr.items), ["e:7x8:v"]);
  assert.equal(wirr.items["e:7x8:v"].r, 0); assert.deepEqual(wirr.items["e:7x8:v"].tage, []); assert.equal(wirr.items["e:7x8:v"].ok, null);
  assert.deepEqual(wirr.best, {}); assert.equal(wirr.runden, 0); assert.equal(wirr.punkte, 0);
});
test("Persistenz: der Kopf-Stand überlebt die Normierung des vorhandenen Trainingsstands", () => {
  const K = K0(); buche(K, "q:9:v", true, { sek: 2, zeit: tag(0) });
  const T = normiere({ kopf: K, themen: { ableiten: { n: 1 } } });
  assert.deepEqual(T.kopf, K);
  assert.deepEqual(T.themen, { ableiten: { n: 1 } });
  const alt = normiere({ themen: {} });                           // ältere Daten ohne Kopf-Stand
  assert.deepEqual(normiereKopf(alt.kopf), leererKopfStand());
});

/* ---------------- Auswahl und Fortschritt ---------------- */
test("Auswahl: zu Beginn nur der erste Block; der nächste öffnet nach 60 % „aufbau“", () => {
  const K = K0();
  assert.deepEqual(offeneBloecke(K, "quadrate"), [0]);
  const erster = ITEMS.quadrate.filter((k) => ITEM_INFO.get(k).block === 0);
  const zweimal = (k) => { buche(K, k, true, { sek: 5, zeit: tag(0) }); buche(K, k, true, { sek: 5, zeit: tag(0) + 1000 }); };
  erster.slice(0, 11).forEach(zweimal);                                                  // 11 von 20 = 55 % „aufbau“
  assert.deepEqual(offeneBloecke(K, "quadrate"), [0]);
  zweimal(erster[11]);                                                                    // 12 von 20 = 60 %
  assert.deepEqual(offeneBloecke(K, "quadrate"), [0, 1]);
  const k = kandidaten(K, { module: ["quadrate"] });
  assert.ok(k.some((x) => ITEM_INFO.get(x).block === 1));
  assert.ok(!k.some((x) => ITEM_INFO.get(x).block === 2));
});
test("Auswahl: unsichere Items werden deutlich häufiger gezogen als sichere", () => {
  const K = K0();
  const rng = seed(11);
  const alle = kandidaten(K, { module: ["einmaleins"], bloecke: [0] });
  for (const k of alle) for (let d = 0; d < 3; d++) buche(K, k, true, { sek: 2, zeit: tag(d) });
  const unsicher = alle[0];
  buche(K, unsicher, false, { zeit: tag(3) });
  let treffer = 0, sicherSumme = 0;
  const jetzt = tag(3) + 1000;
  for (let i = 0; i < 400; i++) {
    const w = waehleItems(K, alle, 5, { jetzt, rng });
    if (w.includes(unsicher)) treffer += 1;
    sicherSumme += w.filter((x) => x === alle[5]).length;
  }
  assert.ok(treffer > 380, `unsicheres Item in ${treffer}/400 Runden`);
  assert.ok(sicherSumme < 140, `sicheres Item ${sicherSumme}-mal`);
  assert.ok(gewichtVon(K, unsicher, jetzt) > 20 * gewichtVon(K, alle[5], jetzt));
});
test("Auswahl: fällige sichere Items kommen wieder, nicht fällige selten", () => {
  const K = K0();
  const k = "e:2x3:v";
  for (let d = 0; d < 3; d++) buche(K, k, true, { sek: 2, zeit: tag(d) });
  const gleich = gewichtVon(K, k, tag(2) + 1000);
  const spaeter = gewichtVon(K, k, tag(2) + 20 * TAG_MS);
  assert.ok(spaeter > 5 * gleich);
});
test("Auswahl: Runden enthalten keine doppelten Items und höchstens 40 % neue (wenn möglich)", () => {
  const K = K0();
  const rng = seed(12);
  const alle = kandidaten(K, { module: ["kubik"], bloecke: [0, 1] });
  alle.slice(0, 12).forEach((k) => buche(K, k, true, { sek: 3, zeit: tag(0) }));
  for (let i = 0; i < 100; i++) {
    const w = waehleItems(K, alle, 10, { jetzt: tag(0), rng });
    assert.equal(new Set(w).size, w.length);
    assert.ok(w.filter((x) => status(K.items[x]) === "neu").length <= 4);
  }
});
test("Runde: gemischtes Training kombiniert alle drei Bereiche", () => {
  const rng = seed(13);
  for (let i = 0; i < 40; i++) {
    const K = K0();
    const r = baueRunde(K, { modul: "gemischt", stufe: "challenge", rng, jetzt: T0 });
    assert.equal(r.length, 15);
    const module = new Set(r.map((a) => ITEM_INFO.get(a.key).modul));
    assert.equal(module.size, 3, "alle drei Module");
  }
});
test("Runde: jede Stufe liefert Aufgaben mit passendem Aufbau", () => {
  const rng = seed(14);
  for (const modul of [...MODULE, "gemischt"]) {
    for (const stufe of STUFEN.filter((s) => s !== "verstehen")) {
      const K = K0();
      if (stufe === "wiederholen") { for (const k of kandidaten(K, { module: modul === "gemischt" ? [...MODULE] : [modul] }).slice(0, 8)) buche(K, k, false, { zeit: T0 }); }
      const r = baueRunde(K, { modul, stufe, rng, jetzt: T0 + 1000 });
      assert.ok(r.length > 0, `${modul}/${stufe}`);
      for (const a of r) {
        pruefeAllgemein(a);
        if (stufe === "selbst" || stufe === "schnell" || stufe === "wiederholen") assert.equal(a.art, "zahl", `${modul}/${stufe}/${a.format}`);
        if (stufe === "schnell") assert.ok(["e-blitz", "e-division", "e-fehlt", "q-blitz", "q-rueck", "k-blitz", "k-rueck"].includes(a.format));
      }
    }
  }
});
test("Runde: Wiederholen bietet nur Unsicheres oder Fälliges an – sonst leere Runde", () => {
  const rng = seed(15);
  const K = K0();
  assert.deepEqual(baueRunde(K, { modul: "quadrate", stufe: "wiederholen", rng, jetzt: T0 }), []);
  buche(K, "q:6:v", false, { zeit: T0 }); buche(K, "q:7:r", false, { zeit: T0 });
  const r = baueRunde(K, { modul: "quadrate", stufe: "wiederholen", rng, jetzt: T0 + 1000 });
  assert.deepEqual(new Set(r.map((a) => a.key)), new Set(["q:6:v", "q:7:r"]));
});
test("Runde: eigene Blockauswahl überschreibt die Freischaltung (flexible Reihenfolge)", () => {
  const rng = seed(16);
  const K = K0();
  const r = baueRunde(K, { modul: "quadrate", stufe: "selbst", rng, jetzt: T0, bloecke: [3] });
  assert.ok(r.every((a) => ITEM_INFO.get(a.key).fakt.n >= 21));
});
test("Formate: jedes Item hat in jeder Stufe mindestens ein passendes Format", () => {
  const rng = seed(17);
  for (const key of ALLE_ITEMS) for (const stufe of ["unterstuetzt", "selbst", "schnell", "wiederholen", "challenge"]) {
    const f = formatFuerKey(key, stufe, rng);
    assert.equal(FORMAT_RICHTUNG[f], ITEM_INFO.get(key).richtung, `${key} ${stufe} ${f}`);
    const a = aufgabeFuer(key, f, { rng });
    pruefeAllgemein(a);
  }
  assert.ok(formateFuer("einmaleins", "selbst", "v").length >= 1);
});

test("Übersicht: Zähler, Fälligkeit, Blöcke und Stufen stimmen", () => {
  const K = K0();
  let u = modulUebersicht(K, "kubik", T0);
  assert.equal(u.gesamt, 20); assert.equal(u.zaehler.neu, 20); assert.equal(u.angefangen, 0);
  assert.deepEqual(u.offen, [0]); assert.equal(u.bloecke.length, 2); assert.equal(u.bloecke[1].offen, false);
  assert.equal(stufenStand(K, "kubik", T0).schnell.offen, false);
  assert.equal(stufenStand(K, "kubik", T0).challenge.offen, false);
  assert.equal(stufenStand(K, "kubik", T0).wiederholen.offen, false);
  for (const k of ITEMS.kubik) buche(K, k, true, { sek: 5, zeit: tag(0) });
  for (const k of ITEMS.kubik) buche(K, k, true, { sek: 5, zeit: tag(1) });
  for (const k of ITEMS.kubik) buche(K, k, true, { sek: 5, zeit: tag(2) });
  u = modulUebersicht(K, "kubik", tag(2) + 1);
  assert.equal(u.zaehler.sicher + u.zaehler.automatisiert, 20);
  assert.equal(stufenStand(K, "kubik", tag(2)).challenge.offen, true);
  assert.equal(stufenStand(K, "kubik", tag(2)).schnell.offen, true);
  buche(K, "k:4:v", false, { zeit: tag(3) });
  assert.equal(stufenStand(K, "kubik", tag(3)).wiederholen.offen, true);
  const g = gesamtUebersicht(K, tag(3));
  assert.equal(g.gesamt, 180); assert.equal(g.unsicher, 1);
});
test("Empfehlung: Verstehen zuerst, später Wiederholen, wenn viel ansteht", () => {
  const K = K0();
  assert.equal(empfehlung(K, "einmaleins", T0), "verstehen");
  markiereEntdeckt(K, "einmaleins:start");
  assert.equal(empfehlung(K, "einmaleins", T0), "unterstuetzt");
  for (const k of ITEMS.einmaleins.slice(0, 6)) buche(K, k, false, { zeit: T0 });
  assert.equal(empfehlung(K, "einmaleins", T0 + 1000), "wiederholen");
  assert.ok(STUFEN.includes(empfehlung(K, "gemischt", T0)));
});

test("Hinweis auf Grundlagen: erst ab genug Beobachtungen, nie als Diagnose", () => {
  const K = K0();
  buche(K, "e:6x7:r", false, { zeit: T0 }); buche(K, "e:6x7:r", false, { zeit: T0 });
  assert.equal(schwacheGrundlagen(K).genug, false);            // zu wenig Daten
  buche(K, "e:6x7:r", false, { zeit: T0 }); buche(K, "e:6x7:r", false, { zeit: T0 });
  const h = schwacheGrundlagen(K);
  assert.equal(h.genug, true); assert.equal(h.treffer[0].key, "e:6x7:r"); assert.deepEqual(Object.keys(h.nachModul), ["einmaleins"]);
  assert.deepEqual(Object.keys(h.treffer[0]).sort(), ["beobachtungen", "falsch", "key", "modul", "richtung"]);   // nur Zahlen, keine Ursachenbehauptung
});

/* ---------------- Spiele ---------------- */
test("Zuordnung/Memory: Paare sind richtig, Karten eindeutig, Items passen", () => {
  const rng = seed(21);
  for (const modul of [...MODULE, "gemischt"]) {
    for (const richtung of ["v", "r", "mix"]) {
      for (let i = 0; i < 20; i++) {
        const K = K0();
        const { paare, richtung: r } = paarRunde(K, { modul, richtung, rng, jetzt: T0, bloecke: [0, 1] });
        assert.ok(paare.length >= 1 && paare.length <= 6);
        const links = paare.map((p) => p.links), rechts = paare.map((p) => p.rechts);
        assert.equal(new Set(links).size, links.length, "linke Karten eindeutig");
        assert.equal(new Set(rechts).size, rechts.length, "rechte Karten eindeutig");
        assert.equal(new Set([...links, ...rechts]).size, links.length + rechts.length, "keine Karte doppelt, auch nicht über Kreuz");
        for (const p of paare) {
          const info = ITEM_INFO.get(p.key);
          assert.equal(info.richtung, r);
          const f = info.fakt;
          if (info.modul === "einmaleins") { const [vorne, hinten] = r === "v" ? [p.links, p.rechts] : [p.rechts, p.links]; const [a, b] = vorne.split(" · ").map(Number); assert.equal(a * b, Number(hinten)); assert.equal(a * b, f.wert); }
          else if (r === "v") assert.equal(potenzWert(p.links), Number(p.rechts));
          else assert.equal(f.wert, Number(p.links)), assert.equal(Number(p.rechts) ** (info.modul === "quadrate" ? 2 : 3), Number(p.links));
        }
      }
    }
  }
});

test("Texte für Listen", () => {
  assert.equal(itemText("e:7x8:v"), "7 · 8");
  assert.equal(itemText("e:7x8:r"), "56 : 7");
  assert.equal(itemText("q:17:v"), "17²");
  assert.equal(itemText("q:17:r"), "√289");
  assert.equal(itemText("k:8:v"), "8³");
  assert.equal(itemText("k:8:r"), "∛512");
});


/* ---------------- Fehlerarten ---------------- */
const aufg = (key, format, rng = seed(5)) => aufgabeFuer(key, format, { rng });
const art = (a, antwort) => { const f = fehlerAus(a, antwort); return f ? f.art : null; };

test("Fehlerarten: Einmaleins vorwärts – Nachbaraufgabe und Summe", () => {
  const a = aufg("e:7x8:v", "e-blitz");
  assert.equal(a.loesung, 56);
  assert.equal(art(a, 63), "nachbar");     // 7 · 9
  assert.equal(art(a, 48), "nachbar");     // 6 · 8
  assert.equal(art(a, 64), "nachbar");     // 8 · 8
  assert.equal(art(a, 15), "addiert");     // 7 + 8
  assert.equal(art(a, 56), null);          // richtig
  assert.ok(fehlerAus(a, 63).text.includes("7 · 9"));
});
test("Fehlerarten: Einmaleins rückwärts – anderer Faktor und Nachbar", () => {
  const a = aufg("e:7x8:r", "e-fehlt");
  const L = a.loesung, anderer = L === 7 ? 8 : 7;
  assert.equal(art(a, anderer), "faktor");
  assert.equal(art(a, L + 1), "nachbar");
});
test("Fehlerarten: Quadratzahlen", () => {
  const v = aufg("q:12:v", "q-blitz");
  assert.equal(v.loesung, 144);
  assert.equal(art(v, 169), "nachbar");     // 13²
  assert.equal(art(v, 132), "nachbar");     // 12 · 11
  assert.equal(art(v, 24), "verdoppelt");
  assert.equal(art(v, 1728), "potenz");     // 12³
  const r = aufg("q:12:r", "q-rueck");
  assert.equal(r.loesung, 12);
  assert.equal(art(r, 72), "halbiert");
  assert.equal(art(r, 13), "nachbar");
});
test("Fehlerarten: Kubikzahlen", () => {
  const v = aufg("k:5:v", "k-blitz");
  assert.equal(v.loesung, 125);
  assert.equal(art(v, 15), "malDrei");
  assert.equal(art(v, 25), "potenz");
  assert.equal(art(v, 216), "nachbar");     // 6³
  const r = aufg("k:6:r", "k-rueck");
  assert.equal(r.loesung, 6);
  assert.equal(art(r, 72), "drittel");
  assert.equal(art(r, 5), "nachbar");
  const r4 = aufg("k:4:r", "k-rueck");
  assert.equal(art(r4, 8), "potenz");       // √64 statt ∛64
});
test("Fehlerarten: allgemeine Muster und Fälle ohne Fehlerart", () => {
  const a = aufg("q:23:v", "q-blitz");
  assert.equal(a.loesung, 529);
  assert.equal(art(a, 925), "zahlendreher");
  assert.equal(art(a, 539), "zehner");
  assert.equal(art(a, 530), "knapp");
  assert.equal(art(a, 111), null);          // kein erkennbares Muster: kein Etikett erfinden
  assert.equal(fehlerAus(a, ""), null);
  assert.equal(fehlerAus(a, "abc"), null);
  assert.equal(fehlerAus({ ...a, art: "wahl" }, 530), null);
  assert.equal(fehlerAus({ ...a, modus: "verstehen" }, 530), null);
  assert.equal(fehlerAus(null, 5), null);
});
test("Fehlerarten: Texte deutsch und englisch, jede Art hat einen Namen", () => {
  const a = aufg("e:7x8:v", "e-blitz");
  assert.ok(fehlerAus(a, 15, true).text.includes("sum"));
  assert.ok(fehlerAus(a, 15, false).text.includes("Summe"));
  for (const k of Object.keys(FEHLERART_KOPF)) { assert.ok(fehlerName(k).length > 3); assert.ok(fehlerName(k, true).length > 3); }
  assert.equal(fehlerName("gibtsnicht"), "gibtsnicht");
});
test("Fehlerarten: wertung liefert die Fehlerart nur bei falscher Zahlenantwort", () => {
  const a = aufg("e:7x8:v", "e-blitz");
  assert.equal(wertung(a, 63).fehler.art, "nachbar");
  assert.equal(wertung(a, 56).fehler, null);
  const wahl = Object.values(FORMATE).length && baueRunde(K0(), { modul: "quadrate", stufe: "unterstuetzt", anzahl: 6 }).find((x) => x.art === "wahl");
  if (wahl) assert.equal(wertung(wahl, "zzz").fehler, null);
});
test("Fehlerarten: erst ab drei Mal ein Muster; Speicher bleibt klein und wird bereinigt", () => {
  const K = K0();
  bucheFehler(K, "nachbar", "e:7x8:v", 63, tag(0)); bucheFehler(K, "nachbar", "e:6x7:v", 49, tag(0) + 1);
  assert.deepEqual(haeufigeFehlerarten(K), []);
  bucheFehler(K, "nachbar", "e:8x9:v", 81, tag(1)); bucheFehler(K, "nachbar", "e:3x4:v", 15, tag(2));
  assert.equal(haeufigeFehlerarten(K)[0].art, "nachbar");
  assert.equal(haeufigeFehlerarten(K)[0].n, 4);
  assert.equal(K.fehler.nachbar.beispiele.length, 3);
  assert.equal(bucheFehler(K, "erfunden", "e:7x8:v", 1), null);
  assert.equal(schwacheGrundlagen(K).fehlerarten.length, 1);
  const N = normiereKopf({ fehler: { nachbar: { n: 5, zeit: 7, beispiele: [{ k: "e:7x8:v", antwort: 63, zeit: 1 }, { k: "kaputt", antwort: 1 }] }, boese: { n: 9 } }, stand: { gesamt: 180, sicher: 3, gut: 10, angefangen: 20, zeit: 5 } });
  assert.deepEqual(Object.keys(N.fehler), ["nachbar"]);
  assert.equal(N.fehler.nachbar.beispiele.length, 1);
  assert.equal(N.stand.sicher, 3);
  assert.equal(normiereKopf(null).stand, null);
});
test("Kurzstand: zählt sichere, gute und begonnene Items über alle Bereiche", () => {
  const K = K0();
  assert.deepEqual({ ...kurzStand(K), zeit: 0 }, { gesamt: 180, sicher: 0, gut: 0, angefangen: 0, zeit: 0 });
  for (let d = 0; d < 4; d++) buche(K, "q:12:v", true, { sek: 3, zeit: tag(d) });
  buche(K, "e:7x8:v", true, { sek: 3, zeit: tag(0) });
  const k = kurzStand(K, tag(5));
  assert.equal(k.sicher, 1); assert.equal(k.gut, 1); assert.equal(k.angefangen, 2);
});
test("Tempo: ungemessene Antwort (Tab versteckt) lässt die Tempo-Serie unberührt", () => {
  const K = K0();
  for (let i = 0; i < 2; i++) buche(K, "q:11:v", true, { sek: 1, zeit: tag(0) + i * 1000 });
  assert.equal(K.items["q:11:v"].sFolge, 2);
  buche(K, "q:11:v", true, { sek: null, zeit: tag(1) });
  assert.equal(K.items["q:11:v"].sFolge, 2);
  buche(K, "q:11:v", true, { sek: 99, zeit: tag(1) + 1000 });   // gemessen und langsam: Serie bricht
  assert.equal(K.items["q:11:v"].sFolge, 0);
});
test("Konto-Abgleich: Bestwerte, Fehlerarten und Items aus zwei Geräten gehen nicht verloren", () => {
  const a = { _zeit: 100, training: { kopf: { items: { "e:7x8:v": { r: 3, f: 0, e: 0, h: 0, folge: 3, tage: [1, 2], sFolge: 0, sTage: [], ok: true, stufe: 2, stufeTag: 2, faellig: 9, zuletzt: 50 } },
    best: { "einmaleins:selbst": { richtig: 9, gesamt: 10, sek: null, zeit: 40 }, "quadrate:schnell": { richtig: 8, gesamt: 10, sek: 30, zeit: 40 } },
    fehler: { nachbar: { n: 3, zeit: 40, beispiele: [{ k: "e:7x8:v", antwort: 63, zeit: 40 }] } }, runden: 4, punkte: 100 } } };
  const b = { _zeit: 200, training: { kopf: { items: { "e:7x8:v": { r: 5, f: 1, e: 0, h: 0, folge: 0, tage: [], sFolge: 0, sTage: [], ok: false, stufe: 0, stufeTag: 3, faellig: 99, zuletzt: 80 }, "q:12:v": { r: 1, f: 0, e: 0, h: 0, folge: 1, tage: [3], sFolge: 0, sTage: [], ok: true, stufe: 0, stufeTag: 3, faellig: 9, zuletzt: 70 } },
    best: { "einmaleins:selbst": { richtig: 10, gesamt: 10, sek: null, zeit: 90 }, "quadrate:schnell": { richtig: 8, gesamt: 10, sek: 25, zeit: 90 } },
    fehler: { nachbar: { n: 2, zeit: 90, beispiele: [{ k: "e:6x7:v", antwort: 49, zeit: 90 }] }, potenz: { n: 1, zeit: 95, beispiele: [] } }, runden: 2, punkte: 50 } } };
  for (const m of [mergeLernstand(a, b), mergeLernstand(b, a)]) {
    const K = normiereKopf(m.training.kopf);
    assert.equal(K.items["e:7x8:v"].zuletzt, 80);                       // jüngerer Eintrag gewinnt als Ganzes
    assert.ok(K.items["q:12:v"]);                                       // nur auf Gerät b
    assert.deepEqual(K.best["einmaleins:selbst"].richtig, 10);          // bessere Quote
    assert.equal(K.best["einmaleins:selbst"].gesamt, 10);
    assert.equal(K.best["quadrate:schnell"].sek, 25);                   // gleiche Quote: schnellere Zeit, nicht gemischt
    assert.equal(K.best["quadrate:schnell"].zeit, 90);
    assert.ok(K.fehler.nachbar.n >= 3 && K.fehler.potenz);
    assert.ok(K.runden >= 4 && K.punkte >= 100);
  }
});
test("Fehlerarten: Beschriftungen für die Fortschrittsseite (base2.jsx) sind vollständig", () => {
  const text = readFileSync(new URL("../src/base2.jsx", import.meta.url), "utf8");
  for (const k of [...Object.keys(FEHLERART_KOPF), "rechnen"]) assert.ok(text.includes(`kopf_${k}:`), `kopf_${k} fehlt in FEHLERARTEN`);
});
