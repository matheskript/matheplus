/* ============================================================
   Lernpfad – vom Werkzeugkasten zum geführten Weg
   · Einrichtung: Bereich, Ziel (mit Termin), Einheiten pro Woche
   · Standortcheck: Aufgaben aus den geprüften Generatoren, Stationen in Grün/Gelb/Rot
   · Wochenplan: so viele Einheiten pro Woche, wie vorgenommen; Ring auf der Startseite
   · Einheit: Entdecken → Rechnen (Werkzeug) → Trainieren (5 Aufgaben) → Rückmeldung
   Die Logik steckt in lernpfade.js (reine Daten, getestet); gespeichert wird in LERN.pfad
   (func6.jsx, Konto-Abgleich über lernSync). Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { lernAendern, useLern } from "./func6.jsx";
import { Aufgabenlauf, ebbBuchen } from "./funcTraining.jsx";
import { useOffenHeute } from "./funcMeinTraining.jsx";
import { EtikettPille } from "./funcWerkzeuge.jsx";
import { rueckwegSetzen } from "./uebergabe.js";
import { werkzeug, wo } from "./werkzeuge.js";
import { GrosserKnopf, Rueck, hinweis, karte, kicker } from "./ui2.jsx";
import {
  AMPEL, PFADE, PFAD_IDS, PRO_WOCHE, SCHRITTE, SCHRITT_NAMEN, ZIELE, ZIEL_IDS, TAG_MS,
  checkAufgaben, checkAuswerten, einheit, einheitAufgaben, einheitStand, naechsteEinheit, normierePfad, pfadStationen,
  planErzeugen, schrittSetzen, stationsStand, terminPruefen, wochenEinheiten, wochenStand,
} from "./lernpfade.js";

/* ---------- Speicher ---------- */
export const useLernpfad = () => normierePfad(useLern().pfad);
const pfadAendern = (fn) => lernAendern((L) => { L.pfad = fn(normierePfad(L.pfad)); });
const pfadSetzen = (P) => pfadAendern(() => P);

/* ---------- kleine Bausteine ---------- */
const AMPEL_FARBE = { gruen: C.smaragd, gelb: C.flaggold, rot: C.signal, grau: C.hellgrau };
const Seitenrahmen = ({ children }) => <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 18 }}>{children}</div>;
const Link = ({ onClick, children }) => (
  <button type="button" onClick={onClick} style={{ background: "none", border: "none", color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "10px 0", minHeight: 44 }}>{children}</button>
);
const Chip = ({ an, onClick, children, farbe = C.see, breit }) => (
  <button type="button" aria-pressed={an} onClick={onClick}
    style={{ minHeight: 44, padding: "8px 14px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: "left", lineHeight: 1.3, flex: breit ? "1 1 100%" : "0 1 auto",
      border: `1.5px solid ${an ? farbe : C.linie}`, background: an ? farbe : C.weiss, color: an ? C.weiss : C.tinte }}>{children}</button>
);
const Punkt = ({ farbe, gross }) => <span aria-hidden="true" style={{ display: "inline-block", width: gross ? 12 : 9, height: gross ? 12 : 9, borderRadius: 999, background: farbe, flexShrink: 0 }} />;

