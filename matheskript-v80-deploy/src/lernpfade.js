/* ======================================================================
   lernpfade.js – Lernpfad-Engine (reine Daten und Logik, kein React, kein Speicher)

   Ein Lernpfad legt sich über die Stationen aus werkzeuge.js. Er besteht aus
   Einheiten (eine je Werkzeug einer Station) mit festem Rhythmus:
     Entdecken → Rechnen → Trainieren → Rückmeldung.
   Der Standortcheck fragt je Station Aufgaben aus den geprüften Generatoren
   (trainingDaten.js) ab und färbt die Stationen grün/gelb/rot. Daraus entsteht
   ein Wochenplan: so viele Einheiten pro Woche, wie der Schüler sich vornimmt.

   Gespeichert wird in LERN.pfad (func6.jsx, lernSnapshot) in dieser Form:
     { pfad, ziel, termin, proWoche, angelegt, check: { [stationKey]: { n, ok, ampel } },
       reihenfolge: [einheitId…], fortschritt: { [einheitId]: { entdecken, rechnen, trainieren, quote, zuletzt } },
       zuletzt }
   Für den Konto-Abgleich (lernMerge.js) trägt jeder Fortschrittseintrag `zuletzt`:
   der jüngere Eintrag je Einheit gewinnt, Einheiten anderer Geräte bleiben erhalten.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

import { BEREICHE, WERKZEUGE, werkzeug } from "./werkzeuge.js";
import { GENERATOREN, neueAufgabe } from "./trainingDaten.js";

export const TAG_MS = 86400000;

/* ---------- Ziele ---------- */
export const ZIELE = {
  klausur: { name: "Klausur oder Klassenarbeit", zeile: "Ein Termin, rückwärts geplant", termin: true },
  abitur: { name: "Abitur", zeile: "Alle Bereiche bis zur Prüfung", termin: true },
  besser: { name: "Einfach besser werden", zeile: "Ohne Termin, im eigenen Tempo", termin: false },
};
export const ZIEL_IDS = Object.keys(ZIELE);

/* ---------- Welche Generatoren prüfen und trainieren welche Station? ----------
   Schlüssel: "<bereich>.<station>". Stationen ohne Eintrag haben keine Rechen-
   generatoren; dort läuft das Trainieren im Werkzeug selbst (Etikett „trainieren“). */
export const STATION_GENERATOREN = {
  "fundament.axiome": [],
  "fundament.zahlenraeume": [],
  "analysis.kennen": ["gl-quadrat"],
  "analysis.untersuchen": ["abl-potenz", "abl-kette", "abl-exp", "kur-wende", "kur-nachweis"],
  "analysis.bestimmen": ["kur-nachweis", "kur-wende"],
  "analysis.integrieren": ["int-grenzen", "int-flaeche"],
  "vektoren.rechnen": ["vek-betrag", "vek-ortho"],
  "vektoren.aufstellen": [],
  "vektoren.lage": ["vek-geradeebene"],
  "stochastik.zaehlen": [],
  "stochastik.zufallsgroessen": ["ber-genau"],
  "stochastik.testen": ["ber-grenze"],
  "stochastik.normal": ["nv-kleiner", "nv-zwischen", "nv-quantil", "nv-binom"],
  "geometrie.figuren": ["geo-quader"],
  "geometrie.dreieck": ["geo-winkel", "geo-kongruenz"],
  "geometrie.kreiskoerper": ["geo-kreis", "geo-sektor", "geo-prisma", "geo-pyramide", "geo-kugel"],
  "geometrie.rechtwinklig": ["geo-pythagoras"],
  "geometrie.aehnlich": ["geo-strahlen"],
  "geometrie.dreiecke": ["geo-trig"],
  "bruchrechnen.brueche": ["bru-add", "bru-div"],
  "bruchrechnen.bruchterme": [],
  "zahlen.zahlen": [],
  "zahlen.rechnen": [],
  "zahlen.groessen": [],
  "prozent.zuordnung": [],
  "prozent.prozent": [],
  "daten.daten": [],
  "daten.zufall": [],
  "gleichungen.terme": ["ter-binom", "bru-add", "bru-div"],
  "gleichungen.loesen": ["gl-linear", "gl-quadrat", "gl-ausklammern"],
  "gleichungen.gerade": [],
  "gleichungen.parabel": ["gl-quadrat", "fkt-scheitel"],
};

/* Trainieren je Einheit: welche Generatoren passen zum Werkzeug? Fehlt der Eintrag, gelten die
   Generatoren der Station; eine leere Liste heißt „im Werkzeug selbst trainieren“. */
