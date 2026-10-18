/* ============================================================
   KURS DIFFERENTIALRECHNUNG (ansicht "diffkurs", Pfad /differentialrechnung)
   Ein Modul je Kapitel des Schulbuchs „Ableitungen“:
     1. das Kapitel zum Lesen (Lesefunktion des Buchs, nur die Seiten
        dieses Kapitels: /buecher/ableitungen/index.html?von=…&bis=…)
     2. darunter alle Trainingswerkzeuge zu diesem Kapitel – sie öffnen
        sich direkt im Modul, man verlässt den Kurs nicht.
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

const BUCH = "/buecher/ableitungen/index.html";
const K = { baby: C.babyblau, hell: C.babyblauHell, tief: C.babyblauTief, schwarz: C.nachtschwarz, gold: C.golddunkel, weiss: C.weiss };

const lazy = (lader, name) => lazyLaden(() => lader().then((m) => ({ default: m[name] })));
const Diffq = lazy(() => import("./func5.jsx"), "DifferenzenquotientSeite");
const Potenzregel = lazy(() => import("./func22.jsx"), "PotenzregelSeite");
const Ableitungstrainer = lazy(() => import("./func13.jsx"), "Ableitungstrainer");
const Plotter = lazy(() => import("./func3.jsx"), "Plotter");
const LernModul = lazy(() => import("./func3.jsx"), "LernModul");
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

/* Ein Modul je Kapitel des Buchs. von/bis = Buchseiten */
export const KURS_MODULE = [
  { id: "m1", kap: "I", nr: "1", titel: "Mittlere Änderungsrate", frage: "Wie schnell ändert sich etwas – im Durchschnitt?", von: 3, bis: 5,
    werkzeuge: ["diffq", "geradenPQ", "funktionen"] },
  { id: "m2", kap: "I", nr: "2", titel: "Von der Sekante zur Tangente", frage: "Wie steil ist ein Graph in einem einzigen Punkt?", von: 6, bis: 7,
    werkzeuge: ["diffq", "grenzwert", "heftSekante"] },
  { id: "m3", kap: "I", nr: "3", titel: "Die Ableitungsfunktion", frage: "Kann man die Steigung an allen Stellen auf einmal berechnen?", von: 8, bis: 9,
    werkzeuge: ["grenzwert", "graphzuordnung", "ableitungstrainer", "plotter"] },
  { id: "t1", kap: "I", nr: "", titel: "Training I", frage: "Alles klar? Prüfe dich, bevor es mit den Regeln weitergeht.", von: 10, bis: 10,
    werkzeuge: ["graphzuordnung", "diffq", "ableitungstrainer"] },
  { id: "m4", kap: "II", nr: "4", titel: "Faktorregel", frage: "Was passiert mit der Steigung, wenn man einen Graphen streckt?", von: 11, bis: 13,
    werkzeuge: ["ableitungstrainer", "heftRegeln", "terme"] },
  { id: "m5", kap: "II", nr: "5", titel: "Summenregel", frage: "Darf man eine Summe Stück für Stück ableiten?", von: 14, bis: 15,
    werkzeuge: ["ableitungstrainer", "parabeln", "heftRegeln", "plotter"] },
  { id: "m6", kap: "II", nr: "6", titel: "Produktregel", frage: "Wie leitet man ein Produkt ab?", von: 16, bis: 17,
    werkzeuge: ["ableitungstrainer", "heftRegeln", "terme"] },
  { id: "m7", kap: "II", nr: "7", titel: "Potenzregel", frage: "Gibt es ein Muster hinter x², x³, x⁴, …?", von: 18, bis: 19,
    werkzeuge: ["potenzregel", "pascal", "ableitungstrainer", "heftRegeln"] },
  { id: "m8", kap: "II", nr: "8", titel: "Quotientenregel", frage: "Wie leitet man einen Bruch ab, in dessen Nenner x steht?", von: 20, bis: 21,
    werkzeuge: ["ableitungstrainer", "bruchterme", "advplotter"] },
  { id: "m9", kap: "II", nr: "9", titel: "Kettenregel", frage: "Wie leitet man eine Funktion ab, in der eine andere steckt?", von: 22, bis: 23,
    werkzeuge: ["ableitungstrainer", "funktionen", "advplotter"] },
  { id: "m10", kap: "II", nr: "10", titel: "Sinus, Kosinus, eˣ und ln x", frage: "Gibt es Funktionen, die ihre eigene Ableitung sind?", von: 24, bis: 25,
    werkzeuge: ["ableitungstrainer", "trigonometrie", "sinus", "wachstum"] },
  { id: "t2", kap: "II", nr: "", titel: "Training II", frage: "Alle Regeln gemischt – so wie in der Klausur.", von: 26, bis: 26,
    werkzeuge: ["ableitungstrainer", "rechenweg", "advplotter"] },
  { id: "m11", kap: "III", nr: "11", titel: "Tangente und Normale", frage: "Wie lautet die Gleichung der Geraden, die einen Graphen berührt?", von: 27, bis: 29,
    werkzeuge: ["geraden", "plotter", "ableitungstrainer"] },
  { id: "m12", kap: "III", nr: "12", titel: "Vermischte Übungen", frage: "Alles zusammen – bis zum Abiturniveau.", von: 30, bis: 31,
    werkzeuge: ["plotter", "steckbrief", "scharen", "optimierung"] },
  { id: "loes", kap: "L", nr: "", titel: "Lösungen", frage: "Alle Lösungen zum Nachschlagen und Vergleichen.", von: 32, bis: 34, werkzeuge: [] },
];

