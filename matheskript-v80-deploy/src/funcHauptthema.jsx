/* ======================================================================
   HAUPTTHEMA – Oberfläche in „Dein Training startet hier.“ (Startseite)
     · HauptthemaWahl:    Box im aufgeklappten Kapitel – „Als mein Hauptthema wählen“ mit Klassenarbeits-Datum
     · HauptthemaAnsicht: das gewählte Kapitel ganz oben – Countdown, „Heute dran“, Unterthemen mit Stand,
                          alle Werkzeuge, Vorwissen, passender Kurs; nach der Arbeit: Note und nächstes Kapitel
     · HauptthemaLeiste:  kompakte Zeile, solange die Kapitelliste offen ist („Thema wechseln“)
   Logik: hauptthema.js (rein). Speicher: funcQuickfinder.jsx (matheplus-quickfinder → haupt).
   Plan: trainingsplan.js / funcKapitelTraining.jsx (der Plan zum Hauptthema ist ein ganz normaler Trainingsplan).
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { useLern } from "./func6.jsx";
import { normiereEbb } from "./ebbinghaus.js";
import { THEMEN, kapitelFuer, roemisch } from "./schulbuch.js";
import { PHASEN, planStand, tagName } from "./trainingsplan.js";
import { PhasenPille, heuteText } from "./funcKapitelTraining.jsx";
import { STAND, countdown, datumLang, kapitelStand, naechstesKapitel, standZeile, vorwissenStand } from "./hauptthema.js";

/* Titel einer Plan-Einheit ohne Dopplung zur Phasen-Pille („Warm-up“ · „Warm-up“) */
const einheitTitel = (e) => (PHASEN[e.phase] && e.titel === PHASEN[e.phase].name && e.zeile ? e.zeile : e.titel);
const knopf = { fontFamily: "inherit", cursor: "pointer", lineHeight: 1.15, transition: "background .12s ease, border-color .12s ease, filter .12s ease" };
const KICKER = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 };
const GOLD_DUNKEL = "#7A5800";
const NACHT_TEXT = "#C9D6EE";
const randKnopf = { ...knopf, fontSize: 12, fontWeight: 700, color: C.weiss, background: "transparent", border: "1px solid rgba(255,255,255,0.38)", borderRadius: 999, padding: "6px 12px", minHeight: 32 };

/* Lernstand (Ebbinghaus) als normiertes Objekt – ändert sich bei jeder gebuchten Aufgabe */
function useLernstand() {
  const L = useLern();
  const roh = L && L.training ? L.training.ebbinghaus : null;
  return useMemo(() => normiereEbb(roh), [roh]);
}

function DatumFeld({ wert, setze, hell = true, label = "Klassenarbeit am" }) {
  const heute = heuteText();
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12.5, fontWeight: 700, color: hell ? C.weiss : C.tinte }}>
      <span style={{ flexShrink: 0 }}>{label}</span>
      <input type="date" value={wert} min={heute} onChange={(e) => setze(e.target.value)} aria-label="Datum der Klassenarbeit (optional)"
        style={{ fontFamily: "inherit", flex: "1 1 140px", minWidth: 0, fontSize: 14, padding: "5px 8px", borderRadius: 8, border: hell ? "none" : `1.5px solid ${C.linie}`, minHeight: 36, color: C.tinte, background: C.weiss }} />
    </label>
  );
}