export const EINHEIT_GENERATOREN = {
  geradengleichung: [], sinus: [], wachstum: [], parabeln: ["gl-quadrat"],
  ableitungstrainer: ["abl-potenz", "abl-kette", "abl-exp"], kurvendiskussion: ["kur-wende", "kur-nachweis"], scharen: ["kur-wende"],
  steckbrief: [], optimierung: ["kur-nachweis"],
  vektorgenerator: ["vek-betrag"], kreuzprodukt: [], winkel: ["vek-ortho"], ebenen: [], geraden: [], ebenevsebene: ["vek-geradeebene"], abstaende: [],
  erwartungswert: [], hypothesentest: ["ber-grenze"], terme: ["ter-binom"], lgs: [],
  normalverteilung: ["nv-kleiner", "nv-zwischen", "nv-quantil", "nv-binom"],
  koordinaten: [], flaechen: [], quader: ["geo-quader"],
  winkelsaetze: ["geo-winkel"], kongruenz: ["geo-kongruenz"], konstruktion: [],
  thales: [], pythagoras: ["geo-pythagoras"], kathetensatz: [],
  strahlensaetze: ["geo-strahlen"], trigonometrie: ["geo-trig"],
  kreis: ["geo-kreis", "geo-sektor"], koerper: ["geo-prisma", "geo-pyramide", "geo-kugel"],
};

/* ---------- Worum geht es in jedem Werkzeug? (Stufe „Entdecken“) ----------
   worum: zwei Sätze für den Einstieg · formel: Sprung in die Formelsammlung (id aus fsIndex)
   entdecken: zusätzliche Ansicht zum Ausprobieren (Werkzeug mit Etikett „entdecken“ oder Modul) */
