/* ======================================================================
   QUICKFINDER – Kachel „Dein Training startet hier.“ auf der Startseite
   Schulsystem (blauer Balken G8 · G9 · GS9) → Klasse (2 × 4 Boxen, die beiden
   Abi-Jahrgänge gold). Sind beide gewählt, schrumpft die Auswahl auf einen
   kleinen Chip „Kl. 13 (GS9)“ ganz vorn; daneben das Menü Thema · Plan ·
   Tools · Videos, das den Inhalt darunter umschaltet:
     Thema   Hauptthema bzw. Kapitel des Buchs (jedes klappt auf) + passende Kurse
     Plan    Heute dran / Als Nächstes, aktiver Plan, am Desktop Themen zum Anhaken
     Tools   alle Trainings-Werkzeuge, nach Kapitel
     Videos  Videokurse, deren Klassenbereich zur Klasse passt
   Daten: schulbuch.js. Auswahl bleibt im Browser (matheplus-quickfinder),
   der gewählte Bereich in der Sitzung (matheplus-training-tab).
   ====================================================================== */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { C, KURSE } from "./base1.jsx";
import { VIDEOKURSE } from "./base5.jsx";
import { SCHULARTEN, SCHULART_STANDARD, THEMEN, hilfenFuer, kapitelFuer, klasseImBereich, klassenBoxen, kurseFuer, roemisch, schulart as schulartVon, stufeAusKlassenBox } from "./schulbuch.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { kapitelAuswahl } from "./kapitelFormeln.js";
import { englisch } from "./i18n.js";
import { unterthema, unterthemen } from "./unterthemen.js";
import { PHASEN, auswahlNachKapitel, planErstellen, planStand, planTage, tagName, vorbereitungFuer } from "./trainingsplan.js";
import { PhasenPille, einheitVormerken, heuteText, planErsetzen, planSpeichern, sacheGeneratoren, useAktiverPlan } from "./funcKapitelTraining.jsx";
import { erledigtUebertragen, hauptthemaPruefen } from "./hauptthema.js";
import { Abschnitt, HauptthemaAnsicht, HauptthemaLeiste, HauptthemaWahl } from "./funcHauptthema.jsx";

