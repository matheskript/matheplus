import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INDEX, suche, falte, passt, ALLE_OPTIONEN, BEISPIELE } from "../src/suche.js";
import { FS_NACH_ID } from "../src/fsIndex.js";

const titel = (r) => (r.gruppen || []).flatMap((g) => [...g.eintraege, ...g.mehr]).map((x) => x.titel);
const hat = (r, teil) => titel(r).some((t) => falte(t).includes(falte(teil)));
const erste = (r) => r.gruppen?.[0]?.id;

/* alle Ansichten, die func10.jsx kennt – ein Ziel darf nirgends ins Leere laufen */
const quelle = readFileSync(new URL("../src/func10.jsx", import.meta.url), "utf8");
const ANSICHTEN = new Set([...quelle.matchAll(/ansicht === "([a-z0-9-]+)"/g)].map((m) => m[1]));

test("Index: eindeutige Kennungen, gültige Ziele, Formel-Sprünge zeigen auf echte Formeln", () => {
  const ids = new Set();
  for (const x of INDEX) {
    assert.ok(x.titel && x.ziel && x.ziel.ansicht, `Eintrag ohne Titel oder Ziel: ${JSON.stringify(x.id)}`);
    assert.ok(!ids.has(x.id), `doppelte Kennung ${x.id}`);
    ids.add(x.id);
    assert.ok(ANSICHTEN.has(x.ziel.ansicht), `Ansicht „${x.ziel.ansicht}“ (${x.titel}) gibt es in func10.jsx nicht`);
    if (x.ziel.formel) assert.ok(FS_NACH_ID[x.ziel.formel], `Formel ${x.ziel.formel} fehlt`);
  }
  assert.ok(INDEX.length > 300);
});

test("Normalisieren: Umlaute, ß, Großschreibung, Exponenten", () => {
  assert.equal(falte("Flächen"), "flachen");
  assert.equal(falte("Größe"), "grosse");
  assert.equal(falte("x² + 3"), "x2 3");
  assert.equal(suche("Flaechen").art, "treffer");
  assert.deepEqual(titel(suche("flächen")), titel(suche("FLÄCHEN")));
});

test("Wortvergleich: Präfix, Wortstamm, Tippfehler – aber nicht „kette“ ~ „kettenregel“", () => {
  assert.equal(passt("kurve", "kurvendiskussion").s, 0.9);
  assert.ok(passt("ableiten", "ableitung").s >= 0.7);
  assert.ok(passt("regel", "kettenregel").s >= 0.75);
  assert.equal(passt("kettenregel", "kette").s, 0);
  assert.equal(passt("kettenregel", "ketten").s, 0);
  assert.ok(passt("kettenregl", "kettenregel").s >= 0.6, "Tippfehler wird erkannt");
  assert.ok(passt("hypotesentest", "hypothesentest").unscharf);
  assert.equal(passt("haus", "maus").s, 0);
});

test("Konkrete Themen führen zu Werkzeug, Kurs und Formel", () => {
  const k = suche("Kettenregel");
  assert.equal(k.art, "treffer");
  assert.ok(hat(k, "Ableitungstrainer") && hat(k, "Ableitungsregeln") && hat(k, "Kettenregel"));
  assert.ok(!hat(k, "Bernoulli-Kette"), "„Kette“ in anderem Wort darf nicht treffen");

  const b = suche("binomische Formeln");
  assert.ok(hat(b, "Terme und Potenzgesetze") && hat(b, "Erste binomische Formel") && hat(b, "Dritte binomische Formel"));

  const l = suche("Logarithmus");
  assert.ok(hat(l, "Wachstum und Logarithmen") && hat(l, "Gleichungen lösen") && hat(l, "natürliche Logarithmus") && hat(l, "Logarithmengesetze"));

  const e = suche("e-Funktion");
  assert.equal(e.art, "treffer");
  assert.ok(hat(e, "e-Funktion") && !hat(e, "Geradengleichung"), "e-Funktion ist nicht „Funktion“");

  assert.ok(hat(suche("Skalarprodukt"), "Winkel und Skalarprodukt"));
  assert.ok(hat(suche("Wendepunkte"), "Kurvendiskussion"));
  assert.ok(hat(suche("Extremstellen"), "Kurvendiskussion"));
  assert.ok(hat(suche("Hypothesentest"), "Hypothesentests"));
  assert.ok(hat(suche("Pq-Formel"), "Gleichungen lösen") && !hat(suche("Pq-Formel"), "Bernoulli"));
  assert.ok(hat(suche("Brüche kürzen"), "Terme und Potenzgesetze"));
  assert.ok(hat(suche("Kopfrechnen"), "Head & Numbers"));
});

test("Je Videokurs nur eine Lektion, Formeln lassen sich einzeln anspringen", () => {
  const r = suche("Ableitung");
  const kurse = r.gruppen.flatMap((g) => g.eintraege).filter((x) => x.typ === "kurs");
  const ids = kurse.map((x) => x.gruppe);
  assert.equal(new Set(ids).size, ids.length);
  const f = suche("Kettenregel").gruppen.find((g) => g.id === "nachschlagen").eintraege.find((x) => x.titel === "Kettenregel");
  assert.deepEqual(f.ziel, { ansicht: "formeln", bereich: "analysis", formel: "kettenregel" });
});

