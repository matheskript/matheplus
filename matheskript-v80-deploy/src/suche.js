/* ======================================================================
   SUCHE – „Was möchtest du trainieren?“
   Themen-Suche über alles, was es in der App gibt: Werkzeuge, Videokurse,
   Mathe entdecken, Formelsammlung (jede Formel), Training, Prüfung.

   Reine Logik, kein React. Importiert nur Daten (werkzeuge.js, fsIndex.js),
   darf also auch von base-Dateien und in Node-Tests benutzt werden.

   Ergebnis von suche(eingabe):
     { art: "leer" }                              – nichts eingegeben
     { art: "rueckfrage", frage, optionen }       – Eingabe zu breit („Mathematik“)
     { art: "mehrdeutig", frage, optionen }       – Wort hat mehrere Bedeutungen („Winkel“)
     { art: "vorschlag", frage, optionen }        – unscharf / Tippfehler: „Meinst du …?“
     { art: "treffer", gruppen, unbekannt }       – konkrete Werkzeuge, Kurse, Formeln …
     { art: "nichts", optionen }                  – nichts gefunden
   Texte für Rückfragen sind Paare [deutsch, englisch]. Eingabe und Index
   sind Deutsch; häufige englische Fachwörter stehen in SYN.
   ====================================================================== */
import { WERKZEUGE, BEREICHE, ETIKETTEN } from "./werkzeuge.js";
import { FS_ALLE, FS_BEREICHE } from "./fsIndex.js";
import { ANGEBOT } from "./angebot.js";

/* ---------- Text normalisieren ---------- */

/* klein, ohne Umlaute/Akzente (ä→a, ß→ss), Sonderzeichen → Leerzeichen */
export const falte = (s) => String(s ?? "").toLowerCase()
  .replace(/­/g, "")
  .replace(/ß/g, "ss").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u")
  .replace(/²/g, "2").replace(/³/g, "3")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, " ").trim();

/* „e-Funktion“ bleibt ein Wort (das einzelne „e“ würde sonst wegfallen) */
const tokens = (s) => falte(s).replace(/\be (funktion|funktionen)\b/g, "e$1").split(" ").filter((t) => t.length >= 2 || /^\d$/.test(t));

/* Füllwörter, die nichts über das Thema sagen */
const STOP = new Set(("ich du wir mir mich mein meine meinen meiner meinem dir dich die der das den dem des ein eine einen einem einer und oder zu zum zur " +
  "bei mit von vom fur uber in im am an auf aus ist sind war wie was wo wann warum wieso wozu welche welcher kann kannst konnte will mochte brauche brauchst braucht " +
  "ab hilfe helfen hilf bitte nicht kein keine gerne gern mal mehr noch auch nur dass es man soll muss mussen thema themen gibt habe haben hab bin " +
  "schreibe schreiben schreibt morgen heute gestern bald nachste nachsten woche wochen berechne berechnen berechnet viel viele wieviel komme komm klar verstehe versteh jetzt eigentlich irgendwie bisschen paar etwas alles zeig zeige suche suchen finde finden wunsche wunschen " +
  "the a an of to for with how do i can you my me is are and or about help what").split(" "));

/* Absicht: übt/lernt der Mensch? Beeinflusst nur die Reihenfolge der Gruppen. */
const ABSICHT = {
  ueben: new Set(["uben", "ueben", "trainieren", "training", "trainier", "aufgabe", "aufgaben", "ubung", "ubungen", "practice", "train", "exercises"]),
  lernen: new Set(["lernen", "lerne", "verstehen", "verstand", "erklaren", "erklarung", "erklar", "erklart", "video", "videos", "kurs", "herleiten", "herleitung", "beweis", "explain", "learn", "understand"]),
};

/* Kurzschreibweisen und englische Fachwörter → deutsche Stichwörter (Alternativen, nicht Ergänzungen) */
const SYN = {
  differenzieren: ["ableitung"], ableiten: ["ableitung"], derivative: ["ableitung"], derive: ["ableitung"], differentiate: ["ableitung"], differentiation: ["ableitung"],
  aufleiten: ["stammfunktion", "integral"], integrieren: ["integral"], integration: ["integral"], antiderivative: ["stammfunktion"],
  log: ["logarithmus"], ln: ["logarithmus"], logarithm: ["logarithmus"], logarithms: ["logarithmus"], logarithmen: ["logarithmus"],
  exp: ["efunktion"], exponential: ["exponentialfunktion"], exponentiell: ["exponentialfunktion"],
  chain: ["kettenregel"], product: ["produktregel"], quotient: ["quotientenregel"], power: ["potenzregel", "potenz"],
  binomial: ["binomische", "binomialverteilung"], binomisch: ["binomische"],
  mitternachtsformel: ["quadratische"], quadratic: ["quadratische"], quadratisch: ["quadratische"],
  fractions: ["bruch"], fraction: ["bruch"], bruchrechnen: ["bruch"], brueche: ["bruch"], bruche: ["bruch"],
  equation: ["gleichung"], equations: ["gleichung"], gleichungssystem: ["lgs"], system: ["lgs"],
  vector: ["vektoren"], vectors: ["vektoren"], vektor: ["vektoren"],
  plane: ["ebene"], line: ["gerade"], lines: ["geraden"], distance: ["abstand"], angle: ["winkel"], dotproduct: ["skalarprodukt"], cross: ["kreuzprodukt"],
  probability: ["wahrscheinlichkeit"], wkt: ["wahrscheinlichkeit"], stochastic: ["stochastik"], statistics: ["stochastik"], tree: ["baumdiagramm"],
  hypothesis: ["hypothesentest"], expected: ["erwartungswert"], variance: ["varianz"],
  normal: ["normalverteilung"], gaussian: ["normalverteilung"], bell: ["glockenkurve"], density: ["dichte"],
  growth: ["wachstum"], decay: ["zerfall"], halflife: ["halbwertszeit"],
  sine: ["sinus"], cosine: ["kosinus", "cosinus"], trigonometry: ["trigonometrie"], trig: ["trigonometrie"],
  roots: ["nullstellen"], zeros: ["nullstellen"], nst: ["nullstellen"], kd: ["kurvendiskussion"], curve: ["kurvendiskussion"],
  extrema: ["extrempunkte"], hochpunkt: ["extrempunkte"], tiefpunkt: ["extrempunkte"], hp: ["hochpunkt"], tp: ["tiefpunkt"], wp: ["wendepunkt"],
  inflection: ["wendepunkt"], maximum: ["extrempunkte"], minimum: ["extrempunkte"],
  integral: ["integrale"], area: ["flache"], areas: ["flache"], volume: ["volumen"],
  exam: ["klausur"], test: ["klausur"], klassenarbeit: ["klausur"], schulaufgabe: ["klausur"], abi: ["abitur"], abitur: ["abitur"],
  mental: ["kopfrechnen"], multiplication: ["einmaleins"], times: ["einmaleins"], squares: ["quadratzahlen"],
  divisibility: ["teilbarkeit"], prime: ["primzahlen"], pythagorean: ["pythagoras"],
  simplify: ["vereinfachen"], factor: ["faktorisieren", "ausklammern"], expand: ["ausmultiplizieren"], terms: ["terme"], powers: ["potenzen"],
  intercept: ["strahlensatz"], tangent: ["tangens"], cosine: ["kosinus"], sine: ["sinus"], triangle: ["dreieck"],
  parabola: ["parabeln"], parabel: ["parabeln"], slope: ["steigung"], gradient: ["steigung"],
  mathematik: ["mathe"], maths: ["mathe"], math: ["mathe"], mathematics: ["mathe"],
  calculus: ["analysis"], functions: ["funktionen"], function: ["funktion"], formulas: ["formeln"], formula: ["formel"], geometry: ["geometrie"], algebra: ["algebra"],
  hausaufgaben: ["foto", "mathilda"], hausaufgabe: ["foto", "mathilda"], photo: ["foto"], handwriting: ["handschrift"],
  forget: ["vergessen"], repeat: ["wiederholen"], review: ["wiederholen"],
};

/* ---------- Der Index ---------- */

const ORT = (() => {
  const o = {};
  for (const b of BEREICHE) for (const s of b.stationen) for (const id of s.werkzeuge) o[id] = `${b.titel} · ${s.titel}`;
  return o;
})();

