/* ============================================================
   Unterstufe · Primzahlen, ggT und kgV
   · Entdecken – Sieb des Eratosthenes (Schritt für Schritt bis 100)
     und Faktorbaum für eine wählbare Zahl
   · Üben – Primzahl erkennen, Primfaktorzerlegung, ggT, kgV,
     Sachaufgaben (Fliesen/Bänder → ggT, Busse/Ampeln → kgV)
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { PRIM_ARTEN, primAufgabe, primfaktoren } from "./unterGen.js";
import { ggT } from "./rechnen2.js";
import { Merke, Regler, UebenRahmen, ZweiModi, ws, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { Arbeitsflaeche, BildKarte, Werkzeugleiste, hinweisStil, useDesktop } from "./arbeitsflaeche.jsx";
import { AktionsKnopf, ChipAuswahl, ErgebnisKarte, StellKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const SIEB_PRIM = [2, 3, 5, 7];

/* leiste: nur Desktop – Werkzeugleiste unter dem Bild (Themenwahl); dann Arbeitsfläche statt Karte */
function Sieb({ leiste }) {
  const [schritt, setSchritt] = useState(0);
  const aktiv = SIEB_PRIM.slice(0, schritt);
  const gestrichen = (n) => n === 1 || aktiv.some((p) => n !== p && n % p === 0);
  const fertig = schritt >= SIEB_PRIM.length;
  const merkeText = fertig
    ? zw("Übrig bleiben die 25 Primzahlen bis 100. Warum reicht es, bis 7 zu streichen? Jede zusammengesetzte Zahl bis 100 hat einen Teiler ≤ 10 – und 10² = 100.", "The 25 primes up to 100 remain. Why is crossing out up to 7 enough? Every composite number up to 100 has a divisor ≤ 10 – and 10² = 100.")
    : zw("Eine Primzahl hat genau zwei Teiler: 1 und sich selbst. Streiche nacheinander die Vielfachen von 2, 3, 5 und 7.", "A prime has exactly two divisors: 1 and itself. Cross out the multiples of 2, 3, 5 and 7 one after another.");
  const knopfText = fertig ? zw("Fertig", "Done") : zw(`Vielfache von ${SIEB_PRIM[schritt]} streichen`, `Cross out multiples of ${SIEB_PRIM[schritt]}`);
  if (leiste) {
    return (
      <Arbeitsflaeche
        links={<>
          <ErgebnisKarte titel={zw("Sieb des Eratosthenes", "Sieve of Eratosthenes")}>
            <div style={{ display: "grid", gap: 8 }}>
              <AktionsKnopf haupt farbe={C.smaragd} onClick={() => setSchritt(schritt + 1)} disabled={fertig}>{knopfText}</AktionsKnopf>
              <AktionsKnopf onClick={() => setSchritt(0)}>{zw("Von vorn", "Restart")}</AktionsKnopf>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
              {SIEB_PRIM.map((p, i) => (
                <span key={p} style={{ flex: 1, textAlign: "center", padding: "5px 0", borderRadius: 8, fontSize: 13, fontWeight: 800,
                  background: i < schritt ? C.flaggold : `${C.see}10`, color: i < schritt ? C.seeTief : C.grau }}>{p}</span>
              ))}
            </div>
          </ErgebnisKarte>
          <ErgebnisKarte><p style={{ ...hinweisStil, color: C.tinte, margin: 0 }}>{merkeText}</p></ErgebnisKarte>
        </>}
        rechts={<>
          <BildKarte style={{ padding: 14 }}>
            <div data-sieb style={{ display: "grid", gridTemplateColumns: "repeat(10, minmax(0, 1fr))", gap: 4 }}>
              {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
                const weg = gestrichen(n), prim = (fertig && !weg) || aktiv.includes(n);
                return <div key={n} style={{ textAlign: "center", fontSize: 13.5, fontWeight: 700, padding: "8px 0", borderRadius: 7, fontVariantNumeric: "tabular-nums",
                  background: prim ? C.flaggold : weg ? C.sand : `${C.see}10`, color: weg ? C.hellgrau : C.tinte, textDecoration: weg ? "line-through" : "none", transition: "all .2s" }}>{n}</div>;
              })}
            </div>
          </BildKarte>
          {leiste}
        </>} />
    );
  }
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3, marginTop: 12 }}>
        {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
          const weg = gestrichen(n), prim = (fertig && !weg) || aktiv.includes(n);
          return <div key={n} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, padding: "5px 0", borderRadius: 6, fontVariantNumeric: "tabular-nums",
            background: prim ? C.flaggold : weg ? C.sand : `${C.see}10`, color: weg ? C.hellgrau : C.tinte, textDecoration: weg ? "line-through" : "none", transition: "all .2s" }}>{n}</div>;
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <GrosserKnopf onClick={() => setSchritt(schritt + 1)} disabled={fertig}>{knopfText}</GrosserKnopf>
        <GrosserKnopf ghost onClick={() => setSchritt(0)}>{zw("Von vorn", "Restart")}</GrosserKnopf>
      </div>
      <Merke>{merkeText}</Merke>
    </>
  );
}

