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
import { FS_ALLE, FS_BEREICHE, FS_BEREICH_ALIAS, FS_DARAUF, FS_FAEDEN, FS_NACH_ID, FS_ZUSATZ_ZIELE, bereichVon, fsSuche, herleitungen } from "./fsIndex.js";
import { BILDER_1 } from "./funcFsBilder1.jsx";
import { BILDER_2 } from "./funcFsBilder2.jsx";
import { BILDER_3 } from "./funcFsBilder3.jsx";
import { BILDER_4 } from "./funcFsBilder4.jsx";
import { BILDER_5 } from "./funcFsBilder5.jsx";
import { BILDER_6 } from "./funcFsBilder6.jsx";
import { BILDER_7 } from "./funcFsBilder7.jsx";
import { BILDER_8 } from "./funcFsBilder8.jsx";

const BILDER = { ...BILDER_1, ...BILDER_2, ...BILDER_3, ...BILDER_4, ...BILDER_5, ...BILDER_6, ...BILDER_7, ...BILDER_8 };

const MERK = "matheplus-formeln-gemerkt";
const STUFE = "matheplus-stufe";
const lesen = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
const schreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat */ } };
const stufeLesen = () => { try { const v = localStorage.getItem(STUFE); return v === "mittel" || v === "ober" ? v : "alle"; } catch (e) { return "alle"; } };
const passt = (e, st) => st === "alle" || e.st === "beide" || e.st === st;
const STUFEN_NAME = { mittel: "Mittelstufe", ober: "Oberstufe", beide: "Mittel- und Oberstufe" };

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
  const fuer = (FS_DARAUF[e.id] || []).filter(([id]) => FS_NACH_ID[id]);
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
          <Marke>{STUFEN_NAME[e.st]}</Marke>
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
function FormelKarte({ e, onClick, zeigeBereich, gemerkt }) {
  const anzahl = herleitungen(e).length;
  return (
    <button type="button" onClick={onClick} data-formel={e.id}
      style={{ width: "100%", display: "block", textAlign: "left", fontFamily: "inherit", cursor: "pointer", border: "none", ...karte, padding: "14px 16px 12px", marginBottom: 9, color: C.tinte }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ minWidth: 0 }}>
          {zeigeBereich && <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.hellgrau, marginBottom: 1 }}>{bereichVon(e.bereich).name}</span>}
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>{gemerkt && <span aria-label="gemerkt" style={{ color: C.gruen, marginRight: 4 }}>★</span>}{e.n}</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, color: C.see }}>
          {anzahl > 1 && <span style={{ fontSize: 10.5, fontWeight: 700, color: C.gruenDunkel, background: "#FFF6DA", borderRadius: 999, padding: "2px 7px" }}>{anzahl} Beweise</span>}
          {e.bild && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#2F8F5B", background: "#E3F3E9", borderRadius: 999, padding: "2px 7px" }}>Bild</span>}
          <Pfeilchen />
        </span>
      </span>
      <span style={{ display: "block", fontSize: 16.5, lineHeight: 2, color: C.tinte, overflowX: "auto", overflowY: "hidden", marginTop: 4 }}><M t={e.f} /></span>
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
   Hauptkomponente
   ====================================================================== */
export function FormelsammlungNeu({ bereich: start = "analysis", formel: startFormel = null, zuHerleitung }) {
  const startBereich = FS_BEREICH_ALIAS[start] || start;
  const [modus, setModus] = useState("liste");              // liste | faeden
  const [bereich, setBereich] = useState(FS_BEREICHE.some((b) => b.id === startBereich) ? startBereich : "analysis");
  const [suche, setSuche] = useState("");
  const [stufe, setStufe] = useState(stufeLesen);
  const [detail, setDetail] = useState(startFormel && FS_NACH_ID[startFormel] ? startFormel : null);
  const [faden, setFaden] = useState(null);
  const [verlauf, setVerlauf] = useState([]);              // Rückweg: [{detail, faden, modus}]
  const [gemerkt, setGemerkt] = useState(() => lesen(MERK, []));
  const obenRef = useRef(null);
  const listenScroll = useRef(0);

  const nachOben = () => {
    const el = obenRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
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
      if (!letzter || (!letzter.detail && !letzter.faden)) window.scrollTo({ top: listenScroll.current, behavior: "auto" });
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
    if (bereich === "gemerkt") return FS_ALLE.filter((e) => gemerkt.includes(e.id));
    return FS_ALLE.filter((e) => e.bereich === bereich && passt(e, stufe));
  }, [suche, bereich, stufe, gemerkt]);

  const e = detail ? FS_NACH_ID[detail] : null;
  if (e) {
    const geschw = FS_ALLE.filter((x) => x.bereich === e.bereich);
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
  const bInfo = bereich === "gemerkt" ? { name: "Gemerkt", zeile: "Deine gemerkten Formeln" } : bereichVon(bereich);
  const gruppen = suche.trim() ? null : [...new Set(treffer.map((x) => x.g))];

  return (
    <div ref={obenRef} className="mx-auto px-6 pb-16" style={{ maxWidth: 680, paddingTop: 22 }}>
      <div role="tablist" aria-label="Ansicht" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, borderRadius: 14, background: C.himmel, marginBottom: 16 }}>
        {[["liste", "Nachschlagen"], ["faeden", "Rote Fäden"]].map(([m, t]) => (
          <button key={m} type="button" role="tab" aria-selected={modus === m} onClick={() => { setModus(m); setFaden(null); }}
            style={{ minHeight: 40, borderRadius: 11, border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: modus === m ? C.weiss : "transparent", color: modus === m ? C.see : C.grau, boxShadow: modus === m ? "0 1px 6px rgba(15,26,51,0.1)" : "none" }}>{t}</button>
        ))}
      </div>

      {modus === "faeden" ? (
        faden ? <FadenDetail f={FS_FAEDEN.find((x) => x.id === faden)} zurueck={() => { setFaden(null); setTimeout(nachOben, 0); }} oeffne={oeffne} />
          : <FadenListe oeffneFaden={(id) => { setFaden(id); setTimeout(nachOben, 0); }} />
      ) : (
        <>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="7" fill="none" stroke={C.hellgrau} strokeWidth="2.2" /><path d="M16.5 16.5 L21 21" stroke={C.hellgrau} strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <input value={suche} onChange={(ev) => setSuche(ev.target.value)} placeholder={`${gesamt} Formeln durchsuchen …`} aria-label="Formeln durchsuchen"
              style={{ width: "100%", padding: "13px 16px 13px 42px", fontSize: 15.5, fontFamily: "inherit", border: `1px solid ${C.linie}`, borderRadius: 14, outline: "none", background: C.weiss, color: C.tinte, boxSizing: "border-box" }} />
          </div>

          {!suche.trim() && (
            <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "2px 0 8px", margin: "0 -24px", paddingLeft: 24, paddingRight: 24, scrollbarWidth: "none" }}>
              {FS_BEREICHE.map((b) => <Chip key={b.id} an={bereich === b.id} onClick={() => setBereich(b.id)}>{b.kurz || b.name}</Chip>)}
              {gemerkt.length > 0 && <Chip an={bereich === "gemerkt"} onClick={() => setBereich("gemerkt")}>★ Gemerkt ({gemerkt.length})</Chip>}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0 16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.hellgrau, marginRight: 2 }}>Stufe</span>
            {[["alle", "Alle"], ["mittel", "Mittelstufe"], ["ober", "Oberstufe"]].map(([s, t]) => (
              <button key={s} type="button" aria-pressed={stufe === s} onClick={() => stufeSetzen(s)}
                style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                  border: `1px solid ${stufe === s ? C.gruen : C.linie}`, background: stufe === s ? "#FFF6DA" : C.weiss, color: stufe === s ? C.gruenDunkel : C.grau }}>{t}</button>
            ))}
          </div>

          {!suche.trim() && (
            <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 22, background: `linear-gradient(150deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss }}>
              <p style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>{bInfo.name}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#C9D6EE", lineHeight: 1.5 }}>{bInfo.zeile}</p>
              <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 600, color: C.flaggold }}>
                {treffer.length} Formeln · {treffer.reduce((s, x) => s + herleitungen(x).length, 0)} Herleitungen · {treffer.filter((x) => x.bild).length} interaktive Bilder
              </p>
            </div>
          )}

          {treffer.length === 0 && (
            <p style={{ color: C.grau, fontSize: 15, lineHeight: 1.7 }}>{bereich === "gemerkt" ? "Noch nichts gemerkt. Tippe in einer Formel auf »Merken«." : "Dazu ist nichts hinterlegt. Versuch einen kürzeren Suchbegriff."}</p>
          )}

          {gruppen ? gruppen.map((g) => (
            <div key={g} style={{ marginBottom: 22 }}>
              <p style={{ ...kicker, margin: "0 2px 10px" }}>{g}</p>
              {treffer.filter((x) => x.g === g).map((x) => <FormelKarte key={x.id} e={x} onClick={() => oeffne(x.id)} gemerkt={gemerkt.includes(x.id)} />)}
            </div>
          )) : (
            <div>
              <p style={{ ...kicker, margin: "0 2px 10px" }}>{treffer.length} Treffer</p>
              {treffer.map((x) => <FormelKarte key={x.id} e={x} onClick={() => oeffne(x.id)} zeigeBereich gemerkt={gemerkt.includes(x.id)} />)}
            </div>
          )}

          <p style={{ marginTop: 26, fontSize: 12.5, color: C.hellgrau, lineHeight: 1.6, textAlign: "center" }}>
            Insgesamt {gesamt} Formeln mit {beweise} Herleitungen und {bilder} interaktiven Bildern.
          </p>
        </>
      )}
    </div>
  );
}
