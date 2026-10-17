/* ======================================================================
   mathildaKontext.js – Mathildas Gedächtnis und Grundregeln (reine Logik, kein React).

   Aus dem Lernstand (func6: LERN) entsteht ein kompakter Textauszug (rund 300 Token):
   Klasse, Ziel, Lernpfad-Stand, häufigste Fehlertypen, zuletzt geübtes Thema,
   Zahl der Blattanalysen. Dazu der feste Systemprompt: sokratisch, Regel A5,
   Werkzeuge nutzen statt selbst zu rechnen. Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { FEHLERTYPEN, THEMEN, normiere, wiederkehrende, einzelne } from "./trainingDaten.js";
import { pfadKurztext, normierePfad } from "./lernpfade.js";
import { anredeHinweis } from "./rollenLogik.js";

const TAG = 86400000;

/* Kurzer Textauszug des Lernstands. `L` ist LERN (oder ein Snapshot), `profil` das Kontoprofil (optional). */
export function lernstandAuszug(L, { profil = null, blattanalysen = 0, jetzt = Date.now() } = {}) {
  const zeilen = [];
  const name = (profil && profil.name) || (L && L.profil && L.profil.name) || "";
  const klasse = (profil && profil.klasse) || (L && L.profil && L.profil.klasse) || null;
  zeilen.push(`Schüler: ${name ? name.split(" ")[0] : "unbekannt"}${klasse ? `, Klasse ${klasse}` : ""}${profil && profil.schulform ? ` (${profil.schulform})` : ""}.`);
  const P = L ? normierePfad(L.pfad) : null;
  if (P) zeilen.push(pfadKurztext(P, jetzt)); else zeilen.push("Noch kein Lernpfad angelegt.");
  const T = normiere(L ? L.training : null);
  const wk = wiederkehrende(T).slice(0, 3).map((f) => `${FEHLERTYPEN[f.id].name} (${f.n}×)`);
  const ez = einzelne(T).slice(0, 2).map((f) => FEHLERTYPEN[f.id].name);
  if (wk.length) zeilen.push(`Wiederkehrende Fehlertypen: ${wk.join(", ")}.`);
  else if (ez.length) zeilen.push(`Einzelne Fehler zuletzt: ${ez.join(", ")}.`);
  if (T.zuletzt && THEMEN[T.zuletzt]) {
    const s = T.themen[T.zuletzt];
    zeilen.push(`Zuletzt geübt: ${THEMEN[T.zuletzt].name}${s && s.n ? ` (${s.ok} von ${s.n} richtig)` : ""}.`);
  }
  const tage = Object.keys((L && L.aktivitaet) || {}).filter((d) => jetzt - Date.parse(d) < 7 * TAG).length;
  if (tage) zeilen.push(`Aktiv an ${tage} der letzten 7 Tage.`);
  if (blattanalysen) zeilen.push(`Blattanalysen bisher: ${blattanalysen}.`);
  return zeilen.join("\n");
}

export const REGELN_MATHILDA = `Du bist Mathilda, die Tutorin des Lernsystems Matheskript von Mythos Mathe (Gymnasium, Klasse 8 bis Abitur).
Haltung: Mathe ist kein Talent, sondern ein System. Du bist warm, knapp und ehrlich; nie herablassend, kein Lob-Geschwafel.

Sokratisch, immer in dieser Reihenfolge:
1. Rückfrage: Was weiß der Schüler schon, was hat er versucht? Eine Frage, nicht drei.
2. Hinweis: die Regel oder der nächste kleine Schritt, ohne das Ergebnis.
3. Teilschritt: den ersten Schritt gemeinsam, den Rest macht der Schüler.
4. Lösung nur, wenn er ausdrücklich darum bittet. Dann vollständig, Zeile für Zeile.
Pro Antwort höchstens vier kurze Sätze oder eine kurze Rechnung. Keine Vorrede.

Rechnen: Du rechnest nie im Kopf. Für Ableitungen, Nullstellen, Extrempunkte, Funktionswerte, Vereinfachungen,
Binomialverteilung und Hypothesentests benutzt du die Werkzeuge und nennst nur, was sie liefern.
Hast du keine Werkzeuge, sagst du, dass du nachrechnen lassen würdest, und bleibst bei der Methode.

Schreibweise (Regel A5): Nichts bleibt unvereinfacht stehen. Kein 1x, kein x^1, kein + 0, kein + −; eine Zeile endet nie auf
einem unvereinfachten Ausdruck. Formeln in LaTeX zwischen Dollarzeichen, etwa $3x^2 - 3$.
Papier: Blankopapier, schwarzer Stift, Abstand um Plus und Minus auf der Hauptebene, Produkte eng (2ax).

Grenzen: Du prognostizierst keine Noten. Du bewertest Gedanken, nie die Person. Bei Themen außerhalb der Mathematik
leitest du freundlich zurück. Antworte auf Deutsch (außer die Anweisung LANGUAGE sagt Englisch).`;

/* Kompletter Systemprompt für einen Chat-Aufruf */
export function mathildaSystem({ L = null, profil = null, blattanalysen = 0, aufgabe = null, jetzt = Date.now() } = {}) {
  const teile = [REGELN_MATHILDA, anredeHinweis(profil && profil.geschlecht), "Was du über diesen Schüler weißt (aus der App, nicht nachfragen):", lernstandAuszug(L, { profil, blattanalysen, jetzt })];
  if (aufgabe) {
    const a = [];
    if (aufgabe.text) a.push(`Aktuelle Aufgabe: ${String(aufgabe.text).replace(/\$/g, "")}`);
    if (aufgabe.eingabe) a.push(`Bisherige Eingabe des Schülers: ${aufgabe.eingabe}`);
    if (aufgabe.regeln && aufgabe.regeln.length) a.push(`Passende Regeln: ${aufgabe.regeln.join("; ")}`);
    if (aufgabe.loesung) a.push("Die Musterlösung kennst du, nennst sie aber nur auf ausdrücklichen Wunsch.");
    if (aufgabe.loesung) a.push(`Musterlösung (geheim): ${String(aufgabe.loesung).replace(/\$/g, "")}`);
    teile.push(a.join("\n"));
  }
  return teile.filter(Boolean).join("\n\n");
}
