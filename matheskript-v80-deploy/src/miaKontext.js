/* ======================================================================
   miaKontext.js – Mia, die Abi-Trainerin (reine Logik, kein React)

   Mia ist Mathildas Schwester im Abi-Zentrum: dieselbe Haltung (sokratisch,
   Regel A5, rechnet mit den Werkzeugen der App), aber alles auf die Prüfung
   ausgerichtet: BE, Operatoren, Erwartungshorizont, Zeit, Hilfsmittel.

   Vier Modi:
     korrigieren    Foto der Lösung → BE je Teilaufgabe gegen den Erwartungshorizont (JSON)
     entschluesseln Foto einer Abi-Aufgabe → Operatoren, BE, Plan je Teilaufgabe (JSON), keine Lösung
     fragen         Chat mit Abi-Fokus
     muendlich      Simulation: Vorbereitung, Vortrag, Prüfungsgespräch, Rückmeldung

   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { lernstandAuszug } from "./mathildaKontext.js";
import { anredeHinweis } from "./rollenLogik.js";
import { aufgabeAlsText } from "./abiGeneratoren.js";
import { profilNormieren, pruefungFuer, niveauWorte, landName, zielTermin, countdown, planFuer, phaseAm, statistik, schwaechstesGebiet, datum } from "./abiZentrum.js";

export const MIA_ZAEHLER = "matheplus-mia-korrekturen";
export const MIA_AUFGABE = "mm-mia-aufgabe";   // sessionStorage: { typ, seed } aus dem Aufgaben-Training

export const MIA_MODI = [
  { id: "korrigieren", name: "Lösung korrigieren", kurz: "Foto vom Blatt – BE je Schritt" },
  { id: "entschluesseln", name: "Aufgabe entschlüsseln", kurz: "Operatoren, BE, Plan – ohne Lösung" },
  { id: "muendlich", name: "Mündliche Prüfung", kurz: "Vortrag und Gespräch mit Mia" },
  { id: "fragen", name: "Mia fragen", kurz: "Prüfungsfragen, Methoden, Zeit" },
];

/* ---------- Operatoren (sinngemäß nach der IQB-Operatorenliste) ---------- */
export const OPERATOREN = [
  { wort: "angeben, nennen", afb: "I", heisst: "Ergebnis hinschreiben – ohne Rechenweg und ohne Begründung." },
  { wort: "berechnen", afb: "I–II", heisst: "Ergebnis aus einem Ansatz mit Rechenschritten gewinnen; die Schritte gehören aufs Blatt." },
  { wort: "bestimmen, ermitteln", afb: "II", heisst: "Weg frei wählbar, auch mit Hilfsmitteln; Ansatz, Weg und Ergebnis müssen sichtbar sein." },
  { wort: "zeigen, nachweisen", afb: "II", heisst: "Das Ergebnis steht schon da – bewertet wird nur der lückenlose Weg dorthin." },
  { wort: "untersuchen", afb: "II", heisst: "Eigenschaften selbst herausfinden; welche Schritte nötig sind, entscheidest du." },
  { wort: "begründen", afb: "II–III", heisst: "Eine Aussage mit Regeln, Sätzen oder einer Rechnung stützen." },
  { wort: "beschreiben", afb: "I–II", heisst: "Einen Sachverhalt in eigenen Worten geordnet wiedergeben." },
  { wort: "erläutern", afb: "II", heisst: "Verständlich machen, mit zusätzlichen Informationen oder einem Beispiel." },
  { wort: "interpretieren, deuten", afb: "II–III", heisst: "Ein Ergebnis im Sachzusammenhang erklären – mit Einheit und in ganzen Sätzen." },
  { wort: "beurteilen", afb: "III", heisst: "Zu einem Sachverhalt ein eigenes, begründetes Urteil fällen." },
  { wort: "skizzieren", afb: "I–II", heisst: "Wesentliche Eigenschaften grafisch zeigen, ohne Maßstabstreue." },
  { wort: "zeichnen", afb: "I–II", heisst: "Genau und maßstäblich darstellen." },
];

