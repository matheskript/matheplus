/* ======================================================================
   funcTagesplan.jsx – der eine Tagesplan in React: Lernstand lesen, Themen sicherstellen, Plan sichern, anreichern.
   Heute-Karte (Startseite) und Mein Mathe-Training rufen beide useTagesplan() auf – gleiche Daten, gleiche Einträge,
   gleicher Erledigt-Stand. Logik in tagesplan.js (rein), Speicher über meinTrainingSpeicher.js (lokal + Konto).
   ====================================================================== */
import { useEffect, useMemo, useRef, useState } from "react";
import { PROTOKOLL } from "./base2.jsx";
import { useLern } from "./func6.jsx";
import { kontoZustand } from "./konto.js";
import { klasseErmitteln } from "./hauptmenue.js";
import { klassenBoxen, stufeAusKlassenBox } from "./schulbuch.js";
import { mtAendern } from "./meinTrainingSpeicher.js";
import { normiere } from "./trainingDaten.js";
import { datumVon, normiereEbb } from "./ebbinghaus.js";
import { eintragErledigt, normiereMT } from "./meinTraining.js";
import { anreichern, kopfText, planFehlt, planSichern, startVon } from "./tagesplan.js";
import { uebenWunschSetzen } from "./uebenWunsch.js";
import { FEHLER_ZIEL_SPEICHER, FUNKTIONEN_SPEICHER } from "./heuteFokus.js";

const lies = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const liesText = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
export const themaAusStufe = (stufe) => (stufe === "unter" ? "zahlen" : stufe === "mittel" ? "gleichungen" : "analysis");

/* Profil für die Vorschlags-Themen: Klasse (Konto > Quickfinder), Bereich (Onboarding, solange er zur Stufe passt) */
export function profilLesen() {
  const k = klasseErmitteln((kontoZustand() || {}).profil, lies("matheplus-quickfinder"));
  if (!k) return { schulart: null, klasse: null, thema: null };
  const box = klassenBoxen(k.schulart).find((b) => b.id === k.box) || null;
  const stufe = stufeAusKlassenBox(box);
  const o = lies("mm-onboarding-v1") || {};
  const oStufe = Number.isInteger(o.klasse) ? stufeAusKlassenBox({ klassen: [o.klasse] }) : null;
  return { schulart: k.schulart, klasse: k.box, thema: o.thema && oStufe === stufe ? o.thema : themaAusStufe(stufe) };
}

/* Der Plan von heute, angereichert; legt ihn bei Bedarf an (einmal pro Tag, danach nur Ergänzungen). */
export function useTagesplan({ profil = null, fremd = [] } = {}) {
  const L = useLern();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("matheplus:buchung", h);
    return () => window.removeEventListener("matheplus:buchung", h);
  }, []);
  const roh = L.training || null;
  const MT = useMemo(() => normiereMT(roh && roh.meinTraining), [roh && roh.meinTraining]);   // eslint-disable-line react-hooks/exhaustive-deps
  const E = useMemo(() => normiereEbb(roh && roh.ebbinghaus), [roh && roh.ebbinghaus]);         // eslint-disable-line react-hooks/exhaustive-deps
  const T = useMemo(() => normiere(roh), [roh]);
  const jetzt = Date.now();
  const heute = datumVon(jetzt);
  const p = profil || profilLesen();
  const fremdKey = fremd.map((f) => `${f.id}${f.erledigt ? "x" : ""}`).join(",");
  const fehlt = !!L.geladen && planFehlt(MT, { profil: p, jetzt, fremd });
  /* Schutz vor Schleifen: je Tag, Profil und Aufträgen höchstens drei Sicherungen */
  const zaehler = useRef({ key: "", n: 0 });
  useEffect(() => {
    if (!fehlt) return;
    const key = `${heute}|${p.schulart}|${p.klasse}|${p.thema}|${fremdKey}`;
    if (zaehler.current.key !== key) zaehler.current = { key, n: 0 };
    if (zaehler.current.n >= 3) return;
    zaehler.current.n += 1;
    mtAendern((M, X, Tr) => planSichern(M, X, Tr, { profil: p, jetzt: Date.now(), fremd }));
  }, [fehlt, heute, p.schulart, p.klasse, p.thema, fremdKey]);   // eslint-disable-line react-hooks/exhaustive-deps
  const kapitel = liesText(FUNKTIONEN_SPEICHER);
  const plan = useMemo(() => anreichern(MT, E, T, { protokoll: PROTOKOLL.slice(), jetzt, kapitel }), [MT, E, T, tick, PROTOKOLL.length, heute, kapitel]);   // eslint-disable-line react-hooks/exhaustive-deps
  return { ...plan, kopf: kopfText(plan.eintraege), geladen: !!L.geladen, MT, E, T, profil: p };
}

/* Eintrag starten: Fehlertyp/Lernweg-Kapitel merken, Werkzeug im passenden Aufgabentyp öffnen */
export function eintragStarten(e, gehe) {
  const s = startVon(e);
  if (!s) return;
  if (s.fehlertyp) { try { sessionStorage.setItem(FEHLER_ZIEL_SPEICHER, s.fehlertyp); } catch { /* egal */ } }
  if (s.kapitel) { try { localStorage.setItem(FUNKTIONEN_SPEICHER, s.kapitel); } catch { /* egal */ } }
  if (s.ziel) {
    if (s.art) uebenWunschSetzen(s.ziel.ansicht, { art: s.art });
    gehe(s.ziel);
  } else gehe({ ansicht: "meintraining" });
}

/* Haken setzen oder zurücknehmen (Blatt, Warm-up, Aufträge, Einträge ohne Werkzeug) */
export function eintragAbhaken(e, zurueck = false) {
  mtAendern((M) => eintragErledigt(M, e, { jetzt: Date.now(), zurueck }));
}
