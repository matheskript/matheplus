/* ============================================================
   Abi-Ketten (Prüfung): eine Abi-Aufgabe, die in Teilaufgaben durch
   mehrere Werkzeuge läuft – mit Punkten und Uhr.
   Ablauf je Teilaufgabe: selbst rechnen → Ergebnis eintippen → prüfen
   (oder Lösung zeigen, dann 0 Punkte). Erst danach öffnet „Im Werkzeug
   ansehen“ das passende Werkzeug mit genau diesen Daten (uebergabe.js) –
   die Werkzeuge sind hier Nachbereitung, keine Hilfe während der Prüfung.
   Der Stand einer Kette bleibt beim Ausflug ins Werkzeug erhalten
   (LAUF auf Modulebene) und jede Teilaufgabe wird über merken() gebucht.
   Mathematik in abiKetten.js. Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { merken } from "./func5.jsx";
import { KETTEN, pruefeTeil } from "./abiKetten.js";
import { WeiterKnopf } from "./funcWerkzeuge.jsx";
import { MText } from "./perfUi.jsx";

import { springe } from "./sprung.js";
import { MathildaModusKnopf } from "./funcMathildaModusKnopf.jsx";
/* Laufende Ketten: bleiben erhalten, solange die App offen ist (auch beim Ausflug in ein Werkzeug) */
const LAUF = {};
let AKTIV = null;

const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const kicker = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 8px" };
const dauer = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

function neuerLauf(id) {
  const k = KETTEN.find((x) => x.id === id);
  const kette = k.erzeuge();
  LAUF[id] = { kette, start: Date.now(), ende: null, eingaben: kette.teile.map((t) => t.felder.map(() => "")), ergebnisse: kette.teile.map(() => null) };
  return LAUF[id];
}

function Uhr({ start, ende, minuten }) {
  const [, tick] = useState(0);
  useEffect(() => { if (ende) return undefined; const t = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(t); }, [ende]);
  const ms = (ende || Date.now()) - start;
  const ueber = ms > minuten * 60000;
  return (
    <span aria-label="Bearbeitungszeit" style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: ueber ? C.gruenDunkel : C.tinte }}>
      {dauer(ms)} <span style={{ fontWeight: 400, color: C.grau }}>/ {minuten}:00</span>
    </span>
  );
}

