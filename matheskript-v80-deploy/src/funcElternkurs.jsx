import React, { useState, useEffect } from "react";
import { C } from "./base1.jsx";

/* ======================================================================
   ELTERNKURS — sieben Module für Eltern: sechs der meistgesehenen
   TED-Talks und eine deutsche Zusammenfassung von Carol Dwecks Buch
   „Selbstbild“ (Modul 3).
   Die Seite zeigt erst die sieben Module als Buttons, ein Klick öffnet
   das Modul (Video + Infotext); mit Zurück/Weiter kann man durchklicken.
   Alle Video-IDs sind per YouTube-oEmbed geprüft (einbettbar).
   ====================================================================== */

export const ELTERNKURS = [
  { id: "sinek", art: "ted", nr: 1, thema: "Das Warum entdecken", sprecher: "Simon Sinek", titel: "How great leaders inspire action (Start with Why)", video: "qp0HIF3SfI4",
    text: [
      "Aus diesem Video kannst du lernen, warum so viele Kinder Mathe nur unter äußerem Druck lernen – und warum das auf Dauer nicht trägt.",
      "Simon Sinek zeigt sehr klar, dass echte Motivation nicht beim „Was“ (Mathe-Aufgaben) oder „Wie“ (Lernmethoden) beginnt, sondern beim „Warum“. Du siehst, wie große Organisationen und Persönlichkeiten genau diesen Hebel nutzen, und kannst das direkt auf die Situation deines Kindes übertragen.",
      "Du nimmst mit, wie wichtig es ist, gemeinsam mit deinem Kind nach einem persönlichen Sinn hinter dem Mathe-Lernen zu suchen – statt nur auf Noten, Abitur oder „Du musst das eben machen“ zu setzen. Das Video macht verständlich, warum ein starkes Warum die Bereitschaft verändert, auch schwierige Phasen durchzuhalten.",
    ] },
  { id: "robinson", art: "ted", nr: 2, thema: "Kreativität im Mathe-Lernen schützen", sprecher: "Sir Ken Robinson", titel: "Do schools kill creativity?", video: "iG9CE55wbtY",
    text: [
      "Aus diesem Video kannst du lernen, wie sehr das klassische Schulsystem die natürliche Kreativität und Neugier von Kindern untergräbt – und was das konkret für das Fach Mathematik bedeutet.",
      "Sir Ken Robinson erklärt auf unterhaltsame und zugleich ernste Weise, warum Kinder mit der Zeit aufhören, Risiken einzugehen und eigene Wege zu denken. Du erkennst, wie schnell aus neugierigen Fragestellern vorsichtige „Ich will ja nichts Falsches sagen“-Kinder werden.",
      "Besonders wertvoll ist der Blick darauf, dass Intelligenz vielfältig ist und Fehler eigentlich zum Lernen dazugehören. Das Video gibt dir eine klare Haltung: Mathe muss nicht nur aus Formeln und der einen richtigen Antwort bestehen. Es darf auch Raum für Ausprobieren, Umwege und eigene Denkwege geben – und genau das kannst du als Elternteil bewusst unterstützen.",
    ] },
  { id: "dweck", art: "buch", nr: 3, thema: "Das eigene Selbstbild verändern", sprecher: "Carol Dweck", titel: "Selbstbild: Wie unser Denken Erfolge oder Niederlagen bewirkt", video: "0g8uD-MY6V4",
    text: [
      "Aus diesem Video kannst du lernen, warum nicht die Begabung allein entscheidet, ob ein Kind in Mathe vorankommt, sondern die Überzeugung, ob sich Fähigkeiten entwickeln lassen.",
      "Carol Dweck unterscheidet in ihrem Buch „Selbstbild“ zwei Denkweisen. Wer glaubt, Talent sei festgelegt, will vor allem klug dastehen, meidet Fehler und gibt schnell auf, wenn es schwierig wird. Wer glaubt, dass man durch Übung besser wird, sucht Herausforderungen und nutzt Fehler als Lernchance. Du erkennst, woher Sätze wie „Ich bin eben nicht der Mathe-Typ“ kommen.",
      "Du nimmst mit, wie du dein Kind im Alltag unterstützen kannst: Lob für Anstrengung und gute Strategien stärkt Kinder mehr als Lob für „Du bist so schlau“. So wird aus Mathe keine Frage von Talent, sondern von Entwicklung.",
    ] },
  { id: "urban", art: "ted", nr: 4, thema: "Den Prokrastinations-Affen zähmen", sprecher: "Tim Urban", titel: "Inside the mind of a master procrastinator", video: "arj7oStGLkU",
    text: [
      "Aus diesem Video kannst du lernen, was im Kopf deines Kindes wirklich passiert, wenn es Mathe-Hausaufgaben oder die Klausurvorbereitung immer wieder aufschiebt.",
      "Tim Urban macht mit viel Humor und Treffsicherheit sichtbar, dass Prokrastination selten reine Faulheit ist. Du lernst die inneren Figuren kennen – den Instant-Gratification-Monkey, der sofortige Ablenkung sucht, und den Panic-Monster, der erst kurz vor der Deadline auftaucht.",
      "Das Video hilft dir, das Verhalten deines Kindes nicht mehr persönlich zu nehmen oder als mangelnden Willen zu interpretieren. Stattdessen bekommst du ein klares Bild davon, warum gute Vorsätze so oft scheitern und warum reine Willenskraft-Appelle meist wenig bringen. Dieses Verständnis allein verändert schon den Umgang mit Aufschieberitis spürbar.",
    ] },
  { id: "cuddy", art: "ted", nr: 5, thema: "Selbstvertrauen & Präsenz aufbauen", sprecher: "Amy Cuddy", titel: "Your body language may shape who you are", video: "Ks-_Mh1QhMc",
    text: [
      "Aus diesem Video kannst du lernen, wie stark Körperhaltung und innere Verfassung zusammenhängen – und warum das für Mathe-Klausuren und Prüfungssituationen so relevant ist.",
      "Amy Cuddy zeigt, dass wir nicht nur durch unsere Haltung auf andere wirken, sondern dass die Haltung auch verändert, wie wir uns selbst fühlen. Du siehst, warum viele Jugendliche in stressigen Momenten unbewusst in eine „kleine“ Haltung gehen und dadurch noch unsicherer werden.",
      "Das Video macht deutlich, dass Selbstvertrauen nicht nur eine Charaktereigenschaft ist, sondern etwas, das man über den Körper beeinflussen kann. Du nimmst die Erkenntnis mit, dass schon kleine Veränderungen in der Haltung vor einer Klausur oder einem schwierigen Gespräch einen spürbaren Unterschied machen können – für das Gefühl deines Kindes und für seine Leistungsfähigkeit.",
    ] },
  { id: "brown", art: "ted", nr: 6, thema: "Verletzlichkeit als Stärke", sprecher: "Brené Brown", titel: "The power of vulnerability", video: "iCvmsMzlF7o",
    text: [
      "Aus diesem Video kannst du lernen, warum so viele Kinder (und auch wir Erwachsenen) Schwierigkeiten und Unsicherheiten lieber verstecken – und was das langfristig kostet.",
      "Brené Brown erklärt auf sehr menschliche Weise, dass Verletzlichkeit nicht Schwäche ist, sondern die Voraussetzung für Mut, Verbindung und echtes Lernen. Du erkennst, wie Scham und die Angst vor Bewertung dazu führen, dass Kinder aufhören, Fragen zu stellen oder zuzugeben, dass sie etwas nicht verstehen.",
      "Das Video gibt dir eine klare Einladung: Eine Atmosphäre, in der Unsicherheit erlaubt ist, macht Kinder nicht weicher, sondern mutiger. Du siehst, warum es so wertvoll ist, wenn dein Kind „Ich verstehe das nicht“ oder „Ich habe Angst“ sagen darf – und wie sehr das die Bereitschaft verändert, sich anzustrengen und Hilfe anzunehmen.",
    ] },
  { id: "treasure", art: "ted", nr: 7, thema: "Klar und wirksam kommunizieren", sprecher: "Julian Treasure", titel: "How to speak so that people want to listen", video: "eIho2S0ZahI",
    text: [
      "Aus diesem Video kannst du lernen, warum viele Gespräche über Mathe (und Schule insgesamt) nicht wirklich ankommen – und was du als Elternteil anders machen kannst.",
      "Julian Treasure zeigt sehr konkret, welche Sprechgewohnheiten dazu führen, dass Menschen abschalten, und welche Elemente eine Stimme und eine Botschaft hörenswert machen. Du bekommst ein klares Bild davon, wie stark Ton, Haltung und die Art zu sprechen darüber entscheiden, ob dein Kind dich wirklich hört.",
      "Besonders wertvoll ist der Hinweis auf Authentizität und den bewussten Einsatz von Stimme und Pausen. Das Video sensibilisiert dich dafür, dass gute Kommunikation keine Selbstverständlichkeit ist, sondern eine Fähigkeit, die man verbessern kann – und die gerade in den oft angespannten Mathe-Gesprächen den entscheidenden Unterschied macht.",
    ] },
];

