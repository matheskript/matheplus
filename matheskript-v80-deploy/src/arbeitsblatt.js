/* ======================================================================
   arbeitsblatt.js – reine Logik für den Lehrer-Arbeitsblatt-Generator
   (Seite: funcArbeitsblatt.jsx, Pfad /lehrkraefte/arbeitsblatt).

   Die Lehrkraft wählt Kapitel und Unterthemen (schulbuch.js, unterthemen.js)
   und bekommt ein Blatt mit N Aufgaben plus Lösungsblatt. Alle Aufgaben
   kommen aus den Generatoren der App – nie aus einem KI-Text:
     · „td:<id>“  – Generatoren aus trainingDaten.js (Mittel- und Oberstufe),
                     für Papier umformuliert (keine Eingabe-Hinweise),
     · „u:<id>“   – Unterstufe aus unterGen.js / bruchGen.js mit eigenen
                     Aufgabentexten, Lösungsweg und Ergebnis (unten).

   Blatt-Aufgabe: { quelle, afb (1–3), text, optionen?, tabelle?, weg: [Zeilen], ergebnis }
   Texte mit $…$ für Formeln. Regel A5: kein Lösungsweg endet unvereinfacht
   (tests/arbeitsblatt.test.mjs prüft das für alle Quellen).

   Kein React, kein Speicher. Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { GENERATOREN, neueAufgabe } from "./trainingDaten.js";
import { unterthemen as unterthemenVon } from "./unterthemen.js";
import { kapitelFuer, klassenBoxen, THEMEN as KAPITEL } from "./schulbuch.js";
import {
  dezAufgabe, datenAufgabe, flaecheAufgabe, ganzAufgabe, groessenAufgabe, koordAufgabe, primAufgabe, prozentAufgabe,
  quaderAufgabe, rgAufgabe, zahlAufgabe, zufallAufgabe, zuordAufgabe, roemisch, STELLEN,
} from "./unterGen.js";
import { bruchAufgabe } from "./bruchGen.js";
import { ggT } from "./rechnen2.js";

/* ---------- Anzeige ---------- */
const mi = (s) => String(s).replace(/-/g, "−");
/* Dezimalzahl mit Komma, höchstens st Nachkommastellen, ohne Nullen am Ende */
export const dz = (v, st = 6) => mi(String(Math.round(v * 10 ** st) / 10 ** st).replace(".", ","));
/* Geldbetrag: ganze Euro ohne Komma, sonst immer zwei Nachkommastellen */
export const geld = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? mi(Math.round(v)) : mi(v.toFixed(2).replace(".", ",")));
/* Große Zahlen mit schmalem Leerzeichen als Tausendertrenner (wie im Schulbuch) */
export const gz = (n) => {
  const neg = n < 0, [g, k] = String(Math.abs(n)).split(".");
  const t = g.length > 4 ? g.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : g;
  return (neg ? "−" : "") + t + (k ? "," + k : "");
};
const klam = (v) => (v < 0 ? `(${mi(v)})` : String(v));
const bT = (b) => (b.n === 1 ? mi(b.z) : `${b.z < 0 ? "−" : ""}\\frac{${Math.abs(b.z)}}{${b.n}}`);
const bRoh = (zz, n) => `\\frac{${zz}}{${n}}`;
const punkt = (name, P) => `${name}(${mi(P[0])} \\mid ${mi(P[1])})`;
const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
export const BUCHSTABEN = ["a", "b", "c", "d", "e", "f"];

/* ======================================================================
   1 · Generatoren aus trainingDaten.js – für Papier umformuliert
   ====================================================================== */
/* Eingabe-Hinweise der App gehören nicht aufs Blatt */
const ERSETZEN = [
  [/ Gib das Ergebnis als Bruch \(z\. B\. [^)]*\) oder als Dezimalzahl mit mindestens drei Nachkommastellen an\./g, " Gib das Ergebnis exakt an."],
  [/ Gib das Ergebnis als Bruch oder als Dezimalzahl mit mindestens drei Nachkommastellen an\./g, " Gib das Ergebnis exakt an."],
  [/ Gib einen Bruch \(z\. B\. [^)]*\) oder eine Dezimalzahl an\./g, " Gib das Ergebnis als Bruch an."],
  [/ Gib die größere der beiden Lösungen an\./g, ""],
  [/ Gib \$x\$ an\./g, ""],
  [/ Gib die Wahrscheinlichkeit als Dezimalzahl an \(z\. B\. [^)]*\)\./g, ""],
  [/ Gib die \$y\$-Koordinate an\./g, ""],
];
export function blattText(t) {
  let s = String(t);
  for (const [re, neu] of ERSETZEN) s = s.replace(re, neu);
  return s.replace(/\s+\$/g, (m) => (m.length > 2 ? " $" : m)).trim();
}

/* Rundungsvorgabe aus dem Aufgabentext („auf zwei Nachkommastellen“, „auf ganze Euro“) */
function stellenAusText(t) {
  if (/ganze/.test(t)) return 0;
  if (/eine Nachkommastelle/.test(t)) return 1;
  if (/zwei Nachkommastellen/.test(t)) return 2;
  if (/drei Nachkommastellen/.test(t)) return 3;
  if (/vier Nachkommastellen/.test(t)) return 4;
  return null;
}
/* Exakter Bruch zu einem Wert, wenn es einen mit kleinem Nenner gibt */
function bruchZu(v) {
  for (let n = 2; n <= 60; n++) {
    const zz = Math.round(v * n);
    if (Math.abs(zz / n - v) < 1e-9 && ggT(Math.abs(zz), n) === 1) return { z: zz, n };
  }
  return null;
}
/* Endliche Dezimalzahl (höchstens 4 Stellen) oder null */
const endlich = (v) => (Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-6 ? dz(v, 4) : null);
function zahlErgebnis(a, text) {
  const v = a.wert, st = stellenAusText(text);
  let s;
  if (Math.abs(v - Math.round(v)) < 1e-9) s = mi(Math.round(v));
  else if (st !== null) s = mi((Math.round(v * 10 ** st) / 10 ** st).toFixed(st).replace(".", ","));
  else {
    /* Größen mit Einheit als Dezimalzahl (2,5 cm), sonst exakt als Bruch (5/6) */
    const b = bruchZu(v), d = endlich(v);
    s = a.einheit ? (d || (b ? bT(b) : dz(v, 4))) : b ? bT(b) : d || dz(v, 4);
  }
  const ungefaehr = st !== null && Math.abs(v - Math.round(v * 10 ** st) / 10 ** st) > 1e-9;
  if (a.einheit === "°") return `${ungefaehr ? "≈ " : ""}$${s}°$`;
  return `${ungefaehr ? "≈ " : ""}$${s}$${a.einheit ? ` ${a.einheit}` : ""}`;
}

/* Ergebnis eigens formulieren, wo die Papierfrage weiter reicht als die App-Frage */
const ERGEBNIS_EIGEN = {
  "gl-quadrat": (a) => { const [x1, x2] = [a.daten.r1, a.daten.r2].sort((p, q) => p - q); return `$x_1 = ${mi(x1)}$, $x_2 = ${mi(x2)}$`; },
  "lgs-zwei": (a) => `$x = ${mi(a.daten.x)}$, $y = ${mi(a.daten.y)}$`,
  "fkt-scheitel": (a) => { const l = a.loesung[a.loesung.length - 1]; return l; },
};
/* Platz zum Rechnen (in Zeilen), wenn der Rechenraum an ist */
const PLATZ = { 1: 3, 2: 5, 3: 7 };

function ausTraining(id) {
  const a = neueAufgabe(id);
  const text = blattText(a.text);
  const auf = { quelle: `td:${id}`, afb: a.afb || 1, text, weg: [...(a.loesung || [])] };
  if (a.typ === "wahl") {
    auf.optionen = a.optionen.slice();
    auf.ergebnis = `${BUCHSTABEN[a.richtig]}) ${a.optionen[a.richtig]}`;
  } else {
    auf.ergebnis = ERGEBNIS_EIGEN[id] ? ERGEBNIS_EIGEN[id](a) : zahlErgebnis(a, text);
  }
  return auf;
}

/* ======================================================================
   2 · Unterstufe – eigene Texte zu den Daten aus unterGen.js / bruchGen.js
   ====================================================================== */
