/* Spenden: Beträge, Links, IBAN, vier Wege. Reine Logik, ohne Netz. */
import test from "node:test";
import assert from "node:assert/strict";
import { SPENDEN, betragOk, paypalLink, kofiLink, kartenLink, ibanOk, ibanAnzeige, wege, mindestensEinWeg, euro } from "../src/spenden.js";

test("vier Beträge 10, 20, 50, 100 und eine gültige Vorauswahl", () => {
  assert.deepEqual(SPENDEN.betraege, [10, 20, 50, 100]);
  assert.ok(SPENDEN.betraege.includes(SPENDEN.vorgewaehlt));
  assert.equal(betragOk(50), true);
  assert.equal(betragOk(15), false);
  assert.equal(betragOk("20"), false);
  assert.equal(euro(20), "20 €");
});

test("PayPal-Link: Name und Betrag werden geprüft", () => {
  assert.equal(paypalLink("basti.test", 20), "https://www.paypal.com/paypalme/basti.test/20EUR");
  assert.equal(paypalLink("", 20), null);
  assert.equal(paypalLink("a/../b", 20), null);
  assert.equal(paypalLink("basti", 0), null);
  assert.equal(paypalLink("basti", 2.5), null);
});

test("Ko-fi und Kartenlink nur bei sauberen Eingaben", () => {
  assert.equal(kofiLink("basti"), "https://ko-fi.com/basti");
  assert.equal(kofiLink("ba sti"), null);
  assert.equal(kartenLink("https://donate.stripe.com/abc123"), "https://donate.stripe.com/abc123");
  assert.equal(kartenLink("http://donate.stripe.com/abc"), null);
  assert.equal(kartenLink("javascript:alert(1)"), null);
  assert.equal(kartenLink(""), null);
});

test("IBAN-Prüfziffer", () => {
  assert.equal(ibanOk("DE89 3704 0044 0532 0130 00"), true);
  assert.equal(ibanOk("DE89370400440532013001"), false);
  assert.equal(ibanOk(""), false);
  assert.equal(ibanAnzeige("de89370400440532013000"), "DE89 3704 0044 0532 0130 00");
});

const LEER = { ...SPENDEN, paypal: { name: "" }, kofi: { name: "" }, karte: { link: "" }, sepa: { iban: "", empfaenger: "" } };

test("ohne Eintragung: vier Wege, PayPal zuerst, alle gesperrt, nichts erfunden", () => {
  const w = wege(20, LEER);
  assert.equal(w.length, 4);
  assert.deepEqual(w.map((x) => x.id), ["paypal", "karte", "kofi", "sepa"]);
  assert.ok(w.every((x) => !x.bereit && !x.href));
  assert.equal(mindestensEinWeg(LEER), false);
});

test("eingetragene Wege (19.10.2026): PayPal.me/MythosMathe und Überweisung, sonst nichts", () => {
  assert.equal(SPENDEN.paypal.name, "MythosMathe");
  assert.equal(ibanOk(SPENDEN.sepa.iban), true);
  assert.equal(SPENDEN.sepa.empfaenger, "Bastian Blumenröther");
  for (const b of SPENDEN.betraege) {
    const w = wege(b);
    assert.deepEqual(w.filter((x) => x.bereit).map((x) => x.id), ["paypal", "sepa"]);
    assert.equal(w[0].href, `https://www.paypal.com/paypalme/MythosMathe/${b}EUR`);
    assert.equal(w[3].iban, "DE92 6906 1800 0000 2162 08");
  }
  assert.equal(mindestensEinWeg(), true);
});

test("mit Eintragung: PayPal trägt den Betrag, Überweisung nennt Zweck und Betrag", () => {
  const cfg = { ...SPENDEN, paypal: { name: "basti" }, kofi: { name: "basti" }, karte: { link: "https://donate.stripe.com/x" }, sepa: { iban: "DE89370400440532013000", empfaenger: "Bastian Blumenröther" } };
  for (const b of cfg.betraege) {
    const w = wege(b, cfg);
    assert.ok(w.every((x) => x.bereit));
    assert.equal(w[0].href, `https://www.paypal.com/paypalme/basti/${b}EUR`);
    assert.match(w[3].verwendung, new RegExp(`${b} €`));
    assert.equal(w[3].iban, "DE89 3704 0044 0532 0130 00");
  }
  assert.equal(mindestensEinWeg(cfg), true);
});

test("Überweisung ohne Empfänger oder mit falscher IBAN bleibt gesperrt", () => {
  assert.equal(wege(10, { ...SPENDEN, sepa: { iban: "DE89370400440532013000", empfaenger: "" } })[3].bereit, false);
  assert.equal(wege(10, { ...SPENDEN, sepa: { iban: "DE00", empfaenger: "X" } })[3].bereit, false);
});
