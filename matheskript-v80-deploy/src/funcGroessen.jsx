/* ============================================================
   Unterstufe · Größen umrechnen
   · Entdecken – Größenart und Einheit wählen, Zahl eingeben: die
     Umrechnungstreppe zeigt alle Einheiten mit Faktor zwischen den Stufen
   · Üben – Länge, Masse, Zeit, Fläche, Volumen, Hohlmaße, Maßstab;
     erst entscheiden „größer oder kleiner?“, dann Faktor, dann Ergebnis
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Auswahl, ZahlFeld, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { liesZahl, zt } from "./ui3.jsx";
import { EINHEITEN, GROESSEN_ARTEN, groessenAufgabe, umrechnen } from "./unterGen.js";
import { Merke, UebenRahmen, WertZeile, ZweiModi, ws, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { Arbeitsflaeche, BildKarte, FeinKarte, Werkzeugleiste, titelStil, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { ChipAuswahl, ErgebnisKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const z = (v) => zt(v, 7);
/* Tabelle: große Zahlen mit Tausenderpunkten (250.000) */
const zg = (v) => (Math.abs(v) >= 10000 ? v.toLocaleString("de-DE", { maximumFractionDigits: 7 }) : z(v));
const NAME = { laenge: zw("Länge", "Length"), masse: zw("Masse", "Mass"), zeit: zw("Zeit", "Time"), flaeche: zw("Fläche", "Area"), volumen: zw("Volumen", "Volume"), hohlmass: zw("Hohlmaße", "Liquid measures"), massstab: zw("Maßstab", "Scale") };

function Treppe({ art }) {
  const E = EINHEITEN[art];
  // Echte Pixel am Desktop (DESKTOP-STIL.md): gemessene Breite, Stufen höher; Handy unverändert 320
  const [ref, breite] = useBreite();
  const desktop = useDesktop();
  const gr = desktop && breite;
  const W = gr ? breite : 320, n = E.namen.length, b = (W - 20) / n, st = gr ? Math.round(Math.min(44, Math.max(24, 190 / n))) : 14, H = (gr ? 56 : 40) + n * st;
  const fu = gr ? 14 : 12, ff = gr ? 12 : 10;   // Schrift Einheit / Faktor
  return (
    <div ref={ref}><svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Umrechnungstreppe", "Conversion staircase")}>
      {E.namen.map((u, i) => {
        const x = 10 + i * b, y = H - (gr ? 40 : 18) - i * st;
        return (
          <g key={u}>
            <rect x={x} y={y} width={b - 4} height={H - y - 6} rx="5" fill={`${C.see}${(20 + i * 12).toString(16)}`} stroke={C.see} strokeWidth="1" />
            <text x={x + (b - 4) / 2} y={y + (gr ? 22 : 15)} textAnchor="middle" style={{ fontSize: fu, fontWeight: 800, fill: C.seeTief, fontFamily: "inherit" }}>{u}</text>
            {i > 0 && <text x={x - 2} y={y - (gr ? 8 : 4)} textAnchor="middle" style={{ fontSize: ff, fontWeight: 700, fill: "#8A6A00", fontFamily: "inherit" }}>·{zt(E.faktor[i] / E.faktor[i - 1], 0)}</text>}
          </g>
        );
      })}
    </svg></div>
  );
}

function Entdecken() {
  const [art, setArt] = useState("laenge");
  const [von, setVon] = useState("m");
  const [eing, setEing] = useState("2,5");
  const E = EINHEITEN[art];
  const v = liesZahl(eing) ?? 0;
  const einheit = E.namen.includes(von) ? von : E.namen[Math.min(2, E.namen.length - 1)];
  const desktop = useDesktop();
  const arten = Object.keys(EINHEITEN).map((k) => [k, NAME[k]]);
  const waehleArt = (k) => { setArt(k); setVon(EINHEITEN[k].namen[Math.min(2, EINHEITEN[k].namen.length - 1)]); };
  const tabelle = E.namen.map((u) => <WertZeile key={u} links={u} rechts={`${zg(umrechnen(v, art, einheit, u))} ${u}`} farbe={u === einheit ? "#8A6A00" : C.see} />);
  const merkeText = zw("Eine Stufe hinunter (zur kleineren Einheit): mal die Umrechnungszahl – die Zahl wird größer. Eine Stufe hinauf: geteilt – die Zahl wird kleiner. Bei Fläche ist die Umrechnungszahl das Quadrat (100), bei Volumen der Würfel (1000) der Längen-Zahl 10.",
    "One step down (to the smaller unit): times the conversion number – the number gets bigger. One step up: divided – the number gets smaller. For area the conversion number is the square (100), for volume the cube (1000) of the length number 10.");
  if (desktop) {
    const haelfte = Math.ceil(E.namen.length / 2);
    return (
      <div style={{ marginTop: 16 }} data-groessen="breit">
        <Arbeitsflaeche
          links={<>
            <ErgebnisKarte titel={zw("Ausgangswert", "Starting value")}>
              <div style={{ display: "grid", gap: 10 }}>
                <ZahlFeld wert={eing} setWert={setEing} label={zw("Zahl", "Number")} breite="100%" />
                <ChipAuswahl optionen={E.namen.map((u) => [u, u])} wert={einheit} setWert={setVon} label={zw("Einheit", "Unit")} />
              </div>
            </ErgebnisKarte>
            <ErgebnisKarte><p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.tinte }}>{merkeText}</p></ErgebnisKarte>
          </>}
          rechts={<>
            <BildKarte style={{ padding: "14px 10px 6px" }}><Treppe art={art} /></BildKarte>
            <Werkzeugleiste gruppen={[{ titel: zw("Größe wählen", "Choose a quantity"), inhalt: <ChipAuswahl optionen={arten} wert={art} setWert={waehleArt} label={zw("Größe", "Quantity")} /> }]} />
          </>} />
        <FeinKarte style={{ marginTop: 20 }}>
          <p style={titelStil}>{zw("In allen Einheiten", "In all units")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: 32 }}>
            <div>{tabelle.slice(0, haelfte)}</div>
            <div>{tabelle.slice(haelfte)}</div>
          </div>
        </FeinKarte>
      </div>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Größe wählen", "Choose a quantity")}</p>
      <Auswahl optionen={arten} wert={art} setWert={waehleArt} label={zw("Größe", "Quantity")} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <ZahlFeld wert={eing} setWert={setEing} label={zw("Zahl", "Number")} breite={110} />
        <Auswahl optionen={E.namen.map((u) => [u, u])} wert={einheit} setWert={setVon} label={zw("Einheit", "Unit")} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}><Treppe art={art} /></div>
      {tabelle}
      <Merke>{merkeText}</Merke>
    </div>
  );
}

