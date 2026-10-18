/* ============================================================
   Mathilda-Chat – der Tutor mit Gedächtnis
   · Systemprompt aus mathildaKontext.js: Regeln + Lernstand-Auszug (Klasse, Lernpfad, Fehlertypen …)
   · Rechnet nie selbst: api/claude.js führt die Werkzeuge der App aus (werkzeuge: true)
   · Sokratisch: Rückfrage → Hinweis → Teilschritt → Lösung nur auf Wunsch
   · Sprache: Mikrofon (Browser-Spracherkennung) und Vorlesen (Sprachausgabe), wo der Browser es kann
   · Kontingent: angemeldet zählt das Konto (Anzeige „x von y heute“), sonst das Gerät
   Zwei Formen: Modal aus „Ich hänge fest“ (mit Aufgabe) und eingebettet auf der Mathilda-Seite.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { API_URL, C } from "./base1.jsx";
import { LERN } from "./base3.jsx";
import { kiAntwort, kiKopf } from "./base4.jsx";
import { Text } from "./func3.jsx";
import { useLern } from "./func6.jsx";
import { useKonto } from "./konto.js";
import { mathildaSystem } from "./mathildaKontext.js";
import { aktivitaetMelden } from "./func8.jsx";

import { springe } from "./sprung.js";
const ANALYSE_ZAEHLER = "matheplus-blattanalysen";
const blattanalysen = () => { try { return parseInt(localStorage.getItem(ANALYSE_ZAEHLER) || "0", 10) || 0; } catch (e) { return 0; } };

const START = "Woran hängst du gerade? Schreib mir, was du schon hast – oder sprich es ein.";
const WERKZEUG_NAME = { ableiten: "abgeleitet", vereinfachen: "vereinfacht", funktionswert: "Funktionswert berechnet", funktion_untersuchen: "Kurve untersucht", gleichung_loesen: "Gleichung gelöst", binomialverteilung: "Binomialverteilung berechnet", hypothesentest: "Ablehnungsbereich bestimmt" };

/* Spracherkennung des Browsers (Chrome, Safari); null, wenn nicht vorhanden */
const Erkennung = () => (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
const vorlesbar = () => typeof window !== "undefined" && "speechSynthesis" in window;
function vorlesen(text) {
  if (!vorlesbar()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\$[^$]*\$/g, " Formel ").replace(/\s+/g, " "));
    u.lang = "de-DE"; u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch (e) { /* nicht verfügbar */ }
}

export function useMathildaChat({ aufgabe = null } = {}) {
  const L = useLern();
  const konto = useKonto();
  const [verlauf, setVerlauf] = useState([{ rolle: "mathilda", text: START }]);
  const [laedt, setLaedt] = useState(false);
  const [kontingent, setKontingent] = useState(null);
  const [fehler, setFehler] = useState("");
  const senden = async (t) => {
    const text = String(t || "").trim();
    if (!text || laedt) return;
    const neu = [...verlauf, { rolle: "schueler", text }];
    setVerlauf(neu); setLaedt(true); setFehler("");
    try { aktivitaetMelden({ hilfe: true }); } catch (e) { /* optional */ }
    const system = mathildaSystem({ L: LERN, profil: konto.profil, blattanalysen: blattanalysen(), aufgabe });
    const nachrichten = neu.slice(1).map((m) => ({ role: m.rolle === "schueler" ? "user" : "assistant", content: m.text }));
    try {
      const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ system, messages: nachrichten, max_tokens: 700, werkzeuge: true }) });
      const daten = await kiAntwort(res);
      if (daten.error) {
        const k = daten.error.kontingent;
        if (k) setKontingent(k);
        throw new Error(daten.error.message || "Mathilda hat abgelehnt.");
      }
      if (daten.kontingent) setKontingent(daten.kontingent);
      let antwort = (daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join("").trim();
      if (!antwort) antwort = "Da ist gerade etwas schiefgegangen. Magst du es noch einmal schreiben?";
      const werkzeuge = (daten.werkzeuge || []).map((w) => WERKZEUG_NAME[w.name] || w.name);
      setVerlauf([...neu, { rolle: "mathilda", text: antwort, werkzeuge }]);
    } catch (e) {
      setFehler(e.message || "Mathilda ist gerade nicht erreichbar.");
      setVerlauf(neu);
    } finally { setLaedt(false); }
  };
  const neustart = () => { setVerlauf([{ rolle: "mathilda", text: START }]); setFehler(""); };
  return { verlauf, senden, laedt, kontingent, fehler, neustart, angemeldet: !!(konto && konto.nutzer), L };
}

