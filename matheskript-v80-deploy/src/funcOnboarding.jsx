/* ======================================================================
   Onboarding und Zonen der Handy-Startseite
   · StartOnboarding – beim ersten Besuch vier kurze Fragen (Rolle, Klasse,
     Ziel, Thema) direkt auf der Startseite; danach die Karte „Für dich“
     mit passenden Werkzeugen und, bei Klausur/Abi, dem Weg zum Lernplan.
     Die Klasse stellt den Stufen-Schalter (Mittel-/Oberstufe) ein.
   · ZonenKopf – Überschrift der drei Zonen Heute · Lernen · Entdecken.
   Gespeichert in localStorage („mm-onboarding-v1“); nichts geht ans Konto.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { BEREICHE, WERKZEUGE, passtStufe } from "./werkzeuge.js";

const SCHLUESSEL = "mm-onboarding-v1";
export function onboardingLesen() {
  try { const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null"); return v && typeof v === "object" ? v : null; } catch { return null; }
}
function onboardingSchreiben(v) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify({ ...v, zeit: Date.now() })); } catch { /* privat */ } }
export const stufeAusKlasse = (k) => (!k ? "alle" : k <= 6 ? "unter" : k <= 10 ? "mittel" : "ober");

const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", padding: "20px 18px" };
const kicker = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 8px" };

export function ZonenKopf({ nr, titel, zeile }) {
  return (
    <div style={{ marginTop: nr === 1 ? 18 : 34, marginBottom: 2, display: "flex", alignItems: "flex-end", gap: 12 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, background: C.seeTief, color: C.flaggold,
        fontSize: 14, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{nr}</span>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: C.tinte }}>{titel}</h2>
        {zeile && <p style={{ margin: "2px 0 0", fontSize: 13, color: C.grau, lineHeight: 1.45 }}>{zeile}</p>}
      </div>
    </div>
  );
}

function Chip({ an, onClick, children, breit }) {
  return (
    <button type="button" aria-pressed={an} onClick={onClick}
      style={{ minHeight: 44, padding: "8px 14px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: breit ? "left" : "center",
        border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see, width: breit ? "100%" : undefined }}>{children}</button>
  );
}

const ROLLEN = [["schueler", "Ich bin Schüler:in"], ["eltern", "Ich bin Elternteil"], ["lehrkraft", "Ich unterrichte"]];
const ZIELE = [["klausur", "Bald steht eine Klausur an"], ["abi", "Ich bereite mich aufs Abi vor"], ["luecken", "Ich will Lücken schließen"], ["ueben", "Einfach üben"]];
const THEMEN = [["zahlen", "Zahlen und Größen"], ["bruchrechnen", "Brüche und Dezimalzahlen"], ["prozent", "Zuordnungen und Prozent"], ["daten", "Daten und Zufall"], ["gleichungen", "Terme und Gleichungen"], ["geometrie", "Geometrie"], ["analysis", "Analysis"], ["vektoren", "Vektoren"], ["stochastik", "Stochastik"]];

