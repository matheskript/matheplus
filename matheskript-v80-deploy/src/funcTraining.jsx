/* ============================================================
   Persönliches Training (Etappe 3, Paket B)
   · Mein Training – kleine einklappbare Zeile auf der Startseite
   · 5 Minuten Mathe – fünf kurze Aufgaben, keine Pflichtserie
   · Meine Fehler üben – Fehlertypen mit mehreren Beobachtungen, korrigierbar
   · Prüfungsmodus – ohne Hilfen, mit Punkten, Zeit abschaltbar
   · Klausur nachbereiten – verlorene Punkte erfassen, Plan mit echten Werkzeugen
   · Erklär deinen Schritt – kurze Begründung, feste Kriterien (Mathilda nur mit Berechtigung)
   · Fortschritt – Selbstständigkeit je Thema (Anleitung · Hinweise · ohne Hilfe · Transfer)
   Die Mathematik jeder Aufgabe kommt aus trainingDaten.js (gegen unabhängige
   Kontrollrechnungen geprüft); gespeichert wird im vorhandenen Lernstand (func6).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_URL, C } from "./base1.jsx";
import { kiAntwort, kiKopf } from "./base4.jsx";
import { M, Text } from "./func3.jsx";
import { lernAendern, useLern } from "./func6.jsx";
import { useKonto } from "./konto.js";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, Rueck, ZahlFeld, hilfeKontext, hinweis, karte, kicker } from "./ui2.jsx";
import { Aufklapp } from "./ui3.jsx";
import {
  FEHLERTYPEN, FEHLER_IDS, MIN_BEOBACHTUNGEN, SCHWIERIGKEIT, THEMEN, THEMA_IDS, URSACHEN,
  RUECKMELDUNGEN, beobachte, einzelne, pruefungsThemen, fortschrittBuchen, generatorenFuerFehler, klausurAuswertung, klausurPlan, lies, neueAufgabe, normiere,
  pruefeAntwort, pruefeErklaerung, pruefungAuswahl, themaAktualisieren, typStatus, warmupAuswahl, wiederkehrende,
} from "./trainingDaten.js";

/* ---------- Speicher: im vorhandenen Lernstand (func6) ---------- */
const aendere = (fn) => lernAendern((L) => { L.training = normiere(L.training); fn(L.training); });
export const useTraining = () => normiere(useLern().training);
const datum = (ts) => new Date(ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

/* Zugang zu Mathilda AI: hängt an der Berechtigung im Konto. Solange diese nicht freigeschaltet ist
   (wie beim gesperrten Bereich „Frag Mathilda AI“), arbeitet der Erklärmodus mit festen, fachlich
   geprüften Kriterien – ohne KI. */
export const kiFreigegeben = (konto) => Boolean(konto && konto.profil && konto.profil.ki_frei === true);

/* ---------- kleine Bausteine ---------- */
const Tx = ({ s }) => (
  <>{String(s).split("$").map((t, i) => (i % 2 === 1 ? <M key={i} t={t} /> : <span key={i}>{t}</span>))}</>
);

const knopfKlein = { minHeight: 44, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" };
const Chip = ({ an, onClick, children, farbe = C.see }) => (
  <button type="button" aria-pressed={an} onClick={onClick}
    style={{ minHeight: 44, padding: "8px 14px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: "left", lineHeight: 1.25,
      border: `1.5px solid ${an ? farbe : C.linie}`, background: an ? farbe : C.weiss, color: an ? C.weiss : C.see }}>{children}</button>
);
const Zurueck = ({ gehe }) => (
  <button type="button" onClick={() => { try { sessionStorage.setItem("mm-mein-training", "1"); } catch (e) { /* egal */ } gehe({ ansicht: "start" }); }}
    style={{ background: "none", border: "none", color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "10px 0", minHeight: 44 }}>
    ← Mein Training
  </button>
);
const Seitenrahmen = ({ children }) => <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 18 }}>{children}</div>;
const Balken = ({ anteil, farbe = C.see }) => (
  <div style={{ height: 6, background: C.himmel, borderRadius: 999 }}><div style={{ height: 6, borderRadius: 999, width: `${Math.max(0, Math.min(100, anteil))}%`, background: farbe }} /></div>
);

/* ======================================================================
   Mein Training – Zeile auf der Startseite
   ====================================================================== */
