/* ============================================================
   KURS DIFFERENTIALRECHNUNG (ansicht "diffkurs", Pfad /differentialrechnung)
   Ein Modul je Kapitel des Schulbuchs „Ableitungen“:
     1. das Kapitel zum Lesen (Lesefunktion des Buchs, nur die Seiten
        dieses Kapitels: /buecher/ableitungen/index.html?von=…&bis=…)
     2. darunter „Trainieren“ mit drei Reitern (funcDiffKursUeben.jsx):
        Werkzeuge (öffnen sich als Pop-up-Fenster im Modul), Aufgaben (alle
        Buchaufgaben zum Aufklappen + Aufgabentool mit neuen Aufgaben vom selben
        Typ) und Sätze und Definitionen (Merke-/Achtung-Kästen des Kapitels).
   Farben: Babyblau, Schwarz, Weiß und sehr dunkles Gold (C.babyblau …).
   Fortschritt (gelesen/geübt) liegt im localStorage dieses Geräts.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { MODUL_KATALOG } from "./base2.jsx";
import { WERKZEUGE } from "./werkzeuge.js";
import { lazyLaden, ChunkGrenze } from "./chunkSchutz.jsx";
import { WZ_SEITEN, Laden } from "./funcWerkzeugSeite.jsx";
import { springe } from "./sprung.js";
import { WerkzeugKarte, KartenStil } from "./funcDiffKursKarten.jsx";
import { KURS_MODULE, KAPITEL } from "./diffKursDaten.js";
import { KursTraining } from "./funcDiffKursUeben.jsx";

export { KURS_MODULE, KAPITEL };

const BUCH = "/buecher/ableitungen/index.html";
const K = { baby: C.babyblau, hell: C.babyblauHell, tief: C.babyblauTief, schwarz: C.nachtschwarz, gold: C.golddunkel, weiss: C.weiss };

const lazy = (lader, name) => lazyLaden(() => lader().then((m) => ({ default: m[name] })));
const Diffq = lazy(() => import("./func5.jsx"), "DifferenzenquotientSeite");
const Potenzregel = lazy(() => import("./func22.jsx"), "PotenzregelSeite");
const Ableitungstrainer = lazy(() => import("./func13.jsx"), "Ableitungstrainer");
const Plotter = lazy(() => import("./func3.jsx"), "Plotter");
const LernModul = lazy(() => import("./func3.jsx"), "LernModul");
const ZoomFilm = lazy(() => import("./funcZoomFilm.jsx"), "ZoomFilm");
const AdvancedPlotter = lazy(() => import("./func12.jsx"), "AdvancedPlotter");
const Geradengleichung = lazy(() => import("./funcGeradengleichung.jsx"), "Geradengleichung");
const ParabelTrainer = lazy(() => import("./funcParabelTrainer.jsx"), "ParabelTrainer");
const Entdecken = lazy(() => import("./funcEntdecken.jsx"), "EntdeckenSeite");
const GraphZuordnung = lazy(() => import("./func4.jsx"), "GraphZuordnung");
const RechenwegEditor = lazy(() => import("./func3.jsx"), "RechenwegEditor");

const wz = (id) => WERKZEUGE[id] || {};
const ausWz = (id, extra) => ({ titel: wz(id).name, zeile: wz(id).zeile, zeichen: wz(id).zeichen, ansicht: id, ...extra });
const wzSeite = (id) => ausWz(id, { breit: true, render: ({ gehe }) => { const S = WZ_SEITEN[id].Komp; return <S gehe={gehe} ansicht={id} />; } });
const heft = (modulId, titel, zeile) => ({ titel, zeile, zeichen: "Heft", ansicht: "training", schmal: true,
  render: ({ zu }) => <LernModul modul={MODUL_KATALOG.find((m) => m.id === modulId)} onZurueck={zu} /> });

/* Alle Werkzeuge des Kurses. ansicht = Ziel der „In der App öffnen“-Knöpfe im Buch */
export const KURS_WERKZEUGE = {
  zoomfilm: { titel: "Zoom-Film: Jede Kurve wird zur Geraden", zeile: "Animation bis 1000-fach – die Tangente taucht auf", zeichen: "1000×", ansicht: "diffkurs", breit: true, render: () => <ZoomFilm /> },
  geradenBasics: ausWz("geradengleichung", { zeile: "Steigung und Achsenabschnitt mit Reglern", breit: true, render: () => <Geradengleichung start="basics" /> }),
  diffq: { titel: "Differenzenquotient", zeile: "Sekanten ziehen, h-Methode üben", zeichen: "Δy/Δx", ansicht: "diffq", breit: true, render: () => <Diffq /> },
  grenzwert: { titel: "Ableitung als Grenzwert", zeile: "Mathe entdecken: Die Sekante wird zur Tangente", zeichen: "lim", ansicht: "entdecken", breit: true, render: () => <Entdecken start="grenzwert" /> },
  pascal: { titel: "Pascalsches Dreieck", zeile: "Mathe entdecken: Vom Zahlenmuster zur Potenzregel", zeichen: "(ⁿₖ)", ansicht: "entdecken", breit: true, render: () => <Entdecken start="praxis" /> },
  potenzregel: { titel: "Potenzregel", zeile: "Beweis, Visualisierung und Übung", zeichen: "nxⁿ⁻¹", ansicht: "potenzregel", breit: true, render: () => <Potenzregel /> },
  ableitungstrainer: ausWz("ableitungstrainer", { breit: true, render: () => <Ableitungstrainer /> }),
  graphzuordnung: { titel: "Graph-Zuordnung", zeile: "Welcher Graph ist f′?", zeichen: "f ↔ f′", ansicht: "training", schmal: true, render: ({ zu }) => <GraphZuordnung onZurueck={zu} /> },
  rechenweg: { titel: "Rechenweg schreiben", zeile: "Ganze Wege eintippen und prüfen lassen", zeichen: "⟹", ansicht: "training", schmal: true, render: ({ zu }) => <RechenwegEditor onZurueck={zu} /> },
  plotter: ausWz("kurvendiskussion", { ansicht: "plotter", breit: true, render: () => <Plotter /> }),
  advplotter: { titel: "Kurvendiskussion beliebig", zeile: "Jede Funktion ableiten und zeichnen", zeichen: "f(x)", ansicht: "advplotter", breit: true, render: () => <AdvancedPlotter /> },
  geraden: ausWz("geradengleichung", { breit: true, render: () => <Geradengleichung start="pm" /> }),
  geradenPQ: ausWz("geradengleichung", { zeile: "Gerade durch zwei Punkte – die Sekante", breit: true, render: () => <Geradengleichung start="pq" /> }),
  parabeln: ausWz("parabeln", { breit: true, render: () => <ParabelTrainer /> }),
  funktionen: wzSeite("funktionen"),
  terme: wzSeite("terme"),
  bruchterme: wzSeite("bruchterme"),
  trigonometrie: wzSeite("trigonometrie"),
  sinus: wzSeite("sinus"),
  wachstum: wzSeite("wachstum"),
  optimierung: wzSeite("optimierung"),
  steckbrief: wzSeite("steckbrief"),
  scharen: wzSeite("scharen"),
  heftSekante: heft("b02", "Arbeitsheft: Sekante und Tangente", "Baustein 02 mit Herleitung und Aufgaben"),
  heftRegeln: heft("ableitung", "Arbeitsheft: Ableitungsregeln", "Baustein 03 – das Handwerk"),
};

