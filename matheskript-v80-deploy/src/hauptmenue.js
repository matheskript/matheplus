/* ======================================================================
   HAUPTMENÜ (Kopfleiste) – reine Daten und Logik, ohne React.
   Getestet in tests/hauptmenue.test.mjs. Oberfläche: funcHauptmenue.jsx.

   Aufbau oben: eine Kopfzeile mit Logo, Konto-Chip und ☰-Knopf. Das ☰-Menü enthält alles, was die App hat:
   Suche · Mathilda-Karte · Weitermachen · Klasse ▾ · Mathe-Training ▾ (alle Werkzeuge nach Stufe) ·
   Meine Kurse (Karten-Leiste) · Mein Training ▾ · Mathe entdecken ▾ · Formelsammlung ▾,
   darunter die Konto-Karte und ganz unten Abmelden bzw. Anmelden.
   Das frühere Kopfmenü (Startseite, Landingpage, Sprache, Entwürfe) ist als
   „Arbeitsmenü“ in die Fußzeile gewandert (funcArbeitsmenue.jsx).
   ====================================================================== */
import { SCHULARTEN, klassenBoxen, kapitelFuer, hilfenFuer, kurseFuer, roemisch, stufeAusKlassenBox } from "./schulbuch.js";
import { ANGEBOT } from "./angebot.js";
import { startBloecke, passtStufe, werkzeug, wo } from "./werkzeuge.js";
import { ABI_MENUE, ENTDECKEN_MENUE, FORMEL_MENUE } from "./startMenues.js";

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
    ? { id: "plan", name: "Mein Plan · Pro", ziel: { ansicht: "konto", abschnitt: "plan" } }
    : { id: "pro", name: "Pro werden", ziel: { ansicht: "konto", abschnitt: "plan" }, gold: true };
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
  if (rolle === "eltern") liste.push({ id: "kinder", name: "Meine Kinder", ziel: { ansicht: "konto", abschnitt: "kinder" } });
  if (rolle === "lehrkraft") liste.push({ id: "klassen", name: "Meine Klassen", ziel: { ansicht: "konto", abschnitt: "lehr" } });
  if (rolle === "nachhilfe") liste.push({ id: "schueler", name: "Meine Schüler", ziel: { ansicht: "konto", abschnitt: "lehr" } });
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
    seite: { ansicht: "kapitel", kapitel: c.id, schulart: k.schulart, klasse: k.box },
  }));
  return { kapitel, kurse: kurseFuer(k.schulart, k.box, 4), bald: BALD_KURSE, stufe: stufeAusKlassenBox(box) };
}

