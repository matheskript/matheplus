/* ======================================================================
   MOTION-ERKLÄRUNGEN für den Kurs „Mathe lernen mit Claude“

   Jede Lektion hat einen kurzen Film (20–30 s) im gemeinsamen Player
   (funcErklaeranimation.jsx). Die Filme zeigen einen Chat: rechts die
   Schülerin in Gold, links Claude in Weiß. Blasen erscheinen nacheinander,
   Stempel („So nicht“ / „So besser“) und Merkkarten heben die Regel hervor.

   Ein Film wird als Liste von Ereignissen beschrieben:
     { t, art: "du" | "claude" | "merk" | "stempel" | "loeschen", zeilen: [...] }
   Die Zeilen sind von Hand umbrochen (höchstens ~34 Zeichen), damit nichts
   über den Rand läuft. Beispiele je Stufe über w(stufe, mittel, ober).
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { Player, lauf, T } from "./funcErklaeranimation.jsx";

const GOLD = C.flaggold;
const NACHT = "#06102A";
const BLAU = C.see;
const ROT = C.signal;

/* ---------- Geometrie ---------- */
const ZEILE = 14.5;          // Zeilenhöhe
const RAND = 12;             // Innenabstand der Blase
const BREITE = 360;
const MAX = 258;             // größte Blasenbreite
const ZEICHEN = 6.25;        // mittlere Zeichenbreite bei 11.5px

const blasenBreite = (zeilen) => Math.min(MAX, Math.max(90, Math.max(...zeilen.map((z) => z.length)) * ZEICHEN + 2 * RAND));
const blasenHoehe = (zeilen) => zeilen.length * ZEILE + 2 * RAND - 2;

/* Teilt die Ereignisse in Abschnitte (jedes „loeschen“ beginnt neu) und
   berechnet je Ereignis die Position – einmal beim Bauen der Szene. */
function layout(ereignisse) {
  const fertig = [];
  let y = 10;
  let maxY = 0;
  for (const e of ereignisse) {
    if (e.art === "loeschen") { maxY = Math.max(maxY, y); y = 10; fertig.push({ ...e }); continue; }
    if (e.art === "stempel") { fertig.push({ ...e }); y += 18; continue; }
    const zeilen = e.zeilen || [];
    const b = e.art === "merk" ? 300 : blasenBreite(zeilen);
    const h = e.art === "merk" ? zeilen.length * ZEILE + 2 * RAND + 14 : blasenHoehe(zeilen);
    const x = e.art === "du" ? BREITE - 12 - b : e.art === "merk" ? (BREITE - b) / 2 : 44;
    fertig.push({ ...e, x, y, b, h });
    y += h + 10;
  }
  maxY = Math.max(maxY, y);
  return { ereignisse: fertig, hoehe: maxY + 6 };
}

/* Welche Ereignisse sind zur Zeit t sichtbar? (ab dem letzten „loeschen“ vor t) */
function sichtbar(ereignisse, t) {
  let start = 0;
  ereignisse.forEach((e, i) => { if (e.art === "loeschen" && t >= e.t) start = i + 1; });
  return ereignisse.slice(start).filter((e) => e.art !== "loeschen");
}

function Avatar({ x, y, du }) {
  return du ? (
    <g>
      <circle cx={x} cy={y} r="11" fill={GOLD} />
      <T x={x} y={y + 4} fontSize="10" fontWeight="800" textAnchor="middle" fill={NACHT}>Du</T>
    </g>
  ) : (
    <g>
      <circle cx={x} cy={y} r="11" fill={NACHT} stroke={GOLD} strokeWidth="1.2" />
      {/* Sprechblase mit Funken – das Kurs-Emblem, kein Markenzeichen */}
      <path d={`M${x - 5} ${y - 4} h10 a2 2 0 0 1 2 2 v5 a2 2 0 0 1 -2 2 h-5 l-3 3 v-3 h-2 a2 2 0 0 1 -2 -2 v-5 a2 2 0 0 1 2 -2z`} fill={GOLD} />
    </g>
  );
}