/* Zusatzwörter je Werkzeug: so spricht man über das Thema (Werkzeugnamen allein reichen nicht) */
const WZ_WOERTER = {
  textaufgaben: "textaufgaben textaufgabe sachaufgaben sachaufgabe textaufgaben übersetzen übersetzen aufstellen gleichung aufstellen text in gleichung bedingungen bedingung steckbrief steckbriefaufgaben rekonstruktion funktion bestimmen aus bedingungen signalwörter mindestens höchstens zahlenrätsel rechenwörter word problems mathilda foto textaufgabe fotografieren ansatz",
  axiome: "axiome axiom rechenregeln rechengesetze fundament grundlagen kommutativgesetz assoziativgesetz distributivgesetz neutrales element inverses element gegenzahl kehrwert ausklammern ausmultiplizieren verkleidete eins null spielregeln",
  zahlenraeume: "zahlenräume zahlenraum zahlbereiche zahlbereich zahlenmengen natürliche zahlen ganze zahlen rationale zahlen reelle zahlen irrationale zahlen irrational wurzel 2 √2 abgeschlossen abgeschlossenheit widerspruchsbeweis ℕ ℤ ℚ ℝ zahlbereichserweiterung",
  mengenlogik: "mengen menge mengenlehre element teilmenge schnittmenge vereinigungsmenge differenzmenge komplement venn mengenbild leere menge intervall intervalle intervallschreibweise lösungsmenge aussage aussagen logik wahrheitstafel wahrheitswert und oder nicht implikation folgerung äquivalenz umkehrung kontraposition gegenbeispiel notwendig hinreichend quantor für alle es gibt verneinung beweis beweisen de morgan sets logic",
  ungleichungen: "ungleichung ungleichungen ungleichheitszeichen kleiner größer kleiner gleich größer gleich zeichen umdrehen lösungsmenge intervall betrag betragsgleichung betragsungleichung betragsstriche abstand quadratische ungleichung doppelungleichung vorzeichentabelle tarifvergleich inequality absolute value",
  funktionen: "funktion funktionen funktionsbegriff zuordnung funktionswert urbild definitionsbereich definitionsmenge wertebereich wertemenge potenzfunktion potenzfunktionen hyperbel wurzelfunktion wurzelfunktionen n-te wurzel umkehrfunktion umkehrbar spiegeln winkelhalbierende verkettung verketten verkettete funktion innere funktion äußere funktion f(g(x)) senkrechtentest symmetrie verhalten im unendlichen domain range inverse composition",
  prozent: "prozent prozentrechnung grundwert prozentwert prozentsatz rabatt mehrwertsteuer mwst zinsen zinseszins zinsrechnung skonto prozentstreifen",
  zuordnungen: "zuordnung zuordnungen proportional antiproportional dreisatz quotientengleich produktgleich proportionalität",
  flaechen: "fläche flächeninhalt umfang rechteck quadrat dreieck parallelogramm trapez drachen raute zusammengesetzte figur",
  groessen: "größen einheiten umrechnen länge masse gewicht zeit fläche volumen liter maßstab km m cm mm kg g t",
  dezimal: "dezimalzahl dezimalzahlen komma dezimalbruch runden periodisch abbrechend stellenwert zehntel hundertstel",
  quader: "quader würfel volumen oberfläche kanten würfelnetz netz einheitswürfel rauminhalt",
  ganzezahlen: "ganze zahlen negative zahlen vorzeichen zahlengerade minus mal minus rationale zahlen betrag gegenzahl temperatur",
  diagramme: "daten diagramm säulendiagramm kreisdiagramm mittelwert durchschnitt median zentralwert spannweite häufigkeit relative häufigkeit strichliste",
  primzahlen: "primzahl primzahlen primfaktor primfaktorzerlegung ggt kgv teiler vielfache sieb eratosthenes faktorbaum",
  rechengesetze: "rechengesetze punkt vor strich klammer rechenreihenfolge kommutativgesetz assoziativgesetz distributivgesetz rechenvorteil term",
  koordinaten: "koordinatensystem koordinaten punkt achsensymmetrie punktsymmetrie spiegeln spiegelung symmetrieachse x-achse y-achse",
  zufall: "zufall wahrscheinlichkeit laplace würfel münze urne gegenereignis pfadregel relative häufigkeit experiment",
  stellenwert: "stellenwert stellenwerttafel natürliche zahlen große zahlen runden zahlenstrahl römische zahlen million zehnerpotenz",
  winkelsaetze: "winkel scheitelwinkel nebenwinkel stufenwinkel wechselwinkel nachbarwinkel parallelen winkelsumme innenwinkel außenwinkel aussenwinkel n-eck vieleck gleichschenklig basiswinkel",
  konstruktion: "konstruktion konstruieren mittelsenkrechte winkelhalbierende höhe höhen seitenhalbierende schwerpunkt umkreis inkreis umkreismittelpunkt inkreismittelpunkt höhenschnittpunkt euler-gerade zirkel",
  kathetensatz: "kathetensatz höhensatz satzgruppe des pythagoras hypotenusenabschnitt hypotenusenabschnitte p q höhe",
  kreis: "kreis kreisumfang kreisfläche umfang fläche radius durchmesser pi π kreisbogen bogen kreisausschnitt sektor kreisring",
  koerper: "körper koerper volumen oberfläche oberflaeche zylinder kegel pyramide kugel prisma mantel mantellinie schrägbild rauminhalt",
  pythagoras: "pythagoras satz des pythagoras a²+b²=c² hypotenuse kathete katheten rechtwinkliges dreieck rechter winkel umkehrung raumdiagonale diagonale leiter",
  thales: "thales satz des thales thaleskreis halbkreis rechter winkel durchmesser umkreis umkreismittelpunkt tangente berührradius",
  kongruenz: "kongruenz kongruenzsätze kongruent deckungsgleich sss sws wsw sww ssw ssw dreieck konstruieren konstruktion eindeutig dreiecksungleichung",
  bruchrechnen: "bruch brüche bruchrechnung bruchrechnen kürzen erweitern hauptnenner gleichnamig kehrwert zähler nenner gemischte zahl doppelbruch anteil ggt kgv",
  bruchterme: "bruchterm bruchterme bruchgleichung bruchgleichungen definitionsmenge definitionsbereich nenner null kürzen hauptnenner scheinlösung",
  geradengleichung: "lineare funktion gerade steigung achsenabschnitt y-achsenabschnitt punkt-steigungs-form zwei punkte m n y=mx+b",
  strahlensaetze: "strahlensatz strahlensätze vierstreckensatz v-figur x-figur parallelen streckfaktor zentrische streckung ähnlichkeit ähnliche dreiecke schatten baumhöhe verhältnis",
  trigonometrie: "trigonometrie sinus kosinus cosinus tangens sin cos tan dreieck rechtwinklig gegenkathete ankathete hypotenuse sinussatz kosinussatz winkel berechnen einheitskreis bogenmaß bogenmass gradmaß radiant steigungswinkel höhenwinkel arcsin arkussinus",
  parabeln: "quadratische funktion scheitelpunkt scheitelform nullstellen brennpunkt normalparabel quadratische gleichung pq-formel mitternachtsformel abc-formel parabel",
  sinus: "sinus kosinus cosinus trigonometrie periode amplitude schwingung winkelfunktion bogenmaß sin cos",
  wachstum: "exponentielles wachstum zerfall halbwertszeit verdopplungszeit logarithmus log ln e-funktion exponentialfunktion zinsen prozent",
  ableitungstrainer: "ableiten ableitung differenzieren kettenregel produktregel quotientenregel reziprokenregel potenzregel summenregel faktorregel regel-werkstatt werkstatt kombo",
  stammintegral: "stammfunktion aufleiten integrieren integral hauptsatz bestimmtes integral grenzen F(b) F(a) substitution",
  kurvendiskussion: "funktionsuntersuchung nullstellen extrempunkte extremstellen extremwerte hochpunkt tiefpunkt wendepunkt monotonie krümmung symmetrie grenzverhalten asymptote polynom ganzrationale funktion graph plotter ableitungen definitionsbereich polstelle polynomdivision",
  scharen: "parameter funktionenschar ortskurve ortslinie schar ft fa",
  steckbrief: "steckbriefaufgabe funktion bestimmen rekonstruktion lgs bedingungen punkt hochpunkt wendepunkt",
  optimierung: "extremwertaufgabe extremwertproblem zielfunktion nebenbedingung maximum minimum schachtel fläche",
  integrale: "integral integrieren aufleiten stammfunktion flächenberechnung bestand hauptsatz bestimmtes integral unbestimmtes integral fläche zwischen graphen",
  vektorgenerator: "vektoren addition subtraktion skalarprodukt linearkombination vielfache betrag länge",
  kreuzprodukt: "vektorprodukt normalenvektor senkrechter vektor fläche parallelogramm",
  winkel: "winkel zwischen vektoren skalarprodukt orthogonal senkrecht kosinus winkelberechnung",
  zweipunkte: "gerade aus zwei punkten geradengleichung parameterform richtungsvektor stützvektor",
  dreipunkte: "ebene aus drei punkten ebenengleichung parameterform koordinatenform normalenform normalenvektor",
  ebenen: "ebene koordinatenform normalenform spurpunkte spurgerade visualizer 3d raum",
  geraden: "lagebeziehung gerade gerade schneidend parallel windschief identisch punktprobe schnittpunkt",
  ebenevsebene: "schnittgerade schnittwinkel lagebeziehung ebenen",
  abstaende: "abstand punkt ebene abstand punkt gerade abstand windschiefe geraden hessesche normalenform lotfußpunkt spiegelung",
  kombinatorik: "urne ziehen mit zurücklegen ohne zurücklegen reihenfolge permutation fakultät binomialkoeffizient n über k lotto baumdiagramm pfadregel zählen",
  vierfelder: "vierfeldertafel vier felder tafel bedingte wahrscheinlichkeit bayes baumdiagramm unabhängigkeit",
  erwartungswert: "faires spiel gewinn einsatz varianz standardabweichung zufallsgröße verteilung",
  bernoulli: "binomialverteilung bernoulli-formel trefferwahrscheinlichkeit wahrscheinlichkeit mindestens höchstens sigma-regeln",
  hypothesentest: "signifikanztest nullhypothese ablehnungsbereich irrtumswahrscheinlichkeit fehler 1. art fehler 2. art einseitig zweiseitig",
  normalverteilung: "normalverteilung normalverteilt glockenkurve glocke gaußsche glockenkurve gauß gauss dichte dichtefunktion stetig stetige zufallsgröße standardnormalverteilung standardisieren phi φ Φ sigma-regeln sigmaregeln sigma-umgebung standardabweichung wendestelle stetigkeitskorrektur de moivre laplace invnorm normalcdf quantil",
  terme: "umformen vereinfachen ausklammern faktorisieren binomische formel binomische formeln brüche bruchrechnen bruch kürzen erweitern potenzen potenzgesetze wurzeln wurzelgesetze klammern ausmultiplizieren",
  gleichungen: "gleichung lösen lineare gleichung quadratische gleichung pq-formel mitternachtsformel abc-formel quadratische ergänzung umformen äquivalenzumformung wurzelgleichung betragsgleichung exponentialgleichung logarithmusgleichung bruchgleichung substitution",
  lgs: "lineares gleichungssystem gleichungssystem gauß gauß-verfahren additionsverfahren einsetzungsverfahren gleichsetzungsverfahren drei unbekannte",
};

