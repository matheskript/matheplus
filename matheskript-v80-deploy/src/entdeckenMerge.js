/* ======================================================================
   entdeckenMerge.js – führt zwei Stände von „Mathe entdecken“ zusammen
   (reine Logik, kein React, kein Speicher, keine Imports).

   Wann nötig: Ein Schüler nutzt die App auf mehreren Geräten oder hat vor der Anmeldung
   schon gearbeitet. Beim Abgleich mit dem Konto darf nichts verloren gehen.

   Regeln (das Ergebnis hängt nicht von der Reihenfolge ab und ist idempotent):
   · Reflexionsantworten und Video-Markierungen: je Eintrag gewinnt der jüngere (zeit).
     So lässt sich eine Markierung auch bewusst zurücknehmen.
   · Potenzregel-Modul und Axiome-Modul: erledigte Schritte je Phase = der größere Wert (Fortschritt geht nie verloren),
     „abgeschlossen“ = eines von beiden, aktuelle Phase vom jüngeren Stand.
   · Weitere Module (`module`, z. B. Satz des Pythagoras): dieselben Regeln wie beim Potenzregel-Modul.
   · zuletzt bearbeitet: der jüngere Eintrag.
   Bewusstes Zurücksetzen („Modul von vorn“) läuft nicht über das Zusammenführen,
   sondern über lernSync → ersetzen().
   ====================================================================== */

export const PHASEN = 7;
/* Modul „Axiome“ (Lernangebot 1): Anzahl der Phasen */
export const AXIOM_PHASEN = 10;
/* Weitere Lernmodule (je ein Eintrag unter `module`): Kennung → Anzahl der Phasen.
   Das Potenzregel-Modul bleibt unter `potenz`, damit bestehende Konten unverändert weiterlaufen. */
export const MODULE = { pythagoras: 6 };

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
  const ax = istObj(d.axiome) ? d.axiome : {};
  const axStand = Array.from({ length: AXIOM_PHASEN }, (_, i) => ganz(Array.isArray(ax.stand) ? ax.stand[i] : 0, 99));
  const modIn = istObj(d.module) ? d.module : {};
  const mods = {};
  for (const id of Object.keys(MODULE)) {
    const n = MODULE[id], m = istObj(modIn[id]) ? modIn[id] : {};
    mods[id] = {
      phase: ganz(m.phase, n - 1),
      stand: Array.from({ length: n }, (_, i) => ganz(Array.isArray(m.stand) ? m.stand[i] : 0, 99)),
      fertig: !!m.fertig,
      zeit: zahl(m.zeit),
    };
  }
  const z = istObj(d.zuletzt) && d.zuletzt.id ? { id: String(d.zuletzt.id), label: String(d.zuletzt.label || ""), zeit: zahl(d.zuletzt.zeit) } : null;
  return {
    reflexion, video,
    potenz: { phase: ganz(p.phase, PHASEN - 1), stand, fertig: !!p.fertig, phasenFertig, zeit: zahl(p.zeit) },
    axiome: { phase: ganz(ax.phase, AXIOM_PHASEN - 1), stand: axStand, fertig: !!ax.fertig, zeit: zahl(ax.zeit) },
    module: mods,
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
  const xa = a.axiome.zeit, xb = b.axiome.zeit;
  const mods = {};
  for (const id of Object.keys(MODULE)) {
    const x = a.module[id], y = b.module[id];
    mods[id] = {
      phase: x.zeit > y.zeit ? x.phase : y.zeit > x.zeit ? y.phase : Math.max(x.phase, y.phase),
      stand: x.stand.map((n, i) => Math.max(n, y.stand[i])),
      fertig: x.fertig || y.fertig,
      zeit: Math.max(x.zeit, y.zeit),
    };
  }
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
    axiome: {
      phase: xa > xb ? a.axiome.phase : xb > xa ? b.axiome.phase : Math.max(a.axiome.phase, b.axiome.phase),
      stand: a.axiome.stand.map((n, i) => Math.max(n, b.axiome.stand[i])),
      fertig: a.axiome.fertig || b.axiome.fertig,
      zeit: Math.max(xa, xb),
    },
    module: mods,
    zuletzt: juengere(a.zuletzt, b.zuletzt),
    _zeit: Math.max(a._zeit, b._zeit),
  });
}