function Mikrofon({ onText, aktiv, setAktiv }) {
  const R = Erkennung();
  const ref = useRef(null);
  if (!R) return null;
  const start = () => {
    try {
      const r = new R();
      r.lang = "de-DE"; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = (ev) => { const t = Array.from(ev.results).map((x) => x[0].transcript).join(" "); onText(t); };
      r.onend = () => setAktiv(false);
      r.onerror = () => setAktiv(false);
      ref.current = r; r.start(); setAktiv(true);
    } catch (e) { setAktiv(false); }
  };
  const stopp = () => { try { ref.current && ref.current.stop(); } catch (e) { /* egal */ } setAktiv(false); };
  return (
    <button type="button" onClick={aktiv ? stopp : start} aria-pressed={aktiv} aria-label={aktiv ? "Aufnahme beenden" : "Einsprechen"} title={aktiv ? "Aufnahme beenden" : "Einsprechen"}
      style={{ width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${aktiv ? C.signal : C.linie}`, background: aktiv ? "#FCE8EE" : C.weiss, color: aktiv ? C.signal : C.see, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
      </svg>
    </button>
  );
}

function Verlauf({ verlauf, laedt, fehler, endeRef, aufgabe }) {
  return (
    <>
      {aufgabe && aufgabe.text && (
        <div style={{ background: C.weiss, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13.5, color: C.grau }}>
          <Text s={aufgabe.text} style={{ margin: 0, lineHeight: 1.7 }} />
        </div>
      )}
      {verlauf.map((m, i) => (
        <div key={i} style={{ display: "flex", justifyContent: m.rolle === "schueler" ? "flex-end" : "flex-start", marginBottom: 10 }}>
          <div style={{ maxWidth: "86%", padding: "10px 14px", borderRadius: 16,
            background: m.rolle === "schueler" ? C.see : C.weiss, color: m.rolle === "schueler" ? C.weiss : C.tinte,
            boxShadow: m.rolle === "schueler" ? "none" : "0 2px 10px rgba(15,26,51,0.06)",
            borderBottomRightRadius: m.rolle === "schueler" ? 4 : 16, borderBottomLeftRadius: m.rolle === "schueler" ? 16 : 4 }}>
            <Text s={m.text} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7 }} />
            {m.werkzeuge && m.werkzeuge.length > 0 && (
              <p style={{ fontSize: 11.5, color: C.grau, marginTop: 6 }}>⚙ Mit der App nachgerechnet: {[...new Set(m.werkzeuge)].join(", ")}</p>
            )}
            {m.rolle === "mathilda" && i > 0 && vorlesbar() && (
              <button type="button" onClick={() => vorlesen(m.text)} aria-label="Antwort vorlesen"
                style={{ background: "none", border: "none", color: C.see, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "4px 0 0" }}>🔊 Vorlesen</button>
            )}
          </div>
        </div>
      ))}
      {laedt && <p style={{ fontSize: 13, color: C.hellgrau }}>Mathilda denkt nach – und rechnet mit der App nach …</p>}
      {fehler && <p role="alert" style={{ fontSize: 13, color: C.signal, lineHeight: 1.5 }}>{fehler}</p>}
      <div ref={endeRef} />
    </>
  );
}

function Eingabe({ senden, laedt, chat }) {
  const [text, setText] = useState("");
  const [mikro, setMikro] = useState(false);
  const ab = () => { const t = text; setText(""); senden(t); };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Mikrofon aktiv={mikro} setAktiv={setMikro} onText={(t) => { setText(t); senden(t); }} />
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ab()} placeholder={mikro ? "Ich höre zu …" : "Schreib Mathilda …"} aria-label="Nachricht an Mathilda"
          style={{ flex: 1, minWidth: 0, minHeight: 44, padding: "10px 14px", fontSize: 15, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 999, outline: "none", background: C.weiss }} />
        <button type="button" onClick={ab} disabled={laedt || !text.trim()}
          style={{ minHeight: 44, padding: "0 16px", background: text.trim() && !laedt ? C.gruenDunkel : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Senden
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: C.hellgrau, marginTop: 8, lineHeight: 1.5 }}>
        {chat.kontingent && chat.kontingent.limit ? `Heute ${chat.kontingent.anzahl} von ${chat.kontingent.limit} Anfragen · ` : chat.kontingent && chat.kontingent.plan === "pro" ? "Pro: ohne Tagesgrenze · " : !chat.angemeldet ? "Nicht angemeldet: Kontingent je Gerät · " : ""}
        Mathilda verrät Ergebnisse nur auf Wunsch und rechnet mit den Werkzeugen der App nach.
      </p>
    </div>
  );
}

/* Modal aus „Ich hänge fest“: aufgabe = { text, eingabe, regeln: [string], loesung } */
export function MathildaChatModal({ aufgabe, schliessen, onHilfe }) {
  const chat = useMathildaChat({ aufgabe });
  const endeRef = useRef(null);
  const zuRef = useRef(null);
  useEffect(() => { springe("chat", () => endeRef.current?.scrollIntoView({ behavior: "smooth" })); }, [chat.verlauf.length, chat.laedt]);
  useEffect(() => {
    const vorher = document.body.style.overflow; document.body.style.overflow = "hidden"; zuRef.current?.focus();
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    window.addEventListener("keydown", taste);
    return () => { document.body.style.overflow = vorher; window.removeEventListener("keydown", taste); };
  }, []);
  const senden = (t) => { try { onHilfe && onHilfe("mathilda", 2); } catch (e) { /* optional */ } chat.senden(t); };
  return createPortal(
    <div role="presentation" onClick={schliessen} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(10,20,45,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div role="dialog" aria-modal="true" aria-label="Mathilda fragen" onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 620, maxHeight: "88vh", display: "flex", flexDirection: "column", background: C.sand, borderRadius: "22px 22px 0 0", boxShadow: "0 -10px 40px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: C.seeTief, borderRadius: "22px 22px 0 0" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.01em", color: C.flaggold }}>Mathilda fragen</p>
            <p style={{ color: C.weiss, fontSize: 16, fontWeight: 700 }}>Sie fragt zurück, bevor sie verrät</p>
          </div>
          <button ref={zuRef} type="button" onClick={schliessen} style={{ height: 34, padding: "0 12px", borderRadius: 999, border: "none", background: C.flaggold, color: C.seeTief, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Zurück zur Aufgabe</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}><Verlauf verlauf={chat.verlauf} laedt={chat.laedt} fehler={chat.fehler} endeRef={endeRef} aufgabe={aufgabe} /></div>
        <div style={{ padding: "12px 16px 18px", borderTop: `1px solid ${C.linie}` }}><Eingabe senden={senden} laedt={chat.laedt} chat={chat} /></div>
      </div>
    </div>, document.body);
}

/* Eingebettet auf der Mathilda-Seite (ohne Aufgabe) */
export function MathildaChatSeite() {
  const chat = useMathildaChat();
  const endeRef = useRef(null);
  useEffect(() => { springe("chat", () => endeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })); }, [chat.verlauf.length, chat.laedt]);
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620 }}>
      <div style={{ background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginBottom: 14 }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.01em", color: C.gruenDunkel, marginBottom: 8 }}>Mathilda fragen</p>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>
          Mathilda kennt deinen Lernstand: Klasse, Plan, deine häufigsten Fehlertypen. Sie stellt zuerst eine Rückfrage, gibt dann einen Hinweis und verrät die Lösung nur, wenn du sie ausdrücklich willst. Rechnen lässt sie die App – Ableitungen, Nullstellen, Binomialverteilung.
        </p>
      </div>
      <div style={{ background: C.sand, borderRadius: 16, padding: "4px 0" }}><Verlauf verlauf={chat.verlauf} laedt={chat.laedt} fehler={chat.fehler} endeRef={endeRef} /></div>
      <div style={{ marginTop: 10 }}><Eingabe senden={chat.senden} laedt={chat.laedt} chat={chat} /></div>
      {chat.verlauf.length > 1 && (
        <button type="button" onClick={chat.neustart} style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "12px 0", minHeight: 44 }}>Neues Gespräch</button>
      )}
    </div>
  );
}
