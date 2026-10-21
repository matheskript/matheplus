/* ============================================================
   Mengen und Logik (Bereich „Fundament“, Station 3)
   Lernweg in sechs Kapiteln, jede Einführung in drei Stufen
   (Einstieg · Standard · Vertiefung), dazu ein Labor und Übungen:
     1 Mengen und Elemente   – aufzählend, beschreibend, ⊆
     2 Mengenoperationen     – ∩, ∪, \, Komplement, Mengenbild
     3 Intervalle            – Lösungsmengen auf der Zahlengeraden
     4 Aussagen und Verknüpfungen – ¬, ∧, ∨, ⇒, ⇔, Wahrheitstafel
     5 Folgern und Beweisen  – Gegenbeispiel, Umkehrung, notwendig/hinreichend, Quantoren
     6 Alles gemischt
   Mathematik und Aufgaben: mengenLogik.js, mengenRechnen.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { GrosserKnopf, MS, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, zt } from "./ui3.jsx";
import { Merke, Regler } from "./geoUi.jsx";
import { Absatz, Einfuehrung, FormelBlock, Labor, Leitfrage, LernwegSeite, MengenStrahl, Schalter, Trenner, UebenDaten, UebenKopf, VennBild } from "./lernwegUi.jsx";
import { iv, mengeTex, ver } from "./mengenRechnen.js";
import { ML_KAPITEL_ARTEN, ML_TITEL, P, VERKN, gegenbeispiel, ivSchnitt, ivVereinigung, listeTex, mlAufgabe, ungleichungTex } from "./mengenLogik.js";
import { Kicker, Werkzeugleiste, useDesktop } from "./arbeitsflaeche.jsx";
import { LaborFlaeche, StellKarte, useKarte } from "./funcZahlenDesktop.jsx";

const GRUEN = "#0F7A4D";
const pName = (id) => zw(P[id].de, P[id].en);

const hilfe = (au) => hilfeKontext({
  id: `mengenlogik-${au.art}`, aufgabe: "Mengen Element Teilmenge Schnittmenge Vereinigung Komplement Intervall Aussage Wahrheitstafel Implikation Gegenbeispiel Quantor Verneinung",
  verstehen: [zw("Um welche Menge bzw. welche Aussage geht es? Schreib die Elemente oder Wahrheitswerte auf.", "Which set or statement is it about? Write down the elements or truth values.")],
  ansatz: [
    zw("∩ = in beiden, ∪ = in mindestens einer, A \\ B = in A, aber nicht in B.", "∩ = in both, ∪ = in at least one, A \\ B = in A but not in B."),
    zw("Allaussage widerlegen: ein Gegenbeispiel genügt.", "To disprove a universal statement: one counterexample is enough."),
    zw("A ⇒ B ist nur falsch, wenn A wahr und B falsch ist.", "A ⇒ B is only false if A is true and B is false."),
  ],
  regel: ["A ⊆ B ⇔ (x ∈ A ⇒ x ∈ B)", "¬(∀x: A(x)) ⇔ ∃x: ¬A(x)", "¬(A ∧ B) ⇔ ¬A ∨ ¬B"],
  pruefen: [zw("Teste deine Antwort an einem konkreten Element oder einer konkreten Zahl.", "Test your answer on a concrete element or number.")],
});
const skizze = (au) => {
  const s = au.skizze;
  if (!s) return null;
  if (s.menge) return <MengenStrahl mengen={[{ menge: s.menge, farbe: C.see, name: "I" }]} />;
  if (s.mengen) return <MengenStrahl mengen={[{ menge: s.mengen[0], farbe: C.see, name: "A" }, { menge: s.mengen[1], farbe: C.gold, name: "B" }]} />;
  if (s.venn) return <VennBild />;
  return null;
};
const gegen = ([a, b], n) => Number.isInteger(n) && n >= 1 && P[a].f(n) && !P[b].f(n);
const ueben = (arten) => <UebenDaten titel={ML_TITEL} arten={arten} erzeuge={(a) => mlAufgabe(a)} skizze={skizze} hilfe={hilfe} gegen={gegen} />;

/* ============================================================
   KAPITEL 1 · MENGEN UND ELEMENTE
   ============================================================ */
const EIGENSCHAFTEN = ["gerade", "prim", "v3", "v4", "t24", "quad"];
function Zahlenfeld({ bis, ist, farbe = C.see, rot, onTipp, gewaehlt }) {
  const zahlen = Array.from({ length: bis }, (_, i) => i + 1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, minmax(0, 1fr))", gap: 4, marginTop: 10 }}>
      {zahlen.map((n) => {
        const an = ist(n), falsch = rot && rot(n);
        return (
          <button key={n} type="button" onClick={onTipp ? () => onTipp(n) : undefined} aria-pressed={an} data-zahl={n}
            style={{ height: 32, borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: onTipp ? "pointer" : "default", padding: 0,
              border: `1.5px solid ${falsch ? C.signal : gewaehlt === n ? C.flaggold : an ? farbe : C.linie}`, background: falsch ? `${C.signal}18` : an ? farbe : C.weiss, color: an && !falsch ? C.weiss : falsch ? C.signal : C.grau,
              boxShadow: gewaehlt === n ? `0 0 0 2px ${C.flaggold}` : "none" }}>{n}</button>
        );
      })}
    </div>
  );
}
function MengenLabor() {
  const [id, setId] = useState("gerade"), [bis, setBis] = useState(20), [n, setN] = useState(null);
  const liste = Array.from({ length: bis }, (_, i) => i + 1).filter(P[id].f);
  const desktop = useDesktop();
  const titel = zw("Labor: eine Menge bauen", "Lab: build a set"), auff = zw("Wähle eine Eigenschaft – und tippe Zahlen an, um ∈ oder ∉ zu prüfen.", "Choose a property – and tap numbers to check ∈ or ∉.");
  const eigenschaft = <Schalter optionen={EIGENSCHAFTEN.map((e) => [e, pName(e)])} wert={id} setWert={(e) => { setId(e); setN(null); }} label={zw("Eigenschaft", "Property")} />;
  const grundmenge = <Schalter optionen={[[20, "G = {1; …; 20}"], [30, "G = {1; …; 30}"]]} wert={bis} setWert={setBis} farbe={C.grau} label={zw("Grundmenge", "Universe")} />;
  const feld = <Zahlenfeld bis={bis} ist={P[id].f} onTipp={setN} gewaehlt={n} />;
  const menge = (
    <div style={{ background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 12, display: "grid", gap: 6, fontSize: 15, color: C.tinte, overflowX: "auto" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.grau }}>{zw("beschreibend", "set-builder")}</span>
      <span><M t={`A = \\{x \\in G \\mid`} /> {pName(id)}<M t="\}" /></span>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.grau, marginTop: 4 }}>{zw("aufzählend", "listing")}</span>
      <M t={`A = ${listeTex(liste)}`} />
      <M t={`|A| = ${liste.length}`} />
    </div>
  );
  const pruefung = n !== null && (
    <p style={{ margin: "10px 2px 0", fontSize: 15, fontWeight: 700, color: P[id].f(n) ? GRUEN : C.signal }}>
      <M t={`${n} ${P[id].f(n) ? "\\in" : "\\notin"} A`} /> – „{zw(P[id].de, P[id].en).replace(/\bx\b/, String(n))}“ {P[id].f(n) ? zw("ist wahr.", "is true.") : zw("ist falsch.", "is false.")}
    </p>
  );
  if (desktop) {
    return (
      <LaborFlaeche titel={titel} aufforderung={auff}
        links={<div style={{ marginTop: -12 }}>{menge}{pruefung}</div>}
        bild={<div style={{ marginTop: -10 }}>{feld}</div>}
        rechts={<Werkzeugleiste gruppen={[{ titel: zw("Eigenschaft", "Property"), inhalt: eigenschaft }, { titel: zw("Grundmenge", "Universe"), inhalt: grundmenge }]} />} />
    );
  }
  return (
    <Labor titel={titel} aufforderung={auff}>
      {eigenschaft}
      <div style={{ marginTop: 8 }}>{grundmenge}</div>
      {feld}
      {menge}
      {pruefung}
    </Labor>
  );
}

