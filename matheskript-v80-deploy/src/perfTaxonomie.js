/* ======================================================================
   perfTaxonomie.js – zentrale, versionierte Fehler-Taxonomie des Performance-Labs.

   Drei Hauptkategorien, darunter Fehlertypen, darunter Untertypen. Der mathematische
   KONTEXT (Algebra, Ableitung …) ist bewusst getrennt vom Fehlertyp: Dasselbe falsche
   Ergebnis beweist nicht dieselbe Ursache, und derselbe Fehlertyp kann in verschiedenen
   Kontexten verschiedene Untertypen haben.

   Die Fehlertyp-IDs der bisherigen „Meine Fehler üben“-Seite (trainingDaten.js) bleiben
   unverändert gültig, damit beide Seiten dieselbe Sprache sprechen.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

export const TAXONOMIE_VERSION = 1;

export const HAUPTKATEGORIEN = {
  fokus:        { name: "Fokusfehler", kurz: "Die Methode ist bekannt, aber die Aufmerksamkeit war woanders (abschreiben, übersehen)." },
  verfahren:    { name: "Verfahrensfehler", kurz: "Die Methode ist bekannt, wird aber an einer Stelle falsch ausgeführt." },
  verstaendnis: { name: "Verständnisfehler", kurz: "Die Regel oder das Konzept dahinter ist noch nicht sicher." },
};

/* Mathematische Kontexte (wo der Fehler auftritt) */
export const KONTEXTE = {
  klammern:   { name: "Klammern auflösen" },
  umformung:  { name: "Äquivalenzumformung" },
  ableiten:   { name: "Ableiten" },
  terme:      { name: "Ausmultiplizieren und Zusammenfassen" },
  gleichungen: { name: "Gleichungen" },
  integrale:  { name: "Integrale" },
  stochastik: { name: "Stochastik" },
  vektoren:   { name: "Vektoren" },
  kurven:     { name: "Kurvendiskussion" },
  brueche:    { name: "Bruchrechnen" },
  allgemein:  { name: "Allgemein" },
};

const U = (o) => ({ allgemein: "Untertyp noch offen", ...o });

/* haupt: Hauptkategorie · untertypen: id → Name · training: gibt es dafür schon geprüfte Trainingsaufgaben? */
export const FEHLERTYPEN_TAX = {
  /* ---- Fokusfehler ---- */
  abschreiben: { name: "Abschreibfehler", haupt: "fokus", training: false,
    untertypen: U({ zeichen: "Zeichen oder Zahl falsch übernommen" }) },
  uebersehen:  { name: "Etwas übersehen", haupt: "fokus", training: false,
    untertypen: U({ aufgabenteil: "Aufgabenteil oder Bedingung übersehen" }) },

  /* ---- Verfahrensfehler ---- */
  vorzeichen:  { name: "Vorzeichenfehler", haupt: "verfahren", training: true,
    untertypen: U({
      minus_klammer: "Minus vor einer Klammer nicht korrekt verteilt",
      umstellen: "Vorzeichen beim Umstellen / bei Äquivalenzumformungen",
      ableiten: "Vorzeichen beim Ableiten",
      zusammenfassen: "Vorzeichen beim Ausmultiplizieren und Zusammenfassen",
    }) },
  ausmultiplizieren: { name: "Klammer ausmultiplizieren", haupt: "verfahren", training: false, untertypen: U({}) },
  pqformel:    { name: "p/2 in der pq-Formel", haupt: "verfahren", training: false, untertypen: U({}) },
  potenzregel: { name: "Potenzregel", haupt: "verfahren", training: false, untertypen: U({}) },
  kettenregel: { name: "Kettenregel (innere Ableitung)", haupt: "verfahren", training: false, untertypen: U({}) },
  grenzen:     { name: "Integrationsgrenzen", haupt: "verfahren", training: false, untertypen: U({}) },
  bruchaddition: { name: "Brüche addieren", haupt: "verfahren", training: false, untertypen: U({}) },
  bruchdivision: { name: "Durch einen Bruch teilen", haupt: "verfahren", training: false, untertypen: U({}) },
  mittelterm:  { name: "Mittelterm der binomischen Formel", haupt: "verfahren", training: false, untertypen: U({}) },
  betragswurzel: { name: "Länge eines Vektors", haupt: "verfahren", training: false, untertypen: U({}) },
  binomkoeff:  { name: "Anzahl der Pfade", haupt: "verfahren", training: false, untertypen: U({}) },

  /* ---- Verständnisfehler ---- */
  loesungsanzahl: { name: "Lösung geht verloren", haupt: "verstaendnis", training: false, untertypen: U({}) },
  stammfunktion:  { name: "Aufleiten statt Ableiten", haupt: "verstaendnis", training: false, untertypen: U({}) },
  flaechenvorzeichen: { name: "Fläche mit Vorzeichenwechsel", haupt: "verstaendnis", training: false, untertypen: U({}) },
  ereignisgrenze: { name: "Ereignisgrenze (≥ oder >)", haupt: "verstaendnis", training: false, untertypen: U({}) },
  normalenwinkel: { name: "Winkel zur Ebene (Normalenwinkel)", haupt: "verstaendnis", training: false, untertypen: U({}) },
  nachweis:    { name: "Extremstelle ohne Kriterium", haupt: "verstaendnis", training: false, untertypen: U({}) },
  ableitungsstufe: { name: "f′ statt f″", haupt: "verstaendnis", training: false, untertypen: U({}) },
};
export const TYP_IDS = Object.keys(FEHLERTYPEN_TAX);

/* Welcher Kontext gehört zu den bisherigen Themen der Trainingsseite? */
export const KONTEXT_AUS_THEMA = {
  ableiten: "ableiten", gleichungen: "gleichungen", brueche: "brueche", terme: "terme", kurven: "kurven",
  integrale: "integrale", bernoulli: "stochastik", vektoren: "vektoren",
};

export const typName = (typ) => FEHLERTYPEN_TAX[typ]?.name || "Noch nicht zugeordnet";
export const hauptName = (typ) => HAUPTKATEGORIEN[FEHLERTYPEN_TAX[typ]?.haupt]?.name || "Noch nicht zugeordnet";
export const untertypName = (typ, untertyp) => FEHLERTYPEN_TAX[typ]?.untertypen?.[untertyp] || null;
export const kontextName = (k) => KONTEXTE[k]?.name || KONTEXTE.allgemein.name;

/* Gültige Kombination? Unbekannte Untertypen werden NICHT erfunden, sondern zu „allgemein“. */
export function normiereTyp(typ, untertyp) {
  if (!FEHLERTYPEN_TAX[typ]) return null;
  const u = FEHLERTYPEN_TAX[typ].untertypen;
  return { typ, haupt: FEHLERTYPEN_TAX[typ].haupt, untertyp: untertyp && u[untertyp] ? untertyp : "allgemein" };
}

/* Typen, die der Nutzer manuell wählen kann – mit Hinweis, ob schon trainierbar */
export const typListe = () => TYP_IDS.map((id) => ({ id, name: FEHLERTYPEN_TAX[id].name, haupt: FEHLERTYPEN_TAX[id].haupt, training: FEHLERTYPEN_TAX[id].training }));