/* ---------- Fortschritt ---------- */
const SPEICHER = "mm_diffkurs";
const standLesen = () => { try { return { gelesen: {}, geuebt: {}, ...JSON.parse(localStorage.getItem(SPEICHER) || "{}") }; } catch (e) { return { gelesen: {}, geuebt: {} }; } };
const standSchreiben = (s) => { try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch (e) { /* egal */ } };
const fertig = (m, s) => !!s.gelesen[m.id] && (m.werkzeuge.length === 0 || !!s.geuebt[m.id]);

const nachOben = () => springe("diffkurs-modul", () => window.scrollTo({ top: 0, behavior: "auto" }));

/* ---------- Kleine Bausteine ---------- */
function Haken({ an, farbe = K.gold }) {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 11, flex: "none", alignItems: "center", justifyContent: "center",
      background: an ? farbe : "transparent", border: an ? "none" : `1.5px solid ${C.linie}` }}>
      {an && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}

function Zeichen({ text, gross }) {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: gross ? 52 : 44, height: gross ? 52 : 44, borderRadius: 12,
      background: K.schwarz, color: K.baby, fontWeight: 700, fontSize: text && text.length > 4 ? 11.5 : 15, letterSpacing: "-0.02em", fontStyle: "italic" }}>{text}</span>
  );
}