/* ---------- Grundregeln ---------- */
export const REGELN_MIA = `Du bist Mia, die Abi-Trainerin von Mythos Mathe. Du bereitest Schüler auf die Mathe-Abiturprüfung vor – schriftlich und mündlich.
Du bist Mathildas Schwester: warm, knapp, ehrlich, nie herablassend, kein Lob-Geschwafel. Du klingst wie ein erfahrener Prüfer, der auf der Seite des Schülers steht.

Prüfungsdenken: Es zählt, was auf dem Blatt steht. Du denkst in Bewertungseinheiten (BE), Operatoren und Erwartungshorizont.
Bei jedem Thema sagst du, wie es in der Prüfung abgefragt wird und wo die BE liegen. „Zeige“ heißt: der Weg zählt, nicht das Ergebnis.
Teil A ist ohne Hilfsmittel; im Leistungsfach Baden-Württemberg gibt es in Teil B den wissenschaftlichen Taschenrechner und das IQB-Formeldokument.

Sokratisch, immer in dieser Reihenfolge:
1. Rückfrage: Was hat der Schüler, wo hängt er? Eine Frage.
2. Hinweis: der nächste Schritt oder die Regel, ohne Ergebnis.
3. Teilschritt gemeinsam, den Rest macht der Schüler.
4. Lösung nur auf ausdrücklichen Wunsch, dann vollständig und so, wie sie im Abi auf dem Blatt stehen müsste.
Pro Antwort höchstens fünf kurze Sätze oder eine kurze Rechnung. Keine Vorrede.

Rechnen: Du rechnest nie im Kopf. Ableitungen, Nullstellen, Extrempunkte, Funktionswerte, Vereinfachungen, Binomialverteilung,
Hypothesentests lässt du die Werkzeuge rechnen und nennst nur, was sie liefern.

Schreibweise (Regel A5): Nichts bleibt unvereinfacht. Kein 1x, kein x^1, kein + 0, kein + −. Ableitungen vollständig faktorisiert,
etwa $f'(x) = −(x + 1) \\cdot e^{−x}$. Formeln in LaTeX zwischen Dollarzeichen. Brüche als \\frac.

Grenzen: Du prognostizierst keine Abiturnote. Du bewertest Lösungen, nie die Person. Andere Themen als Mathe und Abi lenkst du freundlich zurück.
Antworte auf Deutsch, generisches Maskulinum.`;

/* ---------- Was Mia über das Abi des Schülers weiß ---------- */
export function abiAuszug(abiProfil, abi, heute = datum(Date.now())) {
  if (!abiProfil) return "Noch kein Abi-Profil angelegt – frag bei Bedarf nach Bundesland, Kurs und Prüfungsform.";
  const p = profilNormieren(abiProfil);
  const pr = pruefungFuer(p);
  const worte = niveauWorte(p.land);
  const z = [];
  z.push(`Abitur ${p.jahr} in ${landName(p.land)}, ${worte[p.niveau]}, Prüfung ${p.form === "beides" ? "schriftlich und mündlich" : p.form}.`);
  z.push(`Prüfungsformat: ${pr.titel}${pr.be ? `, ${pr.be} BE` : ""}${pr.form === "schriftlich" && pr.teilA ? `, Teil A ohne Hilfsmittel` : ""}.`);
  if (p.form !== "muendlich") z.push(`Hilfsmittel in Teil B: ${p.land === "BW" ? "WTR und IQB-Formeldokument" : p.hilfsmittel}.`);
  const ziel = zielTermin(p, heute);
  const cd = countdown(ziel, heute);
  if (cd && !cd.vorbei) z.push(`Nächste Prüfung in ${cd.tage} Tagen (${ziel}).`);
  const plan = planFuer(p, abi, heute);
  const phase = phaseAm(plan, heute);
  if (phase) z.push(`Aktuelle Phase im Abi-Plan: ${phase.titel} (${phase.zeile}).`);
  if (p.punkte !== null) z.push(`Letzte Kursnote: ${p.punkte} Punkte${p.ziel !== null ? `, Ziel: ${p.ziel} Punkte` : ""}.`);
  if (abi) {
    const s = statistik(abi);
    const teile = Object.entries(s).filter(([, v]) => v.anzahl).map(([g, v]) => `${g} ${Math.round(v.quote * 100)} % der BE (${v.anzahl} Aufgaben)`);
    if (teile.length) z.push(`Abi-Aufgaben bisher: ${teile.join(", ")}. Schwächstes Gebiet: ${schwaechstesGebiet(abi)}.`);
  }
  return z.join("\n");
}

