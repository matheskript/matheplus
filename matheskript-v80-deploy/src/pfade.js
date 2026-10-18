/* ============================================================
   PFADE – knackige Direct Links für jede Seite und jedes Werkzeug
   z. B.  /elternabend   /ableitungstrainer   /kurvendiskussion   /klasse-10

   Reine Daten, keine React-Importe (Node-testbar).
   Eine Quelle: Werkzeuge kommen automatisch aus werkzeuge.js,
   alle anderen Seiten stehen in SEITEN unten.

   Neues Werkzeug  → Eintrag in WERKZEUGE (werkzeuge.js): Pfad = Schlüsselname,
                     nur bei Bedarf in WZ_SLUG einen kürzeren/schöneren Namen eintragen.
   Neue Seite      → eine Zeile in SEITEN.

   Regeln
   - Kleinbuchstaben, Bindestrich, ae/oe/ue/ss statt Umlauten.
   - 6-stellige Zahlen sind Werbe-/Ref-Links (konto.js) und nie Seiten.
   - /formeln und /formeln/<id> sind die öffentlichen Formelseiten (statisch,
     eigener Build) und gehören NICHT hierher; die App-Formelsammlung ist /formelsammlung.
   - /archiv/… und /api/… sind keine App-Seiten.
   ============================================================ */
import { WERKZEUGE, BEREICHE, ansichtenVon } from "./werkzeuge.js";

/* Werkzeuge, deren Pfad vom Schlüssel abweicht */
export const WZ_SLUG = {
  vektorgenerator: "vektorrechnen",
  zweipunkte: "zwei-punkte",
  dreipunkte: "drei-punkte",
  geraden: "geraden-im-raum",
  ebenevsebene: "ebene-vs-ebene",
  stammintegral: "stammfunktion",
  vierfelder: "vierfeldertafel",
};

/* Zweitansichten (Umschalter im Werkzeug) bekommen einen Unterpfad */
const WZ_MODUS_SLUG = {
  advplotter: "kurvendiskussion/beliebig",
  gleichverstehen: "gleichungen/verstehen",
};

/* Handgepflegte Seiten. Zusatzfelder (ziel, foto, trainer, seite, kurs, land) sind
   die Unterziele, die gehe() in func10.jsx kennt. */