const SCHATTEN = "0 2px 16px rgba(15,26,51,0.07)";
const kicker = (k) => `${k.art === "ted" ? "TED-Talk" : "Buchzusammenfassung"} · ${k.sprecher}`;

function Modul({ k }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>{kicker(k)}</p>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 18 }}>{k.thema}</h2>

      <div style={{ borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 3px 18px rgba(15,26,51,0.1)" }}>
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
          <iframe key={k.video} src={`https://www.youtube-nocookie.com/embed/${k.video}?rel=0&modestbranding=1&playsinline=1`}
            title={`${k.titel} – ${k.sprecher}`} loading="lazy" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
        </div>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 300, color: C.grau, margin: "8px 2px 0" }}>{k.sprecher} – {k.titel}</p>

      <div style={{ marginTop: 22 }}>
        {k.text.map((t, i) => (
          <p key={i} style={{ color: i === 0 ? C.tinte : C.grau, fontSize: 15, fontWeight: i === 0 ? 500 : 300, lineHeight: 1.8, marginBottom: i < k.text.length - 1 ? 16 : 0 }}>{t}</p>
        ))}
      </div>
    </div>
  );
}

export function ElternkursSeite() {
  const [offen, setOffen] = useState(null); // Index des geöffneten Moduls oder null = Übersicht
  useEffect(() => { window.scrollTo(0, 0); }, [offen]);

  const knopf = (aktiv) => ({
    fontFamily: "inherit", cursor: "pointer", fontSize: 14.5, fontWeight: 600, padding: "13px 18px", borderRadius: 12,
    border: aktiv ? "none" : `1.5px solid ${C.linie}`, background: aktiv ? C.see : C.weiss, color: aktiv ? C.weiss : C.tinte,
  });

  if (offen === null) {
    return (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>Sieben Module für Eltern</h2>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 22 }}>
          Sechs der meistgesehenen TED-Talks und eine Zusammenfassung des Buchs „Selbstbild“ – jeweils mit einem Text, was du daraus mitnimmst. Du kannst die Module der Reihe nach durchklicken.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {ELTERNKURS.map((k, i) => (
            <button key={k.id} onClick={() => setOffen(i)} aria-label={`Modul ${k.nr}: ${k.thema}`}
              style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", width: "100%", fontFamily: "inherit", cursor: "pointer",
                background: C.weiss, border: "none", borderRadius: 16, padding: "16px 18px", boxShadow: SCHATTEN }}>
              <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss, fontSize: 16, fontWeight: 700 }}>{k.nr}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.gruenDunkel, marginBottom: 2 }}>{kicker(k)}</span>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{k.thema}</span>
              </span>
              <svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M1.5 1.5 L7.5 7.5 L1.5 13.5" fill="none" stroke={C.see} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const k = ELTERNKURS[offen];
  const zurueck = offen > 0 ? offen - 1 : null;
  const weiter = offen < ELTERNKURS.length - 1 ? offen + 1 : null;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 26 }}>
      <button onClick={() => setOffen(null)}
        style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, marginBottom: 18, fontSize: 13.5, fontWeight: 600, color: C.see }}>
        ← Alle Module
      </button>

      <div role="tablist" aria-label="Module" style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        {ELTERNKURS.map((x, i) => (
          <button key={x.id} role="tab" aria-selected={i === offen} aria-label={`Modul ${x.nr}`} onClick={() => setOffen(i)}
            style={{ flex: 1, height: 36, borderRadius: 10, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
              border: i === offen ? "none" : `1.5px solid ${C.linie}`, background: i === offen ? C.see : C.weiss, color: i === offen ? C.weiss : C.grau }}>{x.nr}</button>
        ))}
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 300, color: C.grau, marginBottom: 22 }}>Modul {k.nr} von {ELTERNKURS.length}</p>

      <Modul k={k} />

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        {zurueck !== null ? (
          <button onClick={() => setOffen(zurueck)} style={{ ...knopf(false), flex: 1 }}>← Zurück</button>
        ) : <span style={{ flex: 1 }} />}
        {weiter !== null ? (
          <button onClick={() => setOffen(weiter)} style={{ ...knopf(true), flex: 1 }}>Weiter →</button>
        ) : (
          <button onClick={() => setOffen(null)} style={{ ...knopf(true), flex: 1 }}>Zur Übersicht</button>
        )}
      </div>
    </div>
  );
}
