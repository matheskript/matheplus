/* ======================================================================
   TRAININGS-SESSION – das Vollbild für jedes Training
   Ein Overlay über der ganzen App (Portal, position: fixed, 100dvh): die
   Seite dahinter scrollt nicht mehr, man ist nur noch in der Session und
   springt von Seite zu Seite (Wischen, Pfeiltasten, Fußleiste).
   Seitenarten kommen aus trainingszentrum.js: intro · aufgaben · film ·
   werkzeug · auswertung. Aufgaben laufen über Aufgabenlauf (funcTraining),
   Filme über die Erkläranimationen, Werkzeuge über ihre Komponenten
   (WZ_SEITEN bzw. EINGEBETTET) – im Rahmen der Session, mit eigenem Scroll.
   z-Index 70: unter „Ich hänge fest“ (90) und Mathilda-Modus (950),
   die aus einer Seite heraus aufgehen dürfen. Keine base-Datei importiert
   diese Datei.
   ====================================================================== */
import React, { Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { lazyLaden, ChunkGrenze } from "./chunkSchutz.jsx";
import { Laden, WZ_SEITEN } from "./funcWerkzeugSeite.jsx";
import { Aufgabenlauf, ebbBuchen } from "./funcTraining.jsx";
import { neueAufgabe, FEHLERTYPEN } from "./trainingDaten.js";
import { ART_NAMEN, FILME, auswertung, seitenTitel, zuletztMerken } from "./trainingszentrum.js";

const lazy = (lader, name) => lazyLaden(() => lader().then((m) => ({ default: m[name] })));

/* Trainings, die in func10 ohne WZ_SEITEN laufen – hier eingebettet */
const EINGEBETTET = {
  ableitungstrainer: lazy(() => import("./func13.jsx"), "Ableitungstrainer"),
  parabeln: lazy(() => import("./funcParabelTrainer.jsx"), "ParabelTrainer"),
  integrale: lazy(() => import("./funcIntegralTrainer.jsx"), "IntegralTrainer"),
  geradengleichung: lazy(() => import("./funcGeradengleichung.jsx"), "Geradengleichung"),
  gleichungen: lazy(() => import("./funcGleichungen.jsx"), "Gleichungsloeser"),
  lgs: lazy(() => import("./funcLGS.jsx"), "LGSLoeser"),
  klausur: lazy(() => import("./func4.jsx"), "Klausur"),
  abiketten: lazy(() => import("./funcAbiKetten.jsx"), "AbiKettenSeite"),
  abisaetze: lazy(() => import("./funcAbiSaetze.jsx"), "AbiSaetzeSeite"),
};
/* Komponenten ohne eigene Spalte (sie verlassen sich auf einen Rahmen der Seite) bekommen hier einen */
const MIT_RAHMEN = new Set(["klausur", "abiketten", "abisaetze"]);
const MathildaFilm = lazy(() => import("./funcMathildaModusFilm.jsx"), "MathildaModusFilm");

export const einbettbar = (ansicht) => Boolean(EINGEBETTET[ansicht] || WZ_SEITEN[ansicht]);

const Z = 70;
const STIL = `
.ts-huelle { position: fixed; inset: 0; z-index: ${Z}; display: flex; flex-direction: column; background: ${C.sand}; color: ${C.tinte};
  font-family: Montserrat, system-ui, sans-serif; height: 100dvh; overscroll-behavior: contain; animation: tsAuf .28s cubic-bezier(.2,.7,.3,1) both; }
@keyframes tsAuf { from { opacity: 0; transform: translateY(18px) scale(.985); } to { opacity: 1; transform: none; } }
.ts-kopf { flex: 0 0 auto; padding: max(8px, env(safe-area-inset-top)) 12px 0; background: ${C.weiss}; border-bottom: 1px solid ${C.linie}; }
.ts-kopfzeile { display: flex; align-items: center; gap: 10px; height: 56px; max-width: 760px; margin: 0 auto; }
.ts-rund { height: 42px; min-width: 42px; border-radius: 999px; border: 1.5px solid ${C.linie}; background: ${C.weiss}; color: ${C.see}; cursor: pointer;
  font-family: inherit; display: inline-flex; align-items: center; justify-content: center; padding: 0; flex-shrink: 0; transition: background .15s, border-color .15s; }
.ts-rund:hover { background: ${C.himmel}; }
.ts-rund:focus-visible { outline: 3px solid ${C.flaggold}; outline-offset: 2px; }
.ts-titelblock { flex: 1 1 auto; min-width: 0; }
.ts-kicker { font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${C.gruenDunkel}; line-height: 1.2; }
.ts-titel { font-size: 16px; font-weight: 800; color: ${C.seeTief}; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -.01em; }
.ts-zaehler { font-size: 13px; font-weight: 700; color: ${C.grau}; white-space: nowrap; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.ts-fortschritt { display: flex; gap: 4px; max-width: 760px; margin: 0 auto; padding: 0 0 10px; }
.ts-segment { flex: 1 1 0; height: 4px; border-radius: 999px; background: ${C.himmel}; overflow: hidden; position: relative; }
.ts-segment > i { position: absolute; inset: 0; transform-origin: left; border-radius: 999px; background: ${C.flaggold}; transform: scaleX(0); transition: transform .35s ease; }
.ts-segment.fertig > i { transform: scaleX(1); background: ${C.see}; }
.ts-segment.aktiv > i { transform: scaleX(var(--anteil, .08)); }
.ts-leib { flex: 1 1 auto; min-height: 0; position: relative; overflow: hidden; }
.ts-seite { position: absolute; inset: 0; overflow: hidden; display: flex; flex-direction: column; animation: tsRein .32s cubic-bezier(.2,.7,.3,1) both; }
.ts-seite.zurueck { animation-name: tsReinLinks; }
@keyframes tsRein { from { opacity: 0; transform: translateX(34px); } to { opacity: 1; transform: none; } }
@keyframes tsReinLinks { from { opacity: 0; transform: translateX(-34px); } to { opacity: 1; transform: none; } }
.ts-innen { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.ts-mitte { max-width: 640px; margin: 0 auto; padding: 14px 16px 20px; }
.ts-passt { display: flex; flex-direction: column; justify-content: center; min-height: 100%; }
.ts-fuss { flex: 0 0 auto; background: ${C.weiss}; border-top: 1px solid ${C.linie}; padding: 10px 12px max(10px, env(safe-area-inset-bottom)); }
.ts-fusszeile { max-width: 760px; margin: 0 auto; display: flex; align-items: center; gap: 10px; }
.ts-knopf { height: 48px; border-radius: 14px; border: none; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 800; padding: 0 20px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: transform .12s, box-shadow .15s; }
.ts-knopf:active { transform: scale(.985); }
.ts-knopf:focus-visible { outline: 3px solid ${C.flaggold}; outline-offset: 2px; }
.ts-knopf.primaer { flex: 1 1 auto; color: ${C.weiss}; background: linear-gradient(135deg, ${C.see} 0%, ${C.seeTief} 100%); box-shadow: 0 8px 20px rgba(0,77,152,.28); }
.ts-knopf.gold { flex: 1 1 auto; color: ${C.seeTief}; background: linear-gradient(135deg, #F8D23A 0%, ${C.flaggold} 55%, #D9A600 100%); box-shadow: 0 8px 20px rgba(237,187,0,.35); }
.ts-knopf.leise { color: ${C.see}; background: ${C.weiss}; border: 1.5px solid ${C.linie}; }
.ts-knopf.leise:disabled { opacity: .35; cursor: default; }
.ts-punkte { display: flex; gap: 6px; align-items: center; justify-content: center; flex: 1 1 auto; }
.ts-punkt { width: 6px; height: 6px; border-radius: 999px; background: ${C.silber}; transition: all .25s; }
.ts-punkt.aktiv { width: 18px; background: ${C.flaggold}; }
.ts-punkt.fertig { background: ${C.see}; }
@media (prefers-reduced-motion: reduce) { .ts-huelle, .ts-seite { animation: none; } }
@media (min-width: 760px) { .ts-mitte { padding: 28px 24px 32px; } .ts-titel { font-size: 18px; } }
`;

/* ---------- Seitentypen ---------- */
function IntroSeite({ s }) {
  return (
    <div className="ts-innen"><div className="ts-mitte ts-passt">
      <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 10 }}>Einstieg</p>
      <h2 style={{ fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-.03em", color: C.seeTief, margin: 0 }}>{s.titel}</h2>
      <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, margin: "16px 0" }} />
      {s.text && <p style={{ fontSize: 16, lineHeight: 1.7, color: C.grau, margin: 0 }}>{s.text}</p>}
      {s.punkte && s.punkte.length > 0 && (
        <ol style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 10 }}>
          {s.punkte.map((p, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: C.weiss, borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 12px rgba(15,26,51,0.06)" }}>
              <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 999, background: C.seeTief, color: C.flaggold, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.tinte, lineHeight: 1.35 }}>{p}</span>
            </li>
          ))}
        </ol>
      )}
    </div></div>
  );
}

