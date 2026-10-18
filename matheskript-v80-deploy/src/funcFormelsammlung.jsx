/* ======================================================================
   FORMELSAMMLUNG (neu)
   Nachschlagen · jede Formel mit Herleitung bzw. Beweis, interaktiver
   Illustration, Beispiel, typischer Falle, Zusammenhängen zu anderen
   Formeln und dem passenden Werkzeug zum Üben.
   Dazu die Roten Fäden: Wege quer durch alle Bereiche.
   Daten: fs*.js (fsIndex.js), Bilder: funcFsBilder1–7.jsx.
   ====================================================================== */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { FR } from "./funcRegistry.jsx";
import { WERKZEUGE } from "./werkzeuge.js";
import { FS_ALLE, FS_BEREICHE, FS_BEREICH_ALIAS, FS_DARAUF, FS_FAEDEN, FS_NACH_ID, FS_UNTERSTUFE, FS_ZUSATZ_ZIELE, STUFEN, STUFEN_INFO, bereichVon, fsSuche, herleitungen, istUnterstufe, stufenVon } from "./fsIndex.js";
import { BILDER_1 } from "./funcFsBilder1.jsx";
import { BILDER_2 } from "./funcFsBilder2.jsx";
import { BILDER_3 } from "./funcFsBilder3.jsx";
import { BILDER_4 } from "./funcFsBilder4.jsx";
import { BILDER_5 } from "./funcFsBilder5.jsx";
import { BILDER_6 } from "./funcFsBilder6.jsx";
import { BILDER_7 } from "./funcFsBilder7.jsx";
import { BILDER_8 } from "./funcFsBilder8.jsx";
import { BILDER_9 } from "./funcFsBilder9.jsx";
import { BILDER_10 } from "./funcFsBilder10.jsx";

import { springe } from "./sprung.js";
const BILDER = { ...BILDER_1, ...BILDER_2, ...BILDER_3, ...BILDER_4, ...BILDER_5, ...BILDER_6, ...BILDER_7, ...BILDER_8, ...BILDER_9, ...BILDER_10 };

const MERK = "matheplus-formeln-gemerkt";
const STUFE = "matheplus-stufe";
const lesen = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
const schreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };
const stufeLesen = () => { try { const v = localStorage.getItem(STUFE); return STUFEN.includes(v) ? v : "alle"; } catch (e) { return "alle"; } };
const passt = (e, st) => st === "alle" || stufenVon(e).includes(st);

/* Stufenfarben: Lila nur für Unterstufen-Markierungen, nicht für Flächen */
export const STUFEN_FARBE = {
  unter: { text: "#5B4BA6", grund: "#ECE8FA", rand: "#CFC6F0" },
  mittel: { text: C.see, grund: C.himmel, rand: "#C5D5EE" },
  ober: { text: C.gruenDunkel, grund: "#FFF6DA", rand: "#EBD58F" },
};

