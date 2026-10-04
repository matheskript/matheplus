/* ============================================================
   Analysis: Wachstum und Logarithmen
   · Modell aus Messwerten – Quotienten erkennen, Anfangswert,
     Wachstumsfaktor, prozentuale Änderung, k = ln a, diskret oder
     kontinuierlich, Prognose
   · Verdopplung und Halbwertszeit – a^T = 2 bzw. a^T = 1/2 mit
     Logarithmen lösen; umgekehrt aus der Halbwertszeit den Faktor
   · Zielwert erreichen – N₀ · a^t = Z nach t auflösen
   Prüfungen: nur positive Basen (a > 0, a ≠ 1) und positive
   Logarithmusargumente; Einheiten werden immer mitgeführt.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { wahl } from "./rechnen2.js";
import { Aufklapp, FunktionsBild, ModusLeiste, Seite, SchrittFolge, zt } from "./ui3.jsx";

let zaehler = 0;

/* ---------- Sachkontexte ----------
   diskret: Änderung nur zu festen Zeitpunkten (jährliche Zinsgutschrift) */
const KONTEXTE = [
  { id: "bakterien", wachstum: true, diskret: false, t: "h", tLang: zw("Stunden", "hours"), tEins: zw("Stunde", "hour"), g: zw("Bakterien", "bacteria"), N0s: [100, 200, 500, 1000], as: [1.2, 1.25, 1.5, 2],
    text: (N0, a) => zw(`In einer Nährlösung werden ${N0} Bakterien angesetzt. Ihre Anzahl wächst pro Stunde um ${zt((a - 1) * 100, 1)} %.`, `${N0} bacteria are placed in a nutrient solution. Their number grows by ${zt((a - 1) * 100, 1)} % per hour.`) },
  { id: "kapital", wachstum: true, diskret: true, t: zw("Jahre", "years"), tLang: zw("Jahren", "years"), tEins: zw("Jahr", "year"), g: "€", N0s: [1000, 2000, 5000], as: [1.02, 1.03, 1.04, 1.05],
    text: (N0, a) => zw(`Ein Kapital von ${N0} € wird mit ${zt((a - 1) * 100, 1)} % pro Jahr verzinst. Die Zinsen werden am Jahresende gutgeschrieben.`, `A capital of €${N0} earns ${zt((a - 1) * 100, 1)} % interest per year, credited at the end of each year.`) },
  { id: "wirkstoff", wachstum: false, diskret: false, t: "h", tLang: zw("Stunden", "hours"), tEins: zw("Stunde", "hour"), g: "mg", N0s: [200, 400, 800], as: [0.75, 0.8, 0.85, 0.9],
    text: (N0, a) => zw(`Ein Patient erhält ${N0} mg eines Wirkstoffs. Der Körper baut pro Stunde ${zt((1 - a) * 100, 1)} % der jeweils vorhandenen Menge ab.`, `A patient receives ${N0} mg of a drug. The body breaks down ${zt((1 - a) * 100, 1)} % of the amount present per hour.`) },
  { id: "zerfall", wachstum: false, diskret: false, t: zw("Tage", "days"), tLang: zw("Tagen", "days"), tEins: zw("Tag", "day"), g: "g", N0s: [50, 100, 200], as: [0.8, 0.9, 0.95],
    text: (N0, a) => zw(`Von einer radioaktiven Substanz sind anfangs ${N0} g vorhanden. Pro Tag zerfallen ${zt((1 - a) * 100, 1)} % der noch vorhandenen Menge.`, `Initially ${N0} g of a radioactive substance are present. Each day ${zt((1 - a) * 100, 1)} % of the remaining amount decays.`) },
];

const N = (au, t) => au.N0 * au.a ** t;
const r2 = (v) => Math.round(v * 100) / 100;
function modell(filter) {
  const kx = wahl(KONTEXTE.filter(filter || (() => true)));
  return { id: ++zaehler, ...kx, N0: wahl(kx.N0s), a: wahl(kx.as) };
}
const pz = (a) => Math.round((a - 1) * 1000) / 10;   // prozentuale Änderung, z. B. −15
const aT = (a) => zt(a, 4);

