import React, { useRef, useState } from "react";
import { API_URL } from "./base1.jsx";
import { kiAntwort, kiKopf } from "./base4.jsx";
import { dekodieren, jsonLesen, rendern } from "./func1.jsx";
import { Einwilligung, einwilligungLesen } from "./func9.jsx";
import { FEHLERTYPEN_TAX, HAUPTKATEGORIEN, KONTEXTE, kontextName, typName, untertypName } from "./perfTaxonomie.js";
import { AUFGABEN_VORZEICHEN, bewerte } from "./perfAufgaben.js";
import {
  QUELLEN, STATUS_NAMEN, baueCluster, diagnosePrompt, exportiere, hashId, loescheNutzerdaten, loescheTestdaten, meldeAufgabe, meldeFehler,
  scanDiagnose, validiereDiagnose, validiereScanLesung,
} from "./perfKern.js";
import { SCAN_BEISPIELE, ladeTestdaten, zeilenAusText } from "./perfTestdaten.js";
import { perfAendern, usePerf } from "./perfSpeicher.js";
import { Absatz, Chip, Formel, Formeleingabe, Karte, Kicker, Knopf, KANAL_FARBE, L, MText, STATUS_FARBE, Titel, datum, prozent } from "./perfUi.jsx";

/* ======================================================================
   Quellen-Testlabor des Performance-Labs
   Hier lassen sich beide Lernkanäle ausprobieren und das gemeinsame Gedächtnis füllen:
     · Scan (Kanal B): Foto oder getippte Zeilen → Beobachtung → Prüfung → Hypothese → Konfidenz → Speichern
     · Digitale Übung (Kanal A): wie ein Übungstool, mit allen Aufnahmeregeln sichtbar
     · Manuell: Fehler selbst melden (von der Person bestätigt)
     · Daten: Testdaten, Export, Löschen
   ====================================================================== */

const selektStil = { fontFamily: "inherit", fontSize: 14.5, color: L.text, background: L.bg, border: `1.5px solid ${L.linieStark}`, borderRadius: 12, padding: "11px 12px", minHeight: 46, width: "100%", boxSizing: "border-box" };
const labelStil = { display: "block", fontSize: 12.5, fontWeight: 600, color: L.ged, marginBottom: 6 };

export function Quellen({ nutzerId, onAnalyse }) {
  const [teil, setTeil] = useState("scan");
  const teile = [["scan", "Scan"], ["digital", "Digitale Übung"], ["manuell", "Selbst melden"], ["daten", "Daten"]];
  return (
    <div className="perf-rein">
      <Kicker>Quellen testen</Kicker>
      <Titel>Zwei Lernkanäle, ein Fehlergedächtnis</Titel>
      <Absatz>Hier fließen digitale Übungen und handschriftliche Blätter in dieselbe Taxonomie, dieselbe Prüfung und dieselbe Fehlerhistorie. Ein Vorzeichenfehler auf einem Foto ist mit einem Vorzeichenfehler aus einer Übung vergleichbar.</Absatz>
      <div role="tablist" aria-label="Quelle" className="perf-tabs" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 999 }}>
        {teile.map(([id, n]) => (
          <button key={id} role="tab" aria-selected={teil === id} onClick={() => setTeil(id)}
            style={{ fontFamily: "inherit", cursor: "pointer", flex: "1 0 auto", minHeight: 40, padding: "0 16px", borderRadius: 999, border: "none", fontSize: 13.5, fontWeight: 700,
              background: teil === id ? L.blau : "transparent", color: teil === id ? "#fff" : L.ged }}>{n}</button>
        ))}
      </div>
      {teil === "scan" && <ScanTest nutzerId={nutzerId} onAnalyse={onAnalyse} />}
      {teil === "digital" && <DigitalTest nutzerId={nutzerId} onAnalyse={onAnalyse} />}
      {teil === "manuell" && <ManuellMelden nutzerId={nutzerId} onAnalyse={onAnalyse} />}
      {teil === "daten" && <DatenVerwaltung nutzerId={nutzerId} />}
    </div>
  );
}