export function MeinTrainingZeile({ gehe }) {
  const [auf, setAuf] = useState(() => { try { return sessionStorage.getItem("mm-mein-training") === "1"; } catch (e) { return false; } });
  const T = useTraining();
  const wk = wiederkehrende(T).length;
  const knoepfe = [
    ["warmup", "5 Minuten Mathe", "Fünf kurze Aufgaben"],
    ["fehlertraining", "Meine Fehler üben", wk ? `${wk} wiederkehrende${wk === 1 ? "r" : ""} Fehlertyp${wk === 1 ? "" : "en"}` : "Gezielt ähnliche Aufgaben"],
    ["pruefung", "Prüfungsmodus", "Ohne Hilfen, mit Punkten"],
    ["klausurnach", "Klausur nachbereiten", "Verlorene Punkte auswerten"],
  ];
  return (
    <div style={{ margin: "10px 0 6px" }}>
      <button type="button" aria-expanded={auf} onClick={() => setAuf(!auf)}
        style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
          background: C.weiss, border: `1.5px solid ${C.linie}`, textAlign: "left" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span aria-hidden="true" style={{ width: 8, height: 26, borderRadius: 4, background: `linear-gradient(180deg, ${C.goldWarm || C.flaggold} 0%, ${C.flaggold} 100%)`, flexShrink: 0 }} />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte }}>Mein Training</span>
            <span style={{ display: "block", fontSize: 12.5, color: C.grau, fontWeight: 300 }}>Kurz üben, Fehler gezielt trainieren, Klausuren nachbereiten</span>
          </span>
        </span>
        <span aria-hidden="true" style={{ color: C.see, fontSize: 16, transform: auf ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
      </button>
      {auf && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 8 }}>
          {knoepfe.map(([id, titel, zeile]) => (
            <button key={id} type="button" onClick={() => gehe({ ansicht: id })}
              style={{ minHeight: 74, padding: "12px 14px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, boxShadow: "0 4px 16px rgba(0,77,152,0.22)" }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{titel}</span>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, opacity: 0.9, marginTop: 4, lineHeight: 1.35 }}>{zeile}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   Erklär deinen Schritt
   ====================================================================== */
async function mathildaPruefung({ aufgabe, antwortOk, eingabe, text, erklaer }) {
  /* Nur nötiger Kontext: Aufgabe, Modus, Schülertext, Kriterien. Die Richtigkeit des Ergebnisses steht
     bereits fest (Mathematik-Engine) und wird nicht von der KI beurteilt. */
  const kriterien = erklaer.kriterien.map((k) => `${k.id}: ${k.text}`).join("\n");
  const system = "Du bist Mathilda, eine freundliche Mathematiklehrkraft (Baden-Württemberg, Oberstufe). Du prüfst nur die schriftliche Begründung eines Schülers. "
    + "Das Ergebnis wurde bereits von einer Rechen-Engine geprüft; beurteile es nicht und rechne nichts neu. "
    + "Antworte ausschließlich mit JSON: {\"erfuellt\": [Kriterium-IDs, die der Text fachlich richtig nennt], \"rueckfrage\": \"genau eine gezielte Rückfrage auf Deutsch, höchstens 25 Wörter, oder leer\"}. "
    + "Verrate keine Lösung.";
  const nutzer = `Aufgabe: ${aufgabe}\nModus: Erklär deinen Schritt\nErgebnis des Schülers war: ${antwortOk ? "richtig" : "falsch"} (Eingabe: ${eingabe})\nKriterien:\n${kriterien}\nBegründung des Schülers: ${text}`;
  const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 400, system, messages: [{ role: "user", content: nutzer }] }) });
  const daten = await kiAntwort(res);
  if (daten.error) throw new Error(daten.error.message);
  const roh = (daten.content || []).map((i) => (i.type === "text" ? i.text : "")).join("");
  const j = JSON.parse(roh.slice(roh.indexOf("{"), roh.lastIndexOf("}") + 1));
  return { erfuellt: Array.isArray(j.erfuellt) ? j.erfuellt.map(String) : [], rueckfrage: typeof j.rueckfrage === "string" ? j.rueckfrage.slice(0, 220) : "" };
}

function ErklaerKasten({ a, eingabe, ok }) {
  const konto = useKonto();
  const [text, setText] = useState("");
  const [erg, setErg] = useState(null);
  const [laedt, setLaedt] = useState(false);
  const [ki, setKi] = useState(null);
  const darfKi = kiFreigegeben(konto);
  const lokal = () => {
    const r = pruefeErklaerung(a.erklaer.kriterien, text);
    setErg({ ...r, quelle: "fest" });
  };
  const mitMathilda = async () => {
    setLaedt(true); setKi(null);
    try {
      const r = await mathildaPruefung({ aufgabe: String(a.text).replace(/\$/g, ""), antwortOk: ok, eingabe: String(eingabe), text, erklaer: a.erklaer });
      const erfuellt = a.erklaer.kriterien.filter((k) => r.erfuellt.includes(k.id));
      const offen = a.erklaer.kriterien.filter((k) => !r.erfuellt.includes(k.id));
      setErg({ erfuellt, offen, rueckfrage: r.rueckfrage || (offen[0] && offen[0].rueckfrage) || null, quelle: "mathilda" });
    } catch (e) {
      setKi("Mathilda ist gerade nicht erreichbar. Hier ist die Prüfung mit festen Kriterien.");
      lokal();
    } finally { setLaedt(false); }
  };
  const zu = text.trim().length < 12;
  return (
    <Aufklapp titel="Erklär deinen Schritt (freiwillig)">
      <p style={{ fontSize: 14, color: C.tinte, marginBottom: 8 }}>{a.erklaer.frage}</p>
      <textarea value={text} onChange={(e) => { setText(e.target.value.slice(0, 600)); setErg(null); }} rows={3} aria-label="Deine Erklärung" placeholder="Ein bis zwei Sätze genügen …"
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 15, fontFamily: "inherit", border: `1.5px solid ${C.linie}`, borderRadius: 12, outline: "none", resize: "vertical", lineHeight: 1.5 }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button type="button" disabled={zu} onClick={lokal} style={{ ...knopfKlein, opacity: zu ? 0.45 : 1 }}>Erklärung prüfen</button>
        {darfKi && <button type="button" disabled={zu || laedt} onClick={mitMathilda} style={{ ...knopfKlein, opacity: zu || laedt ? 0.45 : 1 }}>{laedt ? "Mathilda liest …" : "Mathilda fragen"}</button>}
      </div>
      {ki && <Rueck art="warn">{ki}</Rueck>}
      {erg && (
        <div style={{ marginTop: 8 }}>
          {erg.erfuellt.length > 0 && <Rueck art="gut">Das nennst du schon: {erg.erfuellt.map((k) => k.text).join(" · ")}.</Rueck>}
          {erg.offen.length > 0 && <Rueck art="info"><b>Rückfrage:</b> {erg.rueckfrage}</Rueck>}
          {erg.offen.length === 0 && <Rueck art="gut">Deine Erklärung enthält alle wichtigen Punkte.</Rueck>}
          <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.55, marginTop: 6 }}>
            {erg.quelle === "mathilda" ? "Hinweis von Mathilda – ersetzt keine Korrektur durch deine Lehrkraft. Ob das Ergebnis stimmt, hat die Rechen-Engine geprüft."
              : "Geprüft wird auf Stichwörter und Kriterien, nicht auf Formulierung. Eine fehlende Rückmeldung heißt nicht, dass etwas falsch ist – formuliere die Rückfrage gern in eigenen Worten."}
          </p>
        </div>
      )}
    </Aufklapp>
  );
}

/* ======================================================================
   Aufgabenlauf – Warm-up und Fehlertraining
   ====================================================================== */
