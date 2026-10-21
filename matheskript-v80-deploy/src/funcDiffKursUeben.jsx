/* ============================================================
   KURS DIFFERENTIALRECHNUNG – Trainieren im Modul
   Menü mit drei Reitern unter dem Buchkapitel:
     · Werkzeuge                – die Trainingswerkzeuge (wie bisher, als Fenster)
     · Aufgaben                 – alle Aufgaben der Buchseiten des Kapitels zum
                                  Aufklappen, mit Lösung aus dem Buch; darunter das
                                  Aufgabentool: gleichwertige neue Aufgaben vom
                                  selben Typ, Schritt für Schritt mit Rückmeldung
     · Sätze und Definitionen   – Merke-, Achtung- und Vertiefungskästen des Kapitels
   Buchinhalte: public/buecher/ableitungen/kurs/<seite>.json (aus schulbuch/ableitungen/build.mjs).
   Aufgabentypen und Generatoren: src/diffAufgaben.js (BUCH_TYPEN, neueAufgabe).
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { springe } from "./sprung.js";
import { SchrittFolge, FunktionsBild, zt, liesZahl } from "./ui3.jsx";
import { GrosserKnopf, Rueck, MS, TextFeld, hilfeKontext } from "./ui2.jsx";
import { M } from "./func3.jsx";
import { liveTex } from "./formelEngine.js";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";
import { neueAufgabe, typVon, typTitel } from "./diffAufgaben.js";
import { pruefeTerm, pruefeListe, pruefeStamm, termAus, aufX, alsQ, zT } from "./diffKern.js";

/* Farben als CSS-Variablen: der Kurs Differentialrechnung (Standard) ist smaragdgrün, der Kurs
   Vektoren/Geraden/Ebenen setzt über die Prop `buch.farben` seine dunkelblaue Palette. */
const K = { baby: "var(--kt-baby)", hell: "var(--kt-hell)", tief: "var(--kt-tief)", schwarz: "var(--kt-schwarz)", gold: "var(--kt-gold)", weiss: "var(--kt-weiss)" };
const K_DIFF = { "--kt-baby": C.smHell, "--kt-hell": C.smNebel, "--kt-tief": C.smGruen, "--kt-schwarz": C.smNacht, "--kt-gold": C.smGoldDunkel, "--kt-weiss": C.weiss };

/* Welches Buch: Band 1 (Standard) oder ein anderer Band mit eigenen Generatoren (funcVekKurs.jsx) */
export const BUCH_DIFF = { pfad: "/buecher/ableitungen", gen: { neueAufgabe, typVon, typTitel }, farben: K_DIFF, speicher: "matheplus-diffkurs-reiter" };

/* ---------- Buchinhalte laden (je Seite eine JSON-Datei) ---------- */
const manifeste = new Map();
const cache = new Map();
async function seitenLaden(buch, von, bis) {
  const KURS = `${buch.pfad}/kurs`;
  if (!manifeste.has(KURS)) manifeste.set(KURS, fetch(`${KURS}/seiten.json`).then((r) => r.json()).catch(() => []));
  const da = await manifeste.get(KURS);
  const nummern = [];
  for (let s = von; s <= bis; s++) if (da.includes(s)) nummern.push(s);
  return Promise.all(nummern.map((s) => {
    const k = `${KURS}/${s}`;
    if (!cache.has(k)) cache.set(k, fetch(`${k}.json`).then((r) => r.json()).then((d) => ({ seite: s, ...d })));
    return cache.get(k);
  }));
}
function katexCss(buch) {
  if (typeof document === "undefined" || document.getElementById("dk-katex")) return;
  const l = document.createElement("link");
  l.id = "dk-katex"; l.rel = "stylesheet"; l.href = `${buch.pfad}/katex.css`;
  document.head.appendChild(l);
}

