/* ============================================================
   Unterstufe · Daten und Diagramme
   · Entdecken – fünf Häufigkeiten mit Reglern: Säulen- und Kreis-
     diagramm, relative Häufigkeiten, Mittelwert, Median, Spannweite live
   · Üben – Mittelwert, Median, Spannweite, relative Häufigkeit in %,
     Winkel im Kreisdiagramm, Säulendiagramm ablesen
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { zt } from "./ui3.jsx";
import { DATEN_ARTEN, datenAufgabe, median, mittelwert } from "./unterGen.js";
import { Merke, Regler, UebenRahmen, WertZeile, ZweiModi, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";

let zaehler = 0;
const z = (v) => zt(v, 2);
const FARBEN = [C.see, C.flaggold, C.smaragd, C.granaHell, C.lila || "#6B4FA0"];

export function Saeulen({ kat, werte, hoehe = 170, markiert = -1, max = null }) {
  const W = 320, m = max ?? Math.max(...werte, 1), b = (W - 40) / kat.length;
  const Y = (v) => hoehe - 22 - (v / m) * (hoehe - 40);
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Säulendiagramm", "Bar chart")}>
      {Array.from({ length: m + 1 }, (_, i) => <g key={i}><line x1="30" y1={Y(i)} x2={W - 6} y2={Y(i)} stroke={`${C.see}${i % 5 === 0 ? "33" : "14"}`} /><text x="24" y={Y(i) + 4} textAnchor="end" style={{ fontSize: 10, fill: C.grau, fontFamily: "inherit" }}>{m > 12 && i % 5 ? "" : i}</text></g>)}
      {kat.map((k, i) => (
        <g key={k}>
          <rect x={34 + i * b + b * 0.15} y={Y(werte[i])} width={b * 0.7} height={Y(0) - Y(werte[i])} rx="3" fill={i === markiert ? C.flaggold : FARBEN[i % 5]} opacity={markiert >= 0 && i !== markiert ? 0.55 : 0.9} />
          <text x={34 + i * b + b / 2} y={hoehe - 6} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: C.tinte, fontFamily: "inherit" }}>{k}</text>
        </g>
      ))}
    </svg>
  );
}

function Kreisdiagramm({ werte, kat }) {
  const summe = werte.reduce((s, x) => s + x, 0) || 1, R = 70, cx = 90, cy = 85;
  let w0 = -90;
  return (
    <svg viewBox="0 0 320 170" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Kreisdiagramm", "Pie chart")}>
      {werte.map((v, i) => {
        const w = (v / summe) * 360, a0 = w0 * Math.PI / 180, a1 = (w0 + w) * Math.PI / 180;
        const p = `M ${cx} ${cy} L ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A ${R} ${R} 0 ${w > 180 ? 1 : 0} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z`;
        w0 += w;
        return v > 0 ? (w >= 359.99 ? <circle key={i} cx={cx} cy={cy} r={R} fill={FARBEN[i % 5]} /> : <path key={i} d={p} fill={FARBEN[i % 5]} stroke={C.weiss} strokeWidth="1.5" />) : null;
      })}
      {kat.map((k, i) => (
        <g key={k}>
          <rect x="190" y={22 + i * 26} width="14" height="14" rx="3" fill={FARBEN[i % 5]} />
          <text x="210" y={34 + i * 26} style={{ fontSize: 12, fontFamily: "inherit", fill: C.tinte }}>{k}: {zt(werte[i] / summe * 360, 1)}°</text>
        </g>
      ))}
    </svg>
  );
}

function Entdecken() {
  const kat = [zw("Fußball", "Football"), zw("Tanzen", "Dance"), zw("Musik", "Music"), zw("Schwimmen", "Swimming"), zw("Lesen", "Reading")];
  const kurz = ["A", "B", "C", "D", "E"];
  const [w, setW] = useState([8, 5, 6, 3, 2]);
  const setze = (i) => (v) => setW(w.map((x, k) => (k === i ? v : x)));
  const summe = w.reduce((s, x) => s + x, 0);
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Umfrage: Lieblingshobby der Klasse", "Survey: the class's favourite hobby")}</p>
        <div style={{ display: "grid", gap: 6 }}>{kat.map((k, i) => <Regler key={k} name={`${kurz[i]} ${k}`} wert={w[i]} setWert={setze(i)} min={0} max={12} schritt={1} farbe={FARBEN[i]} format={(v) => String(v)} breiteName={104} />)}</div>
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}><Saeulen kat={kurz} werte={w} max={12} /></div>
        <div style={{ marginTop: 8, background: C.sand, borderRadius: 14, padding: 6 }}><Kreisdiagramm werte={w} kat={kurz} /></div>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{zw("Kennwerte", "Statistics")}</p>
        <WertZeile links={zw("Gesamtzahl", "Total")} rechts={summe} />
        <WertZeile links={zw(`Relative Häufigkeit A (${kat[0]})`, `Relative frequency A (${kat[0]})`)} rechts={`${zt(summe ? w[0] / summe * 100 : 0, 1)} %`} />
        <WertZeile links={zw("Mittelwert der Säulen", "Mean of the bars")} rechts={z(mittelwert(w))} farbe={C.gruen} />
        <WertZeile links={zw("Median der Säulen", "Median of the bars")} rechts={z(median(w))} farbe={C.gruen} />
        <WertZeile links={zw("Spannweite", "Range")} rechts={Math.max(...w) - Math.min(...w)} />
        <Merke>{zw("Im Kreisdiagramm bekommt jede Gruppe den Winkel Anteil · 360°. Der Median ist robust: Eine einzelne sehr hohe Säule verschiebt den Mittelwert stark, den Median kaum. Probier es mit A = 12 aus.", "In a pie chart each group gets the angle share · 360°. The median is robust: one very high bar shifts the mean a lot, the median hardly at all. Try A = 12.")}</Merke>
      </div>
    </>
  );
}

const TITEL = { mittelwert: ["Mittelwert", "Mean"], median: ["Median", "Median"], spannweite: ["Spannweite", "Range"], relativ: ["Relative Häufigkeit", "Relative frequency"], kreis: ["Kreisdiagramm", "Pie chart"], ablesen: ["Diagramm ablesen", "Read the chart"] };
const neue = (art) => ({ id: ++zaehler, ...datenAufgabe(art) });

function schritte(d) {
  switch (d.art) {
    case "mittelwert": {
      const s = d.l.reduce((a, x) => a + x, 0);
      return [
        zs("da-s", zw("Summe", "Sum"), zw("Summe =", "Sum ="), s, zw("Addiere alle Werte.", "Add all values."), { hinweis: d.l.join(" + "), erkl: `${d.l.join(" + ")} = ${s}` }),
        zs("da-m", zw("Mittelwert", "Mean"), "x̄ =", d.wert, zw(`Teile durch die Anzahl der Werte (${d.l.length}).`, `Divide by the number of values (${d.l.length}).`), { fehler: [{ wert: s / (d.l.length - 1), text: zw("Zähle die Werte noch einmal.", "Count the values again.") }, { wert: median(d.l), text: zw("Das ist der Median, nicht der Mittelwert.", "That's the median, not the mean.") }].filter((f) => f.wert !== d.wert), hinweis: `${s} : ${d.l.length}`, erkl: `${s} : ${d.l.length} = ${z(d.wert)}` }),
      ];
    }
    case "median": return [
      zs("da-me", zw("Median", "Median"), zw("Median =", "Median ="), d.wert, zw(`Sortiere die Werte. ${d.l.length % 2 ? "Der mittlere Wert ist der Median." : "Bei gerader Anzahl: Mittelwert der beiden mittleren."}`, `Sort the values. ${d.l.length % 2 ? "The middle value is the median." : "With an even count: average of the two middle ones."}`),
        { fehler: [{ wert: d.l[d.l.length >> 1], text: zw("Erst sortieren!", "Sort first!") }, { wert: mittelwert(d.l), text: zw("Das ist der Mittelwert.", "That's the mean.") }].filter((f) => Math.abs(f.wert - d.wert) > 1e-9), hinweis: d.sortiert.join(", "), erkl: zw(`sortiert: ${d.sortiert.join(", ")} → Median ${z(d.wert)}`, `sorted: ${d.sortiert.join(", ")} → median ${z(d.wert)}`) }),
    ];
    case "spannweite": { const mx = Math.max(...d.l), mn = Math.min(...d.l), k = mn < 0 ? `(−${-mn})` : String(mn); return [zs("da-sp", zw("Spannweite", "Range"), zw("Spannweite =", "Range ="), d.wert, zw("Größter minus kleinster Wert.", "Largest minus smallest value."), { fehler: [{ wert: mx + mn, text: zw("Abziehen, nicht addieren – und Vorzeichen beachten.", "Subtract, don't add – and watch the signs.") }].filter((f) => f.wert !== d.wert), hinweis: `${mx} − ${k}`, erkl: `${mx} − ${k} = ${d.wert}` })]; }
    case "relativ": return [
      zs("da-r1", zw("Anteil", "Share"), zw("Anteil =", "Share ="), d.teil / d.gesamt, zw("Teil durch Ganzes (als Dezimalzahl).", "Part divided by whole (as a decimal)."), { tol: 0.001, fehler: [{ wert: d.gesamt / d.teil, text: zw("Umgekehrt: Teil : Ganzes.", "The other way round: part : whole.") }], hinweis: `${d.teil} : ${d.gesamt}`, erkl: zt(d.teil / d.gesamt, 4) }),
      zs("da-r2", zw("In Prozent", "As a percentage"), "=", d.prozent, zw("Wie viel Prozent sind das?", "What percentage is that?"), { einheit: "%", tol: 0.01, hinweis: zw("mal 100", "times 100"), erkl: `${z(d.prozent)} %` }),
    ];
    case "kreis": return [zs("da-k", zw("Winkel", "Angle"), zw("Winkel =", "Angle ="), d.winkel, zw("Wie groß ist der Winkel im Kreisdiagramm?", "How large is the angle in the pie chart?"), { einheit: "°", tol: 0.051, fehler: [{ wert: d.z / d.n * 100, tol: 0.051, text: zw("Das sind Prozent. Ein voller Kreis hat 360°.", "That's a percentage. A full circle has 360°.") }], hinweis: `360° · ${d.z} : ${d.n}`, erkl: `360° · ${d.z} : ${d.n} = ${zt(d.winkel, 1)}°` })];
    default: return [zs("da-a", zw("Ablesen", "Read"), `${d.kat[d.i]}:`, d.wert, zw(`Wie viele Besucher kamen am ${d.kat[d.i]}?`, `How many visitors came on ${d.kat[d.i]}?`), { hinweis: zw("Fahre von der Säulenspitze waagerecht zur Achse.", "Move horizontally from the top of the bar to the axis."), erkl: String(d.wert) })];
  }
}
function text(d) {
  switch (d.art) {
    case "mittelwert": return zw(`Noten bzw. Punkte: ${d.l.join(", ")}. Berechne den Mittelwert.`, `Marks or points: ${d.l.join(", ")}. Calculate the mean.`);
    case "median": return zw(`Weitsprung in dm: ${d.l.join(", ")}. Bestimme den Median.`, `Long jump in dm: ${d.l.join(", ")}. Find the median.`);
    case "spannweite": return zw(`Temperaturen in °C: ${d.l.map((x) => String(x).replace("-", "−")).join(", ")}. Wie groß ist die Spannweite?`, `Temperatures in °C: ${d.l.map((x) => String(x).replace("-", "−")).join(", ")}. What is the range?`);
    case "relativ": return zw(`Von ${d.gesamt} Befragten fahren ${d.teil} mit dem Rad zur Schule.`, `Of ${d.gesamt} people asked, ${d.teil} cycle to school.`);
    case "kreis": return zw(`Eine Gruppe macht $\\frac{${d.z}}{${d.n}}$ aller Befragten aus.`, `A group makes up $\\frac{${d.z}}{${d.n}}$ of all people asked.`);
    default: return zw("Das Säulendiagramm zeigt Besucherzahlen (in Hundert) einer Ausstellung.", "The bar chart shows the visitors (in hundreds) of an exhibition.");
  }
}
const skizze = (d) => (d.art === "ablesen" ? <Saeulen kat={d.kat} werte={d.werte} max={10} /> : null);
const hilfe = (d) => hilfeKontext({
  id: `daten-${d.art}`, aufgabe: "Daten Diagramm Mittelwert Median Spannweite Häufigkeit Kreisdiagramm Säulendiagramm",
  verstehen: [zw("Wie viele Werte gibt es? Was ist das Ganze?", "How many values are there? What is the whole?")],
  ansatz: [zw("Mittelwert = Summe : Anzahl. Median = Mitte der sortierten Liste. Spannweite = Max − Min.", "Mean = sum : count. Median = middle of the sorted list. Range = max − min.")],
  regel: [zw("Relative Häufigkeit = Teil : Ganzes. Kreiswinkel = Anteil · 360°.", "Relative frequency = part : whole. Pie angle = share · 360°.")],
  pruefen: [zw("Liegt der Mittelwert zwischen kleinstem und größtem Wert?", "Is the mean between the smallest and the largest value?")],
});

export function DatenDiagramme() {
  return (
    <ZweiModi animationen={werkzeugAnimationen("diagramme")} titel={zw("Daten und Diagramme", "Data and charts")}
      text={zw("Säulen- und Kreisdiagramme, relative Häufigkeiten, Mittelwert, Median und Spannweite – mit einer Umfrage, die du selbst einstellst.", "Bar and pie charts, relative frequencies, mean, median and range – with a survey you set up yourself.")}
      kurz={<p style={{ margin: 0 }}>{zw("Mittelwert x̄ = Summe : Anzahl · Median: mittlerer Wert der sortierten Liste · Spannweite = größter − kleinster Wert · relative Häufigkeit = absolute Häufigkeit : Gesamtzahl · Kreiswinkel = Anteil · 360°.", "Mean x̄ = sum : count · median: middle value of the sorted list · range = largest − smallest · relative frequency = absolute frequency : total · pie angle = share · 360°.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={DATEN_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
