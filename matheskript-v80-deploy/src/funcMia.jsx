/* ============================================================
   MIA – die Abi-Trainerin (Mathildas Schwester im Abi-Zentrum)
   Vier Modi wie auf Mathildas Seite, alles aufs Abitur ausgerichtet:
   · Lösung korrigieren: Foto vom Blatt → BE je Teilaufgabe nach Erwartungshorizont (Folgefehler, andere Wege)
   · Aufgabe entschlüsseln: Foto einer Prüfungsaufgabe → Operatoren, BE, Plan, Falle – ohne Lösung
   · Mündliche Prüfung: Thema, 20 Minuten Vorbereitung, Vortrag, Prüfungsgespräch, Rückmeldung
   · Mia fragen: Chat mit Abi-Fokus, rechnet mit den Werkzeugen der App (werkzeuge: true)
   Regeln und Prompts: miaKontext.js. Gestaltung: abiStil.jsx.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "./base1.jsx";
import { LERN } from "./base3.jsx";
import { kiAntwort, kiEinwilligungDa, kiKopf } from "./base4.jsx";
import { Text } from "./func3.jsx";
import { dekodieren, jsonLesen, rendern } from "./func1.jsx";
import { BlattScanner } from "./funcBlattScanner.jsx";
import { useKonto } from "./konto.js";
import { springe } from "./sprung.js";
import { AbiSeite, MiaEmblem, Pfeil, BeBalken, zeitText, mitEinwilligung, GOLD, SCHWARZ, PRAEG } from "./abiStil.jsx";
import { useAbi, abiErgebnisSpeichern, abiProbeSpeichern, uebergabeHolen, UEBERGABE } from "./funcAbiDaten.jsx";
import { AufgabeKarte } from "./funcAbiTraining.jsx";
import { MIA_MODI, MIA_START, MUENDLICH_THEMEN, MUENDLICH_PHASEN, miaSystem, korrekturPrompt, korrekturLesen, entschluesselnLesen, thema as themaVon, gebietName } from "./miaKontext.js";
import { AUFGABEN_TYPEN, SACHGEBIETE, aufgabeErzeugen, neuerSeed, aufgabeAlsText, typ as typVon } from "./abiGeneratoren.js";

const NAME_WERKZEUG = { ableiten: "abgeleitet", vereinfachen: "vereinfacht", funktionswert: "Funktionswert berechnet", funktion_untersuchen: "Kurve untersucht", gleichung_loesen: "Gleichung gelöst", binomialverteilung: "Binomialverteilung berechnet", hypothesentest: "Ablehnungsbereich bestimmt" };
const URTEIL = { voll: { farbe: "#1D7A4C", text: "volle BE" }, teil: { farbe: "#9C7400", text: "Teil-BE" }, fehlt: { farbe: "#A50044", text: "keine BE" } };

/* ---------- KI-Anfrage ---------- */
async function miaAnfrage({ system, messages, maxTokens = 1500, werkzeuge = false }) {
  const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ system, messages, max_tokens: maxTokens, werkzeuge }) });
  const daten = await kiAntwort(res);
  if (daten.error) { const e = new Error(daten.error.message || "Mia hat abgelehnt."); e.kontingent = daten.error.kontingent; throw e; }
  return { text: (daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join("").trim(), werkzeuge: daten.werkzeuge || [], kontingent: daten.kontingent };
}
/* Verlauf → API-Nachrichten: Begrüßung weg, gleiche Rollen zusammenfassen, Beginn mit „user“ */
function alsNachrichten(verlauf) {
  const raus = [];
  for (const m of verlauf) {
    if (m.start) continue;
    const role = m.rolle === "mia" ? "assistant" : "user";
    if (raus.length && raus[raus.length - 1].role === role) raus[raus.length - 1].content += `\n\n${m.text}`;
    else raus.push({ role, content: m.text });
  }
  while (raus.length && raus[0].role === "assistant") raus.shift();
  return raus;
}

/* Kleine Markdown-Hilfe: **fett** als Überschrift/Hervorhebung, Formeln über Text */
function MiaText({ s, hell }) {
  const zeilen = String(s || "").split(/\n+/).filter((z) => z.trim());
  return (
    <div>
      {zeilen.map((z, i) => {
        const kopf = /^\*\*[^*]+\*\*:?\s*$/.test(z.trim());
        if (kopf) return <p key={i} style={{ margin: i ? "12px 0 0" : 0, fontSize: 14, fontWeight: 800, letterSpacing: "0.02em", color: hell ? GOLD : PRAEG }}>{z.replace(/\*\*/g, "").replace(/:$/, "")}</p>;
        const ohne = z.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/^[-•]\s*/, "· ");
        return <Text key={i} s={ohne} style={{ margin: i ? "6px 0 0" : 0, fontSize: 15, lineHeight: 1.7 }} />;
      })}
    </div>
  );
}

