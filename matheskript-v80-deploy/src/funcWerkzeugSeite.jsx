/* ============================================================
   WERKZEUGSEITE – Kopfbereich und Rahmen aller Werkzeugseiten
   Früher stand in func10.jsx für jede Werkzeugseite derselbe
   Kopfbereich (blauer Verlauf, silberner Titel, goldener Strich,
   Sektionsmenü) als eigene Kopie. Jetzt:
     • SeitenKopf    – der Kopfbereich, einmal definiert
     • WZ_SEITEN     – Tabelle Ansicht → Titel + nachgeladene Komponente
     • WerkzeugSeite – Kopf + Komponente für eine Ansicht aus WZ_SEITEN
   Jede Komponente in WZ_SEITEN wird per React.lazy erst beim Öffnen
   geladen und landet in einem eigenen Chunk (Code-Splitting).
   Ein neues Werkzeug braucht nur: Eintrag in werkzeuge.js + Zeile hier.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";

const GOLDSTRICH = { width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 };

/* Gerader Abschluss des Kopfbereichs (früher eine Welle) */
export const Welle = () => <div aria-hidden="true" className="held-welle" style={{ height: 22 }} />;

/* Kopfbereich: groesse = font-size des Titels, rund = Abschluss mit runden Ecken (kopfblock) */
export function SeitenKopf({ titel, groesse = "clamp(24px, 7vw, 34px)", rund = false, children }) {
  return (
    <div className={rund ? "kopfblock" : undefined} style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
      <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
        <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: groesse, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{titel}</h1>
        <div style={GOLDSTRICH} />
        {children}
      </div>
      {rund ? <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} /> : <Welle />}
    </div>
  );
}

