/* ======================================================================
   trainingDaten.js – reine Mathematik und Auswertung für das persönliche
   Training (5 Minuten Mathe, Meine Fehler üben, Prüfungsmodus, Klausur
   nachbereiten, Erklär deinen Schritt). Kein React, kein Speicher.

   Jede Aufgabe kommt mit
     · der richtigen Antwort, berechnet mit den vorhandenen Rechenbausteinen
       (rechnen2.js, hypo.js, aufgaben2.js) – nie aus einem KI-Text,
     · typischen Fehlantworten, die jeweils einem Fehlertyp zugeordnet sind.
   Nur so lässt sich ein Fehler später sauber einer Ursache zuordnen.

   Aufgabe: { id, thema, variante, afb, punkte, sekunden, text, typ: "zahl" | "wahl",
              optionen, richtig            (wahl)
              wert, toleranz, einheit, eingabe   (zahl)
              fehler: [{ wert | wahl, typ, text }],
              hinweise: [Denkfrage, Regel, nächster Schritt],
              regeln: [{ name }], grundlage, loesung: [..], erklaer: {..} }
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import {
  bestimmt, flaeche, laenge, mischen, pAus, pInt, pNum, q, qAdd, qMul, qNum, qSub, skalar, wahl, winkelGeradeEbene, winkelZwischen, zz, zzOhne0,
} from "./rechnen2.js";
import { neueFlaechenAufgabe } from "./aufgaben2.js";
import { binomTabelle, kumuliert, pAb, pBis } from "./hypo.js";
import { KONTEXTE as NV_KONTEXTE, Phi, SIGMA_REGELN, TOL_P as NV_TOL_P, nvAufgabe, vert } from "./normal.js";

/* ---------- Anzeige ---------- */
const mi = (s) => String(s).replace(/-/g, "−");
export const dez = (v, st = 4) => mi(String(Math.round(v * 10 ** st) / 10 ** st).replace(".", ","));
const sgn = (b) => (b < 0 ? `- ${-b}` : `+ ${b}`);
const tm = (c, v) => (c === 0 ? "" : Math.abs(c) === 1 && v ? `${c < 0 ? "-" : "+"} ${v}` : `${c < 0 ? "-" : "+"} ${Math.abs(c)}${v}`);
const koef = (a) => (a === 1 ? "" : a === -1 ? "-" : String(a));
const klam = (v) => (v < 0 ? `(${v})` : String(v));
/* Regel A5: keine Hochzahl 1, kein „x^0“, kein „1·“ */
const xp = (n) => (n === 0 ? "" : n === 1 ? "x" : `x^{${n}}`);
const hoch = (t, n) => (n === 1 ? t : `${t}^{${n}}`);
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const bruchTex = (z, n) => { const g = ggT(z, n) || 1; z /= g; n /= g; if (n < 0) { z = -z; n = -n; } return n === 1 ? String(z) : `${z < 0 ? "-" : ""}\\frac{${Math.abs(z)}}{${n}}`; };
const bruchTxt = (z, n) => { const g = ggT(z, n) || 1; z /= g; n /= g; if (n < 0) { z = -z; n = -n; } return n === 1 ? mi(z) : `${mi(z)}/${n}`; };
const qTexS = (a) => bruchTex(a.z, a.n);
/* „= gekürzt“ nur anhängen, wenn sich der Bruch wirklich kürzen lässt */
const gekuerzt = (z, n) => (ggT(z, n) === 1 && n !== 1 ? "" : ` = ${bruchTex(z, n)}`);
/* Glieder einer Summe; leere (Koeffizient 0) fallen weg, ohne doppelte Leerzeichen */
const glieder = (...t) => t.filter(Boolean).join(" ");
const qTxt = (a) => bruchTxt(a.z, a.n);

/* ---------- Themen ---------- */
export const THEMEN = {
  ableiten:   { name: "Ableiten", gruppe: "Analysis", grund: false, tools: [{ ansicht: "ableitungstrainer", name: "Ableitungstrainer" }] },
  gleichungen:{ name: "Gleichungen lösen", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "gleichungen", name: "Gleichungen" }] },
  brueche:    { name: "Bruchrechnen", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "kopf", trainer: "bruchrechnen", name: "Bruchrechnen (Kopfrechnen)" }] },
  terme:      { name: "Terme und binomische Formeln", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "terme", name: "Terme und Potenzgesetze" }] },
  kurven:     { name: "Kurvendiskussion", gruppe: "Analysis", grund: false, tools: [{ ansicht: "plotter", name: "Polynomplotter" }] },
  integrale:  { name: "Integrale", gruppe: "Analysis", grund: false, tools: [{ ansicht: "integrale", name: "Integrale" }] },
  bernoulli:  { name: "Bernoulli-Ketten", gruppe: "Stochastik", grund: false, tools: [{ ansicht: "bernoulli", name: "Bernoulli-Kette" }] },
  vektoren:   { name: "Vektoren und Winkel", gruppe: "Vektoren", grund: false, tools: [{ ansicht: "winkel", name: "Winkel und Skalarprodukt" }, { ansicht: "vektorgenerator", name: "Rechnen mit Vektoren" }] },
  /* Grundlagen der Mittelstufe (Basisübungen für Quickfinder und Trainingsplan) */
  prozent:    { name: "Prozentrechnung", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "formeln", bereich: "unterstufe", name: "Formelsammlung · Unterstufe" }] },
  funktionen: { name: "Geraden und Parabeln", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "geradengleichung", name: "Geradengleichung" }, { ansicht: "parabeln", name: "Parabeln" }] },
  potenzen:   { name: "Potenzen, Wurzeln, Logarithmen", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "terme", name: "Terme und Potenzgesetze" }, { ansicht: "wachstum", name: "Wachstum und Logarithmen" }] },
  lgs:        { name: "Lineare Gleichungssysteme", gruppe: "Grundlagen", grund: false, tools: [{ ansicht: "lgs", name: "Gleichungssysteme" }] },
  geometrie:  { name: "Pythagoras und Trigonometrie", gruppe: "Geometrie", grund: false, tools: [{ ansicht: "trigonometrie", name: "Trigonometrie am Dreieck" }] },
  sinus:      { name: "Sinusfunktion", gruppe: "Analysis", grund: false, tools: [{ ansicht: "sinus", name: "Sinusfunktion" }] },
  wachstum:   { name: "Exponentielles Wachstum", gruppe: "Analysis", grund: false, tools: [{ ansicht: "wachstum", name: "Wachstum und Logarithmen" }] },
  wkt:        { name: "Wahrscheinlichkeit und Baumdiagramme", gruppe: "Stochastik", grund: false, tools: [{ ansicht: "vierfelder", name: "Vier-Felder-Tafel" }, { ansicht: "kombinatorik", name: "Urnen und Kombinatorik" }] },
  kreiskoerper: { name: "Kreis und Körper", gruppe: "Geometrie", grund: false, tools: [{ ansicht: "kreis", name: "Kreis und Kreisteile" }, { ansicht: "koerper", name: "Körper" }, { ansicht: "quader", name: "Quader und Würfel" }] },
  dreieckgeo: { name: "Winkel, Kongruenz, Strahlensätze", gruppe: "Geometrie", grund: false, tools: [{ ansicht: "winkelsaetze", name: "Winkel und Winkelsummen" }, { ansicht: "kongruenz", name: "Kongruenzsätze" }, { ansicht: "strahlensaetze", name: "Strahlensätze" }] },
  normal:     { name: "Normalverteilung", gruppe: "Stochastik", grund: false, tools: [{ ansicht: "normalverteilung", name: "Normalverteilung" }] },
};
export const THEMA_IDS = Object.keys(THEMEN);

/* ---------- Fehlertypen ---------- */
export const FEHLERTYPEN = {
  vorzeichen:       { name: "Vorzeichen", thema: "gleichungen", kurz: "Ein Vorzeichen wird beim Umformen, Einsetzen oder Ablesen verdreht.",
                      tipp: "Schreib jede Umformung in eine eigene Zeile und prüfe am Ende durch Einsetzen." },
  pqformel:         { name: "p/2 in der pq-Formel", thema: "gleichungen", kurz: "In der pq-Formel wird p statt p/2 verwendet.",
                      tipp: "Merke: x = −(p/2) ± √((p/2)² − q). Das p wird zuerst halbiert." },
  ausmultiplizieren:{ name: "Klammer ausmultiplizieren", thema: "gleichungen", kurz: "Der Faktor vor der Klammer wird nicht mit jedem Summanden multipliziert.",
                      tipp: "Jeder Summand in der Klammer bekommt den Faktor: a·(x + b) = a·x + a·b." },
  loesungsanzahl:   { name: "Lösung geht verloren", thema: "gleichungen", kurz: "Durch Teilen durch x geht die Lösung x = 0 verloren.",
                      tipp: "Nie durch einen Term mit x teilen. Stattdessen ausklammern und den Satz vom Nullprodukt nutzen." },
  potenzregel:      { name: "Potenzregel", thema: "ableiten", kurz: "Beim Ableiten von xⁿ wird der Exponent oder der Faktor n vergessen.",
                      tipp: "Aus xⁿ wird n·xⁿ⁻¹: Exponent nach vorn, dann um 1 verkleinern." },
  kettenregel:      { name: "Kettenregel (innere Ableitung)", thema: "ableiten", kurz: "Die innere Ableitung wird nicht mit der äußeren multipliziert.",
                      tipp: "Frag dich immer: Steckt in der Klammer oder im Exponenten mehr als nur x? Dann kommt die innere Ableitung dazu." },
  stammfunktion:    { name: "Aufleiten statt Ableiten", thema: "integrale", kurz: "Statt einer Stammfunktion wird die Ableitung gebildet.",
                      tipp: "Beim Integrieren geht der Exponent um 1 hoch und du teilst durch den neuen Exponenten." },
  grenzen:          { name: "Integrationsgrenzen", thema: "integrale", kurz: "Es wird nur die obere Grenze eingesetzt oder die Grenzen werden vertauscht.",
                      tipp: "Immer F(b) − F(a): obere Grenze minus untere Grenze, beide einsetzen." },
  flaechenvorzeichen:{ name: "Fläche mit Vorzeichenwechsel", thema: "integrale", kurz: "Bei einem Vorzeichenwechsel wird das Integral statt der Fläche berechnet.",
                      tipp: "Erst die Nullstellen bestimmen, dann je Teilintervall den Betrag des Integrals addieren." },
  ereignisgrenze:   { name: "Ereignisgrenze (≥ oder >)", thema: "bernoulli", kurz: "„mindestens“, „höchstens“, „mehr als“, „weniger als“ werden mit der falschen Grenze übersetzt.",
                      tipp: "Mehr als k heißt X ≥ k + 1, weniger als k heißt X ≤ k − 1. Schreib das Ereignis mit Ungleichung auf." },
  binomkoeff:       { name: "Anzahl der Pfade", thema: "bernoulli", kurz: "Der Binomialkoeffizient (Anzahl der Pfade) fehlt in der Bernoulli-Formel.",
                      tipp: "P(X = k) = (n über k)·pᵏ·(1−p)ⁿ⁻ᵏ. Es gibt mehrere Reihenfolgen mit k Treffern." },
  normalenwinkel:   { name: "Winkel zur Ebene (Normalenwinkel)", thema: "vektoren", kurz: "Der Winkel zum Normalenvektor wird mit dem Winkel zur Ebene verwechselt.",
                      tipp: "Gerade–Ebene: sin φ = |u·n| / (|u|·|n|). Mit Kosinus erhältst du den Winkel zum Normalenvektor, also 90° − φ." },
  betragswurzel:    { name: "Länge eines Vektors", thema: "vektoren", kurz: "Bei der Länge fehlt die Wurzel oder es werden die Beträge der Koordinaten addiert.",
                      tipp: "|v| = √(v₁² + v₂² + v₃²): erst quadrieren, dann addieren, dann die Wurzel ziehen." },
  nachweis:         { name: "Extremstelle ohne Kriterium", thema: "kurven", kurz: "f′(x) = 0 oder f″(x) = 0 allein reicht nicht als Nachweis.",
                      tipp: "Extremstelle: f′ wechselt das Vorzeichen (oder f′ = 0 und f″ ≠ 0). Wendestelle: f″ wechselt das Vorzeichen." },
  ableitungsstufe:  { name: "f′ statt f″", thema: "kurven", kurz: "Für die Wendestelle wird f′ = 0 gelöst statt f″ = 0.",
                      tipp: "Extremstellen: f′ = 0. Wendestellen: f″ = 0. Notiere zuerst, welche Stelle gesucht ist." },
  bruchaddition:    { name: "Brüche addieren", thema: "brueche", kurz: "Zähler und Nenner werden einzeln addiert.",
                      tipp: "Erst auf den gemeinsamen Nenner erweitern, dann nur die Zähler addieren." },
  bruchdivision:    { name: "Durch einen Bruch teilen", thema: "brueche", kurz: "Beim Teilen durch einen Bruch wird nicht der Kehrwert genommen.",
                      tipp: "Durch einen Bruch teilen heißt: mit dem Kehrwert malnehmen." },
  mittelterm:       { name: "Mittelterm der binomischen Formel", thema: "terme", kurz: "Beim Ausmultiplizieren von (x ± a)² fehlt der Mittelterm 2ax.",
                      tipp: "(x ± a)² ist nicht x² ± a². Schreib (x ± a)(x ± a) aus." },
};
Object.assign(FEHLERTYPEN, {
  prozentbasis:     { name: "Prozent: falscher Bezug", thema: "prozent", kurz: "Prozent werden nicht durch 100 geteilt oder auf den falschen Grundwert bezogen.",
                      tipp: "Frag immer zuerst: Was sind hier 100 %? Dann W = G · p/100." },
  steigungsdreieck: { name: "Steigung vertauscht", thema: "funktionen", kurz: "Bei der Steigung werden x- und y-Unterschied vertauscht.",
                      tipp: "m = (y₂ − y₁) : (x₂ − x₁) – nach oben durch nach rechts." },
  scheitelvorzeichen:{ name: "Scheitelpunkt: Vorzeichen", thema: "funktionen", kurz: "Beim quadratischen Ergänzen oder bei −b/2 wird ein Vorzeichen verdreht.",
                      tipp: "x-Koordinate des Scheitels: −b/2. Danach in f einsetzen und prüfen." },
  potenzgesetz:     { name: "Potenzgesetze", thema: "potenzen", kurz: "Exponenten werden multipliziert statt addiert oder beim Teilen addiert.",
                      tipp: "Gleiche Basis: mal → Exponenten plus, geteilt → Exponenten minus." },
  teilwurzel:       { name: "Teilweise Wurzel ziehen", thema: "potenzen", kurz: "Vor die Wurzel kommt der Quadratfaktor statt seiner Wurzel.",
                      tipp: "√(k²·m) = k·√m – aus der Quadratzahl die Wurzel ziehen." },
  logdefinition:    { name: "Exponentialgleichung", thema: "potenzen", kurz: "Vorfaktor nicht zuerst abgeteilt oder Wert statt Exponent angegeben.",
                      tipp: "Erst die Potenz allein stellen, dann logarithmieren: bˣ = y ⇔ x = log_b(y)." },
  hypotenuse:       { name: "Pythagoras: welche Seite?", thema: "geometrie", kurz: "Die Hypotenuse wird falsch zugeordnet oder Seiten statt Quadrate addiert.",
                      tipp: "Die Hypotenuse liegt dem rechten Winkel gegenüber: a² + b² = c²." },
  sinkos:           { name: "Sinus, Kosinus, Tangens verwechselt", thema: "geometrie", kurz: "Die Winkelfunktion passt nicht zu den beteiligten Seiten.",
                      tipp: "GAGA-HHAG: sin = G/H, cos = A/H, tan = G/A. Erst die Seiten von α aus benennen." },
  pfadregel:        { name: "Pfadregel", thema: "wkt", kurz: "Entlang eines Pfades wird addiert statt multipliziert.",
                      tipp: "Entlang eines Pfades multiplizieren, verschiedene Pfade addieren." },
  zuruecklegen:     { name: "Ohne Zurücklegen", thema: "wkt", kurz: "Beim zweiten Zug wird mit der unveränderten Urne gerechnet.",
                      tipp: "Ohne Zurücklegen: Nach dem ersten Zug fehlt eine Kugel – Zähler und Nenner anpassen." },
  einsetzen:        { name: "LGS nicht zu Ende gelöst", thema: "lgs", kurz: "Nach dem Einsetzen wird die falsche Variable angegeben oder nicht zurückgerechnet.",
                      tipp: "Ein LGS ist erst gelöst, wenn beide Variablen bestimmt sind. Am Ende Probe in beiden Gleichungen." },
  periode:          { name: "Periode des Sinus", thema: "sinus", kurz: "Die Periode wird mit 2π·b statt 2π/b berechnet.",
                      tipp: "f(x) = a·sin(bx): Periode p = 2π/b. Großes b heißt kurze Periode." },
  wachstumsfaktor:  { name: "Linear statt exponentiell", thema: "wachstum", kurz: "Prozentuales Wachstum wird wie lineares Wachstum gerechnet.",
                      tipp: "Jedes Jahr mit q = 1 + p/100 multiplizieren: B(n) = B₀ · qⁿ." },
  durchmesser:      { name: "Radius und Durchmesser", thema: "kreiskoerper", kurz: "Mit dem Durchmesser statt mit dem Radius gerechnet.",
                      tipp: "Die Kreisformeln brauchen r. Ist der Durchmesser gegeben: r = d : 2." },
  kreisformel:      { name: "Umfang und Fläche verwechselt", thema: "kreiskoerper", kurz: "Umfangs- und Flächenformel des Kreises werden verwechselt.",
                      tipp: "Umfang u = 2πr ist eine Länge (r einfach), Fläche A = πr² (r im Quadrat)." },
  kreisanteil:      { name: "Anteil am Vollkreis", thema: "kreiskoerper", kurz: "Bogen oder Kreisausschnitt nicht mit α : 360° berechnet.",
                      tipp: "Ein Vollkreis hat 360°: Bogen b = 2πr · α : 360°, Ausschnitt A = πr² · α : 360°." },
  oberflaeche:      { name: "Oberfläche unvollständig", thema: "kreiskoerper", kurz: "Bei der Oberfläche fehlen Flächen, oder Volumen und Oberfläche werden verwechselt.",
                      tipp: "Zähle alle Flächen des Netzes: Quader 2(ab + ac + bc), Zylinder 2πr² + 2πrh." },
  grundflaeche:     { name: "Grundfläche des Prismas", thema: "kreiskoerper", kurz: "Die Grundfläche wird falsch berechnet oder nicht mit der Höhe multipliziert.",
                      tipp: "Prisma: V = G · h. Dreieck als Grundfläche: G = ½ · g · h_g." },
  drittel:          { name: "Faktor ⅓ bei Spitzkörpern", thema: "kreiskoerper", kurz: "Bei Pyramide oder Kegel fehlt der Faktor 1/3.",
                      tipp: "Spitze Körper: V = ⅓ · G · h – drei Pyramiden füllen ein Prisma mit gleicher Grundfläche und Höhe." },
  kugelformel:      { name: "Kugelformeln", thema: "kreiskoerper", kurz: "Volumen- und Oberflächenformel der Kugel werden verwechselt.",
                      tipp: "V = 4/3 · πr³ (Rauminhalt, r hoch 3), O = 4πr² (Fläche, r hoch 2)." },
  winkelsumme:      { name: "Winkelsumme", thema: "dreieckgeo", kurz: "Mit der falschen Winkelsumme gerechnet.",
                      tipp: "Dreieck 180°, Viereck 360°, n-Eck (n − 2) · 180°." },
  kongruenzsatz:    { name: "Kongruenzsatz erkennen", thema: "dreieckgeo", kurz: "Die Lage des gegebenen Winkels (eingeschlossen oder gegenüber) wird nicht beachtet.",
                      tipp: "SWS: Winkel zwischen den Seiten. WSW: Seite zwischen den Winkeln. SsW: Winkel gegenüber der größeren Seite." },
  strahlverhaeltnis:{ name: "Strahlensatz: falsches Verhältnis", thema: "dreieckgeo", kurz: "Teilstrecke statt Strecke vom Zentrum benutzt oder Verhältnis umgedreht.",
                      tipp: "Beim 2. Strahlensatz immer vom Zentrum S aus messen: A′B′ : AB = SA′ : SA." },
  standardisieren:  { name: "Standardisieren", thema: "normal", kurz: "Der z-Wert wird falsch gebildet (Vorzeichen, σ² statt σ, μ vergessen).",
                      tipp: "z = (x − μ) : σ – der Abstand zu μ in Vielfachen von σ. Rückwärts: x = μ + z · σ." },
  gegenwkt:         { name: "Fläche links oder rechts?", thema: "normal", kurz: "Φ(z) für „mindestens“ benutzt oder 1 − Φ(z) für „höchstens“.",
                      tipp: "Φ ist immer die Fläche links: P(X ≤ x) = Φ(z), P(X ≥ x) = 1 − Φ(z)." },
  intervall:        { name: "Wahrscheinlichkeit für ein Intervall", thema: "normal", kurz: "Flächen addiert statt subtrahiert oder die Fläche außerhalb berechnet.",
                      tipp: "P(a ≤ X ≤ b) = Φ(z_b) − Φ(z_a)." },
  sigmaregel:       { name: "Sigma-Regeln", thema: "normal", kurz: "Die σ-Umgebung wird falsch erkannt.",
                      tipp: "μ ± σ: 68,3 %, μ ± 2σ: 95,4 %, μ ± 3σ: 99,7 %." },
  stetigkeit:       { name: "Stetigkeitskorrektur", thema: "normal", kurz: "Bei der Näherung der Binomialverteilung fehlt ± 0,5.",
                      tipp: "P(X ≤ k) ≈ Φ((k + 0,5 − μ) : σ) – die ganze Säule über k zählt mit." },
});
export const FEHLER_IDS = Object.keys(FEHLERTYPEN);

