/* ============================================================
   Unterstufe/Mittelstufe · Prozent- und Zinsrechnung
   · Entdecken – Prozentstreifen: Grundwert und Prozentsatz einstellen,
     Prozentwert wächst mit; Dreisatz und Formel nebeneinander
   · Üben – Prozentwert, Grundwert, Prozentsatz, Rabatt, Mehrwertsteuer,
     Netto aus Brutto (Falle), Zinsen, Zinseszins
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { zt } from "./ui3.jsx";
import { PROZENT_ARTEN, prozentAufgabe } from "./unterGen.js";
import { Merke, Regler, UebenRahmen, WertZeile, ZweiModi, ws, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { Arbeitsflaeche, BildKarte, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { ErgebnisKarte, ErklaerKarte, StellKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const z2 = (v) => zt(v, 2);
const eu = (v) => `${zt(v, 2)} €`;

function Streifen({ G, p }) {
  // Echte Pixel am Desktop (DESKTOP-STIL.md): gemessene Breite, Streifen höher; Handy unverändert 320 × 96
  const [ref, breite] = useBreite();
  const desktop = useDesktop();
  const gr = desktop && breite;
  const W = gr ? breite : 320, x = (W - 20) * Math.min(p, 100) / 100 + 10;
  const H = gr ? 200 : 96, oben = gr ? 52 : 22, hb = gr ? 52 : 30;            // Höhe, Streifen oben, Streifenhöhe
  const yo = oben - 8, yu = oben + hb + 20, yw = gr ? oben + hb + 58 : 90, yp = oben + hb / 2 + (gr ? 5 : 0) + (gr ? 0 : 0);
  const t = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700, fontSize: gr ? 13 : 11.5 };
  return (
    <div ref={ref}><svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Prozentstreifen", "Percentage bar")}>
      <text x="10" y={gr ? yo : 14} style={{ ...t, fill: C.grau }}>0 %</text>
      <text x={W - 10} y={gr ? yo : 14} textAnchor="end" style={{ ...t, fill: C.grau }}>100 %</text>
      <rect x="10" y={oben} width={W - 20} height={hb} rx="6" fill={C.weiss} stroke={C.tinte} strokeWidth="1.5" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={10 + (W - 20) * (i + 1) / 10} y1={oben} x2={10 + (W - 20) * (i + 1) / 10} y2={oben + hb} stroke={`${C.tinte}33`} />)}
      <rect x="10" y={oben} width={x - 10} height={hb} rx="6" fill={`${C.flaggold}AA`} />
      <text x={x} y={gr ? yp : 44} textAnchor={p > 85 ? "end" : "start"} dx={p > 85 ? -6 : 6} style={{ ...t, fill: C.seeTief }}>{zt(p, 0)} %</text>
      <text x="10" y={gr ? yu : 72} style={{ ...t, fill: C.grau }}>0 €</text>
      <text x={W - 10} y={gr ? yu : 72} textAnchor="end" style={{ ...t, fill: C.see }}>G = {eu(G)}</text>
      <text x={x} y={gr ? yw : 90} textAnchor="middle" style={{ ...t, fill: "#8A6A00", ...(gr ? { fontSize: 15 } : {}) }}>W = {eu(G * p / 100)}</text>
    </svg></div>
  );
}

function Entdecken() {
  const [G, setG] = useState(80);
  const [p, setP] = useState(25);
  const W = G * p / 100;
  const desktop = useDesktop();
  const wege = <>
    <WertZeile links={zw("Dreisatz: 100 % ≙", "Rule of three: 100 % ≙")} rechts={eu(G)} />
    <WertZeile links={zw("1 % ≙", "1 % ≙")} rechts={eu(G / 100)} />
    <WertZeile links={`${p} % ≙`} rechts={eu(W)} farbe="#8A6A00" />
    <WertZeile links={<M t={`W = G · \\frac{p}{100} = ${zt(G, 0)} · ${zt(p / 100, 2)}`} />} rechts={eu(W)} farbe="#8A6A00" />
  </>;
  const merkeText = zw("Prozent heißt „von Hundert“: p % sind p Hundertstel. Der Grundwert G ist immer das Ganze (100 %), der Prozentwert W der Teil davon.", "Percent means “per hundred”: p % are p hundredths. The base value G is always the whole (100 %), the percentage value W the part of it.");
  if (desktop) {
    return (
      <div style={{ marginTop: 16 }} data-prozent="breit">
        <Arbeitsflaeche
          links={<>
            <StellKarte titel={zw("Prozentstreifen", "Percentage bar")} werte={[
              { name: "G", wert: G, setWert: setG, min: 10, max: 500, schritt: 10, format: (v) => `${v} €`, regler: true },
              { name: "p %", wert: p, setWert: setP, min: 0, max: 100, schritt: 5, farbe: C.gruen, format: (v) => `${v} %`, regler: true },
            ]} />
            <ErgebnisKarte titel={zw("Prozentwert", "Percentage value")}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#8A6A00", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>W = {eu(W)}</p>
            </ErgebnisKarte>
          </>}
          rechts={<BildKarte style={{ padding: "22px 14px 14px" }}><Streifen G={G} p={p} /></BildKarte>} />
        <ErklaerKarte style={{ marginTop: 20 }} titel={zw("Zwei Wege zum Prozentwert", "Two ways to the percentage value")} links={wege} rechts={merkeText} />
      </div>
    );
  }
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Prozentstreifen", "Percentage bar")}</p>
        <div style={{ display: "grid", gap: 8 }}>
          <Regler name="G" wert={G} setWert={setG} min={10} max={500} schritt={10} format={(v) => `${v} €`} />
          <Regler name="p %" wert={p} setWert={setP} min={0} max={100} schritt={5} farbe={C.gruen} format={(v) => `${v} %`} />
        </div>
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}><Streifen G={G} p={p} /></div>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{zw("Zwei Wege zum Prozentwert", "Two ways to the percentage value")}</p>
        {wege}
        <Merke>{merkeText}</Merke>
      </div>
    </>
  );
}

const TITEL = {
  prozentwert: ["Prozentwert", "Percentage value"], grundwert: ["Grundwert", "Base value"], prozentsatz: ["Prozentsatz", "Percentage rate"], rabatt: ["Rabatt", "Discount"],
  mwst: ["Mehrwertsteuer", "VAT"], netto: ["Netto aus Brutto", "Net from gross"], zinsen: ["Zinsen", "Interest"], zinseszins: ["Zinseszins", "Compound interest"],
};
const neue = (art) => ({ id: ++zaehler, ...prozentAufgabe(art) });

function schritte(a) {
  if (a.art === "prozentwert") return [
    zs("pz-1", zw("Ein Prozent", "One percent"), "1 % ≙", a.G / 100, zw("Wie viel sind 1 %?", "How much is 1 %?"), { einheit: "€", fehler: [{ wert: a.G, text: zw("Das sind 100 %. Teile durch 100.", "That's 100 %. Divide by 100.") }], hinweis: `${a.G} : 100`, erkl: `${a.G} € : 100 = ${eu(a.G / 100)}` }),
    zs("pz-w", zw("Prozentwert", "Percentage value"), `${a.p} % ≙`, a.W, zw(`Wie viel sind ${a.p} %?`, `How much is ${a.p} %?`), { einheit: "€", fehler: [{ wert: a.G / a.p, text: zw("Geteilt statt mal: W = G · p : 100.", "Divided instead of multiplied: W = G · p : 100.") }, { wert: a.G - a.W, text: zw("Das ist der Rest bis 100 %.", "That's the rest up to 100 %.") }], hinweis: `${z2(a.G / 100)} · ${a.p}`, erkl: `W = ${a.G} · ${a.p} : 100 = ${eu(a.W)}` }),
  ];
  if (a.art === "grundwert") return [
    zs("pz-g1", zw("Ein Prozent", "One percent"), "1 % ≙", a.W / a.p, zw(`${a.p} % sind ${eu(a.W)}. Wie viel ist 1 %?`, `${a.p} % is ${eu(a.W)}. How much is 1 %?`), { einheit: "€", tol: 0.0051, hinweis: `${z2(a.W)} : ${a.p}`, erkl: eu(a.W / a.p) }),
    zs("pz-g", zw("Grundwert", "Base value"), "G =", a.G, zw("Wie groß ist das Ganze (100 %)?", "How big is the whole (100 %)?"), { einheit: "€", tol: 0.011, fehler: [{ wert: a.W * a.p / 100, text: zw("G ist größer als W – rechne 1 % mal 100.", "G is larger than W – take 1 % times 100.") }], hinweis: `${z2(a.W / a.p)} · 100`, erkl: `G = ${z2(a.W)} : ${a.p} · 100 = ${eu(a.G)}` }),
  ];
  if (a.art === "prozentsatz") return [
    zs("pz-anteil", zw("Anteil", "Share"), "W : G =", a.W / a.G, zw("Welcher Anteil ist W vom Ganzen? (als Dezimalzahl)", "What share of the whole is W? (as a decimal)"), { tol: 0.0001, fehler: [{ wert: a.G / a.W, text: zw("Umgekehrt: Teil durch Ganzes.", "The other way round: part divided by whole.") }], hinweis: `${z2(a.W)} : ${a.G}`, erkl: `${z2(a.W)} : ${a.G} = ${zt(a.W / a.G, 4)}` }),
    zs("pz-p", zw("Prozentsatz", "Rate"), "p =", a.p, zw("Wie viel Prozent sind das?", "What percentage is that?"), { einheit: "%", tol: 0.01, fehler: [{ wert: a.W / a.G, text: zw("Noch mal 100 nehmen.", "Multiply by 100.") }], hinweis: `${zt(a.W / a.G, 4)} · 100`, erkl: `p = ${a.p} %` }),
  ];
  if (a.art === "rabatt") return [
    zs("pz-r1", zw("Ersparnis", "Saving"), zw("Rabatt =", "Discount ="), a.abzug, zw(`Wie viel Euro sind ${a.r} % von ${eu(a.preis)}?`, `How many euros are ${a.r} % of ${eu(a.preis)}?`), { einheit: "€", tol: 0.0051, hinweis: `${a.preis} · ${a.r} : 100`, erkl: eu(a.abzug) }),
    zs("pz-r2", zw("Neuer Preis", "New price"), zw("Preis =", "Price ="), a.neu, zw("Was kostet die Ware nach dem Rabatt?", "What does the item cost after the discount?"), { einheit: "€", tol: 0.0051, fehler: [{ wert: a.abzug, text: zw("Das ist die Ersparnis, nicht der neue Preis.", "That's the saving, not the new price.") }], hinweis: zw(`Oder direkt: ${a.preis} · ${zt((100 - a.r) / 100, 2)}`, `Or directly: ${a.preis} · ${zt((100 - a.r) / 100, 2)}`), erkl: `${a.preis} − ${z2(a.abzug)} = ${eu(a.neu)} = ${a.preis} · ${zt((100 - a.r) / 100, 2)}` }),
  ];
  if (a.art === "mwst") return [
    zs("pz-m1", zw("Steuer", "Tax"), zw("Steuer =", "Tax ="), a.steuer, zw("Wie viel sind 19 % Mehrwertsteuer?", "How much is 19 % VAT?"), { einheit: "€", tol: 0.0051, hinweis: `${a.netto} · 0,19`, erkl: eu(a.steuer) }),
    zs("pz-m2", zw("Bruttopreis", "Gross price"), zw("Brutto =", "Gross ="), a.brutto, zw("Was kostet die Ware mit Steuer?", "What does it cost including tax?"), { einheit: "€", tol: 0.0051, hinweis: `${a.netto} · 1,19`, erkl: `${a.netto} · 1,19 = ${eu(a.brutto)}` }),
  ];
  if (a.art === "netto") return [
    ws("pz-n1", zw("Grundwert erkennen", "Spot the base"), zw("Der Bruttopreis enthält 19 % Steuer. Welcher Ansatz stimmt?", "The gross price includes 19 % tax. Which approach is right?"),
      [["a", zw("Brutto entspricht 119 %, also durch 1,19 teilen", "Gross is 119 %, so divide by 1.19")], ["b", zw("19 % vom Bruttopreis abziehen", "subtract 19 % of the gross price")], ["c", zw("Brutto · 0,81", "gross · 0.81")]], "a",
      { fehler: [{ wahl: "b", text: zw("Die 19 % wurden vom Nettopreis berechnet, nicht vom Bruttopreis. Der Grundwert ist der Nettopreis.", "The 19 % were calculated from the net price, not from the gross price. The base value is the net price.") }, { wahl: "c", text: zw("Das ist dieselbe Falle wie „19 % abziehen“.", "That's the same trap as “subtract 19 %”.") }], hinweis: zw("Netto = 100 %, Brutto = 119 %.", "Net = 100 %, gross = 119 %."), erkl: zw("Brutto = 119 % → Netto = Brutto : 1,19", "Gross = 119 % → net = gross : 1.19") }),
    zs("pz-n2", zw("Nettopreis", "Net price"), zw("Netto =", "Net ="), a.netto, zw("Berechne den Nettopreis.", "Calculate the net price."), { einheit: "€", tol: 0.011, fehler: [{ wert: a.brutto * 0.81, tol: 0.011, text: zw("19 % vom Brutto abziehen ist zu viel – teile durch 1,19.", "Subtracting 19 % of the gross is too much – divide by 1.19.") }], hinweis: `${z2(a.brutto)} : 1,19`, erkl: `${z2(a.brutto)} : 1,19 = ${eu(a.netto)}` }),
  ];
  if (a.art === "zinsen") return [
    zs("pz-z", zw("Jahreszinsen", "Annual interest"), "Z =", a.Z, zw("Wie viele Zinsen gibt es nach einem Jahr?", "How much interest after one year?"), { einheit: "€", tol: 0.0051, fehler: [{ wert: a.K + a.Z, tol: 0.0051, text: zw("Das ist das neue Guthaben. Gefragt sind nur die Zinsen.", "That's the new balance. Only the interest is asked.") }], hinweis: `${a.K} · ${zt(a.zs, 1)} : 100`, erkl: `Z = ${a.K} · ${zt(a.zs, 1)} : 100 = ${eu(a.Z)}` }),
    zs("pz-k", zw("Neues Guthaben", "New balance"), "K₁ =", a.K + a.Z, zw("Wie viel ist nach einem Jahr auf dem Konto?", "How much is in the account after one year?"), { einheit: "€", tol: 0.0051, hinweis: `${a.K} + ${z2(a.Z)}`, erkl: eu(a.K + a.Z) }),
  ];
  return [
    zs("pz-q", zw("Zinsfaktor", "Growth factor"), "q =", a.q, zw(`Mit welcher Zahl wird das Guthaben bei ${a.zs} % jedes Jahr multipliziert?`, `By which number is the balance multiplied each year at ${a.zs} %?`), { tol: 1e-6, fehler: [{ wert: a.zs / 100, text: zw("Das sind nur die Zinsen. Das Kapital bleibt ja auch: 1 + p/100.", "That's only the interest. The capital stays too: 1 + p/100.") }], hinweis: `1 + ${a.zs} : 100`, erkl: `q = ${zt(a.q, 2)}` }),
    zs("pz-kn", zw("Guthaben nach Jahren", "Balance after years"), `K${a.n === 2 ? "₂" : "₃"} =`, a.Kn, zw(`Wie viel ist nach ${a.n} Jahren auf dem Konto? (auf Cent runden)`, `How much is in the account after ${a.n} years? (round to cents)`), { einheit: "€", tol: 0.011, fehler: [{ wert: a.K * (1 + a.n * a.zs / 100), tol: 0.011, text: zw("Die Zinsen werden mitverzinst – nicht n-mal dieselben Zinsen, sondern q hoch n.", "The interest earns interest too – not n times the same interest but q to the power n.") }], hinweis: `${a.K} · ${zt(a.q, 2)}^${a.n}`, erkl: `${a.K} · ${zt(a.q, 2)}^${a.n} ≈ ${eu(a.Kn)}` }),
  ];
}

function text(a) {
  if (a.art === "prozentwert") return zw(`Wie viel sind ${a.p} % von ${eu(a.G)}?`, `How much is ${a.p} % of ${eu(a.G)}?`);
  if (a.art === "grundwert") return zw(`${a.p} % eines Betrags sind ${eu(a.W)}. Wie groß ist der Betrag?`, `${a.p} % of an amount is ${eu(a.W)}. How large is the amount?`);
  if (a.art === "prozentsatz") return zw(`Wie viel Prozent sind ${eu(a.W)} von ${eu(a.G)}?`, `What percentage is ${eu(a.W)} of ${eu(a.G)}?`);
  if (a.art === "rabatt") return zw(`Eine Jacke kostet ${eu(a.preis)}. Im Sale gibt es ${a.r} % Rabatt.`, `A jacket costs ${eu(a.preis)}. In the sale there is ${a.r} % off.`);
  if (a.art === "mwst") return zw(`Ein Fahrrad kostet ohne Steuer ${eu(a.netto)}. Dazu kommen 19 % Mehrwertsteuer.`, `A bike costs ${eu(a.netto)} before tax. 19 % VAT is added.`);
  if (a.art === "netto") return zw(`Ein Gerät kostet mit 19 % Mehrwertsteuer ${eu(a.brutto)}. Wie viel kostet es ohne Steuer?`, `A device costs ${eu(a.brutto)} including 19 % VAT. How much without tax?`);
  if (a.art === "zinsen") return zw(`${eu(a.K)} liegen ein Jahr lang zu ${zt(a.zs, 1)} % Zinsen auf dem Konto.`, `${eu(a.K)} are in an account for one year at ${zt(a.zs, 1)} % interest.`);
  return zw(`${eu(a.K)} werden ${a.n} Jahre lang zu ${a.zs} % angelegt; die Zinsen bleiben auf dem Konto.`, `${eu(a.K)} are invested for ${a.n} years at ${a.zs} %; the interest stays in the account.`);
}

const hilfe = (a) => hilfeKontext({
  id: `prozent-${a.art}`, aufgabe: "Prozentrechnung Grundwert Prozentwert Prozentsatz Rabatt Mehrwertsteuer Zinsen Dreisatz",
  verstehen: [zw("Was ist das Ganze (100 %)? Das ist der Grundwert.", "What is the whole (100 %)? That's the base value.")],
  ansatz: [zw("Dreisatz über 1 % – oder Formel W = G · p : 100.", "Rule of three via 1 % – or formula W = G · p : 100.")],
  regel: [zw("Aufschlag: mal (1 + p/100). Abschlag: mal (1 − p/100). Rückwärts: teilen.", "Increase: times (1 + p/100). Decrease: times (1 − p/100). Backwards: divide.")],
  pruefen: [zw("Ist der Teil kleiner als das Ganze (bei p < 100)?", "Is the part smaller than the whole (for p < 100)?")],
});

export function Prozentrechnung() {
  return (
    <ZweiModi werkzeug="prozent" animationen={werkzeugAnimationen("prozent")} titel={zw("Prozent- und Zinsrechnung", "Percentages and interest")}
      text={zw("Grundwert, Prozentsatz, Prozentwert – mit Prozentstreifen und Dreisatz. Dazu Rabatt, Mehrwertsteuer und Zinsen, inklusive der klassischen Rückwärts-Falle.", "Base value, rate, percentage value – with a percentage bar and the rule of three. Plus discounts, VAT and interest, including the classic backwards trap.")}
      kurz={<>
        <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: 16 }}><M t="W = G · \frac{p}{100}" /></p>
        <p style={{ margin: 0 }}>{zw("G = Grundwert (das Ganze), p % = Prozentsatz, W = Prozentwert (der Teil). Zinsen: Z = K · p : 100.", "G = base value (the whole), p % = rate, W = percentage value (the part). Interest: Z = K · p : 100.")}</p>
      </>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={PROZENT_ARTEN} neue={neue} schritte={schritte} text={text} hilfe={hilfe} />} />
  );
}
