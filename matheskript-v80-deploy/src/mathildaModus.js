/* ======================================================================
   Mathilda-Modus – reine Logik (ohne React, testbar mit Node)
   Der Schüler löst eine Trainingsaufgabe auf weißem Blankopapier mit
   schwarzem Stift, fotografiert nur diese eine Aufgabe und schickt sie an
   Mathilda. Mathilda kennt die richtige Lösung, verrät sie aber nicht:
   Sie prüft Ergebnis und Weg und nennt höchstens zwei Hebel nach dem
   Pen-&-Paper-Prüfkatalog.
   Oberfläche: funcMathildaModus.jsx.
   ====================================================================== */

export const MODUS_ZAEHLER = "matheplus-mathilda-modus";

const s = (x) => (x === null || x === undefined ? "" : String(x));
export const ohneDollar = (t) => s(t).replace(/\$/g, "").replace(/\s+/g, " ").trim();

/* Für welche Aufgaben gibt es den Modus? Alles, was man rechnet –
   nicht für Auswahlaufgaben (dort gibt es nichts aufzuschreiben). */
export function modusMoeglich(a) {
  return !!a && a.typ !== "wahl" && Array.isArray(a.loesung) && a.loesung.length > 0 && s(a.text).trim() !== "";
}

/* Die Formeln einer Aufgabe ($…$) – das, was oben aufs Blatt kommt.
   Kurze Bezeichner wie „$p$“ oder „$x$“ zählen nicht. */
