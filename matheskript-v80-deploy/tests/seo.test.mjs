/* SEO/KI-Texte der Werkzeug-Seiten (src/seo/*): Vollständigkeit, Längen, Form, Pfade für die Middleware. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WERKZEUGE } from "../src/werkzeuge.js";
import { SEO_TEXTE, SEO_SEITEN, HUB_SEITEN, HUBS, seoText, seiteHtml, hubHtml, jsonLd, hubJsonLd, verwandteVon, hubBereiche, entitaet, steckbrief, BASIS_URL } from "../src/seo/index.js";
import { SEO_PFADE, HUB_PFADE } from "../src/seo/pfade.js";
import { WZ_SLUG } from "../src/pfade.js";

const woerter = (t) => t.join(" ").split(/\s+/).filter(Boolean).length;

test("Jeder handgeschriebene Text gehört zu einem Werkzeug und hält die Form ein", () => {
  for (const [id, t] of Object.entries(SEO_TEXTE)) {
    assert.ok(WERKZEUGE[id], `${id}: kein Werkzeug mit dieser Id`);
    assert.ok(t.titel && t.titel.length <= 60, `${id}: Titel fehlt oder länger als 60 Zeichen (${t.titel && t.titel.length})`);
    assert.ok(t.beschreibung && t.beschreibung.length >= 110 && t.beschreibung.length <= 160, `${id}: Beschreibung nicht 110–160 Zeichen (${t.beschreibung && t.beschreibung.length})`);
    assert.ok(t.kurz && t.kurz.length <= 160, `${id}: kurz fehlt oder zu lang`);
    assert.ok(Array.isArray(t.text) && t.text.length >= 2 && t.text.length <= 4, `${id}: text braucht 2–4 Absätze`);
    const n = woerter(t.text);
    assert.ok(n >= 140 && n <= 270, `${id}: Text hat ${n} Wörter (soll 150–250)`);
    assert.equal(t.faq && t.faq.length, 3, `${id}: genau 3 FAQ`);
    for (const q of t.faq) assert.ok(q.f.endsWith("?") && q.a.length >= 40, `${id}: FAQ unvollständig`);
    const alles = [t.titel, t.beschreibung, t.kurz, ...t.text, ...t.faq.flatMap((q) => [q.f, q.a])].join(" ");
    assert.ok(!/:innen|\*innen|Innen\b|Schüler:in/.test(alles), `${id}: Gendersprache`);
    assert.ok(!/\$|\\frac|\\sqrt/.test(alles), `${id}: TeX im Klartext`);
  }
});

test("Jedes Werkzeug hat einen handgeschriebenen Text", () => {
  const fehlen = Object.keys(WERKZEUGE).filter((id) => !SEO_TEXTE[id]);
  assert.deepEqual(fehlen, [], `ohne Text: ${fehlen.join(", ")}`);
});

test("Alle Werkzeuge haben eine Seite, die Middleware kennt genau diese Pfade", () => {
  const seiten = SEO_SEITEN();
  assert.equal(seiten.length, Object.keys(WERKZEUGE).length);
  assert.deepEqual([...SEO_PFADE].sort(), seiten.map((s) => s.pfad).sort(), "src/seo/pfade.js veraltet: node scripts/werkzeugseiten.mjs --pfade");
});

test("Statisches HTML und JSON-LD", () => {
  const t = seoText("ableitungstrainer");
  const h = seiteHtml(t, verwandteVon("ableitungstrainer"));
  assert.ok(h.includes("<h1") && h.includes("Was kann dieses Werkzeug?") && h.includes("Häufige Fragen") && h.includes("Basti Blumenröther"));
  assert.ok(h.includes("/analysis") && h.includes("/vision"), "Hub-Link und Autor-Seite verlinkt");
  const e = entitaet(t);
  assert.ok(e.startsWith("Ableitungstrainer von Mythos Mathe ist ein kostenloses Online-Werkzeug"), e);
  assert.ok(steckbrief(t).some(([k]) => k === "Kosten") && h.includes("<dl"), "Steckbrief auf der Seite");
  const ld = JSON.parse(jsonLd(t, `${BASIS_URL}/ableitungstrainer`, { datum: "2026-10-21" }));
  assert.equal(ld[0]["@type"], "LearningResource");
  assert.equal(ld[0].dateModified, "2026-10-21");
  assert.ok(ld[0].teaches.length >= 1 && ld[0].typicalAgeRange === "16-19");
  assert.equal(ld[1]["@type"], "FAQPage");
  assert.equal(ld[1].mainEntity.length, 3);
  assert.equal(ld[2]["@type"], "BreadcrumbList");
  assert.ok(ld[0].author.award.length === 3);
});

test("Hub-Seiten: Start, Trainingszentrum, Vision, Analysis, Vektoren, Stochastik – mit Werkzeuglisten und Texten", () => {
  assert.deepEqual(HUB_SEITEN().map((h) => h.id).sort(), ["analysis", "start", "stochastik", "trainingszentrum", "vektoren", "vision"]);
  assert.deepEqual([...HUB_PFADE].sort(), HUB_SEITEN().map((h) => h.pfad || "start").sort(), "src/seo/pfade.js veraltet: node scripts/werkzeugseiten.mjs --pfade");
  const n = Object.keys(WERKZEUGE).length;
  for (const [id, h] of Object.entries(HUBS)) {
    assert.ok(h.titel.length <= 62 && h.beschreibung.length >= 110 && h.beschreibung.length <= 165, `${id}: Titel/Beschreibung (${h.titel.length}/${h.beschreibung.length})`);
    assert.ok(h.text.length >= 2 && h.faq.length === 3, id);
    const alles = [h.titel, h.beschreibung, h.kurz, ...h.text, ...h.faq.flatMap((q) => [q.f, q.a])].join(" ");
    assert.ok(!/:innen|\*innen|Schüler:in/.test(alles), `${id}: Gendersprache`);
    for (const m of alles.matchAll(/(\d+) (?:interaktive )?Werkzeuge?n?\b/g)) assert.equal(Number(m[1]), n, `${id}: Zahl der Werkzeuge veraltet (${m[1]} statt ${n})`);
  }
  const start = hubBereiche(HUBS.start);
  assert.equal(start.flatMap((b) => b.werkzeuge).length, n, "Startseite verlinkt jedes Werkzeug");
  assert.equal(hubBereiche(HUBS.analysis).length, 1);
  const html = hubHtml(HUBS.analysis, hubBereiche(HUBS.analysis));
  assert.ok(html.includes("/ableitungstrainer") && html.includes("<h1"));
  const ld = JSON.parse(hubJsonLd(HUBS.start, `${BASIS_URL}/`, []));
  assert.equal(ld[0]["@type"], "WebSite");
  assert.equal(ld[0].publisher.founder.name, "Basti Blumenröther");
  const ld2 = JSON.parse(hubJsonLd(HUBS.analysis, `${BASIS_URL}/analysis`, hubBereiche(HUBS.analysis).flatMap((b) => b.werkzeuge)));
  assert.equal(ld2[0]["@type"], "CollectionPage");
  assert.ok(ld2[0].hasPart.length >= 9);
});

test("Pfade sind Suchwörter, Titel folgen der Suchabsicht", () => {
  for (const [id, slug] of Object.entries({ lgs: "gleichungssysteme", zufall: "wahrscheinlichkeit", winkel: "vektorwinkel", groessen: "einheiten-umrechnen", zuordnungen: "dreisatz", ganzezahlen: "negative-zahlen", terme: "terme-vereinfachen", flaechen: "flaecheninhalt" })) assert.equal(WZ_SLUG[id], slug);
  for (const id of ["kurvendiskussion", "kreuzprodukt", "abstaende", "ebenevsebene", "vierfelder", "vektorgenerator"]) assert.match(SEO_TEXTE[id].titel, /Rechner/, `${id}: Rechnen-Werkzeug ohne „Rechner“ im Titel`);
  for (const [id, t] of Object.entries(SEO_TEXTE)) assert.ok(!/Visualizer|vs\. Ebene|Basics|Advanced/.test([t.titel, t.kurz, ...t.text].join(" ")), `${id}: alter Name im Text`);
});

test("Vorschaubilder: ein PNG je Werkzeug und Hub (public/og)", async () => {
  const { existsSync } = await import("node:fs");
  for (const s of SEO_SEITEN()) assert.ok(existsSync(new URL(`../public/og/${s.pfad}.png`, import.meta.url)), `public/og/${s.pfad}.png fehlt – python3 scripts/og-bilder.py`);
  for (const h of HUB_SEITEN()) assert.ok(existsSync(new URL(`../public/og/${h.pfad || "start"}.png`, import.meta.url)), `public/og/${h.pfad || "start"}.png fehlt`);
});

test("Middleware: Werkzeug-Seiten vorgerendert, noindex bis SEO_OEFFENTLICH=ja", () => {
  const m = readFileSync(new URL("../middleware.js", import.meta.url), "utf8");
  assert.ok(m.includes("SEO_PFADE") && m.includes("/werkzeug-seiten/") && m.includes("SEO_OEFFENTLICH"));
  const v = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.ok(!JSON.stringify(v.headers || []).includes("X-Robots-Tag"), "noindex steht jetzt in der Middleware (abschaltbar), nicht fest in vercel.json");
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(pkg.scripts.build.includes("scripts/werkzeugseiten.mjs"));
});