import { springe } from "./sprung.js";
const SCHLUESSEL = "matheplus-quickfinder";
function lesen() {
  try {
    const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
    if (!v || typeof v !== "object") return null;
    if (!schulartVon(v.schulart)) return null;
    const box = klassenBoxen(v.schulart).find((b) => b.id === v.klasse) ? v.klasse : null;
    const kapitel = box && kapitelFuer(v.schulart, box).some((k) => k.id === v.kapitel) ? v.kapitel : null;
    const teil = kapitel && v.teil && unterthema(v.teil) && unterthema(v.teil).kapitel === kapitel ? v.teil : null;
    return { schulart: v.schulart, klasse: box, kapitel, teil, modus: v.modus === "plan" ? "plan" : "sache", auswahl: auswahlLesen(v), haupt: hauptthemaPruefen(v.haupt) };
  } catch { return null; }
}
/* Angehakte Unterthemen für den Trainingsplan (nur gültige Ids, ohne Doppelte) */
function auswahlLesen(v) { return Array.isArray(v && v.auswahl) ? [...new Set(v.auswahl.filter((id) => typeof id === "string" && unterthema(id)))] : []; }
function schreiben(v) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(v)); } catch { /* privat */ } }
export function quickfinderLesen() { return lesen(); }
/* Modus vom Rücksprung (funcKapitelTraining: modusVormerken) – liegt ggf. ohne Schulart im Speicher */
function modusLesen() { try { const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null"); return v && v.modus === "plan" ? "plan" : "sache"; } catch { return "sache"; } }
function auswahlOhneSchulart() { try { return auswahlLesen(JSON.parse(localStorage.getItem(SCHLUESSEL) || "null")); } catch { return []; } }

const KICKER = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: 0 };
const knopfBasis = { fontFamily: "inherit", cursor: "pointer", borderRadius: 12, fontWeight: 700, lineHeight: 1.15, transition: "background .12s ease, color .12s ease, box-shadow .12s ease" };

/* Rechte Spalte: oben der blaue Balken fürs Schulsystem (auf Höhe der Überschrift), darunter die Klassen.
   Auswahl wird nie als ganze Fläche eingefärbt, sondern durch ein kleineres Rechteck mit runden Ecken
   um das Gewählte: im Balken weiß, bei den Klassen blau. Keine Trennlinien. */
const HOEHE = 40;
const TASTE = { ...knopfBasis, height: HOEHE, padding: "0 2px", fontSize: 14.5, fontWeight: 800, borderRadius: 8, letterSpacing: "0.02em",
  display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 };

function SchulartWahl({ wert, setze }) {
  return (
    <div role="group" aria-label="Schulsystem wählen"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 4, padding: 4, borderRadius: 12, background: C.see,
        boxShadow: "0 4px 12px rgba(0,77,152,0.22)" }}>
      {SCHULARTEN.map((s) => {
        const an = s.id === wert;
        return (
          <button key={s.id} type="button" aria-pressed={an} onClick={() => setze(s.id)} title={s.zeile} data-kein-i18n className="qf-sa"
            style={{ ...TASTE, height: HOEHE - 8, color: C.weiss, border: `2px solid ${an ? C.weiss : "transparent"}`,
              background: an ? "rgba(255,255,255,0.14)" : "transparent" }}>
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

/* 2 Zeilen × 4 Spalten. G8: 5/6 … 12 und ein freies Feld; G9 und GS9: 5/6 … 13.
   Weißer Grund, die beiden Abi-Jahrgänge gold; gewählt = blauer Rahmen. Gedämpft, bis ein Schulsystem gewählt ist. */
function KlassenWahl({ schulart, wert, setze }) {
  const boxen = klassenBoxen(schulart || SCHULART_STANDARD);
  const aus = !schulart;
  const felder = [...boxen, ...Array(Math.max(0, 8 - boxen.length)).fill(null)];
  return (
    <div role="group" aria-label={aus ? "Klasse wählen – zuerst Schulsystem wählen" : "Klasse wählen"}
      style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4, padding: 4, borderRadius: 12, background: C.weiss,
        boxShadow: "0 3px 12px rgba(0,40,100,0.12)", opacity: aus ? 0.42 : 1, transition: "opacity .15s ease" }}>
      {felder.map((b, i) => {
        if (!b) return <span key={`leer${i}`} aria-hidden="true" />;
        const an = !aus && b.id === wert;
        return (
          <button key={b.id} type="button" aria-pressed={an} disabled={aus} onClick={() => setze(b.id)} data-kein-i18n className={aus ? undefined : "qf-kl"}
            aria-label={`Klasse ${b.label}`} title={aus ? "Zuerst G8, G9 oder GS9 wählen" : b.gold ? "Kursstufe – Abi-Jahrgang" : undefined}
            style={{ ...TASTE, cursor: aus ? "not-allowed" : "pointer", color: C.seeTief, border: `2px solid ${an ? C.see : "transparent"}`,
              background: b.gold ? "linear-gradient(180deg, #F5CB2E 0%, #EDBB00 100%)" : C.weiss,
              boxShadow: an ? "0 2px 8px rgba(0,77,152,0.25)" : "none" }}>
            {b.label}
          </button>
        );
      })}
    </div>
  );
}

/* Nach der Wahl von Schulsystem und Klasse schrumpft die Auswahl auf einen kleinen Chip ganz vorn in der Zeile:
   eine blaue Box, darin „Kl. 13“ in Gold (wie die goldene Klassenbox) und dahinter „(GS9)“ in Weiß (wie der
   Schulsystem-Balken). Antippen öffnet die Auswahl wieder. */
function AuswahlChip({ schulart, klasse, oeffnen }) {
  const s = schulartVon(schulart);
  const box = klassenBoxen(schulart).find((b) => b.id === klasse);
  const label = box ? box.label : "", name = s ? s.name : "";
  return (
    <button type="button" onClick={oeffnen} className="qf-chip" aria-label={`Klasse ${label} (${name}) – ändern`} title="Schulsystem oder Klasse ändern"
      style={{ ...knopfBasis, flexShrink: 0, height: 36, padding: "0 10px 0 11px", borderRadius: 10, border: "none", background: C.see,
        display: "inline-flex", alignItems: "baseline", gap: 4, whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(0,77,152,0.22)" }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: C.flaggold, letterSpacing: "0.01em" }}>Kl. <span data-kein-i18n>{label}</span></span>
      <span data-kein-i18n style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>({name})</span>
    </button>
  );
}

/* Das Menü neben dem Chip: vier Bereiche, bewusst kurz benannt, damit alles in eine Zeile passt (auch bei 360 px) */
const BEREICHE = [
  { id: "thema", name: "Thema" },
  { id: "plan", name: "Plan" },
  { id: "tools", name: "Tools" },
  { id: "videos", name: "Videos" },
];
const TAB_SCHLUESSEL = "matheplus-training-tab";
function tabLesen() { try { const t = sessionStorage.getItem(TAB_SCHLUESSEL); return BEREICHE.some((b) => b.id === t) ? t : null; } catch { return null; } }
function tabSchreiben(t) { try { sessionStorage.setItem(TAB_SCHLUESSEL, t); } catch { /* egal */ } }

function TrainingsMenue({ tab, setTab }) {
  return (
    <div role="tablist" aria-label="Bereich wählen"
      style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 3, padding: 3, borderRadius: 11, background: "#EEF2F8" }}>
      {BEREICHE.map((b) => {
        const an = b.id === tab;
        return (
          <button key={b.id} type="button" role="tab" aria-selected={an} onClick={() => setTab(b.id)} className="qf-tab" data-tab={b.id}
            style={{ ...knopfBasis, height: 30, padding: "0 4px", borderRadius: 8, border: "none", minWidth: 0, fontSize: 12.5, fontWeight: an ? 800 : 700,
              color: an ? C.see : C.grau, background: an ? C.weiss : "transparent", boxShadow: an ? "0 1px 4px rgba(15,26,51,0.14)" : "none", whiteSpace: "nowrap" }}>
            {b.name}
          </button>
        );
      })}
    </div>
  );
}

const Pfeil = ({ auf, farbe = C.see, gross = 18 }) => (
  <svg aria-hidden="true" width={gross} height={gross} viewBox="0 0 18 18" style={{ flexShrink: 0, transform: auf ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}>
    <path d="M4 7 L9 12 L14 7" fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Handy und Tablet (unter 840 px, wie die Startseite): hier gibt es keinen Trainingsplan zum Anhaken,
   sondern das einfache Menü – Kapitel aufklappen, Unterthema oder Werkzeug antippen, unten Kurs-Empfehlungen. */
const HANDY_MQ = "(max-width: 839.98px)";
const handyJetzt = () => { try { return window.matchMedia(HANDY_MQ).matches; } catch { return false; } };
function useHandy() {
  const [h, setH] = useState(handyJetzt);
  useEffect(() => {
    let mq; try { mq = window.matchMedia(HANDY_MQ); } catch { return undefined; }
    const f = () => setH(mq.matches);
    f();
    mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", f) : mq.removeListener(f));
  }, []);
  return h;
}

/* ---------- Trainingsplan: Themen zum Anhaken ----------
   Kapitel antippen klappt die Unterthemen auf; das Kästchen links hakt das ganze Kapitel an oder ab
   (halb gefüllt = nur einige Unterthemen). Gewählt werden Unterthemen-Ids, auch über mehrere Kapitel und Klassen. */
function Haekchen({ zustand, hell = false }) {
  // zustand: true | false | "mixed"
  const an = zustand === true, teil = zustand === "mixed";
  const rand = hell ? C.weiss : C.see;
  return (
    <span aria-hidden="true" style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 6, border: `2px solid ${rand}`, display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: an || teil ? (hell ? C.weiss : C.see) : "transparent", transition: "background .12s ease" }}>
      {an && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.2 6.3 L4.8 8.8 L9.8 3.4" fill="none" stroke={hell ? C.see : C.weiss} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {teil && <span style={{ width: 9, height: 2.4, borderRadius: 2, background: hell ? C.see : C.weiss }} />}
    </span>
  );
}
/* Ruhiger Bildschirm beim Auf- und Zuklappen der Kapitel („Dein Training startet hier.“):
   Die angetippte Kapitelzeile bleibt exakt an ihrer Stelle im Fenster, auch wenn darüber ein anderes Kapitel
   zuklappt. Die Seite scrollt nie von selbst zum Kapitel (die globale Regel aus aufklappen.jsx wird über
   data-kein-scroll an den Listen abgeschaltet). Vor dem Umschalten merke(id) aufrufen, refs an die Kapitelzeilen hängen. */
function useRuhigAufklappen(offen) {
  const refs = useRef({});
  const anker = useRef(null);
  const merke = (id) => {
    const el = refs.current[id];
    anker.current = el ? { id, top: el.getBoundingClientRect().top } : null;
  };
  useLayoutEffect(() => {
    const a = anker.current;
    anker.current = null;
    if (!a) return;
    const el = refs.current[a.id];
    if (!el) return;
    const diff = el.getBoundingClientRect().top - a.top;
    if (Math.abs(diff) > 0.5) window.scrollTo({ top: window.scrollY + diff, behavior: "instant" });   // sprung-frei: hält die Position fest
  }, [offen]);
  return { refs, merke };
}

function PlanAuswahl({ schulart, klasse, auswahl, setzeAuswahl }) {
  const [auf, setAuf] = useState(true);
  const kapitel = kapitelFuer(schulart, klasse);
  const [offen, setOffen] = useState(() => { const k = kapitel.find((x) => unterthemen(x.id).some((u) => auswahl.includes(u.id))); return k ? k.id : null; });
  const { refs, merke } = useRuhigAufklappen(offen);
  const s = schulartVon(schulart);
  const zustand = (kId) => { const alle = unterthemen(kId), n = alle.filter((u) => auswahl.includes(u.id)).length; return n === 0 ? false : n === alle.length ? true : "mixed"; };
  const kapitelUmschalten = (kId) => {
    const ids = unterthemen(kId).map((u) => u.id);
    setzeAuswahl(zustand(kId) === true ? auswahl.filter((id) => !ids.includes(id)) : [...auswahl, ...ids.filter((id) => !auswahl.includes(id))]);
  };
  const teilUmschalten = (id) => setzeAuswahl(auswahl.includes(id) ? auswahl.filter((x) => x !== id) : [...auswahl, id]);
  const hier = new Set(kapitel.map((k) => k.id));
  const gruppen = auswahlNachKapitel(auswahl, schulart);
  const anderswo = gruppen.filter((g) => !hier.has(g.kapitel));
  const nTeile = auswahl.length, nKap = gruppen.length;
  const kopf = nTeile === 0 ? "Hake an, was in deinen Plan soll"
    : `${nTeile} ${nTeile === 1 ? "Unterthema" : "Unterthemen"} aus ${nKap} ${nKap === 1 ? "Kapitel" : "Kapiteln"}`;
  return (
    <div style={{ marginTop: 14 }}>
      <button type="button" onClick={() => setAuf(!auf)} aria-expanded={auf}
        style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 50, padding: "8px 12px 8px 14px",
          border: `2px solid ${nTeile ? C.see : C.linie}`, background: nTeile && !auf ? C.himmel : C.weiss, color: C.tinte }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau }}>
            {klasse === "abi" ? <>Abi-Themen · {s?.name}</> : <>Themen für deinen Plan · Klasse {klassenBoxen(schulart).find((b) => b.id === klasse)?.label} {s?.name}</>}
          </span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: nTeile ? C.tinte : C.see, marginTop: 2, lineHeight: 1.25 }}>{kopf}</span>
        </span>
        <Pfeil auf={auf} />
      </button>
      {auf && (
        <div className="auftauchen" role="list" aria-label="Themen für den Trainingsplan" data-kein-scroll style={{ marginTop: 6, display: "grid", gap: 5, overflowAnchor: "none" }}>
          {kapitel.map((k) => {
            const z = zustand(k.id);
            const teileAuf = offen === k.id;
            const teile = unterthemen(k.id);
            const n = teile.filter((u) => auswahl.includes(u.id)).length;
            return (
              <div key={k.id} role="listitem" ref={(el) => { refs.current[k.id] = el; }} style={{ borderRadius: 11, border: `1.5px solid ${z ? C.see : C.linie}`, background: z === true ? C.himmel : C.weiss, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <button type="button" role="checkbox" aria-checked={z} onClick={() => kapitelUmschalten(k.id)}
                    aria-label={`${z === true ? "Ganzes Kapitel abwählen" : "Ganzes Kapitel anhaken"}: ${k.titel}`}
                    style={{ ...knopfBasis, flexShrink: 0, width: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRight: `1px solid ${C.linie}`, borderRadius: 0, background: "transparent" }}>
                    <Haekchen zustand={z} />
                  </button>
                  <button type="button" onClick={() => { merke(k.id); setOffen(teileAuf ? null : k.id); }} aria-expanded={teileAuf}
                    style={{ ...knopfBasis, flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, textAlign: "left", minHeight: 48, padding: "7px 10px 7px 8px",
                      border: "none", borderRadius: 0, background: "transparent", color: C.tinte, fontWeight: 600 }}>
                    <span data-kein-i18n style={{ flexShrink: 0, width: 28, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: z ? C.see : C.grau, letterSpacing: "0.04em" }}>{roemisch(k.nr)}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14.5, lineHeight: 1.25 }}>{k.titel}</span>
                      <span style={{ display: "block", fontSize: 12, fontWeight: z === "mixed" ? 700 : 400, color: z === "mixed" ? C.see : C.grau, marginTop: 1, lineHeight: 1.3 }}>
                        {z === "mixed" ? `${n} von ${teile.length} Unterthemen` : k.zeile}
                      </span>
                    </span>
                    <Pfeil auf={teileAuf} gross={16} />
                  </button>
                </div>
                {teileAuf && (
                  <div className="auftauchen" style={{ display: "grid", gap: 4, padding: "2px 8px 8px 46px", background: "#F6F9FE", borderTop: `1px solid ${C.linie}` }}>
                    {teile.map((u) => {
                      const uan = auswahl.includes(u.id);
                      return (
                        <button key={u.id} type="button" role="checkbox" aria-checked={uan} onClick={() => teilUmschalten(u.id)} className="qf-balken"
                          aria-label={u.gen.length ? `${u.titel} (mit Übungsaufgaben)` : u.titel}
                          style={{ ...knopfBasis, display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", minHeight: 34, padding: "5px 10px",
                            marginTop: 4, borderRadius: 8, fontSize: 13.5, fontWeight: uan ? 700 : 500,
                            border: `1px solid ${uan ? C.see : C.linie}`, background: uan ? C.see : C.weiss, color: uan ? C.weiss : C.tinte }}>
                          <Haekchen zustand={uan} hell={uan} />
                          <span style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>{u.titel}</span>
                          {u.gen.length > 0 && <span aria-hidden="true" title="Mit Übungsaufgaben" style={{ flexShrink: 0, width: 7, height: 7, borderRadius: 999, background: C.flaggold }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {anderswo.length > 0 && (
            <div style={{ marginTop: 6, padding: "9px 10px", borderRadius: 11, background: "#FFFBEA", border: `1px solid ${C.flaggold}` }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A6A00", margin: "0 0 6px" }}>Auch in deinem Plan (andere Klasse)</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {anderswo.map((g) => (
                  <button key={g.kapitel} type="button" onClick={() => setzeAuswahl(auswahl.filter((id) => !g.teile.some((u) => u.id === id)))}
                    aria-label={`Aus dem Plan nehmen: ${THEMEN[g.kapitel].titel}`}
                    style={{ ...knopfBasis, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                      border: `1px solid ${C.linie}`, background: C.weiss, color: C.tinte }}>
                    {THEMEN[g.kapitel].titel}{g.ganz ? "" : ` (${g.teile.length})`} <span aria-hidden="true" style={{ color: C.grau, fontWeight: 800 }}>×</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "4px 2px 0" }}>
            <p style={{ flex: "1 1 200px", margin: 0, fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5 }}>
              Kapitel antippen: Unterthemen aufklappen. Kästchen links: ganzes Kapitel. Goldener Punkt: mit Übungsaufgaben.
            </p>
            {nTeile > 0 && (
              <button type="button" onClick={() => setzeAuswahl([])} style={{ ...knopfBasis, border: "none", background: "none", padding: "4px 0", fontSize: 12.5, color: C.gruenDunkel }}>
                Alles abwählen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ETIKETT_NAME = { entdecken: "Entdecken", rechnen: "Rechnen", trainieren: "Trainieren" };

/* Alle Formelsammlungs-Bereiche eines Kapitels werden zu EINER Zeile: der Formelauswahl genau
   zu diesem Kapitel (Vorwissen aus den Vorjahren + Kapitelformeln, PDF, Testklausur). */
function mitFormelauswahl(liste, kapitelId, schulart, klasse) {
  const a = kapitelAuswahl(kapitelId, schulart);
  if (!a) return liste;
  const n = [...a.vorwissen, ...a.kern].reduce((s, x) => s + x.ids.length, 0);
  const zeile = { art: "seite", id: "kapitelformeln", name: "Formelsammlung zum Kapitel",
    zeile: `${n} Formeln · mit Vorwissen, PDF und Testklausur`,
    ziel: { ansicht: "kapitelformeln", kapitel: kapitelId, schulart, klasse } };
  const i = liste.findIndex((h) => h.ziel && h.ziel.ansicht === "formeln");
  const ohne = liste.filter((h) => !(h.ziel && h.ziel.ansicht === "formeln"));
  const pos = i < 0 ? ohne.length : liste.slice(0, i).filter((h) => !(h.ziel && h.ziel.ansicht === "formeln")).length;
  return [...ohne.slice(0, pos), zeile, ...ohne.slice(pos)];
}

/* Trainings-Werkzeuge eines Kapitels: zuerst „5 Aufgaben zum Kapitel“ (falls es Trainer-Aufgaben gibt)
   und „Trainingsplan zu diesem Kapitel“, dann alle Werkzeuge und Seiten aus schulbuch.js;
   die Formelsammlungs-Bereiche als eine Zeile. */
export function werkzeugeZumKapitel(kapitelId, schulart, klasse, mitPlan = true) {
  const liste = mitFormelauswahl(hilfenFuer(kapitelId), kapitelId, schulart, klasse);
  const training = sacheGeneratoren(kapitelId, null).length
    ? [{ art: "training", id: "trainieren", name: "5 Aufgaben zum Kapitel", zeile: "Mit Hinweisen, Lösungsweg und Rückmeldung zu deinem Fehler",
        ziel: { ansicht: "trainieren", kapitel: kapitelId, teil: null, schulart, klasse } }]
    : [];
  if (mitPlan && unterthemen(kapitelId).length)
    training.push({ art: "plan", id: "trainingsplan", name: "Trainingsplan zu diesem Kapitel", zeile: "Themen anhaken, Warm-up, Basis-Check und Wiederholungen nach Ebbinghaus", stern: true });
  return [...training, ...liste.filter((h) => h.art === "werkzeug"), ...liste.filter((h) => h.art === "seite")];
}

const Stern = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z" fill={C.flaggold} />
  </svg>
);

function WerkzeugZeile({ h, gold, waehle }) {
  return (
    <button type="button" onClick={() => waehle(h)} className="qf-balken"
      style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 46, padding: "7px 10px 7px 12px",
        borderRadius: 10, border: `1.5px solid ${gold ? C.flaggold : C.linie}`, background: gold ? "#FFFBEA" : C.weiss, fontWeight: 600 }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14.5, color: C.tinte, lineHeight: 1.25 }}>{h.name}{h.stern && <Stern />}</span>
        <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, marginTop: 1, lineHeight: 1.3 }}>{h.zeile}</span>
      </span>
      {h.etikett && <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.see, padding: "3px 7px", borderRadius: 999, background: C.himmel }}>{ETIKETT_NAME[h.etikett]}</span>}
      <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: gold ? "#8A6A00" : C.see }}>›</span>
    </button>
  );
}

/* Unterthema antippen: Übungsaufgaben, sonst das beste Werkzeug dazu; ohne beides bleibt die Zeile ausgegraut. */
function unterthemaOeffnen(u, kapitelId, schulart, klasse, gehe) {
  if (u.gen.length) return gehe({ ansicht: "trainieren", kapitel: kapitelId, teil: u.id, schulart, klasse });
  const wz = u.wz && WERKZEUGE[u.wz];
  if (wz) return gehe(wz.ziel);
  return undefined;
}
function UnterthemaZeile({ u, waehle }) {
  const wz = u.wz && WERKZEUGE[u.wz];
  const geht = u.gen.length > 0 || !!wz;
  return (
    <button type="button" onClick={waehle} disabled={!geht} className={geht ? "qf-balken" : undefined}
      style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 44, padding: "6px 10px 6px 12px",
        borderRadius: 10, border: `1.5px solid ${C.linie}`, background: C.weiss, fontWeight: 600, cursor: geht ? "pointer" : "default", opacity: geht ? 1 : 0.55 }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, color: C.tinte, lineHeight: 1.25 }}>{u.titel}</span>
        <span style={{ display: "block", fontSize: 11.5, fontWeight: 400, color: C.grau, marginTop: 1, lineHeight: 1.3 }}>
          {u.gen.length ? "Mit Übungsaufgaben" : wz ? wz.name : "Aufgaben kommen noch"}
        </span>
      </span>
      {u.gen.length > 0 && <span aria-hidden="true" style={{ flexShrink: 0, width: 7, height: 7, borderRadius: 999, background: C.flaggold }} />}
      {geht && <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: C.see }}>›</span>}
    </button>
  );
}

/* Menü: alle Kapitel der gewählten Klasse untereinander; ein Kapitel klappt auf und zeigt seine Werkzeuge.
   Immer nur ein Kapitel offen; das offene Kapitel bleibt gespeichert.
   nurWerkzeuge (Bereich „Tools“): nur die Werkzeug-Zeilen je Kapitel – ohne Hauptthema-Wahl, Unterthemen und Plan-Eintrag;
   ausser: dieses Kapitel weglassen (das Hauptthema zeigt seine Werkzeuge schon darüber). */
function KapitelMenue({ schulart, klasse, offen, setOffen, gehe, planOeffnen, handy = false, haupt = null, hauptWaehlen = null, nurWerkzeuge = false, ausser = null }) {
  const kapitel = kapitelFuer(schulart, klasse).filter((k) => k.id !== ausser);
  const s = schulartVon(schulart);
  const box = klassenBoxen(schulart).find((b) => b.id === klasse);
  const { refs, merke } = useRuhigAufklappen(offen);
  const umschalten = (id) => { merke(id); setOffen(offen === id ? null : id); };
  const titel = nurWerkzeuge ? (ausser ? "Werkzeuge anderer Kapitel" : "Werkzeuge nach Kapitel") : "Themen der Klasse";
  return (
    <div className="auftauchen" data-kein-scroll style={{ marginTop: 6, overflowAnchor: "none" }}>
      <p style={{ ...KICKER, color: C.grau, marginBottom: 8 }}>
        {titel} {!nurWerkzeuge && <span data-kein-i18n>{box ? box.label : ""} · {s ? s.name : ""}</span>}
      </p>
      <div role="list" aria-label={titel} style={{ display: "grid", gap: 6 }}>
        {kapitel.map((k) => {
          const auf = offen === k.id;
          const werkzeuge = auf ? werkzeugeZumKapitel(k.id, schulart, klasse, !handy && !nurWerkzeuge) : [];
          const teile = auf && handy && !nurWerkzeuge ? unterthemen(k.id) : [];
          return (
            <div key={k.id} role="listitem" ref={(el) => { refs.current[k.id] = el; }}
              style={{ borderRadius: 12, border: `1.5px solid ${auf ? C.see : C.linie}`, background: C.weiss, overflow: "hidden",
                boxShadow: auf ? "0 4px 14px rgba(0,77,152,0.12)" : "none", scrollMarginTop: 12 }}>
              <button type="button" onClick={() => umschalten(k.id)} aria-expanded={auf}
                style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 52, padding: "8px 14px 8px 8px",
                  border: "none", borderRadius: 0, background: auf ? C.himmel : "transparent", color: C.tinte }}>
                <span data-kein-i18n style={{ flexShrink: 0, width: 36, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: auf ? C.see : C.grau, letterSpacing: "0.04em" }}>{roemisch(k.nr)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.25, color: auf ? C.see : C.tinte }}>{k.titel}</span>
                  <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, marginTop: 2, lineHeight: 1.3 }}>{k.zeile}</span>
                </span>
                <Pfeil auf={auf} />
              </button>
              {auf && (
                <div className="auftauchen" style={{ display: "grid", gap: 6, padding: "10px 10px 12px", borderTop: `1px solid ${C.linie}`, background: "#F6F9FE" }}>
                  {hauptWaehlen && !nurWerkzeuge && (haupt && haupt.kapitel === k.id ? (
                    <p style={{ margin: "0 2px 4px", fontSize: 12.5, fontWeight: 700, color: C.gruenDunkel, display: "flex", alignItems: "center", gap: 6 }}><Stern /> Das ist dein Hauptthema</p>
                  ) : (
                    <>
                      <HauptthemaWahl titel={k.titel} ersetzt={haupt ? THEMEN[haupt.kapitel].titel : null} waehle={(termin) => hauptWaehlen(k.id, termin)} />
                      <p style={{ ...KICKER, fontSize: 10.5, margin: "8px 2px 2px" }}>Oder direkt loslegen</p>
                    </>
                  ))}
                  {teile.length > 0 && (
                    <>
                      <p style={{ ...KICKER, fontSize: 10.5, margin: "0 2px 2px" }}>Unterthemen – antippen und üben</p>
                      {teile.map((u) => <UnterthemaZeile key={u.id} u={u} waehle={() => unterthemaOeffnen(u, k.id, schulart, klasse, gehe)} />)}
                    </>
                  )}
                  <p style={{ ...KICKER, fontSize: 10.5, margin: `${teile.length > 0 ? 8 : 0}px 2px 2px` }}>Trainings-Werkzeuge zu diesem Kapitel</p>
                  {werkzeuge.map((h, i) => <WerkzeugZeile key={h.art + h.id} h={h} gold={i === 0}
                    waehle={(x) => (x.art === "plan" ? planOeffnen(k.id) : gehe(x.ziel))} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!nurWerkzeuge && (
        <p style={{ margin: "8px 2px 0", fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5 }}>
          Reihenfolge wie im Lambacher Schweizer (Baden-Württemberg); je nach Schule kann sie abweichen.
        </p>
      )}
    </div>
  );
}

/* ---------- Bereich „Videos“: Videokurse, deren Klassenbereich („Klasse 11 – 13“) die gewählte Klasse enthält ---------- */
function videokurseFuer(schulartId, boxId) {
  const box = klassenBoxen(schulartId).find((b) => b.id === boxId);
  if (!box) return [];
  return KURSE.filter((k) => VIDEOKURSE[k.id] && klasseImBereich(k.stufe, box.klassen))
    .map((k) => ({ id: k.id, titel: k.titel, unter: k.unter, stufe: k.stufe, lektionen: VIDEOKURSE[k.id].lektionen.length }));
}
const Play = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill={C.flaggold} /></svg>
);
function Videokurse({ schulart, klasse, gehe, breit = false }) {
  const box = klassenBoxen(schulart).find((b) => b.id === klasse);
  const liste = useMemo(() => videokurseFuer(schulart, klasse), [schulart, klasse]);
  return (
    <div className="auftauchen" style={{ marginTop: 12, display: "grid", gap: 6, maxWidth: breit ? 640 : undefined }}>
      <Abschnitt rechts={liste.length ? <><span data-kein-i18n>{liste.length}</span> {liste.length === 1 ? "Kurs" : "Kurse"}</> : null}>
        Videokurse für Klasse <span data-kein-i18n>{box ? box.label : ""}</span>
      </Abschnitt>
      {liste.map((k) => (
        <button key={k.id} type="button" onClick={() => gehe({ ansicht: "kurse", kurs: k.id })} className="qf-balken" data-videokurs={k.id}
          style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 11, textAlign: "left", minHeight: 56, padding: "8px 10px",
            borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.tinte }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, background: C.seeTief, display: "flex", alignItems: "center", justifyContent: "center" }}><Play /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}>{k.titel}</span>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: C.tinte, marginTop: 1, lineHeight: 1.3 }}>{k.unter}</span>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 400, color: C.grau, marginTop: 2, lineHeight: 1.3 }}>
              <span data-kein-i18n>{k.lektionen}</span> Lektionen · {k.stufe}
            </span>
          </span>
          <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: C.see }}>›</span>
        </button>
      ))}
      <button type="button" onClick={() => gehe({ ansicht: "kurse" })}
        style={{ ...knopfBasis, justifySelf: "start", border: "none", background: "none", padding: "6px 2px", fontSize: 13, color: C.see }}>
        Alle Videokurse ansehen ›
      </button>
    </div>
  );
}

