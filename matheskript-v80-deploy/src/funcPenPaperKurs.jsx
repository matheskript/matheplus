import React, { useRef, useState, useSyncExternalStore } from "react";
import { C } from "./base1.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { springe } from "./sprung.js";
import { LEKTION_IDS, TAG_IDS, lektionFertig, lektionSetzen, lektionenFertig, naechsteLektion, penpaperHoeren, penpaperStand, penpaperZuruecksetzen, tagAn, tagSetzen, tageFertig, zuletztSetzen } from "./penpaperSpeicher.js";
import { usePenpaperSyncStatus } from "./penpaperSync.js";
import { Blatt, GOLD, GOLDHELL, HWurzel, Haken, Kasten, LABEL, NAVY, Nebenbox, ResteFinder, T, Term, Tok, UebungRahmen, Wahl, ZaunMarkierer, Zeile, karte, useUebung } from "./funcPenPaperUebungen.jsx";

/* ======================================================================
   PEN-&-PAPER-KURS (Ansicht „penpaperkurs“)
   Ein Kurs, neun Lektionen, ein Prinzip: Nähe = Priorität.
   Aufbau der Seite
     1. Kernthese, das Grundmodell (Super-Operator · Gartenzäune · Häuser), dein Stand
     2. Neun Lektionen in fünf Stufen (Sehen → Abschreiben → Umschreiben → Selbst rechnen → Automatisieren),
        jede mit Erklärung, Beispiel richtig/falsch, Übung in der App und Aufgabe aufs Blatt
     3. Mathildas tägliches Blatt-Training (Foto → ein Hebel → Neuschrieb), 7-Tage-Plan
   Fortschritt: penpaperSpeicher.js (Gerät) + penpaperSync.js (Konto).
   Die Inhalte entsprechen dem Arbeitsheft „Pen & Paper“ (Matheskript Band 2).
   ====================================================================== */

const Kicker = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>{children}</p>;
const H2 = ({ children }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12, color: C.tinte }}>{children}</h2>;
const H3 = ({ children, style }) => <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: "18px 0 8px", lineHeight: 1.3, ...style }}>{children}</h3>;
const Absatz = ({ children, style }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 14, ...style }}>{children}</p>;
const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "34px 0 28px" }} />;
const Et = ({ children, farbe }) => <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: farbe || C.see, marginBottom: 6 }}>{children}</p>;

function useStand() {
  return useSyncExternalStore(penpaperHoeren, () => penpaperStand()._zeit, () => 0);
}

/* ---------------------------------------------------------------- Richtig / falsch */