const U = {};
const u = (id, titel, afb, mach) => { U[id] = { id, titel, afb, mach }; };

/* Prozent- und Zinsrechnung */
u("pro-prozentwert", "Prozentwert", 1, (z) => { const d = prozentAufgabe("prozentwert", z); return {
  text: `Berechne ${d.p} % von ${d.G} €.`, weg: [`$W = ${d.G} · \\frac{${d.p}}{100} = ${dz(d.W)}$`], ergebnis: `$${geld(d.W)}$ €` }; });
u("pro-grundwert", "Grundwert", 2, (z) => { const d = prozentAufgabe("grundwert", z); return {
  text: `${d.p} % eines Betrags sind ${geld(d.W)} €. Wie groß ist der ganze Betrag?`,
  weg: [`1 % ≙ $${dz(d.W)} : ${d.p} = ${dz(d.W / d.p)}$ €`, `$G = ${dz(d.W / d.p)} · 100 = ${dz(d.G)}$ €`], ergebnis: `$${geld(d.G)}$ €` }; });
u("pro-prozentsatz", "Prozentsatz", 1, (z) => { const d = prozentAufgabe("prozentsatz", z); return {
  text: `Wie viel Prozent sind ${geld(d.W)} € von ${d.G} €?`, weg: [`$p = \\frac{${dz(d.W)}}{${d.G}} = ${dz(d.W / d.G)}$`], ergebnis: `${d.p} %` }; });
u("pro-rabatt", "Rabatt", 1, (z) => { const d = prozentAufgabe("rabatt", z); return {
  text: `Eine Jacke kostet ${d.preis} €. Im Schlussverkauf gibt es ${d.r} % Rabatt. Wie viel kostet sie jetzt?`,
  weg: [`Rabatt: $${d.preis} · \\frac{${d.r}}{100} = ${dz(d.abzug)}$ €`, `Neuer Preis: $${d.preis} − ${dz(d.abzug)} = ${dz(d.neu)}$ €`], ergebnis: `$${geld(d.neu)}$ €` }; });
u("pro-mwst", "Mehrwertsteuer", 2, (z) => { const d = prozentAufgabe("mwst", z); return {
  text: `Ein Fahrradhelm kostet ohne Mehrwertsteuer ${d.netto} €. Wie viel kostet er mit 19 % Mehrwertsteuer?`,
  weg: [`$${d.netto} · 1,19 = ${dz(d.brutto)}$ €`], ergebnis: `$${geld(d.brutto)}$ €` }; });
u("pro-netto", "Preis ohne Mehrwertsteuer", 2, (z) => { const d = prozentAufgabe("netto", z); return {
  text: `Ein Drucker kostet ${geld(d.brutto)} € einschließlich 19 % Mehrwertsteuer. Wie viel kostet er ohne Mehrwertsteuer?`,
  weg: [`Der Bruttopreis entspricht 119 %.`, `$${dz(d.brutto)} : 1,19 = ${dz(d.netto)}$ €`], ergebnis: `$${geld(d.netto)}$ €` }; });
u("pro-zinsen", "Jahreszinsen", 1, (z) => { const d = prozentAufgabe("zinsen", z); return {
  text: `${d.K} € liegen ein Jahr lang zu ${dz(d.zs)} % auf einem Sparkonto. Wie viel Zinsen gibt es?`,
  weg: [`$Z = ${d.K} · \\frac{${dz(d.zs)}}{100} = ${dz(d.Z)}$ €`], ergebnis: `$${geld(d.Z)}$ €` }; });
u("pro-zinseszins", "Zinseszins", 2, (z) => { const d = prozentAufgabe("zinseszins", z); return {
  text: `${d.K} € werden ${d.n} Jahre lang mit ${d.zs} % Zinseszins angelegt. Wie hoch ist das Guthaben danach? Runde auf Cent.`,
  weg: [`$q = 1 + \\frac{${d.zs}}{100} = ${dz(d.q)}$`, `$K_{${d.n}} = ${d.K} · ${dz(d.q)}^{${d.n}} ≈ ${geld(d.Kn)}$ €`], ergebnis: `$${geld(d.Kn)}$ €` }; });

/* Zuordnungen und Dreisatz */
const EINS = { Hefte: "1 Heft", "Liter Benzin": "1 Liter", "kg Äpfel": "1 kg", Brötchen: "1 Brötchen" };
u("zu-prop", "Proportionaler Dreisatz", 1, (z) => { const d = zuordAufgabe("prop", z); return {
  text: `${d.a} ${d.ding} kosten ${geld(d.preisA)} €. Wie viel kosten ${d.b} ${d.ding}?`,
  weg: [`${EINS[d.ding] || "1 Stück"}: $${dz(d.preisA)} : ${d.a} = ${dz(d.eins)}$ €`, `${d.b} ${d.ding}: $${dz(d.eins)} · ${d.b} = ${dz(d.ergebnis)}$ €`], ergebnis: `$${geld(d.ergebnis)}$ €` }; });
u("zu-anti", "Antiproportionaler Dreisatz", 2, (z) => { const d = zuordAufgabe("anti", z); return {
  text: `${d.a} Helfer brauchen für das Aufräumen der Turnhalle ${d.tA} Minuten. Wie lange brauchen ${d.b} Helfer, wenn alle gleich schnell arbeiten?`,
  weg: [`1 Helfer: $${d.tA} · ${d.a} = ${d.gesamt}$ Minuten`, `${d.b} Helfer: $${d.gesamt} : ${d.b} = ${d.tB}$ Minuten`], ergebnis: `$${d.tB}$ Minuten` }; });
u("zu-luecke", "Tabelle ergänzen", 1, (z) => { const d = zuordAufgabe("luecke", z);
  const werte = d.ys.map((y, i) => (i === d.fehlt ? "□" : dz(y)));
  return {
    text: `Die Zuordnung ist ${d.anti ? "antiproportional" : "proportional"}. Ergänze den fehlenden Wert.`,
    tabelle: { kopf: ["x", ...d.xs.map(String)], zeile: ["y", ...werte] },
    weg: d.anti ? [`Das Produkt ist immer gleich: $${d.xs[0]} · ${dz(d.ys[0])} = ${dz(d.xs[0] * d.ys[0])}$`, `$${dz(d.xs[0] * d.ys[0])} : ${d.xs[d.fehlt]} = ${dz(d.wert)}$`]
      : [`Der Quotient ist immer gleich: $${dz(d.ys[0])} : ${d.xs[0]} = ${dz(d.ys[0] / d.xs[0])}$`, `$${dz(d.ys[0] / d.xs[0])} · ${d.xs[d.fehlt]} = ${dz(d.wert)}$`],
    ergebnis: `$y = ${dz(d.wert)}$` }; });
u("zu-erkennen", "Zuordnung erkennen", 1, (z) => { const d = zuordAufgabe("erkennen", z);
  const opt = ["proportional", "antiproportional", "weder proportional noch antiproportional"];
  const r = d.typ === "prop" ? 0 : d.typ === "anti" ? 1 : 2;
  const weg = d.typ === "prop" ? [`Alle Quotienten $y : x$ sind gleich (${dz(d.ys[0] / d.xs[0])}).`] : d.typ === "anti" ? [`Alle Produkte $x · y$ sind gleich (${dz(d.xs[0] * d.ys[0])}).`] : ["Weder die Quotienten $y : x$ noch die Produkte $x · y$ sind überall gleich."];
  return { text: "Welche Art von Zuordnung liegt vor?", tabelle: { kopf: ["x", ...d.xs.map(String)], zeile: ["y", ...d.ys.map((y) => dz(y))] }, optionen: opt, weg, ergebnis: `${BUCHSTABEN[r]}) ${opt[r]}` }; });

/* Umfang und Flächeninhalt */
u("fl-rechteckU", "Umfang Rechteck", 1, (z) => { const d = flaecheAufgabe("rechteckU", z); return {
  text: `Ein Rechteck ist ${d.a} cm lang und ${d.b} cm breit. Berechne seinen Umfang.`, weg: [`$u = 2 · ${d.a} + 2 · ${d.b} = ${d.U}$ cm`], ergebnis: `$${d.U}$ cm` }; });