/* Fortschrittsring: ist von soll */
export function Ring({ ist, soll, groesse = 84, dick = 9, text, unter }) {
  const r = (groesse - dick) / 2, u = 2 * Math.PI * r, anteil = soll ? Math.min(1, ist / soll) : 0;
  return (
    <div style={{ position: "relative", width: groesse, height: groesse, flexShrink: 0 }} role="img" aria-label={`${ist} von ${soll} Einheiten`}>
      <svg viewBox={`0 0 ${groesse} ${groesse}`} width={groesse} height={groesse} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={groesse / 2} cy={groesse / 2} r={r} fill="none" stroke={C.himmel} strokeWidth={dick} />
        <circle cx={groesse / 2} cy={groesse / 2} r={r} fill="none" stroke={anteil >= 1 ? C.smaragd : C.flaggold} strokeWidth={dick} strokeLinecap="round"
          strokeDasharray={u} strokeDashoffset={u * (1 - anteil)} style={{ transition: "stroke-dashoffset .5s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.05 }}>
        <span style={{ fontSize: groesse > 70 ? 20 : 15, fontWeight: 800, color: C.tinte }}>{text || `${ist}/${soll}`}</span>
        {unter && <span style={{ fontSize: 10.5, color: C.grau, fontWeight: 600, marginTop: 2 }}>{unter}</span>}
      </div>
    </div>
  );
}

const datumKurz = (ms) => new Date(ms).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const tageText = (n) => (n <= 0 ? "heute" : n === 1 ? "morgen" : `in ${n} Tagen`);

/* Welche Ansicht ist zum Entdecken am besten? Das Werkzeug mit Etikett „entdecken“ aus derselben Station, sonst das Werkzeug selbst */
function entdeckenZiel(e) {
  const ort = wo(e.ziel.ansicht);
  if (e.etikett === "entdecken" || !ort || !ort.station) return { ziel: e.ziel, name: e.name };
  const andere = ort.station.werkzeuge.map(werkzeug).find((w) => w && w.etikett === "entdecken" && w.id !== e.werkzeug);
  return andere ? { ziel: andere.ziel, name: andere.name } : { ziel: e.ziel, name: e.name };
}

/* ======================================================================
   Einrichtung: Pfad, Ziel, Termin, Einheiten pro Woche
   ====================================================================== */
function Einrichtung({ onCheck, onOhneCheck, gehe, vorher }) {
  const [pfad, setPfad] = useState(vorher ? vorher.pfad : "analysis");
  const [ziel, setZiel] = useState(vorher ? vorher.ziel : "besser");
  const [termin, setTermin] = useState(vorher && vorher.termin ? new Date(vorher.termin).toISOString().slice(0, 10) : "");
  const [proWoche, setProWoche] = useState(vorher ? vorher.proWoche : 3);
  const terminMs = termin ? Date.parse(`${termin}T12:00:00`) : null;
  const anzahl = einheitenZahl(pfad);
  const t = terminPruefen(anzahl, proWoche, ZIELE[ziel].termin ? terminMs : null);
  const terminFehlt = ZIELE[ziel].termin && !termin;
  const einst = { pfad, ziel, termin: ZIELE[ziel].termin ? terminMs : null, proWoche: t.proWoche };
  return (
    <Seitenrahmen>
      <Link onClick={() => gehe({ ansicht: "start" })}>← Startseite</Link>
      <p style={hinweis}>Drei Angaben, dann ein kurzer Standortcheck. Danach weiß die App, was diese Woche dran ist – und du musst nicht mehr suchen.</p>

      <div style={karte}>
        <p style={kicker}>1 · Welcher Bereich?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PFAD_IDS.map((id) => (
            <Chip key={id} an={pfad === id} onClick={() => setPfad(id)} breit>
              <span style={{ display: "block" }}>{PFADE[id].name}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 500, opacity: 0.85 }}>{PFADE[id].zeile} · {einheitenZahl(id)} Einheiten</span>
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ ...karte, marginTop: 14 }}>
        <p style={kicker}>2 · Wofür?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ZIEL_IDS.map((id) => (
            <Chip key={id} an={ziel === id} onClick={() => setZiel(id)} breit>
              <span style={{ display: "block" }}>{ZIELE[id].name}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 500, opacity: 0.85 }}>{ZIELE[id].zeile}</span>
            </Chip>
          ))}
        </div>
        {ZIELE[ziel].termin && (
          <label style={{ display: "block", marginTop: 14, fontSize: 13.5, fontWeight: 700, color: C.tinte }}>
            Termin
            <input type="date" value={termin} onChange={(ev) => setTermin(ev.target.value)} min={new Date(Date.now() + TAG_MS).toISOString().slice(0, 10)}
              style={{ display: "block", marginTop: 6, minHeight: 44, padding: "8px 12px", borderRadius: 12, border: `1.5px solid ${C.linie}`, fontFamily: "inherit", fontSize: 15, color: C.tinte, background: C.weiss, width: "100%", maxWidth: 240 }} />
          </label>
        )}
      </div>

      <div style={{ ...karte, marginTop: 14 }}>
        <p style={kicker}>3 · Wie viele Einheiten pro Woche?</p>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 10 }}>Eine Einheit dauert rund 20 Minuten: kurz verstehen, im Werkzeug rechnen, fünf Aufgaben trainieren.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRO_WOCHE.map((n) => <Chip key={n} an={proWoche === n} onClick={() => setProWoche(n)}>{n} pro Woche</Chip>)}
        </div>
        {!terminFehlt && (
          <Rueck art={t.passt ? "info" : "warn"}>
            {t.passt
              ? `${anzahl} Einheiten in ${t.wochen} ${t.wochen === 1 ? "Woche" : "Wochen"}${t.proWoche !== proWoche ? ` – bis zum Termin braucht es ${t.proWoche} pro Woche.` : "."}`
              : `Bis zum Termin bleiben ${t.wochenFrei} ${t.wochenFrei === 1 ? "Woche" : "Wochen"}. Das reicht nicht für alle ${anzahl} Einheiten; der Plan zeigt die wichtigsten zuerst.`}
          </Rueck>
        )}
      </div>

      <GrosserKnopf onClick={() => onCheck(einst)} disabled={terminFehlt}>Standortcheck starten (ca. 15 Minuten)</GrosserKnopf>
      <GrosserKnopf ghost onClick={() => onOhneCheck(einst)} disabled={terminFehlt}>Ohne Check starten</GrosserKnopf>
      {terminFehlt && <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 8 }}>Für dieses Ziel braucht der Plan einen Termin.</p>}
    </Seitenrahmen>
  );
}
const einheitenZahl = (pfadId) => planErzeugen({ pfad: pfadId }).reihenfolge.length;

