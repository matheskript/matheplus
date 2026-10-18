/* Reine Logik der Eltern-Einwilligung (src/einwilligungLogik.js) */
import test from "node:test";
import assert from "node:assert/strict";
import { darfImKonto, einwilligungStatus, einwilligungsLink, tokenAusUrl, elternBitte, einwilligungsFehler, mailGueltig, UMFANG, FEHLT_TEXT } from "../src/einwilligungLogik.js";

test("darfImKonto spiegelt einwilligung_ok aus der Datenbank", () => {
  assert.equal(darfImKonto(null), true);
  assert.equal(darfImKonto({ rolle: "eltern" }), true);
  assert.equal(darfImKonto({ rolle: "schueler", unter16: false }), true);
  assert.equal(darfImKonto({ rolle: "schueler", unter16: null }), false);
  assert.equal(darfImKonto({ rolle: "schueler" }), false);
  assert.equal(darfImKonto({ rolle: "schueler", unter16: true }), false);
  const e = { rolle: "schueler", unter16: true, einwilligung: { konto: true, ki: false, klassen: true } };
  assert.equal(darfImKonto(e), true);
  assert.equal(darfImKonto(e, "ki"), false);
  assert.equal(darfImKonto(e, "klassen"), true);
});

test("einwilligungStatus für die Kontokarten", () => {
  assert.equal(einwilligungStatus({ rolle: "lehrkraft" }), "nicht_noetig");
  assert.equal(einwilligungStatus({ rolle: "schueler", unter16: null }), "alter_fehlt");
  assert.equal(einwilligungStatus({ rolle: "schueler", unter16: false }), "nicht_noetig");
  assert.equal(einwilligungStatus({ rolle: "schueler", unter16: true }), "fehlt");
  assert.equal(einwilligungStatus({ rolle: "schueler", unter16: true, einwilligung: { konto: true } }), "erteilt");
});

test("Link hin und zurück, nur gültige Tokens", () => {
  const l = einwilligungsLink("https://mythosmathe.de/", "a1b2c3d4e5f60718");
  assert.equal(l, "https://mythosmathe.de/einwilligung?k=a1b2c3d4e5f60718");
  assert.equal(tokenAusUrl(l), "a1b2c3d4e5f60718");
  assert.equal(tokenAusUrl("https://x.de/einwilligung?k=<script>"), "");
  assert.equal(tokenAusUrl("kein link"), "");
  assert.match(elternBitte("Lena", l), /Lena.*unter 16.*einwilligung\?k=/s);
});

test("Fehler aus der Datenbank werden verständlich", () => {
  assert.equal(einwilligungsFehler({ message: "eltern_einwilligung_fehlt" }), FEHLT_TEXT);
  assert.equal(einwilligungsFehler({ message: "anderer Fehler" }), null);
  assert.equal(mailGueltig("a@b.de"), true);
  assert.equal(mailGueltig("a@b"), false);
  assert.deepEqual(UMFANG.map((u) => u.id), ["konto", "ki", "klassen"]);
});