u("fl-rechteckA", "Flächeninhalt Rechteck", 1, (z) => { const d = flaecheAufgabe("rechteckA", z); return {
  text: `Ein Rechteck ist ${d.a} m lang und ${d.b} m breit. Berechne seinen Flächeninhalt.`, weg: [`$A = ${d.a} · ${d.b} = ${d.A}$ m²`], ergebnis: `$${d.A}$ m²` }; });
u("fl-rueck", "Seite aus dem Flächeninhalt", 2, (z) => { const d = flaecheAufgabe("rueck", z); return {
  text: `Ein Rechteck hat den Flächeninhalt ${d.A} cm² und ist ${d.a} cm lang. Wie breit ist es?`, weg: [`$b = ${d.A} : ${d.a} = ${d.b}$ cm`], ergebnis: `$${d.b}$ cm` }; });
u("fl-dreieck", "Flächeninhalt Dreieck", 1, (z) => { const d = flaecheAufgabe("dreieck", z); return {
  text: `Ein Dreieck hat die Grundseite $g = ${d.g}$ cm und die Höhe $h = ${d.h}$ cm. Berechne seinen Flächeninhalt.`, weg: [`$A = \\frac{1}{2} · ${d.g} · ${d.h} = ${dz(d.A)}$ cm²`], ergebnis: `$${dz(d.A)}$ cm²` }; });
u("fl-parallelogramm", "Flächeninhalt Parallelogramm", 1, (z) => { const d = flaecheAufgabe("parallelogramm", z); return {
  text: `Ein Parallelogramm hat die Grundseite $g = ${d.g}$ cm, die Höhe $h = ${d.h}$ cm und die schräge Seite $s = ${d.s}$ cm. Berechne seinen Flächeninhalt.`, weg: [`Die schräge Seite wird nicht gebraucht.`, `$A = ${d.g} · ${d.h} = ${d.A}$ cm²`], ergebnis: `$${d.A}$ cm²` }; });
u("fl-trapez", "Flächeninhalt Trapez", 2, (z) => { const d = flaecheAufgabe("trapez", z); return {
  text: `Ein Trapez hat die parallelen Seiten $a = ${d.a}$ cm und $c = ${d.c}$ cm und die Höhe $h = ${d.h}$ cm. Berechne seinen Flächeninhalt.`, weg: [`$A = \\frac{${d.a} + ${d.c}}{2} · ${d.h} = ${dz((d.a + d.c) / 2)} · ${d.h} = ${dz(d.A)}$ cm²`], ergebnis: `$${dz(d.A)}$ cm²` }; });
u("fl-drachen", "Flächeninhalt Drachen", 2, (z) => { const d = flaecheAufgabe("drachen", z); return {
  text: `Die Diagonalen eines Drachenvierecks sind $e = ${d.e}$ cm und $f = ${d.f}$ cm lang. Berechne seinen Flächeninhalt.`, weg: [`$A = \\frac{${d.e} · ${d.f}}{2} = ${dz(d.A)}$ cm²`], ergebnis: `$${dz(d.A)}$ cm²` }; });

/* Größen */
const groesse = (art, titel) => u(`gr-${art}`, titel, 1, (z) => { const d = groessenAufgabe(art, z);
  const fak = d.schritt ? `Umrechnungszahl ${gz(d.schritt)}` : null;
  return { text: `Rechne um: ${gz(d.wert)} ${d.von} = □ ${d.nach}`,
    weg: [fak ? `${fak}: ${d.groesser ? "mal" : "geteilt durch"} ${gz(d.schritt)}` : `Schrittweise über die Nachbareinheiten umrechnen.`, `${gz(d.wert)} ${d.von} = ${gz(d.ergebnis)} ${d.nach}`],
    ergebnis: `${gz(d.ergebnis)} ${d.nach}` }; });
groesse("laenge", "Längen umrechnen");
groesse("masse", "Gewichte umrechnen");
groesse("zeit", "Zeiten umrechnen");
groesse("flaeche", "Flächeneinheiten umrechnen");
groesse("volumen", "Volumeneinheiten umrechnen");
groesse("hohlmass", "Hohlmaße umrechnen");
u("gr-massstab", "Maßstab", 2, (z) => { const d = groessenAufgabe("massstab", z); return {
  text: `Eine Karte hat den Maßstab 1 : ${gz(d.m)}. Zwei Orte sind auf der Karte ${dz(d.karte)} cm voneinander entfernt. Wie weit sind sie in Wirklichkeit entfernt? Gib das Ergebnis in ${d.einheit} an.`,
  weg: [`$${dz(d.karte)}$ cm $· ${gz(d.m)} = ${gz(d.cm)}$ cm`, `${gz(d.cm)} cm = ${gz(d.wirklich)} ${d.einheit}`], ergebnis: `${gz(d.wirklich)} ${d.einheit}` }; });

/* Dezimalzahlen */
u("dez-bruch", "Bruch als Dezimalzahl", 1, (z) => { const d = dezAufgabe("bruchZuDez", z); const f = d.erweitert / d.b.n; return {
  text: `Schreibe $${bT(d.b)}$ als Dezimalzahl.`, weg: [`$${bT(d.b)} = ${bRoh(d.b.z * f, d.erweitert)} = ${dz(d.wert)}$`], ergebnis: `$${dz(d.wert)}$` }; });
u("dez-zubruch", "Dezimalzahl als Bruch", 1, (z) => { const d = dezAufgabe("dezZuBruch", z);
  const gekuerzt = d.b.n !== d.roh.n;
  return { text: `Schreibe $${dz(d.dez)}$ als vollständig gekürzten Bruch.`, weg: [`$${dz(d.dez)} = ${bRoh(d.roh.z, d.roh.n)}${gekuerzt ? ` = ${bT(d.b)}` : ""}$`], ergebnis: `$${bT(d.b)}$` }; });
u("dez-runden", "Dezimalzahlen runden", 1, (z) => { const d = dezAufgabe("runden", z);
  const name = ["", "Zehntel", "Hundertstel", "Tausendstel"][d.st];
  return { text: `Runde $${dz(d.x, 5)}$ auf ${name}.`, weg: [`Die nächste Ziffer ist ${d.naechste}, also wird ${d.naechste >= 5 ? "aufgerundet" : "abgerundet"}.`], ergebnis: `$${dz(d.x, 5)} ≈ ${(d.wert).toFixed(d.st).replace(".", ",")}$` }; });
u("dez-zehner", "Komma verschieben", 1, (z) => { const d = dezAufgabe("zehner", z); return {
  text: `Berechne $${dz(d.x)} ${d.op[0]} ${d.op.slice(1)}$.`, weg: [`Das Komma wandert um ${d.stellen} ${d.stellen === 1 ? "Stelle" : "Stellen"} nach ${d.rechts ? "rechts" : "links"}.`], ergebnis: `$${dz(d.wert)}$` }; });
u("dez-mal", "Dezimalzahlen multiplizieren", 2, (z) => { const d = dezAufgabe("mal", z); return {
  text: `Berechne $${dz(d.a)} · ${dz(d.b)}$.`, weg: [`Ohne Komma: $${String(d.a).replace(".", "").replace(/^0+/, "")} · ${String(d.b).replace(".", "").replace(/^0+/, "")} = ${d.ohne}$`, `Das Ergebnis hat ${d.stellen} Nachkommastellen: $${dz(d.wert)}$`], ergebnis: `$${dz(d.wert)}$` }; });
u("dez-geteilt", "Durch eine Dezimalzahl teilen", 2, (z) => { const d = dezAufgabe("geteilt", z); return {
  text: `Berechne $${dz(d.a)} : ${dz(d.b)}$.`, weg: [`Beide Zahlen mit ${gz(10 ** d.st)} multiplizieren: $${dz(d.a2)} : ${dz(d.b2)}$`, `$${dz(d.a2)} : ${dz(d.b2)} = ${dz(d.wert)}$`], ergebnis: `$${dz(d.wert)}$` }; });
u("dez-periodisch", "Abbrechend oder periodisch", 2, (z) => { const d = dezAufgabe("periodisch", z);
  const pf = []; let m = d.n; for (let t = 2; m > 1; t++) while (m % t === 0) { pf.push(t); m /= t; }
  const opt = ["abbrechend", "periodisch"], r = d.abbrechend ? 0 : 1;
  return { text: `Ist die Dezimalzahl zu $${bRoh(1, d.n)}$ abbrechend oder periodisch?`, optionen: opt,
    weg: [`$${d.n} = ${pf.join(" · ")}$`, d.abbrechend ? "Im Nenner stehen nur die Primfaktoren 2 und 5: abbrechend." : "Im Nenner steht ein anderer Primfaktor als 2 und 5: periodisch."],
    ergebnis: `${BUCHSTABEN[r]}) ${opt[r]}` }; });