/* ---------- Sprache ---------- */
const Erkennung = () => (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
const vorlesbar = () => typeof window !== "undefined" && "speechSynthesis" in window;
function vorlesen(text) {
  if (!vorlesbar()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\$[^$]*\$/g, " Formel ").replace(/\*\*/g, "").replace(/\s+/g, " "));
    u.lang = "de-DE"; u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch (e) { /* nicht verfügbar */ }
}
function Mikrofon({ onText, aktiv, setAktiv }) {
  const R = Erkennung();
  const ref = useRef(null);
  if (!R) return null;
  const start = () => {
    try {
      const r = new R();
      r.lang = "de-DE"; r.interimResults = false; r.maxAlternatives = 1; r.continuous = true;
      r.onresult = (ev) => onText(Array.from(ev.results).slice(ev.resultIndex).map((x) => x[0].transcript).join(" "));
      r.onend = () => setAktiv(false); r.onerror = () => setAktiv(false);
      ref.current = r; r.start(); setAktiv(true);
    } catch (e) { setAktiv(false); }
  };
  const stopp = () => { try { ref.current && ref.current.stop(); } catch (e) { /* egal */ } setAktiv(false); };
  return (
    <button type="button" onClick={aktiv ? stopp : start} aria-pressed={aktiv} aria-label={aktiv ? "Aufnahme beenden" : "Einsprechen"} title={aktiv ? "Aufnahme beenden" : "Einsprechen"}
      className={aktiv ? "abi-puls" : undefined}
      style={{ width: 46, height: 46, flex: "none", borderRadius: 999, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        background: aktiv ? "#A50044" : SCHWARZ, color: aktiv ? "#fff" : GOLD }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></svg>
    </button>
  );
}

/* ---------- Chat (Mia fragen, mündliche Prüfung) ---------- */
function useMiaChat({ start, systemFn, werkzeuge = true, maxTokens = 900, vorlesenAn = false }) {
  const [verlauf, setVerlauf] = useState(() => (start ? [{ rolle: "mia", text: start, start: true }] : []));
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState("");
  const [kontingent, setKontingent] = useState(null);
  const verlaufRef = useRef(verlauf);
  verlaufRef.current = verlauf;
  const senden = (t, { still = false } = {}) => {
    const text = String(t || "").trim();
    if (!text || laedt) return;
    mitEinwilligung(kiEinwilligungDa, async () => {
      const neu = [...verlaufRef.current, { rolle: "schueler", text, still }];
      setVerlauf(neu); setLaedt(true); setFehler("");
      try {
        const r = await miaAnfrage({ system: systemFn(), messages: alsNachrichten(neu), maxTokens, werkzeuge });
        if (r.kontingent) setKontingent(r.kontingent);
        const antwort = r.text || "Da ist gerade etwas schiefgegangen. Magst du es noch einmal schreiben?";
        setVerlauf([...neu, { rolle: "mia", text: antwort, werkzeuge: r.werkzeuge.map((w) => NAME_WERKZEUG[w.name] || w.name) }]);
        if (vorlesenAn) vorlesen(antwort);
      } catch (e) {
        if (e.kontingent) setKontingent(e.kontingent);
        setFehler(e.message || "Mia ist gerade nicht erreichbar.");
        setVerlauf(neu);
      } finally { setLaedt(false); }
    });
  };
  const neustart = (s = start) => { setVerlauf(s ? [{ rolle: "mia", text: s, start: true }] : []); setFehler(""); };
  return { verlauf, senden, laedt, fehler, kontingent, neustart, setVerlauf };
}

function ChatVerlauf({ chat, warteText = "Mia denkt nach …" }) {
  const endeRef = useRef(null);
  useEffect(() => { springe("chat", () => endeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })); }, [chat.verlauf.length, chat.laedt]);
  return (
    <div data-mia-verlauf>
      {chat.verlauf.map((m, i) => m.still ? (
        <p key={i} style={{ textAlign: "center", margin: "10px 0", fontSize: 12, fontWeight: 700, color: "#7A5C00", letterSpacing: "0.04em" }}>— {m.text.replace(/^\[|\]$/g, "")} —</p>
      ) : (
        <div key={i} style={{ display: "flex", justifyContent: m.rolle === "schueler" ? "flex-end" : "flex-start", gap: 8, marginBottom: 10, alignItems: "flex-end" }}>
          {m.rolle === "mia" && <MiaEmblem groesse={30} id={`mia-c${i}`} />}
          <div style={{ maxWidth: "84%", padding: "11px 15px", borderRadius: 18, background: m.rolle === "schueler" ? SCHWARZ : "#FFFDF6", color: m.rolle === "schueler" ? "#fff" : "#1B1606",
            border: m.rolle === "schueler" ? "none" : "1px solid rgba(201,154,12,0.45)", boxShadow: m.rolle === "schueler" ? "none" : "0 8px 20px -14px rgba(90,67,0,0.45)",
            borderBottomRightRadius: m.rolle === "schueler" ? 5 : 18, borderBottomLeftRadius: m.rolle === "schueler" ? 18 : 5 }}>
            {m.rolle === "mia" ? <MiaText s={m.text} /> : <Text s={m.text} style={{ margin: 0, fontSize: 15, lineHeight: 1.65 }} />}
            {m.werkzeuge && m.werkzeuge.length > 0 && <p className="abi-klein" style={{ marginTop: 6 }}>⚙ Mit der App nachgerechnet: {[...new Set(m.werkzeuge)].join(", ")}</p>}
            {m.rolle === "mia" && !m.start && vorlesbar() && (
              <button type="button" onClick={() => vorlesen(m.text)} style={{ background: "none", border: "none", padding: "6px 0 0", color: PRAEG, font: "inherit", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>🔊 Vorlesen</button>
            )}
          </div>
        </div>
      ))}
      {chat.laedt && <p role="status" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#6B5A26" }}><span className="abi-puls" style={{ width: 10, height: 10, borderRadius: 999, background: GOLD }} />{warteText}</p>}
      {chat.fehler && <p role="alert" className="abi-warn">{chat.fehler}</p>}
      <div ref={endeRef} />
    </div>
  );
}

function ChatEingabe({ chat, platzhalter = "Schreib Mia …", senden }) {
  const [text, setText] = useState("");
  const [mikro, setMikro] = useState(false);
  const ab = () => { const t = text; setText(""); (senden || chat.senden)(t); };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <Mikrofon aktiv={mikro} setAktiv={setMikro} onText={(t) => setText((alt) => (alt ? `${alt} ${t}` : t))} />
        <textarea value={text} rows={1} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ab(); } }}
          placeholder={mikro ? "Ich höre zu …" : platzhalter} aria-label="Nachricht an Mia"
          style={{ flex: 1, minWidth: 0, minHeight: 46, maxHeight: 160, padding: "12px 16px", fontSize: 15, fontFamily: "inherit", border: "1px solid rgba(90,67,0,0.35)", borderRadius: 22, outline: "none", background: "#FFFDF6", resize: "vertical" }} />
        <button type="button" className="abi-knopf dunkel" onClick={ab} disabled={chat.laedt || !text.trim()} style={{ minHeight: 46 }}>Senden</button>
      </div>
      <p className="abi-klein" style={{ marginTop: 8 }}>
        {chat.kontingent && chat.kontingent.limit ? `Heute ${chat.kontingent.anzahl} von ${chat.kontingent.limit} Anfragen · ` : ""}
        Mia verrät Lösungen nur auf Wunsch. Das Gespräch geht an Anthropic (Claude) und wird nicht gespeichert.
      </p>
    </div>
  );
}

