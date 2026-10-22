/* Animationen für die 13 Unterstufen-Werkzeuge (Seite Entdecken, oben): { [werkzeug]: [Eintrag] } – reine Daten.
   Eintrag: { szene, titel, p } ODER Verweis auf die Animation einer Lerneinheit { aus: "<einheit-id>", nr: 0, titel? }
   (aufgelöst in unterstufeMedien.js, werkzeugAnimationen). Schlüssel = Werkzeug-Id aus werkzeuge.js. */
export const ANIM_WERKZEUGE = {
  stellenwert: [
    { aus: "grosse-zahlen-stellenwerttafel", nr: 0 },
    { aus: "runden-und-ueberschlagen", nr: 0, titel: "Runden" },
    { aus: "roemische-zahlen-zweiersystem", nr: 0 },
    { aus: "roemische-zahlen-zweiersystem", nr: 2 },
  ],
  ganzezahlen: [
    { aus: "negative-zahlen", nr: 0 },
    { aus: "addieren-subtrahieren-ganze-zahlen", nr: 0 },
    { aus: "addieren-subtrahieren-ganze-zahlen", nr: 2 },
    { aus: "multiplizieren-dividieren-ganze-zahlen", nr: 0 },
  ],
  primzahlen: [
    { szene: "x_sieb", titel: "Sieb des Eratosthenes", p: { bis: 50 }, frage: "Wie findet man alle Primzahlen bis 50, ohne jede zu prüfen?", kern: "Streiche die Vielfachen von 2, 3, 5 und 7 – jede Zahl, die übrig bleibt, hat keinen Teiler außer 1 und sich selbst: eine Primzahl." },
    { aus: "primzahlen-und-primfaktorzerlegung", nr: 0 },
    { aus: "ggt-und-kgv", nr: 1 },
    { aus: "ggt-und-kgv", nr: 0, titel: "Das kgV" },
  ],
  rechengesetze: [
    { aus: "rechenausdruecke-klammern", nr: 0 },
    { aus: "rechengesetze-und-rechenvorteile", nr: 0 },
    { aus: "rechengesetze-und-rechenvorteile", nr: 1 },
  ],
  groessen: [
    { aus: "einheiten-umrechnen", nr: 0 },
    { aus: "einheiten-umrechnen", nr: 1 },
    { aus: "einheiten-umrechnen", nr: 2 },
    { aus: "massstab", nr: 0, titel: "Maßstab" },
  ],
  dezimal: [
    { aus: "dezimalschreibweise", nr: 0 },
    { aus: "brueche-und-dezimalzahlen-umwandeln", nr: 0 },
    { aus: "komma-verschieben-zehnerpotenzen", nr: 0 },
    { aus: "dezimalzahlen-multiplizieren", nr: 0 },
    { aus: "periodische-dezimalzahlen", nr: 0, titel: "Periodisch" },
  ],
  koordinaten: [
    { aus: "koordinatensystem", nr: 0, titel: "Punkte eintragen" },
    { szene: "x_ablesen", titel: "Punkte ablesen", p: { punkte: [["P", 4, 3], ["Q", 1, 5], ["R", 6, 0]] }, frage: "Woher weiß ich, ob P(4 | 3) oder P(3 | 4) heißt?", kern: "Erst waagrecht gehen, dann senkrecht: die erste Zahl ist der Weg nach rechts, die zweite der Weg nach oben." },
    { aus: "achsensymmetrie", nr: 0 },
    { aus: "punktsymmetrie", nr: 0 },
  ],
  flaechen: [
    { aus: "flaecheninhalt-rechteck-quadrat", nr: 0 },
    { aus: "umfang", nr: 0 },
    { aus: "parallelogramm-und-dreieck", nr: 0 },
    { aus: "parallelogramm-und-dreieck", nr: 1 },
    { aus: "zusammengesetzte-figuren", nr: 0 },
  ],
  quader: [
    { aus: "volumen-quader-wuerfel", nr: 0 },
    { aus: "oberflaeche-quader-wuerfel", nr: 0 },
    { aus: "netze-von-quader-und-wuerfel", nr: 0 },
  ],
  zuordnungen: [
    { aus: "zuordnungen-tabelle-graph", nr: 0 },
    { aus: "proportionale-zuordnungen", nr: 0 },
    { aus: "dreisatz", nr: 0 },
    { aus: "antiproportionale-zuordnungen", nr: 0 },
  ],
  prozent: [
    { szene: "x_prozentwert", titel: "Der Prozentwert", p: { G: 80, p: 35, einheit: "€" }, frage: "Wie viel sind 35 % von 80 €?", kern: "Der ganze Streifen ist 100 %. Teile ihn in zehn Stücke: ein Stück sind 10 %, und 35 % sind dreieinhalb Stücke davon." },
    { szene: "x_grundwert", titel: "Der Grundwert", p: { p: 30, W: 24, einheit: "Schüler" }, frage: "30 % sind 24 Schüler – wie viele sind 100 %?", kern: "Der Weg geht über 1 %: Teile durch 30, dann nimm mal 100. Ein Prozent ist das Stück, aus dem sich das Ganze zusammensetzen lässt." },
    { szene: "x_rabatt", titel: "Rabatt", p: { G: 60, p: 20 }, frage: "Warum rechnet man bei 20 % Rabatt einfach mal 0,8?", kern: "20 % gehen weg, 80 % bleiben – und 80 % vom alten Preis heißt: alter Preis mal 0,8. Ein Schritt statt zwei." },
    { szene: "x_rabatt", titel: "Mehrwertsteuer", p: { G: 50, p: 19, art: "mwst" }, frage: "Warum rechnet man bei 19 % Mehrwertsteuer einfach mal 1,19?", kern: "100 % bleiben, 19 % kommen dazu: zusammen 119 % vom Nettopreis – also Nettopreis mal 1,19." },
    { szene: "x_zinseszins", titel: "Zinseszins", p: { K: 1000, p: 10, n: 8 }, frage: "Warum wird der Zuwachs beim Zinseszins jedes Jahr größer?", kern: "Die Zinsen bleiben im Topf und bringen im nächsten Jahr selbst Zinsen – das Kapital wird jedes Jahr mit 1,1 malgenommen, nicht nur um 100 € mehr." },
  ],
  diagramme: [
    { aus: "daten-erheben-diagramme", nr: 0 },
    { aus: "kreisdiagramm", nr: 0 },
    { aus: "median-und-spannweite", nr: 0 },
    { aus: "mittelwert", nr: 0, titel: "Mittelwert" },
  ],
  zufall: [
    { aus: "zufall-und-wahrscheinlichkeit", nr: 0 },
    { aus: "zufall-und-wahrscheinlichkeit", nr: 1 },
    { aus: "relative-haeufigkeit", nr: 1 },
  ],
};