/* ======================================================================
   Standortcheck
   ====================================================================== */
function Standortcheck({ einst, onFertig, onAbbruch }) {
  const [aufgaben] = useState(() => checkAufgaben(einst.pfad));
  const [erg, setErg] = useState(null);
  if (!aufgaben.length) { onFertig({}); return null; }
  if (erg) {
    const stationen = pfadStationen(einst.pfad);
    const P = planErzeugen({ ...einst, check: erg });
    return (
      <Seitenrahmen>
        <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", marginBottom: 8 }}>Dein Standort</h2>
        <p style={hinweis}>So sehen die Stationen nach dem Check aus. Grün heißt: dort reicht eine kurze Einheit. Alles andere bekommt den vollen Rhythmus.</p>
        <div style={karte}>
          {stationen.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${C.linie}` }}>
              <Punkt farbe={AMPEL_FARBE[erg[s.key].ampel]} gross />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte }}>{s.bereichTitel} · Station {s.sNr} · {s.titel}</p>
                <p style={{ fontSize: 12.5, color: C.grau }}>{erg[s.key].n ? `${erg[s.key].ok} von ${erg[s.key].n} ohne Hilfe · ${AMPEL[erg[s.key].ampel]}` : "nicht geprüft – wird im Werkzeug trainiert"}</p>
              </div>
            </div>
          ))}
        </div>
        <Rueck art="info">Dein Plan: {P.reihenfolge.length} Einheiten, {P.proWoche} pro Woche, {Math.ceil(P.reihenfolge.length / P.proWoche)} Wochen.</Rueck>
        <GrosserKnopf gold onClick={() => onFertig(erg)}>Plan anlegen</GrosserKnopf>
      </Seitenrahmen>
    );
  }
  return (
    <Seitenrahmen>
      <Link onClick={onAbbruch}>← Abbrechen</Link>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", marginBottom: 8 }}>Standortcheck</h2>
      <p style={hinweis}>{`${aufgaben.length} Aufgaben quer durch ${PFADE[einst.pfad].name}. Was du nicht weißt, lässt du offen – Raten verfälscht nur den Plan. Hilfen und Lösungen zählen hier nicht als „gekonnt“.`}</p>
      <Aufgabenlauf aufgaben={aufgaben} quelle="standortcheck" endeText="Weiter zum Ergebnis" onEnde={(zs) => setErg(checkAuswerten(einst.pfad, aufgaben, zs))} onWeiter={(a, z) => ebbBuchen([a], [z], "standortcheck")} />
    </Seitenrahmen>
  );
}

/* ======================================================================
   Wochenplan
   ====================================================================== */
function StationsLeiste({ P }) {
  const st = stationsStand(P);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {st.map((s) => (
        <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: C.tinte, background: C.sand, borderRadius: 999, padding: "5px 10px", border: `1px solid ${C.linie}` }}>
          <Punkt farbe={AMPEL_FARBE[s.ampel]} />{s.bereichTitel.slice(0, 1)}{s.sNr} {s.titel} <span style={{ color: C.grau, fontWeight: 500 }}>{s.fertig}/{s.gesamt}</span>
        </span>
      ))}
    </div>
  );
}

function EinheitZeile({ e, P, onOeffnen, naechste }) {
  const st = einheitStand(P, e.id);
  return (
    <button type="button" onClick={onOeffnen} aria-label={`${e.name} öffnen`}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: naechste ? C.himmel : "none", border: "none", borderTop: `1px solid ${C.linie}`, padding: "11px 6px", fontFamily: "inherit", cursor: "pointer", borderRadius: naechste ? 12 : 0 }}>
      <div style={{ display: "flex", gap: 4 }} aria-hidden="true">
        {SCHRITTE.map((s) => <Punkt key={s} farbe={st[s] ? C.smaragd : C.linie} />)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: st.fertig ? C.grau : C.tinte, textDecoration: st.fertig ? "line-through" : "none" }}>{e.name}</p>
        <p style={{ fontSize: 12.5, color: C.grau }}>{e.bereichTitel} · Station {e.sNr} · {e.stationTitel}{st.quote !== undefined ? ` · ${Math.round(st.quote * 100)} % richtig` : ""}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.see }}>{st.fertig ? "✓" : naechste ? "Starten ›" : "›"}</span>
    </button>
  );
}

function Wochenplan({ P, gehe, oeffnen }) {
  const [einstellungen, setEinstellungen] = useState(false);
  const jetzt = Date.now();
  const ws = wochenStand(P, jetzt);
  const woche = wochenEinheiten(P, jetzt);
  const naechste = naechsteEinheit(P);
  const heute = useOffenHeute();
  const alleFertig = !naechste;
  return (
    <Seitenrahmen>
      <Link onClick={() => gehe({ ansicht: "start" })}>← Startseite</Link>
      <div style={{ ...karte, display: "flex", gap: 16, alignItems: "center" }}>
        <Ring ist={ws.ist} soll={ws.soll} unter="diese Woche" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={kicker}>{PFADE[P.pfad].name} · Woche {ws.woche + 1} von {ws.wochen}</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, lineHeight: 1.35 }}>
            {alleFertig ? "Alle Einheiten geschafft." : ws.ist >= ws.soll ? "Wochenziel erreicht – alles Weitere ist Bonus." : `Noch ${ws.soll - ws.ist} ${ws.soll - ws.ist === 1 ? "Einheit" : "Einheiten"} bis zum Wochenziel.`}
          </p>
          <p style={{ fontSize: 12.5, color: C.grau, marginTop: 4 }}>
            {ws.fertig} von {ws.gesamt} insgesamt{P.termin ? ` · ${ZIELE[P.ziel] ? ZIELE[P.ziel].name : ""} ${tageText(ws.tageBisTermin)}` : ""}
            {ws.imRueckstand && !alleFertig ? " · im Rückstand, kein Drama: eine Einheit mehr diese Woche." : ""}
          </p>
        </div>
      </div>

      {heute.geladen && heute.hatSkills && heute.offen > 0 && (
        <button type="button" onClick={() => gehe({ ansicht: "meintraining" })}
          style={{ ...karte, marginTop: 12, width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${C.flaggold}`, cursor: "pointer", fontFamily: "inherit" }}>
          <span aria-hidden="true" style={{ fontSize: 22 }}>⏰</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte }}>Heute fällig: {heute.offen === 1 ? "1 Wiederholung" : `${heute.offen} Wiederholungen`}</span>
            <span style={{ display: "block", fontSize: 12.5, color: C.grau }}>Fünf Minuten, bevor es vergessen ist – dein Tagesplan in „Mein Training“.</span>
          </span>
          <span style={{ color: C.see, fontWeight: 700 }}>›</span>
        </button>
      )}

      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>Diese Woche</p>
        {woche.map((e) => <EinheitZeile key={e.id} e={e} P={P} naechste={e.id === naechste} onOeffnen={() => oeffnen(e.id)} />)}
        {!woche.length && <p style={{ fontSize: 14, color: C.grau }}>Nichts mehr offen. Zeit für den Prüfungsmodus.</p>}
      </div>

      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>Stationen</p>
        <StationsLeiste P={P} />
        <p style={{ fontSize: 12.5, color: C.hellgrau, marginTop: 10 }}>Grün: alle Einheiten der Station fertig oder im Check sicher. Gelb und Rot aus dem Standortcheck.</p>
      </div>

      {alleFertig && (
        <div style={{ ...karte, marginTop: 12, background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Pfad geschafft.</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, opacity: 0.92 }}>Jetzt zählt die Prüfungsform: ohne Hilfen, mit Uhr.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <GrosserKnopf gold onClick={() => gehe({ ansicht: "pruefung" })}>Prüfungsmodus</GrosserKnopf>
            <GrosserKnopf ghost onClick={() => gehe({ ansicht: "abisaetze" })}>Abi-Sätze</GrosserKnopf>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <Link onClick={() => setEinstellungen(!einstellungen)}>{einstellungen ? "Einstellungen schließen" : "Plan anpassen"}</Link>
        {einstellungen && (
          <div style={karte}>
            <p style={kicker}>Einheiten pro Woche</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRO_WOCHE.map((n) => <Chip key={n} an={P.proWoche === n} onClick={() => pfadSetzen({ ...P, proWoche: n, zuletzt: Date.now() })}>{n}</Chip>)}
            </div>
            <p style={{ fontSize: 12.5, color: C.grau, marginTop: 12, lineHeight: 1.6 }}>Angelegt am {datumKurz(P.angelegt)}{P.termin ? ` · Termin ${datumKurz(P.termin)}` : ""}.</p>
            <GrosserKnopf ghost onClick={() => { if (window.confirm("Plan löschen und neu einrichten? Dein Fortschritt in den Werkzeugen bleibt erhalten.")) pfadSetzen(null); }}>Neu einrichten</GrosserKnopf>
          </div>
        )}
      </div>
    </Seitenrahmen>
  );
}

