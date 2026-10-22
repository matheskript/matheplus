/* ======================================================================
   FEEDBACK PER TEXT ODER SPRACHNACHRICHT
   Knopf unten auf jeder Seite. Ein Tipp öffnet die Auswahl „Text senden“ oder
   „Voice senden“. Text: kleines Fenster in der oberen Bildschirmhälfte (die
   Handy-Tastatur verdeckt es nicht). Voice: aufnehmen, anhören, senden. Die Seite,
   auf der das Feedback gegeben wird, hängt automatisch an der Nachricht.
   Die Willkommensseite (funcWillkommen.jsx) kann die Auswahl über das Ereignis
   FEEDBACK_OEFFNEN öffnen.

   Ablage: Supabase (privater Speicher „feedback“ + Tabelle public.feedback,
   siehe supabase/schema.sql; für Texte zusätzlich supabase/feedback-text.sql).
   Lesen kann nur der Betreiber im Dashboard.
   Ohne Supabase-Zugang (Demo-Modus) wird nichts gesendet.
   ====================================================================== */
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { NAV } from "./base4.jsx";
import { sb } from "./konto.js";
import { sprache } from "./i18n.js";
import { FEEDBACK_OEFFNEN } from "./willkommen.js";

export const MAX_SEKUNDEN = 120;
export const MIN_SEKUNDEN = 2;
export const MAX_ZEICHEN = 2000;   // Text-Feedback: so viel erlaubt auch die Datenbank
export const MIN_ZEICHEN = 3;
const BUCKET = "feedback";

/* ---------- Welche Seite ist gerade offen? ---------- */
const ANSICHT_NAMEN = { start: "Startseite", konto: "Konto", elternabend: "Elternabend", formeln: "Formelsammlung", impressum: "Impressum", datenschutz: "Datenschutz", einwilligung: "Eltern-Einwilligung", agb: "AGB", widerruf: "Widerruf" };

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

export function SprechblaseIcon({ groesse = 20, farbe = "currentColor" }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 21 12z" />
    </svg>
  );
}

export function StiftIcon({ groesse = 20, farbe = "currentColor" }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 8.5l2 2" />
    </svg>
  );
}

export { MikroIcon };

