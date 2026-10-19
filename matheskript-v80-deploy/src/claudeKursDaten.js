/* ======================================================================
   KURSE „MATHE LERNEN MIT CLAUDE“ (ab 18) und „MATHE LERNEN MIT GEMINI“ (ab 16)
   – reine Daten (ohne React, Node-testbar)

   Zwei Kurse nach Alter, dieselben zehn Lektionen: Leitfrage, Erklärtext,
   Prompt-Vorlagen zum Kopieren, Beispiel-Chat, „So nicht – so besser“,
   Auftrag und ein Einstieg für Mathilda. Nur Lektion 1 (Zugang) und die
   Beispiele unterscheiden sich:
     · ab 18 (Claude, claude.ai): Beispiele aus dem Schulbuch Band 1
       „Ableitungen“ (Kurs Differentialrechnung, Seitenangaben wie im Buch)
     · ab 16 (Gemini, Google-Konto ab 16 in Deutschland): eigene Aufgaben zu
       Parabeln, Gleichungen, Prozent, Pythagoras, Strahlensätzen, linearen Funktionen
   Unter 16: Mathilda AI in der App (läuft auf Claude, gleiche Prompts).

   Im Text steht {KI} für den Namen der KI; kiText() setzt ihn ein.
   Grundsatz: Die KI ist Trainer, nicht Lösungsmaschine. Kein Prompt hier
   verlangt „Löse mir die Aufgabe“.
   ====================================================================== */

export const KURSE = [
  { id: "gemini", ki: "Gemini", anbieter: "Google", titel: "Mathe lernen mit Gemini", alter: "ab 16", klassen: "Klasse 10–11", beispiele: "mittel",
    kurz: "Parabeln, Gleichungen, Prozent, Pythagoras", ansicht: "geminikurs", adresse: "gemini.google.com", speicher: "mm_geminikurs" },
  { id: "claude", ki: "Claude", anbieter: "Anthropic", titel: "Mathe lernen mit Claude", alter: "ab 18", klassen: "Klasse 12–13", beispiele: "ober",
    kurz: "Ableitungen, Tangenten, Änderungsraten", ansicht: "claudekurs", adresse: "claude.ai", speicher: "mm_claudekurs" },
];
export const kurs = (id) => KURSE.find((k) => k.id === id) || KURSE[1];
export const kiText = (text, ki) => String(text).replace(/\{KI\}/g, ki);

/* Ein Prompt-Baustein: Titel, Text zum Kopieren, wann man ihn braucht */
const P = (titel, text, wann) => ({ titel, text, wann });
/* Eine Zeile im Beispiel-Chat */
const du = (text) => ({ wer: "du", text });
const cl = (text) => ({ wer: "claude", text });

