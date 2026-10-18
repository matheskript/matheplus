/* ======================================================================
   KAPITEL-TRAINING – Ziel der beiden Knöpfe in „Dein Training startet hier.“
     · Eine Sache trainieren: fünf Aufgaben genau zu einem Kapitel oder Unterthema
     · Trainingsplan: Warm-up → Basis-Check → Zwischenschritte → Kern → Wiederholen
   Plan-Logik: trainingsplan.js (rein). Aufgaben: unterthemen.js → trainingDaten.js.
   Ergebnisse laufen über ebbBuchen in den Ebbinghaus-Wiederholungsplan.
   Der aktive Plan liegt im Browser (localStorage matheplus-trainingsplan).
   ====================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { Aufgabenlauf, ebbBuchen } from "./funcTraining.jsx";
import { GrosserKnopf, karte, kicker } from "./ui2.jsx";
import { THEMEN as KAPITEL, hilfenFuer } from "./schulbuch.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { unterthema, unterthemen, kapitelGeneratoren } from "./unterthemen.js";
import { GENERATOREN, neueAufgabe } from "./trainingDaten.js";
import { PHASEN, einheitAufgabenIds, planStand, planTage, tagName, tagText } from "./trainingsplan.js";

import { springe } from "./sprung.js";
/* ---------- Speicher ---------- */
const SCHLUESSEL = "matheplus-trainingsplan";
const EREIGNIS = "mm-trainingsplan";
function lesen() {
  try {
    const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
    if (!v || !v.plan || !Array.isArray(v.plan.einheiten)) return null;
    return { plan: v.plan, erledigt: v.erledigt && typeof v.erledigt === "object" ? v.erledigt : {} };
  } catch { return null; }
}
function schreiben(v) {
  try { if (v) localStorage.setItem(SCHLUESSEL, JSON.stringify(v)); else localStorage.removeItem(SCHLUESSEL); } catch { /* privat */ }
  try { window.dispatchEvent(new Event(EREIGNIS)); } catch { /* egal */ }
}
export const planSpeichern = (plan) => schreiben({ plan, erledigt: {} });
export const planLoeschen = () => schreiben(null);
function erledigtSetzen(id, wert) {
  const v = lesen();
  if (!v) return;
  if (wert) v.erledigt[id] = wert; else delete v.erledigt[id];
  schreiben(v);
}
export function useAktiverPlan() {
  const [v, setV] = useState(lesen);
  useEffect(() => {
    const f = () => setV(lesen());
    window.addEventListener(EREIGNIS, f); window.addEventListener("storage", f);
    return () => { window.removeEventListener(EREIGNIS, f); window.removeEventListener("storage", f); };
  }, []);
  return v;
}
export const heuteText = () => tagText(new Date());
/* Beim Rücksprung auf die Startseite den Quickfinder gleich im richtigen Modus öffnen */
export function modusVormerken(modus, auswahl = null) {
  try {
    const v = JSON.parse(localStorage.getItem("matheplus-quickfinder") || "{}") || {};
    localStorage.setItem("matheplus-quickfinder", JSON.stringify({ ...v, modus, ...(auswahl ? { auswahl } : {}) }));
  } catch { /* privat */ }
}

/* ---------- Aufgaben ---------- */
const afb = (id) => (GENERATOREN.find((g) => g.id === id) || { afb: 2 }).afb;
/* „Eine Sache trainieren“: fünf Aufgaben, jeder Generator mindestens einmal, leichte zuerst */
export function sacheGeneratoren(kapitel, teil, anzahl = 5) {
  const u = teil ? unterthema(teil) : null;
  const gen = [...(u ? u.gen : kapitelGeneratoren(kapitel))].sort((a, b) => afb(a) - afb(b));
  if (!gen.length) return [];
  const ids = [];
  for (let i = 0; i < Math.max(anzahl, Math.min(gen.length, 8)); i++) ids.push(gen[i % gen.length]);
  return ids.sort((a, b) => afb(a) - afb(b));
}
const erzeugen = (ids) => ids.map((id) => neueAufgabe(id));

/* ---------- Bausteine ---------- */
const PHASE_FARBE = {
  warmup: ["#FFF4D6", "#7A5A00"], basis: [C.himmel, C.see], zwischen: [C.himmel, C.see], kern: ["#FCE8EE", C.gruenDunkel],
  wiederholen: ["#E6F6EF", "#0F7A4D"], generalprobe: [C.seeTief, C.weiss],
};
export function PhasenPille({ phase }) {
  const [bg, fg] = PHASE_FARBE[phase] || [C.himmel, C.see];
  return <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: fg, background: bg, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{PHASEN[phase].name}</span>;
}
const Haken = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#0F7A4D" /><path d="M5 9.4 L7.8 12 L13 6.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const linkKnopf = { fontFamily: "inherit", cursor: "pointer", border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, borderRadius: 10, padding: "7px 11px", fontSize: 13, fontWeight: 700, minHeight: 38 };

