/* ======================================================================
   HAUPTMENÜ (Kopfleiste) – reine Daten und Logik, ohne React.
   Getestet in tests/hauptmenue.test.mjs. Oberfläche: funcHauptmenue.jsx.

   Aufbau oben: eine Kopfzeile mit Logo, Konto-Chip und ☰-Knopf. Das ☰-Menü enthält alles:
   Suche · Mathilda · Meine Kurse · Klasse ▾ · Mein Training · Mathematik (aufklappbar),
   darunter die Konto-Punkte und ganz unten Abmelden bzw. Anmelden.
   Das frühere Kopfmenü (Startseite, Landingpage, Sprache, Entwürfe) ist als
   „Arbeitsmenü“ in die Fußzeile gewandert (funcArbeitsmenue.jsx).
   ====================================================================== */
import { SCHULARTEN, klassenBoxen, kapitelFuer, hilfenFuer, kurseFuer, roemisch, stufeAusKlassenBox } from "./schulbuch.js";
import { ANGEBOT } from "./angebot.js";

/* ---------- Konto ---------- */
/* Pro gilt, solange profil.plan = "pro" und pro_bis nicht abgelaufen ist (wie PlanKarte in funcKontoRollen.jsx) */
export function istPro(profil, jetzt = new Date()) {
  if (!profil || profil.plan !== "pro") return false;
  return !profil.pro_bis || new Date(profil.pro_bis) > jetzt;
}

/* Art des Kontos für den Chip: „Trainings-Account“, „Eltern-Account“, „Lehrer-Account“ … */
export function kontoArt(profil) {
  const rolle = (profil && profil.rolle) || "schueler";
  const w = profil && profil.geschlecht === "w";
  if (rolle === "eltern") return "Eltern-Account";
  if (rolle === "lehrkraft") return w ? "Lehrerin-Account" : "Lehrer-Account";
  if (rolle === "nachhilfe") return w ? "Nachhilfelehrerin-Account" : "Nachhilfe-Account";
  return "Trainings-Account";
}

/* Konto-Punkte im ☰-Menü (unter den aufklappbaren Abschnitten) – einzeilig, je nach Rolle.
   Anmelden/Abmelden steht NICHT hier, sondern als letzter Punkt des Menüs (zugangEintrag). */
export function kontoEintraege(profil, angemeldet = true, cfg = ANGEBOT) {
  const pro = istPro(profil);
  /* Ohne Angebot „Pro“ (angebot.js) gibt es weder „Pro werden“ noch „Mein Plan · Pro“ */
  const proEintrag = !cfg.pro ? null : pro
    ? { id: "plan", name: "Mein Plan · Pro", ziel: { ansicht: "konto" } }
    : { id: "pro", name: "Pro werden", ziel: { ansicht: "konto" }, gold: true };
  if (!angemeldet) {
    return [
      { id: "fortschritt", name: "Mein Fortschritt", ziel: { ansicht: "profil" } },
      proEintrag,
      { id: "spenden", name: "Unterstützen", ziel: { ansicht: "spenden" } },
      { id: "datenschutz", name: "Datenschutz", ziel: { ansicht: "datenschutz" } },
      { id: "impressum", name: "Impressum", ziel: { ansicht: "impressum" } },
    ].filter(Boolean);
  }
  const rolle = (profil && profil.rolle) || "schueler";
  const liste = [{ id: "konto", name: "Mein Konto", ziel: { ansicht: "konto" } }];
  if (rolle === "eltern") liste.push({ id: "kinder", name: "Meine Kinder", ziel: { ansicht: "konto" } });
  if (rolle === "lehrkraft") liste.push({ id: "klassen", name: "Meine Klassen", ziel: { ansicht: "konto" } });
  if (rolle === "nachhilfe") liste.push({ id: "schueler", name: "Meine Schüler", ziel: { ansicht: "konto" } });
  if (rolle === "lehrkraft" || rolle === "nachhilfe") liste.push({ id: "arbeitsblatt", name: "Arbeitsblatt-Generator", ziel: { ansicht: "lehrerblatt" } });
  if (rolle === "schueler") {
    liste.push({ id: "fortschritt", name: "Mein Fortschritt", ziel: { ansicht: "profil" } });
    liste.push({ id: "bericht", name: "Wochenbericht", ziel: { ansicht: "bericht" } });
  }
  if (proEintrag) liste.push(proEintrag);
  liste.push({ id: "datenschutz", name: "Datenschutz", ziel: { ansicht: "datenschutz" } });
  /* Lehrkräfte haben statt des Impressums (steht in der Fußzeile) den Arbeitsblatt-Generator – höchstens 6 Punkte */
  if (rolle === "eltern") liste.push({ id: "impressum", name: "Impressum", ziel: { ansicht: "impressum" } });
  return liste;
}

