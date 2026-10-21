/* ======================================================================
   Heute-Karte (Startseite, Zone 1 „Heute zählt“, Rolle Schüler)
   Zeigt, was heute konkret ansteht – „Produktregel trainieren“, „Verkettungen bilden“ … –
   in der Optik der Kurs-Kacheln („Lack und Goldfolie“, Farbwelt NACHTBLAU).

   · Kopf: EINE Zeile – Umfang als Ansage („4 Runden · 32 Min“, „Noch 3 Runden · 20 Min“,
     „Für heute geschafft“) und rechts die Klasse als Knopf zum Ändern.
   · Etappen: je Einheit eine Kachel mit großem Motiv (funcHeuteMotive.jsx), Kurzwort darunter,
     Fortschritt als Goldlinie in der Kachel. Die nächste offene Einheit trägt den Goldrahmen,
     erledigte bekommen den Goldhaken. Ein Tipp auf eine Kachel startet diese Einheit.
   · Fuß: ein Goldknopf startet die nächste offene Einheit, daneben „Details“ (aufklappen).
   · Aufgeklappt: je Einheit eine Karte mit Station, Auftrag, Inhalten, Grund („Neu für dich“,
     „Nochmal – zuletzt wackelig“ …), Umfang, Stand und Start-Knopf.
   Ein Start öffnet die Einheit gleich im passenden Modus (uebenWunsch, Lernweg-Kapitel, Fehlerziel).
   Logik in heuteFokus.js; Stand aus dem Protokoll (base2 PROTOKOLL), Fehler aus dem Trainingsstand.
   Auf-/Zu-Zustand je Gerät: localStorage „mm-heute-auf“. Browser: tests/ui/heute-karte.ui.py
   ====================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { PROTOKOLL } from "./base2.jsx";
import { LERN } from "./base3.jsx";
import { Text } from "./func3.jsx";
import { normiere } from "./trainingDaten.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { uebenWunschSetzen } from "./uebenWunsch.js";
import { NACHTBLAU, GOLD_VERLAUF, GOLD_PILLE } from "./kursFarben.js";
import { HeuteMotiv } from "./funcHeuteMotive.jsx";
import {
  FEHLER_ZIEL_SPEICHER, FUNKTIONEN_SPEICHER, GRUENDE, buchtJeEinheit, einheitWahl, erledigtHeute, fehlerFokus, heuteAnteil, tagesSumme, wannText,
} from "./heuteFokus.js";

const AUF_SCHLUESSEL = "mm-heute-auf";
const lies = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const N = NACHTBLAU;

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

/* ---------- Stil (einmal in den <head>, wie die Kurs-Kacheln) ---------- */
const STIL_ID = "hk-stil";
const STIL = `
.hk{position:relative;isolation:isolate;overflow:hidden;margin-top:12px;padding:16px 14px 14px;box-sizing:border-box;border-radius:24px;border:1px solid transparent;
  background:${N.lack} padding-box,${N.rand} border-box;color:#fff;font-family:inherit;
  box-shadow:0 1px 0 ${N.kante} inset,0 22px 44px -18px ${N.schatten},0 2px 6px rgba(8,14,32,0.14)}
.hk::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;
  background:linear-gradient(118deg,${N.glanz} 0%,transparent 42%),radial-gradient(70% 90% at 92% 100%,${N.schein} 0%,transparent 62%)}
.hk-kopf{display:flex;align-items:center;justify-content:space-between;gap:10px}
.hk-titel{margin:0;min-width:0;font-size:clamp(18px,5vw,25px);font-weight:800;letter-spacing:-0.03em;line-height:1.15;color:#fff}
.hk-titel .haupt{white-space:nowrap}
.hk-titel .zeit{font-weight:700;background:${GOLD_VERLAUF};-webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap}
.hk-klasse{flex:none;display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 10px 0 11px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);
  background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.88);font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.hk-klasse:focus-visible,.hk-mehr:focus-visible,.hk-los:focus-visible,.hk-zu:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
.hk-etappen{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:8px;max-width:calc(var(--n) * 200px)}
.hk-etappen > li{min-width:0}
.hk-etappe{width:100%;display:flex;flex-direction:column;align-items:stretch;gap:7px;padding:0;margin:0;border:none;background:none;cursor:pointer;font-family:inherit;color:inherit;text-align:center}
.hk-bild{position:relative;display:block;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.14);
  background:linear-gradient(150deg,rgba(255,255,255,0.11),rgba(255,255,255,0.025)) padding-box;box-shadow:0 1px 0 rgba(255,255,255,0.12) inset;
  transition:transform .18s ease,box-shadow .18s ease}
.hk-bild > .hk-motiv{display:block;width:100%;height:auto;transition:opacity .3s ease}
.hk-etappe[data-zustand="jetzt"] .hk-bild{border:1.5px solid transparent;
  background:linear-gradient(150deg,#16306E,#0B1A40) padding-box,linear-gradient(135deg,#FFF3C4,#F2C14E 40%,#B58612 75%,#FFE9A0) border-box;
  box-shadow:0 0 0 3px rgba(237,187,0,0.13),0 12px 26px -12px rgba(237,187,0,0.6)}
.hk-etappe[data-zustand="fertig"] .hk-bild > .hk-motiv{opacity:.32}
.hk-haken{position:absolute;left:50%;top:46%;width:34%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:999px;background:${GOLD_PILLE};
  display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,0.35),0 1px 0 rgba(255,255,255,0.5) inset}
.hk-haken svg{width:56%;height:auto}
.hk-spur{position:absolute;left:9px;right:9px;bottom:6px;height:3px;border-radius:2px;background:rgba(255,255,255,0.14);overflow:hidden}
.hk-spur i{display:block;height:100%;border-radius:2px;background:${GOLD_VERLAUF};transition:width .5s ease}
.hk-name{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-size:clamp(10.5px,3vw,12px);font-weight:700;letter-spacing:-0.01em;line-height:1.15;color:rgba(255,255,255,0.62);hyphens:auto;-webkit-hyphens:auto}
.hk-etappe[data-zustand="jetzt"] .hk-name{color:#fff}
.hk-etappe[data-zustand="fertig"] .hk-name{color:#F2C14E}
.hk-etappe:focus-visible{outline:none}.hk-etappe:focus-visible .hk-bild{outline:3px solid ${C.flaggold};outline-offset:2px}
@media (hover:hover){.hk-etappe:hover .hk-bild{transform:translateY(-3px);box-shadow:0 14px 26px -14px rgba(0,0,0,0.6)}
  .hk-etappe[data-zustand="jetzt"]:hover .hk-bild{box-shadow:0 0 0 3px rgba(237,187,0,0.18),0 16px 30px -12px rgba(237,187,0,0.7)}}
.hk-etappe:active .hk-bild{transform:scale(.97)}
.hk-fuss{display:flex;align-items:center;gap:8px;margin-top:14px}
.hk-los{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:10px;height:52px;padding:0 18px 0 7px;border:none;border-radius:999px;cursor:pointer;font-family:inherit;text-align:left;
  background:${GOLD_PILLE};color:${N.knopftext};box-shadow:0 12px 26px -12px rgba(237,187,0,0.75),0 1px 0 rgba(255,255,255,0.5) inset;transition:transform .15s ease,box-shadow .15s ease}
@media (hover:hover){.hk-los:hover{transform:translateY(-1px);box-shadow:0 16px 30px -12px rgba(237,187,0,0.85),0 1px 0 rgba(255,255,255,0.5) inset}}
.hk-los:active{transform:scale(.985)}
.hk-play{flex:none;width:38px;height:38px;border-radius:999px;background:${N.knopftext};display:flex;align-items:center;justify-content:center}
.hk-los-text{flex:1 1 auto;min-width:0;font-size:14.5px;font-weight:800;letter-spacing:-0.015em;line-height:1.15;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;hyphens:auto;-webkit-hyphens:auto}
.hk-min{flex:none;font-size:13px;font-weight:700;opacity:.7;white-space:nowrap}
.hk-mehr{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-width:52px;height:52px;padding:0 15px;border-radius:999px;
  border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.07);color:#fff;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer}
.hk-mehr .txt{display:none}
.hk-mehr svg{transition:transform .2s ease}
.hk-mehr[aria-expanded="true"] svg{transform:rotate(180deg)}
.hk-fertig{flex:1 1 auto;min-width:0;margin:0;display:flex;align-items:center;gap:10px;font-size:15.5px;font-weight:800;letter-spacing:-0.01em;color:#F2C14E}
.hk-liste{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:10px;margin-top:14px}
.hk-zu{grid-column:1 / -1;display:flex;align-items:center;justify-content:center;gap:6px;min-height:42px;border-radius:999px;border:1px solid rgba(255,255,255,0.18);
  background:rgba(255,255,255,0.06);color:#fff;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer}
.hk-mini{flex:none;position:relative;width:76px;border-radius:12px;overflow:hidden;background:${N.lack};box-shadow:0 1px 0 rgba(255,255,255,0.12) inset}
.hk-mini > .hk-motiv{display:block;width:100%;height:auto}
.hk-mini[data-fertig] > .hk-motiv{opacity:.32}
.hk-mini .hk-haken{width:38%;top:50%}
@media (min-width:480px){.hk-mehr .txt{display:inline}.hk-los-text{font-size:15.5px}}
@media (min-width:840px){.hk{padding:22px 24px 20px}.hk-etappen{gap:14px;margin-top:18px}.hk-name{font-size:13px}
  .hk-fuss{margin-top:18px}.hk-los{flex:0 1 460px}}
@media (prefers-reduced-motion:reduce){.hk-bild,.hk-los,.hk-mehr svg,.hk-spur i{transition:none}.hk-etappe:hover .hk-bild,.hk-los:hover{transform:none}}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style");
  el.id = STIL_ID;
  el.textContent = STIL;
  document.head.appendChild(el);
}

const TON = {
  neu: { bg: "#E8EFF9", fg: C.see },
  warn: { bg: "#FBEDE5", fg: "#9A4A22" },
  ruhig: { bg: "#EEF1F6", fg: C.grau },
  gold: { bg: "#FFF4CC", fg: "#7A5800" },
  gut: { bg: "#E6F4EC", fg: C.smaragd },
};

/* ---------- Bausteine ---------- */
function HakenZeichen({ farbe = N.knopftext }) {
  return <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.4 6.3l2.4 2.4L9.7 3.6" fill="none" stroke={farbe} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Chevron() {
  return <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
const motivId = (x) => (x.art === "fehler" ? "fehler" : x.id);

/* Kleine Motivkachel für die aufgeklappten Karten */
function MiniMotiv({ x }) {
  return (
    <span className="hk-mini" data-fertig={x.erledigt ? "" : undefined} aria-hidden="true">
      <HeuteMotiv id={motivId(x)} className="hk-motiv" />
      {x.erledigt && <span className="hk-haken"><HakenZeichen /></span>}
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
      style={{ position: "relative", display: "flex", flexDirection: "column", borderRadius: 16, padding: "12px 14px 12px 12px", background: x.erledigt ? "#F7FBF8" : C.weiss, color: C.tinte,
        border: `1.5px solid ${erste && !x.erledigt ? C.flaggold : "transparent"}`, boxShadow: erste && !x.erledigt ? "0 8px 22px rgba(237,187,0,0.22)" : "0 2px 10px rgba(6,16,42,0.25)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <MiniMotiv x={x} />
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

/* ---------- Eine Etappe: große Motivkachel, Kurzwort darunter ---------- */
function Etappe({ x, jetzt, starten }) {
  const zustand = x.erledigt ? "fertig" : jetzt ? "jetzt" : "offen";
  const anteil = x.erledigt ? 1 : Math.max(0, Math.min(1, x.anteil || 0));
  const label = `${x.einheit.titel}, ${x.einheit.aufgaben} ${x.einheit.aufgaben === 1 ? "Aufgabe" : "Aufgaben"}, etwa ${x.einheit.min} Minuten${x.erledigt ? " – heute geschafft" : ""}`;
  return (
    <li>
      <button type="button" className="hk-etappe" data-heute-etappe={x.key} data-zustand={zustand} onClick={() => starten(x)} aria-label={label} title={x.einheit.titel}>
        <span className="hk-bild">
          <HeuteMotiv id={motivId(x)} className="hk-motiv" />
          {x.erledigt && <span className="hk-haken"><HakenZeichen /></span>}
          <span className="hk-spur" aria-hidden="true"><i style={{ width: `${Math.round(anteil * 100)}%` }} /></span>
        </span>
        <span className="hk-name">{x.einheit.kurz}</span>
      </button>
    </li>
  );
}

/* Kopfzeile: Umfang als Ansage, ohne Zahlensalat */
function kopfText(eintraege) {
  const summe = tagesSumme(eintraege);
  const offen = eintraege.filter((x) => !x.erledigt);
  const runden = (n) => `${n} ${n === 1 ? "Runde" : "Runden"}`;
  if (!offen.length) return { haupt: "Für heute geschafft", zeit: null, summe };
  if (offen.length === eintraege.length) return { haupt: runden(summe.anzahl), zeit: `${summe.min} Min`, summe };
  const rest = offen.reduce((s, x) => s + Math.max(1, Math.round(x.einheit.min * (1 - (x.anteil || 0)))), 0);
  return { haupt: `Noch ${runden(offen.length)}`, zeit: `${rest} Min`, summe };
}

/* ---------- Die Karte ---------- */
export function HeuteKarte({ o, empfehlungen, gehe, neu }) {
  const lern = useLernstand();
  const [auf, setAufRoh] = useState(() => lies(AUF_SCHLUESSEL) === "1");
  const setAuf = (v) => { setAufRoh(v); try { localStorage.setItem(AUF_SCHLUESSEL, v ? "1" : "0"); } catch { /* privat */ } };
  const jetzt = Date.now();
  const kapitel = lies(FUNKTIONEN_SPEICHER);
  const T = normiere(lern.training);
  React.useInsertionEffect(stilSetzen, []);

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

  const kopf = kopfText(eintraege);
  const erstesOffen = eintraege.findIndex((x) => !x.erledigt);
  const naechste = erstesOffen >= 0 ? eintraege[erstesOffen] : null;

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
    <section className="hk auftauchen" data-heute-karte data-offen={auf ? "1" : "0"} aria-label="Dein Training für heute">
      <div className="hk-kopf">
        <h3 className="hk-titel">
          <span className="haupt">{kopf.haupt}</span>{kopf.zeit && <span className="zeit"> · {kopf.zeit}</span>}
        </h3>
        <button type="button" className="hk-klasse" onClick={neu} aria-label={o.klasse ? `Klasse ${o.klasse} – Klasse und Thema ändern` : "Klasse und Thema ändern"}>
          {o.klasse ? `Kl. ${o.klasse}` : "Ändern"}
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M8.2 1.8l2 2L4.4 9.6l-2.7.7.7-2.7z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <ol className="hk-etappen" style={{ "--n": eintraege.length }} aria-label="Deine Runden heute">
        {eintraege.map((x, i) => <Etappe key={x.key} x={x} jetzt={i === erstesOffen} starten={starten} />)}
      </ol>

      <div className="hk-fuss">
        {naechste ? (
          <button type="button" className="hk-los" onClick={() => starten(naechste)} data-heute-los
            aria-label={`${naechste.anteil > 0 ? "Weiter" : "Los"}: ${naechste.einheit.titel}, etwa ${naechste.einheit.min} Minuten`}>
            <span className="hk-play" aria-hidden="true"><svg width="14" height="16" viewBox="0 0 14 16"><path d="M3 2 L12.5 8 L3 14 Z" fill={C.flaggold} /></svg></span>
            <span className="hk-los-text">{naechste.einheit.titel.replace(/\s*\(.*\)\s*/, "")}</span>
            <span className="hk-min">{naechste.einheit.min} Min</span>
          </button>
        ) : (
          <p className="hk-fertig">
            <span className="hk-haken" style={{ position: "static", transform: "none", width: 34, flex: "none" }}><HakenZeichen /></span>
            Stark. Morgen geht’s weiter.
          </p>
        )}
        <button type="button" className="hk-mehr" onClick={() => setAuf(!auf)} aria-expanded={auf ? "true" : "false"} aria-controls="heute-liste" aria-label="Aufgaben im Detail" data-heute-vorschau>
          <span className="txt">Details</span><Chevron />
        </button>
      </div>

      {auf && (
        <div id="heute-liste" className="hk-liste auftauchen">
          {eintraege.map((x, i) => <EinheitKarte key={x.key} x={x} erste={i === erstesOffen} starten={starten} />)}
          <button type="button" className="hk-zu" onClick={() => setAuf(false)} aria-expanded="true" aria-controls="heute-liste">
            Zuklappen
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 7.5L6 4l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </section>
  );
}