/* ---------- Kopf ---------- */
export function DiffKursKopf({ untertitel }) {
  return (
    <div style={{ background: `linear-gradient(165deg, ${K.hell} 0%, ${K.baby} 62%, ${K.tief} 100%)`, color: K.schwarz, position: "relative", overflow: "hidden" }}>
      <style>{`@media (max-width:640px){.dk-kopfbild{display:none}}`}</style>
      <svg className="dk-kopfbild" aria-hidden="true" viewBox="0 0 400 160" preserveAspectRatio="xMaxYMid slice" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "min(60%, 420px)", opacity: 0.55 }}>
        <path d="M10 140 C 120 140, 150 30, 230 40 S 340 120, 395 20" stroke={K.weiss} strokeWidth="5" fill="none" strokeLinecap="round" />
        <line x1="150" y1="72" x2="310" y2="8" stroke={K.gold} strokeWidth="3" strokeLinecap="round" />
        <circle cx="222" cy="43" r="7" fill={K.schwarz} />
      </svg>
      <div className="held mx-auto px-6 pt-10 pb-5" style={{ maxWidth: 620, position: "relative" }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.18em", color: K.gold, marginBottom: 8 }}>KURS</p>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(28px, 8vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05, color: K.schwarz, margin: 0 }}>Differentialrechnung</h1>
        <div style={{ width: 54, height: 4, background: K.gold, borderRadius: 2, marginTop: 16, marginBottom: 14 }} />
        <p style={{ color: "#1C2430", fontSize: 15, fontWeight: 400, lineHeight: 1.6, margin: 0, maxWidth: 440 }}>{untertitel}</p>
      </div>
      <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0", position: "relative" }} />
    </div>
  );
}

