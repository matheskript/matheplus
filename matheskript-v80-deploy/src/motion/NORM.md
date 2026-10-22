# Motion-Norm – wie eine Animation den Kern eines Themas zeigt (seit 22.10.2026)

Ziel: Ein Schüler versteht aus der Animation allein, worum es geht – ohne den Text drumherum zu lesen.
Jede Animation ist ein kleines Erklärvideo von 10–35 Sekunden mit einer einzigen Einsicht.

## 1. Eine Animation = eine Frage + eine Einsicht
- `frage` (im Eintrag in `medien*.js`): die Frage, die die Animation beantwortet. Steht vor dem Start unter dem Standbild.
  Schülersprache, höchstens 70 Zeichen, endet mit „?“. Beispiele: „Warum gibt minus mal minus plus?“ · „Wie viele Viertel passen in drei Ganze?“
- `kern`: der eine Satz, der am Ende erscheint und stehen bleibt („Das Wichtigste“). Höchstens 130 Zeichen.
  Er sagt den **Grund** oder die **Regel in den Bildern der Animation** – nicht das Zahlenergebnis.
  Richtig: „Durch ein Viertel teilen heißt mal 4 – weil in jedes Ganze vier Viertel passen.“
  Falsch: „3 : ¼ = 12.“ (das ist das Ergebnis, das steht schon im Bild)
- Was nicht zu dieser einen Einsicht beiträgt (Deko, zweite Rechnung, Nebenfall), fliegt raus oder wird eine eigene Animation.

## 2. Drei Takte: Sehen → Verändern → Erkennen
1. **Sehen**: die Ausgangslage, ein Abschnitt, ruhig. Was ist gegeben?
2. **Verändern**: der entscheidende Schritt – das, was man im Heft nie sieht (das Bündeln, das Umklappen, das Zerschneiden, das Verschieben). Hier bewegt sich genau eine Sache, langsam genug zum Mitdenken.
3. **Erkennen**: Ergebnis **und** der sichtbare Grund. Vorher und Nachher bleiben beide im Bild (nebeneinander oder untereinander, nicht überschrieben).

## 3. Untertitel sagen, was man jetzt sehen soll
- Jeder Abschnitt mit Bewegung hat einen Text. Ein Satz, höchstens 75 Zeichen.
- Er benennt die Beobachtung, nicht die Handlung: „Jeder fünfte Strich geht quer – so zählt man in Fünfern“ statt „Die Striche werden gezeichnet“.
- Das Wort, auf das es ankommt, steht auch im Bild (Pille, Goldmarkierung).
- Eine nackte Rechnung ist nie der einzige Untertitel eines Abschnitts; Brüche in Worten („drei Fünftel“, nie 3/5).
- Präsens, kein „wir“, du-Form sparsam, keine Gendersprache.

## 4. Tempo
- **Kein Text verschwindet, bevor er gelesen ist.** Die Lesezeit kommt für alle Animationen der App aus `src/lesezeit.js`: 1,2 s + 70 ms je Zeichen (Lesetempo Klasse 5–7, ≈ 14 Zeichen/s). `zeitplan` (kern.jsx) dehnt jeden Abschnitt darauf; die Bewegung wird dabei höchstens 1,6-mal gestreckt, danach steht das Bild still, bis der Text gelesen ist. Startet eine Animation von vorn, steht zuerst die Frage so lange da, wie man zum Lesen braucht. Eine Szene baut also keine eigenen Lesepausen ein – aber lange Untertitel machen sie lang.
- Gesamtdauer 10–35 s (Test: höchstens 35 s). Zu lang → Untertitel kürzen oder zwei Abschnitte zu einem zusammenlegen.
- Dieselbe Regel gilt im Player der Erkläranimationen (funcErklaeranimation.jsx: `lesePlan`, Lesezeit des Schritttextes + 1,5 s) – Ableitungsregeln, Trigonometrie, GFS, Kreis, Normalverteilung, Kopfrechnen, KI-Kurs, Wurzel.
- Pro Abschnitt bewegt sich eine Sache. Zwei gleichzeitige Bewegungen = zwei Abschnitte.

## 5. Hervorhebung: einmal, am Kern-Moment
- GOLD markiert „hier passiert es“ (der Schritt aus Takt 2), GRANAT das Ergebnis, BLAU der zweite Gegenstand. Sonst TINTE und Grau.
- `Puls`/`Pille` höchstens einmal je Animation, genau beim Kern-Moment. Keine drei Dinge, die gleichzeitig leuchten.

## 6. Schlussbild = Standbild
- Das letzte Bild wird als Vorschau und bei „Bewegung reduzieren“ gezeigt. Es enthält Ausgangslage, Ergebnis und den sichtbaren Grund, ohne Untertitel verständlich.
- Text im Bild höchstens drei Zeilen; der Kernsatz steht im Abspieler (`kern`), nicht noch einmal im SVG. Pillen im Bild dürfen die Rechnung tragen.

## 7. Mathematisch exakt
- Maße stimmen (Fläche, Winkel, Längenverhältnisse, Anzahl der Kästchen). Regel A5 (nichts unvereinfacht), Produkte eng (2x), Minus als „−“, deutsche Zahlen (`de`).
- Karo-Raster nur, wenn das Thema Kästchen oder Koordinaten sind.

## 8. Zwei Animationen je Lerneinheit = zwei Zugänge
- Die zweite Animation zeigt dieselbe Idee aus einer anderen Richtung (Alltag ↔ Modell, Bild ↔ Zahl, Beispiel ↔ Muster) – nicht dieselbe Szene mit anderen Zahlen. Ausnahme: die Fälle einer Regel (plus · minus · minus minus).

## Prüfliste je Animation
☐ `frage` ≤ 70 Zeichen mit „?“ · ☐ `kern` ≤ 130 Zeichen, sagt das Warum · ☐ Sehen → Verändern → Erkennen erkennbar ·
☐ jeder Abschnitt mit Bewegung hat einen Untertitel ≤ 75 Zeichen, der die Beobachtung nennt · ☐ 10–35 s ·
☐ eine Hervorhebung am Kern-Moment · ☐ Schlussbild ohne Untertitel verständlich, Vorher und Nachher sichtbar · ☐ Maße und Zahlen stimmen

Kontaktbogen: `node scripts/motion-blatt.mjs <Lerneinheit-oder-Szene> <Ordner>` → `blatt-*.png` (fünf Zeitpunkte je Animation). Test: `node --test tests/unterstufeMedien.test.mjs`.