/* Videokurse: Kursname, Altersangabe, Lektionen mit Suchwörtern */
const KURSE_INDEX = [
  { id: "penpaper", titel: "Pen & Paper", stufe: "Klasse 8 – 13", lektionen: [
    ["Dein Blatt ist dein Arbeitsplatz", "blatt arbeitsplatz heft schreiben ordnung strukturiert aufschreiben"],
    ["Die 7 Goldenen Regeln", "goldene regeln aufschreiben lesbar rechenweg"],
    ["Das Gleichheitszeichen ist kein Pfeil", "gleichheitszeichen pfeil äquivalenz schreibweise"],
    ["Der Arbeitsprozess in 6 Stufen", "arbeitsprozess stufen vorgehen"],
    ["Wenn du feststeckst: das 5-Fragen-Protokoll", "feststecken nicht weiter hilfe protokoll fragen"],
    ["Die 6 fatalen Fehler", "fehler flüchtigkeitsfehler information"],
    ["Der Pen-&-Paper-Check und deine 7-Tage-Routine", "check routine abgabe kontrolle"],
  ] },
  { id: "analysis1", titel: "Analysis 1", stufe: "Klasse 8 – 11", lektionen: [
    ["Die Geradengleichung y = mx + b", "geradengleichung lineare funktion y mx b"],
    ["Steigung mit dem Steigungsdreieck", "steigung steigungsdreieck"],
    ["Geradengleichung aus zwei Punkten", "geradengleichung zwei punkte"],
    ["Schnittpunkt zweier Geraden", "schnittpunkt gleichsetzen geraden"],
    ["Parallele und senkrechte Geraden", "parallel senkrecht orthogonal geraden"],
  ] },
  { id: "analysis2", titel: "Analysis 2", stufe: "Klasse 9 – 12", lektionen: [
    ["Grad und Leitkoeffizient", "grad leitkoeffizient polynom ganzrationale funktion"],
    ["Verhalten im Unendlichen", "grenzverhalten unendlich"],
    ["Symmetrie", "achsensymmetrie punktsymmetrie gerade ungerade funktion"],
    ["Nullstellen berechnen", "nullstellen ausklammern substitution pq-formel"],
    ["Polynomdivision", "polynomdivision horner-schema nullstelle raten"],
  ] },
  { id: "analysis3", titel: "Analysis 3", stufe: "Klasse 10 – 13", lektionen: [
    ["Die e-Funktion", "e-funktion exponentialfunktion euler"],
    ["Der natürliche Logarithmus", "natürlicher logarithmus ln logarithmus log logarithmengesetze"],
    ["Sinus und Kosinus", "sinus kosinus cosinus trigonometrie"],
    ["Wurzelfunktionen", "wurzelfunktion wurzel"],
    ["Gebrochenrationale Funktionen", "gebrochenrationale funktionen polstelle asymptote definitionslücke"],
  ] },
  { id: "analysis4", titel: "Analysis 4", stufe: "Klasse 11 – 13", lektionen: [
    ["Vom Differenzenquotienten zur Ableitung", "differenzenquotient ableitung tangente steigung h-methode"],
    ["Die Ableitungsregeln", "ableitungsregeln potenzregel kettenregel produktregel quotientenregel summenregel faktorregel ableiten"],
    ["Extrempunkte bestimmen", "extrempunkte extremstellen extremwerte hochpunkt tiefpunkt notwendige hinreichende bedingung"],
    ["Wendepunkte berechnen", "wendepunkte wendestellen krümmung zweite ableitung dritte ableitung"],
    ["Die komplette Kurvendiskussion", "kurvendiskussion komplett protokoll"],
  ] },
  { id: "analysis5", titel: "Analysis 5", stufe: "Klasse 11 – 13", lektionen: [
    ["Stammfunktionen bilden", "stammfunktion aufleiten integrieren integral"],
    ["Der Hauptsatz", "hauptsatz differential integralrechnung bestimmtes integral"],
    ["Fläche mit der x-Achse", "fläche x-achse flächeninhalt integral nullstellen"],
    ["Fläche zwischen zwei Graphen", "fläche zwischen zwei graphen integral"],
    ["Rotationskörper", "rotationskörper volumen rotation"],
  ] },
  { id: "vektoren", titel: "Vektoren", stufe: "Klasse 11 – 13", lektionen: [
    ["Grundlagen der Vektorrechnung", "vektoren ortsvektor addition betrag länge"],
    ["Skalarprodukt und Winkel", "skalarprodukt winkel orthogonal"],
    ["Geraden in Parameterform", "geraden parameterform richtungsvektor"],
    ["Lagebeziehungen zweier Geraden", "lagebeziehung geraden schnittpunkt windschief parallel"],
    ["Ebenen in drei Formen", "ebenen parameterform koordinatenform normalenform"],
  ] },
  { id: "stochastik", titel: "Stochastik", stufe: "Klasse 11 – 13", lektionen: [
    ["Baumdiagramm und Pfadregeln", "baumdiagramm pfadregeln wahrscheinlichkeit"],
    ["Vierfeldertafel und bedingte Wahrscheinlichkeit", "vierfeldertafel bedingte wahrscheinlichkeit bayes"],
    ["Zufallsgröße und Erwartungswert", "zufallsgröße erwartungswert varianz"],
    ["Binomialverteilung und Bernoulli-Formel", "binomialverteilung bernoulli formel"],
    ["Der Hypothesentest", "hypothesentest ablehnungsbereich fehler"],
  ] },
];