/* Wo landet ein gespeichertes Ereignis? */
function Einordnung({ nutzerId, ereignisId, onAnalyse }) {
  const { P } = usePerf();
  const e = P.ereignisse.find((x) => x.id === ereignisId && x.nutzerId === nutzerId);
  if (!e) return null;
  const c = baueCluster(P, nutzerId).find((x) => x.ereignisIds.includes(e.id));
  return (
    <div role="status" className="perf-rein" style={{ marginTop: 12, padding: "14px 16px", borderRadius: 14, background: `${STATUS_FARBE[e.status]}18`, border: `1px solid ${STATUS_FARBE[e.status]}66`, fontSize: 14, lineHeight: 1.65, color: L.text }}>
      <b>Gespeichert als „{STATUS_NAMEN[e.status]}“</b>{" "}
      {e.status === "unsicher"
        ? <span style={{ color: L.ged }}>– unsichere Ereignisse zählen noch nicht für Muster. Du findest sie im Fehlerprofil unter „Zur Klärung“.</span>
        : c ? <span style={{ color: L.ged }}>– gehört zu „{typName(c.typ)}“{c.untertyp !== "allgemein" ? `, ${untertypName(c.typ, c.untertyp)}` : ""} ({c.haeufigkeit} Beobachtung{c.haeufigkeit === 1 ? "" : "en"}: {c.quellen.digital} digital, {c.quellen.scan} Scan{c.quellen.manuell ? `, ${c.quellen.manuell} manuell` : ""}).</span>
          : null}
      <div style={{ marginTop: 8 }}><Knopf klein art="geist" onClick={() => onAnalyse && onAnalyse(e.id)}>Analyse ansehen</Knopf></div>
    </div>
  );
}

/* ---------------------------------------------------------------- Scan */
const MODI = [["text", "Zeilen eintippen"], ["foto", "Foto auswerten"]];

