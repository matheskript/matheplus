/* Modul Unterstufe: Daten vollständig und alle Verweise gültig */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  UNTERSTUFE_KLASSEN, UNTERSTUFE_EINHEITEN, UNTERSTUFE_SEITEN, UNTERSTUFE_ZAHLEN, KOPF_TRAINER_IDS,
  einheitVon, naechsteEinheit, vorigeEinheit, unterstufeStand, einheitGeschafft, istUnterstufeSeite,
} from "../src/unterstufeDaten.js";
import { WERKZEUGE } from "../src/werkzeuge.js";
import { UNTER_IDS, aufgabeAus } from "../src/arbeitsblatt.js";
import {
  ZAHL_ARTEN, GANZ_ARTEN, PRIM_ARTEN, RG_ARTEN, GROESSEN_ARTEN, DEZ_ARTEN, KOORD_ARTEN, FLAECHE_ARTEN, QUADER_ARTEN,
  ZUORD_ARTEN, PROZENT_ARTEN, DATEN_ARTEN, ZUFALL_ARTEN,
} from "../src/unterGen.js";
import { BRUCH_ARTEN } from "../src/bruchGen.js";
import { WINKEL_ARTEN, KREIS_ARTEN } from "../src/geoMittel2.js";
import { pfadAufloesen, pfadFuer } from "../src/pfade.js";

const quelle = (d) => readFileSync(new URL(`../src/${d}`, import.meta.url), "utf8");
const func10 = quelle("func10.jsx");

const ARTEN = {
  stellenwert: ZAHL_ARTEN, ganzezahlen: GANZ_ARTEN, primzahlen: PRIM_ARTEN, rechengesetze: RG_ARTEN, groessen: GROESSEN_ARTEN,
  dezimal: DEZ_ARTEN, koordinaten: KOORD_ARTEN, flaechen: FLAECHE_ARTEN, quader: QUADER_ARTEN, zuordnungen: ZUORD_ARTEN,
  prozent: PROZENT_ARTEN, diagramme: DATEN_ARTEN, zufall: ZUFALL_ARTEN, bruchrechnen: BRUCH_ARTEN, winkelsaetze: WINKEL_ARTEN, kreis: KREIS_ARTEN,
};

/* Alle Texte einer Lerneinheit (für die Formelprüfung) */
function texte(e) {
  const l = [e.titel, e.ziel, e.merke, e.fehler || "", e.beispiel.aufgabe, ...e.beispiel.schritte, ...e.kann];
  for (const a of e.lesen) {
    if (typeof a === "string") l.push(a);
    else if (a.liste) l.push(...a.liste);
    else if (a.formel) l.push(...a.formel.map((f) => `$${f}$`));
    else if (a.tabelle) { l.push(...a.tabelle.kopf); for (const z of a.tabelle.zeilen) l.push(...z); }
    else if (a.kopf) l.push(a.kopf);
  }
  return l;
}

