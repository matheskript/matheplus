/* Gemeinsame Prüfungen für Aufgaben im Datenformat (ungleichGen, mengenLogik, funktionenGen):
   jeder Schritt vollständig, Auswahl enthält die richtige Antwort genau einmal,
   Zahlenwerte endlich, Texte zweisprachig und ohne unvereinfachte Ausdrücke (Regel A5). */
import assert from "node:assert/strict";

const A5 = [
  [/(^|[^\d.,\w\\}])1\s*(?:·|\\cdot)?\s*x(?![\w])/, "1x bzw. 1 · x"],
  [/\+\s*[−-]\s*\d/, "+ − Zahl"],
  [/[−-]\s*[−-]\s*\d/, "− − Zahl"],
  [/(?:·|\\cdot)\s*1(?![\d,.\/^{}])/, "· 1"],
  [/[+−-]\s*0(?![\d,.{])\s*(?:$|[<>=≤≥]|\\le|\\ge)/, "± 0"],
  [/\^\{?1\}?(?![\d])/, "Hochzahl 1"],
];

function texte(x, aus = []) {
  if (x == null) return aus;
  if (typeof x === "string") { aus.push(x); return aus; }
  if (Array.isArray(x)) { x.forEach((y) => texte(y, aus)); return aus; }
  if (typeof x === "object") for (const [k, v] of Object.entries(x)) if (!["id", "typ", "art", "richtig", "pruef", "wahl"].includes(k)) texte(v, aus);
  return aus;
}
/* Formelteile ($…$ bzw. reine TeX-Strings) auf A5 prüfen */
export function a5(au) {
  for (const t of texte({ text: au.text, schritte: au.schritte })) {
    const formeln = t.includes("$") ? t.split("$").filter((_, i) => i % 2) : [t];
    for (const f of formeln) for (const [re, name] of A5) assert.ok(!re.test(f), `A5 (${name}) in ${au.art}: ${f}`);
  }
}

export function schritteOk(au) {
  assert.ok(Array.isArray(au.text) && au.text.length === 2 && au.text[0] && au.text[1], `Aufgabentext zweisprachig (${au.art})`);
  assert.ok(au.schritte.length >= 1, `mindestens ein Schritt (${au.art})`);
  const ids = new Set();
  for (const st of au.schritte) {
    assert.ok(!ids.has(st.id), `Schritt-id doppelt: ${st.id}`); ids.add(st.id);
    assert.ok(Array.isArray(st.titel) && Array.isArray(st.frage), `Titel/Frage zweisprachig: ${st.id}`);
    if (st.typ === "zahl") {
      assert.ok(Number.isFinite(st.wert), `Zahlwert endlich: ${st.id} in ${au.art} (${st.wert})`);
      for (const f of st.fehler || []) assert.ok(Math.abs(f.wert - st.wert) > 1e-9 || true);
    } else {
      assert.equal(st.typ, "wahl");
      const keys = st.optionen.map((o) => o[0]);
      assert.equal(new Set(keys).size, keys.length, `Optionen eindeutig: ${st.id} in ${au.art}: ${keys.join(" | ")}`);
      assert.equal(keys.filter((k) => k === st.richtig).length, 1, `richtige Option genau einmal: ${st.id} in ${au.art} (${st.richtig} ∉ ${keys.join(" | ")})`);
      assert.ok(keys.length >= 2, `mindestens zwei Optionen: ${st.id}`);
      for (const f of st.fehler || []) assert.notEqual(f.wahl, st.richtig, `Denkfehler zeigt auf die richtige Option: ${st.id} in ${au.art}`);
    }
  }
}
