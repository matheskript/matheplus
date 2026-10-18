/* ============================================================
   Mathilda übersetzt Textaufgaben  (/textaufgaben/mathilda)
   Foto (Live-Kamera im A4-Rahmen, Kamera-App, Galerie) oder getippter Text →
   Mathilda schreibt ab, nennt Gesuchtes und Ansatz und übersetzt jede
   Information in Bedingungen – mit Begründung und typischer Falle.
   · „Erst selbst versuchen“ (Standard): Übersetzungen bleiben verdeckt, bis der
     Schüler es versucht hat; getippte Versuche prüft die App selbst
     (bedingungen.js), ohne neue KI-Anfrage.
   · „Gleich alles zeigen“: alle Übersetzungen sofort.
   · Abschrift bestätigen oder korrigieren (dann Neu-Übersetzung aus Text),
     „Mathilda dazu fragen“ öffnet den Tutor-Chat mit der Aufgabe als Kontext.
   Logik: textMathilda.js. Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_URL, C } from "./base1.jsx";
import { LERN } from "./base3.jsx";
import { kiAntwort, kiEinwilligungDa, kiKopf } from "./base4.jsx";
import { M } from "./func3.jsx";
import { dekodieren, jsonLesen, rendern } from "./func1.jsx";
import { BlattScanner } from "./funcBlattScanner.jsx";
import { MathildaIcon } from "./funcMathildaSeite.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { kameraWunschHolen } from "./kameraWunsch.js";
import { MathildaChatModal } from "./funcMathildaChat.jsx";
import { useKonto } from "./konto.js";
import { mathildaSystem } from "./mathildaKontext.js";
import { englisch } from "./i18n.js";
import { GrosserKnopf, MS, Rueck, karte, kicker, zw } from "./ui2.jsx";
import { pruefeEingabe, lies } from "./bedingungen.js";
import { springe } from "./sprung.js";
import {
  BEISPIEL_TEXT, BEISPIEL_TEXT_EN, UEBERSETZEN_REGELN, ZAEHLER_SCHLUESSEL, chatKontext, funktionsnamen, markierungen, nichtGefunden,
  uebersetzenPrompt, uebersetzungLesen, werkzeugFuerThema,
} from "./textMathilda.js";

const GOLD = C.flaggold, NACHT = C.seeTief, GRUEN = "#0F7A4D";
const LETZTE = "matheplus-text-letzte";
const MODUS = "matheplus-text-modus";
const NR = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫"];
const nr = (i) => NR[i] || `(${i + 1})`;
const lsLesen = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSchreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };

/* Text mit $…$: ungerade Anzahl $ (abgeschnittene Formel) → ohne Formelsatz anzeigen */
const Sicher = ({ s }) => ((String(s).match(/\$/g) || []).length % 2 ? <>{String(s).replace(/\$/g, "")}</> : <MS s={s} />);

/* ---------- Kopf ---------- */
function Kopf() {
  return (
    <div style={{ marginTop: 16, borderRadius: 20, padding: "18px 18px 16px", color: C.weiss, position: "relative", overflow: "hidden",
      background: `radial-gradient(120% 120% at 100% 0%, #1D4790 0%, ${C.see} 38%, ${NACHT} 100%)`, boxShadow: "0 14px 36px rgba(14,30,74,0.28)" }} data-mathilda-kopf>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <MathildaIcon groesse={64} hintergrund="rgba(255,255,255,0.08)" />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.weiss }}><MathildaName dunkel /> <span style={{ color: "#C9D6EE", fontWeight: 600 }}>· {zw("Übersetzerin", "Translator")}</span></p>
          <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{zw("Foto rein – Bedingungen raus.", "Photo in – conditions out.")}</p>
        </div>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: "#C9D6EE" }}>
        {zw("Fotografiere jede Textaufgabe – aus dem Buch, vom Arbeitsblatt, aus dem Abi. Mathilda zeigt dir, was jede Stelle mathematisch bedeutet und warum. Rechnen tust du selbst.", "Photograph any word problem – from your book, a worksheet, the Abitur. Mathilda shows what every phrase means mathematically and why. You do the calculating.")}
      </p>
    </div>
  );
}