export const EINHEIT_TEXTE = {
  axiome: { worum: "Alle Rechnungen beruhen auf neun Spielregeln für Plus und Mal: Kommutativ-, Assoziativ- und Distributivgesetz, neutrale Elemente 0 und 1, inverse Elemente −a und 1/a. Minus und Geteilt sind nur Plus und Mal mit dem Inversen.", aufgabe: "Benenne bei drei Umformungen das Axiom, das sie erlaubt, und löse x + 3 = 7 so, dass jeder Schritt ein Axiom ist." },
  zahlenraeume: { worum: "ℕ ist abgeschlossen bezüglich + und ·. Die Subtraktion führt zu ℤ, die Division zu ℚ = {p/q | p ∈ ℤ, q ∈ ℕ}, die Gleichung x² = 2 zu ℝ. Es gilt ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.", aufgabe: "Ordne fünf Zahlen ihrem kleinsten Zahlenraum zu und führe den Beweis, dass √2 irrational ist, in eigenen Worten." },
  geradengleichung: { worum: "Jede Gerade ist durch Steigung und y-Achsenabschnitt festgelegt. Aus zwei Punkten oder aus Punkt und Steigung baust du die Gleichung y = m·x + c.", aufgabe: "Stelle die Gerade durch zwei selbst gewählte Punkte auf und prüfe die Steigung mit dem Steigungsdreieck." },
  parabeln: { worum: "Scheitelform, Normalform und faktorisierte Form beschreiben dieselbe Parabel. Jede Form zeigt dir etwas anderes: Scheitel, y-Achsenabschnitt oder Nullstellen.", aufgabe: "Verschiebe den Scheitel mit den Reglern und beobachte, wie sich die Nullstellen bewegen. Lies dann aus der Scheitelform die Nullstellen ab." },
  sinus: { worum: "Die vier Parameter a, b, c und d strecken, stauchen und verschieben die Sinuskurve. Die Periode hängt nur von b ab.", aufgabe: "Stelle eine Sinuskurve mit Periode π und Amplitude 2 ein. Prüfe anschließend den Zielgraph in „Zusätzlich üben“." },
  wachstum: { worum: "Exponentielles Wachstum heißt: in gleichen Zeitschritten derselbe Faktor. Der Logarithmus löst nach der Zeit auf.", aufgabe: "Bestimme aus zwei Messwerten das Modell und berechne die Verdopplungszeit." },
  ableitungstrainer: { worum: "Ableiten ist Handwerk mit wenigen Regeln: Potenz-, Faktor-, Summen-, Produkt- und Kettenregel. Sicherheit kommt aus Wiederholung.", aufgabe: "Leite drei Funktionen des Trainers ab, mindestens eine mit Kettenregel, und lass jede prüfen." },
  kurvendiskussion: { worum: "Nullstellen, Extrema und Wendepunkte folgen alle aus f, f′ und f″. Die Kurvendiskussion ist eine feste Reihenfolge, keine Zauberei.", aufgabe: "Gib ein Polynom dritten Grades ein und vergleiche die berechneten Extrempunkte mit dem Graphen." },
  scharen: { worum: "Ein Parameter in der Funktion erzeugt eine ganze Familie von Graphen. Besondere Punkte wandern auf einer Ortskurve.", aufgabe: "Bewege den Parameter und beobachte den Tiefpunkt. Berechne dann seine Koordinaten in Abhängigkeit vom Parameter." },
  steckbrief: { worum: "Aus Eigenschaften (Hochpunkt, Wendepunkt, Nullstelle) entsteht ein Gleichungssystem für die Koeffizienten. Jede Eigenschaft ist eine Gleichung.", aufgabe: "Löse eine Steckbriefaufgabe des Werkzeugs vollständig bis zur Funktionsgleichung." },
  optimierung: { worum: "Eine Optimierungsaufgabe hat immer dieselbe Struktur: Zielfunktion, Nebenbedingung, Ableitung null setzen, Randwerte prüfen.", aufgabe: "Bearbeite die Schachtel-Aufgabe im Werkzeug und notiere Zielfunktion und Nebenbedingung auf Papier." },
  stammintegral: { worum: "Eine Stammfunktion F erfüllt F′ = f. Mit dem Hauptsatz wird das bestimmte Integral zu F(b) − F(a) – Summand für Summand.", aufgabe: "Bilde zwei Stammfunktionen mit Probe F′ = f und berechne ein bestimmtes Integral mit dem Hauptsatz." },
  integrale: { worum: "Das Integral misst orientierte Flächen. Stammfunktion bilden, Grenzen einsetzen, Vorzeichen beachten.", aufgabe: "Berechne die Fläche zwischen einem Polynom und der x-Achse zwischen zwei Nullstellen." },
  vektorgenerator: { worum: "Vektoren werden komponentenweise addiert und mit Zahlen gestreckt. Das Skalarprodukt verbindet Länge und Winkel.", aufgabe: "Lass dir drei Beispiele erzeugen und rechne jedes auf Papier nach, bevor du den Rechenweg aufklappst." },
  kreuzprodukt: { worum: "Das Kreuzprodukt liefert einen Vektor, der auf beiden Ausgangsvektoren senkrecht steht. Es ist der Schlüssel zum Normalenvektor.", aufgabe: "Berechne das Kreuzprodukt zweier Vektoren und prüfe mit dem Skalarprodukt, dass das Ergebnis senkrecht steht." },
  winkel: { worum: "cos φ = a·b / (|a|·|b|). Alles andere folgt daraus, auch Orthogonalität.", aufgabe: "Bestimme den Winkel zwischen zwei Vektoren und finde einen dritten, der auf einem davon senkrecht steht." },
  zweipunkte: { worum: "Eine Gerade im Raum braucht einen Stützvektor und einen Richtungsvektor. Beide liest du aus zwei Punkten ab.", aufgabe: "Stelle die Gerade durch zwei Punkte auf und führe eine Punktprobe mit einem dritten Punkt durch." },
  dreipunkte: { worum: "Drei Punkte legen eine Ebene fest: Parameterform, Normalenform, Koordinatenform. Jede Form hat ihren Zweck.", aufgabe: "Stelle eine Ebene aus drei Punkten in Koordinatenform auf und prüfe alle drei Punkte." },
  ebenen: { worum: "Die Koordinatenform a·x + b·y + c·z = d zeigt den Normalenvektor direkt. Drehe die Ebene und sieh, was die Zahlen tun.", aufgabe: "Finde die Spurpunkte einer Ebene auf den drei Achsen und zeichne die Ebene auf Papier." },
  geraden: { worum: "Zwei Geraden im Raum sind identisch, parallel, schneidend oder windschief. Die Entscheidung läuft über Richtungsvektoren und ein Gleichungssystem.", aufgabe: "Untersuche zwei Geraden auf ihre Lage und berechne gegebenenfalls den Schnittpunkt." },
  ebenevsebene: { worum: "Zwei Ebenen schneiden sich in einer Geraden oder sind parallel. Der Schnittwinkel kommt aus den Normalenvektoren.", aufgabe: "Berechne Schnittgerade und Schnittwinkel zweier Ebenen." },
  abstaende: { worum: "Abstand heißt immer: kürzeste Verbindung. Lotfußpunkt oder Hessesche Normalenform, je nach Kombination.", aufgabe: "Bestimme den Abstand eines Punktes von einer Ebene auf zwei Wegen." },
  kombinatorik: { worum: "Zählen heißt entscheiden: mit oder ohne Zurücklegen, mit oder ohne Reihenfolge. Das Baumdiagramm zeigt alle Pfade.", aufgabe: "Führe ein Urnenexperiment durch und zähle die Möglichkeiten mit der passenden Methode." },
  vierfelder: { worum: "Die Vier-Felder-Tafel ordnet zwei Merkmale; bedingte Wahrscheinlichkeiten liest du zeilen- oder spaltenweise ab.", aufgabe: "Fülle eine Tafel aus drei gegebenen Werten und berechne eine bedingte Wahrscheinlichkeit." },
  erwartungswert: { worum: "Der Erwartungswert ist der langfristige Durchschnitt. Ein Spiel ist fair, wenn der erwartete Gewinn null ist.", aufgabe: "Bestimme den fairen Einsatz eines Spiels und prüfe ihn mit der Simulation." },
  bernoulli: { worum: "Eine Bernoulli-Kette hat n gleiche Versuche mit Trefferwahrscheinlichkeit p. Die Binomialverteilung zählt die Treffer.", aufgabe: "Berechne P(X = k) und P(X ≥ k) für eine selbst gewählte Kette und vergleiche mit der Simulation." },
  normalverteilung: { worum: "Für großes n wird jede Binomialverteilung zur Gaußschen Glocke. Bei stetigen Größen sind Wahrscheinlichkeiten Flächen: Standardisieren mit z = (x − μ) : σ, dann Φ(z) ablesen. Die Sigma-Regeln sagen, welche Werte normal sind.", aufgabe: "Berechne P(X ≤ x), eine Wahrscheinlichkeit für ein Intervall und einen Wert zu einer vorgegebenen Wahrscheinlichkeit." },
  hypothesentest: { worum: "Ein Test entscheidet gegen H₀, wenn das Ergebnis im Ablehnungsbereich liegt. Fehler erster und zweiter Art gehören dazu.", aufgabe: "Baue einen Test auf, bestimme den Ablehnungsbereich und benenne den Fehler erster Art." },
  terme: { worum: "Termumformungen sind Regeln, keine Tricks: ausmultiplizieren, ausklammern, binomische Formeln, Potenzgesetze.", aufgabe: "Vereinfache fünf Terme im Werkzeug, mindestens zwei mit binomischer Formel." },
  stellenwert: { worum: "Jede Stelle ist zehnmal so viel wert wie die rechts daneben. Beim Runden entscheidet nur die Ziffer rechts von der Rundungsstelle.", aufgabe: "Lies Stellenwerte ab, runde auf verschiedene Stellen und lies einen Zahlenstrahl ab." },
  ganzezahlen: { worum: "Negative Zahlen liegen links von null. Minus eine negative Zahl ist plus; beim Malnehmen gilt: gleiche Vorzeichen ergeben plus.", aufgabe: "Rechne je eine Plus-, Minus- und Malaufgabe mit negativen Zahlen und erkläre die Vorzeichen." },
  primzahlen: { worum: "Primzahlen haben genau zwei Teiler. Jede Zahl zerfällt eindeutig in Primfaktoren – daraus bekommt man ggT und kgV.", aufgabe: "Zerlege eine Zahl in Primfaktoren und bestimme ggT und kgV zweier Zahlen." },
  rechengesetze: { worum: "Klammer vor Potenz vor Punkt vor Strich, sonst von links nach rechts. Rechengesetze erlauben geschicktes Umstellen.", aufgabe: "Berechne zwei Terme in der richtigen Reihenfolge und eine Aufgabe geschickt mit dem Distributivgesetz." },
  groessen: { worum: "Zur kleineren Einheit wird malgenommen, zur größeren geteilt. Fläche hat Faktor 100, Volumen 1000, Zeit 60.", aufgabe: "Rechne Längen, Flächen und Zeiten um und löse eine Maßstabsaufgabe." },
  koordinaten: { worum: "Ein Punkt P(x | y): erst Rechtswert, dann Hochwert. Beim Spiegeln wechselt die passende Koordinate ihr Vorzeichen.", aufgabe: "Lies Punkte ab, spiegele an beiden Achsen und ergänze ein Parallelogramm." },
  flaechen: { worum: "Jede Flächenformel kommt vom Rechteck: Dreieck als Hälfte, Parallelogramm umgelegt, Trapez verdoppelt.", aufgabe: "Berechne die Fläche eines Parallelogramms, eines Trapezes und einer zusammengesetzten Figur." },
  quader: { worum: "Volumen = Zahl der Einheitswürfel = a · b · c. Die Oberfläche besteht aus drei Paaren gleicher Rechtecke.", aufgabe: "Berechne Volumen und Oberfläche eines Quaders und erkenne ein Würfelnetz." },
  dezimal: { worum: "Nach dem Komma folgen Zehntel, Hundertstel, Tausendstel. Beim Multiplizieren werden die Kommastellen addiert.", aufgabe: "Wandle einen Bruch in eine Dezimalzahl um und rechne je eine Mal- und eine Geteiltaufgabe mit Komma." },
  zuordnungen: { worum: "Proportional: y : x bleibt gleich. Antiproportional: x · y bleibt gleich. Der Dreisatz geht immer über die Einheit.", aufgabe: "Erkenne die Art einer Zuordnung und löse je einen Dreisatz proportional und antiproportional." },
  prozent: { worum: "Der Grundwert ist das Ganze (100 %). W = G · p : 100. Aufschläge und Rabatte rechnet man mit einem Faktor.", aufgabe: "Berechne Prozentwert, Grundwert und einen Preis nach Rabatt." },
  diagramme: { worum: "Mittelwert = Summe : Anzahl, Median = Mitte der sortierten Liste. Im Kreisdiagramm ist der Winkel Anteil · 360°.", aufgabe: "Berechne Mittelwert und Median einer Liste und den Winkel eines Kreisdiagramm-Sektors." },
  zufall: { worum: "Laplace: günstige durch mögliche Ergebnisse. Je öfter man ein Experiment wiederholt, desto näher liegt die relative Häufigkeit an der Wahrscheinlichkeit.", aufgabe: "Berechne zwei Laplace-Wahrscheinlichkeiten und eine Wahrscheinlichkeit mit der Pfadregel." },
  winkelsaetze: { worum: "Scheitel-, Stufen- und Wechselwinkel sind gleich groß, Neben- und Nachbarwinkel ergänzen sich zu 180°. Im Dreieck ist die Winkelsumme 180°, im n-Eck (n − 2) · 180°.", aufgabe: "Berechne einen Winkel an Parallelen mit Begründung und die Innenwinkel eines regelmäßigen n-Ecks." },
  konstruktion: { worum: "Mittelsenkrechten treffen sich im Umkreismittelpunkt, Winkelhalbierende im Inkreismittelpunkt, Höhen im Höhenschnittpunkt und Seitenhalbierende im Schwerpunkt.", aufgabe: "Ordne Linien und Punkte zu, berechne einen Schwerpunkt aus Koordinaten und einen Inkreisradius." },
  kathetensatz: { worum: "Die Höhe auf die Hypotenuse teilt sie in p und q. Es gilt a² = c · p, b² = c · q und h² = p · q – die Satzgruppe des Pythagoras.", aufgabe: "Berechne eine Höhe mit dem Höhensatz und eine Kathete mit dem Kathetensatz." },
  kreis: { worum: "Umfang u = 2πr, Fläche A = πr². Bogen und Kreisausschnitt sind der Anteil α : 360° vom Ganzen; rückwärts rechnet man mit Teilen und Wurzelziehen.", aufgabe: "Berechne Umfang, Fläche, einen Kreisausschnitt und einen Radius aus der Fläche." },
  koerper: { worum: "Gerade Körper: V = G · h. Spitze Körper: ein Drittel davon. Für Oberflächen von Kegel und Pyramide liefert Pythagoras die schräge Höhe.", aufgabe: "Berechne Volumen und Oberfläche eines Zylinders und eines Kegels." },
  kongruenz: { worum: "Drei Stücke legen ein Dreieck nur dann eindeutig fest, wenn ein Kongruenzsatz passt: SSS, SWS, WSW oder SsW. Bei SSW und WWW kann es mehrere oder gar keine Dreiecke geben.", aufgabe: "Entscheide bei drei Angaben, welcher Satz passt und wie viele Dreiecke es gibt, und begründe eine Kongruenz an einer Figur." },
  thales: { worum: "Liegt C auf dem Kreis über dem Durchmesser AB, ist der Winkel bei C ein rechter. Umgekehrt ist die Hypotenuse immer Durchmesser des Umkreises.", aufgabe: "Berechne einen Winkel im Thaleskreis und führe den Beweis über die gleichschenkligen Dreiecke in Schritten." },
  pythagoras: { worum: "Im rechtwinkligen Dreieck gilt a² + b² = c². Die Hypotenuse liegt dem rechten Winkel gegenüber; für eine Kathete wird subtrahiert.", aufgabe: "Berechne eine Hypotenuse, eine Kathete und eine Raumdiagonale und prüfe ein Dreieck mit der Umkehrung." },
  bruchrechnen: { worum: "Plus und minus brauchen einen gemeinsamen Nenner, mal geht direkt, geteilt heißt mit dem Kehrwert malnehmen. Am Ende wird immer vollständig gekürzt.", aufgabe: "Löse je eine Aufgabe zum Addieren, Multiplizieren und Dividieren und kürze jedes Ergebnis vollständig." },
  bruchterme: { worum: "Steht x im Nenner, gehört zu jedem Term eine Definitionsmenge. Gekürzt werden nur Faktoren, und jede Lösung einer Bruchgleichung wird mit D geprüft.", aufgabe: "Bestimme eine Definitionsmenge, kürze einen Bruchterm und löse eine Bruchgleichung mit Probe." },
  strahlensaetze: { worum: "Werden zwei Strahlen von zwei Parallelen geschnitten, stehen alle zugehörigen Strecken im selben Verhältnis k. Beim 2. Strahlensatz zählen nur Strecken ab S.", aufgabe: "Löse im Modus „Üben“ drei Aufgaben, darunter eine mit gegebenem Abschnitt AA′ und eine Sachaufgabe." },
  trigonometrie: { worum: "Am Einheitskreis sind cos α und sin α die Koordinaten eines Punktes. Im rechtwinkligen Dreieck verbinden sin, cos und tan einen Winkel mit zwei Seiten; ohne rechten Winkel helfen Sinus- und Kosinussatz.", aufgabe: "Lies sin und cos am Einheitskreis ab, berechne zwei Seiten und einen Winkel im rechtwinkligen Dreieck und löse eine Kosinussatz-Aufgabe." },
  gleichungen: { worum: "Eine Gleichung lösen heißt, die Rechnung rückwärts zu gehen. Jede Umformung gilt auf beiden Seiten.", aufgabe: "Löse drei Gleichungen Schritt für Schritt und lass jeden Schritt prüfen." },
  lgs: { worum: "Ein Gleichungssystem löst man durch Eliminieren: Gauß-Verfahren oder Einsetzen. Drei Unbekannte, drei Gleichungen.", aufgabe: "Löse ein LGS mit drei Unbekannten und mache die Probe in allen drei Gleichungen." },
};

