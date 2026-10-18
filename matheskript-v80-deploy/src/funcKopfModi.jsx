import React, { useState } from "react";
import { C } from "./base1.jsx";
import { ModusLeiste } from "./ui3.jsx";
import { karte, Kicker, Zurueck, Knopf } from "./funcHeadNumbersBasis.jsx";
import { KopfVideo, KOPF_VIDEO } from "./funcKopfVideo.jsx";
import { KOPF_ERKLAERUNG, KOPF_REIHENFOLGE } from "./kopfErklaerung.js";
import { RECHNEN_THEMEN } from "./kopfWeg.js";

import { springe } from "./sprung.js";
/* Bruchmarkup {Zähler|Nenner} → gestapelter Bruch im Fließtext */
export function MitBruch({ text }) {
  const teile = String(text).split(/(\{[^|{}]+\|[^|{}]+\})/g);
  return (
    <>
      {teile.map((t, i) => {
        const m = /^\{([^|]+)\|([^}]+)\}$/.exec(t);
        if (!m) return <React.Fragment key={i}>{t}</React.Fragment>;
        return (
          <span key={i} role="math" aria-label={`${m[1]} durch ${m[2]}`} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 2px", lineHeight: 1.1, fontSize: "0.9em" }}>
            <span style={{ padding: "0 3px 1px" }}>{m[1]}</span>
            <span style={{ borderTop: "1.5px solid currentColor", padding: "1px 3px 0" }}>{m[2]}</span>
          </span>
        );
      })}
    </>
  );
}

const THEMA_ZEICHEN = { plusminus: "+ −", multiplizieren: "7·8", potenzen: "12²", primzahlen: "13", primfaktoren: "2·3·7", division: "÷", bruchrechnen: "¾" };
const THEMA_NAME = { plusminus: "Plus und Minus", multiplizieren: "Multiplizieren", potenzen: "Quadrate und Wurzeln", primzahlen: "Primzahlen", primfaktoren: "Primfaktoren", division: "Schriftlich teilen", bruchrechnen: "Bruchrechnung" };