function Eingabe({ a, wert, setWert, onEnter, gesperrt }) {
  if (a.typ === "wahl") {
    return (
      <div role="radiogroup" aria-label="Antwortmöglichkeiten" style={{ display: "grid", gap: 8, marginTop: 10 }}>
        {a.optionen.map((o, i) => {
          const an = String(wert) === String(i);
          return (
            <button key={i} type="button" role="radio" aria-checked={an} disabled={gesperrt} onClick={() => setWert(String(i))}
              style={{ minHeight: 48, padding: "10px 14px", borderRadius: 12, textAlign: "left", fontFamily: "inherit", fontSize: 14.5, lineHeight: 1.45, cursor: gesperrt ? "default" : "pointer",
                border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, color: C.tinte, fontWeight: an ? 600 : 400 }}>
              <Tx s={o} />
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
      <ZahlFeld wert={wert} setWert={setWert} label="Deine Antwort" breite={150} platzhalter={a.eingabe || "Zahl"} onEnter={onEnter} />
      {a.einheit && <span style={{ fontSize: 16, fontWeight: 700, color: C.see }}>{a.einheit}</span>}
    </div>
  );
}

const leerZustand = () => ({ eingabe: "", versuche: 0, hilfe: 0, ok: null, typ: null, text: "", gebucht: false, fertig: false });

function kontextFuer(a) {
  return hilfeKontext({
    id: a.id, aufgabe: String(a.text).replace(/\$/g, " "),
    ansatz: a.hinweise, regel: a.hinweise,
    regeln: a.regeln || [], grundlage: a.grundlage || null,
    loesung: <div>{a.loesung.map((z, i) => <Text key={i} s={z} style={{ fontSize: 15.5, lineHeight: 1.9, color: C.tinte }} />)}</div>,
  });
}

/* „Was hat dir gefehlt?“ – freiwillig, bleibt auf diesem Gerät */
function WasFehlte({ quelle }) {
  const [auswahl, setAuswahl] = useState([]);
  const [gesendet, setGesendet] = useState(false);
  const umschalten = (id) => setAuswahl((a) => (id === "nichts" ? (a.includes("nichts") ? [] : ["nichts"]) : a.filter((x) => x !== "nichts").includes(id) ? a.filter((x) => x !== id) : [...a.filter((x) => x !== "nichts"), id]));
  if (gesendet) return <Rueck art="info">Danke – das merke ich mir für deine nächsten Aufgaben.</Rueck>;
  return (
    <div style={{ ...karte, marginTop: 14 }}>
      <p style={kicker}>Was hat dir gefehlt?</p>
      <p style={{ ...hinweis, marginBottom: 10 }}>Freiwillig. Mehrere Antworten sind möglich.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {RUECKMELDUNGEN.map(([id, t]) => <Chip key={id} an={auswahl.includes(id)} onClick={() => umschalten(id)}>{t}</Chip>)}
      </div>
      <GrosserKnopf ghost disabled={auswahl.length === 0} onClick={() => { aendere((T) => { T.rueckmeldungen.push({ zeit: Date.now(), quelle, auswahl }); if (T.rueckmeldungen.length > 60) T.rueckmeldungen.splice(0, T.rueckmeldungen.length - 60); }); setGesendet(true); }}>Abschicken</GrosserKnopf>
    </div>
  );
}

/* Link „Prüfungsmodus“ auf den Fachseiten: öffnet den Prüfungsmodus mit den passenden Themen */
export function PruefungsLink({ ansicht, gehe }) {
  const themen = pruefungsThemen(ansicht);
  if (!themen) return null;
  return (
    <button type="button" onClick={() => { try { sessionStorage.setItem("mm-pruefung-themen", JSON.stringify(themen)); } catch (e) { /* egal */ } gehe({ ansicht: "pruefung" }); }}
      style={{ marginTop: 8, padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", border: "1px dashed rgba(255,255,255,0.4)", background: "transparent", color: C.silberHell }}>
      Prüfungsmodus zu diesem Thema ▸
    </button>
  );
}

export function Aufgabenlauf({ aufgaben, quelle, onEnde, endeText = "Fertig" }) {
  const [i, setI] = useState(0);
  const [zs, setZs] = useState(() => aufgaben.map(leerZustand));
  const [fertig, setFertig] = useState(false);
  const a = aufgaben[i];
  const z = zs[i];
  const kopf = useRef(null);
  const setz = (teil) => setZs((alt) => alt.map((x, k) => (k === i ? { ...x, ...teil } : x)));

  useEffect(() => { try { kopf.current && kopf.current.scrollIntoView({ block: "start" }); } catch (e) { /* egal */ } }, [i]);

  const pruefen = () => {
    const r = pruefeAntwort(a, z.eingabe);
    if (r.leer) { setz({ text: "", meldung: "Bitte gib zuerst eine Antwort ein." }); return; }
    if (r.ungueltig) { setz({ meldung: "Das habe ich nicht als Zahl verstanden. Erlaubt sind z. B. 3, −2,5 oder 7/12." }); return; }
    const versuche = z.versuche + 1;
    const hilfeEff = Math.max(z.hilfe, versuche > 1 ? 1 : 0);
    if (!z.gebucht) {
      aendere((T) => {
        themaAktualisieren(T, a.thema, r.ok, z.hilfe);
        if (!r.ok && r.typ) beobachte(T, r.typ, a.thema, quelle);
      });
    }
    if (r.ok) aendere((T) => fortschrittBuchen(T, a, true, hilfeEff, quelle));
    setz({ versuche, ok: r.ok, typ: r.ok ? z.typ : r.typ, text: r.ok ? "" : r.text, meldung: "", gebucht: true, erstOk: z.gebucht ? z.erstOk : r.ok, hilfeEnde: hilfeEff });
  };
  const weiter = () => {
    if (i + 1 < aufgaben.length) setI(i + 1);
    else setFertig(true);
  };

  if (fertig) {
    const gez = zs.map((x, k) => ({ x, a: aufgaben[k] }));
    const ohne = gez.filter(({ x }) => x.ok && (x.hilfeEnde || 0) === 0).length;
    const mitH = gez.filter(({ x }) => x.ok && (x.hilfeEnde || 0) >= 1 && (x.hilfeEnde || 0) < 4).length;
    const mitL = gez.filter(({ x }) => x.ok && (x.hilfeEnde || 0) >= 4).length;
    const offen = gez.filter(({ x }) => !x.ok).length;
    const typen = [...new Set(gez.filter(({ x }) => x.gebucht && x.erstOk === false && x.typ).map(({ x }) => x.typ))];
    return (
      <div>
        <div style={{ ...karte, background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
          <p style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 6 }}>Geschafft</p>
          <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em" }}>{ohne} von {aufgaben.length} ohne Hilfe gelöst</p>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.6, marginTop: 8, opacity: 0.92 }}>
            {mitH > 0 && `${mitH} mit Hinweisen · `}{mitL > 0 && `${mitL} mit gezeigter Lösung · `}{offen > 0 && `${offen} noch offen · `}
            {ohne === aufgaben.length ? "Das war eine runde Sache." : "Jede Aufgabe mit Hilfe ist Training – die nächste klappt oft schon ohne."}
          </p>
        </div>
        <div style={{ ...karte, marginTop: 14 }}>
          {gez.map(({ x, a: au }, k) => (
            <div key={au.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: k ? `1px solid ${C.linie}` : "none" }}>
              <span aria-hidden="true" style={{ width: 22, fontWeight: 800, color: x.ok ? C.smaragd : C.signal }}>{x.ok ? "✓" : "–"}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: C.tinte }}>{THEMEN[au.thema].name}</p>
                <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>
                  {!x.gebucht ? "nicht bearbeitet" : x.ok ? ((x.hilfeEnde || 0) === 0 ? "ohne Hilfe gelöst" : (x.hilfeEnde || 0) >= 4 ? "mit gezeigter Lösung" : "mit Hinweisen gelöst") : "noch nicht gelöst"}
                  {x.erstOk === false && x.typ ? ` · möglicher Fehler: ${FEHLERTYPEN[x.typ].name}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
        {typen.length > 0 && (
          <Rueck art="info">Auffällig war: {typen.map((t) => FEHLERTYPEN[t].name).join(", ")}. Ein einzelner Fehler ist kein Muster – wiederholt er sich, taucht er unter „Meine Fehler üben“ auf.</Rueck>
        )}
        <WasFehlte quelle={quelle} />
        <GrosserKnopf onClick={() => onEnde(zs)}>{endeText}</GrosserKnopf>
      </div>
    );
  }

  const hilfeText = z.hilfe >= 4 ? "Lösung gezeigt" : z.hilfe >= 1 ? `Hinweisstufe ${z.hilfe}` : null;
  return (
    <div ref={kopf} style={{ scrollMarginTop: 70 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.gruenDunkel }}>Aufgabe {i + 1} von {aufgaben.length}</span>
        <span style={{ fontSize: 12.5, color: C.hellgrau }}>{THEMEN[a.thema].name}</span>
      </div>
      <Balken anteil={((i + (z.ok ? 1 : 0)) / aufgaben.length) * 100} />
      <div style={{ ...karte, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
          <p style={kicker}>{a.afb === 1 ? "Grundaufgabe" : a.afb === 2 ? "Anwenden" : "Nachdenken"}</p>
          <IchHaengeFest kontext={kontextFuer(a)} onHilfe={(b, n) => setz({ hilfe: Math.max(zs[i].hilfe, b === "loesung" ? 4 : Math.max(1, n || 1)) })} />
        </div>
        <Text s={a.text} style={{ fontSize: 16.5, lineHeight: 1.85, color: C.tinte }} />
        <Eingabe a={a} wert={z.eingabe} setWert={(v) => setz({ eingabe: v, meldung: "" })} onEnter={pruefen} gesperrt={z.ok === true} />
        {z.meldung && <Rueck art="warn">{z.meldung}</Rueck>}
        {z.ok === true && <Rueck art="gut">Richtig. {hilfeText ? `(${hilfeText} – das zählt als geführte Lösung.)` : z.versuche > 1 ? "Beim zweiten Versuch – die Rückmeldung hat geholfen." : "Ohne Hilfe gelöst."}</Rueck>}
        {z.ok === false && (
          <Rueck art="schlecht">
            <Tx s={z.text} />
            {z.typ && <span style={{ display: "block", marginTop: 6, fontWeight: 700, fontSize: 12.5 }}>Möglicher Fehler: {FEHLERTYPEN[z.typ].name}</span>}
          </Rueck>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          {z.ok !== true && <div style={{ flex: "1 1 160px" }}><GrosserKnopf onClick={pruefen} disabled={String(z.eingabe).trim() === ""}>Prüfen</GrosserKnopf></div>}
          {(z.ok === true || z.versuche > 0) && <div style={{ flex: "1 1 160px" }}><GrosserKnopf gold={z.ok === true} ghost={z.ok !== true} onClick={weiter}>{i + 1 < aufgaben.length ? "Weiter" : "Auswertung"}</GrosserKnopf></div>}
        </div>
        {z.gebucht && <ErklaerKasten key={a.id} a={a} eingabe={z.eingabe} ok={z.ok === true} />}
        {z.ok === true && <Aufklapp titel="Lösungsweg ansehen">{a.loesung.map((l, k) => <Text key={k} s={l} style={{ lineHeight: 1.9 }} />)}</Aufklapp>}
      </div>
    </div>
  );
}

/* ======================================================================
   5 Minuten Mathe
   ====================================================================== */
function Warmup({ gehe }) {
  const T = useTraining();
  const [lauf, setLauf] = useState(null);
  const [runde, setRunde] = useState(0);
  const start = () => {
    const gen = warmupAuswahl(T, 5);
    setLauf(gen.map((g) => neueAufgabe(g.id)));
    setRunde((r) => r + 1);
  };
  const zusammensetzung = useMemo(() => {
    const zeilen = ["Grundlagen zum Warmwerden"];
    if (T.zuletzt && THEMEN[T.zuletzt]) zeilen.push(`dein zuletzt geübtes Thema: ${THEMEN[T.zuletzt].name}`);
    if (wiederkehrende(T)[0]) zeilen.push(`ein Fehlertyp, der öfter vorkam: ${FEHLERTYPEN[wiederkehrende(T)[0].id].name}`);
    const faellig = THEMA_IDS.filter((t) => T.themen[t] && T.themen[t].faellig <= Date.now());
    if (faellig.length) zeilen.push(`eine Wiederholung: ${THEMEN[faellig[0]].name}`);
    return zeilen;
  }, [T]);
  return (
    <Seitenrahmen>
      <Zurueck gehe={gehe} />
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", marginBottom: 8 }}>5 Minuten Mathe</h2>
      {lauf ? (
        <Aufgabenlauf key={runde} aufgaben={lauf} quelle="warmup" endeText="Fertig – zurück zur Übersicht" onEnde={() => setLauf(null)} />
      ) : (
        <>
          <p style={hinweis}>Fünf kurze Aufgaben, gemischt aus Grundlagen, deinem letzten Thema und Dingen, die gern wieder auftauchen. Kein Zwang und keine Serie – wer pausiert, verliert nichts.</p>
          <div style={karte}>
            <p style={kicker}>Heute dabei</p>
            <ul style={{ margin: 0, paddingLeft: 18, color: C.tinte, fontSize: 14.5, lineHeight: 1.8 }}>{zusammensetzung.map((z) => <li key={z}>{z}</li>)}</ul>
            <GrosserKnopf onClick={start}>Los geht’s</GrosserKnopf>
          </div>
          <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6, marginTop: 12 }}>
            Bei jeder Aufgabe kannst du „Ich hänge fest“ öffnen. Wie viel Hilfe du gebraucht hast, wird ehrlich festgehalten – Aufgaben mit Hilfe zählen als Training, ohne Hilfe als selbstständig.
          </p>
        </>
      )}
    </Seitenrahmen>
  );
}

/* ======================================================================
   Meine Fehler üben
   ====================================================================== */
function FehlerKarte({ id, status, n, tage, gehe, ueben, T }) {
  const t = FEHLERTYPEN[id];
  const [zeigen, setZeigen] = useState(false);
  const liste = (T.beobachtungen || []).filter((b) => b.typ === id).slice(-8).reverse();
  const wk = status === "wiederkehrend";
  return (
    <div style={{ border: `1.5px solid ${wk ? C.flaggold : C.linie}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10, background: C.weiss }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte }}>{t.name}</p>
        <span style={{ fontSize: 12, fontWeight: 700, color: wk ? C.gruenDunkel : C.hellgrau }}>
          {wk ? `${n}× beobachtet, an ${tage} Tagen` : `bisher ${n}× aufgefallen – noch kein Muster`}
        </span>
      </div>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "4px 0 6px" }}>{t.kurz}</p>
      <p style={{ fontSize: 13, color: C.tinte, lineHeight: 1.6, background: C.sand, borderRadius: 10, padding: "6px 10px" }}>{t.tipp}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <button type="button" onClick={() => ueben(id)} style={{ ...knopfKlein, background: C.see, color: C.weiss, borderColor: C.see }}>Gezielt üben</button>
        <button type="button" onClick={() => setZeigen(!zeigen)} aria-expanded={zeigen} style={knopfKlein}>{zeigen ? "Beobachtungen ausblenden" : "Beobachtungen ansehen"}</button>
      </div>
      {zeigen && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55, marginBottom: 8 }}>Stimmt die Zuordnung nicht? Du kannst jede Beobachtung einem anderen Fehlertyp zuordnen oder entfernen.</p>
          {liste.map((b) => (
            <div key={b.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "6px 0", borderTop: `1px solid ${C.linie}` }}>
              <span style={{ fontSize: 12.5, color: C.grau, flex: "1 1 120px" }}>{datum(b.zeit)} · {THEMEN[b.thema] ? THEMEN[b.thema].name : b.thema}</span>
              <select aria-label="Anderem Fehlertyp zuordnen" value={b.typ} onChange={(e) => aendere((D) => { const x = D.beobachtungen.find((y) => y.id === b.id); if (x) x.typ = e.target.value; })}
                style={{ minHeight: 40, borderRadius: 10, border: `1px solid ${C.linie}`, fontFamily: "inherit", fontSize: 13, padding: "0 8px", maxWidth: 190 }}>
                {FEHLER_IDS.map((f) => <option key={f} value={f}>{FEHLERTYPEN[f].name}</option>)}
              </select>
              <button type="button" onClick={() => aendere((D) => { D.beobachtungen = D.beobachtungen.filter((y) => y.id !== b.id); })} style={{ ...knopfKlein, minHeight: 40, padding: "4px 12px", color: C.signal }}>Entfernen</button>
            </div>
          ))}
          <button type="button" onClick={() => aendere((D) => { D.ausgeblendet = [...new Set([...(D.ausgeblendet || []), id])]; })} style={{ ...knopfKlein, marginTop: 8, color: C.grau }}>Diesen Fehlertyp ausblenden</button>
        </div>
      )}
    </div>
  );
}

