/* ============================================================
   KURS VEKTOREN, GERADEN UND EBENEN (ansicht "vekkurs", Pfad /vektoren-geraden-ebenen)
   Gleiche Bauweise wie der Kurs Differentialrechnung (funcDiffKurs.jsx):
   Ein Modul je Unterkapitel des Schulbuchs „Vektoren, Geraden und Ebenen“ (Band 2):
     1. das Kapitel zum Lesen (Lesefunktion des Buchs, nur die Seiten
        dieses Kapitels: /buecher/vektoren/index.html?von=…&bis=…)
     2. darunter alle Trainingswerkzeuge zu diesem Kapitel – sie öffnen
        sich als Pop-up-Fenster im Modul, man verlässt den Kurs nicht.
   Farben: Tiefblau (C.vkNacht … C.vkNebel) mit warmem Gold (TIEFBLAU in kursFarben.js);
   Kopf, Fortschritt und Modulliste aus funcKursKopf.jsx (wie bei allen Kursen).
   Fortschritt (gelesen/geübt) liegt im localStorage dieses Geräts.

   EINFÜGEN, SOBALD DAS HEFT FERTIG IST (schulbuch/vektoren/LIESMICH.md):
     1. Buch bauen und den Viewer nach public/buecher/vektoren kopieren.
     2. BUCH_BEREIT = true setzen.
     3. von/bis in KURS_MODULE mit dist/verzeichnis.json abgleichen
        (Dateinummer = Seitenzahl), Lösungsseiten (loes) eintragen.
     4. Zahl der Module in der Startseiten-Kachel prüfen (VekKursKachel, module=…).
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { WERKZEUGE } from "./werkzeuge.js";
import { lazyLaden, ChunkGrenze } from "./chunkSchutz.jsx";
import { WZ_SEITEN, Laden } from "./funcWerkzeugSeite.jsx";
import { springe } from "./sprung.js";
import { WerkzeugKarte, KartenStil } from "./funcVekKursKarten.jsx";
import { KURS_MODULE, KAPITEL, TITEL_KURZ, KAPITEL_KURZ, BUCH_BEREIT } from "./vekKursDaten.js";
import { TIEFBLAU } from "./kursFarben.js";
import { MotivEbene } from "./funcKursMotive.jsx";
import { KursKopf, FortschrittKarte, Hinweis, KapitelKopf, ModulKarte, ModulListe, IconBuch, IconWerkzeug, IconVideo } from "./funcKursKopf.jsx";

export { KURS_MODULE, KAPITEL, BUCH_BEREIT };

const BUCH = "/buecher/vektoren/index.html";

/* Rollen wie im Differentialrechnungskurs: baby = Akzent auf Dunkel bzw. helle Fläche, hell = Nebel,
   tief = Linie/Fortschritt, schwarz = Nacht, gold = Akzentschrift auf Hell, leucht = Gold auf Dunkel */
const K = { baby: C.vkHell, hell: C.vkNebel, tief: C.vkBlau, blau: C.vkBlau, schwarz: C.vkNacht, gold: C.vkTief, leucht: C.vkGold, weiss: C.weiss };

const lazy = (lader, name) => lazyLaden(() => lader().then((m) => ({ default: m[name] })));
const Geradengleichung = lazy(() => import("./funcGeradengleichung.jsx"), "Geradengleichung");
const LGSLoeser = lazy(() => import("./funcLGS.jsx"), "LGSLoeser");

const wz = (id) => WERKZEUGE[id] || {};
const ausWz = (id, extra) => ({ titel: wz(id).name, zeile: wz(id).zeile, zeichen: wz(id).zeichen, ansicht: id, ...extra });
const wzSeite = (id) => ausWz(id, { breit: true, render: ({ gehe }) => { const S = WZ_SEITEN[id].Komp; return <S gehe={gehe} ansicht={id} />; } });

/* Alle Werkzeuge des Kurses. ansicht = Ziel der „In der App öffnen“-Knöpfe im Buch
   (Namen der Werkzeuge im Heft: schulbuch/vektoren/STIL.md) */
export const KURS_WERKZEUGE = {
  geraden2d: ausWz("geradengleichung", { zeile: "y = m · x + c aus Punkt und Steigung oder zwei Punkten", breit: true, render: () => <Geradengleichung start="pq" /> }),
  lgs: ausWz("lgs", { breit: true, render: () => <LGSLoeser /> }),
  vektorgenerator: wzSeite("vektorgenerator"),
  zweipunkte: wzSeite("zweipunkte"),
  dreipunkte: wzSeite("dreipunkte"),
  ebenen: wzSeite("ebenen"),
  geraden: wzSeite("geraden"),
  winkel: wzSeite("winkel"),
  kreuzprodukt: wzSeite("kreuzprodukt"),
  ebenevsebene: wzSeite("ebenevsebene"),
  abstaende: wzSeite("abstaende"),
};

