/* ======================================================================
   TRAININGSPLAN – „Trainingsplan erstellen“ im Quickfinder (Startseite)

   Aus den angehakten Kapiteln und Unterthemen (auch mehrere Kapitel) entsteht ein Plan:
     1. Warm-up        – leichte Aufgaben aus dem Vorwissen, zum Reinkommen
     2. Basis-Check    – Grundlagen aus früheren Klassen (Vorwissen des Vorwissens)
     3. Zwischenschritte – direktes Vorwissen
     4. Kerntraining   – je Kapitel eine Einheit mit genau den angehakten Unterthemen
     5. Wiederholen    – nach Ebbinghaus: 1, 3, 7, 14 und 30 Tage nach dem letzten Kerntraining;
                         mit Klassenarbeits-Termin verdichtet, dazu eine Generalprobe am Vortag
   Warm-up, Basis-Check und Zwischenschritte schlägt der Plan selbst vor; jedes davon ist abwählbar (`ohne`).
   Das Vorwissen kommt aus kapitelFormeln.js (KAPITEL_FORMELN[..].vorwissen),
   die Aufgaben aus unterthemen.js → trainingDaten.js. Ergebnisse der Aufgaben
   laufen wie überall über ebbBuchen in den Ebbinghaus-Wiederholungsplan.

   Reine Logik, kein React, kein Speicher (Speicher: funcKapitelTraining.jsx).
   ====================================================================== */
import { KAPITEL_FORMELN, klasseVonKapitel } from "./kapitelFormeln.js";
import { PLAN, THEMEN, hilfenFuer } from "./schulbuch.js";
import { kapitelGeneratoren, unterthema, unterthemen } from "./unterthemen.js";
import { GENERATOREN } from "./trainingDaten.js";
import { WERKZEUGE } from "./werkzeuge.js";

export const WIEDERHOLEN_TAGE = [1, 3, 7, 14, 30];   // nach dem Kerntraining (Ebbinghaus, Standardplan)
export const WIEDERHOLEN_KOMPAKT = [1, 2, 4];         // wenig Zeit bis zur Arbeit
/* Grundlagen-Aufgaben fürs Warm-up, mit der Klasse, ab der sie passen */
const GRUND_GEN = [["bru-add", 6], ["gl-linear", 7], ["pro-wert", 7], ["ter-binom", 8], ["pot-gesetz", 9]];
export const PHASEN = {
  warmup: { name: "Warm-up", zeile: "Leicht reinkommen" },
  basis: { name: "Basis-Check", zeile: "Steht das Grundwissen?" },
  zwischen: { name: "Zwischenschritte", zeile: "Was du direkt dafür brauchst" },
  kern: { name: "Kerntraining", zeile: "Dein Thema" },
  wiederholen: { name: "Wiederholen", zeile: "Damit es bleibt" },
  generalprobe: { name: "Generalprobe", zeile: "Wie in der Arbeit" },
};
export const AUFGABEN_JE = { warmup: 5, basis: 3, zwischen: 3, kern: 5, wiederholen: 4, generalprobe: 6 };