/* Letzter Punkt ganz unten im ☰-Menü: Abmelden (mit Bestätigung) bzw. – ohne Konto – Anmelden */
export function zugangEintrag(angemeldet = true) {
  return angemeldet
    ? { id: "abmelden", name: "Abmelden", aktion: "abmelden" }
    : { id: "anmelden", name: "Anmelden", ziel: { ansicht: "konto" } };
}

/* ---------- Klasse ---------- */
const SCHULFORM_ZU_ART = { G8: "g8", G9: "g9", GMS: "gms" };

/* Klasse aus Profil (schulform, klasse) oder – ohne Konto – aus dem Quickfinder (schulart, klasse = Box-Id).
   Ergebnis: { schulart, box } oder null. Die Box ist immer eine gültige Klassenbox der Schulart. */
export function klasseErmitteln(profil, quickfinder) {
  const ausBox = (schulart, nr) => {
    const box = klassenBoxen(schulart).find((b) => b.klassen.includes(nr));
    return box ? { schulart, box: box.id } : null;
  };
  if (profil && SCHULFORM_ZU_ART[profil.schulform] && Number.isInteger(profil.klasse)) {
    const r = ausBox(SCHULFORM_ZU_ART[profil.schulform], profil.klasse);
    if (r) return r;
  }
  if (quickfinder && SCHULARTEN.some((s) => s.id === quickfinder.schulart) && quickfinder.klasse) {
    const box = klassenBoxen(quickfinder.schulart).find((b) => b.id === quickfinder.klasse);
    if (box) return { schulart: quickfinder.schulart, box: box.id };
  }
  return null;
}

/* Beschriftung des Knopfs: „Klasse 10 (G9)“, „Klasse 5/6 (G8)“, ohne Wahl „Meine Klasse“ */
export function klasseLabel(k) {
  if (!k) return "Meine Klasse";
  const s = SCHULARTEN.find((x) => x.id === k.schulart);
  const box = klassenBoxen(k.schulart).find((b) => b.id === k.box);
  return `Klasse ${box ? box.label : k.box} (${s ? s.name : "?"})`;
}

/* Inhalt des Klassen-Aufklappers: Kapitel wie im Schulbuch (mit Hilfen) und unsere Kurse dazu */
export function klassenInhalt(k) {
  if (!k) return { kapitel: [], kurse: [], bald: [], stufe: "alle" };
  const box = klassenBoxen(k.schulart).find((b) => b.id === k.box);
  const kapitel = kapitelFuer(k.schulart, k.box).map((c) => ({
    id: c.id,
    nr: roemisch(c.nr),
    titel: c.titel,
    hilfen: hilfenFuer(c.id).slice(0, 6),
    trainieren: { ansicht: "trainieren", kapitel: c.id, schulart: k.schulart, klasse: k.box },
  }));
  return { kapitel, kurse: kurseFuer(k.schulart, k.box, 4), bald: BALD_KURSE, stufe: stufeAusKlassenBox(box) };
}

