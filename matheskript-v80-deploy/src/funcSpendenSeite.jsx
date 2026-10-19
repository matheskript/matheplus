import React from "react";
import { C } from "./base1.jsx";
import { SeitenKopf, KopfText } from "./funcWerkzeugSeite.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { SpendenKarte } from "./funcSpenden.jsx";
import { karte, Kicker } from "./funcKontoRollen.jsx";

/* ======================================================================
   /spenden – „Donate“: Dank, Wofür, Betrag wählen (SpendenKarte), Hinweise.
   Zahlungswege und Beträge: spenden.js. Einziger Zahlungseingang der Seite.
   ====================================================================== */

const NAVY = "#0B1E4A";
const text = { fontSize: 14.5, color: C.grau, fontWeight: 300, lineHeight: 1.65 };

function Punkt({ nr, titel, children }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: C.flaggold, color: NAVY, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{nr}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.weiss }}>{titel}</span>
        <span style={{ display: "block", fontSize: 14, fontWeight: 300, color: "#C9D6EE", lineHeight: 1.6, marginTop: 2 }}>{children}</span>
      </span>
    </div>
  );
}

export function SpendenSeite({ gehe }) {
  return (
    <>
      <SeitenKopf titel="Donate" groesse="clamp(30px, 9vw, 40px)" rund>
        <KopfText>Hilf mit, die KI-Kosten von Mythos Mathe zu tragen.</KopfText>
      </SeitenKopf>

      <div className="mx-auto px-5 pb-12" style={{ maxWidth: 620, background: C.sand }}>
        <div style={{ ...karte, padding: 18, marginBottom: 14 }}>
          <Kicker>VIELEN DANK</Kicker>
          <p style={{ fontSize: 19, fontWeight: 800, color: C.tinte, lineHeight: 1.3, marginBottom: 8 }}>Danke, dass du Mythos Mathe unterstützt.</p>
          <p style={text}>
            Diese Seite soll Mathe für Schüler leichter machen, und vieles davon ist kostenlos. Damit das so bleiben kann, braucht es Geld für die KI dahinter. Wenn du magst, trägst du freiwillig einen Teil davon.
          </p>
        </div>

        <div style={{ ...karte, padding: 18, marginBottom: 14, background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.weiss }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.flaggold, marginBottom: 6 }}>WOFÜR WIR DAS GELD NUTZEN</p>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Dein Beitrag geht in genau diese Dinge:</p>
          <Punkt nr="1" titel={<>KI-Credits für <MathildaName dunkel /></>}>
            Jede Frage an Mathilda, jedes gescannte Blatt und jede übersetzte Textaufgabe läuft über die Schnittstelle von Anthropic. Dafür kaufen wir laufend Guthaben.
          </Punkt>
          <Punkt nr="2" titel="Claude für die Entwicklung">
            Ich baue und verbessere die Seite mit Claude. Dafür bezahle ich das Abo, bald in der Max-Stufe, damit neue Werkzeuge schneller fertig werden.
          </Punkt>
          <Punkt nr="3" titel="Weiterentwickeln">
            Neue Werkzeuge, mehr Aufgaben, mehr Erklärungen. Alles, was du in der App siehst, ist so entstanden und wächst weiter.
          </Punkt>
        </div>

        <SpendenKarte />

        <div style={{ ...karte, padding: 18, marginBottom: 14, border: `1.5px solid ${C.flaggold}`, background: "#FFFBEA" }}>
          <Kicker>OHNE GEGENLEISTUNG</Kicker>
          <p style={{ ...text, color: C.tinte }}>
            Für eine Spende gibt es nichts zurück: kein Pro, kein größeres Kontingent, keinen Vorteil. Sie ist ein Dankeschön, nicht mehr und nicht weniger. Mythos Mathe bleibt für alle gleich nutzbar, ob du etwas gibst oder nicht.
          </p>
        </div>

        <button type="button" onClick={() => gehe({ ansicht: "start" })}
          style={{ display: "block", margin: "6px auto 0", background: "none", border: "none", color: C.see, textDecoration: "underline", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>
          Zurück zur Startseite
        </button>
      </div>
    </>
  );
}