/* ======================================================================
   Einheit: Entdecken → Rechnen → Trainieren → Rückmeldung
   ====================================================================== */
function SchrittKopf({ schritt, st }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }} aria-label="Schritte der Einheit">
      {SCHRITTE.map((s, i) => (
        <div key={s} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: 5, borderRadius: 999, background: st[s] ? C.smaragd : s === schritt ? C.flaggold : C.linie }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: s === schritt ? C.tinte : C.grau, display: "block", marginTop: 5 }}>{i + 1} · {SCHRITT_NAMEN[s]}</span>
        </div>
      ))}
    </div>
  );
}

function EinheitAnsicht({ e, P, gehe, zurueck }) {
  const st = einheitStand(P, e.id);
  const [schritt, setSchritt] = useState(() => st.offen[0] || "fertig");
  const [lauf, setLauf] = useState(null);
  const [ergebnis, setErgebnis] = useState(null);
  const setzen = (s, extra) => pfadAendern((Q) => schrittSetzen(Q, e.id, s, extra));
  const weiter = (s) => { const n = SCHRITTE[SCHRITTE.indexOf(s) + 1]; setSchritt(n || "fertig"); window.scrollTo(0, 0); };
  const oeffneWerkzeug = (ziel, von) => { rueckwegSetzen(ziel.ansicht, von, { ansicht: "lernpfad", einheit: e.id }); gehe({ ...ziel, uebergabe: true }); };
  const entd = useMemo(() => entdeckenZiel(e), [e]);
  const naechste = naechsteEinheit(P);
  const kopf = (
    <>
      <Link onClick={zurueck}>← Wochenplan</Link>
      <p style={{ ...kicker, marginBottom: 4 }}>{e.bereichTitel} · Station {e.sNr} von {e.stationen} · {e.stationTitel}</p>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", marginBottom: 12 }}>{e.name} <EtikettPille etikett={e.etikett} klein /></h2>
      <SchrittKopf schritt={schritt} st={st} />
    </>
  );

  if (schritt === "entdecken") return (
    <Seitenrahmen>
      {kopf}
      <div style={karte}>
        <p style={kicker}>Worum es geht</p>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: C.tinte }}>{e.texte.worum}</p>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 12 }}>
          Zwei Minuten ausprobieren: Regler bewegen, Zahlen ändern, Graph beobachten. Dann zurück zur Einheit.
        </p>
        <GrosserKnopf ghost onClick={() => oeffneWerkzeug(entd.ziel, "Lernpfad")}>{entd.name} öffnen</GrosserKnopf>
        <GrosserKnopf onClick={() => { setzen("entdecken"); weiter("entdecken"); }}>Verstanden – weiter zum Rechnen</GrosserKnopf>
      </div>
    </Seitenrahmen>
  );

  if (schritt === "rechnen") return (
    <Seitenrahmen>
      {kopf}
      <div style={karte}>
        <p style={kicker}>Deine Aufgabe im Werkzeug</p>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: C.tinte }}>{e.texte.aufgabe}</p>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 12 }}>Auf Papier mitschreiben, Blankopapier und schwarzer Stift. Im Werkzeug steht oben „zurück“ zur Einheit.</p>
        <GrosserKnopf onClick={() => oeffneWerkzeug(e.ziel, "Lernpfad")}>{e.name} öffnen</GrosserKnopf>
        <GrosserKnopf gold onClick={() => { setzen("rechnen"); weiter("rechnen"); }}>Erledigt – weiter zum Trainieren</GrosserKnopf>
      </div>
    </Seitenrahmen>
  );

  if (schritt === "trainieren") {
    if (!e.generatoren.length) return (
      <Seitenrahmen>
        {kopf}
        <div style={karte}>
          <p style={kicker}>Trainieren im Werkzeug</p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.tinte }}>Für dieses Thema prüft das Werkzeug selbst: Löse dort drei Aufgaben hintereinander, ohne Lösung anzusehen.</p>
          <GrosserKnopf onClick={() => oeffneWerkzeug(e.ziel, "Lernpfad")}>{e.name} öffnen</GrosserKnopf>
          <GrosserKnopf gold onClick={() => { setzen("trainieren"); setErgebnis({ ohneQuote: true }); weiter("trainieren"); }}>Drei Aufgaben geschafft</GrosserKnopf>
        </div>
      </Seitenrahmen>
    );
    if (!lauf) return (
      <Seitenrahmen>
        {kopf}
        <div style={karte}>
          <p style={kicker}>Fünf Aufgaben</p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.tinte }}>Jetzt du allein. „Ich hänge fest“ bleibt erlaubt, zählt aber ehrlich mit.</p>
          <GrosserKnopf onClick={() => setLauf(einheitAufgaben(e))}>Los geht’s</GrosserKnopf>
        </div>
      </Seitenrahmen>
    );
    return (
      <Seitenrahmen>
        {kopf}
        <Aufgabenlauf aufgaben={lauf} quelle="lernpfad" endeText="Einheit abschließen" onWeiter={(a, z) => ebbBuchen([a], [z], "lernpfad")}
          onEnde={(zs) => {
            const ohne = zs.filter((z) => z.ok && (z.hilfeEnde || 0) === 0).length;
            const quote = zs.length ? ohne / zs.length : 0;
            setzen("trainieren", { quote }); setErgebnis({ quote, ohne, n: zs.length }); weiter("trainieren");
          }} />
      </Seitenrahmen>
    );
  }

  /* fertig: Rückmeldung */
  const q = ergebnis && !ergebnis.ohneQuote ? ergebnis.quote : (st.quote !== undefined ? st.quote : null);
  const naechsteE = naechste && naechste !== e.id ? einheit(naechste) : null;
  return (
    <Seitenrahmen>
      {kopf}
      <div style={{ ...karte, background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
        <p style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 6 }}>Einheit abgeschlossen</p>
        <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em" }}>{e.name}</p>
        <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.6, marginTop: 8, opacity: 0.92 }}>
          {q === null ? "Im Werkzeug trainiert. Der Haken sitzt." : q >= 0.8 ? `${Math.round(q * 100)} % ohne Hilfe – das sitzt. Die Wiederholung kommt über „Mein Training“ zum richtigen Zeitpunkt.`
            : q >= 0.5 ? `${Math.round(q * 100)} % ohne Hilfe – gute Basis. Die Fehlertypen landen in „Meine Fehler üben“.`
              : `${Math.round(q * 100)} % ohne Hilfe – noch wackelig. Kein Problem: Die Einheit ist abgehakt, das Thema kommt im Tagesplan früher wieder.`}
        </p>
      </div>
      {naechsteE ? (
        <div style={{ ...karte, marginTop: 12 }}>
          <p style={kicker}>Als Nächstes</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte }}>{naechsteE.name}</p>
          <p style={{ fontSize: 12.5, color: C.grau }}>{naechsteE.bereichTitel} · Station {naechsteE.sNr} · {naechsteE.stationTitel}</p>
          <GrosserKnopf onClick={() => gehe({ ansicht: "lernpfad", einheit: naechsteE.id })}>Nächste Einheit starten</GrosserKnopf>
          <GrosserKnopf ghost onClick={zurueck}>Zum Wochenplan</GrosserKnopf>
        </div>
      ) : <GrosserKnopf onClick={zurueck}>Zum Wochenplan</GrosserKnopf>}
    </Seitenrahmen>
  );
}

