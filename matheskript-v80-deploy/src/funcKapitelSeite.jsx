/* ======================================================================
   KAPITELSEITE – Übersicht zu einem Buchkapitel (Pfad /kapitel/<slug>, Ansicht „kapitel“).
   Eine Grundseite für alle Kapitel aus schulbuch.js; Inhalt aus kapitelSeite.js (rein),
   Text je Kapitel aus kapitelSeiten.js.

   Aufbau: Kopf (Klasse · Kapitel, Titel, Einstieg, Stand, Trainieren / Ins Mathe-Training)
           → Kapitel-Leiste der Klasse → Am Ende kannst du … → Der Weg durchs Kapitel (Unterthemen mit Stand)
           → Das Wichtigste auf einen Blick (Kernformeln) → Dafür brauchst du sicher → Werkzeuge und Hilfen
           → Unser Kurs dazu → Vor der Klassenarbeit → Baut darauf auf → vorheriges / nächstes Kapitel.
   Desktop ab 900 px: zwei Spalten – links Ziele, Weg, Formeln; rechts Vorwissen, Werkzeuge, Kurs, Klassenarbeit (mitlaufend).
   Geöffnet aus dem ☰-Menü (Klasse → Kapitel → „Kapitelseite öffnen“). Wird per lazy() geladen (Formelsammlung).
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { useLern } from "./func6.jsx";
import { normiereEbb } from "./ebbinghaus.js";
import { FS_NACH_ID } from "./fsIndex.js";
import { THEMEN, PLAN, SCHULARTEN, klassenBoxen, kapitelFuer, roemisch } from "./schulbuch.js";
import { kapitelSeite, kapitelSeitenZiel } from "./kapitelSeite.js";
import { standZeile } from "./hauptthema.js";
import { quickfinderLesen } from "./funcQuickfinder.jsx";
import { themenUebernehmen } from "./meinTrainingSpeicher.js";
import { WERKZEUGE } from "./werkzeuge.js";

const GOLD_VERLAUF = `linear-gradient(135deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`;
const NACHT_TEXT = "#C9D6EE";
const BREITE = 680;      // Handy und Tablet: eine Spalte
const BREITE_DESKTOP = 1040;   // ab 900 px: zwei Spalten (Weg links, Werkzeuge rechts)
const KICKER = { fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 10px" };
const KARTE = { backgroundColor: C.weiss, borderRadius: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const knopf = { fontFamily: "inherit", cursor: "pointer", lineHeight: 1.15, transition: "filter .12s ease, background .12s ease, transform .1s ease" };

const CSS = `
.ks-knopf:hover{filter:brightness(1.05)}
.ks-knopf:active{transform:scale(.98)}
.ks-zeile:hover{background:${C.himmel}}
.ks-leiste{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 4px}
.ks-leiste::-webkit-scrollbar{display:none}
.ks-raster{display:grid;grid-template-columns:1fr;gap:8px}
@media (min-width:640px){.ks-raster{grid-template-columns:1fr 1fr}}
.ks-rahmen{max-width:${BREITE}px}
.ks-spalten{display:block}
@media (min-width:900px){
  .ks-rahmen{max-width:${BREITE_DESKTOP}px}
  .ks-spalten{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:0 36px;align-items:start}
  .ks-spalten .ks-raster{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){.ks-knopf{transition:none}}
`;

/* ---------- Stand eines Unterthemas / Kapitels (auf Weiß) ---------- */
function StandPunkt({ art, g = 22 }) {
  const basis = { flexShrink: 0, width: g, height: g, borderRadius: 999, boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center" };
  const rest = "rgba(14,30,74,0.12)";
  if (art === "sicher") return (
    <span aria-hidden="true" style={{ ...basis, background: C.see }}>
      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.2 6.3 L4.8 8.8 L9.8 3.4" fill="none" stroke={C.weiss} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  if (art === "geuebt") return <span aria-hidden="true" style={{ ...basis, background: `conic-gradient(${C.see} 0deg 180deg, ${rest} 180deg 360deg)` }} />;
  if (art === "unsicher") return <span aria-hidden="true" style={{ ...basis, background: `conic-gradient(${C.flaggold} 0deg 120deg, ${rest} 120deg 360deg)` }} />;
  if (art === "offen") return <span aria-hidden="true" style={{ ...basis, border: `2px solid ${C.hellgrau}` }} />;
  return <span aria-hidden="true" style={{ ...basis, border: `2px dashed ${C.linie}` }} />;
}

function Abschnitt({ kicker, titel, children, rechts }) {
  return (
    <section style={{ marginTop: 34 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {kicker && <p style={KICKER}>{kicker}</p>}
          {titel && <h2 style={{ margin: "0 0 14px", fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte }}>{titel}</h2>}
        </div>
        {rechts}
      </div>
      {children}
    </section>
  );
}

/* Kleiner Knopf in einer Zeile („Üben“, Werkzeug) */
function Pille({ onClick, children, voll, label }) {
  return (
    <button type="button" className="ks-knopf" onClick={onClick} aria-label={label}
      style={{ ...knopf, flexShrink: 0, minHeight: 32, padding: "0 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
        border: voll ? "none" : `1.5px solid ${C.linie}`, background: voll ? C.see : C.weiss, color: voll ? C.weiss : C.see }}>
      {children}
    </button>
  );
}

/* Ganze Zeile als Link (Hilfen, Kurse, Klassenarbeit) */
function LinkZeile({ titel, zeile, onClick, zeichen, gold }) {
  return (
    <button type="button" className="ks-zeile" onClick={onClick}
      style={{ ...knopf, ...KARTE, width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "12px 14px", border: "none", color: C.tinte,
        boxShadow: gold ? `inset 0 0 0 1.5px ${C.flaggold}, 0 2px 16px rgba(15,26,51,0.07)` : KARTE.boxShadow }}>
      {zeichen && (
        <span aria-hidden="true" data-kein-i18n style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
          background: gold ? GOLD_VERLAUF : `linear-gradient(160deg, ${C.see}, ${C.seeTief})`, color: gold ? C.seeTief : C.flaggold, fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>{zeichen}</span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>{titel}</span>
        {zeile && <span style={{ display: "block", fontSize: 12, color: C.grau, lineHeight: 1.4, marginTop: 2 }}>{zeile}</span>}
      </span>
      <span aria-hidden="true" style={{ fontSize: 20, color: C.see, lineHeight: 1 }}>›</span>
    </button>
  );
}

/* ---------- Kopf ---------- */
function Kopf({ d, gehe, aufnehmen, aufgenommen }) {
  const kx = d.kontext;
  const kicker = [kx.klasseLabel ? `Klasse ${kx.klasseLabel}` : null, kx.schulartName || null, kx.nr ? `Kapitel ${kx.nr}` : null].filter(Boolean).join(" · ");
  const z = d.zaehlung;
  const anteil = z.mitAufgaben ? z.sicher / z.mitAufgaben : 0;
  return (
    <div className="kopfblock" style={{ background: `radial-gradient(120% 90% at 100% 0%, rgba(237,187,0,0.16), transparent 55%), linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
      <div className="held mx-auto px-6 pt-10 pb-6 ks-rahmen">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          {kx.nr && (
            <span aria-hidden="true" data-kein-i18n style={{ flexShrink: 0, minWidth: 52, height: 52, padding: "0 8px", borderRadius: 14, background: GOLD_VERLAUF, color: C.seeTief,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: kx.nr.length > 3 ? 17 : 22, fontWeight: 800, letterSpacing: "0.02em",
              boxShadow: "0 8px 22px rgba(226,181,60,0.32), inset 0 1px 0 rgba(255,255,255,0.5)" }}>{kx.nr}</span>
          )}
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, lineHeight: 1.5 }}>{kicker || "Kapitelseite"}</p>
        </div>
        <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(27px, 6.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.08, margin: 0, hyphens: "auto" }}>{d.titel}</h1>
        <div style={{ width: 54, height: 4, background: GOLD_VERLAUF, borderRadius: 2, marginTop: 18, marginBottom: 16 }} />
        <p style={{ color: NACHT_TEXT, fontSize: 15.5, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{d.einstieg}</p>

        {/* Stand */}
        <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.07)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, fontSize: 12.5, fontWeight: 700, color: C.weiss }}>
            <span>Dein Stand</span>
            <span style={{ color: NACHT_TEXT, fontWeight: 600 }}>
              {z.mitAufgaben
                ? <>{z.sicher} <span>von</span> {z.mitAufgaben} <span>sicher</span>{z.geuebt ? <> · {z.geuebt} <span>in Arbeit</span></> : null}</>
                : <span>Üben mit den Werkzeugen</span>}
            </span>
          </div>
          <div aria-hidden="true" style={{ display: "flex", gap: 4, marginTop: 9 }}>
            {d.teile.map((u) => (
              <span key={u.id} title={u.titel} style={{ flex: 1, height: 6, borderRadius: 3,
                background: u.stand.art === "sicher" ? C.flaggold : u.stand.art === "geuebt" || u.stand.art === "unsicher" ? "rgba(237,187,0,0.45)" : u.stand.art === "ohne" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.18)" }} />
            ))}
          </div>
          {z.mitAufgaben > 0 && <span className="sr-only">{Math.round(anteil * 100)} %</span>}
        </div>

        {/* Aktionen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <button type="button" className="ks-knopf" onClick={aufnehmen} aria-live="polite"
            style={{ ...knopf, minHeight: 48, padding: "6px 12px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.4)", background: "transparent", color: C.weiss, fontSize: 13.5, fontWeight: 700 }}>
            {aufgenommen === "neu" ? "✓ Im Mathe-Training" : aufgenommen === "schon" ? "✓ Schon im Mathe-Training" : "Ins Mathe-Training aufnehmen"}
          </button>
          <button type="button" className="ks-knopf" onClick={() => gehe(d.trainieren)}
            style={{ ...knopf, minHeight: 48, padding: "6px 12px", borderRadius: 14, border: "none", background: GOLD_VERLAUF, color: C.seeTief, fontSize: 14, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(226,181,60,0.35), inset 0 1px 0 rgba(255,255,255,0.45)" }}>
            <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor" /></svg>
            Kapitel trainieren
          </button>
        </div>
      </div>
      <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
    </div>
  );
}

/* ---------- Kapitel der Klasse (zum Wechseln) ---------- */
function KapitelLeiste({ d, gehe }) {
  const kx = d.kontext;
  if (kx.liste.length < 2) return null;
  return (
    <nav aria-label="Kapitel dieser Klasse" className="ks-leiste" style={{ marginTop: -6 }}>
      {kx.liste.map((k) => {
        const an = k.id === d.id;
        return (
          <button key={k.id} type="button" className="ks-knopf" aria-current={an ? "page" : undefined} title={k.titel}
            onClick={() => { if (!an) gehe(kapitelSeitenZiel(k.id, kx.schulart, kx.klasse)); }}
            style={{ ...knopf, flexShrink: 0, display: "flex", alignItems: "center", gap: 7, minHeight: 36, padding: "0 12px 0 6px", borderRadius: 999,
              border: an ? "none" : `1.5px solid ${C.linie}`, background: an ? C.seeTief : C.weiss, color: an ? C.weiss : C.tinte, fontSize: 12.5, fontWeight: 700, maxWidth: 230 }}>
            <span data-kein-i18n style={{ flexShrink: 0, minWidth: 24, height: 24, padding: "0 4px", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10.5, fontWeight: 800, background: an ? C.flaggold : "rgba(237,187,0,0.16)", color: C.seeTief }}>{k.nr}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.titel}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- Ziele ---------- */
function Ziele({ ziele }) {
  if (!ziele.length) return null;
  return (
    <Abschnitt kicker="Dein Ziel" titel="Am Ende des Kapitels kannst du …">
      <ul style={{ ...KARTE, listStyle: "none", margin: 0, padding: "6px 16px" }}>
        {ziele.map((z, i) => (
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 0", borderTop: i ? `1px solid ${C.linie}` : "none" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, marginTop: 1, borderRadius: 999, background: "rgba(237,187,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.2 6.3 L4.8 8.8 L9.8 3.4" fill="none" stroke={C.gruenDunkel} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span style={{ fontSize: 15, lineHeight: 1.5, color: C.tinte }}>… {z}.</span>
          </li>
        ))}
      </ul>
    </Abschnitt>
  );
}

/* ---------- Der Weg durchs Kapitel ---------- */
function Weg({ d, gehe }) {
  return (
    <Abschnitt kicker={`${d.teile.length} Unterthemen`} titel="Der Weg durchs Kapitel">
      <ol style={{ ...KARTE, listStyle: "none", margin: 0, padding: "8px 14px" }}>
        {d.teile.map((u, i) => {
          const zeile = standZeile(u.stand) || (u.wz ? "Üben mit dem Werkzeug" : "Im Buch und im Unterricht");
          const letzte = i === d.teile.length - 1;
          return (
            <li key={u.id} style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 26, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12 }}>
                <span data-kein-i18n style={{ width: 26, height: 26, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
                  background: u.stand.art === "sicher" ? C.see : C.weiss, color: u.stand.art === "sicher" ? C.weiss : C.seeTief, boxShadow: `inset 0 0 0 2px ${u.stand.art === "sicher" ? C.see : C.flaggold}` }}>{u.nr}</span>
                {!letzte && <span style={{ flex: 1, width: 2, minHeight: 14, background: `linear-gradient(${C.flaggold}, rgba(237,187,0,0.25))`, marginTop: 4 }} />}
              </span>
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "11px 0", borderBottom: letzte ? "none" : `1px solid ${C.linie}` }}>
                <span style={{ flex: "1 1 180px", minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{u.titel}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, fontSize: 12, color: C.grau, lineHeight: 1.35 }}>
                    {u.stand.art !== "ohne" && <StandPunkt art={u.stand.art} g={12} />}{zeile}
                  </span>
                </span>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {u.wz && <Pille onClick={() => gehe(u.wz.ziel)} label={`Werkzeug: ${u.wz.name}`}>{u.wz.name}</Pille>}
                  {u.ueben && <Pille voll onClick={() => gehe({ ...d.trainieren, teil: u.id })} label={`${u.titel} üben`}>Üben ›</Pille>}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Abschnitt>
  );
}

/* ---------- Das Wichtigste auf einen Blick ---------- */
function Kernformeln({ d, gehe }) {
  const gruppen = d.kern.map((g) => ({ ...g, ids: g.ids.filter((id) => FS_NACH_ID[id]) })).filter((g) => g.ids.length);
  if (!gruppen.length) return null;
  return (
    <Abschnitt kicker="Formeln" titel="Das Wichtigste auf einen Blick">
      {d.weg && (
        <p style={{ margin: "-4px 0 14px", padding: "2px 0 2px 14px", borderLeft: `3px solid ${C.flaggold}`, fontSize: 15, lineHeight: 1.6, color: C.tinte, fontStyle: "italic" }}>{d.weg}</p>
      )}
      <div style={{ display: "grid", gap: 16 }}>
        {gruppen.map((g) => (
          <div key={g.titel}>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 800, color: C.seeTief }}>{g.titel}</p>
            <div className="ks-raster">
              {g.ids.map((id) => {
                const e = FS_NACH_ID[id];
                return (
                  <button key={id} type="button" className="ks-zeile" onClick={() => gehe({ ansicht: "formeln", formel: id })}
                    style={{ ...knopf, ...KARTE, display: "block", textAlign: "left", border: "none", borderLeft: `3px solid ${C.flaggold}`, padding: "10px 14px 8px", color: C.tinte, minWidth: 0 }}>
                    <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, fontWeight: 700 }}>
                      <span>{e.n}</span><span aria-hidden="true" style={{ color: C.see, fontSize: 17, lineHeight: 1 }}>›</span>
                    </span>
                    <span style={{ display: "block", fontSize: 15.5, lineHeight: 1.95, overflowX: "auto", overflowY: "hidden", marginTop: 2 }}><M t={e.f} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <LinkZeile titel="Alle Formeln zum Kapitel" zeile="Mit dem Vorwissen aus früheren Klassen – auch als PDF" onClick={() => gehe(d.formelnZiel)} zeichen="∑" />
      </div>
    </Abschnitt>
  );
}

/* ---------- Dafür brauchst du sicher ---------- */
function Vorwissen({ d, gehe }) {
  if (!d.vorwissen.length) return null;
  return (
    <Abschnitt kicker="Vorwissen" titel="Dafür brauchst du sicher">
      <div style={{ ...KARTE, padding: "4px 6px" }}>
        {d.vorwissen.map((v, i) => (
          <button key={v.kapitel} type="button" className="ks-zeile" onClick={() => gehe(kapitelSeitenZiel(v.kapitel, d.kontext.schulart))}
            style={{ ...knopf, width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "11px 10px", border: "none", background: "transparent", borderRadius: 10,
              borderTop: i ? `1px solid ${C.linie}` : "none", color: C.tinte }}>
            <StandPunkt art={v.stand.art} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{v.titel}</span>
              <span style={{ display: "block", fontSize: 12, color: C.grau, marginTop: 2 }}>{standZeile(v.stand) || "Kapitelseite ansehen"}</span>
            </span>
            <span aria-hidden="true" style={{ fontSize: 20, color: C.see, lineHeight: 1 }}>›</span>
          </button>
        ))}
      </div>
    </Abschnitt>
  );
}

/* ---------- Werkzeuge, Kurse, Klassenarbeit ---------- */
function Hilfen({ d, gehe }) {
  if (!d.hilfen.length) return null;
  return (
    <Abschnitt kicker="In der App" titel="Werkzeuge und Hilfen">
      <div className="ks-raster">
        {d.hilfen.map((h) => <LinkZeile key={h.art + h.id} titel={h.name} zeile={h.zeile} onClick={() => gehe(h.ziel)} zeichen={h.art === "werkzeug" && WERKZEUGE[h.id] && WERKZEUGE[h.id].zeichen ? WERKZEUGE[h.id].zeichen : "→"} />)}
      </div>
    </Abschnitt>
  );
}
const KURS_ZEICHEN = { unterstufe: "5·6", diffkurs: "f′", vekkurs: "ℝ³", gleichkurs: "x=?", headnumbers: "7·8" };
function Kurse({ d, gehe }) {
  if (!d.kurse.length) return null;
  return (
    <Abschnitt kicker="Kurs" titel="Unser Kurs dazu">
      <div style={{ display: "grid", gap: 8 }}>
        {d.kurse.map((k) => <LinkZeile key={k.id} gold titel={k.name} zeile={k.zeile} onClick={() => gehe(k.ziel)} zeichen={KURS_ZEICHEN[k.id] || "▶"} />)}
      </div>
    </Abschnitt>
  );
}
function Klassenarbeit({ d, gehe }) {
  if (d.id === "ksAbi") return null;
  return (
    <Abschnitt kicker="Prüfung" titel="Vor der Klassenarbeit">
      <div className="ks-raster">
        <LinkZeile titel="Testklausur zum Kapitel" zeile="Mit Bewertungseinheiten und Erwartungshorizont" onClick={() => gehe(d.klausurZiel)} zeichen="A" />
        <LinkZeile titel="Prüfungsmodus" zeile="Ohne Hilfen, mit Uhr" onClick={() => gehe({ ansicht: "pruefung" })} zeichen="⏱" />
        <LinkZeile titel="Klassenarbeit nachbereiten" zeile="Aus Fehlern einen Plan machen" onClick={() => gehe({ ansicht: "klausurnach" })} zeichen="↺" />
        <LinkZeile titel="Meine Fehler üben" zeile="Genau das, was bei dir öfter schiefgeht" onClick={() => gehe({ ansicht: "fehlertraining" })} zeichen="!" />
      </div>
    </Abschnitt>
  );
}
function Danach({ d, gehe }) {
  if (!d.danach.length) return null;
  return (
    <Abschnitt kicker="Ausblick" titel="Baut darauf auf">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {d.danach.map((k) => (
          <button key={k.kapitel} type="button" className="ks-knopf" onClick={() => gehe(kapitelSeitenZiel(k.kapitel, d.kontext.schulart))}
            style={{ ...knopf, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "0 14px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.tinte, fontSize: 13, fontWeight: 700 }}>
            {k.klasse && <span style={{ fontSize: 11, fontWeight: 800, color: C.gruenDunkel }}>Kl. {k.klasse.label}</span>}
            {k.titel}
          </button>
        ))}
      </div>
    </Abschnitt>
  );
}

/* ---------- Vorheriges / nächstes Kapitel ---------- */
function Blaettern({ d, gehe }) {
  const kx = d.kontext;
  if (!kx.vorher && !kx.nachher) return null;
  const feld = (k, richtung) => k ? (
    <button type="button" className="ks-zeile" onClick={() => gehe(kapitelSeitenZiel(k.id, kx.schulart, kx.klasse))}
      style={{ ...knopf, ...KARTE, border: "none", padding: "12px 14px", textAlign: richtung === "vor" ? "right" : "left", color: C.tinte, minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau }}>
        {richtung === "vor" ? <>Nächstes Kapitel ›</> : <>‹ Vorheriges Kapitel</>}
      </span>
      <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginTop: 4 }}><span data-kein-i18n>{roemisch(k.nr)}</span> · {k.titel}</span>
    </button>
  ) : <span />;
  return (
    <nav aria-label="Kapitel blättern" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 40 }}>
      {feld(kx.vorher, "zurueck")}{feld(kx.nachher, "vor")}
    </nav>
  );
}

/* ---------- Ohne Kapitel: Auswahl ---------- */
function KeinKapitel({ gehe, schulart, klasse }) {
  const sa = PLAN[schulart] ? schulart : "g9";
  const box = klasse && (PLAN[sa][klasse] || []).length ? klasse : null;
  const boxen = box ? klassenBoxen(sa).filter((b) => b.id === box) : klassenBoxen(sa);
  return (
    <>
      <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: BREITE }}>
          <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold }}>{(SCHULARTEN.find((s) => s.id === sa) || {}).name} · Schulbuch</p>
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>Kapitelseiten</h1>
          <div style={{ width: 54, height: 4, background: GOLD_VERLAUF, borderRadius: 2, marginTop: 18, marginBottom: 16 }} />
          <p style={{ color: NACHT_TEXT, fontSize: 15, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>Zu jedem Kapitel deines Schulbuchs eine Übersicht: Ziele, Unterthemen, Formeln, Werkzeuge und dein Stand.</p>
        </div>
        <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
      </div>
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: BREITE }}>
        {boxen.map((b) => (
          <Abschnitt key={b.id} kicker={`Klasse ${b.label}`}>
            <div style={{ display: "grid", gap: 8 }}>
              {kapitelFuer(sa, b.id).map((k) => (
                <LinkZeile key={k.id} titel={k.titel} zeile={THEMEN[k.id].zeile} zeichen={roemisch(k.nr)} onClick={() => gehe(kapitelSeitenZiel(k.id, sa, b.id))} />
              ))}
            </div>
          </Abschnitt>
        ))}
      </div>
    </>
  );
}

/* ---------- Seite ---------- */
export function KapitelSeite({ ziel, gehe }) {
  const q = useMemo(() => { try { return quickfinderLesen() || {}; } catch (e) { return {}; } }, []);
  const kapitel = ziel && ziel.kapitel && THEMEN[ziel.kapitel] ? ziel.kapitel : null;
  const schulart = (ziel && ziel.schulart) || q.schulart || "g9";
  const klasse = (ziel && ziel.klasse) || (q.schulart === schulart ? q.klasse : null) || null;
  const [aufgenommen, setAufgenommen] = useState(null);
  const L = useLern();
  const roh = L && L.training ? L.training.ebbinghaus : null;
  const E = useMemo(() => normiereEbb(roh), [roh]);
  const d = useMemo(() => (kapitel ? kapitelSeite(kapitel, { schulart, klasse, E }) : null), [kapitel, schulart, klasse, E]);

  if (!d) return <><style>{CSS}</style><KeinKapitel gehe={gehe} schulart={schulart} klasse={klasse} /></>;
  /* Erster Klick nimmt auf und bleibt auf der Seite (Bestätigung im Knopf), zweiter Klick öffnet Mein Mathe-Training */
  const aufnehmen = () => {
    if (aufgenommen) { gehe({ ansicht: "meintraining" }); return; }
    const r = themenUebernehmen({ teile: d.teile.map((u) => u.id), schulart: d.kontext.schulart, klasse: d.kontext.klasse });
    setAufgenommen(r && r.aufgenommen && r.aufgenommen.length ? "neu" : "schon");
  };
  return (
    <>
      <style>{CSS}</style>
      <Kopf d={d} gehe={gehe} aufnehmen={aufnehmen} aufgenommen={aufgenommen} />
      <div className="mx-auto px-6 pb-16 ks-rahmen">
        <KapitelLeiste d={d} gehe={gehe} />
        <div className="ks-spalten">
          <div>
            <Ziele ziele={d.ziele} />
            <Weg d={d} gehe={gehe} />
            <Kernformeln d={d} gehe={gehe} />
          </div>
          <div className="ks-rechts">
            <Vorwissen d={d} gehe={gehe} />
            <Hilfen d={d} gehe={gehe} />
            <Kurse d={d} gehe={gehe} />
            <Klassenarbeit d={d} gehe={gehe} />
            <Danach d={d} gehe={gehe} />
          </div>
        </div>
        <Blaettern d={d} gehe={gehe} />
      </div>
    </>
  );
}