u("dez-add", "Dezimalzahlen addieren und subtrahieren", 1, (z) => {
  const a = wahlAus([3.75, 12.4, 0.86, 7.05, 25.5, 4.375], z), b = wahlAus([1.6, 0.45, 8.25, 2.09, 0.7, 13.8], z), plus = z() < 0.5 || a < b;
  const w = Math.round((plus ? a + b : a - b) * 1e6) / 1e6;
  return { text: `Berechne $${dz(a)} ${plus ? "+" : "−"} ${dz(b)}$.`, weg: ["Komma unter Komma schreiben, fehlende Stellen mit Nullen auffüllen."], ergebnis: `$${dz(w)}$` }; });

/* Quader und Würfel */
u("qu-oberflaeche", "Oberfläche Quader", 1, (z) => { const d = quaderAufgabe("oberflaeche", z); return {
  text: `Ein Quader ist ${d.a} cm lang, ${d.b} cm breit und ${d.c} cm hoch. Berechne seine Oberfläche.`,
  weg: [`$O = 2 · (${d.a} · ${d.b} + ${d.a} · ${d.c} + ${d.b} · ${d.c})$`, `$O = 2 · ${d.a * d.b + d.a * d.c + d.b * d.c} = ${d.O}$ cm²`], ergebnis: `$${d.O}$ cm²` }; });
u("qu-kanten", "Kantenlänge Quader", 1, (z) => { const d = quaderAufgabe("kanten", z); return {
  text: `Aus Draht soll das Kantenmodell eines Quaders mit $a = ${d.a}$ cm, $b = ${d.b}$ cm und $c = ${d.c}$ cm gebogen werden. Wie viel Draht braucht man?`,
  weg: [`$K = 4 · (${d.a} + ${d.b} + ${d.c}) = 4 · ${d.a + d.b + d.c} = ${d.K}$ cm`], ergebnis: `$${d.K}$ cm` }; });
u("qu-hoehe", "Höhe aus dem Volumen", 2, (z) => { const d = quaderAufgabe("hoehe", z); return {
  text: `Ein Quader hat das Volumen ${d.V} cm³. Seine Grundfläche ist ${d.a} cm lang und ${d.b} cm breit. Wie hoch ist er?`,
  weg: [`$G = ${d.a} · ${d.b} = ${d.a * d.b}$ cm²`, `$h = ${d.V} : ${d.a * d.b} = ${d.c}$ cm`], ergebnis: `$${d.c}$ cm` }; });
u("qu-wuerfel", "Würfel", 1, (z) => { const d = quaderAufgabe("wuerfel", z); return {
  text: `Ein Würfel hat die Kantenlänge $a = ${d.a}$ cm. Berechne sein Volumen und seine Oberfläche.`,
  weg: [`$V = ${d.a}^3 = ${d.V}$ cm³`, `$O = 6 · ${d.a}^2 = ${d.O}$ cm²`], ergebnis: `$V = ${d.V}$ cm³, $O = ${d.O}$ cm²` }; });

/* Ganze und rationale Zahlen */
const ganzOp = { plus: "+", minus: "−", mal: "·", geteilt: ":" };
for (const art of ["plus", "minus", "mal", "geteilt"]) {
  u(`ganz-${art}`, { plus: "Addieren", minus: "Subtrahieren", mal: "Multiplizieren", geteilt: "Dividieren" }[art], 1, (z) => { const d = ganzAufgabe(art, z); return {
    text: `Berechne $${mi(d.a)} ${ganzOp[art]} ${klam(d.b)}$.`, weg: [`$${mi(d.a)} ${ganzOp[art]} ${klam(d.b)} = ${mi(d.wert)}$`], ergebnis: `$${mi(d.wert)}$` }; });
}
u("ganz-vergleich", "Ganze Zahlen vergleichen", 1, (z) => { const d = ganzAufgabe("vergleich", z); const zeichen = d.a > d.b ? ">" : "<"; return {
  text: `Setze $<$ oder $>$ ein: $${mi(d.a)} \\;□\\; ${mi(d.b)}$`, weg: ["Auf der Zahlengeraden liegt die größere Zahl weiter rechts."], ergebnis: `$${mi(d.a)} ${zeichen} ${mi(d.b)}$` }; });
u("ganz-temperatur", "Temperaturen", 1, (z) => { const d = ganzAufgabe("temperatur", z); return {
  text: `Am Morgen sind es ${mi(d.start)} °C. Bis zum Mittag ${d.d > 0 ? "steigt" : "fällt"} die Temperatur um ${Math.abs(d.d)} °C. Wie warm ist es mittags?`,
  weg: [`$${mi(d.start)} ${d.d > 0 ? "+" : "−"} ${Math.abs(d.d)} = ${mi(d.wert)}$`], ergebnis: `${mi(d.wert)} °C` }; });
u("ganz-klammer", "Punkt vor Strich mit negativen Zahlen", 2, (z) => { const d = ganzAufgabe("klammer", z); return {
  text: `Berechne $${mi(d.a)} − ${klam(d.b)} · ${klam(d.c)}$.`, weg: [`Punkt vor Strich: $${klam(d.b)} · ${klam(d.c)} = ${mi(d.b * d.c)}$`, `$${mi(d.a)} − ${klam(d.b * d.c)} = ${mi(d.wert)}$`], ergebnis: `$${mi(d.wert)}$` }; });

/* Daten und Diagramme */
u("da-mittelwert", "Mittelwert", 1, (z) => { const d = datenAufgabe("mittelwert", z); const s = d.l.reduce((a, b) => a + b, 0); return {
  text: `Berechne den Mittelwert der Daten: ${d.l.join("; ")}.`, weg: [`Summe: $${d.l.join(" + ")} = ${s}$`, `$\\overline{x} = ${s} : ${d.l.length} = ${dz(d.wert)}$`], ergebnis: `$${dz(d.wert)}$` }; });
u("da-median", "Median", 1, (z) => { const d = datenAufgabe("median", z); return {
  text: `Bestimme den Median der Daten: ${d.l.join("; ")}.`, weg: [`Geordnet: ${d.sortiert.join("; ")}`, d.l.length % 2 ? `Der Wert in der Mitte ist ${d.wert}.` : `Mittelwert der beiden mittleren Werte: $${dz(d.wert)}$`], ergebnis: `$${dz(d.wert)}$` }; });
u("da-spannweite", "Spannweite", 1, (z) => { const d = datenAufgabe("spannweite", z); const mx = Math.max(...d.l), mn = Math.min(...d.l); return {
  text: `Die Tiefsttemperaturen einer Woche waren (in °C): ${d.l.map(mi).join("; ")}. Bestimme die Spannweite.`, weg: [`$${mx} − ${klam(mn)} = ${d.wert}$`], ergebnis: `${d.wert} °C` }; });
u("da-relativ", "Relative Häufigkeit", 1, (z) => { const d = datenAufgabe("relativ", z); return {
  text: `Von ${d.gesamt} befragten Schülern kommen ${d.teil} mit dem Fahrrad zur Schule. Gib die relative Häufigkeit als Bruch und in Prozent an.`,
  weg: [`$\\frac{${d.teil}}{${d.gesamt}}${ggT(d.teil, d.gesamt) > 1 ? ` = ${bRoh(d.teil / ggT(d.teil, d.gesamt), d.gesamt / ggT(d.teil, d.gesamt))}` : ""} = ${dz(d.prozent / 100)}$`], ergebnis: `$${bRoh(d.teil / ggT(d.teil, d.gesamt), d.gesamt / ggT(d.teil, d.gesamt))}$ = ${dz(d.prozent)} %` }; });
u("da-kreis", "Winkel im Kreisdiagramm", 2, (z) => { const d = datenAufgabe("kreis", z); return {
  text: `In einem Kreisdiagramm soll ein Anteil von $${bRoh(d.z, d.n)}$ dargestellt werden. Wie groß ist der Mittelpunktswinkel des Kreisausschnitts?`,
  weg: [`$${bRoh(d.z, d.n)} · 360° = ${dz(d.winkel)}°$`], ergebnis: `$${dz(d.winkel)}°$` }; });

