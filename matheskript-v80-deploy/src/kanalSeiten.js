/* ======================================================================
   KANAL-LANDINGPAGES – reine Daten (Node-testbar, keine React-Importe).

   Fünf Seiten, eine Vorlage (src/funcKanalSeite.jsx). Jede Seite gehört zu
   genau einem Werbekanal und einer Zielgruppe und verkauft genau einen
   nächsten Schritt. Text nach dem Blockbuster-StorySkript (Christiani):
   Held → Problem → Mentor → Lösung → Reise, jeder Schritt mit drei Punkten.

     /poster      Plakat in und um Schulen (QR)        → Schüler, du
     /thema       YouTube-Anzeige vor Lösungsvideos    → Schüler Oberstufe, du
     /insta       Instagram, Link in der Bio           → Schüler, du
     /eltern      Google-Suche „Mathe Nachhilfe …“     → Eltern, Sie
     /abi-eltern  LinkedIn, Bastis Posts               → Unternehmer-Eltern, Sie

   Kanal-Kennung: jede Seite trägt ihre id als `via`; ein ?via=… in der Adresse
   (z. B. ?via=poster-gym1 je Schule) überschreibt sie. Die Kennung wird in der
   Sitzung gemerkt und bei jedem Ereignis mitgezählt (supabase/kanal.sql).

   Schalter: ANGEBOT.kanalseiten (angebot.js). Solange er aus ist, führen die
   Pfade auf die Startseite; mit dem Passwort „skript“ bleiben sie offen.
   Öffentlich ohne Seitenpasswort werden sie erst mit SEITEN_SCHUTZ=aus
   (middleware.js) oder einem Eintrag der Pfade in OEFFENTLICH dort.
   ====================================================================== */

/* Preise: Vorschlag aus dem Businessplan vom 20.10.2026, von Basti NICHT bestätigt.
   Solange PREISE_ANZEIGEN false ist, steht auf den Seiten „Preis und Laufzeit im Gespräch“. */
export const PREISE_ANZEIGEN = false;
export const PREISE = {
  plus: "14,90 €/Monat · Familie 19,90 €",
  themenkurs: "99 €",
  checken: "597 €",
  masterclass: "2.497 €",
  masterclassEins: "+1.500 €",
  elternabend: "27 €",
};
export const preisText = (schluessel, anzeigen = PREISE_ANZEIGEN) => (anzeigen ? PREISE[schluessel] || "" : "");

export const KANAL_ANSICHT = "kanal";
export const VIA_KEY = "mm-via";
export const KLAUSUR_VORBELEGT_KEY = "mm-klausur-vorbelegt";   // Poster-Seite → Klausur-Planer (func9.jsx liest es einmal)
export const SERIE_KEY = "mm-kanal-serie";                     // Instagram-Seite: Stand der 7-Tage-Serie (nur dieses Gerät)

/* Die 7-Tage-Serie der Instagram-Seite: ein Grund pro Tag (die sieben Mythen aus func2.jsx, gleiche Reihenfolge)
   und eine Übung von etwa zehn Minuten in der App. `ziel` = Eintrag für gehe(). */
export const SERIE = [
  { tag: 1, mythos: "Mathe ist Talent", kurz: "Es gibt kein Mathe-Gen. Gute Noten entstehen aus Methode, Wiederholung und Übung.", uebung: "Pen & Paper, Stufe 0: zehn Minuten sehen, wie ein Rechenweg aussieht, der dich trägt.", knopf: "Stufe 0 öffnen", ziel: { ansicht: "penpaperkurs" } },
  { tag: 2, mythos: "Ich bin kein Mathe-Typ", kurz: "Der Satz beschreibt einen Zustand, kein Urteil. „Ich verstehe das noch nicht“ stimmt – „ich kann das nicht“ nie.", uebung: "Mathe entdecken, Einstieg: zehn Minuten Mathe ohne Note und ohne Zeitdruck.", knopf: "Einstieg öffnen", ziel: { ansicht: "entdecken", seite: "einstieg" } },
  { tag: 3, mythos: "Gute Schüler rechnen schnell", kurz: "Tempo ist ein Ergebnis von Sicherheit, nicht ihre Ursache.", uebung: "Kopfrechnen: eine Runde Einmaleins und Quadratzahlen – langsam und fehlerfrei zählt.", knopf: "Kopfrechnen öffnen", ziel: { ansicht: "headnumbers" } },
  { tag: 4, mythos: "Fehler zeigen, dass ich es nicht kann", kurz: "Fehler sind Information. Sie zeigen genau die Stelle, an der der Weg bricht.", uebung: "Rechne eine Aufgabe aus der Schule auf ein weißes Blatt und lass Mathilda den Rechenweg prüfen.", knopf: "Blatt prüfen lassen", ziel: { ansicht: "analyse", foto: "blatt" } },
  { tag: 5, mythos: "Wenn ich die Lösung verstehe, kann ich es", kurz: "Verstanden ist eine Aufgabe erst, wenn du sie ein paar Tage später ohne Hilfe löst.", uebung: "Gleichungen lösen: du formst um, die App rechnet mit – drei Aufgaben ohne Musterlösung.", knopf: "Gleichungen öffnen", ziel: { ansicht: "gleichungen" } },
  { tag: 6, mythos: "Viel auf einmal üben bringt am meisten", kurz: "Das Gehirn behält, was im richtigen Abstand wiederkommt. Kurz und regelmäßig schlägt den Marathon.", uebung: "Ebbinghaus: trag ein, was du diese Woche hattest, und lass dir den Wiederholungsplan zeigen.", knopf: "Wiederholen öffnen", ziel: { ansicht: "ebbinghaus" } },
  { tag: 7, mythos: "Im Kopf rechnen ist besser als aufschreiben", kurz: "Der Kopf hat wenig Arbeitsspeicher. Ein klarer Rechenweg auf dem Papier entlastet ihn und macht Fehler sichtbar.", uebung: "Pen & Paper, Stufe 1: eine Aufgabe sauber abschreiben – so, dass jemand anderes sie lesen kann.", knopf: "Stufe 1 öffnen", ziel: { ansicht: "penpaperkurs" } },
];

