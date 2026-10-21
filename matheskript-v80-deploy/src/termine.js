/* Klausurtermine und Rückwärtsplan (aus func9.jsx ausgelagert, 21.10.2026) – reine Logik ohne Oberfläche,
   damit func6 (Wiederholungen heute) nicht die ganze func9 in den Startchunk zieht. */
import { KOMP, STUFE_INDEX, TAG_MS, TIEFE, aktiv, alleVoraussetzungen, hatEinheit, wochentagIdx } from "./base3.jsx";
import { MIN_WIEDERHOLEN, minutenFuer, tageBis, traegtSchon } from "./base4.jsx";
import { tagVon } from "./lernMelden.js";

/* ======================================================================
   KLAUSURVORBEREITUNG · TERMIN-STEUERUNG
   Ein Termin mit Datum und Stationen. Die App rechnet rückwärts: erst die
   Lücken darunter, dann die Stationen der Arbeit, dann Wiederholungen,
   zwei bis drei Tage vorher die Probeklausur, am letzten Tag nur noch das,
   was dort danebenging. Der Plan wird bei jedem Öffnen aus dem aktuellen
   Lernstand neu berechnet — dadurch passt er sich täglich von selbst an.
   ====================================================================== */


export function aktiveTermine(L) {
  return (L.termine || []).filter((t) => tageBis(t.datum) >= 1).sort((a, b) => a.datum.localeCompare(b.datum));
}

/* Was muss bis zum Termin passieren? */

export function terminBedarf(L, t) {
  const ziel = t.stationen.filter(aktiv);
  const ordnung = (a, b) => STUFE_INDEX[KOMP[a].stufe] - STUFE_INDEX[KOMP[b].stufe] || (TIEFE[a] || 0) - (TIEFE[b] || 0);

  // Lücken darunter: alles, was schon als Lücke oder in Arbeit gilt, dazu direkte Voraussetzungen, über die nichts bekannt ist.
  const direkt = new Set(ziel.flatMap((id) => KOMP[id].voraus));
  const luecken = new Set();
  ziel.forEach((id) => alleVoraussetzungen(id).forEach((v) => {
    if (!aktiv(v) || ziel.includes(v)) return;
    const st = L.stand[v]?.status;
    if (st === "luecke" || st === "arbeit" || (!st && direkt.has(v))) luecken.add(v);
  }));

  const neu = ziel.filter((id) => L.stand[id]?.status !== "sicher");
  const kuerzlich = Date.now() - 2 * TAG_MS;
  const bruecken = [...new Set(ziel.flatMap((id) => (KOMP[id].rueck || []).map((r) => r.id)))]
    .filter((id) => aktiv(id) && !ziel.includes(id) && !luecken.has(id) && traegtSchon(L, id));
  const wdh = [...ziel.filter((id) => L.stand[id]?.status === "sicher"), ...bruecken]
    .filter((id) => hatEinheit(id) && !((L.stand[id]?.zuletzt || 0) > kuerzlich));

  return {
    ziel,
    posten: [
      ...[...luecken].sort(ordnung).map((id) => ({ id, art: "luecke", min: minutenFuer(id) })),
      ...neu.sort(ordnung).map((id) => ({ id, art: "neu", min: minutenFuer(id) })),
      ...wdh.map((id) => ({ id, art: "wiederholen", min: MIN_WIEDERHOLEN })),
    ],
  };
}

/* Verteilt den Bedarf auf die verfügbaren Tage bis zum Termin. */

export function terminPlan(L, t) {
  const rest = tageBis(t.datum);
  if (rest < 1) return { vorbei: true };
  const planTage = L.plan?.tage?.length ? L.plan.tage : [0, 1, 2, 3, 4, 5, 6];
  const minuten = L.plan?.minuten || 20;

  const tage = [];
  for (let off = 0; off < rest; off++) {
    const d = tagVon(off);
    if (planTage.includes(wochentagIdx(d)) || off === rest - 1) tage.push({ d, off, eintraege: [] });
  }

  const { ziel, posten } = terminBedarf(L, t);
  const probeFertig = !!t.probe?.am;
  const letzter = tage[tage.length - 1];
  const kandidaten = tage.filter((x) => x !== letzter);
  // Probeklausur zwei Tage vorher (bzw. am letzten Lerntag davor), der Stoff kommt vollständig davor.
  const probeTag = probeFertig ? null : kandidaten.filter((x) => x.off <= rest - 2).pop() || null;
  const probeMin = Math.min(45, Math.max(20, ziel.length * 6));

  const inhalt = tage.filter((x) => x !== letzter && x !== probeTag && (!probeTag || x.off < probeTag.off));
  if (!inhalt.length && !probeTag && tage.length === 1) inhalt.push(letzter);

  let i = 0, offen = posten[0]?.min || 0;
  inhalt.forEach((tag) => {
    let budget = minuten;
    while (i < posten.length && budget > 0) {
      const nimm = Math.min(budget, offen);
      tag.eintraege.push({ ...posten[i], min: nimm, teil: nimm < posten[i].min });
      budget -= nimm; offen -= nimm;
      if (offen <= 0) { i++; offen = posten[i]?.min || 0; }
    }
  });
  const nichtGeschafft = posten.slice(i).map((p, k) => (k === 0 ? { ...p, min: offen } : p));
  const fehlend = nichtGeschafft.reduce((s, p) => s + p.min, 0);

  if (probeTag) probeTag.eintraege.push({ art: "probe", min: probeMin });

  const probeFehler = probeFertig ? Object.entries(t.probe.erg || {}).filter(([, e]) => e.some((ok) => !ok)).map(([id]) => id) : [];
  if (letzter && (letzter !== inhalt[0] || !letzter.eintraege.length)) {
    const ids = probeFertig ? probeFehler : ziel;
    letzter.eintraege.push({ art: "nachbereiten", ids, min: Math.min(minuten, Math.max(10, ids.length * 5)), probeFertig });
  }

  const zusatz = inhalt.length ? Math.ceil(fehlend / inhalt.length / 5) * 5 : 0;
  return {
    rest, tage, ziel, minuten, planTage, probeTag, probeMin, fehlend, nichtGeschafft, inhaltTage: inhalt.length,
    empfohlen: Math.min(90, minuten + zusatz),
    sitzen: ziel.filter((id) => L.stand[id]?.status === "sicher").length,
    heute: tage.find((x) => x.off === 0) || null,
    naechster: tage.find((x) => x.off > 0) || null,
  };
}

/* Wiederholungen aus dem Klausurplan für heute — sie laufen über „Wiederholen“. */

export function terminWiederholungenHeute(L) {
  const t = aktiveTermine(L)[0];
  if (!t) return [];
  const p = terminPlan(L, t);
  if (!p.heute) return [];
  return p.heute.eintraege.filter((e) => e.art === "wiederholen").map((e) => ({ id: e.id, termin: t.id }));
}
