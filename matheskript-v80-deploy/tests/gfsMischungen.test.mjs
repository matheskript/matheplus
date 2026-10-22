/* GFS · Mischungen (gfsMischungen.js)
   Mathematik der Herleitung exakt nachgerechnet (Mischungsgleichung, gewichteter Mittelwert, Gleichungssystem,
   Kreuz = Hebelgesetz, Grenzen, Verdünnen, drei Sorten), Generatoren über viele Startwerte: Aufgaben gültig, Lösung
   besteht die eigene Prüfung, typische Fehler fallen durch und bekommen eine Begründung, Rechenweg endet beim Ergebnis,
   A5 in allen Zeilen. Dazu die Hausregeln im Quelltext der Seite. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  zufallszahlen, wuerfelAus, Q, R, plus, mal, minus, durch, gleich, wert, summe, dezimal, zt, geld, lies,
  mischwert, kreuz, verteilen, loese2, dreiSorten, dreiGrenzen, ERHALTEN, BEISPIEL, WIPPE_MEHR, VERDUENNEN, DREI,
  LABOR, LABOR_VORLAGEN, labor, drehmomente, anzeige,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsMischungen.js";

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));
/* Brüche in TeX müssen gekürzt sein, Dezimalzahlen mit Komma, Minus als „−“ */
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
/* ein ungekürzter Bruch ist nur als Rechenschritt erlaubt, auf den „=“ folgt (\frac{48}{600} = 0,08) */
const gekuerzt = (z) => [...z.matchAll(/\\frac\{(\d+)\}\{(\d+)\}(\s*=)?/g)].every(([, a, b, weiter]) => ggT(+a, +b) === 1 || !!weiter);
const schreibweise = (z) => !/\d\.\d/.test(z) && !/(?<![\\a-z])-\s?\d/.test(z.replace(/\\text\{[^}]*\}/g, ""));

test("Brüche, Dezimalzahlen und Eingaben", () => {
  assert.deepEqual(Q(4, 6), { z: 2, n: 3 }); assert.deepEqual(Q(3, -6), { z: -1, n: 2 });
  assert.deepEqual(R(0.05), { z: 1, n: 20 }); assert.deepEqual(R(12.5), { z: 25, n: 2 });
  assert.ok(gleich(plus(Q(1, 3), Q(1, 6)), Q(1, 2)) && gleich(mal(0.05, 600), 30) && gleich(minus(20, 12), 8) && gleich(durch(42, 0.15), 280));
  assert.ok(gleich(summe([1, 2, 3]), 6));
  assert.equal(dezimal(Q(1, 8)), "0,125"); assert.equal(dezimal(Q(-7, 2)), "−3,5"); assert.equal(dezimal(Q(1, 3)), null); assert.equal(dezimal(Q(320)), "320");
  assert.equal(zt(Q(1, 3)), "\\frac{1}{3}"); assert.equal(zt(Q(29, 2)), "14,5");
  assert.equal(geld(Q(124, 10)), "12,40"); assert.equal(geld(R(20)), "20"); assert.equal(geld(R(0.5)), "0,50");
  for (const [e, s] of [["12,5", Q(25, 2)], ["12.5", Q(25, 2)], ["25/2", Q(25, 2)], [" 320 g", Q(320)], ["12,5 %", Q(25, 2)], ["−3", Q(-3)], ["0,05", Q(1, 20)], [",5", Q(1, 2)], ["7,5/2", Q(15, 4)], ["14,20 €", Q(71, 5)]]) {
    assert.ok(lies(e) && gleich(lies(e), s), `${e}`);
  }
  for (const e of ["", "abc", "1/0", "2//3", "1,2,3", "x"]) assert.equal(lies(e), null, e);
});

