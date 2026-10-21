/* ============================================================
   LERNPARTNER-BÖRSE fürs Abi (im Abi-Zentrum, Gold)
   Abiturienten derselben Stadt und desselben Jahrgangs finden sich – auch über Schulgrenzen –
   und bilden Lerngruppen (höchstens 6). Kein Chat, keine Kontaktdaten: Steckbrief, Anfrage mit
   Zeit und Treffpunkt-Art, Treffen an öffentlichen Orten, Melden und Blockieren.
   Minderjährige brauchen die Freigabe eines verbundenen Elternteils; Eltern geben sie hier.
   Ohne Konto (oder solange supabase/lernpartner.sql fehlt) läuft ein Beispielmodus ohne Datenbank.
   Logik: lernpartner.js. Datenbank: supabase/lernpartner.sql. Gestaltung: abiStil.jsx.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sb, DEMO, useKonto, istTestkonto } from "./konto.js";
import { volljaehrigErklaeren } from "./kontoRollen.js";
import { AbiSeite, AbiKopf, Abschnitt, Pfeil, GOLD, SCHWARZ, PRAEG } from "./abiStil.jsx";
import { useAbi, uebergabeSetzen, UEBERGABE } from "./funcAbiDaten.jsx";
import { niveauWorte } from "./abiZentrum.js";
import {
  BEREICHE, ZEITEN, ORTE, MELDEGRUENDE, BEREICH_NAME, ZEIT_NAME, ORT_NAME, MAX_GRUPPE, GRUENDE, SICHER_TREFFEN,
  passungGruende, vorschlag, steckbriefVorlage, steckbriefFehler, meldung, ortNameOk, terminText,
  BEISPIEL_ICH, beispielTreffer, beispielGruppe, lpApi,
} from "./lernpartner.js";

const NIVEAU_KURZ = { erhoeht: "erhöhtes Niveau", grundlegend: "grundlegendes Niveau" };
const THEMEN = [["teila", "Teil A ohne Hilfsmittel"], ["analysis", "Analysis"], ["geometrie", "Geometrie"], ["stochastik", "Stochastik"], ["muendlich", "Mündliche Prüfung"]];

/* ---------- Bausteine ---------- */
function Mehrfach({ werte, wahl, setze, name }) {
  return (
    <div className="abi-chips" role="group" aria-label={name}>
      {werte.map((w) => {
        const an = wahl.includes(w.id);
        return <button key={w.id} type="button" className="abi-chip" aria-pressed={an} onClick={() => setze(an ? wahl.filter((x) => x !== w.id) : [...wahl, w.id])}>{w.name}</button>;
      })}
    </div>
  );
}
function Nachricht({ text, art = "hinweis" }) {
  if (!text) return null;
  return <p role="status" className={art === "warn" ? "abi-warn" : "abi-hinweis"} style={{ marginTop: 12 }}>{text}</p>;
}
function Avatar({ name, gold }) {
  return (
    <span aria-hidden="true" style={{ width: 44, height: 44, flex: "none", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900,
      background: gold ? "linear-gradient(150deg, #FFE9A0, #EDBB00 60%, #B58612)" : SCHWARZ, color: gold ? SCHWARZ : GOLD }}>{String(name || "?").slice(0, 1).toUpperCase()}</span>
  );
}

function SicherKarte() {
  return (
    <div className="abi-karte dunkel" data-lp-sicher>
      <span className="abi-eyebrow">Sicher treffen</span>
      <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "rgba(255,255,255,0.86)", fontSize: 14.5, lineHeight: 1.65 }}>
        {SICHER_TREFFEN.map((s) => <li key={s}>{s}</li>)}
      </ul>
    </div>
  );
}