/* Primzahlen, ggT, kgV */
u("prim-ist", "Primzahl oder nicht", 1, (z) => { const d = primAufgabe("istPrim", z); const opt = ["ja, Primzahl", "nein, keine Primzahl"]; const r = d.prim ? 0 : 1; return {
  text: `Ist ${d.n} eine Primzahl?`, optionen: opt, weg: [d.prim ? `${d.n} hat nur die Teiler 1 und ${d.n}.` : `$${d.n} = ${d.teiler} · ${d.n / d.teiler}$`], ergebnis: `${BUCHSTABEN[r]}) ${opt[r]}` }; });
u("prim-zerlegung", "Primfaktorzerlegung", 1, (z) => { const d = primAufgabe("zerlegung", z);
  const zaehl = {}; d.f.forEach((p) => { zaehl[p] = (zaehl[p] || 0) + 1; });
  const pot = Object.entries(zaehl).map(([p, k]) => (k === 1 ? p : `${p}^{${k}}`)).join(" · ");
  return { text: `Zerlege ${d.n} in Primfaktoren.`, weg: [`$${d.n} = ${d.f.join(" · ")}$`], ergebnis: `$${d.n} = ${pot}$` }; });
u("prim-ggt", "Größter gemeinsamer Teiler", 1, (z) => { const d = primAufgabe("ggt", z); return {
  text: `Bestimme den ggT von ${d.a} und ${d.b}.`, weg: [`Teiler von ${d.a}: ${teilerListe(d.a)}`, `Teiler von ${d.b}: ${teilerListe(d.b)}`], ergebnis: `$\\text{ggT}(${d.a}, ${d.b}) = ${d.wert}$` }; });
u("prim-kgv", "Kleinstes gemeinsames Vielfaches", 1, (z) => { const d = primAufgabe("kgv", z); return {
  text: `Bestimme das kgV von ${d.a} und ${d.b}.`, weg: [`Vielfache von ${d.a}: ${vielfache(d.a, d.wert)}`, `Vielfache von ${d.b}: ${vielfache(d.b, d.wert)}`], ergebnis: `$\\text{kgV}(${d.a}, ${d.b}) = ${d.wert}$` }; });
u("prim-ggtsach", "ggT im Sachzusammenhang", 2, (z) => { const d = primAufgabe("ggtSach", z); return {
  text: `Ein Brett ist ${d.a} cm, ein zweites ${d.b} cm lang. Beide sollen ohne Rest in möglichst lange, gleich lange Stücke zersägt werden. Wie lang wird ein Stück?`,
  weg: [`Gesucht ist der ggT von ${d.a} und ${d.b}.`, `$\\text{ggT}(${d.a}, ${d.b}) = ${d.wert}$`], ergebnis: `${d.wert} cm` }; });
u("prim-kgvsach", "kgV im Sachzusammenhang", 2, (z) => { const d = primAufgabe("kgvSach", z); return {
  text: `Ein Bus fährt alle ${d.a} Minuten, ein anderer alle ${d.b} Minuten. Um 8:00 Uhr fahren beide gleichzeitig ab. Nach wie vielen Minuten fahren sie das nächste Mal gemeinsam?`,
  weg: [`Gesucht ist das kgV von ${d.a} und ${d.b}.`, `$\\text{kgV}(${d.a}, ${d.b}) = ${d.wert}$`], ergebnis: `nach ${d.wert} Minuten` }; });
function teilerListe(n) { const t = []; for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i); return t.join(", "); }
function vielfache(n, bis) { const v = []; for (let k = n; k <= bis; k += n) v.push(k); return v.join(", "); }

/* Rechengesetze */
u("rg-punkt", "Punkt vor Strich", 1, (z) => { const d = rgAufgabe("punkt", z); return {
  text: `Berechne $${d.a} + ${d.b} · ${d.c}$.`, weg: [`$${d.a} + ${d.b * d.c} = ${d.wert}$`], ergebnis: `$${d.wert}$` }; });
u("rg-klammer", "Klammern zuerst", 1, (z) => { const d = rgAufgabe("klammer", z); return {
  text: `Berechne $(${d.a} + ${d.b}) · ${d.c}$.`, weg: [`$${d.a + d.b} · ${d.c} = ${d.wert}$`], ergebnis: `$${d.wert}$` }; });
u("rg-potenz", "Potenz vor Punkt vor Strich", 2, (z) => { const d = rgAufgabe("potenz", z); return {
  text: `Berechne $${d.a} + ${d.b}^2$.`, weg: [`$${d.a} + ${d.b * d.b} = ${d.wert}$`], ergebnis: `$${d.wert}$` }; });
u("rg-distributiv", "Geschickt rechnen mit dem Distributivgesetz", 2, (z) => { const d = rgAufgabe("distributiv", z); return {
  text: `Rechne geschickt: $${d.a} · ${d.n}$`, weg: [`$${d.a} · ${d.n} = ${d.a} · (${d.rund} − ${d.d})$`, `$= ${d.a * d.rund} − ${d.a * d.d} = ${gz(d.wert)}$`], ergebnis: `$${gz(d.wert)}$` }; });
u("rg-vorteil", "Rechenvorteil nutzen", 1, (z) => { const d = rgAufgabe("vorteil", z); return {
  text: `Rechne geschickt: $${d.x} · ${d.m} · ${d.y}$`, weg: [`Vertauschen: $${d.x} · ${d.y} · ${d.m} = ${d.x * d.y} · ${d.m}$`, `$= ${gz(d.wert)}$`], ergebnis: `$${gz(d.wert)}$` }; });

/* Koordinatensystem und Symmetrie */
u("ko-xachse", "Spiegeln an der x-Achse", 1, (z) => { const d = koordAufgabe("xachse", z); return {
  text: `Spiegle den Punkt $${punkt("P", d.P)}$ an der $x$-Achse. Gib die Koordinaten des Bildpunkts $P'$ an.`, weg: ["Die $x$-Koordinate bleibt, die $y$-Koordinate wechselt das Vorzeichen."], ergebnis: `$${punkt("P'", d.B)}$` }; });
u("ko-yachse", "Spiegeln an der y-Achse", 1, (z) => { const d = koordAufgabe("yachse", z); return {
  text: `Spiegle den Punkt $${punkt("P", d.P)}$ an der $y$-Achse. Gib die Koordinaten des Bildpunkts $P'$ an.`, weg: ["Die $y$-Koordinate bleibt, die $x$-Koordinate wechselt das Vorzeichen."], ergebnis: `$${punkt("P'", d.B)}$` }; });
u("ko-ursprung", "Spiegeln am Ursprung", 1, (z) => { const d = koordAufgabe("ursprung", z); return {
  text: `Spiegle den Punkt $${punkt("P", d.P)}$ am Ursprung. Gib die Koordinaten des Bildpunkts $P'$ an.`, weg: ["Beide Koordinaten wechseln das Vorzeichen."], ergebnis: `$${punkt("P'", d.B)}$` }; });
u("ko-punktz", "Punktspiegelung an Z", 2, (z) => { const d = koordAufgabe("punktZ", z); return {
  text: `Spiegle den Punkt $${punkt("P", d.P)}$ am Punkt $${punkt("Z", d.Z)}$. Gib die Koordinaten des Bildpunkts $P'$ an.`,
  weg: [`Von $P$ nach $Z$: ${mi(d.Z[0] - d.P[0])} nach rechts, ${mi(d.Z[1] - d.P[1])} nach oben.`, "Denselben Weg von $Z$ aus noch einmal gehen."], ergebnis: `$${punkt("P'", d.B)}$` }; });
u("ko-viereck", "Parallelogramm ergänzen", 2, (z) => { const d = koordAufgabe("viereck", z); return {
  text: `Die Punkte $${punkt("A", d.A)}$, $${punkt("B", d.B)}$ und $${punkt("D", d.D)}$ sind Ecken des Parallelogramms $ABCD$. Bestimme die Koordinaten von $C$.`,
  weg: [`Von $A$ nach $B$: ${mi(d.B[0] - d.A[0])} nach rechts, ${mi(d.B[1] - d.A[1])} nach oben.`, "Denselben Weg von $D$ aus gehen."], ergebnis: `$${punkt("C", d.C)}$` }; });
