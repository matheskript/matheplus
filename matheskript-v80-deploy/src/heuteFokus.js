/* ======================================================================
   heuteFokus.js – „Heute“ auf der Startseite: Was steht konkret an?
   Reine Logik (kein React, kein Speicher). Die Karte (funcHeuteKarte.jsx) übergibt Protokoll,
   Trainingsstand T, gespeichertes Kapitel usw.

   Statt „Ableitungstrainer“ sagt die Karte „Produktregel trainieren“: Jedes Werkzeug hat Einheiten
   (EINHEITEN). Werkzeuge ohne eigene Liste bekommen sie aus ihrer Zeile in werkzeuge.js
   („Normalform, Scheitelform, Nullstellen“ → drei Einheiten).

   Welche Einheit heute dran ist (einheitWahl):
     0. angefangen / geschafft – was heute schon läuft, bleibt den ganzen Tag stehen
     1. schwach   – zuletzt unter 60 % richtig (mindestens 3 Aufgaben)       → nochmal
     2. neu       – noch nie geübt, in der Reihenfolge der Liste              → als Nächstes
     3. dran      – am längsten nicht mehr geübt                              → wieder dran
     Werkzeuge, die nicht je Einheit buchen, wechseln täglich reihum (grund „tag“);
     Lernweg-Werkzeuge (Funktionen) machen dort weiter, wo der Schüler steht (grund „weiter“).
   Erledigt heute: so viele gebuchte Aufgaben der Einheit (bzw. des Werkzeugs) wie die Einheit vorsieht.
   Test: tests/heuteFokus.test.mjs
   ====================================================================== */
import { WERKZEUGE } from "./werkzeuge.js";
import { FEHLERTYPEN, wiederkehrende, einzelne } from "./trainingDaten.js";

export const TAG_MS = 864e5;
export const SCHWACH_UNTER = 0.6;
export const SCHWACH_AB_N = 3;

/* Kapitel des Lernwegs „Funktionen: Grundlagen“ (Reihenfolge wie in funcFunktionen.jsx) */
export const FUNKTIONEN_SPEICHER = "matheplus-funktionen-kapitel";
export const FEHLER_ZIEL_SPEICHER = "mm-fehler-ziel";

/* ---------- Einheiten je Werkzeug ----------
   titel: konkreter Auftrag · kurz: Wort fürs Medaillon · inhalt: was drankommt (Pillen)
   aufgaben/min: Umfang heute · art: Startmodus fürs Werkzeug (uebenWunsch) · kapitel: Lernweg-Kapitel
   passt(e): gehört ein Protokolleintrag zu dieser Einheit? */
const art = (a) => (e) => e.art === a;
const gruppe = (...g) => (e) => g.includes(e.gruppe);