/* ---------- Pfade ---------- */
const stationKey = (b, s) => `${b.id}.${s.id}`;

/* Alle Einheiten eines Bereichs in Stationsreihenfolge */
export function einheitenVon(bereichId) {
  const b = BEREICHE.find((x) => x.id === bereichId);
  if (!b) return [];
  const liste = [];
  b.stationen.forEach((s, i) => {
    for (const wid of s.werkzeuge) {
      const w = werkzeug(wid);
      if (!w) continue;
      liste.push({
        id: `${b.id}.${s.id}.${wid}`,
        bereich: b.id, bereichTitel: b.titel,
        station: s.id, stationTitel: s.titel, stationKey: stationKey(b, s), sNr: i + 1, stationen: b.stationen.length,
        werkzeug: wid, name: w.name, kurz: w.kurz, zeile: w.zeile, etikett: w.etikett, ziel: w.ziel,
        generatoren: EINHEIT_GENERATOREN[wid] !== undefined ? EINHEIT_GENERATOREN[wid] : (STATION_GENERATOREN[stationKey(b, s)] || []),
        texte: EINHEIT_TEXTE[wid] || { worum: w.slogan, aufgabe: `Arbeite eine Aufgabe im Werkzeug „${w.name}“ vollständig durch.` },
      });
    }
  });
  return liste;
}