/* ---------- Meine Kurse ---------- */
/* Im Menü als Karten-Leiste (funcHauptmenue.jsx gibt jeder Karte Farbe und Zeichen über die id) */
const KURSE_ALLE = [
  { id: "abizentrum", name: "Abi-Zentrum", zeile: "Prüfungsformat, Plan, Mia und Lernpartner", ziel: { ansicht: "abi" } },
  { id: "mckurs", name: "Mathe Abi Masterclass", zeile: "Kursbereich für Teilnehmer: Videos, Aufträge, Mathilda", ziel: { ansicht: "mckurs" } },
  { id: "unterstufe", name: "Unterstufe", zeile: "Klasse 5 und 6: der ganze Stoff, lesen und gleich üben", ziel: { ansicht: "unterstufe" } },
  { id: "diffkurs", name: "Differentialrechnung", zeile: "Schulbuch lesen und direkt trainieren", ziel: { ansicht: "diffkurs" } },
  { id: "vekkurs", name: "Vektoren, Geraden und Ebenen", zeile: "Heftkapitel lesen und trainieren", ziel: { ansicht: "vekkurs" } },
  { id: "gfs", name: "GFS-Training", zeile: "Thema wählen, verstehen, vortragen", ziel: { ansicht: "gfs" } },
  { id: "kiwahl", name: "Mathe mit KI lernen", zeile: "Mathilda AI für alle, Gemini ab 16, Claude ab 18", ziel: { ansicht: "kiwahl" } },
  { id: "penpaper", name: "Pen & Paper", zeile: "Sauber aufschreiben in neun Lektionen", ziel: { ansicht: "penpaperkurs" } },
  { id: "gleichkurs", name: "Gleichungen lernen", zeile: "Verstehen, rechnen, trainieren", ziel: { ansicht: "gleichkurs" } },
  { id: "headnumbers", name: "Head & Numbers", zeile: "Kopfrechnen mit Lernpfad", ziel: { ansicht: "headnumbers" } },
  { id: "textaufgaben", name: "Textaufgaben übersetzen", zeile: "Aus dem Text die Gleichung machen", ziel: { ansicht: "textaufgaben" } },
  { id: "efunktion", name: "Minikurs e-Funktion", zeile: "Die wichtigste Funktion der Oberstufe", ziel: { ansicht: "efunktion" } },
  { id: "mindset", name: "Mathe-Mindset-Kurs", zeile: "6 TED-Talks und 2 Bücher, die inspirieren", ziel: { ansicht: "elternkurs" } },
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

/* ---------- Mathilda ---------- */
/* Der erste Punkt ist die große goldene Aktion in der Mathilda-Karte, die anderen vier stehen als Kacheln darunter */
export const KI_MENUE = [
  { id: "blatt", name: "Blatt scannen", kurz: "Scannen", zeile: "Foto von deiner Rechnung – Mathilda prüft", ziel: { ansicht: "analyse", foto: "blatt" } },
  { id: "chat", name: "Mit Mathilda sprechen", kurz: "Chat", zeile: "Tutor-Chat, der dich selbst draufkommen lässt", ziel: { ansicht: "analyse", foto: "chat" } },
  { id: "weg", name: "Rechenweg prüfen", kurz: "Rechenweg", zeile: "Wo genau ist der Fehler?", ziel: { ansicht: "analyse", foto: "weg" } },
  { id: "text", name: "Textaufgabe übersetzen", kurz: "Textaufgabe", zeile: "Aus dem Text die Bedingungen", ziel: { ansicht: "textaufgaben", seite: "mathilda" } },
  { id: "briefkasten", name: "Klausurbriefkasten", kurz: "Klausur", zeile: "Zurückbekommene Arbeit einwerfen", ziel: { ansicht: "klausurbriefkasten" } },
];

/* ---------- Mein Training ---------- */
/* Mein Mathe-Training ist die eine Trainingsseite (Tagesplan, Themen, Wiederholungen, Nachholen); Trainingsplan, Lernpfad-Wochenplan
   und der Ebbinghaus-Tagesplan sind darin aufgegangen. Die übrigen Punkte sind Werkzeuge, die der Tagesplan ebenfalls nutzt. */
export const TRAINING = [
  { id: "trainingszentrum", name: "Trainingszentrum", zeile: "Alle Trainings an einem Ort, jedes im Vollbild", ziel: { ansicht: "trainingszentrum" } },
  { id: "meintraining", name: "Mein Mathe-Training", zeile: "Tagesplan, Themen, Wiederholungen", ziel: { ansicht: "meintraining" } },
  { id: "warmup", name: "5 Minuten Mathe", zeile: "Fünf kurze Aufgaben zum Aufwärmen", ziel: { ansicht: "warmup" } },
  { id: "fehler", name: "Meine Fehler üben", zeile: "Genau das, was bei dir öfter schiefgeht", ziel: { ansicht: "fehlertraining" } },
  { id: "wiederholen", name: "Wiederholen", zeile: "Wie der Ebbinghaus-Rhythmus funktioniert", ziel: { ansicht: "ebbinghaus" } },
  { id: "lernpfad", name: "Standortcheck", zeile: "Wo stehst du wirklich?", ziel: { ansicht: "lernpfad" } },
  { id: "nachbereiten", name: "Klassenarbeit nachbereiten", zeile: "Aus Fehlern einen Plan machen", ziel: { ansicht: "klausurnach" } },
  { id: "pruefung", name: "Prüfungsmodus", zeile: "Ohne Hilfen, mit Uhr", ziel: { ansicht: "pruefung" } },
];

/* ---------- Mathe-Training: alle Werkzeuge wie auf der Startseite (Schulmathematik) ---------- */
/* Stufen-Schalter: gleiche Werte und gleicher Speicher wie auf der Startseite */
export const STUFEN = [
  { id: "unter", name: "Unterstufe", kurz: "Unter", klassen: "5–6" },
  { id: "mittel", name: "Mittelstufe", kurz: "Mittel", klassen: "7–10" },
  { id: "ober", name: "Oberstufe", kurz: "Ober", klassen: "11–13" },
  { id: "alle", name: "Alle", kurz: "Alle", klassen: "5–13" },
];
export const STUFE_SCHLUESSEL = "matheplus-start-stufe";
export const istStufe = (w) => STUFEN.some((s) => s.id === w);

/* Bereiche → Stationen → Werkzeuge für eine Stufe. Leere Stationen und Bereiche fallen weg.
   Die Formelsammlung steht im Menü als eigener Abschnitt und fehlt deshalb hier. Abi-Vorbereitung (Oberstufe/Alle) als goldener letzter Bereich. */
export function trainingsBereiche(stufe = "alle") {
  const liste = [];
  for (const b of startBloecke(stufe)) {
    const stationen = [];
    for (const st of b.stationen) {
      const ws = st.werkzeuge.map((id) => werkzeug(id)).filter((w) => w && passtStufe(w, stufe))
        .map((w) => ({ id: w.id, name: w.name, zeile: w.zeile, zeichen: w.zeichen, etikett: w.etikett, ziel: w.ziel }));
      if (ws.length) stationen.push({ id: st.id, nr: stationen.length + 1, titel: st.titel, zeile: st.zeile, werkzeuge: ws });
    }
    if (!stationen.length) continue;
    liste.push({ id: b.id, titel: b.kiste ? "Werkzeugkasten" : b.titel, text: b.text, gold: b.fundament, kiste: b.kiste, stationen, anzahl: stationen.reduce((n, s) => n + s.werkzeuge.length, 0) });
  }
  if (stufe === "ober" || stufe === "alle") {
    const ws = ABI_MENUE.map((e, i) => ({ id: `abi${i}`, name: e.name, zeile: e.zeile, zeichen: e.zeichen, etikett: e.etikett, ziel: e.ziel }));
    liste.push({ id: "abitur", titel: "Abi-Vorbereitung", text: "Abi-Ketten, Abi-Sätze und Probeabitur.", gold: true, abi: true,
      stationen: [{ id: "abi", nr: 1, titel: "Abitur", zeile: "Im Format der Prüfung", werkzeuge: ws }], anzahl: ws.length });
  }
  return liste;
}
/* Wie viele verschiedene Werkzeuge stecken in einer Stufe? (Kopfzeile „Mathe-Training · 48 Werkzeuge“) */
export const werkzeugAnzahl = (stufe = "alle") => new Set(trainingsBereiche(stufe).flatMap((b) => b.stationen.flatMap((s) => s.werkzeuge.map((w) => w.ziel.ansicht)))).size;

/* ---------- Mathe entdecken ---------- */
export function entdeckenGruppen() {
  const gruppen = [];
  for (const e of ENTDECKEN_MENUE) {
    if (e.kopf) gruppen.push({ id: e.name, titel: e.titel, zeile: e.zeile, eintraege: [] });
    else if (gruppen.length) gruppen[gruppen.length - 1].eintraege.push({ id: e.name, name: e.name, zeile: e.zeile, zeichen: e.zeichen, ziel: e.ziel });
  }
  return gruppen;
}

/* ---------- Formelsammlung und Nachschlagen ---------- */
export const FORMELN = FORMEL_MENUE.map((e) => ({ id: e.ziel.bereich, name: e.name, zeile: e.zeile, zeichen: e.zeichen, ziel: e.ziel }));
export const NACHSCHLAGEN = [
  { id: "operatoren", name: "Operatoren", zeile: "Was „bestimmen“, „zeigen“, „begründen“ verlangen", ziel: { ansicht: "operatoren" } },
  { id: "schulmathe", name: "Alles auf der Startseite", zeile: "Schulmathematik mit Filter nach Art", ziel: { ansicht: "start" } },
];

/* ---------- Weitermachen ---------- */
/* Zuletzt benutztes Werkzeug (Startseite schreibt es bei jedem Seitenwechsel, func2.jsx werkzeugMerken) */
export const ZULETZT_SCHLUESSEL = "matheplus-zuletzt-werkzeug";
export function zuletztAus(roh, jetzt = new Date()) {
  let z = null;
  try { z = typeof roh === "string" ? JSON.parse(roh) : roh; } catch (e) { return null; }
  if (!z || !z.ansicht) return null;
  const ort = wo(z.ansicht);
  if (!ort || !ort.werkzeug) return null;
  const heute = new Date(jetzt); heute.setHours(0, 0, 0, 0);
  const dann = new Date(z.zeit || jetzt); dann.setHours(0, 0, 0, 0);
  const tage = Math.round((heute - dann) / 864e5);
  const wann = tage <= 0 ? "heute" : tage === 1 ? "gestern" : `vor ${tage} Tagen`;
  return { name: ort.werkzeug.name, zeichen: ort.werkzeug.zeichen, bereich: ort.bereich.titel, wann, ziel: { ansicht: z.ansicht } };
}

/* ---------- Abschnitte im ☰-Menü ----------
   Suche als Zeile ganz oben, dann die Mathilda-Karte (immer offen), „Weitermachen“, und die aufklappbaren Abschnitte.
   „Meine Kurse“ ist eine Karten-Leiste (immer sichtbar) zwischen Mathe-Training und Mein Training. */
export const LEISTE = [
  { id: "klasse", name: null },          // Beschriftung aus klasseLabel()
  { id: "schultraining", name: "Mathe-Training" },
  { id: "training", name: "Mein Mathe-Training" },
  { id: "entdecken", name: "Mathe entdecken" },
  { id: "mathematik", name: "Formelsammlung" },
];

/* Welcher Teil des Menüs gehört zur aktuellen Seite? (wird markiert) */
export function aktiverPunkt(ansicht, foto) {
  if (ansicht === "analyse" || ansicht === "klausurbriefkasten") return "mathilda";
  if (ansicht === "textaufgaben" && foto === "mathilda") return "mathilda";
  if (KURSE_ALLE.some((k) => k.ziel.ansicht === ansicht)) return "kurse";
  if (TRAINING.some((k) => k.ziel.ansicht === ansicht) || ansicht === "trainieren" || ansicht === "trainingsplan" || ansicht === "vorbereiten") return "training";
  if (ansicht === "entdecken" || ansicht === "bwm" || ansicht === "landeswettbewerbe" || ansicht === "landeswettbewerb") return "entdecken";
  if (ansicht === "formeln" || ansicht === "operatoren") return "mathematik";
  if (wo(ansicht) || ABI_MENUE.some((e) => e.ziel.ansicht === ansicht)) return "schultraining";
  return null;
}