function Teilaufgabe({ teil, nr, eingaben, ergebnis, setEingabe, pruefen, zeigen }) {
  const fertig = !!ergebnis;
  return (
    <section data-teil={teil.id} style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${fertig ? (ergebnis.punkte === teil.punkte ? "#0F7A4D" : ergebnis.punkte > 0 ? C.flaggold : C.gruenDunkel) : C.see}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, margin: 0 }}>{nr}) {teil.titel}</p>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.grau, whiteSpace: "nowrap" }}>{fertig ? `${ergebnis.punkte} / ` : ""}{teil.punkte} P.</span>
      </div>
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, margin: "8px 0 12px" }}><MText s={teil.frage} /></p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {teil.felder.map((f, i) => {
          const ok = fertig ? ergebnis.richtig[i] : null;
          return (
            <label key={f.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600, color: C.tinte }}>
              <span style={{ fontStyle: "italic" }}>{f.name} =</span>
              <input value={eingaben[i]} disabled={fertig} inputMode="decimal" aria-label={`${teil.titel}: ${f.name}`}
                onChange={(e) => setEingabe(i, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !fertig) pruefen(); }}
                style={{ width: teil.felder.length > 2 ? 64 : 96, height: 40, borderRadius: 10, padding: "0 10px", fontSize: 15, fontFamily: "inherit", textAlign: "center",
                  border: `1.5px solid ${ok === null ? C.linie : ok ? "#0F7A4D" : C.gruenDunkel}`, background: ok === null ? C.weiss : ok ? "#E6F6EF" : "#FCE8EE", color: C.tinte }} />
            </label>
          );
        })}
      </div>
      {!fertig ? (
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button type="button" onClick={pruefen} style={{ flex: "1 1 160px", height: 46, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, background: C.see, color: C.weiss }}>Prüfen</button>
          <button type="button" onClick={zeigen} style={{ flex: "0 1 auto", height: 46, padding: "0 18px", borderRadius: 999, border: `1px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: C.weiss, color: C.grau }}>Lösung zeigen (0 P.)</button>
          <MathildaModusKnopf kompakt />
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div style={{ background: C.sand, borderRadius: 12, padding: "10px 12px", fontSize: 14, color: C.tinte, lineHeight: 1.6 }}>
            <b>{ergebnis.gezeigt ? "Lösung: " : ergebnis.punkte === teil.punkte ? "Richtig. " : "Lösung: "}</b><MText s={teil.loesung} />
          </div>
          {teil.werkzeug && (
            <div style={{ marginTop: 10 }}>
              <WeiterKnopf ziel={teil.werkzeug.ziel} daten={teil.werkzeug.daten} von="Abi-Kette" zurueck={{ ansicht: "abiketten" }} titel={teil.werkzeug.titel} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function KetteSeite({ id, zurueck }) {
  const [lauf, setLauf] = useState(() => LAUF[id] || neuerLauf(id));
  const [, neuZeichnen] = useState(0);
  const { kette } = lauf;
  const aktualisieren = () => { LAUF[id] = lauf; neuZeichnen((x) => x + 1); };
  const erreicht = lauf.ergebnisse.reduce((s, e) => s + (e ? e.punkte : 0), 0);
  const gesamt = kette.teile.reduce((s, t) => s + t.punkte, 0);
  const alleFertig = lauf.ergebnisse.every(Boolean);

  const buchen = (teil, punkte, start) => {
    try { merken({ bereich: "abikette", gruppe: `${kette.id}-${teil.id}`, stufe: 3, richtig: punkte === teil.punkte, sekunden: Math.max(1, Math.round((Date.now() - start) / 1000)), fehlerart: punkte === teil.punkte ? null : "rechnen" }); }
    catch (e) { /* Protokoll ist optional */ }
  };
  const abschliessen = (i, ergebnis) => {
    lauf.ergebnisse[i] = ergebnis;
    buchen(kette.teile[i], ergebnis.punkte, lauf.letzte || lauf.start);
    lauf.letzte = Date.now();
    if (lauf.ergebnisse.every(Boolean)) lauf.ende = Date.now();
    aktualisieren();
  };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <button type="button" onClick={zurueck} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: C.see, fontWeight: 600, marginBottom: 12 }}>‹ Alle Abi-Ketten</button>
      <div style={{ ...karte, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
        <p style={{ ...kicker, color: C.flaggold }}>{kette.titel}</p>
        <p style={{ fontSize: 15, lineHeight: 1.65, margin: "0 0 12px", color: "#E6EDF8" }}><MText s={kette.einleitung} /></p>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 14, background: "rgba(255,255,255,0.94)", borderRadius: 10, padding: "8px 12px", color: C.tinte }}>
          <span>Zeit <Uhr start={lauf.start} ende={lauf.ende} minuten={kette.minuten} /></span>
          <span>Punkte <b>{erreicht}</b> / {gesamt}</span>
        </div>
      </div>

      {kette.teile.map((teil, i) => (
        <Teilaufgabe key={`${lauf.start}-${teil.id}`} teil={teil} nr={teil.id} eingaben={lauf.eingaben[i]} ergebnis={lauf.ergebnisse[i]}
          setEingabe={(j, v) => { lauf.eingaben[i][j] = v; aktualisieren(); }}
          pruefen={() => abschliessen(i, pruefeTeil(teil, lauf.eingaben[i]))}
          zeigen={() => abschliessen(i, { punkte: 0, richtig: teil.felder.map(() => false), gezeigt: true })} />
      ))}

      {alleFertig && (
        <section style={{ ...karte, marginTop: 16, textAlign: "center" }}>
          <p style={kicker}>Ergebnis</p>
          <p style={{ fontSize: 34, fontWeight: 700, color: C.tinte, margin: "0 0 4px" }}>{erreicht} / {gesamt} Punkte</p>
          <p style={{ fontSize: 14, color: C.grau, margin: "0 0 14px" }}>in {dauer(lauf.ende - lauf.start)} Minuten (Richtzeit {kette.minuten} Minuten)</p>
          <button type="button" onClick={() => setLauf(neuerLauf(id))}
            style={{ width: "100%", height: 48, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 800, background: C.flaggold, color: C.seeTief }}>
            Neue Kette mit anderen Zahlen
          </button>
        </section>
      )}
    </div>
  );
}

export function AbiKettenSeite() {
  const [id, setId] = useState(AKTIV);
  const waehle = (x) => { AKTIV = x; setId(x); try { springe("abiketten", () => window.scrollTo(0, 0)); } catch (e) { /* egal */ } };
  if (id) return <KetteSeite key={id} id={id} zurueck={() => waehle(null)} />;
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 26 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 10px", color: C.tinte }}>Eine Aufgabe, mehrere Werkzeuge</h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, margin: "0 0 18px" }}>
        Im Abitur hängen die Teilaufgaben zusammen: Was du in a) bestimmst, brauchst du in b). Rechne jede Teilaufgabe selbst,
        tippe das Ergebnis ein und lass es prüfen. Danach kannst du sie im passenden Werkzeug mit genau diesen Zahlen nachbereiten.
      </p>
      {KETTEN.map((k) => {
        const l = LAUF[k.id];
        const offen = l && !l.ende;
        return (
          <button key={k.id} type="button" onClick={() => waehle(k.id)} className="w-full"
            style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 12, padding: 16, borderRadius: 18, border: `1px solid ${C.linie}`, background: C.weiss,
              cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
            <span style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{k.titel}</span>
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.45 }}>{k.zeile}</span>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: offen ? C.gruenDunkel : C.see, marginTop: 8 }}>
              {offen ? "Angefangen – weitermachen ›" : l ? `Zuletzt ${l.ergebnisse.reduce((s, e) => s + (e ? e.punkte : 0), 0)} / 10 Punkte – Ergebnis ansehen ›` : "10 Punkte · etwa 25 Minuten ›"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
