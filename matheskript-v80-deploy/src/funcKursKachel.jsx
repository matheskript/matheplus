/* ============================================================
   Die vier Kurs-Kacheln der Startseite: Differentialrechnung, Vektoren/
   Geraden/Ebenen, GFS in Mathe, Mathe mit KI lernen.

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
import { diffStand, vekStand, gfsStand, kiStand } from "./kursStand.js";
import { PORZELLAN, TIEFBLAU, LACKSCHWARZ, NACHTBLAU } from "./kursFarben.js";
import { MotivTangente, MotivEbene, MotivBuehne, MotivDialog } from "./funcKursMotive.jsx";

/* ---------- Gemeinsame Kachel ---------- */
/* Die Stilregeln kommen einmal in den <head> (nicht in jede Kachel), bleiben also auch nach
   dem Hin- und Herwechseln zwischen Seiten erhalten. */
const STIL_ID = "kk-stil";
const STIL = `
      .kk{display:grid;grid-template-columns:minmax(0,1fr) 40%;grid-template-rows:auto 1fr;column-gap:6px;position:relative;isolation:isolate;overflow:hidden;
        width:100%;margin:14px 0 0;padding:18px 16px 16px;box-sizing:border-box;min-height:200px;
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
      .kk-meta{margin:0;font-size:12.5px;font-weight:700;line-height:1.35;color:var(--kk-akzent)}
      .kk-zeile{margin:8px 0 0;font-size:13.5px;font-weight:400;line-height:1.45;color:var(--kk-text)}
      .kk-balken{display:block;height:4px;border-radius:2px;margin:11px 0 0;background:var(--kk-spur);overflow:hidden;max-width:220px}
      .kk-balken i{display:block;height:100%;border-radius:2px;background:var(--kk-fuellung)}
      .kk-weiter{margin:7px 0 0;font-size:12.5px;line-height:1.4;color:var(--kk-text);opacity:.9}
      .kk-knopf{margin-top:auto;padding-top:16px;align-self:flex-start}
      .kk-knopf span{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px 0 20px;border-radius:999px;font-size:14px;font-weight:800;letter-spacing:-0.01em;white-space:nowrap;
        background:var(--kk-knopf);color:var(--kk-knopftext);box-shadow:0 8px 20px -8px var(--kk-knopfschatten),0 1px 0 rgba(255,255,255,0.35) inset}
      .kk-pfeil{transition:transform .18s ease}
      .kk-motiv{grid-column:2;grid-row:2;align-self:end;justify-self:end;width:calc(100% + 22px);height:auto;margin:4px -14px -16px 0;overflow:visible}
      /* Handy: Kopfzeile – der Titel liegt auf einem eigenen Streifen (--kk-kopf) über die volle Breite,
         darunter eine durchgezogene Folienlinie (--kk-linie); der Rest der Kachel ist der Lack. */
      @media (max-width:839px){
        .kk{background:var(--kk-koerper) padding-box,var(--kk-rand) border-box}
        .kk-titel{margin:-18px -16px 0;padding:15px 16px 16px;font-size:clamp(20px,5.6vw,26px);
          background:var(--kk-linie) bottom / 100% 3px no-repeat,var(--kk-kopf);
          box-shadow:0 1px 0 var(--kk-kante) inset}
        .kk-text{padding-top:12px}
        .kk-motiv{margin-top:10px}}
      @media (min-width:840px){.kk{grid-template-columns:minmax(0,1fr) 36%;padding:26px 30px 24px;min-height:220px;column-gap:16px}
        .kk-titel{font-size:31px;margin-bottom:4px}.kk-text{padding-top:8px}.kk-meta{font-size:13.5px}.kk-zeile{font-size:15.5px;line-height:1.5;max-width:40ch}
        .kk-motiv{width:calc(100% + 30px);max-width:258px;margin:0 -24px -26px 0}}
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
function KursKachel({ onClick, label, titel, meta, zeile, stand, einheit, farben, Motiv, id, daten }) {
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
        <p className="kk-meta">{begonnen ? `${stand.fertig} von ${stand.gesamt} ${einheit} geschafft` : meta}</p>
        {begonnen ? (
          <>
            <span className="kk-balken" role="progressbar" aria-valuemin={0} aria-valuemax={stand.gesamt} aria-valuenow={stand.fertig}><i style={{ width: `${anteil}%` }} /></span>
            {stand.weiter && <p className="kk-weiter">{stand.weiter}</p>}
          </>
        ) : <p className="kk-zeile">{zeile}</p>}
        <span className="kk-knopf"><span>{begonnen ? "Weitermachen" : "Kurs öffnen"}<Pfeil farbe={farben.knopftext} /></span></span>
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
    <KursKachel onClick={onClick} id="kk-diff" label="Kurs Differentialrechnung öffnen" titel="Differentialrechnung" farben={PORZELLAN} Motiv={MotivTangente}
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
    <KursKachel onClick={onClick} id="kk-gfs" label="Kurs GFS öffnen" titel="GFS in Mathe" farben={LACKSCHWARZ} Motiv={MotivBuehne}
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
