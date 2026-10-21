/* ============================================================
   Funktionen: Grundlagen (Bereich „Analysis“, Station „Kennen“)
   Lernweg in sieben Kapiteln, jede Einführung in drei Stufen
   (Einstieg · Standard · Vertiefung), dazu ein Labor und Übungen:
     1 Funktionsbegriff          – Zuordnung, Funktionswert, Urbild
     2 Potenzfunktionen          – xⁿ mit ganzen Hochzahlen
     3 Wurzelfunktionen          – √x, x^(1/n), Wurzelgleichungen
     4 Umkehrfunktion            – spiegeln an y = x, D und W tauschen
     5 Verkettung                – f(g(x)), innen und außen
     6 Definitions- und Wertebereich – eigenes Training
     7 Alles gemischt
   Mathematik und Aufgaben: funktionenGen.js, mengenRechnen.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { GrosserKnopf, MS, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, FunktionsBild, zt } from "./ui3.jsx";
import { KompaktCtx, Merke, Regler } from "./geoUi.jsx";
import { Absatz, Aufforderung, Einfuehrung, FormelBlock, Labor, Leitfrage, LernwegSeite, MengenStrahl, Schalter, Trenner, UebenDaten, UebenKopf } from "./lernwegUi.jsx";
import { Arbeitsflaeche, ErgebnisReihe, FeinKarte, Kicker, Werkzeugleiste, useDesktop } from "./arbeitsflaeche.jsx";
import { R, iv, linTex, mengeTex, ohne, zTex } from "./mengenRechnen.js";
import { AUSSEN, FK_KAPITEL_ARTEN, FK_TITEL, INNEN, fkAufgabe } from "./funktionenGen.js";

const GRUEN = "#0F7A4D";
const hilfe = (au) => hilfeKontext({
  id: `funktionen-${au.art}`, aufgabe: "Funktion Definitionsbereich Wertebereich Potenzfunktion Wurzelfunktion Umkehrfunktion Verkettung",
  verstehen: [zw("Welche Funktion ist gegeben, und was ist gefragt: ein Wert, ein Bereich oder ein Term?", "Which function is given, and what is asked: a value, a set or a formula?")],
  ansatz: [
    zw("D: verbotene Stellen suchen – Nenner = 0, unter der Wurzel < 0, im ln ≤ 0.", "D: look for forbidden values – denominator = 0, under the root < 0, inside ln ≤ 0."),
    zw("W: Scheitel, Startpunkt oder Asymptote finden; Öffnung bzw. Richtung beachten.", "W: find the vertex, starting point or asymptote; watch the opening or direction."),
    zw("Umkehrfunktion: y = f(x) nach x auflösen, dann x und y tauschen.", "Inverse: solve y = f(x) for x, then swap x and y."),
    zw("Verkettung f(g(x)): erst g, dann f.", "Composition f(g(x)): first g, then f."),
  ],
  regel: ["x^{p/q} = ⁿ√… : √(xᵖ) mit n = q", "D(f⁻¹) = W(f), W(f⁻¹) = D(f)", "(f ∘ g)(x) = f(g(x))"],
  pruefen: [zw("Setze einen Wert ein, der knapp innerhalb bzw. außerhalb deines Bereichs liegt.", "Substitute a value just inside or just outside your set.")],
});
const ueben = (arten) => <UebenDaten titel={FK_TITEL} arten={arten} erzeuge={(a) => fkAufgabe(a)} hilfe={hilfe} />;
const zeile = { fontSize: 17, color: C.tinte, overflowX: "auto" };

/* Desktop-Labor (DESKTOP-STIL.md): feine Karte; links die Einstellungen (Regler zweizeilig wie in EntdeckenZweispaltig),
   rechts das Schaubild, darunter die Werkzeugleiste; unten optional Ergebnisse über die volle Breite. */
function LaborBreit({ titel, aufforderung, links, rechts, leiste, unten }) {
  return (
    <FeinKarte data-labor data-labor-breit style={{ marginTop: 14 }}>
      {titel && <Kicker style={{ color: C.gruenDunkel }}>{titel}</Kicker>}
      {aufforderung && <Aufforderung>{aufforderung}</Aufforderung>}
      <Arbeitsflaeche style={{ marginTop: 6 }}
        links={<KompaktCtx.Provider value={true}><div style={{ display: "grid", gap: 12, minWidth: 0 }}>{links}</div></KompaktCtx.Provider>}
        rechts={<>{rechts}{leiste && <Werkzeugleiste gruppen={leiste} />}</>} />
      {unten && <div style={{ marginTop: 18 }}>{unten}</div>}
    </FeinKarte>
  );
}
/* Kleine getönte Ergebniskachel (links in der Arbeitsfläche) */
const ergebnisKachel = { background: C.sand, borderRadius: 12, padding: "10px 12px", display: "grid", gap: 4, fontSize: 15, color: C.tinte, overflowX: "auto" };

/* ============================================================
   LABOR: Funktion mit D und W (Kapitel 1 und 6)
   ============================================================ */
const BEISPIELE = [
  { id: "q", tex: "x^2 − 1", f: (x) => x * x - 1, D: R(), W: iv(-1, Infinity, true) },
  { id: "w", tex: "\\sqrt{x − 2}", f: (x) => Math.sqrt(x - 2), D: iv(2, Infinity, true), W: iv(0, Infinity, true) },
  { id: "b", tex: "\\frac{1}{x − 1}", f: (x) => 1 / (x - 1), D: ohne(1), W: ohne(0) },
  { id: "l", tex: "\\ln(x + 3)", f: (x) => Math.log(x + 3), D: iv(-3, Infinity, false), W: R() },
  { id: "k", tex: "\\sqrt{9 − x^2}", f: (x) => Math.sqrt(9 - x * x), D: iv(-3, 3, true, true), W: iv(0, 3, true, true) },
  { id: "e", tex: "e^x − 2", f: (x) => Math.exp(x) - 2, D: R(), W: iv(-2, Infinity, false) },
  { id: "s", tex: "2\\sin(x) + 1", f: (x) => 2 * Math.sin(x) + 1, D: R(), W: iv(-1, 3, true, true) },
  { id: "r", tex: "\\frac{2}{x^2}", f: (x) => 2 / (x * x), D: ohne(0), W: iv(0, Infinity, false) },
];
function FunktionsLabor({ start = "w" }) {
  const [id, setId] = useState(start), [x, setX] = useState(3);
  const B = BEISPIELE.find((b) => b.id === id);
  const y = B.f(x);
  const ok = Number.isFinite(y);
  const desktop = useDesktop();
  const titel = zw("Labor: Definitions- und Wertebereich", "Lab: domain and range");
  const aufforderung = zw("Wähle eine Funktion und schiebe x – wo ist f nicht definiert?", "Pick a function and slide x – where is f undefined?");
  const wahl = <Schalter optionen={BEISPIELE.map((b) => [b.id, `$${b.tex}$`])} wert={id} setWert={setId} label={zw("Funktion", "Function")} />;
  const bild = <FunktionsBild x0={-8} x1={8} y0={-5} y1={6} kurven={[{ f: B.f, farbe: C.see }]} punkte={ok ? [{ x, y, farbe: C.flaggold }] : []} senkrechte={[{ x, farbe: ok ? `${C.flaggold}` : C.signal }]} />;
  const strahl = <MengenStrahl lo={-8} hi={8} mengen={[{ menge: B.D, farbe: C.see, name: "D" }, { menge: B.W, farbe: C.gold, name: "W" }]} />;
  const regler = <Regler name="x" wert={x} setWert={setX} min={-8} max={8} schritt={0.5} format={(v) => zt(v)} farbe={C.flaggold} />;
  const wertBox = (
      <div style={{ marginTop: desktop ? 0 : 8, padding: "8px 12px", borderRadius: 12, background: ok ? "#E6F6EF" : "#FCEFE8", color: ok ? GRUEN : C.signal, fontSize: 15, fontWeight: 600 }}>
        {ok ? <M t={`f(${zTex(x)}) \\approx ${zt(y, 3)}`} /> : <>{<M t={`f(${zTex(x)})`} />} {zw("ist nicht definiert – x liegt nicht in D.", "is undefined – x is not in D.")}</>}
      </div>
  );
  if (desktop) {
    return (
      <LaborBreit titel={titel} aufforderung={aufforderung}
        links={<>
          <div><Kicker style={{ marginBottom: 6 }}>{zw("Funktion", "Function")}</Kicker>{wahl}</div>
          {regler}
          {wertBox}
          <div style={ergebnisKachel}>
            <M t={`f(x) = ${B.tex}`} />
            <M t={`D = ${mengeTex(B.D)}`} />
            <M t={`W = ${mengeTex(B.W)}`} />
          </div>
        </>}
        rechts={<>{bild}<div style={{ maxWidth: 432, width: "100%", alignSelf: "center" }}>{strahl}</div></>} />
    );
  }
  return (
    <Labor titel={zw("Labor: Definitions- und Wertebereich", "Lab: domain and range")} aufforderung={zw("Wähle eine Funktion und schiebe x – wo ist f nicht definiert?", "Pick a function and slide x – where is f undefined?")}>
      {wahl}
      <div style={{ marginTop: 10 }}>
        {bild}
      </div>
      {strahl}
      {regler}
      {wertBox}
      <div style={{ ...zeile, display: "grid", gap: 4, marginTop: 10 }}>
        <M t={`f(x) = ${B.tex}`} />
        <M t={`D = ${mengeTex(B.D)}, \\quad W = ${mengeTex(B.W)}`} />
      </div>
    </Labor>
  );
}