/* ---------- Gemeinsame Bausteine der Aufgaben ---------- */
let zaehler = 0;
const neuId = () => `t${Date.now().toString(36)}${++zaehler}`;
const rund = (v, st) => Math.round(v * 10 ** st) / 10 ** st;
/* Fehlerwerte bereinigen: nur Werte, die sich von der richtigen Antwort und voneinander unterscheiden */
function bereinigen(a) {
  if (a.typ === "zahl") {
    const gesehen = [a.wert];
    const rein = [];
    for (const f of a.fehler) {
      if (!isFinite(f.wert)) continue;
      if (gesehen.some((g) => Math.abs(g - f.wert) <= (a.abstand ?? a.toleranz * 4 + 1e-9))) continue;
      gesehen.push(f.wert); rein.push(f);
    }
    a.fehler = rein;
  }
  return a;
}

const REGEL_BRUCH_ADD = { name: "Brüche addieren", gruppe: "Bruchrechnen", f: "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}", kurz: "Erst auf den gemeinsamen Nenner bringen, dann die Zähler addieren.", beispiel: "$\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$" };
const REGEL_BRUCH_DIV = { name: "Durch einen Bruch teilen", gruppe: "Bruchrechnen", f: "\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}", kurz: "Durch einen Bruch teilen heißt: mit dem Kehrwert multiplizieren.", beispiel: "$\\frac{1}{2} : \\frac{1}{4} = \\frac{1}{2} \\cdot 4 = 2$" };
const GRUND_BRUCH = { name: "Bruchrechnen", trainer: "bruchrechnen", grund: "Brüche sind die Grundlage für fast jede Rechnung in der Oberstufe. Ein kurzer Check hilft dir weiter." };

/* ======================================================================
   GENERATOREN – jeder liefert eine Aufgabe und nennt die Fehlertypen, die er auslösen kann
   ====================================================================== */
export const GENERATOREN = [];
const reg = (g) => { GENERATOREN.push(g); return g; };

/* ---------- Ableiten ---------- */
reg({ id: "abl-potenz", thema: "ableiten", afb: 1, fuer: ["potenzregel", "vorzeichen"], mach() {
  const a = zz(2, 6), n = wahl([2, 3, 4]), b = zzOhne0(-5, 5), x0 = wahl([1, 2, 3, -1, -2]);
  const richtig = a * n * x0 ** (n - 1) + b;
  const fehler = [
    { wert: a * n * x0 ** n + b, typ: "potenzregel", text: "Beim Ableiten sinkt der Exponent um 1: aus x^n wird n·x^(n−1). Du hast den Exponenten nicht verkleinert." },
    { wert: a * x0 ** (n - 1) + b, typ: "potenzregel", text: "Der Exponent n muss als Faktor nach vorn: (a·x^n)′ = a·n·x^(n−1)." },
  ];
  if (x0 < 0 && n % 2 === 0) fehler.push({ wert: a * n * Math.abs(x0) ** (n - 1) + b, typ: "vorzeichen", text: `Achte beim Einsetzen auf das Vorzeichen: ${n - 1} ist ungerade, also bleibt (${x0})^${n - 1} negativ.` });
  return bereinigen({
    daten: { a, n, b, x0 },
    text: `Gegeben ist $f(x) = ${koef(a)}x^{${n}} ${tm(b, "x")}$. Bestimme $f′(${x0})$.`, typ: "zahl", wert: richtig, toleranz: 1e-9, fehler,
    hinweise: ["Welche Ableitungsregel gehört zu einer Potenz $x^n$, und was passiert mit dem Summanden $b·x$?", "Potenzregel: $(x^n)′ = n·x^{n-1}$, Faktorregel: Konstante Faktoren bleiben stehen.", `Leite zuerst $f$ ab: $f′(x) = ${a * n}${xp(n - 1)} ${sgn(b)}$. Setze dann $x = ${x0}$ ein.`],
    regeln: [{ name: "Potenzregel" }, { name: "Faktorregel" }, { name: "Summenregel" }],
    loesung: [`$f′(x) = ${a * n}${xp(n - 1)} ${sgn(b)}$`, `$f′(${x0}) = ${a * n}·${hoch(klam(x0), n - 1)} ${sgn(b)} = ${mi(richtig)}$`],
    erklaer: erklaerAbleiten("potenz"),
  });
} });
reg({ id: "abl-kette", thema: "ableiten", afb: 2, fuer: ["kettenregel", "potenzregel"], mach() {
  const a = wahl([2, 3, -2, 4]), b = zzOhne0(-3, 3), n = wahl([2, 3, 4]), x0 = wahl([0, 1, 2, -1]);
  const innen = a * x0 + b;
  if (innen === 0) return this.mach();
  const richtig = n * a * innen ** (n - 1);
  const fehler = [
    { wert: n * innen ** (n - 1), typ: "kettenregel", text: `Hier steckt $${koef(a)}x ${sgn(b)}$ in der Klammer. Die innere Ableitung ${a} fehlt: Kettenregel heißt äußere Ableitung mal innere Ableitung.` },
    { wert: a * innen ** (n - 1), typ: "potenzregel", text: "Der Exponent n muss als Faktor nach vorn: aus $(\\dots)^n$ wird $n·(\\dots)^{n-1}$." },
    { wert: n * a * innen ** n, typ: "potenzregel", text: "Beim Ableiten sinkt der Exponent um 1. Der Exponent in der Klammer bleibt bei dir unverändert." },
  ];
  return bereinigen({
    daten: { a, b, n, x0 },
    text: `Gegeben ist $f(x) = (${koef(a)}x ${sgn(b)})^{${n}}$. Bestimme $f′(${x0})$.`, typ: "zahl", wert: richtig, toleranz: 1e-9, fehler,
    hinweise: ["Was ist die innere, was die äußere Funktion? Was gehört zur inneren Ableitung?", "Kettenregel: $f′(x) = u′(v(x)) · v′(x)$. Hier ist $v(x)$ der Term in der Klammer.", `Äußere Ableitung: $${n}·${hoch(`(${koef(a)}x ${sgn(b)})`, n - 1)}$, innere Ableitung: $${a}$. Multipliziere beide und setze $x = ${x0}$ ein.`],
    regeln: [{ name: "Kettenregel" }, { name: "Potenzregel" }],
    loesung: [`$f′(x) = ${n}·${hoch(`(${koef(a)}x ${sgn(b)})`, n - 1)} · ${klam(a)} = ${n * a}${n - 1 === 1 ? "" : "·"}${hoch(`(${koef(a)}x ${sgn(b)})`, n - 1)}$`, `$f′(${x0}) = ${n}·${hoch(klam(innen), n - 1)}·${klam(a)} = ${mi(richtig)}$`],
    erklaer: erklaerAbleiten("kette"),
  });
} });
reg({ id: "abl-exp", thema: "ableiten", afb: 2, fuer: ["kettenregel"], mach() {
  const c = wahl([2, 3, 4, 5, -2, -3]), k = wahl([2, 3, 4, -1, -2, -3]);
  const richtig = c * k;
  return bereinigen({
    daten: { c, k },
    text: `Es ist $f(x) = ${koef(c)}e^{${koef(k)}x}$. Die Ableitung hat die Form $f′(x) = c·e^{${koef(k)}x}$. Bestimme $c$.`, typ: "zahl", wert: richtig, toleranz: 1e-9,
    fehler: [{ wert: c, typ: "kettenregel", text: `Im Exponenten steht $${k}x$, nicht nur $x$. Die innere Ableitung ${k} muss als Faktor dazu.` },
             { wert: c * Math.abs(k), typ: "vorzeichen", text: "Auch das Vorzeichen der inneren Ableitung gehört zum Faktor." }],
    hinweise: ["Was steht im Exponenten, und wie leitest du diesen Teil ab?", "$(e^{kx})′ = k·e^{kx}$ – die innere Ableitung des Exponenten kommt als Faktor dazu.", `Multipliziere den Vorfaktor ${c} mit der inneren Ableitung ${k}.`],
    regeln: [{ name: "e-Funktion" }, { name: "Kettenregel" }],
    loesung: [`$f′(x) = ${c}·${klam(k)}·e^{${koef(k)}x} = ${mi(richtig)}e^{${koef(k)}x}$`, `$c = ${mi(richtig)}$`],
    erklaer: erklaerAbleiten("exp"),
  });
} });

/* ---------- Gleichungen ---------- */
reg({ id: "gl-quadrat", thema: "gleichungen", afb: 1, fuer: ["vorzeichen", "pqformel"], mach() {
  let r1 = zz(-6, 6), r2 = zz(-6, 6);
  while (r1 === r2) r2 = zz(-6, 6);
  const p = -(r1 + r2), qq = r1 * r2, gross = Math.max(r1, r2), klein = Math.min(r1, r2);
  const fehler = [{ wert: -klein, typ: "vorzeichen", text: "Prüfe die Vorzeichen: Die pq-Formel beginnt mit $-\\frac{p}{2}$. Setze die Lösung zur Probe in die Gleichung ein." }];
  const D = p * p - qq;
  if (D >= 0) fehler.push({ wert: -p + Math.sqrt(D), typ: "pqformel", text: "In der pq-Formel wird $p$ halbiert: $x = -\\frac{p}{2} ± \\sqrt{(\\frac{p}{2})^2 - q}$." });
  return bereinigen({
    daten: { p, q: qq, r1, r2 },
    text: `Löse $x^2 ${tm(p, "x")} ${sgn(qq)} = 0$. Gib die größere der beiden Lösungen an.`, typ: "zahl", wert: gross, toleranz: 1e-9, fehler,
    hinweise: ["Welche Verfahren kennst du für eine quadratische Gleichung der Form $x^2 + px + q = 0$?", "pq-Formel: $x_{1,2} = -\\frac{p}{2} ± \\sqrt{(\\frac{p}{2})^2 - q}$", `Hier ist $p = ${p}$ und $q = ${qq}$. Berechne erst $-\\frac{p}{2}$ und dann die Wurzel.`],
    regeln: [{ name: "Mitternachtsformel" }, { name: "Satz vom Nullprodukt" }],
    loesung: [`$p = ${p}$, $q = ${qq}$`, `$x_{1,2} = ${mi(-p / 2)} ± \\sqrt{${mi((p / 2) ** 2)} ${sgn(-qq)}} = ${mi(-p / 2)} ± ${Math.abs(r1 - r2) / 2}$`, `$x_1 = ${klein}$, $x_2 = ${gross}$`],
    erklaer: erklaerGleichung("quadrat"),
  });
} });
reg({ id: "gl-linear", thema: "gleichungen", afb: 1, fuer: ["ausmultiplizieren", "vorzeichen"], mach() {
  const a = zz(2, 5), b = zzOhne0(-5, 5), c = zzOhne0(-6, 6), x = zzOhne0(-5, 5);
  const d = a * (x + b) - c;
  const fehler = [
    { wert: (d + c - b) / a, typ: "ausmultiplizieren", text: `Der Faktor ${a} gehört vor jeden Summanden der Klammer: $${a}(x ${sgn(b)}) = ${a}x ${sgn(a * b)}$.` },
    { wert: (d - c) / a - b, typ: "vorzeichen", text: `Beim Umstellen wird die Zahl ${c} auf beiden Seiten durch die Gegenoperation beseitigt – achte auf das Vorzeichen.` },
  ];
  return bereinigen({
    daten: { a, b, c, d, x },
    text: `Löse die Gleichung $${a}(x ${sgn(b)}) ${sgn(-c)} = ${d}$.`, typ: "zahl", wert: x, toleranz: 1e-9, fehler, abstand: 1e-6,
    hinweise: ["Was musst du zuerst tun, um das $x$ aus der Klammer zu befreien?", "Ausmultiplizieren: Jeder Summand in der Klammer wird mit dem Faktor multipliziert.", `Schreibe $${a}x ${sgn(a * b)} ${sgn(-c)} = ${d}$ und stelle dann nach $x$ um.`],
    regeln: [{ name: "Distributivgesetz" }],
    loesung: [`$${a}x ${sgn(a * b)} ${sgn(-c)} = ${d}$`, `$${a}x = ${mi(d - a * b + c)}$`, `$x = ${mi(x)}$`],
    erklaer: erklaerGleichung("linear"),
  });
} });
reg({ id: "gl-ausklammern", thema: "gleichungen", afb: 2, fuer: ["loesungsanzahl"], mach() {
  const a = zz(2, 5), m = zz(2, 7), c = a * m;
  const opt = ["Keine Lösung", "Genau eine Lösung", "Genau zwei Lösungen", "Unendlich viele Lösungen"];
  return {
    daten: { a, m, c },
    text: `Wie viele Lösungen hat die Gleichung $${a}x^2 = ${c}x$?`, typ: "wahl", optionen: opt, richtig: 2,
    fehler: [{ wahl: 1, typ: "loesungsanzahl", text: `Wenn du durch $x$ teilst, verlierst du die Lösung $x = 0$. Besser: $${a}x^2 - ${c}x = 0$, ausklammern, $x(${a}x - ${c}) = 0$.` }],
    hinweise: ["Darfst du beide Seiten einfach durch $x$ teilen? Für welches $x$ wäre das verboten?", "Bringe alles auf eine Seite, klammere aus und nutze den Satz vom Nullprodukt.", `$x(${a}x - ${c}) = 0$ ist null, wenn $x = 0$ oder $${a}x - ${c} = 0$.`],
    regeln: [{ name: "Satz vom Nullprodukt" }],
    loesung: [`$${a}x^2 - ${c}x = 0$`, `$x(${a}x - ${c}) = 0$`, `$x_1 = 0$ und $x_2 = ${m}$ – also genau zwei Lösungen.`],
    erklaer: erklaerGleichung("ausklammern"),
  };
} });

/* ---------- Brüche ---------- */
const nennerWahl = [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [6, 8], [2, 7], [3, 6]];
function bruchPaar() {
  for (;;) {
    const [b, d] = wahl(nennerWahl);
    const a = zz(1, b - 1), c = zz(1, d - 1);
    if (ggT(a, b) === 1 && ggT(c, d) === 1 && b !== d) return { a, b, c, d };
  }
}
reg({ id: "bru-add", thema: "brueche", afb: 1, fuer: ["bruchaddition"], mach() {
  const { a, b, c, d } = bruchPaar();
  const z = a * d + c * b, n = b * d;
  return bereinigen({
    daten: { a, b, c, d },
    text: `Berechne $\\frac{${a}}{${b}} + \\frac{${c}}{${d}}$. Gib das Ergebnis als Bruch (z. B. 7/12) oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
    typ: "zahl", wert: z / n, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl",
    fehler: [{ wert: (a + c) / (b + d), typ: "bruchaddition", text: "Zähler und Nenner dürfen nicht einzeln addiert werden. Erst auf den gemeinsamen Nenner erweitern, dann nur die Zähler addieren." }],
    hinweise: ["Was müssen zwei Brüche gemeinsam haben, bevor du sie addieren kannst?", "Erweitere auf einen gemeinsamen Nenner, z. B. $b·d$. Dann addierst du nur die Zähler.", `Erweitere zu $\\frac{${a * d}}{${n}} + \\frac{${c * b}}{${n}}$ und addiere die Zähler.`],
    regeln: [REGEL_BRUCH_ADD], grundlage: GRUND_BRUCH,
    loesung: [`$\\frac{${a * d}}{${n}} + \\frac{${c * b}}{${n}} = \\frac{${z}}{${n}}${gekuerzt(z, n)}$`],
    erklaer: erklaerBruch("add"),
  });
} });
reg({ id: "bru-div", thema: "brueche", afb: 2, fuer: ["bruchdivision"], mach() {
  const { a, b, c, d } = bruchPaar();
  const z = a * d, n = b * c;
  return bereinigen({
    daten: { a, b, c, d },
    text: `Berechne $\\frac{${a}}{${b}} : \\frac{${c}}{${d}}$. Gib das Ergebnis als Bruch (z. B. 7/12) oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
    typ: "zahl", wert: z / n, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl",
    fehler: [{ wert: (a * c) / (b * d), typ: "bruchdivision", text: "Beim Teilen durch einen Bruch wird mit dem Kehrwert multipliziert: $\\frac{c}{d}$ wird zu $\\frac{d}{c}$." }],
    hinweise: ["Was bedeutet es, durch einen Bruch zu teilen? Denk an $1 : \\frac{1}{2}$.", "Durch einen Bruch teilen heißt: mit dem Kehrwert malnehmen.", `Rechne $\\frac{${a}}{${b}} · \\frac{${d}}{${c}}$ und kürze, wenn möglich.`],
    regeln: [REGEL_BRUCH_DIV], grundlage: GRUND_BRUCH,
    loesung: [`$\\frac{${a}}{${b}} : \\frac{${c}}{${d}} = \\frac{${a}}{${b}} · \\frac{${d}}{${c}} = \\frac{${z}}{${n}}${gekuerzt(z, n)}$`],
    erklaer: erklaerBruch("div"),
  });
} });

/* ---------- Terme ---------- */
reg({ id: "ter-binom", thema: "terme", afb: 1, fuer: ["mittelterm", "vorzeichen"], mach() {
  const a = zz(2, 9), minus = Math.random() < 0.5;
  const richtig = minus ? -2 * a : 2 * a;
  const fehler = [
    { wert: 0, typ: "mittelterm", text: "Das ist die häufigste Falle: $(x ± a)^2$ ist nicht $x^2 ± a^2$. Der Mittelterm $±2ax$ fehlt." },
    { wert: a, typ: "mittelterm", text: "Der Mittelterm ist das Doppelte des Produkts: $2·x·a$, nicht nur $a$." },
  ];
  if (minus) fehler.push({ wert: 2 * a, typ: "vorzeichen", text: "Bei der zweiten binomischen Formel ist der Mittelterm negativ: $(x - a)^2 = x^2 - 2ax + a^2$." });
  return bereinigen({
    daten: { a, minus },
    text: `Multipliziere aus: $(x ${minus ? "-" : "+"} ${a})^2 = x^2 + □ \\cdot x + ${a * a}$. Welche Zahl gehört in das Kästchen?`, typ: "zahl", wert: richtig, toleranz: 1e-9, fehler,
    hinweise: ["Schreibe $(x ± a)^2$ als Produkt zweier gleicher Klammern.", `${minus ? "Zweite" : "Erste"} binomische Formel: $(x ${minus ? "-" : "+"} a)^2 = x^2 ${minus ? "-" : "+"} 2ax + a^2$.`, `Hier ist $a = ${a}$. Der Mittelterm ist $${minus ? "-" : ""}2·${a}·x$.`],
    regeln: [{ name: minus ? "Zweite binomische Formel" : "Erste binomische Formel" }],
    loesung: [`$(x ${minus ? "-" : "+"} ${a})(x ${minus ? "-" : "+"} ${a}) = x^2 ${minus ? "-" : "+"} ${2 * a}x + ${a * a}$`, `Das Kästchen enthält $${mi(richtig)}$.`],
    erklaer: erklaerTerm(),
  });
} });