function ScanTest({ nutzerId, onAnalyse }) {
  const [modus, setModus] = useState("text");
  const [text, setText] = useState(SCAN_BEISPIELE[0].zeilen);
  const [kontext, setKontext] = useState(SCAN_BEISPIELE[0].kontext);
  const [lesung, setLesung] = useState(null);        // { zeilen, zeilenStatus, lesbarkeit, durchgestrichen, mehrereWege, mathildaFehler, scanId }
  const [hyp, setHyp] = useState(null);              // KI-Hypothesen (validiert)
  const [gespeichert, setGespeichert] = useState(null);
  const [fehler, setFehler] = useState("");
  const [laedt, setLaedt] = useState(false);
  const [wahlTyp, setWahlTyp] = useState("vorzeichen");
  const [wahlUnter, setWahlUnter] = useState("allgemein");

  const auswerten = (l) => { setLesung(l); setHyp(null); setGespeichert(null); setFehler(""); };
  const ausText = () => {
    const z = zeilenAusText(text);
    if (z.zeilen.length < 2) { setFehler("Gib mindestens zwei Rechenzeilen ein – eine pro Zeile."); return; }
    auswerten({ ...z, lesbarkeit: 9, durchgestrichen: [], mehrereWege: false, mathildaFehler: null });
  };

  const diag = lesung ? scanDiagnose({ ...lesung, kontext, kiHypothesen: hyp }) : null;
  const sp = (extra) => {
    const e = { ...(extra.typ ? { ...diag.entwurf, ...extra } : diag.vorschlag), ...(extra.status ? { status: extra.status } : null), nutzerId };
    if (extra.konfidenz != null) e.konfidenz = extra.konfidenz;
    const r = perfAendern((Pm) => meldeFehler(Pm, e));
    setGespeichert(r.ereignis ? { id: r.ereignis.id, neu: r.neu } : { fehler: r.grund });
  };

  const kiHypothese = async () => {
    if (!diag?.pruefung || diag.pruefung.status !== "falsch") return;
    setLaedt(true); setFehler("");
    try {
      const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 600, messages: [{ role: "user", content: diagnosePrompt(diag.pruefung.vorher, diag.pruefung.nachher, kontextName(kontext)) }] }) });
      const daten = await kiAntwort(res);
      if (daten.error) throw new Error(daten.error.message);
      const roh = jsonLesen((daten.content || []).map((t) => (t.type === "text" ? t.text : "")).join(""));
      const h = validiereDiagnose(roh);
      if (!h.length) setFehler("Mathilda konnte keine passende Ursache aus der Liste nennen. Wähle den Fehlertyp selbst.");
      setHyp(h);
    } catch (e) { setFehler(e.message || "Die KI ist gerade nicht erreichbar. Du kannst den Fehlertyp selbst wählen."); }
    finally { setLaedt(false); }
  };

  return (
    <div>
      <div role="tablist" aria-label="Eingabeart" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {MODI.map(([id, n]) => (
          <button key={id} role="tab" aria-selected={modus === id} onClick={() => { setModus(id); setLesung(null); setFehler(""); }}
            style={{ fontFamily: "inherit", cursor: "pointer", minHeight: 40, padding: "0 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 700,
              background: modus === id ? L.tuerkis : "transparent", color: modus === id ? L.bg : L.tuerkis, border: `1px solid ${L.tuerkis}` }}>{n}</button>
        ))}
      </div>

      <Karte style={{ marginBottom: 14 }}>
        {modus === "text" ? (
          <>
            <p style={{ ...labelStil, marginBottom: 8 }}>Beispiele laden</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {SCAN_BEISPIELE.map((b) => (
                <button key={b.id} type="button" onClick={() => { setText(b.zeilen); setKontext(b.kontext); setLesung(null); setGespeichert(null); }}
                  style={{ fontFamily: "inherit", cursor: "pointer", minHeight: 36, padding: "0 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: L.ged, background: "rgba(255,255,255,0.06)", border: `1px solid ${L.linie}` }}>{b.name}</button>
              ))}
            </div>
            <label htmlFor="perf-scan-text" style={labelStil}>Rechenweg – eine Zeile pro Schritt (ein „?“ am Anfang markiert eine unleserliche Zeile)</label>
            <textarea id="perf-scan-text" value={text} onChange={(e) => setText(e.target.value)} rows={5} spellCheck={false} className="perf-feld"
              style={{ ...selektStil, fontSize: 16, lineHeight: 1.6, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} />
          </>
        ) : (
          <FotoLesen onLesung={auswerten} onFehler={setFehler} laedt={laedt} setLaedt={setLaedt} />
        )}
        <div style={{ marginTop: 14 }}>
          <label htmlFor="perf-scan-kontext" style={labelStil}>Mathematischer Kontext (trennt Fehlertyp von Umfeld)</label>
          <select id="perf-scan-kontext" value={kontext} onChange={(e) => { setKontext(e.target.value); setGespeichert(null); }} style={selektStil}>
            {Object.entries(KONTEXTE).map(([id, k]) => <option key={id} value={id}>{k.name}</option>)}
          </select>
        </div>
        {modus === "text" && <div style={{ marginTop: 14 }}><Knopf onClick={ausText}>Rechenweg prüfen</Knopf></div>}
        {fehler && <p role="alert" style={{ margin: "12px 0 0", color: L.orange, fontSize: 14, lineHeight: 1.6 }}>{fehler}</p>}
      </Karte>

      {diag && (
        <Karte hoch className="perf-rein">
          <Kicker farbe={L.violett}>Auswertung</Kicker>

          <p style={{ ...labelStil, color: L.tuerkis }}>1 · Beobachtung – was steht da?</p>
          <div style={{ marginBottom: 14 }}>
            {lesung.zeilen.map((z, i) => {
              const unklar = lesung.zeilenStatus[i] === "unklar";
              const fehlerZeile = diag.pruefung.index === i;
              return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 10px", borderRadius: 10, marginBottom: 4, background: fehlerZeile ? `${L.rot}1f` : "rgba(255,255,255,0.04)", border: `1px solid ${fehlerZeile ? `${L.rot}77` : "transparent"}`, overflowX: "auto" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: L.still, width: 18, flexShrink: 0 }}>{i + 1}</span>
                  <Formel t={z} />
                  {unklar && <Chip farbe={L.orange}>unleserlich</Chip>}
                  {fehlerZeile && <Chip farbe={L.rot} voll>Fehlerstelle</Chip>}
                </div>
              );
            })}
            {lesung.durchgestrichen?.length > 0 && <p style={{ margin: "8px 0 0", fontSize: 13, color: L.still }}>Durchgestrichen und nicht geprüft: {lesung.durchgestrichen.join(" · ")}</p>}
            {lesung.mehrereWege && <p style={{ margin: "8px 0 0", fontSize: 13, color: L.orange }}>Auf dem Blatt stehen mehrere Lösungswege. Geprüft wird nur der erste vollständige.</p>}
            <p style={{ margin: "8px 0 0", fontSize: 12.5, color: L.still }}>Lesbarkeit: {lesung.lesbarkeit}/10{lesung.lesbarkeit < 5 ? " – zu schwer lesbar, Ergebnisse bleiben „unsicher“" : ""}</p>
          </div>

          <p style={{ ...labelStil, color: L.tuerkis }}>2 · Mathematische Prüfung – welcher Schritt ist nachweislich falsch?</p>
          <p style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.65, color: L.text }}>
            {diag.pruefung.status === "falsch" ? <>{diag.pruefung.text} <span style={{ color: L.ged }}>Folgezeilen werden nicht als weitere Fehler gezählt – nur der früheste falsche Schritt zählt.</span></> : diag.hinweis}
            {diag.pruefung.uebereinstimmung === false && <span style={{ color: L.orange }}> Mathilda hatte eine andere Zeile gemeldet; gespeichert wird nur, was die Prüfung belegt.</span>}
            {diag.pruefung.unklar?.length > 0 && <span style={{ color: L.orange }}> Unleserliche Zeile{diag.pruefung.unklar.length > 1 ? "n" : ""} ({diag.pruefung.unklar.map((i) => i + 1).join(", ")}) {diag.pruefung.unklar.length > 1 ? "wurden" : "wurde"} übersprungen und zur manuellen Klärung markiert.</span>}
          </p>

          {diag.pruefung.status === "falsch" && (
            <>
              <p style={{ ...labelStil, color: L.tuerkis }}>3 · Ursachenhypothese und Konfidenz</p>
              {diag.hypothesen.length > 0 ? diag.hypothesen.map((h, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14, color: L.text, fontWeight: 600 }}>
                    <span>{typName(h.typ)}{h.untertyp !== "allgemein" ? ` · ${untertypName(h.typ, h.untertyp)}` : ""} <span style={{ color: L.still, fontWeight: 500, fontSize: 12 }}>({h.quelle === "ki" ? "Mathilda" : "Regel"})</span></span>
                    <span style={{ color: h.konfidenz >= 0.75 ? L.gruen : L.orange }}>{prozent(h.konfidenz)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)", margin: "6px 0" }}><div style={{ width: prozent(h.konfidenz), height: "100%", borderRadius: 999, background: h.konfidenz >= 0.75 ? L.gruen : L.orange }} /></div>
                  <p style={{ margin: 0, fontSize: 13, color: L.ged, lineHeight: 1.55 }}>{h.grund}</p>
                </div>
              )) : <p style={{ margin: "0 0 12px", fontSize: 14, color: L.ged, lineHeight: 1.65 }}>{diag.hinweis}</p>}

              {!gespeichert && (
                <div style={{ marginTop: 6 }}>
                  {diag.vorschlag ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Knopf onClick={() => sp({})}>Speichern</Knopf>
                      <Knopf art="violett" onClick={() => sp({ status: "bestaetigt" })}>Ja, das ist mein Fehler – bestätigen</Knopf>
                    </div>
                  ) : null}
                  {!diag.vorschlag && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      <Knopf art="geist" disabled={laedt} onClick={kiHypothese}>{laedt ? "Mathilda überlegt …" : "Mathilda nach einer Hypothese fragen"}</Knopf>
                    </div>
                  )}
                  <details style={{ marginTop: 12 }}>
                    <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: L.tuerkis, minHeight: 32 }}>Fehlertyp selbst wählen</summary>
                    <div className="perf-raster" style={{ marginTop: 10 }}>
                      <div>
                        <label htmlFor="perf-wahl-typ" style={labelStil}>Fehlertyp</label>
                        <select id="perf-wahl-typ" value={wahlTyp} onChange={(e) => { setWahlTyp(e.target.value); setWahlUnter("allgemein"); }} style={selektStil}>
                          {Object.entries(HAUPTKATEGORIEN).map(([h, hn]) => (
                            <optgroup key={h} label={hn.name}>{Object.entries(FEHLERTYPEN_TAX).filter(([, t]) => t.haupt === h).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}</optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="perf-wahl-unter" style={labelStil}>Untertyp</label>
                        <select id="perf-wahl-unter" value={wahlUnter} onChange={(e) => setWahlUnter(e.target.value)} style={selektStil}>
                          {Object.entries(FEHLERTYPEN_TAX[wahlTyp].untertypen).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}><Knopf klein onClick={() => sp({ typ: wahlTyp, untertyp: wahlUnter, konfidenz: 1, status: "bestaetigt" })}>Mit diesem Typ als bestätigt speichern</Knopf></div>
                  </details>
                </div>
              )}
            </>
          )}
          {gespeichert && (gespeichert.fehler
            ? <p role="alert" style={{ color: L.orange, fontSize: 14 }}>{gespeichert.fehler}</p>
            : <>
              {!gespeichert.neu && <p role="status" style={{ margin: "10px 0 0", color: L.ged, fontSize: 13.5 }}>Dieser Scan war schon gespeichert – doppelte Meldung ignoriert, nichts wurde doppelt gezählt.</p>}
              <Einordnung nutzerId={nutzerId} ereignisId={gespeichert.id} onAnalyse={onAnalyse} />
            </>)}
        </Karte>
      )}
    </div>
  );
}

