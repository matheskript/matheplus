/* GFS · Platonische Körper (gfsPlatonisch.js, funcGfsPlatonisch.jsx) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PHI, dk, lies, vek, innenwinkel, eckenArt, moeglichePaare, KOERPER, koerper, dualVon, defizit, flaechenAus,
  EINS, matMal, matVek, rotX, rotY, drehe, START_DREHUNG, NETZ_START, projiziere, projiziereNetz, schattiere,
  NETZE, netzFuer, falte, faltErgebnis, hexominos, netzPruefung, lageVon, eckeFlaechen, eckeOeffnung,
  ARTEN, aufgabe, auftrag, felder, aufgabeTex, pruefe, rechenweg, tipp, grundText, teileText, ZAEHL_KOERPER, EULER_KOERPER,
  BEGRUENDUNGEN, gemischt, kantenAusPQ, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "../src/gfsPlatonisch.js";

const { minus, laenge, skalar, kreuz, einheit, mitte, mal } = vek;
const nahe = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

/* Dieselben Muster wie tests/a5.test.mjs – nichts bleibt unvereinfacht stehen */
const N = String.raw`\d+(?:[.,]\d+)?`;
const A5 = [
  new RegExp(String.raw`(?:^|=)\s*${N}\s*[+−\-]\s*${N}\s*$`), new RegExp(String.raw`(?:^|=)\s*${N}\s*(?:·|\\cdot|\*)\s*${N}\s*$`),
  /(^|[^\d.,\w])1\s*(?:·|\\cdot)?\s*x(?![\w])/, /\+\s*[−-]\s*\d/, /[−-]\s*[−-]\s*\d/, /(?:·|\\cdot)\s*1(?![\d,.\/^])/, /[+−-]\s*0(?![\d,.])\s*$/,
  /(?<!_\{[^}]*\}|_-?\d)\^\{?1\}?(?![\d])/,
];
const a5ok = (z) => A5.every((m) => !m.test(z));

/* ---------- Die fünf Körper ---------- */
test("Fünf Körper: e, k, f wie bekannt, e − k + f = 2, Schläfli-Symbol", () => {
  const soll = { tetraeder: [4, 6, 4, 3, 3], wuerfel: [8, 12, 6, 4, 3], oktaeder: [6, 12, 8, 3, 4], dodekaeder: [20, 30, 12, 5, 3], ikosaeder: [12, 30, 20, 3, 5] };
  assert.equal(KOERPER.length, 5);
  for (const k of KOERPER) {
    const [e, ka, f, p, q] = soll[k.id];
    assert.deepEqual([k.e, k.k, k.f, k.p, k.q], [e, ka, f, p, q], k.id);
    assert.equal(k.e - k.k + k.f, 2, k.id);
    assert.equal(p * f, 2 * ka, `${k.id}: p · f = 2k`);
    assert.equal(q * e, 2 * ka, `${k.id}: q · e = 2k`);
    assert.ok(nahe(kantenAusPQ(p, q), ka, 1e-9), `${k.id}: k aus 1/p + 1/q = 1/2 + 1/k`);
  }
  assert.equal(koerper("gibtsnicht").id, "wuerfel");
});