const TITEL = { laenge: ["Längen", "Lengths"], masse: ["Massen", "Masses"], zeit: ["Zeit", "Time"], flaeche: ["Flächen", "Areas"], volumen: ["Volumen", "Volumes"], hohlmass: ["Hohlmaße", "Liquid measures"], massstab: ["Maßstab", "Scale"] };
const neue = (art) => ({ id: ++zaehler, ...groessenAufgabe(art) });

function schritte(a) {
  if (a.art === "massstab") return [
    zs("gr-m1", zw("In Wirklichkeit (cm)", "In reality (cm)"), zw("Wirklich =", "Real ="), a.cm, zw(`1 cm auf der Karte sind ${a.m.toLocaleString("de-DE")} cm in Wirklichkeit. Wie viele cm sind ${zt(a.karte, 1)} cm auf der Karte?`, `1 cm on the map is ${a.m} cm in reality. How many cm are ${zt(a.karte, 1)} cm on the map?`), { einheit: "cm", fehler: [{ wert: a.karte / a.m, text: zw("Die Wirklichkeit ist größer: malnehmen.", "Reality is bigger: multiply.") }], hinweis: `${zt(a.karte, 1)} · ${a.m}`, erkl: `${zt(a.karte, 1)} · ${a.m} = ${z(a.cm)} cm` }),
    zs("gr-m2", zw("Passende Einheit", "Suitable unit"), `${zw("Wirklich", "Real")} =`, a.wirklich, zw(`Rechne in ${a.einheit} um.`, `Convert to ${a.einheit}.`), { einheit: a.einheit, tol: 1e-6, fehler: [{ wert: a.einheit === "km" ? a.cm / 1000 : a.cm / 1000, text: zw(a.einheit === "km" ? "1 km = 100 000 cm." : "1 m = 100 cm.", a.einheit === "km" ? "1 km = 100,000 cm." : "1 m = 100 cm.") }], hinweis: a.einheit === "km" ? `${z(a.cm)} : 100 000` : `${z(a.cm)} : 100`, erkl: `${z(a.wirklich)} ${a.einheit}` }),
  ];
  const E = EINHEITEN[a.art];
  const f = E.faktor[E.namen.indexOf(a.von)] / E.faktor[E.namen.indexOf(a.nach)];
  const faktor = f >= 1 ? f : 1 / f;
  return [
    ws("gr-r", zw("Richtung", "Direction"), zw(`Von ${a.von} nach ${a.nach}: Wird die Zahl größer oder kleiner?`, `From ${a.von} to ${a.nach}: does the number get bigger or smaller?`),
      [["g", zw("größer", "bigger")], ["k", zw("kleiner", "smaller")]], f >= 1 ? "g" : "k",
      { fehler: [{ wahl: f >= 1 ? "k" : "g", text: f >= 1 ? zw(`${a.nach} ist die kleinere Einheit – man braucht mehr davon.`, `${a.nach} is the smaller unit – you need more of them.`) : zw(`${a.nach} ist die größere Einheit – man braucht weniger davon.`, `${a.nach} is the larger unit – you need fewer of them.`) }],
        hinweis: zw("Kleine Einheit → große Zahl.", "Small unit → big number."), erkl: f >= 1 ? zw("größer (kleinere Einheit)", "bigger (smaller unit)") : zw("kleiner (größere Einheit)", "smaller (larger unit)") }),
    zs("gr-f", zw("Umrechnungszahl", "Conversion number"), `1 ${f >= 1 ? a.von : a.nach} =`, faktor, zw(`Wie viele ${f >= 1 ? a.nach : a.von} sind 1 ${f >= 1 ? a.von : a.nach}?`, `How many ${f >= 1 ? a.nach : a.von} make 1 ${f >= 1 ? a.von : a.nach}?`), { einheit: f >= 1 ? a.nach : a.von, fehler: a.art === "flaeche" ? [{ wert: Math.sqrt(faktor), text: zw("Bei Flächen ist es 100 pro Stufe, nicht 10.", "For areas it's 100 per step, not 10.") }] : a.art === "volumen" ? [{ wert: Math.cbrt(faktor), text: zw("Bei Volumen ist es 1000 pro Stufe.", "For volume it's 1000 per step.") }] : a.art === "zeit" ? [{ wert: 100, text: zw("Zeit geht nicht im Zehnersystem: 1 h = 60 min, 1 min = 60 s, 1 d = 24 h.", "Time isn't decimal: 1 h = 60 min, 1 min = 60 s, 1 d = 24 h.") }] : [],
      hinweis: zw("Schau auf die Treppe im Modus Entdecken.", "Look at the staircase in Explore mode."), erkl: `1 ${f >= 1 ? a.von : a.nach} = ${z(faktor)} ${f >= 1 ? a.nach : a.von}` }),
    zs("gr-e", zw("Umrechnen", "Convert"), `${z(a.wert)} ${a.von} =`, a.ergebnis, zw(`Rechne in ${a.nach} um.`, `Convert to ${a.nach}.`), { einheit: a.nach, tol: Math.max(1e-9, a.ergebnis * 1e-9), wertText: z(a.ergebnis), fehler: [{ wert: f >= 1 ? a.wert / faktor : a.wert * faktor, tol: 1e-9, text: zw("Falsche Richtung: mal und geteilt vertauscht.", "Wrong direction: times and divide swapped.") }], hinweis: f >= 1 ? `${z(a.wert)} · ${z(faktor)}` : `${z(a.wert)} : ${z(faktor)}`, erkl: `${z(a.wert)} ${a.von} = ${z(a.ergebnis)} ${a.nach}` }),
  ];
}

