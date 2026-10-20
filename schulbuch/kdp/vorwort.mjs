// Vorspann der Druckausgabe (Amazon KDP): acht Seiten mit römischen Seitenzahlen I–VIII vor Seite 1.
// Sie sind der Teil, den Amazon in der Leseprobe („Blick ins Buch“) zeigt – hier wird Mythos Mathe vorgestellt.
// Weil der Vorspann römisch zählt, bleiben die gedruckten Seitenzahlen des Inhalts (und damit alle QR-Kurzlinks) unverändert.
// Aufruf aus build.mjs (KDP=1): vorwortSeiten(konfig, { seiten, KAPNAME, qrSvg }) → Seitenobjekte wie die übrigen Seiten.
import fs from "node:fs";
import path from "node:path";

export const KDP_CSS = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "kdp.css"), "utf8");

const ROEM = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export async function vorwortSeiten(K, { seiten, KAPNAME, qrSvg }) {
  const band = K.band;
  const qrKurs = await qrSvg(`/b${band}`);
  const qrApp = await qrSvg("/");
  const qrLehrer = await qrSvg("/lehrkraefte");
  const qrBeispiel = await qrSvg(`/b${band}/${K.beispielAufgabe}`);

  /* Kapitelfahrplan aus den Seiten */
  const kapitel = [];
  for (const s of seiten) {
    if (s.meta.typ === "auftakt") kapitel.push({ kap: s.meta.kap, name: KAPNAME[s.meta.kap] || "", seite: s.nr, uk: [] });
    else if (s.meta.uk && kapitel.length) kapitel[kapitel.length - 1].uk.push({ titel: s.meta.uk, seite: s.nr });
  }

  const S = [];
  /* I – Schmutztitel */
  S.push(`<div class="kdp-schmutz">
  <div class="marke">Mythos Mathe · Schulbuch</div>
  <h1>${esc(K.titel)}</h1>
  <div class="unter">${esc(K.untertitel)}</div>
  <div class="band">Band ${band} · ${esc(K.bereich)}</div>
</div>`);

  /* II – Impressum */
  S.push(`<div class="kdp-impressum">
  <div class="block">
    <p><b>${esc(K.titel)}</b><br>${esc(K.untertitel)}<br>Mythos Mathe · Schulbuch Band ${band}</p>
    <p>${esc(K.auflage)}<br>© ${K.jahr} ${esc(K.autor)}, ${esc(K.ort)}. Alle Rechte vorbehalten.</p>
    <p>Text, Aufgaben, Lösungen und Gestaltung: ${esc(K.autor)}<br>Satz mit Montserrat und KaTeX · Grafiken aus dem eigenen Buchsatz<br>Druck und Vertrieb: Amazon Kindle Direct Publishing (Print on Demand)</p>
    ${K.isbn ? `<p>ISBN ${esc(K.isbn)}</p>` : ""}
    <p>Verantwortlich im Sinne des Presserechts:<br>${esc(K.autor)}${K.adresse ? `<br>${esc(K.adresse).replace(/\n/g, "<br>")}` : ""}<br>${esc(K.kontakt)}</p>
    <p class="klein">Dieses Buch gehört zu einem Lernsystem: Zu jedem Kapitel gibt es Werkzeuge und Trainer in der Mythos-Mathe-App unter mythosmathe.de. Die QR-Codes im Buch führen auf feste Adressen, die auch in späteren Auflagen gültig bleiben. Produkt- und Markennamen Dritter sind Eigentum der jeweiligen Inhaber. Das Werk einschließlich aller Teile ist urheberrechtlich geschützt; jede Verwertung außerhalb der engen Grenzen des Urheberrechts ist ohne Zustimmung des Autors unzulässig. Für den Unterrichtsgebrauch dürfen einzelne Aufgaben vervielfältigt werden, wenn die Quelle genannt wird.</p>
  </div>
</div>`);

  /* III – Vorwort: Mathe ist kein Talent */
  S.push(`<div class="kdp-text">
  <div class="kdp-marke">Vorwort</div>
  <h1>Mathe ist kein Talent.<br>Mathe ist ein System.</h1>
  <p class="lead">Fast jeder kennt den Satz: „Ich bin halt kein Mathemensch.“ Er klingt wie eine Diagnose. In Wirklichkeit ist er ein Mythos – und dieses Buch ist dagegen geschrieben.</p>
  <p>Ich weiß das, weil ich ihn selbst geglaubt habe. In den ersten Gymnasialjahren stand bei mir in Mathe eine Zwei, mit viel Aufwand und wenig Verständnis. Ab Klasse 8 habe ich angefangen, anders zu arbeiten: nicht mehr Regeln auswendig lernen, sondern herausfinden, <b>woher sie kommen</b> – und jeden Schritt so aufschreiben, dass ich ihn am nächsten Tag noch verstehe. Ab Klasse 10 stand eine 1,0. Nicht, weil ich plötzlich begabt war, sondern weil ich ein System hatte.</p>
  <p>Seitdem habe ich dieses System über Jahre mit Schülern ausprobiert, verfeinert und in Werkzeuge gegossen. Daraus ist <b>Mythos Mathe</b> entstanden: eine Lernakademie für Gymnasiasten, eine App mit Trainern für jedes Thema – und diese Schulbuchreihe.</p>
  <h2>Was dieses Buch anders macht</h2>
  <div class="kdp-drei">
    <div><b>Hergeleitet, nicht hingestellt.</b> Keine Regel fällt vom Himmel. Jede wird aus einer Frage entwickelt, die du selbst beantworten kannst. Wer die Herleitung kennt, kann die Regel nicht mehr vergessen.</div>
    <div><b>Wie im Unterricht.</b> Jedes Unterkapitel ist eine Stunde: Einstieg, Herleitung, Merke, Beispiele, Aufgaben in drei Stufen. Du kannst damit vorarbeiten, nacharbeiten oder dich selbst unterrichten.</div>
    <div><b>Unbegrenzt üben.</b> Jede Rechenaufgabe trägt einen QR-Code. Er liefert dir ein Blatt mit neuen Aufgaben desselben Typs – mit Lösungen, so oft du willst.</div>
  </div>
  <p class="kdp-unterschrift">Viel Freude beim Verstehen.<br><b>${esc(K.autor)}</b><span>Mythos Mathe · ${esc(K.ort)}</span></p>
</div>`);

  /* IV – Was Mythos Mathe ist */
  S.push(`<div class="kdp-text">
  <div class="kdp-marke">Mythos Mathe</div>
  <h1>System + Freude = Erfolg</h1>
  <p class="lead">Mythos Mathe ist ein Lernsystem für das Gymnasium – von Klasse 8 bis zum Abitur. Es setzt nicht auf noch mehr Übungsaufgaben, sondern auf besseres Denken, sauberes Arbeiten und den richtigen Umgang mit Fehlern.</p>
  <div class="kdp-karten">
    <div class="karte"><div class="kk">Pen &amp; Paper</div><p>Das Blatt ist der Arbeitsplatz des Denkens. Ein Gedanke pro Zeile, sichtbare Rechenzeichen, ein klar markiertes Ergebnis – so entlastet dein Blatt deinen Kopf, statt ihn zusätzlich zu belasten.</p></div>
    <div class="karte"><div class="kk">Head &amp; Numbers</div><p>Zahlengefühl und Kopfrechnen. Wer Quadratzahlen, Brüche und Vorzeichen sicher im Kopf hat, hat in jeder Klausur mehr Zeit für das, was wirklich schwer ist.</p></div>
    <div class="karte"><div class="kk">Mathe &amp; Ich</div><p>Die mentale Ebene: Erwartungen, Frustrationstoleranz, der Umgang mit Nichtwissen. Du erwartest nicht, alles sofort zu verstehen – du erwartest von dir, genau herauszufinden, was du noch nicht verstehst.</p></div>
    <div class="karte"><div class="kk">Die App</div><p>Unter <b>mythosmathe.de</b> findest du zu jedem Thema dieses Buchs Werkzeuge und Trainer: Rechenwege Schritt für Schritt, Grafiken zum Anfassen, beliebig viele neue Aufgaben – und den Kurs, der dieses Buch Kapitel für Kapitel begleitet.</p></div>
  </div>
  <div class="kdp-qr-zeile">
    <div class="qr">${qrApp}</div>
    <div><b>mythosmathe.de</b><br>Die Mythos-Mathe-App: Werkzeuge, Trainer und Kurse zu Analysis, Vektoren, Stochastik und Gleichungen. Kostenlos nutzbar, kein Konto nötig.</div>
    <div class="qr">${qrKurs}</div>
    <div><b>mythosmathe.de/b${band}</b><br>Der Kurs zu diesem Buch: jedes Kapitel als Modul mit Lesefunktion, Werkzeugen und Aufgabentool.</div>
  </div>
</div>`);

  /* V – So arbeitest du mit diesem Buch */
  S.push(`<div class="kdp-text">
  <div class="kdp-marke">Anleitung</div>
  <h1>So arbeitest du mit diesem Buch</h1>
  <div class="kdp-schritte">
    <div><span class="n">1</span><div><b>Eine Doppelseite ist eine Stunde.</b> Links die Herleitung mit Einstieg, Merke und Beispiel, rechts die Aufgaben. Lies die linke Seite mit Stift in der Hand und rechne die Beispiele selbst nach, bevor du die Lösung liest.</div></div>
    <div><span class="n">2</span><div><b>Aufgaben in drei Stufen.</b> ●○○ Basis – das muss sitzen. ●●○ Training – wie in der Klassenarbeit. ●●● Knobeln – für alle, die mehr wollen. Ein offener Kreis bei der Nummer heißt: Vertiefung, nicht Pflicht.</div></div>
    <div><span class="n">3</span><div><b>Lösungen hinten im Buch.</b> Vergleiche erst, wenn du fertig bist. Ein Fehler ist kein Urteil über dich, sondern ein Hinweis, welche Stelle du noch nicht verstanden hast. Genau dort lohnt sich das Weiterarbeiten.</div></div>
    <div><span class="n">4</span><div><b>Am Rand: Stundenablauf, Tipps und „In der App“.</b> Der blaue Kasten nennt das Werkzeug, das zur Stunde passt. Scannen – und du bist direkt dort.</div></div>
  </div>
  <h2>Die QR-Codes neben den Aufgaben</h2>
  <div class="kdp-qr-beispiel">
    <div class="qr">${qrBeispiel}</div>
    <div>
      <p>Neben jeder Rechenaufgabe steht ein kleiner Code. Scanne ihn mit der Kamera deines Handys: Du bekommst ein <b>Blatt mit neuen Aufgaben genau dieses Typs</b> – andere Zahlen, gleicher Lösungsweg – samt Lösungen auf der zweiten Seite. Jeder Scan liefert ein neues Blatt.</p>
      <p><b>Drucke das Blatt aus und rechne mit Stift auf Papier.</b> So bleibt es am besten hängen. Du kannst das PDF auch am Tablet mit Stift bearbeiten oder die Aufgabe in der App interaktiv üben, mit Eingabe und Rückmeldung.</p>
      <p class="klein">Ohne Scanner tippst du die Adresse ein: <b>mythosmathe.de/b${band}/</b>Seite-Nummer, zum Beispiel mythosmathe.de/b${band}/${K.beispielAufgabe} für Aufgabe ${K.beispielAufgabe.split("-")[1]} auf Seite ${K.beispielAufgabe.split("-")[0]}. Die Adressen sind fest und bleiben auch in späteren Auflagen gültig.</p>
    </div>
  </div>
</div>`);

  /* VI – Pen & Paper */
  S.push(`<div class="kdp-text">
  <div class="kdp-marke">Pen &amp; Paper</div>
  <h1>Die sieben goldenen Regeln</h1>
  <p class="lead">Dein Blatt muss dein Denken entlasten – nicht zusätzlich belasten. Jeder wichtige Schritt muss für dein späteres Ich rekonstruierbar sein. Daraus folgen sieben Regeln, die wir in jedem Beispiel dieses Buchs vormachen.</p>
  <ol class="kdp-regeln">
    <li><b>Raum geben.</b> Eine neue Aufgabe beginnt auf einer neuen Zeile, mit Nummer. Weißraum ist kein verschwendeter Platz.</li>
    <li><b>Lesbar schreiben.</b> Was du nicht lesen kannst, kannst du nicht prüfen.</li>
    <li><b>Die entscheidenden Schritte zeigen.</b> Nicht jeden, aber jeden, an dem etwas passiert.</li>
    <li><b>Vertikal ordnen.</b> Ein Gedanke pro Zeile, Gleichheitszeichen untereinander.</li>
    <li><b>Operatoren korrekt verwenden.</b> „=“ heißt gleich, nicht „und dann“. Umformungen bekommen einen Pfeil oder ein | +3.</li>
    <li><b>Nebenrechnung vom Hauptweg trennen.</b> Rechts neben dem Weg, nicht mittendrin.</li>
    <li><b>Ergebnisse abschließen.</b> Antwortsatz, Einheit, Kasten. Dann erst die nächste Aufgabe.</li>
  </ol>
  <h2>Wenn du feststeckst: fünf Fragen</h2>
  <div class="kdp-fragen">
    <span>Was weiß ich sicher?</span><span>Was verstehe ich nicht genau?</span><span>Was ist das kleinste Teilproblem?</span><span>Welche Darstellung hilft – Skizze, Tabelle, Term?</span><span>Was kann ich testen?</span>
  </div>
  <div class="kdp-schluss-kasten"><p><span>Matheskript-Manifest</span>Das Ziel ist nicht, weniger denken zu müssen. Das Ziel ist, besser denken zu können.</p></div>
</div>`);

  /* VII – Dein Weg durch das Buch */
  S.push(`<div class="kdp-text">
  <div class="kdp-marke">Fahrplan</div>
  <h1>Dein Weg durch das Buch</h1>
  <p class="lead">${esc(K.fahrplan)}</p>
  <div class="kdp-fahrplan">
    ${kapitel.filter((k) => k.kap !== "L").map((k) => `<div class="kap"><div class="kn">Kapitel ${k.kap}<span>ab Seite ${k.seite}</span></div><div class="kt">${esc(k.name)}</div><ul>${k.uk.map((u) => `<li><span>${esc(u.titel)}</span><i>${u.seite}</i></li>`).join("")}</ul></div>`).join("")}
  </div>
</div>`);

  /* VIII – Für Eltern und Lehrkräfte */
  S.push(`<div class="kdp-text">
  <div class="kdp-marke">Für Eltern und Lehrkräfte</div>
  <h1>Was dieses Buch für Sie tut</h1>
  <p class="lead">Dieses Buch ersetzt keinen Unterricht – es macht ihn verständlich. Jedes Unterkapitel ist so gebaut, dass ein Schüler es allein durcharbeiten kann: mit Herleitung, Beispiel, Aufgaben in drei Stufen und vollständigen Lösungen.</p>
  <div class="kdp-drei">
    <div><b>Für Eltern.</b> Sie müssen nicht selbst erklären können. Fragen Sie nach der Stunde des Tages: „Was war die Frage des Kapitels – und wie wurde sie beantwortet?“ Wer das in zwei Sätzen sagen kann, hat verstanden.</div>
    <div><b>Für Nachhilfe und Selbstlerner.</b> Die Trainingsseiten „Alles klar?“ am Ende jedes Kapitels sind eine ehrliche Selbsteinschätzung. Wo „unsicher“ steht, steht die Seite dabei, auf die es zurückgeht.</div>
    <div><b>Für Lehrkräfte.</b> Die Aufgaben dürfen für den Unterricht kopiert werden. Mit dem kostenlosen Arbeitsblatt-Generator auf mythosmathe.de erstellen Sie zu jedem Thema ein PDF mit Aufgaben- und Lösungsblatt, Gruppe A/B, ohne Konto.</div>
  </div>
  <div class="kdp-qr-zeile">
    <div class="qr">${qrLehrer}</div>
    <div><b>mythosmathe.de/lehrkraefte</b><br>Arbeitsblatt-Generator und alles, was Mythos Mathe für Ihren Unterricht tut – kostenlos, ohne Anmeldung.</div>
    <div class="qr">${qrApp}</div>
    <div><b>mythosmathe.de</b><br>Die App zum Buch. Sie läuft im Browser auf Handy, Tablet und Computer.</div>
  </div>
  <div class="kdp-schluss-kasten"><p><span>Mythos Mathe</span>Mathe ist kein Talenttest. Mathe ist eine Art zu denken – und diese Art zu denken kann man lernen.</p></div>
</div>`);

  return S.map((haupt, i) => ({ datei: `kdp-${ROEM[i]}.html`, nr: 0, roem: ROEM[i], meta: { kap: "0", typ: "vorwort" }, haupt, rand: "" }));
}
