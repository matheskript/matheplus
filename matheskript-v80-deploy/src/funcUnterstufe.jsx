/* ============================================================
   Modul Unterstufe – Klasse 5 und 6, der ganze Stoff als Kurs.
   Gestaltung „Lack und Goldfolie“ (Palette GRANAT, Motiv Geodreieck), Bausteine aus funcKursKopf.jsx.

   Übersicht:   Kopf · Klassenwahl (5 | 6) · Fortschrittskarte der Klasse · Kapitel mit Lerneinheiten
   Lerneinheit: Darum geht's + Video · Verstehen (Text, Motion-Animationen, Skizze) · Beispiel Schritt für Schritt ·
                Merke · Typischer Fehler · Üben (Probier-es-Aufgabe aus arbeitsblatt.js mit Lösung; darunter EIN Knopf
                zum passenden Werkzeug + Untermenü „Mehr üben“ mit den übrigen Werkzeugen, Kopfrechen-Trainern, Seiten) ·
                Kann ich das? (drei Haken = geschafft) · Weiter
   Medien: unterstufeMedien.js (Animationen je Lerneinheit, Video bzw. Michael-Penn-Platzhalter), Abspieler funcUnterstufeMotion.jsx.

   Daten: unterstufeDaten.js (+ 5/6). Speicher: localStorage mm_unterstufe
   { gelesen: {[id]: true}, haken: {[id]: [bool, bool, bool]}, zuletzt: id } – Stand für die Kachel in kursStand.js.
   Pfade: /unterstufe, /unterstufe/klasse-5, /unterstufe/<einheit> (seite/setSeite aus func10.jsx).
   ============================================================ */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { MS } from "./mathText.jsx";
import { WERKZEUGE } from "./werkzeuge.js";
import { springe } from "./sprung.js";
import { uebenWunschSetzen } from "./uebenWunsch.js";
import { aufgabeAus } from "./arbeitsblatt.js";
import { GRANAT, GOLD_VERLAUF } from "./kursFarben.js";
import { MotivGeodreieck } from "./funcKursMotive.jsx";
import { KursKopf, FortschrittKarte, KapitelKopf, ModulKarte, ModulListe, Hinweis, IconBuch, IconAufgabe, IconWerkzeug, kursVars } from "./funcKursKopf.jsx";
import { UnterBild } from "./funcUnterstufeBilder.jsx";
import { Motion } from "./funcUnterstufeMotion.jsx";
import { ExternSchutz } from "./funcExtern.jsx";
import { animationenFuer, videoFuer } from "./unterstufeMedien.js";
import {
  UNTERSTUFE_KLASSEN, UNTERSTUFE_EINHEITEN, UNTERSTUFE_INFO, UNTERSTUFE_ZAHLEN, einheitVon, klasseVon, naechsteEinheit, vorigeEinheit, einheitGeschafft, unterstufeStand,
} from "./unterstufeDaten.js";

const KopfTrainer = React.lazy(() => import("./func14.jsx").then((m) => ({ default: m.KopfTrainer })));
const TRAINER_NAME = { plusminus: "Plus und Minus", multiplizieren: "Multiplizieren", potenzen: "Quadrate und Wurzeln", primzahlen: "Primzahlen", primfaktoren: "Primfaktoren", division: "Schriftlich teilen", bruchrechnen: "Bruchrechnung" };
const TRAINER_ZEICHEN = { plusminus: "+ −", multiplizieren: "7·8", potenzen: "12²", primzahlen: "13", primfaktoren: "2·3·7", division: "÷", bruchrechnen: "¾" };

/* ---------- Speicher ---------- */
const SCHLUESSEL = "mm_unterstufe";
const lies = () => { try { return JSON.parse(localStorage.getItem(SCHLUESSEL) || "{}") || {}; } catch (e) { return {}; } };
const schreib = (s) => { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(s)); } catch (e) { /* kein Speicher */ } };
const nachOben = () => springe("unterstufe-seite", () => window.scrollTo({ top: 0, behavior: "auto" }));

