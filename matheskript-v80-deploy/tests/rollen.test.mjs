import test from "node:test";
import assert from "node:assert/strict";
import { ampel, ampelSortiert, ampelZaehlung, wochenUebersicht, tagKey, elternLink, klassenLink, einladungAusUrl, zuletztText, entdeckenText, elternNachricht, whatsappLink, maxStufe, rolleName, istGeschlecht, anredeHinweis, GESCHLECHTER, datenVollstaendig, notenSchluessel } from "../src/rollenLogik.js";

const jetzt = new Date(2026, 9, 14, 10, 0);     // Mittwoch, 14.10.2026
const vor = (n) => { const d = new Date(jetzt); d.setDate(d.getDate() - n); return tagKey(d); };
const aktiv = { s: 600, a: 5, r: 4 };

test("Ampel: grün, gelb, rot, grau", () => {
  assert.equal(ampel({ tage: { [vor(0)]: aktiv, [vor(2)]: aktiv } }, jetzt).farbe, "gruen");
  assert.equal(ampel({ tage: { [vor(3)]: aktiv } }, jetzt).farbe, "gelb");
  assert.equal(ampel({ tage: { [vor(10)]: aktiv } }, jetzt).farbe, "gelb");
  assert.equal(ampel({ tage: {}, letzte_aktivitaet: jetzt.getTime() - 30 * 86400000 }, jetzt).farbe, "rot");
  assert.equal(ampel({ tage: {}, letzte_aktivitaet: 0 }, jetzt).farbe, "grau");
  assert.equal(ampel(null, jetzt).farbe, "grau");
});
test("Ampel: kurze Besuche zählen nicht als aktiver Tag", () => {
  assert.equal(ampel({ tage: { [vor(0)]: { s: 30, a: 0 }, [vor(1)]: { s: 60, a: 0 } } }, jetzt).farbe, "grau");
  assert.equal(ampel({ tage: { [vor(0)]: { s: 5, a: 1 }, [vor(1)]: { s: 5, a: 2 } } }, jetzt).farbe, "gruen");
});
test("Ampel sortiert rot zuerst, dann alphabetisch", () => {
  const l = ampelSortiert([
    { name: "Zoe", tage: { [vor(0)]: aktiv, [vor(1)]: aktiv } },
    { name: "Max", tage: {}, letzte_aktivitaet: jetzt.getTime() - 40 * 86400000 },
    { name: "Ben", tage: {} },
    { name: "Ada", tage: { [vor(0)]: aktiv, [vor(1)]: aktiv } },
  ], jetzt);
  assert.deepEqual(l.map((s) => s.name), ["Max", "Ada", "Zoe", "Ben"]);
  assert.deepEqual(ampelZaehlung(l, jetzt), { rot: 1, gelb: 0, gruen: 2, grau: 1 });
});
test("Wochenübersicht: Montag bis Sonntag, Summen, Prozent", () => {
  const w = wochenUebersicht({ tage: { [vor(0)]: { s: 1200, a: 10, r: 8 }, [vor(2)]: { s: 600, a: 10, r: 6 }, [vor(9)]: { s: 9999, a: 99, r: 99 } } }, jetzt);
  assert.equal(w.tage.length, 7);
  assert.equal(w.tage[0].name, "Mo"); assert.equal(w.tage[0].key, vor(2));
  assert.equal(w.tage[2].heute, true); assert.equal(w.tage[3].zukunft, true);
  assert.equal(w.minuten, 30); assert.equal(w.aufgaben, 20); assert.equal(w.prozent, 70); assert.equal(w.aktiveTage, 2);
  assert.equal(wochenUebersicht(null, jetzt).prozent, null);
});
test("Links und Einladung", () => {
  const l = elternLink("https://x.de", "482913", "abc123def456");
  assert.equal(l, "https://x.de/482913?als=eltern&e=abc123def456");
  assert.deepEqual(einladungAusUrl(l), { als: "eltern", token: "abc123def456", klasse: null });
  assert.deepEqual(einladungAusUrl(klassenLink("https://x.de", "ab3k9z")), { als: null, token: null, klasse: "AB3K9Z" });
  assert.equal(einladungAusUrl("https://x.de/482913"), null);
  assert.equal(einladungAusUrl("https://x.de/?klasse=ABC"), null);            // ungültiger Code
  assert.equal(einladungAusUrl("https://x.de/1?als=eltern&e=<script>").token, null);
  assert.equal(einladungAusUrl("kein url"), null);
});
test("WhatsApp-Link kodiert den Text", () => {
  const t = elternNachricht("Anna", "https://x.de/1?als=eltern&e=ab");
  const w = whatsappLink(t);
  assert.ok(w.startsWith("https://wa.me/?text="));
  assert.equal(decodeURIComponent(w.slice(20)), t);
  assert.ok(t.includes("https://x.de/1?als=eltern&e=ab"));
});
test("Texte und Grenzen", () => {
  assert.equal(zuletztText(0, jetzt), "noch nicht aktiv");
  assert.equal(zuletztText(jetzt.getTime() - 3600000, jetzt), "heute");
  assert.equal(zuletztText(jetzt.getTime() - 86400000 * 1.2, jetzt), "gestern");
  assert.equal(zuletztText(jetzt.getTime() - 86400000 * 5, jetzt), "vor 5 Tagen");
  assert.equal(entdeckenText({ potenz_fertig: true }), "Potenzregel-Modul abgeschlossen");
  assert.equal(entdeckenText({ potenz_phase: 2, potenz_schritte: 4 }), "Potenzregel: Phase 3 von 7");
  assert.equal(entdeckenText(null), "noch nicht gestartet");
  assert.equal(maxStufe("G8"), 12); assert.equal(maxStufe("GMS"), 13);
});