test("Fünf Körper sind wirklich regelmäßig (numerisch geprüft)", () => {
  for (const k of KOERPER) {
    const v = k.ecken;
    v.forEach((p) => assert.ok(nahe(laenge(p), 1, 1e-12), `${k.id}: Umkugel`));
    const L = k.kanten.map((ka) => laenge(minus(v[ka.a], v[ka.b])));
    L.forEach((l) => assert.ok(nahe(l, L[0], 1e-9), `${k.id}: alle Kanten gleich lang`));
    // kürzester Eckenabstand = Kantenlänge (keine Kante fehlt, keine zu viel)
    let min = Infinity;
    for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) min = Math.min(min, laenge(minus(v[i], v[j])));
    assert.ok(nahe(min, L[0], 1e-9), `${k.id}: Kanten = nächste Nachbarn`);
    for (const [fi, f] of k.flaechen.entries()) {
      assert.equal(f.length, k.p, `${k.id}: jede Fläche ein ${k.p}-Eck`);
      const c = mitte(f.map((i) => v[i]));
      const r = f.map((i) => laenge(minus(v[i], c)));
      r.forEach((x) => assert.ok(nahe(x, r[0], 1e-9), `${k.id}: Fläche regelmäßig`));
      f.forEach((i, j) => assert.ok(nahe(laenge(minus(v[i], v[f[(j + 1) % f.length]])), L[0], 1e-9), `${k.id}: Randfolge der Fläche`));
      const n = k.normalen[fi];
      f.forEach((i) => assert.ok(nahe(skalar(n, minus(v[i], c)), 0, 1e-9), `${k.id}: Fläche eben`));
      // gegen den Uhrzeigersinn von außen gesehen
      assert.ok(skalar(kreuz(minus(v[f[1]], v[f[0]]), minus(v[f[2]], v[f[1]])), n) > 0, `${k.id}: Umlaufsinn`);
      // Innenwinkel = (p − 2) · 180° / p
      const w = Math.acos(skalar(einheit(minus(v[f[1]], v[f[0]])), einheit(minus(v[f[f.length - 1]], v[f[0]])))) * 180 / Math.PI;
      assert.ok(nahe(w, innenwinkel(k.p), 1e-7), `${k.id}: Innenwinkel`);
    }
    v.forEach((_, i) => {
      assert.equal(k.kanten.filter((ka) => ka.a === i || ka.b === i).length, k.q, `${k.id}: ${k.q} Kanten je Ecke`);
      assert.equal(k.flaechen.filter((f) => f.includes(i)).length, k.q, `${k.id}: ${k.q} Flächen je Ecke`);
    });
    k.kanten.forEach((ka) => assert.equal(ka.flaechen.length, 2, `${k.id}: jede Kante an zwei Flächen`));
  }
  // Koordinaten mit dem goldenen Schnitt: Ikosaeder-Ecke (0, 1, φ)
  assert.ok(nahe(PHI * PHI, PHI + 1, 1e-12));
  assert.ok(koerper("ikosaeder").ecken.some((p) => nahe(p[0], 0) && nahe(p[2] / p[1], PHI, 1e-12)));
});

test("Dualität und Winkeldefizit (Descartes: zusammen 720°)", () => {
  for (const k of KOERPER) {
    const d = dualVon(k), partner = koerper(k.dual);
    assert.equal(d.ecken.length, partner.e, `${k.id}: Dual hat so viele Ecken wie der Partner`);
    assert.equal(d.kanten.length, partner.k, `${k.id}: Dual hat gleich viele Kanten`);
    assert.equal(flaechenAus(d.ecken).length, partner.f, `${k.id}: Dual hat so viele Flächen wie der Partner`);
    assert.equal(k.e, partner.f); assert.equal(k.f, partner.e);
    // Dual ist ein (verkleinerter) Partnerkörper: alle Ecken gleich weit vom Mittelpunkt, alle Kanten gleich lang
    const r = d.ecken.map(laenge), L = d.kanten.map((ka) => laenge(minus(d.ecken[ka.a], d.ecken[ka.b])));
    r.forEach((x) => assert.ok(nahe(x, r[0], 1e-9))); L.forEach((x) => assert.ok(nahe(x, L[0], 1e-9)));
    assert.ok(nahe(k.e * defizit(k), 720, 1e-9), `${k.id}: Gesamtdefizit 720°`);
  }
  // Würfel → Oktaeder: Flächenmitten liegen auf den Achsen
  const okt = dualVon(koerper("wuerfel")).ecken.map((p) => mal(p, Math.sqrt(3)));
  for (const p of okt) assert.ok(nahe(p.map(Math.abs).sort((a, b) => a - b).join(), [0, 0, 1].join()) || nahe(Math.max(...p.map(Math.abs)), 1, 1e-9));
});