/* ---------- Meine Kurse ---------- */
const KURSE_ALLE = [
  { id: "mckurs", name: "Mathe Abi Masterclass", zeile: "Kursbereich für Teilnehmer: Videos, Aufträge, Mathilda", ziel: { ansicht: "mckurs" } },
  { id: "diffkurs", name: "Differentialrechnung", zeile: "Schulbuch lesen und direkt trainieren", ziel: { ansicht: "diffkurs" } },
  { id: "vekkurs", name: "Vektoren, Geraden und Ebenen", zeile: "Heftkapitel lesen und trainieren", ziel: { ansicht: "vekkurs" } },
  { id: "penpaper", name: "Pen & Paper", zeile: "Sauber aufschreiben in neun Lektionen", ziel: { ansicht: "penpaperkurs" } },
  { id: "gleichkurs", name: "Gleichungen lernen", zeile: "Verstehen, rechnen, trainieren", ziel: { ansicht: "gleichkurs" } },
  { id: "headnumbers", name: "Head & Numbers", zeile: "Kopfrechnen mit Lernpfad", ziel: { ansicht: "headnumbers" } },
  { id: "textaufgaben", name: "Textaufgaben übersetzen", zeile: "Aus dem Text die Gleichung machen", ziel: { ansicht: "textaufgaben" } },
];
const BALD_KURSE_ALLE = [
  { id: "mathecheck", name: "Mathe checken", zeile: "Zwei Monate, ein System", bald: true },
  { id: "geometrie", name: "Kurs Geometrie", zeile: "Mittelstufe vom Winkel bis zum Körper", bald: true },
];
/* Ohne Angebot „Kurse“ (angebot.js): keine Masterclass und keine „Bald“-Platzhalter im Menü */
export const kurseListe = (cfg = ANGEBOT) => KURSE_ALLE.filter((k) => k.id !== "mckurs" || cfg.kurse);
export const baldListe = (cfg = ANGEBOT) => (cfg.kurse ? BALD_KURSE_ALLE : []);
export const KURSE = kurseListe();
export const BALD_KURSE = baldListe();

/* ---------- Die festen Menüs ---------- */
export const KI_MENUE = [
  { id: "blatt", name: "Blatt scannen", zeile: "Foto von deiner Rechnung – Mathilda prüft", ziel: { ansicht: "analyse", foto: "blatt" } },
  { id: "chat", name: "Mit Mathilda sprechen", zeile: "Tutor-Chat, der dich selbst draufkommen lässt", ziel: { ansicht: "analyse", foto: "chat" } },
  { id: "weg", name: "Rechenweg prüfen", zeile: "Wo genau ist der Fehler?", ziel: { ansicht: "analyse", foto: "weg" } },
  { id: "text", name: "Textaufgabe übersetzen", zeile: "Aus dem Text die Bedingungen", ziel: { ansicht: "textaufgaben", seite: "mathilda" } },
  { id: "briefkasten", name: "Klausurbriefkasten", zeile: "Zurückbekommene Arbeit einwerfen", ziel: { ansicht: "klausurbriefkasten" } },
];

export const TRAINING = [
  { id: "meintraining", name: "Mein Training", zeile: "Alles auf einen Blick", ziel: { ansicht: "meintraining" } },
  { id: "warmup", name: "5 Minuten Mathe", zeile: "Fünf kurze Aufgaben zum Aufwärmen", ziel: { ansicht: "warmup" } },
  { id: "fehler", name: "Meine Fehler üben", zeile: "Genau das, was bei dir öfter schiefgeht", ziel: { ansicht: "fehlertraining" } },
  { id: "plan", name: "Trainingsplan", zeile: "Bis zur Klassenarbeit, Tag für Tag", ziel: { ansicht: "trainingsplan" } },
  { id: "lernpfad", name: "Lernpfad", zeile: "Standortcheck und Wochenplan", ziel: { ansicht: "lernpfad" } },
  { id: "wiederholen", name: "Wiederholen", zeile: "Im richtigen Moment, bevor du es vergisst", ziel: { ansicht: "ebbinghaus" } },
  { id: "vorbereiten", name: "Klassenarbeit vorbereiten", zeile: "Termin eintragen, Generalprobe", ziel: { ansicht: "vorbereiten" } },
  { id: "nachbereiten", name: "Klassenarbeit nachbereiten", zeile: "Aus Fehlern einen Plan machen", ziel: { ansicht: "klausurnach" } },
  { id: "pruefung", name: "Prüfungsmodus", zeile: "Ohne Hilfen, mit Uhr", ziel: { ansicht: "pruefung" } },
];

