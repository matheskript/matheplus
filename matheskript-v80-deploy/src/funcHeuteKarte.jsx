/* ======================================================================
   Heute-Karte (Startseite, Zone „1 Heute“, Rolle Schüler)
   Ersetzt die bloßen Knöpfe („Funktionen: Grundlagen ›“) durch das, was heute konkret ansteht:
   „Produktregel trainieren“, „Verkettungen bilden“, „Kettenregel (innere Ableitung)“ …

   · Zugeklappt (Standard): Kopf mit Umfang (Einheiten · Minuten · Aufgaben), Tagesleiste und eine
     Vorschau – je Einheit ein Medaillon mit Werkzeugzeichen, Tagesring und Kurzwort.
   · Aufgeklappt: je Einheit eine Karte mit Station, Auftrag, Inhalten, Grund („Neu für dich“,
     „Nochmal – zuletzt wackelig“ …), Umfang, Stand und Start-Knopf.
   Ein Tipp startet die Einheit gleich im passenden Modus (uebenWunsch, Lernweg-Kapitel, Fehlerziel).
   Logik in heuteFokus.js; Stand aus dem Protokoll (base2 PROTOKOLL), Fehler aus dem Trainingsstand.
   Auf-/Zu-Zustand je Gerät: localStorage „mm-heute-auf“.
   ====================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { PROTOKOLL } from "./base2.jsx";
import { LERN } from "./base3.jsx";
import { Text } from "./func3.jsx";
import { normiere } from "./trainingDaten.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { uebenWunschSetzen } from "./uebenWunsch.js";
import {
  FEHLER_ZIEL_SPEICHER, FUNKTIONEN_SPEICHER, GRUENDE, buchtJeEinheit, einheitWahl, erledigtHeute, fehlerFokus, heuteAnteil, tagesSumme, wannText,
} from "./heuteFokus.js";

const AUF_SCHLUESSEL = "mm-heute-auf";
const lies = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

/* Lernstand abonnieren (wie useLern in func6, ohne dessen Abhängigkeiten) */
function useLernstand() {
  const [, setZ] = useState(0);
  useEffect(() => {
    const h = () => setZ((z) => z + 1);
    if (LERN.hoerer) LERN.hoerer.add(h);
    window.addEventListener("matheplus:buchung", h);
    return () => { if (LERN.hoerer) LERN.hoerer.delete(h); window.removeEventListener("matheplus:buchung", h); };
  }, []);
  return LERN;
}

const TON = {
  neu: { bg: "#E8EFF9", fg: C.see },
  warn: { bg: "#FBEDE5", fg: "#9A4A22" },
  ruhig: { bg: "#EEF1F6", fg: C.grau },
  gold: { bg: "#FFF4CC", fg: "#7A5800" },
  gut: { bg: "#E6F4EC", fg: C.smaragd },
};

