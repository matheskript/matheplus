/* Startseite dunkel / hell (src/startModus.js): Pfade /start-hell und /start-dunkel (und Aliasse) wählen den Modus;
   ohne Wahl gilt mix (seit 21.10.). Die Startseite (funcStartseite.jsx) kennt beide Modi und führt zu allen Angeboten – in sieben Blöcken
   (Band · Bühne · Heute · Lernen · Mathilda · Kurse · Entdecken · Vision-Anriss), Gesperrtes nur hinter ZEIGE_GESPERRTE. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { START_MODI, basisModus, editionVon, modusAusPfad, naechsterModus, startModus } from "../src/startModus.js";
import { START_ANKER } from "../src/startMenues.js";
import { KURSE, WEITERE_ANGEBOTE } from "../src/hauptmenue.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");

test("Pfade /start-hell und /start-dunkel (auch startseite-, frontpage-) wählen den Modus", () => {
  assert.equal(modusAusPfad("/start-hell"), "hell");
  assert.equal(modusAusPfad("/start-dunkel/"), "dunkel");
  assert.equal(modusAusPfad("/Startseite-Hell?x=1"), "hell");
  assert.equal(modusAusPfad("/frontpage-dunkel#oben"), "dunkel");
  assert.equal(modusAusPfad("/"), null);
  assert.equal(modusAusPfad("/start-mix"), "mix");
  assert.equal(modusAusPfad("/start-b"), null);
  assert.equal(modusAusPfad("/elternabend"), null);
  assert.equal(modusAusPfad("/start-stadion"), "stadion");
  assert.equal(modusAusPfad("/start-fcb"), "stadion");
  assert.equal(modusAusPfad("/start-ger"), "ger");
  assert.equal(modusAusPfad("/start-deutschland"), "ger");
  assert.deepEqual(START_MODI, ["dunkel", "hell", "mix", "stadion", "ger"]);
  assert.equal(naechsterModus("dunkel"), "hell");
  assert.equal(naechsterModus("hell"), "mix");
  assert.equal(naechsterModus("mix"), "stadion");
  assert.equal(naechsterModus("stadion"), "ger");
  assert.equal(naechsterModus("ger"), "dunkel");
});

test("Ohne Browser-Speicher gilt der Mix-Modus", () => {
  assert.equal(startModus(), "mix");
});

test("Die Startseite führt zu allen Angeboten – über sieben Blöcke und das Band", () => {
  const q = quelle("funcStartseite.jsx");
  /* Direkt im Code: Abi, Pen & Paper, Mathilda, Vision, Blog, /kurse, Elternabend (nach Passwort); die Kurse kommen aus KURSE (hauptmenue.js) */
  for (const z of ["penpaperkurs", "abi", "elternabend", "vision", "blog", "kursliste"]) assert.ok(q.includes(`ansicht: "${z}"`), `Startseite kennt das Ziel „${z}“ nicht`);
  for (const z of ["penpaperkurs", "unterstufe", "geokurs", "diffkurs", "vekkurs", "gfs", "kiwahl"]) assert.ok(KURSE.some((k) => k.ziel.ansicht === z), `KURSE ohne „${z}“`);
  for (const z of ["gleichkurs", "headnumbers", "efunktion", "elternkurs"]) assert.ok(WEITERE_ANGEBOTE.some((k) => k.ziel.ansicht === z), `WEITERE_ANGEBOTE ohne „${z}“`);
  for (const b of ["<Quickfinder", "<SuchBox", "<StartKarte", "<UnterMenue", "<SchulKachel", "<EtikettKnoepfe", "ENTDECKEN_MENUE", "<AppAnleitung", "<SpendenBereich", "<StartBand", "<MathildaBlock", "<KursRaster", "<BlogAnriss", "KI_MENUE"]) {
    assert.ok(q.includes(b), `Startseite ohne ${b}`);
  }
  /* Band: fünf Anker, jeder ein Abschnitt der Seite; Besuchermenü „Mathe lernen“ zielt auf „lernen“ */
  assert.deepEqual(START_ANKER.map((a) => a.id), ["heute", "lernen", "mathilda", "kurse", "entdecken"]);
  for (const a of START_ANKER) assert.ok(q.includes(`id="${a.id}"`), `Anker ${a.id} fehlt`);
  assert.ok(q.includes('springe("start-anker"'), "Band springt nicht über den Sprung-Schalter");
  /* Gesperrtes nie auf der Startseite: Ebbinghaus, Videokurse, Mathe checken, Masterclass-Kachel, Mythen-Schloss nur hinter ZEIGE_GESPERRTE bzw. weg */
  for (const z of ["ebbinghaus", "kurse", "mathecheck"]) {
    const i = q.indexOf(`ansicht: "${z}"`);
    assert.ok(i > 0 && q.lastIndexOf("ZEIGE_GESPERRTE && (", i) > q.lastIndexOf("</section>", i), `„${z}“ steht nicht hinter ZEIGE_GESPERRTE`);
  }
  assert.ok(!q.includes("<Mythen") && !q.includes("<PasswortFeld") && !q.includes("<Band />"), "Mythen-Schloss oder Laufband sind zurück");
  /* Mathilda genau einmal als Block, die Masterclass-Kachel nur für die Oberstufe */
  assert.equal((q.match(/<MathildaBlock /g) || []).length, 1);
  assert.ok(/\{oberstufe && <div className="sbb-wieder"><AbiZentrumKachel/.test(q), "Masterclass-Kachel hängt nicht an der Oberstufe");
});

