/* ============================================================
   Fortschritt der vier Kurse für die Startseiten-Kacheln – liest nur den
   localStorage und reine Datendateien, lädt also keinen Kurs mit.
   Die Regeln „wann gilt ein Modul als geschafft“ stehen hier so, wie die
   Kursseiten sie anwenden (funcDiffKurs, funcVekKurs, funcGfsKurs,
   funcClaudeKurs). Ergebnis je Kurs: { fertig, gesamt, weiter } – weiter ist der
   fertige Satz für die Kachel („Nächstes Modul: Training I“).
   ============================================================ */
import { KURS_MODULE as DIFF } from "./diffKursDaten.js";
import { KURS_MODULE as VEK, TITEL_KURZ as VEK_KURZ, BUCH_BEREIT } from "./vekKursDaten.js";
import { KURS_MODULE as GEO, TITEL_KURZ as GEO_KURZ, BUCH_BEREIT as GEO_BEREIT } from "./geoKursDaten.js";
import { LEITFADEN } from "./gfsKurs.js";
import { unterstufeStand } from "./unterstufeDaten.js";

const lies = (schluessel) => { try { return JSON.parse(localStorage.getItem(schluessel) || "{}") || {}; } catch (e) { return {}; } };

/* Kurs Differentialrechnung (mm_diffkurs): gelesen + (ein Werkzeug benutzt, falls es welche gibt) */
export function diffStand() {
  const s = lies("mm_diffkurs");
  const gelesen = s.gelesen || {}, geuebt = s.geuebt || {};
  const ok = (m) => !!gelesen[m.id] && (m.werkzeuge.length === 0 || !!geuebt[m.id]);
  const fertig = DIFF.filter(ok).length;
  const weiter = DIFF.find((m) => !ok(m)) || DIFF[0];
  return { fertig, gesamt: DIFF.length, weiter: `Nächstes Modul: ${weiter.titel}` };
}

/* Kurs Vektoren, Geraden und Ebenen (mm_vekkurs): wie oben, ein Haken von Hand (haken) geht vor */
export function vekStand() {
  const s = lies("mm_vekkurs");
  const gelesen = s.gelesen || {}, geuebt = s.geuebt || {}, haken = s.haken || {};
  const auto = (m) => (BUCH_BEREIT ? !!gelesen[m.id] && (m.werkzeuge.length === 0 || !!geuebt[m.id]) : m.werkzeuge.length > 0 && !!geuebt[m.id]);
  const ok = (m) => (typeof haken[m.id] === "boolean" ? haken[m.id] : auto(m));
  const fertig = VEK.filter(ok).length;
  const weiter = VEK.find((m) => !ok(m)) || VEK[0];
  return { fertig, gesamt: VEK.length, weiter: `Nächstes Modul: ${VEK_KURZ[weiter.id] || weiter.titel}` };
}

/* Kurs Dreiecksgeometrie (mm_geokurs): dieselben Regeln wie Vektoren (funcGeoKurs.jsx) */
export function geoStand() {
  const s = lies("mm_geokurs");
  const gelesen = s.gelesen || {}, geuebt = s.geuebt || {}, haken = s.haken || {};
  const auto = (m) => (GEO_BEREIT ? !!gelesen[m.id] && (m.werkzeuge.length === 0 || !!geuebt[m.id]) : m.werkzeuge.length > 0 && !!geuebt[m.id]);
  const ok = (m) => (typeof haken[m.id] === "boolean" ? haken[m.id] : auto(m));
  const fertig = GEO.filter(ok).length;
  const weiter = GEO.find((m) => !ok(m)) || GEO[0];
  return { fertig, gesamt: GEO.length, weiter: `Nächstes Modul: ${GEO_KURZ[weiter.id] || weiter.titel}` };
}

/* Kurs GFS (mm_gfskurs): ein Schritt ist geschafft, wenn alle Haken seiner Checkliste sitzen */
export function gfsStand() {
  const s = lies("mm_gfskurs");
  const haken = s.haken || {};
  const ok = (schritt) => schritt.check.every((_, i) => haken[`${schritt.id}-${i}`]);
  const fertig = LEITFADEN.filter(ok).length;
  const weiter = LEITFADEN.find((x) => !ok(x)) || LEITFADEN[0];
  return { fertig, gesamt: LEITFADEN.length, weiter: `Nächster Schritt: ${weiter.titel}` };
}

/* Mathe mit KI lernen: die beiden Kurse (mm_claudekurs, mm_geminikurs) haben je zehn Lektionen */
export function kiStand() {
  const zaehle = (schluessel) => Object.values(lies(schluessel).fertig || {}).filter(Boolean).length;
  const claude = zaehle("mm_claudekurs"), gemini = zaehle("mm_geminikurs");
  const fertig = Math.max(claude, gemini);
  const welcher = claude >= gemini ? "Claude" : "Gemini";
  return { fertig, gesamt: 10, weiter: fertig > 0 && fertig < 10 ? `Weiter mit Lektion ${fertig + 1} (${welcher})` : "" };
}

/* Modul Unterstufe (mm_unterstufe): eine Lerneinheit ist geschafft, wenn alle drei „Ich kann …“-Haken sitzen (unterstufeDaten.js) */
export function unterStand() {
  const st = unterstufeStand(lies("mm_unterstufe"));
  return { fertig: st.fertig, gesamt: st.gesamt, jeKlasse: st.jeKlasse, weiter: st.weiter ? `Weiter mit: ${st.weiter.titel}` : "" };
}