export function TextIcon({ groesse = 20, farbe = "currentColor" }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

/* ---------- Sprachaufnahme als Hook (Knopf unten und Feedback-Seite nutzen dieselbe Technik) ----------
   phase: ruhe | aufnahme | fertig | sendet | gesendet (sendet/gesendet setzt der Aufrufer über setPhase).
   Rückgabe: aufnehmen(), stoppen(), zuruecksetzen(), sek, audioUrl, blob() und die Meldung bei Fehlern. */
export function useSprachaufnahme() {
  const [phase, setPhase] = useState("ruhe");
  const [sek, setSek] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [meldung, setMeldung] = useState("");
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

  const stoppen = () => {
    clearInterval(takt.current);
    try { if (rec.current && rec.current.state !== "inactive") rec.current.stop(); } catch (e) { /* egal */ }
  };

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

  const gesendet = () => { blobRef.current = null; setAudioUrl(null); setPhase("gesendet"); };

  return { phase, setPhase, sek, audioUrl, meldung, setMeldung, aufnehmen, stoppen, zuruecksetzen, gesendet, blob: () => blobRef.current };
}

/* Aufnahme in den privaten Speicher laden; liefert den Pfad für die Tabellenzeile (wirft bei Fehler). */
export async function audioHochladen(blob) {
  const art = (blob.type || "audio/webm").split(";")[0];
  const endung = art.includes("mp4") ? "m4a" : art.includes("ogg") ? "ogg" : "webm";
  const pfad = `${new Date().toISOString().slice(0, 10)}/${neueId()}.${endung}`;
  const hoch = await sb.storage.from(BUCKET).upload(pfad, blob, { contentType: art, upsert: false });
  if (hoch.error) throw hoch.error;
  return pfad;
}

/* Gerät und Fenster, wie sie an jeder Feedback-Zeile hängen */
export const geraetDaten = () => ({
  sprache: sprache(),
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  geraet: String(navigator.userAgent || "").slice(0, 200),
});

/* ---------- Der Knopf mit Auswahl, Text-Fenster und Aufnahmefenster ---------- */
export function FeedbackKnopf({ aktuell, gehe }) {
  const [offen, setOffen] = useState(false);
  const [zustimmung, setZustimmung] = useState(false);
  const [seite, setSeite] = useState({ name: "", ueberschrift: "" });
  const [menue, setMenue] = useState(false);               // Auswahl Text / Voice
  const [textOffen, setTextOffen] = useState(false);
  const [text, setText] = useState("");
  const [textPhase, setTextPhase] = useState("ruhe");      // ruhe | sendet | gesendet
  const [textZustimmung, setTextZustimmung] = useState(false);
  const [textMeldung, setTextMeldung] = useState("");
  const aufnahme = useSprachaufnahme();
  const { phase, setPhase, sek, audioUrl, meldung, setMeldung, aufnehmen, stoppen, zuruecksetzen } = aufnahme;

  const oeffnen = () => { setSeite(seitenInfo(aktuell)); setOffen(true); };
  const schliessen = () => { zuruecksetzen(); setOffen(false); };

  /* Auswahl „Text senden“ / „Voice senden“ / „Feedback-Seite“ und das Text-Fenster */
  const aktuellRef = useRef(aktuell);
  aktuellRef.current = aktuell;
  const menueAuf = () => { setSeite(seitenInfo(aktuellRef.current)); setMenue(true); };
  const sprachePanel = () => { setMenue(false); oeffnen(); };
  const textStarten = () => { setMenue(false); setTextMeldung(""); setTextPhase("ruhe"); setTextOffen(true); };
  const textSchliessen = () => { setTextOffen(false); setText(""); setTextZustimmung(false); setTextMeldung(""); setTextPhase("ruhe"); };
  const zurSeite = () => {
    setMenue(false);
    if (typeof gehe === "function") gehe({ ansicht: "feedback" });
    else window.location.assign("/feedback");
  };
  /* Link neben dem Knopf: echter Link (neuer Tab, Rechtsklick, ohne JS), sonst Seitenwechsel in der App */
  const seiteLink = (e) => {
    if (typeof gehe !== "function" || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    gehe({ ansicht: "feedback" });
  };

  /* Die Willkommensseite öffnet die Auswahl über ein Ereignis */
  useEffect(() => {
    const auf = () => menueAuf();
    window.addEventListener(FEEDBACK_OEFFNEN, auf);
    return () => window.removeEventListener(FEEDBACK_OEFFNEN, auf);
  }, []);

  useEffect(() => {
    if (!menue && !textOffen) return;
    const taste = (e) => { if (e.key === "Escape") { if (textOffen) textSchliessen(); else setMenue(false); } };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [menue, textOffen]);

  const textSenden = async () => {
    const t = text.trim();
    if (t.length < MIN_ZEICHEN) { setTextMeldung("Schreib bitte ein paar Worte, dann kannst du senden."); return; }
    if (!textZustimmung) { setTextMeldung("Bitte setze zuerst den Haken bei der Einwilligung."); return; }
    if (!sb) { setTextMeldung("Senden ist in dieser Vorschau noch nicht eingerichtet (Demo-Modus)."); return; }
    setTextMeldung(""); setTextPhase("sendet");
    try {
      const { ziel, klasse, kurs, bereich, trainer, land, kompetenz, foto } = aktuell;
      const eintrag = await sb.from("feedback").insert({
        seite: seite.name,
        ansicht: aktuell.ansicht,
        ueberschrift: seite.ueberschrift || null,
        details: JSON.parse(JSON.stringify({ ziel, klasse, kurs, bereich, trainer, land, kompetenz, foto })),
        nachricht: t.slice(0, MAX_ZEICHEN),
        ...geraetDaten(),
      });
      if (eintrag.error) throw eintrag.error;
      setText(""); setTextPhase("gesendet");
    } catch (e) {
      setTextPhase("ruhe");
      setTextMeldung("Das Senden hat nicht geklappt. Bitte versuche es gleich noch einmal.");
    }
  };

  useEffect(() => {
    if (!offen) return;
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [offen]);

  /* Wechselt die Seite bei offenem Fenster, folgt die Seitenangabe mit. */
  useEffect(() => { if (offen && phase !== "gesendet") setSeite(seitenInfo(aktuell)); }, [aktuell.ansicht, aktuell.ziel, aktuell.klasse, aktuell.foto]);

  const senden = async () => {
    const blob = aufnahme.blob();
    if (!blob) return;
    if (sek < MIN_SEKUNDEN) { setMeldung("Die Nachricht ist sehr kurz. Nimm sie bitte noch einmal auf."); return; }
    if (!zustimmung) { setMeldung("Bitte setze zuerst den Haken bei der Einwilligung."); return; }
    if (!sb) { setMeldung("Senden ist in dieser Vorschau noch nicht eingerichtet (Demo-Modus)."); return; }
    setMeldung(""); setPhase("sendet");
    try {
      const pfad = await audioHochladen(blob);
      const { ziel, klasse, kurs, bereich, trainer, land, kompetenz, foto } = aktuell;
      const eintrag = await sb.from("feedback").insert({
        seite: seite.name,
        ansicht: aktuell.ansicht,
        ueberschrift: seite.ueberschrift || null,
        details: JSON.parse(JSON.stringify({ ziel, klasse, kurs, bereich, trainer, land, kompetenz, foto })),
        audio_pfad: pfad,
        dauer_s: Math.round(sek),
        ...geraetDaten(),
      });
      if (eintrag.error) throw eintrag.error;
      aufnahme.gesendet();
    } catch (e) {
      setPhase("fertig");
      setMeldung("Das Senden hat nicht geklappt. Bitte versuche es gleich noch einmal.");
    }
  };

  const gross = { fontFamily: "Montserrat, system-ui, sans-serif" };
  const knopfStil = (hell) => ({ ...gross, cursor: "pointer", border: hell ? `1px solid ${C.linie}` : "none", borderRadius: 10, minHeight: 44, padding: "0 16px",
    fontSize: 14, fontWeight: 700, background: hell ? C.weiss : C.see, color: hell ? C.see : "#fff" });

  /* Feedback-Knopf unten auf jeder Seite (inline, über der Fußzeile); das Aufnahme-Fenster bleibt ein schwebendes Panel. */
  return (<>
    <div className="fb-fuss">
      <button type="button" className="fb-knopf" onClick={menueAuf} aria-label="Feedback geben, per Text oder Sprachnachricht" aria-haspopup="dialog" aria-expanded={offen || menue || textOffen}>
        <SprechblaseIcon groesse={18} farbe={C.flaggold} />
        <span>Feedback geben</span>
      </button>
      {aktuell.ansicht !== "feedback" && (
        <a className="fb-seite" href="/feedback" onClick={seiteLink} data-feedback-seite-fuss>
          <span>Feedback-Seite</span><i aria-hidden="true">→</i>
        </a>
      )}
    </div>
    {createPortal(
    <>
      <style>{`
        .fb-fuss{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;padding:28px 16px 4px}
        .fb-knopf{display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 22px;border-radius:999px;cursor:pointer;white-space:nowrap;
          font-family:Montserrat,system-ui,sans-serif;font-size:14.5px;font-weight:700;color:${C.see};background:${C.weiss};
          border:1.5px solid ${C.see};box-shadow:0 4px 14px rgba(0,77,152,.12);transition:background .15s ease,color .15s ease}
        .fb-knopf:hover,.fb-knopf:focus-visible{background:${C.see};color:#fff}
        /* Link zur Feedback-Seite neben dem Knopf (Goldrand = Testphase). Tool-Seiten (.fuss-paar.zwei, Teilen | Feedback):
           eigene Zeile darunter, so breit wie das Paar; ein offenes Teilen-Panel (order 3) steht dazwischen. */
        .fb-seite{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 20px;border-radius:999px;box-sizing:border-box;
          font-family:Montserrat,system-ui,sans-serif;font-size:14.5px;font-weight:700;line-height:1.2;white-space:nowrap;text-decoration:none;
          color:${C.seeTief};background:${C.weiss};border:1.5px solid ${C.flaggold};box-shadow:0 4px 14px rgba(185,138,0,.14);transition:background .15s ease}
        .fb-seite i{font-style:normal;font-weight:800;color:${C.flaggold};transition:transform .18s ease}
        .fb-seite:hover,.fb-seite:focus-visible{background:#FFF8DC}
        @media (hover:hover){.fb-seite:hover i{transform:translateX(3px)}}
        .fuss-paar.zwei .fb-seite{order:4;flex:1 1 100%}
        .fb-knopf svg{flex:none}
        /* Handy: Knopf und Link nebeneinander, gleich breit – wie Teilen | Feedback auf den Tool-Seiten; unter 350 px untereinander */
        @media (max-width:439px){
          .fuss-paar:not(.zwei) .fb-fuss{flex-wrap:nowrap;max-width:460px;margin:0 auto;box-sizing:border-box}
          .fuss-paar:not(.zwei) .fb-fuss > *{flex:1 1 0;min-width:0}
          .fb-knopf,.fb-seite{justify-content:center;box-sizing:border-box;font-size:13px;gap:7px;padding:0 10px}
        }
        @media (max-width:349px){
          .fuss-paar:not(.zwei) .fb-fuss{flex-wrap:wrap}
          .fuss-paar:not(.zwei) .fb-fuss > *{flex:0 0 auto;padding:0 18px}
        }
        .fb-panel{position:fixed;z-index:60;right:12px;bottom:12px;width:min(360px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow-y:auto;
          background:${C.sand};border-radius:16px;box-shadow:0 18px 48px rgba(8,23,59,.4);padding:16px 16px 18px;font-family:Montserrat,system-ui,sans-serif;color:${C.tinte}}
        @keyframes fbPuls{0%,100%{box-shadow:0 0 0 0 rgba(185,138,0,.5)}50%{box-shadow:0 0 0 10px rgba(185,138,0,0)}}
        .fb-rec{animation:fbPuls 1.4s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.fb-rec{animation:none}}
        .fb-scrim{position:fixed;inset:0;z-index:1000;background:rgba(8,23,59,.35)}
        .fb-menue,.fb-text{position:fixed;z-index:1001;background:${C.sand};border-radius:16px;box-shadow:0 18px 48px rgba(8,23,59,.4);
          padding:16px;font-family:Montserrat,system-ui,sans-serif;color:${C.tinte}}
        .fb-menue{right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));width:min(340px,calc(100vw - 24px))}
        .fb-text{top:calc(env(safe-area-inset-top,0px) + 12px);left:50%;transform:translateX(-50%);width:min(420px,calc(100vw - 24px));
          max-height:calc(50vh - 12px);max-height:calc(50dvh - 12px);overflow-y:auto}
        .fb-wahl{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 12px;border-radius:12px;cursor:pointer;text-align:left;
          font-family:inherit;color:${C.tinte};background:${C.weiss};border:1px solid ${C.linie}}
        .fb-wahl:hover,.fb-wahl:focus-visible{border-color:${C.see}}
        .fb-wahl b{display:block;font-size:14px;font-weight:700;color:${C.see}}
        .fb-wahl small{display:block;font-size:12px;font-weight:500;line-height:1.4;color:${C.grau}}
        .fb-wahl-ico{flex:0 0 auto;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:${C.see}}
        @media print{.fb-fuss,.fb-panel,.fb-scrim,.fb-menue,.fb-text{display:none}}
      `}</style>

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
                    <span>Ich bin einverstanden, dass meine Sprachnachricht gespeichert und von Mythos Mathe angehört wird, um die App zu verbessern. Löschung spätestens nach zwölf Monaten, Details in der <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Datenschutzerklärung</a>.</span>
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

      {menue && (
        <>
          <div className="fb-scrim" aria-hidden="true" onClick={() => setMenue(false)} />
          <div role="dialog" aria-label="Feedback geben" className="fb-menue">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.see, lineHeight: 1.25 }}>Wie möchtest du Feedback geben?</div>
              <button type="button" onClick={() => setMenue(false)} aria-label="Schließen"
                style={{ ...gross, flex: "0 0 auto", cursor: "pointer", background: "none", border: "none", fontSize: 22, lineHeight: 1, color: C.see, padding: "2px 6px", minHeight: 36 }}>×</button>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="button" className="fb-wahl" onClick={textStarten}>
                <span className="fb-wahl-ico"><TextIcon groesse={18} farbe={C.flaggold} /></span>
                <span><b>Text senden</b><small>Schreib uns, was dir gefällt und was dir fehlt.</small></span>
              </button>
              <button type="button" className="fb-wahl" onClick={sprachePanel}>
                <span className="fb-wahl-ico"><MikroIcon groesse={18} farbe={C.flaggold} /></span>
                <span><b>Voice senden</b><small>Sprich einfach drauflos.</small></span>
              </button>
              {aktuell.ansicht !== "feedback" && (
                <button type="button" className="fb-wahl fb-wahl-seite" onClick={zurSeite} data-feedback-seite-link>
                  <span className="fb-wahl-ico"><StiftIcon groesse={18} farbe={C.flaggold} /></span>
                  <span><b>Ausführlich auf der Feedback-Seite</b><small>Was ist gut, was unklar, was fehlt – Schritt für Schritt.</small></span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {textOffen && (
        <>
          <div className="fb-scrim" aria-hidden="true" />
          <form role="dialog" aria-label="Feedback per Text" className="fb-text" noValidate
            onSubmit={(e) => { e.preventDefault(); textSenden(); }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.see, lineHeight: 1.25 }}>Dein Feedback</div>
              <button type="button" onClick={textSchliessen} aria-label="Schließen"
                style={{ ...gross, flex: "0 0 auto", cursor: "pointer", background: "none", border: "none", fontSize: 22, lineHeight: 1, color: C.see, padding: "2px 6px", minHeight: 36 }}>×</button>
            </div>

            {textPhase === "gesendet" ? (
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.see }}>Danke dir!</div>
                <div style={{ fontSize: 13, color: C.grau, lineHeight: 1.5, marginTop: 4 }}>Dein Text ist angekommen.</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => { setTextPhase("ruhe"); setTextZustimmung(false); }} style={knopfStil(true)}>Noch ein Text</button>
                  <button type="button" onClick={textSchliessen} style={knopfStil(false)}>Fertig</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.45 }}>
                  <span style={{ color: C.grau, fontWeight: 600 }}>Gehört zu:</span>{" "}
                  <b data-kein-i18n style={{ color: C.tinte, fontWeight: 700 }}>{seite.name}</b>
                </div>
                <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX_ZEICHEN}
                  disabled={textPhase === "sendet"} aria-label="Dein Feedback als Text" placeholder="Was gefällt dir? Was fehlt dir noch?"
                  style={{ ...gross, display: "block", boxSizing: "border-box", width: "100%", height: 84, marginTop: 10, resize: "none", padding: 10, borderRadius: 10,
                    border: `1px solid ${C.linie}`, background: C.weiss, color: C.tinte, fontSize: 16, lineHeight: 1.45 }} />
                <label style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 10, fontSize: 12, lineHeight: 1.5, color: C.tinte, cursor: "pointer" }}>
                  <input type="checkbox" checked={textZustimmung} onChange={(e) => setTextZustimmung(e.target.checked)} disabled={textPhase === "sendet"}
                    style={{ marginTop: 2, width: 18, height: 18, flex: "0 0 auto", accentColor: C.see }} />
                  <span>Ich bin einverstanden, dass mein Text gespeichert und von Mythos Mathe gelesen wird, um die App zu verbessern. Löschung spätestens nach zwölf Monaten, Details in der <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Datenschutzerklärung</a>.</span>
                </label>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button type="submit" disabled={textPhase === "sendet"} style={{ ...knopfStil(false), flex: "1 1 auto", opacity: textPhase === "sendet" ? 0.6 : 1 }}>
                    {textPhase === "sendet" ? "Wird gesendet …" : "Senden"}
                  </button>
                  <button type="button" onClick={textSchliessen} disabled={textPhase === "sendet"} style={knopfStil(true)}>Abbrechen</button>
                </div>
                {textMeldung && (
                  <div role="alert" style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.5, color: C.gruen, fontWeight: 600 }}>{textMeldung}</div>
                )}
              </>
            )}
          </form>
        </>
      )}
    </>,
    document.body
    )}
  </>);
}