function Blase({ e, t }) {
  const a = lauf(t, e.t, e.t + 0.55);
  if (a <= 0) return null;
  const du = e.art === "du";
  const dy = (1 - a) * 10;
  return (
    <g opacity={a} transform={`translate(0 ${dy})`}>
      <Avatar x={du ? BREITE - 23 : 24} y={e.y + 13} du={du} />
      <rect x={du ? e.x - 26 : e.x} y={e.y} width={e.b} height={e.h} rx="12" fill={du ? GOLD : C.weiss} stroke={du ? "none" : BLAU} strokeWidth="1.2" />
      {e.zeilen.map((z, i) => (
        <T key={i} x={(du ? e.x - 26 : e.x) + RAND} y={e.y + RAND + 10 + i * ZEILE} fontSize="11.5" fontWeight={du ? 600 : 500} fill={du ? NACHT : C.tinte}>{z}</T>
      ))}
    </g>
  );
}

function Punkte({ e, t }) {
  /* Tipp-Punkte, bevor Claude antwortet */
  if (t < e.t - 0.8 || t >= e.t) return null;
  const p = (t - (e.t - 0.8)) / 0.8;
  return (
    <g>
      <rect x={e.x} y={e.y} width="52" height="24" rx="12" fill={C.weiss} stroke={BLAU} strokeWidth="1" />
      {[0, 1, 2].map((i) => <circle key={i} cx={e.x + 14 + i * 12} cy={e.y + 12} r="3" fill={BLAU} opacity={0.35 + 0.65 * Math.max(0, Math.sin((p * 3 - i * 0.4) * Math.PI))} />)}
    </g>
  );
}

function Merk({ e, t }) {
  const a = lauf(t, e.t, e.t + 0.6);
  if (a <= 0) return null;
  return (
    <g opacity={a}>
      <rect x={e.x} y={e.y} width={e.b} height={e.h} rx="14" fill={NACHT} />
      <rect x={e.x} y={e.y} width="5" height={e.h} rx="2.5" fill={GOLD} />
      <T x={e.x + 16} y={e.y + 15} fontSize="9.5" fontWeight="800" letterSpacing="0.14em" fill={GOLD}>MERKE</T>
      {e.zeilen.map((z, i) => (
        <T key={i} x={e.x + 16} y={e.y + 31 + i * ZEILE} fontSize="11.5" fontWeight="600" fill={C.weiss}>{z}</T>
      ))}
    </g>
  );
}

function Stempel({ e, t, ziel }) {
  const a = lauf(t, e.t, e.t + 0.35);
  if (a <= 0 || !ziel) return null;
  const gut = e.gut;
  const x = ziel.art === "du" ? ziel.x - 26 - 10 : ziel.x + ziel.b - 64;
  const y = ziel.y + ziel.h - 4;
  const s = 1.5 - 0.5 * a;
  return (
    <g opacity={a} transform={`translate(${x} ${y}) rotate(-8) scale(${s})`}>
      <rect x="0" y="0" width="78" height="22" rx="6" fill={gut ? C.smaragd : ROT} />
      <T x="39" y="15" fontSize="11" fontWeight="800" textAnchor="middle" fill={C.weiss}>{gut ? "✓ So besser" : "✗ So nicht"}</T>
    </g>
  );
}

/* Baut aus Ereignissen eine Player-Szene */
function chatSzene({ dauer, schritte, ereignisse, beschreibung }, ki = "Claude") {
  const name = (t) => String(t).replace(/\{KI\}/g, ki);
  ereignisse = ereignisse.map((e) => (e.zeilen ? { ...e, zeilen: e.zeilen.map(name) } : e));
  schritte = schritte.map((x) => ({ ...x, text: name(x.text) }));
  beschreibung = name(beschreibung);
  const L = layout(ereignisse);
  const zeichne = (t) => {
    const sicht = sichtbar(L.ereignisse, t);
    return (
      <g>
        {sicht.map((e, i) => {
          if (e.art === "merk") return <Merk key={i} e={e} t={t} />;
          if (e.art === "stempel") {
            const ziel = [...sicht.slice(0, i)].reverse().find((x) => x.art === "du" || x.art === "claude");
            return <Stempel key={i} e={e} t={t} ziel={ziel} />;
          }
          return (
            <g key={i}>
              {e.art === "claude" && <Punkte e={e} t={t} />}
              <Blase e={e} t={t} />
            </g>
          );
        })}
      </g>
    );
  };
  return { dauer, hoehe: L.hoehe, schritte, zeichne, beschreibung };
}

