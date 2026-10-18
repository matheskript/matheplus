/* ======================================================================
   textMathilda.js – Mathilda übersetzt Textaufgaben (reine Logik, kein React)
   Tests: tests/textMathilda.test.mjs

   Ablauf: Foto (oder getippter Text) → Mathilda schreibt die Aufgabe ab,
   benennt das Gesuchte und den Ansatz und übersetzt jede Information in
   eine mathematische Bedingung – mit Begründung und typischer Falle.
   Sie löst die Aufgabe nicht. Die App blendet die Übersetzungen erst ein,
   wenn der Schüler es selbst versucht hat (oder ausdrücklich alles sehen will),
   und prüft getippte Versuche lokal mit bedingungen.js.
   ====================================================================== */

export const ZAEHLER_SCHLUESSEL = "matheplus-textuebersetzungen";

/* Zusatz zum Systemprompt (mathildaSystem): dieser Modus ist ausdrücklich eine Übersetzung */
export const UEBERSETZEN_REGELN = `MODUS „TEXTAUFGABE ÜBERSETZEN“ (vom Schüler ausdrücklich gewählt):
Du übersetzt eine Textaufgabe in mathematische Bedingungen und erklärst jede Übersetzung. Du LÖST die Aufgabe NICHT:
keine Ergebnisse, keine Lösung des Gleichungssystems, keine Zahlenwerte von Koeffizienten. Die App zeigt deine Übersetzungen
erst, wenn der Schüler es selbst versucht hat – liefere trotzdem jede Übersetzung vollständig.
Leitidee: Jede Information im Text ist genau eine (oder mehrere) Bedingung(en). „Hochpunkt H(6|4)“ heißt f(6) = 4 und f′(6) = 0.
Sätze, die nur den Zusammenhang beschreiben („f beschreibt die Höhe …“), sind Kontext, keine Bedingung.
Ungleichungen wie f″(6) < 0 sind keine Bedingungen fürs Gleichungssystem – erwähne sie nur als Prüfung in „warum“.`;

/* Arbeitsauftrag mit genauem JSON-Schema */
export function uebersetzenPrompt({ foto = false, text = "", teilaufgabe = "" } = {}) {
  const quelle = foto
    ? "Auf dem Foto steht eine Textaufgabe (gedruckt oder handschriftlich)."
    : "Der Schüler hat diese Textaufgabe eingetippt oder eingefügt:\n\"\"\"\n" + String(text).slice(0, 6000) + "\n\"\"\"";
  const wahl = teilaufgabe ? `\nDer Schüler möchte nur diesen Teil: „${String(teilaufgabe).slice(0, 200)}“. Übersetze nur diesen; den Rest des Blatts nur, soweit er für diesen Teil gebraucht wird.` : "";
  return `${quelle}${wahl}

So gehst du vor:
1. Abschrift: Schreibe die Aufgabe wörtlich ab (Formeln in LaTeX zwischen $…$). Unsichere Stellen nennst du in „unsicher“. Stehen mehrere Aufgaben auf dem Foto und ist keine gewählt, nimm die erste und nenne die anderen in „weitere“.
   Ist das Foto unlesbar oder steht keine Mathe-Textaufgabe darauf: "lesbar": false und eine kurze Bitte in "rueckfrage". Nicht raten.
2. Gesucht und Ansatz: Was ist gesucht? Welche Variablen bzw. welcher Funktionsansatz (z. B. f(x) = ax^3 + bx^2 + cx + d)? Warum genau dieser
   (Grad, Symmetrie, Wachstumsart …)? Liste die Unbekannten.
3. Übersetzen: Für JEDE Information eine Stelle. "textstelle" ist ein WÖRTLICHES, zusammenhängendes Stück aus deiner Abschrift
   (genau so geschrieben, damit die App es markieren kann – lieber kurz als ungenau). Zu jeder Stelle:
   - "bedeutung": was der Text in Alltagssprache sagt (ein kurzer Satz),
   - "bedingungen": Liste, jede mit "tex" (LaTeX ohne $) und "text" (einfache Schreibweise zum Vergleichen: f'(6) = 0, f''(2) = 0,
     3x - 4 = 11, x + y = 35, P(X >= 3), p = 0,3, b = 1,05 – Malpunkt *, Potenz ^, Bruch /, Dezimalkomma; "text": null, wenn das nicht
     geht, etwa bei Integralen oder Vektoren),
   - "warum": höchstens zwei kurze Sätze, warum die Übersetzung so lautet,
   - "falle": der typische Fehler an dieser Stelle (ein Satz) oder null.
4. Zählen: Anzahl Unbekannte und Anzahl Bedingungen. Passt es nicht, erkläre in "kommentar" warum (Symmetrie spart Bedingungen,
   eine Information fehlt, eine Bedingung ist doppelt …).
5. "kontext": Sätze ohne Bedingung (kurz). "naechster_schritt": ein Satz, wie es nach dem Übersetzen weitergeht (ohne zu rechnen).
   "kontrollfrage": eine Frage, mit der der Schüler prüft, ob er die Übersetzung verstanden hat.
6. "thema": genau eines von "rechenwoerter", "gleichung", "lgs", "funktion", "steckbrief", "anwendung", "stochastik", "vektoren", "sonstiges".
   "klasse": grobe Klassenstufe, z. B. "7–8" oder "11–13".

Schreibweise nach Regel A5 (kein 1x, kein + −, nichts unvereinfacht). Antworte NUR mit diesem JSON, ohne Text davor oder danach:
{"lesbar": true, "rueckfrage": null, "abschrift": "…", "unsicher": [], "weitere": [],
 "thema": "steckbrief", "klasse": "11–13", "gesucht": "…",
 "ansatz": {"tex": "f(x) = ax^3 + bx^2 + cx + d", "unbekannte": ["a", "b", "c", "d"], "warum": "…"},
 "stellen": [{"textstelle": "…", "bedeutung": "…", "bedingungen": [{"tex": "f(6) = 4", "text": "f(6) = 4"}, {"tex": "f'(6) = 0", "text": "f'(6) = 0"}], "warum": "…", "falle": "…"}],
 "zaehlen": {"unbekannte": 4, "bedingungen": 4, "kommentar": "…"},
 "kontext": [], "naechster_schritt": "…", "kontrollfrage": "…"}`;
}