test("Schüler/Schülerin: Rollenname und Anrede nach Geschlecht", () => {
  assert.deepEqual(GESCHLECHTER.map((g) => g.name), ["Schüler", "Schülerin"]);
  assert.equal(rolleName("schueler", "m"), "Schüler");
  assert.equal(rolleName("schueler", "w"), "Schülerin");
  assert.equal(rolleName("schueler"), "Schüler");          // ältere Konten ohne Angabe
  assert.equal(rolleName("eltern", "w"), "Elternteil");        // Geschlecht ändert andere Rollen nicht
  assert.equal(istGeschlecht("m"), true); assert.equal(istGeschlecht("w"), true);
  assert.equal(istGeschlecht(""), false); assert.equal(istGeschlecht(null), false); assert.equal(istGeschlecht("x"), false);
  assert.match(anredeHinweis("w"), /sie/); assert.doesNotMatch(anredeHinweis("w"), /Der Schüler ist/);
  assert.match(anredeHinweis("m"), /er/);
  assert.equal(anredeHinweis(null), "");
});

test("Meine Daten: vollständig erst mit Schulform, Klasse und allen Noten ab Klasse 3", () => {
  assert.deepEqual(notenSchluessel("G8", 12), ["3", "4", "5", "6", "7", "8", "9", "10", "11.1", "11.2", "12.1", "12.2"]);
  assert.deepEqual(notenSchluessel("G9", 11).slice(-2), ["10", "11"]);
  const noten7 = { 3: 1, 4: 2, 5: 2, 6: 3 };
  const p = { name: "Anna", schulform: "G9", klasse: 7, noten: noten7 };
  assert.equal(datenVollstaendig(p), true);                                  // aktuelle Klasse 7 braucht noch keine Note
  assert.equal(datenVollstaendig({ ...p, noten: { 4: 2, 5: 2, 6: 3 } }), false);   // Klasse 3 fehlt
  assert.equal(datenVollstaendig({ ...p, schulform: null }), false);
  assert.equal(datenVollstaendig({ ...p, klasse: null }), false);
  assert.equal(datenVollstaendig({ ...p, name: " " }), false);
  const kurs = { name: "Ben", schulform: "G8", klasse: 12, noten: { 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, "11.1": 12 } };
  assert.equal(datenVollstaendig(kurs), false);                              // 11.2 fehlt
  assert.equal(datenVollstaendig({ ...kurs, noten: { ...kurs.noten, "11.2": 13 } }), true);
});