export const LEKTIONEN = [
  /* ------------------------------------------------------------ 1 */
  {
    id: "zugang", nr: 1, titel: "Dein Zugang", dauer: 6,
    frage: "Wo rede ich mit {KI} – und wie sage ich ihm, was ich eigentlich von ihm will?",
    kurz: {
      claude: [
        "Claude ist die KI von Anthropic. Du kannst mit ihr chatten wie mit einem sehr geduldigen Tutor: Sie erklärt, fragt nach, prüft deinen Weg – wenn du sie richtig ansprichst.",
        "Claude ist ab 18 Jahren. Du legst dir ein eigenes Konto auf claude.ai an, kostenlos. Bist du jünger, gibt es zwei Wege: ab 16 den Schwesterkurs mit Gemini, darunter Mathilda AI hier in der App – sie läuft auf Claude und hält sich von allein an die Trainer-Regeln. Alle Prompts sind überall dieselben.",
        "Das Wichtigste passiert in den ersten drei Zeilen jedes Gesprächs: Du sagst, wer du bist, woran du arbeitest und was Claude nicht tun soll. Dieser Startprompt ist dein Werkzeug Nummer eins.",
      ],
      gemini: [
        "Gemini ist die KI von Google. Du kannst mit ihr chatten wie mit einem sehr geduldigen Tutor: Sie erklärt, fragt nach, prüft deinen Weg – wenn du sie richtig ansprichst.",
        "Ein eigenes Google-Konto gibt es in Deutschland ab 16 – damit kannst du Gemini nutzen. Bis 18 gelten Jugendschutz-Filter, und dein Chatverlauf wird nicht dauerhaft gespeichert. Bist du jünger als 16, nutzt du Mathilda AI hier in der App; ab 18 lohnt zusätzlich der Schwesterkurs mit Claude. Alle Prompts sind überall dieselben.",
        "Das Wichtigste passiert in den ersten drei Zeilen jedes Gesprächs: Du sagst, wer du bist, woran du arbeitest und was Gemini nicht tun soll. Dieser Startprompt ist dein Werkzeug Nummer eins.",
      ],
    },
    schritte: {
      claude: [
        ["claude.ai öffnen", "Im Browser claude.ai aufrufen oder die Claude-App laden (iPhone, Android, Mac, Windows)."],
        ["Konto anlegen", "„Sign up“ – mit Google-Konto oder E-Mail-Adresse und Passwort. Claude ist ab 18 Jahren; das Geburtsdatum wird abgefragt."],
        ["Neuer Chat", "Jedes Thema bekommt einen eigenen Chat. So bleibt der Verlauf übersichtlich, und du findest alte Erklärungen wieder."],
        ["Startprompt einfügen", "Den Startprompt unten einfügen – er gilt für den ganzen Chat. Danach die Aufgabe abtippen oder als Foto anhängen."],
      ],
      gemini: [
        ["gemini.google.com öffnen", "Im Browser gemini.google.com aufrufen oder die Gemini-App laden (Android, iPhone). Mit deinem Google-Konto anmelden."],
        ["Google-Konto ab 16", "Du brauchst ein eigenes Google-Konto – in Deutschland ab 16 Jahren. Bis 18 schaltet Google zusätzliche Inhaltsfilter ein; für Mathe ändert das nichts."],
        ["Startprompt aufbewahren", "Unter 18 speichert Gemini deinen Verlauf nicht dauerhaft. Leg den Startprompt in deine Notizen-App und füge ihn in jedem neuen Chat zuerst ein."],
        ["Aufgabe hinein", "Danach die Aufgabe abtippen oder als Foto anhängen – und nie Name, Adresse oder Schule nennen, das braucht Gemini nicht."],
      ],
    },
    prompts: [
      P("Startprompt", "Hallo! Ich bin in [Klasse] und lerne gerade [Thema]. Ich möchte Mathe wirklich verstehen. Deshalb: Gib mir nie die fertige Lösung, sondern erkläre, frag nach und lass mich selbst rechnen. Lösungen zeigst du nur, wenn ich ausdrücklich „Lösung bitte“ schreibe. Antworte kurz, Schritt für Schritt, und sprich mich mit Du an.",
        "Am Anfang jedes neuen Chats – einmal, gilt dann für alles Weitere."),
      P("Aufgabe übergeben", "Hier ist meine Aufgabe: [Aufgabentext abtippen oder Foto anhängen]. Bevor wir rechnen: Erklär mir in zwei Sätzen, was hier überhaupt gefragt ist.",
        "Direkt nach dem Startprompt."),
    ],
    beispiel: {
      mittel: {
        quelle: "Parabeltrainer · Klasse 10",
        aufgabe: "Neuer Chat mit Gemini – Thema Parabeln, du übst gerade die Scheitelform.",
        gespraech: [
          du("Hallo! Ich bin in Klasse 10 und lerne gerade Parabeln, vor allem die Scheitelform. Gib mir nie die fertige Lösung, sondern erkläre und frag nach. Lösungen nur, wenn ich „Lösung bitte“ schreibe."),
          cl("Alles klar, so machen wir das. Womit fangen wir an – hast du eine konkrete Aufgabe, oder soll ich erst kurz abfragen, was du über die Scheitelform schon weißt?"),
          du("Erst abfragen bitte."),
          cl("Gut. Erste Frage: Was kannst du an f(x) = (x − 3)² + 1 direkt ablesen, ohne zu rechnen?"),
        ],
        merke: "Mit dem Startprompt fragt {KI} von sich aus zurück. Ohne ihn liefert er auf „Scheitelform?“ einen fertigen Lehrbuchtext – und du liest nur.",
      },
      ober: {
        quelle: "Kurs Differentialrechnung · Kapitel 5–8",
        aufgabe: "Neuer Chat auf claude.ai – Thema h-Methode und Ableitung an einer Stelle.",
        gespraech: [
          du("Hallo! Ich bin in der Kursstufe und lerne gerade Ableitungen, speziell die h-Methode. Gib mir nie die fertige Lösung, sondern erkläre und frag nach. Lösungen nur, wenn ich „Lösung bitte“ schreibe. Kurz und per Du."),
          cl("Verstanden – ich bin dein Sparringspartner, nicht dein Lösungsheft. Sag mir kurz: Weißt du schon, was der Differenzenquotient misst, oder steigen wir genau da ein?"),
          du("Ich weiß, dass er eine Steigung ist, aber nicht welche."),
          cl("Das ist schon der halbe Weg. Steigung von was – einer Geraden oder einer Kurve? Und zwischen welchen Punkten?"),
        ],
        merke: "{KI} merkt sich den Startprompt für den ganzen Chat. In einem neuen Chat musst du ihn wieder einfügen.",
      },
    },
    fehler: [
      { so: "Einfach die Aufgabe hineinkopieren.", besser: "Erst der Startprompt, dann die Aufgabe. Sonst bekommst du die Lösung, bevor du gefragt hast." },
      { so: "Alles in einem einzigen Chat – Parabeln, Pythagoras, Englisch-Vokabeln.", besser: "Ein Chat pro Thema. Dann passt der Startprompt, und du findest Erklärungen wieder." },
    ],
    auftrag: ["Zugang einrichten: eigenes Konto bei {KI} (oder Mathilda in der App).", "Startprompt mit deiner Klasse und deinem aktuellen Thema abspeichern (Notizen-App).", "Einen ersten Chat starten und dich nur abfragen lassen – noch keine Aufgabe."],
    mathilda: "Hallo Mathilda! Ich will diesen Kurs „Mathe lernen mit {KI}“ ausprobieren. Frag mich bitte ab, was ich über mein aktuelles Thema schon weiß – ohne mir etwas vorzusagen.",
  },

  /* ------------------------------------------------------------ 2 */
  {
    id: "regel", nr: 2, titel: "Erklär mir – nicht: löse mir", dauer: 7,
    frage: "Warum bringt dir eine fertige Lösung fast nichts – und was fragst du stattdessen?",
    kurz: [
      "„Löse mir die Aufgabe“ liefert in drei Sekunden ein perfektes Ergebnis. Du liest es, nickst – und in der Klassenarbeit steht niemand neben dir. Was du nicht selbst gedacht hast, kannst du nicht abrufen.",
      "Die bessere Frage dreht die Rollen um: {KI} erklärt, du rechnest. Jeder gute Prompt hat vier Teile: deine Rolle, die Aufgabe, was du willst – und was {KI} nicht tun soll.",
      "Die Faustregel: {KI} darf alles erklären, aber die Zahlen schreibst du. Sobald in einer Antwort dein Ergebnis steht, hast du falsch gefragt.",
    ],
    prompts: [
      P("Die Grundform", "Rolle: Du bist mein Mathe-Trainer. Aufgabe: [Text]. Ich will: verstehen, wie man an so eine Aufgabe herangeht. Du sollst nicht: die Aufgabe für mich ausrechnen. Stell mir stattdessen die erste Frage, die ich mir selbst stellen sollte.",
        "Für jede neue Aufgabe."),
      P("Nur der Plan", "Erklär mir nur den Plan für diese Aufgabe – welche Schritte in welcher Reihenfolge, ohne eine einzige Zahl auszurechnen: [Aufgabe]",
        "Wenn du nicht weißt, wo du anfangen sollst."),
      P("Bremse", "Stopp – du hast gerade die Lösung geschrieben. Bitte lösche das aus deinem Kopf und gib mir nur den nächsten Schritt als Frage.",
        "Wenn {KI} doch mal zu viel verrät."),
    ],
    beispiel: {
      mittel: {
        quelle: "Strahlensätze · Klasse 9",
        aufgabe: "Ein 1 m langer Stab wirft einen 1,5 m langen Schatten. Zur selben Zeit wirft ein Baum einen 9 m langen Schatten. Wie hoch ist der Baum?",
        gespraech: [
          du("Du bist mein Mathe-Trainer. Aufgabe: Ein 1-m-Stab wirft 1,5 m Schatten, ein Baum 9 m Schatten. Wie hoch ist der Baum? Rechne nichts aus – stell mir die erste Frage, die ich mir selbst stellen sollte."),
          cl("Erste Frage: Was haben Stab und Baum in dieser Situation gemeinsam – und warum darf man die beiden überhaupt vergleichen?"),
          du("Die Sonne steht gleich. Also gleicher Winkel."),
          cl("Genau. Gleicher Winkel heißt: ähnliche Dreiecke. Welche zwei Seiten gehören beim Stab zusammen, und welche entsprechen ihnen beim Baum?"),
          du("Höhe zu Schatten: 1 zu 1,5. Beim Baum: h zu 9."),
          cl("Dann hast du eine Verhältnisgleichung. Schreib sie auf und löse nach h auf – ich sag dir, ob sie stimmt."),
        ],
        merke: "{KI} hat kein einziges Ergebnis genannt. Die 6 m rechnest du – und genau deshalb bleibt der Weg hängen.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 27, Nr. 4",
        aufgabe: "Bestimme mit der Ableitung den Scheitelpunkt der Parabel f(x) = −2x² + 8x − 3.",
        gespraech: [
          du("Löse mir: Bestimme mit der Ableitung den Scheitelpunkt von f(x) = −2x² + 8x − 3."),
          cl("f′(x) = −4x + 8. Setze f′(x) = 0: −4x + 8 = 0 ⇒ x = 2. f(2) = −8 + 16 − 3 = 5. Scheitelpunkt S(2 | 5)."),
          du("… Okay. Das war schnell. Und jetzt kann ich es trotzdem nicht."),
          du("Neuer Versuch: Du bist mein Trainer. Gleiche Aufgabe – aber rechne nichts aus. Stell mir die erste Frage, die ich mir stellen sollte."),
          cl("Erste Frage: Was ist am Scheitelpunkt einer Parabel besonders, wenn du an die Tangente dort denkst?"),
          du("Die Tangente ist waagrecht. Steigung null."),
          cl("Und Steigung null bedeutet für die Ableitung …? Schreib die Bedingung als Gleichung auf, dann machen wir weiter."),
        ],
        merke: "Dieselbe Aufgabe, zwei Prompts. Beim ersten liest du S(2 | 5). Beim zweiten findest du selbst, warum f′(x) = 0 der Schlüssel ist.",
      },
    },
    fehler: [
      { so: "„Löse: …“ / „Was ist die Lösung von …?“", besser: "„Erklär mir, wie man an … herangeht, ohne zu rechnen.“" },
      { so: "„Ist 6 m richtig?“ – und dann weiterlesen, ohne nachzudenken.", besser: "„Ich habe 6 m. Prüf meinen Weg, nicht nur das Ergebnis.“ (Lektion 6)" },
      { so: "{KI} schreibt doch die Lösung – du liest sie trotzdem.", besser: "Sofort „Stopp“-Prompt, dann die Lösung bewusst nicht ansehen (Scrollen hilft)." },
    ],
    auftrag: ["Eine Aufgabe aus deinem Heft zweimal stellen: einmal „Löse mir“, einmal mit der Grundform. Vergleiche, was du danach noch weißt.", "Die Grundform (Rolle · Aufgabe · Ich will · Du sollst nicht) auswendig können.", "Den Bremse-Prompt einmal absichtlich ausprobieren."],
    mathilda: "Ich habe eine Aufgabe und will sie selbst lösen. Stell mir bitte nur die erste Frage, die ich mir dazu stellen sollte – keine Rechnung, kein Ergebnis.",
  },

  /* ------------------------------------------------------------ 3 */
  {
    id: "verstehen", nr: 3, titel: "Die Aufgabe verstehen", dauer: 8,
    frage: "Die Hälfte aller Fehler passiert, bevor du rechnest: Was ist hier eigentlich gefragt?",
    kurz: [
      "Viele Aufgaben scheitern nicht an der Mathematik, sondern am Lesen. „Bestimme“, „Begründe“, „Deute“ sind drei verschiedene Aufträge. Und ein Satz wie „im Sachzusammenhang“ heißt: Antworte mit Einheit und in Worten.",
      "Lass dir die Fragestellung erklären, nicht die Lösung. {KI} soll jeden Teil der Aufgabe in eigene Worte übersetzen: Was ist gegeben? Was ist gesucht? Welcher Operator steht da – und was verlangt er genau?",
      "Erst wenn du die Aufgabe mit eigenen Worten nachsprechen kannst, fängst du an zu rechnen. Das dauert eine Minute und spart zehn.",
    ],
    prompts: [
      P("Fragestellung erklären", "Erklär mir nur die Fragestellung dieser Aufgabe, nicht die Lösung: Was ist gegeben, was ist gesucht, und was verlangt jedes einzelne Verb (bestimme, begründe, deute …) von mir? Aufgabe: [Text]",
        "Bei jeder Aufgabe, die du nicht sofort verstehst."),
      P("Teilaufgaben sortieren", "Die Aufgabe hat die Teile a) bis [d)]. Sag mir zu jedem Teil in einem Satz, was ich am Ende hinschreiben muss (eine Zahl? eine Gleichung? einen Satz mit Einheit?). Keine Rechnung.",
        "Bei Aufgaben mit mehreren Teilen."),
      P("Nachsprechen lassen", "Ich erkläre dir jetzt die Aufgabe in meinen Worten. Sag mir, ob ich etwas falsch verstanden oder vergessen habe: [deine Worte]",
        "Als Kontrolle, bevor du rechnest."),
    ],
    beispiel: {
      mittel: {
        quelle: "Parabeln · Klasse 9/10",
        aufgabe: "Die Flugbahn eines Balls wird durch h(x) = −0,1x² + 2x beschrieben (h: Höhe in m, x: waagrechte Entfernung in m). a) Bestimme die maximale Höhe. b) Wo landet der Ball? c) Begründe, warum h(x) für x > 20 keine Bedeutung hat.",
        gespraech: [
          du("Erklär mir nur die Fragestellung, nicht die Lösung: Was ist gegeben, was ist gesucht, was verlangt jedes Verb? [Aufgabe]"),
          cl("Gegeben: eine Parabel, die nach unten geöffnet ist (das Minus vor 0,1x²) – sie beschreibt eine Ballhöhe. a) „Bestimme die maximale Höhe“: gesucht ist eine Zahl in Metern. Frag dich: Welcher Punkt der Parabel ist der höchste? b) „Wo landet der Ball“: gesucht ist eine Stelle x, an der die Höhe … was ist? c) „Begründe“: Hier wird keine Zahl verlangt, sondern ein Satz. Was passiert mit h(x), wenn x größer als 20 wird – und was wäre das in echt?"),
          du("a) Scheitelpunkt. b) Höhe null, also Nullstelle. c) Dann wäre die Höhe negativ, der Ball wäre unter dem Boden."),
          cl("Alle drei richtig verstanden. Jetzt weißt du, was du bei a) und b) rechnest und bei c) schreibst. Womit willst du anfangen?"),
        ],
        merke: "Drei Teilaufgaben, drei verschiedene Antwortarten: Zahl, Stelle, Satz. Das hat {KI} erklärt – gerechnet hast du noch nichts.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 42, Nr. 4",
        aufgabe: "Die Wassermenge in einem Speicherbecken wird für 0 ≤ t ≤ 12 beschrieben durch V(t) = −0,5t³ + 6t² (V in m³, t in Stunden). a) Berechne V′(2) und deute den Wert. b) Zu welchem Zeitpunkt fließt am meisten Wasser zu? c) Ab wann nimmt die Wassermenge ab? d) Deute V′(10) < 0 und V(12) = 0.",
        gespraech: [
          du("Erklär mir nur die Fragestellung, nicht die Lösung: Was ist gegeben, was ist gesucht, was verlangt jedes Verb? [Aufgabe]"),
          cl("Gegeben ist eine Funktion V(t): Zu jeder Stunde t die Wassermenge in m³ – nicht der Zufluss! a) „Berechne V′(2)“: eine Zahl. „Deute“: ein Satz mit Einheit – überleg, was V′ misst, wenn V eine Menge ist. b) „Am meisten Wasser zu“: Das fragt nach dem Zufluss, also nach V′ – und wann der am größten ist. c) „Nimmt ab“: Wann wird welche Größe negativ? d) Wieder zwei Sätze, keine Rechnung."),
          du("V′ ist die Zuflussrate in m³ pro Stunde. b) fragt also nach dem Maximum von V′, nicht von V."),
          cl("Das ist der entscheidende Punkt – viele rechnen hier das Maximum von V. Was brauchst du, um das Maximum von V′ zu finden?"),
          du("Die Ableitung von V′, also V″ = 0."),
        ],
        merke: "Die Falle steckt im Text: „am meisten Wasser zu“ meint V′, nicht V. Wer die Fragestellung klärt, sieht sie.",
      },
    },
    fehler: [
      { so: "Sofort losrechnen und bei c) „Begründe“ eine Zahl hinschreiben.", besser: "Jedes Verb klären: Begründe = Satz, Bestimme = Zahl oder Term, Deute = Satz mit Einheit." },
      { so: "„Was bedeutet die Aufgabe?“ – zu vage, {KI} erklärt alles inklusive Lösung.", besser: "„Erklär nur die Fragestellung, nicht die Lösung“ – klar abgegrenzt." },
    ],
    auftrag: ["Drei Aufgaben aus dem aktuellen Kapitel nur „verstehen lassen“ – nicht rechnen.", "Zu jedem Verb (bestimme, berechne, begründe, deute, zeige) in einem Satz notieren, was es verlangt.", "Eine Aufgabe in eigenen Worten nachsprechen und von {KI} prüfen lassen."],
    mathilda: "Erklär mir bitte nur die Fragestellung meiner Aufgabe: Was ist gegeben, was ist gesucht, und was verlangt jedes einzelne Verb von mir? Keine Lösung.",
  },

  /* ------------------------------------------------------------ 4 */
  {
    id: "begriffe", nr: 4, titel: "Fachwörter knacken", dauer: 7,
    frage: "Wie bekommst du ein Fachwort erklärt, das du dann auch wirklich verstehst?",
    kurz: [
      "Ein unverstandenes Fachwort blockiert die ganze Aufgabe. „Momentane Änderungsrate“, „Scheitelform“, „Diskriminante“ – das Buch erklärt es einmal, in einem Satz, in Buchdeutsch.",
      "{KI} kann denselben Begriff auf drei Stufen erklären: wie für einen Zehnjährigen, wie im Schulbuch, und an einem Beispiel aus deinem Alltag. Die erste Stufe gibt das Bild, die zweite die exakte Sprache, die dritte den Haken fürs Gedächtnis.",
      "Danach drehst du es um: Du erklärst den Begriff zurück – und {KI} sagt, was fehlt. Erst dann sitzt er.",
    ],
    prompts: [
      P("Drei Stufen", "Erklär mir den Begriff „[Fachwort]“ auf drei Stufen: 1. wie für einen Zehnjährigen, 2. so exakt wie im Schulbuch, 3. an einem Beispiel aus meinem Alltag. Höchstens drei Sätze pro Stufe.",
        "Für jedes neue Fachwort."),
      P("Unterschied", "Was ist der Unterschied zwischen „[Begriff A]“ und „[Begriff B]“? Gib mir je ein Beispiel, bei dem der Unterschied sichtbar wird, und einen Merksatz.",
        "Wenn zwei Begriffe ähnlich klingen."),
      P("Zurückerklären", "Ich erkläre dir jetzt „[Fachwort]“ in meinen Worten. Sag mir, was fehlt oder falsch ist – aber verrate nicht die richtige Formulierung, lass mich nachbessern: [deine Erklärung]",
        "Zur Kontrolle."),
    ],
    beispiel: {
      mittel: {
        quelle: "Parabeln · Klasse 9",
        aufgabe: "Fachwörter: Scheitelpunkt, Scheitelform, Normalform – an f(x) = (x − 3)² + 1.",
        gespraech: [
          du("Erklär mir „Scheitelform“ auf drei Stufen: für einen Zehnjährigen, wie im Schulbuch, an einem Alltagsbeispiel. Höchstens drei Sätze pro Stufe."),
          cl("1. Für Zehnjährige: Eine Parabel ist wie eine Schale oder ein Hügel. Der Scheitelpunkt ist der tiefste oder höchste Punkt. Die Scheitelform ist die Schreibweise, bei der man diesen Punkt sofort sieht. 2. Schulbuch: f(x) = a(x − d)² + e heißt Scheitelform; der Scheitelpunkt ist S(d | e), a bestimmt Öffnung und Streckung. 3. Alltag: Ein Wurf – wo der Ball am höchsten fliegt, ist der Scheitel. Steht die Formel als (x − 3)² + 1, dann weißt du ohne Rechnen: höchster bzw. tiefster Punkt bei x = 3, Höhe 1."),
          du("Ich erkläre zurück: Scheitelform ist, wenn ich den Scheitelpunkt ablesen kann, und zwar S(3 | 1) bei (x − 3)² + 1. Das Minus dreht sich um."),
          cl("Fast vollständig. Zwei Dinge prüfen: Wofür steht das a, das du nicht erwähnt hast? Und das „Minus dreht sich um“ – gilt das auch für das e, also die +1?"),
        ],
        merke: "Die Stufen bauen aufeinander auf: Bild → Fachsprache → Beispiel. Das Zurückerklären deckt auf, was du übersprungen hast.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 17, Nr. 3",
        aufgabe: "Ein Auto fährt in 2 Stunden 180 km. Erkläre an diesem Beispiel den Unterschied zwischen mittlerer und momentaner Änderungsrate. Was zeigt der Tacho an?",
        gespraech: [
          du("Was ist der Unterschied zwischen „mittlerer Änderungsrate“ und „momentaner Änderungsrate“? Je ein Beispiel, bei dem der Unterschied sichtbar wird, und ein Merksatz."),
          cl("Mittlere Änderungsrate: Du vergleichst nur Anfang und Ende eines Zeitraums – 180 km in 2 Stunden sind im Mittel 90 km/h, egal ob das Auto zwischendurch im Stau stand. Mathematisch: Steigung der Sekante, Differenzenquotient. Momentane Änderungsrate: die Geschwindigkeit in genau einem Augenblick – das, was der Tacho zeigt; vielleicht gerade 130 km/h oder 0. Mathematisch: Steigung der Tangente, Ableitung. Merksatz: Mittel = zwei Punkte, Moment = ein Punkt."),
          du("Zurückerklären: mittlere = Sekante über ein Intervall, momentane = Tangente an einer Stelle. Der Tacho zeigt die momentane."),
          cl("Stimmt. Eine Frage noch, damit es sitzt: Wie kommt man rechnerisch von der mittleren zur momentanen Rate – was passiert mit dem Intervall?"),
        ],
        merke: "Der Merksatz „zwei Punkte – ein Punkt“ ist der Haken fürs Gedächtnis. Die letzte Frage führt direkt zur h-Methode.",
      },
    },
    fehler: [
      { so: "„Was ist eine Ableitung?“ – zu offen, du bekommst eine Vorlesung.", besser: "„Erklär mir Ableitung auf drei Stufen, höchstens drei Sätze pro Stufe.“" },
      { so: "Erklärung lesen, nicken, weiter.", besser: "Zurückerklären lassen prüfen – erst dann ist der Begriff deiner." },
    ],
    auftrag: ["Alle Fachwörter deines aktuellen Kapitels sammeln (meist 5–8).", "Jedes auf drei Stufen erklären lassen und den Merksatz notieren.", "Zwei verwechselbare Begriffe mit dem Unterschied-Prompt klären."],
    mathilda: "Erklär mir bitte den Begriff, den ich gleich nenne, auf drei Stufen: wie für einen Zehnjährigen, wie im Schulbuch, an einem Beispiel aus meinem Alltag. Danach frag mich ab, ob ich ihn zurückerklären kann.",
  },

  /* ------------------------------------------------------------ 5 */
  {
    id: "schritte", nr: 5, titel: "Nur der nächste Schritt", dauer: 8,
    frage: "Wie rechnest du mit {KI}, ohne dass {KI} für dich rechnet?",
    kurz: [
      "Der beste Trainer steht neben dir und sagt: „Und jetzt?“ Genau das kann {KI} – wenn du ihm verbietest, vorzulaufen. Die Regel lautet: ein Schritt, dann warten.",
      "Du rechnest jeden Schritt selbst und schickst ihn. {KI} sagt nur: richtig, weiter – oder: schau dir Zeile zwei noch einmal an. Die Zahlen bleiben in deiner Hand.",
      "Wenn du hängst, holst du dir keinen Schritt, sondern einen Hinweis: „Welche Frage muss ich mir jetzt stellen?“ Der Hinweis gibt die Richtung, nicht das Ergebnis.",
    ],
    prompts: [
      P("Ein Schritt, dann warten", "Wir rechnen diese Aufgabe gemeinsam: [Aufgabe]. Regeln: Du gibst mir immer nur den nächsten Schritt als Frage oder Hinweis, nie als Rechnung. Ich rechne, schicke dir meinen Schritt, und du sagst nur „stimmt, weiter“ oder wo ich hinschauen soll. Los: Was ist Schritt 1?",
        "Für jede Aufgabe, die du rechnen willst."),
      P("Hinweis statt Schritt", "Ich hänge fest. Gib mir keinen Rechenschritt, sondern nur die Frage, die ich mir jetzt stellen sollte.",
        "Wenn es nicht weitergeht."),
      P("Probe", "Ich habe ein Ergebnis. Sag mir nicht, ob es stimmt – sag mir, wie ich es selbst prüfen kann.",
        "Am Ende jeder Aufgabe."),
    ],
    beispiel: {
      mittel: {
        quelle: "Quadratische Gleichungen · Klasse 9",
        aufgabe: "Löse x² − 5x + 6 = 0.",
        gespraech: [
          du("Wir rechnen gemeinsam: x² − 5x + 6 = 0. Du gibst mir nur den nächsten Schritt als Frage, ich rechne. Was ist Schritt 1?"),
          cl("Schritt 1: In welcher Form liegt die Gleichung vor – und welche Lösungsformel passt dazu? Lies p und q ab."),
          du("Normalform, pq-Formel. p = −5, q = 6."),
          cl("Stimmt. Schritt 2: Setz p und q in die pq-Formel ein – aber nur einsetzen, noch nicht ausrechnen. Achte auf das Vorzeichen von −p/2."),
          du("x = 2,5 ± √(6,25 − 6)"),
          cl("Richtig eingesetzt. Schritt 3: Was steht unter der Wurzel, und was sagt dir das über die Anzahl der Lösungen?"),
          du("0,25. Positiv, also zwei Lösungen: 2,5 ± 0,5 → x₁ = 3, x₂ = 2."),
          cl("Stimmt. Letzter Schritt: Prüf beide Lösungen durch Einsetzen – du hast gleich eine Probe, die ohne mich funktioniert."),
        ],
        merke: "Vier Schritte, vier Fragen. {KI} hat keine Zahl genannt – nur die Vorzeichenfalle bei −p/2 vorher angesagt.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 15, Nr. 1 a)",
        aufgabe: "Stelle den Differenzenquotienten für f(x) = x² an der Stelle x₀ = 3 als Term in h auf und vereinfache ihn so weit wie möglich.",
        gespraech: [
          du("Wir rechnen gemeinsam: Differenzenquotient von f(x) = x² an x₀ = 3, als Term in h, vereinfacht. Nur der nächste Schritt als Frage. Schritt 1?"),
          cl("Schritt 1: Schreib die allgemeine Form des Differenzenquotienten mit h auf – noch ohne die Funktion einzusetzen."),
          du("(f(3 + h) − f(3)) / h"),
          cl("Stimmt. Schritt 2: Setz f ein. Was ist f(3 + h), was ist f(3)? Vorsicht beim Quadrat einer Summe."),
          du("((3 + h)² − 9) / h = (9 + 6h + h² − 9) / h"),
          cl("Sauber, die binomische Formel sitzt. Schritt 3: Was kannst du im Zähler zusammenfassen – und was darfst du dann kürzen?"),
          du("(6h + h²) / h = h(6 + h) / h = 6 + h"),
          cl("Stimmt. Zum Abschluss eine Frage, keine Rechnung: Was wird aus 6 + h, wenn h immer kleiner wird – und was bedeutet diese Zahl für den Graphen bei x = 3?"),
        ],
        merke: "{KI} warnt vor der Falle (Quadrat einer Summe), bevor sie passiert – und lässt dich trotzdem selbst ausmultiplizieren.",
      },
    },
    fehler: [
      { so: "„Zeig mir den Rechenweg.“ – {KI} schreibt alles in einem Block.", besser: "„Nur den nächsten Schritt als Frage, dann warte.“" },
      { so: "Nach jedem Schritt „Stimmt das?“ fragen, ohne selbst zu prüfen.", besser: "Probe-Prompt: „Wie kann ich das selbst prüfen?“" },
    ],
    auftrag: ["Zwei Aufgaben komplett im Ein-Schritt-Modus rechnen.", "Einmal absichtlich hängen bleiben und nur einen Hinweis holen.", "Jede Lösung mit der Probe-Methode selbst prüfen, bevor {KI} etwas sagt."],
    mathilda: "Lass uns meine Aufgabe gemeinsam rechnen: Gib mir immer nur den nächsten Schritt als Frage, ich rechne und schicke dir meinen Schritt. Sag dann nur „stimmt, weiter“ oder wo ich hinschauen soll.",
  },

  /* ------------------------------------------------------------ 6 */
  {
    id: "pruefen", nr: 6, titel: "Meinen Weg prüfen lassen", dauer: 8,
    frage: "Wie findest du deinen Fehler selbst – mit {KI} als Lupe, nicht als Korrektor?",
    kurz: [
      "Ein Rechenweg mit Fehler ist wertvoller als eine richtige Lösung von {KI}: Er zeigt genau, wo dein Denken abbiegt. Darum schickst du deinen Weg – abgetippt oder als Foto – und bittest um die Lupe, nicht um die Korrektur.",
      "Die wichtigste Frage lautet: „In welcher Zeile steht der erste Fehler?“ Nicht welcher. Die Zeile bekommst du, den Fehler findest du. Das ist der Unterschied zwischen Abschreiben und Lernen.",
      "Erst wenn du es nach zwei Versuchen nicht findest, fragst du nach der Art des Fehlers – „Vorzeichen? Formel? Rechnen?“ – und erst zuletzt nach dem Fehler selbst.",
    ],
    prompts: [
      P("Nur die Zeile", "Hier ist mein Rechenweg (abgetippt oder Foto): [Weg]. Sag mir nur, in welcher Zeile der erste Fehler steht – nicht, was der Fehler ist. Wenn alles stimmt, sag nur „stimmt“.",
        "Jedes Mal, wenn du ein Ergebnis hast."),
      P("Fehlerart", "Ich finde den Fehler in Zeile [n] nicht. Sag mir nur die Art: Vorzeichen, Formel falsch angewendet, Rechenfehler, oder Aufgabe falsch gelesen?",
        "Nach zwei eigenen Versuchen."),
      P("Letzte Stufe", "Okay, ich gebe auf: Zeig mir in Zeile [n], was falsch ist – und stell mir danach eine ähnliche Aufgabe mit anderen Zahlen, damit ich es noch einmal mache.",
        "Nur, wenn gar nichts mehr geht."),
    ],
    beispiel: {
      mittel: {
        quelle: "Binomische Formeln · Klasse 8",
        aufgabe: "Schülerrechnung: (x + 3)² = x² + 9. Danach: x² + 9 = 25 ⇒ x² = 16 ⇒ x = 4.",
        gespraech: [
          du("Mein Weg: Zeile 1: (x + 3)² = x² + 9. Zeile 2: x² + 9 = 25. Zeile 3: x² = 16. Zeile 4: x = 4. Sag mir nur, in welcher Zeile der erste Fehler steht."),
          cl("Zeile 1."),
          du("Hm. (x + 3)² … ist das nicht x² + 3²?"),
          cl("Du bist auf der richtigen Spur, dass du genau dort zweifelst. Probier es mit x = 1: Was ergibt (1 + 3)², und was ergibt 1² + 9?"),
          du("16 und 10. Nicht gleich! Also fehlt was. (x + 3)(x + 3) = x² + 3x + 3x + 9 = x² + 6x + 9."),
          cl("Genau das war es – der Mittelterm 2 · 3 · x. Und jetzt ein Hinweis zu Zeile 4, wenn du so weit bist: Wie viele Lösungen hat x² = 16?"),
        ],
        merke: "{KI} nannte nur „Zeile 1“. Den fehlenden Mittelterm hast du mit dem Einsetz-Trick selbst entdeckt – und dazu den zweiten Fehler (x = −4 fehlt) gleich mit.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 15, Nr. 3",
        aufgabe: "Finde den Fehler: Lukas schreibt für f(x) = x², x₀ = 2: ((2 + h)² − 4) / h = (4 + h² − 4) / h = h.",
        gespraech: [
          du("Mein Weg: Zeile 1: ((2 + h)² − 4) / h. Zeile 2: = (4 + h² − 4) / h. Zeile 3: = h²/h = h. Sag mir nur, in welcher Zeile der erste Fehler steht."),
          cl("Zeile 2."),
          du("(2 + h)² = 4 + h² … Was soll da falsch sein?"),
          cl("Setz einmal h = 1 ein: Was ist (2 + 1)², und was ist 4 + 1²?"),
          du("9 und 5. Also ist (2 + h)² nicht 4 + h². Es ist 4 + 4h + h². Dann: (4h + h²) / h = 4 + h."),
          cl("Stimmt. Und was sagt dir 4 + h für kleine h über die Steigung von x² an der Stelle 2? Danach gebe ich dir eine ähnliche Aufgabe mit x₀ = 5."),
        ],
        merke: "Derselbe Fehler wie in der Mittelstufe: das Quadrat einer Summe. Die Zeilennummer plus der Einsetz-Trick genügen – den Fehler findest du selbst.",
      },
    },
    fehler: [
      { so: "„Ist das richtig?“ mit nur dem Ergebnis.", besser: "Den ganzen Weg schicken, nummeriert, und nur nach der Zeile fragen." },
      { so: "Foto schräg, blau, mit Karo – {KI} rät.", besser: "Weißes Blatt, schwarzer Stift, ein Schritt pro Zeile (Pen & Paper)." },
      { so: "Sofort nach dem Fehler fragen.", besser: "Drei Stufen: Zeile → Fehlerart → Fehler." },
    ],
    auftrag: ["Drei gerechnete Aufgaben nummeriert abtippen oder fotografieren und nur nach der Zeile fragen.", "Den Einsetz-Trick (kleine Zahl einsetzen) bei einem eigenen Zweifel anwenden.", "Für jeden Fehler die Art notieren – daraus wird in Lektion 7 deine Fehlerliste."],
    mathilda: "Ich schicke dir gleich meinen Rechenweg. Sag mir bitte nur, in welcher Zeile der erste Fehler steht – nicht, was der Fehler ist.",
  },

  /* ------------------------------------------------------------ 7 */
  {
    id: "fehler", nr: 7, titel: "Fehler verstehen, nicht nur korrigieren", dauer: 7,
    frage: "Warum machst du denselben Fehler zum dritten Mal – und wie wird er zum letzten Mal?",
    kurz: [
      "Ein korrigierter Fehler kommt wieder. Ein verstandener Fehler nicht. Der Unterschied ist die Frage „Warum habe ich das gedacht?“ – und die kann {KI} mit dir beantworten.",
      "Jeder typische Fehler hat einen Denkfehler dahinter: eine Regel, die auf etwas angewendet wurde, wofür sie nicht gilt. Lass dir den Denkfehler benennen, ein Gegenbeispiel geben und eine Faustregel, mit der du ihn künftig erkennst.",
      "Deine persönliche Fehlerliste – fünf Zeilen, immer dabei – ist das wirksamste Dokument deiner Klausurvorbereitung.",
    ],
    prompts: [
      P("Denkfehler benennen", "Ich habe folgenden Fehler gemacht: [Rechnung]. Erklär mir nicht nur, was richtig ist, sondern: Welcher Denkfehler steckt dahinter? Welche Regel habe ich wo fälschlich angewendet? Gib mir ein Gegenbeispiel mit kleinen Zahlen und eine Faustregel.",
        "Nach jedem Fehler, den du gefunden hast."),
      P("Fehler-Galerie", "Nenn mir die fünf typischsten Fehler beim Thema [Thema] – je als falsche Rechnung, ohne Korrektur. Ich finde den Fehler selbst und sage dir, was falsch ist.",
        "Zur Vorbereitung auf eine Arbeit."),
      P("Meine Fehlerliste", "Hier ist meine Fehlerliste: [Liste]. Stell mir drei Aufgaben, bei denen genau diese Fehler lauern, ohne zu verraten, welche.",
        "Jede Woche einmal."),
    ],
    beispiel: {
      mittel: {
        quelle: "Prozentrechnung · Klasse 7/8",
        aufgabe: "Lara sagt: „Ein Preis wird um 20 % erhöht und danach um 20 % gesenkt. Dann ist es wieder der alte Preis.“",
        gespraech: [
          du("Ich dachte auch: +20 % und −20 % heben sich auf. Welcher Denkfehler steckt dahinter? Gegenbeispiel mit kleinen Zahlen und eine Faustregel bitte."),
          cl("Denkfehler: Du behandelst Prozente wie feste Beträge. 20 % sind aber immer 20 % von etwas – und das „etwas“ ist nach der Erhöhung ein anderes. Gegenbeispiel: Starte mit 100 €. Rechne selbst: Wie viel sind 100 € plus 20 %? Und dann 20 % weniger von diesem neuen Preis?"),
          du("120 €. Dann 20 % von 120 = 24, also 96 €. Weniger als vorher!"),
          cl("Genau. Faustregel: Prozente beziehen sich immer auf den aktuellen Wert – nacheinander heißt multiplizieren, nicht addieren: 1,2 · 0,8 = 0,96. Formulier den Satz einmal in deinen Worten für deine Fehlerliste."),
        ],
        merke: "Der Fehler ist nicht „falsch gerechnet“, sondern „Prozent als Betrag gedacht“. Mit dem Namen des Denkfehlers erkennst du ihn beim nächsten Mal.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 25, Nr. 4",
        aufgabe: "Finde und erkläre den Fehler. Tim: f(x) = 4x² ⇒ f′(x) = 4 · 2 = 8. Lea: f(x) = 3x² ⇒ f′(x) = 6x².",
        gespraech: [
          du("Zwei Fehler aus dem Buch: Tim leitet 4x² zu 8 ab, Lea 3x² zu 6x². Ich sehe, dass beides falsch ist – aber welcher Denkfehler steckt jeweils dahinter? Gegenbeispiel und Faustregel bitte."),
          cl("Tim: Er wendet die Regel „Exponent nach vorn“ an, vergisst aber, dass x danach noch da ist – er behandelt x² wie eine Zahl. Gegenbeispiel: Die Steigung von 4x² ist bei x = 0 null und bei x = 1 acht – kann sie dann überall 8 sein? Lea: Sie holt den Exponenten nach vorn, senkt ihn aber nicht. Gegenbeispiel: Leite x² ab – wenn 6x² stimmen würde, müsste (x²)′ = 2x² sein. Was ist (x²)′ wirklich? Faustregel: Exponent nach vorn und um 1 runter – beides, immer."),
          du("(x²)′ = 2x, klar. Für meine Fehlerliste: „x vergessen“ und „Exponent nicht gesenkt“."),
          cl("Gute Namen. Teste dich: Was ist (5x³)′ – und welcher der beiden Fehler lauert hier?"),
        ],
        merke: "Zwei Fehler, zwei Denkfehler, zwei Namen für die Fehlerliste. Das Gegenbeispiel mit x = 0 und x = 1 macht Tims Fehler sichtbar, ohne eine Regel zu zitieren.",
      },
    },
    fehler: [
      { so: "„Was ist richtig?“ – {KI} korrigiert, du nickst.", besser: "„Welcher Denkfehler steckt dahinter?“ – du verstehst." },
      { so: "Fehler im Heft durchstreichen und vergessen.", besser: "Fehlerliste mit Namen des Denkfehlers – fünf Zeilen, immer griffbereit." },
    ],
    auftrag: ["Fehlerliste anlegen: Name des Denkfehlers, Faustregel, ein Gegenbeispiel.", "Für dein aktuelles Thema die Fehler-Galerie durcharbeiten.", "Die Liste in die Vorbereitung jeder Arbeit mitnehmen."],
    mathilda: "Ich habe einen Fehler gemacht und will verstehen, welcher Denkfehler dahintersteckt. Gib mir ein Gegenbeispiel mit kleinen Zahlen und eine Faustregel – und lass mich das Richtige selbst finden.",
  },

  /* ------------------------------------------------------------ 8 */
  {
    id: "text", nr: 8, titel: "Textaufgaben übersetzen", dauer: 8,
    frage: "Wie wird aus einem Text eine Gleichung – ohne dass {KI} sie dir hinschreibt?",
    kurz: [
      "Eine Textaufgabe ist eine verschlüsselte Gleichung. Jeder Satz enthält eine Information, die du in Mathematik übersetzen musst. Wer das Übersetzen kann, kann jede Textaufgabe – wer es nicht kann, kann keine.",
      "{KI} ist hier der Fragesteller: Was ist unbekannt? Was weißt du über die Unbekannte? Welche Formel verbindet die gegebenen Größen? Du antwortest Satz für Satz, und am Ende steht die Gleichung – von dir.",
      "Danach kommt die Kontrolle: Hast du so viele Bedingungen wie Unbekannte? Und passt die Einheit zum Ergebnis?",
    ],
    prompts: [
      P("Übersetzen lassen – durch Fragen", "Hilf mir, diese Textaufgabe in Mathematik zu übersetzen, ohne die Gleichung selbst aufzuschreiben: [Text]. Frag mich der Reihe nach: 1. Was ist die Unbekannte? 2. Welche Information gibt jeder Satz? 3. Welche Formel verbindet alles? Ich antworte, du prüfst.",
        "Für jede Textaufgabe."),
      P("Übersetzungs-Wörterbuch", "Welche Signalwörter in dieser Aufgabe stehen für welche Rechenzeichen oder Bedingungen? Nur die Liste Wort → Mathematik, keine Lösung: [Text]",
        "Wenn einzelne Formulierungen unklar sind."),
      P("Zählen und Einheit", "Hier meine Übersetzung: [Gleichung(en)]. Prüf nur zwei Dinge: Habe ich so viele Bedingungen wie Unbekannte? Und stimmt die Einheit meines Ergebnisses zur Frage?",
        "Vor dem Rechnen und nach dem Ergebnis."),
    ],
    beispiel: {
      mittel: {
        quelle: "Lineare Funktionen · Klasse 8",
        aufgabe: "Ein Fahrradverleih nimmt 5 € Grundgebühr und 3 € je Stunde. a) Stelle den Preis als Funktion der Stunden x dar. b) Mia hat 23 €. Wie lange kann sie fahren?",
        gespraech: [
          du("Hilf mir, die Aufgabe zu übersetzen, ohne die Gleichung aufzuschreiben. Frag mich: Unbekannte, Information je Satz, Formel. [Aufgabe]"),
          cl("Frage 1: Welche Größe verändert sich, und welche hängt davon ab?"),
          du("Die Stunden x verändern sich, der Preis hängt davon ab."),
          cl("Frage 2: Satz „5 € Grundgebühr“ – zahlt man das einmal oder pro Stunde? Und „3 € je Stunde“ – was passiert mit diesem Betrag, wenn x wächst?"),
          du("Grundgebühr einmal. 3 € kommen pro Stunde dazu, also 3 · x."),
          cl("Frage 3: Dann schreib den Preis als Summe aus beidem auf – das ist deine Funktion. Und für b): Was ist bei Mia gegeben – der Preis oder die Zeit?"),
          du("p(x) = 3x + 5. Bei Mia ist der Preis 23 gegeben, gesucht x: 3x + 5 = 23."),
          cl("Beides richtig übersetzt. Prüf noch die Einheit: Was kommt bei b) heraus – Euro oder Stunden?"),
        ],
        merke: "Drei Fragen, und die Gleichung 3x + 5 = 23 steht da – aus deiner Hand. Die Einheitenfrage verhindert, dass du am Ende „6 €“ schreibst.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 22, Training II, T4",
        aufgabe: "Ein Wetterballon steigt. Seine Höhe über dem Startpunkt beträgt h(t) = −t² + 12t (in Metern, t in Minuten, 0 ≤ t ≤ 6). a) Wie schnell steigt er im Mittel in den ersten 4 Minuten? b) Bestimme seine momentane Steiggeschwindigkeit bei t = 4 mit der h-Methode. c) Zu welchem Zeitpunkt ist die Steiggeschwindigkeit null?",
        gespraech: [
          du("Hilf mir, die Aufgabe zu übersetzen, ohne Formeln hinzuschreiben. Frag mich, welche mathematische Größe hinter jedem Satz steckt. [Aufgabe]"),
          cl("a) „Wie schnell im Mittel in den ersten 4 Minuten“ – welche zwei Zeitpunkte vergleichst du, und wie heißt die Größe, die eine Änderung über ein Intervall misst?"),
          du("t = 0 und t = 4. Mittlere Änderungsrate: (h(4) − h(0)) / 4."),
          cl("Richtig übersetzt. b) „Momentane Steiggeschwindigkeit bei t = 4 mit der h-Methode“ – welche Größe ist das, und welchen Term musst du dafür aufstellen?"),
          du("Die Ableitung h′(4). Differenzenquotient (h(4 + h) − h(4)) / h und dann h gegen 0."),
          cl("Gut – nur eine Warnung zur Schreibweise: Die Aufgabe nutzt h sowohl als Funktionsname als auch als kleine Schrittweite. Wie löst du das? Und c) „Steiggeschwindigkeit null“ – ist das eine Bedingung an h oder an h′?"),
          du("Ich nenne die Schrittweite Δt. c) ist h′(t) = 0."),
        ],
        merke: "Jede Teilaufgabe wurde in eine Größe übersetzt: Differenzenquotient, Ableitung, Nullstelle der Ableitung. Die Namenskollision h / h hat {KI} angesprochen – gelöst hast du sie.",
      },
    },
    fehler: [
      { so: "„Stell die Gleichung auf.“ – {KI} übersetzt, du schreibst ab.", besser: "„Frag mich, was jeder Satz bedeutet“ – du übersetzt." },
      { so: "Ergebnis ohne Einheit und ohne Antwortsatz.", besser: "Zählen-und-Einheit-Prompt: Bedingungen = Unbekannte? Einheit passt?" },
    ],
    auftrag: ["Drei Textaufgaben nur übersetzen – noch nicht rechnen.", "Ein eigenes Übersetzungs-Wörterbuch anlegen (je größer als, insgesamt, pro, im Mittel …).", "Den Bereich „Textaufgaben übersetzen“ in der App einmal durchspielen."],
    mathilda: "Ich habe eine Textaufgabe. Hilf mir, sie in Mathematik zu übersetzen, ohne die Gleichung selbst hinzuschreiben: Frag mich Satz für Satz, welche Information drinsteckt.",
  },

  /* ------------------------------------------------------------ 9 */
  {
    id: "ueben", nr: 9, titel: "Üben mit {KI}", dauer: 7,
    frage: "Wie machst du aus {KI} einen Aufgabengenerator, der genau deine Lücke trifft?",
    kurz: [
      "Verstehen ist die halbe Miete, Üben die andere. {KI} erzeugt beliebig viele Aufgaben – aber nur, wenn du genau sagst, welche: Thema, Schwierigkeit, Aufgabentyp, und dass die Lösungen erst auf Nachfrage kommen.",
      "Der stärkste Übungstyp ist „Welche Regel?“: {KI} zeigt vier Aufgaben, die sich zum Verwechseln ähnlich sehen, und du entscheidest nur, welcher Weg passt – noch bevor du rechnest. Das trainiert den Blick, der in der Klausur zählt.",
      "Jede Übungsrunde endet mit einer Abfrage ohne Hilfsmittel: fünf Fragen, du antwortest aus dem Kopf, {KI} bewertet erst am Schluss.",
    ],
    prompts: [
      P("Aufgaben bestellen", "Gib mir 5 Aufgaben zum Thema [Thema], Schwierigkeit [leicht/mittel/schwer], im Stil von [Buch/Arbeitsblatt]. Nur die Aufgaben, keine Lösungen. Ich schicke dir meine Ergebnisse, und du sagst pro Aufgabe nur „richtig“ oder „nochmal“.",
        "Für jede Übungsrunde."),
      P("Welche Regel?", "Zeig mir 4 Aufgaben zu [Thema], die ähnlich aussehen, aber verschiedene Wege brauchen. Ich sage dir nur, welcher Weg passt – ohne zu rechnen. Du bestätigst oder fragst nach.",
        "Vor Klassenarbeiten – trainiert den ersten Blick."),
      P("Abfrage", "Frag mich 5 Fragen zum Thema [Thema] ab, eine nach der anderen. Keine Hilfe, keine Hinweise. Erst nach der fünften Antwort sagst du mir, was richtig war und was ich wiederholen sollte.",
        "Zum Abschluss einer Lerneinheit."),
    ],
    beispiel: {
      mittel: {
        quelle: "Parabeln · Klasse 9",
        aufgabe: "Üben: Normalform in Scheitelform umwandeln, z. B. f(x) = x² − 6x + 5.",
        gespraech: [
          du("Gib mir 5 Aufgaben: Normalform in Scheitelform umwandeln, mittel, ganzzahlig. Keine Lösungen. Ich schicke meine Ergebnisse, du sagst nur „richtig“ oder „nochmal“."),
          cl("1. f(x) = x² − 6x + 5   2. f(x) = x² + 4x + 1   3. f(x) = x² − 2x − 8   4. f(x) = 2x² − 8x + 3   5. f(x) = −x² + 6x − 7. Schick sie mir, wenn du so weit bist."),
          du("1. (x − 3)² − 4   2. (x + 2)² − 3   3. (x − 1)² − 9   4. 2(x − 2)² − 5   5. −(x − 3)² + 2"),
          cl("1 richtig, 2 richtig, 3 richtig, 4 richtig, 5 richtig. Alle fünf. Dann die Abfrage ohne Hilfsmittel – Frage 1: Woran erkennst du an der Normalform, ob der Scheitel über oder unter der x-Achse liegt?"),
        ],
        merke: "Fünf Aufgaben, fünf Ergebnisse, fünf Urteile – mehr sagt {KI} nicht. Erst wenn eines „nochmal“ heißt, geht es zurück zu Lektion 6.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 38, Training III, T2",
        aufgabe: "Alle vier Terme enthalten sin und x². Welche Regel brauchst du jeweils? a) x² · sin x   b) sin(x²)   c) sin x / x²   d) 3 sin x + x²",
        gespraech: [
          du("Welche-Regel-Training: Vier Terme mit sin und x². Ich sage nur, welche Ableitungsregel passt, ohne zu rechnen. a) x² · sin x: Produktregel. b) sin(x²): Kettenregel. c) sin x / x²: Quotientenregel. d) 3 sin x + x²: Summen- und Faktorregel."),
          cl("Alle vier richtig zugeordnet. Zwei Nachfragen, damit es sitzt: Bei b) – was ist die innere, was die äußere Funktion? Und bei c): Ginge es auch ohne Quotientenregel?"),
          du("b) innen x², außen sin. c) Ja: sin x · x⁻², dann Produktregel."),
          cl("Stimmt beides. Jetzt die nächste Runde, etwas gemeiner: a) e^(2x) · x   b) e^(x²)   c) x / e^x   d) (e^x)². Nur die Regel."),
        ],
        merke: "Die Buchaufgabe T2 ist genau dieses Spiel: erst der Blick, dann die Rechnung. {KI} macht daraus beliebig viele Runden.",
      },
    },
    fehler: [
      { so: "„Gib mir Aufgaben“ – ohne Thema, Stufe, Typ.", besser: "Thema + Schwierigkeit + Aufgabentyp + „keine Lösungen“." },
      { so: "{KI} schickt Aufgaben mit Lösungen darunter.", besser: "„Lösungen erst, wenn ich alle fünf geschickt habe.“" },
    ],
    auftrag: ["Eine Übungsrunde mit 5 bestellten Aufgaben durchziehen.", "Eine Welche-Regel-Runde zu deinem aktuellen Thema.", "Zum Schluss die 5-Fragen-Abfrage ohne Hilfsmittel."],
    mathilda: "Gib mir fünf Übungsaufgaben zu meinem aktuellen Thema, ohne Lösungen. Ich schicke dir meine Ergebnisse, und du sagst pro Aufgabe nur „richtig“ oder „nochmal“.",
  },

  /* ------------------------------------------------------------ 10 */
  {
    id: "system", nr: 10, titel: "Dein Lernsystem", dauer: 8,
    frage: "Wie wird aus zehn Prompts eine Routine, die bis zur Klausur trägt?",
    kurz: [
      "Die stärkste Methode der Welt heißt: erklären. Wer etwas erklären kann, kann es. {KI} ist der perfekte Zuhörer dafür – er unterbricht nicht, aber er findet jede Lücke.",
      "Zum Abschluss eines Kapitels lässt du dir eine Zusammenfassung schreiben – aber erst, nachdem du selbst eine geschrieben hast. Der Vergleich zeigt, was dir fehlt. Daraus wird ein Spickzettel in deiner Handschrift.",
      "Und die Grenze: {KI} kann sich verrechnen. Jedes Ergebnis prüfst du mit einer Probe oder im Werkzeug der App. {KI} ist dein Trainer – der Schiedsrichter bist du.",
    ],
    prompts: [
      P("Ich erkläre, du findest die Lücke", "Ich erkläre dir jetzt [Thema/Verfahren], als wärst du ein Mitschüler, der es nicht kennt. Unterbrich nicht. Am Ende sagst du mir nur: Wo war meine Erklärung lückenhaft oder falsch? Nenn die Stelle, nicht die Korrektur. Los: [deine Erklärung]",
        "Zum Abschluss jedes Themas."),
      P("Zusammenfassung vergleichen", "Hier ist meine Zusammenfassung von [Kapitel]: [Text]. Schreib keine eigene. Sag mir nur: Was fehlt, was ist ungenau, was ist überflüssig?",
        "Vor dem Spickzettel."),
      P("Wochenplan", "Ich schreibe am [Datum] eine Arbeit über [Themen]. Meine Fehlerliste: [Liste]. Mach mir einen Plan für die Tage bis dahin: pro Tag 20 Minuten, mit Abfrage am Ende jedes Tages. Keine Lösungen, nur Aufgabenarten.",
        "Zwei Wochen vor der Arbeit."),
    ],
    beispiel: {
      mittel: {
        quelle: "Satz des Pythagoras · Klasse 9",
        aufgabe: "Erklären statt lernen: Eine 5 m lange Leiter steht 1,5 m von der Wand entfernt. Wie hoch reicht sie?",
        gespraech: [
          du("Ich erkläre dir die Leiter-Aufgabe, als wärst du ein Mitschüler. Unterbrich nicht, nenn am Ende nur die Lücke. Also: Die Leiter, die Wand und der Boden bilden ein Dreieck. Die Leiter ist die lange Seite. Pythagoras sagt a² + b² = c², also 5² = 1,5² + h². Dann h² = 25 − 2,25 = 22,75, also h = √22,75 ≈ 4,77 m."),
          cl("Rechnung und Ergebnis stimmen. Lücke: Du hast gesagt „die Leiter ist die lange Seite“, aber nicht, warum gerade sie die Hypotenuse ist – was muss im Dreieck dafür gelten, und wo ist es hier?"),
          du("Der rechte Winkel liegt zwischen Wand und Boden. Die Hypotenuse ist die Seite gegenüber vom rechten Winkel – das ist die Leiter."),
          cl("Jetzt ist die Erklärung vollständig. Das ist genau der Satz, der auf deinen Spickzettel gehört: Hypotenuse = Seite gegenüber dem rechten Winkel."),
        ],
        merke: "Die Rechnung war richtig – die Erklärung hatte trotzdem eine Lücke. Genau diese Lücken kosten in der Arbeit Punkte bei „Begründe“.",
      },
      ober: {
        quelle: "Buch Ableitungen · S. 41, Nr. 1 b)",
        aufgabe: "Erklären statt lernen: Bestimme die Gleichung der Tangente an den Graphen von f(x) = x³ an der Stelle x₀ = 1.",
        gespraech: [
          du("Ich erkläre dir, wie man eine Tangente aufstellt, an f(x) = x³ bei x₀ = 1. Unterbrich nicht, nenn am Ende nur die Lücke. Also: Eine Tangente ist eine Gerade y = mx + b. Die Steigung m ist die Ableitung an der Stelle: f′(x) = 3x², also m = f′(1) = 3. Dann setze ich den Punkt ein: y = 3x + b, mit x = 1 und y = 1 wird 1 = 3 + b, b = −2. Tangente: y = 3x − 2."),
          cl("Rechnung und Ergebnis stimmen. Lücke: Du hast „y = 1“ eingesetzt, aber nie gesagt, woher das y kommt – welcher Punkt des Graphen ist das, und wie berechnet man ihn allgemein?"),
          du("Der Berührpunkt P(x₀ | f(x₀)). Hier f(1) = 1³ = 1."),
          cl("Vollständig. Und ein Satz für deinen Spickzettel: Welche zwei Dinge braucht eine Tangente – und wo bekommst du beide her?"),
        ],
        merke: "Tangente = Punkt + Steigung, beide aus f und f′. Die Lücke war der Berührpunkt – im Kopf vorhanden, in der Erklärung nicht. Genau da verliert man in der Klausur die Begründungspunkte.",
      },
    },
    fehler: [
      { so: "„Fass das Kapitel zusammen.“ – {KI} schreibt, du druckst aus.", besser: "Erst eigene Zusammenfassung, dann nur vergleichen lassen." },
      { so: "{KI}s Ergebnis blind übernehmen.", besser: "Probe rechnen oder im Werkzeug der App prüfen – {KI} kann sich verrechnen." },
      { so: "Alles am Abend vor der Arbeit.", besser: "Wochenplan: 20 Minuten täglich, Abfrage am Ende." },
    ],
    auftrag: ["Dein aktuelles Thema einmal komplett erklären – Lücke finden lassen.", "Eigene Zusammenfassung schreiben, vergleichen lassen, Spickzettel von Hand.", "Wochenplan für die nächste Arbeit erstellen und Tag 1 heute machen."],
    mathilda: "Ich erkläre dir jetzt mein aktuelles Thema, als wärst du ein Mitschüler. Unterbrich nicht – sag mir am Ende nur, wo meine Erklärung lückenhaft war, ohne die Korrektur zu verraten.",
  },
];