const e = (typ, titel, zeile, stich, ziel, marke, extra = {}) => ({ typ, titel, zeile, stich, ziel, marke, ...extra });

function baueIndex() {
  const liste = [];

  /* Werkzeuge */
  for (const id of Object.keys(WERKZEUGE)) {
    const w = WERKZEUGE[id];
    liste.push(e("werkzeug", w.name, w.zeile, `${w.slogan || ""} ${WZ_WOERTER[id] || ""} ${w.kurz || ""}`, w.ziel, ETIKETTEN[w.etikett]?.name || "Werkzeug",
      { id: `wz:${id}`, ort: ORT[id] || null, wzId: id }));
  }

  /* Videokurse, je Lektion ein Eintrag (die Ergebnisliste zeigt je Kurs nur die beste) */
  for (const k of KURSE_INDEX) {
    k.lektionen.forEach(([titel, stich], i) => {
      liste.push(e("kurs", `${k.titel}: ${titel}`, `Videolektion ${i + 1} · ${k.stufe}`, `${titel} ${stich} ${k.titel}`,
        { ansicht: "kurse", kurs: k.id }, "Videokurs", { id: `kurs:${k.id}:${i}`, gruppe: `kurs:${k.id}` }));
    });
  }

  /* Mathe entdecken und weitere Lernseiten */
  const lernen = [
    ["Axiome", "Fundament der Mathematik, erste Beweise", "axiome beweis beweisen fundament grundlagen mathematik logik mengenlehre", { ansicht: "entdecken", seite: "axiome" }, "Mathe entdecken"],
    ["Mathematisches Denken", "Video und Fragen zum Nachdenken", "denken kreativität neugier vermutung video reflexion lernen mindset", { ansicht: "entdecken", seite: "einstieg" }, "Mathe entdecken"],
    ["Pascalsches Dreieck", "Vom Zahlenmuster zur Potenzregel", "pascalsches dreieck potenzregel binomischer lehrsatz binomische formeln binomialkoeffizient muster ableitung herleiten", { ansicht: "entdecken", seite: "praxis" }, "Mathe entdecken"],
    ["Satz des Pythagoras", "Entdecke, warum a² + b² = c² gilt", "pythagoras satz des pythagoras a2 b2 c2 rechtwinkliges dreieck hypotenuse kathete beweis fläche dreieck rechteck", { ansicht: "entdecken", seite: "pythagoras" }, "Mathe entdecken"],
    ["Teilbarkeitsregeln", "Alle Regeln von 2 bis 9 selbst herleiten", "teilbarkeit teilbarkeitsregeln quersumme teiler primzahlen durch 2 3 4 5 6 7 8 9 vielfache kopfrechnen", { ansicht: "entdecken", seite: "teiler" }, "Mathe entdecken"],
    ["Binomische Formeln entdecken", "Drei Formeln aus Flächen gebaut", "binomische formeln erste zweite dritte binomische formel a+b quadrat ausmultiplizieren faktorisieren kopfrechnen fläche quadrat rechteck", { ansicht: "entdecken", seite: "binomisch" }, "Mathe entdecken"],
    ["Carl Friedrich Gauß", "Summenformel, Gauß-Verfahren und die Glocke auf dem Zehn-Mark-Schein", "gauß gauss carl friedrich kleiner gauß summenformel 1 bis 100 5050 gauß-verfahren gleichungssystem eliminieren glockenkurve normalverteilung zehn mark schein 10 dm geldschein mathematiker", { ansicht: "entdecken", seite: "gauss" }, "Mathe entdecken"],
    ["Ableitung als Grenzwert", "Von der Sekante zur Tangente", "ableitung grenzwert limes h gegen 0 sekante tangente differenzenquotient differentialquotient h-methode steigung x2 x3", { ansicht: "entdecken", seite: "grenzwert" }, "Mathe entdecken"],
    ["Bundeswettbewerb Mathematik", "Nächste 1. Runde, Aufgaben vom Vorjahr", "bundeswettbewerb mathematik wettbewerb olympiade aufgaben bwm knobeln", { ansicht: "bwm" }, "Mathe entdecken"],
    ["Landeswettbewerbe", "Tippe auf dein Bundesland", "landeswettbewerb wettbewerb mathematik bundesland olympiade knobeln", { ansicht: "landeswettbewerbe" }, "Mathe entdecken"],
    ["Differenzenquotient", "Vom Tangentenproblem zur Ableitung", "differenzenquotient tangentenproblem ableitung sekante steigung grenzwert h-methode", { ansicht: "diffq" }, "Lernseite"],
    ["GFS-Trainer", "Jedes GFS-Thema: verstehen, vortragen, Fragen beantworten", "gfs gfs-trainer gleichwertige feststellung von schülerleistungen referat präsentation vortrag kolloquium thema lambacher schweizer", { ansicht: "gfs" }, "Lernseite"],
    ["GFS: Pascal’sches Dreieck", "Warum dort die Binomialkoeffizienten stehen", "gfs pascal pascalsches dreieck binomialkoeffizient binomialkoeffizienten pascal-regel fakultät binomische formeln dreieckszahlen sierpinski kolloquium", { ansicht: "gfs-pascal" }, "Lernseite"],
    ["Potenzregel", "Beweis mit Produktregel und vollständiger Induktion", "potenzregel ableiten ableitung beweis produktregel vollständige induktion", { ansicht: "potenzregel" }, "Lernseite"],
    ["Kurs Differentialrechnung", "Jedes Buchkapitel lesen und direkt darunter trainieren", "kurs differentialrechnung differenzialrechnung ableitung ableiten module kapitel lesen trainieren faktorregel summenregel produktregel potenzregel quotientenregel kettenregel tangente", { ansicht: "diffkurs" }, "Kurs"],
    ["Kurs Vektoren, Geraden und Ebenen", "Jedes Heftkapitel lesen und direkt darunter trainieren", "kurs vektoren vektor geraden ebenen raum analytische geometrie lgs gleichungssystem gauß parameterform normalenform koordinatenform skalarprodukt kreuzprodukt spurpunkte lage abstand windschief schnittwinkel spiegelung module kapitel lesen trainieren", { ansicht: "vekkurs" }, "Kurs"],
    ["Schulbuch: Ableitungen", "50 Seiten zum Blättern – jede Regel hergeleitet", "schulbuch buch ableitungen ableitung differenzenquotient faktorregel summenregel produktregel potenzregel quotientenregel kettenregel sinus kosinus e-funktion logarithmus tangente normale lösungen pdf", { ansicht: "schulbuch" }, "Lernseite"],
    ["Arbeitsheft", "Acht Bausteine mit Herleitung und Aufgaben", "arbeitsheft bausteine herleitung aufgaben lineare funktionen sekante tangente ableitungsregeln nullstellen symmetrie grenzverhalten monotonie extrempunkte krümmung wendepunkte kurvendiskussion anwendung transfer", { ansicht: "training", ziel: "module" }, "Lernseite"],
  ];
  /* Programme nur in der Suche, solange das Angebot „Kurse“ eingeschaltet ist (angebot.js) */
  if (ANGEBOT.kurse) {
    lernen.push(
      ["Mathe Abi Masterclass", "Das 6-Monats-Programm fürs Mathe-Abi", "abi abitur masterclass programm coaching vorbereitung mathe abi", { ansicht: "masterclass" }, "Programm"],
      ["Mathe checken", "Das 2-Monats-Programm", "mathe checken programm coaching lücken schließen", { ansicht: "mathecheck" }, "Programm"],
    );
  }
  for (const [t, z, s, ziel, m] of lernen) liste.push(e("lernen", t, z, s, ziel, m, { id: `lernen:${t}` }));

  for (const k of [8, 9, 10, 11, 12, 13]) {
    liste.push(e("lernen", `Klasse ${k}`, k >= 11 ? "Kursstufe" : "Nach dem Lambacher Schweizer", `klasse ${k} lehrplan stoff schulbuch lambacher schweizer jahrgang`,
      { ansicht: "klasse", klasse: k }, "Nach Klasse", { id: `klasse:${k}` }));
  }

  /* Üben und Training */
  const ueben = [
    ["Dein Plan", "Standortcheck und Wochenplan", "plan lernplan lernpfad wochenplan standortcheck einstufung wo stehe ich woche einheiten ziel klausur abitur termin path", { ansicht: "lernpfad" }],
    ["5 Minuten Mathe", "Fünf kurze Aufgaben", "5 minuten mathe kurz üben täglich aufwärmen warmup schnell", { ansicht: "warmup" }],
    ["Meine Fehler üben", "Gezielt ähnliche Aufgaben", "fehler flüchtigkeitsfehler vorzeichenfehler fehlertypen üben schwächen", { ansicht: "fehlertraining" }],
    ["Mein Training", "Tagesplan, Lernfortschritt und Übungsmodi", "training tagesplan fortschritt übungsmodi lernstand", { ansicht: "meintraining" }],
    ["Kopfrechnen", "Einmaleins, Quadrat- und Kubikzahlen", "kopfrechnen einmaleins 1x1 quadratzahlen kubikzahlen rechentricks kopf rechnen zahlen head numbers", { ansicht: "headnumbers" }],
    ["Gleichungen – Verstehen, Rechnen, Training", "Eine Zahl finden, über die du etwas weißt", "gleichungen gleichung verstehen unbekannte zahl x finden umkehroperation rueckwaerts rechnen aequivalenzumformung waage probe equations unknown", { ansicht: "gleichkurs" }],
    ["Ebbinghaus", "Skills im richtigen Moment wiederholen", "wiederholen vergessen vergessenskurve behalten wiederholung gedächtnis ebbinghaus", { ansicht: "ebbinghaus" }],
    ["Aufgabengenerator", "Geraden, Ableitungen, Kurvendiskussion", "aufgaben generator übungsaufgaben zufällig arbeitsblatt geraden ableitungen kurvendiskussion", { ansicht: "ki", ziel: null }],
    ["Arbeitsblatt drucken", "Aufgabenblatt mit Lösungsteil", "arbeitsblatt drucken pdf aufgabenblatt lösungen übungsblatt", { ansicht: "ki", ziel: "blatt" }],
    ["Arbeitsblatt-Generator für Lehrkräfte", "Kapitel wählen, PDF mit Lösungsblatt – kostenlos", "lehrer lehrerin lehrkraft lehrkräfte arbeitsblatt generator arbeitsblätter erstellen klasse unterricht pdf lösungsblatt gruppe a b übungsblatt vertretungsstunde worksheet teacher", { ansicht: "lehrerblatt" }],
    ["Für Lehrkräfte", "Was Mythos Mathe für deinen Unterricht tut", "lehrer lehrkraft lehrkräfte schule unterricht klasse klassencode für lehrer teacher", { ansicht: "lehrkraefte" }],
    ["Rechenweg schreiben", "Ganze Wege eintippen und prüfen lassen", "rechenweg schreiben eintippen prüfen lösungsweg schritte", { ansicht: "training", ziel: "weg" }],
    ["Graph-Zuordnung", "Welcher Graph ist f′?", "graph zuordnung ableitungsgraph f strich graphen erkennen", { ansicht: "training", ziel: "gz" }],
    ["Mathilda fragen", "Tutorin mit Gedächtnis, rechnet mit der App nach", "mathilda fragen chat tutor hilfe erklären ki frage stellen ask tutor", { ansicht: "analyse", foto: "chat" }],
    ["Blatt prüfen", "Rechenweg und Schriftbild vom Foto", "foto blatt prüfen hausaufgabe kontrollieren korrigieren mathilda ki handschrift rechenweg schriftbild kamera", { ansicht: "analyse", foto: "blatt" }],
    ["Weg prüfen", "Handschrift in Zeilen übertragen", "foto weg prüfen handschrift rechenweg zeilen mathilda ki kamera", { ansicht: "analyse", foto: "weg" }],
    ["Aufgabe scannen", "Ähnliche Aufgaben dazu erzeugen", "foto aufgabe scannen ähnliche aufgaben mathilda ki kamera", { ansicht: "analyse", foto: "aufgabe" }],
    ["Klausurbriefkasten", "Zurückgegebene Klassenarbeit einwerfen – für bessere Testklausuren", "klausurbriefkasten briefkasten klausur einwerfen klassenarbeit einschicken hochladen klausuren sammeln testklausur probeklausur mathilda foto test mailbox", { ansicht: "klausurbriefkasten" }],
  ];
  for (const [t, z, s, ziel] of ueben) liste.push(e("uebung", t, z, s, ziel, "Trainieren", { id: `ueben:${t}` }));

  /* Prüfung */
  const pruefung = [
    ["Klausur vorbereiten", "Termin eintragen, Plan bekommen", "klausur klassenarbeit schulaufgabe test lernplan termin vorbereiten vorbereitung prüfung", { ansicht: "vorbereiten" }],
    ["Klausurgenerator", "Drei Aufgaben mit Uhr", "klausur generator klassenarbeit probeklausur uhr zeit aufgaben", { ansicht: "training", ziel: "klausur" }],
    ["Prüfungsmodus", "Ohne Hilfen, mit Punkten", "prüfung prüfungsmodus ohne hilfen punkte timer klausur simulieren", { ansicht: "pruefung" }],
    ["Klausur nachbereiten", "Verlorene Punkte auswerten", "klausur nachbereiten nachbesprechen verlorene punkte auswerten fehler analysieren", { ansicht: "klausurnach" }],
    ["Probeabitur", "Teil A und B mit Uhr und Notenpunkten", "abitur abi probeabitur teil a teil b notenpunkte hilfsmittelfrei prüfung", { ansicht: "abitur" }],
    ["Abi-Sätze", "Zehn komplette Aufgabensätze im Abi-Format", "abi abitur aufgabensatz aufgabensätze prüfung pflichtteil wahlteil teil a teil b hilfsmittelfrei wtr verrechnungspunkte baden-württemberg bw original generalprobe probeabitur", { ansicht: "abisaetze" }],
    ["Abi-Ketten", "Eine Abi-Aufgabe durch mehrere Werkzeuge", "abi abitur ketten aufgabe punkte analysis geometrie stochastik prüfung", { ansicht: "abiketten" }],
    ["Operatoren", "Was „bestimmen“, „zeigen“, „begründen“ verlangen", "operatoren bestimmen zeigen begründen berechnen untersuchen nachweisen angeben beschreiben anforderungsbereich", { ansicht: "operatoren" }],
    ["Begründen und Beweisen", "Freie Antworten am Bewertungsraster", "begründen beweisen beweis argumentieren bewertungsraster freie antwort", { ansicht: "begruenden" }],
    ["Modellieren", "Sachaufgaben in vier Schritten", "modellieren sachaufgaben textaufgaben anwendungsaufgaben modell realität", { ansicht: "modellieren" }],
  ];
  for (const [t, z, s, ziel] of pruefung) liste.push(e("pruefung", t, z, s, ziel, "Prüfung", { id: `pruefung:${t}` }));

  /* Formelsammlung: jede Formel einzeln, mit Sprung genau dorthin */
  const bereichName = Object.fromEntries(FS_BEREICHE.map((b) => [b.id, b.kurz || b.name]));
  for (const f of FS_ALLE) {
    liste.push(e("formel", f.n, f.k || "", `${f.g || ""} ${bereichName[f.bereich] || ""} formel formelsammlung nachschlagen`,
      { ansicht: "formeln", bereich: f.bereich, formel: f.id }, "Formelsammlung", { id: `formel:${f.id}`, ort: bereichName[f.bereich] || null }));
  }
  liste.push(e("formel", "Formelsammlung · Unterstufe", "Alle Formeln für Klasse 5 bis 7", "unterstufe klasse 5 6 7 fünfte sechste siebte formelsammlung grundlagen",
    { ansicht: "formeln", bereich: "unterstufe" }, "Formelsammlung", { id: "formel:unterstufe" }));
  liste.push(e("formel", "Formelsammlung", "Alle Regeln zum Nachschlagen", "formelsammlung formeln regeln nachschlagen merkhilfe",
    { ansicht: "formeln" }, "Formelsammlung", { id: "formel:alle" }));

  return liste;
}