/* ---------- Stil ---------- */
const STIL_ID = "us-stil";
const STIL = `
  .us-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 18px}
  .us-tab{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:12px 16px;border-radius:16px;border:1px solid ${C.linie};background:${C.weiss};cursor:pointer;font-family:inherit;text-align:left;
    box-shadow:0 1px 2px rgba(15,26,51,0.04);transition:transform .15s ease,box-shadow .15s ease}
  .us-tab b{font-size:17px;font-weight:800;letter-spacing:-0.02em;color:${C.tinte}}
  .us-tab span{font-size:12.5px;color:${C.grau}}
  .us-tab[aria-pressed="true"]{border-color:transparent;background:var(--ks-dunkel);box-shadow:0 1px 0 rgba(255,255,255,0.14) inset,0 14px 30px -16px rgba(58,0,25,0.7)}
  .us-tab[aria-pressed="true"] b{color:${C.weiss}}.us-tab[aria-pressed="true"] span{color:rgba(255,255,255,0.78)}
  .us-tab:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
  .us-karte{background:${C.weiss};border:1px solid ${C.linie};border-radius:20px;padding:18px 18px 16px;margin:0 0 14px;box-shadow:0 1px 2px rgba(15,26,51,0.04),0 8px 22px -16px rgba(15,26,51,0.18)}
  .us-kicker{margin:0 0 10px;font-size:11.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#7A0032}
  .us-text{margin:0 0 12px;font-size:15.5px;line-height:1.7;color:${C.tinte}}
  .us-text:last-child{margin-bottom:0}
  .us-text b{font-weight:700;color:#3A0019}
  .us-liste{margin:0 0 12px;padding-left:20px;font-size:15px;line-height:1.65;color:${C.tinte}}
  .us-liste li{margin-bottom:6px}
  .us-tabelle{width:100%;border-collapse:separate;border-spacing:0;margin:4px 0 14px;font-size:14px;line-height:1.5}
  .us-tabelle th,.us-tabelle td{padding:7px 10px;border-bottom:1px solid ${C.linie};text-align:left;vertical-align:top}
  .us-tabelle th{font-weight:800;color:#3A0019;background:#FFF5F8;border-bottom:2px solid #F2C14E}
  .us-tabelle tr:last-child td{border-bottom:none}
  .us-formel{margin:6px 0 14px;padding:12px 14px;border-radius:14px;background:${C.sand};font-size:17px;line-height:2;color:${C.tinte};overflow-x:auto}
  .us-bild{margin:4px 0 14px;padding:10px 8px 6px;border-radius:16px;background:${C.sand}}
  .us-ziel{margin:0;font-size:16px;line-height:1.6;font-weight:600;color:${C.tinte}}
  .us-schritt{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px dashed ${C.linie};font-size:15px;line-height:1.65;color:${C.tinte}}
  .us-schritt i{flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9px;font-style:normal;font-weight:800;font-size:12.5px;background:#5A0024;color:#FFD66B}
  .us-merke{border:none;background:linear-gradient(150deg,#3A0019 0%,#5A0024 100%);color:${C.weiss};padding:18px 18px 16px}
  .us-merke .us-kicker{color:#FFD66B}.us-merke .us-text{color:${C.weiss};font-weight:600}.us-merke .us-text b{color:#FFE9A0}
  .us-fehler{border-left:5px solid ${C.gruen}}
  .us-knoepfe{display:flex;flex-wrap:wrap;gap:8px}
  .us-knopf{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:8px 14px 8px 12px;border-radius:999px;border:1.5px solid ${C.linie};background:${C.weiss};color:${C.tinte};
    font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;text-align:left;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
  .us-knopf small{display:block;font-size:11px;font-weight:600;color:${C.grau}}
  .us-knopf em{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 6px;border-radius:9px;font-style:normal;font-size:12px;font-weight:800;background:#FFF5F8;color:#7A0032}
  .us-knopf-gold{border-color:transparent;background:${GOLD_VERLAUF};color:#3A0019}.us-knopf-gold em{background:rgba(58,0,25,0.12);color:#3A0019}.us-knopf-gold small{color:rgba(58,0,25,0.7)}
  .us-knopf-dunkel{border-color:transparent;background:linear-gradient(150deg,#3A0019 0%,#7A0032 100%);color:${C.weiss}}.us-knopf-dunkel em{background:rgba(255,255,255,0.14);color:#FFD66B}.us-knopf-dunkel small{color:rgba(255,255,255,0.75)}
  @media (hover:hover){.us-knopf:hover,.us-tab:hover{transform:translateY(-1px);box-shadow:0 10px 22px -12px rgba(15,26,51,0.3)}}
  .us-knopf:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
  .us-haken{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-top:1px solid ${C.linie};cursor:pointer}
  .us-haken:first-of-type{border-top:none}
  .us-haken input{position:absolute;opacity:0;width:0;height:0}
  .us-haken i{flex:none;width:26px;height:26px;border-radius:9px;border:2px solid ${C.linie};display:inline-flex;align-items:center;justify-content:center;color:${C.weiss};transition:background .15s ease,border-color .15s ease}
  .us-haken[data-an="1"] i{background:${GOLD_VERLAUF};border-color:transparent;color:#3A0019}
  .us-haken span{font-size:15px;line-height:1.55;color:${C.tinte};padding-top:2px}
  .us-haken:has(input:focus-visible) i{outline:3px solid ${C.flaggold};outline-offset:2px}
  .us-geschafft{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 14px;border-radius:999px;background:#FFF5F8;color:#7A0032;font-size:13.5px;font-weight:800}
  .us-nav{display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;margin:6px 0 30px}
  .us-trainer{margin-top:12px;padding:6px 0 0;border-top:1px solid ${C.linie}}
  .us-zurueck{background:none;border:none;color:#7A0032;font-size:13.5px;font-weight:700;font-family:inherit;cursor:pointer;padding:0;margin:18px 0 14px;display:inline-flex;align-items:center;gap:6px}
  .us-aufgabe{font-size:16px;line-height:1.65;color:${C.tinte};margin:0 0 10px;font-weight:600}
  .us-weg{margin:10px 0 0;padding:12px 14px;border-radius:14px;background:${C.sand};font-size:15px;line-height:1.9;color:${C.tinte}}
  .us-weg p{margin:0}
  .us-ergebnis{margin-top:8px;font-weight:800;color:#7A0032}
  .us-video{position:relative;width:100%;padding-top:56.25%;border-radius:16px;overflow:hidden;margin-top:14px;background:#3A0019}
  .us-video iframe,.us-video>button{position:absolute;inset:0;width:100%;height:100%;border:0}
  .us-video>button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;font-family:inherit;color:#fff;padding:16px;
    background:radial-gradient(120% 90% at 20% 0%,#7A0032 0%,#3A0019 70%)}
  .us-video>button i{width:58px;height:58px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#FFE9A0 0%,#E2B53C 100%);box-shadow:0 10px 24px -10px rgba(0,0,0,0.6)}
  .us-video>button b{font-size:14.5px;font-weight:800}
  .us-video>button span{font-size:11.5px;opacity:0.8;max-width:300px;line-height:1.45;text-align:center}
  .us-platzhalter{margin:8px 0 0;font-size:12px;color:${C.grau};line-height:1.5}
  .us-trenn{height:1px;background:${C.linie};margin:16px 0 14px}
  .us-app{display:flex;gap:8px;align-items:stretch}
  .us-app .us-knopf{flex:1;justify-content:flex-start}
  .us-mehr{flex:none;display:inline-flex;align-items:center;gap:6px;padding:0 14px;border-radius:999px;border:1.5px solid ${C.linie};background:${C.weiss};color:#7A0032;
    font-family:inherit;font-size:13px;font-weight:800;cursor:pointer}
  .us-mehr svg{transition:transform .2s ease}.us-mehr[aria-expanded="true"] svg{transform:rotate(180deg)}
  .us-mehr:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
  .us-menue{margin:8px 0 0;border:1px solid ${C.linie};border-radius:16px;overflow:hidden;background:${C.weiss}}
  .us-zeile{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;border:none;border-top:1px solid ${C.linie};background:none;cursor:pointer;font-family:inherit;text-align:left;color:${C.tinte}}
  .us-zeile:first-child{border-top:none}
  .us-zeile em{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 6px;border-radius:9px;font-style:normal;font-size:12px;font-weight:800;background:#FFF5F8;color:#7A0032}
  .us-zeile span{flex:1;font-size:14px;font-weight:700;line-height:1.35}.us-zeile small{display:block;font-size:11.5px;font-weight:600;color:${C.grau}}
  .us-zeile[aria-expanded="true"]{background:#FFF5F8}
  @media (hover:hover){.us-zeile:hover{background:#FFF9FB}}
  .us-zeile:focus-visible{outline:3px solid ${C.flaggold};outline-offset:-3px}
  .us-link{background:none;border:none;padding:6px 0;color:#7A0032;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;text-align:left}
  @media (min-width:840px){.us-tabs{max-width:420px}.us-karte{padding:22px 24px 20px}.us-text{font-size:16px}}
  @media (prefers-reduced-motion:reduce){.us-knopf,.us-tab{transition:none}.us-knopf:hover,.us-tab:hover{transform:none}}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style"); el.id = STIL_ID; el.textContent = STIL; document.head.appendChild(el);
}

/* ---------- Text mit **fett** und $Formeln$ ---------- */
function Fett({ s }) {
  const teile = String(s).split("**");
  return <>{teile.map((t, i) => (i % 2 ? <b key={i}><MS s={t} /></b> : <MS key={i} s={t} />))}</>;
}
function Absatz({ a }) {
  if (typeof a === "string") return <p className="us-text"><Fett s={a} /></p>;
  if (a.kopf) return <p className="us-kicker" style={{ marginTop: 6 }}>{a.kopf}</p>;
  if (a.liste) return <ul className="us-liste">{a.liste.map((l, i) => <li key={i}><Fett s={l} /></li>)}</ul>;
  if (a.formel) return <div className="us-formel">{a.formel.map((f, i) => <div key={i}><MS s={`$${f}$`} /></div>)}</div>;
  if (a.tabelle) return (
    <div style={{ overflowX: "auto" }}>
      <table className="us-tabelle">
        <thead><tr>{a.tabelle.kopf.map((k, i) => <th key={i}><Fett s={k} /></th>)}</tr></thead>
        <tbody>{a.tabelle.zeilen.map((z, i) => <tr key={i}>{z.map((c, j) => <td key={j}><Fett s={c} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
  return null;
}

function Karte({ kicker, className = "", children, kennung }) {
  return <section className={`us-karte ${className}`} {...kennung}>{kicker && <p className="us-kicker">{kicker}</p>}{children}</section>;
}

/* ---------- Beispiel: Schritt für Schritt ---------- */
function Beispiel({ beispiel }) {
  const [n, setN] = useState(0);
  const alle = beispiel.schritte.length;
  return (
    <Karte kicker="Beispiel" kennung={{ "data-us-beispiel": "" }}>
      <p className="us-aufgabe"><MS s={beispiel.aufgabe} /></p>
      {beispiel.schritte.slice(0, n).map((s, i) => <div key={i} className="us-schritt"><i>{i + 1}</i><span><MS s={s} /></span></div>)}
      <div className="us-knoepfe" style={{ marginTop: 10 }}>
        {n < alle
          ? <button type="button" className="us-knopf us-knopf-dunkel" onClick={() => setN(n + 1)}>{n === 0 ? "Ersten Schritt zeigen" : `Schritt ${n + 1} von ${alle}`}</button>
          : <button type="button" className="us-link" onClick={() => setN(0)}>↺ Noch einmal von vorn</button>}
      </div>
    </Karte>
  );
}

/* ---------- Probier es gleich: Aufgabe aus arbeitsblatt.js ---------- */
function ProbierEs({ quellen }) {
  const [nr, setNr] = useState(0);
  const [offen, setOffen] = useState(false);
  const aufgabe = useMemo(() => {
    const q = quellen[nr % quellen.length];
    try { return aufgabeAus(`u:${q}`); } catch (e) { return null; }
  }, [quellen, nr]);
  if (!aufgabe) return null;
  const neu = () => { setNr(nr + 1); setOffen(false); };
  return (
    <div data-us-aufgabe="">
      <p className="us-kicker" style={{ color: C.grau }}>Probier es gleich</p>
      <p className="us-aufgabe"><MS s={aufgabe.text} /></p>
      {aufgabe.tabelle && (
        <table className="us-tabelle" style={{ width: "auto" }}>
          <thead><tr>{aufgabe.tabelle.kopf.map((k, i) => <th key={i}>{k}</th>)}</tr></thead>
          <tbody><tr>{aufgabe.tabelle.zeile.map((c, i) => <td key={i}><MS s={String(c)} /></td>)}</tr></tbody>
        </table>
      )}
      {aufgabe.optionen && <ul className="us-liste">{aufgabe.optionen.map((o, i) => <li key={i}>{String.fromCharCode(97 + i)}) <MS s={o} /></li>)}</ul>}
      <p style={{ margin: "0 0 10px", fontSize: 13.5, color: C.grau }}>Rechne erst selbst auf dem Blatt – ein Schritt pro Zeile. Dann vergleichen.</p>
      {offen && (
        <div className="us-weg">
          {(aufgabe.weg || []).map((w, i) => <p key={i}><MS s={w} /></p>)}
          <p className="us-ergebnis">Ergebnis: <MS s={String(aufgabe.ergebnis)} /></p>
        </div>
      )}
      <div className="us-knoepfe" style={{ marginTop: 10 }}>
        {!offen && <button type="button" className="us-knopf us-knopf-dunkel" onClick={() => setOffen(true)}>Lösung zeigen</button>}
        <button type="button" className="us-link" onClick={neu}>Neue Aufgabe →</button>
      </div>
    </div>
  );
}

/* ---------- Üben: Probier-es-Aufgabe + EIN Knopf zum Werkzeug + Untermenü „Mehr üben“ ---------- */
const Pfeilchen = () => <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
function uebenInfo(u) {
  if (u.wz) { const w = WERKZEUGE[u.wz]; return { zeichen: w ? w.zeichen : "→", text: u.text, art: `${u.modus === "entdecken" ? "Entdecken" : "Üben"} · ${w ? w.kurz || w.name : u.wz}` }; }
  if (u.kopf) return { zeichen: TRAINER_ZEICHEN[u.kopf], text: u.text, art: `Kopfrechnen · ${TRAINER_NAME[u.kopf]}` };
  return { zeichen: "→", text: u.text, art: "Seite öffnen" };
}
function Ueben({ einheit, gehe }) {
  const [trainer, setTrainer] = useState(null);
  const [mehr, setMehr] = useState(false);
  const los = (u) => {
    if (u.kopf) { setTrainer(trainer === u.kopf ? null : u.kopf); return; }
    if (u.wz) {
      const w = WERKZEUGE[u.wz];
      if (!w) return;
      uebenWunschSetzen(w.ziel.ansicht, { modus: u.modus || (u.art ? "ueben" : null), art: u.art || null });
      gehe({ ...w.ziel });
      return;
    }
    gehe(u.ziel);
  };
  /* Hauptknopf: das erste Werkzeug im Übungsmodus (sonst der erste Eintrag) */
  const iHaupt = Math.max(0, einheit.ueben.findIndex((u) => u.wz && u.modus !== "entdecken"));
  const haupt = einheit.ueben[iHaupt], rest = einheit.ueben.filter((_, i) => i !== iHaupt);
  const h = haupt && uebenInfo(haupt);
  return (
    <Karte kicker="Üben" kennung={{ "data-us-ueben": "" }}>
      {einheit.aufgaben.length > 0 && <><ProbierEs key={einheit.id} quellen={einheit.aufgaben} /><div className="us-trenn" /></>}
      {haupt && (
        <>
          <div className="us-app">
            <button type="button" className={`us-knopf ${haupt.kopf ? "us-knopf-dunkel" : "us-knopf-gold"}`} onClick={() => los(haupt)} data-us-wz={haupt.wz} data-us-kopf={haupt.kopf} data-us-haupt="">
              <em>{h.zeichen}</em><span>{h.text}<small>{h.art}</small></span>
            </button>
            {rest.length > 0 && (
              <button type="button" className="us-mehr" aria-expanded={mehr} aria-controls={`us-mehr-${einheit.id}`} onClick={() => setMehr(!mehr)} data-us-mehr="">
                Mehr <span style={{ fontWeight: 600, color: C.grau }}>{rest.length}</span><Pfeilchen />
              </button>
            )}
          </div>
          {mehr && rest.length > 0 && (
            <div className="us-menue" id={`us-mehr-${einheit.id}`} data-us-menue="">
              {rest.map((u, i) => {
                const info = uebenInfo(u);
                return (
                  <button key={i} type="button" className="us-zeile" onClick={() => los(u)} aria-expanded={u.kopf ? trainer === u.kopf : undefined} data-us-wz={u.wz} data-us-kopf={u.kopf}>
                    <em>{info.zeichen}</em><span>{info.text}<small>{info.art}</small></span><span aria-hidden="true" style={{ flex: "none", color: C.grau }}>{u.kopf ? (trainer === u.kopf ? "−" : "+") : "→"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
      {trainer && (
        <div className="us-trainer" data-us-trainer={trainer}>
          <p className="us-kicker" style={{ marginTop: 8 }}>Kopfrechnen · {TRAINER_NAME[trainer]}</p>
          <React.Suspense fallback={<p style={{ color: C.grau, fontSize: 14 }}>Trainer wird geladen …</p>}>
            <KopfTrainer id={trainer} />
          </React.Suspense>
          <div className="us-knoepfe" style={{ marginTop: 10, gap: 16 }}>
            <button type="button" className="us-link" onClick={() => setTrainer(null)}>Trainer schließen</button>
            <button type="button" className="us-link" onClick={() => gehe({ ansicht: "kopf", trainer })}>Im Bereich Kopfrechnen öffnen →</button>
          </div>
        </div>
      )}
    </Karte>
  );
}

/* ---------- Video: erst beim Klick laden (YouTube-nocookie, Einwilligung über ExternSchutz) ---------- */
function Video({ einheit }) {
  const [an, setAn] = useState(false);
  useEffect(() => setAn(false), [einheit.id]);
  const v = videoFuer(einheit.id);
  return (
    <>
      <div className="us-video" data-us-video={v.youtube}>
        {an ? (
          <ExternSchutz dienst="youtube">
            <iframe title={v.platzhalter ? `Video (Platzhalter) zu ${einheit.titel}` : v.titel} src={`https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </ExternSchutz>
        ) : (
          <button type="button" onClick={() => setAn(true)} aria-label={`Video zu ${einheit.titel} abspielen`}>
            <i><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M8 5 L8 19 L19 12 Z" fill="#3A0019" /></svg></i>
            <b>Video zur Lerneinheit</b>
            <span>Beim Abspielen wird das Video von YouTube (youtube-nocookie.com) geladen.</span>
          </button>
        )}
      </div>
      {v.platzhalter && <p className="us-platzhalter">Platzhalter: ein Video von Michael Penn (Englisch). Das deutsche Video zu „{einheit.titel}“ folgt.</p>}
    </>
  );
}