function FilmSeite({ s }) {
  const info = FILME[s.film] || { titel: "Film", zeile: "" };
  return (
    <div className="ts-innen"><div className="ts-mitte ts-passt">
      {info.zeile && <p style={{ fontSize: 13.5, lineHeight: 1.5, color: C.grau, margin: "0 0 10px" }}><span style={{ fontWeight: 700, color: C.gruenDunkel }}>Motion-Video · </span>{info.zeile}</p>}
      <div data-mm-film style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", padding: "12px 12px 14px" }}>
        <ChunkGrenze key={s.film}>
          <Suspense fallback={<Laden />}>
            {s.film === "mathilda" ? <MathildaFilm /> : <Film art={s.film} />}
          </Suspense>
        </ChunkGrenze>
      </div>
    </div></div>
  );
}
/* Die Szenen liegen als Tabelle in funcErklaeranimation (SZENEN); hier nachgeladen und als Komponente gerendert */
const Film = lazyLaden(() => import("./funcErklaeranimation.jsx").then((m) => ({
  default: ({ art }) => { const S = m.SZENEN[art]; return S ? <S /> : <p style={{ color: C.grau, padding: 12 }}>Dieser Film fehlt noch.</p>; },
})));

function AufgabenSeite({ s, onSchritt, onFertig, quelle, runde = 0 }) {
  /* Fertige Aufgaben (5 Minuten Mathe) in der ersten Runde unverändert; „Noch eine Runde“ erzeugt neue Varianten derselben Generatoren */
  const [aufgaben] = useState(() => {
    if (s.aufgaben && s.aufgaben.length) return runde === 0 ? s.aufgaben : s.aufgaben.map((a) => (a.variante ? neueAufgabe(a.variante) : a));
    return (s.gen || []).map((g) => neueAufgabe(g));
  });
  if (!aufgaben.length) return <div className="ts-innen"><div className="ts-mitte"><p style={{ color: C.grau }}>Für diese Seite gibt es gerade keine Aufgabe.</p></div></div>;
  return (
    <div className="ts-innen"><div className="ts-mitte">
      <Aufgabenlauf aufgaben={aufgaben} quelle={quelle} endeText="Weiter" ohneSprung onSchritt={onSchritt}
        onWeiter={(a, z) => ebbBuchen([a], [z], quelle)} onEnde={(zs) => onFertig(zs)} />
    </div></div>
  );
}

