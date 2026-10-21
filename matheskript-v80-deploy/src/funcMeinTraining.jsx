/* ============================================================
   Mein Mathe-Training – die eine Trainingsseite des eingeloggten Schülers (/mein-mathe-training).
   Aufbau: Mathilda-Zeile → Fehler-Karte (Video) → Heute (Tagesplan) → Meine Themen (3 aktiv, 3 danach,
   Thema hinzufügen, Klassenarbeiten) → Als Nächstes (Vorschläge) → Woche → Stand.
   Die Logik steckt in meinTraining.js (rein, getestet); Skills/Wiederholungen in ebbinghaus.js; Aufgaben
   in trainingDaten.js; Aufträge von Coach/Lehrkraft in trainingAuftraege.js (supabase/training.sql).
   Gespeichert wird im Lernstand (training.meinTraining) – mit Konto auf allen Geräten.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { VIDEOKURSE } from "./base5.jsx";
import { lernAendern } from "./func6.jsx";
import { mtAendern, useMT } from "./meinTrainingSpeicher.js";
import { Aufgabenlauf, ebbBuchen } from "./funcTraining.jsx";
import { Klassenarbeiten, useEbb, useJetzt } from "./funcEbbinghaus.jsx";
import { ExternSchutz } from "./funcExtern.jsx";
import { MathildaIcon } from "./funcMathildaSeite.jsx";
import { testkontoStarten, useKonto } from "./konto.js";
import { klasseErmitteln } from "./hauptmenue.js";
import { GrosserKnopf, Rueck, karte, kicker } from "./ui2.jsx";
import { springe } from "./sprung.js";
import { SCHULARTEN, SCHULART_STANDARD, kapitelFuer, klassenBoxen, roemisch } from "./schulbuch.js";
import { unterthemen } from "./unterthemen.js";
import { WERKZEUGE } from "./werkzeuge.js";
import { neueAufgabe, normiere, wiederkehrende } from "./trainingDaten.js";
import { ERGEBNIS_TEXT, addTage, arbeitNeu, bucheErgebnis, datumVon, letzterGeneratorVon, normiereEbb, tageZwischen, waehleGenerator, wochenDaten } from "./ebbinghaus.js";
import {
  BUDGET, MAX_AKTIV, MAX_DANACH, STUFEN, THEMA_STATUS, TYPEN, budgetSetzen, eintragErledigt, fehlerKarte, freigabeSetzen, mathildaRueckkehr, nachBuch, standUebersicht,
  tagInfo, tagesStand, tagesplanNeu, tagesplanSichern, testThemen, themaAbschliessen, themaEntfernen, themaHinzufuegen, themaInfo, themaStand, themaVorziehen, vorschlaege,
} from "./meinTraining.js";
import { auftragErledigt, lehrerFreigabe, lehrerFreigeben, meineAuftraege } from "./trainingAuftraege.js";
import { eintragStarten, useTagesplan } from "./funcTagesplan.jsx";

/* Beispiel-Lernstand für den Test-Account (nur, wenn noch nichts geübt wurde) */
export function testdatenEinspielen(jetzt = Date.now()) {
  const heute = datumVon(jetzt);
  lernAendern((L) => {
    L.training = normiere(L.training);
    const E = normiereEbb(L.training.ebbinghaus);
    if (Object.keys(E.skills).length) return;
    const t = (n, h = 12) => jetzt - n * 86400000 + (h - 12) * 3600000;
    let nr = 0;
    const buche = (id, ergebnis, tag, typ = null) => bucheErgebnis(E, [id], { ergebnis, exercise_id: `test${++nr}`, fehler_typ: typ, quelle: "test" }, t(tag));
    buche("gleichungen-umformen", "sicher", 6); buche("gleichungen-umformen", "sicher", 5); buche("gleichungen-umformen", "sicher", 3);
    buche("pq-formel", "sicher", 5); buche("pq-formel", "sicher", 4); buche("pq-formel", "nicht", 2, "vorzeichen"); buche("pq-formel", "sicher", 1);
    buche("scheitelpunkt", "teilweise", 4); buche("scheitelpunkt", "sicher", 3);
    buche("binomische-formeln", "sicher", 6); buche("binomische-formeln", "sicher", 5); buche("binomische-formeln", "sicher", 2);
    buche("pythagoras", "sicher", 3); buche("pythagoras", "sicher", 2);
    buche("bruch-addieren", "nicht", 4, "bruchaddition"); buche("bruch-addieren", "nicht", 3, "bruchaddition"); buche("bruch-addieren", "sicher", 2);
    arbeitNeu(E, { art: "Klassenarbeit", datum: addTage(heute, 10), themen: ["gleichungen", "funktionen"], notiz: "Quadratische Funktionen" }, jetzt);
    L.training.beobachtungen = [
      { typ: "vorzeichen", thema: "gleichungen", zeit: t(5), quelle: "test" }, { typ: "vorzeichen", thema: "gleichungen", zeit: t(3), quelle: "test" }, { typ: "vorzeichen", thema: "gleichungen", zeit: t(2), quelle: "test" },
      { typ: "bruchaddition", thema: "brueche", zeit: t(4), quelle: "test" }, { typ: "bruchaddition", thema: "brueche", zeit: t(3), quelle: "test" },
    ];
    L.training.ebbinghaus = E;
    L.training.meinTraining = testThemen(heute);
  });
}

/* ---------- Bausteine ---------- */
const knopfKlein = { minHeight: 42, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" };
const knopfVoll = { ...knopfKlein, background: C.see, color: C.weiss, borderColor: C.see };
const knopfGold = { ...knopfKlein, background: C.flaggold, color: C.seeTief, borderColor: C.flaggold };
const Abschnitt = ({ kick, titel, children, id }) => (
  <section id={id} style={{ marginTop: 26, scrollMarginTop: 12 }}>
    <p style={kicker}>{kick}</p>
    <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: C.tinte, margin: "2px 0 12px", lineHeight: 1.2 }}>{titel}</h2>
    {children}
  </section>
);
const Pille = ({ farbe, children }) => <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: C.weiss, background: farbe, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
const datumKurz = (d) => `${d.slice(8, 10)}.${d.slice(5, 7)}.`;
const wannText = (d, heute) => { const n = tageZwischen(heute, d); return n === 0 ? "heute" : n === 1 ? "morgen" : n === -1 ? "gestern" : n < 0 ? `vor ${-n} Tagen` : `in ${n} Tagen`; };