/* Index mit vorbereiteten Wortlisten je Feld */
export const INDEX = baueIndex().map((x) => ({ ...x, t: { titel: tokens(x.titel), stich: tokens(x.stich), zeile: tokens(x.zeile) } }));

/* ---------- Wörter vergleichen ---------- */

const gemeinsamerAnfang = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };

function abstand(a, b, grenze) {
  if (Math.abs(a.length - b.length) > grenze) return grenze + 1;
  let vor = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const neu = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      neu[j] = Math.min(vor[j] + 1, neu[j - 1] + 1, vor[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (neu[j] < min) min = neu[j];
    }
    if (min > grenze) return grenze + 1;
    vor = neu;
  }
  return vor[b.length];
}

/* Wie gut passt Suchwort q auf Indexwort w? → { s: 0…1, unscharf } */
export function passt(q, w) {
  if (q === w) return { s: 1, unscharf: false };
  const lq = q.length, lw = w.length;
  if (lq >= 3 && lw >= lq && w.startsWith(q)) return { s: 0.9, unscharf: false };           // „kurve“ → „kurvendiskussion“
  /* Wer ein längeres Wort tippt als im Index steht („ableitungsregeln“ → „ableitung“): das Indexwort muss den Großteil abdecken,
     sonst passt „kette“ fälschlich auf „kettenregel“ */
  if (lq > lw && lw >= 5 && q.startsWith(w) && lw >= 0.65 * lq) return { s: 0.85, unscharf: false };
  if (lq >= 5 && lw > lq && w.includes(q)) return { s: 0.75, unscharf: false };             // „regel“ → „kettenregel“
  const p = gemeinsamerAnfang(q, w);
  if (p >= 6 && p >= 0.7 * Math.min(lq, lw) && p >= 0.65 * Math.max(lq, lw)) return { s: 0.7, unscharf: false };   // „ableiten“ ~ „ableitung“, aber nicht „kettenregel“ ~ „kette“
  if (lq >= 5) {
    const d = abstand(q, w, lq >= 8 ? 2 : 1);
    if (d <= 1) return { s: 0.6, unscharf: true };                                          // Tippfehler
    if (lq >= 8 && d <= 2) return { s: 0.5, unscharf: true };
  }
  return { s: 0, unscharf: false };
}