export const EINHEITEN = {
  funktionen: [
    { id: "begriff", kapitel: "begriff", titel: "Funktionsbegriff klären", kurz: "Begriff", inhalt: ["Zuordnung lesen", "$f(x)$ einsetzen", "Graph oder nicht?"], aufgaben: 5, min: 8 },
    { id: "potenz", kapitel: "potenz", titel: "Potenzfunktionen erkennen", kurz: "Potenz", inhalt: ["gerade/ungerade Hochzahl", "Symmetrie", "negative Hochzahl"], aufgaben: 5, min: 8 },
    { id: "wurzel", kapitel: "wurzel", titel: "Wurzelfunktionen verstehen", kurz: "Wurzel", inhalt: ["$\\sqrt{x} = x^{\\frac{1}{2}}$", "Definitionsbereich", "Graph verschieben"], aufgaben: 5, min: 8 },
    { id: "umkehr", kapitel: "umkehr", titel: "Umkehrfunktion bilden", kurz: "Umkehr", inhalt: ["nach x auflösen", "x und y tauschen", "D und W tauschen"], aufgaben: 5, min: 10 },
    { id: "verkettung", kapitel: "verkettung", titel: "Verkettungen bilden", kurz: "Verkettung", inhalt: ["$f(g(x))$ einsetzen", "innen und außen", "Reihenfolge zählt"], aufgaben: 5, min: 10 },
    { id: "dw", kapitel: "dw", titel: "D und W bestimmen", kurz: "D und W", inhalt: ["Nenner $≠ 0$", "unter der Wurzel $≥ 0$", "$\\ln$ braucht $> 0$"], aufgaben: 6, min: 10 },
    { id: "mix", kapitel: "mix", titel: "Alles gemischt", kurz: "Gemischt", inhalt: ["alle Aufgabentypen", "ohne Spickzettel", "Abi-Niveau"], aufgaben: 6, min: 12 },
  ],
  ableitungstrainer: [   // = die Regeln des Ableitungstrainers (REGEL_CHIPS in funcRegelwerk.jsx), seit 22.10.
    { id: "produkt", art: "produkt", titel: "Produktregel trainieren", kurz: "Produkt", inhalt: ["$u′·v + u·v′$", "Bausteine $u$ und $v$", "$f′$ zusammensetzen"], aufgaben: 4, min: 8, passt: art("produkt") },
    { id: "quotient", art: "quotient", titel: "Quotientenregel trainieren", kurz: "Quotient", inhalt: ["$\\frac{u′v − uv′}{v^2}$", "Nenner quadrieren", "Zähler vereinfachen"], aufgaben: 4, min: 9, passt: art("quotient") },
    { id: "reziprok", art: "reziprok", titel: "Reziprokenregel trainieren", kurz: "Reziprok", inhalt: ["$\\left(\\frac{1}{v}\\right)′ = −\\frac{v′}{v^2}$", "Nenner ableiten", "Vorzeichen beachten"], aufgaben: 4, min: 7, passt: art("reziprok") },
    { id: "linkette", art: "linkette", titel: "Lineare Kettenregel trainieren", kurz: "Lin. Kette", inhalt: ["$u(mx + c)$", "außen ableiten", "mal $m$"], aufgaben: 4, min: 7, passt: art("linkette") },
    { id: "kette", art: "kette", titel: "Kettenregel trainieren", kurz: "Kette", inhalt: ["äußere mal innere Ableitung", "$e^{2x + 3}$", "$(ax + b)^n$"], aufgaben: 4, min: 8, passt: art("kette") },
    { id: "gold", art: "gold", titel: "Alle Ableitungsregeln gemischt", kurz: "Alle Regeln", inhalt: ["Regel erkennen", "Regeln kombinieren", "Abi-Niveau"], aufgaben: 4, min: 10, passt: art("gold") },
  ],
  steckbrief: [
    { id: "p2", art: "poly-2", titel: "Parabel aus Eigenschaften", kurz: "Grad 2", inhalt: ["Scheitelpunkt", "Punktprobe", "3 Bedingungen"], aufgaben: 2, min: 8, passt: gruppe("poly-p2") },
    { id: "p3", art: "poly-3", titel: "Funktion 3. Grades aufstellen", kurz: "Grad 3", inhalt: ["Hoch- und Tiefpunkt", "$f′(x) = 0$ nutzen", "LGS lösen"], aufgaben: 2, min: 10, passt: gruppe("poly-p3", "poly-p3u") },
    { id: "p4", art: "poly-4", titel: "Grad 4 mit Symmetrie", kurz: "Grad 4", inhalt: ["achsensymmetrisch", "Wendepunkt: $f″ = 0$", "nur gerade Hochzahlen"], aufgaben: 2, min: 12, passt: gruppe("poly-p4g") },
    { id: "ek", art: "adv-ek", titel: "e-Funktion bestimmen", kurz: "e-Funktion", inhalt: ["$c·e^{k·x}$", "zwei Punkte", "$\\ln$ anwenden"], aufgaben: 2, min: 8, passt: gruppe("adv-ek", "adv-exp") },
    { id: "sin", art: "adv-sin", titel: "Sinus aus dem Graphen", kurz: "Sinus", inhalt: ["Amplitude $a$", "Periode → $b$", "Verschiebung $d$"], aufgaben: 2, min: 8, passt: gruppe("adv-sin") },
  ],
  kurvendiskussion: [
    { id: "nullstellen", titel: "Nullstellen und Symmetrie", kurz: "Nullstellen", inhalt: ["$f(x) = 0$", "ausklammern", "$f(−x)$ prüfen"], aufgaben: 1, min: 8 },
    { id: "extrem", titel: "Hoch- und Tiefpunkte", kurz: "Extrempunkte", inhalt: ["$f′(x) = 0$", "$f″$ entscheidet", "y-Wert einsetzen"], aufgaben: 1, min: 10 },
    { id: "wende", titel: "Wendepunkte und Krümmung", kurz: "Wendepunkte", inhalt: ["$f″(x) = 0$", "$f‴ ≠ 0$", "Wendetangente"], aufgaben: 1, min: 10 },
  ],
  integrale: [
    { id: "stamm", art: "stamm", titel: "Stammfunktionen bilden", kurz: "Stammfkt.", inhalt: ["Hochzahl plus 1", "durch neue Hochzahl", "$+ C$"], aufgaben: 4, min: 8 },
    { id: "hauptsatz", art: "bestimmt", titel: "Integral mit dem Hauptsatz", kurz: "Hauptsatz", inhalt: ["$F$ bilden", "$F(b) − F(a)$", "sauber einsetzen"], aufgaben: 3, min: 10 },
    { id: "flaeche", titel: "Flächen mit Vorzeichenwechsel", kurz: "Flächen", inhalt: ["Nullstellen zuerst", "Teilflächen", "Beträge addieren"], aufgaben: 3, min: 10 },
    { id: "zwischen", titel: "Fläche zwischen zwei Graphen", kurz: "Zwischen", inhalt: ["Schnittstellen", "$\\int (f − g)\\,dx$", "oben minus unten"], aufgaben: 3, min: 10 },
    { id: "bestand", titel: "Bestand aus Änderungsrate", kurz: "Bestand", inhalt: ["Anfangsbestand", "+ Integral", "Einheiten lesen"], aufgaben: 3, min: 10 },
  ],
  sinus: [
    { id: "parameter", titel: "Parameter a, b, c, d deuten", kurz: "Parameter", inhalt: ["Amplitude $a$", "Periode $\\frac{2π}{b}$", "Verschiebung $c$ und $d$"], aufgaben: 4, min: 8 },
    { id: "graph", titel: "Sinusfunktion aus dem Graphen", kurz: "Graph lesen", inhalt: ["Mittellinie finden", "Periode ablesen", "Startpunkt bestimmen"], aufgaben: 4, min: 8 },
  ],
  wachstum: [
    { id: "faktor", titel: "Wachstumsfaktor bestimmen", kurz: "Faktor", inhalt: ["$f(t) = c·a^t$", "Prozent → Faktor", "linear oder exponentiell?"], aufgaben: 4, min: 8 },
    { id: "halbwert", titel: "Halbwertszeit berechnen", kurz: "Halbwert", inhalt: ["$a^t = \\frac{1}{2}$", "Logarithmus", "Verdopplungszeit"], aufgaben: 4, min: 8 },
    { id: "ziel", titel: "Wann ist der Zielwert erreicht?", kurz: "Zielwert", inhalt: ["Gleichung aufstellen", "$\\ln$ auf beiden Seiten", "Ergebnis deuten"], aufgaben: 4, min: 9 },
  ],
  scharen: [
    { id: "punkte", titel: "Punkte einer Schar berechnen", kurz: "Scharpunkte", inhalt: ["Parameter $a$ mitführen", "$f_a′(x) = 0$", "Fallunterscheidung"], aufgaben: 3, min: 10 },
    { id: "ortskurve", titel: "Ortskurve aufstellen", kurz: "Ortskurve", inhalt: ["$x$ nach $a$ auflösen", "in $y$ einsetzen", "Kurve deuten"], aufgaben: 3, min: 10 },
  ],
  optimierung: [
    { id: "schachtel", titel: "Schachtel mit größtem Volumen", kurz: "Schachtel", inhalt: ["Zielfunktion $V(x)$", "Nebenbedingung", "Definitionsbereich"], aufgaben: 1, min: 12 },
    { id: "flaeche", titel: "Größtes Rechteck unter dem Graphen", kurz: "Fläche", inhalt: ["$A(u) = u·f(u)$", "$A′(u) = 0$", "Randwerte prüfen"], aufgaben: 1, min: 12 },
  ],
  textaufgaben: [
    { id: "uebersetzen", titel: "Text in Bedingungen übersetzen", kurz: "Übersetzen", inhalt: ["Information → Gleichung", "Variable festlegen", "erst übersetzen, dann rechnen"], aufgaben: 4, min: 10 },
  ],
  kreuzprodukt: [
    { id: "kreuz", titel: "Kreuzprodukt sicher rechnen", kurz: "Kreuzprodukt", inhalt: ["$\\vec a × \\vec b$", "Komponenten über Kreuz", "Probe mit Skalarprodukt"], aufgaben: 4, min: 8 },
  ],
  dreipunkte: [
    { id: "ebene", titel: "Ebene aus drei Punkten", kurz: "Ebene", inhalt: ["Spannvektoren", "Normalenvektor", "Koordinatenform"], aufgaben: 3, min: 10 },
  ],
  kongruenz: [
    { id: "saetze", titel: "Kongruenzsätze anwenden", kurz: "Kongruenz", inhalt: ["SSS und SWS", "WSW", "SsW – wann eindeutig?"], aufgaben: 5, min: 8 },
  ],
};

