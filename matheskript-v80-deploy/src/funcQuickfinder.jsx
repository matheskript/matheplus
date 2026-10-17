/* ======================================================================
   QUICKFINDER – Status quo in der Kachel „Mein Training“ auf der Startseite
   Schulart (G8 · G9 · GMS) → Klasse (acht Boxen, Kursstufe gold) →
   Kapitel im Buch → Liste aller Hilfen der App zu diesem Kapitel.
   Daten: schulbuch.js. Auswahl bleibt im Browser (matheplus-quickfinder).
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { SCHULARTEN, SCHULART_STANDARD, THEMEN, hilfenFuer, kapitelFuer, klassenBoxen, roemisch, schulart as schulartVon, stufeAusKlassenBox } from "./schulbuch.js";

const SCHLUESSEL = "matheplus-quickfinder";
function lesen() {
  try {
    const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
    if (!v || typeof v !== "object") return null;
    if (!schulartVon(v.schulart)) return null;
    const box = klassenBoxen(v.schulart).find((b) => b.id === v.klasse) ? v.klasse : null;
    const kapitel = box && kapitelFuer(v.schulart, box).some((k) => k.id === v.kapitel) ? v.kapitel : null;
    return { schulart: v.schulart, klasse: box, kapitel };
  } catch { return null; }
}
function schreiben(v) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(v)); } catch { /* privat */ } }
export function quickfinderLesen() { return lesen(); }

const KICKER = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: 0 };
const knopfBasis = { fontFamily: "inherit", cursor: "pointer", borderRadius: 12, fontWeight: 700, lineHeight: 1.15, transition: "background .12s ease, color .12s ease, box-shadow .12s ease" };

/* Panel rechts oben: dunkelblauer Rahmen, darin Schulsystem (3 Tasten) und Klasse (3 × 3).
   Gewählt = gold. Die Klassen sind grau, bis ein Schulsystem gewählt ist. */
const GOLD_AN = { background: "linear-gradient(180deg, #F5CB2E 0%, #EDBB00 100%)", color: C.seeTief, borderColor: C.flaggold, boxShadow: "0 3px 10px rgba(237,187,0,0.35)" };

