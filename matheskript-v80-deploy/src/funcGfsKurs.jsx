/* ============================================================
   KURS GFS (ansicht "gfs", Pfad /gfs-trainer)
   Aufbau wie die Kurse Differentialrechnung und Vektoren:
     1. Dein Thema: Klassenstufe wählen, GFS-Thema aus dem Lambacher
        Schweizer auswählen → öffnet die Themenseite (z. B. gfs-pascal)
     2. So gehst du eine GFS an: sieben Schritte mit Text, Video-Platz
        und Checkliste
     3. Zeitplaner: vom Termin aus rückwärts
   Farben: Lackschwarz mit Gold, die Bühne (LACKSCHWARZ in kursFarben.js); Kopf,
   Fortschritt und Abschnittsköpfe aus funcKursKopf.jsx. Fortschritt im localStorage.
   Daten und Logik: gfsKurs.js
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { ErklaerVideo } from "./func1.jsx";
import { KLASSEN, klasseName, stufenText, THEMEN, themenFuer, LEITFADEN, zeitplan, datumSchreiben } from "./gfsKurs.js";
import { LACKSCHWARZ } from "./kursFarben.js";
import { MotivBuehne } from "./funcKursMotive.jsx";
import { KursKopf, FortschrittKarte, KapitelKopf, IconVideo, IconAufgabe, IconUhr } from "./funcKursKopf.jsx";

const K = { nacht: C.nachtschwarz, dunkel: C.golddunkel, gold: C.flaggold, goldWarm: C.goldWarm, hell: "#FFF6D6", weiss: C.weiss, text: "#A67C00" };

/* ---------- Fortschritt ---------- */
const SPEICHER = "mm_gfskurs";
const standLesen = () => { try { return { klasse: null, thema: null, haken: {}, offen: {}, termin: "", ...JSON.parse(localStorage.getItem(SPEICHER) || "{}") }; } catch (e) { return { klasse: null, thema: null, haken: {}, offen: {}, termin: "" }; } };
const standSchreiben = (s) => { try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch (e) { /* egal */ } };
const schrittFertig = (s, stand) => s.check.every((_, i) => stand.haken[`${s.id}-${i}`]);

/* ---------- Kopf ---------- */
export function GfsKursKopf() {
  return (
    <KursKopf farben={LACKSCHWARZ} Motiv={MotivBuehne} id="ks-gfs" titel="GFS in Mathe"
      zeile="Dein Thema aus dem Lambacher Schweizer finden – und in sieben Schritten lernen, wie eine GFS gelingt."
      chips={[
        { icon: <IconAufgabe />, text: `${LEITFADEN.length} Schritte` },
        { icon: <span style={{ display: "inline-flex", width: 14, height: 14, flex: "none" }}><IconVideo /></span>, text: `${THEMEN.length} ${THEMEN.length === 1 ? "Themenseite" : "Themenseiten"}` },
        { icon: <IconUhr />, text: "Zeitplan bis zum Termin" },
      ]} />
  );
}

/* ---------- Kleine Bausteine ---------- */
const Abschnitt = ({ nr, titel, text, children }) => (
  <section style={{ marginBottom: 34 }}>
    <KapitelKopf farben={LACKSCHWARZ} marke={`Teil ${nr}`} titel={titel} />
    {text && <p style={{ color: C.grau, fontSize: 14.5, lineHeight: 1.65, margin: "2px 4px 16px", maxWidth: "62ch" }}>{text}</p>}
    {children}
  </section>
);

const Haken = ({ an }) => (
  <span aria-hidden="true" style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 7, flex: "none", alignItems: "center", justifyContent: "center",
    background: an ? K.gold : K.weiss, border: an ? "none" : `1.5px solid ${C.linie}`, transition: "background .15s" }}>
    {an && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke={K.nacht} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
  </span>
);