/* Alternativen eines Suchworts: ae/oe/ue-Schreibweise und Synonyme */
function varianten(q) {
  const v = new Map([[q, 1]]);
  const ohneE = q.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
  if (ohneE !== q && ohneE.length >= 3) v.set(ohneE, 1);
  /* Synonyme sind einzelne, markante Wörter; bei Wortgruppen zählt nur das längste Wort (sonst passt „formel“ auf alles) */
  for (const k of [q, ohneE]) for (const syn of SYN[k] || []) {
    const t = tokens(syn).sort((a, b) => b.length - a.length)[0];
    if (t && !v.has(t)) v.set(t, 0.92);
  }
  return v;
}

const FELD = { titel: 1, stich: 0.8, zeile: 0.4 };

function bestePassung(varianten_, eintrag) {
  let best = { s: 0, unscharf: false };
  for (const [wort, gew] of varianten_) {
    for (const feld of ["titel", "stich", "zeile"]) {
      for (const w of eintrag.t[feld]) {
        const r = passt(wort, w);
        if (!r.s) continue;
        const s = r.s * FELD[feld] * gew;
        if (s > best.s) best = { s, unscharf: r.unscharf, roh: r.s };
      }
    }
  }
  return best;
}

/* ---------- Rückfragen und Vorschläge ---------- */

const frageOpt = (de, en, anfrage) => ({ text: [de, en], anfrage });

/* Zu breite Eingaben: eigene Gegenfrage mit konkreten Wegen. Reihenfolge = vom Allgemeinen zum Besonderen. */
const BREIT = [
  { woerter: ["mathe", "mathematik", "schule", "schulmathe", "alles", "training", "trainieren", "ueben", "uben", "lernen", "hilfe", "thema", "unterricht"],
    frage: ["Mathematik ist ein weites Feld. Was genau möchtest du trainieren oder verstehen?", "Maths is a big field. What exactly would you like to practise or understand?"],
    optionen: [
      frageOpt("Zahlen, Größen und Rechengesetze", "Numbers, units and laws of arithmetic", "Stellenwert, Größen umrechnen, Rechengesetze"),
      frageOpt("Bruchrechnen und Dezimalzahlen", "Fractions and decimals", "Bruchrechnen, Dezimalzahlen"),
      frageOpt("Prozent und Dreisatz", "Percentages and rule of three", "Prozentrechnung, Dreisatz"),
      frageOpt("Terme und Gleichungen", "Terms and equations", "Terme umformen, Gleichungen"),
      frageOpt("Geometrie: Dreiecke, Pythagoras, Thales", "Geometry: triangles, Pythagoras, Thales", "Geometrie"),
      frageOpt("Funktionen und Ableiten", "Functions and derivatives", "Ableitung"),
      frageOpt("Integrale und Flächen", "Integrals and areas", "Integrale"),
      frageOpt("Vektoren und Geometrie im Raum", "Vectors and 3D geometry", "Vektoren"),
      frageOpt("Wahrscheinlichkeit und Statistik", "Probability and statistics", "Wahrscheinlichkeit"),
      frageOpt("Klausur oder Abitur vorbereiten", "Prepare for an exam", "Klausur vorbereiten"),
      frageOpt("Kopfrechnen und Einmaleins", "Mental arithmetic", "Kopfrechnen"),
    ] },
  { woerter: ["analysis", "funktionen", "funktion"],
    frage: ["Analysis ist groß. Wobei brauchst du Hilfe?", "Calculus is big. What do you need help with?"],
    optionen: [
      frageOpt("Funktionen kennen (Gerade, Parabel, Sinus)", "Know the functions (line, parabola, sine)", "Geradengleichung, Parabeln, Sinus"),
      frageOpt("Ableiten und Ableitungsregeln", "Differentiating and the rules", "Ableitungsregeln"),
      frageOpt("Kurvendiskussion", "Curve sketching", "Kurvendiskussion"),
      frageOpt("Nullstellen berechnen", "Finding roots", "Nullstellen"),
      frageOpt("Integrale und Stammfunktionen", "Integrals and antiderivatives", "Stammfunktion Integral"),
      frageOpt("Wachstum und Logarithmen", "Growth and logarithms", "Wachstum, Logarithmus"),
      frageOpt("Funktionsscharen und Parameter", "Function families and parameters", "Funktionsscharen"),
    ] },
  { woerter: ["geometrie", "dreieck", "dreiecke"],
    frage: ["Geometrie – welches Thema meinst du?", "Geometry – which topic do you mean?"],
    optionen: [
      frageOpt("Kongruenzsätze", "Congruence theorems", "Kongruenzsätze"),
      frageOpt("Satz des Thales", "Thales' theorem", "Satz des Thales"),
      frageOpt("Satz des Pythagoras", "Pythagoras' theorem", "Satz des Pythagoras"),
      frageOpt("Winkel an Parallelen und Winkelsummen", "Angles at parallels and angle sums", "Winkelsumme Stufenwinkel"),
      frageOpt("Umkreis, Inkreis, Schwerpunkt", "Circumcircle, incircle, centroid", "Mittelsenkrechte Winkelhalbierende Schwerpunkt"),
      frageOpt("Kathetensatz und Höhensatz", "Leg and altitude theorems", "Kathetensatz Höhensatz"),
      frageOpt("Strahlensätze und Ähnlichkeit", "Intercept theorems and similarity", "Strahlensätze"),
      frageOpt("Kreis: Umfang, Fläche, Sektor", "Circle: circumference, area, sector", "Kreisumfang Kreisfläche Kreisausschnitt"),
      frageOpt("Körper: Volumen und Oberfläche", "Solids: volume and surface", "Volumen Zylinder Kegel Kugel"),
      frageOpt("Sinus, Kosinus, Tangens im Dreieck", "Sine, cosine, tangent in triangles", "Trigonometrie"),
      frageOpt("Vektoren und Geometrie im Raum", "Vectors and 3D geometry", "Rechnen mit Vektoren, Geraden im Raum, Ebene aus drei Punkten"),
    ] },
  { woerter: ["vektoren", "raum", "analytische"],
    frage: ["Vektoren und Geometrie – welcher Teil genau?", "Vectors and geometry – which part exactly?"],
    optionen: [
      frageOpt("Rechnen mit Vektoren", "Calculating with vectors", "Rechnen mit Vektoren Skalarprodukt"),
      frageOpt("Geraden im Raum", "Lines in space", "Geraden im Raum Lagebeziehung"),
      frageOpt("Ebenen aufstellen", "Setting up planes", "Ebene aus drei Punkten Koordinatenform"),
      frageOpt("Abstände berechnen", "Calculating distances", "Abstand"),
      frageOpt("Winkel zwischen Vektoren", "Angles between vectors", "Winkel zwischen Vektoren"),
    ] },
  { woerter: ["stochastik", "wahrscheinlichkeit", "statistik", "zufall"],
    frage: ["Stochastik – welches Thema meinst du?", "Probability – which topic do you mean?"],
    optionen: [
      frageOpt("Baumdiagramm und Zählen", "Tree diagrams and counting", "Baumdiagramm, Kombinatorik"),
      frageOpt("Vier-Felder-Tafel und bedingte Wahrscheinlichkeit", "Two-way tables and conditional probability", "Vierfeldertafel bedingte Wahrscheinlichkeit"),
      frageOpt("Erwartungswert und faire Spiele", "Expected value and fair games", "Erwartungswert"),
      frageOpt("Binomialverteilung", "Binomial distribution", "Binomialverteilung"),
      frageOpt("Hypothesentest", "Hypothesis tests", "Hypothesentest"),
    ] },
  { woerter: ["gleichungen", "gleichung", "algebra", "terme", "term", "umformen"],
    frage: ["Gleichungen und Terme – was genau?", "Equations and terms – what exactly?"],
    optionen: [
      frageOpt("Terme vereinfachen und ausklammern", "Simplifying and factoring terms", "Terme vereinfachen, ausklammern"),
      frageOpt("Binomische Formeln", "Binomial formulas", "Binomische Formeln"),
      frageOpt("Brüche und Potenzen", "Fractions and powers", "Brüche, Potenzen"),
      frageOpt("Lineare und quadratische Gleichungen", "Linear and quadratic equations", "Gleichung lösen, pq-Formel"),
      frageOpt("Gleichungssysteme", "Systems of equations", "Gleichungssystem"),
      frageOpt("Logarithmus- und Exponentialgleichungen", "Logarithmic and exponential equations", "Logarithmus, Exponentialgleichung"),
    ] },
  { woerter: ["klausur", "klausuren", "abitur", "abi", "pruefung", "prufung", "klassenarbeit", "schulaufgabe", "arbeit"],
    frage: ["Wofür möchtest du dich vorbereiten?", "What would you like to prepare for?"],
    optionen: [
      frageOpt("Klausur oder Klassenarbeit planen", "Plan a class test", "Klausur vorbereiten"),
      frageOpt("Probeabitur mit Uhr", "Mock Abitur with a clock", "Probeabitur"),
      frageOpt("Abi-Ketten über mehrere Werkzeuge", "Abitur chains across tools", "Abi-Ketten"),
      frageOpt("Operatoren verstehen", "Understanding command words", "Operatoren"),
      frageOpt("Klausur nachbereiten", "Review a test afterwards", "Klausur nachbereiten"),
    ] },
  { woerter: ["formel", "formeln", "regeln", "regel"],
    frage: ["Welche Formeln suchst du? Such dir einen Bereich aus oder nenn die Formel.", "Which formulas are you looking for? Pick an area or name the formula."],
    optionen: [
      frageOpt("Analysis: Ableiten und Integrieren", "Calculus: differentiating and integrating", "Ableitungsregeln, Integral"),
      frageOpt("Binomische Formeln und pq-Formel", "Binomial formulas and quadratic formula", "binomische Formeln, pq-Formel"),
      frageOpt("Skalarprodukt, Ebenen, Abstände", "Dot product, planes, distances", "Skalarprodukt, Ebene, Abstand"),
      frageOpt("Bayes und Binomialverteilung", "Bayes and binomial distribution", "Bayes, Binomialverteilung"),
      frageOpt("Pythagoras und Einheitskreis", "Pythagoras and unit circle", "Pythagoras, Einheitskreis"),
    ] },
];

