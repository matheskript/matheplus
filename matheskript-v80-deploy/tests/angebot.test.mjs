/* Angebots-Schalter (src/angebot.js): Blog-Start 19.10.2026 – nichts Kommerzielles, nur freiwillige Spenden. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ANGEBOT, ANSICHTEN_JE_ANGEBOT, ansichtGesperrt, ansichtErlaubt } from "../src/angebot.js";
import { SEITEN } from "../src/pfade.js";

/* funcRecht.jsx ist JSX (nicht direkt in Node ladbar): ANBIETER aus dem Quelltext lesen */
const RECHT = readFileSync(new URL("../src/funcRecht.jsx", import.meta.url), "utf8");
const ANBIETER = Object.fromEntries([...RECHT.match(/export const ANBIETER = \{([\s\S]*?)\n\};/)[1].matchAll(/^\s*(\w+):\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]]));

test("Start als privater Blog: alle Angebote sind aus", () => {
  for (const [name, an] of Object.entries(ANGEBOT)) assert.equal(an, false, name);
});

test("abgeschaltete Ansichten führen auf die Startseite, mit Passwort bleiben sie offen", () => {
  for (const a of ["elternabend", "landingpage", "masterclass", "mckurs", "mczugang", "mathecheck", "nachhilfekurs"]) {
    assert.equal(ansichtGesperrt(a), true, a);
    assert.equal(ansichtErlaubt(a), "start", a);
    assert.equal(ansichtErlaubt(a, true), a, a + " mit Passwort");
  }
  for (const a of ["start", "spenden", "datenschutz", "impressum", "konto", "diffkurs", "vekkurs", "plan", "lehrerblatt"]) assert.equal(ansichtErlaubt(a), a, a);
});

test("eingeschaltetes Angebot öffnet seine Ansichten wieder", () => {
  const an = { ...ANGEBOT, kurse: true, elternabend: true, landingpage: true };
  for (const a of Object.values(ANSICHTEN_JE_ANGEBOT).flat()) assert.equal(ansichtErlaubt(a, false, an), a, a);
});

test("jede geschaltete Ansicht hat weiterhin einen Pfad (Schalter löschen nichts)", () => {
  const ansichten = new Set(SEITEN.map((s) => s.ansicht));
  for (const a of Object.values(ANSICHTEN_JE_ANGEBOT).flat()) assert.ok(ansichten.has(a), a);
});

test("Impressum: vollständige Anschrift, Erreichbarkeit, keine Platzhalter, keine USt-Zeile ohne Nummer", () => {
  for (const feld of ["name", "strasse", "ort", "land", "email", "telefon"]) {
    assert.ok(ANBIETER[feld] && !/[\[\]]/.test(ANBIETER[feld]), `${feld} ist ausgefüllt`);
  }
  assert.match(ANBIETER.email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  assert.match(ANBIETER.ort, /^\d{5} \S+/);
  assert.equal(ANBIETER.ustId, "");   // nie die Steuer-ID eintragen
  const q = readFileSync(new URL("../src/funcRecht.jsx", import.meta.url), "utf8");
  assert.match(q, /ANBIETER\.ustId &&/);
});

test("Spendenseite: keine Zusage einer Gegenleistung", () => {
  for (const datei of ["funcSpendenSeite.jsx", "funcSpenden.jsx", "funcSpendenBereich.jsx"]) {
    const q = readFileSync(new URL(`../src/${datei}`, import.meta.url), "utf8");
    assert.ok(!/WIR VERGESSEN|berücksichtigt|denken wir an dich/i.test(q), datei);
  }
  const r = readFileSync(new URL("../src/funcRecht.jsx", import.meta.url), "utf8");
  assert.ok(!/bei künftigen Angeboten zu berücksichtigen/.test(r));
});
