/* ======================================================================
   HUBS „Geraden“ und „Ebenen“ (22.10.2026) – ein Reiter im Vektoren-Band, mehrere Übungen
   Vorbild ist „Rechnen mit Vektoren“ (func20.jsx): links das Menü der Übungen (Kacheln
   untereinander), rechts die gewählte Übung. Die Übungen selbst sind die bestehenden
   Werkzeuge (Zwei Punkte, Geraden im Raum, Drei Punkte, Ebenen im Raum) – sie werden
   im Schmal-Kontext gezeichnet (arbeitsflaeche.jsx: useDesktop() → false), also in ihrem
   Handy-Zweig, der für 360–620 px gebaut ist und in die rechte Spalte (≈ 580 px) passt.
   Am Handy steht das Menü als Kachelreihe über der Übung.

   Ein Segment = { id, ansicht, modus?, name, kurz?, bild }. Segmente mit derselben Ansicht
   (Punktprobe · Gerade – Gerade · Gerade – Ebene → „geraden“) unterscheiden sich im modus,
   den das Werkzeug als Prop bekommt. Ein Wechsel der Ansicht läuft über gehe() – die Seite
   wird neu aufgebaut (ChunkGrenze key=ansicht in funcWerkzeugSeite), der gewünschte Modus
   wird deshalb kurz zwischengemerkt (gewuenscht).
   ====================================================================== */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { FeinKarte, SchmalKontext, useDesktop } from "./arbeitsflaeche.jsx";
import { lazyLaden, ChunkGrenze } from "./chunkSchutz.jsx";
import { FallWahl, ModusReiter, VekArbeit, VekSeite } from "./vekUi.jsx";

const ZweiPunkteGerade = lazyLaden(() => import("./func23.jsx").then((m) => ({ default: m.ZweiPunkteGerade })));
const DreiPunkteEbene = lazyLaden(() => import("./func23.jsx").then((m) => ({ default: m.DreiPunkteEbene })));
const GeradenImRaum = lazyLaden(() => import("./funcGeraden.jsx").then((m) => ({ default: m.GeradenImRaum })));
const EbenenVisualizer = lazyLaden(() => import("./func16.jsx").then((m) => ({ default: m.EbenenVisualizer })));

export const VEK_HUBS = {
  geraden: {
    titel: "Geraden",
    text: "Von zwei Punkten zur Geradengleichung – dann prüfen, ob ein Punkt auf der Geraden liegt, und wie zwei Geraden oder Gerade und Ebene zueinander liegen.",
    segmente: [
      { id: "zweipunkte", ansicht: "zweipunkte", name: "Zwei Punkte → Gerade", kurz: "Zwei Punkte", bild: "zweipunkte" },
      { id: "probe", ansicht: "geraden", modus: "probe", name: "Punktprobe", bild: "auf" },
      { id: "gg", ansicht: "geraden", modus: "gg", name: "Gerade – Gerade", bild: "schneidend" },
      { id: "ge", ansicht: "geraden", modus: "ge", name: "Gerade – Ebene", bild: "ge-schneidend" },
    ],
    weiter: [["winkel", "Winkel zwischen Vektoren", "vektorwinkel"], ["abstaende", "Abstand zu einer Geraden", "lot"]],
  },
  ebenen: {
    titel: "Ebenen",
    text: "Von drei Punkten zur Ebene in Parameter- und Koordinatenform – und die Koordinatenform im Raum drehen, bis du siehst, was a, b, c und d bewirken.",
    segmente: [
      { id: "dreipunkte", ansicht: "dreipunkte", name: "Drei Punkte → Ebene", kurz: "Drei Punkte", bild: "dreipunkte" },
      { id: "raum", ansicht: "ebenen", name: "Ebenen im Raum", bild: "ebene" },
    ],
    weiter: [["ebenevsebene", "Zwei Ebenen", "ee-schnitt"], ["hesse", "Normalenform und Hesse", "normale"], ["abstaende", "Abstand zu einer Ebene", "abstand"]],
  },
};