/* Werkzeuge ohne eigene Liste: Einheiten aus der Zeile in werkzeuge.js */
const STANDARD = { aufgaben: 5, min: 8 };
export function zeilenTeile(zeile) {
  if (!zeile) return [];
  const teile = zeile.split(/,\s+/).map((t) => t.trim()).filter(Boolean);
  return teile.length >= 2 && teile.length <= 5 && teile.every((t) => t.length <= 28) ? teile : [];
}
export function einheitenVon(id) {
  if (EINHEITEN[id]) return EINHEITEN[id];
  const w = WERKZEUGE[id];
  if (!w) return [];
  const teile = zeilenTeile(w.zeile);
  if (!teile.length) return [{ id: "ganz", titel: `${w.kurz || w.name} trainieren`, kurz: w.kurz || w.name, inhalt: w.zeile ? [w.zeile] : [], ...STANDARD, allgemein: true }];
  return teile.map((t, i) => ({ id: `t${i}`, titel: `${w.kurz || w.name}: ${t.charAt(0).toUpperCase()}${t.slice(1)}`, kurz: t, inhalt: teile, hervor: t, ...STANDARD, allgemein: true }));
}
/* Werkzeug bucht seine Aufgaben je Einheit? (sonst entscheidet der Tag) */
export const buchtJeEinheit = (id) => (EINHEITEN[id] || []).some((e) => typeof e.passt === "function");