function KapitelBegriff({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Was macht eine Zuordnung zur Funktion?", "What makes an assignment a function?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Eine Funktion ist wie ein Getränkeautomat: Du drückst eine Taste (x) und bekommst genau ein Getränk (y). Würde dieselbe Taste mal Cola und mal Wasser liefern, wäre der Automat kaputt – und es wäre keine Funktion.", "A function is like a vending machine: you press a button (x) and get exactly one drink (y). If the same button gave cola one time and water the next, the machine would be broken – and it wouldn't be a function.")}</Absatz>
          <Absatz>{zw("Verschiedene Tasten dürfen aber dasselbe Getränk liefern. Und manche Tasten funktionieren gar nicht – die liegen außerhalb des Definitionsbereichs. Alle Getränke, die überhaupt herauskommen, bilden den Wertebereich.", "Different buttons may give the same drink, though. And some buttons don't work at all – those are outside the domain. All drinks that can come out form the range.")}</Absatz>
        </>}
        standard={<>
          <Absatz>{zw("Eine Funktion f ordnet jedem x aus der Definitionsmenge D genau ein y = f(x) zu. Man schreibt $f: x \\mapsto f(x)$. Der Wertebereich W ist die Menge aller Funktionswerte.", "A function f assigns to each x in the domain D exactly one y = f(x). We write $f: x \\mapsto f(x)$. The range W is the set of all function values.")}</Absatz>
          <FormelBlock t={[zw("\\text{Funktionswert: } f(2) = 2^2 − 1 = 3", "\\text{value: } f(2) = 2^2 − 1 = 3"), zw("\\text{Urbild: } f(x) = 8 \\Rightarrow x = \\pm 3", "\\text{pre-image: } f(x) = 8 \\Rightarrow x = \\pm 3")]} />
          <Absatz>{zw("Am Graphen erkennst du eine Funktion mit dem Senkrechtentest: Jede senkrechte Gerade trifft den Graphen höchstens einmal. Ein Kreis besteht den Test nicht.", "You recognise a function's graph with the vertical line test: every vertical line meets it at most once. A circle fails the test.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Genau genommen besteht eine Funktion aus drei Teilen: Definitionsmenge, Zielmenge und Zuordnungsvorschrift. $f(x) = x^2$ auf ℝ ist eine andere Funktion als $f(x) = x^2$ auf $[0; \\infty[$ – die zweite ist umkehrbar, die erste nicht.", "Strictly speaking a function has three parts: domain, codomain and rule. $f(x) = x^2$ on ℝ is a different function from $f(x) = x^2$ on $[0; \\infty[$ – the second is invertible, the first is not.")}</Absatz>
          <Absatz>{zw("Gibt die Aufgabe keinen Definitionsbereich an, meint man den maximalen: alle reellen x, für die der Term einen Sinn ergibt. Drei Gefahren gibt es in der Schule: Teilen durch 0, Wurzel aus Negativem, Logarithmus von Zahlen ≤ 0.", "If no domain is given, the maximal one is meant: all real x for which the term makes sense. School has three dangers: division by 0, root of a negative, logarithm of numbers ≤ 0.")}</Absatz>
          <Absatz>{zw("Ist jeder Wert aus W nur einmal getroffen, heißt f injektiv – genau dann gibt es eine Umkehrfunktion (Kapitel 4).", "If every value in W is hit only once, f is called injective – exactly then there is an inverse function (chapter 4).")}</Absatz>
        </>}
      />
      <FunktionsLabor start="w" />
      <Merke farbe={C.see}><MS s={zw("Funktion: jedem x aus D genau ein y. D = erlaubte x-Werte, W = vorkommende y-Werte. Verboten: Nenner 0, Wurzel aus Negativem, ln von Zahlen ≤ 0.", "Function: exactly one y for each x in D. D = allowed x-values, W = y-values that occur. Forbidden: denominator 0, root of a negative, ln of numbers ≤ 0.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Funktionen erkennen und auswerten", "Recognise and evaluate functions")}</UebenKopf>
      {ueben(FK_KAPITEL_ARTEN.fb)}
    </>
  );
}

/* ============================================================
   KAPITEL 2 · POTENZFUNKTIONEN
   ============================================================ */