/* ---------- Modus-Regeln ---------- */
export const KORREKTUR_REGELN = `Modus: Abi-Korrektur. Du bekommst das Foto einer handschriftlichen Lösung und – falls vorhanden – die Aufgabe mit Erwartungshorizont.
Bewerte wie ein Zweitkorrektor im Abitur:
· BE nur für das, was auf dem Blatt steht. Ein richtiges Ergebnis ohne nötigen Weg bekommt nicht die vollen BE (außer beim Operator „angeben“).
· Andere Lösungswege: Ein mathematisch korrekter Weg, der nicht im Erwartungshorizont steht, bekommt dieselben BE wie der Weg dort.
· Folgefehler: Rechnet der Schüler mit einem falschen Zwischenergebnis richtig weiter, gibt es die BE der folgenden Schritte.
· Teil-BE sind erlaubt; halbe BE nicht.
· Unleserliches oder fehlende Teilaufgaben: 0 BE für diesen Teil, im Kommentar sagen, was fehlt.
· Schreibweise A5 und saubere Darstellung erwähnst du, ziehst dafür aber keine BE ab, solange die Mathematik stimmt.
Antworte NUR mit JSON, ohne Text davor oder danach:
{"lesbar": true, "teile": [{"b": "a", "be": 2, "max": 2, "urteil": "voll", "kommentar": "…"}], "staerke": "…", "hebel": ["…", "…"], "darstellung": "…"}
urteil ist "voll", "teil" oder "fehlt". kommentar: ein bis zwei Sätze, was genau die BE bringt oder kostet (Formeln in $…$).
staerke: ein Satz, was gut war. hebel: höchstens zwei konkrete Hebel für die nächste Aufgabe. darstellung: ein Satz zur Form.
Ist auf dem Foto keine Lösung zu erkennen: {"lesbar": false, "hinweis": "…"}`;

export const ENTSCHLUESSELN_REGELN = `Modus: Abi-Aufgabe entschlüsseln. Du bekommst das Foto einer Prüfungsaufgabe (gedruckt oder abgeschrieben).
Du löst sie NICHT. Du zeigst, was verlangt ist und wie man vorgeht.
Für jede Teilaufgabe: Operator, BE (vom Blatt; fehlen sie, schätze nach IQB-Logik und setze "geschaetzt": true), worum es geht (ein Satz),
ein Plan mit zwei bis vier Schritten ohne Ergebnisse, und die typische Falle.
Antworte NUR mit JSON:
{"lesbar": true, "thema": "…", "sachgebiet": "analysis|geometrie|stochastik", "hilfsmittel": "…", "teile": [{"b": "a", "operator": "berechnen", "be": 3, "geschaetzt": false, "worum": "…", "plan": ["…", "…"], "falle": "…"}], "zeit": 15}
zeit: empfohlene Minuten (rund drei Minuten je BE). Ist keine Aufgabe zu erkennen: {"lesbar": false, "hinweis": "…"}`;

/* ---------- Mündliche Prüfung ---------- */
/* Vortragsaufgaben im Stil des Basisfachs (Baden-Württemberg): Vortrag etwa 10 Minuten,
   danach Prüfungsgespräch etwa 10 Minuten im anderen Sachgebiet. kern = Lösungskern (nur für Mia). */