/* ---------- Stand aus dem Protokoll ---------- */
export const tagNr = (ts) => { const d = new Date(ts); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / TAG_MS); };

/* Einträge eines Werkzeugs (Ansicht + weitere Ansichten aus werkzeuge.js) */
export function eintraegeVon(protokoll, werkzeugId) {
  const w = WERKZEUGE[werkzeugId];
  const ansichten = w ? [w.ziel.ansicht, ...(w.auch || [])] : [werkzeugId];
  return (protokoll || []).filter((e) => e && typeof e.richtig === "boolean" && ansichten.includes(e.bereich));
}

/* n, richtig, Quote der letzten 10, letzter Tag, heute */
export function standVon(liste, jetzt = Date.now()) {
  const sortiert = [...liste].sort((a, b) => (a.zeit || 0) - (b.zeit || 0));
  const n = sortiert.length;
  const ok = sortiert.filter((e) => e.richtig).length;
  const letzte = sortiert.slice(-10);
  const quote = letzte.length ? letzte.filter((e) => e.richtig).length / letzte.length : null;
  const zuletzt = n ? sortiert[n - 1].zeit || null : null;
  const heute = tagNr(jetzt);
  const heuteListe = sortiert.filter((e) => e.zeit && tagNr(e.zeit) === heute);
  return { n, ok, quote, zuletzt, tageHer: zuletzt ? heute - tagNr(zuletzt) : null, heute: heuteListe.length, heuteOk: heuteListe.filter((e) => e.richtig).length };
}

