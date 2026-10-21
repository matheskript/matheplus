/* ======================================================================
   TRAININGSZENTRUM – die eine Steuerdatei für alle Trainings
   Reine Daten und Logik (kein React): base- und func-Dateien dürfen sie
   importieren. Die Oberfläche steht in funcTrainingszentrum.jsx (Menü)
   und funcTrainingsSession.jsx (Vollbild-Session).

   Eine SESSION ist eine Liste von SEITEN, die im Vollbild nacheinander
   erscheinen. Seitenarten:
     { art: "intro",     titel, text, punkte: [..] }      – Einstieg
     { art: "aufgaben",  gen: ["abl-potenz", …] }          – Generator-Aufgaben (trainingDaten.js)
     { art: "film",      film: "produkt" }                 – Motion-Video (FILME)
     { art: "werkzeug",  ansicht: "klausur" }              – ein Werkzeug eingebettet (EINBETTBAR)
     { art: "auswertung" }                                 – Abschluss mit Ergebnis
   „Manchmal der Klausurgenerator, manchmal ein Motion-Video“ = hier eine
   Zeile mehr oder weniger. Wächter: tests/trainingszentrum.test.mjs.
   ====================================================================== */
import { BEREICHE, WERKZEUGE, passtStufe, werkzeug } from "./werkzeuge.js";

export const SPEICHER = "matheplus-trainingszentrum";

/* ---------- Motion-Videos (Erkläranimationen) ---------- */
export const FILME = {
  produkt: { titel: "Produktregel am Rechteck", zeile: "Warum beim Ableiten zwei Streifen entstehen", dauer: 22 },
  kette: { titel: "Kettenregel als Verstärkerkette", zeile: "Warum die innere Ableitung nie fehlen darf", dauer: 26 },
  stamm: { titel: "Stammfunktion: Ableiten rückwärts", zeile: "Warum durch den neuen Exponenten geteilt wird – und warum + C", dauer: 26 },
  integral: { titel: "Fläche unter der Kurve", zeile: "Vom Streifen-Zählen zu F(b) − F(a)", dauer: 25 },
  wurzel: { titel: "Wurzel aus vierstelligen Zahlen", zeile: "Mit den Quadratzahlen von 1 bis 10 zur Wurzel im Kopf", dauer: 28 },
  mathilda: { titel: "Mathilda-Modus", zeile: "Blanko statt Karo, schwarzer Stift, ein Schritt pro Zeile – dann das Foto", dauer: 28 },
};

/* ---------- Einbettbare Trainings, die nicht in WERKZEUGE stehen ---------- */
export const EXTRA = {
  klausur: { name: "Klausurgenerator", kurz: "Klausur", zeile: "Drei Aufgaben mit Uhr, Rückmeldung erst nach der Abgabe", zeichen: "⏱", bereich: "pruefung", dauer: 45 },
  abiketten: { name: "Abi-Ketten", kurz: "Abi-Ketten", zeile: "Eine Abi-Aufgabe durch mehrere Werkzeuge – mit Punkten", zeichen: "⛓", bereich: "pruefung", dauer: 30 },
  abisaetze: { name: "Abi-Sätze", kurz: "Abi-Sätze", zeile: "Teil A ohne Hilfsmittel, Teil B mit WTR – 60 Verrechnungspunkte", zeichen: "60", bereich: "pruefung", dauer: 90 },
};

