import React, { useState, useEffect } from "react";
import { C } from "./base1.jsx";

/* ======================================================================
   NACHHILFE-KURS — sechs Module für Nachhilfelehrernen (ENTWURF zur Durchsicht durch Basti).
   Aufbau je Modul: Kernidee · So gehst du vor · Typischer Fehler · Probier es in der nächsten Stunde · Mit Mythos Mathe.
   Reiner Text, keine Videos (keine ungeprüften Links). Fortschritt („erledigt“) nur lokal im Browser.
   ====================================================================== */

export const NACHHILFEKURS = [
  { id: "diagnose", nr: 1, thema: "Die erste Stunde: Diagnose statt Stoff",
    kern: "Bevor du erklärst, musst du wissen, warum es hakt. Die meisten Mathe-Probleme sind keine Probleme des aktuellen Themas, sondern Lücken darunter: Bruchrechnen, Termumformung, Vorzeichen. Wer sofort den Stoff der nächsten Klassenarbeit durchgeht, dichtet Lücken nur zu.",
    schritte: [
      "Erst reden, dann rechnen: Was läuft gut, was nervt, was soll am Ende der Nachhilfe anders sein? Lass das Ziel in der Sprache des Schülers formulieren („Ich will keine Angst mehr vor Klausuren haben“ statt „Note verbessern“).",
      "Notenverlauf anschauen: Wann ist die Note gekippt? Ein Einbruch in einer bestimmten Klassenstufe zeigt oft das Thema, an dem es angefangen hat.",
      "Mini-Diagnose mit fünf bis acht Aufgaben aus verschiedenen Stufen (Brüche, Gleichungen, Prozent, Potenzen, Funktionen). Der Schüler denkt laut. Du schreibst mit, wo er stockt und warum – nicht nur, ob das Ergebnis stimmt.",
      "Unterscheide drei Fehlerarten: Flüchtigkeit (weiß es, schaut nicht hin), Verfahrenslücke (kennt den Schritt nicht), Verständnislücke (wendet Regeln ohne Idee an). Jede braucht andere Hilfe.",
      "Am Ende der Stunde: zwei bis drei konkrete Schwerpunkte und ein Plan für die nächsten Wochen – gemeinsam besprochen, nicht verkündet.",
    ],
    fehler: "Zu früh mit dem Erklären anfangen und den Schüler damit schon in der ersten Stunde als „Problemfall“ abstempeln.",
    aufgabe: "Schreibe drei Diagnoseaufgaben auf, die du für jede Klassenstufe 5–10 immer wieder nutzen könntest, und lege fest, was jede davon über den Schüler verrät.",
    tool: "Lege in deinem Konto eine Gruppe an und gib den Beitrittscode weiter. Sobald der Schüler beitritt, siehst du seine Lernaktivität und seinen Notenverlauf – ein guter Gesprächseinstieg." },

  { id: "erklaeren", nr: 2, thema: "Erklären, das hängen bleibt",
    kern: "Verstehen entsteht nicht durch Zuhören, sondern durch Denken. Gute Nachhilfe erklärt wenig und lässt viel selbst entdecken: erst ein Beispiel, dann ein Muster, dann die Regel.",
    schritte: [
      "Konkret – bildlich – formal: Starte mit einem greifbaren Fall (Zahlen, Skizze, Alltagsbild), leite daraus das Muster ab und schreibe erst am Schluss die allgemeine Formel auf.",
      "Beispiele vor Regeln: Lass den Schüler drei bis vier Beispiele rechnen und fragen: „Was fällt dir auf?“ Wer die Regel selbst formuliert, behält sie deutlich länger.",
      "Gib Zeit: Nach einer Frage mindestens zehn Sekunden Stille. Die meisten Tutor:innen sind hier zu ungeduldig und beantworten ihre eigene Frage.",
      "Rollen tauschen: Der Schüler erklärt dir das Verfahren, als wärst du ein Mitschüler, der gefehlt hat. Wo er stockt, liegt die Lücke.",
      "Nicht mehr vormachen als nötig: Lieber ein Tipp („Was passiert, wenn du beide Seiten durch 3 teilst?“) als die ganze Lösung.",
    ],
    fehler: "Sauber vorrechnen, der Schüler nickt, versteht „alles“ – und kann es am nächsten Tag nicht. Nicken ist kein Verstehen.",
    aufgabe: "Wähle ein Thema, das du gerne erklärst, und plane es als Entdeckung: Welche vier Beispiele würdest du geben, und welche Frage führt zur Regel?",
    tool: "Schau dir „Mathe entdecken“ in der App an: Das Potenzregel-Modul führt in sieben Phasen vom Beispiel zur Regel und zeigt, wie so eine Entdeckung aufgebaut sein kann." },

  { id: "ueben", nr: 3, thema: "Üben, das wirkt",
    kern: "Üben ist nicht „mehr Aufgaben“. Es wirkt, wenn es verteilt, gemischt und mit Rückmeldung geschieht. Eine Stunde pro Woche reicht nicht, wenn dazwischen nichts passiert – darum gehört die Zeit zwischen den Stunden zur Nachhilfe.",
    schritte: [
      "Verteilt statt geballt: Kurze Einheiten (15–20 Minuten) an mehreren Tagen schlagen eine lange Einheit vor der Klausur. Wiederholungen in wachsenden Abständen (nach 1, 3, 7, 14 Tagen) halten Wissen im Kopf.",
      "Gemischt statt blockweise: Wenn alle Aufgaben vom selben Typ sind, muss der Schüler nie entscheiden, welches Verfahren passt. Mische Typen, sobald die Grundlagen sitzen.",
      "Fehler auswerten: Lass den Schüler jeden Fehler einer Fehlerart zuordnen (Flüchtigkeit, Verfahren, Verständnis) und eine Korrektur formulieren. Ein Fehler, der verstanden ist, ist ein Gewinn.",
      "Die richtige Schwierigkeit: Aufgaben, die in etwa 70–80 % der Fälle gelingen, sind ideal – schwer genug zum Lernen, leicht genug zum Dranbleiben.",
      "Hausaufgaben klein halten: lieber fünf Aufgaben, die wirklich gemacht werden, als zwanzig, die liegen bleiben.",
    ],
    fehler: "Große Hausaufgabenpakete, die der Schüler nicht schafft – danach folgt Schuldgefühl statt Lernen.",
    aufgabe: "Entwirf für einen Schüler einen Wochenplan mit drei Mini-Einheiten à 15 Minuten, jeweils mit einer alten Aufgabe zur Wiederholung.",
    tool: "Der Wiederholungsplan in der App legt Wiederholungen automatisch nach Ebbinghaus-Abständen. Schüler, die in deiner Gruppe sind, lernen damit zwischen den Stunden – du siehst an der Ampel, wer dranbleibt." },

  { id: "fehler-mindset", nr: 4, thema: "Fehler und Selbstbild",
    kern: "„Ich bin eben nicht der Mathe-Typ“ ist keine Tatsache, sondern eine Überzeugung – und sie lässt sich verändern. Wie du über Fehler und Anstrengung sprichst, prägt, was der Schüler über sich glaubt.",
    schritte: [
      "Lob auf Strategie und Anstrengung statt auf „Begabung“: „Du hast die Aufgabe in kleine Schritte zerlegt – das hat funktioniert“ statt „Du bist so schlau“.",
      "Das Wörtchen „noch“: „Das kann ich noch nicht“ macht aus einem Urteil einen Zwischenstand.",
      "Fehler sichtbar und wertvoll machen: Ein falscher Ansatz ist eine Information über das Denken des Schülers. Frage neugierig: „Wie bist du darauf gekommen?“",
      "Fortschritt zeigen: Hefte alte Aufgaben ab und zeige nach vier Wochen, was heute schon klappt. Wer Fortschritt sieht, hört auf, sich für „zu dumm“ zu halten.",
      "Eigene Fehler zeigen: Wenn du dich verrechnest, sag es laut und korrigiere ohne Drama.",
    ],
    fehler: "Trösten mit „Mathe liegt vielen nicht“. Das klingt freundlich, bestätigt aber die Idee, dass es eine Frage des Talents ist.",
    aufgabe: "Schreibe drei Sätze auf, die du Schülern sagst, wenn sie einen Fehler machen, und überprüfe, ob sie Neugier oder Bewertung ausdrücken.",
    tool: "Der Mathe-Mindset-Kurs für Eltern (in der Navigation) erklärt dieselben Ideen anhand von TED-Talks und Carol Dwecks „Selbstbild“ – ideal, um sie mit Eltern zu teilen." },

  { id: "motivation", nr: 5, thema: "Motivation und Klausurangst",
    kern: "Ohne Motivation hilft die beste Methode nichts. Meist ist fehlende Motivation Selbstschutz: Wer sich nicht anstrengt, kann nicht „dumm“ sein. Angst vor Klausuren ist verbreitet und gut trainierbar.",
    schritte: [
      "Das Warum klären: Lass den Schüler selbst sagen, wofür er Mathe braucht oder was er erreichen will. Von außen aufgesetzte Gründe („für das Abitur“) tragen kaum.",
      "Kleine Siege einplanen: Beende jede Stunde mit einer Aufgabe, die gelingt. Das Gefühl „Ich kann das“ ist der Treibstoff.",
      "Prüfungssituation üben: Klausur unter Zeit, danach ohne Bewertung nur Auswertung. Wer die Situation kennt, verliert Angst.",
      "Struktur für den Prüfungstag: Aufgaben zuerst überfliegen, mit der sichersten beginnen, Zeit pro Aufgabe festlegen, am Ende kurz kontrollieren.",
      "Ruhe vor dem Start: Ein paar tiefe, langsame Atemzüge und eine aufrechte Haltung helfen vielen. Nimm starke Angst oder Blockaden ernst und empfiehl in solchen Fällen, mit den Eltern oder der Schule Rat zu suchen.",
    ],
    fehler: "Zu viel Druck aufbauen („Das ist die wichtigste Arbeit des Jahres“) – das verstärkt die Angst.",
    aufgabe: "Plane eine Probeklausur von 45 Minuten für einen deiner Schüler und lege fest, wie du die Auswertung gestaltest.",
    tool: "Im Bereich „Prüfung“ der App findest du Klausurgenerator und Probeabitur mit Uhr – so kann der Schüler Prüfungssituationen auch allein üben." },

  { id: "eltern-orga", nr: 6, thema: "Zusammenarbeit mit Eltern und Organisation",
    kern: "Eltern bezahlen und wollen wissen, ob es hilft. Wer Erwartungen früh klärt und regelmäßig kurz berichtet, hat entspannte Eltern – und bekommt Rückhalt, wenn es einmal schwierig wird.",
    schritte: [
      "Erwartungen klären: Was kann Nachhilfe leisten, was nicht? Verspreche keine Noten, sondern Schritte: Lücken schließen, Methoden lernen, Sicherheit gewinnen.",
      "Kurzer, regelmäßiger Bericht: zwei bis drei Sätze pro Woche – Thema, Fortschritt, nächstes Ziel. Nicht erst, wenn es brennt.",
      "Verbindlichkeit: feste Termine, klare Absageregeln, Hausaufgaben als Teil der Vereinbarung – und das vorher besprochen, nicht im Streitfall.",
      "Der Schüler bleibt Hauptperson: Sprich mit dem Schüler, nicht über ihn. Gib Eltern Einblick, aber nutze die Rückmeldung nicht als Druckmittel gegen das Kind.",
      "Datensparsam arbeiten: Notiere nur, was du zum Unterrichten brauchst, und gib Daten der Schüler nicht ohne Wissen der Eltern weiter.",
    ],
    fehler: "Nur dann mit den Eltern sprechen, wenn etwas schiefgeht.",
    aufgabe: "Formuliere einen Musterbericht von drei Sätzen für Eltern nach einer Nachhilfestunde.",
    tool: "Mit deinem Gruppencode verbindet sich der Schüler; Eltern verbinden sich über den Einladungslink ihres Kindes und sehen eine Wochenübersicht. So seid ihr alle auf demselben Stand. Hinweis: Die Datenschutz-Texte zur Nutzung mit Schüler und Eltern werden noch ergänzt." },
];