/* Stufenmarken einer Formel: eine Marke je Stufe, bei Unterstufe/kl zusätzlich die Klasse */
function StufenMarken({ e, lang }) {
  const st = stufenVon(e);
  return (
    <>
      {st.map((x) => {
        const f = STUFEN_FARBE[x], info = STUFEN_INFO[x];
        const klasse = e.kl && e.kl >= info.von && e.kl <= info.bis ? e.kl : null;
        return (
          <span key={x} title={`${info.name} · ${info.klassen}`} aria-label={`${info.name}${klasse ? `, eingeführt in Klasse ${klasse}` : ""}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: lang ? 10.5 : 10, fontWeight: 700, letterSpacing: "0.03em", padding: lang ? "3px 8px" : "2px 7px", borderRadius: 999, background: f.grund, color: f.text, whiteSpace: "nowrap" }}>
            {lang ? info.name : info.kurz}{klasse ? <span style={{ fontWeight: 600, opacity: 0.85 }}>{lang ? ` · Klasse ${klasse}` : ` · Kl. ${klasse}`}</span> : null}
          </span>
        );
      })}
    </>
  );
}

/* Unterstufen-Ansicht: so geordnet, wie man in Klasse 5 anfängt – Zahlen zuerst, Zuordnungen und Daten am Ende */
const UNTER_FOLGE = ["zahlen", "kopfrechnen", "geometrie", "terme", "funktionen", "stochastik"];
const FS_UNTER_LISTE = FS_ALLE.filter(istUnterstufe)
  .map((e, i) => [e, i]).sort(([a, i], [b, j]) => {
    const x = UNTER_FOLGE.indexOf(a.bereich), y = UNTER_FOLGE.indexOf(b.bereich);
    return (x < 0 ? 99 : x) - (y < 0 ? 99 : y) || i - j;
  }).map(([e]) => e);

const FS_CSS = `@media (max-width: 400px) { .fs-stufe-lang { display: none; } .fs-beweise { display: none; } }`;

const kicker = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 10px" };
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 14px rgba(15,26,51,0.07)" };

/* ---------- kleine Bausteine ---------- */
function Chip({ an, onClick, children, label }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={an} aria-label={label}
      style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: an ? 700 : 500, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
        border: `1px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.tinte, transition: "background 0.15s, color 0.15s" }}>
      {children}
    </button>
  );
}

function Marke({ children, farbe = C.see, grund = C.himmel }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 999, background: grund, color: farbe, whiteSpace: "nowrap" }}>{children}</span>;
}

const Pfeilchen = ({ links }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d={links ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Ein Schritt einer Herleitung: Text mit $…$, abgesetzte Formel "$$…" mit optionaler Notiz "|| …" */
function Schritt({ s, nr, aktiv = true }) {
  const formel = s.startsWith("$$");
  const [tex, notiz] = formel ? s.slice(2).split(" || ") : [null, null];
  return (
    <div style={{ display: "flex", gap: 12, opacity: aktiv ? 1 : 0.35, transition: "opacity 0.25s" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 24, height: 24, marginTop: formel ? 8 : 1, borderRadius: 999, background: formel ? C.himmel : C.sand,
        color: formel ? C.see : C.gruenDunkel, fontSize: 11.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{nr}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        {formel ? (
          <div style={{ background: "#F7F9FD", borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ fontSize: 16.5, lineHeight: 2.05, color: C.tinte, overflowX: "auto", overflowY: "hidden" }}><M t={tex} /></div>
            {notiz && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.grau, fontWeight: 500 }}>{notiz}</p>}
          </div>
        ) : (
          <Text s={s} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: C.tinte }} />
        )}
      </div>
    </div>
  );
}

function Herleitung({ e }) {
  const liste = herleitungen(e);
  const [nr, setNr] = useState(0);
  const [schritt, setSchritt] = useState(null);   // null = alle zeigen
  const h = liste[Math.min(nr, liste.length - 1)];
  useEffect(() => { setNr(0); setSchritt(null); }, [e.id]);
  if (!h) return null;
  const sichtbar = schritt === null ? h.s.length : schritt + 1;
  return (
    <section style={{ marginTop: 26 }}>
      <p style={kicker}>{liste.length > 1 ? `Warum gilt das? · ${liste.length} Wege` : "Warum gilt das?"}</p>
      {liste.length > 1 && (
        <div role="tablist" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 6, scrollbarWidth: "none" }}>
          {liste.map((x, i) => <Chip key={i} an={i === nr} onClick={() => { setNr(i); setSchritt(null); }}>{x.t}</Chip>)}
        </div>
      )}
      <div style={{ ...karte, padding: "16px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: C.tinte }}>{h.t}</p>
          {h.s.length > 2 && (
            <button type="button" onClick={() => setSchritt(schritt === null ? 0 : null)}
              style={{ border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, borderRadius: 999, padding: "5px 11px", fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              {schritt === null ? "Schritt für Schritt" : "Alles zeigen"}
            </button>
          )}
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {h.s.slice(0, sichtbar).map((s, i) => <Schritt key={`${nr}-${i}`} s={s} nr={i + 1} aktiv={schritt === null || i === schritt || i < schritt} />)}
        </div>
        {schritt !== null && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button type="button" disabled={schritt === 0} onClick={() => setSchritt(schritt - 1)}
              style={{ flex: "0 0 auto", minHeight: 42, padding: "0 16px", borderRadius: 12, border: `1px solid ${C.linie}`, background: C.weiss, color: schritt === 0 ? C.hellgrau : C.see, fontFamily: "inherit", fontWeight: 700, cursor: schritt === 0 ? "default" : "pointer" }}>
              Zurück
            </button>
            <button type="button" onClick={() => (schritt < h.s.length - 1 ? setSchritt(schritt + 1) : setSchritt(null))}
              style={{ flex: 1, minHeight: 42, borderRadius: 12, border: "none", background: C.see, color: C.weiss, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {schritt < h.s.length - 1 ? `Nächster Schritt (${schritt + 2}/${h.s.length})` : "Fertig – alles zeigen"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Zusammenhänge: Karte um die Formel herum ---------- */
function VerweisZeile({ id, wie, oeffne, richtung }) {
  const z = FS_NACH_ID[id];
  if (!z) return null;
  const b = bereichVon(z.bereich);
  return (
    <button type="button" onClick={() => oeffne(id)}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 14, border: `1px solid ${C.linie}`, background: C.weiss,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 8, alignSelf: "stretch", borderRadius: 4, background: richtung === "auf" ? C.gruen : C.see, opacity: 0.85 }} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{z.n}</span>
          {z.bereich && <span style={{ fontSize: 11, fontWeight: 600, color: C.hellgrau }}>{b.kurz || b.name}</span>}
        </span>
        <span style={{ display: "block", fontSize: 12.5, color: C.grau, lineHeight: 1.45, marginTop: 2 }}>{wie}</span>
      </span>
      <span style={{ color: C.see }}><Pfeilchen /></span>
    </button>
  );
}

function Zusammenhaenge({ e, oeffne, zuFaden }) {
  const auf = (e.nutzt || []).filter(([id]) => FS_NACH_ID[id]);
  /* Was schon unter »Baut auf« steht, nicht noch einmal unter »Wird gebraucht für« zeigen */
  const fuer = (FS_DARAUF[e.id] || []).filter(([id]) => FS_NACH_ID[id] && !auf.some(([a]) => a === id));
  const faeden = FS_FAEDEN.filter((f) => f.stationen.some(([id]) => id === e.id));
  if (!auf.length && !fuer.length && !faeden.length) return null;
  return (
    <section style={{ marginTop: 26 }}>
      <p style={kicker}>Zusammenhänge</p>
      <div style={{ ...karte, padding: 16 }}>
        {auf.length > 0 && (
          <>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.gruenDunkel }}>Baut auf</p>
            <div style={{ display: "grid", gap: 8 }}>{auf.map(([id, wie]) => <VerweisZeile key={id} id={id} wie={wie} oeffne={oeffne} richtung="auf" />)}</div>
          </>
        )}
        <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: auf.length && fuer.length ? "10px 0" : "12px 0 4px" }}>
          {auf.length > 0 && <span style={{ width: 2, height: 14, background: C.gruen, opacity: 0.6 }} />}
          <span style={{ padding: "6px 14px", borderRadius: 999, background: C.seeTief, color: C.weiss, fontSize: 13, fontWeight: 700, maxWidth: "100%", textAlign: "center" }}>{e.n}</span>
          {fuer.length > 0 && <span style={{ width: 2, height: 14, background: C.see, opacity: 0.6 }} />}
        </div>
        {fuer.length > 0 && (
          <>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.see }}>Wird gebraucht für</p>
            <div style={{ display: "grid", gap: 8 }}>{fuer.map(([id, wie]) => <VerweisZeile key={id} id={id} wie={wie} oeffne={oeffne} richtung="fuer" />)}</div>
          </>
        )}
        {faeden.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.linie}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.tinte }}>Liegt auf {faeden.length === 1 ? "dem Roten Faden" : "den Roten Fäden"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {faeden.map((f) => (
                <button key={f.id} type="button" onClick={() => zuFaden(f.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.sand, color: C.tinte, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: "#C2557A" }} />{f.titel}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Ueben({ e, zuHerleitung }) {
  const w = e.wz ? (WERKZEUGE[e.wz] ? { name: WERKZEUGE[e.wz].name, zeile: WERKZEUGE[e.wz].zeile, ziel: WERKZEUGE[e.wz].ziel } : FS_ZUSATZ_ZIELE[e.wz]) : null;
  if (!w && !e.kap) return null;
  return (
    <section style={{ marginTop: 26 }}>
      <p style={kicker}>Selbst ausprobieren</p>
      <div style={{ display: "grid", gap: 8 }}>
        {w && (
          <button type="button" onClick={() => FR.gehe && FR.gehe(w.ziel)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, boxShadow: "0 2px 10px rgba(0,77,152,0.08)" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: C.see, color: C.flaggold, fontSize: 16, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>↪</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}>{w.name}</span>
              <span style={{ display: "block", fontSize: 12.5, color: C.grau, lineHeight: 1.35, marginTop: 2 }}>{w.zeile}</span>
            </span>
            <Pfeilchen />
          </button>
        )}
        {e.kap && zuHerleitung && (
          <button type="button" onClick={() => zuHerleitung(e.kap)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              border: `1px solid ${C.linie}`, background: C.weiss, color: C.tinte }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: C.sand, color: C.gruenDunkel, fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{e.kap}</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, lineHeight: 1.25 }}>Herleitung im Training</span>
              <span style={{ display: "block", fontSize: 12.5, color: C.grau, lineHeight: 1.35, marginTop: 2 }}>Kapitel {e.kap} mit Aufgaben zum Mitrechnen</span>
            </span>
            <Pfeilchen />
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------- Detailseite einer Formel ---------- */
function Detail({ e, zurueck, oeffne, zuFaden, zuHerleitung, gemerkt, merken, nachbarn }) {
  const b = bereichVon(e.bereich);
  const Bild = e.bild ? BILDER[e.bild[0]] : null;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <button type="button" onClick={zurueck}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 12px 8px 8px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Pfeilchen links /> Zurück
        </button>
        <button type="button" onClick={merken} aria-pressed={gemerkt} aria-label={gemerkt ? "Nicht mehr merken" : "Formel merken"}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, border: `1px solid ${gemerkt ? C.gruen : C.linie}`, background: gemerkt ? "#FFF6DA" : C.weiss, color: gemerkt ? C.gruenDunkel : C.grau, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>{gemerkt ? "★" : "☆"}</span>{gemerkt ? "Gemerkt" : "Merken"}
        </button>
      </div>
      <p style={{ margin: "0 0 6px", fontSize: 12.5, fontWeight: 600, color: C.hellgrau }}>{b.name} · {e.g}</p>
      <h2 style={{ margin: 0, fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: C.tinte }}>{e.n}</h2>
      <div style={{ marginTop: 16, borderRadius: 20, padding: "20px 18px 16px", background: `linear-gradient(160deg, ${C.weiss} 0%, ${C.himmel} 100%)`, boxShadow: "0 2px 16px rgba(15,26,51,0.08)", border: `1px solid ${C.linie}` }}>
        <div style={{ fontSize: 21, lineHeight: 2, color: C.tinte, overflowX: "auto", overflowY: "hidden" }}><M t={e.f} /></div>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: C.grau, lineHeight: 1.6 }}>{e.k}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          <StufenMarken e={e} lang />
          {herleitungen(e).length > 0 && <Marke farbe={C.gruenDunkel} grund="#FFF6DA">{herleitungen(e).length > 1 ? `${herleitungen(e).length} Beweise` : "Herleitung"}</Marke>}
          {Bild && <Marke farbe="#2F8F5B" grund="#E3F3E9">interaktives Bild</Marke>}
        </div>
      </div>

      {Bild && (
        <section style={{ marginTop: 26 }}>
          <p style={kicker}>Im Bild</p>
          <div style={{ ...karte, padding: "14px 14px 12px" }}>{Bild(e.bild[1] || {})}</div>
        </section>
      )}

      <Herleitung e={e} />

      {e.bsp && e.bsp.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <p style={kicker}>Beispiel</p>
          <div style={{ ...karte, padding: 16, display: "grid", gap: 10 }}>
            {e.bsp.map((s, i) => (s.startsWith("$$")
              ? <div key={i} style={{ fontSize: 16.5, lineHeight: 2, overflowX: "auto", overflowY: "hidden", color: C.tinte }}><M t={s.slice(2).split(" || ")[0]} /></div>
              : <Text key={i} s={s} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: C.tinte }} />))}
          </div>
        </section>
      )}

      {e.falle && (
        <section style={{ marginTop: 26 }}>
          <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 16, background: "#FDF1F5", border: "1px solid #F3D3DF" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, background: "#C2557A", color: C.weiss, fontWeight: 800, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>!</span>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#9C3A5E" }}>Vorsicht, Falle</p>
              <Text s={e.falle} style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: C.tinte }} />
            </div>
          </div>
        </section>
      )}

      <Zusammenhaenge e={e} oeffne={oeffne} zuFaden={zuFaden} />
      <Ueben e={e} zuHerleitung={zuHerleitung} />

      {(nachbarn[0] || nachbarn[1]) && (
        <nav aria-label="Weitere Formeln" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 30 }}>
          {[0, 1].map((i) => {
            const n = nachbarn[i];
            if (!n) return <span key={i} />;
            return (
              <button key={i} type="button" onClick={() => oeffne(n.id, true)}
                style={{ display: "flex", flexDirection: "column", alignItems: i ? "flex-end" : "flex-start", gap: 2, padding: "11px 13px", borderRadius: 14, border: `1px solid ${C.linie}`, background: C.weiss, cursor: "pointer", fontFamily: "inherit", textAlign: i ? "right" : "left", minWidth: 0 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11.5, fontWeight: 600, color: C.hellgrau }}>{i ? <>Nächste <Pfeilchen /></> : <><Pfeilchen links /> Vorige</>}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3, overflowWrap: "anywhere" }}>{n.n}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/* ---------- Karte in der Liste ---------- */
function FormelKarte({ e, onClick, zeigeBereich, gemerkt, verdeckt }) {
  const anzahl = herleitungen(e).length;
  const [offen, setOffen] = useState(false);
  useEffect(() => { setOffen(false); }, [verdeckt]);
  const zu = verdeckt && !offen;
  return (
    <button type="button" onClick={() => (zu ? setOffen(true) : onClick())} data-formel={e.id} aria-label={zu ? `${e.n} – Formel aufdecken` : undefined}
      style={{ width: "100%", display: "block", textAlign: "left", fontFamily: "inherit", cursor: "pointer", border: "none", ...karte, padding: "14px 16px 12px", marginBottom: 9, color: C.tinte }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "nowrap" }}>
        <span style={{ minWidth: 0, flex: "1 1 0", overflowWrap: "anywhere" }}>
          {zeigeBereich && <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.hellgrau, marginBottom: 1 }}>{bereichVon(e.bereich).name}</span>}
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>{gemerkt && <span aria-label="gemerkt" style={{ color: C.gruen, marginRight: 4 }}>★</span>}{e.n}</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: "auto", color: C.see }}>
          <span className="fs-stufen" style={{ display: "inline-flex", gap: 4 }}><StufenMarken e={e} /></span>
          {anzahl > 1 && <span className="fs-beweise" style={{ fontSize: 10.5, fontWeight: 700, color: C.gruenDunkel, background: "#FFF6DA", borderRadius: 999, padding: "2px 7px" }}>{anzahl} Beweise</span>}
          {e.bild && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#2F8F5B", background: "#E3F3E9", borderRadius: 999, padding: "2px 7px" }}>Bild</span>}
          <Pfeilchen />
        </span>
      </span>
      {zu ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6, minHeight: 40, borderRadius: 10, border: `1.5px dashed ${C.linie}`, background: C.sand, color: C.hellgrau, fontSize: 13, fontWeight: 600 }}>
          Weißt du die Formel? Tippen zum Aufdecken
        </span>
      ) : (
        <span style={{ display: "block", fontSize: 16.5, lineHeight: 2, color: C.tinte, overflowX: "auto", overflowY: "hidden", marginTop: 4 }}><M t={e.f} /></span>
      )}
    </button>
  );
}

