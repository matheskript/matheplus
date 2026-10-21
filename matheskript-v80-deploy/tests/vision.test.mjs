/* Vision-Seite (src/funcVision.jsx, Daten src/vision.js): eigene Seite /vision, Menüpunkt „Vision“ im Besuchermenü.
   Aufbau nach dem Blockbuster-StorySkript (Held → Problem → Mentor → Lösung → Reise), am Ende die Angebote mit
   Pen & Paper als direktem, kostenlosem Einstieg. Grafiken mathematisch exakt, keine Karos, nichts Erfundenes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VISION_KAPITEL, VISION_ZIELE, TANGENTE, tangente, zahlDe, VERGESSEN, behalten } from "../src/vision.js";
import { pfadAufloesen, pfadFuer } from "../src/pfade.js";
import { KEIN_TEILEN } from "../src/teilen.js";
import { SPRUENGE } from "../src/sprung.js";
import { BESUCHER_MENUE, besucherAktiv } from "../src/kopfleiste.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");
const seite = quelle("funcVision.jsx");

test("Pfad /vision, Menüpunkt Vision führt dorthin und ist dort markiert", () => {
  assert.deepEqual(pfadAufloesen("/vision"), { ansicht: "vision", kanonisch: true });
  assert.equal(pfadAufloesen("/unsere-vision").ansicht, "vision");
  assert.equal(pfadFuer({ ansicht: "vision" }), "/vision");
  const v = BESUCHER_MENUE.find((e) => e.id === "vision");
  assert.deepEqual(v.ziel, { ansicht: "vision" });
  assert.equal(besucherAktiv("vision"), "vision");
  assert.ok(KEIN_TEILEN.includes("vision"), "Vision-Seite ohne Teilen-Knopf (wie Blog und Landingpage)");
  const f10 = quelle("func10.jsx");
  assert.ok(f10.includes('import("./funcVision.jsx")') && f10.includes('ansicht === "vision"') && f10.includes("<VisionSeite gehe={gehe} />"));
});

test("Kapitel: sieben Stück, eindeutig, nummeriert, jedes als Abschnitt auf der Seite – in der Reihenfolge des StorySkripts", () => {
  assert.equal(VISION_KAPITEL.length, 7);
  assert.equal(new Set(VISION_KAPITEL.map((k) => k.id)).size, 7);
  VISION_KAPITEL.forEach((k, i) => assert.equal(k.nr, String(i + 1).padStart(2, "0")));
  const reihe = ["vision-start", ...VISION_KAPITEL.map((k) => k.id)];
  const stellen = reihe.map((id) => seite.indexOf(`id="${id}"`));
  stellen.forEach((s, i) => assert.ok(s > 0, `Abschnitt ${reihe[i]} fehlt`));
  for (let i = 1; i < stellen.length; i++) assert.ok(stellen[i] > stellen[i - 1], `${reihe[i]} steht vor ${reihe[i - 1]}`);
  for (const id of ["schritt-verstehen", "schritt-aufschreiben", "schritt-trainieren"]) {
    const s = seite.indexOf(`id="${id}"`);
    assert.ok(s > seite.indexOf('id="kapitel-plan"') && s < seite.indexOf('id="kapitel-haltung"'), `${id} gehört zu 03 Der Plan`);
  }
});

test("Angebote erst am Ende (aus der Vision heraus), Pen & Paper zuerst und als direkter Knopf", () => {
  const start = seite.indexOf('id="kapitel-start"');
  const angebote = [...seite.matchAll(/data-vision-angebot="([a-z]+)"/g)];
  assert.ok(angebote.length >= 5);
  for (const a of angebote) assert.ok(a.index > start, `Angebot ${a[1]} steht vor Kapitel 07`);
  assert.equal(angebote[0][1], "penpaper", "Pen & Paper ist das erste Angebot");
  assert.deepEqual(VISION_ZIELE.penpaper, { ansicht: "penpaperkurs" });
  assert.equal(pfadFuer(VISION_ZIELE.penpaper) !== null, true);
  for (const [k, z] of Object.entries(VISION_ZIELE)) assert.ok(pfadFuer(z), `Ziel ${k} hat keinen Pfad`);
  /* direkter Knopf: Bühne, Angebot, Abschluss, Handy-Leiste */
  assert.ok((seite.match(/onClick=\{penPaper\}/g) || []).length >= 4);
  assert.ok(seite.includes("data-vision-direkt") && seite.includes("data-vision-leiste"));
  /* Mathe-Abi-Masterclass = Abi-Zentrum (frei); der bezahlte Kursbereich liegt im Zentrum hinter ANGEBOT.kurse bzw. Passwort */
  assert.ok(seite.includes("<AbiZentrumKachel") && !seite.includes("mckurs"));
  assert.ok(!/Erstgespräch|€/.test(seite), "Kein Coaching-Verkauf und keine Preise auf der Vision-Seite");
});

