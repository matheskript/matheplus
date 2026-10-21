import { mitMathildaAI } from "./mathildaName.jsx";
import { lazyLaden, ChunkGrenze } from "./chunkSchutz.jsx";
import React, { useState, useRef, useEffect } from "react";
import { API_URL, C, REGELN, VIDEO_URL, blattPrompt } from "./base1.jsx";
import { KOMP } from "./base3.jsx";
import { NAV, SCHULKLASSEN, kiKopf, kiAntwort } from "./base4.jsx";
import { dekodieren, jsonLesen, rendern } from "./func1.jsx";
import { ToolMenue, werkzeugMerken } from "./func2.jsx";
import { Startseite, StartModusSchalter } from "./funcStartseite.jsx";
import { startModusSetzen, modusAusPfad } from "./startModus.js";
import { WerkzeugLeiste, WerkzeugBand } from "./funcWerkzeuge.jsx";
import { wo } from "./werkzeuge.js";
import { pfadAufloesen, pfadFuer } from "./pfade.js";
import { TeilenKnopf } from "./funcTeilen.jsx";
import { teilenInfo } from "./teilen.js";
import { hinweisVerwerfen } from "./uebergabe.js";
import { FR } from "./funcRegistry.jsx";
import { AufklappStil, AufklappZeichen, aufklappScrollStarten } from "./aufklappen.jsx";
import { Text, Zeile } from "./func3.jsx";
import { Klausur, Kurvendiskussion } from "./func4.jsx";
import { Fortschritt, Kopfrechnen } from "./func5.jsx";
import { Einstufung, Lernlandkarte, Liniennetz, Profil, lernLaden, lernLeer, lernSnapshot, lernVomKonto, useLern } from "./func6.jsx";
import { syncStarten } from "./lernSync.js";
import { entdeckenSyncStarten } from "./entdeckenSync.js";
import { penpaperSyncStarten } from "./penpaperSync.js";
import { LernpfadSeite } from "./funcLernpfad.jsx";
import { KapitelTrainingSeite } from "./funcKapitelTraining.jsx";
import { KapitelSeite } from "./funcKapitelSeite.jsx";
import { MathildaChatSeite } from "./funcMathildaChat.jsx";
import { MathildaKopf, FotoStart, SoArbeitetMathilda } from "./funcMathildaSeite.jsx";
import { kameraWunschSetzen } from "./kameraWunsch.js";
import { uebenWunschLesen, uebenWunschVerwerfen } from "./uebenWunsch.js";
import { BlattScanner } from "./funcBlattScanner.jsx";
import { mathildaSystem } from "./mathildaKontext.js";
import { Operatoren, Wiederholen } from "./func7.jsx";
import { Messbericht, Modellieren, Probeabitur, Wochenbericht } from "./func8.jsx";
import { Auswertung, Einwilligung, KiEinwilligungFenster, einwilligungLesen } from "./func9.jsx";
import { TrainingFortschritt, PruefungsLink } from "./funcTraining.jsx";
import { Fusszeile } from "./funcRecht.jsx";
import { HauptMenue } from "./funcHauptmenue.jsx";
import { Kopfleiste } from "./funcKopfleiste.jsx";
import { Arbeitsmenue } from "./funcArbeitsmenue.jsx";
import { FeedbackKnopf } from "./funcFeedback.jsx";
import { MatheTastaturHost } from "./matheTastatur.jsx";
import { LAENDER } from "./funcWettbewerbe.jsx";
import { ENTWUERFE, istEntwurf, LANDING, istFrei } from "./seitenKonstanten.js";
import { ansichtErlaubt } from "./angebot.js";
const EntwurfTor = lazyLaden(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfTor })));
const KapitelFormelnSeite = lazyLaden(() => import("./funcKapitelFormeln.jsx").then((m) => ({ default: m.KapitelFormelnSeite })));
const ChallengeSeite = lazyLaden(() => import("./funcChallenge.jsx").then((m) => ({ default: m.ChallengeSeite })));
const Landingpage = lazyLaden(() => import("./funcLandingpage.jsx").then((m) => ({ default: m.Landingpage })));
import { Laden, SeitenKopf, WerkzeugSeite, istWzSeite } from "./funcWerkzeugSeite.jsx";
/* Seiten werden erst beim Öffnen nachgeladen (je eigener Chunk) */
const ElternkursSeite = lazyLaden(() => import("./funcElternkurs.jsx").then((m) => ({ default: m.ElternkursSeite })));
const NachhilfekursSeite = lazyLaden(() => import("./funcNachhilfekurs.jsx").then((m) => ({ default: m.NachhilfekursSeite })));
const DokumenteSeite = lazyLaden(() => import("./funcDokumente.jsx").then((m) => ({ default: m.DokumenteSeite })));
/* Blog (öffentlich): /blog und /blog/<slug>, Daten in blogDaten.js */
const BlogSeite = lazyLaden(() => import("./funcBlog.jsx").then((m) => ({ default: m.BlogSeite })));
const EntdeckenSeite = lazyLaden(() => import("./funcEntdecken.jsx").then((m) => ({ default: m.EntdeckenSeite })));
const PenPaperKursSeite = lazyLaden(() => import("./funcPenPaperKurs.jsx").then((m) => ({ default: m.PenPaperKursSeite })));
const KontoSeite = lazyLaden(() => import("./funcKonto.jsx").then((m) => ({ default: m.KontoSeite })));
const ImpressumSeite = lazyLaden(() => import("./funcRecht.jsx").then((m) => ({ default: m.ImpressumSeite })));
const AGBSeite = lazyLaden(() => import("./funcRecht.jsx").then((m) => ({ default: m.AGBSeite })));
const WiderrufSeite = lazyLaden(() => import("./funcRecht.jsx").then((m) => ({ default: m.WiderrufSeite })));
const DatenschutzSeite = lazyLaden(() => import("./funcRecht.jsx").then((m) => ({ default: m.DatenschutzSeite })));
const EinwilligungSeite = lazyLaden(() => import("./funcEinwilligung.jsx").then((m) => ({ default: m.EinwilligungSeite })));
const ElternabendSeite = lazyLaden(() => import("./funcElternabend.jsx").then((m) => ({ default: m.ElternabendSeite })));
const SpendenSeite = lazyLaden(() => import("./funcSpendenSeite.jsx").then((m) => ({ default: m.SpendenSeite })));
const DiffKursSeite = lazyLaden(() => import("./funcDiffKurs.jsx").then((m) => ({ default: m.DiffKursSeite })));
const VekKursSeite = lazyLaden(() => import("./funcVekKurs.jsx").then((m) => ({ default: m.VekKursSeite })));
const UnterstufeSeite = lazyLaden(() => import("./funcUnterstufe.jsx").then((m) => ({ default: m.UnterstufeSeite })));
/* Mathe Abi Masterclass: Kursbereich für Teilnehmer und Zugang über den persönlichen Link */
const MasterclassKursSeite = lazyLaden(() => import("./funcMasterclassKurs.jsx").then((m) => ({ default: m.MasterclassKursSeite })));
const MasterclassZugangSeite = lazyLaden(() => import("./funcMasterclassKurs.jsx").then((m) => ({ default: m.MasterclassZugangSeite })));
const SchulbuchSeite = lazyLaden(() => import("./funcSchulbuch.jsx").then((m) => ({ default: m.SchulbuchSeite })));
const KlausurBriefkasten = lazyLaden(() => import("./funcKlausurBriefkasten.jsx").then((m) => ({ default: m.KlausurBriefkasten })));
/* Lehrer-Arbeitsblatt-Generator und Lehrkräfte-Seite: eigener Chunk */
const ArbeitsblattSeite = lazyLaden(() => import("./funcArbeitsblatt.jsx").then((m) => ({ default: m.ArbeitsblattSeite })));
const LehrkraefteSeite = lazyLaden(() => import("./funcLehrkraefte.jsx").then((m) => ({ default: m.LehrkraefteSeite })));
const BuchBlatt = lazyLaden(() => import("./funcBlatt.jsx").then((m) => ({ default: m.BuchBlatt })));   // QR-Codes der Schulbücher: /b1/25-1
const BundeswettbewerbSeite = lazyLaden(() => import("./funcWettbewerbe.jsx").then((m) => ({ default: m.BundeswettbewerbSeite })));
const LandeswettbewerbeSeite = lazyLaden(() => import("./funcWettbewerbe.jsx").then((m) => ({ default: m.LandeswettbewerbeSeite })));
const LandeswettbewerbSeite = lazyLaden(() => import("./funcWettbewerbe.jsx").then((m) => ({ default: m.LandeswettbewerbSeite })));
const MasterclassSeite = lazyLaden(() => import("./funcMasterclass.jsx").then((m) => ({ default: m.MasterclassSeite })));
const MatheCheckenSeite = lazyLaden(() => import("./funcMasterclass.jsx").then((m) => ({ default: m.MatheCheckenSeite })));
const EntwurfVorher = lazyLaden(() => import("./funcVorher.jsx").then((m) => ({ default: m.EntwurfVorher })));
const EntwurfBiro = lazyLaden(() => import("./funcVorher.jsx").then((m) => ({ default: m.EntwurfBiro })));
const EntwurfWerkzeuge = lazyLaden(() => import("./funcStartArchiv.jsx").then((m) => ({ default: m.EntwurfWerkzeuge })));
const EbbinghausSeite = lazyLaden(() => import("./funcEbbinghaus.jsx").then((m) => ({ default: m.EbbinghausSeite })));
const AbiKettenSeite = lazyLaden(() => import("./funcAbiKetten.jsx").then((m) => ({ default: m.AbiKettenSeite })));
const AbiSaetzeSeite = lazyLaden(() => import("./funcAbiSaetze.jsx").then((m) => ({ default: m.AbiSaetzeSeite })));
const MeinTrainingSeite = lazyLaden(() => import("./funcMeinTraining.jsx").then((m) => ({ default: m.MeinTrainingSeite })));
const Geradengleichung = lazyLaden(() => import("./funcGeradengleichung.jsx").then((m) => ({ default: m.Geradengleichung })));
const Ableitungstrainer = lazyLaden(() => import("./func13.jsx").then((m) => ({ default: m.Ableitungstrainer })));
const ParabelTrainer = lazyLaden(() => import("./funcParabelTrainer.jsx").then((m) => ({ default: m.ParabelTrainer })));
const StammIntegral = lazyLaden(() => import("./funcStammIntegral.jsx").then((m) => ({ default: m.StammIntegral })));
const AdvancedPlotter = lazyLaden(() => import("./func12.jsx").then((m) => ({ default: m.AdvancedPlotter })));
const LGSLoeser = lazyLaden(() => import("./funcLGS.jsx").then((m) => ({ default: m.LGSLoeser })));
const Gleichungsloeser = lazyLaden(() => import("./funcGleichungen.jsx").then((m) => ({ default: m.Gleichungsloeser })));
const GfsKursSeite = lazyLaden(() => import("./funcGfsKurs.jsx").then((m) => ({ default: m.GfsKursSeite })));
const KiWahlSeite = lazyLaden(() => import("./funcKiWahl.jsx").then((m) => ({ default: m.KiWahlSeite })));
const ClaudeKursSeite = lazyLaden(() => import("./funcClaudeKurs.jsx").then((m) => ({ default: m.ClaudeKursSeite })));
const GfsPascalSeite = lazyLaden(() => import("./funcGfs.jsx").then((m) => ({ default: m.GfsPascalSeite })));
const GfsDoseSeite = lazyLaden(() => import("./funcGfsDose.jsx").then((m) => ({ default: m.GfsDoseSeite })));
const PotenzregelSeite = lazyLaden(() => import("./func22.jsx").then((m) => ({ default: m.PotenzregelSeite })));
const EFunktionSeite = lazyLaden(() => import("./funcEFunktion.jsx").then((m) => ({ default: m.EFunktionSeite })));
const AnalysisZentrum = lazyLaden(() => import("./func14.jsx").then((m) => ({ default: m.AnalysisZentrum })));
const KopfrechenZentrum = lazyLaden(() => import("./func14.jsx").then((m) => ({ default: m.KopfrechenZentrum })));
const Begruenden = lazyLaden(() => import("./func7.jsx").then((m) => ({ default: m.Begruenden })));
const EinheitSpieler = lazyLaden(() => import("./func7.jsx").then((m) => ({ default: m.EinheitSpieler })));
const MeinPlan = lazyLaden(() => import("./func8.jsx").then((m) => ({ default: m.MeinPlan })));
const KlasseAnsicht = lazyLaden(() => import("./func9.jsx").then((m) => ({ default: m.KlasseAnsicht })));
const KlausurVorbereitung = lazyLaden(() => import("./func9.jsx").then((m) => ({ default: m.KlausurVorbereitung })));
const TrainingSeite = lazyLaden(() => import("./funcTraining.jsx").then((m) => ({ default: m.TrainingSeite })));
const Trainingszentrum = lazyLaden(() => import("./funcTrainingszentrum.jsx").then((m) => ({ default: m.Trainingszentrum })));
const DifferenzenquotientSeite = lazyLaden(() => import("./func5.jsx").then((m) => ({ default: m.DifferenzenquotientSeite })));
const FotoAufgaben = lazyLaden(() => import("./func4.jsx").then((m) => ({ default: m.FotoAufgaben })));
const GeneratorHub = lazyLaden(() => import("./func5.jsx").then((m) => ({ default: m.GeneratorHub })));
const WegVomBlatt = lazyLaden(() => import("./func5.jsx").then((m) => ({ default: m.WegVomBlatt })));
const Trainingsbereich = lazyLaden(() => import("./func1.jsx").then((m) => ({ default: m.Trainingsbereich })));
const Kurse = lazyLaden(() => import("./func1.jsx").then((m) => ({ default: m.Kurse })));
const KIAufgaben = lazyLaden(() => import("./func1.jsx").then((m) => ({ default: m.KIAufgaben })));
const EntwurfStart = lazyLaden(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfStart })));
const EntwurfChecken = lazyLaden(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfChecken })));
const EntwurfPakete = lazyLaden(() => import("./funcEntwuerfe.jsx").then((m) => ({ default: m.EntwurfPakete })));
const Plotter = lazyLaden(() => import("./func3.jsx").then((m) => ({ default: m.Plotter })));
/* Head & Numbers wird erst beim Öffnen nachgeladen (eigener Chunk, nicht im Hauptbündel) */
const FormelsammlungNeu = lazyLaden(() => import("./funcFormelsammlung.jsx").then((m) => ({ default: m.FormelsammlungNeu })));
const HeadNumbersSeite = lazyLaden(() => import("./funcHeadNumbers.jsx").then((m) => ({ default: m.HeadNumbersSeite })));
/* Bereich „Gleichungen“ (Verstehen · Rechnen · Training): eigener Chunk */
const GleichungenSeite = lazyLaden(() => import("./funcGleichKurs.jsx").then((m) => ({ default: m.GleichungenSeite })));
import { EBB_SLOGAN } from "./funcEbbinghaus.jsx";
import { useKonto, kontoStarten } from "./konto.js";
import { linkAusUrlMerken as masterclassLinkMerken, autoEinloesen as masterclassAutoEinloesen } from "./masterclassZugang.js";
import { englisch, spracheWechseln } from "./i18n.js";