u("ko-achsen", "Symmetrieachsen", 1, (z) => { const d = koordAufgabe("achsen", z); return {
  text: `Wie viele Symmetrieachsen hat ein ${d.name}?`, weg: [d.anzahl ? `Ein ${d.name} hat ${d.anzahl} ${d.anzahl === 1 ? "Symmetrieachse" : "Symmetrieachsen"}.` : `Ein allgemeines ${d.name} ist nicht achsensymmetrisch.`], ergebnis: `${d.anzahl}` }; });

/* Zufall */
u("zf-wuerfel", "Laplace-Würfel", 1, (z) => { const d = zufallAufgabe("wuerfel", z); return {
  text: `Ein fairer Würfel wird einmal geworfen. Wie groß ist die Wahrscheinlichkeit für ${d.text}?`,
  weg: [`Günstige Ergebnisse: ${d.guenstig.join(", ")}`, `$P = \\frac{${d.guenstig.length}}{6}${d.p.n !== 6 ? ` = ${bT(d.p)}` : ""}$`], ergebnis: `$${bT(d.p)}$` }; });
u("zf-urne", "Ziehen aus einer Urne", 1, (z) => { const d = zufallAufgabe("urne", z); const n = d.r + d.b + d.g; return {
  text: `In einer Urne liegen ${d.r} rote, ${d.b} blaue${d.g ? ` und ${d.g} grüne` : ""} Kugeln. Eine Kugel wird gezogen. Wie groß ist die Wahrscheinlichkeit für eine rote Kugel?`,
  weg: [`$P(\\text{rot}) = \\frac{${d.r}}{${n}}${d.p.n !== n ? ` = ${bT(d.p)}` : ""}$`], ergebnis: `$${bT(d.p)}$` }; });
u("zf-gegen", "Gegenereignis", 1, (z) => { const d = zufallAufgabe("gegen", z); return {
  text: `Die Wahrscheinlichkeit, dass ein Glücksrad auf Gewinn stehen bleibt, ist $${bT(d.p)}$. Wie groß ist die Wahrscheinlichkeit, nicht zu gewinnen?`,
  weg: [`$P(\\overline{E}) = 1 − ${bT(d.p)} = ${bT(d.gegen)}$`], ergebnis: `$${bT(d.gegen)}$` }; });
u("zf-relativ", "Relative Häufigkeit", 1, (z) => { const d = zufallAufgabe("relativ", z); return {
  text: `Eine Reißzwecke wurde ${d.n}-mal geworfen und landete ${d.k}-mal auf dem Rücken. Bestimme die relative Häufigkeit.`, weg: [`$h = \\frac{${d.k}}{${d.n}} = ${dz(d.wert)}$`], ergebnis: `$${dz(d.wert)}$` }; });
u("zf-erwartet", "Erwartete Anzahl", 2, (z) => { const d = zufallAufgabe("erwartet", z); return {
  text: `Ein Ereignis hat die Wahrscheinlichkeit $${bT(d.p)}$. Das Experiment wird ${d.n}-mal durchgeführt. Wie oft erwartest du das Ereignis?`, weg: [`$${d.n} · ${bT(d.p)} = ${gz(d.wert)}$`], ergebnis: `etwa ${gz(d.wert)}-mal` }; });

/* Natürliche Zahlen */
u("zahl-stelle", "Stellenwert", 1, (z) => { const d = zahlAufgabe("stelle", z); return {
  text: `Welche Ziffer steht in der Zahl ${gz(d.n)} an der ${STELLEN[d.i]}stelle?`, weg: [`Von rechts gezählt ist es die ${d.i + 1}. Stelle.`], ergebnis: `${d.ziffer}` }; });
u("zahl-runden", "Runden", 1, (z) => { const d = zahlAufgabe("runden", z); return {
  text: `Runde ${gz(d.n)} auf ${STELLEN[d.i]}.`, weg: [`Entscheidend ist die Ziffer rechts davon: ${Math.floor(d.n / 10 ** (d.i - 1)) % 10}.`], ergebnis: `${gz(d.n)} ≈ ${gz(d.wert)}` }; });
u("zahl-strahl", "Zahlenstrahl", 1, (z) => { const d = zahlAufgabe("strahl", z); return {
  text: `Auf einem Zahlenstrahl liegt bei ${gz(d.start)} der erste Strich, jeder weitere Strich ist um ${gz(d.schritt)} größer. Welche Zahl gehört zum ${d.k}. Strich nach dem ersten?`,
  weg: [`$${gz(d.start)} + ${d.k} · ${gz(d.schritt)} = ${gz(d.wert)}$`], ergebnis: `${gz(d.wert)}` }; });
u("zahl-nachfolger", "Vorgänger und Nachfolger", 1, (z) => { const d = zahlAufgabe("nachfolger", z); return {
  text: `Gib den ${d.vor ? "Vorgänger" : "Nachfolger"} von ${gz(d.n)} an.`, weg: [`$${gz(d.n)} ${d.vor ? "−" : "+"} 1 = ${gz(d.wert)}$`], ergebnis: `${gz(d.wert)}` }; });
u("zahl-roemisch", "Römische Zahlen", 1, (z) => { const d = zahlAufgabe("roemisch", z); return {
  text: `Schreibe ${d.n} als römische Zahl.`, weg: [`${zerlegeRoemisch(d.n)}`], ergebnis: `${d.r}` }; });
u("zahl-zehnerpotenz", "Zehnerpotenzen", 2, (z) => { const d = zahlAufgabe("zehnerpotenz", z);
  const summ = d.ziffern.map((g, i) => (g ? (d.e[i] === 1 ? `${g} · 10` : `${g} · 10^{${d.e[i]}}`) : null)).filter(Boolean).join(" + ");
  return { text: `Schreibe als Zahl: $${summ}$`, weg: d.ziffern.filter(Boolean).length > 1 ? [`$${d.ziffern.map((g, i) => (g ? gz(g * 10 ** d.e[i]) : null)).filter(Boolean).join(" + ")}$`] : [], ergebnis: `${gz(d.wert)}` }; });
function zerlegeRoemisch(n) {
  const t = []; let r = n;
  for (const w of [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]) while (r >= w) { t.push(w); r -= w; }
  const g = []; for (const w of t) { if (g.length && g[g.length - 1].w === w) g[g.length - 1].k++; else g.push({ w, k: 1 }); }
  return g.map((x) => `${x.k > 1 ? `${x.k} · ` : ""}${x.w} (${roemisch(x.w)})`).join(" + ");
}

/* Schriftlich rechnen */
u("schr-add", "Schriftlich addieren", 1, (z) => { const a = 1000 + Math.floor(z() * 89000), b = 100 + Math.floor(z() * 9800); return {
  text: `Rechne schriftlich: $${gz(a)} + ${gz(b)}$`, weg: ["Stellengerecht untereinander schreiben, von rechts nach links addieren, Überträge notieren."], ergebnis: `${gz(a + b)}` }; });
u("schr-sub", "Schriftlich subtrahieren", 1, (z) => { const a = 10000 + Math.floor(z() * 80000), b = 1000 + Math.floor(z() * 9000); return {
  text: `Rechne schriftlich: $${gz(a)} − ${gz(b)}$`, weg: ["Stellengerecht untereinander schreiben, von rechts nach links ergänzen."], ergebnis: `${gz(a - b)}` }; });
u("schr-mul", "Schriftlich multiplizieren", 2, (z) => { const a = 100 + Math.floor(z() * 900), b = 12 + Math.floor(z() * 87); return {
  text: `Rechne schriftlich: $${a} · ${b}$`, weg: [`$${a} · ${Math.floor(b / 10) * 10} = ${gz(a * Math.floor(b / 10) * 10)}$`, `$${a} · ${b % 10} = ${gz(a * (b % 10))}$`].filter((l) => !/· 0 =/.test(l)), ergebnis: `${gz(a * b)}` }; });
u("schr-div", "Schriftlich dividieren", 2, (z) => { const b = wahlAus([3, 4, 6, 7, 8, 9, 12, 15], z), e = 100 + Math.floor(z() * 900); return {
  text: `Rechne schriftlich: $${gz(b * e)} : ${b}$`, weg: [`Probe: $${e} · ${b} = ${gz(b * e)}$`], ergebnis: `${e}` }; });