/* ---------- Antwort normalisieren ---------- */
const txt = (v, max = 1200) => (typeof v === "string" ? v.trim().slice(0, max) : v == null ? "" : String(v).slice(0, max));
const liste = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);
export const THEMEN_MATHILDA = ["rechenwoerter", "gleichung", "lgs", "funktion", "steckbrief", "anwendung", "stochastik", "vektoren", "sonstiges"];

export function uebersetzungLesen(roh) {
  const o = roh && typeof roh === "object" ? roh : {};
  const lesbar = o.lesbar !== false && !!txt(o.abschrift);
  const stellen = liste(o.stellen).map((s) => {
    const b = liste(s && s.bedingungen).map((x) => (typeof x === "string" ? { tex: txt(x, 300), text: txt(x, 300) } : { tex: txt(x && (x.tex || x.text), 300), text: x && x.text ? txt(x.text, 300) : null }))
      .filter((x) => x.tex);
    return { textstelle: txt(s && s.textstelle, 400), bedeutung: txt(s && s.bedeutung, 400), bedingungen: b, warum: txt(s && s.warum, 600), falle: txt(s && s.falle, 400) || null };
  }).filter((s) => s.textstelle && s.bedingungen.length).slice(0, 20);
  const a = o.ansatz && typeof o.ansatz === "object" ? o.ansatz : {};
  const zz = o.zaehlen && typeof o.zaehlen === "object" ? o.zaehlen : {};
  const anzahl = stellen.reduce((n, s) => n + s.bedingungen.length, 0);
  return {
    lesbar,
    rueckfrage: txt(o.rueckfrage, 400) || (lesbar ? "" : "Ich konnte keine Textaufgabe erkennen. Fotografiere sie noch einmal gerade von oben – oder tippe den Text ein."),
    abschrift: txt(o.abschrift, 6000),
    unsicher: liste(o.unsicher).map((x) => txt(x, 200)).filter(Boolean).slice(0, 10),
    weitere: liste(o.weitere).map((x) => txt(x, 200)).filter(Boolean).slice(0, 10),
    thema: THEMEN_MATHILDA.includes(o.thema) ? o.thema : "sonstiges",
    klasse: txt(o.klasse, 20),
    gesucht: txt(o.gesucht, 500),
    ansatz: { tex: txt(a.tex, 300), unbekannte: liste(a.unbekannte).map((x) => txt(x, 20)).filter(Boolean).slice(0, 12), warum: txt(a.warum, 600) },
    stellen,
    zaehlen: {
      unbekannte: Number.isFinite(Number(zz.unbekannte)) ? Number(zz.unbekannte) : liste(a.unbekannte).length,
      bedingungen: anzahl,
      kommentar: txt(zz.kommentar, 500),
    },
    kontext: liste(o.kontext).map((x) => txt(x, 300)).filter(Boolean).slice(0, 8),
    naechster: txt(o.naechster_schritt || o.naechster, 500),
    frage: txt(o.kontrollfrage, 400),
  };
}

/* ---------- Textstellen in der Abschrift markieren ----------
   Liefert Teile [{ t, nr }] – nr ist die Nummer der Stelle (1, 2, …) oder null für normalen Text.
   Gesucht wird ohne Rücksicht auf Groß-/Kleinschreibung, Leerraum und Dollarzeichen; nicht gefundene Stellen fehlen einfach. */