/* ---------- Der Beweis ---------- */
test("Innenwinkel und Ecken: genau fünf Paare (p, q)", () => {
  assert.deepEqual([3, 4, 5, 6, 7, 8].map(innenwinkel).map((x) => dk(x)), ["60", "90", "108", "120", "128,57", "135"]);
  assert.deepEqual(moeglichePaare(40, 40), [[3, 3], [3, 4], [3, 5], [4, 3], [5, 3]]);
  for (const [p, q] of [[3, 6], [4, 4], [6, 3]]) assert.equal(eckenArt(p, q), "flach");
  assert.equal(eckenArt(5, 4), "ueber"); assert.equal(eckenArt(7, 3), "ueber"); assert.equal(eckenArt(3, 2), "zuwenig");
  // Zählbeweis: (p − 2)(q − 2) < 4 ⇔ Ecke möglich
  for (let p = 3; p <= 30; p++) for (let q = 3; q <= 30; q++) assert.equal((p - 2) * (q - 2) < 4, eckenArt(p, q) === "ecke", `${p}, ${q}`);
});

test("Ecke schließen: Flächen bleiben regelmäßig, Lücke schließt sich, Winkel passt zum Körper", () => {
  for (const k of KOERPER) {
    const { p, q } = k;
    for (const s of [0, 0.3, 0.7, 1]) {
      const { flaechen } = eckeFlaechen(p, q, s, 1);
      assert.equal(flaechen.length, q);
      for (const f of flaechen) {
        assert.equal(f.length, p);
        f.forEach((pt, i) => assert.ok(nahe(laenge(minus(pt, f[(i + 1) % p])), 1, 1e-9), `${k.id} s=${s}: Seitenlänge`));
        const w = Math.acos(skalar(einheit(f[1]), einheit(f[p - 1]))) * 180 / Math.PI;
        assert.ok(nahe(w, innenwinkel(p), 1e-7), `${k.id}: Winkel an der Spitze`);
      }
      // Nachbarn teilen sich eine Kante (letzte Ecke der Fläche j = erste Nachbarecke der Fläche j + 1)
      for (let j = 0; j + 1 < q; j++) assert.ok(laenge(minus(flaechen[j][p - 1], flaechen[j + 1][1])) < 1e-9, `${k.id}: gemeinsame Kante`);
      if (s === 0) flaechen.flat().forEach((pt) => assert.ok(nahe(pt[1], 0, 1e-9), "s = 0: alles in der Ebene"));
      if (s === 1) assert.ok(laenge(minus(flaechen[q - 1][p - 1], flaechen[0][1])) < 1e-9, `${k.id}: Lücke geschlossen`);
      if (s > 0 && s < 1) assert.ok(laenge(minus(flaechen[q - 1][p - 1], flaechen[0][1])) > 1e-3, `${k.id}: Lücke noch offen`);
    }
    // Öffnungswinkel β = Winkel zwischen Kante und Achse Ecke → Mittelpunkt im echten Körper
    const v0 = k.ecken[0], nb = k.kanten.filter((ka) => ka.a === 0 || ka.b === 0).map((ka) => k.ecken[ka.a === 0 ? ka.b : ka.a]);
    const beta = Math.acos(skalar(einheit(minus(nb[0], v0)), mal(v0, -1)));
    assert.ok(nahe(eckeOeffnung(p, q, 1).beta, beta, 1e-9), `${k.id}: β passt`);
  }
  assert.equal(eckeOeffnung(3, 6, 1).geht, false);
});

