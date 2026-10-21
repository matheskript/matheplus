/* ======================================================================
   START-KARTE (21.10.2026) – ein Einstieg statt drei Boxen
   Früher standen „Mein Mathe-Training“, „Dein Training startet hier.“ und die
   Zone „Heute“ (Onboarding mit vier Fragen) getrennt untereinander, und die
   Klasse wurde zweimal gefragt (Onboarding und Quickfinder).

   Jetzt EINE Karte mit drei Zuständen:
   · neu (keine Klasse bekannt): „In welcher Klasse bist du?“ – Schulsystem
     vorbelegt, Klassen-Knöpfe. Die Wahl landet in BEIDEN Speichern
     (Quickfinder „matheplus-quickfinder“ und Onboarding „mm-onboarding-v1“),
     damit nichts doppelt gefragt wird. Eltern und Lehrkräfte: kleine Links.
   · Klasse bekannt: die Heute-Karte (funcHeuteKarte.jsx) mit Klassen-Chip,
     darunter Konto-Zeile (Tagesplan bzw. Anmelden/Test-Account), Weitermachen
     und die Schublade „Thema · Plan · Tools · Videos“ (Quickfinder).
   · Eltern/Lehrkraft: ihre Zeilen (FuerDich aus funcOnboarding.jsx).
   Klasse kommt aus useStartStufe (Konto > Quickfinder > Onboarding).
   Browser: tests/ui/startkarte.ui.py
   ====================================================================== */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { HeuteKarte } from "./funcHeuteKarte.jsx";
import { onboardingLesen, FuerDich } from "./funcOnboarding.jsx";
import { WeitermachenZeile } from "./func2.jsx";
import { SCHULARTEN, SCHULART_STANDARD, klassenBoxen, stufeAusKlassenBox } from "./schulbuch.js";
import { testkontoStarten, useKonto } from "./konto.js";
import { useOffenHeute, meinTrainingText } from "./funcMeinTrainingKachel.jsx";

const NACHT = "#050B1F";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const Q_SCHLUESSEL = "matheplus-quickfinder";
const O_SCHLUESSEL = "mm-onboarding-v1";

/* Thema der Heute-Karte, wenn im Onboarding keins gewählt wurde: passend zur Stufe */
export { themaAusStufe } from "./funcTagesplan.jsx";
import { themaAusStufe } from "./funcTagesplan.jsx";

function lies(k) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v && typeof v === "object" ? v : null; } catch { return null; } }
function schreib(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* privat */ } }

/* Profil für den Tagesplan: aus der Klassen-Id („g9:11“ bzw. „onboarding:11“) Schulart und Klassenbox */
function profilVon(klasse, thema) {
  const [art, rest] = String(klasse.id).split(":");
  if (art === "onboarding") {
    const box = klassenBoxen(SCHULART_STANDARD).find((b) => b.klassen.includes(Number(rest)));
    return { schulart: SCHULART_STANDARD, klasse: box ? box.id : null, thema };
  }
  return { schulart: SCHULARTEN.some((s) => s.id === art) ? art : SCHULART_STANDARD, klasse: rest || null, thema };
}

/* Klassenwahl schreibt Quickfinder UND Onboarding (eine Frage, ein Ergebnis) */
export function klasseSpeichern(schulart, box) {
  const q = lies(Q_SCHLUESSEL) || {};
  const gleich = q.schulart === schulart && q.klasse === box.id;
  schreib(Q_SCHLUESSEL, gleich ? q : { ...q, schulart, klasse: box.id, kapitel: null, teil: null });
  const o = lies(O_SCHLUESSEL) || {};
  const stufe = stufeAusKlassenBox(box);
  const altStufe = Number.isInteger(o.klasse) ? stufeAusKlassenBox({ klassen: [o.klasse] }) : null;
  schreib(O_SCHLUESSEL, { ...o, uebersprungen: undefined, rolle: "schueler", klasse: box.klassen[0], thema: o.thema && altStufe === stufe ? o.thema : themaAusStufe(stufe), zeit: Date.now() });
  return stufe;
}