const norm = (s) => s.toLowerCase().replace(/\$/g, "").replace(/\s+/g, " ").replace(/[„“"«»]/g, "").trim();
export function markierungen(abschrift, stellen) {
  const quelle = String(abschrift || "");
  /* Abbildung normierter Positionen auf Originalpositionen */
  let n = "";
  const pos = [];
  let leer = false;
  for (let i = 0; i < quelle.length; i++) {
    let c = quelle[i];
    if (c === "$" || /[„“"«»]/.test(c)) continue;
    if (/\s/.test(c)) { if (leer || !n) continue; c = " "; leer = true; } else leer = false;
    n += c.toLowerCase(); pos.push(i);
  }
  const bereiche = [];
  stellen.forEach((s, k) => {
    const nadel = norm(s.textstelle || "");
    if (nadel.length < 2) return;
    let ab = 0, i;
    while ((i = n.indexOf(nadel, ab)) >= 0) {
      const von = pos[i], bis = pos[i + nadel.length - 1] + 1;
      if (!bereiche.some((b) => von < b.bis && bis > b.von)) { bereiche.push({ von, bis, nr: k + 1 }); break; }
      ab = i + 1;
    }
  });
  bereiche.sort((x, y) => x.von - y.von);
  const teile = [];
  let p = 0;
  for (const b of bereiche) {
    if (b.von > p) teile.push({ t: quelle.slice(p, b.von), nr: null });
    teile.push({ t: quelle.slice(b.von, b.bis), nr: b.nr });
    p = b.bis;
  }
  if (p < quelle.length) teile.push({ t: quelle.slice(p), nr: null });
  return teile;
}

/* Welche Stellen konnten nicht markiert werden? (Anzeige: „ohne Markierung“) */
export function nichtGefunden(abschrift, stellen) {
  const gef = new Set(markierungen(abschrift, stellen).map((x) => x.nr).filter(Boolean));
  return stellen.map((_, i) => i + 1).filter((nr) => !gef.has(nr));
}

/* Funktionsnamen aus den Bedingungen (für den Vergleich getippter Versuche) */
export function funktionsnamen(erg) {
  const namen = new Set(["f", "g", "h"]);
  for (const s of erg.stellen) for (const b of s.bedingungen) {
    const t = b.text || "";
    for (const m of t.matchAll(/\b([A-Za-z])'*\(/g)) if (m[1] !== "P") namen.add(m[1]);
  }
  return [...namen];
}

/* Weiter im passenden Werkzeug, wenn übersetzt ist */
export function werkzeugFuerThema(thema) {
  return {
    steckbrief: { ansicht: "steckbrief", name: ["Steckbrief lösen", "Solve the reconstruction"] },
    lgs: { ansicht: "lgs", name: ["Gleichungssystem lösen", "Solve the system"] },
    gleichung: { ansicht: "gleichkurs", name: ["Gleichung lösen", "Solve the equation"] },
    rechenwoerter: { ansicht: "gleichkurs", name: ["Gleichung lösen", "Solve the equation"] },
    funktion: { ansicht: "lgs", name: ["Gleichungssystem lösen", "Solve the system"] },
    stochastik: { ansicht: "bernoulli", name: ["Wahrscheinlichkeit berechnen", "Calculate the probability"] },
    anwendung: { ansicht: "steckbrief", name: ["Steckbrief lösen", "Solve the reconstruction"] },
  }[thema] || null;
}

/* Kontext für „Mathilda dazu fragen“ (MathildaChatModal: { text, eingabe, regeln }) */
export function chatKontext(erg, versuche = {}) {
  const regeln = erg.stellen.map((s, i) => `${i + 1}. „${s.textstelle}“ → ${s.bedingungen.map((b) => b.text || b.tex).join("; ")}`);
  const eingabe = Object.entries(versuche).filter(([, v]) => v && v.trim()).map(([i, v]) => `Stelle ${Number(i) + 1}: ${v}`).join(" | ");
  return {
    text: `Textaufgabe übersetzen. ${erg.abschrift}${erg.ansatz.tex ? ` Ansatz: ${erg.ansatz.tex}.` : ""}`,
    eingabe: eingabe || null,
    regeln: regeln.slice(0, 12),
  };
}

/* Beispiel zum Ausprobieren ohne Foto */
export const BEISPIEL_TEXT = "Der Graph einer ganzrationalen Funktion dritten Grades hat im Punkt H(−2|4) einen Hochpunkt und in W(0|2) einen Wendepunkt. Bestimme die Funktionsgleichung.";
export const BEISPIEL_TEXT_EN = "The graph of a polynomial function of degree 3 has a maximum at H(−2|4) and an inflection point at W(0|2). Find the equation of the function.";
