/* ======================================================================
   BLOG – Bastis privater Mathe-Blog (Adresse /blog, Beiträge /blog/<slug>).
   Reine Daten, keine React-Importe (Node-testbar). Oberfläche: funcBlog.jsx.

   Ein Beitrag: slug (Pfad), titel, datum (ISO), kurz (eine Zeile für die
   Liste), motiv (Titelbild aus funcBlog.jsx: raster · tangente · pythagoras
   · wuerfel · pfeile · see), absaetze (ein Eintrag = ein Absatz).
   Neuer Beitrag: oben anhängen – die Liste zeigt die neuesten zuerst.
   Die sechs Texte hier sind Beispiele zum Austauschen.
   ====================================================================== */

export const BLOG = [
  {
    slug: "klausurzeit",
    titel: "Klausurzeit: drei Dinge, die mehr bringen als eine Nachtschicht",
    datum: "2026-10-18",
    kurz: "Warum die letzte Nacht vor der Klausur fast nie entscheidet – und was stattdessen zählt.",
    motiv: "see",
    absaetze: [
      "Jedes Jahr im Oktober dasselbe Bild: Die erste Klausur rückt näher, und plötzlich wird nachts gelernt. Ich habe das selbst gemacht, und ich habe es bei vielen Schülern gesehen. Es fühlt sich nach Einsatz an. Es bringt fast nichts.",
      "Erstens: Schreib eine Aufgabe jeder Art einmal komplett auf. Nicht lesen, nicht anschauen, nicht „im Kopf durchgehen“. Aufschreiben. Erst dabei merkst du, wo der Weg tatsächlich bricht.",
      "Zweitens: Schlaf. Das klingt wie ein Ratschlag aus der Frauenzeitschrift, aber die Rechnung ist einfach. Eine Klausur besteht zu einem großen Teil aus Dingen, die du schon kannst. Müde machst du genau dort Fehler.",
      "Drittens: Am Tag davor nur noch Fehler anschauen, die du schon einmal gemacht hast. Dein eigenes Fehlerheft ist die beste Formelsammlung, die es gibt. Alles andere ist Rauschen.",
      "Die Nachtschicht gibt dir das Gefühl, etwas getan zu haben. Die drei Dinge oben geben dir Punkte. Man muss sich entscheiden.",
    ],
  },
  {
    slug: "vektoren-sind-pfeile",
    titel: "Vektoren sind Pfeile. Mehr nicht.",
    datum: "2026-10-11",
    kurz: "Der halbe Schrecken der Vektorrechnung verschwindet, sobald man aufhört, Zahlenspalten zu sehen.",
    motiv: "pfeile",
    absaetze: [
      "Ich frage gern: „Was ist ein Vektor?“ Die häufigste Antwort: „Drei Zahlen untereinander.“ Das stimmt so, wie „ein Lied ist eine Reihe von Noten“ stimmt. Richtig, aber am Thema vorbei.",
      "Ein Vektor ist eine Verschiebung. Zwei Schritte nach rechts, einen nach vorn, drei nach oben. Wo du anfängst, ist egal. Deshalb sieht der Pfeil überall gleich aus, und deshalb darf man ihn verschieben, ohne dass sich etwas ändert.",
      "Sobald das sitzt, erklärt sich der Rest fast von allein. Vektoren addieren heißt: erst die eine Verschiebung, dann die andere. Ein Vektor mal drei heißt: dreimal dieselbe Verschiebung. Der Verbindungsvektor zweier Punkte heißt: Wie komme ich von A nach B?",
      "Die Zahlen sind nur die Buchführung. Wer zuerst den Pfeil sieht und dann die Zahlen, rechnet seltener an der Aufgabe vorbei. Wer nur die Zahlen sieht, rechnet oft richtig und weiß trotzdem nicht, was er getan hat.",
    ],
  },
  {
    slug: "erwartungswert",
    titel: "Was ein Würfelspiel über den Erwartungswert verrät",
    datum: "2026-10-04",
    kurz: "Ein Spiel, das sich lohnt, kann man trotzdem zehnmal hintereinander verlieren. Beides ist wahr.",
    motiv: "wuerfel",
    absaetze: [
      "Ein Spiel: Du zahlst 2 Euro, würfelst einmal und bekommst die Augenzahl in Euro zurück. Lohnt sich das? Die meisten sagen Bauchgefühl: „Kommt drauf an, was ich würfle.“ Der Erwartungswert sagt: 3,50 Euro Rückzahlung im Schnitt, also 1,50 Euro Gewinn pro Runde.",
      "Das Spannende ist nicht die Rechnung, sondern der Satz dahinter: Ein gutes Spiel kann man verlieren. Zehnmal hintereinander eine 1 ist unwahrscheinlich, aber möglich. Der Erwartungswert beschreibt nicht das nächste Ergebnis, sondern den Durchschnitt über viele Runden.",
      "Im Unterricht wird der Erwartungswert oft wie eine Formel behandelt: Summe aus Wert mal Wahrscheinlichkeit. Das ist er auch. Aber die Formel ist das Werkzeug, nicht die Einsicht. Die Einsicht ist: Entscheidungen bewertet man am Durchschnitt, Ergebnisse passieren einzeln.",
      "Wer das einmal verstanden hat, liest Stochastik-Aufgaben anders. Und, nebenbei, auch Nachrichten.",
    ],
  },
  {
    slug: "pythagoras-auf-der-serviette",
    titel: "Ein Beweis, der auf eine Serviette passt",
    datum: "2026-09-27",
    kurz: "Der Satz des Pythagoras ohne Formelsammlung: ein großes Quadrat, vier Dreiecke, fertig.",
    motiv: "pythagoras",
    absaetze: [
      "Ich halte wenig davon, den Satz des Pythagoras auswendig zu lernen. a² + b² = c² kann jeder aufsagen. Die Frage ist, ob man ihn glaubt. Und glauben tut man ihn, wenn man ihn einmal selbst gesehen hat.",
      "Nimm ein Quadrat mit der Seitenlänge a + b. Lege in jede Ecke ein rechtwinkliges Dreieck mit den Katheten a und b. In der Mitte bleibt ein schiefes Quadrat übrig; seine Seite ist die Hypotenuse c.",
      "Jetzt zwei Rechnungen für dieselbe Fläche. Einmal das große Quadrat: (a + b)² = a² + 2ab + b². Einmal die Teile: vier Dreiecke mit je ab/2, also 2ab, plus das innere Quadrat c². Gleichsetzen, 2ab auf beiden Seiten weg – es bleibt a² + b² = c².",
      "Das ist der ganze Beweis. Er passt auf eine Serviette, und er funktioniert für jedes rechtwinklige Dreieck, nicht nur für 3-4-5. Wer ihn einmal gezeichnet hat, vergisst den Satz nicht mehr. Wer ihn nur gelesen hat, schon.",
    ],
  },
  {
    slug: "ableitung-ist-eine-frage",
    titel: "Die Ableitung ist keine Formel, sondern eine Frage",
    datum: "2026-09-20",
    kurz: "Bevor du Regeln lernst, solltest du wissen, was du eigentlich wissen willst: Wie schnell ändert sich das gerade?",
    motiv: "tangente",
    absaetze: [
      "Potenzregel, Produktregel, Kettenregel – die meisten lernen die Ableitung als Satz von Regeln. Dann können sie f'(x) ausrechnen und wissen nicht, was sie da ausgerechnet haben. Das ist, als könnte man ein Wort buchstabieren, ohne es zu verstehen.",
      "Die Ableitung beantwortet eine einzige Frage: Wie schnell ändert sich etwas in genau diesem Moment? Bei einer Fahrt ist es die Geschwindigkeit. Bei einem Graphen ist es die Steigung der Tangente. Bei einem Preis ist es, wie stark er gerade anzieht.",
      "Der Weg dorthin ist ehrlich: Man nimmt zwei Punkte, berechnet die Steigung der Verbindungsgeraden, und schiebt die Punkte so nah zusammen, wie es geht. Was übrig bleibt, ist die Steigung in einem Punkt. Das ist der Differenzenquotient, und daraus wird die Ableitung.",
      "Erst wenn diese Frage sitzt, lohnen sich die Regeln. Dann sind sie Abkürzungen für etwas, das man verstanden hat. Vorher sind sie Zaubersprüche. Zaubersprüche vergisst man in der Klausur.",
    ],
  },
  {
    slug: "rechenpapier",
    titel: "Warum ich auf Karopapier denke",
    datum: "2026-09-12",
    kurz: "Ein Schritt pro Zeile, Gleichheitszeichen untereinander. Klingt pedantisch, spart Punkte.",
    motiv: "raster",
    absaetze: [
      "Die meisten Fehler, die ich in Klausuren sehe, sind keine Denkfehler. Es sind Schreibfehler. Ein Minus, das beim Umstellen verloren geht. Eine Klammer, die in der zweiten Zeile fehlt. Ein Ergebnis, das mitten in der Rechnung steht und dann nicht mehr gefunden wird.",
      "Deshalb arbeite ich seit Jahren mit einer einfachen Regel: ein Schritt pro Zeile, die Gleichheitszeichen untereinander. Das Blatt wird dadurch zu einer Spur, der man folgen kann – man selbst und der Lehrer, der die Punkte vergibt.",
      "Karopapier hilft dabei mehr, als man denkt. Die Kästchen geben den Zeilen einen Takt. Brüche bekommen ihre Höhe, Exponenten ihren Platz, und man merkt sofort, wenn eine Zeile zu voll wird. Zu voll heißt fast immer: zwei Schritte auf einmal.",
      "Es gibt Schüler, die das für Kleinkram halten. Ich verstehe das. Aber ich habe noch niemanden gesehen, der sauber schreibt und trotzdem schlecht rechnet. Umgekehrt dagegen ständig.",
    ],
  },
];

export const beitragVon = (slug) => BLOG.find((b) => b.slug === slug) || null;
export const istBlogBeitrag = (slug) => typeof slug === "string" && BLOG.some((b) => b.slug === slug);

/* Der nächste (ältere) Beitrag in der Liste oder null */
export function naechsterBeitrag(slug) {
  const i = BLOG.findIndex((b) => b.slug === slug);
  return i >= 0 && i < BLOG.length - 1 ? BLOG[i + 1] : null;
}

const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
/* "2026-10-18" → "18. Oktober 2026" */
export function datumLang(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  if (!m) return String(iso || "");
  return `${Number(m[3])}. ${MONATE[Number(m[2]) - 1]} ${m[1]}`;
}

/* Lesezeit in Minuten (grob: 200 Wörter pro Minute, mindestens 1) */
export function lesezeit(beitrag) {
  const woerter = (beitrag.absaetze || []).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}