const text = (a) => (a.art === "massstab"
  ? zw(`Auf einer Karte im Maßstab 1 : ${a.m.toLocaleString("de-DE")} sind zwei Orte ${zt(a.karte, 1)} cm voneinander entfernt.`, `On a map with scale 1 : ${a.m} two places are ${zt(a.karte, 1)} cm apart.`)
  : zw(`Rechne um: ${z(a.wert)} ${a.von} in ${a.nach}.`, `Convert: ${z(a.wert)} ${a.von} into ${a.nach}.`));
const skizze = (a) => (a.art === "massstab" ? null : <Treppe art={a.art} />);

const hilfe = (a) => hilfeKontext({
  id: `groessen-${a.art}`, aufgabe: "Größen umrechnen Einheiten Länge Masse Zeit Fläche Volumen Liter Maßstab",
  verstehen: [zw("Welche Einheit ist größer? Wie viele Stufen liegen dazwischen?", "Which unit is larger? How many steps are in between?")],
  ansatz: [zw("Zur kleineren Einheit: mal. Zur größeren Einheit: geteilt. Bei 10, 100, 1000: Komma verschieben.", "To the smaller unit: multiply. To the larger unit: divide. With 10, 100, 1000: move the decimal point.")],
  regel: [zw("Länge ·10 (km ·1000), Fläche ·100, Volumen ·1000, Masse ·1000, Zeit ·60 (Tag ·24), 1 l = 1 dm³.", "Length ·10 (km ·1000), area ·100, volume ·1000, mass ·1000, time ·60 (day ·24), 1 l = 1 dm³.")],
  pruefen: [zw("Kleine Einheit → große Zahl. Passt das?", "Small unit → big number. Does it fit?")],
});

export function GroessenUmrechnen() {
  return (
    <ZweiModi animationen={werkzeugAnimationen("groessen")} titel={zw("Größen umrechnen", "Converting units")}
      text={zw("Länge, Masse, Zeit, Fläche, Volumen und Liter: mit der Umrechnungstreppe sicher umrechnen – plus Maßstab auf Karten.", "Length, mass, time, area, volume and litres: convert safely with the conversion staircase – plus map scales.")}
      kurz={<p style={{ margin: 0 }}>{zw("1 km = 1000 m, 1 m = 10 dm = 100 cm = 1000 mm · 1 t = 1000 kg, 1 kg = 1000 g · 1 h = 60 min · 1 m² = 100 dm² · 1 m³ = 1000 dm³ · 1 dm³ = 1 l = 1000 ml.", "1 km = 1000 m, 1 m = 10 dm = 100 cm = 1000 mm · 1 t = 1000 kg, 1 kg = 1000 g · 1 h = 60 min · 1 m² = 100 dm² · 1 m³ = 1000 dm³ · 1 dm³ = 1 l = 1000 ml.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={GROESSEN_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
