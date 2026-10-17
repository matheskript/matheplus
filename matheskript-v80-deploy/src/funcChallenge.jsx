/* ======================================================================
   Klassen-Challenge (Ansicht „challenge“)
   Lehrkraft: Klasse wählen, Challenge einschalten, Code teilen, Rangliste sehen.
   Schüler:in: mit Code beitreten, Spitzname setzen, Wochenrangliste sehen.
   Punkte = richtig gelöste Aufgaben in der laufenden Kalenderwoche.
   Datenbank: supabase/challenge.sql (Klassen aus rollen.sql).
   ====================================================================== */
import React, { useCallback, useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { DEMO, useKonto } from "./konto.js";
import { challengeKlassen, challengeProfil, challengeRangliste, challengeSchalten, klasseBeitreten } from "./kontoRollen.js";

const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 3px 18px rgba(15,26,51,0.07)", padding: 18, marginBottom: 14 };
const kicker = { fontSize: 11.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 8px" };
const text = { fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65, margin: 0 };
const feld = { flex: 1, minWidth: 0, boxSizing: "border-box", border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "11px 14px", fontSize: 16, fontFamily: "inherit", color: C.tinte };
const knopf = (an = true) => ({ minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none", background: an ? C.see : C.hellgrau, color: C.weiss, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: an ? "pointer" : "default" });
const datum = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "numeric" }) : "");
const MEDAILLE = ["#EDBB00", "#B9C2CE", "#C98B4E"];

function Rangliste({ r }) {
  const max = Math.max(1, ...r.liste.map((x) => x.punkte));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <p style={{ ...kicker, margin: 0 }}>{r.woche_von ? `Woche ${datum(r.woche_von)}–${datum(r.woche_bis)}` : "Diese Woche"}</p>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.see }}>Klasse gesamt: {r.gesamt}</span>
      </div>
      {r.liste.length === 0 ? <p style={text}>Noch niemand in der Klasse. Teile den Code, dann geht es los.</p> : (
        <ol style={{ margin: 0, padding: 0, display: "grid", gap: 6 }}>
          {r.liste.map((x, i) => (
            <li key={i} style={{ listStyle: "none", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12,
              background: x.ich ? "#FFFBEA" : C.sand, border: `1.5px solid ${x.ich ? C.flaggold : "transparent"}` }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: i < 3 && x.punkte > 0 ? MEDAILLE[i] : C.weiss, color: i < 3 && x.punkte > 0 ? C.seeTief : C.grau, fontSize: 13, fontWeight: 800 }}>{i + 1}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{x.name}{x.ich ? " (du)" : ""}</span>
                <span aria-hidden="true" style={{ display: "block", height: 5, borderRadius: 3, background: C.linie, marginTop: 4, overflow: "hidden" }}>
                  <span style={{ display: "block", width: `${(x.punkte / max) * 100}%`, height: "100%", background: x.ich ? C.flaggold : C.see }} />
                </span>
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.seeTief, fontVariantNumeric: "tabular-nums" }}>{x.punkte}</span>
            </li>
          ))}
        </ol>
      )}
      {r.sieger_vorwoche && <p style={{ fontSize: 13, color: C.grau, margin: "12px 0 0" }}>Letzte Woche vorn: <b style={{ color: C.tinte }}>{r.sieger_vorwoche.name}</b> mit {r.sieger_vorwoche.punkte} Punkten.</p>}
    </div>
  );
}

