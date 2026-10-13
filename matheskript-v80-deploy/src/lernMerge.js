/* ======================================================================
   lernMerge.js – führt zwei Lernstände zusammen (reine Logik, kein React, kein Speicher).

   Wann nötig: Ein Schüler nutzt die App auf mehreren Geräten (Handy, Laptop) oder hat vor der
   Anmeldung schon geübt. Beim Abgleich mit dem Konto darf nichts verloren gehen.

   Regeln (so, dass das Ergebnis nicht von der Reihenfolge abhängt):
   · Listen werden vereinigt (ohne Doppelte), nach Zeit sortiert.
   · Objekte mit Zeitstempel (zuletzt / last_reviewed_at): der jüngere Eintrag gewinnt als Ganzes.
   · Ebbinghaus-Skills: jüngster Stand + vereinigter Verlauf + frühestes „erstmals gelernt“.
   · Zähler (Zahlen) nehmen den größeren Wert, „seit“-Zeiten den früheren.
   · Alles andere: der Stand mit dem jüngeren Gesamtstempel (_zeit) gewinnt.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

const istObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const ms = (v) => (typeof v === "number" ? v : typeof v === "string" ? Date.parse(v) || 0 : 0);
const FRUEH = new Set(["seit", "first_learned_at", "erstellt"]);   // hier gilt der frühere Wert
const MAX_LISTE = 1000, MAX_HISTORIE = 60, MAX_QUELLEN = 30, MAX_TAGE = 60, MAX_ARBEITEN = 40;

/* Liste vereinigen: gleiche Einträge (gleiche id oder gleicher Inhalt) nur einmal, nach Zeit sortiert */
function vereinige(a, b, max = MAX_LISTE) {
  const schluessel = (x) => (istObj(x) && x.id !== undefined ? `id:${x.id}` : JSON.stringify(x));
  const gesehen = new Set();
  const aus = [];
  for (const x of [...a, ...b]) {
    const k = schluessel(x);
    if (gesehen.has(k)) continue;
    gesehen.add(k); aus.push(x);
  }
  if (aus.length && aus.every((x) => istObj(x) && typeof x.zeit === "number")) aus.sort((p, q) => p.zeit - q.zeit);
  return aus.slice(-max);
}

function mergeSkill(s1, s2) {
  const t1 = ms(s1.last_reviewed_at), t2 = ms(s2.last_reviewed_at);
  const basis = t2 > t1 ? s2 : s1;
  const f1 = s1.first_learned_at, f2 = s2.first_learned_at;
  const histKey = (h) => `${h.exercise_id || ""}|${h.at}`;
  const gesehen = new Set();
  const verlauf = [...(s1.review_history || []), ...(s2.review_history || [])].filter((h) => { const k = histKey(h); if (gesehen.has(k)) return false; gesehen.add(k); return true; })
    .sort((p, q) => ms(p.at) - ms(q.at)).slice(-MAX_HISTORIE);
  return {
    ...basis,
    first_learned_at: f1 && f2 ? (ms(f1) <= ms(f2) ? f1 : f2) : f1 || f2 || null,
    source_exercise_ids: [...new Set([...(s1.source_exercise_ids || []), ...(s2.source_exercise_ids || [])])].slice(-MAX_QUELLEN),
    review_history: verlauf,
  };
}