function Fehlertraining({ gehe }) {
  const T = useTraining();
  const [lauf, setLauf] = useState(null);
  const [runde, setRunde] = useState(0);
  const [typ, setTyp] = useState(null);
  const ueben = (id) => {
    const gens = generatorenFuerFehler(id);
    const auf = [];
    for (let k = 0; k < 6; k++) {
      const g = gens[k % gens.length];
      let a = null;
      for (let v = 0; v < 40; v++) { a = neueAufgabe(g.id); if (a.fehler.some((f) => f.typ === id)) break; }
      auf.push(a);
    }
    setTyp(id); setLauf(auf); setRunde((r) => r + 1);
    try { window.scrollTo(0, 0); } catch (e) { /* egal */ }
  };
  useEffect(() => {
    try { const z = sessionStorage.getItem("mm-fehler-ziel"); if (z && FEHLERTYPEN[z]) { sessionStorage.removeItem("mm-fehler-ziel"); ueben(z); } } catch (e) { /* egal */ }
  }, []);
  const wk = wiederkehrende(T), ez = einzelne(T);
  const ausgeblendet = (T.ausgeblendet || []).filter((id) => FEHLERTYPEN[id]);
  return (
    <Seitenrahmen>
      <Zurueck gehe={gehe} />
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", marginBottom: 8 }}>Meine Fehler üben</h2>
      {lauf ? (
        <>
          <p style={{ ...hinweis, marginBottom: 10 }}>Sechs neue Aufgaben zum Fehlertyp „{FEHLERTYPEN[typ].name}“. {FEHLERTYPEN[typ].tipp}</p>
          <Aufgabenlauf key={runde} aufgaben={lauf} quelle="fehler" endeText="Fertig – zurück zur Übersicht" onEnde={() => setLauf(null)} />
        </>
      ) : (
        <>
          <p style={hinweis}>Hier siehst du, welche Arten von Fehlern bei dir öfter auftauchen. Ein einzelner Fehler ist noch kein Muster: Ein Typ gilt erst als wiederkehrend, wenn er mindestens {MIN_BEOBACHTUNGEN}-mal an mindestens zwei Tagen vorkam. Die Zuordnung kannst du jederzeit korrigieren.</p>
          <p style={kicker}>Wiederkehrend</p>
          {wk.length === 0 && <div style={{ ...karte, marginBottom: 14, fontSize: 14, color: C.grau, lineHeight: 1.7 }}>Bisher gibt es keinen wiederkehrenden Fehlertyp. Das ist ein gutes Zeichen. Wähle unten einen Typ, wenn du ihn trotzdem üben möchtest.</div>}
          {wk.map((x) => <FehlerKarte key={x.id} {...x} gehe={gehe} ueben={ueben} T={T} />)}
          {ez.length > 0 && (
            <>
              <p style={{ ...kicker, marginTop: 18 }}>Einzelne Beobachtungen</p>
              {ez.map((x) => <FehlerKarte key={x.id} {...x} gehe={gehe} ueben={ueben} T={T} />)}
            </>
          )}
          <p style={{ ...kicker, marginTop: 18 }}>Einen Fehlertyp selbst wählen</p>
          <div style={{ display: "grid", gap: 8 }}>
            {FEHLER_IDS.map((id) => (
              <button key={id} type="button" onClick={() => ueben(id)}
                style={{ minHeight: 52, textAlign: "left", padding: "8px 14px", borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, fontFamily: "inherit", cursor: "pointer" }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.see }}>{FEHLERTYPEN[id].name}</span>
                <span style={{ display: "block", fontSize: 12.5, color: C.grau, lineHeight: 1.45 }}>{THEMEN[FEHLERTYPEN[id].thema].name}</span>
              </button>
            ))}
          </div>
          {ausgeblendet.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12.5, color: C.grau }}>Ausgeblendet: {ausgeblendet.map((id) => FEHLERTYPEN[id].name).join(", ")}</p>
              <button type="button" onClick={() => aendere((D) => { D.ausgeblendet = []; })} style={{ ...knopfKlein, marginTop: 6 }}>Wieder einblenden</button>
            </div>
          )}
        </>
      )}
    </Seitenrahmen>
  );
}

