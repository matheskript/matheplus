import React, { useMemo, useState } from "react";
import { MatheFeld } from "./matheTastatur.jsx";
import { C } from "./base1.jsx";
import { ModusLeiste } from "./ui3.jsx";
import { karte, Kicker, Zurueck, Knopf } from "./funcHeadNumbersBasis.jsx";
import { KopfVideo, KOPF_VIDEO } from "./funcKopfVideo.jsx";
import { KOPF_ERKLAERUNG, KOPF_REIHENFOLGE } from "./kopfErklaerung.js";
import { RECHNEN_THEMEN } from "./kopfWeg.js";
import { uebenWeg, wahlZahl } from "./kopfUeben.js";
import { aufAnhieb } from "./uebenKern.js";
import { UEBEN_CSS, UebenFertig, UebenWahl } from "./funcUebenWahl.jsx";
import { buchen } from "./buchung.jsx";

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
export function KopfEntdecken({ thema, setThema, onRechnen, onUeben, onTraining }) {
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
        {onUeben && <Knopf haupt={false} onClick={() => onUeben(thema)}>Üben: Schritt für Schritt wählen</Knopf>}
        <Knopf haupt={false} onClick={() => onTraining(thema)}>Lernen: im Trainer rechnen</Knopf>
        {weiter && <Knopf haupt={false} onClick={() => { setThema(weiter); try { springe("kopfmodi-thema", () => window.scrollTo(0, 0)); } catch (err) { /* egal */ } }}>Weiter: {THEMA_NAME[weiter]}</Knopf>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Auto (vorrechnen) und Üben (Zwischenergebnisse wählen) */
/* modus "auto": die App zeigt den ganzen Lösungsweg. modus "ueben": Schritt für Schritt – jeder Schritt mit
   Zwischenergebnis wird zur Wahl aus goldenen Karten (kopfUeben.js), Erklärschritte laufen mit; am Ende Bilanz.
   onLernen: „Jetzt selbst rechnen“ → Trainer (Modus Lernen). */
export function KopfRechnen({ thema, setThema, modus = "auto", onLernen }) {
  const th = RECHNEN_THEMEN[thema];
  const startWerte = (id) => Object.fromEntries(RECHNEN_THEMEN[id].felder.map((f) => [f.id, String(f.start)]));
  const [werte, setWerte] = useState(() => startWerte(thema));
  const [gerechnet, setGerechnet] = useState(true);
  // Üben: Runde (neue Zahlen), Stand (Index des offenen Schritts in der Üben-Liste), falsche Karten je Schritt
  const [uebenRunde, setUebenRunde] = useState(0);
  const [uebenStand, setUebenStand] = useState(0);
  const [uebenFalsch, setUebenFalsch] = useState({});
  const uebenNeu = () => { setUebenRunde((r) => r + 1); setUebenStand(0); setUebenFalsch({}); };
  const waehle = (id) => { setThema(id); setWerte(startWerte(id)); setGerechnet(true); uebenNeu(); };
  const setze = (id, w) => { setWerte((x) => ({ ...x, [id]: w })); setGerechnet(true); uebenNeu(); };
  const ueben = modus === "ueben";

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
    uebenNeu();
  };

  /* Üben-Schritte aus dem Rechenweg; „info“-Schritte laufen von selbst mit, bis der nächste Wahl-Schritt kommt */
  const uebenSchritte = useMemo(() => (ueben && r.ok ? uebenWeg(r) : []), [ueben, r.ok, r.ergebnis, uebenRunde, thema]);   // eslint-disable-line react-hooks/exhaustive-deps
  const wahlen = uebenSchritte.filter((s) => s.art === "wahl");
  const nWahl = wahlen.length;
  const uebenFertig = ueben && nWahl > 0 && uebenStand >= nWahl;
  const aktuelleWahl = ueben && !uebenFertig ? wahlen[uebenStand] : null;
  // sichtbar: alles bis einschließlich des offenen Wahl-Schritts
  const sichtbarBis = aktuelleWahl ? uebenSchritte.indexOf(aktuelleWahl) : uebenSchritte.length - 1;
  const uebenAnhieb = aufAnhieb(uebenFalsch, Math.min(uebenStand, nWahl));
  const uebenWaehle = (o) => {
    if (!aktuelleWahl) return;
    const schon = uebenFalsch[uebenStand] || [];
    if (!o.richtig) { if (!schon.includes(o.key)) setUebenFalsch({ ...uebenFalsch, [uebenStand]: [...schon, o.key] }); return; }
    const neu = uebenStand + 1;
    setUebenStand(neu);
    if (neu === nWahl) buchen({ richtig: aufAnhieb(uebenFalsch, nWahl) === nWahl, gruppe: "kopf-ueben", art: thema });
  };

  return (
    <div data-kopf-rechnen={thema} data-kopf-modus={modus}>
      {ueben && <style>{UEBEN_CSS}</style>}
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
                <MatheFeld modus="ganz" value={werte[f.id]} maxLength={f.stellen}
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
        ) : ueben ? (
          <div data-kopf-ueben-weg>
            <Kicker>Dein Lösungsweg</Kicker>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {uebenSchritte.slice(0, sichtbarBis + 1).map((s, k) => {
                const offen = s === aktuelleWahl;
                const nr = uebenSchritte.indexOf(s) + 1;
                return (
                  <li key={`${uebenRunde}-${k}`} style={{ display: "flex", gap: 12, alignItems: "flex-start" }} data-kopf-ueben-schritt={offen ? "offen" : "fertig"}>
                    <span aria-hidden="true" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: offen ? C.flaggold : s.art === "wahl" ? C.smaragd : C.see, color: offen ? C.seeTief : C.weiss, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{s.art === "wahl" && !offen ? "✓" : nr}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {offen ? (
                        <>
                          <span className="uw-ziel" data-ueben-ziel style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 46, padding: "6px 12px", borderRadius: 12, fontSize: 15, fontWeight: 700, color: C.tinte }}>
                            <span style={{ fontWeight: 400, color: C.grau }}>Zwischenergebnis</span><span className="uw-platz" style={{ fontSize: 18 }}>?</span>
                          </span>
                          <div style={{ marginTop: 10 }}>
                            <UebenWahl schritt={s} nr={uebenStand + 1} gesamt={nWahl} frage={s.frage} falsch={uebenFalsch[uebenStand] || []} onWahl={uebenWaehle}
                              inhalt={(w) => <span style={{ fontWeight: 700 }}><MitBruch text={w.text} /></span>} />
                          </div>
                        </>
                      ) : (
                        <>
                          <span style={{ display: "block", fontSize: 14.5, color: C.tinte, lineHeight: 1.6 }}><MitBruch text={s.text} /></span>
                          {s.rechnung && <span style={{ display: "block", marginTop: 4, padding: "6px 10px", borderRadius: 10, background: s.art === "wahl" ? "#EEF8F2" : C.himmel, color: C.seeTief, fontSize: 15, fontWeight: 700, lineHeight: 1.7, overflowWrap: "anywhere" }}><MitBruch text={s.rechnung} /></span>}
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
            {uebenFertig && (
              <>
                <p style={{ margin: "14px 0 0", padding: "10px 12px", borderRadius: 12, background: C.seeTief, color: C.weiss, fontSize: 17, fontWeight: 800, lineHeight: 1.6, overflowWrap: "anywhere" }}>
                  Ergebnis: <MitBruch text={r.ergebnis} />{r.gemischt ? <> = <MitBruch text={r.gemischt} /></> : null}
                </p>
                <UebenFertig anhieb={uebenAnhieb} gesamt={nWahl} onLernen={onLernen ? () => onLernen(thema) : undefined} onNeu={zufall} neuText="Neue Aufgabe" lernenText="Jetzt selbst rechnen"
                  leise="Nächste Stufe: Im Trainer rechnest du solche Aufgaben ganz allein – ohne Auswahl, auf Zeit." />
              </>
            )}
          </div>
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