export const PFADE = {
  analysis: { name: "Analysis", zeile: "Funktionen kennen, untersuchen, bestimmen, integrieren", bereiche: ["analysis"], wochen: 8 },
  vektoren: { name: "Vektoren", zeile: "Rechnen, aufstellen, Lage und Abstand", bereiche: ["vektoren"], wochen: 4 },
  stochastik: { name: "Stochastik", zeile: "Zählen, Zufallsgrößen, testen", bereiche: ["stochastik"], wochen: 4 },
  gleichungen: { name: "Terme und Gleichungen", zeile: "Fundament, umformen und lösen – die Grundlage für alles", bereiche: ["fundament", "gleichungen"], wochen: 3 },
  geometrie: { name: "Geometrie", zeile: "Winkel, Dreiecke, Pythagoras, Ähnlichkeit, Kreis und Körper – Mittelstufe", bereiche: ["geometrie"], wochen: 5 },
  bruchrechnen: { name: "Brüche und Dezimalzahlen", zeile: "Brüche, Dezimalzahlen, Bruchterme und Bruchgleichungen", bereiche: ["bruchrechnen"], wochen: 3 },
  grundlagen: { name: "Grundlagen Klasse 5–7", zeile: "Zahlen, Größen, Prozent, Daten und Zufall", bereiche: ["zahlen", "prozent", "daten"], wochen: 6 },
  abitur: { name: "Abi komplett", zeile: "Alle Bereiche in Abi-Reihenfolge", bereiche: ["fundament", "bruchrechnen", "gleichungen", "geometrie", "analysis", "vektoren", "stochastik"], wochen: 16 },
};
export const PFAD_IDS = Object.keys(PFADE);