/* ---------- Datum (Kalendertage, Ortszeit) ---------- */
const zwei = (n) => String(n).padStart(2, "0");
export const tagText = (d) => `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
export const tagAus = (s) => { const [j, m, t] = String(s).split("-").map(Number); return new Date(j, m - 1, t, 12); };
export const plusTage = (s, n) => { const d = tagAus(s); d.setDate(d.getDate() + n); return tagText(d); };
export const tageZwischen = (a, b) => Math.round((tagAus(b) - tagAus(a)) / 86400000);

/* ---------- Vorwissen ---------- */
const vorwissenVon = (k) => (KAPITEL_FORMELN[k] ? KAPITEL_FORMELN[k].vorwissen.map(([aus]) => aus).filter((a) => THEMEN[a]) : []);
const rangVon = (schulart, id) => (klasseVonKapitel(schulart, id) || { rang: 0 }).rang;
/* Kapitelnummer im Buch der Klasse (für Kapitel derselben Klasse) */
const nrVon = (schulart, id) => { const k = klasseVonKapitel(schulart, id); return k ? ((PLAN[schulart] || PLAN.g9)[k.box] || []).indexOf(id) : 99; };
const nachKlasse = (ids, schulart) => ids
  .map((id, i) => ({ id, i, r: rangVon(schulart, id), n: nrVon(schulart, id) }))
  .sort((a, b) => a.r - b.r || a.n - b.n || a.i - b.i).map((x) => x.id);
/* Die n nächstliegenden Kapitel (jüngste Klasse zuerst ausgewählt), danach wieder chronologisch */
const naechste = (ids, schulart, n) => nachKlasse(
  ids.map((id, i) => ({ id, i, r: rangVon(schulart, id) })).sort((a, b) => b.r - a.r || a.i - b.i).slice(0, n).map((x) => x.id), schulart);

/* direkt: Vorwissen des Kapitels; tiefer: Vorwissen davon (höchstens vier, ohne Doppelte) */
export function vorwissenStufen(kapitelId, schulart = "g9") {
  const direkt = nachKlasse([...new Set(vorwissenVon(kapitelId))], schulart);
  const tiefer = naechste([...new Set(direkt.flatMap(vorwissenVon))].filter((k) => k !== kapitelId && !direkt.includes(k)), schulart, 4);
  return { direkt, tiefer };
}

const afb = (id) => (GENERATOREN.find((g) => g.id === id) || { afb: 2 }).afb;
const ziel = (h) => ({ name: h.name, zeile: h.zeile || "", ziel: h.ziel });
const kapitelHilfen = (k, n = 2) => hilfenFuer(k).slice(0, n).map(ziel);
/* Werkzeug eines Unterthemas zuerst, danach die Hilfen des Kapitels (ohne Doppelte) */
const wzZiel = (wz) => (wz && WERKZEUGE[wz] ? { name: WERKZEUGE[wz].name, zeile: WERKZEUGE[wz].zeile || "", ziel: WERKZEUGE[wz].ziel } : null);
const mitWz = (wz, liste) => { const w = wzZiel(wz); return w ? [w, ...liste.filter((h) => h.name !== w.name)] : liste; };
const formelZiel = (k, schulart) => ({ name: "Formeln zum Kapitel", zeile: "Vorwissen und Kernformeln", ziel: { ansicht: "kapitelformeln", kapitel: k, schulart } });

function einheitAusKapitel(phase, k, schulart) {
  const gen = kapitelGeneratoren(k).sort((a, b) => afb(a) - afb(b)).slice(0, 3);
  return { phase, kapitel: k, titel: THEMEN[k].titel, zeile: THEMEN[k].zeile, gen, ziele: [...kapitelHilfen(k), formelZiel(k, schulart)] };
}

/* ---------- Auswahl ---------- */
/* Gewählte Unterthemen nach Kapiteln gruppiert, in Buchreihenfolge (Klasse, dann Kapitelnummer im Plan der Schulart) */
export function auswahlNachKapitel(teile, schulart = "g9") {
  const ids = [...new Set((teile || []).filter((id) => unterthema(id)))];
  const kap = nachKlasse([...new Set(ids.map((id) => unterthema(id).kapitel))], schulart);
  return kap.map((k) => {
    const alle = unterthemen(k);
    const gew = alle.filter((u) => ids.includes(u.id));
    return { kapitel: k, teile: gew, ganz: gew.length === alle.length };
  });
}

/* Vorbereitung, die der Plan von sich aus vorschlägt (abwählbar über `ohne`):
   warmup, Basis-Check-Kapitel (Vorwissen früherer Klassen) und Zwischenschritt-Kapitel (direktes Vorwissen) */
export function vorbereitungFuer(teile, schulart = "g9") {
  const gruppen = auswahlNachKapitel(teile, schulart);
  const eigene = gruppen.map((g) => g.kapitel);
  const direkt = naechste([...new Set(gruppen.flatMap((g) => vorwissenStufen(g.kapitel, schulart).direkt))].filter((k) => !eigene.includes(k)), schulart, 5);
  // Grundlagen höchstens drei Klassen unter dem jüngsten gewählten Kapitel (sofern es solche gibt) – kein Klasse-5-Stoff im Abi-Plan
  const minRang = Math.min(...eigene.map((k) => rangVon(schulart, k)));
  const kandidaten = [...new Set(gruppen.flatMap((g) => vorwissenStufen(g.kapitel, schulart).tiefer))].filter((k) => !eigene.includes(k) && !direkt.includes(k));
  const nah = kandidaten.filter((k) => rangVon(schulart, k) >= minRang - 3);
  const tiefer = naechste(nah.length ? nah : kandidaten, schulart, 4);
  // Gibt es keine Grundlagen aus früheren Klassen, rückt das direkte Vorwissen in den Basis-Check
  return tiefer.length ? { basis: tiefer, zwischen: direkt } : { basis: direkt, zwischen: [] };
}

/* ---------- Plan bauen ---------- */
/* eingabe: { teile: [Unterthema-Ids], ohne: ["warmup" | Kapitel-Id, …], schulart, klasse, heute "JJJJ-MM-TT", termin "JJJJ-MM-TT" | null }
   Kurzform wie früher: { kapitel, teil } = ein Kapitel ganz bzw. ein Unterthema. */
export function planErstellen({ teile = null, ohne = [], kapitel = null, teil = null, schulart = "g9", klasse = null, heute, termin = null }) {
  if (!teile) teile = teil ? [teil] : kapitel && THEMEN[kapitel] ? unterthemen(kapitel).map((u) => u.id) : [];
  const gruppen = auswahlNachKapitel(teile, schulart);
  if (!gruppen.length) return null;
  const weg = new Set(ohne || []);
  const vb = vorbereitungFuer(teile, schulart);
  const basis = vb.basis.filter((k) => !weg.has(k)).map((k) => einheitAusKapitel("basis", k, schulart));
  const zwischen = vb.zwischen.filter((k) => !weg.has(k)).map((k) => einheitAusKapitel("zwischen", k, schulart));

  // Warm-up: leichte Aufgaben aus der Vorbereitung, sonst Grundlagen passend zur Klasse
  const vorGen = [...new Set([...basis, ...zwischen].flatMap((e) => e.gen))];
  const rang = Math.min(...gruppen.map((g) => (klasseVonKapitel(schulart, g.kapitel) || { rang: 13 }).rang));
  const grund = GRUND_GEN.filter(([, ab]) => ab <= rang).map(([g]) => g);
  let warmGen = vorGen.filter((g) => afb(g) === 1);
  if (warmGen.length < 3) warmGen = [...new Set([...warmGen, ...vorGen, ...grund])].filter((g) => afb(g) <= 2);
  const warmup = weg.has("warmup") ? null : { phase: "warmup", titel: "Warm-up", zeile: warmGen.length ? "Leichte Aufgaben aus dem Vorwissen" : "Kopfrechnen zum Reinkommen", gen: warmGen.slice(0, 5),
    ziele: rang <= 6 ? [{ name: "Head & Numbers", zeile: "Einmaleins, Quadratzahlen, Brüche", ziel: { ansicht: "headnumbers" } }] : [{ name: "5 Minuten Mathe", zeile: "Gemischtes Aufwärmen", ziel: { ansicht: "warmup" } }] };

  // Kerntraining: eine Einheit je gewähltem Kapitel, mit genau den angehakten Unterthemen
  const kerne = gruppen.map((g) => {
    const t = THEMEN[g.kapitel], einzel = g.teile.length === 1 ? g.teile[0] : null;
    const gen = [...new Set(g.teile.flatMap((x) => x.gen))].sort((a, b) => afb(a) - afb(b));
    const wz = (g.teile.find((x) => x.wz) || {}).wz;
    return { phase: "kern", kapitel: g.kapitel, teile: g.teile.map((x) => x.id), teil: einzel ? einzel.id : null,
      titel: einzel ? einzel.titel : t.titel,
      zeile: einzel ? t.titel : g.ganz ? t.zeile : g.teile.map((x) => x.titel).join(" · "),
      gen, ziele: [...mitWz(wz, kapitelHilfen(g.kapitel, 3)).slice(0, 3), formelZiel(g.kapitel, schulart)] };
  });
  const kernGen = [...new Set(kerne.flatMap((e) => e.gen))];
  const wiederholGen = [...new Set([...kernGen, ...basis.flatMap((e) => e.gen).slice(0, 1)])];

  /* ---------- Tage verteilen ---------- */
  let D = termin ? tageZwischen(heute, termin) : null;
  if (D !== null && D < 1) D = null;   // Termin heute oder vorbei: ohne Termin planen
  const eng = D !== null && D < 6 + Math.max(0, kerne.length - 1);
  const tagZw = zwischen.length && !eng ? 1 : 0;
  let start = (basis.length || warmup || zwischen.length) ? tagZw + 1 : 0;
  if (eng) start = D >= 3 ? 1 : 0;
  // Kerntage: einer je Kapitel; mit Termin höchstens bis zwei Tage vor der Arbeit (Vortag = Generalprobe)
  const ende = D === null ? start + kerne.length - 1 : Math.max(start, Math.min(start + kerne.length - 1, D - 2));
  const kernTag = kerne.map((_, i) => start + Math.floor((i * (ende - start + 1)) / kerne.length));
  const letzter = kernTag[kernTag.length - 1];
  const wdh = eng ? WIEDERHOLEN_KOMPAKT : WIEDERHOLEN_TAGE;

  const einheiten = [];
  const plus = (e, n) => einheiten.push({ ...e, datum: plusTage(heute, n) });
  if (warmup) plus(warmup, 0);
  basis.forEach((e) => plus(e, 0));
  zwischen.forEach((e) => plus(e, tagZw));
  kerne.forEach((e, i) => plus(e, kernTag[i]));
  const themaText = kerne.length === 1 ? kerne[0].titel : `${kerne.length} Themen`;
  wdh.map((n) => letzter + n).filter((n) => D === null || n < D - 1).forEach((n, i) => plus({ phase: "wiederholen", kapitel: kerne[0].kapitel, teil: null,
    titel: `${i + 1}. Wiederholung`, zeile: `${themaText} · nach ${n - letzter} ${n - letzter === 1 ? "Tag" : "Tagen"}`, gen: wiederholGen,
    ziele: [{ name: "Ebbinghaus", zeile: "Alle fälligen Wiederholungen", ziel: { ansicht: "ebbinghaus" } }] }, n));
  if (D !== null && D - 1 > letzter) plus({ phase: "generalprobe", kapitel: kerne[0].kapitel, teil: null, titel: "Generalprobe", zeile: "Gemischt, ohne Hilfen – am Tag vor der Arbeit",
    gen: [...new Set([...kernGen, ...vorGen])], ziele: [{ name: "Prüfungsmodus", zeile: "Ohne Hilfen, mit Punkten", ziel: { ansicht: "pruefung" } }] }, D - 1);

  einheiten.forEach((e, i) => { e.id = `e${i + 1}`; e.anzahl = e.gen.length ? AUFGABEN_JE[e.phase] : 0; });
  const titel = kerne.length === 1 ? kerne[0].titel : kerne.map((e) => e.titel).join(" · ");
  return {
    id: `p${Date.now().toString(36)}`, version: 2, teile: gruppen.flatMap((g) => g.teile.map((x) => x.id)), ohne: [...weg],
    kapitel: gruppen[0].kapitel, teil: kerne.length === 1 ? kerne[0].teil : null, schulart, klasse, erstellt: heute, termin: D !== null ? termin : null,
    titel, kapitelTitel: gruppen.map((g) => THEMEN[g.kapitel].titel).join(" · "), einheiten,
  };
}

/* Aufgabenliste einer Einheit: Generatoren reihum, leichte zuerst */
export function einheitAufgabenIds(e) {
  if (!e || !e.gen.length) return [];
  const ids = [];
  for (let i = 0; i < e.anzahl; i++) ids.push(e.gen[i % e.gen.length]);
  return ids;
}

/* Tage des Plans mit ihren Einheiten (sortiert) */
export function planTage(plan) {
  const m = new Map();
  for (const e of plan.einheiten) { if (!m.has(e.datum)) m.set(e.datum, []); m.get(e.datum).push(e); }
  return [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([datum, einheiten]) => ({ datum, einheiten }));
}

/* Stand: erledigt = { einheitId: { zeit, richtig, n } } */
export function planStand(plan, erledigt = {}, heute) {
  const offen = plan.einheiten.filter((e) => !erledigt[e.id]);
  const faellig = offen.filter((e) => e.datum <= heute);
  const naechste = faellig[0] || offen[0] || null;
  return { gesamt: plan.einheiten.length, fertig: plan.einheiten.length - offen.length, faellig: faellig.length, naechste };
}

/* „heute“, „morgen“, „Mi 21.10.“ */
const WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function tagName(datum, heute, en = false) {
  const n = tageZwischen(heute, datum);
  if (n === 0) return en ? "today" : "heute";
  if (n === 1) return en ? "tomorrow" : "morgen";
  if (n === -1) return en ? "yesterday" : "gestern";
  const d = tagAus(datum);
  return en ? `${WT_EN[d.getDay()]} ${zwei(d.getMonth() + 1)}/${zwei(d.getDate())}` : `${WT[d.getDay()]} ${zwei(d.getDate())}.${zwei(d.getMonth() + 1)}.`;
}