function SchulartWahl({ wert, setze }) {
  return (
    <div role="group" aria-label="Schulsystem wählen" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7 }}>
      {SCHULARTEN.map((s) => {
        const an = s.id === wert;
        return (
          <button key={s.id} type="button" aria-pressed={an} onClick={() => setze(s.id)} title={s.zeile} data-kein-i18n className="qf-taste"
            style={{ ...knopfBasis, minHeight: 40, padding: "4px", fontSize: 15.5, letterSpacing: "0.03em", borderRadius: 10,
              border: "2px solid rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)", color: C.weiss, ...(an ? GOLD_AN : {}) }}>
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

function KlassenWahl({ schulart, wert, setze }) {
  const boxen = klassenBoxen(schulart || SCHULART_STANDARD);
  const aus = !schulart;
  return (
    <div role="group" aria-label={aus ? "Klasse wählen – zuerst Schulsystem wählen" : "Klasse wählen"}
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7 }}>
      {boxen.map((b) => {
        const an = !aus && b.id === wert;
        return (
          <button key={b.id} type="button" aria-pressed={an} disabled={aus} onClick={() => setze(b.id)} data-kein-i18n className={aus ? undefined : "qf-taste"}
            aria-label={b.abi ? "Abi" : `Klasse ${b.label}`}
            style={{ ...knopfBasis, minHeight: 40, padding: "4px 2px", fontSize: 15.5, borderRadius: 10, cursor: aus ? "not-allowed" : "pointer",
              ...(aus
                ? { border: "2px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.32)" }
                : { border: "2px solid rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)", color: b.abi ? "#F5CB2E" : C.weiss, letterSpacing: b.abi ? "0.04em" : undefined }),
              ...(an ? GOLD_AN : {}) }}>
            {b.label}
          </button>
        );
      })}
    </div>
  );
}

/* Kapitel im Buch: ein Feld, das zur Liste aufklappt */
function KapitelWahl({ schulart, klasse, wert, setze }) {
  const [auf, setAuf] = useState(!wert);
  const kapitel = kapitelFuer(schulart, klasse);
  const gewaehlt = kapitel.find((k) => k.id === wert) || null;
  const s = schulartVon(schulart);
  return (
    <div style={{ marginTop: 14 }}>
      <button type="button" onClick={() => setAuf(!auf)} aria-expanded={auf}
        style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 50, padding: "8px 12px 8px 14px",
          border: `2px solid ${gewaehlt ? C.see : C.linie}`, background: gewaehlt && !auf ? C.himmel : C.weiss, color: C.tinte }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau }}>
            {klasse === "abi" ? <>Abi-Themen · {s?.name}</> : <>Thema im Buch · Klasse {klassenBoxen(schulart).find((b) => b.id === klasse)?.label} {s?.name}</>}
          </span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: gewaehlt ? C.tinte : C.see, marginTop: 2, lineHeight: 1.25 }}>
            {gewaehlt ? <><span data-kein-i18n>{roemisch(gewaehlt.nr)} · </span>{gewaehlt.titel}</> : (klasse === "abi" ? "Welches Abi-Thema willst du angehen?" : "In welchem Kapitel seid ihr gerade?")}
          </span>
        </span>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0, transform: auf ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}>
          <path d="M4 7 L9 12 L14 7" fill="none" stroke={C.see} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {auf && (
        <div className="auftauchen" role="listbox" aria-label="Kapitel im Buch" style={{ marginTop: 6, display: "grid", gap: 5 }}>
          {kapitel.map((k) => {
            const an = k.id === wert;
            return (
              <button key={k.id} type="button" role="option" aria-selected={an} onClick={() => { setze(k.id); setAuf(false); }}
                style={{ ...knopfBasis, display: "flex", alignItems: "center", gap: 10, textAlign: "left", width: "100%", minHeight: 44, padding: "7px 10px",
                  borderRadius: 11, border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.himmel : C.weiss, color: C.tinte, fontWeight: 600 }}>
                <span data-kein-i18n style={{ flexShrink: 0, width: 34, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: an ? C.see : C.grau, letterSpacing: "0.04em" }}>{roemisch(k.nr)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14.5, lineHeight: 1.25 }}>{k.titel}</span>
                  <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, marginTop: 1, lineHeight: 1.3 }}>{k.zeile}</span>
                </span>
              </button>
            );
          })}
          <p style={{ margin: "4px 2px 0", fontSize: 11.5, color: C.hellgrau, lineHeight: 1.5 }}>
            Reihenfolge wie im Lambacher Schweizer (Baden-Württemberg); je nach Schule kann sie abweichen.
          </p>
        </div>
      )}
    </div>
  );
}

const ETIKETT_NAME = { entdecken: "Entdecken", rechnen: "Rechnen", trainieren: "Trainieren" };

/* Alle Hilfen der App zu einem Kapitel */
function Hilfen({ kapitelId, gehe }) {
  const liste = hilfenFuer(kapitelId);
  const t = THEMEN[kapitelId];
  if (!t) return null;
  const werkzeuge = liste.filter((h) => h.art === "werkzeug");
  const seiten = liste.filter((h) => h.art === "seite");
  const Zeile = ({ h, gold }) => (
    <button type="button" onClick={() => gehe(h.ziel)}
      style={{ ...knopfBasis, width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left", minHeight: 48, padding: "8px 10px 8px 12px",
        borderRadius: 12, border: `1.5px solid ${gold ? C.flaggold : C.linie}`, background: gold ? "#FFFBEA" : C.weiss, fontWeight: 600 }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, color: C.tinte, lineHeight: 1.25 }}>{h.name}</span>
        <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.grau, marginTop: 1, lineHeight: 1.3 }}>{h.zeile}</span>
      </span>
      {h.etikett && <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.see, padding: "3px 7px", borderRadius: 999, background: C.himmel }}>{ETIKETT_NAME[h.etikett]}</span>}
      <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, color: gold ? "#8A6A00" : C.see }}>›</span>
    </button>
  );
  return (
    <div className="auftauchen" style={{ marginTop: 14 }}>
      <p style={{ ...KICKER, marginBottom: 8 }}>Dafür hilft dir in der App</p>
      {werkzeuge.length > 0 && (
        <div style={{ display: "grid", gap: 6 }}>
          {werkzeuge.map((h, i) => <Zeile key={h.id} h={h} gold={i === 0} />)}
        </div>
      )}
      {seiten.length > 0 && (
        <div style={{ display: "grid", gap: 6, marginTop: werkzeuge.length ? 10 : 0 }}>
          {seiten.map((h, i) => <Zeile key={h.id} h={h} gold={!werkzeuge.length && i === 0} />)}
        </div>
      )}
      <p style={{ margin: "10px 2px 0", fontSize: 12, color: C.hellgrau, lineHeight: 1.5 }}>
        Übungen genau zu diesem Kapitel kommen als Nächstes. Bis dahin: oben das erste Werkzeug ist der beste Einstieg.
      </p>
    </div>
  );
}

