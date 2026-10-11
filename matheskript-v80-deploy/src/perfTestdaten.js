/* ======================================================================
   perfTestdaten.js – kleine, erkennbare Testdaten für das Performance-Lab (reine Logik).

   Zweck: Das Dashboard lässt sich nur beurteilen, wenn Daten da sind. Diese Szenarien laufen durch
   dieselbe Aufnahme wie echte Ereignisse (meldeFehler, scanDiagnose, meldeAufgabe) – nichts wird
   direkt in die Listen geschrieben. Alles trägt demo: true und lässt sich mit einem Klick entfernen
   (loescheTestdaten in perfKern.js). Testdaten zählen nie als echte Lernleistung.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { TAG, meldeAufgabe, meldeFehler, scanDiagnose } from "./perfKern.js";

/* Beispiele für die Texteingabe im Scan-Bereich */
export const SCAN_BEISPIELE = [
  { id: "klammer", name: "Minus vor Klammer (Fehler)", kontext: "klammern", zeilen: "3x-(2x-5)\n3x-2x-5\nx-5" },
  { id: "umformung", name: "Umformung (Fehler)", kontext: "umformung", zeilen: "3x-7=5x+1\n3x-5x=1-7\n-2x=-6\nx=3" },
  { id: "richtig", name: "Alles richtig", kontext: "klammern", zeilen: "3x-(2x-5)\n3x-2x+5\nx+5" },
  { id: "unleserlich", name: "Eine Zeile unleserlich", kontext: "klammern", zeilen: "3x-(2x-5)\n? 3x-2x?5\nx+5" },
  { id: "offen", name: "Ursache bleibt offen", kontext: "terme", zeilen: "2(x-4)-3(x-1)\n2x-8-3x-3\n-x-11" },
  { id: "kopfrechnen", name: "Nicht prüfbar (Wurzel)", kontext: "allgemein", zeilen: "sqrt(x)+3\nx+3" },
];

/* Text mit einer Zeile pro Rechenschritt → Eingabe für scanDiagnose. Beginnt eine Zeile mit „?“, gilt sie als unleserlich. */
export function zeilenAusText(t) {
  const roh = String(t || "").split(/\r?\n/).map((z) => z.trim()).filter(Boolean).slice(0, 30);
  return {
    zeilen: roh.map((z) => z.replace(/^\?\s*/, "")),
    zeilenStatus: roh.map((z) => (z.startsWith("?") ? "unklar" : "ok")),
  };
}

/* Lädt ein Szenario: zwei Lernkanäle, ein Muster, ein einzelner Fehler, ein unsicherer Scan und 16 vergleichbare Aufgaben. */
export function ladeTestdaten(P, nutzerId, jetzt = Date.now()) {
  const zeit = (tageZurueck, stunde = 16) => jetzt - tageZurueck * TAG + (stunde - 12) * 3600000;
  let n = 0;
  const f = (e, t) => { const r = meldeFehler(P, { ...e, nutzerId, demo: true, zeit: t }, t); if (r.neu) n++; return r; };
  const dig = (tage, ref, untertyp, kontext, schritt, korrekt, typ = "vorzeichen") => f({
    quelle: "digital", schritt, korrekt, typ, untertyp, eingabeStatus: "gueltig", typSicher: true, konfidenz: 0.85,
    aufgabe: { id: `demo-${ref}`, text: "Testaufgabe", kontext, schwierigkeit: 2 }, ursprung: { art: "aufgabe", ref: `demo:${ref}` },
    beobachtung: `Antwort „${schritt}“`, pruefung: "Entspricht einer typischen Fehlantwort (Testdaten).",
  }, zeit(tage));
  const scan = (tage, id, zeilen, kontext, lesbarkeit = 8) => {
    const s = scanDiagnose({ zeilen, zeilenStatus: zeilen.map(() => "ok"), lesbarkeit, scanId: `demo-${id}`, kontext });
    return s.vorschlag ? f(s.vorschlag, zeit(tage)) : null;
  };

  /* Muster: Minus vor der Klammer – digital UND auf dem Blatt */
  dig(26, "k1", "minus_klammer", "klammern", "3x-2x-5", "x+5");
  scan(22, "k2", ["4x-(x-6)", "4x-x-6", "3x-6"], "klammern");
  dig(19, "k3", "minus_klammer", "klammern", "7-x+4", "7-x-4");
  scan(5, "k4", ["9-(2x+1)", "9-2x+1", "10-2x"], "klammern");
  dig(3, "k5", "minus_klammer", "klammern", "2x^2-x^2-3x-1", "x^2+3x-1");
  /* Zweites, getrenntes Muster: Vorzeichen beim Ableiten */
  dig(12, "a1", "ableiten", "ableiten", "6x+5", "-6x+5");
  dig(7, "a2", "ableiten", "ableiten", "6x^2+8x+1", "6x^2-8x+1");
  /* Einzelne Beobachtung: kein Muster */
  dig(9, "p1", "allgemein", "gleichungen", "x=-3", "x=3", "pqformel");
  /* Unsicherer Scan: wartet auf Klärung, zählt noch nicht */
  scan(1, "u1", ["5x-(3-x)", "5x-3-x"], "klammern", 3);

  /* Vergleichbare Aufgaben (Nenner): zuerst viele Fehler, später weniger – gleich viele Aufgaben pro Phase */
  const fehlerAlt = [1, 1, 0, 1, 0, 1, 1, 0], fehlerNeu = [0, 1, 0, 0, 0, 1, 0, 0];
  fehlerAlt.forEach((x, i) => meldeAufgabe(P, { nutzerId, demo: true, id: `demo-q${i}`, zeit: zeit(27 - i * 1.6), testet: ["vorzeichen"], kontext: "klammern", schwierigkeit: 2, ok: !x, fehlerTyp: x ? "vorzeichen" : null }));
  fehlerNeu.forEach((x, i) => meldeAufgabe(P, { nutzerId, demo: true, id: `demo-q${8 + i}`, zeit: zeit(13 - i * 1.5), testet: ["vorzeichen"], kontext: "klammern", schwierigkeit: 2, ok: !x, fehlerTyp: x ? "vorzeichen" : null }));
  return n;
}
