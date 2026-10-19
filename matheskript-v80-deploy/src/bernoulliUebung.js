/* ============================================================
   Übungsaufgaben für das Bernoulli-Werkzeug: Textaufgabe → Kette
   Der Schüler liest einen Aufgabentext und stellt n, p und das
   Ereignis im Werkzeug ein. Hier: Aufgaben erzeugen und prüfen.
   Reines JS, damit die Logik in Node testbar ist.
   ============================================================ */

/* Kontexte: Satz mit {n}, Trefferwahrscheinlichkeit, Name der Treffer */
export const KONTEXTE = [
  { satz: "Ein fairer Würfel wird {n}-mal geworfen.", p: 1 / 6, bruch: { z: 1, nn: 6 }, treffer: ["Sechs", "Sechsen"], dezimal: false },
  { satz: "Eine faire Münze wird {n}-mal geworfen.", p: 1 / 2, bruch: { z: 1, nn: 2 }, treffer: ["Mal Kopf", "Mal Kopf"], dezimal: false },
  { satz: "Aus einem gut gemischten Skatblatt wird {n}-mal eine Karte gezogen und zurückgelegt.", p: 1 / 4, bruch: { z: 1, nn: 4 }, treffer: ["Herz-Karte", "Herz-Karten"], dezimal: false },
  { satz: "Ein Glücksrad mit drei gleich großen Feldern (eines davon rot) wird {n}-mal gedreht.", p: 1 / 3, bruch: { z: 1, nn: 3 }, treffer: ["roten Sektor", "rote Sektoren"], dezimal: false },
  { satz: "Bei einem Multiple-Choice-Test mit {n} Fragen hat jede Frage vier Antworten, genau eine ist richtig. Jemand rät bei jeder Frage.", p: 1 / 4, bruch: { z: 1, nn: 4 }, treffer: ["richtige Antwort", "richtige Antworten"], dezimal: false },
  { satz: "Erfahrungsgemäß sind 5 % der Bauteile einer Maschine defekt. Aus der Produktion werden {n} Bauteile zufällig entnommen.", p: 0.05, bruch: null, treffer: ["defektes Bauteil", "defekte Bauteile"], dezimal: true },
  { satz: "Ein Basketballspieler trifft beim Freiwurf mit der Wahrscheinlichkeit 0,8. Er wirft {n}-mal.", p: 0.8, bruch: null, treffer: ["Treffer", "Treffer"], dezimal: true },
  { satz: "Samen einer Sorte keimen mit der Wahrscheinlichkeit 90 %. Es werden {n} Samen gesät.", p: 0.9, bruch: null, treffer: ["keimender Samen", "keimende Samen"], dezimal: true },
  { satz: "In einer Stadt fahren 30 % der Pendler mit dem Rad. {n} Pendler werden zufällig befragt.", p: 0.3, bruch: null, treffer: ["Radfahrer", "Radfahrer"], dezimal: true },
  { satz: "Ein Medikament wirkt bei 70 % der Patienten. Es wird {n} Patienten gegeben.", p: 0.7, bruch: null, treffer: ["Patient, bei dem es wirkt", "Patienten, bei denen es wirkt"], dezimal: true },
  { satz: "Beim Qualitätstest besteht jedes Gerät unabhängig mit der Wahrscheinlichkeit 0,95. {n} Geräte werden geprüft.", p: 0.95, bruch: null, treffer: ["bestandenes Gerät", "bestandene Geräte"], dezimal: true },
  { satz: "Ein Spielautomat gewinnt bei jedem Spiel mit der Wahrscheinlichkeit 0,2. Jemand spielt {n}-mal.", p: 0.2, bruch: null, treffer: ["Gewinn", "Gewinne"], dezimal: true },
];

const N_WERTE = [5, 6, 8, 10, 12, 15, 20, 25, 30, 50];

/* Ereignisarten: Wortlaut und das Ereignis als Intervall [von; bis] in Treffern */
export const ARTEN = [
  { id: "genau", wort: (k) => `genau ${k}`, menge: (k, n) => [k, k] },
  { id: "hoechstens", wort: (k) => `höchstens ${k}`, menge: (k, n) => [0, k] },
  { id: "mindestens", wort: (k) => `mindestens ${k}`, menge: (k, n) => [k, n] },
  { id: "mehr", wort: (k) => `mehr als ${k}`, menge: (k, n) => [k + 1, n] },
  { id: "weniger", wort: (k) => `weniger als ${k}`, menge: (k, n) => [0, k - 1] },
  { id: "keine", wort: () => "keine", menge: () => [0, 0] },
  { id: "mindestensEine", wort: () => "mindestens eine", menge: (k, n) => [1, n] },
  { id: "zwischen", wort: (k, a) => `zwischen ${a} und ${k} (jeweils einschließlich)`, menge: (k, n, a) => [a, k] },
  { id: "mindestensHoechstens", wort: (k, a) => `mindestens ${a}, aber höchstens ${k}`, menge: (k, n, a) => [a, k] },
];

