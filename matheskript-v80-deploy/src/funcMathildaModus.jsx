/* ======================================================================
   Mathilda-Modus – goldener Knopf unter einer Trainingsaufgabe
   Statt online zu tippen, löst der Schüler die Aufgabe auf Papier:
   ① Aufgabe oben aufs Blatt schreiben, ② nach dem Schema rechnen
   (Musterlösung einer ähnlichen Aufgabe als Hilfe), ③ kurz erklärt als
   Motion-Video, ④ Foto nur dieser Aufgabe an Mathilda.
   Mathilda kennt die Lösung, verrät sie nicht und nennt höchstens zwei
   Hebel. Stimmt das Ergebnis, kann es ins Antwortfeld übernommen werden –
   geprüft wird dort wie immer von der Rechen-Engine.
   Logik: mathildaModus.js. Film: funcMathildaModusFilm.jsx.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { API_URL, C } from "./base1.jsx";
import { LERN } from "./base3.jsx";
import { kiAntwort, kiEinwilligungDa, kiKopf } from "./base4.jsx";
import { Text } from "./func3.jsx";
import { dekodieren, jsonLesen, rendern } from "./func1.jsx";
import { BlattScanner } from "./funcBlattScanner.jsx";
import { MathildaIcon } from "./funcMathildaSeite.jsx";
import { MathildaModusFilm } from "./funcMathildaModusFilm.jsx";
import { Blatt } from "./funcPenPaperUebungen.jsx";
import { useKonto } from "./konto.js";
import { mathildaSystem } from "./mathildaKontext.js";
import { Rueck, zw } from "./ui2.jsx";
import { MODUS_REGELN, MODUS_ZAEHLER, ergebnisAlsEingabe, modusMoeglich, modusPrompt, rueckmeldungLesen } from "./mathildaModus.js";

const GOLD = C.flaggold, NACHT = C.seeTief, TINTE = "#101827";
const goldVerlauf = `linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%)`;
const zaehlerHoch = () => { try { const n = Number(localStorage.getItem(MODUS_ZAEHLER)) || 0; localStorage.setItem(MODUS_ZAEHLER, String(n + 1)); } catch (e) { /* privat */ } };

const STIL = `
@keyframes mmmPop { 0% { opacity: 0; transform: scale(.86) translateY(14px); } 60% { opacity: 1; transform: scale(1.015); } 100% { opacity: 1; transform: none; } }
@keyframes mmmDunkel { from { opacity: 0; } to { opacity: 1; } }
@keyframes mmmGlanz { 0% { transform: translateX(-120%) skewX(-18deg); } 55%, 100% { transform: translateX(260%) skewX(-18deg); } }
@keyframes mmmPuls { 0%,100% { transform: scale(1); } 50% { transform: scale(.88); } }
.mmm-huelle { animation: mmmDunkel .22s ease both; }
.mmm-fenster { animation: mmmPop .38s cubic-bezier(.2,.9,.25,1.15) both; }
.mmm-knopf { position: relative; overflow: hidden; transition: transform .15s ease, box-shadow .15s ease; }
.mmm-knopf:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(237,187,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6); }
.mmm-knopf:active { transform: translateY(1px) scale(.99); }
.mmm-knopf::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 34%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); animation: mmmGlanz 4.2s ease-in-out 1.2s infinite; pointer-events: none; }
.mmm-knopf:focus-visible, .mmm-klein:focus-visible, .mmm-zu:focus-visible { outline: 3px solid ${C.see}; outline-offset: 2px; }
.mmm-puls { animation: mmmPuls 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .mmm-huelle, .mmm-fenster, .mmm-knopf::after, .mmm-puls { animation: none; } }
`;

const kleinKnopf = { minHeight: 40, padding: "0 14px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer" };

function Kamera({ farbe = GOLD, groesse = 20 }) {
  return <svg viewBox="0 0 24 24" width={groesse} height={groesse} fill="none" stroke={farbe} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>;
}
function StiftIcon({ farbe = GOLD }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={farbe} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 6l3 3" /></svg>;
}

