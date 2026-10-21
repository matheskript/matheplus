/* ============================================================
   Die vier Kurs-Kacheln der Startseite: Differentialrechnung, Vektoren/
   Geraden/Ebenen, GFS-Training, Mathe mit KI lernen.

   Gestaltung „Lack und Goldfolie“: jede Kachel ist eine tief lackierte Fläche
   in den Farben ihres Kurses, mit einem Motiv in Folienoptik (Verlauf mit
   Lichtkante, weicher Schein dahinter), die Überschrift läuft über die ganze
   Breite. Differentialrechnung ist die helle Porzellan-Kachel (Babyblau,
   Schwarz, sehr dunkles Gold), die drei anderen sind dunkel.

   Hat jemand den Kurs begonnen, zeigt die Kachel seinen Stand (kursStand.js):
   schmaler Balken, „3 von 21 Modulen“ und womit es weitergeht.

   Eigene kleine Datei, damit die Startseite keinen Kurs mitladen muss.
   Die Kursseiten selbst (Kopf, Fortschritt, Modulliste) liegen in funcKursKopf.jsx.
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { diffStand, vekStand, gfsStand, kiStand, unterStand } from "./kursStand.js";
import { SMARAGD, TIEFBLAU, LACKSCHWARZ, NACHTBLAU, GRANAT, GOLDLACK } from "./kursFarben.js";
import { MotivTangente, MotivEbene, MotivBuehne, MotivDialog, MotivGeodreieck, MotivAbi } from "./funcKursMotive.jsx";
import { LERN } from "./base3.jsx";
import { abiNormieren, zielTermin, countdown } from "./abiZentrum.js";
import { UNTERSTUFE_ZAHLEN } from "./unterstufeDaten.js";

/* ---------- Gemeinsame Kachel ---------- */
/* Die Stilregeln kommen einmal in den <head> (nicht in jede Kachel), bleiben also auch nach
   dem Hin- und Herwechseln zwischen Seiten erhalten. */