/* ---------- Übersicht ---------- */
function Uebersicht({ stand, oeffnen }) {
  const zahl = KURS_MODULE.filter((m) => fertig(m, stand)).length;
  const weiterMit = KURS_MODULE.find((m) => !fertig(m, stand)) || KURS_MODULE[0];
  const kapitel = ["I", "II", "III", "IV", "L"];
  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
      <div style={{ background: K.schwarz, color: K.weiss, borderRadius: 18, padding: "18px 18px 16px", marginBottom: 22, boxShadow: "0 8px 26px rgba(11,12,16,0.22)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: K.baby, margin: 0 }}>DEIN FORTSCHRITT</p>
          <p style={{ fontSize: 13, color: "#C9D2DE", margin: 0 }}><b style={{ color: K.weiss, fontSize: 18 }}>{zahl}</b> von {KURS_MODULE.length} Modulen</p>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.14)", marginTop: 10, overflow: "hidden" }} role="progressbar" aria-valuemin={0} aria-valuemax={KURS_MODULE.length} aria-valuenow={zahl}>
          <div style={{ height: "100%", width: `${(zahl / KURS_MODULE.length) * 100}%`, background: `linear-gradient(90deg, ${K.baby}, ${K.tief})`, borderRadius: 4, transition: "width .3s" }} />
        </div>
        <button type="button" onClick={() => oeffnen(weiterMit.id)}
          style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
            background: K.baby, color: K.schwarz, fontFamily: "inherit", fontWeight: 700, fontSize: 14.5, textAlign: "left" }}>
          <span>{zahl === 0 ? "Kurs starten" : "Weiter mit"}: {weiterMit.nr ? weiterMit.nr + " " : ""}{weiterMit.titel}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <p style={{ color: C.grau, fontSize: 15, lineHeight: 1.75, fontWeight: 300, margin: "0 4px 18px" }}>
        Jedes Modul ist ein Kapitel aus unserem Schulbuch: Du liest es direkt hier und trainierst darunter mit den passenden Werkzeugen.
        Ein Modul gilt als geschafft, wenn du bis zur letzten Seite gelesen und mindestens ein Werkzeug benutzt oder eine Aufgabe gelöst hast.
      </p>

      {kapitel.map((k) => (
        <section key={k} style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 4px 10px" }}>
            {k !== "L" && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: K.weiss, background: K.schwarz, padding: "4px 9px", borderRadius: 6 }}>KAPITEL {k}</span>}
            <h2 style={{ fontSize: 17, fontWeight: 700, color: K.schwarz, margin: 0 }}>{KAPITEL[k]}</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {KURS_MODULE.filter((m) => m.kap === k).map((m) => {
              const ok = fertig(m, stand);
              return (
                <button key={m.id} type="button" onClick={() => oeffnen(m.id)} className="dk-modul"
                  style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 14px", borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    background: K.weiss, border: `1px solid ${ok ? K.tief : C.linie}`, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 44, height: 44, borderRadius: 12,
                    background: m.nr ? K.baby : K.hell, color: K.schwarz, fontWeight: 800, fontSize: m.nr ? 18 : 13 }}>{m.nr || (m.id === "loes" ? "✓" : "T")}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 700, fontSize: 15.5, color: K.schwarz }}>{m.titel}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 2 }}>
                      {m.bis - m.von + 1} {m.bis === m.von ? "Seite" : "Seiten"} lesen{m.werkzeuge.length ? ` · Aufgaben, Sätze, ${m.werkzeuge.length} Werkzeuge` : ""}
                    </span>
                  </span>
                  <Haken an={ok} />
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <style>{`.dk-modul{transition:transform .15s ease, box-shadow .15s ease} @media (hover:hover){.dk-modul:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,26,51,0.10)}}`}</style>
    </div>
  );
}

/* ---------- Werkzeug-Fenster (Pop-up im Kurs) ---------- */
function WerkzeugFenster({ w, modul, gehe, schliessen }) {
  const zuKnopf = React.useRef(null);
  const zuletzt = React.useRef(typeof document !== "undefined" ? document.activeElement : null);
  const zu = React.useCallback(() => schliessen(), [schliessen]);

  React.useEffect(() => {
    const alt = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const taste = (e) => { if (e.key === "Escape") zu(); };
    window.addEventListener("keydown", taste);
    if (zuKnopf.current) zuKnopf.current.focus({ preventScroll: true });
    const vorher = zuletzt.current;
    return () => {
      document.body.style.overflow = alt;
      window.removeEventListener("keydown", taste);
      if (vorher && vorher.focus) { try { vorher.focus({ preventScroll: true }); } catch (e) { /* egal */ } }
    };
  }, [zu]);

  return (
    <div className="dk-fenster-hintergrund" onMouseDown={(e) => { if (e.target === e.currentTarget) zu(); }}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,12,16,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box" }}>
      <style>{`@media (max-width:640px){.dk-fenster-hintergrund{padding:0 !important;align-items:flex-end !important}.dk-fenster{max-height:94dvh !important;border-radius:20px 20px 0 0 !important;width:100% !important}}
        @keyframes dkEin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .dk-fenster{animation:dkEin .18s ease-out}
        @media (prefers-reduced-motion:reduce){.dk-fenster{animation:none}}`}</style>
      <div className="dk-fenster" role="dialog" aria-modal="true" aria-label={w.titel}
        style={{ width: "min(100%, 880px)", maxHeight: "calc(100dvh - 24px)", display: "flex", flexDirection: "column", borderRadius: 20,
          border: `2px solid ${K.baby}`, background: C.sand, overflow: "hidden", boxShadow: "0 24px 70px rgba(11,12,16,0.45)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: K.schwarz, color: K.weiss, flex: "none" }}>
          <Zeichen text={w.zeichen} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", color: K.baby, margin: 0 }}>TRAINING · MODUL {modul.nr || modul.titel}</p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.titel}</p>
          </div>
          <button ref={zuKnopf} type="button" onClick={zu} aria-label="Werkzeug schließen"
            style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: K.weiss, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: w.schmal ? "8px 0 24px" : "4px 0 24px" }}>
          <ChunkGrenze>
            <React.Suspense fallback={<Laden />}>
              {w.schmal ? (
                <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 16 }}>{w.render({ gehe, zu })}</div>
              ) : w.render({ gehe, zu })}
            </React.Suspense>
          </ChunkGrenze>
        </div>
      </div>
    </div>
  );
}

