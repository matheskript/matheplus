/* Startseite MathildaAI: die zwei Boxen „Textaufgabe“ / „Klausurbox“ im goldenen Schnitt,
   Serienmodus im Scanner (Foto / Letztes Foto) – Strukturprüfung der Quelltexte */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const lies = (f) => readFileSync(join(SRC, f), "utf8");

test("Beide Boxen stehen nebeneinander im goldenen Schnitt (1,618 : 1)", () => {
  const q = lies("funcMathildaSeite.jsx");
  assert.match(q, /\.mk-karte \{ position: relative; aspect-ratio: 1\.618 \/ 1;/);
  assert.match(q, /\.mk-karten \{[^}]*grid-template-columns: 1fr 1fr;/);
});

test("Boxen heißen Textaufgabe und Klausurbox, jede mit Kamera-Knopf", () => {
  const q = lies("funcMathildaSeite.jsx");
  assert.match(q, /<b className="mk-karte-titel">Textaufgabe<\/b>/);
  assert.match(q, /<b className="mk-karte-titel">Klausurbox<\/b>/);
  assert.match(q, /data-mathilda-textaufgabe-kamera/);
  assert.match(q, /data-mathilda-briefkasten-kamera/);
  assert.doesNotMatch(q, /Klausurbriefkasten/);
});

test("Scanner: Serienmodus mit „Foto“ und „Letztes Foto“", () => {
  const s = lies("funcBlattScanner.jsx");
  assert.match(s, /data-foto-weiter/);
  assert.match(s, /data-foto-letztes/);
  assert.match(s, /weiter: !letztes/);
  const k = lies("funcKlausurBriefkasten.jsx");
  assert.match(k, /serie=\{\{ seite:/);
});

test("Kamera-Wunsch wird genau einmal abgeholt", async () => {
  const { kameraWunschSetzen, kameraWunschHolen } = await import("../src/kameraWunsch.js");
  assert.equal(kameraWunschHolen("text"), false);
  kameraWunschSetzen("text");
  assert.equal(kameraWunschHolen("klausur"), false);
  assert.equal(kameraWunschHolen("text"), true);
  assert.equal(kameraWunschHolen("text"), false);
});