const STIL_ID = "kk-stil";
const STIL = `
      .kk{display:grid;grid-template-columns:minmax(0,1fr) 40%;grid-template-rows:auto 1fr;column-gap:6px;position:relative;isolation:isolate;overflow:hidden;
        width:100%;margin:14px 0 0;padding:16px 16px 14px;box-sizing:border-box;
        border:1px solid transparent;border-radius:24px;text-align:left;font-family:inherit;cursor:pointer;color:var(--kk-text);
        background:var(--kk-lack) padding-box,var(--kk-rand) border-box;
        box-shadow:0 1px 0 var(--kk-kante) inset,0 22px 44px -18px var(--kk-schatten),0 2px 6px rgba(8,14,32,0.14);
        transition:transform .18s ease,box-shadow .18s ease}
      .kk::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
        background:linear-gradient(118deg,var(--kk-glanz) 0%,transparent 42%),radial-gradient(70% 90% at 92% 100%,var(--kk-schein) 0%,transparent 62%)}
      .kk > *{position:relative;z-index:1}
      .kk:active{transform:scale(0.99)}
      @media (hover:hover){.kk:hover{transform:translateY(-3px);box-shadow:0 1px 0 var(--kk-kante) inset,0 30px 54px -18px var(--kk-schatten),0 4px 10px rgba(8,14,32,0.16)}
        .kk:hover .kk-pfeil{transform:translateX(3px)}}
      .kk:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
      .kk-titel{grid-column:1 / -1;margin:0 0 2px;font-size:clamp(22px,6.3vw,26px);font-weight:800;letter-spacing:-0.035em;line-height:1.08;text-wrap:balance;color:var(--kk-titel)}
      .kk-text{grid-column:1;grid-row:2;min-width:0;display:flex;flex-direction:column;padding-top:6px}
      /* Unter dem Titel: goldener Strich, genau zwei Zeilen Text, direkt darunter Knopf und rechts daneben der Stand */
      .kk-strich{display:block;width:40px;height:3px;border-radius:2px;background:linear-gradient(90deg,#C9931A 0%,${C.flaggold} 100%)}
      .kk-zeile{margin:10px 0 0;font-size:13.5px;font-weight:400;line-height:1.45;color:var(--kk-text);
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:calc(2 * 1.45em)}
      .kk-fuss{display:flex;align-items:center;flex-wrap:wrap;gap:8px 14px;margin-top:12px}
      .kk-meta{margin:0;font-size:12px;font-weight:700;line-height:1.3;color:var(--kk-akzent)}
      .kk-stand{display:flex;flex-direction:column;gap:5px;min-width:0}
      .kk-balken{display:block;height:3px;border-radius:2px;background:var(--kk-spur);overflow:hidden;width:120px;max-width:100%}
      .kk-balken i{display:block;height:100%;border-radius:2px;background:var(--kk-fuellung)}
      .kk-knopf{flex:none}
      .kk-knopf span{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 15px 0 17px;border-radius:999px;font-size:14px;font-weight:800;letter-spacing:-0.01em;white-space:nowrap;
        background:var(--kk-knopf);color:var(--kk-knopftext);box-shadow:0 8px 20px -8px var(--kk-knopfschatten),0 1px 0 rgba(255,255,255,0.35) inset}
      .kk-pfeil{transition:transform .18s ease}
      .kk-motiv{grid-column:2;grid-row:2;align-self:end;justify-self:end;width:calc(100% + 22px);height:auto;margin:4px -14px -14px 0;overflow:visible}
      /* Handy: Kopfzeile – der Titel liegt auf einem eigenen Streifen (--kk-kopf) über die volle Breite,
         darunter eine durchgezogene Folienlinie (--kk-linie); der Rest der Kachel ist der Lack. */
      @media (max-width:839px){
        .kk{background:var(--kk-koerper) padding-box,var(--kk-rand) border-box}
        .kk-titel{margin:-18px -16px 0;padding:15px 16px 16px;font-size:clamp(20px,5.6vw,26px);
          background:var(--kk-linie) bottom / 100% 3px no-repeat,var(--kk-kopf);
          box-shadow:0 1px 0 var(--kk-kante) inset}
        .kk-text{padding-top:12px}
        .kk-strich{display:none}
        .kk-zeile{margin-top:0}
        .kk-motiv{margin-top:10px}}
      @media (min-width:840px){.kk{grid-template-columns:minmax(0,1fr) 34%;padding:20px 30px 20px;column-gap:16px}
        .kk-titel{font-size:29px;margin-bottom:0}.kk-text{padding-top:10px}.kk-meta{font-size:12.5px}.kk-zeile{font-size:15px;line-height:1.45;max-width:46ch}
        .kk-titel{max-width:66%}
        /* Motiv liegt frei rechts unten und bestimmt die Höhe der Kachel nicht mehr */
        .kk > .kk-motiv{position:absolute;grid-column:auto;grid-row:auto;right:4px;bottom:0;width:min(31%,236px);height:auto;margin:0;z-index:0}}
      /* Abi-Kachel: Siegel oben neben dem Text statt unten in der Ecke */
      .kk[data-abi-kachel] .kk-motiv{align-self:start;margin-top:-4px;margin-bottom:0}
      @media (min-width:840px){.kk[data-abi-kachel] > .kk-motiv{top:14px;bottom:auto}}
      @media (prefers-reduced-motion:reduce){.kk,.kk-pfeil{transition:none}.kk:hover{transform:none}}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style");
  el.id = STIL_ID;
  el.textContent = STIL;
  document.head.appendChild(el);
}

function Pfeil({ farbe }) {
  return (
    <svg className="kk-pfeil" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={farbe} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

/* farben: lack = Hintergrund, rand = Folienkante, glanz = Lichtkante oben links, schein = Schein unten rechts,
   titel/text/akzent = Schrift, knopf/knopftext = Pille, spur/fuellung = Fortschrittsbalken,
   kopf/linie = Kopfzeile auf dem Handy (Streifen hinter dem Titel, Linie darunter),
   koerper = Fläche darunter auf dem Handy (fehlt sie, gilt lack) */
function KursKachel({ onClick, label, titel, meta, zeile, stand, einheit, farben, Motiv, id, daten, knopf }) {
  const begonnen = stand && stand.fertig > 0;
  const anteil = begonnen ? Math.min(100, Math.round((stand.fertig / stand.gesamt) * 100)) : 0;
  const vars = {
    "--kk-lack": farben.lack, "--kk-rand": farben.rand, "--kk-glanz": farben.glanz, "--kk-schein": farben.schein, "--kk-kante": farben.kante,
    "--kk-schatten": farben.schatten, "--kk-titel": farben.titel, "--kk-text": farben.text, "--kk-akzent": farben.akzent,
    "--kk-kopf": farben.kopf, "--kk-linie": farben.linie, "--kk-koerper": farben.koerper || farben.lack,
    "--kk-knopf": farben.knopf, "--kk-knopftext": farben.knopftext, "--kk-knopfschatten": farben.knopfschatten, "--kk-spur": farben.spur, "--kk-fuellung": farben.fuellung,
  };
  React.useInsertionEffect(stilSetzen, []);
  return (
    <button type="button" onClick={onClick} className="kk" aria-label={label} style={vars} {...daten}>
      <h2 className="kk-titel">{titel}</h2>
      <div className="kk-text">
        <span className="kk-strich" aria-hidden="true" />
        <p className="kk-zeile">{zeile}</p>
        <span className="kk-fuss">
          <span className="kk-knopf"><span>{knopf || (begonnen ? "Weitermachen" : "Kurs öffnen")}<Pfeil farbe={farben.knopftext} /></span></span>
          <span className="kk-stand" title={begonnen && stand.weiter ? stand.weiter : undefined}>
            {(begonnen || meta) && <span className="kk-meta">{begonnen ? `${stand.fertig} von ${stand.gesamt} ${einheit} geschafft` : meta}</span>}
            {begonnen && <span className="kk-balken" role="progressbar" aria-valuemin={0} aria-valuemax={stand.gesamt} aria-valuenow={stand.fertig}><i style={{ width: `${anteil}%` }} /></span>}
          </span>
        </span>
      </div>
      <Motiv id={id} />
    </button>
  );
}

const sicher = (f) => { try { return f(); } catch (e) { return null; } };

/* ---------- Die vier Kurse ---------- */
/* module = Zahl der Module in KURS_MODULE (diffKursDaten.js) */
export function DiffKursKachel({ onClick, module = 21 }) {
  const stand = sicher(diffStand);
  return (
    <KursKachel onClick={onClick} id="kk-diff" label="Kurs Differentialrechnung öffnen" titel="Differentialrechnung" farben={SMARAGD} Motiv={MotivTangente}
      meta={`${(stand && stand.gesamt) || module} Module im Schulbuch`}
      zeile="Jedes Kapitel lesen – und direkt darunter trainieren." stand={stand} einheit="Modulen" />
  );
}

/* module = Zahl der Module in KURS_MODULE (vekKursDaten.js) */
export function VekKursKachel({ onClick, module = 31 }) {
  const stand = sicher(vekStand);
  return (
    <KursKachel onClick={onClick} id="kk-vek" label="Kurs Vektoren, Geraden und Ebenen öffnen" titel="Vektoren, Geraden & Ebenen" farben={TIEFBLAU} Motiv={MotivEbene}
      meta={`${(stand && stand.gesamt) || module} Module im Heft`}
      zeile="Vom Gleichungssystem bis zum Abitur: lesen, dann trainieren." stand={stand} einheit="Modulen" />
  );
}

export function GfsKursKachel({ onClick }) {
  const stand = sicher(gfsStand);
  return (
    <KursKachel onClick={onClick} id="kk-gfs" label="GFS-Training öffnen" titel="GFS-Training" farben={LACKSCHWARZ} Motiv={MotivBuehne}
      meta="7 Schritte zum Vortrag"
      zeile="Dein Thema aus dem Lambacher Schweizer – verstehen, vortragen, Fragen meistern." stand={stand} einheit="Schritten" />
  );
}

/* kurs="ki" ist die Wahlseite (Mathilda AI, Gemini ab 16, Claude ab 18) */
export function ClaudeKursKachel({ onClick, kurs = "ki" }) {
  const stand = sicher(kiStand);
  return (
    <KursKachel onClick={onClick} id="kk-ki" label="Mathe mit KI lernen öffnen" titel="Mathe mit KI lernen" farben={NACHTBLAU} Motiv={MotivDialog}
      meta="Drei Wege nach Alter"
      zeile="Mathilda AI für alle, Gemini ab 16, Claude ab 18 – die KI erklärt, du rechnest." stand={stand} einheit="Lektionen"
      daten={{ "data-claudekurs-kachel": kurs }} />
  );
}

/* Unterstufe: Klasse 5 und 6 – Granat mit Gold, das Geodreieck als Motiv */
export function UnterstufeKachel({ onClick }) {
  const stand = sicher(unterStand);
  return (
    <KursKachel onClick={onClick} id="kk-unter" label="Modul Unterstufe öffnen" titel="Unterstufe: Klasse 5 und 6" farben={GRANAT} Motiv={MotivGeodreieck}
      meta={`${UNTERSTUFE_ZAHLEN.kapitel} Kapitel, ${UNTERSTUFE_ZAHLEN.einheiten} Lerneinheiten`}
      zeile="Der ganze Stoff: lesen, Beispiel, Merksatz – und gleich üben, mit Kopfrechnen." stand={stand} einheit="Lerneinheiten"
      daten={{ "data-unterstufe-kachel": "" }} />
  );
}

/* Abi-Zentrum: Goldlack mit Siegel; mit Abi-Profil zählt die Kachel die Tage bis zur Prüfung */
export function AbiZentrumKachel({ onClick }) {
  const [, neu] = React.useState(0);   // Lernstand lädt nach: Kachel hört mit (wie useLern, ohne func6 zu laden)
  React.useEffect(() => { const h = () => neu((z) => z + 1); LERN.hoerer.add(h); return () => LERN.hoerer.delete(h); }, []);
  const abi = sicher(() => abiNormieren(LERN.training && LERN.training.abi));
  const ziel = abi && abi.profil ? sicher(() => zielTermin(abi.profil)) : null;
  const cd = ziel ? countdown(ziel) : null;
  const meta = cd && !cd.vorbei ? (cd.heute ? "Heute ist Prüfung – viel Erfolg" : `Noch ${cd.tage} ${cd.tage === 1 ? "Tag" : "Tage"} bis zur Prüfung`) : null;
  return (
    <KursKachel onClick={onClick} id="kk-abi" label="Mathe-Abi-Masterclass öffnen" titel="Mathe-Abi-Masterclass" farben={GOLDLACK} Motiv={MotivAbi}
      meta={meta} knopf={abi && abi.profil ? "Weiter" : "Abi-Kurs starten"}
      zeile="Dein Abi-Plan, Prüfungsaufgaben und Mia als Trainerin." daten={{ "data-abi-kachel": "" }} />
  );
}
