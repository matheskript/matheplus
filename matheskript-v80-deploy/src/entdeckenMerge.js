/* ======================================================================
   entdeckenMerge.js – führt zwei Stände von „Mathe entdecken“ zusammen
   (reine Logik, kein React, kein Speicher, keine Imports).

   Wann nötig: Ein Schüler nutzt die App auf mehreren Geräten oder hat vor der Anmeldung
   schon gearbeitet. Beim Abgleich mit dem Konto darf nichts verloren gehen.

   Regeln (das Ergebnis hängt nicht von der Reihenfolge ab und ist idempotent):
   · Reflexionsantworten und Video-Markierungen: je Eintrag gewinnt der jüngere (zeit).
     So lässt sich eine Markierung auch bewusst zurücknehmen.
   · Potenzregel-Modul: erledigte Schritte je Phase = der größere Wert (Fortschritt geht nie verloren),
     „abgeschlossen“ = eines von beiden, aktuelle Phase vom jüngeren Stand.
   · zuletzt bearbeitet: der jüngere Eintrag.
   Bewusstes Zurücksetzen („Modul von vorn“) läuft nicht über das Zusammenführen,
   sondern über lernSync → ersetzen().
   ====================================================================== */

export const PHASEN = 7;

const istObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const zahl = (v) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
const ganz = (v, max) => Math.min(max, Math.max(0, Math.floor(Number(v) || 0)));

/* Bringt jeden Stand in dieselbe Form mit fester Schlüsselreihenfolge. */
export function normalisiere(d) {
  d = istObj(d) ? d : {};
  const reflexion = {};
  const rIn = istObj(d.reflexion) ? d.reflexion : {};
  for (const k of Object.keys(rIn).sort()) {
    const e = rIn[k];
    if (istObj(e)) reflexion[k] = { wahl: String(e.wahl || ""), text: String(e.text || ""), zeit: zahl(e.zeit) };
  }
  const video = {};
  const vIn = istObj(d.video) ? d.video : {};
  for (const k of Object.keys(vIn).sort()) {
    const v = vIn[k];
    if (v === true) video[k] = { an: true, zeit: 0 };
    else if (istObj(v)) video[k] = { an: !!v.an, zeit: zahl(v.zeit) };
  }
  const p = istObj(d.potenz) ? d.potenz : {};
  const stand = Array.from({ length: PHASEN }, (_, i) => ganz(Array.isArray(p.stand) ? p.stand[i] : 0, 99));
  const fertigListe = Array.isArray(p.phasenFertig) ? p.phasenFertig : [];
  const phasenFertig = [...new Set(fertigListe.map((x) => ganz(x, PHASEN - 1)))].sort((a, b) => a - b);
  const z = istObj(d.zuletzt) && d.zuletzt.id ? { id: String(d.zuletzt.id), label: String(d.zuletzt.label || ""), zeit: zahl(d.zuletzt.zeit) } : null;
  return {
    reflexion, video,
    potenz: { phase: ganz(p.phase, PHASEN - 1), stand, fertig: !!p.fertig, phasenFertig, zeit: zahl(p.zeit) },
    zuletzt: z,
    _zeit: zahl(d._zeit),
  };
}

const zeitVon = (x) => (x && typeof x.zeit === "number" ? x.zeit : 0);
/* Der jüngere Eintrag gewinnt; bei gleichem Stempel entscheidet der Inhalt – damit die Reihenfolge egal ist. */
const juengere = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  const za = zeitVon(a), zb = zeitVon(b);
  if (za !== zb) return za > zb ? a : b;
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
};

export function mergeEntdecken(lokal, remote) {
  const a = normalisiere(lokal), b = normalisiere(remote);
  const vereint = (x, y) => {
    const o = {};
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) o[k] = juengere(x[k], y[k]);
    return o;
  };
  const za = a.potenz.zeit, zb = b.potenz.zeit;
  return normalisiere({
    reflexion: vereint(a.reflexion, b.reflexion),
    video: vereint(a.video, b.video),
    potenz: {
      phase: za > zb ? a.potenz.phase : zb > za ? b.potenz.phase : Math.max(a.potenz.phase, b.potenz.phase),
      stand: a.potenz.stand.map((n, i) => Math.max(n, b.potenz.stand[i])),
      fertig: a.potenz.fertig || b.potenz.fertig,
      phasenFertig: [...a.potenz.phasenFertig, ...b.potenz.phasenFertig],
      zeit: Math.max(za, zb),
    },
    zuletzt: juengere(a.zuletzt, b.zuletzt),
    _zeit: Math.max(a._zeit, b._zeit),
  });
}