function PotenzLabor() {
  const [n, setN] = useState(3), [a, setA] = useState(1);
  const f = (x) => a * x ** n;
  const gerade = n % 2 === 0;
  const D = n >= 0 ? R() : ohne(0);
  let W;
  if (n === 0) W = { art: "pkt", pkt: [a] };
  else if (n > 0) W = !gerade ? R() : a > 0 ? iv(0, Infinity, true) : iv(-Infinity, 0, false, true);
  else W = !gerade ? ohne(0) : a > 0 ? iv(0, Infinity, false) : iv(-Infinity, 0, false, false);
  const unendlich = (s) => (s > 0 ? "+\\infty" : "−\\infty");
  const verhalten = n > 0 ? `x \\to +\\infty: ${unendlich(a)}, \\quad x \\to −\\infty: ${unendlich(gerade ? a : -a)}` : n < 0 ? zw("x \\to \\pm\\infty: f(x) \\to 0", "x \\to \\pm\\infty: f(x) \\to 0") : `f(x) = ${zTex(a)}`;
  const fTex = n === 0 ? zTex(a) : n === 1 ? linTex(a, 0) : `${a === 1 ? "" : a === -1 ? "−" : zTex(a)}x^{${zTex(n)}}`;
  const desktop = useDesktop();
  const reglerN = <Regler name="n" wert={n} setWert={setN} min={-4} max={6} schritt={1} format={(v) => zt(v)} />;
  const aWahl = <Schalter optionen={[[1, "1"], [2, "2"], [0.5, "$\\frac{1}{2}$"], [-1, "−1"]]} wert={a} setWert={setA} label="a" />;
  const bild = (
      <FunktionsBild x0={-3} x1={3} y0={-6} y1={6} kurven={[{ f, farbe: C.see }]}
        punkte={n !== 0 ? [{ x: 1, y: f(1), farbe: C.gold, name: `(1|${zt(f(1))})` }, { x: -1, y: f(-1), farbe: C.gold }] : []} />
  );
  const eigenschaften = [
          [zw("Symmetrie", "Symmetry"), n === 0 || gerade ? zw("zur y-Achse", "about the y-axis") : zw("zum Ursprung", "about the origin")],
          [zw("Definitionsbereich", "Domain"), <M key="d" t={`D = ${mengeTex(D)}`} />],
          [zw("Wertebereich", "Range"), <M key="w" t={`W = ${mengeTex(W)}`} />],
          [zw("Verhalten", "End behaviour"), <M key="v" t={verhalten} />],
  ];
  const kachel = ([t, w]) => (
          <div key={t} style={{ background: C.sand, borderRadius: 12, padding: "8px 10px" }}>
            <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: C.grau }}>{t}</p>
            <div style={{ fontSize: 14, color: C.tinte, fontWeight: 600, overflowX: "auto" }}>{w}</div>
          </div>
  );
  if (desktop) {
    return (
      <LaborBreit titel={zw("Labor: Potenzfunktionen", "Lab: power functions")} aufforderung={zw("Ändere die Hochzahl n: gerade und ungerade, positiv und negativ.", "Change the exponent n: even and odd, positive and negative.")}
        links={<>
          {reglerN}
          <div>
            <Kicker style={{ marginBottom: 6 }}>{zw("Faktor a", "Factor a")}</Kicker>
            {aWahl}
          </div>
          <div style={{ ...ergebnisKachel, fontWeight: 700, fontSize: 17 }}><M t={`f(x) = ${fTex}`} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>{eigenschaften.slice(0, 3).map(kachel)}</div>
          {kachel(eigenschaften[3])}
        </>}
        rechts={bild} />
    );
  }
  return (
    <Labor titel={zw("Labor: Potenzfunktionen", "Lab: power functions")} aufforderung={zw("Ändere die Hochzahl n: gerade und ungerade, positiv und negativ.", "Change the exponent n: even and odd, positive and negative.")}>
      {reglerN}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.see }}>a</span>
        {aWahl}
      </div>
      <div style={{ ...zeile, textAlign: "center", fontWeight: 700, margin: "10px 0 6px" }}><M t={`f(x) = ${fTex}`} /></div>
      {bild}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 10 }}>
        {eigenschaften.map(kachel)}
      </div>
    </Labor>
  );
}

function KapitelPotenz({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Was verrät die Hochzahl über den Graphen?", "What does the exponent tell you about the graph?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("x², x³, x⁴ … – bei allen wird x mehrmals mit sich selbst malgenommen. Bei geraden Hochzahlen kommt immer etwas Positives heraus, denn Minus mal Minus ist Plus: Der Graph sieht aus wie ein U. Bei ungeraden Hochzahlen bleibt das Vorzeichen erhalten: Der Graph kommt von unten links und geht nach oben rechts.", "x², x³, x⁴ … – x is multiplied by itself several times. With even exponents the result is always positive, since minus times minus is plus: the graph looks like a U. With odd exponents the sign stays: the graph comes from bottom left and goes to top right.")}</Absatz>
          <Absatz>{zw("Alle diese Graphen gehen durch (1|1). Negative Hochzahlen bedeuten „1 durch …“: $x^{−1} = \\frac{1}{x}$. Dann wird der Graph zur Hyperbel mit einer Lücke bei x = 0.", "All these graphs pass through (1|1). Negative exponents mean “1 over …”: $x^{−1} = \\frac{1}{x}$. Then the graph becomes a hyperbola with a gap at x = 0.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={["f(x) = a \\cdot x^n,\\; n \\in \\mathbb{Z}"]} />
          <Absatz>{zw("n gerade: achsensymmetrisch zur y-Achse, $f(−x) = f(x)$. n ungerade: punktsymmetrisch zum Ursprung, $f(−x) = −f(x)$. Für n > 0 ist D = ℝ, für n < 0 ist D = ℝ \\ {0} mit den Achsen als Asymptoten.", "n even: symmetric about the y-axis, $f(−x) = f(x)$. n odd: point-symmetric about the origin, $f(−x) = −f(x)$. For n > 0, D = ℝ; for n < 0, D = ℝ \\ {0} with the axes as asymptotes.")}</Absatz>
          <Absatz>{zw("Der Faktor a streckt den Graphen und spiegelt ihn für a < 0 an der x-Achse. Verhalten im Unendlichen: Für n > 0 wächst |f(x)| über alle Grenzen – das Vorzeichen liest du an a und an „gerade/ungerade“ ab. Für n < 0 geht f(x) gegen 0.", "The factor a stretches the graph and reflects it in the x-axis for a < 0. End behaviour: for n > 0, |f(x)| grows without bound – read the sign from a and even/odd. For n < 0, f(x) goes to 0.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Warum hat $x^{−n}$ eine senkrechte Asymptote? Für x → 0 wird der Nenner $x^n$ beliebig klein, der Bruch $\\frac{1}{x^n}$ also beliebig groß. Bei geradem n kommt der Graph von beiden Seiten nach oben, bei ungeradem n springt das Vorzeichen.", "Why does $x^{−n}$ have a vertical asymptote? As x → 0, the denominator $x^n$ gets arbitrarily small, so the fraction $\\frac{1}{x^n}$ gets arbitrarily large. For even n the graph goes up on both sides; for odd n the sign jumps.")}</Absatz>
          <Absatz>{zw("Zwischen 0 und 1 ist eine höhere Potenz kleiner ($0{,}5^4 < 0{,}5^2$), außerhalb größer. Deshalb schneiden sich alle Graphen $x^n$ mit n > 0 in (0|0) und (1|1) – und die geraden zusätzlich in (−1|1).", "Between 0 and 1 a higher power is smaller ($0.5^4 < 0.5^2$), outside it is larger. That's why all graphs $x^n$ with n > 0 meet at (0|0) and (1|1) – and the even ones also at (−1|1).")}</Absatz>
          <Absatz>{zw("Für rationale Hochzahlen wie $\\frac{1}{2}$ entstehen Wurzelfunktionen – das nächste Kapitel.", "Rational exponents like $\\frac{1}{2}$ give root functions – the next chapter.")}</Absatz>
        </>}
      />
      <PotenzLabor />
      <Merke farbe={C.see}><MS s={zw("Gerade Hochzahl: Symmetrie zur y-Achse, gleiche Richtung links und rechts. Ungerade: Symmetrie zum Ursprung, entgegengesetzte Richtungen. Negative Hochzahl: Hyperbel, D = ℝ \\ {0}, f(x) → 0 für x → ±∞.", "Even exponent: symmetric about the y-axis, same direction left and right. Odd: symmetric about the origin, opposite directions. Negative exponent: hyperbola, D = ℝ \\ {0}, f(x) → 0 as x → ±∞.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Potenzfunktionen untersuchen", "Investigate power functions")}</UebenKopf>
      {ueben(FK_KAPITEL_ARTEN.po)}
    </>
  );
}