export const pfadEinheiten = (pfadId) => (PFADE[pfadId] ? PFADE[pfadId].bereiche.flatMap(einheitenVon) : []);
export const pfadStationen = (pfadId) => {
  const gesehen = new Set();
  return pfadEinheiten(pfadId).filter((e) => (gesehen.has(e.stationKey) ? false : (gesehen.add(e.stationKey), true)))
    .map((e) => ({ key: e.stationKey, bereich: e.bereich, bereichTitel: e.bereichTitel, station: e.station, titel: e.stationTitel, sNr: e.sNr, generatoren: STATION_GENERATOREN[e.stationKey] || [] }));
};
export const einheit = (id) => Object.keys(PFADE).flatMap(pfadEinheiten).find((e) => e.id === id) || null;

/* ---------- Standortcheck ---------- */
export const CHECK_PRO_STATION = 3;
export const CHECK_MAX = 15;

/* Aufgaben für den Check: je Station bis zu drei Generatoren (ohne Wiederholung), Gesamtzahl begrenzt.
   Jede Aufgabe trägt `station` (Key) – darüber wird ausgewertet. */
export function checkAufgaben(pfadId, { max = CHECK_MAX, rng = Math.random } = {}) {
  const stationen = pfadStationen(pfadId).filter((s) => s.generatoren.length);
  if (!stationen.length) return [];
  const proStation = Math.max(1, Math.min(CHECK_PRO_STATION, Math.floor(max / stationen.length)));
  const aus = [];
  for (const s of stationen) {
    const gens = [...s.generatoren];
    for (let i = 0; i < proStation && gens.length; i++) {
      const k = Math.floor(rng() * gens.length);
      const g = GENERATOREN.find((x) => x.id === gens[k]);
      gens.splice(k, 1);
      if (!g) continue;
      const a = neueAufgabe(g.id);
      a.station = s.key;
      aus.push(a);
    }
  }
  return aus.slice(0, max);
}