/* ---------- Netze ---------- */
test("Netze aus dem Labor falten sich zum Würfel bzw. Tetraeder", () => {
  for (const [id, liste] of Object.entries(NETZE)) for (const n of liste) {
    const { netz } = netzFuer(id, n.id);
    assert.ok(netz.zusammenhaengend, `${n.id}: zusammenhängend`);
    falte(netz, 0).flat().forEach((p) => assert.ok(nahe(p[2], 0), "t = 0 eben"));
    const r = faltErgebnis(netz);
    assert.equal(r.doppelt.length, 0, `${n.id}: keine Fläche doppelt`);
    assert.equal(r.ecken, id === "wuerfel" ? 8 : 4, `${n.id}: Ecken des Körpers`);
    r.flaechen.flat().forEach((p) => assert.ok(p[2] > -1e-9, `${n.id}: gefaltet wird nach oben`));
    // jede gefaltete Fläche ist so groß wie vorher (Faltung ist eine Bewegung)
    const g = r.flaechen;
    netz.polygone.forEach((poly, i) => poly.forEach((_, j) => {
      const a = [...poly[j], 0], b = [...poly[(j + 1) % poly.length], 0];
      assert.ok(nahe(laenge(minus(a, b)), laenge(minus(g[i][j], g[i][(j + 1) % poly.length])), 1e-9));
    }));
  }
  assert.equal(netzFuer("oktaeder"), null);
});

test("Hexominos: 35 Figuren, genau 11 Würfelnetze; Gründe stimmen", () => {
  const h = hexominos();
  assert.equal(h.length, 35);
  assert.equal(h.filter((x) => x.istNetz).length, 11);
  for (const x of h) {
    if (x.istNetz) { assert.equal(x.grund, null); continue; }
    assert.ok(["block", "reihe", "ueberlappung"].includes(x.grund));
    assert.ok(x.doppelt.length > 0);
    assert.ok(grundText(x.grund).length > 40);
  }
  // Lage (Drehung/Spiegelung) ändert nichts
  for (const x of h) for (let s = 0; s < 8; s++) assert.equal(netzPruefung(lageVon(x.zellen, s)).istNetz, x.istNetz);
  // 2 × 2-Block ist nie ein Netz
  assert.equal(netzPruefung([[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]]).grund, "block");
  assert.equal(netzPruefung([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [1, 1]]).grund, "reihe");
});

/* ---------- Drehen und Projektion ---------- */
test("Drehung bleibt orthonormal, Projektion sieht genau die vorderen Flächen", () => {
  let R = EINS;
  for (let i = 0; i < 4000; i++) R = drehe(R, 0.013 * Math.sin(i), 0.011 * Math.cos(i * 0.7));
  const RT = R[0].map((_, j) => R.map((z) => z[j]));
  const E = matMal(R, RT);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) assert.ok(nahe(E[i][j], i === j ? 1 : 0, 1e-9));
  // Ziehen nach rechts: Vorderseite wandert nach rechts; nach unten: Oberseite kippt nach vorn
  assert.ok(matVek(drehe(EINS, 0.2, 0), [0, 0, 1])[0] > 0);
  assert.ok(matVek(drehe(EINS, 0, 0.2), [0, 1, 0])[2] > 0);
  const w = projiziere(koerper("wuerfel"), START_DREHUNG);
  assert.equal(w.flaechen.filter((f) => f.sichtbar).length, 3);
  assert.equal(w.kanten.filter((k) => k.verdeckt).length, 3);
  const vorn = projiziere(koerper("wuerfel"), EINS, { d: 1e9 });
  assert.equal(vorn.flaechen.filter((f) => f.sichtbar).length, 1);
  for (const k of KOERPER) {
    const pr = projiziere(k, matMal(rotX(0.4), rotY(0.9)));
    const s = pr.flaechen.filter((f) => f.sichtbar).length;
    assert.ok(s >= 1 && s < k.f, k.id);
    for (let i = 1; i < pr.flaechen.length; i++) assert.ok(pr.flaechen[i - 1].tiefe <= pr.flaechen[i].tiefe, "von hinten nach vorn");
    pr.ecken.forEach((e) => assert.ok(e.x > 40 && e.x < 320 && e.y > 10 && e.y < 290, "im Bild"));
  }
  const nz = projiziereNetz(netzFuer("wuerfel", "kreuz").netz, 0.5, NETZ_START);
  assert.equal(nz.length, 6);
  assert.match(schattiere("#1E6BC0", 0.5), /^rgb\(\d+,\d+,\d+\)$/);
});

