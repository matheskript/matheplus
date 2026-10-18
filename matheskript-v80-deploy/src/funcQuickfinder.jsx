/* ======================================================================
   QUICKFINDER – Status quo in der Kachel „Mein Training“ auf der Startseite
   Schulart (Balken G8 · G9 · GS9) → Klasse (neun Boxen, Abi-Stufen gold) →
   Kapitel im Buch → Liste aller Hilfen der App zu diesem Kapitel.
   Daten: schulbuch.js. Auswahl bleibt im Browser (matheplus-quickfinder).
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { SCHULARTEN, SCHULART_STANDARD, THEMEN, hilfenFuer, kapitelFuer, klassenBoxen, roemisch, schulart as schulartVon, stufeAusKlassenBox } from "./schulbuch.js";
import { kapitelAuswahl } from "./kapitelFormeln.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { englisch } from "./i18n.js";
import { unterthema, unterthemen } from "./unterthemen.js";
import { PHASEN, auswahlNachKapitel, planErstellen, planStand, planTage, tagName, vorbereitungFuer } from "./trainingsplan.js";
import { PhasenPille, heuteText, planSpeichern, sacheGeneratoren, useAktiverPlan } from "./funcKapitelTraining.jsx";

const SCHLUESSEL = "matheplus-quickfinder";
function lesen() {
  try {
    const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
    if (!v || typeof v !== "object") return null;
    if (!schulartVon(v.schulart)) return null;
    const box = klassenBoxen(v.schulart).find((b) => b.id === v.klasse) ? v.klasse : null;
    const kapitel = box && kapitelFuer(v.schulart, box).some((k) => k.id === v.kapitel) ? v.kapitel : null;
    const teil = kapitel && v.teil && unterthema(v.teil) && unterthema(v.teil).kapitel === kapitel ? v.teil : null;
    return { schulart: v.schulart, klasse: box, kapitel, teil, modus: v.modus === "plan" ? "plan" : "sache", auswahl: auswahlLesen(v) };
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

/* Rechte Spalte, schmal: oben ein eigener Balken für das Schulsystem (auf Höhe der Überschrift),
   darunter, getrennt davon, die 3 × 3 Klassen-Boxen. Beide ohne Goldrand, Linien statt Abständen.
   Schulsystem: blauer Grund, weiße Schrift, weiße Trennstriche; gewählt = weiß mit blauer Schrift.
   Klassen: weiße Boxen, die drei Abi-Stufen (Kursstufe + Abi) mit goldenem Grund, alle Linien blau;
   gewählt = blau mit weißer Schrift. Die Klassen sind gedämpft, bis ein Schulsystem gewählt ist.
   HOEHE ist zugleich die Höhe der Modus-Knöpfe links – deren Unterkante schließt mit den Klassen ab. */
const HOEHE = 40;
const LINIE = 1.5;
const TASTE = { ...knopfBasis, height: HOEHE, padding: "0 2px", fontSize: 14, borderRadius: 0, border: "none", letterSpacing: "0.02em", display: "flex", alignItems: "center", justifyContent: "center" };