/* ---------- Programme: kuratierte Abläufe ---------- */
export const PROGRAMME = [
  { id: "ableiten-zehn", titel: "Ableiten in zehn Minuten", zeile: "Film, drei Aufgaben, dann der Trainer", bereich: "analysis", stufe: "ober", dauer: 10, zeichen: "f′",
    seiten: [
      { art: "intro", titel: "Ableiten in zehn Minuten", text: "Erst siehst du die Produktregel in Bewegung, dann rechnest du drei Aufgaben – und am Ende übst du im Ableitungstrainer, bis es sitzt.",
        punkte: ["Motion-Video: Produktregel", "Drei Aufgaben mit Rückmeldung", "Ableitungstrainer mit Mathilda-Modus"] },
      { art: "film", film: "produkt" },
      { art: "aufgaben", gen: ["abl-potenz", "abl-kette", "abl-exp"] },
      { art: "werkzeug", ansicht: "ableitungstrainer" },
      { art: "auswertung" },
    ] },
  { id: "kettenregel", titel: "Kettenregel verstehen", zeile: "Innen und außen – mit Film und Aufgaben", bereich: "analysis", stufe: "ober", dauer: 8, zeichen: "u(v)",
    seiten: [
      { art: "film", film: "kette" },
      { art: "aufgaben", gen: ["abl-kette", "abl-exp", "abl-kette"] },
      { art: "auswertung" },
    ] },
  { id: "integrale-start", titel: "Vom Ableiten zum Integral", zeile: "Stammfunktion, Hauptsatz, Fläche", bereich: "analysis", stufe: "ober", dauer: 12, zeichen: "∫",
    seiten: [
      { art: "intro", titel: "Vom Ableiten zum Integral", text: "Zwei kurze Filme zeigen dir, was eine Stammfunktion ist und wie der Hauptsatz daraus eine Fläche macht. Dann rechnest du selbst.",
        punkte: ["Film: Stammfunktion", "Film: Hauptsatz", "Zwei Aufgaben, dann der Trainer"] },
      { art: "film", film: "stamm" },
      { art: "film", film: "integral" },
      { art: "aufgaben", gen: ["int-grenzen", "int-flaeche"] },
      { art: "werkzeug", ansicht: "integrale" },
      { art: "auswertung" },
    ] },
  { id: "pen-paper", titel: "Auf Papier mit Mathilda", zeile: "Film zum Mathilda-Modus, dann drei Aufgaben aufs Blatt", bereich: "alle", stufe: "beide", dauer: 12, zeichen: "✎",
    seiten: [
      { art: "film", film: "mathilda" },
      { art: "aufgaben", gen: ["gl-linear", "ter-binom", "abl-potenz"] },
      { art: "auswertung" },
    ] },
  { id: "gleichungen-fit", titel: "Gleichungen fit", zeile: "Linear, quadratisch, ausklammern – dann der Löser", bereich: "gleichungen", stufe: "beide", dauer: 10, zeichen: "x=?",
    seiten: [
      { art: "aufgaben", gen: ["gl-linear", "gl-quadrat", "gl-ausklammern"] },
      { art: "werkzeug", ansicht: "gleichungen" },
      { art: "auswertung" },
    ] },
  { id: "wurzeln-potenzen", titel: "Wurzeln und Potenzen", zeile: "Potenzgesetze, Wurzeln, Logarithmen – dann Terme", bereich: "gleichungen", stufe: "beide", dauer: 8, zeichen: "√",
    seiten: [
      { art: "aufgaben", gen: ["pot-gesetz", "pot-wurzel", "pot-log"] },
      { art: "werkzeug", ansicht: "terme" },
      { art: "auswertung" },
    ] },
  { id: "brueche-grund", titel: "Brüche sicher", zeile: "Addieren, dividieren – dann Brüche rechnen", bereich: "bruchrechnen", stufe: "mittel", dauer: 8, zeichen: "½",
    seiten: [
      { art: "aufgaben", gen: ["bru-add", "bru-div", "bru-add"] },
      { art: "werkzeug", ansicht: "bruchrechnen" },
      { art: "auswertung" },
    ] },
  { id: "stochastik-kurz", titel: "Stochastik kompakt", zeile: "Pfadregel, Bernoulli, Normalverteilung", bereich: "stochastik", stufe: "ober", dauer: 10, zeichen: "P(X)",
    seiten: [
      { art: "aufgaben", gen: ["wkt-pfad", "ber-genau", "ber-grenze", "nv-kleiner"] },
      { art: "werkzeug", ansicht: "bernoulli" },
      { art: "auswertung" },
    ] },
  { id: "generalprobe", titel: "Generalprobe", zeile: "Eine ganze Klausur mit Uhr – wie am Tag davor", bereich: "pruefung", stufe: "ober", dauer: 45, zeichen: "⏱",
    seiten: [
      { art: "intro", titel: "Generalprobe", text: "Drei Aufgaben im Klausurformat, eine Uhr, keine Rückmeldung zwischendurch. Leg Blanko-Papier und einen schwarzen Stift bereit.",
        punkte: ["Rückmeldung erst nach der Abgabe", "Rechne auf Papier, tippe nur Ergebnisse", "Danach: Fehler ins Training übernehmen"] },
      { art: "werkzeug", ansicht: "klausur" },
      { art: "auswertung" },
    ] },
];

/* ---------- Menü ---------- */
/* Drei Ebenen (21.10.2026): Heute (dein Plan, Wiederholungen, Fehler, Weitermachen) · Themen (alle Werkzeuge, ein Ort)
   · Prüfung (Klassenarbeit und Abitur). Programme (PROGRAMME) bleiben als Daten erhalten, sind aber ausgeblendet,
   bis sie fachlich abgenommen sind (PROGRAMME_SICHTBAR). */
export const PROGRAMME_SICHTBAR = false;
export const REITER = [
  { id: "heute", name: "Heute", zeile: "Dein Plan, deine Wiederholungen, deine Fehler" },
  ...(PROGRAMME_SICHTBAR ? [{ id: "programme", name: "Programme", zeile: "Film, Aufgaben, Trainer – in einer Session" }] : []),
  { id: "themen", name: "Themen", zeile: "Alle Werkzeuge nach Bereich – du rechnest selbst, die App prüft" },
  { id: "pruefung", name: "Prüfung", zeile: "Klassenarbeit und Abitur" },
];
export const REITER_IDS = REITER.map((r) => r.id);

