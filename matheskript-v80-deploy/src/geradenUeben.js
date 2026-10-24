/* ============================================================
   Geradentrainer – Modus „Üben“ (ohne Oberfläche)
   Zwischen Auto (die App rechnet vor) und Lernen (der Schüler tippt m und c
   selbst) liegt Üben: Der Schüler geht jeden Schritt selbst, wählt aber den
   Wert aus fertigen Karten – eine richtige und bis zu drei falsche, jede mit
   einem typischen Fehler genau dieses Schritts und einem kurzen Hinweis.

   uebenWeg({ P, Q, m, art: "pq" | "pm" }, zufall) → Schritte (uebenKern.uebenSchritt)
     Zwei Punkte (pq):        1 Steigung m, 2 Achsenabschnitt c
     Punkt und Steigung (pm): 1 Achsenabschnitt c
     Senkrechte Gerade (x_P = x_Q): keine Schritte – die Oberfläche zeigt wie
     Lernen den Sonderfall.
     { art: "m" | "c", label, frage, weg (Mini-TeX wie in Lernen/Auto),
       richtig: Bruch { n, d }, optionen: [{ key, wert, richtig, hinweis, art, rang }, …] }
     optionen[0] ist die richtige; wie viele erscheinen (2, 3 oder 4),
     entscheidet die Oberfläche nach Platz.

   Werte sind exakte Brüche aus geradenLogik (bruch). Jede falsche Karte ist
   mit DERSELBEN Prüfung wie in Lernen (bewerte) als falsch bestätigt – ein
   „Fehler“, der zufällig denselben Wert ergibt (z. B. −0 = 0, Kehrwert von 1),
   fällt heraus. Die Fehlerkataloge sind die vorhandenen fehlerFaelleM /
   fehlerFaelleC (Wert + Hinweis), ergänzt um wenige weitere typische Fehler.
   Reine Logik, testbar mit Node (tests/geradenUeben.test.mjs).
   ============================================================ */
import {
  achsenWeg, achsenabschnitt, bAdd, bMal, bNeg, bSub, bewerte, bruch, fehlerFaelleC, fehlerFaelleM, geradePQ, steigungWeg,
} from "./geradenLogik.js";
import { falscheOptionen, uebenSchritt } from "./uebenKern.js";

/* Ein Wert als Eingabetext, so wie er am Zahlenfeld entstünde: 5, -5, 3/2, -3/2 */
export const wertText = (b) => (b.d === 1 ? String(b.n) : `${b.n}/${b.d}`);
const schluessel = (b) => `${b.n}/${b.d}`;
/* leseAntwort liest höchstens vier Ziffern je Zähler und Nenner */
const lesbar = (b) => !!b && Number.isInteger(b.n) && Number.isInteger(b.d) && b.d > 0 && Math.abs(b.n) <= 9999 && b.d <= 9999;

/* Prüfung wie in Lernen: bewerte(eingabe, soll) – richtig nur bei art "richtig"
   („ungekuerzt“ kann hier nicht auftreten, die Werte sind gekürzte Brüche) */
export function pruefeWert(wert, soll) {
  const r = bewerte(wertText(wert), soll, []);
  return { ok: r.art === "richtig", hinweis: r.hinweis || "" };
}

/* Katalog { wert, id, text } → Kandidat { wert, art, hinweis } */
const ausKatalog = (liste) => liste.map((f) => ({ wert: f.wert, art: f.id, hinweis: f.text }));

/* ---------- Schritt m: Steigung aus zwei Punkten ---------- */
function kandidatenM(P, Q) {
  const dx = Q[0] - P[0], dy = Q[1] - P[1];
  const m = bruch(dy, dx);
  const k = ausKatalog(fehlerFaelleM(P, Q));   // vorzeichen, kehrwert, nurDy, nurDx
  // Ergänzungen (Wunsch 22.10.) – gleiche Werte wie im Katalog fallen in falscheOptionen heraus, der Katalog-Hinweis gewinnt
  k.push({ wert: bruch(dx, dy), art: "kehrwert", hinweis: "Zähler und Nenner sind vertauscht: Steigung = Höhe durch Breite, also Δy durch Δx." });   // dy = 0 → null → fällt weg
  k.push({ wert: bNeg(m), art: "vorzeichen", hinweis: "Vorzeichen prüfen: In Zähler und Nenner muss dieselbe Reihenfolge stehen – beide Male Q minus P." });
  k.push({ wert: bruch(dy), art: "nurDy", hinweis: "Das ist nur die Höhe Δy. Teile noch durch die Breite Δx." });
  k.push({ wert: bruch(dy, P[0] - Q[0]), art: "gemischt", hinweis: "Oben steht y_Q − y_P, unten aber x_P − x_Q – die Reihenfolge ist gemischt. Beide Male Q minus P, dann stimmt das Vorzeichen." });
  // Proportional gedacht: m = y_Q / x_Q gilt nur für Geraden durch den Ursprung
  if (Q[0] !== 0) k.push({ wert: bruch(Q[1], Q[0]), art: "ursprung", hinweis: "Du hast y_Q durch x_Q geteilt. Das gilt nur für Geraden durch den Ursprung – die Steigung kommt aus den Unterschieden: Δy durch Δx." });
  return k;
}