/* Erstgespräch-Formular (Eltern-Seiten): Klassenstufen */
export const KLASSEN_WAHL = ["Klasse 8", "Klasse 9", "Klasse 10", "Klasse 11", "Klasse 12", "Klasse 13 / Abi"];

/* ---------------------------------------------------------------- die fünf Seiten */
export const KANAL_SEITEN = [
  /* ═══ 1 · Poster → Schüler ═══ */
  {
    id: "poster", pfad: "poster", alias: ["plakat", "schule"], name: "Poster → Schüler",
    kanal: "Plakat in und um Schulen (QR-Code)", zielgruppe: "schueler", du: true, einstieg: "klausur",
    titel: "Kein Mathe-Typ? Gibt's nicht. – Mythos Mathe",
    kicker: "Für Gymnasiasten von Klasse 8 bis zum Abitur",
    h1: ["Kein Mathe-Typ? ", "Gibt's nicht."],
    lead: "Mathe kann jeder verstehen. Trag deine nächste Klausur ein – du bekommst einen Plan bis dahin. Kostenlos, ohne Konto, in einer Minute.",
    knopfDirekt: "Nächste Klausur eintragen", knopfUnter: "Kostenlos · ohne Konto · Plan bleibt auf deinem Handy",
    knopfUebergang: { text: "Erst ein Werkzeug ausprobieren", ziel: { ansicht: "penpaperkurs" } },
    vertrauen: [["Klasse 8 bis Abi", "Gymnasium, Schwerpunkt Oberstufe"], ["Uni Konstanz", "Mathestudium und seit Jahren Mathe-Coach"], ["15 Minuten am Tag", "Nach Plan, nicht am Abend vorher"], ["Kostenlos", "Planer, Trainer und Testklausur ohne Anmeldung"]],
    held: { identitaet: "Du hast das Plakat im Schulflur gesehen. Die nächste Mathe-Klausur ist in ein bis drei Wochen.", wunsch: "Diesmal mit einem Plan reingehen statt am Abend vorher alles auf einmal.", einsatz: "Die nächste Note – und die Diskussion zu Hause, wenn sie wieder schlecht wird." },
    problem: {
      kicker: "Kennst du das?", h2: ["Drei Wochen Stoff, ", "kein Anfang in Sicht."],
      text: "Du weißt, dass die Klausur kommt. Du weißt nicht, womit du anfangen sollst. Also fängst du am Abend vorher an. Das Problem hat drei Ebenen – die dritte ist die wichtigste.",
      ebenen: [
        { nr: "Auf dem Blatt", zitat: "Ich weiß nicht, wo ich anfangen soll.", text: "Drei Wochen Stoff, ein halb vollständiger Hefteintrag und kein Plan, was davon in der Klausur drankommt." },
        { nr: "Im Kopf", zitat: "Ich bin halt kein Mathe-Typ.", text: "Der Satz kommt vor jeder Aufgabe. Er nimmt dir die Lust, überhaupt anzufangen – und erklärt jede schlechte Note im Voraus." },
        { nr: "Der eigentliche Gegner", zitat: "Mathe ist Talent.", gegner: true, text: "Das ist der Mythos, der auf dem Plakat durchgestrichen ist. Er sagt, dass es an dir liegt. Dabei hat dir nur nie jemand gezeigt, wie man Mathe lernt." },
      ],
    },
    mentor: {
      kicker: "Wer dir das sagt", h2: ["Ich war der mit der ", "2."],
      text: "Note 2 in den ersten drei Jahren am Gymnasium – nicht schlecht, aber nie sicher. Ab Klasse 8 habe ich anders gelernt. Ab Klasse 10 stand eine 1,0, und sie blieb bis zum Abi. Kein Talent, ein System.",
      belege: [["Mathematik an der Uni Konstanz", "Ich studiere das Fach selbst und begleite seit Jahren Schüler von der Mittelstufe bis zum Abi."], ["Ein System, das man anfassen kann", "Planer, Trainer, Testklausuren und Mathilda, die deinen Rechenweg prüft – alles in der App."], ["Keine Abkürzung", "Ich verspreche dir keinen Trick. Ich verspreche dir, dass 15 Minuten am Tag nach Plan mehr bringen als vier Stunden am Abend vorher."]],
      haltung: "Talent ist ein Mythos. Das System lernt jeder, der täglich 15 Minuten gibt. Der Plan ist meine Sache – die 15 Minuten sind deine.",
    },
    plan: {
      kicker: "Dein Plan", h2: ["In drei Schritten ", "sicher in die Klausur."],
      schritte: [["Klausur eintragen", "Datum und Thema – mehr braucht der Planer nicht. Er rechnet rückwärts: erst die Lücken darunter, dann der Stoff der Klausur."], ["Täglich 15 Minuten nach Plan", "Jeden Tag eine kleine Aufgabe aus dem Plan. Kein Marathon, keine Nachtschicht."], ["Am Tag vorher eine Testklausur", "Eine Probeklausur zu deinem Thema. Was danebengeht, übst du am letzten Tag noch einmal – sonst nichts."]],
      versprechen: ["Der Planer ist kostenlos und braucht kein Konto.", "Der Plan bleibt auf deinem Handy – ein Konto nur, wenn du ihn behalten willst.", "Du siehst jeden Tag genau eine Aufgabe, nicht den ganzen Berg."],
    },
    angebote: {
      kicker: "Nach der Klausur", h2: ["Wenn du dranbleiben willst."],
      text: "Den Planer, die Trainer und die Testklausuren bekommst du kostenlos. Wer nach der ersten Klausur weitermachen will, bekommt mit Mythos Mathe Plus das ganze System.",
      karten: [
        { dauer: "Kostenlos", name: "Klausur-Planer, Trainer, Testklausur", text: "Alles, was du für die nächste Klausur brauchst – ohne Konto.", punkte: ["Rückwärtsplan bis zur Klausur", "Trainer zu jedem Thema von Klasse 8 bis Abi", "Testklausur zum Kapitel mit Lösungen"], knopf: "Klausur eintragen", aktion: "einstieg" },
        { dauer: "Danach", name: "Mythos Mathe Plus", preis: "plus", text: "Mathilda prüft deinen Rechenweg, Mein Training plant jeden Tag, Testklausuren und Videokurse sind drin. Deine Eltern buchen es über das Elternkonto.", punkte: ["Mathilda AI: Foto vom Blatt, Rückmeldung zum Rechenweg", "Mein Training: Tagesplan mit Erinnerung", "Testklausuren und Videokurse"], knopf: "Mehr zu Plus", ziel: { ansicht: "konto" }, hervor: true },
      ],
    },
    wege: { erfolg: ["Du gehst in die Klausur und weißt, was drankommt.", "Du hast 15 Minuten am Tag investiert, nicht einen Abend.", "Die Note ist das Ergebnis eines Plans, nicht des Zufalls."], scheitern: ["Wieder der Abend vorher, wieder alles auf einmal.", "Die Lücke wächst mit ins nächste Halbjahr.", "Der Satz „kein Mathe-Typ“ bekommt wieder recht."] },
    elternWeiche: { h3: "Deine Eltern fragen, was das ist?", text: "Schick ihnen diese Seite. Dort steht in Ruhe, wer dahintersteckt, was es kostet und wie ein Erstgespräch abläuft.", nachricht: "Hallo! Ich hab einen Plan für meine nächste Mathe-Klausur gemacht, bei Mythos Mathe. Schau mal: " },
    fragen: [["Brauche ich ein Konto?", "Nein. Der Planer läuft ohne Konto, der Plan bleibt auf deinem Handy. Ein Konto brauchst du nur, wenn du den Plan auf mehreren Geräten haben oder Erinnerungen bekommen willst."], ["Was kostet das?", "Der Planer, die Trainer und die Testklausuren sind kostenlos. Mythos Mathe Plus kommt erst nach der ersten Klausur ins Spiel – und nur, wenn du willst."], ["Was, wenn meine Klausur in drei Tagen ist?", "Dann plant der Planer drei Tage: Stoff der Klausur, Testklausur, Fehler nacharbeiten. Besser als nichts – und beim nächsten Mal trägst du sie früher ein."], ["Ist das Nachhilfe?", "Nein. Niemand erklärt dir den Stoff der nächsten Klausur. Du bekommst einen Plan und Werkzeuge, mit denen du es selbst verstehst – und beim nächsten Thema wieder."]],
    abschluss: { h2: ["Die nächste Klausur kommt sowieso. ", "Diesmal mit Plan."], text: "Datum und Thema eintragen, 15 Minuten am Tag, Testklausur am Tag vorher." },
  },

  /* ═══ 2 · YouTube-Anzeige → Schüler Oberstufe ═══ */
  {
    id: "thema", pfad: "thema", alias: ["youtube", "ableitungen-verstehen"], name: "YouTube → Schüler (Thema)",
    kanal: "YouTube-Anzeige vor Lösungsvideos zu einem Thema", zielgruppe: "schueler", du: true, einstieg: "kapitel",
    titel: "Ableitungen verstehen – nicht nur eine Aufgabe – Mythos Mathe",
    kicker: "Für die Oberstufe · Thema Ableitungen",
    h1: ["Nach Video 3 immer noch unsicher? ", "Dir fehlt kein Video."],
    lead: "Dir fehlt das System dahinter. Jedes Video erklärt eine Aufgabe – keines den Zusammenhang. Kapitel 1 liest du in 20 Minuten, kostenlos, ohne Konto.",
    knopfDirekt: "Kapitel 1 lesen", knopfUnter: "20 Minuten · kostenlos · ohne Konto",
    knopfUebergang: { text: "Nur den Trainer ausprobieren", ziel: { ansicht: "ableitungstrainer" } },
    vertrauen: [["Oberstufe bis Abi", "Analysis, Vektoren, Stochastik"], ["Eigenes Schulbuch", "Jedes Kapitel wie eine Unterrichtsstunde"], ["Trainer zu jedem Kapitel", "Mit vollständigem Rechenweg bei Fehlern"], ["Testklausur", "Zum Kapitel, mit Lösungen"]],
    held: { identitaet: "Du bist in der Oberstufe, die Klausur oder das Abi zum Thema ist in Sicht, und du schaust gerade Lösungsvideos.", wunsch: "Das Thema einmal von vorn bis hinten verstehen – nicht nur diese eine Aufgabe.", einsatz: "Klausurnote, Abi-Schnitt, Studienwahl." },
    problem: {
      kicker: "Kennst du das?", h2: ["Jedes Video erklärt eine Aufgabe. ", "Keines den Zusammenhang."],
      text: "Du verstehst das Video. Du verstehst die nächste Aufgabe trotzdem nicht. Also das nächste Video. Das Problem hat drei Ebenen – die dritte ist die wichtigste.",
      ebenen: [
        { nr: "Auf dem Blatt", zitat: "Im Video ging's, bei mir nicht.", text: "Jedes Video löst eine Aufgabe. Woher die Regel kommt, wann sie gilt und wie du sie selbst erkennst, steht in keinem. Dein Hefteintrag hat genau diese Lücken." },
        { nr: "Im Kopf", zitat: "Alle checken's, nur ich nicht.", text: "Die anderen schauen weniger Videos und schreiben bessere Klausuren. Das fühlt sich an wie ein Urteil – ist aber nur ein Hinweis, dass die Methode nicht stimmt." },
        { nr: "Der eigentliche Gegner", zitat: "Noch ein Video, dann klickt's.", gegner: true, text: "Das ist der kleine Bruder des Mythos „Mathe ist Talent“. Beide sagen: Es liegt an dir. Dabei liegt es am fehlenden System – und das ist lernbar." },
      ],
    },
    mentor: {
      kicker: "Wer dir das sagt", h2: ["Ich habe genau so ", "Videos geschaut."],
      text: "Bis ich das System hatte. Ab Klasse 8 habe ich anders gelernt, ab Klasse 10 stand eine 1,0. Heute studiere ich Mathematik an der Uni Konstanz und habe das Schulbuch zu diesem Thema selbst geschrieben.",
      belege: [["Ein Schulbuch zu genau diesem Thema", "Band „Ableitungen“: jedes Unterkapitel wie eine Unterrichtsstunde – Herleitung, Beispiel, Aufgaben mit Lösungen."], ["Trainer zu jedem Kapitel", "Du rechnest, die App prüft und zeigt bei Fehlern den vollständigen Rechenweg."], ["Mathematik an der Uni Konstanz", "Ich studiere das Fach selbst und begleite seit Jahren Schüler bis zum Abi."]],
      haltung: "Verstehen ist Arbeit nach System, kein Glück. Das System ist meine Sache – das Rechnen bleibt deine.",
    },
    plan: {
      kicker: "Dein Plan", h2: ["In drei Schritten ", "vom Video zum Verstehen."],
      schritte: [["Kapitel lesen", "20 Minuten. Du siehst, woher die Regel kommt und wann sie gilt – nicht nur, wie man sie anwendet."], ["Trainer bis fehlerfrei", "Aufgaben desselben Typs, bis du den Weg ohne Nachschauen gehst. Bei Fehlern steht der ganze Rechenweg da."], ["Testklausur zum Kapitel", "Eine Klausur zum Kapitel, wie in der Schule. Was danebengeht, übst du gezielt nach."]],
      versprechen: ["Kapitel 1 ist komplett kostenlos und braucht kein Konto.", "Preis und Umfang des Kurses stehen vor dem Kauf – keine Überraschung danach.", "Den Trainer kannst du auch ohne Kurs benutzen."],
    },
    angebote: {
      kicker: "Der Kurs", h2: ["Das ganze Thema, ", "nicht nur Kapitel 1."],
      text: "Kapitel 1 ist frei. Der Themenkurs schaltet alle Kapitel frei – mit Trainern und Testklausuren zu jedem.",
      karten: [
        { dauer: "Themenkurs", name: "Differentialrechnung", preis: "themenkurs", text: "Alle Kapitel des Bandes „Ableitungen“ als Lesekurs in der App, dazu die Trainer und die Testklausuren zu jedem Kapitel.", punkte: ["Jedes Kapitel wie eine Unterrichtsstunde", "Trainer mit vollständigem Rechenweg", "Testklausur zu jedem Kapitel", "Von den Eltern zahlen lassen: Link weiterleiten"], knopf: "Kapitel 1 lesen", aktion: "einstieg", hervor: true },
        { dauer: "Alle Themen", name: "Mythos Mathe Plus", preis: "plus", text: "Alle Kurse, Mathilda AI für deinen Rechenweg, Mein Training mit Tagesplan.", punkte: ["Alle Themenkurse", "Mathilda AI prüft dein Blatt", "Tagesplan bis zur Klausur"], knopf: "Mehr zu Plus", ziel: { ansicht: "konto" } },
      ],
      hinweis: "Weitere Themenkurse (Vektoren, Kurvendiskussion) sind in Arbeit; die Seite zeigt immer den Kurs zum Thema der Anzeige.",
    },
    wege: { erfolg: ["Du erkennst den Aufgabentyp und weißt den Weg.", "Du brauchst kein Video mehr für die nächste Aufgabe.", "Die Klausur prüft, was du verstanden hast – nicht, was du gesehen hast."], scheitern: ["Video 4, 5, 6 – dieselbe Lücke.", "Die Klausur kommt trotzdem.", "Im Abi baut das nächste Thema auf dieser Lücke auf."] },
    elternWeiche: { h3: "Deine Eltern sollen den Kurs zahlen?", text: "Schick ihnen diese Seite. Dort steht, wer dahintersteckt, was es kostet und wie ein Erstgespräch abläuft.", nachricht: "Hallo! Ich lerne gerade Ableitungen mit Mythos Mathe – hier ist die Seite für Eltern: " },
    fragen: [["Ist Kapitel 1 wirklich kostenlos?", "Ja, komplett, ohne Konto. Der Kurs schaltet die weiteren Kapitel frei."], ["Für welche Klasse ist das?", "Für die Oberstufe (Klasse 11 bis Abi) und für Klasse 10, wo Ableitungen beginnen. Das Buch erklärt von vorn – Vorwissen aus Klasse 9 reicht."], ["Was, wenn mein Thema ein anderes ist?", "Dann ist die Seite noch nicht für dich gebaut. Die Trainer der App gibt es trotzdem zu fast jedem Thema – kostenlos."], ["Ist das Nachhilfe?", "Nein. Niemand rechnet dir die Aufgabe vor. Du bekommst das Kapitel, den Trainer und die Testklausur – und verstehst es selbst."]],
    abschluss: { h2: ["Das vierte Video bringt nichts. ", "Kapitel 1 schon."], text: "20 Minuten lesen, dann rechnen. Kostenlos, ohne Konto." },
  },

  /* ═══ 3 · Instagram → Schüler ═══ */
  {
    id: "insta", pfad: "insta", alias: ["bio", "instagram", "7-gruende"], name: "Instagram → Schüler",
    kanal: "Instagram, Link in der Bio", zielgruppe: "schueler", du: true, einstieg: "serie",
    titel: "Die 7 Gründe, warum du bisher schlecht in Mathe warst – Mythos Mathe",
    kicker: "Von Instagram hierher? Willkommen.",
    h1: ["Die 7 Gründe, warum du bisher ", "schlecht in Mathe warst."],
    lead: "Keiner davon heißt Talent. Sieben Tage, ein Grund pro Tag, zehn Minuten Übung. Kostenlos, ohne Konto – der Stand bleibt auf deinem Handy.",
    knopfDirekt: "7-Tage-Serie starten", knopfUnter: "Kostenlos · ohne Konto · zehn Minuten am Tag",
    knopfUebergang: { text: "Pen-&-Paper-Kurs ansehen", ziel: { ansicht: "penpaperkurs" } },
    vertrauen: [["Klasse 8 bis Abi", "Gymnasium, Schwerpunkt Oberstufe"], ["Uni Konstanz", "Mathestudium und seit Jahren Mathe-Coach"], ["7 Tage", "Ein Grund pro Tag, zehn Minuten Übung"], ["Kostenlos", "Serie und Pen & Paper ohne Anmeldung"]],
    held: { identitaet: "Du folgst Mythos Mathe auf Instagram, Klasse 8 bis 13, und hast drei Reels gesehen.", wunsch: "Zum ersten Mal denkst du: Vielleicht bin ich doch nicht zu dumm dafür. Du willst Ruhe mit dem Fach – verstehen statt auswendig lernen.", einsatz: "Versetzung oder Abi – und das Bild, das du von dir selbst hast." },
    problem: {
      kicker: "Kennst du das?", h2: ["Lücken seit Jahren. ", "Und ein Satz, der sie erklärt."],
      text: "Nachhilfe hat kurz geholfen und dann nicht mehr. Irgendwann hast du beschlossen, dass Mathe nicht deins ist. Das Problem hat drei Ebenen – die dritte ist die wichtigste.",
      ebenen: [
        { nr: "Auf dem Blatt", zitat: "Das hatten wir schon mal, oder?", text: "Lücken aus Klasse 8 tauchen in Klasse 10 wieder auf. Jede Nachhilfestunde hat ein Loch gestopft und zwei andere übersehen." },
        { nr: "Im Kopf", zitat: "Mathe ist einfach nicht meins.", text: "Scham beim Abfragen, der Blick auf die Note, das Gefühl, dass alle anderen etwas wissen, das dir fehlt." },
        { nr: "Der eigentliche Gegner", zitat: "Mathe ist Talent.", gegner: true, text: "Das ist Grund 1 von 7 – und der Vater der anderen sechs. Jeder dieser Gründe ist ein Mythos, keine Schuld. Und jeder lässt sich an einem Tag abräumen." },
      ],
    },
    mentor: {
      kicker: "Wer dir das sagt", h2: ["Ich war der mit der ", "2."],
      text: "Note 2 in den ersten drei Jahren am Gymnasium. Ab Klasse 8 habe ich anders gelernt, ab Klasse 10 stand eine 1,0. Danach fünf Jahre Arbeit an der Frage, welche Stellschrauben das waren – daraus ist Mythos Mathe geworden.",
      belege: [["Mathematik an der Uni Konstanz", "Ich studiere das Fach selbst und begleite seit Jahren Schüler von der Mittelstufe bis zum Abi."], ["Die App", "Pen & Paper, Kopfrechnen, Ebbinghaus, Mathilda – jede Stellschraube gibt es als Werkzeug, kostenlos."], ["Die Schulbücher", "Eigene Bände zu Ableitungen und Vektoren, jedes Kapitel wie eine Unterrichtsstunde."]],
      haltung: "Kein Trick. Zehn Minuten am Tag – und die machst du. Ich zeige dir, welche.",
    },
    plan: {
      kicker: "Dein Plan", h2: ["In drei Schritten ", "raus aus dem Mythos."],
      schritte: [["Sieben Tage, sieben Gründe", "Jeden Tag ein Grund und eine Übung von zehn Minuten in der App. Nach sieben Tagen weißt du, warum es bisher nicht lief."], ["Pen & Paper, Stufe 0 bis 2", "Sauber aufschreiben, strukturiert rechnen, Fehler selbst finden. Der kostenlose Einstieg ins System."], ["Standort bestimmen", "Im Erstgespräch mit deinen Eltern schauen wir, wo du stehst und welcher Weg passt – Programm oder erst einmal die Werkzeuge."]],
      versprechen: ["Serie und Pen & Paper sind kostenlos, ohne Abo, ohne Konto.", "Das Erstgespräch ist kostenlos und unverbindlich.", "Jedes Programm hat eine klare Laufzeit und ein klares Ziel."],
    },
    angebote: {
      kicker: "Nach Tag 7", h2: ["Wenn du mehr willst ", "als Werkzeuge."],
      text: "Die Serie und die Werkzeuge gehören dir. Wer das System mit Begleitung durcharbeiten will, bekommt zwei Wege.",
      karten: [
        { dauer: "8 Wochen · Einstieg", name: "Mathe checken", preis: "checken", text: "Acht Wochen Lücken schließen – mit wöchentlichem Zoom, Trainingsplan und Mathilda für deinen Rechenweg. Gebucht wird über deine Eltern.", punkte: ["Standortbestimmung: Wo genau hakt es?", "Wöchentlicher Zoom-Call", "Trainingsplan mit täglicher Aufgabe", "Rückmeldung zu deinem Rechenweg"], knopf: "Erstgespräch mit deinen Eltern", aktion: "eltern", hervor: true },
        { dauer: "Allein weiter", name: "Mythos Mathe Plus", preis: "plus", text: "Mathilda AI, Mein Training mit Tagesplan, Testklausuren und Videokurse – ohne Gespräch, direkt in der App.", punkte: ["Mathilda AI prüft dein Blatt", "Tagesplan mit Erinnerung", "Testklausuren und Videokurse"], knopf: "Mehr zu Plus", ziel: { ansicht: "konto" } },
      ],
    },
    wege: { erfolg: ["Nach sieben Tagen weißt du, warum es bisher nicht lief – und was du anders machst.", "Du schreibst Rechenwege, in denen du deine Fehler selbst findest.", "Mathe wird ein Fach wie jedes andere: lernbar."], scheitern: ["Nächstes Schuljahr, dieselben Lücken.", "Mehr Druck, weniger Lust.", "Der Satz „nicht meins“ bekommt wieder recht."] },
    elternWeiche: { h3: "Deine Eltern fragen, was das ist?", text: "Schick ihnen diese Seite. Dort steht in Ruhe, wer dahintersteckt, was es kostet und wie ein Erstgespräch abläuft.", nachricht: "Hallo! Ich mache gerade die 7-Tage-Serie von Mythos Mathe. Hier ist die Seite für Eltern: " },
    fragen: [["Brauche ich ein Konto für die Serie?", "Nein. Der Stand bleibt auf deinem Handy. Mit Konto kannst du ihn auf mehreren Geräten sehen – musst du aber nicht."], ["Was, wenn ich einen Tag auslasse?", "Nichts. Die Serie schaltet pro Tag einen Grund frei; ein ausgelassener Tag wartet auf dich."], ["Was kostet das?", "Serie, Pen & Paper und die Werkzeuge: nichts. Die Programme haben einen Preis, den klären wir im Erstgespräch mit deinen Eltern."], ["Ist das Nachhilfe?", "Nein. Nachhilfe erklärt den Stoff der nächsten Klausur. Hier lernst du, wie man Mathe lernt – damit du den Stoff danach selbst verstehst."]],
    abschluss: { h2: ["Tag 1 dauert ", "zehn Minuten."], text: "Ein Grund, eine Übung. Morgen der nächste." },
  },

  /* ═══ 4 · Google-Suche → Eltern ═══ */
  {
    id: "eltern", pfad: "eltern", alias: ["nachhilfe", "mathe-nachhilfe", "mathe-nachhilfe-konstanz", "fuer-eltern"], name: "Google → Eltern",
    kanal: "Google-Suche nach „Mathe Nachhilfe Konstanz“ u. Ä.", zielgruppe: "eltern", du: false, einstieg: "gespraech",
    titel: "Mathe-Nachhilfe in Konstanz? Ein System statt Nachhilfe – Mythos Mathe",
    kicker: "Für Eltern von Gymnasiasten · Konstanz, Bodensee und online",
    h1: ["Mathe-Nachhilfe in Konstanz? ", "Ihr Kind braucht ein System."],
    lead: "Keinen Nachhilfelehrer, der den Stoff der nächsten Klausur erklärt – sondern eine Arbeitsweise, mit der Ihr Kind den Stoff selbst versteht und behält. Im Erstgespräch schauen wir in 20 Minuten gemeinsam, wo es hakt.",
    knopfDirekt: "Erstgespräch anfragen", knopfUnter: "Kostenlos · unverbindlich · 20 Minuten · Rückruf innerhalb eines Werktags",
    knopfUebergang: { text: "Erst die Werkzeuge mit Ihrem Kind ansehen", ziel: { ansicht: "penpaperkurs" } },
    vertrauen: [["Basti Blumenröther", "Mathestudent an der Uni Konstanz, seit Jahren Mathe-Coach"], ["Konstanz & online", "Vor Ort am Bodensee oder per Zoom"], ["Gymnasium, Klasse 8 bis Abi", "Schwerpunkt Oberstufe und Abitur"], ["Klare Laufzeit", "8 Wochen oder 6 Monate, Preis vor dem Start"]],
    held: { identitaet: "Ihr Kind geht aufs Gymnasium. Die letzte Arbeit war eine 4 oder 5, und Sie suchen gerade nach Hilfe.", wunsch: "Dass Ihr Kind wieder sicher und ruhig in Mathe wird – und am Abendbrottisch wieder über etwas anderes gesprochen wird.", einsatz: "Versetzung, Abi-Schnitt – und die Beziehung zu Ihrem Kind, die unter dem Thema leidet." },
    problem: {
      kicker: "Kommt Ihnen das bekannt vor?", h2: ["Nachhilfe hat geholfen. ", "Kurz."],
      text: "Die Lücken sind seit zwei Jahren da, ein Lehrerwechsel hat sie größer gemacht, und die letzte Nachhilfe hat die Note für eine Klausur gerettet. Das Problem hat drei Ebenen – die dritte ist die wichtigste.",
      ebenen: [
        { nr: "Auf dem Blatt", zitat: "Vor der Klausur ging es, danach war alles weg.", text: "Nachhilfe erklärt den Stoff der nächsten Arbeit. Was fehlt, ist die Arbeitsweise, mit der Ihr Kind den Stoff selbst versteht – und ihn im nächsten Jahr noch hat." },
        { nr: "Zu Hause", zitat: "Hätten wir früher etwas getan.", text: "Sorge, Schuldgefühle, Streit über Hausaufgaben. Sie können fachlich nicht helfen und sollen es auch nicht müssen." },
        { nr: "Der eigentliche Gegner", zitat: "Ich konnte Mathe auch nie.", gegner: true, text: "Der Mythos vom Mathetalent vererbt sich über diesen Satz, nicht über die Gene. Er sagt Ihrem Kind, dass es an ihm liegt. Dabei hat ihm nur nie jemand gezeigt, wie man Mathe lernt." },
      ],
    },
    mentor: {
      kicker: "Wer dahintersteht", h2: ["Ich war der Schüler ", "mit der 2."],
      text: "Note 2 in den ersten drei Gymnasialjahren – nie sicher. Ab Klasse 8 ein anderer Weg, ab Klasse 10 eine 1,0 bis zum Abitur. Daraus ist über Jahre ein Trainingssystem geworden, das ich heute mit Schülern durcharbeite.",
      belege: [["Mathematik an der Universität Konstanz", "Ich studiere das Fach selbst und begleite seit vielen Jahren Schüler von der Mittelstufe bis zum Abitur."], ["Ein System, das man prüfen kann", "Pen & Paper, Wiederholung im richtigen Abstand, Mathilda AI für den Rechenweg, eigene Schulbücher – jede Methode gibt es als Werkzeug in der App."], ["Einblick für Eltern", "Über das Elternkonto sehen Sie, was Ihr Kind wann trainiert hat. Kein Notenversprechen – aber eine Messung."]],
      haltung: "Ich verspreche keine Note. Ich verspreche ein System mit fester Laufzeit, festem Preis und einer Rückmeldung, die Sie lesen können.",
    },
    plan: {
      kicker: "So geht es weiter", h2: ["Drei Schritte ", "bis zum Plan."],
      schritte: [["Erstgespräch", "20 Minuten, Sie und Ihr Kind. Wir schauen, wo es hakt, seit wann, und ob das Programm passt."], ["Standortbestimmung", "Eine Testklausur zum aktuellen Stoff zeigt die Lücken darunter. Daraus entsteht der Wochenplan."], ["8 Wochen mit Wochenplan", "Wöchentlicher Zoom-Call, tägliche Aufgabe aus dem Plan, Rückmeldung zum Rechenweg – und jede Woche eine kurze Rückmeldung an Sie."]],
      versprechen: ["Das Erstgespräch ist kostenlos und unverbindlich.", "Jedes Programm hat eine feste Laufzeit und einen festen Preis.", "Sie sehen im Elternkonto, was passiert."],
    },
    angebote: {
      kicker: "Die Programme", h2: ["Ein Angebot, ", "nicht drei."],
      text: "Welches Programm passt, klären wir im Gespräch – abhängig von Klasse und Ziel.",
      karten: [
        { dauer: "8 Wochen · Klasse 8 bis 11", name: "Mathe checken", preis: "checken", text: "In acht Wochen Lücken schließen und eine Arbeitsweise aufbauen, mit der Ihr Kind danach allein weiterkommt.", punkte: ["Standortbestimmung mit Testklausur", "Wöchentlicher Zoom-Call", "Täglicher Trainingsplan in der App", "Rückmeldung zum Rechenweg durch Mathilda AI", "Wöchentliche Rückmeldung an Sie"], knopf: "Erstgespräch anfragen", aktion: "einstieg", hervor: true },
        { dauer: "6 Monate · Abi-Jahrgang", name: "Mathe Abi Masterclass", preis: "masterclass", text: "Sechs Monate bis zum Abitur: wöchentlicher Zoom, Trainingssessions, drei Intensivtage, feste Gruppe.", punkte: ["Wöchentlicher Zoom-Call mit der Gruppe", "Wöchentliche Trainingssessions mit Abi-Aufgaben", "Drei Intensivtage am Samstag", "Rückmeldung an die Eltern"], knopf: "Erstgespräch anfragen", aktion: "einstieg" },
      ],
    },
    wege: { erfolg: ["Ihr Kind sagt: „Ich weiß, wie ich rangehe.“", "Hausaufgaben sind kein Streitthema mehr.", "Die nächste Klausur wird vorbereitet, nicht gefürchtet."], scheitern: ["Die Lücke wächst mit jedem Halbjahr.", "Abi-Mathe baut auf Klasse 9 und 10 auf – auf genau diesen Lücken.", "Noch eine Nachhilfe, die die nächste Klausur rettet und sonst nichts."] },
    fragen: [["Ist das Nachhilfe?", "Nicht im klassischen Sinn. Nachhilfe erklärt den Stoff der nächsten Klausur. Mythos Mathe verändert, wie Ihr Kind lernt – damit es den Stoff danach selbst versteht und behält."], ["Wo findet das statt?", "In Konstanz und am Bodensee vor Ort oder online per Zoom. Die Werkzeuge der App funktionieren überall im Browser."], ["Was kostet das Erstgespräch?", "Nichts. 20 Minuten, Sie und Ihr Kind. Sie gehen mit einer Einschätzung raus – unabhängig davon, ob wir danach zusammenarbeiten."], ["Für welche Klassen?", "Gymnasium, Klasse 8 bis zum Abitur. Mathe checken für Klasse 8 bis 11, die Masterclass für den Abi-Jahrgang."], ["Wie schnell melden Sie sich?", "Innerhalb eines Werktags, telefonisch oder per E-Mail – je nachdem, was Sie im Formular angeben."]],
    abschluss: { h2: ["20 Minuten, ", "dann wissen Sie mehr."], text: "Erstgespräch anfragen – kostenlos, unverbindlich, Rückruf innerhalb eines Werktags." },
  },

  /* ═══ 5 · LinkedIn → Unternehmer-Eltern ═══ */
  {
    id: "abi-eltern", pfad: "abi-eltern", alias: ["linkedin", "masterclass-eltern", "abitur-eltern"], name: "LinkedIn → Eltern (Masterclass)",
    kanal: "LinkedIn, Bastis Posts und Profil", zielgruppe: "eltern", du: false, einstieg: "aufnahme",
    titel: "Mathe Abi Masterclass – für Eltern, die es ernst meinen – Mythos Mathe",
    kicker: "Für Eltern von Schülern in Klasse 10 bis 12 · Abitur in ein bis zwei Jahren",
    h1: ["Ihr Kind hat das Abi vor sich. ", "Mathe entscheidet mit."],
    lead: "Sechs Monate, eine feste Gruppe von höchstens 20 Schülern, wöchentliche Rückmeldung an Sie. Die Mathe Abi Masterclass beginnt mit einem Aufnahmegespräch – für beide Seiten.",
    knopfDirekt: "Aufnahmegespräch anfragen", knopfUnter: "30 Minuten · Eltern und Schüler · Auswahl in beide Richtungen",
    knopfUebergang: { text: "Programm im Detail ansehen", ziel: { ansicht: "masterclass" } },
    vertrauen: [["Höchstens 20 Plätze", "Feste Kohorte, feste Laufzeit"], ["6 Monate", "Wöchentlicher Zoom, Trainingssessions, 3 Intensivtage"], ["Rückmeldung an Sie", "Jede Woche, lesbar in fünf Minuten"], ["Uni Konstanz", "Mathestudium, eigene Schulbücher, eigene App"]],
    held: { identitaet: "Sie führen ein Unternehmen oder ein Team. Ihr Kind ist in Klasse 10 bis 12, das Abitur kommt in ein bis zwei Jahren.", wunsch: "Dass Ihr Kind das Abi souverän macht statt in Panik – und ein Partner, der das Thema trägt, damit Sie es nicht tragen müssen.", einsatz: "Studienplatz und NC, Zeit und Nerven – und die Frage, ob Sie Ihrem Kind vorleben, wie man ein Problem systematisch löst." },
    problem: {
      kicker: "Die Ausgangslage", h2: ["Mathe schwankt zwischen 3 und 5. ", "Nachhilfe löscht Brände."],
      text: "Das Abitur in Baden-Württemberg prüft Analysis, Geometrie und Stochastik – und baut dabei auf drei Jahren Stoff auf. Das Problem hat drei Ebenen; die dritte ist die wichtigste.",
      ebenen: [
        { nr: "In der Schule", zitat: "Die Note hängt davon ab, welches Thema gerade dran ist.", text: "Nachhilfe rettet die nächste Klausur. Das Abi fragt nach allem, was in drei Jahren war – und nach der Fähigkeit, eine unbekannte Aufgabe systematisch anzugehen." },
        { nr: "Zu Hause", zitat: "Wir reden nicht mehr darüber.", text: "Ihr Kind zieht sich zurück, Gespräche eskalieren, und fachlich kann niemand im Haus helfen. Sie haben Besseres zu tun, als Mathe zu lernen." },
        { nr: "Der eigentliche Gegner", zitat: "Mathebegabung.", gegner: true, text: "Der Mythos, dass Mathe eine Begabung ist, und sein Bruder, dass mehr Stunden es richten. Beide sind falsch. Was fehlt, ist ein System – und eine Gruppe, die es sechs Monate lang durchzieht." },
      ],
    },
    mentor: {
      kicker: "Wer das Programm führt", h2: ["Der Schüler mit der 2, ", "der mit System auf 1,0 kam."],
      text: "Note 2 in den ersten drei Gymnasialjahren, ab Klasse 8 ein anderer Weg, ab Klasse 10 eine 1,0 bis zum Abitur. Ich studiere Mathematik an der Universität Konstanz, habe die Schulbücher und die App hinter diesem Programm selbst gebaut und arbeite seit Jahren mit Abiturienten.",
      belege: [["Feste Kohorte, höchstens 20", "Die Zahl ist keine Werbung, sondern die Grenze, bis zu der ich jeden Rechenweg selbst lese."], ["Eigene Schulbücher und eigene App", "Ableitungen, Vektoren, Kurvendiskussion als Bände; Mathilda AI prüft handgeschriebene Rechenwege."], ["Aufnahme in beide Richtungen", "Aufgenommen wird, wer mitarbeiten will. Das Gespräch klärt das – nicht jeder Schüler wird aufgenommen."]],
      haltung: "Die Verantwortung bleibt beim Schüler. Sie bekommen Transparenz: jede Woche eine Rückmeldung, die Sie in fünf Minuten lesen. Ein Notenversprechen bekommen Sie nicht.",
    },
    plan: {
      kicker: "So läuft es", h2: ["Drei Schritte ", "bis zum Start."],
      schritte: [["Aufnahmegespräch", "30 Minuten, Eltern und Schüler. Wo steht das Kind, was will es selbst, passt das Programm – in beide Richtungen."], ["Standortanalyse und 6-Monats-Plan", "Eine Testklausur zeigt die Lücken, der Plan ordnet sie nach dem Abi-Kalender."], ["Masterclass", "Wöchentlicher Zoom, wöchentliche Trainingssessions mit Abi-Aufgaben unter Zeit, drei Intensivtage – und jede Woche eine Rückmeldung an Sie."]],
      versprechen: ["Feste Laufzeit, feste Gruppe, fester Preis – alles vor dem Start.", "Wöchentliche Rückmeldung an die Eltern.", "Kein Notenversprechen. Klare Regeln."],
    },
    angebote: {
      kicker: "Das Programm", h2: ["Mathe Abi Masterclass."],
      text: "Ein Programm, eine Kohorte, ein Preis. Dazu ein 1:1-Upgrade für Schüler, die mehr Begleitung brauchen.",
      karten: [
        { dauer: "6 Monate · Abi-Jahrgang", name: "Mathe Abi Masterclass", preis: "masterclass", text: "Sechs Monate bis zum Abitur in einer festen Gruppe von höchstens 20 Schülern.", punkte: ["Wöchentlicher Zoom-Call mit der Gruppe", "Wöchentliche Trainingssessions: Abi-Aufgaben unter Zeit, Rückmeldung zum Rechenweg", "Drei Intensivtage am Samstag (je zwei Termine zur Wahl)", "Alle Kurse, Schulbücher und Mathilda AI", "Wöchentliche Rückmeldung an die Eltern"], knopf: "Aufnahmegespräch anfragen", aktion: "einstieg", hervor: true },
        { dauer: "Zusätzlich", name: "1:1-Upgrade", preis: "masterclassEins", text: "Wöchentliche Einzelstunde zusätzlich zur Gruppe – für Schüler, die mehr Begleitung brauchen oder später einsteigen.", punkte: ["Wöchentliche Einzelstunde per Zoom", "Eigener Wochenplan", "Rückmeldung zu jedem Rechenweg"], knopf: "Im Gespräch klären", aktion: "einstieg" },
      ],
    },
    wege: { erfolg: ["Ihr Kind führt das Thema selbst – Sie bekommen Berichte statt Streit.", "Das Abi wird vorbereitet, nicht gefürchtet.", "Ihr Kind hat gelernt, ein Problem systematisch zu lösen. Das bleibt."], scheitern: ["Der letzte Abi-Winter mit Crashkurs und Panik.", "Ein Studienwunsch, der am NC scheitert.", "Noch eine Nachhilfe, die Brände löscht."] },
    fragen: [["Warum ein Aufnahmegespräch?", "Weil das Programm nur funktioniert, wenn der Schüler es will. Das Gespräch klärt das – für Sie, für Ihr Kind und für mich."], ["Was kostet die Masterclass?", "Den Preis und die Zahlungsweise besprechen wir im Gespräch; er steht vor dem Start fest und ändert sich danach nicht."], ["Wann startet die nächste Kohorte?", "Die Termine klären wir im Gespräch. Die Gruppe startet gemeinsam und läuft sechs Monate."], ["Online oder vor Ort?", "Die Zoom-Calls und Trainingssessions online, die drei Intensivtage in Konstanz."], ["Was, wenn mein Kind nicht aufgenommen wird?", "Dann sage ich Ihnen, warum – und was stattdessen passt: Mathe checken als kürzeres Programm oder die Werkzeuge der App."]],
    abschluss: { h2: ["30 Minuten, ", "dann wissen beide Seiten mehr."], text: "Aufnahmegespräch anfragen – Eltern und Schüler gemeinsam." },
  },
];

export const kanalSeite = (id) => KANAL_SEITEN.find((s) => s.id === id) || null;

/* Kanal-Kennung: aus der Adresse (?via=…), sonst aus der Sitzung, sonst die Seite selbst */
export const viaNormal = (roh) => {
  const v = String(roh || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  return v || null;
};
