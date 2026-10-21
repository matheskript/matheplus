/* ======================================================================
   Hub-Seiten für Google und KI (21.10.2026): Startseite, Trainingszentrum, Vision und die
   Bereichs-Übersichten Analysis · Vektoren · Stochastik. Jede Hub-Seite verlinkt alle Werkzeuge
   ihres Bereichs (Topic-Cluster). Reine Daten, Node-testbar; HTML baut src/seo/index.js.
   Nur echte Aussagen – keine Zahlen zu Nutzern, keine Stimmen, keine Siegel.
   ====================================================================== */
import { WERKZEUGE } from "../werkzeuge.js";
const N = Object.keys(WERKZEUGE).length;   // Zahl der Werkzeuge – nie als feste Zahl in die Texte schreiben

export const HUBS = {
  start: {
    pfad: "", ansicht: "start",
    titel: "Mythos Mathe – Mathe verstehen und üben, Klasse 5 bis Abitur",
    beschreibung: `Kostenlose Mathe-Lern-App fürs Gymnasium: ${N} interaktive Werkzeuge mit Rechenweg und sofortiger Rückmeldung, Mathilda AI prüft dein Blatt. Klasse 5 bis Abitur.`,
    h1: "Mathe kann jeder verstehen",
    kurz: `Mythos Mathe ist die kostenlose Lern-App und das Coaching von Basti Blumenröther aus Konstanz: ${N} interaktive Werkzeuge von Klasse 5 bis zum Abitur, jedes mit Rechenweg und sofortiger Rückmeldung.`,
    text: [
      "Mathetalent ist ein Mythos. Hinter guten Mathenoten steckt kein besonderes Gehirn, sondern eine Arbeitsweise: wie du denkst, wie du rechnest, wie du aufschreibst und wie du Gelerntes behältst. Mythos Mathe macht diese Arbeitsweise lernbar – mit Werkzeugen, die dir nicht die Lösung vorsagen, sondern dich selbst rechnen lassen und jeden Schritt prüfen.",
      "Die App hat drei Ebenen. Heute: dein Tagesplan mit fälligen Wiederholungen nach Ebbinghaus und deinen typischen Fehlern. Themen: alle Werkzeuge nach Bereich – Fundament, Funktionen und Kurven, Vektoren, Wahrscheinlichkeitsrechnung, Geometrie, Brüche, Gleichungen und die Unterstufe. Prüfung: Klassenarbeit und Abitur mit Uhr, Klausurgenerator, Abi-Ketten und Abi-Sätze.",
      "Jedes Werkzeug öffnet in einem von drei Modi. Entdecken: Regler, Live-Bild, ausprobieren. Rechnen: die App rechnet dir den Weg vor, Schritt für Schritt. Trainieren: du rechnest selbst, die App prüft deine Eingabe mathematisch, nicht als Text, und zeigt bei Fehlern den Rechenweg. Dazu kommt Mathilda AI: Du fotografierst dein Blatt, Mathilda prüft die Rechnung und die Schreibweise und zeigt dir die Stelle, an der dein Weg bricht.",
      "Die Inhalte folgen dem Bildungsplan Baden-Württemberg für das Gymnasium (G8 und G9) und lassen sich nach Klassenstufe sortieren. Alles läuft im Browser, ohne Installation. Die Werkzeuge sind kostenlos und ohne Anmeldung nutzbar; mit Konto wird der Lernstand auf allen Geräten gespeichert.",
    ],
    faq: [
      { f: "Ist Mythos Mathe kostenlos?", a: `Ja. Alle ${N} Werkzeuge, die Formelsammlung und die Kurse Pen & Paper und Unterstufe sind kostenlos und ohne Anmeldung nutzbar. Ein Konto braucht nur, wer seinen Lernstand auf mehreren Geräten speichern will.` },
      { f: "Für welche Klassen ist die App gedacht?", a: "Für das Gymnasium von Klasse 5 bis zum Abitur, mit Schwerpunkt auf Mittelstufe und Kursstufe. Die Stoffverteilung orientiert sich am Bildungsplan Baden-Württemberg, die Mathematik ist überall dieselbe." },
      { f: "Was unterscheidet Mythos Mathe von Nachhilfe?", a: "Die App ersetzt nicht das Rechnen, sie prüft es. Ihr Kind rechnet selbst, bekommt sofort Rückmeldung und sieht bei Fehlern den Rechenweg. Das Coaching von Basti Blumenröther baut auf derselben Arbeitsweise auf." },
    ],
    bereiche: "alle",
  },
  trainingszentrum: {
    pfad: "trainingszentrum", ansicht: "trainingszentrum",
    titel: `Mathe üben online: Trainingszentrum mit ${N} Werkzeugen`,
    beschreibung: `Mathe üben mit sofortiger Rückmeldung: Tagesplan mit Wiederholungen, alle ${N} Werkzeuge nach Bereich, Klassenarbeit und Abitur mit Uhr. Kostenlos.`,
    h1: "Trainingszentrum",
    kurz: "Das Trainingszentrum von Mythos Mathe ist der eine Ort für alles, was du selbst rechnest: Heute, Themen, Prüfung.",
    text: [
      "Heute zeigt dir deinen Tagesplan: fällige Wiederholungen nach dem Ebbinghaus-Rhythmus (Tag 0, 1, 3, 7, 14, 30), Aufgaben zu deinen Themen in Arbeit und Übungen zu den Fehlertypen, die bei dir öfter vorkommen. Dazu 5 Minuten Mathe zum Warmwerden – kurz, passend, ohne Druck.",
      `Themen listet alle ${N} Werkzeuge nach Bereich, vom Fundament über Funktionen und Kurven, Vektoren und Wahrscheinlichkeitsrechnung bis zur Geometrie, den Brüchen, Gleichungen und der Unterstufe. Mit dem Stufenfilter siehst du nur, was zu deiner Klasse passt. Jedes Werkzeug öffnet gleich bei der ersten Aufgabe.`,
      "Prüfung ist für den Ernstfall: Der Klausurgenerator stellt drei Aufgaben mit Uhr, Rückmeldung erst nach der Abgabe. Abi-Ketten führen eine Abituraufgabe durch mehrere Werkzeuge, Abi-Sätze haben Teil A ohne Hilfsmittel und Teil B mit Taschenrechner. Der Prüfungsmodus lässt dich Themen, Dauer und Schwierigkeit selbst wählen.",
    ],
    faq: [
      { f: "Wie funktioniert der Tagesplan?", a: "Er mischt fällige Wiederholungen, deine aktuellen Themen und Übungen zu deinen Fehlertypen – acht Einträge oder 10, 20 oder 30 Minuten. Ein Fehler zählt als Muster, wenn er dreimal an zwei Tagen vorkommt." },
      { f: "Brauche ich dafür ein Konto?", a: "Für die Werkzeuge nicht. Der Tagesplan braucht ein Konto, damit er auf jedem Gerät derselbe ist – zum Ausprobieren reicht der Test-Account mit einem Klick." },
      { f: "Kann mein Kind damit eine Klassenarbeit vorbereiten?", a: "Ja. Im Reiter Prüfung übt Ihr Kind unter Prüfungsbedingungen, mit Uhr und ohne Hilfen; die Rückmeldung mit Rechenweg kommt nach der Abgabe." },
    ],
    bereiche: "alle",
  },
  vision: {
    pfad: "vision", ansicht: "vision",
    titel: "Über Mythos Mathe: Basti Blumenröther und die Vision",
    beschreibung: "Wer hinter Mythos Mathe steht: Basti Blumenröther, Mathestudent in Konstanz, Preisträger im Landes- und Bundeswettbewerb Mathematik, Coach für Gymnasiasten.",
    h1: "Eine Generation, die Mathe versteht",
    kurz: "Mythos Mathe wurde von Basti Blumenröther gegründet: Mathestudium an der Universität Konstanz, langjährige Arbeit mit Schülern, mehrfacher Preisträger im Landes- und Bundeswettbewerb Mathematik.",
    text: [
      "Die Geschichte hinter Mythos Mathe beginnt mit einer Zwei. In den ersten drei Gymnasialjahren stand bei Basti Blumenröther in Mathe eine 2 – nicht schlecht, aber ohne Verständnis. Ab Klasse 8 änderte sich die Arbeitsweise, ab Klasse 10 stand eine 1,0. Was sich geändert hatte, war kein Talent, sondern ein System: verstehen statt auswendig lernen, sauber aufschreiben, regelmäßig wiederholen.",
      "Daraus wurde über Jahre ein Trainingsprogramm, das heute in der App steckt. Die drei Säulen: Pen & Paper (das Blatt als Arbeitsplatz des Denkens – ein Schritt pro Zeile, Gleichheitszeichen untereinander), Kopfrechnen (Zahlen, die einfach da sind) und die Haltung „Ich erwarte nicht, alles sofort zu verstehen. Ich erwarte von mir, präzise herauszufinden, was ich noch nicht verstehe.“",
      "Mythos Mathe sitzt in Konstanz am Bodensee. Das Coaching richtet sich an Gymnasiasten von Klasse 8 bis zum Abitur; die App steht allen offen.",
    ],
    faq: [
      { f: "Wer steht hinter Mythos Mathe?", a: "Basti Blumenröther: Mathestudium an der Universität Konstanz, langjährige Arbeit mit Schülern, Preisträger im Landeswettbewerb Mathematik Baden-Württemberg und im Bundeswettbewerb Mathematik, Sieger des Einzelwettbewerbs am Tag der Mathematik der Universität Konstanz." },
      { f: "Was bedeutet „Mathetalent ist ein Mythos“?", a: "Dass gute Mathenoten aus einer lernbaren Arbeitsweise entstehen, nicht aus Begabung. Die App und das Coaching bauen genau diese Arbeitsweise auf." },
      { f: "Wo findet das Coaching statt?", a: "In Konstanz am Bodensee. Die App ist von überall nutzbar." },
    ],
    bereiche: [],
  },
  analysis: {
    pfad: "analysis", ansicht: "analysis",
    titel: "Analysis üben: Ableitungen, Kurvendiskussion, Integrale",
    beschreibung: "Analysis für die Kursstufe online üben: Ableitungstrainer, Kurvendiskussion mit Rechenweg, Scharen, Steckbriefaufgaben, Integrale – kostenlos.",
    h1: "Analysis – Funktionen und Kurven",
    kurz: "Alle Analysis-Werkzeuge von Mythos Mathe an einem Ort: Funktionen kennen, untersuchen, bestimmen, integrieren – mit Rechenweg und sofortiger Rückmeldung.",
    text: [
      "Analysis ist das größte Gebiet im Mathe-Abitur. Die Werkzeuge folgen dem Weg, den auch der Unterricht geht: Zuerst lernst du die Funktionsklassen kennen (Grundlagen, Sinus, Wachstum und Logarithmen), dann untersuchst du sie (Ableitungstrainer, Kurvendiskussion, Funktionsscharen), bestimmst Funktionen aus Eigenschaften (Steckbriefaufgaben, Optimierungswerkstatt) und integrierst (Integraltrainer).",
      "Jedes Werkzeug prüft deine Eingabe mathematisch, nicht als Text: Eine gleichwertige Schreibweise zählt als richtig, ein falsches Ergebnis bekommt den Rechenweg mit der passenden Regel. Die Rechenwege enden nie auf einem unvereinfachten Ausdruck – so wie es in der Klausur zählt.",
      "Die Werkzeuge greifen ineinander: Aus einer Steckbriefaufgabe geht es mit der gefundenen Funktion direkt in die Kurvendiskussion, von dort in den Ableitungstrainer oder zu den Integralen.",
    ],
    faq: [
      { f: "Welche Ableitungsregeln kann ich üben?", a: "Potenz-, Faktor- und Summenregel sowie Produkt-, Quotienten- und Kettenregel – an Polynomen, Wurzeln, Brüchen, e-Funktionen und verketteten Funktionen, bis zur dritten Ableitung." },
      { f: "Zeigt die Kurvendiskussion den ganzen Rechenweg?", a: "Ja: Definitionsbereich, Symmetrie, Verhalten im Unendlichen, Nullstellen mit Polynomdivision, Ableitungen, Extrem- und Wendepunkte – für Polynome und beliebige Funktionen, als PDF speicherbar." },
      { f: "Passen die Aufgaben zum Abitur in Baden-Württemberg?", a: "Die Aufgabentypen folgen dem Bildungsplan der Kursstufe; die Abi-Ketten und Abi-Sätze im Prüfungsbereich üben zusätzlich das Format der Abiturprüfung." },
    ],
    bereiche: ["analysis"],
  },
  vektoren: {
    pfad: "vektoren", ansicht: "vektoren",
    titel: "Vektoren, Geraden und Ebenen üben: Rechner mit Rechenweg",
    beschreibung: "Vektorrechnung für die Kursstufe: Kreuzprodukt, Winkel, Geraden und Ebenen, Lagebeziehungen, Abstände – jeder Rechner mit Rechenweg und 3D-Bild.",
    h1: "Vektoren, Geraden und Ebenen",
    kurz: "Alle Vektor-Werkzeuge von Mythos Mathe: rechnen, Geraden und Ebenen aufstellen, Lage und Abstand – mit Rechenweg und drehbarem 3D-Bild.",
    text: [
      "Die analytische Geometrie lebt vom Bild im Kopf. Darum hat jedes Werkzeug ein 3D-Bild, das du mit Finger oder Maus drehst: Ebenen im Raum, Geraden im Raum, zwei Ebenen, Abstände. Die Rechnung steht daneben – Schritt für Schritt, in derselben Farbe wie das Objekt im Bild.",
      "Drei Stationen: Rechnen (Addition, Skalarprodukt, Kreuzprodukt, Winkel), Aufstellen (Gerade aus zwei Punkten, Ebene aus drei Punkten auf drei Wegen) und Lage und Abstand (Punktprobe, parallel, schneidend, windschief; Abstand Punkt–Ebene, Punkt–Gerade, Gerade–Gerade). Dazu die Gleichungssysteme mit drei Unbekannten nach Gauß.",
    ],
    faq: [
      { f: "Berechnet der Rechner auch den Abstand windschiefer Geraden?", a: "Ja, mit Rechenweg über den gemeinsamen Lotvektor – und jede andere Kombination aus Punkt, Gerade und Ebene." },
      { f: "Kann ich eigene Vektoren eingeben?", a: "Ja. Alle Rechner nehmen eigene Werte, auch Brüche und Wurzeln, und zeigen die Rechnung dazu; mit einem Tipp gibt es neue Beispiele." },
      { f: "Ist das Stoff der Kursstufe?", a: "Ja, Vektoren, Geraden und Ebenen gehören in Baden-Württemberg zur Kursstufe und sind Teil des Abiturs." },
    ],
    bereiche: ["vektoren"],
  },
  stochastik: {
    pfad: "stochastik", ansicht: "stochastik",
    titel: "Stochastik üben: Binomialverteilung, Hypothesentest, Baum",
    beschreibung: "Wahrscheinlichkeitsrechnung online üben: Kombinatorik, Vierfeldertafel, Erwartungswert, Bernoulli-Kette, Hypothesentests, Normalverteilung – mit Rechenweg.",
    h1: "Wahrscheinlichkeitsrechnung",
    kurz: "Alle Stochastik-Werkzeuge von Mythos Mathe: zählen, Zufallsgrößen, testen, Normalverteilung – mit Simulation und Rechenweg.",
    text: [
      "Stochastik beginnt mit dem Zählen (Urnen, Baumdiagramme, Vierfeldertafel), geht über Zufallsgrößen (Erwartungswert, faire Spiele, Bernoulli-Kette und Binomialverteilung) zum Testen (Hypothesentests mit Ablehnungsbereich und Fehlerarten) und endet bei der Normalverteilung mit Glockenkurve und Sigma-Regeln.",
      "Die Werkzeuge rechnen nicht nur, sie simulieren: Du ziehst Kugeln aus der Urne, wirfst Münzen in der Bernoulli-Kette und siehst, wie sich die Verteilung aufbaut. Die Rechnung dazu steht daneben – mit Summanden als Zahlen, nicht nur mit Formeln.",
    ],
    faq: [
      { f: "Gibt es die Binomialverteilung mit Tabelle?", a: "Ja. Die Bernoulli-Kette zeigt die Verteilung als Tabelle und als Balken, dazu Erwartungswert, Standardabweichung und die Sigma-Umgebung." },
      { f: "Wie finde ich den Ablehnungsbereich?", a: "Der Hypothesentest führt dich in drei Schritten: Test aufbauen, Ablehnungsbereich bestimmen, Fehler erster und zweiter Art verstehen – jeweils mit Rückmeldung." },
      { f: "Für welche Klassen ist die Stochastik gedacht?", a: "Urnen, Vierfeldertafel und Erwartungswert ab der Mittelstufe; Binomialverteilung, Hypothesentests und Normalverteilung in der Kursstufe." },
    ],
    bereiche: ["stochastik"],
  },
};

export const HUB_IDS = Object.keys(HUBS);
