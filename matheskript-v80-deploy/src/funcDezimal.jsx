/* ============================================================
   Unterstufe · Dezimalzahlen
   · Entdecken – Stellenwerttafel: Zahl wählen, mit ·10 und :10 die
     Ziffern wandern lassen; Dezimalbruch und gekürzter Bruch dazu
   · Üben – Bruch → Dezimalzahl, Dezimalzahl → Bruch (gekürzt), Runden,
     Komma verschieben, Multiplizieren (Kommastellen zählen),
     Dividieren (Komma im Teiler weg), abbrechend oder periodisch
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { zt } from "./ui3.jsx";
import { ggT } from "./rechnen2.js";
import { DEZ_ARTEN, dezAufgabe } from "./unterGen.js";
import { Merke, UebenRahmen, ZweiModi, ws, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { Arbeitsflaeche, BildKarte, Werkzeugleiste, useDesktop } from "./arbeitsflaeche.jsx";
import { AktionsKnopf, ChipAuswahl, ErgebnisKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const z = (v) => zt(v, 6);
const SP = [["T", 1000], ["H", 100], ["Z", 10], ["E", 1], ["z", 0.1], ["h", 0.01], ["t", 0.001]];

function Tafel({ mill, gross }) {
  /* mill: Zahl in Tausendsteln (ganzzahlig); gross: Desktop-Bild (höhere Zellen, größere Ziffern) */
  const ziffer = (stelle) => Math.floor(mill / (stelle * 1000) + 1e-9) % 10;
  const fuehrend = (i) => SP.slice(0, i + 1).every(([, s]) => s > 1 && ziffer(s) === 0) && SP[i][1] > 1;
  if (gross) {
    return (
      <div data-dez-tafel style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6 }}>
        {SP.map(([n, s], i) => (
          <div key={n} style={{ textAlign: "center", borderRadius: 12, padding: "12px 0 14px", background: s >= 1 ? `${C.see}10` : `${C.flaggold}1C`, borderLeft: s === 0.1 ? `3px solid ${C.gruen}` : "none" }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: s >= 1 ? C.see : "#8A6A00" }}>{n}</div>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.25, color: fuehrend(i) ? C.hellgrau : C.tinte, transition: "all .25s", fontVariantNumeric: "tabular-nums" }}>{ziffer(s)}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
      {SP.map(([n, s], i) => (
        <div key={n} style={{ textAlign: "center", borderRadius: 10, padding: "6px 0", background: s >= 1 ? `${C.see}14` : `${C.flaggold}22`, borderLeft: s === 0.1 ? `3px solid ${C.gruen}` : "none" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: s >= 1 ? C.see : "#8A6A00" }}>{n}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: fuehrend(i) ? C.hellgrau : C.tinte, transition: "all .25s" }}>{ziffer(s)}</div>
        </div>
      ))}
    </div>
  );
}