/* ---------- Bernoulli-Ketten ---------- */
const WAHRSCH = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75];
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
reg({ id: "ber-genau", thema: "bernoulli", afb: 1, fuer: ["binomkoeff"], mach() {
  for (;;) {
    const n = zz(4, 8), p = wahl(WAHRSCH), k = zz(1, n - 1);
    const t = binomTabelle(n, p);
    const richtig = rund(t[k], 4);
    const ohne = rund(p ** k * (1 - p) ** (n - k), 4);
    if (Math.abs(richtig - ohne) < 0.002 || richtig < 0.01 || Math.abs((t[k] * 1e4) % 1 - 0.5) < 0.03) continue;
    return bereinigen({
    daten: { n, p, k },
      text: `Ein Zufallsexperiment gelingt mit der Wahrscheinlichkeit $p = ${dez(p, 2)}$ und wird $${n}$-mal unabhängig wiederholt. Wie groß ist die Wahrscheinlichkeit für genau $${k}$ Treffer? Runde auf vier Nachkommastellen.`,
      typ: "zahl", wert: richtig, toleranz: 6e-5, eingabe: "Dezimalzahl, 4 Stellen", abstand: 1e-3,
      fehler: [{ wert: ohne, typ: "binomkoeff", text: `Es gibt mehrere Reihenfolgen, in denen die ${k} Treffer vorkommen können. Der Faktor $\\binom{${n}}{${k}} = ${binom(n, k)}$ fehlt.` }],
      hinweise: ["Wie viele Treffer und wie viele Nieten gibt es? Wie viele Reihenfolgen sind möglich?", "Bernoulli-Formel: $P(X = k) = \\binom{n}{k}·p^k·(1-p)^{n-k}$.", `Setze $n = ${n}$, $k = ${k}$, $p = ${dez(p, 2)}$ ein und rechne $\\binom{${n}}{${k}} = ${binom(n, k)}$ mit.`],
      regeln: [{ name: "Bernoulli-Formel" }, { name: "Binomialkoeffizient" }],
      loesung: [`$P(X = ${k}) = \\binom{${n}}{${k}}·${dez(p, 2)}^{${k}}·${dez(1 - p, 2)}^{${n - k}}$`, `$= ${binom(n, k)}·${dez(p ** k, 6)}·${dez((1 - p) ** (n - k), 6)} ≈ ${dez(richtig, 4)}$`],
      erklaer: erklaerBernoulli("genau"),
    });
  }
} });
reg({ id: "ber-grenze", thema: "bernoulli", afb: 2, fuer: ["ereignisgrenze"], mach() {
  for (;;) {
    const n = zz(5, 10), p = wahl(WAHRSCH), k = zz(2, n - 2);
    const c = kumuliert(binomTabelle(n, p));
    const arten = [
      { s: "mindestens", ev: `X ≥ ${k}`, w: pAb(c, k), f: pAb(c, k + 1), fs: `X ≥ ${k + 1}`, tex: `X \\ge ${k}` },
      { s: "höchstens", ev: `X ≤ ${k}`, w: pBis(c, k), f: pBis(c, k - 1), fs: `X ≤ ${k - 1}`, tex: `X \\le ${k}` },
      { s: "mehr als", ev: `X ≥ ${k + 1}`, w: pAb(c, k + 1), f: pAb(c, k), fs: `X ≥ ${k}`, tex: `X \\ge ${k + 1}` },
      { s: "weniger als", ev: `X ≤ ${k - 1}`, w: pBis(c, k - 1), f: pBis(c, k), fs: `X ≤ ${k}`, tex: `X \\le ${k - 1}` },
    ];
    const art = wahl(arten);
    const richtig = rund(art.w, 4), falsch = rund(art.f, 4);
    if (Math.abs(richtig - falsch) < 0.004 || richtig < 0.02 || richtig > 0.98 || Math.abs((art.w * 1e4) % 1 - 0.5) < 0.03) continue;
    return bereinigen({
    daten: { n, p, k, art: art.s },
      text: `Eine Bernoulli-Kette hat die Länge $n = ${n}$ und die Trefferwahrscheinlichkeit $p = ${dez(p, 2)}$. Wie groß ist die Wahrscheinlichkeit für „${art.s} ${k}“ Treffer? Runde auf vier Nachkommastellen.`,
      typ: "zahl", wert: richtig, toleranz: 6e-5, eingabe: "Dezimalzahl, 4 Stellen", abstand: 1e-3,
      fehler: [{ wert: falsch, typ: "ereignisgrenze", text: `„${art.s} ${k}“ bedeutet $${art.tex}$. Du hast mit $${art.fs.replace("≥", "\\ge").replace("≤", "\\le")}$ gerechnet – die Grenze liegt um eins daneben.` }],
      hinweise: ["Schreibe das Ereignis als Ungleichung mit $X$ auf. Gehört die Zahl selbst dazu?", "„mindestens k“ heißt $X ≥ k$, „höchstens k“ heißt $X ≤ k$, „mehr als k“ heißt $X ≥ k+1$, „weniger als k“ heißt $X ≤ k-1$.", `Das gesuchte Ereignis ist $${art.tex}$. Addiere die passenden Einzelwahrscheinlichkeiten oder nutze das Gegenereignis.`],
      regeln: [{ name: "Höchstens und mindestens" }, { name: "Gegenereignis" }],
      loesung: [`Ereignis: $${art.tex}$`, `$P(${art.tex}) ≈ ${dez(richtig, 4)}$`],
      erklaer: erklaerBernoulli("grenze"),
    });
  }
} });

/* ---------- Vektoren ---------- */
const PYTHAGORAS = [[2, 3, 6], [1, 4, 8], [2, 6, 9], [4, 4, 7], [6, 6, 7], [1, 2, 2], [2, 10, 11], [3, 4, 12]];
reg({ id: "vek-betrag", thema: "vektoren", afb: 1, fuer: ["betragswurzel"], mach() {
  const roh = wahl(PYTHAGORAS);
  const v = mischen(roh).map((x) => (Math.random() < 0.5 ? -x : x));
  const richtig = laenge(v);
  return bereinigen({
    daten: { v },
    text: `Berechne die Länge des Vektors $\\vec{v} = \\spalte{${v[0]}}{${v[1]}}{${v[2]}}$.`, typ: "zahl", wert: richtig, toleranz: 1e-6,
    fehler: [{ wert: v.reduce((s, x) => s + x * x, 0), typ: "betragswurzel", text: "Die Wurzel fehlt: $|\\vec{v}| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$." },
             { wert: v.reduce((s, x) => s + Math.abs(x), 0), typ: "betragswurzel", text: "Die Länge ist nicht die Summe der Beträge, sondern $\\sqrt{v_1^2 + v_2^2 + v_3^2}$." }],
    hinweise: ["Welche Formel kennst du für die Länge eines Vektors? Denk an den Satz des Pythagoras im Raum.", "$|\\vec{v}| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$", `Quadriere jede Koordinate, addiere ($${v.reduce((s, x) => s + x * x, 0)}$) und ziehe die Wurzel.`],
    regeln: [{ name: "Betrag (Länge)" }],
    loesung: [`$|\\vec{v}| = \\sqrt{${v.map((x) => klam(x) + "^2").join(" + ")}} = \\sqrt{${v.reduce((s, x) => s + x * x, 0)}} = ${richtig}$`],
    erklaer: erklaerVektor("betrag"),
  });
} });
reg({ id: "vek-ortho", thema: "vektoren", afb: 2, fuer: ["vorzeichen"], mach() {
  for (let versuch = 0; versuch < 500; versuch++) {
    const a = zz(-4, 4), b = zz(-4, 4), c = wahl([-3, -2, -1, 1, 2, 3]), d = zz(-4, 4), e = zz(-4, 4);
    const s = a * d + b * e;
    if (s === 0 || s % c !== 0) continue;
    const t = -s / c;
    return bereinigen({
    daten: { u: [a, b, c], w: [d, e, t] },
      text: `Für welchen Wert von $t$ stehen $\\vec{u} = \\spalte{${a}}{${b}}{${c}}$ und $\\vec{w} = \\spalte{${d}}{${e}}{t}$ senkrecht aufeinander?`,
      typ: "zahl", wert: t, toleranz: 1e-9,
      fehler: [{ wert: s / c, typ: "vorzeichen", text: `Prüfe das Vorzeichen: $${s} + ${c}·t = 0$ führt zu $t = -\\frac{${s}}{${c}}$.` }],
      hinweise: ["Wann sind zwei Vektoren orthogonal? Welche Rechnung gehört dazu?", "Orthogonal bedeutet: Das Skalarprodukt ist null.", `Berechne $\\vec{u} · \\vec{w} = ${a}·${klam(d)} + ${klam(b)}·${klam(e)} + ${klam(c)}·t = ${s} ${c < 0 ? "-" : "+"} ${Math.abs(c) === 1 ? "" : `${Math.abs(c)}·`}t$ und setze es gleich 0.`],
      regeln: [{ name: "Orthogonalität" }, { name: "Skalarprodukt" }],
      loesung: [`$\\vec{u} · \\vec{w} = ${s} ${c < 0 ? "-" : "+"} ${Math.abs(c) === 1 ? "" : `${Math.abs(c)}·`}t = 0$`, `$t = ${mi(t)}$`],
      erklaer: erklaerVektor("ortho"),
    });
  }
  return this.mach();
} });
reg({ id: "vek-geradeebene", thema: "vektoren", afb: 3, fuer: ["normalenwinkel"], mach() {
  for (let versuch = 0; versuch < 800; versuch++) {
    const u = [zz(-3, 3), zz(-3, 3), zz(-3, 3)], n = [zz(-3, 3), zz(-3, 3), zz(-3, 3)];
    if (u.every((x) => x === 0) || n.every((x) => x === 0)) continue;
    const phi = winkelGeradeEbene(u, n);
    if (!(phi > 8 && phi < 82) || Math.abs(phi - 45) < 6) continue;
    const richtig = rund(phi, 1);
    const zumNormalen = Math.min(winkelZwischen(u, n), 180 - winkelZwischen(u, n));
    return bereinigen({
    daten: { u, n },
      text: `Eine Gerade mit Richtungsvektor $\\vec{u} = \\spalte{${u[0]}}{${u[1]}}{${u[2]}}$ trifft eine Ebene mit Normalenvektor $\\vec{n} = \\spalte{${n[0]}}{${n[1]}}{${n[2]}}$. Unter welchem Winkel schneidet die Gerade die Ebene? Gib den spitzen Winkel in Grad an, auf eine Nachkommastelle gerundet.`,
      typ: "zahl", wert: richtig, toleranz: 0.11, einheit: "°", eingabe: "Grad, eine Nachkommastelle", abstand: 1,
      fehler: [{ wert: rund(zumNormalen, 1), typ: "normalenwinkel", text: "Das ist der Winkel zwischen Gerade und Normalenvektor. Der Schnittwinkel mit der Ebene ist $90° - $ dieser Winkel, also rechne mit dem Sinus." }],
      hinweise: ["Zwischen welchen beiden Objekten misst du den Winkel – Gerade und Ebene oder Gerade und Normalenvektor?", "$\\sin φ = \\frac{|\\vec{u} · \\vec{n}|}{|\\vec{u}|·|\\vec{n}|}$ für den Winkel zwischen Gerade und Ebene.", `Berechne $\\vec{u}·\\vec{n} = ${skalar(u, n)}$, $|\\vec{u}| ≈ ${dez(laenge(u), 3)}$, $|\\vec{n}| ≈ ${dez(laenge(n), 3)}$ und wende $arcsin$ an.`],
      regeln: [{ name: "Winkel Gerade–Ebene" }, { name: "Skalarprodukt" }],
      loesung: [`$\\sin φ = \\frac{|${skalar(u, n)}|}{${dez(laenge(u), 3)}·${dez(laenge(n), 3)}} ≈ ${dez(Math.abs(skalar(u, n)) / (laenge(u) * laenge(n)), 4)}$`, `$φ ≈ ${dez(richtig, 1)}°$`],
      erklaer: erklaerVektor("winkel"),
    });
  }
  return this.mach();
} });

/* ---------- Integrale ---------- */
reg({ id: "int-grenzen", thema: "integrale", afb: 1, fuer: ["grenzen", "stammfunktion", "vorzeichen"], mach() {
  for (;;) {
    const c2 = wahl([1, 2, 3, 6, -3]), c1 = zz(-4, 4), c0 = zz(-3, 3);
    const p = [q(c0), q(c1), q(c2)];
    let a = zz(-2, 2), b = zz(a + 1, 3);
    if (a >= b) continue;
    const F = pInt(p);
    const wertQ = qSub(pAus(F, q(b)), pAus(F, q(a)));
    const w = qNum(wertQ);
    const Fb = qNum(pAus(F, q(b)));
    const pAbl = [q(c1), q(2 * c2)];
    const ableit = pNum(pAbl, b) - pNum(pAbl, a);
    const fehler = [
      { wert: Fb, typ: "grenzen", text: "Du hast nur die obere Grenze eingesetzt. Es gilt $F(b) - F(a)$: Beide Grenzen einsetzen und subtrahieren." },
      { wert: -w, typ: "vorzeichen", text: "Die Reihenfolge der Grenzen ist vertauscht: obere Grenze minus untere Grenze, also $F(b) - F(a)$." },
      { wert: ableit, typ: "stammfunktion", text: "Das ist die Rechnung mit der Ableitung. Gesucht ist eine Stammfunktion: Exponent um 1 erhöhen und durch den neuen Exponenten teilen." },
    ];
    const poly = polyTex(p);
    return bereinigen({
    daten: { c0, c1, c2, a, b },
      text: `Berechne $\\int_{${a}}^{${b}} (${poly}) \\, dx$. Gib das Ergebnis als Bruch (z. B. 7/3) oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
      typ: "zahl", wert: w, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl", fehler,
      hinweise: ["Wie kommt man von einer Funktion zu ihrer Stammfunktion? Und was sagt der Hauptsatz?", "Potenzregel rückwärts: $\\int x^n dx = \\frac{x^{n+1}}{n+1}$. Hauptsatz: $\\int_a^b f(x) dx = F(b) - F(a)$.", `Bilde die Stammfunktion Term für Term, setze dann zuerst $x = ${b}$ und danach $x = ${a}$ ein und subtrahiere.`],
      regeln: [{ name: "Potenzregel rückwärts" }, { name: "Hauptsatz" }],
      loesung: [`$F(x) = ${polyTex(F)}$`, `$F(${b}) - F(${a}) = ${qTexS(wertQ)}$`],
      erklaer: erklaerIntegral("grenzen"),
    });
  }
} });
reg({ id: "int-flaeche", thema: "integrale", afb: 2, fuer: ["flaechenvorzeichen"], mach() {
  for (let v = 0; v < 300; v++) {
    const { p, nst, a, b } = neueFlaechenAufgabe();
    const nstZ = nst.map(qNum);
    if (!nstZ.some((r) => r > a && r < b)) continue;
    const fl = flaeche(p, q(a), q(b), nst);
    const w = qNum(fl.A), s = qNum(fl.I);
    if (Math.abs(w - s) < 0.05 || w > 60) continue;
    return bereinigen({
    daten: { p, a, b },
      text: `Die Funktion $f$ mit $f(x) = ${polyTex(p)}$ schließt zwischen $x = ${a}$ und $x = ${b}$ mit der $x$-Achse Flächen ein. Berechne den Flächeninhalt. Gib das Ergebnis als Bruch oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
      typ: "zahl", wert: w, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl",
      fehler: [{ wert: s, typ: "flaechenvorzeichen", text: "Das ist die Flächenbilanz. Wo der Graph unter der $x$-Achse liegt, zählt das Integral negativ. Rechne bei jedem Teilstück mit dem Betrag." }],
      hinweise: ["Liegt der Graph im ganzen Intervall auf einer Seite der x-Achse? Woran erkennst du das?", "Bestimme die Nullstellen im Intervall, zerlege dort das Integral und addiere die Beträge der Teilintegrale.", `Die Nullstellen im Intervall sind ${nstZ.filter((r) => r > a && r < b).map(mi).join(" und ")}. Integriere je Teilintervall getrennt.`],
      regeln: [{ name: "Hauptsatz" }, { name: "Fläche zwischen Graphen" }],
      loesung: [`Flächeninhalt = Summe der Beträge der Teilintegrale`, `$A = ${qTexS(fl.A)} ≈ ${dez(w, 4)}$`],
      erklaer: erklaerIntegral("flaeche"),
    });
  }
  return GENERATOREN.find((g) => g.id === "int-grenzen").mach();
} });
function polyTex(p) {
  const teile = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (c.z === 0) continue;
    const betrag = qTexS({ z: Math.abs(c.z), n: c.n });
    const kopf = c.z < 0 ? "-" : teile.length ? "+" : "";
    const koeff = i > 0 && c.n === 1 && Math.abs(c.z) === 1 ? "" : betrag;
    const pot = i === 0 ? "" : i === 1 ? "x" : `x^{${i}}`;
    teile.push(`${kopf}${teile.length ? " " : ""}${koeff}${pot}`);
  }
  return teile.join(" ") || "0";
}

/* ---------- Kurvendiskussion ---------- */
reg({ id: "kur-wende", thema: "kurven", afb: 2, fuer: ["ableitungsstufe"], mach() {
  for (;;) {
    const r1 = zz(-3, 5), r2 = zz(-3, 5);
    if (r1 === r2 || (r1 + r2) % 2 !== 0) continue;
    const b = (-3 * (r1 + r2)) / 2, c = 3 * r1 * r2;
    const xw = (r1 + r2) / 2;
    return bereinigen({
    daten: { b, c, xw },
      text: `Gegeben ist $f(x) = ${glieder("x^3", tm(b, "x^2"), tm(c, "x"))}$. Bestimme die $x$-Koordinate des Wendepunkts.`, typ: "zahl", wert: xw, toleranz: 1e-9, abstand: 1e-6,
      fehler: [{ wert: r1, typ: "ableitungsstufe", text: "Du hast $f′(x) = 0$ gelöst – das liefert Kandidaten für Extremstellen. Für Wendestellen löst du $f″(x) = 0$." },
               { wert: r2, typ: "ableitungsstufe", text: "Du hast $f′(x) = 0$ gelöst – das liefert Kandidaten für Extremstellen. Für Wendestellen löst du $f″(x) = 0$." }],
      hinweise: ["Wendestelle oder Extremstelle? Welche Ableitung musst du dafür gleich null setzen?", "Notwendig für eine Wendestelle: $f″(x) = 0$. Hinreichend: $f″$ wechselt dort das Vorzeichen (oder $f‴(x) ≠ 0$).", `Berechne $f″(x) = ${glieder("6x", tm(2 * b, ""))}$ und setze sie gleich 0.`],
      regeln: [{ name: "Wendepunkt" }],
      loesung: [`$f′(x) = ${glieder("3x^2", tm(2 * b, "x"), tm(c, ""))}$`, `$f″(x) = ${glieder("6x", tm(2 * b, ""))}$`, `$f″(x) = 0 \\Rightarrow x = ${mi(xw)}$; $f‴ = 6 ≠ 0$ – also Wendestelle.`],
      erklaer: erklaerKurve("wende"),
    });
  }
} });
reg({ id: "kur-nachweis", thema: "kurven", afb: 3, fuer: ["nachweis"], mach() {
  const vari = wahl([1, 2, 3]);
  if (vari === 1) {
    const a = wahl([1, 2, -1]);
    return {
      text: `Für $f(x) = ${koef(a)}x^3$ gilt $f′(0) = 0$ und $f″(0) = 0$. Welche Aussage ist richtig?`, typ: "wahl",
      optionen: ["Bei $x = 0$ liegt ein Tiefpunkt, weil $f′(0) = 0$ ist.", "Bei $x = 0$ liegt kein Extrempunkt, weil $f′$ dort das Vorzeichen nicht wechselt.", "Bei $x = 0$ liegt ein Hochpunkt, weil $f″(0) = 0$ ist.", "Man kann ohne weitere Rechnung nichts sagen, also gibt es sicher einen Extrempunkt."],
      richtig: 1,
      fehler: [{ wahl: 0, typ: "nachweis", text: "$f′(x) = 0$ ist nur notwendig. Ob ein Extremum vorliegt, entscheidet erst ein hinreichendes Kriterium, z. B. der Vorzeichenwechsel von $f′$." },
               { wahl: 2, typ: "nachweis", text: "$f″(0) = 0$ sagt nichts über Hoch- oder Tiefpunkt. Das Kriterium $f″ ≠ 0$ ist hier nicht anwendbar." },
               { wahl: 3, typ: "nachweis", text: "Auch wenn das $f″$-Kriterium versagt, kann man den Vorzeichenwechsel von $f′$ prüfen: $f′(x) = " + `${3 * a}x^2` + "$ ändert das Vorzeichen nicht." }],
      hinweise: ["Reicht $f′(0) = 0$ allein als Nachweis eines Extrempunkts?", "Hinreichend: $f′$ wechselt das Vorzeichen, oder $f′(x_0) = 0$ und $f″(x_0) ≠ 0$.", `Untersuche $f′(x) = ${3 * a}x^2$ links und rechts von 0.`],
      regeln: [{ name: "Extrempunkt" }],
      loesung: [`$f′(x) = ${3 * a}x^2$ hat links und rechts von 0 dasselbe Vorzeichen.`, `Kein Vorzeichenwechsel: kein Extrempunkt, sondern ein Sattelpunkt.`],
      erklaer: erklaerKurve("nachweis"),
    };
  }
  if (vari === 2) {
    return {
      text: "Für $f(x) = x^4$ gilt $f′(0) = 0$ und $f″(0) = 0$. Welche Aussage ist richtig?", typ: "wahl",
      optionen: ["Bei $x = 0$ liegt kein Extrempunkt, weil $f″(0) = 0$ ist.", "Bei $x = 0$ liegt ein Tiefpunkt, weil $f′$ dort von negativ zu positiv wechselt.", "Bei $x = 0$ liegt ein Wendepunkt, weil $f″(0) = 0$ ist.", "Bei $x = 0$ liegt ein Hochpunkt, weil $f′(0) = 0$ ist."],
      richtig: 1,
      fehler: [{ wahl: 0, typ: "nachweis", text: "$f″(0) = 0$ heißt nur: Dieses Kriterium entscheidet nicht. $f′(x) = 4x^3$ wechselt aber bei 0 von − nach +." },
               { wahl: 2, typ: "nachweis", text: "Für eine Wendestelle muss $f″$ das Vorzeichen wechseln. $f″(x) = 12x^2$ bleibt aber ≥ 0." },
               { wahl: 3, typ: "nachweis", text: "$f′ = 0$ allein unterscheidet nicht zwischen Hoch- und Tiefpunkt. Prüfe den Vorzeichenwechsel." }],
      hinweise: ["Was passiert, wenn das $f″$-Kriterium nicht entscheidet? Welches Kriterium bleibt?", "Vorzeichenwechsel von $f′$: von − nach + ergibt einen Tiefpunkt, von + nach − einen Hochpunkt.", "Berechne $f′(-1)$ und $f′(1)$."],
      regeln: [{ name: "Extrempunkt" }, { name: "Wendepunkt" }],
      loesung: ["$f′(x) = 4x^3$: $f′(-1) = -4 < 0$, $f′(1) = 4 > 0$.", "Vorzeichenwechsel von − nach +: Tiefpunkt in $x = 0$."],
      erklaer: erklaerKurve("nachweis"),
    };
  }
  const h = zz(-3, 3), k = zz(-4, 4), w = wahl([1, 2, 3]);
  const klammer = h === 0 ? "x" : `(x ${sgn(-h)})`;
  return {
    text: `Der Graph von $f(x) = -${w === 1 ? "" : w}${klammer}^2 ${sgn(k)}$ ist eine nach unten geöffnete Parabel. An der Stelle $x = ${h}$ gilt $f′(${h}) = 0$ und $f″(${h}) = ${-2 * w}$. Welche Folgerung ist richtig?`, typ: "wahl",
    optionen: ["Tiefpunkt, weil $f″ ≠ 0$ ist.", `Hochpunkt, weil $f′ = 0$ und $f″ < 0$ ist.`, "Sattelpunkt, weil $f″ ≠ 0$ ist.", "Kein Extrempunkt, weil $f″ < 0$ ist."],
    richtig: 1,
    fehler: [{ wahl: 0, typ: "nachweis", text: "Das Vorzeichen von $f″$ entscheidet: $f″ > 0$ ergibt einen Tiefpunkt, $f″ < 0$ einen Hochpunkt." },
             { wahl: 2, typ: "nachweis", text: "Ein Sattelpunkt hat $f″ = 0$. Hier ist $f″ ≠ 0$, also liegt ein Extrempunkt vor." },
             { wahl: 3, typ: "nachweis", text: "Mit $f′ = 0$ und $f″ ≠ 0$ ist ein Extremum nachgewiesen. Das Vorzeichen von $f″$ sagt, welche Art." }],
    hinweise: ["Welche beiden Bedingungen zusammen reichen für einen Extrempunkt?", "$f′(x_0) = 0$ und $f″(x_0) < 0$ ergibt einen Hochpunkt, $f″(x_0) > 0$ einen Tiefpunkt.", "Lies das Vorzeichen von $f″$ in der Aufgabe ab."],
    regeln: [{ name: "Extrempunkt" }],
    loesung: [`$f′(${h}) = 0$ und $f″(${h}) = ${-2 * w} < 0$`, "Hinreichendes Kriterium erfüllt: Hochpunkt."],
    erklaer: erklaerKurve("kriterium"),
  };
} });