const w = (stufe, mittel, ober) => (stufe === "ober" ? ober : mittel);

/* ====================================================================== Filme */
const FILME = {
  zugang: (s, ki) => chatSzene({
    dauer: 22,
    schritte: [
      { von: 0, text: "Ohne Startprompt antwortet {KI} wie ein Lexikon: ausführlich, fertig – und du liest nur." },
      { von: 6, text: "Mit Startprompt weiß {KI}, wer du bist und was er nicht tun soll. Er fragt zurück." },
      { von: 14, text: "Der Startprompt gilt für den ganzen Chat. Ein Chat pro Thema – und er passt immer." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Was ist die Scheitelform?"], ["Was ist die h-Methode?"]) },
      { t: 1.8, art: "claude", zeilen: w(s, ["Die Scheitelform lautet", "f(x) = a(x − d)² + e. Dabei ist", "S(d | e) der Scheitelpunkt, a …", "(und so weiter, 20 Zeilen)"], ["Die h-Methode bestimmt f′(x₀)", "als Grenzwert des Differenzen-", "quotienten (f(x₀ + h) − f(x₀))/h", "für h → 0 … (20 Zeilen weiter)"]) },
      { t: 3.6, art: "stempel", gut: false },
      { t: 6, art: "loeschen" },
      { t: 6.3, art: "du", zeilen: w(s, ["Ich bin in Klasse 9 und lerne", "Parabeln. Gib mir nie die Lösung,", "erkläre und frag nach."], ["Ich bin in der Kursstufe und lerne", "Ableitungen. Gib mir nie die Lösung,", "erkläre und frag nach."]) },
      { t: 8.6, art: "claude", zeilen: ["Alles klar. Womit fangen wir an –", "hast du eine Aufgabe, oder soll ich", "erst abfragen, was du schon weißt?"] },
      { t: 10.8, art: "du", zeilen: ["Erst abfragen bitte."] },
      { t: 12.2, art: "claude", zeilen: w(s, ["Was kannst du an f(x) = (x − 3)² + 1", "direkt ablesen, ohne zu rechnen?"], ["Was misst der Differenzenquotient –", "die Steigung von was, und wo?"]) },
      { t: 14, art: "stempel", gut: true },
      { t: 16.5, art: "merk", zeilen: ["Startprompt zuerst:", "Klasse · Thema · „keine Lösungen“."] },
    ],
    beschreibung: "Animation: Ohne Startprompt liefert {KI} einen langen Lehrbuchtext. Mit Startprompt fragt er zurück und lässt den Schüler denken.",
  }, ki),

  regel: (s, ki) => chatSzene({
    dauer: 26,
    schritte: [
      { von: 0, text: "„Löse mir“ – und in drei Sekunden steht das Ergebnis da. Gelernt hast du nichts." },
      { von: 7, text: "Dieselbe Aufgabe, anders gefragt: {KI} stellt die erste Frage, du findest den Weg." },
      { von: 16, text: "Die Grundform jedes Prompts: Rolle · Aufgabe · Ich will · Du sollst nicht." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Löse mir: Stab 1 m, Schatten 1,5 m.", "Baum: Schatten 9 m. Wie hoch?"], ["Löse mir: Scheitelpunkt von", "f(x) = −2x² + 8x − 3 per Ableitung."]) },
      { t: 2, art: "claude", zeilen: w(s, ["h / 9 = 1 / 1,5 ⇒ h = 6 m."], ["f′(x) = −4x + 8 = 0 ⇒ x = 2,", "f(2) = 5 ⇒ S(2 | 5)."]) },
      { t: 3.6, art: "stempel", gut: false },
      { t: 4.8, art: "du", zeilen: ["Okay … und morgen in der Arbeit?"] },
      { t: 7, art: "loeschen" },
      { t: 7.3, art: "du", zeilen: ["Du bist mein Trainer. Gleiche", "Aufgabe – rechne nichts aus. Stell", "mir die erste Frage, die ich mir", "stellen sollte."] },
      { t: 9.6, art: "claude", zeilen: w(s, ["Was haben Stab und Baum gemeinsam –", "und warum darf man sie vergleichen?"], ["Was ist am Scheitelpunkt besonders,", "wenn du an die Tangente dort denkst?"]) },
      { t: 11.8, art: "du", zeilen: w(s, ["Gleiche Sonne – gleicher Winkel!"], ["Die Tangente ist waagrecht."]) },
      { t: 13.2, art: "claude", zeilen: w(s, ["Genau: ähnliche Dreiecke. Welche", "Seiten gehören zusammen?"], ["Und was heißt das für f′?", "Schreib es als Gleichung auf."]) },
      { t: 14.8, art: "stempel", gut: true },
      { t: 17, art: "merk", zeilen: ["Rolle · Aufgabe · Ich will ·", "Du sollst nicht.", "{KI} erklärt – die Zahlen", "schreibst du."] },
    ],
    beschreibung: "Animation: Auf „Löse mir“ liefert {KI} sofort das Ergebnis. Mit der Trainer-Grundform stellt er Fragen, und der Schüler findet den Weg selbst.",
  }, ki),

  verstehen: (s, ki) => chatSzene({
    dauer: 24,
    schritte: [
      { von: 0, text: "Die Aufgabe hat drei Verben – und jedes verlangt etwas anderes." },
      { von: 6, text: "{KI} übersetzt nur die Fragestellung: Was ist gegeben, was gesucht, was heißt jedes Verb?" },
      { von: 15, text: "Erst wenn du die Aufgabe nachsprechen kannst, fängst du an zu rechnen." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Erklär mir nur die Fragestellung:", "h(x) = −0,1x² + 2x. a) Bestimme die", "maximale Höhe. b) Wo landet der Ball?", "c) Begründe, warum x > 20 sinnlos ist."], ["Erklär mir nur die Fragestellung:", "V(t) = −0,5t³ + 6t². a) Berechne V′(2)", "und deute. b) Wann fließt am meisten", "zu? c) Ab wann nimmt V ab?"]) },
      { t: 3.2, art: "claude", zeilen: w(s, ["Gegeben: eine Parabel, nach unten", "offen – eine Ballhöhe.", "a) „Bestimme“ → eine Zahl in m.", "   Welcher Punkt ist der höchste?", "b) Gesucht: eine Stelle x. Was ist", "   dort mit der Höhe?", "c) „Begründe“ → ein Satz, keine Zahl."], ["Gegeben: V(t) ist die Menge in m³,", "nicht der Zufluss!", "a) „Berechne“ → Zahl. „Deute“ →", "   Satz mit Einheit. Was misst V′?", "b) „am meisten zu“ fragt nach V′,", "   nicht nach V.", "c) Wann wird welche Größe negativ?"]) },
      { t: 8.5, art: "du", zeilen: w(s, ["a) Scheitel. b) Höhe null –", "Nullstelle. c) Höhe wäre negativ."], ["V′ ist der Zufluss in m³/h.", "b) heißt: Maximum von V′."]) },
      { t: 11, art: "claude", zeilen: w(s, ["Alle drei richtig verstanden.", "Womit willst du anfangen?"], ["Das ist die Falle, die viele", "übersehen. Was brauchst du für", "das Maximum von V′?"]) },
      { t: 13, art: "stempel", gut: true },
      { t: 15.5, art: "merk", zeilen: ["Bestimme → Zahl oder Term", "Begründe → Satz", "Deute → Satz mit Einheit"] },
    ],
    beschreibung: "Animation: {KI} erklärt nur, was jede Teilaufgabe verlangt – Zahl, Stelle oder Satz. Der Schüler spricht die Aufgabe nach, bevor er rechnet.",
  }, ki),

  begriffe: (s, ki) => chatSzene({
    dauer: 24,
    schritte: [
      { von: 0, text: "Ein Fachwort auf drei Stufen: Bild, Fachsprache, Beispiel." },
      { von: 9, text: "Dann drehst du es um: Du erklärst zurück – {KI} sagt nur, was fehlt." },
      { von: 17, text: "Der Merksatz ist der Haken fürs Gedächtnis." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Erklär mir „Scheitelform“ auf drei", "Stufen, je höchstens 3 Sätze."], ["Unterschied „mittlere“ und", "„momentane Änderungsrate“?", "Mit Beispiel und Merksatz."]) },
      { t: 2.4, art: "claude", zeilen: w(s, ["1 · Eine Parabel ist ein Hügel oder", "eine Schale; der Scheitel ist der", "höchste/tiefste Punkt.", "2 · f(x) = a(x − d)² + e, S(d | e).", "3 · Beim Wurf: wo der Ball am", "höchsten fliegt, ist der Scheitel."], ["Mittel: Anfang und Ende vergleichen –", "180 km in 2 h = 90 km/h. Sekante.", "Moment: ein Augenblick – der Tacho.", "Tangente, Ableitung.", "Merksatz: Mittel = zwei Punkte,", "Moment = ein Punkt."]) },
      { t: 9, art: "du", zeilen: w(s, ["Zurück: Scheitelform heißt, ich lese", "S ab: (x − 3)² + 1 → S(3 | 1)."], ["Zurück: mittlere = Sekante über", "ein Intervall, momentane = Tangente", "an einer Stelle."]) },
      { t: 11.6, art: "claude", zeilen: w(s, ["Fast. Wofür steht das a? Und gilt", "„Minus dreht sich um“ auch für +1?"], ["Stimmt. Wie kommt man rechnerisch", "von der einen zur anderen?"]) },
      { t: 14, art: "stempel", gut: true },
      { t: 17.5, art: "merk", zeilen: ["Drei Stufen: Bild → Fachsprache", "→ Beispiel. Dann zurückerklären."] },
    ],
    beschreibung: "Animation: {KI} erklärt ein Fachwort auf drei Stufen. Der Schüler erklärt es zurück, {KI} nennt nur die Lücke.",
  }, ki),

  schritte: (s, ki) => chatSzene({
    dauer: 28,
    schritte: [
      { von: 0, text: "Regel: ein Schritt, dann warten. {KI} fragt, du rechnest." },
      { von: 8, text: "{KI} warnt vor der Falle, bevor sie passiert – ausrechnen musst du trotzdem selbst." },
      { von: 18, text: "Am Ende keine Bestätigung, sondern eine Probe, die ohne {KI} funktioniert." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Wir rechnen x² − 5x + 6 = 0. Nur", "der nächste Schritt als Frage.", "Schritt 1?"], ["Differenzenquotient von x² an", "x₀ = 3, als Term in h. Nur der", "nächste Schritt als Frage. Schritt 1?"]) },
      { t: 2.6, art: "claude", zeilen: w(s, ["In welcher Form liegt die Gleichung", "vor – und welche Formel passt?", "Lies p und q ab."], ["Schreib die allgemeine Form des", "Differenzenquotienten mit h auf –", "noch ohne die Funktion."]) },
      { t: 5, art: "du", zeilen: w(s, ["Normalform, pq-Formel.", "p = −5, q = 6."], ["(f(3 + h) − f(3)) / h"]) },
      { t: 7, art: "claude", zeilen: w(s, ["Stimmt. Setz ein, noch nicht", "ausrechnen. Vorsicht beim", "Vorzeichen von −p/2."], ["Stimmt. Setz f ein. Vorsicht beim", "Quadrat einer Summe."]) },
      { t: 9.6, art: "du", zeilen: w(s, ["x = 2,5 ± √(6,25 − 6)"], ["((3 + h)² − 9) / h", "= (9 + 6h + h² − 9) / h"]) },
      { t: 11.6, art: "claude", zeilen: w(s, ["Richtig. Was steht unter der Wurzel,", "und was sagt das über die Anzahl", "der Lösungen?"], ["Sauber. Was kannst du im Zähler", "zusammenfassen – und dann kürzen?"]) },
      { t: 14.2, art: "du", zeilen: w(s, ["0,25 → zwei Lösungen:", "x₁ = 3, x₂ = 2"], ["(6h + h²) / h = 6 + h"]) },
      { t: 16, art: "claude", zeilen: w(s, ["Stimmt. Prüf beide durch Einsetzen –", "deine Probe ohne mich."], ["Stimmt. Was wird aus 6 + h, wenn", "h immer kleiner wird?"]) },
      { t: 18, art: "stempel", gut: true },
      { t: 20.5, art: "merk", zeilen: ["Ein Schritt, dann warten.", "Hinweis statt Schritt, wenn du hängst."] },
    ],
    beschreibung: "Animation: {KI} gibt nur Fragen als nächsten Schritt, der Schüler rechnet jeden Schritt selbst und prüft am Ende mit einer Probe.",
  }, ki),

  pruefen: (s, ki) => chatSzene({
    dauer: 26,
    schritte: [
      { von: 0, text: "Du schickst deinen Weg, nummeriert – und fragst nur nach der Zeile." },
      { von: 5, text: "{KI} nennt die Zeile. Den Fehler findest du – mit dem Einsetz-Trick." },
      { von: 16, text: "Drei Stufen: Zeile → Fehlerart → Fehler. Die dritte brauchst du selten." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Mein Weg:", "1  (x + 3)² = x² + 9", "2  x² + 9 = 25", "3  x² = 16", "4  x = 4", "Nur die Zeile des ersten Fehlers."], ["Mein Weg:", "1  ((2 + h)² − 4) / h", "2  = (4 + h² − 4) / h", "3  = h² / h = h", "Nur die Zeile des ersten Fehlers."]) },
      { t: 4.2, art: "claude", zeilen: w(s, ["Zeile 1."], ["Zeile 2."]) },
      { t: 6, art: "du", zeilen: w(s, ["Hm, (x + 3)² ist doch x² + 3²?"], ["(2 + h)² = 4 + h² … was ist da falsch?"]) },
      { t: 8, art: "claude", zeilen: w(s, ["Probier x = 1: Was ergibt (1 + 3)²,", "und was ergibt 1² + 9?"], ["Setz h = 1 ein: Was ist (2 + 1)²,", "und was ist 4 + 1²?"]) },
      { t: 10.4, art: "du", zeilen: w(s, ["16 und 10 – nicht gleich!", "(x + 3)² = x² + 6x + 9."], ["9 und 5. Also 4 + 4h + h²,", "und dann (4h + h²) / h = 4 + h."]) },
      { t: 13, art: "claude", zeilen: w(s, ["Genau, der Mittelterm 2 · 3 · x.", "Und Zeile 4: Wie viele Lösungen", "hat x² = 16?"], ["Stimmt. Was sagt 4 + h für kleine", "h über die Steigung bei x = 2?"]) },
      { t: 15, art: "stempel", gut: true },
      { t: 17.5, art: "merk", zeilen: ["Erst die Zeile. Dann die Art.", "Zuletzt der Fehler."] },
    ],
    beschreibung: "Animation: Der Schüler schickt einen nummerierten Rechenweg, {KI} nennt nur die Zeile, der Fehler wird mit dem Einsetz-Trick selbst gefunden.",
  }, ki),

  fehler: (s, ki) => chatSzene({
    dauer: 24,
    schritte: [
      { von: 0, text: "Ein korrigierter Fehler kommt wieder. Ein verstandener nicht." },
      { von: 4, text: "{KI} benennt den Denkfehler, gibt ein Gegenbeispiel – rechnen tust du." },
      { von: 15, text: "Der Name des Denkfehlers wandert auf deine Fehlerliste." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Ich dachte: +20 % und −20 % heben", "sich auf. Welcher Denkfehler?", "Gegenbeispiel und Faustregel."], ["Tim: 4x² → f′ = 8. Lea: 3x² → 6x².", "Welcher Denkfehler steckt dahinter?", "Gegenbeispiel und Faustregel."]) },
      { t: 3.4, art: "claude", zeilen: w(s, ["Denkfehler: Prozente wie feste", "Beträge behandelt. 20 % sind immer", "20 % vom aktuellen Wert.", "Gegenbeispiel: Starte mit 100 €.", "Plus 20 %? Dann minus 20 % davon?"], ["Tim: behandelt x² wie eine Zahl,", "das x fehlt. Steigung bei x = 0", "ist 0 – kann sie überall 8 sein?", "Lea: Exponent nach vorn, aber nicht", "gesenkt. Was ist (x²)′ wirklich?"]) },
      { t: 8.5, art: "du", zeilen: w(s, ["120 €, dann 24 weniger: 96 €.", "Weniger als vorher!"], ["(x²)′ = 2x. Fehlerliste:", "„x vergessen“, „Exponent nicht", "gesenkt“."]) },
      { t: 11, art: "claude", zeilen: w(s, ["Faustregel: nacheinander heißt", "multiplizieren: 1,2 · 0,8 = 0,96."], ["Gute Namen. Teste dich: (5x³)′ –", "welcher Fehler lauert hier?"]) },
      { t: 13, art: "stempel", gut: true },
      { t: 15.5, art: "merk", zeilen: ["Denkfehler benennen.", "Fehlerliste: Name · Faustregel ·", "Gegenbeispiel."] },
    ],
    beschreibung: "Animation: Statt nur zu korrigieren, benennt {KI} den Denkfehler und gibt ein Gegenbeispiel. Der Schüler rechnet es nach und notiert den Namen in seiner Fehlerliste.",
  }, ki),

  text: (s, ki) => chatSzene({
    dauer: 26,
    schritte: [
      { von: 0, text: "Eine Textaufgabe ist eine verschlüsselte Gleichung. {KI} fragt, du übersetzt." },
      { von: 8, text: "Satz für Satz: Was ist unbekannt? Was sagt jeder Satz? Welche Formel verbindet alles?" },
      { von: 18, text: "Am Ende steht die Gleichung – aus deiner Hand. Dann: Einheit prüfen." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Übersetzen ohne die Gleichung zu", "schreiben: Verleih 5 € Grundgebühr,", "3 € je Stunde. Mia hat 23 €.", "Wie lange kann sie fahren?"], ["Übersetzen ohne Formeln: Ballon", "h(t) = −t² + 12t. a) Mittel in den", "ersten 4 min. b) Momentan bei t = 4.", "c) Wann ist die Geschwindigkeit 0?"]) },
      { t: 3.4, art: "claude", zeilen: w(s, ["Welche Größe verändert sich,", "und welche hängt davon ab?"], ["a) Welche zwei Zeitpunkte vergleichst", "du – und wie heißt die Größe dafür?"]) },
      { t: 5.6, art: "du", zeilen: w(s, ["Stunden x; der Preis hängt davon ab."], ["t = 0 und t = 4:", "(h(4) − h(0)) / 4."]) },
      { t: 7.8, art: "claude", zeilen: w(s, ["„5 € Grundgebühr“ – einmal oder pro", "Stunde? Und was macht 3 € je Stunde,", "wenn x wächst?"], ["b) „momentan bei t = 4“ – welche", "Größe ist das, welcher Term?"]) },
      { t: 10.6, art: "du", zeilen: w(s, ["Einmal. 3 € pro Stunde: 3 · x.", "p(x) = 3x + 5, und 3x + 5 = 23."], ["h′(4): Differenzenquotient,", "Schrittweite nenne ich Δt."]) },
      { t: 13.4, art: "claude", zeilen: w(s, ["Richtig übersetzt. Einheit: Kommt", "bei Mia Euro oder Stunden heraus?"], ["Gut gelöst mit Δt. Und c): eine", "Bedingung an h oder an h′?"]) },
      { t: 15.4, art: "stempel", gut: true },
      { t: 18.5, art: "merk", zeilen: ["Unbekannte? Information je Satz?", "Formel? Dann: Einheit prüfen."] },
    ],
    beschreibung: "Animation: {KI} stellt Fragen zu jedem Satz der Textaufgabe, der Schüler übersetzt sie selbst in eine Gleichung.",
  }, ki),

  ueben: (s, ki) => chatSzene({
    dauer: 22,
    schritte: [
      { von: 0, text: "Aufgaben bestellen: Thema, Stufe, Typ – und keine Lösungen." },
      { von: 7, text: "{KI} urteilt nur: richtig oder nochmal. Mehr nicht." },
      { von: 14, text: "Das Welche-Regel-Spiel trainiert den Blick, der in der Klausur zählt." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["5 Aufgaben: Normalform → Scheitel-", "form, mittel, keine Lösungen."], ["4 Terme mit sin und x². Ich sage", "nur, welche Regel passt."]) },
      { t: 2.6, art: "claude", zeilen: w(s, ["1  x² − 6x + 5", "2  x² + 4x + 1", "3  2x² − 8x + 3", "… Schick mir deine Ergebnisse."], ["a) x² · sin x   b) sin(x²)", "c) sin x / x²   d) 3 sin x + x²"]) },
      { t: 6, art: "du", zeilen: w(s, ["1  (x − 3)² − 4", "2  (x + 2)² − 3", "3  2(x − 2)² − 5"], ["a) Produkt  b) Kette", "c) Quotient  d) Summe + Faktor"]) },
      { t: 8.6, art: "claude", zeilen: w(s, ["1 richtig · 2 richtig · 3 richtig.", "Abfrage ohne Hilfsmittel: Woran", "siehst du an der Normalform, ob", "der Scheitel unter der x-Achse liegt?"], ["Alle vier richtig. Bei b): Was ist", "innen, was außen? Nächste Runde:", "e^(2x) · x, e^(x²), x / e^x …"]) },
      { t: 12, art: "stempel", gut: true },
      { t: 14.5, art: "merk", zeilen: ["Bestellen: Thema · Stufe · Typ ·", "keine Lösungen. Urteil: richtig /", "nochmal."] },
    ],
    beschreibung: "Animation: Der Schüler bestellt Übungsaufgaben ohne Lösungen, {KI} bewertet nur mit richtig oder nochmal und stellt Abfragen.",
  }, ki),

  system: (s, ki) => chatSzene({
    dauer: 24,
    schritte: [
      { von: 0, text: "Wer etwas erklären kann, kann es. Du erklärst, {KI} hört zu." },
      { von: 7, text: "Rechnung richtig – und trotzdem eine Lücke in der Erklärung. Genau die kostet Punkte." },
      { von: 16, text: "{KI} ist dein Trainer. Der Schiedsrichter bist du: Jedes Ergebnis prüfst du selbst." },
    ],
    ereignisse: [
      { t: 0.5, art: "du", zeilen: w(s, ["Ich erkläre: Leiter 5 m, 1,5 m von", "der Wand. Leiter, Wand, Boden bilden", "ein Dreieck. 5² = 1,5² + h²,", "h² = 22,75, h ≈ 4,77 m.", "Nenn am Ende nur die Lücke."], ["Ich erkläre die Tangente an x³ bei 1:", "m = f′(1) = 3. Punkt einsetzen:", "1 = 3 · 1 + b ⇒ b = −2.", "Tangente y = 3x − 2.", "Nenn am Ende nur die Lücke."]) },
      { t: 4.4, art: "claude", zeilen: w(s, ["Rechnung stimmt. Lücke: Warum ist", "gerade die Leiter die Hypotenuse?"], ["Rechnung stimmt. Lücke: Woher", "kommt das y = 1 – welcher Punkt?"]) },
      { t: 7.2, art: "du", zeilen: w(s, ["Rechter Winkel zwischen Wand und", "Boden – die Hypotenuse liegt", "gegenüber: die Leiter."], ["Der Berührpunkt P(x₀ | f(x₀)),", "hier f(1) = 1."]) },
      { t: 10, art: "claude", zeilen: w(s, ["Jetzt ist die Erklärung vollständig.", "Der Satz gehört auf den Spickzettel."], ["Vollständig. Tangente = Punkt +", "Steigung, beide aus f und f′."]) },
      { t: 12.2, art: "stempel", gut: true },
      { t: 15, art: "merk", zeilen: ["Erklären statt lernen.", "Jedes Ergebnis selbst prüfen –", "{KI} kann sich verrechnen."] },
    ],
    beschreibung: "Animation: Der Schüler erklärt ein Verfahren, {KI} nennt nur die Lücke in der Erklärung. Zum Schluss die Regel: Ergebnisse immer selbst prüfen.",
  }, ki),
};

export const FILM_IDS = Object.keys(FILME);

/* Karte mit Titel und Player – stufe: "mittel" (ab 16) | "ober" (ab 18), ki: Name der KI */
export function ClaudeKursFilm({ id, stufe = "ober", ki = "Claude", titel }) {
  const bau = FILME[id];
  if (!bau) return null;
  return (
    <div data-claudekurs-film={id} style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", padding: "14px 16px 18px" }}>
      <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", color: "#8A6A00", margin: "0 0 2px" }}>KURZ ERKLÄRT · {ki.toUpperCase()}</p>
      {titel && <p style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, margin: "0 0 10px", lineHeight: 1.3 }}>{titel}</p>}
      <Player key={`${id}-${stufe}-${ki}`} szene={bau(stufe, ki)} />
    </div>
  );
}