function Fragen({ onFertig, onSpaeter }) {
  const [a, setA] = useState({});
  const schritt = !a.rolle ? 0 : a.rolle !== "schueler" ? 4 : !a.klasse ? 1 : !a.ziel ? 2 : 3;
  const setze = (k, v) => {
    const neu = { ...a, [k]: v };
    setA(neu);
    if (k === "rolle" && v !== "schueler") onFertig(neu);
    if (k === "thema") onFertig(neu);
  };
  const anzahl = 4;
  const frage = ["Wer bist du?", "In welcher Klasse bist du?", "Was ist dein Ziel?", "Womit willst du anfangen?"][schritt];
  const themen = THEMEN.filter(([id]) => !(a.klasse && a.klasse <= 9 && (id === "vektoren" || id === "analysis")));
  return (
    <div className="auftauchen" style={{ ...karte, marginTop: 12, borderTop: `4px solid ${C.flaggold}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <p style={{ ...kicker, margin: 0 }}>Einrichten · {Math.min(schritt + 1, anzahl)}/{anzahl}</p>
        <button type="button" onClick={onSpaeter} style={{ background: "none", border: "none", padding: 6, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.grau, cursor: "pointer" }}>Überspringen</button>
      </div>
      <div aria-hidden="true" style={{ height: 4, borderRadius: 2, background: C.linie, margin: "10px 0 14px", overflow: "hidden" }}>
        <div style={{ width: `${(schritt / anzahl) * 100}%`, height: "100%", background: C.flaggold, transition: "width .25s ease" }} />
      </div>
      <p style={{ fontSize: 19, fontWeight: 700, color: C.tinte, margin: "0 0 12px", lineHeight: 1.3 }}>{frage}</p>
      {schritt === 0 && <div style={{ display: "grid", gap: 8 }}>{ROLLEN.map(([id, t]) => <Chip key={id} breit onClick={() => setze("rolle", id)}>{t}</Chip>)}</div>}
      {schritt === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
          {[5, 6, 7, 8, 9, 10, 11, 12, 13].map((k) => <Chip key={k} onClick={() => setze("klasse", k)}>{k}</Chip>)}
        </div>
      )}
      {schritt === 2 && <div style={{ display: "grid", gap: 8 }}>{ZIELE.map(([id, t]) => <Chip key={id} breit onClick={() => setze("ziel", id)}>{t}</Chip>)}</div>}
      {schritt === 3 && <div style={{ display: "grid", gap: 8 }}>{themen.map(([id, t]) => <Chip key={id} breit onClick={() => setze("thema", id)}>{t}</Chip>)}</div>}
      {schritt > 0 && schritt < 4 && (
        <button type="button" onClick={() => setA(schritt === 1 ? {} : schritt === 2 ? { rolle: a.rolle } : { rolle: a.rolle, klasse: a.klasse })}
          style={{ marginTop: 12, background: "none", border: "none", padding: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.see, cursor: "pointer" }}>‹ Zurück</button>
      )}
      <p style={{ fontSize: 12, color: C.hellgrau, margin: "12px 0 0", lineHeight: 1.5 }}>Bleibt nur auf diesem Gerät gespeichert.</p>
    </div>
  );
}

/* Werkzeuge zu Thema und Stufe: aus jeder Station das erste passende */
export function empfehlungen(thema, stufe, max = 3) {
  const b = BEREICHE.find((x) => x.id === thema);
  if (!b) return [];
  const liste = [];
  for (const s of b.stationen) {
    const id = s.werkzeuge.find((w) => WERKZEUGE[w] && passtStufe(WERKZEUGE[w], stufe));
    if (id) liste.push({ id, ...WERKZEUGE[id], station: s.titel });
    if (liste.length >= max) break;
  }
  return liste;
}

function Zeile({ titel, unter, onClick, gold }) {
  return (
    <button type="button" onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        border: `1.5px solid ${gold ? C.flaggold : C.linie}`, background: gold ? "#FFFBEA" : C.weiss }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>{titel}</span>
        {unter && <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 1 }}>{unter}</span>}
      </span>
      <span aria-hidden="true" style={{ fontSize: 22, color: gold ? "#8A6A00" : C.see }}>›</span>
    </button>
  );
}

function FuerDich({ o, gehe, neu, planDa }) {
  const name = { eltern: "Für Eltern", lehrkraft: "Für Lehrkräfte" }[o.rolle] || "Für dich";
  let inhalt;
  if (o.rolle === "eltern") inhalt = (<>
    <Zeile titel="Mathe-Mindset-Kurs" unter="Wie Sie Ihr Kind begleiten, ohne Druck aufzubauen" onClick={() => gehe({ ansicht: "elternkurs" })} gold />
    <Zeile titel="Wochenbericht" unter="Was diese Woche geübt wurde – ohne Noten" onClick={() => gehe({ ansicht: "bericht" })} />
    <Zeile titel="Konto verbinden" unter="Eltern-Wochenmail mit dem Konto Ihres Kindes" onClick={() => gehe({ ansicht: "konto" })} />
  </>);
  else if (o.rolle === "lehrkraft") inhalt = (<>
    <Zeile titel="Klassen-Challenge" unter="Klasse anlegen, Code teilen, Wochenpunkte sammeln" onClick={() => gehe({ ansicht: "challenge" })} gold />
    <Zeile titel="Formelsammlung" unter="Alle Formeln mit Herleitung – für den Unterricht" onClick={() => gehe({ ansicht: "formeln", bereich: "analysis" })} />
  </>);
  else {
    const stufe = stufeAusKlasse(o.klasse);
    const ws = empfehlungen(o.thema, stufe);
    const bereich = BEREICHE.find((b) => b.id === o.thema);
    inhalt = (<>
      {(o.ziel === "klausur" || o.ziel === "abi") && planDa && <Zeile gold titel="Weiter im Plan" unter="Deine Einheit für heute" onClick={() => gehe({ ansicht: "lernpfad" })} />}
      {o.ziel === "luecken" && <Zeile gold titel="Meine Fehler üben" unter="Genau die Aufgaben, die zuletzt schiefgingen" onClick={() => gehe({ ansicht: "fehlertraining" })} />}
      {ws.map((w) => <Zeile key={w.id} titel={w.name} unter={`${bereich ? bereich.titel : ""} · ${w.station}`} onClick={() => gehe(w.ziel)} />)}
    </>);
  }
  return (
    <div className="auftauchen" style={{ ...karte, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <p style={{ ...kicker, margin: 0 }}>{name}{o.klasse ? ` · Klasse ${o.klasse}` : ""}</p>
        <button type="button" onClick={neu} style={{ background: "none", border: "none", padding: 4, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: C.see, cursor: "pointer" }}>Ändern</button>
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 10 }}>{inhalt}</div>
    </div>
  );
}

/* setzeStufe: Stufen-Schalter der Startseite; planDa: Lernpfad existiert schon */
export function StartOnboarding({ gehe, setzeStufe, planDa }) {
  const [o, setO] = useState(onboardingLesen);
  const fertig = (v) => {
    onboardingSchreiben(v);
    setO(v);
    if (v.klasse && setzeStufe) setzeStufe(stufeAusKlasse(v.klasse));
  };
  if (!o) return <Fragen onFertig={fertig} onSpaeter={() => fertig({ uebersprungen: true })} />;
  if (o.uebersprungen) return null;
  return <FuerDich o={o} gehe={gehe} planDa={planDa} neu={() => { try { localStorage.removeItem(SCHLUESSEL); } catch { /* egal */ } setO(null); }} />;
}