/* ---------- Lerneinheit ---------- */
function EinheitSeite({ einheit, stand, setze, zu, gehe }) {
  const haken = (stand.haken && stand.haken[einheit.id]) || [];
  const ok = einheitGeschafft(einheit, stand);
  const naechste = naechsteEinheit(einheit.id), vorige = vorigeEinheit(einheit.id);
  const klasse = klasseVon(einheit.klasse);
  useEffect(() => { setze((s) => ({ ...s, gelesen: { ...(s.gelesen || {}), [einheit.id]: true }, zuletzt: einheit.id })); }, [einheit.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (i) => setze((s) => {
    const alt = (s.haken && s.haken[einheit.id]) || [];
    const neu = einheit.kann.map((_, k) => (k === i ? !alt[k] : !!alt[k]));
    return { ...s, haken: { ...(s.haken || {}), [einheit.id]: neu } };
  });
  const bildVor = einheit.bild && einheit.lesen.length > 1;
  const anims = animationenFuer(einheit.id);
  return (
    <>
      <KursKopf farben={GRANAT} Motiv={MotivGeodreieck} id="ks-unter" kompakt titel={einheit.titel}
        zeile={`${klasse.titel} · Kapitel ${einheit.marke} ${einheit.kapitelTitel} · Lerneinheit ${einheit.nr} von ${einheit.anzahl}`} kennung={{ "data-us-einheit": einheit.id }} />
      <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
        <button type="button" className="us-zurueck" onClick={() => zu(`klasse-${einheit.klasse}`)}>← Alle Lerneinheiten der {klasse.titel}</button>

        <Karte kicker="Darum geht’s"><p className="us-ziel">{einheit.ziel}</p><Video einheit={einheit} /></Karte>

        <Karte kicker="Verstehen" kennung={{ "data-us-lesen": "" }}>
          {einheit.lesen.map((a, i) => (
            <React.Fragment key={i}>
              <Absatz a={a} />
              {i === 0 && anims[0] && <Motion key={`${einheit.id}-0`} {...anims[0]} />}
              {i === 1 && bildVor && <div className="us-bild"><UnterBild bild={einheit.bild} /></div>}
              {i >= 1 && anims[i] && <Motion key={`${einheit.id}-${i}`} {...anims[i]} />}
            </React.Fragment>
          ))}
          {anims.slice(Math.max(1, einheit.lesen.length)).map((m, i) => <Motion key={`${einheit.id}-r${i}`} {...m} />)}
          {einheit.bild && !bildVor && <div className="us-bild"><UnterBild bild={einheit.bild} /></div>}
        </Karte>

        <Beispiel beispiel={einheit.beispiel} />

        <Karte kicker="Merke" className="us-merke"><p className="us-text"><Fett s={einheit.merke} /></p></Karte>
        {einheit.fehler && <Karte kicker="Typischer Fehler" className="us-fehler"><p className="us-text"><Fett s={einheit.fehler} /></p></Karte>}

        <Ueben key={einheit.id} einheit={einheit} gehe={gehe} />

        <Karte kicker="Kann ich das?" kennung={{ "data-us-kann": "" }}>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: C.grau, lineHeight: 1.55 }}>Hake ehrlich ab. Mit drei Haken gilt die Lerneinheit als geschafft – und zählt auf der Kachel.</p>
          {einheit.kann.map((k, i) => (
            <label key={i} className="us-haken" data-an={haken[i] ? "1" : "0"}>
              <input type="checkbox" checked={!!haken[i]} onChange={() => toggle(i)} />
              <i aria-hidden="true">{haken[i] ? "✓" : ""}</i><span><MS s={k} /></span>
            </label>
          ))}
          {ok && <span className="us-geschafft" data-us-geschafft="">✓ Geschafft – weiter so!</span>}
        </Karte>

        <div className="us-nav">
          {vorige ? <button type="button" className="us-link" onClick={() => zu(vorige.id)}>← {vorige.titel}</button> : <span />}
          {naechste
            ? <button type="button" className="us-knopf us-knopf-gold" onClick={() => zu(naechste.id)} data-us-weiter="">Nächste Lerneinheit: {naechste.titel} →</button>
            : <button type="button" className="us-knopf us-knopf-gold" onClick={() => zu(null)}>Zur Übersicht →</button>}
        </div>
      </div>
    </>
  );
}

