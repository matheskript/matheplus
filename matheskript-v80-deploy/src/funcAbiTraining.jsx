/* ============================================================
   Abi-Training im Prüfungsformat (Teil A, ohne Hilfsmittel)
   · AbiAufgabenSeite: eine 5-BE-Aufgabe aus dem Generator, Uhr (3 Minuten je BE),
     Selbstkorrektur am Erwartungshorizont oder Foto an Mia, Ergebnis in training.abi
   · AbiTeilASeite: Teil-A-Probe wie im Leistungsfach BW – P1–P4 Pflicht, aus W1–W6 zwei wählen,
     30 BE, Abgabe spätestens nach 110 Minuten; der Stand überlebt ein Neuladen (localStorage)
   Aufgaben: abiGeneratoren.js. Gestaltung: abiStil.jsx.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "./func3.jsx";
import { springe } from "./sprung.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { AbiSeite, AbiKopf, BeBalken, Pfeil, MiaEmblem, zeitText, GOLD, SCHWARZ, PRAEG } from "./abiStil.jsx";
import { useAbi, abiErgebnisSpeichern, abiProbeSpeichern, uebergabeHolen, uebergabeSetzen, UEBERGABE } from "./funcAbiDaten.jsx";
import { AUFGABEN_TYPEN, SACHGEBIETE, aufgabeErzeugen, neuerSeed, teilAProbe, typ as typVon, typenIn } from "./abiGeneratoren.js";
import { schwaechstesGebiet, minutenFuer, PRUEFUNGEN } from "./abiZentrum.js";

const GEBIETE = ["analysis", "geometrie", "stochastik"];
const zurueckZentrum = (gehe) => ({ text: "Abi-Zentrum", onClick: () => gehe({ ansicht: "abi" }) });

/* ---------- Bausteine ---------- */
export function AufgabeKarte({ a, nr, rechts, kennung }) {
  return (
    <article className="abi-karte" style={{ padding: "18px 18px 14px" }} {...kennung}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {nr && <span className="abi-be" style={{ background: GOLD, color: SCHWARZ }}>{nr}</span>}
        <span className="abi-eyebrow" style={{ margin: 0 }}>{SACHGEBIETE[a.sachgebiet].name} · {a.titel}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>{rechts}<span className="abi-be">{a.be} BE</span></span>
      </div>
      <Text s={a.einleitung} style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.75, color: "#1B1606" }} />
      <ol style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
        {a.teile.map((t) => (
          <li key={t.b} style={{ display: "grid", gridTemplateColumns: "26px 1fr auto", gap: 8, alignItems: "baseline", padding: "8px 0", borderTop: "1px solid var(--abi-linie)" }}>
            <b style={{ fontSize: 15 }}>{t.b})</b>
            <Text s={t.text} style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7 }} />
            <span className="abi-klein" style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{t.be} BE</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