export const MUENDLICH_THEMEN = [
  { id: "m-tangente", gebiet: "analysis", gespraech: "geometrie", titel: "Ableitung und Tangente",
    auftrag: ["Gegeben ist $f(x) = x^3 − 3x$.", "a) Erläutern Sie die geometrische Bedeutung der Ableitung $f'(x_0)$.", "b) Bestimmen Sie die Gleichung der Tangente an den Graphen von $f$ im Punkt $P(2 \\mid f(2))$.", "c) Begründen Sie, an welchen Stellen der Graph waagrechte Tangenten hat."],
    kern: "f'(x) = 3x^2 − 3 = 3(x − 1)(x + 1); f(2) = 2, f'(2) = 9, Tangente t(x) = 9x − 16; waagrechte Tangenten bei x = −1 (Hochpunkt (−1|2)) und x = 1 (Tiefpunkt (1|−2))." },
  { id: "m-extrem", gebiet: "analysis", gespraech: "stochastik", titel: "Extrem- und Wendepunkte",
    auftrag: ["Gegeben ist $f(x) = x^3 − 6x^2 + 9x$.", "a) Beschreiben Sie, wie man Extrempunkte rechnerisch bestimmt, und bestimmen Sie die Extrempunkte von $f$.", "b) Bestimmen Sie den Wendepunkt.", "c) Skizzieren Sie den Graphen."],
    kern: "f'(x) = 3x^2 − 12x + 9 = 3(x − 1)(x − 3); f''(x) = 6x − 12; Hochpunkt H(1|4), Tiefpunkt T(3|0), Wendepunkt W(2|2); Nullstellen x = 0 und x = 3 (doppelt)." },
  { id: "m-integral", gebiet: "analysis", gespraech: "geometrie", titel: "Integral und Fläche",
    auftrag: ["Gegeben ist $f(x) = −x^2 + 4$.", "a) Erläutern Sie den Zusammenhang zwischen Integral und Flächeninhalt.", "b) Berechnen Sie den Inhalt der Fläche, die der Graph mit der x-Achse einschließt.", "c) Erklären Sie, warum ein Integral auch negativ sein kann."],
    kern: "Nullstellen ±2; Stammfunktion F(x) = −x^3/3 + 4x; Fläche = F(2) − F(−2) = 32/3 ≈ 10,67 FE; negatives Integral, wenn der Graph unter der x-Achse liegt (orientierte Fläche)." },
  { id: "m-wachstum", gebiet: "analysis", gespraech: "stochastik", titel: "Exponentielles Wachstum",
    auftrag: ["Ein Bestand wird beschrieben durch $B(t) = 200 \\cdot e^{0{,}1t}$ ($t$ in Tagen).", "a) Interpretieren Sie die Zahlen 200 und 0,1 im Sachzusammenhang.", "b) Bestimmen Sie die Verdopplungszeit.", "c) Berechnen Sie die momentane Änderungsrate zu Beginn und deuten Sie sie."],
    kern: "200 = Anfangsbestand, 0,1 = Wachstumskonstante (rund 10,5 % pro Tag); Verdopplungszeit 10 · ln 2 ≈ 6,93 Tage; B'(t) = 20 · e^{0,1t}, B'(0) = 20 Einheiten pro Tag." },
  { id: "m-geraden", gebiet: "geometrie", gespraech: "analysis", titel: "Lage von Geraden",
    auftrag: ["Gegeben sind $g: \\vec{x} = \\spalte{1}{0}{2} + r \\cdot \\spalte{2}{1}{−1}$ und $h: \\vec{x} = \\spalte{0}{3}{1} + s \\cdot \\spalte{1}{−1}{1}$.", "a) Beschreiben Sie, welche Lagen zwei Geraden im Raum haben können und wie man sie unterscheidet.", "b) Untersuchen Sie die Lage von $g$ und $h$."],
    kern: "Richtungsvektoren nicht parallel; Gleichsetzen: aus den ersten beiden Zeilen r = 2/3, s = 7/3, dritte Zeile 4/3 ≠ 10/3 → windschief." },
  { id: "m-abstand", gebiet: "geometrie", gespraech: "analysis", titel: "Ebene und Abstand",
    auftrag: ["Gegeben sind die Ebene $E: 2x_1 − x_2 + 2x_3 = 4$ und der Punkt $P(3 \\mid 1 \\mid 4)$.", "a) Erläutern Sie die Bedeutung des Normalenvektors.", "b) Berechnen Sie den Abstand von $P$ zu $E$.", "c) Beschreiben Sie einen zweiten Lösungsweg."],
    kern: "n = (2, −1, 2), |n| = 3; d = |6 − 1 + 8 − 4| / 3 = 3; zweiter Weg: Lotgerade durch P, Schnitt mit E (Lotfußpunkt), Länge des Verbindungsvektors." },
  { id: "m-binom", gebiet: "stochastik", gespraech: "analysis", titel: "Binomialverteilung",
    auftrag: ["Ein Glücksrad zeigt mit Wahrscheinlichkeit 0,2 Gold. Es wird zehnmal gedreht.", "a) Begründen Sie, warum die Anzahl $X$ der Treffer binomialverteilt ist.", "b) Berechnen Sie $P(X = 2)$.", "c) Bestimmen Sie Erwartungswert und Standardabweichung und deuten Sie den Erwartungswert."],
    kern: "Bernoulli-Kette: zwei Ausgänge, p konstant, unabhängig, n = 10; P(X = 2) = C(10,2) · 0,2^2 · 0,8^8 ≈ 0,302; E(X) = 2, σ = √1,6 ≈ 1,26." },
  { id: "m-bedingt", gebiet: "stochastik", gespraech: "analysis", titel: "Bedingte Wahrscheinlichkeit",
    auftrag: ["5 % der Bauteile einer Firma sind fehlerhaft. Ein Prüfgerät meldet 90 % der fehlerhaften Teile, aber auch 4 % der fehlerfreien.", "a) Stellen Sie die Situation in einem Baumdiagramm oder einer Vier-Felder-Tafel dar.", "b) Berechnen Sie, mit welcher Wahrscheinlichkeit das Gerät Alarm gibt.", "c) Ein Teil löst Alarm aus. Bestimmen Sie die Wahrscheinlichkeit, dass es fehlerhaft ist, und beurteilen Sie das Ergebnis."],
    kern: "P(Alarm) = 0,05 · 0,9 + 0,95 · 0,04 = 0,083; P(fehlerhaft | Alarm) = 0,045 / 0,083 ≈ 0,542 – fast jeder zweite Alarm ist falsch, weil es viel mehr fehlerfreie Teile gibt." },
];
export const thema = (id) => MUENDLICH_THEMEN.find((t) => t.id === id) || null;
const GEBIET_NAME = { analysis: "Analysis", geometrie: "Analytische Geometrie", stochastik: "Stochastik" };
export const gebietName = (g) => GEBIET_NAME[g] || g;