/* Foto → strukturierte Lesung (Transkription, kein Urteil). Wiederverwendet Kamera, Dekodierung und Einwilligung der App. */
const LESE_PROMPT = `Auf dem Foto steht ein handschriftlicher Rechenweg zu einer Mathematikaufgabe.
Schreibe GENAU ab, was dasteht. Nichts ergänzen, nichts korrigieren, keine Rechenfehler beheben.

Antworte AUSSCHLIESSLICH mit JSON, ohne Markdown:
{"zeilen":["…"],"zeilenStatus":["ok"],"lesbarkeit":0,"durchgestrichen":["…"],"mehrereWege":false,"mathildaFehler":null}

Regeln:
- zeilen: jede geschriebene Rechenzeile von oben nach unten in Maschinenschreibweise (^ für Potenzen, * für Mal, / für Brüche, Klammern, x als Variable, Gleichungen mit =).
- Durchgestrichenes gehört NICHT in zeilen, sondern in durchgestrichen.
- Randnotizen, Pfeile und Text (z. B. "also") gehören nicht in zeilen.
- zeilenStatus: pro Zeile "ok" oder "unklar". "unklar" setzt du, wenn Zeichen mehrdeutig sind (1 oder 7, + oder −, x oder ×, 4 oder 9). Schreibe in zeilen trotzdem deine beste Lesart.
- Stehen mehrere Lösungswege auf dem Blatt: mehrereWege auf true und nur den ersten vollständigen Weg in zeilen.
- lesbarkeit: 0 = unlesbar, 10 = gestochen klar.
- mathildaFehler: nur wenn du sicher einen falschen Übergang siehst: {"zeile": Nummer ab 1 der ersten fehlerhaften Zeile, "was": "kurz", "richtig": "richtige Zeile"}. Sonst null.`;