export const SEITEN = [
  { pfad: "", ansicht: "start" },
  { pfad: "landingpage", ansicht: "landingpage", alias: ["start-neu"] },
  { pfad: "elternabend", ansicht: "elternabend", alias: ["eltern-abend", "infoabend"] },

  /* Mein Weg */
  { pfad: "lernlandkarte", ansicht: "karte", alias: ["karte", "landkarte"] },
  { pfad: "plan", ansicht: "plan", alias: ["mein-plan"] },
  { pfad: "wiederholen", ansicht: "wiederholen" },
  { pfad: "fortschritt", ansicht: "profil" },
  { pfad: "einstufung", ansicht: "einstufung" },
  { pfad: "profil", ansicht: "profil2" },
  { pfad: "lernpfad", ansicht: "lernpfad" },
  { pfad: "trainieren", ansicht: "trainieren", alias: ["eine-sache-trainieren", "kapiteltraining"] },
  { pfad: "trainingsplan", ansicht: "trainingsplan", alias: ["trainingsplan-erstellen"] },

  /* Lernen */
  { pfad: "arbeitsheft", ansicht: "training", ziel: "module", alias: ["module"] },
  { pfad: "videokurse", ansicht: "kurse", alias: ["kurse"] },
  { pfad: "videokurse/pen-und-paper", ansicht: "kurse", kurs: "penpaper", alias: ["pen-und-paper"] },
  { pfad: "mathe-entdecken", ansicht: "entdecken", alias: ["entdecken"] },
  { pfad: "mathe-entdecken/axiome", ansicht: "entdecken", seite: "axiome" },
  { pfad: "mathe-entdecken/einstieg", ansicht: "entdecken", seite: "einstieg" },
  { pfad: "mathe-entdecken/potenzregel", ansicht: "entdecken", seite: "praxis" },
  { pfad: "mathe-entdecken/pythagoras", ansicht: "entdecken", seite: "pythagoras" },
  { pfad: "mathe-entdecken/teilbarkeit", ansicht: "entdecken", seite: "teiler" },
  { pfad: "mathe-entdecken/binomische-formeln", ansicht: "entdecken", seite: "binomisch" },
  { pfad: "mathe-entdecken/grenzwert", ansicht: "entdecken", seite: "grenzwert" },
  { pfad: "differenzenquotient", ansicht: "diffq" },
  { pfad: "formeln-zum-kapitel", ansicht: "kapitelformeln", alias: ["kapitel-formeln", "testklausur"] },
  { pfad: "potenzregel", ansicht: "potenzregel" },
  { pfad: "formelsammlung", ansicht: "formeln", alias: ["formeln-app"] },
  { pfad: "operatoren", ansicht: "operatoren" },

  /* Üben */
  { pfad: "masterclass", ansicht: "masterclass", alias: ["mathe-abi-masterclass"] },
  { pfad: "aufgabengenerator", ansicht: "ki", ziel: null, alias: ["generator"] },
  { pfad: "arbeitsblatt", ansicht: "ki", ziel: "blatt", alias: ["arbeitsblatt-drucken"] },
  { pfad: "rechenweg", ansicht: "training", ziel: "weg" },
  { pfad: "kurvendiskussion-protokoll", ansicht: "training", ziel: "kd" },
  { pfad: "graph-zuordnung", ansicht: "training", ziel: "gz" },
  { pfad: "head-and-numbers", ansicht: "headnumbers", alias: ["head-numbers", "headnumbers"] },
  { pfad: "kopfrechnen", ansicht: "kopf" },
  { pfad: "kopfrechnen/einmaleins", ansicht: "kopf", trainer: "multiplizieren" },
  { pfad: "kopfrechnen/quadratzahlen", ansicht: "kopf", trainer: "quadrate" },
  { pfad: "kopfrechnen/kubikzahlen", ansicht: "kopf", trainer: "kuben" },
  { pfad: "kopfrechnen/wurzeln", ansicht: "kopf", trainer: "wurzeln" },
  { pfad: "kopfrechnen/bruchrechnen", ansicht: "kopf", trainer: "bruchrechnen" },
  { pfad: "kopfrechnen/plus-minus", ansicht: "kopf", trainer: "plusminus" },
  { pfad: "kopfrechnen/quadrate-wurzeln", ansicht: "kopf", trainer: "potenzen" },
  { pfad: "kopfrechnen/primzahlen", ansicht: "kopf", trainer: "primzahlen" },
  { pfad: "kopfrechnen/primfaktoren", ansicht: "kopf", trainer: "primfaktoren" },
  { pfad: "kopfrechnen/schriftlich-teilen", ansicht: "kopf", trainer: "division" },
  { pfad: "mein-training", ansicht: "meintraining", alias: ["training-heute"] },
  { pfad: "5-minuten-mathe", ansicht: "warmup", alias: ["warmup", "fuenf-minuten"] },
  { pfad: "fehlertraining", ansicht: "fehlertraining", alias: ["meine-fehler"] },
  { pfad: "ebbinghaus", ansicht: "ebbinghaus" },
  { pfad: "challenge", ansicht: "challenge" },

  /* Prüfung */
  { pfad: "klausur-vorbereiten", ansicht: "vorbereiten", alias: ["klausur"] },
  { pfad: "klausur-nachbereiten", ansicht: "klausurnach" },
  { pfad: "klausurgenerator", ansicht: "training", ziel: "klausur" },
  { pfad: "pruefung", ansicht: "pruefung", alias: ["pruefungsmodus"] },
  { pfad: "probeabitur", ansicht: "abitur", alias: ["abitur"] },
  { pfad: "abi-ketten", ansicht: "abiketten" },
  { pfad: "abi-saetze", ansicht: "abisaetze" },
  { pfad: "begruenden", ansicht: "begruenden", alias: ["beweisen"] },
  { pfad: "modellieren", ansicht: "modellieren" },

  /* Mathilda AI */
  { pfad: "mathilda", ansicht: "analyse", foto: "blatt", alias: ["blatt-pruefen", "mathilda-ai"] },
  { pfad: "mathilda/weg", ansicht: "analyse", foto: "weg", alias: ["weg-pruefen"] },
  { pfad: "mathilda/aufgabe", ansicht: "analyse", foto: "aufgabe", alias: ["aufgabe-scannen"] },

  /* Programme und Kurse */
  { pfad: "mathe-checken", ansicht: "mathecheck", alias: ["mathecheck"] },
  { pfad: "mindset-kurs", ansicht: "elternkurs", alias: ["elternkurs", "mathe-mindset"] },
  { pfad: "nachhilfe-kurs", ansicht: "nachhilfekurs", alias: ["nachhilfekurs"] },
  { pfad: "pen-and-paper", ansicht: "penpaperkurs", alias: ["penpaper"] },

  /* Wettbewerbe */
  { pfad: "wettbewerbe", ansicht: "bwm", alias: ["bwm"] },
  { pfad: "landeswettbewerbe", ansicht: "landeswettbewerbe" },
  { pfad: "landeswettbewerb", ansicht: "landeswettbewerb" },

  /* Berichte */
  { pfad: "wochenbericht", ansicht: "bericht", alias: ["bericht"] },
  { pfad: "messbericht", ansicht: "messung" },
  { pfad: "auswertung", ansicht: "auswertung" },

  /* Konto und Recht */
  { pfad: "konto", ansicht: "konto", alias: ["login", "anmelden"] },
  { pfad: "impressum", ansicht: "impressum" },
  { pfad: "datenschutz", ansicht: "datenschutz", alias: ["datenschutzerklaerung", "privacy"] },
  { pfad: "einwilligung", ansicht: "einwilligung", alias: ["zustimmung"] },
  { pfad: "agb", ansicht: "agb" },
  { pfad: "widerruf", ansicht: "widerruf" },

  /* Entwürfe (die Anmeldung schützt weiterhin die ganze Seite) */
  { pfad: "entwurf/start", ansicht: "entwurf-start" },
  { pfad: "entwurf/mathe-checken", ansicht: "entwurf-checken" },
  { pfad: "entwurf/pakete", ansicht: "entwurf-pakete" },
  { pfad: "entwurf/werkzeuge", ansicht: "entwurf-werkzeuge" },
  { pfad: "entwurf/vorher", ansicht: "entwurf-vorher" },
];

