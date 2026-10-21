/* ============================================================
   GFS-Trainer · Der Satz von Bayes – positiv getestet, wie wahrscheinlich
   ist man wirklich krank? (Lambacher Schweizer Kursstufe, Kapitel VIII
   Grundlagen der Wahrscheinlichkeitsrechnung; G8 Klasse 12, G9 Klasse 13)
   Reine Logik ohne React: Bayes-Rechnung (Vierfeldertafel, totale
   Wahrscheinlichkeit, natürliche Häufigkeiten, zweiter Test, Chancen-Form),
   fünf Aufgabentypen mit Zufallszahlen, Lösung und gezielter Rückmeldung
   zu typischen Fehlern, Lückenbeweise, Gliederung und Kolloquium.
   Getestet in tests/gfsBayes.test.mjs.
   Urheberrecht: Alle Aufgaben, Kontexte und Zahlen sind eigene – nichts aus
   dem Schulbuch (Prinzip wie im Kopf von gfsPascalAufgaben.js).
   Prozentwerte werden intern als Zahl in Prozent geführt (2 = 2 %),
   Wahrscheinlichkeiten als Zahl zwischen 0 und 1.
   ============================================================ */

export const rund = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
/* Zahl mit Komma, ohne überflüssige Nullen */
export const dk = (x, n = 2) => String(rund(x, n)).replace("-", "−").replace(".", ",");
/* Ergebnis in Prozent mit fester Stellenzahl: „26,9 %“, „9,0 %“ */
const fest = (x, n) => (Math.round(x * 10 ** n) / 10 ** n).toFixed(n).replace(".", ",");
export const pz = (x, n = 1) => `${fest(x, n)} %`;
/* dieselbe Angabe für Formeln (TeX für M) */
export const pzTex = (x, n = 1) => `${fest(x, n)}\\,\\%`;
/* Angabe in einer Aufgabe: ohne überflüssige Nullen („2 %“, „99,5 %“) */
export const pa = (x) => `${dk(x, 2)} %`;

/* Zahl aus Eingabe („26,9“, „26.9 %“, „−2“); null, wenn nicht lesbar */
export const lies = (s) => {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/−/g, "-").replace(/%$/, "").replace(",", ".");
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null;
};
/* Prozent-Eingabe: „26,9“, „26,9 %“ oder ein Bruch „18/67“ (wird in Prozent umgerechnet) */
export const liesProzent = (s) => {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/−/g, "-");
  const b = /^(\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)$/.exec(t);
  if (b) { const n = Number(b[2].replace(",", ".")); return n ? (Number(b[1].replace(",", ".")) / n) * 100 : null; }
  return lies(t);
};
export const nah = (ist, soll, tol) => ist !== null && ist !== undefined && Math.abs(ist - soll) <= tol;

/* ---------- Zufall ---------- */
const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
/* reproduzierbarer Zufall für Tests: mitSeed(7) liefert zufall(a, b) wie zz */
export function mitSeed(seed) {
  let s = (seed >>> 0) || 1;
  const r = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return (a, b) => a + Math.floor(r() * (b - a + 1));
}
const wahl = (liste, zufall) => liste[zufall(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));
const ganz = (x) => Math.abs(x - Math.round(x)) < 1e-9;

/* ---------- Die Mathematik ---------- */
/* p = Prävalenz P(K), se = Sensitivität P_K(+), sp = Spezifität P_K̄(−) – alle als Wahrscheinlichkeit 0 … 1 */
export function bayes(p, se, sp) {
  const kp = p * se, kn = p * (1 - se), gp = (1 - p) * (1 - sp), gn = (1 - p) * sp;   // die vier Felder der Tafel
  const pPos = kp + gp, pNeg = kn + gn;                                                // totale Wahrscheinlichkeit
  return {
    p, se, sp, kp, kn, gp, gn, pPos, pNeg,
    ppv: pPos > 0 ? kp / pPos : 0,          // P_+(K): krank, wenn positiv
    npv: pNeg > 0 ? gn / pNeg : 0,          // P_−(K̄): gesund, wenn negativ
    rest: pNeg > 0 ? kn / pNeg : 0,         // P_−(K): krank trotz negativem Test
    lr: sp < 1 ? se / (1 - sp) : Infinity,  // Likelihood-Quotient des positiven Tests
  };
}
/* Nach k positiven Tests hintereinander (Tests bei gegebenem Zustand unabhängig): der neue Prior ist der alte Befund */
export function nachTests(p, se, sp, k = 1) {
  let q = p;
  for (let i = 0; i < k; i++) q = bayes(q, se, sp).ppv;
  return q;
}
/* Chancen-Form: Chance danach = Chance davor · Likelihood-Quotient */
export const chance = (q) => q / (1 - q);
export const ausChance = (o) => o / (1 + o);

/* Natürliche Häufigkeiten: N Personen, auf ganze Personen gerundet – Summen bleiben stimmig */
export function haeufigkeiten(N, p, se, sp) {
  const krank = Math.round(N * p);
  const kp = Math.round(krank * se), kn = krank - kp;
  const gesund = N - krank;
  const gp = Math.round(gesund * (1 - sp)), gn = gesund - gp;
  return { N, krank, gesund, kp, kn, gp, gn, pos: kp + gp, neg: kn + gn };
}