/* ---------------------------------------------------------------- Entdecken */
export function KopfEntdecken({ thema, setThema, onRechnen, onTraining }) {
  if (!thema) {
    return (
      <div>
        <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.6, margin: "0 2px 12px" }}>
          Zu jedem Thema ein kurzes Video und eine klare Anleitung: so gehst du Schritt für Schritt vor.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {KOPF_REIHENFOLGE.map((id) => (
            <button key={id} type="button" onClick={() => { setThema(id); try { springe("kopfmodi-thema", () => window.scrollTo(0, 0)); } catch (e) { /* egal */ } }} aria-label={`${THEMA_NAME[id]} entdecken`}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", textAlign: "left", fontFamily: "inherit", cursor: "pointer", color: C.tinte, ...karte, border: `1px solid ${C.linie}` }}>
              <span aria-hidden="true" style={{ flexShrink: 0, minWidth: 54, height: 44, padding: "0 6px", borderRadius: 12, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>{THEMA_ZEICHEN[id]}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, lineHeight: 1.25 }}>{THEMA_NAME[id]}</span>
                <span style={{ display: "block", fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.35, marginTop: 1 }}>{KOPF_VIDEO[id].unter}</span>
              </span>
              <span aria-hidden="true" style={{ color: C.see, fontSize: 18, fontWeight: 700 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  const e = KOPF_ERKLAERUNG[thema];
  const v = KOPF_VIDEO[thema];
  const i = KOPF_REIHENFOLGE.indexOf(thema);
  const weiter = KOPF_REIHENFOLGE[i + 1];
  return (
    <div data-kopf-entdecken={thema}>
      <Zurueck onClick={() => setThema(null)}>Alle Themen</Zurueck>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6 }}>{e.titel}</h2>
      <p style={{ fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 14 }}>{e.ziel}</p>

      <section aria-label="Video" style={{ ...karte, padding: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: C.see, margin: "0 2px 8px" }}>{v.titel}</p>
        <KopfVideo id={thema} />
      </section>

      <section style={{ ...karte, padding: 16, marginBottom: 16 }}>
        <Kicker>So gehst du vor</Kicker>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
          {e.schritte.map(([titel, text], k) => (
            <li key={titel} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: C.see, color: C.weiss, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{k + 1}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}><MitBruch text={titel} /></span>
                <span style={{ display: "block", fontSize: 14, color: C.grau, fontWeight: 400, lineHeight: 1.6, marginTop: 2 }}><MitBruch text={text} /></span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section style={{ ...karte, padding: 16, marginBottom: 16, border: `2px solid ${C.flaggold}` }}>
        <Kicker>Beispiel</Kicker>
        <p style={{ fontSize: 17, fontWeight: 800, color: C.tinte, marginBottom: 8 }}><MitBruch text={e.beispiel.aufgabe} /></p>
        <div style={{ display: "grid", gap: 4 }}>
          {e.beispiel.zeilen.map((z) => <p key={z} style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, margin: 0 }}><MitBruch text={z} /></p>)}
        </div>
      </section>

      <section style={{ ...karte, padding: 16, marginBottom: 16 }}>
        <Kicker>Typische Fehler</Kicker>
        <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc", color: C.tinte, fontSize: 14, lineHeight: 1.65 }}>
          {e.fehler.map((f) => <li key={f}><MitBruch text={f} /></li>)}
        </ul>
        <p style={{ marginTop: 12, marginBottom: 0, padding: "10px 12px", borderRadius: 12, background: C.himmel, color: C.seeTief, fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>Merke: {e.merk}</p>
      </section>

      <div style={{ display: "grid", gap: 10 }}>
        <Knopf onClick={() => onRechnen(thema)}>Selbst eingeben und vorrechnen lassen</Knopf>
        <Knopf haupt={false} onClick={() => onTraining(thema)}>Trainieren</Knopf>
        {weiter && <Knopf haupt={false} onClick={() => { setThema(weiter); try { springe("kopfmodi-thema", () => window.scrollTo(0, 0)); } catch (err) { /* egal */ } }}>Weiter: {THEMA_NAME[weiter]}</Knopf>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Rechnen */
export function KopfRechnen({ thema, setThema }) {
  const th = RECHNEN_THEMEN[thema];
  const startWerte = (id) => Object.fromEntries(RECHNEN_THEMEN[id].felder.map((f) => [f.id, String(f.start)]));
  const [werte, setWerte] = useState(() => startWerte(thema));
  const [gerechnet, setGerechnet] = useState(true);
  const waehle = (id) => { setThema(id); setWerte(startWerte(id)); setGerechnet(true); };
  const setze = (id, w) => { setWerte((x) => ({ ...x, [id]: w })); setGerechnet(true); };

  const zahlen = {};
  let leer = false;
  th.felder.forEach((f) => {
    if (f.zeige && !f.zeige(werte)) return;
    if (f.art === "zahl") {
      if (werte[f.id] === "" || werte[f.id] == null) leer = true;
      zahlen[f.id] = Number(werte[f.id]);
    } else zahlen[f.id] = werte[f.id];
  });
  const r = leer ? { ok: false, hinweis: "Fülle alle Felder aus." } : th.rechne(zahlen);

  const zufall = () => {
    const z = th.zufall(zahlen);
    setWerte((x) => ({ ...x, ...Object.fromEntries(Object.entries(z).map(([k, w]) => [k, String(w)])) }));
    setGerechnet(true);
  };

  return (
    <div data-kopf-rechnen={thema}>
      <div role="tablist" aria-label="Thema wählen" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {KOPF_REIHENFOLGE.map((id) => {
          const an = id === thema;
          return (
            <button key={id} type="button" role="tab" aria-selected={an} onClick={() => waehle(id)}
              style={{ minHeight: 40, padding: "6px 11px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{THEMA_NAME[id]}</button>
          );
        })}
      </div>

      <section style={{ ...karte, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 14, color: C.grau, fontWeight: 300, lineHeight: 1.55, margin: "0 0 12px" }}>{th.text}</p>
        <div style={{ display: "grid", gap: 10 }}>
          {th.felder.filter((f) => !f.zeige || f.zeige(werte)).map((f) => (
            f.art === "wahl" ? (
              <div key={f.id}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "0 0 4px" }}>{f.label}</p>
                <ModusLeiste label={f.label} modi={f.optionen} modus={werte[f.id]} setModus={(w) => setze(f.id, w)} />
              </div>
            ) : (
              <label key={f.id} style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.grau }}>{f.label}</span>
                <input type="text" inputMode="numeric" autoComplete="off" value={werte[f.id]} maxLength={f.stellen}
                  onChange={(ev) => setze(f.id, ev.target.value.replace(/\D/g, "").slice(0, f.stellen))}
                  style={{ minHeight: 48, padding: "8px 12px", borderRadius: 12, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 20, fontWeight: 800, color: C.tinte, background: C.sand, width: "100%", boxSizing: "border-box" }} />
              </label>
            )
          ))}
        </div>
        <div style={{ marginTop: 12 }}><Knopf haupt={false} onClick={zufall}>Zufällige Aufgabe</Knopf></div>
      </section>

      <section aria-live="polite" style={{ ...karte, padding: 16, marginBottom: 14, border: `2px solid ${r.ok ? C.flaggold : C.linie}` }}>
        {!r.ok || !gerechnet ? (
          <p style={{ fontSize: 14.5, color: C.grau, lineHeight: 1.6, margin: 0 }}>{r.hinweis || "Gib eine Aufgabe ein."}</p>
        ) : (
          <>
            <Kicker>Lösungsweg</Kicker>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {r.schritte.map((s, k) => (
                <li key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: C.see, color: C.weiss, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{k + 1}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14.5, color: C.tinte, lineHeight: 1.6 }}><MitBruch text={s.text} /></span>
                    {s.rechnung && <span style={{ display: "block", marginTop: 4, padding: "6px 10px", borderRadius: 10, background: C.himmel, color: C.seeTief, fontSize: 15, fontWeight: 700, lineHeight: 1.7, overflowWrap: "anywhere" }}><MitBruch text={s.rechnung} /></span>}
                  </span>
                </li>
              ))}
            </ol>
            <p style={{ margin: "14px 0 0", padding: "10px 12px", borderRadius: 12, background: C.seeTief, color: C.weiss, fontSize: 17, fontWeight: 800, lineHeight: 1.6, overflowWrap: "anywhere" }}>
              Ergebnis: <MitBruch text={r.ergebnis} />{r.gemischt ? <> = <MitBruch text={r.gemischt} /></> : null}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