/* ---------- Modul ---------- */
function Modul({ modul, stand, setStand, oeffnen, zurUebersicht, gehe }) {
  const [offen, setOffen] = React.useState(null);
  const [seite, setSeite] = React.useState(modul.von);
  const [zwei, setZwei] = React.useState(() => { try { return modul.bis > modul.von && localStorage.getItem("matheplus-buch-zwei") === "1"; } catch (e) { return false; } });
  const [handy, setHandy] = React.useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 839px)").matches);
  React.useEffect(() => {
    const m = window.matchMedia("(max-width: 839px)");
    const f = () => setHandy(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  const zweiEff = zwei && !handy;
  const zweiStart = React.useRef(zweiEff);
  const rahmen = React.useRef(null);
  const i = KURS_MODULE.indexOf(modul);
  const naechstes = KURS_MODULE[i + 1], voriges = KURS_MODULE[i - 1];
  const seitenZahl = modul.bis - modul.von + 1;

  const merken = (art) => setStand((s) => {
    if (s[art][modul.id]) return s;
    const neu = { ...s, [art]: { ...s[art], [modul.id]: true } };
    standSchreiben(neu);
    return neu;
  });

  /* Das Werkzeug öffnet sich als Fenster (Pop-up) über dem Kurs – die Seite scrollt nicht,
     der Kurs wird nicht verlassen. Schließen: ×, Esc oder Klick neben das Fenster. */
  const werkzeugOeffnen = (id) => {
    setOffen(id);
    merken("geuebt");
  };

  React.useEffect(() => {
    const hoeren = (e) => {
      if (e.origin !== window.location.origin || !e.data) return;
      if (e.data.typ === "mm-schulbuch-seite" && e.data.von === modul.von) {
        setSeite(e.data.seite);
        if (e.data.ende) merken("gelesen");
      }
      if (e.data.typ === "mm-gehe" && e.data.ziel) {
        const passend = modul.werkzeuge.find((id) => KURS_WERKZEUGE[id].ansicht === e.data.ziel.ansicht);
        if (passend) werkzeugOeffnen(passend); else gehe(e.data.ziel);
      }
    };
    window.addEventListener("message", hoeren);
    return () => window.removeEventListener("message", hoeren);
  });

  React.useEffect(() => {
    const f = rahmen.current && rahmen.current.contentWindow;
    if (f) f.postMessage({ typ: "mm-schulbuch-modus", zwei: zweiEff }, window.location.origin);
  }, [zweiEff]);
  const hoechste = zweiEff ? modul.bis - 1 : modul.bis;
  const umschalten = () => {
    const z = !zwei;
    setZwei(z);
    try { localStorage.setItem("matheplus-buch-zwei", z ? "1" : "0"); } catch (e) { /* egal */ }
    if (z && seite >= modul.bis) setSeite(modul.bis - 1);
    const f = rahmen.current && rahmen.current.contentWindow;
    if (f) f.postMessage({ typ: "mm-schulbuch-modus", zwei: z }, window.location.origin);
  };
  const blaettern = (d) => {
    const neu = Math.max(modul.von, Math.min(hoechste, seite + d));
    if (neu === seite) return;
    setSeite(neu);
    const f = rahmen.current && rahmen.current.contentWindow;
    if (f) f.postMessage({ typ: "mm-schulbuch-zeige", seite: neu, richtung: d }, window.location.origin);
  };
  const nr = seite - modul.von + 1;
  const anzeige = zweiEff
    ? (seitenZahl === 2 ? "Seite 1 und 2" : `Seite ${nr} und ${nr + 1} von ${seitenZahl}`)
    : `Seite ${nr} von ${seitenZahl}`;
  const pfeil = (richtung, aus) => (
    <button type="button" onClick={() => blaettern(richtung)} disabled={aus} className="dk-pfeil"
      aria-label={richtung < 0 ? "Vorherige Buchseite" : "Nächste Buchseite"}
      style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${aus ? C.linie : K.schwarz}`, background: aus ? K.weiss : K.schwarz, color: aus ? C.grau : K.weiss,
        opacity: aus ? 0.45 : 1, cursor: aus ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={richtung < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
  const w = offen ? KURS_WERKZEUGE[offen] : null;

  return (
    <div className="dk-seite">
      <style>{`.dk-nav-unten{display:none}
        @media (max-width:839px){.dk-nav-unten{display:flex}.dk-nav-oben,.dk-zwei{display:none !important}}
        .dk-seite{width:100%;max-width:620px;margin:0 auto;padding:0 20px 64px 18px;box-sizing:border-box}
        @media (min-width:840px){.dk-seite{width:735px;max-width:735px;margin-left:calc(50% - 355px);margin-right:0;padding:0 0 64px}}`}</style>
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
          <p style={{ minWidth: 0, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", lineHeight: 1.5, color: K.gold, margin: "2px 0 0" }}>
            {modul.kap === "L" ? "ANHANG" : (
              <>
                <span style={{ display: "block", whiteSpace: "nowrap" }}>KAPITEL {modul.kap}</span>
                <span style={{ display: "block", whiteSpace: "nowrap" }}>MODUL {i + 1} VON {KURS_MODULE.length}</span>
              </>
            )}
          </p>
          <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8 }}>
            <button type="button" onClick={zurUebersicht}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px 8px 8px", borderRadius: 10, border: `1px solid ${C.linie}`, background: K.weiss,
                color: K.schwarz, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <span aria-hidden="true">←</span> Alle Module
            </button>
            {seitenZahl > 1 && (
              <button type="button" onClick={umschalten} aria-pressed={zwei} className="dk-zwei"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "8px 12px", borderRadius: 10, border: `1px solid ${zwei ? K.gold : C.linie}`, background: zwei ? K.hell : K.weiss,
                  color: K.schwarz, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><rect x="3" y="4" width="8" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="13" y="4" width="8" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                {zwei ? "Eine Seite" : "Zwei Seiten"}
              </button>
            )}
          </div>
        </div>
        <h2 style={{ width: "100%", fontSize: "clamp(23px, 6.4vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: K.schwarz, margin: "10px 0 0" }}>
          {modul.nr ? `${modul.nr} ` : ""}{modul.titel}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px 14px", flexWrap: "wrap", margin: "8px 0 14px" }}>
          <p style={{ flex: "1 1 240px", minWidth: 0, fontSize: 15.5, fontStyle: "italic", color: "#2B3A4F", margin: 0 }}>{modul.frage}</p>
          {seitenZahl > 1 && (
            <div className="dk-nav-oben" style={{ display: "inline-flex", alignItems: "center", gap: 10, flex: "none" }} role="group" aria-label="Buchseiten blättern">
              {pfeil(-1, nr <= 1)}
              <span aria-live="polite" style={{ fontSize: 13.5, fontWeight: 700, color: K.schwarz, minWidth: 74, textAlign: "center", whiteSpace: "nowrap" }}>{anzeige}</span>
              {pfeil(1, seite >= hoechste)}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "#fff", aspectRatio: zweiEff ? "1588 / 1123" : "794 / 1123", width: "100%" }}>
        <iframe key={modul.id} ref={rahmen} title={`Kapitel ${modul.titel} lesen`} src={`${BUCH}?von=${modul.von}&bis=${modul.bis}&voll=${zweiStart.current ? 2 : 1}`}
          style={{ display: "block", width: "100%", height: "100%", border: 0 }} />
      </div>

      {seitenZahl > 1 && (
        <div className="dk-nav-unten" style={{ justifyContent: "flex-end", margin: "12px 0 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }} role="group" aria-label="Buchseiten blättern">
            {pfeil(-1, nr <= 1)}
            <span aria-live="polite" style={{ fontSize: 13.5, fontWeight: 700, color: K.schwarz, minWidth: 74, textAlign: "center", whiteSpace: "nowrap" }}>{anzeige}</span>
            {pfeil(1, seite >= hoechste)}
          </div>
        </div>
      )}

      {modul.kap !== "L" && (
        <KursTraining modul={modul} geuebt={!!stand.geuebt[modul.id]} onGeuebt={() => merken("geuebt")} werkzeuge={(
          <>
            <KartenStil />
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
              {modul.werkzeuge.map((id) => (
                <WerkzeugKarte key={id} id={id} t={KURS_WERKZEUGE[id]} an={offen === id} oeffnen={werkzeugOeffnen} schliessen={() => setOffen(null)} Zeichen={Zeichen} />
              ))}
            </div>
          </>
        )} />
      )}

      {w && (
        <WerkzeugFenster key={offen} w={w} modul={modul} gehe={gehe} schliessen={() => setOffen(null)} />
      )}

      <div style={{ margin: "30px 0 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        {voriges && (
          <button type="button" onClick={() => oeffnen(voriges.id)}
            style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 14, border: `1px solid ${C.linie}`, background: K.weiss, color: K.schwarz, fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
            <span style={{ display: "block", fontSize: 11.5, color: C.grau, fontWeight: 600 }}>← Vorheriges Modul</span>{voriges.titel}
          </button>
        )}
        {naechstes && (
          <button type="button" onClick={() => oeffnen(naechstes.id)}
            style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 14, border: "none", background: K.schwarz, color: K.weiss, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "right" }}>
            <span style={{ display: "block", fontSize: 11.5, color: K.baby, fontWeight: 600 }}>Nächstes Modul →</span>{naechstes.titel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Seite ---------- */
export function DiffKursSeite({ gehe }) {
  const [stand, setStand] = React.useState(stand0);
  const [modulId, setModulId] = React.useState(null);
  const modul = KURS_MODULE.find((m) => m.id === modulId);
  const oeffnen = (id) => { setModulId(id); nachOben(); };
  const zurUebersicht = () => { setModulId(null); nachOben(); };
  return (
    <>
      <DiffKursKopf untertitel={modul ? `${KURS_MODULE.length} Module · Kapitel lesen, dann trainieren` : "Von der Geraden bis zur Kettenregel – jedes Kapitel lesen und direkt darunter trainieren."} />
      {modul
        ? <Modul key={modul.id} modul={modul} stand={stand} setStand={setStand} oeffnen={oeffnen} zurUebersicht={zurUebersicht} gehe={gehe} />
        : <Uebersicht stand={stand} oeffnen={oeffnen} />}
    </>
  );
}
function stand0() { return standLesen(); }