/* ---------- Steckbrief ---------- */
function SteckbriefForm({ wert, speichern, loeschen, neu }) {
  const [s, setS] = useState(wert);
  const [msg, setMsg] = useState(null);
  const [frage, setFrage] = useState(false);
  useEffect(() => setS(wert), [wert]);
  const feld = (k, v) => setS((a) => ({ ...a, [k]: v }));
  const fehler = steckbriefFehler(s);
  const worte = niveauWorte("BW");
  const ab = async () => {
    if (fehler) { setMsg({ text: meldung(fehler), art: "warn" }); return; }
    const r = await speichern(s);
    setMsg(r === "ok" ? { text: neu ? "Steckbrief steht – jetzt Lernpartner finden." : "Gespeichert." } : { text: meldung(r), art: "warn" });
  };
  return (
    <div className="abi-karte" data-lp-steckbrief>
      <span className="abi-eyebrow">{neu ? "Schritt 1" : "Dein Steckbrief"}</span>
      <h3 style={{ marginTop: 4 }}>{neu ? "Wer bist du – fürs Lernen?" : "So sehen dich andere"}</h3>
      <p className="abi-text" style={{ marginTop: 6 }}>Nur Vorname, Stadt und was du kannst oder suchst. Keine Nummer, kein Instagram, keine Adresse – die App vermittelt das Treffen.</p>
      <div className="abi-raster zwei" style={{ marginTop: 14 }}>
        <label className="abi-feld"><span>Vorname oder Spitzname</span><input value={s.anzeigename} maxLength={20} onChange={(e) => feld("anzeigename", e.target.value)} autoComplete="given-name" /></label>
        <label className="abi-feld"><span>Stadt</span><input value={s.stadt} maxLength={60} onChange={(e) => feld("stadt", e.target.value)} placeholder="z. B. Stuttgart" autoComplete="address-level2" /></label>
        <label className="abi-feld"><span>Abi-Jahr</span>
          <select value={s.abi_jahr} onChange={(e) => feld("abi_jahr", Number(e.target.value))}>{[2026, 2027, 2028, 2029, 2030].map((j) => <option key={j} value={j}>{j}</option>)}</select>
        </label>
        <label className="abi-feld"><span>Kurs</span>
          <select value={s.niveau} onChange={(e) => feld("niveau", e.target.value)}><option value="erhoeht">{worte.erhoeht} / LK</option><option value="grundlegend">{worte.grundlegend} / GK</option></select>
        </label>
        <label className="abi-feld"><span>Schule (freiwillig)</span><input value={s.schule || ""} maxLength={80} onChange={(e) => feld("schule", e.target.value)} placeholder="z. B. Hegel-Gymnasium" /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, alignSelf: "end", minHeight: 46, cursor: "pointer" }}>
          <input type="checkbox" checked={!!s.schule_zeigen} disabled={!s.schule} onChange={(e) => feld("schule_zeigen", e.target.checked)} style={{ width: 20, height: 20, accentColor: GOLD }} />Schule im Steckbrief zeigen
        </label>
      </div>
      <div style={{ marginTop: 16 }}><span className="abi-feld"><span>Ich kann helfen bei</span></span><Mehrfach name="Ich kann helfen bei" werte={BEREICHE} wahl={s.helfen} setze={(v) => feld("helfen", v)} /></div>
      <div style={{ marginTop: 14 }}><span className="abi-feld"><span>Ich suche Hilfe bei</span></span><Mehrfach name="Ich suche Hilfe bei" werte={BEREICHE} wahl={s.suchen} setze={(v) => feld("suchen", v)} /></div>
      <div style={{ marginTop: 14 }}><span className="abi-feld"><span>Wann kannst du?</span></span><Mehrfach name="Zeiten" werte={ZEITEN} wahl={s.zeiten} setze={(v) => feld("zeiten", v)} /></div>
      <div style={{ marginTop: 14 }}><span className="abi-feld"><span>Wo triffst du dich gern?</span></span><Mehrfach name="Treffpunkte" werte={ORTE} wahl={s.orte} setze={(v) => feld("orte", v)} /></div>
      {!neu && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          <input type="checkbox" checked={s.aktiv !== false} onChange={(e) => feld("aktiv", e.target.checked)} style={{ width: 20, height: 20, accentColor: GOLD }} />Sichtbar für andere (aus = Pause)
        </label>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <button type="button" className="abi-knopf dunkel" onClick={ab} data-lp-speichern>{neu ? "Steckbrief anlegen" : "Speichern"}<Pfeil /></button>
        {!neu && loeschen && !frage && <button type="button" className="abi-knopf rand" onClick={() => setFrage(true)}>Steckbrief löschen</button>}
        {frage && <button type="button" className="abi-knopf rand" style={{ color: "#A50044" }} onClick={async () => { setFrage(false); await loeschen(); }}>Wirklich löschen – alle Gruppen verlassen</button>}
      </div>
      <Nachricht text={msg && msg.text} art={msg && msg.art} />
    </div>
  );
}

