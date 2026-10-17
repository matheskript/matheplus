import { mitMathildaAI } from "./mathildaName.jsx";
import React, { useState, useRef, useEffect } from "react";
import { API_URL, C, REGELN, VIDEO_URL, blattPrompt } from "./base1.jsx";
import { KOMP } from "./base3.jsx";
import { NAV, SCHULKLASSEN, kiKopf, kiAntwort } from "./base4.jsx";
import { dekodieren, jsonLesen, rendern } from "./func1.jsx";
import { Startseite, ToolMenue, istToolMenueSeite, werkzeugMerken } from "./func2.jsx";
import { WerkzeugLeiste, KompaktKopf } from "./funcWerkzeuge.jsx";
import { wo } from "./werkzeuge.js";
import { hinweisVerwerfen } from "./uebergabe.js";
import { FR } from "./funcRegistry.jsx";
import { AufklappStil, AufklappZeichen, aufklappScrollStarten } from "./aufklappen.jsx";
import { Text, Zeile } from "./func3.jsx";
import { Klausur, Kurvendiskussion } from "./func4.jsx";
import { Fortschritt, Kopfrechnen } from "./func5.jsx";
import { Einstufung, Lernlandkarte, Liniennetz, Profil, lernLaden, lernLeer, lernSnapshot, lernVomKonto, useLern } from "./func6.jsx";
import { syncStarten } from "./lernSync.js";
import { entdeckenSyncStarten } from "./entdeckenSync.js";
import { LernpfadSeite } from "./funcLernpfad.jsx";
import { MathildaChatSeite } from "./funcMathildaChat.jsx";
import { mathildaSystem } from "./mathildaKontext.js";
import { Operatoren, Wiederholen } from "./func7.jsx";
import { Messbericht, Modellieren, Probeabitur, Wochenbericht } from "./func8.jsx";
import { Auswertung, Einwilligung, einwilligungLesen } from "./func9.jsx";
import { TrainingFortschritt, PruefungsLink } from "./funcTraining.jsx";
import { Fusszeile } from "./funcRecht.jsx";
import { FeedbackKnopf } from "./funcFeedback.jsx";
import { MatheTastaturHost } from "./matheTastatur.jsx";
import { LAENDER } from "./funcWettbewerbe.jsx";
import { ENTWUERFE, istEntwurf, LANDING } from "./seitenKonstanten.js";
const EntwurfTor = React.lazy(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfTor })));
const Landingpage = React.lazy(() => import("./funcLandingpage.jsx").then((m) => ({ default: m.Landingpage })));
import { Laden, SeitenKopf, WerkzeugSeite, istWzSeite } from "./funcWerkzeugSeite.jsx";
/* Seiten werden erst beim Öffnen nachgeladen (je eigener Chunk) */
const ElternkursSeite = React.lazy(() => import("./funcElternkurs.jsx").then((m) => ({ default: m.ElternkursSeite })));
const NachhilfekursSeite = React.lazy(() => import("./funcNachhilfekurs.jsx").then((m) => ({ default: m.NachhilfekursSeite })));
const EntdeckenSeite = React.lazy(() => import("./funcEntdecken.jsx").then((m) => ({ default: m.EntdeckenSeite })));
const PenPaperKursSeite = React.lazy(() => import("./funcPenPaperKurs.jsx").then((m) => ({ default: m.PenPaperKursSeite })));
const KontoSeite = React.lazy(() => import("./funcKonto.jsx").then((m) => ({ default: m.KontoSeite })));
const ImpressumSeite = React.lazy(() => import("./funcRecht.jsx").then((m) => ({ default: m.ImpressumSeite })));
const AGBSeite = React.lazy(() => import("./funcRecht.jsx").then((m) => ({ default: m.AGBSeite })));
const WiderrufSeite = React.lazy(() => import("./funcRecht.jsx").then((m) => ({ default: m.WiderrufSeite })));
const ElternabendSeite = React.lazy(() => import("./funcElternabend.jsx").then((m) => ({ default: m.ElternabendSeite })));
const BundeswettbewerbSeite = React.lazy(() => import("./funcWettbewerbe.jsx").then((m) => ({ default: m.BundeswettbewerbSeite })));
const LandeswettbewerbeSeite = React.lazy(() => import("./funcWettbewerbe.jsx").then((m) => ({ default: m.LandeswettbewerbeSeite })));
const LandeswettbewerbSeite = React.lazy(() => import("./funcWettbewerbe.jsx").then((m) => ({ default: m.LandeswettbewerbSeite })));
const MasterclassSeite = React.lazy(() => import("./funcMasterclass.jsx").then((m) => ({ default: m.MasterclassSeite })));
const MatheCheckenSeite = React.lazy(() => import("./funcMasterclass.jsx").then((m) => ({ default: m.MatheCheckenSeite })));
const EntwurfVorher = React.lazy(() => import("./funcVorher.jsx").then((m) => ({ default: m.EntwurfVorher })));
const EntwurfWerkzeuge = React.lazy(() => import("./funcStartArchiv.jsx").then((m) => ({ default: m.EntwurfWerkzeuge })));
const EbbinghausSeite = React.lazy(() => import("./funcEbbinghaus.jsx").then((m) => ({ default: m.EbbinghausSeite })));
const AbiKettenSeite = React.lazy(() => import("./funcAbiKetten.jsx").then((m) => ({ default: m.AbiKettenSeite })));
const MeinTrainingSeite = React.lazy(() => import("./funcMeinTraining.jsx").then((m) => ({ default: m.MeinTrainingSeite })));
const Ableitungstrainer = React.lazy(() => import("./func13.jsx").then((m) => ({ default: m.Ableitungstrainer })));
const StammIntegral = React.lazy(() => import("./funcStammIntegral.jsx").then((m) => ({ default: m.StammIntegral })));
const AdvancedPlotter = React.lazy(() => import("./func12.jsx").then((m) => ({ default: m.AdvancedPlotter })));
const LGSLoeser = React.lazy(() => import("./funcLGS.jsx").then((m) => ({ default: m.LGSLoeser })));
const Gleichungsloeser = React.lazy(() => import("./funcGleichungen.jsx").then((m) => ({ default: m.Gleichungsloeser })));
const PotenzregelSeite = React.lazy(() => import("./func22.jsx").then((m) => ({ default: m.PotenzregelSeite })));
const AnalysisZentrum = React.lazy(() => import("./func14.jsx").then((m) => ({ default: m.AnalysisZentrum })));
const KopfrechenZentrum = React.lazy(() => import("./func14.jsx").then((m) => ({ default: m.KopfrechenZentrum })));
const Begruenden = React.lazy(() => import("./func7.jsx").then((m) => ({ default: m.Begruenden })));
const EinheitSpieler = React.lazy(() => import("./func7.jsx").then((m) => ({ default: m.EinheitSpieler })));
const MeinPlan = React.lazy(() => import("./func8.jsx").then((m) => ({ default: m.MeinPlan })));
const KlasseAnsicht = React.lazy(() => import("./func9.jsx").then((m) => ({ default: m.KlasseAnsicht })));
const KlausurVorbereitung = React.lazy(() => import("./func9.jsx").then((m) => ({ default: m.KlausurVorbereitung })));
const TrainingSeite = React.lazy(() => import("./funcTraining.jsx").then((m) => ({ default: m.TrainingSeite })));
const DifferenzenquotientSeite = React.lazy(() => import("./func5.jsx").then((m) => ({ default: m.DifferenzenquotientSeite })));
const FotoAufgaben = React.lazy(() => import("./func4.jsx").then((m) => ({ default: m.FotoAufgaben })));
const GeneratorHub = React.lazy(() => import("./func5.jsx").then((m) => ({ default: m.GeneratorHub })));
const WegVomBlatt = React.lazy(() => import("./func5.jsx").then((m) => ({ default: m.WegVomBlatt })));
const Trainingsbereich = React.lazy(() => import("./func1.jsx").then((m) => ({ default: m.Trainingsbereich })));
const Kurse = React.lazy(() => import("./func1.jsx").then((m) => ({ default: m.Kurse })));
const KIAufgaben = React.lazy(() => import("./func1.jsx").then((m) => ({ default: m.KIAufgaben })));
const EntwurfStart = React.lazy(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfStart })));
const EntwurfChecken = React.lazy(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfChecken })));
const EntwurfPakete = React.lazy(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfPakete })));
const Plotter = React.lazy(() => import("./func3.jsx").then((m) => ({ default: m.Plotter })));
/* Head & Numbers wird erst beim Öffnen nachgeladen (eigener Chunk, nicht im Hauptbündel) */
const FormelsammlungNeu = React.lazy(() => import("./funcFormelsammlung.jsx").then((m) => ({ default: m.FormelsammlungNeu })));
const HeadNumbersSeite = React.lazy(() => import("./funcHeadNumbers.jsx").then((m) => ({ default: m.HeadNumbersSeite })));
import { EBB_SLOGAN } from "./funcEbbinghaus.jsx";
import { useKonto, kontoStarten } from "./konto.js";
import { englisch, spracheWechseln } from "./i18n.js";

// Menü-Button im Header: vorübergehend aus (true = wieder einblenden)
const ZEIGE_MENUE = false;
const ZEIGE_PROFIL = true;