/* ============================================================
   KAPITEL 3 · WURZELFUNKTIONEN
   ============================================================ */
function WurzelLabor() {
  const [a, setA] = useState(1), [b, setB] = useState(0), [c, setC] = useState(0), [spiegel, setSpiegel] = useState(true);
  const f = (x) => a * Math.sqrt(x - b) + c;
  const innen = b === 0 ? "x" : linTex(1, -b);
  const tex = `${a === 1 ? "" : a === -1 ? "−" : zTex(a)}\\sqrt{${innen}}${c > 0 ? ` + ${c}` : c < 0 ? ` − ${-c}` : ""}`;
  const kurven = [{ f, farbe: C.see }];
  if (spiegel) kurven.push({ f: (x) => x * x, farbe: C.gold, a: 0, b: 6, gestrichelt: true }, { f: (x) => x, farbe: C.hellgrau, breite: 1.2 });
  const desktop = useDesktop();
  const reglerA = <Regler name="a" wert={a} setWert={setA} min={-3} max={3} schritt={0.5} format={(v) => zt(v)} />;
  const reglerB = <Regler name="b" wert={b} setWert={setB} min={-5} max={5} schritt={1} format={(v) => zt(v)} farbe={C.gold} />;
  const reglerC = <Regler name="c" wert={c} setWert={setC} min={-4} max={4} schritt={1} format={(v) => zt(v)} farbe={C.smaragd} />;
  const spiegelWahl = <Schalter optionen={[[true, zw("mit x² und y = x", "with x² and y = x")], [false, zw("nur f", "only f")]]} wert={spiegel} setWert={setSpiegel} farbe={C.gold} label={zw("Spiegelung", "Reflection")} />;
  const bild = <FunktionsBild x0={-6} x1={9} y0={-5} y1={7} kurven={kurven} punkte={a !== 0 ? [{ x: b, y: c, farbe: C.flaggold, name: zw("Start", "start") }] : []} />;
  const dTex = `D = [${zTex(b)}; \\infty[`;
  const wTex = `W = ${a > 0 ? `[${zTex(c)}; \\infty[` : a < 0 ? `]−\\infty; ${zTex(c)}]` : `\\{${zTex(c)}\\}`}`;
  if (desktop) {
    return (
      <LaborBreit titel={zw("Labor: Wurzelfunktion", "Lab: root function")} aufforderung={zw("Verschiebe und strecke – und sieh, wie √x aus der halben Parabel entsteht.", "Shift and stretch – and see how √x arises from half a parabola.")}
        links={<>
          {reglerA}{reglerB}{reglerC}
          <div style={ergebnisKachel}>
            <span style={{ fontWeight: 700 }}><M t={`f(x) = ${tex}`} /></span>
            <M t={dTex} />
            <M t={wTex} />
          </div>
        </>}
        rechts={bild}
        leiste={[{ titel: zw("Spiegelung", "Reflection"), inhalt: spiegelWahl }]} />
    );
  }
  return (
    <Labor titel={zw("Labor: Wurzelfunktion", "Lab: root function")} aufforderung={zw("Verschiebe und strecke – und sieh, wie √x aus der halben Parabel entsteht.", "Shift and stretch – and see how √x arises from half a parabola.")}>
      <div style={{ display: "grid", gap: 8 }}>
        {reglerA}
        {reglerB}
        {reglerC}
        {spiegelWahl}
      </div>
      <div style={{ ...zeile, textAlign: "center", fontWeight: 700, margin: "10px 0 6px" }}><M t={`f(x) = ${tex}`} /></div>
      {bild}
      <div style={{ ...zeile, display: "grid", gap: 4, marginTop: 8 }}>
        <M t={dTex} />
        <M t={wTex} />
      </div>
    </Labor>
  );
}