function WerkzeugSeite({ s, gehe, schliessen }) {
  const Komp = EINGEBETTET[s.ansicht] || (WZ_SEITEN[s.ansicht] && WZ_SEITEN[s.ansicht].Komp);
  const [seite, setSeite] = useState(null);
  if (!Komp) return <div className="ts-innen"><div className="ts-mitte"><p style={{ color: C.grau }}>Dieses Werkzeug kann hier noch nicht eingebettet werden.</p></div></div>;
  const rahmen = MIT_RAHMEN.has(s.ansicht);
  return (
    <div className="ts-innen" data-ts-werkzeug={s.ansicht}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: rahmen ? "6px 16px 24px" : 0 }}>
        <ChunkGrenze key={s.ansicht}>
          <Suspense fallback={<Laden />}>
            <Komp gehe={gehe} ansicht={s.ansicht} seite={seite} setSeite={setSeite} onZurueck={schliessen} />
          </Suspense>
        </ChunkGrenze>
      </div>
    </div>
  );
}

function AuswertungSeite({ ergebnisse, session, nochmal, schliessen }) {
  const e = auswertung(ergebnisse);
  const hatte = e.n > 0;
  return (
    <div className="ts-innen"><div className="ts-mitte ts-passt">
      <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, borderRadius: 20, padding: "22px 22px 24px", boxShadow: "0 12px 32px rgba(14,30,74,.28)" }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.flaggold, margin: "0 0 8px" }}>Geschafft</p>
        <p style={{ fontSize: "clamp(24px, 6.4vw, 32px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.03em", margin: 0 }}>{session.titel}</p>
        {hatte ? (
          <p style={{ fontSize: 15, lineHeight: 1.6, marginTop: 12, opacity: .92 }}>
            {e.richtig} von {e.n} Aufgaben gelöst{e.ohneHilfe < e.richtig ? `, ${e.ohneHilfe} davon ohne Hilfe` : e.richtig > 0 ? " – alle ohne Hilfe" : ""}.
            {e.anteil !== null && e.anteil >= 0.75 ? " Das sitzt." : e.anteil !== null && e.anteil >= 0.4 ? " Die Lücken sind jetzt sichtbar – genau dafür ist Training da." : " Noch nicht rund – die nächste Runde ist der beste Zeitpunkt."}
          </p>
        ) : (
          <p style={{ fontSize: 15, lineHeight: 1.6, marginTop: 12, opacity: .92 }}>Session abgeschlossen. Was du im Werkzeug gerechnet hast, ist in deinem Lernstand gebucht.</p>
        )}
      </div>
      {e.typen.length > 0 && (
        <div style={{ background: C.weiss, borderRadius: 16, padding: "14px 16px", marginTop: 14, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.gruenDunkel, margin: "0 0 6px" }}>Auffällig war</p>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, margin: 0 }}>{e.typen.map((t) => (FEHLERTYPEN[t] || { name: t }).name).join(", ")}. Ein einzelner Fehler ist kein Muster – wiederholt er sich, taucht er unter „Meine Fehler üben“ auf.</p>
        </div>
      )}
      <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
        <button type="button" className="ts-knopf gold" onClick={nochmal}>Noch eine Runde</button>
        <button type="button" className="ts-knopf leise" onClick={schliessen}>Zurück ins Trainingszentrum</button>
      </div>
    </div></div>
  );
}