export function Mathilda() {
  const [ansicht, setAnsicht] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.has("konto") || q.has("pro")) return "konto";
      if (q.get("ticket") === "danke") return "elternabend";
      const h = window.location.hash.slice(1);
      return h === LANDING || ENTWUERFE.some((e) => e.ansicht === h) ? h : "start";
    } catch (e) { return "start"; }
  });
  // Rückkehr von Stripe nach erfolgreicher Ticketbuchung
  const [ticketGebucht] = useState(() => { try { return new URLSearchParams(window.location.search).get("ticket") === "danke"; } catch (e) { return false; } });
  const konto = useKonto();
  useEffect(() => {
    kontoStarten();
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.get("pro") === "danke") { try { sessionStorage.setItem("mm-pro-danke", "1"); } catch (e) { /* privat */ } }
      if (u.searchParams.has("konto") || u.searchParams.has("ticket") || u.searchParams.has("pro")) { u.searchParams.delete("konto"); u.searchParams.delete("ticket"); u.searchParams.delete("pro"); window.history.replaceState({}, "", u.pathname + u.search + u.hash); }
      /* Sprung aus den öffentlichen Formelseiten: /?formel=<id> öffnet die Formel in der Formelsammlung */
      const f = u.searchParams.get("formel");
      if (f && /^[a-z0-9-]{1,60}$/.test(f)) {
        u.searchParams.delete("formel"); window.history.replaceState({}, "", u.pathname + u.search + u.hash);
        setTimeout(() => gehe({ ansicht: "formeln", formel: f }), 0);
      }
    } catch (e) { /* ignorieren */ }
    try {   // nach dem Sprachwechsel dieselbe Seite wieder öffnen
      const z = JSON.parse(sessionStorage.getItem("mm-nach-sprachwechsel") || "null");
      sessionStorage.removeItem("mm-nach-sprachwechsel");
      if (z && z.ansicht && z.ansicht !== "start") gehe(z);
    } catch (e) { /* ignorieren */ }
  }, []);
  const sprachKnopf = () => {
    try {
      sessionStorage.setItem("mm-nach-sprachwechsel", JSON.stringify({ ansicht, ziel: ansicht === "training" ? trainZiel : ansicht === "ki" ? genZiel : undefined,
        kompetenz: einheitId || undefined, klasse: klasseAktiv, kurs: kursStart || undefined, trainer: kopfTrainer || undefined, modul: hnModul || undefined, bereich: ansicht === "formeln" ? formelBereich : undefined, land: ansicht === "landeswettbewerb" ? landWahl : undefined, foto: fotoModus }));
    } catch (e) { /* privat */ }
    spracheWechseln();
  };
  const [kopfTrainer, setKopfTrainer] = useState(null);   // direkt geöffneter Kopfrechen-Trainer
  const [hnModul, setHnModul] = useState(null);             // direkt geöffneter Bereich von Head & Numbers
  const [entdeckenStart, setEntdeckenStart] = useState(null);   // direkt geöffnetes Lernangebot in „Mathe entdecken“
  const [landWahl, setLandWahl] = useState("bw");
  const [formelBereich, setFormelBereich] = useState("analysis");
  const [formelZiel, setFormelZiel] = useState(null);   // Deep-Link auf eine einzelne Formel   // Bereich der Formelsammlung          // Bundesland der Landeswettbewerb-Seite
  const [sprung, setSprung] = useState(null);
  const [fotoModus, setFotoModus] = useState("blatt");
  const [terminStart, setTerminStart] = useState(null);
  const [klasseAktiv, setKlasseAktiv] = useState(8);
  const [kursStart, setKursStart] = useState(null);
  const [fotoErlaubt, setFotoErlaubt] = useState(() => !!einwilligungLesen());
  const [trainZiel, setTrainZiel] = useState(null);
  const [genZiel, setGenZiel] = useState(null);
  const [gruppeOffen, setGruppeOffen] = useState(null);
  const [einheitId, setEinheitId] = useState(null);
  const [pfadStart, setPfadStart] = useState(null);   // Lernpfad: direkt in eine Einheit springen

  React.useEffect(() => { lernLaden().then(() => syncStarten({ lesen: lernSnapshot, anwenden: lernVomKonto, leer: lernLeer })); }, []);
  React.useEffect(() => { entdeckenSyncStarten(); }, []);
  const lern = useLern();

  const [seitenOffen, setSeitenOffen] = useState(false);
  const [toolMenueOffen, setToolMenueOffen] = useState(false);
  useEffect(() => { aufklappScrollStarten(); }, []);
  useEffect(() => { werkzeugMerken(ansicht); }, [ansicht]);   // für „Weitermachen“ auf der Startseite
  // Webseiten-Entwürfe bekommen einen Anker in der Adresse (#entwurf-…), damit man sie direkt aufrufen kann
  useEffect(() => {
    try {
      const h = window.location.hash.slice(1);
      const hatAnker = istEntwurf(ansicht) || ansicht === LANDING;
      if (hatAnker && h !== ansicht) window.history.replaceState({}, "", window.location.pathname + window.location.search + "#" + ansicht);
      else if (!hatAnker && (istEntwurf(h) || h === LANDING)) window.history.replaceState({}, "", window.location.pathname + window.location.search);
    } catch (e) { /* ignorieren */ }
  }, [ansicht]);
  const gehe = (eintrag) => {
    if (!eintrag.uebergabe) hinweisVerwerfen();
    setAnsicht(eintrag.ansicht);
    setSeitenOffen(false); setToolMenueOffen(false);
    if (eintrag.ansicht === "training") setTrainZiel(eintrag.ziel ?? null);
    if (eintrag.ansicht === "ki") setGenZiel(eintrag.ziel ?? null);
    if (eintrag.foto) setFotoModus(eintrag.foto);
    if (eintrag.kompetenz) setEinheitId(eintrag.kompetenz);
    if (eintrag.ansicht === "lernpfad") setPfadStart(eintrag.einheit ? { einheit: eintrag.einheit, zeit: Date.now() } : null);
    if (eintrag.ansicht === "vorbereiten") setTerminStart(eintrag.termin || null);
    if (eintrag.ansicht === "klasse") setKlasseAktiv(eintrag.klasse);
    setKursStart(eintrag.ansicht === "kurse" ? eintrag.kurs || null : null);
    setKopfTrainer(eintrag.ansicht === "kopf" ? eintrag.trainer || null : null);
    setHnModul(eintrag.ansicht === "headnumbers" ? eintrag.modul || null : null);
    setEntdeckenStart(eintrag.ansicht === "entdecken" ? eintrag.seite || null : null);
    setEntdeckenStart(eintrag.ansicht === "entdecken" ? eintrag.seite || null : null);
    if (eintrag.land) setLandWahl(eintrag.land);
    if (eintrag.ansicht === "formeln") { setFormelBereich(eintrag.bereich || "analysis"); setFormelZiel(eintrag.formel || null); }
    setMenuOffen(false); setGruppeOffen(null);
    window.scrollTo(0, 0);
  };
  FR.gehe = gehe;   // für „Weiter mit …“-Knöpfe in den Werkzeugen (uebergabe.js)
  FR.ansicht = () => ansicht;   // für buchung.jsx: Bereich einer Buchung
  try { window.__mmGehe = gehe; } catch (e) { /* nur für automatische Tests (Übersetzungs- und Layoutprüfung) */ }
  const [menuOffen, setMenuOffen] = useState(false);
  /* Ein Menüeintrag ist nur aktiv, wenn Ansicht UND Unterziel passen
     (mehrere Einträge teilen sich z. B. die Ansicht "training"). */
  const istAktiv = (e) => {
    if (e.ansicht !== ansicht) return false;
    if (e.ansicht === "training") return (e.ziel ?? null) === trainZiel;
    if (e.ansicht === "ki") return (e.ziel ?? null) === genZiel;
    if (e.ansicht === "analyse") return e.foto === fotoModus;
    if (e.ansicht === "klasse") return e.klasse === klasseAktiv;
    return true;
  };
  const [quelle, setQuelle] = useState(null);
  const [bild, setBild] = useState(null);
  const [b64, setB64] = useState(null);
  const [info, setInfo] = useState("");
  const [drehung, setDrehung] = useState(0);
  const [laeuft, setLaeuft] = useState(false);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState(null);
  const [roh, setRoh] = useState(null);
  const [zeigeRoh, setZeigeRoh] = useState(false);
  const [abschriftOk, setAbschriftOk] = useState(null);   // Schritt 1 des Prüfkatalogs: Abschrift bestätigen
  const [erg, setErg] = useState(null);
  const kameraRef = useRef(null);
  const galerieRef = useRef(null);
  const videoRef = useRef(null);
  const [videoQuelle, setVideoQuelle] = useState(VIDEO_URL);

  const videoWaehlen = (file) => {
    if (file) setVideoQuelle(URL.createObjectURL(file));
  };

  const dateiWaehlen = async (file) => {
    if (!file) return;
    setFehler(null); setErg(null); setRoh(null); setDrehung(0); setLaden(true);
    let weg = "";
    try {
      const src = await dekodieren(file, (m) => { weg = m; });
      setQuelle(src);
      const r = rendern(src, 0);
      setB64(r.b64); setBild(r.vorschau);
      setInfo(`${weg} · ${r.w}×${r.h} px · ${r.kb} KB`);
    } catch (e) {
      setFehler(e.message);
    } finally {
      setLaden(false);
    }
  };

  const drehen = () => {
    if (!quelle) return;
    const d = (drehung + 90) % 360;
    setDrehung(d);
    const r = rendern(quelle, d);
    setB64(r.b64); setBild(r.vorschau);
    setInfo(`gedreht · ${r.w}×${r.h} px · ${r.kb} KB`);
  };

  /* Stift-Hinweis jedes dritte Mal: Zähler der Blatt-Analysen auf diesem Gerät */
  const ANALYSE_ZAEHLER = "matheplus-blattanalysen";
  const analysieren = async () => {
    if (!b64) return;
    setLaeuft(true); setFehler(null); setRoh(null); setAbschriftOk(null);
    let zaehler = 0;
    try { zaehler = parseInt(localStorage.getItem(ANALYSE_ZAEHLER) || "0", 10) || 0; } catch (e) { /* privat */ }
    const prompt = blattPrompt({ stiftHinweis: (zaehler + 1) % 3 === 0 });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: kiKopf(),
        body: JSON.stringify({
          model: "claude-sonnet-5-5",
          max_tokens: 4000,
          system: mathildaSystem({ L: lern, profil: konto.profil, blattanalysen: zaehler }),   // Gedächtnis: Klasse, Plan, Fehlertypen
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });
      const data = await kiAntwort(res);
      if (data.error) throw new Error(`Die API hat abgelehnt: ${data.error.message}`);
      if (!data.content) throw new Error("Die Antwort kam ohne Inhalt zurück.");
      const text = data.content.map((i) => (i.type === "text" ? i.text : "")).join("");
      setRoh(text);
      setErg(jsonLesen(text));
      try { localStorage.setItem(ANALYSE_ZAEHLER, String(zaehler + 1)); } catch (e) { /* privat */ }
    } catch (e) {
      setFehler(e.message || "Unbekannter Fehler.");
    } finally {
      setLaeuft(false);
    }
  };

  const zuruecksetzen = () => {
    setQuelle(null); setBild(null); setB64(null); setErg(null); setFehler(null);
    setRoh(null); setZeigeRoh(false); setInfo(""); setDrehung(0);
    if (kameraRef.current) kameraRef.current.value = "";
    if (galerieRef.current) galerieRef.current.value = "";
  };

  const zeilenFarbe = (s) => (s === "fehler" ? C.signal : s === "unklar" ? C.hellgrau : C.tinte);

  const Karte = ({ children, style }) => (
    <div style={{ background: C.weiss, borderRadius: 16, padding: 22, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", ...style }}>
      {children}
    </div>
  );

  // Früher eine Welle – jetzt ein gerader, sauberer Abschluss des Kopfbereichs.
  const Welle = () => <div aria-hidden="true" className="held-welle" style={{ height: 22 }} />;

  // Kopfbereich jeder Werkzeugseite: Menü-Knopf (☰) und die Werkzeug-Leiste aus werkzeuge.js
  // (Bereich · Station, Werkzeuge der Station, Umschalter, „Weiter“ zur nächsten Station)
  const SektionsMenue = () => {
    const ort = wo(ansicht);
    const knopf = (ort || istToolMenueSeite(ansicht)) ? (<>
      <button type="button" className="tool-menue-knopf" onClick={() => setToolMenueOffen(!toolMenueOffen)} aria-haspopup="dialog" aria-expanded={toolMenueOffen}
        data-kein-scroll aria-label={toolMenueOffen ? "Menü schließen" : "Menü mit allen Bereichen"} title="Menü"
        style={{ height: 34, width: 34, borderRadius: 999, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 46,
          border: `1.5px solid ${toolMenueOffen ? C.flaggold : "rgba(255,255,255,0.45)"}`, background: toolMenueOffen ? "rgba(237,187,0,0.16)" : "rgba(255,255,255,0.06)" }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={toolMenueOffen ? C.flaggold : C.weiss} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {toolMenueOffen ? <path d="M5 12h14" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {toolMenueOffen && <ToolMenue gehe={gehe} schliessen={() => setToolMenueOffen(false)} aktuell={ansicht} />}
    </>) : null;
    if (!ort) return knopf;
    return (<>
      {knopf}
      <WerkzeugLeiste ansicht={ansicht} gehe={gehe} />
      {ansicht !== "sinus" && ansicht !== "steckbrief" && <PruefungsLink ansicht={ansicht} gehe={gehe} klein />}
    </>);
  };

  /* Trainingswerkzeuge mit eigener schlanker Kopfleiste (KompaktKopf): der große Seitenkopf entfällt */
  const ohneKopf = ansicht === "ableitungstrainer" || ansicht === "stammintegral";

  return (
    <div style={{ background: C.sand, color: C.tinte, fontFamily: "Montserrat, system-ui, sans-serif", minHeight: "100vh" }}>
      <AufklappStil />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Roboto+Condensed:wght@400;500&display=swap');
      .kachel { transition: transform .16s ease, box-shadow .16s ease; }
      .held { position: relative; }
      .held:has(.tool-menue-knopf) h1 { padding-right: 46px; }
      .tool-menue-knopf { position: absolute; top: 41px; right: 24px; }
      .test-knopf-klein { position: absolute; top: 41px; right: 66px; }
      .held:has(.test-knopf-klein) h1 { padding-right: 112px; }
      @media (max-width:520px){ .tool-menue-knopf { top: 14px; } .test-knopf-klein { top: 14px; } }
      .kachel:hover { transform: translateY(-2px); }
      .kachel:active { transform: scale(.988); }
      .zeichnen { stroke-dasharray: 560; stroke-dashoffset: 560; animation: malen 1.9s cubic-bezier(.4,0,.2,1) forwards; }
      @keyframes malen { to { stroke-dashoffset: 0; } }
      .auftauchen { animation: auftauchen .5s cubic-bezier(.2,.7,.3,1) both; }
      @keyframes auftauchen { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      .kachel:hover .motivfeld { transform: scale(1.06) rotate(-2deg); }
      .motivfeld { transition: transform .22s cubic-bezier(.2,.7,.3,1); }
      .pulsieren { animation: pulsieren 3.2s ease-in-out infinite; }
      @keyframes pulsieren { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
      .schweben { animation: schweben 5.5s ease-in-out infinite; }
      @keyframes schweben { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      /* Desktop: Kopfleiste und alle Inhalte unter dem Berg-Banner laufen von der linken Textkante des Banners
         (Bühne 760 px, Textrand 25 px) bis zum rechten Ende der Berggrafik. Darunter bleibt alles wie gehabt. */
      @media (min-width: 840px) {
        .mx-auto[style*="max-width: 620px"].px-6 { width: 783px !important; max-width: 783px !important; margin-left: calc(50% - 379px) !important; margin-right: 0 !important; }
        .mx-auto[style*="max-width: 680px"].px-6 { width: 783px !important; max-width: 783px !important; margin-left: calc(50% - 379px) !important; margin-right: 0 !important; }
        .mx-auto[style*="max-width: 620px"].px-5 { width: 775px !important; max-width: 775px !important; margin-left: calc(50% - 375px) !important; margin-right: 0 !important; }
        .mx-auto.kopf-zeile { width: 735px !important; max-width: 735px !important; margin-left: calc(50% - 355px) !important; margin-right: 0 !important; padding-left: 0 !important; padding-right: 0 !important; }
        .kopf-zeile .kopf-hamburger { margin-right: -8px; }
        .seiten-menue { right: calc(50% - 380px) !important; }
        /* Startseite: breite Kacheln und Einleitung laufen nicht mehr über die Textkante hinaus */
        .mx-auto.px-6 [style*="calc(100% + 32px)"] { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
        .mx-auto.px-6 [style*="margin: 0px -16px"] { margin-left: 0 !important; margin-right: 0 !important; }
        .mx-auto.px-6 > section[style*="margin-left: -6px"] { margin-left: 0 !important; }
      }
      @media print {
        .nichtdrucken { display: none !important; }
        .druckblatt { box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }
        .seitenumbruch { page-break-before: always; }
      }`}</style>

      {/* Kopfleiste mit Menü */}
      {!ohneKopf && (
      <div data-kopfleiste style={{ position: "sticky", top: 0, zIndex: 50, background: C.seeTief }}>
        <div className="mx-auto flex items-center justify-between kopf-zeile" style={{ maxWidth: 620, height: "var(--kopf-h, 56px)", paddingLeft: 18, paddingRight: 12 }}>
          <style>{`
            :root{--kopf-h:56px}
            @media (min-width:421px){:root{--kopf-h:clamp(62px, calc(11.1vw + 26px), 90px)}.kopf-slogan{margin-top:6px !important}}
            @media (min-width:840px){.kopf-slogan{margin-top:1px !important}}
            .logo-silber{background:linear-gradient(180deg,#FFFFFF 0%,${C.silberHell} 35%,${C.silber} 60%,${C.silberDunkel} 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
            .titel-kurz{display:none}
            @media (max-width:520px){.held{padding-top:18px !important;padding-bottom:4px !important}.held h1{font-size:25px !important;line-height:1.1 !important}.held h1+div{margin-top:12px !important;margin-bottom:13px !important}.held-welle{height:12px !important}}
            .kopfblock{margin-bottom:-16px}
            .kopfblock .held{padding-bottom:30px !important}
            @media (max-width:520px){.kopfblock .held{padding-bottom:22px !important}}
            @media (max-width:480px){.titel-lang{display:none}.titel-kurz{display:inline}
              .sek-menue{flex-wrap:nowrap !important;gap:5px !important;overflow-x:auto;scrollbar-width:none;margin-right:-24px;padding-right:24px}
              .sek-menue::-webkit-scrollbar{display:none}
              .sek-chip{flex:1 1 auto;padding:6px 6px !important;font-size:12px !important;text-align:center}
              .intro-h2{font-size:clamp(20px,6.6vw,26px) !important;white-space:nowrap}
              .intro-p{display:-webkit-box !important;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}}
            @media (max-width:340px){.sek-chip{padding:6px 4px !important;font-size:11.5px !important}.sek-menue{gap:4px !important}}
            .titel-silber{background:linear-gradient(180deg,#FFFFFF 0%,${C.silberHell} 50%,${C.silber} 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
            .logo-gold{background:linear-gradient(180deg,#FFE58A 0%,${C.flaggold} 45%,${C.goldWarm} 70%,#A67C00 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
          `}</style>
          <button type="button" data-kein-i18n aria-label={englisch() ? "Home" : "Zur Startseite"} title={englisch() ? "Home" : "Zur Startseite"}
            onClick={() => { setAnsicht("start"); setMenuOffen(false); setGruppeOffen(null); setSeitenOffen(false); window.scrollTo(0, 0); }}
            style={{ background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
            <span style={{ color: C.weiss, fontSize: "clamp(21px, 7vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 }}>
              <span className="logo-silber">mythos</span><span className="logo-gold">mathe</span><span className="logo-silber">.de</span>
            </span>
            <span className="kopf-slogan" style={{ fontSize: "clamp(12.25px, 4.083vw, 23.33px)", fontWeight: 600, marginTop: 0, letterSpacing: "0.03em", color: "#C9D6EE", whiteSpace: "nowrap", lineHeight: 1 }}>
              System <span style={{ color: C.flaggold }}>+</span> Freude <span style={{ color: C.flaggold }}>=</span> Erfolg
            </span>
          </button>
          <div className="flex items-center" style={{ gap: "clamp(4px, 1.4vw, 6px)" }}>
          {/* Profil-/Login-Button */}
          {ZEIGE_PROFIL && <button onClick={() => { gehe({ ansicht: "konto" }); setSeitenOffen(false); window.scrollTo(0, 0); }} aria-label={konto.profil ? "Mein Konto" : "Anmelden"} title={konto.profil ? "Mein Konto" : "Anmelden"}
            style={{ width: "clamp(28px, 8.6vw, 34px)", height: "clamp(28px, 8.6vw, 34px)", flexShrink: 0, borderRadius: 999, border: `1.5px solid ${konto.profil ? C.flaggold : "rgba(255,255,255,0.45)"}`,
              background: konto.profil ? "rgba(237,187,0,0.16)" : "transparent", color: konto.profil ? C.flaggold : C.weiss, fontSize: konto.profil ? 14 : 20, fontWeight: 700,
              fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1 }}>
            {konto.profil ? (konto.profil.name || "?").slice(0, 1).toUpperCase() : "+"}
          </button>}
          {/* Menü-Button (drei Linien): Startseite, Sprache und die passwortgeschützten Entwürfe */}
          <button type="button" className="kopf-hamburger" onClick={() => setSeitenOffen(!seitenOffen)} aria-expanded={seitenOffen} data-kein-scroll aria-label="Menü" title="Menü"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "block", width: 22, height: 2, background: seitenOffen || istEntwurf(ansicht) || ansicht === LANDING ? C.flaggold : C.weiss, borderRadius: 2 }} />
            ))}
          </button>
          </div>
        </div>

        {seitenOffen && (
          <>
            <div onClick={() => setSeitenOffen(false)} style={{ position: "fixed", inset: 0, top: "var(--kopf-h, 56px)", zIndex: 1 }} aria-hidden="true" />
            <div className="seiten-menue" style={{ position: "absolute", right: "max(12px, calc(50% - 298px))", top: 60, zIndex: 2, width: "min(320px, calc(100vw - 24px))", background: C.weiss,
              borderRadius: 14, boxShadow: "0 14px 40px rgba(8,23,59,0.32)", padding: 8, color: C.tinte }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.grau, padding: "8px 12px 6px" }}>SEITE WECHSELN</div>
              {(() => {
                const zeile = { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte };
                const kreis = (an) => ({ width: 28, height: 28, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, background: an ? C.flaggold : C.himmel, color: an ? C.seeTief : C.grau });
                const landAn = ansicht === LANDING;
                const startAn = !istEntwurf(ansicht) && !landAn;
                return (
                  <>
                    <button type="button" onClick={() => gehe({ ansicht: "start" })} aria-current={startAn ? "page" : undefined}
                      style={{ ...zeile, background: startAn ? "rgba(237,187,0,0.14)" : "transparent" }}>
                      <span style={kreis(startAn)}>A</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>Startseite</span>
                      </span>
                    </button>
                    {/* Landingpage: offen, ohne Passwort – steht direkt unter der Startseite */}
                    <button type="button" onClick={() => gehe({ ansicht: LANDING })} aria-current={landAn ? "page" : undefined}
                      style={{ ...zeile, background: landAn ? "rgba(237,187,0,0.14)" : "transparent" }}>
                      <span style={kreis(landAn)}>B</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>Landingpage</span>
                      </span>
                    </button>
                    <button type="button" onClick={() => { setSeitenOffen(false); sprachKnopf(); }} data-kein-i18n style={{ ...zeile, background: "transparent" }}>
                      <span style={kreis(false)}>{englisch() ? "DE" : "EN"}</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{englisch() ? "Auf Deutsch wechseln" : "Switch to English"}</span>
                      </span>
                    </button>
                    {ENTWUERFE.map((e, i) => {
                      const an = ansicht === e.ansicht;
                      return (
                        <button key={e.ansicht} type="button" onClick={() => gehe({ ansicht: e.ansicht })} aria-current={an ? "page" : undefined}
                          style={{ ...zeile, width: "calc(100% - 16px)", marginLeft: 16, marginTop: i === 0 ? 6 : 4, background: an ? "rgba(237,187,0,0.18)" : "#EEF1F6" }}>
                          <span style={kreis(an)}>{i + 1}</span>
                          <span style={{ flex: 1 }}>
                            <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>{e.name}</span>
                          </span>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.grau} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Passwortgeschützt" role="img" style={{ flexShrink: 0 }}>
                            <rect x="5" y="11" width="14" height="9.5" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
                          </svg>
                        </button>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </>
        )}
        {menuOffen && (
          <div style={{ background: C.seeTief, maxHeight: "72vh", overflowY: "auto" }}>
            <div className="mx-auto px-6 py-2" style={{ maxWidth: 620 }}>
              <button onClick={() => { setAnsicht("start"); setMenuOffen(false); setGruppeOffen(null); window.scrollTo(0, 0); }}
                className="w-full py-3" style={{ background: "none", border: "none", borderBottom: `1px solid rgba(255,255,255,0.12)`, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ color: ansicht === "start" ? C.flaggold : C.weiss, fontSize: 15.5, fontWeight: 600 }}>Start</span>
              </button>

              {NAV.map((g, gi) => {
                const auf = gruppeOffen === g.id;
                const drin = g.eintraege.some(istAktiv);
                const direkt = g.eintraege.length === 1;
                return (
                  <div key={g.id} style={{ borderBottom: gi < NAV.length - 1 ? `1px solid rgba(255,255,255,0.12)` : "none" }}>
                    <button onClick={() => (direkt ? gehe(g.eintraege[0]) : setGruppeOffen(auf ? null : g.id))} aria-expanded={direkt ? undefined : auf} className="w-full py-3.5 flex items-center justify-between"
                      style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                      <span>
                        <span style={{ display: "block", color: drin ? C.flaggold : C.weiss, fontSize: 15.5, fontWeight: 600 }}>{mitMathildaAI(g.name, true)}</span>
                        <span style={{ display: "block", color: "#C9D6EE", fontSize: 12.5, fontWeight: 300, marginTop: 2 }}>{g.kurz}</span>
                      </span>
                      {!direkt && (
                        <AufklappZeichen auf={auf} farbe="#C9D6EE" />
                      )}
                    </button>

                    {auf && (
                      <div data-aufklapp-inhalt style={{ paddingBottom: 10 }}>
                        {g.eintraege.map((e) => (
                          <button key={e.name} onClick={() => gehe(e)} className="w-full py-2.5"
                            style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit", paddingLeft: 14 }}>
                            <span style={{ display: "block", color: istAktiv(e) ? C.flaggold : C.weiss, fontSize: 14.5, fontWeight: 500 }}>{mitMathildaAI(e.name, true)}</span>
                            <span style={{ display: "block", color: "#9FB0D3", fontSize: 12, fontWeight: 300, marginTop: 1 }}>{e.kurz}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      <React.Suspense fallback={<Laden />}>
      {ansicht === "messung" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Messbericht</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Was eine Einheit gebracht hat — und ob es nach Wochen noch da ist.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Messbericht gehe={gehe} />
        </>
      ) : ansicht === "auswertung" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Auswertung</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Wirksamkeit zeigt sich erst über eine Gruppe.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Auswertung />
        </>
      ) : ansicht === "klasse" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <div className="flex gap-2 mb-4" style={{ overflowX: "auto" }}>
                {SCHULKLASSEN.map((k) => (
                  <button key={k} onClick={() => { setKlasseAktiv(k); window.scrollTo(0, 0); }}
                    style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 999, fontFamily: "inherit", cursor: "pointer",
                      border: `1.5px solid ${k === klasseAktiv ? C.gruen : "rgba(255,255,255,0.35)"}`,
                      background: k === klasseAktiv ? "rgba(185,138,0,0.18)" : "transparent", color: C.weiss, fontSize: 14, fontWeight: 600 }}>
                    {k}
                  </button>
                ))}
              </div>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Klasse {klasseAktiv}</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 14 }} />
            </div>
            <Welle fill={C.sand} />
          </div>
          <KlasseAnsicht klasse={klasseAktiv} gehe={gehe} />
        </>
      ) : ansicht === "vorbereiten" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Klausur vorbereiten</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Ein Termin, ein Plan — rückwärts gerechnet bis zum Tag der Arbeit.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <KlausurVorbereitung key={terminStart || "liste"} gehe={gehe} start={terminStart} />
        </>
      ) : ansicht === "plan" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Mein Plan</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Eine Verabredung mit dir selbst — klein genug, um sie zu halten.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <MeinPlan gehe={gehe} />
        </>
      ) : ansicht === "bericht" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Wochenbericht</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Wie regelmäßig und wie eigenständig — ohne Noten.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Wochenbericht />
        </>
      ) : ansicht === "abitur" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Probeabitur</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Teil A ohne Hilfsmittel, Teil B mit — und am Ende Notenpunkte.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Probeabitur />
        </>
      ) : ansicht === "operatoren" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Operatoren</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Das erste Wort der Aufgabe entscheidet, wofür es Punkte gibt.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Operatoren />
        </>
      ) : ansicht === "begruenden" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Begründen und Beweisen</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                In ganzen Sätzen, am Bewertungsraster gemessen.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Begruenden />
        </>
      ) : ansicht === "modellieren" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Modellieren</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Vom Text zur Gleichung — und zurück zur Antwort.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Modellieren />
        </>
      ) : ansicht === "einheit" && einheitId ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", lineHeight: 1.12 }}>{KOMP[einheitId]?.titel}</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                {KOMP[einheitId]?.kann}
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <EinheitSpieler key={einheitId} id={einheitId} gehe={gehe} />
        </>
      ) : ansicht === "wiederholen" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em", lineHeight: 1.12 }}>Wiederholen</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Was heute fällig ist — damit es im Abitur noch da ist.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Wiederholen gehe={gehe} />
        </>
      ) : ansicht === "karte" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Lernlandkarte</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Der ganze Lehrplan als Liniennetz — jede Station eine Kompetenz.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Lernlandkarte gehe={gehe} />
        </>
      ) : ansicht === "einstufung" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Einstufung</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Herausfinden, wo die Lücken wirklich beginnen.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Einstufung gehe={gehe} />
        </>
      ) : ansicht === "profil2" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Profil</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Klasse, Ziel und Lernstand.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Profil gehe={gehe} />
        </>
      ) : ansicht === "profil" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Fortschritt</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Nicht wie viele Fehler — welche.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Fortschritt />
          <TrainingFortschritt gehe={gehe} />
        </>
      ) : ansicht === "warmup" ? (
        <>
          <SeitenKopf titel="5 Minuten Mathe" groesse="clamp(24px, 7vw, 34px)">
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Kurz üben, ohne Druck.</p>
          </SeitenKopf>
          <TrainingSeite modus="warmup" gehe={gehe} />
        </>
      ) : ansicht === "fehlertraining" ? (
        <>
          <SeitenKopf titel="Meine Fehler üben" groesse="clamp(24px, 7vw, 34px)">
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Nicht wie viele Fehler – welche.</p>
          </SeitenKopf>
          <TrainingSeite modus="fehlertraining" gehe={gehe} />
        </>
      ) : ansicht === "abiketten" ? (
        <>
          <SeitenKopf titel="Abi-Ketten" groesse="clamp(24px, 7vw, 34px)">
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Eine Abi-Aufgabe, die durch mehrere Werkzeuge läuft – mit Punkten und Uhr.</p>
          </SeitenKopf>
          <AbiKettenSeite />
        </>
      ) : ansicht === "pruefung" ? (
        <>
          <SeitenKopf titel="Prüfungsmodus" groesse="clamp(24px, 7vw, 34px)">
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Wie in der Klausur: ohne Hilfen, mit Punkten.</p>
          </SeitenKopf>
          <TrainingSeite modus="pruefung" gehe={gehe} />
        </>
      ) : ansicht === "klausurnach" ? (
        <>
          <SeitenKopf titel="Klausur nachbereiten" groesse="clamp(24px, 7vw, 34px)">
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Aus verlorenen Punkten einen Plan machen.</p>
          </SeitenKopf>
          <TrainingSeite modus="klausurnach" gehe={gehe} />
        </>
      ) : ansicht === "kopf" ? (
        <>
          <SeitenKopf titel="Kopfrechnen" groesse="clamp(26px, 8vw, 36px)">
              <p style={{ color: C.goldText, fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Head &amp; Numbers — damit der Kopf beim Rechnen für das Eigentliche frei bleibt.
              </p>
          </SeitenKopf>
          <KopfrechenZentrum key={kopfTrainer || "liste"} start={kopfTrainer} gehe={gehe} />
        </>
      ) : istWzSeite(ansicht) ? (
        <WerkzeugSeite ansicht={ansicht} gehe={gehe} menue={<SektionsMenue />} />
                                                                                                ) : ansicht === "analysis" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Analysis</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <SektionsMenue />
            </div>
            <Welle fill={C.sand} />
          </div>
          <AnalysisZentrum gehe={gehe} />
        </>
            ) : ansicht === "formeln" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Formelsammlung</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <SektionsMenue />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Jede Formel mit Herleitung, interaktivem Bild und ihren Zusammenhängen.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
            <FormelsammlungNeu key={formelBereich + "|" + (formelZiel || "")} bereich={formelBereich} formel={formelZiel} zuHerleitung={(nr) => { setSprung(nr); setAnsicht("training"); }} />
          </React.Suspense>
        </>
      ) : ansicht === "plotter" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 33, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Kurvendiskussion</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <SektionsMenue />
            </div>
            <Welle fill={C.sand} />
          </div>
          <Plotter />
        </>
      ) : ansicht === "ableitungstrainer" ? (
        <>
          <KompaktKopf ansicht={ansicht} gehe={gehe} menueOffen={toolMenueOffen} onMenue={() => setToolMenueOffen(!toolMenueOffen)}
            menue={<ToolMenue gehe={gehe} schliessen={() => setToolMenueOffen(false)} aktuell={ansicht} />}
            testKnopf={<PruefungsLink ansicht={ansicht} gehe={gehe} pille />} />
          <Ableitungstrainer />
        </>
      ) : ansicht === "stammintegral" ? (
        <>
          <KompaktKopf ansicht={ansicht} gehe={gehe} menueOffen={toolMenueOffen} onMenue={() => setToolMenueOffen(!toolMenueOffen)}
            menue={<ToolMenue gehe={gehe} schliessen={() => setToolMenueOffen(false)} aktuell={ansicht} />}
            testKnopf={<PruefungsLink ansicht={ansicht} gehe={gehe} pille />} />
          <StammIntegral />
        </>
      ) : ansicht === "advplotter" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 33, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Kurvendiskussion</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <SektionsMenue />
            </div>
            <Welle fill={C.sand} />
          </div>
          <AdvancedPlotter />
        </>
      ) : ansicht === "start" ? (
        <Startseite gehe={gehe} />
      ) : ansicht === LANDING ? (
        <Landingpage gehe={gehe} />
      ) : ansicht === "entwurf-start" ? (
        <EntwurfTor gehe={gehe}><EntwurfStart gehe={gehe} /></EntwurfTor>
      ) : ansicht === "entwurf-checken" ? (
        <EntwurfTor gehe={gehe}><EntwurfChecken gehe={gehe} /></EntwurfTor>
      ) : ansicht === "entwurf-pakete" ? (
        <EntwurfTor gehe={gehe}><EntwurfPakete gehe={gehe} /></EntwurfTor>
      ) : ansicht === "entwurf-vorher" ? (
        <EntwurfTor gehe={gehe}><EntwurfVorher /></EntwurfTor>
      ) : ansicht === "entwurf-werkzeuge" ? (
        <EntwurfTor gehe={gehe}><EntwurfWerkzeuge gehe={gehe} /></EntwurfTor>
      ) : ansicht === "kurse" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em", lineHeight: 1 }}>Videokurse</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Komplette Abiturthemen mit Videokurs, aufgebaut nach dem Matheskript-System.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Kurse gehe={gehe} startKurs={kursStart} />
        </>
      ) : ansicht === "ki" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Aufgabengenerator</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Frisch erzeugt, so oft du willst. Gerechnet wird auf Papier.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <GeneratorHub ziel={genZiel} setZiel={setGenZiel} />
        </>
      ) : ansicht === "gleichungen" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 31, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Gleichungen lösen</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <SektionsMenue />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Gleichung lösen heißt, die Rechnung rückwärts zu gehen — Schritt für Schritt, auf beiden Seiten.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <Gleichungsloeser />
        </>
                  ) : ansicht === "geradengleichung" ? (
        <>
          <SeitenKopf titel="Geradengleichung" groesse="clamp(24px, 7vw, 34px)">
              <SektionsMenue />
          </SeitenKopf>
          <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
            <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>Gerade durch zwei Punkte – oder durch Punkt und Steigung</h2>
            <KIAufgaben eingebettet />
          </div>
        </>
                              ) : ansicht === "bwm" ? (
        <>
          <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>MATHE-WETTBEWERBE</p>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(26px, 7.6vw, 34px)", letterSpacing: "-0.03em", lineHeight: 1.08 }} data-kein-i18n>Bundeswettbewerb Mathematik</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Drei Runden, echte Probleme, saubere Beweise – der große Mathe-Wettbewerb für die Oberstufe.</p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <BundeswettbewerbSeite />
        </>
      ) : ansicht === "landeswettbewerbe" ? (
        <>
          <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>MATHE-WETTBEWERBE</p>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(26px, 7.6vw, 34px)", letterSpacing: "-0.03em", lineHeight: 1.08 }}>Landeswettbewerbe</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Von Baden-Württemberg bis Thüringen: der Mathe-Wettbewerb in deinem Bundesland.</p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <LandeswettbewerbeSeite gehe={gehe} />
        </>
      ) : ansicht === "landeswettbewerb" ? (
        <>
          <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>LANDESWETTBEWERB</p>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(26px, 7.6vw, 34px)", letterSpacing: "-0.03em", lineHeight: 1.08 }}>{LAENDER[landWahl]?.name || "Bundesland"}</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>{LAENDER[landWahl]?.art === "lw" ? "Der Mathematik-Wettbewerb des Landes – Termine, Aufgaben und Lösungen." : "Die Landesrunde der Mathematik-Olympiade – Termine, Aufgaben und Lösungen."}</p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <LandeswettbewerbSeite land={landWahl} gehe={gehe} />
        </>
      ) : ansicht === "elternabend" ? (
        <>
          <div style={{ background: "radial-gradient(130% 150% at 90% 0%, #2A2210 0%, #0E0C08 55%, #050404 100%)" }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>MYTHOS MATHE LIVE</p>
              <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Elternabend</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Warum Mathe-Talent ein Mythos ist – und wie Ihr Kind mit System und Freude stark wird.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <ElternabendSeite gebucht={ticketGebucht} />
        </>
      ) : ansicht === "konto" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(26px, 7.6vw, 31px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Mein Konto</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 8 }} />
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <KontoSeite gehe={gehe} />
        </>
      ) : ansicht === "impressum" ? (
        <>
          <SeitenKopf titel="Impressum" groesse="clamp(26px, 7.6vw, 31px)" rund>
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Anbieterkennzeichnung nach § 5 DDG.</p>
          </SeitenKopf>
          <ImpressumSeite />
        </>
      ) : ansicht === "agb" ? (
        <>
          <SeitenKopf titel="AGB" groesse="clamp(26px, 7.6vw, 31px)" rund>
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Allgemeine Geschäftsbedingungen von Mythos Mathe.</p>
          </SeitenKopf>
          <AGBSeite />
        </>
      ) : ansicht === "widerruf" ? (
        <>
          <SeitenKopf titel="Widerrufsbelehrung" groesse="clamp(26px, 7.6vw, 31px)" rund>
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Widerrufsrecht für Live-Unterricht, Dienstleistungen und digitale Inhalte.</p>
          </SeitenKopf>
          <WiderrufSeite />
        </>
      ) : ansicht === "mathecheck" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.silberHell, marginBottom: 8 }}>2-MONATS-PROGRAMM</p>
              <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Mathe checken</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Lücken schließen, verstehen, sicher werden – in acht Wochen.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <MatheCheckenSeite />
        </>
      ) : ansicht === "masterclass" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>6-MONATS-PROGRAMM</p>
              <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Mathe Abi Masterclass</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Werde die beste Version von dir – für ein erfolgreiches Mathe-Abi und echte Freude am Fach.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <MasterclassSeite />
        </>
      ) : ansicht === "penpaperkurs" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>MITTELSTUFE · OBERSTUFE</p>
              <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Pen &amp; Paper Kurs</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Mathematik so aufschreiben, dass du deinen Denkweg siehst, verstehst und kontrollierst – für Mittelstufe und Oberstufe.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <PenPaperKursSeite gehe={gehe} />
        </>
      ) : ansicht === "lernpfad" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(26px, 7.6vw, 36px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Dein Plan</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Standortcheck, Wochenplan, eine Einheit nach der anderen – entdecken, rechnen, trainieren.</p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <LernpfadSeite key={pfadStart ? `${pfadStart.einheit}-${pfadStart.zeit}` : "plan"} gehe={gehe} start={pfadStart} />
        </>
      ) : ansicht === "meintraining" ? (
        <>
          <SeitenKopf titel="Mein Training" groesse="clamp(26px, 7.6vw, 36px)" rund>
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Dein Tagesplan, dein Lernfortschritt und alle Übungsmodi.</p>
          </SeitenKopf>
          <MeinTrainingSeite gehe={gehe} />
        </>
      ) : ansicht === "ebbinghaus" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>VOM VERSTEHEN ZUM KÖNNEN</p>
              <h1 className="titel-silber" data-kein-i18n style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Ebbinghaus</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                {EBB_SLOGAN}
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <EbbinghausSeite gehe={gehe} />
        </>
      ) : ansicht === "headnumbers" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>KOPFRECHNEN · 3 BEREICHE</p>
              <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Head &amp; Numbers</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Einmaleins, Quadratzahlen und Kubikzahlen – spielerisch trainiert, bis sie einfach sitzen.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px 0" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
            <HeadNumbersSeite key={hnModul || "start"} gehe={gehe} start={hnModul} />
          </React.Suspense>
        </>
      ) : ansicht === "lgs" ? (
        <>
          <SeitenKopf titel="Gleichungssysteme" groesse="clamp(26px, 7.6vw, 31px)" rund>
              <SektionsMenue />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Drei Unbekannte, drei Gleichungen — und du bestimmst jeden Schritt.
              </p>
          </SeitenKopf>
          <LGSLoeser />
        </>
      ) : ansicht === "entdecken" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Mathe entdecken</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Mathematik ist mehr als Regeln auswendig zu lernen. Entdecke Muster, stelle Fragen und finde selbst heraus, warum mathematische Zusammenhänge funktionieren.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <EntdeckenSeite key={entdeckenStart || "uebersicht"} start={entdeckenStart} />
        </>
      ) : ansicht === "elternkurs" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Mathe-Mindset-Kurs</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Must-Know für Eltern und Lehrkräfte: 6 TED-Talks und 2 Bücher, die inspirieren, wie Mathe auch funktionieren kann.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <ElternkursSeite />
        </>
      ) : ansicht === "nachhilfekurs" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Nachhilfe-Kurs</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Für Nachhilfelehrernen: von der Diagnose über Erklären und Üben bis zur Zusammenarbeit mit den Eltern.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <NachhilfekursSeite />
        </>
      ) : ansicht === "diffq" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Differenzenquotient</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Vom Tangentenproblem zur Ableitung — Herleitung, Sekanten-Visualisierung und eigenes Übungswerkzeug.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <DifferenzenquotientSeite />
        </>
      ) : ansicht === "potenzregel" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Potenzregel</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Von der Ableitung von x über die Produktregel zur vollständigen Induktion — Beweis, Visualisierung und eigenes Übungswerkzeug.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <PotenzregelSeite />
        </>
      ) : ansicht === "training" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em", lineHeight: 1 }}>Training</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Arbeitsheft Analysis 01 — von der Geraden zur Kurvendiskussion, in acht Bausteinen.
              </p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <Trainingsbereich sprung={sprung} setSprung={setSprung} ziel={trainZiel} setZiel={setTrainZiel} />
        </>
      ) : (
      <>

      {/* Meer */}
      <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="mx-auto px-6 pt-12 pb-4" style={{ maxWidth: 620 }}>
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 40, letterSpacing: "-0.03em", lineHeight: 1 }}>Mathilda<span style={{ color: C.flaggold }}>AI</span></h1>
          <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
          <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
            {fotoModus === "blatt"
              ? "Fotografiere dein Blatt. Mathilda liest den Rechenweg und schaut sich an, wie du gearbeitet hast."
              : fotoModus === "weg"
                ? "Fotografiere deinen Rechenweg. Mathilda überträgt ihn in Zeilen und prüft ihn wie im Editor."
                : fotoModus === "chat"
                  ? "Frag Mathilda. Sie kennt deinen Lernstand, fragt zurück, bevor sie verrät, und rechnet mit den Werkzeugen der App nach."
                  : "Fotografiere eine Aufgabe. Mathilda erkennt den Typ und erzeugt drei weitere derselben Sorte."}
          </p>
          <div role="note" style={{ marginTop: 16, display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(237,187,0,0.14)",
            border: `1.5px solid ${C.flaggold}`, borderRadius: 12, padding: "10px 12px" }}>
            <span style={{ flex: "none", background: C.flaggold, color: C.seeTief, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 999, marginTop: 1 }}>DEMO</span>
            <span style={{ color: "#E8EEFA", fontSize: 12.5, fontWeight: 400, lineHeight: 1.5 }}>Mathilda AI ist aktuell nur eine Demo und funktioniert noch nicht ganz.</span>
          </div>
        </div>
        <Welle fill={C.sand} />
      </div>

      <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 30 }}>
        <div className="flex gap-2 mb-6">
          {[["blatt", "Blatt prüfen"], ["weg", "Weg prüfen"], ["aufgabe", "Aufgabe scannen"], ["chat", "Mathilda fragen"]].map(([id, n]) => (
            <button key={id} onClick={() => setFotoModus(id)} className="px-3 py-2"
              style={{ flex: 1, background: fotoModus === id ? C.see : C.weiss, color: fotoModus === id ? C.weiss : C.grau,
                border: `1px solid ${fotoModus === id ? C.see : C.linie}`, borderRadius: 999, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer" }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {fotoModus === "chat" ? <MathildaChatSeite /> : !fotoErlaubt ? <Einwilligung onJa={() => setFotoErlaubt(true)} /> : fotoModus === "aufgabe" ? <FotoAufgaben /> : fotoModus === "weg" ? <WegVomBlatt /> : (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620 }}>

        {!bild && !laden && (
          <section className="mb-10">
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>So funktioniert es</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
              In dreißig Sekunden vom Blatt zur Rückmeldung
            </h2>
            <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
              Du rechnest wie immer auf Papier. Mathilda übernimmt danach den Teil, den sonst niemand macht:
              Sie schaut sich nicht nur an, ob das Ergebnis stimmt, sondern wie du dahin gekommen bist.
            </p>

            <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 20, overflow: "hidden", background: C.seeTief, boxShadow: "0 6px 26px rgba(15,26,51,0.16)" }}>
              {videoQuelle ? (
                <video src={videoQuelle} playsInline controls loop muted
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div className="flex flex-col items-center justify-center" style={{ width: "100%", height: "100%" }}>
                  <div className="flex items-center justify-center" style={{ width: 66, height: 66, borderRadius: 999, background: C.gruenDunkel }}>
                    <div style={{ width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: `19px solid ${C.seeTief}`, marginLeft: 6 }} />
                  </div>
                  <p className="px-8" style={{ color: "#C9D6EE", fontSize: 13, fontWeight: 300, marginTop: 18, textAlign: "center", lineHeight: 1.6 }}>
                    Erklärvideo, quadratischer Ausschnitt aus der Bildmitte
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <p style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300, lineHeight: 1.6 }}>
                Blankopapier, schwarzer Stift, Kamera von oben.
              </p>
              <button onClick={() => videoRef.current?.click()}
                style={{ background: "none", border: "none", color: C.see, fontSize: 12, fontFamily: "inherit", textDecoration: "underline", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}>
                Testvideo laden
              </button>
            </div>
            <input ref={videoRef} type="file" accept="video/*" className="hidden"
              onChange={(e) => videoWaehlen(e.target.files?.[0])} />

            <div className="mt-8">
              {[
                ["Blatt abfotografieren", "Ein Foto von oben genügt. Schief, dunkel oder im falschen Format ist kein Problem, das rechnet die App gerade."],
                ["Mathilda liest mit", "Zeile für Zeile. Sie zeigt dir zuerst, was sie gelesen hat, und erst danach, wo der Weg bricht."],
                ["Ein einziger nächster Schritt", "Keine Notenliste, keine zwölf Verbesserungsvorschläge. Genau eine Sache, die du beim nächsten Blatt anders machst."],
              ].map(([titel, text], i) => (
                <div key={i} className="flex mb-5">
                  <span style={{ color: C.gruenDunkel, fontSize: 14, fontWeight: 700, width: 26, flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{titel}</p>
                    <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.65 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: C.linie, margin: "26px 0" }} />
          </section>
        )}

        {!bild && !laden && (
          <div>
            <button onClick={() => kameraRef.current?.click()} className="w-full px-6 py-7"
              style={{ background: C.gruenDunkel, border: "none", borderRadius: 16, textAlign: "left", cursor: "pointer", color: C.weiss, fontFamily: "inherit", boxShadow: "0 4px 18px rgba(122,88,0,0.25)" }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>Blatt fotografieren</span>
              <span className="block mt-2" style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.6, opacity: 0.9 }}>
                Kamera öffnen und direkt abfotografieren.
              </span>
            </button>

            <button onClick={() => galerieRef.current?.click()} className="w-full px-6 py-7 mt-3"
              style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, textAlign: "left", cursor: "pointer", color: C.tinte, fontFamily: "inherit" }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>Foto aus der Galerie wählen</span>
              <span className="block mt-2" style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>
                Jedes Format, auch HEIC vom iPhone.
              </span>
            </button>

            <p className="mt-6" style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.7 }}>
              Weißes Blankopapier, schwarzer Stift, von oben aufgenommen, gutes Licht. Alles Weitere macht die App.
            </p>

            <div className="mt-12">
              <div style={{ height: 1, background: C.linie, marginBottom: 26 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>Warum das Blatt zählt</p>
              <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.75, marginBottom: 14 }}>
                Die meisten Fehler in Klausuren entstehen nicht, weil jemand den Stoff nicht kann. Sie entstehen,
                weil das Blatt das Denken zusätzlich belastet statt es zu entlasten: drei Schritte in einer Zeile,
                Nebenrechnung mitten im Hauptweg, ein Gleichheitszeichen, das in Wahrheit ein Pfeil ist.
              </p>
              <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.75, marginBottom: 22 }}>
                Genau diese Muster sieht Mathilda. Sie bewertet dein Blatt, niemals dich.
              </p>
              <blockquote style={{ borderLeft: `3px solid ${C.gruenDunkel}`, paddingLeft: 16, margin: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, color: C.tinte }}>
                  Mathe ist kein Talenttest. Mathe ist eine Art zu denken, und diese Art zu denken kann man lernen.
                </p>
              </blockquote>
            </div>
          </div>
        )}

        <input ref={kameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => dateiWaehlen(e.target.files?.[0])} />
        <input ref={galerieRef} type="file" accept="image/*,.heic,.heif" className="hidden"
          onChange={(e) => dateiWaehlen(e.target.files?.[0])} />

        {laden && (
          <Karte><p style={{ fontSize: 15, color: C.grau }}>Foto wird vorbereitet…</p></Karte>
        )}

        {bild && (
          <div>
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 22px rgba(15,26,51,0.12)" }}>
              <img src={bild} alt="Dein Blatt" style={{ width: "100%", display: "block" }} />
            </div>
            <p className="mt-3" style={{ color: C.hellgrau, fontSize: 12, fontWeight: 300 }}>{info}</p>

            <div className="flex flex-wrap gap-3 mt-4">
              {!erg && (
                <button onClick={analysieren} disabled={laeuft} className="px-7 py-3"
                  style={{ background: laeuft ? C.hellgrau : C.gruenDunkel, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: laeuft ? "wait" : "pointer" }}>
                  {laeuft ? "Mathilda liest…" : "Blatt analysieren"}
                </button>
              )}
              <button onClick={drehen} className="px-6 py-3"
                style={{ background: C.weiss, color: C.see, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
                Drehen
              </button>
              <button onClick={zuruecksetzen} className="px-6 py-3"
                style={{ background: "transparent", color: C.grau, border: `1px solid ${C.linie}`, borderRadius: 999, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
                Anderes Blatt
              </button>
            </div>
          </div>
        )}

        {fehler && (
          <Karte style={{ marginTop: 20, borderLeft: `4px solid ${C.signal}` }}>
            <p style={{ fontSize: 14, lineHeight: 1.65 }}>{fehler}</p>
            {roh && (
              <button onClick={() => setZeigeRoh(!zeigeRoh)} className="mt-3"
                style={{ background: "none", border: "none", color: C.grau, fontSize: 13, fontFamily: "inherit", textDecoration: "underline", cursor: "pointer", padding: 0 }}>
                {zeigeRoh ? "Rohantwort ausblenden" : "Rohantwort anzeigen"}
              </button>
            )}
            {zeigeRoh && roh && (
              <pre style={{ marginTop: 12, fontSize: 11, color: C.grau, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{roh}</pre>
            )}
          </Karte>
        )}

        {erg && (
          <div className="mt-10">

            <section className="mb-8">
              <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: C.see }}>Das habe ich gelesen</h2>
              <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, marginBottom: 14, lineHeight: 1.6 }}>
                Stimmt etwas nicht? Dann liegt es an der Schrift, nicht an dir.
              </p>
              <Karte style={{ padding: 0, overflow: "hidden" }}>
                {(erg.zeilen || []).map((z, i) => (
                  <div key={i} className="flex px-5 py-3" style={{ borderBottom: i < erg.zeilen.length - 1 ? `1px solid ${C.linie}` : "none" }}>
                    <span style={{ color: C.hellgrau, fontSize: 12, width: 22, flexShrink: 0, paddingTop: 3 }}>{i + 1}</span>
                    <span style={{ color: zeilenFarbe(z.s), fontSize: 15, fontWeight: z.s === "fehler" ? 600 : 400, lineHeight: 1.5 }}>
                      {z.t}
                      {z.s === "unklar" && <span style={{ color: C.hellgrau, fontSize: 12, fontWeight: 400 }}> · unsicher gelesen</span>}
                    </span>
                  </div>
                ))}
              </Karte>
              {erg.hinweis && <p className="mt-3" style={{ color: C.grau, fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>{erg.hinweis}</p>}
              {erg.neuesFoto ? (
                <Karte style={{ marginTop: 14, borderLeft: `4px solid ${C.signal}` }}>
                  <p style={{ fontSize: 15, lineHeight: 1.6 }}>Ich kann dein Blatt nicht sicher lesen. Mach bitte ein neues Foto – gerade von oben, mit gutem Licht.</p>
                  <button type="button" onClick={zuruecksetzen} className="mt-4 px-6 py-3"
                    style={{ background: C.see, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Neues Foto</button>
                </Karte>
              ) : abschriftOk === null ? (
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.tinte }}>Stimmt die Abschrift?</span>
                  <button type="button" onClick={() => setAbschriftOk(true)} style={{ minHeight: 40, padding: "0 18px", borderRadius: 999, border: "none", background: C.see, color: C.weiss, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Ja, weiter</button>
                  <button type="button" onClick={zuruecksetzen} style={{ minHeight: 40, padding: "0 18px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Nein, neues Foto</button>
                </div>
              ) : null}
            </section>

            {abschriftOk && !erg.neuesFoto && (<>

            <section className="mb-8">
              <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.see }}>Der Rechenweg</h2>
              <Karte style={{ borderLeft: `4px solid ${erg.fehler?.zeile ? C.signal : C.see}` }}>
                {erg.fehler?.zeile ? (
                  <>
                    <p style={{ fontSize: 15, lineHeight: 1.65 }}>
                      Bis Zeile {erg.fehler.zeile - 1} trägt der Weg. In Zeile {erg.fehler.zeile} bricht er: {erg.fehler.was}
                    </p>
                    {erg.fehler.richtig && <p className="mt-3" style={{ fontSize: 15, lineHeight: 1.65, color: C.see, fontWeight: 500 }}>{erg.fehler.richtig}</p>}
                  </>
                ) : (
                  <p style={{ fontSize: 15, lineHeight: 1.65 }}>Die Kette hält von oben bis unten. Kein Bruch gefunden.</p>
                )}
              </Karte>
            </section>

            {erg.gelungen && (
              <section className="mb-8">
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.see }}>Das ist schon gut</h2>
                <Karte style={{ borderLeft: `4px solid ${C.smaragd}` }}><p style={{ fontSize: 15, lineHeight: 1.65 }}>{erg.gelungen}</p></Karte>
              </section>
            )}

            {(erg.papier?.art === "karo" || erg.papier?.art === "liniert" || erg.stift?.hinweis) && (
              <section className="mb-8">
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.see }}>Papier und Stift</h2>
                {(erg.papier?.art === "karo" || erg.papier?.art === "liniert") && (
                  <Karte>
                    <p style={{ fontSize: 15, lineHeight: 1.65, fontWeight: 600 }}>Blankopapier statt {erg.papier.art === "karo" ? "Karo" : "Linien"}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 12 }}>
                      {erg.papier.jetzt && (<div><p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: C.hellgrau, marginBottom: 6 }}>SO SIEHT ES JETZT AUS</p>
                        <pre style={{ margin: 0, padding: "10px 12px", borderRadius: 10, background: C.sand, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, Menlo, monospace" }}>{erg.papier.jetzt}</pre></div>)}
                      {erg.papier.blanko && (<div><p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: C.see, marginBottom: 6 }}>SO AUF BLANKO</p>
                        <pre style={{ margin: 0, padding: "10px 12px", borderRadius: 10, background: C.weiss, border: `1px solid ${C.linie}`, fontSize: 13.5, lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, Menlo, monospace" }}>{erg.papier.blanko}</pre></div>)}
                    </div>
                    {erg.papier.frage && <p className="mt-3" style={{ fontSize: 14.5, color: C.see, fontWeight: 600, lineHeight: 1.6 }}>{erg.papier.frage}</p>}
                  </Karte>
                )}
                {erg.stift?.hinweis && (
                  <Karte style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 15, lineHeight: 1.65 }}>{erg.stift.hinweis}</p>
                  </Karte>
                )}
              </section>
            )}

            <section className="mb-8">
              <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: C.see }}>Wie du gearbeitet hast</h2>
              <p style={{ fontSize: 15, marginBottom: 16, fontWeight: 300, color: C.grau }}>Struktur {erg.gesamt} von 10</p>
              <Karte>
                {REGELN.map((name, i) => {
                  const r = (erg.regeln || [])[i] || { p: 0, b: "" };
                  return (
                    <div key={i} style={{ marginBottom: i === REGELN.length - 1 ? 0 : 20 }}>
                      <div className="flex justify-between items-baseline mb-2">
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
                        <span style={{ fontSize: 13, color: C.hellgrau }}>{r.p}</span>
                      </div>
                      <div style={{ height: 5, background: C.himmel, borderRadius: 999 }}>
                        <div style={{ height: 5, borderRadius: 999, width: `${Math.max(0, Math.min(10, r.p || 0)) * 10}%`, background: r.p >= 7 ? C.see : C.signal }} />
                      </div>
                      {r.b && <p className="mt-2" style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.55 }}>{r.b}</p>}
                    </div>
                  );
                })}
              </Karte>

              {(erg.fatal || []).length > 0 && (
                <div className="mt-5">
                  <p style={{ fontSize: 13, color: C.grau, marginBottom: 8, fontWeight: 300 }}>Auf diesem Blatt sichtbar:</p>
                  <div className="flex flex-wrap gap-2">
                    {erg.fatal.map((f, i) => (
                      <span key={i} className="px-4 py-2" style={{ background: C.weiss, border: `1px solid ${C.signal}`, borderRadius: 999, fontSize: 13, color: C.signal }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {(erg.unvereinfacht || []).length > 0 && (
              <section className="mb-8">
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.see }}>Hier kannst du noch weiterrechnen</h2>
                <Karte style={{ padding: 0, overflow: "hidden" }}>
                  {erg.unvereinfacht.map((u, i) => (
                    <div key={i} className="px-5 py-3" style={{ borderBottom: i < erg.unvereinfacht.length - 1 ? `1px solid ${C.linie}` : "none" }}>
                      <p style={{ fontSize: 13, color: C.hellgrau }}>{u.zeile ? `Zeile ${u.zeile}` : ""}</p>
                      <p style={{ fontSize: 15, lineHeight: 1.55 }}>{u.was} <span style={{ color: C.see, fontWeight: 600 }}>{u.weiter}</span></p>
                    </div>
                  ))}
                </Karte>
              </section>
            )}

            {(erg.zusammenhang || erg.muster || (erg.hebel || []).length > 0) && (
              <section className="mb-8">
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.see }}>Was dahintersteckt</h2>
                <Karte>
                  {(erg.hebel || []).slice(0, 2).map((h, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}><b style={{ color: C.see }}>Hebel {i + 1}:</b> {h}</p>)}
                  {erg.zusammenhang && <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}><b style={{ color: C.see }}>Zusammenhang:</b> {erg.zusammenhang}</p>}
                  {erg.muster && <p style={{ fontSize: 15, lineHeight: 1.65 }}><b style={{ color: C.see }}>Muster:</b> {erg.muster}</p>}
                </Karte>
              </section>
            )}

            {erg.aufgabe && (
              <section className="mb-8">
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.see }}>Deine Aufgabe</h2>
                <Karte style={{ borderLeft: `4px solid ${C.flaggold}` }}>
                  <p style={{ fontSize: 15.5, lineHeight: 1.65, fontWeight: 500 }}>{erg.aufgabe}</p>
                  <p className="mt-2" style={{ fontSize: 13, color: C.grau, lineHeight: 1.55 }}>Schreib die Stelle selbst neu und schick mir danach ein neues Foto.</p>
                </Karte>
              </section>
            )}

            <div style={{ background: `linear-gradient(160deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, overflow: "hidden" }}>
              <div className="px-6 pt-6 pb-7">
                <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#C9D6EE" }}>Dein nächstes Blatt</h2>
                <p style={{ fontSize: 17, lineHeight: 1.6, fontWeight: 500, color: C.weiss }}>{erg.schritt}</p>
              </div>
            </div>
            </>)}

            <button onClick={() => setZeigeRoh(!zeigeRoh)} className="mt-6"
              style={{ background: "none", border: "none", color: C.hellgrau, fontSize: 12, fontFamily: "inherit", textDecoration: "underline", cursor: "pointer", padding: 0 }}>
              {zeigeRoh ? "Rohantwort ausblenden" : "Rohantwort anzeigen"}
            </button>
            {zeigeRoh && roh && (
              <pre style={{ marginTop: 12, fontSize: 11, color: C.grau, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{roh}</pre>
            )}
          </div>
        )}
      </div>
      )}
      </>
      )}
      </React.Suspense>
      {!istEntwurf(ansicht) && (
        <FeedbackKnopf aktuell={{
          ansicht,
          ziel: ansicht === "training" ? trainZiel : ansicht === "ki" ? genZiel : undefined,
          klasse: ansicht === "klasse" ? klasseAktiv : undefined,
          kurs: ansicht === "kurse" ? kursStart || undefined : undefined,
          bereich: ansicht === "formeln" ? formelBereich : undefined,
          trainer: ansicht === "kopf" ? kopfTrainer || undefined : undefined,
          land: ansicht === "landeswettbewerb" ? landWahl : undefined,
          kompetenz: einheitId || undefined,
          foto: ansicht === "analyse" ? fotoModus : undefined,
        }} />
      )}
      {!istEntwurf(ansicht) && <Fusszeile gehe={gehe} />}
      <MatheTastaturHost />
    </div>
  );
}