/* ---------- Box im aufgeklappten Kapitel ---------- */
export function HauptthemaWahl({ titel, ersetzt, waehle }) {
  const [termin, setTermin] = useState("");
  return (
    <div className="auftauchen" style={{ borderRadius: 12, background: C.seeTief, color: C.weiss, padding: 12, display: "grid", gap: 8 }}>
      <p style={{ ...KICKER, color: C.flaggold }}>Dein aktuelles Thema?</p>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: NACHT_TEXT }}>
        {ersetzt
          ? <>Mach „{titel}“ zu deinem neuen Hauptthema. Es ersetzt „{ersetzt}“ ganz oben.</>
          : "Mach dieses Kapitel zu deinem Hauptthema. Dann steht es ganz oben, du bekommst jeden Tag eine Einheit – und vor der Arbeit die Generalprobe."}
      </p>
      <DatumFeld wert={termin} setze={setTermin} />
      <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: NACHT_TEXT }}>
        {termin ? "Der Plan verdichtet die Wiederholungen bis zur Arbeit, am Vortag kommt die Generalprobe." : "Optional. Ohne Datum: Wiederholungen nach Ebbinghaus nach 1, 3, 7, 14 und 30 Tagen."}
      </p>
      <button type="button" onClick={() => waehle(termin || null)} className="ht-gold"
        style={{ ...knopf, width: "100%", minHeight: 46, border: "none", borderRadius: 12, background: C.flaggold, color: C.seeTief, fontSize: 15, fontWeight: 800, boxShadow: "0 4px 14px rgba(237,187,0,0.3)" }}>
        Als mein Hauptthema wählen ›
      </button>
    </div>
  );
}

/* ---------- kompakte Zeile, während die Kapitelliste offen ist ---------- */
export function HauptthemaLeiste({ haupt, zurueck, beenden }) {
  const t = THEMEN[haupt.kapitel];
  return (
    <div style={{ marginTop: 6, marginBottom: 12, borderRadius: 12, background: C.seeTief, color: C.weiss, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ flex: "1 1 180px", minWidth: 0 }}>
        <span style={{ ...KICKER, display: "block", color: C.flaggold, fontSize: 10.5 }}>Dein Hauptthema</span>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, marginTop: 2, lineHeight: 1.25 }}>{t.titel}</span>
      </span>
      <button type="button" onClick={zurueck} style={{ ...knopf, fontSize: 12.5, fontWeight: 800, color: C.seeTief, background: C.flaggold, border: "none", borderRadius: 999, padding: "7px 13px", minHeight: 34 }}>Zurück dazu</button>
      <button type="button" onClick={beenden} style={randKnopf}>Beenden</button>
    </div>
  );
}

/* ---------- Status-Symbol eines Unterthemas ---------- */
function StandPunkt({ art }) {
  const basis = { flexShrink: 0, width: 22, height: 22, borderRadius: 999, boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center" };
  if (art === "sicher") return (
    <span aria-hidden="true" style={{ ...basis, background: C.see }}>
      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.2 6.3 L4.8 8.8 L9.8 3.4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  if (art === "geuebt") return <span aria-hidden="true" style={{ ...basis, background: `conic-gradient(${C.see} 0deg 180deg, ${C.linie} 180deg 360deg)` }} />;
  if (art === "unsicher") return <span aria-hidden="true" style={{ ...basis, background: `conic-gradient(${C.flaggold} 0deg 120deg, ${C.linie} 120deg 360deg)` }} />;
  if (art === "offen") return <span aria-hidden="true" style={{ ...basis, border: `2px solid ${C.linie}` }} />;
  return <span aria-hidden="true" style={{ ...basis, border: `2px dashed ${C.linie}` }} />;
}

function Zeile({ onClick, gold, links, titel, unter, etikett, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={disabled ? undefined : "qf-balken"}
      style={{ ...knopf, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 48, padding: "7px 10px 7px 12px", borderRadius: 10,
        border: `1.5px solid ${gold ? C.flaggold : C.linie}`, background: gold ? "#FFFBEA" : C.weiss, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1 }}>
      {links}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: gold ? 700 : 600, color: C.tinte, lineHeight: 1.25 }}>{titel}</span>
        {unter && <span style={{ display: "block", fontSize: 11.5, fontWeight: gold ? 600 : 500, color: gold ? GOLD_DUNKEL : C.grau, marginTop: 1, lineHeight: 1.3 }}>{unter}</span>}
      </span>
      {etikett && <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.see, padding: "3px 7px", borderRadius: 999, background: C.himmel }}>{etikett}</span>}
      {!disabled && <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: gold ? GOLD_DUNKEL : C.see }}>›</span>}
    </button>
  );
}
const Abschnitt = ({ children, rechts, farbe = C.grau }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, margin: "0 2px 6px", flexWrap: "wrap" }}>
    <p style={{ ...KICKER, color: farbe }}>{children}</p>
    {rechts && <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: C.grau }}>{rechts}</p>}
  </div>
);
const ETIKETT = { entdecken: "Entdecken", rechnen: "Rechnen", trainieren: "Trainieren" };

