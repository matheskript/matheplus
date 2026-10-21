/* Kurs Dreiecksgeometrie (src/geoKursDaten.js, src/funcGeoKurs.jsx): Module lückenlos über die Buchseiten 3–52,
   Titel und Leitfrage wie auf der Buchseite, nur echte Werkzeuge – bei den Unterkapiteln genau die aus den
   „In der App“-Kästen –, Stand (kursStand.js) mit denselben Regeln wie die Kursseite, Einbindung wie der Vektorkurs.
   Liest die Buchseiten aus schulbuch/dreiecksgeometrie/pages (nur lesend). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { KURS_MODULE, KAPITEL, TITEL_KURZ, KAPITEL_KURZ, BUCH_BEREIT } from "../src/geoKursDaten.js";
import { WERKZEUGE } from "../src/werkzeuge.js";
import { pfadAufloesen, pfadFuer } from "../src/pfade.js";
import { KURSE } from "../src/hauptmenue.js";
import { teilenInfo } from "../src/teilen.js";
import { SPRUENGE } from "../src/sprung.js";

const src = (d) => readFileSync(new URL(`../src/${d}`, import.meta.url), "utf8");
const BUCH = new URL("../../schulbuch/dreiecksgeometrie/", import.meta.url);
const SEITEN = new URL("pages/", BUCH);
const buchDa = existsSync(SEITEN);
const dateien = buchDa ? readdirSync(SEITEN).filter((d) => /^\d\d-.*\.html$/.test(d)) : [];
const seite = (n) => {
  const d = dateien.find((x) => Number(x.slice(0, 2)) === n);
  return d ? readFileSync(new URL(d, SEITEN), "utf8") : null;
};
const ohneTags = (h) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const meta = (h) => (/^<!--(.*?)-->/.exec(h) || [, ""])[1];
const h2 = (h) => { const m = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(h); return m ? ohneTags(m[1]) : null; };
const leitfrage = (h) => { const m = /class="leitfrage"[^>]*>([\s\S]*?)<\/p>/.exec(h); return m ? ohneTags(m[1]) : null; };

test("Module lückenlos von Seite 3 bis 52, ohne Überschneidung, Ids eindeutig", () => {
  assert.equal(KURS_MODULE[0].von, 3);
  assert.equal(KURS_MODULE[KURS_MODULE.length - 1].bis, 52);
  for (let i = 0; i < KURS_MODULE.length; i++) {
    const m = KURS_MODULE[i];
    assert.ok(m.von <= m.bis, `${m.id}: von > bis`);
    if (i > 0) assert.equal(m.von, KURS_MODULE[i - 1].bis + 1, `${m.id} schließt nicht an ${KURS_MODULE[i - 1].id} an`);
    assert.ok(KAPITEL[m.kap], `${m.id}: Kapitel ${m.kap}`);
    assert.ok(m.frage && m.titel, m.id);
  }
  assert.equal(new Set(KURS_MODULE.map((m) => m.id)).size, KURS_MODULE.length);
  assert.ok(BUCH_BEREIT);
});

test("Je Kapitel die Unterkapitel und am Ende genau ein Training; Unterkapitel durchgezählt 1 … 19", () => {
  let nr = 0;
  for (const k of Object.keys(KAPITEL)) {
    const ms = KURS_MODULE.filter((m) => m.kap === k);
    assert.ok(ms.length >= 3, `Kapitel ${k}`);
    const t = ms[ms.length - 1];
    assert.equal(t.nr, "", `Kapitel ${k} endet nicht mit einem Training`);
    assert.equal(t.von, t.bis, `Training ${k} ist eine Seite`);
    assert.ok(ms.slice(0, -1).every((m) => m.nr !== ""), `Kapitel ${k}: Training mittendrin`);
    for (const m of ms.slice(0, -1)) assert.equal(m.nr, String(++nr), m.id);
  }
  assert.equal(nr, 19);
  assert.deepEqual(KURS_MODULE.filter((m) => !m.nr).map((m) => m.von), [12, 22, 28, 36, 44, 52]);
  for (const id of Object.keys(TITEL_KURZ)) assert.ok(KURS_MODULE.some((m) => m.id === id), `TITEL_KURZ.${id}`);
  for (const k of Object.keys(KAPITEL_KURZ)) assert.ok(KAPITEL[k], `KAPITEL_KURZ.${k}`);
});

test("Titel = Überschrift (h2) der Buchseite, Frage = Leitfrage, Grenzen = Seitenanfänge im Buch", { skip: !buchDa && "Buchquellen fehlen" }, () => {
  for (const m of KURS_MODULE) {
    const erste = seite(m.von);
    assert.ok(erste, `Seite ${m.von} fehlt`);
    /* Die Auftaktseite gehört zum ersten Modul des Kapitels: dann steht das Unterkapitel auf der nächsten Seite */
    const istAuftakt = /typ:\s*auftakt/.test(meta(erste));
    const start = istAuftakt ? seite(m.von + 1) : erste;
    assert.ok(new RegExp(`kap:\\s*${m.kap}\\b`).test(meta(erste)), `${m.id}: Seite ${m.von} gehört nicht zu Kapitel ${m.kap}`);
    const ueberschrift = h2(start);
    if (m.nr) {
      assert.equal(ueberschrift, m.titel, `${m.id}: h2 „${ueberschrift}“`);
      assert.match(meta(start), new RegExp(`uk:\\s*${m.titel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`), `${m.id}: Meta-Zeile`);
    } else {
      assert.ok(ueberschrift.endsWith(`· ${m.titel}`), `${m.id}: h2 „${ueberschrift}“`);
    }
    assert.equal(leitfrage(start), m.frage, `${m.id}: Leitfrage`);
    /* innen nur Fortsetzungsseiten, danach beginnt ein neues Modul (Auftakt, Unterkapitel oder Training) */
    for (let s = (istAuftakt ? m.von + 2 : m.von + 1); s <= m.bis; s++) assert.ok(!/uk:|ukap:|typ:/.test(meta(seite(s))), `${m.id}: Seite ${s} beginnt etwas Neues`);
    const danach = seite(m.bis + 1);
    if (m.bis < 52) assert.ok(/uk:|ukap:|typ:\s*auftakt/.test(meta(danach)), `${m.id}: Seite ${m.bis + 1} ist eine Fortsetzung`);
  }
});

