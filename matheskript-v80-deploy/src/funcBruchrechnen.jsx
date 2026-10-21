/* ============================================================
   Mittelstufe · Bruchrechnen: Brüche rechnen
   · Entdecken – Bruchstreifen: Erweitern und Kürzen (gleiche Fläche,
     feinere Einteilung) und Gleichnamig machen (Addition am Streifen)
   · Üben – Kürzen, Erweitern, Addieren, Subtrahieren, Multiplizieren,
     Dividieren, gemischte Zahlen, Anteile, Doppelbrüche, Vergleichen.
     Ergebnisse müssen vollständig gekürzt sein (Regel A5, Schritt-
     Option gekuerzt in ui3.jsx).
   Mathematik in bruchGen.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, EinstellungsPille } from "./ui3.jsx";
import { ggT, q, qAdd, qNum } from "./rechnen2.js";
import { BRUCH_ARTEN, bruchAufgabe, bruchTex, kgV, rohTex } from "./bruchGen.js";
import { startModus, uebenWunschHolen, uebenWunschLesen } from "./uebenWunsch.js";
import { Merke, Regler, SCHRIFT } from "./geoUi.jsx";
import { Arbeitsflaeche, BildKarte, Werkzeugleiste, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { ChipAuswahl, ErklaerKarte, StellKarte, useKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const T = (t) => <M t={t} />;
const bt = (b) => bruchTex(b);

/* ---------- Bruchstreifen ---------- */
function Streifen({ z, n, farbe = C.see, zweit = null, beschriftung, hoehe: hoehe0 = 34 }) {
  /* zweit: { z, farbe } – weitere Teile im Anschluss (für Summen) */
  // Echte Pixel am Desktop (DESKTOP-STIL.md): gemessene Breite, Streifen 44 px hoch; Handy unverändert 320
  const [ref, gemessen] = useBreite();
  const desktop = useDesktop();
  const W = desktop && gemessen ? gemessen : 320, rand = 10, hoehe = desktop && gemessen ? 44 : hoehe0;
  const ganze = Math.max(1, Math.ceil((z + (zweit ? zweit.z : 0)) / n));
  const breite = (W - 2 * rand) / ganze;
  const teil = breite / n;
  const zellen = [];
  for (let g = 0; g < ganze; g++) for (let i = 0; i < n; i++) {
    const k = g * n + i;
    const f = k < z ? farbe : zweit && k < z + zweit.z ? zweit.farbe : null;
    zellen.push(<rect key={k} x={rand + g * breite + i * teil} y={4} width={teil} height={hoehe} fill={f ? `${f}CC` : C.weiss} stroke={`${C.tinte}55`} strokeWidth="1" />);
  }
  return (
    <div ref={ref}><svg viewBox={`0 0 ${W} ${hoehe + (beschriftung ? 26 : 10)}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={beschriftung || `${z}/${n}`}>
      {zellen}
      {Array.from({ length: ganze }, (_, g) => <rect key={`g${g}`} x={rand + g * breite} y={4} width={breite} height={hoehe} fill="none" stroke={C.tinte} strokeWidth="2" rx="3" />)}
      {beschriftung && <text x={W / 2} y={hoehe + 22} textAnchor="middle" style={{ fontSize: 12.5, fontWeight: 700, fill: C.grau, fontFamily: SCHRIFT }}>{beschriftung}</text>}
    </svg></div>
  );
}

/* leiste: nur Desktop – Werkzeugleiste (Themenwahl) unter dem Bild; dann Arbeitsfläche */
function ErweiternKuerzen({ leiste }) {
  const [n, setN] = useState(4);
  const [z, setZ] = useState(3);
  const [k, setK] = useState(2);
  const zz = Math.min(z, n);
  const g = ggT(zz, n) || 1;
  const formel = T(`\\frac{${zz}}{${n}} = \\frac{${zz} · ${k}}{${n} · ${k}} = \\frac{${zz * k}}{${n * k}}`);
  const erklaerung = <>
    {zw(`Erweitern mit ${k}: Jeder Teil wird in ${k} Stücke zerschnitten. Die gefärbte Fläche bleibt gleich – der Bruch hat denselben Wert.`, `Expanding by ${k}: every part is cut into ${k} pieces. The coloured area stays the same – the fraction has the same value.`)}
    {zz > 0 && zz < n && (
      <div style={{ marginTop: 6 }}>
        {g > 1
          ? <>{zw(`Kürzen ist der Rückweg: ggT(${zz}; ${n}) = ${g}, also `, `Simplifying is the way back: gcd(${zz}, ${n}) = ${g}, so `)}{T(`\\frac{${zz}}{${n}} = \\frac{${zz / g}}{${n / g}}`)}.</>
          : <>{zw(`ggT(${zz}; ${n}) = 1: `, `gcd(${zz}, ${n}) = 1: `)}{T(`\\frac{${zz}}{${n}}`)}{zw(" ist schon vollständig gekürzt.", " is already fully simplified.")}</>}
      </div>
    )}
  </>;
  if (leiste) {
    const zeile = (bruch, streifen) => (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 21, minWidth: 64, textAlign: "center" }}>{bruch}</span>
        <div style={{ flex: 1, minWidth: 0 }}>{streifen}</div>
      </div>
    );
    return (
      <>
        <Arbeitsflaeche
          links={<StellKarte titel={zw("Bruch und Faktor", "Fraction and factor")} kopf={T(`\\frac{${zz}}{${n}}`)} werte={[
            { name: zw("Zähler", "Numerator"), wert: zz, setWert: setZ, min: 0, max: n },
            { name: zw("Nenner", "Denominator"), wert: n, setWert: (v) => { setN(v); if (z > v) setZ(v); }, min: 2, max: 12 },
            { name: zw("Faktor", "Factor"), wert: k, setWert: setK, min: 1, max: 5, farbe: C.gruen, format: (v) => `· ${v}` },
          ]} />}
          rechts={<>
            <BildKarte style={{ padding: "22px 16px", display: "grid", gap: 18 }}>
              {zeile(T(`\\frac{${zz}}{${n}}`), <Streifen z={zz} n={n} />)}
              {zeile(T(`\\frac{${zz * k}}{${n * k}}`), <Streifen z={zz * k} n={n * k} farbe={C.gruen} />)}
            </BildKarte>
            {leiste}
          </>} />
        <ErklaerKarte style={{ marginTop: 20 }} titel={zw("Erweitern und Kürzen", "Expand and simplify")}
          links={<div style={{ fontSize: 19, overflowX: "auto" }}>{formel}</div>} rechts={erklaerung} />
      </>
    );
  }
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name={zw("Nenner", "Denominator")} wert={n} setWert={(v) => { setN(v); if (z > v) setZ(v); }} min={2} max={12} schritt={1} format={(v) => String(v)} breiteName={92} />
        <Regler name={zw("Zähler", "Numerator")} wert={zz} setWert={setZ} min={0} max={n} schritt={1} format={(v) => String(v)} breiteName={92} />
        <Regler name={zw("Faktor", "Factor")} wert={k} setWert={setK} min={1} max={5} schritt={1} farbe={C.gruen} format={(v) => `· ${v}`} breiteName={92} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: "10px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
          <span style={{ fontSize: 19, minWidth: 64, textAlign: "center" }}>{T(`\\frac{${zz}}{${n}}`)}</span>
          <div style={{ flex: 1 }}><Streifen z={zz} n={n} /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginTop: 6 }}>
          <span style={{ fontSize: 19, minWidth: 64, textAlign: "center" }}>{T(`\\frac{${zz * k}}{${n * k}}`)}</span>
          <div style={{ flex: 1 }}><Streifen z={zz * k} n={n * k} farbe={C.gruen} /></div>
        </div>
      </div>
      <Merke>
        <div style={{ fontSize: 17, marginBottom: 6 }}>{formel}</div>
        {erklaerung}
      </Merke>
    </>
  );
}

function Gleichnamig({ leiste }) {
  const [n1, setN1] = useState(3);
  const [z1, setZ1] = useState(1);
  const [n2, setN2] = useState(4);
  const [z2, setZ2] = useState(1);
  const a = { z: Math.min(z1, n1), n: n1 }, b = { z: Math.min(z2, n2), n: n2 };
  const hn = kgV(a.n, b.n);
  const za = a.z * (hn / a.n), zb = b.z * (hn / b.n);
  const s = qAdd(q(a.z, a.n), q(b.z, b.n));
  const sumTex = za + zb === 0 ? "0" : `\\frac{${za + zb}}{${hn}}${(s.z !== za + zb || s.n !== hn) ? ` = ${bt(s)}` : ""}`;
  const formel = T(`\\frac{${a.z}}{${a.n}} + \\frac{${b.z}}{${b.n}} = \\frac{${za}}{${hn}} + \\frac{${zb}}{${hn}} = ${sumTex}`);
  const erklaerung = zw(`Teile verschiedener Größe kann man nicht direkt zusammenzählen – erst müssen alle Teile gleich groß sein. Der kleinste gemeinsame Nenner ist kgV(${a.n}; ${b.n}) = ${hn}.`, `You can't add parts of different sizes directly – first all parts must be the same size. The lowest common denominator is lcm(${a.n}, ${b.n}) = ${hn}.`);
  const streifen = <>
    <Streifen z={a.z} n={a.n} beschriftung={zw(`${a.z} von ${a.n} Teilen`, `${a.z} of ${a.n} parts`)} />
    <Streifen z={b.z} n={b.n} farbe={C.gruen} beschriftung={zw(`${b.z} von ${b.n} Teilen`, `${b.z} of ${b.n} parts`)} />
    <Streifen z={za} n={hn} zweit={{ z: zb, farbe: C.gruen }} beschriftung={zw(`zusammen: ${za + zb} von ${hn} Teilen (Hauptnenner ${hn})`, `together: ${za + zb} of ${hn} parts (common denominator ${hn})`)} />
  </>;
  if (leiste) {
    return (
      <>
        <Arbeitsflaeche
          links={<>
            <StellKarte titel={zw("1. Bruch", "1st fraction")} kopf={T(`\\frac{${a.z}}{${a.n}}`)} werte={[
              { name: zw("Zähler", "Numerator"), wert: a.z, setWert: setZ1, min: 0, max: n1 },
              { name: zw("Nenner", "Denominator"), wert: n1, setWert: (v) => { setN1(v); if (z1 > v) setZ1(v); }, min: 2, max: 8 },
            ]} />
            <StellKarte titel={zw("2. Bruch", "2nd fraction")} farbe={C.gruen} kopf={T(`\\frac{${b.z}}{${b.n}}`)} werte={[
              { name: zw("Zähler", "Numerator"), wert: b.z, setWert: setZ2, min: 0, max: n2 },
              { name: zw("Nenner", "Denominator"), wert: n2, setWert: (v) => { setN2(v); if (z2 > v) setZ2(v); }, min: 2, max: 8 },
            ]} />
          </>}
          rechts={<>
            <BildKarte style={{ padding: "20px 12px 12px", display: "grid", gap: 10 }}>{streifen}</BildKarte>
            {leiste}
          </>} />
        <ErklaerKarte style={{ marginTop: 20 }} titel={zw("Gleichnamig machen", "Common denominator")}
          links={<div style={{ fontSize: 19, overflowX: "auto" }}>{formel}</div>} rechts={erklaerung} />
      </>
    );
  }
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name={zw("1. Nenner", "1st denom.")} wert={n1} setWert={(v) => { setN1(v); if (z1 > v) setZ1(v); }} min={2} max={8} schritt={1} format={(v) => String(v)} breiteName={92} />
        <Regler name={zw("1. Zähler", "1st numer.")} wert={a.z} setWert={setZ1} min={0} max={n1} schritt={1} format={(v) => String(v)} breiteName={92} />
        <Regler name={zw("2. Nenner", "2nd denom.")} wert={n2} setWert={(v) => { setN2(v); if (z2 > v) setZ2(v); }} min={2} max={8} schritt={1} farbe={C.gruen} format={(v) => String(v)} breiteName={92} />
        <Regler name={zw("2. Zähler", "2nd numer.")} wert={b.z} setWert={setZ2} min={0} max={n2} schritt={1} farbe={C.gruen} format={(v) => String(v)} breiteName={92} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: "10px 6px", display: "grid", gap: 4 }}>
        {streifen}
      </div>
      <Merke>
        <div style={{ fontSize: 17, marginBottom: 6, overflowX: "auto" }}>{formel}</div>
        {erklaerung}
      </Merke>
    </>
  );
}