export function formelnAus(text) {
  const t = s(text);
  const out = [];
  const re = /\$([^$]+)\$/g;
  let m;
  while ((m = re.exec(t))) {
    const f = m[1].trim();
    if (f.length >= 4 && /[=+\-−·^(\\]|\d[a-z]/i.test(f)) out.push(f);
  }
  return out;
}

/* Richtiger Wert in deutscher Schreibweise (nur für Mathilda, nie angezeigt) */
export function wertText(a) {
  if (!a || a.wert === undefined || a.wert === null) return "";
  if (typeof a.wert === "number") {
    const r = Math.round(a.wert * 1e6) / 1e6;
    return String(r).replace(".", ",").replace("-", "−") + (a.einheit ? ` ${a.einheit}` : "");
  }
  return s(a.wert);
}

export const MODUS_REGELN = `Mathilda-Modus (eine Trainingsaufgabe, auf Papier gelöst)
Du bekommst das Foto EINER Aufgabe, die ein Schüler mit schwarzem Stift auf weißem Blankopapier gerechnet hat. Du kennst die Aufgabe und die richtige Lösung.

Vorgehen in GENAU dieser Reihenfolge:
1. Abschreiben: Jede Zeile als Text. Unsichere Stellen als "unklar" – dort nie einen Fehler behaupten. Ist das Foto unleserlich, zu dunkel oder zeigt es eine andere Aufgabe: "neuesFoto": true und kurz sagen, warum. Nicht raten.
2. Ergebnis: Lies das Endergebnis des Schülers ab und vergleiche es mit der richtigen Lösung (gleichwertige Schreibweisen zählen als richtig: 0,5 = 1/2, x = 4 = L = {4}).
3. Weg: Wo bricht die Rechnung ZUERST? Nur diesen einen Schritt nennen, keine Folgefehler. Stimmt alles, bleibt "fehler" leer.
4. Pen & Paper (Prüfkatalog): Ein Schritt pro Zeile, Gleichheitszeichen untereinander (A6) · nichts unvereinfacht stehen lassen (A5) · Abstand um + und − auf oberster Ebene, eng innerhalb eines Terms (A1/A2) · Malzeichen nur gegen Missverständnisse (A4) · Nebenrechnung in einer Box (A7) · Ergebnis im Kasten, vollständig vereinfacht (A8). Karo- oder Linienpapier immer ansprechen (B1).

STRENG:
- Verrate NIE die richtige Lösung und rechne die Aufgabe nicht vor. Ist das Ergebnis falsch, zeige auf die Stelle und stelle eine Frage, die den Schüler selbst draufbringt.
- Erst Gelungenes, dann höchstens ZWEI Hebel. Bewertet wird das Blatt, nie der Mensch („hier fehlt dir Platz“, nicht „deine Schrift ist schlecht“).
- Kurz, sachlich, freundlich, duzen. Mathematik im Text als einfacher Text (x = 4, 2x + 6), kein LaTeX.

Antworte AUSSCHLIESSLICH mit diesem JSON, ohne Markdown, ohne Vorrede:
{"neuesFoto":false,"grund":"nur bei neuesFoto, sonst leer","zeilen":[{"t":"Zeile als Text","s":"ok|fehler|unklar"}],"ergebnis":"Endergebnis des Schülers, wie es dasteht, oder leer","stimmt":true|false|null,"fehler":{"zeile":Zeilennummer ab 1 oder null,"was":"was genau bricht, ohne die Lösung zu verraten"},"frage":"eine Frage, die zum nächsten Gedanken führt, oder leer","papier":"blanko|karo|liniert|unklar","gelungen":"was schon gut ist","hebel":[{"titel":"kurz","text":"ein bis zwei Sätze"}],"aufgabe":"genau eine Stelle, die der Schüler jetzt selbst neu schreibt"}
Halte jede Angabe unter 160 Zeichen, "zeilen" höchstens 14 Einträge.`;

export function modusPrompt(a) {
  const loesung = (a && Array.isArray(a.loesung) ? a.loesung : []).map(ohneDollar).filter(Boolean);
  return [
    `AUFGABE: ${ohneDollar(a && a.text)}`,
    a && a.einheit ? `EINHEIT DER ANTWORT: ${a.einheit}` : "",
    `RICHTIGE ANTWORT (geheim, nie verraten): ${wertText(a) || "siehe Lösungsweg"}`,
    loesung.length ? `MUSTER-LÖSUNGSWEG (geheim, nur zum Vergleichen):\n${loesung.map((z, i) => `${i + 1}. ${z}`).join("\n")}` : "",
    "",
    "Prüfe jetzt das Foto nach den Regeln des Mathilda-Modus und antworte nur mit dem JSON.",
  ].filter((x) => x !== "").join("\n");
}

const kurz = (x, n = 220) => ohneDollar(x).slice(0, n);

/* Antwort von Mathilda in eine sichere, vollständige Form bringen */
export function rueckmeldungLesen(j) {
  if (!j || typeof j !== "object") return { lesbar: false, neuesFoto: true, grund: "Mathildas Antwort war nicht lesbar. Bitte versuch es noch einmal.", zeilen: [], hebel: [] };
  const zeilen = (Array.isArray(j.zeilen) ? j.zeilen : []).slice(0, 14)
    .map((z) => (typeof z === "string" ? { t: kurz(z, 120), s: "ok" } : { t: kurz(z && z.t, 120), s: ["ok", "fehler", "unklar"].includes(z && z.s) ? z.s : "ok" }))
    .filter((z) => z.t);
  const hebel = (Array.isArray(j.hebel) ? j.hebel : []).slice(0, 2)
    .map((h) => (typeof h === "string" ? { titel: "", text: kurz(h) } : { titel: kurz(h && h.titel, 60), text: kurz(h && h.text) }))
    .filter((h) => h.text || h.titel);
  const f = j.fehler && typeof j.fehler === "object" ? j.fehler : {};
  const zeileNr = Number.isInteger(f.zeile) && f.zeile >= 1 && f.zeile <= zeilen.length ? f.zeile : null;
  const neuesFoto = j.neuesFoto === true || (zeilen.length === 0 && !s(j.ergebnis).trim());
  return {
    lesbar: !neuesFoto,
    neuesFoto,
    grund: kurz(j.grund) || (neuesFoto ? "Mathilda konnte die Rechnung auf dem Foto nicht lesen. Fotografiere gerade von oben, bei gutem Licht, nur diese eine Aufgabe." : ""),
    zeilen,
    ergebnis: kurz(j.ergebnis, 80),
    stimmt: j.stimmt === true ? true : j.stimmt === false ? false : null,
    fehler: f.was ? { zeile: zeileNr, was: kurz(f.was) } : null,
    frage: kurz(j.frage),
    papier: ["blanko", "karo", "liniert"].includes(j.papier) ? j.papier : "unklar",
    gelungen: kurz(j.gelungen),
    hebel,
    aufgabe: kurz(j.aufgabe),
  };
}

/* Endergebnis des Schülers als Eingabe fürs Antwortfeld: „x = 4“ → „4“, „L = {−2,5}“ → „−2,5“.
   Nur wenn genau eine Zahl übrig bleibt – sonst null. */
export function ergebnisAlsEingabe(t) {
  let x = s(t).replace(/\s+/g, "");
  if (!x) return null;
  if ((x.match(/=/g) || []).length > 1 || /;|und|and|oder|or|∨|∧/i.test(x)) return null;   // mehrere Lösungen: nicht übernehmen
  x = x.replace(/^.*=/, "").replace(/^\{|\}$/g, "").replace(/[a-zA-Z€%°²³]+$/u, "");
  x = x.replace(/−/g, "-");
  if (!/^-?\d+([.,]\d+)?(\/-?\d+)?$/.test(x)) return null;
  return x.replace(/^-/, "−");
}