test("Zu breite Eingaben: Gegenfrage mit Auswahl statt Werkzeugliste", () => {
  for (const q of ["Mathematik", "Mathe", "Hilfe", "üben", "Analysis", "Vektoren", "Stochastik", "Gleichungen", "Klausur", "Formeln"]) {
    const r = suche(q);
    assert.equal(r.art, "rueckfrage", q);
    assert.ok(r.frage[0].endsWith("?") || r.frage[0].endsWith("."), q);
    assert.ok(r.optionen.length >= 4, q);
  }
  assert.match(suche("Mathematik").frage[0], /Was genau/);
  assert.match(suche("Analysis").frage[0], /Analysis/);
  assert.equal(suche("ich brauche Hilfe in Mathe").art, "rueckfrage");
  assert.equal(suche("Mathe Analysis").frage[0], suche("Analysis").frage[0], "das spezifischere Wort entscheidet");
});

test("Mehrdeutige Wörter fragen nach, bevor Werkzeuge kommen", () => {
  for (const q of ["Winkel", "Gerade", "Geraden", "Test", "Ebene", "Fehler"]) {
    const r = suche(q);
    assert.equal(r.art, "mehrdeutig", q);
    assert.ok(r.optionen.length >= 3, q);
  }
});

test("Tippfehler: Vorschlag „Meinst du …?“ oder trotzdem richtiger Treffer", () => {
  const r = suche("Hypotesentest");
  assert.equal(r.art, "vorschlag");
  assert.ok(r.optionen.some((o) => /Hypothesentest/.test(o.text[0])));
  const k = suche("kettenregl");
  assert.ok(k.art === "vorschlag" ? k.optionen.some((o) => /Kettenregel/.test(o.text[0])) : hat(k, "Kettenregel"));
  assert.ok(hat(suche("Logarithmuss"), "Logarithmus"));
  assert.ok(hat(suche("Ableitng"), "Ableitungstrainer"));
});

test("Unsinn und Leeres", () => {
  assert.equal(suche("").art, "leer");
  assert.equal(suche("   ").art, "leer");
  const n = suche("xyzqwv");
  assert.equal(n.art, "nichts");
  assert.ok(n.optionen.length >= 3);
  const teil = suche("Gleichungen xyzqwv");
  assert.ok(teil.art === "rueckfrage" || teil.art === "treffer");
  const gemischt = suche("Kettenregel xyzqwv");
  assert.equal(gemischt.art, "treffer");
  assert.deepEqual(gemischt.unbekannt, ["xyzqwv"]);
});

test("Satzform und Füllwörter: es zählt das Thema", () => {
  assert.deepEqual(titel(suche("ich verstehe die Kettenregel nicht")), titel(suche("Kettenregel")));
  assert.ok(hat(suche("wie leite ich ab mit der Kettenregel?"), "Kettenregel"));
  assert.ok(hat(suche("Ich möchte Binomische Formeln trainieren"), "Terme und Potenzgesetze"));
  const satz = suche("Ich schreibe morgen eine Arbeit über Ableitungen");
  assert.equal(satz.art, "treffer");
  assert.ok(hat(satz, "Ableitungstrainer") && hat(satz, "Klausur vorbereiten"), "ganze Sätze: beide Themen kommen vor");
});

test("Absicht ordnet die Gruppen: üben → Werkzeuge zuerst, lernen/Video → Kurse zuerst", () => {
  assert.equal(erste(suche("Kettenregel üben")), "uebung");
  assert.equal(erste(suche("Kettenregel erklärt")), "lernen");
  assert.equal(erste(suche("Video zur Kettenregel")), "lernen");
  assert.equal(erste(suche("Kettenregel")), "uebung");
});

test("Englische Eingabe findet dasselbe", () => {
  assert.ok(hat(suche("chain rule"), "Kettenregel"));
  assert.ok(hat(suche("derivative"), "Ableitungstrainer"));
  assert.ok(hat(suche("logarithm"), "Logarithmus"));
  assert.ok(hat(suche("fractions"), "Terme und Potenzgesetze"));
  assert.ok(hat(suche("dot product"), "Skalarprodukt"));
  assert.ok(hat(suche("product rule"), "Produktregel"));
  assert.ok(hat(suche("integral"), "Integrale"));
  /* breite englische Wörter fragen genauso nach wie die deutschen */
  for (const q of ["maths", "mathematics", "calculus", "vectors", "probability", "equations", "exam", "formulas"]) assert.equal(suche(q).art, "rueckfrage", q);
  for (const q of ["angle", "line", "plane"]) assert.equal(suche(q).art, "mehrdeutig", q);
});

test("Jede Auswahl-Taste führt weiter: zu Treffern oder zu genau einer feineren Frage, deren Tasten dann Treffer liefern", () => {
  assert.ok(ALLE_OPTIONEN.length >= 40);
  for (const o of ALLE_OPTIONEN) {
    assert.ok(o.text[0] && o.text[1] && o.anfrage, "Text auf Deutsch und Englisch");
    const r = suche(o.anfrage);
    assert.ok(r.art === "treffer" || r.art === "rueckfrage", `„${o.text[0]}“ → „${o.anfrage}“ liefert ${r.art}`);
    if (r.art === "rueckfrage") {
      for (const o2 of r.optionen) {
        const r2 = suche(o2.anfrage);
        assert.equal(r2.art, "treffer", `Zweite Stufe: „${o2.text[0]}“ → „${o2.anfrage}“ liefert ${r2.art}`);
      }
    } else assert.ok(titel(r).length >= 1);
  }
  for (const b of BEISPIELE) assert.equal(suche(b.anfrage).art, "treffer");
});

test("Zielvielfalt: Eine Abfrage zeigt nicht mehr als 5 je Gruppe, der Rest steht unter „mehr“", () => {
  const r = suche("Integral");
  for (const g of r.gruppen) assert.ok(g.eintraege.length <= 5);
  assert.ok(r.gruppen.some((g) => g.mehr.length > 0));
});