/* ---------- Labor: Voreinstellungen (eigene Beispiele) ---------- */
export const LABOR_START = { p: 2, se: 90, sp: 95 };   // 20 Kranke, 18 richtig positiv, 49 falsch positiv → 18 von 67
export const VOREINSTELLUNGEN = [
  { id: "start", name: "Start: 2 % · 90 % · 95 %", p: 2, se: 90, sp: 95 },
  { id: "selten", name: "Sehr selten", p: 0.1, se: 99, sp: 99 },
  { id: "welle", name: "Infektionswelle", p: 20, se: 90, sp: 95 },
  { id: "ungenau", name: "Ungenauer Test", p: 2, se: 90, sp: 80 },
];
/* Prävalenz-Regler: logarithmische Skala von 0,1 % bis 50 % (Reglerwert 0 … 100) */
export const P_MIN = 0.1, P_MAX = 50;
export const pAusRegler = (v) => {
  const x = P_MIN * (P_MAX / P_MIN) ** (v / 100);
  return x < 1 ? rund(x, 2) : x < 10 ? rund(x, 1) : Math.round(x);
};
export const reglerAusP = (p) => (100 * Math.log(p / P_MIN)) / Math.log(P_MAX / P_MIN);

/* ---------- Kontexte (eigene Formulierungen) ---------- */
/* b = Buchstabe des Ereignisses; ja/nein = Zustand (für „Zeile ja“); jaN/neinN = die Gruppen im Plural;
   lage/test = Sätze der Aufgabe; fragePos/frageNeg = Nebensatz der Frage */
export const KONTEXTE = [
  { id: "virus", b: "I", menge: "Personen", ja: "infiziert", nein: "nicht infiziert", jaN: "Infizierten", neinN: "Nicht-Infizierten",
    lage: (p) => `In einer Stadt sind gerade ${p} der Einwohner mit einem Virus infiziert.`,
    test: (se, sp) => `Ein Schnelltest zeigt bei ${se} der Infizierten „positiv“ an; bei Nicht-Infizierten zeigt er in ${sp} der Fälle richtig „negativ“.`,
    posPl: "testen positiv", fragePos: "eine positiv getestete Person wirklich infiziert ist", frageNeg: "eine negativ getestete Person trotzdem infiziert ist" },
  { id: "doping", b: "D", menge: "Sportler", ja: "gedopt", nein: "nicht gedopt", jaN: "gedopten Sportlern", neinN: "sauberen Sportlern",
    lage: (p) => `Bei einem Wettkampf sind ${p} der Sportler gedopt.`,
    test: (se, sp) => `Die Kontrolle schlägt bei ${se} der gedopten Sportler an. Saubere Sportler erkennt sie in ${sp} der Fälle als sauber.`,
    posPl: "werden positiv getestet", fragePos: "ein positiv getesteter Sportler wirklich gedopt ist", frageNeg: "ein negativ getesteter Sportler trotzdem gedopt ist" },
  { id: "bauteil", b: "F", menge: "Bauteile", ja: "fehlerhaft", nein: "in Ordnung", jaN: "fehlerhaften Teilen", neinN: "einwandfreien Teilen",
    lage: (p) => `In einer Fabrik sind ${p} der gefertigten Bauteile fehlerhaft.`,
    test: (se, sp) => `Ein Prüfgerät sortiert ${se} der fehlerhaften Teile aus („positiv“). Von den einwandfreien Teilen lässt es ${sp} passieren („negativ“).`,
    posPl: "werden aussortiert", fragePos: "ein aussortiertes Bauteil wirklich fehlerhaft ist", frageNeg: "ein durchgelassenes Bauteil trotzdem fehlerhaft ist" },
  { id: "spam", b: "S", menge: "E-Mails", ja: "Spam", nein: "kein Spam", jaN: "Spam-Mails", neinN: "echten Mails",
    lage: (p) => `In einem Postfach sind ${p} der eingehenden E-Mails Spam.`,
    test: (se, sp) => `Ein Filter markiert ${se} der Spam-Mails als Spam („positiv“). Echte Mails lässt er in ${sp} der Fälle unmarkiert („negativ“).`,
    posPl: "werden markiert", fragePos: "eine markierte E-Mail wirklich Spam ist", frageNeg: "eine nicht markierte E-Mail trotzdem Spam ist" },
];
const kontextVon = (id) => KONTEXTE.find((k) => k.id === id) || KONTEXTE[0];

/* ---------- Aufgabentypen ---------- */
export const ARTEN = [
  { id: "ppv", name: "Positiv – wirklich?" },
  { id: "haeufigkeit", name: "Natürliche Häufigkeiten" },
  { id: "tafel", name: "Tafel umdrehen" },
  { id: "zweiter", name: "Zweiter Test" },
  { id: "negativ", name: "Negativ – Entwarnung?" },
];

/* Zahlen je Stufe (in Prozent). Stufe 1: häufiges Merkmal, Stufe 5: sehr seltenes Merkmal mit sehr gutem Test */
const P_STUFE = [[10, 20, 25, 30], [2, 4, 5, 8], [0.5, 1, 2, 3], [0.1, 0.2, 0.5], [0.05, 0.1, 0.2]];
const SE_STUFE = [[80, 90], [90, 95], [95, 98, 99], [98, 99], [99, 99.5]];
const SP_STUFE = [[80, 90], [90, 95], [95, 97, 98], [98, 99, 99.5], [99, 99.5, 99.9]];
/* Restrisiko: häufigere Merkmale und schwächere Trefferquote, sonst bleibt nur „0,00 %“ */
const P_NEG = [[20, 25, 30], [10, 15, 20], [5, 8, 10], [2, 4, 5], [1, 2]];
const SE_NEG = [[80, 85], [85, 90], [90, 95], [95, 98], [98, 99]];

