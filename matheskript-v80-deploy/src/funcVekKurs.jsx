/* ============================================================
   KURS VEKTOREN, GERADEN UND EBENEN (ansicht "vekkurs", Pfad /vektoren-geraden-ebenen)
   Gleiche Bauweise wie der Kurs Differentialrechnung (funcDiffKurs.jsx):
   Ein Modul je Unterkapitel des Schulbuchs „Vektoren, Geraden und Ebenen“ (Band 2):
     1. das Kapitel zum Lesen (Lesefunktion des Buchs, nur die Seiten
        dieses Kapitels: /buecher/vektoren/index.html?von=…&bis=…)
     2. darunter alle Trainingswerkzeuge zu diesem Kapitel – sie öffnen
        sich als Pop-up-Fenster im Modul, man verlässt den Kurs nicht.
   Farben: cooles Lila (C.vkNacht … C.vkNebel) mit warmem Gold.
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

const BUCH = "/buecher/vektoren/index.html";
/* Solange das Heft geschrieben wird: Platzhalter statt Lesefunktion */
export const BUCH_BEREIT = false;

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

/* Ein Modul je Unterkapitel des Hefts. von/bis = Buchseiten (Dateinummer in schulbuch/vektoren/pages = Seitenzahl).
   Die Auftaktseite eines Kapitels gehört wie im Differentialrechnungskurs zum ersten Modul. */