export const MUENDLICH_PHASEN = [
  { id: "vorbereitung", titel: "Vorbereitung", minuten: 20, zeile: "Aufgabe lesen, Stichpunkte auf Papier – ohne Hilfsmittel" },
  { id: "vortrag", titel: "Vortrag", minuten: 10, zeile: "Du trägst vor, Mia hört zu und fragt höchstens kurz nach" },
  { id: "gespraech", titel: "Prüfungsgespräch", minuten: 10, zeile: "Mia fragt – auch im anderen Sachgebiet" },
  { id: "rueckmeldung", titel: "Rückmeldung", minuten: 0, zeile: "Was trägt, was fehlt, wie du sprichst" },
];

export function muendlichRegeln(t, phase) {
  const basis = `Modus: Simulation der mündlichen Abiturprüfung (Basisfach-Format: etwa 10 Minuten Vortrag, etwa 10 Minuten Prüfungsgespräch im anderen Sachgebiet).
Vortragsthema: ${t.titel} (${gebietName(t.gebiet)}). Aufgabe: ${t.auftrag.join(" ").replace(/\$/g, "")}
Lösungskern (geheim, nie vorsagen): ${t.kern}`;
  if (phase === "vortrag") return `${basis}
Phase: Vortrag. Der Schüler trägt vor (getippt oder gesprochen, oft in Abschnitten). Unterbrich nicht mit Belehrungen.
Antworte nach jedem Abschnitt mit höchstens einem Satz wie ein Prüfer („Danke, fahren Sie fort.“ oder eine kurze Verständnisfrage, falls etwas fehlt).
Du siezt den Schüler wie in der echten Prüfung.`;
  if (phase === "gespraech") return `${basis}
Phase: Prüfungsgespräch. Du bist der Prüfer und siezt den Schüler. Stelle immer genau EINE Frage pro Nachricht.
Beginne mit einer Anschlussfrage zum Vortrag, dann wechsle ins Sachgebiet ${gebietName(t.gespraech)}: Begriffe, Zusammenhänge, kleine Rechnungen im Kopf.
Steigere von Reproduktion (AFB I) über Zusammenhänge (AFB II) zu Begründungen (AFB III). Hilf bei Stocken mit einem kleinen Impuls, nicht mit der Antwort.
Keine Bewertung während des Gesprächs.`;
  if (phase === "rueckmeldung") return `${basis}
Phase: Rückmeldung. Die Prüfung ist vorbei, du duzt wieder. Gib eine ehrliche Rückmeldung in vier kurzen Abschnitten mit Überschrift in Fettdruck:
**Fachlich** (was stimmte, was fehlte – konkret mit Formeln), **Fachsprache** (welche Begriffe gut saßen, welche fehlten), **Aufbau** (Struktur des Vortrags), **Bis zur Prüfung** (zwei konkrete Übungen).
Keine Note, keine Punktzahl.`;
  return basis;
}