test("Schritt 1 und 2: Erhaltung, Mischungsgleichung, gewichteter Mittelwert, Mischung liegt dazwischen", () => {
  const { m1, c1, m2, c2 } = ERHALTEN;
  const zucker = plus(mal(m1, Q(c1, 100)), mal(m2, Q(c2, 100)));
  assert.ok(gleich(zucker, 30));
  const c = mischwert([{ m: m1, c: c1 }, { m: m2, c: c2 }]);
  assert.ok(gleich(c, 10) && gleich(durch(zucker, m1 + m2), Q(1, 10)));
  assert.ok(gleich(plus(mal(Q(2, 3), 5), mal(Q(1, 3), 20)), 10), "c = 2/3 · 5 + 1/3 · 20");
  assert.ok(!gleich(c, c1 + c2) && !gleich(c, Q(c1 + c2, 2)), "weder 25 % noch 12,5 %");
  /* allgemein: c − c₁ = m₂/(m₁+m₂) · (c₂ − c₁), c₂ − c = m₁/(m₁+m₂) · (c₂ − c₁), also c₁ < c < c₂ */
  const rnd = wuerfelAus(zufallszahlen(5));
  for (let i = 0; i < 500; i++) {
    const a = Q(rnd(0, 400), 10), b = plus(a, Q(rnd(1, 400), 10)), u = rnd(1, 900), v = rnd(1, 900);
    const cc = mischwert([{ m: u, c: a }, { m: v, c: b }]);
    assert.ok(gleich(minus(cc, a), mal(Q(v, u + v), minus(b, a))) && gleich(minus(b, cc), mal(Q(u, u + v), minus(b, a))));
    assert.ok(wert(a) < wert(cc) && wert(cc) < wert(b));
    if (u === v) assert.ok(gleich(cc, durch(plus(a, b), 2)), "gleiche Mengen: einfacher Mittelwert");
  }
});

test("Schritt 3: Gleichungssystem 600 g mit 12 % – Einsetzungs- und Additionsverfahren, zwei Geraden", () => {
  const { c1, c2, c, M } = BEISPIEL;
  const l = loese2(1, 1, M, Q(c1, 100), Q(c2, 100), mal(M, Q(c, 100)));
  assert.ok(gleich(l.x, 320) && gleich(l.y, 280));
  assert.ok(gleich(mal(M, Q(c, 100)), 72) && gleich(mal(0.05, 600), 30) && gleich(minus(0.2, 0.05), 0.15) && gleich(minus(72, 30), 42) && gleich(durch(42, 0.15), 280));
  assert.ok(gleich(plus(mal(0.05, 320), mal(0.2, 280)), 72) && gleich(mal(0.05, 320), 16) && gleich(mal(0.2, 280), 56));
  /* Geraden der Animation: I durch (0|600) und (600|0), II durch (0|360) und (640|200) */
  assert.ok(gleich(mal(0.2, 360), 72) && gleich(plus(mal(0.05, 640), mal(0.2, 200)), 72));
  assert.equal(loese2(1, 1, 3, 2, 2, 6), null, "parallele Geraden: keine eindeutige Lösung");
});

test("Schritt 4: Mischungskreuz = umgestellte Mischungsgleichung = Hebelgesetz", () => {
  const { c1, c2, c, M } = BEISPIEL;
  const k = kreuz(c1, c2, c);
  assert.ok(k.gueltig && k.p1 === 8 && k.p2 === 7 && gleich(k.d1, 8) && gleich(k.d2, 7));
  const v = verteilen(c1, c2, c, M);
  assert.ok(gleich(v.teil, 40) && gleich(v.m1, 320) && gleich(v.m2, 280));
  assert.equal(320 * 7, 2240); assert.equal(280 * 8, 2240);
  /* Wippe der Animation: 320 g bei 5, 480 g bei 20 → Gleichgewicht bei 14 */
  assert.ok(gleich(mischwert([{ m: 320, c: 5 }, { m: WIPPE_MEHR, c: 20 }]), 14));
  assert.equal(320 * 9, 2880); assert.equal(WIPPE_MEHR * 6, 2880);
  assert.deepEqual(drehmomente([{ m: 320, c: 5 }, { m: 280, c: 20 }], 17), { links: 3840, rechts: 840 });
  assert.deepEqual(drehmomente([{ m: 320, c: 5 }, { m: 480, c: 20 }], 12), { links: 2240, rechts: 3840 });
  /* allgemein für viele Zahlen: Kreuz-Verhältnis erfüllt die Mischungsgleichung, Gleichgewicht genau beim Mischwert */
  const rnd = wuerfelAus(zufallszahlen(17));
  for (let i = 0; i < 400; i++) {
    const a = rnd(0, 60), b = a + rnd(2, 60), cc = rnd(a + 1, b - 1);
    const kk = kreuz(a, b, cc);
    assert.ok(gleich(mischwert([{ m: kk.p1, c: a }, { m: kk.p2, c: b }]), cc));
    assert.ok(gleich(mal(kk.p1, cc - a), mal(kk.p2, b - cc)), "Hebel im Gleichgewicht");
    assert.equal(ggT(kk.p1, kk.p2), 1, "kleinste ganze Zahlen");
    const d = drehmomente([{ m: kk.p1, c: a }, { m: kk.p2, c: b }], cc);
    assert.ok(Math.abs(d.links - d.rechts) < 1e-9);
  }
});