export const KURS_MODULE = [
  { id: "zweigeraden", kap: "I", nr: "1", titel: "Zwei Geraden in der Ebene", frage: "Wo treffen sich zwei Geraden – und warum ist das schon ein Gleichungssystem?", von: 3, bis: 5,
    werkzeuge: ["geraden2d", "lgs"] },
  { id: "gauss", kap: "I", nr: "2", titel: "Das Gauß-Verfahren", frage: "Wie löst man drei Gleichungen mit drei Unbekannten mit System?", von: 6, bis: 7,
    werkzeuge: ["lgs"] },
  { id: "loesungsmengen", kap: "I", nr: "3", titel: "Keine, eine oder unendlich viele Lösungen", frage: "Woran erkennt man, wie viele Lösungen ein Gleichungssystem hat?", von: 8, bis: 9,
    werkzeuge: ["lgs", "ebenevsebene"] },
  { id: "t1", kap: "I", nr: "", titel: "Training I", frage: "Gleichungssysteme – prüfe dich, bevor es in den Raum geht.", von: 10, bis: 10,
    werkzeuge: ["lgs", "geraden2d"] },
  { id: "raum", kap: "II", nr: "4", titel: "Punkte im Raum", frage: "Wie beschreibt man die Lage eines Punktes im Raum?", von: 11, bis: 13,
    werkzeuge: ["ebenen", "vektorgenerator"] },
  { id: "vektoren", kap: "II", nr: "5", titel: "Vektoren", frage: "Was haben alle Pfeile mit gleicher Richtung und Länge gemeinsam?", von: 14, bis: 15,
    werkzeuge: ["vektorgenerator", "zweipunkte"] },
  { id: "rechnen", kap: "II", nr: "6", titel: "Rechnen mit Vektoren", frage: "Wie addiert und vervielfacht man Verschiebungen?", von: 16, bis: 17,
    werkzeuge: ["vektorgenerator"] },
  { id: "linear", kap: "II", nr: "7", titel: "Kollinear, komplanar, linear abhängig", frage: "Wann liegen Vektoren auf einer Linie oder in einer Ebene?", von: 18, bis: 19,
    werkzeuge: ["vektorgenerator", "lgs", "kreuzprodukt"] },
  { id: "t2", kap: "II", nr: "", titel: "Training II", frage: "Punkte und Vektoren im Raum – prüfe dich, bevor die Geraden kommen.", von: 20, bis: 20,
    werkzeuge: ["vektorgenerator", "zweipunkte"] },
  { id: "parameter", kap: "III", nr: "8", titel: "Geraden in Parameterform", frage: "Wie beschreibt man eine Gerade im Raum, wo y = m · x + c nicht mehr reicht?", von: 21, bis: 23,
    werkzeuge: ["zweipunkte", "geraden"] },
  { id: "lagegeraden", kap: "III", nr: "9", titel: "Lage zweier Geraden", frage: "Schneiden, parallel, identisch – oder windschief?", von: 24, bis: 25,
    werkzeuge: ["geraden", "lgs"] },
  { id: "t3", kap: "III", nr: "", titel: "Training III", frage: "Geraden im Raum – alles klar?", von: 26, bis: 26,
    werkzeuge: ["geraden", "zweipunkte"] },
  { id: "skalar", kap: "IV", nr: "10", titel: "Skalarprodukt und Orthogonalität", frage: "Wie erkennt man an Zahlen, dass zwei Vektoren senkrecht stehen?", von: 27, bis: 29,
    werkzeuge: ["winkel", "vektorgenerator"] },
  { id: "winkelvek", kap: "IV", nr: "11", titel: "Winkel zwischen Vektoren", frage: "Wie berechnet man den Winkel zwischen zwei Richtungen im Raum?", von: 30, bis: 31,
    werkzeuge: ["winkel"] },
  { id: "kreuz", kap: "IV", nr: "12", titel: "Das Kreuzprodukt", frage: "Gibt es einen Vektor, der auf zwei Vektoren zugleich senkrecht steht?", von: 32, bis: 33,
    werkzeuge: ["kreuzprodukt", "dreipunkte"] },
  { id: "t4", kap: "IV", nr: "", titel: "Training IV", frage: "Skalar- und Kreuzprodukt gemischt.", von: 34, bis: 34,
    werkzeuge: ["winkel", "kreuzprodukt"] },
  { id: "ebeneparam", kap: "V", nr: "13", titel: "Ebenen in Parameterform", frage: "Wie spannt man mit zwei Richtungen eine Ebene auf?", von: 35, bis: 37,
    werkzeuge: ["dreipunkte", "ebenen"] },
  { id: "normalenform", kap: "V", nr: "14", titel: "Normalenform und Koordinatenform", frage: "Reicht ein einziger Vektor, um eine Ebene festzulegen?", von: 38, bis: 39,
    werkzeuge: ["dreipunkte", "kreuzprodukt", "ebenen"] },
  { id: "spurpunkte", kap: "V", nr: "15", titel: "Umwandeln, Spurpunkte, Zeichnen", frage: "Wie wechselt man zwischen den Formen – und wie zeichnet man eine Ebene?", von: 40, bis: 41,
    werkzeuge: ["ebenen", "dreipunkte"] },
  { id: "geradeebene", kap: "V", nr: "16", titel: "Gerade und Ebene", frage: "Durchstößt die Gerade die Ebene, liegt sie darin oder läuft sie parallel?", von: 42, bis: 43,
    werkzeuge: ["abstaende", "ebenen"] },
  { id: "ebeneebene", kap: "V", nr: "17", titel: "Zwei und drei Ebenen", frage: "Wo schneiden sich Ebenen – und was hat das mit Gleichungssystemen zu tun?", von: 44, bis: 45,
    werkzeuge: ["ebenevsebene", "lgs"] },
  { id: "t5", kap: "V", nr: "", titel: "Training V", frage: "Ebenen in allen Formen – alles klar?", von: 46, bis: 46,
    werkzeuge: ["ebenevsebene", "dreipunkte", "ebenen"] },
  { id: "hnf", kap: "VI", nr: "18", titel: "Abstand Punkt–Ebene", frage: "Wie weit ist ein Punkt von einer Ebene entfernt?", von: 47, bis: 49,
    werkzeuge: ["abstaende"] },
  { id: "punktgerade", kap: "VI", nr: "19", titel: "Abstand Punkt–Gerade", frage: "Wo liegt der Lotfußpunkt – und wie findet man ihn auf zwei Wegen?", von: 50, bis: 51,
    werkzeuge: ["abstaende", "geraden"] },
  { id: "windschief", kap: "VI", nr: "20", titel: "Abstand windschiefer Geraden", frage: "Wie nah kommen sich zwei Geraden, die sich nie treffen?", von: 52, bis: 53,
    werkzeuge: ["abstaende", "geraden"] },
  { id: "schnittwinkel", kap: "VI", nr: "21", titel: "Schnittwinkel", frage: "Unter welchem Winkel schneiden sich Geraden und Ebenen?", von: 54, bis: 55,
    werkzeuge: ["winkel", "ebenevsebene"] },
  { id: "spiegeln", kap: "VI", nr: "22", titel: "Spiegelungen", frage: "Wie spiegelt man einen Punkt an einem Punkt oder an einer Ebene?", von: 56, bis: 57,
    werkzeuge: ["abstaende", "vektorgenerator"] },
  { id: "t6", kap: "VI", nr: "", titel: "Training VI", frage: "Abstände, Winkel, Spiegelungen – prüfe dich.", von: 58, bis: 58,
    werkzeuge: ["abstaende", "winkel"] },
  { id: "abitur", kap: "A", nr: "", titel: "Abitur-Training", frage: "Alles zusammen – auf Abiturniveau.", von: 59, bis: 60,
    werkzeuge: ["abstaende", "ebenevsebene", "geraden"] },
  { id: "rueckblick", kap: "A", nr: "", titel: "Rückblick · Alles auf einen Blick", frage: "Alle Formen, Verfahren und Formeln auf einer Seite.", von: 61, bis: 61, werkzeuge: [] },
  { id: "loes", kap: "L", nr: "", titel: "Lösungen", frage: "Alle Lösungen zum Nachschlagen und Vergleichen.", von: 62, bis: 68, werkzeuge: [] },
];