/* ---------- Treffer ---------- */
function TrefferKarte({ ich, t, gruppen, anfragen }) {
  const [auf, setAuf] = useState(false);
  const v = vorschlag(ich, t);
  const [zeit, setZeit] = useState(v.zeit);
  const [ort, setOrt] = useState(v.ort);
  const freieGruppen = gruppen.filter((g) => g.mitglieder.length < MAX_GRUPPE);
  const [gruppe, setGruppe] = useState("");
  const [msg, setMsg] = useState(null);
  const gruende = passungGruende(ich, t);
  const senden = async () => { const r = await anfragen(t, zeit, ort, gruppe ? Number(gruppe) || gruppe : null); setMsg(r === "ok" ? { text: `Anfrage an ${t.anzeigename} ist raus.` } : { text: meldung(r), art: "warn" }); if (r === "ok") setAuf(false); };
  return (
    <div className="abi-karte" data-lp-treffer={t.id}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar name={t.anzeigename} gold={t.passung >= 5} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <b style={{ fontSize: 17, fontWeight: 800 }}>{t.anzeigename}</b>
            {t.passung > 0 && <span className="abi-be" title="Passung" style={{ height: 22, fontSize: 11.5 }}>{t.passung >= 5 ? "passt sehr gut" : "passt"}</span>}
          </span>
          <span className="abi-klein" style={{ display: "block" }}>{NIVEAU_KURZ[t.niveau]}{t.schule ? ` · ${t.schule}` : ""}</span>
        </div>
      </div>
      {gruende.length > 0 && <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.55 }}>{gruende.map((g) => <li key={g}>{g}</li>)}</ul>}
      <div className="abi-chips" style={{ marginTop: 10 }}>
        {(t.helfen || []).map((x) => <span key={`h${x}`} className="abi-chip" style={{ cursor: "default", minHeight: 30, fontSize: 12.5 }}>kann {BEREICH_NAME[x]}</span>)}
        {(t.zeiten || []).map((x) => <span key={`z${x}`} className="abi-chip" style={{ cursor: "default", minHeight: 30, fontSize: 12.5, background: "transparent" }}>{ZEIT_NAME[x]}</span>)}
      </div>
      {t.angefragt ? (
        <p className="abi-klein" style={{ marginTop: 12, fontWeight: 800, color: PRAEG }}>Anfrage läuft.</p>
      ) : !auf ? (
        <button type="button" className="abi-knopf gold" style={{ marginTop: 14 }} onClick={() => setAuf(true)} data-lp-anfragen>Zum Lernen anfragen<Pfeil /></button>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <div className="abi-raster zwei">
            <label className="abi-feld"><span>Wann?</span><select value={zeit} onChange={(e) => setZeit(e.target.value)}>{ZEITEN.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></label>
            <label className="abi-feld"><span>Wo?</span><select value={ort} onChange={(e) => setOrt(e.target.value)}>{ORTE.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
          </div>
          {freieGruppen.length > 0 && (
            <label className="abi-feld"><span>Als …</span>
              <select value={gruppe} onChange={(e) => setGruppe(e.target.value)}>
                <option value="">neue Lerngruppe zu zweit</option>
                {freieGruppen.map((g) => <option key={g.id} value={g.id}>Verstärkung für „{g.name}“ ({g.mitglieder.length}/{MAX_GRUPPE})</option>)}
              </select>
            </label>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="abi-knopf dunkel" onClick={senden} data-lp-senden>Anfrage senden</button>
            <button type="button" className="abi-knopf rand" onClick={() => setAuf(false)}>Abbrechen</button>
          </div>
        </div>
      )}
      <Nachricht text={msg && msg.text} art={msg && msg.art} />
    </div>
  );
}

/* ---------- Melden ---------- */
function MeldenKnopf({ name, melden, blockieren }) {
  const [auf, setAuf] = useState(false);
  const [fertig, setFertig] = useState(null);
  if (fertig) return <p className="abi-klein" style={{ marginTop: 8, fontWeight: 700 }}>{fertig}</p>;
  if (!auf) return <button type="button" className="abi-knopf rand klein" onClick={() => setAuf(true)} style={{ marginTop: 8 }}>Melden oder blockieren</button>;
  return (
    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
      <span className="abi-klein" style={{ fontWeight: 800 }}>Was ist los mit {name}?</span>
      {MELDEGRUENDE.map((g) => (
        <button key={g.id} type="button" className="abi-chip" onClick={async () => { await melden(g.id); setFertig(`Gemeldet und blockiert. ${name} sieht dich nicht mehr.`); }}>{g.name}</button>
      ))}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="abi-knopf rand klein" onClick={async () => { await blockieren(); setFertig(`${name} ist blockiert.`); }}>Nur blockieren</button>
        <button type="button" className="abi-knopf rand klein" onClick={() => setAuf(false)}>Abbrechen</button>
      </div>
    </div>
  );
}

/* ---------- Anfragen ---------- */
function Anfragen({ eingehend, ausgehend, antworten, zurueckziehen, melden, blockieren }) {
  const STATUS = { offen: "wartet", angenommen: "angenommen", abgelehnt: "abgelehnt", zurueckgezogen: "zurückgezogen" };
  return (
    <div className="abi-raster zwei">
      <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
        <span className="abi-eyebrow">An dich</span>
        {!eingehend.length && <p className="abi-text">Noch keine Anfragen. Ein vollständiger Steckbrief wird öfter gefunden.</p>}
        {eingehend.map((a) => (
          <div key={a.id} className="abi-karte gold" data-lp-eingehend={a.id}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name={a.name} />
              <div><b style={{ display: "block", fontSize: 17 }}>{a.name}</b><span className="abi-klein" style={{ color: "#2A1F00" }}>{NIVEAU_KURZ[a.niveau]}{a.schule ? ` · ${a.schule}` : ""}</span></div>
            </div>
            <p className="abi-text" style={{ marginTop: 10 }}>{a.gruppe ? `Lädt dich in „${a.gruppe}“ ein` : "Möchte mit dir lernen"}: <b>{ZEIT_NAME[a.zeit]}</b>, <b>{ORT_NAME[a.ort]}</b>.</p>
            {(a.helfen || []).length > 0 && <p className="abi-klein" style={{ marginTop: 4, color: "#2A1F00" }}>Kann helfen bei: {a.helfen.map((x) => BEREICH_NAME[x]).join(", ")}</p>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <button type="button" className="abi-knopf dunkel" onClick={() => antworten(a.id, true)} data-lp-annehmen>Annehmen</button>
              <button type="button" className="abi-knopf rand" onClick={() => antworten(a.id, false)}>Ablehnen</button>
            </div>
            <MeldenKnopf name={a.name} melden={(g) => melden(a.von, g)} blockieren={() => blockieren(a.von)} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
        <span className="abi-eyebrow">Von dir</span>
        {!ausgehend.length && <p className="abi-text">Du hast noch niemanden angefragt.</p>}
        {ausgehend.map((a) => (
          <div key={a.id} className="abi-karte" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={a.name} gold />
            <div style={{ minWidth: 0, flex: 1 }}><b style={{ display: "block" }}>{a.name}</b><span className="abi-klein">{ZEIT_NAME[a.zeit]} · {ORT_NAME[a.ort]} · {STATUS[a.status]}</span></div>
            {a.status === "offen" && <button type="button" className="abi-knopf rand klein" onClick={() => zurueckziehen(a.id)}>Zurückziehen</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Gruppen ---------- */
function TreffenForm({ vorschlagen }) {
  const morgen = new Date(Date.now() + 86400000); morgen.setHours(15, 0, 0, 0);
  const lokal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [wann, setWann] = useState(lokal(morgen));
  const [ort, setOrt] = useState("bibliothek");
  const [name, setName] = useState("");
  const [thema, setThema] = useState("teila");
  const [msg, setMsg] = useState(null);
  const ab = async () => {
    if (!ortNameOk(name)) { setMsg({ text: meldung("ort_name"), art: "warn" }); return; }
    const r = await vorschlagen(new Date(wann).toISOString(), ort, name.trim(), thema);
    setMsg(r === "ok" ? { text: "Treffen vorgeschlagen – die anderen sagen zu oder ab." } : { text: meldung(r), art: "warn" });
    if (r === "ok") setName("");
  };
  return (
    <div style={{ marginTop: 12, display: "grid", gap: 12 }} data-lp-treffen-form>
      <div className="abi-raster zwei">
        <label className="abi-feld"><span>Wann?</span><input type="datetime-local" value={wann} onChange={(e) => setWann(e.target.value)} /></label>
        <label className="abi-feld"><span>Thema</span><select value={thema} onChange={(e) => setThema(e.target.value)}>{THEMEN.map(([id, t]) => <option key={id} value={id}>{t}</option>)}</select></label>
        <label className="abi-feld"><span>Art des Orts</span><select value={ort} onChange={(e) => setOrt(e.target.value)}>{ORTE.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
        <label className="abi-feld"><span>Name des Orts</span><input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="z. B. Stadtbibliothek Mitte" /></label>
      </div>
      <div><button type="button" className="abi-knopf dunkel" onClick={ab} data-lp-treffen-senden>Treffen vorschlagen</button></div>
      <Nachricht text={msg && msg.text} art={msg && msg.art} />
    </div>
  );
}

function GruppeKarte({ g, aktion, gehe }) {
  const [formAuf, setFormAuf] = useState(false);
  const [verlassen, setVerlassen] = useState(false);
  return (
    <div className="abi-karte" data-lp-gruppe={g.id}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div><span className="abi-eyebrow">Lerngruppe · {g.mitglieder.length}/{MAX_GRUPPE}</span><h3 style={{ marginTop: 4 }}>{g.name}</h3></div>
        <div style={{ display: "flex" }}>{g.mitglieder.map((m, i) => <span key={m.id} style={{ marginLeft: i ? -10 : 0, border: "2px solid #FFFDF6", borderRadius: 999 }} title={m.name}><Avatar name={m.name} gold={m.ich} /></span>)}</div>
      </div>
      <p className="abi-klein" style={{ marginTop: 6 }}>{g.mitglieder.map((m) => (m.ich ? `${m.name} (du)` : m.name)).join(", ")}</p>

      <div style={{ marginTop: 14 }}>
        <span className="abi-feld"><span>Nächste Treffen</span></span>
        {!g.treffen.length && <p className="abi-text">Noch kein Termin. Schlag einen vor – an einem öffentlichen Ort.</p>}
        {g.treffen.map((t) => (
          <div key={t.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--abi-linie)" }} data-lp-treffen={t.id}>
            <b style={{ display: "block", fontSize: 15.5 }}>{terminText(t.wann)} · {t.ort_name}</b>
            <span className="abi-klein">{ORT_NAME[t.ort]} · {THEMEN.find(([id]) => id === t.thema)?.[1]} · {t.zusagen} dabei{t.absagen ? `, ${t.absagen} nicht` : ""}</span>
            <div className="abi-chips" style={{ marginTop: 8 }}>
              <button type="button" className="abi-chip" aria-pressed={t.meine === true} onClick={() => aktion.zusagen(t.id, true)}>Bin dabei</button>
              <button type="button" className="abi-chip" aria-pressed={t.meine === false} onClick={() => aktion.zusagen(t.id, false)}>Kann nicht</button>
            </div>
          </div>
        ))}
        {!formAuf ? <button type="button" className="abi-knopf rand klein" style={{ marginTop: 10 }} onClick={() => setFormAuf(true)}>Treffen vorschlagen</button> : <TreffenForm vorschlagen={(w, o, n, th) => aktion.treffen(g.id, w, o, n, th)} />}
      </div>

      <div className="abi-karte gold" style={{ marginTop: 16, padding: 14 }}>
        <b style={{ display: "block", fontSize: 15.5 }}>Gemeinsamer Teil-A-Satz</b>
        <p className="abi-text" style={{ marginTop: 4, fontSize: 14 }}>Alle in der Gruppe bekommen dieselben zehn Aufgaben. Jeder rechnet für sich, beim Treffen vergleicht ihr Wege und BE.</p>
        <button type="button" className="abi-knopf dunkel klein" style={{ marginTop: 10 }} onClick={() => { uebergabeSetzen(UEBERGABE.probeSeed, g.satz_seed); gehe({ ansicht: "abiteila" }); }} data-lp-satz>Satz {g.satz_seed} öffnen<Pfeil /></button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        {!verlassen ? <button type="button" className="abi-knopf rand klein" onClick={() => setVerlassen(true)}>Gruppe verlassen</button>
          : <button type="button" className="abi-knopf rand klein" style={{ color: "#A50044" }} onClick={() => aktion.verlassen(g.id)}>Wirklich verlassen</button>}
      </div>
      {g.mitglieder.filter((m) => !m.ich).map((m) => (
        <details key={m.id} style={{ marginTop: 6 }}>
          <summary className="abi-klein" style={{ cursor: "pointer", fontWeight: 700 }}>Problem mit {m.name}?</summary>
          <MeldenKnopf name={m.name} melden={(gr) => aktion.melden(m.id, gr)} blockieren={() => aktion.blockieren(m.id)} />
        </details>
      ))}
    </div>
  );
}

/* ---------- Eltern ---------- */
function ElternFreigabe({ api, beispiel }) {
  const [kinder, setKinder] = useState(beispiel ? [{ id: "k1", name: "Lena", freigabe: false, volljaehrig: false, unter16: false, teilnahme: false, gruppen: 0 }] : null);
  const [fehler, setFehler] = useState("");
  const laden = useCallback(async () => { if (beispiel) return; try { setKinder(await api.kinder()); } catch (e) { setFehler(e.fehlt ? "Die Lernpartner-Börse wird gerade eingerichtet." : e.message); } }, [api, beispiel]);
  useEffect(() => { laden(); }, [laden]);
  const umschalten = async (k) => {
    if (beispiel) { setKinder((l) => l.map((x) => (x.id === k.id ? { ...x, freigabe: !x.freigabe } : x))); return; }
    const r = await api.freigeben(k.id, !k.freigabe);
    if (r !== "ok") setFehler(meldung(r)); else laden();
  };
  return (
    <Abschnitt eyebrow="Für Eltern" titel="Lernpartner-Börse freigeben">
      <div className="abi-raster zwei">
        <div className="abi-karte">
          <p className="abi-text">Ihr Kind kann hier Abiturienten aus der eigenen Stadt finden, die ebenfalls mit Mythos Mathe lernen. Es gibt keinen Chat und keine Kontaktdaten: nur einen Steckbrief (Vorname, Stadt, Fächer), Anfragen und Treffen an öffentlichen Orten wie der Stadtbibliothek. Gruppen haben höchstens sechs Mitglieder; wer sich unwohl fühlt, meldet und blockiert mit einem Klick.</p>
          <p className="abi-text" style={{ marginTop: 10 }}>Minderjährige nehmen nur mit Ihrer Freigabe teil. Sie können sie jederzeit zurücknehmen – dann verlässt Ihr Kind sofort alle Gruppen.</p>
        </div>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          {kinder === null && !fehler && <p className="abi-text">Wird geladen …</p>}
          {kinder && !kinder.length && <p className="abi-hinweis">Noch kein Kind verbunden. Ihr Kind schickt Ihnen den Eltern-Link aus seinem Konto.</p>}
          {kinder && kinder.map((k) => (
            <div key={k.id} className={k.freigabe ? "abi-karte gold" : "abi-karte"} data-lp-kind={k.id}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar name={k.name} gold={!k.freigabe} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 17 }}>{k.name}</b>
                  <span className="abi-klein">{k.unter16 ? "unter 16 – Börse erst ab 16" : k.volljaehrig ? "volljährig – braucht keine Freigabe" : k.freigabe ? `freigegeben${k.teilnahme ? ` · ${k.gruppen} ${k.gruppen === 1 ? "Gruppe" : "Gruppen"}` : ""}` : "nicht freigegeben"}</span>
                </div>
              </div>
              {!k.unter16 && !k.volljaehrig && (
                <button type="button" className={k.freigabe ? "abi-knopf rand klein" : "abi-knopf dunkel klein"} style={{ marginTop: 12 }} onClick={() => umschalten(k)} data-lp-freigabe>{k.freigabe ? "Freigabe zurücknehmen" : "Freigeben"}</button>
              )}
            </div>
          ))}
          {fehler && <p className="abi-warn">{fehler}</p>}
        </div>
      </div>
    </Abschnitt>
  );
}

/* ---------- Zugang (noch nicht freigeschaltet) ---------- */
function Zugang({ grund, gehe, neuLaden }) {
  const g = GRUENDE[grund] || GRUENDE.kein_konto;
  const [msg, setMsg] = useState("");
  return (
    <div className="abi-raster zwei" style={{ marginTop: 22 }} data-lp-zugang={grund}>
      <div className="abi-karte gold">
        <span className="abi-eyebrow">Noch ein Schritt</span>
        <h3 style={{ marginTop: 4, fontSize: 22 }}>{g.titel}</h3>
        <p className="abi-text" style={{ marginTop: 8 }}>{g.text}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          {grund === "freigabe" && <button type="button" className="abi-knopf dunkel" onClick={async () => { const ok = await volljaehrigErklaeren(); setMsg(ok ? "" : "Das hat nicht geklappt."); neuLaden(); }}>Ich bin 18 oder älter</button>}
          {["kein_konto", "alter", "freigabe"].includes(grund) && <button type="button" className={grund === "freigabe" ? "abi-knopf rand" : "abi-knopf dunkel"} onClick={() => gehe({ ansicht: "konto" })}>{grund === "kein_konto" ? "Anmelden" : grund === "freigabe" ? "Eltern verbinden (Konto)" : "Zum Konto"}</button>}
        </div>
        {grund === "freigabe" && <p className="abi-klein" style={{ marginTop: 10, color: "#2A1F00" }}>So geht’s: Im Konto den Eltern-Link teilen. Dein Elternteil meldet sich an, öffnet Abi-Zentrum → Lernpartner und tippt auf „Freigeben“.</p>}
        {msg && <p className="abi-warn" style={{ marginTop: 10 }}>{msg}</p>}
      </div>
      <SicherKarte />
    </div>
  );
}

/* ---------- Seite ---------- */
export function LernpartnerSeite({ gehe }) {
  const konto = useKonto();
  const abi = useAbi();
  const api = useMemo(() => (sb ? lpApi(sb) : null), []);
  const eltern = konto.profil && konto.profil.rolle === "eltern";
  const ohneDb = DEMO || !konto.nutzer || istTestkonto();
  const [stand, setStand] = useState({ laden: !ohneDb, beispiel: ohneDb, einrichten: false, status: null, treffer: [], meine: { eingehend: [], ausgehend: [], gruppen: [] } });
  const [reiter, setReiter] = useState("finden");
  const [hinweis, setHinweis] = useState("");

  /* Beispielmodus: alles lokal */
  const [bsp, setBsp] = useState(() => ({
    profil: { ...BEISPIEL_ICH, abi_jahr: (abi.profil && abi.profil.jahr) || 2027 }, treffer: beispielTreffer(),
    eingehend: [{ id: "be1", von: "b3", name: "Aylin", schule: "Königin-Katharina-Stift", niveau: "grundlegend", helfen: ["analysis"], zeit: "sa", ort: "cafe", gruppe: null }],
    ausgehend: [], gruppen: [beispielGruppe()],
  }));

  const laden = useCallback(async () => {
    if (ohneDb || !api) return;
    try {
      const status = await api.status();
      let treffer = [], meine = { eingehend: [], ausgehend: [], gruppen: [] };
      if (status.grund === "ok" && status.profil) [treffer, meine] = await Promise.all([api.suchen(), api.meine()]);
      setStand({ laden: false, beispiel: false, einrichten: false, status, treffer, meine });
    } catch (e) {
      setStand((s) => ({ ...s, laden: false, beispiel: true, einrichten: !!e.fehlt }));
      if (!e.fehlt) setHinweis(e.message || "Die Börse ist gerade nicht erreichbar.");
    }
  }, [api, ohneDb]);
  useEffect(() => { laden(); }, [laden, konto.nutzer]);

  const echt = !stand.beispiel;
  const status = stand.status;
  const profil = echt ? status && status.profil : bsp.profil;
  const daten = echt ? { treffer: stand.treffer, ...stand.meine } : { treffer: bsp.treffer, eingehend: bsp.eingehend, ausgehend: bsp.ausgehend, gruppen: bsp.gruppen };

  const aktion = echt ? {
    speichern: async (s) => { const r = await api.speichern(s); if (r === "ok") await laden(); return r; },
    loeschen: async () => { await api.loeschen(); await laden(); },
    anfragen: async (t, zeit, ort, gruppe) => { const r = await api.anfragen(t.id, zeit, ort, gruppe); if (r === "ok") await laden(); return r; },
    antworten: async (id, ja) => { const r = await api.antworten(id, ja); if (r !== "ok") setHinweis(meldung(r)); else if (ja) setReiter("gruppen"); await laden(); },
    zurueckziehen: async (id) => { await api.zurueckziehen(id); await laden(); },
    treffen: async (g, w, o, n, th) => { const r = await api.treffen(g, w, o, n, th); if (r === "ok") await laden(); return r; },
    zusagen: async (t, ja) => { await api.zusagen(t, ja); await laden(); },
    verlassen: async (g) => { await api.verlassen(g); await laden(); },
    melden: async (id, gr) => { await api.melden(id, gr); await laden(); },
    blockieren: async (id) => { await api.blockieren(id); await laden(); },
  } : {
    speichern: async (s) => { setBsp((b) => ({ ...b, profil: s })); return "ok"; },
    loeschen: async () => setBsp((b) => ({ ...b, profil: null })),
    anfragen: async (t, zeit, ort) => { setBsp((b) => ({ ...b, treffer: b.treffer.map((x) => (x.id === t.id ? { ...x, angefragt: true } : x)), ausgehend: [{ id: `ba${t.id}`, an: t.id, name: t.anzeigename, zeit, ort, status: "offen" }, ...b.ausgehend] })); return "ok"; },
    antworten: async (id, ja) => setBsp((b) => {
      const a = b.eingehend.find((x) => x.id === id);
      const gruppen = ja && a ? [...b.gruppen, { id: `bg${id}`, name: `${a.name} & Du`, satz_seed: 314159, mitglieder: [{ id: a.von, name: a.name, ich: false }, { id: "ich", name: "Du", ich: true }], treffen: [] }] : b.gruppen;
      if (ja) setReiter("gruppen");
      return { ...b, eingehend: b.eingehend.filter((x) => x.id !== id), gruppen };
    }),
    zurueckziehen: async (id) => setBsp((b) => ({ ...b, ausgehend: b.ausgehend.map((x) => (x.id === id ? { ...x, status: "zurueckgezogen" } : x)) })),
    treffen: async (g, w, o, n, th) => { setBsp((b) => ({ ...b, gruppen: b.gruppen.map((x) => (x.id === g ? { ...x, treffen: [...x.treffen, { id: `bt${Date.now()}`, wann: w, ort: o, ort_name: n, thema: th, zusagen: 1, absagen: 0, meine: true }] } : x)) })); return "ok"; },
    zusagen: async (t, ja) => setBsp((b) => ({ ...b, gruppen: b.gruppen.map((g) => ({ ...g, treffen: g.treffen.map((x) => (x.id === t ? { ...x, meine: ja, zusagen: x.zusagen + (ja && x.meine !== true ? 1 : !ja && x.meine === true ? -1 : 0), absagen: x.absagen + (!ja && x.meine !== false ? 1 : ja && x.meine === false ? -1 : 0) } : x)) })) })),
    verlassen: async (g) => setBsp((b) => ({ ...b, gruppen: b.gruppen.filter((x) => x.id !== g) })),
    melden: async () => {},
    blockieren: async () => {},
  };

  const offeneAnfragen = daten.eingehend.length;
  const zugangOk = !echt || (status && status.grund === "ok");

  return (
    <AbiSeite kennung={{ "data-lernpartner": stand.beispiel ? "beispiel" : "echt" }}>
      <AbiKopf kompakt zurueck={{ text: "Abi-Zentrum", onClick: () => gehe({ ansicht: "abi" }) }} eyebrow="Gemeinsam aufs Abi" titel="Lernpartner finden" id="abi-kopf-lp"
        zeile="Abiturienten aus deiner Stadt – auch von anderen Schulen –, die mit Mythos Mathe lernen. Steckbrief statt Chat, Treffen an öffentlichen Orten."
        rechts={profil && zugangOk && !eltern ? <span className="abi-pille">{profil.stadt || "Stadt fehlt"} · Abi {profil.abi_jahr}</span> : null} />
      <div className="abi-innen">
        {stand.beispiel && !eltern && (
          <p className="abi-hinweis" style={{ marginTop: 18 }} data-lp-beispiel>
            <b>Beispielmodus.</b> {stand.einrichten ? "Die Börse wird gerade eingerichtet – hier siehst du schon, wie sie funktioniert." : "Ohne Konto siehst du, wie die Börse funktioniert: die Personen sind erfunden, es wird nichts gesendet."}
            {!konto.nutzer && <> <button type="button" className="abi-knopf dunkel klein" style={{ marginLeft: 8 }} onClick={() => gehe({ ansicht: "konto" })}>Anmelden</button></>}
          </p>
        )}
        {hinweis && <p className="abi-warn" style={{ marginTop: 12 }} role="alert">{hinweis}</p>}
        {stand.laden && <p className="abi-text" style={{ marginTop: 22 }}>Wird geladen …</p>}

        {eltern && <ElternFreigabe api={api} beispiel={stand.beispiel} />}

        {!eltern && !stand.laden && echt && status && status.grund !== "ok" && <Zugang grund={status.grund} gehe={gehe} neuLaden={laden} />}

        {!eltern && !stand.laden && zugangOk && !profil && (
          <div className="abi-raster zwei" style={{ marginTop: 22 }}>
            <SteckbriefForm neu wert={steckbriefVorlage(abi.profil, konto.profil && konto.profil.name)} speichern={aktion.speichern} />
            <SicherKarte />
          </div>
        )}

        {!eltern && !stand.laden && zugangOk && profil && (
          <>
            <div className="abi-reiter" role="tablist" aria-label="Lernpartner" style={{ marginTop: 20 }}>
              {[["finden", "Finden"], ["anfragen", `Anfragen${offeneAnfragen ? ` (${offeneAnfragen})` : ""}`], ["gruppen", `Gruppen${daten.gruppen.length ? ` (${daten.gruppen.length})` : ""}`], ["steckbrief", "Steckbrief"]].map(([id, t]) => (
                <button key={id} type="button" role="tab" aria-selected={reiter === id} onClick={() => setReiter(id)} data-lp-reiter={id}>{t}</button>
              ))}
            </div>
            {reiter === "finden" && (
              <Abschnitt eyebrow={`${profil.stadt} · Abi ${profil.abi_jahr}`} titel={daten.treffer.length ? `${daten.treffer.length} ${daten.treffer.length === 1 ? "Abiturient" : "Abiturienten"} in deiner Nähe` : "Noch niemand aus deiner Stadt"}>
                {!daten.treffer.length && (
                  <div className="abi-karte gold">
                    <p className="abi-text">Du bist früh dran. Sobald jemand aus {profil.stadt} mit Abi {profil.abi_jahr} einen Steckbrief anlegt, steht er hier. Am schnellsten geht’s, wenn du Leute aus deinem Kurs auf die App bringst – dann seid ihr der Anfang.</p>
                  </div>
                )}
                {profil.aktiv === false && <p className="abi-hinweis" style={{ marginBottom: 12 }}>Dein Steckbrief ist pausiert – andere sehen dich gerade nicht.</p>}
                <div className="abi-raster zwei">
                  {daten.treffer.map((t) => <TrefferKarte key={t.id} ich={profil} t={t} gruppen={daten.gruppen} anfragen={aktion.anfragen} />)}
                </div>
              </Abschnitt>
            )}
            {reiter === "anfragen" && (
              <Abschnitt eyebrow="Anfragen" titel="Wer mit dir lernen will">
                <Anfragen eingehend={daten.eingehend} ausgehend={daten.ausgehend} antworten={aktion.antworten} zurueckziehen={aktion.zurueckziehen} melden={aktion.melden} blockieren={aktion.blockieren} />
              </Abschnitt>
            )}
            {reiter === "gruppen" && (
              <Abschnitt eyebrow="Deine Lerngruppen" titel={daten.gruppen.length ? "Zusammen lernen" : "Noch keine Gruppe"}>
                {!daten.gruppen.length && <p className="abi-text">Nimmt jemand deine Anfrage an (oder du seine), entsteht hier eure Gruppe.</p>}
                <div className="abi-raster zwei">{daten.gruppen.map((g) => <GruppeKarte key={g.id} g={g} aktion={aktion} gehe={gehe} />)}</div>
              </Abschnitt>
            )}
            {reiter === "steckbrief" && (
              <div className="abi-raster zwei" style={{ marginTop: 22 }}>
                <SteckbriefForm wert={{ ...steckbriefVorlage(abi.profil), ...profil }} speichern={aktion.speichern} loeschen={aktion.loeschen} />
                <SicherKarte />
              </div>
            )}
          </>
        )}
      </div>
    </AbiSeite>
  );
}

export default LernpartnerSeite;