const zz = (a, b, zufall) => a + Math.floor(zufall() * (b - a + 1));
const wahl = (liste, zufall) => liste[Math.floor(zufall() * liste.length)];

/* Ereignis als Schreibweise mit X */
export function ereignisTex([von, bis], n) {
  if (von === bis) return `X = ${von}`;
  if (von <= 0 && bis >= n) return "0 ≤ X ≤ " + n;
  if (von <= 0) return `X ≤ ${bis}`;
  if (bis >= n) return `X ≥ ${von}`;
  return `${von} ≤ X ≤ ${bis}`;
}

/* Eine Aufgabe erzeugen. zufall: Funktion wie Math.random (für Tests austauschbar) */
export function neueAufgabe(zufall = Math.random, vermeide = null) {
  for (let versuch = 0; versuch < 50; versuch++) {
    const kontext = wahl(KONTEXTE, zufall);
    const n = wahl(N_WERTE, zufall);
    const art = wahl(ARTEN, zufall);
    const mu = n * kontext.p;
    // k in der Nähe des Erwartungswerts, aber sinnvoll im Inneren
    let k = Math.max(1, Math.min(n - 1, Math.round(mu + (zufall() - 0.5) * Math.max(2, Math.sqrt(n * kontext.p * (1 - kontext.p)) * 2))));
    let a = null;
    if (art.id === "zwischen" || art.id === "mindestensHoechstens") {
      a = Math.max(0, k - zz(1, Math.max(1, Math.min(4, k)), zufall));
      if (a === k) a = Math.max(0, k - 1);
      k = Math.min(n, Math.max(k, a + 1));
    }
    if (art.id === "weniger" && k < 1) k = 1;
    const menge = art.menge(k, n, a);
    if (menge[0] > menge[1] || menge[0] < 0 || menge[1] > n) continue;
    if (vermeide && vermeide.kontext === kontext.satz && vermeide.art === art.id) continue;
    const wort = art.wort(k, a);
    const trefferWort = kontext.treffer[art.id === "keine" ? 0 : (art.id === "mindestensEine" || (art.id === "genau" && k === 1) ? 0 : 1)];
    return {
      kontext: kontext.satz, art: art.id, n, p: kontext.p, bruch: kontext.bruch, k, a, menge,
      text: `${kontext.satz.replace("{n}", n)} Wie groß ist die Wahrscheinlichkeit für ${wort} ${trefferWort}?`,
      frage: `${wort} ${trefferWort}`,
      tex: ereignisTex(menge, n),
    };
  }
  return null;
}

/* Eingestellte Kette gegen die Aufgabe prüfen.
   eingestellt: { n, p, menge: [von, bis] } */
export function pruefen(aufgabe, eingestellt) {
  const fehler = [];
  if (eingestellt.n !== aufgabe.n) fehler.push({ typ: "n", text: `die Anzahl der Versuche – hier ${aufgabe.n}, nicht ${eingestellt.n}.` });
  if (Math.abs(eingestellt.p - aufgabe.p) > 1e-9) {
    fehler.push({ typ: "p", text: `die Trefferwahrscheinlichkeit eines einzelnen Versuchs – hier ${pAlsText(aufgabe.p, aufgabe.bruch)}.` });
  }
  const [v, b] = aufgabe.menge, [ev, eb] = eingestellt.menge;
  const n = aufgabe.n;
  if (eingestellt.n === aufgabe.n && (v !== ev || b !== eb)) {
    const grenzeDaneben = (v === ev && Math.abs(b - eb) === 1) || (b === eb && Math.abs(v - ev) === 1);
    const deins = ereignisTex([Math.max(0, ev), Math.min(n, eb)], n);
    if (grenzeDaneben) {
      fehler.push({ typ: "ereignisgrenze", text: `Die Grenze liegt um eins daneben: „${aufgabe.frage}“ bedeutet ${aufgabe.tex}, eingestellt ist ${deins}. Gehört die genannte Zahl selbst dazu?` });
    } else {
      fehler.push({ typ: "ereignis", text: `„${aufgabe.frage}“ bedeutet ${aufgabe.tex}, eingestellt ist ${deins}.` });
    }
  }
  return { richtig: fehler.length === 0, fehler };
}

export function pAlsText(p, bruch) {
  if (bruch) return `${bruch.z}/${bruch.nn}`;
  return String(Math.round(p * 100) / 100).replace(".", ",");
}