/* ---------- Die Session ---------- */
/* session = { id, titel, kicker, dauer, seiten }, onSchliessen(), gehe (Navigation der App, schließt vorher die Session) */
export function TrainingsSession({ session, onSchliessen, gehe, quelle = "trainingszentrum", startSeite = 0 }) {
  const seiten = session.seiten;
  const n = seiten.length;
  const [i, setI] = useState(Math.min(Math.max(0, startSeite), n - 1));
  const [richtung, setRichtung] = useState("vor");
  const [lauf, setLauf] = useState({ i: 0, n: 1 });          // Fortschritt innerhalb einer Aufgaben-Seite
  const [ergebnisse, setErgebnisse] = useState({});          // Seitenindex -> zs
  const [runde, setRunde] = useState(0);                     // „Noch eine Runde“ erzeugt neue Aufgaben
  const huelle = useRef(null);
  const touch = useRef(null);
  const s = seiten[i];

  /* Scroll der App sperren, Escape schließt, Pfeiltasten blättern (nicht beim Tippen) */
  useEffect(() => {
    const altBody = document.body.style.overflow, altHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden";
    const taste = (e) => {
      const tippt = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || (e.target && e.target.isContentEditable);
      if (e.key === "Escape" && !tippt) { e.preventDefault(); onSchliessen(); return; }
      if (tippt || s.art === "aufgaben" || s.art === "werkzeug") return;
      if (e.key === "ArrowRight") weiter();
      if (e.key === "ArrowLeft") zurueck();
    };
    window.addEventListener("keydown", taste);
    return () => { document.body.style.overflow = altBody; document.documentElement.style.overflow = altHtml; window.removeEventListener("keydown", taste); };
  }, [i]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { try { huelle.current && huelle.current.focus({ preventScroll: true }); } catch (e) { /* egal */ } }, []);
  useEffect(() => { zuletztMerken(localStorage, session.id, i, i === n - 1 && s.art === "auswertung"); }, [i]);   // eslint-disable-line react-hooks/exhaustive-deps

  const geheZu = (k, r) => { if (k < 0 || k >= n) return; setRichtung(r); setI(k); setLauf({ i: 0, n: 1 }); };
  const weiter = () => (i + 1 < n ? geheZu(i + 1, "vor") : onSchliessen());
  const zurueck = () => geheZu(i - 1, "zurueck");
  const nochmal = () => { setErgebnisse({}); setRunde((r) => r + 1); geheZu(0, "zurueck"); };

  /* Wischen – nur auf Seiten ohne Eingabe (Intro, Film, Auswertung) */
  const wischbar = s.art === "intro" || s.art === "film" || s.art === "auswertung";
  const touchStart = (e) => { if (!wischbar) return; const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY, t: Date.now() }; };
  const touchEnde = (e) => {
    if (!wischbar || !touch.current) return;
    const t = e.changedTouches[0], dx = t.clientX - touch.current.x, dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 64 && Math.abs(dy) < 48) (dx < 0 ? weiter() : zurueck());
  };

  /* Navigation aus einem eingebetteten Werkzeug heraus: Session zu, dann die App */
  const geheAusSession = (ziel) => { onSchliessen(); if (gehe) gehe(ziel); };

  const anteil = s.art === "aufgaben" ? Math.max(0.06, lauf.i / Math.max(1, lauf.n)) : 0.08;
  const letzte = i === n - 1;
  const fussWeiter = s.art === "aufgaben" ? "Überspringen" : letzte ? "Fertig" : s.art === "intro" ? "Los geht’s" : "Weiter";

  const inhalt = (
    <div ref={huelle} className="ts-huelle" role="dialog" aria-modal="true" aria-label={`Training: ${session.titel}`} tabIndex={-1} data-trainings-session={session.id}
      onTouchStart={touchStart} onTouchEnd={touchEnde}>
      <style>{STIL}</style>
      <div className="ts-kopf">
        <div className="ts-kopfzeile">
          <button type="button" className="ts-rund" onClick={onSchliessen} aria-label="Training schließen" title="Schließen">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="ts-titelblock">
            <div className="ts-kicker">{session.kicker || "Training"} · {ART_NAMEN[s.art] || s.art}</div>
            <div className="ts-titel">{seitenTitel(s, i, n)}</div>
          </div>
          <span className="ts-zaehler" aria-label={`Seite ${i + 1} von ${n}`}>{i + 1} / {n}</span>
        </div>
        <div className="ts-fortschritt" aria-hidden="true">
          {seiten.map((_, k) => <span key={k} className={`ts-segment${k < i ? " fertig" : k === i ? " aktiv" : ""}`} style={k === i ? { "--anteil": anteil } : undefined}><i /></span>)}
        </div>
      </div>
      <div className="ts-leib">
        <div key={`${runde}-${i}`} className={`ts-seite${richtung === "zurueck" ? " zurueck" : ""}`}>
          {s.art === "intro" && <IntroSeite s={s} />}
          {s.art === "film" && <FilmSeite s={s} />}
          {s.art === "aufgaben" && <AufgabenSeite s={s} quelle={quelle} runde={runde} onSchritt={(k, m) => setLauf({ i: k, n: m })} onFertig={(zs) => { setErgebnisse((alt) => ({ ...alt, [i]: zs })); weiter(); }} />}
          {s.art === "werkzeug" && <WerkzeugSeite s={s} gehe={geheAusSession} schliessen={onSchliessen} />}
          {s.art === "auswertung" && <AuswertungSeite ergebnisse={Object.values(ergebnisse)} session={session} nochmal={nochmal} schliessen={onSchliessen} />}
        </div>
      </div>
      {s.art !== "auswertung" && (
        <div className="ts-fuss">
          <div className="ts-fusszeile">
            <button type="button" className="ts-knopf leise" onClick={zurueck} disabled={i === 0} aria-label="Vorherige Seite">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <div className="ts-punkte" aria-hidden="true">
              {n <= 12 && seiten.map((_, k) => <span key={k} className={`ts-punkt${k === i ? " aktiv" : k < i ? " fertig" : ""}`} />)}
            </div>
            <button type="button" className={`ts-knopf ${s.art === "aufgaben" ? "leise" : letzte || s.art === "intro" ? "gold" : "primaer"}`} onClick={weiter} style={s.art === "aufgaben" ? { flex: "0 0 auto" } : { maxWidth: 220 }}>
              {fussWeiter}{s.art !== "aufgaben" && <span aria-hidden="true">›</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
  return createPortal(inhalt, document.body);
}
