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
import { istUnterstufeSeite } from "./unterstufeSeiten.js";   // nur die Ids (scripts/unterstufe-seiten.mjs), nicht die ganzen Lerneinheiten
import { istBlogBeitrag } from "./blogDaten.js";
import { THEMEN as KAPITEL_THEMEN } from "./schulbuch.js";
import { kapitelAusSlug, kapitelPfad } from "./kapitelPfade.js";

/* Werkzeuge, deren Pfad vom Schlüssel abweicht */
export const WZ_SLUG = {
  diffq: "differenzenquotient",
  hesse: "hesse-normalenform",
  /* Suchwörter statt Code-Namen (21.10.); die alte Id bleibt als Alias erreichbar */
  lgs: "gleichungssysteme",
  zufall: "wahrscheinlichkeit",
  winkel: "vektorwinkel",
  groessen: "einheiten-umrechnen",
  zuordnungen: "dreisatz",
  ganzezahlen: "negative-zahlen",
  terme: "terme-vereinfachen",
  flaechen: "flaecheninhalt",
  vektorgenerator: "vektorrechnen",
  zweipunkte: "zwei-punkte",
  bruchwurzel: "brueche-und-wurzeln",
  dreipunkte: "drei-punkte",
  geraden: "geraden-im-raum",
  ebenevsebene: "ebene-vs-ebene",
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
  /* Kanal-Landingpages (kanalSeiten.js, funcKanalSeite.jsx): je Werbekanal eine Seite, Ansicht "kanal" + seite */
  { pfad: "poster", ansicht: "kanal", seite: "poster", alias: ["plakat", "schule"] },
  { pfad: "thema", ansicht: "kanal", seite: "thema", alias: ["youtube", "ableitungen-verstehen"] },
  { pfad: "insta", ansicht: "kanal", seite: "insta", alias: ["bio", "instagram", "7-gruende"] },
  { pfad: "eltern", ansicht: "kanal", seite: "eltern", alias: ["nachhilfe", "mathe-nachhilfe", "mathe-nachhilfe-konstanz", "fuer-eltern"] },
  { pfad: "abi-eltern", ansicht: "kanal", seite: "abi-eltern", alias: ["linkedin", "masterclass-eltern", "abitur-eltern"] },
  { pfad: "spenden", ansicht: "spenden", alias: ["donate", "unterstuetzen"] },
  { pfad: "elternabend", ansicht: "elternabend", alias: ["eltern-abend", "infoabend"] },
  { pfad: "lehrkraefte", ansicht: "lehrkraefte", alias: ["lehrer", "fuer-lehrkraefte", "fuer-lehrer", "lehrerinnen"] },
  { pfad: "lehrkraefte/arbeitsblatt", ansicht: "lehrerblatt", alias: ["arbeitsblatt-generator", "lehrer-arbeitsblatt", "lehrer/arbeitsblatt", "arbeitsblaetter"] },
  { pfad: "blog", ansicht: "blog", alias: ["mathe-blog", "beitraege"] },
  { pfad: "vision", ansicht: "vision", alias: ["unsere-vision", "die-vision"] },
  { pfad: "feedback", ansicht: "feedback", alias: ["rueckmeldung", "testphase", "baustelle"] },

  /* Mein Weg */
  { pfad: "lernlandkarte", ansicht: "karte", alias: ["karte", "landkarte"] },
  { pfad: "plan", ansicht: "plan", alias: ["mein-plan"] },
  { pfad: "wiederholen", ansicht: "wiederholen" },
  { pfad: "fortschritt", ansicht: "profil" },
  { pfad: "einstufung", ansicht: "einstufung" },
  { pfad: "profil", ansicht: "profil2" },
  { pfad: "lernpfad", ansicht: "lernpfad" },
  { pfad: "trainieren", ansicht: "trainieren", alias: ["eine-sache-trainieren", "kapiteltraining"] },
  { pfad: "kapitel", ansicht: "kapitel", alias: ["kapitelseite", "buchkapitel"] },
  { pfad: "trainingsplan", ansicht: "trainingsplan", alias: ["trainingsplan-erstellen"] },

  /* Lernen */
  { pfad: "arbeitsheft", ansicht: "training", ziel: "module", alias: ["module"] },
  { pfad: "kurse", ansicht: "kursliste", alias: ["alle-kurse", "kursliste"] },
  { pfad: "videokurse", ansicht: "kurse", alias: ["video-kurse"] },
  { pfad: "videokurse/pen-und-paper", ansicht: "kurse", kurs: "penpaper", alias: ["pen-und-paper"] },
  { pfad: "mathe-entdecken", ansicht: "entdecken", alias: ["entdecken"] },
  { pfad: "mathe-entdecken/axiome", ansicht: "entdecken", seite: "axiome" },
  { pfad: "mathe-entdecken/einstieg", ansicht: "entdecken", seite: "einstieg" },
  { pfad: "mathe-entdecken/potenzregel", ansicht: "entdecken", seite: "praxis" },
  { pfad: "mathe-entdecken/pythagoras", ansicht: "entdecken", seite: "pythagoras" },
  { pfad: "mathe-entdecken/teilbarkeit", ansicht: "entdecken", seite: "teiler" },
  { pfad: "mathe-entdecken/binomische-formeln", ansicht: "entdecken", seite: "binomisch" },
  { pfad: "mathe-entdecken/grenzwert", ansicht: "entdecken", seite: "grenzwert" },
  { pfad: "mathe-entdecken/gauss", ansicht: "entdecken", seite: "gauss", alias: ["gauss"] },
  { pfad: "formeln-zum-kapitel", ansicht: "kapitelformeln", alias: ["kapitel-formeln", "testklausur"] },
  { pfad: "potenzregel", ansicht: "potenzregel" },
  { pfad: "e-funktion", ansicht: "efunktion", alias: ["natuerliche-exponentialfunktion", "exponentialfunktion"] },
  { pfad: "gfs-trainer", ansicht: "gfs", alias: ["gfs", "kurs-gfs", "gfs-kurs"] },
  { pfad: "gfs-trainer/pascalsches-dreieck", ansicht: "gfs-pascal", alias: ["gfs/pascalsches-dreieck"] },
  { pfad: "gfs-trainer/optimale-dose", ansicht: "gfs-dose", alias: ["gfs/optimale-dose", "optimale-dose", "gfs-dose"] },
  { pfad: "gfs-trainer/ziegenproblem", ansicht: "gfs-ziegen", alias: ["gfs/ziegenproblem", "ziegenproblem", "monty-hall", "gfs-ziegen"] },
  { pfad: "gfs-trainer/satz-von-bayes", ansicht: "gfs-bayes", alias: ["gfs/satz-von-bayes", "satz-von-bayes", "gfs-bayes"] },
  { pfad: "gfs-trainer/platonische-koerper", ansicht: "gfs-platonisch", alias: ["gfs/platonische-koerper", "platonische-koerper", "gfs-platonisch"] },
  { pfad: "gfs-trainer/mischungen", ansicht: "gfs-mischungen", alias: ["gfs/mischungen", "mischungen", "mischungsrechnung", "mischungskreuz", "gfs-mischungen"] },
  { pfad: "gfs-trainer/tangentenprobleme", ansicht: "gfs-tangenten", alias: ["gfs/tangentenprobleme", "tangentenprobleme", "gfs-tangenten"] },
  { pfad: "gfs-trainer/exponentialverteilung", ansicht: "gfs-exponential", alias: ["gfs/exponentialverteilung", "exponentialverteilung", "wartezeiten", "gfs-exponential"] },
  { pfad: "gfs-trainer/keplersche-fassregel", ansicht: "gfs-fassregel", alias: ["gfs/keplersche-fassregel", "keplersche-fassregel", "fassregel", "simpsonregel", "gfs-fassregel"] },
  { pfad: "gfs-trainer/folgen", ansicht: "gfs-folgen", alias: ["gfs/folgen", "zahlenfolgen", "geometrische-reihe", "gfs-folgen"] },
  { pfad: "gfs-trainer/wachstum-differenzialgleichungen", ansicht: "gfs-wachstum", alias: ["gfs/wachstum", "differenzialgleichungen-wachstum", "beschraenktes-wachstum", "logistisches-wachstum", "gfs-wachstum"] },
  { pfad: "gfs-trainer/kugeln", ansicht: "gfs-kugeln", alias: ["gfs/kugeln", "kugelgleichung", "tangentialebene", "gfs-kugeln"] },
  { pfad: "unterstufe", ansicht: "unterstufe", alias: ["klasse-5-6", "kurs-unterstufe", "unterstufe-kurs", "klasse-5-und-6"] },
  { pfad: "differentialrechnung", ansicht: "diffkurs", alias: ["differenzialrechnung", "kurs-differentialrechnung", "diffkurs"] },
  { pfad: "vektoren-geraden-ebenen", ansicht: "vekkurs", alias: ["kurs-vektoren", "kurs-vektoren-geraden-ebenen", "vekkurs"] },
  { pfad: "dreiecksgeometrie", ansicht: "geokurs", alias: ["kurs-dreiecksgeometrie", "dreiecksgeometrie-kurs", "kurs/dreiecksgeometrie", "geokurs"] },
  { pfad: "mathe-mit-ki-lernen", ansicht: "kiwahl", alias: ["mathe-lernen-mit-ki", "mathe-mit-ki", "lernen-mit-ki", "ki-lernen", "ki-kurse", "kiwahl"] },
  { pfad: "mathe-lernen-mit-claude", ansicht: "claudekurs", alias: ["claude-kurs", "lernen-mit-claude", "claudekurs", "kurs-claude"]  },
  { pfad: "mathe-lernen-mit-gemini", ansicht: "geminikurs", alias: ["gemini-kurs", "lernen-mit-gemini", "geminikurs", "kurs-gemini"] },
  { pfad: "schulbuch/ableitungen", ansicht: "schulbuch", alias: ["schulbuch", "buch-ableitungen"] },
  { pfad: "formelsammlung", ansicht: "formeln", alias: ["formeln-app"] },
  { pfad: "operatoren", ansicht: "operatoren" },

  /* Üben */
  { pfad: "masterclass", ansicht: "masterclass", alias: ["mathe-abi-masterclass"] },
  { pfad: "masterclass/kurs", ansicht: "mckurs", alias: ["masterclass-kurs", "masterclass/kursbereich"] },
  { pfad: "masterclass/zugang", ansicht: "mczugang", alias: ["masterclass-zugang"] },
  { pfad: "aufgabengenerator", ansicht: "ki", ziel: null, alias: ["generator"] },
  { pfad: "arbeitsblatt", ansicht: "ki", ziel: "blatt", alias: ["arbeitsblatt-drucken"] },
  { pfad: "rechenweg", ansicht: "training", ziel: "weg" },
  { pfad: "kurvendiskussion-protokoll", ansicht: "training", ziel: "kd" },
  { pfad: "graph-zuordnung", ansicht: "training", ziel: "gz" },
  { pfad: "head-and-numbers", ansicht: "headnumbers", alias: ["head-numbers", "headnumbers"] },
  { pfad: "kopfrechnen", ansicht: "kopf" },
  { pfad: "textaufgaben/verstehen", ansicht: "textaufgaben", seite: "verstehen" },
  { pfad: "textaufgaben/training", ansicht: "textaufgaben", seite: "training", alias: ["textaufgaben-training"] },
  { pfad: "textaufgaben/mathilda", ansicht: "textaufgaben", seite: "mathilda", alias: ["mathilda/textaufgabe", "textaufgabe-uebersetzen"] },
  { pfad: "gleichungen-lernen", ansicht: "gleichkurs", alias: ["gleichungsbereich", "gleichungen-kurs"] },
  { pfad: "gleichungen-lernen/verstehen", ansicht: "gleichkurs", seite: "verstehen" },
  { pfad: "gleichungen-lernen/rechnen", ansicht: "gleichkurs", seite: "rechnen" },
  { pfad: "gleichungen-lernen/training", ansicht: "gleichkurs", seite: "training" },
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
  { pfad: "trainingszentrum", ansicht: "trainingszentrum", alias: ["training-zentrum", "trainings", "trainingstools"] },
  { pfad: "mein-mathe-training", ansicht: "meintraining", alias: ["mein-training", "training-heute", "mathe-training-heute"] },
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
  { pfad: "abi", ansicht: "abi", alias: ["abi-zentrum", "abitur-vorbereitung", "abi-vorbereitung", "mathe-abi"] },
  { pfad: "abi/aufgaben", ansicht: "abiaufgaben", alias: ["abi-aufgaben", "abituraufgaben"] },
  { pfad: "abi/teil-a", ansicht: "abiteila", alias: ["teil-a-probe", "abi-teil-a"] },
  { pfad: "abi/mia", ansicht: "mia", alias: ["mia", "abi-trainerin"] },
  { pfad: "abi/lernpartner", ansicht: "lernpartner", alias: ["lernpartner", "lerngruppe", "abi-lerngruppe"] },
  { pfad: "begruenden", ansicht: "begruenden", alias: ["beweisen"] },
  { pfad: "modellieren", ansicht: "modellieren" },

  /* Mathilda AI */
  { pfad: "mathilda", ansicht: "analyse", foto: "blatt", alias: ["blatt-pruefen", "mathilda-ai"] },
  { pfad: "mathilda/weg", ansicht: "analyse", foto: "weg", alias: ["weg-pruefen"] },
  { pfad: "mathilda/aufgabe", ansicht: "analyse", foto: "aufgabe", alias: ["aufgabe-scannen"] },
  { pfad: "klausurbriefkasten", ansicht: "klausurbriefkasten", alias: ["mathilda/klausurbriefkasten", "briefkasten", "klausur-einwerfen"] },

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
  { pfad: "entwurf/biro", ansicht: "entwurf-biro" },
  { pfad: "dokumente", ansicht: "dokumente" },
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

/* Kapitel-Ids sind teils gemischt geschrieben (ksDiff), Pfade immer klein */
function kapitelIdAusPfad(klein) {
  for (const id of KAPITEL_IDS) if (id.toLowerCase() === klein) return id;
  return null;
}
const KAPITEL_IDS = Object.keys(KAPITEL_THEMEN);

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
  /* Modul Unterstufe: /unterstufe/klasse-5, /unterstufe/<lerneinheit> (Ids aus unterstufeSeiten.js); /klasse-5 und /klasse-6 als Kurzform */
  const u = /^unterstufe\/([a-z0-9-]+)$/.exec(p);
  if (u && istUnterstufeSeite(u[1])) return { ansicht: "unterstufe", seite: u[1], kanonisch: true };
  /* Kapitelseite: /kapitel/<slug> (lesbar, kapitelPfade.js); ältere Links /kapitel/<id> (z. B. ksdiff) werden umgeschrieben */
  const kap = /^kapitel\/([a-z0-9-]{2,80})$/.exec(p);
  if (kap) {
    const id = kapitelAusSlug(kap[1]);
    if (id) return { ansicht: "kapitel", kapitel: id, kanonisch: true };
    const alt = kapitelIdAusPfad(kap[1]);
    if (alt) return { ansicht: "kapitel", kapitel: alt, kanonisch: false };
  }
  /* Blog: /blog/<slug> (Slugs aus blogDaten.js) */
  const blog = /^blog\/([a-z0-9-]+)$/.exec(p);
  if (blog && istBlogBeitrag(blog[1])) return { ansicht: "blog", seite: blog[1], kanonisch: true };
  const k56 = /^klasse-([56])$/.exec(p);
  if (k56) return { ansicht: "unterstufe", seite: `klasse-${k56[1]}`, kanonisch: false };
  /* Zusammengelegt (21.10.): „Stammfunktion & Integral“ ist Teil des Integraltrainers – alte Links öffnen ihn bei „Stammfunktion“ */
  if (p === "stammfunktion" || p === "stammintegral") return { ansicht: "integrale", uebenArt: "stamm", kanonisch: false };
  const bl = buchLinkAufloesen(p);   // QR-Codes der gedruckten Schulbücher: /b1/25-1, /b2/s17
  if (bl) return bl;
  const e = NACH_PFAD.get(p);
  if (!e) return null;
  const { pfad, alias, werkzeug, bereich, ...ziel } = e;
  return ziel;
}