function Entdecken() {
  const [teil, setTeil] = useState("ek");
  const desktop = useDesktop();
  const THEMEN = [["ek", zw("Erweitern und Kürzen", "Expand and simplify")], ["gn", zw("Gleichnamig machen", "Common denominator")]];
  if (desktop) {
    const leiste = <Werkzeugleiste gruppen={[{ titel: zw("Bruchstreifen", "Fraction strips"), inhalt: <ChipAuswahl optionen={THEMEN} wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} /> }]} />;
    return <div style={{ marginTop: 16 }} data-bruch="breit">{teil === "ek" ? <ErweiternKuerzen leiste={leiste} /> : <Gleichnamig leiste={leiste} />}</div>;
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Bruchstreifen", "Fraction strips")}</p>
      <Auswahl optionen={THEMEN} wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} />
      <div style={{ marginTop: 14 }}>{teil === "ek" ? <ErweiternKuerzen /> : <Gleichnamig />}</div>
    </div>
  );
}

/* ---------- Modus 2: Üben ---------- */
export function neueAufgabe(art) {
  return { id: ++zaehler, ...bruchAufgabe(art) };
}

const fr = (b) => `$${bt(b)}$`;

export function schritteVon(au) {
  const eingabe = zw("Gib den Bruch als 3/4 ein.", "Enter the fraction as 3/4.");
  if (au.art === "kuerzen") {
    const teiler = [];
    for (let d = 2; d < au.ggt; d++) if (au.ggt % d === 0) teiler.push(d);
    return [
      { id: "br-k-ggt", titel: zw("Größter gemeinsamer Teiler", "Greatest common divisor"), typ: "zahl", text: `ggT(${au.start.z}; ${au.start.n}) =`, wert: au.ggt, toleranz: 1e-9, wertText: String(au.ggt),
        frage: zw("Durch welche größte Zahl lassen sich Zähler und Nenner beide teilen?", "What is the largest number that divides both numerator and denominator?"),
        fehler: teiler.map((d) => ({ wert: d, text: zw(`${d} teilt beide – aber es gibt einen größeren gemeinsamen Teiler. Mit ${d} müsstest du danach noch weiter kürzen.`, `${d} divides both – but there is a larger common divisor. With ${d} you'd have to simplify again afterwards.`) })),
        hinweise: [zw("Zerlege beide Zahlen in Primfaktoren und nimm die gemeinsamen.", "Split both numbers into prime factors and take the common ones.")],
        erklaerung: zw(`ggT(${au.start.z}; ${au.start.n}) = ${au.ggt}`, `gcd(${au.start.z}, ${au.start.n}) = ${au.ggt}`) },
      { id: "br-k-erg", titel: zw("Gekürzter Bruch", "Simplified fraction"), typ: "zahl", text: `$${rohTex(au.start)}$ =`, wert: qNum(au.ergebnis), toleranz: 1e-9, wertText: fr(au.ergebnis), gekuerzt: true, breite: 120,
        frage: `${zw("Kürze vollständig.", "Simplify fully.")} ${eingabe}`,
        hinweise: [zw(`Teile Zähler und Nenner durch ${au.ggt}.`, `Divide numerator and denominator by ${au.ggt}.`)],
        erklaerung: `$\\frac{${au.start.z}}{${au.start.n}} = \\frac{${au.start.z} : ${au.ggt}}{${au.start.n} : ${au.ggt}} = ${bt(au.ergebnis)}$` },
    ];
  }
  if (au.art === "erweitern") {
    return [
      { id: "br-e-f", titel: zw("Erweiterungsfaktor", "Expansion factor"), typ: "zahl", text: zw("Faktor =", "Factor ="), wert: au.faktor, toleranz: 1e-9, wertText: String(au.faktor),
        frage: zw(`Mit welcher Zahl musst du erweitern, damit aus dem Nenner ${au.start.n} der Nenner ${au.ziel} wird?`, `By which number must you expand so the denominator ${au.start.n} becomes ${au.ziel}?`),
        fehler: [{ wert: au.ziel - au.start.n, text: zw("Erweitern heißt malnehmen, nicht addieren.", "Expanding means multiplying, not adding.") }],
        hinweise: [`${au.ziel} : ${au.start.n}`], erklaerung: `${au.ziel} : ${au.start.n} = ${au.faktor}` },
      { id: "br-e-z", titel: zw("Neuer Zähler", "New numerator"), typ: "zahl", text: zw("Zähler =", "Numerator ="), wert: au.zaehler, toleranz: 1e-9, wertText: String(au.zaehler),
        frage: zw("Wie heißt der neue Zähler?", "What is the new numerator?"),
        fehler: [{ wert: au.start.z, text: zw("Den Zähler musst du mit demselben Faktor malnehmen wie den Nenner.", "Multiply the numerator by the same factor as the denominator.") },
          { wert: au.start.z + au.faktor, text: zw("Malnehmen, nicht addieren.", "Multiply, don't add.") }],
        hinweise: [`${au.start.z} · ${au.faktor}`],
        erklaerung: `$${bt(au.start)} = \\frac{${au.start.z} · ${au.faktor}}{${au.start.n} · ${au.faktor}} = \\frac{${au.zaehler}}{${au.ziel}}$` },
    ];
  }
  if (au.art === "addieren" || au.art === "subtrahieren") {
    const op = au.art === "addieren" ? "+" : "−";
    const roh = au.art === "addieren" ? au.za + au.zb : au.za - au.zb;
    return [
      { id: "br-a-hn", titel: zw("Hauptnenner", "Common denominator"), typ: "zahl", text: zw("Hauptnenner =", "Common denominator ="), wert: au.hn, toleranz: 1e-9, wertText: String(au.hn),
        frage: zw(`Was ist der kleinste gemeinsame Nenner von ${au.a.n} und ${au.b.n}?`, `What is the lowest common denominator of ${au.a.n} and ${au.b.n}?`),
        fehler: [
          ...(au.a.n * au.b.n !== au.hn ? [{ wert: au.a.n * au.b.n, text: zw(`${au.a.n * au.b.n} ist ein gemeinsamer Nenner, aber nicht der kleinste. Mit ${au.hn} werden die Zahlen kleiner.`, `${au.a.n * au.b.n} is a common denominator, but not the lowest. With ${au.hn} the numbers stay smaller.`) }] : []),
          { wert: au.a.n + au.b.n, text: zw("Nenner werden nicht addiert. Gesucht ist die kleinste Zahl, in der beide Nenner aufgehen.", "Denominators are not added. You need the smallest number both denominators divide into.") }],
        hinweise: [zw(`Zähle die Vielfachen von ${Math.max(au.a.n, au.b.n)} auf, bis eines durch ${Math.min(au.a.n, au.b.n)} teilbar ist.`, `List multiples of ${Math.max(au.a.n, au.b.n)} until one is divisible by ${Math.min(au.a.n, au.b.n)}.`)],
        erklaerung: zw(`kgV(${au.a.n}; ${au.b.n}) = ${au.hn}`, `lcm(${au.a.n}, ${au.b.n}) = ${au.hn}`) },
      { id: "br-a-z1", titel: zw("Erster Bruch erweitert", "First fraction expanded"), typ: "zahl", text: zw("Zähler =", "Numerator ="), wert: au.za, toleranz: 1e-9, wertText: String(au.za),
        frage: zw(`Erweitere ${fr(au.a)} auf den Nenner ${au.hn}. Wie heißt der neue Zähler?`, `Expand ${fr(au.a)} to denominator ${au.hn}. What is the new numerator?`),
        fehler: [{ wert: au.a.z, text: zw("Der Zähler wird mit demselben Faktor erweitert wie der Nenner.", "The numerator is expanded by the same factor as the denominator.") }],
        hinweise: [`${au.a.z} · ${au.hn / au.a.n}`], erklaerung: `$${bt(au.a)} = \\frac{${au.za}}{${au.hn}}$` },
      { id: "br-a-z2", titel: zw("Zweiter Bruch erweitert", "Second fraction expanded"), typ: "zahl", text: zw("Zähler =", "Numerator ="), wert: au.zb, toleranz: 1e-9, wertText: String(au.zb),
        frage: zw(`Und ${fr(au.b)} auf den Nenner ${au.hn}?`, `And ${fr(au.b)} to denominator ${au.hn}?`),
        fehler: [{ wert: au.b.z, text: zw("Der Zähler wird mit demselben Faktor erweitert wie der Nenner.", "The numerator is expanded by the same factor as the denominator.") }],
        hinweise: [`${au.b.z} · ${au.hn / au.b.n}`], erklaerung: `$${bt(au.b)} = \\frac{${au.zb}}{${au.hn}}$` },
      { id: "br-a-erg", titel: zw("Ergebnis", "Result"), typ: "zahl", text: `${fr(au.a)} ${op} ${fr(au.b)} =`, wert: qNum(au.ergebnis), toleranz: 1e-9, wertText: fr(au.ergebnis), gekuerzt: true, breite: 120,
        frage: `${zw("Rechne aus und kürze vollständig.", "Calculate and simplify fully.")} ${eingabe}`,
        fehler: [{ wert: au.falsch, toleranz: 1e-9, text: zw("Zähler und Nenner getrennt zu rechnen geht nur beim Malnehmen. Beim Addieren und Subtrahieren bleibt der gemeinsame Nenner stehen.", "Working on numerators and denominators separately only works when multiplying. When adding or subtracting, the common denominator stays.") }],
        hinweise: [`$\\frac{${au.za} ${op} ${au.zb}}{${au.hn}}$`],
        erklaerung: `$\\frac{${au.za}}{${au.hn}} ${op} \\frac{${au.zb}}{${au.hn}} = \\frac{${roh}}{${au.hn}}${roh !== au.ergebnis.z || au.hn !== au.ergebnis.n ? ` = ${bt(au.ergebnis)}` : ""}$` },
    ];
  }
  if (au.art === "multiplizieren") {
    return [
      { id: "br-m-r", titel: zw("Regel", "Rule"), typ: "wahl",
        frage: zw("Wie multipliziert man zwei Brüche?", "How do you multiply two fractions?"),
        optionen: [["a", zw("Zähler mal Zähler, Nenner mal Nenner", "numerator times numerator, denominator times denominator")], ["b", zw("erst auf den Hauptnenner bringen", "first bring to a common denominator")], ["c", zw("mit dem Kehrwert malnehmen", "multiply by the reciprocal")]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Den Hauptnenner braucht man nur beim Addieren und Subtrahieren.", "You only need the common denominator for adding and subtracting.") },
          { wahl: "c", text: zw("Der Kehrwert gehört zum Dividieren.", "The reciprocal belongs to division.") }],
        hinweise: [zw("Malnehmen ist die einfachste Bruchrechnung.", "Multiplying is the easiest fraction operation.")], erklaerung: zw("Zähler mal Zähler, Nenner mal Nenner.", "Numerator times numerator, denominator times denominator.") },
      { id: "br-m-erg", titel: zw("Ergebnis", "Result"), typ: "zahl", text: `${fr(au.a)} · ${fr(au.b)} =`, wert: qNum(au.ergebnis), toleranz: 1e-9, wertText: fr(au.ergebnis), gekuerzt: true, breite: 120,
        frage: `${zw("Kürze am besten schon vor dem Ausmultiplizieren über Kreuz.", "Best simplify across before multiplying out.")} ${eingabe}`,
        hinweise: [`$\\frac{${au.a.z} · ${au.b.z}}{${au.a.n} · ${au.b.n}}$`],
        erklaerung: `$\\frac{${au.a.z} · ${au.b.z}}{${au.a.n} · ${au.b.n}} = ${rohTex(au.ungekuerzt)} = ${bt(au.ergebnis)}$` },
    ];
  }
  if (au.art === "dividieren" || au.art === "doppel") {
    const doppel = au.art === "doppel";
    const kehr = q(au.b.n, au.b.z);
    return [
      { id: doppel ? "br-dd-r" : "br-d-r", titel: doppel ? zw("Doppelbruch lesen", "Reading a complex fraction") : zw("Kehrwert", "Reciprocal"), typ: "wahl",
        frage: doppel ? zw("Was bedeutet der Hauptbruchstrich?", "What does the main fraction bar mean?") : zw("Durch einen Bruch teilt man, indem man …", "You divide by a fraction by …"),
        optionen: doppel
          ? [["a", `${fr(au.a)} : ${fr(au.b)}`], ["b", `${fr(au.a)} · ${fr(au.b)}`], ["c", `${fr(au.b)} : ${fr(au.a)}`]]
          : [["a", zw(`mit dem Kehrwert ${fr(kehr)} malnimmt`, `multiplying by the reciprocal ${fr(kehr)}`)], ["b", zw(`mit ${fr(au.b)} malnimmt`, `multiplying by ${fr(au.b)}`)], ["c", zw("Zähler durch Zähler und Nenner durch Nenner teilt", "dividing numerator by numerator and denominator by denominator")]],
        richtig: "a",
        fehler: doppel
          ? [{ wahl: "b", text: zw("Ein Bruchstrich ist ein Geteiltzeichen, kein Malzeichen.", "A fraction bar is a division sign, not a multiplication sign.") }, { wahl: "c", text: zw("Oben steht, was geteilt wird – unten, wodurch.", "The top is what is divided – the bottom is what you divide by.") }]
          : [{ wahl: "b", text: zw("Dann hättest du multipliziert. Beim Teilen wird der zweite Bruch umgedreht.", "Then you would have multiplied. When dividing, flip the second fraction.") },
            { wahl: "c", text: zw("Geht nur, wenn alles glatt aufgeht. Sicher ist: mit dem Kehrwert malnehmen.", "Only works if everything divides evenly. The safe way: multiply by the reciprocal.") }],
        hinweise: [zw("Teilen durch einen Bruch = malnehmen mit dem Kehrwert.", "Dividing by a fraction = multiplying by its reciprocal.")],
        erklaerung: doppel ? `${fr(au.a)} : ${fr(au.b)}` : zw(`Kehrwert von ${fr(au.b)} ist ${fr(kehr)}.`, `The reciprocal of ${fr(au.b)} is ${fr(kehr)}.`) },
      { id: doppel ? "br-dd-erg" : "br-d-erg", titel: zw("Ergebnis", "Result"), typ: "zahl", text: `${fr(au.a)} : ${fr(au.b)} =`, wert: qNum(au.ergebnis), toleranz: 1e-9, wertText: fr(au.ergebnis), gekuerzt: true, breite: 120,
        frage: `${zw("Rechne aus und kürze vollständig.", "Calculate and simplify fully.")} ${eingabe}`,
        fehler: [{ wert: qNum(au.a) * qNum(au.b), toleranz: 1e-9, text: zw("Du hast multipliziert statt mit dem Kehrwert.", "You multiplied instead of using the reciprocal.") },
          { wert: qNum(au.b) / qNum(au.a), toleranz: 1e-9, text: zw("Falscher Bruch umgedreht: Der Kehrwert wird vom Teiler (dem zweiten Bruch) gebildet.", "Wrong fraction flipped: take the reciprocal of the divisor (the second fraction).") }],
        hinweise: [`${fr(au.a)} · ${fr(kehr)}`],
        erklaerung: `$${bt(au.a)} : ${bt(au.b)} = ${bt(au.a)} · ${bt(kehr)} = ${bt(au.ergebnis)}$` },
    ];
  }
  if (au.art === "gemischt") {
    return [
      { id: "br-g-u1", titel: zw("Erste Zahl als Bruch", "First number as a fraction"), typ: "zahl", text: `$${au.g1}${bt(au.r1)}$ =`, wert: qNum(au.u1), toleranz: 1e-9, wertText: fr(au.u1), gekuerzt: true, breite: 110,
        frage: `${zw("Schreibe die gemischte Zahl als unechten Bruch.", "Write the mixed number as an improper fraction.")} ${eingabe}`,
        fehler: [{ wert: (au.g1 * au.r1.z) / au.r1.n, toleranz: 1e-9, text: zw("Eine gemischte Zahl ist eine Summe: Ganze plus Bruch, nicht mal.", "A mixed number is a sum: whole plus fraction, not times.") },
          { wert: (au.g1 + au.r1.z) / au.r1.n, toleranz: 1e-9, text: zw(`Die Ganzen müssen erst in ${au.r1.n}tel umgerechnet werden: ${au.g1} = $\\frac{${au.g1 * au.r1.n}}{${au.r1.n}}$.`, `Convert the wholes into parts first: ${au.g1} = $\\frac{${au.g1 * au.r1.n}}{${au.r1.n}}$.`) }],
        hinweise: [`$\\frac{${au.g1} · ${au.r1.n} + ${au.r1.z}}{${au.r1.n}}$`], erklaerung: `$${au.g1}${bt(au.r1)} = \\frac{${au.g1 * au.r1.n} + ${au.r1.z}}{${au.r1.n}} = ${bt(au.u1)}$` },
      { id: "br-g-u2", titel: zw("Zweite Zahl als Bruch", "Second number as a fraction"), typ: "zahl", text: `$${au.g2}${bt(au.r2)}$ =`, wert: qNum(au.u2), toleranz: 1e-9, wertText: fr(au.u2), gekuerzt: true, breite: 110,
        frage: zw("Und die zweite.", "And the second one."),
        hinweise: [`$\\frac{${au.g2} · ${au.r2.n} + ${au.r2.z}}{${au.r2.n}}$`], erklaerung: `$${au.g2}${bt(au.r2)} = ${bt(au.u2)}$` },
      { id: "br-g-erg", titel: zw("Summe", "Sum"), typ: "zahl", text: `${fr(au.u1)} + ${fr(au.u2)} =`, wert: qNum(au.ergebnis), toleranz: 1e-9, wertText: fr(au.ergebnis), gekuerzt: true, breite: 120,
        frage: `${zw("Addiere und kürze vollständig (als unechter Bruch).", "Add and simplify fully (as an improper fraction).")} ${eingabe}`,
        hinweise: [zw(`Hauptnenner: ${kgV(au.u1.n, au.u2.n)}`, `Common denominator: ${kgV(au.u1.n, au.u2.n)}`)],
        erklaerung: `$${bt(au.u1)} + ${bt(au.u2)} = ${bt(au.ergebnis)}$` },
    ];
  }
  if (au.art === "anteil") {
    return [
      { id: "br-an-1", titel: zw("Ein Teil", "One part"), typ: "zahl", text: `$\\frac{1}{${au.b.n}}$ ${zw("von", "of")} ${au.ganzes} =`, wert: au.teil, toleranz: 1e-9, wertText: String(au.teil),
        frage: zw(`Teile das Ganze in ${au.b.n} gleiche Teile. Wie groß ist ein Teil?`, `Split the whole into ${au.b.n} equal parts. How big is one part?`),
        fehler: [{ wert: au.ganzes / au.b.z, text: zw("Geteilt wird durch den Nenner – er sagt, in wie viele Teile das Ganze zerfällt.", "Divide by the denominator – it says how many parts the whole is split into.") }],
        hinweise: [`${au.ganzes} : ${au.b.n}`], erklaerung: `${au.ganzes} : ${au.b.n} = ${au.teil}` },
      { id: "br-an-2", titel: zw("Der Anteil", "The share"), typ: "zahl", text: `${fr(au.b)} ${zw("von", "of")} ${au.ganzes} =`, wert: au.ergebnis, toleranz: 1e-9, wertText: String(au.ergebnis),
        frage: zw(`Nimm ${au.b.z} solcher Teile.`, `Take ${au.b.z} such parts.`),
        hinweise: [`${au.teil} · ${au.b.z}`], erklaerung: `${fr(au.b)} · ${au.ganzes} = ${au.teil} · ${au.b.z} = ${au.ergebnis}` },
    ];
  }
  /* vergleichen */
  return [
    { id: "br-v-hn", titel: zw("Gleichnamig machen", "Common denominator"), typ: "zahl", text: zw("Hauptnenner =", "Common denominator ="), wert: au.hn, toleranz: 1e-9, wertText: String(au.hn),
      frage: zw("Bringe beide Brüche auf den kleinsten gemeinsamen Nenner. Welcher ist das?", "Bring both fractions to the lowest common denominator. Which is it?"),
      fehler: au.a.n * au.b.n !== au.hn ? [{ wert: au.a.n * au.b.n, text: zw(`Geht auch, aber ${au.hn} ist kleiner.`, `Works too, but ${au.hn} is smaller.`) }] : [],
      hinweise: [zw(`Vielfache von ${Math.max(au.a.n, au.b.n)}`, `Multiples of ${Math.max(au.a.n, au.b.n)}`)], erklaerung: `${fr(au.a)} = $\\frac{${au.za}}{${au.hn}}$, ${fr(au.b)} = $\\frac{${au.zb}}{${au.hn}}$` },
    { id: "br-v-w", titel: zw("Vergleichen", "Compare"), typ: "wahl",
      frage: zw("Welcher Bruch ist größer?", "Which fraction is larger?"),
      optionen: [["a", fr(au.a)], ["b", fr(au.b)]], richtig: au.groesser,
      fehler: [{ wahl: au.groesser === "a" ? "b" : "a", text: zw("Vergleiche die Zähler, nachdem beide Brüche denselben Nenner haben.", "Compare the numerators once both fractions have the same denominator.") }],
      hinweise: [zw("Bei gleichem Nenner gewinnt der größere Zähler.", "With equal denominators, the larger numerator wins.")],
      erklaerung: `$\\frac{${au.za}}{${au.hn}} ${au.za > au.zb ? ">" : "<"} \\frac{${au.zb}}{${au.hn}}$` },
  ];
}