test("Sprünge nur über den Sprung-Schalter, Schlüssel vision-kapitel ist eingetragen", () => {
  assert.ok(SPRUENGE["vision-kapitel"] && SPRUENGE["vision-kapitel"].an && SPRUENGE["vision-kapitel"].art === "anker");
  assert.ok(seite.includes('springeZuId("vision-kapitel", id)'));
  assert.ok(!/scrollTo|scrollIntoView|scrollBy/.test(seite));
});

test("Marke: keine Karos, generisches Maskulinum, Mathilda AI über die Wortmarke", () => {
  assert.ok(!/background-size:\s*\d+px \d+px/.test(seite) && !/repeating-linear-gradient/.test(seite), "Kein Karomuster");
  assert.ok(!/[a-zäöü](\*|:|_)innen\b|[a-zäöü]Innen\b/.test(seite), "Keine Gendersprache");
  assert.ok(!/Mathilda ?AI/.test(seite.replace(/\/\*[\s\S]*?\*\//g, "").replace(/aria-label="[^"]*"/g, "")), "Mathilda AI immer als <MathildaName />");
  assert.ok(seite.includes("<MathildaName dunkel />"));
});

test("Tangente: berührt den Graphen, Steigung = f′(x₀), waagrecht genau im Hoch- und Tiefpunkt", () => {
  const { f, fs } = TANGENTE;
  const r2 = Math.SQRT2;
  assert.ok(Math.abs(fs(r2)) < 1e-12 && Math.abs(fs(-r2)) < 1e-12);
  assert.ok(Math.abs(f(r2) + r2) < 1e-12 && Math.abs(f(-r2) - r2) < 1e-12);
  for (let x0 = -3; x0 <= 3; x0 += 0.25) {
    assert.ok(Math.abs(tangente(x0, x0) - f(x0)) < 1e-12, "Tangente geht durch den Punkt");
    const h = 1e-6;
    const sek = (f(x0 + h) - f(x0 - h)) / (2 * h);
    assert.ok(Math.abs(sek - fs(x0)) < 1e-6, `f′(${x0})`);
    /* Abstand Graph – Tangente wächst quadratisch (Berühren, nicht Schneiden) */
    const d1 = Math.abs(f(x0 + 0.01) - tangente(x0, x0 + 0.01));
    const d2 = Math.abs(f(x0 + 0.02) - tangente(x0, x0 + 0.02));
    if (Math.abs(x0) > 0.05) assert.ok(d2 / d1 > 3.5 && d2 / d1 < 4.5, `Berührordnung bei ${x0}`);
  }
  /* Graph passt in den Bildausschnitt (gezeichnet wird von −3,25 bis 3,25) */
  assert.ok(Math.abs(f(3.25)) < TANGENTE.yMax && Math.abs(f(-3.25)) < TANGENTE.yMax);
  assert.ok(new RegExp("const x = -3\\.25 \\+ \\(6\\.5 \\* i\\)").test(seite));
});

test("Zahlen auf Deutsch: Komma, echtes Minus, keine −0,00", () => {
  assert.equal(zahlDe(-0.75), "−0,75");
  assert.equal(zahlDe(2.125), "2,13");
  assert.equal(zahlDe(-0.001), "0,00");
  assert.equal(zahlDe(0), "0,00");
});

test("Vergessenskurve: startet bei 1, springt bei jeder Wiederholung auf 1, wird danach langsamer", () => {
  assert.equal(behalten(0), 1);
  const { wiederholungen: w, stabil: s } = VERGESSEN;
  for (let i = 1; i < s.length; i++) assert.ok(s[i] > s[i - 1], "Stabilität wächst");
  for (const t of w) {
    assert.ok(behalten(t - 1e-9) < 1 && Math.abs(behalten(t) - 1) < 1e-12, `Wiederholung bei Tag ${t}`);
  }
  for (let t = 2.5; t <= VERGESSEN.tage; t += 0.5) assert.ok(behalten(t) > behalten(t, false), `mit > ohne bei ${t}`);
  /* Die Tiefpunkte vor den Wiederholungen steigen: Wissen setzt sich */
  const tief = w.map((t) => behalten(t - 1e-9));
  for (let i = 1; i < tief.length; i++) assert.ok(tief[i] > tief[i - 1]);
  assert.ok(behalten(VERGESSEN.tage, false) < 0.001);
});
