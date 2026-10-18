/* ============================================================
   Abi-Aufgabensätze (Prüfung): zehn feste Sätze im Stil des BW-Abiturs,
   Teil A ohne Hilfsmittel, Teil B mit WTR – mit Verrechnungspunkten und Uhr.
   Ablauf je Teilaufgabe: auf Papier rechnen → Ergebnis eintippen → prüfen
   (oder Lösung zeigen, dann 0 VP). Begründungsaufgaben: Lösung lesen und
   ehrlich abhaken, welche Argumente auf dem eigenen Blatt stehen.
   Keine Notenprognose – nur VP und Anteil. Mathematik in abiSaetze.js.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { merken } from "./func5.jsx";
import { ANZAHL_SAETZE, BUNDESLAND, abiSatz, feldLoesung, pruefeAbiTeil } from "./abiSaetze.js";

import { springe } from "./sprung.js";
const LAUF = {};   // nr → laufender Satz (bleibt, solange die App offen ist)
const STAND_SCHLUESSEL = "matheplus-abisaetze";
const standLesen = () => { try { return JSON.parse(localStorage.getItem(STAND_SCHLUESSEL) || "{}"); } catch (e) { return {}; } };
const standSchreiben = (s) => { try { localStorage.setItem(STAND_SCHLUESSEL, JSON.stringify(s)); } catch (e) { /* privat */ } };

const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const kicker = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 8px" };
const dauer = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

function neuerLauf(nr) {
  const satz = abiSatz(nr);
  const eingaben = {}, ergebnisse = {};
  for (const t of satz.teile) for (const b of t.bloecke) for (const x of b.teile) { eingaben[`${b.id}${x.id}`] = x.art === "begruenden" ? x.kriterien.map(() => false) : x.felder.map(() => ""); ergebnisse[`${b.id}${x.id}`] = null; }
  LAUF[nr] = { satz, teil: "A", start: Date.now(), startTeil: { A: Date.now(), B: null }, ende: {}, eingaben, ergebnisse };
  return LAUF[nr];
}

function Uhr({ start, ende, minuten }) {
  const [, tick] = useState(0);
  useEffect(() => { if (ende) return undefined; const t = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(t); }, [ende]);
  const ms = (ende || Date.now()) - start;
  return <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: ms > minuten * 60000 ? C.gruenDunkel : C.tinte }}>{dauer(ms)} <span style={{ fontWeight: 400, color: C.grau }}>/ {minuten}:00</span></span>;
}