/* ---------- Übersicht ---------- */
function Uebersicht({ klasseId, setKlasse, stand, zu }) {
  const klasse = klasseVon(klasseId) || UNTERSTUFE_KLASSEN[0];
  const st = unterstufeStand(stand);
  const je = st.jeKlasse[klasse.id];
  const inKlasse = UNTERSTUFE_EINHEITEN.filter((e) => e.klasse === klasse.id);
  const zuletzt = stand.zuletzt ? einheitVon(stand.zuletzt) : null;
  const weiter = (zuletzt && zuletzt.klasse === klasse.id && !einheitGeschafft(zuletzt, stand) ? zuletzt : null) || inKlasse.find((e) => !einheitGeschafft(e, stand)) || inKlasse[0];
  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
      <FortschrittKarte farben={GRANAT} zahl={je.fertig} gesamt={je.gesamt} einheit="Lerneinheiten" einheitDativ="Lerneinheiten" onKnopf={() => zu(weiter.id)}
        knopf={je.fertig === 0 ? `${klasse.titel} starten` : "Weiter mit"} ziel={weiter.titel} kennung={{ "data-us-fortschritt": klasse.id }}
        zusatz={st.fertig > je.fertig ? `Insgesamt ${st.fertig} von ${st.gesamt} Lerneinheiten in beiden Klassen` : undefined} />
      <div className="us-tabs" style={kursVars(GRANAT)} role="tablist" aria-label="Klasse wählen">
        {UNTERSTUFE_KLASSEN.map((k) => (
          <button key={k.id} type="button" role="tab" className="us-tab" aria-pressed={k.id === klasse.id} aria-selected={k.id === klasse.id} onClick={() => setKlasse(k.id)} data-us-klasse={k.id}>
            <b>{k.titel}</b><span>{k.kapitel.length} Kapitel · {UNTERSTUFE_ZAHLEN.jeKlasse[k.id]} Lerneinheiten</span>
          </button>
        ))}
      </div>
      <Hinweis>
        {klasse.zeile}. Jede Lerneinheit erklärt eine Sache so, wie sie im Unterricht drankommt: lesen, ein Beispiel Schritt für Schritt, der Merksatz –
        und dann gleich üben, mit den Werkzeugen der App und den Kopfrechen-Trainern. Orientiert am Bildungsplan Baden-Württemberg; die Reihenfolge ist je Schule etwas anders.
      </Hinweis>
      {klasse.kapitel.map((kap) => (
        <section key={kap.id} data-us-kapitel={kap.id}>
          <KapitelKopf farben={GRANAT} marke={kap.marke} titel={kap.titel} voll={`${kap.titel} – ${kap.zeile}`} />
          <ModulListe>
            {kap.einheiten.map((e, i) => {
              const voll = einheitVon(e.id);
              const wz = e.ueben.filter((u) => u.wz).length, kopf = e.ueben.filter((u) => u.kopf).length;
              const meta = [{ icon: <IconBuch />, text: "Lesen", label: "Erklärung und Beispiel" }];
              if (e.aufgaben.length) meta.push({ icon: <IconAufgabe />, text: `${e.aufgaben.length} Aufgaben${e.aufgaben.length > 1 ? "typen" : "typ"}`, label: "Aufgaben zum Probieren" });
              if (wz) meta.push({ icon: <IconWerkzeug />, text: `${wz} Werkzeug${wz > 1 ? "e" : ""}`, label: "Werkzeuge der App" });
              if (kopf) meta.push({ icon: <IconWerkzeug />, text: "Kopfrechnen", label: "Kopfrechen-Trainer" });
              return <ModulKarte key={e.id} farben={GRANAT} nr={i + 1} titel={e.titel} voll={e.ziel} meta={meta} ok={einheitGeschafft(voll, stand)} onClick={() => zu(e.id)} klasse="us-modul" kennung={{ "data-us-modul": e.id }} />;
            })}
          </ModulListe>
        </section>
      ))}
    </div>
  );
}