function FotoLesen({ onLesung, onFehler, laedt, setLaedt }) {
  const [erlaubt, setErlaubt] = useState(() => !!einwilligungLesen());
  const [b64, setB64] = useState(null);
  const [vorschau, setVorschau] = useState(null);
  const kamera = useRef(null), galerie = useRef(null);

  if (!erlaubt) return <div style={{ background: "#fff", borderRadius: 18, margin: "-6px" }}><Einwilligung onJa={() => setErlaubt(true)} /></div>;

  const waehlen = async (file) => {
    if (!file) return;
    onFehler("");
    try { const src = await dekodieren(file, () => {}); const r = rendern(src, 0); setB64(r.b64); setVorschau(r.vorschau); }
    catch (e) { onFehler(e.message); }
  };
  const lesen = async () => {
    if (!b64) return;
    setLaedt(true); onFehler("");
    try {
      const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 1200, messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } }, { type: "text", text: LESE_PROMPT }] }] }) });
      const daten = await kiAntwort(res);
      if (daten.error) throw new Error(`Die API hat abgelehnt: ${daten.error.message}`);
      const roh = jsonLesen((daten.content || []).map((t) => (t.type === "text" ? t.text : "")).join(""));
      const v = validiereScanLesung(roh);
      if (!v.ok) { onFehler(v.grund); return; }
      /* Dasselbe Foto ergibt dieselbe Scan-ID – ein erneutes Auswerten erzeugt kein zweites Ereignis */
      onLesung({ ...v.lesung, scanId: hashId(b64.length, b64.slice(0, 3000), b64.slice(-1500)) });
    } catch (e) { onFehler(e.message || "Das Blatt konnte nicht gelesen werden."); }
    finally { setLaedt(false); }
  };
  return (
    <div>
      <p style={{ ...labelStil, marginBottom: 8 }}>Foto vom Rechenweg</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <Knopf art="sekundaer" klein onClick={() => kamera.current && kamera.current.click()}>Kamera öffnen</Knopf>
        <Knopf art="sekundaer" klein onClick={() => galerie.current && galerie.current.click()}>Aus Galerie wählen</Knopf>
      </div>
      <input ref={kamera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { waehlen(e.target.files[0]); e.target.value = ""; }} />
      <input ref={galerie} type="file" accept="image/*" hidden onChange={(e) => { waehlen(e.target.files[0]); e.target.value = ""; }} />
      {vorschau && <img src={vorschau} alt="Vorschau des Rechenwegs" style={{ maxWidth: "100%", maxHeight: 280, borderRadius: 12, border: `1px solid ${L.linie}`, display: "block", marginBottom: 12 }} />}
      <Knopf disabled={!b64 || laedt} onClick={lesen}>{laedt ? "Mathilda liest …" : "Blatt auswerten"}</Knopf>
      <p style={{ margin: "10px 0 0", fontSize: 12.5, color: L.still, lineHeight: 1.6 }}>Das Foto wird nur zur Auswertung gesendet und hier nicht gespeichert. Gespeichert werden nur die erkannten Zeilen und das Ergebnis. Unleserliches wird nie als Fehler gewertet.</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Digitale Übung */
function DigitalTest({ nutzerId, onAnalyse }) {
  const durchlauf = useRef(String(Date.now()));
  const [i, setI] = useState(0);
  const [eingabe, setEingabe] = useState("");
  const [ergebnis, setErgebnis] = useState(null);
  const a = AUFGABEN_VORZEICHEN[(i * 5) % AUFGABEN_VORZEICHEN.length];

  const abgeben = () => {
    const b = bewerte(a, eingabe);
    const aufgabeId = `uebung:${a.id}:${durchlauf.current}`;
    let hinweis, ereignisId = null, neu = null;
    if (!b.zaehlt) hinweis = { farbe: L.ged, text: "Eingabefehler, kein Rechenfehler: Das wird nicht gespeichert. Gib die Antwort bitte als Term ein." };
    else if (b.art === "richtig") {
      perfAendern((Pm) => meldeAufgabe(Pm, { nutzerId, id: aufgabeId, testet: ["vorzeichen"], kontext: a.kontext, schwierigkeit: a.schwierigkeit, ok: true }));
      hinweis = { farbe: L.gruen, text: "Richtig. Die Aufgabe zählt als vergleichbarer Versuch ohne Fehler (Nenner für die Fehlerquote)." };
    } else if (b.art === "form") hinweis = { farbe: L.ged, text: `${b.text} Das ist kein Vorzeichenfehler und wird nicht gespeichert.` };
    else if (b.art === "typisch" || b.art === "vorzeichen") {
      /* typisch: belegte Fehlantwort (sicher). vorzeichen: gleiche Beträge, nur Vorzeichen anders – plausibel, aber nicht so sicher. */
      const sicher = b.art === "typisch";
      const r = perfAendern((Pm) => {
        meldeAufgabe(Pm, { nutzerId, id: aufgabeId, testet: ["vorzeichen"], kontext: a.kontext, schwierigkeit: a.schwierigkeit, ok: false, fehlerTyp: "vorzeichen" });
        return meldeFehler(Pm, {
          nutzerId, quelle: "digital", schritt: eingabe.trim(), korrekt: a.korrekt, stelle: sicher ? a.fehlerStelle : "", typ: "vorzeichen", untertyp: a.untertyp,
          eingabeStatus: "gueltig", typSicher: true, konfidenz: sicher ? 0.9 : 0.7,
          beobachtung: `Antwort „${eingabe.trim()}“ auf ${a.start}`, pruefung: sicher ? "Entspricht der typischen Fehlantwort dieser Aufgabe (exakt geprüft)." : "Gleiche Beträge wie die richtige Lösung, nur Vorzeichen anders (exakt geprüft).",
          aufgabe: { id: aufgabeId, text: a.start, kontext: a.kontext, schwierigkeit: a.schwierigkeit }, ursprung: { art: "aufgabe", ref: aufgabeId },
        });
      });
      neu = r.neu; ereignisId = r.ereignis && r.ereignis.id;
      hinweis = { farbe: L.orange, text: b.text };
    } else {
      perfAendern((Pm) => meldeAufgabe(Pm, { nutzerId, id: aufgabeId, testet: ["vorzeichen"], kontext: a.kontext, schwierigkeit: a.schwierigkeit, ok: false }));
      hinweis = { farbe: L.orange, text: `${b.text} Der Fehlertyp ist hier nicht belegt, deshalb wird keine Fehlerart gespeichert – die Aufgabe zählt aber als nicht gelöst.` };
    }
    setErgebnis({ ...hinweis, ereignisId, neu });
  };

  return (
    <div>
      <Karte>
        <Kicker farbe={L.blau}>Kanal A · digitale Übung</Kicker>
        <p style={{ margin: "0 0 10px", fontSize: 14, color: L.ged, lineHeight: 1.65 }}>So melden Übungstools an das Fehlergedächtnis: nur gültige Eingaben, nur belegte Fehlertypen, nur nachweislich falsche Antworten. In der App tun das auch „Meine Fehler üben“ und der Prüfungsmodus.</p>
        <p style={{ margin: "0 0 8px", fontSize: 15, color: L.text }}><MText s={a.auftrag} /></p>
        <div style={{ padding: "14px", borderRadius: 14, background: L.bg, border: `1px solid ${L.linie}`, marginBottom: 14, overflowX: "auto" }}><Formel t={a.start} gross /></div>
        <Formeleingabe wert={eingabe} setWert={(t) => { setEingabe(t); setErgebnis(null); }} onEnter={() => eingabe.trim() && abgeben()} label={a.art === "gleichung" ? "Deine umgeformte Gleichung" : a.art === "ableitung" ? "Deine Ableitung" : "Dein Term"} />
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Knopf disabled={!eingabe.trim() || (ergebnis && ergebnis.neu !== undefined && ergebnis.farbe === L.gruen)} onClick={abgeben}>Abgeben</Knopf>
          <Knopf art="sekundaer" onClick={() => { setI(i + 1); setEingabe(""); setErgebnis(null); }}>Andere Aufgabe</Knopf>
        </div>
        {ergebnis && (
          <div role="status" className="perf-rein" style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `${ergebnis.farbe}18`, border: `1px solid ${ergebnis.farbe}66`, fontSize: 14, lineHeight: 1.65, color: L.text }}>
            <MText s={ergebnis.text} />
            {ergebnis.ereignisId && <Einordnung nutzerId={nutzerId} ereignisId={ergebnis.ereignisId} onAnalyse={onAnalyse} />}
            {ergebnis.neu === false && <p style={{ margin: "8px 0 0", color: L.ged, fontSize: 13 }}>Dieselbe Meldung war schon gespeichert und wurde nicht doppelt gezählt.</p>}
          </div>
        )}
      </Karte>
    </div>
  );
}