/* ---------- Abschnitt mit Nummer ---------- */
function Abschnitt({ nr, titel, children, data }) {
  return (
    <section data-mm-abschnitt={data} style={{ padding: "16px 0 4px", borderTop: nr > 1 ? `1px solid ${C.linie}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 999, background: NACHT, color: GOLD, fontWeight: 800, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{nr}</span>
        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: C.tinte, letterSpacing: "-0.01em" }}>{titel}</h3>
      </div>
      {children}
    </section>
  );
}

/* ---------- ② Schema ---------- */
const SCHEMA = () => [
  [zw("Blanko + schwarzer Stift", "Plain paper + black pen"), zw("weißes Papier ohne Karo", "white paper, no squares")],
  [zw("Ein Schritt pro Zeile", "One step per line"), zw("„=“ genau untereinander", "“=” exactly below each other")],
  [zw("Umformung an den Rand", "Operation at the margin"), zw("Nebenrechnung in eine Box", "side calculation in a box")],
  [zw("Ergebnis in den Kasten", "Result in a box"), zw("vollständig vereinfacht", "fully simplified")],
];

function Musterloesung({ aehnliche }) {
  const [b, setB] = useState(null);
  const neu = () => { try { setB(aehnliche()); } catch (e) { setB(null); } };
  if (!b) {
    return (
      <button type="button" className="mmm-klein" onClick={neu} data-mm-muster
        style={{ ...kleinKnopf, width: "100%", minHeight: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.see} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
        {zw("Musterlösung einer ähnlichen Aufgabe", "Worked example of a similar task")}
      </button>
    );
  }
  const z = b.loesung || [];
  return (
    <div style={{ marginTop: 12 }} data-mm-muster-offen>
      <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gruenDunkel }}>{zw("Ähnliche Aufgabe – andere Zahlen", "Similar task – different numbers")}</p>
      <Blatt minHoehe={0} style={{ fontFamily: "inherit", fontSize: 16, color: TINTE, padding: "14px 16px" }}>
        <div style={{ paddingBottom: 8, marginBottom: 8, borderBottom: `1.2px solid rgba(16,24,39,0.35)` }}>
          <Text s={b.text} style={{ fontSize: 15, lineHeight: 1.75, color: TINTE }} />
        </div>
        {z.map((l, i) => {
          const letzte = i === z.length - 1;
          return (
            <div key={i} style={{ padding: "2px 0" }}>
              <span style={letzte ? { display: "inline-block", border: `2px solid ${TINTE}`, borderRadius: 6, padding: "0 8px" } : undefined}>
                <Text s={l} style={{ fontSize: 15.5, lineHeight: 1.9, color: TINTE }} />
              </span>
            </div>
          );
        })}
      </Blatt>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button type="button" className="mmm-klein" onClick={neu} style={kleinKnopf}>{zw("Andere Beispielaufgabe ↻", "Another example ↻")}</button>
        <button type="button" className="mmm-klein" onClick={() => setB(null)} style={kleinKnopf}>{zw("Ausblenden", "Hide")}</button>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>{zw("Schau dir an, wie der Weg aufgebaut ist – und rechne deine Aufgabe dann selbst.", "Look at how the work is laid out – then do your own task yourself.")}</p>
    </div>
  );
}

/* ---------- ③ Kurz erklärt ---------- */
function KurzErklaert() {
  const [auf, setAuf] = useState(false);
  return (
    <div style={{ marginTop: 12, borderRadius: 14, border: `1px solid ${C.linie}`, background: C.weiss, overflow: "hidden" }}>
      <button type="button" className="mmm-klein" aria-expanded={auf} onClick={() => setAuf((x) => !x)} data-mm-film
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%)", border: `1px solid ${GOLD}` }}>
          <svg width="14" height="14" viewBox="0 0 18 18"><path d="M5 2.5v13l11-6.5z" fill={GOLD} /></svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel }}>{zw("Kurz erklärt · 27 Sekunden", "Quick guide · 27 seconds")}</span>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{zw("So schreibst du – und so schickst du es Mathilda", "How to write it – and how to send it to Mathilda")}</span>
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.see} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{ transform: auf ? "rotate(180deg)" : "none", transition: "transform .2s ease", flexShrink: 0 }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {auf && <div style={{ padding: "0 12px 14px" }}><MathildaModusFilm /></div>}
    </div>
  );
}

/* ---------- ④ Rückmeldung ---------- */
function Rueckmeldung({ r, onUebernehmen, onNeu }) {
  const eingabe = r.stimmt === true ? ergebnisAlsEingabe(r.ergebnis) : null;
  if (r.neuesFoto) {
    return (
      <div data-mm-rueckmeldung="neues-foto">
        <Rueck art="warn">{r.grund}</Rueck>
        <button type="button" className="mmm-klein" onClick={onNeu} style={{ ...kleinKnopf, marginTop: 8 }}>{zw("Neues Foto", "New photo")}</button>
      </div>
    );
  }
  const farbe = r.stimmt === true ? C.smaragd : r.stimmt === false ? C.signal : C.see;
  return (
    <div data-mm-rueckmeldung={r.stimmt === true ? "richtig" : r.stimmt === false ? "falsch" : "offen"}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 14, background: r.stimmt === true ? "#EAF6EF" : r.stimmt === false ? "#FBF0EA" : C.himmel }}>
        <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 999, background: farbe, color: C.weiss, fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {r.stimmt === true ? "✓" : r.stimmt === false ? "!" : "?"}
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: farbe }}>
            {r.stimmt === true ? zw("Dein Ergebnis stimmt.", "Your result is correct.") : r.stimmt === false ? zw("Noch nicht ganz.", "Not quite yet.") : zw("Ergebnis nicht sicher erkannt.", "Result not clearly recognised.")}
          </p>
          {r.ergebnis && <p style={{ margin: "2px 0 0", fontSize: 13, color: C.grau }}>{zw("Gelesen:", "Read:")} <b style={{ color: C.tinte }}>{r.ergebnis}</b></p>}
        </div>
      </div>

      {r.zeilen.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.gruenDunkel }}>{zw("So hat Mathilda dein Blatt gelesen", "How Mathilda read your sheet")}</p>
          <Blatt minHoehe={0} groesse={19} style={{ padding: "10px 14px" }}>
            {r.zeilen.map((z, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, color: C.hellgrau, width: 16, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere",
                  ...(z.s === "fehler" ? { background: "#FBE3D6", borderRadius: 4, padding: "0 4px" } : z.s === "unklar" ? { borderBottom: `2px dotted ${C.hellgrau}` } : {}) }}>{z.t}</span>
              </div>
            ))}
          </Blatt>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: C.hellgrau }}>{zw("Falsch gelesen? Dann ein schärferes Foto schicken.", "Misread? Then send a sharper photo.")}</p>
        </div>
      )}

      {r.fehler && <Rueck art="schlecht"><b>{r.fehler.zeile ? zw(`Zeile ${r.fehler.zeile}: `, `Line ${r.fehler.zeile}: `) : ""}</b>{r.fehler.was}</Rueck>}
      {r.frage && <Rueck art="info"><b>{zw("Frag dich:", "Ask yourself:")}</b> {r.frage}</Rueck>}
      {r.gelungen && <Rueck art="gut"><b>{zw("Schon gut:", "Already good:")}</b> {r.gelungen}</Rueck>}
      {r.hebel.length > 0 && (
        <div style={{ marginTop: 10, borderRadius: 14, padding: "12px 14px", background: "#FFF7D6", border: `1px solid #F1DB8A` }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gruenDunkel }}>{r.hebel.length === 1 ? zw("Dein Hebel", "Your lever") : zw("Deine zwei Hebel", "Your two levers")}</p>
          {r.hebel.map((h, i) => (
            <p key={i} style={{ margin: i ? "6px 0 0" : 0, fontSize: 14, color: C.tinte, lineHeight: 1.55 }}>{h.titel && <b>{h.titel}: </b>}{h.text}</p>
          ))}
        </div>
      )}
      {r.aufgabe && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 12 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><StiftIcon farbe={C.see} /></span>
          <p style={{ margin: 0, fontSize: 14, color: C.tinte, lineHeight: 1.55 }}><b>{zw("Jetzt du:", "Your turn:")}</b> {r.aufgabe}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {eingabe && (
          <button type="button" className="mmm-knopf" onClick={() => onUebernehmen(eingabe)} data-mm-uebernehmen
            style={{ flex: "1 1 200px", minHeight: 48, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: NACHT, background: goldVerlauf, boxShadow: "0 6px 18px rgba(237,187,0,0.35)" }}>
            {zw(`${eingabe} ins Antwortfeld übernehmen`, `Put ${eingabe} in the answer field`)}
          </button>
        )}
        <button type="button" className="mmm-klein" onClick={onNeu} style={{ ...kleinKnopf, flex: "1 1 140px", minHeight: 48 }}>{zw("Neues Foto schicken", "Send a new photo")}</button>
      </div>
    </div>
  );
}

/* ---------- ④ Foto an Mathilda ---------- */
function FotoTeil({ a, onUebernehmen }) {
  const konto = useKonto();
  const [scan, setScan] = useState(false);
  const [quelle, setQuelle] = useState(null);
  const [bild, setBild] = useState(null);
  const [drehung, setDrehung] = useState(0);
  const [lade, setLade] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [erg, setErg] = useState(null);
  const [warten, setWarten] = useState(null);
  const kameraRef = useRef(null), galerieRef = useRef(null);

  const datei = async (f) => {
    if (!f) return;
    setFehler(""); setLade(true); setScan(false); setErg(null);
    try {
      const src = await dekodieren(f, () => {});
      setQuelle(src); setDrehung(0);
      const r = rendern(src, 0);
      setBild({ b64: r.b64, vorschau: r.vorschau });
    } catch (e) { setFehler(e.message || zw("Das Foto ließ sich nicht öffnen.", "The photo could not be opened.")); }
    finally { setLade(false); }
  };
  const drehen = () => { if (!quelle) return; const d = (drehung + 90) % 360; setDrehung(d); const r = rendern(quelle, d); setBild({ b64: r.b64, vorschau: r.vorschau }); };

  const senden = async (b64) => {
    if (!kiEinwilligungDa()) { setWarten(b64); try { window.dispatchEvent(new CustomEvent("mm-ki-einwilligung")); } catch (e) { /* kein Browser */ } return; }
    setLaeuft(true); setFehler(""); setErg(null);
    try {
      const system = `${mathildaSystem({ L: LERN, profil: konto.profil })}\n\n${MODUS_REGELN}`;
      const content = [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } }, { type: "text", text: modusPrompt(a) }];
      const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 2000, system, messages: [{ role: "user", content }] }) });
      const daten = await kiAntwort(res);
      if (daten.error) throw new Error(daten.error.message || zw("Mathilda hat abgelehnt.", "Mathilda declined."));
      const roh = (daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join("");
      setErg(rueckmeldungLesen(jsonLesen(roh)));
      zaehlerHoch();
    } catch (e) {
      setFehler(e.message || zw("Mathilda ist gerade nicht erreichbar.", "Mathilda is not reachable right now."));
    } finally { setLaeuft(false); }
  };
  useEffect(() => {
    const ja = () => setWarten((w) => { if (w) setTimeout(() => senden(w), 0); return null; });
    window.addEventListener("mm-ki-einwilligung-erteilt", ja);
    return () => window.removeEventListener("mm-ki-einwilligung-erteilt", ja);
  }, [a, konto]);

  const neu = () => { setErg(null); setBild(null); setQuelle(null); setFehler(""); setScan(true); };

  return (
    <div>
      {!bild && !erg && (
        <div style={{ display: "grid", gap: 8 }}>
          <button type="button" className="mmm-knopf" onClick={() => setScan(true)} data-mm-foto
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 56, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 800, color: NACHT,
              background: goldVerlauf, boxShadow: "0 8px 22px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.55)" }}>
            <span style={{ width: 38, height: 38, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center" }}><Kamera /></span>
            {zw("Foto an Mathilda schicken", "Send photo to Mathilda")}
          </button>
          <button type="button" className="mmm-klein" onClick={() => galerieRef.current?.click()} style={{ ...kleinKnopf, minHeight: 44 }}>{zw("Foto aus der Galerie", "Photo from gallery")}</button>
          {lade && <p style={{ fontSize: 13, color: C.grau, margin: 0 }}>{zw("Foto wird vorbereitet …", "Preparing the photo …")}</p>}
        </div>
      )}
      {bild && !erg && !laeuft && (
        <div>
          <div style={{ background: C.sand, borderRadius: 14, padding: 8 }}>
            <img src={bild.vorschau} alt={zw("Dein Foto", "Your photo")} style={{ display: "block", width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 10 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button type="button" className="mmm-klein" onClick={drehen} style={kleinKnopf}>{zw("Drehen ↻", "Rotate ↻")}</button>
            <button type="button" className="mmm-klein" onClick={() => { setBild(null); setQuelle(null); }} style={kleinKnopf}>{zw("Anderes Foto", "Other photo")}</button>
          </div>
          <button type="button" className="mmm-knopf" onClick={() => senden(bild.b64)} data-mm-senden
            style={{ width: "100%", marginTop: 10, minHeight: 52, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 800, color: NACHT, background: goldVerlauf, boxShadow: "0 8px 22px rgba(237,187,0,0.35)" }}>
            {zw("Abschicken", "Send")}
          </button>
        </div>
      )}
      {laeuft && (
        <div role="status" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }} data-mm-laeuft>
          <span className="mmm-puls" style={{ width: 40, height: 40, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: GOLD }} />
          </span>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: C.tinte }}>{zw("Mathilda liest dein Blatt …", "Mathilda is reading your sheet …")}</p>
        </div>
      )}
      {fehler && !laeuft && <Rueck art="warn">{fehler}</Rueck>}
      {erg && !laeuft && <Rueckmeldung r={erg} onUebernehmen={onUebernehmen} onNeu={neu} />}
      <p style={{ fontSize: 11.5, color: C.hellgrau, margin: "10px 0 0", lineHeight: 1.5 }}>
        {zw("Das Foto geht zur Prüfung an Anthropic (Claude) und wird nicht gespeichert. Nur diese eine Aufgabe ins Bild – ohne Namen.", "The photo is sent to Anthropic (Claude) for checking and is not stored. Only this one task in the frame – no names.")}
      </p>
      <input ref={galerieRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { datei(e.target.files && e.target.files[0]); e.target.value = ""; }} data-mm-galerie />
      <input ref={kameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { datei(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      <BlattScanner offen={scan} onSchliessen={() => setScan(false)} onFoto={datei}
        onKameraApp={() => { setScan(false); kameraRef.current?.click(); }} onGalerie={() => { setScan(false); galerieRef.current?.click(); }} />
    </div>
  );
}

/* ---------- Das Fenster ---------- */
export function MathildaModusFenster({ a, aehnliche, onSchliessen, onErgebnis }) {
  const fenster = useRef(null);
  useEffect(() => {
    const alt = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const taste = (e) => { if (e.key === "Escape") onSchliessen(); };
    window.addEventListener("keydown", taste);
    try { fenster.current && fenster.current.focus({ preventScroll: true }); } catch (e) { /* egal */ }
    return () => { document.body.style.overflow = alt; window.removeEventListener("keydown", taste); };
  }, []);
  return (
    <div className="mmm-huelle" onClick={(e) => { if (e.target === e.currentTarget) onSchliessen(); }} data-mathilda-modus-fenster
      style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(6,12,32,0.62)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom))" }}>
      <div ref={fenster} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="mmm-titel" className="mmm-fenster"
        style={{ width: "100%", maxWidth: 560, maxHeight: "100%", overflowY: "auto", overscrollBehavior: "contain", borderRadius: 24, background: C.sand, outline: "none",
          boxShadow: "0 30px 80px rgba(6,12,32,0.45), 0 0 0 1px rgba(237,187,0,0.35)" }}>
        {/* Kopf */}
        <div style={{ position: "sticky", top: 0, zIndex: 2, padding: "14px 16px 12px", color: C.weiss, borderRadius: "24px 24px 0 0",
          background: `radial-gradient(120% 160% at 100% 0%, #1D4790 0%, ${C.see} 45%, ${NACHT} 100%)`, boxShadow: `0 2px 0 ${GOLD}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MathildaIcon groesse={48} hintergrund="rgba(255,255,255,0.08)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>{zw("Pen & Paper", "Pen & Paper")}</p>
              <h2 id="mmm-titel" style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{zw("Mathilda-Modus", "Mathilda mode")}</h2>
            </div>
            <button type="button" className="mmm-zu" onClick={onSchliessen} aria-label={zw("Schließen", "Close")}
              style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)", color: C.weiss, cursor: "pointer", fontSize: 20, lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>
        </div>
        <p style={{ margin: 0, padding: "12px 16px 14px", fontSize: 13.5, fontWeight: 400, lineHeight: 1.55, color: "#C9D6EE", background: NACHT }}>
          {zw("Du rechnest auf Papier, Mathilda schaut drüber. Sie verrät dir nicht die Lösung – sie zeigt dir, wo es hakt und was dein Blatt klarer macht.", "You work on paper, Mathilda looks it over. She won't give you the answer – she shows where it gets stuck and what makes your sheet clearer.")}
        </p>

        <div style={{ padding: "4px 16px 20px" }}>
          <Abschnitt nr={1} titel={zw("Schreib die Aufgabe auf", "Write down the task")} data="aufgabe">
            <p style={{ margin: "0 0 8px", fontSize: 14, color: C.grau, lineHeight: 1.55 }}>{zw("Einmal oben aufs Blatt – zum Beispiel die Gleichung oder die Funktion, die du ableiten sollst.", "Once at the top of the sheet – for example the equation, or the function you have to differentiate.")}</p>
            <Blatt minHoehe={0} style={{ fontFamily: "inherit", padding: "14px 16px" }}>
              <Text s={a.text} style={{ fontSize: 17, lineHeight: 1.8, color: TINTE }} />
            </Blatt>
          </Abschnitt>

          <Abschnitt nr={2} titel={zw("Rechne nach dem Schema", "Calculate following the scheme")} data="schema">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SCHEMA().map(([t, u], i) => (
                <div key={i} style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: C.tinte, lineHeight: 1.3 }}>{t}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>{u}</p>
                </div>
              ))}
            </div>
            {aehnliche && <Musterloesung aehnliche={aehnliche} />}
            <KurzErklaert />
          </Abschnitt>

          <Abschnitt nr={3} titel={zw("Foto nur von dieser Aufgabe", "Photo of this task only")} data="foto">
            <p style={{ margin: "0 0 10px", fontSize: 14, color: C.grau, lineHeight: 1.55 }}>{zw("Gerade von oben, gutes Licht, nichts anderes im Bild. Mathilda prüft Ergebnis und Weg.", "Straight from above, good light, nothing else in the frame. Mathilda checks your result and your work.")}</p>
            <FotoTeil a={a} onUebernehmen={(x) => { onErgebnis && onErgebnis(x); onSchliessen(); }} />
          </Abschnitt>
        </div>
      </div>
    </div>
  );
}

/* ---------- Der goldene Knopf ---------- */
export function MathildaModusKnopf({ a, aehnliche, onErgebnis }) {
  const [auf, setAuf] = useState(false);
  if (!modusMoeglich(a)) return null;
  return (
    <>
      <style>{STIL}</style>
      <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px", color: C.hellgrau, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span style={{ flex: 1, height: 1, background: C.linie }} />{zw("oder auf Papier", "or on paper")}<span style={{ flex: 1, height: 1, background: C.linie }} />
      </div>
      <button type="button" className="mmm-knopf" onClick={() => setAuf(true)} data-mathilda-modus aria-haspopup="dialog"
        style={{ width: "100%", minHeight: 56, borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12, padding: "8px 14px 8px 10px", textAlign: "left",
          color: NACHT, background: goldVerlauf, boxShadow: "0 8px 22px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.55)" }}>
        <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><StiftIcon /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{zw("Mathilda-Modus", "Mathilda mode")}</span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, opacity: 0.8 }}>{zw("Auf Papier rechnen · Foto an Mathilda", "Work on paper · photo to Mathilda")}</span>
        </span>
        <Kamera farbe={NACHT} groesse={22} />
      </button>
      {auf && <MathildaModusFenster a={a} aehnliche={aehnliche} onSchliessen={() => setAuf(false)} onErgebnis={onErgebnis} />}
    </>
  );
}