/* Kombination mit ganzzahligen Häufigkeiten bei N (für Häufigkeit und Tafel) */
const N_STUFE = [[1000], [1000, 2000], [10000], [100000], [100000]];
function ganzeZahlen(s, zufall) {
  for (let i = 0; i < 80; i++) {
    const N = wahl(N_STUFE[s - 1], zufall), p = wahl(P_STUFE[s - 1], zufall), se = wahl(SE_STUFE[s - 1], zufall), sp = wahl(SP_STUFE[s - 1], zufall);
    const krank = (N * p) / 100, kp = (krank * se) / 100, gp = ((N - krank) * (100 - sp)) / 100;
    if (ganz(krank) && ganz(kp) && ganz(gp) && kp >= 1 && gp >= 1) return { N, p, se, sp };
  }
  return [{ N: 1000, p: 10, se: 90, sp: 90 }, { N: 1000, p: 4, se: 90, sp: 95 }, { N: 10000, p: 1, se: 98, sp: 97 },
    { N: 100000, p: 0.2, se: 99, sp: 99 }, { N: 100000, p: 0.1, se: 99, sp: 99.5 }][s - 1];
}

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  const k = wahl(KONTEXTE, zufall).id;
  if (art === "haeufigkeit" || art === "tafel") {
    const z = ganzeZahlen(s, zufall);
    const h = haeufigkeiten(z.N, z.p / 100, z.se / 100, z.sp / 100);
    if (art === "haeufigkeit") return { art, stufe: s, k, ...z, h, kp: h.kp, gp: h.gp, ppv: (100 * h.kp) / h.pos };
    return { art, stufe: s, k, N: z.N, h, sens: (100 * h.kp) / h.krank, ppv: (100 * h.kp) / h.pos };
  }
  const neg = art === "negativ";
  const p = wahl((neg ? P_NEG : P_STUFE)[s - 1], zufall), se = wahl((neg ? SE_NEG : SE_STUFE)[s - 1], zufall), sp = wahl(SP_STUFE[s - 1], zufall);
  const r = bayes(p / 100, se / 100, sp / 100);
  const basis = { art, stufe: s, k, p, se, sp };
  if (art === "zweiter") return { ...basis, ppv1: 100 * r.ppv, ppv2: 100 * nachTests(p / 100, se / 100, sp / 100, 2), pPos: 100 * r.pPos };
  if (neg) return { ...basis, rest: 100 * r.rest, pNeg: 100 * r.pNeg, stellen: 100 * r.rest >= 1 ? 2 : 3 };
  return { ...basis, art: "ppv", ppv: 100 * r.ppv, pPos: 100 * r.pPos };
}