/* Buch-HTML (KaTeX, SVG-Grafiken) im Stil der App */
const BUCH_CSS = `
.dk-buch{font-size:15px;line-height:1.65;color:${C.tinte};overflow-wrap:anywhere}
.dk-buch p{margin:0 0 8px}
.dk-buch p:last-child{margin-bottom:0}
.dk-buch b,.dk-buch strong{font-weight:700;color:${K.schwarz}}
.dk-buch .katex{font-size:1.05em}
.dk-buch .katex-display,.dk-buch .formel{margin:6px 0;overflow-x:auto;overflow-y:hidden;padding:2px 0}
.dk-buch .teil{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 18px;margin:6px 0 4px}
.dk-buch .teil>div{white-space:normal}
.dk-buch .teil>div>i{font-style:normal;font-weight:800;color:${C.see};margin-right:6px}
.dk-buch .zwei,.dk-buch .zwei-bild,.dk-buch .bild-links{display:grid;grid-template-columns:1fr;gap:10px}
@media (min-width:560px){.dk-buch .zwei{grid-template-columns:1fr 1fr}.dk-buch .zwei-bild{grid-template-columns:1fr auto}}
.dk-buch svg.graph{display:block;max-width:100%;height:auto;font-family:Montserrat,sans-serif;margin:6px auto}
.dk-buch svg.graph .tz{font-size:9px;fill:#5B6478}
.dk-buch svg.graph .al{font-size:11px;font-style:italic;fill:#0E1E4A;font-weight:600}
.dk-buch svg.graph .pl{font-size:10.5px;font-weight:600}
.dk-buch svg.graph .fl{font-size:11px;font-weight:700;font-style:italic}
.dk-buch svg.graph .kl{font-size:9px;font-weight:500}
.dk-buch ul,.dk-buch ol{margin:0 0 8px;padding-left:20px}
.dk-buch table{border-collapse:collapse;margin:6px 0;font-size:14px}
.dk-buch td,.dk-buch th{border:1px solid ${C.linie};padding:4px 8px;text-align:center}
.dk-buch .etikett{display:none}
.dk-buch .loesung{padding-left:12px;border-left:2px solid ${C.linie};margin-top:4px}
.dk-buch .loesung-kopf{font-weight:700;color:${C.grau};font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.dk-kopf{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dk-kopf .katex{font-size:1em}
.dk-reiter{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px;background:${K.hell};border-radius:14px;border:1px solid ${K.baby}}
.dk-reiter button{min-height:44px;border:none;border-radius:11px;background:transparent;font-family:inherit;font-weight:700;font-size:13.5px;color:${K.schwarz};cursor:pointer;padding:6px 6px;line-height:1.2}
.dk-reiter button[aria-selected="true"]{background:${K.schwarz};color:${K.weiss};box-shadow:0 4px 12px rgba(11,12,16,.18)}
.dk-reiter .zahl{display:block;font-size:11px;font-weight:600;opacity:.7;margin-top:1px}
@media (max-width:380px){.dk-reiter button{font-size:12.5px}}
.dk-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
@media (max-width:640px){.dk-chips{flex-wrap:nowrap;overflow-x:auto;margin:12px -16px 0;padding:0 16px 4px;scroll-snap-type:x proximity;scrollbar-width:none}.dk-chips::-webkit-scrollbar{display:none}.dk-chip{flex:none;scroll-snap-align:start;white-space:nowrap}}
.dk-chip{padding:7px 12px;border-radius:999px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;line-height:1.25;text-align:left}
.dk-karte-kopf{display:flex;align-items:flex-start;gap:12px;width:100%;padding:14px;border:none;background:transparent;text-align:left;font-family:inherit;cursor:pointer}
@media (hover:hover){.dk-karte-kopf:hover{background:${K.hell}}}
`;

