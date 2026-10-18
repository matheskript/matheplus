/* ============================================================
   Unterstufe · Natürliche Zahlen: Stellenwert und Runden
   · Entdecken – Stellenwerttafel bis zu den Millionen mit +/− je
     Stelle; Zerlegung, Runden auf jede Stelle, römische Zahl
   · Üben – Ziffer an einer Stelle, Runden, Zahl aus Zerlegung,
     Zahlenstrahl ablesen, Vorgänger/Nachfolger, römische Zahlen,
     Zehnerpotenzen
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { STELLEN, ZAHL_ARTEN, roemisch, zahlAufgabe } from "./unterGen.js";
import { Merke, UebenRahmen, WertZeile, ZweiModi, zs } from "./geoUi.jsx";

let zaehler = 0;
const de = (n) => n.toLocaleString("de-DE");
const KURZ = ["E", "Z", "H", "T", "ZT", "HT", "M"];
const STELLEN_EN = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands", "millions", "ten millions"];

function Entdecken() {
  const [n, setN] = useState(3407250);
  const ziffer = (i) => Math.floor(n / 10 ** i) % 10;
  const aendern = (i, d) => { const z = ziffer(i); const neu = (z + d + 10) % 10; setN(n + (neu - z) * 10 ** i); };
  const knopf = (t, f) => <button type="button" onClick={f} style={{ width: "100%", height: 26, border: `1px solid ${C.linie}`, borderRadius: 7, background: C.weiss, color: C.see, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>{t}</button>;
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Stellenwerttafel", "Place value chart")}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {[6, 5, 4, 3, 2, 1, 0].map((i) => (
            <div key={i} style={{ textAlign: "center", display: "grid", gap: 3 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: i >= 3 ? "#8A6A00" : C.see }}>{KURZ[i]}</div>
              {knopf("+", () => aendern(i, 1))}
              <div style={{ fontSize: 24, fontWeight: 800, borderRadius: 8, background: i >= 6 ? `${C.flaggold}33` : i >= 3 ? `${C.flaggold}18` : `${C.see}12`, padding: "4px 0" }}>{ziffer(i)}</div>
              {knopf("−", () => aendern(i, -1))}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 24, fontWeight: 800, margin: "12px 0 2px", letterSpacing: "0.02em" }}>{de(n)}</div>
        <p style={{ textAlign: "center", fontSize: 13, color: C.grau, margin: 0 }}>{[6, 5, 4, 3, 2, 1, 0].filter((i) => ziffer(i)).map((i) => `${ziffer(i)} ${KURZ[i]}`).join(" + ") || "0"}</p>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{zw("Runden", "Rounding")}</p>
        {[1, 2, 3, 4, 5].map((i) => <WertZeile key={i} links={zw(`auf ${STELLEN[i]}`, `to ${STELLEN_EN[i]}`)} rechts={de(Math.round(n / 10 ** i) * 10 ** i)} />)}
        {n > 0 && n < 4000 && <WertZeile links={zw("Römisch", "Roman")} rechts={roemisch(n)} farbe="#8A6A00" />}
        <Merke>{zw("Jede Stelle ist zehnmal so viel wert wie die rechts daneben. Beim Runden entscheidet nur die Ziffer rechts von der Rundungsstelle: 0–4 abrunden, 5–9 aufrunden.", "Each place is worth ten times the place to its right. When rounding, only the digit right of the rounding place decides: 0–4 round down, 5–9 round up.")}</Merke>
      </div>
    </>
  );
}

function Zahlenstrahl({ start, schritt, k }) {
  const W = 320, X = (i) => 16 + i * ((W - 32) / 10);
  return (
    <svg viewBox={`0 0 ${W} 90`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Zahlenstrahl", "Number line")}>
      <line x1="10" y1="44" x2={W - 6} y2="44" stroke={C.tinte} strokeWidth="1.6" />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={X(i)} y1={i % 5 ? 38 : 34} x2={X(i)} y2={i % 5 ? 50 : 54} stroke={C.tinte} strokeWidth={i % 5 ? 1 : 1.6} />)}
      <text x={X(0)} y="72" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: C.tinte }}>{de(start)}</text>
      <text x={X(10)} y="72" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: C.tinte }}>{de(start + 10 * schritt)}</text>
      <path d={`M ${X(k)} 14 L ${X(k)} 32`} stroke={C.flaggold} strokeWidth="3" />
      <path d={`M ${X(k) - 6} 26 L ${X(k)} 34 L ${X(k) + 6} 26`} fill="none" stroke={C.flaggold} strokeWidth="3" />
      <text x={X(k)} y="11" textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: "#8A6A00" }}>?</text>
    </svg>
  );
}

const TITEL = { stelle: ["Ziffer an einer Stelle", "Digit in a place"], runden: ["Runden", "Rounding"], zerlegung: ["Zahl aus Zerlegung", "Number from parts"], strahl: ["Zahlenstrahl", "Number line"], nachfolger: ["Vorgänger und Nachfolger", "Predecessor and successor"], roemisch: ["Römische Zahlen", "Roman numerals"], zehnerpotenz: ["Zehnerpotenzen", "Powers of ten"] };
const neue = (art) => ({ id: ++zaehler, ...zahlAufgabe(art) });
const teile = (n) => [6, 5, 4, 3, 2, 1, 0].filter((i) => Math.floor(n / 10 ** i) % 10).map((i) => `${Math.floor(n / 10 ** i) % 10} ${KURZ[i]}`).join(" + ");

function schritte(a) {
  switch (a.art) {
    case "stelle": return [zs("sw-s", zw("Ziffer", "Digit"), zw("Ziffer =", "Digit ="), a.ziffer, zw(`Welche Ziffer steht in ${de(a.n)} an der ${STELLEN[a.i]}-Stelle?`, `Which digit of ${de(a.n)} is in the ${STELLEN_EN[a.i]} place?`), { fehler: [{ wert: Math.floor(a.n / 10 ** (a.i - 1)) % 10, text: zw("Eine Stelle zu weit rechts – zähle von den Einern aus.", "One place too far right – count from the ones.") }, { wert: Math.floor(a.n / 10 ** (a.i + 1)) % 10, text: zw("Eine Stelle zu weit links.", "One place too far left.") }].filter((f) => f.wert !== a.ziffer), hinweis: zw("Von rechts: E, Z, H, T, ZT, HT, M", "From the right: ones, tens, hundreds, thousands …"), erkl: String(a.ziffer) })];
    case "runden": {
      const r = Math.floor(a.n / 10 ** (a.i - 1)) % 10;
      return [
        zs("sw-r1", zw("Entscheidende Ziffer", "Deciding digit"), zw("Ziffer =", "Digit ="), r, zw(`Welche Ziffer steht rechts neben der ${STELLEN[a.i]}-Stelle?`, `Which digit is to the right of the ${STELLEN_EN[a.i]} place?`), { erkl: zw(`${r} → ${r >= 5 ? "aufrunden" : "abrunden"}`, `${r} → round ${r >= 5 ? "up" : "down"}`) }),
        zs("sw-r2", zw("Gerundet", "Rounded"), "≈", a.wert, zw(`Runde ${de(a.n)} auf ${STELLEN[a.i]}.`, `Round ${de(a.n)} to the nearest ${STELLEN_EN[a.i]}.`), { wertText: de(a.wert), fehler: [{ wert: Math.floor(a.n / 10 ** a.i) * 10 ** a.i, text: zw("Abgeschnitten statt gerundet.", "Truncated instead of rounded.") }].filter((f) => f.wert !== a.wert), erkl: `${de(a.n)} ≈ ${de(a.wert)}` }),
      ];
    }
    case "zerlegung": return [zs("sw-z", zw("Zahl", "Number"), zw("Zahl =", "Number ="), a.n, zw("Schreibe die Zahl, die zu dieser Zerlegung gehört.", "Write the number that belongs to this breakdown."), { wertText: de(a.n), hinweis: zw("Leere Stellen mit 0 füllen.", "Fill empty places with 0."), erkl: de(a.n) })];
    case "strahl": return [
      zs("sw-st1", zw("Ein Teilstrich", "One tick"), zw("Schritt =", "Step ="), a.schritt, zw("Wie viel ist ein kleiner Teilstrich wert?", "How much is one small tick worth?"), { fehler: [{ wert: a.schritt * 10, text: zw("Das ist der ganze Abschnitt – es sind 10 Teilstriche.", "That's the whole section – there are 10 ticks.") }], hinweis: `${de(10 * a.schritt)} : 10`, erkl: de(a.schritt) }),
      zs("sw-st2", zw("Ablesen", "Read off"), "? =", a.wert, zw("Welche Zahl zeigt der Pfeil?", "Which number does the arrow show?"), { wertText: de(a.wert), hinweis: `${de(a.start)} + ${a.k} · ${de(a.schritt)}`, erkl: de(a.wert) }),
    ];
    case "nachfolger": return [zs("sw-n", a.vor ? zw("Vorgänger", "Predecessor") : zw("Nachfolger", "Successor"), "=", a.wert, a.vor ? zw(`Welche Zahl kommt direkt vor ${de(a.n)}?`, `Which number comes right before ${de(a.n)}?`) : zw(`Welche Zahl kommt direkt nach ${de(a.n)}?`, `Which number comes right after ${de(a.n)}?`), { wertText: de(a.wert), fehler: [{ wert: a.vor ? a.n + 1 : a.n - 1, text: zw("Vorgänger = eins weniger, Nachfolger = eins mehr.", "Predecessor = one less, successor = one more.") }], erkl: de(a.wert) })];
    case "roemisch": return [zs("sw-ro", zw("Römische Zahl", "Roman numeral"), `${a.r} =`, a.n, zw("Welche Zahl ist das?", "Which number is this?"), { hinweis: "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000 · " + zw("kleinere vor größerer: abziehen", "smaller before larger: subtract"), erkl: `${a.r} = ${a.n}` })];
    default: return [zs("sw-z10", zw("Zahl", "Number"), "=", a.wert, zw("Schreibe als Zahl.", "Write as a number."), { wertText: de(a.wert), hinweis: zw("10⁶ = 1 000 000, 10⁴ = 10 000, 10¹ = 10", "10⁶ = 1,000,000, 10⁴ = 10,000, 10¹ = 10"), erkl: de(a.wert) })];
  }
}
const HOCH = { 6: "⁶", 4: "⁴", 1: "¹" };
function text(a) {
  switch (a.art) {
    case "stelle": return zw(`Zahl: ${de(a.n)}`, `Number: ${de(a.n)}`);
    case "runden": return zw(`Runde ${de(a.n)} auf ${STELLEN[a.i]}.`, `Round ${de(a.n)} to the nearest ${STELLEN_EN[a.i]}.`);
    case "zerlegung": return zw(`Zerlegung: ${teile(a.n)} (E = Einer, Z = Zehner, H = Hunderter, T = Tausender, ZT = Zehntausender, HT = Hunderttausender)`, `Breakdown: ${teile(a.n)} (E = ones, Z = tens, H = hundreds, T = thousands, ZT = ten thousands, HT = hundred thousands)`);
    case "strahl": return zw("Lies die markierte Stelle am Zahlenstrahl ab.", "Read off the marked point on the number line.");
    case "nachfolger": return zw(`Zahl: ${de(a.n)}`, `Number: ${de(a.n)}`);
    case "roemisch": return zw(`Übersetze die römische Zahl ${a.r}.`, `Translate the Roman numeral ${a.r}.`);
    default: return zw(`Schreibe ${a.ziffern.map((d, i) => `${d} · 10${HOCH[a.e[i]]}`).join(" + ")} als Zahl.`, `Write ${a.ziffern.map((d, i) => `${d} · 10${HOCH[a.e[i]]}`).join(" + ")} as a number.`);
  }
}
const skizze = (a) => (a.art === "strahl" ? <Zahlenstrahl start={a.start} schritt={a.schritt} k={a.k} /> : null);
const hilfe = (a) => hilfeKontext({
  id: `zahlen-${a.art}`, aufgabe: "Stellenwert Stellenwerttafel runden Zahlenstrahl römische Zahlen große Zahlen Zehnerpotenz",
  verstehen: [zw("Trage die Zahl in eine Stellenwerttafel ein.", "Enter the number into a place value chart.")],
  ansatz: [zw("Runden: auf die Ziffer rechts der Rundungsstelle schauen.", "Rounding: look at the digit right of the rounding place.")],
  regel: [zw("0–4 abrunden, 5–9 aufrunden.", "0–4 round down, 5–9 round up.")],
  pruefen: [zw("Liegt das Ergebnis nah an der Ausgangszahl?", "Is the result close to the starting number?")],
});

export function Stellenwert() {
  return (
    <ZweiModi titel={zw("Natürliche Zahlen und Stellenwert", "Whole numbers and place value")}
      text={zw("Große Zahlen lesen und schreiben, runden, am Zahlenstrahl ablesen – dazu römische Zahlen und Zehnerpotenzen.", "Read and write large numbers, round them, read them on the number line – plus Roman numerals and powers of ten.")}
      kurz={<p style={{ margin: 0 }}>{zw("Stellen von rechts: Einer, Zehner, Hunderter, Tausender, Zehntausender, Hunderttausender, Millionen. Jede Stelle ist das Zehnfache der rechten Nachbarstelle. Runden: 0–4 ab, 5–9 auf.", "Places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions. Each place is ten times its right neighbour. Rounding: 0–4 down, 5–9 up.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={ZAHL_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