function Entdecken() {
  const START = [[3750, "3,75"], [125, "0,125"], [42500, "42,5"], [8, "0,008"]];
  const [mill, setMill] = useState(3750);
  const g = ggT(mill, 1000) || 1;
  const fehlerGross = mill * 10 >= 10000000, fehlerKlein = mill % 10 !== 0;
  const desktop = useDesktop();
  const bruch = <M t={`${z(mill / 1000)} = \\frac{${mill}}{1000}${g > 1 && mill ? ` = \\frac{${mill / g}}{${1000 / g}}` : ""}`} />;
  const merkeText = zw("Mal 10: Jede Ziffer rückt eine Stelle nach links – das Komma scheinbar nach rechts. Geteilt durch 10: eine Stelle nach rechts. Die Ziffern selbst ändern sich nie.", "Times 10: every digit moves one place to the left – the decimal point seemingly to the right. Divided by 10: one place to the right. The digits themselves never change.");
  if (desktop) {
    return (
      <div style={{ marginTop: 16 }} data-dez="breit">
        <Arbeitsflaeche
          links={<>
            <ErgebnisKarte titel={zw("Komma verschieben", "Move the point")}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <AktionsKnopf haupt farbe={C.smaragd} onClick={() => setMill(mill * 10)} disabled={fehlerGross}>· 10</AktionsKnopf>
                <AktionsKnopf haupt farbe={C.smaragd} onClick={() => setMill(mill / 10)} disabled={fehlerKlein}>: 10</AktionsKnopf>
              </div>
            </ErgebnisKarte>
            <ErgebnisKarte titel={zw("Als Bruch", "As a fraction")}>
              <div style={{ fontSize: 19, textAlign: "center", overflowX: "auto" }}>{bruch}</div>
            </ErgebnisKarte>
          </>}
          rechts={<>
            <BildKarte style={{ padding: 16 }}><Tafel mill={mill} gross /></BildKarte>
            <Werkzeugleiste gruppen={[{ titel: zw("Startzahl", "Start number"), inhalt: <ChipAuswahl optionen={START.map(([m, t]) => [String(m), t])} wert={String(mill)} setWert={(v) => setMill(Number(v))} label={zw("Startzahl", "Start number")} /> }]} />
          </>} />
        <div style={{ marginTop: 8 }}><Merke>{merkeText}</Merke></div>
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Stellenwerttafel", "Place value chart")}</p>
      <Auswahl optionen={START.map(([m, t]) => [String(m), t])} wert={String(mill)} setWert={(v) => setMill(Number(v))} label={zw("Startzahl", "Start number")} />
      <div style={{ marginTop: 12 }}><Tafel mill={mill} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <GrosserKnopf onClick={() => setMill(mill * 10)} disabled={fehlerGross}>· 10</GrosserKnopf>
        <GrosserKnopf onClick={() => setMill(mill / 10)} disabled={fehlerKlein}>: 10</GrosserKnopf>
      </div>
      <div style={{ textAlign: "center", fontSize: 20, margin: "14px 0 4px" }}>{bruch}</div>
      <Merke>{merkeText}</Merke>
    </div>
  );
}

const TITEL = { bruchZuDez: ["Bruch → Dezimalzahl", "Fraction → decimal"], dezZuBruch: ["Dezimalzahl → Bruch", "Decimal → fraction"], runden: ["Runden", "Rounding"], zehner: ["Komma verschieben", "Moving the point"], mal: ["Multiplizieren", "Multiplying"], geteilt: ["Dividieren", "Dividing"], periodisch: ["Abbrechend oder periodisch?", "Terminating or recurring?"] };
const neue = (art) => ({ id: ++zaehler, ...dezAufgabe(art) });
const fr = (b) => `$\\frac{${b.z}}{${b.n}}$`;

function schritte(a) {
  switch (a.art) {
    case "bruchZuDez": return [
      zs("dz-e", zw("Erweitern", "Expand"), zw("Erweitern mit", "Expand by"), a.erweitert / a.b.n, zw(`Mit welcher Zahl erweiterst du ${fr(a.b)}, damit im Nenner ${a.erweitert} steht?`, `By what do you expand ${fr(a.b)} to get ${a.erweitert} in the denominator?`), { hinweis: `${a.erweitert} : ${a.b.n}`, erkl: `$\\frac{${a.b.z}}{${a.b.n}} = \\frac{${a.b.z * a.erweitert / a.b.n}}{${a.erweitert}}$` }),
      zs("dz-d", zw("Dezimalzahl", "Decimal"), `${fr(a.b)} =`, a.wert, zw("Schreibe als Dezimalzahl.", "Write as a decimal."), { fehler: [{ wert: a.b.n / a.b.z, text: zw("Zähler durch Nenner, nicht umgekehrt.", "Numerator divided by denominator, not the other way round.") }], hinweis: `${a.b.z} : ${a.b.n}`, erkl: `${a.b.z} : ${a.b.n} = ${z(a.wert)}` }),
    ];
    case "dezZuBruch": return [
      zs("dz-b1", zw("Zehnerbruch", "Decimal fraction"), zw("Nenner =", "Denominator ="), a.roh.n, zw(`Wie viele Nachkommastellen hat ${z(a.dez)}? Welcher Zehnernenner passt?`, `How many decimal places does ${z(a.dez)} have? Which power-of-ten denominator fits?`), { fehler: [{ wert: a.roh.n * 10, text: zw("Eine Nachkommastelle = Zehntel, zwei = Hundertstel, drei = Tausendstel.", "One decimal place = tenths, two = hundredths, three = thousandths.") }], hinweis: zw("Zähle die Stellen hinter dem Komma.", "Count the digits after the point."), erkl: `${z(a.dez)} = $\\frac{${a.roh.z}}{${a.roh.n}}$` }),
      zs("dz-b2", zw("Gekürzter Bruch", "Simplified fraction"), `${z(a.dez)} =`, a.dez, zw("Kürze vollständig. Gib den Bruch als 9/20 ein.", "Simplify fully. Enter the fraction as 9/20."), { gekuerzt: true, wertText: fr(a.b), breite: 120, hinweis: `ggT(${a.roh.z}; ${a.roh.n}) = ${ggT(a.roh.z, a.roh.n)}`, erkl: `$\\frac{${a.roh.z}}{${a.roh.n}} = ${a.b.n === 1 ? a.b.z : `\\frac{${a.b.z}}{${a.b.n}}`}$` }),
    ];
    case "runden": {
      const naechste = a.naechste;
      return [
        zs("dz-r1", zw("Entscheidende Ziffer", "Deciding digit"), zw("Ziffer =", "Digit ="), naechste, zw(`Welche Ziffer steht an der ${a.st + 1}. Nachkommastelle? Sie entscheidet.`, `Which digit is in decimal place ${a.st + 1}? It decides.`), { hinweis: zw("Die Ziffer direkt nach der Rundungsstelle.", "The digit right after the rounding place."), erkl: zw(`${naechste} → ${naechste >= 5 ? "aufrunden" : "abrunden"}`, `${naechste} → round ${naechste >= 5 ? "up" : "down"}`) }),
        zs("dz-r2", zw("Gerundet", "Rounded"), "≈", a.wert, zw(`Runde ${z(a.x)} auf ${a.st} Nachkommastelle${a.st > 1 ? "n" : ""}.`, `Round ${z(a.x)} to ${a.st} decimal place${a.st > 1 ? "s" : ""}.`), { fehler: [{ wert: Math.floor(a.x * 10 ** a.st) / 10 ** a.st, text: zw("Abgeschnitten statt gerundet – ab 5 wird aufgerundet.", "Truncated instead of rounded – from 5 you round up.") }].filter((f) => Math.abs(f.wert - a.wert) > 1e-12), hinweis: zw("Ab 5 aufrunden.", "From 5 round up."), erkl: `${z(a.x)} ≈ ${zt(a.wert, a.st)}`, wertText: zt(a.wert, a.st) }),
      ];
    }
    case "zehner": return [
      ws("dz-z1", zw("Richtung", "Direction"), zw(`Wohin wandert das Komma bei ${a.op}?`, `Where does the point move for ${a.op}?`), [["r", zw(`${a.stellen} Stelle(n) nach rechts`, `${a.stellen} place(s) right`)], ["l", zw(`${a.stellen} Stelle(n) nach links`, `${a.stellen} place(s) left`)]], a.rechts ? "r" : "l", { fehler: [{ wahl: a.rechts ? "l" : "r", text: a.rechts ? zw("Mal 10 macht die Zahl größer – Komma nach rechts.", "Times 10 makes the number bigger – point to the right.") : zw("Geteilt macht die Zahl kleiner – Komma nach links.", "Dividing makes the number smaller – point to the left.") }], hinweis: zw("So viele Stellen wie Nullen.", "As many places as zeros."), erkl: a.rechts ? zw("nach rechts", "to the right") : zw("nach links", "to the left") }),
      zs("dz-z2", zw("Ergebnis", "Result"), `${z(a.x)} ${a.op} =`, a.wert, zw("Rechne aus.", "Calculate."), { fehler: [{ wert: a.rechts ? a.x / 10 ** a.stellen : a.x * 10 ** a.stellen, text: zw("Falsche Richtung.", "Wrong direction.") }], erkl: `${z(a.x)} ${a.op} = ${z(a.wert)}` }),
    ];
    case "mal": return [
      zs("dz-m1", zw("Ohne Komma rechnen", "Calculate without the point"), zw("Produkt =", "Product ="), a.ohne, zw("Rechne zuerst so, als gäbe es kein Komma.", "First calculate as if there were no decimal point."), { hinweis: zw("Komma weglassen, normal multiplizieren.", "Leave out the point, multiply normally."), erkl: String(a.ohne) }),
      zs("dz-m2", zw("Kommastellen", "Decimal places"), zw("Stellen =", "Places ="), a.stellen, zw("Wie viele Nachkommastellen bekommt das Ergebnis?", "How many decimal places does the result get?"), { fehler: [{ wert: Math.max((String(a.a).split(".")[1] || "").length, (String(a.b).split(".")[1] || "").length), text: zw("Die Kommastellen beider Faktoren werden addiert.", "The decimal places of both factors are added.") }], hinweis: zw("Zähle in beiden Faktoren zusammen.", "Count in both factors together."), erkl: String(a.stellen) }),
      zs("dz-m3", zw("Ergebnis", "Result"), `${z(a.a)} · ${z(a.b)} =`, a.wert, zw("Setze das Komma.", "Place the point."), { erkl: z(a.wert) }),
    ];
    case "geteilt": return [
      zs("dz-g1", zw("Teiler ohne Komma", "Divisor without point"), zw("Mal", "Times"), 10 ** a.st, zw(`Mit welcher Zehnerpotenz musst du beide Zahlen malnehmen, damit ${z(a.b)} kein Komma mehr hat?`, `By which power of ten must you multiply both numbers so that ${z(a.b)} has no point?`), { hinweis: zw("So viele Nullen wie Nachkommastellen im Teiler.", "As many zeros as decimal places in the divisor."), erkl: `${z(a.a)} : ${z(a.b)} = ${z(a.a2)} : ${z(a.b2)}` }),
      zs("dz-g2", zw("Ergebnis", "Result"), `${z(a.a)} : ${z(a.b)} =`, a.wert, zw("Rechne aus.", "Calculate."), { fehler: [{ wert: a.a / a.b2, text: zw("Beide Zahlen müssen mit demselben Faktor multipliziert werden.", "Both numbers must be multiplied by the same factor.") }], hinweis: `${z(a.a2)} : ${z(a.b2)}`, erkl: `${z(a.a2)} : ${z(a.b2)} = ${z(a.wert)}` }),
    ];
    default: {
      const pf = []; let m = a.n; for (let d = 2; m > 1; d++) while (m % d === 0) { pf.push(d); m /= d; }
      return [
        zs("dz-p1", zw("Primfaktoren", "Prime factors"), zw("größter Primfaktor =", "largest prime factor ="), pf[pf.length - 1], zw(`Zerlege den Nenner ${a.n} in Primfaktoren. Welcher ist der größte?`, `Factor the denominator ${a.n}. What is the largest prime factor?`), { hinweis: `${a.n} = ${pf.join(" · ")}`, erkl: `${a.n} = ${pf.join(" · ")}` }),
        ws("dz-p2", zw("Entscheiden", "Decide"), zw(`Ist $\\frac{1}{${a.n}}$ als Dezimalzahl abbrechend oder periodisch?`, `Is $\\frac{1}{${a.n}}$ terminating or recurring as a decimal?`), [["ab", zw("abbrechend", "terminating")], ["per", zw("periodisch", "recurring")]], a.abbrechend ? "ab" : "per",
          { fehler: [{ wahl: a.abbrechend ? "per" : "ab", text: zw("Nur wenn der (gekürzte) Nenner ausschließlich die Primfaktoren 2 und 5 hat, lässt er sich zu 10, 100, 1000 … erweitern – dann bricht die Zahl ab.", "Only if the (reduced) denominator has no prime factors other than 2 and 5 can it be expanded to 10, 100, 1000 … – then the decimal terminates.") }],
            hinweis: zw("Nur 2 und 5 → abbrechend.", "Only 2 and 5 → terminating."), erkl: `$\\frac{1}{${a.n}}$ = ${zt(1 / a.n, 6)}… → ${a.abbrechend ? zw("abbrechend", "terminating") : zw("periodisch", "recurring")}` }),
      ];
    }
  }
}

function text(a) {
  switch (a.art) {
    case "bruchZuDez": return <>{zw("Schreibe als Dezimalzahl: ", "Write as a decimal: ")}<M t={`\\frac{${a.b.z}}{${a.b.n}}`} /></>;
    case "dezZuBruch": return zw(`Schreibe ${z(a.dez)} als vollständig gekürzten Bruch.`, `Write ${z(a.dez)} as a fully simplified fraction.`);
    case "runden": return zw(`Runde ${z(a.x)} auf ${a.st} Nachkommastelle${a.st > 1 ? "n" : ""}.`, `Round ${z(a.x)} to ${a.st} decimal place${a.st > 1 ? "s" : ""}.`);
    case "zehner": return zw(`Berechne ${z(a.x)} ${a.op}.`, `Calculate ${z(a.x)} ${a.op}.`);
    case "mal": return zw(`Berechne ${z(a.a)} · ${z(a.b)}.`, `Calculate ${z(a.a)} · ${z(a.b)}.`);
    case "geteilt": return zw(`Berechne ${z(a.a)} : ${z(a.b)}.`, `Calculate ${z(a.a)} : ${z(a.b)}.`);
    default: return <>{zw("Untersuche den Bruch ", "Examine the fraction ")}<M t={`\\frac{1}{${a.n}}`} />.</>;
  }
}

const hilfe = (a) => hilfeKontext({
  id: `dezimal-${a.art}`, aufgabe: "Dezimalzahlen Komma Stellenwert runden periodisch Dezimalbruch multiplizieren dividieren",
  verstehen: [zw("Nach dem Komma: Zehntel, Hundertstel, Tausendstel.", "After the point: tenths, hundredths, thousandths.")],
  ansatz: [zw("Mal: ohne Komma rechnen, Kommastellen zählen. Geteilt: Komma im Teiler wegschieben.", "Times: calculate without the point, count places. Divided: move the point out of the divisor.")],
  regel: [zw("Runden: ab 5 auf, darunter ab.", "Rounding: from 5 up, below down.")],
  pruefen: [zw("Überschlag: Passt die Größenordnung?", "Estimate: is the order of magnitude right?")],
});

export function Dezimalzahlen() {
  return (
    <ZweiModi animationen={werkzeugAnimationen("dezimal")} titel={zw("Dezimalzahlen", "Decimals")}
      text={zw("Stellenwerte hinter dem Komma, Umwandeln zwischen Bruch und Dezimalzahl, Runden und Rechnen mit Komma – und warum manche Brüche nie aufhören.", "Place values after the point, converting between fractions and decimals, rounding and calculating with decimals – and why some fractions never end.")}
      kurz={<p style={{ margin: 0 }}>{zw("0,1 = ein Zehntel, 0,01 = ein Hundertstel. Mal 10/100/1000: Komma 1/2/3 Stellen nach rechts. Multiplizieren: Kommastellen beider Faktoren addieren. Dividieren: Komma im Teiler durch Malnehmen beider Zahlen beseitigen.", "0.1 = one tenth, 0.01 = one hundredth. Times 10/100/1000: point 1/2/3 places to the right. Multiplying: add the decimal places of both factors. Dividing: remove the point in the divisor by multiplying both numbers.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={DEZ_ARTEN} neue={neue} schritte={schritte} text={text} hilfe={hilfe} />} />
  );
}