test("Schritt 5: Grenzen und Verdünnen", () => {
  assert.equal(kreuz(5, 20, 25).gueltig, false);
  assert.ok(gleich(kreuz(5, 20, 25).d1, -5));
  assert.equal(kreuz(5, 20, 5).gueltig, false, "Ziel = Sorte: von der anderen nichts");
  const { m, c1, c } = VERDUENNEN;
  const salz = mal(m, Q(c1, 100));
  assert.ok(gleich(salz, 60) && gleich(durch(salz, Q(c, 100)), 1000));
  const k = kreuz(0, c1, c);
  assert.ok(k.p1 === 3 && k.p2 === 2 && gleich(k.d1, 9) && gleich(k.d2, 6), "Wasser : Lösung = 9 : 6 = 3 : 2");
  assert.ok(gleich(mischwert([{ m: 600, c: 0 }, { m: 400, c: c1 }]), c));
  /* Beispiele aus dem Kasten „Drei Bereiche“ */
  const kaffee = kreuz(18, 30, 21); assert.ok(kaffee.p1 === 3 && kaffee.p2 === 1);
  const silber = kreuz(800, 1000, 925); assert.ok(silber.p1 === 3 && silber.p2 === 5 && gleich(silber.d1, 75) && gleich(silber.d2, 125));
});

test("Schritt 6: drei Sorten – unendlich viele Lösungen, Bereich 2,5 ≤ z ≤ 5, mit x = y genau z = 4", () => {
  const [lo, hi] = dreiGrenzen(DREI);
  assert.ok(gleich(lo, Q(5, 2)) && gleich(hi, 5));
  for (const zv of [2.5, 3, 3.5, 4, 4.5, 5]) {
    const s = dreiSorten(zv);
    assert.ok(gleich(plus(plus(s.x, s.y), s.z), DREI.M), `Menge bei z = ${zv}`);
    assert.ok(gleich(plus(plus(mal(8, s.x), mal(12, s.y)), mal(20, s.z)), 140), `Preis bei z = ${zv}`);
    assert.ok(gleich(s.y, minus(15, mal(3, zv))) && gleich(s.x, minus(mal(2, zv), 5)));
    assert.ok(wert(s.x) >= 0 && wert(s.y) >= 0);
  }
  assert.ok(wert(dreiSorten(2).x) < 0 && wert(dreiSorten(5.5).y) < 0, "außerhalb negativ");
  const s3 = dreiSorten(3); assert.ok(gleich(s3.x, 1) && gleich(s3.y, 6));
  const s4 = dreiSorten(4); assert.ok(gleich(s4.x, s4.y) && gleich(s4.x, 3));
});

test("Labor: Vorlagen, Grenzen, Zeilen exakt oder mit ≈", () => {
  assert.ok(LABOR.mMin > 0 && LABOR.mMax >= 600 && LABOR.cMin === 0 && LABOR.cMax >= 20);
  for (const v of LABOR_VORLAGEN) {
    for (const [m, c] of [[v.m1, v.c1], [v.m2, v.c2]]) {
      assert.ok(m >= LABOR.mMin && m <= LABOR.mMax && (m - LABOR.mMin) % LABOR.mSchritt === 0, v.id);
      assert.ok(c >= LABOR.cMin && c <= LABOR.cMax, v.id);
    }
  }
  const r = labor(200, 5, 100, 20);
  assert.ok(gleich(r.c, 10) && gleich(r.S, 30) && gleich(r.h1, r.h2) && gleich(r.h1, 1000));
  assert.ok(gleich(labor(320, 5, 280, 20).c, 12));
  assert.ok(gleich(labor(600, 0, 400, 15).c, 6), "Verdünnen-Vorlage: 6 %");
  for (let m1 = LABOR.mMin; m1 <= LABOR.mMax; m1 += 40) for (let c1 = 0; c1 <= LABOR.cMax; c1 += 3) for (const [m2, c2] of [[20, 40], [600, 7], [140, 13]]) {
    const x = labor(m1, c1, m2, c2);
    assert.ok(gleich(x.h1, x.h2), "Hebel immer im Gleichgewicht");
    for (const z of x.zeilen) assert.ok(a5ok(z) && schreibweise(z), z);
    if (!x.ca.exakt) assert.ok(x.zeilen[1].includes("\\approx"));
  }
  assert.deepEqual(anzeige(Q(1, 3)), { text: "0,33", exakt: false });
  assert.deepEqual(anzeige(Q(29, 2)), { text: "14,5", exakt: true });
});

