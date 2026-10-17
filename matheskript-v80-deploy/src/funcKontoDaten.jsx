/* ======================================================================
   Konto: Meine Daten (Export, Löschen) und Eltern-Wochenmail
   Datenbank: supabase/konto.sql, supabase/wochenmail.sql
   ====================================================================== */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { abmelden } from "./konto.js";
import { kontoExport, kontoLoeschen, wochenmailSetzen, wochenmailStand } from "./kontoRollen.js";
import { installHoeren, installieren, istInstalliert, istIOS, kannInstallieren, pushAusschalten, pushEinschalten, pushStand } from "./push.js";

const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 3px 18px rgba(15,26,51,0.07)", padding: 18, marginBottom: 14 };
const kicker = { fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, marginBottom: 10 };
const text = { fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.65, margin: 0 };
const knopf = (farbe = C.see, voll = false) => ({ minHeight: 44, padding: "0 18px", borderRadius: 999, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
  border: `1.5px solid ${voll ? farbe : C.linie}`, background: voll ? farbe : C.weiss, color: voll ? C.weiss : farbe });

export function DatenKarte({ gehe }) {
  const [export_, setExport] = useState("");
  const [loeschen, setLoeschen] = useState(false);
  const [wort, setWort] = useState("");
  const [geraet, setGeraet] = useState(true);
  const [status, setStatus] = useState("");

  const herunterladen = async () => {
    setExport("laden");
    try {
      const d = await kontoExport();
      const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mythosmathe-daten-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      setExport("ok");
    } catch (e) { setExport("fehler"); }
  };

  const endgueltig = async () => {
    setStatus("laden");
    try {
      const r = await kontoLoeschen(wort.trim().toUpperCase());
      if (r.status === "abo_aktiv") { setStatus("abo"); return; }
      if (r.status !== "geloescht") { setStatus("fehler"); return; }
      if (geraet) { try { Object.keys(localStorage).filter((k) => /^(mm-|matheplus|matheskript)/.test(k)).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* privat */ } }
      setStatus("weg");
      try { await abmelden(); } catch (e) { /* Sitzung ist ohnehin ungültig */ }
      setTimeout(() => gehe && gehe({ ansicht: "start" }), 2500);
    } catch (e) { setStatus("fehler"); }
  };

  if (status === "weg") return (
    <div style={{ ...karte, borderTop: `4px solid ${C.smaragd}` }} role="status">
      <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, margin: "0 0 6px" }}>Dein Konto ist gelöscht.</p>
      <p style={text}>Alle Daten im Konto sind entfernt. Danke, dass du Mythos Mathe ausprobiert hast.</p>
    </div>
  );

  return (
    <div style={karte}>
      <p style={kicker}>DEINE DATEN</p>
      <p style={text}>Alles, was in deinem Konto gespeichert ist – Profil, Lernstand, Fortschritt, Verbindungen und Abos – als Datei zum Herunterladen.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
        <button type="button" onClick={herunterladen} disabled={export_ === "laden"} style={knopf(C.see, true)}>{export_ === "laden" ? "Wird erstellt …" : "Daten exportieren"}</button>
        {export_ === "ok" && <span role="status" style={{ fontSize: 13, color: C.smaragd }}>Datei heruntergeladen.</span>}
        {export_ === "fehler" && <span role="alert" style={{ fontSize: 13, color: C.signal }}>Export nicht möglich. Bitte später noch einmal.</span>}
      </div>

      <div style={{ borderTop: `1px solid ${C.linie}`, marginTop: 18, paddingTop: 14 }}>
        {!loeschen ? (
          <button type="button" onClick={() => setLoeschen(true)} style={{ background: "none", border: "none", padding: 0, fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: C.signal, cursor: "pointer", textDecoration: "underline" }}>
            Konto löschen …
          </button>
        ) : (
          <div style={{ background: "#FDF1F5", border: "1px solid #F3D3DF", borderRadius: 14, padding: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#9C3A5E", margin: "0 0 6px" }}>Konto endgültig löschen</p>
            <p style={{ ...text, color: C.tinte }}>Profil, Lernstand, Fortschritt, Klassen und Verbindungen zu Eltern werden sofort gelöscht. Das lässt sich nicht rückgängig machen. Tipp: vorher die Daten exportieren.</p>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, color: C.tinte, margin: "10px 0" }}>
              <input type="checkbox" checked={geraet} onChange={(e) => setGeraet(e.target.checked)} /> Auch die Daten auf diesem Gerät löschen
            </label>
            <label style={{ display: "block", fontSize: 13, color: C.grau, marginBottom: 6 }}>Zur Bestätigung <b>LÖSCHEN</b> eintippen:</label>
            <input value={wort} onChange={(e) => setWort(e.target.value)} aria-label="Bestätigung" autoComplete="off"
              style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.linie}`, borderRadius: 12, padding: "10px 12px", fontSize: 16, fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button type="button" onClick={() => { setLoeschen(false); setWort(""); setStatus(""); }} style={knopf()}>Abbrechen</button>
              <button type="button" onClick={endgueltig} disabled={wort.trim().toUpperCase() !== "LÖSCHEN" || status === "laden"}
                style={{ ...knopf(C.signal, true), opacity: wort.trim().toUpperCase() === "LÖSCHEN" ? 1 : 0.4 }}>{status === "laden" ? "Wird gelöscht …" : "Endgültig löschen"}</button>
            </div>
            {status === "abo" && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 10, lineHeight: 1.5 }}>Du hast noch ein laufendes Abo. Bitte kündige es zuerst unter „Abo verwalten“ – danach kannst du das Konto löschen.</p>}
            {status === "fehler" && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 10 }}>Das hat nicht geklappt. Bitte versuch es noch einmal.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export function WochenmailKarte() {
  const [d, setD] = useState(null);
  const [fehler, setFehler] = useState("");
  useEffect(() => { wochenmailStand().then(setD).catch(() => setD({ an: true, fehlt: true })); }, []);
  const schalten = async () => {
    setFehler("");
    const neu = !(d && d.an);
    try { await wochenmailSetzen(neu); setD({ ...d, an: neu }); } catch (e) { setFehler("Das hat nicht geklappt."); }
  };
  if (!d) return null;
  return (
    <div style={karte}>
      <p style={kicker}>WOCHENMAIL</p>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <p style={{ ...text, flex: 1 }}>Jeden Sonntag eine kurze Mail: an wie vielen Tagen geübt wurde, Lernzeit und gelöste Aufgaben – keine Noten.</p>
        <button type="button" role="switch" aria-checked={!!d.an} aria-label="Wochenmail" onClick={schalten}
          style={{ flexShrink: 0, width: 54, height: 32, borderRadius: 999, border: "none", padding: 3, cursor: "pointer", background: d.an ? C.smaragd : C.hellgrau, transition: "background .15s" }}>
          <span style={{ display: "block", width: 26, height: 26, borderRadius: 999, background: C.weiss, transform: `translateX(${d.an ? 22 : 0}px)`, transition: "transform .15s" }} />
        </button>
      </div>
      {d.zuletzt && <p style={{ fontSize: 12.5, color: C.hellgrau, margin: "8px 0 0" }}>Zuletzt verschickt: {new Date(d.zuletzt).toLocaleDateString("de-DE")}</p>}
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, marginTop: 8 }}>{fehler}</p>}
    </div>
  );
}

/* ---------- App installieren und Erinnerungen ---------- */
export function AppKarte() {
  const [, setTick] = useState(0);
  const [push, setPush] = useState(null);
  const [meldung, setMeldung] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  useEffect(() => installHoeren(() => setTick((t) => t + 1)), []);
  useEffect(() => { pushStand().then(setPush).catch(() => setPush({ moeglich: false })); }, []);
  const installiert = istInstalliert();
  const schalten = async () => {
    setMeldung(""); setLaeuft(true);
    try {
      if (push && push.an) { await pushAusschalten(); setPush({ ...push, an: false }); }
      else { await pushEinschalten(); setPush({ ...push, an: true }); setMeldung("Erinnerung ist an. Sie kommt nur an Tagen, an denen du noch nicht geübt hast."); }
    } catch (e) { setMeldung(e.message); }
    setLaeuft(false);
  };
  return (
    <div style={karte}>
      <p style={kicker}>APP UND ERINNERUNG</p>
      {!installiert && (
        <div style={{ marginBottom: 14 }}>
          <p style={text}>Mythos Mathe lässt sich wie eine App auf den Startbildschirm legen – mit eigenem Symbol, ohne Browserleiste und auch offline.</p>
          {kannInstallieren() ? <button type="button" onClick={installieren} style={{ ...knopf(C.see, true), marginTop: 10 }}>Auf den Startbildschirm</button>
            : istIOS() ? <p style={{ ...text, marginTop: 8, color: C.tinte }}>iPhone/iPad: in Safari auf <b>Teilen</b> tippen, dann <b>Zum Home-Bildschirm</b>.</p>
              : <p style={{ ...text, marginTop: 8, fontSize: 13 }}>Im Browser-Menü: „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.</p>}
        </div>
      )}
      {push && push.moeglich ? (
        <div style={{ display: "flex", gap: 14, alignItems: "center", borderTop: installiert ? "none" : `1px solid ${C.linie}`, paddingTop: installiert ? 0 : 14 }}>
          <p style={{ ...text, flex: 1 }}>Tägliche Erinnerung am Nachmittag – nur, wenn du an dem Tag noch nicht geübt hast.</p>
          <button type="button" role="switch" aria-checked={!!push.an} aria-label="Push-Erinnerung" onClick={schalten} disabled={laeuft}
            style={{ flexShrink: 0, width: 54, height: 32, borderRadius: 999, border: "none", padding: 3, cursor: "pointer", background: push.an ? C.smaragd : C.hellgrau, transition: "background .15s" }}>
            <span style={{ display: "block", width: 26, height: 26, borderRadius: 999, background: C.weiss, transform: `translateX(${push.an ? 22 : 0}px)`, transition: "transform .15s" }} />
          </button>
        </div>
      ) : push && istIOS() && !installiert ? (
        <p style={{ ...text, fontSize: 13 }}>Erinnerungen gibt es auf dem iPhone, sobald die App auf dem Home-Bildschirm liegt.</p>
      ) : null}
      {meldung && <p role="status" style={{ fontSize: 13, color: C.grau, marginTop: 8, lineHeight: 1.5 }}>{meldung}</p>}
    </div>
  );
}