/* Selbstkorrektur: je Zeile des Erwartungshorizonts abhaken */
function Erwartung({ a, haken, setze }) {
  const summe = a.erwartung.reduce((s, e, i) => s + (haken.has(i) ? e.be : 0), 0);
  return (
    <div className="abi-karte dunkel" data-abi-erwartung>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <span className="abi-eyebrow">Erwartungshorizont</span>
        <b style={{ fontSize: 22, color: GOLD }} aria-live="polite">{summe} / {a.be} BE</b>
      </div>
      <p className="abi-klein" style={{ marginTop: 6 }}>Hak ab, was so auf deinem Blatt steht. Ein anderer richtiger Weg zählt genauso. Folgefehler: Hast du mit einem falschen Zwischenergebnis richtig weitergerechnet, gibt es die BE danach trotzdem.</p>
      {a.teile.map((t) => (
        <div key={t.b} style={{ marginTop: 12 }}>
          <span className="abi-klein" style={{ fontWeight: 800, color: GOLD }}>Teil {t.b}) · {t.be} BE</span>
          {a.erwartung.map((e, i) => e.teil === t.b && (
            <label key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr auto", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(237,187,0,0.16)", cursor: "pointer" }}>
              <input type="checkbox" checked={haken.has(i)} onChange={() => setze(i)} style={{ width: 20, height: 20, accentColor: GOLD }} data-abi-haken={i} />
              <Text s={e.text} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#fff" }} />
              <span className="abi-be" style={{ background: "rgba(237,187,0,0.16)" }}>{e.be} BE</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function useUhr(laeuft, start) {
  const [jetzt, setJetzt] = useState(Date.now());
  useEffect(() => {
    if (!laeuft) return undefined;
    const t = setInterval(() => setJetzt(Date.now()), 1000);
    return () => clearInterval(t);
  }, [laeuft]);
  return Math.max(0, Math.floor(((laeuft ? jetzt : Date.now()) - start) / 1000));
}

/* ---------- Einzelne Abi-Aufgabe ---------- */
function startTyp(abi) {
  const w = uebergabeHolen(UEBERGABE.typ);
  if (typeof w === "string" && w.startsWith("gebiet:")) {
    const liste = typenIn(w.slice(7));
    if (liste.length) return liste[Math.floor(Math.random() * liste.length)].id;
  }
  if (typeof w === "string" && typVon(w)) return w;
  const liste = typenIn(schwaechstesGebiet(abi));
  return liste[Math.floor(Math.random() * liste.length)].id;
}

export function AbiAufgabenSeite({ gehe }) {
  const abi = useAbi();
  const [typId, setTypId] = useState(() => startTyp(abi));
  const [seed, setSeed] = useState(() => neuerSeed());
  const [phase, setPhase] = useState("rechnen");   // rechnen | pruefen | fertig
  const [start, setStart] = useState(() => Date.now());
  const [dauer, setDauer] = useState(0);
  const [haken, setHaken] = useState(() => new Set());
  const [kurzAuf, setKurzAuf] = useState(false);
  const a = useMemo(() => aufgabeErzeugen(typId, seed), [typId, seed]);
  const sek = useUhr(phase === "rechnen", start);
  const ziel = minutenFuer(a.be) * 60;
  const t = typVon(typId);
  const gebiet = t.sachgebiet;
  const summe = a.erwartung.reduce((s, e, i) => s + (haken.has(i) ? e.be : 0), 0);
  const kopfRef = useRef(null);

  const neu = (id = typId, oben = false) => {
    setTypId(id); setSeed(neuerSeed()); setPhase("rechnen"); setStart(Date.now()); setHaken(new Set()); setKurzAuf(false);
    if (oben) springe("abi-aufgabe", () => kopfRef.current?.scrollIntoView({ block: "start" }));
  };
  const pruefen = () => { setDauer(sek); setPhase("pruefen"); };
  const eintragen = () => { abiErgebnisSpeichern({ typ: a.typ, sachgebiet: a.sachgebiet, be: summe, max: a.be, quelle: "selbst", sekunden: dauer }); setPhase("fertig"); };
  const zuMia = (modus) => { uebergabeSetzen(UEBERGABE.mia, { typ: a.typ, seed: a.seed }); uebergabeSetzen(UEBERGABE.miaModus, modus); gehe({ ansicht: "mia" }); };
  const umschalten = (i) => setHaken((h) => { const n = new Set(h); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <AbiSeite kennung={{ "data-abi-aufgabenseite": "" }}>
      <div ref={kopfRef} />
      <AbiKopf kompakt breite={820} zurueck={zurueckZentrum(gehe)} eyebrow={`Abi-Aufgabe · ${SACHGEBIETE[gebiet].name}`} titel={t.titel} id="abi-kopf-aufgabe"
        rechts={<>
          <span className="abi-countdown" style={{ padding: "8px 14px" }} aria-label={`Zeit ${zeitText(phase === "rechnen" ? sek : dauer)}`}><b style={{ fontSize: 24, color: (phase === "rechnen" ? sek : dauer) > ziel ? "#FF8FA3" : GOLD }}>{zeitText(phase === "rechnen" ? sek : dauer)}</b><span>von {minutenFuer(a.be)}:00</span></span>
          <span className="abi-pille">Ohne Hilfsmittel</span>
        </>} />
      <div className="abi-innen" style={{ maxWidth: 820 }}>
        <div style={{ marginTop: 18 }}>
          <div className="abi-reiter" role="tablist" aria-label="Sachgebiet">
            {GEBIETE.map((g) => (
              <button key={g} type="button" role="tab" aria-selected={g === gebiet} onClick={() => g !== gebiet && neu(typenIn(g)[0].id)}>{SACHGEBIETE[g].name}</button>
            ))}
          </div>
          <div className="abi-chips" style={{ marginTop: 10 }}>
            {typenIn(gebiet).map((x) => <button key={x.id} type="button" className="abi-chip" aria-pressed={x.id === typId} onClick={() => neu(x.id)}>{x.titel}</button>)}
          </div>
        </div>

        <div style={{ marginTop: 16 }}><AufgabeKarte a={a} kennung={{ "data-abi-aufgabe": a.typ }} /></div>

        {phase === "rechnen" && (
          <div className="abi-raster zwei" style={{ marginTop: 14 }}>
            <button type="button" className="abi-knopf gold breit" onClick={pruefen} data-abi-fertig style={{ minHeight: 56 }}>Fertig – Erwartungshorizont zeigen<Pfeil /></button>
            <button type="button" className="abi-knopf dunkel breit" onClick={() => zuMia("korrigieren")} data-abi-zu-mia style={{ minHeight: 56 }}><MiaEmblem groesse={30} id="mia-knopf" />Foto an Mia: korrigieren lassen</button>
            <button type="button" className="abi-knopf rand breit" onClick={() => zuMia("fragen")}>Mia um einen Hinweis bitten</button>
            <button type="button" className="abi-knopf rand breit" onClick={() => neu(typId, true)}>Andere Aufgabe</button>
          </div>
        )}
        {phase === "rechnen" && <p className="abi-klein" style={{ marginTop: 12 }}>Auf Papier rechnen, wie in der Prüfung: ein Schritt pro Zeile, Ergebnis unterstreichen. Richtwert: {minutenFuer(a.be)} Minuten.</p>}

        {phase !== "rechnen" && (
          <div style={{ marginTop: 14 }}>
            <Erwartung a={a} haken={haken} setze={phase === "pruefen" ? umschalten : () => {}} />
            <button type="button" className="abi-knopf rand klein" style={{ marginTop: 10 }} onClick={() => setKurzAuf(!kurzAuf)} aria-expanded={kurzAuf}>{kurzAuf ? "Ergebnisse ausblenden" : "Nur die Ergebnisse zeigen"}</button>
            {kurzAuf && <div className="abi-karte" style={{ marginTop: 10 }}>{a.kurz.map((k, i) => <Text key={i} s={k} style={{ margin: i ? "6px 0 0" : 0, fontSize: 15, lineHeight: 1.7 }} />)}</div>}
          </div>
        )}
        {phase === "pruefen" && (
          <div className="abi-raster zwei" style={{ marginTop: 14 }}>
            <button type="button" className="abi-knopf gold breit" onClick={eintragen} data-abi-eintragen style={{ minHeight: 54 }}>{summe} von {a.be} BE eintragen<Pfeil /></button>
            <button type="button" className="abi-knopf dunkel breit" onClick={() => zuMia("korrigieren")} style={{ minHeight: 54 }}>Lieber Mia korrigieren lassen</button>
          </div>
        )}
        {phase === "fertig" && (
          <div className="abi-karte gold" style={{ marginTop: 14 }} data-abi-ergebnis>
            <span className="abi-eyebrow">Eingetragen</span>
            <h3 style={{ marginTop: 4, fontSize: 24 }}>{summe} von {a.be} BE in {zeitText(dauer)}</h3>
            <p className="abi-text" style={{ marginTop: 6 }}>
              {summe === a.be ? (dauer <= ziel ? "Volle BE in der Zeit – so sieht Prüfungsniveau aus." : "Volle BE. Jetzt noch schneller: Ziel sind drei Minuten je BE.")
                : summe >= 3 ? "Solide. Schau dir an, welche Zeile gefehlt hat – genau dort liegt dein nächster BE-Punkt."
                  : "Hier lohnt sich der Trainer: erst die Methode sicher, dann wieder im Prüfungsformat."}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button type="button" className="abi-knopf dunkel" onClick={() => neu(typId, true)} data-abi-naechste>Nächste Aufgabe<Pfeil /></button>
              {WERKZEUGE[t.trainer] && <button type="button" className="abi-knopf rand" onClick={() => gehe(WERKZEUGE[t.trainer].ziel)}>Trainer: {WERKZEUGE[t.trainer].name}</button>}
            </div>
          </div>
        )}
      </div>
    </AbiSeite>
  );
}

/* ---------- Teil-A-Probe ---------- */
const PROBE_SCHLUESSEL = "mm-abi-probe";
const MINUTEN = PRUEFUNGEN["bw-lf"].teilA.abgabeSpaetestens;
const probeLesen = () => { try { const r = JSON.parse(localStorage.getItem(PROBE_SCHLUESSEL) || "null"); return r && r.seed ? r : null; } catch (e) { return null; } };
const probeSchreiben = (z) => { try { if (z) localStorage.setItem(PROBE_SCHLUESSEL, JSON.stringify(z)); else localStorage.removeItem(PROBE_SCHLUESSEL); } catch (e) { /* privat */ } };

export function AbiTeilASeite({ gehe }) {
  const gruppenSeed = useMemo(() => uebergabeHolen(UEBERGABE.probeSeed), []);
  const [z, setZRoh] = useState(() => probeLesen() || { phase: "start", seed: gruppenSeed || neuerSeed(), gruppe: !!gruppenSeed, wahl: [], haken: {}, start: 0, ende: 0 });
  const setZ = (f) => setZRoh((alt) => { const neu = typeof f === "function" ? f(alt) : f; probeSchreiben(neu.phase === "start" ? null : neu); return neu; });
  const probe = useMemo(() => teilAProbe(z.seed), [z.seed]);
  const sek = useUhr(z.phase === "laeuft", z.start || Date.now());
  const rest = MINUTEN * 60 - sek;
  const kopfRef = useRef(null);
  const nachOben = () => setTimeout(() => springe("abi-probe", () => kopfRef.current?.scrollIntoView({ block: "start" })), 0);

  useEffect(() => { if (z.phase === "laeuft" && rest <= 0) setZ((a) => ({ ...a, phase: "korrektur", ende: a.start + MINUTEN * 60000, auto: true })); }, [rest, z.phase]);

  const bearbeitet = [...probe.pflicht, ...probe.wahl.filter((w) => z.wahl.includes(w.nr))];
  const beVon = (a) => a.erwartung.reduce((s, e, i) => s + ((z.haken[a.nr] || []).includes(i) ? e.be : 0), 0);
  const gesamt = bearbeitet.reduce((s, a) => s + beVon(a), 0);
  const wahlUm = (nr) => setZ((a) => ({ ...a, wahl: a.wahl.includes(nr) ? a.wahl.filter((x) => x !== nr) : a.wahl.length >= 2 ? a.wahl : [...a.wahl, nr] }));
  const hakUm = (nr, i) => setZ((a) => { const l = a.haken[nr] || []; return { ...a, haken: { ...a.haken, [nr]: l.includes(i) ? l.filter((x) => x !== i) : [...l, i] } }; });
  const auswerten = () => {
    const sekunden = Math.round(((z.ende || Date.now()) - z.start) / 1000);
    bearbeitet.forEach((a) => abiErgebnisSpeichern({ typ: a.typ, sachgebiet: a.sachgebiet, be: beVon(a), max: a.be, quelle: "probe" }));
    abiProbeSpeichern({ art: "teila", be: gesamt, max: 30, sekunden });
    setZ((a) => ({ ...a, phase: "ergebnis", sekunden }));
    nachOben();
  };
  const neueProbe = () => { setZ({ phase: "start", seed: neuerSeed(), gruppe: false, wahl: [], haken: {}, start: 0, ende: 0 }); nachOben(); };

  return (
    <AbiSeite kennung={{ "data-abi-teila": z.phase }}>
      <div ref={kopfRef} />
      <AbiKopf kompakt breite={860} zurueck={zurueckZentrum(gehe)} eyebrow={z.gruppe ? `Gruppensatz ${z.seed}` : "Leistungsfach · Teil A"} titel="Teil-A-Probe" id="abi-kopf-probe"
        zeile={z.phase === "start" ? "Zehn Aufgaben, sechs bearbeiten, 30 BE – ohne Hilfsmittel, Abgabe spätestens nach 110 Minuten." : null}
        rechts={z.phase === "laeuft" ? (
          <span className="abi-countdown" data-abi-restzeit><b style={{ color: rest < 600 ? "#FF8FA3" : GOLD }}>{zeitText(rest)}</b><span>bis zur Abgabe</span></span>
        ) : null} />
      <div className="abi-innen" style={{ maxWidth: 860 }}>
        {z.phase === "start" && (
          <div className="abi-raster zwei" style={{ marginTop: 22 }}>
            <div className="abi-karte">
              <span className="abi-eyebrow">So läuft es</span>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 15, lineHeight: 1.7 }}>
                <li><b>P1 bis P4</b> sind Pflicht: zweimal Analysis, Geometrie, Stochastik.</li>
                <li>Aus <b>W1 bis W6</b> wählst du zwei.</li>
                <li>Je 5 BE, zusammen 30 BE. Kein Rechner, keine Formelsammlung.</li>
                <li>Nach {MINUTEN} Minuten wird abgegeben – die Uhr läuft weiter, auch wenn du die Seite schließt.</li>
                <li>Danach korrigierst du selbst am Erwartungshorizont – oder fotografierst einzelne Aufgaben für Mia.</li>
              </ul>
            </div>
            <div className="abi-karte gold" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="abi-eyebrow">Bereit?</span>
              <p className="abi-text">Leg Blankopapier und einen schwarzen Stift hin, Handy weg (außer für die Uhr). Wie am Prüfungstag.</p>
              {z.gruppe && <p className="abi-text"><b>Gruppensatz:</b> Alle in deiner Lerngruppe bekommen genau diese zehn Aufgaben – danach vergleicht ihr.</p>}
              <button type="button" className="abi-knopf dunkel breit" style={{ marginTop: "auto", minHeight: 56 }} data-abi-probe-start
                onClick={() => { setZ((a) => ({ ...a, phase: "laeuft", start: Date.now() })); nachOben(); }}>Probe starten · {MINUTEN} Minuten<Pfeil /></button>
            </div>
          </div>
        )}

        {z.phase === "laeuft" && (
          <>
            <h2 className="abi-h2" style={{ marginTop: 26 }}>Pflichtaufgaben</h2>
            <span className="abi-strich" aria-hidden="true" />
            <div style={{ display: "grid", gap: 12 }}>{probe.pflicht.map((a) => <AufgabeKarte key={a.nr} a={a} nr={a.nr} />)}</div>
            <h2 className="abi-h2" style={{ marginTop: 30 }}>Wahlaufgaben · zwei auswählen</h2>
            <span className="abi-strich" aria-hidden="true" />
            <p className="abi-klein" style={{ marginBottom: 10 }}>{z.wahl.length} von 2 gewählt{z.wahl.length ? `: ${z.wahl.join(", ")}` : ""}.</p>
            <div style={{ display: "grid", gap: 12 }}>
              {probe.wahl.map((a) => {
                const an = z.wahl.includes(a.nr);
                const voll = !an && z.wahl.length >= 2;
                return (
                  <div key={a.nr} style={{ opacity: voll ? 0.55 : 1 }}>
                    <AufgabeKarte a={a} nr={a.nr} rechts={
                      <button type="button" className="abi-chip" aria-pressed={an} disabled={voll} onClick={() => wahlUm(a.nr)} data-abi-wahl={a.nr}>{an ? "Gewählt" : "Wählen"}</button>
                    } />
                  </div>
                );
              })}
            </div>
            <div className="abi-karte dunkel" style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
              <p className="abi-text" style={{ margin: 0 }}>{z.wahl.length < 2 ? "Wähle noch zwei Wahlaufgaben, dann abgeben." : "Fertig? Dann gib ab – korrigiert wird danach."}</p>
              <button type="button" className="abi-knopf gold" disabled={z.wahl.length < 2} data-abi-abgeben
                onClick={() => { setZ((a) => ({ ...a, phase: "korrektur", ende: Date.now() })); nachOben(); }}>Abgeben<Pfeil /></button>
            </div>
          </>
        )}

        {z.phase === "korrektur" && (
          <>
            {z.auto && <p className="abi-hinweis" style={{ marginTop: 20 }}>Die {MINUTEN} Minuten sind um – wie in der Prüfung wird jetzt abgegeben.</p>}
            {z.wahl.length < 2 && <p className="abi-hinweis" style={{ marginTop: 12 }}>Du hattest noch keine zwei Wahlaufgaben gewählt – gewertet werden die Pflichtaufgaben{z.wahl.length ? ` und ${z.wahl.join(", ")}` : ""}.</p>}
            <div className="abi-karte gold" style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div><span className="abi-eyebrow">Selbstkorrektur</span><h3 style={{ marginTop: 4, fontSize: 24 }} aria-live="polite">{gesamt} von {bearbeitet.length * 5} BE</h3></div>
              <button type="button" className="abi-knopf dunkel" onClick={auswerten} data-abi-auswerten>Auswerten<Pfeil /></button>
            </div>
            {bearbeitet.map((a) => (
              <div key={a.nr} style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <AufgabeKarte a={a} nr={a.nr} />
                <Erwartung a={a} haken={new Set(z.haken[a.nr] || [])} setze={(i) => hakUm(a.nr, i)} />
              </div>
            ))}
            <button type="button" className="abi-knopf gold breit" style={{ marginTop: 18, minHeight: 56 }} onClick={auswerten}>Auswerten · {gesamt} BE<Pfeil /></button>
          </>
        )}

        {z.phase === "ergebnis" && (
          <>
            <div className="abi-karte gold" style={{ marginTop: 22 }} data-abi-probe-ergebnis>
              <span className="abi-eyebrow">Teil-A-Probe</span>
              <h3 style={{ marginTop: 6, fontSize: "clamp(30px, 8vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em" }}>{gesamt} von 30 BE</h3>
              <div style={{ margin: "12px 0 6px", maxWidth: 420 }}><BeBalken be={gesamt} max={30} label={`${gesamt} von 30 BE`} /></div>
              <p className="abi-text">{Math.round((gesamt / 30) * 100)} % der BE in {zeitText(z.sekunden || 0)}. {gesamt >= 24 ? "Starkes Fundament für Teil B." : gesamt >= 15 ? "Die Hälfte sitzt – jetzt gezielt die schwachen Typen." : "Teil A ist das Fundament: erst die Pflichttypen mit den Trainern sicher machen."}</p>
            </div>
            <div className="abi-karte" style={{ marginTop: 14 }}>
              {bearbeitet.map((a) => (
                <div key={a.nr} style={{ display: "grid", gridTemplateColumns: "46px 1fr 70px", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--abi-linie)" }}>
                  <span className="abi-be" style={{ background: GOLD, color: SCHWARZ }}>{a.nr}</span>
                  <span style={{ minWidth: 0 }}><b style={{ display: "block", fontSize: 14.5 }}>{a.titel}</b><BeBalken be={beVon(a)} max={a.be} label={`${a.nr}: ${beVon(a)} von ${a.be} BE`} /></span>
                  <b style={{ textAlign: "right", color: beVon(a) === a.be ? PRAEG : SCHWARZ }}>{beVon(a)} / {a.be}</b>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" className="abi-knopf dunkel" onClick={neueProbe}>Neue Probe<Pfeil /></button>
              <button type="button" className="abi-knopf rand" onClick={() => { uebergabeSetzen(UEBERGABE.miaModus, "fragen"); gehe({ ansicht: "mia" }); }}>Mit Mia besprechen</button>
              <button type="button" className="abi-knopf rand" onClick={() => { probeSchreiben(null); gehe({ ansicht: "abi" }); }}>Zum Abi-Zentrum</button>
            </div>
          </>
        )}
      </div>
    </AbiSeite>
  );
}

export const ALLE_TYPEN = AUFGABEN_TYPEN.length;