export const KAPITEL = { I: "Geraden und Gleichungssysteme", II: "Vektoren im Raum", III: "Geraden im Raum", IV: "Skalarprodukt und Kreuzprodukt", V: "Ebenen", VI: "Abstände, Winkel, Spiegelungen", A: "Abitur", L: "Anhang" };

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
const standLesen = () => { try { return { gelesen: {}, geuebt: {}, ...JSON.parse(localStorage.getItem(SPEICHER) || "{}") }; } catch (e) { return { gelesen: {}, geuebt: {} }; } };
const standSchreiben = (s) => { try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch (e) { /* egal */ } };
/* Solange das Heft fehlt, zählt nur das Üben (Module ohne Werkzeuge bleiben offen) */
const fertig = (m, s) => (BUCH_BEREIT ? !!s.gelesen[m.id] && (m.werkzeuge.length === 0 || !!s.geuebt[m.id]) : m.werkzeuge.length > 0 && !!s.geuebt[m.id]);

const nachOben = () => springe("vekkurs-modul", () => window.scrollTo({ top: 0, behavior: "auto" }));

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
export function VekKursKopf({ untertitel }) {
  return (
    <div style={{ background: `linear-gradient(160deg, ${K.schwarz} 0%, ${K.gold} 60%, #1A3E96 100%)`, color: K.weiss, position: "relative", overflow: "hidden" }}>
      <style>{`@media (max-width:640px){.vk-kopfbild{opacity:.28 !important}}`}</style>
      <svg className="vk-kopfbild" aria-hidden="true" viewBox="0 0 400 180" preserveAspectRatio="xMaxYMid slice" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "min(62%, 440px)", opacity: 0.7 }}>
        <path d="M150 150 L330 120 L380 30 L200 60 Z" fill="rgba(168,192,240,0.18)" stroke={K.baby} strokeWidth="1.5" />
        <path d="M120 165 L120 40 M120 165 L250 165 M120 165 L60 210" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <line x1="70" y1="40" x2="390" y2="150" stroke={K.weiss} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <line x1="225" y1="93" x2="268" y2="20" stroke={K.leucht} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M268 20 l-11 4 l6 7 z" fill={K.leucht} />
        <circle cx="225" cy="93" r="6.5" fill={K.leucht} />
      </svg>
      <div className="held mx-auto px-6 pt-10 pb-5" style={{ maxWidth: 620, position: "relative" }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.18em", color: K.leucht, marginBottom: 8 }}>KURS</p>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(26px, 7.4vw, 38px)", letterSpacing: "-0.03em", lineHeight: 1.08, color: K.weiss, margin: 0 }}>Vektoren, Geraden<br />und Ebenen</h1>
        <div style={{ width: 54, height: 4, background: K.leucht, borderRadius: 2, marginTop: 16, marginBottom: 14 }} />
        <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 15, fontWeight: 400, lineHeight: 1.6, margin: 0, maxWidth: 440 }}>{untertitel}</p>
      </div>
      <div style={{ height: 24, background: C.sand, borderRadius: "20px 20px 0 0", position: "relative" }} />
    </div>
  );
}

