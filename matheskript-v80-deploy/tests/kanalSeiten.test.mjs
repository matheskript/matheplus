/* Kanal-Landingpages (src/kanalSeiten.js): fünf Seiten, StorySkript vollständig, Anrede konsistent, Pfade und Schalter stimmen */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { KANAL_SEITEN, SERIE, KANAL_ANSICHT, kanalSeite, viaNormal, preisText, PREISE_ANZEIGEN } from "../src/kanalSeiten.js";
import { SEITEN, pfadAufloesen, pfadFuer } from "../src/pfade.js";
import { ANGEBOT, ANSICHTEN_JE_ANGEBOT, ansichtErlaubt } from "../src/angebot.js";

/* alle Textwerte einer Seite (ohne Schlüsselnamen wie "du") */
const text = (o) => (typeof o === "string" ? o : Array.isArray(o) ? o.map(text).join(" ") : o && typeof o === "object" ? Object.values(o).map(text).join(" ") : "");

test("fünf Seiten: drei für Schüler (du), zwei für Eltern (Sie)", () => {
  assert.equal(KANAL_SEITEN.length, 5);
  assert.deepEqual(KANAL_SEITEN.map((s) => s.id), ["poster", "thema", "insta", "eltern", "abi-eltern"]);
  assert.equal(KANAL_SEITEN.filter((s) => s.zielgruppe === "schueler").length, 3);
  for (const s of KANAL_SEITEN) assert.equal(s.du, s.zielgruppe === "schueler", s.id);
  assert.equal(new Set(KANAL_SEITEN.map((s) => s.einstieg)).size, 5, "jede Seite hat einen eigenen Einstieg");
});

test("StorySkript: jede Seite hat alle 15 Unterpunkte", () => {
  for (const s of KANAL_SEITEN) {
    assert.ok(s.held.identitaet && s.held.wunsch && s.held.einsatz, `${s.id}: Held`);
    assert.equal(s.problem.ebenen.length, 3, `${s.id}: drei Ebenen`);
    assert.ok(s.problem.ebenen[2].gegner && !s.problem.ebenen[0].gegner && !s.problem.ebenen[1].gegner, `${s.id}: die dritte Ebene ist der Gegner`);
    assert.equal(s.mentor.belege.length, 3, `${s.id}: drei Belege`);
    assert.ok(s.mentor.haltung, `${s.id}: Haltung`);
    assert.equal(s.plan.schritte.length, 3, `${s.id}: 3-Schritte-Plan`);
    assert.equal(s.plan.versprechen.length, 3, `${s.id}: drei Versprechen`);
    assert.ok(s.angebote.karten.length >= 1 && s.angebote.karten.length <= 2, `${s.id}: ein bis zwei Angebotskarten`);
    assert.equal(s.angebote.karten.filter((k) => k.hervor).length, 1, `${s.id}: genau eine hervorgehobene Karte`);
    assert.equal(s.wege.erfolg.length, 3); assert.equal(s.wege.scheitern.length, 3);
    assert.ok(s.knopfDirekt && s.knopfUnter && s.knopfUebergang.text && s.knopfUebergang.ziel.ansicht, `${s.id}: direkter und Übergangs-Knopf`);
    assert.ok(s.fragen.length >= 4, `${s.id}: Fragen`);
    assert.ok(s.h1.length === 2 && s.abschluss.h2.length >= 1, `${s.id}: Schlagzeilen`);
    for (const k of s.angebote.karten) assert.ok(k.aktion || (k.ziel && k.ziel.ansicht), `${s.id}: Karte ${k.name} hat ein Ziel`);
  }
});

test("Anrede: Schüler-Seiten duzen, Eltern-Seiten siezen – keine Gendersprache", () => {
  for (const s of KANAL_SEITEN) {
    const t = text(s);
    assert.ok(!/\w+:innen|\w+\*innen|\w+_innen|SchülerInnen/.test(t), `${s.id}: keine Gendersprache`);
    if (s.du) assert.ok(!/\bSie\b|\bIhr Kind\b|\bIhnen\b/.test(t.replace(/Sie sind angemeldet/g, "")), `${s.id}: duzt`);
    else {
      assert.ok(/\bSie\b/.test(t) && /\bIhr Kind\b/.test(t), `${s.id}: siezt`);
      assert.ok(!/\bdu\b|\bdeine?\b|\bdir\b|\bdich\b/.test(t.replace(/„[^“]*“/g, "")), `${s.id}: kein du außerhalb von Zitaten`);
    }
  }
});

