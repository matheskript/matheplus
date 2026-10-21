/* ======================================================================
   KURSE (/kurse, ansicht "kursliste") – alle Kurse auf einer Seite (seit 21.10. abends).
   Oben die großen Lack-Kacheln der Kurse mit Modulstand (funcKursKachel.jsx), darunter alle Kurse und die
   weiteren Lernangebote (KURSE + WEITERE_ANGEBOTE in hauptmenue.js) als kompakte Karten – dieselbe Liste wie ☰ „Kurse“ und der
   Block „Kurse“ der Startseite (dort nur die ersten sechs). Browser: tests/ui/startseite-bloecke.ui.py.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { SeitenKopf } from "./funcWerkzeugSeite.jsx";
import { DiffKursKachel, VekKursKachel, GeoKursKachel, GfsKursKachel, ClaudeKursKachel, UnterstufeKachel, AbiZentrumKachel } from "./funcKursKachel.jsx";
import { START_CSS, KursRaster } from "./funcStartseite.jsx";
import { KURSE, WEITERE_ANGEBOTE } from "./hauptmenue.js";

export function KurseSeite({ gehe }) {
  return (
    <div data-kurse-seite>
      <SeitenKopf titel="Kurse" groesse="clamp(26px, 7.6vw, 34px)" rund>
        <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.65 }}>Jeder Kurs ein Baustein, zusammen ein System – {KURSE.length} Kurse und {WEITERE_ANGEBOTE.length} weitere Lernangebote, jedes für sich nutzbar.</p>
      </SeitenKopf>
      <div className="sbb" data-modus="hell" style={{ background: C.sand }}>
        <style>{START_CSS}</style>
        <section className="sbb-teil ende"><div className="sbb-spalte" style={{ paddingTop: 8 }}>
          <div className="sbb-wieder" data-kurse-gross>
            <AbiZentrumKachel onClick={() => gehe({ ansicht: "abi" })} />
            <UnterstufeKachel onClick={() => gehe({ ansicht: "unterstufe" })} />
            <GeoKursKachel onClick={() => gehe({ ansicht: "geokurs" })} />
            <DiffKursKachel onClick={() => gehe({ ansicht: "diffkurs" })} />
            <VekKursKachel onClick={() => gehe({ ansicht: "vekkurs" })} />
            <GfsKursKachel onClick={() => gehe({ ansicht: "gfs" })} />
            <ClaudeKursKachel kurs="ki" onClick={() => gehe({ ansicht: "kiwahl" })} />
          </div>
          <h2 style={{ margin: "34px 0 12px", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: C.seeTief }}>Alle Kurse und weitere Lernangebote</h2>
          <KursRaster gehe={gehe} alle />
        </div></section>
      </div>
    </div>
  );
}