function Faktorbaum({ leiste }) {
  const [n, setN] = useState(360);
  const f = primfaktoren(n);
  const zeilen = []; let rest = n;
  for (const p of f.slice(0, -1)) { zeilen.push([rest, p, rest / p]); rest /= p; }
  const gruppen = {}; f.forEach((p) => { gruppen[p] = (gruppen[p] || 0) + 1; });
  const ergebnis = <>{n} = {Object.entries(gruppen).map(([p, k], i) => <span key={p}>{i ? " · " : ""}{p}{k > 1 ? <sup>{k}</sup> : null}</span>)}</>;
  const merkeText = zw("Immer mit dem kleinsten Primfaktor teilen, bis 1 übrig bleibt. Jede Zahl hat genau eine Primfaktorzerlegung.", "Always divide by the smallest prime factor until 1 remains. Every number has exactly one prime factorisation.");
  const kette = f.length === 1 ? <b>{zw(`${n} ist eine Primzahl.`, `${n} is prime.`)}</b> : zeilen.map(([a, p, b], i) => (
    <div key={i} style={{ paddingLeft: i * 16 }}><b>{a}</b> = <span style={{ color: "#8A6A00", fontWeight: 800 }}>{p}</span> · {b}</div>
  ));
  if (leiste) {
    return (
      <Arbeitsflaeche
        links={<>
          <StellKarte titel={zw("Zahl wählen", "Choose a number")} werte={[{ name: "n", wert: n, setWert: setN, min: 4, max: 500, regler: true }]} />
          <ErgebnisKarte titel={zw("Primfaktorzerlegung", "Prime factorisation")}>
            <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: C.tinte }}>{ergebnis}</div>
          </ErgebnisKarte>
        </>}
        rechts={<>
          <BildKarte style={{ padding: "16px 20px", fontSize: 18, lineHeight: 1.9, fontVariantNumeric: "tabular-nums", color: C.tinte, minHeight: 200 }}>{kette}</BildKarte>
          {leiste}
          <p style={{ ...hinweisStil, margin: 0 }}>{merkeText}</p>
        </>} />
    );
  }
  return (
    <>
      <div style={{ marginTop: 12 }}><Regler name="n" wert={n} setWert={setN} min={4} max={500} schritt={1} format={(v) => String(v)} /></div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: "12px 14px", fontSize: 16, lineHeight: 1.9, fontVariantNumeric: "tabular-nums" }}>
        {kette}
      </div>
      <div style={{ textAlign: "center", fontSize: 19, fontWeight: 700, margin: "12px 0 4px" }}>
        {ergebnis}
      </div>
      <Merke>{merkeText}</Merke>
    </>
  );
}

function Entdecken() {
  const [teil, setTeil] = useState("sieb");
  const desktop = useDesktop();
  const THEMEN = [["sieb", zw("Sieb des Eratosthenes", "Sieve of Eratosthenes")], ["baum", zw("Faktorbaum", "Factor tree")]];
  if (desktop) {
    const leiste = <Werkzeugleiste gruppen={[{ titel: zw("Was willst du sehen?", "What do you want to see?"), inhalt: <ChipAuswahl optionen={THEMEN} wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} /> }]} />;
    return <div style={{ marginTop: 16 }} data-prim="breit">{teil === "sieb" ? <Sieb leiste={leiste} /> : <Faktorbaum leiste={leiste} />}</div>;
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Was willst du sehen?", "What do you want to see?")}</p>
      <Auswahl optionen={THEMEN} wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} />
      {teil === "sieb" ? <Sieb /> : <Faktorbaum />}
    </div>
  );
}

const TITEL = { istPrim: ["Primzahl?", "Prime?"], zerlegung: ["Primfaktorzerlegung", "Prime factorisation"], ggt: ["ggT", "gcd"], kgv: ["kgV", "lcm"], ggtSach: ["Sachaufgabe ggT", "Word problem gcd"], kgvSach: ["Sachaufgabe kgV", "Word problem lcm"] };
const neue = (art) => ({ id: ++zaehler, ...primAufgabe(art) });
const pfStr = (n) => primfaktoren(n).join(" · ");