/* Brüche (bruchGen.js) */
u("bru-kuerzen", "Kürzen", 1, (z) => { const d = bruchAufgabe("kuerzen", z); return {
  text: `Kürze $${bRoh(d.start.z, d.start.n)}$ vollständig.`, weg: [`Zähler und Nenner durch ${d.ggt} teilen.`], ergebnis: `$${bRoh(d.start.z, d.start.n)} = ${bT(d.ergebnis)}$` }; });
u("bru-erweitern", "Erweitern", 1, (z) => { const d = bruchAufgabe("erweitern", z); return {
  text: `Erweitere $${bT(d.start)}$ auf den Nenner ${d.ziel}.`, weg: [`Erweitern mit ${d.faktor}.`], ergebnis: `$${bT(d.start)} = ${bRoh(d.zaehler, d.ziel)}$` }; });
u("bru-sub", "Brüche subtrahieren", 1, (z) => { const d = bruchAufgabe("subtrahieren", z); return {
  text: `Berechne $${bT(d.a)} − ${bT(d.b)}$.`, weg: [`$${bRoh(d.za, d.hn)} − ${bRoh(d.zb, d.hn)} = ${bRoh(d.za - d.zb, d.hn)}${d.ergebnis.n !== d.hn ? ` = ${bT(d.ergebnis)}` : ""}$`], ergebnis: `$${bT(d.ergebnis)}$` }; });
u("bru-mult", "Brüche multiplizieren", 1, (z) => { const d = bruchAufgabe("multiplizieren", z); return {
  text: `Berechne $${bT(d.a)} · ${bT(d.b)}$ und kürze vollständig.`, weg: [`$${bT(d.a)} · ${bT(d.b)} = ${bRoh(d.ungekuerzt.z, d.ungekuerzt.n)} = ${bT(d.ergebnis)}$`], ergebnis: `$${bT(d.ergebnis)}$` }; });
u("bru-gemischt", "Gemischte Zahlen", 2, (z) => { const d = bruchAufgabe("gemischt", z);
  const e = d.ergebnis, g = Math.floor(e.z / e.n), r = e.z - g * e.n;
  return { text: `Berechne $${d.g1}${bT(d.r1)} + ${d.g2}${bT(d.r2)}$.`, weg: [`$${bT(d.u1)} + ${bT(d.u2)} = ${bT(e)}$`],
    ergebnis: `$${bT(e)}${e.n !== 1 && g > 0 ? ` = ${g}${r ? bRoh(r, e.n) : ""}` : ""}$` }; });
u("bru-anteil", "Anteile berechnen", 1, (z) => { const d = bruchAufgabe("anteil", z); return {
  text: `Berechne $${bT(d.b)}$ von ${d.ganzes} €.`, weg: [`$${d.ganzes} : ${d.b.n} = ${d.teil}$`, `$${d.teil} · ${d.b.z} = ${d.ergebnis}$`].filter((l, i) => i === 0 || d.b.z !== 1), ergebnis: `$${d.ergebnis}$ €` }; });
u("bru-vergleichen", "Brüche vergleichen", 1, (z) => { const d = bruchAufgabe("vergleichen", z); const zeichen = d.groesser === "a" ? ">" : "<"; return {
  text: `Setze $<$ oder $>$ ein: $${bT(d.a)} \\;□\\; ${bT(d.b)}$`, weg: [`Gleichnamig machen: $${bRoh(d.za, d.hn)}$ und $${bRoh(d.zb, d.hn)}$`], ergebnis: `$${bT(d.a)} ${zeichen} ${bT(d.b)}$` }; });

/* Unterthemen ohne Generator in trainingDaten.js → Quellen fürs Blatt */
export const BLATT_ZUSATZ = {
  "natzahlen.1": ["zahl-stelle", "zahl-zehnerpotenz"], "natzahlen.2": ["zahl-strahl", "zahl-nachfolger"], "natzahlen.3": ["zahl-runden"], "natzahlen.4": ["prim-ggt", "prim-kgv"],
  "rechnen.1": ["schr-add", "schr-sub"], "rechnen.2": ["schr-mul"], "rechnen.3": ["schr-div"], "rechnen.4": ["rg-vorteil", "rg-distributiv"], "rechnen.5": ["rg-punkt", "rg-klammer", "rg-potenz"],
  "groessen.1": ["gr-laenge"], "groessen.2": ["gr-masse"], "groessen.3": ["gr-zeit"], "groessen.5": ["gr-massstab"],
  "figuren.3": ["ko-viereck", "ko-ursprung"], "figuren.4": ["ko-xachse", "ko-yachse", "ko-achsen"], "figuren.5": ["ko-ursprung", "ko-punktz"],
  "flaechen.1": ["fl-rechteckU"], "flaechen.2": ["gr-flaeche"], "flaechen.3": ["fl-rechteckA", "fl-rueck"],
  "ganze.1": ["ganz-vergleich", "ganz-temperatur"], "ganze.2": ["ganz-vergleich"], "ganze.3": ["ganz-plus", "ganz-minus", "ganz-temperatur"], "ganze.4": ["ganz-mal", "ganz-geteilt", "ganz-klammer"],
  "brueche.2": ["bru-kuerzen", "bru-erweitern"], "brueche.3": ["bru-vergleichen"], "brueche.4": ["bru-gemischt"], "brueche.5": ["bru-anteil"],
  "bruchrechnen.1": ["bru-sub"], "bruchrechnen.2": ["bru-mult"],
  "dezimal.1": ["dez-bruch", "dez-zubruch"], "dezimal.2": ["dez-runden"], "dezimal.3": ["dez-add"], "dezimal.4": ["dez-mal", "dez-geteilt", "dez-zehner"], "dezimal.5": ["dez-periodisch"],
  "rational.1": ["ganz-vergleich"], "rational.3": ["bru-mult"],
  "koerper.2": ["qu-oberflaeche", "qu-wuerfel"], "koerper.3": ["qu-hoehe", "qu-wuerfel", "qu-kanten"], "koerper.4": ["gr-volumen", "gr-hohlmass"],
  "daten.1": ["da-relativ"], "daten.2": ["da-kreis"], "daten.3": ["da-mittelwert", "da-median", "da-spannweite"], "daten.4": ["da-relativ", "zf-relativ"],
  "teilbarkeit.1": ["prim-ist"], "teilbarkeit.2": ["prim-ist", "prim-zerlegung"], "teilbarkeit.3": ["prim-ggt", "prim-ggtsach"], "teilbarkeit.4": ["prim-kgv", "prim-kgvsach"],
  "prozent.1": ["pro-prozentwert"], "prozent.2": ["pro-prozentsatz"], "prozent.3": ["pro-grundwert"], "prozent.4": ["pro-rabatt", "pro-mwst", "pro-netto"], "prozent.5": ["pro-zinsen", "pro-zinseszins"],
  "zuordnungen.1": ["zu-erkennen", "zu-luecke"], "zuordnungen.2": ["zu-prop", "zu-luecke"], "zuordnungen.3": ["zu-anti"], "zuordnungen.4": ["zu-prop", "zu-anti"],
  "wkt1.1": ["zf-wuerfel", "zf-relativ"], "wkt1.2": ["zf-wuerfel", "zf-urne", "zf-gegen"], "wkt1.3": ["zf-erwartet"],
};

/* ======================================================================
   3 · Quellen, Kapitel, Erzeugen
   ====================================================================== */
const TD_IDS = new Set(GENERATOREN.map((g) => g.id));
export const UNTER_IDS = Object.keys(U);
export const ALLE_QUELLEN = [...GENERATOREN.map((g) => `td:${g.id}`), ...UNTER_IDS.map((id) => `u:${id}`)];
export const quelleTitel = (q) => { const [art, id] = q.split(":"); return art === "u" ? (U[id] ? U[id].titel : id) : id; };

/* Alle Quellen eines Unterthemas („td:…“ zuerst, dann „u:…“), ohne Doppelte */
export function quellenFuer(unterthemaId) {
  const [kap, nr] = String(unterthemaId).split(".");
  const ut = unterthemenVon(kap).find((x) => String(x.nr) === nr);
  const td = ut ? ut.gen.filter((g) => TD_IDS.has(g)).map((g) => `td:${g}`) : [];
  const zu = (BLATT_ZUSATZ[unterthemaId] || []).filter((g) => U[g]).map((g) => `u:${g}`);
  return [...new Set([...td, ...zu])];
}
export const afbVon = (quelle) => {
  const [art, id] = quelle.split(":");
  if (art === "td") { const g = GENERATOREN.find((x) => x.id === id); return g ? g.afb : 1; }
  return U[id] ? U[id].afb : 1;
};