/* ======================================================================
   GRUNDLAGEN DER MITTELSTUFE – Basisübungen für „Eine Sache trainieren“
   und den Trainingsplan (Warm-up, Basis-Check, Zwischenschritte).
   Gleiches Format wie oben, Lösungen nach Regel A5.
   ====================================================================== */

/* ---------- Prozent ---------- */
reg({ id: "pro-wert", thema: "prozent", afb: 1, fuer: ["prozentbasis"], mach() {
  const p = wahl([5, 10, 12, 15, 20, 25, 30, 40, 60, 75]), G = wahl([40, 60, 80, 120, 160, 240, 300, 360, 480, 600]);
  const W = rund((G * p) / 100, 2);
  return bereinigen({
    daten: { p, G },
    text: `Ein Fahrrad kostet $${G}$ €. Es wird um ${p} % reduziert. Wie viel Euro beträgt der Rabatt?`,
    typ: "zahl", wert: W, toleranz: 0.006, einheit: "€", eingabe: "Betrag in Euro",
    fehler: [{ wert: G * p, typ: "prozentbasis", text: `„Prozent“ heißt „von Hundert“: ${p} % sind $\\frac{${p}}{100}$. Du hast nicht durch 100 geteilt.` },
             { wert: rund(G / p, 2), typ: "prozentbasis", text: "Der Grundwert wird mit dem Prozentsatz multipliziert, nicht durch ihn geteilt." },
             { wert: rund(G - W, 2), typ: "prozentbasis", text: "Das ist der neue Preis. Gefragt ist der Rabatt, also der Prozentwert selbst." }],
    hinweise: ["Was ist hier der Grundwert, was der Prozentsatz, und was wird gesucht?", "Prozentwert: $W = G · \\frac{p}{100}$", `Rechne $${G} · ${dez(p / 100, 2)}$.`],
    regeln: [{ name: "Prozentwert" }],
    loesung: [`$W = ${G} · \\frac{${p}}{100} = ${dez(W, 2)}$`, `Der Rabatt beträgt $${dez(W, 2)}$ €.`],
    erklaer: { frage: "Erkläre, wie du den Rabatt berechnet hast.", kriterien: [K("grund", "Grundwert und Prozentsatz benennen", ["grundwert", "prozentsatz", "von", "100"], "Von welchem Betrag werden die Prozente genommen?"), K("formel", "Mit p/100 multiplizieren", ["mal", "·", "\\*", "multipli", "/\\s*100", "durch 100", "0,\\d"], "Wie wird aus Prozent eine Zahl, mit der du rechnen kannst?")] },
  });
} });
reg({ id: "pro-grund", thema: "prozent", afb: 2, fuer: ["prozentbasis"], mach() {
  const p = wahl([10, 20, 25, 50]), G = wahl([40, 60, 80, 120, 160, 200, 240, 320]);
  const q = 1 + p / 100, N = rund(G * q, 2);
  return bereinigen({
    daten: { p, G, N },
    text: `Nach einer Preiserhöhung um ${p} % kostet ein Artikel $${dez(N, 2)}$ €. Wie viel hat er vorher gekostet?`,
    typ: "zahl", wert: G, toleranz: 0.006, einheit: "€", eingabe: "Betrag in Euro",
    fehler: [{ wert: rund(N * (1 - p / 100), 2), typ: "prozentbasis", text: `Die ${p} % beziehen sich auf den alten Preis, nicht auf den neuen. Darum darfst du nicht ${p} % vom neuen Preis abziehen.` },
             { wert: rund(N - p, 2), typ: "prozentbasis", text: "Prozent sind keine Euro. Rechne mit dem Wachstumsfaktor." }],
    hinweise: ["Welcher Preis ist hier der Grundwert, also 100 %?", `Neuer Preis = alter Preis · $${dez(q, 2)}$. Also: alter Preis = neuer Preis : $${dez(q, 2)}$.`, `Rechne $${dez(N, 2)} : ${dez(q, 2)}$.`],
    regeln: [{ name: "Wachstumsfaktor" }, { name: "Grundwert" }],
    loesung: [`$q = 1 + \\frac{${p}}{100} = ${dez(q, 2)}$`, `$G = ${dez(N, 2)} : ${dez(q, 2)} = ${G}$`, `Vorher kostete der Artikel $${G}$ €.`],
    erklaer: { frage: "Erkläre, warum du nicht einfach die Prozent vom neuen Preis abziehst.", kriterien: [K("grund", "Der alte Preis ist der Grundwert", ["alt", "grundwert", "100\\s*%", "vorher"], "Auf welchen Preis beziehen sich die Prozent?"), K("teilen", "Durch den Wachstumsfaktor teilen", ["teil", "geteilt", ":", "/", "faktor", "1,\\d"], "Wie kommst du vom neuen zum alten Preis zurück?")] },
  });
} });

/* ---------- Funktionen ---------- */
reg({ id: "fkt-steigung", thema: "funktionen", afb: 1, fuer: ["steigungsdreieck", "vorzeichen"], mach() {
  for (;;) {
    const x1 = zz(-5, 4), dx = wahl([1, 2, 3, 4]), m = wahl([-3, -2, -1, 2, 3, 4, 0.5, -0.5, 1.5]);
    const dy = m * dx;
    if (!Number.isInteger(dy) || dy === 0 || Math.abs(dy) === Math.abs(dx)) continue;
    const y1 = zz(-5, 5), x2 = x1 + dx, y2 = y1 + dy, quo = dx === 1 ? String(dy) : `\\frac{${dy}}{${dx}}`;
    return bereinigen({
      daten: { x1, y1, x2, y2 },
      text: `Eine Gerade geht durch die Punkte $P(${x1} \\mid ${y1})$ und $Q(${x2} \\mid ${y2})$. Bestimme ihre Steigung $m$.`,
      typ: "zahl", wert: m, toleranz: 1e-9, eingabe: "Zahl oder Bruch",
      fehler: [{ wert: dx / dy, typ: "steigungsdreieck", text: "Zähler und Nenner sind vertauscht. Steigung heißt: Höhenunterschied durch Breitenunterschied, $m = \\frac{y_2 - y_1}{x_2 - x_1}$." },
               { wert: -m, typ: "vorzeichen", text: "Achte auf die Reihenfolge: Oben und unten muss derselbe Punkt zuerst stehen." }],
      hinweise: ["Wie viel geht es nach oben (oder unten), wenn du von P nach Q nach rechts gehst?", "$m = \\frac{y_2 - y_1}{x_2 - x_1}$", `Höhenunterschied $${y2} - ${klam(y1)}$, Breitenunterschied $${x2} - ${klam(x1)}$.`],
      regeln: [{ name: "Steigung" }],
      loesung: [`$m = \\frac{${y2} - ${klam(y1)}}{${x2} - ${klam(x1)}} = ${quo}${bruchTex(dy, dx) !== quo ? ` = ${bruchTex(dy, dx)}` : ""}$`],
      erklaer: { frage: "Erkläre, wie du die Steigung bestimmt hast.", kriterien: [K("dy", "Höhenunterschied (y-Werte) nennen", ["y", "höhe", "senkrecht", "oben", "unten"], "Was ändert sich zwischen den y-Werten?"), K("quotient", "Durch den Breitenunterschied (x-Werte) teilen", ["durch", "geteilt", "/", "bruch", "x"], "Womit teilst du den Höhenunterschied?")] },
    });
  }
} });
reg({ id: "fkt-scheitel", thema: "funktionen", afb: 2, fuer: ["scheitelvorzeichen"], mach() {
  for (;;) {
    const h = zzOhne0(-5, 5), c = zz(-9, 12), b = -2 * h, ys = c - h * h;
    if (ys === 0 || c === 0) continue;
    return bereinigen({
      daten: { b, c },
      text: `Bestimme den Scheitelpunkt der Parabel $f(x) = x^2 ${tm(b, "x")} ${sgn(c)}$. Gib die $y$-Koordinate an.`,
      typ: "zahl", wert: ys, toleranz: 1e-9,
      fehler: [{ wert: c + h * h, typ: "scheitelvorzeichen", text: `Beim quadratischen Ergänzen wird $${h * h}$ addiert und gleich wieder abgezogen. Bei dir ist das Vorzeichen des Ausgleichs falsch.` },
               { wert: h * h - b * h + c, typ: "scheitelvorzeichen", text: `Die $x$-Koordinate ist $-\\frac{b}{2} = ${h}$, nicht $${-h}$. Setze sie dann in $f$ ein.` }],
      hinweise: ["Wie bekommst du aus der Normalform die Scheitelpunktform?", "Quadratisch ergänzen: $x^2 + bx = (x + \\frac{b}{2})^2 - (\\frac{b}{2})^2$", `Hier ist $\\frac{b}{2} = ${mi(-h)}$. Also $f(x) = (x ${sgn(-h)})^2 - ${h * h} ${sgn(c)}$.`],
      regeln: [{ name: "Scheitelpunktform" }, { name: "Quadratische Ergänzung" }],
      loesung: [`$f(x) = (x ${sgn(-h)})^2 - ${h * h} ${sgn(c)} = (x ${sgn(-h)})^2 ${sgn(ys)}$`, `$S(${h} \\mid ${ys})$`],
      erklaer: { frage: "Erkläre, wie du den Scheitelpunkt gefunden hast.", kriterien: [K("ergaenzen", "Quadratisch ergänzen oder x = −b/2 nennen", ["ergänz", "scheitelpunktform", "b\\s*/\\s*2", "-\\s*b", "halbe"], "Wie findest du die x-Koordinate des Scheitels?"), K("einsetzen", "Die y-Koordinate durch Einsetzen oder Ablesen bestimmen", ["einsetz", "ablesen", "f\\(", "y"], "Woher kommt die y-Koordinate?")] },
    });
  }
} });

/* ---------- Potenzen, Wurzeln, Logarithmen ---------- */
reg({ id: "pot-gesetz", thema: "potenzen", afb: 1, fuer: ["potenzgesetz"], mach() {
  for (;;) {
    const m = zz(2, 9), n = zz(2, 9), k = zz(2, 9), r = m + n - k;
    if (r === 0 || r === 1 || m * n - k === r || m + n + k === r) continue;
    return bereinigen({
      daten: { m, n, k },
      text: `Vereinfache $\\frac{x^{${m}} · x^{${n}}}{x^{${k}}} = x^{□}$. Welche Zahl gehört in das Kästchen?`,
      typ: "zahl", wert: r, toleranz: 1e-9,
      fehler: [{ wert: m * n - k, typ: "potenzgesetz", text: "Gleiche Basis, multiplizieren: Die Exponenten werden addiert, nicht multipliziert." },
               { wert: m + n + k, typ: "potenzgesetz", text: "Beim Dividieren werden die Exponenten subtrahiert." }],
      hinweise: ["Was passiert mit den Exponenten, wenn du Potenzen mit gleicher Basis multiplizierst oder dividierst?", "$x^a · x^b = x^{a+b}$ und $\\frac{x^a}{x^b} = x^{a-b}$", `Rechne $${m} + ${n} - ${k}$.`],
      regeln: [{ name: "Potenzgesetze" }],
      loesung: [`$\\frac{x^{${m}} · x^{${n}}}{x^{${k}}} = x^{${m} + ${n} - ${k}} = x^{${r}}$`],
      erklaer: { frage: "Erkläre, welche Potenzgesetze du benutzt hast.", kriterien: [K("add", "Beim Multiplizieren Exponenten addieren", ["addier", "plus", "\\+", "zusammenzählen"], "Was passiert beim Multiplizieren mit den Exponenten?"), K("sub", "Beim Dividieren Exponenten subtrahieren", ["subtrahier", "minus", "abzieh", "-"], "Und beim Dividieren?")] },
    });
  }
} });
reg({ id: "pot-wurzel", thema: "potenzen", afb: 1, fuer: ["teilwurzel"], mach() {
  const k = zz(2, 9), m = wahl([2, 3, 5, 6, 7]), r = k * k * m;
  return bereinigen({
    daten: { k, m },
    text: `Ziehe teilweise die Wurzel: $\\sqrt{${r}} = □ · \\sqrt{${m}}$. Welche Zahl gehört in das Kästchen?`,
    typ: "zahl", wert: k, toleranz: 1e-9,
    fehler: [{ wert: k * k, typ: "teilwurzel", text: `Aus $${k * k}$ wird beim Wurzelziehen $${k}$: $\\sqrt{${k * k}} = ${k}$.` },
             { wert: r / m, typ: "teilwurzel", text: `Vor die Wurzel kommt die Wurzel des Quadratfaktors, nicht der Faktor selbst.` }],
    hinweise: [`Welche Quadratzahl steckt als Faktor in $${r}$?`, "$\\sqrt{a · b} = \\sqrt{a} · \\sqrt{b}$", `$${r} = ${k * k} · ${m}$`],
    regeln: [{ name: "Wurzelgesetze" }],
    loesung: [`$\\sqrt{${r}} = \\sqrt{${k * k} · ${m}} = ${k}\\sqrt{${m}}$`],
    erklaer: { frage: "Erkläre, wie du die Wurzel zerlegt hast.", kriterien: [K("quadrat", "Eine Quadratzahl als Faktor abspalten", ["quadrat", "zerleg", "faktor", "\\d+\\s*[·*]"], "Welcher Faktor ist eine Quadratzahl?")] },
  });
} });
reg({ id: "pot-log", thema: "potenzen", afb: 2, fuer: ["logdefinition"], mach() {
  for (;;) {
    const b = wahl([2, 3, 5]), k = zz(2, b === 5 ? 3 : b === 3 ? 4 : 6), a = wahl([2, 3, 4, 5]);
    if (a === b) continue;
    const bk = b ** k, c = a * bk;
    return bereinigen({
      daten: { a, b, k },
      text: `Löse die Gleichung $${a} · ${b}^x = ${c}$.`,
      typ: "zahl", wert: k, toleranz: 1e-6, eingabe: "Zahl",
      fehler: [{ wert: Math.log(c) / Math.log(b), typ: "logdefinition", text: `Erst den Faktor ${a} wegteilen, dann logarithmieren: $${b}^x = ${bk}$.` },
               { wert: bk, typ: "logdefinition", text: `$${bk}$ ist der Wert der Potenz. Gesucht ist der Exponent: Wie oft musst du $${b}$ mit sich selbst multiplizieren?` }],
      hinweise: ["Was musst du zuerst tun, damit die Potenz allein steht?", `$${b}^x = y \\iff x = \\log_{${b}}(y)$`, `Teile durch ${a}: $${b}^x = ${bk}$.`],
      regeln: [{ name: "Logarithmus" }],
      loesung: [`$${b}^x = ${c} : ${a} = ${bk}$`, `$x = \\log_{${b}}(${bk}) = ${k}$`],
      erklaer: { frage: "Erkläre, wie du die Gleichung gelöst hast.", kriterien: [K("teilen", "Zuerst durch den Vorfaktor teilen", ["teil", "geteilt", ":", "/", "vorfaktor"], "Was passiert mit dem Faktor vor der Potenz?"), K("log", "Logarithmieren bzw. Exponent ablesen", ["log", "exponent", "hoch", "mal\\s+mit\\s+sich"], "Wie findest du den Exponenten?")] },
    });
  }
} });

/* ---------- Geometrie ---------- */
const TRIPEL = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15], [20, 21, 29], [12, 16, 20]];
reg({ id: "geo-pythagoras", thema: "geometrie", afb: 1, fuer: ["hypotenuse"], mach() {
  const [a, b, c] = wahl(TRIPEL), kathete = Math.random() < 0.5;
  if (!kathete) return bereinigen({
    daten: { a, b },
    text: `Ein rechtwinkliges Dreieck hat die Katheten $a = ${a}$ cm und $b = ${b}$ cm. Wie lang ist die Hypotenuse $c$?`,
    typ: "zahl", wert: c, toleranz: 0.01, einheit: "cm", eingabe: "Länge in cm",
    fehler: [{ wert: a + b, typ: "hypotenuse", text: "Die Seiten werden nicht addiert, sondern ihre Quadrate: $c^2 = a^2 + b^2$." },
             { wert: a * a + b * b, typ: "hypotenuse", text: "Das ist $c^2$. Zieh noch die Wurzel." }],
    hinweise: ["Welche Seite liegt dem rechten Winkel gegenüber?", "Satz des Pythagoras: $a^2 + b^2 = c^2$", `Rechne $${a * a} + ${b * b}$ und ziehe die Wurzel.`],
    regeln: [{ name: "Satz des Pythagoras" }],
    loesung: [`$c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$`, `$c = \\sqrt{${c * c}} = ${c}$ cm`],
    erklaer: { frage: "Erkläre, wie du die Hypotenuse berechnet hast.", kriterien: [K("satz", "Den Satz des Pythagoras nennen", ["pythagoras", "a\\^?2\\s*\\+\\s*b", "a²", "quadrat"], "Welcher Satz verbindet die drei Seiten?"), K("wurzel", "Am Ende die Wurzel ziehen", ["wurzel", "√"], "Was musst du mit c² noch machen?")] },
  });
  return bereinigen({
    daten: { a, c },
    text: `In einem rechtwinkligen Dreieck ist die Hypotenuse $c = ${c}$ cm und eine Kathete $a = ${a}$ cm lang. Wie lang ist die andere Kathete $b$?`,
    typ: "zahl", wert: b, toleranz: 0.01, einheit: "cm", eingabe: "Länge in cm",
    fehler: [{ wert: Math.sqrt(c * c + a * a), typ: "hypotenuse", text: "Die Hypotenuse ist die längste Seite. Für eine Kathete gilt $b^2 = c^2 - a^2$, nicht $c^2 + a^2$." },
             { wert: c - a, typ: "hypotenuse", text: "Nicht die Seiten subtrahieren, sondern ihre Quadrate." }],
    hinweise: ["Welche der gegebenen Seiten ist die Hypotenuse?", "$a^2 + b^2 = c^2$, also $b^2 = c^2 - a^2$", `Rechne $${c * c} - ${a * a}$ und ziehe die Wurzel.`],
    regeln: [{ name: "Satz des Pythagoras" }],
    loesung: [`$b^2 = ${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${b * b}$`, `$b = \\sqrt{${b * b}} = ${b}$ cm`],
    erklaer: { frage: "Erkläre, wie du die Kathete berechnet hast.", kriterien: [K("satz", "Nach b² umstellen: c² minus a²", ["minus", "-", "subtrah", "abzieh", "umstell"], "Wie stellst du a² + b² = c² nach b² um?"), K("wurzel", "Am Ende die Wurzel ziehen", ["wurzel", "√"], "Was musst du mit b² noch machen?")] },
  });
} });
reg({ id: "geo-trig", thema: "geometrie", afb: 2, fuer: ["sinkos"], mach() {
  for (;;) {
    const al = wahl([25, 30, 35, 40, 50, 55, 65]), c = zz(5, 20), gegen = Math.random() < 0.5;
    const r = (al * Math.PI) / 180;
    const w = c * (gegen ? Math.sin(r) : Math.cos(r)), f = c * (gegen ? Math.cos(r) : Math.sin(r));
    if (Math.abs(w - f) < 0.2 || Math.abs((w * 100) % 1 - 0.5) < 0.05) continue;
    const fn = gegen ? "\\sin" : "\\cos";
    return bereinigen({
      daten: { al, c, gegen },
      text: `Im Dreieck $ABC$ ist der Winkel bei $C$ ein rechter Winkel. Es gilt $α = ${al}°$ und $c = ${c}$ cm. Berechne die ${gegen ? "Gegenkathete $a$" : "Ankathete $b$"} von $α$ auf zwei Nachkommastellen.`,
      typ: "zahl", wert: rund(w, 2), toleranz: 0.011, einheit: "cm", eingabe: "zwei Nachkommastellen", abstand: 0.05,
      fehler: [{ wert: rund(f, 2), typ: "sinkos", text: gegen ? "Sinus gehört zur Gegenkathete: $\\sin α = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}}$. Du hast den Kosinus genommen." : "Kosinus gehört zur Ankathete: $\\cos α = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}}$. Du hast den Sinus genommen." },
               { wert: rund(c * Math.tan(r), 2), typ: "sinkos", text: "Der Tangens verbindet die beiden Katheten. Hier ist die Hypotenuse gegeben, also brauchst du Sinus oder Kosinus." }],
      hinweise: ["Welche Seite ist von α aus gesehen gegeben, welche gesucht: Hypotenuse, Gegenkathete oder Ankathete?", "$\\sin α = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}}$, $\\cos α = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}}$", `Rechne $${c} · ${fn}(${al}°)$ (Taschenrechner auf DEG).`],
      regeln: [{ name: gegen ? "Sinus im rechtwinkligen Dreieck" : "Kosinus im rechtwinkligen Dreieck" }],
      loesung: [`$${gegen ? "a" : "b"} = c · ${fn}(α) = ${c} · ${fn}(${al}°) ≈ ${dez(rund(w, 2), 2)}$ cm`],
      erklaer: { frage: "Erkläre, warum du diese Winkelfunktion gewählt hast.", kriterien: [K("seiten", "Gegebene und gesuchte Seite benennen (Hypotenuse, An-/Gegenkathete)", ["hypotenuse", "gegenkathete", "ankathete"], "Welche Seiten sind von α aus gesehen beteiligt?"), K("funktion", "Die passende Funktion nennen", [gegen ? "sin" : "cos"], "Welche Winkelfunktion verbindet genau diese beiden Seiten?")] },
    });
  }
} });