/* ======================================================================
   Prüfungsmodus
   ====================================================================== */
let LAUF = null;     // laufende Prüfung bleibt beim Seitenwechsel erhalten
const DAUERN = [[15, "15 Minuten"], [30, "30 Minuten"], [45, "45 Minuten"], [60, "60 Minuten"]];
const ANZAHL_ZU_DAUER = { 15: 4, 30: 6, 45: 8, 60: 10, 0: 6 };
const mmss = (s) => `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, "0")}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

function Pruefung({ gehe }) {
  const T = useTraining();
  const [phase, setPhase] = useState(() => (LAUF ? (LAUF.ergebnis ? "ergebnis" : "lauf") : "wahl"));
  const [themen, setThemen] = useState(() => {
    try { const v = JSON.parse(sessionStorage.getItem("mm-pruefung-themen") || "null"); sessionStorage.removeItem("mm-pruefung-themen"); if (Array.isArray(v) && v.length) return v.filter((t) => THEMEN[t]); } catch (e) { /* egal */ }
    return ["ableiten", "gleichungen", "integrale"];
  });
  const [dauer, setDauer] = useState(30);          // 0 = ohne Zeitlimit
  const [schw, setSchw] = useState("mittel");
  const [, neu] = useState(0);
  const [jetzt, setJetzt] = useState(Date.now());
  const [aktuell, setAktuell] = useState(0);
  const [bestaetigen, setBestaetigen] = useState(false);

  const starten = () => {
    const anzahl = ANZAHL_ZU_DAUER[dauer];
    const gen = pruefungAuswahl(themen, schw, anzahl);
    const aufgaben = gen.map((g) => neueAufgabe(g.id));
    const start = Date.now();
    LAUF = { aufgaben, antworten: {}, start, dauerMin: dauer, mitZeit: dauer > 0, endeTs: dauer > 0 ? start + dauer * 60000 : null, schw, themen: [...themen], ergebnis: null };
    setAktuell(0); setPhase("lauf"); setBestaetigen(false);
    try { window.scrollTo(0, 0); } catch (e) { /* egal */ }
  };

  const abgeben = (grund) => {
    if (!LAUF || LAUF.ergebnis) return;
    const einzel = LAUF.aufgaben.map((a) => {
      const eing = LAUF.antworten[a.id];
      const r = eing === undefined || eing === "" ? { ok: false, leer: true } : pruefeAntwort(a, eing);
      return { a, eing: eing === undefined ? "" : eing, ok: !!r.ok, typ: r.typ || null, text: r.text || "" };
    });
    const punkte = einzel.reduce((s, e) => s + (e.ok ? e.a.punkte : 0), 0);
    const max = einzel.reduce((s, e) => s + e.a.punkte, 0);
    const genutzt = Math.round((Date.now() - LAUF.start) / 1000);
    aendere((D) => {
      for (const e of einzel) {
        themaAktualisieren(D, e.a.thema, e.ok, 0);
        if (!e.ok && e.typ) beobachte(D, e.typ, e.a.thema, "pruefung");
        if (e.ok) fortschrittBuchen(D, e.a, true, 0, "pruefung");
      }
      D.pruefungen.push({ id: String(LAUF.start), zeit: Date.now(), themen: LAUF.themen, schwierigkeit: LAUF.schw, mitZeit: LAUF.mitZeit, dauerMin: LAUF.dauerMin, genutzt, punkte, max,
        einzel: einzel.map((e) => ({ thema: e.a.thema, variante: e.a.variante, ok: e.ok, typ: e.typ, punkte: e.a.punkte })) });
      if (D.pruefungen.length > 40) D.pruefungen.splice(0, D.pruefungen.length - 40);
    });
    LAUF.ergebnis = { einzel, punkte, max, genutzt, grund };
    setPhase("ergebnis"); setBestaetigen(false);
    try { window.scrollTo(0, 0); } catch (e) { /* egal */ }
  };

  /* Uhr: läuft nur im Zeitmodus; bei Ablauf wird abgegeben – alle Eingaben bleiben erhalten */
  useEffect(() => {
    if (phase !== "lauf") return undefined;
    const t = setInterval(() => {
      setJetzt(Date.now());
      if (LAUF && LAUF.mitZeit && LAUF.endeTs && Date.now() >= LAUF.endeTs && !LAUF.ergebnis) abgeben("zeit");
    }, 500);
    return () => clearInterval(t);
  }, [phase]);

  if (phase === "wahl") {
    const anzahl = ANZAHL_ZU_DAUER[dauer];
    return (
      <Seitenrahmen>
        <Zurueck gehe={gehe} />
        <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", marginBottom: 8 }}>Prüfungsmodus</h2>
        <p style={hinweis}>Wie in der Klausur: Aufgaben mit Punkten, keine Hilfen, keine Rückmeldung während der Bearbeitung. Erst nach der Abgabe siehst du Lösungen und eine Fehleranalyse.</p>
        <div style={karte}>
          <p style={kicker}>Themenblock</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {THEMA_IDS.map((t) => <Chip key={t} an={themen.includes(t)} onClick={() => setThemen(themen.includes(t) ? themen.filter((x) => x !== t) : [...themen, t])}>{THEMEN[t].name}</Chip>)}
          </div>
          <p style={{ ...kicker, marginTop: 18 }}>Dauer</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DAUERN.map(([m, l]) => <Chip key={m} an={dauer === m} onClick={() => setDauer(m)}>{l}</Chip>)}
            <Chip an={dauer === 0} onClick={() => setDauer(0)}>Ohne Zeitlimit</Chip>
          </div>
          <p style={{ ...kicker, marginTop: 18 }}>Schwierigkeit</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.keys(SCHWIERIGKEIT).map((s) => <Chip key={s} an={schw === s} onClick={() => setSchw(s)}>{s[0].toUpperCase() + s.slice(1)}</Chip>)}
          </div>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 16 }}>
            {anzahl} Aufgaben{dauer ? `, ${dauer} Minuten` : ", ohne Uhr"}. Die Punkte stehen bei jeder Aufgabe (Grundaufgabe 2, Anwenden 3, Nachdenken 4).
            {dauer > 0 && " Die Uhr kannst du während der Bearbeitung ausschalten."}
          </p>
          <GrosserKnopf disabled={themen.length === 0} onClick={starten}>Prüfung starten</GrosserKnopf>
        </div>
        {T.pruefungen.length > 0 && (
          <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 12 }}>Bisher {T.pruefungen.length} selbstständige Prüfung{T.pruefungen.length === 1 ? "" : "en"} – sie stehen unter „Fortschritt“.</p>
        )}
      </Seitenrahmen>
    );
  }

  if (phase === "lauf" && LAUF) {
    const L = LAUF, a = L.aufgaben[aktuell];
    const rest = L.mitZeit && L.endeTs ? Math.round((L.endeTs - jetzt) / 1000) : null;
    const beantwortet = (x) => (L.antworten[x.id] !== undefined && L.antworten[x.id] !== "");
    const offen = L.aufgaben.filter((x) => !beantwortet(x)).length;
    const setze = (v) => { L.antworten[a.id] = v; neu((n) => n + 1); };
    return (
      <Seitenrahmen>
        <div style={{ position: "sticky", top: 0, zIndex: 4, background: C.sand, padding: "8px 0 10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.gruenDunkel }}>Prüfung · {L.aufgaben.reduce((s, x) => s + x.punkte, 0)} Punkte</span>
          {L.mitZeit ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span role="timer" aria-label="Verbleibende Zeit" style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: rest !== null && rest < 120 ? C.signal : C.see }}>{mmss(rest)}</span>
              <button type="button" onClick={() => { L.mitZeit = false; L.endeTs = null; neu((n) => n + 1); }} style={{ ...knopfKlein, minHeight: 40, padding: "4px 12px", fontSize: 12.5 }}>Zeit ausschalten</button>
            </span>
          ) : <span style={{ fontSize: 13, color: C.grau }}>Zeitmodus aus</span>}
        </div>
        <div role="tablist" aria-label="Aufgaben" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {L.aufgaben.map((x, k) => (
            <button key={x.id} type="button" role="tab" aria-selected={k === aktuell} aria-label={`Aufgabe ${k + 1}${beantwortet(x) ? ", beantwortet" : ""}`} onClick={() => setAktuell(k)}
              style={{ width: 44, height: 44, borderRadius: 12, fontFamily: "inherit", fontWeight: 800, fontSize: 15, cursor: "pointer",
                border: `1.5px solid ${k === aktuell ? C.see : C.linie}`, background: k === aktuell ? C.see : beantwortet(x) ? C.himmel : C.weiss, color: k === aktuell ? C.weiss : C.see }}>{k + 1}</button>
          ))}
        </div>
        <div style={karte}>
          <p style={kicker}>Aufgabe {aktuell + 1} · {a.punkte} Punkte</p>
          <Text s={a.text} style={{ fontSize: 16.5, lineHeight: 1.85, color: C.tinte }} />
          <Eingabe a={a} wert={L.antworten[a.id] ?? ""} setWert={setze} onEnter={() => { if (aktuell + 1 < L.aufgaben.length) setAktuell(aktuell + 1); }} />
          <p style={{ fontSize: 12, color: C.hellgrau, marginTop: 10 }}>Deine Eingabe wird automatisch festgehalten. Ohne Hilfen – wie in der Klausur.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {aktuell > 0 && <div style={{ flex: "1 1 120px" }}><GrosserKnopf ghost onClick={() => setAktuell(aktuell - 1)}>Zurück</GrosserKnopf></div>}
            {aktuell + 1 < L.aufgaben.length && <div style={{ flex: "1 1 120px" }}><GrosserKnopf ghost onClick={() => setAktuell(aktuell + 1)}>Weiter</GrosserKnopf></div>}
          </div>
        </div>
        {!bestaetigen ? (
          <GrosserKnopf gold onClick={() => (offen > 0 ? setBestaetigen(true) : abgeben("abgabe"))}>Prüfung abgeben</GrosserKnopf>
        ) : (
          <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}` }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: C.tinte }}>{offen === 1 ? "Eine Aufgabe ist noch unbeantwortet." : `${offen} Aufgaben sind noch unbeantwortet.`} Trotzdem abgeben?</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px" }}><GrosserKnopf gold onClick={() => abgeben("abgabe")}>Ja, abgeben</GrosserKnopf></div>
              <div style={{ flex: "1 1 140px" }}><GrosserKnopf ghost onClick={() => setBestaetigen(false)}>Weiterarbeiten</GrosserKnopf></div>
            </div>
          </div>
        )}
      </Seitenrahmen>
    );
  }

  /* Ergebnis */
  const E = LAUF && LAUF.ergebnis;
  if (!E) return null;
  const typenInPruefung = [...new Set(E.einzel.filter((e) => !e.ok && e.typ).map((e) => e.typ))];
  return (
    <Seitenrahmen>
      <Zurueck gehe={gehe} />
      <div style={{ ...karte, background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
        <p style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 6 }}>Selbstständige Prüfung · ohne Hilfen</p>
        <p style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em" }}>{E.punkte} von {E.max} Punkten</p>
        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.6, marginTop: 8, opacity: 0.92 }}>
          {E.grund === "zeit" ? "Die Zeit war abgelaufen – deine Eingaben wurden vollständig übernommen. " : ""}Bearbeitungszeit {mmss(E.genutzt)}. Das ist eine Übungsauswertung, keine Notenprognose.
        </p>
      </div>
      {typenInPruefung.length > 0 && <Rueck art="info">Fehleranalyse: {typenInPruefung.map((t) => FEHLERTYPEN[t].name).join(", ")}. {typenInPruefung.length === 1 ? "Dieser Fehlertyp wurde" : "Diese Fehlertypen wurden"} unter „Meine Fehler üben“ vermerkt.</Rueck>}
      <div style={{ marginTop: 14 }}>
        {E.einzel.map((e, k) => (
          <div key={e.a.id} style={{ ...karte, marginBottom: 10, borderLeft: `4px solid ${e.ok ? C.smaragd : C.signal}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: C.tinte }}>Aufgabe {k + 1} · {THEMEN[e.a.thema].name}</p>
              <span style={{ fontSize: 13, fontWeight: 800, color: e.ok ? C.smaragd : C.signal }}>{e.ok ? e.a.punkte : 0} / {e.a.punkte}</span>
            </div>
            <Text s={e.a.text} style={{ fontSize: 14.5, lineHeight: 1.8, color: C.tinte, margin: "6px 0" }} />
            <p style={{ fontSize: 13, color: C.grau }}>Deine Antwort: {e.eing === "" ? "keine" : e.a.typ === "wahl" ? <Tx s={e.a.optionen[Number(e.eing)] || ""} /> : String(e.eing)}</p>
            {!e.ok && e.text && <Rueck art="schlecht"><Tx s={e.text} />{e.typ && <span style={{ display: "block", marginTop: 4, fontWeight: 700, fontSize: 12.5 }}>Möglicher Fehler: {FEHLERTYPEN[e.typ].name}</span>}</Rueck>}
            <Aufklapp titel="Lösung und Weg">{e.a.loesung.map((l, i) => <Text key={i} s={l} style={{ lineHeight: 1.9 }} />)}</Aufklapp>
          </div>
        ))}
      </div>
      <GrosserKnopf onClick={() => { LAUF = null; setPhase("wahl"); }}>Neue Prüfung</GrosserKnopf>
    </Seitenrahmen>
  );
}

/* ======================================================================
   Klausur nachbereiten
   ====================================================================== */
const leereZeile = () => ({ id: Math.random().toString(36).slice(2, 9), name: "", thema: "ableiten", max: "", erreicht: "", ursache: "rechnung" });
const zahlOder = (s) => { const v = lies(s); return v === null ? null : v; };

function KlausurAuswertung({ k, gehe }) {
  const ausw = klausurAuswertung(k);
  const plan = klausurPlan(ausw);
  const maxU = Math.max(1, ...Object.values(ausw.proUrsache));
  const ziel = (z) => { if (z.ansicht === "fehlertraining" || z.ansicht === "warmup" || z.ansicht === "pruefung") gehe(z); };
  return (
    <div>
      <div style={{ ...karte, background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
        <p style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 6 }}>{k.titel || "Klausur"}{k.datum ? ` · ${k.datum}` : ""}</p>
        <p style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em" }}>{String(ausw.verloren).replace(".", ",")} Punkte verloren</p>
        <p style={{ fontSize: 14, fontWeight: 300, marginTop: 8, opacity: 0.92, lineHeight: 1.6 }}>von {String(ausw.gesamtMax).replace(".", ",")} möglichen. Das sagt, wo sich Üben lohnt – es ist keine Notenprognose.</p>
      </div>
      {ausw.verloren > 0 && (
        <div style={{ ...karte, marginTop: 14 }}>
          <p style={kicker}>Woran die Punkte verloren gingen</p>
          {Object.entries(ausw.proUrsache).sort((x, y) => y[1] - x[1]).map(([u, v]) => (
            <div key={u} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{URSACHEN[u] ? URSACHEN[u].name : "Nicht eingeordnet"}</span><span style={{ color: C.hellgrau }}>{String(v).replace(".", ",")} P.</span></div>
              <Balken anteil={(v / maxU) * 100} farbe={C.signal} />
            </div>
          ))}
        </div>
      )}
      <div style={{ ...karte, marginTop: 14 }}>
        <p style={kicker}>Dein Trainingsplan</p>
        {plan.length === 0 && <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.7 }}>Hier sind keine Punkte verloren gegangen. Wiederhole den Stoff gelegentlich mit „5 Minuten Mathe“.</p>}
        {plan.map((s, i) => (
          <div key={i} style={{ padding: "10px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
            <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6 }}>{s.text}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {s.art === "thema" && s.tools.map((t) => <button key={t.name} type="button" onClick={() => gehe({ ansicht: t.ansicht, trainer: t.trainer })} style={knopfKlein}>{t.name} öffnen</button>)}
              {s.art === "thema" && FEHLER_IDS.filter((f) => FEHLERTYPEN[f].thema === s.thema).slice(0, 2).map((f) => (
                <button key={f} type="button" onClick={() => { try { sessionStorage.setItem("mm-fehler-ziel", f); } catch (e) { /* egal */ } gehe({ ansicht: "fehlertraining" }); }} style={knopfKlein}>Üben: {FEHLERTYPEN[f].name}</button>
              ))}
              {s.ziel && <button type="button" onClick={() => ziel(s.ziel)} style={knopfKlein}>{s.ziel.ansicht === "fehlertraining" ? "Meine Fehler üben" : s.ziel.ansicht === "pruefung" ? "Prüfungsmodus mit Zeit" : "5 Minuten Mathe"}</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Klausur({ gehe }) {
  const T = useTraining();
  const [zeilen, setZeilen] = useState([leereZeile()]);
  const [titel, setTitel] = useState("");
  const [dat, setDat] = useState("");
  const [fehler, setFehler] = useState("");
  const [gezeigt, setGezeigt] = useState(null);
  const [bearbeite, setBearbeite] = useState(null);
  const setz = (id, teil) => setZeilen(zeilen.map((z) => (z.id === id ? { ...z, ...teil } : z)));

  const speichern = () => {
    const aufgaben = [];
    for (const z of zeilen) {
      if (!z.name.trim() && z.max === "" && z.erreicht === "") continue;
      const max = zahlOder(z.max), err = zahlOder(z.erreicht);
      if (!z.name.trim()) { setFehler("Jede Aufgabe braucht einen Namen, zum Beispiel „2b“."); return; }
      if (max === null || max <= 0) { setFehler(`Aufgabe ${z.name}: Bitte die erreichbaren Punkte als Zahl größer 0 eingeben.`); return; }
      if (err === null || err < 0 || err > max) { setFehler(`Aufgabe ${z.name}: Die erreichten Punkte müssen zwischen 0 und ${String(max).replace(".", ",")} liegen.`); return; }
      aufgaben.push({ id: z.id, name: z.name.trim(), thema: z.thema, max, erreicht: err, ursache: err < max ? z.ursache : null });
    }
    if (aufgaben.length === 0) { setFehler("Trage mindestens eine Aufgabe mit Punkten ein."); return; }
    setFehler("");
    const eintrag = { id: bearbeite || Math.random().toString(36).slice(2, 10), zeit: Date.now(), titel: titel.trim(), datum: dat.trim(), aufgaben };
    aendere((D) => { const k = D.klausuren.findIndex((x) => x.id === eintrag.id); if (k >= 0) D.klausuren[k] = eintrag; else D.klausuren.push(eintrag); });
    setGezeigt(eintrag.id); setBearbeite(null); setZeilen([leereZeile()]); setTitel(""); setDat("");
    try { window.scrollTo(0, 0); } catch (e) { /* egal */ }
  };
  const bearbeiten = (k) => {
    setBearbeite(k.id); setTitel(k.titel || ""); setDat(k.datum || "");
    setZeilen(k.aufgaben.map((a) => ({ id: a.id, name: a.name, thema: a.thema, max: String(a.max).replace(".", ","), erreicht: String(a.erreicht).replace(".", ","), ursache: a.ursache || "rechnung" })));
    setGezeigt(null);
    try { window.scrollTo(0, 0); } catch (e) { /* egal */ }
  };
  const k = gezeigt ? T.klausuren.find((x) => x.id === gezeigt) : null;
  const feld = { height: 44, boxSizing: "border-box", padding: "0 10px", fontSize: 15, fontFamily: "inherit", border: `1.5px solid ${C.linie}`, borderRadius: 11, outline: "none", background: C.weiss, color: C.tinte, minWidth: 0 };

  return (
    <Seitenrahmen>
      <Zurueck gehe={gehe} />
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", marginBottom: 8 }}>Klausur nachbereiten</h2>
      {k ? (
        <>
          <KlausurAuswertung k={k} gehe={gehe} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 140px" }}><GrosserKnopf ghost onClick={() => bearbeiten(k)}>Angaben ändern</GrosserKnopf></div>
            <div style={{ flex: "1 1 140px" }}><GrosserKnopf ghost onClick={() => setGezeigt(null)}>Zur Übersicht</GrosserKnopf></div>
          </div>
        </>
      ) : (
        <>
          <p style={hinweis}>Trage ein, bei welchen Aufgaben du Punkte verloren hast und warum. Daraus entsteht ein Plan mit Werkzeugen aus dieser App. Alles bleibt auf diesem Gerät.</p>
          <div style={karte}>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "minmax(0,1fr) minmax(0,110px)" }}>
              <input aria-label="Name der Klausur" placeholder="Name, z. B. Klausur 2 Analysis" value={titel} onChange={(e) => setTitel(e.target.value.slice(0, 60))} style={feld} />
              <input aria-label="Datum" placeholder="Datum" value={dat} onChange={(e) => setDat(e.target.value.slice(0, 12))} style={feld} />
            </div>
            <p style={{ ...kicker, marginTop: 16 }}>Aufgaben</p>
            {zeilen.map((z, i) => {
              const max = zahlOder(z.max), err = zahlOder(z.erreicht);
              const verlust = max !== null && err !== null && err < max;
              return (
                <div key={z.id} style={{ border: `1px solid ${C.linie}`, borderRadius: 12, padding: 10, marginBottom: 10 }}>
                  <div style={{ display: "grid", gap: 8, gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)" }}>
                    <input aria-label={`Aufgabe ${i + 1}: Name`} placeholder="Aufgabe" value={z.name} onChange={(e) => setz(z.id, { name: e.target.value.slice(0, 12) })} style={feld} />
                    <input aria-label={`Aufgabe ${i + 1}: erreichbare Punkte`} inputMode="decimal" placeholder="max. P." value={z.max} onChange={(e) => setz(z.id, { max: e.target.value.replace(/[^0-9,.]/g, "").slice(0, 5) })} style={feld} />
                    <input aria-label={`Aufgabe ${i + 1}: erreichte Punkte`} inputMode="decimal" placeholder="erreicht" value={z.erreicht} onChange={(e) => setz(z.id, { erreicht: e.target.value.replace(/[^0-9,.]/g, "").slice(0, 5) })} style={feld} />
                  </div>
                  <select aria-label={`Aufgabe ${i + 1}: Thema`} value={z.thema} onChange={(e) => setz(z.id, { thema: e.target.value })} style={{ ...feld, width: "100%", marginTop: 8 }}>
                    {THEMA_IDS.map((t) => <option key={t} value={t}>{THEMEN[t].name}</option>)}
                    <option value="sonst">Anderes Thema</option>
                  </select>
                  {verlust && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 12.5, color: C.grau, marginBottom: 6 }}>Woran lag es hauptsächlich?</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {Object.entries(URSACHEN).map(([u, d]) => <Chip key={u} an={z.ursache === u} onClick={() => setz(z.id, { ursache: u })}>{d.name}</Chip>)}
                      </div>
                      <p style={{ fontSize: 12.5, color: C.hellgrau, lineHeight: 1.5, marginTop: 6 }}>{URSACHEN[z.ursache].kurz}</p>
                    </div>
                  )}
                  {zeilen.length > 1 && <button type="button" onClick={() => setZeilen(zeilen.filter((x) => x.id !== z.id))} style={{ ...knopfKlein, minHeight: 40, marginTop: 8, color: C.signal }}>Aufgabe entfernen</button>}
                </div>
              );
            })}
            <button type="button" onClick={() => setZeilen([...zeilen, leereZeile()])} style={knopfKlein}>+ Aufgabe hinzufügen</button>
            {fehler && <Rueck art="schlecht">{fehler}</Rueck>}
            <GrosserKnopf onClick={speichern}>Auswerten und speichern</GrosserKnopf>
            <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.6, marginTop: 10 }}>Ein Foto der Klausur kann diese Version noch nicht einlesen. Die Punkte trägst du hier von Hand ein.</p>
          </div>
          {T.klausuren.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <p style={kicker}>Bereits erfasst</p>
              {T.klausuren.slice().reverse().map((x) => {
                const a = klausurAuswertung(x);
                return (
                  <div key={x.id} style={{ ...karte, marginBottom: 10, padding: 14 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte }}>{x.titel || "Klausur"}{x.datum ? ` · ${x.datum}` : ""}</p>
                    <p style={{ fontSize: 13, color: C.grau }}>{String(a.verloren).replace(".", ",")} von {String(a.gesamtMax).replace(".", ",")} Punkten verloren · erfasst am {datum(x.zeit)}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <button type="button" onClick={() => setGezeigt(x.id)} style={knopfKlein}>Auswertung ansehen</button>
                      <button type="button" onClick={() => bearbeiten(x)} style={knopfKlein}>Ändern</button>
                      <button type="button" onClick={() => aendere((D) => { D.klausuren = D.klausuren.filter((y) => y.id !== x.id); })} style={{ ...knopfKlein, color: C.signal }}>Löschen</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Seitenrahmen>
  );
}

/* ======================================================================
   Seitenwähler und Fortschritt
   ====================================================================== */
export function TrainingSeite({ modus, gehe }) {
  if (modus === "warmup") return <Warmup gehe={gehe} />;
  if (modus === "fehlertraining") return <Fehlertraining gehe={gehe} />;
  if (modus === "pruefung") return <Pruefung gehe={gehe} />;
  return <Klausur gehe={gehe} />;
}

export function TrainingFortschritt({ gehe }) {
  const T = useTraining();
  const themen = THEMA_IDS.filter((t) => T.fortschritt[t] || T.themen[t]);
  const wk = wiederkehrende(T);
  const sp = T.pruefungen.slice(-5).reverse();
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Dein persönliches Training</p>
      {themen.length === 0 && sp.length === 0 ? (
        <div style={{ ...karte, fontSize: 14, color: C.grau, lineHeight: 1.7 }}>
          Hier erscheint, wie selbstständig du pro Thema arbeitest: mit Anleitung, mit Hinweisen, ohne Hilfe und auf neue Aufgaben übertragen. Starte mit „5 Minuten Mathe“ unter „Mein Training“.
          <div style={{ marginTop: 8 }}><button type="button" onClick={() => { try { sessionStorage.setItem("mm-mein-training", "1"); } catch (e) { /* egal */ } gehe({ ansicht: "start" }); }} style={knopfKlein}>Mein Training öffnen</button></div>
        </div>
      ) : (
        <>
          <div style={{ ...karte, marginBottom: 16 }}>
            <p style={kicker}>Selbstständigkeit nach Thema</p>
            {themen.map((t, i) => {
              const f = T.fortschritt[t] || { anleitung: 0, hinweise: 0, ohneHilfe: 0, transfer: 0 };
              return (
                <div key={t} style={{ padding: "10px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte, marginBottom: 6 }}>{THEMEN[t].name}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
                    {[["Mit Anleitung", f.anleitung], ["Mit Hinweisen", f.hinweise], ["Ohne Hilfe", f.ohneHilfe], ["Auf Neues übertragen", f.transfer]].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, background: C.sand, borderRadius: 10, padding: "6px 10px" }}>
                        <span style={{ color: C.grau }}>{l}</span><b style={{ color: C.tinte }}>{v}</b>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.6, marginTop: 8 }}>Eine einzelne richtige Aufgabe heißt noch nicht „beherrscht“. „Auf Neues übertragen“ zählt, wenn du eine andere Aufgabenart ohne Hilfe gelöst hast.</p>
          </div>
          {T.rueckmeldungen.length > 0 && (
            <div style={{ ...karte, marginBottom: 16 }}>
              <p style={kicker}>Was dir gefehlt hat</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {RUECKMELDUNGEN.map(([id, t]) => { const n = T.rueckmeldungen.filter((r) => r.auswahl.includes(id)).length; return n ? <span key={id} style={{ fontSize: 13, background: C.sand, borderRadius: 999, padding: "6px 12px", color: C.tinte }}>{t} · {n}×</span> : null; })}
              </div>
            </div>
          )}
          {sp.length > 0 && (
            <div style={{ ...karte, marginBottom: 16 }}>
              <p style={kicker}>Selbstständige Prüfungen</p>
              {sp.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", fontSize: 14 }}>
                  <span style={{ color: C.grau }}>{datum(p.zeit)} · {p.themen.map((t) => THEMEN[t] ? THEMEN[t].name : t).join(", ")}</span>
                  <b style={{ color: C.tinte, whiteSpace: "nowrap" }}>{p.punkte}/{p.max} P.</b>
                </div>
              ))}
              <p style={{ fontSize: 12, color: C.hellgrau, lineHeight: 1.6, marginTop: 6 }}>Prüfungen laufen ohne Hilfen und stehen getrennt vom Training mit Hilfe.</p>
            </div>
          )}
          {wk.length > 0 && (
            <div style={{ ...karte, marginBottom: 16 }}>
              <p style={kicker}>Wiederkehrende Fehlertypen</p>
              {wk.slice(0, 3).map((x) => <p key={x.id} style={{ fontSize: 14, color: C.tinte, lineHeight: 1.8 }}>{FEHLERTYPEN[x.id].name} <span style={{ color: C.hellgrau }}>· {x.n}×</span></p>)}
              <button type="button" onClick={() => gehe({ ansicht: "fehlertraining" })} style={{ ...knopfKlein, marginTop: 8 }}>Meine Fehler üben</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