/* ---------- Seite ---------- */
export function UnterstufeSeite({ gehe, seite = null, setSeite = () => {} }) {
  React.useInsertionEffect(stilSetzen, []);
  const [stand, setStand] = useState(lies);
  const setze = (f) => setStand((s) => { const n = typeof f === "function" ? f(s) : f; schreib(n); return n; });
  const [klasse, setKlasseRoh] = useState(() => {
    const m = /^klasse-(\d)$/.exec(seite || "");
    if (m) return m[1];
    const e = seite ? einheitVon(seite) : null;
    return e ? e.klasse : unterstufeStand(lies()).weiter.klasse;
  });
  const einheit = seite ? einheitVon(seite) : null;
  useEffect(() => { if (einheit) setKlasseRoh(einheit.klasse); }, [einheit && einheit.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const zu = (s) => { setSeite(s); nachOben(); };
  const setKlasse = (k) => { setKlasseRoh(k); setSeite(`klasse-${k}`); };

  if (einheit) return <EinheitSeite einheit={einheit} stand={stand} setze={setze} zu={zu} gehe={gehe} />;
  const st = unterstufeStand(stand);
  return (
    <>
      <KursKopf farben={GRANAT} Motiv={MotivGeodreieck} id="ks-unter" titel={UNTERSTUFE_INFO.titel} zeile={UNTERSTUFE_INFO.zeile} kennung={{ "data-us-kopf": "" }}
        chips={[
          { icon: <IconBuch />, text: `${UNTERSTUFE_ZAHLEN.kapitel} Kapitel` },
          { icon: <IconAufgabe />, text: `${UNTERSTUFE_ZAHLEN.einheiten} Lerneinheiten` },
          { icon: <IconWerkzeug />, text: "Kopfrechnen inklusive" },
          { icon: <IconBuch />, text: "Animationen und Videos" },
          ...(st.fertig ? [{ icon: <IconAufgabe />, text: `${st.fertig} geschafft` }] : []),
        ]} />
      <Uebersicht klasseId={klasse} setKlasse={setKlasse} stand={stand} zu={zu} />
    </>
  );
}