function KapitelMengen({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Was ist eigentlich eine Menge?", "What actually is a set?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Stell dir einen Beutel vor, in den du Dinge legst: die Zahlen 2, 4 und 6, die Farben einer Ampel oder alle Schüler deiner Klasse. Dieser Beutel ist eine Menge, die Dinge darin heißen Elemente.", "Imagine a bag into which you put things: the numbers 2, 4 and 6, the colours of a traffic light or all students in your class. This bag is a set; the things in it are its elements.")}</Absatz>
          <Absatz>{zw("Zwei Regeln: Jedes Element zählt nur einmal, und die Reihenfolge ist egal. {1; 2; 3} und {3; 1; 2} sind dieselbe Menge. Ein leerer Beutel ist auch erlaubt – die leere Menge ∅.", "Two rules: each element counts only once, and order doesn't matter. {1; 2; 3} and {3; 1; 2} are the same set. An empty bag is allowed too – the empty set ∅.")}</Absatz>
          <Absatz>{zw("Liegt eine Zahl im Beutel, schreibt man 4 ∈ A („4 ist Element von A“), sonst 5 ∉ A.", "If a number is in the bag you write 4 ∈ A (“4 is an element of A”), otherwise 5 ∉ A.")}</Absatz>
        </>}
        standard={<>
          <Absatz>{zw("Eine Menge kann man auf zwei Arten angeben:", "A set can be given in two ways:")}</Absatz>
          <FormelBlock t={[zw("\\text{aufzählend: } A = \\{2; 4; 6; 8\\}", "\\text{listing: } A = \\{2; 4; 6; 8\\}"), zw("\\text{beschreibend: } A = \\{x \\in \\mathbb{N} \\mid x \\text{ gerade}, x < 10\\}", "\\text{set-builder: } A = \\{x \\in \\mathbb{N} \\mid x \\text{ even}, x < 10\\}")]} />
          <Absatz>{zw("Der senkrechte Strich liest sich „für die gilt“. Weitere Zeichen: $x \\in A$ (Element), $x \\notin A$ (kein Element), $\\emptyset$ (leere Menge), $|A|$ (Anzahl der Elemente). $A \\subseteq B$ heißt: A ist Teilmenge von B – jedes Element von A liegt auch in B.", "The vertical bar reads “such that”. More symbols: $x \\in A$ (element), $x \\notin A$ (not an element), $\\emptyset$ (empty set), $|A|$ (number of elements). $A \\subseteq B$ means A is a subset of B – every element of A is also in B.")}</Absatz>
          <Absatz>{zw("Die Zahlenmengen kennst du schon: $\\mathbb{N} \\subseteq \\mathbb{Z} \\subseteq \\mathbb{Q} \\subseteq \\mathbb{R}$.", "You already know the number sets: $\\mathbb{N} \\subseteq \\mathbb{Z} \\subseteq \\mathbb{Q} \\subseteq \\mathbb{R}$.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Teilmenge ist in Wahrheit eine Folgerung: $A \\subseteq B$ bedeutet „für alle x: $x \\in A \\Rightarrow x \\in B$“. Um $A \\subseteq B$ zu widerlegen, genügt deshalb ein einziges Element von A, das nicht in B liegt.", "Subset is really an implication: $A \\subseteq B$ means “for all x: $x \\in A \\Rightarrow x \\in B$”. So to disprove $A \\subseteq B$, a single element of A not in B is enough.")}</Absatz>
          <Absatz>{zw("Zwei Mengen sind gleich, wenn sie dieselben Elemente haben. Bewiesen wird das in zwei Richtungen: $A = B \\Leftrightarrow A \\subseteq B \\land B \\subseteq A$.", "Two sets are equal if they have the same elements. This is proved in two directions: $A = B \\Leftrightarrow A \\subseteq B \\land B \\subseteq A$.")}</Absatz>
          <Absatz>{zw("Eine Kuriosität: Die leere Menge ist Teilmenge jeder Menge. Denn „jedes Element von ∅ liegt in B“ ist wahr – es gibt ja kein Element, das es widerlegen könnte.", "A curiosity: the empty set is a subset of every set. “Every element of ∅ lies in B” is true – there is no element that could disprove it.")}</Absatz>
        </>}
      />
      <MengenLabor />
      <Merke farbe={C.see}><MS s={zw("Aufzählend $\\{2; 4; 6\\}$ oder beschreibend $\\{x \\in G \\mid \\ldots\\}$. $x \\in A$: x liegt in A. $A \\subseteq B$: alles aus A liegt auch in B.", "Listing $\\{2; 4; 6\\}$ or set-builder $\\{x \\in G \\mid \\ldots\\}$. $x \\in A$: x is in A. $A \\subseteq B$: everything in A is also in B.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Mit Mengen umgehen", "Working with sets")}</UebenKopf>
      {ueben(ML_KAPITEL_ARTEN.me)}
    </>
  );
}

