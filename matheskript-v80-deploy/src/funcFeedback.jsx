/* ======================================================================
   FEEDBACK PER SPRACHNACHRICHT
   Schwebender Knopf am rechten Bildschirmrand (position: fixed – wandert beim
   Scrollen mit nach unten, auf jeder Seite vorhanden). Ein Tipp öffnet ein
   kleines Fenster: aufnehmen, anhören, senden. Die Seite, auf der das
   Feedback gegeben wird, hängt automatisch an der Nachricht.

   Ablage: Supabase (privater Speicher „feedback“ + Tabelle public.feedback,
   siehe supabase/schema.sql). Lesen kann nur der Betreiber im Dashboard.
   Ohne Supabase-Zugang (Demo-Modus) wird nichts gesendet.
   ====================================================================== */
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { NAV } from "./base4.jsx";
import { sb } from "./konto.js";
import { sprache } from "./i18n.js";

const MAX_SEKUNDEN = 120;
const MIN_SEKUNDEN = 2;
const BUCKET = "feedback";

/* ---------- Welche Seite ist gerade offen? ---------- */
const ANSICHT_NAMEN = { start: "Startseite", konto: "Konto", elternabend: "Elternabend", formeln: "Formelsammlung", impressum: "Impressum", agb: "AGB", widerruf: "Widerruf" };

export function seitenInfo(a) {
  const alle = NAV.flatMap((g) => g.eintraege.map((e) => ({ g, e })));
  const treffer = alle.find(({ e }) =>
    e.ansicht === a.ansicht &&
    (e.ziel === undefined || e.ziel === (a.ziel ?? null)) &&
    (e.klasse === undefined || e.klasse === a.klasse) &&
    (e.foto === undefined || e.foto === a.foto));
  const name = treffer ? `${treffer.g.name} › ${treffer.e.name}` : (ANSICHT_NAMEN[a.ansicht] || a.ansicht);
  let ueberschrift = "";
  try { ueberschrift = (document.querySelector("h1")?.textContent || "").replace(/­/g, "").trim().slice(0, 120); } catch (e) { /* egal */ }
  return { name, ueberschrift };
}