function KapitelWurzel({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Wie macht man das Quadrieren rückgängig?", "How do you undo squaring?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Ein Quadrat hat 25 cm² Fläche. Wie lang ist eine Seite? 5 cm – das ist $\\sqrt{25}$. Die Wurzel beantwortet die Frage: Welche nicht-negative Zahl ergibt quadriert diese Zahl?", "A square has an area of 25 cm². How long is a side? 5 cm – that's $\\sqrt{25}$. The root answers: which non-negative number gives this number when squared?")}</Absatz>
          <Absatz>{zw("Weil kein Quadrat negativ ist, gibt es keine Wurzel aus negativen Zahlen. Darum beginnt der Graph von √x erst bei x = 0 und steigt dann immer langsamer an.", "Since no square is negative, there is no root of negative numbers. That's why the graph of √x only starts at x = 0 and then rises more and more slowly.")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={["\\sqrt{x} = x^{\\frac{1}{2}}", "\\sqrt[n]{x} = x^{\\frac{1}{n}}", "\\sqrt[q]{x^p} = x^{\\frac{p}{q}}"]} />
          <Absatz>{zw("$f(x) = a\\sqrt{x − b} + c$ beginnt im Startpunkt $(b \\mid c)$. Also $D = [b; \\infty[$, und W beginnt bei c – nach oben für a > 0, nach unten für a < 0.", "$f(x) = a\\sqrt{x − b} + c$ starts at $(b \\mid c)$. So $D = [b; \\infty[$, and W starts at c – upwards for a > 0, downwards for a < 0.")}</Absatz>
          <Absatz>{zw("Wurzelgleichungen löst du durch Quadrieren: $\\sqrt{x + 2} = 3$ ⇒ $x + 2 = 9$ ⇒ $x = 7$. Danach immer die Probe machen!", "Solve root equations by squaring: $\\sqrt{x + 2} = 3$ ⇒ $x + 2 = 9$ ⇒ $x = 7$. Always check afterwards!")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Quadrieren ist keine Äquivalenzumformung: Aus $a = b$ folgt $a^2 = b^2$, aber nicht umgekehrt. Deshalb kann beim Quadrieren eine Scheinlösung entstehen: $\\sqrt{x} = −2$ ⇒ $x = 4$, aber $\\sqrt{4} = 2 \\neq −2$. Die Probe ist Pflicht.", "Squaring is not an equivalence transformation: $a = b$ implies $a^2 = b^2$, but not the other way round. So squaring can create a false solution: $\\sqrt{x} = −2$ ⇒ $x = 4$, but $\\sqrt{4} = 2 \\neq −2$. Checking is a must.")}</Absatz>
          <Absatz>{zw("√x ist die Umkehrfunktion von x² auf [0; ∞[ – ihr Graph ist die an y = x gespiegelte halbe Parabel (Schalter im Labor). Und ungerade Wurzeln wie $\\sqrt[3]{x}$ gibt es auch für negative x, weil $x^3$ auf ganz ℝ umkehrbar ist: $\\sqrt[3]{−8} = −2$.", "√x is the inverse of x² on [0; ∞[ – its graph is half the parabola reflected in y = x (toggle in the lab). And odd roots like $\\sqrt[3]{x}$ exist for negative x too, since $x^3$ is invertible on all of ℝ: $\\sqrt[3]{−8} = −2$.")}</Absatz>
        </>}
      />
      <WurzelLabor />
      <Merke farbe={C.see}><MS s={zw("$x^{\\frac{p}{q}} = \\sqrt[q]{x^p}$: Nenner = Wurzel, Zähler = Hochzahl. $a\\sqrt{x − b} + c$: Start $(b \\mid c)$, $D = [b; \\infty[$. Nach dem Quadrieren immer die Probe.", "$x^{\\frac{p}{q}} = \\sqrt[q]{x^p}$: denominator = root, numerator = power. $a\\sqrt{x − b} + c$: start $(b \\mid c)$, $D = [b; \\infty[$. Always check after squaring.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Mit Wurzelfunktionen rechnen", "Calculate with root functions")}</UebenKopf>
      {ueben(FK_KAPITEL_ARTEN.wu)}
    </>
  );
}

/* ============================================================
   KAPITEL 4 · UMKEHRFUNKTION
   ============================================================ */
const UMK = [
  { id: "quad", tex: "x^2,\\; x \\ge 0", f: (x) => (x >= 0 ? x * x : NaN), g: (x) => Math.sqrt(x), gtex: "\\sqrt{x}" },
  { id: "kub", tex: "x^3", f: (x) => x ** 3, g: (x) => Math.cbrt(x), gtex: "\\sqrt[3]{x}" },
  { id: "exp", tex: "e^x", f: (x) => Math.exp(x), g: (x) => Math.log(x), gtex: "\\ln(x)" },
  { id: "zwei", tex: "2^x", f: (x) => 2 ** x, g: (x) => Math.log2(x), gtex: "\\log_2(x)" },
];
function UmkehrLabor() {
  const [art, setArt] = useState("lin"), [m, setMm] = useState(2), [c, setC] = useState(1), [x0, setX0] = useState(1);
  let f, g, fTex, gTex;
  if (art === "lin") {
    f = (x) => m * x + c; g = (x) => (x - c) / m;
    fTex = linTex(m, c); gTex = linTex(1 / m, -c / m);
  } else {
    const U = UMK.find((u) => u.id === art);
    f = U.f; g = U.g; fTex = U.tex; gTex = U.gtex;
  }
  const y0 = f(x0);
  const ok = Number.isFinite(y0);
  const desktop = useDesktop();
  const wahl = <Schalter optionen={[["lin", "$mx + c$"], ["quad", "$x^2, x \\ge 0$"], ["kub", "$x^3$"], ["exp", "$e^x$"], ["zwei", "$2^x$"]]} wert={art} setWert={(a) => { setArt(a); setX0(a === "quad" ? 1.5 : 1); }} label={zw("Funktion", "Function")} />;
  const linRegler = art === "lin" && (
        <div style={{ display: "grid", gap: desktop ? 12 : 8, marginTop: desktop ? 0 : 8 }}>
          <Regler name="m" wert={m} setWert={(v) => setMm(v === 0 ? 0.5 : v)} min={-3} max={3} schritt={0.5} format={(v) => zt(v)} />
          <Regler name="c" wert={c} setWert={setC} min={-4} max={4} schritt={1} format={(v) => zt(v)} farbe={C.smaragd} />
        </div>
  );
  const bild = (
      <FunktionsBild x0={-6} x1={6} gleicheEinheit kurven={[{ f: (x) => x, farbe: C.hellgrau, breite: 1.2 }, { f, farbe: C.see }, { f: g, farbe: C.gold, gestrichelt: true }]}
        punkte={ok ? [{ x: x0, y: y0, farbe: C.see, name: "P" }, { x: y0, y: x0, farbe: C.gold, name: "P'" }] : []} />
  );
  const pRegler = <Regler name={zw("x von P", "x of P")} wert={x0} setWert={setX0} min={art === "quad" ? 0 : -3} max={art === "exp" || art === "zwei" ? 1.6 : 2.5} schritt={0.1} format={(v) => zt(v, 1)} farbe={C.flaggold} breiteName={64} />;
  const formeln = (
    <>
        <span style={{ color: C.see }}><M t={`f(x) = ${fTex}`} /></span>
        <span style={{ color: C.gold }}><M t={`f^{−1}(x) = ${gTex}`} /></span>
        {ok && <span style={{ fontSize: 14 }}><M t={`P(${zt(x0, 2)} \\mid ${zt(y0, 2)}) \\;\\to\\; P'(${zt(y0, 2)} \\mid ${zt(x0, 2)})`} /></span>}
    </>
  );
  if (desktop) {
    return (
      <LaborBreit titel={zw("Labor: Spiegeln an y = x", "Lab: reflect in y = x")} aufforderung={zw("Bewege den Punkt P auf f. Sein Spiegelbild P' liegt auf f⁻¹ – x und y sind vertauscht.", "Move the point P on f. Its mirror image P' lies on f⁻¹ – x and y are swapped.")}
        links={<>
          <div><Kicker style={{ marginBottom: 6 }}>{zw("Funktion", "Function")}</Kicker>{wahl}</div>
          {linRegler}
          {pRegler}
          <div style={ergebnisKachel}>{formeln}</div>
        </>}
        rechts={bild} />
    );
  }
  return (
    <Labor titel={zw("Labor: Spiegeln an y = x", "Lab: reflect in y = x")} aufforderung={zw("Bewege den Punkt P auf f. Sein Spiegelbild P' liegt auf f⁻¹ – x und y sind vertauscht.", "Move the point P on f. Its mirror image P' lies on f⁻¹ – x and y are swapped.")}>
      {wahl}
      {linRegler}
      {bild}
      {pRegler}
      <div style={{ ...zeile, display: "grid", gap: 4, marginTop: 10 }}>
        {formeln}
      </div>
    </Labor>
  );
}

function KapitelUmkehr({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Kann man eine Funktion rückwärts laufen lassen?", "Can a function be run backwards?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Ein Taxi kostet 3 € Grundgebühr plus 2 € pro Kilometer. Die Funktion rechnet: Kilometer → Preis. Die Umkehrfunktion beantwortet die umgekehrte Frage: Ich habe 15 € bezahlt – wie weit bin ich gefahren? (15 − 3) : 2 = 6 km.", "A taxi costs a €3 base fee plus €2 per kilometre. The function calculates: kilometres → price. The inverse answers the opposite question: I paid €15 – how far did I go? (15 − 3) : 2 = 6 km.")}</Absatz>
          <Absatz>{zw("Rückwärts geht es aber nur, wenn jeder Preis zu genau einer Strecke gehört. Bei x² klappt das nicht: 9 kommt von 3 und von −3.", "Going backwards only works if each price belongs to exactly one distance. With x² it doesn't: 9 comes from 3 and from −3.")}</Absatz>
        </>}
        standard={<>
          <Absatz>{zw("So bestimmst du die Umkehrfunktion $f^{−1}$:", "This is how you find the inverse $f^{−1}$:")}</Absatz>
          <ol style={{ margin: "0 0 12px", paddingLeft: 22, fontSize: 15, color: C.grau, lineHeight: 1.8 }}>
            <li><MS s={zw("$y = f(x)$ nach x auflösen,", "solve $y = f(x)$ for x,")} /></li>
            <li>{zw("x und y vertauschen,", "swap x and y,")}</li>
            <li>{zw("D und W tauschen: D(f⁻¹) = W(f).", "swap D and W: D(f⁻¹) = W(f).")}</li>
          </ol>
          <Absatz>{zw("Beispiel: $y = 2x + 3$ ⇒ $x = \\frac{y − 3}{2}$ ⇒ $f^{−1}(x) = \\frac{1}{2}x − \\frac{3}{2}$. Der Graph von $f^{−1}$ ist der an der Winkelhalbierenden $y = x$ gespiegelte Graph von f.", "Example: $y = 2x + 3$ ⇒ $x = \\frac{y − 3}{2}$ ⇒ $f^{−1}(x) = \\frac{1}{2}x − \\frac{3}{2}$. The graph of $f^{−1}$ is the graph of f reflected in the bisector $y = x$.")}</Absatz>
          <Absatz>{zw("Umkehrbar ist f, wenn jede waagerechte Gerade den Graphen höchstens einmal trifft – zum Beispiel, wenn f streng monoton ist.", "f is invertible if every horizontal line meets the graph at most once – for example if f is strictly monotonic.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Umkehrfunktion heißt: $f^{−1}(f(x)) = x$ für alle x aus D und $f(f^{−1}(y)) = y$ für alle y aus W. So sind √x und x² (auf [0; ∞[) sowie ln x und eˣ Umkehrpaare.", "Inverse means: $f^{−1}(f(x)) = x$ for all x in D and $f(f^{−1}(y)) = y$ for all y in W. So √x and x² (on [0; ∞[) as well as ln x and eˣ are inverse pairs.")}</Absatz>
          <Absatz>{zw("Nicht umkehrbare Funktionen macht man umkehrbar, indem man D einschränkt: $x^2$ auf $[0; \\infty[$, $\\sin x$ auf $[−\\frac{\\pi}{2}; \\frac{\\pi}{2}]$ (daraus entsteht $\\sin^{−1}$ auf dem Taschenrechner).", "Non-invertible functions are made invertible by restricting D: $x^2$ on $[0; \\infty[$, $\\sin x$ on $[−\\frac{\\pi}{2}; \\frac{\\pi}{2}]$ (that's where $\\sin^{−1}$ on the calculator comes from).")}</Absatz>
          <Absatz>{zw("Für die Ableitung gilt: Spiegeln vertauscht Δx und Δy, also hat $f^{−1}$ im Spiegelpunkt die Steigung $\\frac{1}{f'(x)}$ – genau so leitet man $(\\ln x)' = \\frac{1}{x}$ her.", "For the derivative: reflection swaps Δx and Δy, so $f^{−1}$ has slope $\\frac{1}{f'(x)}$ at the mirror point – exactly how $(\\ln x)' = \\frac{1}{x}$ is derived.")}</Absatz>
        </>}
      />
      <UmkehrLabor />
      <Merke farbe={C.see}><MS s={zw("Nach x auflösen, x und y tauschen. Graph: an y = x spiegeln. $D(f^{−1}) = W(f)$, $W(f^{−1}) = D(f)$. Umkehrbar nur, wenn jeder y-Wert genau einmal vorkommt.", "Solve for x, swap x and y. Graph: reflect in y = x. $D(f^{−1}) = W(f)$, $W(f^{−1}) = D(f)$. Invertible only if every y-value occurs exactly once.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Umkehrfunktionen bestimmen", "Find inverse functions")}</UebenKopf>
      {ueben(FK_KAPITEL_ARTEN.uk)}
    </>
  );
}