/* ---------------------------------------------------------------- Selbst melden */
function ManuellMelden({ nutzerId, onAnalyse }) {
  const [typ, setTyp] = useState("vorzeichen");
  const [unter, setUnter] = useState("allgemein");
  const [kontext, setKontext] = useState("klammern");
  const [schritt, setSchritt] = useState("");
  const [korrekt, setKorrekt] = useState("");
  const [ergebnis, setErgebnis] = useState(null);
  const speichern = () => {
    if (!schritt.trim()) { setErgebnis({ fehler: "Schreib den fehlerhaften Rechenschritt auf – ohne ihn gibt es nichts zu speichern." }); return; }
    const r = perfAendern((Pm) => meldeFehler(Pm, { nutzerId, quelle: "manuell", schritt: schritt.trim(), korrekt: korrekt.trim(), typ, untertyp: unter,
      aufgabe: { id: `manuell:${hashId(schritt, Date.now())}`, text: "", kontext, schwierigkeit: 2 }, ursprung: { art: "manuell", ref: `manuell:${hashId(schritt, korrekt, Date.now())}` },
      beobachtung: `Selbst gemeldet: ${schritt.trim()}`, pruefung: "Von dir gemeldet und bestätigt – nicht automatisch geprüft." }));
    setErgebnis(r.abgelehnt ? { fehler: r.grund } : { id: r.ereignis.id }); setSchritt(""); setKorrekt("");
  };
  return (
    <Karte>
      <Kicker farbe={L.violett}>Selbst melden</Kicker>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: L.ged, lineHeight: 1.65 }}>Du hast selbst bemerkt, dass dir ein Fehler passiert ist, zum Beispiel in einer Klausur? Trage ihn hier ein. Von dir gemeldete Fehler zählen als bestätigt.</p>
      <div className="perf-raster">
        <div>
          <label htmlFor="perf-m-typ" style={labelStil}>Fehlertyp</label>
          <select id="perf-m-typ" value={typ} onChange={(e) => { setTyp(e.target.value); setUnter("allgemein"); }} style={selektStil}>
            {Object.entries(HAUPTKATEGORIEN).map(([h, hn]) => <optgroup key={h} label={hn.name}>{Object.entries(FEHLERTYPEN_TAX).filter(([, t]) => t.haupt === h).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}</optgroup>)}
          </select>
        </div>
        <div>
          <label htmlFor="perf-m-unter" style={labelStil}>Untertyp</label>
          <select id="perf-m-unter" value={unter} onChange={(e) => setUnter(e.target.value)} style={selektStil}>{Object.entries(FEHLERTYPEN_TAX[typ].untertypen).map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select>
        </div>
        <div>
          <label htmlFor="perf-m-kontext" style={labelStil}>Mathematischer Kontext</label>
          <select id="perf-m-kontext" value={kontext} onChange={(e) => setKontext(e.target.value)} style={selektStil}>{Object.entries(KONTEXTE).map(([id, k]) => <option key={id} value={id}>{k.name}</option>)}</select>
        </div>
      </div>
      <div style={{ marginTop: 14 }}><Formeleingabe wert={schritt} setWert={setSchritt} label="Fehlerhafter Rechenschritt" placeholder="z. B. 3x - 2x - 5" /></div>
      <div style={{ marginTop: 14 }}><Formeleingabe wert={korrekt} setWert={setKorrekt} label="So wäre es richtig (optional)" placeholder="z. B. 3x - 2x + 5" vorschau={false} /></div>
      <div style={{ marginTop: 14 }}><Knopf art="violett" onClick={speichern}>Fehler speichern</Knopf></div>
      {ergebnis?.fehler && <p role="alert" style={{ margin: "12px 0 0", color: L.orange, fontSize: 14 }}>{ergebnis.fehler}</p>}
      {ergebnis?.id && <Einordnung nutzerId={nutzerId} ereignisId={ergebnis.id} onAnalyse={onAnalyse} />}
    </Karte>
  );
}

