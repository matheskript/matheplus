import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COOKIE_WILLKOMMEN, SCHREIB_MS, GESAMT_MS, FEEDBACK_OEFFNEN,
  geschriebeneZeichen, zaehleZeichen, willkommenCookieGesetzt,
} from "../src/willkommen.js";

const quelle = (d) => readFileSync(new URL(`../${d}`, import.meta.url), "utf8");

/* ---------- Zeiten und Rechenhilfen ---------- */

test("Der Text ist nach 6 Sekunden fertig, der Balken nach 7 Sekunden", () => {
  assert.equal(SCHREIB_MS, 6000);
  assert.equal(GESAMT_MS, 7000);
  assert.ok(SCHREIB_MS < GESAMT_MS);
});

test("geschriebeneZeichen: 0 am Anfang, alles nach 6 Sekunden, nie mehr als alles", () => {
  const n = 240;
  assert.equal(geschriebeneZeichen(0, n), 0);
  assert.equal(geschriebeneZeichen(-50, n), 0);
  assert.equal(geschriebeneZeichen(3000, n), 120);
  assert.equal(geschriebeneZeichen(SCHREIB_MS, n), n);
  assert.equal(geschriebeneZeichen(GESAMT_MS, n), n);
  assert.equal(geschriebeneZeichen(100000, n), n);
  assert.equal(geschriebeneZeichen(1000, 0), 0);
});

test("geschriebeneZeichen wächst gleichmäßig und fällt nie", () => {
  let letzte = 0;
  for (let ms = 0; ms <= 7000; ms += 16) {
    const k = geschriebeneZeichen(ms, 233);
    assert.ok(k >= letzte, `${ms} ms: ${k} < ${letzte}`);
    letzte = k;
  }
});

test("zaehleZeichen zählt ohne Leerzeichen", () => {
  assert.equal(zaehleZeichen(["ab c", " d\n e"]), 5);
  assert.equal(zaehleZeichen([]), 0);
});

test("Cookie-Erkennung findet mm_willkommen=1 und nichts anderes", () => {
  assert.equal(willkommenCookieGesetzt("mm_willkommen=1"), true);
  assert.equal(willkommenCookieGesetzt("a=b; mm_willkommen=1; c=d"), true);
  assert.equal(willkommenCookieGesetzt("mm_willkommen=0"), false);
  assert.equal(willkommenCookieGesetzt("xmm_willkommen=1"), false);
  assert.equal(willkommenCookieGesetzt("mm_zugang=abc"), false);
  assert.equal(willkommenCookieGesetzt(""), false);
  assert.equal(willkommenCookieGesetzt(undefined), false);
});

/* ---------- Passwortseite (middleware.js) ---------- */

async function anfrage(url, optionen) {
  process.env.SEITEN_PASSWORT = "mathe";
  delete process.env.SEITEN_SCHUTZ;
  delete process.env.FORMELN_OEFFENTLICH;
  const { default: middleware } = await import("../middleware.js");
  return middleware(new Request(url, optionen));
}
const login = (passwort, ziel = "/") => anfrage("https://mythosmathe.de/__zugang", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ passwort, ziel }),
});

test("Richtiges Passwort: weiter zur App, Zugangs-Cookie und kurzes Willkommens-Cookie", async () => {
  const res = await login("mathe", "/training");
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("location"), "/training");
  const cookies = res.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  const zugang = cookies.find((c) => c.startsWith("mm_zugang="));
  const willkommen = cookies.find((c) => c.startsWith(`${COOKIE_WILLKOMMEN}=1`));
  assert.ok(zugang && /HttpOnly/.test(zugang) && /Secure/.test(zugang), "Zugangs-Cookie bleibt HttpOnly und Secure");
  assert.ok(willkommen, "Willkommens-Cookie fehlt");
  assert.ok(!/HttpOnly/.test(willkommen), "die App muss das Willkommens-Cookie lesen können");
  assert.match(willkommen, /Max-Age=120(;|$)/, "nur 2 Minuten gültig");
  assert.match(willkommen, /Path=\//);
});