/* ---------- Teil 1: Dein Thema ---------- */
function ThemenWahl({ stand, setzen, gehe }) {
  const klasse = stand.klasse;
  const liste = klasse ? themenFuer(klasse) : [];
  return (
    <div>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 16 }} role="group" aria-label="Klassenstufe">
        {KLASSEN.map((k) => {
          const aktiv = klasse === k, hat = themenFuer(k).length;
          return (
            <button key={k} type="button" onClick={() => setzen({ klasse: k })} aria-pressed={aktiv}
              style={{ padding: "9px 14px", borderRadius: 999, border: `1.5px solid ${aktiv ? K.nacht : C.linie}`, background: aktiv ? K.nacht : K.weiss,
                color: aktiv ? K.gold : C.tinte, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
              Klasse {k}
              {hat > 0 && <span style={{ fontSize: 10.5, fontWeight: 800, background: aktiv ? K.gold : K.hell, color: K.nacht, borderRadius: 999, padding: "1px 6px" }}>{hat}</span>}
            </button>
          );
        })}
      </div>

      {!klasse && (
        <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.7, margin: "0 4px" }}>
          Wähle deine Klassenstufe – dann siehst du die GFS-Themen aus deinem Buch.
        </p>
      )}
      {klasse && liste.length === 0 && (
        <div style={{ background: K.weiss, border: `1px dashed ${C.linie}`, borderRadius: 16, padding: "18px 18px" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: K.nacht, margin: "0 0 6px" }}>{klasseName(klasse)}: Die Themen kommen gerade ins Buch.</p>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
            Wir tragen die GFS-Themen Kapitel für Kapitel aus dem Lambacher Schweizer ein. Der Leitfaden unten gilt für jedes Thema – du kannst sofort anfangen.
          </p>
        </div>
      )}
      {liste.map((t) => {
        const gewaehlt = stand.thema === t.id;
        return (
          <div key={t.id} className="gfs-thema" onClick={() => { setzen({ thema: t.id }); gehe({ ansicht: t.ansicht }); }}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px 12px 12px", borderRadius: 18, cursor: "pointer", marginBottom: 10,
              background: K.weiss, border: `1px solid ${gewaehlt ? K.gold : C.linie}`, boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 6px 18px -10px rgba(15,26,51,0.14)" }}>
            <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 46, height: 46, borderRadius: 14,
              background: K.nacht, color: K.gold, fontWeight: 800, fontSize: 15, fontStyle: "italic" }}>{t.kapitel}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: K.text, letterSpacing: "0.02em", marginBottom: 3 }}>{t.kapitelName} · S. {t.seite}{t.schulart ? ` · ${stufenText(t)}` : ""}</span>
              <span style={{ display: "block", fontWeight: 700, fontSize: 15.5, color: K.nacht, lineHeight: 1.3 }}>{t.titel}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: C.grau, marginTop: 5, whiteSpace: "nowrap", overflow: "hidden" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flex: "none" }}><span style={{ display: "inline-flex", width: 14, height: 14, flex: "none" }}><IconVideo /></span>{t.animationen ? `${t.animationen} Animationen` : `${t.videos} ${t.videos === 1 ? "Video" : "Videos"}`}</span>
                <span>Beweis · Übung · Kolloquium</span>
              </span>
            </span>
            <span aria-hidden="true" style={{ flex: "none", color: K.gold, fontWeight: 800 }}>→</span>
          </div>
        );
      })}
      <style>{`.gfs-thema{transition:transform .15s ease, box-shadow .15s ease} @media (hover:hover){.gfs-thema:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,26,51,0.10)}}`}</style>
    </div>
  );
}