/* Wörter mit mehreren Bedeutungen: genau diese Eingabe fragt nach */
const MEHRDEUTIG = {
  winkel: { frage: ["Winkel – in welchem Zusammenhang?", "Angle – in what context?"], optionen: [
    frageOpt("Winkel zwischen Vektoren", "Angle between vectors", "Winkel zwischen Vektoren Skalarprodukt"),
    frageOpt("Winkel im Dreieck, Sinus und Kosinus", "Angles in triangles, sine and cosine", "Sinus Kosinus Einheitskreis"),
    frageOpt("Schnittwinkel von Geraden oder Ebenen", "Angle between lines or planes", "Schnittwinkel Ebenen"),
  ] },
  gerade: { frage: ["Gerade – in der Ebene oder im Raum?", "Line – in the plane or in space?"], optionen: [
    frageOpt("Geradengleichung y = mx + b", "Line equation y = mx + b", "Geradengleichung Steigung"),
    frageOpt("Geraden im Raum (Vektoren)", "Lines in space (vectors)", "Geraden im Raum Lagebeziehung"),
    frageOpt("Zwei Punkte – eine Gerade", "Two points – one line", "Gerade aus zwei Punkten"),
  ] },
  test: { frage: ["Test – was meinst du?", "Test – what do you mean?"], optionen: [
    frageOpt("Hypothesentest (Statistik)", "Hypothesis test (statistics)", "Hypothesentest"),
    frageOpt("Klassenarbeit oder Test vorbereiten", "Preparing for a class test", "Klausur vorbereiten"),
    frageOpt("Wissen testen: Prüfungsmodus", "Test yourself: exam mode", "Prüfungsmodus"),
  ] },
  ebene: { frage: ["Ebene – in welchem Zusammenhang?", "Plane – in what context?"], optionen: [
    frageOpt("Ebene im Raum aufstellen", "Setting up a plane in space", "Ebene aus drei Punkten Koordinatenform"),
    frageOpt("Lage und Abstand von Ebenen", "Position and distance of planes", "Ebene vs. Ebene Abstand"),
    frageOpt("Ebene live im Raum drehen", "Rotate a plane in 3D", "Ebenen Visualizer"),
  ] },
  fehler: { frage: ["Fehler – was meinst du?", "Errors – what do you mean?"], optionen: [
    frageOpt("Meine typischen Rechenfehler üben", "Practise my typical mistakes", "Fehlertypen"),
    frageOpt("Fehler 1. und 2. Art beim Hypothesentest", "Type I and II errors in hypothesis tests", "Hypothesentest Fehler"),
    frageOpt("Mein Blatt vom Foto prüfen lassen", "Have my sheet checked from a photo", "Blatt prüfen Foto"),
  ] },
};
MEHRDEUTIG.geraden = MEHRDEUTIG.gerade;

const BELIEBT = [
  frageOpt("Binomische Formeln", "Binomial formulas", "Binomische Formeln"),
  frageOpt("Kettenregel", "Chain rule", "Kettenregel"),
  frageOpt("Logarithmus", "Logarithm", "Logarithmus"),
  frageOpt("Nullstellen", "Roots", "Nullstellen"),
  frageOpt("Bruchrechnen", "Fractions", "Bruch"),
];
export const BEISPIELE = BELIEBT;

/* Alle Rückfrage-Anfragen (für Tests: jede Option muss zu Treffern führen) */
export const ALLE_OPTIONEN = [
  ...BREIT.flatMap((b) => b.optionen),
  ...Object.values(MEHRDEUTIG).flatMap((m) => m.optionen),
  ...BELIEBT,
];

/* ---------- Die Suche ---------- */

const GRUPPEN = {
  uebung: { id: "uebung", titel: ["Hier kannst du üben und ausprobieren", "Practise and try it out"], typen: ["werkzeug", "uebung"] },
  lernen: { id: "lernen", titel: ["Hier kannst du es lernen und verstehen", "Learn and understand"], typen: ["kurs", "lernen"] },
  nachschlagen: { id: "nachschlagen", titel: ["Zum Nachschlagen", "Look it up"], typen: ["formel"] },
  pruefung: { id: "pruefung", titel: ["Für Klausur und Abitur", "For exams and Abitur"], typen: ["pruefung"] },
};
const MAX_PRO_GRUPPE = { uebung: 5, lernen: 5, nachschlagen: 5, pruefung: 4 };