/* ---------- Aufgaben ---------- */
const richtig = (a) => {
  if (a.art === "winkel") return { alpha: dk(a.alpha), S: dk(a.S), wahl: a.ergebnis };
  if (a.art === "zaehlen") return { k: String(a.k), e: String(a.e) };
  if (a.art === "euler") return { [a.gesucht]: String(a[a.gesucht]) };
  return a.istNetz;
};
const ohneLuecken = (t) => !/undefined|NaN|null|\[object/.test(t);

test("Generatoren: über viele Durchläufe lösbar, richtig geprüft, Texte und Rechenwege sauber (A5)", () => {
  const gesehen = new Map();
  for (const { id } of ARTEN) for (let s = 1; s <= 5; s++) for (let i = 0; i < 300; i++) {
    const a = aufgabe(id, s);
    assert.equal(pruefe(a, richtig(a)).ok, true, `${id} ${s} ${JSON.stringify(a)}`);
    const text = [auftrag(a), aufgabeTex(a), tipp(a), ...rechenweg(a), ...felder(a).flat()].join(" | ");
    assert.ok(ohneLuecken(text), `${id}: ${text}`);
    assert.ok(auftrag(a).length > 40 && tipp(a).length > 30);
    for (const z of rechenweg(a)) assert.ok(a5ok(z), `${id}: ${z}`);
    if (id !== "netz") assert.ok(rechenweg(a).length >= 2);
    gesehen.set(`${id}-${s}`, (gesehen.get(`${id}-${s}`) || new Set()).add(JSON.stringify(a)));
    if (id === "winkel") {
      assert.ok(nahe(a.alpha, ((a.p - 2) * 180) / a.p) && nahe(a.S, a.q * a.alpha));
      assert.equal(a.ergebnis, a.S < 360 - 1e-9 ? "ecke" : nahe(a.S, 360) ? "flach" : "ueber");
    }
    if (id === "zaehlen") {
      assert.ok(Number.isInteger(a.k) && Number.isInteger(a.e), `${a.name}: ganzzahlig`);
      assert.equal(a.e - a.k + a.f, 2, `${a.name}: Euler`);
      if (s === 1) assert.ok(KOERPER.some((k) => k.name === a.name && k.e === a.e && k.k === a.k && k.f === a.f));
    }
    if (id === "euler") {
      assert.equal(a.e - a.k + a.f, 2, a.name);
      assert.ok(a.e >= 4 && a.f >= 4 && a.k >= 6, a.name);
    }
    if (id === "netz") {
      assert.equal(a.zellen.length, 6);
      assert.equal(netzPruefung(a.zellen).istNetz, a.istNetz);
      if (s <= 2 && !a.istNetz) assert.notEqual(a.grund, "ueberlappung", "Stufe 1–2: nur klare Fälle");
    }
  }
  for (const [schl, set] of gesehen) assert.ok(set.size >= 3, `${schl}: zu wenig Abwechslung (${set.size})`);
});

test("Gezielte Rückmeldung bei typischen Fehlern", () => {
  const fest = (werte) => { let i = 0; return (a, b) => { const w = werte[i++ % werte.length]; return Math.max(a, Math.min(b, w)); }; };
  // Winkel: Winkelsumme des ganzen Vielecks statt eines Winkels / Mittelpunktswinkel / flach als Ecke
  const w = { art: "winkel", p: 5, q: 3, alpha: 108, S: 324, ergebnis: "ecke" };
  assert.match(pruefe(w, { alpha: "540", S: "1620", wahl: "ueber" }).grund, /Winkelsumme im ganzen Fünfeck/);
  assert.match(pruefe(w, { alpha: "72", S: "216", wahl: "ecke" }).grund, /Mittelpunktswinkel/);
  assert.match(pruefe(w, { alpha: "108", S: "300", wahl: "ecke" }).grund, /3 Winkel von je 108°/);
  assert.match(pruefe(w, { alpha: "108", S: "324", wahl: "flach" }).grund, /Lücke von 36°/);
  const fl = { art: "winkel", p: 4, q: 4, alpha: 90, S: 360, ergebnis: "flach" };
  assert.match(pruefe(fl, { alpha: "90", S: "360", wahl: "ecke" }).grund, /flach/);
  const ue = { art: "winkel", p: 6, q: 4, alpha: 120, S: 480, ergebnis: "ueber" };
  assert.match(pruefe(ue, { alpha: "120", S: "480", wahl: "ecke" }).grund, /überlappen/);
  assert.equal(pruefe(w, { alpha: "108°", S: "324,0", wahl: "ecke" }).ok, true);
  // Zählen: nicht durch 2 bzw. q geteilt
  const z = aufgabe("zaehlen", 5, fest([0]));
  assert.equal(z.name, "Fußball (abgestumpftes Ikosaeder)");
  assert.deepEqual([z.k, z.e, z.f], [90, 60, 32]);
  assert.match(pruefe(z, { k: "180", e: "60" }).grund, /teile durch 2/);
  assert.match(pruefe(z, { k: "90", e: "180" }).grund, /teile durch 3/);
  assert.match(pruefe(z, { k: "90", e: "90" }).grund, /nicht durch 2/);
  assert.equal(teileText(z.teile), "12 Fünfecken und 20 Sechsecken");
  assert.equal(teileText([[20, 3], [30, 4], [12, 5]]), "20 Dreiecken, 30 Quadraten und 12 Fünfecken");
  // Euler: Vorzeichen und die 2 auf der falschen Seite
  const e = { art: "euler", name: "Test", e: 12, k: 30, f: 20, gesucht: "k" };
  assert.match(pruefe(e, { k: "34" }).grund, /2 auf die falsche Seite/);
  assert.match(pruefe(e, { k: "10" }).grund, /Vorzeichen/);
  assert.ok(pruefe(e, { k: "17" }).grund.length > 20);
  const ef = { art: "euler", name: "Test", e: 8, k: 12, f: 6, gesucht: "f" };
  assert.match(pruefe(ef, { f: "18" }).grund, /Vorzeichen/);
  // Netz: Gründe
  const nein = { art: "netz", istNetz: false, grund: "reihe", zellen: [], doppelt: [[0, 4]] };
  assert.match(pruefe(nein, true).grund, /Fünf Quadrate in einer Reihe/);
  const ja = { art: "netz", istNetz: true, grund: null, zellen: [], doppelt: [] };
  assert.match(pruefe(ja, false).grund, /Doch/);
  assert.equal(pruefe(ja, true).ok, true);
  // Eingaben
  assert.equal(lies("128,57°"), 128.57); assert.equal(lies("−2"), -2); assert.equal(lies("zwölf"), null);
});

test("Körperlisten der Generatoren erfüllen alle e − k + f = 2", () => {
  const { PLATON_ZAEHLEN, ARCHIMEDISCH, SCHWER, prisma, antiprisma } = ZAEHL_KOERPER;
  const alle = [...PLATON_ZAEHLEN, ...ARCHIMEDISCH, ...SCHWER, ...[3, 5, 8, 12, 15].flatMap((n) => [prisma(n), antiprisma(n)])];
  for (const z of alle) {
    const sum = z.teile.reduce((a, [anz, p]) => a + anz * p, 0), f = z.teile.reduce((a, [anz]) => a + anz, 0);
    assert.equal(sum % 2, 0, z.name); assert.equal(sum % z.q, 0, z.name);
    assert.equal(sum / z.q - sum / 2 + f, 2, z.name);
  }
  const { pyramide, prismaEkf, doppelpyramide, antiprismaEkf, UMGEBAUT } = EULER_KOERPER;
  for (let n = 3; n <= 20; n++) for (const x of [pyramide(n), prismaEkf(n), doppelpyramide(n), antiprismaEkf(n)]) assert.equal(x.e - x.k + x.f, 2, x.name);
  for (const x of UMGEBAUT) assert.equal(x.e - x.k + x.f, 2, x.name);
});

test("Begründungen, Gliederung, Tipps, Kolloquium", () => {
  assert.equal(BEGRUENDUNGEN.length, 2);
  for (const b of BEGRUENDUNGEN) for (const [i, st] of b.schritte.entries()) {
    assert.ok(st.optionen.length >= 2 && st.richtig >= 0 && st.richtig < st.optionen.length);
    assert.deepEqual([...gemischt(st.optionen, i)].sort(), st.optionen.map((_, j) => j));
    // die richtige Antwort verrät sich nicht durch Länge
    const lang = st.optionen.map((o) => o.length);
    assert.ok(lang[st.richtig] <= 2 * Math.min(...lang) + 12, `${b.id} ${i}: richtige Antwort auffällig lang`);
  }
  assert.equal(GLIEDERUNG.length, 5);
  assert.ok(GLIEDERUNG.reduce((s, g) => s + g.min, 0) >= 15 && TIPPS.length === 3);
  assert.ok(KOLLOQUIUM.length >= 6 && KOLLOQUIUM.every((q) => q.frage.endsWith("?") && q.antwort.length > 80 && ["Basis", "Vertiefung", "Profi"].includes(q.stufe)));
  for (const st of ["Basis", "Vertiefung", "Profi"]) assert.ok(KOLLOQUIUM.filter((q) => q.stufe === st).length >= 2, st);
});

/* ---------- Hausregeln in den Quelltexten ---------- */
test("Quelltexte: Exporte, keine TeX-Attribute, keine Gendersprache, keine Buchtexte, kein Selbst-Scrollen", () => {
  const jsx = readFileSync(new URL("../src/funcGfsPlatonisch.jsx", import.meta.url), "utf8");
  const js = readFileSync(new URL("../src/gfsPlatonisch.js", import.meta.url), "utf8");
  assert.match(jsx, /export function GfsPlatonischSeite\(\{ gehe \}\)/);
  assert.match(jsx, /export function PlatonischBild\(\)/);
  assert.match(jsx, /className="gtk-bild" viewBox="0 0 160 120"/);
  assert.match(jsx, /from "\.\/funcGfsBausteine\.jsx"/);
  assert.match(jsx, /from "\.\/funcAnimKarte\.jsx"/);
  assert.ok((jsx.match(/<PlatonAnimation art="/g) || []).length >= 3, "mindestens drei Animationen auf der Seite");
  for (const [name, q] of [["jsx", jsx], ["js", js]]) {
    q.split("\n").forEach((z, i) => {
      assert.ok(!/\s[a-zA-Z]+="[^"{}]*\\\\[a-zA-Z{]/.test(z), `${name}:${i + 1}: TeX im JSX-Attribut`);
      assert.ok(!/[*:_]innen\b|[a-zäöü]Innen\b/.test(z), `${name}:${i + 1}: Gendersprache`);
      assert.ok(!/\.(scrollTo|scrollIntoView|scrollBy)\s*\(/.test(z), `${name}:${i + 1}: Scrollen nur über springe()`);
      assert.ok(!z.includes("√"), `${name}:${i + 1}: Wurzeln nur über \\sqrt / MitWurzeln`);
    });
    assert.ok(!/Lambacher|Schweizer|Klett/.test(q.replace(/\/\*[\s\S]*?\*\//g, "")), `${name}: keine Buchverweise im Inhalt`);
  }
});