export function wannText(tageHer) {
  if (tageHer === null || tageHer === undefined) return null;
  if (tageHer <= 0) return "heute";
  if (tageHer === 1) return "gestern";
  if (tageHer < 7) return `vor ${tageHer} Tagen`;
  if (tageHer < 14) return "vor einer Woche";
  return `vor ${Math.floor(tageHer / 7)} Wochen`;
}

/* ---------- Welche Einheit ist heute dran? ---------- */
/* ohne: Einheiten-Ids, die heute schon ein anderer Eintrag belegt (tagesplan.js) */
export function einheitWahl(werkzeugId, { protokoll = [], jetzt = Date.now(), kapitel = null, ohne = [] } = {}) {
  const alleEinheiten = einheitenVon(werkzeugId);
  const liste = ohne.length && alleEinheiten.some((e) => !ohne.includes(e.id)) ? alleEinheiten.filter((e) => !ohne.includes(e.id)) : alleEinheiten;
  if (!liste.length) return null;
  const alle = eintraegeVon(protokoll, werkzeugId);
  const werkzeug = standVon(alle, jetzt);

  // Lernweg: dort weitermachen, wo der Schüler steht
  if (liste[0].kapitel) {
    const i = Math.max(0, liste.findIndex((e) => e.kapitel === kapitel));
    return { einheit: liste[i], index: i, anzahl: liste.length, grund: kapitel ? "weiter" : "neu", stand: null, werkzeug, fortschritt: i / liste.length };
  }

  if (buchtJeEinheit(werkzeugId)) {
    const staende = liste.map((e) => standVon(alle.filter(e.passt), jetzt));
    const geuebt = alleEinheiten.filter((e) => standVon(alle.filter(e.passt), jetzt).n > 0).length;
    const fortschritt = geuebt / alleEinheiten.length;
    const wahl = (i, grund) => ({ einheit: liste[i], index: alleEinheiten.indexOf(liste[i]), anzahl: alleEinheiten.length, grund, stand: staende[i], werkzeug, fortschritt });
    const idx = staende.map((s, i) => ({ s, i, e: liste[i] }));
    // heute angefangen bleibt stehen (sonst springt die Karte nach jeder Aufgabe), heute geschafft bleibt sichtbar
    const angefangen = idx.find(({ s, e }) => s.heute > 0 && s.heute < e.aufgaben);
    if (angefangen) return wahl(angefangen.i, "angefangen");
    const geschafft = idx.find(({ s, e }) => s.heute >= e.aufgaben);
    if (geschafft) return wahl(geschafft.i, "geschafft");
    const schwach = idx
      .filter(({ s }) => s.n >= SCHWACH_AB_N && s.quote !== null && s.quote < SCHWACH_UNTER)
      .sort((a, b) => a.s.quote - b.s.quote)[0];
    if (schwach) return wahl(schwach.i, "schwach");
    const neu = idx.find(({ s }) => s.n === 0);
    if (neu) return wahl(neu.i, "neu");
    const alt = [...idx].sort((a, b) => (a.s.zuletzt || 0) - (b.s.zuletzt || 0))[0];
    return wahl(alt.i, "dran");
  }

  // Werkzeug bucht nur im Ganzen: Einheit wechselt täglich reihum
  const i = ((tagNr(jetzt) % liste.length) + liste.length) % liste.length;
  return { einheit: liste[i], index: alleEinheiten.indexOf(liste[i]), anzahl: alleEinheiten.length, grund: werkzeug.n ? "tag" : "neu", stand: null, werkzeug, fortschritt: null };
}

