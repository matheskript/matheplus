/* ======================================================================
   QUICKFINDER – Status quo in der Kachel „Mein Training“ auf der Startseite
   Schulart (G8 · G9 · GMS) → Klasse (acht Boxen, Kursstufe gold) →
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
import { planErstellen, planStand, planTage, tagName } from "./trainingsplan.js";
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
    return { schulart: v.schulart, klasse: box, kapitel, teil, modus: v.modus === "plan" ? "plan" : "sache" };
  } catch { return null; }
}
function schreiben(v) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(v)); } catch { /* privat */ } }
export function quickfinderLesen() { return lesen(); }
/* Modus vom Rücksprung (funcKapitelTraining: modusVormerken) – liegt ggf. ohne Schulart im Speicher */
function modusLesen() { try { const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null"); return v && v.modus === "plan" ? "plan" : "sache"; } catch { return "sache"; } }

const KICKER = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: 0 };
const knopfBasis = { fontFamily: "inherit", cursor: "pointer", borderRadius: 12, fontWeight: 700, lineHeight: 1.15, transition: "background .12s ease, color .12s ease, box-shadow .12s ease" };

/* Panel rechts oben, schmal: 3 Spalten × 4 Zeilen.
   Zeile 1 (goldener Grund, dunkelblaue Tasten): Schulsystem G8 · G9 · GS9.
   Zeilen 2–4 (dunkelblauer Grund, goldene Tasten): Klassen, als letzte Taste „Abi“.
   Gewählt = weiß. Die Klassen sind gedämpft, bis ein Schulsystem gewählt ist. */
const TASTE = { ...knopfBasis, minHeight: 32, padding: "2px", fontSize: 13.5, borderRadius: 8, letterSpacing: "0.02em" };
const AN = { background: C.weiss, color: C.seeTief, borderColor: C.weiss, boxShadow: "0 0 0 2px rgba(255,255,255,0.35), 0 3px 8px rgba(8,23,59,0.3)" };

function SchulartWahl({ wert, setze }) {
  return (
    <div role="group" aria-label="Schulsystem wählen" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 5,
      padding: 6, background: "linear-gradient(180deg, #F5CB2E 0%, #EDBB00 100%)" }}>
      {SCHULARTEN.map((s) => {
        const an = s.id === wert;
        return (
          <button key={s.id} type="button" aria-pressed={an} onClick={() => setze(s.id)} title={s.zeile} data-kein-i18n className="qf-taste"
            style={{ ...TASTE, border: `2px solid ${C.seeTief}`, background: C.seeTief, color: C.weiss, ...(an ? { ...AN, borderColor: C.seeTief, boxShadow: "0 3px 8px rgba(8,23,59,0.3)" } : {}) }}>
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
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 5, padding: 6, background: C.seeTief }}>
      {boxen.map((b) => {
        const an = !aus && b.id === wert;
        return (
          <button key={b.id} type="button" aria-pressed={an} disabled={aus} onClick={() => setze(b.id)} data-kein-i18n className={aus ? undefined : "qf-taste"}
            aria-label={b.abi ? "Abi-Training" : `Klasse ${b.label}`} title={b.abi ? "Spezielles Abi-Training" : undefined}
            style={{ ...TASTE, cursor: aus ? "not-allowed" : "pointer", border: `2px solid ${C.flaggold}`,
              background: "linear-gradient(180deg, #F5CB2E 0%, #EDBB00 100%)", color: C.seeTief, opacity: aus ? 0.32 : 1,
              ...(an ? AN : {}) }}>
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

/* ---------- Die beiden Modus-Knöpfe (statt „Mein Training öffnen“) ---------- */
const MODI = [
  { id: "sache", name: "Eine Sache trainieren", zeile: "Ein Thema gezielt üben" },
  { id: "plan", name: "Trainingsplan erstellen", zeile: "Mit Basis, Warm-up und Wiederholung" },
];
function ModusWahl({ wert, setze }) {
  return (
    <div role="group" aria-label="Wie willst du trainieren?" className="qf-modi" style={{ display: "grid", gap: 6, marginTop: 12 }}>
      {MODI.map((m) => {
        const an = m.id === wert;
        return (
          <button key={m.id} type="button" aria-pressed={an} onClick={() => setze(m.id)} className="qf-taste"
            style={{ ...knopfBasis, display: "flex", alignItems: "center", gap: 9, textAlign: "left", minHeight: 46, padding: "7px 11px", borderRadius: 12,
              border: `2px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see,
              boxShadow: an ? "0 4px 12px rgba(0,77,152,0.25)" : "none" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 16, height: 16, borderRadius: 999, border: `2px solid ${an ? C.flaggold : C.linie}`, background: an ? C.flaggold : "transparent",
              boxShadow: an ? `inset 0 0 0 3px ${C.see}` : "none" }} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{m.name}</span>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 500, opacity: 0.8, marginTop: 1, lineHeight: 1.25 }}>{m.zeile}</span>
            </span>
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
function PlanKarte({ q, gehe, aktiv }) {
  const heute = heuteText();
  const [termin, setTermin] = useState("");
  const plan = useMemo(() => planErstellen({ kapitel: q.kapitel, teil: q.teil, schulart: q.schulart, klasse: q.klasse, heute, termin: termin || null }),
    [q.kapitel, q.teil, q.schulart, q.klasse, heute, termin]);
  if (!plan) return null;
  const tage = planTage(plan);
  const speichern = () => {
    if (aktiv && !window.confirm(`Dein aktueller Plan „${aktiv.plan.titel}“ wird ersetzt. Weiter?`)) return;
    planSpeichern(plan);
    gehe({ ansicht: "trainingsplan" });
  };
  return (
    <div className="auftauchen" style={{ marginTop: 12, borderRadius: 14, border: `2px solid ${C.see}`, background: C.weiss, overflow: "hidden" }}>
      <div style={{ padding: "13px 14px 12px", background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
        <p style={{ ...KICKER, color: C.flaggold }}>Dein Trainingsplan</p>
        <p style={{ fontSize: 17, fontWeight: 700, marginTop: 6, lineHeight: 1.25 }}>{plan.titel}</p>
        <p style={{ fontSize: 12.5, color: "#C9D6EE", marginTop: 3, lineHeight: 1.45 }}>Erst das Fundament prüfen, dann dein Thema – und danach Wiederholungen nach Ebbinghaus, damit es bis zur Arbeit sitzt.</p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10, fontSize: 12.5, fontWeight: 700, color: C.weiss }}>
          Klassenarbeit am
          <input type="date" value={termin} min={heute} onChange={(e) => setTermin(e.target.value)} aria-label="Datum der Klassenarbeit (optional)"
            style={{ fontFamily: "inherit", fontSize: 14, padding: "5px 8px", borderRadius: 8, border: "none", minHeight: 34, color: C.tinte, background: C.weiss }} />
          {!termin && <span style={{ fontWeight: 500, color: "#C9D6EE" }}>(optional)</span>}
          {termin && <button type="button" onClick={() => setTermin("")} style={{ ...knopfBasis, border: "none", background: "none", color: C.flaggold, fontSize: 12.5, padding: 0 }}>entfernen</button>}
        </label>
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: "6px 12px 4px" }}>
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
          {termin
            ? "Basis-Check: Grundlagen aus früheren Klassen. Zwischenschritte: was du direkt dafür brauchst. Wiederholen: nach Ebbinghaus, vor der Arbeit verdichtet."
            : "Basis-Check: Grundlagen aus früheren Klassen. Zwischenschritte: was du direkt dafür brauchst. Wiederholen: 1, 3, 7, 14 und 30 Tage nach dem Kerntraining."}
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
   links: Überschrift der Kachel „Mein Training“; darunter Text und die beiden Modus-Knöpfe. unten: kleiner Link zu „Mein Training“.
   Rechts sitzt das dunkelblaue Auswahl-Panel. */
export function Quickfinder({ gehe, setzeStufe, links, unten }) {
  const [q, setQ] = useState(() => lesen() || { schulart: null, klasse: null, kapitel: null, teil: null, modus: modusLesen() });
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
  return (
    <>
      <style>{`.qf-kopf{display:grid;grid-template-columns:1fr;gap:14px;padding:16px}
        .qf-panel{width:100%;max-width:300px;justify-self:end}
        @media (min-width:440px){.qf-kopf{grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:stretch}.qf-panel{width:min(250px,48vw)}}
        @media (min-width:840px){.qf-kopf{padding:18px 18px 18px 20px;gap:24px}.qf-panel{width:270px}}
        @media (min-width:600px){.qf-modi{grid-template-columns:1fr 1fr}}
        @media (hover:hover){.qf-taste:hover{transform:translateY(-1px)}.qf-balken:hover{border-color:${C.see} !important}}
        .qf-taste{transition:transform .12s ease, background .12s ease, color .12s ease}`}</style>
      <div className="qf-kopf">
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          {links}
          <p style={{ margin: "10px 0 0", fontSize: 13.5, fontWeight: 300, lineHeight: 1.55, color: C.grau }}>
            {plan
              ? "Wähle Klasse und Thema. Ich baue dir einen Plan: Warm-up, Basis-Check, Zwischenschritte, dein Thema und Wiederholungen nach Ebbinghaus."
              : "Wähle dein Schulsystem und deine Klasse, dann das Kapitel – oder mit dem Pfeil genau das Unterthema, das du üben willst."}
          </p>
          <ModusWahl wert={q.modus} setze={(m) => setze({ ...q, modus: m })} />
          {unten}
        </div>
        <div className="qf-panel" style={{ border: `2px solid ${C.seeTief}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 5px 16px rgba(0,40,100,0.22)", alignSelf: "start" }}>
          <SchulartWahl wert={q.schulart} setze={schulartSetzen} />
          <KlassenWahl schulart={q.schulart} wert={q.klasse} setze={klasseSetzen} />
        </div>
      </div>
      {(q.schulart && q.klasse) || (plan && aktiv) ? (
        <div style={{ padding: "0 16px 16px" }}>
          {plan && aktiv && <AktiverPlan v={aktiv} gehe={gehe} />}
          {q.schulart && q.klasse && (
            <>
              <KapitelWahl key={q.schulart + q.klasse} schulart={q.schulart} klasse={q.klasse} wert={q.kapitel} teil={q.teil} setze={(id, teil) => setze({ ...q, kapitel: id, teil })} />
              {q.kapitel && !plan && <SacheKarte q={q} gehe={gehe} />}
              {q.kapitel && plan && <PlanKarte key={q.kapitel + (q.teil || "")} q={q} gehe={gehe} aktiv={aktiv} />}
              {q.kapitel && !plan && <Hilfen kapitelId={q.kapitel} wz={u && u.wz} gehe={gehe} schulart={q.schulart} klasse={q.klasse} />}
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