function aufgabenText(au) {
  if (au.art === "kuerzen") return <>{zw("Kürze den Bruch vollständig: ", "Simplify fully: ")}{T(rohTex(au.start))}</>;
  if (au.art === "erweitern") return <>{zw(`Erweitere auf den Nenner ${au.ziel}: `, `Expand to the denominator ${au.ziel}: `)}{T(bt(au.start))}</>;
  if (au.art === "addieren") return <>{zw("Berechne: ", "Calculate: ")}{T(`${bt(au.a)} + ${bt(au.b)}`)}</>;
  if (au.art === "subtrahieren") return <>{zw("Berechne: ", "Calculate: ")}{T(`${bt(au.a)} − ${bt(au.b)}`)}</>;
  if (au.art === "multiplizieren") return <>{zw("Berechne: ", "Calculate: ")}{T(`${bt(au.a)} · ${bt(au.b)}`)}</>;
  if (au.art === "dividieren") return <>{zw("Berechne: ", "Calculate: ")}{T(`${bt(au.a)} : ${bt(au.b)}`)}</>;
  if (au.art === "doppel") return <>{zw("Vereinfache den Doppelbruch: ", "Simplify the complex fraction: ")}{T(`\\frac{${bt(au.a)}}{${bt(au.b)}}`)}</>;
  if (au.art === "gemischt") return <>{zw("Berechne: ", "Calculate: ")}{T(`${au.g1}${bt(au.r1)} + ${au.g2}${bt(au.r2)}`)}</>;
  if (au.art === "anteil") return <>{zw("Wie viel sind ", "How much is ")}{T(bt(au.b))}{zw(` von ${au.ganzes} €?`, ` of €${au.ganzes}?`)}</>;
  return <>{zw("Welcher Bruch ist größer: ", "Which fraction is larger: ")}{T(bt(au.a))}{zw(" oder ", " or ")}{T(bt(au.b))}?</>;
}