export const AMPEL = { gruen: "sicher", gelb: "teilweise", rot: "offen", grau: "nicht geprüft" };

export const ampelVon = (n, ok) => (n === 0 ? "grau" : ok / n >= 0.75 ? "gruen" : ok / n >= 0.4 ? "gelb" : "rot");

/* zs: Zustände aus Aufgabenlauf (funcTraining.jsx), parallel zu aufgaben: { ok, hilfeEnde, erstOk, gebucht } */
export function checkAuswerten(pfadId, aufgaben, zs) {
  const erg = {};
  for (const s of pfadStationen(pfadId)) erg[s.key] = { n: 0, ok: 0, ampel: "grau" };
  aufgaben.forEach((a, i) => {
    const z = zs[i] || {};
    const e = erg[a.station];
    if (!e) return;
    e.n += 1;
    if (z.ok && (z.hilfeEnde || 0) < 4 && z.erstOk !== false) e.ok += 1;   // ohne gezeigte Lösung, im ersten Anlauf
  });
  for (const k of Object.keys(erg)) erg[k].ampel = ampelVon(erg[k].n, erg[k].ok);
  return erg;
}

/* ---------- Plan ---------- */
export const PRO_WOCHE = [2, 3, 4, 5];

/* Reihenfolge der Einheiten: alle Einheiten in Stationsreihenfolge; bei grün geprüften Stationen
   bleibt nur eine kurze Einheit je Station (das Werkzeug mit Etikett „trainieren“, sonst das erste). */
export function reihenfolgeBauen(pfadId, check = {}) {
  const alle = pfadEinheiten(pfadId);
  const aus = [];
  for (const s of pfadStationen(pfadId)) {
    const es = alle.filter((e) => e.stationKey === s.key);
    const c = check[s.key];
    if (c && c.ampel === "gruen") {
      const kurz = es.find((e) => e.etikett === "trainieren") || es[0];
      if (kurz) aus.push(kurz.id);
    } else aus.push(...es.map((e) => e.id));
  }
  return aus;
}

export function wochenZahl(anzahl, proWoche) { return Math.max(1, Math.ceil(anzahl / Math.max(1, proWoche))); }

/* Passt der Plan bis zum Termin? Liefert Hinweis und ggf. erhöhte Wochenzahl */
export function terminPruefen(anzahl, proWoche, termin, jetzt = Date.now()) {
  if (!termin) return { passt: true, wochen: wochenZahl(anzahl, proWoche), proWoche };
  const tage = Math.ceil((termin - jetzt) / TAG_MS);
  const wochenFrei = Math.max(1, Math.floor(tage / 7));
  let pw = proWoche;
  while (wochenZahl(anzahl, pw) > wochenFrei && pw < 7) pw += 1;
  return { passt: wochenZahl(anzahl, pw) <= wochenFrei, wochen: wochenZahl(anzahl, pw), proWoche: pw, tage, wochenFrei };
}

export function planErzeugen({ pfad, ziel = "besser", termin = null, proWoche = 3, check = {}, jetzt = Date.now() }) {
  if (!PFADE[pfad]) throw new Error(`Unbekannter Pfad: ${pfad}`);
  const reihenfolge = reihenfolgeBauen(pfad, check);
  const t = terminPruefen(reihenfolge.length, proWoche, termin, jetzt);
  return { version: 1, pfad, ziel, termin: termin || null, proWoche: t.proWoche, angelegt: jetzt, check, reihenfolge, fortschritt: {}, zuletzt: jetzt };
}

export const SCHRITTE = ["entdecken", "rechnen", "trainieren"];
export const SCHRITT_NAMEN = { entdecken: "Entdecken", rechnen: "Rechnen", trainieren: "Trainieren" };

export function einheitStand(P, id) {
  const f = (P && P.fortschritt && P.fortschritt[id]) || {};
  const schritte = SCHRITTE.filter((s) => f[s]);
  return { ...f, offen: SCHRITTE.filter((s) => !f[s]), fertig: schritte.length === SCHRITTE.length, anzahl: schritte.length };
}
export const einheitFertig = (P, id) => einheitStand(P, id).fertig;

/* Reines Update: liefert einen neuen Plan mit gesetztem Schritt (kein Speicherzugriff) */
export function schrittSetzen(P, id, schritt, { jetzt = Date.now(), quote } = {}) {
  if (!SCHRITTE.includes(schritt)) return P;
  const alt = (P.fortschritt || {})[id] || {};
  const neu = { ...alt, [schritt]: jetzt, zuletzt: jetzt };
  if (typeof quote === "number") neu.quote = quote;
  return { ...P, fortschritt: { ...(P.fortschritt || {}), [id]: neu }, zuletzt: jetzt };
}

export const naechsteEinheit = (P) => (P && P.reihenfolge ? P.reihenfolge.find((id) => !einheitFertig(P, id)) || null : null);