const SCHLUESSEL = "mm-nachhilfekurs";
const SCHATTEN = "0 2px 16px rgba(15,26,51,0.07)";
const lesen = () => { try { return JSON.parse(localStorage.getItem(SCHLUESSEL)) || {}; } catch (e) { return {}; } };
const sichern = (d) => { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(d)); } catch (e) { /* privat */ } };

const Block = ({ titel, children, ton }) => (
  <div style={{ background: ton || C.weiss, borderRadius: 16, boxShadow: ton ? "none" : SCHATTEN, padding: "16px 18px", marginBottom: 14 }}>
    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 8 }}>{titel}</p>
    {children}
  </div>
);

function Modul({ k, erledigt, umschalten }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>Modul {k.nr}</p>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 16 }}>{k.thema}</h2>
      <Block titel="KERNIDEE"><p style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.75 }}>{k.kern}</p></Block>
      <Block titel="SO GEHST DU VOR">
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {k.schritte.map((s, i) => <li key={i} style={{ fontSize: 15, color: C.grau, fontWeight: 300, lineHeight: 1.75, marginBottom: i < k.schritte.length - 1 ? 10 : 0 }}>{s}</li>)}
        </ol>
      </Block>
      <Block titel="TYPISCHER FEHLER" ton="#FDF3F3"><p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>{k.fehler}</p></Block>
      <Block titel="PROBIER ES IN DER NÄCHSTEN STUNDE" ton={C.himmel}><p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>{k.aufgabe}</p></Block>
      <Block titel="MIT MYTHOS MATHE"><p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.7 }}>{k.tool}</p></Block>
      <button type="button" onClick={umschalten} aria-pressed={erledigt}
        style={{ width: "100%", height: 48, borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 15, fontWeight: 700,
          border: erledigt ? `1.5px solid ${C.smaragd}` : "none", background: erledigt ? "#E9F7EF" : C.see, color: erledigt ? C.smaragd : C.weiss }}>
        {erledigt ? "✓ Als erledigt markiert" : "Modul als erledigt markieren"}
      </button>
    </div>
  );
}