function Teilaufgabe({ teil, key_, eingaben, ergebnis, setEingabe, pruefen, zeigen }) {
  const fertig = !!ergebnis;
  const [loesungAuf, setLoesungAuf] = useState(false);
  const rand = fertig ? (ergebnis.punkte === teil.punkte ? "#0F7A4D" : ergebnis.punkte > 0 ? C.flaggold : C.gruenDunkel) : C.see;
  return (
    <section data-teil={key_} style={{ ...karte, marginTop: 12, borderLeft: `4px solid ${rand}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <p style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, margin: 0 }}>{teil.id}) {teil.titel}</p>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.grau, whiteSpace: "nowrap" }}>{fertig ? `${ergebnis.punkte} / ` : ""}{teil.punkte} VP</span>
      </div>
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.65, margin: "8px 0 12px" }}>{teil.frage}</p>

      {teil.art === "begruenden" ? (
        <div>
          {!fertig && !loesungAuf && (
            <button type="button" onClick={() => setLoesungAuf(true)} style={{ width: "100%", height: 46, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, background: C.see, color: C.weiss }}>
              Ich habe meine Begründung geschrieben – Lösung vergleichen
            </button>
          )}
          {(loesungAuf || fertig) && (
            <>
              <div style={{ background: C.sand, borderRadius: 12, padding: "10px 12px", fontSize: 14, color: C.tinte, lineHeight: 1.6 }}><b>Erwartung: </b>{teil.loesung}</div>
              <p style={{ fontSize: 13, color: C.grau, margin: "10px 0 6px" }}>Hake ehrlich ab, was auf deinem Blatt steht:</p>
              {teil.kriterien.map((k, i) => (
                <label key={k} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0", fontSize: 14, color: C.tinte, lineHeight: 1.5 }}>
                  <input type="checkbox" checked={!!eingaben[i]} disabled={fertig} onChange={(e) => setEingabe(i, e.target.checked)} style={{ width: 20, height: 20, marginTop: 2 }} />
                  <span>{k}</span>
                </label>
              ))}
              {!fertig && <button type="button" onClick={pruefen} style={{ marginTop: 8, height: 44, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, background: C.smaragd, color: C.weiss }}>Punkte eintragen</button>}
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {teil.felder.map((f, i) => {
              const ok = fertig ? ergebnis.richtig[i] : null;
              const breit = teil.art === "term";
              return (
                <label key={f.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600, color: C.tinte, flex: breit ? "1 1 100%" : "0 1 auto" }}>
                  <span style={{ fontStyle: "italic", whiteSpace: "nowrap" }}>{f.name} =</span>
                  <input value={eingaben[i]} disabled={fertig} inputMode={breit ? "text" : "decimal"} aria-label={`${teil.titel}: ${f.name}`} placeholder={breit ? "z. B. 2x*e^(2x)" : ""}
                    onChange={(e) => setEingabe(i, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !fertig) pruefen(); }}
                    style={{ width: breit ? "100%" : teil.felder.length > 2 ? 72 : 100, minWidth: 0, height: 40, borderRadius: 10, padding: "0 10px", fontSize: 15, fontFamily: "inherit", textAlign: breit ? "left" : "center",
                      border: `1.5px solid ${ok === null ? C.linie : ok ? "#0F7A4D" : C.gruenDunkel}`, background: ok === null ? C.weiss : ok ? "#E6F6EF" : "#FCE8EE", color: C.tinte }} />
                </label>
              );
            })}
          </div>
          {teil.art === "term" && !fertig && <p style={{ fontSize: 12, color: C.hellgrau, marginTop: 6 }}>Schreibweise wie im Plotter: x^2, 3x, e^(2x), sqrt(x), ln(x). Geprüft wird der Wert, nicht die Form.</p>}
          {!fertig ? (
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={pruefen} style={{ flex: "1 1 160px", height: 46, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, background: C.see, color: C.weiss }}>Prüfen</button>
              <button type="button" onClick={zeigen} style={{ flex: "0 1 auto", height: 46, padding: "0 18px", borderRadius: 999, border: `1px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: C.weiss, color: C.grau }}>Lösung zeigen (0 VP)</button>
            </div>
          ) : (
            <div style={{ marginTop: 14, background: C.sand, borderRadius: 12, padding: "10px 12px", fontSize: 14, color: C.tinte, lineHeight: 1.6 }}>
              <b>{ergebnis.gezeigt ? "Lösung: " : ergebnis.alle ? "Richtig. " : "Lösung: "}</b>{teil.loesung}
              {!ergebnis.alle && <span style={{ display: "block", color: C.grau, marginTop: 4 }}>Erwartet: {teil.felder.map((f, i) => `${f.name} = ${feldLoesung(teil, i)}`).join(" · ")}</span>}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SatzSeite({ nr, zurueck }) {
  const [lauf, setLauf] = useState(() => LAUF[nr] || neuerLauf(nr));
  const [, neuZeichnen] = useState(0);
  const { satz } = lauf;
  const aktualisieren = () => { LAUF[nr] = lauf; neuZeichnen((x) => x + 1); };
  const teil = satz.teile.find((t) => t.id === lauf.teil);
  const schluessel = (b, x) => `${b.id}${x.id}`;
  const punkteVon = (t) => t.bloecke.reduce((s, b) => s + b.teile.reduce((x, y) => x + ((lauf.ergebnisse[schluessel(b, y)] || {}).punkte || 0), 0), 0);
  const fertigTeil = (t) => t.bloecke.every((b) => b.teile.every((y) => lauf.ergebnisse[schluessel(b, y)]));
  const alleFertig = satz.teile.every(fertigTeil);
  const erreicht = satz.teile.reduce((s, t) => s + punkteVon(t), 0);

  const abschliessen = (b, x, ergebnis) => {
    const k = schluessel(b, x);
    lauf.ergebnisse[k] = ergebnis;
    try { merken({ bereich: "abisatz", gruppe: `${satz.nr}-${k}`, stufe: 3, richtig: ergebnis.punkte === x.punkte, fehlerart: ergebnis.punkte === x.punkte ? null : "rechnen" }); } catch (e) { /* optional */ }
    if (fertigTeil(teil) && !lauf.ende[teil.id]) lauf.ende[teil.id] = Date.now();
    if (satz.teile.every(fertigTeil)) {
      const st = standLesen();
      st[nr] = { punkte: satz.teile.reduce((s, t) => s + punkteVon(t), 0), gesamt: satz.punkte, zeit: Date.now() };
      standSchreiben(st);
    }
    aktualisieren();
  };
  const wechseln = (id, sprung = "abisaetze-reiter") => { lauf.teil = id; if (!lauf.startTeil[id]) lauf.startTeil[id] = Date.now(); aktualisieren(); springe(sprung, () => window.scrollTo(0, 0)); };

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <button type="button" onClick={zurueck} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: C.see, fontWeight: 600, marginBottom: 12, minHeight: 44 }}>‹ Alle Abi-Sätze</button>
      <div style={{ ...karte, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
        <p style={{ ...kicker, color: C.flaggold }}>{satz.titel} · im Stil {BUNDESLAND}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {satz.teile.map((t) => (
            <button key={t.id} type="button" aria-pressed={lauf.teil === t.id} onClick={() => wechseln(t.id)}
              style={{ flex: 1, minHeight: 44, borderRadius: 12, border: `1.5px solid ${lauf.teil === t.id ? C.flaggold : "rgba(255,255,255,0.35)"}`, background: lauf.teil === t.id ? "rgba(237,187,0,0.18)" : "transparent", color: C.weiss, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer", lineHeight: 1.25 }}>
              {t.name}<span style={{ display: "block", fontSize: 11.5, fontWeight: 500, opacity: 0.85 }}>{t.hilfsmittel} · {t.punkte} VP{fertigTeil(t) ? " ✓" : ""}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 14, background: "rgba(255,255,255,0.94)", borderRadius: 10, padding: "8px 12px", color: C.tinte }}>
          <span>Zeit <Uhr start={lauf.startTeil[teil.id] || Date.now()} ende={lauf.ende[teil.id]} minuten={teil.minuten} /></span>
          <span>{teil.name} <b>{punkteVon(teil)}</b> / {teil.punkte} VP</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.6, margin: "12px 2px 0" }}>
        {teil.id === "A" ? "Ohne Taschenrechner und Formelsammlung, wie im Abitur. Alle Ergebnisse gehen sauber auf; Brüche sind erlaubt (z. B. 4/3)." : "Mit WTR und Formelsammlung. Runde so, wie es die Aufgabe verlangt."} Rechne auf Papier, tippe nur das Ergebnis ein.
      </p>

      {teil.bloecke.map((b) => (
        <div key={b.id}>
          <p style={{ ...kicker, margin: "18px 2px 0" }}>{b.id} · {b.titel} · {b.teile.reduce((s, x) => s + x.punkte, 0)} VP</p>
          {b.teile.map((x) => {
            const k = schluessel(b, x);
            return (
              <Teilaufgabe key={`${lauf.start}-${k}`} key_={k} teil={x} eingaben={lauf.eingaben[k]} ergebnis={lauf.ergebnisse[k]}
                setEingabe={(j, v) => { lauf.eingaben[k][j] = v; aktualisieren(); }}
                pruefen={() => abschliessen(b, x, pruefeAbiTeil(x, lauf.eingaben[k]))}
                zeigen={() => abschliessen(b, x, { punkte: 0, richtig: x.felder.map(() => false), gezeigt: true, alle: false })} />
            );
          })}
        </div>
      ))}

      {fertigTeil(teil) && !alleFertig && teil.id === "A" && (
        <button type="button" onClick={() => wechseln("B", "abisaetze-weiter")} style={{ width: "100%", marginTop: 16, height: 48, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 800, background: C.flaggold, color: C.seeTief }}>Weiter zu Teil B</button>
      )}
      {alleFertig && (
        <section style={{ ...karte, marginTop: 16, textAlign: "center" }}>
          <p style={kicker}>Ergebnis</p>
          <p style={{ fontSize: 34, fontWeight: 700, color: C.tinte, margin: "0 0 4px" }}>{erreicht} / {satz.punkte} VP</p>
          <p style={{ fontSize: 14, color: C.grau, margin: "0 0 6px" }}>Teil A {punkteVon(satz.teile[0])} / 30 · Teil B {punkteVon(satz.teile[1])} / 30 · {Math.round((100 * erreicht) / satz.punkte)} %</p>
          <p style={{ fontSize: 12.5, color: C.hellgrau, margin: "0 0 14px", lineHeight: 1.6 }}>Keine Note – die vergibt dein Bundesland. Was hier fehlte, taucht in „Meine Fehler üben“ und im Tagesplan wieder auf.</p>
          <button type="button" onClick={() => setLauf(neuerLauf(nr))}
            style={{ width: "100%", height: 48, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 800, background: C.flaggold, color: C.seeTief }}>
            Diesen Satz noch einmal
          </button>
        </section>
      )}
    </div>
  );
}

export function AbiSaetzeSeite() {
  const [nr, setNr] = useState(null);
  const [stand, setStand] = useState(standLesen);
  useEffect(() => { if (nr === null) setStand(standLesen()); }, [nr]);
  if (nr !== null) return <SatzSeite nr={nr} zurueck={() => setNr(null)} />;
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <div style={{ ...karte, marginBottom: 14 }}>
        <p style={kicker}>So läuft es</p>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.7 }}>
          Jeder Satz hat den Aufbau des Abiturs in {BUNDESLAND}: <b>Teil A</b> ohne Hilfsmittel (Analysis, Geometrie, Stochastik, 30 VP, 90 Minuten) und <b>Teil B</b> mit WTR und Formelsammlung (Sachaufgaben, 30 VP, 180 Minuten). Die Aufgaben sind im Originalformat geschrieben, keine Originalaufgaben. Zahlen in Teil A gehen ohne Rechner auf. Du rechnest auf Blankopapier und tippst nur Ergebnisse ein; bei Begründungen vergleichst du selbst.
        </p>
      </div>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
        {Array.from({ length: ANZAHL_SAETZE }, (_, i) => i + 1).map((n) => {
          const s = stand[n];
          return (
            <button key={n} type="button" onClick={() => setNr(n)} aria-label={`Abi-Satz ${n} öffnen`}
              style={{ ...karte, textAlign: "left", cursor: "pointer", fontFamily: "inherit", padding: 16, borderTop: `4px solid ${s ? (s.punkte / s.gesamt >= 0.5 ? C.smaragd : C.flaggold) : C.see}`, minHeight: 96 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: C.tinte }}>Abi-Satz {n}</span>
              <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 4 }}>{s ? `${s.punkte} / ${s.gesamt} VP · ${new Date(s.zeit).toLocaleDateString("de-DE")}` : LAUF[n] ? "angefangen" : "60 VP · Teil A und B"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