function mergeEbb(a, b, aNeuer) {
  const skills = {};
  for (const id of new Set([...Object.keys(a.skills || {}), ...Object.keys(b.skills || {})])) {
    const s1 = (a.skills || {})[id], s2 = (b.skills || {})[id];
    skills[id] = s1 && s2 ? mergeSkill(s1, s2) : s1 || s2;
  }
  const tage = {};
  for (const d of new Set([...Object.keys(a.tage || {}), ...Object.keys(b.tage || {})])) {
    const t1 = (a.tage || {})[d], t2 = (b.tage || {})[d];
    if (t1 && t2) {
      const gesehen = new Set();
      const items = [...(t1.items || []), ...(t2.items || [])].filter((i) => { const k = `${i.skill_id}|${i.art}`; if (gesehen.has(k)) return false; gesehen.add(k); return true; });
      tage[d] = { ...(ms(t1.erstellt) <= ms(t2.erstellt) ? t1 : t2), items };
    } else tage[d] = t1 || t2;
  }
  const datumsListe = Object.keys(tage).sort().slice(-MAX_TAGE);
  const tageGekappt = Object.fromEntries(datumsListe.map((d) => [d, tage[d]]));
  /* Klassenarbeiten: je id der jüngere Stand (Löschen ist eine Markierung und bleibt erhalten) */
  const arb = new Map();
  for (const x of [...(a.arbeiten || []), ...(b.arbeiten || [])]) {
    const alt = arb.get(x.id);
    if (!alt || ms(x.geaendert) >= ms(alt.geaendert)) arb.set(x.id, x);
  }
  const arbeiten = [...arb.values()].sort((p, q) => String(p.datum).localeCompare(String(q.datum)) || String(p.id).localeCompare(String(q.id))).slice(-MAX_ARBEITEN);
  return { ...(aNeuer ? b : a), ...(aNeuer ? a : b), version: 1, skills, tage: tageGekappt, arbeiten };
}

function besserBest(x, y) {
  const qx = x.gesamt ? x.richtig / x.gesamt : 0, qy = y.gesamt ? y.richtig / y.gesamt : 0;
  if (qx !== qy) return qx > qy ? x : y;
  if (typeof x.sek === "number" && typeof y.sek === "number" && x.sek !== y.sek) return x.sek < y.sek ? x : y;
  return typeof x.sek === "number" ? x : typeof y.sek === "number" ? y : (x.zeit || 0) >= (y.zeit || 0) ? x : y;
}

function wert(x, y, aNeuer, pfad) {
  if (x === undefined || x === null) return y === undefined ? x : y;
  if (y === undefined || y === null) return x;
  if (pfad.endsWith("training.ebbinghaus") && istObj(x) && istObj(y)) return mergeEbb(x, y, aNeuer);
  // Head & Numbers: Bestwert gehört als Ganzes zu einer Runde (nicht Felder mischen); die bessere Quote gewinnt, bei Gleichstand die kürzere Zeit
  if (/^training\.kopf\.best\.[^.]+$/.test(pfad) && istObj(x) && istObj(y)) return besserBest(x, y);
  if (Array.isArray(x) && Array.isArray(y)) return vereinige(x, y, pfad === "protokoll" ? 500 : MAX_LISTE);
  if (istObj(x) && istObj(y)) {
    if (typeof x.zuletzt === "number" && typeof y.zuletzt === "number" && x.zuletzt !== y.zuletzt) return x.zuletzt > y.zuletzt ? x : y;   // jüngerer Eintrag
    const aus = {};
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) aus[k] = wert(x[k], y[k], aNeuer, pfad ? `${pfad}.${k}` : k);
    return aus;
  }
  if (typeof x === "number" && typeof y === "number") {
    const k = pfad.split(".").pop();
    return FRUEH.has(k) ? (x && y ? Math.min(x, y) : x || y) : Math.max(x, y);
  }
  if (x === y) return x;
  if (typeof x === "string" && typeof y === "string" && FRUEH.has(pfad.split(".").pop())) return ms(x) <= ms(y) ? x : y;
  return aNeuer ? x : y;
}

/* a und b sind Lernstände in der gespeicherten Form (func6.jsx → lernSnapshot()). */
export function mergeLernstand(a, b) {
  if (!istObj(a)) return b;
  if (!istObj(b)) return a;
  const aNeuer = ms(a._zeit) >= ms(b._zeit);
  const r = wert(a, b, aNeuer, "");
  r._zeit = Math.max(ms(a._zeit), ms(b._zeit));
  return r;
}