export const GRUENDE = {
  schwach: { text: "Nochmal – zuletzt wackelig", ton: "warn" },
  neu: { text: "Neu für dich", ton: "neu" },
  dran: { text: "Wieder dran", ton: "ruhig" },
  angefangen: { text: "Heute angefangen", ton: "gold" },
  geschafft: { text: "Heute geschafft", ton: "gut" },
  weiter: { text: "Hier warst du stehen geblieben", ton: "ruhig" },
  tag: { text: "Heute im Fokus", ton: "ruhig" },
  fehler: { text: "Wiederkehrender Fehler", ton: "warn" },
  einzeln: { text: "Schon einmal passiert", ton: "warn" },
  vorsorge: { text: "Vorbeugend – kein Muster bisher", ton: "neu" },
  /* Einträge des Tagesplans (tagesplan.js) */
  nachholen: { text: "Nachgeholt – blieb liegen", ton: "warn" },
  wiederholung: { text: "Wiederholung fällig", ton: "ruhig" },
  warmup: { text: "Zum Aufwärmen", ton: "ruhig" },
  blatt: { text: "Jeden Tag von Hand", ton: "gold" },
  auftrag: { text: "Auftrag von Coach oder Lehrkraft", ton: "gold" },
  basis: { text: "Grundlage prüfen", ton: "neu" },
  check: { text: "Neustart nach Pause", ton: "warn" },
  kern: { text: "Dein Thema", ton: "ruhig" },
};

/* Erledigt heute? (nur wenn das Werkzeug bucht; Lernweg-Kapitel sind nicht messbar) */
export function erledigtHeute(w) {
  if (!w || w.einheit.kapitel) return false;
  const s = w.stand || w.werkzeug;
  return !!s && s.heute >= w.einheit.aufgaben;
}
/* Wie weit ist die Einheit heute? 0 … 1 (null = nicht messbar) */
export function heuteAnteil(w) {
  if (!w || w.einheit.kapitel) return null;
  const s = w.stand || w.werkzeug;
  return s ? Math.min(1, s.heute / w.einheit.aufgaben) : null;
}

/* ---------- Fehler: was genau ist heute dran? ---------- */
const VORSORGE = { analysis: "kettenregel", vektoren: "normalenwinkel", stochastik: "ereignisgrenze", gleichungen: "vorzeichen", bruchrechnen: "bruchdivision",
  prozent: "prozentbasis", geometrie: "hypotenuse", daten: "pfadregel", zahlen: "vorzeichen", textaufgaben: "vorzeichen", fundament: "ausmultiplizieren" };

export function fehlerFokus(T, thema, { protokoll = [], jetzt = Date.now() } = {}) {
  const wk = T ? wiederkehrende(T) : [];
  const ez = T ? einzelne(T) : [];
  const erster = wk[0] || ez[0] || null;
  const id = erster ? erster.id : VORSORGE[thema] || "vorzeichen";
  const typ = FEHLERTYPEN[id];
  const weitere = [...wk, ...ez].filter((x) => x.id !== id).slice(0, 2).map((x) => FEHLERTYPEN[x.id].name);
  const stand = standVon((protokoll || []).filter((e) => e && typeof e.richtig === "boolean" && e.bereich === "fehlertraining"), jetzt);
  return {
    id, typ, grund: wk.length ? "fehler" : ez.length ? "einzeln" : "vorsorge",
    anzahl: { wiederkehrend: wk.length, einzeln: ez.length, beobachtet: erster ? erster.n : 0 },
    weitere, stand,
    einheit: { id: `fehler-${id}`, titel: typ.name, kurz: kurzName(typ.name), inhalt: [typ.kurz], tipp: typ.tipp, aufgaben: 6, min: 6 },
  };
}
const kurzName = (n) => n.replace(/\s*\(.*\)\s*/, "").split(":")[0].trim();

/* ---------- Überblick über alle Einheiten des Tages ---------- */
export function tagesSumme(eintraege) {
  const min = eintraege.reduce((s, e) => s + (e.einheit ? e.einheit.min : 0), 0);
  const aufgaben = eintraege.reduce((s, e) => s + (e.einheit ? e.einheit.aufgaben : 0), 0);
  const erledigt = eintraege.filter((e) => e.erledigt).length;
  return { min, aufgaben, erledigt, anzahl: eintraege.length };
}