export const KAPITEL = { I: "Die Ableitung", II: "Ableitungsregeln", III: "Anwenden und Üben", L: "Anhang" };

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
  const kapitel = ["I", "II", "III", "L"];
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
        Ein Modul gilt als geschafft, wenn du bis zur letzten Seite gelesen und mindestens ein Werkzeug benutzt hast.
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
                      {m.bis - m.von + 1} {m.bis === m.von ? "Seite" : "Seiten"} lesen{m.werkzeuge.length ? ` · ${m.werkzeuge.length} Trainingswerkzeuge` : ""}
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

/* ---------- Modul ---------- */
function Modul({ modul, stand, setStand, oeffnen, zurUebersicht, gehe }) {
  const [offen, setOffen] = React.useState(null);
  const rahmen = React.useRef(null);
  const werkzeugBereich = React.useRef(null);
  const i = KURS_MODULE.indexOf(modul);
  const naechstes = KURS_MODULE[i + 1], voriges = KURS_MODULE[i - 1];
  const seitenZahl = modul.bis - modul.von + 1;

  const merken = (art) => setStand((s) => {
    if (s[art][modul.id]) return s;
    const neu = { ...s, [art]: { ...s[art], [modul.id]: true } };
    standSchreiben(neu);
    return neu;
  });

  const werkzeugOeffnen = (id) => {
    setOffen(id);
    merken("geuebt");
    springe("diffkurs-werkzeug", () => werkzeugBereich.current && werkzeugBereich.current.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  React.useEffect(() => {
    const hoeren = (e) => {
      if (e.origin !== window.location.origin || !e.data) return;
      if (e.data.typ === "mm-schulbuch-seite" && e.data.von === modul.von && e.data.ende) merken("gelesen");
      if (e.data.typ === "mm-gehe" && e.data.ziel) {
        const passend = modul.werkzeuge.find((id) => KURS_WERKZEUGE[id].ansicht === e.data.ziel.ansicht);
        if (passend) werkzeugOeffnen(passend); else gehe(e.data.ziel);
      }
    };
    window.addEventListener("message", hoeren);
    return () => window.removeEventListener("message", hoeren);
  });

  const hoehe = seitenZahl === 1
    ? "min(86vh, 900px, calc((100vw - 34px) * 1.414 + 60px))"
    : "min(86vh, 900px, calc((100vw - 34px) * 1.414 + 104px))";
  const w = offen ? KURS_WERKZEUGE[offen] : null;

  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 1180 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button type="button" onClick={zurUebersicht}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px 8px 8px", marginBottom: 14, borderRadius: 10, border: `1px solid ${C.linie}`, background: K.weiss,
            color: K.schwarz, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          <span aria-hidden="true">←</span> Alle Module
        </button>
        <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", color: K.gold, margin: "0 0 4px" }}>
          {modul.kap === "L" ? "ANHANG" : `KAPITEL ${modul.kap} · MODUL ${i + 1} VON ${KURS_MODULE.length}`}
        </p>
        <h2 style={{ fontSize: "clamp(23px, 6.4vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: K.schwarz, margin: 0 }}>
          {modul.nr ? `${modul.nr} ` : ""}{modul.titel}
        </h2>
        <p style={{ fontSize: 15.5, fontStyle: "italic", color: "#2B3A4F", margin: "8px 0 18px" }}>{modul.frage}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: K.schwarz, background: K.baby, padding: "5px 10px", borderRadius: 7 }}>1 · LESEN</span>
          <span style={{ fontSize: 13, color: C.grau }}>Buchseite {modul.von}{modul.bis > modul.von ? `–${modul.bis}` : ""}</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.grau }}><Haken an={!!stand.gelesen[modul.id]} />gelesen</span>
        </div>
      </div>

      <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 22px rgba(11,12,16,0.12)", background: "#E4E9F2", border: `1px solid ${K.baby}` }}>
        <iframe key={modul.id} ref={rahmen} title={`Kapitel ${modul.titel} lesen`} src={`${BUCH}?von=${modul.von}&bis=${modul.bis}`}
          style={{ display: "block", width: "100%", height: hoehe, minHeight: 380, border: 0 }} />
      </div>

      {modul.werkzeuge.length > 0 && (
        <div style={{ maxWidth: 760, margin: "30px auto 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: K.weiss, background: K.schwarz, padding: "5px 10px", borderRadius: 7 }}>2 · TRAINIEREN</span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.grau }}><Haken an={!!stand.geuebt[modul.id]} />geübt</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: K.schwarz, margin: "8px 0 4px" }}>Werkzeuge zu diesem Kapitel</h3>
          <p style={{ fontSize: 14, color: C.grau, margin: "0 0 14px", lineHeight: 1.6 }}>Tippe auf ein Werkzeug – es öffnet sich direkt hier im Modul.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 330px), 1fr))", gap: 10 }}>
            {modul.werkzeuge.map((id) => {
              const t = KURS_WERKZEUGE[id];
              const an = offen === id;
              return (
                <button key={id} type="button" onClick={() => (an ? setOffen(null) : werkzeugOeffnen(id))} aria-expanded={an} className="dk-wz"
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderRadius: 14, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    background: an ? K.hell : K.weiss, border: `1.5px solid ${an ? K.gold : C.linie}`, boxShadow: "0 2px 12px rgba(15,26,51,0.05)" }}>
                  <Zeichen text={t.zeichen} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 700, fontSize: 14.5, color: K.schwarz }}>{t.titel}</span>
                    <span style={{ display: "block", fontSize: 12.5, color: C.grau, marginTop: 2, lineHeight: 1.35 }}>{t.zeile}</span>
                  </span>
                  <span aria-hidden="true" style={{ fontSize: 13, fontWeight: 700, color: K.gold, whiteSpace: "nowrap" }}>{an ? "Schließen" : "Öffnen"}</span>
                </button>
              );
            })}
          </div>
          <style>{`.dk-wz{transition:transform .15s ease, border-color .15s} @media (hover:hover){.dk-wz:hover{transform:translateY(-1px)}}`}</style>
        </div>
      )}

      <div ref={werkzeugBereich} style={{ scrollMarginTop: 16 }}>
        {w && (
          <div style={{ marginTop: 18, borderRadius: 20, border: `2px solid ${K.baby}`, background: C.sand, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: K.schwarz, color: K.weiss }}>
              <Zeichen text={w.zeichen} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", color: K.baby, margin: 0 }}>TRAINING · MODUL {modul.nr || modul.titel}</p>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.titel}</p>
              </div>
              <button type="button" onClick={() => setOffen(null)} aria-label="Werkzeug schließen"
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: K.weiss, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: w.schmal ? "8px 0 24px" : "4px 0 24px" }}>
              <ChunkGrenze key={offen}>
                <React.Suspense fallback={<Laden />}>
                  {w.schmal ? (
                    <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 16 }}>{w.render({ gehe, zu: () => setOffen(null) })}</div>
                  ) : w.render({ gehe, zu: () => setOffen(null) })}
                </React.Suspense>
              </ChunkGrenze>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 760, margin: "30px auto 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
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
      <DiffKursKopf untertitel={modul ? `${KURS_MODULE.length} Module · Kapitel lesen, dann trainieren` : "Vom Differenzenquotienten bis zur Kettenregel – jedes Kapitel lesen und direkt darunter trainieren."} />
      {modul
        ? <Modul key={modul.id} modul={modul} stand={stand} setStand={setStand} oeffnen={oeffnen} zurUebersicht={zurUebersicht} gehe={gehe} />
        : <Uebersicht stand={stand} oeffnen={oeffnen} />}
    </>
  );
}
function stand0() { return standLesen(); }