/* ---------- Systemprompt ---------- */
export function miaSystem({ modus = "fragen", L = null, profil = null, abiProfil = null, abi = null, aufgabe = null, muendlich = null, heute = datum(Date.now()) } = {}) {
  const teile = [REGELN_MIA, anredeHinweis(profil && profil.geschlecht),
    "Was du über diesen Schüler weißt (aus der App, nicht nachfragen):", lernstandAuszug(L, { profil }), abiAuszug(abiProfil, abi, heute)];
  if (modus === "korrigieren") teile.push(KORREKTUR_REGELN);
  if (modus === "entschluesseln") teile.push(ENTSCHLUESSELN_REGELN);
  if (modus === "muendlich" && muendlich) teile.push(muendlichRegeln(thema(muendlich.thema) || MUENDLICH_THEMEN[0], muendlich.phase));
  if (modus === "fragen" && aufgabe) teile.push(`Der Schüler arbeitet gerade an dieser Abi-Aufgabe (Erwartungshorizont geheim, nur auf ausdrücklichen Wunsch):\n${aufgabeAlsText(aufgabe, { mitErwartung: true })}`);
  return teile.filter(Boolean).join("\n\n");
}

/* Anfrage-Text zur Korrektur: generierte Aufgabe mit Erwartungshorizont oder eigene Aufgabe vom Foto */
export function korrekturPrompt(aufgabe) {
  if (aufgabe) return `Hier ist die Aufgabe mit Erwartungshorizont:\n\n${aufgabeAlsText(aufgabe, { mitErwartung: true })}\n\nAuf dem Foto ist meine Lösung. Korrigiere sie Teil für Teil (${aufgabe.teile.map((t) => `${t.b}) ${t.be} BE`).join(", ")}).`;
  return "Auf dem Foto stehen die Aufgabe (oder ihr Text) und meine Lösung. Erkenne die Teilaufgaben und ihre BE vom Blatt; fehlen die BE, schätze sie nach IQB-Logik. Korrigiere Teil für Teil.";
}

const text = (x, max = 400) => (typeof x === "string" ? x.trim().slice(0, max) : "");
const URTEILE = ["voll", "teil", "fehlt"];