/* ---------- Bereich „Plan“ ohne Hauptthema und ohne aktiven Plan ---------- */
function PlanHinweis({ zumThema, anhaken }) {
  return (
    <div className="auftauchen" style={{ marginTop: 12, borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, padding: "12px 14px 14px", display: "grid", gap: 8, maxWidth: 640 }}>
      <p style={{ ...KICKER, color: "#8A6A00" }}>Dein Trainingsplan</p>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: C.tinte }}>
        Noch kein Plan. Wähle unter „Thema“ ein Kapitel als Hauptthema – dann bekommst du jeden Tag eine Einheit, Wiederholungen nach Ebbinghaus und vor der Arbeit die Generalprobe.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={zumThema} className="qf-gold"
          style={{ ...knopfBasis, minHeight: 40, padding: "8px 14px", border: "none", background: C.flaggold, color: C.seeTief, fontSize: 13.5, fontWeight: 800 }}>Kapitel wählen ›</button>
        {anhaken && (
          <button type="button" onClick={anhaken} className="qf-balken"
            style={{ ...knopfBasis, minHeight: 40, padding: "8px 14px", border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 13.5 }}>Themen selbst anhaken</button>
        )}
      </div>
    </div>
  );
}

/* Unter dem Menü, sobald Schulsystem und Klasse gewählt sind: Kurse, die zu den Kapiteln der Klasse passen */
function EmpfohleneKurse({ schulart, klasse, gehe }) {
  const kurse = useMemo(() => kurseFuer(schulart, klasse), [schulart, klasse]);
  if (!kurse.length) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ ...KICKER, color: C.grau, marginBottom: 8 }}>Empfohlene Kurse für dich</p>
      <div style={{ display: "grid", gap: 6 }}>
        {kurse.map((k) => (
          <button key={k.id} type="button" onClick={() => gehe(k.ziel)} className="qf-balken" data-kurs-empfehlung={k.id}
            style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 56, padding: "9px 10px 9px 14px",
              borderRadius: 12, border: `1.5px solid ${C.flaggold}`, background: "#FFFBEA", color: C.tinte }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{k.name}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, marginTop: 2, lineHeight: 1.3 }}>{k.zeile}</span>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#8A6A00", marginTop: 3, lineHeight: 1.3 }}>
                <span>Passt zu</span> <span data-kein-i18n>{k.passt.slice(0, 2).join(" · ")}{k.passt.length > 2 ? " …" : ""}</span>
              </span>
            </span>
            <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: "#8A6A00" }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Trainingsplan erstellen ---------- */