/* Anzahl Erklärvideos je Modul (noch keine produziert → 0); später: videos: n im Modul eintragen */
const videosVon = (m) => m.videos || 0;

/* ---------- Platzhalter, solange das Heft entsteht ---------- */
function BuchPlatzhalter({ modul }) {
  const seiten = modul.bis - modul.von + 1;
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, aspectRatio: "794 / 1123", maxHeight: 520, width: "100%",
      background: `linear-gradient(160deg, ${K.hell} 0%, #fff 55%, ${K.hell} 100%)`, border: `1.5px solid ${K.baby}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "28px 24px", boxSizing: "border-box" }}>
      <svg aria-hidden="true" viewBox="0 0 200 140" style={{ width: "min(62%, 240px)", height: "auto", marginBottom: 18 }}>
        <path d="M40 110 L150 92 L180 30 L70 48 Z" fill="rgba(36,87,197,0.12)" stroke={K.blau} strokeWidth="1.6" />
        <line x1="20" y1="30" x2="190" y2="118" stroke={K.schwarz} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="108" y1="73" x2="126" y2="22" stroke={C.vkGold} strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="108" cy="73" r="5" fill={K.schwarz} />
      </svg>
      <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", color: K.gold, margin: "0 0 6px" }}>
        {modul.kap === "L" || modul.kap === "A" ? KAPITEL[modul.kap].toUpperCase() : `KAPITEL ${modul.kap} · ${KAPITEL[modul.kap].toUpperCase()}`}
      </p>
      <p style={{ fontSize: 19, fontWeight: 800, color: K.schwarz, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Dieses Kapitel wird gerade geschrieben.</p>
      <p style={{ fontSize: 14, color: "#2C3756", lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
        Bald liest du hier {seiten === 1 ? "die Seite" : `die ${seiten} Seiten`} aus unserem Heft „Vektoren, Geraden und Ebenen“.
        {modul.werkzeuge.length > 0 ? " Die Werkzeuge darunter kannst du schon jetzt benutzen." : ""}
      </p>
    </div>
  );
}

/* ---------- Fortschritt ---------- */
const SPEICHER = "mm_vekkurs";
const standLesen = () => { try { return { gelesen: {}, geuebt: {}, haken: {}, ...JSON.parse(localStorage.getItem(SPEICHER) || "{}") }; } catch (e) { return { gelesen: {}, geuebt: {}, haken: {} }; } };
const standSchreiben = (s) => { try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch (e) { /* egal */ } };
/* Solange das Heft fehlt, zählt nur das Üben (Module ohne Werkzeuge bleiben offen) */
const fertigAuto = (m, s) => (BUCH_BEREIT ? !!s.gelesen[m.id] && (m.werkzeuge.length === 0 || !!s.geuebt[m.id]) : m.werkzeuge.length > 0 && !!s.geuebt[m.id]);
/* Antippen der Zahl in der Übersicht setzt den Haken von Hand (gold); ohne eigene Wahl entscheidet der Fortschritt */
const fertig = (m, s) => (s.haken && typeof s.haken[m.id] === "boolean" ? s.haken[m.id] : fertigAuto(m, s));

const nachOben = () => springe("vekkurs-modul", () => window.scrollTo({ top: 0, behavior: "auto" }));

/* ---------- Kleine Bausteine ---------- */
function Haken({ an, farbe = K.leucht }) {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 11, flex: "none", alignItems: "center", justifyContent: "center",
      background: an ? farbe : "transparent", border: an ? "none" : `1.5px solid ${C.linie}` }}>
      {an && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke={K.schwarz} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
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
const KAPITEL_ZAHL = Object.keys(KAPITEL).filter((k) => k !== "L" && k !== "A").length;
export function VekKursKopf({ untertitel, kompakt }) {
  return (
    <KursKopf farben={TIEFBLAU} Motiv={MotivEbene} id="ks-vek" titel="Vektoren, Geraden und Ebenen" zeile={untertitel} kompakt={kompakt}
      chips={[
        { icon: <IconBuch />, text: `${KURS_MODULE.length} Module` },
        { icon: <IconVideo />, text: `${KAPITEL_ZAHL} Kapitel + Abitur` },
        { icon: <IconWerkzeug />, text: "Lesen, dann trainieren" },
      ]} />
  );
}

/* ---------- Übersicht ---------- */
function Uebersicht({ stand, setStand, oeffnen }) {
  /* Zahl antippen = Modul von Hand als geschafft markieren bzw. wieder lösen (nur die Zahl, nicht der Balken) */
  const hakenUmschalten = (m) => setStand((s) => {
    const neu = { ...s, haken: { ...s.haken, [m.id]: !fertig(m, s) } };
    standSchreiben(neu);
    return neu;
  });
  const zahl = KURS_MODULE.filter((m) => fertig(m, stand)).length;
  const weiterMit = KURS_MODULE.find((m) => !fertig(m, stand)) || KURS_MODULE[0];
  const kapitel = ["I", "II", "III", "IV", "V", "VI", "A", "L"];
  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
      <FortschrittKarte farben={TIEFBLAU} zahl={zahl} gesamt={KURS_MODULE.length} einheit="Module" einheitDativ="Modulen" onKnopf={() => oeffnen(weiterMit.id)}
        knopf={zahl === 0 ? "Kurs starten" : "Weiter mit"} ziel={`${weiterMit.nr ? weiterMit.nr + " " : ""}${TITEL_KURZ[weiterMit.id] || weiterMit.titel}`} />

      <Hinweis>
        Jedes Modul ist ein Kapitel aus unserem Heft: Du liest es direkt hier und trainierst darunter mit den passenden Werkzeugen.
        {BUCH_BEREIT ? " Geschafft ist ein Modul, wenn du bis zur letzten Seite gelesen und mindestens ein Werkzeug benutzt hast – oder du tippst die Zahl an und setzt den Haken selbst." : " Das Heft entsteht gerade – die Werkzeuge kannst du schon jetzt in jedem Modul benutzen."}
      </Hinweis>

      {kapitel.map((k) => (
        <section key={k}>
          <KapitelKopf farben={TIEFBLAU} marke={k !== "L" && k !== "A" ? k : null} titel={KAPITEL_KURZ[k] || KAPITEL[k]} voll={KAPITEL[k]} />
          <ModulListe>
            {KURS_MODULE.filter((m) => m.kap === k).map((m) => {
              const ok = fertig(m, stand);
              const seiten = m.bis - m.von + 1;
              const meta = [{ icon: <IconBuch />, text: `${seiten} S.`, label: `${seiten} ${seiten === 1 ? "Seite" : "Seiten"} lesen` }];
              if (m.werkzeuge.length > 0) meta.push({ icon: <IconWerkzeug />, text: `${m.werkzeuge.length} Tools`, label: `${m.werkzeuge.length} Werkzeuge` });
              meta.push({ icon: <IconVideo />, text: `${videosVon(m)} ${videosVon(m) === 1 ? "Video" : "Videos"}`, label: `${videosVon(m)} Videos` });
              return (
                <ModulKarte key={m.id} klasse="vk-modul" farben={TIEFBLAU} nr={m.nr} zeichen={m.id === "loes" ? "✓" : m.kap === "A" ? "A" : "T"} titel={TITEL_KURZ[m.id] || m.titel} voll={m.titel}
                  meta={meta} ok={ok} onClick={() => oeffnen(m.id)} onHaken={() => hakenUmschalten(m)}
                  hakenLabel={`${m.nr ? "Modul " + m.nr : m.titel}: ${ok ? "als geschafft markiert – antippen zum Zurücknehmen" : "als geschafft markieren"}`} />
              );
            })}
          </ModulListe>
        </section>
      ))}
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
    <div className="vk-fenster-hintergrund" onMouseDown={(e) => { if (e.target === e.currentTarget) zu(); }}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,12,16,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, boxSizing: "border-box" }}>
      <style>{`@media (max-width:640px){.vk-fenster-hintergrund{padding:0 !important;align-items:flex-end !important}.vk-fenster{max-height:94dvh !important;border-radius:20px 20px 0 0 !important;width:100% !important}}
        @keyframes vkEin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .vk-fenster{animation:vkEin .18s ease-out}
        @media (prefers-reduced-motion:reduce){.vk-fenster{animation:none}}`}</style>
      <div className="vk-fenster" role="dialog" aria-modal="true" aria-label={w.titel}
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
    <button type="button" onClick={() => blaettern(richtung)} disabled={aus} className="vk-pfeil"
      aria-label={richtung < 0 ? "Vorherige Buchseite" : "Nächste Buchseite"}
      style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${aus ? C.linie : K.schwarz}`, background: aus ? K.weiss : K.schwarz, color: aus ? C.grau : K.weiss,
        opacity: aus ? 0.45 : 1, cursor: aus ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={richtung < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
  const w = offen ? KURS_WERKZEUGE[offen] : null;

  return (
    <div className="vk-seite">
      <style>{`.vk-nav-unten{display:none}
        @media (max-width:839px){.vk-nav-unten{display:flex}.vk-nav-oben,.vk-zwei{display:none !important}}
        .vk-seite{width:100%;max-width:620px;margin:0 auto;padding:0 20px 64px 18px;box-sizing:border-box}
        @media (min-width:840px){.vk-seite{width:735px;max-width:735px;margin-left:calc(50% - 355px);margin-right:0;padding:0 0 64px}}`}</style>
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
          <p style={{ minWidth: 0, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", lineHeight: 1.5, color: K.gold, margin: "2px 0 0" }}>
            {modul.kap === "L" || modul.kap === "A" ? KAPITEL[modul.kap].toUpperCase() : (
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
            {BUCH_BEREIT && seitenZahl > 1 && (
              <button type="button" onClick={umschalten} aria-pressed={zwei} className="vk-zwei"
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
          {BUCH_BEREIT && seitenZahl > 1 && (
            <div className="vk-nav-oben" style={{ display: "inline-flex", alignItems: "center", gap: 10, flex: "none" }} role="group" aria-label="Buchseiten blättern">
              {pfeil(-1, nr <= 1)}
              <span aria-live="polite" style={{ fontSize: 13.5, fontWeight: 700, color: K.schwarz, minWidth: 74, textAlign: "center", whiteSpace: "nowrap" }}>{anzeige}</span>
              {pfeil(1, seite >= hoechste)}
            </div>
          )}
        </div>
      </div>

      {BUCH_BEREIT ? (
        <div style={{ background: "#fff", aspectRatio: zweiEff ? "1588 / 1123" : "794 / 1123", width: "100%" }}>
          <iframe key={modul.id} ref={rahmen} title={`Kapitel ${modul.titel} lesen`} src={`${BUCH}?von=${modul.von}&bis=${modul.bis}&voll=${zweiStart.current ? 2 : 1}`}
            style={{ display: "block", width: "100%", height: "100%", border: 0 }} />
        </div>
      ) : <BuchPlatzhalter modul={modul} />}

      {BUCH_BEREIT && seitenZahl > 1 && (
        <div className="vk-nav-unten" style={{ justifyContent: "flex-end", margin: "12px 0 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }} role="group" aria-label="Buchseiten blättern">
            {pfeil(-1, nr <= 1)}
            <span aria-live="polite" style={{ fontSize: 13.5, fontWeight: 700, color: K.schwarz, minWidth: 74, textAlign: "center", whiteSpace: "nowrap" }}>{anzeige}</span>
            {pfeil(1, seite >= hoechste)}
          </div>
        </div>
      )}

      {modul.werkzeuge.length > 0 && (
        <div style={{ margin: "30px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: K.weiss, background: K.schwarz, padding: "5px 10px", borderRadius: 7 }}>2 · TRAINIEREN</span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.grau }}><Haken an={!!stand.geuebt[modul.id]} />geübt</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: K.schwarz, margin: "8px 0 4px" }}>Werkzeuge zu diesem Kapitel</h3>
          <p style={{ fontSize: 14, color: C.grau, margin: "0 0 14px", lineHeight: 1.6 }}>Tippe auf ein Werkzeug – es öffnet sich als Fenster direkt hier im Modul.</p>
          <KartenStil />
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
            {modul.werkzeuge.map((id) => (
              <WerkzeugKarte key={id} id={id} t={KURS_WERKZEUGE[id]} an={offen === id} oeffnen={werkzeugOeffnen} schliessen={() => setOffen(null)} Zeichen={Zeichen} />
            ))}
          </div>
        </div>
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
export function VekKursSeite({ gehe }) {
  const [stand, setStand] = React.useState(stand0);
  const [modulId, setModulId] = React.useState(null);
  const modul = KURS_MODULE.find((m) => m.id === modulId);
  const oeffnen = (id) => { setModulId(id); nachOben(); };
  const zurUebersicht = () => { setModulId(null); nachOben(); };
  return (
    <>
      <VekKursKopf kompakt={!!modul} untertitel={modul ? `${KURS_MODULE.length} Module · Kapitel lesen, dann trainieren` : "Vom Gleichungssystem bis zum Abstand windschiefer Geraden – lesen, dann trainieren."} />
      {modul
        ? <Modul key={modul.id} modul={modul} stand={stand} setStand={setStand} oeffnen={oeffnen} zurUebersicht={zurUebersicht} gehe={gehe} />
        : <Uebersicht stand={stand} setStand={setStand} oeffnen={oeffnen} />}
    </>
  );
}
function stand0() { return standLesen(); }
