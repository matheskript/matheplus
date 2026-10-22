/* ============================================================
   Gemeinsamer Kern für die drei Modi der Rechen-Werkzeuge
     Auto   – die App rechnet den Weg vor (früher „Rechnen“/„Automatik“)
     Üben   – der Schüler geht jeden Schritt selbst, wählt aber die richtige
              Zeile aus 2 bis 4 fertigen Zeilen (eine richtig, die anderen mit
              je einem typischen Fehler genau dieses Schritts)
     Lernen – der Schüler rechnet jede Zeile selbst (früher „Training“)

   Ein Werkzeug baut je Schritt Kandidaten für falsche Zeilen (typische Fehler
   mit Hinweis) und prüft sie mit SEINER Prüfung (dieselbe wie in Lernen):
   falscheOptionen() behält nur lesbare, verschiedene und wirklich falsche,
   mischt sie und liefert höchstens drei. uebenSchritt() vergibt jeder Option
   einen festen Zufallsrang – so bleibt die Reihenfolge stabil, egal ob die
   Oberfläche 2, 3 oder 4 Optionen zeigt (uebenLayout()).
   Reine Logik, ohne React (tests/uebenKern.test.mjs).
   ============================================================ */

export const UEBEN_MODI = [
  { id: "auto", name: "Auto", en: "Auto", text: "Die App rechnet dir den Weg vor.", textEn: "The app works out the solution for you." },
  { id: "ueben", name: "Üben", en: "Practise", text: "Du gehst jeden Schritt selbst und wählst die richtige Zeile aus.", textEn: "You take every step yourself and pick the right line." },
  { id: "lernen", name: "Lernen", en: "Learn", text: "Du rechnest jede Zeile selbst.", textEn: "You work out every line yourself." },
];

/* Alte Modus-Namen (gemerkt im Browser, Übergaben, Heute-Karte) auf die neuen abbilden */
export function modusNeu(m, standard = "lernen") {
  if (m === "auto" || m === "rechnen" || m === "automatik") return "auto";
  if (m === "ueben" || m === "üben") return "ueben";
  if (m === "lernen" || m === "training" || m === "trainieren") return "lernen";
  return standard;
}

/* Falsche Optionen eines Schritts.
   kandidaten: [{ wert, hinweis, art }] (wert = was das Werkzeug anzeigt/prüft, z. B. { text } oder { a, b })
   pruefe(wert) → { ok, hinweis }   – die Prüfung des Werkzeugs (ok = gleichwertig zur richtigen Zeile)
   schluessel(wert) → String        – gleiche Schlüssel gelten als dieselbe Zeile
   lesbar(wert) → Boolean           – unlesbare Kandidaten fallen weg
   Ergebnis: höchstens max falsche Optionen in zufälliger Vorzugsreihenfolge. */
export function falscheOptionen(richtig, kandidaten, { pruefe, schluessel = (w) => JSON.stringify(w), lesbar = () => true, max = 3, zufall = Math.random } = {}) {
  const gesehen = new Set([schluessel(richtig)]);
  const gut = [];
  for (const k of kandidaten || []) {
    if (!k || k.wert == null) continue;
    const key = schluessel(k.wert);
    if (gesehen.has(key)) continue;
    gesehen.add(key);
    try { if (!lesbar(k.wert)) continue; } catch (e) { continue; }
    let r = null;
    try { r = pruefe ? pruefe(k.wert) : { ok: false, hinweis: "" }; } catch (e) { continue; }
    if (r && r.ok) continue;   // gleichwertig zur richtigen Zeile – kein Fehler
    gut.push({ wert: k.wert, art: k.art || "fehler", hinweis: k.hinweis || (r && r.hinweis) || "" });
  }
  return mischen(gut, zufall).slice(0, max);
}

export function mischen(liste, zufall = Math.random) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Ein Schritt mit festen Rängen: optionen[0] ist immer die richtige, danach die falschen in
   Vorzugsreihenfolge; rang bestimmt die Position in der Anzeige. */
export function uebenSchritt({ richtig, falsche, schluessel = (w) => JSON.stringify(w), zufall = Math.random, ...rest }) {
  const optionen = [
    { key: schluessel(richtig), wert: richtig, richtig: true, hinweis: "", art: "richtig", rang: zufall() },
    ...falsche.map((f) => ({ key: schluessel(f.wert), wert: f.wert, richtig: false, hinweis: f.hinweis, art: f.art, rang: zufall() })),
  ];
  return { ...rest, richtig, optionen };
}

/* Die k sichtbaren Optionen (richtig + die ersten k−1 falschen), in der Reihenfolge ihrer Ränge */
export function sichtbareOptionen(schritt, k) {
  const n = Math.max(2, Math.min(k, schritt.optionen.length));
  return schritt.optionen.slice(0, n).slice().sort((a, b) => a.rang - b.rang);
}

/* Wie viele Optionen passen wie? (Regel von Basti, 22.10.)
   - kurz (zwei passen nebeneinander): vier Optionen als 2 × 2 (gibt es nur drei: drei in einer Reihe,
     wenn sie in ein Drittel passen; zwei: nebeneinander)
   - lang (nur eine pro Zeile): drei Optionen untereinander, etwas flacher
   breiten = natürliche Breiten der Inhalte [richtig, falsch1, falsch2, falsch3] in px,
   rahmen = Breite von Rand, Innenabstand und Buchstabe einer Karte. */
export function uebenLayout({ breite, breiten, abstand = 10, rahmen = { raster: 56, stapel: 64 } }) {
  const n = breiten.length;
  if (!breite || n < 2) return { anzahl: Math.min(n, 3), spalten: 1, kompakt: n >= 3 };
  const halb = (breite - abstand) / 2;
  const drittel = (breite - 2 * abstand) / 3;
  const passt = (k, frei) => breiten.slice(0, k).every((w) => w + rahmen.raster <= frei);
  if (n >= 4 && passt(4, halb)) return { anzahl: 4, spalten: 2, kompakt: false };
  if (n === 3 && passt(3, drittel)) return { anzahl: 3, spalten: 3, kompakt: false };
  if (n === 2 && passt(2, halb)) return { anzahl: 2, spalten: 2, kompakt: false };
  if (n >= 3) return { anzahl: 3, spalten: 1, kompakt: true };
  return { anzahl: 2, spalten: 1, kompakt: false };
}

/* Bilanz: Schritte ohne Fehlklick */
export const aufAnhieb = (falschJeSchritt, bis) => {
  let n = 0;
  for (let i = 0; i < bis; i++) if (!(falschJeSchritt[i] && falschJeSchritt[i].length)) n++;
  return n;
};

export const BUCHSTABEN = ["A", "B", "C", "D"];
