/* ======================================================================
   externeMedien.js – Zwei-Klick-Lösung für eingebettete Videos (§ 25 TDDDG, Art. 6 Abs. 1 lit. a DSGVO).
   Ein Video eines Fremddienstes lädt erst, wenn der Nutzer es aktiv freigibt – einmalig oder dauerhaft
   für diesen Dienst auf diesem Gerät. Widerruf auf der Datenschutzseite („Deine Einstellungen“).
   ====================================================================== */

export const MEDIEN_SCHLUESSEL = "matheplus-externe-medien";

export const DIENSTE = {
  youtube: { name: "YouTube", firma: "Google Ireland Limited (Irland); Daten können in die USA gelangen", art: "Video" },
  bunny: { name: "Bunny Stream", firma: "BunnyWay d.o.o. (Slowenien, EU)", art: "Kursvideo" },
};

const RAM = {};
const hoerer = new Set();

export function medienLesen() {
  try { const v = window.localStorage.getItem(MEDIEN_SCHLUESSEL); if (v) return JSON.parse(v) || {}; } catch (e) { /* privat */ }
  return { ...RAM };
}

export function dienstErlaubt(dienst) {
  return !!medienLesen()[dienst];
}

export function dienstSetzen(dienst, an) {
  const neu = { ...medienLesen() };
  if (an) neu[dienst] = Date.now(); else delete neu[dienst];
  Object.keys(RAM).forEach((k) => delete RAM[k]); Object.assign(RAM, neu);
  try { window.localStorage.setItem(MEDIEN_SCHLUESSEL, JSON.stringify(neu)); } catch (e) { /* nur im Arbeitsspeicher */ }
  hoerer.forEach((h) => h());
}

export const medienAbonnieren = (fn) => { hoerer.add(fn); return () => hoerer.delete(fn); };