test("Schüler-Seiten haben eine Eltern-Weiche, Eltern-Seiten keine", () => {
  for (const s of KANAL_SEITEN) assert.equal(!!s.elternWeiche, s.du, s.id);
  for (const s of KANAL_SEITEN.filter((x) => x.elternWeiche)) assert.ok(s.elternWeiche.nachricht.endsWith(" "), `${s.id}: Nachricht endet vor der Adresse mit Leerzeichen`);
});

test("Headline nennt nie den Produktnamen", () => {
  for (const s of KANAL_SEITEN) assert.ok(!/Masterclass|Mathe checken|Plus\b|Themenkurs/.test(s.h1.join("")), `${s.id}: ${s.h1.join("")}`);
});

test("Pfade: jede Seite hat ihren Direktlink mit Ansicht kanal, hin und zurück", () => {
  for (const s of KANAL_SEITEN) {
    const e = SEITEN.find((x) => x.ansicht === KANAL_ANSICHT && x.seite === s.id);
    assert.ok(e, `${s.id}: Eintrag in pfade.js`);
    assert.equal(e.pfad, s.pfad);
    assert.deepEqual(e.alias, s.alias, `${s.id}: Aliasse gleich`);
    assert.deepEqual(pfadAufloesen("/" + s.pfad), { ansicht: KANAL_ANSICHT, seite: s.id, kanonisch: true });
    for (const a of s.alias) assert.equal(pfadAufloesen("/" + a).seite, s.id, `${s.id}: Alias ${a}`);
    assert.equal(pfadFuer({ ansicht: KANAL_ANSICHT, seite: s.id }), "/" + s.pfad);
  }
  assert.equal(kanalSeite("gibt-es-nicht"), null);
});

test("Schalter: Kanalseiten sind aus, mit Passwort offen", () => {
  assert.equal(ANGEBOT.kanalseiten, false);
  assert.deepEqual(ANSICHTEN_JE_ANGEBOT.kanalseiten, [KANAL_ANSICHT]);
  assert.equal(ansichtErlaubt(KANAL_ANSICHT), "start");
  assert.equal(ansichtErlaubt(KANAL_ANSICHT, true), KANAL_ANSICHT);
});

test("Preise bleiben verborgen, bis sie bestätigt sind", () => {
  assert.equal(PREISE_ANZEIGEN, false);
  assert.equal(preisText("masterclass"), "");
  assert.equal(preisText("masterclass", true), "2.497 €");
  const q = readFileSync(new URL("../src/kanalSeiten.js", import.meta.url), "utf8");
  for (const s of KANAL_SEITEN) assert.ok(!/\d+(\.\d{3})?,?\d* ?€/.test(text({ ...s, angebote: { ...s.angebote, karten: s.angebote.karten.map((k) => ({ ...k, preis: null })) } })), `${s.id}: kein Preis im Fließtext`);
  assert.ok(/NICHT bestätigt/.test(q));
});

test("7-Tage-Serie: sieben Tage, jeder mit Übung und Ziel in der App", () => {
  assert.equal(SERIE.length, 7);
  assert.deepEqual(SERIE.map((t) => t.tag), [1, 2, 3, 4, 5, 6, 7]);
  const ansichten = new Set(SEITEN.map((s) => s.ansicht));
  for (const t of SERIE) {
    assert.ok(t.mythos && t.kurz && t.uebung && t.knopf, `Tag ${t.tag}`);
    assert.ok(t.ziel && t.ziel.ansicht, `Tag ${t.tag}: Ziel`);
    assert.ok(ansichten.has(t.ziel.ansicht) || ["analyse", "gleichungen", "headnumbers", "ebbinghaus"].includes(t.ziel.ansicht), `Tag ${t.tag}: Ansicht ${t.ziel.ansicht} existiert`);
  }
});

test("Kanal-Kennung: nur Kleinbuchstaben, Ziffern, Bindestrich, höchstens 40 Zeichen", () => {
  assert.equal(viaNormal("Poster-GYM1 "), "poster-gym1");
  assert.equal(viaNormal("<script>"), "script");
  assert.equal(viaNormal(""), null);
  assert.equal(viaNormal("x".repeat(80)).length, 40);
});