/* ---------- Foto ---------- */
function FotoWahl({ titel, zeile, knopf, onSenden, laeuft, warteText }) {
  const [scan, setScan] = useState(false);
  const [quelle, setQuelle] = useState(null);
  const [bild, setBild] = useState(null);
  const [drehung, setDrehung] = useState(0);
  const [fehler, setFehler] = useState("");
  const galerieRef = useRef(null), kameraRef = useRef(null);
  const datei = async (f) => {
    if (!f) return;
    setFehler(""); setScan(false);
    try {
      const src = await dekodieren(f, () => {});
      setQuelle(src); setDrehung(0);
      const r = rendern(src, 0);
      setBild({ b64: r.b64, vorschau: r.vorschau });
    } catch (e) { setFehler(e.message || "Das Foto ließ sich nicht öffnen."); }
  };
  const drehen = () => { if (!quelle) return; const d = (drehung + 90) % 360; setDrehung(d); const r = rendern(quelle, d); setBild({ b64: r.b64, vorschau: r.vorschau }); };
  return (
    <div className="abi-karte" data-mia-foto>
      <span className="abi-eyebrow">{titel}</span>
      {zeile && <p className="abi-text" style={{ marginTop: 6 }}>{zeile}</p>}
      {!bild && (
        <div className="abi-raster zwei" style={{ marginTop: 14, gap: 10 }}>
          <button type="button" className="abi-knopf gold breit" onClick={() => setScan(true)} style={{ minHeight: 56 }} data-mia-kamera>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.6" /></svg>
            Foto aufnehmen
          </button>
          <button type="button" className="abi-knopf rand breit" onClick={() => galerieRef.current?.click()} style={{ minHeight: 56 }}>Aus der Galerie</button>
        </div>
      )}
      {bild && !laeuft && (
        <div style={{ marginTop: 14 }}>
          <div style={{ background: "#F3ECD6", borderRadius: 14, padding: 8 }}><img src={bild.vorschau} alt="Dein Foto" style={{ display: "block", width: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 10 }} /></div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" className="abi-knopf rand klein" onClick={drehen}>Drehen ↻</button>
            <button type="button" className="abi-knopf rand klein" onClick={() => { setBild(null); setQuelle(null); }}>Anderes Foto</button>
          </div>
          <button type="button" className="abi-knopf dunkel breit" style={{ marginTop: 12, minHeight: 54 }} onClick={() => onSenden(bild.b64)} data-mia-senden>{knopf}<Pfeil /></button>
        </div>
      )}
      {laeuft && (
        <div role="status" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <span className="abi-puls"><MiaEmblem groesse={44} id="mia-wartet" /></span>
          <p className="abi-text" style={{ fontWeight: 700 }}>{warteText}</p>
        </div>
      )}
      {fehler && <p role="alert" className="abi-warn" style={{ marginTop: 12 }}>{fehler}</p>}
      <p className="abi-klein" style={{ marginTop: 12 }}>Das Foto geht zur Prüfung an Anthropic (Claude) und wird nicht gespeichert. Ohne Namen fotografieren.</p>
      <input ref={galerieRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { datei(e.target.files && e.target.files[0]); e.target.value = ""; }} data-mia-galerie />
      <input ref={kameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { datei(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      <BlattScanner offen={scan} onSchliessen={() => setScan(false)} onFoto={datei}
        onKameraApp={() => { setScan(false); kameraRef.current?.click(); }} onGalerie={() => { setScan(false); galerieRef.current?.click(); }} />
    </div>
  );
}

/* ---------- Modus: Lösung korrigieren ---------- */
function Korrigieren({ start, zuChat, gehe }) {
  const konto = useKonto();
  const abi = useAbi();
  const [quelle, setQuelle] = useState(start ? "generator" : "eigen");   // generator | eigen
  const [aufgabe, setAufgabe] = useState(start);
  const [typId, setTypId] = useState(start ? start.typ : AUFGABEN_TYPEN[0].id);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [erg, setErg] = useState(null);
  const ergRef = useRef(null);
  const a = quelle === "generator" ? aufgabe : null;

  const senden = (b64) => mitEinwilligung(kiEinwilligungDa, async () => {
    setLaeuft(true); setFehler(""); setErg(null);
    try {
      const system = miaSystem({ modus: "korrigieren", L: LERN, profil: konto.profil, abiProfil: abi.profil, abi });
      const content = [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } }, { type: "text", text: korrekturPrompt(a) }];
      const r = await miaAnfrage({ system, messages: [{ role: "user", content }], maxTokens: 1800 });
      const k = korrekturLesen(jsonLesen(r.text), a);
      setErg(k);
      if (k.lesbar && a) abiErgebnisSpeichern({ typ: a.typ, sachgebiet: a.sachgebiet, be: k.summe, max: k.max, quelle: "mia" });
      try { localStorage.setItem("matheplus-mia-korrekturen", String((parseInt(localStorage.getItem("matheplus-mia-korrekturen") || "0", 10) || 0) + 1)); } catch (e) { /* privat */ }
      springe("mia-schritt", () => setTimeout(() => ergRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 50));
    } catch (e) { setFehler(e.message || "Mia ist gerade nicht erreichbar."); }
    finally { setLaeuft(false); }
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="abi-karte">
        <span className="abi-eyebrow">Welche Aufgabe?</span>
        <div className="abi-chips" role="radiogroup" aria-label="Aufgabe" style={{ marginTop: 10 }}>
          <button type="button" role="radio" aria-checked={quelle === "generator"} className="abi-chip" onClick={() => { setQuelle("generator"); setErg(null); if (!aufgabe) setAufgabe(aufgabeErzeugen(typId, neuerSeed())); }} data-mia-generator>Abi-Aufgabe aus der App</button>
          <button type="button" role="radio" aria-checked={quelle === "eigen"} className="abi-chip" onClick={() => { setQuelle("eigen"); setErg(null); }} data-mia-eigen>Eigene Aufgabe (Buch, Abi, Klausur)</button>
        </div>
        {quelle === "generator" && (
          <div className="abi-raster zwei" style={{ marginTop: 14 }}>
            <label className="abi-feld"><span>Aufgabentyp</span>
              <select value={typId} onChange={(e) => { setTypId(e.target.value); setAufgabe(aufgabeErzeugen(e.target.value, neuerSeed())); setErg(null); }}>
                {AUFGABEN_TYPEN.map((t) => <option key={t.id} value={t.id}>{SACHGEBIETE[t.sachgebiet].kurz} · {t.titel}</option>)}
              </select>
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="button" className="abi-knopf rand breit" onClick={() => { setAufgabe(aufgabeErzeugen(typId, neuerSeed())); setErg(null); }}>{aufgabe ? "Neue Aufgabe" : "Aufgabe erzeugen"}</button>
            </div>
          </div>
        )}
        {quelle === "eigen" && <p className="abi-text" style={{ marginTop: 12 }}>Fotografiere Aufgabe und Lösung zusammen (oder schreib die Aufgabe oben aufs Blatt). Stehen keine BE dabei, schätzt Mia sie nach IQB-Logik.</p>}
      </div>
      {a && <AufgabeKarte a={a} kennung={{ "data-mia-aufgabe": a.typ }} />}
      {quelle === "generator" && !a && <p className="abi-hinweis">Erzeuge zuerst eine Aufgabe, rechne sie auf Papier – dann das Foto.</p>}
      {(quelle === "eigen" || a) && !erg && (
        <FotoWahl titel="Deine Lösung" zeile={a ? "Nur diese Aufgabe ins Bild, ein Schritt pro Zeile." : null} knopf="Von Mia korrigieren lassen" onSenden={senden} laeuft={laeuft} warteText="Mia korrigiert – Zeile für Zeile, nach Erwartungshorizont …" />
      )}
      {fehler && <p role="alert" className="abi-warn">{fehler}</p>}
      {erg && (
        <div ref={ergRef} style={{ display: "grid", gap: 14 }} data-mia-korrektur>
          {!erg.lesbar ? (
            <div className="abi-warn">{erg.hinweis}</div>
          ) : (
            <>
              <div className="abi-karte gold">
                <span className="abi-eyebrow">Mias Korrektur</span>
                <h3 style={{ marginTop: 4, fontSize: "clamp(30px, 8vw, 42px)", fontWeight: 900, letterSpacing: "-0.04em" }}>{erg.summe} von {erg.max} BE</h3>
                <div style={{ margin: "10px 0 0", maxWidth: 380 }}><BeBalken be={erg.summe} max={erg.max} label={`${erg.summe} von ${erg.max} BE`} /></div>
                {erg.staerke && <p className="abi-text" style={{ marginTop: 10 }}><b>Gut:</b> {erg.staerke}</p>}
              </div>
              <div className="abi-karte">
                {erg.teile.map((t) => (
                  <div key={t.b} style={{ padding: "12px 0", borderBottom: "1px solid var(--abi-linie)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <b style={{ fontSize: 16 }}>{t.b})</b>
                      <span style={{ fontSize: 12, fontWeight: 800, color: URTEIL[t.urteil].farbe, textTransform: "uppercase", letterSpacing: "0.08em" }}>{URTEIL[t.urteil].text}</span>
                      <span className="abi-be" style={{ marginLeft: "auto" }}>{t.be} / {t.max} BE</span>
                    </div>
                    {t.kommentar && <Text s={t.kommentar} style={{ margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.65 }} />}
                  </div>
                ))}
              </div>
              {(erg.hebel.length > 0 || erg.darstellung) && (
                <div className="abi-karte dunkel">
                  <span className="abi-eyebrow">Deine Hebel für die nächste Aufgabe</span>
                  <ol style={{ margin: "10px 0 0", paddingLeft: 20 }}>{erg.hebel.map((h, i) => <li key={i} style={{ marginTop: i ? 6 : 0 }}><Text s={h} style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#fff" }} /></li>)}</ol>
                  {erg.darstellung && <p className="abi-klein" style={{ marginTop: 12 }}>Darstellung: {erg.darstellung}</p>}
                </div>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="abi-knopf dunkel" onClick={() => zuChat(a, erg)}>Nachfragen bei Mia<Pfeil /></button>
            {a && <button type="button" className="abi-knopf rand" onClick={() => { setAufgabe(aufgabeErzeugen(a.typ, neuerSeed())); setErg(null); }}>Nächste Aufgabe dieses Typs</button>}
            <button type="button" className="abi-knopf rand" onClick={() => gehe({ ansicht: "abiaufgaben" })}>Zu den Abi-Aufgaben</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Modus: Aufgabe entschlüsseln ---------- */
function Entschluesseln({ zuChat }) {
  const konto = useKonto();
  const abi = useAbi();
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [erg, setErg] = useState(null);
  const senden = (b64) => mitEinwilligung(kiEinwilligungDa, async () => {
    setLaeuft(true); setFehler(""); setErg(null);
    try {
      const system = miaSystem({ modus: "entschluesseln", L: LERN, profil: konto.profil, abiProfil: abi.profil, abi });
      const content = [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } }, { type: "text", text: "Entschlüssele diese Aufgabe für mich – ohne sie zu lösen." }];
      const r = await miaAnfrage({ system, messages: [{ role: "user", content }], maxTokens: 1800 });
      setErg(entschluesselnLesen(jsonLesen(r.text)));
    } catch (e) { setFehler(e.message || "Mia ist gerade nicht erreichbar."); }
    finally { setLaeuft(false); }
  });
  const alsText = (e) => [`Aufgabe: ${e.thema}`, ...e.teile.map((t) => `${t.b}) ${t.operator}, ${t.be} BE: ${t.worum}`)].join("\n");
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {!erg && <FotoWahl titel="Prüfungsaufgabe fotografieren" zeile="Aus einem alten Abi, dem Buch oder der Klausur. Mia zeigt, was jeder Operator verlangt, wo die BE liegen und wie du vorgehst – lösen tust du selbst." knopf="Entschlüsseln" onSenden={senden} laeuft={laeuft} warteText="Mia liest die Aufgabe und sucht die Operatoren …" />}
      {fehler && <p role="alert" className="abi-warn">{fehler}</p>}
      {erg && !erg.lesbar && <div className="abi-warn">{erg.hinweis}</div>}
      {erg && erg.lesbar && (
        <div style={{ display: "grid", gap: 14 }} data-mia-entschluesselt>
          <div className="abi-karte gold">
            <span className="abi-eyebrow">{erg.sachgebiet ? gebietName(erg.sachgebiet) : "Aufgabe"}{erg.hilfsmittel ? ` · ${erg.hilfsmittel}` : ""}</span>
            <h3 style={{ marginTop: 4, fontSize: 24 }}>{erg.thema || "Deine Aufgabe"}</h3>
            <p className="abi-text" style={{ marginTop: 6 }}>{erg.be} BE · etwa {erg.zeit} Minuten</p>
          </div>
          {erg.teile.map((t) => (
            <div key={t.b} className="abi-karte">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <b style={{ fontSize: 17 }}>{t.b})</b>
                {t.operator && <span className="abi-chip" style={{ cursor: "default", background: SCHWARZ, color: GOLD, borderColor: SCHWARZ }}>{t.operator}</span>}
                <span className="abi-be" style={{ marginLeft: "auto" }}>{t.be} BE{t.geschaetzt ? " (geschätzt)" : ""}</span>
              </div>
              {t.worum && <Text s={t.worum} style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.65 }} />}
              {t.plan.length > 0 && (
                <ol style={{ margin: "10px 0 0", paddingLeft: 20 }}>{t.plan.map((s, i) => <li key={i} style={{ marginTop: 4 }}><Text s={s} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }} /></li>)}</ol>
              )}
              {t.falle && <p className="abi-hinweis" style={{ marginTop: 10 }}><b>Falle:</b> {t.falle.replace(/\$/g, "")}</p>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="abi-knopf dunkel" onClick={() => zuChat(null, null, alsText(erg))}>Mit Mia Schritt für Schritt lösen<Pfeil /></button>
            <button type="button" className="abi-knopf rand" onClick={() => setErg(null)}>Andere Aufgabe</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Modus: Mündliche Prüfung ---------- */
function Muendlich() {
  const konto = useKonto();
  const abi = useAbi();
  const [themaId, setThemaId] = useState(null);
  const [phase, setPhase] = useState("wahl");   // wahl | vorbereitung | vortrag | gespraech | rueckmeldung
  const [seit, setSeit] = useState(Date.now());
  const [jetzt, setJetzt] = useState(Date.now());
  const [sprechen, setSprechen] = useState(false);
  const [rueck, setRueck] = useState(null);
  const [rueckLaedt, setRueckLaedt] = useState(false);
  const [rueckFehler, setRueckFehler] = useState("");
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const t = themaVon(themaId);
  const kopfRef = useRef(null);
  const systemFn = () => miaSystem({ modus: "muendlich", L: LERN, profil: konto.profil, abiProfil: abi.profil, abi, muendlich: { thema: themaId, phase: phaseRef.current } });
  const chat = useMiaChat({ start: MIA_START.muendlich, systemFn, werkzeuge: false, maxTokens: 500, vorlesenAn: sprechen });
  useEffect(() => { if (phase === "wahl" || phase === "rueckmeldung") return undefined; const i = setInterval(() => setJetzt(Date.now()), 1000); return () => clearInterval(i); }, [phase]);
  const sek = Math.floor((jetzt - seit) / 1000);
  const ph = MUENDLICH_PHASEN.find((x) => x.id === phase);
  const weiter = (neu) => { setPhase(neu); setSeit(Date.now()); setJetzt(Date.now()); springe("mia-schritt", () => setTimeout(() => kopfRef.current?.scrollIntoView({ block: "start" }), 30)); };
  const gespraechStarten = () => { weiter("gespraech"); setTimeout(() => chat.senden("[Vortrag beendet. Bitte beginnen Sie das Prüfungsgespräch.]", { still: true }), 60); };
  const beenden = () => mitEinwilligung(kiEinwilligungDa, async () => {
    weiter("rueckmeldung"); setRueckLaedt(true); setRueckFehler("");
    try {
      const msgs = alsNachrichten([...chat.verlauf, { rolle: "schueler", text: "[Prüfung beendet. Bitte gib mir jetzt deine Rückmeldung.]" }]);
      const r = await miaAnfrage({ system: miaSystem({ modus: "muendlich", L: LERN, profil: konto.profil, abiProfil: abi.profil, abi, muendlich: { thema: themaId, phase: "rueckmeldung" } }), messages: msgs, maxTokens: 1200 });
      setRueck(r.text);
      abiProbeSpeichern({ art: "muendlich", be: null, max: null, sekunden: null, thema: themaId });
    } catch (e) { setRueckFehler(e.message || "Mia ist gerade nicht erreichbar."); }
    finally { setRueckLaedt(false); }
  });
  const neu = () => { setThemaId(null); setPhase("wahl"); setRueck(null); chat.neustart(); };

  if (phase === "wahl") {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div className="abi-karte dunkel">
          <span className="abi-eyebrow">So läuft die Simulation</span>
          <ol style={{ margin: "10px 0 0", paddingLeft: 20, color: "rgba(255,255,255,0.86)", fontSize: 15, lineHeight: 1.7 }}>
            {MUENDLICH_PHASEN.map((p) => <li key={p.id}><b style={{ color: GOLD }}>{p.titel}</b>{p.minuten ? ` · ${p.minuten} Min.` : ""} – {p.zeile}</li>)}
          </ol>
          <p className="abi-klein" style={{ marginTop: 10 }}>Sprich laut (Mikrofon) oder tipp in Abschnitten. Mia siezt dich wie in der echten Prüfung.</p>
        </div>
        {["analysis", "geometrie", "stochastik"].map((g) => (
          <div key={g} className="abi-karte">
            <span className="abi-eyebrow">Vortrag in {gebietName(g)}</span>
            {MUENDLICH_THEMEN.filter((x) => x.gebiet === g).map((x) => (
              <button key={x.id} type="button" className="abi-zeile" onClick={() => { setThemaId(x.id); weiter("vorbereitung"); }} data-mia-thema={x.id}>
                <span><b>{x.titel}</b><span className="z">Gespräch danach in {gebietName(x.gespraech)}</span></span><Pfeil />
              </button>
            ))}
          </div>
        ))}
        <button type="button" className="abi-knopf gold breit" onClick={() => { const x = MUENDLICH_THEMEN[Math.floor(Math.random() * MUENDLICH_THEMEN.length)]; setThemaId(x.id); weiter("vorbereitung"); }}>Zufälliges Thema – wie am Prüfungstag<Pfeil /></button>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div ref={kopfRef} />
      <div className="abi-karte gold" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span className="abi-eyebrow">{ph.titel}{ph.minuten ? ` · Richtwert ${ph.minuten} Minuten` : ""}</span>
          <h3 style={{ marginTop: 4 }}>{t.titel}</h3>
        </div>
        {phase !== "rueckmeldung" && <span className="abi-countdown" style={{ padding: "8px 14px" }}><b style={{ fontSize: 24, color: phase === "vorbereitung" && ph.minuten * 60 - sek < 0 ? "#FF8FA3" : GOLD }}>{phase === "vorbereitung" ? zeitText(Math.max(0, ph.minuten * 60 - sek)) : zeitText(sek)}</b><span>{phase === "vorbereitung" ? "übrig" : "läuft"}</span></span>}
      </div>
      <div className="abi-karte" data-mia-auftrag>
        <span className="abi-eyebrow">Prüfungsaufgabe · {gebietName(t.gebiet)}</span>
        {t.auftrag.map((z, i) => <Text key={i} s={z} style={{ margin: i ? "8px 0 0" : "10px 0 0", fontSize: 15.5, lineHeight: 1.7, fontWeight: i ? 400 : 600 }} />)}
      </div>
      {phase === "vorbereitung" && (
        <>
          <p className="abi-hinweis">Stichpunkte auf Papier, keine ganzen Sätze. Plane den Vortrag in drei Teilen: Begriff erklären, rechnen, Ergebnis deuten. Ohne Hilfsmittel.</p>
          <button type="button" className="abi-knopf dunkel breit" style={{ minHeight: 56 }} onClick={() => weiter("vortrag")} data-mia-vortrag>Ich bin bereit – Vortrag beginnen<Pfeil /></button>
        </>
      )}
      {(phase === "vortrag" || phase === "gespraech") && (
        <div className="abi-karte" style={{ background: "#FBF5E3 padding-box, linear-gradient(135deg, rgba(255,233,160,0.95), rgba(201,154,12,0.5) 50%, rgba(90,67,0,0.45)) border-box" }}>
          <ChatVerlauf chat={chat} warteText={phase === "vortrag" ? "Mia hört zu …" : "Mia überlegt die nächste Frage …"} />
          <div style={{ marginTop: 10 }}><ChatEingabe chat={chat} platzhalter={phase === "vortrag" ? "Trag vor – Abschnitt für Abschnitt …" : "Deine Antwort …"} /></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
            {phase === "vortrag" ? (
              <button type="button" className="abi-knopf gold" onClick={gespraechStarten} disabled={chat.laedt} data-mia-gespraech>Vortrag beendet – zum Prüfungsgespräch<Pfeil /></button>
            ) : (
              <button type="button" className="abi-knopf gold" onClick={beenden} disabled={chat.laedt} data-mia-beenden>Prüfung beenden – Rückmeldung<Pfeil /></button>
            )}
            {vorlesbar() && (
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                <input type="checkbox" checked={sprechen} onChange={(e) => setSprechen(e.target.checked)} style={{ width: 18, height: 18, accentColor: GOLD }} />Mia spricht laut
              </label>
            )}
          </div>
        </div>
      )}
      {phase === "rueckmeldung" && (
        <div className="abi-karte dunkel" data-mia-rueckmeldung>
          <span className="abi-eyebrow">Mias Rückmeldung</span>
          {rueckLaedt && <p role="status" className="abi-text" style={{ marginTop: 10 }}>Mia schaut sich Vortrag und Gespräch noch einmal an …</p>}
          {rueckFehler && <p role="alert" className="abi-warn" style={{ marginTop: 10 }}>{rueckFehler}</p>}
          {rueck && <div style={{ marginTop: 10, color: "#fff" }}><MiaText s={rueck} hell /></div>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button type="button" className="abi-knopf gold" onClick={neu}>Neues Thema<Pfeil /></button>
            {rueckFehler && <button type="button" className="abi-knopf rand" onClick={beenden}>Noch einmal versuchen</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Modus: Mia fragen ---------- */
function Fragen({ kontext }) {
  const konto = useKonto();
  const abi = useAbi();
  const aufgabe = kontext && kontext.aufgabe;
  const systemFn = () => {
    const s = miaSystem({ modus: "fragen", L: LERN, profil: konto.profil, abiProfil: abi.profil, abi, aufgabe });
    return kontext && kontext.notiz ? `${s}\n\nDarum geht es gerade (aus der App):\n${kontext.notiz}` : s;
  };
  const chat = useMiaChat({ start: kontext && kontext.start ? kontext.start : MIA_START.fragen, systemFn, werkzeuge: true, maxTokens: 900 });
  const vorschlaege = aufgabe
    ? ["Gib mir einen Hinweis für den ersten Schritt.", "Welche BE gibt es wofür?", "Was verlangt der Operator genau?"]
    : ["Wie teile ich die 110 Minuten in Teil A ein?", "Was heißt „Zeigen Sie“ genau?", "Welche Formeln muss ich ohne Formeldokument können?", "Wie lerne ich in den letzten zwei Wochen?"];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {aufgabe && <AufgabeKarte a={aufgabe} />}
      <div className="abi-karte" style={{ background: "#FBF5E3 padding-box, linear-gradient(135deg, rgba(255,233,160,0.95), rgba(201,154,12,0.5) 50%, rgba(90,67,0,0.45)) border-box" }} data-mia-chat>
        <ChatVerlauf chat={chat} />
        {chat.verlauf.length <= 2 && (
          <div className="abi-chips" style={{ margin: "4px 0 12px" }}>
            {vorschlaege.map((v) => <button key={v} type="button" className="abi-chip" onClick={() => chat.senden(v)}>{v}</button>)}
          </div>
        )}
        <ChatEingabe chat={chat} />
        {chat.verlauf.length > 1 && <button type="button" className="abi-knopf rand klein" style={{ marginTop: 10 }} onClick={() => chat.neustart()}>Neues Gespräch</button>}
      </div>
    </div>
  );
}

/* ---------- Seite ---------- */
function MiaKopf({ modus, setModus, gehe }) {
  return (
    <header style={{ position: "relative", overflow: "hidden", isolation: "isolate", color: "#fff",
      background: `radial-gradient(70% 120% at 85% 0%, rgba(237,187,0,0.32) 0%, transparent 60%), linear-gradient(150deg, ${SCHWARZ} 0%, #1A1608 62%, #2E2408 100%)` }}>
      <div style={{ position: "absolute", right: "max(-60px, calc((100vw - 820px) / 2 - 220px))", top: -40, opacity: 0.12, zIndex: -1, pointerEvents: "none" }} className="mia-kopf-deko"><MiaEmblem groesse={360} id="mia-deko" /></div>
      <div className="abi-innen" style={{ paddingTop: 16, paddingBottom: 18, maxWidth: 820 }}>
        <button type="button" className="abi-zurueck" onClick={() => gehe({ ansicht: "abi" })} style={{ background: "rgba(237,187,0,0.14)", color: GOLD }}>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4M7.5 4L3.5 8l4 4" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>Abi-Zentrum
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16 }}>
          <MiaEmblem groesse={86} id="mia-kopf" />
          <div style={{ minWidth: 0 }}>
            <span className="abi-eyebrow" style={{ color: GOLD }}>Die Abi-Trainerin</span>
            <h1 style={{ margin: "4px 0 0", fontSize: "clamp(40px, 11vw, 64px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95,
              background: "linear-gradient(100deg, #FFF3C4 0%, #F2C14E 40%, #EDBB00 60%, #FFE9A0 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Mia</h1>
          </div>
        </div>
        <p style={{ margin: "12px 0 0", maxWidth: 52 + "ch", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.82)" }}>Korrigiert nach Erwartungshorizont, entschlüsselt Prüfungsaufgaben und nimmt dich mündlich dran – mit deinem Abi-Format im Kopf.</p>
        <div className="abi-reiter" role="tablist" aria-label="Was Mia für dich tut" style={{ marginTop: 16 }}>
          {MIA_MODI.map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={modus === m.id} onClick={() => setModus(m.id)} data-mia-reiter={m.id}
              style={modus === m.id ? { background: GOLD, color: SCHWARZ } : { background: "rgba(255,255,255,0.08)", color: "#fff" }}>{m.name}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 3, background: "linear-gradient(90deg, #B58612, #EDBB00 50%, #B58612)" }} />
    </header>
  );
}

export function MiaSeite({ gehe }) {
  const start = useMemo(() => {
    const u = uebergabeHolen(UEBERGABE.mia);
    return u && typVon(u.typ) ? aufgabeErzeugen(u.typ, u.seed) : null;
  }, []);
  const [modus, setModusRoh] = useState(() => { const m = uebergabeHolen(UEBERGABE.miaModus); return MIA_MODI.some((x) => x.id === m) ? m : "korrigieren"; });
  const [kontext, setKontext] = useState(() => (start && modus === "fragen" ? { aufgabe: start } : null));
  const [chatSchluessel, setChatSchluessel] = useState(0);
  const setModus = (m) => { setModusRoh(m); if (m !== "fragen") setKontext(null); };
  const zuChat = (aufgabe, korrektur, notiz) => {
    const n = [notiz, korrektur && korrektur.lesbar ? `Mias Korrektur: ${korrektur.summe} von ${korrektur.max} BE. ${korrektur.teile.map((t) => `${t.b}) ${t.be}/${t.max}: ${t.kommentar}`).join(" ")}` : null].filter(Boolean).join("\n");
    setKontext({ aufgabe, notiz: n, start: korrektur ? "Lass uns die Korrektur durchgehen. Bei welchem Teil willst du anfangen?" : notiz ? "Gehen wir die Aufgabe zusammen an. Womit fängst du an?" : null });
    setChatSchluessel((k) => k + 1);
    setModusRoh("fragen");
  };
  return (
    <AbiSeite kennung={{ "data-mia-seite": modus }}>
      <MiaKopf modus={modus} setModus={setModus} gehe={gehe} />
      <div className="abi-innen" style={{ maxWidth: 820, marginTop: 20 }}>
        {modus === "korrigieren" && <Korrigieren start={start} zuChat={zuChat} gehe={gehe} />}
        {modus === "entschluesseln" && <Entschluesseln zuChat={zuChat} />}
        {modus === "muendlich" && <Muendlich />}
        {modus === "fragen" && <Fragen key={chatSchluessel} kontext={kontext} />}
      </div>
    </AbiSeite>
  );
}

export default MiaSeite;
export const MIA_AUFGABE_TEXT = aufgabeAlsText;