const W_REGELN = [
  { gruppe: zw("Wachstum", "Growth"), name: zw("Exponentielles Wachstum", "Exponential growth"), f: "N(t) = N_0 \\cdot a^t = N_0 \\cdot e^{k t}, \\quad k = \\ln a", kurz: zw("a > 1: Wachstum · 0 < a < 1: Abnahme · a = 1 + p/100", "a > 1: growth · 0 < a < 1: decay · a = 1 + p/100") },
  { gruppe: zw("Wachstum", "Growth"), name: zw("Verdopplungs- und Halbwertszeit", "Doubling time and half-life"), f: "T_D = \\frac{\\ln 2}{\\ln a}, \\quad T_H = \\frac{\\ln 2}{-\\ln a}", kurz: zw("unabhängig vom Startwert", "independent of the starting value") },
  { name: "Definition", bereich: "terme" }, { name: "Potenz im Logarithmus", bereich: "terme" }, { name: "Exponentialgleichung", bereich: "terme" },
];
function hilfeW(id, au) {
  return hilfeKontext({
    id, aufgabe: "Wachstum Abnahme Wachstumsfaktor Prozent Logarithmus Halbwertszeit Verdopplungszeit",
    verstehen: [
      zw("Exponentiell heißt: In gleichen Zeitabständen wird mit demselben Faktor multipliziert.", "Exponential means: in equal time steps you multiply by the same factor."),
      au.wachstum ? zw("Wachstum um p % pro Zeiteinheit: Faktor a = 1 + p/100.", "Growth by p % per time unit: factor a = 1 + p/100.") : zw("Abnahme um p % pro Zeiteinheit: Faktor a = 1 − p/100.", "Decrease by p % per time unit: factor a = 1 − p/100."),
      zw(`Achte auf die Zeiteinheit (${au.t}) und die Einheit der Größe (${au.g}).`, `Watch the time unit (${au.t}) and the unit of the quantity (${au.g}).`),
    ],
    ansatz: [
      zw("Ist die Unbekannte die Zeit (im Exponenten) oder ein Wert der Funktion?", "Is the unknown the time (in the exponent) or a function value?"),
      zw("Steht die Unbekannte im Exponenten, isolierst du zuerst die Potenz und logarithmierst dann.", "If the unknown is in the exponent, isolate the power first, then take logarithms."),
      zw("Beispiel: 200 · 1,5^t = 900 ⇒ 1,5^t = 4,5 ⇒ t = ln 4,5 / ln 1,5.", "Example: 200 · 1.5^t = 900 ⇒ 1.5^t = 4.5 ⇒ t = ln 4.5 / ln 1.5."),
    ],
    regel: [
      zw("Welche Regel holt den Exponenten herunter?", "Which rule brings the exponent down?"),
      "ln(aᵗ) = t · ln(a)",
      zw("ln ist nur für positive Zahlen definiert – beide Seiten müssen positiv sein.", "ln is only defined for positive numbers – both sides must be positive."),
    ],
    pruefen: [
      zw("Setze dein Ergebnis in die Ausgangsgleichung ein.", "Plug your result into the original equation."),
      zw("Wachstum: Bestand wird größer; Abnahme: kleiner, aber nie negativ.", "Growth: the amount increases; decay: decreases, but never becomes negative."),
      zw("Hat dein Ergebnis die richtige Einheit?", "Does your result have the right unit?"),
    ],
    regeln: W_REGELN,
  });
}

function Graph({ au, bis, punkte = [], zusatz = [], waagerechte = [] }) {
  const kurve = au.diskret ? [] : [{ f: (t) => N(au, t), farbe: C.see, name: "N(t)" }];
  const pts = au.diskret ? Array.from({ length: Math.floor(bis) + 1 }, (_, t) => ({ x: t, y: N(au, t), farbe: C.see })) : [];
  return <FunktionsBild kurven={kurve} punkte={[...pts, ...punkte]} x0={0} x1={bis} y0={0} y1={Math.max(...[N(au, 0), N(au, bis), ...punkte.map((p) => p.y), ...waagerechte.map((w) => w.y)]) * 1.12}
    hoehe={190} einheitX={`t in ${au.t}`} einheitY={au.g} waagerechte={waagerechte} senkrechte={zusatz} />;
}