/* Wochenindex seit Anlage (0 = erste Woche) */
export const wocheVon = (P, jetzt = Date.now()) => Math.max(0, Math.floor((jetzt - (P.angelegt || jetzt)) / (7 * TAG_MS)));

export function wochenStand(P, jetzt = Date.now()) {
  const woche = wocheVon(P, jetzt);
  const start = (P.angelegt || jetzt) + woche * 7 * TAG_MS;
  const dieseWoche = Object.entries(P.fortschritt || {}).filter(([, f]) => SCHRITTE.every((s) => f[s]) && Math.max(...SCHRITTE.map((s) => f[s])) >= start).length;
  const gesamt = P.reihenfolge.length;
  const fertig = P.reihenfolge.filter((id) => einheitFertig(P, id)).length;
  const soll = Math.min(P.proWoche, gesamt - (fertig - dieseWoche));
  return { woche, wochen: wochenZahl(gesamt, P.proWoche), soll: Math.max(0, soll), ist: dieseWoche, gesamt, fertig, anteil: gesamt ? fertig / gesamt : 0,
    tageBisTermin: P.termin ? Math.ceil((P.termin - jetzt) / TAG_MS) : null, imRueckstand: fertig < Math.min(gesamt, woche * P.proWoche) };
}

/* Stand je Station: aus Check und Fortschritt (grün, wenn alle Einheiten der Station fertig) */
export function stationsStand(P) {
  return pfadStationen(P.pfad).map((s) => {
    const ids = P.reihenfolge.filter((id) => id.startsWith(`${s.key}.`));
    const fertig = ids.filter((id) => einheitFertig(P, id)).length;
    const c = (P.check || {})[s.key];
    return { ...s, ids, fertig, gesamt: ids.length, ampel: ids.length && fertig === ids.length ? "gruen" : c ? c.ampel : "grau" };
  });
}

/* Die Einheiten dieser Woche: bereits fertige dieser Woche + die nächsten offenen bis zum Soll */
export function wochenEinheiten(P, jetzt = Date.now()) {
  const ws = wochenStand(P, jetzt);
  const start = (P.angelegt || jetzt) + ws.woche * 7 * TAG_MS;
  const fertigDieseWoche = P.reihenfolge.filter((id) => { const f = (P.fortschritt || {})[id]; return f && einheitFertig(P, id) && Math.max(...SCHRITTE.map((s) => f[s])) >= start; });
  const offen = P.reihenfolge.filter((id) => !einheitFertig(P, id)).slice(0, Math.max(0, P.proWoche - fertigDieseWoche.length));
  return [...fertigDieseWoche, ...offen].map((id) => einheit(id)).filter(Boolean);
}

/* Trainingsaufgaben einer Einheit: 5 Aufgaben aus den Generatoren der Station (rund um) */
export function einheitAufgaben(e, { anzahl = 5, rng = Math.random } = {}) {
  if (!e || !e.generatoren.length) return [];
  const gens = e.generatoren.map((id) => GENERATOREN.find((g) => g.id === id)).filter(Boolean);
  if (!gens.length) return [];
  const start = Math.floor(rng() * gens.length);
  return Array.from({ length: anzahl }, (_, i) => neueAufgabe(gens[(start + i) % gens.length].id));
}

/* Für Mathilda: kurzer Textauszug des Plans */
export function pfadKurztext(P, jetzt = Date.now()) {
  if (!P) return "";
  const ws = wochenStand(P, jetzt);
  const n = naechsteEinheit(P);
  const e = n ? einheit(n) : null;
  const st = stationsStand(P);
  const offen = st.filter((s) => s.ampel === "rot" || s.ampel === "gelb").map((s) => `${s.bereichTitel} · ${s.titel} (${AMPEL[s.ampel]})`);
  return [
    `Lernpfad: ${PFADE[P.pfad].name}, Ziel: ${ZIELE[P.ziel] ? ZIELE[P.ziel].name : P.ziel}${P.termin ? `, Termin in ${ws.tageBisTermin} Tagen` : ""}.`,
    `Fortschritt: ${ws.fertig} von ${ws.gesamt} Einheiten, Woche ${ws.woche + 1} von ${ws.wochen}, diese Woche ${ws.ist} von ${ws.soll}.`,
    e ? `Nächste Einheit: ${e.bereichTitel} · ${e.stationTitel} · ${e.name}.` : "Alle Einheiten sind fertig.",
    offen.length ? `Noch offen laut Standortcheck: ${offen.join("; ")}.` : "",
  ].filter(Boolean).join(" ");
}

/* Normierung eines gespeicherten Plans (alte oder fremde Stände) */
export function normierePfad(P) {
  if (!P || typeof P !== "object" || !PFADE[P.pfad] || !Array.isArray(P.reihenfolge)) return null;
  return { version: 1, ziel: "besser", termin: null, proWoche: 3, angelegt: Date.now(), check: {}, fortschritt: {}, zuletzt: 0, ...P,
    reihenfolge: P.reihenfolge.filter((id) => einheit(id)) };
}