const TITEL = {
  kuerzen: ["Kürzen", "Simplify"], erweitern: ["Erweitern", "Expand"], addieren: ["Addieren", "Add"], subtrahieren: ["Subtrahieren", "Subtract"],
  multiplizieren: ["Multiplizieren", "Multiply"], dividieren: ["Dividieren", "Divide"], gemischt: ["Gemischte Zahlen", "Mixed numbers"],
  anteil: ["Anteil berechnen", "Find a share"], doppel: ["Doppelbruch", "Complex fraction"], vergleichen: ["Vergleichen", "Compare"],
};

function hilfe(au) {
  return hilfeKontext({
    id: `bruch-${au.art}`, aufgabe: "Bruchrechnen Brüche kürzen erweitern Hauptnenner addieren multiplizieren dividieren Kehrwert",
    verstehen: [zw("Der Nenner sagt, in wie viele gleiche Teile das Ganze zerlegt ist; der Zähler, wie viele davon gemeint sind.", "The denominator says how many equal parts the whole is split into; the numerator how many of them are meant.")],
    ansatz: [zw("Plus und minus: erst gleichnamig machen. Mal: Zähler mal Zähler, Nenner mal Nenner. Geteilt: mit dem Kehrwert malnehmen.", "Plus and minus: common denominator first. Times: numerator × numerator, denominator × denominator. Divided: multiply by the reciprocal.")],
    regel: [zw("Erweitern und Kürzen ändern den Wert nicht.", "Expanding and simplifying don't change the value."), zw("Am Ende immer vollständig kürzen.", "Always simplify fully at the end.")],
    pruefen: [zw("Ist das Ergebnis plausibel (z. B. kleiner als 1, wenn beide Brüche klein sind)?", "Is the result plausible (e.g. less than 1 when both fractions are small)?"), zw("Haben Zähler und Nenner noch einen gemeinsamen Teiler?", "Do numerator and denominator still share a divisor?")],
  });
}