/* Countdown-Ring */
function Ring({ cd, gross }) {
  const g = gross ? 72 : 58, innen = gross ? 58 : 46;
  const grad = Math.round((cd ? cd.anteil : 0) * 360);
  const zahl = !cd ? "–" : cd.tage <= 0 ? (cd.tage === 0 ? "Heute" : "✓") : cd.tage;
  const einheit = !cd ? "" : cd.tage > 0 ? (cd.tage === 1 ? "Tag" : "Tage") : "";
  return (
    <span aria-hidden="true" style={{ flexShrink: 0, width: g, height: g, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
      background: `conic-gradient(${C.flaggold} 0deg ${grad}deg, rgba(255,255,255,0.14) ${grad}deg 360deg)` }}>
      <span style={{ width: innen, height: innen, borderRadius: 999, background: C.seeTief, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: typeof zahl === "number" ? (gross ? 22 : 17) : 12.5, fontWeight: 800, lineHeight: 1, color: C.weiss }}>{zahl}</span>
        {einheit && <span style={{ fontSize: gross ? 9 : 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: NACHT_TEXT, marginTop: 2 }}>{einheit}</span>}
      </span>
    </span>
  );
}

/* ======================================================================
   Hauptthema-Ansicht
   props: haupt { kapitel, schulart, klasse, termin, seit, planId, note }
          plan  – aktiver Trainingsplan (useAktiverPlan) oder null; gehört er zum Hauptthema (planId), ist er „der Plan“
          werkzeuge – Werkzeug-Zeilen zum Kapitel (werkzeugeZumKapitel), kurse – passende Kurse
          aktionen: { gehe, oeffneTeil(u), waehleWz(h), heuteStarten(e), planErstellen(), datumSetzen(t), noteSetzen(n), liste(), beenden(), neuesHaupt(kapitelId) }
          breit – ab 840 px zweispaltig
   ====================================================================== */