test("Zwei Klassen, je acht Kapitel, 86 Lerneinheiten mit eindeutigen Ids", () => {
  assert.equal(UNTERSTUFE_KLASSEN.length, 2);
  for (const k of UNTERSTUFE_KLASSEN) assert.equal(k.kapitel.length, 8, `Klasse ${k.id}`);
  assert.equal(UNTERSTUFE_EINHEITEN.length, UNTERSTUFE_ZAHLEN.einheiten);
  assert.ok(UNTERSTUFE_EINHEITEN.length >= 80, "mindestens 80 Lerneinheiten");
  const ids = UNTERSTUFE_EINHEITEN.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, "Ids doppelt");
  for (const id of ids) assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Id "${id}" taugt nicht als Pfad`);
  assert.ok(!ids.some((id) => /^klasse-\d/.test(id)), "Ids dürfen nicht wie Klassenseiten heißen");
  const kap = UNTERSTUFE_KLASSEN.flatMap((k) => k.kapitel.map((x) => x.id));
  assert.equal(new Set(kap).size, kap.length, "Kapitel-Ids doppelt");
});

test("Jede Lerneinheit ist vollständig: Ziel, Lesen, Beispiel, Merksatz, drei Kann-Aussagen, Übungen", () => {
  for (const e of UNTERSTUFE_EINHEITEN) {
    assert.ok(e.titel && e.ziel, e.id);
    assert.ok(Array.isArray(e.lesen) && e.lesen.length >= 2, `${e.id}: zu wenig Lesestoff`);
    assert.ok(e.beispiel && e.beispiel.aufgabe && e.beispiel.schritte.length >= 1, `${e.id}: Beispiel`);
    assert.ok(e.merke, `${e.id}: Merksatz`);
    assert.equal(e.kann.length, 3, `${e.id}: genau drei Kann-Aussagen`);
    assert.ok(e.ueben.length >= 1, `${e.id}: mindestens ein Übungsknopf`);
    assert.ok(Array.isArray(e.aufgaben), `${e.id}: aufgaben fehlt`);
    for (const k of e.kann) assert.match(k, /^Ich /, `${e.id}: Kann-Aussage beginnt mit „Ich“`);
  }
});

test("Formeln: $-Zeichen paarweise, keine unbekannten TeX-Befehle", () => {
  const erlaubt = new Set(["frac", "cdot", "text", "mathbb", "overline", "ldots", "approx", "neq", "le", "leq", "ge", "geq", "times", "angle", "perp", "parallel", "subset", "in", "alpha", "beta", "gamma", "delta", "circ", "left", "right", "quad", "sqrt", "mid", "to", "Rightarrow", "pm", "infty", ",", ";", " "]);
  for (const e of UNTERSTUFE_EINHEITEN) for (const t of texte(e)) {
    const n = (t.match(/\$/g) || []).length;
    assert.equal(n % 2, 0, `${e.id}: ungerade $-Zahl in „${t.slice(0, 50)}…“`);
    for (const m of t.matchAll(/\\([a-zA-Z]+|[,; ])/g)) assert.ok(erlaubt.has(m[1]), `${e.id}: TeX-Befehl \\${m[1]} unbekannt in „${t.slice(0, 60)}“`);
  }
});

test("Übungsknöpfe zeigen auf echte Werkzeuge, Aufgabentypen, Trainer und Seiten", () => {
  for (const e of UNTERSTUFE_EINHEITEN) for (const u of e.ueben) {
    assert.ok(u.text, `${e.id}: Knopf ohne Text`);
    if (u.wz) {
      assert.ok(WERKZEUGE[u.wz], `${e.id}: Werkzeug ${u.wz} gibt es nicht`);
      if (u.art) assert.ok(ARTEN[u.wz] && ARTEN[u.wz].includes(u.art), `${e.id}: Aufgabentyp ${u.wz}/${u.art} gibt es nicht`);
      if (u.modus) assert.ok(["entdecken", "ueben"].includes(u.modus), `${e.id}: Modus ${u.modus}`);
    } else if (u.kopf) {
      assert.ok(KOPF_TRAINER_IDS.includes(u.kopf), `${e.id}: Kopfrechen-Trainer ${u.kopf}`);
    } else if (u.ziel) {
      assert.ok(u.ziel.ansicht, `${e.id}: Ziel ohne Ansicht`);
      const da = func10.includes(`ansicht === "${u.ziel.ansicht}"`) || WERKZEUGE[u.ziel.ansicht] || quelle("funcWerkzeugSeite.jsx").includes(`  ${u.ziel.ansicht}: {`);
      assert.ok(da, `${e.id}: Ansicht ${u.ziel.ansicht} gibt es nicht`);
    } else assert.fail(`${e.id}: Knopf weder wz noch kopf noch ziel`);
  }
});

test("Aufgabenquellen gibt es in arbeitsblatt.js und sie liefern Text, Weg und Ergebnis", () => {
  const z = Math.random;   // feste Zufallszahlen lassen manche Generatoren endlos schleifen
  for (const e of UNTERSTUFE_EINHEITEN) for (const q of e.aufgaben) {
    assert.ok(UNTER_IDS.includes(q), `${e.id}: Quelle ${q} unbekannt`);
    const a = aufgabeAus(`u:${q}`, z);
    assert.ok(a.text && a.ergebnis !== undefined, `${e.id}: Quelle ${q} ohne Text oder Ergebnis`);
  }
  const mit = UNTERSTUFE_EINHEITEN.filter((e) => e.aufgaben.length).length;
  assert.ok(mit >= 70, `nur ${mit} Lerneinheiten mit Aufgaben`);
});

test("Alle Trainer sind in der App eingebettet (jede Id kommt in ueben vor)", () => {
  const benutzt = new Set(UNTERSTUFE_EINHEITEN.flatMap((e) => e.ueben.filter((u) => u.kopf).map((u) => u.kopf)));
  for (const id of KOPF_TRAINER_IDS) assert.ok(benutzt.has(id), `Trainer ${id} wird nirgends eingebettet`);
});

test("Nachbarn, Stand und Pfade", () => {
  const erste = UNTERSTUFE_EINHEITEN[0], letzte = UNTERSTUFE_EINHEITEN.at(-1);
  assert.equal(vorigeEinheit(erste.id), null);
  assert.equal(naechsteEinheit(letzte.id), null);
  assert.equal(naechsteEinheit(erste.id).id, UNTERSTUFE_EINHEITEN[1].id);
  assert.equal(einheitVon("gibt-es-nicht"), null);

  const leer = unterstufeStand({});
  assert.equal(leer.fertig, 0);
  assert.equal(leer.weiter.id, erste.id);
  const haken = { [erste.id]: [true, true, true], [UNTERSTUFE_EINHEITEN[1].id]: [true, false, true] };
  const s = unterstufeStand({ haken, zuletzt: UNTERSTUFE_EINHEITEN[1].id });
  assert.equal(s.fertig, 1);
  assert.equal(s.jeKlasse["5"].fertig, 1);
  assert.equal(s.weiter.id, UNTERSTUFE_EINHEITEN[1].id, "weiter = zuletzt geöffnete, noch offene Einheit");
  assert.ok(einheitGeschafft(erste, { haken }) && !einheitGeschafft(UNTERSTUFE_EINHEITEN[1], { haken }));

  assert.ok(istUnterstufeSeite("klasse-5") && istUnterstufeSeite(erste.id) && !istUnterstufeSeite("quatsch"));
  assert.equal(UNTERSTUFE_SEITEN.length, UNTERSTUFE_EINHEITEN.length + 2);
  assert.deepEqual(pfadAufloesen("/unterstufe"), { ansicht: "unterstufe", kanonisch: true });
  assert.deepEqual(pfadAufloesen("/unterstufe/klasse-6"), { ansicht: "unterstufe", seite: "klasse-6", kanonisch: true });
  assert.deepEqual(pfadAufloesen(`/unterstufe/${letzte.id}`), { ansicht: "unterstufe", seite: letzte.id, kanonisch: true });
  assert.equal(pfadAufloesen("/unterstufe/gibt-es-nicht"), null);
  assert.equal(pfadFuer({ ansicht: "unterstufe" }), "/unterstufe");
  assert.equal(pfadFuer({ ansicht: "unterstufe", seite: "klasse-5" }), "/unterstufe/klasse-5");
  assert.equal(pfadFuer({ ansicht: "unterstufe", seite: erste.id }), `/unterstufe/${erste.id}`);
});