const CSS = `
.sk { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin-top: 14px; }
.sk-wahl { position: relative; overflow: hidden; border-radius: 22px; padding: 20px 18px 16px; color: #FFFFFF;
  background-color: #0B2763; background-image: radial-gradient(110% 70% at 100% 0%, rgba(255,229,138,0.16) 0%, rgba(255,229,138,0) 60%), linear-gradient(160deg, #0A3A80 0%, #0B2763 55%, ${NACHT} 100%);
  box-shadow: 0 0 0 1px rgba(237,187,0,0.38), 0 18px 40px -22px rgba(5,11,31,0.7), inset 0 1px 0 rgba(255,255,255,0.12); }
.sk-wahl h2 { margin: 0; font-size: clamp(22px, 6vw, 28px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; color: #FFFFFF; }
.sk-wahl .linie { display: block; width: 40px; height: 3px; border-radius: 2px; margin-top: 10px; background: linear-gradient(90deg, ${C.goldWarm} 0%, ${GOLD} 100%); }
.sk-wahl .frage { margin: 14px 0 0; font-size: 15.5px; font-weight: 700; color: #FFFFFF; }
.sk-sa { display: flex; gap: 4px; margin-top: 12px; padding: 4px; border-radius: 999px; background: rgba(255,255,255,0.08); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); width: max-content; max-width: 100%; }
.sk-sa button { height: 32px; padding: 0 14px; border-radius: 999px; border: none; cursor: pointer; font-family: inherit; font-size: 13.5px; font-weight: 800; color: rgba(255,255,255,0.75); background: transparent; }
.sk-sa button[aria-pressed="true"] { background: #FFFFFF; color: ${C.seeTief}; }
.sk-kl { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.sk-kl button { height: 48px; border-radius: 14px; cursor: pointer; font-family: inherit; font-size: 17px; font-weight: 800; color: #FFFFFF;
  border: 1px solid rgba(255,255,255,0.22); background: rgba(255,255,255,0.07); transition: background .15s ease, border-color .15s ease, transform .15s ease; }
.sk-kl button.gold { color: ${NACHT}; border-color: transparent; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.55); }
.sk-kl button[aria-pressed="true"] { outline: 2px solid #FFFFFF; outline-offset: 2px; }
.sk-kl button:focus-visible, .sk-sa button:focus-visible, .sk-links button:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 2px; }
@media (hover: hover) { .sk-kl button:not(.gold):hover { background: rgba(255,255,255,0.14); border-color: ${GOLD}; } .sk-kl button.gold:hover { filter: brightness(1.05); } }
.sk-hinweis { margin: 10px 0 0; font-size: 12px; color: rgba(255,255,255,0.6); }
.sk-links { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.12); }
.sk-links button { background: none; border: none; padding: 4px 0; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.82); }
.sk-links button.gold { color: ${GOLD}; }
.sk-links .weg { margin-left: auto; color: rgba(255,255,255,0.55); font-weight: 600; }
.sk-konto { display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 10px 8px 16px; border-radius: 18px; background: var(--karte, #FFFFFF);
  border: 1.5px solid ${C.see}33; color: ${C.tinte}; box-shadow: 0 6px 18px -12px rgba(0,47,110,0.35); }
.sk-konto p { flex: 1 1 auto; min-width: 0; margin: 0; font-size: 13.5px; line-height: 1.4; color: var(--text, ${C.tinte}); }
.sk-konto p b { font-weight: 800; }
.sk-konto .k { flex: 0 0 auto; height: 38px; padding: 0 14px; border-radius: 999px; cursor: pointer; font-family: inherit; font-size: 13.5px; font-weight: 800; white-space: nowrap;
  border: 1.5px solid ${C.see}; background: ${C.see}; color: #FFFFFF; }
.sk-konto .k.hell { background: transparent; color: ${C.see}; }
.sk-konto .knoepfe { display: flex; gap: 6px; flex: 0 0 auto; }
@media (max-width: 419px) { .sk-konto { flex-wrap: wrap; padding: 12px 12px 12px 14px; } .sk-konto .knoepfe { width: 100%; } .sk-konto .knoepfe .k { flex: 1 1 0; } }
.sbb[data-modus="dunkel"] .sk-konto { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.16); }
.sbb[data-modus="dunkel"] .sk-konto .k.hell { color: #FFFFFF; border-color: rgba(255,255,255,0.5); }
.sk > [data-weitermachen] { margin-top: 0 !important; }
`;

/* ---------- Zustand „neu“: In welcher Klasse bist du? ---------- */
function KlassenWahlKarte({ start, waehle, rolle, gehe, abbrechen, angemeldet }) {
  const [sa, setSa] = useState(start.schulart || SCHULART_STANDARD);
  const boxen = klassenBoxen(sa);
  return (
    <div className="sk-wahl" data-startkarte="wahl">
      <h2>Dein Training startet hier.</h2>
      <span className="linie" aria-hidden="true" />
      <p className="frage">In welcher Klasse bist du?</p>
      <div className="sk-sa" role="group" aria-label="Schulsystem">
        {SCHULARTEN.map((s) => (
          <button key={s.id} type="button" aria-pressed={sa === s.id} onClick={() => setSa(s.id)} title={s.zeile} data-sk-schulart={s.id}>{s.name}</button>
        ))}
      </div>
      <div className="sk-kl" role="group" aria-label="Klasse">
        {boxen.map((b) => (
          <button key={b.id} type="button" className={b.gold ? "gold" : undefined} aria-pressed={start.schulart === sa && start.klasse === b.id}
            onClick={() => waehle(sa, b)} data-sk-klasse={b.id} aria-label={`Klasse ${b.label}`}>{b.label}</button>
        ))}
      </div>
      <p className="sk-hinweis">Gold: Kursstufe. Bleibt nur auf diesem Gerät gespeichert.</p>
      <div className="sk-links">
        {!angemeldet && <button type="button" className="gold" onClick={() => gehe({ ansicht: "konto" })}>Anmelden</button>}
        <button type="button" onClick={() => rolle("eltern")} data-sk-rolle="eltern">Ich bin Elternteil</button>
        <button type="button" onClick={() => rolle("lehrkraft")} data-sk-rolle="lehrkraft">Ich unterrichte</button>
        {abbrechen && <button type="button" className="weg" onClick={abbrechen}>Abbrechen</button>}
      </div>
    </div>
  );
}