/* ============================================================
   KAPITEL 2 · MENGENOPERATIONEN
   ============================================================ */
const OPS = () => [
  ["schnitt", "A ∩ B", (a, b) => a && b, zw("in A und in B", "in A and in B")],
  ["ver", "A ∪ B", (a, b) => a || b, zw("in A oder in B (oder beiden)", "in A or B (or both)")],
  ["ohne", "A \\ B", (a, b) => a && !b, zw("in A, aber nicht in B", "in A but not in B")],
  ["bohne", "B \\ A", (a, b) => b && !a, zw("in B, aber nicht in A", "in B but not in A")],
  ["komp", "Ā", (a) => !a, zw("nicht in A", "not in A")],
];
function VennLabor() {
  const [a, setA] = useState("gerade"), [b, setB] = useState("v3"), [op, setOp] = useState("schnitt");
  const ops = OPS();
  const o = ops.find((x) => x[0] === op);
  const zahlen = Array.from({ length: 20 }, (_, i) => ({ n: i + 1, a: P[a].f(i + 1), b: P[b].f(i + 1) }));
  const erg = zahlen.filter((z) => o[2](z.a, z.b)).map((z) => z.n);
  const desktop = useDesktop();
  const titel = zw("Labor: Mengenbild", "Lab: Venn diagram"), auff = zw("Wähle zwei Eigenschaften und eine Operation. Gold markiert das Ergebnis.", "Choose two properties and an operation. Gold marks the result.");
  const wahlA = <Schalter optionen={EIGENSCHAFTEN.map((e) => [e, pName(e)])} wert={a} setWert={setA} label="A" />;
  const wahlB = <Schalter optionen={EIGENSCHAFTEN.map((e) => [e, pName(e)])} wert={b} setWert={setB} farbe={C.gold} label="B" />;
  const wahlOp = <Schalter optionen={ops.map((x) => [x[0], x[1]])} wert={op} setWert={setOp} farbe={C.tinte} label={zw("Operation", "Operation")} />;
  const venn = <VennBild zahlen={zahlen} markiert={(ina, inb) => o[2](ina, inb)} />;
  const ergebnis = (
    <div style={{ background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 8, fontSize: 15, color: C.tinte, overflowX: "auto" }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, color: C.grau }}>{o[1]}: {o[3]} {zw("(Grundmenge 1 bis 20)", "(universe 1 to 20)")}</p>
      <M t={`${o[1].replace("\\", "\\setminus").replace("Ā", "\\overline{A}")} = ${listeTex(erg)}`} />
    </div>
  );
  if (desktop) {
    return (
      <LaborFlaeche titel={titel} aufforderung={auff}
        links={<><Kicker>{zw("Operation", "Operation")}</Kicker>{wahlOp}<div style={{ marginTop: 6 }}>{ergebnis}</div></>}
        bild={venn}
        rechts={<Werkzeugleiste gruppen={[{ titel: zw("Menge A", "Set A"), inhalt: wahlA }, { titel: zw("Menge B", "Set B"), inhalt: wahlB }]} />} />
    );
  }
  return (
    <Labor titel={titel} aufforderung={auff}>
      <p style={{ ...kicker, color: C.see, marginBottom: 4 }}>A</p>
      {wahlA}
      <p style={{ ...kicker, color: C.gold, margin: "10px 0 4px" }}>B</p>
      {wahlB}
      <div style={{ marginTop: 10 }}>{wahlOp}</div>
      <div style={{ marginTop: 10 }}>{venn}</div>
      {ergebnis}
    </Labor>
  );
}