test("Start-Karte: ein Einstieg statt drei Boxen, Klasse nur einmal gefragt", () => {
  const q = quelle("funcStartseite.jsx");
  /* Zwei Stellen, nie beide zugleich: ab 1100 px in der Bühne, darunter unter Zone 1 */
  assert.equal((q.match(/<StartKarte /g) || []).length, 2, "Start-Karte an zwei Stellen (Bühne breit / Zone 1 schmal)");
  assert.ok(/\{breit && \(\s*<div className="sbb-held-karte">/.test(q) && q.includes("{breit ? (klasse ?"), "Start-Karte hängt nicht an der Breite");
  for (const alt of ["<MeinTrainingKachel", "<StartOnboarding", "Dein Training startet hier.</h2>", "sbb-einleitung"]) assert.ok(!q.includes(alt), `Startseite enthält noch ${alt}`);
  const k = quelle("funcStartKarte.jsx");
  for (const b of ["<HeuteKarte", "<WeitermachenZeile", "<KontoZeile", "<FuerDich", "In welcher Klasse bist du?", "data-testkonto"]) assert.ok(k.includes(b), `Start-Karte ohne ${b}`);
  /* Die Klassenwahl schreibt Quickfinder UND Onboarding – sonst fragt einer von beiden noch einmal */
  assert.ok(/function klasseSpeichern[\s\S]*Q_SCHLUESSEL[\s\S]*O_SCHLUESSEL/.test(k), "klasseSpeichern schreibt nicht beide Speicher");
  assert.ok(!quelle("funcOnboarding.jsx").includes("Schüler:in"), "Gendersprache im Onboarding");
});

test("Bühne: Suche als Pille statt Knopf „Jetzt eine Aufgabe rechnen“, keine zweite Suchbox", () => {
  const q = quelle("funcStartseite.jsx");
  assert.ok(q.includes("<SuchBox gehe={gehe} buehne />"), "Suche fehlt in der Bühne");
  assert.equal((q.match(/<SuchBox /g) || []).length, 1, "Suche steht mehr als einmal auf der Startseite");
  assert.ok(!q.includes("sbb-start-knopf") && !q.includes('ansicht: "ki"'), "Knopf „Jetzt eine Aufgabe rechnen“ ist zurück");
  /* Seit 21.10. abends: keine Haken-Liste, dafür der Goldknopf „Pen & Paper starten · kostenlos“ – nur ohne bekannte Klasse */
  assert.ok(!q.includes('"Mathe sichtbar machen"') && !q.includes("<Haken />"), "Haken-Liste ist zurück");
  assert.ok(/\{!klasse && \(\s*<button type="button" className="sbb-los gold held"/.test(q), "Goldknopf fehlt oder hängt nicht an der Klasse");
  const s = quelle("funcSuche.jsx");
  assert.ok(s.includes("data-such-buehne") && s.includes("--such-hg"), "Bühnen-Variante der Suche fehlt");
});

test("Alle drei Modi sind im Stil definiert, die Wahl hängt am Wurzelelement und am Dokument", () => {
  const q = quelle("funcStartseite.jsx");
  assert.ok(q.includes('.sbb[data-modus="hell"]') && q.includes('.sbb[data-modus="mix"]'));
  assert.ok(q.includes('html[data-start-modus="dunkel"]') && q.includes('html[data-start-modus="hell"]') && q.includes('html[data-start-modus="mix"]'));
  /* Mix: Inseln und Streifen tragen ihre Klassen */
  assert.ok(q.includes('.sbb[data-modus="mix"] .sbb-insel'), "Inseln ohne dunklen Variablensatz");
  assert.ok((q.match(/sbb-streifen sbb-insel/g) || []).length >= 2, "weniger als zwei dunkle Streifen");
  assert.ok(q.includes('["sbb-held", "sbb-insel",'), "Bühne ist keine Insel");
  assert.ok(q.includes('data-modus={basisModus(modus)} data-edition={editionVon(modus)}'));
  const r = quelle("func10.jsx");
  /* Die Pille steht seit 21.10. abends nicht mehr auf der Startseite: Darstellung nur im ☰-Menü und im Arbeitsmenü */
  assert.ok(!r.includes("<StartModusSchalter />"), "Pille steht wieder auf der Startseite");
  assert.ok(quelle("funcHauptmenue.jsx").includes("Darstellung"), "☰-Menü ohne Darstellung");
  assert.ok(r.includes("modusAusPfad("));
  const m = quelle("funcArbeitsmenue.jsx");
  assert.ok(m.includes("data-arbeitsmenue-modus"), "Umschalter im Arbeitsmenü fehlt");
});

test("Stadion: Rot-Weiß-Blau auf Mix-Basis, ohne Vereinslogo und -namen", () => {
  assert.equal(basisModus("stadion"), "mix");
  assert.equal(editionVon("stadion"), "stadion");
  assert.equal(editionVon("mix"), undefined);
  const q = quelle("funcStartseite.jsx");
  assert.ok(q.includes('.sbb[data-edition="stadion"] .sbb-held'), "Bühne ohne Stadion-Farben");
  assert.ok(q.includes('startModusSetzen("stadion")'), "Pille ohne Stadion-Knopf");
  assert.ok(quelle("funcKopfleiste.jsx").includes('.kl[data-edition="stadion"]'), "Kopfleiste ohne Stadion-Farben");
  for (const f of ["funcStartseite.jsx", "funcKopfleiste.jsx", "hauptmenueTeile.jsx"]) assert.ok(!/bayern/i.test(quelle(f)), `${f} nennt einen Verein`);
});

test("Stadion ohne Gold: Gold wird zur Variable mit altem Gold als Rückfall, Mathilda bleibt golden", async () => {
  const { istGold, goldErsetzen, deklarationenUmfaerben, nurSchimmer, STADION_VARIABLEN } = await import("../src/stadionGold.js");
  assert.ok(istGold(237, 187, 0) && istGold(138, 106, 0) && istGold(255, 229, 138));
  assert.ok(!istGold(220, 5, 45) && !istGold(0, 102, 178) && !istGold(255, 255, 255) && !istGold(255, 247, 214));
  assert.equal(goldErsetzen("rgb(237, 187, 0)"), "var(--st-gold, rgb(237, 187, 0))");
  assert.equal(goldErsetzen("#EDBB00", "flaeche"), "var(--st-flaeche, #EDBB00)");
  assert.match(goldErsetzen("rgba(237, 187, 0, 0.4)"), /color-mix\(in srgb, var\(--st-gold, rgb\(237, 187, 0\)\) 40%, transparent\)/);
  assert.equal(goldErsetzen("rgb(220, 5, 45)"), "rgb(220, 5, 45)");
  const d = deklarationenUmfaerben([["background-color", "rgb(237, 187, 0)", ""], ["color", "#050B1F", ""]]);
  assert.equal(d[1][1], "var(--st-auf-flaeche, #050B1F)", "dunkler Text auf goldener Fläche wird lesbar");
  assert.ok(nurSchimmer("radial-gradient(rgba(237, 187, 0, 0.1), rgba(237, 187, 0, 0))") && !nurSchimmer("linear-gradient(rgb(237, 187, 0), rgb(201, 147, 26))"));
  assert.ok(STADION_VARIABLEN.includes("[data-gold-bleibt]"));
  assert.ok(quelle("mathildaName.jsx").includes("data-gold-bleibt") && quelle("mathildaBild.jsx").includes("data-gold-bleibt"), "Mathildas Name und Haare bleiben golden");
  assert.ok(quelle("markenLogo.jsx").includes('className="marke-mathe"'));
  assert.ok(quelle("main.jsx").includes("stadionGoldStarten("));
});

test("GER: Schwarz-Rot-Gold auf Mix-Basis, Knopf GER, FCB heißt nur anders", () => {
  assert.equal(basisModus("ger"), "mix");
  assert.equal(editionVon("ger"), "ger");
  const q = quelle("funcStartseite.jsx");
  assert.ok(q.includes('.sbb[data-edition="ger"] .sbb-held') && q.includes('startModusSetzen("ger")') && q.includes("<GerZeichen />GER") && q.includes("<StadionZeichen />FCB"));
  const k = quelle("funcKopfleiste.jsx");
  assert.ok(k.includes('.kl[data-edition="ger"]') && k.includes('html[data-start-edition="ger"] .seiten-fuss'), "Kopf- und Fußzeile ohne GER-Farben");
  assert.ok(quelle("hauptmenueTeile.jsx").includes('ger: "GER"'));
});

test("GER: Marken-Blau wird zur Variable (Schwarz nur in der App-Hülle), Hellblau bleibt", async () => {
  const { istBlau, goldErsetzen, STADION_VARIABLEN } = await import("../src/stadionGold.js");
  assert.ok(istBlau(0, 77, 152) && istBlau(11, 42, 99) && !istBlau(191, 214, 245) && !istBlau(5, 11, 31) && !istBlau(237, 187, 0));
  assert.equal(goldErsetzen("#004D98"), "var(--gb-blau, #004D98)");
  assert.equal(goldErsetzen("#004D98", "flaeche"), "var(--gb-flaeche, #004D98)");
  assert.ok(STADION_VARIABLEN.includes('[data-start-edition="ger"] :is(.sbb, .kl'));
  assert.ok(quelle("main.jsx").includes('["stadion", "ger"].includes(startModus())'));
});