/* setzeStufe: stellt den Stufen-Schalter der Startseite (Mittel-/Oberstufe) mit ein.
   links: Inhalt der linken Spalte (Text der Kachel „Mein Training“); rechts sitzt das dunkelblaue Auswahl-Panel. */
export function Quickfinder({ gehe, setzeStufe, links }) {
  const [q, setQ] = useState(() => lesen() || { schulart: null, klasse: null, kapitel: null });
  const setze = (neu) => { setQ(neu); schreiben(neu); };
  const schulartSetzen = (id) => {
    if (id === q.schulart) return;
    // Die Klasse bleibt, wenn es sie im neuen Schulsystem gibt (z. B. 8 oder Abi); sonst neu wählen
    const bleibt = klassenBoxen(id).some((b) => b.id === q.klasse) ? q.klasse : null;
    setze({ schulart: id, klasse: bleibt, kapitel: null });
  };
  const klasseSetzen = (id) => {
    setze({ ...q, klasse: id, kapitel: null });
    const box = klassenBoxen(q.schulart).find((b) => b.id === id);
    if (box && setzeStufe) setzeStufe(stufeAusKlassenBox(box));
  };
  const s = schulartVon(q.schulart);
  const hinweis = !s ? "Wähle zuerst dein Schulsystem." : !q.klasse ? s.zeile + " · jetzt deine Klasse." : s.zeile;
  return (
    <>
      <style>{`.qf-kopf{display:grid;grid-template-columns:1fr;gap:14px;padding:16px}
        @media (min-width:600px){.qf-kopf{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:20px;padding:18px 18px 18px 20px;align-items:stretch}}
        @media (hover:hover){.qf-taste:hover{border-color:${C.flaggold} !important}}`}</style>
      <div className="qf-kopf">
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>{links}</div>
        <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, border: `2px solid ${C.seeTief}`, borderRadius: 14, padding: 12,
          boxShadow: "0 6px 18px rgba(0,40,100,0.22)", display: "flex", flexDirection: "column", gap: 10 }}>
          <SchulartWahl wert={q.schulart} setze={schulartSetzen} />
          <div aria-hidden="true" style={{ height: 1, background: "rgba(255,255,255,0.16)" }} />
          <KlassenWahl schulart={q.schulart} wert={q.klasse} setze={klasseSetzen} />
          <p style={{ margin: "0 2px", fontSize: 11.5, color: "#C9D6EE", lineHeight: 1.4 }}>{hinweis}</p>
        </div>
      </div>
      {q.schulart && q.klasse && (
        <div style={{ padding: "0 16px 16px" }}>
          <KapitelWahl key={q.schulart + q.klasse} schulart={q.schulart} klasse={q.klasse} wert={q.kapitel} setze={(id) => setze({ ...q, kapitel: id })} />
          {q.kapitel && <Hilfen kapitelId={q.kapitel} gehe={gehe} />}
        </div>
      )}
    </>
  );
}