export function HauptthemaAnsicht({ haupt, plan, werkzeuge, kurse, aktionen, breit }) {
  const en = englisch();
  const E = useLernstand();
  const heute = heuteText();
  const t = THEMEN[haupt.kapitel];
  const ks = useMemo(() => kapitelStand(haupt.kapitel, E), [haupt.kapitel, E]);
  const vw = useMemo(() => vorwissenStand(haupt.kapitel, haupt.schulart, E), [haupt.kapitel, haupt.schulart, E]);
  const [datumAuf, setDatumAuf] = useState(false);
  const [neuTermin, setNeuTermin] = useState(haupt.termin || "");
  const cd = countdown(haupt.termin, haupt.seit, heute);
  const vorbei = cd && cd.tage < 0;
  const meinPlan = plan && haupt.planId && plan.plan.id === haupt.planId ? plan : null;
  const st = meinPlan ? planStand(meinPlan.plan, meinPlan.erledigt, heute) : null;
  const danach = meinPlan && st && st.naechste ? meinPlan.plan.einheiten.find((e) => e !== st.naechste && !meinPlan.erledigt[e.id] && e.datum >= st.naechste.datum) : null;
  const weiter = naechstesKapitel(haupt.schulart, haupt.klasse, haupt.kapitel);
  const nr = (() => { const i = kapitelFuer(haupt.schulart, haupt.klasse).findIndex((k) => k.id === haupt.kapitel); return i >= 0 ? roemisch(i + 1) : null; })();

  /* ---------- Kopf: Titel, Countdown ---------- */
  const kopf = (
    <div style={{ borderRadius: breit ? 16 : 14, background: C.seeTief, color: C.weiss, overflow: "hidden",
      display: breit ? "grid" : "block", gridTemplateColumns: breit ? "minmax(0, 1fr) 360px" : undefined, columnGap: 24, alignItems: "center", padding: breit ? "18px 20px" : 0 }}>
      <div style={{ padding: breit ? 0 : "14px 14px 12px", display: "grid", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <p style={{ ...KICKER, color: C.flaggold }}>Dein Hauptthema</p>
          {!breit && <button type="button" onClick={aktionen.liste} style={{ ...randKnopf, fontSize: 11.5, padding: "4px 10px", minHeight: 30 }}>Thema wechseln</button>}
        </div>
        {nr && <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: NACHT_TEXT }}><span data-kein-i18n>Kapitel {nr}</span></p>}
        <p style={{ margin: 0, fontSize: breit ? 24 : 19, fontWeight: 700, lineHeight: 1.2 }}>{t.titel}</p>
        <p style={{ margin: 0, fontSize: breit ? 13 : 12.5, lineHeight: 1.45, color: NACHT_TEXT }}>{t.zeile}</p>
        {breit && (
          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <button type="button" onClick={aktionen.liste} style={randKnopf}>Thema wechseln</button>
            <button type="button" onClick={() => setDatumAuf(!datumAuf)} aria-expanded={datumAuf} style={randKnopf}>{haupt.termin ? "Datum ändern" : "Datum eintragen"}</button>
          </div>
        )}
      </div>
      <div style={{ margin: breit ? 0 : "0 10px 10px", padding: breit ? "14px 16px" : 12, borderRadius: 12, background: "rgba(255,255,255,0.08)", display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: breit ? 16 : 12 }}>
          <Ring cd={cd} gross={breit} />
          <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 3 }}>
            <p style={{ ...KICKER, fontSize: 11, letterSpacing: "0.1em", color: C.flaggold }}>Klassenarbeit</p>
            <p style={{ margin: 0, fontSize: breit ? 17 : 15, fontWeight: 700, lineHeight: 1.2 }}>
              {haupt.termin ? datumLang(haupt.termin, en) : "Noch kein Datum"}
            </p>
            <p style={{ margin: 0, fontSize: 11.5, fontWeight: 500, lineHeight: 1.4, color: NACHT_TEXT }}>
              {vorbei ? "Geschrieben – wie lief es?" : cd && cd.tage === 0 ? "Heute – viel Erfolg!" : st ? `${st.fertig} von ${st.gesamt} Einheiten geschafft` : haupt.termin ? "Noch kein Plan" : "Wiederholen nach Ebbinghaus"}
            </p>
            {breit && st && (
              <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.14)", marginTop: 4, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((st.fertig / Math.max(1, st.gesamt)) * 100)}%`, height: "100%", background: C.flaggold }} />
              </div>
            )}
          </div>
          {!breit && (
            <button type="button" onClick={() => setDatumAuf(!datumAuf)} aria-expanded={datumAuf} aria-label={haupt.termin ? "Datum der Klassenarbeit ändern" : "Datum der Klassenarbeit eintragen"}
              style={{ ...knopf, flexShrink: 0, width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.32)", background: datumAuf ? "rgba(255,255,255,0.14)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
            </button>
          )}
        </div>
        {datumAuf && (
          <div className="auftauchen" style={{ display: "grid", gap: 8, paddingTop: 2 }}>
            <DatumFeld wert={neuTermin} setze={setNeuTermin} label="Neues Datum" />
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: NACHT_TEXT }}>Der Plan wird neu verteilt. Was du schon geschafft hast, bleibt abgehakt.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => { aktionen.datumSetzen(neuTermin || null); setDatumAuf(false); }}
                style={{ ...knopf, fontSize: 13, fontWeight: 800, color: C.seeTief, background: C.flaggold, border: "none", borderRadius: 10, padding: "8px 14px", minHeight: 38 }}>Übernehmen</button>
              {haupt.termin && <button type="button" onClick={() => { setNeuTermin(""); aktionen.datumSetzen(null); setDatumAuf(false); }} style={randKnopf}>Ohne Datum</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ---------- Nach der Arbeit ---------- */
  const nachDerArbeit = vorbei && (
    <div className="auftauchen" style={{ borderRadius: 12, border: `1.5px solid ${C.flaggold}`, background: "#FFFBEA", padding: "12px 12px 14px", display: "grid", gap: 10 }}>
      <p style={{ ...KICKER, color: GOLD_DUNKEL }}>Die Arbeit ist geschrieben</p>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: C.tinte }}>
        {haupt.note ? `Notiert: Note ${haupt.note}. ` : "Welche Note hast du bekommen? "}
        Die Wiederholungen laufen weiter, damit das Thema auch fürs Abi sitzt.
      </p>
      <div role="group" aria-label="Note der Klassenarbeit" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button key={n} type="button" aria-pressed={haupt.note === n} onClick={() => aktionen.noteSetzen(n)} data-kein-i18n
            style={{ ...knopf, minHeight: 44, borderRadius: 10, fontSize: 16, fontWeight: 800, border: `1.5px solid ${haupt.note === n ? C.see : C.linie}`,
              background: haupt.note === n ? C.see : C.weiss, color: haupt.note === n ? C.weiss : C.tinte }}>{n}</button>
        ))}
      </div>
      {weiter && (
        <button type="button" onClick={() => aktionen.neuesHaupt(weiter.id)} className="ht-gold"
          style={{ ...knopf, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: "none", background: C.flaggold, color: C.seeTief }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD_DUNKEL }}>Nächstes Kapitel als Hauptthema</span>
            <span style={{ display: "block", fontSize: 15, fontWeight: 800, marginTop: 2, lineHeight: 1.25 }}>{weiter.titel}</span>
          </span>
          <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 800 }}>›</span>
        </button>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <button type="button" onClick={aktionen.liste} style={{ ...knopf, border: "none", background: "none", padding: "4px 0", fontSize: 13, fontWeight: 700, color: C.see }}>Anderes Kapitel wählen</button>
        <button type="button" onClick={aktionen.beenden} style={{ ...knopf, border: "none", background: "none", padding: "4px 0", fontSize: 13, fontWeight: 700, color: GOLD_DUNKEL }}>Hauptthema beenden</button>
      </div>
    </div>
  );

  /* ---------- Heute dran ---------- */
  const heuteDran = (
    <div style={{ display: "grid", gap: 8 }}>
      {meinPlan && st && st.naechste ? (
        <>
          <Abschnitt farbe={GOLD_DUNKEL}>{st.faellig ? "Heute dran" : `Als Nächstes · ${tagName(st.naechste.datum, heute, en)}`}</Abschnitt>
          <button type="button" onClick={() => aktionen.heuteStarten(st.naechste)} className="ht-gold"
            style={{ ...knopf, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: breit ? "14px 16px" : "11px 12px 11px 14px", borderRadius: breit ? 14 : 12,
              border: "none", background: C.flaggold, color: C.seeTief, boxShadow: "0 4px 14px rgba(237,187,0,0.3)" }}>
            <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 3 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <PhasenPille phase={st.naechste.phase} />
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: GOLD_DUNKEL }}>Einheit {st.fertig + 1} von {st.gesamt}</span>
              </span>
              <span style={{ fontSize: breit ? 17 : 15, fontWeight: 800, lineHeight: 1.25 }}>{einheitTitel(st.naechste)}</span>
              <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: "#3D2F00" }}>
                {st.naechste.anzahl ? `${st.naechste.anzahl} Aufgaben mit Hinweisen · ca. ${Math.max(5, st.naechste.anzahl * 3)} Minuten` : st.naechste.zeile}
              </span>
            </span>
            <span aria-hidden="true" style={{ fontSize: 24, fontWeight: 800 }}>›</span>
          </button>
          <div style={{ display: "grid", gridTemplateColumns: danach ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)", gap: 6 }}>
            {danach && (
              <button type="button" onClick={() => aktionen.gehe({ ansicht: "trainingsplan" })} className="qf-balken"
                style={{ ...knopf, minHeight: 46, padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.tinte, fontSize: 12.5, fontWeight: 700, textAlign: "left", display: "grid", gap: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau }}>Danach · {tagName(danach.datum, heute, en)}</span>
                <span>{einheitTitel(danach)}</span>
              </button>
            )}
            <button type="button" onClick={() => aktionen.gehe({ ansicht: "trainingsplan" })} className="qf-balken"
              style={{ ...knopf, minHeight: 46, padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.tinte, fontSize: 12.5, fontWeight: 700, textAlign: "left", display: "grid", gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau }}>Ganzer Plan · {st.fertig}/{st.gesamt}</span>
              <span>Alle Tage ansehen ›</span>
            </button>
          </div>
        </>
      ) : meinPlan ? (
        <div style={{ borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, padding: "11px 12px", display: "grid", gap: 4 }}>
          <p style={{ ...KICKER, color: "#0F7A4D" }}>Plan komplett geschafft</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: C.tinte }}>Jetzt unter echten Bedingungen: Testklausur in der Formelsammlung zum Kapitel oder der Prüfungsmodus.</p>
        </div>
      ) : (
        <>
          <Abschnitt farbe={GOLD_DUNKEL}>Dein Plan</Abschnitt>
          <button type="button" onClick={aktionen.planErstellen} className="ht-gold"
            style={{ ...knopf, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px 11px 14px", borderRadius: 12, border: "none", background: C.flaggold, color: C.seeTief }}>
            <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>Trainingsplan zum Hauptthema erstellen</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#3D2F00", lineHeight: 1.3 }}>Warm-up, Basis-Check, Kerntraining und Wiederholungen{haupt.termin ? " bis zur Arbeit" : ""}</span>
            </span>
            <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 800 }}>›</span>
          </button>
        </>
      )}
    </div>
  );

  /* ---------- Unterthemen mit Stand ---------- */
  const teileZaehlung = [ks.sicher && `${ks.sicher} sicher`, ks.geuebt && `${ks.geuebt} geübt`, ks.offen && `${ks.offen} offen`].filter(Boolean).join(" · ");
  const heutigeTeile = meinPlan && st && st.naechste && st.naechste.phase === "kern" && st.faellig ? new Set(st.naechste.teile || []) : new Set();
  const unterthemen = (
    <div style={{ display: "grid", gap: 6 }}>
      <Abschnitt rechts={teileZaehlung || null}>Unterthemen · dein Stand</Abschnitt>
      {ks.teile.map((u) => {
        const geht = u.gen.length > 0 || !!u.wz;
        const zeile = standZeile(u.stand) || (u.wz ? "Mit dem passenden Werkzeug üben" : "Aufgaben kommen noch");
        const gold = heutigeTeile.size > 0 && heutigeTeile.size < ks.teile.length && heutigeTeile.has(u.id);
        return <Zeile key={u.id} onClick={() => aktionen.oeffneTeil(u)} disabled={!geht} gold={gold}
          links={<StandPunkt art={u.stand.art} />} titel={u.titel} unter={gold ? `Heute dran · ${zeile}` : zeile} />;
      })}
      <p style={{ margin: "2px 2px 0", fontSize: 11, color: C.grau, lineHeight: 1.45 }}>
        Voller Kreis: {STAND.sicher.name.toLowerCase()}. Halber Kreis: geübt (gold: wackelt noch). Leerer Kreis: offen. Gestrichelt: nur mit Werkzeug.
      </p>
    </div>
  );

  /* ---------- Werkzeuge ---------- */
  const alles = (
    <div style={{ display: "grid", gap: 6 }}>
      <Abschnitt>Alles zu diesem Kapitel</Abschnitt>
      {werkzeuge.map((h) => <Zeile key={h.art + h.id} onClick={() => aktionen.waehleWz(h)} titel={h.name} unter={h.zeile} etikett={h.etikett ? ETIKETT[h.etikett] : null} />)}
    </div>
  );

  /* ---------- Vorwissen ---------- */
  const vorwissen = vw.length > 0 && (
    <div style={{ padding: "11px 12px", borderRadius: 12, background: C.himmel, display: "grid", gap: 8 }}>
      <p style={{ ...KICKER, color: C.see }}>Dafür brauchst du sicher</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {vw.map((v) => {
          const farbe = v.stand.art === "sicher" ? C.see : v.stand.art === "unsicher" || v.stand.art === "geuebt" ? C.flaggold : null;
          return (
            <button key={v.kapitel} type="button" onClick={() => aktionen.gehe({ ansicht: "trainieren", kapitel: v.kapitel, teil: null, schulart: haupt.schulart, klasse: haupt.klasse })}
              style={{ ...knopf, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", minHeight: 34, borderRadius: 999, border: `1px solid ${farbe || C.linie}`, background: C.weiss, color: C.tinte, fontSize: 12, fontWeight: 600, textAlign: "left" }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, boxSizing: "border-box", background: farbe || "transparent", border: farbe ? "none" : `1.5px solid ${C.hellgrau}` }} />
              {v.titel}
            </button>
          );
        })}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: C.grau, lineHeight: 1.45 }}>Blau: sitzt. Gold: geübt, aber noch nicht stabil. Grau: noch nicht geübt. Antippen: 5 Aufgaben dazu.</p>
    </div>
  );

  /* ---------- Kurs ---------- */
  const kurs = kurse.length > 0 && (
    <div style={{ display: "grid", gap: 6 }}>
      <Abschnitt>{kurse.length === 1 ? "Passender Kurs" : "Passende Kurse"}</Abschnitt>
      {kurse.map((k) => (
        <button key={k.id} type="button" onClick={() => aktionen.gehe(k.ziel)} className="qf-balken"
          style={{ ...knopf, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, minHeight: 56, padding: "9px 10px 9px 14px", borderRadius: 12, border: `1.5px solid ${C.flaggold}`, background: "#FFFBEA", color: C.tinte }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{k.name}</span>
            <span style={{ display: "block", fontSize: 12, color: C.grau, marginTop: 2, lineHeight: 1.3 }}>{k.zeile}</span>
          </span>
          <span aria-hidden="true" style={{ fontSize: 20, color: GOLD_DUNKEL }}>›</span>
        </button>
      ))}
    </div>
  );

  const alleKapitel = (
    <button type="button" onClick={aktionen.liste} className="qf-balken"
      style={{ ...knopf, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, minHeight: 48, padding: "8px 12px", borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.tinte }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau }}>Andere Kapitel</span>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.see, marginTop: 1 }}>Alle Kapitel anzeigen</span>
      </span>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18"><path d="M4 7 L9 12 L14 7" fill="none" stroke={C.see} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
  const fuss = (
    <p style={{ margin: "0 2px", fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5 }}>
      Dein Hauptthema bleibt oben, bis du es wechselst. Nach der Klassenarbeit fragt die App nach deiner Note und schlägt das nächste Kapitel vor.
    </p>
  );

  if (breit) return (
    <div className="auftauchen" data-hauptthema={haupt.kapitel} style={{ display: "grid", gap: 18, marginTop: 6 }}>
      {kopf}
      {nachDerArbeit}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: 24, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 18, minWidth: 0 }}>{!vorbei && heuteDran}{unterthemen}{vorwissen}</div>
        <div style={{ display: "grid", gap: 18, minWidth: 0 }}>{alles}{kurs}{alleKapitel}{fuss}</div>
      </div>
    </div>
  );
  return (
    <div className="auftauchen" data-hauptthema={haupt.kapitel} style={{ display: "grid", gap: 16, marginTop: 6 }}>
      {kopf}
      {nachDerArbeit}
      {!vorbei && heuteDran}
      {unterthemen}
      {alles}
      {vorwissen}
      {kurs}
      <div style={{ display: "grid", gap: 8 }}>{alleKapitel}{fuss}</div>
    </div>
  );
}