/* ---------- Modus 1: Modell aus Messwerten ---------- */
function MesswertModell() {
  const [au, setAu] = useState(() => modell());
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(modell()); setStand(0); };
  const werte = [0, 1, 2, 3].map((t) => r2(N(au, t)));
  const tP = au.diskret ? 10 : 6;
  const NP = N(au, tP);
  const k = Math.log(au.a);
  const schritte = useMemo(() => [
    { id: "art", titel: zw("Art des Wachstums", "Type of growth"), typ: "wahl", frage: zw("Berechne Differenzen und Quotienten aufeinanderfolgender Werte. Was liegt vor?", "Compute differences and quotients of consecutive values. What do you have?"),
      optionen: [["lin", zw("lineares Wachstum – die Differenzen sind gleich", "linear growth – the differences are equal")], ["exp", zw("exponentielles Wachstum bzw. exponentielle Abnahme – die Quotienten sind gleich", "exponential growth or decay – the quotients are equal")]], richtig: "exp",
      fehler: [{ wahl: "lin", text: zw(`Die Differenzen sind ${zt(werte[1] - werte[0], 2)}, ${zt(werte[2] - werte[1], 2)}, ${zt(werte[3] - werte[2], 2)} – nicht gleich. Prüfe die Quotienten.`, `The differences are ${zt(werte[1] - werte[0], 2)}, ${zt(werte[2] - werte[1], 2)}, ${zt(werte[3] - werte[2], 2)} – not equal. Check the quotients.`) }],
      hinweise: [zw("Teile jeden Wert durch den vorherigen.", "Divide each value by the previous one.")],
      erklaerung: zw(`Quotienten: ${zt(werte[1], 2)} : ${zt(werte[0], 2)} ≈ ${aT(werte[1] / werte[0])}, ${zt(werte[2], 2)} : ${zt(werte[1], 2)} ≈ ${aT(werte[2] / werte[1])} – immer derselbe Faktor.`, `Quotients: ${zt(werte[1], 2)} : ${zt(werte[0], 2)} ≈ ${aT(werte[1] / werte[0])}, ${zt(werte[2], 2)} : ${zt(werte[1], 2)} ≈ ${aT(werte[2] / werte[1])} – always the same factor.`) },
    { id: "n0", titel: zw("Anfangswert", "Initial value"), typ: "zahl", text: "N₀ =", wert: au.N0, einheit: au.g, frage: zw("Wie groß ist der Bestand zum Zeitpunkt t = 0?", "How large is the amount at time t = 0?"),
      hinweise: [zw("Lies den Wert bei t = 0 ab.", "Read the value at t = 0.")], erklaerung: `N₀ = N(0) = ${au.N0} ${au.g}.` },
    { id: "a", titel: zw("Wachstumsfaktor", "Growth factor"), typ: "zahl", text: "a =", wert: au.a, toleranz: 0.0005, wertText: aT(au.a),
      frage: zw(`Mit welchem Faktor wird pro ${au.tEins} multipliziert?`, `By which factor is the amount multiplied per ${au.tEins}?`),
      fehler: [{ wert: Math.abs(au.a - 1), toleranz: 0.0005, text: au.wachstum ? zw(`Das ist die Wachstumsrate. Der Faktor ist 1 + ${zt(au.a - 1, 4)}.`, `That is the growth rate. The factor is 1 + ${zt(au.a - 1, 4)}.`) : zw(`Das ist die Abnahmerate. Abnahme um ${zt((1 - au.a) * 100, 1)} % heißt Faktor 1 − ${zt(1 - au.a, 4)}.`, `That is the rate of decrease. A decrease of ${zt((1 - au.a) * 100, 1)} % means factor 1 − ${zt(1 - au.a, 4)}.`) },
        { wert: Math.abs(pz(au.a)), toleranz: 0.05, text: zw("Das ist eine Prozentzahl. Der Faktor ist eine Dezimalzahl in der Nähe von 1.", "That is a percentage. The factor is a decimal close to 1.") }],
      hinweise: [zw("Quotient zweier aufeinanderfolgender Werte.", "Quotient of two consecutive values.")], erklaerung: `a = ${zt(werte[1], 2)} : ${zt(werte[0], 2)} = ${aT(au.a)}.` },
    { id: "p", titel: zw("Prozentuale Änderung", "Percentage change"), typ: "zahl", text: zw("Änderung =", "Change ="), wert: pz(au.a), toleranz: 0.05, einheit: zw(`% pro ${au.tEins}`, `% per ${au.tEins}`), wertText: zt(pz(au.a), 1),
      frage: zw("Um wie viel Prozent ändert sich der Bestand pro Zeiteinheit? (Abnahme mit Minus.)", "By what percentage does the amount change per time unit? (Decrease with a minus sign.)"),
      fehler: [{ wert: au.a * 100, toleranz: 0.05, text: zw(`${zt(au.a * 100, 1)} % ist der neue Bestand im Vergleich zum alten. Die Änderung ist ${zt(au.a * 100, 1)} % − 100 %.`, `${zt(au.a * 100, 1)} % is the new amount relative to the old one. The change is ${zt(au.a * 100, 1)} % − 100 %.`) },
        ...(!au.wachstum ? [{ wert: -pz(au.a), toleranz: 0.05, text: zw("Es ist eine Abnahme – das Vorzeichen ist negativ.", "It is a decrease – the sign is negative.") }] : [])],
      hinweise: [zw("p = (a − 1) · 100 %", "p = (a − 1) · 100 %")], erklaerung: zw(`(${aT(au.a)} − 1) · 100 % = ${zt(pz(au.a), 1)} % pro ${au.tEins}.`, `(${aT(au.a)} − 1) · 100 % = ${zt(pz(au.a), 1)} % per ${au.tEins}.`) },
    { id: "k", titel: zw("Darstellung mit e", "Form with e"), typ: "zahl", text: "k =", wert: k, toleranz: 0.0006, wertText: zt(k, 4), rundung: zw("Auf vier Nachkommastellen.", "To four decimals."),
      frage: zw(`Dieselbe Funktion soll als N(t) = ${au.N0} · e^(k·t) geschrieben werden. Bestimme k.`, `Write the same function as N(t) = ${au.N0} · e^(k·t). Find k.`),
      fehler: [{ wert: au.a - 1, toleranz: 0.0006, text: zw("a − 1 ist nur eine Näherung für kleine Änderungen. Exakt gilt eᵏ = a, also k = ln a.", "a − 1 is only an approximation for small changes. Exactly, eᵏ = a, so k = ln a.") }, { wert: Math.log(au.N0), toleranz: 0.0006, text: zw("k gehört zum Faktor, nicht zum Anfangswert.", "k belongs to the factor, not to the initial value.") }],
      hinweise: [zw("aᵗ = (eᵏ)ᵗ – also muss eᵏ = a sein.", "aᵗ = (eᵏ)ᵗ – so eᵏ must equal a."), zw("k = ln a", "k = ln a")],
      erklaerung: zw(`eᵏ = ${aT(au.a)} ⇒ k = ln ${aT(au.a)} ≈ ${zt(k, 4)}. ${k < 0 ? "Negatives k bedeutet Abnahme." : "Positives k bedeutet Wachstum."}`, `eᵏ = ${aT(au.a)} ⇒ k = ln ${aT(au.a)} ≈ ${zt(k, 4)}. ${k < 0 ? "Negative k means decay." : "Positive k means growth."}`) },
    { id: "diskret", titel: zw("Diskret oder kontinuierlich?", "Discrete or continuous?"), typ: "wahl",
      frage: zw(`Darf man das Modell für t = 2,5 ${au.t} verwenden?`, `May you use the model for t = 2.5 ${au.t}?`),
      optionen: [["k", zw("Ja – der Vorgang läuft kontinuierlich, N(t) gilt für alle t ≥ 0.", "Yes – the process is continuous, N(t) holds for all t ≥ 0.")], ["d", zw("Nein – der Bestand ändert sich nur zu festen Zeitpunkten (diskretes Modell).", "No – the amount only changes at fixed times (discrete model).")]], richtig: au.diskret ? "d" : "k",
      fehler: au.diskret ? [{ wahl: "k", text: zw("Die Zinsen kommen nur am Jahresende. Nach 2,5 Jahren ist das Kapital so groß wie nach 2 Jahren.", "Interest is only credited at the end of the year. After 2.5 years the capital equals that after 2 years.") }]
        : [{ wahl: "d", text: zw("Bakterien wachsen bzw. Stoffe zerfallen laufend – zwischen den Messzeitpunkten gilt das Modell weiter.", "Bacteria grow or substances decay continuously – the model also holds between measurements.") }],
      hinweise: [zw("Passiert die Änderung ständig oder nur in Sprüngen?", "Does the change happen all the time or only in jumps?")],
      erklaerung: au.diskret ? zw("Diskretes Modell: Kₙ = K₀ · aⁿ nur für ganze n (Jahre). Dazwischen bleibt das Kapital konstant.", "Discrete model: Kₙ = K₀ · aⁿ only for whole n (years). In between the capital stays constant.")
        : zw("Kontinuierliches Modell: N(t) = N₀ · aᵗ für alle reellen t ≥ 0.", "Continuous model: N(t) = N₀ · aᵗ for all real t ≥ 0.") },
    { id: "prognose", titel: zw("Prognose", "Forecast"), typ: "zahl", text: `N(${tP}) ≈`, wert: NP, toleranz: Math.max(0.01, NP * 0.002), einheit: au.g, wertText: zt(NP, 2),
      frage: zw(`Welcher Bestand wird nach ${tP} ${au.tLang} erwartet? (Auf zwei Nachkommastellen.)`, `What amount is expected after ${tP} ${au.tLang}? (To two decimals.)`),
      fehler: [{ wert: au.N0 + tP * (werte[1] - werte[0]), toleranz: 0.02, text: zw("Das wäre lineares Wachstum. Hier wird jede Zeiteinheit mit a multipliziert.", "That would be linear growth. Here you multiply by a every time unit.") }, { wert: au.N0 * au.a * tP, toleranz: 0.02, text: zw("aᵗ ist eine Potenz, nicht a · t.", "aᵗ is a power, not a · t.") }],
      hinweise: [zw(`N(${tP}) = ${au.N0} · ${aT(au.a)}^${tP}`, `N(${tP}) = ${au.N0} · ${aT(au.a)}^${tP}`)], erklaerung: `N(${tP}) = ${au.N0} · ${aT(au.a)}^${tP} ≈ ${zt(NP, 2)} ${au.g}.` },
  ], [au]);
  const zelle = { padding: "6px 8px", borderBottom: `1px solid ${C.linie}`, textAlign: "center", fontSize: 14, fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Modell aus Messwerten", "Model from data")}</p>
        <IchHaengeFest kontext={hilfeW(`w1-${au.id}`, au)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>
        {au.id === "kapital" ? zw("Ein Kapital wird jährlich verzinst; die Zinsen werden am Jahresende gutgeschrieben. Kontostand:", "A capital earns yearly interest, credited at the end of each year. Balance:")
          : au.id === "bakterien" ? zw("In einer Nährlösung wird die Zahl der Bakterien stündlich gezählt:", "The number of bacteria in a nutrient solution is counted every hour:")
            : au.id === "wirkstoff" ? zw("Die Wirkstoffmenge im Blut eines Patienten wird stündlich gemessen:", "The amount of a drug in a patient's blood is measured every hour:")
              : zw("Die Masse einer radioaktiven Substanz wird täglich gemessen:", "The mass of a radioactive substance is measured daily:")}
      </p>
      <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", color: C.tinte, margin: "6px 0 10px" }}>
        <tbody>
          <tr><td style={{ ...zelle, fontWeight: 700, color: C.grau, textAlign: "left", fontSize: 12.5 }}>t in {au.t}</td>{[0, 1, 2, 3].map((t) => <td key={t} style={{ ...zelle, fontWeight: 700 }}>{t}</td>)}</tr>
          <tr><td style={{ ...zelle, fontWeight: 700, color: C.grau, textAlign: "left", fontSize: 12.5 }}>N in {au.g}</td>{werte.map((v, i) => <td key={i} style={zelle}>{zt(v, 2)}</td>)}</tr>
        </tbody>
      </table>
      {stand >= 3 && <Graph au={au} bis={au.diskret ? 10 : 6} punkte={stand >= 7 ? [{ x: tP, y: NP, farbe: C.gruen, name: `N(${tP})` }] : werte.map((v, t) => ({ x: t, y: v, farbe: C.gruen }))} />}
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Modell vollständig: Faktor, Prozentsatz, e-Form, Modelltyp und Prognose.", "Model complete: factor, percentage, e-form, model type and forecast.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Messreihe", "New data")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 2: Verdopplung und Halbwertszeit ---------- */
function zeitAufgabe() {
  if (Math.random() < 0.3) {
    const T = wahl([5, 8, 10, 12, 20]);   // Halbwertszeit vorgegeben → Faktor gesucht
    return { id: ++zaehler, art: "rueck", T, a: 0.5 ** (1 / T), kx: KONTEXTE[3], N0: 100 };
  }
  const au = modell((k) => !k.diskret);
  return { ...au, art: au.wachstum ? "dopp" : "halb" };
}
function Verdopplung() {
  const [au, setAu] = useState(zeitAufgabe);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(zeitAufgabe()); setStand(0); };
  const schritte = useMemo(() => {
    if (au.art === "rueck") {
      const p = (au.a - 1) * 100;
      return [
        { id: "ansatz", titel: zw("Ansatz", "Set-up"), typ: "wahl", frage: zw(`Nach ${au.T} Tagen ist nur noch die Hälfte da. Welche Gleichung gilt für den Tagesfaktor a?`, `After ${au.T} days only half is left. Which equation holds for the daily factor a?`),
          optionen: [["a", `a^${au.T} = 0,5`], ["b", `${au.T} · a = 0,5`], ["c", `a = 0,5^${au.T}`]], richtig: "a",
          fehler: [{ wahl: "b", text: zw("Exponentiell: Pro Tag wird mit a multipliziert, nach T Tagen also mit aᵀ.", "Exponential: each day multiplies by a, after T days by aᵀ.") }, { wahl: "c", text: zw("Andersherum: aᵀ = 0,5, nicht a = 0,5ᵀ.", "The other way round: aᵀ = 0.5, not a = 0.5ᵀ.") }],
          hinweise: [zw("N₀ · aᵀ = ½ N₀ – teile durch N₀.", "N₀ · aᵀ = ½ N₀ – divide by N₀.")], erklaerung: zw(`N₀ · a^${au.T} = 0,5 · N₀ ⇒ a^${au.T} = 0,5.`, `N₀ · a^${au.T} = 0.5 · N₀ ⇒ a^${au.T} = 0.5.`) },
        { id: "a", titel: zw("Tagesfaktor", "Daily factor"), typ: "zahl", text: "a ≈", wert: au.a, toleranz: 0.0006, wertText: zt(au.a, 4), rundung: zw("Auf vier Nachkommastellen.", "To four decimals."),
          frage: zw("Löse nach a auf.", "Solve for a."), fehler: [{ wert: 0.5 / au.T, toleranz: 0.0006, text: zw("Die T-te Wurzel ziehen, nicht durch T teilen.", "Take the T-th root, don't divide by T.") }],
          hinweise: [zw(`a = 0,5^(1/${au.T}) – die ${au.T}-te Wurzel aus 0,5.`, `a = 0.5^(1/${au.T}) – the ${au.T}-th root of 0.5.`)], erklaerung: `a = 0,5^(1/${au.T}) ≈ ${zt(au.a, 4)}.` },
        { id: "p", titel: zw("Abnahme pro Tag", "Decrease per day"), typ: "zahl", text: zw("Änderung ≈", "Change ≈"), wert: p, toleranz: 0.06, einheit: zw("% pro Tag", "% per day"), wertText: zt(p, 2),
          frage: zw("Um wie viel Prozent nimmt die Menge pro Tag ab? (Mit Minus, auf zwei Nachkommastellen.)", "By what percentage does the amount decrease per day? (With a minus, to two decimals.)"),
          fehler: [{ wert: -50 / au.T, toleranz: 0.06, text: zw("Die Halbierung verteilt sich nicht gleichmäßig auf die Tage – die Abnahme ist exponentiell, nicht linear.", "The halving is not spread evenly over the days – the decrease is exponential, not linear.") }],
          hinweise: [zw("p = (a − 1) · 100 %", "p = (a − 1) · 100 %")], erklaerung: `(${zt(au.a, 4)} − 1) · 100 % ≈ ${zt(p, 2)} %.` },
        { id: "k", titel: zw("Zerfallskonstante", "Decay constant"), typ: "zahl", text: "k ≈", wert: Math.log(au.a), toleranz: 0.0006, wertText: zt(Math.log(au.a), 4),
          frage: zw("Schreibe das Modell als N(t) = N₀ · e^(k·t). Bestimme k auf vier Nachkommastellen.", "Write the model as N(t) = N₀ · e^(k·t). Find k to four decimals."),
          hinweise: [zw("k = ln a = ln(0,5)/T", "k = ln a = ln(0.5)/T")], erklaerung: `k = ln(0,5)/${au.T} ≈ ${zt(Math.log(au.a), 4)}.` },
      ];
    }
    const ziel = au.art === "dopp" ? 2 : 0.5;
    const T = Math.log(ziel) / Math.log(au.a);
    const zT = au.art === "dopp" ? "2" : "0,5";
    return [
      { id: "ansatz", titel: zw("Ansatz", "Set-up"), typ: "wahl", frage: au.art === "dopp" ? zw("Nach der Verdopplungszeit T ist der Bestand doppelt so groß. Welche Gleichung gilt?", "After the doubling time T the amount has doubled. Which equation holds?") : zw("Nach der Halbwertszeit T ist nur noch die Hälfte da. Welche Gleichung gilt?", "After the half-life T only half is left. Which equation holds?"),
        optionen: [["a", `${aT(au.a)}^T = ${zT}`], ["b", `${aT(au.a)} · T = ${zT}`], ["c", `${au.N0} · ${aT(au.a)}^T = ${zT}`]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Die Zeit steht im Exponenten, nicht als Faktor.", "Time is in the exponent, not a factor.") }, { wahl: "c", text: zw(`Rechts müsste ${au.art === "dopp" ? "2" : "0,5"} · ${au.N0} stehen. Teilt man durch N₀, fällt der Startwert ganz weg.`, `The right side would have to be ${au.art === "dopp" ? "2" : "0.5"} · ${au.N0}. Dividing by N₀ removes the starting value completely.`) }],
        hinweise: [zw(`N₀ · aᵀ = ${zT} · N₀`, `N₀ · aᵀ = ${zT} · N₀`)], erklaerung: zw(`N₀ · ${aT(au.a)}^T = ${zT} · N₀ ⇒ ${aT(au.a)}^T = ${zT}. Der Startwert spielt keine Rolle.`, `N₀ · ${aT(au.a)}^T = ${zT} · N₀ ⇒ ${aT(au.a)}^T = ${zT}. The starting value does not matter.`) },
      { id: "log", titel: zw("Logarithmieren", "Take logarithms"), typ: "wahl", frage: zw("Wie lautet T?", "What is T?"),
        optionen: [["a", `T = ln(${zT}) / ln(${aT(au.a)})`], ["b", `T = ln(${zT} / ${aT(au.a)})`], ["c", `T = ${zT} / ln(${aT(au.a)})`]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("ln(aᵀ) = T · ln a – der Exponent wird zum Faktor, die Basis bleibt im Logarithmus.", "ln(aᵀ) = T · ln a – the exponent becomes a factor, the base stays inside the log.") }, { wahl: "c", text: zw("Auf beiden Seiten muss logarithmiert werden – auch die rechte Seite.", "Take the log of both sides – the right side too.") }],
        hinweise: [zw("ln auf beiden Seiten, dann ln(aᵀ) = T · ln a.", "ln on both sides, then ln(aᵀ) = T · ln a.")], erklaerung: `T · ln(${aT(au.a)}) = ln(${zT}) ⇒ T = ln(${zT}) / ln(${aT(au.a)}).` },
      { id: "T", titel: au.art === "dopp" ? zw("Verdopplungszeit", "Doubling time") : zw("Halbwertszeit", "Half-life"), typ: "zahl", text: "T ≈", wert: T, toleranz: 0.011, einheit: au.t, wertText: zt(T, 2), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals."),
        frage: zw("Berechne T.", "Compute T."), fehler: [{ wert: -T, toleranz: 0.011, text: zw("Eine Zeitspanne ist positiv. Bei Abnahme sind ln(0,5) und ln(a) beide negativ – der Quotient ist positiv.", "A time span is positive. For decay, ln(0.5) and ln(a) are both negative – their quotient is positive.") }],
        hinweise: [`ln(${zT}) ≈ ${zt(Math.log(ziel), 4)}, ln(${aT(au.a)}) ≈ ${zt(Math.log(au.a), 4)}`], erklaerung: `T = ${zt(Math.log(ziel), 4)} / ${zt(Math.log(au.a), 4)} ≈ ${zt(T, 2)} ${au.t}.` },
      { id: "start", titel: zw("Unabhängig vom Start", "Independent of the start"), typ: "wahl", frage: au.art === "dopp" ? zw(`Wie lange dauert es, bis sich ${2 * au.N0} ${au.g} auf ${4 * au.N0} ${au.g} verdoppelt haben?`, `How long does it take for ${2 * au.N0} ${au.g} to double to ${4 * au.N0} ${au.g}?`) : zw(`Wie lange dauert es, bis von ${au.N0 / 2} ${au.g} nur noch ${au.N0 / 4} ${au.g} übrig sind?`, `How long until ${au.N0 / 2} ${au.g} have dropped to ${au.N0 / 4} ${au.g}?`),
        optionen: [["a", zw(`Wieder T ≈ ${zt(T, 2)} ${au.t}`, `Again T ≈ ${zt(T, 2)} ${au.t}`)], ["b", zw(`Doppelt so lang, ${zt(2 * T, 2)} ${au.t}`, `Twice as long, ${zt(2 * T, 2)} ${au.t}`)], ["c", zw(`Halb so lang, ${zt(T / 2, 2)} ${au.t}`, `Half as long, ${zt(T / 2, 2)} ${au.t}`)]], richtig: "a",
        hinweise: [zw("Spielt N₀ in der Gleichung aᵀ = 2 bzw. aᵀ = 0,5 noch eine Rolle?", "Does N₀ still play a role in aᵀ = 2 or aᵀ = 0.5?")],
        erklaerung: zw("Exponentielle Vorgänge haben eine feste Verdopplungs- bzw. Halbwertszeit – egal, von welchem Wert man startet.", "Exponential processes have a fixed doubling time or half-life – no matter where you start.") },
    ];
  }, [au]);
  const kx = au.art === "rueck" ? au.kx : au;
  const T = au.art === "rueck" ? au.T : Math.log(au.art === "dopp" ? 2 : 0.5) / Math.log(au.a);
  const gAu = { ...au, ...(au.art === "rueck" ? { t: kx.t, g: kx.g, diskret: false } : {}) };
  const marken = [1, 2, 3].map((i) => ({ x: i * T, y: N(gAu, i * T), farbe: C.gruen, name: au.art === "dopp" ? `${2 ** i}·N₀` : `N₀/${2 ** i}` }));
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Verdopplung und Halbwertszeit", "Doubling and half-life")}</p>
        <IchHaengeFest kontext={hilfeW(`w2-${au.id}`, au.art === "rueck" ? { ...kx, wachstum: false } : au)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>
        {au.art === "rueck" ? zw(`Ein radioaktives Isotop hat eine Halbwertszeit von ${au.T} Tagen. Bestimme den Faktor, mit dem die Menge pro Tag multipliziert wird.`, `A radioactive isotope has a half-life of ${au.T} days. Find the factor by which the amount is multiplied each day.`)
          : <>{au.text(au.N0, au.a)} {au.art === "dopp" ? zw("Nach welcher Zeit hat sich die Anzahl verdoppelt?", "After what time has the number doubled?") : zw("Nach welcher Zeit ist nur noch die Hälfte vorhanden?", "After what time is only half left?")}</>}
      </p>
      {stand >= 3 && <Graph au={gAu} bis={Math.min(60, 3.4 * T)} punkte={marken} />}
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Gelöst – mit Logarithmus statt Probieren.", "Solved – with logarithms instead of trial and error.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 3: Zielwert erreichen ---------- */
function zielAufgabe() {
  const au = modell((k) => !k.diskret || Math.random() < 0.5);
  const vergangen = au.wachstum && !au.diskret && Math.random() < 0.2;   // Zielwert lag in der Vergangenheit
  const faktoren = au.diskret ? [1.25, 1.5, 2] : au.wachstum ? (vergangen ? [0.5, 0.25] : [2.5, 3, 4, 5, 10]) : [0.5, 0.3, 0.2, 0.1];
  const Z = r2(au.N0 * wahl(faktoren));
  return { ...au, Z, vergangen, t: au.t, tStern: Math.log(Z / au.N0) / Math.log(au.a) };
}
function Zielwert() {
  const [au, setAu] = useState(zielAufgabe);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(zielAufgabe()); setStand(0); };
  const q = au.Z / au.N0, t = au.tStern;
  const tGanz = Math.ceil(t - 1e-9);
  const antwortRichtig = au.diskret
    ? zw(`Nach ${tGanz} ${au.tLang} (bei der ${tGanz}. Zinsgutschrift) ist der Zielwert von ${au.Z} € erstmals erreicht.`, `After ${tGanz} ${au.tLang} (at the ${tGanz}th interest credit) the target of €${au.Z} is reached for the first time.`)
    : au.vergangen ? zw(`Der Bestand von ${au.Z} ${au.g} lag etwa ${zt(-t, 2)} ${au.t} vor dem Start der Messung vor.`, `The amount of ${au.Z} ${au.g} was present about ${zt(-t, 2)} ${au.t} before the measurement started.`)
      : zw(`Nach etwa ${zt(t, 2)} ${au.t} sind ${au.Z} ${au.g} erreicht.`, `After about ${zt(t, 2)} ${au.t} the amount of ${au.Z} ${au.g} is reached.`);
  const schritte = useMemo(() => [
    { id: "gl", titel: zw("Gleichung", "Equation"), typ: "wahl", frage: zw("Welche Gleichung beschreibt die Frage?", "Which equation describes the question?"),
      optionen: [["a", `${au.N0} · ${aT(au.a)}^t = ${zt(au.Z, 2)}`], ["b", `${au.N0} · ${aT(au.a)} · t = ${zt(au.Z, 2)}`], ["c", `${au.N0} + ${aT(au.a)}^t = ${zt(au.Z, 2)}`]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Die Zeit steht im Exponenten.", "Time is in the exponent.") }, { wahl: "c", text: zw("Der Anfangswert wird mit dem Faktor multipliziert, nicht addiert.", "The initial value is multiplied by the factor, not added.") }],
      hinweise: [zw("N(t) = N₀ · aᵗ gleich dem Zielwert setzen.", "Set N(t) = N₀ · aᵗ equal to the target.")], erklaerung: `${au.N0} · ${aT(au.a)}^t = ${zt(au.Z, 2)}.` },
    { id: "iso", titel: zw("Potenz isolieren", "Isolate the power"), typ: "zahl", text: `${aT(au.a)}^t =`, wert: q, toleranz: 0.0005, wertText: zt(q, 4),
      frage: zw("Teile durch den Anfangswert. Welcher Wert steht dann rechts?", "Divide by the initial value. What is on the right?"),
      fehler: [{ wert: au.Z - au.N0, toleranz: 0.0005, text: zw("Der Anfangswert ist ein Faktor – teile durch ihn statt ihn abzuziehen.", "The initial value is a factor – divide by it instead of subtracting.") }],
      hinweise: [`${zt(au.Z, 2)} : ${au.N0}`], erklaerung: `${aT(au.a)}^t = ${zt(au.Z, 2)} : ${au.N0} = ${zt(q, 4)}.` },
    { id: "darf", titel: zw("Darf man logarithmieren?", "May you take logarithms?"), typ: "wahl", frage: zw("Warum ist Logarithmieren hier erlaubt?", "Why is taking logarithms allowed here?"),
      optionen: [["a", zw(`Beide Seiten sind positiv: ${aT(au.a)}^t > 0 und ${zt(q, 4)} > 0.`, `Both sides are positive: ${aT(au.a)}^t > 0 and ${zt(q, 4)} > 0.`)], ["b", zw("Logarithmieren darf man immer.", "You may always take logarithms.")], ["c", zw("Weil t eine ganze Zahl ist.", "Because t is a whole number.")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("ln ist nur für positive Zahlen definiert. Stünde rechts eine Zahl ≤ 0, gäbe es keine Lösung.", "ln is only defined for positive numbers. With a number ≤ 0 on the right, there would be no solution.") }, { wahl: "c", text: zw("t muss keine ganze Zahl sein.", "t need not be a whole number.") }],
      hinweise: [zw("Wofür ist ln definiert?", "Where is ln defined?")], erklaerung: zw("Die Basis ist positiv (a > 0, a ≠ 1) und das Argument rechts ebenfalls – also ist ln auf beiden Seiten definiert.", "The base is positive (a > 0, a ≠ 1) and so is the right side – ln is defined on both sides.") },
    { id: "t", titel: zw("Zeit berechnen", "Compute the time"), typ: "zahl", text: "t ≈", wert: t, toleranz: 0.011, einheit: au.t, wertText: zt(t, 2), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals."),
      frage: zw("Logarithmiere und löse nach t auf.", "Take logarithms and solve for t."),
      fehler: [{ wert: Math.log(q / au.a), toleranz: 0.011, text: zw("ln(aᵗ) = t · ln a – nicht ln(q/a).", "ln(aᵗ) = t · ln a – not ln(q/a).") }, { wert: q / Math.log(au.a), toleranz: 0.011, text: zw("Rechts auch logarithmieren: t = ln(q) / ln(a).", "Take the log on the right too: t = ln(q) / ln(a).") }],
      hinweise: [`t = ln(${zt(q, 4)}) / ln(${aT(au.a)})`], erklaerung: `t = ln(${zt(q, 4)}) / ln(${aT(au.a)}) ≈ ${zt(Math.log(q), 4)} / ${zt(Math.log(au.a), 4)} ≈ ${zt(t, 2)}.` },
    { id: "antwort", titel: zw("Antwortsatz", "Answer"), typ: "wahl", frage: zw("Welcher Antwortsatz passt?", "Which answer sentence fits?"),
      optionen: [["r", antwortRichtig],
        ["f1", au.diskret ? zw(`Nach ${zt(t, 2)} ${au.tLang} ist der Zielwert erreicht.`, `After ${zt(t, 2)} ${au.tLang} the target is reached.`) : zw(`Nach etwa ${zt(t, 2)} ${au.g} ist der Zielwert erreicht.`, `After about ${zt(t, 2)} ${au.g} the target is reached.`)],
        ["f2", zw(`Es dauert ${zt(Math.abs(t) * 2, 2)} ${au.t}.`, `It takes ${zt(Math.abs(t) * 2, 2)} ${au.t}.`)]], richtig: "r",
      fehler: [{ wahl: "f1", text: au.diskret ? zw("Zinsen gibt es nur am Jahresende – gesucht ist das erste ganze Jahr, in dem der Wert erreicht ist.", "Interest is only credited at year end – you need the first whole year in which the value is reached.") : zw("Prüfe die Einheit: t ist eine Zeit.", "Check the unit: t is a time.") },
        { wahl: "f2", text: zw("Diese Zahl passt nicht zur Rechnung.", "This number does not match the calculation.") }],
      hinweise: [au.diskret ? zw("Das Kapital ändert sich nur einmal pro Jahr.", "The capital only changes once a year.") : au.vergangen ? zw("Ein negatives t bedeutet: vor dem Startzeitpunkt.", "A negative t means: before the start.") : zw("Zahl, Einheit und Bedeutung prüfen.", "Check number, unit and meaning.")],
      erklaerung: antwortRichtig },
  ], [au]);
  const bis = Math.max(2, Math.min(60, (au.vergangen ? 3 : Math.abs(t)) * 1.3));
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Zielwert erreichen", "Reach a target")}</p>
        <IchHaengeFest kontext={hilfeW(`w3-${au.id}`, au)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>
        {au.text(au.N0, au.a)}{" "}
        {au.vergangen ? zw(`Die Messung beginnt mit ${au.N0} ${au.g}. Wann waren es ${zt(au.Z, 2)} ${au.g}?`, `The measurement starts with ${au.N0} ${au.g}. When were there ${zt(au.Z, 2)} ${au.g}?`)
          : au.diskret ? zw(`Nach wie vielen Jahren sind erstmals mindestens ${zt(au.Z, 2)} € auf dem Konto?`, `After how many years is there at least €${zt(au.Z, 2)} in the account for the first time?`)
            : zw(`Wann sind ${zt(au.Z, 2)} ${au.g} erreicht?`, `When is ${zt(au.Z, 2)} ${au.g} reached?`)}
      </p>
      {stand >= 4 && !au.vergangen && <Graph au={au} bis={au.diskret ? Math.ceil(bis) : bis} waagerechte={[{ y: au.Z, farbe: C.gruen, text: zt(au.Z, 2) }]} zusatz={[{ x: t, farbe: C.gruen }]} />}
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Zielwert berechnet und richtig gedeutet.", "Target computed and interpreted correctly.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

const MODI = [["modell", zw("Modell aus Messwerten", "Model from data")], ["zeit", zw("Verdopplung und Halb\u00ADwerts\u00ADzeit", "Doubling and half-life")], ["ziel", zw("Zielwert erreichen", "Reach a target")]];
export function WachstumLogarithmen() {
  const [modus, setModus] = useState("modell");
  return (
    <Seite titel={zw("Wachstum und Logarithmen", "Growth and logarithms")}
      text={zw("Exponentielle Modelle aus Messwerten aufstellen, Prozentangaben in Faktoren übersetzen und mit Logarithmen unbekannte Zeiten bestimmen.", "Build exponential models from data, translate percentages into factors and find unknown times with logarithms.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Wachstums-Übungen", "Growth exercises")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}><b>N(t) = N₀ · aᵗ</b> {zw("mit Anfangswert N₀ und Wachstumsfaktor a > 0, a ≠ 1. Wachstum um p %: a = 1 + p/100; Abnahme um p %: a = 1 − p/100.", "with initial value N₀ and growth factor a > 0, a ≠ 1. Growth by p %: a = 1 + p/100; decrease by p %: a = 1 − p/100.")}</p>
        <p style={{ margin: "0 0 6px" }}>{zw("Gleiche Funktion mit e: N(t) = N₀ · e^(k·t), k = ln a. Diskret heißt: Änderung nur zu festen Zeitpunkten (z. B. jährliche Zinsen); kontinuierlich: für jedes t.", "Same function with e: N(t) = N₀ · e^(k·t), k = ln a. Discrete means: change only at fixed times (e.g. yearly interest); continuous: for every t.")}</p>
        <p style={{ margin: 0 }}>{zw("Beispiel: 200 · 1,5ᵗ = 900 ⇒ 1,5ᵗ = 4,5 ⇒ t = ln 4,5 / ln 1,5 ≈ 3,71.", "Example: 200 · 1.5ᵗ = 900 ⇒ 1.5ᵗ = 4.5 ⇒ t = ln 4.5 / ln 1.5 ≈ 3.71.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "modell" ? "block" : "none" }}><MesswertModell /></div>
      <div style={{ display: modus === "zeit" ? "block" : "none" }}><Verdopplung /></div>
      <div style={{ display: modus === "ziel" ? "block" : "none" }}><Zielwert /></div>
    </Seite>
  );
}