/* Hub, zu dem eine Ansicht gehört (für funcWerkzeugSeite) */
export const hubZu = (ansicht) => Object.keys(VEK_HUBS).find((id) => VEK_HUBS[id].segmente.some((s) => s.ansicht === ansicht)) || null;

let gewuenscht = null;   // { ansicht, modus } – für den Wechsel der Ansicht innerhalb des Hubs

function Laden() {
  return <p role="status" style={{ color: C.grau, fontSize: 15, fontWeight: 300, padding: 24, textAlign: "center" }}>Wird geladen …</p>;
}

function Uebung({ segment, gehe }) {
  switch (segment.ansicht) {
    case "zweipunkte": return <ZweiPunkteGerade gehe={gehe} />;
    case "geraden": return <GeradenImRaum modus={segment.modus} />;
    case "dreipunkte": return <DreiPunkteEbene gehe={gehe} />;
    case "ebenen": return <EbenenVisualizer gehe={gehe} />;
    default: return null;
  }
}

export function VekHub({ hubId, ansicht, gehe }) {
  const hub = VEK_HUBS[hubId];
  const passend = hub.segmente.filter((s) => s.ansicht === ansicht);
  /* Der gewünschte Modus wird hier nur gelesen und erst nach dem Einbau verbraucht: React darf eine
     unterbrochene Darstellung (Suspense) verwerfen und neu beginnen – ein Verbrauch im Initialisierer ginge dann verloren. */
  const [modus, setModus] = useState(() => (gewuenscht && gewuenscht.ansicht === ansicht ? gewuenscht.modus : null) || (passend[0] && passend[0].modus) || null);
  useEffect(() => { if (gewuenscht && gewuenscht.ansicht === ansicht) gewuenscht = null; }, [ansicht]);
  const aktiv = passend.find((s) => !s.modus || s.modus === modus) || passend[0] || hub.segmente[0];
  const waehle = (id) => {
    const s = hub.segmente.find((x) => x.id === id);
    if (!s || s.id === aktiv.id) return;
    if (s.ansicht === ansicht) { setModus(s.modus || null); return; }
    gewuenscht = { ansicht: s.ansicht, modus: s.modus || null };
    if (gehe) gehe({ ansicht: s.ansicht });
  };
  const desktop = useDesktop();
  const modi = hub.segmente.map((s) => ({ id: s.id, name: desktop ? s.name : (s.kurz || s.name), bild: s.bild }));
  const weiter = (
    <FallWahl titel="Weiter" wert={null} setWert={(ziel) => gehe && gehe({ ansicht: ziel })}
      optionen={hub.weiter} />
  );
  const inhalt = (
    <SchmalKontext.Provider value={true}>
      <ChunkGrenze key={aktiv.id}>
        <React.Suspense fallback={<Laden />}>
          <div data-vek-hub-uebung={aktiv.id}>
            <Uebung segment={aktiv} gehe={gehe} />
          </div>
        </React.Suspense>
      </ChunkGrenze>
    </SchmalKontext.Provider>
  );

  if (desktop) {
    return (
      <VekSeite titel={hub.titel} text={hub.text}>
        <div data-vek-hub={hubId}>
          <VekArbeit
            links={<>
              <div data-vek-hub-menue=""><ModusReiter label={`${hub.titel}: Übung wählen`} wert={aktiv.id} setWert={waehle} stapel modi={modi} /></div>
              <FeinKarte>{weiter}</FeinKarte>
            </>}
            rechts={inhalt} />
        </div>
      </VekSeite>
    );
  }

  return (
    <VekSeite titel={hub.titel} text={hub.text}>
      <div data-vek-hub={hubId}>
        <div data-vek-hub-menue="">
          <ModusReiter label={`${hub.titel}: Übung wählen`} wert={aktiv.id} setWert={waehle} modi={modi} spalten={modi.length > 3 ? 2 : modi.length} />
        </div>
        {inhalt}
        <div style={{ marginTop: 22 }}>{weiter}</div>
      </div>
    </VekSeite>
  );
}

export const GeradenHub = (p) => <VekHub {...p} hubId="geraden" />;
export const EbenenHub = (p) => <VekHub {...p} hubId="ebenen" />;