function Paar({ falsch, richtig, falschText, richtigText, falschTitel = "So nicht", richtigTitel = "So" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8, margin: "12px 0" }}>
      <div style={{ borderRadius: 12, border: `1px solid ${C.linie}`, padding: "10px 12px", background: "#fff" }}>
        <Et farbe={C.signal}>{falschTitel}</Et>
        <div style={{ overflowX: "auto", paddingBottom: 2 }}>{falsch}</div>
        {falschText && <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5, marginTop: 6 }}>{falschText}</p>}
      </div>
      <div style={{ borderRadius: 12, border: "1px solid #F0D77A", padding: "10px 12px", background: GOLDHELL }}>
        <Et farbe={C.gruenDunkel}>{richtigTitel}</Et>
        <div style={{ overflowX: "auto", paddingBottom: 2 }}>{richtig}</div>
        {richtigText && <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5, marginTop: 6 }}>{richtigText}</p>}
      </div>
    </div>
  );
}
const Strich = ({ children }) => (
  <span style={{ position: "relative", display: "inline-block", fontSize: 17, color: C.tinte, fontWeight: 500 }}>
    {children}<span aria-hidden="true" style={{ position: "absolute", left: "-2%", right: "-2%", top: "52%", height: 2, background: C.signal, transform: "rotate(-6deg)" }} />
  </span>
);
const Nr = ({ n }) => <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: C.see, color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{n}</span>;
function Regeln({ liste }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8, marginBottom: 12 }}>
      {liste.map(([t, s], i) => (
        <div key={t} style={{ borderRadius: 12, border: `1px solid ${C.linie}`, padding: "10px 12px", display: "flex", gap: 10 }}>
          <Nr n={i + 1} /><span><b style={{ fontSize: 14, color: NAVY }}>{t}</b><span style={{ display: "block", fontSize: 13, color: C.grau, lineHeight: 1.5 }}>{s}</span></span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Karo / Blanko */

function KaroBlanko({ frage }) {
  const [karo, setKaro] = useState(true);
  return (
    <div style={{ ...karte, padding: 14 }}>
      <div role="group" aria-label="Papier" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#EEF3FA", borderRadius: 12, padding: 4, marginBottom: 12 }}>
        {[["Auf Karo", true], ["Auf Blanko", false]].map(([n, k]) => (
          <button key={n} type="button" aria-pressed={karo === k} onClick={() => setKaro(k)}
            style={{ padding: "9px 4px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, background: karo === k ? NAVY : "transparent", color: karo === k ? GOLD : C.grau }}>{n}</button>
        ))}
      </div>
      {karo ? (
        <Blatt karo minHoehe={150}>
          <Zeile>x²−4x+4=0</Zeile>
          <Zeile>(x−2)²=0</Zeile>
          <Zeile>x−2=0  x=2</Zeile>
          <Zeile>f'(x)=2x−4=0→x=2</Zeile>
        </Blatt>
      ) : (
        <Blatt minHoehe={150} style={{ paddingTop: 50 }}>
          <Nebenbox>(x − 2)² = x² − 4x + 4 ✓</Nebenbox>
          <Zeile>x² − 4x + 4 = 0</Zeile>
          <Zeile einr>(x − 2)² = 0</Zeile>
          <Zeile einr>x − 2 = 0</Zeile>
          <Zeile einr><Kasten>x = 2</Kasten></Zeile>
        </Blatt>
      )}
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, marginTop: 10 }}>
        {karo ? "Jedes Zeichen sucht sich ein Kästchen. Zäune und Häuser sehen gleich aus, zwei Schritte stehen in einer Zeile, die Schrift kippt." : "Dieselbe Rechnung: Luft an den Zäunen, ein Schritt pro Zeile, Nebenrechnung rechts in der Box, Ergebnis im Kasten."}
      </p>
      {frage && <p style={{ fontSize: 14.5, fontWeight: 700, color: NAVY, marginTop: 8 }}>{frage}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- Grundmodell */

function Grundmodell() {
  const [zeige, setZeige] = useState("alles");
  const teile = T("f(x) | = | ax^2 | + | bx | + | c");
  const legende = [
    ["super", "=", "Super-Operator", "Das Gleichheitszeichen steht über allem. Links und rechts davon steht dasselbe, nur anders geschrieben.", C.see, "#fff"],
    ["zaun", "+ −", "Gartenzäune", "Die Final Operatoren: jedes Plus und Minus auf der obersten Ebene. Sie trennen die Grundstücke.", GOLD, NAVY],
    ["haus", "ax²", "Häuser", "Die Terme zwischen den Zäunen. Im Haus wird zuerst gerechnet – dort steht alles eng.", GOLDHELL, NAVY],
  ];
  return (
    <div style={{ ...karte, padding: "20px 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 14px", overflowX: "auto" }}>
        <Term teile={teile} modus="markiert" groesse={27} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
        {legende.map(([id, z, n, t, bg, fg]) => (
          <button key={id} type="button" aria-pressed={zeige === id} onClick={() => setZeige(zeige === id ? "alles" : id)}
            style={{ textAlign: "left", padding: "10px 9px", borderRadius: 12, border: `1.5px solid ${zeige === id ? NAVY : C.linie}`, background: zeige === id ? "#F3F6FB" : "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 30, height: 26, padding: "0 6px", borderRadius: 7, background: bg, color: fg, fontWeight: 800, fontSize: 14, border: id === "haus" ? "1.4px dashed #C7A200" : "none" }}>{z}</span>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: NAVY, marginTop: 6, lineHeight: 1.2 }}>{n}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, marginTop: 12, minHeight: 44 }}>
        {zeige === "alles" ? <>Drei Ebenen, eine Zeile. Tippe eine Ebene an. Wer die Struktur <b>sieht</b>, muss „Punkt vor Strich“ nicht mehr wissen.</> : legende.find((l) => l[0] === zeige)[3]}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Bausteine der Lektionen */

const STUFEN = [
  ["Sehen", "Struktur erkennen, noch nichts rechnen"],
  ["Abschreiben", "fertige Zeilen sauber neu schreiben"],
  ["Umschreiben", "schlechte Blätter in Pen & Paper bringen"],
  ["Selbst rechnen", "eigene Aufgabe, Foto, ein Hebel"],
  ["Automatisieren", "täglich 15 Minuten, bis es von selbst geht"],
];

function AufsBlatt({ children }) {
  return (
    <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "#F3F6FB", border: "1px solid #C7D4EA" }}>
      <Et>Aufs Blatt · 5 Minuten</Et>
      <div style={{ fontSize: 14, color: C.tinte, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Abstandsleiter() {
  const z = [
    ["0 · Zeile", "Das Gleichheitszeichen", T("a | = | b"), "am meisten Luft"],
    ["1 · Zäune", "Plus und Minus auf der obersten Ebene", T("ax^2 | + | bx"), "deutlich"],
    ["2 · Garten", "Plus und Minus in Klammer, Wurzel, Bruch, Exponent", T("sin(x | (+) | 1)"), "wenig"],
    ["3 · Haus", "Faktoren, Hochzahlen, Vorzahlen", T("2ax^2"), "kein Abstand"],
  ];
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.linie}`, overflow: "hidden", margin: "12px 0" }}>
      {z.map(([e, w, t, a], i) => (
        <div key={e} style={{ display: "grid", gridTemplateColumns: "68px minmax(0,1fr) auto", gap: 8, alignItems: "center", padding: "8px 10px", borderBottom: i < 3 ? `1px solid ${C.linie}` : "none", background: i % 2 ? "#F7F9FD" : "#fff" }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.see }}>{e}</span>
          <span style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>{w}</span>
          <span style={{ textAlign: "right" }}><Term teile={t} modus="schoen" groesse={17} /><span style={{ display: "block", fontSize: 10.5, color: LABEL, fontWeight: 600 }}>{a}</span></span>
        </div>
      ))}
    </div>
  );
}

/* Beispiellösung mit sechs antippbaren Markierungen */
function GanzeLoesung() {
  const [m, setM] = useState(null);
  const marken = [
    ["A", "Aufgabe benannt", "Jeder Teil beginnt mit einem Wort: Nullstellen, Scheitel. So weißt du morgen noch, was du wolltest."],
    ["B", "Zäune mit Luft, Häuser eng", "x² − 2x − 3: drei Blöcke, zwei Zäune. Die Hochzahl sitzt am x."],
    ["C", "Ein Schritt pro Zeile", "Gleichheitszeichen untereinander. Die p-q-Formel wird nicht im Kopf gemacht."],
    ["D", "Nebenrechnung rechts", "1 + 3 = 4 und die Wurzel aus 4 stören den Hauptweg nicht."],
    ["E", "Nichts bleibt stehen", "Aus 1 ± Wurzel aus 4 wird 1 ± 2, dann 3 und −1."],
    ["F", "Ergebnisse im Kasten", "Vollständig und eindeutig. S(1 | −4) mit senkrechtem Strich."],
  ];
  const Pin = ({ k }) => (
    <button type="button" onClick={() => setM(m === k ? null : k)} aria-pressed={m === k} aria-label={`Markierung ${marken[k][0]}: ${marken[k][1]}`}
      style={{ fontFamily: "Montserrat, system-ui, sans-serif", width: 20, height: 20, borderRadius: 999, border: "none", cursor: "pointer", fontSize: 10.5, fontWeight: 800, verticalAlign: "middle", marginRight: 6, padding: 0,
        background: m === k ? GOLD : NAVY, color: m === k ? NAVY : "#fff", boxShadow: m === k ? "0 0 0 3px rgba(237,187,0,0.35)" : "none" }}>{marken[k][0]}</button>
  );
  return (
    <div style={{ ...karte, padding: 14 }}>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55, marginBottom: 10 }}>Aufgabe: Bestimme Nullstellen und Scheitelpunkt von <Term teile={T("f(x) | = | x^2 | − | 2x | − | 3")} modus="schoen" groesse={15} />. Tippe die Markierungen an.</p>
      <Blatt minHoehe={0} groesse={19} style={{ paddingTop: 12, display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 220px", minWidth: 0, overflowX: "auto" }}>
          <Zeile><Pin k={0} />Nullstellen: f(x) = 0</Zeile>
          <Zeile einr><Pin k={1} />x² − 2x − 3 = 0</Zeile>
          <Zeile einr><Pin k={2} />x₁,₂ = 1 ± <HWurzel text="1 + 3" /></Zeile>
          <Zeile einr style={{ paddingLeft: 92 }}><Pin k={4} />= 1 ± 2</Zeile>
          <Zeile einr><Pin k={5} /><Kasten>x₁ = 3</Kasten>&nbsp;&nbsp;<Kasten>x₂ = −1</Kasten></Zeile>
          <Zeile style={{ marginTop: 8 }}><Pin k={0} />Scheitel:</Zeile>
          <Zeile einr><Pin k={1} />f(x) = (x − 1)² − 1 − 3</Zeile>
          <Zeile einr style={{ paddingLeft: 70 }}><Pin k={4} />= (x − 1)² − 4</Zeile>
          <Zeile einr><Pin k={5} /><Kasten>S(1 | −4)</Kasten></Zeile>
        </div>
        <Nebenbox fest><Pin k={3} />1 + 3 = 4<br /><HWurzel text="4" /> = 2</Nebenbox>
      </Blatt>
      <div aria-live="polite" style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: m === null ? "#F3F6FB" : GOLDHELL, minHeight: 58 }}>
        {m === null ? <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55 }}>Sechs Markierungen, sechs Regeln. Tippe eine an.</p>
          : <><p style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>{marken[m][0]} · {marken[m][1]}</p><p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.55 }}>{marken[m][2]}</p></>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Inhalt der neun Lektionen */

const Z = (s, g = 17) => <Term teile={T(s)} modus="schoen" groesse={g} />;
const Zn = (s) => <Term teile={T(s)} modus="neutral" groesse={16} nowrap />;
const mark = (teile, k) => teile.map((b, i) => (i === k ? { ...b, mark: true } : b));
const MathildaKnopf = ({ gehe, hell, children }) => (
  <button type="button" onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })}
    style={{ marginTop: 12, width: "100%", padding: "13px 16px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700,
      border: hell ? `1.5px solid ${NAVY}` : "none", background: hell ? "#fff" : NAVY, color: hell ? NAVY : GOLD, boxShadow: hell ? "none" : "0 6px 18px rgba(11,30,74,0.22)" }}>
    {children}
  </button>
);

function Lektion1() {
  const geloest = useUebung("gesetze");
  return (
    <>
      <Absatz>Dein Kopf kann nur wenige Dinge gleichzeitig festhalten. Bei einer Rechnung sind es schnell zu viele: die Aufgabe, der Plan, das Zwischenergebnis, das Vorzeichen. Das Blatt ist der Ort, an den du alles auslagerst, was dein Kopf nicht gleichzeitig tragen muss – aber nur, wenn du es <b>sofort wieder lesen</b> kannst.</Absatz>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, marginBottom: 14 }}>
        {[["Gesetz 1", "Dein Blatt muss dein Denken entlasten – nicht zusätzlich belasten."], ["Gesetz 2", "Jeder wichtige Schritt muss für dein späteres Ich rekonstruierbar sein."]].map(([t, s]) => (
          <div key={t} style={{ background: NAVY, color: "#fff", borderRadius: 14, padding: "12px 14px" }}>
            <Et farbe={GOLD}>{t}</Et><p style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>{s}</p>
          </div>
        ))}
      </div>
      <H3>Dieselbe Rechnung, zweimal</H3>
      <KaroBlanko />
      <UebungRahmen nr={1} titel="Die zwei Gesetze" geloest={geloest}>
        <Wahl id="gesetze" items={[
          { frage: "Woran erkennst du, dass ein Blatt Gesetz 2 erfüllt?", optionen: ["Das Ergebnis ist richtig", "Du kannst morgen jeden Schritt nachvollziehen, ohne dich zu erinnern", "Die Lösung passt auf eine halbe Seite"], richtig: 1,
            erklaerung: "Rekonstruierbar heißt: Dein späteres Ich kann jeden Schritt lesen, ohne dass du daneben stehst.", falsch: "Ein richtiges Ergebnis zeigt noch nicht, ob der Weg lesbar ist." },
          { frage: "Was gehört aufs Blatt?", optionen: ["Nur das Ergebnis", "Jeder Schritt, den dein Kopf sonst festhalten müsste", "Jede Kleinigkeit, auch 2 · 3 in einer eigenen Zeile"], richtig: 1,
            erklaerung: "Das Blatt trägt, was der Kopf nicht gleichzeitig tragen kann. 2 · 3 darf im Kopf passieren – das Zwischenergebnis nicht.", falsch: "Zu wenig belastet den Kopf, zu viel belastet das Blatt. Was liegt dazwischen?" },
          { frage: "Ein Blatt ist voll, aber nicht mehr lesbar. Welches Gesetz ist verletzt?", optionen: ["Gesetz 1 – das Blatt belastet, statt zu entlasten", "Keines – Hauptsache, es steht alles da", "Gesetz 2 ist erfüllt, weil nichts fehlt"], richtig: 0,
            erklaerung: "Ein unlesbares Blatt verlangt vom Kopf, alles noch einmal zu entschlüsseln. Es belastet.", falsch: "Lies die beiden Gesetze noch einmal: Vollständig ist nicht dasselbe wie lesbar." },
        ]} />
      </UebungRahmen>
      <AufsBlatt>Nimm eine Lösung von dir, die mindestens eine Woche alt ist. Decke die Aufgabe ab und lies nur deine Rechnung. Kannst du sagen, was die Aufgabe war, jeden Schritt erklären und das Ergebnis finden? Schreib in einem Satz auf, was du nicht mehr lesen konntest.</AufsBlatt>
    </>
  );
}

function Lektion2() {
  const geloest = useUebung("zaeune");
  return (
    <>
      <Absatz>Jede Zeile auf deinem Blatt hat eine Struktur: Das Gleichheitszeichen ist der <b>Super-Operator</b>. Plus und Minus auf der obersten Ebene sind <b>Gartenzäune</b> (Final Operatoren). Dazwischen stehen die <b>Häuser</b> (Terme). Im Haus wird zuerst gerechnet, am Zaun zuletzt.</Absatz>
      <div style={{ padding: 14, background: GOLDHELL, borderRadius: 14, border: "1px solid #F0D77A", marginBottom: 12 }}>
        <Et farbe={C.gruenDunkel}>Das Prinzip</Et>
        <p style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 6 }}>Nähe = Priorität</p>
        <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65 }}>Was näher beieinandersteht, wird früher verrechnet. Im Haus {Z("ax^2", 16)} gilt: zuerst das x², dann mal a. Erst danach kommt der Zaun. Darum steht im Haus alles eng, und um den Zaun herum ist Luft. Dein Abstand <b>zeigt</b> die Rechenreihenfolge.</p>
      </div>
      <H3>Wann ist ein Plus kein Zaun?</H3>
      <Absatz>Ein Zaun steht <b>außerhalb</b> jeder Klammer, jedes Bruchs, jeder Wurzel und jedes Exponenten. Das Plus in {Z("sin(x | (+) | 1)")} gehört ins Haus – ein Zaun im Garten, nicht an der Straße. {Z("2x(x | (+) | 1) | + | 5")} hat also <b>zwei</b> Häuser und <b>einen</b> Zaun.</Absatz>
      <UebungRahmen nr={2} titel="Sehen, bevor du rechnest" geloest={geloest}>
        <ZaunMarkierer id="zaeune" aufgabe="Tippe alle Gartenzäune an – jedes Plus und Minus auf der obersten Ebene. Dann prüfen." items={[
          { teile: T("3x^2 | − | 5x | + | 2"), hinweis: "Drei Häuser, zwei Zäune. Die Zahl der Zäune ist immer um eins kleiner als die Zahl der Häuser.", fehler: "Zähle die Häuser: 3x², 5x und 2. Dazwischen stehen die Zäune." },
          { teile: T("2ab | + | c"), hinweis: "2ab ist ein Haus, auch wenn drei Faktoren drinstehen.", fehler: "Faktoren trennen keine Häuser. Nur Plus und Minus auf der obersten Ebene." },
          { teile: T("4 | − | 3y | + | y^2"), hinweis: "Auch eine Zahl allein ist ein Haus.", fehler: "Die 4 am Anfang ist ein eigenes Haus. Welche Zeichen trennen die drei Häuser?" },
          { teile: T("2x(x | (+) | 1) | + | 5"), hinweis: "Das Plus in der Klammer bleibt im Haus. Nur das Plus vor der 5 ist ein Zaun.", fehler: "Ein Plus in einer Klammer ist kein Zaun – es steht im Garten." },
          { teile: T("(x | (−) | 2)^2 | + | 4x"), hinweis: "Zwei Häuser: (x − 2)² und 4x. Das Minus in der Klammer gehört zum ersten Haus.", fehler: "Was steht außerhalb der Klammer? Nur das ist ein Zaun." },
          { teile: T("x | − | (x | (+) | 3)(x | (−) | 1)"), hinweis: "Das Produkt der beiden Klammern ist ein einziges Haus. Nur das erste Minus ist ein Zaun.", fehler: "Zwei Klammern, die multipliziert werden, sind zusammen ein Haus." },
          { teile: T("{x+1}/{2} | − | 3x"), hinweis: "Der Bruch ist ein Haus mit zwei Stockwerken; das Plus im Zähler ist kein Zaun.", fehler: "Der Bruch ist ein Haus. Welches Zeichen steht außerhalb?" },
        ]} />
      </UebungRahmen>
      <AufsBlatt>Schreib fünf Terme aus deinem Mathebuch ab. Kreise jedes Haus ein und zeichne an jeden Zaun einen senkrechten Strich. Noch nichts rechnen.</AufsBlatt>
    </>
  );
}

function Lektion3() {
  const geloest = useUebung("zaun-garten");
  const ZG = ["Gartenzaun", "Im Garten"];
  const frage = (s, k, zusatz) => <span style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}><Term teile={mark(T(s), k)} modus="neutral" groesse={22} />{zusatz && <span style={{ fontSize: 13.5, color: C.grau }}>{zusatz}</span>}</span>;
  return (
    <>
      <Absatz>Der Abstand um ein Rechenzeichen hängt davon ab, wie tief es in der Zeile steckt: je weiter innen, desto enger. Je kürzer der Term, desto enger.</Absatz>
      <Abstandsleiter />
      <Paar falschTitel="Alles gleich weit" richtigTitel="Außen weit, innen eng"
        falsch={<Strich><Tok s="y = 2 sin ( x + 1 ) − 3" /></Strich>} falschText="Man sieht nicht, dass x + 1 zusammen in den Sinus geht."
        richtig={Z("y | = | 2sin(x | (+) | 1) | − | 3")} richtigText="Zwei Häuser, ein Zaun. Das Plus im Sinus bleibt im Garten." />
      <Paar falschTitel="Alles gleich eng" richtigTitel="Jedes Haus als Block"
        falsch={<Strich><Tok s="x^2−4x+4=0" /></Strich>} falschText="Drei Häuser kleben aneinander. Fehler beim Ausklammern sind vorprogrammiert."
        richtig={Z("x^2 | − | 4x | + | 4 | = | 0")} richtigText="Man sieht sofort: Hier steckt (x − 2)² drin." />
      <UebungRahmen nr={3} titel="Zaun oder Garten?" geloest={geloest}>
        <Wahl id="zaun-garten" spalten={2} aufgabe="Das markierte Zeichen: Gartenzaun (Final Operator) oder im Garten (innen)?" items={[
          { frage: frage("3x | + | 7", 1), optionen: ZG, richtig: 0, erklaerung: "Oberste Ebene, außerhalb von allem – ein Zaun.", falsch: "Steht das Plus in einer Klammer, einem Bruch, einer Wurzel oder einem Exponenten?" },
          { frage: frage("(x | (+) | 2)^2", 1), optionen: ZG, richtig: 1, erklaerung: "In der Klammer: im Garten. Die ganze Klammer hoch zwei ist ein Haus.", falsch: "Schau auf die Klammer." },
          { frage: frage("e^x | + | e^{−x}", 1), optionen: ZG, richtig: 0, erklaerung: "Zwei Häuser e^x und e^−x, dazwischen der Zaun.", falsch: "Das Plus steht zwischen zwei Potenzen, nicht in einem Exponenten." },
          { frage: frage("{1}/{x+1} | − | 2", 0, "– das Plus im Nenner"), optionen: ZG, richtig: 1, erklaerung: "Unter dem Bruchstrich: im Garten. Der Zaun in dieser Zeile ist das Minus.", falsch: "Der Bruch ist ein Haus mit zwei Stockwerken." },
          { frage: frage("2x | + | (x | (−) | 1)", 1), optionen: ZG, richtig: 0, erklaerung: "Das Plus steht außerhalb der Klammer – ein Zaun. Das Minus in der Klammer ist im Garten.", falsch: "Welches Zeichen steht außerhalb der Klammer?" },
          { frage: frage("x^2 | − | 2x | + | 1", 1), optionen: ZG, richtig: 0, erklaerung: "Zaun. Die Zeile hat drei Häuser und zwei Zäune.", falsch: "Oberste Ebene?" },
          { frage: frage("sin(x | (+) | 1)", 1), optionen: ZG, richtig: 1, erklaerung: "Im Garten: Das Plus gehört zum Sinus-Haus und wird eng geschrieben.", falsch: "Was steht um das Plus herum?" },
          { frage: frage("{x+1}/{2} | + | 3", 1), optionen: ZG, richtig: 0, erklaerung: "Das Plus zwischen Bruch und 3 ist ein Zaun. Das Plus im Zähler wäre im Garten.", falsch: "Markiert ist das Plus zwischen Bruch und 3 – nicht das im Zähler." },
        ]} />
      </UebungRahmen>
      <AufsBlatt>Schreib ab, mit Luft nur an den Zäunen: &nbsp;{Z("4x^3 | − | 2x^2 | + | x | − | 7")}&nbsp;&nbsp;&nbsp; {Z("2cos(2x | (−) | 1) | + | x^2")}&nbsp;&nbsp;&nbsp; {Z("√(x + 3) | − | e^{x+1}")}</AufsBlatt>
    </>
  );
}

function Lektion4() {
  const geloest = useUebung("malzeichen");
  return (
    <>
      <Absatz>Ein Haus ist ein Block. Alles darin gehört zusammen und wird zuerst verrechnet. Dein Schreiben muss das zeigen: eng, aufrecht, lesbar.</Absatz>
      <Regeln liste={[["Eng", "2ax statt 2 · a · x. Faktoren stehen ohne Lücke."], ["Druckbuchstaben", "Keine Schreibschrift, nicht schräg. Getrennt, aber nah."], ["Hochzahl am Buchstaben", "Klein, oben, direkt am x – nicht in der Luft."], ["Malzeichen nur gegen Missverständnisse", "a · sin x, 2 · 3. Nie zwischen Buchstaben."]]} />
      <div style={{ borderRadius: 12, border: `1px solid ${C.linie}`, overflow: "hidden" }}>
        {[["2 · a · x", "2ax", "Drei Malzeichen zerreißen das Haus in drei Teile."], ["x 2 + 1", "x^2 + 1", "Eine Hochzahl in der Luft liest man als eigene Zahl."], ["asinx", "a · sin x", "Ohne Malzeichen sieht es aus wie ein Wort."], ["23", "2 · 3", "Zahl mal Zahl braucht den Punkt – und wird in der nächsten Zeile zu 6."], ["1x + 0", "x", "1 · x ist x, + 0 ist nichts. Solche Reste bleiben nie stehen."]].map(([f, r, w], i) => (
          <div key={f} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr", gap: 8, alignItems: "center", padding: "8px 10px", borderBottom: i < 4 ? `1px solid ${C.linie}` : "none", fontSize: 17, color: C.tinte }}>
            <Strich><Tok s={f} /></Strich><span style={{ fontWeight: 600 }}><Tok s={r} /></span><span style={{ fontSize: 12, color: C.grau, lineHeight: 1.45 }}>{w}</span>
          </div>
        ))}
      </div>
      <UebungRahmen nr={4} titel="Malzeichen – ja oder nein?" geloest={geloest}>
        <Wahl id="malzeichen" spalten={3} aufgabe="Wie gehört das Produkt ins Haus? Den Punkt nur, wo er nötig ist." items={[
          { frage: "3 mal a mal b", optionen: [Zn("3 · a · b"), Zn("3ab"), Zn("3 a b")], richtig: 1, erklaerung: "Zwischen Buchstaben kein Punkt, keine Lücke: ein Block.", falsch: "Zwischen Buchstaben braucht es weder Punkt noch Lücke." },
          { frage: "x mal cos x", optionen: [Zn("xcos x"), Zn("x · cos x"), Zn("x cos x")], richtig: 1, erklaerung: "Vor einer Funktion hebt der Punkt das Produkt hervor – sonst liest man ein Wort.", falsch: "„xcos“ sieht aus wie ein Wort. Was hilft dagegen?" },
          { frage: "5 mal 7", optionen: [Zn("57"), Zn("5 · 7"), Zn("5  7")], richtig: 1, erklaerung: "Zahl mal Zahl braucht den Punkt – und in der nächsten Zeile steht 35.", falsch: "Ohne Punkt wird aus 5 mal 7 die Zahl 57." },
          { frage: "a mal e hoch x", optionen: [Zn("ae^x"), Zn("a · e^x"), Zn("a  e^x")], richtig: 1, erklaerung: "„ae“ liest sich wie ein Wort. Der Punkt macht das Produkt sichtbar.", falsch: "Sieht das Ergebnis wie ein Wort aus?" },
          { frage: "4 mal x mal x", optionen: [Zn("4xx"), Zn("4 · x · x"), Zn("4x^2")], richtig: 2, erklaerung: "x mal x ist x². Nichts bleibt unvereinfacht – auch im Haus.", falsch: "Lässt sich das noch kürzer schreiben?" },
          { frage: "2 mal (x − 1)", optionen: [Zn("2 · (x | (−) | 1)"), Zn("2(x | (−) | 1)"), Zn("2 (x | (−) | 1)")], richtig: 1, erklaerung: "Zahl vor Klammer: eng, ohne Punkt. Die Klammer macht das Produkt schon eindeutig.", falsch: "Braucht die Klammer wirklich einen Punkt davor?" },
        ]} />
      </UebungRahmen>
      <AufsBlatt>Schreib ab – Druckbuchstaben, Hochzahl am x, Luft nur an den Zäunen: &nbsp;{Z("f(x) | = | 3ax^2 | − | 2bx | + | c")}&nbsp;&nbsp;&nbsp; {Z("g(x) | = | x · e^{2x} | + | 4")}&nbsp;&nbsp;&nbsp; {Z("h(t) | = | 5t^3 | − | t · sin t")}</AufsBlatt>
    </>
  );
}

function Lektion5() {
  const geloest = useUebung("brueche");
  return (
    <>
      <Absatz>Ein Bruch ist ein Haus mit zwei Stockwerken. Sein Hauptbruchstrich liegt auf der Höhe der Zäune: in einer Linie mit dem Minus, dem Querstrich des Plus und der Mitte des Gleichheitszeichens.</Absatz>
      <div style={{ ...karte, padding: "18px 14px 12px", position: "relative", textAlign: "center", marginBottom: 12 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div aria-hidden="true" style={{ position: "absolute", left: -14, right: -14, top: "50%", borderTop: `1.2px dashed ${C.signal}` }} />
          <Term teile={T("y | = | {x+1}/{2} | − | {3}/{x^2} | + | 4")} modus="schoen" groesse={24} nowrap />
        </div>
        <p style={{ fontSize: 12.5, color: C.grau, marginTop: 10 }}>Die gestrichelte Linie ist die Zaunhöhe. Gleichheitszeichen, beide Bruchstriche, Minus und Plus liegen darauf.</p>
      </div>
      <Absatz>Im Zähler und im Nenner gelten dieselben Regeln – mit kleineren Abständen. Das Plus in {Z("{x+1}/{2}")} über dem Strich ist ein Plus im Garten. Deshalb liest sich {Z("{x+1}/{2}")} ganz anders als {Z("x | + | {1}/{2}")}. <b>Der Bruchstrich ist deine Klammer.</b></Absatz>
      <Paar falschTitel="Schrägstrich in der Zeile" richtigTitel="Gestapelt, Strich auf Zaunhöhe"
        falsch={<Strich><Tok s="m = 9−1/4−2 = 4" /></Strich>} falschText="Was gehört zum Bruch? Wörtlich gelesen ergäbe das 9 − 0,25 − 2 = 6,75."
        richtig={Z("m | = | {9−1}/{4−2} | = | {8}/{2} | = | 4")} richtigText="Oben und unten sind eindeutig. Und die Zeile rechnet sich bis zur 4 durch." />
      <UebungRahmen nr={5} titel="Lies den Bruch" geloest={geloest}>
        <Wahl id="brueche" spalten={3} aufgabe="Setze x = 3 ein. Welchen Wert hat der Ausdruck – so, wie er dasteht?" items={[
          { frage: Z("{x+1}/{2}", 24), optionen: ["2", "3,5", "4"], richtig: 0, erklaerung: "Der Bruchstrich klammert: (3 + 1) : 2 = 2.", falsch: "Der Strich liegt unter dem ganzen x + 1." },
          { frage: Z("x | + | {1}/{2}", 24), optionen: ["2", "3,5", "4"], richtig: 1, erklaerung: "Jetzt ist nur die 1 über dem Strich: 3 + 0,5 = 3,5.", falsch: "Was steht über dem Bruchstrich – nur die 1 oder x + 1?" },
          { frage: Z("{9−1}/{4−2}", 24), optionen: ["4", "6,75", "2"], richtig: 0, erklaerung: "Oben 8, unten 2 – der Bruch klammert beides: 4.", falsch: "Rechne zuerst Zähler und Nenner getrennt aus." },
          { frage: <span style={{ fontSize: 22, fontWeight: 500 }}><Tok s="9 − 1/4 − 2" /></span>, optionen: ["4", "6,75", "2"], richtig: 1, erklaerung: "Ohne gestapelten Bruch gilt Punkt vor Strich: Nur 1/4 ist ein Bruch. 9 − 0,25 − 2 = 6,75. Deshalb nie der Schrägstrich in der Zeile.", falsch: "Hier ist nur 1/4 ein Bruch – der Rest steht in der Zeile." },
          { frage: Z("{x^2−1}/{x+1}", 24), optionen: ["2", "8", "4"], richtig: 0, erklaerung: "Oben 9 − 1 = 8, unten 3 + 1 = 4, der Bruch ist 2. Allgemein: (x − 1)(x + 1) geteilt durch (x + 1) ist x − 1.", falsch: "Zähler und Nenner getrennt ausrechnen, dann teilen." },
        ]} />
      </UebungRahmen>
      <AufsBlatt>Schreib mit echten, gestapelten Brüchen ab – Strich auf Zaunhöhe, oben und unten enger: &nbsp;{Z("{2x−3}/{5} | + | x")}&nbsp;&nbsp;&nbsp; {Z("{x^2−1}/{x+1} | − | 2")}&nbsp;&nbsp;&nbsp; {Z("f'(x) | = | {1}/{2√(x)} | + | {3}/{x^2}")}. Dann rechne {Z("( | {3}/{4} | (+) | {1}/{2} | ) · 2")} aus – ein Schritt pro Zeile, jeder Bruch gestapelt.</AufsBlatt>
    </>
  );
}

function Lektion6() {
  const geloest = useUebung("reste");
  const G = ({ children }) => <span style={{ color: C.see, fontWeight: 700 }}>{children}</span>;
  return (
    <>
      <Absatz>Die Zeile ist die Struktur im Kleinen, der Zeilenverlauf die Struktur im Großen. Wer vertikal ordnet, kann jeden Schritt einzeln prüfen – und findet den Fehler in Sekunden.</Absatz>
      <Regeln liste={[["Ein Schritt pro Zeile", "Jede neue Zeile ist genau eine Umformung. Gleichheitszeichen stehen untereinander."], ["„=“ verbindet nur Gleiches", "Es ist kein Pfeil für „und dann“."], ["Nichts bleibt unvereinfacht stehen", "2 · 3 wird zu 6, 1x zu x, + 0 verschwindet, − − wird zu +. In derselben oder in der nächsten Zeile."], ["Nebenrechnung in die Box, Ergebnis in den Kasten", "Rechts der Kasten für Zwischenwerte und Proben. Unten das Ergebnis: einmal, vollständig vereinfacht, eingerahmt."]]} />
      <Paar falschTitel="Die Kette" richtigTitel="Der Verlauf"
        falsch={<Strich><Tok s="2 · 3 = 6 + 1 = 7" /></Strich>} falschText="Die Zeile behauptet 6 = 6 + 1. Das ist falsch, auch wenn hinten 7 steht."
        richtig={<div style={{ display: "grid", gridTemplateColumns: "auto auto auto", columnGap: 10, rowGap: 4, fontSize: 17, color: C.tinte, fontWeight: 500, justifyContent: "start", alignItems: "center" }}>
          <span>f(3)</span><G>=</G><span>2 · 3 + 1</span>
          <span /><G>=</G><span>6 + 1</span>
          <span /><G>=</G><span>7</span>
        </div>} richtigText="Jede Zeile ist wahr. Jede Zeile lässt sich einzeln prüfen." />
      <UebungRahmen nr={6} titel="Reste finden" geloest={geloest}>
        <ResteFinder id="reste" aufgabe="In jeder Zeile steht etwas, das so nicht stehen bleiben darf. Tippe es an – und sag dann, wie es heißen muss." items={[
          { teile: T("1x | = | 5"), rest: 0, optionen: [Zn("x"), Zn("1 · x"), Zn("x^1")], richtig: 0, erklaerung: "1 · x ist x. Die 1 bleibt nie stehen." },
          { teile: [{ t: "y" }, { sup: "=" }, { t: "3 · 1 · t" }], rest: 2, optionen: [Zn("3t"), Zn("3 · t"), Zn("3 · 1t")], richtig: 0, erklaerung: "· 1 verschwindet, und zwischen Zahl und Buchstabe braucht es keinen Punkt: 3t." },
          { teile: T("f'(x) | = | 2x^1"), rest: 2, optionen: [Zn("2x"), Zn("2x^1"), Zn("2 · x")], richtig: 0, erklaerung: "Hoch 1 schreibt man nie. 2x." },
          { teile: [{ t: "x" }, { sup: "=" }, { t: "4 − (−3)" }], rest: 2, optionen: [Zn("7"), Zn("4 + 3"), Zn("1")], richtig: 0, erklaerung: "Minus Minus wird Plus, und 4 + 3 wird in derselben Zeile zu 7." },
          { teile: [{ t: "g'(x)" }, { sup: "=" }, { t: "6x" }, { op: "+", zaun: true }, { t: "2 · 3" }], rest: 4, optionen: [Zn("6"), Zn("2 · 3"), Zn("23")], richtig: 0, erklaerung: "2 · 3 ist 6. Ein Produkt aus Zahlen bleibt nie stehen." },
          { teile: [{ t: "f(x)" }, { sup: "=" }, { t: "x^2" }, { op: "+", zaun: true }, { t: "0x" }, { op: "−", zaun: true }, { t: "4" }], rest: 4, optionen: ["weglassen", Zn("0"), Zn("x")], richtig: 0, erklaerung: "0x ist 0, und + 0 ist nichts: f(x) = x² − 4." },
        ]} />
      </UebungRahmen>
      <AufsBlatt>Diese Rechnung ist richtig und trotzdem unlesbar: <Blatt karo minHoehe={0} groesse={19} style={{ display: "inline-block", padding: "4px 10px", margin: "6px 0", verticalAlign: "middle" }}>g(2)=3·2²−4·2=3·4=12−8=4</Blatt> Schreib sie als Verlauf neu: ein Schritt pro Zeile, Gleichheitszeichen untereinander, Ergebnis im Kasten.</AufsBlatt>
    </>
  );
}

function Lektion7() {
  const geloest = useUebung("setup");
  return (
    <>
      <Absatz>Die wichtigste Regel von allen steht nicht in deiner Schrift, sondern unter ihr: <b>Blankopapier statt Karo.</b> Kästchen zwingen dich, Zeichen hineinzuquetschen. Auf Blanko entscheidest du über den Abstand – und der Abstand ist deine Grammatik.</Absatz>
      <KaroBlanko frage="Woraus kannst du besser lesen, was du gerade gemacht hast?" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 6, marginTop: 12 }}>
        {[["Blanko", "Kein Karo, keine Linien. Du setzt die Abstände selbst. Wer schief schreibt, lernt es in einer Woche gerade."], ["Schwarzer Stift", "Höchster Kontrast. Kein Radierer – Fehler streichst du sichtbar durch. Empfehlung: Stabilo Point Ball."], ["Blattaufteilung", "Links zwei Drittel: der Hauptweg. Rechts ein Drittel: die Box. Unten: das Ergebnis im Kasten."]].map(([t, s]) => (
          <div key={t} style={{ borderRadius: 12, background: "#F3F6FB", border: "1px solid #C7D4EA", padding: "10px 10px" }}><Et>{t}</Et><p style={{ fontSize: 12.5, color: C.tinte, lineHeight: 1.5 }}>{s}</p></div>
        ))}
      </div>
      <UebungRahmen nr={7} titel="Dein Setup" geloest={geloest}>
        <Wahl id="setup" items={[
          { frage: "Warum Blankopapier?", optionen: ["Weil es ordentlicher aussieht", "Weil du die Abstände selbst setzt – und der Abstand deine Grammatik ist", "Weil Karopapier schwerer zu fotografieren ist"], richtig: 1, erklaerung: "Auf Karo bestimmt das Kästchen den Abstand. Auf Blanko bestimmst du ihn – und damit, was zusammengehört.", falsch: "Es geht nicht ums Aussehen. Was bestimmt auf Karo den Abstand?" },
          { frage: "Welcher Stift?", optionen: ["Blauer Kugelschreiber", "Bleistift mit Radierer", "Schwarzer Stift, ohne Radierer"], richtig: 2, erklaerung: "Schwarz hat den stärksten Kontrast. Ohne Radierer streichst du Fehler sichtbar durch – so bleibt dein Weg morgen nachvollziehbar.", falsch: "Was hat den höchsten Kontrast – und lässt Fehler sichtbar?" },
          { frage: "Wohin mit der Nebenrechnung?", optionen: ["In die Hauptzeile, wo sie gebraucht wird", "Rechts in die Box", "Auf einen Schmierzettel, den du danach wegwirfst"], richtig: 1, erklaerung: "Rechts in die Box. Der Hauptweg bleibt frei, und die Nebenrechnung ist trotzdem morgen noch da.", falsch: "Der Hauptweg soll frei bleiben – aber nichts darf verloren gehen." },
        ]} />
      </UebungRahmen>
      <AufsBlatt>Übertrage die Karo-Rechnung von oben auf ein Blankoblatt: Hauptweg links, Nebenrechnung rechts in der Box, Ergebnis im Kasten. Schreib darunter in einem Satz, woran du jetzt besser lesen kannst, was du gemacht hast.</AufsBlatt>
    </>
  );
}

function Lektion8({ gehe }) {
  return (
    <>
      <Absatz>Alle Regeln auf einem Blatt. Erst schaust du dir an, wie eine ganze Lösung nach Pen & Paper aussieht – dann rechnest du dieselbe Art von Aufgabe selbst, fotografierst dein Blatt und holst dir von <MathildaName /> genau einen Hebel.</Absatz>
      <GanzeLoesung />
      <div style={{ ...karte, padding: "16px 16px 18px", marginTop: 18, borderLeft: `4px solid ${GOLD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", color: C.gruenDunkel }}>ÜBUNG 8</span><span style={{ fontSize: 13, fontWeight: 600, color: C.grau }}>Jetzt du</span>
        </div>
        <p style={{ fontSize: 15, color: C.tinte, lineHeight: 1.65 }}>Bestimme Nullstellen und Scheitelpunkt von</p>
        <div style={{ margin: "8px 0 10px" }}><Term teile={T("g(x) | = | x^2 | + | 4x | − | 5")} modus="schoen" groesse={24} /></div>
        <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.6 }}>Blanko, schwarzer Stift, Blatt aufgeteilt. Aufgabe benennen, ein Schritt pro Zeile, Nebenrechnung rechts, Ergebnisse im Kasten. Dann Foto.</p>
        <MathildaKnopf gehe={gehe}>Blatt fotografieren – <MathildaName dunkel /> prüft</MathildaKnopf>
        <p style={{ fontSize: 12.5, color: LABEL, lineHeight: 1.5, marginTop: 8 }}>Mathilda schreibt ab, nennt zuerst Gelungenes und dann höchstens zwei Stellen, an denen dir Platz gefehlt hat. Du schreibst die Stelle selbst neu.</p>
      </div>
      <AufsBlatt>Nach dem Foto: Schreib die eine Stelle neu, die Mathilda genannt hat. Nicht das ganze Blatt – nur diese Stelle. Danach hake die Lektion unten ab.</AufsBlatt>
    </>
  );
}

function Lektion9({ gehe }) {
  useStand();
  const [check, setCheck] = useState(() => new Set());
  const punkte = ["Blanko und schwarz", "Jede Aufgabe hat einen Namen und einen klaren Anfang", "Luft an den Zäunen, kein Abstand im Haus", "Ein Schritt pro Zeile, Brüche gestapelt", "„=“ verbindet nur Gleiches, steht untereinander", "Nebenrechnung in der Box, Hauptweg bleibt frei", "Nichts Unvereinfachtes bleibt stehen", "Ergebnis im Kasten – und morgen noch lesbar"];
  const tage = ["Lektion 1 und 2: eine alte Lösung lesen, Häuser und Zäune markieren.", "Eine alte Lösung auf Blanko sauber neu schreiben. Nur Abstände, keine neue Mathematik.", "Lektion 5: Brüche stapeln, Bruchstrich auf Zaunhöhe.", "Lektion 6: eine Kette zum Verlauf machen, Reste finden.", "Eine Hausaufgabe komplett nach Pen & Paper. Blatt aufteilen, Ergebnis im Kasten.", "15 Minuten an einer schweren Aufgabe ohne Musterlösung. Steckst du fest: Was weiß ich sicher? Was ist das kleinste Teilproblem?", "Rekonstruktionstest mit der Lösung von Tag 5. Dann der Check."];
  const n = tageFertig();
  return (
    <>
      <Absatz>Bevor du eine Lösung abgibst oder Mathilda schickst, gehst du acht Punkte durch. Nicht länger als eine Minute. Und dann: sieben Tage lang 15 Minuten, bis das Layout keine Entscheidung mehr ist.</Absatz>
      <div style={{ ...karte, padding: 14 }}>
        <Et>Der Pen-&-Paper-Check</Et>
        <Haken punkte={punkte} an={(k) => check.has(k)} schalte={(k, a) => { const s = new Set(check); a ? s.add(k) : s.delete(k); setCheck(s); }} />
        <p style={{ fontSize: 12.5, color: LABEL, marginTop: 8 }}>{check.size} von 8 – für dieses eine Blatt. Beim nächsten Blatt von vorn.</p>
      </div>
      <div style={{ ...karte, padding: 14, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <Et>Deine 7 Tage</Et><span style={{ fontSize: 12.5, fontWeight: 700, color: n === 7 ? C.smaragd : C.grau }}>{n} / 7</span>
        </div>
        <Haken punkte={tage.map((t, k) => <><b style={{ color: NAVY }}>Tag {k + 1}</b> · {t}</>)} an={(k) => tagAn(TAG_IDS[k])} schalte={(k, a) => tagSetzen(TAG_IDS[k], a)} />
        {n === 7 && <p style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: C.smaragd }}>Sieben Tage durch. Ab jetzt zählt nur noch eines: Kannst du deine Lösung morgen noch lesen?</p>}
      </div>
      <AufsBlatt>Jeden Tag ein Blatt, ein Foto, ein Hebel. Die Tage hakst du hier ab – sie bleiben gespeichert, auch wenn du die Lektion schon abgehakt hast.</AufsBlatt>
      <MathildaKnopf gehe={gehe} hell>Heutiges Blatt an <MathildaName /> schicken</MathildaKnopf>
    </>
  );
}

const LEKTIONEN = [
  { id: "l0", stufe: 0, titel: "Dein Blatt ist dein zweites Gehirn", kurz: "Zwei Gesetze, Karo gegen Blanko, der Rekonstruktionstest", K: Lektion1 },
  { id: "l1", stufe: 0, titel: "Häuser und Gartenzäune", kurz: "Super-Operator, Final Operatoren, Terme – und das Prinzip Nähe = Priorität", K: Lektion2 },
  { id: "l2", stufe: 0, titel: "Außen weit, innen eng", kurz: "Die Abstandsstufen: Zeile, Zäune, Garten, Haus", K: Lektion3 },
  { id: "l3", stufe: 1, titel: "Im Haus steht alles eng", kurz: "Druckbuchstaben, Hochzahl am x, Malzeichen nur gegen Missverständnisse", K: Lektion4 },
  { id: "l4", stufe: 1, titel: "Der Bruchstrich auf Zaunhöhe", kurz: "Brüche sind Häuser mit zwei Stockwerken – der Strich ist deine Klammer", K: Lektion5 },
  { id: "l5", stufe: 1, titel: "Ein Schritt pro Zeile", kurz: "Kette oder Verlauf, Nebenrechnung in die Box, Ergebnis im Kasten", K: Lektion6 },
  { id: "l6", stufe: 2, titel: "Blanko, schwarz, aufgeteilt", kurz: "Das Setup: Papier, Stift, Blattaufteilung – und ein Blatt umschreiben", K: Lektion7 },
  { id: "l7", stufe: 3, titel: "Eine ganze Lösung", kurz: "Alle Regeln auf einem Blatt, dann du: Foto an Mathilda, ein Hebel, Neuschrieb", K: Lektion8 },
  { id: "l8", stufe: 4, titel: "Der Check und deine 7 Tage", kurz: "Acht Punkte vor jeder Abgabe, sieben Tage Training, das tägliche Ritual", K: Lektion9 },
];

function LektionKarte({ l, nr, offen, oeffne, gehe }) {
  useStand();
  const fertig = lektionFertig(l.id);
  const ref = useRef(null);
  const [name, kurzStufe] = STUFEN[l.stufe];
  const Inhalt = l.K;
  return (
    <div ref={ref} id={"pp-" + l.id} style={{ ...karte, scrollMarginTop: 70, overflow: "hidden", border: offen ? `1.5px solid ${NAVY}` : "1.5px solid transparent", transition: "border-color .2s" }}>
      <button type="button" onClick={() => oeffne(offen ? null : l.id)} aria-expanded={offen} data-aufklapp-haupt=""
        style={{ width: "100%", textAlign: "left", display: "flex", gap: 12, alignItems: "center", padding: "14px 14px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800,
          background: fertig ? C.smaragd : offen ? NAVY : "#EEF3FA", color: fertig ? "#fff" : offen ? GOLD : NAVY }}>{fertig ? "✓" : nr}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: LABEL }}>STUFE {l.stufe} · {name.toUpperCase()}</span>
          <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: NAVY, lineHeight: 1.25, marginTop: 2 }}>{l.titel}</span>
          {!offen && <span style={{ display: "block", fontSize: 12.5, color: C.grau, lineHeight: 1.4, marginTop: 3 }}>{l.kurz}</span>}
        </span>
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0, transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="M3 6l5 5 5-5" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {offen && (
        <div data-aufklapp-inhalt className="pp-neu" style={{ padding: "2px 14px 18px", borderTop: `1px solid ${C.linie}` }}>
          <p style={{ fontSize: 12.5, color: LABEL, lineHeight: 1.5, margin: "12px 0 10px" }}>Stufe {l.stufe} · {name}: {kurzStufe}.</p>
          <Inhalt gehe={gehe} />
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={() => lektionSetzen(l.id, !fertig)} aria-pressed={fertig}
              style={{ padding: "11px 18px", borderRadius: 999, border: `1.5px solid ${fertig ? C.smaragd : NAVY}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, background: fertig ? C.smaragd : NAVY, color: fertig ? "#fff" : GOLD }}>
              {fertig ? "✓ Lektion erledigt" : "Lektion abhaken"}
            </button>
            {nr < LEKTIONEN.length && <button type="button" onClick={() => oeffne(LEKTIONEN[nr].id)} style={{ padding: "11px 16px", borderRadius: 999, border: `1.5px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "#fff", color: NAVY }}>Nächste Lektion →</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Speicher-Hinweis */

const SPEICHER_TEXT = {
  lokal: ["Dein Fortschritt ist auf diesem Gerät gespeichert.", C.hellgrau],
  aus: ["Dein Fortschritt ist auf diesem Gerät gespeichert. Mit einem Konto ist er auf allen Geräten da.", C.hellgrau],
  verbinde: ["Verbinde mit deinem Konto …", C.grau],
  ausstehend: ["Wird in deinem Konto gesichert …", C.grau],
  ok: ["Im Konto gesichert – auf allen deinen Geräten verfügbar.", "#0F7A4D"],
  "nicht-eingerichtet": ["Konto-Speicher noch nicht eingerichtet – dein Fortschritt bleibt vorerst auf diesem Gerät.", C.grau],
  fehler: ["Sichern im Konto hat nicht geklappt. Dein Fortschritt bleibt auf diesem Gerät, bei der nächsten Änderung versuchen wir es erneut.", "#B3261E"],
};
function SpeicherHinweis() {
  const st = usePenpaperSyncStatus();
  const [text, farbe] = SPEICHER_TEXT[st.status] || SPEICHER_TEXT.lokal;
  return (
    <p role="status" style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: C.grau, lineHeight: 1.55, margin: "10px 2px 0" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, background: farbe, marginTop: 6 }} /><span>{text}</span>
    </p>
  );
}

/* ---------------------------------------------------------------- Seite */

export function PenPaperKursSeite({ gehe }) {
  useStand();
  const [offen, setOffenRoh] = useState(null);
  const fertig = lektionenFertig();
  const naechste = naechsteLektion();
  const oeffne = (id) => {
    setOffenRoh(id);
    if (!id) return;
    zuletztSetzen(id);
    setTimeout(() => {
      try {
        const el = document.getElementById("pp-" + id);
        const ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (el) springe("penpaper-lektion", () => el.scrollIntoView({ behavior: ruhig ? "auto" : "smooth", block: "start" }));
      } catch (e) { /* ignorieren */ }
    }, 30);
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <style>{`.pp-neu{animation:ppNeu .3s cubic-bezier(.2,.7,.3,1) both}@keyframes ppNeu{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.pp-neu{animation:none}}`}</style>

      <H2>Dein Blatt denkt mit</H2>
      <Absatz>Dieser Kurs bringt dir keine neue Mathematik bei. Er bringt dir bei, wie du Mathematik <b>aufschreibst</b> – so, dass dein Blatt dir die Arbeit abnimmt, statt sie dir schwerer zu machen. Wer so schreibt, macht weniger Fehler, findet Fehler schneller und versteht am nächsten Tag noch, was er gemacht hat.</Absatz>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, margin: "4px 0 16px" }}>
        {[["9 Lektionen", "ein Prinzip", C.silberDunkel], ["5 Stufen", "vom Sehen zum Automatisieren", C.see], ["15 Minuten", "am Tag, sieben Tage", GOLD]].map(([t, s, f]) => (
          <div key={t} style={{ ...karte, padding: "12px 10px", borderTop: `4px solid ${f}` }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{t}</p>
            <p style={{ fontSize: 12, color: C.grau, lineHeight: 1.4 }}>{s}</p>
          </div>
        ))}
      </div>

      <Kicker>Das Grundmodell</Kicker>
      <H2>Häuser, Gartenzäune, ein Super-Operator</H2>
      <Grundmodell />
      <div style={{ marginTop: 10, padding: "14px 16px", borderRadius: 14, background: GOLDHELL, border: "1px solid #F0D77A" }}>
        <Et farbe={C.gruenDunkel}>Die eine Regel hinter allen Regeln</Et>
        <p style={{ fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.01em", marginBottom: 4 }}>Nähe = Priorität</p>
        <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65 }}>Was auf dem Blatt näher beieinandersteht, wird früher verrechnet. Alles andere in diesem Kurs folgt daraus.</p>
      </div>

      <Trenner />

      <div style={{ ...karte, padding: "16px 16px 14px", background: NAVY, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <Et farbe={GOLD}>Dein Stand</Et>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.goldText }}>{fertig} von {LEKTIONEN.length} Lektionen</span>
        </div>
        <div aria-hidden="true" style={{ display: "flex", gap: 4, margin: "6px 0 12px" }}>
          {LEKTION_IDS.map((id) => <span key={id} style={{ flex: 1, height: 6, borderRadius: 3, background: lektionFertig(id) ? GOLD : "rgba(255,255,255,0.18)" }} />)}
        </div>
        {naechste ? (
          <button type="button" onClick={() => oeffne(naechste)} style={{ width: "100%", padding: "12px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, background: GOLD, color: NAVY }}>
            {fertig === 0 ? "Mit Lektion 1 beginnen" : `Weiter mit Lektion ${LEKTION_IDS.indexOf(naechste) + 1}`}
          </button>
        ) : (
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: C.goldText }}>Alle neun Lektionen erledigt. Ab jetzt: jeden Tag ein Blatt an Mathilda – und der Check vor jeder Abgabe.</p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 12, color: C.goldText }}>{tageFertig()} / 7 Tage abgehakt</span>
          {fertig > 0 && <button type="button" onClick={() => { if (window.confirm("Kursfortschritt wirklich von vorn beginnen?")) { penpaperZuruecksetzen(); setOffenRoh(null); } }} style={{ fontSize: 12, color: C.goldText, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", padding: 0 }}>Von vorn beginnen</button>}
        </div>
      </div>
      <SpeicherHinweis />

      <Trenner />

      <Kicker>Der Weg</Kicker>
      <H2>Neun Lektionen in fünf Stufen</H2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {STUFEN.map(([n, s], i) => (
          <span key={n} title={s} style={{ fontSize: 12, fontWeight: 700, color: NAVY, padding: "6px 10px", borderRadius: 999, background: "#EEF3FA" }}>{i} · {n}</span>
        ))}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {LEKTIONEN.map((l, i) => <LektionKarte key={l.id} l={l} nr={i + 1} offen={offen === l.id} oeffne={oeffne} gehe={gehe} />)}
      </div>

      <Trenner />

      <Kicker>Jeden Tag</Kicker>
      <H2>Mathildas Blatt-Training</H2>
      <Absatz>Ein Blatt, ein Hebel, ein Neuschrieb. <MathildaName /> prüft nicht nur die Mathematik, sondern dein Blatt nach genau den Regeln dieses Kurses.</Absatz>
      <div style={{ ...karte, padding: 16, background: NAVY, color: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {[["Foto", "Du fotografierst dein Blatt. Mathilda schreibt ab und fragt nach, wo sie unsicher ist."], ["Ein Hebel", "Erst, was gelungen ist. Dann höchstens zwei Stellen, an denen dir Platz gefehlt hat – und wo genau dort der Fehler sitzt."], ["Neuschrieb", "Du schreibst die Stelle selbst neu. Keine Musterlösung. Nächstes Foto."]].map(([t, s], i) => (
            <div key={t}>
              <span aria-hidden="true" style={{ display: "inline-flex", width: 24, height: 24, borderRadius: 999, background: GOLD, color: NAVY, fontSize: 12, fontWeight: 800, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>{i + 1}</span>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{t}</p>
              <p style={{ fontSize: 12.5, color: C.goldText, lineHeight: 1.5 }}>{s}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.goldText, lineHeight: 1.6, margin: "14px 0 0" }}>Mathilda sagt nie „deine Schrift ist schlecht“. Sie sagt: „Hier fehlt dir Platz.“ Denn genau dort entstehen die Fehler.</p>
        <button type="button" onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })} style={{ marginTop: 12, width: "100%", padding: "12px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, background: GOLD, color: NAVY }}>
          Blatt fotografieren
        </button>
      </div>

      <p style={{ fontFamily: "'Patrick Hand', 'Segoe Print', sans-serif", fontSize: 24, lineHeight: 1.3, color: C.see, textAlign: "center", margin: "36px 0 0" }}>
        Das Ziel ist nicht, weniger denken zu müssen.<br />Das Ziel ist, besser denken zu können.
      </p>
      <p style={{ fontSize: 12.5, color: LABEL, textAlign: "center", marginTop: 8 }}>Matheskript · Band 2 · Pen & Paper</p>
    </div>
  );
}