/* Grauer Untertitel unter dem goldenen Strich */
export const KopfText = ({ children, farbe = "#C9D6EE" }) => (
  <p style={{ color: farbe, fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>{children}</p>
);

export function Laden({ rand = "24px" }) {
  return <p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: rand, textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>;
}

const lazy = (lader, name) => React.lazy(() => lader().then((m) => ({ default: m[name] })));

/* Ansicht → { titel, groesse, rund, Komp } */
export const WZ_SEITEN = {
  ebenen: { titel: "Ebenen-Visualizer", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func16.jsx"), "EbenenVisualizer") },
  ebenevsebene: { titel: "Ebene vs. Ebene", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func19.jsx"), "EbeneVsEbene") },
  kreuzprodukt: { titel: "Kreuzprodukt", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func19.jsx"), "KreuzproduktRechner") },
  vektorgenerator: { titel: "Rechnen mit Vektoren", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func20.jsx"), "VektorGenerator") },
  zweipunkte: { titel: "Zwei Punkte – eine Gerade", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./func23.jsx"), "ZweiPunkteGerade") },
  dreipunkte: { titel: "Drei Punkte – eine Ebene", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./func23.jsx"), "DreiPunkteEbene") },
  abstaende: { titel: "Abstände", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./func24.jsx"), "Abstaende") },
  geraden: { titel: "Geraden im Raum", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcGeraden.jsx"), "GeradenImRaum") },
  winkel: { titel: "Winkel und Skalarprodukt", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcGeraden.jsx"), "WinkelSkalarprodukt") },
  vektoren: { titel: "Vektoren", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func16.jsx"), "VektorenZentrum") },
  bernoulli: { titel: "Bernoulli-Kette", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func17.jsx"), "BernoulliBingo") },
  vierfelder: { titel: "Vier-Felder-Tafel", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func18.jsx"), "Vierfeldertafel") },
  erwartungswert: { titel: "Erwartungswert und faire Spiele", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcErwartung.jsx"), "ErwartungswertSpiele") },
  kombinatorik: { titel: "Urnen und Kombinatorik", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcKombinatorik.jsx"), "UrnenKombinatorik") },
  hypothesentest: { titel: "Hypothesentests", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcHypothesentest.jsx"), "Hypothesentests") },
  stochastik: { titel: "Stochastik", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func17.jsx"), "StochastikZentrum") },
  sinus: { titel: "Sinusfunktion", groesse: "clamp(28px, 8vw, 34px)", Komp: lazy(() => import("./func21.jsx"), "Sinusfunktion") },
  steckbrief: { titel: "Steckbriefaufgaben", groesse: "clamp(26px, 7.6vw, 33px)", Komp: lazy(() => import("./funcSteckbrief.jsx"), "Steckbriefaufgaben") },
  integrale: { titel: "Integrale", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./func25.jsx"), "Integrale") },
  optimierung: { titel: "Optimierungswerkstatt", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcOptimierung.jsx"), "Optimierungswerkstatt") },
  wachstum: { titel: "Wachstum und Logarithmen", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcWachstum.jsx"), "WachstumLogarithmen") },
  parabeln: { titel: "Parabeln", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcParabeln.jsx"), "Parabeln") },
  scharen: { titel: "Funktionsscharen", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcScharen.jsx"), "Funktionsscharen") },
  gleichverstehen: { titel: "Gleichungen lösen", groesse: "clamp(26px, 7.6vw, 34px)", rund: true, Komp: lazy(() => import("./funcGleichModi.jsx"), "GleichungenVerstehen") },
  /* Geometrie (Mittelstufe) */
  winkelsaetze: { titel: "Winkel und Winkelsummen", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcWinkelsaetze.jsx"), "Winkelsaetze") },
  konstruktion: { titel: "Besondere Linien im Dreieck", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcKonstruktion.jsx"), "Konstruktionen") },
  kathetensatz: { titel: "Kathetensatz und Höhensatz", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcKathetensatz.jsx"), "Kathetensatz") },
  kreis: { titel: "Kreis und Kreisteile", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcKreis.jsx"), "KreisUndKreisteile") },
  koerper: { titel: "Körper", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcKoerper.jsx"), "KoerperVolumen") },
  kongruenz: { titel: "Kongruenzsätze", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcKongruenz.jsx"), "Kongruenzsaetze") },
  thales: { titel: "Satz des Thales", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcThales.jsx"), "SatzDesThales") },
  pythagoras: { titel: "Satz des Pythagoras", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcPythagorasWz.jsx"), "SatzDesPythagoras") },
  /* Bruchrechnen (Mittelstufe) */
  bruchrechnen: { titel: "Brüche rechnen", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcBruchrechnen.jsx"), "Bruchrechnen") },
  bruchterme: { titel: "Bruchterme", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcBruchterme.jsx"), "Bruchterme") },
  strahlensaetze: { titel: "Strahlensätze", groesse: "clamp(26px, 7.6vw, 34px)", Komp: lazy(() => import("./funcStrahlensaetze.jsx"), "Strahlensaetze") },
  trigonometrie: { titel: "Trigonometrie am Dreieck", groesse: "clamp(24px, 7vw, 34px)", Komp: lazy(() => import("./funcTrigonometrie.jsx"), "TrigonometrieDreieck") },
  terme: { titel: "Terme und Potenzgesetze", groesse: "clamp(26px, 7.6vw, 34px)", rund: true, Komp: lazy(() => import("./funcTerme.jsx"), "TermeUndPotenzgesetze") },
};

export const istWzSeite = (ansicht) => Object.prototype.hasOwnProperty.call(WZ_SEITEN, ansicht);

/* menue = das Sektionsmenü aus func10 (braucht dort den Zustand des Werkzeug-Menüs) */
export function WerkzeugSeite({ ansicht, gehe, menue }) {
  const s = WZ_SEITEN[ansicht];
  if (!s) return null;
  const { Komp } = s;
  return (
    <>
      <SeitenKopf titel={s.titel} groesse={s.groesse} rund={s.rund}>{menue}</SeitenKopf>
      <React.Suspense fallback={<Laden />}>
        <Komp gehe={gehe} ansicht={ansicht} />
      </React.Suspense>
    </>
  );
}