/* ======================================================================
   Seite
   ====================================================================== */
export function LernpfadSeite({ gehe, start = null }) {
  const P = useLernpfad();
  const [modus, setModus] = useState(() => (start && start.einheit ? "einheit" : "plan"));   // plan | einrichten | check | einheit
  const [einst, setEinst] = useState(null);
  const [einheitId, setEinheitId] = useState(start && start.einheit ? start.einheit : null);
  useEffect(() => { if (!P && modus === "plan") setModus("einrichten"); }, [P, modus]);

  if (!P || modus === "einrichten") {
    if (modus === "check" && einst) return <Standortcheck einst={einst} onAbbruch={() => setModus("einrichten")} onFertig={(check) => { pfadSetzen(planErzeugen({ ...einst, check })); setModus("plan"); window.scrollTo(0, 0); }} />;
    return <Einrichtung gehe={gehe} vorher={einst} onCheck={(e) => { setEinst(e); setModus("check"); window.scrollTo(0, 0); }} onOhneCheck={(e) => { pfadSetzen(planErzeugen(e)); setModus("plan"); window.scrollTo(0, 0); }} />;
  }
  const e = modus === "einheit" && einheitId ? einheit(einheitId) : null;
  if (e && P.reihenfolge.includes(e.id)) return <EinheitAnsicht key={e.id} e={e} P={P} gehe={gehe} zurueck={() => { setModus("plan"); window.scrollTo(0, 0); }} />;
  return <Wochenplan P={P} gehe={gehe} oeffnen={(id) => { setEinheitId(id); setModus("einheit"); window.scrollTo(0, 0); }} />;
}

