/* ======================================================================
   WURZEL – reine Geometrie (ohne React, ohne jsPDF, mit Node testbar)

   Regel: Eine Wurzel ist EIN Linienzug.
     kleiner Anstrich → Abstrich → Aufstrich → Überstrich
   Der Überstrich wächst ohne Versatz aus der Spitze des Aufstrichs und
   läuft in genau derselben Höhe über den ganzen Radikanden. Nie das
   Schriftzeichen „√“ mit einer Linie (border-top, overline, Unterstrich …)
   kombinieren: Wo der Glyph endet, hängt von Schrift, Größe und Gewicht ab –
   genau daraus entstehen die abgesetzten Überstriche.

   Benutzt von:
     - src/wurzelZeichen.jsx (App: WurzelZeichen, MitWurzeln)
     - src/func11.jsx        (PDF: wText / wBreite)
   ====================================================================== */

/* Maße in em (relativ zur Schriftgröße der Wurzel) */
export const WURZEL_MASS = {
  haken: 0.62,        // Breite von Anstrich bis Spitze, hier beginnt der Radikand
  luft: 0.14,         // Abstand Überstrich → Oberkante des Radikanden
  rechts: 0.08,       // Überstrich ragt etwas über den Radikanden hinaus
  anstrich: 0.42,     // Höhe des Anstrichs über der Unterkante
};

/* Strichstärke in Pixeln/Einheiten, wächst mit der Schrift, fetter bei fetter Schrift. */
export function wurzelStrich(schrift, gewicht = 400) {
  const s = Math.max(1, schrift * 0.066);
  return gewicht >= 600 ? s * 1.35 : gewicht <= 300 ? s * 0.85 : s;
}

/* Punkte des Linienzugs in einem Kasten der Breite w und Höhe h (y nach unten),
   Schriftgröße f, Strichstärke s. Der erste Punkt ist der Anfang des Anstrichs,
   der letzte das rechte Ende des Überstrichs. Spitze und Überstrich liegen exakt
   auf derselben Höhe oben = s / 2. */
export function wurzelPunkte({ w, h, f, s }) {
  const oben = s / 2;
  const unten = h - s / 2;
  const hak = WURZEL_MASS.haken * f;
  const yAn = Math.max(oben + 0.2 * f, unten - WURZEL_MASS.anstrich * f);
  return [
    [0.04 * f + s / 2, yAn + 0.07 * f],   // Anstrich: Anfang
    [0.17 * f, yAn],                      // Anstrich: Spitze
    [0.36 * f, unten],                    // Abstrich: tiefster Punkt
    [hak - 0.04 * f, oben],               // Aufstrich: Spitze = Beginn des Überstrichs
    [Math.max(w - s / 2, hak), oben],     // Überstrich: Ende
  ];
}

/* SVG-Pfad aus den Punkten */
export function wurzelPfad(masse) {
  return wurzelPunkte(masse).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
}

/* ---------- Klartext mit Wurzeln ----------
   Steuerzeichen markieren eine Wurzel in einem Klartext (PDF):
   ANF Radikand END. Ein Index (n-te Wurzel) steht als Hochzahl davor. */
export const W_ANF = "\u0001";
export const W_END = "\u0002";

/* Zerlegt Text mit Markierungen in Stücke: "text" oder { wurzel: [...Stücke] } */
export function wurzelStuecke(text) {
  let i = 0;
  const lies = (bisEnde) => {
    const teile = [];
    let t = "";
    while (i < text.length) {
      const ch = text[i];
      if (ch === W_END) { i++; if (bisEnde) break; continue; }
      if (ch === W_ANF) {
        i++;
        if (t) { teile.push(t); t = ""; }
        teile.push({ wurzel: lies(true) });
        continue;
      }
      t += ch; i++;
    }
    if (t) teile.push(t);
    return teile;
  };
  return lies(false);
}

/* Verschachtelungstiefe (√ in √ …) */
export function wurzelTiefe(stuecke) {
  let d = 0;
  for (const s of stuecke) if (typeof s !== "string") d = Math.max(d, 1 + wurzelTiefe(s.wurzel));
  return d;
}

/* Liest einen Radikanden nach einem „√“ in Klartext:
   „√(…)“ → Inhalt der Klammer (Klammern entfallen, der Überstrich ersetzt sie),
   „√12“, „√x“, „√2,5“, „√a²“ → das zusammenhängende Stück.
   Liefert [radikand, neueStelle] oder null, wenn nichts Sinnvolles folgt. */
const HOCH = "⁰¹²³⁴⁵⁶⁷⁸⁹⁻";
export function radikandLesen(text, i) {
  if (text[i] === "(") {
    let tiefe = 0;
    for (let j = i; j < text.length; j++) {
      if (text[j] === "(") tiefe++;
      else if (text[j] === ")") { tiefe--; if (tiefe === 0) return [text.slice(i + 1, j), j + 1]; }
    }
    return null;
  }
  const m = /^(?:\d+(?:[.,]\d+)?|[a-zA-Zπ](?![a-zA-Z]))[⁰¹²³⁴⁵⁶⁷⁸⁹]*/.exec(text.slice(i));
  if (!m) return null;
  let j = i + m[0].length;
  // Indizes direkt am Buchstaben (x₁) gehören dazu
  while (j < text.length && /[₀-₉]/.test(text[j])) j++;
  return [text.slice(i, j), j];
}

/* Zerlegt Klartext mit „√“ in Stücke wie wurzelStuecke: "text" | { wurzel, index }.
   Ein Index aus hochgestellten Ziffern direkt vor „√“ (∛ bzw. „³√“) wird erkannt. */
export function klartextWurzeln(text) {
  const teile = [];
  let t = "", i = 0;
  while (i < text.length) {
    const ch = text[i];
    const kubik = ch === "∛" ? "3" : ch === "∜" ? "4" : null;
    if (ch === "√" || kubik) {
      const r = radikandLesen(text, i + 1);
      if (r) {
        let index = kubik;
        // „³√8“: Hochzahl vor dem Zeichen ist der Index
        if (!index) {
          const m = /[²³⁴⁵⁶⁷⁸⁹]+$/.exec(t);
          if (m && (t.length === m[0].length || /[\s(=·±+−-]$/.test(t.slice(0, -m[0].length)))) {
            index = [...m[0]].map((z) => HOCH.indexOf(z)).join("");
            t = t.slice(0, -m[0].length);
          }
        }
        if (t) { teile.push(t); t = ""; }
        teile.push({ wurzel: klartextWurzeln(r[0]), index });
        i = r[1];
        continue;
      }
    }
    t += ch; i++;
  }
  if (t) teile.push(t);
  return teile;
}

/* Klartext → Text mit Markierungen (für das PDF) */
export function klartextMarkieren(text) {
  const raus = (teile) => teile.map((p) => (typeof p === "string" ? p
    : (p.index ? [...String(p.index)].map((z) => HOCH[+z] || z).join("") : "") + W_ANF + raus(p.wurzel) + W_END)).join("");
  return raus(klartextWurzeln(text));
}
