/* Seite „Dokumente“ (Arbeitsmenü F) und die Gruppen D „Entwürfe“ / E „Weitere Seiten“ im Arbeitsmenü. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { DOKUMENTE, ZWECK_MARKEN, FARBEN, dokumenteUebersicht } from "../src/dokumente.js";
import { PFADE } from "../src/pfade.js";
import { KEIN_TEILEN } from "../src/teilen.js";
import { DOKUMENTE_SEITE } from "../src/seitenKonstanten.js";

const quelle = (d) => readFileSync(new URL(`../src/${d}`, import.meta.url), "utf8");

test("Jedes Dokument hat Titel, Art, Zweck und gültige Zweck-Marken; Seitenzahl ist Zahl oder offen", () => {
  const ids = new Set();
  for (const d of DOKUMENTE) {
    assert.ok(!ids.has(d.id), `${d.id} doppelt`); ids.add(d.id);
    assert.ok(d.titel && d.art && d.zweck, `${d.id}: Titel/Art/Zweck fehlt`);
    assert.ok(d.zwecke.length >= 1 && d.zwecke.every((z) => ZWECK_MARKEN.includes(z)), `${d.id}: Zweck-Marke unbekannt`);
    assert.ok(d.seiten === null || (Number.isInteger(d.seiten) && d.seiten > 0), `${d.id}: Seitenzahl`);
  }
});

test("Liegt eine Datei bei (Dokument oder Cover), existiert sie unter public/", () => {
  for (const d of DOKUMENTE) {
    for (const pfad of [d.datei, d.cover]) {
      if (!pfad) continue;
      assert.ok(pfad.startsWith("/"), `${d.id}: Pfad beginnt nicht mit /`);
      assert.ok(existsSync(new URL(`../public${pfad}`, import.meta.url)), `${d.id}: ${pfad} fehlt`);
    }
  }
});

test("Cover gehört in die Box der Druckausgabe: keine eigenen Umschlag-Boxen, kein „Innenteil“, kein „Amazon-Umschlag“", () => {
  assert.ok(!DOKUMENTE.some((d) => /umschlag/i.test(d.id) || /umschlag/i.test(d.titel)), "es gibt noch eine Umschlag-Box");
  for (const d of DOKUMENTE) assert.ok(!/innenteil|amazon-umschlag/i.test(`${d.titel} ${d.art} ${d.zweck}`), `${d.id}: alter Begriff`);
  const b1 = DOKUMENTE.find((d) => d.id === "druck-ableitungen-innenteil");
  const b2 = DOKUMENTE.find((d) => d.id === "druck-vektoren-innenteil");
  assert.equal(b1.cover, "/druck/Ableitungen-Umschlag.pdf");
  assert.equal(b2.cover, "/druck/Vektoren-Umschlag.pdf");
  assert.match(b2.titel, /Vektoren, Geraden und Ebenen/);
});

test("Schulbücher stehen drin: Amazon-Marke, 50 und 70 Seiten", () => {
  const a = DOKUMENTE.find((d) => d.id === "schulbuch-ableitungen");
  const v = DOKUMENTE.find((d) => d.id === "schulbuch-vektoren");
  assert.equal(a.seiten, 50); assert.equal(v.seiten, 70);
  assert.ok(a.zwecke.includes("Amazon") && v.zwecke.includes("Amazon"));
});

test("Der vertrauliche Businessplan liegt nicht in public/ (dort wäre er ohne Passwort abrufbar)", () => {
  const b = DOKUMENTE.find((d) => d.id === "businessplan");
  assert.equal(b.seiten, 8);
  assert.ok(b.zwecke.includes("Investoren"));
  assert.ok(!b.datei || !b.datei.startsWith("/"), "Businessplan darf nicht unter public/ liegen");
});

test("Übersicht rechnet Anzahl, Seiten und fehlende Dateien", () => {
  const u = dokumenteUebersicht([{ seiten: 5, datei: "/a.pdf" }, { seiten: null, datei: null }, { seiten: 3, datei: null }]);
  assert.deepEqual(u, { anzahl: 3, seiten: 8, ohneDatei: 2 });
});

test("Ansicht dokumente hat Pfad, keinen Teilen-Knopf und ist hinter dem gemeinsamen Passwort-Tor", () => {
  assert.equal(DOKUMENTE_SEITE, "dokumente");
  assert.ok(PFADE.some((e) => e.ansicht === "dokumente" && e.pfad === "dokumente"));
  assert.ok(KEIN_TEILEN.includes("dokumente"));
  assert.match(quelle("func10.jsx"), /ansicht === "dokumente" \? \(\s*<EntwurfTor gehe=\{gehe\}><DokumenteSeite \/><\/EntwurfTor>/);
});

test("Arbeitsmenü: A–C wie bisher, D Entwürfe und E Weitere Seiten als Aufklapp-Gruppen, F Dokumente ganz unten", () => {
  const m = quelle("funcArbeitsmenue.jsx");
  assert.ok(m.includes('gruppe("D", "Entwürfe"'), "D Entwürfe fehlt");
  assert.ok(m.includes('gruppe("E", "Weitere Seiten"'), "E Weitere Seiten fehlt");
  assert.ok(m.includes('geschuetzt(DOKUMENTE_SEITE, "Dokumente", "F")'), "F Dokumente fehlt");
  assert.ok(m.indexOf('gruppe("D"') < m.indexOf('gruppe("E"') && m.indexOf('gruppe("E"') < m.indexOf('"Dokumente", "F"'), "Reihenfolge D, E, F");
  assert.ok(!m.includes("WEITERE SEITEN</div>") && !m.includes("ENTWÜRFE</div>"), "alte Zwischenüberschriften stehen noch drin");
});

test("Jede Karte hat einen Lack (FARBEN) und ein Motiv, das es gibt", () => {
  const motive = quelle("funcDokumentMotive.jsx");
  for (const d of DOKUMENTE) {
    assert.ok(FARBEN.includes(d.farbe), `${d.id}: Farbe ${d.farbe}`);
    assert.ok(["tangente", "ebene"].includes(d.motiv) || new RegExp(`\\b${d.motiv}: Motiv`).test(motive), `${d.id}: Motiv ${d.motiv}`);
  }
});

test("Karte: Öffnen, Download und Pfeil; Zweck-Text erst nach dem Aufklappen", () => {
  const s = quelle("funcDokumente.jsx");
  assert.ok(s.includes("data-dokument-oeffnen") && s.includes("data-dokument-laden") && s.includes("data-dokument-mehr"));
  assert.match(s, /download=\{dateiName\(d\.datei\)\}/);
  assert.ok(s.includes("data-dokument-cover") && /download=\{dateiName\(d\.cover\)\}/.test(s) && /Cover\s*<\/a>/.test(s), "Cover-Knopf fehlt");
  assert.match(s, /\{offen && \(\s*<div className="dk-mehr"/);
});

test("Jedes PDF unter public/buecher und public/druck steht in der Liste", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const wurzel = new URL("../public/", import.meta.url);
  const pdfs = [];
  const lauf = (rel) => { for (const n of readdirSync(new URL(rel, wurzel))) { const r = rel + n; if (statSync(new URL(r, wurzel)).isDirectory()) lauf(r + "/"); else if (n.toLowerCase().endsWith(".pdf")) pdfs.push("/" + r); } };
  lauf("buecher/"); lauf("druck/");
  const eingetragen = new Set(DOKUMENTE.flatMap((d) => [d.datei, d.cover]).filter(Boolean));
  for (const p of pdfs) assert.ok(eingetragen.has(p), `${p} fehlt in DOKUMENTE`);
});

test("Öffentlich sind nur Leseproben – nie die ganzen Bücher", () => {
  const offen = DOKUMENTE.filter((d) => d.oeffentlich);
  assert.ok(offen.length >= 2, "Leseproben fehlen");
  for (const d of offen) {
    assert.ok(d.datei && d.datei.startsWith("/leseprobe/"), `${d.id}: öffentliche Datei liegt nicht unter /leseprobe/`);
    assert.ok(d.seiten && d.seiten <= 12, `${d.id}: Leseprobe zu lang`);
    assert.ok(existsSync(new URL(`../public${d.datei}`, import.meta.url)), `${d.id}: Datei fehlt`);
  }
});