function schritte(a) {
  switch (a.art) {
    case "istPrim": return [ws("pr-i", zw("Entscheiden", "Decide"), zw(`Ist ${a.n} eine Primzahl?`, `Is ${a.n} prime?`), [["ja", zw("ja", "yes")], ["nein", zw("nein", "no")]], a.prim ? "ja" : "nein",
      { fehler: [{ wahl: a.prim ? "nein" : "ja", text: a.prim ? zw(`Prüfe alle Primzahlen bis √${a.n} ≈ ${Math.floor(Math.sqrt(a.n))}: keine teilt ${a.n}.`, `Check all primes up to √${a.n} ≈ ${Math.floor(Math.sqrt(a.n))}: none divides ${a.n}.`) : zw(`${a.n} = ${a.teiler} · ${a.n / a.teiler}`, `${a.n} = ${a.teiler} · ${a.n / a.teiler}`) }],
        hinweis: zw("Teste 2, 3, 5, 7 – bis zur Wurzel der Zahl.", "Test 2, 3, 5, 7 – up to the square root of the number."), erkl: a.prim ? zw(`${a.n} ist prim.`, `${a.n} is prime.`) : `${a.n} = ${a.teiler} · ${a.n / a.teiler}` })];
    case "zerlegung": return [
      zs("pr-z1", zw("Kleinster Primfaktor", "Smallest prime factor"), "p =", a.kleinster, zw(`Durch welche Primzahl ist ${a.n} zuerst teilbar?`, `Which prime first divides ${a.n}?`), { fehler: [{ wert: 1, text: zw("1 ist keine Primzahl.", "1 is not prime.") }], erkl: `${a.n} = ${a.kleinster} · ${a.n / a.kleinster}` }),
      zs("pr-z2", zw("Größter Primfaktor", "Largest prime factor"), zw("größter =", "largest ="), a.groesster, zw("Zerlege weiter. Welcher Primfaktor ist der größte?", "Keep factoring. Which prime factor is the largest?"), { hinweis: zw("Teile immer wieder durch den kleinsten Primfaktor.", "Keep dividing by the smallest prime factor."), erkl: `${a.n} = ${pfStr(a.n)}` }),
      zs("pr-z3", zw("Anzahl", "Count"), zw("Anzahl =", "Count ="), a.anzahl, zw("Wie viele Primfaktoren sind es insgesamt (mit Wiederholung)?", "How many prime factors are there in total (with repetition)?"), { fehler: [{ wert: new Set(a.f).size, text: zw("Gleiche Faktoren mehrfach zählen.", "Count repeated factors several times.") }].filter((f) => f.wert !== a.anzahl), erkl: `${pfStr(a.n)} → ${a.anzahl}` }),
    ];
    case "ggt": case "ggtSach": return [
      ws("pr-g0", zw("ggT oder kgV?", "gcd or lcm?"), zw("Was ist gesucht?", "What is wanted?"), [["ggt", zw("größter gemeinsamer Teiler", "greatest common divisor")], ["kgv", zw("kleinstes gemeinsames Vielfaches", "least common multiple")]], "ggt", { fehler: [{ wahl: "kgv", text: zw("Gesucht ist ein Teil, der in beide Zahlen passt – also ein Teiler.", "You need a part that fits into both numbers – a divisor.") }], hinweis: zw("Aufteilen ohne Rest → Teiler.", "Splitting without remainder → divisor."), erkl: "ggT" }),
      zs("pr-g", "ggT", `ggT(${a.a}; ${a.b}) =`, a.wert, zw("Bestimme den ggT (z. B. über die gemeinsamen Primfaktoren).", "Find the gcd (e.g. via the common prime factors)."), { einheit: a.art === "ggtSach" ? "cm" : undefined, fehler: [{ wert: a.a * a.b / a.wert, text: zw("Das ist das kgV.", "That's the lcm.") }, ...[2, 3, 4, 5, 6].filter((d) => a.wert % d === 0 && d < a.wert).map((d) => ({ wert: d, text: zw("Gemeinsamer Teiler, aber nicht der größte.", "A common divisor, but not the greatest.") }))], hinweis: `${a.a} = ${pfStr(a.a)}, ${a.b} = ${pfStr(a.b)}`, erkl: `ggT = ${a.wert}` }),
    ];
    default: return [
      ws("pr-k0", zw("ggT oder kgV?", "gcd or lcm?"), zw("Was ist gesucht?", "What is wanted?"), [["ggt", zw("größter gemeinsamer Teiler", "greatest common divisor")], ["kgv", zw("kleinstes gemeinsames Vielfaches", "least common multiple")]], "kgv", { fehler: [{ wahl: "ggt", text: zw("Gesucht ist der erste gemeinsame Zeitpunkt – ein Vielfaches beider Zahlen.", "You need the first common time – a multiple of both numbers.") }], hinweis: zw("Wiederholen bis es zusammenpasst → Vielfaches.", "Repeat until it matches → multiple."), erkl: "kgV" }),
      zs("pr-k", "kgV", `kgV(${a.a}; ${a.b}) =`, a.wert, zw("Bestimme das kgV.", "Find the lcm."), { einheit: a.art === "kgvSach" ? "min" : undefined, fehler: [{ wert: a.a * a.b, text: zw("Gemeinsames Vielfaches, aber nicht das kleinste.", "A common multiple, but not the least.") }, { wert: ggT(a.a, a.b), text: zw("Das ist der ggT.", "That's the gcd.") }].filter((f) => f.wert !== a.wert), hinweis: zw(`Vielfache von ${Math.max(a.a, a.b)} aufzählen, bis eines durch ${Math.min(a.a, a.b)} teilbar ist.`, `List multiples of ${Math.max(a.a, a.b)} until one is divisible by ${Math.min(a.a, a.b)}.`), erkl: `kgV = ${a.wert}` }),
    ];
  }
}
function text(a) {
  switch (a.art) {
    case "istPrim": return zw(`Ist ${a.n} eine Primzahl?`, `Is ${a.n} a prime number?`);
    case "zerlegung": return zw(`Zerlege ${a.n} in Primfaktoren.`, `Write ${a.n} as a product of primes.`);
    case "ggt": return zw(`Bestimme den größten gemeinsamen Teiler von ${a.a} und ${a.b}.`, `Find the greatest common divisor of ${a.a} and ${a.b}.`);
    case "kgv": return zw(`Bestimme das kleinste gemeinsame Vielfache von ${a.a} und ${a.b}.`, `Find the least common multiple of ${a.a} and ${a.b}.`);
    case "ggtSach": return zw(`Zwei Bänder (${a.a} cm und ${a.b} cm) sollen ohne Rest in möglichst lange, gleich lange Stücke geschnitten werden. Wie lang wird ein Stück?`, `Two ribbons (${a.a} cm and ${a.b} cm) are to be cut without leftovers into pieces as long as possible, all equal. How long is a piece?`);
    default: return zw(`Bus A fährt alle ${a.a} Minuten, Bus B alle ${a.b} Minuten. Gerade sind beide gleichzeitig abgefahren. Nach wie vielen Minuten fahren sie wieder gemeinsam?`, `Bus A leaves every ${a.a} minutes, bus B every ${a.b} minutes. Both just left together. After how many minutes do they leave together again?`);
  }
}
const hilfe = (a) => hilfeKontext({
  id: `prim-${a.art}`, aufgabe: "Primzahl Primfaktorzerlegung ggT kgV Teiler Vielfache Sieb des Eratosthenes",
  verstehen: [zw("Teiler teilen ohne Rest. Vielfache entstehen durch Malnehmen.", "Divisors divide without remainder. Multiples come from multiplying.")],
  ansatz: [zw("ggT: gemeinsame Primfaktoren malnehmen. kgV: alle Primfaktoren in höchster Anzahl.", "gcd: multiply the common prime factors. lcm: all prime factors in their highest count.")],
  regel: [zw("ggT(a; b) · kgV(a; b) = a · b", "gcd(a, b) · lcm(a, b) = a · b")],
  pruefen: [zw("ggT ≤ kleinere Zahl, kgV ≥ größere Zahl.", "gcd ≤ smaller number, lcm ≥ larger number.")],
});

export function Primzahlen() {
  return (
    <ZweiModi animationen={werkzeugAnimationen("primzahlen")} titel={zw("Primzahlen, ggT und kgV", "Primes, gcd and lcm")}
      text={zw("Primzahlen aussieben, Zahlen in Primfaktoren zerlegen und damit ggT und kgV finden – die Werkzeuge fürs Kürzen und den Hauptnenner.", "Sieve out primes, break numbers into prime factors and use them to find gcd and lcm – the tools for simplifying fractions and common denominators.")}
      kurz={<p style={{ margin: 0 }}>{zw("Primzahl: genau zwei Teiler (1 ist keine Primzahl). 60 = 2² · 3 · 5. ggT: größter Teiler beider Zahlen (zum Kürzen). kgV: kleinstes Vielfaches beider Zahlen (Hauptnenner).", "Prime: exactly two divisors (1 is not prime). 60 = 2² · 3 · 5. gcd: largest divisor of both numbers (for simplifying). lcm: smallest multiple of both numbers (common denominator).")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={PRIM_ARTEN} neue={neue} schritte={schritte} text={text} hilfe={hilfe} />} />
  );
}
