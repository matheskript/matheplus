/* ======================================================================
   rollenLogik.js – reine Funktionen (keine React-/Netzwerk-Importe) für Rollen, Einladungslinks,
   Ampel (Lehrkraft) und Wochenübersicht (Eltern). Getestet in tests/rollen.test.mjs.
   ====================================================================== */

export const ROLLEN = [
  { id: "schueler", name: "Schüler", kurz: "Ich lerne Mathe" },
  { id: "eltern", name: "Elternteil", kurz: "Ich begleite mein Kind" },
  { id: "lehrkraft", name: "Lehrkraft", kurz: "Ich unterrichte eine Klasse" },
  { id: "nachhilfe", name: "Nachhilfelehrer", kurz: "Ich gebe Nachhilfe" },
];
export const istLehrend = (rolle) => rolle === "lehrkraft" || rolle === "nachhilfe";

/* ---------- Geschlecht der Schüler ----------
   Bei der Anmeldung wählt man „Schüler“ (m) oder „Schülerin“ (w) – so sind Anrede und Fürwörter
   ohne Gendersprache eindeutig. Bestehende Konten ohne Angabe (null) zeigen vorläufig „Schüler“. */
export const GESCHLECHTER = [
  { id: "m", name: "Schüler" },
  { id: "w", name: "Schülerin" },
];
export const istGeschlecht = (g) => g === "m" || g === "w";
export const rolleName = (id, geschlecht) => {
  const r = ROLLEN.find((x) => x.id === id) || ROLLEN[0];
  if (r.id === "schueler" && istGeschlecht(geschlecht)) return geschlecht === "w" ? "Schülerin" : "Schüler";
  return r.name;
};
/* Hinweis für Mathilda (KI), damit sie die richtige Anrede und die richtigen Fürwörter benutzt */
export const anredeHinweis = (geschlecht) => (geschlecht === "w"
  ? "Die Schülerin ist weiblich: Sprich von ihr als „sie“ und „die Schülerin“, nie als „er“ oder „der Schüler“."
  : geschlecht === "m"
    ? "Der Schüler ist männlich: Sprich von ihm als „er“ und „der Schüler“."
    : "");

/* ---------- Meine Daten (Schüler): wann ist alles eingetragen? ----------
   Noten gibt es ab Klasse 3. In der Kursstufe zählen Punkte je Halbjahr (k.1, k.2), davor Jahresnoten.
   „Vollständig“ heißt: Name, Schulform, Klassenstufe und alle Noten bis zur Klasse VOR der aktuellen
   (die aktuelle Endnote gibt es ja noch nicht). */
export const KURSSTUFE = { G8: 11, G9: 12, GMS: 12 };
export const NOTEN_AB = 3;
export function notenSchluessel(schulform, bisKlasse) {
  const ks = KURSSTUFE[schulform];
  const keys = [];
  for (let k = NOTEN_AB; k <= bisKlasse; k++) {
    if (ks && k >= ks) keys.push(`${k}.1`, `${k}.2`); else keys.push(String(k));
  }
  return keys;
}
export function datenVollstaendig(p) {
  if (!p || !String(p.name || "").trim() || !KURSSTUFE[p.schulform]) return false;
  const kl = Number(p.klasse);
  if (!kl) return false;
  const noten = p.noten || {};
  return notenSchluessel(p.schulform, kl - 1).every((k) => noten[k] !== undefined && noten[k] !== null);
}

/* ---------- Datum ---------- */
export const tagKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const tageZurueck = (jetzt, n) => { const d = new Date(jetzt); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };

/* „Aktiver Tag“: mindestens 2 Minuten gelernt oder mindestens eine Aufgabe bearbeitet. */
export const tagAktiv = (t) => !!t && ((t.s || 0) >= 120 || (t.a || 0) > 0);

/* ---------- Ampel für Lehrkräfte ----------
   Misst AKTIVITÄT, nicht Leistung.
   grün  = an mindestens 2 der letzten 7 Tage aktiv
   gelb  = an 1 der letzten 7 Tage aktiv ODER letzte Aktivität vor 8–14 Tagen
   rot   = früher aktiv, aber seit mehr als 14 Tagen nichts mehr
   grau  = noch nie aktiv                                                      */
export function ampel(zus, jetzt = new Date()) {
  const tage = (zus && zus.tage) || {};
  let letzte7 = 0, letzteTag = null;
  for (let i = 0; i < 14; i++) {
    const k = tagKey(tageZurueck(jetzt, i));
    if (tagAktiv(tage[k])) { if (i < 7) letzte7++; if (letzteTag === null) letzteTag = i; }
  }
  const la = zus && Number(zus.letzte_aktivitaet);
  let tageSeit = letzteTag;
  if (tageSeit === null && la > 0) tageSeit = Math.floor((jetzt.getTime() - la) / 86400000);
  if (letzte7 >= 2) return { farbe: "gruen", text: "aktiv", tageSeit };
  if (letzte7 === 1) return { farbe: "gelb", text: "wenig aktiv", tageSeit };
  if (tageSeit !== null && tageSeit !== undefined && tageSeit <= 14) return { farbe: "gelb", text: "wenig aktiv", tageSeit };
  if (tageSeit !== null && tageSeit !== undefined) return { farbe: "rot", text: "länger nicht aktiv", tageSeit };
  return { farbe: "grau", text: "noch nicht gestartet", tageSeit: null };
}
const REIHE = { rot: 0, gelb: 1, gruen: 2, grau: 3 };
/* Rot zuerst (braucht Aufmerksamkeit), dann gelb, grün, grau; innerhalb alphabetisch */
export function ampelSortiert(liste, jetzt = new Date()) {
  return liste.map((s) => ({ ...s, ampel: ampel(s, jetzt) }))
    .sort((a, b) => REIHE[a.ampel.farbe] - REIHE[b.ampel.farbe] || String(a.name).localeCompare(String(b.name), "de"));
}
export const ampelZaehlung = (liste, jetzt = new Date()) => {
  const z = { rot: 0, gelb: 0, gruen: 0, grau: 0 };
  liste.forEach((s) => { z[ampel(s, jetzt).farbe]++; });
  return z;
};