function MathildaZeile({ text }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 8 }}>
      <MathildaIcon groesse={44} />
      <div style={{ flex: 1, background: C.weiss, borderRadius: "4px 16px 16px 16px", padding: "10px 14px", boxShadow: "0 2px 12px rgba(15,26,51,0.07)" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.02em", color: C.flaggold, marginBottom: 2 }}>Mathilda</p>
        <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.55 }}>{text}</p>
      </div>
    </div>
  );
}

/* ---------- Fehler-Karte mit Video ---------- */
function FehlerKarte({ karte: k, gehe }) {
  if (!k) return null;
  const lektion = k.video.art === "lektion" && VIDEOKURSE[k.video.kurs] ? VIDEOKURSE[k.video.kurs].lektionen.find((l) => l.id === k.video.lektion) : null;
  return (
    <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.signal}` }}>
      <p style={{ ...kicker, color: C.signal }}>Wiederkehrender Fehler · {k.n}× an {k.tage} Tagen</p>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>Schau dir das Video zu „{k.themaName}“ nochmal an.</p>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 4 }}><b style={{ color: C.tinte }}>{k.name}:</b> {k.kurz} <span style={{ color: C.tinte }}>{k.tipp}</span></p>
      {lektion ? (
        <>
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden", background: C.seeTief, marginTop: 12 }}>
            <ExternSchutz dienst="youtube"><iframe key={lektion.youtube} title={lektion.titel}
              src={`https://www.youtube-nocookie.com/embed/${lektion.youtube}?rel=0&modestbranding=1&playsinline=1`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></ExternSchutz>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" onClick={() => gehe({ ansicht: "kurse", kurs: k.video.kurs })} style={knopfKlein}>Lektion „{lektion.titel}“ im Videokurs ›</button>
            <button type="button" onClick={() => gehe({ ansicht: "fehlertraining" })} style={knopfKlein}>Diesen Fehler üben ›</button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau }}>Platzhalter · eigenes Video folgt</p>
          <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.55, marginTop: 2 }}>Bis unser deutsches Video zu „{k.themaName}“ fertig ist: Videos von Michael Penn (YouTube, Englisch).</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <a href={k.video.url} target="_blank" rel="noopener noreferrer" style={{ ...knopfKlein, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Michael Penn: „{k.video.suche}“ ↗</a>
            <button type="button" onClick={() => gehe({ ansicht: "fehlertraining" })} style={knopfKlein}>Diesen Fehler üben ›</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Aufgaben zu einem Eintrag ---------- */
function aufgabenFuer(e, E) {
  if (e.typ === "wiederholung") {
    const S = E.skills[e.skill_id];
    const fehler = S && (S.last_result === "nicht" || S.last_result === "teilweise") ? S.last_error_type : null;
    const gen = waehleGenerator(e.skill_id, e.schritt || 0, S ? letzterGeneratorVon(S) : null, Math.random, fehler);
    return gen ? [neueAufgabe(gen)] : [];
  }
  if (!e.gen || !e.gen.length) return [];
  const ids = [];
  for (let i = 0; i < Math.max(e.anzahl || 0, 1); i++) ids.push(e.gen[i % e.gen.length]);
  return ids.map((g) => neueAufgabe(g));
}

function Lauf({ eintrag, E, onEnde, zurueck }) {
  const [aufgaben] = useState(() => aufgabenFuer(eintrag, E));
  if (!aufgaben.length) return <Rueck art="warn">Für diesen Eintrag gibt es gerade keine Aufgabe.</Rueck>;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={zurueck} style={{ border: "none", background: "none", padding: "6px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: C.see }}>‹ Zurück zum Tagesplan</button>
        <Pille farbe={TYPEN[eintrag.typ].farbe}>{TYPEN[eintrag.typ].name}</Pille>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.tinte }}>{eintrag.titel}</span>
      </div>
      <Aufgabenlauf aufgaben={aufgaben} quelle="meintraining" endeText="Einheit abschließen" onWeiter={(a, z) => ebbBuchen([a], [z], "meintraining")} onEnde={(zs) => onEnde(zs)} />
    </div>
  );
}

/* ---------- Heute: der Tagesplan ---------- */
function Budget({ MT, onWahl }) {
  const b = MT.budget;
  const an = (art, wert) => b.art === art && b.wert === wert;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }} role="group" aria-label="Tagesbudget">
      <span style={{ fontSize: 12.5, color: C.grau, fontWeight: 600, marginRight: 4 }}>Budget</span>
      {Object.entries(BUDGET).flatMap(([art, d]) => d.werte.map((w) => (
        <button key={art + w} type="button" aria-pressed={an(art, w)} onClick={() => onWahl(art, w)}
          style={{ ...knopfKlein, minHeight: 34, padding: "4px 12px", fontSize: 13, background: an(art, w) ? C.see : C.weiss, color: an(art, w) ? C.weiss : C.see, borderColor: an(art, w) ? C.see : C.linie }}>
          {w} {d.einheit}
        </button>
      )))}
    </div>
  );
}

function Eintrag({ e, k, E, heute, gehe, starten, abhaken }) {
  const hatAufgaben = e.typ === "wiederholung" || Boolean(e.gen && e.gen.length);
  const ziel = e.ziel || (e.wz && WERKZEUGE[e.wz] ? WERKZEUGE[e.wz].ziel : null);
  const er = e.ergebnis ? ERGEBNIS_TEXT[e.ergebnis] : null;
  return (
    <div style={{ padding: "11px 0", borderTop: k ? `1px solid ${C.linie}` : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <button type="button" aria-label={e.erledigt ? `${e.titel} als offen markieren` : `${e.titel} abhaken`} onClick={() => abhaken(e, e.erledigt)}
        style={{ flex: "0 0 26px", height: 26, borderRadius: 999, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          background: e.erledigt ? C.smaragd : "transparent", color: C.weiss, border: e.erledigt ? "none" : `1.5px solid ${C.hellgrau}` }}>{e.erledigt ? "✓" : ""}</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: e.erledigt ? C.grau : C.tinte, lineHeight: 1.3 }}>{e.titel}</p>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {e.nachholenVon && <span style={{ fontSize: 11, fontWeight: 800, color: "#8A6A00", background: "#FFF4D6", padding: "2px 7px", borderRadius: 999 }}>Nachholen · von {datumKurz(e.nachholenVon)}</span>}
            <span style={{ fontSize: 12, fontWeight: 700, color: e.farbe }}>{e.typName}</span>
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.55 }}>{e.absender ? `Von ${e.absender}` : ""}{e.absender && e.zeile ? " · " : ""}{e.zeile}{e.min ? ` · ca. ${e.min} Min.` : ""}</p>
        {e.erledigt ? (
          er && <p style={{ fontSize: 12.5, lineHeight: 1.55 }}><b style={{ color: er.farbe }}>{er.name}.</b> {e.naechster ? <span style={{ color: C.grau }}>Nächste Wiederholung {wannText(e.naechster, heute)}.</span> : null}</p>
        ) : (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {hatAufgaben && <button type="button" onClick={() => starten(e)} style={{ ...knopfVoll, minHeight: 38, padding: "4px 14px", fontSize: 13 }}>Starten</button>}
            {!hatAufgaben && ziel && <button type="button" onClick={() => gehe(ziel)} style={{ ...knopfVoll, minHeight: 38, padding: "4px 14px", fontSize: 13 }}>{e.typ === "blatt" ? "Foto an Mathilda" : "Öffnen"} ›</button>}
            {hatAufgaben && ziel && e.typ !== "wiederholung" && <button type="button" onClick={() => gehe(ziel)} style={{ ...knopfKlein, minHeight: 38, padding: "4px 14px", fontSize: 13 }}>{e.wz && WERKZEUGE[e.wz] ? WERKZEUGE[e.wz].name : "Werkzeug"} ›</button>}
            {!hatAufgaben && <button type="button" onClick={() => abhaken(e, false)} style={{ ...knopfKlein, minHeight: 38, padding: "4px 14px", fontSize: 13, color: C.smaragd }}>Erledigt ✓</button>}
          </div>
        )}
      </div>
    </div>
  );
}