test("Groß-/Kleinschreibung beim Passwort ist egal wie bisher", async () => {
  const res = await login("  MATHE ");
  assert.equal(res.status, 303);
  assert.equal(res.headers.getSetCookie().length, 2);
});

test("Falsches Passwort: Fehlerseite, keine Cookies, kein Willkommen", async () => {
  const res = await login("falsch");
  assert.equal(res.status, 401);
  assert.equal(res.headers.getSetCookie().length, 0);
  const html = await res.text();
  assert.match(html, /Das Passwort stimmt nicht/);
});

test("Fremde Ziele werden auf / umgebogen", async () => {
  const res = await login("mathe", "//boese.example/x");
  assert.equal(res.headers.get("location"), "/");
});

test("Passwortseite nennt die Testversion und enthält kein Willkommens-Cookie", async () => {
  const res = await anfrage("https://mythosmathe.de/", { method: "GET" });
  assert.equal(res.status, 401);
  assert.equal(res.headers.getSetCookie().length, 0);
  const html = await res.text();
  assert.match(html, /Du betrittst die Testversion von mythosmathe\.de/);
  assert.doesNotMatch(html, /noch nicht öffentlich/);
});

test("Middleware und App benutzen denselben Cookie-Namen", () => {
  assert.match(quelle("middleware.js"), new RegExp(`const COOKIE_WILLKOMMEN = "${COOKIE_WILLKOMMEN}"`));
});

/* ---------- Einbau in die App ---------- */

test("App legt die Willkommensseite über die App", () => {
  const app = quelle("src/App.jsx");
  assert.match(app, /import WillkommenOverlay from "\.\/funcWillkommen\.jsx"/);
  assert.match(app, /<Mathilda \/>/);
  assert.match(app, /<WillkommenOverlay \/>/);
});

test("Willkommensseite nutzt die gemeinsamen Zeiten und den Text aus dem Auftrag", () => {
  const q = quelle("src/funcWillkommen.jsx");
  assert.match(q, /GESAMT_MS/);
  assert.match(q, /SCHREIB_MS/);
  for (const satz of [
    "Du gehörst zu den Ersten, die Mythos Mathe testen dürfen.",
    "Trainiere dich in Mathe, hab Spaß und probier alles aus.",
    "Sag uns, was dir gefällt und was dir noch fehlt.",
    "Dein Feedback ist für uns ",
    "So wie es diese Seite für dich sein wird.",
  ]) assert.ok(q.includes(satz), `Satz fehlt: ${satz}`);
  assert.ok(!/entsteh|Werden/i.test(q), "Der Hinweis auf das Entstehen soll wegfallen");
  assert.match(q, /prefers-reduced-motion/);
});

test("Feedback-Knopf: Auswahl Text/Voice, Text-Fenster oben, Ereignis von der Willkommensseite", () => {
  const q = quelle("src/funcFeedback.jsx");
  assert.ok(q.includes("Text senden") && q.includes("Voice senden"));
  assert.ok(q.includes("FEEDBACK_OEFFNEN"));
  assert.match(q, /\.fb-text\{[^}]*top:calc\(env\(safe-area-inset-top/);
  assert.match(q, /max-height:calc\(50dvh/);
  assert.match(q, /nachricht: t\.slice\(0, MAX_ZEICHEN\)/);
  assert.ok(FEEDBACK_OEFFNEN.length > 0);
});

test("Text-Feedback: Datenbank-Skript passt zum Code", () => {
  const sql = quelle("supabase/feedback-text.sql");
  assert.match(sql, /add column if not exists nachricht text/);
  assert.match(sql, /alter column audio_pfad drop not null/);
  assert.match(sql, /grant insert \(nachricht\)/);
  assert.match(sql, /char_length\(nachricht\) between 1 and 2000/);
  assert.match(quelle("supabase/EINRICHTEN.md"), /feedback-text\.sql/);
});