/* Antworten, die ein Schüler typischerweise falsch gibt – jede muss durchfallen und eine Begründung bekommen */
function typischFalsch(a) {
  const s = a.soll, aus = [];
  const mit = (k, v) => ({ ...a.loesung, [k]: dezimal(R(v)) ?? zt(R(v)).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2") });
  if (a.art === "mischwert") {
    if (a.typ === "umkehr") aus.push(mit("c2", minus(mal(2, a.c), a.c1)), mit("c2", durch(mal(a.m1 + a.m2, a.c), a.m2)));
    else {
      const cs = a.teile.map((x) => R(x.c));
      aus.push(mit("c", durch(summe(cs), cs.length)), mit("c", summe(cs)));
      if (a.typ === "prozent") aus.push(mit("c", durch(s.c, 100)));
    }
  } else if (a.art === "mengen") {
    if (a.typ === "vorrat") aus.push({ ...a.loesung, m2: String(a.m1) }, { ...a.loesung, M: a.loesung.m2 });
    else aus.push({ ...a.loesung, m1: a.loesung.m2, m2: a.loesung.m1 }, mit("m1", durch(a.M, 2)));
  } else if (a.art === "verduennen") {
    const k = felder(a)[0].k;
    if (a.typ === "wasser") aus.push(mit("w", plus(s.w, a.m)));
    else if (a.typ === "neu") aus.push(mit("c", durch(mal(a.c1, a.m), a.w)));
    else if (a.typ === "rein") aus.push(mit("x", mal(a.m, Q(wert(minus(a.c, a.c1)), 100))));
    else if (a.typ === "verdampfen") aus.push(mit("w", minus(a.m, s.w)));
    else aus.push({ ...a.loesung, L: a.loesung.W, W: a.loesung.L });
    aus.push(mit(k, plus(s[k], 1)));
  } else {
    aus.push({ ...a.loesung, S: a.loesung.W }, { ...a.loesung, A: a.loesung.B, B: a.loesung.A }, { ...a.loesung, x: a.loesung.y, y: a.loesung.x },
      { ...a.loesung, x: dezimal(plus(s.x, 1)) });
  }
  return aus.filter((f) => !Object.keys(s).every((k) => f[k] !== undefined && f[k] !== null && gleich(lies(f[k]), s[k])));
}

test("Generatoren: alle Arten × alle Stufen × viele Startwerte – gültig, lösbar, Fehler erkannt, Rechenweg sauber", () => {
  const gesehen = new Map();
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let seed = 1; seed <= 250; seed++) {
    const zufall = wuerfelAus(zufallszahlen(seed * 37 + s * 1009 + id.length));
    const a = aufgabe(id, s, zufall);
    const wo = `${id} Stufe ${s} Startwert ${seed}`;
    assert.equal(a.art, id, wo); assert.equal(a.stufe, s, wo);
    gesehen.set(`${id}-${s}`, (gesehen.get(`${id}-${s}`) || 0) + 1);
    assert.ok(auftrag(a).length > 60 && tipp(a).length > 30, wo);
    assert.ok(!/undefined|NaN|null|\[object/.test(auftrag(a)), `${wo}: ${auftrag(a)}`);
    const fs = felder(a);
    assert.ok(fs.length >= 1 && fs.every((f) => a.soll[f.k] !== undefined && a.loesung[f.k]), wo);
    /* Lösung: abbrechende Dezimalzahl mit höchstens 3 Nachkommastellen, positiv, besteht die eigene Prüfung */
    for (const f of fs) {
      const l = a.loesung[f.k];
      assert.ok(typeof l === "string" && /^\d+(,\d{1,3})?$/.test(l), `${wo}: ${f.k} = ${l}`);
      assert.ok(wert(a.soll[f.k]) > 0, `${wo}: ${f.k} positiv`);
    }
    assert.equal(pruefe(a, a.loesung).ok, true, `${wo}: ${JSON.stringify(a.loesung)}`);
    /* auch als Bruch und mit Punkt statt Komma */
    const alsBruch = Object.fromEntries(fs.map((f) => { const q = R(a.soll[f.k]); return [f.k, q.n === 1 ? String(q.z) : `${q.z}/${q.n}`]; }));
    assert.equal(pruefe(a, alsBruch).ok, true, `${wo}: Bruch ${JSON.stringify(alsBruch)}`);
    assert.equal(pruefe(a, Object.fromEntries(Object.entries(a.loesung).map(([k, v]) => [k, v.replace(",", ".")]))).ok, true, wo);
    /* leer und typisch falsch */
    const leer = pruefe(a, {});
    assert.equal(leer.ok, false); assert.ok(leer.grund.length > 20);
    for (const f of typischFalsch(a)) {
      const e = pruefe(a, f);
      assert.equal(e.ok, false, `${wo}: ${JSON.stringify(f)} sollte falsch sein`);
      assert.ok(e.grund.length > 20 && !/undefined|NaN/.test(e.grund), `${wo}: Rückmeldung zu ${JSON.stringify(f)}: ${e.grund}`);
    }
    /* Mathematik der Aufgabe stimmt */
    if (id === "mischwert") {
      if (a.typ === "umkehr") assert.ok(gleich(mischwert([{ m: a.m1, c: a.c1 }, { m: a.m2, c: a.soll.c2 }]), a.c), wo);
      else assert.ok(gleich(a.soll.c, mischwert(a.teile)), wo);
      if (a.typ !== "preis") assert.ok(wert(a.c2) <= a.K.max, `${wo}: Lösung ${a.c2} % über der Löslichkeit`);
    }
    if (id === "mengen") {
      const m1 = a.typ === "vorrat" ? R(a.m1) : a.soll.m1, m2 = a.soll.m2;
      assert.ok(gleich(mischwert([{ m: m1, c: a.c1 }, { m: m2, c: a.c2 }]), a.c), `${wo}: Mischwert`);
      if (a.typ === "vorrat") assert.ok(gleich(a.soll.M, plus(m1, m2)));
      else assert.ok(gleich(plus(m1, m2), a.M), `${wo}: Summe`);
      assert.ok(wert(a.c1) < wert(a.c) && wert(a.c) < wert(a.c2), `${wo}: Ziel liegt zwischen den Sorten`);
    }
    if (id === "verduennen") {
      if (a.typ === "wasser") assert.ok(gleich(mischwert([{ m: a.m, c: a.c1 }, { m: a.soll.w, c: 0 }]), a.c), wo);
      if (a.typ === "neu") assert.ok(gleich(mischwert([{ m: a.m, c: a.c1 }, { m: a.w, c: 0 }]), a.soll.c), wo);
      if (a.typ === "rein") assert.ok(gleich(mischwert([{ m: a.m, c: a.c1 }, { m: a.soll.x, c: 100 }]), a.c), wo);
      if (a.typ === "verdampfen") {
        assert.ok(gleich(durch(mal(a.m, a.c1), minus(a.m, a.soll.w)), a.c), wo);
        assert.ok(wert(a.soll.w) < a.m, wo);
      }
      if (a.typ === "ansetzen") assert.ok(gleich(mischwert([{ m: a.soll.W, c: 0 }, { m: a.soll.L, c: a.c1 }]), a.c) && gleich(plus(a.soll.L, a.soll.W), a.M), wo);
      if (a.typ !== "ansetzen" || !a.essig) assert.ok(wert(a.c1) <= a.K.max && (a.c === undefined || wert(a.c) <= a.K.max), `${wo}: Löslichkeit`);
    }
    if (id === "lgs") {
      const { S, A, B, W, x, y } = a.soll;
      assert.ok(gleich(plus(x, y), S) && gleich(plus(mal(A, x), mal(B, y)), W), `${wo}: x, y lösen das System`);
      assert.ok(!gleich(x, y) && !gleich(A, B), `${wo}: eindeutig und nicht trivial`);
      /* II darf mit einem Faktor multipliziert sein */
      const k = s === 4 ? 100 : s === 5 ? 1000 : 2;
      const skaliert = { ...a.loesung, A: dezimal(mal(A, k)), B: dezimal(mal(B, k)), W: dezimal(mal(W, k)) };
      assert.equal(pruefe(a, skaliert).ok, true, `${wo}: skaliertes II ${JSON.stringify(skaliert)}`);
    }
    /* Rechenweg: A5, gekürzt, Komma, letzte Zahl-Zeile enthält das Ergebnis */
    const weg = rechenweg(a);
    assert.ok(weg.length >= 3, wo);
    for (const z of weg) {
      assert.ok(a5ok(z), `${wo}: A5 ${z}`);
      assert.ok(gekuerzt(z), `${wo}: ungekürzt ${z}`);
      assert.ok(schreibweise(z), `${wo}: Schreibweise ${z}`);
      assert.ok(z.length <= 110, `${wo}: Zeile zu lang (${z.length}) ${z}`);
    }
    const text = weg.join(" ");
    if (id === "lgs") {
      const vor = (l, v) => (l === "1" ? v : `${l}${v}`);
      assert.equal(weg[1], `\\text{II: } ${vor(a.loesung.A, "x")} + ${vor(a.loesung.B, "y")} = ${a.loesung.W}`, `${wo}: Gleichung II`);
      assert.equal(weg[0], `\\text{I: } x + y = ${a.loesung.S}`, `${wo}: Gleichung I`);
    }
    for (const f of fs) {
      if (id === "lgs" && (f.k === "A" || f.k === "B")) continue;
      const l = a.loesung[f.k];
      const geldform = a.typ === "preis" && id === "mischwert" ? geld(a.soll[f.k]) : null;
      assert.ok(text.includes(`= ${l}`) || (geldform && text.includes(`= ${geldform}`)) || text.includes(`${l} \\text`) || text.includes(`: ${l}`), `${wo}: Ergebnis ${f.k} = ${l} fehlt im Rechenweg`);
    }
    for (const z of [auftrag(a), tipp(a), pruefe(a, {}).grund, ...typischFalsch(a).map((f) => pruefe(a, f).grund)]) {
      assert.ok(!/[*:_]innen\b|[a-zäöü]Innen\b/.test(z), `${wo}: Gendersprache`);
      assert.ok(!/\d\.\d/.test(z), `${wo}: Dezimalpunkt in ${z}`);
    }
  }
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) assert.equal(gesehen.get(`${id}-${s}`), 250, `${id}-${s}`);
});

test("Generatoren: Vielfalt – nicht immer dieselbe Aufgabe", () => {
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) {
    const texte = new Set();
    for (let seed = 1; seed <= 40; seed++) texte.add(auftrag(aufgabe(id, s, wuerfelAus(zufallszahlen(seed * 13 + s)))));
    assert.ok(texte.size >= 4, `${id} Stufe ${s}: nur ${texte.size} verschiedene Aufgaben`);
  }
});

