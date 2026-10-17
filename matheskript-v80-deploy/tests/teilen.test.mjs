import test from "node:test";
import assert from "node:assert/strict";
import { TOOL_SAETZE, SEITEN_SAETZE, teilenInfo, teilenText, whatsappUrl } from "../src/teilen.js";
import { WERKZEUGE, ansichtenVon } from "../src/werkzeuge.js";
import { PFADE } from "../src/pfade.js";

test("Jedes Werkzeug hat einen deutschen und englischen Teilen-Satz – und es gibt keine Karteileichen", () => {
  for (const id of Object.keys(WERKZEUGE)) {
    const s = TOOL_SAETZE[id];
    assert.ok(s && s.de.length > 8 && s.en.length > 8, `Werkzeug ${id}: Satz fehlt in TOOL_SAETZE (teilen.js)`);
  }
  for (const id of Object.keys(TOOL_SAETZE)) assert.ok(WERKZEUGE[id], `TOOL_SAETZE.${id} gehört zu keinem Werkzeug`);
});

test("Jede Ansicht eines Werkzeugs (auch Umschalter) bekommt den Teilen-Knopf", () => {
  for (const [id, w] of Object.entries(WERKZEUGE)) for (const a of ansichtenVon(w)) {
    const i = teilenInfo(a);
    assert.ok(i, `Ansicht ${a} (${id}) ohne Teilen-Info`);
    assert.equal(i.id, id);
  }
  assert.equal(teilenInfo("plotter").id, "kurvendiskussion");
  assert.equal(teilenInfo("advplotter").id, "kurvendiskussion");
  assert.equal(teilenInfo("gleichverstehen").id, "gleichungen");
});

test("Trainingsseiten haben einen Knopf, Startseite, Konto und Rechtliches nicht", () => {
  for (const a of ["warmup", "headnumbers", "kopf", "meintraining", "fehlertraining", "ebbinghaus", "abiketten", "abisaetze", "pruefung"]) assert.ok(teilenInfo(a), a);
  for (const a of ["start", "konto", "elternabend", "landingpage", "impressum", "agb", "widerruf", "profil", "entwurf-start"]) assert.equal(teilenInfo(a), null, a);
  for (const a of Object.keys(SEITEN_SAETZE)) assert.ok(PFADE.some((e) => e.ansicht === a), `${a} hat keinen Direct Link – Teilen würde ins Leere führen`);
});

test("Nachricht: Beispieltext, Link enthalten, Englisch", () => {
  const i = teilenInfo("ableitungstrainer");
  assert.equal(teilenText(i, "https://x.de/ableitungstrainer"), "Hey, schau dir mal dieses Tool auf mythosmathe.de an. Hier kannst du super Ableitungen trainieren:\nhttps://x.de/ableitungstrainer\n\n(aktuell Passwort: mathe)");
  assert.match(teilenText(i, "https://x.de/a", "en"), /^Hey, check out this tool on mythosmathe\.de\. Here you can easily practise derivatives:\nhttps:\/\/x\.de\/a\n\n\(current password: mathe\)$/);
  for (const [id, s] of Object.entries(TOOL_SAETZE)) {
    const t = teilenText({ id, ...s }, "https://x.de/l");
    assert.ok(t.includes("\nhttps://x.de/l\n\n(aktuell Passwort: mathe)") && t.includes(s.de));
    assert.ok(!/\s{2,}|\.\.|:\s*:/.test(t.split("\n")[0]), `Satzzeichen/Leerzeichen in ${id}`);
  }
});

test("WhatsApp-Link: wa.me mit kodiertem Text, ohne Verlust von Umlauten und Zeilenumbruch", () => {
  const text = teilenText(teilenInfo("abstaende"), "https://x.de/abstaende?a=1&b=2");
  const u = whatsappUrl(text);
  assert.ok(u.startsWith("https://wa.me/?text="));
  assert.equal(decodeURIComponent(u.slice("https://wa.me/?text=".length)), text);
  assert.ok(!/[\n ]/.test(u));
});