/* Ein Wort und seine einzelnen Synonyme (damit „vectors“, „maths“, „angle“ wie „Vektoren“, „Mathe“, „Winkel“ behandelt werden) */
const kandidaten = (t) => [t, ...(SYN[t] || []).map((x) => tokens(x).sort((a, b) => b.length - a.length)[0]).filter(Boolean)];

function breitFuer(ts) {
  /* alle Wörter breit? dann die spezifischste Gruppe (später in der Liste) */
  let best = -1;
  for (const t of ts) {
    let i = -1;
    for (const k of kandidaten(t)) { i = BREIT.findIndex((b) => b.woerter.includes(k)); if (i >= 0) break; }
    if (i < 0) return null;
    best = Math.max(best, i);
  }
  return best >= 0 ? BREIT[best] : null;
}

/* Ein Thema (eine Wortgruppe) gegen den ganzen Index bewerten */
function bewerteTeil(wichtig) {
  const N = INDEX.length;
  const wortInfo = wichtig.map((q) => {
    const v = varianten(q);
    let df = 0;
    const treffer = INDEX.map((x) => { const b = bestePassung(v, x); if (b.s >= 0.3) df++; return b; });
    return { q, treffer, gewicht: df ? Math.min(3, Math.max(1, Math.log(1 + N / df))) : 0, df };   // seltene Wörter zählen mehr, aber nicht beliebig viel
  });
  const bekannt = wortInfo.filter((w) => w.df > 0);
  const unbekannt = wortInfo.filter((w) => w.df === 0).map((w) => w.q);
  if (!bekannt.length) return { bewertet: [], unbekannt };

  const summeGewicht = bekannt.reduce((a, w) => a + w.gewicht, 0);
  const bewertet = INDEX.map((x, i) => {
    let s = 0, voll = true, scharf = 0;
    for (const w of bekannt) {
      const b = w.treffer[i];
      s += w.gewicht * b.s;
      if (b.s < 0.55) voll = false;
      if (b.s >= 0.55 && !b.unscharf) scharf++;
    }
    const abdeckung = s / summeGewicht;
    return { x, abdeckung, score: abdeckung * (voll ? 1.3 : 1), voll, scharf };
  }).filter((r) => r.abdeckung >= (bekannt.length > 1 ? 0.3 : 0.35));   // ganze Sätze: auch Teilübereinstimmung; schwache fliegen am relativen Schnitt raus
  return { bewertet, unbekannt };
}

/* Mehrere Themen in einer Eingabe („Kettenregel, Produktregel“, „Geraden und Parabeln“) */
const TRENNER = /\s*(?:,|;|\/|&|\bund\b|\boder\b|\band\b|\bor\b)\s*/i;

/* optionen.erzwingen: Rückfragen und Vorschläge überspringen und alles zeigen, was irgendwie passt („Trotzdem alle Treffer“) */
export function suche(eingabe, optionen_ = {}) {
  const erzwingen = !!optionen_.erzwingen;
  const roh = String(eingabe ?? "").trim();
  if (!roh) return { art: "leer" };

  /* „wie leite ich ab …“ ist „ableiten“ (zwei Wörter, die einzeln nichts bedeuten) */
  const gesagt = roh.replace(/\bleit(e|est|et|en)\b(\s+\S+){0,2}?\s+ab\b/gi, "ableiten")
    .replace(/\b(klassen|schul)?arbeit\b/gi, "klausur")
    .replace(/\bdot product\b/gi, "skalarprodukt").replace(/\bcross product\b/gi, "kreuzprodukt").replace(/\bproduct rule\b/gi, "produktregel")
    .replace(/\bquotient rule\b/gi, "quotientenregel").replace(/\bpower rule\b/gi, "potenzregel").replace(/\bchain rule\b/gi, "kettenregel")
    .replace(/\bpythagorean theorem\b/gi, "pythagoras").replace(/\bnormal form\b/gi, "normalenform");   // „eine Arbeit schreiben“ = Klausur (nicht „Arbeitsplatz“)
  const alle = tokens(gesagt);
  const absicht = alle.some((t) => ABSICHT.ueben.has(t)) ? "ueben" : alle.some((t) => ABSICHT.lernen.has(t)) ? "lernen" : null;
  const nurThema = (ts) => ts.filter((t) => !STOP.has(t) && !ABSICHT.ueben.has(t) && !ABSICHT.lernen.has(t));
  const wichtig = nurThema(alle);

  /* nur Füllwörter / nur eine Absicht („üben“, „Hilfe“) → breite Frage */
  if (!wichtig.length) return { art: "rueckfrage", eingabe: roh, frage: BREIT[0].frage, optionen: BREIT[0].optionen };

  const mehr = erzwingen ? null : (MEHRDEUTIG[wichtig.join(" ")] || (wichtig.length === 1 ? kandidaten(wichtig[0]).map((k) => MEHRDEUTIG[k]).find(Boolean) : null));
  if (mehr) return { art: "mehrdeutig", eingabe: roh, frage: mehr.frage, optionen: mehr.optionen };

  const breit = erzwingen ? null : breitFuer(wichtig);
  if (breit) return { art: "rueckfrage", eingabe: roh, frage: breit.frage, optionen: breit.optionen };

  /* jedes Thema für sich bewerten, beste Wertung je Eintrag behalten */
  const teile = gesagt.split(TRENNER).map((t) => nurThema(tokens(t))).filter((t) => t.length);
  const nachId = new Map();
  const unbekannt = [];
  for (const teil of (teile.length ? teile : [wichtig])) {
    const r = bewerteTeil(teil);
    if (!r.bewertet.length) { unbekannt.push(...(r.unbekannt.length ? r.unbekannt : [teil.join(" ")])); continue; }
    unbekannt.push(...r.unbekannt);
    for (const b of r.bewertet) {
      const alt = nachId.get(b.x.id);
      if (!alt || b.score > alt.score) nachId.set(b.x.id, b);
    }
  }
  const bewertet = [...nachId.values()];
  if (!bewertet.length) return { art: "nichts", eingabe: roh, optionen: BELIEBT, unbekannt };
  bewertet.sort((a, b) => b.score - a.score || a.x.titel.length - b.x.titel.length);
  const top = bewertet[0].score;

  /* nur unscharfe Treffer (Tippfehler)? → „Meinst du …?“ */
  if (!erzwingen && !bewertet.some((r) => r.scharf > 0)) {
    const gesehen = new Set();
    const optionen = [];
    for (const r of bewertet) {
      if (gesehen.has(r.x.titel)) continue;
      gesehen.add(r.x.titel);
      optionen.push({ text: [r.x.titel, r.x.titel], anfrage: r.x.titel.replace(/^.*?: /, "") });
      if (optionen.length === 3) break;
    }
    return { art: "vorschlag", eingabe: roh, frage: ["Meinst du eines davon?", "Do you mean one of these?"], optionen, unbekannt };
  }

  /* je Videokurs nur die beste Lektion; sehr schwache Treffer weglassen */
  const nahe = bewertet.filter((r) => r.score >= top * 0.45 && (erzwingen || r.scharf > 0));
  const belegt = new Set();
  const behalten = [];
  for (const r of nahe) {
    if (r.x.gruppe) { if (belegt.has(r.x.gruppe)) continue; belegt.add(r.x.gruppe); }
    behalten.push(r);
  }

  const reihenfolge = absicht === "lernen" ? ["lernen", "uebung", "nachschlagen", "pruefung"]
    : absicht === "ueben" ? ["uebung", "lernen", "nachschlagen", "pruefung"]
    : ["uebung", "lernen", "nachschlagen", "pruefung"];
  const gruppen = [];
  for (const gid of reihenfolge) {
    const g = GRUPPEN[gid];
    const liste = behalten.filter((r) => g.typen.includes(r.x.typ)).map((r) => r.x);
    if (liste.length) gruppen.push({ id: gid, titel: g.titel, eintraege: liste.slice(0, MAX_PRO_GRUPPE[gid]), mehr: liste.slice(MAX_PRO_GRUPPE[gid]) });
  }
  return { art: "treffer", eingabe: roh, gruppen, unbekannt, anzahl: behalten.length };
}