test("Gliederung, Tipps, Kolloquium", () => {
  assert.equal(GLIEDERUNG.length, 5);
  const min = GLIEDERUNG.reduce((s, g) => s + g.min, 0);
  assert.ok(min >= 15 && min <= 18, String(min));
  assert.equal(TIPPS.length, 3);
  assert.ok(KOLLOQUIUM.length >= 10 && KOLLOQUIUM.length <= 12);
  assert.ok(KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 120 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.filter((q) => q.stufe === st).length >= 2, st);
  /* Reihenfolge Basis → Profi */
  const rang = { Basis: 0, Vertiefung: 1, Profi: 2 };
  KOLLOQUIUM.forEach((q, i) => { if (i) assert.ok(rang[q.stufe] >= rang[KOLLOQUIUM[i - 1].stufe]); });
  for (const t of [...GLIEDERUNG.map((g) => g.text), ...TIPPS, ...KOLLOQUIUM.map((q) => q.antwort)]) {
    assert.ok(a5ok(t), t);
    assert.ok(!/[*:_]innen\b|[a-zäöü]Innen\b/.test(t), t);
  }
  /* Zahlen in den Musterantworten nachgerechnet */
  assert.ok(gleich(durch(plus(mal(20, 2.5), mal(10, 3.1)), 30), 2.7), "Notendurchschnitt 2,7");
  assert.ok(gleich(mischwert([{ m: 20, c: 2.5 }, { m: 10, c: 3.1 }]), 2.7));
});

