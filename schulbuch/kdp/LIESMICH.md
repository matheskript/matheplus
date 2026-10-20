# Druckausgabe für Amazon KDP (Print on Demand)

Beide Bände lassen sich als Taschenbuch (A4, Premium-Farbdruck, weißes Papier) bei Kindle Direct Publishing hochladen.
Die Druckausgabe ist dieselbe Buchquelle wie die App-Ausgabe – nur mit Beschnitt und dem Vorspann I–VIII.

## Bauen (im Buchordner `schulbuch/ableitungen` bzw. `schulbuch/vektoren`)

    KDP=1 DIST=dist-kdp node build.mjs        # Innenteil: Vorspann I–VIII + alle Seiten, 213,4 × 303,3 mm (A4 + 3,2 mm Beschnitt)
    DIST=dist-kdp python3 render.py           # → dist-kdp/<Band>.pdf (Innenteil), meldet Überlauf je Seite
    node ../kdp/cover.mjs                     # Umschlag aus 01-cover.html + 99-rueckseite.html, Rückenbreite aus der Seitenzahl
    python3 ../kdp/render-cover.py            # → dist-kdp/Umschlag.pdf (+ umschlag.png zur Kontrolle)

Hochladen: Innenteil `dist-kdp/<Band>.pdf` als „Manuskript“, `dist-kdp/Umschlag.pdf` als „Buchcover“ (eigene PDF).
Bei KDP: Trim 8,27 × 11,69 Zoll (A4), **mit Beschnitt**, Innenteil **Premium-Farbe**, weißes Papier, Umschlag matt oder glänzend.

## Was vor dem ersten Upload in `kdp.json` einzutragen ist
- `adresse` – die ladungsfähige Anschrift fürs Impressum (Pflicht bei Verkauf). Ohne Eintrag steht nur Name, Ort, Kontakt.
- `isbn` – leer lassen, wenn KDP die kostenlose ISBN vergibt (dann nach der Vergabe eintragen und den Innenteil neu bauen,
  oder die Zeile weglassen – KDP verlangt die ISBN nicht im Impressum).
- `autor` – der Name, der auf Amazon als Autor steht (derzeit „Basti Blumenröther“).
- `beispielAufgabe` – die Aufgabe, deren QR-Code auf Seite V als Beispiel gezeigt wird.

## Maße (KDP-Vorgaben, geprüft 20.10.2026)
- Innenteil mit Beschnitt: Breite = Trim + 0,125″, Höhe = Trim + 0,25″ → 213,4 × 303,3 mm. Beschnitt außen, oben, unten; innen keiner.
- Mindestränder (24–150 Seiten): innen 9,6 mm, außen mit Beschnitt 9,6 mm. Das Buch nutzt innen 18 mm, außen 15 mm + Beschnitt.
- Umschlag: Breite = 3,2 + 210 + Rücken + 210 + 3,2 mm, Höhe = 297 + 6,4 mm. Rücken = Seitenzahl × 0,0596 mm (Farbdruck).
  Unter 80 Seiten druckt KDP keinen Rückentext – der Rücken ist einfarbig Nachtblau.
- Rückseite unten rechts: weißes Feld 54 × 33 mm für den Barcode, den KDP selbst setzt.

## Vorspann (römisch, Teil der Leseprobe „Blick ins Buch“)
I Schmutztitel · II Impressum · III Vorwort „Mathe ist kein Talent“ · IV Was Mythos Mathe ist (mit QR zur App und zum Kurs) ·
V So arbeitest du mit diesem Buch (QR-Codes erklärt) · VI Pen & Paper, sieben Regeln · VII Fahrplan durch das Buch · VIII Für Eltern und Lehrkräfte.
Texte: `kdp/vorwort.mjs`, Gestaltung: `kdp/kdp.css`. Die Seite 1 des Innenteils ist das Titelbild (wie der Umschlag), Seite 2 der Inhalt.

## Warum die Seitenzahlen nie wandern
Die QR-Codes verweisen auf `mythosmathe.de/b<Band>/<Seite>-<Nr>` – die **gedruckte** Seitenzahl. Der Vorspann zählt römisch,
Änderungen an Vorwort oder Impressum verschieben also nichts. Eine neue Auflage mit anderem Seitenumbruch bräuchte einen neuen
Bandschlüssel (z. B. `b1e2` in `pfade.js`), damit alte Bücher weiter funktionieren.