function AktiverPlan({ v, gehe }) {
  const heute = heuteText();
  const st = planStand(v.plan, v.erledigt, heute);
  return (
    <button type="button" onClick={() => gehe({ ansicht: "trainingsplan" })}
      style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", marginTop: 12, padding: "10px 12px", borderRadius: 12,
        border: `1.5px solid ${C.flaggold}`, background: "#FFFBEA", color: C.tinte }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A00" }}>Dein Trainingsplan · {st.fertig}/{st.gesamt}</span>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, marginTop: 2, lineHeight: 1.25 }}>{v.plan.titel}</span>
        <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.grau, marginTop: 2 }}>
          {st.naechste ? `${st.faellig ? "Heute dran" : `Als Nächstes ${tagName(st.naechste.datum, heute, englisch())}`}: ${st.naechste.titel}` : "Komplett geschafft"}
        </span>
      </span>
      <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: "#8A6A00" }}>›</span>
    </button>
  );
}
function PlanKarte({ q, auswahl, gehe, aktiv }) {
  const heute = heuteText();
  const [termin, setTermin] = useState("");
  const [ohne, setOhne] = useState([]);   // abgewählte Vorbereitung: "warmup" oder Kapitel-Ids
  const vb = useMemo(() => vorbereitungFuer(auswahl, q.schulart), [auswahl, q.schulart]);
  const plan = useMemo(() => planErstellen({ teile: auswahl, ohne, schulart: q.schulart, klasse: q.klasse, heute, termin: termin || null }),
    [auswahl, ohne, q.schulart, q.klasse, heute, termin]);
  if (!plan) return null;
  const tage = planTage(plan);
  const kerne = plan.einheiten.filter((e) => e.phase === "kern");
  const umschalten = (id) => setOhne(ohne.includes(id) ? ohne.filter((x) => x !== id) : [...ohne, id]);
  const speichern = () => {
    if (aktiv && !window.confirm(`Dein aktueller Plan „${aktiv.plan.titel}“ wird ersetzt. Weiter?`)) return;
    planSpeichern(plan);
    gehe({ ansicht: "trainingsplan" });
  };
  const vorschlaege = [
    { id: "warmup", phase: "warmup", titel: "Warm-up", zeile: "Leichte Aufgaben zum Reinkommen" },
    ...vb.basis.map((k) => ({ id: k, phase: "basis", titel: THEMEN[k].titel, zeile: THEMEN[k].zeile })),
    ...vb.zwischen.map((k) => ({ id: k, phase: "zwischen", titel: THEMEN[k].titel, zeile: THEMEN[k].zeile })),
  ];
  const Abschnitt = ({ children }) => <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "12px 2px 6px" }}>{children}</p>;
  return (
    <div className="auftauchen" style={{ marginTop: 12, borderRadius: 14, border: `2px solid ${C.see}`, background: C.weiss, overflow: "hidden" }}>
      <div style={{ padding: "13px 14px 12px", background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
        <p style={{ ...KICKER, color: C.flaggold }}>Dein Trainingsplan</p>
        <p style={{ fontSize: 17, fontWeight: 700, marginTop: 6, lineHeight: 1.25 }}>{kerne.length === 1 ? plan.titel : `${kerne.length} Themen in einem Plan`}</p>
        <p style={{ fontSize: 12.5, color: "#C9D6EE", marginTop: 3, lineHeight: 1.45 }}>Erst das Fundament prüfen, dann deine Themen – und danach Wiederholungen nach Ebbinghaus, damit es bis zur Arbeit sitzt.</p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10, fontSize: 12.5, fontWeight: 700, color: C.weiss }}>
          Klassenarbeit am
          <input type="date" value={termin} min={heute} onChange={(e) => setTermin(e.target.value)} aria-label="Datum der Klassenarbeit (optional)"
            style={{ fontFamily: "inherit", fontSize: 14, padding: "5px 8px", borderRadius: 8, border: "none", minHeight: 34, color: C.tinte, background: C.weiss }} />
          {!termin && <span style={{ fontWeight: 500, color: "#C9D6EE" }}>(optional)</span>}
          {termin && <button type="button" onClick={() => setTermin("")} style={{ ...knopfBasis, border: "none", background: "none", color: C.flaggold, fontSize: 12.5, padding: 0 }}>entfernen</button>}
        </label>
      </div>

      <div style={{ padding: "2px 12px 0" }}>
        <Abschnitt>Deine Themen</Abschnitt>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 6 }}>
          {kerne.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", borderRadius: 10, background: "#FCE8EE33", border: `1px solid ${C.linie}` }}>
              <PhasenPille phase="kern" />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>{e.titel}</span>
                <span style={{ display: "block", fontSize: 12, color: C.grau, lineHeight: 1.35, marginTop: 1 }}>{e.zeile}</span>
              </span>
            </div>
          ))}
        </div>

        <Abschnitt>Vorbereitung – schlage ich dir vor</Abschnitt>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 5 }}>
          {vorschlaege.map((v) => {
            const an = !ohne.includes(v.id);
            return (
              <button key={v.phase + v.id} type="button" role="checkbox" aria-checked={an} onClick={() => umschalten(v.id)} className="qf-balken"
                aria-label={`${PHASEN[v.phase].name}: ${v.titel}`}
                style={{ ...knopfBasis, display: "flex", alignItems: "center", gap: 9, width: "100%", minWidth: 0, textAlign: "left", minHeight: 40, padding: "6px 10px", borderRadius: 10,
                  border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.weiss : "#F4F6FA", color: C.tinte, opacity: an ? 1 : 0.7 }}>
                <Haekchen zustand={an} />
                <PhasenPille phase={v.phase} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.25, textDecoration: an ? "none" : "line-through", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.titel}</span>
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5, margin: "6px 2px 0" }}>
          Basis-Check: Grundlagen aus früheren Klassen. Zwischenschritte: was du direkt dafür brauchst. Abhaken, was du sicher kannst.
        </p>

        <Abschnitt>So sieht dein Plan aus</Abschnitt>
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: "0 12px 4px" }}>
        {tage.map((t) => (
          <li key={t.datum} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.linie}` }}>
            <span style={{ flexShrink: 0, width: 80, fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap", color: t.datum === heute ? C.gruenDunkel : C.grau, paddingTop: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{tagName(t.datum, heute, englisch())}</span>
            <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 5 }}>
              {t.einheiten.map((e) => (
                <span key={e.id} style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <PhasenPille phase={e.phase} />
                  <span style={{ fontSize: 13, color: C.tinte, fontWeight: 600, lineHeight: 1.25, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.phase === "warmup" || e.phase === "generalprobe" || e.phase === "wiederholen" ? e.zeile.split(" · ")[0] : e.titel}
                  </span>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ol>
      <div style={{ padding: "6px 12px 14px" }}>
        <p style={{ fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5, margin: "2px 2px 0" }}>
          {termin ? "Wiederholen: nach Ebbinghaus, vor der Arbeit verdichtet, am Vortag die Generalprobe." : "Wiederholen: 1, 3, 7, 14 und 30 Tage nach dem letzten Kerntraining."}
        </p>
        <button type="button" onClick={speichern}
          style={{ ...knopfBasis, width: "100%", minHeight: 46, marginTop: 10, border: "none", background: C.flaggold, color: C.seeTief, fontSize: 15, fontWeight: 800, boxShadow: "0 4px 14px rgba(237,187,0,0.3)" }}>
          Plan speichern und starten ›
        </button>
      </div>
    </div>
  );
}

/* setzeStufe: stellt den Stufen-Schalter der Startseite (Unter-/Mittel-/Oberstufe) mit ein.
   links: Überschrift der Kachel. unten: kleiner Link zu „Mein Training“.
   Ab 600 px zwei Spalten: rechts oben der Schulsystem-Balken auf Höhe der Überschrift, darunter die Klassen.
   Darunter einspaltig: Überschrift, Text, Schulsystem, Klassen.
   Nach der Klassenwahl öffnet sich das Kapitel-Menü. „Trainingsplan zu diesem Kapitel“ wechselt in den
   Plan-Modus (Themen zum Anhaken, das Kapitel ist schon angehakt) – „‹ Zurück zu den Kapiteln“ führt zurück. */
export function Quickfinder({ gehe, setzeStufe, links }) {
  const [q, setQ] = useState(() => lesen() || { schulart: null, klasse: null, kapitel: null, teil: null, modus: modusLesen(), auswahl: auswahlOhneSchulart() });
  // waehlen: Auswahl von Schulsystem und Klasse ist offen. Ist beides gewählt, schrumpft sie auf den Chip mit dem Menü daneben.
  const [waehlen, setWaehlen] = useState(false);
  const gewaehlt = !!(q.schulart && q.klasse);
  const fertig = gewaehlt && !waehlen;
  // tab: Bereich des Menüs (Thema · Plan · Tools · Videos); am Desktop startet ein gespeicherter Anhak-Plan im Bereich Plan
  const [tab, setTabRoh] = useState(() => tabLesen() || (modusLesen() === "plan" && !handyJetzt() ? "plan" : "thema"));
  const setTab = (t) => { setTabRoh(t); tabSchreiben(t); };
  const aktiv = useAktiverPlan();
  const menueRef = useRef(null);
  const setze = (neu) => { setQ(neu); schreiben(neu); };
  const schulartSetzen = (id) => {
    if (id === q.schulart) return;
    // Die Klasse bleibt, wenn es sie im neuen Schulsystem gibt (z. B. 8 oder 12); sonst neu wählen
    const bleibt = klassenBoxen(id).some((b) => b.id === q.klasse) ? q.klasse : null;
    setze({ ...q, schulart: id, klasse: bleibt, kapitel: null, teil: null });
  };
  const klasseSetzen = (id) => {
    setWaehlen(false);
    if (id === q.klasse) return;
    setze({ ...q, klasse: id, kapitel: null, teil: null });
    const box = klassenBoxen(q.schulart).find((b) => b.id === id);
    if (box && setzeStufe) setzeStufe(stufeAusKlassenBox(box));
  };
  const handy = useHandy();
  const plan = q.modus === "plan" && !handy;   // am Handy nie der Anhak-Plan, auch nicht aus altem Speicher
  const auswahl = q.auswahl || [];
  const nachOben = () => requestAnimationFrame(() => { const el = menueRef.current; if (el && el.getBoundingClientRect().top < 0) springe("quickfinder-menue", () => el.scrollIntoView({ block: "start", behavior: "smooth" })); });
  // „Trainingsplan zu diesem Kapitel“: alle Unterthemen des Kapitels anhaken (bisher Angehaktes bleibt)
  const planOeffnen = (kId) => {
    const ids = unterthemen(kId).map((x) => x.id);
    setze({ ...q, modus: "plan", auswahl: [...auswahl, ...ids.filter((id) => !auswahl.includes(id))] });
    setTab("plan");
    nachOben();
  };
  const zurueck = () => { setze({ ...q, modus: "sache" }); setTab("thema"); nachOben(); };

  /* ---------- Hauptthema ---------- */
  const haupt = q.haupt || null;
  const [liste, setListe] = useState(false);   // Kapitelliste trotz Hauptthema offen („Thema wechseln“)
  const planFuer = (kapitelId, schulart, klasse, termin) => planErstellen({ kapitel: kapitelId, schulart, klasse, heute: heuteText(), termin: termin || null });
  const fremderPlan = (h) => aktiv && (!h || aktiv.plan.id !== h.planId);
  const hauptWaehlen = (kapitelId, termin, schulart = q.schulart, klasse = q.klasse) => {
    const plan = planFuer(kapitelId, schulart, klasse, termin);
    if (plan && fremderPlan(haupt) && !window.confirm(`Dein aktueller Trainingsplan „${aktiv.plan.titel}“ wird durch den Plan zum neuen Hauptthema ersetzt. Weiter?`)) return;
    if (plan) planSpeichern(plan);
    setze({ ...q, modus: "sache", kapitel: kapitelId, teil: null,
      haupt: { kapitel: kapitelId, schulart, klasse, termin: termin || null, seit: heuteText(), planId: plan ? plan.id : null, note: null } });
    setListe(false);
    setTab("thema");
    nachOben();
  };
  const hauptAktionen = haupt && {
    gehe,
    liste: () => { setListe(true); setTab("thema"); },
    beenden: () => { setze({ ...q, haupt: null }); setListe(false); },
    oeffneTeil: (u) => unterthemaOeffnen(u, haupt.kapitel, haupt.schulart, haupt.klasse, gehe),
    waehleWz: (h) => gehe(h.ziel),
    heuteStarten: (e) => { if (e.gen.length) einheitVormerken(e.id); gehe({ ansicht: "trainingsplan" }); },
    planErstellen: () => {
      const plan = planFuer(haupt.kapitel, haupt.schulart, haupt.klasse, haupt.termin);
      if (!plan) return;
      if (fremderPlan(haupt) && !window.confirm(`Dein aktueller Trainingsplan „${aktiv.plan.titel}“ wird ersetzt. Weiter?`)) return;
      planSpeichern(plan);
      setze({ ...q, haupt: { ...haupt, planId: plan.id } });
    },
    datumSetzen: (termin) => {
      const plan = planFuer(haupt.kapitel, haupt.schulart, haupt.klasse, termin);
      const meiner = aktiv && aktiv.plan.id === haupt.planId ? aktiv : null;
      if (plan && meiner) planErsetzen(plan, erledigtUebertragen(meiner.plan, meiner.erledigt, plan));
      setze({ ...q, haupt: { ...haupt, termin: termin || null, seit: heuteText(), note: null, planId: plan && meiner ? plan.id : haupt.planId } });
    },
    noteSetzen: (n) => setze({ ...q, haupt: { ...haupt, note: n } }),
    neuesHaupt: (kapitelId) => hauptWaehlen(kapitelId, null, haupt.schulart, haupt.klasse),
  };
  const hauptWerkzeuge = useMemo(() => (haupt ? werkzeugeZumKapitel(haupt.kapitel, haupt.schulart, haupt.klasse, false) : []), [haupt && haupt.kapitel, haupt && haupt.schulart, haupt && haupt.klasse]);   // eslint-disable-line react-hooks/exhaustive-deps
  const hauptKurse = useMemo(() => {
    if (!haupt || !haupt.klasse) return [];
    const titel = THEMEN[haupt.kapitel].titel;
    return kurseFuer(haupt.schulart, haupt.klasse, 6).filter((k) => k.passt.includes(titel)).slice(0, 2);
  }, [haupt && haupt.kapitel, haupt && haupt.schulart, haupt && haupt.klasse]);   // eslint-disable-line react-hooks/exhaustive-deps
  const hauptOben = haupt && !liste;   // Hauptthema sichtbar (die Kapitelliste ist nicht über „Thema wechseln“ offen)
  const planGehoertZumHaupt = haupt && aktiv && aktiv.plan.id === haupt.planId;
  const hauptAnsicht = (zeige) => (
    <HauptthemaAnsicht haupt={haupt} plan={aktiv} werkzeuge={hauptWerkzeuge} kurse={hauptKurse} aktionen={hauptAktionen} breit={!handy} zeige={zeige} />
  );
  const kapitelMenue = (extra = {}) => (
    <KapitelMenue key={q.schulart + q.klasse} schulart={q.schulart} klasse={q.klasse} offen={q.kapitel} gehe={gehe} planOeffnen={planOeffnen} handy={handy}
      haupt={haupt} hauptWaehlen={hauptWaehlen} setOffen={(id) => setze({ ...q, kapitel: id, teil: null })} {...extra} />
  );
  // Videos und Werkzeuge brauchen Schulart und Klasse – notfalls die des Hauptthemas
  const sk = gewaehlt ? { schulart: q.schulart, klasse: q.klasse } : haupt && haupt.klasse ? { schulart: haupt.schulart, klasse: haupt.klasse } : null;
  const [toolsOffen, setToolsOffen] = useState(null);   // offenes Kapitel im Bereich Tools (eigener Zustand, unabhängig vom Bereich Thema)
  return (
    <>
      <style>{`.qf-kopf{display:grid;grid-template-columns:minmax(0,1fr);grid-template-areas:"kopf" "schul" "klass";row-gap:10px;padding:16px 16px 6px}
        .qf-kopf>.qf-a-kopf{grid-area:kopf;margin-bottom:4px}.qf-kopf>.qf-a-schul{grid-area:schul}.qf-kopf>.qf-a-klass{grid-area:klass}
        @media (min-width:600px){.qf-kopf{grid-template-columns:minmax(0,1fr) 280px;grid-template-rows:auto 1fr;grid-template-areas:"kopf schul" "kopf klass";column-gap:22px;row-gap:10px}
          .qf-kopf>.qf-a-kopf{margin-bottom:0}.qf-kopf>.qf-a-klass{align-self:start}}
        @media (min-width:840px){.qf-kopf{grid-template-columns:minmax(0,1fr) 300px;padding:18px 18px 6px 20px;column-gap:28px}}
        .qf-unten{padding:0 16px}.qf-menue{padding:0 16px 16px;scroll-margin-top:12px}
        @media (min-width:840px){.qf-unten{padding:0 18px 0 20px}.qf-menue{padding:0 18px 18px 20px}}
        @media (hover:hover){.qf-balken:hover{border-color:${C.see} !important}
          .qf-sa[aria-pressed="false"]:hover{background:rgba(255,255,255,0.1) !important}
          .qf-kl[aria-pressed="false"]:hover{border-color:${C.see}55 !important}
          .qf-gold:hover{filter:brightness(1.04)}
          .qf-chip:hover{filter:brightness(1.1)}
          .qf-tab[aria-selected="false"]:hover{color:${C.see} !important}
          .ht-gold:hover{filter:brightness(1.05)}
          .ht-blau:hover{filter:brightness(1.12);border-color:rgba(255,255,255,0.4) !important}}
        .qf-kopf.qf-fertig{grid-template-areas:"kopf";padding-bottom:10px}
        .qf-kopf.qf-fertig>.qf-a-kopf{margin-bottom:0}
        @media (min-width:600px){.qf-kopf.qf-fertig{grid-template-columns:minmax(0,1fr);grid-template-rows:auto;grid-template-areas:"kopf"}}
        .qf-leiste{display:flex;align-items:center;gap:8px;padding:0 16px 12px}
        @media (min-width:840px){.qf-leiste{padding:0 18px 12px 20px;max-width:600px}}
        .qf-zwei{display:grid;gap:0}
        @media (min-width:840px){.qf-zwei{grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:24px;align-items:start}}`}</style>
      <div className={fertig ? "qf-kopf qf-fertig" : "qf-kopf"}>
        <div className="qf-a-kopf" style={{ minWidth: 0 }}>
          {links}
          {!fertig && <p style={{ margin: "10px 0 0", fontSize: 13.5, fontWeight: 300, lineHeight: 1.55, color: C.grau }}>
            {plan
              ? "Hake an, was in deinen Plan soll – ganze Kapitel, einzelne Unterthemen, auch mehrere Kapitel. Ich ergänze Warm-up, Basis-Check und Wiederholungen nach Ebbinghaus."
              : "Wähle dein Schulsystem und deine Klasse. Dann siehst du alle Kapitel aus deinem Buch – und zu jedem Kapitel die Werkzeuge, mit denen du es trainierst."}
          </p>}
        </div>
        {!fertig && (
          <>
            <div className="qf-a-schul"><SchulartWahl wert={q.schulart} setze={schulartSetzen} /></div>
            <div className="qf-a-klass"><KlassenWahl schulart={q.schulart} wert={q.klasse} setze={klasseSetzen} /></div>
          </>
        )}
      </div>
      {fertig && (
        <div className="qf-leiste">
          <AuswahlChip schulart={q.schulart} klasse={q.klasse} oeffnen={() => setWaehlen(true)} />
          <TrainingsMenue tab={tab} setTab={setTab} />
        </div>
      )}
      {gewaehlt || aktiv || haupt ? (
        <div className="qf-menue" ref={menueRef} data-bereich={tab}>
          {tab === "thema" && (
            <>
              {hauptOben && hauptAnsicht("thema")}
              {haupt && liste && <HauptthemaLeiste haupt={haupt} zurueck={() => setListe(false)} beenden={hauptAktionen.beenden} />}
              {gewaehlt && !hauptOben && kapitelMenue()}
              {gewaehlt && !hauptOben && <EmpfohleneKurse schulart={q.schulart} klasse={q.klasse} gehe={gehe} />}
            </>
          )}
          {tab === "plan" && (
            <>
              {aktiv && !planGehoertZumHaupt && <AktiverPlan v={aktiv} gehe={gehe} />}
              {gewaehlt && plan ? (
                <>
                  <button type="button" onClick={zurueck}
                    style={{ ...knopfBasis, display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "4px 0", border: "none", background: "none", fontSize: 13, color: C.see }}>
                    <span aria-hidden="true">‹</span> Zurück zu den Kapiteln
                  </button>
                  <PlanAuswahl key={q.schulart + q.klasse} schulart={q.schulart} klasse={q.klasse} auswahl={auswahl} setzeAuswahl={(a) => setze({ ...q, auswahl: a })} />
                  {auswahl.length > 0 && <PlanKarte q={q} auswahl={auswahl} gehe={gehe} aktiv={aktiv} />}
                </>
              ) : haupt ? hauptAnsicht("plan") : !aktiv && (
                <PlanHinweis zumThema={() => setTab("thema")} anhaken={gewaehlt && !handy ? () => setze({ ...q, modus: "plan" }) : null} />
              )}
            </>
          )}
          {tab === "tools" && sk && (
            <div className={haupt ? "qf-zwei" : undefined}>
              {haupt && hauptAnsicht("tools")}
              <div style={{ marginTop: haupt && handy ? 14 : 0 }}>
                {kapitelMenue({ schulart: sk.schulart, klasse: sk.klasse, nurWerkzeuge: true, ausser: haupt ? haupt.kapitel : null, offen: toolsOffen, setOffen: setToolsOffen })}
              </div>
            </div>
          )}
          {tab === "videos" && sk && <Videokurse schulart={sk.schulart} klasse={sk.klasse} gehe={gehe} breit={!handy} />}
        </div>
      ) : null}
    </>
  );
}