/* ======================================================================
   Startseite: „Dein Plan“ – ganz oben, vor dem Werkzeugkasten
   ====================================================================== */
export function DeinPlanBlock({ gehe }) {
  const P = useLernpfad();
  const heute = useOffenHeute();
  const rahmen = { ...karte, marginTop: 14, borderTop: `4px solid ${C.flaggold}` };
  if (!P) return (
    <div className="auftauchen" style={rahmen}>
      <p style={kicker}>Dein Plan</p>
      <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35, color: C.tinte, marginBottom: 6 }}>Wo stehst du wirklich?</p>
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.65 }}>Fünfzehn Minuten Standortcheck, danach sagt dir die App jede Woche, was dran ist. Statt zu suchen.</p>
      <GrosserKnopf onClick={() => gehe({ ansicht: "lernpfad" })}>Standortcheck starten</GrosserKnopf>
    </div>
  );
  const ws = wochenStand(P);
  const n = naechsteEinheit(P);
  const e = n ? einheit(n) : null;
  return (
    <div className="auftauchen" style={{ ...rahmen, display: "flex", gap: 14, alignItems: "center" }}>
      <Ring ist={ws.ist} soll={ws.soll} groesse={74} dick={8} unter="Woche" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...kicker, marginBottom: 4 }}>Dein Plan · {PFADE[P.pfad].name}{P.termin ? ` · ${tageText(ws.tageBisTermin)}` : ""}</p>
        {e ? (<>
          <p style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.3, color: C.tinte }}>Heute: {e.name}</p>
          <p style={{ fontSize: 12.5, color: C.grau, marginTop: 2 }}>{e.bereichTitel} · {e.stationTitel} · rund 20 Minuten</p>
        </>) : (<>
          <p style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.3, color: C.tinte }}>Pfad geschafft</p>
          <p style={{ fontSize: 12.5, color: C.grau, marginTop: 2 }}>Weiter mit Prüfungsmodus und Abi-Ketten.</p>
        </>)}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
          <button type="button" onClick={() => gehe(e ? { ansicht: "lernpfad", einheit: e.id } : { ansicht: "lernpfad" })}
            style={{ minHeight: 40, padding: "6px 16px", borderRadius: 999, border: "none", background: C.smaragd, color: C.weiss, fontFamily: "inherit", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            {e ? "Einheit starten" : "Zum Plan"}
          </button>
          <Link onClick={() => gehe({ ansicht: "lernpfad" })}>Wochenplan</Link>
          {heute.geladen && heute.hatSkills && heute.offen > 0 && <Link onClick={() => gehe({ ansicht: "meintraining" })}>Heute fällig: {heute.offen}</Link>}
        </div>
      </div>
    </div>
  );
}