/* Tausender mit schmalem Leerzeichen ab 10 000 (vierstellige Zahlen bleiben zusammen) */
export const tausender = (n) => (Math.abs(n) >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F") : String(n));

/* Auftrag in Worten */
export function auftrag(a) {
  const K = kontextVon(a.k);
  if (a.art === "tafel") return `Eine Studie mit ${tausender(a.N)} ${K.menge} liefert die Tafel unten. Bestimme die Trefferquote (Anteil der positiven Ergebnisse unter den ${K.jaN}) und die Wahrscheinlichkeit, dass ${K.fragePos}. (in Prozent auf eine Nachkommastelle)`;
  const kopf = `${K.lage(pa(a.p))} ${K.test(pa(a.se), pa(a.sp))}`;
  if (a.art === "haeufigkeit") return `${kopf} Stell dir ${tausender(a.N)} ${K.menge} vor. Wie viele sind ${K.ja} und ${K.posPl}, wie viele sind ${K.nein} und ${K.posPl}? Wie wahrscheinlich ist es damit, dass ${K.fragePos}? (in Prozent auf eine Nachkommastelle)`;
  if (a.art === "zweiter") return `${kopf} Jedes positive Ergebnis wird mit einem zweiten, unabhängigen Test derselben Güte nachgeprüft. Wie wahrscheinlich ist es, dass ${K.fragePos} – nach dem ersten und nach zwei positiven Tests? (in Prozent auf eine Nachkommastelle)`;
  if (a.art === "negativ") return `${kopf} Wie groß ist das Restrisiko, dass ${K.frageNeg}? (in Prozent auf ${a.stellen === 3 ? "drei" : "zwei"} Nachkommastellen)`;
  return `${kopf} Wie wahrscheinlich ist es, dass ${K.fragePos}? (in Prozent auf eine Nachkommastelle)`;
}

/* Ereignis-Zeichen eines Kontexts für Formeln */
export const zeichen = (a) => kontextVon(a.k).b;
export const kontext = (a) => kontextVon(a.k);

/* Eingabefelder: [schlüssel, Beschriftung (TeX), Einheit] */
export function felder(a) {
  const b = zeichen(a);
  if (a.art === "haeufigkeit") return [["kp", `${b} \\cap +`, "Anzahl"], ["gp", `\\overline{${b}} \\cap +`, "Anzahl"], ["ppv", `P_{+}(${b})`, "%"]];
  if (a.art === "tafel") return [["sens", `P_{${b}}(+)`, "%"], ["ppv", `P_{+}(${b})`, "%"]];
  if (a.art === "zweiter") return [["ppv1", `P_{+}(${b})`, "%"], ["ppv2", `P_{++}(${b})`, "%"]];
  if (a.art === "negativ") return [["rest", `P_{−}(${b})`, "%"]];
  return [["ppv", `P_{+}(${b})`, "%"]];
}
/* Toleranz: Rundung auf eine (Restrisiko: zwei) Nachkommastellen plus ein Prozent des Werts */
const TOL = { ppv: (x) => Math.max(0.06, x * 0.005), ppv1: (x) => Math.max(0.06, x * 0.005), ppv2: (x) => Math.max(0.06, x * 0.005),
  sens: (x) => Math.max(0.06, x * 0.005), rest: (x) => Math.max(0.0006, x * 0.01), kp: () => 0, gp: () => 0 };

/* Typische Fehler je Feld: [Wert, Rückmeldung] – geprüft, wenn die Eingabe nicht stimmt */
function fehlerKandidaten(a, k) {
  const b = zeichen(a), K = kontextVon(a.k), nb = `\\overline{${b}}`;
  const p = (a.p ?? 0) / 100, se = (a.se ?? 0) / 100, sp = (a.sp ?? 0) / 100;
  if (a.art === "ppv" || (a.art === "zweiter" && k === "ppv1")) return [
    [100 * se, `Das ist die Trefferquote $P_{${b}}(+)$ – die Wahrscheinlichkeit für „positiv“ unter den ${K.jaN}. Gefragt ist die umgekehrte Richtung $P_{+}(${b})$. Genau diese Verwechslung ist der Kern des Themas.`],
    [100 * p * se, `Das ist $P(${b} \\cap +)$, ein Anteil an allen. Gefragt ist der Anteil unter den Positiven: Teile noch durch $P(+)$.`],
    [100 * (p * se + (1 - p) * (1 - sp)), `Das ist $P(+)$, die Wahrscheinlichkeit für ein positives Ergebnis überhaupt. Sie gehört in den Nenner – im Zähler steht nur der Pfad „${b} und positiv“.`],
    [100 * sp, "Das ist die Spezifität – sie beschreibt die andere Gruppe und das negative Ergebnis."],
    [100 * ((p * se) / (p * se + (1 - p) * sp)), `Im Nenner steht der falsche Ast: Aus der Gruppe $${nb}$ zählen nur die falsch positiven, also der Anteil $1 - ${dk(sp, 4)} = ${dk(1 - sp, 4)}$, nicht die Spezifität selbst.`],
    [100 * ((p * se) / (p * se + (1 - sp))), `Fast: Der falsch positive Pfad ist $P(${nb}) \\cdot P_{${nb}}(+)$ – den Faktor $P(${nb}) = ${dk(1 - p, 4)}$ nicht vergessen.`],
    [100 * p, "Das ist nur die Ausgangslage vor dem Test. Das positive Ergebnis verändert die Wahrscheinlichkeit – rechne mit dem Satz von Bayes."],
  ];
  if (a.art === "zweiter") return [
    [a.ppv1, "Das ist der Wert nach dem ersten Test. Nach dem zweiten positiven Ergebnis wird neu gerechnet – mit dem ersten Ergebnis als neuer Ausgangswahrscheinlichkeit."],
    [100 * (1 - (1 - a.ppv1 / 100) ** 2), `Zwei Tests sind keine zwei Versuche auf dasselbe Ereignis. Nimm $P_{+}(${b})$ aus dem ersten Test als neue Ausgangswahrscheinlichkeit und rechne Bayes noch einmal.`],
    [100 * (p * se * se) / (p * se * se + (1 - p) * (1 - sp)), `Fast: Beim zweiten Test schlagen auch die falschen Alarme ein zweites Mal an – im Nenner gehört $(1 - ${dk(sp, 4)})^{2}$ zum Pfad $${nb}$.`],
  ];
  if (a.art === "negativ") return [
    [100 * (1 - se), `Das ist $P_{${b}}(−)$: der Anteil der Übersehenen unter den ${K.jaN}. Gefragt ist der Anteil unter allen Negativen, $P_{−}(${b})$.`],
    [100 * p * (1 - se), `Das ist $P(${b} \\cap −)$, ein Anteil an allen. Teile noch durch $P(−)$.`],
    [100 * (1 - sp), `Das ist der Anteil falscher Alarme unter den ${K.neinN} – er gehört zum positiven Ergebnis, nicht zum negativen.`],
    [100 * bayes(p, se, sp).npv, `Das ist die Gegenwahrscheinlichkeit $P_{−}(${nb})$ – gefragt ist das Restrisiko $P_{−}(${b})$.`],
    [100 * p, "Das ist die Ausgangslage vor dem Test. Ein negatives Ergebnis senkt das Risiko – rechne mit dem Satz von Bayes."],
  ];
  if (a.art === "haeufigkeit") {
    const h = a.h;
    if (k === "kp") return [
      [h.kn, `Das sind die übersehenen Fälle. Gesucht sind ${pa(a.se)} von ${tausender(h.krank)}.`],
      [Math.round(a.N * se), `Die Trefferquote bezieht sich nur auf die ${tausender(h.krank)} ${K.menge} mit dem Merkmal – nicht auf alle ${tausender(a.N)}.`],
    ];
    if (k === "gp") return [
      [h.gn, `Das sind die richtig negativen. Falsch positiv sind ${pa(100 - a.sp)} der ${tausender(h.gesund)} ${K.menge} ohne das Merkmal.`],
      [Math.round(a.N * (1 - sp)), `Die falschen Alarme kommen nur aus der Gruppe ohne Merkmal (${tausender(h.gesund)} ${K.menge}) – nicht aus allen ${tausender(a.N)}.`],
    ];
    return [
      [a.se, "Das ist die Trefferquote. Gefragt ist der Anteil der Richtigen unter allen Positiven: richtig positive durch alle positiven."],
      [(100 * h.kp) / a.N, "Teile durch die Zahl aller Positiven, nicht durch alle."],
      [(100 * h.kp) / h.gp, "Teile durch alle Positiven – die richtig positiven gehören in den Nenner mit hinein."],
    ];
  }
  if (a.art === "tafel") {
    const h = a.h;
    if (k === "sens") return [
      [a.ppv, `Vertauscht: Das ist $P_{+}(${b})$. Die Trefferquote $P_{${b}}(+)$ ist ein Anteil in der Zeile „${K.ja}“.`],
      [(100 * h.kp) / a.N, `Das ist der Anteil an allen. Die Trefferquote ist ein Anteil innerhalb der Zeile „${K.ja}“.`],
    ];
    return [
      [a.sens, `Vertauscht: Das ist die Trefferquote $P_{${b}}(+)$. Gefragt ist der Anteil innerhalb der Spalte „positiv“.`],
      [(100 * h.kp) / a.N, "Das ist der Anteil an allen. Gefragt ist der Anteil innerhalb der Spalte „positiv“."],
    ];
  }
  return [];
}

/* Prüfen: eingabe = { schlüssel: Text } → { ok, felder: { schlüssel: bool }, grund } */
export function pruefe(a, eingabe) {
  const f = {};
  let grund = "";
  for (const [k, , einheit] of felder(a)) {
    const soll = a[k];
    const ist = einheit === "%" ? liesProzent(eingabe[k]) : lies(eingabe[k]);
    f[k] = nah(ist, soll, TOL[k](soll));
    if (f[k] || grund || ist === null) continue;
    if (einheit === "%" && soll >= 1 && nah(ist * 100, soll, TOL[k](soll))) { grund = "Richtig gerechnet – aber als Dezimalzahl eingegeben. Gib die Wahrscheinlichkeit in Prozent an."; continue; }
    /* der nächstliegende typische Fehler (mehrere können nah beieinander liegen) */
    let best = Infinity;
    for (const [wert, text] of fehlerKandidaten(a, k)) {
      if (!Number.isFinite(wert) || nah(wert, soll, TOL[k](soll) * 2)) continue;   // fällt mit der richtigen Lösung zusammen
      const d = Math.abs(ist - wert);
      if (d <= Math.max(TOL[k](wert), einheit === "%" ? 0.06 : 0) && d < best) { best = d; grund = text; }
    }
  }
  return { ok: Object.values(f).every(Boolean), felder: f, grund };
}

/* Tafel als Daten für die Anzeige (Aufgabentyp „tafel“) */
export function tafelZeilen(a) {
  const K = kontextVon(a.k), h = a.h;
  return {
    kopf: ["", "positiv", "negativ", "Summe"],
    zeilen: [[K.ja, h.kp, h.kn, h.krank], [K.nein, h.gp, h.gn, h.gesund], ["Summe", h.pos, h.neg, h.N]],
  };
}

/* Formeln: Rechenweg. A5: jede Zeile endet mit einem ausgerechneten Wert, nichts Ausrechenbares bleibt am
   Zeilenende stehen. Kurze Zeilen (Pfad für Pfad), damit sie auch am Handy in die Karte passen. */
const w = (x) => dk(x, 8);   // Wahrscheinlichkeit als Dezimalzahl, ohne überflüssige Nullen
const w4 = (x) => dk(x, 4);  // gerundeter Zwischenwert (mit ≈)
export function rechenweg(a) {
  const b = zeichen(a), nb = `\\overline{${b}}`, K = kontextVon(a.k);
  if (a.art === "haeufigkeit") {
    const h = a.h;
    return [
      `${tausender(a.N)} \\cdot ${w(a.p / 100)} = ${tausender(h.krank)} \\text{ ${K.ja}}`,
      `${tausender(a.N)} - ${tausender(h.krank)} = ${tausender(h.gesund)} \\text{ ${K.nein}}`,
      `${b} \\cap +: \\; ${tausender(h.krank)} \\cdot ${w(a.se / 100)} = ${tausender(h.kp)}`,
      `${nb} \\cap +: \\; ${tausender(h.gesund)} \\cdot ${w(1 - a.sp / 100)} = ${tausender(h.gp)}`,
      `P_{+}(${b}) = \\frac{${tausender(h.kp)}}{${tausender(h.kp)} + ${tausender(h.gp)}} = \\frac{${tausender(h.kp)}}{${tausender(h.pos)}} \\approx ${pzTex(a.ppv)}`,
    ];
  }
  if (a.art === "tafel") {
    const h = a.h;
    return [
      `\\text{Zeile ${K.ja}: } P_{${b}}(+) = \\frac{${tausender(h.kp)}}{${tausender(h.krank)}} \\approx ${pzTex(a.sens)}`,
      `\\text{Spalte positiv: } P_{+}(${b}) = \\frac{${tausender(h.kp)}}{${tausender(h.pos)}} \\approx ${pzTex(a.ppv)}`,
    ];
  }
  const p = a.p / 100, se = a.se / 100, sp = a.sp / 100;
  const r = bayes(p, se, sp);
  if (a.art === "negativ") return [
    `P_{−}(${b}) = \\frac{P(${b} \\cap −)}{P(−)}`,
    `P(${b} \\cap −) = ${w(p)} \\cdot ${w(1 - se)} = ${w(r.kn)}`,
    `P(${nb} \\cap −) = ${w(1 - p)} \\cdot ${w(sp)} = ${w(r.gn)}`,
    `P(−) = ${w(r.kn)} + ${w(r.gn)} = ${w(r.pNeg)}`,
    `P_{−}(${b}) = \\frac{${w(r.kn)}}{${w(r.pNeg)}} \\approx ${pzTex(a.rest, a.stellen)}`,
  ];
  const zeilen = [
    `P_{+}(${b}) = \\frac{P(${b} \\cap +)}{P(+)}`,
    `P(${b} \\cap +) = ${w(p)} \\cdot ${w(se)} = ${w(r.kp)}`,
    `P(${nb} \\cap +) = ${w(1 - p)} \\cdot ${w(1 - sp)} = ${w(r.gp)}`,
    `P(+) = ${w(r.kp)} + ${w(r.gp)} = ${w(r.pPos)}`,
    `P_{+}(${b}) = \\frac{${w(r.kp)}}{${w(r.pPos)}} \\approx ${pzTex(100 * r.ppv)}`,
  ];
  if (a.art !== "zweiter") return zeilen;
  const q = r.ppv, r2 = bayes(q, se, sp);
  return [
    ...zeilen,
    `\\text{Neuer Ausgangswert: } P(${b}) \\approx ${w4(q)}`,
    `P(${b} \\cap +) \\approx ${w4(q)} \\cdot ${w(se)} \\approx ${w4(r2.kp)}`,
    `P(${nb} \\cap +) \\approx ${w4(1 - q)} \\cdot ${w(1 - sp)} \\approx ${w4(r2.gp)}`,
    `P_{++}(${b}) \\approx \\frac{${w4(r2.kp)}}{${w4(r2.kp)} + ${w4(r2.gp)}} \\approx ${pzTex(100 * r2.ppv)}`,
  ];
}

export function tipp(a) {
  const b = zeichen(a);
  if (a.art === "haeufigkeit") return "Erst aufteilen: wie viele haben das Merkmal, wie viele nicht. Dann in jeder Gruppe den Anteil mit positivem Ergebnis. Zum Schluss: richtig positive durch alle positiven.";
  if (a.art === "tafel") return `Trefferquote: in der Zeile „${kontextVon(a.k).ja}“ den Anteil der Positiven. Umgekehrt: in der Spalte „positiv“ den Anteil von „${kontextVon(a.k).ja}“. Gleiches Feld, anderer Nenner.`;
  if (a.art === "negativ") return `Wie beim positiven Ergebnis, nur mit den negativen Ästen: Zähler $P(${b}) \\cdot P_{${b}}(−)$, Nenner $P(−)$ über beide Pfade.`;
  if (a.art === "zweiter") return `Erst $P_{+}(${b})$ wie gewohnt. Dann noch einmal Bayes – diesmal ist die Ausgangswahrscheinlichkeit nicht mehr $P(${b})$, sondern das Ergebnis des ersten Tests.`;
  return `Zähler: der Pfad „${b} und positiv“. Nenner: alle Pfade zu „positiv“ (totale Wahrscheinlichkeit). Achtung: Die falsch positiven kommen aus der großen Gruppe $\\overline{${b}}$.`;
}

/* ---------- Begründen: Beweise mit Lücken ---------- */
export const BEGRUENDUNGEN = [
  {
    id: "herleitung", titel: "Warum gilt der Satz von Bayes?",
    ziel: "P_{B}(A) = \\frac{P(A) \\cdot P_{A}(B)}{P(B)}",
    schritte: [
      { text: "Die bedingte Wahrscheinlichkeit ist definiert als $P_{B}(A) = $ …",
        optionen: ["$\\frac{P(A \\cap B)}{P(B)}$", "$\\frac{P(A \\cap B)}{P(A)}$", "$P(A) \\cdot P(B)$"], richtig: 0 },
      { text: "Genauso gilt $P_{A}(B) = \\frac{P(A \\cap B)}{P(A)}$. Mit $P(A)$ multipliziert ergibt das …",
        optionen: ["$P(A \\cap B) = P(A) \\cdot P_{A}(B)$ – die Pfadregel", "$P(A \\cap B) = P(A) + P_{A}(B)$", "$P(A \\cap B) = P_{B}(A)$"], richtig: 0 },
      { text: "Diese Schnittwahrscheinlichkeit setzen wir in die Definition von $P_{B}(A)$ ein. Es folgt …",
        optionen: ["$P_{B}(A) = \\frac{P(A) \\cdot P_{A}(B)}{P(B)}$", "$P_{B}(A) = P_{A}(B)$", "$P_{B}(A) = \\frac{P(B)}{P(A) \\cdot P_{A}(B)}$"], richtig: 0 },
      { text: "Damit ist $P_{B}(A) = P_{A}(B)$ nur dann, wenn …",
        optionen: ["$P(A) = P(B)$ gilt", "$A$ und $B$ unabhängig sind", "immer"], richtig: 0 },
    ],
  },
  {
    id: "nenner", titel: "Warum steht im Nenner die totale Wahrscheinlichkeit?",
    ziel: "P(+) = P(K) \\cdot P_{K}(+) + P(\\overline{K}) \\cdot P_{\\overline{K}}(+)",
    schritte: [
      { text: "Jede getestete Person ist entweder krank oder gesund. Deshalb zerfällt das Ereignis $+$ in …",
        optionen: ["die beiden disjunkten Teile $K \\cap +$ und $\\overline{K} \\cap +$", "die Teile $K$ und $+$", "die Teile $K \\cap +$ und $K \\cap −$"], richtig: 0 },
      { text: "Disjunkte Teile darf man addieren: $P(+) = $ …",
        optionen: ["$P(K \\cap +) + P(\\overline{K} \\cap +)$", "$P(K) + P(+)$", "$P(K \\cap +) \\cdot P(\\overline{K} \\cap +)$"], richtig: 0 },
      { text: "Jeder Teil ist ein Pfad im Baum. Nach der Pfadregel ist $P(\\overline{K} \\cap +) = $ …",
        optionen: ["$P(\\overline{K}) \\cdot P_{\\overline{K}}(+)$", "$P(\\overline{K}) \\cdot P_{K}(+)$", "$P_{\\overline{K}}(+)$"], richtig: 0 },
      { text: "Im Nenner von $P_{+}(K)$ stehen also …",
        optionen: ["alle Wege, die zu „positiv“ führen – auch die falschen Alarme", "nur die Kranken", "alle Personen"], richtig: 0 },
    ],
  },
  {
    id: "basisrate", titel: "Warum hilft ein guter Test bei einer seltenen Krankheit so wenig?",
    ziel: "P_{+}(K) = \\frac{p \\cdot s}{p \\cdot s + (1 - p) \\cdot f}",
    schritte: [
      { text: "Hier ist $p = P(K)$, $s$ die Trefferquote und $f = 1 - \\text{Spezifität}$ der Anteil falscher Alarme. Wird $p$ sehr klein, dann ist $1 - p$ …",
        optionen: ["fast 1 – die Gesunden sind fast alle", "fast 0", "gleich $p$"], richtig: 0 },
      { text: "Der Nenner ist dann ungefähr $p \\cdot s + f$. Wenn $p \\cdot s$ viel kleiner als $f$ ist, gilt $P_{+}(K) \\approx$ …",
        optionen: ["$\\frac{p \\cdot s}{f}$ – und das ist klein", "$s$", "$1 - f$"], richtig: 0 },
      { text: "Beispiel: $p = 0{,}001$, $s = 0{,}99$, $f = 0{,}01$. Dann ist $P_{+}(K) = \\frac{0{,}00099}{0{,}00099 + 0{,}00999} \\approx$ …",
        optionen: ["$9\\,\\%$", "$99\\,\\%$", "$50\\,\\%$"], richtig: 0 },
      { text: "Wer nur auf die 99 % Trefferquote schaut und die Basisrate $p$ vergisst, begeht …",
        optionen: ["den Basisratenfehler", "keinen Fehler", "einen Rundungsfehler"], richtig: 0 },
    ],
  },
  {
    id: "zweiter", titel: "Warum macht ein zweiter positiver Test so viel sicherer?",
    ziel: "\\frac{P_{++}(K)}{P_{++}(\\overline{K})} = \\frac{P(K)}{P(\\overline{K})} \\cdot \\left(\\frac{s}{f}\\right)^{2}",
    schritte: [
      { text: "Nach dem ersten positiven Test kennen wir $P_{+}(K)$. Für den zweiten Test ist das …",
        optionen: ["die neue Ausgangswahrscheinlichkeit", "egal – man rechnet wieder mit $P(K)$", "die neue Trefferquote"], richtig: 0 },
      { text: "Schreibt man Wahrscheinlichkeiten als Chancen $\\frac{q}{1 - q}$, wird jeder positive Test zu einer Multiplikation mit …",
        optionen: ["$\\frac{s}{f}$, dem Likelihood-Quotienten", "$s$", "$1 - f$"], richtig: 0 },
      { text: "Bei $s = 0{,}9$ und $f = 0{,}05$ ist $\\frac{s}{f} = 18$. Zwei positive Tests vervielfachen die Chance also mit …",
        optionen: ["$324$", "$36$", "$18$"], richtig: 0 },
      { text: "Das gilt aber nur, wenn die beiden Tests …",
        optionen: ["bei Kranken und bei Gesunden jeweils unabhängig voneinander ausfallen", "von derselben Person ausgewertet werden", "gleich teuer sind"], richtig: 0 },
    ],
  },
];

/* Reihenfolge der Antworten je Anzeige mischen – die richtige liegt sonst immer vorn */
export function gemischt(optionen, salz = 0) {
  const idx = optionen.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = (i * 7 + salz * 3 + 1) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

/* ---------- GFS: Gliederung und Kolloquium ----------
   RoterFaden und Kolloquium zeigen Klartext (keine Formeln) – deshalb hier die Schreibweise P(K | +),
   die auf der Seite als zweite Schreibweise für P₊(K) eingeführt wird. */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg mit einer Schätzfrage", text: "Die Klasse schätzen lassen: 2 % sind krank, der Test erkennt 90 % der Kranken und schlägt bei 5 % der Gesunden falsch an. Jemand testet positiv – wie wahrscheinlich ist er krank? Die Schätzungen an der Tafel sammeln; meistens liegen sie bei 90 %." },
  { min: 4, titel: "1000 Personen statt Formeln", text: "Mit natürlichen Häufigkeiten auflösen: 20 Kranke, davon 18 positiv; 980 Gesunde, davon 49 falsch positiv. Von 67 Positiven sind nur 18 krank – etwa 27 %. Das Punktebild zeigen und den Aha-Moment wirken lassen." },
  { min: 6, titel: "Die Herleitung an der Tafel", text: "Bedingte Wahrscheinlichkeit, Pfadregel und die Schnittmenge auf zwei Arten schreiben – daraus folgt der Satz von Bayes. Dann den Nenner mit dem Satz von der totalen Wahrscheinlichkeit zerlegen und das Beispiel einsetzen. Baum und umgekehrten Baum nebeneinander zeigen." },
  { min: 4, titel: "Basisratenfehler und zweiter Test", text: "Die Kurve P(K | +) gegen die Prävalenz zeigen: Bei seltenen Krankheiten sind die meisten Positiven gesund. Dann der zweite Test: Das erste Ergebnis wird zur neuen Ausgangswahrscheinlichkeit, aus 26,9 % werden 86,9 %." },
  { min: 2, titel: "Bedeutung und Fazit", text: "Wo der Fehler im Alltag vorkommt: Screening, Spamfilter, Gerichtsurteile, Rasterfahndung. Fazit in einem Satz: Nicht die Trefferquote des Tests entscheidet allein, sondern wie viele falsche Alarme aus der großen Gruppe der Gesunden kommen." },
];

export const TIPPS = [
  "Erst die Häufigkeiten, dann die Formel: Mit 1000 Personen versteht jeder in der Klasse das Ergebnis – die Formel ist danach nur noch die Kurzschrift dafür.",
  "Die beiden Richtungen immer in Worten dazusagen: „positiv, wenn krank“ (Trefferquote) und „krank, wenn positiv“ (gesucht). Genau diese Verwechslung ist das Thema – im Vortrag darf sie dir nicht passieren.",
  "Aufs Handout gehören die Vierfeldertafel mit 1000 Personen, Baum und umgekehrter Baum, die Formel mit totaler Wahrscheinlichkeit im Nenner und eine Übungsaufgabe mit Lösung.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Was ist der Unterschied zwischen P(+ | K) und P(K | +)?",
    antwort: "P(+ | K) ist die Wahrscheinlichkeit für ein positives Ergebnis, wenn man krank ist – die Trefferquote des Tests. P(K | +) ist die Wahrscheinlichkeit, krank zu sein, wenn das Ergebnis positiv ist. Die erste beschreibt den Test, die zweite interessiert den Patienten. Der Satz von Bayes rechnet die eine in die andere um." },
  { stufe: "Basis", frage: "Was bedeuten Sensitivität und Spezifität?",
    antwort: "Die Sensitivität ist der Anteil der Kranken, die der Test als positiv erkennt: P(+ | K). Die Spezifität ist der Anteil der Gesunden, bei denen er richtig negativ anzeigt: P(− | K̄). Eins minus Spezifität ist die Quote der falschen Alarme unter den Gesunden." },
  { stufe: "Basis", frage: "Warum ist P(K | +) in deinem Beispiel nur etwa 27 %, obwohl der Test 90 % der Kranken erkennt?",
    antwort: "Weil es viel mehr Gesunde als Kranke gibt. Von 1000 Personen sind nur 20 krank, davon testen 18 positiv. Von den 980 Gesunden testen 5 % falsch positiv, das sind 49. Unter den 67 Positiven sind also nur 18 Kranke, und 18 / 67 ≈ 26,9 %." },
  { stufe: "Vertiefung", frage: "Wie leitest du den Satz von Bayes her?",
    antwort: "Die Schnittwahrscheinlichkeit lässt sich mit der Pfadregel auf zwei Arten schreiben: P(K ∩ +) = P(K) · P(+ | K) = P(+) · P(K | +). Nach P(K | +) aufgelöst ergibt das P(K | +) = P(K) · P(+ | K) / P(+). Das ist nur die Definition der bedingten Wahrscheinlichkeit, zweimal benutzt." },
  { stufe: "Vertiefung", frage: "Woher kommt der Nenner P(+)?",
    antwort: "Aus dem Satz von der totalen Wahrscheinlichkeit. Ein positives Ergebnis entsteht auf zwei disjunkten Wegen: krank und positiv oder gesund und positiv. Also P(+) = P(K) · P(+ | K) + P(K̄) · P(+ | K̄). Im Baum sind das die beiden Pfade, die bei „positiv“ enden, in der Tafel die Summe der Spalte „positiv“." },
  { stufe: "Vertiefung", frage: "Was ist der Basisratenfehler?",
    antwort: "Man schließt von der Trefferquote des Tests direkt auf die Wahrscheinlichkeit, krank zu sein, und übersieht, wie selten die Krankheit ist – die Basisrate P(K). Bei seltenen Merkmalen kommen die meisten positiven Ergebnisse aus der großen Gruppe der Gesunden, auch wenn der Test bei jedem Einzelnen selten irrt." },
  { stufe: "Vertiefung", frage: "Was ändert sich, wenn ein zweiter Test ebenfalls positiv ist?",
    antwort: "Das Ergebnis des ersten Tests wird zur neuen Ausgangswahrscheinlichkeit: Statt mit 2 % rechnet man mit 26,9 %. Mit denselben Testwerten ergibt das 86,9 %. Deshalb wird ein positiver Befund bei seltenen Krankheiten immer durch einen zweiten Test bestätigt." },
  { stufe: "Vertiefung", frage: "Wie hängen Vierfeldertafel, Baum und umgekehrter Baum zusammen?",
    antwort: "Alle drei enthalten dieselben vier Schnittwahrscheinlichkeiten. Der Baum beginnt mit krank oder gesund, die Tafel ordnet die vier Felder in Zeilen und Spalten, der umgekehrte Baum beginnt mit positiv oder negativ. Die Äste des umgekehrten Baums liest man in den Spalten der Tafel ab – genau das ist der Satz von Bayes." },
  { stufe: "Profi", frage: "Darf man beim zweiten Test einfach noch einmal dieselben Werte einsetzen?",
    antwort: "Nur wenn die beiden Ergebnisse bei gegebenem Zustand unabhängig sind. Wiederholt man denselben Test an derselben Probe, schlägt er bei einem Gesunden mit einer Besonderheit vielleicht wieder falsch an. Dann sind die Ergebnisse abhängig, und die 86,9 % sind zu optimistisch. Deshalb nimmt man zur Bestätigung meist ein anderes Testverfahren." },
  { stufe: "Profi", frage: "Wie sieht der Satz von Bayes in der Chancen-Form aus?",
    antwort: "Chance danach = Chance davor · Likelihood-Quotient. Die Chance ist q : (1 − q), der Likelihood-Quotient eines positiven Tests ist P(+ | K) / P(+ | K̄). Im Beispiel: Chance davor 2 : 98 = 1 : 49, Quotient 0,9 / 0,05 = 18, Chance danach 18 : 49, also 18 / 67 ≈ 26,9 %. Jeder weitere unabhängige positive Test multipliziert noch einmal mit 18: 324 : 49, also etwa 86,9 %." },
  { stufe: "Profi", frage: "Wo begegnet dir der Satz von Bayes außerhalb der Medizin?",
    antwort: "Beim Spamfilter (Wie wahrscheinlich ist eine Mail Spam, wenn ein bestimmtes Wort darin steht?), vor Gericht (der Trugschluss des Anklägers verwechselt P(Spur | unschuldig) mit P(unschuldig | Spur)), bei Rasterfahndung und Gesichtserkennung und überall im maschinellen Lernen." },
];