/* ============================================================
   KAPITEL 5 · VERKETTUNG
   ============================================================ */
const A_WAHL = ["quad", "wurzel", "kehr", "exp", "betrag", "lin"];
const I_WAHL = ["lin", "quad1", "minus4", "doppel", "plus2"];
function VerkettungLabor() {
  const [a, setA] = useState("quad"), [g, setG] = useState("lin"), [x, setX] = useState(1), [rf, setRf] = useState("fg");
  const F = AUSSEN[a], G = INNEN[g];
  const innen = rf === "fg" ? G.f : F.f, aussen = rf === "fg" ? F.f : G.f;
  const u = innen(x), w = aussen(u);
  const fmt = (v) => (Number.isFinite(v) ? zt(v, 3) : zw("n. d.", "undef."));
  const fx = F.tex("x");
  const term = rf === "fg" ? F.tex(G.tex) : G.tex.replace(/x/g, /^[a-z0-9]+$/i.test(fx) ? fx : `(${fx})`);
  const Kasten = ({ t, farbe }) => <div style={{ minWidth: 0, padding: "8px 10px", borderRadius: 12, background: `${farbe}14`, border: `1.5px solid ${farbe}55`, textAlign: "center", fontSize: 14, fontWeight: 700, color: C.tinte, overflowX: "auto" }}>{t}</div>;
  const desktop = useDesktop();
  const fWahl = <Schalter optionen={A_WAHL.map((k) => [k, `$${AUSSEN[k].tex("x")}$`])} wert={a} setWert={setA} label="f" />;
  const gWahl = <Schalter optionen={I_WAHL.map((k) => [k, `$${INNEN[k].tex}$`])} wert={g} setWert={setG} farbe={C.gold} label="g" />;
  const rfWahl = <Schalter optionen={[["fg", "$f \\,∘\\, g$"], ["gf", "$g \\,∘\\, f$"]]} wert={rf} setWert={setRf} farbe={C.smaragd} label={zw("Reihenfolge", "Order")} />;
  const maschine = (
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: 6, marginTop: desktop ? 0 : 12 }}>
        <Kasten t={<>x = {zt(x)}</>} farbe={C.grau} />
        <span aria-hidden="true" style={{ color: C.grau }}>→</span>
        <Kasten t={<>{rf === "fg" ? "g" : "f"}: {fmt(u)}</>} farbe={rf === "fg" ? C.gold : C.see} />
        <span aria-hidden="true" style={{ color: C.grau }}>→</span>
        <Kasten t={<>{rf === "fg" ? "f" : "g"}: {fmt(w)}</>} farbe={rf === "fg" ? C.see : C.gold} />
      </div>
  );
  const xRegler = <Regler name="x" wert={x} setWert={setX} min={-4} max={4} schritt={0.5} format={(v) => zt(v)} farbe={C.flaggold} />;
  const termZeile = <M t={`(${rf === "fg" ? "f \\,∘\\, g" : "g \\,∘\\, f"})(x) = ${term}`} />;
  const bild = (
      <FunktionsBild x0={-5} x1={5} y0={-4} y1={8} kurven={[{ f: (t) => F.f(G.f(t)), farbe: C.see, blass: rf !== "fg" }, { f: (t) => G.f(F.f(t)), farbe: C.gold, gestrichelt: true, blass: rf !== "gf" }]}
        punkte={Number.isFinite(w) ? [{ x, y: w, farbe: C.flaggold }] : []} />
  );
  const legende = zw("Blau: f ∘ g, gold gestrichelt: g ∘ f – meist zwei verschiedene Graphen.", "Blue: f ∘ g, gold dashed: g ∘ f – usually two different graphs.");
  if (desktop) {
    return (
      <LaborBreit titel={zw("Labor: Verkettungsmaschine", "Lab: composition machine")} aufforderung={zw("x läuft erst durch die innere, dann durch die äußere Maschine. Tausche die Reihenfolge!", "x first runs through the inner machine, then the outer one. Swap the order!")}
        links={<>
          <div><p style={{ ...kicker, color: C.see, marginBottom: 6 }}>f</p>{fWahl}</div>
          <div><p style={{ ...kicker, color: C.gold, marginBottom: 6 }}>g</p>{gWahl}</div>
          {xRegler}
          {maschine}
        </>}
        rechts={<>
          <div style={{ ...ergebnisKachel, fontWeight: 700, textAlign: "center" }}>{termZeile}</div>
          {bild}
          <p style={{ fontSize: 12.5, color: C.grau, margin: "-4px 2px 0" }}>{legende}</p>
        </>}
        leiste={[{ titel: zw("Reihenfolge", "Order"), inhalt: rfWahl }]} />
    );
  }
  return (
    <Labor titel={zw("Labor: Verkettungsmaschine", "Lab: composition machine")} aufforderung={zw("x läuft erst durch die innere, dann durch die äußere Maschine. Tausche die Reihenfolge!", "x first runs through the inner machine, then the outer one. Swap the order!")}>
      <p style={{ ...kicker, color: C.see, marginBottom: 4 }}>f</p>
      {fWahl}
      <p style={{ ...kicker, color: C.gold, margin: "10px 0 4px" }}>g</p>
      {gWahl}
      <div style={{ marginTop: 10 }}>{rfWahl}</div>
      {maschine}
      {xRegler}
      <div style={{ ...zeile, textAlign: "center", fontWeight: 700, margin: "8px 0" }}>{termZeile}</div>
      {bild}
      <p style={{ fontSize: 12.5, color: C.grau, margin: "6px 2px 0" }}>{legende}</p>
    </Labor>
  );
}