/* Die zehn Grundregeln als Spickzettel (Übersicht und Abschluss) */
export const GRUNDREGELN = [
  "Startprompt zuerst: Klasse, Thema, „keine Lösungen“.",
  "Erklär mir – nicht: löse mir.",
  "Erst die Fragestellung verstehen, dann rechnen.",
  "Fachwörter auf drei Stufen – und zurückerklären.",
  "Nur der nächste Schritt, als Frage.",
  "Fehler: erst die Zeile, dann die Art, zuletzt der Fehler.",
  "Denkfehler benennen, Fehlerliste führen.",
  "Textaufgaben übersetzen durch Fragen.",
  "Aufgaben bestellen: Thema, Stufe, Typ, keine Lösungen.",
  "Erklären statt lernen – und jedes Ergebnis selbst prüfen.",
];

/* ---------- Hilfen ---------- */
/* Lektionstext je Kurs: kurz und schritte können je KI verschieden sein */
export const kurzFuer = (l, kursId) => (Array.isArray(l.kurz) ? l.kurz : l.kurz[kursId]);
export const schritteFuer = (l, kursId) => (l.schritte ? l.schritte[kursId] || null : null);
export const lektion = (id) => LEKTIONEN.find((l) => l.id === id) || null;
export const naechsteLektion = (fertig = {}) => LEKTIONEN.find((l) => !fertig[l.id]) || LEKTIONEN[LEKTIONEN.length - 1];
export const anteilFertig = (fertig = {}) => LEKTIONEN.filter((l) => fertig[l.id]).length / LEKTIONEN.length;
export const gesamtMinuten = () => LEKTIONEN.reduce((s, l) => s + l.dauer, 0);
/* Platzhalter in Prompts: [Klasse], [Thema] … werden mit dem Profil gefüllt, Rest bleibt stehen */
export function promptFuellen(text, werte = {}) {
  return text.replace(/\[([^\]]+)\]/g, (ganz, schluessel) => (werte[schluessel] ? String(werte[schluessel]) : ganz));
}