/* JSON der Korrektur prüfen. Mit Aufgabe gelten deren Teilaufgaben und BE – Mia kann nicht mehr BE vergeben, als es gibt. */
export function korrekturLesen(j, aufgabe = null) {
  if (!j || typeof j !== "object") throw new Error("Mia hat keine lesbare Korrektur geliefert. Versuch es noch einmal.");
  if (j.lesbar === false) return { lesbar: false, hinweis: text(j.hinweis) || "Auf dem Foto ist keine Lösung zu erkennen." };
  const roh = Array.isArray(j.teile) ? j.teile : [];
  let teile;
  if (aufgabe) {
    teile = aufgabe.teile.map((t) => {
      const r = roh.find((x) => x && String(x.b).replace(/\W/g, "").toLowerCase() === t.b) || {};
      const be = Math.max(0, Math.min(t.be, Math.round(Number(r.be) || 0)));
      return { b: t.b, be, max: t.be, urteil: be === t.be ? "voll" : be === 0 ? "fehlt" : "teil", kommentar: text(r.kommentar) || (r.be === undefined ? "Diesen Teil hat Mia auf dem Foto nicht gefunden." : "") };
    });
  } else {
    teile = roh.filter((x) => x && x.b !== undefined).slice(0, 12).map((r) => {
      const max = Math.max(1, Math.min(30, Math.round(Number(r.max) || 1)));
      const be = Math.max(0, Math.min(max, Math.round(Number(r.be) || 0)));
      return { b: text(String(r.b), 6) || "?", be, max, urteil: URTEILE.includes(r.urteil) ? r.urteil : be === max ? "voll" : be ? "teil" : "fehlt", kommentar: text(r.kommentar) };
    });
    if (!teile.length) throw new Error("Mia konnte keine Teilaufgaben erkennen. Fotografiere Aufgabe und Lösung zusammen.");
  }
  const summe = teile.reduce((s, t) => s + t.be, 0), max = teile.reduce((s, t) => s + t.max, 0);
  return { lesbar: true, teile, summe, max, staerke: text(j.staerke), hebel: (Array.isArray(j.hebel) ? j.hebel : []).map((h) => text(h, 240)).filter(Boolean).slice(0, 2), darstellung: text(j.darstellung) };
}

/* JSON der Entschlüsselung prüfen */
export function entschluesselnLesen(j) {
  if (!j || typeof j !== "object") throw new Error("Mia hat keine lesbare Antwort geliefert. Versuch es noch einmal.");
  if (j.lesbar === false) return { lesbar: false, hinweis: text(j.hinweis) || "Auf dem Foto ist keine Aufgabe zu erkennen." };
  const teile = (Array.isArray(j.teile) ? j.teile : []).filter((t) => t && t.b !== undefined).slice(0, 12).map((t) => ({
    b: text(String(t.b), 6), operator: text(t.operator, 40), be: Math.max(0, Math.min(30, Math.round(Number(t.be) || 0))), geschaetzt: t.geschaetzt === true,
    worum: text(t.worum), plan: (Array.isArray(t.plan) ? t.plan : []).map((s) => text(s, 240)).filter(Boolean).slice(0, 4), falle: text(t.falle),
  }));
  if (!teile.length) throw new Error("Mia konnte keine Teilaufgaben erkennen. Fotografiere die ganze Aufgabe.");
  const be = teile.reduce((s, t) => s + t.be, 0);
  const zeit = Math.max(1, Math.min(300, Math.round(Number(j.zeit) || be * 3)));
  return { lesbar: true, thema: text(j.thema, 120), sachgebiet: ["analysis", "geometrie", "stochastik"].includes(j.sachgebiet) ? j.sachgebiet : null, hilfsmittel: text(j.hilfsmittel, 120), teile, be, zeit };
}

export const MIA_START = {
  fragen: "Hi, ich bin Mia. Ich kenne dein Abi-Format und weiß, wo die BE liegen. Woran arbeitest du gerade?",
  muendlich: "Willkommen zur Prüfung. Bitte beginnen Sie mit Ihrem Vortrag.",
};