export function NachhilfekursSeite() {
  const [offen, setOffen] = useState(null);
  const [fertig, setFertig] = useState(lesen);
  useEffect(() => { window.scrollTo(0, 0); }, [offen]);
  const umschalten = (id) => setFertig((f) => { const n = { ...f, [id]: !f[id] }; sichern(n); return n; });
  const anzahl = NACHHILFEKURS.filter((k) => fertig[k.id]).length;
  const knopf = (aktiv) => ({ fontFamily: "inherit", cursor: "pointer", fontSize: 14.5, fontWeight: 600, padding: "13px 18px", borderRadius: 12,
    border: aktiv ? "none" : `1.5px solid ${C.linie}`, background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.tinte });

  if (offen === null) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>Sechs Module für Nachhilfelehrernen</h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 8 }}>
          Von der ersten Diagnose bis zur Zusammenarbeit mit den Eltern – kompakt und praxisnah. Jedes Modul endet mit einer kleinen Aufgabe für deine nächste Stunde.
        </p>
        <p style={{ fontSize: 13, color: C.hellgrau, marginBottom: 20 }}>{anzahl} von {NACHHILFEKURS.length} Modulen erledigt</p>
        <div style={{ display: "grid", gap: 12 }}>
          {NACHHILFEKURS.map((k, i) => (
            <button key={k.id} onClick={() => setOffen(i)} aria-label={`Modul ${k.nr}: ${k.thema}${fertig[k.id] ? " (erledigt)" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", width: "100%", fontFamily: "inherit", cursor: "pointer",
                background: C.weiss, border: "none", borderRadius: 16, padding: "16px 18px", boxShadow: SCHATTEN }}>
              <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                background: fertig[k.id] ? C.smaragd : `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss, fontSize: 16, fontWeight: 700 }}>{fertig[k.id] ? "✓" : k.nr}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{k.thema}</span>
              <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M1.5 1.5 L7.5 7.5 L1.5 13.5" fill="none" stroke={C.see} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const k = NACHHILFEKURS[offen];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 26 }}>
      <button onClick={() => setOffen(null)} style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, marginBottom: 18, fontSize: 13.5, fontWeight: 600, color: C.see }}>← Alle Module</button>
      <Modul k={k} erledigt={!!fertig[k.id]} umschalten={() => umschalten(k.id)} />
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        {offen > 0 ? <button onClick={() => setOffen(offen - 1)} style={{ ...knopf(false), flex: 1 }}>← Zurück</button> : <span style={{ flex: 1 }} />}
        {offen < NACHHILFEKURS.length - 1
          ? <button onClick={() => setOffen(offen + 1)} style={{ ...knopf(true), flex: 1 }}>Weiter →</button>
          : <button onClick={() => setOffen(null)} style={{ ...knopf(true), flex: 1 }}>Zur Übersicht</button>}
      </div>
    </div>
  );
}