import { springe, springeZuId } from "./sprung.js";
import { GfsThemenKopf, DosenBild, PascalBild } from "./funcGfsThemenKopf.jsx";
// Menü-Button im Header: vorübergehend aus (true = wieder einblenden)
const ZEIGE_MENUE = false;

export function Mathilda() {
  /* Abgeschaltete Angebote (angebot.js) führen auf die Startseite; mit dem Passwort „skript“ bleiben sie für Basti offen */
  const [ansichtRoh, setAnsicht] = useState(() => {
    try {
      masterclassLinkMerken();   // /masterclass/zugang?z=… → Code merken, aus der Adresse nehmen
      const q = new URLSearchParams(window.location.search);
      if (q.has("konto") || q.has("pro")) return "konto";
      if (q.get("ticket") === "danke") return "elternabend";
      const h = window.location.hash.slice(1);
      if (h === LANDING || ENTWUERFE.some((e) => e.ansicht === h)) return h;   // ältere Links mit #landingpage / #entwurf-…
      /* /start-hell und /start-dunkel wählen den Modus der Startseite (startModus.js) und landen auf "/" */
      const sm = modusAusPfad(window.location.pathname);
      if (sm) { startModusSetzen(sm); window.history.replaceState({}, "", "/" + window.location.search); return "start"; }
      const pz = pfadAufloesen(window.location.pathname);   // Direct Links wie /elternabend (pfade.js)
      return pz ? pz.ansicht : "start";
    } catch (e) { return "start"; }
  });
  const ansicht = ansichtErlaubt(ansichtRoh, istFrei());
  // Rückkehr von Stripe nach erfolgreicher Ticketbuchung
  const [ticketGebucht] = useState(() => { try { return new URLSearchParams(window.location.search).get("ticket") === "danke"; } catch (e) { return false; } });
  const konto = useKonto();
  // Masterclass: gemerkten Teilnehmer-Code nach der Anmeldung automatisch mit dem Konto verbinden
  useEffect(() => { if (konto.nutzer && konto.profil) masterclassAutoEinloesen(konto); }, [konto.nutzer, konto.profil]);
  useEffect(() => {
    kontoStarten();
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.get("pro") === "danke") { try { sessionStorage.setItem("mm-pro-danke", "1"); } catch (e) { /* privat */ } }
      if (u.searchParams.has("konto") || u.searchParams.has("ticket") || u.searchParams.has("pro")) { u.searchParams.delete("konto"); u.searchParams.delete("ticket"); u.searchParams.delete("pro"); window.history.replaceState({}, "", u.pathname + u.search + u.hash); }
      /* Sprung aus den öffentlichen Formelseiten: /?formel=<id> öffnet die Formel in der Formelsammlung */
      /* App-Verknüpfungen und Push: /?ansicht=<name> öffnet eine Ansicht; ?quelle=app stammt aus dem Startbildschirm */
      const a = u.searchParams.get("ansicht");
      if (u.searchParams.has("quelle") || a) {
        u.searchParams.delete("quelle"); u.searchParams.delete("ansicht"); window.history.replaceState({}, "", u.pathname + u.search + u.hash);
        const erlaubt = ["trainingszentrum", "meintraining", "formeln", "lernpfad", "challenge", "konto", "kopf", "entdecken", "headnumbers", "gleichkurs", "ebbinghaus", "fehlertraining", "warmup", "unterstufe"];
        if (a && (erlaubt.includes(a) || istWzSeite(a) || wo(a))) setTimeout(() => gehe({ ansicht: a }), 0);
      }
      const f = u.searchParams.get("formel");
      if (f && /^[a-z0-9-]{1,60}$/.test(f)) {
        u.searchParams.delete("formel"); window.history.replaceState({}, "", u.pathname + u.search + u.hash);
        setTimeout(() => gehe({ ansicht: "formeln", formel: f }), 0);
      }
    } catch (e) { /* ignorieren */ }
    try {   // Direct Link: Unterziel (Werkzeug-Modus, Klasse, Trainer …) aus dem Pfad übernehmen
      const pz = pfadAufloesen(window.location.pathname);
      if (pz && pz.ansicht === "trainieren") {
        /* QR-Code vom Arbeitsblatt: /trainieren?kapitel=quad&teil=quad.4&schulart=g9&box=9 (nicht ?klasse=, das ist der Klassenbeitritt) */
        const u = new URL(window.location.href), k = u.searchParams.get("kapitel");
        if (k && /^[a-zA-Z0-9]{2,20}$/.test(k)) {
          const teil = u.searchParams.get("teil"), art = u.searchParams.get("schulart"), kl = u.searchParams.get("box");
          ["kapitel", "teil", "schulart", "box"].forEach((x) => u.searchParams.delete(x));
          window.history.replaceState({}, "", u.pathname + u.search + u.hash);
          gehe({ ...pz, kapitel: k, teil: teil && /^[a-zA-Z0-9]{2,20}\.\d{1,2}$/.test(teil) ? teil : null,
            schulart: ["g8", "g9", "gms"].includes(art) ? art : undefined, klasse: kl && /^[0-9-]{1,5}$/.test(kl) ? kl : undefined });
        } else gehe(pz);
      } else if (pz && pz.ansicht !== "start") gehe(pz);
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
  const [gkSeite, setGkSeite] = useState(null);             // direkt geöffneter Reiter im Bereich Gleichungen
  const [wzSeite, setWzSeite] = useState(null);             // Reiter eines Werkzeugs mit Unterpfaden (Textaufgaben: verstehen | training | mathilda)
  const [hnModul, setHnModul] = useState(null);             // direkt geöffneter Bereich von Head & Numbers
  const [usSeite, setUsSeite] = useState(null);             // Modul Unterstufe: klasse-5 | klasse-6 | Lerneinheit (Pfad /unterstufe/…)
  const [blogSeite, setBlogSeite] = useState(null);         // Blog: Slug des offenen Beitrags (Pfad /blog/<slug>) oder null = Übersicht
  const [entdeckenStart, setEntdeckenStart] = useState(null);   // direkt geöffnetes Lernangebot in „Mathe entdecken“
  const [landWahl, setLandWahl] = useState("bw");
  const [formelBereich, setFormelBereich] = useState("analysis");
  const [formelZiel, setFormelZiel] = useState(null);
  const [trainierenZiel, setTrainierenZiel] = useState(null);   // „Eine Sache trainieren“: { kapitel, teil, schulart, klasse }
  const [tzStart, setTzStart] = useState(null);   // Trainingszentrum: Session direkt starten, z. B. "programm:ableiten-zehn"
  const [kapitelSeiteZiel, setKapitelSeiteZiel] = useState(null);   // Kapitelseite: { kapitel, schulart, klasse }
  const [kapitelZiel, setKapitelZiel] = useState(null);   // Formelauswahl zum Buchkapitel (Quickfinder)   // Deep-Link auf eine einzelne Formel   // Bereich der Formelsammlung          // Bundesland der Landeswettbewerb-Seite
  const [sprung, setSprung] = useState(null);
  const [fotoModus, setFotoModus] = useState("blatt");
  /* Aufgabenblatt zu einem QR-Code aus dem Schulbuch (/b1/25-1, pfade.js → ansicht "blatt") */
  const [blattZiel, setBlattZiel] = useState(() => { try { const pz = pfadAufloesen(window.location.pathname); return pz && pz.ansicht === "blatt" ? pz : {}; } catch (e) { return {}; } });
  const [terminStart, setTerminStart] = useState(null);
  const [klasseAktiv, setKlasseAktiv] = useState(8);
  const [kursStart, setKursStart] = useState(null);
  const [fotoErlaubt, setFotoErlaubt] = useState(() => !!einwilligungLesen());
  React.useEffect(() => { const ja = () => setFotoErlaubt(true); window.addEventListener("mm-ki-einwilligung-erteilt", ja); return () => window.removeEventListener("mm-ki-einwilligung-erteilt", ja); }, []);
  const [scanOffen, setScanOffen] = useState(false);
  const [scanNachEinwilligung, setScanNachEinwilligung] = useState(false);
  const fotoBereichRef = useRef(null);
  const [trainZiel, setTrainZiel] = useState(null);
  const [genZiel, setGenZiel] = useState(null);
  const [gruppeOffen, setGruppeOffen] = useState(null);
  const [einheitId, setEinheitId] = useState(null);
  const [pfadStart, setPfadStart] = useState(null);   // Lernpfad: direkt in eine Einheit springen

  React.useEffect(() => { lernLaden().then(() => syncStarten({ lesen: lernSnapshot, anwenden: lernVomKonto, leer: lernLeer })); }, []);
  React.useEffect(() => { entdeckenSyncStarten(); }, []);
  React.useEffect(() => { penpaperSyncStarten(); }, []);
  const lern = useLern();

  const [seitenOffen, setSeitenOffen] = useState(false);
  const [hmOffen, setHmOffen] = useState(null);   // Hauptmenü oben: welches Fenster ist offen
  useEffect(() => { aufklappScrollStarten(); }, []);
  useEffect(() => { werkzeugMerken(ansicht); }, [ansicht]);   // für „Weitermachen“ auf der Startseite
  // Werkzeugseiten: kein grauer Rand – weiße Fläche über die ganze Breite, direkt unter dem blauen Kopf (Regeln in index.css)
  useEffect(() => {
    const wz = !!(wo(ansicht) && wo(ansicht).werkzeug);
    if (wz) document.documentElement.setAttribute("data-wz-voll", "1"); else document.documentElement.removeAttribute("data-wz-voll");
    return () => document.documentElement.removeAttribute("data-wz-voll");
  }, [ansicht]);
  // Adresszeile folgt der Seite: /elternabend, /ableitungstrainer, /klasse-10 … (Pfade: pfade.js).
  // Erster Lauf und Zurück/Vor-Taste ersetzen die Adresse, jede eigene Navigation legt einen Verlaufseintrag an.
  const adressErsterLauf = useRef(true);
  const adressAusVerlauf = useRef(0);   // Zeitpunkt der letzten Zurück/Vor-Taste
  const adressZustand = {
    ansicht, klasse: klasseAktiv, land: landWahl, trainer: kopfTrainer, seite: ansicht === "gleichkurs" ? gkSeite : ansicht === "textaufgaben" ? wzSeite : ansicht === "unterstufe" ? usSeite : ansicht === "blog" ? blogSeite : entdeckenStart, kurs: kursStart,
    ziel: ansicht === "training" ? trainZiel : ansicht === "ki" ? genZiel : undefined,
    foto: ansicht === "analyse" ? fotoModus : undefined,
    ...(ansicht === "blatt" ? { band: blattZiel.band, seite: blattZiel.seite, nr: blattZiel.nr, kasten: blattZiel.kasten } : {}),
    ...(ansicht === "kapitel" && kapitelSeiteZiel ? { kapitel: kapitelSeiteZiel.kapitel } : {}),
  };
  useEffect(() => {
    try {
      const soll = pfadFuer(adressZustand) || "/";
      const jetzt = window.location.pathname.replace(/\/+$/, "") || "/";
      const h = window.location.hash.slice(1);
      const altAnker = h === LANDING || istEntwurf(h);   // ältere #-Links ablösen; andere Anker (Anmelde-Rückkehr) bleiben
      const rest = window.location.search + (altAnker ? "" : window.location.hash);
      const erster = adressErsterLauf.current;
      const ausVerlauf = Date.now() - adressAusVerlauf.current < 1000;
      adressErsterLauf.current = false;
      if (erster) {
        /* Beim Start gilt die Adresse: Unterziele (Klasse, Modus …) setzt gehe() gleich danach.
           Nur Kurzformen (Alias) werden auf den schönen Pfad umgeschrieben. */
        const pz = pfadAufloesen(window.location.pathname);
        if (pz && pz.ansicht === ansicht && !altAnker) {
          const kan = pfadFuer(pz);
          if (kan && kan !== jetzt) window.history.replaceState({}, "", kan + rest);
          return;
        }
      }
      if (jetzt === soll && !altAnker) return;
      if (erster || ausVerlauf) window.history.replaceState({}, "", soll + rest);
      else window.history.pushState({}, "", soll + rest);
    } catch (e) { /* ignorieren */ }
  }, [ansicht, trainZiel, genZiel, fotoModus, klasseAktiv, kopfTrainer, entdeckenStart, kursStart, landWahl, wzSeite, usSeite, blogSeite, kapitelSeiteZiel]);
  // Zurück/Vor-Taste des Browsers
  useEffect(() => {
    const f = () => {
      try { adressAusVerlauf.current = Date.now(); FR.gehe(pfadAufloesen(window.location.pathname) || { ansicht: "start" }); } catch (e) { /* ignorieren */ }
    };
    window.addEventListener("popstate", f);
    return () => window.removeEventListener("popstate", f);
  }, []);
  const gehe = (eintrag) => {
    // Gast ohne Passwort (nur Rechtsseiten freigegeben, middleware.js): alles andere über eine echte Seitenanfrage
    if (!["impressum", "datenschutz", "agb", "widerruf", "einwilligung", "lehrkraefte", "lehrerblatt", "blatt"].includes(eintrag.ansicht)
        && typeof document !== "undefined" && /(?:^|;\s*)mm_gast=1/.test(document.cookie)) {
      window.location.assign("/");
      return;
    }
    if (!eintrag.uebergabe) hinweisVerwerfen();
    { const w = uebenWunschLesen(); if (w && w.werkzeug !== eintrag.ansicht) uebenWunschVerwerfen(); }   // Üben-Wunsch gilt nur für das gewünschte Werkzeug
    setAnsicht(eintrag.ansicht);
    setSeitenOffen(false); setHmOffen(null);
    if (eintrag.ansicht === "training") setTrainZiel(eintrag.ziel ?? null);
    if (eintrag.ansicht === "ki") setGenZiel(eintrag.ziel ?? null);
    if (eintrag.foto) setFotoModus(eintrag.foto);
    if (eintrag.ansicht === "blatt") setBlattZiel(eintrag);
    if (eintrag.kompetenz) setEinheitId(eintrag.kompetenz);
    if (eintrag.ansicht === "lernpfad") setPfadStart(eintrag.einheit ? { einheit: eintrag.einheit, zeit: Date.now() } : null);
    if (eintrag.ansicht === "vorbereiten") setTerminStart(eintrag.termin || null);
    if (eintrag.ansicht === "klasse") setKlasseAktiv(eintrag.klasse);
    setKursStart(eintrag.ansicht === "kurse" ? eintrag.kurs || null : null);
    setKopfTrainer(eintrag.ansicht === "kopf" ? eintrag.trainer || null : null);
    setHnModul(eintrag.ansicht === "headnumbers" ? eintrag.modul || null : null);
    setGkSeite(eintrag.ansicht === "gleichkurs" ? eintrag.seite || null : null);
    setUsSeite(eintrag.ansicht === "unterstufe" ? eintrag.seite || null : null);
    setBlogSeite(eintrag.ansicht === "blog" ? eintrag.seite || null : null);
    setWzSeite(eintrag.ansicht === "textaufgaben" ? eintrag.seite || null : null);
    setEntdeckenStart(eintrag.ansicht === "entdecken" ? eintrag.seite || null : null);
    setEntdeckenStart(eintrag.ansicht === "entdecken" ? eintrag.seite || null : null);
    if (eintrag.land) setLandWahl(eintrag.land);
    if (eintrag.ansicht === "formeln") { setFormelBereich(eintrag.bereich || "analysis"); setFormelZiel(eintrag.formel || null); }
    if (eintrag.ansicht === "trainingszentrum") setTzStart(eintrag.start ? { kennung: eintrag.start, zeit: Date.now() } : null);
    if (eintrag.ansicht === "trainieren") setTrainierenZiel(eintrag.kapitel ? { kapitel: eintrag.kapitel, teil: eintrag.teil || null, schulart: eintrag.schulart, klasse: eintrag.klasse, zeit: Date.now() } : null);
    if (eintrag.ansicht === "kapitel") setKapitelSeiteZiel(eintrag.kapitel ? { kapitel: eintrag.kapitel, schulart: eintrag.schulart, klasse: eintrag.klasse } : null);
    if (eintrag.ansicht === "kapitelformeln") setKapitelZiel(eintrag.kapitel ? { kapitel: eintrag.kapitel, schulart: eintrag.schulart, klasse: eintrag.klasse, modus: eintrag.modus } : null);
    setMenuOffen(false); setGruppeOffen(null);
    springe("seitenwechsel", () => window.scrollTo(0, 0));
    if (eintrag.abschnitt) springeZuId("konto-abschnitt", "konto-" + eintrag.abschnitt);   // z. B. Hauptmenü → Meine Kinder
  };
  FR.toolMenue = ToolMenue;   // Menü im Vollbild der Regel-Eingabe (funcRegelwerk.jsx)
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
  const videoQuelle = VIDEO_URL;

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

  // Kopfbereich jeder Werkzeugseite: die Werkzeug-Leiste aus werkzeuge.js
  // (Bereich · Station, Werkzeuge der Station, Umschalter, „Weiter“ zur nächsten Station).
  // Das alte ☰ „Menü mit allen Bereichen“ gibt es hier nicht mehr: oben steht das Hauptmenü,
  // der alte Bereichsbaum liegt im Arbeitsmenü der Fußzeile.
  const SektionsMenue = () => {
    const ort = wo(ansicht);
    if (!ort) return null;
    return (<>
      <WerkzeugLeiste ansicht={ansicht} gehe={gehe} />
      {ansicht !== "sinus" && ansicht !== "steckbrief" && <PruefungsLink ansicht={ansicht} gehe={gehe} klein />}
    </>);
  };

  /* Trainingswerkzeuge (Ableitungstrainer, Geraden, Parabeln, Stammfunktion & Integral): Kopfleiste wie überall,
     darunter nur das dünne Werkzeug-Band (WerkzeugBand) statt des großen Seitenkopfs */
  const band = <WerkzeugBand ansicht={ansicht} gehe={gehe} testKnopf={<PruefungsLink ansicht={ansicht} gehe={gehe} band />} />;

  return (
    <div className="app-wurzel" style={{ background: C.sand, color: C.tinte, fontFamily: "Montserrat, system-ui, sans-serif", minHeight: "100vh" }}>
      <AufklappStil />
      <style>{`/* Schriften: lokal über @fontsource (main.jsx) */
      .kachel { transition: transform .16s ease, box-shadow .16s ease; }
      .held { position: relative; }
      .test-knopf-klein { position: absolute; top: 41px; right: 24px; }
      .held:has(.test-knopf-klein) h1 { padding-right: 70px; }
      @media (max-width:520px){ .test-knopf-klein { top: 14px; } }
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

      {/* Kopfleiste mit Menü (src/funcKopfleiste.jsx): folgt dem Modus der Startseite, Besucher bekommen das feste Menü */}
      <Kopfleiste ansicht={ansicht} gehe={gehe} hmOffen={hmOffen} setHmOffen={setHmOffen} fotoModus={fotoModus} wzSeite={wzSeite}
        zurStartseite={() => { setAnsicht("start"); setMenuOffen(false); setGruppeOffen(null); setSeitenOffen(false); springe("seitenwechsel", () => window.scrollTo(0, 0)); }}>
        {menuOffen && (
          <div style={{ background: C.seeTief, maxHeight: "72vh", overflowY: "auto" }}>
            <div className="mx-auto px-6 py-2" style={{ maxWidth: 620 }}>
              <button onClick={() => { setAnsicht("start"); setMenuOffen(false); setGruppeOffen(null); springe("seitenwechsel", () => window.scrollTo(0, 0)); }}
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
      </Kopfleiste>

      <ChunkGrenze key={ansicht}>
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
                  <button key={k} onClick={() => { setKlasseAktiv(k); springe("seitenwechsel", () => window.scrollTo(0, 0)); }}
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
      ) : ansicht === "trainingszentrum" ? (
        <Trainingszentrum key={tzStart ? tzStart.zeit : "tz"} gehe={gehe} start={tzStart ? tzStart.kennung : null} />
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
      ) : ansicht === "abisaetze" ? (
        <>
          <div style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(24px, 7vw, 34px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Abi-Sätze</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Zehn komplette Aufgabensätze im Stil des Abiturs: Teil A ohne Hilfsmittel, Teil B mit WTR – mit Verrechnungspunkten.</p>
            </div>
            <Welle fill={C.sand} />
          </div>
          <AbiSaetzeSeite />
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
      ) : istWzSeite(ansicht) ? (
        <WerkzeugSeite ansicht={ansicht} gehe={gehe} menue={<SektionsMenue />} seite={ansicht === "textaufgaben" ? wzSeite : null} setSeite={setWzSeite} />
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
          {band}
          <Ableitungstrainer />
        </>
      ) : ansicht === "parabeln" ? (
        <>
          {band}
          <ParabelTrainer />
        </>
      ) : ansicht === "stammintegral" ? (
        <>
          {band}
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
        <><Startseite gehe={gehe} /><StartModusSchalter /></>
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
      ) : ansicht === "entwurf-biro" ? (
        <EntwurfTor gehe={gehe}><EntwurfBiro /></EntwurfTor>
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
          {band}
          <Geradengleichung />
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
      ) : ansicht === "diffkurs" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <DiffKursSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "vekkurs" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <VekKursSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "unterstufe" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <UnterstufeSeite gehe={gehe} seite={usSeite} setSeite={setUsSeite} />
        </React.Suspense>
      ) : ansicht === "kiwahl" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <KiWahlSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "claudekurs" || ansicht === "geminikurs" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <ClaudeKursSeite gehe={gehe} kurs={ansicht === "geminikurs" ? "gemini" : "claude"} />
        </React.Suspense>
      ) : ansicht === "mckurs" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <MasterclassKursSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "mczugang" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <MasterclassZugangSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "schulbuch" ? (
        <>
          <SeitenKopf titel="Schulbuch: Ableitungen" groesse="clamp(26px, 7.6vw, 34px)" rund>
            <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Von der Geraden bis zur Kettenregel – 50 Seiten zum Blättern.</p>
          </SeitenKopf>
          <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
            <SchulbuchSeite gehe={gehe} />
          </React.Suspense>
        </>
      ) : ansicht === "klausurbriefkasten" ? (
        <div className="mx-auto px-4 pb-16" style={{ maxWidth: 620 }}>
          <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
            <KlausurBriefkasten gehe={gehe} />
          </React.Suspense>
        </div>
      ) : ansicht === "blatt" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>Wird geladen …</p>}>
          <BuchBlatt gehe={gehe} band={blattZiel.band} seite={blattZiel.seite} nr={blattZiel.nr} kasten={!!blattZiel.kasten} />
        </React.Suspense>
      ) : ansicht === "lehrerblatt" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <ArbeitsblattSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "lehrkraefte" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <LehrkraefteSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "spenden" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <SpendenSeite gehe={gehe} />
        </React.Suspense>
      ) : ansicht === "elternabend" ? (
        <EntwurfTor gehe={gehe}><ElternabendSeite gebucht={ticketGebucht} /></EntwurfTor>
      ) : ansicht === "dokumente" ? (
        <EntwurfTor gehe={gehe}><DokumenteSeite /></EntwurfTor>
      ) : ansicht === "blog" ? (
        <BlogSeite gehe={gehe} seite={blogSeite} setSeite={setBlogSeite} />
      ) : ansicht === "challenge" ? (
        <>
          <SeitenKopf titel="Klassen-Challenge" groesse="clamp(26px, 7.6vw, 31px)" rund>
            <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Punkte für die ganze Klasse – jede Woche neu.</p>
          </SeitenKopf>
          <ChallengeSeite gehe={gehe} />
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
      ) : ansicht === "datenschutz" ? (
        <>
          <SeitenKopf titel="Datenschutz" groesse="clamp(26px, 7.6vw, 31px)" rund>
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Welche Daten wir verarbeiten, warum, wie lange – und welche Rechte du hast.</p>
          </SeitenKopf>
          <DatenschutzSeite gehe={gehe} />
        </>
      ) : ansicht === "einwilligung" ? (
        <>
          <SeitenKopf titel="Zustimmung der Eltern" groesse="clamp(26px, 7.6vw, 31px)" rund>
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Für Schüler unter 16 Jahren.</p>
          </SeitenKopf>
          <EinwilligungSeite />
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
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>MATHESKRIPT · BAND 2</p>
              <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Pen &amp; Paper</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Dein Blatt denkt mit. Neun Lektionen, ein Prinzip: Nähe = Priorität – so schreibst du Mathe auf, dass dein Blatt dich entlastet.
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
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: "clamp(26px, 7.6vw, 36px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Standortcheck</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Wo stehst du wirklich? Fünfzehn Minuten Check mit Ampel – dein Tagesplan lebt in Mein Mathe-Training.</p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <LernpfadSeite key={pfadStart ? `${pfadStart.einheit}-${pfadStart.zeit}` : "plan"} gehe={gehe} start={pfadStart} />
        </>
      ) : ansicht === "meintraining" || ansicht === "trainingsplan" ? (
        <>
          <SeitenKopf titel="Mein Mathe-Training" groesse="clamp(26px, 7.6vw, 36px)" rund>
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Was mache ich heute? Wo stehe ich? Dein Tagesplan, deine Themen, deine Wiederholungen – an einem Ort.</p>
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
      ) : ansicht === "gleichkurs" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 640 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.flaggold, marginBottom: 8 }}>{englisch() ? "UNDERSTAND · SOLVE · TRAIN" : "VERSTEHEN · RECHNEN · TRAINING"}</p>
              <h1 className="titel-silber" style={{ fontWeight: 800, fontSize: "clamp(28px, 8.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>{englisch() ? "Equations" : "Gleichungen"}</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                {englisch() ? "Information about a number – and the way to find it. From 7 · x = 56 to 2^x = 32." : "Eine Information über eine Zahl – und der Weg zu ihr. Von 7 · x = 56 bis 2ˣ = 32."}
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px 0" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
            <GleichungenSeite gehe={gehe} start={gkSeite} onSeite={setGkSeite} />
          </React.Suspense>
        </>
      ) : (ansicht === "headnumbers" || ansicht === "kopf") ? (
        <>
          {/* Kopfbereich im Mathilda-Look kommt aus den Seiten selbst (funcKopfrechnenKopf.jsx) */}
          <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px 0" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
            {ansicht === "kopf" && kopfTrainer
              ? <KopfrechenZentrum key={kopfTrainer} start={kopfTrainer} onZurueck={() => gehe({ ansicht: "headnumbers" })} />
              : <HeadNumbersSeite key={hnModul || "start"} gehe={gehe} start={hnModul} />}
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
      ) : ansicht === "trainieren" ? (
        <KapitelTrainingSeite key={ansicht + (trainierenZiel ? `${trainierenZiel.kapitel}-${trainierenZiel.teil}-${trainierenZiel.zeit}` : "")} ansicht={ansicht} ziel={trainierenZiel} gehe={gehe} />
      ) : ansicht === "kapitel" ? (
        <KapitelSeite key={kapitelSeiteZiel ? kapitelSeiteZiel.kapitel : "wahl"} ziel={kapitelSeiteZiel} gehe={gehe} />
      ) : ansicht === "kapitelformeln" ? (
        <React.Suspense fallback={<p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: "24px", textAlign: "center" }}>{englisch() ? "Loading …" : "Wird geladen …"}</p>}>
          <KapitelFormelnSeite key={kapitelZiel ? kapitelZiel.kapitel + (kapitelZiel.modus || "") : "q"} ziel={kapitelZiel} gehe={gehe} />
        </React.Suspense>
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
      ) : ansicht === "gfs" ? (
        <GfsKursSeite gehe={gehe} />
      ) : ansicht === "gfs-pascal" ? (
        <>
          <GfsThemenKopf titel="Pascal’sches Dreieck" chips={["Klasse 10", "Kap. V", "Video + Beweis"]} Bild={PascalBild}
            farben={{ schein2: "rgba(165,0,68,0.34)" }} onZurueck={() => gehe({ ansicht: "gfs" })} />
          <GfsPascalSeite gehe={gehe} />
        </>
      ) : ansicht === "gfs-dose" ? (
        <>
          <GfsThemenKopf titel="Die optimale Dose" chips={["Kursstufe 1", "Kap. I", "6 Animationen"]} Bild={DosenBild}
            onZurueck={() => gehe({ ansicht: "gfs" })} />
          <GfsDoseSeite gehe={gehe} />
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
      ) : ansicht === "efunktion" ? (
        <>
          <div className="kopfblock" style={{ background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
            <div className="held mx-auto px-6 pt-10 pb-4" style={{ maxWidth: 620 }}>
              <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Die natürliche Exponentialfunktion</h1>
              <div style={{ width: 54, height: 4, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)`, borderRadius: 2, marginTop: 18, marginBottom: 18 }} />
              <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>
                Minikurs in sechs Schritten: von aˣ zur Eulerschen Zahl e, Eigenschaften, „e gewinnt“, Ableiten — mit Visualisierung, Trainer und allen Buchaufgaben.
              </p>
            </div>
            <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0" }} />
          </div>
          <EFunktionSeite gehe={gehe} />
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

      <MathildaKopf modus={fotoModus} setModus={setFotoModus}
        onText={() => gehe({ ansicht: "textaufgaben", seite: "mathilda" })}
        onTextKamera={() => { kameraWunschSetzen("text"); gehe({ ansicht: "textaufgaben", seite: "mathilda" }); }}
        onBriefkasten={() => gehe({ ansicht: "klausurbriefkasten" })}
        onBriefkastenKamera={() => { kameraWunschSetzen("klausur"); gehe({ ansicht: "klausurbriefkasten" }); }}
        onScan={() => {
        setFotoModus("blatt");
        if (!fotoErlaubt) {
          setScanNachEinwilligung(true);
          setTimeout(() => springe("mathilda-foto", () => fotoBereichRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })), 60);
        } else setScanOffen(true);
      }} />
      <BlattScanner offen={scanOffen} onSchliessen={() => setScanOffen(false)}
        onFoto={(datei) => {
          setScanOffen(false); setFotoModus("blatt"); dateiWaehlen(datei);
          setTimeout(() => springe("mathilda-foto", () => fotoBereichRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })), 120);
        }}
        onKameraApp={() => { setScanOffen(false); setTimeout(() => kameraRef.current?.click(), 50); }}
        onGalerie={() => { setScanOffen(false); setTimeout(() => galerieRef.current?.click(), 50); }} />
      <div ref={fotoBereichRef} style={{ scrollMarginTop: 70 }} />

      {!fotoErlaubt ? <Einwilligung onJa={() => { setFotoErlaubt(true); if (scanNachEinwilligung) { setScanNachEinwilligung(false); setScanOffen(true); } }} /> : fotoModus === "chat" ? <MathildaChatSeite /> : fotoModus === "aufgabe" ? <FotoAufgaben /> : fotoModus === "weg" ? <WegVomBlatt /> : (
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 26 }}>

        {!bild && !laden && (
          <div>
            <FotoStart onKamera={() => setScanOffen(true)} onGalerie={() => galerieRef.current?.click()} titel="Scan dein Blatt" blankoWarum />

            {videoQuelle && (
              <div className="mt-8" style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 20, overflow: "hidden", background: C.seeTief, boxShadow: "0 6px 26px rgba(15,26,51,0.16)" }}>
                <video src={videoQuelle} playsInline controls loop muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}

            <section className="mt-12">
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.see, marginBottom: 8 }}>So arbeitet Mathilda</p>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
                In dreißig Sekunden vom Blatt zur Rückmeldung
              </h2>
              <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
                Du rechnest wie immer auf Papier. Mathilda übernimmt danach den Teil, den sonst niemand macht:
                Sie schaut sich nicht nur an, ob das Ergebnis stimmt, sondern wie du dahin gekommen bist.
              </p>
              <SoArbeitetMathilda />
            </section>

            <div className="mt-12">
              <div style={{ height: 1, background: C.linie, marginBottom: 26 }} />
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.see, marginBottom: 10 }}>Warum das Blatt zählt</p>
              <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.75, marginBottom: 14 }}>
                Die meisten Fehler in Klausuren entstehen nicht, weil jemand den Stoff nicht kann. Sie entstehen,
                weil das Blatt das Denken zusätzlich belastet statt es zu entlasten: drei Schritte in einer Zeile,
                Nebenrechnung mitten im Hauptweg, ein Gleichheitszeichen, das in Wahrheit ein Pfeil ist.
              </p>
              <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.75, marginBottom: 22 }}>
                Genau diese Muster sieht Mathilda. Sie bewertet dein Blatt, niemals dich.
              </p>
              <blockquote style={{ borderLeft: `3px solid ${C.flaggold}`, paddingLeft: 16, margin: 0 }}>
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
      </ChunkGrenze>
      {!istEntwurf(ansicht) && (
        <div className={"fuss-paar" + (teilenInfo(ansicht) ? " zwei" : "")}>
          <TeilenKnopf ansicht={ansicht} pfad={pfadFuer(adressZustand) || "/"} />
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
        </div>
      )}
      {!istEntwurf(ansicht) && <Fusszeile gehe={gehe} arbeitsmenue={(stil) => <Arbeitsmenue gehe={gehe} ansicht={ansicht} sprachKnopf={sprachKnopf} stil={stil} />} />}
      <KiEinwilligungFenster />
      <MatheTastaturHost />
    </div>
  );
}