/* ---------- Übersicht ---------- */
function Uebersicht({ stand, oeffnen }) {
  const zahl = KURS_MODULE.filter((m) => fertig(m, stand)).length;
  const weiterMit = KURS_MODULE.find((m) => !fertig(m, stand)) || KURS_MODULE[0];
  const kapitel = ["I", "II", "III", "IV", "V", "VI", "A", "L"];
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
        {BUCH_BEREIT ? "Ein Modul gilt als geschafft, wenn du bis zur letzten Seite gelesen und mindestens ein Werkzeug benutzt hast." : "Das Heft entsteht gerade – die Werkzeuge kannst du schon jetzt in jedem Modul benutzen."}
      </p>

      {kapitel.map((k) => (
        <section key={k} style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 4px 10px" }}>
            {k !== "L" && k !== "A" && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: K.weiss, background: K.schwarz, padding: "4px 9px", borderRadius: 6 }}>KAPITEL {k}</span>}
            <h2 style={{ fontSize: 17, fontWeight: 700, color: K.schwarz, margin: 0 }}>{KAPITEL[k]}</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {KURS_MODULE.filter((m) => m.kap === k).map((m) => {
              const ok = fertig(m, stand);
              return (
                <button key={m.id} type="button" onClick={() => oeffnen(m.id)} className="vk-modul"
                  style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 14px", borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    background: K.weiss, border: `1px solid ${ok ? K.tief : C.linie}`, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 44, height: 44, borderRadius: 12,
                    background: m.nr ? K.baby : K.hell, color: K.schwarz, fontWeight: 800, fontSize: m.nr ? 18 : 13 }}>{m.nr || (m.id === "loes" ? "✓" : m.kap === "A" ? "A" : "T")}</span>
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
      <style>{`.vk-modul{transition:transform .15s ease, box-shadow .15s ease} @media (hover:hover){.vk-modul:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,26,51,0.10)}}`}</style>
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
  const zweiStart = React.useRef(zwei);
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

  const hoechste = zwei ? modul.bis - 1 : modul.bis;
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
  const anzeige = zwei
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
      <style>{`.vk-seite{width:100%;max-width:620px;margin:0 auto;padding:0 20px 64px 18px;box-sizing:border-box}
        @media (min-width:840px){.vk-seite{width:735px;max-width:735px;margin-left:calc(50% - 355px);margin-right:0;padding:0 0 64px}}`}</style>
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", color: K.gold, margin: "0 0 4px" }}>
              {modul.kap === "L" || modul.kap === "A" ? KAPITEL[modul.kap].toUpperCase() : `KAPITEL ${modul.kap} · MODUL ${i + 1} VON ${KURS_MODULE.length}`}
            </p>
            <h2 style={{ fontSize: "clamp(23px, 6.4vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, color: K.schwarz, margin: 0 }}>
              {modul.nr ? `${modul.nr} ` : ""}{modul.titel}
            </h2>
          </div>
          <div style={{ flex: "none", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
            {BUCH_BEREIT && seitenZahl > 1 && (
              <button type="button" onClick={umschalten} aria-pressed={zwei}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 10, border: `1px solid ${zwei ? K.gold : C.linie}`, background: zwei ? K.hell : K.weiss,
                  color: K.schwarz, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><rect x="3" y="4" width="8" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="13" y="4" width="8" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                {zwei ? "Eine Seite" : "Zwei Seiten"}
              </button>
            )}
            <button type="button" onClick={zurUebersicht}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px 8px 8px", borderRadius: 10, border: `1px solid ${C.linie}`, background: K.weiss,
                color: K.schwarz, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <span aria-hidden="true">←</span> Alle Module
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px 14px", flexWrap: "wrap", margin: "8px 0 14px" }}>
          <p style={{ flex: "1 1 240px", minWidth: 0, fontSize: 15.5, fontStyle: "italic", color: "#2B3A4F", margin: 0 }}>{modul.frage}</p>
          {BUCH_BEREIT && seitenZahl > 1 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flex: "none" }} role="group" aria-label="Buchseiten blättern">
              {pfeil(-1, nr <= 1)}
              <span aria-live="polite" style={{ fontSize: 13.5, fontWeight: 700, color: K.schwarz, minWidth: 74, textAlign: "center", whiteSpace: "nowrap" }}>{anzeige}</span>
              {pfeil(1, seite >= hoechste)}
            </div>
          )}
        </div>
      </div>

      {BUCH_BEREIT ? (
        <div style={{ background: "#fff", aspectRatio: zwei ? "1588 / 1123" : "794 / 1123", width: "100%" }}>
          <iframe key={modul.id} ref={rahmen} title={`Kapitel ${modul.titel} lesen`} src={`${BUCH}?von=${modul.von}&bis=${modul.bis}&voll=${zweiStart.current ? 2 : 1}`}
            style={{ display: "block", width: "100%", height: "100%", border: 0 }} />
        </div>
      ) : <BuchPlatzhalter modul={modul} />}

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
      <VekKursKopf untertitel={modul ? `${KURS_MODULE.length} Module · Kapitel lesen, dann trainieren` : "Vom Gleichungssystem bis zum Abstand windschiefer Geraden – jedes Kapitel lesen und direkt darunter trainieren."} />
      {modul
        ? <Modul key={modul.id} modul={modul} stand={stand} setStand={setStand} oeffnen={oeffnen} zurUebersicht={zurUebersicht} gehe={gehe} />
        : <Uebersicht stand={stand} oeffnen={oeffnen} />}
    </>
  );
}
function stand0() { return standLesen(); }