/* ---------------------------------------------------------------- Daten */
function DatenVerwaltung({ nutzerId }) {
  const { P } = usePerf();
  const [sicher, setSicher] = useState(false);
  const [info, setInfo] = useState("");
  const meine = P.ereignisse.filter((e) => e.nutzerId === nutzerId);
  const demo = meine.filter((e) => e.demo).length + P.aufgaben.filter((x) => x.nutzerId === nutzerId && x.demo).length;
  const zaehl = (q) => meine.filter((e) => e.quelle === q).length;

  const exportieren = () => {
    try {
      const blob = new Blob([JSON.stringify(exportiere(P, nutzerId), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `performance-lab-${datum(Date.now()).replace(/\./g, "-")}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setInfo("Der Export ist in diesem Browser nicht möglich."); }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Karte>
        <Kicker>Testdaten</Kicker>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: L.ged, lineHeight: 1.65 }}>Lädt ein kleines Szenario: ein Muster aus beiden Kanälen, ein zweites getrenntes Muster, eine einzelne Beobachtung, einen unsicheren Scan und 16 vergleichbare Aufgaben. Alles läuft durch dieselbe Aufnahme wie echte Daten und ist als Testdaten markiert.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Knopf onClick={() => { const n = perfAendern((Pm) => ladeTestdaten(Pm, nutzerId)); setInfo(n ? `${n} Testereignisse geladen.` : "Die Testdaten sind schon geladen."); }}>Testdaten laden</Knopf>
          <Knopf art="geist" disabled={!demo} onClick={() => { perfAendern((Pm) => loescheTestdaten(Pm, nutzerId)); setInfo("Testdaten entfernt."); }}>Nur Testdaten löschen</Knopf>
        </div>
        {info && <p role="status" style={{ margin: "12px 0 0", color: L.tuerkis, fontSize: 14 }}>{info}</p>}
      </Karte>
      <Karte>
        <Kicker farbe={L.violett}>Deine Daten</Kicker>
        <p style={{ margin: "0 0 10px", fontSize: 14, color: L.text, lineHeight: 1.7 }}>
          {meine.length} Fehlerereignisse ({zaehl("digital")} digital, {zaehl("scan")} Scan, {zaehl("manuell")} manuell) · {P.aufgaben.filter((x) => x.nutzerId === nutzerId).length} erfasste Aufgaben · {P.runden.filter((r) => r.nutzerId === nutzerId).length} Trainingsrunden · {P.badges.filter((b) => b.nutzerId === nutzerId).length} Badges
        </p>
        <ul style={{ margin: "0 0 14px", paddingLeft: 18, fontSize: 13.5, color: L.ged, lineHeight: 1.75 }}>
          <li>Alles liegt nur auf diesem Gerät, verknüpft mit deinem Konto. Andere Konten auf demselben Gerät sehen deine Daten nicht.</li>
          <li>Fotos werden nicht gespeichert. Gespeichert werden nur strukturierte Ergebnisse: erkannte Zeilen, Prüfung, Fehlertyp, Sicherheit.</li>
          <li>Jede Zuordnung zeigt ihre Quelle und ihren Grund. Du kannst alles korrigieren, verwerfen oder löschen.</li>
        </ul>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Knopf art="sekundaer" onClick={exportieren}>Meine Daten exportieren (JSON)</Knopf>
          {!sicher ? <Knopf art="gefahr" onClick={() => setSicher(true)}>Alle meine Lab-Daten löschen</Knopf>
            : <Knopf art="gefahr" onClick={() => { perfAendern((Pm) => loescheNutzerdaten(Pm, nutzerId)); setSicher(false); setInfo("Alle deine Lab-Daten wurden gelöscht."); }}>Wirklich löschen – nicht rückgängig</Knopf>}
        </div>
      </Karte>
    </div>
  );
}