function KapitelOperationen({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Wie rechnet man mit Mengen?", "How do you calculate with sets?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Lisa ist im Fußball- und im Schachverein. In der Schnittmenge stehen alle, die in beiden Vereinen sind. In der Vereinigung stehen alle, die in mindestens einem sind. Und „Fußball ohne Schach“ sind alle, die nur Fußball spielen.", "Lisa is in the football club and the chess club. The intersection contains everyone in both clubs. The union contains everyone in at least one. And “football without chess” is everyone who only plays football.")}</Absatz>
          <Absatz>{zw("Im Mengenbild sind das Teile von zwei überlappenden Kreisen: die Mitte, alles zusammen oder ein Halbmond.", "In a Venn diagram these are parts of two overlapping circles: the middle, everything together or a crescent.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={["A \\cap B = \\{x \\mid x \\in A \\land x \\in B\\}", "A \\cup B = \\{x \\mid x \\in A \\lor x \\in B\\}", "A \\setminus B = \\{x \\mid x \\in A \\land x \\notin B\\}"]} />
          <Absatz>{zw("Das Komplement $\\overline{A} = G \\setminus A$ enthält alles aus der Grundmenge G, was nicht in A liegt. Beim Zählen gilt: $|A \\cup B| = |A| + |B| − |A \\cap B|$ – die Elemente in der Mitte würden sonst doppelt gezählt.", "The complement $\\overline{A} = G \\setminus A$ contains everything in the universe G not in A. When counting: $|A \\cup B| = |A| + |B| − |A \\cap B|$ – otherwise the middle would be counted twice.")}</Absatz>
          <Absatz>{zw("Beispiel: $A = \\{1; 2; 3; 4\\}$, $B = \\{3; 4; 5\\}$: $A \\cap B = \\{3; 4\\}$, $A \\cup B = \\{1; 2; 3; 4; 5\\}$, $A \\setminus B = \\{1; 2\\}$.", "Example: $A = \\{1; 2; 3; 4\\}$, $B = \\{3; 4; 5\\}$: $A \\cap B = \\{3; 4\\}$, $A \\cup B = \\{1; 2; 3; 4; 5\\}$, $A \\setminus B = \\{1; 2\\}$.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Mengenoperationen und Logik sind dasselbe in zwei Sprachen: ∩ gehört zu „und“ (∧), ∪ zu „oder“ (∨), das Komplement zu „nicht“ (¬). Deshalb gelten dieselben Gesetze, zum Beispiel das Distributivgesetz und die Regeln von De Morgan:", "Set operations and logic are the same thing in two languages: ∩ belongs to “and” (∧), ∪ to “or” (∨), the complement to “not” (¬). So the same laws hold, for example distributivity and De Morgan's laws:")}</Absatz>
          <FormelBlock t={["A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)", "\\overline{A \\cup B} = \\overline{A} \\cap \\overline{B}", "\\overline{A \\cap B} = \\overline{A} \\cup \\overline{B}"]} />
          <Absatz>{zw("Prüfe De Morgan im Labor: Nicht in „A oder B“ zu liegen heißt, weder in A noch in B zu liegen.", "Check De Morgan in the lab: not being in “A or B” means being in neither A nor B.")}</Absatz>
        </>}
      />
      <VennLabor />
      <Merke farbe={C.see}><MS s={zw("$\\cap$: in beiden · $\\cup$: in mindestens einer · $A \\setminus B$: in A, nicht in B · $\\overline{A}$: nicht in A. Zählen: $|A \\cup B| = |A| + |B| − |A \\cap B|$.", "$\\cap$: in both · $\\cup$: in at least one · $A \\setminus B$: in A, not in B · $\\overline{A}$: not in A. Counting: $|A \\cup B| = |A| + |B| − |A \\cap B|$.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Mengen verknüpfen", "Combine sets")}</UebenKopf>
      {ueben(ML_KAPITEL_ARTEN.op)}
    </>
  );
}

/* ============================================================
   KAPITEL 3 · INTERVALLE
   ============================================================ */
function IntervallLabor() {
  const [a, setA] = useState(-2), [b, setB] = useState(4), [az, setAz] = useState(true), [bz, setBz] = useState(false);
  const [c, setC] = useState(1), [d, setD] = useState(7), [op, setOp] = useState("nur");
  const I = iv(Math.min(a, b), Math.max(a, b), a <= b ? az : bz, a <= b ? bz : az);
  const J = iv(Math.min(c, d), Math.max(c, d), true, true);
  let E = I;
  if (op === "schnitt") E = ivSchnitt(I, J);
  if (op === "ver") E = ivSchnitt(I, J).art !== "leer" || I.hi === J.lo || J.hi === I.lo ? ivVereinigung(I, J) : (I.lo < J.lo ? ver(I, J) : ver(J, I));
  const zeilen = op === "nur" ? [{ menge: I, farbe: C.see, name: "I" }] : [{ menge: I, farbe: C.see, name: "I" }, { menge: J, farbe: C.gold, name: "J" }, { menge: E, farbe: C.smaragd, name: op === "schnitt" ? "I ∩ J" : "I ∪ J" }];
  const desktop = useDesktop();
  if (desktop) {
    const zt0 = (v) => zt(v);
    return (
      <LaborFlaeche titel={zw("Labor: Intervalle", "Lab: intervals")} aufforderung={zw("Ziehe die Grenzen und schalte um, ob sie dazugehören. Dann schneide oder vereinige mit J.", "Drag the bounds and toggle whether they are included. Then intersect or unite with J.")}
          links={<div style={{ display: "grid", gap: 12 }}>
            <StellKarte titel="I" werte={[
              { name: "a", wert: a, setWert: setA, min: -8, max: 8, format: zt0 },
              { name: "b", wert: b, setWert: setB, min: -8, max: 8, format: zt0 },
            ]}>
              <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
                <Schalter optionen={[[true, zw("a gehört dazu", "a included")], [false, zw("a nicht", "a excluded")]]} wert={az} setWert={setAz} label="a" />
                <Schalter optionen={[[true, zw("b gehört dazu", "b included")], [false, zw("b nicht", "b excluded")]]} wert={bz} setWert={setBz} label="b" />
              </div>
            </StellKarte>
            <div><Kicker>{zw("Operation", "Operation")}</Kicker><Schalter optionen={[["nur", zw("nur I", "only I")], ["schnitt", "I ∩ J"], ["ver", "I ∪ J"]]} wert={op} setWert={setOp} farbe={C.smaragd} label={zw("Operation", "Operation")} /></div>
            {op !== "nur" && <StellKarte titel="J" farbe={C.gold} werte={[
              { name: "c", wert: c, setWert: setC, min: -8, max: 8, format: zt0 },
              { name: "d", wert: d, setWert: setD, min: -8, max: 8, format: zt0 },
            ]} />}
          </div>}
          bild={<MengenStrahl mengen={zeilen} lo={-9} hi={9} />} bildStil={{ padding: "12px 16px" }}
          rechts={<div style={{ background: C.sand, borderRadius: 14, padding: "12px 16px", display: "grid", gap: 8, fontSize: 16, color: C.tinte, overflowX: "auto" }}>
            <M t={`I = ${mengeTex(I)}`} />
            <M t={`I = \\{x \\in \\mathbb{R} \\mid ${ungleichungTex(I)}\\}`} />
            {op !== "nur" && <div style={{ fontWeight: 700 }}><M t={`I ${op === "schnitt" ? "\\cap" : "\\cup"} J = ${mengeTex(E)}`} /></div>}
          </div>} />
    );
  }
  return (
    <Labor titel={zw("Labor: Intervalle", "Lab: intervals")} aufforderung={zw("Ziehe die Grenzen und schalte um, ob sie dazugehören. Dann schneide oder vereinige mit J.", "Drag the bounds and toggle whether they are included. Then intersect or unite with J.")}>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="a" wert={a} setWert={setA} min={-8} max={8} schritt={1} format={(v) => zt(v)} />
        <Regler name="b" wert={b} setWert={setB} min={-8} max={8} schritt={1} format={(v) => zt(v)} />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Schalter optionen={[[true, zw("a gehört dazu", "a included")], [false, zw("a nicht", "a excluded")]]} wert={az} setWert={setAz} label="a" />
          <Schalter optionen={[[true, zw("b gehört dazu", "b included")], [false, zw("b nicht", "b excluded")]]} wert={bz} setWert={setBz} label="b" />
        </div>
      </div>
      <div style={{ background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 12, display: "grid", gap: 6, fontSize: 16, color: C.tinte, overflowX: "auto" }}>
        <M t={`I = ${mengeTex(I)}`} />
        <M t={`I = \\{x \\in \\mathbb{R} \\mid ${ungleichungTex(I)}\\}`} />
      </div>
      <div style={{ marginTop: 12 }}><Schalter optionen={[["nur", zw("nur I", "only I")], ["schnitt", "I ∩ J"], ["ver", "I ∪ J"]]} wert={op} setWert={setOp} farbe={C.smaragd} label={zw("Operation", "Operation")} /></div>
      {op !== "nur" && (
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <Regler name="J: c" wert={c} setWert={setC} min={-8} max={8} schritt={1} format={(v) => zt(v)} farbe={C.gold} breiteName={52} />
          <Regler name="J: d" wert={d} setWert={setD} min={-8} max={8} schritt={1} format={(v) => zt(v)} farbe={C.gold} breiteName={52} />
        </div>
      )}
      <MengenStrahl mengen={zeilen} lo={-9} hi={9} />
      {op !== "nur" && <div style={{ fontSize: 16, color: C.tinte, textAlign: "center", fontWeight: 700, overflowX: "auto" }}><M t={`I ${op === "schnitt" ? "\\cap" : "\\cup"} J = ${mengeTex(E)}`} /></div>}
    </Labor>
  );
}

function KapitelIntervalle({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Wie schreibt man „alle Zahlen zwischen 2 und 5“?", "How do you write “all numbers between 2 and 5”?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Zwischen 2 und 5 liegen nicht nur 3 und 4, sondern auch 2,5 und 3,14 und unendlich viele weitere Zahlen. Aufzählen geht nicht. Auf der Zahlengeraden ist es aber nur ein Stück – ein Intervall.", "Between 2 and 5 lie not only 3 and 4 but also 2.5 and 3.14 and infinitely many more. You can't list them. On the number line, though, it's just one piece – an interval.")}</Absatz>
          <Absatz>{zw("An den Enden zeigt ein voller Punkt: Die Zahl gehört dazu. Ein leerer Kreis: Sie gehört nicht dazu. In der Schreibweise sind das die Klammern: [ zeigt zur Zahl hin, ] nach außen.", "At the ends a filled dot means the number is included. An empty circle: it is not. In the notation these are the brackets: [ faces the number, ] faces outwards.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={["[a; b] = \\{x \\mid a \\le x \\le b\\}", "]a; b[ = \\{x \\mid a < x < b\\}", "[a; \\infty[ = \\{x \\mid x \\ge a\\}"]} />
          <Absatz>{zw("Halboffen geht auch: $[a; b[$ oder $]a; b]$. Am Unendlichen steht immer eine offene Klammer, denn ∞ ist keine Zahl. $\\mathbb{R} = ]−\\infty; \\infty[$.", "Half-open works too: $[a; b[$ or $]a; b]$. At infinity there's always an open bracket, since ∞ is not a number. $\\mathbb{R} = ]−\\infty; \\infty[$.")}</Absatz>
          <Absatz>{zw("Intervalle sind die Sprache der Lösungsmengen: $2x \\le 8$ hat $L = ]−\\infty; 4]$, die Definitionsmenge von $\\frac{1}{x − 2}$ ist $D = \\mathbb{R} \\setminus \\{2\\}$.", "Intervals are the language of solution sets: $2x \\le 8$ has $L = ]−\\infty; 4]$, the domain of $\\frac{1}{x − 2}$ is $D = \\mathbb{R} \\setminus \\{2\\}$.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("„und“ zwischen zwei Bedingungen ist ein Schnitt, „oder“ eine Vereinigung: $x > −1 \\land x \\le 3$ ergibt $]−1; \\infty[ \\cap ]−\\infty; 3] = ]−1; 3]$. Zeichne die Intervalle übereinander – dann ist der Schnitt die Stelle, wo beide liegen.", "“and” between two conditions is an intersection, “or” a union: $x > −1 \\land x \\le 3$ gives $]−1; \\infty[ \\cap ]−\\infty; 3] = ]−1; 3]$. Draw the intervals above each other – the intersection is where both lie.")}</Absatz>
          <Absatz>{zw("Ein feiner Unterschied: $[0; 1]$ hat ein kleinstes Element (0), $]0; 1[$ nicht – zu jeder Zahl darin gibt es eine noch kleinere, etwa die Hälfte. In englischen Büchern schreibt man $(a, b)$ statt $]a; b[$.", "A subtle difference: $[0; 1]$ has a smallest element (0), $]0; 1[$ does not – for each number in it there is a smaller one, e.g. half of it. English books write $(a, b)$ instead of $]a; b[$.")}</Absatz>
        </>}
      />
      <IntervallLabor />
      <Merke farbe={C.see}><MS s={zw("≤ bzw. ≥: Klammer zur Zahl hin $[a; b]$. < bzw. >: Klammer nach außen $]a; b[$. Bei ∞ immer nach außen. „und“ → ∩, „oder“ → ∪.", "≤ or ≥: bracket faces the number $[a; b]$. < or >: bracket faces out $]a; b[$. At ∞ always out. “and” → ∩, “or” → ∪.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Mit Intervallen arbeiten", "Working with intervals")}</UebenKopf>
      {ueben(ML_KAPITEL_ARTEN.iv)}
    </>
  );
}