function Heute({ MT, E, T, geladen, gehe, auftraege, planAendern }) {
  const jetzt = useJetzt();
  const heute = datumVon(jetzt);
  const [laeuft, setLaeuft] = useState(null);
  const [ergebnis, setErgebnis] = useState(null);
  const anker = useRef(null);
  const fremd = useMemo(() => auftraege.map((a) => ({ id: a.id, titel: a.titel, zeile: a.zeile, ziel: a.ziel, absender: a.absender, erledigt: !!a.erledigt })), [auftraege]);
  /* DER Tagesplan (tagesplan.js): anlegen, Aufträge ergänzen, anreichern – derselbe wie auf der Heute-Karte der Startseite */
  const stand = useTagesplan({ fremd });
  const fk = useMemo(() => { const wk = wiederkehrende(normiere(T || {}))[0]; return wk ? fehlerKarte(wk) : null; }, [T]);
  const planHeute = MT.tage[heute];
  const text = mathildaRueckkehr({ verpasst: stand.verpasst, neustart: stand.neustart, nachgeholt: stand.nachgeholt, offen: stand.gesamt - stand.erledigt, fertig: stand.fertig, minuten: stand.minutenRest, erster: !MT.aktiv.length && !planHeute });
  const anteil = stand.gesamt ? (stand.erledigt / stand.gesamt) * 100 : 0;
  const starten = (e) => {
    if (!(e.typ === "wiederholung" || (e.gen && e.gen.length))) { eintragStarten(e, gehe); return; }
    setErgebnis(null); setLaeuft({ key: Date.now(), e }); springe("meintraining", () => anker.current && anker.current.scrollIntoView({ block: "start" }));
  };
  const abhaken = (e, zurueck) => {
    mtAendern((M) => eintragErledigt(M, e, { jetzt: Date.now(), zurueck }));
    if (e.typ === "fremd" && e.auftrag) { auftragErledigt(e.auftrag, zurueck).then(planAendern).catch(() => {}); }
  };
  const ende = (zs) => {
    const e = laeuft.e;
    mtAendern((M) => eintragErledigt(M, e, { jetzt: Date.now(), richtig: zs.filter((z) => z.ok === true).length, n: zs.length }));
    setLaeuft(null); setErgebnis({ e, zs });
    springe("meintraining", () => anker.current && anker.current.scrollIntoView({ block: "start" }));
  };

  if (!geladen) return <div style={karte}><p style={{ fontSize: 14, color: C.grau }}>Dein Lernstand wird geladen …</p></div>;
  return (
    <div ref={anker} style={{ scrollMarginTop: 12 }}>
      <MathildaZeile text={text} />
      {!laeuft && <FehlerKarte karte={fk} gehe={gehe} />}
      {laeuft ? (
        <div style={{ ...karte, marginTop: 14 }}><Lauf key={laeuft.key} eintrag={laeuft.e} E={E} onEnde={ende} zurueck={() => setLaeuft(null)} /></div>
      ) : (
        <div style={{ ...karte, marginTop: 14 }}>
          {ergebnis && (
            <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
              <p style={{ fontSize: 12.5, opacity: 0.85 }}>Einheit geschafft · {ergebnis.e.titel}</p>
              <p style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{ergebnis.zs.filter((z) => z.ok === true).length} von {ergebnis.zs.length} richtig{ergebnis.zs.every((z) => z.ok === true && !(z.hilfeEnde || 0)) ? " – ganz ohne Hilfe." : "."}</p>
              <p style={{ fontSize: 13.5, fontWeight: 300, marginTop: 6, opacity: 0.92 }}>Was du selbstständig gelöst hast, kommt nach Ebbinghaus wieder dran – im richtigen Moment, nicht irgendwann.</p>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
            <p style={kicker}>Dein Tagesplan · {datumKurz(heute)}{stand.neustart ? " · Neustart" : ""}</p>
            <Budget MT={MT} onWahl={(art, wert) => mtAendern((M, X, Tr) => { if (budgetSetzen(M, art, wert)) tagesplanNeu(M, X, Tr, { jetzt: Date.now(), fremd }); })} />
          </div>
          {stand.gesamt === 0 ? (
            <Rueck art={MT.aktiv.length ? "gut" : "info"}>{MT.aktiv.length ? "Heute ist nichts fällig." : "Noch kein Thema. Wähl unten eins – ab dann steht hier jeden Tag dein Plan."}</Rueck>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                <div style={{ flex: "1 1 120px", background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color: stand.fertig ? C.smaragd : C.see, lineHeight: 1.1 }}>{stand.erledigt}<span style={{ fontSize: 16, color: C.grau, fontWeight: 700 }}> / {stand.gesamt}</span></p>
                  <p style={{ fontSize: 12.5, color: C.grau }}>heute erledigt</p>
                </div>
                <div style={{ flex: "1 1 120px", background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color: C.tinte, lineHeight: 1.1 }}>{stand.minutenRest ? `ca. ${stand.minutenRest}` : "–"}<span style={{ fontSize: 14, fontWeight: 700 }}>{stand.minutenRest ? " Min." : ""}</span></p>
                  <p style={{ fontSize: 12.5, color: C.grau }}>noch zu tun</p>
                </div>
              </div>
              <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(anteil)} aria-label="Fortschritt des Tagesplans" style={{ height: 8, borderRadius: 999, background: C.linie, overflow: "hidden", marginTop: 12 }}>
                <div style={{ width: `${anteil}%`, height: "100%", background: C.smaragd, borderRadius: 999, transition: "width .3s ease" }} />
              </div>
              <div style={{ marginTop: 6 }}>
                {stand.eintraege.map((e, k) => <Eintrag key={e.id} e={e} k={k} E={E} heute={heute} gehe={gehe} starten={starten} abhaken={abhaken} />)}
              </div>
              {stand.fertig ? <Rueck art="gut">Tagesplan geschafft. Mehr ist heute nicht nötig.</Rueck>
                : (() => { const n = stand.eintraege.find((e) => !e.erledigt && (e.typ === "wiederholung" || (e.gen && e.gen.length))); return n ? <GrosserKnopf gold onClick={() => starten(n)}>{stand.erledigt ? "Weiter: " : "Starten: "}{n.titel}</GrosserKnopf> : null; })()}
              {stand.offenNachholen > 0 && <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>Auf dem Nachhol-Stapel: {stand.offenNachholen}. Mehr als die Hälfte des Tages wird nie nachgeholt – der Rest kommt an den nächsten Tagen.</p>}
            </>
          )}
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.65, marginTop: 12 }}>In den Tag kommen: Aufträge · fällige Wiederholungen · Fehler üben · Nachholen · ein Schritt je Thema · aufs Blatt · Warm-up bei Platz. Reihenfolge: Warm-up → Aufträge → Wiederholen → Fehler → Thema → aufs Blatt. Der Plan wird einmal am Tag gebaut und nur ergänzt – derselbe wie auf der Startseite.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Meine Themen ---------- */
function ThemaKarte({ t, E, heute, wo, aktion }) {
  const info = themaInfo(t.id);
  const s = themaStand(E, t.id, { teile: t.teile, heute });
  const st = THEMA_STATUS[s.status];
  const [frage, setFrage] = useState(null);
  return (
    <div style={{ ...karte, padding: "14px 16px", borderTop: `3px solid ${wo === "aktiv" ? st.farbe : C.linie}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{info.titel}</p>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>{info.art === "unterthema" ? `${info.kapitelTitel} · Unterthema ${info.nr} von ${info.anzahl}` : `${t.teile.length === info.teile.length ? "Ganzes Kapitel" : `${t.teile.length} von ${info.teile.length} Unterthemen`}`}{t.vorbereitung.length ? ` · ${t.vorbereitung.length} Basis-Check${t.vorbereitung.length > 1 ? "s" : ""} offen` : ""}</p>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: st.farbe, whiteSpace: "nowrap" }}>{t.auto ? "Vorschlag aus deiner Klasse" : wo === "aktiv" ? st.name : "Wartet"}</span>
      </div>
      {wo === "aktiv" && !s.ohneAufgaben && (
        <>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 999, background: C.linie, overflow: "hidden" }}><div style={{ width: `${s.prozent}%`, height: "100%", background: s.sicher ? C.smaragd : C.see }} /></div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: C.tinte, minWidth: 38, textAlign: "right" }}>{s.prozent} %</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 4, marginTop: 8 }}>
            {STUFEN.map((x) => { const an = s.stufe && s.stufe.id === x.id; const vorbei = s.stufe && STUFEN.indexOf(s.stufe) > STUFEN.indexOf(x); return (
              <span key={x.id} title={x.zeile} style={{ fontSize: 10.5, fontWeight: 800, textAlign: "center", padding: "4px 2px", borderRadius: 8, letterSpacing: "0.03em",
                background: an ? C.see : vorbei ? C.himmel : C.sand, color: an ? C.weiss : vorbei ? C.see : C.hellgrau }}>{x.name}</span>); })}
          </div>
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 6 }}>
            {s.gelernt} von {s.skills} Skills gelernt, {s.sicherSkills} sicher{s.letzte ? ` · zuletzt ${wannText(s.letzte, heute)}` : ""}{s.naechste ? (s.naechste < heute ? ` · Wiederholung überfällig seit ${-tageZwischen(heute, s.naechste)} ${-tageZwischen(heute, s.naechste) === 1 ? "Tag" : "Tagen"}` : ` · nächste Wiederholung ${wannText(s.naechste, heute)}`) : ""}
          </p>
        </>
      )}
      {wo === "aktiv" && s.ohneAufgaben && <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>Zu diesem Thema gibt es noch keine Aufgaben mit automatischer Rückmeldung – du übst mit den Werkzeugen und hakst selbst ab.</p>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {wo === "aktiv" && s.sicher && <button type="button" onClick={() => aktion("abschliessen", t)} style={{ ...knopfGold, minHeight: 36, padding: "4px 12px", fontSize: 13 }}>Thema abschließen ✓</button>}
        {wo === "aktiv" && !s.sicher && (s.gelernt > 0 || s.ohneAufgaben) && !frage && <button type="button" onClick={() => setFrage("abschliessen")} style={{ ...knopfKlein, minHeight: 36, padding: "4px 12px", fontSize: 13 }}>Als sicher abschließen</button>}
        {wo === "danach" && <button type="button" onClick={() => aktion("vorziehen", t)} style={{ ...knopfKlein, minHeight: 36, padding: "4px 12px", fontSize: 13 }}>Jetzt trainieren</button>}
        {info.wz && WERKZEUGE[info.wz] && <button type="button" onClick={() => aktion("werkzeug", t)} style={{ ...knopfKlein, minHeight: 36, padding: "4px 12px", fontSize: 13 }}>{WERKZEUGE[info.wz].name} ›</button>}
        {!frage && <button type="button" onClick={() => setFrage("entfernen")} style={{ ...knopfKlein, minHeight: 36, padding: "4px 12px", fontSize: 13, color: C.grau }}>Entfernen</button>}
      </div>
      {frage && (
        <p style={{ fontSize: 13, color: C.tinte, marginTop: 8, lineHeight: 1.6 }}>
          {frage === "entfernen" ? "Thema aus dem Training nehmen? Gelernte Skills bleiben in deinen Wiederholungen." : "Noch nicht alle Skills sind sicher. Trotzdem abschließen?"}{" "}
          <button type="button" onClick={() => { aktion(frage, t); setFrage(null); }} style={{ ...knopfKlein, minHeight: 32, padding: "2px 10px", fontSize: 12.5, color: frage === "entfernen" ? C.signal : C.smaragd }}>Ja</button>{" "}
          <button type="button" onClick={() => setFrage(null)} style={{ ...knopfKlein, minHeight: 32, padding: "2px 10px", fontSize: 12.5 }}>Abbrechen</button>
        </p>
      )}
    </div>
  );
}

/* Thema hinzufügen: Schulsystem → Klasse → Kapitel (aufklappbar) → ganzes Kapitel oder Unterthemen */
function ThemaWahl({ MT, start, hinzufuegen, zu }) {
  const [schulart, setSchulart] = useState(start.schulart || SCHULART_STANDARD);
  const [klasse, setKlasse] = useState(start.box || null);
  const [offen, setOffen] = useState(null);
  const [gewaehlt, setGewaehlt] = useState([]);
  const [meldung, setMeldung] = useState("");
  const boxen = klassenBoxen(schulart);
  const kapitel = klasse ? kapitelFuer(schulart, klasse) : [];
  const voll = MT.aktiv.length >= MAX_AKTIV && MT.danach.length >= MAX_DANACH;
  const dabei = (id) => [...MT.aktiv, ...MT.danach].some((t) => themaInfo(t.id).kapitel === id);
  const senden = (id, teile) => {
    const r = hinzufuegen({ id, teile, schulart, klasse });
    setMeldung(r.ok ? `„${themaInfo(id).titel}“ ist jetzt ${r.wo === "aktiv" ? "in Arbeit" : "in der Warteschlange"}.` : r.grund === "schon" ? "Dieses Kapitel ist schon in deinem Training." : r.grund === "voll" ? "Alle Plätze sind belegt – schließ zuerst ein Thema ab." : "Das hat nicht geklappt.");
    if (r.ok) { setOffen(null); setGewaehlt([]); }
  };
  return (
    <div style={{ ...karte, marginTop: 10 }}>
      <p style={kicker}>Thema hinzufügen</p>
      {voll ? <Rueck art="info">Drei Themen in Arbeit und drei in der Warteschlange – mehr geht nicht. Schließ erst eines ab.</Rueck> : (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SCHULARTEN.map((s) => (
              <button key={s.id} type="button" aria-pressed={schulart === s.id} onClick={() => { setSchulart(s.id); setKlasse(klassenBoxen(s.id).some((b) => b.id === klasse) ? klasse : null); setOffen(null); }} title={s.zeile}
                style={{ ...knopfKlein, minHeight: 36, padding: "4px 12px", fontSize: 13, background: schulart === s.id ? C.see : C.weiss, color: schulart === s.id ? C.weiss : C.see, borderColor: schulart === s.id ? C.see : C.linie }}>{s.name}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {boxen.map((b) => (
              <button key={b.id} type="button" aria-pressed={klasse === b.id} onClick={() => { setKlasse(b.id); setOffen(null); }}
                style={{ ...knopfKlein, minHeight: 36, padding: "4px 12px", fontSize: 13, background: klasse === b.id ? C.see : b.gold ? "linear-gradient(180deg, #F5CB2E 0%, #EDBB00 100%)" : C.weiss, color: klasse === b.id ? C.weiss : C.seeTief, borderColor: klasse === b.id ? C.see : "transparent" }}>Kl. {b.label}</button>
            ))}
          </div>
          {klasse && (
            <div style={{ marginTop: 10 }}>
              {kapitel.map((k) => {
                const auf = offen === k.id;
                const schon = dabei(k.id);
                return (
                  <div key={k.id} style={{ borderTop: `1px solid ${C.linie}`, padding: "6px 0" }}>
                    <button type="button" aria-expanded={auf} onClick={() => { setOffen(auf ? null : k.id); setGewaehlt([]); }}
                      style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", textAlign: "left", background: "none", border: "none", padding: "6px 0", cursor: "pointer", fontFamily: "inherit" }}>
                      <span style={{ flex: "0 0 30px", fontSize: 12, fontWeight: 800, color: C.hellgrau }}>{roemisch(k.nr)}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: schon ? C.grau : C.tinte }}>{k.titel}{schon ? " · schon dabei" : ""}</span>
                        <span style={{ display: "block", fontSize: 12, color: C.grau }}>{k.zeile}</span>
                      </span>
                      <span aria-hidden="true" style={{ color: C.see, fontSize: 16, transform: auf ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</span>
                    </button>
                    {auf && !schon && (
                      <div style={{ padding: "4px 0 8px 40px" }}>
                        {unterthemen(k.id).map((u) => {
                          const an = gewaehlt.includes(u.id);
                          return (
                            <label key={u.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0", fontSize: 13.5, color: C.tinte, cursor: "pointer" }}>
                              <input type="checkbox" checked={an} onChange={() => setGewaehlt(an ? gewaehlt.filter((x) => x !== u.id) : [...gewaehlt, u.id])} style={{ accentColor: C.see, width: 18, height: 18 }} />
                              <span style={{ flex: 1 }}>{u.titel}{!u.gen.length ? <span style={{ color: C.hellgrau, fontSize: 12 }}> · nur Werkzeug</span> : null}</span>
                            </label>
                          );
                        })}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                          <button type="button" onClick={() => senden(k.id, null)} style={{ ...knopfVoll, minHeight: 36, padding: "4px 14px", fontSize: 13 }}>Ganzes Kapitel ins Training</button>
                          {gewaehlt.length > 0 && <button type="button" onClick={() => senden(gewaehlt.length === 1 ? gewaehlt[0] : k.id, gewaehlt.length === 1 ? null : gewaehlt)} style={{ ...knopfGold, minHeight: 36, padding: "4px 14px", fontSize: 13 }}>{gewaehlt.length === 1 ? "Nur dieses Unterthema" : `${gewaehlt.length} Unterthemen`} ins Training</button>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      {meldung && <p role="status" style={{ fontSize: 13.5, color: C.smaragd, fontWeight: 600, marginTop: 8 }}>{meldung} <button type="button" onClick={zu} style={{ ...knopfKlein, minHeight: 30, padding: "2px 10px", fontSize: 12.5 }}>Zum Tagesplan</button></p>}
    </div>
  );
}

/* ---------- Woche ---------- */
const WT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WT_LANG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
function Woche({ MT, E }) {
  const jetzt = useJetzt();
  const heute = datumVon(jetzt);
  const [woche, setWoche] = useState(0);
  const [gewaehlt, setGewaehlt] = useState(null);
  const w = useMemo(() => wochenDaten(E, { jetzt, woche }), [E, jetzt, woche]);
  const auswahl = w.tage.find((t) => t.datum === gewaehlt) || w.tage.find((t) => t.datum === heute) || w.tage[0];
  const idx = w.tage.indexOf(auswahl);
  const info = (d) => tagInfo(MT, d);
  const plan = MT.tage[auswahl.datum];
  const pfeil = { ...knopfKlein, minWidth: 44, padding: "6px 12px", fontSize: 16, lineHeight: 1 };
  return (
    <div style={karte}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <button type="button" aria-label="Vorige Woche" disabled={woche <= -8} onClick={() => { setWoche(woche - 1); setGewaehlt(null); }} style={{ ...pfeil, opacity: woche <= -8 ? 0.4 : 1 }}>‹</button>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte }}>{woche === 0 ? "Diese Woche" : woche === -1 ? "Letzte Woche" : woche === 1 ? "Nächste Woche" : woche < 0 ? `Vor ${-woche} Wochen` : `In ${woche} Wochen`}</p>
          <p style={{ fontSize: 12, color: C.grau }}>{datumKurz(w.start)} – {datumKurz(w.ende)}{w.ende.slice(0, 4)}</p>
        </div>
        <button type="button" aria-label="Nächste Woche" disabled={woche >= 8} onClick={() => { setWoche(woche + 1); setGewaehlt(null); }} style={{ ...pfeil, opacity: woche >= 8 ? 0.4 : 1 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }} role="group" aria-label="Tage der Woche">
        {w.tage.map((t, i) => {
          const an = t === auswahl, istHeute = t.zeit === "heute", arb = t.arbeiten.length > 0, ti = info(t.datum);
          const fertig = ti && ti.geplant > 0 && ti.erledigt === ti.geplant;
          const verpasst = ti && ti.verpasst && t.zeit === "vergangen";
          return (
            <button key={t.datum} type="button" aria-pressed={an} onClick={() => setGewaehlt(t.datum)}
              aria-label={`${WT_LANG[i]} ${datumKurz(t.datum)}${ti ? `, Plan ${ti.erledigt} von ${ti.geplant}` : ""}${arb ? `, ${t.arbeiten[0].art}` : ""}`}
              style={{ minHeight: 78, padding: "6px 2px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                border: `1.5px solid ${an ? C.see : istHeute ? C.flaggold : C.linie}`, background: an ? C.see : verpasst ? "#F1F3F7" : C.weiss, color: an ? C.weiss : verpasst ? C.hellgrau : C.tinte }}>
              <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>{WT[i]}</span>
              <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{Number(t.datum.slice(8, 10))}</span>
              <span style={{ minHeight: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                {arb && <span aria-hidden="true" style={{ fontSize: 10, fontWeight: 800, padding: "1px 5px", borderRadius: 999, background: an ? C.flaggold : C.signal, color: an ? C.seeTief : C.weiss }}>Arbeit</span>}
                {!arb && ti && <span aria-hidden="true" style={{ fontSize: 10.5, fontWeight: 800, color: an ? C.weiss : fertig ? C.smaragd : verpasst ? C.hellgrau : C.grau }}>{fertig ? "✓ " : ""}{ti.erledigt}/{ti.geplant}</span>}
                {!arb && !ti && t.zeit !== "zukunft" && t.geuebt.length > 0 && <span aria-hidden="true" style={{ fontSize: 10.5, fontWeight: 800, color: an ? C.weiss : C.smaragd }}>✓ {t.geuebt.length}</span>}
                {t.zeit === "zukunft" && t.faellig.length > 0 && !arb && <span aria-hidden="true" style={{ fontSize: 10.5, fontWeight: 800, color: an ? C.weiss : C.see }}>{t.faellig.length} ↺</span>}
                {ti && ti.nachgeholt > 0 && <span aria-hidden="true" style={{ fontSize: 9.5, fontWeight: 800, color: an ? C.flaggold : "#8A6A00" }}>nachgeholt</span>}
              </span>
            </button>
          );
        })}
      </div>
      {woche !== 0 && <button type="button" onClick={() => { setWoche(0); setGewaehlt(heute); }} style={{ ...knopfKlein, minHeight: 40, padding: "4px 14px", fontSize: 13, marginTop: 8 }}>Zurück zu heute</button>}
      <div aria-live="polite" style={{ marginTop: 14, background: C.sand, borderRadius: 12, padding: "12px 14px" }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: C.tinte }}>{WT_LANG[idx]}, {datumKurz(auswahl.datum)}{auswahl.datum.slice(0, 4)}{auswahl.zeit === "heute" ? " · heute" : ""}</p>
        {auswahl.arbeiten.map((a) => (
          <div key={a.id} style={{ marginTop: 8, borderLeft: `3px solid ${C.signal}`, padding: "2px 0 2px 10px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.signal }}>{a.art}</p>
            {(a.themen.length > 0 || a.notiz) && <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55 }}>{[...a.themen, a.notiz].filter(Boolean).join(" · ")}</p>}
          </div>
        ))}
        {plan && plan.eintraege.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau }}>Tagesplan: {Object.keys(plan.erledigt).length} von {plan.eintraege.length} erledigt{plan.neustart ? " · Neustart-Check" : ""}</p>
            {plan.eintraege.map((e) => (
              <p key={e.id} style={{ fontSize: 13.5, lineHeight: 1.7, color: plan.erledigt[e.id] ? C.tinte : C.grau }}>
                <span aria-hidden="true" style={{ display: "inline-block", width: 18, fontWeight: 800, color: plan.erledigt[e.id] ? C.smaragd : C.hellgrau }}>{plan.erledigt[e.id] ? "✓" : "○"}</span>
                {e.titel} <span style={{ fontSize: 12, color: TYPEN[e.typ].farbe, fontWeight: 600 }}>· {TYPEN[e.typ].name}{e.nachholenVon ? ` (nachgeholt von ${datumKurz(e.nachholenVon)})` : ""}</span>
              </p>
            ))}
          </div>
        )}
        {auswahl.geuebt.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau }}>Geübte Skills</p>
            {auswahl.geuebt.map((g) => <p key={g.skill_id} style={{ fontSize: 13.5, lineHeight: 1.7, color: C.tinte }}><span aria-hidden="true" style={{ display: "inline-block", width: 18, fontWeight: 800, color: ERGEBNIS_TEXT[g.ergebnis].farbe }}>{g.ergebnis === "sicher" ? "✓" : g.ergebnis === "teilweise" ? "◐" : "↻"}</span>{g.name}</p>)}
          </div>
        )}
        {auswahl.faellig.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau }}>Wiederholungen geplant</p>
            {auswahl.faellig.map((f) => <p key={f.skill_id} style={{ fontSize: 13.5, lineHeight: 1.7, color: C.tinte }}><span aria-hidden="true" style={{ display: "inline-block", width: 18, color: C.see, fontWeight: 800 }}>↺</span>{f.name}</p>)}
          </div>
        )}
        {!auswahl.arbeiten.length && !plan && !auswahl.geuebt.length && !auswahl.faellig.length && (
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 6 }}>{auswahl.zeit === "vergangen" ? "An diesem Tag gab es keinen Plan." : auswahl.zeit === "heute" ? "Noch nichts geübt." : "Der Tagesplan entsteht am Tag selbst aus deinem Stand."}</p>
        )}
      </div>
      <p style={{ fontSize: 12, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>✓ erledigt · ○ offen · ↺ Wiederholung geplant · grau = Tag ohne Erledigtes</p>
    </div>
  );
}

/* ---------- Stand ---------- */
function Stand({ MT, E, gehe, freigabe, setFreigabe }) {
  const jetzt = useJetzt();
  const u = useMemo(() => standUebersicht(MT, E, { jetzt }), [MT, E, jetzt]);
  const kachel = (zahl, text, farbe) => (
    <div style={{ flex: "1 1 120px", background: C.sand, borderRadius: 12, padding: "10px 14px" }}>
      <p style={{ fontSize: 26, fontWeight: 800, color: farbe || C.tinte, lineHeight: 1.15 }}>{zahl}</p>
      <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.4 }}>{text}</p>
    </div>
  );
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {kachel(u.gelernt, u.gelernt === 1 ? "Skill gelernt" : "Skills gelernt", C.see)}
        {kachel(u.aktiveTage, "aktive Tage (letzte 30)", u.aktiveTage ? C.smaragd : C.tinte)}
        {kachel(u.fertig, u.fertig === 1 ? "Thema abgeschlossen" : "Themen abgeschlossen")}
        {kachel(`${u.sicher}/${u.aktiv}`, "aktive Themen sicher")}
      </div>
      <div style={{ ...karte, marginTop: 14 }}>
        <p style={kicker}>Einstellungen</p>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
          <input type="checkbox" checked={freigabe} onChange={(e) => setFreigabe(e.target.checked)} style={{ accentColor: C.see, width: 20, height: 20, marginTop: 2 }} />
          <span style={{ fontSize: 14, color: C.tinte, lineHeight: 1.55 }}>Meine Lehrkraft darf Einträge in meinen Tagesplan legen.<br /><span style={{ fontSize: 12.5, color: C.grau }}>Dein Coach (Nachhilfe) darf das immer. Aufträge stehen oben im Plan und verfallen nicht.</span></span>
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          <button type="button" onClick={() => gehe({ ansicht: "lernpfad" })} style={knopfKlein}>Standortcheck ›</button>
          <button type="button" onClick={() => gehe({ ansicht: "ebbinghaus" })} style={knopfKlein}>Wie der Rhythmus funktioniert ›</button>
          <button type="button" onClick={() => gehe({ ansicht: "pruefung" })} style={knopfKlein}>Prüfungsmodus ›</button>
          <button type="button" onClick={() => gehe({ ansicht: "klausurnach" })} style={knopfKlein}>Klassenarbeit nachbereiten ›</button>
        </div>
      </div>
    </>
  );
}

/* ---------- Erinnerung (.ics) ---------- */
const ZEIT_SCHLUESSEL = "mm-erinnerung-zeit";
function icsBauen(zeit) {
  const [h, m] = zeit.split(":");
  const p = (n) => String(n).padStart(2, "0");
  const d = new Date();
  const start = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(h)}${p(m)}00`;
  const link = typeof window !== "undefined" ? `${window.location.origin}/mein-mathe-training` : "";
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mythos Mathe//Mein Mathe-Training//DE", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:mein-mathe-training-${Date.now()}@mythosmathe.de`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${start}`, "DURATION:PT15M", "RRULE:FREQ=DAILY", "SUMMARY:Mein Mathe-Training – Mythos Mathe",
    `DESCRIPTION:Dein Tagesplan wartet. Wenige Minuten reichen.\\n${link}`, `URL:${link}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Mein Mathe-Training", "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
function Erinnerung() {
  const [zeit, setZeit] = useState(() => { try { return localStorage.getItem(ZEIT_SCHLUESSEL) || "17:00"; } catch (e) { return "17:00"; } });
  const [fertig, setFertig] = useState(false);
  const laden = () => {
    try { localStorage.setItem(ZEIT_SCHLUESSEL, zeit); } catch (e) { /* egal */ }
    const blob = new Blob([icsBauen(zeit)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "mein-mathe-training-erinnerung.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setFertig(true);
  };
  return (
    <div style={{ ...karte, marginTop: 14 }}>
      <p style={kicker}>Erinnerung</p>
      <label style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 14, color: C.tinte, fontWeight: 600 }}>
        Jeden Tag um
        <input type="time" value={zeit} onChange={(e) => { setZeit(e.target.value || "17:00"); setFertig(false); }} style={{ minHeight: 42, padding: "6px 12px", fontSize: 15, fontFamily: "inherit", border: `1.5px solid ${C.linie}`, borderRadius: 12 }} />
        <button type="button" onClick={laden} style={knopfKlein}>In den Kalender</button>
      </label>
      {fertig && <p role="status" style={{ fontSize: 13, color: C.smaragd, fontWeight: 600, lineHeight: 1.6, marginTop: 8 }}>Die Datei wurde geladen. Öffne sie, dann trägt dein Kalender die tägliche Erinnerung um {zeit} Uhr ein.</p>}
    </div>
  );
}

/* ---------- Konto-Pflicht ---------- */
function KontoHinweis({ gehe }) {
  const starten = () => { testkontoStarten(); testdatenEinspielen(); };
  return (
    <div style={{ ...karte, marginTop: 14, borderTop: `4px solid ${C.flaggold}` }}>
      <p style={kicker}>Mit Konto</p>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>Dein Training braucht ein Konto – damit dein Plan auf jedem Gerät derselbe ist.</p>
      <p style={{ fontSize: 14, color: C.grau, lineHeight: 1.65, marginTop: 6 }}>Du bekommst jeden Tag einen Plan aus deinen Themen, fälligen Wiederholungen und deinen Fehlern. Zum Ausprobieren reicht der Test-Account – ein Klick, kein Login.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button type="button" onClick={() => gehe({ ansicht: "konto" })} style={{ ...knopfVoll, minHeight: 46 }}>Anmelden oder Konto anlegen</button>
        <button type="button" onClick={starten} style={{ ...knopfGold, minHeight: 46 }} data-testkonto>Test-Account starten</button>
      </div>
    </div>
  );
}

/* Für die Startseite (funcMeinTrainingKachel.jsx): offene Einträge heute */
export { useOffenHeute, meinTrainingText } from "./funcMeinTrainingKachel.jsx";

/* ---------- Seite ---------- */
export function MeinTrainingSeite({ gehe }) {
  const konto = useKonto();
  const { E, T, geladen } = useEbb();
  const MT = useMT();
  const jetzt = useJetzt();
  const heute = datumVon(jetzt);
  const [auftraege, setAuftraege] = useState([]);
  const [freigabe, setFreigabeStand] = useState(MT.freigabe.lehrer);
  const angemeldet = !!konto.nutzer;
  const nutzerId = konto.nutzer && konto.nutzer.id;
  const ladenAuftraege = () => { meineAuftraege().then((l) => setAuftraege(Array.isArray(l) ? l : [])).catch(() => {}); };
  useEffect(() => { if (angemeldet) { ladenAuftraege(); lehrerFreigabe().then((f) => setFreigabeStand(!!f)).catch(() => {}); } }, [angemeldet, nutzerId]);   // eslint-disable-line react-hooks/exhaustive-deps
  const start = useMemo(() => { let qf = null; try { qf = JSON.parse(localStorage.getItem("matheplus-quickfinder") || "null"); } catch (e) { /* privat */ } return klasseErmitteln(konto.profil, qf) || { schulart: SCHULART_STANDARD, box: null }; }, [konto.profil]);
  const hinzufuegen = (arg) => { let r = null; mtAendern((M, X, Tr) => { r = themaHinzufuegen(M, arg, heute); if (r.ok && r.wo === "aktiv") tagesplanNeu(M, X, Tr, { jetzt: Date.now() }); }); return r || { ok: false }; };
  const aktion = (was, t) => {
    if (was === "werkzeug") { const info = themaInfo(t.id); if (info.wz && WERKZEUGE[info.wz]) gehe(WERKZEUGE[info.wz].ziel); return; }
    mtAendern((M, X, Tr) => {
      if (was === "entfernen") themaEntfernen(M, t.id, heute);
      if (was === "abschliessen") themaAbschliessen(M, t.id, heute);
      if (was === "vorziehen") themaVorziehen(M, t.id, heute);
      tagesplanNeu(M, X, Tr, { jetzt: Date.now() });
    });
  };
  const setFreigabe = (an) => { setFreigabeStand(an); mtAendern((M) => freigabeSetzen(M, an)); lehrerFreigeben(an).catch(() => {}); };
  const zuHeute = () => springe("meintraining", () => { const el = document.getElementById("mt-heute"); if (el) el.scrollIntoView({ block: "start", behavior: "smooth" }); });

  if (!angemeldet) return <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 6 }}><KontoHinweis gehe={gehe} /></div>;
  const aktiv = nachBuch(MT.aktiv);
  const vs = geladen ? vorschlaege(MT, E, { schulart: start.schulart, klasse: start.box, heute }) : [];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 6 }}>
      {konto.nutzer.test && <p style={{ fontSize: 12.5, color: "#6B5310", background: "#FFF4D6", borderRadius: 10, padding: "6px 12px", marginTop: 8 }}>Test-Account: Alles bleibt nur in diesem Browser. Abmelden im Menü beendet ihn.</p>}
      <Abschnitt kick="Heute" titel="Dein Tagesplan" id="mt-heute">
        <Heute MT={MT} E={E} T={T} geladen={geladen} gehe={gehe} auftraege={auftraege} planAendern={ladenAuftraege} />
      </Abschnitt>

      <Abschnitt kick="Meine Themen" titel={`In Arbeit · ${aktiv.length} von ${MAX_AKTIV}`}>
        {aktiv.length === 0 && <Rueck art="info">Noch kein Thema in Arbeit. Füg unten eins hinzu – ein Kapitel aus deinem Buch oder nur ein Unterthema.</Rueck>}
        <div style={{ display: "grid", gap: 10 }}>
          {aktiv.map((t) => <ThemaKarte key={t.id} t={t} E={E} heute={heute} wo="aktiv" aktion={aktion} />)}
        </div>
        {MT.danach.length > 0 && (
          <>
            <p style={{ ...kicker, marginTop: 16 }}>Danach · {MT.danach.length} von {MAX_DANACH}</p>
            <div style={{ display: "grid", gap: 10 }}>
              {MT.danach.map((t) => <ThemaKarte key={t.id} t={t} E={E} heute={heute} wo="danach" aktion={aktion} />)}
            </div>
          </>
        )}
        <ThemaWahl MT={MT} start={start} hinzufuegen={hinzufuegen} zu={zuHeute} />
        <div style={{ marginTop: 10 }}><Klassenarbeiten E={E} T={T} geladen={geladen} /></div>
      </Abschnitt>

      {vs.length > 0 && (
        <Abschnitt kick="Als Nächstes" titel="Vorschläge für dein Training">
          <div style={{ display: "grid", gap: 10 }}>
            {vs.map((v) => (
              <div key={v.id} style={{ ...karte, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: v.art === "luecke" ? C.signal : C.gruenDunkel }}>{v.art === "luecke" ? "Lücke schließen" : v.art === "baut-auf" ? "Baut darauf auf" : v.art === "klasse" ? "Dein Buch" : "Nächstes Kapitel"}</p>
                <p style={{ fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3, marginTop: 2 }}>{v.titel}</p>
                <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.5 }}>{v.zeile}</p>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 8 }}>
                  <MathildaIcon groesse={28} />
                  <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.55, flex: 1 }}>{v.mathilda}</p>
                </div>
                <button type="button" onClick={() => hinzufuegen({ id: v.id, schulart: start.schulart, klasse: start.box })} style={{ ...knopfVoll, minHeight: 38, padding: "4px 14px", fontSize: 13, marginTop: 10 }}>Ins Training ›</button>
              </div>
            ))}
          </div>
        </Abschnitt>
      )}

      <Abschnitt kick="Woche" titel="Was war, was kommt">
        <Woche MT={MT} E={E} />
      </Abschnitt>

      <Abschnitt kick="Stand" titel="Wo du stehst">
        <Stand MT={MT} E={E} gehe={gehe} freigabe={freigabe} setFreigabe={setFreigabe} />
        <Erinnerung />
      </Abschnitt>
    </div>
  );
}