function Buch({ html, klein }) {
  return <div className="dk-buch" style={klein ? { fontSize: 14 } : undefined} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------- Schritte des Generators → Schritt-Karten aus ui3.jsx ---------- */
const zahlText = (v) => { const b = alsQ(v); return b.n <= 1000 && Math.abs(b.z / b.n - v) < 1e-9 ? `$${zT(b)}$` : zt(v, 4); };
function TermFeld({ wert, setWert, label, onEnter, v = "x" }) {
  const tex = React.useMemo(() => {
    if (!wert.trim()) return null;
    const t = liveTex(aufX(wert));
    return t ? (v === "x" ? t : t.replace(/(?<![a-zA-Z\\])x(?![a-zA-Z])/g, v)) : null;
  }, [wert, v]);
  return (
    <div style={{ flex: "1 1 220px", minWidth: 0 }}>
      <TextFeld wert={wert} setWert={setWert} label={label} onEnter={onEnter} platzhalter={v === "x" ? "z. B. 3x^2 - 2x" : `z. B. 4${v} + 1`} />
      <div aria-live="polite" style={{ minHeight: 26, fontSize: 16, marginTop: 4, color: C.see, overflowX: "auto" }}>{tex ? <M t={tex} /> : null}</div>
    </div>
  );
}
function schrittFuer(s, typ) {
  const id = `diffkurs-${String(typ).split(":")[0]}-${s.id}`;
  const hinweise = s.hinweis ? [s.hinweis] : [];
  if (s.art === "wahl") {
    const t = (s.optionen.find((o) => o[0] === s.richtig) || [])[1];
    return { id, titel: s.titel, typ: "wahl", frage: s.frage, optionen: s.optionen, richtig: s.richtig, fehler: s.fehler || [], hinweise, erklaerung: s.erkl ?? `Richtig: ${t}` };
  }
  if (s.art === "zahl") {
    const wertText = s.wertText ?? zahlText(s.wert);
    const lies = (e) => {
      let v = liesZahl(e);
      if (v === null) { const f = termAus(e); v = f ? f(0) : null; }
      return v === null || !isFinite(v) ? { warn: "Bitte eine Zahl eingeben – ganze Zahl, Bruch wie 3/8 oder Dezimalzahl wie 0,375." } : { wert: v };
    };
    return {
      id, titel: s.titel, typ: "zahl", frage: s.frage, text: s.text, wert: s.wert, toleranz: s.tol ?? 1e-9, einheit: s.einheit, wertText,
      fehler: (s.fehler || []).map((f) => ({ toleranz: s.tol ?? 1e-9, ...f })), hinweise,
      erklaerung: s.erkl ?? `${s.text ? `${s.text} ` : ""}${wertText}${s.einheit ? ` ${s.einheit}` : ""}`,
      ...(s.frei ? { feld: (p) => <TermFeld {...p} />, lies } : { lies }),
    };
  }
  /* Term, Liste, Stammfunktion: eigenes Feld, Prüfung liefert 0 = richtig, 2 + i = typischer Fehler i */
  const pruef = s.art === "term" ? pruefeTerm : s.art === "liste" ? pruefeListe : pruefeStamm;
  const wertText = s.wertText ?? (s.art === "liste" ? `$${s.werte.map((w) => zahlText(w).replace(/\$/g, "")).join("; ")}$` : `$${s.soll.tex}$`);
  const feld = s.art === "liste"
    ? (p) => <div style={{ flex: "1 1 200px" }}><TextFeld {...p} platzhalter="z. B. -2; 2" /></div>
    : (p) => <TermFeld {...p} v={s.var || "x"} />;
  return {
    id, titel: s.titel, typ: "zahl", frage: s.frage, text: s.text, wert: 0, toleranz: 0.1, wertText, feld,
    lies: (e) => pruef(e, s),
    fehler: (s.fehler || []).map((f, i) => ({ wert: 2 + i, toleranz: 0.1, text: f.text })), hinweise,
    erklaerung: s.erkl ?? `${s.text ? `${s.text} ` : ""}${wertText}`,
  };
}

/* ---------- Reiter ---------- */
const REITER = [["werkzeuge", "Werkzeuge"], ["aufgaben", "Aufgaben"], ["saetze", "Sätze und Definitionen"]];
const reiterLesen = (buch) => { try { const r = localStorage.getItem(buch.speicher); return REITER.some(([id]) => id === r) ? r : "aufgaben"; } catch (e) { return "aufgaben"; } };

export function KursTraining({ modul, werkzeuge, onGeuebt, geuebt, buch = BUCH_DIFF }) {
  const [reiter, setReiter] = React.useState(() => reiterLesen(buch));
  const [seiten, setSeiten] = React.useState(null);
  const [fehler, setFehler] = React.useState(false);
  const [typ, setTyp] = React.useState(null);        // aktiver Aufgabentyp im Aufgabentool
  const [quelle, setQuelle] = React.useState(null);  // Buchaufgabe, von der aus geübt wird
  const [runde, setRunde] = React.useState(0);
  const toolRef = React.useRef(null);

  React.useEffect(() => {
    let weg = false;
    katexCss(buch);
    seitenLaden(buch, modul.von, modul.bis).then((s) => { if (!weg) setSeiten(s); }).catch(() => { if (!weg) setFehler(true); });
    return () => { weg = true; };
  }, [modul.von, modul.bis]);

  const aufgaben = React.useMemo(() => (seiten || []).flatMap((s) => s.aufgaben.map((a) => ({ ...a, seite: s.seite, typ: buch.gen.typVon(s.seite, a.nr) }))), [seiten, buch]);
  const kaesten = React.useMemo(() => (seiten || []).flatMap((s) => s.kaesten.map((k, i) => ({ ...k, seite: s.seite, key: `${s.seite}-${i}` }))), [seiten]);
  /* Aufgabentypen des Kapitels in Buchreihenfolge, je Typ die Aufgaben, aus denen er stammt */
  const typen = React.useMemo(() => {
    const m = new Map();
    aufgaben.filter((a) => a.typ).forEach((a) => {
      if (!m.has(a.typ)) m.set(a.typ, { schluessel: a.typ, titel: buch.gen.typTitel(a.typ), quellen: [] });
      m.get(a.typ).quellen.push(a);
    });
    return [...m.values()];
  }, [aufgaben]);

  const waehle = (id) => {
    setReiter(id);
    try { localStorage.setItem(buch.speicher, id); } catch (e) { /* egal */ }
  };
  const ueben = (a) => {
    setTyp(a.typ); setQuelle(a); setRunde((n) => n + 1);
    springe("diffkurs-aufgabentool", () => toolRef.current && toolRef.current.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const zahl = { werkzeuge: modul.werkzeuge.length, aufgaben: seiten ? aufgaben.length : null, saetze: seiten ? kaesten.length : null };

  return (
    <div style={{ margin: "30px 0 0", ...buch.farben }}>
      <style>{BUCH_CSS}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: K.weiss, background: K.schwarz, padding: "5px 10px", borderRadius: 7 }}>2 · TRAINIEREN</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.grau }}>
          <span aria-hidden="true" style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", background: geuebt ? K.gold : "transparent", border: geuebt ? "none" : `1.5px solid ${C.linie}` }}>
            {geuebt && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>geübt
        </span>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: K.schwarz, margin: "8px 0 12px" }}>Training zu diesem Kapitel</h3>
      <div className="dk-reiter" role="tablist" aria-label="Training zu diesem Kapitel">
        {REITER.map(([id, name]) => (
          <button key={id} type="button" role="tab" aria-selected={reiter === id} onClick={() => waehle(id)} data-dk-reiter={id}>
            {name}{zahl[id] !== null && <span className="zahl">{zahl[id]}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" style={{ marginTop: 16 }}>
        {reiter === "werkzeuge" && (
          <>
            <p style={{ fontSize: 14, color: C.grau, margin: "0 0 14px", lineHeight: 1.6 }}>Tippe auf ein Werkzeug – es öffnet sich als Fenster direkt hier im Modul.</p>
            {werkzeuge}
          </>
        )}
        {reiter !== "werkzeuge" && fehler && <Rueck art="warn">Die Inhalte aus dem Buch konnten nicht geladen werden. Prüfe die Verbindung und lade die Seite neu.</Rueck>}
        {reiter !== "werkzeuge" && !fehler && !seiten && <p style={{ fontSize: 14, color: C.grau }}>Lädt …</p>}
        {reiter === "aufgaben" && seiten && (
          <>
            <p style={{ fontSize: 14, color: C.grau, margin: "0 0 14px", lineHeight: 1.6 }}>
              Alle Aufgaben aus diesem Kapitel des Buchs. Tippe eine an, um sie aufzuklappen. Unten im <b style={{ color: K.schwarz }}>Aufgabentool</b> bekommst du zu jedem Aufgabentyp beliebig viele neue, gleichwertige Aufgaben – mit Rückmeldung zu jedem Schritt.
            </p>
            {aufgaben.length === 0 && <p style={{ fontSize: 14, color: C.grau }}>In diesem Kapitel stehen keine Aufgaben.</p>}
            <div style={{ display: "grid", gap: 10 }}>
              {aufgaben.map((a) => <AufgabeKarte key={`${a.seite}-${a.nr}`} a={a} ueben={ueben} aktiv={quelle && quelle.seite === a.seite && quelle.nr === a.nr} gen={buch.gen} />)}
            </div>
            {typen.length > 0 && (
              <div ref={toolRef} style={{ scrollMarginTop: 72 }}>
                <Aufgabentool key={`${modul.id}`} typen={typen} typ={typ} setTyp={(t) => { setTyp(t); setQuelle(null); setRunde((n) => n + 1); }} quelle={quelle} runde={runde} modul={modul} onGeloest={onGeuebt} gen={buch.gen} />
              </div>
            )}
          </>
        )}
        {reiter === "saetze" && seiten && (
          <>
            <p style={{ fontSize: 14, color: C.grau, margin: "0 0 14px", lineHeight: 1.6 }}>Alle Merksätze, Definitionen und Hinweise aus diesem Kapitel – zum Nachschlagen beim Üben.</p>
            {kaesten.length === 0 && <p style={{ fontSize: 14, color: C.grau }}>In diesem Kapitel gibt es keine eigenen Merkkästen – sie stehen in den Kapiteln davor.</p>}
            <div style={{ display: "grid", gap: 10 }}>
              {kaesten.map((k) => <KastenKarte key={k.key} k={k} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Buchaufgabe zum Aufklappen ---------- */
function Punkte({ n }) {
  return (
    <span aria-label={`Schwierigkeit ${n} von 3`} style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i <= n ? K.gold : C.linie }} />)}
    </span>
  );
}
function AufgabeKarte({ a, ueben, aktiv, gen }) {
  const [auf, setAuf] = React.useState(false);
  const [loes, setLoes] = React.useState(false);
  const training = a.nr.startsWith("T");
  return (
    <div data-buchaufgabe={`${a.seite}-${a.nr}`} style={{ background: K.weiss, borderRadius: 16, border: `1px solid ${aktiv ? K.tief : C.linie}`, boxShadow: "0 2px 14px rgba(15,26,51,0.05)", overflow: "hidden" }}>
      <button type="button" className="dk-karte-kopf" aria-expanded={auf} onClick={() => setAuf(!auf)}>
        <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "none", width: 40 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 34, height: 34, padding: "0 6px", borderRadius: 17,
            background: a.offen ? K.weiss : K.schwarz, color: a.offen ? K.schwarz : K.baby, border: a.offen ? `2px solid ${K.schwarz}` : "none", fontWeight: 800, fontSize: training ? 12.5 : 14.5 }}>{a.nr}</span>
          <Punkte n={a.stufe} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.grau }}>{training ? "TRAINING" : "AUFGABE"} {a.nr} · S. {a.seite}</span>
            {a.typ
              ? <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", color: K.schwarz, background: K.baby, padding: "2px 7px", borderRadius: 999 }}>NEUE AUFGABEN</span>
              : <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", color: C.grau, background: C.sand, padding: "2px 7px", borderRadius: 999 }}>BEGRÜNDEN</span>}
          </span>
          {!auf && <span className="dk-kopf dk-buch" style={{ fontSize: 14.5, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: a.kopf || "" }} />}
          {auf && <span style={{ fontSize: 14.5, fontWeight: 700, color: K.schwarz }}>{a.typ ? gen.typTitel(a.typ) : "Aufgabe aus dem Buch"}</span>}
        </span>
        <span style={{ flex: "none", marginTop: 6 }}><AufklappZeichen auf={auf} /></span>
      </button>
      {auf && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ borderTop: `1px solid ${C.linie}`, paddingTop: 12 }}><Buch html={a.html} /></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {a.typ && (
              <button type="button" onClick={() => ueben(a)} data-ueben={`${a.seite}-${a.nr}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 16px", borderRadius: 12, border: "none", background: K.schwarz, color: K.weiss, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Neue Aufgaben dieses Typs üben <span aria-hidden="true">↓</span>
              </button>
            )}
            {a.loesung && (
              <button type="button" onClick={() => setLoes(!loes)} aria-expanded={loes}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "0 14px", borderRadius: 12, border: `1px solid ${C.linie}`, background: K.weiss, color: K.schwarz, fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                {loes ? "Lösung ausblenden" : "Lösung aus dem Buch"} <AufklappZeichen auf={loes} abstand={0} />
              </button>
            )}
          </div>
          {!a.typ && <p style={{ fontSize: 13, color: C.grau, margin: "10px 0 0", lineHeight: 1.55 }}>Hier geht es ums Begründen, Skizzieren oder Beweisen – dazu gibt es keine Varianten. Vergleiche deine Lösung mit der aus dem Buch.</p>}
          {loes && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: K.hell, borderLeft: `4px solid ${K.tief}` }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: K.gold, margin: "0 0 6px" }}>LÖSUNG AUS DEM BUCH</p>
              <Buch html={a.loesung} klein />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Sätze und Definitionen ---------- */
const KASTEN = {
  merke: { name: "Merke", farbe: C.see, grund: "#EEF5FC", offen: true },
  achtung: { name: "Achtung", farbe: C.signal, grund: "#FBF1EC", offen: false },
  vertiefung: { name: "Für Interessierte", farbe: K.schwarz, grund: "#F6F8FC", offen: false },
  rueckblick: { name: "Rückblick", farbe: K.gold, grund: "#FFF8E1", offen: true },
};
function KastenKarte({ k }) {
  const art = KASTEN[k.art] || KASTEN.merke;
  const [auf, setAuf] = React.useState(art.offen);
  const titel = (k.etikett || art.name).replace(/^★\s*/, "");
  return (
    <div data-kasten={k.art} style={{ background: K.weiss, borderRadius: 16, border: `1px solid ${C.linie}`, borderLeft: `5px solid ${art.farbe}`, overflow: "hidden" }}>
      <button type="button" className="dk-karte-kopf" aria-expanded={auf} onClick={() => setAuf(!auf)} style={{ alignItems: "center" }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", color: art.farbe, textTransform: "uppercase" }}>{art.name} · S. {k.seite}</span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: K.schwarz, marginTop: 2 }}>{titel.replace(/^(Merke|Achtung|Für Interessierte|Rückblick)\s*·?\s*/i, "") || art.name}</span>
        </span>
        <AufklappZeichen auf={auf} />
      </button>
      {auf && <div style={{ padding: "2px 16px 16px", background: art.grund }}><div style={{ paddingTop: 12 }}><Buch html={k.html} /></div></div>}
    </div>
  );
}

/* ---------- Aufgabentool ---------- */
function Tabelle({ t }) {
  return (
    <div style={{ overflowX: "auto", margin: "10px 0" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 14, minWidth: "100%" }}>
        <thead><tr>{t.kopf.map((k, i) => <th key={i} style={{ padding: "6px 10px", border: `1px solid ${C.linie}`, background: K.hell, fontWeight: 700, textAlign: i ? "center" : "left", whiteSpace: "nowrap" }}>{k}</th>)}</tr></thead>
        <tbody>{t.zeilen.map((z, j) => <tr key={j}>{z.map((w, i) => <td key={i} style={{ padding: "6px 10px", border: `1px solid ${C.linie}`, textAlign: i ? "center" : "left", whiteSpace: "nowrap" }}>{w}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Aufgabentool({ typen, typ, setTyp, quelle, runde, modul, onGeloest, gen }) {
  const gemischt = !typ;
  const ziehen = React.useCallback((t) => gen.neueAufgabe(t || typen[Math.floor(Math.random() * typen.length)].schluessel), [typen, gen]);
  const [au, setAu] = React.useState(() => ziehen(typ));
  const [stand, setStand] = React.useState(0);
  const [weg, setWeg] = React.useState(false);
  const [geloest, setGeloest] = React.useState(0);
  const gezaehlt = React.useRef(null);

  React.useEffect(() => { setAu(ziehen(typ)); setStand(0); setWeg(false); }, [runde]);   // eslint-disable-line react-hooks/exhaustive-deps
  const schritte = React.useMemo(() => au.schritte.map((s) => schrittFuer(s, au.typ)), [au]);
  React.useEffect(() => { if (typeof window !== "undefined") window.__dkAufgabe = au; }, [au]);   // für automatische Prüfungen (tests/ui/diffkurs.ui.py)
  const fertig = stand >= schritte.length;
  React.useEffect(() => {
    if (fertig && gezaehlt.current !== au.id) { gezaehlt.current = au.id; setGeloest((n) => n + 1); if (onGeloest) onGeloest(); }
  }, [fertig, au.id, onGeloest]);

  const neu = () => { setAu(ziehen(typ)); setStand(0); setWeg(false); };
  const aktuellerTyp = typen.find((t) => t.schluessel === au.typ);
  const quellenText = aktuellerTyp ? aktuellerTyp.quellen.map((q) => q.nr).join(", ") : "";
  const hilfe = hilfeKontext({
    id: `diffkurs-${au.typ}`, aufgabe: au.text.replace(/\$/g, ""),
    verstehen: [`Worum geht es? ${au.titel}.`], ansatz: au.schritte.map((s) => s.hinweis || s.frage).filter(Boolean).slice(0, 2),
    regel: au.schritte.map((s) => s.frage).filter(Boolean).slice(0, 1), pruefen: ["Setze dein Ergebnis zur Probe ein oder vergleiche mit dem Lösungsweg."],
    loesung: <ol style={{ margin: 0, paddingLeft: 20 }}>{au.weg.map((z, i) => <li key={i}><MS s={z} /></li>)}</ol>,
  });

  return (
    <section aria-label="Aufgabentool" style={{ marginTop: 26, borderRadius: 20, overflow: "hidden", border: `2px solid ${K.schwarz}`, background: K.weiss, boxShadow: "0 10px 30px rgba(11,12,16,0.12)" }}>
      <div style={{ background: K.schwarz, color: K.weiss, padding: "16px 16px 14px" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: K.baby, margin: 0 }}>AUFGABENTOOL · {modul.nr ? `KAPITEL ${modul.nr}` : modul.titel.toUpperCase()}</p>
        <h3 style={{ fontSize: 19, fontWeight: 800, margin: "4px 0 4px", letterSpacing: "-0.01em" }}>Neue Aufgaben vom selben Typ</h3>
        <p style={{ fontSize: 13.5, color: "#C9D2DE", margin: 0, lineHeight: 1.55 }}>Wähle einen Aufgabentyp aus dem Buch{typen.length > 3 ? " (zum Wischen)" : ""}. Jede neue Aufgabe ist gleichwertig – andere Zahlen, gleicher Lösungsweg.</p>
        <div data-aufgabentyp className="dk-chips">
          <button type="button" className="dk-chip" aria-pressed={gemischt} onClick={() => setTyp(null)}
            style={{ border: `1.5px solid ${gemischt ? K.baby : "rgba(255,255,255,0.3)"}`, background: gemischt ? K.baby : "transparent", color: gemischt ? K.schwarz : K.weiss }}>Gemischt</button>
          {typen.map((t) => {
            const an = typ === t.schluessel;
            return (
              <button key={t.schluessel} type="button" className="dk-chip" aria-pressed={an} onClick={() => setTyp(t.schluessel)} data-typ={t.schluessel}
                style={{ border: `1.5px solid ${an ? K.baby : "rgba(255,255,255,0.3)"}`, background: an ? K.baby : "transparent", color: an ? K.schwarz : K.weiss }}>
                {t.titel} <span style={{ fontWeight: 600, opacity: 0.7 }}>· Nr. {t.quellen.map((q) => q.nr).join(", ")}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div key={au.id} style={{ padding: "16px 16px 18px" }} data-aufgabe-typ={au.typ}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "4px 10px", marginBottom: 8 }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.1em", color: K.gold, margin: 0, textTransform: "uppercase" }}>{au.titel}</p>
          <p style={{ fontSize: 12, color: C.grau, margin: 0 }}>{quelle ? `wie Aufgabe ${quelle.nr}, S. ${quelle.seite}` : quellenText ? `wie Aufgabe ${quellenText}` : ""}</p>
        </div>
        <div style={{ fontSize: 15.5, color: C.tinte, lineHeight: 1.65 }}><MS s={au.text} /></div>
        {au.skizze && <div style={{ background: C.sand, borderRadius: 14, padding: 6, marginTop: 10, maxWidth: 460 }}><FunktionsBild {...au.skizze} /></div>}
        {au.tabelle && <Tabelle t={au.tabelle} />}
        <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={null} />
        {fertig && <Rueck art="gut">Richtig gelöst. Hol dir gleich die nächste Aufgabe vom selben Typ.</Rueck>}

        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 12, background: C.sand }}>
          <button type="button" onClick={() => setWeg(!weg)} aria-expanded={weg}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 8, background: "none", border: "none", padding: "4px 0", fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: K.schwarz, cursor: "pointer" }}>
            Lösungsweg <AufklappZeichen auf={weg} />
          </button>
          {weg && (
            <ol style={{ margin: "8px 0 4px", paddingLeft: 20, fontSize: 15, lineHeight: 1.85, color: C.tinte }}>
              {au.weg.map((z, i) => <li key={i} style={{ paddingLeft: 2 }}><MS s={z} /></li>)}
            </ol>
          )}
        </div>

        <GrosserKnopf onClick={neu}>{fertig ? "Nächste Aufgabe vom selben Typ" : "Neue Aufgabe vom selben Typ"}</GrosserKnopf>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: C.grau }} aria-live="polite">{geloest ? `${geloest} ${geloest === 1 ? "Aufgabe" : "Aufgaben"} gelöst` : "Noch keine Aufgabe gelöst"}</span>
          <IchHaengeFest kontext={hilfe} />
        </div>
      </div>
    </section>
  );
}