/* ---------- Rote Fäden ---------- */
function FadenListe({ oeffneFaden }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <p style={{ margin: "0 0 6px", fontSize: 14.5, color: C.grau, lineHeight: 1.65 }}>
        Formeln stehen nicht allein. Jeder Rote Faden führt quer durch die Bereiche – von einer einfachen Idee bis zu einer Formel, die man sonst nur auswendig lernt.
      </p>
      {FS_FAEDEN.map((f) => {
        const bereiche = [...new Set(f.stationen.map(([id]) => FS_NACH_ID[id].bereich))];
        const abUnter = f.stationen.some(([id]) => stufenVon(FS_NACH_ID[id]).includes("unter"));
        return (
          <button key={f.id} type="button" onClick={() => oeffneFaden(f.id)}
            style={{ ...karte, border: "none", textAlign: "left", fontFamily: "inherit", cursor: "pointer", padding: "15px 16px", color: C.tinte, display: "block", width: "100%" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span aria-hidden="true" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                {f.stationen.slice(0, 5).map((_, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span style={{ width: 7, height: 2, background: "#C2557A", opacity: 0.6 }} />}
                    <span style={{ width: 9, height: 9, borderRadius: 999, border: "2px solid #C2557A", background: i === 0 ? "#C2557A" : C.weiss }} />
                  </React.Fragment>
                ))}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.hellgrau }}>{f.stationen.length} Stationen</span>
              {abUnter && <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.03em", padding: "2px 8px", borderRadius: 999, background: STUFEN_FARBE.unter.grund, color: STUFEN_FARBE.unter.text, whiteSpace: "nowrap" }}>ab Klasse 5–7</span>}
            </span>
            <span style={{ display: "block", fontSize: 16, fontWeight: 700, marginTop: 8, lineHeight: 1.3 }}>{f.titel}</span>
            <span style={{ display: "block", fontSize: 13.5, color: C.grau, lineHeight: 1.55, marginTop: 4 }}>{f.text}</span>
            <span style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
              {bereiche.map((b) => <Marke key={b} farbe={C.grau} grund={C.sand}>{bereichVon(b).kurz || bereichVon(b).name}</Marke>)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FadenDetail({ f, zurueck, oeffne }) {
  return (
    <div>
      <button type="button" onClick={zurueck}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 12px 8px 8px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
        <Pfeilchen links /> Alle Roten Fäden
      </button>
      <p style={{ margin: "0 0 6px", fontSize: 12.5, fontWeight: 600, color: "#C2557A" }}>Roter Faden · {f.stationen.length} Stationen</p>
      <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte }}>{f.titel}</h2>
      <p style={{ margin: "8px 0 20px", fontSize: 14.5, color: C.grau, lineHeight: 1.65 }}>{f.text}</p>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {f.stationen.map(([id, wie], i) => {
          const e = FS_NACH_ID[id];
          const letzte = i === f.stationen.length - 1;
          return (
            <li key={id} style={{ display: "grid", gridTemplateColumns: "28px 1fr", columnGap: 10 }}>
              <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 18, height: 18, marginTop: 16, borderRadius: 999, border: "3px solid #C2557A", background: i === 0 || letzte ? "#C2557A" : C.weiss, flexShrink: 0 }} />
                {!letzte && <span style={{ width: 4, flex: 1, background: "#C2557A", opacity: 0.55, borderRadius: 2 }} />}
              </div>
              <div style={{ paddingBottom: letzte ? 0 : 6, minWidth: 0 }}>
                <button type="button" onClick={() => oeffne(id)}
                  style={{ ...karte, border: "none", width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", padding: "12px 14px", color: C.tinte, display: "block" }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700 }}>{e.n}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.hellgrau, whiteSpace: "nowrap" }}>{bereichVon(e.bereich).kurz || bereichVon(e.bereich).name}</span>
                  </span>
                  <span style={{ display: "block", fontSize: 15.5, lineHeight: 1.9, overflowX: "auto", overflowY: "hidden", marginTop: 2 }}><M t={e.f} /></span>
                </button>
                {wie && <p style={{ margin: "10px 2px 14px", fontSize: 13.5, color: C.grau, lineHeight: 1.6, fontStyle: "italic" }}>{wie}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ======================================================================
   Spickzettel: kompakt Name + Formel, zweispaltig ab 600 px, druckbar
   ====================================================================== */
const SPICK_CSS = `
.fs-spick-raster { display: grid; grid-template-columns: 1fr; gap: 0 22px; }
@media (min-width: 600px) { .fs-spick-raster { grid-template-columns: 1fr 1fr; } }
.fs-spick-zeile { break-inside: avoid; page-break-inside: avoid; }
@media print {
  @page { size: A4; margin: 12mm; }
  body * { visibility: hidden !important; }
  .fs-druck, .fs-druck * { visibility: visible !important; }
  .fs-druck { position: absolute !important; left: 0; top: 0; width: 100% !important; padding: 0 !important; box-shadow: none !important; }
  .fs-druck .fs-spick-raster { grid-template-columns: 1fr 1fr !important; }
  .fs-druck-weg { display: none !important; }
}`;

function Spickzettel({ titel, stufeText, liste, gruppeVon, oeffne }) {
  const gruppen = [...new Set(liste.map(gruppeVon))];
  return (
    <div>
      <style>{SPICK_CSS}</style>
      <div className="fs-druck-weg" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "0 0 12px", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.grau, lineHeight: 1.5 }}>Alle Formeln auf einen Blick. Tippe eine Formel an, um sie zu öffnen.</p>
        <button type="button" onClick={() => window.print()}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "none", background: C.see, color: C.weiss, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
          Als PDF sichern
        </button>
      </div>
      <div className="fs-druck" style={{ ...karte, padding: "18px 18px 10px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, borderBottom: `2px solid ${C.see}`, paddingBottom: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.tinte, letterSpacing: "-0.01em" }}>Formelsammlung · {titel}</p>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.hellgrau }}>Mythos Mathe · {stufeText}</p>
        </div>
        {gruppen.map((g) => (
          <section key={g} style={{ marginTop: 12 }}>
            <p className="fs-spick-zeile" style={{ margin: "0 0 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.gruenDunkel }}>{g}</p>
            <div className="fs-spick-raster">
              {liste.filter((x) => gruppeVon(x) === g).map((x) => (
                <button key={x.id} type="button" className="fs-spick-zeile" onClick={() => oeffne(x.id)}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderTop: `1px solid ${C.linie}`, padding: "6px 0 4px", fontFamily: "inherit", cursor: "pointer", color: C.tinte, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: C.grau }}>{x.n}</span>
                  <span style={{ display: "block", fontSize: 14, lineHeight: 1.9, overflowX: "auto", overflowY: "hidden" }}><M t={x.f} /></span>
                </button>
              ))}
            </div>
          </section>
        ))}
        <p style={{ margin: "14px 0 4px", fontSize: 10, color: C.hellgrau, textAlign: "right" }}>mythosmathe.de · {liste.length} Formeln</p>
      </div>
    </div>
  );
}

/* ======================================================================
   Hauptkomponente
   ====================================================================== */
export function FormelsammlungNeu({ bereich: start = "analysis", formel: startFormel = null, zuHerleitung }) {
  const startBereich = startFormel && FS_NACH_ID[startFormel] ? FS_NACH_ID[startFormel].bereich : (FS_BEREICH_ALIAS[start] || start);
  const [modus, setModus] = useState("liste");              // liste | faeden
  const [bereich, setBereich] = useState(startBereich === "unterstufe" || FS_BEREICHE.some((b) => b.id === startBereich) ? startBereich : "analysis");
  const [suche, setSuche] = useState("");
  const [stufe, setStufe] = useState(stufeLesen);
  const [detail, setDetail] = useState(startFormel && FS_NACH_ID[startFormel] ? startFormel : null);
  const [faden, setFaden] = useState(null);
  const [verlauf, setVerlauf] = useState([]);              // Rückweg: [{detail, faden, modus}]
  const [gemerkt, setGemerkt] = useState(() => lesen(MERK, []));
  const [verdecken, setVerdecken] = useState(false);       // Abdeck-Modus (nur Gemerkt)
  const [mischung, setMischung] = useState(null);          // gemischte Reihenfolge der gemerkten Formeln
  const obenRef = useRef(null);
  const listenScroll = useRef(0);

  const nachOben = () => {
    const el = obenRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    springe("formelsammlung-detail", () => window.scrollTo({ top: Math.max(0, y), behavior: "auto" }));
  };

  const oeffne = (id, ersetzen = false) => {
    if (!FS_NACH_ID[id]) return;
    if (!detail && !faden) listenScroll.current = window.scrollY;
    if (!ersetzen) setVerlauf((v) => [...v, { detail, faden, modus }]);
    setDetail(id);
    setTimeout(nachOben, 0);
  };
  const zuFaden = (id) => {
    setVerlauf((v) => [...v, { detail, faden, modus }]);
    setModus("faeden"); setFaden(id); setDetail(null);
    setTimeout(nachOben, 0);
  };
  const zurueck = () => {
    const v = [...verlauf];
    const letzter = v.pop();
    setVerlauf(v);
    if (letzter) { setDetail(letzter.detail); setFaden(letzter.faden); setModus(letzter.modus); }
    else { setDetail(null); setFaden(null); }
    setTimeout(() => {
      if (!letzter || (!letzter.detail && !letzter.faden)) springe("formelsammlung-detail", () => window.scrollTo({ top: listenScroll.current, behavior: "auto" }));
      else nachOben();
    }, 0);
  };
  const merken = (id) => {
    const neu = gemerkt.includes(id) ? gemerkt.filter((x) => x !== id) : [...gemerkt, id];
    setGemerkt(neu); schreiben(MERK, neu);
  };
  const stufeSetzen = (s) => { setStufe(s); try { localStorage.setItem(STUFE, s); } catch (e) { /* privat */ } };

  /* Wird die Formelsammlung mit neuem Ziel aufgerufen (Deep-Link), dorthin springen */
  useEffect(() => { if (startFormel && FS_NACH_ID[startFormel]) { setDetail(startFormel); setModus("liste"); } }, [startFormel]);

  const treffer = useMemo(() => {
    const s = suche.trim();
    if (s) return fsSuche(s).filter((e) => passt(e, stufe));
    if (bereich === "gemerkt") {
      const g = FS_ALLE.filter((e) => gemerkt.includes(e.id));
      return mischung ? mischung.map((id) => g.find((e) => e.id === id)).filter(Boolean) : g;
    }
    if (bereich === "unterstufe") return FS_UNTER_LISTE;
    return FS_ALLE.filter((e) => e.bereich === bereich && passt(e, stufe));
  }, [suche, bereich, stufe, gemerkt, mischung]);

  const e = detail ? FS_NACH_ID[detail] : null;
  if (e) {
    const geschw = bereich === "unterstufe" && !suche.trim() && istUnterstufe(e) ? FS_UNTER_LISTE : FS_ALLE.filter((x) => x.bereich === e.bereich);
    const i = geschw.findIndex((x) => x.id === e.id);
    return (
      <div ref={obenRef} className="mx-auto px-6 pb-16" style={{ maxWidth: 680, paddingTop: 22 }}>
        <Detail key={e.id} e={e} zurueck={zurueck} oeffne={oeffne} zuFaden={zuFaden} zuHerleitung={zuHerleitung}
          gemerkt={gemerkt.includes(e.id)} merken={() => merken(e.id)} nachbarn={[geschw[i - 1], geschw[i + 1]]} />
      </div>
    );
  }

  const gesamt = FS_ALLE.length;
  const beweise = FS_ALLE.reduce((s, x) => s + herleitungen(x).length, 0);
  const bilder = FS_ALLE.filter((x) => x.bild).length;
  const unterAnsicht = bereich === "unterstufe";
  const bInfo = bereich === "gemerkt" ? { name: "Gemerkt", zeile: "Deine gemerkten Formeln" } : unterAnsicht ? FS_UNTERSTUFE : bereichVon(bereich);
  /* In der Unterstufen-Ansicht nach Bereich und Gruppe gliedern, sonst nach Gruppe */
  const gruppeVon = (x) => (unterAnsicht ? `${bereichVon(x.bereich).kurz || bereichVon(x.bereich).name} · ${x.g}` : x.g);
  const gruppen = suche.trim() ? null : [...new Set(treffer.map(gruppeVon))];
  const uf = STUFEN_FARBE.unter;

  return (
    <div ref={obenRef} className="mx-auto px-6 pb-16" style={{ maxWidth: 680, paddingTop: 22 }}>
      <style>{FS_CSS}</style>
      <div role="tablist" aria-label="Ansicht" className="fs-druck-weg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, padding: 4, borderRadius: 14, background: C.himmel, marginBottom: 16 }}>
        {[["liste", "Nachschlagen"], ["spick", "Spickzettel"], ["faeden", "Rote Fäden"]].map(([m, t]) => (
          <button key={m} type="button" role="tab" aria-selected={modus === m} onClick={() => { setModus(m); setFaden(null); if (m === "spick") setSuche(""); }}
            style={{ minHeight: 40, borderRadius: 11, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: modus === m ? C.weiss : "transparent", color: modus === m ? C.see : C.grau, boxShadow: modus === m ? "0 1px 6px rgba(15,26,51,0.1)" : "none" }}>{t}</button>
        ))}
      </div>

      {modus === "faeden" ? (
        faden ? <FadenDetail f={FS_FAEDEN.find((x) => x.id === faden)} zurueck={() => { setFaden(null); setTimeout(nachOben, 0); }} oeffne={oeffne} />
          : <FadenListe oeffneFaden={(id) => { setFaden(id); setTimeout(nachOben, 0); }} />
      ) : (
        <>
          {modus !== "spick" && <div style={{ position: "relative", marginBottom: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="7" fill="none" stroke={C.hellgrau} strokeWidth="2.2" /><path d="M16.5 16.5 L21 21" stroke={C.hellgrau} strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <input value={suche} onChange={(ev) => setSuche(ev.target.value)} placeholder={`${gesamt} Formeln durchsuchen …`} aria-label="Formeln durchsuchen"
              style={{ width: "100%", padding: "13px 16px 13px 42px", fontSize: 15.5, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 14, outline: "none", background: C.weiss, color: C.tinte, boxSizing: "border-box" }} />
          </div>}

          {!suche.trim() && (
            <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "2px 0 8px", margin: "0 -24px", paddingLeft: 24, paddingRight: 24, scrollbarWidth: "none" }}>
              <button type="button" onClick={() => setBereich("unterstufe")} aria-pressed={unterAnsicht} aria-label="Unterstufe, Klasse 5 bis 7"
                style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
                  border: `1px solid ${unterAnsicht ? uf.text : uf.rand}`, background: unterAnsicht ? uf.text : uf.grund, color: unterAnsicht ? C.weiss : uf.text, transition: "background 0.15s, color 0.15s" }}>
                Unterstufe<span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: unterAnsicht ? "rgba(255,255,255,0.2)" : C.weiss }}>5–7</span>
              </button>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 1, alignSelf: "stretch", margin: "4px 2px", background: C.linie }} />
              {FS_BEREICHE.map((b) => <Chip key={b.id} an={bereich === b.id} onClick={() => setBereich(b.id)}>{b.kurz || b.name}</Chip>)}
              {gemerkt.length > 0 && <Chip an={bereich === "gemerkt"} onClick={() => setBereich("gemerkt")}>★ Gemerkt ({gemerkt.length})</Chip>}
            </div>
          )}

          {!unterAnsicht && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0 16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.hellgrau, marginRight: 2 }}>Stufe</span>
              {["alle", ...STUFEN].map((s) => {
                const an = stufe === s, f = s === "alle" ? { text: C.tinte, grund: C.sand, rand: C.hellgrau } : STUFEN_FARBE[s];
                const info = STUFEN_INFO[s];
                return (
                  <button key={s} type="button" aria-pressed={an} onClick={() => stufeSetzen(s)} aria-label={info ? `${info.name}, ${info.klassen}` : "Alle Stufen"}
                    style={{ display: "inline-flex", alignItems: "baseline", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                      border: `1px solid ${an ? f.text : C.linie}`, background: an ? f.grund : C.weiss, color: an ? f.text : C.grau }}>
                    {info ? <><span className="fs-stufe-lang">{info.name}</span><span style={{ fontWeight: 600, opacity: 0.8 }}>{info.kurz}</span></> : "Alle"}
                  </button>
                );
              })}
            </div>
          )}

          {modus === "spick" && (
            <Spickzettel titel={bInfo.name} oeffne={oeffne} gruppeVon={gruppeVon}
              stufeText={unterAnsicht ? "Klasse 5–7" : stufe === "alle" ? "alle Stufen" : `${STUFEN_INFO[stufe].name} · ${STUFEN_INFO[stufe].klassen}`}
              liste={treffer} />
          )}

          {modus !== "spick" && !suche.trim() && (
            <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 14, marginTop: unterAnsicht ? 6 : 0, background: unterAnsicht ? "linear-gradient(150deg, #2E2466 0%, #5B4BA6 100%)" : `linear-gradient(150deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
              <p style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>{bInfo.name}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#C9D6EE", lineHeight: 1.5 }}>{bInfo.zeile}</p>
              <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 600, color: C.flaggold }}>
                {treffer.length} Formeln · {treffer.reduce((s, x) => s + herleitungen(x).length, 0)} Herleitungen · {treffer.filter((x) => x.bild).length} interaktive Bilder
              </p>
              {!unterAnsicht && treffer.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }} aria-label="Verteilung nach Stufen">
                  {STUFEN.map((st) => {
                    const n = treffer.filter((x) => stufenVon(x).includes(st)).length;
                    if (!n) return null;
                    return (
                      <span key={st} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.12)", color: C.weiss }}>
                        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: st === "unter" ? "#B9AEF0" : st === "mittel" ? "#9EC2F0" : C.flaggold }} />
                        {n} in {STUFEN_INFO[st].name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {modus !== "spick" && !suche.trim() && gruppen && gruppen.length >= 4 && treffer.length > 25 && (
            <nav aria-label="Zu einer Gruppe springen" style={{ display: "flex", gap: 6, overflowX: "auto", margin: "0 -24px 18px", padding: "2px 24px 4px", scrollbarWidth: "none" }}>
              {gruppen.map((g) => (
                <button key={g} type="button" onClick={() => { const el = document.getElementById(`fs-gruppe-${g}`); if (el) springe("anker", () => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" })); }}
                  style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: unterAnsicht ? uf.text : C.see, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {g}
                </button>
              ))}
            </nav>
          )}

          {modus !== "spick" && bereich === "gemerkt" && !suche.trim() && treffer.length > 0 && (
            <div style={{ display: "flex", gap: 8, margin: "0 0 16px", flexWrap: "wrap" }}>
              <button type="button" aria-pressed={verdecken} onClick={() => setVerdecken((v) => !v)}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 38, padding: "0 14px", borderRadius: 999, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: `1.5px solid ${verdecken ? C.see : C.linie}`, background: verdecken ? C.see : C.weiss, color: verdecken ? C.weiss : C.see }}>
                <span aria-hidden="true">{verdecken ? "◉" : "○"}</span> Formeln verdecken
              </button>
              <button type="button" onClick={() => { const ids = treffer.map((x) => x.id); for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } setMischung(ids); setVerdecken(true); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 38, padding: "0 14px", borderRadius: 999, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see }}>
                ⤮ Mischen und abfragen
              </button>
              {mischung && (
                <button type="button" onClick={() => setMischung(null)}
                  style={{ minHeight: 38, padding: "0 12px", borderRadius: 999, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "none", background: "transparent", color: C.grau }}>
                  Reihenfolge zurücksetzen
                </button>
              )}
            </div>
          )}

          {modus !== "spick" && treffer.length === 0 && (
            <p style={{ color: C.grau, fontSize: 15, lineHeight: 1.7 }}>{bereich === "gemerkt" ? "Noch nichts gemerkt. Tippe in einer Formel auf »Merken«." : "Dazu ist nichts hinterlegt. Versuch einen kürzeren Suchbegriff."}</p>
          )}

          {modus === "spick" ? null : gruppen ? gruppen.map((g) => {
            const liste = treffer.filter((x) => gruppeVon(x) === g);
            const nurUnter = !unterAnsicht && liste.every(istUnterstufe);
            return (
              <div key={g} id={`fs-gruppe-${g}`} style={{ marginBottom: 22, scrollMarginTop: 90 }}>
                <p style={{ ...kicker, margin: "0 2px 10px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", color: unterAnsicht ? uf.text : kicker.color }}>
                  {g}
                  {nurUnter && <span style={{ fontSize: 10, letterSpacing: "0.04em", textTransform: "none", padding: "2px 8px", borderRadius: 999, background: uf.grund, color: uf.text }}>Unterstufe 5–7</span>}
                </p>
                {liste.map((x) => <FormelKarte key={x.id} e={x} onClick={() => oeffne(x.id)} gemerkt={gemerkt.includes(x.id)} verdeckt={bereich === "gemerkt" && verdecken} />)}
              </div>
            );
          }) : (
            <div>
              <p style={{ ...kicker, margin: "0 2px 10px" }}>{treffer.length} Treffer</p>
              {treffer.map((x) => <FormelKarte key={x.id} e={x} onClick={() => oeffne(x.id)} zeigeBereich gemerkt={gemerkt.includes(x.id)} />)}
            </div>
          )}

          <div className="fs-druck-weg" style={{ marginTop: 26, textAlign: "center" }}>
            <button type="button" onClick={() => { const pool = FS_ALLE.filter((x) => passt(x, unterAnsicht ? "unter" : stufe)); const x = pool[Math.floor(Math.random() * pool.length)]; if (x) oeffne(x.id); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 40, padding: "0 16px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /><circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
              Zufällige Formel
            </button>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6 }}>
              Insgesamt {gesamt} Formeln mit {beweise} Herleitungen und {bilder} interaktiven Bildern.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