/* ---------- Wahrscheinlichkeit ---------- */
reg({ id: "wkt-pfad", thema: "wkt", afb: 1, fuer: ["pfadregel", "zuruecklegen"], mach() {
  const r = zz(2, 5), b = zz(2, 6), n = r + b;
  const z = r * (r - 1), nn = n * (n - 1);
  const ende = bruchTex(z, nn) === `\\frac{${z}}{${nn}}` ? "" : ` = ${bruchTex(z, nn)}`;
  return bereinigen({
    daten: { r, b },
    text: `In einer Urne liegen $${r}$ rote und $${b}$ blaue Kugeln. Du ziehst zweimal ohne Zurücklegen. Wie groß ist die Wahrscheinlichkeit, zwei rote Kugeln zu ziehen? Gib einen Bruch (z. B. 2/15) oder eine Dezimalzahl an.`,
    typ: "zahl", wert: z / nn, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl",
    fehler: [{ wert: (r / n) ** 2, typ: "zuruecklegen", text: `Ohne Zurücklegen ändert sich die Urne: Beim zweiten Zug sind nur noch $${r - 1}$ rote von $${n - 1}$ Kugeln da.` },
             { wert: r / n + (r - 1) / (n - 1), typ: "pfadregel", text: "Entlang eines Pfades werden die Wahrscheinlichkeiten multipliziert, nicht addiert." }],
    hinweise: ["Zeichne das Baumdiagramm: Was ändert sich nach dem ersten Zug?", "Pfadregel: Entlang eines Pfades werden die Wahrscheinlichkeiten multipliziert.", `Erster Zug: $\\frac{${r}}{${n}}$, zweiter Zug: $\\frac{${r - 1}}{${n - 1}}$.`],
    regeln: [{ name: "Pfadregeln" }],
    loesung: [`$P(rr) = \\frac{${r}}{${n}} · \\frac{${r - 1}}{${n - 1}} = \\frac{${z}}{${nn}}${ende}$`],
    erklaer: { frage: "Erkläre, wie du die Wahrscheinlichkeit berechnet hast.", kriterien: [K("mult", "Entlang des Pfades multiplizieren", ["multipli", "mal", "·", "\\*", "pfadregel", "produkt"], "Was machst du mit den Wahrscheinlichkeiten entlang eines Pfades?"), K("ohne", "Beim zweiten Zug eine Kugel weniger", ["weniger", "ohne zurück", "n\\s*-\\s*1", "nur noch", "eine kugel"], "Wie sieht die Urne beim zweiten Zug aus?")] },
  });
} });

/* ---------- Lineare Gleichungssysteme ---------- */
reg({ id: "lgs-zwei", thema: "lgs", afb: 2, fuer: ["einsetzen"], mach() {
  for (;;) {
    const x = zzOhne0(-5, 5), y = zzOhne0(-5, 5), b1 = wahl([-3, -2, 2, 3]), a2 = wahl([-3, -2, 2, 3, 4]), b2 = zzOhne0(-4, 4);
    const c1 = x + b1 * y, c2 = a2 * x + b2 * y, k = b2 - a2 * b1, r = c2 - a2 * c1;
    if (c1 === 0 || Math.abs(k) < 2 || x === y || Math.abs(y) === 1) continue;
    return bereinigen({
      daten: { x, y, b1, a2, b2 },
      text: `Löse das Gleichungssystem. I: $x ${tm(b1, "y")} = ${c1}$, II: $${koef(a2)}x ${tm(b2, "y")} = ${c2}$. Gib $x$ an.`,
      typ: "zahl", wert: x, toleranz: 1e-9,
      fehler: [{ wert: y, typ: "einsetzen", text: `Das ist der Wert von $y$. Setze ihn noch in I ein, um $x$ zu erhalten.` },
               { wert: c1 + b1 * y, typ: "vorzeichen", text: `Beim Umstellen von I wechselt $${tm(b1, "y")}$ auf die andere Seite das Vorzeichen.` }],
      hinweise: ["Welche Gleichung lässt sich am leichtesten nach einer Variablen auflösen?", "Einsetzungsverfahren: I nach $x$ auflösen, in II einsetzen, $y$ bestimmen, zurück in I.", `Aus I: $x = ${c1} ${tm(-b1, "y")}$. Setze das in II ein.`],
      regeln: [{ name: "Einsetzungsverfahren" }],
      loesung: [`I: $x = ${c1} ${tm(-b1, "y")}$`, `In II: $${a2}(${c1} ${tm(-b1, "y")}) ${tm(b2, "y")} = ${c2}$`, `$${a2 * c1} ${tm(-a2 * b1 + b2, "y")} = ${c2}$`, `$${k}y = ${r}$`, `$y = ${y}$`, `$x = ${c1} - ${klam(b1)}·${klam(y)} = ${x}$`],
      erklaer: { frage: "Erkläre dein Vorgehen.", kriterien: [K("aufloesen", "Eine Gleichung nach einer Variablen auflösen", ["auflös", "umstell", "x\\s*="], "Welche Gleichung hast du zuerst umgestellt?"), K("einsetzen", "In die andere Gleichung einsetzen", ["einsetz", "eingesetzt", "ersetz"], "Was machst du mit dem umgestellten Term?")] },
    });
  }
} });

/* ---------- Sinusfunktion ---------- */
reg({ id: "sin-periode", thema: "sinus", afb: 1, fuer: ["periode"], mach() {
  const b = wahl([2, 3, 4]), a = wahl([2, 3, -2, 4]);
  const pi = (z, n) => (n === 1 ? (z === 1 ? "π" : `${z}π`) : `\\frac{${z === 1 ? "" : z}π}{${n}}`);
  const per = (z, n) => { const g = ggT(z, n); return pi(z / g, n / g); };
  const roh = [{ t: per(2, b), ok: true }, { t: per(2 * b, 1), f: "Die Periode wird kleiner, wenn $b$ größer wird: $p = \\frac{2π}{b}$, nicht $2π · b$." },
    { t: "2π", f: "$2π$ ist die Periode von $\\sin(x)$. Der Faktor $b$ im Argument staucht den Graphen." },
    { t: per(1, b), f: "Die Grundperiode des Sinus ist $2π$, nicht $π$: $p = \\frac{2π}{b}$." }];
  const ord = mischen(roh);
  return {
    daten: { a, b },
    text: `Welche Periode hat $f(x) = ${koef(a)}\\sin(${b}x)$?`, typ: "wahl", optionen: ord.map((o) => `$${o.t}$`), richtig: ord.findIndex((o) => o.ok),
    fehler: ord.map((o, i) => (o.ok ? null : { wahl: i, typ: "periode", text: o.f })).filter(Boolean),
    hinweise: ["Was bewirkt der Faktor vor dem $x$ im Argument, was der Faktor vor dem Sinus?", "Bei $f(x) = a\\sin(bx)$ ist die Periode $p = \\frac{2π}{b}$. Die Amplitude $|a|$ ändert die Periode nicht.", `Hier ist $b = ${b}$.`],
    regeln: [{ name: "Periode" }],
    loesung: [`$p = \\frac{2π}{${b}} = ${per(2, b)}$`, `Der Faktor $${a}$ ändert nur die Amplitude.`],
    erklaer: { frage: "Erkläre, wie du die Periode bestimmt hast.", kriterien: [K("formel", "2π durch b teilen", ["2\\s*π\\s*/", "durch", "geteilt", "b"], "Welche Formel verbindet b und die Periode?"), K("amplitude", "Der Faktor vor dem Sinus ändert die Periode nicht", ["amplitude", "streck", "höhe", "ändert nicht", "egal"], "Spielt der Faktor vor dem Sinus eine Rolle?")] },
  };
} });

/* ---------- Exponentielles Wachstum ---------- */
reg({ id: "wac-faktor", thema: "wachstum", afb: 1, fuer: ["wachstumsfaktor"], mach() {
  for (;;) {
    const B = wahl([200, 500, 800, 1000, 1500, 2000]), p = wahl([2, 3, 4, 5, 8, 10]), n = zz(2, 6);
    const q = 1 + p / 100, v = B * q ** n, lin = B * (1 + (n * p) / 100);
    if (Math.abs(v - Math.round(v) - 0.5) < 0.06 || Math.abs(Math.round(v) - Math.round(lin)) < 2) continue;
    return bereinigen({
      daten: { B, p, n },
      text: `Ein Guthaben von $${B}$ € wird jedes Jahr mit ${p} % verzinst (Zinseszins). Wie groß ist es nach $${n}$ Jahren? Runde auf ganze Euro.`,
      typ: "zahl", wert: Math.round(v), toleranz: 0.6, einheit: "€", eingabe: "ganze Euro", abstand: 1.5,
      fehler: [{ wert: Math.round(lin), typ: "wachstumsfaktor", text: `Das wäre lineares Wachstum: Jedes Jahr kommen ${p} % vom NEUEN Betrag dazu, also wird ${n}-mal mit $${dez(q, 2)}$ multipliziert.` },
               { wert: Math.round(B * q * n), typ: "wachstumsfaktor", text: `Der Faktor $${dez(q, 2)}$ wird $${n}$-mal multipliziert, also hoch $${n}$, nicht mal $${n}$.` }],
      hinweise: ["Mit welchem Faktor wird das Guthaben jedes Jahr multipliziert?", "Exponentielles Wachstum: $B(n) = B_0 · q^n$ mit $q = 1 + \\frac{p}{100}$", `Rechne $${B} · ${dez(q, 2)}^{${n}}$.`],
      regeln: [{ name: "Exponentielles Wachstum" }, { name: "Wachstumsfaktor" }],
      loesung: [`$q = 1 + \\frac{${p}}{100} = ${dez(q, 2)}$`, `$B(${n}) = ${B} · ${dez(q, 2)}^{${n}} ≈ ${Math.round(v)}$ €`],
      erklaer: { frage: "Erkläre, wie du gerechnet hast.", kriterien: [K("faktor", "Den Wachstumsfaktor 1 + p/100 nennen", ["faktor", "1,\\d", "1\\.\\d", "q"], "Mit welcher Zahl wird jedes Jahr multipliziert?"), K("hoch", "Den Faktor n-mal multiplizieren (Potenz)", ["hoch", "\\^", "potenz", "mal multipli", "jedes jahr"], "Wie oft wird multipliziert?")] },
    });
  }
} });

/* ======================================================================
   Geometrie der Mittelstufe: Kreis, Körper, Winkel, Kongruenz, Strahlensätze
   (Rechnungen wie in geoMittel/geoMittel2; Ergebnisse auf zwei Nachkommastellen)
   ====================================================================== */