const ABI = [
  { id: "abiketten", name: "Abi-Ketten", zeile: "Eine Abi-Aufgabe durch mehrere Werkzeuge", ziel: { ansicht: "abiketten" } },
  { id: "abisaetze", name: "Abi-Sätze", zeile: "Teil A und B im Abi-Format", ziel: { ansicht: "abisaetze" } },
  { id: "probeabi", name: "Probeabitur", zeile: "Mit Uhr und Notenpunkten", ziel: { ansicht: "abitur" } },
];

/* Mathematik: Schulmathematik (Startseite), Entdecken, Formelsammlung … – Abi nur für Oberstufe/ohne Klasse */
export function mathematikEintraege(stufe = "alle") {
  const liste = [
    { id: "schulmathe", name: "Schulmathematik", zeile: "Alle Bereiche von Klasse 5 bis 13", ziel: { ansicht: "start" } },
    { id: "entdecken", name: "Mathe entdecken", zeile: "Axiome, Pythagoras, Teilbarkeit – selbst herleiten", ziel: { ansicht: "entdecken" } },
    { id: "formeln", name: "Formelsammlung", zeile: "Jede Formel mit Bild, Beweis und Beispiel", ziel: { ansicht: "formeln", bereich: "analysis" } },
    { id: "kopf", name: "Kopfrechnen", zeile: "Plus, Mal, Quadrate, Primzahlen, Brüche", ziel: { ansicht: "headnumbers" } },
    { id: "gleichungen", name: "Gleichungen", zeile: "Verstehen, rechnen, trainieren", ziel: { ansicht: "gleichkurs" } },
    { id: "textaufgaben", name: "Textaufgaben", zeile: "Übersetzen lernen", ziel: { ansicht: "textaufgaben" } },
    { id: "operatoren", name: "Operatoren", zeile: "Was „bestimmen“, „zeigen“, „begründen“ verlangen", ziel: { ansicht: "operatoren" } },
    { id: "wettbewerbe", name: "Mathe-Wettbewerbe", zeile: "Bundeswettbewerb und Landeswettbewerbe", ziel: { ansicht: "bwm" } },
  ];
  if (stufe === "ober" || stufe === "alle") liste.push(...ABI.map((e) => ({ ...e, abi: true })));
  return liste;
}

/* Reihenfolge der aufklappbaren Abschnitte im ☰-Menü (die Suche steht als erste Zeile davor) */
export const LEISTE = [
  { id: "mathilda", name: "Mathilda" },
  { id: "kurse", name: "Meine Kurse" },
  { id: "klasse", name: null },          // Beschriftung aus klasseLabel()
  { id: "training", name: "Mein Training" },
  { id: "mathematik", name: "Mathematik" },
];

/* Welcher Leisten-Punkt ist auf der aktuellen Seite „aktiv“? */
export function aktiverPunkt(ansicht, foto) {
  if (ansicht === "analyse" || ansicht === "klausurbriefkasten") return "mathilda";
  if (ansicht === "textaufgaben" && foto === "mathilda") return "mathilda";
  if (KURSE.some((k) => k.ziel.ansicht === ansicht)) return "kurse";
  if (TRAINING.some((k) => k.ziel.ansicht === ansicht) || ansicht === "trainieren") return "training";
  if (mathematikEintraege("alle").some((k) => k.ziel.ansicht === ansicht && ansicht !== "start")) return "mathematik";
  return null;
}