/* ---------- kleine Helfer ---------- */
const waehleMime = () => {
  const kandidaten = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  try { return kandidaten.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || ""; } catch (e) { return ""; }
};
const neueId = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const zeit = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function MikroIcon({ groesse = 20, farbe = "currentColor" }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none" stroke={farbe} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

/* ---------- Der Knopf mit dem Aufnahmefenster ---------- */
export function FeedbackKnopf({ aktuell }) {
  const [offen, setOffen] = useState(false);
  const [phase, setPhase] = useState("ruhe");       // ruhe | aufnahme | fertig | sendet | gesendet
  const [sek, setSek] = useState(0);
  const [zustimmung, setZustimmung] = useState(false);
  const [meldung, setMeldung] = useState("");
  const [seite, setSeite] = useState({ name: "", ueberschrift: "" });
  const [audioUrl, setAudioUrl] = useState(null);

  const rec = useRef(null);
  const strom = useRef(null);
  const stuecke = useRef([]);
  const blobRef = useRef(null);
  const start = useRef(0);
  const takt = useRef(null);
  const verwerfen = useRef(false);

  const aufraeumen = () => {
    clearInterval(takt.current);
    try { if (rec.current && rec.current.state !== "inactive") { verwerfen.current = true; rec.current.stop(); } } catch (e) { /* egal */ }
    try { strom.current && strom.current.getTracks().forEach((t) => t.stop()); } catch (e) { /* egal */ }
    strom.current = null; rec.current = null;
  };
  useEffect(() => () => aufraeumen(), []);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const zuruecksetzen = () => {
    aufraeumen();
    blobRef.current = null; stuecke.current = [];
    setAudioUrl(null); setSek(0); setMeldung(""); setPhase("ruhe");
  };
  const oeffnen = () => { setSeite(seitenInfo(aktuell)); setOffen(true); };
  const schliessen = () => { zuruecksetzen(); setOffen(false); };

  useEffect(() => {
    if (!offen) return;
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [offen]);

  /* Wechselt die Seite bei offenem Fenster, folgt die Seitenangabe mit. */
  useEffect(() => { if (offen && phase !== "gesendet") setSeite(seitenInfo(aktuell)); }, [aktuell.ansicht, aktuell.ziel, aktuell.klasse, aktuell.foto]);

  const aufnehmen = async () => {
    setMeldung("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof window.MediaRecorder === "undefined") {
      setMeldung("Dieser Browser kann keine Sprachaufnahmen. Bitte öffne die Seite in Chrome, Safari oder Firefox.");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      strom.current = s;
      const mime = waehleMime();
      const r = mime ? new MediaRecorder(s, { mimeType: mime, audioBitsPerSecond: 32000 }) : new MediaRecorder(s);
      stuecke.current = []; verwerfen.current = false;
      r.ondataavailable = (e) => { if (e.data && e.data.size) stuecke.current.push(e.data); };
      r.onstop = () => {
        try { s.getTracks().forEach((t) => t.stop()); } catch (e) { /* egal */ }
        if (verwerfen.current) return;
        const art = r.mimeType || mime || "audio/webm";
        const blob = new Blob(stuecke.current, { type: art });
        blobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        setPhase("fertig");
      };
      rec.current = r;
      r.start(1000);
      start.current = Date.now();
      setSek(0); setPhase("aufnahme");
      takt.current = setInterval(() => {
        const t = (Date.now() - start.current) / 1000;
        setSek(t);
        if (t >= MAX_SEKUNDEN) stoppen();
      }, 250);
    } catch (e) {
      const verweigert = e && (e.name === "NotAllowedError" || e.name === "SecurityError");
      setMeldung(verweigert
        ? "Das Mikrofon ist nicht freigegeben. Erlaube den Zugriff in deinem Browser und versuche es noch einmal."
        : "Ich finde kein Mikrofon. Ist eines angeschlossen?");
      setPhase("ruhe");
    }
  };

  const stoppen = () => {
    clearInterval(takt.current);
    try { if (rec.current && rec.current.state !== "inactive") rec.current.stop(); } catch (e) { /* egal */ }
  };

  const senden = async () => {
    const blob = blobRef.current;
    if (!blob) return;
    if (sek < MIN_SEKUNDEN) { setMeldung("Die Nachricht ist sehr kurz. Nimm sie bitte noch einmal auf."); return; }
    if (!zustimmung) { setMeldung("Bitte setze zuerst den Haken bei der Einwilligung."); return; }
    if (!sb) { setMeldung("Senden ist in dieser Vorschau noch nicht eingerichtet (Demo-Modus)."); return; }
    setMeldung(""); setPhase("sendet");
    try {
      const art = (blob.type || "audio/webm").split(";")[0];
      const endung = art.includes("mp4") ? "m4a" : art.includes("ogg") ? "ogg" : "webm";
      const pfad = `${new Date().toISOString().slice(0, 10)}/${neueId()}.${endung}`;
      const hoch = await sb.storage.from(BUCKET).upload(pfad, blob, { contentType: art, upsert: false });
      if (hoch.error) throw hoch.error;
      const { ziel, klasse, kurs, bereich, trainer, land, kompetenz, foto } = aktuell;
      const eintrag = await sb.from("feedback").insert({
        seite: seite.name,
        ansicht: aktuell.ansicht,
        ueberschrift: seite.ueberschrift || null,
        details: JSON.parse(JSON.stringify({ ziel, klasse, kurs, bereich, trainer, land, kompetenz, foto })),
        audio_pfad: pfad,
        dauer_s: Math.round(sek),
        sprache: sprache(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        geraet: String(navigator.userAgent || "").slice(0, 200),
      });
      if (eintrag.error) throw eintrag.error;
      blobRef.current = null; setAudioUrl(null);
      setPhase("gesendet");
    } catch (e) {
      setPhase("fertig");
      setMeldung("Das Senden hat nicht geklappt. Bitte versuche es gleich noch einmal.");
    }
  };

  const gross = { fontFamily: "Montserrat, system-ui, sans-serif" };
  const knopfStil = (hell) => ({ ...gross, cursor: "pointer", border: hell ? `1px solid ${C.linie}` : "none", borderRadius: 10, minHeight: 44, padding: "0 16px",
    fontSize: 14, fontWeight: 700, background: hell ? C.weiss : C.see, color: hell ? C.see : "#fff" });

  return createPortal(
    <>
      <style>{`
        .fb-tab{position:fixed;right:0;bottom:54px;z-index:35;display:flex;flex-direction:column;align-items:center;gap:8px;
          padding:12px 7px 10px;border:none;border-radius:12px 0 0 12px;cursor:pointer;color:#fff;font-family:Montserrat,system-ui,sans-serif;
          background:${C.see};box-shadow:-3px 4px 14px rgba(8,23,59,.28);border-left:3px solid ${C.flaggold};transition:padding .15s ease,background .15s ease}
        .fb-tab:hover,.fb-tab:focus-visible{padding-right:11px;background:${C.seeTief}}
        .fb-tab span{writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;font-weight:700;letter-spacing:.08em}
        .fb-panel{position:fixed;z-index:60;right:12px;bottom:12px;width:min(360px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow-y:auto;
          background:${C.sand};border-radius:16px;box-shadow:0 18px 48px rgba(8,23,59,.4);padding:16px 16px 18px;font-family:Montserrat,system-ui,sans-serif;color:${C.tinte}}
        @keyframes fbPuls{0%,100%{box-shadow:0 0 0 0 rgba(185,138,0,.5)}50%{box-shadow:0 0 0 10px rgba(185,138,0,0)}}
        .fb-rec{animation:fbPuls 1.4s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.fb-rec{animation:none}}
        @media print{.fb-tab,.fb-panel{display:none}}
      `}</style>

      {!offen && (
        <button type="button" className="fb-tab" onClick={oeffnen} aria-label="Feedback per Sprachnachricht geben">
          <MikroIcon groesse={20} farbe={C.flaggold} />
          <span>Feedback</span>
        </button>
      )}

      {offen && (
        <div role="dialog" aria-label="Feedback per Sprachnachricht" className="fb-panel">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.see, lineHeight: 1.25 }}>Sag uns, was du denkst</div>
              <div style={{ fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.5, marginTop: 3 }}>
                Was findest du gut? Was verstehst du nicht? Sprich einfach drauflos.
              </div>
            </div>
            <button type="button" onClick={schliessen} aria-label="Schließen"
              style={{ ...gross, flex: "0 0 auto", cursor: "pointer", background: "none", border: "none", fontSize: 22, lineHeight: 1, color: C.see, padding: "2px 6px", minHeight: 36 }}>×</button>
          </div>

          <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 10, background: C.weiss, border: `1px solid ${C.linie}`, fontSize: 12, lineHeight: 1.45 }}>
            <span style={{ color: C.grau, fontWeight: 600 }}>Deine Nachricht gehört zu:</span>{" "}
            <b data-kein-i18n style={{ color: C.tinte, fontWeight: 700 }}>{seite.name}</b>
          </div>

          {phase === "gesendet" ? (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.see }}>Danke dir!</div>
              <div style={{ fontSize: 13, color: C.grau, lineHeight: 1.5, marginTop: 4 }}>Deine Sprachnachricht ist angekommen.</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
                <button type="button" onClick={zuruecksetzen} style={knopfStil(true)}>Noch eine Nachricht</button>
                <button type="button" onClick={schliessen} style={knopfStil(false)}>Fertig</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                {phase === "ruhe" && (
                  <button type="button" onClick={aufnehmen} aria-label="Aufnahme starten"
                    style={{ ...gross, cursor: "pointer", width: 72, height: 72, borderRadius: "50%", border: "none", background: C.gruen, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MikroIcon groesse={30} farbe="#fff" />
                  </button>
                )}
                {phase === "aufnahme" && (
                  <button type="button" onClick={stoppen} aria-label="Aufnahme beenden" className="fb-rec"
                    style={{ ...gross, cursor: "pointer", width: 72, height: 72, borderRadius: "50%", border: "none", background: C.gruen, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 5, background: "#fff", display: "block" }} />
                  </button>
                )}
                {(phase === "fertig" || phase === "sendet") && audioUrl && (
                  <audio controls src={audioUrl} style={{ width: "100%", height: 40 }} />
                )}
                <div aria-live="polite" style={{ fontSize: 13, fontWeight: 600, color: C.grau, fontVariantNumeric: "tabular-nums" }}>
                  {phase === "ruhe" && "Tippe zum Aufnehmen"}
                  {phase === "aufnahme" && `Aufnahme läuft · ${zeit(sek)} / ${zeit(MAX_SEKUNDEN)} · tippe zum Beenden`}
                  {phase === "fertig" && `Aufnahme · ${zeit(sek)}`}
                  {phase === "sendet" && "Wird gesendet …"}
                </div>
              </div>

              {(phase === "fertig" || phase === "sendet") && (
                <>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14, fontSize: 12, lineHeight: 1.5, color: C.tinte, cursor: "pointer" }}>
                    <input type="checkbox" checked={zustimmung} onChange={(e) => setZustimmung(e.target.checked)} disabled={phase === "sendet"}
                      style={{ marginTop: 2, width: 18, height: 18, flex: "0 0 auto", accentColor: C.see }} />
                    <span>Ich bin einverstanden, dass meine Sprachnachricht gespeichert und von Mythos Mathe angehört wird, um die App zu verbessern.</span>
                  </label>
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <button type="button" onClick={senden} disabled={phase === "sendet"}
                      style={{ ...knopfStil(false), flex: "1 1 auto", opacity: phase === "sendet" ? 0.6 : 1 }}>Senden</button>
                    <button type="button" onClick={zuruecksetzen} disabled={phase === "sendet"} style={knopfStil(true)}>Neu aufnehmen</button>
                  </div>
                </>
              )}

              {meldung && (
                <div role="alert" style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.5, color: C.gruen, fontWeight: 600 }}>{meldung}</div>
              )}
            </>
          )}
        </div>
      )}
    </>,
    document.body
  );
}