const PI = Math.PI;
const d2 = (v) => dez(v, 2);
reg({ id: "geo-kreis", thema: "kreiskoerper", afb: 1, fuer: ["durchmesser", "kreisformel"], mach() {
  if (Math.random() < 0.5) {
    const d = wahl([4, 6, 8, 10, 12, 14, 16, 18, 20]), r = d / 2, A = rund(PI * r * r, 2);
    return bereinigen({
      daten: { art: "flaeche", d },
      text: `Ein runder Tisch hat den Durchmesser $d = ${d}$ dm. Wie groß ist die Tischfläche? Runde auf zwei Nachkommastellen.`,
      typ: "zahl", wert: A, toleranz: 0.011, einheit: "dm²", eingabe: "Fläche in dm²", abstand: 0.05,
      fehler: [{ wert: rund(PI * d * d, 2), typ: "durchmesser", text: `Die Formel $A = πr^2$ braucht den Radius. Mit $d$ statt $r$ wird die Fläche viermal zu groß: $r = ${d} : 2 = ${r}$.` },
               { wert: rund(2 * PI * r, 2), typ: "kreisformel", text: "Das ist der Umfang $u = 2πr$. Für die Fläche wird $r$ quadriert: $A = πr^2$." },
               { wert: rund(PI * d, 2), typ: "kreisformel", text: "$π · d$ ist der Umfang, nicht die Fläche." }],
      hinweise: ["Ist der Radius oder der Durchmesser gegeben? Welche Größe braucht die Flächenformel?", "Kreisfläche: $A = π · r^2$ mit $r = \\frac{d}{2}$", `Rechne $r = ${r}$ und dann $π · ${r}^2$.`],
      regeln: [{ name: "Kreisfläche" }],
      loesung: [`$r = ${d} : 2 = ${r}$ dm`, `$A = π · ${r}^2 ≈ ${d2(A)}$ dm²`],
      erklaer: { frage: "Erkläre, wie du die Fläche berechnet hast.", kriterien: [K("radius", "Zuerst den Radius bestimmen (Durchmesser halbieren)", ["radius", "halb", "durch 2", ": 2", "/\\s*2", "r\\s*="], "Welche Größe braucht die Formel, und wie bekommst du sie aus d?"), K("formel", "A = πr² nennen", ["π", "pi", "r²", "r\\^2", "quadrat"], "Welche Formel gehört zur Kreisfläche?")] },
    });
  }
  const r = wahl([2, 3, 4, 5, 6, 7, 8, 9, 12, 15]), u = rund(2 * PI * r, 2);
  return bereinigen({
    daten: { art: "umfang", r },
    text: `Ein kreisrundes Beet hat den Radius $r = ${r}$ m. Wie lang ist der Zaun um das Beet? Runde auf zwei Nachkommastellen.`,
    typ: "zahl", wert: u, toleranz: 0.011, einheit: "m", eingabe: "Länge in m", abstand: 0.05,
    fehler: [{ wert: rund(PI * r * r, 2), typ: "kreisformel", text: "Das ist die Fläche $πr^2$. Der Zaun ist der Umfang: $u = 2πr$." },
             { wert: rund(PI * r, 2), typ: "durchmesser", text: "$π · r$ ist nur der halbe Umfang. Es gilt $u = π · d = 2πr$." }],
    hinweise: ["Ist eine Länge oder eine Fläche gesucht?", "Kreisumfang: $u = 2 · π · r$", `Rechne $2 · π · ${r}$.`],
    regeln: [{ name: "Kreisumfang" }],
    loesung: [`$u = 2 · π · ${r} ≈ ${d2(u)}$ m`],
    erklaer: { frage: "Erkläre, welche Formel du gewählt hast und warum.", kriterien: [K("umfang", "Den Umfang als gesuchte Größe nennen", ["umfang", "länge", "rand", "zaun"], "Ist eine Länge oder eine Fläche gesucht?"), K("formel", "u = 2πr nennen", ["2\\s*[·*]?\\s*π", "2pi", "π\\s*[·*]?\\s*d", "2 mal"], "Welche Formel gehört zum Umfang?")] },
  });
} });
reg({ id: "geo-sektor", thema: "kreiskoerper", afb: 2, fuer: ["kreisanteil"], mach() {
  const r = wahl([3, 4, 5, 6, 8, 10, 12]), al = wahl([30, 45, 60, 72, 120, 135, 150, 210, 240, 270]);
  const bogen = Math.random() < 0.5;
  const voll = bogen ? 2 * PI * r : PI * r * r, w = rund((voll * al) / 360, 2);
  return bereinigen({
    daten: { r, al, bogen },
    text: `Ein Kreis hat den Radius $r = ${r}$ cm. Berechne ${bogen ? "die Länge des Kreisbogens" : "den Flächeninhalt des Kreisausschnitts"} zum Mittelpunktswinkel $α = ${al}°$. Runde auf zwei Nachkommastellen.`,
    typ: "zahl", wert: w, toleranz: 0.011, einheit: bogen ? "cm" : "cm²", eingabe: bogen ? "Länge in cm" : "Fläche in cm²", abstand: 0.05,
    fehler: [{ wert: rund((voll * al) / 180, 2), typ: "kreisanteil", text: "Ein Vollkreis hat 360°, nicht 180°. Der Anteil ist $\\frac{α}{360°}$." },
             { wert: rund(voll, 2), typ: "kreisanteil", text: `Das ist der ganze Kreis. Gesucht ist nur der Anteil $\\frac{${al}°}{360°}$ davon.` },
             { wert: rund(((bogen ? PI * r * r : 2 * PI * r) * al) / 360, 2), typ: "kreisformel", text: bogen ? "Du hast den Anteil der Fläche berechnet. Der Bogen ist ein Teil des Umfangs $2πr$." : "Du hast den Anteil des Umfangs berechnet. Der Ausschnitt ist ein Teil der Fläche $πr^2$." }],
    hinweise: ["Welcher Anteil des ganzen Kreises ist gemeint?", bogen ? "$b = 2πr · \\frac{α}{360°}$" : "$A_S = πr^2 · \\frac{α}{360°}$", `Der Anteil ist $\\frac{${al}}{360}$. Berechne erst ${bogen ? "den Umfang" : "die Kreisfläche"}.`],
    regeln: [{ name: bogen ? "Kreisbogen" : "Kreisausschnitt" }],
    loesung: [bogen ? `$u = 2π · ${r} ≈ ${d2(voll)}$ cm` : `$A = π · ${r}^2 ≈ ${d2(voll)}$ cm²`, `${bogen ? "$b" : "$A_S"} = ${d2(voll)} · \\frac{${al}}{360} ≈ ${d2(w)}$ ${bogen ? "cm" : "cm²"}`],
    erklaer: { frage: "Erkläre, wie du den Kreisteil berechnet hast.", kriterien: [K("ganz", "Zuerst den ganzen Kreis (Umfang bzw. Fläche) nennen", ["umfang", "fläche", "ganz", "vollkreis", "2πr", "πr"], "Wovon ist der Kreisteil ein Anteil?"), K("anteil", "Den Anteil α : 360° nennen", ["360", "anteil", "bruchteil"], "Welcher Bruchteil des Vollkreises ist es?")] },
  });
} });
reg({ id: "geo-quader", thema: "kreiskoerper", afb: 1, fuer: ["oberflaeche"], mach() {
  for (;;) {
    const a = zz(2, 9), b = zz(2, 9), c = zz(2, 9);
    if (a === b && b === c) continue;
    const ober = Math.random() < 0.5;
    const O = 2 * (a * b + a * c + b * c), V = a * b * c;
    if (!ober) return bereinigen({
      daten: { a, b, c, ober },
      text: `Ein Quader ist $${a}$ cm lang, $${b}$ cm breit und $${c}$ cm hoch. Wie groß ist sein Volumen?`,
      typ: "zahl", wert: V, toleranz: 1e-9, einheit: "cm³", eingabe: "Volumen in cm³",
      fehler: [{ wert: O, typ: "oberflaeche", text: "Das ist die Oberfläche. Das Volumen ist Länge · Breite · Höhe." },
               { wert: a + b + c, typ: "oberflaeche", text: "Die Kanten werden für das Volumen multipliziert, nicht addiert." }],
      hinweise: ["Wie viele Einheitswürfel passen hinein?", "$V = a · b · c$", `Rechne $${a} · ${b} · ${c}$.`],
      regeln: [{ name: "Volumen des Quaders" }],
      loesung: [`$V = ${a} · ${b} · ${c} = ${V}$ cm³`],
      erklaer: { frage: "Erkläre, wie du das Volumen bestimmt hast.", kriterien: [K("mal", "Alle drei Kanten multiplizieren", ["mal", "·", "\\*", "multipli", "produkt"], "Wie hängen die drei Kantenlängen mit dem Volumen zusammen?")] },
    });
    return bereinigen({
      daten: { a, b, c, ober },
      text: `Ein Quader ist $${a}$ cm lang, $${b}$ cm breit und $${c}$ cm hoch. Wie groß ist seine Oberfläche?`,
      typ: "zahl", wert: O, toleranz: 1e-9, einheit: "cm²", eingabe: "Fläche in cm²",
      fehler: [{ wert: O / 2, typ: "oberflaeche", text: "Jede Fläche kommt zweimal vor (gegenüberliegende Seiten): $O = 2 · (ab + ac + bc)$." },
               { wert: V, typ: "oberflaeche", text: "Das ist das Volumen. Für die Oberfläche addierst du die Flächen des Netzes." }],
      hinweise: ["Aus welchen Rechtecken besteht das Netz des Quaders?", "$O = 2 · (a · b + a · c + b · c)$", `Rechne $2 · (${a * b} + ${a * c} + ${b * c})$.`],
      regeln: [{ name: "Oberfläche des Quaders" }],
      loesung: [`$O = 2 · (${a * b} + ${a * c} + ${b * c}) = 2 · ${O / 2} = ${O}$ cm²`],
      erklaer: { frage: "Erkläre, wie du die Oberfläche bestimmt hast.", kriterien: [K("flaechen", "Die Rechtecke des Netzes nennen", ["rechteck", "fläche", "netz", "seiten"], "Aus welchen Flächen besteht die Oberfläche?"), K("doppelt", "Jede Fläche zweimal zählen", ["2", "zwei", "doppelt", "gegenüber"], "Wie oft kommt jedes Rechteck vor?")] },
    });
  }
} });
reg({ id: "geo-prisma", thema: "kreiskoerper", afb: 2, fuer: ["durchmesser", "oberflaeche", "grundflaeche"], mach() {
  const v = wahl(["zylV", "zylO", "dreiV"]);
  if (v === "zylV") {
    const d = wahl([4, 6, 8, 10, 12]), h = zz(3, 15), r = d / 2, V = rund(PI * r * r * h, 2);
    return bereinigen({
      daten: { v, d, h },
      text: `Eine zylinderförmige Dose hat den Durchmesser $d = ${d}$ cm und die Höhe $h = ${h}$ cm. Wie groß ist ihr Volumen? Runde auf zwei Nachkommastellen.`,
      typ: "zahl", wert: V, toleranz: 0.011, einheit: "cm³", eingabe: "Volumen in cm³", abstand: 0.05,
      fehler: [{ wert: rund(PI * d * d * h, 2), typ: "durchmesser", text: `Die Grundfläche $πr^2$ braucht den Radius $r = ${r}$ cm, nicht den Durchmesser.` },
               { wert: rund(2 * PI * r * h, 2), typ: "oberflaeche", text: "Das ist die Mantelfläche $2πrh$. Das Volumen ist Grundfläche mal Höhe: $V = πr^2 h$." }],
      hinweise: ["Wie sieht die Grundfläche aus, und welche Größe braucht ihre Formel?", "Prisma und Zylinder: $V = G · h$, beim Zylinder $G = πr^2$", `$r = ${r}$, also $V = π · ${r}^2 · ${h}$.`],
      regeln: [{ name: "Volumen des Zylinders" }],
      loesung: [`$r = ${d} : 2 = ${r}$ cm`, `$V = π · ${r}^2 · ${h} ≈ ${d2(V)}$ cm³`],
      erklaer: { frage: "Erkläre, wie du das Volumen berechnet hast.", kriterien: [K("grund", "Grundfläche mal Höhe nennen", ["grundfläche", "g\\s*[·*]\\s*h", "mal höhe", "mal h"], "Wie berechnet man das Volumen jedes Prismas?"), K("radius", "Den Radius aus dem Durchmesser bestimmen", ["radius", "halb", "durch 2", ": 2", "r\\s*="], "Welche Größe braucht die Kreisfläche?")] },
    });
  }
  if (v === "zylO") {
    const r = zz(2, 8), h = zz(3, 15), O = rund(2 * PI * r * r + 2 * PI * r * h, 2);
    return bereinigen({
      daten: { v, r, h },
      text: `Ein Zylinder hat den Radius $r = ${r}$ cm und die Höhe $h = ${h}$ cm. Berechne seine Oberfläche. Runde auf zwei Nachkommastellen.`,
      typ: "zahl", wert: O, toleranz: 0.011, einheit: "cm²", eingabe: "Fläche in cm²", abstand: 0.05,
      fehler: [{ wert: rund(PI * r * r + 2 * PI * r * h, 2), typ: "oberflaeche", text: "Ein Zylinder hat zwei Kreisflächen – Boden und Deckel." },
               { wert: rund(2 * PI * r * h, 2), typ: "oberflaeche", text: "Das ist nur der Mantel. Boden und Deckel fehlen noch." },
               { wert: rund(PI * r * r * h, 2), typ: "oberflaeche", text: "Das ist das Volumen, keine Fläche." }],
      hinweise: ["Aus welchen Flächen besteht das Netz eines Zylinders?", "$O = 2 · πr^2 + 2πr · h$ (zwei Kreise und ein Rechteck als Mantel)", `Rechne $2 · π · ${r}^2 + 2 · π · ${r} · ${h}$.`],
      regeln: [{ name: "Oberfläche des Zylinders" }],
      loesung: [`$O = 2π · ${r}^2 + 2π · ${r} · ${h} ≈ ${d2(O)}$ cm²`],
      erklaer: { frage: "Erkläre, aus welchen Teilen die Oberfläche besteht.", kriterien: [K("kreise", "Zwei Kreisflächen nennen", ["zwei kreis", "2 kreis", "boden", "deckel", "2\\s*[·*]?\\s*π\\s*r²", "2πr²"], "Welche Flächen schließen den Zylinder oben und unten ab?"), K("mantel", "Den Mantel als Rechteck 2πr · h nennen", ["mantel", "rechteck", "2πrh", "2\\s*π\\s*r\\s*h"], "Wie sieht der abgerollte Mantel aus?")] },
    });
  }
  const g = zz(3, 10), hg = zz(2, 9), h = zz(4, 15), G = (g * hg) / 2, V = G * h;
  return bereinigen({
    daten: { v, g, hg, h },
    text: `Die Grundfläche eines Prismas ist ein Dreieck mit der Grundseite $g = ${g}$ cm und der Höhe $h_g = ${hg}$ cm. Das Prisma ist $h = ${h}$ cm hoch. Berechne das Volumen.`,
    typ: "zahl", wert: V, toleranz: 1e-6, einheit: "cm³", eingabe: "Volumen in cm³",
    fehler: [{ wert: g * hg * h, typ: "grundflaeche", text: "Die Dreiecksfläche ist $\\frac{1}{2} · g · h_g$ – der Faktor $\\frac{1}{2}$ fehlt." },
             { wert: G, typ: "grundflaeche", text: "Das ist erst die Grundfläche. Multipliziere noch mit der Körperhöhe." }],
    hinweise: ["Wie groß ist die Grundfläche, und wie kommst du von ihr zum Volumen?", "$V = G · h$ mit $G = \\frac{1}{2} · g · h_g$", `$G = \\frac{1}{2} · ${g} · ${hg} = ${dez(G, 2)}$ cm²`],
    regeln: [{ name: "Volumen des Prismas" }],
    loesung: [`$G = \\frac{1}{2} · ${g} · ${hg} = ${dez(G, 2)}$ cm²`, `$V = ${dez(G, 2)} · ${h} = ${dez(V, 2)}$ cm³`],
    erklaer: { frage: "Erkläre, wie du das Volumen berechnet hast.", kriterien: [K("grund", "Grundfläche mal Höhe nennen", ["grundfläche", "g\\s*[·*]\\s*h", "mal höhe", "mal h"], "Wie berechnet man das Volumen jedes Prismas?"), K("dreieck", "Die Dreiecksfläche mit dem Faktor ½ berechnen", ["1/2", "½", "halb", "durch 2", ": 2"], "Wie berechnet man die Fläche eines Dreiecks?")] },
  });
} });
reg({ id: "geo-pyramide", thema: "kreiskoerper", afb: 2, fuer: ["drittel", "durchmesser"], mach() {
  if (Math.random() < 0.5) {
    const a = zz(2, 12), h = zz(3, 15), V = (a * a * h) / 3;
    return bereinigen({
      daten: { art: "pyramide", a, h },
      text: `Eine quadratische Pyramide hat die Grundkante $a = ${a}$ cm und die Höhe $h = ${h}$ cm. Berechne ihr Volumen. Runde auf zwei Nachkommastellen.`,
      typ: "zahl", wert: rund(V, 2), toleranz: 0.011, einheit: "cm³", eingabe: "Volumen in cm³", abstand: 0.05,
      fehler: [{ wert: a * a * h, typ: "drittel", text: "Das ist das Volumen des Quaders mit gleicher Grundfläche und Höhe. Eine Pyramide füllt nur ein Drittel davon: $V = \\frac{1}{3} · G · h$." },
               { wert: rund((a * a * h) / 2, 2), typ: "drittel", text: "Bei Spitzkörpern ist der Faktor $\\frac{1}{3}$, nicht $\\frac{1}{2}$." }],
      hinweise: ["Wie viel Platz nimmt eine Pyramide im Vergleich zum Prisma mit gleicher Grundfläche und Höhe ein?", "$V = \\frac{1}{3} · G · h$ mit $G = a^2$", `Rechne $\\frac{1}{3} · ${a * a} · ${h}$.`],
      regeln: [{ name: "Volumen der Pyramide" }],
      loesung: [`$G = ${a}^2 = ${a * a}$ cm²`, `$V = \\frac{1}{3} · ${a * a} · ${h} ≈ ${d2(V)}$ cm³`],
      erklaer: { frage: "Erkläre die Formel für das Pyramidenvolumen.", kriterien: [K("drittel", "Den Faktor 1/3 nennen", ["1/3", "⅓", "drittel", ": 3", "durch 3"], "Welcher Faktor steht vor G · h?"), K("grund", "Grundfläche a² nennen", ["a²", "a\\^2", "grundfläche", "quadrat"], "Wie groß ist die quadratische Grundfläche?")] },
    });
  }
  const r = zz(2, 9), h = zz(3, 15), V = (PI * r * r * h) / 3;
  return bereinigen({
    daten: { art: "kegel", r, h },
    text: `Ein Kegel hat den Radius $r = ${r}$ cm und die Höhe $h = ${h}$ cm. Berechne sein Volumen. Runde auf zwei Nachkommastellen.`,
    typ: "zahl", wert: rund(V, 2), toleranz: 0.011, einheit: "cm³", eingabe: "Volumen in cm³", abstand: 0.05,
    fehler: [{ wert: rund(PI * r * r * h, 2), typ: "drittel", text: "Das ist das Volumen des Zylinders. Der Kegel füllt nur ein Drittel davon." },
             { wert: rund((PI * 4 * r * r * h) / 3, 2), typ: "durchmesser", text: "In die Formel gehört der Radius, nicht der Durchmesser." }],
    hinweise: ["Mit welchem Körper kannst du den Kegel vergleichen?", "$V = \\frac{1}{3} · πr^2 · h$", `Rechne $\\frac{1}{3} · π · ${r}^2 · ${h}$.`],
    regeln: [{ name: "Volumen des Kegels" }],
    loesung: [`$V = \\frac{1}{3} · π · ${r}^2 · ${h} ≈ ${d2(V)}$ cm³`],
    erklaer: { frage: "Erkläre die Formel für das Kegelvolumen.", kriterien: [K("drittel", "Den Faktor 1/3 nennen", ["1/3", "⅓", "drittel", ": 3", "durch 3"], "Welcher Faktor steht vor G · h?"), K("kreis", "Die Kreisfläche πr² als Grundfläche nennen", ["πr", "π\\s*[·*]?\\s*r", "kreis", "grundfläche"], "Wie groß ist die Grundfläche?")] },
  });
} });
reg({ id: "geo-kugel", thema: "kreiskoerper", afb: 2, fuer: ["kugelformel"], mach() {
  const r = zz(2, 12), vol = Math.random() < 0.5;
  const V = (4 / 3) * PI * r ** 3, O = 4 * PI * r * r;
  if (vol) return bereinigen({
    daten: { r, vol },
    text: `Eine Kugel hat den Radius $r = ${r}$ cm. Berechne ihr Volumen. Runde auf zwei Nachkommastellen.`,
    typ: "zahl", wert: rund(V, 2), toleranz: 0.011, einheit: "cm³", eingabe: "Volumen in cm³", abstand: 0.05,
    fehler: [{ wert: rund(O, 2), typ: "kugelformel", text: "Das ist die Oberfläche $4πr^2$. Fürs Volumen steht $r$ hoch 3: $V = \\frac{4}{3}πr^3$." },
             { wert: rund((4 / 3) * PI * r * r, 2), typ: "kugelformel", text: "Ein Volumen hat die Einheit cm³ – deshalb $r^3$, nicht $r^2$." },
             { wert: rund(PI * r ** 3, 2), typ: "kugelformel", text: "Der Faktor $\\frac{4}{3}$ fehlt." }],
    hinweise: ["Ein Rauminhalt hat drei Dimensionen. Welche Potenz von r gehört dazu?", "$V = \\frac{4}{3} · π · r^3$", `Rechne $\\frac{4}{3} · π · ${r}^3 = \\frac{4}{3} · π · ${r ** 3}$.`],
    regeln: [{ name: "Volumen der Kugel" }],
    loesung: [`$V = \\frac{4}{3} · π · ${r}^3 ≈ ${d2(V)}$ cm³`],
    erklaer: { frage: "Erkläre, warum in der Volumenformel r³ steht.", kriterien: [K("hoch3", "r hoch 3 nennen", ["r³", "r\\^3", "hoch 3", "hoch drei", "kubik"], "Welche Potenz von r gehört zum Volumen?"), K("faktor", "Den Faktor 4/3 π nennen", ["4/3", "4 drittel", "vier drittel"], "Welcher Faktor steht davor?")] },
  });
  return bereinigen({
    daten: { r, vol },
    text: `Eine Kugel hat den Radius $r = ${r}$ cm. Berechne ihre Oberfläche. Runde auf zwei Nachkommastellen.`,
    typ: "zahl", wert: rund(O, 2), toleranz: 0.011, einheit: "cm²", eingabe: "Fläche in cm²", abstand: 0.05,
    fehler: [{ wert: rund(V, 2), typ: "kugelformel", text: "Das ist das Volumen. Die Oberfläche ist eine Fläche: $O = 4πr^2$." },
             { wert: rund(PI * r * r, 2), typ: "kugelformel", text: "$πr^2$ ist nur ein Großkreis. Die Kugeloberfläche ist viermal so groß." }],
    hinweise: ["Eine Fläche hat zwei Dimensionen. Welche Potenz von r gehört dazu?", "$O = 4 · π · r^2$", `Rechne $4 · π · ${r * r}$.`],
    regeln: [{ name: "Oberfläche der Kugel" }],
    loesung: [`$O = 4 · π · ${r}^2 ≈ ${d2(O)}$ cm²`],
    erklaer: { frage: "Erkläre die Formel für die Kugeloberfläche.", kriterien: [K("hoch2", "r² nennen", ["r²", "r\\^2", "quadrat", "hoch 2"], "Welche Potenz von r gehört zur Fläche?"), K("vier", "Den Faktor 4π nennen", ["4π", "4\\s*[·*]?\\s*π", "vier", "4 kreis"], "Wie viele Großkreise passen auf die Kugel?")] },
  });
} });
reg({ id: "geo-winkel", thema: "dreieckgeo", afb: 1, fuer: ["winkelsumme"], mach() {
  if (Math.random() < 0.5) {
    for (;;) {
      const al = zz(20, 110), be = zz(15, 120), ga = 180 - al - be;
      if (ga < 10) continue;
      return bereinigen({
        daten: { art: "dreieck", al, be },
        text: `In einem Dreieck ist $α = ${al}°$ und $β = ${be}°$. Wie groß ist $γ$?`,
        typ: "zahl", wert: ga, toleranz: 1e-9, einheit: "°", eingabe: "Winkel in Grad",
        fehler: [{ wert: 360 - al - be, typ: "winkelsumme", text: "Die Winkelsumme im Dreieck ist 180°, nicht 360° (das gilt im Viereck)." },
                 { wert: al + be, typ: "winkelsumme", text: "Du hast α und β addiert. γ ist das, was zu 180° noch fehlt." }],
        hinweise: ["Was weißt du über die Summe der drei Innenwinkel?", "$α + β + γ = 180°$", `Rechne $180° - ${al}° - ${be}°$.`],
        regeln: [{ name: "Winkelsumme im Dreieck" }],
        loesung: [`$γ = 180° - ${al}° - ${be}° = ${ga}°$`],
        erklaer: { frage: "Erkläre, wie du γ bestimmt hast.", kriterien: [K("summe", "Die Winkelsumme 180° nennen", ["180", "winkelsumme", "summe"], "Wie groß sind die drei Winkel zusammen?")] },
      });
    }
  }
  const n = wahl([5, 6, 8, 9, 10, 12]), S = (n - 2) * 180, w = S / n;
  return bereinigen({
    daten: { art: "neck", n },
    text: `Wie groß ist jeder Innenwinkel in einem regelmäßigen ${n}-Eck?`,
    typ: "zahl", wert: w, toleranz: 1e-9, einheit: "°", eingabe: "Winkel in Grad",
    fehler: [{ wert: 180, typ: "winkelsumme", text: "Ein n-Eck lässt sich in n − 2 Dreiecke zerlegen. Seine Winkelsumme ist (n − 2) · 180°, verteilt auf n Winkel." },
             { wert: S, typ: "winkelsumme", text: `Das ist die Winkelsumme aller ${n} Winkel. Teile noch durch ${n}.` },
             { wert: 360 / n, typ: "winkelsumme", text: "360° : n ist der Mittelpunktswinkel, nicht der Innenwinkel." }],
    hinweise: ["In wie viele Dreiecke kannst du das Vieleck von einer Ecke aus zerlegen?", "Winkelsumme im n-Eck: $(n - 2) · 180°$", `$(${n} - 2) · 180° = ${S}°$, verteilt auf ${n} gleiche Winkel.`],
    regeln: [{ name: "Winkelsumme im n-Eck" }],
    loesung: [`$S = (${n} - 2) · 180° = ${S}°$`, `$${S}° : ${n} = ${dez(w, 2)}°$`],
    erklaer: { frage: "Erkläre, wie du den Innenwinkel bestimmt hast.", kriterien: [K("summe", "Winkelsumme (n − 2) · 180° nennen", ["n\\s*-\\s*2", "dreiecke", "\\(n−2\\)", "winkelsumme"], "Wie groß ist die Winkelsumme im n-Eck?"), K("teilen", "Durch die Anzahl der Ecken teilen", ["teil", "durch", ":", "/", "gleich"], "Wie verteilt sich die Summe auf die Winkel?")] },
  });
} });
reg({ id: "geo-kongruenz", thema: "dreieckgeo", afb: 1, fuer: ["kongruenzsatz"], mach() {
  const OPT = ["SSS", "SWS", "WSW", "SsW", "nicht eindeutig"];
  const fall = wahl(["sss", "sws", "wsw", "ssw", "sswKlein", "www"]);
  let text, richtig, f = {};
  if (fall === "sss") { const [a, b, c] = mischen([4, 5, 7]); text = `$a = ${a}$ cm, $b = ${b}$ cm, $c = ${c}$ cm`; richtig = 0; }
  if (fall === "sws") { const al = wahl([40, 55, 70]); text = `$b = 5$ cm, $c = 7$ cm, $α = ${al}°$`; richtig = 1; f = { 3: "α liegt zwischen den Seiten b und c (eingeschlossen) – das ist SWS." }; }
  if (fall === "wsw") { const al = wahl([35, 50]), be = wahl([60, 70]); text = `$c = 6$ cm, $α = ${al}°$, $β = ${be}°$`; richtig = 2; f = { 1: "Gegeben sind zwei Winkel und die Seite dazwischen – das ist WSW, nicht SWS." }; }
  if (fall === "ssw") { const al = wahl([40, 55, 65]); text = `$a = 7$ cm, $b = 5$ cm, $α = ${al}°$`; richtig = 3; f = { 1: "α liegt nicht zwischen a und b, sondern gegenüber von a." }; }
  if (fall === "sswKlein") { const al = wahl([30, 35, 40]); text = `$a = 4$ cm, $b = 6$ cm, $α = ${al}°$`; richtig = 4; f = { 3: "α liegt gegenüber der kleineren Seite a. Dann kann es zwei verschiedene Dreiecke geben – SsW verlangt den Winkel gegenüber der größeren Seite." }; }
  if (fall === "www") { const al = wahl([40, 50, 60]), be = wahl([60, 70]); text = `$α = ${al}°$, $β = ${be}°$, $γ = ${180 - al - be}°$`; richtig = 4; f = { 2: "Drei Winkel legen nur die Form fest, nicht die Größe – ähnliche Dreiecke unterschiedlicher Größe passen alle." }; }
  const fehler = OPT.map((_, i) => (i === richtig ? null : { wahl: i, typ: "kongruenzsatz", text: f[i] || "Prüfe, welche Stücke gegeben sind und wo der Winkel liegt: zwischen den Seiten oder gegenüber?" })).filter(Boolean);
  return {
    daten: { fall },
    text: `Von einem Dreieck sind gegeben: ${text}. Nach welchem Kongruenzsatz ist das Dreieck eindeutig bestimmt?`, typ: "wahl", optionen: OPT, richtig, fehler,
    hinweise: ["Wie viele Seiten und wie viele Winkel sind gegeben?", "SWS: Winkel zwischen den beiden Seiten. WSW: Seite zwischen den beiden Winkeln. SsW: Winkel gegenüber der größeren Seite.", "Mach eine Skizze und markiere die gegebenen Stücke."],
    regeln: [{ name: "Kongruenzsätze" }],
    loesung: [`${OPT[richtig] === "nicht eindeutig" ? "Das Dreieck ist nicht eindeutig bestimmt." : `Kongruenzsatz ${OPT[richtig]}.`}`],
    erklaer: { frage: "Begründe deine Wahl.", kriterien: [K("lage", "Die Lage des Winkels (eingeschlossen, gegenüber) nennen", ["zwischen", "eingeschlossen", "gegenüber", "anliegend", "größer", "kleiner"], "Wo liegt der Winkel im Verhältnis zu den Seiten?")] },
  };
} });
reg({ id: "geo-strahlen", thema: "dreieckgeo", afb: 2, fuer: ["strahlverhaeltnis"], mach() {
  for (;;) {
    const a = zz(2, 8), d = zz(1, 8), zweiter = Math.random() < 0.5;
    if (zweiter) {
      const p = zz(2, 12), w = (p * (a + d)) / a;
      if (Math.abs(w * 2 - Math.round(w * 2)) > 1e-9) continue;
      return bereinigen({
        daten: { a, d, p, zweiter },
        text: `Zwei Strahlen gehen vom Zentrum $S$ aus und werden von zwei Parallelen geschnitten. Es gilt $\\overline{SA} = ${a}$ cm, $\\overline{AA'} = ${d}$ cm und $\\overline{AB} = ${p}$ cm. Berechne $\\overline{A'B'}$.`,
        typ: "zahl", wert: w, toleranz: 1e-6, einheit: "cm", eingabe: "Länge in cm",
        fehler: [{ wert: (p * d) / a, typ: "strahlverhaeltnis", text: `Beim 2. Strahlensatz wird vom Zentrum aus gemessen: $\\overline{SA'} = ${a} + ${d} = ${a + d}$ cm, nicht nur die Teilstrecke $\\overline{AA'}$.` },
                 { wert: (p * a) / (a + d), typ: "strahlverhaeltnis", text: "Das Verhältnis ist umgedreht: Die äußere Parallele ist länger als die innere." }],
        hinweise: ["Welche Strecken vom Zentrum aus gehören zu den beiden Parallelen?", "2. Strahlensatz: $\\frac{\\overline{A'B'}}{\\overline{AB}} = \\frac{\\overline{SA'}}{\\overline{SA}}$", `$\\overline{SA'} = ${a + d}$ cm. Rechne $${p} · \\frac{${a + d}}{${a}}$.`],
        regeln: [{ name: "Zweiter Strahlensatz" }],
        loesung: [`$\\overline{SA'} = ${a} + ${d} = ${a + d}$ cm`, `$\\overline{A'B'} = ${p} · \\frac{${a + d}}{${a}} = ${dez(w, 2)}$ cm`],
        erklaer: { frage: "Erkläre, welches Verhältnis du benutzt hast.", kriterien: [K("zentrum", "Vom Zentrum S aus messen (ganze Strecke SA′)", ["zentrum", "von s", "sa'", "sa′", "ganze"], "Von welchem Punkt aus werden die Strecken beim 2. Strahlensatz gemessen?"), K("verh", "Parallelenabschnitte und Strahlabschnitte ins Verhältnis setzen", ["verhältnis", "parallel", "gleich", "bruch", ":"], "Welche Verhältnisse sind gleich?")] },
      });
    }
    const b = zz(2, 12), w = (b * d) / a;
    if (Math.abs(w * 2 - Math.round(w * 2)) > 1e-9 || w === b) continue;
    return bereinigen({
      daten: { a, d, b, zweiter },
      text: `Zwei Strahlen gehen vom Zentrum $S$ aus und werden von zwei Parallelen geschnitten. Es gilt $\\overline{SA} = ${a}$ cm, $\\overline{AA'} = ${d}$ cm und $\\overline{SB} = ${b}$ cm. Berechne $\\overline{BB'}$.`,
      typ: "zahl", wert: w, toleranz: 1e-6, einheit: "cm", eingabe: "Länge in cm",
      fehler: [{ wert: (b * (a + d)) / a, typ: "strahlverhaeltnis", text: "Das ist $\\overline{SB'}$, die ganze Strecke vom Zentrum. Gesucht ist nur das Stück $\\overline{BB'}$." },
               { wert: (b * a) / d, typ: "strahlverhaeltnis", text: "Das Verhältnis ist umgedreht: $\\frac{\\overline{BB'}}{\\overline{SB}} = \\frac{\\overline{AA'}}{\\overline{SA}}$." }],
      hinweise: ["Welche Abschnitte auf den beiden Strahlen entsprechen sich?", "1. Strahlensatz: $\\frac{\\overline{BB'}}{\\overline{SB}} = \\frac{\\overline{AA'}}{\\overline{SA}}$", `Rechne $${b} · \\frac{${d}}{${a}}$.`],
      regeln: [{ name: "Erster Strahlensatz" }],
      loesung: [`$\\overline{BB'} = ${b} · \\frac{${d}}{${a}} = ${dez(w, 2)}$ cm`],
      erklaer: { frage: "Erkläre, welches Verhältnis du benutzt hast.", kriterien: [K("verh", "Entsprechende Abschnitte auf beiden Strahlen ins Verhältnis setzen", ["verhältnis", "entsprech", "gleich", "bruch", ":"], "Welche Verhältnisse sind gleich?")] },
    });
  }
} });