/* ---------- Wochenübersicht für Eltern: Montag bis Sonntag der aktuellen Woche ---------- */
const WT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export function wochenUebersicht(zus, jetzt = new Date()) {
  const tage = (zus && zus.tage) || {};
  const heute = new Date(jetzt); heute.setHours(12, 0, 0, 0);
  const mo = new Date(heute); mo.setDate(mo.getDate() - ((heute.getDay() + 6) % 7));
  const tageListe = WT.map((name, i) => {
    const d = new Date(mo); d.setDate(mo.getDate() + i);
    const t = tage[tagKey(d)] || {};
    return { name, key: tagKey(d), heute: tagKey(d) === tagKey(heute), zukunft: d > heute,
      minuten: Math.round((t.s || 0) / 60), aufgaben: t.a || 0, richtig: t.r || 0, aktiv: tagAktiv(t) };
  });
  const minuten = tageListe.reduce((s, t) => s + t.minuten, 0);
  const aufgaben = tageListe.reduce((s, t) => s + t.aufgaben, 0);
  const richtig = tageListe.reduce((s, t) => s + t.richtig, 0);
  return { tage: tageListe, minuten, aufgaben, richtig, prozent: aufgaben > 0 ? Math.round((richtig / aufgaben) * 100) : null,
    aktiveTage: tageListe.filter((t) => t.aktiv).length };
}

/* „Zuletzt aktiv“ in Worten */
export function zuletztText(ts, jetzt = new Date()) {
  const t = Number(ts);
  if (!t) return "noch nicht aktiv";
  const tage = Math.floor((jetzt.getTime() - t) / 86400000);
  if (tage <= 0) return "heute";
  if (tage === 1) return "gestern";
  return `vor ${tage} Tagen`;
}

/* Status von „Mathe entdecken“ in Worten */
export function entdeckenText(e) {
  if (!e) return "noch nicht gestartet";
  if (e.potenz_fertig) return "Potenzregel-Modul abgeschlossen";
  if (e.potenz_schritte > 0 || e.potenz_phase > 0) return `Potenzregel: Phase ${Math.min(7, (e.potenz_phase || 0) + 1)} von 7`;
  if (e.video_haupt || e.reflexion_n > 0) return "Einstieg begonnen";
  return "noch nicht gestartet";
}

/* ---------- Links ----------
   Eltern-Einladung: <Basis>/<ref_code>?als=eltern&e=<geheimer Token>
   Der Ref-Code allein reicht NICHT, um sich mit einem Kind zu verbinden – dafür braucht es den Token. */
export const elternLink = (basis, refCode, token) => `${basis}/${refCode}?als=eltern&e=${encodeURIComponent(token || "")}`;
export const klassenLink = (basis, code) => `${basis}/?klasse=${encodeURIComponent(code)}`;
export const KLASSENCODE = /^[A-HJ-NP-Z2-9]{6}$/;
export const TOKEN = /^[a-f0-9]{8,64}$/;

export function elternNachricht(name, link) {
  return `Hallo! Ich lerne Mathe mit Mythos Mathe. Über diesen Link kannst du dir ein kostenloses Elternkonto anlegen und siehst dann, wie ich vorankomme${name ? " (" + name + ")" : ""}: ${link}`;
}
export function freundeNachricht(name, link) {
  return `Hey! Ich lerne Mathe mit Mythos Mathe${name ? " (" + name + ")" : ""} – Mathe verstehen mit System. Schau es dir an, über meinen Link geht's los: ${link}`;
}
export function klassenNachricht(klasse, link, code) {
  return `Hallo! Hier ist unsere Mathe-Klasse ${klasse} bei Mythos Mathe. Tritt über diesen Link bei: ${link} (oder gib den Code ${code} im Konto ein).`;
}
export const whatsappLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/* Einladung aus der Adresse lesen: { als, token, klasse } – alle Felder geprüft, sonst null */
export function einladungAusUrl(href) {
  try {
    const u = new URL(href);
    const als = u.searchParams.get("als") === "eltern" ? "eltern" : null;
    const e = (u.searchParams.get("e") || "").trim().toLowerCase();
    const k = (u.searchParams.get("klasse") || "").trim().toUpperCase();
    const r = { als, token: als && TOKEN.test(e) ? e : null, klasse: KLASSENCODE.test(k) ? k : null };
    return r.als || r.token || r.klasse ? r : null;
  } catch (er) { return null; }
}

/* Klassenanzeige */
export const SCHULFORM_NAME = { G8: "Gymnasium G8", G9: "Gymnasium G9", GMS: "Gesamtschule" };
export const maxStufe = (schulform) => (schulform === "G8" ? 12 : 13);
export const klassenLabel = (k) => `${SCHULFORM_NAME[k.schulform] || k.schulform} · Klasse ${k.stufe} · ${k.name}`;