/* ---------- Konto-Zeile: Tagesplan aus Mein Mathe-Training bzw. Anmelden ---------- */
function KontoZeile({ gehe }) {
  const konto = useKonto();
  const s = useOffenHeute();
  if (!konto.nutzer) return (
    <div className="sk-konto" data-startkarte="gast">
      <p><b>Mit Konto</b> plant Mathilda jeden Tag für dich: Themen, Wiederholungen, Fehler.</p>
      <div className="knoepfe">
        <button type="button" className="k" onClick={() => gehe({ ansicht: "konto" })}>Anmelden</button>
        <button type="button" className="k hell" data-testkonto onClick={() => { testkontoStarten(); import("./funcMeinTraining.jsx").then((m) => m.testdatenEinspielen()).catch(() => {}); gehe({ ansicht: "meintraining" }); }}>Testen</button>
      </div>
    </div>
  );
  return (
    <div className="sk-konto" data-startkarte="konto">
      <p><b>Mein Mathe-Training</b> · {meinTrainingText(s)}</p>
      <div className="knoepfe"><button type="button" className="k" onClick={() => gehe({ ansicht: "meintraining" })}>{s.themen ? "Tagesplan ›" : "Thema wählen ›"}</button></div>
    </div>
  );
}

/* ---------- Die Karte ---------- */
export function StartKarte({ gehe, setzeStufe, klasse, schublade }) {
  const [, neuLesen] = useState(0);
  const [wahl, setWahl] = useState(false);
  const angemeldet = !!useKonto().nutzer;
  React.useInsertionEffect(() => {
    if (document.getElementById("sk-stil")) return;
    const s = document.createElement("style"); s.id = "sk-stil"; s.textContent = CSS; document.head.appendChild(s);
  }, []);
  const o = onboardingLesen() || {};
  const q = lies(Q_SCHLUESSEL) || {};
  /* Klasse nur aus dem alten Onboarding bekannt: in den Quickfinder übernehmen, sonst fragt die Schublade sie noch einmal */
  useEffect(() => {
    if (!klasse || q.schulart || !Number.isInteger(o.klasse)) return;
    const box = klassenBoxen(SCHULART_STANDARD).find((b) => b.klassen.includes(o.klasse));
    if (box) schreib(Q_SCHLUESSEL, { ...q, schulart: SCHULART_STANDARD, klasse: box.id, kapitel: null, teil: null });
  }, [klasse && klasse.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const waehle = (schulart, box) => {
    const st = klasseSpeichern(schulart, box);
    setWahl(false);
    if (setzeStufe) setzeStufe(st);
    neuLesen((n) => n + 1);
  };
  const rolle = (r) => { schreib(O_SCHLUESSEL, { rolle: r, zeit: Date.now() }); setWahl(false); neuLesen((n) => n + 1); };
  const zurWahl = () => { if (o.rolle && o.rolle !== "schueler") schreib(O_SCHLUESSEL, { ...o, rolle: "schueler" }); setWahl(true); neuLesen((n) => n + 1); };

  /* Eltern und Lehrkräfte: ihre Zeilen, „Ändern“ führt zur Klassenwahl */
  if (o.rolle === "eltern" || o.rolle === "lehrkraft") {
    return <div className="sk" data-startkarte="rolle"><FuerDich o={o} gehe={gehe} neu={zurWahl} planDa={false} /></div>;
  }
  if (!klasse || wahl) {
    return (
      <div className="sk">
        <KlassenWahlKarte start={{ schulart: q.schulart, klasse: q.klasse }} waehle={waehle} rolle={rolle} gehe={gehe} abbrechen={klasse && wahl ? () => setWahl(false) : null} angemeldet={angemeldet} />
        {angemeldet && <KontoZeile gehe={gehe} />}
      </div>
    );
  }
  const st = klasse.stufe;
  /* Thema aus dem Onboarding nur, solange es zur Stufe passt (Klasse kann im Quickfinder gewechselt worden sein) */
  const oStufe = Number.isInteger(o.klasse) ? stufeAusKlassenBox({ klassen: [o.klasse] }) : null;
  const thema = o.thema && oStufe === st ? o.thema : themaAusStufe(st);
  const oHeute = { ...o, rolle: "schueler", klasse: klasse.label, thema };
  return (
    <div className="sk" data-startkarte="heute">
      <HeuteKarte o={oHeute} profil={profilVon(klasse, thema)} gehe={gehe} neu={() => setWahl(true)} />
      <WeitermachenZeile gehe={gehe} lack />
      <KontoZeile gehe={gehe} />
      {schublade}
    </div>
  );
}