function SchulartWahl({ wert, setze }) {
  return (
    <div role="group" aria-label="Schulsystem wählen" className="qf-schulart"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", borderRadius: 10, overflow: "hidden", background: C.see,
        border: `${LINIE}px solid ${C.see}`, boxShadow: "0 4px 12px rgba(0,77,152,0.22)" }}>
      {SCHULARTEN.map((s, i) => {
        const an = s.id === wert;
        return (
          <button key={s.id} type="button" aria-pressed={an} onClick={() => setze(s.id)} title={s.zeile} data-kein-i18n className="qf-sa"
            style={{ ...TASTE, height: HOEHE - 2 * LINIE, fontSize: 14.5, fontWeight: 800, borderLeft: i ? `2px solid ${C.weiss}` : "none",
              background: an ? C.weiss : "transparent", color: an ? C.see : C.weiss }}>
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

function KlassenWahl({ schulart, wert, setze }) {
  const boxen = klassenBoxen(schulart || SCHULART_STANDARD);
  const aus = !schulart;
  return (
    <div role="group" aria-label={aus ? "Klasse wählen – zuerst Schulsystem wählen" : "Klasse wählen"}
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: LINIE, background: C.see, border: `${LINIE}px solid ${C.see}`,
        borderRadius: 10, overflow: "hidden", opacity: aus ? 0.4 : 1, transition: "opacity .15s ease" }}>
      {boxen.map((b) => {
        const an = !aus && b.id === wert;
        return (
          <button key={b.id} type="button" aria-pressed={an} disabled={aus} onClick={() => setze(b.id)} data-kein-i18n className={aus ? undefined : "qf-kl"}
            aria-label={b.abi ? "Abi-Training" : `Klasse ${b.label}`} title={aus ? "Zuerst G8, G9 oder GS9 wählen" : b.abi ? "Spezielles Abi-Training" : undefined}
            style={{ ...TASTE, cursor: aus ? "not-allowed" : "pointer",
              background: an ? C.see : b.gold ? "linear-gradient(180deg, #F5CB2E 0%, #EDBB00 100%)" : C.weiss, color: an ? C.weiss : C.seeTief }}>
            {b.label}
          </button>
        );
      })}
    </div>
  );
}

/* Kapitel im Buch: ein Feld, das zur Liste aufklappt. Jedes Kapitel hat rechts einen Pfeil:
   Er klappt die Unterthemen als schmale Balken direkt darunter auf – der Rest der Liste bleibt sichtbar. */
const Pfeil = ({ auf, farbe = C.see, gross = 18 }) => (
  <svg aria-hidden="true" width={gross} height={gross} viewBox="0 0 18 18" style={{ flexShrink: 0, transform: auf ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}>
    <path d="M4 7 L9 12 L14 7" fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
function KapitelWahl({ schulart, klasse, wert, teil, setze }) {
  const [auf, setAuf] = useState(!wert);
  const [offen, setOffen] = useState(() => (teil ? wert : null));   // Kapitel, dessen Unterthemen aufgeklappt sind
  const kapitel = kapitelFuer(schulart, klasse);
  const gewaehlt = kapitel.find((k) => k.id === wert) || null;
  const gewTeil = teil ? unterthema(teil) : null;
  const s = schulartVon(schulart);
  const waehle = (kId, tId) => { setze(kId, tId); setAuf(false); };
  return (
    <div style={{ marginTop: 14 }}>
      <button type="button" onClick={() => { setAuf(!auf); if (!auf) setOffen(wert && teil ? wert : offen); }} aria-expanded={auf}
        style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 50, padding: "8px 12px 8px 14px",
          border: `2px solid ${gewaehlt ? C.see : C.linie}`, background: gewaehlt && !auf ? C.himmel : C.weiss, color: C.tinte }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau }}>
            {klasse === "abi" ? <>Abi-Themen · {s?.name}</> : <>Thema im Buch · Klasse {klassenBoxen(schulart).find((b) => b.id === klasse)?.label} {s?.name}</>}
          </span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: gewaehlt ? C.tinte : C.see, marginTop: 2, lineHeight: 1.25 }}>
            {gewaehlt ? <><span data-kein-i18n>{roemisch(gewaehlt.nr)} · </span>{gewaehlt.titel}</> : (klasse === "abi" ? "Welches Abi-Thema willst du angehen?" : "In welchem Kapitel seid ihr gerade?")}
          </span>
          {gewaehlt && (
            <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.see, marginTop: 3, lineHeight: 1.3 }}>
              {gewTeil ? <>› {gewTeil.titel}</> : <span style={{ color: C.grau, fontWeight: 500 }}>Ganzes Kapitel</span>}
            </span>
          )}
        </span>
        <Pfeil auf={auf} />
      </button>
      {auf && (
        <div className="auftauchen" role="list" aria-label="Kapitel im Buch" style={{ marginTop: 6, display: "grid", gap: 5 }}>
          {kapitel.map((k) => {
            const an = k.id === wert && !teil;
            const teileAuf = offen === k.id;
            const teile = unterthemen(k.id);
            return (
              <div key={k.id} role="listitem" style={{ borderRadius: 11, border: `1.5px solid ${k.id === wert ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <button type="button" onClick={() => waehle(k.id, null)} aria-pressed={an}
                    style={{ ...knopfBasis, flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 44, padding: "7px 6px 7px 10px",
                      border: "none", borderRadius: 0, background: "transparent", color: C.tinte, fontWeight: 600 }}>
                    <span data-kein-i18n style={{ flexShrink: 0, width: 34, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: k.id === wert ? C.see : C.grau, letterSpacing: "0.04em" }}>{roemisch(k.nr)}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14.5, lineHeight: 1.25 }}>{k.titel}</span>
                      <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, marginTop: 1, lineHeight: 1.3 }}>{k.zeile}</span>
                    </span>
                  </button>
                  {teile.length > 0 && (
                    <button type="button" onClick={() => setOffen(teileAuf ? null : k.id)} aria-expanded={teileAuf}
                      aria-label={`${englisch() ? (teileAuf ? "Hide subtopics" : "Show subtopics") : teileAuf ? "Unterthemen zuklappen" : "Unterthemen zeigen"}: ${k.titel}`} title={teileAuf ? "Zuklappen" : "Unterthemen"}
                      style={{ ...knopfBasis, flexShrink: 0, width: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderLeft: `1px solid ${C.linie}`,
                        borderRadius: 0, background: teileAuf ? C.himmel : "transparent" }}>
                      <Pfeil auf={teileAuf} gross={16} />
                    </button>
                  )}
                </div>
                {teileAuf && (
                  <div className="auftauchen" style={{ display: "grid", gap: 4, padding: "2px 8px 8px 44px", background: teileAuf ? "#F6F9FE" : "transparent", borderTop: `1px solid ${C.linie}` }}>
                    {teile.map((u) => {
                      const uan = u.id === teil;
                      return (
                        <button key={u.id} type="button" onClick={() => waehle(k.id, u.id)} aria-pressed={uan} className="qf-balken"
                          style={{ ...knopfBasis, display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", minHeight: 34, padding: "5px 10px",
                            marginTop: 4, borderRadius: 8, fontSize: 13.5, fontWeight: uan ? 700 : 500,
                            border: `1px solid ${uan ? C.see : C.linie}`, background: uan ? C.see : C.weiss, color: uan ? C.weiss : C.tinte }}>
                          <span style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>{u.titel}</span>
                          {u.gen.length > 0 && <span aria-label="mit Übungen" title="Mit Übungsaufgaben" style={{ flexShrink: 0, width: 7, height: 7, borderRadius: 999, background: uan ? C.flaggold : C.flaggold }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <p style={{ margin: "4px 2px 0", fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5 }}>
            Reihenfolge wie im Lambacher Schweizer (Baden-Württemberg); je nach Schule kann sie abweichen. Pfeil rechts: Unterthemen, goldener Punkt: mit Übungsaufgaben.
          </p>
        </div>
      )}
    </div>
  );
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
function PlanAuswahl({ schulart, klasse, auswahl, setzeAuswahl }) {
  const [auf, setAuf] = useState(true);
  const kapitel = kapitelFuer(schulart, klasse);
  const [offen, setOffen] = useState(() => { const k = kapitel.find((x) => unterthemen(x.id).some((u) => auswahl.includes(u.id))); return k ? k.id : null; });
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
        <div className="auftauchen" role="list" aria-label="Themen für den Trainingsplan" style={{ marginTop: 6, display: "grid", gap: 5 }}>
          {kapitel.map((k) => {
            const z = zustand(k.id);
            const teileAuf = offen === k.id;
            const teile = unterthemen(k.id);
            const n = teile.filter((u) => auswahl.includes(u.id)).length;
            return (
              <div key={k.id} role="listitem" style={{ borderRadius: 11, border: `1.5px solid ${z ? C.see : C.linie}`, background: z === true ? C.himmel : C.weiss, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <button type="button" role="checkbox" aria-checked={z} onClick={() => kapitelUmschalten(k.id)}
                    aria-label={`${z === true ? "Ganzes Kapitel abwählen" : "Ganzes Kapitel anhaken"}: ${k.titel}`}
                    style={{ ...knopfBasis, flexShrink: 0, width: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRight: `1px solid ${C.linie}`, borderRadius: 0, background: "transparent" }}>
                    <Haekchen zustand={z} />
                  </button>
                  <button type="button" onClick={() => setOffen(teileAuf ? null : k.id)} aria-expanded={teileAuf}
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

/* Alle Hilfen der App zu einem Kapitel */
function Hilfen({ kapitelId, wz, gehe, schulart, klasse }) {
  let liste = mitFormelauswahl(hilfenFuer(kapitelId), kapitelId, schulart, klasse);
  // Werkzeug des gewählten Unterthemas zuerst
  const w = wz && WERKZEUGE[wz];
  if (w) liste = [{ art: "werkzeug", id: wz, name: w.name, zeile: w.zeile, ziel: w.ziel, etikett: w.etikett }, ...liste.filter((h) => h.id !== wz)];
  const t = THEMEN[kapitelId];
  if (!t) return null;
  const werkzeuge = liste.filter((h) => h.art === "werkzeug");
  const seiten = liste.filter((h) => h.art === "seite");
  const Zeile = ({ h, gold }) => (
    <button type="button" onClick={() => gehe(h.ziel)}
      style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 48, padding: "8px 10px 8px 12px",
        borderRadius: 12, border: `1.5px solid ${gold ? C.flaggold : C.linie}`, background: gold ? "#FFFBEA" : C.weiss, fontWeight: 600 }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, color: C.tinte, lineHeight: 1.25 }}>{h.name}</span>
        <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, marginTop: 1, lineHeight: 1.3 }}>{h.zeile}</span>
      </span>
      {h.etikett && <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.see, padding: "3px 7px", borderRadius: 999, background: C.himmel }}>{ETIKETT_NAME[h.etikett]}</span>}
      <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: gold ? "#8A6A00" : C.see }}>›</span>
    </button>
  );
  return (
    <div className="auftauchen" style={{ marginTop: 14 }}>
      <p style={{ ...KICKER, marginBottom: 8 }}>Dafür hilft dir in der App</p>
      {werkzeuge.length > 0 && (
        <div style={{ display: "grid", gap: 6 }}>
          {werkzeuge.map((h, i) => <Zeile key={h.id} h={h} gold={i === 0} />)}
        </div>
      )}
      {seiten.length > 0 && (
        <div style={{ display: "grid", gap: 6, marginTop: werkzeuge.length ? 10 : 0 }}>
          {seiten.map((h, i) => <Zeile key={h.id} h={h} gold={!werkzeuge.length && i === 0} />)}
        </div>
      )}
    </div>
  );
}

/* ---------- Die beiden Modus-Knöpfe: einzeilig, so hoch wie eine Klassen-Box ---------- */
const MODI = [
  { id: "sache", name: "Eine Sache üben" },
  { id: "plan", name: "Trainingsplan", stern: true },
];
const Stern = ({ farbe }) => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z" fill={farbe} />
  </svg>
);
function ModusWahl({ wert, setze }) {
  return (
    <div role="group" aria-label="Wie willst du trainieren?" className="qf-modi" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {MODI.map((m) => {
        const an = m.id === wert;
        return (
          <button key={m.id} type="button" aria-pressed={an} onClick={() => setze(m.id)} className="qf-taste"
            style={{ ...knopfBasis, height: HOEHE, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 10px", borderRadius: 10,
              border: `${LINIE}px solid ${C.see}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see, fontSize: 14, fontWeight: 800,
              whiteSpace: "nowrap", minWidth: 0, boxShadow: an ? "0 4px 12px rgba(0,77,152,0.25)" : "none" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
            {m.stern && <Stern farbe={C.flaggold} />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Eine Sache trainieren ---------- */
function SacheKarte({ q, gehe }) {
  const k = THEMEN[q.kapitel];
  const u = q.teil ? unterthema(q.teil) : null;
  const ids = sacheGeneratoren(q.kapitel, q.teil);
  const titel = u ? u.titel : k.titel;
  return (
    <div className="auftauchen" style={{ marginTop: 12, borderRadius: 14, padding: "14px 14px 12px", background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
      <p style={{ ...KICKER, color: C.flaggold }}>Eine Sache trainieren</p>
      <p style={{ fontSize: 17, fontWeight: 700, marginTop: 6, lineHeight: 1.25 }}>{titel}</p>
      <p style={{ fontSize: 12.5, color: "#C9D6EE", marginTop: 3, lineHeight: 1.45 }}>
        {ids.length ? `${ids.length} Aufgaben mit Hinweisen, Lösungsweg und Rückmeldung zu deinem Fehler` : "Noch keine Trainer-Aufgaben – unten üben die passenden Werkzeuge genau das."}
      </p>
      {ids.length > 0 && (
        <button type="button" onClick={() => gehe({ ansicht: "trainieren", kapitel: q.kapitel, teil: q.teil, schulart: q.schulart, klasse: q.klasse })}
          style={{ ...knopfBasis, width: "100%", minHeight: 46, marginTop: 12, border: "none", background: C.flaggold, color: C.seeTief, fontSize: 15, fontWeight: 800, boxShadow: "0 4px 14px rgba(237,187,0,0.3)" }}>
          Jetzt trainieren ›
        </button>
      )}
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

/* setzeStufe: stellt den Stufen-Schalter der Startseite (Mittel-/Oberstufe) mit ein.
   links: Überschrift der Kachel; darunter der Text. unten: kleiner Link zu „Mein Training“ (unter dem Kopf).
   Ab 600 px zwei Spalten (Raster-Bereiche): rechts oben der Schulsystem-Balken auf Höhe der Überschrift,
   darunter die Klassen; links unten die Modus-Knöpfe, deren Unterkante mit den Klassen abschließt.
   Darunter einspaltig: Überschrift, Text, Schulsystem, Klassen, Modus-Knöpfe. */
export function Quickfinder({ gehe, setzeStufe, links, unten }) {
  const [q, setQ] = useState(() => lesen() || { schulart: null, klasse: null, kapitel: null, teil: null, modus: modusLesen(), auswahl: auswahlOhneSchulart() });
  const aktiv = useAktiverPlan();
  const setze = (neu) => { setQ(neu); schreiben(neu); };
  const schulartSetzen = (id) => {
    if (id === q.schulart) return;
    // Die Klasse bleibt, wenn es sie im neuen Schulsystem gibt (z. B. 8 oder Abi); sonst neu wählen
    const bleibt = klassenBoxen(id).some((b) => b.id === q.klasse) ? q.klasse : null;
    setze({ ...q, schulart: id, klasse: bleibt, kapitel: null, teil: null });
  };
  const klasseSetzen = (id) => {
    setze({ ...q, klasse: id, kapitel: null, teil: null });
    const box = klassenBoxen(q.schulart).find((b) => b.id === id);
    if (box && setzeStufe) setzeStufe(stufeAusKlassenBox(box));
  };
  const plan = q.modus === "plan";
  const u = q.teil ? unterthema(q.teil) : null;
  const auswahl = q.auswahl || [];
  // Wechsel zu „Trainingsplan“: Ist noch nichts angehakt, wird das gerade gewählte Kapitel bzw. Unterthema übernommen
  const modusSetzen = (m) => {
    const vorbelegt = m === "plan" && !auswahl.length && q.kapitel ? (q.teil ? [q.teil] : unterthemen(q.kapitel).map((x) => x.id)) : auswahl;
    setze({ ...q, modus: m, auswahl: vorbelegt });
  };
  return (
    <>
      <style>{`.qf-kopf{display:grid;grid-template-columns:minmax(0,1fr);grid-template-areas:"kopf" "schul" "klass" "modi";row-gap:10px;padding:16px 16px 6px}
        .qf-kopf>.qf-a-kopf{grid-area:kopf;margin-bottom:4px}.qf-kopf>.qf-a-schul{grid-area:schul}.qf-kopf>.qf-a-klass{grid-area:klass}.qf-kopf>.qf-a-modi{grid-area:modi;margin-top:4px}
        @media (min-width:600px){.qf-kopf{grid-template-columns:minmax(0,1fr) 250px;grid-template-rows:auto 1fr auto;grid-template-areas:"kopf schul" "kopf klass" "modi klass";column-gap:22px;row-gap:12px}
          .qf-kopf>.qf-a-kopf{margin-bottom:0}.qf-kopf>.qf-a-klass,.qf-kopf>.qf-a-modi{align-self:end;margin-top:0}}
        @media (min-width:840px){.qf-kopf{grid-template-columns:minmax(0,1fr) 270px;padding:18px 18px 6px 20px;column-gap:28px}}
        @media (hover:hover){.qf-taste:hover{transform:translateY(-1px)}.qf-balken:hover{border-color:${C.see} !important}
          .qf-sa[aria-pressed="false"]:hover{background:rgba(255,255,255,0.14) !important}
          .qf-kl[aria-pressed="false"]:hover{filter:brightness(0.95)}}
        .qf-unten{padding:0 16px}@media (min-width:840px){.qf-unten{padding:0 18px 0 20px}}
        .qf-taste{transition:transform .12s ease, background .12s ease, color .12s ease}`}</style>
      <div className="qf-kopf">
        <div className="qf-a-kopf" style={{ minWidth: 0 }}>
          {links}
          <p style={{ margin: "10px 0 0", fontSize: 13.5, fontWeight: 300, lineHeight: 1.55, color: C.grau }}>
            {plan
              ? "Wähle deine Klasse und hake an, was in den Plan soll – ganze Kapitel, einzelne Unterthemen, auch mehrere Kapitel. Ich ergänze Warm-up, Basis-Check und Wiederholungen nach Ebbinghaus."
              : "Wähle dein Schulsystem und deine Klasse, dann das Kapitel – oder mit dem Pfeil genau das Unterthema, das du üben willst."}
          </p>
        </div>
        <div className="qf-a-schul"><SchulartWahl wert={q.schulart} setze={schulartSetzen} /></div>
        <div className="qf-a-klass"><KlassenWahl schulart={q.schulart} wert={q.klasse} setze={klasseSetzen} /></div>
        <div className="qf-a-modi"><ModusWahl wert={q.modus} setze={modusSetzen} /></div>
      </div>
      {unten && <div className="qf-unten" style={{ display: "flex" }}>{unten}</div>}
      {(q.schulart && q.klasse) || (plan && aktiv) ? (
        <div style={{ padding: "0 16px 16px" }}>
          {plan && aktiv && <AktiverPlan v={aktiv} gehe={gehe} />}
          {q.schulart && q.klasse && (
            <>
              {!plan && <KapitelWahl key={q.schulart + q.klasse} schulart={q.schulart} klasse={q.klasse} wert={q.kapitel} teil={q.teil} setze={(id, teil) => setze({ ...q, kapitel: id, teil })} />}
              {plan && <PlanAuswahl key={q.schulart + q.klasse} schulart={q.schulart} klasse={q.klasse} auswahl={auswahl} setzeAuswahl={(a) => setze({ ...q, auswahl: a })} />}
              {q.kapitel && !plan && <SacheKarte q={q} gehe={gehe} />}
              {plan && auswahl.length > 0 && <PlanKarte q={q} auswahl={auswahl} gehe={gehe} aktiv={aktiv} />}
              {q.kapitel && !plan && <Hilfen kapitelId={q.kapitel} wz={u && u.wz} gehe={gehe} schulart={q.schulart} klasse={q.klasse} />}
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