/* Unterthemen eines Kapitels mit Anzahl der Aufgabentypen (0 = noch keine Aufgaben) */
export function unterthemenMitQuellen(kapitelId) {
  return unterthemenVon(kapitelId).map((t) => ({ ...t, quellen: quellenFuer(t.id) }));
}
/* Kapitel einer Klasse, nur solche mit mindestens einem Aufgabentyp */
export function kapitelMitAufgaben(schulartId, boxId) {
  return kapitelFuer(schulartId, boxId)
    .map((k) => { const ut = unterthemenMitQuellen(k.id); return { ...k, unterthemen: ut, typen: new Set(ut.flatMap((t) => t.quellen)).size }; })
    .filter((k) => k.typen > 0);
}
export const kapitelTitel = (id) => (KAPITEL[id] ? KAPITEL[id].titel : id);

/* Klassenbox zu einer Klassenstufe (für „Klasse vorbelegen“ aus dem Lehrerkonto) */
export function boxZuStufe(schulartId, stufe) {
  const box = klassenBoxen(schulartId).find((b) => b.klassen.includes(Number(stufe)));
  return box ? box.id : null;
}
export const SCHULFORM_ZU_SCHULART = { G8: "g8", G9: "g9", GMS: "gms" };

/* Eine Aufgabe aus einer Quelle erzeugen */
export function aufgabeAus(quelle, z = Math.random) {
  const [art, id] = quelle.split(":");
  if (art === "td") return ausTraining(id);
  const g = U[id];
  if (!g) throw new Error(`Unbekannte Quelle ${quelle}`);
  const a = g.mach(z);
  return { quelle, afb: g.afb, weg: [], ...a };
}

/* Schwierigkeit: welche Anforderungsbereiche bevorzugt werden (aufsteigend = alle, sortiert) */
export const NIVEAUS = [
  { id: "aufsteigend", name: "Aufsteigend", zeile: "Leicht zuerst, dann schwerer" },
  { id: "leicht", name: "Leicht", zeile: "Grundaufgaben" },
  { id: "mittel", name: "Mittel", zeile: "Grund- und Transferaufgaben" },
  { id: "schwer", name: "Schwer", zeile: "Vor allem Transfer" },
];
const PASST = { aufsteigend: () => true, leicht: (a) => a === 1, mittel: (a) => a <= 2, schwer: (a) => a >= 2 };

/* Quellenfolge fürs Blatt: gleichmäßig über die Unterthemen verteilt, je Unterthema die Typen im Wechsel */
export function quellenFolge(teile, anzahl, niveau = "aufsteigend", z = Math.random) {
  const passt = PASST[niveau] || PASST.aufsteigend;
  const listen = teile.map((t) => {
    const alle = quellenFuer(t);
    const gut = alle.filter((q) => passt(afbVon(q)));
    const l = (gut.length ? gut : alle).slice();
    for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(z() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
    return { teil: t, l, i: 0 };
  }).filter((x) => x.l.length);
  if (!listen.length) return [];
  const folge = [];
  for (let k = 0; folge.length < anzahl; k++) {
    const x = listen[k % listen.length];
    folge.push({ teil: x.teil, quelle: x.l[x.i % x.l.length] });
    x.i++;
  }
  /* aufsteigend: nach Anforderungsbereich sortieren, sonst Reihenfolge der Unterthemen */
  const geordnet = niveau === "aufsteigend" ? folge.map((f, i) => ({ ...f, i })).sort((a, b) => afbVon(a.quelle) - afbVon(b.quelle) || a.i - b.i).map(({ i, ...f }) => f) : folge;
  return entzerren(geordnet);
}
/* Gleicher Aufgabentyp nicht zweimal direkt hintereinander, wenn es sich vermeiden lässt
   (getauscht wird nur innerhalb desselben Anforderungsbereichs, damit „aufsteigend“ erhalten bleibt) */
function entzerren(f) {
  const l = f.slice();
  for (let i = 1; i < l.length; i++) {
    if (l[i].quelle !== l[i - 1].quelle) continue;
    const j = l.findIndex((x, k) => k > i && x.quelle !== l[i - 1].quelle && afbVon(x.quelle) === afbVon(l[i].quelle) && (k + 1 >= l.length || l[k + 1].quelle !== l[i].quelle) && l[k - 1].quelle !== l[i].quelle);
    if (j > 0) [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

/* Text, an dem sich zwei Aufgaben unterscheiden lassen */
const kennung = (a) => `${a.text}|${(a.tabelle && a.tabelle.zeile.join(",")) || ""}`;
/* Eine Aufgabe erzeugen, die sich von allen bisherigen unterscheidet (höchstens 12 Versuche) */
export function neueAufgabeOhne(quelle, vergeben, z = Math.random) {
  let a;
  for (let v = 0; v < 12; v++) { a = aufgabeAus(quelle, z); if (!vergeben.has(kennung(a))) break; }
  vergeben.add(kennung(a));
  return a;
}

/* Das ganze Blatt: { gruppen: [{ name, aufgaben }] } – Gruppe B mit denselben Aufgabentypen, aber neuen Zahlen */
export function blattErstellen({ teile, anzahl = 10, niveau = "aufsteigend", gruppen = 1, z = Math.random }) {
  const n = Math.max(1, Math.min(20, Math.round(anzahl)));
  const folge = quellenFolge(teile, n, niveau, z);
  const vergeben = new Set();
  const namen = gruppen === 2 ? ["A", "B"] : [null];
  return {
    gruppen: namen.map((name) => ({ name, aufgaben: folge.map((f) => ({ ...neueAufgabeOhne(f.quelle, vergeben, z), teil: f.teil })) })),
  };
}

/* Eine einzelne Aufgabe neu würfeln (gleicher Typ, in beiden Gruppen) */
export function aufgabeTauschen(blatt, index, z = Math.random) {
  const vergeben = new Set(blatt.gruppen.flatMap((g) => g.aufgaben.map(kennung)));
  return { ...blatt, gruppen: blatt.gruppen.map((g) => ({ ...g, aufgaben: g.aufgaben.map((a, i) => (i === index ? { ...neueAufgabeOhne(a.quelle, vergeben, z), teil: a.teil } : a)) })) };
}

/* Titel des Blatts: ein Kapitel → Kapiteltitel, mehrere → „Gemischte Übung“ */
export function blattTitel(teile) {
  const kap = [...new Set(teile.map((t) => String(t).split(".")[0]))];
  if (kap.length === 1) {
    const ut = unterthemenVon(kap[0]);
    if (teile.length === 1) { const t = ut.find((x) => x.id === teile[0]); if (t) return t.titel; }
    return kapitelTitel(kap[0]);
  }
  return "Gemischte Übung";
}

/* Link für den QR-Code: führt Schüler direkt ins passende Training (mit Ref-Code der Lehrkraft) */
export const BASIS = "https://mythosmathe.de";
export function trainingsLink({ teile, schulart, box, ref }) {
  const kap = [...new Set(teile.map((t) => String(t).split(".")[0]))];
  const p = new URLSearchParams();
  if (kap.length === 1) { p.set("kapitel", kap[0]); if (teile.length === 1) p.set("teil", teile[0]); }
  if (schulart) p.set("schulart", schulart);
  if (box) p.set("box", box);   /* nicht „klasse“: ?klasse=<Code> ist der Klassenbeitritt (konto.js) */
  if (ref && /^[1-9][0-9]{5}$/.test(String(ref))) p.set("ref", String(ref));
  const s = p.toString();
  return `${BASIS}/trainieren${s ? `?${s}` : ""}`;
}

/* Rechenraum in Zeilen je Aufgabe (nur wenn der Rechenraum an ist) */
export const platzFuer = (a) => PLATZ[a.afb] || 4;

/* Gespeicherte Blätter: kompakte Form (alles, was das Blatt wieder genau so erzeugt) */
export function blattSnapshot({ titel, einstellungen, teile, blatt }) {
  return { titel: String(titel || "").slice(0, 120), einstellungen, teile: teile.slice(0, 60), blatt };
}
