/* Erklärtexte für „Entdecken“ im Kopfrechenbereich – reine Daten, ohne React.
   Je Thema: Ziel in einem Satz, die Vorgehensschritte (nummeriert), ein durchgerechnetes Beispiel,
   typische Fehler und ein Merksatz. Bruchmarkup {Zähler|Nenner} wird in der Oberfläche gesetzt. */

export const KOPF_ERKLAERUNG = {
  plusminus: {
    titel: "Schriftlich Plus und Minus",
    ziel: "Große Zahlen sicher addieren und subtrahieren, Spalte für Spalte, immer von rechts nach links.",
    schritte: [
      ["Untereinander schreiben", "Einer unter Einer, Zehner unter Zehner, Hunderter unter Hunderter. Ein Strich kommt unter die zweite Zahl."],
      ["Rechts beginnen", "Rechne die Einerspalte zuerst. Dort, wo es am häufigsten einen Übertrag gibt, beginnt der Fehler sonst."],
      ["Übertrag notieren", "Plus: Kommt eine Spalte auf 10 oder mehr, schreibst du nur die Einerziffer hin und trägst die 1 klein in die nächste Spalte. Minus: Ergänze die untere Ziffer zur oberen. Reicht sie nicht, ergänze bis zum nächsten Zehner und trage eine 1 weiter."],
      ["Spalte für Spalte nach links", "Vergiss den Übertrag nicht mitzurechnen. Er steht in der nächsten Spalte als eigene Zahl dabei."],
      ["Probe machen", "Plus prüfst du mit Minus: 734 − 256 muss 478 ergeben. Minus prüfst du mit Plus."],
    ],
    beispiel: { aufgabe: "478 + 256", zeilen: ["Einer: 8 + 6 = 14 → schreibe 4, merke 1", "Zehner: 7 + 5 + 1 = 13 → schreibe 3, merke 1", "Hunderter: 4 + 2 + 1 = 7 → schreibe 7", "478 + 256 = 734"] },
    fehler: ["Übertrag vergessen oder zweimal gerechnet", "Zahlen nicht stellengerecht untereinander geschrieben", "Beim Minus die obere von der unteren Ziffer abgezogen"],
    merk: "Von rechts nach links, und der Übertrag gehört in die nächste Spalte.",
  },
  multiplizieren: {
    titel: "Multiplizieren",
    ziel: "Produkte großer Zahlen im Kopf und auf dem Papier in kleine, leichte Teilprodukte zerlegen.",
    schritte: [
      ["Das kleine Einmaleins sitzen haben", "Alles bis 10 · 10 muss ohne Nachdenken da sein. Der Rest sind nur Zerlegungen."],
      ["Nach Stellen zerlegen", "Zerlege eine Zahl in Zehner und Einer, zum Beispiel 14 = 10 + 4. Mal 10 heißt: eine Null anhängen."],
      ["Teilprodukte einzeln rechnen", "Multipliziere die andere Zahl mit jedem Teil: 23 · 10 = 230 und 23 · 4 = 92."],
      ["Teilprodukte addieren", "230 + 92 = 322. Wer beide Zahlen zerlegt, erhält vier Teilflächen und addiert sie."],
      ["Überschlag zur Kontrolle", "Runde grob: 23 · 14 ≈ 20 · 15 = 300. Das Ergebnis muss in der Nähe liegen."],
    ],
    beispiel: { aufgabe: "23 · 14", zeilen: ["23 · 10 = 230", "23 · 4 = 92", "230 + 92 = 322", "Überschlag: 20 · 15 = 300 ✓"] },
    fehler: ["Beim Anhängen der Null verrutscht (23 · 10 ist 230, nicht 203)", "Ein Teilprodukt vergessen", "Kein Überschlag am Ende"],
    merk: "Zerlegen, einzeln rechnen, addieren – und mit dem Überschlag prüfen.",
  },
  primzahlen: {
    titel: "Primzahlen",
    ziel: "Schnell entscheiden, ob eine Zahl eine Primzahl ist.",
    schritte: [
      ["Wissen, was prim heißt", "Eine Primzahl hat genau zwei Teiler: 1 und sich selbst. Die 1 ist keine Primzahl, die 2 ist die einzige gerade."],
      ["Gerade Zahlen aussortieren", "Alles, was auf 0, 2, 4, 6 oder 8 endet, ist durch 2 teilbar. Ausnahme: die 2 selbst."],
      ["Teilbarkeitsregeln anwenden", "Endet sie auf 0 oder 5, ist sie durch 5 teilbar. Ist die Quersumme durch 3 teilbar, ist die Zahl durch 3 teilbar."],
      ["Bis zur Wurzel testen", "Teste die Primzahlen 7, 11, 13 … nur so lange, bis ihr Quadrat die Zahl übersteigt. Für 97 genügt es bis 9 zu testen (9² = 81, 11² = 121)."],
      ["Urteil fällen", "Geht kein Test auf, ist die Zahl prim. Geht einer auf, hast du schon einen Teiler gefunden."],
    ],
    beispiel: { aufgabe: "Ist 91 eine Primzahl?", zeilen: ["91 endet auf 1: nicht durch 2 oder 5 teilbar", "Quersumme 10: nicht durch 3 teilbar", "91 : 7 = 13 → 7 ist ein Teiler", "91 ist keine Primzahl: 91 = 7 · 13"] },
    fehler: ["Die 1 für eine Primzahl halten", "91 oder 87 für prim halten, weil sie „so aussehen“", "Zu früh aufhören, bevor die Wurzelgrenze erreicht ist"],
    merk: "Gerade, 5er, Quersumme – dann bis zur Wurzel testen.",
  },
  primfaktoren: {
    titel: "Primfaktoren",
    ziel: "Eine Zahl vollständig in Primzahlen zerlegen, mit dem Faktorbaum oder durch fortlaufendes Abdividieren.",
    schritte: [
      ["Kleinsten Teiler suchen", "Probiere der Reihe nach 2, 3, 5, 7 … Der kleinste Teiler ist immer eine Primzahl."],
      ["Abspalten und weitermachen", "Teile die Zahl durch diesen Teiler. Der Teiler ist ein fertiger Primfaktor, mit dem Rest machst du weiter."],
      ["Wiederholen, bis 1 bleibt", "Gleiche Teiler darfst du mehrfach verwenden. Sobald der Rest selbst prim ist, ist er der letzte Faktor."],
      ["Als Produkt hinschreiben", "Ordne die Faktoren der Größe nach und fasse gleiche zu Potenzen zusammen: 2 · 2 · 3 · 7 = 2² · 3 · 7."],
      ["Probe", "Multipliziere die Faktoren wieder. Es muss die Ausgangszahl herauskommen."],
    ],
    beispiel: { aufgabe: "84", zeilen: ["84 : 2 = 42", "42 : 2 = 21", "21 : 3 = 7  (7 ist prim)", "84 = 2 · 2 · 3 · 7 = 2² · 3 · 7"] },
    fehler: ["Einen Faktor stehen lassen, der selbst noch zerlegbar ist (zum Beispiel 4 oder 9)", "Faktoren doppelt aufgeschrieben oder vergessen", "Keine Probe"],
    merk: "Immer den kleinsten Teiler zuerst, bis nur noch Primzahlen übrig sind.",
  },
  potenzen: {
    titel: "Quadrate und Wurzeln",
    ziel: "Quadratzahlen abrufen, Wurzeln daraus ziehen und mit Kubikzahlen umgehen. Kuben gehören hier mit dazu.",
    schritte: [
      ["Quadrat heißt Fläche", "n² = n · n ist die Fläche eines Quadrats mit der Seite n. 12² = 12 · 12 = 144, nicht 2 · 12."],
      ["Quadrate geschickt rechnen", "Zerlege: 23² = 20² + 2 · 20 · 3 + 3² = 400 + 120 + 9 = 529. Bei Endziffer 5 gilt: 35² = 3 · 4 und dann 25 anhängen = 1225."],
      ["Wurzel ist die Umkehrung", "√49 fragt: Welche Zahl mit sich selbst multipliziert ergibt 49? Antwort: 7. Lerne dafür die Quadratzahlen bis 15² oder 20²."],
      ["Große Wurzel in drei Schritten", "Endziffer bestimmt die möglichen Einer, die Zehner liest du aus dem Zahlenbereich ab, die Mitte aus dem Produkt der Nachbarquadrate. Probe durch Quadrieren."],
      ["Kubik heißt Raum", "n³ = n · n · n. 3³ = 27, 4³ = 64, 5³ = 125. Erst das Quadrat bilden, dann noch einmal mit n multiplizieren."],
    ],
    beispiel: { aufgabe: "√529 und 23²", zeilen: ["23² = 400 + 120 + 9 = 529", "Umkehrung: √529 = 23", "3³ = 3 · 3 · 3 = 9 · 3 = 27"] },
    fehler: ["n² mit 2 · n verwechselt", "Bei Wurzeln nur raten statt die Endziffer zu nutzen", "Kubik wie Quadrat gerechnet (4³ ist 64, nicht 16)"],
    merk: "Quadrat = Fläche, Wurzel = Seitenlänge, Kubik = Raum.",
  },
  division: {
    titel: "Schriftlich teilen",
    ziel: "Große Zahlen durch eine Zahl teilen, Ziffer für Ziffer, mit oder ohne Rest.",
    schritte: [
      ["Von links beginnen", "Nimm so viele Ziffern vorne, bis die Zahl mindestens so groß ist wie der Teiler."],
      ["Wie oft passt der Teiler?", "Schreibe die größte ganze Zahl, die passt, ins Ergebnis. Nur das Passen zählt, nicht das Abrunden im Kopf."],
      ["Mal nehmen und abziehen", "Rechne Ergebnisziffer mal Teiler und ziehe das Produkt unten ab. Der Rest muss kleiner sein als der Teiler."],
      ["Nächste Ziffer herunterholen", "Setze die nächste Ziffer der Ausgangszahl rechts neben den Rest. Dann beginnt der Vierklang von vorn."],
      ["Rest und Probe", "Sind alle Ziffern verbraucht, steht der Rest da. Probe: Ergebnis mal Teiler plus Rest ergibt die Ausgangszahl."],
    ],
    beispiel: { aufgabe: "756 : 4", zeilen: ["7 : 4 = 1, Rest 3", "35 : 4 = 8, Rest 3", "36 : 4 = 9, Rest 0", "756 : 4 = 189, Probe 189 · 4 = 756 ✓"] },
    fehler: ["Eine Null im Ergebnis vergessen (zum Beispiel 408 : 4 = 102)", "Rest größer oder gleich dem Teiler stehen lassen", "Ziffer nicht heruntergeholt"],
    merk: "Passt – mal – minus – herunterholen, immer im gleichen Takt.",
  },
  bruchrechnen: {
    titel: "Bruchrechnung",
    ziel: "Brüche kürzen, addieren, subtrahieren, multiplizieren und dividieren, und das Ergebnis immer gekürzt angeben.",
    schritte: [
      ["Kürzen: Zähler und Nenner durch dasselbe teilen", "Suche den größten gemeinsamen Teiler: {6|8} → durch 2 → {3|4}. Der Wert ändert sich nicht."],
      ["Plus und Minus: gleichnamig machen", "Bestimme den Hauptnenner (kleinstes gemeinsames Vielfaches der Nenner) und erweitere beide Brüche darauf. Dann nur die Zähler addieren oder subtrahieren."],
      ["Mal: Zähler mal Zähler, Nenner mal Nenner", "Kreuzkürzen spart Arbeit: Kürze vor dem Multiplizieren Zähler gegen Nenner über Kreuz."],
      ["Geteilt: mit dem Kehrwert malnehmen", "Der zweite Bruch wird umgedreht, aus dem Geteilt-Zeichen wird ein Mal."],
      ["Immer am Ende kürzen", "Prüfe, ob Zähler und Nenner noch einen gemeinsamen Teiler haben. Ist der Zähler größer, schreibe zusätzlich die gemischte Zahl."],
    ],
    beispiel: { aufgabe: "{1|2} + {1|3}", zeilen: ["Hauptnenner 6", "{1|2} = {3|6} und {1|3} = {2|6}", "{3|6} + {2|6} = {5|6}", "5 und 6 haben keinen gemeinsamen Teiler: fertig"] },
    fehler: ["Nenner addiert ({1|2} + {1|3} ≠ {2|5})", "Beim Geteilt-Rechnen den falschen Bruch umgedreht", "Ergebnis nicht gekürzt"],
    merk: "Plus und Minus brauchen gleiche Nenner, Mal und Geteilt nicht.",
  },
};

export const KOPF_REIHENFOLGE = ["plusminus", "multiplizieren", "potenzen", "primzahlen", "primfaktoren", "division", "bruchrechnen"];