/* Sprungziele der „In der App“-Kästen, wie sie der Reader setzt (schulbuch/dreiecksgeometrie/viewer.mjs) */
function ziele() {
  const v = readFileSync(new URL("viewer.mjs", BUCH), "utf8");
  const block = v.slice(v.indexOf("const ZIELE"), v.indexOf("];", v.indexOf("const ZIELE")));
  return [...block.matchAll(/\["([^"]+)",\s*"([a-z0-9]+)"\]/g)].map((m) => [m[1], m[2]]);
}

test("Werkzeuge: jedes gibt es wirklich, Unterkapitel = genau die Werkzeuge aus den App-Kästen, Training = Werkzeuge des Kapitels", { skip: !buchDa && "Buchquellen fehlen" }, () => {
  const kurs = src("funcGeoKurs.jsx");
  const wzSeiten = src("funcWerkzeugSeite.jsx");
  const imKurs = [...kurs.slice(kurs.indexOf("export const KURS_WERKZEUGE")).split("\n};")[0].matchAll(/^  (\w+): wzSeite\("(\w+)"\)/gm)];
  for (const [, schluessel, id] of imKurs) assert.equal(schluessel, id, `KURS_WERKZEUGE.${schluessel}`);
  const schluessel = imKurs.map((m) => m[1]);
  const ZIELE = ziele();
  assert.ok(ZIELE.length >= 10, "ZIELE aus viewer.mjs nicht gefunden");
  for (const m of KURS_MODULE) {
    assert.ok(m.werkzeuge.length > 0, `${m.id} ohne Werkzeug`);
    assert.equal(new Set(m.werkzeuge).size, m.werkzeuge.length, `${m.id}: Werkzeug doppelt`);
    for (const id of m.werkzeuge) {
      assert.ok(WERKZEUGE[id], `${m.id}: ${id} fehlt in werkzeuge.js`);
      assert.ok(new RegExp(`^  ${id}: \\{ titel:`, "m").test(wzSeiten), `${m.id}: ${id} fehlt in WZ_SEITEN`);
      assert.ok(schluessel.includes(id), `${m.id}: ${id} fehlt in KURS_WERKZEUGE`);
    }
    if (!m.nr) continue;
    const kaesten = new Set();
    for (let s = m.von; s <= m.bis; s++) {
      for (const k of seite(s).matchAll(/<div class="notiz mathilda">([\s\S]*?)<\/div>/g)) {
        const text = ohneTags(k[1]);
        const z = ZIELE.find(([wort]) => text.includes(wort));
        if (z && WERKZEUGE[z[1]]) kaesten.add(z[1]);
      }
    }
    assert.deepEqual([...m.werkzeuge].sort(), [...kaesten].sort(), `${m.id}: Werkzeuge ≠ App-Kästen ${[...kaesten]}`);
  }
  for (const t of KURS_MODULE.filter((m) => !m.nr)) {
    const kapitel = new Set(KURS_MODULE.filter((m) => m.kap === t.kap && m.nr).flatMap((m) => m.werkzeuge));
    for (const id of t.werkzeuge) assert.ok(kapitel.has(id), `${t.id}: ${id} kommt im Kapitel nicht vor`);
  }
});

test("Reader: Pfad /buecher/dreiecksgeometrie mit ?von=&bis=, Buchinhalte aus kurs/<seite>.json", () => {
  const kurs = src("funcGeoKurs.jsx");
  assert.ok(kurs.includes('const BUCH = "/buecher/dreiecksgeometrie/index.html";'));
  assert.ok(kurs.includes("src={`${BUCH}?von=${modul.von}&bis=${modul.bis}&voll="));
  assert.ok(kurs.includes('pfad: "/buecher/dreiecksgeometrie"'), "KursTraining lädt die Buchinhalte aus /buecher/dreiecksgeometrie/kurs");
  assert.ok(kurs.includes('springe("geokurs-modul"') && SPRUENGE["geokurs-modul"], "Seitenwechsel über den Sprung-Schalter");
  const ohneSchalter = kurs.replace('springe("geokurs-modul", () => window.scrollTo({ top: 0, behavior: "auto" }))', "");
  assert.ok(!/scrollTo\(|scrollIntoView\(/.test(ohneSchalter), "kein Scrollen am Sprung-Schalter vorbei");
});

test("Stand (kursStand.js) folgt denselben Regeln wie die Kursseite", async () => {
  const speicher = new Map();
  globalThis.localStorage = { getItem: (k) => (speicher.has(k) ? speicher.get(k) : null), setItem: (k, v) => speicher.set(k, String(v)) };
  const { geoStand } = await import("../src/kursStand.js");
  assert.deepEqual(geoStand(), { fertig: 0, gesamt: KURS_MODULE.length, weiter: "Nächstes Modul: Rechteck und Quadrat" });
  speicher.set("mm_geokurs", JSON.stringify({ gelesen: { rechteck: true, rechtwinklig: true }, geuebt: { rechteck: true } }));
  assert.equal(geoStand().fertig, 1, "gelesen + geübt = geschafft, nur gelesen nicht");
  assert.equal(geoStand().weiter, "Nächstes Modul: Das rechtwinklige Dreieck");
  speicher.set("mm_geokurs", JSON.stringify({ gelesen: { rechteck: true }, geuebt: { rechteck: true }, haken: { rechteck: false, t1: true } }));
  assert.equal(geoStand().fertig, 1, "Haken von Hand geht vor");
  /* Die Kursseite rechnet mit derselben Formel */
  const kurs = src("funcGeoKurs.jsx"), stand = src("kursStand.js");
  assert.ok(kurs.includes("const fertigAuto = (m, s) => (BUCH_BEREIT ? !!s.gelesen[m.id] && (m.werkzeuge.length === 0 || !!s.geuebt[m.id]) : m.werkzeuge.length > 0 && !!s.geuebt[m.id]);"));
  assert.ok(stand.includes("GEO_BEREIT ? !!gelesen[m.id] && (m.werkzeuge.length === 0 || !!geuebt[m.id]) : m.werkzeuge.length > 0 && !!geuebt[m.id]"));
  assert.ok(kurs.includes('const SPEICHER = "mm_geokurs";') && stand.includes('lies("mm_geokurs")'));
  delete globalThis.localStorage;
});

test("Einbindung wie der Vektorkurs: Pfad, Ansicht, Menü, Kachel, Suche, Teilen, Farben, Motiv", () => {
  assert.equal(pfadAufloesen("/dreiecksgeometrie").ansicht, "geokurs");
  for (const a of ["kurs-dreiecksgeometrie", "dreiecksgeometrie-kurs", "kurs/dreiecksgeometrie", "geokurs"]) assert.equal(pfadAufloesen("/" + a).ansicht, "geokurs", a);
  assert.equal(pfadFuer({ ansicht: "geokurs" }), "/dreiecksgeometrie");
  assert.ok(src("func10.jsx").includes('ansicht === "geokurs"'));
  assert.ok(KURSE.some((k) => k.id === "geokurs" && k.ziel.ansicht === "geokurs"), "☰-Menü");
  assert.ok(src("hauptmenueTeile.jsx").includes("  geokurs: { hg:"), "KURS_STIL");
  assert.ok(/^  geokurs: \{ farben: AMETHYST, Motiv: MotivDreieck, stand: geoStand/m.test(src("funcHauptmenueDesktop.jsx")), "Desktop-Menü (Lack)");
  for (const d of ["funcStartseite.jsx", "funcVision.jsx"]) assert.ok(src(d).includes('<GeoKursKachel onClick={() => gehe({ ansicht: "geokurs" })} />'), d);
  assert.ok(src("suche.js").includes('{ ansicht: "geokurs" }, "Kurs"]'), "Suche");
  assert.ok(teilenInfo("geokurs"), "Teilen-Knopf");
  /* Palette: dieselben Schlüssel wie TIEFBLAU, Motiv im gemeinsamen Raster */
  const farben = src("kursFarben.js");
  const schluessel = (name) => {
    const b = farben.slice(farben.indexOf(`export const ${name} = {`), farben.indexOf("\n};", farben.indexOf(`export const ${name} = {`)));
    return [...b.matchAll(/(?:^|[\s,{])([a-zA-Z]+):\s/g)].map((m) => m[1]).sort();
  };
  assert.deepEqual(schluessel("AMETHYST"), schluessel("TIEFBLAU"));
  const motive = src("funcKursMotive.jsx");
  assert.ok(/export function MotivDreieck\(\{ id, klasse = "kk-motiv" \}\)/.test(motive) && motive.includes('viewBox="0 0 160 120"'));
});

test("Motiv: Dreieck 3-4-5 ist rechtwinklig, C liegt auf dem Thaleskreis, die Quadrate stehen senkrecht auf ihren Seiten", () => {
  const A = [0, 0], B = [5, 0], C = [3.2, 2.4];
  const d = (P, Q) => Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  assert.ok(Math.abs(d(A, C) ** 2 + d(C, B) ** 2 - d(A, B) ** 2) < 1e-9);
  assert.ok(Math.abs(d([2.5, 0], C) - 2.5) < 1e-9);
  /* Quadrat über b: A, C, (0,8|5,6), (−2,4|3,2); über a: C, B, (7,4|1,8), (5,6|4,2) */
  const quadrat = (P, Q, R, S) => [[P, Q], [Q, R], [R, S], [S, P]].every(([u, v]) => Math.abs(d(u, v) - d(P, Q)) < 1e-9) && Math.abs(d(P, R) - d(Q, S)) < 1e-9;
  assert.ok(quadrat(A, C, [0.8, 5.6], [-2.4, 3.2]));
  assert.ok(quadrat(C, B, [7.4, 1.8], [5.6, 4.2]));
  assert.ok(quadrat(A, B, [5, -5], [0, -5]));
  const motive = src("funcKursMotive.jsx");
  for (const s of ["dPfad(D_A, D_C, [0.8, 5.6], [-2.4, 3.2])", "dPfad(D_C, D_B, [7.4, 1.8], [5.6, 4.2])", "dPfad(D_A, D_B, [5, -5], [0, -5])", "D_C = [3.2, 2.4]"]) assert.ok(motive.includes(s), s);
});
