/* Tests für den Bereich „Gleichungen“ (reine Logik). Ausführen: node --test tests/*.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import {
  STUFEN, STUFE_INFO, FEHLERART, neueAufgabe, wertung, zahlLesen, normiereGleich, leererStand, buche, stufenStatus, uebersicht, empfehlung, baueRunde, kurzStand, TAG_MS, haeufigeFehler, glTex,
} from "../src/gleichKurs.js";

function seed(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const T0 = Date.UTC(2026, 9, 18, 10);

/* Mini-Auswerter für die TeX-Zeilen: \frac, \sqrt, ^{}, implizites Mal */
function arg(s, i) { let tiefe = 0, j = i; do { if (s[j] === "{") tiefe++; else if (s[j] === "}") tiefe--; j++; } while (tiefe > 0); return [s.slice(i + 1, j - 1), j]; }
function js(tex) {
  let s = tex.replace(/−/g, "-").replace(/·/g, "*").replace(/:/g, "/");
  let out = "";
  for (let i = 0; i < s.length;) {
    if (s.startsWith("\\frac", i)) { const [a, j] = arg(s, i + 5); const [b, k] = arg(s, j); out += `((${js(a)})/(${js(b)}))`; i = k; }
    else if (s.startsWith("\\sqrt", i)) { const [a, j] = arg(s, i + 5); out += `Math.sqrt(${js(a)})`; i = j; }
    else if (s[i] === "^") { const [a, j] = arg(s, i + 1); out += `**(${js(a)})`; i = j; }
    else { out += s[i]; i++; }
  }
  return out.replace(/(\d)\s*(x|\(|M)/g, "$1*$2").replace(/\)\s*(\(|x|\d)/g, ")*$1").replace(/_\{?\d\}?/g, "");
}
const wert = (tex, x) => Function("x", `return (${js(tex)});`)(x);

const N = 400;
for (const st of STUFEN) {
  test(`${st}: jede Zeile der Rechnung gilt für die Lösung(en)`, () => {
    const rng = seed(st.charCodeAt(1) * 97);
    for (let i = 0; i < N; i++) {
      const a = neueAufgabe(st, { rng });
      assert.ok(a.loesungen.length >= 1 && a.loesungen.every(Number.isInteger), JSON.stringify(a.loesungen));
      for (const x of a.loesungen) {
        assert.ok(Math.abs(wert(a.gl[0], x) - wert(a.gl[1], x)) < 1e-9, `${glTex(a)} mit x = ${x}`);
        for (const z of a.zeilen) {
          if (z.r.includes("±") || /^x(_\{\d\})?$/.test(z.l)) continue;
          assert.ok(Math.abs(wert(z.l, x) - wert(z.r, x)) < 1e-9, `${z.l} = ${z.r} mit x = ${x} (${glTex(a)})`);
        }
      }
      /* Lösungszeilen am Ende stimmen mit den Lösungen überein */
      const enden = a.zeilen.filter((z) => /^x(_\{\d\})?$/.test(z.l)).map((z) => zahlLesen(z.r)).sort((p, q) => p - q);
      assert.deepEqual(enden, a.loesungen);
      /* Probe rechnet richtig */
      for (const p of a.probe) {
        assert.equal(p.wl, p.wr);
        assert.ok(Math.abs(wert(p.l, 0) - p.wl) < 1e-9, `Probe ${p.l}`);
        assert.ok(Math.abs(wert(p.r, 0) - p.wr) < 1e-9, `Probe ${p.r}`);
      }
      /* Rechenkette vorwärts landet auf der rechten Seite */
      if (a.kette) assert.equal(a.kette.schritte.at(-1).wert, zahlLesen(a.gl[1]));
      /* Fallen sind nie richtige Lösungen */
      for (const f of a.fallen) assert.ok(!a.loesungen.includes(f.wert) && FEHLERART[f.art], JSON.stringify(f));
    }
  });

  test(`${st}: Regel A5 – keine unvereinfachten Ausdrücke`, () => {
    const rng = seed(st.charCodeAt(1) * 31);
    const schlecht = [/(^|[^\d])1x/, /(^|[^\d])0x/, /\+ −/, /− −/, /\+ 0(?!\d)/, /− 0(?!\d)/, /\^\{1\}/, /· 1(?!\d)/, /−−/, /\+\s*$/, /x \+ −/];
    for (let i = 0; i < N; i++) {
      const a = neueAufgabe(st, { rng });
      const texte = [a.gl[0], a.gl[1], ...a.zeilen.flatMap((z) => [z.l, z.r, typeof z.op?.kurz === "string" ? z.op.kurz : ""])];
      for (const tx of texte) for (const re of schlecht) assert.ok(!re.test(tx), `${tx} (${re})`);
      /* In der Probe wird eingesetzt (3 · 1 ist dort gewollt), aber Vorzeichen bleiben sauber */
      for (const tx of a.probe.flatMap((p) => [p.l, p.r])) for (const re of schlecht.filter((r) => !String(r).includes("· 1"))) assert.ok(!re.test(tx), `${tx} (${re})`);
    }
  });

  test(`${st}: jede Umformung hat genau eine richtige und zwei falsche Möglichkeiten`, () => {
    const rng = seed(7 + st.charCodeAt(1));
    for (let i = 0; i < 100; i++) {
      const a = neueAufgabe(st, { rng });
      for (const z of a.zeilen) {
        if (!z.op) continue;
        if (z.op.auto) { assert.equal(z.auswahl.length, 0); continue; }
        assert.equal(z.auswahl.length, 3);
        assert.equal(z.auswahl.filter((o) => o.richtig).length, 1);
        assert.equal(new Set(z.auswahl.map((o) => o.lang.de)).size, 3, JSON.stringify(z.auswahl.map((o) => o.lang.de)));
        for (const o of z.auswahl.filter((x) => !x.richtig)) assert.ok(FEHLERART[o.art] && o.warum.de && o.warum.en, o.art);
      }
      assert.ok(a.info.de.length > 10 && a.info.en.length > 10);
    }
  });
}

test("Stufen haben Titel und Beispiel in beiden Sprachen", () => {
  for (const s of STUFEN) { assert.ok(STUFE_INFO[s].titel.de && STUFE_INFO[s].titel.en && STUFE_INFO[s].beispiel); }
});

test("zahlLesen akzeptiert Minuszeichen und lehnt Unsinn ab", () => {
  assert.equal(zahlLesen("−7"), -7); assert.equal(zahlLesen("-7"), -7); assert.equal(zahlLesen(" 12 "), 12);
  assert.equal(zahlLesen(""), null); assert.equal(zahlLesen("x"), null); assert.equal(zahlLesen("−"), null);
});

test("Wertung: richtig, Reihenfolge egal, zweite Lösung vergessen, Falle erkannt", () => {
  const a = { loesungen: [-7, 7], fallen: [] };
  assert.equal(wertung(a, ["7", "−7"]).ok, true);
  assert.equal(wertung(a, ["-7", "7"]).ok, true);
  assert.deepEqual(wertung(a, ["7"]).fehler, { art: "einLoesung" });
  assert.deepEqual(wertung(a, ["7", ""]).fehler, { art: "einLoesung" });
  const b = { loesungen: [7], fallen: [{ wert: 31, art: "vorzeichen" }] };
  assert.equal(wertung(b, ["7"]).ok, true);
  assert.deepEqual(wertung(b, ["31"]).fehler, { art: "vorzeichen" });
  assert.deepEqual(wertung(b, ["−7"]).fehler, { art: "vorzeichen" });
  assert.equal(wertung(b, ["8"]).fehler, null);
  assert.equal(wertung(b, [""]).leer, true);
});

test("Lernstand: neu → aufbau → sicher erst über mindestens zwei Tage", () => {
  const G = normiereGleich(null);
  assert.equal(stufenStatus(G.stufen.s1), "neu");
  for (let i = 0; i < 6; i++) buche(G, "s1", true, { zeit: T0 + i * 1000 });
  assert.equal(stufenStatus(G.stufen.s1), "aufbau");                // ein Tag reicht nicht
  assert.equal(G.stufen.s1.kasten, 1);
  buche(G, "s1", true, { zeit: T0 + 1 * TAG_MS }); buche(G, "s1", true, { zeit: T0 + 3 * TAG_MS });
  assert.equal(stufenStatus(G.stufen.s1), "sicher");
  buche(G, "s1", false, { zeit: T0 + 4 * TAG_MS, fehler: "vorzeichen" });
  assert.notEqual(stufenStatus(G.stufen.s1), "sicher");
  assert.equal(G.fehler.vorzeichen, 1);
  assert.ok(uebersicht(G, T0 + 4 * TAG_MS).liste.find((x) => x.id === "s1").faellig);
});

test("Mit Hilfe gelöst zählt richtig, steigert aber nicht den Kasten", () => {
  const G = normiereGleich(null);
  buche(G, "s2", true, { hilfe: 1, zeit: T0 });
  assert.equal(G.stufen.s2.ok, 1); assert.equal(G.stufen.s2.kasten, 0);
});

test("Empfehlung: erst Verstehen, dann Unsicheres, dann die nächste Stufe", () => {
  const G = normiereGleich(null);
  assert.deepEqual(empfehlung(G, T0), { art: "verstehen" });
  G.film = true;
  assert.deepEqual(empfehlung(G, T0), { art: "stufe", stufe: "s1" });
  buche(G, "s1", true, { zeit: T0 });
  buche(G, "s3", false, { zeit: T0 });
  assert.deepEqual(empfehlung(G, T0), { art: "stufe", stufe: "s3" });
});

test("Runden: Stufe, gemischt (leicht → schwer) und wiederholen", () => {
  const G = normiereGleich(null);
  const r1 = baueRunde(G, { art: "stufe", stufe: "s4", rng: seed(3) });
  assert.equal(r1.length, 6); assert.ok(r1.every((a) => a.stufe === "s4"));
  assert.deepEqual(baueRunde(G, { art: "wiederholen", jetzt: T0 }), []);
  buche(G, "s1", true, { zeit: T0 }); buche(G, "s2", false, { zeit: T0 });
  const r2 = baueRunde(G, { art: "gemischt", jetzt: T0, rng: seed(4) });
  assert.equal(r2.length, 6);
  const nr = r2.map((a) => Number(a.stufe.slice(1)));
  assert.deepEqual(nr, [...nr].sort((p, q) => p - q));
  assert.ok(r2.every((a) => ["s1", "s2", "s3"].includes(a.stufe)));
  const r3 = baueRunde(G, { art: "wiederholen", jetzt: T0 + 1, rng: seed(5) });
  assert.ok(r3.length > 0 && r3.some((a) => a.stufe === "s2"));
  assert.deepEqual(kurzStand(G, T0), { sicher: 0, begonnen: 2, gesamt: 7, faellig: kurzStand(G, T0).faellig });
});

test("normiereGleich übersteht alte und kaputte Stände", () => {
  assert.deepEqual(normiereGleich(undefined).stufen, {});
  const G = normiereGleich({ stufen: { s1: { n: 3, ok: 2 } }, fehler: null });
  assert.equal(G.stufen.s1.kasten, 0); assert.deepEqual(G.stufen.s1.tage, []); assert.deepEqual(G.fehler, {});
  assert.deepEqual(leererStand().stufen, {});
  G.fehler = { vorzeichen: 3, umkehr: 1 };
  assert.deepEqual(haeufigeFehler(G), [{ art: "vorzeichen", n: 3 }]);
});

test("Richtig gelöst (auch geführt) ist nicht sofort wieder fällig, falsch schon", () => {
  const G = normiereGleich(null);
  buche(G, "s1", true, { hilfe: 1, zeit: T0 });
  assert.equal(uebersicht(G, T0 + 1000).faellig, 0);
  assert.equal(uebersicht(G, T0 + TAG_MS).faellig, 1);
  buche(G, "s2", false, { zeit: T0 });
  assert.ok(uebersicht(G, T0 + 1000).liste.find((x) => x.id === "s2").faellig);
});
