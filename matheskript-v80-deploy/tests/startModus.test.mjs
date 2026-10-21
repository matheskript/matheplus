/* Startseite dunkel / hell (src/startModus.js): Pfade /start-hell und /start-dunkel (und Aliasse) wählen den Modus;
   ohne Wahl gilt mix (seit 21.10.). Die Startseite (funcStartseite.jsx) kennt beide Modi und führt zu allen Angeboten (Mein Mathe-Training ganz oben). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { START_MODI, basisModus, editionVon, modusAusPfad, naechsterModus, startModus } from "../src/startModus.js";

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
  assert.deepEqual(START_MODI, ["dunkel", "hell", "mix", "stadion"]);
  assert.equal(naechsterModus("dunkel"), "hell");
  assert.equal(naechsterModus("hell"), "mix");
  assert.equal(naechsterModus("mix"), "stadion");
  assert.equal(naechsterModus("stadion"), "dunkel");
});

test("Ohne Browser-Speicher gilt der Mix-Modus", () => {
  assert.equal(startModus(), "mix");
});

test("Die Startseite führt zu allen Angeboten", () => {
  const q = quelle("funcStartseite.jsx");
  /* „ki“ (Mathilda-Chat) hing am Knopf „Jetzt eine Aufgabe rechnen“ – der ist seit 21.10. aus der Bühne raus; Mathilda bleibt über die Kachel („analyse“) */
  for (const z of ["headnumbers", "gleichkurs", "ebbinghaus", "analyse", "penpaperkurs", "elternkurs", "kurse", "diffkurs", "vekkurs", "gfs", "kiwahl", "efunktion", "mckurs", "elternabend"]) {
    assert.ok(q.includes(`ansicht: "${z}"`), `Startseite kennt das Ziel „${z}“ nicht`);
  }
  for (const b of ["<Quickfinder", "<SuchBox", "<StartOnboarding", "<WeitermachenZeile", "<UnterMenue", "<SchulKachel", "<EtikettKnoepfe", "ENTDECKEN_MENUE", "MYTHEN", "<MeinTrainingKachel", "<AppAnleitung", "<SpendenBereich"]) {
    assert.ok(q.includes(b), `Startseite ohne ${b}`);
  }
});

test("Bühne: Suche als Pille statt Knopf „Jetzt eine Aufgabe rechnen“, keine zweite Suchbox", () => {
  const q = quelle("funcStartseite.jsx");
  assert.ok(q.includes("<SuchBox gehe={gehe} buehne />"), "Suche fehlt in der Bühne");
  assert.equal((q.match(/<SuchBox /g) || []).length, 1, "Suche steht mehr als einmal auf der Startseite");
  assert.ok(!q.includes("sbb-start-knopf") && !q.includes('ansicht: "ki"'), "Knopf „Jetzt eine Aufgabe rechnen“ ist zurück");
  assert.ok(q.includes('"Mathe sichtbar machen"'));
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
  assert.ok(q.includes('className="sbb-held sbb-insel"'), "Bühne ist keine Insel");
  assert.ok(q.includes('data-modus={basisModus(modus)} data-edition={editionVon(modus)}'));
  const r = quelle("func10.jsx");
  assert.ok(r.includes("<StartModusSchalter />"), "Pille zum Umschalten fehlt");
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