/* ======================================================================
   Normalverteilung (Rechnungen in normal.js)
   ====================================================================== */
const p4 = (v) => dez(v, 4);
const kz2 = (v) => dez(Math.round(v * 100) / 100, 2);
reg({ id: "nv-kleiner", thema: "normal", afb: 2, fuer: ["standardisieren", "gegenwkt"], mach() {
  const art = Math.random() < 0.5 ? "kleiner" : "groesser";
  const a = nvAufgabe(art);
  const k = NV_KONTEXTE.find((x) => x.id === a.kontext), e = typeof k.einheit === "string" ? k.einheit : k.einheit.de;
  const zR = Math.round(a.zWert * 100) / 100;
  const links = vert(a.x, a.mu, a.s), w = art === "kleiner" ? links : 1 - links;
  return bereinigen({
    daten: { art, mu: a.mu, s: a.s, x: a.x },
    text: `${k.de(a.mu, a.s)} Mit welcher Wahrscheinlichkeit ist der Wert für ${k.wasDe} ${art === "kleiner" ? "höchstens" : "mindestens"} $${dez(a.x)}$ ${e}? Runde auf vier Nachkommastellen.`,
    typ: "zahl", wert: w, toleranz: NV_TOL_P, eingabe: "Wahrscheinlichkeit, z. B. 0,1234", abstand: 0.01,
    fehler: [{ wert: 1 - w, typ: "gegenwkt", text: art === "kleiner" ? "Das ist die Fläche rechts. „Höchstens“ heißt: Fläche links, also $\\Phi(z)$." : "Das ist die Fläche links. „Mindestens“ heißt: Fläche rechts, also $1 - \\Phi(z)$." },
             { wert: art === "kleiner" ? Phi((a.x - a.mu) / (a.s * a.s)) : 1 - Phi((a.x - a.mu) / (a.s * a.s)), typ: "standardisieren", text: "Beim Standardisieren wird durch σ geteilt, nicht durch σ²." }],
    hinweise: ["Skizziere die Glocke: Welche Fläche ist gesucht – links oder rechts von x?", `$z = \\frac{x - μ}{σ}$, dann $P(X \\le x) = \\Phi(z)$${art === "kleiner" ? "" : " und $P(X \\ge x) = 1 - \\Phi(z)$"}`, `$z = \\frac{${dez(a.x)} - ${dez(a.mu)}}{${dez(a.s)}} ≈ ${kz2(zR)}$`],
    regeln: [{ name: "Normalverteilung" }, { name: "Standardisieren" }],
    loesung: [`$z = \\frac{${dez(a.x)} - ${dez(a.mu)}}{${dez(a.s)}} ≈ ${kz2(zR)}$`, art === "kleiner" ? `$P(X \\le ${dez(a.x)}) = \\Phi(${kz2(zR)}) ≈ ${p4(w)}$` : `$P(X \\ge ${dez(a.x)}) = 1 - \\Phi(${kz2(zR)}) ≈ ${p4(w)}$`],
    erklaer: { frage: "Erkläre deinen Rechenweg.", kriterien: [K("z", "Standardisieren: z = (x − μ) : σ", ["standardis", "z\\s*=", "minus μ", "durch σ", "x\\s*-\\s*μ"], "Wie machst du aus x einen z-Wert?"), K("seite", art === "kleiner" ? "Φ(z) als Fläche links nennen" : "1 − Φ(z) als Fläche rechts nennen", art === "kleiner" ? ["links", "φ", "phi", "höchstens"] : ["1\\s*-", "1 minus", "gegen", "rechts"], "Welche Seite der Glocke ist gefragt?")] },
  });
} });
reg({ id: "nv-zwischen", thema: "normal", afb: 2, fuer: ["intervall", "sigmaregel"], mach() {
  if (Math.random() < 0.35) {
    const a = nvAufgabe("sigma");
    const k = NV_KONTEXTE.find((x) => x.id === a.kontext), e = typeof k.einheit === "string" ? k.einheit : k.einheit.de;
    const ks = a.k === 1 ? "" : a.k;
    return bereinigen({
      daten: { art: "sigma", k: a.k, mu: a.mu, s: a.s },
      text: `${k.de(a.mu, a.s)} Wie groß ist $P(${dez(a.unten)} \\le X \\le ${dez(a.oben)})$ ungefähr? Gib die Wahrscheinlichkeit als Dezimalzahl an (z. B. 0,5).`,
      typ: "zahl", wert: a.wert, toleranz: 0.004, eingabe: "Wahrscheinlichkeit", abstand: 0.01,
      fehler: [{ wert: SIGMA_REGELN[a.k === 1 ? 1 : 0].p, typ: "sigmaregel", text: `Das Intervall reicht ${a.k === 1 ? "eine" : a.k === 2 ? "zwei" : "drei"} Standardabweichung${a.k === 1 ? "" : "en"} um μ. Prüfe: ${dez(a.unten)} = μ − ${ks}σ.` },
               { wert: 1 - a.wert, typ: "sigmaregel", text: "Das ist der Anteil außerhalb des Intervalls." }],
      hinweise: ["Wie viele σ liegen die Grenzen von μ entfernt?", "σ-Regeln: 68,3 % · 95,4 % · 99,7 %", `$${dez(a.unten)} = ${dez(a.mu)} - ${a.k === 1 ? "" : `${a.k} · `}${dez(a.s)}$ – das ist die ${a.k}σ-Umgebung.`],
      regeln: [{ name: "Sigma-Regeln" }],
      loesung: [`$[${dez(a.unten)}; ${dez(a.oben)}] = [μ - ${ks}σ; μ + ${ks}σ]$`, `$P ≈ ${p4(a.wert)}$`],
      erklaer: { frage: "Erkläre, wie du ohne Rechnung auf das Ergebnis kommst.", kriterien: [K("sigma", "Die Grenzen als μ ± kσ erkennen", ["σ", "sigma", "standardabweichung", "μ\\s*[±+-]"], "Wie liegen die Grenzen zu μ?")] },
    });
  }
  const a = nvAufgabe("zwischen");
  const k = NV_KONTEXTE.find((x) => x.id === a.kontext), e = typeof k.einheit === "string" ? k.einheit : k.einheit.de;
  return bereinigen({
    daten: { art: "zwischen", mu: a.mu, s: a.s, a: a.a, b: a.b },
    text: `${k.de(a.mu, a.s)} Mit welcher Wahrscheinlichkeit liegt der Wert für ${k.wasDe} zwischen $${dez(a.a)}$ und $${dez(a.b)}$ ${e}? Runde auf vier Nachkommastellen.`,
    typ: "zahl", wert: a.wert, toleranz: NV_TOL_P, eingabe: "Wahrscheinlichkeit", abstand: 0.01,
    fehler: [{ wert: a.Pb + a.Pa, typ: "intervall", text: "Die Flächen werden subtrahiert: $\\Phi(z_b) - \\Phi(z_a)$." },
             { wert: 1 - a.wert, typ: "intervall", text: "Das ist die Fläche außerhalb des Intervalls." },
             { wert: a.Pb, typ: "intervall", text: "Das ist die ganze Fläche links von b. Zieh die Fläche links von a ab." }],
    hinweise: ["Welche Fläche ist gesucht? Skizziere sie.", "$P(a \\le X \\le b) = \\Phi(z_b) - \\Phi(z_a)$", `$z_a ≈ ${kz2(a.za)}$, $z_b ≈ ${kz2(a.zb)}$`],
    regeln: [{ name: "Normalverteilung" }],
    loesung: [`$z_a = \\frac{${dez(a.a)} - ${dez(a.mu)}}{${dez(a.s)}} ≈ ${kz2(a.za)}$, $z_b = \\frac{${dez(a.b)} - ${dez(a.mu)}}{${dez(a.s)}} ≈ ${kz2(a.zb)}$`, `$P ≈ ${p4(a.Pb)} - ${p4(a.Pa)} ≈ ${p4(a.wert)}$`],
    erklaer: { frage: "Erkläre, wie du die Wahrscheinlichkeit für das Intervall berechnet hast.", kriterien: [K("diff", "Große Fläche minus kleine Fläche", ["minus", "-", "differenz", "subtrah", "abzieh"], "Wie kommst du von zwei Flächen links zur Fläche dazwischen?")] },
  });
} });
reg({ id: "nv-quantil", thema: "normal", afb: 3, fuer: ["standardisieren"], mach() {
  const a = nvAufgabe("quantil");
  const k = NV_KONTEXTE.find((x) => x.id === a.kontext), e = typeof k.einheit === "string" ? k.einheit : k.einheit.de;
  const zR = Math.round(a.zp * 100) / 100, tol = Math.max(0.011, 0.012 * a.s);
  return bereinigen({
    daten: { mu: a.mu, s: a.s, p: a.p },
    text: `${k.de(a.mu, a.s)} Bestimme den Wert $x$, für den $P(X \\le x) = ${dez(a.p)}$ gilt. Runde auf zwei Nachkommastellen.`,
    typ: "zahl", wert: a.wert, toleranz: tol, einheit: e, eingabe: "Wert", abstand: 4 * tol,
    fehler: [{ wert: a.mu - a.zp * a.s, typ: "standardisieren", text: `Vorzeichen prüfen: Für $p ${a.p > 0.5 ? ">" : "<"} 0{,}5$ liegt x ${a.p > 0.5 ? "über" : "unter"} μ. Es gilt $x = μ + z · σ$.` },
             { wert: a.zp * a.s, typ: "standardisieren", text: "μ fehlt: $z · σ$ ist nur der Abstand zu μ." }],
    hinweise: ["Gesucht ist ein Wert, keine Wahrscheinlichkeit. Rechne rückwärts.", "Erst $z$ mit $\\Phi(z) = p$ (invNorm), dann $x = μ + z · σ$", `$z ≈ ${kz2(zR)}$`],
    regeln: [{ name: "Quantil der Normalverteilung" }],
    loesung: [`$z ≈ ${kz2(zR)}$`, `$x = ${dez(a.mu)} + (${kz2(zR)}) · ${dez(a.s)} ≈ ${dez(Math.round(a.wert * 100) / 100, 2)}$ ${e}`],
    erklaer: { frage: "Erkläre, wie du rückwärts gerechnet hast.", kriterien: [K("inv", "z über die Umkehrung von Φ bestimmen", ["invnorm", "umkehr", "rückwärts", "tabelle", "φ", "phi"], "Wie findest du z zu einer gegebenen Wahrscheinlichkeit?"), K("zurueck", "x = μ + z · σ nennen", ["μ\\s*\\+", "mal σ", "·\\s*σ", "z\\s*[·*]\\s*σ", "plus"], "Wie kommst du von z zurück zu x?")] },
  });
} });
reg({ id: "nv-binom", thema: "normal", afb: 3, fuer: ["stetigkeit", "standardisieren"], mach() {
  const a = nvAufgabe("binom");
  const sR = Math.round(a.sB * 100) / 100;
  return bereinigen({
    daten: { n: a.n, p: a.p, k: a.k },
    text: `$X$ ist binomialverteilt mit $n = ${a.n}$ und $p = ${dez(a.p)}$. Berechne $P(X \\le ${a.k})$ näherungsweise mit der Normalverteilung (mit Stetigkeitskorrektur). Runde auf vier Nachkommastellen.`,
    typ: "zahl", wert: a.wert, toleranz: NV_TOL_P, eingabe: "Wahrscheinlichkeit", abstand: 0.008,
    fehler: [{ wert: a.ohneKorrektur, typ: "stetigkeit", text: "Ohne Stetigkeitskorrektur fehlt die halbe Säule über k. Rechne mit $k + 0{,}5$." },
             { wert: Phi((a.k + 0.5 - a.muB) / (a.sB * a.sB)), typ: "standardisieren", text: "Geteilt wird durch σ, nicht durch die Varianz $σ^2 = n · p · (1 - p)$." }],
    hinweise: ["Welche Normalverteilung passt zu B(n; p)?", "$μ = n · p$, $σ = \\sqrt{n · p · (1 - p)}$, $P(X \\le k) ≈ \\Phi\\left(\\frac{k + 0{,}5 - μ}{σ}\\right)$", `$μ = ${dez(a.muB)}$, $σ ≈ ${dez(sR, 2)}$`],
    regeln: [{ name: "Näherung der Binomialverteilung" }],
    loesung: [`$μ = ${a.n} · ${dez(a.p)} = ${dez(a.muB)}$`, `$σ = \\sqrt{${a.n} · ${dez(a.p)} · ${dez(1 - a.p)}} ≈ ${dez(sR, 2)}$`, `$P(X \\le ${a.k}) ≈ \\Phi\\left(\\frac{${dez(a.k + 0.5)} - ${dez(a.muB)}}{${dez(sR, 2)}}\\right) ≈ ${p4(a.wert)}$`],
    erklaer: { frage: "Erkläre die Stetigkeitskorrektur.", kriterien: [K("halb", "k + 0,5 nennen", ["0,5", "0\\.5", "halb", "säule", "balken"], "Warum rechnest du mit k + 0,5?"), K("laplace", "μ = np und σ = √(np(1 − p)) nennen", ["n\\s*[·*]?\\s*p", "wurzel", "√", "laplace", "σ"], "Welche Parameter hat die Normalverteilung?")] },
  });
} });

/* ======================================================================
   Aufgaben erzeugen und prüfen
   ====================================================================== */
export function neueAufgabe(generatorId, varianteVon) {
  const g = typeof generatorId === "string" ? GENERATOREN.find((x) => x.id === generatorId) : generatorId;
  const a = g.mach.call(g);
  a.id = neuId(); a.thema = g.thema; a.variante = g.id; a.afb = g.afb;
  a.punkte = g.afb === 1 ? 2 : g.afb === 2 ? 3 : 4;
  a.sekunden = a.typ === "wahl" ? 90 : g.afb === 1 ? 90 : g.afb === 2 ? 150 : 210;
  a.fuer = g.fuer;
  return a;
}
export const generatorenZu = (thema) => GENERATOREN.filter((g) => g.thema === thema);
export const generatorenFuerFehler = (typ) => GENERATOREN.filter((g) => g.fuer.includes(typ));

/* Bewertet die Eingabe: { ok, typ (Fehlertyp oder null), text (Rückmeldung), roh } */
export function pruefeAntwort(a, eingabe) {
  if (a.typ === "wahl") {
    if (eingabe === null || eingabe === undefined || eingabe === "") return { ok: false, leer: true };
    const i = Number(eingabe);
    if (i === a.richtig) return { ok: true };
    const f = a.fehler.find((x) => x.wahl === i);
    return { ok: false, typ: f ? f.typ : null, text: f ? f.text : "Das passt noch nicht. Prüfe die Aussage Schritt für Schritt." };
  }
  const v = lies(eingabe);
  if (v === null) return { ok: false, leer: String(eingabe || "").trim() === "", ungueltig: String(eingabe || "").trim() !== "" };
  if (Math.abs(v - a.wert) <= a.toleranz + 1e-12) return { ok: true, wert: v };
  const f = a.fehler.find((x) => Math.abs(x.wert - v) <= a.toleranz + 1e-9);
  return { ok: false, wert: v, typ: f ? f.typ : null, text: f ? f.text : "Das passt noch nicht. Prüfe die Rechnung noch einmal oder öffne „Ich hänge fest“." };
}

/* Zahl lesen: Bruch a/b, Dezimalzahl mit Komma oder Punkt, Minus auch als „−“ */
export function lies(s) {
  const t = String(s ?? "").replace(/−/g, "-").replace(/\s/g, "").replace(/°$/, "");
  if (!t) return null;
  const m = t.match(/^(-?\d+(?:[.,]\d+)?)\/(-?\d+(?:[.,]\d+)?)$/);
  if (m) { const z = Number(m[1].replace(",", ".")), n = Number(m[2].replace(",", ".")); return n === 0 ? null : z / n; }
  if (!/^-?\d+([.,]\d+)?$/.test(t)) return null;
  const v = Number(t.replace(",", "."));
  return isFinite(v) ? v : null;
}

/* ======================================================================
   Erklär deinen Schritt – feste, fachlich geprüfte Kriterien (ohne KI)
   Jedes Kriterium: { id, text (was zu nennen ist), muster (Stichwörter), rueckfrage }
   ====================================================================== */