/* ---------- Schritt c: Achsenabschnitt aus Punkt und Steigung ---------- */
function kandidatenC(P, m, Q = null) {
  const w = bMal(m, bruch(P[0]));                  // m · x_P
  const k = ausKatalog(fehlerFaelleC(P, m));       // ohneM (y_P), plus (y_P + m·x_P), umgekehrt (−c)
  // Ergänzungen (Wunsch 22.10.)
  k.push({ wert: bAdd(bruch(P[1]), w), art: "plus", hinweis: "Vorzeichen: Es heißt y_P − m · x_P, nicht plus." });
  k.push({ wert: w, art: "nurMx", hinweis: "Das ist nur m · x_P. Davon fehlt noch der Anfang: c = y_P − m · x_P." });
  k.push({ wert: bruch(P[1]), art: "ohneM", hinweis: "Du hast m · x_P vergessen: c = y_P − m · x_P." });
  // c aus Q statt P – Q liegt auf derselben Geraden, der Wert ist gleich und fällt in falscheOptionen heraus
  if (Q) k.push({ wert: achsenabschnitt(Q, m), art: "ausQ", hinweis: "Auch mit Q kommt dasselbe c heraus – jeder Punkt der Geraden geht." });
  // Koordinaten vertauscht: x_P für y und y_P für x eingesetzt
  k.push({ wert: bSub(bruch(P[0]), bMal(m, bruch(P[1]))), art: "vertauscht", hinweis: "Koordinaten vertauscht: In y = m · x + c kommt x_P für x und y_P für y – also c = y_P − m · x_P." });
  // m und c verwechselt
  k.push({ wert: m, art: "mStattC", hinweis: "Das ist die Steigung m. Gesucht ist c, die Höhe an der y-Achse: c = y_P − m · x_P." });
  return k;
}

/* ---------- Der Weg ---------- */
function schritt({ art, label, frage, weg, richtig, kandidaten, zufall }) {
  const falsche = falscheOptionen(richtig, kandidaten, { pruefe: (w) => pruefeWert(w, richtig), schluessel, lesbar, max: 3, zufall });
  // Kein Notnagel: „Vorzeichen gedreht“ steht schon in beiden Katalogen (vorzeichen bzw. umgekehrt).
  // Bleibt nichts übrig (nur bei m = 0 und c = 0 möglich), steht eben allein die richtige Karte da.
  return uebenSchritt({ art, label, frage, weg, richtig, falsche, schluessel, zufall });
}

/* P, Q: [x, y]; m: Bruch { n, d } (nur pm). art fehlt → pq, wenn Q da ist, sonst pm. */
export function uebenWeg({ P, Q = null, m = null, art = Q ? "pq" : "pm" }, zufall = Math.random) {
  if (art === "pq") {
    const g = geradePQ(P, Q);
    if (g.senkrecht) return [];
    return [
      schritt({ art: "m", label: "m", frage: "Berechne die Steigung m aus P und Q: Höhe durch Breite.", weg: steigungWeg(P, Q), richtig: g.m, kandidaten: kandidatenM(P, Q), zufall }),
      schritt({ art: "c", label: "c", frage: "Setz P und m ein und berechne den y-Achsenabschnitt c.", weg: achsenWeg(P, g.m), richtig: g.c, kandidaten: kandidatenC(P, g.m, Q), zufall }),
    ];
  }
  const c = achsenabschnitt(P, m);
  return [
    schritt({ art: "c", label: "c", frage: "Setz P und m ein und berechne den y-Achsenabschnitt c.", weg: achsenWeg(P, m), richtig: c, kandidaten: kandidatenC(P, m), zufall }),
  ];
}