function Kopf({ titel, unter }) {
  return (
    <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
      <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
        <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(26px, 7.6vw, 36px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>{titel}</h1>
        <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
        <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>{unter}</p>
      </div>
      <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
    </div>
  );
}
const Rahmen = ({ children }) => <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 6 }}>{children}</div>;
const Zurueck = ({ onClick, children = "‹ Zurück zur Startseite" }) => (
  <button type="button" onClick={onClick} style={{ border: "none", background: "none", padding: "6px 0", marginBottom: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: C.see }}>{children}</button>
);
function Hilfsziele({ ziele, gehe }) {
  if (!ziele || !ziele.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {ziele.map((z) => <button key={z.name} type="button" onClick={() => gehe(z.ziel)} style={linkKnopf}>{z.name} ›</button>)}
    </div>
  );
}

/* Ergebnis eines Laufs */
function Auswertung({ zs, children }) {
  const n = zs.length, ok = zs.filter((z) => z.ok === true).length, ohne = zs.filter((z) => z.ok === true && !z.hilfe).length;
  const text = ok === n ? "Alles richtig – stark." : ok >= n * 0.6 ? "Gut dabei. Die offenen Stellen kommen in deinen Wiederholungen wieder." : "Noch wacklig – genau dafür ist das Training da. Schau dir die Lösungswege an und mach gleich noch eine Runde.";
  return (
    <div style={{ ...karte, borderTop: `4px solid ${C.flaggold}` }}>
      <p style={kicker}>Auswertung</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: C.tinte, letterSpacing: "-0.02em" }}>{ok} von {n} richtig</p>
      <p style={{ fontSize: 13.5, color: C.grau, marginTop: 4 }}>{ohne} davon ganz ohne Hilfe</p>
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginTop: 10 }}>{text}</p>
      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.55, marginTop: 8 }}>Was du selbstständig gelöst hast, plant die App nach Ebbinghaus zum Wiederholen ein.</p>
      {children}
    </div>
  );
}

/* ======================================================================
   Eine Sache trainieren
   ====================================================================== */
function SacheTraining({ ziel, gehe }) {
  const k = KAPITEL[ziel.kapitel];
  const u = ziel.teil ? unterthema(ziel.teil) : null;
  const ids = useMemo(() => sacheGeneratoren(ziel.kapitel, ziel.teil), [ziel.kapitel, ziel.teil]);
  const [runde, setRunde] = useState(0);
  const [lauf, setLauf] = useState(() => (ids.length ? erzeugen(ids) : null));
  const [ende, setEnde] = useState(null);
  const neu = () => { setLauf(erzeugen(ids)); setEnde(null); setRunde((r) => r + 1); springe("kapiteltraining", () => window.scrollTo(0, 0)); };
  const titel = u ? u.titel : k.titel;
  const geschwister = unterthemen(ziel.kapitel);
  return (
    <>
      <Kopf titel={titel} unter={u ? `${k.titel} · Unterthema ${u.nr} von ${geschwister.length}` : `${k.zeile}`} />
      <Rahmen>
        <Zurueck onClick={() => gehe({ ansicht: "start" })} />
        {!ids.length ? (
          <div style={karte}>
            <p style={kicker}>Üben mit den Werkzeugen</p>
            <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6 }}>Zu „{titel}“ gibt es im Trainer noch keine Aufgaben mit automatischer Rückmeldung. Hier übst du mit den passenden Werkzeugen und Formeln:</p>
            <Hilfsziele gehe={gehe} ziele={hilfsZiele(ziel)} />
          </div>
        ) : ende ? (
          <Auswertung zs={ende}>
            <GrosserKnopf onClick={neu}>Noch eine Runde</GrosserKnopf>
            <GrosserKnopf ghost onClick={() => (modusVormerken("plan", ziel.teil ? [ziel.teil] : unterthemen(ziel.kapitel).map((x) => x.id)), gehe({ ansicht: "start" }))}>Trainingsplan dazu erstellen</GrosserKnopf>
            <Hilfsziele gehe={gehe} ziele={hilfsZiele(ziel)} />
          </Auswertung>
        ) : (
          <Aufgabenlauf key={runde} aufgaben={lauf} quelle="kapitel" endeText="Zur Auswertung" onWeiter={(a, z) => ebbBuchen([a], [z], "kapitel")} onEnde={(zs) => { setEnde(zs); springe("kapiteltraining", () => window.scrollTo(0, 0)); }} />
        )}
      </Rahmen>
    </>
  );
}
function hilfsZiele({ kapitel, teil, schulart, klasse }) {
  const u = teil ? unterthema(teil) : null;
  const liste = [];
  if (u && u.wz && WERKZEUGE[u.wz]) liste.push({ name: WERKZEUGE[u.wz].name, ziel: WERKZEUGE[u.wz].ziel });
  for (const h of hilfenFuer(kapitel).slice(0, 3)) if (!liste.some((x) => x.name === h.name)) liste.push({ name: h.name, ziel: h.ziel });
  liste.push({ name: "Formeln zum Kapitel", ziel: { ansicht: "kapitelformeln", kapitel, schulart, klasse } });
  return liste;
}