const K = (id, text, muster, rueckfrage) => ({ id, text, muster, rueckfrage });
function erklaerAbleiten(art) {
  const basis = { frage: "Erkläre in ein bis zwei Sätzen, wie du die Ableitung gebildet hast.", kriterien: [] };
  if (art === "potenz") basis.kriterien = [K("regel", "Die Potenzregel nennen", ["potenzregel", "exponent", "hochzahl", "n\\s*[·*]?\\s*x", "runter", "nach vorn", "vorne"], "Welche Regel hast du für den Term mit x² bzw. xⁿ benutzt?"), K("expo", "Sagen, was mit dem Exponenten passiert", ["um 1", "eins", "verkleiner", "minus 1", "-\\s*1", "kleiner", "sinkt"], "Was passiert mit dem Exponenten, nachdem er als Faktor nach vorn gewandert ist?")];
  else if (art === "kette") basis.kriterien = [K("regel", "Die Kettenregel nennen", ["kettenregel", "innere", "äußere", "aeussere", "verkettet"], "Welche Regel brauchst du, wenn in der Klammer mehr als nur x steht?"), K("innen", "Die innere Ableitung nennen", ["innere ableitung", "nachdifferenzier", "mal die ableitung", "ableitung der klammer", "ableitung von der klammer", "innen"], "Womit musst du die äußere Ableitung multiplizieren, und wie groß ist dieser Faktor hier?")];
  else basis.kriterien = [K("regel", "Die e-Funktion nennen", ["e-funktion", "e hoch", "e\\^", "exponential", "bleibt"], "Was passiert mit e^(kx) beim Ableiten?"), K("innen", "Die innere Ableitung des Exponenten nennen", ["innere", "kettenregel", "exponent", "vorfaktor", "faktor"], "Welcher Faktor kommt wegen des Terms im Exponenten dazu?")];
  return basis;
}
function erklaerGleichung(art) {
  const k = { quadrat: [K("verfahren", "Das Lösungsverfahren nennen (pq-Formel, Mitternachtsformel oder Faktorisieren)", ["pq", "mitternacht", "abc", "faktor", "nullprodukt", "satz vom", "quadratisch ergänz"], "Welches Verfahren hast du benutzt, und warum passt es zu dieser Gleichung?"), K("probe", "Eine Probe oder Kontrolle erwähnen", ["probe", "einsetz", "kontroll", "prüf", "pruef"], "Wie kannst du überprüfen, dass dein Ergebnis wirklich eine Lösung ist?")],
    linear: [K("klammer", "Das Ausmultiplizieren der Klammer nennen", ["ausmultipl", "klammer", "distributiv", "verteil"], "Was hast du zuerst mit der Klammer gemacht?"), K("umstellen", "Das Umstellen nach x beschreiben", ["umstell", "auf beiden seiten", "beide seiten", "addier", "subtrahier", "dividier", "teil"], "Welche Rechenoperationen hast du auf beiden Seiten ausgeführt?")],
    ausklammern: [K("nullprodukt", "Den Satz vom Nullprodukt oder Ausklammern nennen", ["nullprodukt", "ausklammer", "faktor", "produkt ist null", "produkt null"], "Was darfst du bei einem Produkt, das null ergibt, schließen?"), K("teilen", "Erklären, warum man nicht durch x teilt", ["durch x", "teilen", "dividier", "verloren", "verlier", "null", "0"], "Welche Lösung würdest du verlieren, wenn du beide Seiten durch x teilst?")] };
  return { frage: "Erkläre in ein bis zwei Sätzen, wie du zur Lösung gekommen bist.", kriterien: k[art] };
}
function erklaerBruch(art) {
  return art === "add"
    ? { frage: "Erkläre, wie du die beiden Brüche addiert hast.", kriterien: [K("nenner", "Den gemeinsamen Nenner nennen", ["gemeinsamen nenner", "gleichnamig", "erweiter", "hauptnenner", "nenner"], "Was musst du mit den Nennern tun, bevor du addierst?"), K("zaehler", "Nur die Zähler addieren", ["zähler", "zaehler", "nur die zähler", "oben"], "Was passiert mit dem Nenner, wenn du die Zähler addierst?")] }
    : { frage: "Erkläre, wie du durch den Bruch geteilt hast.", kriterien: [K("kehrwert", "Den Kehrwert nennen", ["kehrwert", "umdreh", "stürz", "stuerz", "invers"], "Wie verwandelst du das Teilen durch einen Bruch in eine Multiplikation?"), K("mal", "Das Multiplizieren und Kürzen erwähnen", ["mal", "multipl", "kürz", "kuerz"], "Was rechnest du mit dem Kehrwert, und kannst du am Ende noch kürzen?")] };
}
function erklaerTerm() {
  return { frage: "Erkläre, wie du den Mittelterm bestimmt hast.", kriterien: [K("formel", "Die binomische Formel nennen", ["binomisch", "formel", "(x\\s*[+-]\\s*a)"], "Welche binomische Formel gehört zu diesem Term?"), K("mittel", "Den Mittelterm als Doppeltes Produkt beschreiben", ["doppelte", "2\\s*[·*]?\\s*a", "zweimal", "2ax", "mittelterm", "produkt"], "Wie entsteht der Mittelterm aus den beiden Gliedern der Klammer?")] };
}
function erklaerBernoulli(art) {
  return art === "genau"
    ? { frage: "Erkläre, wie sich die Wahrscheinlichkeit zusammensetzt.", kriterien: [K("pfad", "Die Anzahl der Pfade (Binomialkoeffizient) nennen", ["binomial", "pfade", "reihenfolge", "über", "n über k", "anzahl"], "Auf wie viele Arten können die Treffer auf die Versuche verteilt sein?"), K("potenz", "Treffer- und Nieten-Wahrscheinlichkeit nennen", ["p\\^", "nieten", "gegenwahrscheinlichkeit", "1-p", "1 - p", "treffer"], "Mit welcher Wahrscheinlichkeit tritt eine einzelne Reihenfolge auf?")] }
    : { frage: "Erkläre, wie du das Ereignis aufgeschrieben und berechnet hast.", kriterien: [K("ungleichung", "Das Ereignis als Ungleichung angeben", ["x\\s*[≥≤<>]", "ungleichung", "mindestens", "höchstens", "mehr als", "weniger als"], "Wie lautet das Ereignis als Ungleichung mit X?"), K("grenze", "Die Grenze genau begründen", ["dazu", "eingeschlossen", "gehört", "selbst", "\\+\\s*1", "-\\s*1", "um eins", "grenze"], "Gehört die Zahl k selbst zum Ereignis? Was bedeutet das für die Grenze?")] };
}
function erklaerVektor(art) {
  if (art === "betrag") return { frage: "Erkläre, wie du die Länge berechnet hast.", kriterien: [K("formel", "Die Formel nennen (Quadrate addieren, Wurzel)", ["wurzel", "quadrat", "pythagoras", "√"], "Welche Rechenschritte führen von den Koordinaten zur Länge?")] };
  if (art === "ortho") return { frage: "Erkläre, wie du t bestimmt hast.", kriterien: [K("skalar", "Das Skalarprodukt nennen", ["skalarprodukt", "skalar"], "Welche Rechnung zwischen den beiden Vektoren muss null ergeben?"), K("null", "Die Bedingung „Skalarprodukt gleich null“ nennen", ["null", "= 0", "=0", "orthogonal", "senkrecht"], "Was muss für das Skalarprodukt gelten, damit die Vektoren senkrecht stehen?")] };
  return { frage: "Erkläre, wie du den Winkel berechnet hast.", kriterien: [K("formel", "Sinus bzw. arcsin nennen", ["sinus", "sin", "arcsin"], "Welche Winkelfunktion gehört zum Winkel zwischen Gerade und Ebene?"), K("normal", "Den Zusammenhang mit dem Normalenvektor erwähnen", ["normalen", "90", "senkrecht", "komplement"], "Wie hängt der Winkel zur Ebene mit dem Winkel zum Normalenvektor zusammen?")] };
}
function erklaerIntegral(art) {
  return art === "grenzen"
    ? { frage: "Erkläre, wie du das Integral berechnet hast.", kriterien: [K("stamm", "Die Stammfunktion nennen", ["stammfunktion", "aufleit", "potenzregel", "exponent", "erhöh"], "Wie bist du von f zu einer Stammfunktion F gekommen?"), K("grenzen", "F(b) − F(a) nennen", ["f\\(b\\)", "obere", "untere", "grenzen", "einsetz", "hauptsatz", "differenz"], "Was machst du mit der oberen und der unteren Grenze?")] }
    : { frage: "Erkläre, warum du die Fläche in Teile zerlegt hast.", kriterien: [K("nullstellen", "Die Nullstellen als Teilungsstellen nennen", ["nullstelle", "teil", "zerleg", "intervall"], "Wo musst du das Intervall teilen und warum?"), K("betrag", "Den Betrag der Teilintegrale erwähnen", ["betrag", "negativ", "unter der", "vorzeichen", "positiv"], "Was passiert mit Flächen unterhalb der x-Achse im Integral, und wie korrigierst du das?")] };
}
function erklaerKurve(art) {
  return art === "wende"
    ? { frage: "Erkläre, wie du die Wendestelle bestimmt hast.", kriterien: [K("zweite", "Die zweite Ableitung nennen", ["zweite ableitung", "f″", "f''", "f\\s*″", "krümmung", "kruemmung"], "Welche Ableitung musst du gleich null setzen, um eine Wendestelle zu finden?"), K("nachweis", "Den Nachweis (Vorzeichenwechsel oder f‴ ≠ 0) erwähnen", ["vorzeichenwechsel", "dritte", "f‴", "f'''", "hinreichend", "≠\\s*0", "ungleich"], "Reicht f″ = 0 allein schon aus? Was musst du noch prüfen?")] }
    : { frage: "Begründe deine Wahl in ein bis zwei Sätzen.", kriterien: [K("notwendig", "Sagen, dass f′ = 0 allein nicht genügt (notwendig, nicht hinreichend)", ["notwendig", "hinreichend", "reicht nicht", "genügt nicht", "alleine", "allein"], "Reicht f′(x) = 0 schon aus, um einen Extrempunkt zu belegen?"), K("vzw", "Den Vorzeichenwechsel von f′ oder das Vorzeichen von f″ nennen", ["vorzeichenwechsel", "vorzeichen", "f″", "f''", "wechsel", "links und rechts"], "Welche Prüfung entscheidet, ob wirklich ein Extrempunkt vorliegt?")] };
}

/* Bewertet eine schriftliche Erklärung gegen die Kriterien.
   Rückgabe: { erfuellt: [Kriterium], offen: [Kriterium], rueckfrage } */
export function pruefeErklaerung(kriterien, text) {
  const t = String(text || "").toLowerCase();
  const erfuellt = [], offen = [];
  for (const k of kriterien) (k.muster.some((m) => new RegExp(m, "i").test(t)) ? erfuellt : offen).push(k);
  return { erfuellt, offen, rueckfrage: offen[0] ? offen[0].rueckfrage : null };
}

/* ======================================================================
   Auswertung: Fehler beobachten, Typen absichern, Fortschritt zählen
   ====================================================================== */
export const MIN_BEOBACHTUNGEN = 3;   // erst ab drei Beobachtungen gilt ein Typ als wiederkehrend
export const MIN_TAGE = 2;            // … verteilt auf mindestens zwei verschiedene Tage
const tagVon = (ts) => Math.floor(ts / 86400000);

export function leereDaten() {
  return { beobachtungen: [], ausgeblendet: [], themen: {}, fortschritt: {}, pruefungen: [], klausuren: [], rueckmeldungen: [], zuletzt: null };
}
export function normiere(T) {
  const d = { ...leereDaten(), ...(T || {}) };
  d.beobachtungen = Array.isArray(d.beobachtungen) ? d.beobachtungen : [];
  d.rueckmeldungen = Array.isArray(d.rueckmeldungen) ? d.rueckmeldungen : [];
  return d;
}

/* Status eines Fehlertyps: "keine" | "einzeln" | "wiederkehrend" */
export function typStatus(T, typ) {
  const b = (T.beobachtungen || []).filter((x) => x.typ === typ);
  if (!b.length) return { status: "keine", n: 0 };
  const tage = new Set(b.map((x) => tagVon(x.zeit))).size;
  if (b.length >= MIN_BEOBACHTUNGEN && tage >= MIN_TAGE) return { status: "wiederkehrend", n: b.length, tage };
  return { status: "einzeln", n: b.length, tage };
}
export const wiederkehrende = (T) => FEHLER_IDS
  .map((id) => ({ id, ...typStatus(T, id) }))
  .filter((x) => x.status === "wiederkehrend" && !(T.ausgeblendet || []).includes(x.id))
  .sort((a, b) => b.n - a.n);
export const einzelne = (T) => FEHLER_IDS
  .map((id) => ({ id, ...typStatus(T, id) }))
  .filter((x) => x.status === "einzeln" && !(T.ausgeblendet || []).includes(x.id))
  .sort((a, b) => b.n - a.n);

/* Wiederholungsabstände je Thema (Tage): wächst mit jeder richtigen Antwort ohne Hilfe, fällt bei Fehlern */
export const ABSTAENDE = [1, 2, 4, 8, 16, 30];
export function themaAktualisieren(T, thema, ok, hilfe, zeit = Date.now()) {
  const s = T.themen[thema] || { n: 0, ok: 0, stufe: 0, zuletzt: 0, faellig: 0 };
  s.n += 1; s.zuletzt = zeit;
  if (ok) { s.ok += 1; s.stufe = hilfe === 0 ? Math.min(ABSTAENDE.length - 1, s.stufe + 1) : s.stufe; }
  else s.stufe = Math.max(0, s.stufe - 1);
  s.faellig = zeit + ABSTAENDE[s.stufe] * 86400000;
  T.themen[thema] = s;
  T.zuletzt = thema;
}

/* Fortschritt je Thema: getrennt nach Art der Bearbeitung (hilfe: 0 = keine, 1–3 = Hinweisstufe, 4 = Lösung gezeigt) */
export function fortschrittBuchen(T, a, ok, hilfe, quelle) {
  if (!ok) return;
  const f = T.fortschritt[a.thema] || { anleitung: 0, hinweise: 0, ohneHilfe: 0, transfer: 0, pruefung: 0, varianten: [] };
  if (hilfe >= 4) f.anleitung += 1;
  else if (hilfe >= 1) f.hinweise += 1;
  else {
    f.ohneHilfe += 1;
    if (quelle === "pruefung") f.pruefung = (f.pruefung || 0) + 1;
    if (f.varianten.length && !f.varianten.includes(a.variante)) f.transfer += 1;
    if (!f.varianten.includes(a.variante)) f.varianten.push(a.variante);
  }
  T.fortschritt[a.thema] = f;
}

/* Beobachtung eintragen (höchstens 300 gespeichert, älteste fallen weg) */
export function beobachte(T, typ, thema, quelle, zeit = Date.now()) {
  if (!typ || !FEHLERTYPEN[typ]) return;
  T.beobachtungen.push({ id: `${zeit}-${T.beobachtungen.length}`, typ, thema, quelle, zeit });
  if (T.beobachtungen.length > 300) T.beobachtungen.splice(0, T.beobachtungen.length - 300);
}

/* Aufgabenauswahl für „5 Minuten Mathe“: Grundlagen, zuletzt bearbeitetes Thema, wiederkehrender Fehler, fällige Wiederholung */
export function warmupAuswahl(T, anzahl = 5, jetzt = Date.now()) {
  const gewaehlt = [];
  const nimm = (generatoren) => {
    const frei = generatoren.filter((g) => !gewaehlt.some((x) => x.id === g.id));
    if (!frei.length) return;
    gewaehlt.push(wahl(frei));
  };
  const grundThemen = THEMA_IDS.filter((t) => THEMEN[t].grund);
  nimm(GENERATOREN.filter((g) => grundThemen.includes(g.thema) && g.afb === 1));
  const w = wiederkehrende(T)[0];
  if (w) nimm(generatorenFuerFehler(w.id));
  if (T.zuletzt && THEMEN[T.zuletzt]) nimm(generatorenZu(T.zuletzt));
  const faellig = THEMA_IDS.filter((t) => T.themen[t] && T.themen[t].faellig <= jetzt).sort((a, b) => T.themen[a].faellig - T.themen[b].faellig);
  for (const t of faellig) { if (gewaehlt.length >= anzahl) break; nimm(generatorenZu(t)); }
  const geuebt = THEMA_IDS.filter((t) => T.themen[t]);
  const neu = THEMA_IDS.filter((t) => !T.themen[t]);
  while (gewaehlt.length < anzahl) {
    const vorher = gewaehlt.length;
    nimm(GENERATOREN.filter((g) => (neu.length ? neu : geuebt).includes(g.thema) && g.afb <= 2));
    if (gewaehlt.length === vorher) nimm(GENERATOREN);
    if (gewaehlt.length === vorher) break;
  }
  return mischen(gewaehlt).slice(0, anzahl);
}

/* Aufgaben für den Prüfungsmodus: Themenblock, Schwierigkeit, grobe Dauer */
export const SCHWIERIGKEIT = { leicht: [1, 1, 2], mittel: [1, 2, 2, 3], schwer: [2, 3, 3] };
export function pruefungAuswahl(themen, schwierigkeit, anzahl) {
  const afbs = SCHWIERIGKEIT[schwierigkeit] || SCHWIERIGKEIT.mittel;
  const pool = GENERATOREN.filter((g) => themen.includes(g.thema));
  const gewaehlt = [];
  for (let i = 0; i < anzahl && pool.length; i++) {
    const wunsch = afbs[i % afbs.length];
    const passend = pool.filter((g) => g.afb === wunsch);
    const quelle = passend.length ? passend : pool;
    // gleichmäßig über die Themen verteilen: Thema mit den wenigsten bisherigen Aufgaben bevorzugen
    const zaehle = (t) => gewaehlt.filter((g) => g.thema === t).length;
    const minZ = Math.min(...[...new Set(quelle.map((g) => g.thema))].map(zaehle));
    const kand = quelle.filter((g) => zaehle(g.thema) === minZ);
    const unbenutzt = kand.filter((g) => !gewaehlt.some((x) => x.id === g.id));
    gewaehlt.push(wahl(unbenutzt.length ? unbenutzt : kand));
  }
  return gewaehlt;
}

/* Klausur: Ursachen und Auswertung */
export const URSACHEN = {
  verstaendnis: { name: "Verständnis", kurz: "Ich habe die Aufgabe oder den Stoff nicht verstanden." },
  ansatz: { name: "Ansatz", kurz: "Ich wusste nicht, wie ich anfangen soll." },
  rechnung: { name: "Rechnung", kurz: "Der Ansatz war richtig, aber ich habe mich verrechnet." },
  darstellung: { name: "Darstellung", kurz: "Das Ergebnis stimmte, aber der Weg war unklar oder unvollständig." },
  zeit: { name: "Zeit", kurz: "Ich bin nicht mehr fertig geworden." },
};
export function klausurAuswertung(k) {
  const verloren = (a) => Math.max(0, (Number(a.max) || 0) - (Number(a.erreicht) || 0));
  const proUrsache = {}, proThema = {};
  let gesamtMax = 0, gesamtErr = 0;
  for (const a of k.aufgaben) {
    const v = verloren(a);
    gesamtMax += Number(a.max) || 0; gesamtErr += Math.min(Number(a.erreicht) || 0, Number(a.max) || 0);
    if (v > 0) {
      proUrsache[a.ursache || "unklar"] = (proUrsache[a.ursache || "unklar"] || 0) + v;
      proThema[a.thema || "sonst"] = (proThema[a.thema || "sonst"] || 0) + v;
    }
  }
  return { verloren: gesamtMax - gesamtErr, gesamtMax, gesamtErr, proUrsache, proThema };
}
/* Trainingsplan: nur echte, erreichbare Werkzeuge und Trainingsmodi */
export function klausurPlan(auswertung) {
  const kom = (v) => String(v).replace(".", ",");
  const schritte = [];
  const themen = Object.entries(auswertung.proThema).filter(([t]) => THEMEN[t]).sort((a, b) => b[1] - a[1]);
  for (const [t, v] of themen.slice(0, 3)) {
    schritte.push({ art: "thema", thema: t, punkte: v, text: `${THEMEN[t].name}: ${kom(v)} Punkte verloren`, tools: THEMEN[t].tools });
  }
  const u = auswertung.proUrsache;
  if (u.rechnung) schritte.push({ art: "fehler", punkte: u.rechnung, text: `Rechnung: ${kom(u.rechnung)} Punkte – Flüchtigkeits- und Vorzeichenfehler gezielt trainieren`, ziel: { ansicht: "fehlertraining" } });
  if (u.verstaendnis || u.ansatz) schritte.push({ art: "erklaeren", punkte: (u.verstaendnis || 0) + (u.ansatz || 0), text: `Verständnis und Ansatz: ${kom((u.verstaendnis || 0) + (u.ansatz || 0))} Punkte – kurze Aufgaben mit „Erklär deinen Schritt“`, ziel: { ansicht: "warmup" } });
  if (u.zeit) schritte.push({ art: "zeit", punkte: u.zeit, text: `Zeit: ${kom(u.zeit)} Punkte – unter Zeitbegrenzung üben`, ziel: { ansicht: "pruefung" } });
  if (u.darstellung) schritte.push({ art: "darstellung", punkte: u.darstellung, text: `Darstellung: ${kom(u.darstellung)} Punkte – jeden Schritt in eine eigene Zeile schreiben und das Ergebnis als Satz notieren`, ziel: null });
  return schritte;
}

/* ---------- Prüfungsmodus von einer Fachseite aus: passende Themen zur Ansicht ---------- */
const ANSICHT_THEMA = { ableitungstrainer: "ableiten", plotter: "kurven", advplotter: "kurven", integrale: "integrale", gleichungen: "gleichungen", lgs: "gleichungen", gleichverstehen: "gleichungen", terme: "terme", bernoulli: "bernoulli" };
const VEKTOR_ANSICHTEN = ["vektoren", "ebenen", "ebenevsebene", "kreuzprodukt", "vektorgenerator", "zweipunkte", "dreipunkte", "abstaende", "geraden", "winkel"];
export function pruefungsThemen(ansicht) {
  if (ANSICHT_THEMA[ansicht]) return [ANSICHT_THEMA[ansicht]];
  if (VEKTOR_ANSICHTEN.includes(ansicht)) return ["vektoren"];
  if (["stochastik", "vierfelder", "erwartungswert", "kombinatorik", "hypothesentest"].includes(ansicht)) return ["bernoulli"];
  if (["analysis", "geradengleichung", "parabeln", "sinus", "steckbrief", "optimierung", "wachstum", "scharen"].includes(ansicht)) return ["kurven", "integrale"];
  return null;
}
export const RUECKMELDUNGEN = [
  ["hinweis", "Ein Hinweis zum Anfangen"], ["beispiel", "Ein Beispiel"], ["erklaerung", "Eine andere Erklärung"],
  ["leichter", "Eine leichtere Aufgabe davor"], ["zeit", "Mehr Zeit"], ["nichts", "Nichts – es lief gut"],
];