/* ---------- Eingabe: Foto oder Text ---------- */
function Eingabe({ onStart, laeuft, modus, setModus, letzte, onLetzte }) {
  const [scan, setScan] = useState(false);
  const [art, setArt] = useState("foto");
  const [quelle, setQuelle] = useState(null);
  const [bild, setBild] = useState(null);   // { b64, vorschau }
  const [drehung, setDrehung] = useState(0);
  const [text, setText] = useState("");
  const [teil, setTeil] = useState("");
  const [fehler, setFehler] = useState("");
  const [lade, setLade] = useState(false);
  const kameraRef = useRef(null), galerieRef = useRef(null);
  /* Kam der Schüler über den Kamera-Knopf der Textaufgaben-Box, geht die Kamera sofort auf */
  useEffect(() => { if (kameraWunschHolen("text")) { setArt("foto"); setScan(true); } }, []);
  const datei = async (f) => {
    if (!f) return;
    setFehler(""); setLade(true); setScan(false);
    try {
      const src = await dekodieren(f, () => {});
      setQuelle(src); setDrehung(0);
      const r = rendern(src, 0);
      setBild({ b64: r.b64, vorschau: r.vorschau }); setArt("foto");
    } catch (e) { setFehler(e.message || zw("Das Foto ließ sich nicht öffnen.", "The photo could not be opened.")); }
    finally { setLade(false); }
  };
  const drehen = () => { if (!quelle) return; const d = (drehung + 90) % 360; setDrehung(d); const r = rendern(quelle, d); setBild({ b64: r.b64, vorschau: r.vorschau }); };
  const bereit = art === "foto" ? !!bild : text.trim().length >= 10;
  const start = () => onStart(art === "foto" ? { b64: bild.b64, teil } : { text: text.trim(), teil });
  return (
    <div style={{ ...karte, marginTop: 14 }} data-mathilda-eingabe>
      <div role="tablist" aria-label={zw("Woher kommt die Aufgabe?", "Where is the task from?")} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {[["foto", zw("Foto", "Photo")], ["text", zw("Text eintippen", "Type the text")]].map(([id, t]) => (
          <button key={id} type="button" role="tab" aria-selected={art === id} onClick={() => setArt(id)} data-art={id}
            style={{ minHeight: 42, borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${art === id ? C.see : C.linie}`, background: art === id ? C.see : C.weiss, color: art === id ? C.weiss : C.see }}>{t}</button>
        ))}
      </div>
      {art === "foto" && (
        <>
          {!bild && (
            <div style={{ display: "grid", gap: 8 }}>
              <button type="button" onClick={() => setScan(true)} data-scan
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 800, color: NACHT,
                  background: `linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%)`, boxShadow: "0 8px 22px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.55)" }}>
                <span style={{ width: 38, height: 38, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
                </span>
                {zw("Aufgabe fotografieren", "Photograph the task")}
              </button>
              <button type="button" onClick={() => galerieRef.current?.click()} style={{ height: 46, borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
                {zw("Foto aus der Galerie", "Photo from gallery")}
              </button>
              {lade && <p style={{ fontSize: 13, color: C.grau, margin: 0 }}>{zw("Foto wird vorbereitet …", "Preparing the photo …")}</p>}
            </div>
          )}
          {bild && (
            <div>
              <div style={{ position: "relative", background: C.sand, borderRadius: 14, padding: 8 }}>
                <img src={bild.vorschau} alt={zw("Dein Foto", "Your photo")} style={{ display: "block", width: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 10 }} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={drehen} style={kleinKnopf}>{zw("Drehen ↻", "Rotate ↻")}</button>
                <button type="button" onClick={() => { setBild(null); setQuelle(null); }} style={kleinKnopf}>{zw("Anderes Foto", "Other photo")}</button>
              </div>
            </div>
          )}
          <input ref={galerieRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => datei(e.target.files && e.target.files[0])} data-galerie />
          <input ref={kameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => datei(e.target.files && e.target.files[0])} />
        </>
      )}
      {art === "text" && (
        <div>
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 4000))} rows={6} data-aufgabentext
            aria-label={zw("Text der Aufgabe", "Text of the task")} placeholder={zw("Tippe oder füge die Textaufgabe hier ein …", "Type or paste the word problem here …")}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, lineHeight: 1.6, color: C.tinte, resize: "vertical", outline: "none" }} />
          <button type="button" onClick={() => setText(englisch() ? BEISPIEL_TEXT_EN : BEISPIEL_TEXT)} style={{ ...kleinKnopf, marginTop: 6 }} data-beispiel-text>{zw("Beispiel einsetzen", "Insert example")}</button>
        </div>
      )}
      <label style={{ display: "block", marginTop: 12 }}>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 4 }}>{zw("Welche Teilaufgabe? (optional)", "Which part? (optional)")}</span>
        <input value={teil} onChange={(e) => setTeil(e.target.value.slice(0, 60))} placeholder={zw("z. B. 3b", "e.g. 3b")}
          style={{ width: "100%", boxSizing: "border-box", height: 42, padding: "0 12px", borderRadius: 11, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, color: C.tinte, outline: "none" }} />
      </label>
      <p style={{ ...kicker, marginTop: 14, marginBottom: 6 }}>{zw("Wie willst du arbeiten?", "How do you want to work?")}</p>
      <div role="radiogroup" aria-label={zw("Arbeitsweise", "Mode")} style={{ display: "grid", gap: 6 }}>
        {[["selbst", zw("Erst selbst versuchen", "Try it myself first"), zw("Mathilda markiert die Stellen, du übersetzt – dann vergleichst du.", "Mathilda marks the phrases, you translate – then compare.")],
          ["zeigen", zw("Gleich alles zeigen", "Show everything now"), zw("Alle Übersetzungen mit Begründung sofort.", "All translations with reasons right away.")]].map(([id, t, s]) => (
          <button key={id} type="button" role="radio" aria-checked={modus === id} onClick={() => setModus(id)} data-modus={id}
            style={{ textAlign: "left", padding: "9px 12px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", border: `1.5px solid ${modus === id ? C.see : C.linie}`, background: modus === id ? C.himmel : C.weiss }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.tinte }}>{t}{id === "selbst" ? <span style={{ fontSize: 11, color: GRUEN, marginLeft: 6 }}>{zw("empfohlen", "recommended")}</span> : null}</span>
            <span style={{ display: "block", fontSize: 12.5, color: C.grau, lineHeight: 1.45 }}>{s}</span>
          </button>
        ))}
      </div>
      {fehler && <Rueck art="warn">{fehler}</Rueck>}
      <GrosserKnopf gold onClick={start} disabled={!bereit || laeuft}>{laeuft ? zw("Mathilda übersetzt …", "Mathilda is translating …") : zw("Übersetzen lassen", "Translate")}</GrosserKnopf>
      {letzte && !laeuft && <button type="button" onClick={onLetzte} style={{ ...kleinKnopf, marginTop: 10, width: "100%" }} data-letzte>{zw("Letzte Übersetzung öffnen", "Open last translation")}</button>}
      <p style={{ fontSize: 11.5, color: C.hellgrau, margin: "10px 0 0", lineHeight: 1.5 }}>
        {zw("Foto bzw. Text gehen zur Übersetzung an Anthropic (Claude). Am besten: gerade von oben, gutes Licht, nur die eine Aufgabe im Bild.", "The photo or text is sent to Anthropic (Claude) for the translation. Best: straight from above, good light, only that task in the picture.")}
      </p>
      <BlattScanner offen={scan} onSchliessen={() => setScan(false)} onFoto={datei}
        onKameraApp={() => { setScan(false); kameraRef.current?.click(); }} onGalerie={() => { setScan(false); galerieRef.current?.click(); }} />
    </div>
  );
}
const kleinKnopf = { height: 38, padding: "0 14px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer" };

/* ---------- Läuft ---------- */
function Laeuft() {
  const saetze = [zw("Mathilda liest die Aufgabe …", "Mathilda is reading the task …"), zw("Sie sucht jede Information …", "Looking for every piece of information …"), zw("… und übersetzt sie in Bedingungen.", "… and translating it into conditions.")];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % saetze.length), 2200); return () => clearInterval(t); }, []);
  return (
    <div style={{ ...karte, marginTop: 14, display: "flex", alignItems: "center", gap: 14 }} role="status" data-laeuft>
      <span className="tm-puls" style={{ width: 44, height: 44, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: GOLD }} />
      </span>
      <style>{`.tm-puls { animation: tmPuls 1.4s ease-in-out infinite; } @keyframes tmPuls { 0%,100% { transform: scale(1); } 50% { transform: scale(.88); } } @media (prefers-reduced-motion: reduce) { .tm-puls { animation: none; } }`}</style>
      <p style={{ margin: 0, fontSize: 15, color: C.tinte, fontWeight: 600 }}>{saetze[i]}</p>
    </div>
  );
}

/* ---------- Eine übersetzte Stelle ---------- */
function StelleKarte({ s, i, zeigen, versuch, setVersuch, funktionen, gesehen, setGesehen }) {
  const [auf, setAuf] = useState(zeigen);
  const [r, setR] = useState(null);
  const [tipp, setTipp] = useState(false);
  const [selbst, setSelbst] = useState(null);   // „hatte ich“ / „hatte ich nicht“
  useEffect(() => { if (zeigen) setAuf(true); }, [zeigen]);
  const pruefbar = s.bedingungen.filter((b) => b.text && lies(b.text, { funktionen }));
  const pruefen = () => {
    const res = pruefeEingabe(versuch || "", pruefbar.map((b) => ({ c: b.text })), { funktionen });
    setR(res);
    if (res.ok) { setAuf(true); setGesehen(true); }
  };
  const aufdecken = () => { setAuf(true); setGesehen(true); };
  return (
    <div id={`tm-stelle-${i}`} style={{ ...karte, marginTop: 10, padding: 16, scrollMarginTop: 80, borderLeft: `4px solid ${auf ? (r && r.ok ? GRUEN : C.see) : GOLD}` }} data-tm-stelle={i}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: C.grau }}>{nr(i)} {zw("Textstelle", "Phrase")}</p>
      <p style={{ margin: "4px 0 8px", fontSize: 16, fontWeight: 700, lineHeight: 1.45, color: C.tinte }}>
        <span style={{ background: "linear-gradient(transparent 55%, rgba(237,187,0,0.5) 55%)" }}>„<Sicher s={s.textstelle} />“</span>
      </p>
      {(auf || tipp) && s.bedeutung && <p style={{ margin: "0 0 8px", fontSize: 13.5, color: C.grau, lineHeight: 1.55 }}><Sicher s={s.bedeutung} /></p>}
      {!auf && (
        <>
          {pruefbar.length > 0 ? (
            <>
              <input value={versuch || ""} onChange={(e) => { setVersuch(e.target.value.slice(0, 200)); setR(null); }} onKeyDown={(e) => { if (e.key === "Enter") pruefen(); }}
                aria-label={zw(`Deine Übersetzung zu Stelle ${i + 1}`, `Your translation of phrase ${i + 1}`)} placeholder={zw("Deine Bedingung(en), z. B. f(2) = 5; f'(2) = 0", "Your condition(s), e.g. f(2) = 5; f'(2) = 0")}
                spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off"
                style={{ width: "100%", boxSizing: "border-box", height: 46, padding: "0 12px", borderRadius: 12, border: `1.5px solid ${C.linie}`, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 15.5, color: C.tinte, outline: "none" }} />
              {r && !r.ok && (
                <Rueck art={r.leer ? "warn" : "schlecht"}>
                  {r.leer ? zw("Schreib zuerst deine Übersetzung.", "Write your translation first.")
                    : <>{zw(`${r.gefunden.filter(Boolean).length} von ${pruefbar.length} richtig.`, `${r.gefunden.filter(Boolean).length} of ${pruefbar.length} correct.`)}{r.unlesbar.length ? ` ${zw("Nicht lesbar:", "Can't read:")} „${r.unlesbar.join("“, „")}“.` : ""} {zw("Versuch es noch einmal oder deck auf.", "Try again or reveal.")}</>}
                </Rueck>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <button type="button" onClick={pruefen} disabled={!(versuch || "").trim()} style={{ ...vollKnopf, background: C.smaragd, color: C.weiss, opacity: (versuch || "").trim() ? 1 : 0.45 }}>{zw("Prüfen", "Check")}</button>
                <button type="button" onClick={aufdecken} style={{ ...vollKnopf, background: C.weiss, color: C.see, border: `1.5px solid ${C.linie}` }} data-aufdecken>{zw("Aufdecken", "Reveal")}</button>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 8px", fontSize: 13.5, color: C.grau }}>{zw("Überleg dir die Bedingung auf deinem Blatt – dann deck auf und vergleiche.", "Work out the condition on paper – then reveal and compare.")}</p>
              <button type="button" onClick={aufdecken} style={{ ...vollKnopf, width: "100%", background: C.weiss, color: C.see, border: `1.5px solid ${C.linie}` }} data-aufdecken>{zw("Aufdecken", "Reveal")}</button>
            </>
          )}
          {!tipp && s.bedeutung && <button type="button" onClick={() => setTipp(true)} style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "10px 0 0" }}>{zw("Tipp: Was heißt das?", "Hint: what does it mean?")}</button>}
        </>
      )}
      {auf && (
        <div data-tm-loesung>
          {r && r.ok && <Rueck art="gut">{zw("Genau so übersetzt.", "Exactly right.")}</Rueck>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", margin: "8px 0", overflowX: "auto" }}>
            {s.bedingungen.map((b, k) => <span key={k} style={{ fontSize: 18, color: C.tinte }}><M t={b.tex} /></span>)}
          </div>
          {s.warum && <p style={{ margin: 0, fontSize: 13.5, color: C.tinte, lineHeight: 1.6 }}><Sicher s={s.warum} /></p>}
          {s.falle && <Rueck art="warn"><Sicher s={zw("Typische Falle: ", "Typical trap: ") + s.falle} /></Rueck>}
          {!zeigen && !(r && r.ok) && selbst === null && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: C.grau, alignSelf: "center" }}>{zw("Hattest du das?", "Did you have that?")}</span>
              <button type="button" onClick={() => setSelbst(true)} style={kleinKnopf}>{zw("Ja", "Yes")}</button>
              <button type="button" onClick={() => setSelbst(false)} style={kleinKnopf}>{zw("Nein", "No")}</button>
            </div>
          )}
          {selbst === false && <p style={{ fontSize: 13, color: C.grau, margin: "8px 0 0" }}>{zw("Schreib die Bedingung ab und sag dir laut, warum sie so lautet – das bleibt.", "Copy the condition and say out loud why it is right – that sticks.")}</p>}
        </div>
      )}
    </div>
  );
}
const vollKnopf = { height: 46, borderRadius: 12, border: "none", fontFamily: "inherit", fontSize: 15, fontWeight: 800, cursor: "pointer" };

/* ---------- Ergebnis ---------- */
function Ergebnis({ e, zeigen, setZeigen, quelleFoto, onKorrektur, onNeu, gehe, kontingent }) {
  const [abschriftOk, setAbschriftOk] = useState(!quelleFoto);
  const [korrigieren, setKorrigieren] = useState(false);
  const [neuText, setNeuText] = useState(e.abschrift.replace(/\$/g, ""));
  const [versuche, setVersuche] = useState({});
  const [gesehen, setGesehen] = useState({});
  const [chat, setChat] = useState(false);
  const teile = useMemo(() => markierungen(e.abschrift, e.stellen), [e]);
  const fehlt = useMemo(() => nichtGefunden(e.abschrift, e.stellen), [e]);
  const funktionen = useMemo(() => funktionsnamen(e), [e]);
  const w = werkzeugFuerThema(e.thema);
  const fertig = Object.keys(gesehen).length;
  const springe = (k) => { const el = document.getElementById(`tm-stelle-${k}`); if (el) springe("anker", () => el.scrollIntoView({ behavior: "smooth", block: "start" })); };
  return (
    <div data-tm-ergebnis>
      <div style={{ ...karte, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <p style={{ ...kicker, marginBottom: 6 }}>{zw("Mathildas Abschrift", "Mathilda's transcript")}{e.klasse ? ` · ${zw("Klasse", "Year")} ${e.klasse}` : ""}</p>
          {kontingent && <span style={{ fontSize: 11.5, color: C.hellgrau }}>{zw(`heute ${kontingent.anzahl} von ${kontingent.limit}`, `today ${kontingent.anzahl} of ${kontingent.limit}`)}</span>}
        </div>
        <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px" }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.85, color: C.tinte, whiteSpace: "pre-wrap" }} data-abschrift>
            {teile.map((t, k) => (t.nr
              ? <span key={k} role="button" tabIndex={0} onClick={() => springe(t.nr - 1)} onKeyDown={(ev) => { if (ev.key === "Enter") springe(t.nr - 1); }}
                  style={{ background: gesehen[t.nr - 1] ? "linear-gradient(transparent 80%, rgba(15,122,77,0.4) 80%)" : "linear-gradient(transparent 52%, rgba(237,187,0,0.5) 52%)", cursor: "pointer", fontWeight: 600, WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>
                  <Sicher s={t.t} /><sup style={{ color: gesehen[t.nr - 1] ? GRUEN : "#8A6A00", fontWeight: 800, fontSize: 11 }}>{nr(t.nr - 1)}</sup>
                </span>
              : <React.Fragment key={k}><Sicher s={t.t} /></React.Fragment>))}
          </p>
        </div>
        {e.unsicher.length > 0 && <Rueck art="warn">{zw("Unsicher gelesen: ", "Unsure about: ")}{e.unsicher.join(" · ")}</Rueck>}
        {e.weitere.length > 0 && <Rueck art="info">{zw("Auf dem Foto stehen noch: ", "The photo also contains: ")}{e.weitere.join(" · ")}{zw(" – gib oben die Teilaufgabe an, wenn du eine andere willst.", " – name the part above if you want another one.")}</Rueck>}
        {!abschriftOk && !korrigieren && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 10 }} data-abschrift-frage>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.tinte }}>{zw("Stimmt die Abschrift?", "Is the transcript right?")}</span>
            <button type="button" onClick={() => setAbschriftOk(true)} style={kleinKnopf}>{zw("Ja", "Yes")}</button>
            <button type="button" onClick={() => setKorrigieren(true)} style={kleinKnopf}>{zw("Korrigieren", "Correct it")}</button>
          </div>
        )}
        {korrigieren && (
          <div style={{ marginTop: 10 }}>
            <textarea value={neuText} onChange={(ev) => setNeuText(ev.target.value.slice(0, 4000))} rows={5} aria-label={zw("Abschrift korrigieren", "Correct the transcript")}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, lineHeight: 1.6, color: C.tinte, resize: "vertical" }} />
            <GrosserKnopf gold onClick={() => onKorrektur(neuText)}>{zw("Mit diesem Text neu übersetzen", "Translate this text again")}</GrosserKnopf>
          </div>
        )}
      </div>

      <div style={{ ...karte, marginTop: 10, borderLeft: `4px solid ${C.see}` }} data-tm-ansatz>
        <p style={kicker}>{zw("Gesucht und Ansatz", "Unknown and general form")}</p>
        {e.gesucht && <p style={{ margin: "0 0 8px", fontSize: 15, color: C.tinte, lineHeight: 1.55 }}><Sicher s={e.gesucht} /></p>}
        {e.ansatz.tex && <div style={{ fontSize: 19, overflowX: "auto", padding: "4px 0" }}><M t={e.ansatz.tex} /></div>}
        {e.ansatz.unbekannte.length > 0 && <p style={{ margin: "4px 0", fontSize: 13, color: C.grau }}>{zw("Unbekannte", "Unknowns")}: <b style={{ color: C.tinte }}>{e.ansatz.unbekannte.join(", ")}</b></p>}
        {e.ansatz.warum && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: C.tinte, lineHeight: 1.6 }}><Sicher s={e.ansatz.warum} /></p>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.tinte }}>{zw(`${e.stellen.length} Informationen → Bedingungen`, `${e.stellen.length} pieces of information → conditions`)}</p>
        {!zeigen && <button type="button" onClick={() => setZeigen(true)} style={kleinKnopf} data-alles-zeigen>{zw("Alles zeigen", "Show everything")}</button>}
      </div>
      {!zeigen && <p style={{ fontSize: 13, color: C.grau, margin: "4px 0 0" }}>{zw(`Übersetze jede markierte Stelle selbst – ${fertig} von ${e.stellen.length} erledigt.`, `Translate every marked phrase yourself – ${fertig} of ${e.stellen.length} done.`)}</p>}
      {fehlt.length > 0 && <p style={{ fontSize: 12, color: C.hellgrau, margin: "4px 0 0" }}>{zw("Nicht im Text markiert: ", "Not marked in the text: ")}{fehlt.map((k) => nr(k - 1)).join(" ")}</p>}
      {e.stellen.map((s, i) => (
        <StelleKarte key={i} s={s} i={i} zeigen={zeigen} funktionen={funktionen} versuch={versuche[i]} setVersuch={(v) => setVersuche((o) => ({ ...o, [i]: v }))}
          gesehen={!!gesehen[i]} setGesehen={() => setGesehen((o) => ({ ...o, [i]: true }))} />
      ))}

      {(zeigen || fertig === e.stellen.length) && (
        <div style={{ marginTop: 14, borderRadius: 16, padding: "14px 16px", color: C.weiss, background: `linear-gradient(160deg, ${NACHT} 0%, ${C.see} 100%)` }} data-tm-zaehlen>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD }}>{zw("Zählen", "Count")}</p>
          <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 700 }}>
            {e.zaehlen.unbekannte ? zw(`${e.zaehlen.unbekannte} Unbekannte · ${e.zaehlen.bedingungen} Bedingungen`, `${e.zaehlen.unbekannte} unknowns · ${e.zaehlen.bedingungen} conditions`) : zw(`${e.zaehlen.bedingungen} Bedingungen`, `${e.zaehlen.bedingungen} conditions`)}
            {e.zaehlen.unbekannte > 0 && e.zaehlen.unbekannte === e.zaehlen.bedingungen && <span style={{ color: GOLD }}> ✓</span>}
          </p>
          {e.zaehlen.kommentar && <p style={{ margin: "4px 0 0", fontSize: 13.5, fontWeight: 300, color: "#C9D6EE", lineHeight: 1.55 }}><Sicher s={e.zaehlen.kommentar} /></p>}
          {e.naechster && <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55 }}><b style={{ color: GOLD }}>{zw("Weiter: ", "Next: ")}</b><Sicher s={e.naechster} /></p>}
          {e.frage && <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55 }}><b style={{ color: GOLD }}>{zw("Kontrollfrage: ", "Check question: ")}</b><Sicher s={e.frage} /></p>}
        </div>
      )}
      {e.kontext.length > 0 && (
        <div style={{ ...karte, marginTop: 10 }}>
          <p style={kicker}>{zw("Nur Zusammenhang – keine Bedingung", "Context only – no condition")}</p>
          {e.kontext.map((k, i) => <p key={i} style={{ margin: "4px 0 0", fontSize: 13.5, color: C.grau, lineHeight: 1.55 }}><Sicher s={k} /></p>)}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: w ? "1fr 1fr" : "1fr", gap: 8, marginTop: 6 }}>
        <GrosserKnopf gold onClick={() => setChat(true)}>{zw("Mathilda dazu fragen", "Ask Mathilda about it")}</GrosserKnopf>
        {w && <GrosserKnopf ghost onClick={() => gehe && gehe({ ansicht: w.ansicht })}>{zw(w.name[0], w.name[1])} →</GrosserKnopf>}
      </div>
      <GrosserKnopf ghost onClick={onNeu}>{zw("Neue Aufgabe übersetzen", "Translate another task")}</GrosserKnopf>
      {chat && <MathildaChatModal aufgabe={chatKontext(e, versuche)} schliessen={() => setChat(false)} />}
    </div>
  );
}

/* ---------- Seite ---------- */
export function TextMathilda({ gehe, zuTraining }) {
  const konto = useKonto();
  const [modus, setModusIntern] = useState(() => lsLesen(MODUS, "selbst"));
  const setModus = (m) => { setModusIntern(m); lsSchreiben(MODUS, m); };
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [erg, setErg] = useState(null);
  const [foto, setFoto] = useState(false);
  const [zeigen, setZeigen] = useState(false);
  const [kontingent, setKontingent] = useState(null);
  const [warten, setWarten] = useState(null);   // Anfrage, die auf die Einwilligung wartet
  const [letzte, setLetzte] = useState(() => lsLesen(LETZTE, null));
  const oben = useRef(null);

  const senden = async ({ b64, text, teil }) => {
    if (!kiEinwilligungDa()) { setWarten({ b64, text, teil }); try { window.dispatchEvent(new CustomEvent("mm-ki-einwilligung")); } catch (e) { /* kein Browser */ } return; }
    setLaeuft(true); setFehler(""); setErg(null); setFoto(!!b64); setZeigen(modus === "zeigen");
    const prompt = uebersetzenPrompt({ foto: !!b64, text, teilaufgabe: teil });
    const zaehler = lsLesen(ZAEHLER_SCHLUESSEL, 0) || 0;
    try {
      const system = `${mathildaSystem({ L: LERN, profil: konto.profil })}\n\n${UEBERSETZEN_REGELN}`;
      const content = b64 ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } }, { type: "text", text: prompt }] : [{ type: "text", text: prompt }];
      const res = await fetch(API_URL, { method: "POST", headers: kiKopf(), body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 3500, system, messages: [{ role: "user", content }] }) });
      const daten = await kiAntwort(res);
      if (daten.error) { if (daten.error.kontingent) setKontingent(daten.error.kontingent); throw new Error(daten.error.message || zw("Mathilda hat abgelehnt.", "Mathilda declined.")); }
      if (daten.kontingent) setKontingent(daten.kontingent);
      const roh = (daten.content || []).map((x) => (x.type === "text" ? x.text : "")).join("");
      const e = uebersetzungLesen(jsonLesen(roh));
      if (!e.lesbar || !e.stellen.length) throw new Error(e.rueckfrage || zw("Mathilda konnte darin keine Informationen zum Übersetzen finden. Versuch ein schärferes Foto oder tippe den Text ein.", "Mathilda found nothing to translate. Try a sharper photo or type the text."));
      setErg(e);
      lsSchreiben(ZAEHLER_SCHLUESSEL, zaehler + 1);
      lsSchreiben(LETZTE, { e, zeit: Date.now() }); setLetzte({ e, zeit: Date.now() });
      requestAnimationFrame(() => springe("textmathilda-ergebnis", () => oben.current?.scrollIntoView({ behavior: "smooth", block: "start" })));
    } catch (e) {
      setFehler(e.message || zw("Mathilda ist gerade nicht erreichbar.", "Mathilda is not reachable right now."));
    } finally { setLaeuft(false); }
  };
  /* Nach erteilter Einwilligung die wartende Anfrage abschicken */
  useEffect(() => {
    const ja = () => setWarten((w) => { if (w) setTimeout(() => senden(w), 0); return null; });
    window.addEventListener("mm-ki-einwilligung-erteilt", ja);
    return () => window.removeEventListener("mm-ki-einwilligung-erteilt", ja);
  }, [modus, konto]);

  return (
    <div data-text-mathilda>
      <div ref={oben} style={{ scrollMarginTop: 70 }} />
      <Kopf />
      {!erg && !laeuft && <Eingabe onStart={senden} laeuft={laeuft} modus={modus} setModus={setModus} letzte={letzte} onLetzte={() => { setErg(letzte.e); setFoto(false); setZeigen(true); }} />}
      {laeuft && <Laeuft />}
      {fehler && !laeuft && <Rueck art="warn">{fehler}</Rueck>}
      {erg && !laeuft && (
        <Ergebnis key={erg.abschrift} e={erg} zeigen={zeigen} setZeigen={setZeigen} quelleFoto={foto} gehe={gehe} kontingent={kontingent}
          onKorrektur={(t) => senden({ text: t })} onNeu={() => { setErg(null); setFehler(""); }} />
      )}
      {!erg && !laeuft && (
        <div style={{ ...karte, marginTop: 12 }}>
          <p style={kicker}>{zw("So hilft dir Mathilda", "How Mathilda helps")}</p>
          {[[zw("Sie schreibt ab", "She transcribes"), zw("Du bestätigst, dass sie richtig gelesen hat.", "You confirm she read it correctly.")],
            [zw("Sie markiert jede Information", "She marks every piece of information"), zw("Jede Stelle im Text wird zu Bedingungen – mit Begründung und typischer Falle.", "Every phrase becomes conditions – with a reason and the typical trap.")],
            [zw("Du übersetzt zuerst", "You translate first"), zw("Tippe deine Bedingung – die App prüft sie sofort, ohne weitere KI-Anfrage.", "Type your condition – the app checks it instantly, without another AI request.")],
            [zw("Rechnen tust du selbst", "You do the calculating"), zw("Mathilda löst nicht für dich – sie zeigt dir den Weg dorthin.", "Mathilda doesn't solve it for you – she shows you the way there.")]].map(([t, s], i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0" }}>
              <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: NACHT, color: GOLD, fontWeight: 800, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <div><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.tinte }}>{t}</p><p style={{ margin: "1px 0 0", fontSize: 13, color: C.grau, lineHeight: 1.5 }}>{s}</p></div>
            </div>
          ))}
          <button type="button" onClick={zuTraining} style={{ background: "none", border: "none", color: C.see, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "10px 0 0" }}>{zw("Ohne Foto üben: zum Training →", "Practise without a photo: to the training →")}</button>
        </div>
      )}
    </div>
  );
}