/* ---------- Teil 2: Leitfaden ---------- */
function Schritt({ s, stand, setzen }) {
  const offen = !!stand.offen[s.id];
  const fertig = schrittFertig(s, stand);
  const erledigt = s.check.filter((_, i) => stand.haken[`${s.id}-${i}`]).length;
  const umschalten = () => setzen({ offen: { ...stand.offen, [s.id]: !offen } });
  const haken = (i) => { const k = `${s.id}-${i}`; setzen({ haken: { ...stand.haken, [k]: !stand.haken[k] } }); };
  return (
    <div style={{ background: K.weiss, border: `1px solid ${fertig ? K.gold : C.linie}`, borderRadius: 18, marginBottom: 10, boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 6px 18px -10px rgba(15,26,51,0.14)", overflow: "hidden" }}>
      <button type="button" onClick={umschalten} aria-expanded={offen}
        style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 14px 12px 12px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: K.nacht }}>
        <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 46, height: 46, borderRadius: 14,
          background: fertig ? K.gold : K.hell, color: K.nacht, fontWeight: 800, fontSize: 18, transition: "background .15s" }}>{s.nr}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontWeight: 700, fontSize: 15.5, lineHeight: 1.3 }}>{s.titel}</span>
          <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 3, lineHeight: 1.4 }}>{s.zeile}</span>
        </span>
        <span style={{ flex: "none", fontSize: 12, fontWeight: 700, color: fertig ? K.text : C.hellgrau, whiteSpace: "nowrap" }}>{erledigt}/{s.check.length}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flex: "none", transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
          <path d="M3 6l5 5 5-5" stroke={C.grau} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {offen && (
        <div style={{ padding: "0 16px 18px", borderTop: `1px solid ${C.linie}` }}>
          <p style={{ fontSize: 16.5, fontWeight: 700, color: K.nacht, letterSpacing: "-0.01em", lineHeight: 1.3, margin: "16px 0 12px" }}>{s.frage}</p>
          {s.video ? <ErklaerVideo id={s.video} titel={s.titel} /> : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: K.text, background: K.hell, borderRadius: 10, padding: "8px 12px", marginBottom: 14 }}>
              <span style={{ display: "inline-flex", width: 14, height: 14, flex: "none" }}><IconVideo /></span>Video zu diesem Schritt folgt
            </div>
          )}
          {s.absaetze.map((a, i) => <p key={i} style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: "0 0 12px" }}>{a}</p>)}
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: K.text, margin: "16px 0 8px" }}>CHECKLISTE</p>
          {s.check.map((c, i) => {
            const an = !!stand.haken[`${s.id}-${i}`];
            return (
              <button key={c} type="button" onClick={() => haken(i)} aria-pressed={an}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 6px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <Haken an={an} />
                <span style={{ fontSize: 14.5, color: an ? C.grau : C.tinte, textDecoration: an ? "line-through" : "none", lineHeight: 1.4 }}>{c}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Teil 3: Zeitplaner ---------- */
function Zeitplaner({ stand, setzen }) {
  const heute = datumSchreiben(Date.now() - new Date().getTimezoneOffset() * 60000);
  const plan = stand.termin ? zeitplan(stand.termin, heute) : null;
  return (
    <div style={{ background: K.weiss, borderRadius: 18, padding: "16px 16px 10px", border: `1px solid ${C.linie}`, boxShadow: "0 1px 2px rgba(15,26,51,0.04), 0 6px 18px -10px rgba(15,26,51,0.14)" }}>
      <label style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: plan ? 16 : 4 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: K.nacht }}>Wann ist deine GFS?</span>
        <input type="date" value={stand.termin} min={heute} onChange={(e) => setzen({ termin: e.target.value })} aria-label="Termin der GFS"
          style={{ padding: "9px 12px", fontSize: 15, fontFamily: "inherit", border: `1.5px solid ${C.linie}`, borderRadius: 10, color: C.tinte, background: K.weiss }} />
      </label>
      {plan && plan.vorbei && <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, margin: "0 0 8px" }}>Der Termin liegt in der Vergangenheit – trag den nächsten ein.</p>}
      {plan && !plan.vorbei && (
        <>
          <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, margin: "0 0 12px" }}>
            Noch <b style={{ color: K.nacht, fontWeight: 700 }}>{plan.rest} {plan.rest === 1 ? "Tag" : "Tage"}</b>.
            {plan.gestaucht ? " Weniger als vier Wochen – der Plan ist enger gesetzt, fang heute an." : " Vier Wochen, ein Schritt pro Woche – das reicht gut."}
          </p>
          <div style={{ position: "relative", paddingLeft: 26 }}>
            <div style={{ position: "absolute", left: 7, top: 10, bottom: 10, width: 2, background: C.linie, borderRadius: 2 }} />
            {plan.schritte.map((m) => (
              <div key={m.tage} style={{ position: "relative", display: "flex", gap: 12, alignItems: "baseline", padding: "6px 0" }}>
                <span aria-hidden="true" style={{ position: "absolute", left: -24, top: 11, width: 12, height: 12, borderRadius: 999, border: `2px solid ${m.tage === 0 ? K.nacht : K.gold}`,
                  background: m.vorbei ? K.gold : m.tage === 0 ? K.nacht : K.weiss }} />
                <span style={{ flex: "none", width: 72, fontSize: 13, fontWeight: 700, color: m.heute ? K.text : m.vorbei ? C.hellgrau : K.nacht, fontVariantNumeric: "tabular-nums" }}>{m.anzeige}</span>
                <span style={{ flex: 1, fontSize: 14.5, color: m.vorbei ? C.hellgrau : C.tinte, fontWeight: m.tage === 0 ? 700 : 400, lineHeight: 1.4 }}>
                  {m.titel}{m.heute && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, color: K.text }}>HEUTE</span>}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Die Seite ---------- */
export function GfsKursSeite({ gehe }) {
  const [stand, setStand] = useState(standLesen);
  /* Sofort speichern (nicht erst im Updater): beim Wechsel zur Themenseite wird die Seite
     abgebaut, bevor React den Updater ausführen würde */
  const setzen = (teil) => { const neu = { ...stand, ...teil }; standSchreiben(neu); setStand(neu); };
  const fertigZahl = LEITFADEN.filter((s) => schrittFertig(s, stand)).length;
  const thema = THEMEN.find((t) => t.id === stand.thema);
  const weiter = LEITFADEN.find((s) => !schrittFertig(s, stand));

  return (
    <>
      <GfsKursKopf />
      <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
        <FortschrittKarte farben={LACKSCHWARZ} zahl={fertigZahl} gesamt={LEITFADEN.length} einheit="Schritte" einheitDativ="Schritten"
          zusatz={thema ? <>Dein Thema: <b style={{ color: K.weiss }}>{thema.kurz}</b> ({stufenText(thema)})</> : "Noch kein Thema gewählt – Klassenstufe antippen und Thema aussuchen."}
          knopf={weiter ? (fertigZahl === 0 ? "Kurs starten" : "Weiter mit") : null} ziel={weiter ? `${weiter.nr} ${weiter.titel}` : null}
          onKnopf={() => weiter && setzen({ offen: { ...stand.offen, [weiter.id]: true } })} />

        <Abschnitt nr="1" titel="Dein Thema" text="Zu fast jedem Kapitel im Lambacher Schweizer gibt es ein GFS-Thema. Wähle deine Klassenstufe, dann dein Thema – jede Themenseite bringt Herleitung, Übung, roten Faden und Kolloquium-Training.">
          <ThemenWahl stand={stand} setzen={setzen} gehe={gehe} />
        </Abschnitt>

        <Abschnitt nr="2" titel="So gehst du eine GFS an" text="Sieben Schritte, die für jedes Thema gelten. Lies den Schritt, hake die Checkliste ab – ein Schritt gilt als geschafft, wenn alle Haken sitzen.">
          {LEITFADEN.map((s) => <Schritt key={s.id} s={s} stand={stand} setzen={setzen} />)}
        </Abschnitt>

        <Abschnitt nr="3" titel="Dein Zeitplan" text="Trag den Termin ein – der Plan rechnet vom Tag der GFS aus rückwärts und zeigt dir, bis wann welcher Schritt stehen sollte.">
          <Zeitplaner stand={stand} setzen={setzen} />
        </Abschnitt>
      </div>
    </>
  );
}
