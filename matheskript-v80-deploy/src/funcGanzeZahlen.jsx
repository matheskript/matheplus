/* ============================================================
   Unterstufe · Ganze und rationale Zahlen
   · Entdecken – Zahlengerade mit Pfeilmodell: Startzahl, Plus oder
     Minus, zweite Zahl; „minus eine negative Zahl“ wird sichtbar zu plus
   · Üben – Addieren, Subtrahieren, Multiplizieren, Dividieren,
     Vergleichen, Temperatur, Punkt vor Strich mit Vorzeichen,
     negative Brüche
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { GANZ_ARTEN, ganzAufgabe } from "./unterGen.js";
import { qNum } from "./rechnen2.js";
import { Merke, Regler, UebenRahmen, ZweiModi, ws, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { Arbeitsflaeche, BildKarte, Werkzeugleiste, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { ChipAuswahl, ErgebnisKarte, StellKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const mz = (v) => String(v).replace("-", "−");
const kl = (v) => (v < 0 ? `(${mz(v)})` : String(v));
const fr = (b) => `$${b.z < 0 ? "−" : ""}\\frac{${Math.abs(b.z)}}{${b.n}}$`;

export function Zahlengerade({ a, b, op = "+", lo = -15, hi = 15, hoehe = 110 }) {
  // Echte Pixel am Desktop (DESKTOP-STIL.md): gemessene Breite; Handy unverändert 330
  const [ref, breite] = useBreite();
  const desktop = useDesktop();
  const W = desktop && breite ? breite : 330, X = (v) => 15 + ((v - lo) / (hi - lo)) * (W - 30);
  const ziel = op === "+" ? a + b : a - b;
  const schritt = op === "+" ? b : -b;
  const y = desktop && breite ? Math.round(hoehe / 2) - 12 : 52;
  const gs = desktop && breite ? 12.5 : 11;   // Zahlen an der Achse
  return (
    <div ref={ref}><svg viewBox={`0 0 ${W} ${hoehe}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Zahlengerade mit Pfeil", "Number line with arrow")}>
      <defs><marker id="pfeilZG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.gruen} /></marker></defs>
      <line x1="10" y1={y + 18} x2={W - 10} y2={y + 18} stroke={C.tinte} strokeWidth="1.6" />
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={y + 14} x2={X(v)} y2={y + 22} stroke={v === 0 ? C.tinte : `${C.tinte}88`} strokeWidth={v === 0 ? 2 : 1} />
          {(v % 5 === 0) && <text x={X(v)} y={y + 36} textAnchor="middle" style={{ fontSize: gs, fill: C.grau, fontFamily: "inherit" }}>{mz(v)}</text>}
        </g>
      ))}
      <circle cx={X(a)} cy={y + 18} r="5" fill={C.see} />
      <text x={X(a)} y={y + 52} textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: C.see, fontFamily: "inherit" }}>{mz(a)}</text>
      {schritt !== 0 && <path d={`M ${X(a)} ${y + 8} Q ${(X(a) + X(ziel)) / 2} ${y - 28} ${X(ziel)} ${y + 8}`} fill="none" stroke={C.gruen} strokeWidth="2.4" markerEnd="url(#pfeilZG)" />}
      {schritt !== 0 && <text x={(X(a) + X(ziel)) / 2} y={y - 18} textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: C.gruen, fontFamily: "inherit" }}>{schritt > 0 ? `+${schritt}` : mz(schritt)}</text>}
      <circle cx={X(ziel)} cy={y + 18} r="5" fill={C.flaggold} stroke={C.seeTief} />
    </svg></div>
  );
}

function Entdecken() {
  const [a, setA] = useState(-3);
  const [b, setB] = useState(-5);
  const [op, setOp] = useState("−");
  const e = op === "+" ? a + b : a - b;
  const desktop = useDesktop();
  const rechnung = <>{mz(a)} {op} {kl(b)} = {mz(e)}</>;
  const merke = <Merke>{op === "−" && b < 0
    ? zw(`Minus eine negative Zahl: Der Pfeil zeigt nach rechts. ${mz(a)} − (${mz(b)}) ist dasselbe wie ${mz(a)} + ${-b}.`, `Minus a negative number: the arrow points right. ${mz(a)} − (${mz(b)}) is the same as ${mz(a)} + ${-b}.`)
    : zw("Plus einer positiven Zahl geht nach rechts, plus einer negativen nach links. Minus dreht die Richtung um.", "Plus a positive number goes right, plus a negative goes left. Minus reverses the direction.")}</Merke>;
  if (desktop) {
    return (
      <div style={{ marginTop: 16 }} data-ganz="breit">
        <Arbeitsflaeche
          links={<>
            <StellKarte titel={zw("Pfeilmodell", "Arrow model")} werte={[
              { name: zw("Start", "Start"), wert: a, setWert: setA, min: -10, max: 10, format: mz, regler: true },
              { name: zw("Zahl", "Number"), wert: b, setWert: setB, min: -10, max: 10, format: mz, farbe: C.gruen, regler: true },
            ]} />
            <ErgebnisKarte titel={zw("Ergebnis", "Result")}>
              <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: C.tinte }}>{rechnung}</div>
            </ErgebnisKarte>
          </>}
          rechts={<>
            <BildKarte style={{ padding: "8px 10px" }}><Zahlengerade a={a} b={b} op={op === "+" ? "+" : "-"} hoehe={236} /></BildKarte>
            <Werkzeugleiste gruppen={[{ titel: zw("Rechenart", "Operation"), inhalt: <ChipAuswahl optionen={[["+", "plus"], ["−", "minus"]]} wert={op} setWert={setOp} label={zw("Rechenart", "Operation")} /> }]} />
          </>} />
        <div style={{ marginTop: 8 }}>{merke}</div>
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Pfeilmodell", "Arrow model")}</p>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name={zw("Start", "Start")} wert={a} setWert={setA} min={-10} max={10} schritt={1} format={mz} breiteName={56} />
        <Regler name={zw("Zahl", "Number")} wert={b} setWert={setB} min={-10} max={10} schritt={1} format={mz} breiteName={56} farbe={C.gruen} />
      </div>
      <div style={{ marginTop: 10 }}><Auswahl optionen={[["+", "plus"], ["−", "minus"]]} wert={op} setWert={setOp} label={zw("Rechenart", "Operation")} /></div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}><Zahlengerade a={a} b={b} op={op === "+" ? "+" : "-"} /></div>
      <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, margin: "12px 0 4px" }}>{rechnung}</div>
      {merke}
    </div>
  );
}

const TITEL = { plus: ["Addieren", "Adding"], minus: ["Subtrahieren", "Subtracting"], mal: ["Multiplizieren", "Multiplying"], geteilt: ["Dividieren", "Dividing"], vergleich: ["Vergleichen", "Comparing"], temperatur: ["Temperatur", "Temperature"], klammer: ["Punkt vor Strich", "Order of operations"], rational: ["Negative Brüche", "Negative fractions"] };
const neue = (art) => ({ id: ++zaehler, ...ganzAufgabe(art) });

function schritte(g) {
  switch (g.art) {
    case "plus": return [zs("gz-p", zw("Ergebnis", "Result"), `${mz(g.a)} + ${kl(g.b)} =`, g.wert, zw("Rechne aus.", "Calculate."), { fehler: [{ wert: -(g.wert), text: zw("Vorzeichen vertauscht. Welcher Betrag ist größer? Dessen Vorzeichen bekommt das Ergebnis.", "Sign swapped. Which absolute value is larger? The result gets its sign.") }, { wert: g.a - g.b, text: zw("Plus, nicht minus.", "Plus, not minus.") }].filter((f) => f.wert !== g.wert), hinweis: zw("Auf der Zahlengeraden: bei positiver Zahl nach rechts, bei negativer nach links.", "On the number line: right for positive, left for negative."), erkl: `${mz(g.a)} + ${kl(g.b)} = ${mz(g.wert)}` })];
    case "minus": return [
      ws("gz-m1", zw("Umschreiben", "Rewrite"), zw(`Wie kannst du ${mz(g.a)} − ${kl(g.b)} als Addition schreiben?`, `How can you write ${mz(g.a)} − ${kl(g.b)} as an addition?`), [["a", `${mz(g.a)} + ${kl(-g.b)}`], ["b", `${mz(g.a)} + ${kl(g.b)}`], ["c", `${mz(-g.a)} + ${kl(g.b)}`]], "a", { fehler: [{ wahl: "b", text: zw("Minus heißt: Gegenzahl addieren.", "Minus means: add the opposite number.") }, { wahl: "c", text: zw("Die erste Zahl bleibt, wie sie ist.", "The first number stays as it is.") }], hinweis: zw("a − b = a + (−b)", "a − b = a + (−b)"), erkl: `${mz(g.a)} + ${kl(-g.b)}` }),
      zs("gz-m2", zw("Ergebnis", "Result"), "=", g.wert, zw("Rechne aus.", "Calculate."), { fehler: [{ wert: g.a + g.b, text: zw("Die Gegenzahl fehlt: minus minus wird plus.", "The opposite is missing: minus minus becomes plus.") }].filter((f) => f.wert !== g.wert), erkl: mz(g.wert) }),
    ];
    case "mal": case "geteilt": {
      const s = g.art === "mal" ? "·" : ":";
      return [
        ws("gz-v", zw("Vorzeichen", "Sign"), zw("Welches Vorzeichen hat das Ergebnis?", "What sign does the result have?"), [["p", zw("positiv", "positive")], ["n", zw("negativ", "negative")]], g.wert > 0 ? "p" : "n", { fehler: [{ wahl: g.wert > 0 ? "n" : "p", text: zw("Gleiche Vorzeichen → plus, verschiedene Vorzeichen → minus.", "Same signs → plus, different signs → minus.") }], hinweis: zw("Minus mal minus ergibt plus.", "Minus times minus gives plus."), erkl: g.wert > 0 ? zw("gleiche Vorzeichen → positiv", "same signs → positive") : zw("verschiedene Vorzeichen → negativ", "different signs → negative") }),
        zs("gz-e", zw("Ergebnis", "Result"), `${mz(g.a)} ${s} ${kl(g.b)} =`, g.wert, zw("Rechne aus.", "Calculate."), { fehler: [{ wert: -g.wert, text: zw("Betrag stimmt, Vorzeichen nicht.", "The size is right, the sign isn't.") }], erkl: mz(g.wert) }),
      ];
    }
    case "vergleich": return [ws("gz-c", zw("Vergleichen", "Compare"), zw("Welche Zahl ist größer?", "Which number is larger?"), [["a", mz(g.a)], ["b", mz(g.b)]], g.groesser, { fehler: [{ wahl: g.groesser === "a" ? "b" : "a", text: zw("Auf der Zahlengeraden liegt die größere Zahl weiter rechts. −2 ist größer als −7.", "On the number line the larger number lies further right. −2 is larger than −7.") }], hinweis: zw("Weiter rechts = größer.", "Further right = larger."), erkl: `${mz(Math.max(g.a, g.b))} > ${mz(Math.min(g.a, g.b))}` })];
    case "temperatur": return [zs("gz-t", zw("Temperatur", "Temperature"), zw("Temperatur =", "Temperature ="), g.wert, zw("Wie warm ist es danach?", "How warm is it afterwards?"), { einheit: "°C", fehler: [{ wert: g.start - g.d, text: zw("Steigen heißt plus, fallen heißt minus.", "Rising means plus, falling means minus.") }].filter((f) => f.wert !== g.wert), hinweis: `${mz(g.start)} + ${kl(g.d)}`, erkl: `${mz(g.start)} + ${kl(g.d)} = ${mz(g.wert)} °C` })];
    case "klammer": return [
      zs("gz-k1", zw("Punktrechnung zuerst", "Multiplication first"), `${kl(g.b)} · ${kl(g.c)} =`, g.b * g.c, zw("Rechne zuerst das Produkt.", "First calculate the product."), { fehler: [{ wert: -g.b * g.c, text: zw("Vorzeichenregel: gleiche Vorzeichen → plus.", "Sign rule: same signs → plus.") }], erkl: mz(g.b * g.c) }),
      zs("gz-k2", zw("Ergebnis", "Result"), `${mz(g.a)} − ${kl(g.b * g.c)} =`, g.wert, zw("Jetzt die Subtraktion.", "Now the subtraction."), { fehler: [{ wert: (g.a - g.b) * g.c, text: zw("Punkt vor Strich: erst malnehmen.", "Multiplication before subtraction.") }, { wert: g.a + g.b * g.c, text: zw("Minus eine Zahl – nicht plus.", "Minus a number – not plus.") }].filter((f) => f.wert !== g.wert), erkl: mz(g.wert) }),
    ];
    default: return [zs("gz-r", zw("Ergebnis", "Result"), `${fr(g.a)} ${g.op} ${g.b.z < 0 ? `(${fr(g.b)})` : fr(g.b)} =`, qNum(g.e), zw("Rechne aus und kürze vollständig. Gib den Bruch als −3/4 ein.", "Calculate and simplify fully. Enter the fraction as −3/4."), { gekuerzt: true, wertText: g.e.n === 1 ? mz(g.e.z) : fr(g.e), breite: 120, hinweis: g.op === "·" ? zw("Zähler mal Zähler, Nenner mal Nenner, Vorzeichenregel.", "Numerator times numerator, denominator times denominator, sign rule.") : zw("Hauptnenner bilden, Vorzeichen beachten.", "Find the common denominator, watch the signs."), erkl: `= ${g.e.n === 1 ? mz(g.e.z) : fr(g.e)}` })];
  }
}

function text(g) {
  switch (g.art) {
    case "vergleich": return zw(`Vergleiche ${mz(g.a)} und ${mz(g.b)}.`, `Compare ${mz(g.a)} and ${mz(g.b)}.`);
    case "temperatur": return zw(`Morgens sind es ${mz(g.start)} °C. Bis mittags ${g.d > 0 ? `steigt die Temperatur um ${g.d}` : `fällt die Temperatur um ${-g.d}`} Grad.`, `In the morning it is ${mz(g.start)} °C. By noon the temperature ${g.d > 0 ? `rises by ${g.d}` : `falls by ${-g.d}`} degrees.`);
    case "klammer": return zw(`Berechne ${mz(g.a)} − ${kl(g.b)} · ${kl(g.c)}.`, `Calculate ${mz(g.a)} − ${kl(g.b)} · ${kl(g.c)}.`);
    case "rational": return <>{zw("Berechne: ", "Calculate: ")}<M t={`${g.a.z < 0 ? "−" : ""}\\frac{${Math.abs(g.a.z)}}{${g.a.n}} ${g.op} ${g.b.z < 0 ? "(−" : ""}\\frac{${Math.abs(g.b.z)}}{${g.b.n}}${g.b.z < 0 ? ")" : ""}`} /></>;
    default: return zw(`Berechne ${mz(g.a)} ${{ plus: "+", minus: "−", mal: "·", geteilt: ":" }[g.art]} ${kl(g.b)}.`, `Calculate ${mz(g.a)} ${{ plus: "+", minus: "−", mal: "·", geteilt: ":" }[g.art]} ${kl(g.b)}.`);
  }
}
const skizze = (g) => (g.art === "plus" || g.art === "temperatur" ? <Zahlengerade a={g.art === "plus" ? g.a : g.start} b={g.art === "plus" ? 0 : 0} op="+" hoehe={100} /> : null);

const hilfe = (g) => hilfeKontext({
  id: `ganz-${g.art}`, aufgabe: "ganze Zahlen negative Zahlen Vorzeichen Zahlengerade minus mal minus rationale Zahlen",
  verstehen: [zw("Negative Zahlen liegen links von 0. Weiter rechts = größer.", "Negative numbers lie left of 0. Further right = larger.")],
  ansatz: [zw("Minus = Gegenzahl addieren. Mal/geteilt: erst Vorzeichen, dann Betrag.", "Minus = add the opposite. Times/divided: sign first, then size.")],
  regel: [zw("Gleiche Vorzeichen → plus, verschiedene → minus.", "Same signs → plus, different → minus.")],
  pruefen: [zw("Zeichne den Pfeil auf der Zahlengeraden.", "Draw the arrow on the number line.")],
});

export function GanzeZahlen() {
  return (
    <ZweiModi werkzeug="ganzezahlen" animationen={werkzeugAnimationen("ganzezahlen")} titel={zw("Ganze und rationale Zahlen", "Integers and rational numbers")}
      text={zw("Negative Zahlen auf der Zahlengeraden, Rechnen mit Vorzeichen, Vorzeichenregeln für mal und geteilt – bis zu negativen Brüchen.", "Negative numbers on the number line, calculating with signs, sign rules for multiplication and division – up to negative fractions.")}
      kurz={<p style={{ margin: 0 }}>{zw("a − (−b) = a + b · (+)·(+) = + · (−)·(−) = + · (+)·(−) = − · Bei Punkt vor Strich gelten die Vorzeichenregeln zuerst für die Produkte.", "a − (−b) = a + b · (+)·(+) = + · (−)·(−) = + · (+)·(−) = − · With order of operations, apply the sign rules to the products first.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={GANZ_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
