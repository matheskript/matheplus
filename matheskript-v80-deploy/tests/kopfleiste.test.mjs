/* Kopfleiste (src/funcKopfleiste.jsx): folgt dem Modus der Startseite (dunkel/hell/mix), Besucher ohne Konto bekommen
   das Menü Vision · Mathe lernen · Mathilda AI · Blog – ab 1000 px fest in der Zeile, darunter hinter ☰ (Besuchermenü);
   Wortmarke mit Slogan wie angemeldet. Vision ist seit 21.10. eine eigene Seite (/vision), Mathe lernen springt zum Abschnitt „lernen“ der Startseite. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BESUCHER_MENUE, besucherAktiv } from "../src/kopfleiste.js";
import { START_MODI } from "../src/startModus.js";
import { SPRUENGE } from "../src/sprung.js";

const quelle = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");

test("Besuchermenü: genau die vier Punkte, in dieser Reihenfolge, mit Zielen in der App", () => {
  assert.deepEqual(BESUCHER_MENUE.map((e) => e.name), ["Vision", "Mathe lernen", "Mathilda AI", "Blog"]);
  assert.deepEqual(BESUCHER_MENUE.map((e) => e.ziel.ansicht), ["vision", "start", "analyse", "blog"]);
  assert.ok(!BESUCHER_MENUE[0].anker, "Vision ist eine eigene Seite, kein Abschnitt der Startseite");
  assert.equal(BESUCHER_MENUE[1].anker, "lernen");
  assert.equal(BESUCHER_MENUE[2].ziel.foto, "blatt");
  for (const e of BESUCHER_MENUE.filter((x) => x.anker)) {
    assert.ok(quelle("funcStartseite.jsx").includes(`id="${e.anker}"`), `Anker ${e.anker} fehlt auf der Startseite`);
  }
  assert.ok(SPRUENGE["kopfmenue-anker"] && SPRUENGE["kopfmenue-anker"].an && SPRUENGE["kopfmenue-anker"].art === "anker");
  assert.equal(besucherAktiv("blog"), "blog");
  assert.equal(besucherAktiv("vision"), "vision");
  assert.equal(besucherAktiv("analyse", "blatt"), "mathilda");
  assert.equal(besucherAktiv("start"), null);
});

test("Alle drei Modi der Startseite sind im Stil der Kopfleiste definiert; Mathilda AI mit goldenem AI", () => {
  const q = quelle("funcKopfleiste.jsx");
  for (const m of START_MODI.filter((x) => x !== "dunkel")) assert.ok(q.includes(m === "stadion" || m === "ger" ? `.kl[data-edition="${m}"]` : `.kl[data-modus="${m}"]`), m);
  assert.ok(q.includes("useKopfModus") && q.includes("EVENT_START_MODUS"));
  assert.ok(q.includes("<MathildaName dunkel={modus !== \"hell\"} />"), "Mathilda AI kommt aus mathildaName.jsx (AI in Gold)");
  assert.ok(q.includes("<MarkenLogo groesse={gast ? \"var(--kl-logo-gast)\" : \"var(--kl-logo)\"}"), "Wortmarke über CSS-Variablen: --kl-logo-gast / --kl-logo");
  assert.ok(q.includes("--kl-logo: min(40px, calc((100vw - 100px) / 10))") && q.includes("--kl-logo: clamp(40px, calc(var(--seite, 940px) * .042), 56px)"), "angemeldet: unter 1000 px so groß, wie neben dem ☰ Platz ist, darüber 40–56 px an der Seitenbreite --seite");
  assert.ok(q.includes(".kl[data-kompakt] { --kl-logo-gast: 40px; --kl-logo: 40px; }"), "zusammengezogen (56 px hoch) ist die Wortmarke immer 40 px");
  assert.ok(q.includes('BREIT_BEDARF = "var(--seite, 940px)"') && q.includes("--kopf-h:clamp(90px, calc(var(--seite, 940px) * .0935), 120px)"), "Zeile und Rand hängen an --seite");
  assert.ok(/\.kl-slogan \{[^}]*line-height: 1\.25;/.test(q), "Slogan: Zeilenhöhe 1,25 – sonst schneidet overflow hidden das g von „Erfolg“ ab");
  assert.ok(/\.kl-slogan \{[^}]*padding-bottom: \.14em; margin-bottom: -\.14em;/.test(q), "Slogan: Clip-Kasten reicht unter die Unterlängen (g, y)");
  const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  assert.ok(css.includes("--seite: 940px") && css.includes("--seite: clamp(940px, 72vw, 1360px)"), "index.css: --seite 940 px, ab 1000 px wachsend bis 1360 px");
  assert.ok(q.includes("@media ${BREIT} {\n  .kl { --kl-logo-gast") && q.includes(".kl .mx-auto.kopf-zeile.kl-zeile { width: 100% !important"), "ab 1000 px: breite Zeile für alle, nicht nur Besucher");
  assert.ok(/max-width: 839px[\s\S]*\.kl \.hm-chip \{ display: none; \}/.test(q), "Handy: kein Konto-Chip in der Kopfleiste");
  assert.ok(q.includes("--kl-logo-gast: min(40px, calc((100vw - 100px) / 10))") && q.includes("--kl-logo-gast: clamp(40px, calc(var(--seite, 940px) * .042), 56px)"), "Besucher: unter 1000 px so groß wie angemeldet, darüber voll (40–56 px)");
  assert.ok(q.includes("{gast && !schmal && (") && q.includes("data-besuchermenue") && q.includes('ziel={gast && schmal ? "besucher" : "menue"}'), "Besucher unter 1000 px: die vier Punkte hinter ☰");
  assert.ok(q.includes("data-kl-bm-alles") && q.includes('setHmOffen("menue")'), "Besuchermenü führt ins große ☰-Menü");
  assert.ok(q.includes('HELD_KANTE = "calc(50% - 434.5px)"'), "Besucher am Desktop: T der Wortmarke über dem Anfang der Schlagzeile");
  assert.ok(!q.includes("kl-modus") && !q.includes("startModusSetzen"), "Kein Modus-Knopf in der Kopfleiste");
  const hm = quelle("funcHauptmenue.jsx");
  assert.ok(hm.includes("function DarstellungWahl") && hm.includes("data-hm-darstellung") && hm.includes("START_MODI.map"), "Darstellung dunkel/hell/mix im ☰-Menü");
  assert.ok(hm.indexOf("<DarstellungWahl />") > hm.indexOf("data-hm-zugang"), "Darstellung steht ganz unten, nach Anmelden/Abmelden");
  const st = quelle("funcStartseite.jsx");
  assert.ok(!st.includes("28px 28px") && !st.includes('className="sbb-raster"'), "Startseite ohne Karo-Raster");
  assert.ok(!/aria-expanded/.test(q.split("kl-nav")[1].split("</nav>")[0]), "Das Besuchermenü klappt nicht aus");
  assert.ok(q.includes("kl-fortschritt") && q.includes("data-kompakt"), "Lese-Fortschritt und Zusammenziehen beim Scrollen");
  assert.ok(!/background-size:\s*\d+px \d+px/.test(q) && !q.includes("kl-raster"), "Kein Karoraster im Header (passt nicht zur Marke)");
  assert.ok(q.includes("klLeiser") && q.includes("--kl-kurve-ruhe") && q.includes("mask-image"), "Kurve wird nach dem Einzeichnen leiser und läuft links aus");
});

test("func10.jsx benutzt die Kopfleiste statt einer eigenen Kopfzeile", () => {
  const q = quelle("func10.jsx");
  assert.ok(q.includes('import { Kopfleiste } from "./funcKopfleiste.jsx";'));
  assert.ok(q.includes("<Kopfleiste ansicht={ansicht} gehe={gehe}"));
  assert.ok(!q.includes("<div data-kopfleiste"), "Die alte Kopfzeile ist raus");
});
