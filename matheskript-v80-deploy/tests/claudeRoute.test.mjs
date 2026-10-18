/* Test der Vercel-Route api/claude.js ohne Netz: fetch wird nachgebildet (Anthropic + Supabase). */
import test from "node:test";
import assert from "node:assert/strict";

process.env.ANTHROPIC_API_KEY = "test";
process.env.SUPABASE_URL = "https://beispiel.supabase.co";
process.env.SUPABASE_ANON_KEY = "anon";
process.env.KI_FREI_PRO_TAG = "2";
const { default: handler } = await import("../api/claude.js");

function res() {
  const r = { code: 200, body: null, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } };
  return r;
}
const req = (body, headers = {}) => ({ method: "POST", body, headers: { "x-ki-einwilligung": "1", ...headers } });

/* Anthropic-Nachbildung: erst Werkzeugaufruf, dann Antwort mit dem Ergebnis; Supabase: Zähler je Token */
let anthropicAufrufe = [];
let zaehler = {};
globalThis.fetch = async (url, init) => {
  const b = JSON.parse(init.body);
  if (String(url).includes("supabase")) {
    const t = init.headers.authorization.replace("Bearer ", "");
    if (t === "kaputt") return { status: 401, ok: false, json: async () => ({}) };
    if (t === "kind-ohne-eltern") return { status: 200, ok: true, json: async () => ({ erlaubt: false, grund: "eltern_einwilligung" }) };
    zaehler[t] = (zaehler[t] || 0) + 1;
    const lim = t === "pro" ? null : b.frei_pro_tag;
    const erlaubt = lim === null || zaehler[t] <= lim;
    if (!erlaubt) zaehler[t] -= 1;
    return { status: 200, ok: true, json: async () => ({ erlaubt, anzahl: zaehler[t], limit: lim, plan: t === "pro" ? "pro" : "free" }) };
  }
  anthropicAufrufe.push(b);
  const letzte = b.messages[b.messages.length - 1];
  if (b.tools && typeof letzte.content === "string") {
    return { status: 200, text: async () => JSON.stringify({ stop_reason: "tool_use", content: [{ type: "text", text: "Ich rechne nach." }, { type: "tool_use", id: "t1", name: "ableiten", input: { term: "x^3-3x" } }] }) };
  }
  const ergebnis = Array.isArray(letzte.content) ? letzte.content[0].content : "";
  return { status: 200, text: async () => JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: `Die Ableitung lautet laut Engine: ${ergebnis.split("\n")[1]}` }] }) };
};

test("Werkzeugrunde: Mathilda ruft ableiten, der Server rechnet, die Antwort trägt das Protokoll", async () => {
  anthropicAufrufe = [];
  const r = res();
  await handler(req({ messages: [{ role: "user", content: "Leite x^3-3x ab" }], werkzeuge: true, system: "Du bist Mathilda." }), r);
  assert.equal(r.code, 200);
  assert.equal(anthropicAufrufe.length, 2);
  assert.ok(anthropicAufrufe[0].tools.some((t) => t.name === "ableiten"));
  assert.equal(anthropicAufrufe[1].messages.length, 3);
  assert.equal(anthropicAufrufe[1].messages[2].content[0].type, "tool_result");
  assert.match(r.body.content[0].text, /3x² − 3/);
  assert.equal(r.body.werkzeuge.length, 1);
  assert.equal(r.body.werkzeuge[0].name, "ableiten");
});

test("Ohne werkzeuge: keine tools, eine Runde", async () => {
  anthropicAufrufe = [];
  const r = res();
  await handler(req({ messages: [{ role: "user", content: "Hallo" }] }), r);
  assert.equal(anthropicAufrufe.length, 1);
  assert.equal(anthropicAufrufe[0].tools, undefined);
  assert.equal(r.body.werkzeuge, undefined);
});

test("Kontingent je Konto: Free zwei am Tag, dann 429; Pro frei; abgelaufenes Token 401", async () => {
  zaehler = {};
  const kopf = (t) => ({ authorization: `Bearer ${t}`, "x-geraet": "g1" });
  const anfrage = () => req({ messages: [{ role: "user", content: "Hallo" }] }, kopf("frei"));
  let r = res(); await handler(anfrage(), r); assert.equal(r.code, 200); assert.deepEqual(r.body.kontingent, { anzahl: 1, limit: 2, plan: "free" });
  r = res(); await handler(anfrage(), r); assert.equal(r.code, 200); assert.equal(r.body.kontingent.anzahl, 2);
  r = res(); await handler(anfrage(), r); assert.equal(r.code, 429); assert.equal(r.body.error.kontingent.limit, 2);
  for (let i = 0; i < 5; i++) { r = res(); await handler(req({ messages: [{ role: "user", content: "Hallo" }] }, kopf("pro")), r); assert.equal(r.code, 200); assert.equal(r.body.kontingent.limit, null); }
  r = res(); await handler(req({ messages: [{ role: "user", content: "Hallo" }] }, kopf("kaputt")), r); assert.equal(r.code, 401);
});

test("Ohne Anmeldung: Gerätegrenze pro Stunde", async () => {
  process.env.KI_LIMIT_PRO_STUNDE = "40";
  let letzter = null;
  for (let i = 0; i < 41; i++) { letzter = res(); await handler(req({ messages: [{ role: "user", content: "Hallo" }] }, { "x-geraet": "handy-x" }), letzter); }
  assert.equal(letzter.code, 429);
});

test("Ohne Einwilligungs-Kopf geht nichts an Anthropic (428)", async () => {
  anthropicAufrufe = [];
  const r = res();
  await handler({ method: "POST", body: { messages: [{ role: "user", content: "Hallo" }] }, headers: {} }, r);
  assert.equal(r.code, 428);
  assert.equal(r.body.error.grund, "ki_einwilligung");
  assert.equal(anthropicAufrufe.length, 0);
});

test("Konto unter 16 ohne Eltern-Zustimmung: 403, nichts an Anthropic", async () => {
  anthropicAufrufe = [];
  const r = res();
  await handler(req({ messages: [{ role: "user", content: "Hallo" }] }, { authorization: "Bearer kind-ohne-eltern" }), r);
  assert.equal(r.code, 403);
  assert.equal(r.body.error.grund, "eltern_einwilligung");
  assert.equal(anthropicAufrufe.length, 0);
});