test("Quelltexte: Exporte, Animationen, Bausteine, MatheFeld, keine TeX-Attribute, keine Buchverweise, kein Selbst-Scrollen", () => {
  const jsx = readFileSync(new URL("../src/funcGfsMischungen.jsx", import.meta.url), "utf8");
  const js = readFileSync(new URL("../src/gfsMischungen.js", import.meta.url), "utf8");
  assert.match(jsx, /export function GfsMischungenSeite\(\{ gehe \}\)/);
  assert.match(jsx, /export function MischungenBild\(\)/);
  assert.match(jsx, /className="gtk-bild" viewBox="0 0 160 120"/);
  assert.match(jsx, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(jsx, /from "\.\/funcAnimKarte\.jsx"/);
  for (const b of ["Formeln", "Schritt", "Kasten", "Chip", "RoterFaden", "Kolloquium"]) assert.match(jsx, new RegExp(`<${b}\\b`), b);
  const anims = [...jsx.matchAll(/<MischAnimation art="([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(new Set(anims).size >= 3 && new Set(anims).size <= 5, `Animationen: ${anims}`);
  for (const a of anims) assert.match(jsx, new RegExp(`\\n  ${a}: \\{ titel:`), `Szene ${a} fehlt`);
  /* Schritttexte kurz (Lesezeit-Regel): höchstens 130 Zeichen */
  for (const m of jsx.matchAll(/\{ von: [\d.]+, text: "([^"]+)" \}/g)) assert.ok(m[1].length <= 130, `Schritttext zu lang: ${m[1]}`);
  /* Eingaben nur über MatheFeld */
  assert.match(jsx, /<MatheFeld modus="bruch"/);
  assert.doesNotMatch(jsx, /<input(?![^>]*type="range")/, "nur MatheFeld (Regler sind erlaubt)");
  assert.match(jsx, /window\.__mischAufgabe/);
  for (const [name, q] of [["jsx", jsx], ["js", js]]) {
    q.split("\n").forEach((z, i) => {
      assert.ok(!/\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/.test(z), `${name}:${i + 1}: TeX im JSX-Attribut`);
      assert.ok(!/[*:_]innen\b|[a-zäöü]Innen\b/.test(z), `${name}:${i + 1}: Gendersprache`);
      assert.ok(!/\.(scrollTo|scrollIntoView|scrollBy)\s*\(/.test(z), `${name}:${i + 1}: Scrollen nur über springe()`);
      assert.ok(!z.includes("√"), `${name}:${i + 1}: keine Wurzeln`);
      assert.ok(!/#[0-9A-Fa-f]{3,6}\b/.test(z) || /^\s*(\/\*|\*|\/\/)/.test(z) || name === "js" || /"#(FFF3C4|FFF6D6)"/.test(z), `${name}:${i + 1}: Farben aus C`);
    });
    assert.ok(!/Lambacher|Schweizer|Klett/.test(q.replace(/\/\*[\s\S]*?\*\//g, "")), `${name}: keine Buchverweise im Inhalt`);
  }
  assert.ok(!/Abi-relevant|abiturrelevant/i.test(jsx + js));
  /* Einbindung: lazy in func10, Pfad, Kurs, Suche, Teilen */
  const f10 = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
  assert.match(f10, /lazyLaden\(\(\) => import\("\.\/funcGfsMischungen\.jsx"\)\.then\(\(m\) => \(\{ default: m\.GfsMischungenSeite \}\)\)\)/);
  assert.match(f10, /lazyLaden\(\(\) => import\("\.\/funcGfsMischungen\.jsx"\)\.then\(\(m\) => \(\{ default: m\.MischungenBild \}\)\)\)/);
  assert.doesNotMatch(f10, /import \{[^}]*\} from "\.\/funcGfsMischungen\.jsx"/);
  assert.match(f10, /chips=\{\["Klasse 8", "Kap\. VII", "5 Animationen"\]\}/);
  assert.equal(new Set(anims).size, 5, "Chip „5 Animationen“ stimmt");
});