/* ---------- Die drei Wege: Mathe mit KI lernen (Wahlseite „kiwahl“) ----------
   Stand der Altersregeln: 19.10.2026. Claude.ai ist nur ab 18; ein eigenes Google-Konto gibt es in
   Deutschland ab 16 (unter 18 mit Jugendschutz-Filtern, Verlauf wird nicht gespeichert); Family-Link-Konten
   (unter 16) haben im EWR kein Gemini. Mathilda AI läuft in der App auf Claude: für alle, unter 16 mit Zustimmung der Eltern.
   Vor jeder Änderung die Bedingungen der Anbieter neu prüfen. */
export const WEGE = [
  {
    id: "mathilda", titel: "Mathilda AI", alter: "für alle", altersZeile: "Jede Klassenstufe",
    zeile: "Die KI direkt in dieser App – ohne eigenes Konto bei einem KI-Anbieter.",
    voraussetzungen: [
      "Keine Altersgrenze – auch unter 16.",
      "Unter 16: ein Elternteil muss der KI-Nutzung zustimmen (Link per WhatsApp, dauert zwei Minuten).",
      "Du stimmst einmal zu, dass Vorname, Klasse und Lernstand an die KI gehen. Fotos werden nicht gespeichert.",
      "Kein Konto bei Google oder Anthropic nötig.",
    ],
    gutZuWissen: "Läuft auf Claude, kennt deinen Lernstand und hält sich an die Regel „erklären statt lösen“. Pro Tag gibt es ein festes Kontingent an Anfragen.",
    knopf: "Mathilda öffnen", ziel: { ansicht: "analyse", foto: "chat" },
  },
  {
    id: "gemini", titel: "Mathe lernen mit Gemini", alter: "ab 16", altersZeile: "Klasse 10–11 und älter",
    zeile: "Zehn Lektionen für die Google-KI – mit Beispielen aus der Mittelstufe.",
    voraussetzungen: [
      "Mindestens 16 Jahre – so alt musst du für ein eigenes Google-Konto in Deutschland sein.",
      "Ein eigenes Google-Konto (kein Kinderkonto über Family Link – dort gibt es in der EU kein Gemini).",
      "Unter 18 schaltet Google zusätzliche Filter zum Jugendschutz ein und speichert deinen Verlauf nicht – im Kurs steht, wie du dir den Startprompt trotzdem merkst.",
    ],
    gutZuWissen: "Der Kurs funktioniert auch mit 18 und älter, die Beispiele kommen aus Parabeln, Gleichungen, Prozent und Pythagoras.",
    knopf: "Kurs mit Gemini öffnen", ziel: { ansicht: "geminikurs" },
  },
  {
    id: "claude", titel: "Mathe lernen mit Claude", alter: "ab 18", altersZeile: "Klasse 12–13, Studium",
    zeile: "Zehn Lektionen für Claude – mit Beispielen aus dem Buch Ableitungen.",
    voraussetzungen: [
      "Mindestens 18 Jahre – das schreibt Anthropic für claude.ai vor.",
      "Ein eigenes Claude-Konto (E-Mail oder Google-Anmeldung).",
      "Noch keine 18? Dann nimm den Gemini-Kurs ab 16 oder Mathilda AI – dort laufen dieselben Prompts.",
    ],
    gutZuWissen: "Die Beispiele stammen aus dem Buch Differentialrechnung (Seitenangaben im Kurs) – ideal für Oberstufe und Abitur.",
    knopf: "Kurs mit Claude öffnen", ziel: { ansicht: "claudekurs" },
  },
];

/* Welche Wege passen? stufe: "u16" | "16" | "18" – Reihenfolge = Empfehlung */
export const ALTERSSTUFEN = [
  { id: "u16", name: "Unter 16" },
  { id: "16", name: "16 oder 17" },
  { id: "18", name: "18 oder älter" },
];
export function wegeFuerAlter(stufe) {
  if (stufe === "u16") return ["mathilda"];
  if (stufe === "16") return ["gemini", "mathilda"];
  if (stufe === "18") return ["claude", "gemini", "mathilda"];
  return [];
}
export const weg = (id) => WEGE.find((w) => w.id === id) || null;