/* ---------- Feste Kurzlinks der gedruckten Schulbücher (QR-Codes) ----------
   /b1/25-1  Aufgabenblatt: Band 1, Seite 25, Aufgabe 1 – neue Aufgaben desselben Typs mit Lösungen (funcBlatt.jsx)
   /b1/s25   der „In der App“-Kasten auf Seite 25 – Seitenübersicht: Werkzeug der Stunde und alle Aufgabentypen der Seite
   /b1       der Kurs zum Buch
   Die Seitenzahlen sind die gedruckten (der Vorspann der Druckausgabe zählt römisch), also bleiben die Links
   auch bei späteren Auflagen gültig. NIE ändern: Die Adressen sind in gedruckte Bücher eingebrannt.
   Werkzeug je Seite: public/buecher/<ordner>/kaesten.json (viewer.mjs), Aufgabentypen: BUCH_TYPEN der Kurse.
   Öffentlich ohne Passwort: middleware.js (istOeffentlich). Test: tests/pfade.test.mjs. */
export const BUECHER = {
  1: { ordner: "ableitungen", titel: "Ableitungen", kurs: "diffkurs" },
  2: { ordner: "vektoren", titel: "Vektoren, Geraden und Ebenen", kurs: "vekkurs" },
  3: { ordner: "kurvendiskussion", titel: "Kurvendiskussion", kurs: null, start: "plotter", startName: "Kurvendiskussion" },   // noch kein Kurs: /b3 öffnet das Werkzeug Kurvendiskussion
};
export function buchLinkAufloesen(p) {
  const m = /^b([123])(?:\/(?:(\d{1,3})-([a-z]?\d{1,2}[a-z]?)|s(\d{1,3})))?$/.exec(p);
  if (!m) return null;
  const band = Number(m[1]);
  if (m[2]) return { ansicht: "blatt", band, seite: Number(m[2]), nr: m[3].replace(/^t/, "T"), kanonisch: true };
  if (m[4]) return { ansicht: "blatt", band, seite: Number(m[4]), kasten: true, kanonisch: true };
  return { ansicht: BUECHER[band].kurs || BUECHER[band].start, kanonisch: true };
}
/* Kurzlink in der Gegenrichtung (ohne Domain), z. B. buchLink(1, 25, "1") → "/b1/25-1", buchLink(1, 25) → "/b1/s25" */
export const buchLink = (band, seite, nr) => (nr == null ? `/b${band}/s${seite}` : `/b${band}/${seite}-${String(nr).toLowerCase()}`);