/* Klassen 8–13 */
export const KLASSEN = [8, 9, 10, 11, 12, 13];

/* Bundesländer der Landeswettbewerb-Seite: /landeswettbewerb/bw … */
export const LAND_IDS = ["bw", "by", "rp", "he", "be", "bb", "hb", "hh", "mv", "ni", "nw", "sl", "sn", "st", "sh", "th"];

/* ---------- Tabelle bauen ---------- */
function bauen() {
  const liste = SEITEN.map((s) => ({ ...s, alias: s.alias || [] }));
  const frei = (p) => !liste.some((e) => e.pfad === p || e.alias.includes(p));

  /* Werkzeuge aus werkzeuge.js */
  for (const id of Object.keys(WERKZEUGE)) {
    const w = WERKZEUGE[id];
    const pfad = WZ_SLUG[id] || id;
    const alias = WZ_SLUG[id] && frei(id) ? [id] : [];
    liste.push({ pfad, ansicht: w.ziel.ansicht, alias, werkzeug: id });
    for (const a of ansichtenVon(w).slice(1)) liste.push({ pfad: WZ_MODUS_SLUG[a] || `${pfad}/${a}`, ansicht: a, alias: [], werkzeug: id });
  }
  /* Übersichtsseiten der Bereiche: /analysis, /vektoren, /stochastik */
  for (const b of BEREICHE) if (b.uebersicht) liste.push({ pfad: b.id, ansicht: b.uebersicht, alias: [], bereich: b.id });
  return liste;
}

export const PFADE = bauen();

/* ---------- Auflösen: Pfad → Eintrag ---------- */
const NACH_PFAD = new Map();
for (const e of PFADE) {
  NACH_PFAD.set(e.pfad, { ...e, kanonisch: true });
  for (const a of e.alias) if (!NACH_PFAD.has(a)) NACH_PFAD.set(a, { ...e, kanonisch: false });
}

/* Roher Pfad (z. B. "/Elternabend/") → kleingeschrieben, ohne Rand-Schrägstriche, URL-dekodiert */
export function pfadNormal(roh) {
  let p = String(roh || "");
  try { p = decodeURIComponent(p); } catch (e) { /* unverändert lassen */ }
  p = p.split(/[?#]/)[0].toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/\/{2,}/g, "/").replace(/^\/+|\/+$/g, "");
  return p;
}

/* Pfad → Navigationsziel für gehe(): { ansicht, ziel?, foto?, klasse?, … } oder null.
   kanonisch=false → die Adresse sollte auf den schönen Pfad umgeschrieben werden. */
export function pfadAufloesen(roh) {
  const p = pfadNormal(roh);
  const k = /^klasse-(\d{1,2})$/.exec(p);
  if (k && KLASSEN.includes(Number(k[1]))) return { ansicht: "klasse", klasse: Number(k[1]), kanonisch: true };
  const l = /^landeswettbewerb\/([a-z]{2})$/.exec(p);
  if (l && LAND_IDS.includes(l[1])) return { ansicht: "landeswettbewerb", land: l[1], kanonisch: true };
  const e = NACH_PFAD.get(p);
  if (!e) return null;
  const { pfad, alias, werkzeug, bereich, ...ziel } = e;
  return ziel;
}

/* ---------- Gegenrichtung: Zustand der App → Pfad ---------- */
const UNTERZIELE = ["ziel", "foto", "trainer", "seite", "kurs"];

/* zustand: { ansicht, ziel, foto, klasse, trainer, seite, kurs, land }
   Liefert den Pfad mit führendem "/" oder null, wenn die Ansicht keinen Pfad hat. */
export function pfadFuer(zustand) {
  const z = zustand || {};
  if (z.ansicht === "klasse" && KLASSEN.includes(Number(z.klasse))) return `/klasse-${Number(z.klasse)}`;
  if (z.ansicht === "landeswettbewerb" && LAND_IDS.includes(z.land) && z.land !== "bw") return `/landeswettbewerb/${z.land}`;
  let beste = null, bestePunkte = -1;
  for (const e of PFADE) {
    if (e.ansicht !== z.ansicht) continue;
    let punkte = 0, passt = true;
    for (const f of UNTERZIELE) {
      if (!(f in e)) continue;
      if ((z[f] ?? null) === e[f]) punkte++; else { passt = false; break; }
    }
    if (passt && punkte > bestePunkte) { beste = e; bestePunkte = punkte; }
  }
  return beste ? "/" + beste.pfad : null;
}

/* Hilfen für Tests und Sitemap-artige Listen */
export const alleKanonischenPfade = () => PFADE.map((e) => "/" + e.pfad);