/* Alle Werkzeuge (nicht nur Trainieren) nach Bereich, für die Themen-Liste; etikett bleibt je Werkzeug sichtbar */
export function themenBereiche(stufe = "alle") {
  return BEREICHE
    .map((b) => ({ id: b.id, titel: b.titel, werkzeuge: b.stationen.flatMap((s) => s.werkzeuge).filter((id, i, l) => l.indexOf(id) === i).map(werkzeug).filter((w) => w && passtStufe(w, stufe)) }))
    .filter((b) => b.werkzeuge.length > 0);
}

/* Bereiche mit Trainier-Werkzeugen, in der Reihenfolge der Startseite */
export function trainierBereiche(stufe = "alle") {
  return BEREICHE
    .map((b) => ({ id: b.id, titel: b.titel, werkzeuge: b.stationen.flatMap((s) => s.werkzeuge).map(werkzeug).filter((w) => w && w.etikett === "trainieren" && passtStufe(w, stufe)) }))
    .filter((b) => b.werkzeuge.length > 0);
}

/* Alle Trainier-Werkzeuge (ohne Stufe) */
export const trainierWerkzeuge = () => Object.keys(WERKZEUGE).map(werkzeug).filter((w) => w.etikett === "trainieren");

/* Programme nach Stufe gefiltert */
export const programmeFuer = (stufe = "alle") => PROGRAMME.filter((p) => passtStufe({ stufe: p.stufe, unter: false }, stufe === "unter" ? "alle" : stufe));

/* ---------- Sessions bauen ---------- */
export function sessionAusProgramm(id) {
  const p = PROGRAMME.find((x) => x.id === id);
  return p ? { id: `programm:${p.id}`, titel: p.titel, kicker: "Programm", dauer: p.dauer, seiten: p.seiten.map((s) => ({ ...s })) } : null;
}

export function sessionAusWerkzeug(id) {
  const w = werkzeug(id);
  if (w) return { id: `werkzeug:${id}`, titel: w.name, kicker: "Werkzeug", dauer: null, seiten: [{ art: "werkzeug", ansicht: w.ziel.ansicht, titel: w.name }] };
  const e = EXTRA[id];
  if (e) return { id: `werkzeug:${id}`, titel: e.name, kicker: e.bereich === "pruefung" ? "Prüfung" : "Werkzeug", dauer: e.dauer, seiten: [{ art: "werkzeug", ansicht: id, titel: e.name }] };
  return null;
}

/* Eine Session aus fertigen Aufgaben (5 Minuten Mathe, Meine Fehler üben) */
export function sessionAusAufgaben(id, titel, aufgaben, kicker = "Heute") {
  return { id: `aufgaben:${id}`, titel, kicker, dauer: Math.max(3, Math.round(aufgaben.length * 1.2)), seiten: [{ art: "aufgaben", aufgaben }, { art: "auswertung" }] };
}

/* Session aus ihrer Kennung wiederherstellen (für „Weitermachen“) */
export function sessionVon(kennung) {
  if (!kennung || typeof kennung !== "string") return null;
  const [art, id] = kennung.split(":");
  if (art === "programm") return sessionAusProgramm(id);
  if (art === "werkzeug") return sessionAusWerkzeug(id);
  return null;
}

/* ---------- Seitenbeschriftung ---------- */
export function seitenTitel(s, i, n) {
  if (s.art === "intro") return s.titel || "Einstieg";
  if (s.art === "film") return (FILME[s.film] || {}).titel || "Film";
  if (s.art === "aufgaben") return "Aufgaben";
  if (s.art === "werkzeug") return s.titel || (werkzeug(s.ansicht) || EXTRA[s.ansicht] || {}).name || "Werkzeug";
  if (s.art === "auswertung") return "Auswertung";
  return `Seite ${i + 1} von ${n}`;
}
export const ART_NAMEN = { intro: "Einstieg", film: "Motion-Video", aufgaben: "Aufgaben", werkzeug: "Werkzeug", auswertung: "Auswertung" };

/* ---------- Auswertung über alle Aufgaben-Seiten ---------- */
export function auswertung(ergebnisse) {
  const alle = ergebnisse.flat();
  const n = alle.length;
  const richtig = alle.filter((z) => z && z.ok).length;
  const ohneHilfe = alle.filter((z) => z && z.ok && (z.hilfeEnde || 0) === 0).length;
  const typen = [...new Set(alle.filter((z) => z && z.gebucht && z.erstOk === false && z.typ).map((z) => z.typ))];
  return { n, richtig, ohneHilfe, typen, anteil: n ? richtig / n : null };
}

/* ---------- Letzte Session (für „Weitermachen“) ---------- */
export function zuletztLesen(speicher) {
  try {
    const v = JSON.parse(speicher.getItem(SPEICHER) || "null");
    return v && typeof v.kennung === "string" ? v : null;
  } catch (e) { return null; }
}
export function zuletztMerken(speicher, kennung, seite, fertig = false) {
  try { speicher.setItem(SPEICHER, JSON.stringify({ kennung, seite, fertig, zeit: Date.now() })); } catch (e) { /* privat */ }
}