function MeinAuftritt({ k, r, neu }) {
  const [name, setName] = useState(r.mein_spitzname || "");
  const [sichtbar, setSichtbar] = useState(r.ich_sichtbar !== false);
  const [meldung, setMeldung] = useState("");
  const speichern = async (s = sichtbar) => {
    setMeldung("");
    const n = name.trim();
    if (n && (n.length < 2 || n.length > 20)) { setMeldung("2 bis 20 Zeichen."); return; }
    try { const x = await challengeProfil(k.id, n, s); setMeldung(x.status === "ok" ? "Gespeichert." : "Das hat nicht geklappt."); neu(); } catch (e) { setMeldung(e.message); }
  };
  return (
    <div style={{ borderTop: `1px solid ${C.linie}`, marginTop: 16, paddingTop: 14 }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: C.tinte, margin: "0 0 6px" }}>So erscheinst du</p>
      <p style={{ ...text, fontSize: 13, marginBottom: 8 }}>Ohne Spitzname steht dein Vorname in der Liste. Sonst nichts – keine Noten, keine Fehler.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="Spitzname (optional)" aria-label="Spitzname" style={feld} />
        <button type="button" onClick={() => speichern()} style={knopf()}>Speichern</button>
      </div>
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, color: C.tinte, marginTop: 10 }}>
        <input type="checkbox" checked={!sichtbar} onChange={(e) => { setSichtbar(!e.target.checked); speichern(!e.target.checked); }} /> Für die anderen ausblenden
      </label>
      {meldung && <p role="status" style={{ fontSize: 13, color: C.grau, marginTop: 6 }}>{meldung}</p>}
    </div>
  );
}

function KlasseKarte({ k, neuKlassen }) {
  const [r, setR] = useState(null);
  const laden = useCallback(async () => { try { setR(await challengeRangliste(k.id)); } catch (e) { setR({ status: "fehler" }); } }, [k.id]);
  useEffect(() => { laden(); }, [laden]);
  const [kopiert, setKopiert] = useState(false);
  const schalten = async () => { await challengeSchalten(k.id, !k.an); await neuKlassen(); laden(); };
  const link = k.code ? `https://mythosmathe.de/?klasse=${k.code}` : "";
  return (
    <div style={{ ...karte, borderTop: `4px solid ${k.an ? C.flaggold : C.linie}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 19, fontWeight: 700, color: C.tinte, margin: 0 }}>{k.name}</p>
          <p style={{ fontSize: 12.5, color: C.grau, margin: "2px 0 0" }}>Klasse {k.stufe} · {k.mitglieder} {k.mitglieder === 1 ? "Mitglied" : "Mitglieder"}</p>
        </div>
        {k.lehrkraft && (
          <button type="button" role="switch" aria-checked={k.an} onClick={schalten} aria-label="Challenge an oder aus"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: k.an ? C.smaragd : C.grau }}>
            {k.an ? "läuft" : "aus"}
            <span style={{ width: 46, height: 28, borderRadius: 999, padding: 3, background: k.an ? C.smaragd : C.hellgrau, display: "inline-block", boxSizing: "border-box" }}>
              <span style={{ display: "block", width: 22, height: 22, borderRadius: 999, background: C.weiss, transform: `translateX(${k.an ? 18 : 0}px)`, transition: "transform .15s" }} />
            </span>
          </button>
        )}
      </div>
      {k.lehrkraft && k.code && (
        <div style={{ background: C.sand, borderRadius: 12, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: C.grau }}>Klassencode</span>
          <b style={{ fontSize: 18, letterSpacing: "0.12em", color: C.seeTief }}>{k.code}</b>
          <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(link); setKopiert(true); setTimeout(() => setKopiert(false), 1600); } catch (e) { /* manuell */ } }}
            style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.linie}`, borderRadius: 999, padding: "6px 12px", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: C.see, cursor: "pointer" }}>
            {kopiert ? "Kopiert" : "Link kopieren"}
          </button>
        </div>
      )}
      {!r ? <p style={text}>Einen Moment …</p>
        : r.status === "aus" ? <p style={text}>Deine Lehrkraft hat die Challenge für diese Klasse noch nicht gestartet.</p>
          : r.status !== "ok" ? <p style={text}>Die Rangliste lässt sich gerade nicht laden.</p>
            : <>
              {k.lehrkraft && !k.an && <p style={{ ...text, fontSize: 13, marginBottom: 10 }}>Vorschau – die Schüler:innen sehen die Liste erst, wenn die Challenge läuft.</p>}
              <Rangliste r={r} />
              {!k.lehrkraft && <MeinAuftritt k={k} r={r} neu={laden} />}
            </>}
    </div>
  );
}