/* ============================================================
   KAPITEL 4 · AUSSAGEN UND VERKNÜPFUNGEN
   ============================================================ */
const BEISPIEL = {
  und: ["„Ich gehe ins Kino, wenn ich Zeit und Geld habe.“", "“I'll go to the cinema if I have time and money.”"],
  oder: ["„Du bekommst Eis oder Kuchen“ – in der Mathematik darfst du auch beides haben.", "“You get ice cream or cake” – in maths you may also have both."],
  folgt: ["Versprechen: „Wenn du die 1 schreibst, gibt's Pizza.“ Gebrochen ist es nur, wenn du die 1 schreibst und es keine Pizza gibt.", "Promise: “If you get an A, there'll be pizza.” It's only broken if you get an A and there's no pizza."],
  aequ: ["„Das Licht brennt genau dann, wenn der Schalter oben ist.“", "“The light is on if and only if the switch is up.”"],
};
function TafelLabor() {
  const [op, setOp] = useState("folgt"), [zeile, setZeile] = useState(1);
  const reihen = [[true, true], [true, false], [false, true], [false, false]];
  const wf = (x) => (x ? zw("w", "t") : zw("f", "f"));
  const desktop = useDesktop();
  const titel = zw("Labor: Wahrheitstafel", "Lab: truth table"), auff = zw("Wähle eine Verknüpfung und tippe eine Zeile an.", "Choose a connective and tap a row.");
  const wahl = <Schalter optionen={[["und", "$A \\land B$"], ["oder", "$A \\lor B$"], ["folgt", "$A \\Rightarrow B$"], ["aequ", "$A \\Leftrightarrow B$"]]} wert={op} setWert={setOp} label={zw("Verknüpfung", "Connective")} />;
  const tafel = (
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: desktop ? 0 : 12, fontSize: 16, textAlign: "center", color: C.tinte }}>
        <thead><tr style={{ background: C.sand }}>{["A", "B", ""].map((h, i) => <th key={i} style={{ padding: 8, fontSize: 14 }}>{i < 2 ? h : <M t={`A ${VERKN[op].tex} B`} />}</th>)}</tr></thead>
        <tbody>
          {reihen.map(([a, b], i) => {
            const w = VERKN[op].f(a, b);
            return (
              <tr key={i} onClick={() => setZeile(i)} style={{ cursor: "pointer", borderTop: `1px solid ${C.linie}`, background: zeile === i ? `${C.flaggold}26` : "transparent" }} data-zeile={i}>
                <td style={{ padding: 8, fontWeight: 700 }}>{wf(a)}</td>
                <td style={{ padding: 8, fontWeight: 700 }}>{wf(b)}</td>
                <td style={{ padding: 8, fontWeight: 800, color: w ? GRUEN : C.signal }}>{wf(w)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
  );
  const beispiel = <p style={{ margin: "10px 2px 0", fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>{zw(BEISPIEL[op][0], BEISPIEL[op][1])}</p>;
  const versprechen = op === "folgt" && zeile >= 2 && <p style={{ margin: "6px 2px 0", fontSize: 13.5, color: C.see, fontWeight: 600, lineHeight: 1.6 }}>{zw("Ist A falsch, ist das Versprechen nicht gebrochen – A ⇒ B ist dann wahr, egal was B ist.", "If A is false, the promise isn't broken – A ⇒ B is then true, whatever B is.")}</p>;
  if (desktop) {
    return <LaborFlaeche titel={titel} aufforderung={auff} links={<>{wahl}{beispiel}</>} bild={tafel} bildStil={{ padding: "8px 12px" }} rechts={versprechen} />;
  }
  return (
    <Labor titel={titel} aufforderung={auff}>
      {wahl}
      {tafel}
      {beispiel}
      {versprechen}
    </Labor>
  );
}

function KapitelAussagen({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Wann ist ein Satz wahr – und wann eine Verknüpfung?", "When is a sentence true – and when is a compound?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("„Konstanz liegt am Bodensee.“ – wahr. „7 ist gerade.“ – falsch. Solche Sätze heißen Aussagen: Sie sind entweder wahr oder falsch. „Wie spät ist es?“ oder „Mach die Tür zu!“ sind keine Aussagen.", "“Konstanz is on Lake Constance.” – true. “7 is even.” – false. Such sentences are called statements: they are either true or false. “What time is it?” or “Close the door!” are not statements.")}</Absatz>
          <Absatz>{zw("Aussagen kann man verbinden – mit „und“, „oder“, „nicht“, „wenn …, dann“. Fast wie im Alltag. Nur beim „oder“ ist die Mathematik großzügiger: Beides zusammen ist auch erlaubt.", "Statements can be combined – with “and”, “or”, “not”, “if …, then”. Almost like in everyday life. Only “or” is more generous in maths: both together is allowed too.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={["\\neg A", "A \\land B", "A \\lor B", "A \\Rightarrow B", "A \\Leftrightarrow B"]} />
          <Absatz>{zw("¬A (nicht A) dreht den Wahrheitswert um. A ∧ B (und) ist nur wahr, wenn beide wahr sind. A ∨ B (oder) ist wahr, wenn mindestens eine wahr ist. A ⇒ B (wenn A, dann B) ist nur falsch, wenn A wahr und B falsch ist. A ⇔ B ist wahr, wenn beide denselben Wahrheitswert haben.", "¬A (not A) flips the truth value. A ∧ B (and) is only true if both are true. A ∨ B (or) is true if at least one is true. A ⇒ B (if A then B) is only false if A is true and B is false. A ⇔ B is true if both have the same truth value.")}</Absatz>
          <Absatz>{zw("Achtung: $x + 1 = 5$ ist noch keine Aussage, sondern eine Aussageform – erst wenn du für x eine Zahl einsetzt, wird sie wahr oder falsch.", "Careful: $x + 1 = 5$ is not yet a statement but an open sentence – only when you substitute a number for x does it become true or false.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Mit Wahrheitstafeln beweist man Gesetze der Logik: Zwei Ausdrücke sind gleichwertig, wenn ihre Spalten übereinstimmen. So zeigt man die Regeln von De Morgan und die Kontraposition:", "Truth tables prove laws of logic: two expressions are equivalent if their columns agree. That's how you show De Morgan's laws and the contrapositive:")}</Absatz>
          <FormelBlock t={["\\neg(A \\land B) \\Leftrightarrow \\neg A \\lor \\neg B", "\\neg(A \\lor B) \\Leftrightarrow \\neg A \\land \\neg B", "(A \\Rightarrow B) \\Leftrightarrow (\\neg B \\Rightarrow \\neg A)"]} />
          <Absatz>{zw("Ein Ausdruck, der in jeder Zeile wahr ist, heißt Tautologie – etwa $A \\lor \\neg A$. Und warum ist A ⇒ B wahr, wenn A falsch ist? Weil „wenn …, dann“ nur ein Versprechen für den Fall A ist. Tritt A nicht ein, wurde nichts versprochen – also auch nichts gebrochen.", "An expression that is true in every row is a tautology – e.g. $A \\lor \\neg A$. And why is A ⇒ B true when A is false? Because “if …, then” only promises something for the case A. If A doesn't happen, nothing was promised – so nothing was broken.")}</Absatz>
        </>}
      />
      <TafelLabor />
      <Merke farbe={C.see}><MS s={zw("∧ nur wahr, wenn beide wahr. ∨ wahr, wenn mindestens eine wahr. ⇒ nur falsch bei „wahr ⇒ falsch“. ⇔ wahr bei gleichen Wahrheitswerten.", "∧ only true if both are true. ∨ true if at least one is true. ⇒ only false for “true ⇒ false”. ⇔ true for equal truth values.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Aussagen auswerten", "Evaluate statements")}</UebenKopf>
      {ueben(ML_KAPITEL_ARTEN.au)}
    </>
  );
}

/* ============================================================
   KAPITEL 5 · FOLGERN UND BEWEISEN
   ============================================================ */
const FOLGER_EIGENSCHAFTEN = ["gerade", "ungerade", "prim", "v3", "v4", "v6", "t24", "quad"];
function FolgernLabor() {
  const [a, setA] = useState("v6"), [b, setB] = useState("v3");
  const g1 = gegenbeispiel(a, b), g2 = gegenbeispiel(b, a);
  const bis = 40;
  const desktop = useDesktop();
  const titel = zw("Labor: Folgerung prüfen", "Lab: check an implication"), auff = zw("Wähle A und B. Rot markiert Gegenbeispiele zu A ⇒ B: Zahlen mit A, aber ohne B.", "Choose A and B. Red marks counterexamples to A ⇒ B: numbers with A but without B.");
  const wahlA = <Schalter optionen={FOLGER_EIGENSCHAFTEN.map((e) => [e, pName(e)])} wert={a} setWert={setA} label="A" />;
  const wahlB = <Schalter optionen={FOLGER_EIGENSCHAFTEN.map((e) => [e, pName(e)])} wert={b} setWert={setB} farbe={C.gold} label="B" />;
  const feld = <Zahlenfeld bis={bis} ist={P[a].f} rot={(n) => P[a].f(n) && !P[b].f(n)} />;
  const auswertung = (
    <>
      <div style={{ display: "grid", gap: 8, marginTop: desktop ? 0 : 12 }}>
        {[[a, b, g1], [b, a, g2]].map(([x, y, g], i) => (
          <div key={i} style={{ padding: "10px 12px", borderRadius: 12, background: g === null ? "#E6F6EF" : "#FCEFE8", color: g === null ? GRUEN : C.signal, fontSize: 14, lineHeight: 1.55, fontWeight: 600 }}>
            <MS s={zw(`„Wenn ${P[x].wenn}, dann ${P[y].dann}.“`, `“If ${P[x].en}, then ${P[y].en}.”`)} /> {g === null ? zw("– wahr (kein Gegenbeispiel bis 400).", "– true (no counterexample up to 400).") : zw(`– falsch, z. B. ${g}.`, `– false, e.g. ${g}.`)}
          </div>
        ))}
      </div>
      <p style={{ margin: "10px 2px 0", fontSize: 13.5, color: C.tinte, lineHeight: 1.6 }}>
        {g1 === null && g2 === null ? zw("A ist notwendig und hinreichend für B: A ⇔ B.", "A is necessary and sufficient for B: A ⇔ B.")
          : g1 === null ? zw("A ist hinreichend für B (A reicht schon), aber nicht notwendig.", "A is sufficient for B (A is enough), but not necessary.")
            : g2 === null ? zw("A ist notwendig für B (ohne A kein B), aber nicht hinreichend.", "A is necessary for B (no B without A), but not sufficient.")
              : zw("A ist für B weder notwendig noch hinreichend.", "A is neither necessary nor sufficient for B.")}
      </p>
    </>
  );
  const fussnote = <p style={{ margin: "4px 2px 0", fontSize: 12, color: C.grau }}>{zw("Blau: Zahlen mit Eigenschaft A (1 bis 40). Ein Zahlenfeld beweist nichts – aber ein rotes Feld widerlegt.", "Blue: numbers with property A (1 to 40). A grid proves nothing – but a red square disproves.")}</p>;
  if (desktop) {
    return (
      <LaborFlaeche titel={titel} aufforderung={auff}
        links={auswertung}
        bild={<div style={{ marginTop: -10 }}>{feld}{fussnote}</div>}
        rechts={<Werkzeugleiste gruppen={[{ titel: zw("Eigenschaft A", "Property A"), inhalt: wahlA }, { titel: zw("Eigenschaft B", "Property B"), inhalt: wahlB }]} />} />
    );
  }
  return (
    <Labor titel={titel} aufforderung={auff}>
      <p style={{ ...kicker, color: C.see, marginBottom: 4 }}>A</p>
      {wahlA}
      <p style={{ ...kicker, color: C.gold, margin: "10px 0 4px" }}>B</p>
      {wahlB}
      {feld}
      {auswertung}
      {fussnote}
    </Labor>
  );
}

function KapitelFolgern({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Was folgt woraus – und wie beweist man es?", "What follows from what – and how do you prove it?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("„Wenn es regnet, ist die Straße nass.“ Stimmt. Aber gilt auch umgekehrt: „Wenn die Straße nass ist, regnet es“? Nein – vielleicht war es der Rasensprenger. Eine Folgerung umzudrehen ist einer der häufigsten Denkfehler.", "“If it rains, the street is wet.” True. But is the reverse true: “If the street is wet, it's raining”? No – maybe it was the sprinkler. Reversing an implication is one of the most common reasoning errors.")}</Absatz>
          <Absatz>{zw("Und: Um „immer“ zu widerlegen, reicht ein einziges Gegenbeispiel. „Alle Primzahlen sind ungerade“ ist falsch – wegen der 2.", "And: to disprove “always”, a single counterexample is enough. “All primes are odd” is false – because of 2.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={[zw("A \\Rightarrow B: \\text{ A hinreichend für B}", "A \\Rightarrow B: \\text{ A sufficient for B}"), zw("B \\Rightarrow A: \\text{ A notwendig für B}", "B \\Rightarrow A: \\text{ A necessary for B}")]} />
          <Absatz>{zw("Die Umkehrung von A ⇒ B ist B ⇒ A – sie muss neu geprüft werden. Gilt beides, schreibt man A ⇔ B. Beispiel: „durch 4 teilbar ⇒ gerade“ ist wahr, die Umkehrung nicht (6).", "The converse of A ⇒ B is B ⇒ A – it has to be checked again. If both hold, write A ⇔ B. Example: “divisible by 4 ⇒ even” is true, the converse is not (6).")}</Absatz>
          <Absatz>{zw("Quantoren: ∀ heißt „für alle“, ∃ heißt „es gibt (mindestens) ein“. Beim Verneinen tauschen sie: ¬(∀x: A(x)) ⇔ ∃x: ¬A(x). „Nicht alle sind pünktlich“ heißt „mindestens einer ist unpünktlich“ – nicht „keiner ist pünktlich“.", "Quantifiers: ∀ means “for all”, ∃ means “there exists (at least) one”. Negating swaps them: ¬(∀x: A(x)) ⇔ ∃x: ¬A(x). “Not everyone is on time” means “at least one is late” – not “nobody is on time”.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Vier Beweisarten, die du immer wieder brauchst:", "Four kinds of proof you will need again and again:")}</Absatz>
          <ul style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: 15, color: C.grau, lineHeight: 1.8 }}>
            <li><MS s={zw("Direkt: Die Summe zweier gerader Zahlen ist gerade, denn $2a + 2b = 2(a + b)$.", "Direct: the sum of two even numbers is even, since $2a + 2b = 2(a + b)$.")} /></li>
            <li><MS s={zw("Kontraposition: „$n^2$ gerade ⇒ n gerade“ zeigt man als „n ungerade ⇒ $n^2$ ungerade“: $(2k + 1)^2 = 2(2k^2 + 2k) + 1$.", "Contrapositive: “$n^2$ even ⇒ n even” is shown as “n odd ⇒ $n^2$ odd”: $(2k + 1)^2 = 2(2k^2 + 2k) + 1$.")} /></li>
            <li>{zw("Widerspruch: das Gegenteil annehmen und zu etwas Unmöglichem rechnen – wie beim Beweis, dass √2 irrational ist.", "Contradiction: assume the opposite and calculate until something impossible appears – like the proof that √2 is irrational.")}</li>
            <li>{zw("Gegenbeispiel: widerlegt jede Allaussage mit einem einzigen Fall.", "Counterexample: disproves any universal statement with a single case.")}</li>
          </ul>
        </>}
      />
      <FolgernLabor />
      <Merke farbe={C.see}><MS s={zw("A ⇒ B: A ist hinreichend, B ist notwendig. Die Umkehrung B ⇒ A muss eigens geprüft werden. Gleichwertig zu A ⇒ B ist nur die Kontraposition ¬B ⇒ ¬A.", "A ⇒ B: A is sufficient, B is necessary. The converse B ⇒ A must be checked separately. Only the contrapositive ¬B ⇒ ¬A is equivalent to A ⇒ B.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Folgern, verneinen, widerlegen", "Infer, negate, disprove")}</UebenKopf>
      {ueben(ML_KAPITEL_ARTEN.fo)}
    </>
  );
}

/* ============================================================
   KAPITEL 6 · ALLES GEMISCHT
   ============================================================ */
function KapitelMix({ nr, von, gehe }) {
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Alles gemischt", "Everything mixed")}</Leitfrage>
      <Absatz>{zw("Mengen und Logik sind das Werkzeug, mit dem die ganze Mathematik aufgeschrieben wird: Lösungsmengen, Definitionsbereiche, Beweise. Hier kommt alles durcheinander.", "Sets and logic are the tool all of mathematics is written with: solution sets, domains, proofs. Here everything comes mixed.")}</Absatz>
      <div style={{ ...karte, marginTop: 6 }}>
        <p style={kicker}>{zw("Spickzettel", "Cheat sheet")}</p>
        <div style={{ display: "grid", gap: 8, fontSize: 15, color: C.tinte }}>
          <M t="A \subseteq B \Leftrightarrow (x \in A \Rightarrow x \in B)" />
          <M t="|A \cup B| = |A| + |B| − |A \cap B|" />
          <M t="[a; b],\; ]a; b[,\; [a; \infty[" />
          <M t="\neg(A \land B) \Leftrightarrow \neg A \lor \neg B" />
          <M t="\neg(\forall x: A(x)) \Leftrightarrow \exists x: \neg A(x)" />
        </div>
      </div>
      <Aufklapp titel={zw("Wo du das in der App brauchst", "Where you need this in the app")}>
        <p style={{ margin: 0 }}>{zw("Intervalle und Lösungsmengen bei Ungleichungen, Definitions- und Wertebereiche bei Funktionen, Widerspruchsbeweis bei den Zahlenräumen.", "Intervals and solution sets for inequalities, domains and ranges for functions, proof by contradiction for number spaces.")}</p>
        {gehe && <GrosserKnopf ghost onClick={() => gehe({ ansicht: "ungleichungen" })}>{zw("Ungleichungen und Beträge →", "Inequalities and absolute values →")}</GrosserKnopf>}
      </Aufklapp>
      <Trenner />
      <UebenKopf>{zw("Gemischtes Training", "Mixed training")}</UebenKopf>
      {ueben(Object.values(ML_KAPITEL_ARTEN).flat())}
    </>
  );
}

export function MengenLogik({ gehe }) {
  const KAPITEL = [
    ["mengen", zw("Mengen und Elemente", "Sets and elements"), KapitelMengen],
    ["operationen", zw("Mengen­operationen", "Set operations"), KapitelOperationen],
    ["intervalle", zw("Intervalle", "Intervals"), KapitelIntervalle],
    ["aussagen", zw("Aussagen und Verknüpfungen", "Statements and connectives"), KapitelAussagen],
    ["folgern", zw("Folgern und Beweisen", "Inference and proof"), KapitelFolgern],
    ["mix", zw("Alles gemischt", "All mixed"), (p) => <KapitelMix {...p} gehe={gehe} />],
  ];
  return (
    <LernwegSeite werkzeug="mengenlogik" speicher="matheplus-mengenlogik-kapitel" kapitel={KAPITEL}
      titel={zw("Mengen und Logik", "Sets and logic")}
      text={zw("Die Sprache der Mathematik: Mengen bilden und verknüpfen, Intervalle lesen, Aussagen verbinden, richtig folgern und mit einem Gegenbeispiel widerlegen.",
        "The language of mathematics: build and combine sets, read intervals, connect statements, infer correctly and disprove with a counterexample.")} />
  );
}