/* ======================================================================
   Trainingsplan
   ====================================================================== */
function PlanAnsicht({ gehe }) {
  const v = useAktiverPlan();
  const [laeuft, setLaeuft] = useState(null);   // { e, aufgaben }
  const [ende, setEnde] = useState(null);       // { e, zs }
  const heute = heuteText();
  if (!v) return (
    <>
      <Kopf titel="Dein Trainingsplan" unter="Noch kein Plan angelegt." />
      <Rahmen>
        <Zurueck onClick={() => gehe({ ansicht: "start" })} />
        <div style={karte}>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6 }}>Wähle auf der Startseite Schulsystem und Klasse, öffne dein Kapitel und tippe auf „Trainingsplan zu diesem Kapitel“.</p>
          <GrosserKnopf onClick={() => (modusVormerken("plan"), gehe({ ansicht: "start" }))}>Plan erstellen</GrosserKnopf>
        </div>
      </Rahmen>
    </>
  );
  const { plan, erledigt } = v;
  const stand = planStand(plan, erledigt, heute);
  const starten = (e) => { setLaeuft({ e, aufgaben: erzeugen(einheitAufgabenIds(e)) }); setEnde(null); springe("kapiteltraining", () => window.scrollTo(0, 0)); };
  const titel = plan.teil ? plan.titel : plan.einheiten.filter((e) => e.phase === "kern").length > 1 ? "Dein Trainingsplan" : plan.kapitelTitel;
  const unter = plan.termin ? `Bis zur Klassenarbeit am ${tagName(plan.termin, heute) === "morgen" ? "morgen" : plan.termin.split("-").reverse().join(".")} – Schritt für Schritt.` : "Warm-up, Basis-Check, Zwischenschritte, Kerntraining und Wiederholungen nach Ebbinghaus.";
  if (laeuft) return (
    <>
      <Kopf titel={laeuft.e.titel} unter={`${PHASEN[laeuft.e.phase].name} · ${titel}`} />
      <Rahmen>
        <Zurueck onClick={() => setLaeuft(null)}>‹ Zurück zum Plan</Zurueck>
        <Aufgabenlauf aufgaben={laeuft.aufgaben} quelle="trainingsplan" endeText="Einheit abschließen" onWeiter={(a, z) => ebbBuchen([a], [z], "trainingsplan")}
          onEnde={(zs) => { erledigtSetzen(laeuft.e.id, { zeit: Date.now(), richtig: zs.filter((z) => z.ok === true).length, n: zs.length }); setEnde({ e: laeuft.e, zs }); setLaeuft(null); springe("kapiteltraining", () => window.scrollTo(0, 0)); }} />
      </Rahmen>
    </>
  );
  const tage = planTage(plan);
  const anteil = stand.gesamt ? stand.fertig / stand.gesamt : 0;
  return (
    <>
      <Kopf titel={titel} unter={unter} />
      <Rahmen>
        <Zurueck onClick={() => gehe({ ansicht: "start" })} />
        {ende && (
          <div style={{ marginBottom: 14 }}>
            <Auswertung zs={ende.zs}>
              <GrosserKnopf ghost onClick={() => setEnde(null)}>Weiter im Plan</GrosserKnopf>
            </Auswertung>
          </div>
        )}
        <div style={{ ...karte, borderTop: `4px solid ${C.flaggold}` }}>
          <p style={kicker}>{plan.kapitelTitel}{plan.teil ? ` · ${plan.titel}` : ""}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: C.tinte, letterSpacing: "-0.02em" }}>{stand.fertig} von {stand.gesamt}</span>
            <span style={{ fontSize: 13.5, color: C.grau }}>Einheiten erledigt</span>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={stand.gesamt} aria-valuenow={stand.fertig} style={{ height: 8, borderRadius: 999, background: C.himmel, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: `${Math.round(anteil * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />
          </div>
          {stand.naechste && (
            <GrosserKnopf gold onClick={() => (stand.naechste.gen.length ? starten(stand.naechste) : springe("anker", () => document.getElementById(`einheit-${stand.naechste.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })))}>
              {stand.faellig ? `Jetzt: ${stand.naechste.titel}` : `Als Nächstes (${tagName(stand.naechste.datum, heute, englisch())}): ${stand.naechste.titel}`}
            </GrosserKnopf>
          )}
          {!stand.naechste && <p style={{ fontSize: 14.5, color: "#0F7A4D", fontWeight: 700, marginTop: 10 }}>Plan komplett geschafft.</p>}
        </div>

        {tage.map((t) => (
          <section key={t.datum} style={{ marginTop: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: t.datum === heute ? C.gruenDunkel : C.grau, margin: "0 2px 8px" }}>
              {tagName(t.datum, heute, englisch())}{t.datum < heute ? " · nachholen" : ""}
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {t.einheiten.map((e) => {
                const fertig = erledigt[e.id];
                return (
                  <div key={e.id} id={`einheit-${e.id}`} style={{ ...karte, padding: "12px 14px", opacity: fertig ? 0.72 : 1, border: t.datum <= heute && !fertig ? `1.5px solid ${C.flaggold}` : "1.5px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <PhasenPille phase={e.phase} />
                      {fertig && <Haken />}
                      {fertig && fertig.n ? <span style={{ fontSize: 12.5, color: C.grau }}>{fertig.richtig} von {fertig.n} richtig</span> : null}
                    </div>
                    <p style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, marginTop: 6, lineHeight: 1.3 }}>{e.titel}</p>
                    <p style={{ fontSize: 12.5, color: C.grau, marginTop: 2, lineHeight: 1.4 }}>{e.zeile}{e.anzahl ? ` · ${e.anzahl} Aufgaben` : ""}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {e.gen.length > 0 && (
                        <button type="button" onClick={() => starten(e)} style={{ ...linkKnopf, background: fertig ? C.weiss : C.see, color: fertig ? C.see : C.weiss, borderColor: C.see }}>
                          {fertig ? "Nochmal" : "Starten"}
                        </button>
                      )}
                      {e.ziele.map((z) => <button key={z.name} type="button" onClick={() => gehe(z.ziel)} style={linkKnopf}>{z.name} ›</button>)}
                      {!e.gen.length && (
                        <button type="button" onClick={() => erledigtSetzen(e.id, fertig ? null : { zeit: Date.now() })} style={{ ...linkKnopf, color: fertig ? C.grau : "#0F7A4D" }}>
                          {fertig ? "Doch noch offen" : "Erledigt ✓"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
          <button type="button" onClick={() => gehe({ ansicht: "ebbinghaus" })} style={linkKnopf}>Alle Wiederholungen (Ebbinghaus) ›</button>
          <button type="button" onClick={() => { if (window.confirm("Diesen Trainingsplan löschen?")) { planLoeschen(); modusVormerken("plan"); gehe({ ansicht: "start" }); } }} style={{ ...linkKnopf, color: C.gruenDunkel }}>Plan löschen</button>
        </div>
      </Rahmen>
    </>
  );
}

/* ansicht „trainieren“ (Eine Sache trainieren) oder „trainingsplan“.
   ziel: { kapitel, teil, schulart, klasse } – fehlt es (Direktlink /trainieren), gilt die Auswahl im Quickfinder. */
function gespeicherteAuswahl() {
  try { const v = JSON.parse(localStorage.getItem("matheplus-quickfinder") || "null"); return v && v.kapitel ? v : null; } catch { return null; }
}
export function KapitelTrainingSeite({ ansicht, ziel, gehe }) {
  if (ansicht === "trainieren") {
    const z = ziel && KAPITEL[ziel.kapitel] ? ziel : gespeicherteAuswahl();
    if (z && KAPITEL[z.kapitel]) return <SacheTraining key={`${z.kapitel}-${z.teil || ""}`} ziel={{ ...z, teil: z.teil && unterthema(z.teil) ? z.teil : null }} gehe={gehe} />;
    return (
      <>
        <Kopf titel="Eine Sache trainieren" unter="Wähle auf der Startseite Klasse und Kapitel – dann geht es los." />
        <Rahmen>
          <div style={karte}><GrosserKnopf onClick={() => (modusVormerken("sache"), gehe({ ansicht: "start" }))}>Zur Auswahl</GrosserKnopf></div>
        </Rahmen>
      </>
    );
  }
  return <PlanAnsicht gehe={gehe} />;
}