function Ueben() {
  // Wunsch einer Lernseite (uebenWunsch.js): gleich mit einem bestimmten Aufgabentyp starten
  const [art, setArt] = useState(() => { const w = uebenWunschHolen("bruchrechnen"); return w && w.art && BRUCH_ARTEN.includes(w.art) ? w.art : "mix"; });
  const [au, setAu] = useState(() => neueAufgabe(art === "mix" ? null : art));
  const [stand, setStand] = useState(0);
  const neu = (a = art) => { setAu(neueAufgabe(a === "mix" ? null : a)); setStand(0); };
  const schritte = useMemo(() => schritteVon(au), [au]);
  const ARTEN = [["mix", zw("Gemischt", "Mixed")], ...BRUCH_ARTEN.map((a) => [a, zw(TITEL[a][0], TITEL[a][1])])];
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  return (
    <>
      {/* Aufgabe zuerst (21.10.): Typ-Chips hinter der Einstellungs-Pille */}
      <EinstellungsPille kennung="bruchrechnen" teile={[[zw("Aufgabentyp", "Exercise type"), (ARTEN.find(([id]) => id === art) || ARTEN[0])[1]]]}>
        <div data-aufgabentyp style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ARTEN.map(([id, t]) => (
            <button key={id} type="button" aria-pressed={art === id} onClick={() => { setArt(id); neu(id); }}
              style={{ padding: "6px 11px", borderRadius: 999, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${art === id ? C.see : C.linie}`, background: art === id ? C.see : C.weiss, color: art === id ? C.weiss : C.see }}>{t}</button>
          ))}
        </div>
      </EinstellungsPille>
      <div style={{ ...karte, marginTop: 12 }} key={au.id}>
        <p style={kicker}>{zw(TITEL[au.art][0], TITEL[au.art][1])}</p>
        <p style={{ ...hinweis, color: C.tinte, fontSize: 15.5, marginBottom: 4 }}>{aufgabenText(au)}</p>
        <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig – und vollständig gekürzt.", "Correct – and fully simplified.")} />
        <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe(au)} /></div>
      </div>
    </>
  );
}

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Trainieren", "Train")]];

export function Bruchrechnen() {
  const [modus, setModus] = useState(() => startModus("bruchrechnen"));
  const kurzErklaert = (
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
          <p style={{ margin: "0 0 6px" }}><b>{zw("Plus und minus:", "Plus and minus:")}</b> {zw("erst auf den Hauptnenner bringen, dann die Zähler verrechnen.", "first bring to the common denominator, then combine the numerators.")}</p>
          <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: 16 }}>{T("\\frac{1}{3} + \\frac{1}{4} = \\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}")}</p>
          <p style={{ margin: "0 0 6px" }}><b>{zw("Mal:", "Times:")}</b> {zw("Zähler mal Zähler, Nenner mal Nenner – vorher über Kreuz kürzen.", "numerator times numerator, denominator times denominator – simplify across first.")}</p>
          <p style={{ margin: 0 }}><b>{zw("Geteilt:", "Divided:")}</b> {zw("mit dem Kehrwert des zweiten Bruchs malnehmen.", "multiply by the reciprocal of the second fraction.")} {T("\\frac{2}{3} : \\frac{4}{5} = \\frac{2}{3} · \\frac{5}{4} = \\frac{5}{6}")}</p>
        </Aufklapp>
  );
  return (
    <Seite titel={zw("Brüche rechnen", "Working with fractions")}
      text={zw("Kürzen, erweitern, plus, minus, mal und geteilt – mit Bruchstreifen zum Sehen und Aufgaben, die jeden typischen Fehler gezielt ansprechen.",
        "Simplify, expand, add, subtract, multiply and divide – with fraction strips to see it and exercises that address every typical mistake.")} knapp={modus === "ueben"}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Brüche rechnen", "Working with fractions")} />
      {modus === "entdecken" && kurzErklaert}
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}><Ueben /></div>
      {modus === "ueben" && kurzErklaert}
    </Seite>
  );
}

