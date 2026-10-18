/* ======================================================================
   penpaperMerge.js – führt zwei Stände des Pen-&-Paper-Kurses zusammen
   (reine Logik, kein React, kein Speicher, keine Imports).

   Form eines Standes (normalisiere):
   {
     lektionen: { l0 … l8: { fertig, zeit } },          // Lektion abgehakt (jüngerer Eintrag gewinnt – auch ein Zurücknehmen)
     uebungen:  { <id>: { geloest, versuche, zeit } },   // Übung vollständig gelöst (einmal gelöst bleibt gelöst), Versuche = Maximum
     tage:      { t1 … t7: { an, zeit } },               // 7-Tage-Plan (jüngerer Eintrag gewinnt)
     zuletzt:   { id, zeit },                            // zuletzt geöffnete Lektion (jüngerer gewinnt)
     _zeit
   }
   Das Ergebnis hängt nicht von der Reihenfolge ab und ist idempotent.
   ====================================================================== */

export const LEKTIONEN_ANZAHL = 9;
export const TAGE_ANZAHL = 7;
export const LEKTION_IDS = Array.from({ length: LEKTIONEN_ANZAHL }, (_, i) => "l" + i);
export const TAG_IDS = Array.from({ length: TAGE_ANZAHL }, (_, i) => "t" + (i + 1));

const istObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const zahl = (v) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
const ganz = (v, max) => Math.min(max, Math.max(0, Math.floor(Number(v) || 0)));
const idOk = (k) => /^[a-z0-9-]{1,40}$/.test(k);

export function normalisiere(d) {
  d = istObj(d) ? d : {};
  const lektionen = {};
  const lIn = istObj(d.lektionen) ? d.lektionen : {};
  for (const id of LEKTION_IDS) {
    const e = lIn[id];
    if (istObj(e) && (e.fertig || zahl(e.zeit))) lektionen[id] = { fertig: !!e.fertig, zeit: zahl(e.zeit) };
  }
  const uebungen = {};
  const uIn = istObj(d.uebungen) ? d.uebungen : {};
  for (const k of Object.keys(uIn).sort()) {
    const u = uIn[k];
    if (istObj(u) && idOk(k)) uebungen[k] = { geloest: !!u.geloest, versuche: ganz(u.versuche, 9999), zeit: zahl(u.zeit) };
  }
  const tage = {};
  const tIn = istObj(d.tage) ? d.tage : {};
  for (const id of TAG_IDS) {
    const t = tIn[id];
    if (istObj(t) && (t.an || zahl(t.zeit))) tage[id] = { an: !!t.an, zeit: zahl(t.zeit) };
  }
  const z = istObj(d.zuletzt) && LEKTION_IDS.includes(d.zuletzt.id) ? { id: d.zuletzt.id, zeit: zahl(d.zuletzt.zeit) } : null;
  return { lektionen, uebungen, tage, zuletzt: z, _zeit: zahl(d._zeit) };
}

const juenger = (a, b) => (!a ? b : !b ? a : b.zeit > a.zeit ? b : a);

export function mergePenPaper(a, b) {
  a = normalisiere(a); b = normalisiere(b);
  const lektionen = {};
  for (const id of LEKTION_IDS) { const e = juenger(a.lektionen[id], b.lektionen[id]); if (e) lektionen[id] = { ...e }; }
  const uebungen = {};
  for (const k of [...new Set([...Object.keys(a.uebungen), ...Object.keys(b.uebungen)])].sort()) {
    const x = a.uebungen[k], y = b.uebungen[k];
    if (!x || !y) { uebungen[k] = { ...(x || y) }; continue; }
    uebungen[k] = { geloest: x.geloest || y.geloest, versuche: Math.max(x.versuche, y.versuche), zeit: Math.max(x.zeit, y.zeit) };
  }
  const tage = {};
  for (const id of TAG_IDS) { const e = juenger(a.tage[id], b.tage[id]); if (e) tage[id] = { ...e }; }
  const zuletzt = juenger(a.zuletzt, b.zuletzt);
  return normalisiere({ lektionen, uebungen, tage, zuletzt: zuletzt ? { ...zuletzt } : null, _zeit: Math.max(a._zeit, b._zeit) });
}
