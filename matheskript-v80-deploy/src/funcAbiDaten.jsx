/* Abi-Zentrum: Stand im Lernstand (training.abi) lesen und ändern – Konto-Abgleich über lernMerge („zuletzt“ gewinnt).
   Klein gehalten, damit Zentrum, Aufgaben-Training und Mia ihn teilen, ohne einander zu laden. */
import { useLern, lernAendern } from "./func6.jsx";
import { abiNormieren, profilNormieren, ergebnisEintragen, probeEintragen, datum } from "./abiZentrum.js";

export function useAbi() {
  const L = useLern();
  return abiNormieren(L.training && L.training.abi);
}

export function abiAendern(fn) {
  lernAendern((L) => {
    L.training = L.training || {};
    const neu = fn(abiNormieren(L.training.abi));
    L.training.abi = { ...neu, zuletzt: Date.now() };
  });
}

export const abiProfilSpeichern = (p) => abiAendern((a) => ({ ...a, profil: profilNormieren({ ...p, fertig: true }), beginn: a.beginn || datum(Date.now()) }));
export const abiErgebnisSpeichern = (e) => abiAendern((a) => ergebnisEintragen(a, e));
export const abiProbeSpeichern = (e) => abiAendern((a) => probeEintragen(a, e));

/* Übergaben zwischen den Abi-Seiten (nur für diesen Tab) */
export const UEBERGABE = { typ: "mm-abi-typ", mia: "mm-mia-aufgabe", miaModus: "mm-mia-modus", probeSeed: "mm-abi-probe-seed" };
export function uebergabeSetzen(schluessel, wert) { try { sessionStorage.setItem(schluessel, JSON.stringify(wert)); } catch (e) { /* privat */ } }
export function uebergabeHolen(schluessel) {
  try { const r = sessionStorage.getItem(schluessel); sessionStorage.removeItem(schluessel); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}