/* ---------- Gegenrichtung: Zustand der App → Pfad ---------- */
const UNTERZIELE = ["ziel", "foto", "trainer", "seite", "kurs"];

/* zustand: { ansicht, ziel, foto, klasse, trainer, seite, kurs, land }
   Liefert den Pfad mit führendem "/" oder null, wenn die Ansicht keinen Pfad hat. */
export function pfadFuer(zustand) {
  const z = zustand || {};
  if (z.ansicht === "klasse" && KLASSEN.includes(Number(z.klasse))) return `/klasse-${Number(z.klasse)}`;
  if (z.ansicht === "landeswettbewerb" && LAND_IDS.includes(z.land) && z.land !== "bw") return `/landeswettbewerb/${z.land}`;
  if (z.ansicht === "unterstufe" && z.seite && istUnterstufeSeite(z.seite)) return `/unterstufe/${z.seite}`;
  if (z.ansicht === "blatt" && BUECHER[z.band] && z.seite) return z.kasten ? buchLink(z.band, z.seite) : buchLink(z.band, z.seite, z.nr);
  if (z.ansicht === "blog" && z.seite && istBlogBeitrag(z.seite)) return `/blog/${z.seite}`;
  if (z.ansicht === "kapitel" && z.kapitel && kapitelPfad(z.kapitel)) return kapitelPfad(z.kapitel);
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