/* ---------- Bausteine ---------- */
function FehlerZeichen({ g = 22 }) {
  return (
    <svg width={g} height={g} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke={C.flaggold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4.5h-4.5" />
      <path d="M9 12.2l2.2 2.2L15.4 10" />
    </svg>
  );
}

/* Medaillon: Werkzeugzeichen auf Nachtblau, darum der Tagesring (Gold) */
function Medaillon({ zeichen, fehler, anteil, fertig, g = 58 }) {
  const r = g / 2 - 3, u = 2 * Math.PI * r;
  const innen = g - 12;
  const lang = String(zeichen || "").length;
  const schrift = lang <= 2 ? innen * 0.42 : lang <= 4 ? innen * 0.33 : innen * 0.24;
  return (
    <span style={{ position: "relative", width: g, height: g, flexShrink: 0, display: "inline-block" }} aria-hidden="true">
      <svg width={g} height={g} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={g / 2} cy={g / 2} r={r} fill="none" stroke={C.linie} strokeWidth="3" />
        {anteil > 0 && (
          <circle cx={g / 2} cy={g / 2} r={r} fill="none" stroke={fertig ? C.smaragd : C.flaggold} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={u} strokeDashoffset={u * (1 - Math.min(1, anteil))} style={{ transition: "stroke-dashoffset .6s ease" }} />
        )}
      </svg>
      <span style={{ position: "absolute", left: 6, top: 6, width: innen, height: innen, borderRadius: 999,
        background: `radial-gradient(120% 120% at 30% 20%, #1D3A7A 0%, ${C.seeTief} 70%)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center", color: C.flaggold, fontWeight: 800, fontSize: schrift, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        {fehler ? <FehlerZeichen g={innen * 0.5} /> : zeichen}
      </span>
      {fertig && (
        <span style={{ position: "absolute", right: -1, bottom: -1, width: 20, height: 20, borderRadius: 999, background: C.smaragd, border: `2px solid ${C.weiss}`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3L9.6 3.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      )}
    </span>
  );
}

function Pille({ children, hervor }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", minHeight: 26, padding: "2px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, lineHeight: 1.3,
      background: hervor ? "#FFF4CC" : C.sand, color: hervor ? "#5A4300" : C.tinte, border: `1px solid ${hervor ? "#F1D77A" : C.linie}` }}>
      <Text s={children} />
    </span>
  );
}

function Grund({ id, zusatz }) {
  const g = GRUENDE[id];
  if (!g) return null;
  const t = TON[g.ton] || TON.ruhig;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: t.bg, color: t.fg, whiteSpace: "nowrap" }}>
      {g.text}{zusatz ? <span style={{ fontWeight: 600, opacity: 0.85 }}>· {zusatz}</span> : null}
    </span>
  );
}

function Balken({ anteil, farbe = C.see }) {
  return (
    <span aria-hidden="true" style={{ display: "block", height: 5, borderRadius: 3, background: C.linie, overflow: "hidden" }}>
      <span style={{ display: "block", width: `${Math.round(Math.max(0, Math.min(1, anteil)) * 100)}%`, height: "100%", borderRadius: 3, background: farbe, transition: "width .5s ease" }} />
    </span>
  );
}

const prozent = (q) => `${Math.round(q * 100)} %`;

/* Stand-Zeile unter einer Einheit: was ist schon geschafft? */
function standText(x) {
  if (x.art === "fehler") {
    const f = x.fehler;
    if (f.grund === "vorsorge") return { text: "Bisher kein Fehlermuster – gut so. Sechs Aufgaben halten es so.", anteil: null };
    const weitere = f.weitere.length ? ` · außerdem: ${f.weitere.join(", ")}` : "";
    return { text: `${f.anzahl.beobachtet}× bei dir beobachtet${weitere}`, anteil: null };
  }
  const w = x.wahl;
  if (w.einheit.kapitel) return { text: `Kapitel ${w.index + 1} von ${w.anzahl} im Lernweg`, anteil: w.index / w.anzahl };
  if (buchtJeEinheit(x.id)) {
    const geuebt = Math.round(w.fortschritt * w.anzahl);
    const s = w.stand;
    const zuletzt = s && s.n ? ` · zuletzt ${prozent(s.quote)} richtig` : "";
    return { text: `${geuebt} von ${w.anzahl} Arten geübt${zuletzt}`, anteil: w.fortschritt };
  }
  const s = w.werkzeug;
  if (!s.n) return { text: "Noch nicht geübt – heute der Einstieg", anteil: 0 };
  return { text: `${s.n} Aufgaben gelöst · ${prozent(s.quote)} richtig · zuletzt ${wannText(s.tageHer)}`, anteil: s.quote };
}

/* ---------- Eine Einheit, aufgeklappt ---------- */
function EinheitKarte({ x, erste, starten }) {
  const e = x.einheit;
  const st = standText(x);
  const heute = x.anteil;
  const knopfText = x.erledigt ? "Nochmal" : heute > 0 ? "Weiter" : erste ? "Starten" : "Los";
  return (
    <article data-heute-einheit={x.key}
      style={{ position: "relative", display: "flex", flexDirection: "column", borderRadius: 16, padding: "14px 14px 12px", background: x.erledigt ? "#F7FBF8" : C.weiss,
        border: `1.5px solid ${erste && !x.erledigt ? C.flaggold : C.linie}`, boxShadow: erste && !x.erledigt ? "0 6px 18px rgba(237,187,0,0.14)" : "none" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Medaillon zeichen={x.zeichen} fehler={x.art === "fehler"} anteil={heute || 0} fertig={x.erledigt} g={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.11em", textTransform: "uppercase", color: C.gruenDunkel, lineHeight: 1.3 }}>{x.kicker}</p>
          <h4 style={{ margin: "3px 0 0", fontSize: 16.5, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25, color: C.tinte }}>{e.titel}</h4>
          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>
            {e.aufgaben} {e.aufgaben === 1 ? "Aufgabe" : "Aufgaben"} · ≈ {e.min} Min
            {heute > 0 && !x.erledigt && <span style={{ color: "#7A5800", fontWeight: 700 }}> · heute {x.heuteN} von {e.aufgaben}</span>}
          </p>
        </div>
      </div>

      {x.art === "fehler" ? (
        <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5 }}>
          <p style={{ margin: 0, color: C.tinte }}><Text s={e.inhalt[0]} /></p>
          <p style={{ margin: "6px 0 0", padding: "8px 10px", borderRadius: 10, background: C.sand, color: C.grau }}>
            <b style={{ color: C.gruenDunkel }}>Tipp </b><Text s={e.tipp} />
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {e.inhalt.map((t) => <Pille key={t} hervor={e.hervor === t}>{t}</Pille>)}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 11 }}>
        <Grund id={x.erledigt ? "geschafft" : x.grund} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: "auto", paddingTop: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 5px", fontSize: 11.5, color: C.grau, lineHeight: 1.35 }}>{st.text}</p>
          {st.anteil !== null && <Balken anteil={st.anteil} farbe={x.erledigt ? C.smaragd : C.see} />}
        </div>
        <button type="button" onClick={() => starten(x)} aria-label={`${knopfText}: ${e.titel}`}
          style={{ flexShrink: 0, minHeight: 40, padding: "8px 16px", borderRadius: 999, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
            border: `1.5px solid ${erste && !x.erledigt ? C.flaggold : C.see}`, background: erste && !x.erledigt ? C.flaggold : C.weiss,
            color: erste && !x.erledigt ? C.seeTief : C.see }}>
          {knopfText} <span aria-hidden="true">›</span>
        </button>
      </div>
    </article>
  );
}

/* ---------- Die Karte ---------- */
export function HeuteKarte({ o, empfehlungen, gehe, neu, name }) {
  const lern = useLernstand();
  const [auf, setAufRoh] = useState(() => lies(AUF_SCHLUESSEL) === "1");
  const setAuf = (v) => { setAufRoh(v); try { localStorage.setItem(AUF_SCHLUESSEL, v ? "1" : "0"); } catch { /* privat */ } };
  const jetzt = Date.now();
  const kapitel = lies(FUNKTIONEN_SPEICHER);
  const T = normiere(lern.training);

  const eintraege = useMemo(() => {
    const protokoll = PROTOKOLL.slice();
    const f = fehlerFokus(T, o.thema, { protokoll, jetzt });
    const fehlerAnteil = Math.min(1, f.stand.heute / f.einheit.aufgaben);
    const liste = [{
      key: "fehler", art: "fehler", fehler: f, einheit: f.einheit, grund: f.grund, kicker: "Meine Fehler üben",
      zeichen: null, anteil: fehlerAnteil, heuteN: f.stand.heute, erledigt: f.stand.heute >= f.einheit.aufgaben,
    }];
    for (const w of empfehlungen) {
      const wahl = einheitWahl(w.id, { protokoll, jetzt, kapitel });
      if (!wahl) continue;
      const anteil = heuteAnteil(wahl);
      liste.push({
        key: w.id, id: w.id, art: "werkzeug", wahl, werkzeug: w, einheit: wahl.einheit, grund: wahl.grund,
        kicker: `${w.station} · ${w.name}`, zeichen: (WERKZEUGE[w.id] || w).zeichen, anteil: anteil || 0,
        heuteN: (wahl.stand || wahl.werkzeug).heute, erledigt: erledigtHeute(wahl),
      });
    }
    return liste;
  }, [empfehlungen, kapitel, o.thema, PROTOKOLL.length, lern.zeit, lern.geladen, T.beobachtungen && T.beobachtungen.length]);   // eslint-disable-line react-hooks/exhaustive-deps

  const summe = tagesSumme(eintraege);
  const erstesOffen = eintraege.findIndex((x) => !x.erledigt);
  const alleFertig = erstesOffen < 0;

  const starten = (x) => {
    if (x.art === "fehler") {
      try { sessionStorage.setItem(FEHLER_ZIEL_SPEICHER, x.fehler.id); } catch { /* egal */ }
      gehe({ ansicht: "fehlertraining" });
      return;
    }
    const e = x.einheit, ziel = x.werkzeug.ziel;
    if (e.kapitel) { try { localStorage.setItem(FUNKTIONEN_SPEICHER, e.kapitel); } catch { /* egal */ } }
    if (e.art) uebenWunschSetzen(ziel.ansicht, { art: e.art });
    gehe(ziel);
  };

  return (
    <div className="auftauchen" data-heute-karte data-offen={auf ? "1" : "0"}
      style={{ background: C.weiss, borderRadius: 18, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", padding: "16px 16px 14px", marginTop: 12 }}>
      {/* Kopf */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: 0 }}>
          {name}{o.klasse ? ` · Klasse ${o.klasse}` : ""}
        </p>
        <button type="button" onClick={neu} style={{ background: "none", border: "none", padding: 4, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: C.see, cursor: "pointer" }}>Ändern</button>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 6 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, color: C.tinte }}>
            {alleFertig ? "Für heute geschafft" : `${summe.anzahl} Einheiten für heute`}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.grau }}>≈ {summe.min} Minuten · {summe.aufgaben} Aufgaben</p>
        </div>
        <p style={{ margin: 0, flexShrink: 0, textAlign: "right", lineHeight: 1 }} aria-label={`${summe.erledigt} von ${summe.anzahl} erledigt`}>
          <span style={{ fontSize: 26, fontWeight: 800, color: alleFertig ? C.smaragd : C.tinte, letterSpacing: "-0.03em" }}>{summe.erledigt}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.hellgrau }}>/{summe.anzahl}</span>
          <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau, marginTop: 4 }}>erledigt</span>
        </p>
      </div>
      {/* Tagesleiste: ein Segment je Einheit */}
      <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: `repeat(${eintraege.length}, minmax(0, 1fr))`, gap: 4, marginTop: 12 }}>
        {eintraege.map((x) => (
          <span key={x.key} style={{ height: 5, borderRadius: 3, background: C.linie, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${Math.round((x.erledigt ? 1 : x.anteil) * 100)}%`, background: x.erledigt ? C.smaragd : C.flaggold, transition: "width .5s ease" }} />
          </span>
        ))}
      </div>

      {/* Vorschau */}
      {!auf && (
        <button type="button" onClick={() => setAuf(true)} aria-expanded="false" aria-controls="heute-liste" data-heute-vorschau
          style={{ width: "100%", marginTop: 14, padding: 0, border: "none", background: "none", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
          <span style={{ display: "grid", gridTemplateColumns: `repeat(${eintraege.length}, minmax(0, 132px))`, justifyContent: "space-between", gap: 6, maxWidth: eintraege.length * 150 }}>
            {eintraege.map((x, i) => (
              <span key={x.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
                <Medaillon zeichen={x.zeichen} fehler={x.art === "fehler"} anteil={x.anteil} fertig={x.erledigt} />
                <span style={{ fontSize: 12, fontWeight: 700, color: i === erstesOffen ? C.tinte : C.grau, textAlign: "center", lineHeight: 1.2,
                  maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.einheit.kurz}</span>
              </span>
            ))}
          </span>
          {erstesOffen >= 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 12px", borderRadius: 12, background: "#FFFBEA", border: `1px solid #F3DE8A` }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A00" }}>Als Erstes</span>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eintraege[erstesOffen].einheit.titel}</span>
              </span>
              <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: "#8A6A00" }}>≈ {eintraege[erstesOffen].einheit.min} Min</span>
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, minHeight: 40, borderRadius: 12, background: C.himmel, color: C.see, fontSize: 14, fontWeight: 700 }}>
            Aufgaben im Detail
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </button>
      )}

      {/* Aufgeklappt */}
      {auf && (
        <div id="heute-liste" className="auftauchen" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 10, marginTop: 14 }}>
          {eintraege.map((x, i) => <EinheitKarte key={x.key} x={x} erste={i === erstesOffen} starten={starten} />)}
          <button type="button" onClick={() => setAuf(false)} aria-expanded="true" aria-controls="heute-liste"
            style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 40, borderRadius: 12, border: "none", background: C.himmel,
              color: C.see, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Zuklappen
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 7.5L6 4l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