function KapitelVerkettung({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Was passiert, wenn man Funktionen hintereinanderschaltet?", "What happens when you chain functions?")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Eine Saftpresse und danach ein Mixer: Erst wird gepresst, dann gemixt. Die Reihenfolge zählt – erst mixen und dann pressen gibt etwas anderes. Genauso ist es mit Funktionen: Das Ergebnis der ersten Maschine wird in die zweite gesteckt.", "A juicer and then a blender: first pressing, then mixing. The order matters – blending first and then pressing gives something else. Functions work the same way: the output of the first machine goes into the second.")}</Absatz>
          <Absatz>{zw("Bei $\\sqrt{x^2 + 1}$ rechnest du zuerst $x^2 + 1$ (innen) und ziehst dann die Wurzel (außen).", "With $\\sqrt{x^2 + 1}$ you first calculate $x^2 + 1$ (inside) and then take the root (outside).")}</Absatz>
        </>}
        standard={<>
          <FormelBlock t={["(f \\,∘\\, g)(x) = f(g(x))"]} />
          <Absatz>{zw("Gelesen: „f nach g“. g ist die innere Funktion, f die äußere. Den Term erhältst du, indem du in f jedes x durch g(x) ersetzt: $f(x) = x^2$, $g(x) = 3x − 1$ ⇒ $f(g(x)) = (3x − 1)^2$, aber $g(f(x)) = 3x^2 − 1$.", "Read “f after g”. g is the inner function, f the outer one. You get the term by replacing each x in f by g(x): $f(x) = x^2$, $g(x) = 3x − 1$ ⇒ $f(g(x)) = (3x − 1)^2$, but $g(f(x)) = 3x^2 − 1$.")}</Absatz>
          <Absatz>{zw("Umgekehrt zerlegst du eine Funktion: Bei $e^{2x + 1}$ ist $g(x) = 2x + 1$ innen und $f(u) = e^u$ außen. Das brauchst du später für die Kettenregel.", "Conversely you decompose a function: in $e^{2x + 1}$, $g(x) = 2x + 1$ is inside and $f(u) = e^u$ outside. You'll need this later for the chain rule.")}</Absatz>
        </>}
        vertiefung={<>
          <Absatz>{zw("Der Definitionsbereich der Verkettung: x muss in D(g) liegen und g(x) in D(f). Beispiel $\\ln(x^2 − 4)$: $x^2 − 4 > 0$ ⇔ $x < −2 \\lor x > 2$ – eine quadratische Ungleichung!", "The domain of a composition: x must lie in D(g) and g(x) in D(f). Example $\\ln(x^2 − 4)$: $x^2 − 4 > 0$ ⇔ $x < −2 \\lor x > 2$ – a quadratic inequality!")}</Absatz>
          <Absatz>{zw("Verkettung ist assoziativ, $(f \\,∘\\, g) \\,∘\\, h = f \\,∘\\, (g \\,∘\\, h)$, aber nicht kommutativ. Eine Funktion und ihre Umkehrfunktion heben sich auf: $f \\,∘\\, f^{−1} = \\text{id}$. Und die Kettenregel sagt: $(f(g(x)))' = f'(g(x)) \\cdot g'(x)$ – äußere mal innere Ableitung.", "Composition is associative, $(f \\,∘\\, g) \\,∘\\, h = f \\,∘\\, (g \\,∘\\, h)$, but not commutative. A function and its inverse cancel: $f \\,∘\\, f^{−1} = \\text{id}$. And the chain rule says: $(f(g(x)))' = f'(g(x)) \\cdot g'(x)$ – outer times inner derivative.")}</Absatz>
        </>}
      />
      <VerkettungLabor />
      <Merke farbe={C.see}><MS s={zw("$(f \\,∘\\, g)(x) = f(g(x))$: erst g, dann f. In f jedes x durch g(x) ersetzen. Im Allgemeinen ist $f \\,∘\\, g \\neq g \\,∘\\, f$.", "$(f \\,∘\\, g)(x) = f(g(x))$: first g, then f. Replace each x in f by g(x). In general $f \\,∘\\, g \\neq g \\,∘\\, f$.")} /></Merke>
      <Trenner />
      <UebenKopf>{zw("Verketten und zerlegen", "Compose and decompose")}</UebenKopf>
      {ueben(FK_KAPITEL_ARTEN.vk)}
    </>
  );
}

/* ============================================================
   KAPITEL 6 · DEFINITIONS- UND WERTEBEREICH (eigenes Training)
   ============================================================ */