function Beitreten({ fertig }) {
  const [code, setCode] = useState("");
  const [meldung, setMeldung] = useState("");
  const los = async () => {
    setMeldung("");
    try {
      const r = await klasseBeitreten(code.trim().toUpperCase());
      if (r && (r.status === "ok" || r.status === "schon")) { setCode(""); setMeldung(r.status === "schon" ? "Du bist schon in dieser Klasse." : "Willkommen in der Klasse!"); fertig(); }
      else setMeldung("Diesen Code gibt es nicht. Bitte prüfe ihn noch einmal.");
    } catch (e) { setMeldung(e.message); }
  };
  return (
    <div style={karte}>
      <p style={kicker}>Klasse beitreten</p>
      <p style={{ ...text, marginBottom: 10 }}>Den sechsstelligen Code bekommst du von deiner Lehrkraft.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} placeholder="z. B. K7XQ2M" aria-label="Klassencode"
          style={{ ...feld, letterSpacing: "0.12em", fontWeight: 700 }} />
        <button type="button" onClick={los} disabled={code.length !== 6} style={knopf(code.length === 6)}>Beitreten</button>
      </div>
      {meldung && <p role="status" style={{ fontSize: 13, color: C.grau, marginTop: 8 }}>{meldung}</p>}
    </div>
  );
}

export function ChallengeSeite({ gehe }) {
  const { geladen, nutzer, profil } = useKonto();
  const [klassen, setKlassen] = useState(null);
  const neu = useCallback(async () => { try { setKlassen(await challengeKlassen()); } catch (e) { setKlassen([]); } }, []);
  useEffect(() => { if (nutzer && profil) neu(); }, [nutzer, profil, neu]);
  const rolle = profil ? profil.rolle : null;
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: C.tinte, margin: "0 0 8px" }}>Gemeinsam statt gegeneinander</h2>
      <p style={{ ...text, marginBottom: 18 }}>Jede richtig gelöste Aufgabe ist ein Punkt – für dich und für die Klasse. Die Liste startet jeden Montag neu, damit jede Woche alle eine Chance haben.</p>
      {DEMO && <p style={{ fontSize: 12.5, color: "#6B5310", marginBottom: 12 }}>Vorschau: Klasse und Punkte sind Beispieldaten.</p>}
      {!geladen ? <p style={text}>Einen Moment …</p>
        : !nutzer || !profil ? (
          <div style={karte}>
            <p style={kicker}>Mit Konto</p>
            <p style={{ ...text, marginBottom: 12 }}>Für die Klassen-Challenge brauchst du ein Konto – damit deine Punkte bei deiner Klasse ankommen.</p>
            <button type="button" onClick={() => gehe({ ansicht: "konto" })} style={knopf()}>Anmelden oder Konto anlegen</button>
          </div>
        ) : (
          <>
            {klassen === null ? <p style={text}>Einen Moment …</p> : klassen.map((k) => <KlasseKarte key={k.id} k={k} neuKlassen={neu} />)}
            {rolle === "eltern" && <div style={karte}><p style={text}>Die Klassen-Challenge ist für Schüler:innen und Lehrkräfte. Die Woche Ihres Kindes sehen Sie im Konto und in der Wochenmail.</p></div>}
            {klassen && klassen.length === 0 && (rolle === "lehrkraft" || rolle === "nachhilfe") && (
              <div style={karte}>
                <p style={kicker}>Noch keine Klasse</p>
                <p style={{ ...text, marginBottom: 12 }}>Leg im Konto eine Klasse an. Danach erscheint sie hier und du kannst die Challenge starten.</p>
                <button type="button" onClick={() => gehe({ ansicht: "konto" })} style={knopf()}>Klasse anlegen</button>
              </div>
            )}
            {rolle === "schueler" && <Beitreten fertig={neu} />}
            <div style={{ ...karte, background: C.sand, boxShadow: "none" }}>
              <p style={kicker}>Spielregeln</p>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.grau, fontSize: 13.5, lineHeight: 1.7, listStyle: "disc" }}>
                <li>Ein Punkt pro richtig gelöster Aufgabe – in jedem Werkzeug der App.</li>
                <li>Woche = Montag bis Sonntag. Am Montag startet die Liste bei null.</li>
                <li>In der Liste stehen nur Spitzname oder Vorname. Ausblenden geht jederzeit.</li>
                <li>Die Klassensumme zählt alle – auch wer ausgeblendet ist, hilft mit.</li>
              </ul>
            </div>
          </>
        )}
    </div>
  );
}