function DWStrategie() {
  const Z = ({ a, b }) => (
    <tr style={{ borderTop: `1px solid ${C.linie}` }}>
      <td style={{ padding: "8px 10px", fontSize: 15, whiteSpace: "nowrap" }}><M t={a} /></td>
      <td style={{ padding: "8px 10px", fontSize: 13.5, lineHeight: 1.5 }}><MS s={b} /></td>
    </tr>
  );
  return (
    <div style={{ ...karte, marginTop: 12, padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", color: C.tinte }}>
        <thead><tr style={{ background: C.sand }}><th colSpan={2} style={{ textAlign: "left", padding: "10px 10px", fontSize: 12, color: C.grau }}>{zw("Definitionsbereich: verbotene Stellen", "Domain: forbidden values")}</th></tr></thead>
        <tbody>
          <Z a="\frac{\ldots}{N(x)}" b={zw("Nenner $N(x) \\neq 0$", "denominator $N(x) \\neq 0$")} />
          <Z a="\sqrt{T(x)}" b={zw("Radikand $T(x) \\ge 0$", "radicand $T(x) \\ge 0$")} />
          <Z a="\ln(T(x))" b={zw("Argument $T(x) > 0$ (echt größer)", "argument $T(x) > 0$ (strictly)")} />
          <Z a="\frac{1}{\sqrt{T(x)}}" b={zw("beides zusammen: $T(x) > 0$", "both together: $T(x) > 0$")} />
        </tbody>
        <thead><tr style={{ background: C.sand }}><th colSpan={2} style={{ textAlign: "left", padding: "10px 10px", fontSize: 12, color: C.grau }}>{zw("Wertebereich: Wo beginnt und endet der Graph?", "Range: where does the graph start and end?")}</th></tr></thead>
        <tbody>
          <Z a="a(x − d)^2 + e" b={zw("Scheitel: $[e; \\infty[$ für a > 0, $]−\\infty; e]$ für a < 0", "vertex: $[e; \\infty[$ for a > 0, $]−\\infty; e]$ for a < 0")} />
          <Z a="a \cdot e^x + c" b={zw("Asymptote $y = c$, nie erreicht: offene Klammer", "asymptote $y = c$, never reached: open bracket")} />
          <Z a="a \sin(x) + d" b={zw("$[d − |a|; d + |a|]$", "$[d − |a|; d + |a|]$")} />
          <Z a="\frac{c}{x − g} + d" b={zw("$\\mathbb{R} \\setminus \\{d\\}$ – der Bruch wird nie 0", "$\\mathbb{R} \\setminus \\{d\\}$ – the fraction is never 0")} />
        </tbody>
      </table>
    </div>
  );
}
function KapitelDW({ nr, von }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Definitions- und Wertebereich – sicher bestimmen", "Domain and range – determine them reliably")}</Leitfrage>
      <Einfuehrung
        einstieg={<>
          <Absatz>{zw("Der Definitionsbereich fragt: Welche x darf ich einsetzen? Der Wertebereich fragt: Welche y kommen heraus? Am Graphen: D ist der Schatten des Graphen auf der x-Achse, W sein Schatten auf der y-Achse.", "The domain asks: which x may I substitute? The range asks: which y come out? On the graph: D is the graph's shadow on the x-axis, W its shadow on the y-axis.")}</Absatz>
          <Absatz>{zw("Im Labor siehst du beide Schatten als farbige Streifen unter dem Graphen.", "In the lab you see both shadows as coloured bars under the graph.")}</Absatz>
        </>}
        standard={<>
          <Absatz>{zw("Für D suchst du die verbotenen Stellen und schreibst sie als Ungleichung bzw. Ausnahme. Für W suchst du den tiefsten oder höchsten Punkt (Scheitel, Startpunkt) oder eine Asymptote. Die Tabelle fasst die Fälle zusammen.", "For D, look for the forbidden values and write them as an inequality or exception. For W, find the lowest or highest point (vertex, starting point) or an asymptote. The table summarises the cases.")}</Absatz>
          <DWStrategie />
        </>}
        vertiefung={<>
          <Absatz>{zw("Verkettete Terme führen zu Ungleichungen – hier treffen sich die Werkzeuge: $\\sqrt{9 − x^2}$ verlangt $x^2 \\le 9$, also $D = [−3; 3]$ (quadratische Ungleichung). $\\ln(|x| − 1)$ verlangt $|x| > 1$ (Betragsungleichung).", "Composite terms lead to inequalities – here the tools meet: $\\sqrt{9 − x^2}$ requires $x^2 \\le 9$, so $D = [−3; 3]$ (quadratic inequality). $\\ln(|x| − 1)$ requires $|x| > 1$ (absolute value inequality).")}</Absatz>
          <Absatz>{zw("Den Wertebereich begründest du exakt mit zwei Teilen: (1) Abschätzung – alle Werte liegen im Bereich, z. B. $\\sqrt{\\ldots} \\ge 0$. (2) Ausschöpfung – jeder Wert wird erreicht: Löse $f(x) = y$ nach x auf und prüfe, ob das x in D liegt. Bei einer Asymptote fehlt genau ein Grenzwert.", "You justify the range exactly in two parts: (1) bound – all values lie in the set, e.g. $\\sqrt{\\ldots} \\ge 0$. (2) exhaustion – every value is reached: solve $f(x) = y$ for x and check that x lies in D. With an asymptote exactly one limit value is missing.")}</Absatz>
        </>}
      />
      <FunktionsLabor start="k" />
      <Trenner />
      <UebenKopf>{zw("Training: D und W", "Training: D and W")}</UebenKopf>
      <Absatz>{zw("Wähle oben einen Typ – nur Wurzeln, nur Brüche, nur Wertebereiche – oder trainiere gemischt.", "Choose a type above – only roots, only fractions, only ranges – or train mixed.")}</Absatz>
      {ueben(FK_KAPITEL_ARTEN.dw)}
    </>
  );
}

/* ============================================================
   KAPITEL 7 · ALLES GEMISCHT
   ============================================================ */
function KapitelMix({ nr, von, gehe }) {
  return (
    <>
      <Leitfrage nr={nr} von={von}>{zw("Alles gemischt", "Everything mixed")}</Leitfrage>
      <Absatz>{zw("Jetzt kommen alle Aufgabentypen durcheinander – vom Funktionswert bis zum Definitionsbereich einer Verkettung.", "Now all exercise types come mixed – from function values to the domain of a composition.")}</Absatz>
      <div style={{ ...karte, marginTop: 6 }}>
        <p style={kicker}>{zw("Spickzettel", "Cheat sheet")}</p>
        <div style={{ display: "grid", gap: 8, fontSize: 15, color: C.tinte }}>
          <M t={zw("f(−x) = f(x) \\;\\text{(gerade)}, \\quad f(−x) = −f(x) \\;\\text{(ungerade)}", "f(−x) = f(x) \\;\\text{(even)}, \\quad f(−x) = −f(x) \\;\\text{(odd)}")} />
          <M t="x^{\frac{p}{q}} = \sqrt[q]{x^p}" />
          <M t="D(f^{−1}) = W(f), \quad W(f^{−1}) = D(f)" />
          <M t="(f \,∘\, g)(x) = f(g(x))" />
        </div>
      </div>
      <Aufklapp titel={zw("Wie geht es weiter?", "What's next?")}>
        <p style={{ margin: 0 }}>{zw("Mit diesen Grundlagen bist du bereit für Ableitungen, Kurvendiskussion und Exponentialfunktionen.", "With these basics you're ready for derivatives, curve sketching and exponential functions.")}</p>
        {gehe && <GrosserKnopf ghost onClick={() => gehe({ ansicht: "ableitungstrainer" })}>{zw("Zum Ableitungstrainer →", "To the derivative trainer →")}</GrosserKnopf>}
      </Aufklapp>
      <Trenner />
      <UebenKopf>{zw("Gemischtes Training", "Mixed training")}</UebenKopf>
      {ueben(Object.values(FK_KAPITEL_ARTEN).flat())}
    </>
  );
}

export function FunktionenGrundlagen({ gehe }) {
  const KAPITEL = [
    ["begriff", zw("Funktions­begriff", "What is a function"), KapitelBegriff],
    ["potenz", zw("Potenz­funktionen", "Power functions"), KapitelPotenz],
    ["wurzel", zw("Wurzel­funktionen", "Root functions"), KapitelWurzel],
    ["umkehr", zw("Umkehr­funktion", "Inverse function"), KapitelUmkehr],
    ["verkettung", zw("Verkettung", "Composition"), KapitelVerkettung],
    ["dw", zw("D und W trainieren", "Train D and W"), KapitelDW],
    ["mix", zw("Alles gemischt", "All mixed"), (p) => <KapitelMix {...p} gehe={gehe} />],
  ];
  return (
    <LernwegSeite speicher="matheplus-funktionen-kapitel" kapitel={KAPITEL}
      titel={zw("Funktionen: Grundlagen", "Functions: the basics")}
      text={zw("Was eine Funktion ist, wie Potenz- und Wurzelfunktionen aussehen, wie man sie umkehrt und verkettet – und wie man Definitions- und Wertebereich sicher bestimmt.",
        "What a function is, what power and root functions look like, how to invert and compose them – and how to determine domain and range reliably.")} />
  );
}
